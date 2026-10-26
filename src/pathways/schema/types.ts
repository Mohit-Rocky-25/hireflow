// ============================================================
// Pathways Architecture — Canonical Schemas & Data Contracts
// Pure TypeScript types adhering to Constitution Parts B & D
// ============================================================

export type SourceKind = 'official' | 'company-published';
export type PublisherType = 'company' | 'government';
export type ExtractedBy = 'ai' | 'human';

/**
 * Universal Evidence Reference (Constitution B4/H3)
 */
export interface EvidenceRef {
  rowId: string;
  subjectId: string;
  field: string;
  value: string | number | boolean | string[] | number[];
  unit?: string;
  sourceKind: SourceKind;
  publisherType: PublisherType;
  url: string;
  retrievedAt: string; // ISO 8601
  snippet: string;     // At most 15 words exact page snippet
  extractedBy: ExtractedBy;
}

/**
 * Government Rule Ledger Row (Income Tax, EPF, Labour Codes)
 */
export interface RuleRow extends EvidenceRef {
  publisherType: 'government';
  taxYearLabel?: string;
  effectiveDate?: string;
}

/**
 * Program Criteria Evaluation States (Constitution C3)
 */
export type CriterionState =
  | 'pass'
  | 'fail'
  | 'needs_input'
  | 'unit_mismatch'
  | 'ambiguous'
  | 'not_published';

export type ProgramOverallStatus =
  | 'meets'
  | 'check'
  | 'fails'
  | 'unknown';

export interface CriterionResult {
  criterion: string;
  state: CriterionState;
  required: string | number | boolean | string[] | number[] | null;
  provided: string | number | boolean | string[] | number[] | null;
  evidence: string[]; // rowIds
  note?: string;
}

/**
 * Program Selection Stage Definition
 */
export interface ProgramStage {
  name: string;
  type?: 'online_test' | 'technical_interview' | 'hr_interview' | 'hackathon' | 'group_discussion';
  platform?: string;
  duration?: string;
}

/**
 * Program Fact Structure (Constitution B4/H2 closed list)
 */
export interface ProgramFacts {
  officialName: string;
  programName: string;
  programPageUrl: string;
  eligibility: {
    cgpaMin?: number;
    cgpaScale?: number;
    percentAggregateMin?: number;
    percent10Min?: number;
    percent12Min?: number;
    maxActiveBacklogs?: number;
    backlogHistoryRule?: string;
    maxGapMonths?: number;
    branches?: string[];
    degrees?: string[];
    batchYears?: number[];
  };
  stages?: ProgramStage[];
  bondMonths?: number;
  bondAmount?: number;
  stipend?: number;
}

export interface ProgramRecord {
  id: string;
  facts: ProgramFacts;
  evidence: Record<string, EvidenceRef>;
  lastChecked: string;
}

/**
 * Student Profile (Scenario Layer L3 — Browser Local Only)
 */
export interface StudentProfile {
  // Budget 3 core inputs
  branch: string;
  batchYear: number;
  cgpa: number;
  cgpaScale: number; // default 10

  // Optional rewarded upgrades
  percent10?: number | null;
  percent12?: number | null; // null if diploma
  isDiploma?: boolean;
  percentAggregate?: number | null;
  activeBacklogs?: number | null;
  clearedBacklogs?: number | null;
  gapMonths?: number | null;
  degree?: string; // default B.Tech / B.E.
  currentSemester?: number; // 1 to 8
}

/**
 * Editorial Assumption Structure (Model Layer L2 — Constitution B2)
 */
export type AssumptionStatus = 'draft' | 'reviewed';
export type ReviewerCategory = 'chartered_accountant' | 'placement_officer' | 'legal_counsel' | 'academic_dean' | null;

export interface Assumption {
  id: string;
  label: string;
  min: number;
  likely: number;
  max: number;
  unit: string;
  kind: 'editorial';
  rationale: string;
  status: AssumptionStatus;
  reviewerCategory: ReviewerCategory;
  reviewedAt: string | null;
}

/**
 * Deterministic Engine Execution Trace (Constitution B3/E2)
 */
export interface EngineTrace {
  engine: 'eligibility' | 'offer' | 'plan' | 'readiness';
  engineVersion: string;
  asOf: string; // YYYY-MM-DD
  inputsUsed: string[];
  rulesApplied: string[];
  evidenceRefs: string[];
  assumptionsUsed: Array<{ id: string; status: AssumptionStatus }>;
  unknowns: string[];
}

/**
 * Eligibility Evaluation Result for a Program
 */
export interface ProgramEligibilityResult {
  programId: string;
  officialName: string;
  programName: string;
  programPageUrl: string;
  status: ProgramOverallStatus;
  criteria: CriterionResult[];
  blockingInputs: string[];
  caveats: string[];
  trace: EngineTrace;
}

/**
 * Action Plan Task & Lane Definitions (Constitution C5)
 */
export interface PlanTask {
  id: string;
  title: string;
  category: 'eligibility_blocker' | 'readiness_gap' | 'process_prep';
  effortMinWeeks: number;
  effortLikelyWeeks: number;
  effortMaxWeeks: number;
  actionRequired: string;
  sourceNote?: string;
  isDraftAssumption: boolean;
}

export interface ActionPlanResult {
  targetId: string;
  targetType: 'direct_campus' | 'off_campus_tests' | 'services_bridge';
  pace: 'relaxed' | 'standard' | 'intense';
  paceMultiplier: number;
  tasks: PlanTask[];
  totalWeeksRange: { min: number; likely: number; max: number };
  draftAssumptionsInUse: boolean;
  trace: EngineTrace;
}

/**
 * Offer Evaluator Schemas (Constitution C7)
 */
export type TaxRegime = 'new' | 'old';
export type PfContributionMode = 'actual_basic' | 'statutory_ceiling' | 'none';

export interface OfferInput {
  // Budget 3 (Step 1)
  fixedAnnual: number;
  variableAnnualTarget: number;
  joiningBonus: number;

  // Step 2 (From offer letter)
  basicMonthly?: number;
  hraMonthly?: number;
  specialMonthly?: number;
  employerPfInsideFixed?: boolean;
  employerPfAnnual?: number;
  gratuityInsideFixed?: boolean;
  gratuityAnnual?: number;
  insuranceAnnual?: number;
  otherEmployerPaidAnnual?: number;

  // Step 3 (Contract terms)
  bondMonths?: number;
  bondAmount?: number;
  bondProRata?: boolean;
  clawbackMonths?: number;
  clawbackPercent?: number;
  noticePeriodDays?: number;
  joiningMonth?: number; // 1 (April) to 12 (March)
  taxRegime?: TaxRegime;
  oldRegimeTotalDeductions?: number;
  pfMode?: PfContributionMode;
  professionalTaxAnnual?: number;
  otherMonthlyDeductions?: number;

  // ESOP
  esopGrantValue?: number;
  esopUnits?: number;
  esopVestingPreset?: '4yr_1yr_cliff' | 'custom';
  esopCustomVestingSchedule?: number[]; // percentages per year
  esopValuationMultiples?: number[];    // e.g. [1, 2, 5]
}

export interface MonthlyInHandScenario {
  variablePayoutPercent: number; // 0, 50, 100
  grossCashMonthly: number;
  employeePfMonthly: number;
  professionalTaxMonthly: number;
  incomeTaxMonthly: number;
  otherDeductionsMonthly: number;
  netInHandMonthly: number;
}

export interface ExposureDataPoint {
  month: number;
  bondExposure: number;
  clawbackExposure: number;
  totalAtStake: number;
  exposurePercentOfYearOneCash: number;
}

export interface OfferRedFlag {
  id: string;
  severity: 'warning' | 'critical';
  title: string;
  description: string;
  thresholdUsed: string;
  suggestedHrQuestion: string;
}

export interface OfferResult {
  // Pay Breakdown
  totalCtcAnnual: number;
  fixedAnnual: number;
  grossCashAnnual: number;
  employerBenefitsAnnual: {
    employerPf: number;
    gratuityProvision: number;
    insurance: number;
    otherBenefits: number;
    total: number;
  };

  // Monthly In-Hand
  scenarios: {
    zeroVariable: MonthlyInHandScenario;
    fiftyVariable: MonthlyInHandScenario;
    hundredVariable: MonthlyInHandScenario;
  };

  // First Financial Year Projection
  firstFinancialYear: {
    joiningMonth: number;
    monthsInFirstFy: number;
    partialGrossEarned: number;
    partialTaxEstimate: number;
    partialNetInHand: number;
    fullYearTaxEquivalent: number;
    taxReliefRuleApplied?: string;
  };

  // Exit Exposure Timeline (Months 0-36)
  exposureTimeline: ExposureDataPoint[];

  // ESOP Schedule
  esopProjection?: {
    totalUnits: number;
    cliffMonths: number;
    schedule: Array<{ month: number; vestedPercent: number; vestedUnits: number }>;
    scenarios: Array<{ multiplier: number; estimatedValue: number }>;
  };

  // Red Flags & HR Questions
  redFlags: OfferRedFlag[];
  questionsForHr: string[];

  trace: EngineTrace;
}
