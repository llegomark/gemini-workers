// File: src/index.tsx

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { D1QB } from "workers-qb";
import { marked } from "marked";
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
import { getTopic } from "./utils";
import { OPTIMIZE_TOPIC_PROMPT, RANDOM_TOPIC_PROMPT } from "./prompts";

// Import the workflow
export { ArticleWorkflow } from "./workflows";

export const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const ARTICLES_PER_PAGE = 10;

// Middleware to set user
app.use("*", async (c, next) => {
	if (!c.get("user")) c.set("user", "unknown");
	await next();
});

// --- Helper function for Turnstile Validation ---
async function validateTurnstile(token: string | null, ip: string, secretKey: string): Promise<{ success: boolean; errorCodes: string[] }> {
	// Use the secret key passed from the environment
	const actualSecretKey = secretKey;

	if (!token) {
		console.log("[Turnstile] Validation failed: Missing token.");
		return { success: false, errorCodes: ["missing-input-response"] };
	}

	// Crucially check if the secret key from the environment is actually present
	if (!actualSecretKey) {
		console.error("[Turnstile] Validation failed: TURNSTILE_SECRET_KEY is not configured in environment.");
		// Return a specific error code indicating server misconfiguration
		return { success: false, errorCodes: ["missing-secret-key-config"] };
	}

	const verifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
	// Send the actual secret key from the environment
	const body = `secret=${encodeURIComponent(actualSecretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`;

	try {
		const response = await fetch(verifyEndpoint, {
			method: "POST",
			body: body,
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
		});

		if (!response.ok) {
			console.error(`[Turnstile] Siteverify request failed with status: ${response.status}`);
			return { success: false, errorCodes: ["siteverify-fetch-failed"] };
		}

		const outcome = await response.json<{ success: boolean; 'error-codes'?: string[] }>();
		console.log("[Turnstile] Siteverify response:", JSON.stringify(outcome));

		// Handle cases where siteverify might return success: false but without error codes
		if (!outcome.success && !outcome['error-codes']?.length) {
			return { success: false, errorCodes: ["validation-failed-no-code"] };
		}

		return { success: outcome.success, errorCodes: outcome['error-codes'] || [] };
	} catch (error) {
		console.error("[Turnstile] Error calling siteverify:", error);
		return { success: false, errorCodes: ["siteverify-exception"] };
	}
}


// --- Routes ---

// GET / - List Articles (with Pagination)
app.get("/", async (c) => {
	const qb = new D1QB(c.env.DB);

	// Pagination Logic
	const pageQuery = c.req.query("page");
	let page = parseInt(pageQuery || "1", 10);
	if (isNaN(page) || page < 1) page = 1;
	const offset = (page - 1) * ARTICLES_PER_PAGE;

	const articlesResult = await qb
		.select<ArticleTypeDB>("articles")
		.orderBy("created_at desc")
		.limit(ARTICLES_PER_PAGE + 1)
		.offset(offset)
		.all();

	if (!articlesResult?.results || !Array.isArray(articlesResult.results)) {
		console.error("[Index] D1 query result format unexpected.");
		return c.html(
			<Layout user={c.get("user")} title="Generated Articles">
				<ArticleList articles={{ results: [] }} currentPage={1} hasNextPage={false} hasPreviousPage={false} />
			</Layout>,
		);
	}

	const hasNextPage = articlesResult.results.length > ARTICLES_PER_PAGE;
	const articlesForPage = hasNextPage ? articlesResult.results.slice(0, ARTICLES_PER_PAGE) : articlesResult.results;
	const hasPreviousPage = page > 1;
	const articlesProps = { results: articlesForPage };

	return c.html(
		<Layout user={c.get("user")} title="Generated Articles">
			<ArticleList articles={articlesProps} currentPage={page} hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
		</Layout>,
	);
});


// GET /create - Show Article Creation Form
app.get("/create", async (c) => {
	// Use the site key from the environment variable
	const sitekey = c.env.TURNSTILE_SITE_KEY;

	if (!sitekey) {
		console.error("[Index] TURNSTILE_SITE_KEY environment variable not set. Cannot render create form.");
		// Return an error page or throw an exception
		throw new HTTPException(500, { message: "Server configuration error: Turnstile site key is missing." });
	}

	return c.html(
		<Layout user={c.get("user")} title="Create New Article">
			<CreateArticle sitekey={sitekey} /> {/* Pass actual sitekey */}
		</Layout>,
	);
});

// POST /create - Handle Article Creation with Turnstile & Rate Limiting
app.post("/create", async (c) => {
	const form = await c.req.formData();
	const topic = form.get("topic") as string;
	const turnstileToken = form.get("cf-turnstile-response") as string | null;

	const clientIP = c.req.header('cf-connecting-ip') ||
		c.req.header('x-forwarded-for') ||
		c.req.header('x-real-ip') ||
		'unknown';

	// --- 1. Turnstile Validation ---
	console.log(`[Turnstile] Validating token for IP: ${clientIP}`);
	// Use the actual secret key from the environment
	const turnstileSecret = c.env.TURNSTILE_SECRET_KEY;
	// Use the actual site key from the environment for potential re-rendering
	const sitekeyForRender = c.env.TURNSTILE_SITE_KEY;

	// Check if keys are configured before proceeding
	if (!turnstileSecret) {
		console.error("[Index] TURNSTILE_SECRET_KEY environment variable not set. Cannot validate Turnstile.");
		throw new HTTPException(500, { message: "Server configuration error: Turnstile secret key is missing." });
	}
	if (!sitekeyForRender) {
		console.error("[Index] TURNSTILE_SITE_KEY environment variable not set. Cannot re-render form on error.");
		// If site key is missing, we can't even show the form again with an error.
		throw new HTTPException(500, { message: "Server configuration error: Turnstile site key is missing." });
	}

	const turnstileResult = await validateTurnstile(turnstileToken, clientIP, turnstileSecret);

	if (!turnstileResult.success) {
		console.warn(`[Turnstile] Validation failed for IP ${clientIP}. Error codes: ${turnstileResult.errorCodes.join(', ')}`);
		// Map error codes to user-friendly messages
		const errorMap: { [key: string]: string } = {
			'missing-input-secret': 'Server configuration error (missing secret).',
			'invalid-input-secret': 'Server configuration error (invalid secret).',
			'missing-input-response': 'CAPTCHA response missing. Please ensure the CAPTCHA is loaded and solved.',
			'invalid-input-response': 'CAPTCHA response invalid or expired. Please try again.',
			'bad-request': 'Malformed CAPTCHA request. Please refresh and try again.',
			'timeout-or-duplicate': 'CAPTCHA challenge timed out or response already used. Please refresh and try again.',
			'internal-error': 'Internal CAPTCHA error. Please try again later.',
			'siteverify-fetch-failed': 'Could not reach CAPTCHA verification server. Check network or try again.',
			'siteverify-exception': 'An unexpected error occurred during CAPTCHA verification.',
			'validation-failed-no-code': 'CAPTCHA validation failed for an unknown reason.',
			'missing-secret-key-config': 'Server configuration error prevents CAPTCHA validation.' // Added specific message
		};
		const primaryError = turnstileResult.errorCodes[0] || 'unknown';
		const userFriendlyMessage = errorMap[primaryError] || `CAPTCHA verification failed (${primaryError}). Please try again.`;

		// Re-render the form with an error message, original topic, and actual sitekey
		return c.html(
			<Layout user={c.get("user")} title="Create New Article - Verification Failed">
				<CreateArticle sitekey={sitekeyForRender} formData={{ topic }} error={userFriendlyMessage} />
			</Layout>,
			403 // Forbidden
		);
	}
	console.log(`[Turnstile] Validation successful for IP: ${clientIP}`);

	// --- 2. Rate Limiting ---
	console.log(`[Rate Limit] Applying article creation limit for IP: ${clientIP}`);
	const rateLimitResult = await c.env.ARTICLE_RATE_LIMITER.limit({ key: clientIP });
	if (!rateLimitResult.success) {
		console.log(`[Rate Limit] Rate limit exceeded for article creation by IP: ${clientIP}`);
		// Re-render with actual sitekey
		return c.html(
			<Layout user={c.get("user")} title="Create New Article - Rate Limited">
				<div className="container mx-auto max-w-3xl px-4">
					<RateLimitErrorDisplay message="You've reached the article creation limit. Please try again in a minute." />
					<CreateArticle sitekey={sitekeyForRender} formData={{ topic }} />
				</div>
			</Layout>,
			429 // Too Many Requests
		);
	}

	// --- 3. Topic Validation (Zod) ---
	const validationResult = articleSchema.safeParse({ topic });
	if (!validationResult.success) {
		const errorMessages = validationResult.error.errors.map(
			(err) => `${err.path.join('.')}: ${err.message}`
		);
		console.log("Validation failed:", errorMessages);
		// Re-render with actual sitekey
		return c.html(
			<Layout user={c.get("user")} title="Create New Article - Error">
				<div className="container mx-auto max-w-3xl px-4">
					<ValidationErrorDisplay errors={errorMessages} />
					<CreateArticle sitekey={sitekeyForRender} formData={{ topic }} />
				</div>
			</Layout>,
			400 // Bad Request
		);
	}

	// --- 4. Proceed with Article Creation ---
	const validatedData = validationResult.data;
	const id = crypto.randomUUID();
	const userId = c.get("user");

	const articleData: ArticleType = { id, topic: validatedData.topic, status: 1, user: userId };
	const articleDataDB: Omit<ArticleTypeDB, 'created_at'> = {
		id: articleData.id,
		topic: articleData.topic, // Store original topic initially
		status: articleData.status,
		user: articleData.user,
		content: null,
		sources: null
	};

	// --- Start Workflow ---
	try {
		console.log(`[Index] Attempting to create workflow for article ID: ${id}`);
		if (!c.env.ARTICLE_WORKFLOW) {
			throw new Error("ARTICLE_WORKFLOW binding is missing in the environment.");
		}
		await c.env.ARTICLE_WORKFLOW.create({ id, params: articleData });
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
	const rawContent = resp.results.content;

	if (rawContent) {
		try {
			articleHtml = await marked.parse(rawContent);
		} catch (e) {
			console.error(`[Details ${id}] Failed to parse markdown content:`, e);
			articleHtml = `<p class="text-red-600 font-semibold">Error displaying article content.</p>`;
		}
	} else if (resp.results.status === 2) {
		articleHtml = `<p class="text-center text-orange-600">Article is marked complete, but content is missing.</p>`;
	} else if (resp.results.status === 3) {
		try {
			articleHtml = await marked.parse(rawContent || ''); // Try parsing potential error message
		} catch (e) {
			articleHtml = `<p class="text-red-600 font-semibold">Error displaying article status message.</p>`;
		}
	}

	const articleForTemplate: ArticleType & { articleHtml: string } = {
		id: resp.results.id,
		topic: resp.results.topic,
		status: resp.results.status,
		content: resp.results.content,
		articleHtml: articleHtml,
		created_at: resp.results.created_at,
		user: resp.results.user,
		sources: sourcesArray,
	};

	return c.html(
		<Layout user={c.get("user")} title={`Article: ${articleForTemplate.topic}`}>
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
		hasContent: resp.results.content != null && resp.results.content.trim() !== '',
	});
});

// POST /api/optimize-topic - Optimize an article topic with IP-based Rate Limiting
app.post("/api/optimize-topic", async (c) => {
	try {
		const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
		console.log(`[Rate Limit] Using IP for topic optimization: ${clientIP}`);

		const rateLimitResult = await c.env.OPTIMIZE_RATE_LIMITER.limit({ key: clientIP });
		if (!rateLimitResult.success) {
			console.log(`[Rate Limit] Rate limit exceeded for topic optimization by IP: ${clientIP}`);
			return c.json({ error: "Rate limit exceeded. Please try again in a minute." }, 429);
		}

		const { topic } = await c.req.json();
		if (!topic || typeof topic !== "string" || topic.trim().length < 5) {
			return c.json({ error: "Please provide a topic with at least 5 characters" }, 400);
		}

		const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		console.log(`[API] Optimizing topic: "${topic.substring(0, 50)}..."`);

		const model = getTopic(c.env); // Ensure getTopic uses correct env setup for AI provider
		const { text } = await generateText({ model, prompt: OPTIMIZE_TOPIC_PROMPT(topic, currentDate) });
		const optimizedTopic = text.trim();
		console.log(`[API] Optimized topic: "${optimizedTopic.substring(0, 50)}..."`);
		return c.json({ originalTopic: topic, optimizedTopic: optimizedTopic });
	} catch (error) {
		console.error("[API] Error optimizing topic:", error);
		return c.json({ error: "Failed to optimize topic. Please try again." }, 500);
	}
});

// POST /api/random-topic - Generate a random education topic with Rate Limiting
app.post("/api/random-topic", async (c) => {
	try {
		const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
		console.log(`[Rate Limit] Using IP for random topic generation: ${clientIP}`);

		const rateLimitResult = await c.env.OPTIMIZE_RATE_LIMITER.limit({ key: clientIP }); // Use OPTIMIZE limiter
		if (!rateLimitResult.success) {
			console.log(`[Rate Limit] Rate limit exceeded for random topic generation by IP: ${clientIP}`);
			return c.json({ error: "Rate limit exceeded. Please try again in a minute." }, 429);
		}

		const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		console.log(`[API] Generating random education topic...`);

		const model = getTopic(c.env); // Ensure getTopic uses correct env setup for AI provider
		const { text } = await generateText({ model, prompt: RANDOM_TOPIC_PROMPT(currentDate) });
		const randomTopic = text.trim();
		console.log(`[API] Generated random topic: "${randomTopic.substring(0, 50)}..."`);
		return c.json({ randomTopic: randomTopic });
	} catch (error) {
		console.error("[API] Error generating random topic:", error);
		return c.json({ error: "Failed to generate random topic. Please try again." }, 500);
	}
});

export default app;