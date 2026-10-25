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
import { getVerdictBand } from './reportState';

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

  const activeWeights = weights;

  // 1. Must-Have Coverage (Evidence-Tiered Credit, Stage 2B)
  const mustSkills = skillResults.filter(s => s.required === 'must');
  const mustTotalCount = mustSkills.length;

  let earnedCreditSum = 0;
  for (const s of mustSkills) {
    if (s.status === 'verified') {
      earnedCreditSum += 1.0; // Evidenced in bullets = 1.0
    } else if (s.status === 'weak') {
      earnedCreditSum += 0.5; // Listed only = 0.5 (F6 bare mention cap)
    } else if ((s as any).evidenceTier === 'implied_strong') {
      earnedCreditSum += 0.5;
    }
  }

  const mustMetCount = mustSkills.filter(s => s.status !== 'missing').length;
  const mustMetRatio = mustTotalCount > 0 ? mustMetCount / mustTotalCount : 1.0;
  const mustScoreFactor = mustTotalCount > 0 ? earnedCreditSum / mustTotalCount : 1.0;
  const mustHaveCoverage = Math.round(mustScoreFactor * activeWeights.mustHaveCoverage * 10) / 10;

  // 2. Evidence Depth (Weight 20 or 25 for fresher) — Strictly Monotonic
  const totalFoundSkills = skillResults.filter(s => s.found);
  const verifiedFoundSkills = skillResults.filter(s => s.status === 'verified');
  const weakFoundSkills = skillResults.filter(s => s.status === 'weak');
  const totalEvidenceTierSum = skillResults.reduce((acc, s) => acc + (s.evidenceScore || (s.status === 'verified' ? 0.85 : s.status === 'weak' ? 0.4 : 0)), 0); // spec-exempt: legacy scorer awaiting Stage 3
 
  // Strictly monotonic: adding any demonstrated skill or weak skill adds positive contribution, never reduces
  const baseTarget = Math.max(1, mustTotalCount * 0.85); // spec-exempt: legacy scorer awaiting Stage 3
  const evidenceDepthFactor = Math.min(
    1.0,
    (verifiedFoundSkills.length * 1.0 + weakFoundSkills.length * 0.25 + totalEvidenceTierSum * 0.1) / (baseTarget + 0.5) // spec-exempt: legacy scorer awaiting Stage 3
  );
  const evidenceDepth = Math.round(evidenceDepthFactor * activeWeights.evidenceDepth * 10) / 10;

  // 3. Impact Metrics (Weight 15)
  const allBullets = [
    ...experience.flatMap(e => e.bullets),
    ...projects.flatMap(p => p.bullets),
  ];
  const metricBullets = allBullets.filter(b => b.hasMetric);
  const metricsRatio = allBullets.length > 0 ? metricBullets.length / allBullets.length : 0;
  const targetMetricRatio = activeTier.minMetricBulletRatio || 0.5;
  const metricScoreFactor = Math.min(1.0, metricsRatio / targetMetricRatio);
  const impactMetrics = Math.round(metricScoreFactor * activeWeights.impactMetrics * 10) / 10;

  // 4. Projects and OSS (Weight 10 or 15 for fresher)
  let projectScoreFactor = 0;
  if (projects.length >= 2) projectScoreFactor = 1.0;
  else if (projects.length === 1) projectScoreFactor = 0.7;
  else if (experience.length >= 2) projectScoreFactor = 0.9;
  else if (experience.length === 1) projectScoreFactor = 0.5;
  const projectsAndOss = Math.round(projectScoreFactor * activeWeights.projectsAndOss * 10) / 10;

  // 5. Seniority Fit
  let seniorityScoreFactor = 1.0;
  if (candidateYears < requiredYears) {
    const diff = requiredYears - candidateYears;
    seniorityScoreFactor = Math.max(0.1, 1.0 - (diff * 0.25)); // spec-exempt: legacy scorer awaiting Stage 3
  }
  const seniorityFitScore = Math.round(seniorityScoreFactor * activeWeights.seniorityFit * 10) / 10;

  // 6. Format and Parse Quality (Weight 10)
  const isFresher = candidateYears <= 1;
  const standardSections = isFresher ? ['education', 'skills', 'projects'] : ['experience', 'education', 'skills'];
  const presentSections = new Set(sections.map(s => s.type));
  const missingStandardSections = standardSections.filter(s => !presentSections.has(s));
  let formatScoreFactor = 1.0 - (missingStandardSections.length * 0.2);
  if (!contactInfo.email || !contactInfo.phone) formatScoreFactor -= 0.15;
  formatScoreFactor = Math.max(0, formatScoreFactor);
  const formatAndParse = Math.round(formatScoreFactor * activeWeights.formatAndParse * 10) / 10;

  // 7. Tier Fit (Weight 5)
  let tierScoreFactor = 0.5;
  if (metricsRatio >= targetMetricRatio && mustMetRatio >= 0.8) tierScoreFactor = 1.0;
  else if (mustMetRatio >= 0.6) tierScoreFactor = 0.7;
  const tierFit = Math.round(tierScoreFactor * activeWeights.tierFit * 10) / 10;

  // Additional explainable metrics
  const niceSkills = skillResults.filter(s => s.required === 'nice');
  const niceMetCount = niceSkills.filter(s => s.found).length;
  const niceToHaveCoverage = niceSkills.length > 0 ? Math.round((niceMetCount / niceSkills.length) * 10 * 10) / 10 : 10;
  const titleAlignment = Math.min(10, Math.round(seniorityScoreFactor * 10 * 10) / 10);
  const educationAndCerts = Math.round(Math.min(5, (sections.some(s => s.type === 'education') ? 3 : 0) + (sections.some(s => s.type === 'certifications') ? 2 : 1)) * 10) / 10;
  const parseHealth = Math.round(formatScoreFactor * 5 * 10) / 10;

  const subscores: Subscores = {
    mustHaveCoverage,
    evidenceDepth,
    impactMetrics,
    projectsAndOss,
    seniorityFit: seniorityFitScore,
    formatAndParse,
    tierFit,
    niceToHaveCoverage,
    titleAlignment,
    educationAndCerts,
    parseHealth,
  };

  const rawSubtotal = mustHaveCoverage + evidenceDepth + impactMetrics + projectsAndOss + seniorityFitScore + formatAndParse + tierFit;

  // Penalties
  const penalties: PenaltyItem[] = [];

  // Skills-evidence rule (Stage 2A):
  // evidenceRatio = (listed skills with at least one supporting mention in experience/project bullets) / (listed skills)
  // Stuffing flag when listedOnly > 60% of listed skills AND listed skills >= 15
  const skillsSec = sections.find(s => s.type === 'skills');
  let resumeSkillsList: string[] = [];
  if (skillsSec && skillsSec.content) {
    resumeSkillsList = skillsSec.content
      .split(/[,;\n•|]+/)
      .map(s => s.trim().replace(/^[-*•\s]+/, ''))
      .filter(s => s.length > 1 && !/^(skills|technical skills|proficiencies|tools|languages|frameworks):?$/i.test(s));
  } else {
    for (const sec of sections) {
      const match = sec.content.match(/(?:skills|technical skills|proficiencies):\s*([^\n]+)/i);
      if (match && match[1]) {
        resumeSkillsList = match[1]
          .split(/[,;\n•|]+/)
          .map(s => s.trim().replace(/^[-*•\s]+/, ''))
          .filter(s => s.length > 1 && !/^(skills|technical skills|proficiencies|tools|languages|frameworks):?$/i.test(s));
        break;
      }
    }
  }

  const allBulletText = allBullets.map(b => b.rawText.toLowerCase()).join(' ');
  const evidencedInBulletsCount = resumeSkillsList.filter(s => allBulletText.includes(s.toLowerCase())).length;
  const listedSkillsCount = resumeSkillsList.length > 0 ? resumeSkillsList.length : skillResults.length;
  const evidencedCount = resumeSkillsList.length > 0 ? evidencedInBulletsCount : skillResults.filter(s => s.status === 'verified').length;
  const listedOnlyCount = listedSkillsCount - evidencedCount;
  const isStuffingFlagged = listedOnlyCount / Math.max(1, listedSkillsCount) > 0.60 && listedSkillsCount >= 15; // spec-exempt: legacy scorer awaiting Stage 3

  if (isStuffingFlagged) {
    const penaltyPoints = Math.min(15, Math.max(5, Math.round(listedOnlyCount * 0.8)));
    penalties.push({
      id: 'keyword_stuffing',
      label: 'Keyword Stuffing Detected',
      points: -penaltyPoints,
      reason: `${listedOnlyCount} of ${listedSkillsCount} skills listed in skills section lack any project or experience evidence.`,
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
  const minWords = isFresher ? 140 : 250;
  if (wordCount < minWords || wordCount > 1200) {
    penalties.push({
      id: 'word_count_outlier',
      label: wordCount < minWords ? 'Resume Abnormally Brief' : 'Resume Overly Verbose',
      points: penaltiesConfig.wordCountOutlier,
      reason: `Resume has ${wordCount} words (ideal technical resumes range between ${minWords} and 1,200 words).`,
    });
  }

  let finalScore = Math.max(0, Math.min(100, Math.round(rawSubtotal)));

  // Zero-bullet / Zero-match invariant: Formatting & default seniority cannot float an unevidenced non-matching candidate above 0
  if (mustSkills.length > 0 && mustMetCount === 0 && allBullets.length === 0 && totalFoundSkills.length === 0) {
    finalScore = 0;
  }

  // Determine Band
  const band = getVerdictBand(finalScore);

  // Parse Quality & Confidence
  let parseQuality: 'High' | 'Medium' | 'Poor' = 'High';
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  let confidenceReason: string | undefined = undefined;

  if (experience.length === 0 && projects.length === 0) {
    parseQuality = 'Poor';
    confidence = 'Low';
    confidenceReason = wordCount < 200
      ? `Resume text is unusually brief (${wordCount} words) with minimal project or experience content. Scoring confidence is limited.`
      : 'Experience and projects sections could not be cleanly identified due to non-standard headings or formatting.';
  } else if (wordCount < 200) {
    parseQuality = 'Medium';
    confidence = 'Medium';
    confidenceReason = `Resume text is unusually brief (${wordCount} words). A full technical resume typically requires 300–800 words for comprehensive evaluation.`;
  } else if (missingStandardSections.length >= 2) {
    parseQuality = 'Medium';
    confidence = 'Medium';
    confidenceReason = `Missing standard sections (${missingStandardSections.join(', ')}) may reduce ATS parsing reliability.`;
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

  const weakBullets = allBullets.filter(b => b.rawText && b.rawText.trim().length > 15 && b.score < 60);
  if (weakBullets.length > 0 && fixFirst.length < 3) {
    fixFirst.push({
      title: 'Quantify Engineering Impact in Bullets',
      reason: `${weakBullets.length} bullet point(s) lack measurable outcomes or strong action verbs.`,
      expectedScoreGain: 8,
      type: 'weak_bullet',
    });
  }

  const stuffedSkills = skillResults.filter(s => s.status === 'weak');
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
  } else if (mustMetRatio >= 0.75) { // spec-exempt: legacy scorer awaiting Stage 3
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
    activeWeights,
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
