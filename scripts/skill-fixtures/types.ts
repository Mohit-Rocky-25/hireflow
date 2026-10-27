// ============================================================
// HireFlow ATS Skill Matching — Fixture Types (Issue 2)
// Defines ground-truth labels for resume mentions, JD requirements,
// traps pack categories, and match classification expectations.
// ============================================================

export type SkillLocation =
  | 'skills-list'
  | 'experience-bullet'
  | 'project-bullet'
  | 'education'
  | 'certification';

export type SkillEvidenceTier =
  | 'direct-use'
  | 'familiar/exposure'
  | 'negated'
  | 'absent';

export type RequirementPriority = 'mandatory' | 'preferred' | 'mentioned';

export interface MentionTruth {
  canonicalId: string;
  tokenFound: string;
  location: SkillLocation;
  evidenceTier: SkillEvidenceTier;
}

export interface JDRequirementTruth {
  canonicalId: string;
  tokenFound: string;
  priority: RequirementPriority;
  anyOfGroupId?: string;
}

export type ExpectedMatchClassification = 'DIRECT' | 'TRANSFERABLE' | 'PARTIAL' | 'MISSING';

export interface SkillMatchExpectation {
  jdSkill: string;
  expectedClassification: ExpectedMatchClassification;
  matchedWith?: string;
  rationale?: string;
}

export interface SkillFixtureTruth {
  id: string;
  isHoldout: boolean;
  trapType?: string;
  roleCategory: string;
  resumeText: string;
  jdText: string;
  resumeMentions: MentionTruth[];
  jdRequirements: JDRequirementTruth[];
  expectedMatches: SkillMatchExpectation[];
}
