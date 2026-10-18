// ============================================================
// HireFlow v3 — Resume Roaster Coordinator (R5.1, R5.5, R5.6, R5.7, R5.9)
// Pure, calibrated 4-pillar analysis with question-based fixes
// ============================================================

import {
  RoasterAnalysisResult,
  CalibratedPillars,
  HarshTruthFinding,
  LearningStep,
  WritingFinding,
} from './types';
import { IngestionResult } from '../ingestion/types';
import { parseJobDescription } from '../matching/jdParser';
import { classifyResumeEvidence } from '../matching/evidenceClassifier';
import { matchCandidateToJD } from '../matching/matcher';
import { auditWritingQuality } from './writingRules';
import { auditFresherReadiness } from './fresherReadiness';
import { scoreFormatSafety } from './formatScorer';
import { ATS_PILLAR_WEIGHTS } from '../../config/scoring';

/**
 * Runs complete 4-pillar Resume Roaster analysis against a target JD.
 * Pure function; deterministic; clock-free.
 */
export function analyzeResumeAgainstJD(
  ingestion: IngestionResult,
  jdText: string
): RoasterAnalysisResult {
  const startTime = performance.now();

  const parsedJD = parseJobDescription(jdText);
  const sectionInputs = ingestion.sections.map((s) => ({
    name: s.name,
    content: s.content,
  }));

  // 1. Classify Skill Evidence across resume
  const { evidenceList, listedNotShownFindings } = classifyResumeEvidence(sectionInputs);

  // 2. Pillar 1: Hard Skills Match (weight 0.40)
  const hasExtractedDegree = ingestion.entities.degrees.length > 0;
  const matchResult = matchCandidateToJD(
    parsedJD.requirements,
    evidenceList,
    hasExtractedDegree,
    true
  );
  const hardSkillsScore = matchResult.hardSkillScore;

  // 3. Pillar 2: Writing & Evidence Quality (weight 0.25)
  const { findings: rawWritingFindings, evidenceScore } = auditWritingQuality(sectionInputs);

  // Combine writing findings with listed-not-shown findings
  const allFindings: WritingFinding[] = [
    ...rawWritingFindings,
    ...listedNotShownFindings.map((lns, idx) => ({
      id: `lns_${idx}`,
      ruleId: 'listed_not_shown',
      severity: 'high' as const,
      confidence: 'high' as const,
      section: 'Technical Skills',
      spanText: lns.line,
      message: lns.message,
      fixQuestion: `Where did you use this skill, or can you build a mini-project showing it?`,
    })),
  ];

  // 4. Pillar 3: Fresher Readiness (weight 0.20)
  const { checks: fresherChecks, fresherScore } = auditFresherReadiness({
    text: ingestion.text,
    entities: ingestion.entities,
    diagnostics: ingestion.diagnostics,
    sectionNames: ingestion.sections.map((s) => s.name),
  });

  // 5. Pillar 4: Format & Parse Safety (weight 0.15)
  const formatSafetyScore = scoreFormatSafety(ingestion.diagnostics);

  // 6. Calibrated Overall Resume Strength
  const pillars: CalibratedPillars = {
    hardSkills: hardSkillsScore,
    evidenceQuality: evidenceScore,
    fresherReadiness: fresherScore,
    formatSafety: formatSafetyScore,
  };

  const overallScore = Math.round(
    pillars.hardSkills * ATS_PILLAR_WEIGHTS.hardSkills +
    pillars.evidenceQuality * ATS_PILLAR_WEIGHTS.evidenceQuality +
    pillars.fresherReadiness * ATS_PILLAR_WEIGHTS.fresherReadiness +
    pillars.formatSafety * ATS_PILLAR_WEIGHTS.formatSafety
  );

  // 7. Harsh Truths: Only items with confidence >= 'medium' (R5.6)
  const harshTruths: HarshTruthFinding[] = [];
  const worthChecking: WritingFinding[] = [];

  allFindings.forEach((f) => {
    if (f.confidence === 'high' || f.confidence === 'medium') {
      if (f.severity === 'high' || f.severity === 'medium') {
        harshTruths.push({
          issue: f.message,
          evidenceQuote: f.spanText,
          section: f.section,
          whyItMatters: f.ruleId === 'weak_opener'
            ? 'Passive openers make you look like a spectator rather than the engineer who solved the problem.'
            : f.ruleId === 'missing_metric'
            ? 'Screeners look for measured outcomes (users, scale, latency) to distinguish real projects from tutorial clones.'
            : 'Unsubstantiated claims increase drop-off rates during initial technical review.',
          severity: f.severity,
          confidence: f.confidence,
          fixQuestion: f.fixQuestion,
        });
      } else {
        worthChecking.push(f);
      }
    } else {
      worthChecking.push(f);
    }
  });

  // 8. Next Steps: Ordered skills learning roadmap without fake deadlines (R5.7)
  const nextSteps: LearningStep[] = matchResult.topGaps.map((gap, idx) => ({
    skill: gap.canonical,
    action: gap.isMandatory
      ? `Core must-have: Build a capstone feature demonstrating ${gap.canonical} and push code with README to GitHub.`
      : `Preferred qualification: Study documentation and implement an integration example with ${gap.canonical}.`,
    resourceCategory: 'Hands-on Project & Documentation',
    sequenceOrder: idx + 1,
  }));

  const endTime = performance.now();

  return {
    overallScore,
    pillars,
    matchResult,
    findings: allFindings,
    fresherChecks,
    harshTruths,
    worthChecking,
    nextSteps,
    diagnostics: ingestion.diagnostics,
    parserPreviewText: ingestion.diagnostics.previewText,
    executionTimeMs: Math.round(endTime - startTime),
  };
}
