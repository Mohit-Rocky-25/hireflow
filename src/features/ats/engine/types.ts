// ============================================================
// ATS Resume Roaster — Core Types (Stage 3)
// Deterministic data structures and single source of truth
// ============================================================

export type TargetTierId = 'top_product' | 'startup_unicorn' | 'service_mnc' | 'auto';
export type ExperienceLevelId = 'fresher' | '1-3' | '3-6' | '6+' | 'auto';

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
  bm25Score?: number;
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
  orGroupId?: string;
  orAlternatives?: string[];
}

export interface JdAnalysis {
  roleId: string;
  roleTitle: string;
  requiredSkills: JdRequirement[];
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
}

export interface FixFirstItem {
  title: string;
  reason: string;
  expectedScoreGain: number;
  type: 'missing_must_have' | 'weak_bullet' | 'keyword_stuffed' | 'missing_section';
  skillId?: string;
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
  };
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

