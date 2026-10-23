// ============================================================
// HireFlow — Market Realism & Provenance Data Types (Stage 3)
// Strictly typed provenance schema for Indian tech hiring (2026)
// ============================================================

export type SignalKind =
  | 'official-requirement'
  | 'company-published'
  | 'community-reported'
  | 'editorial-opinion';

export type SignalConfidence = 'high' | 'medium' | 'low' | 'unverified';

export type ArchetypeId =
  | 'big_tech_product'
  | 'quant_trading'
  | 'indian_high_growth'
  | 'product_mnc_gcc'
  | 'service_track'
  | 'early_growth_startup';

export interface MarketSignal {
  text: string;
  kind: SignalKind;
  sourceUrl: string | null;
  sourceName: string;
  lastReviewed: string; // ISO YYYY-MM-DD
  confidence: SignalConfidence;
  percentileContext?: string;
}

export interface EligibilityRule {
  aggregatePercent?: number;
  cgpaEquivalent?: number;
  batchYears?: number[];
  qualification?: string;
  sourceUrl: string | null;
  sourceName: string;
  note: string;
}

export interface MarketEntry {
  id: string;
  employerOrArchetype: string;
  track?: string;
  archetype: ArchetypeId;
  displayName: string;
  description: string;
  eligibility?: EligibilityRule;
  reportedPackageRange?: string;
  rubrics?: {
    coreFocus: string[];
    evaluationCriteria: string[];
    expectedArtifacts: string[];
  };
  signals: MarketSignal[];
}

export interface MarketDatasetSummary {
  totalProfiles: number;
  officialSourceCount: number;
  sourcePendingCount: number;
  lastReviewedRange: { earliest: string; latest: string };
}
