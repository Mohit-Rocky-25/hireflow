// ============================================================
// ATS Resume Roaster — Main Engine Entry Point (Stage 3)
// Deterministic single source of truth pipeline
// ============================================================

import { isGarbageOrBinary, countWords } from '../fileParser';
import { splitResumeSections } from './sectionSplitter';
import { extractContactInfo } from './contactExtractor';
import { parseExperienceSection } from './experienceParser';
import { parseProjectSection } from './projectParser';
import { estimateCandidateExperience } from './experienceEstimator';
import { analyzeJobDescription } from './jdAnalyzer';
import { matchRequiredSkills } from './skillMatcher';
import { computeAtsScore } from './scorer';
import { generateLearningPath } from './learningPath';
import {
  AtsEngineResult,
  TargetTierId,
  ExperienceLevelId,
} from './types';
import { analyzeCanonical } from '../../../lib/ats/canonicalAnalysis';
import { getMinWords, WordLimitSource } from '../../../config/limits';

export * from './types';
export { splitResumeSections } from './sectionSplitter';
export { extractContactInfo } from './contactExtractor';
export { analyzeBullet } from './bulletAnalyzer';
export { parseExperienceSection } from './experienceParser';
export { parseProjectSection } from './projectParser';
export { estimateCandidateExperience } from './experienceEstimator';
export { analyzeJobDescription } from './jdAnalyzer';
export { matchRequiredSkills } from './skillMatcher';
export { computeAtsScore } from './scorer';
export { generateLearningPath } from './learningPath';

export interface AtsEngineOptions {
  tier?: TargetTierId;
  level?: ExperienceLevelId;
  resumeSource?: WordLimitSource;
  jdSource?: WordLimitSource;
}

export type AtsEngineResponse =
  | { success: true; result: AtsEngineResult }
  | { success: false; error: 'UNREADABLE_RESUME'; message: string };

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

  const targetTier = options?.tier || 'top_product';
  const selectedLevel = options?.level || 'auto';

  // 2. Parse Resume Sections
  const sections = splitResumeSections(resumeText);
  const expSection = sections.find(s => s.type === 'experience');
  const projSection = sections.find(s => s.type === 'projects');

  // 3. Extract Details
  const contactInfo = extractContactInfo(resumeText);
  const experienceEntries = parseExperienceSection(expSection);
  const projectEntries = parseProjectSection(projSection);

  // 4. Estimate Experience Tenure
  const seniority = estimateCandidateExperience(experienceEntries, selectedLevel);

  // 5. Analyze Job Description
  const jdAnalysis = analyzeJobDescription(jdText);

  // 6. Match Skills on resumeText ONLY
  const skillResults = matchRequiredSkills(resumeText, sections, jdAnalysis.requiredSkills);

  // 7. Deterministic Scoring
  const scoring = computeAtsScore({
    wordCount,
    skillResults,
    experience: experienceEntries,
    projects: projectEntries,
    contactInfo,
    sections,
    candidateYears: seniority.candidateYears,
    requiredYears: jdAnalysis.detectedYears,
    targetTier,
  });

  const allBullets = [
    ...experienceEntries.flatMap(e => e.bullets),
    ...projectEntries.flatMap(p => p.bullets),
  ];

  const learningPath = generateLearningPath({
    skillResults,
    roleTitle: jdAnalysis.roleTitle,
    targetTier,
    projects: projectEntries.map(p => ({ title: p.title, techStack: p.techStack })),
    bullets: allBullets,
  });

  const result: AtsEngineResult = {
    score: scoring.score,
    band: scoring.band,
    confidence: scoring.confidence,
    confidenceReason: scoring.confidenceReason,
    headline: scoring.headline,
    oneParagraphSummary: `Evaluation against target ${jdAnalysis.roleTitle} role: Candidate achieves a ${scoring.score}% fit score in the ${scoring.band} band with ${scoring.mustHavesMet} must-have competencies verified. ${seniority.explanation}`,
    subscores: scoring.subscores,
    penalties: scoring.penalties,
    skillResults,
    mustHavesMet: scoring.mustHavesMet,
    mustHavesMetRatio: scoring.mustHavesMetRatio,
    missingKeywordsCount: scoring.missingKeywordsCount,
    bestFitTier: targetTier === 'auto' ? 'Top Product' : targetTier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    seniorityFit: {
      candidateYears: seniority.candidateYears,
      requiredYears: jdAnalysis.detectedYears || 2,
      level: seniority.inferredLevel,
      fitExplanation: seniority.explanation,
    },
    parseQuality: scoring.parseQuality,
    fixFirst: scoring.fixFirst,
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
      stuffedSkills: scoring.stuffedSkills,
    },
    learningPath,
    canonicalResult: analyzeCanonical(resumeText, jdText, {
      tier: targetTier,
      level: selectedLevel,
    }),
  };

  return {
    success: true,
    result,
  };
}
