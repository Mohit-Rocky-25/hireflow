// ============================================================
// Career Ladder Data Schema & Types
// Pure TypeScript definitions for verified promotion ladders
// ============================================================

export type CareerTrack = 'SWE' | 'EM' | 'PM' | 'DATA_ML';

export type CompanyTier = 
  | 'Big Tech' 
  | 'High-Growth Tech' 
  | 'India Product Unicorn' 
  | 'IT Services & Consulting' 
  | 'Global In-House Center (GIC)';

export type ConfidenceLevel = 'high' | 'medium' | 'estimate';

export interface CompBreakdown {
  currency: 'USD' | 'INR';
  base: number;
  stock: number;
  bonus: number;
  total: {
    p25: number;
    p50: number;
    p75: number;
  };
  region: 'US' | 'IN' | 'GLOBAL';
}

export interface TimeInLevel {
  p25: number;        // Fast-track / Top 25% promo duration in years
  median: number;     // Typical duration in years
  p75: number;        // Conservative duration in years
  stallRatePct: number; // Percent of engineers who do not advance past this level
}

export interface PromotionRequirements {
  scope: string;        // Architectural/system scope of ownership
  impact: string;       // Business / technical impact expectations
  influence: string;    // Mentorship, team, cross-org leadership
  evidence: string[];   // Concrete evidence items required in promo packet
}

export interface PromotionProcess {
  cadence: string;          // e.g. "Half-yearly (Q1 / Q3 cycles)"
  nominator: string;        // e.g. "Manager-sponsored or self-nomination"
  committee: string;        // e.g. "Cross-functional Promotion Committee"
  artifacts: string[];      // Required documents
  commonBlockers: string[]; // Common reasons promotions are delayed or blocked
}

export interface CareerLevel {
  companyId: string;
  track: CareerTrack;
  levelCode: string;
  title: string;
  yoeTypicalMin: number;
  yoeTypicalMax: number;
  isTerminal: boolean; // True if engineer can stay indefinitely without "up or out"
  comp: CompBreakdown;
  timeInLevel: TimeInLevel;
  promotionRequirements: PromotionRequirements;
  promotionProcess: PromotionProcess;
  equivalenceGroup: string; // Key into EQUIVALENCE_GROUPS
  sources: string[];
  confidence: ConfidenceLevel;
  lastUpdated: string;
}

export interface CompanyLadder {
  id: string;
  name: string;
  tier: CompanyTier;
  headquarters: string;
  tracks: CareerTrack[];
  levels: CareerLevel[];
  sources: string[];
  lastUpdated: string;
}
