// ============================================================
// HireFlow — Actionability Plan & What-If Engine (Stage 5)
// Deterministic gap classification, closability categorization,
// what-if score delta simulation, and ranked roadmaps
// ============================================================

import {
  ActionableGap,
  ActionabilityPlanResult,
  ClosabilityPeriod,
  GapCategory,
} from './types';
import { CURRICULUM_DOMAINS } from './curriculumData';
import { SkillResult, PenaltyItem, FixFirstItem } from '../../features/ats/engine/types';

interface EngineInput {
  baseScore: number;
  skillResults: SkillResult[];
  penalties: PenaltyItem[];
  fixFirst: FixFirstItem[];
  candidateYears: number;
  requiredYears: number;
  targetTier?: string;
}

export function generateActionabilityPlan(input: EngineInput): ActionabilityPlanResult {
  const {
    baseScore,
    skillResults,
    penalties,
    fixFirst,
    candidateYears,
    requiredYears,
  } = input;

  const gaps: ActionableGap[] = [];

  // 1. Skill Gaps (Missing Must-Haves vs Evidence-Missing)
  for (const s of skillResults) {
    const skillName = s.canonical || s.skillId;
    if (s.status === 'missing' && s.required === 'must') {
      const matchedDomain = CURRICULUM_DOMAINS.find((d) =>
        d.id.toLowerCase() === skillName.toLowerCase() ||
        d.name.toLowerCase().includes(skillName.toLowerCase())
      );

      // Completely missing must-have: requires 30 days to build proof project or 90+ days for fundamentals
      const isFundamental = ['dsa', 'algorithms', 'system design', 'c++', 'java'].some((f) =>
        skillName.toLowerCase().includes(f)
      );
      const closability: ClosabilityPeriod = isFundamental ? '90+ days' : '30 days';

      const minGain = Math.round(Math.max(3, s.weight * 1.5));
      const maxGain = Math.round(minGain + 3);
      const projectedMin = Math.min(100, baseScore + minGain);
      const projectedMax = Math.min(100, baseScore + maxGain);

      gaps.push({
        id: `gap_missing_${skillName.toLowerCase().replace(/\s+/g, '_')}`,
        title: `Build Evidence for Missing Must-Have: ${skillName}`,
        category: 'skill-missing',
        closability,
        evidenceHeadline: `Resume currently shows zero verified mentions or project implementations of ${skillName}.`,
        suggestedAction: matchedDomain
          ? matchedDomain.deliverableToShip
          : `Ship an open-source project demonstrating production use of ${skillName} with automated tests and a live deployment.`,
        hypotheticalScoreGain: {
          min: minGain,
          max: maxGain,
          projectedRange: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
        },
        impactPerEffortScore: Math.round((maxGain / (closability === '90+ days' ? 4 : 2)) * 10),
        bulletTemplate: matchedDomain?.bulletTemplate || `Built {{feature/system}} with ${skillName}, achieving {{result you measured}} across {{scale}}.`,
        curriculumDomainId: matchedDomain?.id,
      });
    } else if (s.status === 'weak' && s.required === 'must') {
      // Listed only in skills section without project evidence: Closable in 7 days by documenting real project code!
      const minGain = 2;
      const maxGain = 5;
      const projectedMin = Math.min(100, baseScore + minGain);
      const projectedMax = Math.min(100, baseScore + maxGain);

      gaps.push({
        id: `gap_evidence_${skillName.toLowerCase().replace(/\s+/g, '_')}`,
        title: `Evidence ${skillName} with Project Bullets`,
        category: 'evidence-missing',
        closability: '7 days',
        evidenceHeadline: `${skillName} is claimed in your skills section but has 0 supporting mentions in your experience or project bullets.`,
        suggestedAction: `Update an existing project bullet to articulate exactly how you used ${skillName} to solve an engineering problem.`,
        hypotheticalScoreGain: {
          min: minGain,
          max: maxGain,
          projectedRange: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
        },
        impactPerEffortScore: 85, // Very high ROI for 7-day effort
        bulletTemplate: `Utilized ${skillName} to build {{specific component}}, improving {{measured metric}} by {{result you measured}}.`,
      });
    }
  }

  // 2. Format & Penalty Gaps (Closable in 7 days)
  for (const pen of penalties) {
    const penaltyAbs = Math.abs(pen.points);
    const minGain = Math.round(penaltyAbs * 0.8);
    const maxGain = penaltyAbs;
    const projectedMin = Math.min(100, baseScore + minGain);
    const projectedMax = Math.min(100, baseScore + maxGain);

    gaps.push({
      id: `gap_pen_${pen.id}`,
      title: `Resolve Format Issue: ${pen.label}`,
      category: 'format',
      closability: '7 days',
      evidenceHeadline: pen.reason,
      suggestedAction: `Correct document structure or contact channel in your markdown or PDF source to eliminate this automated deduction.`,
      hypotheticalScoreGain: {
        min: minGain,
        max: maxGain,
        projectedRange: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
      },
      impactPerEffortScore: 90, // Highest ROI: eliminating deductions
    });
  }

  // 3. Bullet Metric Quality Fixes (Closable in 7 days)
  const weakBulletFixes = fixFirst.filter((f) => f.type === 'weak_bullet');
  if (weakBulletFixes.length > 0) {
    const minGain = 2;
    const maxGain = Math.min(8, weakBulletFixes.length * 2);
    const projectedMin = Math.min(100, baseScore + minGain);
    const projectedMax = Math.min(100, baseScore + maxGain);

    gaps.push({
      id: 'gap_bullet_metrics',
      title: 'Add Quantifiable Results to Experience Bullets',
      category: 'market-signal',
      closability: '7 days',
      evidenceHeadline: `${weakBulletFixes.length} bullet points lack measurable outcomes, latency metrics, or user scale.`,
      suggestedAction: 'Revise bullets using the Action + Tech + Result structure with honest, measured numbers.',
      hypotheticalScoreGain: {
        min: minGain,
        max: maxGain,
        projectedRange: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
      },
      impactPerEffortScore: 80,
      bulletTemplate: 'Engineered {{what}} using {{stack}}, reducing {{latency/error rate}} by {{measured %}} under {{scale}} load.',
    });
  }

  // 4. Experience Gap (Hard tenure gap vs fresher)
  const yearsShortfall = requiredYears - candidateYears;
  if (yearsShortfall >= 2) {
    gaps.push({
      id: 'gap_experience_shortfall',
      title: `Tenure Requirement Shortfall (${requiredYears}+ Years Expected)`,
      category: 'experience',
      closability: 'not closable by resume alone',
      evidenceHeadline: `Job requires ${requiredYears} years of experience; resume text reflects ~${candidateYears} years.`,
      suggestedAction: 'This gap cannot be closed by resume wording. Target alternative entry pathways.',
      hypotheticalScoreGain: {
        min: 0,
        max: 0,
        projectedRange: '0 pts (Unclosable by resume alone; target parallel tracks)',
      },
      impactPerEffortScore: 10,
      alternativesForNonClosable: [
        'Target adjacent Associate / SDE-1 / Graduate roles at the same employer.',
        'Target multi-track service drives (e.g. TCS Digital/Prime or Infosys SP) calibrated for your batch.',
        'Obtain an internal employee referral to bypass automated ATS tenure filters.',
        'Qualify through open competitive programming contests (NQT, HackWithInfy, CodeChef rounds).',
      ],
    });
  }

  // Sort all gaps by impactPerEffortScore descending
  const sortedGaps = [...gaps].sort((a, b) => b.impactPerEffortScore - a.impactPerEffortScore);

  // Filter into the 4 structured plan tiers
  const sevenDayPlan = sortedGaps.filter((g) => g.closability === '7 days').slice(0, 5);
  const thirtyDayPlan = sortedGaps.filter((g) => g.closability === '30 days');
  const twelveWeekRoadmap = sortedGaps.filter((g) => g.closability === '90+ days');
  const notClosableGaps = sortedGaps.filter((g) => g.closability === 'not closable by resume alone');

  return {
    sevenDayPlan,
    thirtyDayPlan,
    twelveWeekRoadmap,
    notClosableGaps,
    allRankedGaps: sortedGaps,
  };
}
