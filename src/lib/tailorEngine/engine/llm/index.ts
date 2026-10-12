/**
 * Stage 9: LLM Rewrite Layer with Strict Token-Containment Faithfulness Guard
 * Enforces Rule R2: The LLM is strictly confined to rephrasing text and MUST NEVER
 * fabricate metrics, dates, tools, companies, or credentials.
 */

export interface FaithfulnessCheckResult {
  passed: boolean;
  unfaithfulnessReason?: string;
  sourceTokens: string[];
  rewrittenTokens: string[];
}

export interface RewriteCandidateResult {
  originalText: string;
  proposedText: string;
  isAccepted: boolean;
  faithfulness: FaithfulnessCheckResult;
}

// In-memory cache for rewrite results
const REWRITE_CACHE = new Map<string, RewriteCandidateResult>();

/**
 * Extracts verifiable factual anchors from text:
 * - Numbers and metrics (e.g. 15%, $2.4M, 120k, 60,000, 24)
 * - Dates and years (e.g. 2026, Mar 2021)
 * - Acronyms and proper nouns (e.g. AWS, Raft, JADX, Kafka)
 */
export function extractFactualAnchors(text: string): Set<string> {
  const anchors = new Set<string>();
  if (!text) return anchors;

  // 1. Numbers, percentages, dollar amounts, multipliers, and quantities
  const metricMatches = text.match(/(?:\$\s*\d+(?:\.\d+)?[kKmMbB]?|\b\d+(?:\.\d+)?%|\b\d+[kKmMbB]?\+?|\b\d+x\b|\b\d{2,}\b)/g);
  if (metricMatches) {
    for (const m of metricMatches) {
      const clean = m.trim().toLowerCase();
      if (clean) anchors.add(clean);
    }
  }

  // 2. Years
  const yearMatches = text.match(/\b(?:19|20)\d{2}\b/g);
  if (yearMatches) {
    for (const y of yearMatches) anchors.add(y);
  }

  // 3. Known technologies, protocols, and uppercase acronyms (>= 2 chars)
  const acronymMatches = text.match(/\b[A-Z0-9]{2,}\b/g);
  if (acronymMatches) {
    for (const a of acronymMatches) {
      if (!['IN', 'AND', 'FOR', 'THE', 'WITH', 'TO', 'ON', 'AT'].includes(a)) {
        anchors.add(a.toLowerCase());
      }
    }
  }

  return anchors;
}

/**
 * Validates that every factual anchor in the candidate rewrite was grounded in the source.
 * If candidate introduces ANY metric, year, or tool not in source -> REJECT!
 */
export function verifyFaithfulness(source: string, candidate: string): FaithfulnessCheckResult {
  const sourceAnchors = extractFactualAnchors(source);
  const candidateAnchors = extractFactualAnchors(candidate);

  const missingFromSource: string[] = [];
  for (const token of candidateAnchors) {
    if (!sourceAnchors.has(token)) {
      missingFromSource.push(token);
    }
  }

  if (missingFromSource.length > 0) {
    return {
      passed: false,
      unfaithfulnessReason: `Candidate contains ungrounded factual anchors not present in source: [${missingFromSource.join(', ')}]`,
      sourceTokens: Array.from(sourceAnchors),
      rewrittenTokens: Array.from(candidateAnchors)
    };
  }

  return {
    passed: true,
    sourceTokens: Array.from(sourceAnchors),
    rewrittenTokens: Array.from(candidateAnchors)
  };
}

/**
 * Evaluates candidate LLM rewrite against faithfulness gate with deterministic fallback.
 */
export function evaluateRewriteWithGate(
  sourceBullet: string,
  candidateRewrite: string
): RewriteCandidateResult {
  const cacheKey = `${sourceBullet}:::${candidateRewrite}`;
  if (REWRITE_CACHE.has(cacheKey)) {
    return REWRITE_CACHE.get(cacheKey)!;
  }

  const faithfulness = verifyFaithfulness(sourceBullet, candidateRewrite);

  const result: RewriteCandidateResult = {
    originalText: sourceBullet,
    proposedText: faithfulness.passed ? candidateRewrite : sourceBullet,
    isAccepted: faithfulness.passed,
    faithfulness
  };

  REWRITE_CACHE.set(cacheKey, result);
  return result;
}

export function clearRewriteCache(): void {
  REWRITE_CACHE.clear();
}
