// ============================================================
// Career Promotion & Roadmap Engine
// Deterministic path resolution, level parity mapping, and comp modeling
// ============================================================

import type { CareerLevel, CareerTrack } from '../data/careerLadders/types';
import { getCompanyLadder, getLevel, getLevelsForCompanyAndTrack } from '../data/careerLadders';
import { getEquivalenceOrder } from '../data/careerLadders/equivalenceMap';

export type PerformanceBracket = 'MEETS' | 'EXCEEDS' | 'CONSISTENTLY_EXCEEDS';

export interface LadderNodeRef {
  companyId: string;
  levelCode: string;
  track?: CareerTrack;
}

export interface ResolvePathOptions {
  performanceBracket?: PerformanceBracket;
  yearsInCurrentLevel?: number;
  currency?: 'USD' | 'INR';
  exchangeRateUsdToInr?: number; // default 87.0
  externalLevelOffset?: number;  // 0 = parity hire, -1 = down-leveled
}

export interface PromotionPlanStep {
  stepIndex: number;
  fromLevel: CareerLevel;
  toLevel: CareerLevel;
  isCompanySwitch: boolean;
  stepType: 'INTERNAL_PROMO' | 'LATERAL_SWITCH' | 'DOWNLEVEL_SWITCH' | 'UPLEVEL_SWITCH' | 'TRACK_SWITCH';
  durationYears: {
    min: number;
    likely: number;
    max: number;
  };
  cumulativeYears: number;
  cycleWindow: string;
  requirements: {
    scope: string;
    impact: string;
    influence: string;
    evidence: string[];
  };
  process: {
    cadence: string;
    nominator: string;
    committee: string;
    artifacts: string[];
    commonBlockers?: string[];
  };
  blockers: string[];
  notes?: string;
}

export interface CompDataPoint {
  year: string;
  yearNum: number;
  salary: number; // in requested currency
  base: number;
  stock: number;
  bonus: number;
  levelCode: string;
  companyName: string;
}

export interface PromotionPlan {
  status: 'SUCCESS' | 'SAME_LEVEL' | 'TARGET_JUNIOR' | 'UNREACHABLE' | 'TRACK_SWITCH_ONLY';
  message?: string;
  sourceLevel: CareerLevel;
  targetLevel: CareerLevel;
  steps: PromotionPlanStep[];
  totalTime: {
    min: number;
    likely: number;
    max: number;
  };
  compJump: {
    from: number;
    to: number;
    diff: number;
    percentage: number;
    currency: 'USD' | 'INR';
  };
  compTimeline: CompDataPoint[];
  probability: {
    percentage: number;
    timeframeYears: number;
    formulaExplanation: string;
    levelStallRates: { levelCode: string; companyId: string; stallRate: number }[];
  };
  strategicAdvice: string[];
}

export const DEFAULT_USD_INR_RATE = 87.0;

/**
 * Converts a compensation value between USD and INR
 */
export function convertComp(
  amount: number,
  fromCurrency: 'USD' | 'INR',
  toCurrency: 'USD' | 'INR',
  rate: number = DEFAULT_USD_INR_RATE
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD' && toCurrency === 'INR') return Math.round(amount * rate);
  return Math.round(amount / rate);
}

/**
 * Calculates step duration adjusted by performance and existing tenure in level
 */
function calculateStepDuration(
  level: CareerLevel,
  isFirstStep: boolean,
  performance: PerformanceBracket,
  yearsAlreadyInLevel: number
): { min: number; likely: number; max: number } {
  const { p25, median, p75 } = level.timeInLevel;

  let min = p25;
  let likely = median;
  let max = p75;

  if (performance === 'EXCEEDS') {
    likely = (p25 + median) / 2;
    min = Math.max(1.0, p25 * 0.9);
    max = median;
  } else if (performance === 'CONSISTENTLY_EXCEEDS') {
    likely = p25;
    min = Math.max(0.8, p25 * 0.75);
    max = (p25 + median) / 2;
  }

  // Deduct tenure already served in the first level
  if (isFirstStep && yearsAlreadyInLevel > 0) {
    min = Math.max(0.5, Number((min - yearsAlreadyInLevel).toFixed(1)));
    likely = Math.max(0.5, Number((likely - yearsAlreadyInLevel).toFixed(1)));
    max = Math.max(0.8, Number((max - yearsAlreadyInLevel).toFixed(1)));
  }

  return {
    min: Number(min.toFixed(1)),
    likely: Number(likely.toFixed(1)),
    max: Number(max.toFixed(1)),
  };
}

/**
 * Core Path Resolution Algorithm
 */
export function resolvePath(
  sourceRef: LadderNodeRef,
  targetRef: LadderNodeRef,
  options: ResolvePathOptions = {}
): PromotionPlan {
  const perf = options.performanceBracket || 'MEETS';
  const yearsInCurrent = Math.max(0, options.yearsInCurrentLevel || 0);
  const targetCurrency = options.currency || 'USD';
  const rate = options.exchangeRateUsdToInr || DEFAULT_USD_INR_RATE;
  const externalOffset = options.externalLevelOffset ?? 0;

  const sourceTrack = sourceRef.track || 'SWE';
  const targetTrack = targetRef.track || 'SWE';

  const sourceLevel = getLevel(sourceRef.companyId, sourceRef.levelCode, sourceTrack);
  const targetLevel = getLevel(targetRef.companyId, targetRef.levelCode, targetTrack);

  if (!sourceLevel || !targetLevel) {
    throw new Error(
      `Cannot resolve ladder node: source (${sourceRef.companyId} ${sourceRef.levelCode}) or target (${targetRef.companyId} ${targetRef.levelCode}) not found.`
    );
  }

  const sourceOrder = getEquivalenceOrder(sourceLevel.equivalenceGroup);
  const targetOrder = getEquivalenceOrder(targetLevel.equivalenceGroup);
  const isSameCompany = sourceLevel.companyId.toLowerCase() === targetLevel.companyId.toLowerCase();
  const isTrackSwitch = sourceLevel.track !== targetLevel.track;

  const sourceCompInTargetCur = convertComp(
    sourceLevel.comp.total.p50,
    sourceLevel.comp.currency,
    targetCurrency,
    rate
  );
  const targetCompInTargetCur = convertComp(
    targetLevel.comp.total.p50,
    targetLevel.comp.currency,
    targetCurrency,
    rate
  );

  const compDiff = targetCompInTargetCur - sourceCompInTargetCur;
  const compPercentage =
    sourceCompInTargetCur > 0
      ? Number(((compDiff / sourceCompInTargetCur) * 100).toFixed(1))
      : 0;

  // Case 1: Same Company & Same Level
  if (isSameCompany && sourceLevel.levelCode === targetLevel.levelCode && !isTrackSwitch) {
    return {
      status: 'SAME_LEVEL',
      message: `You are currently at ${sourceLevel.title} (${sourceLevel.levelCode}) at ${sourceRef.companyId.toUpperCase()}. You are already at this target level.`,
      sourceLevel,
      targetLevel,
      steps: [],
      totalTime: { min: 0, likely: 0, max: 0 },
      compJump: {
        from: sourceCompInTargetCur,
        to: targetCompInTargetCur,
        diff: 0,
        percentage: 0,
        currency: targetCurrency,
      },
      compTimeline: [
        {
          year: 'Current',
          yearNum: 0,
          salary: sourceCompInTargetCur,
          base: convertComp(sourceLevel.comp.base, sourceLevel.comp.currency, targetCurrency, rate),
          stock: convertComp(sourceLevel.comp.stock, sourceLevel.comp.currency, targetCurrency, rate),
          bonus: convertComp(sourceLevel.comp.bonus, sourceLevel.comp.currency, targetCurrency, rate),
          levelCode: sourceLevel.levelCode,
          companyName: sourceLevel.companyId,
        },
      ],
      probability: {
        percentage: 100,
        timeframeYears: 0,
        formulaExplanation: 'Current position equals target position.',
        levelStallRates: [],
      },
      strategicAdvice: [
        'You have already achieved this level. Consider mapping to the next level up (e.g. Senior -> Staff).',
      ],
    };
  }

  // Case 2: Target is Junior to Current Level
  if (sourceOrder > targetOrder) {
    return {
      status: 'TARGET_JUNIOR',
      message: `Target level ${targetLevel.title} (${targetLevel.levelCode}) is junior in scope to your current level ${sourceLevel.title} (${sourceLevel.levelCode}).`,
      sourceLevel,
      targetLevel,
      steps: [],
      totalTime: { min: 0, likely: 0, max: 0 },
      compJump: {
        from: sourceCompInTargetCur,
        to: targetCompInTargetCur,
        diff: compDiff,
        percentage: compPercentage,
        currency: targetCurrency,
      },
      compTimeline: [
        {
          year: 'Current',
          yearNum: 0,
          salary: sourceCompInTargetCur,
          base: convertComp(sourceLevel.comp.base, sourceLevel.comp.currency, targetCurrency, rate),
          stock: convertComp(sourceLevel.comp.stock, sourceLevel.comp.currency, targetCurrency, rate),
          bonus: convertComp(sourceLevel.comp.bonus, sourceLevel.comp.currency, targetCurrency, rate),
          levelCode: sourceLevel.levelCode,
          companyName: sourceLevel.companyId,
        },
      ],
      probability: {
        percentage: 100,
        timeframeYears: 0,
        formulaExplanation: 'Target level is below your existing scope.',
        levelStallRates: [],
      },
      strategicAdvice: [
        'Down-leveling is usually unnecessary unless switching to a completely different engineering domain or moving to a higher-paying tier.',
      ],
    };
  }

  // Build Roadmap Steps
  const steps: PromotionPlanStep[] = [];
  let cumulativeYears = 0;

  if (isSameCompany && !isTrackSwitch) {
    // Same Company, Same Track Multi-Step Path
    const companyLevels = getLevelsForCompanyAndTrack(sourceLevel.companyId, sourceLevel.track);
    const sourceIdx = companyLevels.findIndex((l) => l.levelCode === sourceLevel.levelCode);
    const targetIdx = companyLevels.findIndex((l) => l.levelCode === targetLevel.levelCode);

    if (sourceIdx !== -1 && targetIdx !== -1 && sourceIdx < targetIdx) {
      for (let i = sourceIdx; i < targetIdx; i++) {
        const from = companyLevels[i];
        const to = companyLevels[i + 1];
        const isFirst = i === sourceIdx;
        const dur = calculateStepDuration(from, isFirst, perf, yearsInCurrent);
        cumulativeYears += dur.likely;

        const cycleWindowMonths = Math.round(dur.likely * 12);

        steps.push({
          stepIndex: steps.length + 1,
          fromLevel: from,
          toLevel: to,
          isCompanySwitch: false,
          stepType: 'INTERNAL_PROMO',
          durationYears: dur,
          cumulativeYears: Number(cumulativeYears.toFixed(1)),
          cycleWindow: `Target Promo Window: Month ${Math.max(6, cycleWindowMonths - 6)} – Month ${cycleWindowMonths}`,
          requirements: to.promotionRequirements,
          process: to.promotionProcess,
          blockers: to.promotionProcess.commonBlockers,
        });
      }
    }
  } else if (isSameCompany && isTrackSwitch) {
    // Same Company, Cross-Track (e.g. SWE -> EM)
    // 1. If currently below Senior (L5 equivalent), climb SWE ladder first to Senior
    const sourceCompanySweLevels = getLevelsForCompanyAndTrack(sourceLevel.companyId, sourceLevel.track);
    const sourceIdx = sourceCompanySweLevels.findIndex((l) => l.levelCode === sourceLevel.levelCode);
    const seniorIdx = sourceCompanySweLevels.findIndex((l) => getEquivalenceOrder(l.equivalenceGroup) >= 2);

    let transitionFromLevel = sourceLevel;
    if (sourceIdx !== -1 && seniorIdx !== -1 && sourceIdx < seniorIdx) {
      for (let i = sourceIdx; i < seniorIdx; i++) {
        const from = sourceCompanySweLevels[i];
        const to = sourceCompanySweLevels[i + 1];
        const isFirst = i === sourceIdx;
        const dur = calculateStepDuration(from, isFirst, perf, yearsInCurrent);
        cumulativeYears += dur.likely;

        steps.push({
          stepIndex: steps.length + 1,
          fromLevel: from,
          toLevel: to,
          isCompanySwitch: false,
          stepType: 'INTERNAL_PROMO',
          durationYears: dur,
          cumulativeYears: Number(cumulativeYears.toFixed(1)),
          cycleWindow: `Engineering Track Promotion (~${Math.round(dur.likely * 12)} months)`,
          requirements: to.promotionRequirements,
          process: to.promotionProcess,
          blockers: to.promotionProcess.commonBlockers,
        });
      }
      transitionFromLevel = sourceCompanySweLevels[seniorIdx];
    }

    // 2. Track switch step into EM
    const trackSwitchDur = { min: 0.8, likely: 1.2, max: 2.0 };
    cumulativeYears += trackSwitchDur.likely;

    steps.push({
      stepIndex: steps.length + 1,
      fromLevel: transitionFromLevel,
      toLevel: targetLevel,
      isCompanySwitch: false,
      stepType: 'TRACK_SWITCH',
      durationYears: trackSwitchDur,
      cumulativeYears: Number(cumulativeYears.toFixed(1)),
      cycleWindow: 'Management Apprenticeship / Tech Lead Transition Window (~12-18 months)',
      requirements: targetLevel.promotionRequirements,
      process: targetLevel.promotionProcess,
      blockers: targetLevel.promotionProcess.commonBlockers,
      notes: `Discipline Transition: Moving from Individual Contributor (${sourceTrack}) to People Management (${targetTrack}). Focus shifts from direct coding to hiring, 360 performance reviews, sprint execution, and career growth of direct reports.`,
    });
  } else {
    // Cross-Company Path
    // Step A: Determine if candidate switches immediately at equivalent level, or climbs first
    const targetCompanyLevels = getLevelsForCompanyAndTrack(targetLevel.companyId, targetLevel.track);

    // Find the equivalent level in target company
    let targetEquivIdx = targetCompanyLevels.findIndex(
      (l) => getEquivalenceOrder(l.equivalenceGroup) === sourceOrder + externalOffset
    );
    if (targetEquivIdx === -1) {
      targetEquivIdx = targetCompanyLevels.findIndex(
        (l) => getEquivalenceOrder(l.equivalenceGroup) >= sourceOrder
      );
    }
    if (targetEquivIdx === -1) targetEquivIdx = 0;

    const entryLevelAtTarget = targetCompanyLevels[targetEquivIdx] || targetCompanyLevels[0];

    // Add Company Switch Step
    const switchDur = { min: 0.3, likely: 0.5, max: 0.8 }; // Interview & notice period
    cumulativeYears += switchDur.likely;

    const isLateral = getEquivalenceOrder(entryLevelAtTarget.equivalenceGroup) === sourceOrder;
    const isDownLevel = getEquivalenceOrder(entryLevelAtTarget.equivalenceGroup) < sourceOrder;

    steps.push({
      stepIndex: 1,
      fromLevel: sourceLevel,
      toLevel: entryLevelAtTarget,
      isCompanySwitch: true,
      stepType: isLateral ? 'LATERAL_SWITCH' : isDownLevel ? 'DOWNLEVEL_SWITCH' : 'UPLEVEL_SWITCH',
      durationYears: switchDur,
      cumulativeYears: Number(cumulativeYears.toFixed(1)),
      cycleWindow: 'Hiring & Onboarding Window (~3-6 months)',
      requirements: {
        scope: `External hiring bar for ${entryLevelAtTarget.title} at ${targetLevel.companyId.toUpperCase()}.`,
        impact: `Demonstrated track record of delivering at or near ${entryLevelAtTarget.equivalenceGroup} scope in prior roles.`,
        influence: 'Exceptional system design and behavioral/leadership interview rounds.',
        evidence: [
          'Pass system design & coding loop at external hiring bar',
          'Past impact portfolio showcasing unblocking complexity',
        ],
      },
      process: {
        cadence: 'Continuous hiring cycles / Rolling interview loops',
        nominator: 'Recruiter reach-out or employee referral',
        committee: 'Hiring Committee & Bar Raiser review',
        artifacts: ['Resume', 'Interview feedback packet', 'Compensation negotiation approval'],
        commonBlockers: [
          'External down-leveling during system design round',
          'Notice period or visa/relocation constraints',
        ],
      },
      blockers: [
        'Down-leveling by external hiring committee',
        'Failure to clear the company specific bar-raiser round',
      ],
      notes: isDownLevel
        ? `External candidates from ${sourceLevel.companyId.toUpperCase()} are frequently leveled conservatively into ${targetLevel.companyId.toUpperCase()}.`
        : `Lateral transition into ${targetLevel.companyId.toUpperCase()} at level parity.`,
    });

    // Step B: Climb remaining steps at Target Company
    const targetIdx = targetCompanyLevels.findIndex((l) => l.levelCode === targetLevel.levelCode);
    if (targetEquivIdx < targetIdx) {
      for (let i = targetEquivIdx; i < targetIdx; i++) {
        const from = targetCompanyLevels[i];
        const to = targetCompanyLevels[i + 1];
        const isFirst = false; // Fresh start at new company
        const dur = calculateStepDuration(from, isFirst, perf, 0);
        cumulativeYears += dur.likely;

        const cycleWindowMonths = Math.round(dur.likely * 12);

        steps.push({
          stepIndex: steps.length + 1,
          fromLevel: from,
          toLevel: to,
          isCompanySwitch: false,
          stepType: 'INTERNAL_PROMO',
          durationYears: dur,
          cumulativeYears: Number(cumulativeYears.toFixed(1)),
          cycleWindow: `Promotion Window: Month ${Math.max(6, cycleWindowMonths - 6)} – Month ${cycleWindowMonths}`,
          requirements: to.promotionRequirements,
          process: to.promotionProcess,
          blockers: to.promotionProcess.commonBlockers,
        });
      }
    }
  }

  // Handle Track Switch (e.g. SWE -> EM)
  if (isTrackSwitch && steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    lastStep.stepType = 'TRACK_SWITCH';
    lastStep.notes = `Discipline Transition: Moving from Individual Contributor (${sourceTrack}) to People Management (${targetTrack}). Focus shifts from direct coding to hiring, performance calibration, and organizational health.`;
  }

  // Total Time Computation
  const totalMin = Number(steps.reduce((acc, s) => acc + s.durationYears.min, 0).toFixed(1));
  const totalLikely = Number(steps.reduce((acc, s) => acc + s.durationYears.likely, 0).toFixed(1));
  const totalMax = Number(steps.reduce((acc, s) => acc + s.durationYears.max, 0).toFixed(1));

  // Probability Calculation based on stall rates
  const stallRatesInfo: { levelCode: string; companyId: string; stallRate: number }[] = [];
  let compoundProb = 1.0;

  const perfMultiplier =
    perf === 'CONSISTENTLY_EXCEEDS' ? 1.3 : perf === 'EXCEEDS' ? 1.15 : 1.0;

  for (const step of steps) {
    const stall = step.fromLevel.timeInLevel.stallRatePct;
    stallRatesInfo.push({
      levelCode: step.fromLevel.levelCode,
      companyId: step.fromLevel.companyId,
      stallRate: stall,
    });

    const stepSuccessRate = (1 - stall / 100) * perfMultiplier;
    compoundProb *= Math.min(0.96, Math.max(0.2, stepSuccessRate));
  }

  // Scale probability between 5% and 95%
  const finalProbPct = Math.round(Math.min(95, Math.max(8, compoundProb * 100)));

  // Generate Year-by-Year Compensation Timeline
  const compTimeline: CompDataPoint[] = [];
  const totalYearsCeil = Math.max(1, Math.ceil(totalLikely));

  let currentSalary = sourceCompInTargetCur;
  let activeLevel = sourceLevel;

  for (let yr = 0; yr <= totalYearsCeil; yr++) {
    // Find if a promotion occurred at or before this year
    let matchedStepLevel = sourceLevel;
    let runningYears = 0;

    for (const step of steps) {
      runningYears += step.durationYears.likely;
      if (yr >= Math.round(runningYears)) {
        matchedStepLevel = step.toLevel;
      }
    }

    if (matchedStepLevel.levelCode !== activeLevel.levelCode) {
      activeLevel = matchedStepLevel;
      currentSalary = convertComp(
        activeLevel.comp.total.p50,
        activeLevel.comp.currency,
        targetCurrency,
        rate
      );
    } else if (yr > 0) {
      // Annual standard merit/inflation bump (~3% within same level)
      currentSalary = Math.round(currentSalary * 1.03);
    }

    compTimeline.push({
      year: yr === 0 ? 'Year 0' : `Year ${yr}`,
      yearNum: yr,
      salary: currentSalary,
      base: convertComp(activeLevel.comp.base, activeLevel.comp.currency, targetCurrency, rate),
      stock: convertComp(activeLevel.comp.stock, activeLevel.comp.currency, targetCurrency, rate),
      bonus: convertComp(activeLevel.comp.bonus, activeLevel.comp.currency, targetCurrency, rate),
      levelCode: activeLevel.levelCode,
      companyName: activeLevel.companyId.toUpperCase(),
    });
  }

  // Strategic Advice
  const strategicAdvice: string[] = [];
  if (steps.some((s) => s.fromLevel.isTerminal)) {
    strategicAdvice.push(
      `You are advancing past a terminal level (${steps.find((s) => s.fromLevel.isTerminal)?.fromLevel.levelCode}). At this stage, promotion is no longer based on tenure—it requires demonstrated business-critical scope and cross-team organizational leverage.`
    );
  }
  if (!isSameCompany) {
    strategicAdvice.push(
      `Switching to ${targetLevel.companyId.toUpperCase()} introduces an onboarding ramp-up period (~3-6 months). Ensure you negotiate your joining level firmly during compensation conversations to avoid taking a career step back.`
    );
  }
  if (perf === 'CONSISTENTLY_EXCEEDS') {
    strategicAdvice.push(
      'Consistently Exceeds rating places you in the top 10-15% of calibrated performers, shortening the expected promotion cycle by 25-35%.'
    );
  }

  return {
    status: 'SUCCESS',
    sourceLevel,
    targetLevel,
    steps,
    totalTime: {
      min: totalMin,
      likely: totalLikely,
      max: totalMax,
    },
    compJump: {
      from: sourceCompInTargetCur,
      to: targetCompInTargetCur,
      diff: compDiff,
      percentage: compPercentage,
      currency: targetCurrency,
    },
    compTimeline,
    probability: {
      percentage: finalProbPct,
      timeframeYears: totalLikely,
      formulaExplanation: `Probability = Π [1 - (StallRate_i / 100)] × PerfMultiplier (${perfMultiplier}x for ${perf}). Calculated across ${steps.length} promotion step(s).`,
      levelStallRates: stallRatesInfo,
    },
    strategicAdvice,
  };
}
