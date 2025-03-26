import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { D1QB } from "workers-qb";
import { marked } from "marked"; // **** IMPORT MARKED ****
import type { Env, Variables } from "./bindings";
import {
	Layout,
	ArticleList,
	CreateArticle,
	ArticleDetails,
	ValidationErrorDisplay,
	RateLimitErrorDisplay,
} from "./layout/templates";
import type { ArticleType, ArticleTypeDB, Source } from "./types";
import { articleSchema } from "./validation";
import { generateText } from "ai";
import { getSearch } from "./utils";
import { OPTIMIZE_TOPIC_PROMPT } from "./prompts";

// Import the workflow
export { ArticleWorkflow } from "./workflows";

export const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to set user
app.use("*", async (c, next) => {
	if (!c.get("user")) c.set("user", "unknown");
	await next();
});

// --- Routes ---

// GET / - List Articles
app.get("/", async (c) => {
	const qb = new D1QB(c.env.DB);
	const articlesResult = await qb
		.select<ArticleTypeDB>("articles")
		.orderBy("created_at desc")
		.limit(50)
		.all();

	const articlesProps = {
		results: articlesResult?.results ?? [],
	};

	if (!Array.isArray(articlesProps.results)) {
		console.error("[Index] D1 query result format unexpected. Expected .results to be an array.", articlesResult);
		articlesProps.results = [];
	}

	return c.html(
		<Layout user={c.get("user")} title="Generated Articles">
			<ArticleList articles={articlesProps} />
		</Layout>,
	);
});

// GET /create - Show Article Creation Form
app.get("/create", async (c) => {
	return c.html(
		<Layout user={c.get("user")} title="Create New Article">
			<CreateArticle />
		</Layout>,
	);
});

// POST /create - Handle Article Creation with IP-based Rate Limiting
app.post("/create", async (c) => {
	// Get client IP for rate limiting
	const clientIP = c.req.header('cf-connecting-ip') ||
		c.req.header('x-forwarded-for') ||
		c.req.header('x-real-ip') ||
		'unknown';

	// Log which IP we're using for rate limiting
	console.log(`[Rate Limit] Using IP for article creation: ${clientIP}`);

	// Apply rate limiting based only on IP
	const rateLimitResult = await c.env.ARTICLE_RATE_LIMITER.limit({ key: clientIP });
	if (!rateLimitResult.success) {
		console.log(`[Rate Limit] Rate limit exceeded for article creation by IP: ${clientIP}`);
		return c.html(
			<Layout user={c.get("user")} title="Create New Article - Rate Limited">
				<div className="container mx-auto max-w-3xl px-4">
					<RateLimitErrorDisplay message="You've reached the article creation limit. Please try again in a minute." />
					<CreateArticle formData={{ topic: "" }} />
				</div>
			</Layout>,
			429
		);
	}

	const form = await c.req.formData();
	const topic = form.get("topic") as string;

	const validationResult = articleSchema.safeParse({ topic });

	if (!validationResult.success) {
		const errorMessages = validationResult.error.errors.map(
			(err) => `${err.path.join('.')}: ${err.message}`
		);
		console.log("Validation failed:", errorMessages);
		return c.html(
			<Layout user={c.get("user")} title="Create New Article - Error">
				<div className="container mx-auto max-w-3xl px-4">
					<ValidationErrorDisplay errors={errorMessages} />
					<CreateArticle formData={{ topic }} />
				</div>
			</Layout>,
			400
		);
	}

	const validatedData = validationResult.data;
	const id = crypto.randomUUID();
	const userId = c.get("user");

	const articleData: ArticleType = {
		id,
		topic: validatedData.topic,
		status: 1,
		user: userId,
	};

	const articleDataDB: Omit<ArticleTypeDB, 'created_at'> = {
		id: articleData.id,
		topic: articleData.topic,
		status: articleData.status,
		user: articleData.user,
		content: null,
		sources: null,
	};

	// --- Start Workflow ---
	try {
		console.log(`[Index] Attempting to create workflow for article ID: ${id}`);
		await c.env.ARTICLE_WORKFLOW.create({
			id,
			params: articleData,
		});
		console.log(`[Index] Workflow creation initiated for article ID: ${id}`);
	} catch (error) {
		console.error(`[Index] *** FATAL ERROR creating workflow for article ID ${id}:`, error);
		throw new HTTPException(500, { message: `Failed to start article generation workflow. Binding found: ${!!c.env.ARTICLE_WORKFLOW}. Error: ${error instanceof Error ? error.message : String(error)}` });
	}

	// --- Insert into D1 ---
	try {
		console.log(`[Index] Attempting to insert article ID: ${id} into D1 with data:`, JSON.stringify(articleDataDB));
		const qb = new D1QB(c.env.DB);
		const insertResult = await qb
			.insert({
				tableName: "articles",
				data: articleDataDB,
			})
			.execute();
		console.log(`[Index] D1 insert successful for article ID: ${id}`, JSON.stringify(insertResult));
	} catch (error) {
		console.error(`[Index] *** FATAL ERROR inserting article ID ${id} into D1:`, error);
		console.error(`[Index] Data attempted to insert:`, JSON.stringify(articleDataDB));
		let errorMessage = `Failed to save initial article record to database. Binding found: ${!!c.env.DB}.`;
		if (error instanceof Error) {
			errorMessage += ` Error: ${error.message}`;
		} else {
			errorMessage += ` Error: ${String(error)}`;
		}
		throw new HTTPException(500, { message: errorMessage });
	}

	console.log(`[Index] Redirecting to /details/${id}`);
	return c.redirect(`/details/${id}`);
});


// GET /details/:id - Show Article Details (Use marked)
app.get("/details/:id", async (c) => {
	const id = c.req.param("id");
	const qb = new D1QB(c.env.DB);
	const resp = await qb
		.fetchOne<ArticleTypeDB>({
			tableName: "articles",
			where: {
				conditions: ["id = ?"],
				params: [id],
			},
		})
		.execute();

	if (!resp.results) {
		throw new HTTPException(404, { message: "Article not found" });
	}

	let sourcesArray: Source[] = [];
	if (resp.results.sources != null) {
		try {
			sourcesArray = JSON.parse(resp.results.sources);
			if (!Array.isArray(sourcesArray)) {
				console.warn(`[Details ${id}] Parsed sources is not an array, resetting.`);
				sourcesArray = [];
			}
		} catch (e) {
			console.error(`[Details ${id}] Failed to parse sources JSON from DB:`, e);
			sourcesArray = [];
		}
	}

	// Parse Markdown content from DB to HTML string
	let articleHtml = '';
	const rawContent = resp.results.content; // Get raw markdown

	if (rawContent) {
		try {
			// Using await marked.parse() - This aligns with the original pattern.
			articleHtml = await marked.parse(rawContent);
		} catch (e) {
			console.error(`[Details ${id}] Failed to parse markdown content:`, e);
			articleHtml = `<p class="text-red-600 font-semibold">Error displaying article content.</p>`;
		}
	} else if (resp.results.status === 2) {
		articleHtml = `<p class="text-center text-orange-600">Article is marked complete, but content is missing.</p>`;
	} else if (resp.results.status === 3) {
		// If status is error, but there's still some content (e.g., error message formatted in markdown)
		try {
			articleHtml = await marked.parse(rawContent || ''); // Try parsing potential error message
		} catch (e) {
			articleHtml = `<p class="text-red-600 font-semibold">Error displaying article status message.</p>`;
		}
	}


	// Construct the object passed to the template
	const articleForTemplate: ArticleType & { articleHtml: string } = {
		id: resp.results.id,
		topic: resp.results.topic, // This is now the AI-generated title (or original if extraction failed)
		status: resp.results.status,
		content: resp.results.content, // Keep raw markdown if needed, but don't render it
		articleHtml: articleHtml,     // Use the parsed HTML for rendering
		created_at: resp.results.created_at,
		user: resp.results.user,
		sources: sourcesArray,
	};

	return c.html(
		<Layout user={c.get("user")} title={`Article: ${articleForTemplate.topic}`}>
			{/* Pass the object containing parsed HTML */}
			<ArticleDetails article={articleForTemplate} />
		</Layout>,
	);
});

// GET /api/article-status/:id - Check Article Status
app.get("/api/article-status/:id", async (c) => {
	const id = c.req.param("id");
	const qb = new D1QB(c.env.DB);
	const resp = await qb
		.fetchOne<{ status: number, content: string | null }>({
			tableName: "articles",
			fields: ["status", "content"],
			where: {
				conditions: ["id = ?"],
				params: [id],
			},
		})
		.execute();

	if (!resp.results) {
		return c.json({ error: "Article not found" }, 404);
	}

	return c.json({
		id,
		status: resp.results.status,
		completed: resp.results.status === 2 || resp.results.status === 3,
		hasContent: resp.results.content != null
	});
});

// POST /api/optimize-topic - Optimize an article topic with IP-based Rate Limiting
app.post("/api/optimize-topic", async (c) => {
	try {
		// Get client IP for rate limiting with multiple fallbacks
		const clientIP = c.req.header('cf-connecting-ip') ||
			c.req.header('x-forwarded-for') ||
			c.req.header('x-real-ip') ||
			'unknown';

		// Log which IP we're using for rate limiting
		console.log(`[Rate Limit] Using IP for topic optimization: ${clientIP}`);

		// Apply rate limiting based only on IP
		const rateLimitResult = await c.env.OPTIMIZE_RATE_LIMITER.limit({ key: clientIP });
		if (!rateLimitResult.success) {
			console.log(`[Rate Limit] Rate limit exceeded for topic optimization by IP: ${clientIP}`);
			return c.json({
				error: "Rate limit exceeded. Please try again in a minute."
			}, 429);
		}

		const { topic } = await c.req.json();

		if (!topic || typeof topic !== "string" || topic.trim().length < 5) {
			return c.json({
				error: "Please provide a topic with at least 5 characters"
			}, 400);
		}

		const currentDate = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		console.log(`[API] Optimizing topic: "${topic.substring(0, 50)}..."`);

		const model = getSearch(c.env);
		const { text } = await generateText({
			model,
			prompt: OPTIMIZE_TOPIC_PROMPT(topic, currentDate),
		});

		// Trim and clean the result
		const optimizedTopic = text.trim();
		console.log(`[API] Optimized topic: "${optimizedTopic.substring(0, 50)}..."`);

		return c.json({
			originalTopic: topic,
			optimizedTopic: optimizedTopic
		});
	} catch (error) {
		console.error("[API] Error optimizing topic:", error);
		return c.json({
			error: "Failed to optimize topic. Please try again."
		}, 500);
	}
});

export default app;