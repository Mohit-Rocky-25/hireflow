// ============================================================
// HireFlow ATS Engine — Core Types
// ============================================================

export type SkillCategory =
  | 'Languages'
  | 'Frontend'
  | 'Backend'
  | 'Databases'
  | 'Cloud'
  | 'DevOps/CI-CD'
  | 'Testing'
  | 'Data/ML'
  | 'Mobile'
  | 'Security'
  | 'Architecture/System Design'
  | 'Tools'
  | 'Soft/Leadership';

export interface TaxonomySkill {
  canonical: string;
  category: SkillCategory;
  aliases: string[];
  related: string[];
  weight: number; // 1 to 5
  implies?: string[];
}

export type SkillMatchStatus = 'exact' | 'alias' | 'implied' | 'related' | 'missing';

export interface SkillMatchResult {
  skill: string;
  category: SkillCategory;
  status: SkillMatchStatus;
  weight: number;
  importance: 'must_have' | 'nice_to_have';
  matchedAs?: string;
  evidenceSnippet?: string;
  gapType: 'matched' | 'wording_fix' | 'learn_needed';
}

export interface BulletAnalysis {
  rawText: string;
  score: number; // 0 - 100
  hasActionVerb: boolean;
  actionVerbFound?: string;
  hasMetric: boolean;
  metricFound?: string;
  hasTechnology: boolean;
  technologiesFound: string[];
  hasOutcome: boolean;
  weakPhrases: string[];
  isJobDescriptionStyle: boolean;
  critique?: string;
}

export interface FormatRiskItem {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence?: string;
}

export interface ParsedResume {
  rawText: string;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    links: string[];
  };
  sections: {
    summary?: string;
    skills?: string[];
    experience?: string[];
    projects?: string[];
    education?: string[];
    rawSections: Record<string, string>;
  };
  skillsExtracted: string[];
  bullets: BulletAnalysis[];
  totalYearsEstimate: number;
  wordCount: number;
  estimatedPages: number;
}

export interface ParsedJD {
  rawText: string;
  roleTitle: string;
  seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  yearsRequired: number;
  mustHaves: string[];
  niceToHaves: string[];
  responsibilities: string[];
  toolsMentioned: string[];
  domainKeywords: string[];
}

export interface SeniorityFitResult {
  candidateYears: number;
  requiredYears: number;
  status: 'underqualified' | 'fit' | 'overqualified';
  score: number; // 0 - 100
  reasoning: string;
}

export interface MarketTierFit {
  tier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
  displayName: string;
  score: number; // 0 - 100
  fitLevel: 'Strong Fit' | 'Borderline Fit' | 'Gap';
  missingSignalsForNextTier: string[];
  presentSignals: string[];
}

export interface ScoreBreakdown {
  mustHaveCoverageScore: number;    // Weight: 35%
  evidenceQualityScore: number;     // Weight: 20%
  niceToHaveCoverageScore: number;  // Weight: 10%
  seniorityFitScore: number;        // Weight: 10%
  projectRelevanceScore: number;    // Weight: 10%
  formatSafetyScore: number;        // Weight: 10%
  keywordStuffingPenalty: number;   // Deduction: 0 to -15
  finalScore: number;               // 0 - 100 (clamped)
}

export interface DeterministicFacts {
  resume: ParsedResume;
  jd: ParsedJD;
  skillMatches: SkillMatchResult[];
  matchedKeywords: string[];
  missingKeywords: string[];
  wordingFixSkills: string[];
  learnNeededSkills: string[];
  bulletAnalyses: BulletAnalysis[];
  formatRisks: FormatRiskItem[];
  seniorityFit: SeniorityFitResult;
  marketPositioning: {
    bestFitTier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
    tierFits: MarketTierFit[];
    topMissingSignals: string[];
  };
  scoreBreakdown: ScoreBreakdown;
  harshTruthsDeterministic: string[];
}

// Phase 3 LLM commentary and unified results
export interface HarshTruthItem {
  severity: 1 | 2 | 3 | 4 | 5;
  issue: string;
  evidenceQuote: string;
  whyItHurts: string;
  fix: string;
}

export interface BulletRewriteItem {
  original: string;
  rewritten: string;
  whatChanged: string;
}

export interface AICommentary {
  verdict: {
    headline: string;
    tone: 'strong' | 'borderline' | 'weak';
    oneParagraphSummary: string;
  };
  recruiterFirst6Seconds: string;
  harshTruths: HarshTruthItem[];
  skillGaps: Array<{
    skill: string;
    type: 'wording_fix' | 'learn_needed';
    fastestWayToClose: string;
    estimatedDays: number;
  }>;
  bulletRewrites: BulletRewriteItem[];
  marketPositioning: {
    bestFitTier: string;
    whyNotNextTier: string;
    topThreeSignalsToAdd: string[];
  };
  interviewRiskQuestions: Array<{
    question: string;
    whyTheyWillAsk: string;
    prepHint: string;
  }>;
  sevenDayPlan: Array<{
    day: number;
    task: string;
    outcome: string;
  }>;
  thirtyDayPlan: Array<{
    week: number;
    focus: string;
    deliverable: string;
  }>;
  alternativeRoles: Array<{
    role: string;
    fitScore: number;
    reason: string;
  }>;
}

export interface AnalysisResponse {
  facts: DeterministicFacts;
  ai?: AICommentary;
  isAiAvailable: boolean;
  aiErrorNotice?: string;
}
