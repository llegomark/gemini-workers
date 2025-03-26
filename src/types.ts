export type Source = {
	title?: string;
	url?: string;
	text?: string; // Optional snippet or context
};

export type ArticleType = {
	id: string;
	topic: string;
	status: number; // 1: Running, 2: Complete, 3: Error
	content?: string;
	sources?: Source[]; // Array of source objects
	created_at?: string;
	user: string;
};

// Type for storing in D1 (sources as JSON string)
export type ArticleTypeDB = {
	id: string;
	topic: string;
	status: number;
	content?: string;
	sources?: string; // JSON stringified version of Source[]
	created_at?: string;
	user: string;
};