// ============================================================
// ATS Resume Roaster — Statement & Evidence Unit Extractor
// Detects atomic actions, technical context, negation, sentiment,
// candidate contribution, environment maturity, and metrics.
// ============================================================

import {
  CandidateContribution,
  CompetencyPolarity,
  EnvironmentMaturity,
  NegationSentiment,
  VerificationStatus,
} from './evidenceModel';
import { extractMetricsFromText } from './metricExtractor';
import type { MetricEvidence } from './metricModel';

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Token-boundary matcher supporting trailing sentence punctuation (e.g. "Kotlin.", "C++.", "Node.js.", "CI/CD.")
 * while blocking false substring/extension matches ("Node" in "Node.js", "Java" in "JavaScript", ".NET" in "ASP.NET", ".py", "c" in "c++").
 */
export function buildTokenRegex(term: string): RegExp {
  const escaped = escapeRegex(term);
  return new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])`, 'i');
}

// Action verbs classified by contribution level
const ARCHITECTURE_VERBS = [
  'architected',
  'designed',
  'spearheaded',
  'founded',
  'led',
  'orchestrated',
  'pioneered',
  'devised',
];

const DIRECT_IMPLEMENTATION_VERBS = [
  'built',
  'implemented',
  'developed',
  'engineered',
  'coded',
  'created',
  'authored',
  'optimized',
  'refactored',
  'integrated',
  'configured',
  'automated',
  'tuned',
  'provisioned',
  'deployed',
  'selected',
  'adopted',
  'migrated',
];

const OPERATIONAL_VERBS = [
  'maintained',
  'managed',
  'monitored',
  'supported',
  'operated',
  'administered',
  'triaged',
  'scaled',
  'upgraded',
];

const ASSISTED_VERBS = [
  'assisted',
  'helped',
  'shadowed',
  'contributed to',
  'participated in',
  'supported the team in',
];

const FAMILIARITY_PHRASES = [
  'familiar with',
  'familiarity with',
  'basic understanding',
  'exposure to',
  'introductory knowledge',
  'worked briefly with',
  'knowledge of',
  'coursework in',
  'high-level understanding',
  'awareness of',
];

const TEAM_OBSERVER_REGEX =
  /\b(?:worked\s+(?:with|alongside)\s+(?:a|the|an|other)?\s*teams?\s+(?:that|who|which|using)|on\s+(?:a|the)\s+team\s+(?:that|which)\s+(?:used|built|maintained)|collaborated\s+with\s+(?:a\s+)?(?:teams?|engineers?|developers?)\s+(?:who|that|using)|observed|shadowed)\b/i;

// Negation & special sentiments
const NEGATED_USAGE_REGEX =
  /\b(?:(?:no|zero|lack(?:s|ing)?)\s+(?:[a-z0-9-]+\s+){0,3}(?:experience|exposure|knowledge|background|proficiency|familiarity)\s+(?:with|in|of|using)|no\s+production\s+use\s+of|without\s+(?:any\s+)?(?:[a-z0-9-]+\s+){0,3}(?:experience|exposure|knowledge|background|using|use\s+of|adopting|deploying)|never\s+(?:used|implemented|deployed|achieved|built|worked\s+with)|did\s+not\s+(?:use|implement|deploy|adopt)|not\s+(?:used|implemented|deployed|adopted)|decided\s+against|avoided\s+using)\b/i;

const MIGRATED_AWAY_REGEX =
  /\b(?:(?:migrated|moved|transitioned|re-?architected|switched)\s+away\s+from|phased\s+out|removed|deprecated|sunset|decommissioned|retired)\b/i;

const REPLACED_TECH_REGEX = /\breplaced\b/i;

const EVALUATION_EXPLICIT_REGEX =
  /\b(?:evaluated\s+[a-z0-9_ -]+\s+but\s+decided\s+against|considered\s+[a-z0-9_ -]+\s+but|proof\s+of\s+concept\s+only|poc\s+only)\b/i;

const EVALUATION_VERB_REGEX =
  /\b(?:evaluated|assessed|investigated|trialed|piloted|considered)\b/i;

const POSITIVE_ADOPTION_REGEX =
  /\b(?:selected|chose|adopted|deployed|implemented|built|engineered|architected|integrated|migrated\s+to|used\s+in\s+production)\b/i;

const LEARNING_REGEX =
  /\b(?:(?:currently|actively|presently|still)\s+(?:learning|studying|exploring)|(?:^|[.;]\s*)(?:learning|studying)\s+(?!models|algorithms|systems|curves)|self[- ]studying|interested\s+in\s+learning)\b/i;

const ASPIRATIONAL_INTENT_REGEX =
  /\b(?:planning\s+to\s+(?:introduce|adopt|use|learn|implement|deploy|evaluate|explore)|plan\s+to\s+(?:introduce|adopt|use|learn|migrate)|aiming\s+to\s+(?:adopt|introduce|use|learn)|looking\s+to\s+(?:learn|adopt|introduce)|exploring\s+(?:the\s+use\s+of|adopting|introducing))\b/i;

const PAST_USAGE_REGEX = /\b(?:previously\s+used|past\s+experience\s+with)\b/i;

const NEGATION_PATTERNS = [
  { regex: NEGATED_USAGE_REGEX, sentiment: 'NEGATED_USAGE' as NegationSentiment },
  { regex: MIGRATED_AWAY_REGEX, sentiment: 'MIGRATED_AWAY' as NegationSentiment },
  { regex: /\b(?:replaced\s+[a-z0-9_-]+\s+with|re-architected\s+away\s+from)\b/i, sentiment: 'REPLACED_TECHNOLOGY' as NegationSentiment },
  { regex: EVALUATION_EXPLICIT_REGEX, sentiment: 'EVALUATION_ONLY' as NegationSentiment },
  { regex: ASPIRATIONAL_INTENT_REGEX, sentiment: 'ASPIRATIONAL' as NegationSentiment },
  { regex: LEARNING_REGEX, sentiment: 'LEARNING' as NegationSentiment },
  { regex: PAST_USAGE_REGEX, sentiment: 'PAST_USAGE' as NegationSentiment },
];

export interface ClausePolarity {
  text: string;
  start: number;
  end: number;
  negationSentiment: NegationSentiment;
  isNegated: boolean;
  candidateContribution: CandidateContribution;
}

export interface AnalyzedStatement {
  rawText: string;
  actionVerb?: string;
  candidateContribution: CandidateContribution;
  environmentMaturity: EnvironmentMaturity;
  negationSentiment: NegationSentiment;
  isNegated: boolean;
  hasMetric: boolean;
  metrics: string[];
  metricEvidences: MetricEvidence[];
  verificationStatus: VerificationStatus;
  subUnits: string[];
  clausePolarities?: ClausePolarity[];
}

function detectVerbContribution(lowerClause: string): {
  actionVerb?: string;
  candidateContribution: CandidateContribution;
} {
  for (const phrase of FAMILIARITY_PHRASES) {
    if (lowerClause.includes(phrase)) {
      return { actionVerb: undefined, candidateContribution: 'FAMILIARITY_ONLY' };
    }
  }

  for (const v of ARCHITECTURE_VERBS) {
    if (new RegExp(`\\b${v}\\b`, 'i').test(lowerClause)) {
      return { actionVerb: v, candidateContribution: 'ARCHITECTURE_DESIGN' };
    }
  }
  if (TEAM_OBSERVER_REGEX.test(lowerClause)) {
    return { actionVerb: undefined, candidateContribution: 'FAMILIARITY_ONLY' };
  }
  for (const v of ASSISTED_VERBS) {
    if (lowerClause.includes(v)) {
      return { actionVerb: v, candidateContribution: 'ASSISTED_ACTIVITY' };
    }
  }
  for (const v of DIRECT_IMPLEMENTATION_VERBS) {
    if (new RegExp(`\\b${v}\\b`, 'i').test(lowerClause)) {
      return { actionVerb: v, candidateContribution: 'DIRECT_IMPLEMENTATION' };
    }
  }
  for (const v of OPERATIONAL_VERBS) {
    if (new RegExp(`\\b${v}\\b`, 'i').test(lowerClause)) {
      return { actionVerb: v, candidateContribution: 'OPERATIONAL_RESPONSIBILITY' };
    }
  }

  return { actionVerb: undefined, candidateContribution: 'DIRECT_IMPLEMENTATION' };
}

function classifySingleClause(clauseText: string): Omit<ClausePolarity, 'text' | 'start' | 'end'> {
  const lower = clauseText.toLowerCase();
  const { candidateContribution } = detectVerbContribution(lower);

  if (NEGATED_USAGE_REGEX.test(lower)) {
    return { negationSentiment: 'NEGATED_USAGE', isNegated: true, candidateContribution };
  }
  if (MIGRATED_AWAY_REGEX.test(lower)) {
    return { negationSentiment: 'MIGRATED_AWAY', isNegated: true, candidateContribution };
  }
  if (REPLACED_TECH_REGEX.test(lower)) {
    return { negationSentiment: 'REPLACED_TECHNOLOGY', isNegated: true, candidateContribution };
  }
  if (LEARNING_REGEX.test(lower)) {
    return { negationSentiment: 'LEARNING', isNegated: false, candidateContribution: 'FAMILIARITY_ONLY' };
  }
  if (ASPIRATIONAL_INTENT_REGEX.test(lower)) {
    return { negationSentiment: 'ASPIRATIONAL', isNegated: false, candidateContribution: 'EVALUATION_ONLY' };
  }
  if (
    EVALUATION_EXPLICIT_REGEX.test(lower) ||
    (EVALUATION_VERB_REGEX.test(lower) && !POSITIVE_ADOPTION_REGEX.test(lower))
  ) {
    return { negationSentiment: 'EVALUATION_ONLY', isNegated: true, candidateContribution: 'FAMILIARITY_ONLY' };
  }
  if (PAST_USAGE_REGEX.test(lower)) {
    return { negationSentiment: 'PAST_USAGE', isNegated: false, candidateContribution };
  }

  return { negationSentiment: 'POSITIVE_USAGE', isNegated: false, candidateContribution };
}

const CLAUSE_SPLIT_REGEX =
  /;\s+|,?\s+(?:but|however|yet|though|although|whereas)\s+|\s+(?=without\s+(?:any\s+)?(?:[a-z0-9-]+\s+){0,3}(?:experience|exposure|knowledge|background|using|use\s+of|adopting|deploying)\b)|,?\s+(?=with\s+(?:basic\s+|introductory\s+|some\s+|limited\s+)?(?:exposure\s+to|familiarity\s+with)\b)|,?\s+(?=(?:currently|actively|presently|still)\s+(?:learning|studying|exploring)\b)|,?\s+(?=planning\s+to\s+(?:introduce|adopt|use|learn|implement|deploy|evaluate|explore)\b)|\s+(?=(?:after\s+migrating\s+to|in\s+favor\s+of)\b)/gi;

const MIGRATION_TARGET_SPLIT_REGEX =
  /^(.*?\b(?:migrated|moved|transitioned|re-?architected|switched)\s+away\s+from\s+.+?)\s+((?<!\b(?:due|prior|up|according|related)\s)\b(?:to|into|in\s+favor\s+of)\b\s+(?!(?:improve|reduce|avoid|prevent|ensure|achieve|support|handle|scale|maintain|enable)\b).+)$/i;

const REPLACED_TARGET_SPLIT_REGEX =
  /^(.*?\b(?:replaced|phased\s+out|removed|deprecated|sunset|decommissioned|retired)\b\s+.+?)\s+(\b(?:with|in\s+favor\s+of|using|by)\b\s+.+)$/i;

/**
 * Segments a statement into polarity-aware clauses with exact character offsets so
 * contrasted technologies (e.g. "Evaluated Kafka but selected RabbitMQ",
 * "Migrated away from MongoDB to PostgreSQL") retain distinct per-clause polarity.
 */
export function extractClausePolarities(trimmed: string): ClausePolarity[] {
  if (!trimmed) return [];

  // 1. Split on major contrastive / negation / aspirational boundaries
  const rawSegments: Array<{ text: string; start: number; end: number }> = [];
  let cursor = 0;
  CLAUSE_SPLIT_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CLAUSE_SPLIT_REGEX.exec(trimmed)) !== null) {
    if (match.index > cursor) {
      rawSegments.push({ text: trimmed.slice(cursor, match.index), start: cursor, end: match.index });
    }
    cursor = match.index + match[0].length;
    if (match[0].length === 0) {
      CLAUSE_SPLIT_REGEX.lastIndex++;
    }
  }
  if (cursor < trimmed.length) {
    rawSegments.push({ text: trimmed.slice(cursor), start: cursor, end: trimmed.length });
  }
  if (rawSegments.length === 0) {
    rawSegments.push({ text: trimmed, start: 0, end: trimmed.length });
  }

  // 2. Refine directional transition clauses ("Migrated away from X to Y", "Replaced X with Y")
  const clauses: ClausePolarity[] = [];
  for (const seg of rawSegments) {
    const migMatch = seg.text.match(MIGRATION_TARGET_SPLIT_REGEX);
    if (migMatch) {
      const leftText = migMatch[1];
      const rightStartInSeg = seg.text.indexOf(migMatch[2], leftText.length);
      const rightText = migMatch[2];
      clauses.push({
        text: leftText,
        start: seg.start,
        end: seg.start + leftText.length,
        negationSentiment: 'MIGRATED_AWAY',
        isNegated: true,
        candidateContribution: detectVerbContribution(leftText.toLowerCase()).candidateContribution,
      });
      clauses.push({
        text: rightText,
        start: seg.start + rightStartInSeg,
        end: seg.end,
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        candidateContribution: 'DIRECT_IMPLEMENTATION',
      });
      continue;
    }

    const repMatch = seg.text.match(REPLACED_TARGET_SPLIT_REGEX);
    if (repMatch) {
      const leftText = repMatch[1];
      const rightStartInSeg = seg.text.indexOf(repMatch[2], leftText.length);
      const rightText = repMatch[2];
      const isReplacedVerb = /\breplaced\b/i.test(leftText) && !/\b(?:phased\s+out|removed|deprecated|sunset|decommissioned|retired)\b/i.test(leftText);
      clauses.push({
        text: leftText,
        start: seg.start,
        end: seg.start + leftText.length,
        negationSentiment: isReplacedVerb ? 'REPLACED_TECHNOLOGY' : 'MIGRATED_AWAY',
        isNegated: true,
        candidateContribution: detectVerbContribution(leftText.toLowerCase()).candidateContribution,
      });
      clauses.push({
        text: rightText,
        start: seg.start + rightStartInSeg,
        end: seg.end,
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        candidateContribution: 'DIRECT_IMPLEMENTATION',
      });
      continue;
    }

    const cls = classifySingleClause(seg.text);
    clauses.push({
      text: seg.text,
      start: seg.start,
      end: seg.end,
      ...cls,
    });
  }

  return clauses;
}

const SENTIMENT_PRIORITY: NegationSentiment[] = [
  'NEGATED_USAGE',
  'MIGRATED_AWAY',
  'EVALUATION_ONLY',
  'REPLACED_TECHNOLOGY',
  'PAST_USAGE',
];

/**
 * Lightweight negation/polarity check for bulletAnalyzer and statementExtractor.
 * Avoids duplicate metric extraction when called from bulletAnalyzer.
 */
export function detectStatementPolarity(statement: string): {
  trimmed: string;
  negationSentiment: NegationSentiment;
  isNegated: boolean;
  allClausesNegated: boolean;
  clausePolarities: ClausePolarity[];
} {
  const trimmed = statement.replace(/^[*\-•▪●\d.]+\s+/, '').trim();
  const lower = trimmed.toLowerCase();
  const clausePolarities = extractClausePolarities(trimmed);

  const negatedClauses = clausePolarities.filter(c => c.isNegated);
  let negationSentiment: NegationSentiment = 'POSITIVE_USAGE';
  let isNegated = negatedClauses.length > 0;

  if (isNegated) {
    if (EVALUATION_EXPLICIT_REGEX.test(lower) && negatedClauses.some(c => c.negationSentiment === 'EVALUATION_ONLY')) {
      negationSentiment = 'EVALUATION_ONLY';
    } else {
      for (const s of SENTIMENT_PRIORITY) {
        if (negatedClauses.some(c => c.negationSentiment === s)) {
          negationSentiment = s;
          break;
        }
      }
    }
  } else if (clausePolarities.some(c => c.negationSentiment === 'ASPIRATIONAL')) {
    negationSentiment = 'ASPIRATIONAL';
  } else if (clausePolarities.some(c => c.negationSentiment === 'LEARNING')) {
    negationSentiment = 'LEARNING';
  } else {
    for (const pat of NEGATION_PATTERNS) {
      if (pat.regex.test(lower)) {
        negationSentiment = pat.sentiment;
        if (pat.sentiment === 'NEGATED_USAGE' || pat.sentiment === 'EVALUATION_ONLY' || pat.sentiment === 'MIGRATED_AWAY' || pat.sentiment === 'REPLACED_TECHNOLOGY') {
          isNegated = true;
        }
        break;
      }
    }
  }

  const allClausesNegated =
    clausePolarities.length > 0
      ? clausePolarities.every(c => c.isNegated)
      : isNegated;

  return {
    trimmed,
    negationSentiment,
    isNegated,
    allClausesNegated,
    clausePolarities,
  };
}

/**
 * Resolves the polarity of a character span within `clausePolarities`.
 */
export function resolvePolarityForOffset(
  clausePolarities: ClausePolarity[],
  offset: number,
  fallbackSentiment: NegationSentiment,
  fallbackNegated: boolean,
  fallbackContribution: CandidateContribution
): CompetencyPolarity {
  const matched = clausePolarities.find(c => offset >= c.start && offset <= c.end);
  if (matched) {
    return {
      negationSentiment: matched.negationSentiment,
      isNegated: matched.isNegated,
      candidateContribution: matched.candidateContribution,
    };
  }
  return {
    negationSentiment: fallbackSentiment,
    isNegated: fallbackNegated,
    candidateContribution: fallbackContribution,
  };
}

/**
 * Splits a compound bullet into natural atomic clauses when multiple independent
 * actions are coordinated (e.g. "Built X, optimized Y, and introduced Z").
 */
export function splitAtomicClauses(statement: string): string[] {
  const trimmed = statement.replace(/^[*\-•▪●\d.]+\s+/, '').trim();
  if (!trimmed) return [];

  // Match coordinated clauses starting with action verbs
  // e.g. ", and optimized" or "; implemented"
  const splitPattern = /;\s+|,\s+and\s+(?=[a-z]+ed\b|[a-z]+ing\b|built\b|designed\b)|,\s+(?=[a-z]+ed\b|[a-z]+ing\b|built\b|designed\b)/i;
  const parts = trimmed.split(splitPattern).map(p => p.trim()).filter(p => p.length > 10);

  if (parts.length > 1) {
    return parts;
  }
  return [trimmed];
}

/**
 * Analyzes an individual bullet point or statement for contribution, maturity,
 * negation, and metrics.
 */
export function analyzeStatement(
  statement: string,
  context?: {
    sectionType?: string;
    employmentType?: string;
    isProject?: boolean;
    sourceType?: import('./evidenceModel').EvidenceSource;
    roleOrProject?: string;
    entryId?: string;
    resumeText?: string;
    searchHintStart?: number;
  }
): AnalyzedStatement {
  const polarity = detectStatementPolarity(statement);
  const { trimmed, negationSentiment, isNegated, allClausesNegated, clausePolarities } = polarity;
  const lower = trimmed.toLowerCase();

  // 2. Detect Action Verb & Candidate Contribution
  // When a sentence has mixed polarity (e.g. "Evaluated Kafka but selected RabbitMQ"),
  // prefer the positive clause's action verb while preserving familiarity/evaluation-only
  // when all clauses are familiarity/evaluation/negated.
  let actionVerb: string | undefined = undefined;
  let candidateContribution: CandidateContribution = 'DIRECT_IMPLEMENTATION';

  const isClauseNonExecuted = (c: { isNegated: boolean; negationSentiment?: string }) =>
    c.isNegated || c.negationSentiment === 'LEARNING' || c.negationSentiment === 'ASPIRATIONAL';

  const positiveClauses = clausePolarities.filter(c => !isClauseNonExecuted(c));
  const verbSearchText =
    positiveClauses.length > 0 ? positiveClauses.map(c => c.text).join(' ').toLowerCase() : lower;

  const positiveVerbInfo = detectVerbContribution(verbSearchText);
  if (positiveClauses.length > 0 && positiveVerbInfo.candidateContribution !== 'FAMILIARITY_ONLY') {
    actionVerb = positiveVerbInfo.actionVerb;
    candidateContribution = positiveVerbInfo.candidateContribution;
  } else if (
    clausePolarities.length > 0 &&
    clausePolarities.every(c => c.candidateContribution === 'FAMILIARITY_ONLY')
  ) {
    candidateContribution = 'FAMILIARITY_ONLY';
  } else {
    const fullVerbInfo = detectVerbContribution(lower);
    actionVerb = fullVerbInfo.actionVerb;
    candidateContribution = fullVerbInfo.candidateContribution;
  }

  // 3. Detect Environment Maturity
  let environmentMaturity: EnvironmentMaturity = 'UNKNOWN';

  const isExplicitProduction =
    /\b(?:production|prod|live users|high availability|ha|99\.\d+%|sla|rps|qps|daily transactions|real-time payment|scale)\b/i.test(
      lower
    );

  const isExplicitPrototype =
    /\b(?:prototype|poc|proof of concept|hackathon|toy|simulat(?:e|ed|ing)|personal project|hobby)\b/i.test(
      lower
    );

  const isCoursework =
    /\b(?:coursework|academic|thesis|capstone|class project|assignment|university)\b/i.test(
      lower
    );

  if (isExplicitPrototype) {
    environmentMaturity = 'PROTOTYPE';
  } else if (isCoursework || context?.sectionType === 'education') {
    environmentMaturity = 'COURSEWORK_ENVIRONMENT';
  } else if (isExplicitProduction) {
    environmentMaturity = 'PRODUCTION';
  } else if (context?.employmentType === 'FULL_TIME' || context?.sectionType === 'experience') {
    // Standard professional employment context
    environmentMaturity = 'PRODUCTION';
  } else if (context?.isProject) {
    environmentMaturity = 'PROTOTYPE';
  }

  // 4. Structured Metrics Detection (Phase 09)
  const inferredSourceType: import('./evidenceModel').EvidenceSource =
    context?.sourceType ||
    (context?.employmentType === 'INTERNSHIP'
      ? 'INTERNSHIP'
      : context?.isProject || context?.sectionType === 'projects'
        ? 'PERSONAL_PROJECT'
        : context?.sectionType === 'experience'
          ? 'PROFESSIONAL_EXPERIENCE'
          : 'UNKNOWN');

  const allClausesNonExecuted =
    clausePolarities.length > 0 ? clausePolarities.every(isClauseNonExecuted) : isNegated;
  const anyClauseNonExecuted = isNegated || clausePolarities.some(isClauseNonExecuted);

  const metricEvidences = extractMetricsFromText(trimmed, {
    sourceType: inferredSourceType,
    environmentMaturity,
    roleOrProject: context?.roleOrProject,
    entryId: context?.entryId,
    sectionType: context?.sectionType,
    isNegated: allClausesNonExecuted,
    resumeText: context?.resumeText,
    searchHintStart: context?.searchHintStart,
  });

  if (anyClauseNonExecuted && !allClausesNonExecuted) {
    for (const m of metricEvidences) {
      if (typeof m.sourceStart === 'number') {
        const clause = clausePolarities.find(c => m.sourceStart! >= c.start && m.sourceStart! < c.end);
        if (clause && isClauseNonExecuted(clause)) {
          m.claimSupport = 'NEGATED';
        }
      }
    }
  }

  const validPositiveMetrics = metricEvidences.filter(
    (m) => m.polarity !== 'NEGATIVE' && Boolean(m.unit) && m.extractionConfidence >= 0.5 && m.claimSupport !== 'NEGATED'
  );
  const metrics = metricEvidences.map((m) => m.sourceQuote);
  const hasMetric = validPositiveMetrics.length > 0;

  // 5. Verification Status
  let verificationStatus: VerificationStatus = 'RESUME_SUPPORTED';
  if (isNegated && allClausesNegated) {
    verificationStatus = 'PARTIALLY_SUPPORTED';
  } else if (isNegated) {
    verificationStatus = 'PARTIALLY_SUPPORTED';
  } else if (hasMetric && actionVerb) {
    verificationStatus = 'SOURCE_VALIDATED';
  } else if (!actionVerb && candidateContribution === 'FAMILIARITY_ONLY') {
    verificationStatus = 'CONTEXT_UNRESOLVED';
  }

  const subUnits = splitAtomicClauses(trimmed);

  return {
    rawText: trimmed,
    actionVerb,
    candidateContribution,
    environmentMaturity,
    negationSentiment,
    isNegated,
    hasMetric,
    metrics,
    metricEvidences,
    verificationStatus,
    subUnits,
    clausePolarities,
  };
}
