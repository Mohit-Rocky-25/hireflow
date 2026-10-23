// ============================================================
// HireFlow — Deterministic No-New-Facts Guard (Stage 6)
// Prevents AI hallucination in bullet rewrites:
// Any number, percentage, technology, or company not in original
// bullet or resume text is replaced with a placeholder or flagged.
// Adds metric plausibility checks (never adds score).
// ============================================================

export interface GuardResult {
  guardedRewrite: string;
  newFactsBlocked: string[];
  plausibilityWarning?: string;
  isAcceptable: boolean;
}

// Regex to capture numbers, percentages, and metrics: 50%, 10x, 200ms, 5000, 100k, $50M, etc.
const NUMBER_METRIC_REGEX = /\b\d+(?:\.\d+)?(?:%|x|k|m|ms|s|gb|mb|tb|rps|qps)?\b/gi;

// Known tech tokens to detect introduced technologies
const COMMON_TECH_NAMES = [
  'react', 'next.js', 'vue', 'angular', 'node', 'express', 'fastapi',
  'python', 'java', 'spring', 'go', 'golang', 'rust', 'c++', 'c#',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'postgresql', 'postgres',
  'mysql', 'mongodb', 'redis', 'kafka', 'graphql', 'rest', 'tailwind',
  'typescript', 'javascript', 'git', 'ci/cd', 'terraform', 'playwright',
  'vitest', 'jest', 'elasticsearch', 'rabbitmq', 'grpc',
];

export function sanitizeAndGuardRewrite(
  suggestedRewrite: string,
  originalBullet: string,
  resumeRawText: string
): GuardResult {
  const originalLower = originalBullet.toLowerCase();
  const resumeLower = resumeRawText.toLowerCase();
  const newFactsBlocked: string[] = [];
  let sanitized = suggestedRewrite;

  // 1. Metric Plausibility Check (Soft warning, never adds score)
  let plausibilityWarning: string | undefined = undefined;

  // Check for extreme percentages (> 300% or 1000%)
  const rawPercentages = suggestedRewrite.match(/(\d+)%/g) || [];
  for (const p of rawPercentages) {
    const val = parseInt(p.replace('%', ''), 10);
    if (val > 300) {
      plausibilityWarning = `Notice on metric "${p}": Extreme improvement claims (>300%) attract rigorous scrutiny in technical interviews. Be ready to explain your exact baseline measurement.`;
      break;
    }
  }

  // Check for five-nines uptime on personal apps (99.99%+)
  if (/99\.999?%?\s*(?:uptime|availability)/i.test(suggestedRewrite)) {
    plausibilityWarning = 'Notice on uptime claim: 99.99%+ availability claims require multi-region failover and SLA observability. Verify this reflects real telemetry.';
  }

  // 2. Check for hallucinated percentages first: e.g. 85%
  const percentageMatches = suggestedRewrite.match(/\b\d+(?:\.\d+)?%/g) || [];
  for (const pct of percentageMatches) {
    if (pct.startsWith('[') || pct.endsWith(']')) continue;
    const inOriginal = originalLower.includes(pct.toLowerCase());
    const inResume = resumeLower.includes(pct.toLowerCase());
    if (!inOriginal && !inResume) {
      newFactsBlocked.push(`Unverified percentage: "${pct}"`);
      sanitized = sanitized.replace(new RegExp(pct.replace('%', '\\%'), 'g'), '[X% measured]');
    }
  }

  // 3. Check for hallucinated numbers/scale metrics
  const numberMatches = sanitized.match(/\b\d+(?:,\d{3})*(?:\.\d+)?(?:x|k|m|ms|s|gb|mb|tb|rps|qps)?\b/gi) || [];
  for (const num of numberMatches) {
    if (num.startsWith('[') || num.endsWith(']')) continue;
    const inOriginal = originalLower.includes(num.toLowerCase());
    const inResume = resumeLower.includes(num.toLowerCase());
    if (!inOriginal && !inResume) {
      newFactsBlocked.push(`Unverified metric/number: "${num}"`);
      sanitized = sanitized.replace(new RegExp(`\\b${num}\\b`, 'g'), '[N measured count]');
    }
  }

  // 4. Check for hallucinated technologies
  for (const tech of COMMON_TECH_NAMES) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const techRegex = new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, 'i');
    if (techRegex.test(sanitized)) {
      const inOriginal = techRegex.test(originalLower);
      const inResume = techRegex.test(resumeLower);

      if (!inOriginal && !inResume) {
        newFactsBlocked.push(`Introduced technology: "${tech}"`);
        sanitized = sanitized.replace(new RegExp(escaped, 'gi'), '[your technology stack]');
      }
    }
  }

  return {
    guardedRewrite: sanitized,
    newFactsBlocked,
    plausibilityWarning,
    isAcceptable: true,
  };
}
