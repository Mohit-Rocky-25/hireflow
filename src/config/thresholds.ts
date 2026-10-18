// ============================================================
// HireFlow v3 — Engine Thresholds & Bounds Configuration
// Typed limits, time boundaries, and tolerance thresholds
// ============================================================

/** Bullet length and composition limits */
export const BULLET_LIMITS = {
  /** Minimum words required for a bullet to convey meaningful substance */
  minWords: 6,
  /** Maximum recommended words before a bullet becomes a run-on block */
  maxWords: 45,
  /** Recommended target words for optimal recruiter scannability */
  targetWords: 24,
  /** Maximum number of bullets recommended per fresher project */
  maxBulletsPerProject: 4,
} as const;

/** Resume and Job Description document bounds */
export const DOCUMENT_BOUNDS = {
  /** Minimum words for an input to be accepted as a valid resume */
  minResumeWords: 80,
  /** Maximum words for an Indian fresher single-page resume */
  maxFresherResumeWords: 750,
  /** Minimum words for a JD to undergo meaningful skill extraction */
  minJdWords: 50,
  /** Warning word count threshold when a fresher resume exceeds 1 page */
  fresherPageLimitWarningWords: 650,
} as const;

/** Keyword stuffing and penalty thresholds */
export const PENALTY_THRESHOLDS = {
  /** Maximum allowed ratio of skills listed without any project/experience evidence */
  maxUnevidencedSkillRatio: 0.60,
  /** Minimum total listed skills required before keyword stuffing checks trigger */
  minSkillsForStuffingCheck: 10,
  /** Point penalty subtracted when keyword stuffing is detected */
  keywordStuffingPenaltyPoints: 10,
  /** Point penalty for completely missing dedicated standard sections */
  missingSectionPenaltyPoints: 3,
  /** Point penalty when a resume is abnormally short */
  sparseResumePenaltyPoints: 4,
} as const;

/** Data freshness evaluation boundaries in calendar days */
export const FRESHNESS_DAYS_BOUNDS = {
  /** Records verified within 180 days are considered fresh and up-to-date */
  freshDays: 180,
  /** Records between 180 and 365 days are marked aging (needs recheck soon) */
  agingDays: 365,
  /** Records older than 365 days are flagged as stale (needs manual verification) */
  staleDays: 366,
} as const;

/** Performance and execution latency targets */
export const ENGINE_PERFORMANCE_LIMITS = {
  /** Maximum acceptable parsing and scoring run time in milliseconds */
  maxScanLatencyMs: 1500,
  /** High-speed benchmark target for standard single-column text fixtures */
  targetScanLatencyMs: 400,
} as const;

/** Match Confidence classification thresholds based on direct evidence ratio */
export const MATCH_CONFIDENCE_THRESHOLDS = {
  /** Direct match ratio >= 0.75 yields High confidence */
  high: 0.75,
  /** Direct match ratio >= 0.45 yields Medium confidence */
  medium: 0.45,
} as const;
