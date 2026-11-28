// ============================================================
// ATS Resume Roaster — Core Types (Stage 3)
// Deterministic data structures and single source of truth
// ============================================================

export type TargetTierId = 'top_product' | 'startup_unicorn' | 'service_mnc' | 'auto';
export type ExperienceLevelId = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'fresher' | '1-3' | '3-6' | '6+' | 'auto';

export interface EvidenceQuote {
  quote: string;
  section: string;
  charStart: number;
  charEnd: number;
  hasMetric: boolean;
  bulletQuality?: number;
  evidenceTier?: number;
  isSubstitute?: boolean;
  substituteFor?: string;
  sourceType?: string;
  environmentMaturity?: string;
  candidateContribution?: string;
}

export type RequirementMatchStatus =
  | 'SATISFIED'
  | 'PARTIALLY_SATISFIED'
  | 'RELATED_BUT_NOT_EQUIVALENT'
  | 'NOT_DEMONSTRATED'
  | 'CONTRADICTED'
  | 'AMBIGUOUS';

export type MatchMethod =
  | 'EXACT'
  | 'ALIAS'
  | 'SEMANTIC'
  | 'ONTOLOGY_RELATIONSHIP'
  | 'ALTERNATIVE'
  | 'TRANSFERABLE';

export interface BranchEvaluation {
  expression: string;
  satisfied: boolean;
  status: RequirementMatchStatus;
  reason: string;
  matchedTechnology?: string;
  evidenceQuotes?: string[];
}

export interface RequirementMatchResult {
  requirementId: string;
  canonical: string;
  status: RequirementMatchStatus;
  matchMethod: MatchMethod | null;
  evidenceIds: string[];
  citationIds: string[];
  competencyIds: string[];
  evidenceContexts: string[];
  limitations: string[];
  explanation: string;
  confidence: number;
  branchResults?: BranchEvaluation[];
}

export interface SkillResult {
  skillId: string;
  canonical: string;
  category: string;
  required: 'must' | 'nice';
  weight: number;
  found: boolean;
  evidence: EvidenceQuote[];
  proficiency: number; // 0 (missing), 1 (weak/skills-list only), 2-3 (verified standard), 4-5 (verified with metrics)
  status: 'verified' | 'weak' | 'missing';
  evidenceScore?: number; // 0.0 to 1.0 tiered score
  isSubstituteMatch?: boolean;
  substituteSkillName?: string;
  satisfiedBySkillId?: string;
  satisfiedByCanonical?: string;
  orGroupId?: string;
  orAlternatives?: string[];
  logicalExpression?: import('./logicalExpression').LogicalExpression;
  claimSupport?: import('./citationModel').ClaimSupportStatus;
  citationValidity?: import('./citationModel').CitationValidationStatus;
  provenance?: import('./evidenceModel').EvidenceSource;
  attribution?: import('./evidenceModel').CandidateContribution;
  bm25Score?: number;
  validatedCitations?: import('./citationModel').ValidatedCitation[];
  matchResult?: RequirementMatchResult;
}

export interface ParsedSection {
  type: string; // 'experience' | 'projects' | 'education' | 'skills' | 'summary' | 'certifications' | 'achievements' | 'unknown'
  rawTitle: string;
  content: string;
  charStart: number;
  charEnd: number;
}

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

export interface BulletAnalysis {
  rawText: string;
  wordCount: number;
  hasStrongVerb: boolean;
  strongVerb?: string;
  hasWeakPhrase: boolean;
  weakPhrase?: string;
  hasMetric: boolean;
  metricMatched?: string;
  hasTechMention: boolean;
  score: number; // 0-100 quality
  issues: string[];
  isKeywordDump?: boolean;
  breakdown?: {
    actionVerbScore: number;
    metricScore: number;
    techScore: number;
    outcomeScore: number;
    deduction: number;
    total: number;
  };
  hasClichéVerb?: boolean;
  clichéVerbMatched?: string;
  plausibilityWarning?: string;
  isNegated?: boolean;
  negationSentiment?: import('./evidenceModel').NegationSentiment;
  metricEvidences?: import('./metricModel').MetricEvidence[];
  primaryMetricCategory?: import('./metricModel').MetricCategory;
  metricAttribution?: import('./metricModel').MetricAttributionStatus;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  dateRangeStr: string;
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  bullets: BulletAnalysis[];
  charStart: number;
  charEnd: number;
}

export interface ProjectEntry {
  title: string;
  url?: string;
  bullets: BulletAnalysis[];
  techStack: string[];
  charStart: number;
  charEnd: number;
}

export interface JdRequirement {
  skillId: string;
  canonical: string;
  category: string;
  required: 'must' | 'nice';
  weight: number;
  sourceType?: 'explicit' | 'inferred';
  sourceSentence?: string;
  confidence?: number;
  orGroupId?: string;
  orAlternatives?: string[];
  logicalExpression?: import('./logicalExpression').LogicalExpression;
  unresolved?: boolean;
  parseError?: string;
}

export interface InferredRecommendation {
  skillId: string;
  canonical: string;
  category: string;
  weight: number;
  sourceRole: string;
  reason: string;
}

export interface JdAnalysis {
  roleId: string;
  roleTitle: string;
  internalClassification?: string;
  employerProvidedTitle?: string;
  requiredSkills: JdRequirement[];
  inferredRecommendations?: InferredRecommendation[];
  unresolvedRequirements?: Array<{
    rawText: string;
    reason: string;
    required: 'must' | 'nice';
    logicalExpression?: import('./logicalExpression').LogicalExpression;
  }>;
  detectedYears?: number;
  rawText: string;
  requiredEducation?: string;
  requiredCerts?: string[];
}

export interface Subscores {
  mustHaveCoverage: number; // 0-30
  evidenceDepth: number;    // 0-20
  impactMetrics: number;    // 0-15
  projectsAndOss: number;   // 0-10
  seniorityFit: number;     // 0-10
  formatAndParse: number;   // 0-10
  tierFit: number;          // 0-5
  niceToHaveCoverage?: number;
  titleAlignment?: number;
  educationAndCerts?: number;
  parseHealth?: number;
}

export interface PenaltyItem {
  id: string;
  label: string;
  points: number;
  reason: string;
  owner?: string;
  cause?: string;
}

export interface FixFirstItem {
  title: string;
  reason: string;
  expectedScoreGain: number;
  type: 'missing_must_have' | 'weak_bullet' | 'keyword_stuffed' | 'missing_section';
  skillId?: string;
}

export interface QuickRoastProjection {
  finalScore: number;
  oneLineVerdict: string;
  strengths: Array<{ title: string; evidenceQuote: string }>;
  gaps: Array<{ title: string; gapType: string }>;
  prioritizedActions: Array<{ title: string; action: string }>;
}

export type ApplicationGuidance =
  | 'Ready to apply'
  | 'Apply after high-priority fixes'
  | 'Significant gaps to address'
  | 'Insufficient evidence to evaluate';

export type JdInputState =
  | 'no_jd'
  | 'insufficient_context'
  | 'unsupported_domain'
  | 'edu_cert_only'
  | 'no_requirements_recognized'
  | 'preferred_only'
  | 'ambiguous_or_contradictory'
  | 'supported_technical';

export type DomainCapabilityTier = 'supported' | 'partial' | 'experimental' | 'unsupported';

export interface DomainCapability {
  domainId:
    | 'software_engineering'
    | 'cloud_devops'
    | 'data_analytics'
    | 'cybersecurity'
    | 'product_management'
    | 'design_ux'
    | 'business_ops'
    | 'marketing'
    | 'finance'
    | 'sales'
    | 'hr'
    | 'research'
    | 'unknown';
  label: string;
  tier: DomainCapabilityTier;
  reason: string;
}

export interface AtsEngineResult {
  score: number;
  band: 'Strong' | 'Competitive' | 'Needs work' | 'Weak match';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceReason?: string;
  headline: string;
  oneParagraphSummary: string;
  subscores: Subscores;
  penalties: PenaltyItem[];
  skillResults: SkillResult[];
  mustHavesMet: string; // e.g. "5/6"
  mustHavesMetRatio: number;
  missingKeywordsCount: number;
  bestFitTier: string;
  seniorityFit: {
    candidateYears: number;
    requiredYears: number;
    level: string;
    fitExplanation: string;
    shortfallMonths?: number;
    surplusMonths?: number;
    status?: string;
  };
  seniorityMatchResult?: import('./seniorityMatcher').SeniorityMatchResult;
  seniorityMode?: import('./senioritySignals').SeniorityModeResult;
  parseQuality: 'High' | 'Medium' | 'Poor';
  fixFirst: FixFirstItem[];
  audit: {
    wordCount: number;
    experienceEntriesCount: number;
    projectsCount: number;
    bulletsCount: number;
    skillsParsedCount: number;
    contactInfo: ContactInfo;
    sectionsFound: string[];
    missingStandardSections: string[];
    weakBulletsCount: number;
    metricsRatio: number;
    stuffedSkills: string[];
  };
  learningPath: LearningPathResult;
  reportState?: import('./reportState').ReportState;
  /** @deprecated Legacy canonical analysis is retired from live runAtsEngine execution. */
  canonicalResult?: import('../../../lib/ats/canonicalAnalysis').CanonicalAnalysis;
  quickRoast?: QuickRoastProjection;
  applicationGuidance?: ApplicationGuidance;
  jdState?: JdInputState;
  domainCapability?: DomainCapability;
  contradictionDetected?: boolean;
  talentLensReadiness?: import('../../../lib/ats/canonicalAnalysis').CanonicalAnalysis['talentLensReadiness'];
  activeWeights?: Record<string, number>;
  scanIdentity?: import('./scanIdentity').ScanIdentity;
  employerName?: string | null;
  candidateName?: string | null;
  targetRoleTitle?: string | null;
  jobAnalysis?: JdAnalysis;
  evidenceRecords?: import('./evidenceModel').CandidateEvidenceRecord[];
  structuredProfile?: import('./evidenceModel').StructuredCandidateProfile;
  citationLedger?: import('./citationModel').CitationLedger;
  requirementMatches?: RequirementMatchResult[];
  trace?: import('../../../scoring/core/types').ScoreTrace;
  bandDetails?: import('../../../scoring/core/types').ScoreBand;
  specVersion?: string;
  engineVersion?: string;
  specFingerprint?: string;
  metricEvidences?: import('./metricModel').MetricEvidence[];
  impactTrace?: import('./metricModel').ImpactEvidenceTraceItem[];
}

export type LearningStage = 'Foundation' | 'Core Role Skills' | 'Differentiators';

export interface LearningStepPlan {
  stepNumber: number;
  title: string;
  action: string;
}

export interface LearningPathItem {
  skillId: string;
  canonical: string;
  category: string;
  stage: LearningStage;
  stageOrder: number;
  required: 'must' | 'nice';
  status: 'missing' | 'weak';
  weight: number;
  whyItMatters: string;
  orderRationale: string;
  prerequisitesNeeded: string[];
  unlocksSkills: string[];
  steps: LearningStepPlan[];
  exampleBullet: string;
  evidenceOfDone: string[];
}

export interface WeakBulletRewrite {
  originalBullet: string;
  score: number;
  weakness: string;
  templateRewrite: string;
  suggestedVerb: string;
  placeholders: string[];
}

export interface LearningPathResult {
  items: LearningPathItem[];
  byStage: {
    foundation: LearningPathItem[];
    core: LearningPathItem[];
    differentiators: LearningPathItem[];
  };
  totalSkillsToAcquire: number;
  mustHaveCount: number;
  niceToHaveCount: number;
  rewrites: WeakBulletRewrite[];
}

