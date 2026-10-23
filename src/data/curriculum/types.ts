// ============================================================
// HireFlow — Curriculum & Actionability Plan Types (Stage 5)
// Zero marketing promises: "builds evidence for", never "gap closed"
// ============================================================

export type GapCategory =
  | 'skill-missing'
  | 'evidence-missing'
  | 'format'
  | 'experience'
  | 'market-signal';

export type ClosabilityPeriod =
  | '7 days'
  | '30 days'
  | '90+ days'
  | 'not closable by resume alone';

export interface CurriculumResource {
  title: string;
  url: string | null;
  sourceName: string;
  lastReviewed: string;
  isFree: boolean;
  confidence: 'high' | 'medium' | 'unverified';
}

export interface CurriculumDomain {
  id: string;
  name: string;
  category: string;
  deliverableToShip: string;
  checkpoints: {
    milestone: string;
    description: string;
    acceptanceCriteria: string;
  }[];
  effortHours: {
    at5HoursPerWeek: string;
    at10HoursPerWeek: string;
    at20HoursPerWeek: string;
  };
  resources: CurriculumResource[];
  bulletTemplate: string;
}

export interface ActionableGap {
  id: string;
  title: string;
  category: GapCategory;
  closability: ClosabilityPeriod;
  evidenceHeadline: string;
  suggestedAction: string;
  hypotheticalScoreGain: {
    min: number;
    max: number;
    projectedRange: string;
  };
  impactPerEffortScore: number; // 1 to 100 for ranking
  bulletTemplate?: string;
  curriculumDomainId?: string;
  alternativesForNonClosable?: string[];
}

export interface ActionabilityPlanResult {
  sevenDayPlan: ActionableGap[]; // Top 5 fixes by impact-per-effort
  thirtyDayPlan: ActionableGap[]; // 30-day proof projects
  twelveWeekRoadmap: ActionableGap[]; // 90+ day deep competencies
  notClosableGaps: ActionableGap[]; // Non-closable gaps with alternatives
  allRankedGaps: ActionableGap[];
}
