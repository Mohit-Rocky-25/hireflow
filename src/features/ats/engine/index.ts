// ============================================================
// ATS Resume Roaster — Main Engine Entry Point (Stage 3)
// Deterministic single source of truth pipeline
// ============================================================

import { isGarbageOrBinary, countWords } from '../fileParser';
import { validateResumeAuthenticity } from '../../../lib/resumeValidator';
import { splitResumeSections } from './sectionSplitter';
import { extractContactInfo } from './contactExtractor';
import { parseExperienceSection } from './experienceParser';
import { parseProjectSection } from './projectParser';
import { estimateCandidateExperience } from './experienceEstimator';
import { evaluateSenioritySignals, normalizeSeniorityLevel } from './senioritySignals';
import { analyzeJobDescription } from './jdAnalyzer';
import { matchRequiredSkills } from './skillMatcher';
import { computeAtsScore } from './scorer';
import { generateLearningPath } from './learningPath';
import { rankFixes } from '../../suite/engine/simulateFix';
import { buildReportState, assertReportConsistency, ReportState } from './reportState';
import {
  AtsEngineResult,
  ApplicationGuidance,
  FixFirstItem,
  QuickRoastProjection,
  SkillResult,
  TargetTierId,
  ExperienceLevelId,
} from './types';
import type { CanonicalAnalysis } from '../../../lib/ats/canonicalAnalysis';
import type { MetricEvidence } from './metricModel';
import type { SeniorityMatchResult } from './seniorityMatcher';
import { extractEmployerFromJd } from './companyExtractor';
import { createScanIdentity } from './scanIdentity';
import { getMinWords, WordLimitSource } from '../../../lib/config/limits';
import { extractStructuredCandidateProfile } from './evidenceExtractor';
import { validateCitationLedger } from './citationValidator';
import { evaluateSeniorityFit } from './seniorityMatcher';
import { DEFAULT_ANCHOR_DATE } from './tenureCalculator';

export * from './types';
export * from './evidenceModel';
export * from './sourceLocator';
export * from './statementExtractor';
export * from './evidenceExtractor';
export * from './citationModel';
export * from './citationValidator';
export * from './metricModel';
export * from './metricExtractor';
export * from './reportState';
export * from './senioritySignals';
export * from './tenureCalculator';
export * from './seniorityMatcher';
export { splitResumeSections } from './sectionSplitter';
export { extractContactInfo } from './contactExtractor';
export { analyzeBullet } from './bulletAnalyzer';
export { parseExperienceSection } from './experienceParser';
export { parseProjectSection } from './projectParser';
export { estimateCandidateExperience } from './experienceEstimator';
export { evaluateSenioritySignals, normalizeSeniorityLevel } from './senioritySignals';
export { analyzeJobDescription } from './jdAnalyzer';
export { extractEmployerFromJd } from './companyExtractor';
export { createScanIdentity } from './scanIdentity';
export { matchRequiredSkills } from './skillMatcher';
export { evaluateSingleCompetency, matchRequirementsWithContext } from './competencyMatcher';
export { parseLogicalRequirement, evaluateLogicalExpression } from './logicalExpression';
export {
  computeAtsScore,
  ATS_SEVEN_DIMENSION_SPEC_VERSION,
  ATS_ENGINE_VERSION,
  ATS_SEVEN_DIMENSION_FINGERPRINT,
} from './scorer';
export { generateLearningPath } from './learningPath';

export interface AtsEngineOptions {
  tier?: TargetTierId;
  level?: ExperienceLevelId;
  roleFamily?: string;
  preset?: string;
  region?: string;
  language?: string;
  scanId?: string;
  parentScanId?: string | null;
  resumeSource?: WordLimitSource;
  jdSource?: WordLimitSource;
  today?: Date;
  confirmedRequirements?: Array<{ text: string; type: 'must' | 'nice' }>;
}

export type AtsEngineResponse =
  | { success: true; result: AtsEngineResult }
  | { success: false; error: 'UNREADABLE_RESUME'; message: string };

/**
 * Pure presentation-only projection deriving Quick Roast, Application Guidance,
 * and TalentLens readiness strictly from the already-computed authoritative 7-dimension result.
 * Zero re-parsing, zero secondary matching, zero secondary composite scoring.
 */
function buildPresentationProjections(input: {
  finalScore: number;
  band: AtsEngineResult['band'];
  roleTitle: string;
  mustHavesMet: string;
  mustHavesMetRatio: number;
  parseQuality: AtsEngineResult['parseQuality'];
  bulletsCount: number;
  weakBulletsCount: number;
  skillResults: SkillResult[];
  metricEvidences: MetricEvidence[];
  seniorityMatchResult?: SeniorityMatchResult;
  fixFirst: FixFirstItem[];
  learningPath: AtsEngineResult['learningPath'];
}): {
  quickRoast: QuickRoastProjection;
  applicationGuidance: ApplicationGuidance;
  talentLensReadiness: NonNullable<CanonicalAnalysis['talentLensReadiness']>;
} {
  const {
    finalScore,
    band,
    roleTitle,
    mustHavesMet,
    mustHavesMetRatio,
    parseQuality,
    bulletsCount,
    weakBulletsCount,
    skillResults,
    metricEvidences,
    seniorityMatchResult,
    fixFirst,
    learningPath,
  } = input;

  const isMandatorySeniorityGateActive = Boolean(seniorityMatchResult?.isMandatoryGateActive);
  const isSeniorityEligible = seniorityMatchResult ? seniorityMatchResult.isEligible : true;

  const isContradictedSkill = (sr: SkillResult) =>
    sr.matchResult?.status === 'CONTRADICTED' || sr.claimSupport === 'CONTRADICTED';

  const contradictedMusts = skillResults.filter(
    sr => sr.required === 'must' && isContradictedSkill(sr)
  );
  const missingMusts = skillResults.filter(
    sr => sr.required === 'must' && sr.status === 'missing' && !isContradictedSkill(sr)
  );
  const weakMusts = skillResults.filter(
    sr =>
      sr.required === 'must' &&
      !isContradictedSkill(sr) &&
      (sr.status === 'weak' ||
        sr.matchResult?.status === 'PARTIALLY_SATISFIED' ||
        sr.matchResult?.status === 'RELATED_BUT_NOT_EQUIVALENT')
  );

  const verifiedSkills = skillResults.filter(
    sr =>
      sr.status === 'verified' &&
      !isContradictedSkill(sr) &&
      sr.matchResult?.status !== 'PARTIALLY_SATISFIED' &&
      sr.matchResult?.status !== 'RELATED_BUT_NOT_EQUIVALENT' &&
      sr.matchResult?.status !== 'AMBIGUOUS' &&
      sr.claimSupport !== 'RELATED_ONLY' &&
      sr.claimSupport !== 'NOT_SUPPORTED'
  );

  // 1. Grounded Application Guidance
  let applicationGuidance: ApplicationGuidance;
  if (parseQuality === 'Poor' || (bulletsCount === 0 && verifiedSkills.length === 0)) {
    applicationGuidance = 'Insufficient evidence to evaluate';
  } else if (
    finalScore >= 80 &&
    mustHavesMetRatio >= 0.8 &&
    isSeniorityEligible &&
    contradictedMusts.length === 0
  ) {
    applicationGuidance = 'Ready to apply';
  } else if (finalScore >= 60 && mustHavesMetRatio >= 0.4) {
    applicationGuidance = 'Apply after high-priority fixes';
  } else {
    applicationGuidance = 'Significant gaps to address';
  }

  // 2. Deterministic One-Line Verdict
  let oneLineVerdict: string;
  if (applicationGuidance === 'Insufficient evidence to evaluate') {
    oneLineVerdict = `Insufficient parseable resume evidence for ${roleTitle}; add structured experience or project bullets.`;
  } else if (isMandatorySeniorityGateActive && !isSeniorityEligible && seniorityMatchResult) {
    oneLineVerdict = `${band} match (${finalScore}%, ${mustHavesMet} must-haves met) for ${roleTitle}, but below required ${seniorityMatchResult.requiredYears} YOE (${seniorityMatchResult.shortfallMonths}m shortfall).`;
  } else if (band === 'Strong') {
    oneLineVerdict = `Strong match (${finalScore}%) for ${roleTitle} with ${mustHavesMet} must-have requirements verified.`;
  } else if (band === 'Competitive') {
    oneLineVerdict = `Competitive match (${finalScore}%) for ${roleTitle} (${mustHavesMet} must-haves met); targeted fixes will strengthen candidacy.`;
  } else if (band === 'Needs work') {
    oneLineVerdict = `Needs work (${finalScore}%) for ${roleTitle} (${mustHavesMet} must-haves met); address priority skill and evidence gaps.`;
  } else {
    oneLineVerdict = `Weak match (${finalScore}%) for ${roleTitle} (${mustHavesMet} must-haves met); significant skill and experience gaps remain.`;
  }

  // 3. Verified Strengths (up to 3) — strictly verbatim quotes from verified skillResults or credited metricEvidences
  const strengths: QuickRoastProjection['strengths'] = [];
  const usedQuotes = new Set<string>();

  for (const sr of verifiedSkills) {
    if (strengths.length >= 3) break;
    const directCit = (sr.validatedCitations || []).find(
      c =>
        (c.validationStatus === 'VERIFIED_EXACT' || c.validationStatus === 'VERIFIED_CONTEXTUAL') &&
        (c.claimSupport === 'DIRECTLY_SUPPORTED' || c.claimSupport === 'CONTEXTUALLY_SUPPORTED') &&
        Boolean(c.originalQuotation?.trim())
    );
    const verifiedCit = (sr.validatedCitations || []).find(
      c =>
        (c.validationStatus === 'VERIFIED_EXACT' || c.validationStatus === 'VERIFIED_CONTEXTUAL') &&
        c.claimSupport !== 'CONTRADICTED' &&
        c.claimSupport !== 'RELATED_ONLY' &&
        c.claimSupport !== 'NOT_SUPPORTED' &&
        Boolean(c.originalQuotation?.trim())
    );
    const evidenceQuote = (
      directCit?.originalQuotation ||
      sr.evidence?.[0]?.quote ||
      verifiedCit?.originalQuotation ||
      ''
    ).trim();

    if (!evidenceQuote) continue;
    strengths.push({
      title: `Demonstrated ${sr.canonical}`,
      evidenceQuote,
    });
    usedQuotes.add(evidenceQuote);
  }

  if (strengths.length < 3) {
    for (const me of metricEvidences) {
      if (strengths.length >= 3) break;
      if (!me.creditedInImpact) continue;
      const quote = (me.bulletQuote || me.sourceQuote || '').trim();
      if (!quote || usedQuotes.has(quote)) continue;
      strengths.push({
        title: `Quantified ${me.metricCategory.toLowerCase()} impact (${me.sourceQuote})`,
        evidenceQuote: quote,
      });
      usedQuotes.add(quote);
    }
  }

  // 4. Priority Gaps (up to 3) — seniority shortfall (if !isEligible), contradicted, missing, weak must-haves
  const gaps: QuickRoastProjection['gaps'] = [];
  if (isMandatorySeniorityGateActive && !isSeniorityEligible && seniorityMatchResult) {
    gaps.push({
      title: `Seniority shortfall (${seniorityMatchResult.demonstratedMonths}m vs ${seniorityMatchResult.requiredMonths}m required)`,
      gapType: 'seniority_shortfall',
    });
  }
  for (const sr of contradictedMusts) {
    if (gaps.length >= 3) break;
    gaps.push({
      title: `Contradicted requirement: ${sr.canonical}`,
      gapType: 'contradicted',
    });
  }
  for (const sr of missingMusts) {
    if (gaps.length >= 3) break;
    gaps.push({
      title: `Missing ${sr.canonical}`,
      gapType: 'missing_required',
    });
  }
  for (const sr of weakMusts) {
    if (gaps.length >= 3) break;
    gaps.push({
      title: `Weak evidence for ${sr.canonical}`,
      gapType: 'weak_evidence',
    });
  }

  // 5. Prioritized Actions (up to 3) — from fixFirst and learningPath.rewrites
  const prioritizedActions: QuickRoastProjection['prioritizedActions'] = fixFirst
    .slice(0, 3)
    .map(f => ({
      title: f.title,
      action: f.reason,
    }));

  if (prioritizedActions.length < 3) {
    for (const rw of learningPath.rewrites) {
      if (prioritizedActions.length >= 3) break;
      prioritizedActions.push({
        title: `Strengthen weak bullet (${rw.score}/100)`,
        action: `${rw.weakness} Suggested rewrite: ${rw.templateRewrite}`,
      });
    }
  }

  // 6. TalentLens Readiness projection
  let overallStatus: NonNullable<CanonicalAnalysis['talentLensReadiness']>['overallStatus'];
  if (applicationGuidance === 'Insufficient evidence to evaluate') {
    overallStatus = 'Insufficient evidence';
  } else if (finalScore >= 80 && missingMusts.length === 0 && contradictedMusts.length === 0 && isSeniorityEligible) {
    overallStatus = 'Strong fit';
  } else if (finalScore >= 65) {
    overallStatus = 'Developing fit';
  } else if (missingMusts.length > 0 || weakMusts.length > 0 || contradictedMusts.length > 0) {
    overallStatus = 'Potential fit with evidence gaps';
  } else {
    overallStatus = 'Low current fit';
  }

  const mainRisk =
    isMandatorySeniorityGateActive && !isSeniorityEligible && seniorityMatchResult
      ? `Seniority shortfall: ${seniorityMatchResult.demonstratedMonths}m qualifying experience vs ${seniorityMatchResult.requiredMonths}m required`
      : contradictedMusts.length > 0
      ? `Contradicted evidence for mandatory skill: ${contradictedMusts[0].canonical}`
      : missingMusts.length > 0
      ? `Missing evidence for core mandatory skill: ${missingMusts[0].canonical}`
      : weakBulletsCount > 0
      ? `Lack of quantifiable scale metrics in ${weakBulletsCount} bullet point(s)`
      : `Minor alignment refinements for ${roleTitle}`;

  const talentLensReadiness: NonNullable<CanonicalAnalysis['talentLensReadiness']> = {
    overallStatus,
    bestFitRoles: [
      {
        title: roleTitle,
        fitStatus: overallStatus,
        score: finalScore,
      },
    ],
    strongestEvidence: verifiedSkills.map(s => s.canonical).slice(0, 4),
    partialCompetencies: skillResults
      .filter(s => s.status === 'weak' || s.matchResult?.status === 'PARTIALLY_SATISFIED' || s.matchResult?.status === 'RELATED_BUT_NOT_EQUIVALENT')
      .map(s => s.canonical)
      .slice(0, 4),
    missingCompetencies: [...contradictedMusts, ...missingMusts].map(m => m.canonical).slice(0, 4),
    bestFitCompanyGroups:
      finalScore >= 75
        ? ['Tier S (Elite Product)', 'Tier A (Unicorns)']
        : finalScore >= 55
        ? ['Tier B (Tech Enterprises)', 'Tier C (Consultancies)']
        : ['Early Career & Incubator Programs'],
    mainRisk,
    threeNextActions: prioritizedActions.slice(0, 3).map(a => a.action),
  };

  return {
    quickRoast: {
      finalScore,
      oneLineVerdict,
      strengths,
      gaps,
      prioritizedActions,
    },
    applicationGuidance,
    talentLensReadiness,
  };
}

/**
 * Primary deterministic execution entry point.
 */
export function runAtsEngine(
  resumeText: string,
  jdText: string,
  options?: AtsEngineOptions
): AtsEngineResponse {
  // 1. Guard against unreadable input or raw binary
  if (isGarbageOrBinary(resumeText)) {
    return {
      success: false,
      error: 'UNREADABLE_RESUME',
      message: 'Resume contains raw binary tokens or excessive non-printable characters. Upload a clean document.',
    };
  }

  const wordCount = countWords(resumeText);
  const minRequired = getMinWords('resume', options?.resumeSource);
  if (wordCount < minRequired) {
    return {
      success: false,
      error: 'UNREADABLE_RESUME',
      message: `Resume text has only ${wordCount} words (minimum ${minRequired} words required to evaluate).`,
    };
  }

  // Level 1 Gatekeeper: Reject non-resume text or prose lacking resume structure
  const resumeValidity = validateResumeAuthenticity(resumeText);
  if (!resumeValidity.isValid) {
    return {
      success: false,
      error: 'UNREADABLE_RESUME',
      message: resumeValidity.reason || 'Document does not contain recognized resume structure, sections, or technical credentials.',
    };
  }

  const targetTier = options?.tier || 'top_product';
  const selectedLevel = options?.level || 'auto';

  // 2. Parse Resume Sections
  const sections = splitResumeSections(resumeText);
  const expSections = sections.filter(s => s.type === 'experience');
  const projSections = sections.filter(s => s.type === 'projects');

  // 3. Extract Details & Evidence Profile
  const contactInfo = extractContactInfo(resumeText);
  const experienceEntries = parseExperienceSection(expSections, { documentId: options?.scanId, resumeText });
  const projectEntries = parseProjectSection(projSections, { documentId: options?.scanId, resumeText });
  const structuredProfile = extractStructuredCandidateProfile(
    resumeText,
    sections,
    experienceEntries,
    projectEntries,
    contactInfo,
    { documentId: options?.scanId }
  );

  const allBullets = [
    ...experienceEntries.flatMap(e => e.bullets),
    ...projectEntries.flatMap(p => p.bullets),
  ];

  // 4. Estimate Experience Tenure & Level-Aware Seniority Mode (Stage D)
  const seniority = estimateCandidateExperience(experienceEntries, selectedLevel, options?.today);
  const seniorityMode = evaluateSenioritySignals({
    resumeText,
    sections,
    bullets: allBullets,
    candidateYears: seniority.candidateYears,
    levelOverride: selectedLevel,
  });

  // 5. Analyze Job Description & Extract Target Employer Contextually
  const jdAnalysis = analyzeJobDescription(jdText, options?.confirmedRequirements);
  const employerExtraction = extractEmployerFromJd(jdText);
  const detectedEmployer = employerExtraction.companyName;

  // Create isolated ScanIdentity
  const scanIdentity = createScanIdentity({
    candidateName: contactInfo.name,
    employerName: detectedEmployer,
    jobTitle: jdAnalysis.roleTitle,
    resumeText,
    jdText,
    engineVersion: '4.0.0',
    explicitScanId: options?.scanId,
  });

  // 6. Validate citation ledger against source document and required skills
  const citationLedger = validateCitationLedger(
    structuredProfile,
    resumeText,
    jdAnalysis.requiredSkills,
    { scanId: options?.scanId, documentId: options?.scanId }
  );

  // 7. Context-Aware Competency Matching on resumeText & structuredProfile
  const skillResults = matchRequiredSkills(
    resumeText,
    sections,
    jdAnalysis.requiredSkills,
    {
      structuredProfile,
      citationLedger,
      seniorityLevel: selectedLevel,
      requiredYears: jdAnalysis.detectedYears,
    }
  );

  // Attach validated citations to skillResults without leaking non-equivalent citations
  const citationById = new Map(citationLedger.citations.map(c => [c.id, c]));
  for (const sr of skillResults) {
    if (sr.validatedCitations && sr.validatedCitations.length > 0) continue;

    const matchStatus = sr.matchResult?.status;
    if (matchStatus === 'SATISFIED' || matchStatus === 'PARTIALLY_SATISFIED') {
      const fromCitationIds = (sr.matchResult?.citationIds || [])
        .map(id => citationById.get(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      if (fromCitationIds.length > 0) {
        sr.validatedCitations = fromCitationIds;
        continue;
      }

      const candidateLookupIds = [
        sr.satisfiedBySkillId,
        ...(sr.matchResult?.competencyIds || []),
        sr.skillId,
      ].filter((id): id is string => Boolean(id && !id.startsWith('or_')));

      const collected: typeof citationLedger.citations = [];
      const seenCitIds = new Set<string>();
      for (const lookupId of candidateLookupIds) {
        for (const cit of (citationLedger.citationsByCompetency[lookupId] || [])) {
          if (!seenCitIds.has(cit.id)) {
            seenCitIds.add(cit.id);
            collected.push(cit);
          }
        }
      }
      sr.validatedCitations = collected;
    } else if (!sr.skillId.startsWith('or_')) {
      sr.validatedCitations = citationLedger.citationsByCompetency[sr.skillId] || [];
    } else {
      sr.validatedCitations = [];
    }
  }

  const requirementMatches = skillResults.map(sr => sr.matchResult).filter(Boolean) as import('./types').RequirementMatchResult[];

  // 7. Calibrated Seniority & Tenure Matching (Phase 07 / Phase 10.4)
  const seniorityMatchResult = evaluateSeniorityFit(
    structuredProfile,
    jdText,
    { asOfDate: options?.today || DEFAULT_ANCHOR_DATE }
  );

  // Authoritative scoped candidate & required years (eliminates split-brain seniority drift)
  const authoritativeRequiredYears = seniorityMatchResult.requiredYears;
  const authoritativeCandidateYears = seniorityMatchResult.isMandatoryGateActive
    ? seniorityMatchResult.demonstratedYears
    : seniority.professionalYears;

  // 8. Deterministic Scoring
  const scoring = computeAtsScore({
    wordCount,
    skillResults,
    experience: experienceEntries,
    projects: projectEntries,
    contactInfo,
    sections,
    candidateYears: authoritativeCandidateYears,
    requiredYears: authoritativeRequiredYears,
    targetTier,
    jdText,
    seniorityMatchResult,
  });

  const learningPath = generateLearningPath({
    skillResults,
    roleTitle: jdAnalysis.roleTitle,
    targetTier,
    projects: projectEntries.map(p => ({ title: p.title, techStack: p.techStack })),
    bullets: allBullets,
  });

  const rankedFixes = rankFixes({
    wordCount,
    skillResults,
    experience: experienceEntries,
    projects: projectEntries,
    contactInfo,
    sections,
    candidateYears: authoritativeCandidateYears,
    requiredYears: authoritativeRequiredYears,
    targetTier,
    baseScore: scoring.score,
    seniorityMatchResult,
  });

  const fixFirstItems: FixFirstItem[] = rankedFixes.slice(0, 3).map((rf) => ({
    title: rf.gapClass === 'wording' ? `Align Evidence for ${rf.skillName}` : `Add Verifiable Evidence for ${rf.skillName}`,
    reason: rf.gapClass === 'wording'
      ? `Skill "${rf.skillName}" is mentioned but lacks depth or metric evidence.`
      : `Missing requirement: ${rf.skillName}. Add a concrete project or work experience bullet.`,
    expectedScoreGain: rf.gain,
    type: 'missing_must_have',
    skillId: rf.skillId,
  }));

  const unifiedTrace = scoring.trace;
  unifiedTrace.context.roleFamily = (options?.roleFamily || jdAnalysis.roleTitle || 'General') as any;

  const scoringForReportState = {
    score: scoring.score,
    band: scoring.band,
    headline: scoring.headline,
    subscores: scoring.subscores,
    activeWeights: scoring.activeWeights,
    penalties: scoring.penalties,
    rawSubtotal: scoring.rawSubtotal,
    totalBonuses: scoring.totalBonuses,
    totalDeductions: scoring.totalDeductions,
    preClampScore: scoring.preClampScore,
    wasClamped: scoring.wasClamped,
    trace: unifiedTrace,
  };

  const reportState = buildReportState({
    rawText: resumeText,
    wordCount,
    sections,
    contactInfo,
    requiredSkills: jdAnalysis.requiredSkills,
    skillResults,
    scoring: scoringForReportState,
    fixes: fixFirstItems.map((f, i) => ({
      id: `fix-${f.skillId || i}`,
      title: f.title,
      reason: f.reason,
      gain: f.expectedScoreGain,
      type: f.type,
      skillId: f.skillId,
    })),
    bullets: allBullets,
    learningPathItems: learningPath.items,
    rewrites: learningPath.rewrites,
    seniority,
    seniorityMode,
    detectedYears: jdAnalysis.detectedYears,
    targetTier,
    roleTitle: jdAnalysis.roleTitle,
    parseQuality: scoring.parseQuality,
    roleFamily: options?.roleFamily,
    preset: options?.preset || targetTier,
    region: options?.region,
    language: options?.language,
    scanId: options?.scanId,
    parentScanId: options?.parentScanId,
  });

  const effectiveFixFirst = fixFirstItems.length > 0 ? fixFirstItems : scoring.fixFirst;
  const finalScore = unifiedTrace.composite ?? scoring.score;

  const { quickRoast, applicationGuidance, talentLensReadiness } = buildPresentationProjections({
    finalScore,
    band: scoring.band,
    roleTitle: jdAnalysis.roleTitle,
    mustHavesMet: scoring.mustHavesMet,
    mustHavesMetRatio: scoring.mustHavesMetRatio,
    parseQuality: scoring.parseQuality,
    bulletsCount: allBullets.length,
    weakBulletsCount: scoring.weakBulletsCount,
    skillResults,
    metricEvidences: scoring.metricEvidences,
    seniorityMatchResult,
    fixFirst: effectiveFixFirst,
    learningPath,
  });

  const result: AtsEngineResult = {
    score: scoring.score,
    band: scoring.band,
    confidence: scoring.confidence,
    confidenceReason: scoring.confidenceReason,
    headline: scoring.headline,
    candidateName: scanIdentity.candidateName,
    employerName: scanIdentity.employerName,
    targetRoleTitle: jdAnalysis.roleTitle,
    jobAnalysis: jdAnalysis,
    scanIdentity,
    evidenceRecords: structuredProfile.allEvidenceRecords,
    structuredProfile,
    citationLedger,
    requirementMatches,
    oneParagraphSummary: `Evaluation against target ${jdAnalysis.roleTitle} role: Candidate achieves a ${scoring.score}% fit score in the ${scoring.band} band with ${scoring.mustHavesMet} must-have competencies verified. ${seniorityMode.explanation}`,
    subscores: scoring.subscores,
    activeWeights: scoring.activeWeights,
    penalties: scoring.penalties,
    skillResults,
    mustHavesMet: scoring.mustHavesMet,
    mustHavesMetRatio: scoring.mustHavesMetRatio,
    missingKeywordsCount: scoring.missingKeywordsCount,
    bestFitTier: targetTier === 'auto' ? 'Top Product' : targetTier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    seniorityFit: {
      candidateYears: authoritativeCandidateYears,
      requiredYears: authoritativeRequiredYears,
      level: seniorityMode.detectedLevel,
      fitExplanation: seniorityMatchResult.explanation || seniorityMode.explanation,
      shortfallMonths: seniorityMatchResult.shortfallMonths,
      surplusMonths: seniorityMatchResult.surplusMonths,
      status: seniorityMatchResult.status,
    },
    seniorityMatchResult,
    seniorityMode,
    parseQuality: scoring.parseQuality,
    fixFirst: effectiveFixFirst,
    reportState,
    quickRoast,
    applicationGuidance,
    talentLensReadiness,
    audit: {
      wordCount,
      experienceEntriesCount: experienceEntries.length,
      projectsCount: projectEntries.length,
      bulletsCount: allBullets.length,
      skillsParsedCount: skillResults.filter(s => s.found).length,
      contactInfo,
      sectionsFound: sections.map(s => s.type),
      missingStandardSections: scoring.missingStandardSections,
      weakBulletsCount: scoring.weakBulletsCount,
      metricsRatio: scoring.metricsRatio,
      stuffedSkills: scoring.stuffedSkills.map((s: any) => typeof s === 'string' ? s : s.canonical || s.skillId),
    },
    learningPath,
    // Single authoritative 7-dimension ScoreTrace: zero dual-engine execution or composite overwrites.
    trace: unifiedTrace,
    bandDetails: unifiedTrace.band,
    specVersion: unifiedTrace.specVersion,
    engineVersion: unifiedTrace.engineVersion,
    specFingerprint: unifiedTrace.specFingerprint,
    metricEvidences: scoring.metricEvidences,
    impactTrace: scoring.impactTrace,
  };

  return {
    success: true,
    result,
  };
}
