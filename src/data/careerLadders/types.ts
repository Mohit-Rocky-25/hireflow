// ============================================================
// Career Ladder Data Schema & Types — India Market Edition
// Strict INR currency, structured promotion blockers & student hiring routes
// ============================================================

export type CareerTrack = 'SWE' | 'EM' | 'PM' | 'DATA_ML';

export type MarketSegment = 
  | 'Big Tech India' 
  | 'GCC / Finance' 
  | 'Indian Product Unicorn' 
  | 'Fintech' 
  | 'Indian IT Services' 
  | 'High-Growth Startup';

export type CompanyTier = 
  | 'Big Tech' 
  | 'High-Growth Tech' 
  | 'India Product Unicorn' 
  | 'IT Services & Consulting' 
  | 'Global In-House Center (GIC)';

export type ConfidenceLevel = 'verified' | 'community' | 'estimate';

export type BlockerCategory = 
  | 'Scope too small'
  | 'Impact not measurable'
  | 'Visibility and sponsorship'
  | 'Process and calibration'
  | 'Behavior and collaboration'
  | 'Headcount, budget and org factors'
  | 'Performance history';

export interface StructuredBlocker {
  title: string;
  category: BlockerCategory;
  whyItBlocks: string;        // 1 to 2 sentences explaining why this blocks promotion at this company/level
  evidenceToCounter: string; // Concrete evidence required to counter or resolve this blocker
}

export interface SourceReference {
  name: string;
  url: string;
  retrievedAt: string;        // ISO date e.g. "2026-03-25"
  extractedFields: readonly ('comp' | 'ladder' | 'timing' | 'process' | 'blockers')[];
}

export interface HiringRoute {
  routeType: 'on-campus' | 'off-campus' | 'intern-to-full-time' | 'referral' | 'hackathon-competition';
  name: string;
  eligibility: {
    cgpaMin: number;
    allowedBranches: string[];
    batches: string;
  };
  selectionRounds: string[];
  typicalOfferByTier: {
    tier1: number; // in INR per year (rupees)
    tier2: number;
    tier3: number;
  };
  assignedLevelCode: string;
  assignedTitle: string;
  likelihoodByTier: {
    tier1: 'High' | 'Medium' | 'Low';
    tier2: 'High' | 'Medium' | 'Low';
    tier3: 'High' | 'Medium' | 'Low';
  };
  notes?: string;
}

export interface CompBreakdown {
  currency: 'INR';           // Strictly INR only
  region: 'IN';             // Strictly India office data
  base: number;              // Fixed annual base pay in rupees
  variable: number;          // Target annual variable / performance bonus in rupees
  stock: number;             // Annualized vesting stock / RSUs in rupees per year
  joiningBonus?: number;     // One-time or first-year signing bonus in rupees
  total: {
    p25: number;             // 25th percentile total annual CTC in rupees
    p50: number;             // Median total annual CTC in rupees
    p75: number;             // 75th percentile total annual CTC in rupees
  };
}

export interface TimeInLevel {
  p25: number;               // Fast-track promotion velocity in years
  median: number;            // Median promotion velocity in years
  p75: number;               // Conservative promotion velocity in years
  stallRatePct: number;      // Approximate percent of engineers who stall or do not advance
}

export interface PromotionRequirements {
  scope: string;             // Architectural / operational boundary of ownership
  impact: string;            // Quantifiable business and technical output
  influence: string;         // Mentorship, cross-functional collaboration, org influence
  evidence: string[];        // Specific concrete deliverables in promo packet
}

export interface PromotionProcess {
  cadence: string;           // Review cadence (e.g. "Half-yearly (March & September cycles)")
  cadenceMonths: number[];   // Review cycle months [3, 9] (1-12)
  nominator: string;         // Who initiates (e.g. "Manager nomination with skip-level endorsement")
  decider: string;           // Who approves (e.g. "Director-level calibration committee")
  calibrationLayers: number; // Calibration depth (e.g. 2 or 3 layers)
  artifacts: string[];       // Required documents for promotion packet
  selfNominationAllowed: boolean;
  cycleType: 'cycle' | 'off-cycle' | 'both';
  typicalNoticeAndEffectiveDate: string;
  blockers: StructuredBlocker[]; // Minimum 6 structured blockers per level!
}

export interface CareerLevel {
  companyId: string;
  track: CareerTrack;
  levelCode: string;
  title: string;
  yoeTypicalMin: number;
  yoeTypicalMax: number;
  isTerminal: boolean;       // True if engineer can stay indefinitely without up-or-out pressure
  upOrOutPolicy?: string;    // Documented explanation if up-or-out policy applies
  comp: CompBreakdown;
  timeInLevel: TimeInLevel;
  promotionRequirements: PromotionRequirements;
  promotionProcess: PromotionProcess;
  equivalenceGroup: string;  // Key into EQUIVALENCE_GROUPS
  sources: SourceReference[];
  confidence: ConfidenceLevel;
  lastVerified: string;      // ISO date e.g. "2026-03-25"
  hiringRoutes?: HiringRoute[]; // Campus & fresher entry routes (for entry levels)
}

export interface CompanyLadder {
  id: string;
  name: string;
  marketSegment: MarketSegment;
  tier: CompanyTier;
  headquarters: string;
  tracks: CareerTrack[];
  levels: CareerLevel[];
  sources: SourceReference[];
  lastVerified: string;
}
