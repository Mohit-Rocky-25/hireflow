// ============================================================
// ATS Resume Roaster — Deterministic Scorer (Stage 3)
// Evaluates candidate fit, subscores, penalties, bands, and top fixes
// ============================================================

import scoringConfigData from '../knowledge/scoring-config.json';
import tiersData from '../knowledge/tiers.json';
import {
  SkillResult,
  ExperienceEntry,
  ProjectEntry,
  ContactInfo,
  ParsedSection,
  Subscores,
  PenaltyItem,
  FixFirstItem,
  TargetTierId,
} from './types';

interface ScorerInput {
  wordCount: number;
  skillResults: SkillResult[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  contactInfo: ContactInfo;
  sections: ParsedSection[];
  candidateYears: number;
  requiredYears?: number;
  targetTier: TargetTierId;
}

export function computeAtsScore(input: ScorerInput) {
  const {
    wordCount,
    skillResults,
    experience,
    projects,
    contactInfo,
    sections,
    candidateYears,
    requiredYears = 2,
    targetTier,
  } = input;

  const weights = scoringConfigData.weights;
  const penaltiesConfig = scoringConfigData.penalties;
  const tiersConfig = tiersData.tiers as Record<string, any>;
  const activeTier = tiersConfig[targetTier] || tiersConfig['top_product'];

  // 1. Must-Have Coverage (Weight 30)
  const mustSkills = skillResults.filter(s => s.required === 'must');
  const verifiedOrWeakMust = mustSkills.filter(s => s.status !== 'missing');
  const fullyVerifiedMust = mustSkills.filter(s => s.status === 'verified');

  const mustTotalCount = mustSkills.length;
  const mustMetCount = verifiedOrWeakMust.length;
  const mustMetRatio = mustTotalCount > 0 ? mustMetCount / mustTotalCount : 1.0;

  // Fully verified musts get full weight; weak musts get partial weight
  const mustScoreFactor = mustTotalCount > 0
    ? (fullyVerifiedMust.length * 1.0 + (mustMetCount - fullyVerifiedMust.length) * 0.5) / mustTotalCount
    : 1.0;
  const mustHaveCoverage = Math.round(mustScoreFactor * weights.mustHaveCoverage * 10) / 10;

  // 2. Evidence Depth (Weight 20)
  const totalFoundSkills = skillResults.filter(s => s.found);
  const verifiedFoundSkills = skillResults.filter(s => s.status === 'verified');
  const evidenceDepthRatio = totalFoundSkills.length > 0
    ? verifiedFoundSkills.length / totalFoundSkills.length
    : 0;
  const evidenceDepth = Math.round(evidenceDepthRatio * weights.evidenceDepth * 10) / 10;

  // 3. Impact Metrics (Weight 15)
  const allBullets = [
    ...experience.flatMap(e => e.bullets),
    ...projects.flatMap(p => p.bullets),
  ];
  const metricBullets = allBullets.filter(b => b.hasMetric);
  const metricsRatio = allBullets.length > 0 ? metricBullets.length / allBullets.length : 0;
  const targetMetricRatio = activeTier.minMetricBulletRatio || 0.5;
  const metricScoreFactor = Math.min(1.0, metricsRatio / targetMetricRatio);
  const impactMetrics = Math.round(metricScoreFactor * weights.impactMetrics * 10) / 10;

  // 4. Projects and OSS (Weight 10)
  // 4. Projects and OSS (Weight 10)
  let projectScoreFactor = 0;
  if (projects.length >= 2) projectScoreFactor = 1.0;
  else if (projects.length === 1) projectScoreFactor = 0.7;
  else if (experience.length >= 2) projectScoreFactor = 0.9;
  else if (experience.length === 1) projectScoreFactor = 0.5;
  const projectsAndOss = Math.round(projectScoreFactor * weights.projectsAndOss * 10) / 10;

  // 5. Seniority Fit (Weight 10)
  let seniorityScoreFactor = 1.0;
  if (candidateYears < requiredYears) {
    const diff = requiredYears - candidateYears;
    seniorityScoreFactor = Math.max(0.2, 1.0 - (diff * 0.25));
  }
  const seniorityFitScore = Math.round(seniorityScoreFactor * weights.seniorityFit * 10) / 10;

  // 6. Format and Parse Quality (Weight 10)
  const standardSections = ['experience', 'education', 'skills'];
  if (candidateYears < 2 && experience.length < 2) {
    standardSections.push('projects');
  }
  const presentSections = new Set(sections.map(s => s.type));
  const missingStandardSections = standardSections.filter(s => !presentSections.has(s));
  let formatScoreFactor = 1.0 - (missingStandardSections.length * 0.2);
  if (!contactInfo.email || !contactInfo.phone) formatScoreFactor -= 0.15;
  formatScoreFactor = Math.max(0, formatScoreFactor);
  const formatAndParse = Math.round(formatScoreFactor * weights.formatAndParse * 10) / 10;

  // 7. Tier Fit (Weight 5)
  let tierScoreFactor = 0.5;
  if (metricsRatio >= targetMetricRatio && mustMetRatio >= 0.8) tierScoreFactor = 1.0;
  else if (mustMetRatio >= 0.6) tierScoreFactor = 0.7;
  const tierFit = Math.round(tierScoreFactor * weights.tierFit * 10) / 10;

  const subscores: Subscores = {
    mustHaveCoverage,
    evidenceDepth,
    impactMetrics,
    projectsAndOss,
    seniorityFit: seniorityFitScore,
    formatAndParse,
    tierFit,
  };

  const rawSubtotal = mustHaveCoverage + evidenceDepth + impactMetrics + projectsAndOss + seniorityFitScore + formatAndParse + tierFit;

  // Penalties
  const penalties: PenaltyItem[] = [];

  // Keyword stuffing: skills in skills section with 0 supporting bullets
  const verifiedSkillsCount = skillResults.filter(s => s.status === 'verified').length;
  const stuffedSkills = skillResults.filter(s => s.status === 'weak').map(s => s.canonical);
  if (stuffedSkills.length >= 5 && (verifiedSkillsCount === 0 || stuffedSkills.length > verifiedSkillsCount * 1.5)) {
    const penaltyPoints = Math.min(10, Math.round(stuffedSkills.length * 1.5));
    penalties.push({
      id: 'keyword_stuffing',
      label: 'Keyword Stuffing Detected',
      points: -penaltyPoints,
      reason: `${stuffedSkills.length} skills listed in skills section lack any project or experience evidence (${stuffedSkills.slice(0, 3).join(', ')}...).`,
    });
  }

  // Missing contact info
  if (!contactInfo.email || !contactInfo.phone) {
    penalties.push({
      id: 'no_contact_info',
      label: 'Missing Critical Contact Information',
      points: penaltiesConfig.noContactInfo,
      reason: 'Resume is missing direct recruiter contact channels (email or phone).',
    });
  }

  // Missing standard sections
  for (const missingSec of missingStandardSections) {
    penalties.push({
      id: `missing_${missingSec}`,
      label: `Missing Dedicated ${missingSec.toUpperCase()} Section`,
      points: penaltiesConfig.missingStandardSection,
      reason: `ATS parser expects a dedicated header for ${missingSec}.`,
    });
  }

  // Word count outlier
  if (wordCount < 250 || wordCount > 1200) {
    penalties.push({
      id: 'word_count_outlier',
      label: wordCount < 250 ? 'Resume Abnormally Brief' : 'Resume Overly Verbose',
      points: penaltiesConfig.wordCountOutlier,
      reason: `Resume has ${wordCount} words (ideal technical resumes range between 250 and 1,200 words).`,
    });
  }

  const totalPenalties = penalties.reduce((sum, p) => sum + p.points, 0);
  let finalScore = Math.max(0, Math.min(100, Math.round(rawSubtotal + totalPenalties)));

  // CAP RULE: If must-haves met is under 50%, cap score at 64
  if (mustMetRatio < 0.5 && finalScore > 64) {
    finalScore = 64;
  }

  // Determine Band
  let band: 'Strong' | 'Competitive' | 'Needs work' | 'Weak match' = 'Weak match';
  if (finalScore >= 85 && mustMetRatio >= 0.75) {
    band = 'Strong';
  } else if (finalScore >= 70 && mustMetRatio >= 0.5) {
    band = 'Competitive';
  } else if (finalScore >= 55) {
    band = 'Needs work';
  } else {
    band = 'Weak match';
  }

  // Parse Quality & Confidence
  let parseQuality: 'High' | 'Medium' | 'Poor' = 'High';
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  let confidenceReason: string | undefined = undefined;

  if (experience.length === 0 && projects.length === 0 && wordCount > 300) {
    parseQuality = 'Poor';
    confidence = 'Low';
    confidenceReason = 'Experience and projects sections could not be cleanly identified due to non-standard headings or formatting.';
  } else if (missingStandardSections.length >= 2 || wordCount < 200) {
    parseQuality = 'Medium';
    confidence = 'Medium';
    confidenceReason = 'Missing standard headings may reduce ATS parsing reliability.';
  }

  // Fix First items
  const fixFirst: FixFirstItem[] = [];
  const missingMust = skillResults.filter(s => s.required === 'must' && s.status === 'missing');
  for (const m of missingMust.slice(0, 2)) {
    fixFirst.push({
      title: `Add Verifiable Evidence for ${m.canonical}`,
      reason: `Missing mandatory requirement: ${m.canonical}. Add a concrete project or work experience bullet.`,
      expectedScoreGain: Math.round(m.weight * 2.5),
      type: 'missing_must_have',
      skillId: m.skillId,
    });
  }

  const weakBullets = allBullets.filter(b => b.score < 60);
  if (weakBullets.length > 0 && fixFirst.length < 3) {
    fixFirst.push({
      title: 'Quantify Engineering Impact in Bullets',
      reason: `${weakBullets.length} bullet point(s) lack measurable outcomes or strong action verbs.`,
      expectedScoreGain: 8,
      type: 'weak_bullet',
    });
  }

  if (stuffedSkills.length >= 3 && fixFirst.length < 3) {
    fixFirst.push({
      title: 'Back Up Listed Skills with Experience',
      reason: `${stuffedSkills.length} skills listed in skills section have zero project or experience bullets.`,
      expectedScoreGain: 6,
      type: 'keyword_stuffed',
    });
  }

  // Headline & Summary single source of truth
  const mustHavesMetStr = `${mustMetCount}/${mustTotalCount}`;
  let headline = '';
  if (mustMetCount === mustTotalCount && mustTotalCount > 0) {
    headline = `Meets 100% of Must-Have Requirements (${mustHavesMetStr}) · Verified ATS Compatibility`;
  } else if (mustMetRatio >= 0.75) {
    headline = `Strong Core Match (${mustHavesMetStr} must-haves met) · Minor evidence gaps detected`;
  } else if (mustMetRatio >= 0.5) {
    headline = `Moderate Alignment (${mustHavesMetStr} must-haves met) · Key requirements missing`;
  } else {
    headline = `High Risk ATS Profile (${mustHavesMetStr} must-haves met) · Missing core job requirements`;
  }

  return {
    score: finalScore,
    band,
    confidence,
    confidenceReason,
    headline,
    subscores,
    penalties,
    mustHavesMet: mustHavesMetStr,
    mustHavesMetRatio: mustMetRatio,
    missingKeywordsCount: skillResults.filter(s => s.status === 'missing').length,
    parseQuality,
    fixFirst,
    metricsRatio,
    weakBulletsCount: weakBullets.length,
    stuffedSkills,
    missingStandardSections,
  };
}
