// ============================================================
// HireFlow Scoring Suite — Pure Pillar Calculators
// computeId-registered pure functions adhering to single-counting rules
// ============================================================

import { ScoringSpec, PillarId, RoleFamily } from '../../spec/types';
import { ConfirmedRequirement, SubScoreTraceItem, ScoringContext } from '../types';
import { evaluateEvidenceCredit, MentionContext } from '../evidenceCredit';
import { scoreBullets, scoreBullet } from '../bulletScorer';
import { matchTokenInText } from '../tokenizer';

export interface PillarCalculatorResult {
  rawScore: number;                                     // 0-100
  subScores: SubScoreTraceItem[];
  rawInputs: Record<string, number | string | boolean>; // No resume text
  flags: string[];
}

export type PillarCalculatorFn = (
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
) => PillarCalculatorResult;

export interface ResumeScoringInput {
  rawText: string;
  sectionsFound: string[];
  experienceBullets: string[];
  projectBullets: string[];
  skillsBlockText: string;
  hasGithubOrDemoLink: boolean;
  hasPhoto: boolean;
  hasDeclaration: boolean;
  hasFatherNameOrFullAddress: boolean;
  detectedWordCount: number;
}

function getSubFeatureWeight(spec: ScoringSpec, pillarId: string, subFeatureId: string, fallback: number): number {
  const p = spec.pillars.find((pil) => pil.id === pillarId);
  const sf = p?.subFeatures.find((f) => f.id === subFeatureId);
  return sf?.nominalWeight ?? fallback;
}

// ------------------------------------------------------------
// Pillar 1: Requirement Coverage (compute_requirement_coverage)
// ------------------------------------------------------------
export function computeRequirementCoverage(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
): PillarCalculatorResult {
  const reqs = context.confirmedRequirements;
  const flags: string[] = [];
  const mustHaveWeight = getSubFeatureWeight(spec, 'requirement_coverage', 'sub_must_have_skills', 75);
  const preferredWeight = getSubFeatureWeight(spec, 'requirement_coverage', 'sub_preferred_skills', 25);

  if (reqs.length === 0) {
    return {
      rawScore: 0,
      subScores: [
        { id: 'sub_must_have_skills', label: 'Mandatory / Must-Have Requirements', score: 0, weight: mustHaveWeight, contribution: 0 },
        { id: 'sub_preferred_skills', label: 'Preferred / Nice-to-Have Skills', score: 0, weight: preferredWeight, contribution: 0 },
      ],
      rawInputs: { confirmedReqCount: 0, matchedReqCount: 0 },
      flags: ['No confirmed job requirements provided.'],
    };
  }

  // Map each candidate mention context
  const candidateMentions = new Map<string, MentionContext>();
  const allBullets = [...resumeData.experienceBullets, ...resumeData.projectBullets];

  for (const req of reqs) {
    const term = req.text.toLowerCase();

    // Check experience bullets
    let bestContext: MentionContext = 'none';
    for (const b of resumeData.experienceBullets) {
      if (matchTokenInText(req.text, b).found) {
        bestContext = 'experience';
        break;
      }
    }

    if (bestContext === 'none') {
      for (const b of resumeData.projectBullets) {
        if (matchTokenInText(req.text, b).found) {
          bestContext = resumeData.hasGithubOrDemoLink ? 'projectWithLink' : 'academicProject';
          break;
        }
      }
    }

    if (bestContext === 'none' && resumeData.skillsBlockText) {
      if (matchTokenInText(req.text, resumeData.skillsBlockText, true).found) {
        bestContext = 'skillsBlockOnly';
      }
    }

    if (bestContext === 'none') {
      // General full text fallback if not in detected sections
      if (matchTokenInText(req.text, resumeData.rawText).found) {
        bestContext = 'skillsBlockOnly';
      }
    }

    candidateMentions.set(term, bestContext);
  }

  // Weight by priority class: mandatory (3), preferred (1.5), mentioned (1)
  const reqListForEval = reqs.map((r) => {
    let pWeight = spec.evidenceTables.priorityWeights.mentioned;
    if (r.category === 'must') pWeight = spec.evidenceTables.priorityWeights.mandatory;
    else if (r.category === 'preferred') pWeight = spec.evidenceTables.priorityWeights.preferred;
    return {
      id: r.id,
      name: r.text,
      priorityWeight: pWeight,
    };
  });

  const { assessments, weightedCoverageScore } = evaluateEvidenceCredit(
    reqListForEval,
    candidateMentions,
    spec
  );

  // Separate subScores for must vs preferred
  let mustSum = 0;
  let mustCount = 0;
  let prefSum = 0;
  let prefCount = 0;

  for (const r of reqs) {
    const assessment = assessments.get(r.text.toLowerCase());
    const credit = assessment ? assessment.effectiveCredit * 100 : 0;
    if (r.category === 'must') {
      mustSum += credit;
      mustCount++;
    } else {
      prefSum += credit;
      prefCount++;
    }
  }

  const mustScore = mustCount > 0 ? mustSum / mustCount : weightedCoverageScore;
  const prefScore = prefCount > 0 ? prefSum / prefCount : weightedCoverageScore;

  const subScores: SubScoreTraceItem[] = [
    {
      id: 'sub_must_have_skills',
      label: 'Mandatory / Must-Have Requirements',
      score: Math.round(mustScore),
      weight: mustHaveWeight,
      contribution: (mustScore * mustHaveWeight) / 100,
    },
    {
      id: 'sub_preferred_skills',
      label: 'Preferred / Nice-to-Have Skills',
      score: Math.round(prefScore),
      weight: preferredWeight,
      contribution: (prefScore * preferredWeight) / 100,
    },
  ];

  let demonstratedCount = 0;
  let impliedCount = 0;
  for (const a of assessments.values()) {
    if (a.effectiveCredit > 0) demonstratedCount++;
    if (a.isImpliedOnly) impliedCount++;
  }

  if (impliedCount > 0) {
    flags.push(`${impliedCount} skill(s) satisfied via verified strong ecosystem implication.`);
  }

  return {
    rawScore: Math.round(weightedCoverageScore),
    subScores,
    rawInputs: {
      totalRequirements: reqs.length,
      demonstratedRequirements: demonstratedCount,
      impliedRequirements: impliedCount,
    },
    flags,
  };
}

// ------------------------------------------------------------
// Pillar 2: Evidence Quality (compute_evidence_quality)
// ------------------------------------------------------------
export function computeEvidenceQuality(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
): PillarCalculatorResult {
  const allBullets = [...resumeData.experienceBullets, ...resumeData.projectBullets];
  const knownTech = context.confirmedRequirements.map((r) => r.text);

  const {
    breakdowns,
    meanBulletScore,
    keywordDumpCount,
    implausibleCount,
    totalUniqueCount,
    deduplicatedCount,
  } = scoreBullets(allBullets, spec, knownTech);

  const flags: string[] = [];
  if (keywordDumpCount > 0) {
    flags.push(`Keyword dump detected in ${keywordDumpCount} bullet(s) (zero action/outcome context).`);
  }
  if (implausibleCount > 0) {
    flags.push(`Self-reported claim flagged for review: ${implausibleCount} metric(s) appear statistically anomalous.`);
  }
  if (deduplicatedCount > 0) {
    flags.push(`${deduplicatedCount} duplicate bullet(s) removed prior to scoring.`);
  }

  // SubScore averages across unique bullets
  let totalVerb = 0;
  let totalMetric = 0;
  let totalTech = 0;
  let totalOutcome = 0;

  for (const b of breakdowns) {
    totalVerb += b.actionVerbScore;
    totalMetric += b.measuredResultScore;
    totalTech += b.techInContextScore;
    totalOutcome += b.outcomeImpactScore;
  }

  const n = breakdowns.length || 1;
  const avgVerb = breakdowns.length > 0 ? (totalVerb / n / spec.evidenceTables.bulletScoring.actionVerbMax) * 100 : 0;
  const avgMetric = breakdowns.length > 0 ? (totalMetric / n / spec.evidenceTables.bulletScoring.measuredResultMax) * 100 : 0;
  const avgTech = breakdowns.length > 0 ? (totalTech / n / spec.evidenceTables.bulletScoring.techInContextMax) * 100 : 0;
  const avgOutcome = breakdowns.length > 0 ? (totalOutcome / n / spec.evidenceTables.bulletScoring.outcomeImpactMax) * 100 : 0;

  const verbWeight = getSubFeatureWeight(spec, 'evidence_quality', 'sub_action_verbs', 20);
  const metricWeight = getSubFeatureWeight(spec, 'evidence_quality', 'sub_measured_results', 30);
  const techWeight = getSubFeatureWeight(spec, 'evidence_quality', 'sub_tech_in_context', 25);
  const outcomeWeight = getSubFeatureWeight(spec, 'evidence_quality', 'sub_outcome_impact', 25);

  const subScores: SubScoreTraceItem[] = [
    { id: 'sub_action_verbs', label: 'Decisive Action Verbs', score: Math.round(avgVerb), weight: verbWeight, contribution: (avgVerb * verbWeight) / 100 },
    { id: 'sub_measured_results', label: 'Measured Outcomes & Metrics', score: Math.round(avgMetric), weight: metricWeight, contribution: (avgMetric * metricWeight) / 100 },
    { id: 'sub_tech_in_context', label: 'Technology in Context', score: Math.round(avgTech), weight: techWeight, contribution: (avgTech * techWeight) / 100 },
    { id: 'sub_outcome_impact', label: 'Business & System Impact', score: Math.round(avgOutcome), weight: outcomeWeight, contribution: (avgOutcome * outcomeWeight) / 100 },
  ];

  return {
    rawScore: Math.round(meanBulletScore),
    subScores,
    rawInputs: {
      uniqueBulletCount: totalUniqueCount,
      deduplicatedBulletCount: deduplicatedCount,
      keywordDumpBulletCount: keywordDumpCount,
      anomalousMetricsCount: implausibleCount,
    },
    flags,
  };
}

// ------------------------------------------------------------
// Pillar 3: Project and Practical Readiness (compute_project_readiness)
// ------------------------------------------------------------
export function computeProjectReadiness(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
): PillarCalculatorResult {
  const roleLib = spec.roleSignalLibraries[context.roleFamily] || spec.roleSignalLibraries.General;
  const textLower = resumeData.rawText.toLowerCase();
  const flags: string[] = [];

  // 1. Architecture depth signals
  let archMatches = 0;
  for (const kw of roleLib.architectureKeywords) {
    if (textLower.includes(kw.toLowerCase())) archMatches++;
  }
  const archScore = Math.min(100, (archMatches / 3) * 100);

  // 2. Production rigor & testing
  let prodMatches = 0;
  for (const pat of roleLib.productionPatterns) {
    if (textLower.includes(pat.toLowerCase())) prodMatches++;
  }
  const prodScore = Math.min(100, (prodMatches / 3) * 100);

  // 3. Quantified metrics for role
  let metricMatches = 0;
  for (const m of roleLib.outcomeMetrics) {
    if (textLower.includes(m.toLowerCase())) metricMatches++;
  }
  const metricScore = Math.min(100, (metricMatches / 2) * 100);

  // 4. Practical artifacts: GitHub / live demo link text present
  const artifactScore = resumeData.hasGithubOrDemoLink ? 100 : (resumeData.projectBullets.length > 0 ? 50 : 15);

  const archWeight = getSubFeatureWeight(spec, 'project_readiness', 'sub_architecture_depth', 35);
  const prodWeight = getSubFeatureWeight(spec, 'project_readiness', 'sub_production_rigor', 30);
  const metricWeight = getSubFeatureWeight(spec, 'project_readiness', 'sub_quantified_engineering_metrics', 20);
  const artifactWeight = getSubFeatureWeight(spec, 'project_readiness', 'sub_practical_artifacts', 15);

  const subScores: SubScoreTraceItem[] = [
    { id: 'sub_architecture_depth', label: 'Architecture & Systems Depth', score: Math.round(archScore), weight: archWeight, contribution: (archScore * archWeight) / 100 },
    { id: 'sub_production_rigor', label: 'Production Rigor & Testing', score: Math.round(prodScore), weight: prodWeight, contribution: (prodScore * prodWeight) / 100 },
    { id: 'sub_quantified_engineering_metrics', label: 'Quantified Engineering Metrics', score: Math.round(metricScore), weight: metricWeight, contribution: (metricScore * metricWeight) / 100 },
    { id: 'sub_practical_artifacts', label: 'Verified Practical Artifacts', score: Math.round(artifactScore), weight: artifactWeight, contribution: (artifactScore * artifactWeight) / 100 },
  ];

  const rawScore = Math.round(
    (archScore * archWeight + prodScore * prodWeight + metricScore * metricWeight + artifactScore * artifactWeight) / 100
  );

  // Advisory for craftsmanship claims (non-scored per Rule 3.4)
  const craftMatches: string[] = [];
  for (const sig of roleLib.craftsmanshipSignals) {
    if (textLower.includes(sig.toLowerCase())) {
      craftMatches.push(sig);
    }
  }
  if (craftMatches.length > 0) {
    flags.push(`Craftsmanship claims declared in resume (not inspected): ${craftMatches.slice(0, 3).join(', ')}.`);
  }

  return {
    rawScore: Math.min(100, Math.max(0, rawScore)),
    subScores,
    rawInputs: {
      roleFamily: context.roleFamily,
      architectureMatches: archMatches,
      productionMatches: prodMatches,
      metricMatches,
      hasPracticalLink: resumeData.hasGithubOrDemoLink,
    },
    flags,
  };
}

// ------------------------------------------------------------
// Pillar 4: Parser-Friendliness (compute_parser_friendliness)
// ------------------------------------------------------------
export function computeParserFriendliness(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
): PillarCalculatorResult {
  const { deductions, advisories, baseScore } = spec.evidenceTables.parserFriendliness;
  let score = baseScore;
  const flags: string[] = [];

  // Missing sections
  const standardSections = ['experience', 'education', 'projects', 'skills'];
  const missingCount = standardSections.filter(
    (sec) => !resumeData.sectionsFound.map((s) => s.toLowerCase()).includes(sec)
  ).length;

  let sectionDeduction = 0;
  if (missingCount >= 2) {
    const d = deductions.find((item) => item.id === 'deduct_missing_sections');
    if (d) {
      sectionDeduction = d.deductionPoints;
      score -= sectionDeduction;
      flags.push(d.label);
    }
  }

  // Short document (<100 words)
  let shortDocDeduction = 0;
  if (resumeData.detectedWordCount < 100) {
    const d = deductions.find((item) => item.id === 'deduct_short_document');
    if (d) {
      shortDocDeduction = d.deductionPoints;
      score -= shortDocDeduction;
      flags.push(d.label);
    }
  }

  // Advisories (Indian regional standards)
  let advisoryDeductions = 0;
  if (resumeData.hasPhoto) {
    const adv = advisories.find((item) => item.id === 'adv_photo_included');
    if (adv) {
      advisoryDeductions += adv.deductionPoints;
      flags.push(`Advisory: ${adv.label}`);
    }
  }
  if (resumeData.hasDeclaration) {
    const adv = advisories.find((item) => item.id === 'adv_declaration_statement');
    if (adv) {
      advisoryDeductions += adv.deductionPoints;
      flags.push(`Advisory: ${adv.label}`);
    }
  }
  if (resumeData.hasFatherNameOrFullAddress) {
    const adv = advisories.find((item) => item.id === 'adv_personal_identifiers');
    if (adv) {
      advisoryDeductions += adv.deductionPoints;
      flags.push(`Advisory: ${adv.label}`);
    }
  }

  score -= advisoryDeductions;
  const clampedScore = Math.min(100, Math.max(0, score));

  const sectionWeight = getSubFeatureWeight(spec, 'parser_friendliness', 'sub_standard_section_structure', 50);
  const layoutWeight = getSubFeatureWeight(spec, 'parser_friendliness', 'sub_layout_cleanliness', 35);
  const regionalWeight = getSubFeatureWeight(spec, 'parser_friendliness', 'sub_regional_advisories', 15);

  const subScores: SubScoreTraceItem[] = [
    {
      id: 'sub_standard_section_structure',
      label: 'Standard Section Hierarchy',
      score: Math.max(0, 100 - sectionDeduction * 2),
      weight: sectionWeight,
      contribution: (Math.max(0, 100 - sectionDeduction * 2) * sectionWeight) / 100,
    },
    {
      id: 'sub_layout_cleanliness',
      label: 'Layout Cleanliness & Linear Flow',
      score: shortDocDeduction > 0 ? 50 : 100,
      weight: layoutWeight,
      contribution: ((shortDocDeduction > 0 ? 50 : 100) * layoutWeight) / 100,
    },
    {
      id: 'sub_regional_advisories',
      label: 'Regional Advisory Standards',
      score: Math.max(0, 100 - advisoryDeductions * 10),
      weight: regionalWeight,
      contribution: (Math.max(0, 100 - advisoryDeductions * 10) * regionalWeight) / 100,
    },
  ];

  return {
    rawScore: clampedScore,
    subScores,
    rawInputs: {
      sectionsDetectedCount: resumeData.sectionsFound.length,
      detectedWordCount: resumeData.detectedWordCount,
      hasRegionalAdvisories: advisoryDeductions > 0,
    },
    flags,
  };
}

// ------------------------------------------------------------
// Pillar 5: Experience Fit (compute_experience_fit)
// ------------------------------------------------------------
export function computeExperienceFit(
  context: ScoringContext,
  resumeData: ResumeScoringInput,
  spec: ScoringSpec
): PillarCalculatorResult {
  const { maxGapYearsTolerance, penaltySlopePerYear, minFloorScore, maxScore } =
    spec.experienceFitParameters;

  const candidateYrs = context.candidateYearsExperience ?? 0;
  const requiredYrs = context.requiredYearsExperience ?? 0;
  const gap = Math.max(0, requiredYrs - candidateYrs);

  let rawScore = maxScore;
  const flags: string[] = [];

  if (gap > maxGapYearsTolerance) {
    const penalty = gap * penaltySlopePerYear;
    rawScore = Math.max(minFloorScore, maxScore - penalty);
    flags.push(`Experience tenure gap of ${gap.toFixed(1)} yr(s) detected.`);
  }

  const subScores: SubScoreTraceItem[] = [
    {
      id: 'sub_tenure_alignment',
      label: 'Tenure & Seniority Alignment',
      score: Math.round(rawScore),
      weight: 100,
      contribution: rawScore,
    },
  ];

  return {
    rawScore: Math.round(rawScore),
    subScores,
    rawInputs: {
      candidateYears: candidateYrs,
      requiredYears: requiredYrs,
      yearsGap: gap,
    },
    flags,
  };
}

// ------------------------------------------------------------
// Calculator Registry
// ------------------------------------------------------------
export const PILLAR_CALCULATORS: Record<string, PillarCalculatorFn> = {
  compute_requirement_coverage: computeRequirementCoverage,
  compute_evidence_quality: computeEvidenceQuality,
  compute_project_readiness: computeProjectReadiness,
  compute_parser_friendliness: computeParserFriendliness,
  compute_experience_fit: computeExperienceFit,
};
