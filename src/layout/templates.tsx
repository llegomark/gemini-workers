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
		<header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
			<div className="container mx-auto max-w-5xl px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<a href="/" className="flex items-center space-x-2 text-xl font-semibold text-primary-700 hover:text-primary-800 transition-colors">
							{/* Simple Book Icon */}
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
							</svg>
							<span>Edu Articles</span>
						</a>
					</div>
					{/* Optional User display can be added here */}
				</div>
			</div>
		</header>
	);
};

// --- Footer Component ---
const Footer: FC = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="bg-neutral-100 border-t border-neutral-200 mt-12">
			<div className="container mx-auto max-w-5xl px-4 py-6 text-center">
				<p className="text-neutral-600 text-sm">
					© {currentYear} Educational Article Generator.
				</p>
				<p className="text-xs text-neutral-500 mt-1">Powered by Cloudflare Workers & Google Gemini</p>
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
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
				<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap" rel="stylesheet" />
				<title>{props.title || "Educational Article Generator"}</title>
				<meta name="description" content="Generate educational articles for educators using AI." />
				<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' /%3E%3C/svg%3E" />
			</head>
			<body className="bg-neutral-50 min-h-screen flex flex-col">
				<TopBar user={props.user || 'unknown'} />
				<main className="flex-grow py-8 md:py-10">
					{props.children}
				</main>
				<Footer />
			</body>
		</html>
	);
};

// --- ArticleList Component ---
export const ArticleList: FC<{ articles: { results: ArticleTypeDB[] } }> = (props) => {
	return (
		<div className="container mx-auto max-w-5xl px-4">
			<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
				<div className="flex">
					<div className="flex-shrink-0">
						<svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
						</svg>
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-blue-800">AI Article Generator</h3>
						<div className="mt-2 text-sm text-blue-700">
							<p>Enter a topic to generate an educational article. Articles are generated using Google Search for information and AI for writing.</p>
						</div>
					</div>
				</div>
			</div>

			<div className="card">
				<div className="p-0">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-0 p-4 md:p-6 border-b border-neutral-200">
						<h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">
							Generated Articles
						</h2>
						<a
							href="/create"
							className="btn btn-primary mt-3 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 text-sm md:text-base"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							<span>New Article</span>
						</a>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-neutral-200 bg-neutral-50">
									<th className="px-4 sm:px-6 py-3 text-left font-medium text-neutral-600 text-xs sm:text-sm tracking-wider uppercase">Topic / Title</th>
									<th className="px-4 sm:px-6 py-3 text-left font-medium text-neutral-600 text-xs sm:text-sm tracking-wider uppercase">Status</th>
									<th className="px-4 sm:px-6 py-3 text-left font-medium text-neutral-600 text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap">Date Created</th>
									<th className="px-4 sm:px-6 py-3 text-right font-medium text-neutral-600 text-xs sm:text-sm tracking-wider uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200">
								{props.articles.results.map((obj) => (
									<tr key={obj.id} className="hover:bg-neutral-50 transition-colors duration-150">
										<td className="px-4 sm:px-6 py-3 sm:py-4">
											<div className="text-sm text-neutral-800 line-clamp-2 font-medium">{obj.topic}</div>
										</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4">
											{obj.status === 1 && <span className="badge badge-warning">Generating...</span>}
											{obj.status === 2 && <span className="badge badge-success">Complete</span>}
											{obj.status === 3 && <span className="badge badge-error">Error</span>}
										</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4">
											<span className="text-xs sm:text-sm text-neutral-500 whitespace-nowrap">
												{obj.created_at ? formatManilaTime(new Date(obj.created_at)) : 'N/A'}
											</span>
										</td>
										<td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
											<a
												href={"/details/" + obj.id}
												className="btn btn-secondary btn-sm"
											>
												{obj.status === 1 ? "View Progress" : (obj.status === 2 ? "Read Article" : "View Error")}
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{props.articles.results.length === 0 && (
							<div className="text-center py-16 px-6">
								<svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								<h3 className="mt-2 text-lg font-medium text-neutral-800">No articles generated yet</h3>
								<p className="mt-1 text-sm text-neutral-500">Get started by creating your first educational article.</p>
								<div className="mt-6">
									<a href="/create" className="btn btn-primary">
										Create New Article
									</a>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// --- CreateArticle Component ---
export const CreateArticle: FC<{ formData?: { topic: string } }> = (props) => {
	const defaultTopic = props.formData?.topic || "";
	return (
		<div className="container mx-auto max-w-3xl px-4">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-semibold text-neutral-900">
					Generate New Educational Article
				</h2>
				<a href="/" className="btn btn-secondary btn-sm flex items-center space-x-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
					</svg>
					<span>Back to List</span>
				</a>
			</div>
			<div className="card">
				<div className="card-body">
					<form
						className="space-y-6"
						action="/create"
						method="post"
					>
						<div className="space-y-2">
							<label htmlFor="article-topic" className="block text-sm font-medium text-neutral-700">
								Article Topic
							</label>
							<textarea
								id="article-topic"
								name="topic"
								className="w-full min-h-24 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-base"
								required={true}
								placeholder="Enter the topic for the educational article (e.g., 'Effective Classroom Management Strategies for High School', 'Integrating Technology in the Elementary Curriculum', 'Understanding Differentiated Instruction')"
								defaultValue={defaultTopic}
							></textarea>
							<p className="text-xs text-neutral-500">Be specific for better results. The AI will research this topic using Google Search.</p>
						</div>

						<div className="pt-2 flex justify-end">
							<button type="submit" className="btn btn-primary w-full sm:w-auto">
								Generate Article
							</button>
						</div>
					</form>
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
			<div className="card">
				<div className="card-body">
					{/* Header */}
					<div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
						<h3 className="text-lg font-medium text-neutral-500">
							Educational Article
						</h3>
						<a href="/" className="btn btn-secondary btn-sm flex items-center space-x-1">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
								<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
							</svg>
							<span>Back to List</span>
						</a>
					</div>

					{/* Title */}
					<h1 className="report text-3xl font-bold text-neutral-900 mb-8 text-center">{props.article.topic}</h1>

					{/* Content Area */}
					<div className="space-y-8">
						{/* Status 1: Loading State */}
						{props.article.status === 1 && (
							<div className="flex flex-col items-center justify-center py-16 px-4 space-y-5 bg-gradient-to-br from-blue-50 to-primary-50 rounded-lg border border-primary-100">
								{/* Loading indicators */}
								<div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
									<svg xmlns="http://www.w3.org/2000/svg" className="animate-pulse w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-primary-800 text-center">Crafting your article...</h3>
								<div className="w-full max-w-md bg-white rounded-full h-2.5 mt-2 border border-primary-200 overflow-hidden">
									<div className="loading-bar bg-primary-500 h-full rounded-full w-[0%] transition-all duration-1000 ease-linear"></div>
								</div>
								<div className="text-sm text-primary-700 flex items-center">
									<svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span id="status-text">Gathering information & writing...</span>
								</div>
								<div className="text-xs text-neutral-500 max-w-md text-center mt-3">
									This usually takes 30-60 seconds. The page will update automatically when ready.
								</div>
								<script dangerouslySetInnerHTML={{ // Polling script
									__html: `
                                    const loadingBar = document.querySelector('.loading-bar'); let width = 0; const maxWidth = 95; const duration = 60000; const interval = 500; const increment = (maxWidth / (duration / interval));
                                    const loadingInterval = setInterval(() => { if (width < maxWidth) { width = Math.min(width + increment, maxWidth); if(loadingBar) loadingBar.style.width = width + '%'; } }, interval);
                                    const articleId = "${props.article.id}"; const statusText = document.getElementById('status-text');
                                    const pollingInterval = setInterval(async () => { try { const response = await fetch(\`/api/article-status/\${articleId}\`); if (!response.ok) throw new Error('Status check failed'); const data = await response.json(); if (data.completed && data.hasContent) { if (loadingBar) loadingBar.style.width = '100%'; if (statusText) statusText.textContent = 'Article complete! Reloading...'; clearInterval(pollingInterval); clearInterval(loadingInterval); setTimeout(() => { window.location.reload(); }, 1000); } else if (data.status === 3) { if (statusText) statusText.textContent = 'Error generating article. Reloading...'; clearInterval(pollingInterval); clearInterval(loadingInterval); setTimeout(() => { window.location.reload(); }, 1500); } } catch (error) { console.error('Error polling status:', error); } }, 3000);
                                    window.addEventListener('beforeunload', () => { clearInterval(pollingInterval); clearInterval(loadingInterval); });
                                    `
								}}></script>
							</div>
						)}

						{/* Status 2 or 3: Render Parsed HTML */}
						{(props.article.status === 2 || props.article.status === 3) && (
							<div
								className="report prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-primary-600 hover:prose-a:text-primary-700"
								// Correctly render raw HTML
								dangerouslySetInnerHTML={{ __html: props.article.articleHtml }}
							/>
						)}

						{/* Status 2: Show Sources */}
						{props.article.status === 2 && sources.length > 0 && (
							<div className="sources-section">
								<h2>Sources</h2>
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
													{source.title || "Source Link"}
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
					</div>
				</div>
			</div>
		</div>
	);
};

// --- ValidationErrorDisplay Component ---
export const ValidationErrorDisplay: FC<{ errors: string[] }> = (props) => {
	if (!props.errors || props.errors.length === 0) return null;
	return (
		<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative mb-6" role="alert">
			<strong className="font-semibold">Validation Error!</strong>
			<ul className="mt-2 list-disc list-inside text-sm">
				{props.errors.map((error, index) => (
					<li key={index}>{error}</li>
				))}
			</ul>
		</div>
	);
};