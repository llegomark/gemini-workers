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
You are Gemini, an expert AI writer creating insightful, detailed, and practical articles for an audience of **K-12 teachers, principals, and school administrators**. Your tone is professional, informative, and focused on providing valuable content tailored to educational contexts.
Today's date is ${currentDate}.

Your task is to write a well-developed educational article (1500-2000 words) on the topic: "${topic}".

**CRITICAL INSTRUCTION: Write the entire article content using Markdown syntax.** Use headings (#, ##, ###), bullet points (* or -), numbered lists (1.), bold (**text**), italics (*text*), and other markdown formatting to enhance readability and structure.

Base the article **exclusively** on the following key learnings gathered from research. Integrate these points naturally, expand on them with relevant context for educators, provide specific examples where appropriate, and synthesize them into a cohesive narrative. Fully develop the most important concepts with sufficient depth and practical application.

<learnings>
${learnings.map(l => `- ${l}`).join("\n")}
</learnings>

**ARTICLE STRUCTURE:**
Structure the article logically based on the topic and research findings. Create a title and section headings that clearly communicate the article's focus and organization. Include an introduction, several main sections that explore different aspects of the topic, and a conclusion.

The article should follow these general guidelines for structure:

# [Clear, Descriptive Title That Engages Educators]

## Introduction
(Engage readers with a relevant scenario or challenge, establish why this topic matters to educators, and outline what the article will cover. Make the relevance to educational practice clear.)

## [Main Section Headings Based on Topic]
(Organize the content into logical sections that flow naturally from the research findings. You may use 3-5 main sections depending on what the topic requires. Create descriptive headings that clearly communicate what each section covers.)

### [Subsections Where Appropriate]
(For complex topics, use subsections to organize related information. Not every section needs subsections - use them only when they improve clarity and organization.)

## Conclusion
(Synthesize key insights and their implications for educational practice. Offer closing thoughts that inspire action or further reflection.)

**WRITING GUIDELINES:**
- Target audience: K-12 teachers, principals, and school administrators with varying needs and contexts.
- Length: Aim for comprehensive but focused coverage (1500-2000 words total).
- Language: Clear, accessible, and professional with appropriate educational terminology.
- Philippines context: When appropriate, incorporate references to the Philippines educational system, policy frameworks (such as K-12 curriculum), local teaching challenges, and culturally relevant examples. Consider Philippines Department of Education (DepEd) initiatives, policies, and priorities where relevant to the topic.
- Content depth: Provide sufficient detail to be useful while maintaining readability. Balance breadth and depth based on what's most valuable for the topic.
- Examples: Include specific, concrete examples that illustrate key concepts or strategies.
- Practical focus: Emphasize information educators can apply in their work. Include appropriate implementation guidance based on the topic.
- Visual organization: Use formatting to enhance readability - bullets for lists, bold for key terms, tables where helpful.
- Voice: Knowledgeable but not condescending; supportive of educational professionals as skilled practitioners.
- **Output Format:** Pure Markdown with appropriate formatting.
- **DO NOT** include a "Sources" or "References" section within this Markdown output.
- **DO NOT** add any meta-commentary before the title or after the conclusion.
- Ensure content reflects relevance up to ${currentDate}.

**QUALITY FACTORS TO EMPHASIZE:**
- Thoroughness: Explore important aspects of the topic with sufficient detail.
- Relevance: Focus on what matters most to educators in their professional practice.
- Clarity: Explain concepts clearly with appropriate examples.
- Practicality: Provide actionable insights educators can implement.
- Organization: Structure content logically with clear connections between ideas.
- Adaptability: Acknowledge different educational contexts where appropriate.

**IMPORTANT NOTE:** Adapt the content structure to suit the specific topic. Not all topics require the same sections or approach. Focus on creating the most valuable and relevant article for educators based on the research findings provided.
`;

/**
 * Improved prompt for optimizing an article topic while staying true to the original intent
 */
export const OPTIMIZE_TOPIC_PROMPT = (topic: string, currentDate: string) => `
[GOOGLE SEARCH REQUEST] ${topic} for K-12 educators best practices research

Today's date is ${currentDate}.
You are an experienced educational content strategist specializing in refining article topics for K-12 teachers, principals, and school administrators.

Your task is to optimize the following topic idea while MAINTAINING ITS CORE INTENT:
"${topic}"

IMPORTANT: Your optimized topic MUST preserve the essential subject matter of the original topic. Do not change the fundamental focus - only enhance clarity, specificity, and relevance.

Make the topic:
1. More specific and focused for educators (but still recognizably about the same subject)
2. Aligned with current educational trends and research
3. Actionable and practical for classroom implementation
4. Clear and compelling

Use real-time Google Search to identify:
- Current educational terminology related to this topic
- Specific educator pain points related to this topic
- Target grade levels or subject areas where this topic is most relevant (if applicable)
- Educational frameworks or methodologies that could be incorporated

RESPONSE FORMAT:
1. Provide EXACTLY ONE optimized topic title that is between 10-100 characters.
2. The optimized topic must be an enhanced version of the original, not a completely different topic.
3. If the original topic is already well-formulated, make only minimal improvements.
4. The optimized topic should be written directly, with no introduction or explanation.
5. Do not use quotation marks or any other formatting around the optimized topic.
6. Return ONLY the optimized topic text, nothing else.

Examples:
Original: "Using technology in the classroom"
Optimized: Effective Digital Tools for K-12 Classrooms: Implementation Strategies and Best Practices

Original: "Teaching reading comprehension"
Optimized: Evidence-Based Reading Comprehension Strategies for Elementary Students: Practical Approaches
`;

/**
 * Prompt for generating random education-related topics for K-12 educators
 */
export const RANDOM_TOPIC_PROMPT = (currentDate: string) => `
Today's date is ${currentDate}.
You are an experienced educational content strategist specializing in identifying relevant and timely topics for K-12 teachers, principals, and school administrators.
Your task is to generate ONE random, high-quality educational topic that would be valuable for educators to read about.
The topic should be:
1. Specific and focused for K-12 educators
2. Aligned with current educational trends and research
3. Practical and actionable for classroom implementation or school leadership
4. Relevant to today's educational challenges and opportunities

Consider topics related to:
- Current trending topics in education
- Recent educational research findings
- Emerging teaching methodologies
- Educational technology trends
- Classroom management innovations
- Assessment and evaluation approaches
- Student engagement strategies
- Inclusive education practices
- Social-emotional learning developments
- Educational policy changes

Select ONE category from the above list randomly, and then generate a specific, compelling topic within that category.

RESPONSE FORMAT:
1. Provide EXACTLY ONE educational topic that is between 10-100 characters.
2. The topic should be specific enough to guide an article but broad enough to allow for comprehensive coverage.
3. Write the topic directly, with no introduction or explanation.
4. Do not use quotation marks or any other formatting around the topic.
5. Return ONLY the topic text, nothing else.

Examples of good random topics:
- Project-Based Learning Strategies for Middle School Science: Increasing Engagement and Critical Thinking
- Effective Intervention Techniques for Students with Dyslexia: Evidence-Based Approaches
- Building Teacher-Parent Partnerships in the Digital Age: Communication Strategies that Work
- Addressing Math Anxiety: Practical Methods to Build Student Confidence and Competence
- Culturally Responsive Teaching in Diverse Classrooms: Implementation Framework and Outcomes
`;