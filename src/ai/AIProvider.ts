// ============================================================
// HireFlow — AI Provider Abstraction Layer
// Allows swapping LLM providers without touching application code
// Implements LocalAIProvider (deterministic, no API cost)
// Environment configuration:
//   LocalAIProvider is the default (deterministic, zero client API key exposure).
//   Backend LLM keys (GEMINI_API_KEY) are server-only and must never be exposed via VITE_ prefixes.
// ============================================================

export interface ExtractionResult<T> {
  data: T;
  confidence: number;      // 0-1
  method: 'keyword' | 'semantic' | 'explicit' | 'inferred';
  evidence?: string;
}

export interface AIGenerationResult {
  text: string;
  modelUsed: string;
  latencyMs: number;
  tokenEstimate?: number;
}

export interface AIEmbeddingResult {
  embedding: number[];
  modelUsed: string;
  dimensions: number;
}

export interface AIClassificationResult {
  label: string;
  confidence: number;
  alternativeLabels?: { label: string; confidence: number }[];
}

export interface AIProvider {
  readonly name: string;
  readonly version: string;
  readonly isLocal: boolean;

  /**
   * Generate text from a prompt.
   * Never use for arithmetic or database filtering — use structured logic first.
   */
  generate(
    promptTemplate: string,
    variables: Record<string, string>,
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<AIGenerationResult>;

  /**
   * Generate embeddings for text.
   * Use for semantic similarity, not for hard filtering.
   */
  embed(text: string): Promise<AIEmbeddingResult>;

  /**
   * Extract structured data from unstructured text.
   * Falls back to deterministic parsing if AI unavailable.
   */
  extract<T>(
    text: string,
    schema: string,
    context?: string
  ): Promise<ExtractionResult<T>>;

  /**
   * Classify text into a category.
   */
  classify(
    text: string,
    categories: string[],
    context?: string
  ): Promise<AIClassificationResult>;
}

// ── Prompt Template Registry ──
// All prompts are versioned and stored here, NOT scattered in components
export const PROMPT_TEMPLATES = {
  resume_extraction_v1: `
Extract structured information from the following resume text.
Return structured data including: skills mentioned, years of experience per skill, 
employment history with dates and companies, education, projects with technologies used, 
and certifications. For each skill, find the supporting evidence text.

Resume text:
{{resume_text}}
  `.trim(),

  job_analysis_v1: `
Analyze the following job description and extract:
1. Inferred role/occupation
2. Inferred seniority level (intern/junior/mid/senior/staff/principal/lead)
3. Mandatory skills (explicitly required)
4. Preferred skills (nice to have)
5. Minimum years of experience
6. Education requirements
7. Any unrealistic or contradictory requirements
8. Overall requirement clarity score (1-10)

Job description:
{{job_description}}
  `.trim(),

  interview_generation_v1: `
Based on the following candidate skill gaps and job requirements, generate targeted interview questions.
For each question explain what it tests, what evidence would be a strong signal, and what would be a weak signal.

Skill gaps:
{{skill_gaps}}

Job requirements:
{{job_requirements}}
  `.trim(),

  skill_resolution_v1: `
Given the following skill text extracted from a resume, identify:
1. The canonical normalized skill name
2. Confidence that this matches the skill
3. Related skills this evidence may imply

Skill text: "{{skill_text}}"
  `.trim(),

  candidate_analysis_v1: `
Given the following candidate profile and job requirements, provide an evidence-based assessment.
For each requirement, state:
- Whether evidence was found (with the exact text)
- Whether evidence was NOT found (never fabricate)
- Whether a related skill provides partial evidence
- Recruiter action recommended

Candidate Profile:
{{candidate_profile}}

Job Requirements:
{{job_requirements}}
  `.trim(),

  assessment_generation_v1: `
Generate assessment questions for the following role and skill gaps.
For each question specify:
- Type (mcq/coding/open/system_design)
- What skill it tests
- The difficulty level
- For MCQ: options and correct answer
- For coding: sample test cases
- Expected evidence of competency

Role: {{role}}
Skill Gaps: {{skill_gaps}}
  `.trim(),
} as const;

export type PromptTemplateKey = keyof typeof PROMPT_TEMPLATES;

// ── Local AI Provider (Deterministic, no API cost) ──
// This provider uses the knowledge base and structured rules.
// It produces explainable, deterministic results.
// A real LLM provider adds nuance on top — it does NOT replace this.
export class LocalAIProvider implements AIProvider {
  readonly name = 'LocalAI';
  readonly version = '1.0.0';
  readonly isLocal = true;

  async generate(
    promptTemplate: string,
    variables: Record<string, string>
  ): Promise<AIGenerationResult> {
    // In local mode, we return structured template responses
    // In production, this calls the real LLM API
    const start = Date.now();
    const text = promptTemplate.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => variables[key] || `[${key}]`
    );
    return {
      text: `[LocalAI] ${text.substring(0, 200)}...`,
      modelUsed: 'local-rules-v1',
      latencyMs: Date.now() - start,
    };
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    // Deterministic pseudo-embedding using character frequency
    // In production, replace with real embedding API
    const dims = 128;
    const embedding = new Array(dims).fill(0).map((_, i) => {
      return (text.charCodeAt(i % text.length) / 255) * 2 - 1;
    });
    return {
      embedding,
      modelUsed: 'local-pseudo-embed-v1',
      dimensions: dims,
    };
  }

  async extract<T>(
    _text: string,
    _schema: string,
    _context?: string
  ): Promise<ExtractionResult<T>> {
    return {
      data: {} as T,
      confidence: 0,
      method: 'keyword',
      evidence: 'Local provider: use structured parsing',
    };
  }

  async classify(
    text: string,
    categories: string[]
  ): Promise<AIClassificationResult> {
    // Simple longest-match classification
    const textLower = text.toLowerCase();
    const scores = categories.map(cat => ({
      label: cat,
      confidence: textLower.includes(cat.toLowerCase()) ? 0.7 : 0.1,
    }));
    scores.sort((a, b) => b.confidence - a.confidence);
    return {
      label: scores[0]?.label ?? categories[0],
      confidence: scores[0]?.confidence ?? 0.1,
      alternativeLabels: scores.slice(1, 3),
    };
  }
}

// ── Provider Factory ──
let _providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_providerInstance) return _providerInstance;

  const providerName = (import.meta as any).env?.VITE_AI_PROVIDER ?? 'local';

  switch (providerName) {
    case 'gemini':
      // Future: import GeminiAIProvider and construct with API key
      console.warn('[AIProvider] Gemini provider requested but not yet implemented. Falling back to local.');
      break;
    case 'openai':
      // Future: import OpenAIProvider and construct with API key
      console.warn('[AIProvider] OpenAI provider requested but not yet implemented. Falling back to local.');
      break;
    default:
      break;
  }

  _providerInstance = new LocalAIProvider();
  return _providerInstance;
}

// ── AI Failure Handling ──
// Per spec: "AI failure must never destroy the application flow"
export async function safeAICall<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
): Promise<{ result: T; failed: boolean; errorMessage?: string }> {
  try {
    const result = await operation();
    return { result, failed: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown AI error';
    console.error(`[AI Failure] ${context}:`, msg);
    return {
      result: fallback,
      failed: true,
      errorMessage: `Analysis temporarily unavailable. ${msg}`,
    };
  }
}
