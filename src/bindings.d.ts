import type { Context } from "hono";
import type { ArticleType } from "./types";

// Update Env type to include rate limiters
export type Env = {
	ARTICLE_WORKFLOW: Workflow<ArticleType>;
	DB: D1Database;
	GOOGLE_API_KEY: string;
	AI_GATEWAY_NAME?: string;
	AI_GATEWAY_ACCOUNT_ID?: string;
	AI_GATEWAY_API_KEY?: string;
	ARTICLE_RATE_LIMITER: RateLimiter; // Rate limiter for article creation
	OPTIMIZE_RATE_LIMITER: RateLimiter; // Rate limiter for topic optimization
	TURNSTILE_SITE_KEY: string;
	TURNSTILE_SECRET_KEY: string;
};

// Add RateLimiter type
export type RateLimiter = {
	limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type Variables = {
	user?: string;
};

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;