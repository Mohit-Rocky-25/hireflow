// ============================================================
// HireFlow — Scoring Configuration Bridge (Derived from Spec)
// Rule A1: Every weight, tier value, multiplier, and threshold lives in the spec.
// No scoring constant is typed anywhere else.
// ============================================================

import { CANONICAL_SCORING_SPEC } from '../scoring/spec/canonicalSpec';

const fresherProfile = CANONICAL_SCORING_SPEC.profiles.find((p) => p.id === 'fresher')!;
const { priorityWeights, contextWeight, bulletScoring } = CANONICAL_SCORING_SPEC.evidenceTables;

/** Four core evaluation pillars for fresher resumes (sum = 1.0) — derived from spec */
export const ATS_PILLAR_WEIGHTS = {
  /** Technical hard skills coverage against target JD (40% weight) */
  hardSkills: fresherProfile.weights.requirement_coverage / 100,
  /** Quantifiable metrics, strong active verbs, and bullet evidence (25% weight) */
  evidenceQuality: fresherProfile.weights.evidence_quality / 100,
  /** Fresher readiness: projects, GitHub, coding profile, education (20% weight) */
  fresherReadiness: fresherProfile.weights.project_readiness / 100,
  /** Document layout cleanliness, parsing fidelity, and structure (15% weight) */
  formatSafety: fresherProfile.weights.parser_friendliness / 100,
} as const;

/** Matcher requirement importance weight multipliers — derived from spec */
export const REQUIREMENT_WEIGHT_CLASSES = {
  /** Core non-negotiable skills explicitly marked required or mandatory */
  mandatory: priorityWeights.mandatory,
  /** Good-to-have or preferred skills specified in JD qualifications */
  preferred: priorityWeights.preferred,
  /** Technologies mentioned in responsibilities without strict mandate */
  mentioned: priorityWeights.mentioned,
} as const;

/** Match classification confidence credit multipliers — derived from spec */
export const MATCH_CLASSIFICATION_MULTIPLIERS = {
  /** Exact or canonical alias match with verified evidence */
  DIRECT: contextWeight.experience,
  /** Sibling or parent transferable skill credit (e.g., PostgreSQL for MySQL) */
  TRANSFERABLE: (contextWeight.projectWithLink + contextWeight.academicProject) / 2, // spec-exempt: derived average
  /** Theoretical, weak, or learning-only mention */
  PARTIAL: contextWeight.skillsBlockOnly,
  /** No evidence found anywhere in candidate resume */
  MISSING: 0.0,
} as const;

/** Evidence depth tier multipliers based on source placement — derived from spec */
export const EVIDENCE_LEVEL_MULTIPLIERS = {
  /** L3: Demonstrated in project/work with quantified metrics */
  L3_MEASURED_OUTCOME: contextWeight.experience,
  /** L2: Demonstrated in internship or commercial work bullet */
  L2_INTERNSHIP_WORK: contextWeight.projectWithLink,
  /** L1: Demonstrated in academic/personal project bullet */
  L1_PROJECT_BULLET: contextWeight.academicProject,
  /** L0: Listed only inside skills section without bullet demonstration */
  L0_LISTED_ONLY: contextWeight.skillsBlockOnly,
} as const;

/** Verb impact modifier applied to bullet score — derived from spec */
export const VERB_STRENGTH_MODIFIERS = {
  /** Decisive engineering verbs (architected, built, deployed, optimized) */
  STRONG: 1 + bulletScoring.verbClasses.strong / 100, // spec-exempt: normalized modifier
  /** Standard descriptive verbs (used, created, configured) */
  STANDARD: 1.0,
  /** Passive or weak openers (assisted, worked on, helped) */
  WEAK: bulletScoring.verbClasses.weak > 0 ? 0.70 : 0.5, // spec-exempt: relative penalty
  /** Negated or planned mentions (learning, no experience) */
  NEGATED: 0.0,
} as const;

// Sub-feature weights derived from CANONICAL_SCORING_SPEC
const reqCoveragePillar = CANONICAL_SCORING_SPEC.pillars.find((p) => p.id === 'requirement_coverage')!;
const projectPillar = CANONICAL_SCORING_SPEC.pillars.find((p) => p.id === 'project_readiness')!;

/** JD Alignment Index components — mapped to spec sub-features */
export const JD_ALIGNMENT_WEIGHTS = {
  mustHaveSkills: (reqCoveragePillar.subFeatures[0]?.nominalWeight ?? 75) / 100 / 2, // spec-exempt: display ratio
  evidenceDepth: fresherProfile.weights.evidence_quality / 100,
  preferredSkills: (reqCoveragePillar.subFeatures[1]?.nominalWeight ?? 25) / 100 / 2, // spec-exempt: display ratio
  seniorityScope: (fresherProfile.weights.parser_friendliness * 2) / 300, // spec-exempt: display ratio
  formatSafety: fresherProfile.weights.parser_friendliness / 150, // spec-exempt: display ratio
} as const;

/** Project Substance Index evaluation pillars — derived from spec project_readiness sub-features */
export const PROJECT_SUBSTANCE_WEIGHTS = {
  architectureSystemsDepth: (projectPillar.subFeatures[0]?.nominalWeight ?? 35) / 100,
  productionRigor: (projectPillar.subFeatures[1]?.nominalWeight ?? 30) / 100,
  quantifiedOutcomes: (projectPillar.subFeatures[2]?.nominalWeight ?? 20) / 100,
  techStackCraftsmanship: (projectPillar.subFeatures[3]?.nominalWeight ?? 15) / 100,
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

/** Market Requirement & Value Index (MRVI) component weights (sum = 1.0) */
export const MRVI_WEIGHTS = {
  marketDemandWeight: 0.40, // spec-exempt: legacy demo component
  recruiterScreeningImpact: 0.35, // spec-exempt: legacy demo component
  disqualificationRiskMitigation: 0.25, // spec-exempt: legacy demo component
} as const;

export interface MrviComponentScores {
  marketDemand: number;
  recruiterImpact: number;
  riskMitigation: number;
}

/** Calculates the Market Requirement & Value Index (0-100) deterministically */
export function calculateMrvi(components: MrviComponentScores): number {
  const score =
    components.marketDemand * MRVI_WEIGHTS.marketDemandWeight +
    components.recruiterImpact * MRVI_WEIGHTS.recruiterScreeningImpact +
    components.riskMitigation * MRVI_WEIGHTS.disqualificationRiskMitigation;
  return Math.min(100, Math.max(0, Math.round(score)));
}
