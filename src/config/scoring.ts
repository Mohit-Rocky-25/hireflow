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

/** JD Alignment Index components (sum = 1.0 / 100 points) */
export const JD_ALIGNMENT_WEIGHTS = {
  /** Core must-have requirements coverage (40% weight) */
  mustHaveSkills: 0.40,
  /** Demonstrated evidence verification tier (25% weight) */
  evidenceDepth: 0.25,
  /** Preferred & domain qualification matches (15% weight) */
  preferredSkills: 0.15,
  /** Seniority & responsibility scope alignment (10% weight) */
  seniorityScope: 0.10,
  /** Layout parse safety & clean text structure (10% weight) */
  formatSafety: 0.10,
} as const;

/** Project Substance Index evaluation pillars (sum = 1.0 / 100 points) */
export const PROJECT_SUBSTANCE_WEIGHTS = {
  /** Architecture & systems depth: queues, caching, indexing, concurrency (35% weight) */
  architectureSystemsDepth: 0.35,
  /** Verifiable production rigor: test suites, CI/CD, deployment URLs (30% weight) */
  productionRigor: 0.30,
  /** Quantified engineering metrics: latency, QPS, error reductions (20% weight) */
  quantifiedOutcomes: 0.20,
  /** Modern typed ecosystem & craftsmanship (15% weight) */
  techStackCraftsmanship: 0.15,
} as const;

/** Truth Gate non-negotiable verification invariants */
export const TRUTH_GATE_RULES = [
  {
    id: 'TG-01',
    rule: 'Zero Tolerance for Fabricated Metrics',
    description: 'Every metric, percentage, or throughput figure in tailored bullets must originate from the candidate fact ledger. No synthetic score boosts or invented stats.',
  },
  {
    id: 'TG-02',
    rule: 'Strict Evidence Grounding',
    description: 'Skills can only be elevated or matched when backed by demonstrated project or work bullet context. Keyword stuffing without evidence receives zero evidence credit.',
  },
  {
    id: 'TG-03',
    rule: 'Deterministic Re-Scoring',
    description: 'Score enhancements must be recalculations from actual before-and-after ATS evaluations, never hardcoded mathematical offsets.',
  },
  {
    id: 'TG-04',
    rule: 'Zero PII Egress & Local Execution',
    description: 'Diagnostics, calibrations, and ATS evaluations operate 100% client-side in the browser with zero external network telemetry.',
  },
] as const;

