// ============================================================
// Credential & Opportunity Engine — Core Types (Stage 2)
// Strictly typed, versioned, zero-hallucination data models
// ============================================================

export type ReleaseTier = 'tier1' | 'tier2' | 'tier3';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ValueImpact = 'low' | 'medium' | 'high';

export type CertificationLevel = 'foundation' | 'associate' | 'professional' | 'specialty';

export type OpportunityKind = 'certification' | 'event' | 'open_source';

export type OpportunityCategory =
  | 'Software Development'
  | 'Cloud and DevOps'
  | 'Data and Analytics'
  | 'AI and Machine Learning'
  | 'Cybersecurity'
  | 'Product, Business, and Design'
  | 'Mobile Development'
  | 'Quality Engineering'
  | 'Open Source'
  | 'Competitions and Events';

export type EventType =
  | 'hackathon'
  | 'codathon'
  | 'ideathon'
  | 'datathon'
  | 'ctf'
  | 'case_competition'
  | 'ai_challenge'
  | 'robotics'
  | 'game_jam'
  | 'startup_competition';

export type OpenSourceProgramType =
  | 'mentorship'
  | 'contribution_program'
  | 'fellowship'
  | 'seasonal_program';

export type OpportunityType =
  | 'certification'
  | EventType
  | OpenSourceProgramType;

export type EventScope = 'college' | 'national' | 'international';
export type DeliveryMode = 'online' | 'offline' | 'hybrid';

// ── Specific Opportunity Schemas ──

export interface CertificationSchema {
  id: string;
  name: string;
  issuer: string;
  category: OpportunityCategory[];
  level: CertificationLevel;
  targetRoles: string[];
  relatedSkills: string[];
  prerequisites: string;
  estimatedPreparationHours: number;
  examFormat: string;
  cost: string;
  validity: string;
  officialUrl: string;
  syllabusUrl: string;
  resumeValue: ValueImpact;
  evidenceValue: ValueImpact;
  portfolioValue: ValueImpact;
  suitabilityNotes: string;
  recommendedOrder: number;
  relatedProjects: string[];
  lastVerifiedAt: string;
  sourceUrl: string;
  releaseTier: ReleaseTier;
  confidence: ConfidenceLevel;
  resumePresentationTemplate: string;
  whatItIs: string;
  whoShouldTakeIt: string;
  whatItProves: string;
  examDetails: string;
  preparationPath: string[];
}

export interface EventSchema {
  id: string;
  name: string;
  type: EventType;
  organizer: string;
  category: OpportunityCategory[];
  scope: EventScope;
  mode: DeliveryMode;
  eligibility: string;
  teamSize: string;
  duration: string;
  typicalWindow: string;
  applicationProcess: string;
  selectionProcess: string;
  benefits: string[];
  resumeValue: ValueImpact;
  portfolioValue: ValueImpact;
  evidenceValue: ValueImpact;
  skillsDemonstrated: string[];
  preparationChecklist: string[];
  projectOutcomeExpectations: string;
  officialUrl: string;
  lastVerifiedAt: string;
  confidence: ConfidenceLevel;
  releaseTier: ReleaseTier;
  targetRoles: string[];
  relatedSkills: string[];
  resumePresentationTemplate: string;
  whatItIs: string;
  whoShouldTakeIt: string;
  whatItProves: string;
  sourceUrl: string;
}

export interface OpenSourceProgramSchema {
  id: string;
  name: string;
  organizer: string;
  type: OpenSourceProgramType;
  category: OpportunityCategory[];
  eligibility: string;
  applicationWindow: string;
  duration: string;
  selectionProcess: string;
  benefits: string[];
  requiredSkills: string[];
  recommendedPreparation: string[];
  resumeValue: ValueImpact;
  portfolioValue: ValueImpact;
  evidenceValue: ValueImpact;
  officialUrl: string;
  lastVerifiedAt: string;
  confidence: ConfidenceLevel;
  releaseTier: ReleaseTier;
  targetRoles: string[];
  relatedSkills: string[];
  resumePresentationTemplate: string;
  whatItIs: string;
  whoShouldTakeIt: string;
  whatItProves: string;
  sourceUrl: string;
  contributionExpectations: string;
  applicationTips: string[];
  commonMistakes: string[];
  preparationFlow?: string[];
}

// ── Unified Top 30 Catalog Record ──

export interface OpportunityRecord {
  schemaVersion: 1;
  id: string;
  rank: number;
  name: string;
  kind: OpportunityKind;
  type: OpportunityType;
  organizer: string;
  issuer?: string;
  category: OpportunityCategory[];
  targetRoles: string[];
  relatedSkills: string[];
  eligibility: string;
  level?: CertificationLevel;
  scope?: EventScope;
  mode?: DeliveryMode;
  duration: string;
  typicalWindow: string;
  applicationProcess: string;
  selectionProcess: string;
  benefits: string[];
  prerequisites: string;
  estimatedPreparationHours?: number;
  estimatedPreparationTime: string;
  examFormat?: string;
  cost?: string;
  validity?: string;
  officialUrl: string;
  syllabusUrl?: string;
  resumeValue: ValueImpact;
  evidenceValue: ValueImpact;
  portfolioValue: ValueImpact;
  skillsDemonstrated: string[];
  preparationChecklist: string[];
  projectOutcomeExpectations: string;
  resumePresentationTemplate: string;
  relatedProjects: string[];
  recommendedOrder: number;
  suitabilityNotes: string;
  confidence: ConfidenceLevel;
  lastVerifiedAt: string;
  sourceUrl: string;
  releaseTier: ReleaseTier;
  whatItIs: string;
  whoShouldTakeIt: string;
  whatItProves: string;
  examDetails?: string;
  preparationPath?: string[];
  applicationTips?: string[];
  commonMistakes?: string[];
  contributionExpectations?: string;
  teamSize?: string;
  costInr?: string;
  studentDiscountNote?: string;
  isIndianFlagship?: boolean;
  ppoOffered?: string;
  stipendAmount?: string;
  directPortalUrl?: string;
}

// ── Opportunity Plan & Recommendation Models ──

export type OpportunityPlanStatus = 'interested' | 'in_progress' | 'completed' | 'not_relevant';
export type OpportunityPlanTimeline = '30_day' | '90_day' | 'later';

export interface OpportunityPlanItem {
  opportunityId: string;
  status: OpportunityPlanStatus;
  targetTimeline: OpportunityPlanTimeline;
  priority: 'high' | 'medium' | 'low';
  reasonForRecommendation: string;
  evidenceCreated: string;
  resumeImprovementSupported: string;
  estimatedEffort: string;
  completionCondition: string;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

export interface RecommendationPathStep {
  opportunityId: string;
  order: number;
  whyRelevant: string;
  evidenceCreated: string;
  supportedGap: string;
  doNotPursueYetWarning?: string;
}

export interface RoleRecommendationPath {
  roleId: string;
  roleDisplayName: string;
  targetDomain: string;
  summary: string;
  recommendedOpportunityIds: string[];
  pathSteps: RecommendationPathStep[];
}

export interface OpportunityFilterState {
  searchQuery: string;
  targetRole: string;
  category: string;
  type: string;
  level: string;
  budget: string;
  timeAvailable: string;
  mode: string;
  scope: string;
  resumeValue: string;
  evidenceValue: string;
  confidence: string;
  releaseTier: string;
  issuer: string;
  teamSize: string;
  eligibility: string;
  showOnlyTop30: boolean;
}
