// ============================================================
// HireFlow v3 — Scoring Configuration (Config, Not Magic Numbers)
// Pure typed constants with one-line comments explaining rationale
// ============================================================

/** Four core evaluation pillars for fresher resumes (sum = 1.0) */
export const ATS_PILLAR_WEIGHTS = {
  /** Technical hard skills coverage against target JD (40% weight) */
  hardSkills: 0.40,
  /** Quantifiable metrics, strong active verbs, and bullet evidence (25% weight) */
  evidenceQuality: 0.25,
  /** Fresher readiness: projects, GitHub, coding profile, education (20% weight) */
  fresherReadiness: 0.20,
  /** Document layout cleanliness, parsing fidelity, and structure (15% weight) */
  formatSafety: 0.15,
} as const;

/** Matcher requirement importance weight multipliers */
export const REQUIREMENT_WEIGHT_CLASSES = {
  /** Core non-negotiable skills explicitly marked required or mandatory */
  mandatory: 3.0,
  /** Good-to-have or preferred skills specified in JD qualifications */
  preferred: 1.5,
  /** Technologies mentioned in responsibilities without strict mandate */
  mentioned: 1.0,
} as const;

/** Match classification confidence credit multipliers */
export const MATCH_CLASSIFICATION_MULTIPLIERS = {
  /** Exact or canonical alias match with verified evidence */
  DIRECT: 1.0,
  /** Sibling or parent transferable skill credit (e.g., PostgreSQL for MySQL) */
  TRANSFERABLE: 0.7,
  /** Theoretical, weak, or learning-only mention */
  PARTIAL: 0.4,
  /** No evidence found anywhere in candidate resume */
  MISSING: 0.0,
} as const;

/** Evidence depth tier multipliers based on source placement */
export const EVIDENCE_LEVEL_MULTIPLIERS = {
  /** L3: Demonstrated in project/work with quantified metrics (digits, %, units) */
  L3_MEASURED_OUTCOME: 1.0,
  /** L2: Demonstrated in internship or commercial work bullet */
  L2_INTERNSHIP_WORK: 0.85,
  /** L1: Demonstrated in academic/personal project bullet */
  L1_PROJECT_BULLET: 0.65,
  /** L0: Listed only inside skills section without bullet demonstration */
  L0_LISTED_ONLY: 0.35,
} as const;

/** Verb impact modifier applied to bullet score */
export const VERB_STRENGTH_MODIFIERS = {
  /** Decisive engineering verbs (architected, built, deployed, optimized) */
  STRONG: 1.15,
  /** Standard descriptive verbs (used, created, configured) */
  STANDARD: 1.0,
  /** Passive or weak openers (assisted, worked on, helped) */
  WEAK: 0.70,
  /** Negated or planned mentions (learning, no experience) */
  NEGATED: 0.0,
} as const;
