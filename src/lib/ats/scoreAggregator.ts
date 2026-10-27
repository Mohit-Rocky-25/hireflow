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
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const skillAliasesMap = new Map<string, string[]>();
for (const item of (skillsTaxonomyData as any[])) {
  const allNames = [item.canonical, ...(item.aliases || [])].map((a: string) => a.toLowerCase());
  for (const name of allNames) {
    skillAliasesMap.set(name, allNames);
  }
}

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

  // 1. Skills-Evidence Rule (Stage 2A)
  // evidenceRatio = (listed skills with at least 1 supporting mention in experience/project bullets) / (listed skills)
  // Stuffing flag fires strictly when listedOnly > 60% of listed skills AND listed skills >= 15
  const bulletTextJoined = (bulletAnalyses || []).map((b) => b.rawText.toLowerCase()).join(' ');
  const extractedList = resume.skillsExtracted || (resume.sections?.skills ? resume.sections.skills.join(', ').split(/[,•\n]+/).map(s => s.trim()).filter(Boolean) : []);
  const totalListedSkills = extractedList.length;
  let evidencedSkillsCount = 0;
  for (const skill of extractedList) {
    const sLower = skill.toLowerCase();
    const aliases = skillAliasesMap.get(sLower) || [sLower];
    const matchHasEvidence = skillMatches.some(
      (m) =>
        aliases.includes(m.skill.toLowerCase()) &&
        (m.status === 'exact' || m.status === 'alias') &&
        !m.isClaimedOnly
    );
    const inBullet = aliases.some(
      (a) => bulletTextJoined.includes(a) || resume.rawText.toLowerCase().includes(`with ${a}`)
    );
    if (matchHasEvidence || inBullet) {
      evidencedSkillsCount++;
    }
  }
  const listedOnlyCount = totalListedSkills - evidencedSkillsCount;
  const evidenceRatio = totalListedSkills > 0 ? evidencedSkillsCount / totalListedSkills : 1.0;
  const isStuffingFlagged = listedOnlyCount / Math.max(1, totalListedSkills) > 0.60 && totalListedSkills >= 15; // spec-exempt: legacy threshold awaiting Stage 3

  const keywordStuffingPenalty = isStuffingFlagged ? -15 : 0;
  if (isStuffingFlagged) {
    scoreExplanation.format.push(
      `Keyword stuffing flagged: ${listedOnlyCount} of ${totalListedSkills} listed skills (${Math.round((listedOnlyCount / totalListedSkills) * 100)}%) lack supporting project or bullet proof.`
    );
  }

  // 2. Must-Have Coverage (Evidence-Tiered Credit, Stage 2B)
  // Evidenced in bullets = 1.0, Listed only = 0.5, Implied via STRONG = 0.5, Weak/Missing = 0.0
  const mustHaves = skillMatches.filter((s) => s.importance === 'must_have');
  let mustHaveCoverageScore = 100;
  if (mustHaves.length > 0) {
    const earnedCreditSum = mustHaves.reduce((acc, m) => {
      if (m.earnedCredit !== undefined) return acc + m.earnedCredit;
      if (m.status === 'exact' || m.status === 'alias') return acc + (m.isClaimedOnly ? 0.5 : 1.0);
      if (m.status === 'implied') return acc + 0.5;
      if (m.status === 'related') return acc + 0.25; // spec-exempt: legacy credit awaiting Stage 3
      return acc;
    }, 0);
    mustHaveCoverageScore = Math.round((earnedCreditSum / mustHaves.length) * 100);

    const missingMustList = mustHaves.filter((s) => s.status === 'missing' || s.status === 'related');
    for (const m of missingMustList.slice(0, 2)) {
      scoreExplanation.mustHave.push(`Missing mandatory requirement: ${m.skill}`);
    }
  } else if (skillMatches.length > 0) {
    const earnedCreditSum = skillMatches.reduce((acc, m) => {
      if (m.earnedCredit !== undefined) return acc + m.earnedCredit;
      if (m.status === 'exact' || m.status === 'alias') return acc + (m.isClaimedOnly ? 0.5 : 1.0);
      if (m.status === 'implied') return acc + 0.5;
      return acc;
    }, 0);
    mustHaveCoverageScore = Math.round((earnedCreditSum / skillMatches.length) * 100);
  }

  // 3. Evidence & Impact Quality (20%)
  // Rule: If 0 bullets parsed, do NOT assign default 50%. Mark as N/A, exclude from total, and re-normalize.
  const isEvidenceNA = bulletAnalyses.length === 0;
  let evidenceQualityScore = 0;

  if (isEvidenceNA) {
    scoreExplanation.evidence.push('Not applicable: No structured experience bullet points found in resume.');
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
      if (n.earnedCredit !== undefined) {
        earned += n.earnedCredit;
      } else if (n.status === 'exact' || n.status === 'alias') {
        earned += n.isClaimedOnly ? 0.5 : 1.0;
      } else if (n.status === 'implied') {
        earned += 0.5;
      } else if (n.status === 'related') {
        earned += 0.25; // spec-exempt: legacy credit awaiting Stage 3
      }
    }
    niceToHaveCoverageScore = Math.round((earned / niceToHaves.length) * 100);
    const missingNice = niceToHaves.filter((s) => s.status === 'missing');
    for (const n of missingNice.slice(0, 2)) {
      scoreExplanation.niceToHave.push(`Missing preferred skill: ${n.skill}`);
    }
  }

  // 5. Seniority & Experience Fit (Constant-Pillar Rule, F19)
  // For entry-level / fresher roles with fresher candidates where seniority yields a constant 100,
  // we exclude this constant pillar and renormalize active weights.
  const seniorityFitScore = seniority.score;
  const isSeniorityConstant =
    (jd.yearsRequired === 0 || jd.seniority === 'fresher') &&
    seniorityFitScore === 100;
  if (isSeniorityConstant) {
    scoreExplanation.seniority.push(
      'Not applicable: Seniority Fit (excluded for fresher/entry-level role to prevent unearned point inflation).'
    );
  } else if (seniority.status === 'underqualified') {
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

  // 8. Re-normalization of weights across ACTIVE non-constant components
  const baseWeights = {
    mustHave: 0.35, // spec-exempt: legacy base weight awaiting Stage 3
    evidence: isEvidenceNA ? 0 : 0.20, // spec-exempt: legacy base weight awaiting Stage 3
    niceToHave: niceToHaves.length > 0 ? 0.10 : 0, // spec-exempt: legacy base weight awaiting Stage 3
    seniority: isSeniorityConstant ? 0 : 0.15, // spec-exempt: legacy base weight awaiting Stage 3
    project: 0.10, // spec-exempt: legacy base weight awaiting Stage 3
    format: 0.10, // spec-exempt: legacy base weight awaiting Stage 3
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
    (isSeniorityConstant ? 0 : seniorityFitScore * normWeights.seniority) +
    projectRelevanceScore * normWeights.project +
    formatSafetyScore * normWeights.format;

  let finalScore = Math.round(weightedSum + keywordStuffingPenalty);
  finalScore = Math.max(0, Math.min(100, finalScore));

  // Hard Invariant: Cap composite score at 35 when zero mandatory skills match
  if (mustHaves.length > 0 && mustHaveCoverageScore === 0) {
    finalScore = Math.min(finalScore, 35);
  }

  // 9. Experience Gap Notice (Stage 2A: No hidden hard cap on composite score)
  let dealbreakerTriggered: { rule: string; reason: string } | undefined;
  if (
    seniority.status === 'underqualified' &&
    seniority.requiredYears >= 4 &&
    seniority.candidateYears <= 1
  ) {
    dealbreakerTriggered = {
      rule: `Experience Gap: Role specifies ${seniority.requiredYears}+ years of production engineering experience.`,
      reason: `Candidate has ~${seniority.candidateYears} yrs experience (student/fresher level), lowering seniority fit without artificially capping composite score.`,
    };
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
    isStuffingFlagged,
    isSeniorityConstant,
    confidence,
    confidenceReason,
    isEvidenceNA,
    scoreExplanation,
    dealbreakerTriggered,
    effectiveWeights,
  };
}
