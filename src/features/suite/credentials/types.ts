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

  // ── Schema 2.0 Rich Extensions ──
  trust?: TrustLevel;
  flags?: OpportunityFlag[];
  branches?: EngineeringBranch[];
  feeDisplay?: FeeDisplay;
  rewardDisplay?: RewardDisplay;
  stipendDisplay?: StipendDisplay;
  studentAid?: StudentAidInfo;
  windows?: OpportunityWindow[];
  richDetails?: OpportunityRichDetails;
  editorialScore?: {
    signal: number;
    competition: 'low' | 'medium' | 'high';
    effortWeeks?: [number, number];
    note?: string;
  };
  verification?: {
    status: TrustLevel;
    lastChecked: string;
    basis: string;
    notes?: string;
  };
}

// ── Schema 2.0 Types & Flags ──

export type TrustLevel =
  | 'verified_official'
  | 'verified_multi_source'
  | 'reported_single_source'
  | 'unverified_recurring';

export type OpportunityFlag =
  | 'open_now'
  | 'deadline_soon'
  | 'free'
  | 'paid_stipend'
  | 'hiring_pipeline'
  | 'best_value'
  | 'hidden_gem'
  | 'changed_2026'
  | 'closed_this_year'
  | 'branch_edge_ece'
  | 'branch_edge_mech'
  | 'branch_edge_noncs'
  | 'start_now'
  | 'evidence_builder'
  | 'hands_on'
  | 'high_cost'
  | 'coursework_only'
  | 'college_route'
  | 'women_track'
  | 'hr_filter_signal'
  | 'core_industry';

export type EngineeringBranch =
  | 'ALL'
  | 'CSE'
  | 'IT'
  | 'ECE'
  | 'EEE'
  | 'MECH'
  | 'CIVIL';

export interface FeeDisplay {
  usd: number | null;
  inrOfficial?: number | null;
  inr_official?: number | null;
  priceConfidence?: 'verified' | 'reported' | 'tier_inferred' | 'unknown';
  note?: string;
}

export interface RewardDisplay {
  headline?: string;
  note?: string;
  confidence?: 'verified' | 'reported' | 'conflicting' | 'low' | 'medium' | 'unknown';
}

export interface StipendDisplay {
  headline?: string;
  note?: string;
  confidence?: 'verified' | 'reported' | 'low' | 'unknown';
}

export interface StudentAidInfo {
  available: boolean;
  summary: string | null;
  steps: string[];
}

export interface OpportunityWindow {
  label: string;
  opens?: string | null;
  closes?: string | null;
  status:
    | 'open'
    | 'open_now'
    | 'closing_soon'
    | 'closed'
    | 'expected'
    | 'upcoming'
    | 'upcoming_for_shortlisted'
    | 'exams_in_progress'
    | 'in_progress'
    | 'check_official'
    | 'info'
    | 'past';
  confidence?: 'high' | 'medium' | 'low';
  date?: string | null;
}

export interface OfficialSourceCitation {
  title: string;
  url: string;
  type: 'official' | 'secondary';
  retrieved: string;
  supports: string[];
}

export interface OpportunityRichEvidence {
  attach?: string[];
  lineTemplate?: string;
  line_template?: string;
}

export interface OpportunityRichDetails {
  overview?: string;
  whatItCovers?: string[];
  what_it_covers?: string[];
  format?: Record<string, any>;
  costBreakdown?: Array<{ item: string; usd?: number; inr?: number; note?: string }>;
  cost_breakdown?: Array<{ item: string; usd?: number; inr?: number; note?: string }>;
  validityRenewal?: string | null;
  validity_renewal?: string | null;
  prerequisites?: string;
  eligibility?: string;
  howToApply?: string[];
  how_to_apply?: string[];
  timeline?: OpportunityWindow[];
  studentAidSteps?: string[];
  student_aid_steps?: string[];
  resumeEvidence?: OpportunityRichEvidence;
  resume_evidence?: OpportunityRichEvidence;
  pitfalls?: string[];
  alternatives?: string[];
  sources?: OfficialSourceCitation[];
}

// Live exchange rate reference (October 2026 baseline: 1 USD = 86.8 INR)
export const USD_TO_INR_EXCHANGE_RATE = 86.8;

export function formatComputedInr(usd: number | null, inrOfficial?: number | null): string {
  if (inrOfficial != null && inrOfficial > 0) {
    return `₹${inrOfficial.toLocaleString('en-IN')}`;
  }
  if (usd != null && usd > 0) {
    const computed = Math.round(usd * USD_TO_INR_EXCHANGE_RATE);
    return `~₹${computed.toLocaleString('en-IN')} ($${usd})`;
  }
  return 'Free';
}

// ── Opportunity Plan & Recommendation Models ──

export type OpportunityPlanStatus = 'interested' | 'in_progress' | 'completed' | 'not_relevant';
export type OpportunityPlanTimeline = '30_day' | '60_day' | '90_day' | 'later';

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
  branch?: string;
  trustLevel?: string;
  flag?: string;
}
