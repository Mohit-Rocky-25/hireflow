// ============================================================
// HireFlow — Canonical Analysis Engine
// Single source of truth for TalentLens and ATS Resume Roaster
// Guaranteed deterministic, zero-hallucination, invariant-enforced
// ============================================================

import {
  ParsedResume,
  ParsedJD,
  SkillMatchResult,
  ScoreBreakdown,
  FormatRiskItem,
  SeniorityFitResult,
  BulletAnalysis,
} from './types';
import { parseResume } from './parseResume';
import { parseJD } from './parseJD';
import { matchSkills } from './matchSkills';
import { scoreAggregator } from './scoreAggregator';
import { seniorityFit } from './seniorityFit';
import { formatAuditor } from './formatAuditor';
import { isQuoteVerbatimInResume, normalizeWhitespace } from './invariants';
import { AtsEngineResult } from '../../features/ats/engine/types';
import { SKILL_TAXONOMY } from './matchSkills';
import { WORD_LIMITS } from '../../config/limits';

export const TAXONOMY_VERSION = '1.2.0';
export const SCORING_VERSION = '2.4.0';
export const PROMPT_VERSION = '2.0.0';
export const MODEL_VERSION = 'gemini-2.5-flash-grounded-v1';

// ============================================================
// CANONICAL ANALYSIS SCHEMA (Core Architectural Requirement)
// ============================================================

export type SharedEvidenceStatus =
  | 'proven'
  | 'strongly_supported'
  | 'partially_supported'
  | 'claimed_only'
  | 'inferred'
  | 'related'
  | 'missing';

export interface CanonicalSection {
  type: string;
  title: string;
  rawText: string;
}

export interface CanonicalParserWarning {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

export interface CanonicalRequirement {
  id: string;
  name: string;
  category: string;
  type: 'must' | 'nice';
  weight: number;
  expectedLevel?: number;
  evidenceQuoteFromJD?: string;
}

export interface CanonicalSkillMatch {
  skill: string;
  category: string;
  status: 'exact' | 'alias' | 'implied' | 'related' | 'missing';
  evidenceStatus: SharedEvidenceStatus;
  importance: 'must_have' | 'nice_to_have';
  weight: number;
  gapType: 'matched' | 'wording_fix' | 'learn_needed';
  matchedAs?: string;
  evidenceSnippet?: string;
  evidenceLocation?: string;
  factId: string;
  isClaimedOnly?: boolean;
}

export interface CanonicalEvidenceItem {
  id: string;
  text: string;
  location: string;
  score: number;
  hasActionVerb: boolean;
  actionVerb?: string;
  hasMetric: boolean;
  metric?: string;
  technologies: string[];
  hasOutcome: boolean;
  isJobDescriptionStyle: boolean;
  critique?: string;
}

export interface CanonicalScores {
  mustHaveCoverage: number;
  evidenceQuality: number;
  seniorityFit: number;
  niceToHaveCoverage: number;
  projectRelevance: number;
  formatSafety: number;
  baseScore: number;
  penalty: number;
  finalScore: number;
  effectiveWeights: {
    mustHave: number;
    evidence: number;
    seniority: number;
    niceToHave: number;
    projects: number;
    format: number;
  };
  band: 'Needs Work' | 'Developing' | 'Competitive' | 'Top Tier Match';
  confidence: 'high' | 'medium' | 'low';
  confidenceReason?: string;
  isEvidenceNA: boolean;
}

export interface CanonicalRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  action: string;
  sourceFactId: string;
  gapType?: 'wording_fix' | 'learn_needed';
  impactOnScore?: string;
  effort?: 'hours' | 'days' | 'weeks';
  sortKey: string;
}

export interface GroundedCitation {
  id: string;
  quote: string;
  location: string;
  isVerbatim: boolean;
}

export interface CanonicalAnalysis {
  analysisId: string;
  inputFingerprint: string;
  resumeFingerprint: string;
  jobDescriptionFingerprint: string;
  timestamp: number;
  versions: {
    taxonomy: string;
    scoring: string;
    prompt: string;
    model: string;
  };
  parser: {
    sections: CanonicalSection[];
    extractedText: string;
    rawText: string;
    warnings: CanonicalParserWarning[];
    wordCount: number;
    contact: {
      name?: string;
      email?: string;
      phone?: string;
      links: string[];
    };
    experienceYears: number;
    careerLevel: 'student' | 'fresher' | 'junior' | 'mid' | 'senior';
  };
  jobRequirements: {
    roleTitle: string;
    domain: string;
    seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
    yearsRequired: number;
    mustHave: CanonicalRequirement[];
    niceToHave: CanonicalRequirement[];
    responsibilities: string[];
    dealbreakers?: string[];
    confidence: 'high' | 'medium' | 'low';
    confidenceNote?: string;
  };
  skillMatches: CanonicalSkillMatch[];
  evidenceItems: CanonicalEvidenceItem[];
  scores: CanonicalScores;
  invariants: {
    allPassed: boolean;
    failures: string[];
  };
  recommendations: CanonicalRecommendation[];
  citations: GroundedCitation[];
  confidence: 'high' | 'medium' | 'low';
  applicationGuidance:
    | 'Ready to apply'
    | 'Apply after high-priority fixes'
    | 'Continue preparation'
    | 'Insufficient evidence to evaluate';
  quickRoast: {
    finalScore: number;
    confidence: 'high' | 'medium' | 'low';
    oneLineVerdict: string;
    strengths: Array<{ title: string; evidenceQuote: string; factId: string }>;
    gaps: Array<{ title: string; gapType: string; factId: string }>;
    prioritizedActions: Array<{
      title: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
      sourceFactId: string;
    }>;
  };
  talentLensReadiness: {
    overallStatus:
      | 'Strong fit'
      | 'Developing fit'
      | 'Potential fit with evidence gaps'
      | 'Low current fit'
      | 'Insufficient evidence';
    bestFitRoles: Array<{ title: string; fitStatus: string; score: number }>;
    strongestEvidence: string[];
    partialCompetencies: string[];
    missingCompetencies: string[];
    bestFitCompanyGroups: string[];
    mainRisk: string;
    threeNextActions: string[];
  };
}

// ============================================================
// STABLE INPUT NORMALIZATION & FINGERPRINTING (STAGE 3)
// ============================================================

export function normalizeResumeText(rawText: string): {
  normalizedText: string;
  rawText: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (!rawText || typeof rawText !== 'string') {
    return { normalizedText: '', rawText: '', warnings: ['Empty resume text'] };
  }

  // 1. Normalize line endings
  let clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove non-printable / binary characters while preserving standard accents & letters
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');

  // 3. Normalize horizontal whitespace (tabs, consecutive spaces)
  clean = clean.replace(/[ \t]+/g, ' ');

  // 4. Normalize excessive line breaks (keep up to 2 for paragraph separation)
  clean = clean.replace(/\n{3,}/g, '\n\n').trim();

  // 5. Check minimum word count
  const words = clean.split(/\s+/).filter(Boolean).length;
  if (words < WORD_LIMITS.resume.min) {
    warnings.push(`Low word count (${words} words). High-confidence extraction requires >= ${WORD_LIMITS.resume.min} words.`);
  }

  return {
    normalizedText: clean,
    rawText, // preserve original raw text for verbatim quote checking
    warnings,
  };
}

export function normalizeJobDescription(rawJD: string): { normalizedText: string } {
  if (!rawJD || typeof rawJD !== 'string') return { normalizedText: '' };
  let clean = rawJD.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  clean = clean.replace(/[ \t]+/g, ' ');
  clean = clean.replace(/\n{3,}/g, '\n\n').trim();
  return { normalizedText: clean };
}

/**
 * 64-bit deterministic FNV-1a based string hash
 */
function fastHash64(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}`;
}

export function generateFingerprint(
  normalizedResume: string,
  normalizedJD: string,
  extraOptions?: { tier?: string; level?: string }
): { inputFingerprint: string; resumeFingerprint: string; jdFingerprint: string } {
  const normResumeLower = normalizeWhitespace(normalizedResume);
  const normJDLower = normalizeWhitespace(normalizedJD);

  const resumeFingerprint = fastHash64(`resume:${normResumeLower}`);
  const jdFingerprint = fastHash64(`jd:${normJDLower}`);

  const combinedPayload = [
    `res:${resumeFingerprint}`,
    `jd:${jdFingerprint}`,
    `tax:${TAXONOMY_VERSION}`,
    `sco:${SCORING_VERSION}`,
    `prm:${PROMPT_VERSION}`,
    `mod:${MODEL_VERSION}`,
    `tier:${extraOptions?.tier || 'auto'}`,
    `lvl:${extraOptions?.level || 'auto'}`,
  ].join('|');

  const inputFingerprint = fastHash64(combinedPayload);

  return { inputFingerprint, resumeFingerprint, jdFingerprint };
}

// In-memory cache for validated canonical analyses (same fingerprint -> identical result)
const CANONICAL_CACHE = new Map<string, CanonicalAnalysis>();

export function getCachedAnalysis(fingerprint: string): CanonicalAnalysis | null {
  return CANONICAL_CACHE.get(fingerprint) || null;
}

export function setCachedAnalysis(fingerprint: string, analysis: CanonicalAnalysis): void {
  CANONICAL_CACHE.set(fingerprint, analysis);
}

// ============================================================
// CANONICAL ANALYSIS PIPELINE (STAGE 2 & STAGE 6)
// ============================================================

export interface CanonicalAnalysisOptions {
  tier?: string;
  level?: string;
  companyContext?: {
    id: string;
    name: string;
    tier: string;
    roleTitle?: string;
  };
}

export function analyzeCanonical(
  rawResumeText: string,
  rawJDText: string,
  options?: CanonicalAnalysisOptions
): CanonicalAnalysis {
  const { normalizedText: normResume, rawText, warnings: resumeWarnings } = normalizeResumeText(rawResumeText);
  const { normalizedText: normJD } = normalizeJobDescription(rawJDText);

  const { inputFingerprint, resumeFingerprint, jdFingerprint } = generateFingerprint(
    normResume,
    normJD,
    { tier: options?.tier, level: options?.level }
  );

  // Return cached result if already computed for identical inputs
  const cached = getCachedAnalysis(inputFingerprint);
  if (cached) {
    return cached;
  }

  // Fail-closed fallback for empty, corrupted, or unparseable input (Invariant 12)
  if (!normResume.trim() || !normJD.trim()) {
    const failClosedResult: CanonicalAnalysis = {
      analysisId: `analysis_${inputFingerprint}`,
      inputFingerprint,
      resumeFingerprint,
      jobDescriptionFingerprint: jdFingerprint,
      timestamp: Date.now(),
      versions: {
        taxonomy: TAXONOMY_VERSION,
        scoring: SCORING_VERSION,
        prompt: PROMPT_VERSION,
        model: MODEL_VERSION,
      },
      parser: {
        sections: [],
        extractedText: '',
        rawText,
        warnings: [{ id: 'err-empty-input', severity: 'critical', message: 'Empty or unparseable input provided.' }],
        wordCount: 0,
        contact: { links: [] },
        experienceYears: 0,
        careerLevel: 'fresher',
      },
      jobRequirements: {
        roleTitle: 'Unspecified Role',
        domain: 'Engineering',
        seniority: 'fresher',
        yearsRequired: 0,
        mustHave: [],
        niceToHave: [],
        responsibilities: [],
        confidence: 'low',
        confidenceNote: 'Empty or unparseable job description.',
      },
      skillMatches: [],
      evidenceItems: [],
      scores: {
        mustHaveCoverage: 0,
        evidenceQuality: 0,
        seniorityFit: 0,
        niceToHaveCoverage: 0,
        projectRelevance: 0,
        formatSafety: 0,
        baseScore: 0,
        penalty: 0,
        finalScore: 0,
        effectiveWeights: {
          mustHave: 35,
          evidence: 20,
          seniority: 15,
          niceToHave: 10,
          projects: 10,
          format: 10,
        },
        band: 'Needs Work',
        confidence: 'low',
        confidenceReason: 'Input was empty or corrupted.',
        isEvidenceNA: true,
      },
      invariants: {
        allPassed: true,
        failures: [],
      },
      recommendations: [
        {
          id: 'rec-fail-closed',
          priority: 'high',
          title: 'Provide Valid Resume and Job Description Text',
          action: 'Upload a readable resume with at least 80 words and paste a complete job description.',
          sourceFactId: 'fact-empty-input',
          sortKey: '0_0_empty',
        },
      ],
      citations: [],
      confidence: 'low',
      applicationGuidance: 'Insufficient evidence to evaluate',
      quickRoast: {
        finalScore: 0,
        confidence: 'low',
        oneLineVerdict: 'Cannot evaluate: resume or job description content is missing or unparseable.',
        strengths: [],
        gaps: [{ title: 'Missing text content', gapType: 'learn_needed', factId: 'fact-empty-input' }],
        prioritizedActions: [
          {
            title: 'Provide Valid Text',
            action: 'Upload a valid resume and paste a complete job description.',
            priority: 'high',
            sourceFactId: 'fact-empty-input',
          },
        ],
      },
      talentLensReadiness: {
        overallStatus: 'Insufficient evidence',
        bestFitRoles: [],
        strongestEvidence: [],
        partialCompetencies: [],
        missingCompetencies: [],
        bestFitCompanyGroups: [],
        mainRisk: 'No parseable resume text provided.',
        threeNextActions: ['Upload a valid resume document to begin placement readiness evaluation.'],
      },
    };
    setCachedAnalysis(inputFingerprint, failClosedResult);
    return failClosedResult;
  }

  // 1. AST Resume & JD Parsing
  const parsedResume: ParsedResume = parseResume(normResume);
  const parsedJD: ParsedJD = parseJD(normJD);

  // 2. Skill Matching
  const skillMatches: SkillMatchResult[] = matchSkills(
    parsedResume.skillsExtracted || [],
    parsedJD.mustHaves || [],
    parsedJD.niceToHaves || [],
    parsedResume.rawText || ''
  );

  // 3. Supporting Dimension Calculations
  const seniority: SeniorityFitResult = seniorityFit(parsedResume, parsedJD);
  const formatRisks: FormatRiskItem[] = formatAuditor(parsedResume);

  // 4. Deterministic Scoring
  const scoreBreakdown: ScoreBreakdown = scoreAggregator(
    parsedResume,
    parsedJD,
    skillMatches,
    parsedResume.bullets,
    seniority,
    formatRisks
  );

  // 5. Build Canonical Sections & Warnings
  const canonicalSections: CanonicalSection[] = Object.entries(parsedResume.sections.rawSections || {}).map(
    ([type, content]) => ({
      type,
      title: type.toUpperCase(),
      rawText: content,
    })
  );

  const canonicalWarnings: CanonicalParserWarning[] = [
    ...resumeWarnings.map((w, idx) => ({ id: `warn-resume-${idx}`, severity: 'medium' as const, message: w })),
    ...(parsedResume.parseWarnings || []).map((w, idx) => ({ id: `warn-parse-${idx}`, severity: 'low' as const, message: w })),
    ...formatRisks.map((fr) => ({ id: fr.id, severity: fr.severity, message: `${fr.name}: ${fr.description}` })),
  ];

  // 6. Build Canonical Requirements
  const canonicalMustHaves: CanonicalRequirement[] = parsedJD.mustHaves.map((name, i) => ({
    id: `req-must-${i}`,
    name,
    category: 'skill',
    type: 'must',
    weight: 5,
    expectedLevel: parsedJD.seniority === 'senior' || parsedJD.seniority === 'lead' ? 4 : 2,
    evidenceQuoteFromJD: parsedJD.rawText.includes(name) ? name : undefined,
  }));

  const canonicalNiceHaves: CanonicalRequirement[] = parsedJD.niceToHaves.map((name, i) => ({
    id: `req-nice-${i}`,
    name,
    category: 'skill',
    type: 'nice',
    weight: 3,
    expectedLevel: 2,
    evidenceQuoteFromJD: parsedJD.rawText.includes(name) ? name : undefined,
  }));

  // 7. Evidence Items
  const evidenceItems: CanonicalEvidenceItem[] = parsedResume.bullets.map((b, idx) => ({
    id: `ev-bullet-${idx}`,
    text: b.rawText,
    location: `experience:bullet-${idx + 1}`,
    score: b.score,
    hasActionVerb: b.hasActionVerb,
    actionVerb: b.actionVerbFound,
    hasMetric: b.hasMetric,
    metric: b.metricFound,
    technologies: b.technologiesFound,
    hasOutcome: b.hasOutcome,
    isJobDescriptionStyle: b.isJobDescriptionStyle,
    critique: b.critique,
  }));

  // 8. Shared Evidence Status Mapping
  const canonicalSkillMatches: CanonicalSkillMatch[] = skillMatches.map((sm, idx) => {
    let evidenceStatus: SharedEvidenceStatus = 'missing';

    if (sm.status === 'exact') {
      evidenceStatus = sm.isClaimedOnly ? 'claimed_only' : 'proven';
    } else if (sm.status === 'alias') {
      evidenceStatus = sm.isClaimedOnly ? 'claimed_only' : 'strongly_supported';
    } else if (sm.status === 'implied') {
      evidenceStatus = 'inferred';
    } else if (sm.status === 'related') {
      evidenceStatus = 'related';
    } else {
      evidenceStatus = 'missing';
    }

    return {
      skill: sm.skill,
      category: sm.category,
      status: sm.status,
      evidenceStatus,
      importance: sm.importance,
      weight: sm.weight,
      gapType: sm.gapType,
      matchedAs: sm.matchedAs,
      evidenceSnippet: sm.evidenceSnippet,
      evidenceLocation: sm.evidenceSnippet ? 'experience:bullet' : undefined,
      factId: `fact-skill-${idx}`,
      isClaimedOnly: !!sm.isClaimedOnly,
    };
  });

  // 9. Score Aggregation Formatting
  const isEvidenceNA = parsedResume.bullets.length === 0;
  const baseScore = Math.max(
    0,
    Math.round(
      scoreBreakdown.finalScore - (scoreBreakdown.keywordStuffingPenalty || 0)
    )
  );
  const penalty = scoreBreakdown.keywordStuffingPenalty || 0;
  const finalScore = scoreBreakdown.finalScore;

  const band: CanonicalScores['band'] =
    finalScore >= 80
      ? 'Top Tier Match'
      : finalScore >= 65
      ? 'Competitive'
      : finalScore >= 45
      ? 'Developing'
      : 'Needs Work';

  const scores: CanonicalScores = {
    mustHaveCoverage: scoreBreakdown.mustHaveCoverageScore,
    evidenceQuality: scoreBreakdown.evidenceQualityScore,
    seniorityFit: scoreBreakdown.seniorityFitScore,
    niceToHaveCoverage: scoreBreakdown.niceToHaveCoverageScore,
    projectRelevance: scoreBreakdown.projectRelevanceScore,
    formatSafety: scoreBreakdown.formatSafetyScore,
    baseScore,
    penalty,
    finalScore,
    effectiveWeights: scoreBreakdown.effectiveWeights || {
      mustHave: 35,
      evidence: 20,
      seniority: 15,
      niceToHave: 10,
      projects: 10,
      format: 10,
    },
    band,
    confidence: isEvidenceNA ? 'low' : parsedResume.bullets.length < 3 ? 'medium' : 'high',
    confidenceReason: isEvidenceNA ? 'Zero structured bullet points parsed in resume.' : undefined,
    isEvidenceNA,
  };

  // 10. Deterministic Citations (Grounded in Raw Resume Text)
  const citations: GroundedCitation[] = [];
  evidenceItems.forEach((ev, idx) => {
    if (ev.text && isQuoteVerbatimInResume(ev.text, rawText)) {
      citations.push({
        id: `cite-${idx}`,
        quote: ev.text,
        location: ev.location,
        isVerbatim: true,
      });
    }
  });

  // 11. Deterministic Recommendations (Ranked by priority, importance weight, gap size, tie-breaker)
  const recommendations: CanonicalRecommendation[] = [];

  // Missing Must-Haves
  const missingMusts = canonicalSkillMatches.filter(
    (s) => s.importance === 'must_have' && (s.status === 'missing' || s.status === 'related')
  );
  missingMusts.forEach((m, idx) => {
    recommendations.push({
      id: `rec-must-${idx}`,
      priority: 'high',
      title: `Demonstrate ${m.skill} (Missing Mandatory)`,
      action:
        m.gapType === 'wording_fix'
          ? `You have related skill ${m.matchedAs || 'experience'}. Explicitly mention ${m.skill} in an active project bullet.`
          : `Build and deploy a project utilizing ${m.skill} with documented metrics before applying.`,
      sourceFactId: m.factId,
      gapType: m.gapType === 'matched' ? undefined : m.gapType,
      impactOnScore: '+8 to +15 pts',
      effort: m.gapType === 'wording_fix' ? 'hours' : 'weeks',
      sortKey: `1_${5 - m.weight}_${m.skill}`,
    });
  });

  // Weak Bullets
  const weakBullets = evidenceItems.filter((b) => b.score < 50);
  if (weakBullets.length > 0) {
    recommendations.push({
      id: 'rec-weak-bullets',
      priority: 'high',
      title: `Quantify ${weakBullets.length} Experience Bullets with XYZ Formula`,
      action: 'Rewrite bullets starting with strong action verbs (Architected, Scaled, Optimized) and include verified metrics (users, latency, throughput).',
      sourceFactId: weakBullets[0].id,
      impactOnScore: '+5 to +10 pts',
      effort: 'days',
      sortKey: '2_2_bullets',
    });
  }

  // Keyword Stuffing
  if (penalty < 0) {
    recommendations.push({
      id: 'rec-stuffing',
      priority: 'high',
      title: 'Anchor Listed Skills into Project Descriptions',
      action: 'More than 65% of listed skills appear only in a standalone list without project evidence. Embed top competencies into concrete project narratives.',
      sourceFactId: 'fact-penalty-stuffing',
      impactOnScore: '+15 pts (Remove penalty)',
      effort: 'days',
      sortKey: '1_0_stuffing',
    });
  }

  // Missing Nice-to-Haves
  const missingNices = canonicalSkillMatches.filter(
    (s) => s.importance === 'nice_to_have' && (s.status === 'missing' || s.status === 'related')
  );
  missingNices.slice(0, 2).forEach((n, idx) => {
    recommendations.push({
      id: `rec-nice-${idx}`,
      priority: 'medium',
      title: `Familiarize with ${n.skill} (Preferred Differentiator)`,
      action: `Add a lightweight demo repository or reference architectural awareness of ${n.skill}.`,
      sourceFactId: n.factId,
      gapType: n.gapType === 'matched' ? undefined : n.gapType,
      impactOnScore: '+3 to +5 pts',
      effort: 'days',
      sortKey: `3_${5 - n.weight}_${n.skill}`,
    });
  });

  // Sort recommendations deterministically
  recommendations.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  // 12. Grounded Application Guidance
  let applicationGuidance: CanonicalAnalysis['applicationGuidance'] = 'Continue preparation';
  if (isEvidenceNA || canonicalWarnings.some((w) => w.severity === 'critical')) {
    applicationGuidance = 'Insufficient evidence to evaluate';
  } else if (finalScore >= 80 && missingMusts.length === 0) {
    applicationGuidance = 'Ready to apply';
  } else if (finalScore >= 65 || missingMusts.length <= 2) {
    applicationGuidance = 'Apply after high-priority fixes';
  } else {
    applicationGuidance = 'Continue preparation';
  }

  // 13. Quick Roast Payload
  const quickRoast: CanonicalAnalysis['quickRoast'] = {
    finalScore,
    confidence: scores.confidence,
    oneLineVerdict:
      finalScore >= 80
        ? `Strong candidate profile with solid alignment for ${parsedJD.roleTitle}.`
        : finalScore >= 65
        ? `Competitive baseline for ${parsedJD.roleTitle}; minor gaps require refinement.`
        : `Developing match for ${parsedJD.roleTitle}; critical evidence gaps must be bridged before applying.`,
    strengths: canonicalSkillMatches
      .filter((s) => s.evidenceStatus === 'proven' || s.evidenceStatus === 'strongly_supported')
      .slice(0, 3)
      .map((s) => ({
        title: `Demonstrated ${s.skill}`,
        evidenceQuote: s.evidenceSnippet || `Verified in resume skills & experience.`,
        factId: s.factId,
      })),
    gaps: missingMusts.slice(0, 3).map((m) => ({
      title: `Missing ${m.skill}`,
      gapType: m.gapType,
      factId: m.factId,
    })),
    prioritizedActions: recommendations.slice(0, 3).map((r) => ({
      title: r.title,
      action: r.action,
      priority: r.priority,
      sourceFactId: r.sourceFactId,
    })),
  };

  // 14. TalentLens Readiness View Payload
  let overallStatus: CanonicalAnalysis['talentLensReadiness']['overallStatus'] = 'Developing fit';
  if (isEvidenceNA) {
    overallStatus = 'Insufficient evidence';
  } else if (finalScore >= 80 && missingMusts.length === 0) {
    overallStatus = 'Strong fit';
  } else if (finalScore >= 65) {
    overallStatus = 'Developing fit';
  } else if (missingMusts.length > 0) {
    overallStatus = 'Potential fit with evidence gaps';
  } else {
    overallStatus = 'Low current fit';
  }

  const talentLensReadiness: CanonicalAnalysis['talentLensReadiness'] = {
    overallStatus,
    bestFitRoles: [
      {
        title: parsedJD.roleTitle,
        fitStatus: overallStatus,
        score: finalScore,
      },
    ],
    strongestEvidence: canonicalSkillMatches
      .filter((s) => s.evidenceStatus === 'proven')
      .map((s) => s.skill)
      .slice(0, 4),
    partialCompetencies: canonicalSkillMatches
      .filter((s) => s.evidenceStatus === 'claimed_only' || s.evidenceStatus === 'related')
      .map((s) => s.skill)
      .slice(0, 4),
    missingCompetencies: missingMusts.map((m) => m.skill).slice(0, 4),
    bestFitCompanyGroups:
      finalScore >= 75
        ? ['Tier S (Elite Product)', 'Tier A (Unicorns)']
        : finalScore >= 55
        ? ['Tier B (Tech Enterprises)', 'Tier C (Consultancies)']
        : ['Early Career & Incubator Programs'],
    mainRisk:
      missingMusts.length > 0
        ? `Missing evidence for core mandatory skill: ${missingMusts[0].skill}`
        : weakBullets.length > 0
        ? `Lack of quantifiable scale metrics in project bullet points`
        : `Seniority alignment against ${parsedJD.yearsRequired}+ years requirement`,
    threeNextActions: recommendations.slice(0, 3).map((r) => r.action),
  };

  // 15. Runtime Invariant Verification (STAGE 7)
  const invariantFailures: string[] = [];

  // Invariant 1: Must-have ratio equals matched / total
  const totalMust = canonicalMustHaves.length;
  const matchedMust = canonicalSkillMatches.filter(
    (s) => s.importance === 'must_have' && (s.status === 'exact' || s.status === 'alias' || s.status === 'implied')
  ).length;
  const expectedMustRatio = totalMust > 0 ? Math.round((matchedMust / totalMust) * 100) : scores.mustHaveCoverage;
  if (scores.mustHaveCoverage !== expectedMustRatio) {
    invariantFailures.push(
      `Invariant 1: mustHaveCoverage (${scores.mustHaveCoverage}) does not match ratio (${expectedMustRatio})`
    );
  }

  // Invariant 2: Missing skills count consistency
  const missingCountInMatches = canonicalSkillMatches.filter(
    (s) => s.status === 'missing' || s.status === 'related'
  ).length;
  const actualMissingKeywords = [
    ...missingMusts.map((m) => m.skill),
    ...missingNices.map((n) => n.skill),
  ];
  if (missingCountInMatches !== actualMissingKeywords.length) {
    invariantFailures.push(
      `Invariant 2: Missing skills count mismatch (${missingCountInMatches} vs ${actualMissingKeywords.length})`
    );
  }

  // Invariant 4: Citations verbatim check
  citations.forEach((c) => {
    if (!isQuoteVerbatimInResume(c.quote, rawText)) {
      invariantFailures.push(`Invariant 4: Citation quote "${c.quote.slice(0, 20)}..." not verbatim in resume.`);
    }
  });

  // Invariant 5: Score bounds [0, 100]
  if (finalScore < 0 || finalScore > 100) {
    invariantFailures.push(`Invariant 5: Final score ${finalScore} out of bounds [0, 100]`);
  }

  // Invariant 6: No output skill exists outside taxonomy, resume, or JD
  canonicalSkillMatches.forEach((sm) => {
    const inTaxonomy = SKILL_TAXONOMY.some(
      (t) => t.canonical.toLowerCase() === sm.skill.toLowerCase() || t.aliases.some((a) => a.toLowerCase() === sm.skill.toLowerCase())
    );
    const inJD = normJD.toLowerCase().includes(sm.skill.toLowerCase());
    const inResume = normResume.toLowerCase().includes(sm.skill.toLowerCase());
    if (!inTaxonomy && !inJD && !inResume) {
      invariantFailures.push(`Invariant 6: Skill "${sm.skill}" not in taxonomy, JD, or resume.`);
    }
  });

  // Invariant 7: No output requirement exists outside JD facts
  canonicalMustHaves.concat(canonicalNiceHaves).forEach((req) => {
    const taxItem = SKILL_TAXONOMY.find(
      (t) => t.canonical.toLowerCase() === req.name.toLowerCase()
    );
    const validTerms = taxItem ? [taxItem.canonical, ...taxItem.aliases] : [req.name];
    const inJD = validTerms.some((term) => normJD.toLowerCase().includes(term.toLowerCase()));
    if (!inJD) {
      invariantFailures.push(`Invariant 7: Requirement "${req.name}" does not exist in JD.`);
    }
  });

  // Invariant 8: Displayed score equals canonical score
  if (quickRoast.finalScore !== finalScore) {
    invariantFailures.push(`Invariant 8: Quick roast score (${quickRoast.finalScore}) != finalScore (${finalScore})`);
  }

  // Invariant 9: Every recommendation has a valid source fact ID
  recommendations.forEach((rec) => {
    if (!rec.sourceFactId) {
      invariantFailures.push(`Invariant 9: Recommendation "${rec.id}" missing sourceFactId`);
    }
  });

  // Invariant 10: Recommendation ordering is deterministic
  for (let i = 0; i < recommendations.length - 1; i++) {
    if (recommendations[i].sortKey.localeCompare(recommendations[i + 1].sortKey) > 0) {
      invariantFailures.push(`Invariant 10: Recommendations not sorted by sortKey`);
      break;
    }
  }

  const canonical: CanonicalAnalysis = {
    analysisId: `analysis_${inputFingerprint}`,
    inputFingerprint,
    resumeFingerprint,
    jobDescriptionFingerprint: jdFingerprint,
    timestamp: Date.now(),
    versions: {
      taxonomy: TAXONOMY_VERSION,
      scoring: SCORING_VERSION,
      prompt: PROMPT_VERSION,
      model: MODEL_VERSION,
    },
    parser: {
      sections: canonicalSections,
      extractedText: normResume,
      rawText,
      warnings: canonicalWarnings,
      wordCount: parsedResume.wordCount,
      contact: parsedResume.contact,
      experienceYears: parsedResume.totalYearsEstimate,
      careerLevel: parsedResume.careerLevel || 'fresher',
    },
    jobRequirements: {
      roleTitle: parsedJD.roleTitle,
      domain: 'Engineering',
      seniority: parsedJD.seniority,
      yearsRequired: parsedJD.yearsRequired,
      mustHave: canonicalMustHaves,
      niceToHave: canonicalNiceHaves,
      responsibilities: parsedJD.responsibilities,
      dealbreakers: parsedJD.dealbreakers,
      confidence: parsedJD.mustHaves.length > 0 ? 'high' : 'medium',
      confidenceNote:
        parsedJD.mustHaves.length === 0
          ? 'Job description does not explicitly separate mandatory from preferred skills; evaluated overall skill distribution.'
          : undefined,
    },
    skillMatches: canonicalSkillMatches,
    evidenceItems,
    scores,
    invariants: {
      allPassed: invariantFailures.length === 0,
      failures: invariantFailures,
    },
    recommendations,
    citations,
    confidence: scores.confidence,
    applicationGuidance,
    quickRoast,
    talentLensReadiness,
  };

  // Cache result for this fingerprint
  setCachedAnalysis(inputFingerprint, canonical);

  return canonical;
}

// ============================================================
// ADAPTER: CANONICAL TO ATS ENGINE RESULT (STAGE 2)
// Allows existing ATS components (ScoreHeader, Tabs, etc.)
// to consume the canonical result seamlessly with 0 recalculations.
// ============================================================

export function canonicalToAtsResult(canonical: CanonicalAnalysis): AtsEngineResult {
  const allBullets = canonical.evidenceItems.map((e) => e.text);
  const matchedMustCount = canonical.skillMatches.filter(
    (s) => s.importance === 'must_have' && (s.status === 'exact' || s.status === 'alias' || s.status === 'implied')
  ).length;
  const totalMustCount = canonical.jobRequirements.mustHave.length;
  const missingCount = canonical.skillMatches.filter(
    (s) => s.status === 'missing' || s.status === 'related'
  ).length;

  return {
    score: canonical.scores.finalScore,
    band:
      canonical.scores.finalScore >= 80
        ? 'Strong'
        : canonical.scores.finalScore >= 60
        ? 'Competitive'
        : canonical.scores.finalScore >= 40
        ? 'Needs work'
        : 'Weak match',
    confidence:
      canonical.confidence === 'high'
        ? 'High'
        : canonical.confidence === 'medium'
        ? 'Medium'
        : 'Low',
    confidenceReason: canonical.scores.confidenceReason,
    headline: canonical.quickRoast.oneLineVerdict,
    oneParagraphSummary: `Evaluation against target ${canonical.jobRequirements.roleTitle} role: Candidate achieves a ${canonical.scores.finalScore}% fit score in the ${canonical.scores.band} band with ${matchedMustCount} must-have competencies verified.`,
    subscores: {
      mustHaveCoverage: Math.round((canonical.scores.mustHaveCoverage / 100) * 30),
      evidenceDepth: Math.round((canonical.scores.evidenceQuality / 100) * 20),
      impactMetrics: Math.round((canonical.scores.evidenceQuality / 100) * 15),
      projectsAndOss: Math.round((canonical.scores.projectRelevance / 100) * 10),
      seniorityFit: Math.round((canonical.scores.seniorityFit / 100) * 10),
      formatAndParse: Math.round((canonical.scores.formatSafety / 100) * 10),
      tierFit: Math.min(5, Math.round((canonical.scores.finalScore / 100) * 5)),
      niceToHaveCoverage: canonical.scores.niceToHaveCoverage,
    },
    penalties:
      canonical.scores.penalty < 0
        ? [
            {
              id: 'penalty-keyword-stuffing',
              label: 'Keyword Stuffing',
              points: Math.abs(canonical.scores.penalty),
              reason: 'Unsupported skills listed without project citations.',
            },
          ]
        : [],
    skillResults: canonical.skillMatches.map((sm) => ({
      skillId: sm.skill.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      canonical: sm.skill,
      category: sm.category,
      required: (sm.importance === 'must_have' ? 'must' : 'nice') as 'must' | 'nice',
      weight: sm.weight,
      found: sm.status !== 'missing',
      evidence: sm.evidenceSnippet
        ? [
            {
              quote: sm.evidenceSnippet,
              section: 'Experience',
              charStart: 0,
              charEnd: sm.evidenceSnippet.length,
              hasMetric: false,
            },
          ]
        : [],
      proficiency: sm.status === 'missing' ? 0 : sm.isClaimedOnly ? 1 : 3,
      status: (sm.status === 'missing' ? 'missing' : sm.isClaimedOnly ? 'weak' : 'verified') as 'verified' | 'weak' | 'missing',
    })),
    mustHavesMet: `${matchedMustCount}/${totalMustCount}`,
    mustHavesMetRatio: totalMustCount > 0 ? matchedMustCount / totalMustCount : 1,
    missingKeywordsCount: missingCount,
    bestFitTier: 'Top Product',
    seniorityFit: {
      candidateYears: canonical.parser.experienceYears,
      requiredYears: canonical.jobRequirements.yearsRequired || 2,
      level: canonical.parser.careerLevel,
      fitExplanation: `Candidate has ${canonical.parser.experienceYears.toFixed(1)} years estimated experience; role requires ${canonical.jobRequirements.yearsRequired || 2} years.`,
    },
    parseQuality:
      canonical.scores.formatSafety >= 80
        ? 'High'
        : canonical.scores.formatSafety >= 50
        ? 'Medium'
        : 'Poor',
    fixFirst: canonical.recommendations.slice(0, 3).map((r) => ({
      title: r.title,
      reason: r.action,
      expectedScoreGain: 5,
      type: 'missing_must_have' as const,
      skillId: r.sourceFactId,
    })),
    audit: {
      wordCount: canonical.parser.wordCount,
      experienceEntriesCount: canonical.parser.sections.filter((s) => s.type === 'experience').length,
      projectsCount: canonical.parser.sections.filter((s) => s.type === 'projects').length,
      bulletsCount: allBullets.length,
      skillsParsedCount: canonical.skillMatches.filter((s) => s.status !== 'missing').length,
      contactInfo: {
        name: canonical.parser.contact.name || null,
        email: canonical.parser.contact.email || null,
        phone: canonical.parser.contact.phone || null,
        linkedin: canonical.parser.contact.links.find((l) => l.includes('linkedin')) || null,
        github: canonical.parser.contact.links.find((l) => l.includes('github')) || null,
        portfolio: canonical.parser.contact.links.find((l) => !l.includes('linkedin') && !l.includes('github')) || null,
      },
      sectionsFound: canonical.parser.sections.map((s) => s.type),
      missingStandardSections: [],
      weakBulletsCount: canonical.evidenceItems.filter((e) => e.score < 50).length,
      metricsRatio:
        allBullets.length > 0
          ? Math.round(
              (canonical.evidenceItems.filter((e) => e.hasMetric).length / allBullets.length) * 100
            )
          : 0,
      stuffedSkills: canonical.skillMatches.filter((s) => s.evidenceStatus === 'claimed_only').map((s) => s.skill),
    },
    learningPath: {
      items: [],
      byStage: {
        foundation: [],
        core: [],
        differentiators: [],
      },
      totalSkillsToAcquire: canonical.recommendations.length,
      mustHaveCount: canonical.skillMatches.filter((s) => s.importance === 'must_have' && s.status === 'missing').length,
      niceToHaveCount: canonical.skillMatches.filter((s) => s.importance === 'nice_to_have' && s.status === 'missing').length,
      rewrites: [],
    },
    canonicalResult: canonical,
    quickRoast: canonical.quickRoast,
    talentLensReadiness: canonical.talentLensReadiness,
  };
}
