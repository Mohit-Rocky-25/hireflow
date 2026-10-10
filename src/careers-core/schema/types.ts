// ============================================================
// Careers Data Platform — Core Schema & Entity Types
// Pure TypeScript types without UI dependencies
// ============================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface ProvenanceSource {
  url: string;
  title: string;
  publisher: string;
  type: 'official' | 'news' | 'placement-report' | 'aggregator' | 'interview-pattern';
  accessed: string;
}

export interface EntityProvenance {
  sources: ProvenanceSource[];
  confidence: ConfidenceLevel;
  lastVerified: string;
  dataYear: string;
  stale?: boolean;
}

export type MarketSegment =
  | 'Big Tech India'
  | 'Indian Product Unicorn'
  | 'GCC / Finance'
  | 'Indian IT Services'
  | 'Core Engineering & Automotive';

export type CareerTrack = 'SWE' | 'EM' | 'DATA' | 'HARDWARE' | 'CORE_ENG' | 'PRODUCT';

export interface PlatformCompany {
  id: string;
  name: string;
  aliases: string[];
  marketSegment: MarketSegment;
  marketTier?: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
  headquarters: string | null;
  indiaOffices: string[];
  tracks: CareerTrack[];
  website?: string;
  hiringAnalytics?: PlatformHiringAnalytics;
  provenance: EntityProvenance;
}

export interface PlatformHiringAnalytics {
  hiringStatus: 'Aggressive' | 'Selective' | 'Frozen' | 'Moderate';
  averageTimeToHire: string;
  competitionRatio: string;
  interviewPassRate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  hiringTrends: string;
}

export interface StructuredBlocker {
  title: string;
  category: string;
  whyItBlocks: string;
  evidenceToCounter: string;
}

export interface PlatformLevel {
  companyId: string;
  levelCode: string;
  title: string;
  track: CareerTrack;
  equivalenceLevelId: string | null;
  typicalYoE: { min: number; max: number; likely?: number } | null;
  typicalYearsInLevel: { min: number; max: number; likely: number } | null;
  compINR: {
    base: { min: number; median: number; max: number };
    stock: { min: number; median: number; max: number };
    bonus: { min: number; median: number; max: number };
    totalCTC: { min: number; median: number; max: number };
  } | null;
  requirements: {
    scope: string;
    impact: string;
    influence: string;
    evidence: string[];
  } | null;
  promotionProcess: {
    cadence: string;
    cadenceMonths: number[];
    nominator: string;
    decider: string;
    calibrationLayers: number;
    selfNominationAllowed: boolean;
    artifacts: string[];
    templated?: boolean;
  } | null;
  blockers: StructuredBlocker[];
  provenance: EntityProvenance;
}

export interface EquivalenceLevel {
  id: string;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  terminalExpectation: string;
  typicalYoeRange: string;
  mappings: Record<string, string>; // companyId -> levelCode
}

export type BranchFamily =
  | 'software'
  | 'data-ai'
  | 'electronics-embedded'
  | 'core-mechanical'
  | 'core-civil'
  | 'chemical-bio'
  | 'management'
  | 'general-science';

export interface PlatformBranch {
  code: string;
  name: string;
  degreeName: string;
  family: BranchFamily;
  programLengthYears: number;
  defaultTrack: CareerTrack;
  typicalFirstRoleFamily: string;
  aliases: string[];
}

export interface PlatformRole {
  id: string;
  companyId: string;
  title: string;
  level: string;
  department: string;
  roleFamily: string;
  competencies: Record<string, 'expert' | 'strong' | 'working'>;
  derivedKeywords: string[];
  salaryRange?: string;
  location?: string;
  type?: string;
  provenance: EntityProvenance;
}

export interface SelectionStage {
  stage: string;
  type: 'aptitude' | 'coding' | 'gd' | 'technical' | 'managerial' | 'hr' | 'project-review' | 'other';
  durationMin: number | null;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard' | null;
}

export interface ProgramEligibility {
  degrees: string[];
  branchFamilies: BranchFamily[];
  branchCodes: string[];
  graduationYears: number[];
  minCgpa: number | null;
  minPercentage: number | null;
  backlogPolicy: string | null;
  gapYearPolicy: string | null;
  notes: string | null;
}

export interface TrajectoryStep {
  fromLevelCode: string;
  toLevelCode: string;
  typicalYearsMin: number | null;
  typicalYearsMax: number | null;
  conditions: string[];
  blockers: StructuredBlocker[];
  compensationLPAAfter: { min: number | null; max: number | null };
  fastTrackNote: string | null;
  lateralExits: string[];
  confidence: ConfidenceLevel;
  derived: boolean;
}

export interface FresherProgram {
  id: string;
  companyId: string;
  programName: string;
  roleTitle: string;
  aliases: string[];
  programType: 'fulltime' | 'internship-ppo' | 'trainee' | 'competition-hiring';
  roleFamily: string;
  campusCategory: 'mass' | 'dream' | 'super-dream' | 'unclassified';
  hiringReach: 'mass-pool' | 'select-campuses' | 'off-campus-open' | 'invite-only';
  channels: ('on-campus' | 'off-campus' | 'internship-ppo' | 'competition' | 'referral' | 'portal')[];
  testOrPortal: string | null;
  eligibility: ProgramEligibility;
  selectionProcess: SelectionStage[];
  compensation: {
    currency: 'INR';
    fixedMinLPA: number | null;
    fixedMaxLPA: number | null;
    variableLPA: number | null;
    joiningBonusINR: number | null;
    stipendPerMonthINR: number | null;
    esopNote: string | null;
    asOfYear: number | null;
  };
  training: {
    durationMonths: number | null;
    bondMonths: number | null;
    bondAmountINR: number | null;
    notes: string | null;
  };
  locations: string[];
  seasons: {
    typicalMonths: number[];
    notes: string | null;
  };
  entry: {
    companyLevelCode: string | null;
    equivalenceLevelId: string | null;
  };
  competencyProfile: Record<string, 'expert' | 'strong' | 'working'>;
  derivedFrom: 'official-jd' | 'program-page' | 'role-family-default';
  trajectory: TrajectoryStep[];
  status: 'active' | 'limited' | 'discontinued' | 'unverified';
  provenance: EntityProvenance;
}

export interface CandidateFacts {
  degree?: string;
  branchCode?: string;
  cgpa?: number;
  backlogs?: number;
  gradYear?: number;
  skills?: string[];
}

export interface EligibilityResult {
  status: 'eligible' | 'ineligible' | 'unknown';
  reasons: string[];
  matchScore?: number; // 0-100
}

export interface DatasetManifest {
  manifestVersion: string;
  schemaVersion: string;
  datasetVersion: string;
  generatedAt: string;
  owner: string;
  entities: {
    companiesCount: number;
    levelsCount: number;
    rolesCount: number;
    fresherProgramsCount: number;
    branchesCount: number;
    equivalenceLevelsCount: number;
    competenciesCount: number;
  };
}
