// File: src/layout/templates.tsx

import { html } from "hono/html";
import type { FC } from "hono/jsx";
import type { ArticleType, ArticleTypeDB, Source } from "../types";
import { formatManilaTime } from "../utils";

// --- Helper Function to Ensure Absolute URLs ---
function ensureAbsoluteUrl(url: string | undefined): string {
	if (!url) return '#'; // Return '#' if URL is missing or undefined
	// Check if it already starts with http:// or https:// (case-insensitive)
	if (/^https?:\/\//i.test(url)) {
		return url;
	}
	// If it starts with '//', prepend 'https:'
	if (url.startsWith('//')) {
		return `https:${url}`;
	}
	// Otherwise, prepend https://
	return `https://${url}`;
}


// --- TopBar Component ---
const TopBar: FC<{ user: string }> = (props) => {
	return (
		<header className="bg-white border-b-3 border-black shadow-md">
			<div className="container mx-auto max-w-4xl px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<a href="/" className="flex items-center space-x-2 text-xl font-bold text-neutral-900 hover:text-neutral-800 transition-colors">
							{/* Book Icon with Neo Brutalist style */}
							<div className="w-9 h-9 bg-primary-500 flex items-center justify-center border-2 border-black shadow-sm">
								<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black">
									<path strokeLinecap="square" strokeLinejoin="miter" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
								</svg>
							</div>
							<span className="relative">
								Edu
								<span className="neo-marker">Articles</span>
							</span>
						</a>
					</div>
					{/* Optional: Add user info or other links here */}
				</div>
			</div>
		</header>
	);
};

// --- Footer Component ---
const Footer: FC = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="border-t-3 border-black mt-12 bg-white">
			<div className="container mx-auto max-w-4xl px-4 py-6 text-center">
				<p className="text-neutral-800 font-medium">
					© {currentYear} Educational Article Generator
				</p>
				<p className="text-sm mt-1 bg-primary-100 inline-block px-3 py-1 border border-primary-300">Powered by Cloudflare Workers & Google Gemini</p>
			</div>
		</footer>
	);
};

// --- Main Layout Component ---
export const Layout: FC<{ title?: string; children: any; user?: string }> = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link href="/styles.css" rel="stylesheet" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
				<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet" />
				<title>{props.title || "Educational Article Generator"}</title>
				<meta name="description" content="Generate educational articles for educators using AI." />
				{/* Add Cloudflare Turnstile script - Moved here from individual component */}
				<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
				<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300b7ff' stroke='black' stroke-width='2'%3E%3Cpath stroke-linecap='square' stroke-linejoin='miter' d='M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' /%3E%3C/svg%3E" />
			</head>
			<body className="bg-neutral-50 min-h-screen flex flex-col">
				<TopBar user={props.user || 'unknown'} />
				<main className="flex-grow py-8 md:py-12">
					{props.children}
				</main>
				<Footer />
			</body>
		</html>
	);
};

// --- PaginationControls Component ---
const PaginationControls: FC<{ currentPage: number, hasNextPage: boolean, hasPreviousPage: boolean }> = (props) => {
	return (
		<div className="flex items-center justify-between mt-6 px-4 sm:px-5">
			{/* Previous Button */}
			{props.hasPreviousPage ? (
				<a href={`/?page=${props.currentPage - 1}`} className="btn btn-secondary btn-sm flex items-center space-x-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
					</svg>
					<span>Previous</span>
				</a>
			) : (
				<span className="btn btn-secondary btn-sm flex items-center space-x-1 opacity-50 pointer-events-none">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
					</svg>
					<span>Previous</span>
				</span>
			)}

			{/* Page Indicator */}
			<span className="text-sm font-medium text-neutral-700">
				Page {props.currentPage}
			</span>

			{/* Next Button */}
			{props.hasNextPage ? (
				<a href={`/?page=${props.currentPage + 1}`} className="btn btn-secondary btn-sm flex items-center space-x-1">
					<span>Next</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
					</svg>
				</a>
			) : (
				<span className="btn btn-secondary btn-sm flex items-center space-x-1 opacity-50 pointer-events-none">
					<span>Next</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
					</svg>
				</span>
			)}
		</div>
	);
};

// --- ArticleList Component (Updated Props) ---
export const ArticleList: FC<{
	articles: { results: ArticleTypeDB[] };
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}> = (props) => {
	// Determine if pagination controls should be shown
	const showPagination = props.articles.results.length > 0 && (props.hasNextPage || props.hasPreviousPage);

	return (
		<div className="container mx-auto max-w-4xl px-3 md:px-4">
			{/* Info Box */}
			<div className="neo-box bg-accent-100 mb-6 md:mb-8 p-4 md:p-5">
				<div className="flex flex-col sm:flex-row">
					<div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
						<div className="w-10 h-10 bg-primary-500 flex items-center justify-center border-2 border-black">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={2}>
								<path strokeLinecap="square" strokeLinejoin="miter" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
					<div>
						<h3 className="text-lg font-bold text-neutral-900">AI Article Generator</h3>
						<div className="mt-2 text-neutral-800">
							<p>Enter a topic to generate an educational article. Articles are created using Google Search for research and Gemini AI for writing.</p>
						</div>
					</div>
				</div>
			</div>

			{/* Article List Card */}
			<div className="card">
				<div className="p-0">
					{/* Card Header */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-0 p-4 sm:p-5 border-b-3 border-black bg-neutral-100">
						<h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
							Generated Articles
						</h2>
						<a
							href="/create"
							className="btn btn-primary mt-3 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="square" strokeLinejoin="miter" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							<span>New Article</span>
						</a>
					</div>

					{/* Mobile Card List */}
					<div className="md:hidden divide-y-3 divide-black border-b-3 border-black">
						{props.articles.results.map((obj) => (
							<div key={obj.id} className="bg-white p-4">
								<div className="flex justify-between items-start mb-3">
									<h3 className="text-base font-bold line-clamp-2 pr-2">{obj.topic}</h3>
									{obj.status === 1 && <span className="badge badge-warning shrink-0">Generating...</span>}
									{obj.status === 2 && <span className="badge badge-success shrink-0">Complete</span>}
									{obj.status === 3 && <span className="badge badge-error shrink-0">Error</span>}
								</div>

								<div className="text-xs font-mono mb-3 bg-neutral-50 px-2 py-1 inline-block border border-neutral-200">
									{obj.created_at ? formatManilaTime(new Date(obj.created_at)) : 'N/A'}
								</div>

								<div className="mt-3 text-right">
									<a
										href={"/details/" + obj.id}
										className="btn btn-secondary btn-sm w-full"
									>
										{obj.status === 1 ? "View Progress" : (obj.status === 2 ? "Read Article" : "View Error")}
									</a>
								</div>
							</div>
						))}
					</div>

					{/* Desktop Table List */}
					<div className="hidden md:block overflow-x-auto">
						<table className="table-neo">
							<thead>
								<tr>
									<th className="text-left">Topic / Title</th>
									<th className="text-left">Status</th>
									<th className="text-left">Date Created</th>
									<th className="text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white">
								{props.articles.results.map((obj) => (
									<tr key={obj.id}>
										<td>
											<div className="text-sm text-neutral-800 line-clamp-2 font-medium">{obj.topic}</div>
										</td>
										<td>
											{obj.status === 1 && <span className="badge badge-warning">Generating...</span>}
											{obj.status === 2 && <span className="badge badge-success">Complete</span>}
											{obj.status === 3 && <span className="badge badge-error">Error</span>}
										</td>
										<td>
											<span className="text-xs font-mono text-neutral-600 whitespace-nowrap">
												{obj.created_at ? formatManilaTime(new Date(obj.created_at)) : 'N/A'}
											</span>
										</td>
										<td className="text-right">
											<a
												href={"/details/" + obj.id}
												className="btn btn-secondary btn-sm text-center min-w-28"
											>
												{obj.status === 1 ? "View Progress" : (obj.status === 2 ? "Read Article" : "View Error")}
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Empty State */}
					{props.articles.results.length === 0 && (
						<div className="text-center py-12 px-4 sm:py-16 sm:px-6 bg-white border-t-3 border-black">
							<div className="w-16 h-16 mx-auto bg-neutral-100 flex items-center justify-center border-3 border-black shadow-md">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="square" strokeLinejoin="miter" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="mt-4 text-lg font-bold text-neutral-800">No articles found</h3>
							<p className="mt-2 text-neutral-600 max-w-md mx-auto">
								{props.currentPage > 1 ? "There are no articles on this page." : "Get started by creating your first educational article."}
							</p>
							{props.currentPage <= 1 && (
								<div className="mt-6">
									<a href="/create" className="btn btn-primary">
										Create New Article
									</a>
								</div>
							)}
						</div>
					)}

					{/* Pagination Controls */}
					{showPagination && (
						<div className="border-t-3 border-black py-4 bg-neutral-50">
							<PaginationControls
								currentPage={props.currentPage}
								hasNextPage={props.hasNextPage}
								hasPreviousPage={props.hasPreviousPage}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};


// --- CreateArticle Component ---
export const CreateArticle: FC<{ sitekey: string; formData?: { topic: string }; error?: string }> = (props) => {
	const defaultTopic = props.formData?.topic || "";
	// Use the provided sitekey or fallback to the dummy key if needed (shouldn't happen if passed correctly from index.tsx)
	const turnstileSiteKey = props.sitekey;
	return (
		<div className="container mx-auto max-w-4xl px-3 md:px-4">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-neutral-900">
					<span className="bg-primary-200 px-2 py-1 inline-block">Generate</span> New Article
				</h2>
				<a href="/" className="btn btn-secondary btn-sm flex items-center space-x-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
					</svg>
					<span>Back to List</span>
				</a>
			</div>
			{/* Display Turnstile validation error if present */}
			{props.error && (
				<div className="neo-box bg-error-100 border-error-500 text-error-800 px-5 py-4 mb-6" role="alert">
					<div className="flex items-center">
						<div className="bg-error-500 text-white p-2 mr-4 border-2 border-black">
							{/* Error Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<strong className="font-bold text-error-800">Verification Failed</strong>
					</div>
					<div className="mt-3 border-t-2 border-error-300 pt-3">
						<p className="font-medium">{props.error}</p>
					</div>
				</div>
			)}
			<div className="card">
				<div className="card-header">
					<h3 className="card-title">Topic Details</h3>
				</div>
				<div className="card-body">
					<form
						className="space-y-6"
						action="/create"
						method="post"
						id="article-form"
					>
						<div className="space-y-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<label htmlFor="article-topic" className="block text-base font-semibold text-neutral-800">
									What topic would you like an article about?
								</label>
								<div className="flex flex-wrap gap-2">
									<button
										type="button"
										id="random-topic-btn"
										className="btn btn-secondary btn-sm flex items-center gap-1"
										title="Get a random education topic suggestion"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
											<path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
											<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
										</svg>
										<span>Random Topic</span>
										<span id="random-spinner" className="hidden">
											<svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										</span>
									</button>
									<button
										type="button"
										id="optimize-topic-btn"
										className="btn btn-secondary btn-sm flex items-center gap-1"
										title="Let AI suggest improvements to your topic"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
											<path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435Zm4.443 7.728-6.573 6.573a.59.59 0 0 1-.42.174.592.592 0 0 1-.42-.174L.596 8.308a.592.592 0 0 1 0-.84L7.168.896a.592.592 0 0 1 .84 0l6.573 6.573a.592.592 0 0 1-.087.824Z" />
											<path d="M6.75 6.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm2.75.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8.75 6.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
										</svg>
										<span>Optimize Topic</span>
										<span id="optimize-spinner" className="hidden">
											<svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										</span>
									</button>
								</div>
							</div>
							<textarea
								id="article-topic"
								name="topic"
								className="input-neo min-h-32"
								required={true}
								placeholder="Enter a specific educational topic (e.g., 'Project-Based Learning Strategies for Middle School Science', 'Effective Formative Assessment Techniques', 'Integrating SEL in High School English')"
								defaultValue={defaultTopic}
								minLength={10} // Basic HTML validation
								maxLength={500} // Basic HTML validation
							></textarea>
							{/* Character counter will be inserted here by JS */}
							<p className="text-sm text-neutral-600 bg-neutral-100 p-3 border-l-3 border-neutral-300">Be specific about your educational topic. The AI will research using Google Search and write a comprehensive article for K-12 educators.</p>

							<div id="optimization-result" className="hidden mt-2 p-4 border-2 border-primary-400 bg-primary-50">
								<h4 className="font-bold text-primary-700 mb-2">✨ Topic Optimized!</h4>
								<p className="text-sm text-neutral-700">The AI has refined your topic to be more specific and educator-focused.</p>
							</div>

							<div id="random-result" className="hidden mt-2 p-4 border-2 border-secondary-400 bg-secondary-50">
								<h4 className="font-bold text-secondary-700 mb-2">🎲 Random Topic Generated!</h4>
								<p className="text-sm text-neutral-700">The AI has suggested a random educational topic.</p>
							</div>
						</div>

						{/* Add the Turnstile Widget Div */}
						<div className="pt-2">
							<label className="block text-sm font-semibold text-neutral-800 mb-2">Verification</label>
							<div className="cf-turnstile" data-sitekey={turnstileSiteKey}></div>
						</div>

						<div className="pt-2 flex justify-end">
							<button type="submit" className="btn btn-primary w-full sm:w-auto">
								Generate Educational Article
							</button>
						</div>
					</form>

					{/* Client-side JavaScript for optimize/random topic and char count/validation */}
					<script dangerouslySetInnerHTML={{
						__html: `
						document.addEventListener('DOMContentLoaded', () => {
							const optimizeBtn = document.getElementById('optimize-topic-btn');
							const randomBtn = document.getElementById('random-topic-btn');
							const topicTextarea = document.getElementById('article-topic');
							const optimizeSpinner = document.getElementById('optimize-spinner');
							const randomSpinner = document.getElementById('random-spinner');
							const optimizationResult = document.getElementById('optimization-result');
							const randomResult = document.getElementById('random-result');
							const articleForm = document.getElementById('article-form'); // Get form element

							if (!optimizeBtn || !randomBtn || !topicTextarea || !optimizeSpinner || !randomSpinner || !optimizationResult || !randomResult || !articleForm) return;

							// Add character counter
							const charCounter = document.createElement('div');
							charCounter.className = 'text-xs text-right mt-1 text-neutral-500';
							charCounter.id = 'char-counter';

							if (topicTextarea.parentNode) { // Ensure parentNode exists
								topicTextarea.parentNode.insertBefore(charCounter, topicTextarea.nextSibling);

								const updateCounter = () => {
									const currentLength = topicTextarea.value.length;
									const maxLength = 500; // Match the validation schema
									const minLength = 10; // Match the validation schema
									const remainingChars = maxLength - currentLength;

									charCounter.textContent = \`\${currentLength}/\${maxLength} characters\`;

									// Remove previous error styles first
									charCounter.classList.remove('text-orange-500', 'font-medium', 'text-error-600', 'font-bold');
									charCounter.classList.add('text-neutral-500'); // Default style

									if (currentLength < minLength && currentLength > 0) {
										charCounter.className = 'text-xs text-right mt-1 text-error-600 font-bold';
										charCounter.textContent = \`\${currentLength}/\${maxLength} characters (min \${minLength} required)\`;
									} else if (remainingChars <= 50 && remainingChars >= 0) {
										charCounter.className = 'text-xs text-right mt-1 text-orange-500 font-medium';
									} else if (remainingChars < 0) {
										charCounter.className = 'text-xs text-right mt-1 text-error-600 font-bold';
										charCounter.textContent = \`\${currentLength}/\${maxLength} characters (\${Math.abs(remainingChars)} over limit)\`;
									}
								};

								topicTextarea.addEventListener('input', updateCounter);
								updateCounter(); // Initial count
							}


							// Add form submission validation
							articleForm.addEventListener('submit', function(e) {
								const topic = topicTextarea.value.trim();
								const currentLength = topic.length;
								const maxLength = 500;
								const minLength = 10;
								let validationErrors = [];

								if (currentLength < minLength) {
									validationErrors.push(\`Topic must be at least \${minLength} characters long. Current length: \${currentLength}\`);
								}
								if (currentLength > maxLength) {
									validationErrors.push(\`Topic cannot exceed \${maxLength} characters. Current length: \${currentLength}\`);
								}

								// Remove any existing validation error box first
								const existingErrorBox = articleForm.querySelector('.validation-error-box');
								if (existingErrorBox) {
									existingErrorBox.remove();
								}

								if (validationErrors.length > 0) {
									e.preventDefault(); // Stop form submission

									const errorBox = document.createElement('div');
									errorBox.className = 'validation-error-box neo-box bg-error-100 border-error-500 text-error-800 px-5 py-4 mb-6'; // Added class
									errorBox.role = 'alert';
									let errorHTML = \`
										<div class="flex items-center">
										   <div class="bg-error-500 text-white p-2 mr-4 border-2 border-black">
											  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												 <path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											  </svg>
										   </div>
										   <strong class="font-bold text-error-800">Validation Error!</strong>
										</div>
										<ul class="mt-3 list-disc list-inside text-error-800 border-t-2 border-error-300 pt-3">
									\`;
									validationErrors.forEach(error => {
										errorHTML += \`<li class="font-medium">\${error}</li>\`;
									});
									errorHTML += '</ul>';
									errorBox.innerHTML = errorHTML;

									// Insert error message before the form element or specific field
									articleForm.parentNode.insertBefore(errorBox, articleForm);
									errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
								}
							});


							const showApiError = (elementToInsertBefore, message) => {
								const errorBox = document.createElement('div');
								errorBox.className = 'api-error-box mt-2 p-4 border-2 border-error-500 bg-error-50 rounded';
								errorBox.innerHTML = \`
									<h4 class="font-bold text-error-700 mb-2">❌ Error</h4>
									<p class="text-sm text-neutral-700">\${message}</p>
								\`;
								// Remove existing API errors before showing new one
								const existingApiError = document.querySelector('.api-error-box');
								if(existingApiError) existingApiError.remove();

								topicTextarea.parentNode.insertBefore(errorBox, elementToInsertBefore);
								setTimeout(() => { errorBox.remove(); }, 5000);
							};


							// Handle Optimize Topic button
							optimizeBtn.addEventListener('click', async () => {
								const topic = topicTextarea.value.trim();
								if (!topic || topic.length < 5) {
									alert('Please enter a topic with at least 5 characters to optimize.');
									return;
								}
								try {
									optimizeSpinner.classList.remove('hidden');
									optimizeBtn.disabled = true;
									optimizationResult.classList.add('hidden');
									randomResult.classList.add('hidden');
									const response = await fetch('/api/optimize-topic', { /* ... fetch options ... */
                                        method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ topic }),
                                    });
									if (response.status === 429) {
                                        const errorData = await response.json();
										showApiError(optimizationResult, errorData.error || 'Rate limit exceeded. Please try again in a minute.');
										throw new Error('Rate limit exceeded'); // Prevent further processing
                                    }
									if (!response.ok) throw new Error((await response.json()).error || 'Failed to optimize topic');
									const data = await response.json();
									if (data.optimizedTopic) {
										topicTextarea.value = data.optimizedTopic;
										optimizationResult.classList.remove('hidden');
										randomResult.classList.add('hidden');
										topicTextarea.classList.add('bg-primary-50', 'border-primary-500');
										setTimeout(() => { topicTextarea.classList.remove('bg-primary-50', 'border-primary-500'); }, 1500);
										topicTextarea.dispatchEvent(new Event('input')); // Update counter
									}
								} catch (error) {
									console.error('Error optimizing topic:', error);
									if (!error.message.includes('Rate limit exceeded')) {
										showApiError(optimizationResult, 'Failed to optimize topic: ' + (error.message || 'Unknown error'));
									}
								} finally {
									optimizeSpinner.classList.add('hidden');
									optimizeBtn.disabled = false;
								}
							});

							// Handle Random Topic button
							randomBtn.addEventListener('click', async () => {
								try {
									randomSpinner.classList.remove('hidden');
									randomBtn.disabled = true;
									randomResult.classList.add('hidden');
									optimizationResult.classList.add('hidden');
									const response = await fetch('/api/random-topic', { /* ... fetch options ... */
                                        method: 'POST', headers: { 'Content-Type': 'application/json', }
                                    });
									if (response.status === 429) {
                                        const errorData = await response.json();
										showApiError(randomResult, errorData.error || 'Rate limit exceeded. Please try again in a minute.');
										throw new Error('Rate limit exceeded'); // Prevent further processing
                                    }
									if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate random topic');
									const data = await response.json();
									if (data.randomTopic) {
										topicTextarea.value = data.randomTopic;
										randomResult.classList.remove('hidden');
										optimizationResult.classList.add('hidden');
										topicTextarea.classList.add('bg-secondary-50', 'border-secondary-500');
										setTimeout(() => { topicTextarea.classList.remove('bg-secondary-50', 'border-secondary-500'); }, 1500);
										topicTextarea.dispatchEvent(new Event('input')); // Update counter
									}
								} catch (error) {
									console.error('Error generating random topic:', error);
									if (!error.message.includes('Rate limit exceeded')) {
										showApiError(randomResult, 'Failed to generate random topic: ' + (error.message || 'Unknown error'));
									}
								} finally {
									randomSpinner.classList.add('hidden');
									randomBtn.disabled = false;
								}
							});
						});
						`
					}} />
				</div>
			</div>
		</div>
	);
};

// --- ArticleDetails Component ---
export const ArticleDetails: FC<{ article: ArticleType & { articleHtml: string } }> = (props) => {
	const sources = props.article.sources ?? [];

	return (
		<div className="container mx-auto max-w-4xl px-4">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-lg font-bold text-neutral-700 bg-neutral-100 px-3 py-1 border-2 border-neutral-300">
					Article Details
				</h2>
				<div className="flex gap-2">
					{/* Copy Button - Only show for completed articles with content */}
					{props.article.status === 2 && props.article.content && props.article.content.trim() !== '' && (
						<button
							id="copy-markdown-btn"
							className="btn btn-primary btn-sm flex items-center space-x-1"
							title="Copy article in Markdown format"
							type="button"
							data-content={props.article.content} /* Store raw markdown here */
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
								<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
								<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3 0h3v1h-3z" />
							</svg>
							<span id="copy-btn-text">Copy</span>
						</button>
					)}
					<a href="/" className="btn btn-secondary btn-sm flex items-center space-x-1">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
							<path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
						</svg>
						<span>Back to List</span>
					</a>
				</div>
			</div>

			{/* Content Area */}
			<div className="space-y-8">
				{/* Status 1: Loading State */}
				{props.article.status === 1 && (
					<div className="neo-box bg-white p-8">
						<div className="flex flex-col items-center justify-center py-12 px-4 space-y-6 text-center">
							{/* Loading indicator */}
							<div className="w-20 h-20 bg-primary-500 flex items-center justify-center border-3 border-black shadow-md neo-pulse">
								<svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="black" strokeWidth={2}>
									<path strokeLinecap="square" strokeLinejoin="miter" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
								</svg>
							</div>

							<h1 className="text-2xl font-bold text-neutral-900">{props.article.topic}</h1>

							<h3 className="text-xl font-bold text-primary-800">Crafting your educational article...</h3>

							<div className="w-full max-w-md mx-auto border-3 border-black bg-white relative h-6 overflow-hidden">
								<div className="loading-bar bg-primary-500 h-full w-[0%] transition-all duration-1000 ease-linear"></div>
								<div className="absolute inset-0 border-b border-dashed border-black opacity-30"></div>
							</div>

							<div className="font-mono bg-primary-100 px-4 py-2 border-2 border-primary-300 flex items-center">
								<svg className="animate-spin mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span id="status-text" className="font-medium">Researching & writing your article...</span>
							</div>

							<div className="max-w-md text-center px-6 py-4 border-2 border-neutral-200 bg-neutral-50">
								<p className="text-neutral-700">The AI is researching your topic and crafting a comprehensive educational article.</p>
								<p className="text-sm text-neutral-600 mt-2">This typically takes 30-60 seconds. The page will update automatically when complete.</p>
							</div>
						</div>
						<script dangerouslySetInnerHTML={{ // Polling script
							__html: `
							const loadingBar = document.querySelector('.loading-bar'); let width = 0; const maxWidth = 95; const duration = 60000; const interval = 500; const increment = (maxWidth / (duration / interval));
							const loadingInterval = setInterval(() => { if (width < maxWidth) { width = Math.min(width + increment, maxWidth); if(loadingBar) loadingBar.style.width = width + '%'; } }, interval);
							const articleId = "${props.article.id}"; const statusText = document.getElementById('status-text');
							const pollingInterval = setInterval(async () => { try { const response = await fetch(\`/api/article-status/\${articleId}\`); if (!response.ok) throw new Error('Status check failed'); const data = await response.json(); if (data.completed && data.hasContent) { if (loadingBar) loadingBar.style.width = '100%'; if (statusText) statusText.textContent = 'Article complete! Reloading...'; clearInterval(pollingInterval); clearInterval(loadingInterval); setTimeout(() => { window.location.reload(); }, 1000); } else if (data.status === 3) { if (statusText) statusText.textContent = 'Error generating article. Reloading...'; clearInterval(pollingInterval); clearInterval(loadingInterval); setTimeout(() => { window.location.reload(); }, 1500); } } catch (error) { console.error('Error polling status:', error); /* Consider stopping polling on repeated errors */ } }, 3000); /* Check every 3 seconds */
							// Clear intervals when the page is left to avoid background polling
							window.addEventListener('beforeunload', () => { clearInterval(pollingInterval); clearInterval(loadingInterval); });
							`
						}}></script>
					</div>
				)}

				{/* Status 2 or 3: Render Article Content */}
				{(props.article.status === 2 || props.article.status === 3) && (
					<div className="report">
						{/* Render Title */}
						<h1>{props.article.topic}</h1>
						{/* Render Parsed HTML Content */}
						<div
							className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-primary-600 hover:prose-a:text-primary-700"
							dangerouslySetInnerHTML={{ __html: props.article.articleHtml }}
						/>

						{/* Status 2: Show Sources if available and article is complete */}
						{props.article.status === 2 && sources.length > 0 && (
							<div className="sources-section">
								<h2>References</h2>
								{/* Added className="sources-list" for CSS Counters */}
								<ol className="sources-list">
									{sources.map((source, index) => (
										<li key={index}>
											{/* Ensure URL is absolute and used in href */}
											<a
												href={ensureAbsoluteUrl(source.url)}
												target="_blank"
												rel="noopener noreferrer"
												className="source-url group" // Link wraps content
											>
												{/* Display Title */}
												<span className="source-title">
													{source.title || "Source Link"} {/* Fallback title */}
												</span>
												{/* Display Full URL */}
												<span className="text-xs text-primary-600 group-hover:text-primary-700 group-hover:underline block truncate">
													{source.url || 'URL not available'}
												</span>
											</a>
										</li>
									))}
								</ol>
							</div>
						)}
						{/* Optional: Add message if status is 2 but no sources */}
						{props.article.status === 2 && sources.length === 0 && (
							<div className="mt-8 p-4 bg-neutral-100 border-2 border-neutral-300 text-center text-neutral-600">
								No external sources were cited for this article.
							</div>
						)}
						{/* Status 3: Indicate error if content was error message */}
						{props.article.status === 3 && (
							<div className="mt-8 p-4 bg-error-100 border-2 border-error-500 text-center text-error-800 font-semibold">
								An error occurred during article generation. The content above may be incomplete or show error details.
							</div>
						)}
					</div>
				)}
			</div>

			{/* JavaScript for copy functionality - Only include if status is 2 and content exists */}
			{props.article.status === 2 && props.article.content && props.article.content.trim() !== '' && (
				<script dangerouslySetInnerHTML={{
					__html: `
					document.addEventListener('DOMContentLoaded', () => {
						const copyBtn = document.getElementById('copy-markdown-btn');
						const copyBtnText = document.getElementById('copy-btn-text');

						if (!copyBtn || !copyBtnText) return;

						copyBtn.addEventListener('click', async () => {
							try {
								const content = copyBtn.getAttribute('data-content');
								if (!content) throw new Error('No content to copy');

								await navigator.clipboard.writeText(content);

								// Show success message
								copyBtnText.textContent = 'Copied!';
								copyBtn.classList.add('bg-secondary-500'); // Use a success color class if defined

								// Reset after 2 seconds
								setTimeout(() => {
									copyBtnText.textContent = 'Copy';
									copyBtn.classList.remove('bg-secondary-500');
								}, 2000);
							} catch (err) {
								console.error('Failed to copy content:', err);

								// Show error message
								copyBtnText.textContent = 'Copy Failed';
                                // Optionally add an error class
								// copyBtn.classList.add('bg-error-500');

								setTimeout(() => {
									copyBtnText.textContent = 'Copy';
                                    // copyBtn.classList.remove('bg-error-500');
								}, 2000);
							}
						});
					});
					`
				}} />
			)}
		</div>
	);
};

// --- ValidationErrorDisplay Component ---
export const ValidationErrorDisplay: FC<{ errors: string[] }> = (props) => {
	if (!props.errors || props.errors.length === 0) return null;
	return (
		<div className="neo-box bg-error-100 border-error-500 text-error-800 px-5 py-4 mb-6" role="alert">
			<div className="flex items-center">
				<div className="bg-error-500 text-white p-2 mr-4 border-2 border-black">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="square" strokeLinejoin="miter" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<strong className="font-bold text-error-800">Validation Error!</strong>
			</div>
			<ul className="mt-3 list-disc list-inside text-error-800 border-t-2 border-error-300 pt-3">
				{props.errors.map((error, index) => (
					<li key={index} className="font-medium">{error}</li>
				))}
			</ul>
		</div>
	);
};

// --- RateLimitErrorDisplay Component ---
export const RateLimitErrorDisplay: FC<{ message?: string }> = (props) => {
	const defaultMessage = "Rate limit exceeded. Please try again in a minute.";
	return (
		<div className="neo-box bg-error-100 border-error-500 text-error-800 px-5 py-4 mb-6" role="alert">
			<div className="flex items-center">
				<div className="bg-error-500 text-white p-2 mr-4 border-2 border-black">
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="square" strokeLinejoin="miter" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<strong className="font-bold text-error-800">Rate Limit Exceeded</strong>
			</div>
			<div className="mt-3 border-t-2 border-error-300 pt-3">
				<p className="font-medium">{props.message || defaultMessage}</p>
				<p className="mt-2 text-sm">Our system limits the number of requests to ensure optimal performance for all users.</p>
			</div>
		</div>
	);
};