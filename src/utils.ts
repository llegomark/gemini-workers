import {
	type GoogleGenerativeAIProvider,
	createGoogleGenerativeAI,
} from "@ai-sdk/google";
import type { Env } from "./bindings";
import type { Source } from "./types"; // Import Source type

function getGoogleProvider(env: Env): GoogleGenerativeAIProvider {
	const args = {
		apiKey: env.GOOGLE_API_KEY,
	};

	if (env.AI_GATEWAY_ACCOUNT_ID && env.AI_GATEWAY_NAME) {
		args["baseURL"] =
			`https://gateway.ai.cloudflare.com/v1/${env.AI_GATEWAY_ACCOUNT_ID}/${env.AI_GATEWAY_NAME}/google-ai-studio/v1beta`;

		if (env.AI_GATEWAY_API_KEY) {
			args["headers"] = {
				"cf-aig-authorization": `Bearer ${env.AI_GATEWAY_API_KEY}`,
			};
		}
	}

	return createGoogleGenerativeAI(args);
}

// Removed getModel, getFlashFast as they are not explicitly requested for the new flow
// Kept getModelThinking and getSearch as requested

export function getModelThinking(env: Env) {
	const google = getGoogleProvider(env);
	return google("gemini-2.0-flash-thinking-exp-01-21");
}

export function getSearch(env: Env) {
	const google = getGoogleProvider(env);
	return google("gemini-2.0-flash", {
		useSearchGrounding: true,
	});
}

// Helper function to extract search grounding metadata from the response
// Enhanced to better align with potential Google AI SDK structures
export function extractSearchMetadata(providerMetadata?: any): {
	sources?: Source[]; // Use the Source type
	searchQueries?: string[];
	safetyRatings?: any;
} {
	const result: { sources: Source[]; searchQueries?: string[]; safetyRatings?: any } = { sources: [] };

	if (!providerMetadata?.google) {
		return result;
	}

	const metadata = providerMetadata.google;

	// Extract safety ratings if present
	result.safetyRatings = metadata.safetyRatings;

	// Attempt to extract grounding metadata (structure might vary slightly)
	const groundingMetadata = metadata.groundingMetadata;
	if (groundingMetadata) {
		// Extract web search queries if available
		if (Array.isArray(groundingMetadata.webSearchQueries)) {
			result.searchQueries = groundingMetadata.webSearchQueries;
		}

		// Extract sources from grounding metadata if available (common pattern)
		// Google's grounding often returns structured source info here
		if (Array.isArray(groundingMetadata.sources)) {
			groundingMetadata.sources.forEach((s: any) => {
				if (s?.uri) { // 'uri' is often used for the URL
					result.sources.push({
						url: s.uri,
						title: s.title || undefined, // Include title if available
					});
				}
			});
		}
		// Sometimes sources might be under a different key like 'retrievalQueries' or similar
		// Add more extraction logic here if needed based on observed API responses
	}

	// Additionally, check the top-level `sources` property sometimes returned
	// This might be populated directly by the AI SDK layer
	if (Array.isArray(metadata.sources)) {
		metadata.sources.forEach((s: any) => {
			if (s?.url && !result.sources.some(existing => existing.url === s.url)) { // Avoid duplicates
				result.sources.push({
					url: s.url,
					title: s.title || undefined,
				});
			}
		});
	}


	return result;
}


// --- Time Formatting Functions (kept from original) ---

export function timeAgo(date: Date): string {
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals: [number, string][] = [
		[60, "second"],
		[60, "minute"],
		[24, "hour"],
		[7, "day"],
		[4.35, "week"],
		[12, "month"],
		[Number.POSITIVE_INFINITY, "year"],
	];

	let count = seconds;
	let unit = "second";

	for (const [interval, name] of intervals) {
		if (count < interval) break;
		count /= interval;
		unit = name;
	}

	count = Math.floor(count);
	return `${count} ${unit}${count !== 1 ? "s" : ""} ago`;
}

export function formatManilaTime(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Asia/Manila',
		hour12: true
	};
	return new Intl.DateTimeFormat('en-US', options).format(date);
}


// --- Helper to parse text potentially containing LEARNING: and SOURCE_URL: ---
export function parseLearningsAndSources(text: string): { learnings: string[], sources: Source[] } {
	const learnings: string[] = [];
	const sources: Source[] = [];
	const lines = text.split('\n');
	let nextTitle: string | undefined = undefined;

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine.startsWith('LEARNING:')) {
			learnings.push(trimmedLine.substring('LEARNING:'.length).trim());
		} else if (trimmedLine.startsWith('SOURCE_TITLE:')) {
			nextTitle = trimmedLine.substring('SOURCE_TITLE:'.length).trim();
		} else if (trimmedLine.startsWith('SOURCE_URL:')) {
			const url = trimmedLine.substring('SOURCE_URL:'.length).trim();
			if (url) {
				// Avoid adding duplicates if the URL already exists
				if (!sources.some(s => s.url === url)) {
					sources.push({ url: url, title: nextTitle });
				}
				nextTitle = undefined; // Reset title after associating with URL
			}
		}
	}
	return { learnings, sources };
}