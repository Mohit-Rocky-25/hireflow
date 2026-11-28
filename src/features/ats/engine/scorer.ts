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
import { computeSpecFingerprint } from '../../../scoring/core/fingerprint';
import type { ScoreTrace, PillarTraceItem, ScoreAdjustment } from '../../../scoring/core/types';
import { evaluateResumeImpact, ImpactBulletInput } from './metricExtractor';

const INLINE_EDUCATION_REGEX = /\b(?:b\.?tech|b\.?e\.?|b\.?s\.?|b\.?sc\.?|m\.?tech|m\.?s\.?|m\.?sc\.?|mba|ph\.?d\.?|bachelor(?:'s)?|master(?:'s)?|university|institute\s+of\s+technology|cgpa|gpa)\b/i;

export const ATS_SEVEN_DIMENSION_SPEC_VERSION = '4.0.0-ats7d';
export const ATS_ENGINE_VERSION = '4.0.0';
export const ATS_SEVEN_DIMENSION_FINGERPRINT = computeSpecFingerprint({
  specVersion: ATS_SEVEN_DIMENSION_SPEC_VERSION,
  weights: scoringConfigData.weights,
  penalties: scoringConfigData.penalties,
  wordCountLimits: scoringConfigData.wordCountLimits,
} as any);

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
  jdText?: string;
  seniorityMatchResult?: import('./seniorityMatcher').SeniorityMatchResult;
  bonuses?: Array<{
    id: string;
    label: string;
    points: number;
    reason: string;
    cause?: string;
  }>;
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
    requiredYears,
    targetTier,
  } = input;

  const weights = scoringConfigData.weights;
  const penaltiesConfig = scoringConfigData.penalties;
  const tiersConfig = tiersData.tiers as Record<string, any>;
  const activeTier = tiersConfig[targetTier] || tiersConfig['top_product'];

  const explicitRequiredYears = input.seniorityMatchResult !== undefined
    ? input.seniorityMatchResult.requiredYears
    : (input.requiredYears !== undefined ? input.requiredYears : 0);

  const isMandatoryGateActive = input.seniorityMatchResult !== undefined
    ? input.seniorityMatchResult.isMandatoryGateActive
    : explicitRequiredYears > 0;

  const effectiveProfessionalYears = input.seniorityMatchResult
    ? input.seniorityMatchResult.tenureBreakdown.totalProfessionalYears
    : candidateYears;
  const effectiveDemonstratedYears = input.seniorityMatchResult
    ? input.seniorityMatchResult.demonstratedYears
    : candidateYears;
  const isFresher = effectiveProfessionalYears <= 1;

  // Phase 10.4 Seniority Gate Invariant:
  // Redistribute seniorityFit whenever the mandatory gate is inactive OR required experience is explicitly 0 YOE,
  // regardless of candidateYears (so experienced candidates do not receive 10 free seniority points on 0-YOE JDs).
  const shouldRedistributeSeniority = input.seniorityMatchResult !== undefined
    ? input.seniorityMatchResult.shouldRedistributeWeight
    : (!isMandatoryGateActive || explicitRequiredYears === 0);

  const activeWeights = shouldRedistributeSeniority
    ? {
        ...weights,
        seniorityFit: 0,
        projectsAndOss: weights.projectsAndOss + 5,
        evidenceDepth: weights.evidenceDepth + 5,
      }
    : weights;

  // 1. Must-Have Coverage (Evidence-Tiered Credit, Stage 2B)
  const mustSkills = skillResults.filter(s => s.required === 'must');
  const mustTotalCount = mustSkills.length;

  const isNonVerifiedMatchStatus = (status?: string) =>
    status === 'PARTIALLY_SATISFIED' ||
    status === 'RELATED_BUT_NOT_EQUIVALENT' ||
    status === 'CONTRADICTED' ||
    status === 'AMBIGUOUS' ||
    status === 'NOT_DEMONSTRATED';

  let earnedCreditSum = 0;
  for (const s of mustSkills) {
    const matchStatus = s.matchResult?.status;
    if (matchStatus === 'CONTRADICTED' || matchStatus === 'AMBIGUOUS') {
      continue;
    }
    if (s.status === 'verified' && !isNonVerifiedMatchStatus(matchStatus)) {
      earnedCreditSum += 1.0; // Evidenced in bullets = 1.0
    } else if (s.status === 'weak' || matchStatus === 'PARTIALLY_SATISFIED') {
      earnedCreditSum += 0.5; // Listed only / partial = 0.5 (F6 bare mention cap)
    } else if ((s as any).evidenceTier === 'implied_strong') {
      earnedCreditSum += 0.5;
    }
  }

  const mustMetCount = mustSkills.filter(s => {
    const matchStatus = s.matchResult?.status;
    if (isNonVerifiedMatchStatus(matchStatus)) return false;
    if (matchStatus === 'SATISFIED') {
      return s.status === 'verified' && Array.isArray(s.evidence) && s.evidence.length > 0;
    }
    return s.status === 'verified';
  }).length;
  const mustPartialCount = mustSkills.filter(s => {
    const matchStatus = s.matchResult?.status;
    if (
      matchStatus === 'CONTRADICTED' ||
      matchStatus === 'AMBIGUOUS' ||
      matchStatus === 'RELATED_BUT_NOT_EQUIVALENT'
    ) {
      return false;
    }
    return s.status === 'weak' || matchStatus === 'PARTIALLY_SATISFIED';
  }).length;
  const mustMetRatio = mustTotalCount > 0 ? mustMetCount / mustTotalCount : 1.0;
  const mustScoreFactor = mustTotalCount > 0 ? earnedCreditSum / mustTotalCount : 1.0;
  const mustHaveCoverage = Math.round(mustScoreFactor * activeWeights.mustHaveCoverage * 10) / 10;

  // 2. Evidence Depth (Weight 20 or 25 for fresher) — Strictly Monotonic
  // Deduplicate by effective supporting competency so overlapping Must + Preferred OR-groups
  // satisfied by the same underlying skill (e.g. Docker only) never double-count evidenceDepth.
  const totalFoundSkills = skillResults.filter(s => s.found);
  const dedupedSkillMap = new Map<string, SkillResult>();
  for (const s of skillResults) {
    if (!s.found && s.status === 'missing') continue;
    const effectiveKey = s.satisfiedBySkillId || s.skillId;
    const existing = dedupedSkillMap.get(effectiveKey);
    if (!existing) {
      dedupedSkillMap.set(effectiveKey, s);
    } else {
      const existingRank = existing.status === 'verified' ? 2 : existing.status === 'weak' ? 1 : 0;
      const nextRank = s.status === 'verified' ? 2 : s.status === 'weak' ? 1 : 0;
      if (
        nextRank > existingRank ||
        (nextRank === existingRank && (s.evidenceScore || 0) > (existing.evidenceScore || 0))
      ) {
        dedupedSkillMap.set(effectiveKey, s);
      }
    }
  }
  const dedupedFoundSkills = Array.from(dedupedSkillMap.values());
  const verifiedFoundSkills = dedupedFoundSkills.filter(s => s.status === 'verified');
  const weakFoundSkills = dedupedFoundSkills.filter(s => s.status === 'weak');
  const totalEvidenceTierSum = dedupedFoundSkills.reduce((acc, s) => acc + (s.evidenceScore || (s.status === 'verified' ? 0.85 : s.status === 'weak' ? 0.4 : 0)), 0); // spec-exempt: legacy scorer awaiting Stage 3
 
  // Strictly monotonic: adding any demonstrated skill or weak skill adds positive contribution, never reduces
  const baseTarget = Math.max(1, mustTotalCount * 0.85); // spec-exempt: legacy scorer awaiting Stage 3
  const evidenceDepthFactor = Math.min(
    1.0,
    (verifiedFoundSkills.length * 1.0 + weakFoundSkills.length * 0.25 + totalEvidenceTierSum * 0.1) / (baseTarget + 0.5) // spec-exempt: legacy scorer awaiting Stage 3
  );
  const evidenceDepth = Math.round(evidenceDepthFactor * activeWeights.evidenceDepth * 10) / 10;

  // 3. Impact Metrics (Weight 15 — Phase 09 Evidence-Quality Intelligence)
  const impactInputs: ImpactBulletInput[] = [
    ...experience.flatMap((e) =>
      e.bullets.map((b) => {
        const isIntern = (e as any).employmentType === 'INTERNSHIP';
        return {
          rawText: b.rawText,
          metricEvidences: b.metricEvidences,
          sourceType: (isIntern ? 'INTERNSHIP' : 'PROFESSIONAL_EXPERIENCE') as import('./evidenceModel').EvidenceSource,
          environmentMaturity: (isIntern ? 'DEVELOPMENT' : 'PRODUCTION') as import('./evidenceModel').EnvironmentMaturity,
          entryId: (e as any).id,
          sectionType: 'experience',
          hasStrongVerb: b.hasStrongVerb,
          isNegated: b.isNegated,
        };
      })
    ),
    ...projects.flatMap((p) =>
      p.bullets.map((b) => ({
        rawText: b.rawText,
        metricEvidences: b.metricEvidences,
        sourceType: 'PERSONAL_PROJECT' as import('./evidenceModel').EvidenceSource,
        environmentMaturity: ((p as any).environmentMaturity || 'PROTOTYPE') as import('./evidenceModel').EnvironmentMaturity,
        entryId: (p as any).id,
        sectionType: 'projects',
        hasStrongVerb: b.hasStrongVerb,
        isNegated: b.isNegated,
      }))
    ),
  ];

  const allBullets = [
    ...experience.flatMap(e => e.bullets),
    ...projects.flatMap(p => p.bullets),
  ];
  const impactEval = evaluateResumeImpact({
    bullets: impactInputs,
    jdText: input.jdText,
    jdRequiredTerms: skillResults.map((s) => s.canonical),
    impactWeight: activeWeights.impactMetrics,
    targetTier,
    isFresher,
  });
  const metricsRatio = impactEval.quantifiedBulletRatio;
  const targetMetricRatio = activeTier.minMetricBulletRatio || 0.5;
  const metricScoreFactor = impactEval.metricScoreFactor;
  const impactMetrics = impactEval.impactMetricsScore;

  // 4. Projects and OSS (Weight 10 or 15 for fresher)
  let projectScoreFactor = 0;
  if (projects.length >= 2) projectScoreFactor = 1.0;
  else if (projects.length === 1) projectScoreFactor = 0.7;
  else if (experience.length >= 2) projectScoreFactor = 0.9;
  else if (experience.length === 1) projectScoreFactor = 0.5;
  const projectsAndOss = Math.round(projectScoreFactor * activeWeights.projectsAndOss * 10) / 10;

  // 5. Seniority Fit
  let seniorityScoreFactor = 1.0;
  if (input.seniorityMatchResult) {
    if (!input.seniorityMatchResult.isMandatoryGateActive) {
      seniorityScoreFactor = 1.0;
    } else {
      seniorityScoreFactor = input.seniorityMatchResult.scoreFactor;
    }
  } else if (candidateYears < explicitRequiredYears) {
    const diff = explicitRequiredYears - candidateYears;
    seniorityScoreFactor = Math.max(0.1, 1.0 - (diff * 0.25));
  }
  const seniorityFitScore = Math.round(seniorityScoreFactor * activeWeights.seniorityFit * 10) / 10;

  // 6. Format and Parse Quality (Weight 10) — Structural parsing hygiene ONLY.
  // Explicit missing standard sections (-3) and missing contact channels (-5) are owned
  // exclusively by the penalties ledger to guarantee zero double deductions.
  const standardSections = isFresher ? ['education', 'skills', 'projects'] : ['experience', 'education', 'skills'];
  const presentSections = new Set(sections.map(s => s.type));
  const missingStandardSections = standardSections.filter(s => !presentSections.has(s));

  const educationSec = sections.find(s => s.type === 'education');
  const hasInlineEducationContent = !educationSec && sections.some(s => INLINE_EDUCATION_REGEX.test(s.content || ''));

  let formatScoreFactor = 1.0;
  const formatFlags: string[] = [];
  if (sections.length === 0 || (sections.length === 1 && sections[0].type === 'unknown')) {
    formatScoreFactor -= 0.5;
    formatFlags.push('UNSEGMENTED_DOCUMENT');
  } else if (sections.length === 1) {
    formatScoreFactor -= 0.2;
    formatFlags.push('SINGLE_SECTION_LAYOUT');
  }
  if (allBullets.length === 0) {
    formatScoreFactor -= 0.3;
    formatFlags.push('NO_EXTRACTABLE_BULLETS');
  }
  if (educationSec && educationSec.content.trim().length < 5) {
    formatScoreFactor -= 0.1;
    formatFlags.push('EMPTY_EDUCATION_SECTION');
  } else if (hasInlineEducationContent) {
    formatScoreFactor -= 0.1;
    formatFlags.push('INLINE_EDUCATION_NO_HEADER');
  }

  formatScoreFactor = Math.max(0, formatScoreFactor);
  const formatAndParse = Math.round(formatScoreFactor * activeWeights.formatAndParse * 10) / 10;

  // 7. Tier Fit (Weight 5)
  let tierScoreFactor = 0.5;
  if ((metricsRatio >= targetMetricRatio || metricScoreFactor >= 0.7) && mustMetRatio >= 0.8) tierScoreFactor = 1.0;
  else if (mustMetRatio >= 0.6) tierScoreFactor = 0.7;
  const tierFit = Math.round(tierScoreFactor * activeWeights.tierFit * 10) / 10;

  // Additional explainable metrics
  const niceSkills = skillResults.filter(s => s.required === 'nice');
  const niceMetCount = niceSkills.filter(s => s.found).length;
  const niceToHaveCoverage = niceSkills.length > 0 ? Math.round((niceMetCount / niceSkills.length) * 10 * 10) / 10 : 10;
  const titleAlignment = Math.min(10, Math.round(seniorityScoreFactor * 10 * 10) / 10);
  const educationAndCerts = Math.round(Math.min(5, ((educationSec || hasInlineEducationContent) ? 3 : 0) + (sections.some(s => s.type === 'certifications') ? 2 : 1)) * 10) / 10;
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

  const rawSubtotal = Math.round((mustHaveCoverage + evidenceDepth + impactMetrics + projectsAndOss + seniorityFitScore + formatAndParse + tierFit) * 10) / 10;

  // Penalties (Single-owner deduction accounting: each unique root cause appears once)
  const penalties: PenaltyItem[] = [];

  // Skills-evidence rule (Stage 2A & P0.4 Distinction: Skill absence vs deliberate stuffing):
  // A candidate who lists technical tools in the skills section that match coursework, foundational languages,
  // or tools should NOT be hit with extreme penalties unless there is an aggressive keyword misuse pattern
  // (e.g. over 70% unevidenced AND listed skills >= 18).
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
  // Per Section 5 of Phase 02: Do not automatically punish legitimate coursework or listed foundation skills.
  // Freshers commonly list introductory languages/tools learned in academics. Genuine keyword stuffing requires
  // deliberate padding (>75% unevidenced on >= 24 skills, or experienced candidates listing >70% unevidenced on >= 20 skills).
  const isStuffingFlagged = isFresher
    ? (listedOnlyCount / Math.max(1, listedSkillsCount) > 0.85) && listedSkillsCount >= 25
    : (listedOnlyCount / Math.max(1, listedSkillsCount) > 0.70) && listedSkillsCount >= 20;

  if (isStuffingFlagged) {
    const penaltyPoints = Math.min(10, Math.max(4, Math.round(listedOnlyCount * 0.4)));
    penalties.push({
      id: 'keyword_stuffing',
      label: 'Keyword Stuffing Detected',
      points: -penaltyPoints,
      reason: `${listedOnlyCount} of ${listedSkillsCount} skills listed in skills section lack any project or experience evidence.`,
      owner: 'penalties',
      cause: 'keyword_stuffing',
    });
  }

  // Missing contact info (owned solely by penalties ledger; 4.0.0-ats7d frozen golden contract)
  if (!contactInfo.email || !contactInfo.phone) {
    penalties.push({
      id: 'no_contact_info',
      label: !contactInfo.email && !contactInfo.phone
        ? 'Missing Critical Contact Information'
        : !contactInfo.email
          ? 'Missing Email Contact Channel'
          : 'Missing Phone Contact Channel',
      points: penaltiesConfig.noContactInfo,
      reason: 'Resume is missing direct recruiter contact channels (email or phone).',
      owner: 'penalties',
      cause: 'missing_contact_channels',
    });
  }

  // Missing standard sections (owned solely by penalties ledger; skipped if inline education content exists)
  for (const missingSec of missingStandardSections) {
    if (missingSec === 'education' && hasInlineEducationContent) {
      continue;
    }
    penalties.push({
      id: `missing_${missingSec}`,
      label: `Missing Dedicated ${missingSec.toUpperCase()} Section`,
      points: penaltiesConfig.missingStandardSection,
      reason: `ATS parser expects a dedicated header for ${missingSec}.`,
      owner: 'penalties',
      cause: `missing_${missingSec}_section`,
    });
  }

  // Word count outlier (owned solely by penalties ledger; 140 fresher / 250 experienced preserves 4.0.0-ats7d Frozen Benchmarks)
  const minWords = isFresher ? 140 : 250;
  if (wordCount < minWords || wordCount > 1200) {
    penalties.push({
      id: 'word_count_outlier',
      label: wordCount < minWords ? 'Resume Abnormally Brief' : 'Resume Overly Verbose',
      points: penaltiesConfig.wordCountOutlier,
      reason: `Resume has ${wordCount} words (ideal technical resumes range between ${minWords} and 1,200 words).`,
      owner: 'penalties',
      cause: 'word_count_outlier',
    });
  }

  // Deduplicate penalties by both id and cause to guarantee single-accounting
  const appliedPenalties: PenaltyItem[] = [];
  const seenPenaltyIds = new Set<string>();
  const seenCauses = new Set<string>();

  for (const p of penalties) {
    const causeKey = p.cause || p.id;
    if (!seenPenaltyIds.has(p.id) && !seenCauses.has(causeKey)) {
      seenPenaltyIds.add(p.id);
      seenCauses.add(causeKey);
      appliedPenalties.push(p);
    }
  }

  // Calculate total penalty deduction (points are negative numbers) and optional bonuses
  const appliedBonuses: Array<{ id: string; label: string; points: number; reason: string; cause?: string }> = [];
  const seenBonusIds = new Set<string>();
  for (const b of input.bonuses || []) {
    if (b.points > 0 && !seenBonusIds.has(b.id)) {
      seenBonusIds.add(b.id);
      appliedBonuses.push(b);
    }
  }
  const totalDeductions = Math.round(appliedPenalties.reduce((sum, p) => sum + Math.abs(p.points), 0) * 10) / 10;
  const totalBonuses = Math.round(appliedBonuses.reduce((sum, b) => sum + Math.max(0, b.points), 0) * 10) / 10;
  const preClampScore = Math.round((rawSubtotal + totalBonuses - totalDeductions) * 10) / 10;

  // P0.4: Integrate penalties into authoritative scoring pipeline:
  // Final Score = Clamp(Round(RawSubtotal + Bonuses - Deductions), 0, 100)
  let finalScore = Math.max(0, Math.min(100, Math.round(preClampScore)));
  let zeroMatchOverride = false;

  // Zero-bullet / Zero-match invariant: Formatting & default seniority cannot float an unevidenced non-matching candidate above 0
  if (mustSkills.length > 0 && mustMetCount === 0 && allBullets.length === 0 && totalFoundSkills.length === 0) {
    finalScore = 0;
    zeroMatchOverride = true;
  }
  const wasClamped = zeroMatchOverride || Math.round(preClampScore) !== finalScore;

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

  // Fix First items (qualitative priority when not backed by simulateFix delta)
  const fixFirst: FixFirstItem[] = [];
  const missingMust = skillResults.filter(s => s.required === 'must' && s.status === 'missing');
  for (const m of missingMust.slice(0, 2)) {
    fixFirst.push({
      title: `Add Verifiable Evidence for ${m.canonical}`,
      reason: `Missing mandatory requirement: ${m.canonical}. Add a concrete project or work experience bullet if you have used it.`,
      expectedScoreGain: 0,
      type: 'missing_must_have',
      skillId: m.skillId,
    });
  }

  const weakBullets = allBullets.filter(b => b.rawText && b.rawText.trim().length > 15 && b.score < 60);
  if (weakBullets.length > 0 && fixFirst.length < 3) {
    fixFirst.push({
      title: 'Strengthen Impact & Action Verbs in Bullets',
      reason: `${weakBullets.length} bullet point(s) lack measurable outcomes or strong action verbs.`,
      expectedScoreGain: 0,
      type: 'weak_bullet',
    });
  }

  const stuffedSkills = skillResults.filter(s => s.status === 'weak');
  if (stuffedSkills.length >= 3 && fixFirst.length < 3) {
    fixFirst.push({
      title: 'Back Up Listed Skills with Experience',
      reason: `${stuffedSkills.length} skills listed in skills section have zero project or experience bullets.`,
      expectedScoreGain: 0,
      type: 'keyword_stuffed',
    });
  }

  // Headline & Summary single source of truth (never claim 100% match when 0 requirements extracted)
  const mustHavesMetStr = `${mustMetCount}/${mustTotalCount}`;
  let headline = '';
  if (mustTotalCount === 0) {
    headline = `No Mandatory Requirements Extracted (0/0) · Add a full JD or confirm requirements`;
  } else if (mustMetCount === mustTotalCount) {
    headline = `Meets 100% of Must-Have Requirements (${mustHavesMetStr}) · Verified ATS Compatibility`;
  } else if (mustMetRatio >= 0.75) { // spec-exempt: legacy scorer awaiting Stage 3
    headline = `Strong Core Match (${mustHavesMetStr} must-haves met) · Minor evidence gaps detected`;
  } else if (mustMetRatio >= 0.5) {
    headline = `Moderate Alignment (${mustHavesMetStr} must-haves met) · Key requirements missing`;
  } else {
    headline = `High Risk ATS Profile (${mustHavesMetStr} must-haves met) · Missing core job requirements`;
  }

  const isEligible = input.seniorityMatchResult
    ? input.seniorityMatchResult.isEligible
    : candidateYears >= explicitRequiredYears;
  const shortfallMonths = input.seniorityMatchResult
    ? input.seniorityMatchResult.shortfallMonths
    : Math.max(0, Math.round((explicitRequiredYears - candidateYears) * 12));

  const eligibility = {
    isEligible,
    shortfallMonths,
    requiredYears: explicitRequiredYears,
    demonstratedYears: effectiveDemonstratedYears,
    scope: input.seniorityMatchResult ? input.seniorityMatchResult.scope : 'PROFESSIONAL',
    isMandatoryGateActive,
    provenance: input.seniorityMatchResult ? input.seniorityMatchResult.provenance : (explicitRequiredYears > 0 ? 'EXPLICIT_EMPLOYER' : 'NONE'),
    reachesRequirementOnlyViaActiveMonth: input.seniorityMatchResult ? input.seniorityMatchResult.reachesRequirementOnlyViaActiveMonth : false,
  };

  // Authoritative 7-Dimension ScoreTrace (Single Source of Truth — zero divergent scorer)
  const pillars: PillarTraceItem[] = [
    {
      id: 'mustHaveCoverage',
      label: 'Must-Have Skill Coverage',
      applicable: activeWeights.mustHaveCoverage > 0,
      rawInputs: { mustTotalCount, mustMetCount, mustPartialCount, earnedCreditSum },
      rawScore: Math.round(mustScoreFactor * 1000) / 10,
      nominalWeight: weights.mustHaveCoverage,
      effectiveWeight: activeWeights.mustHaveCoverage / 100,
      contribution: mustHaveCoverage,
      subScores: [],
      flags: [],
    },
    {
      id: 'evidenceDepth',
      label: 'Evidence & Implementation Depth',
      applicable: activeWeights.evidenceDepth > 0,
      rawInputs: { verifiedCount: verifiedFoundSkills.length, weakCount: weakFoundSkills.length },
      rawScore: Math.round(evidenceDepthFactor * 1000) / 10,
      nominalWeight: weights.evidenceDepth,
      effectiveWeight: activeWeights.evidenceDepth / 100,
      contribution: evidenceDepth,
      subScores: [],
      flags: [],
    },
    {
      id: 'impactMetrics',
      label: 'Impact & Quantified Numerical Metrics',
      applicable: activeWeights.impactMetrics > 0,
      rawInputs: {
        totalMetricsExtracted: impactEval.totalMetricsExtracted,
        creditedMetricsCount: impactEval.creditedMetricsCount,
        excludedMetricsCount: impactEval.excludedMetricsCount,
        totalBullets: allBullets.length,
        metricsRatio: Math.round(metricsRatio * 100) / 100,
      },
      rawScore: Math.round(metricScoreFactor * 1000) / 10,
      nominalWeight: weights.impactMetrics,
      effectiveWeight: activeWeights.impactMetrics / 100,
      contribution: impactMetrics,
      subScores: [],
      flags: impactEval.flags,
    },
    {
      id: 'projectsAndOss',
      label: 'Project Relevance & Open-Source Signals',
      applicable: activeWeights.projectsAndOss > 0,
      rawInputs: { projectsCount: projects.length, experienceCount: experience.length },
      rawScore: Math.round(projectScoreFactor * 1000) / 10,
      nominalWeight: weights.projectsAndOss,
      effectiveWeight: activeWeights.projectsAndOss / 100,
      contribution: projectsAndOss,
      subScores: [],
      flags: [],
    },
    {
      id: 'seniorityFit',
      label: 'Seniority Alignment & Experience Fit',
      applicable: activeWeights.seniorityFit > 0,
      notApplicableReason: activeWeights.seniorityFit === 0
        ? (input.seniorityMatchResult && input.seniorityMatchResult.requiredMonths === 0 && input.seniorityMatchResult.status === 'MEETS_REQUIREMENT'
            ? 'Entry-level / 0 YOE requirement; seniority weight redistributed to evidenceDepth and projectsAndOss.'
            : 'Mandatory seniority gate inactive; weight redistributed to evidenceDepth and projectsAndOss.')
        : undefined,
      rawInputs: {
        candidateYears: effectiveProfessionalYears,
        demonstratedYears: effectiveDemonstratedYears,
        requiredYears: explicitRequiredYears,
        requiredMonths: input.seniorityMatchResult?.requiredMonths ?? Math.round(explicitRequiredYears * 12),
        demonstratedMonths: input.seniorityMatchResult?.demonstratedMonths ?? Math.round(candidateYears * 12),
        completedMonths: input.seniorityMatchResult?.completedMonths ?? Math.round(candidateYears * 12),
        seniorityScoreFactor,
      },
      rawScore: Math.round(seniorityScoreFactor * 1000) / 10,
      nominalWeight: weights.seniorityFit,
      effectiveWeight: activeWeights.seniorityFit / 100,
      contribution: seniorityFitScore,
      subScores: [],
      flags: input.seniorityMatchResult && !input.seniorityMatchResult.isEligible ? ['SENIORITY_SHORTFALL'] : [],
    },
    {
      id: 'formatAndParse',
      label: 'Format, Layout & Parsing Safety',
      applicable: activeWeights.formatAndParse > 0,
      rawInputs: { sectionsCount: sections.length, bulletsCount: allBullets.length, hasInlineEducationContent },
      rawScore: Math.round(formatScoreFactor * 1000) / 10,
      nominalWeight: weights.formatAndParse,
      effectiveWeight: activeWeights.formatAndParse / 100,
      contribution: formatAndParse,
      subScores: [],
      flags: formatFlags,
    },
    {
      id: 'tierFit',
      label: 'Target Company Tier Alignment',
      applicable: activeWeights.tierFit > 0,
      rawInputs: { tier: targetTier, mustMetRatio: Math.round(mustMetRatio * 100) / 100 },
      rawScore: Math.round(tierScoreFactor * 1000) / 10,
      nominalWeight: weights.tierFit,
      effectiveWeight: activeWeights.tierFit / 100,
      contribution: tierFit,
      subScores: [],
      flags: [],
    },
  ];

  const adjustments: ScoreAdjustment[] = [
    ...appliedBonuses.map((b) => ({
      id: b.id,
      label: b.label,
      delta: Math.abs(b.points),
      rationale: b.reason,
      owner: 'bonuses',
      cause: b.cause || b.id,
    })),
    ...appliedPenalties.map((p) => ({
      id: p.id,
      label: p.label,
      delta: p.points,
      rationale: p.reason,
      owner: p.owner || 'penalties',
      cause: p.cause || p.id,
    })),
  ];

  const bandSpread = parseQuality === 'Poor' ? 8 : parseQuality === 'Medium' ? 4 : 2;
  const trace: ScoreTrace = {
    tool: 'roaster',
    specVersion: ATS_SEVEN_DIMENSION_SPEC_VERSION,
    engineVersion: ATS_ENGINE_VERSION,
    specFingerprint: ATS_SEVEN_DIMENSION_FINGERPRINT,
    context: {
      experienceLevel: isFresher ? '0-2 yrs' : '2+ yrs',
      roleFamily: 'General',
      jdPresent: true,
      confirmedRequirements: skillResults.map((s) => ({
        id: s.skillId,
        text: s.canonical,
        category: s.required === 'must' ? 'must' : 'preferred',
        confidence: 1.0,
        inTaxonomy: true,
      })),
      jdLevel: explicitRequiredYears >= 5 ? 'senior' : explicitRequiredYears >= 2 ? 'mid' : explicitRequiredYears > 0 ? 'entry' : 'unknown',
      resumeSectionsFound: sections.map((s) => s.type),
      candidateYearsExperience: effectiveProfessionalYears,
      requiredYearsExperience: explicitRequiredYears,
    },
    profileId: isFresher ? 'fresher' : 'experienced',
    pillars,
    adjustments,
    rawSubtotal,
    totalBonuses,
    totalDeductions,
    preClampScore,
    wasClamped,
    composite: finalScore,
    compositeDisplay: finalScore,
    band: {
      low: Math.max(0, finalScore - bandSpread),
      high: Math.min(100, finalScore + bandSpread),
      width: Math.min(100, finalScore + bandSpread) - Math.max(0, finalScore - bandSpread),
      label: confidence === 'High' ? 'Stable' : confidence === 'Medium' ? 'Moderate' : 'Sensitive',
    },
    confidence: confidence === 'High' ? 0.9 : confidence === 'Medium' ? 0.72 : 0.45,
    warnings: zeroMatchOverride ? ['Zero-match override triggered: 0 evidenced skills and 0 bullets.'] : [],
    advisories: confidenceReason ? [confidenceReason] : [],
  };

  return {
    score: finalScore,
    rawSubtotal,
    totalBonuses,
    totalDeductions,
    preClampScore,
    wasClamped,
    band,
    confidence,
    confidenceReason,
    headline,
    subscores,
    activeWeights,
    eligibility,
    penalties: appliedPenalties,
    trace,
    mustHavesMet: mustHavesMetStr,
    mustHavesMetRatio: mustMetRatio,
    missingKeywordsCount: skillResults.filter(s => s.status === 'missing').length,
    parseQuality,
    fixFirst,
    metricsRatio,
    weakBulletsCount: weakBullets.length,
    stuffedSkills,
    missingStandardSections,
    metricEvidences: impactEval.evaluatedMetrics,
    impactTrace: impactEval.impactTrace,
  };
}
