import { z } from "zod";

// Simplified schema for article topic
export const articleSchema = z.object({
    topic: z
        .string()
        .min(10, "Article topic must be at least 10 characters long")
        .max(500, "Article topic cannot exceed 500 characters"),
});

export type ArticleParams = z.infer<typeof articleSchema>;