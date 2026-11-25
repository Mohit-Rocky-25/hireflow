// ============================================================
// ATS Resume Roaster — Bullet Analyzer (Stage 3)
// Evaluates individual resume bullet quality, metrics, and verbs
// ============================================================

import actionVerbsData from '../knowledge/action-verbs.json';
import { BulletAnalysis } from './types';
import { extractMetricsFromText, MetricExtractionContext } from './metricExtractor';
import { detectStatementPolarity } from './statementExtractor';

const STRONG_VERBS = new Set((actionVerbsData.strongVerbs as string[]).map(v => v.toLowerCase()));
const WEAK_PHRASES = (actionVerbsData.weakPhrases as string[]).map(p => p.toLowerCase());

export function analyzeBullet(rawText: string, context?: MetricExtractionContext): BulletAnalysis {
  const trimmed = rawText.replace(/^(?:[*\-•▪●]+\s*|\d+[.)]\s+)+/, '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      rawText,
      wordCount: 0,
      hasStrongVerb: false,
      hasWeakPhrase: false,
      hasMetric: false,
      hasTechMention: false,
      score: 0,
      issues: ['Empty bullet point'],
    };
  }

  const lowerText = trimmed.toLowerCase();
  const issues: string[] = [];

  // 1. First word strong verb check
  const firstWord = words[0].toLowerCase().replace(/[^a-z-]/g, '');
  const hasStrongVerb = STRONG_VERBS.has(firstWord);
  let strongVerbMatched: string | undefined = undefined;

  if (hasStrongVerb) {
    strongVerbMatched = words[0];
  } else {
    // Check if a strong verb appears in the first 2 words
    const secondWord = words[1]?.toLowerCase().replace(/[^a-z-]/g, '');
    if (secondWord && STRONG_VERBS.has(secondWord)) {
      strongVerbMatched = words[1];
    } else {
      issues.push(`Lacks decisive engineering action verb at opening (starts with "${words[0]}")`);
    }
  }

  // 2. Weak phrase check
  let hasWeakPhrase = false;
  let weakPhraseMatched: string | undefined = undefined;
  for (const phrase of WEAK_PHRASES) {
    if (lowerText.includes(phrase)) {
      hasWeakPhrase = true;
      weakPhraseMatched = phrase;
      issues.push(`Contains passive or duty-oriented phrasing: "${phrase}"`);
      break;
    }
  }

  // 2B. Cliché verb check (Mild flag)
  const CLICHE_VERBS = ['utilized', 'leveraged', 'handled', 'participated', 'worked with', 'assisted'];
  let hasClichéVerb = false;
  let clichéVerbMatched: string | undefined = undefined;
  for (const cv of CLICHE_VERBS) {
    if (lowerText.startsWith(cv) || lowerText.includes(` ${cv} `)) {
      hasClichéVerb = true;
      clichéVerbMatched = cv;
      issues.push(`Contains clichéd or generic action verb: "${cv}" (use specific engineering verbs like "Engineered", "Architected", "Refactored")`);
      break;
    }
  }

  // 3. Structured Metric Intelligence check & plausibility flag (Phase 09 + Phase 10.3/10.4 Negation/Aspirational Wiring)
  const polarity = detectStatementPolarity(trimmed);
  const allNonActiveClauses =
    polarity.clausePolarities.length > 0
      ? polarity.clausePolarities.every(
          (c) => c.isNegated || c.negationSentiment === 'LEARNING' || c.negationSentiment === 'ASPIRATIONAL'
        )
      : polarity.allClausesNegated || polarity.negationSentiment === 'LEARNING' || polarity.negationSentiment === 'ASPIRATIONAL';
  const effectiveIsNegated = context?.isNegated ?? allNonActiveClauses;
  const metricEvidences = extractMetricsFromText(trimmed, {
    ...context,
    isNegated: effectiveIsNegated,
  });

  if (context?.isNegated === undefined && !allNonActiveClauses && polarity.clausePolarities.some((c) => c.isNegated || c.negationSentiment === 'LEARNING' || c.negationSentiment === 'ASPIRATIONAL')) {
    for (const m of metricEvidences) {
      if (typeof m.sourceStart === 'number') {
        const clause = polarity.clausePolarities.find(
          (c) => m.sourceStart! >= c.start && m.sourceStart! < c.end
        );
        if (clause && (clause.isNegated || clause.negationSentiment === 'LEARNING' || clause.negationSentiment === 'ASPIRATIONAL')) {
          m.claimSupport = 'NEGATED';
        }
      }
    }
  }

  const validPositiveMetrics = metricEvidences.filter(
    (m) => m.polarity !== 'NEGATIVE' && Boolean(m.unit) && m.extractionConfidence >= 0.5 && m.claimSupport !== 'NEGATED'
  );
  const hasMetric = validPositiveMetrics.length > 0;
  const primaryValidMetric = validPositiveMetrics[0];
  const primaryMetric = primaryValidMetric || metricEvidences[0];
  const metricMatched = primaryValidMetric ? primaryValidMetric.sourceQuote : undefined;
  let plausibilityWarning: string | undefined = undefined;

  if (!hasMetric) {
    if (metricEvidences.some((m) => m.claimSupport === 'NEGATED')) {
      issues.push('Metric appears in a negated or non-active statement and cannot be credited');
    } else if (metricEvidences.some((m) => m.polarity === 'NEGATIVE')) {
      issues.push('Metric describes a negative or worsening outcome rather than a positive engineering improvement');
    } else {
      issues.push('Missing measurable outcome or quantifiable scale metric (%, numbers, latency, users)');
    }
  } else {
    for (const m of validPositiveMetrics) {
      if (m.unit === '%' && (m.value ?? 0) > 300 && m.changeType !== 'SPEEDUP_RATIO') {
        plausibilityWarning = `Metric "${m.sourceQuote}" represents an extreme claim (>300%). Prepare verifiable baseline benchmarks for technical interviews.`;
        break;
      }
    }
  }

  // 4. Length check (12 to 28 words recommended per Stage 6)
  if (wordCount < 12) {
    issues.push(`Too brief (${wordCount} words; 12–28 recommended) — expand on the architectural context and result`);
  } else if (wordCount > 28) {
    issues.push(`Overly verbose (${wordCount} words; 12–28 recommended) — break into focused single-achievement bullets`);
  }

  // 5. Multi-idea heuristic (more than one idea joined by also / additionally)
  if (/\b(?:also|additionally|as well as|and also)\b/i.test(trimmed) && trimmed.split(/[,;]/).length >= 3) {
    issues.push('Multiple disjoint ideas detected in one bullet — focus on one key accomplishment per bullet');
  }

  // 6. Tech mention heuristic
  const hasTechMention = /\b[A-Z][a-zA-Z0-9+#.]+\b/.test(trimmed);

  // 7. Outcome heuristic (do not credit purely non-active/negated or negative-metric-only bullets)
  const onlyNegativeOrNegatedMetrics =
    metricEvidences.length > 0 &&
    !hasMetric &&
    metricEvidences.every((m) => m.polarity === 'NEGATIVE' || m.claimSupport === 'NEGATED');
  const hasOutcome =
    hasMetric ||
    (!allNonActiveClauses &&
      !onlyNegativeOrNegatedMetrics &&
      /\b(?:resulting in|leading to|enabling|improving|decreasing|increasing|reducing|boosting|to achieve|to prevent|saving)\b/i.test(
        trimmed
      ));

  // 8. Keyword dump heuristic (3+ tech capitalized words with no strong verb or outcome)
  const techCapitalizedMatches = trimmed.match(/\b[A-Z][a-zA-Z0-9+#.]+\b/g) || [];
  const isKeywordDump = techCapitalizedMatches.length >= 3 && !hasStrongVerb && !hasOutcome;
  if (isKeywordDump) {
    issues.push('Keyword dump detected: multiple tools listed without an engineering action or outcome');
  }

  // Calculate 0-100 Quality Score across 4 criteria (Sum = exactly 100)
  const actionVerbScore = (hasStrongVerb || strongVerbMatched) ? 20 : 0;
  const metricScore = hasMetric ? 30 : 0;
  const techScore = isKeywordDump ? 5 : hasTechMention ? 25 : 0;
  const outcomeScore = hasOutcome ? 25 : 0;

  let rawScore = actionVerbScore + metricScore + techScore + outcomeScore;
  let deduction = 0;
  if (hasWeakPhrase) deduction += 15;
  if (wordCount < 8) deduction += 15;
  else if (wordCount < 12) deduction += 5;
  if (wordCount > 35) deduction += 10;
  else if (wordCount > 28) deduction += 5;

  const score = Math.max(0, Math.min(100, rawScore - deduction));

  return {
    rawText: trimmed,
    wordCount,
    hasStrongVerb: Boolean(hasStrongVerb || strongVerbMatched),
    strongVerb: strongVerbMatched,
    hasWeakPhrase,
    weakPhrase: weakPhraseMatched,
    hasClichéVerb,
    clichéVerbMatched,
    hasMetric,
    metricMatched,
    metricEvidences,
    primaryMetricCategory: primaryMetric?.metricCategory,
    metricAttribution: primaryMetric?.attribution,
    isNegated: polarity.isNegated,
    negationSentiment: polarity.negationSentiment,
    hasTechMention,
    isKeywordDump,
    score,
    issues,
    plausibilityWarning,
    breakdown: {
      actionVerbScore,
      metricScore,
      techScore,
      outcomeScore,
      deduction,
      total: score,
    },
  };
}
