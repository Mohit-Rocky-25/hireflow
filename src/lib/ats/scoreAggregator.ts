// ============================================================
// HireFlow ATS Engine — scoreAggregator
// Pure TypeScript module to compute final weighted ATS score
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
  // 1. Precalculate evidence checks and stuffing flags
  const bulletTextJoined = (resume.bullets || []).map((b) => b.rawText.toLowerCase()).join(' ');
  const skillsSectionRaw = (resume.sections.skills || []).join(' ').toLowerCase();

  let unsupportedSkillsCount = 0;
  for (const skill of resume.skillsExtracted) {
    const sLower = skill.toLowerCase();
    if (!bulletTextJoined.includes(sLower) && !resume.rawText.toLowerCase().includes(`with ${sLower}`)) {
      unsupportedSkillsCount++;
    }
  }

  const isStuffingFlagged =
    resume.skillsExtracted.length >= 25 &&
    unsupportedSkillsCount / resume.skillsExtracted.length > 0.65;

  // 1. Must-Have Coverage (35%)
  const mustHaves = skillMatches.filter((s) => s.importance === 'must_have');
  let mustHaveScore = 80; // default if JD had no explicit must haves

  if (mustHaves.length > 0) {
    let earnedWeight = 0;
    let totalWeight = 0;

    for (const item of mustHaves) {
      const w = item.weight || 4;
      totalWeight += w;

      const isClaimedInSkillsOnly =
        skillsSectionRaw.length > 0 &&
        skillsSectionRaw.includes(item.skill.toLowerCase()) &&
        !bulletTextJoined.includes(item.skill.toLowerCase()) &&
        !(resume.sections.experience || []).join(' ').toLowerCase().includes(item.skill.toLowerCase()) &&
        !(resume.sections.projects || []).join(' ').toLowerCase().includes(item.skill.toLowerCase());

      let matchMultiplier = 0;
      if (item.status === 'exact' || item.status === 'alias') {
        // Only discount unbacked skills if the resume was flagged for keyword stuffing
        matchMultiplier = isClaimedInSkillsOnly && isStuffingFlagged ? 0.50 : 1.0;
      } else if (item.status === 'implied') {
        matchMultiplier = 0.90;
      } else if (item.status === 'related') {
        matchMultiplier = 0.50;
      }

      earnedWeight += w * matchMultiplier;
    }

    mustHaveScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 70;
  }

  // 2. Evidence & Impact Quality (20%)
  let evidenceQualityScore = 50;
  if (bulletAnalyses.length > 0) {
    const avgScore =
      bulletAnalyses.reduce((acc, b) => acc + b.score, 0) / bulletAnalyses.length;
    evidenceQualityScore = Math.round(avgScore);
  }
  evidenceQualityScore = Math.max(10, Math.min(100, evidenceQualityScore));

  // 3. Nice-to-Have Coverage (10%)
  const niceToHaves = skillMatches.filter((s) => s.importance === 'nice_to_have');
  let niceToHaveScore = 75;

  if (niceToHaves.length > 0) {
    let earnedWeight = 0;
    let totalWeight = 0;

    for (const item of niceToHaves) {
      const w = item.weight || 3;
      totalWeight += w;

      if (item.status === 'exact' || item.status === 'alias') {
        earnedWeight += w * 1.0;
      } else if (item.status === 'implied') {
        earnedWeight += w * 0.85;
      } else if (item.status === 'related') {
        earnedWeight += w * 0.45;
      }
    }
    niceToHaveScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 70;
  }
  niceToHaveScore = Math.max(0, Math.min(100, Math.round(niceToHaveScore)));

  // 4. Seniority / Experience Fit (10%)
  const seniorityFitScore = seniority.score;

  // 5. Project / Role Relevance (10%)
  let projectRelevanceScore = 60;
  const resumeTextLower = resume.rawText.toLowerCase();
  const jdRoleTitleWords = jd.roleTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const titleMatches = jdRoleTitleWords.filter((w) => resumeTextLower.includes(w)).length;

  if (titleMatches >= 2) projectRelevanceScore += 25;
  else if (titleMatches === 1) projectRelevanceScore += 15;

  if (resume.sections.projects && resume.sections.projects.length > 0) {
    projectRelevanceScore += 15;
  }
  projectRelevanceScore = Math.max(20, Math.min(100, projectRelevanceScore));

  // 6. ATS Format Safety (10%)
  let formatSafetyScore = 100;
  for (const risk of formatRisks) {
    if (risk.severity === 'critical') formatSafetyScore -= 30;
    else if (risk.severity === 'high') formatSafetyScore -= 18;
    else if (risk.severity === 'medium') formatSafetyScore -= 10;
    else if (risk.severity === 'low') formatSafetyScore -= 5;
  }
  formatSafetyScore = Math.max(10, Math.min(100, formatSafetyScore));

  // 7. Keyword Stuffing Penalty (up to -15)
  let keywordStuffingPenalty = 0;
  if (isStuffingFlagged) {
    const penaltyRatio = unsupportedSkillsCount / resume.skillsExtracted.length;
    keywordStuffingPenalty = -Math.min(15, Math.max(10, Math.round(penaltyRatio * 15)));
  }

  // Final Weighted Calculation
  const rawFinalScore =
    mustHaveScore * 0.35 +
    evidenceQualityScore * 0.20 +
    niceToHaveScore * 0.10 +
    seniorityFitScore * 0.10 +
    projectRelevanceScore * 0.10 +
    formatSafetyScore * 0.10 +
    keywordStuffingPenalty;

  const finalScore = Math.max(5, Math.min(99, Math.round(rawFinalScore)));

  return {
    mustHaveCoverageScore: Math.round(mustHaveScore),
    evidenceQualityScore: Math.round(evidenceQualityScore),
    niceToHaveCoverageScore: Math.round(niceToHaveScore),
    seniorityFitScore: Math.round(seniorityFitScore),
    projectRelevanceScore: Math.round(projectRelevanceScore),
    formatSafetyScore: Math.round(formatSafetyScore),
    keywordStuffingPenalty,
    finalScore,
  };
}
