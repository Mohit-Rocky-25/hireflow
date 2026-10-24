// ============================================================
// HireFlow Scoring Suite — Master Scoring Specification Types
// Single Source of Truth architecture for all scoring models
// ============================================================

export type SourceKind = 'editorial' | 'dataset' | 'official';

export type ExperienceLevel = 'Student' | 'Intern' | '0-2 yrs' | '2+ yrs';

export type RoleFamily =
  | 'Backend'
  | 'Frontend'
  | 'Full-stack'
  | 'Data/ML'
  | 'Mobile'
  | 'DevOps'
  | 'General';

export type PillarId =
  | 'requirement_coverage'
  | 'evidence_quality'
  | 'project_readiness'
  | 'parser_friendliness'
  | 'experience_fit';

export type ProfileId = 'fresher' | 'experienced';

export interface SubFeatureDefinition {
  id: string;
  label: string;
  description: string;
  nominalWeight: number; // weight within the pillar (0-100)
  sourceKind: SourceKind;
}

export interface PillarDefinition {
  id: PillarId;
  label: string;
  plainDescription: string;
  computeId: string;
  appliesWhen: string[]; // rule IDs
  subFeatures: SubFeatureDefinition[];
  nominalWeights: Record<ProfileId, number>; // Nominal weight per profile (sum across applicable = 100)
}

export interface ProfileDefinition {
  id: ProfileId;
  label: string;
  selectorRules: string[];
  weights: Record<PillarId, number>;
  note: string; // "editorial default"
}

export interface ApplicabilityRule {
  id: string;
  description: string;
  predicateId: string;
}

export interface ContextWeightTable {
  experience: number;          // 1.0
  projectWithLink: number;     // 0.8
  academicProject: number;     // 0.6
  skillsBlockOnly: number;     // 0.35
}

export interface BulletScoringTable {
  actionVerbMax: number;       // 20
  measuredResultMax: number;   // 30
  techInContextMax: number;    // 25
  outcomeImpactMax: number;    // 25
  verbClasses: {
    strong: number;            // 20
    standard: number;          // 15
    weak: number;              // 6
    none: number;              // 0
  };
  measuredResultClasses: {
    metricWithNoun: number;    // 30
    qualitativeResult: number; // 12
    none: number;              // 0
  };
  techContextClasses: {
    inContext: number;         // 25
    bareList: number;          // 8
    none: number;              // 0
  };
  outcomeClasses: {
    explicit: number;          // 25
    implied: number;           // 10
    none: number;              // 0
  };
}

export interface PriorityWeightsTable {
  mandatory: number;           // 3.0
  preferred: number;           // 1.5
  mentioned: number;           // 1.0
}

export interface ImplicationEdge {
  fromSkill: string;
  toSkill: string;
  type: 'STRONG' | 'WEAK';
  creditMultiplier: number;
  rationale: string;
}

export interface DeductionItem {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'advisory';
  deductionPoints: number;
  description: string;
}

export interface ParserFriendlinessTable {
  baseScore: number;           // 100
  deductions: DeductionItem[];
  advisories: DeductionItem[]; // Indian-specific advisories (photo, declaration, father name)
}

export interface RoleSignalLibrary {
  roleFamily: RoleFamily;
  baselineRequirements: string[];
  architectureKeywords: string[];
  productionPatterns: string[];
  outcomeMetrics: string[];
  craftsmanshipSignals: string[];
}

export interface TableProvenance {
  tableId: string;
  sourceKind: SourceKind;
  lastReviewed: string; // ISO date string YYYY-MM-DD
  citation: string;
  notes?: string;
}

export interface BandParameters {
  weightPerturbationFactor: number; // 0.2 (for x0.8 and x1.2)
  confidenceThreshold: number;      // 0.75
  stableWidthMax: number;           // 6
  moderateWidthMax: number;         // 12
  stableLabel: string;              // "Stable"
  moderateLabel: string;            // "Moderate"
  sensitiveLabel: string;           // "Sensitive"
}

export interface ExperienceFitParameters {
  maxGapYearsTolerance: number;     // 0
  penaltySlopePerYear: number;      // 20 points per year gap
  minFloorScore: number;            // 10
  maxScore: number;                 // 100
}

export interface ScoreCaps {
  maxComposite: number;             // 100
  minComposite: number;             // 0
  maxPillarScore: number;           // 100
  minPillarScore: number;           // 0
  maxBulletScore: number;           // 100
  minBulletScore: number;           // 0
}

export interface LabelThresholds {
  withinReach: number;              // 75
  stretch: number;                  // 50
  far: number;                      // 0
}

export interface TaxonomyReference {
  version: string;
  sourceFile: string;
}

export interface ConfidenceThresholds {
  mustWithCue: number;         // 0.95
  mustStandard: number;        // 0.90
  preferredWithCue: number;    // 0.90
  preferredStandard: number;   // 0.85
  mentioned: number;           // 0.70
  unrecognizedTerm: number;    // 0.65
}

export type MarketArchetypeId =
  | 'big_tech_product'
  | 'quant_trading'
  | 'indian_high_growth'
  | 'product_mnc_gcc'
  | 'service_track'
  | 'early_growth_startup';

export interface ArchetypeProfileDefinition {
  id: MarketArchetypeId;
  label: string;
  weights: Record<PillarId, number>;
  focusPillars: PillarId[];
  note: string;
}

export interface ScoringSpec {
  specVersion: string;
  engineVersion: string;
  pillars: PillarDefinition[];
  profiles: ProfileDefinition[];
  archetypeProfiles?: Record<MarketArchetypeId, ArchetypeProfileDefinition>;
  applicabilityRules: ApplicabilityRule[];
  evidenceTables: {
    contextWeight: ContextWeightTable;
    bulletScoring: BulletScoringTable;
    priorityWeights: PriorityWeightsTable;
    implicationEdges: ImplicationEdge[];
    parserFriendliness: ParserFriendlinessTable;
    caps: ScoreCaps;
  };
  roleSignalLibraries: Record<RoleFamily, RoleSignalLibrary>;
  bandParameters: BandParameters;
  labelThresholds: LabelThresholds;
  confidenceThresholds: ConfidenceThresholds;
  experienceFitParameters: ExperienceFitParameters;
  taxonomyReference: TaxonomyReference;
  provenance: TableProvenance[];
}


