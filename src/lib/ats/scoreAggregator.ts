// ============================================================
// HireFlow ATS Engine — scoreAggregator
// Deterministic scoring strictly satisfying Invariant 1 to 5
// ============================================================

import {
  BulletAnalysis,
  FormatRiskItem,
  ParsedJD,
  ParsedResume,
  ScoreBreakdown,
  SeniorityFitResult,
  SkillMatchResult,
} from './types';

export function scoreAggregator(
  resume: ParsedResume,
  jd: ParsedJD,
  skillMatches: SkillMatchResult[],
  bulletAnalyses: BulletAnalysis[],
  seniority: SeniorityFitResult,
  formatRisks: FormatRiskItem[]
): ScoreBreakdown {
  const scoreExplanation: Record<string, string[]> = {
    mustHave: [],
    evidence: [],
    niceToHave: [],
    seniority: [],
    project: [],
    format: [],
  };

  // 1. Keyword Stuffing Detection
  const bulletTextJoined = (bulletAnalyses || []).map((b) => b.rawText.toLowerCase()).join(' ');
  const skillsWordCount = (resume.sections.skills || []).join(' ').split(/\s+/).filter(Boolean).length;
  const isSkillsDominated = resume.wordCount > 0 && skillsWordCount / resume.wordCount > 0.40;
  const isExtremeCount = resume.skillsExtracted.length >= 40;

  let unsupportedSkillsCount = 0;
  for (const skill of resume.skillsExtracted) {
    const sLower = skill.toLowerCase();
    if (!bulletTextJoined.includes(sLower) && !resume.rawText.toLowerCase().includes(`with ${sLower}`)) {
      unsupportedSkillsCount++;
    }
  }

  const isStuffingFlagged =
    (isExtremeCount || isSkillsDominated) &&
    unsupportedSkillsCount / Math.max(1, resume.skillsExtracted.length) > 0.65;

  const keywordStuffingPenalty = isStuffingFlagged ? -15 : 0;
  if (isStuffingFlagged) {
    scoreExplanation.format.push(
      `Keyword stuffing detected: ${unsupportedSkillsCount} of ${resume.skillsExtracted.length} listed skills lack any project or bullet evidence.`
    );
  }

  // 2. Must-Have Coverage (35%)
  // Invariant 1: mustHaveCoverage must equal (must-haves with status exact|alias|implied) / (total must-haves)
  const mustHaves = skillMatches.filter((s) => s.importance === 'must_have');
  const matchedMustHaves = mustHaves.filter(
    (s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied'
  );

  let mustHaveCoverageScore = 100;
  if (mustHaves.length > 0) {
    mustHaveCoverageScore = Math.round((matchedMustHaves.length / mustHaves.length) * 100);
    const missingMustList = mustHaves.filter((s) => s.status === 'missing' || s.status === 'related');
    for (const m of missingMustList.slice(0, 2)) {
      scoreExplanation.mustHave.push(`Missing mandatory requirement: ${m.skill}`);
    }
  } else if (skillMatches.length > 0) {
    const allMatched = skillMatches.filter(
      (s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied'
    );
    mustHaveCoverageScore = Math.round((allMatched.length / skillMatches.length) * 100);
  }

  // 3. Evidence & Impact Quality (20%)
  // Rule: If 0 bullets parsed, do NOT assign default 50%. Mark as N/A, exclude from total, and re-normalize.
  const isEvidenceNA = bulletAnalyses.length === 0;
  let evidenceQualityScore = 0;

  if (isEvidenceNA) {
    scoreExplanation.evidence.push('Not enough data: No structured experience bullet points found in resume.');
  } else {
    const sumScores = bulletAnalyses.reduce((acc, b) => acc + b.score, 0);
    evidenceQualityScore = Math.round(sumScores / bulletAnalyses.length);

    const weakBullets = bulletAnalyses.filter((b) => b.score < 50);
    if (weakBullets.length > 0) {
      scoreExplanation.evidence.push(
        `${weakBullets.length} bullet point(s) lack quantifiable metrics or decisive engineering action verbs.`
      );
    }
    const jdStyle = bulletAnalyses.filter((b) => b.isJobDescriptionStyle);
    if (jdStyle.length > 0) {
      scoreExplanation.evidence.push(
        'Bullet points read like job duties rather than personal engineering accomplishments.'
      );
    }
  }

  // 4. Nice-to-Have Coverage (10%)
  const niceToHaves = skillMatches.filter((s) => s.importance === 'nice_to_have');
  let niceToHaveCoverageScore = 100;
  if (niceToHaves.length > 0) {
    let earned = 0;
    for (const n of niceToHaves) {
      if (n.status === 'exact' || n.status === 'alias' || n.status === 'implied') {
        earned += 1.0;
      } else if (n.status === 'related') {
        earned += 0.5;
      }
    }
    niceToHaveCoverageScore = Math.round((earned / niceToHaves.length) * 100);
    const missingNice = niceToHaves.filter((s) => s.status === 'missing');
    for (const n of missingNice.slice(0, 2)) {
      scoreExplanation.niceToHave.push(`Missing preferred skill: ${n.skill}`);
    }
  }

  // 5. Seniority & Experience Fit (15%)
  const seniorityFitScore = seniority.score;
  if (seniority.status === 'underqualified') {
    scoreExplanation.seniority.push(seniority.reasoning);
  } else if (seniority.status === 'overqualified') {
    scoreExplanation.seniority.push(seniority.reasoning);
  }

  // 6. Project & Role Relevance (10%)
  let projectRelevanceScore = 80;
  const projectBullets = (resume.sections.projects || []).join(' ').toLowerCase();
  const expBullets = (resume.sections.experience || []).join(' ').toLowerCase();
  const allWorkText = `${projectBullets} ${expBullets}`;

  if (allWorkText.length < 50) {
    projectRelevanceScore = 45;
    scoreExplanation.project.push('Sparse project and work experience descriptions.');
  } else {
    const matchedInWork = skillMatches.filter(
      (s) => (s.status === 'exact' || s.status === 'alias') && allWorkText.includes(s.skill.toLowerCase())
    ).length;
    if (matchedInWork >= 4) {
      projectRelevanceScore = 95;
    } else if (matchedInWork >= 2) {
      projectRelevanceScore = 80;
    } else if (matchedInWork >= 1) {
      projectRelevanceScore = 70;
      scoreExplanation.project.push('Few core job technologies demonstrated inside actual project or work experience.');
    } else {
      projectRelevanceScore = 45;
      scoreExplanation.project.push('No direct evidence of target role technologies inside projects or work history.');
    }
  }

  // Adjust for career switcher / underqualified seniority gap
  if (seniority.status === 'underqualified' && projectRelevanceScore > 65) {
    projectRelevanceScore = 65;
    scoreExplanation.project.push('Project scope is introductory/academic compared to senior requirements.');
  }

  // Adjust for keyword stuffing with no project depth
  if (isStuffingFlagged) {
    projectRelevanceScore = Math.min(projectRelevanceScore, 30);
  }

  // 7. ATS Format & Parsing Safety (10%)
  let formatSafetyScore = 100;
  for (const r of formatRisks) {
    if (r.severity === 'critical') formatSafetyScore -= 30;
    else if (r.severity === 'high') formatSafetyScore -= 15;
    else if (r.severity === 'medium') formatSafetyScore -= 8;
    else if (r.severity === 'low') formatSafetyScore -= 4;
  }
  formatSafetyScore = Math.max(10, Math.min(100, formatSafetyScore));
  for (const r of formatRisks.slice(0, 2)) {
    scoreExplanation.format.push(`[${r.severity.toUpperCase()}] ${r.name}`);
  }

  // 8. Re-normalization of weights if any component is N/A
  // Base weights: mustHave=0.35, evidence=0.20, niceToHave=0.10, seniority=0.15, project=0.10, format=0.10
  const baseWeights = {
    mustHave: 0.35,
    evidence: isEvidenceNA ? 0 : 0.20,
    niceToHave: niceToHaves.length > 0 ? 0.10 : 0,
    seniority: 0.15,
    project: 0.10,
    format: 0.10,
  };

  const totalActiveWeight =
    baseWeights.mustHave +
    baseWeights.evidence +
    baseWeights.niceToHave +
    baseWeights.seniority +
    baseWeights.project +
    baseWeights.format;

  const normWeights = {
    mustHave: baseWeights.mustHave / totalActiveWeight,
    evidence: baseWeights.evidence / totalActiveWeight,
    niceToHave: baseWeights.niceToHave / totalActiveWeight,
    seniority: baseWeights.seniority / totalActiveWeight,
    project: baseWeights.project / totalActiveWeight,
    format: baseWeights.format / totalActiveWeight,
  };

  const effectiveWeights = {
    mustHave: Math.round(normWeights.mustHave * 100),
    evidence: Math.round(normWeights.evidence * 100),
    niceToHave: Math.round(normWeights.niceToHave * 100),
    seniority: Math.round(normWeights.seniority * 100),
    projects: Math.round(normWeights.project * 100),
    format: Math.round(normWeights.format * 100),
  };

  const weightedSum =
    mustHaveCoverageScore * normWeights.mustHave +
    (isEvidenceNA ? 0 : evidenceQualityScore * normWeights.evidence) +
    niceToHaveCoverageScore * normWeights.niceToHave +
    seniorityFitScore * normWeights.seniority +
    projectRelevanceScore * normWeights.project +
    formatSafetyScore * normWeights.format;

  let finalScore = Math.round(weightedSum + keywordStuffingPenalty);
  finalScore = Math.max(0, Math.min(100, finalScore));

  // 9. Dealbreaker Checks
  let dealbreakerTriggered: { rule: string; reason: string } | undefined;
  if (
    seniority.status === 'underqualified' &&
    seniority.requiredYears >= 4 &&
    seniority.candidateYears <= 1
  ) {
    dealbreakerTriggered = {
      rule: `Mandatory Seniority: Role demands ${seniority.requiredYears}+ years of production engineering experience.`,
      reason: `Candidate has ~${seniority.candidateYears} yrs experience (student/fresher level), falling critically short of senior role mandate.`,
    };
    finalScore = Math.min(finalScore, 55);
  }

  // 10. Confidence Evaluation
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  let confidenceReason: string | undefined;

  if (isEvidenceNA || resume.parseStatus === 'warning' || resume.parseStatus === 'failed') {
    confidence = 'Low';
    confidenceReason = isEvidenceNA
      ? 'No structured bullet points found; evidence & metric impact cannot be evaluated reliably.'
      : 'Resume text lacks standard sections or clear work history.';
  } else if (bulletAnalyses.length < 3 || skillMatches.length < 4) {
    confidence = 'Medium';
    confidenceReason = 'Limited number of bullets or keywords extracted for comprehensive assessment.';
  }

  return {
    mustHaveCoverageScore,
    evidenceQualityScore: isEvidenceNA ? 0 : evidenceQualityScore,
    niceToHaveCoverageScore,
    seniorityFitScore,
    projectRelevanceScore,
    formatSafetyScore,
    keywordStuffingPenalty,
    finalScore,
    confidence,
    confidenceReason,
    isEvidenceNA,
    scoreExplanation,
    dealbreakerTriggered,
    effectiveWeights,
  };
}
