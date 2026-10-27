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

/** Claim strength ladder for non-hallucinatory rewrites (P-1, R6.9) */
export const CLAIM_STRENGTH_LADDER: Record<string, number> = {
  // Tier 1: Supportive / assisting
  assisted: 1,
  helped: 1,
  supported: 1,
  participated: 1,
  involved: 1,
  // Tier 2: Contributory / collective
  contributed: 2,
  worked: 2,
  collaborated: 2,
  maintained: 2,
  // Tier 3: Direct individual execution / builder
  built: 3,
  created: 3,
  developed: 3,
  implemented: 3,
  engineered: 3,
  designed: 3,
  coded: 3,
  optimized: 3,
  refactored: 3,
  deployed: 3,
  // Tier 4: Leadership / architectural direction
  led: 4,
  spearheaded: 4,
  architected: 4,
  orchestrated: 4,
  // Tier 5: Complete institutional ownership
  owned: 5,
  founded: 5,
};

/** Tailor My Resume keyword mirroring and readiness limits */
export const TAILOR_MIRRORING_LIMITS = {
  /** Maximum times a specific target keyword may appear across all tailored bullets to prevent stuffing */
  maxKeywordMentionsPerTerm: 2,
  /** Must-have coverage threshold for "Ready to apply" tier (otherwise "Needs a bridge") */
  readyToApplyThresholdPct: 75,
} as const;

/** Parsing tolerances and parameters for PDF/DOCX extractors (Issue 1) */
export const PARSING_THRESHOLDS = {
  /** Maximum file size in bytes (10 MB) */
  maxFileSizeBytes: 10 * 1024 * 1024,
  /** Maximum pages to parse before truncation guard */
  maxPdfPages: 25,
  /** Timeout in milliseconds for extractor operations */
  maxExtractorTimeoutMs: 8000,
  /** Vertical baseline clustering tolerance factor (multiplied by font size) */
  lineYClusteringFontFactor: 0.35,
  /** Minimum vertical gap in points to distinguish new lines */
  minLineYDeltaPt: 2.5,
  /** Horizontal space insertion factor (multiplied by glyph width / font size) */
  spaceGapWidthFactor: 0.25,
  /** Minimum relative width of two-column gutter compared to page width */
  columnGutterMinWidthRatio: 0.008,
  /** Minimum page height share that column gutter must span */
  columnGutterMinHeightShare: 0.15,
  /** Fraction of page height at top and bottom checked for repeating headers/footers */
  headerFooterMarginRatio: 0.06,
  /** Vertical alignment tolerance for repeating headers across pages in points */
  headerFooterYDeltaPt: 6.0,
  /** Minimum characters per page before triggering low-density / scanned image warning */
  minCharsPerPage: 100,
  /** Maximum garbled / non-printable glyph ratio before rejecting or penalizing confidence */
  maxGarbledGlyphRatio: 0.05,
  /** Confidence calculation weights */
  confidenceWeights: {
    charDensity: 0.45,
    glyphQuality: 0.35,
    layoutConsistency: 0.2,
  },
  /** Ambiguous column detection penalty on layout confidence */
  columnAmbiguityPenalty: 0.2,
} as const;

/** Regression gate thresholds for ATS parser validation (Stage 6) */
export const PARSE_GATE_THRESHOLDS = {
  /** Unhandled crashes allowed (strictly 0) */
  maxCrashes: 0,
  /** Minimum Section Detection F1 score on parseable text documents (%) */
  minSectionF1: 90.0,
  /** Minimum Bullet Point Recall on parseable text documents (%) */
  minBulletRecall: 90.0,
  /** Minimum Candidate Name extraction accuracy (%) */
  minNameAccuracy: 90.0,
  /** Minimum Email extraction accuracy (%) */
  minEmailAccuracy: 90.0,
  /** Minimum Phone extraction accuracy (%) */
  minPhoneAccuracy: 90.0,
  /** Minimum Education extraction accuracy (%) */
  minEducationAccuracy: 95.0,
  /** Minimum Warning Recall across all fixtures including scanned / corrupt (%) */
  minWarningRecall: 95.0,
  /** Maximum p50 parsing latency in milliseconds */
  maxP50LatencyMs: 50.0,
  /** Maximum p95 parsing latency in milliseconds */
  maxP95LatencyMs: 200.0,
  /** Minimum JD Seniority Classification accuracy (%) */
  minJdSeniorityAccuracy: 100.0,
  /** Minimum JD Must-Haves Requirements Recall (%) */
  minJdMustHavesRecall: 90.0,
} as const;
