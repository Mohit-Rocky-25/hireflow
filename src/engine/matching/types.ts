// ============================================================
// HireFlow v3 — Matcher Engine Types (R4.3, R4.4, R4.5, R4.6, R4.7, R4.8)
// Strictly explainable matching contracts (P-3, P-5)
// ============================================================

export type MatchClassification =
  | 'DIRECT'
  | 'TRANSFERABLE'
  | 'PARTIAL'
  | 'MISSING'
  | 'UNCERTAIN';

export type EvidenceLevel = 0 | 1 | 2 | 3;

export interface SkillEvidence {
  skillId: string;
  canonical: string;
  /** L0: listed only; L1: project bullet; L2: work/internship bullet; L3: measured outcome */
  level: EvidenceLevel;
  section: string;
  phrase: string;
  spanStart: number;
  spanEnd: number;
  strength: 'strong' | 'moderate' | 'weak';
  confidence: 'high' | 'medium' | 'low';
  hasMetric: boolean;
}

export interface JDRequirement {
  id: string;
  text: string;
  kind: 'mandatory' | 'preferred' | 'degree' | 'experience' | 'other';
  skills: string[];
  /** Identifier for OR-groups where any member satisfies requirement */
  orGroupId?: string;
  weightClass: number;
  sourcePhrase: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RequirementMatch {
  requirement: JDRequirement;
  status: MatchClassification;
  scoreMultiplier: number;
  evidence: SkillEvidence | null;
  transferableVia?: {
    fromSkill: string;
    relation: 'sibling' | 'parent';
  };
  reason: string;
}

export interface MatchResult {
  hardSkillScore: number;
  mustHaveCoverage: {
    total: number;
    matched: number;
    percentage: number;
    missing: string[];
  };
  preferredCoverage: {
    total: number;
    matched: number;
    percentage: number;
  };
  matchConfidence: 'high' | 'medium' | 'low';
  matches: RequirementMatch[];
  topGaps: {
    skillId: string;
    canonical: string;
    weight: number;
    isMandatory: boolean;
  }[];
  findings: {
    id: string;
    type: 'listed_not_shown' | 'weak_verb' | 'missing_metric';
    message: string;
    line: string;
    skillId?: string;
  }[];
}
