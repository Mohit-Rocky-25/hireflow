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
  isClaimedOnly?: boolean;
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
  careerLevel?: 'student' | 'fresher' | 'junior' | 'mid' | 'senior';
  parseStatus?: 'success' | 'warning' | 'failed';
  parseWarnings?: string[];
}

export interface JDRequirement {
  id: string;
  text: string;
  category: 'language' | 'framework' | 'tool' | 'concept' | 'domain' | 'soft' | 'education' | 'experience';
  type: 'must' | 'nice';
  weight: number; // 1-5
  expectedLevel: number; // 1-4
  evidenceQuoteFromJD?: string;
  inferred?: boolean;
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
  requirements?: JDRequirement[];
  dealbreakers?: string[];
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
  seniorityFitScore: number;        // Weight: 15%
  projectRelevanceScore: number;    // Weight: 10%
  formatSafetyScore: number;        // Weight: 10%
  keywordStuffingPenalty: number;   // Deduction: 0 to -15
  finalScore: number;               // 0 - 100 (clamped)
  confidence?: 'High' | 'Medium' | 'Low';
  confidenceReason?: string;
  isEvidenceNA?: boolean;
  scoreExplanation?: Record<string, string[]>;
  dealbreakerTriggered?: { rule: string; reason: string };
  verifiedCitationsCount?: number;
  effectiveWeights?: {
    mustHave: number;
    evidence: number;
    niceToHave: number;
    seniority: number;
    projects: number;
    format: number;
  };
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
  verifiedCitationsCount?: number;
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
    label?: string;
    summary?: string;
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

// ============================================================
// Phase 2 Pipeline Types (Pass A, Pass B, Pass C)
// ============================================================

export interface PassAResume {
  contact: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGitHub: boolean;
    hasPortfolio: boolean;
    links: string[];
  };
  summary: string | null;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    startYear: string | number;
    endYear: string | number;
    gpaOrCgpa: string | null;
  }>;
  experience: Array<{
    company: string;
    title: string;
    start: string;
    end: string;
    durationMonths: number;
    isInternship: boolean;
    bullets: Array<{ text: string; verbatim: boolean }>;
  }>;
  projects: Array<{
    name: string;
    stack: string[];
    bullets: string[];
    hasLiveUrlOrRepo: boolean;
    role: 'solo' | 'team' | 'unknown';
  }>;
  skillsSection: Array<{ name: string; category: string }>;
  certifications: string[];
  achievements: string[];
  competitiveProgramming: { platform: string; rating: string | null } | null;
  totalExperienceMonths: number;
  careerLevel: 'student' | 'fresher' | 'junior' | 'mid' | 'senior';
  parseWarnings: string[];
  parseStatus?: 'ok' | 'warning' | 'failed';
}

export interface PassAJDRequirement {
  id: string;
  text: string;
  category: 'language' | 'framework' | 'tool' | 'concept' | 'domain' | 'soft' | 'education' | 'experience';
  type: 'must' | 'nice';
  weight: number; // 1-5
  expectedLevel: number; // 1-4
  evidenceQuoteFromJD: string;
  inferred?: boolean;
}

export interface PassAJDGraph {
  roleTitle: string;
  seniority: string;
  domain: string;
  yearsRequired: number | null;
  requirements: PassAJDRequirement[];
  responsibilities: string[];
  dealbreakers: string[];
}

export interface PassBRequirementJudgment {
  requirementId: string;
  status: 'demonstrated' | 'claimed_only' | 'transferable' | 'missing';
  proficiencyLevel: number; // 0-5
  evidence: Array<{ quote: string; location: string }>;
  transferableFrom: string[];
  reasoning: string;
  confidence: number; // 0-1
}

export interface PassBCandidateJudgments {
  judgments: PassBRequirementJudgment[];
  keywordStuffing: string[];
  inflatedClaims: string[];
  redFlags: string[];
  strengths: Array<{ title: string; evidenceQuote: string }>;
}

export interface PassCNarrative {
  verdict: {
    label: 'Strong match' | 'Competitive' | 'Borderline' | 'Long shot' | 'Not aligned';
    headline: string;
    summary: string; // <= 60 words
  };
  topFixes: Array<{
    rank: number;
    title: string;
    why: string;
    how: string;
    effort: 'hours' | 'days' | 'weeks';
    impactOnScore: string;
  }>;
  truths: Array<{
    severity: number;
    issue: string;
    evidenceQuote: string | null;
    whyItHurts: string;
    fix: string;
  }>;
  recruiterSixSeconds: {
    whatStandsOut: string[];
    whatRaisesDoubts: string[];
  };
  tierFit: Array<{
    tier: 'S' | 'A' | 'B' | 'C';
    fitPercent: number;
    whyOrWhyNot: string;
    signalsNeeded: string[];
  }>;
  interviewRisks: Array<{
    question: string;
    whyAsked: string;
    prep: string;
  }>;
  plan7Days: Array<{
    day: number;
    task: string;
    outcome: string;
  }>;
  plan30Days: Array<{
    week: number;
    focus: string;
    deliverable: string;
  }>;
  rewrites: Array<{
    original: string;
    rewritten: string;
    note: string;
  }>;
  alternativeRoles: Array<{
    role: string;
    fitPercent: number;
    why: string;
  }>;
}

export interface AnalysisResponse {
  facts: DeterministicFacts;
  ai?: AICommentary;
  isAiAvailable: boolean;
  aiErrorNotice?: string;
  passA?: {
    resume: PassAResume;
    jd: PassAJDGraph;
  };
  passB?: PassBCandidateJudgments;
  narrative?: PassCNarrative;
  debugMath?: {
    mustHaveMath: string;
    evidenceMath: string;
    seniorityMath: string;
    projectMath: string;
    formatMath: string;
    penaltyMath: string;
    finalFormula: string;
    effectiveWeights: Record<string, number>;
  };
}

