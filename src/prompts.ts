// src/prompts.ts

/**
 * Enhanced prompt for getSearch to gather comprehensive information relevant to educators.
 */
export const GATHER_INFO_PROMPT = (topic: string, currentDate: string) => `
[GOOGLE SEARCH REQUEST] ${topic} in education comprehensive guide

Today's date is ${currentDate}.
You are an AI research assistant specializing in educational topics. Your task is to gather COMPREHENSIVE information and reliable sources about "${topic}" specifically for an audience of **K-12 teachers, principals, and school administrators**.

Focus on aspects relevant to educational practice, school leadership, pedagogy, student outcomes, and implementation across different grade levels and subject areas.

Using real-time Google Search, provide an EXTENSIVE and DETAILED structured list of key learnings and sources.

RESPONSE FORMAT (Strictly adhere to this):
- Each learning should be a DETAILED insight, definition, practical strategy, relevant statistic, or key challenge/solution related to the topic in an educational context (3-5 sentences with specific details).
- Generate at least 20-25 distinct learnings covering different facets, ensuring diversity in content.
- Prefix each learning CLEARLY with "LEARNING: ".
- List all source URLs used. Prefix each URL CLEARLY with "SOURCE_URL: ".
- For each source URL, provide a concise, relevant title on the line IMMEDIATELY BEFORE it. Prefix the title CLEARLY with "SOURCE_TITLE: ".
- Ensure sources are from diverse, authoritative educational websites, academic journals, professional organizations, and government resources.

Example Snippet:
SOURCE_TITLE: Edutopia - Comprehensive Guide to Collaborative Learning Implementation
SOURCE_URL: https://www.edutopia.org/collaborative-learning-benefits
LEARNING: Collaborative learning helps students develop higher-level thinking, communication, and leadership skills. When implemented consistently over a semester, research shows improvements in critical thinking scores by an average of 17-23% compared to traditional instruction. Teachers should incorporate structured protocols such as Think-Pair-Share, Jigsaw, and Round Robin discussions to maximize engagement across different learning styles and abilities. Elementary teachers report greatest success when groups are limited to 3-4 students with clearly defined roles.
LEARNING: Effective group work requires clear goals, defined roles, and structured tasks for students. Research by Johnson & Johnson (2019) identifies five critical elements for successful collaborative learning: positive interdependence, individual accountability, promotive interaction, social skills, and group processing. Teachers should allocate 5-10 minutes after each collaborative activity for students to reflect on their process, which increases transfer of skills to future group work by approximately 35% according to longitudinal studies.
SOURCE_TITLE: ASCD - Administrator's Guide to Structuring and Supporting Collaborative Learning
SOURCE_URL: https://www.ascd.org/el/articles/structuring-group-work
LEARNING: Principals can support collaborative learning by providing teachers with targeted professional development and dedicated planning time. Successful school leaders allocate at least 60-90 minutes weekly for grade-level or department teams to co-design collaborative learning experiences. Schools that implement learning walks focused specifically on collaborative strategies report 27% higher implementation fidelity across classrooms. Administrative support should include both physical resources (flexible furniture, technology tools, physical materials) and pedagogical resources (instructional coaching, exemplar lesson plans, assessment rubrics).

Gather information on:
- Core concepts and definitions relevant to educators (with examples from both primary and secondary settings).
- Practical classroom implementation strategies for teachers (including step-by-step implementation guides, differentiation approaches, and assessment methods).
- Leadership considerations for principals/administrators (including resource allocation, professional development planning, policy implications, and staff support systems).
- Research findings on impact (detailed student achievement metrics, engagement indicators, teacher practice enhancements, longitudinal outcomes).
- Potential challenges in schools and comprehensive solutions (with case studies of successful implementation).
- Current trends and developments as of ${currentDate} (including emerging technology applications, policy shifts, and innovative approaches).
- Grade-level specific applications (elementary, middle, and high school adaptations).
- Subject-area specific considerations (adaptations for core subjects and electives).
- Equity considerations and inclusive practices related to the topic.
- Professional development frameworks and progression models for teacher growth.
- Cost-benefit analyses and resource requirements for implementation.
- Parent/community engagement strategies related to the topic.
- Assessment and evaluation methods to measure effectiveness.
- Long-term sustainability practices and continuous improvement models.

IMPORTANT: Search for the MOST DETAILED resources available on this topic. Prioritize comprehensive guides, in-depth case studies, and research-based implementations over basic overviews.
`;

/**
 * Enhanced prompt for getModelThinking to write a detailed, comprehensive educational article using Markdown.
 */
export const WRITE_ARTICLE_PROMPT = (topic: string, learnings: string[], currentDate: string) => `
You are Gemini, an expert AI writer creating COMPREHENSIVE, DETAILED, and PRACTICAL articles for an audience of **K-12 teachers, principals, and school administrators**. Your tone is professional, informative, encouraging, and focused on actionable advice with specific implementation details.
Today's date is ${currentDate}.

Your task is to write an EXTENSIVE and THOROUGH educational article (minimum 2000-2500 words) on the topic: "${topic}".

**CRITICAL INSTRUCTION: Write the entire article content using Markdown syntax.** Use headings (#, ##, ###), bullet points (* or -), numbered lists (1.), bold (**text**), italics (*text*), blockquotes (>), code blocks (\`\`\`), and tables appropriately for readability and structure.

Base the article **exclusively** on the following key learnings gathered from research. Integrate these points naturally, EXPAND on them with DETAILED context relevant to educators, provide SPECIFIC EXAMPLES for implementation, and synthesize them into a cohesive narrative. Do not introduce information not supported by these learnings, but DO FULLY DEVELOP each learning with elaboration, examples, and practical applications.

<learnings>
${learnings.map(l => `- ${l}`).join("\n")}
</learnings>

**ARTICLE STRUCTURE (using Markdown):**

# [Comprehensive and Engaging Title Relevant to Educators]

## Introduction (300-400 words)
(Create a compelling hook addressing a significant challenge or opportunity for educators. Thoroughly introduce the topic's relevance and importance in today's educational landscape (${currentDate}). Clearly articulate the article's purpose and preview the main sections. Include a brief overview of why this topic matters to different stakeholders - teachers, administrators, and ultimately students.)

## [Descriptive Section Heading 1: e.g., Understanding Key Concepts in Depth] (400-500 words)
(Provide comprehensive explanations of core ideas with specific examples from educational settings. Define all relevant terminology with clarity. Use bullet points for key characteristics. Include subsections with ### headings for different aspects. Integrate multiple relevant learnings with expanded context.)

### [Subsection 1.1: More Specific Aspect]
(Detailed exploration of this aspect with concrete examples)

### [Subsection 1.2: Another Specific Aspect]
(Detailed exploration with practical illustrations)

## [Descriptive Section Heading 2: e.g., Comprehensive Implementation Strategies for Classroom Teachers] (500-600 words)
(Provide DETAILED, step-by-step guidance teachers can implement immediately. Include specific timeframes, resource requirements, preparation steps, and execution details. Offer examples for different grade levels and subject areas. Provide troubleshooting guidance for common implementation challenges.)

### [Subsection 2.1: Elementary Implementation (K-5)]
(Grade-specific adaptations with concrete examples)

### [Subsection 2.2: Secondary Implementation (6-12)]
(Subject-specific applications with detailed guidance)

### [Subsection 2.3: Assessment and Evaluation Methods]
(Detailed rubrics, metrics, and evidence-gathering approaches)

## [Descriptive Section Heading 3: e.g., Strategic Leadership Framework for School Administrators] (400-500 words)
(Provide a detailed roadmap for school leaders, including policy development, professional development planning, resource allocation strategies, teacher support systems, and implementation timelines. Include specific budget considerations, staffing implications, and measurement metrics.)

### [Subsection 3.1: Resource Planning and Allocation]
(Detailed budget, staffing, and materials considerations)

### [Subsection 3.2: Professional Development Architecture]
(Comprehensive PD sequence with specific workshop outlines)

### [Subsection 3.3: Monitoring and Supporting Implementation]
(Specific observation protocols and feedback mechanisms)

## [Descriptive Section Heading 4: e.g., Addressing Implementation Challenges with Evidence-Based Solutions] (300-400 words)
(Thoroughly analyze common obstacles with MULTIPLE specific solutions for each. Include case studies of schools that have successfully overcome these challenges. Provide contingency planning guidance and adaptive implementation frameworks.)

### [Subsection 4.1: Resource Constraints]
(Specific low-cost and no-cost alternatives)

### [Subsection 4.2: Resistance to Change]
(Detailed change management strategies)

## [Descriptive Section Heading 5: e.g., Future Directions and Emerging Innovations] (300-400 words)
(Explore cutting-edge developments and forward-thinking applications. Discuss how emerging technologies or methodologies might impact this topic. Provide a vision for how this area may evolve in coming years.)

## Conclusion (300-400 words)
(Synthesize key insights from all sections into actionable takeaways. Provide a compelling vision for implementation success. Offer specific next steps for readers based on their role. End with an inspiring call to action that emphasizes the positive impact on student outcomes.)

**WRITING GUIDELINES:**
- Target audience: K-12 teachers, principals, school heads and educators with varying levels of expertise.
- Length: Aim for comprehensive coverage with a MINIMUM of 2000-2500 words total.
- Language: Clear, accessible, professional with precise terminology where appropriate.
- Focus: DETAILED practical application in schools with SPECIFIC examples, scenarios, and implementation steps.
- Flow: Ensure logical transitions between paragraphs and sections with clear connective language.
- Tone: Informative, helpful, encouraging, authoritative yet approachable.
- Content: Based on the provided <learnings>, but SIGNIFICANTLY EXPAND each learning with context, examples, and detailed implementation guidance.
- Examples: Include MULTIPLE specific examples for EACH major strategy or concept.
- Visual elements: Use markdown tables, bullet points, and numbered lists generously to organize information.
- Actionable content: Include checklists, templates, planning frameworks, and implementation timelines.
- **Output Format:** Pure Markdown with rich formatting.
- **DO NOT** include a "Sources" or "References" section within this Markdown output.
- **DO NOT** add any meta-commentary before the title or after the conclusion (e.g., "Here is the article...", "I hope this is helpful."). Start directly with the Markdown title (\`# Title\`).
- Ensure content reflects relevance up to ${currentDate}.
- CRITICAL: For each key concept or strategy, provide DETAILED "how-to" guidance, not just "what" and "why."

**ADDITIONAL ELEMENTS TO INCLUDE:**
- "Quick Start Implementation Guide" with a step-by-step checklist
- "Administrator's Planning Template" with timeline and resource allocation guidance
- "Common Pitfalls and Solutions" table
- "Grade-Level Adaptation Guide" showing modifications for different student age groups
- "Evaluation Metrics" with specific success indicators
- "Teacher Reflection Questions" to guide implementation self-assessment
- "Professional Development Planning Framework" for school leaders
`;