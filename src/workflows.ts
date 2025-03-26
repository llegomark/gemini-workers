import {
	WorkflowEntrypoint,
	type WorkflowEvent,
	type WorkflowStep,
} from "cloudflare:workers";
import { generateText } from "ai";
import { D1QB } from "workers-qb";
import type { Env } from "./bindings";
import { GATHER_INFO_PROMPT, WRITE_ARTICLE_PROMPT } from "./prompts";
import type { ArticleType, Source } from "./types";
import { getSearch, getModelThinking, extractSearchMetadata, parseLearningsAndSources } from "./utils";

type GatherInfoResult = {
	text: string;
	providerMetadata?: any;
};

type ErrorUpdateData = {
	status: number;
	content: string | null; // Allow null content in error
	sources: string;
	// Add title field if you modify the DB schema, otherwise update topic
	topic?: string; // To store original topic if needed
};

export class ArticleWorkflow extends WorkflowEntrypoint<Env, ArticleType> {
	async run(event: WorkflowEvent<ArticleType>, step: WorkflowStep) {
		// Use originalTopic to preserve user input if needed later
		const { topic: originalTopic, id, user } = event.payload;
		console.log(`[Workflow ${id}] Starting article generation for topic: "${originalTopic}"`);

		const currentDate = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		let finalMarkdownContent: string | null = null;
		let extractedTitle: string = originalTopic; // Default to original topic
		let combinedSources: Source[] = [];
		let finalLearnings: string[] = [];
		let errorUpdateData: ErrorUpdateData | null = null; // Define outside try

		try {
			// --- Step 1: Gather Information ---
			console.log(`[Workflow ${id}] Step 1: Gathering information...`);
			const gatherResult: GatherInfoResult = await step.do("gather information", async (): Promise<GatherInfoResult> => {
				const model = getSearch(this.env);
				const { text, providerMetadata } = await generateText({
					model,
					prompt: GATHER_INFO_PROMPT(originalTopic, currentDate), // Use original topic for gathering
				});
				console.log(`[Workflow ${id}] Gathered raw text length: ${text.length}`);
				return { text, providerMetadata };
			});

			// --- Step 2: Parse Learnings and Sources ---
			console.log(`[Workflow ${id}] Step 2: Parsing gathered information...`);
			const parsedTextData = parseLearningsAndSources(gatherResult.text);
			const metadataSources = extractSearchMetadata(gatherResult.providerMetadata);

			combinedSources = [...parsedTextData.sources];
			if (metadataSources.sources) {
				metadataSources.sources.forEach(metaSource => {
					if (metaSource.url && !combinedSources.some(s => s.url === metaSource.url)) {
						combinedSources.push(metaSource);
					}
				});
			}

			finalLearnings = parsedTextData.learnings;
			if (finalLearnings.length === 0) {
				console.warn(`[Workflow ${id}] No 'LEARNING:' prefixes found, using raw lines fallback.`);
				finalLearnings = gatherResult.text.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.startsWith('SOURCE_'));
				if (finalLearnings.length === 0) {
					console.error(`[Workflow ${id}] Failed to extract any learnings.`);
					throw new Error("Failed to extract any meaningful learnings from the gathered information.");
				}
			}
			console.log(`[Workflow ${id}] Parsed ${finalLearnings.length} learnings and ${combinedSources.length} unique sources.`);

			// --- Step 3: Write Article & Extract Title ---
			console.log(`[Workflow ${id}] Step 3: Writing article...`);
			const rawArticleMarkdown = await step.do("write article", async () => {
				if (finalLearnings.length === 0) {
					console.error(`[Workflow ${id}] Cannot write article: No learnings available.`);
					throw new Error("Cannot write article: No learnings were gathered.");
				}
				const model = getModelThinking(this.env);
				const { text } = await generateText({
					model,
					// Pass originalTopic here so AI knows the user's intent, but prompt asks for title based on learnings
					prompt: WRITE_ARTICLE_PROMPT(originalTopic, finalLearnings, currentDate),
				});
				console.log(`[Workflow ${id}] Generated raw markdown length: ${text.length}`);
				return text;
			});

			// Extract Title (find first line starting with '# ') and the rest of the content
			const lines = rawArticleMarkdown.split('\n');
			const titleLineIndex = lines.findIndex(line => line.trim().startsWith('# '));

			if (titleLineIndex !== -1) {
				extractedTitle = lines[titleLineIndex].trim().substring(2).trim(); // Remove '# ' and trim
				// Join the lines *after* the title line for the content
				finalMarkdownContent = lines.slice(titleLineIndex + 1).join('\n').trim();
				console.log(`[Workflow ${id}] Extracted Title: "${extractedTitle}"`);
			} else {
				console.warn(`[Workflow ${id}] Could not find H1 title (# ) in AI response. Using original topic as title.`);
				// Use the full response as content if title extraction fails
				finalMarkdownContent = rawArticleMarkdown;
				extractedTitle = originalTopic; // Fallback title
			}
			console.log(`[Workflow ${id}] Final content markdown length: ${finalMarkdownContent?.length ?? 0}`);

			// --- Step 4: Prepare Final Content and Update DB ---
			console.log(`[Workflow ${id}] Step 4: Preparing to update database...`);
			const sourcesJsonString = JSON.stringify(combinedSources);
			console.log(`[Workflow ${id}] Sources JSON string length: ${sourcesJsonString.length}`);

			const qb = new D1QB(this.env.DB);
			const updateData = {
				status: 2, // 2 = Complete
				content: finalMarkdownContent, // Save content without the title line
				sources: sourcesJsonString,
				topic: extractedTitle, // *** UPDATE TOPIC with AI Title ***
			};

			console.log(`[Workflow ${id}] Attempting D1 update with title: "${extractedTitle}", content_length: ${updateData.content?.length}, sources_length: ${updateData.sources?.length}`);

			const updateResult = await qb
				.update({
					tableName: "articles",
					data: updateData,
					where: { conditions: "id = ?", params: [id] },
				})
				.execute();

			console.log(`[Workflow ${id}] D1 update successful! Result:`, JSON.stringify(updateResult));
			console.log(`[Workflow ${id}] Article workflow finished successfully!`);
			return { success: true, articleId: id };

		} catch (error) {
			console.error(`[Workflow ${id}] *** WORKFLOW ERROR ***:`, error);
			console.error(`[Workflow ${id}] Error occurred after gathering ${finalLearnings.length} learnings and ${combinedSources.length} sources.`);

			// Prepare error data before the inner try block
			errorUpdateData = {
				status: 3,
				// Use the raw markdown content if generation failed during title extraction
				content: finalMarkdownContent ?? `## Error Generating Article\n\nAn error occurred while generating the article for topic: "${originalTopic}".\n\nError details: ${error instanceof Error ? error.message : "Unknown error"}`,
				sources: JSON.stringify(combinedSources.length > 0 ? combinedSources : []),
				topic: originalTopic, // Keep original topic on error
			};

			// Attempt to update database with error status
			try {
				console.log(`[Workflow ${id}] Attempting to update DB with error status...`);
				const qb = new D1QB(this.env.DB);
				await qb
					.update({
						tableName: "articles",
						data: errorUpdateData,
						where: { conditions: "id = ?", params: [id] },
					})
					.execute();
				console.log(`[Workflow ${id}] Successfully updated DB with error status.`);
			} catch (dbError) {
				console.error(`[Workflow ${id}] *** FAILED TO UPDATE DB WITH ERROR STATUS ***:`, dbError);
				console.error(`[Workflow ${id}] Error data attempted to insert:`, JSON.stringify({ status: 3, title: errorUpdateData.topic, content_snippet: errorUpdateData.content?.substring(0, 100), sources_length: errorUpdateData.sources.length }));
			}

			throw error; // Re-throw original error
		}
	}
}