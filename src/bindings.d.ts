import type { Context } from "hono";
import type { ArticleType } from "./types";

// Remove BROWSER, update Workflow type
export type Env = {
	ARTICLE_WORKFLOW: Workflow<ArticleType>; // Changed workflow name and type
	DB: D1Database;
	GOOGLE_API_KEY: string;
	AI_GATEWAY_NAME?: string;
	AI_GATEWAY_ACCOUNT_ID?: string;
	AI_GATEWAY_API_KEY?: string;
	// BROWSER removed
};

export type Variables = {
	user?: string;
};

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;