// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 09
// Structured Metric Evidence & Impact Evaluation Model
// Preserves exact source quotes, offsets, units, timeframes,
// derived math provenance, attribution, maturity, and trace reasons.
// ============================================================

import type { EnvironmentMaturity, EvidenceSource } from './evidenceModel';

export type MetricCategory =
  | 'OUTCOME'
  | 'SCALE'
  | 'QUALITY'
  | 'SCOPE'
  | 'LATENCY'
  | 'RELIABILITY'
  | 'COST'
  | 'PRODUCTIVITY';

export type MetricChangeType =
  | 'DECREASE'
  | 'INCREASE'
  | 'SPEEDUP_RATIO'
  | 'PERCENTAGE_CHANGE'
  | 'PERCENTAGE_POINT_CHANGE'
  | 'ABSOLUTE_VALUE'
  | 'RATE'
  | 'UNKNOWN';

export type MetricPolarity = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'AMBIGUOUS';

export type MetricAttributionStatus =
  | 'DIRECT_OWNERSHIP'
  | 'LEADERSHIP'
  | 'CONTRIBUTED'
  | 'TEAM_QUALIFIED'
  | 'SCOPE_SUPPORT'
  | 'EXPOSURE_ONLY'
  | 'AMBIGUOUS';

export type MetricTimeframe =
  | 'per_second'
  | 'per_minute'
  | 'per_hour'
  | 'per_day'
  | 'per_week'
  | 'per_month'
  | 'per_year'
  | 'total'
  | 'unspecified';

export type MetricClaimSupport =
  | 'SUPPORTED'
  | 'PARTIAL'
  | 'QUALIFIED'
  | 'UNSUPPORTED'
  | 'NEGATED';

export interface MetricContextInfo {
  responsibility?: string;
  achievement?: string;
  roleOrProject?: string;
  matchedSkills?: string[];
}

export interface MetricEvidence {
  id: string;
  /** Exact verbatim substring from the evaluated source text */
  sourceQuote: string;
  /** Exact start offset within the local evaluated text */
  sourceStart: number;
  /** Exact end offset within the local evaluated text */
  sourceEnd: number;
  /** Exact start offset within the raw full resume document, when localized */
  documentStart?: number;
  /** Exact end offset within the raw full resume document, when localized */
  documentEnd?: number;
  /** Containing bullet text */
  bulletQuote?: string;
  entryId?: string;
  sectionType?: string;

  /** Primary category + multi-category tags so multi-faceted evidence is not flattened */
  metricCategory: MetricCategory;
  metricCategories: MetricCategory[];

  /** Explicit baseline/result pairs when stated by source */
  baselineValue?: number;
  baselineRaw?: string;
  resultValue?: number;
  resultRaw?: string;

  /** Standalone value or explicit delta value (when baseline->result absent) */
  value?: number;

  unit?: string;
  rawUnit?: string;
  timeframe: MetricTimeframe;
  rawTimeframe?: string;
  changeType: MetricChangeType;

  /** Derived mathematical interpretations — explicitly separate from quoted values */
  calculatedDelta?: number;
  calculatedRelativeChange?: number;
  calculatedPercentagePointDelta?: number;
  derivedInterpretation?: string;
  isDerivedMathValid: boolean;

  /** Optional qualifiers & safeguards */
  percentile?: 'p50' | 'p90' | 'p95' | 'p99' | 'p99.9';
  isDeltaOnly?: boolean;
  isApproximateLowerBound?: boolean;
  isUpperBoundedOnly?: boolean;

  polarity: MetricPolarity;
  attribution: MetricAttributionStatus;
  attributionEvidence?: string;
  context: MetricContextInfo;

  sourceType: EvidenceSource;
  environmentMaturity: EnvironmentMaturity;
  extractionConfidence: number;
  uncertaintyNotes?: string[];

  claimSupport?: MetricClaimSupport;
  deduplicationKey?: string;
  isDuplicate?: boolean;
  jdRelevanceScore?: number;
  impactCredit?: number;
  creditedInImpact?: boolean;
  creditDecisionReason?: string;
}

export interface ImpactEvidenceTraceItem {
  metricId: string;
  sourceQuote: string;
  metricCategory: MetricCategory;
  metricCategories: MetricCategory[];
  sourceType: EvidenceSource;
  environmentMaturity: EnvironmentMaturity;
  attribution: MetricAttributionStatus;
  polarity: MetricPolarity;
  credited: boolean;
  creditWeight: number;
  jdRelevanceScore: number;
  reason: string;
  derivedInterpretation?: string;
  entryId?: string;
  sectionType?: string;
  documentStart?: number;
  documentEnd?: number;
  claimSupport?: MetricClaimSupport;
}

export interface ImpactEvaluationResult {
  impactMetricsScore: number;
  metricScoreFactor: number;
  totalMetricsExtracted: number;
  creditedMetricsCount: number;
  excludedMetricsCount: number;
  quantifiedBulletRatio: number;
  evaluatedMetrics: MetricEvidence[];
  impactTrace: ImpactEvidenceTraceItem[];
  flags: string[];
  summaryReason: string;
}
