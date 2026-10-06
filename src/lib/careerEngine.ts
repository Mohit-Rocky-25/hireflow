// ============================================================
// Career Promotion & Roadmap Engine — India Market Edition
// Deterministic path resolution, student hiring pathways, and INR comp modeling
// ============================================================

import type {
  CareerLevel,
  CareerTrack,
  CompanyLadder,
  StructuredBlocker,
  HiringRoute,
} from '../data/careerLadders/types';
import {
  getCompanyLadder,
  getLevel,
  getLevelsForCompanyAndTrack,
  ALL_COMPANY_LADDERS,
} from '../data/careerLadders';
import { getEquivalenceOrder, getEquivalenceHumanLabel } from '../data/careerLadders/equivalenceMap';

export type PerformanceBracket = 'MEETS' | 'EXCEEDS' | 'CONSISTENTLY_EXCEEDS';

export interface LadderNodeRef {
  companyId: string;
  levelCode: string;
  track?: CareerTrack;
}

export interface ResolvePathOptions {
  performanceBracket?: PerformanceBracket;
  yearsInCurrentLevel?: number;
  currentAnnualCTC?: number;      // Actual current CTC in INR (rupees/year)
  totalExperienceYears?: number;  // Total career experience in years
  externalLevelOffset?: number;   // 0 = parity hire, -1 = down-leveled
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
  calendarYearWindow?: string;
  requirements: {
    scope: string;
    impact: string;
    influence: string;
    evidence: string[];
  };
  process: {
    cadence: string;
    cadenceMonths: number[];
    nominator: string;
    decider: string;
    calibrationLayers: number;
    artifacts: string[];
    selfNominationAllowed: boolean;
    cycleType: 'cycle' | 'off-cycle' | 'both';
    typicalNoticeAndEffectiveDate: string;
  };
  blockers: StructuredBlocker[];
  notes?: string;
}

export interface CompDataPoint {
  year: string;
  yearNum: number;
  calendarYear?: number;
  salary: number; // in INR rupees
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

// ─────────────────────────────────────────────────────────────
// Student Mode Interfaces
// ─────────────────────────────────────────────────────────────

export interface StudentProfile {
  degreeAndBranch: 'BTech_CSE_IT' | 'BTech_ECE' | 'BTech_Other' | 'BCA_MCA' | 'MTech' | 'Other';
  collegeTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Other';
  currentYearOfStudy: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year' | 'MTech';
  expectedGraduationYear: number;
  cgpaBracket: 'below_6' | '6_to_7' | '7_to_8' | 'above_8';
  internshipStatus: 'none' | 'completed' | 'ppo';
  dreamCompanyId: string;
  dreamLevelCode: string;
  track: CareerTrack;
}

export interface StudentEntryRoute extends HiringRoute {
  adjustedLikelihood: 'High' | 'Medium' | 'Low';
  likelihoodReason: string;
  expectedOfferINR: number;
}

export interface SteppingStoneOption {
  company: CompanyLadder;
  entryRole: string;
  entryOfferINR: number;
  typicalDurationYears: number;
  targetLevelAtDreamCompany: string;
  rationale: string;
}

export interface StudentPromotionPlan {
  status: 'SUCCESS' | 'TARGET_NOT_FOUND' | 'INVALID_INPUT';
  message?: string;
  studentProfile: StudentProfile;
  dreamCompany: CompanyLadder;
  entryLevel: CareerLevel;
  targetLevel: CareerLevel;
  entryRoutes: StudentEntryRoute[];
  steps: PromotionPlanStep[];
  totalTimeFromGraduation: {
    min: number;
    likely: number;
    max: number;
  };
  compTimeline: CompDataPoint[];
  alternateSteppingStones: SteppingStoneOption[];
  probability: {
    percentage: number;
    timeframeYears: number;
    formulaExplanation: string;
    levelStallRates: { levelCode: string; companyId: string; stallRate: number }[];
  };
  strategicAdvice: string[];
}

/**
 * Formats a rupee amount in Indian format:
 * - Below 1 Crore: ₹X.X LPA
 * - At or above 1 Crore: ₹X.XX Cr
 */
export function formatINR(rupees: number): string {
  if (isNaN(rupees) || rupees === 0) return '₹0';
  if (rupees >= 10000000) {
    const cr = (rupees / 10000000).toFixed(2);
    return `₹${cr} Cr`;
  }
  const lpa = (rupees / 100000).toFixed(1);
  return `₹${lpa} LPA`;
}

/**
 * Calculates step duration adjusted by performance rating and existing tenure in level
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
 * Core Path Resolution Algorithm for Working Professionals
 */
export function resolvePath(
  sourceRef: LadderNodeRef,
  targetRef: LadderNodeRef,
  options: ResolvePathOptions = {}
): PromotionPlan {
  const perf = options.performanceBracket || 'MEETS';
  const yearsInCurrent = Math.max(0, options.yearsInCurrentLevel || 0);

  const sourceLevel = getLevel(sourceRef.companyId, sourceRef.levelCode, sourceRef.track);
  const targetLevel = getLevel(targetRef.companyId, targetRef.levelCode, targetRef.track);

  if (!sourceLevel || !targetLevel) {
    const fallbackLevel = ALL_COMPANY_LADDERS[0]?.levels[0];
    return {
      status: 'UNREACHABLE',
      message: `Could not resolve company ladder node. Please select a valid company and level.`,
      sourceLevel: sourceLevel || fallbackLevel,
      targetLevel: targetLevel || fallbackLevel,
      steps: [],
      totalTime: { min: 0, likely: 0, max: 0 },
      compJump: { from: 0, to: 0, diff: 0, percentage: 0 },
      compTimeline: [],
      probability: {
        percentage: 0,
        timeframeYears: 0,
        formulaExplanation: 'Invalid inputs provided.',
        levelStallRates: [],
      },
      strategicAdvice: ['Please verify that the selected company and level exist in our verified ladders.'],
    };
  }

  const sourceRank = getEquivalenceOrder(sourceLevel.equivalenceGroup);
  const targetRank = getEquivalenceOrder(targetLevel.equivalenceGroup);

  // Determine starting comp
  const fromComp = options.currentAnnualCTC && options.currentAnnualCTC > 0
    ? options.currentAnnualCTC
    : sourceLevel.comp.total.p50;
  const toComp = targetLevel.comp.total.p50;
  const compDiff = toComp - fromComp;
  const compJumpPct = fromComp > 0 ? Math.round((compDiff / fromComp) * 100) : 0;

  // Case 1: Same Node
  if (sourceLevel.companyId === targetLevel.companyId && sourceLevel.levelCode === targetLevel.levelCode) {
    return {
      status: 'SAME_LEVEL',
      message: `You are already at ${targetLevel.title} (${targetLevel.levelCode}) at ${sourceLevel.companyId.toUpperCase()}.`,
      sourceLevel,
      targetLevel,
      steps: [],
      totalTime: { min: 0, likely: 0, max: 0 },
      compJump: { from: fromComp, to: toComp, diff: 0, percentage: 0 },
      compTimeline: [
        {
          year: 'Current',
          yearNum: 0,
          salary: fromComp,
          base: sourceLevel.comp.base,
          stock: sourceLevel.comp.stock,
          bonus: sourceLevel.comp.variable,
          levelCode: sourceLevel.levelCode,
          companyName: sourceLevel.companyId,
        },
      ],
      probability: {
        percentage: 100,
        timeframeYears: 0,
        formulaExplanation: 'Already at target level.',
        levelStallRates: [],
      },
      strategicAdvice: [
        `You have already achieved this level! Focus on deepening domain impact and establishing cross-team sponsorship for your next promotion cycle.`,
      ],
    };
  }

  // Case 2: Target is Junior to Source
  if (targetRank < sourceRank && sourceLevel.companyId === targetLevel.companyId) {
    return {
      status: 'TARGET_JUNIOR',
      message: `Target level (${targetLevel.levelCode} • ${targetLevel.title}) is junior to your current level (${sourceLevel.levelCode} • ${sourceLevel.title}).`,
      sourceLevel,
      targetLevel,
      steps: [],
      totalTime: { min: 0, likely: 0, max: 0 },
      compJump: { from: fromComp, to: toComp, diff: compDiff, percentage: compJumpPct },
      compTimeline: [],
      probability: {
        percentage: 0,
        timeframeYears: 0,
        formulaExplanation: 'Target level is junior to current level.',
        levelStallRates: [],
      },
      strategicAdvice: ['Select a senior target level to simulate an upward promotion path.'],
    };
  }

  const steps: PromotionPlanStep[] = [];
  const advice: string[] = [];
  let cumulativeTime = 0;

  // Route 1: Same Company Progression
  if (sourceLevel.companyId === targetLevel.companyId) {
    const companyLevels = getLevelsForCompanyAndTrack(sourceLevel.companyId, sourceLevel.track);
    const sIdx = companyLevels.findIndex((l) => l.levelCode === sourceLevel.levelCode);
    const tIdx = companyLevels.findIndex((l) => l.levelCode === targetLevel.levelCode);

    if (sIdx !== -1 && tIdx !== -1 && sIdx < tIdx) {
      for (let i = sIdx; i < tIdx; i++) {
        const curr = companyLevels[i];
        const next = companyLevels[i + 1];
        const isFirst = i === sIdx;
        const duration = calculateStepDuration(curr, isFirst, perf, yearsInCurrent);
        cumulativeTime += duration.likely;

        const cycleWindow = next.promotionProcess.cadence || 'Annual Cycle';

        steps.push({
          stepIndex: steps.length + 1,
          fromLevel: curr,
          toLevel: next,
          isCompanySwitch: false,
          stepType: 'INTERNAL_PROMO',
          durationYears: duration,
          cumulativeYears: Number(cumulativeTime.toFixed(1)),
          cycleWindow,
          requirements: {
            scope: next.promotionRequirements.scope,
            impact: next.promotionRequirements.impact,
            influence: next.promotionRequirements.influence,
            evidence: next.promotionRequirements.evidence,
          },
          process: {
            cadence: next.promotionProcess.cadence,
            cadenceMonths: next.promotionProcess.cadenceMonths,
            nominator: next.promotionProcess.nominator,
            decider: next.promotionProcess.decider,
            calibrationLayers: next.promotionProcess.calibrationLayers,
            artifacts: next.promotionProcess.artifacts,
            selfNominationAllowed: next.promotionProcess.selfNominationAllowed,
            cycleType: next.promotionProcess.cycleType,
            typicalNoticeAndEffectiveDate: next.promotionProcess.typicalNoticeAndEffectiveDate,
          },
          blockers: next.promotionProcess.blockers,
          notes: isFirst && yearsInCurrent > 0
            ? `Credited ${yearsInCurrent} years already served in ${curr.levelCode}. Estimated window adjusted toward upcoming cycle.`
            : undefined,
        });
      }
    }
  } else {
    // Route 2: Cross-Company Progression
    const targetLevels = getLevelsForCompanyAndTrack(targetLevel.companyId, targetLevel.track);

    let lateralTarget = targetLevels.find(
      (l) => getEquivalenceOrder(l.equivalenceGroup) === sourceRank
    );

    if (!lateralTarget) {
      lateralTarget = targetLevels.find(
        (l) => getEquivalenceOrder(l.equivalenceGroup) <= sourceRank
      ) || targetLevels[0];
    }

    const switchDuration = {
      min: 0.3,
      likely: 0.5,
      max: 0.8,
    };
    cumulativeTime += switchDuration.likely;

    steps.push({
      stepIndex: steps.length + 1,
      fromLevel: sourceLevel,
      toLevel: lateralTarget,
      isCompanySwitch: true,
      stepType: 'LATERAL_SWITCH',
      durationYears: switchDuration,
      cumulativeYears: Number(cumulativeTime.toFixed(1)),
      cycleWindow: 'Immediate External Hiring Window (3–6 months typical lead time)',
      requirements: {
        scope: lateralTarget.promotionRequirements.scope,
        impact: `Demonstrate proven track record at ${sourceLevel.companyId.toUpperCase()} matching ${lateralTarget.levelCode} bar.`,
        influence: `Pass external coding rounds, system design interviews, and behavioral leadership rounds.`,
        evidence: [
          'External technical interview clearance across all 4-5 rounds',
          'Past performance review ratings from current employer',
          'System design interview defense for high-scale distributed systems',
        ],
      },
      process: {
        cadence: 'Continuous hiring cycles throughout the year',
        cadenceMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nominator: 'External recruiter / Employee referral',
        decider: 'Hiring Committee & Bar Raiser consensus',
        calibrationLayers: 2,
        artifacts: ['Resume', 'Technical Interview Notes', 'Past Review Transcripts'],
        selfNominationAllowed: true,
        cycleType: 'both',
        typicalNoticeAndEffectiveDate: 'Offer extended post-committee; join following 30-90 day notice period.',
      },
      blockers: lateralTarget.promotionProcess.blockers,
      notes: `Lateral company transition from ${sourceLevel.companyId.toUpperCase()} to ${targetLevel.companyId.toUpperCase()}. External hires typically join at peer equivalence level.`,
    });

    const lIdx = targetLevels.findIndex((l) => l.levelCode === lateralTarget.levelCode);
    const tIdx = targetLevels.findIndex((l) => l.levelCode === targetLevel.levelCode);

    if (lIdx !== -1 && tIdx !== -1 && lIdx < tIdx) {
      for (let i = lIdx; i < tIdx; i++) {
        const curr = targetLevels[i];
        const next = targetLevels[i + 1];
        const duration = calculateStepDuration(curr, false, perf, 0);
        cumulativeTime += duration.likely;

        steps.push({
          stepIndex: steps.length + 1,
          fromLevel: curr,
          toLevel: next,
          isCompanySwitch: false,
          stepType: 'INTERNAL_PROMO',
          durationYears: duration,
          cumulativeYears: Number(cumulativeTime.toFixed(1)),
          cycleWindow: next.promotionProcess.cadence || 'Annual Cycle',
          requirements: {
            scope: next.promotionRequirements.scope,
            impact: next.promotionRequirements.impact,
            influence: next.promotionRequirements.influence,
            evidence: next.promotionRequirements.evidence,
          },
          process: {
            cadence: next.promotionProcess.cadence,
            cadenceMonths: next.promotionProcess.cadenceMonths,
            nominator: next.promotionProcess.nominator,
            decider: next.promotionProcess.decider,
            calibrationLayers: next.promotionProcess.calibrationLayers,
            artifacts: next.promotionProcess.artifacts,
            selfNominationAllowed: next.promotionProcess.selfNominationAllowed,
            cycleType: next.promotionProcess.cycleType,
            typicalNoticeAndEffectiveDate: next.promotionProcess.typicalNoticeAndEffectiveDate,
          },
          blockers: next.promotionProcess.blockers,
        });
      }
    }
  }

  // Calculate totals
  const totalMin = steps.reduce((sum, s) => sum + s.durationYears.min, 0);
  const totalLikely = steps.reduce((sum, s) => sum + s.durationYears.likely, 0);
  const totalMax = steps.reduce((sum, s) => sum + s.durationYears.max, 0);

  // Compute compound probability based on stall rates
  const stallRates = steps.map((s) => ({
    levelCode: s.fromLevel.levelCode,
    companyId: s.fromLevel.companyId,
    stallRate: s.fromLevel.timeInLevel.stallRatePct,
  }));

  let compoundSuccessProb = 1.0;
  for (const item of stallRates) {
    const advanceRate = (100 - item.stallRate) / 100;
    compoundSuccessProb *= advanceRate;
  }

  if (perf === 'EXCEEDS') {
    compoundSuccessProb = Math.min(0.95, compoundSuccessProb * 1.15);
  } else if (perf === 'CONSISTENTLY_EXCEEDS') {
    compoundSuccessProb = Math.min(0.98, compoundSuccessProb * 1.3);
  }

  const finalProbPercent = Math.max(5, Math.round(compoundSuccessProb * 100));

  // Build Annual Comp Trajectory in INR
  const compTimeline: CompDataPoint[] = [];
  let currentYearProgress = 0;

  compTimeline.push({
    year: 'Year 0 (Now)',
    yearNum: 0,
    salary: fromComp,
    base: sourceLevel.comp.base,
    stock: sourceLevel.comp.stock,
    bonus: sourceLevel.comp.variable,
    levelCode: sourceLevel.levelCode,
    companyName: sourceLevel.companyId.toUpperCase(),
  });

  steps.forEach((step) => {
    currentYearProgress += step.durationYears.likely;
    const roundedYear = Math.round(currentYearProgress);

    compTimeline.push({
      year: `Year ${roundedYear}`,
      yearNum: roundedYear,
      salary: step.toLevel.comp.total.p50,
      base: step.toLevel.comp.base,
      stock: step.toLevel.comp.stock,
      bonus: step.toLevel.comp.variable,
      levelCode: step.toLevel.levelCode,
      companyName: step.toLevel.companyId.toUpperCase(),
    });
  });

  // Strategic Advice
  if (steps.some((s) => s.isCompanySwitch)) {
    advice.push(
      `Cross-company moves to ${targetLevel.companyId.toUpperCase()} typically yield substantial compensation leaps (+${compJumpPct}%). Prepare system design and concurrency depth 3-4 months prior.`
    );
  }
  if (sourceLevel.isTerminal) {
    advice.push(
      `Your current level (${sourceLevel.levelCode}) is considered a career-terminal level. Promotion beyond this requires demonstrated cross-squad organizational influence rather than ticket execution.`
    );
  }
  if (perf === 'CONSISTENTLY_EXCEEDS') {
    advice.push(
      `With a Consistently Exceeds rating, your promotion trajectory is accelerated toward the p25 velocity window.`
    );
  }

  return {
    status: 'SUCCESS',
    sourceLevel,
    targetLevel,
    steps,
    totalTime: {
      min: Number(totalMin.toFixed(1)),
      likely: Number(totalLikely.toFixed(1)),
      max: Number(totalMax.toFixed(1)),
    },
    compJump: {
      from: fromComp,
      to: toComp,
      diff: compDiff,
      percentage: compJumpPct,
    },
    compTimeline,
    probability: {
      percentage: finalProbPercent,
      timeframeYears: Number(totalLikely.toFixed(1)),
      formulaExplanation: `Calculated from empirical stall rates across ${steps.length} ladder step(s): ∏(1 - stallRate_i) adjusted for ${perf} performance rating.`,
      levelStallRates: stallRates,
    },
    strategicAdvice: advice,
  };
}

// ─────────────────────────────────────────────────────────────
// Student Roadmap Resolver
// ─────────────────────────────────────────────────────────────

export function resolveStudentPath(profile: StudentProfile): StudentPromotionPlan {
  const dreamCompany = getCompanyLadder(profile.dreamCompanyId);
  const targetLevel = getLevel(profile.dreamCompanyId, profile.dreamLevelCode, profile.track);

  if (!dreamCompany || !targetLevel) {
    const fallbackCompany = ALL_COMPANY_LADDERS[0];
    const fallbackLevel = fallbackCompany.levels[0];
    return {
      status: 'TARGET_NOT_FOUND',
      message: `Could not resolve dream company or role: ${profile.dreamCompanyId} • ${profile.dreamLevelCode}.`,
      studentProfile: profile,
      dreamCompany: dreamCompany || fallbackCompany,
      entryLevel: fallbackLevel,
      targetLevel: targetLevel || fallbackLevel,
      entryRoutes: [],
      steps: [],
      totalTimeFromGraduation: { min: 0, likely: 0, max: 0 },
      compTimeline: [],
      alternateSteppingStones: [],
      probability: {
        percentage: 0,
        timeframeYears: 0,
        formulaExplanation: 'Target level does not exist.',
        levelStallRates: [],
      },
      strategicAdvice: ['Please select a valid company and target role from our verified ladders.'],
    };
  }

  // Find the entry-level for the dream company in this track
  const trackLevels = getLevelsForCompanyAndTrack(dreamCompany.id, profile.track);
  const entryLevel = trackLevels[0] || dreamCompany.levels[0];

  // Build and customize entry routes based on student tier and CGPA
  const rawRoutes = entryLevel.hiringRoutes || [];
  const entryRoutes: StudentEntryRoute[] = rawRoutes.map((route) => {
    let adjustedLikelihood = route.likelihoodByTier.tier3;
    let likelihoodReason = 'Standard off-campus applicant pool with national competition.';

    if (profile.collegeTier === 'Tier 1') {
      adjustedLikelihood = route.likelihoodByTier.tier1;
      likelihoodReason = `${dreamCompany.name} conducts Day 1/Day 2 on-campus hiring drives at Tier 1 colleges (IITs, BITS, top NITs).`;
    } else if (profile.collegeTier === 'Tier 2') {
      adjustedLikelihood = route.likelihoodByTier.tier2;
      likelihoodReason = `${dreamCompany.name} conducts selective on-campus or pooled campus drives at premier private and state universities.`;
    } else {
      adjustedLikelihood = route.likelihoodByTier.tier3;
      likelihoodReason = `On-campus visits are rare for ${dreamCompany.name} at Tier 3 campuses. Prime pathways are national hackathons (e.g. Flipkart GRiD, CodeVita) or off-campus qualifier drives.`;
    }

    if (profile.internshipStatus === 'ppo' && route.routeType === 'intern-to-full-time') {
      adjustedLikelihood = 'High';
      likelihoodReason = 'Holding an active PPO guarantees direct conversion upon project review approval.';
    }

    if (profile.cgpaBracket === 'below_6' && route.eligibility.cgpaMin > 6.0) {
      adjustedLikelihood = 'Low';
      likelihoodReason = `Current CGPA (<6.0) is below ${dreamCompany.name}'s standard ${route.eligibility.cgpaMin} shortlisting cutoff. Hackathon or referral route recommended to bypass ATS filters.`;
    }

    const offerINR = profile.collegeTier === 'Tier 1'
      ? route.typicalOfferByTier.tier1
      : profile.collegeTier === 'Tier 2'
      ? route.typicalOfferByTier.tier2
      : route.typicalOfferByTier.tier3;

    return {
      ...route,
      adjustedLikelihood,
      likelihoodReason,
      expectedOfferINR: offerINR,
    };
  });

  // Rank routes: PPO first if applicable, then on-campus, then hackathon, then referral, then off-campus
  entryRoutes.sort((a, b) => {
    const priorityOrder = {
      'intern-to-full-time': 1,
      'on-campus': 2,
      'hackathon-competition': 3,
      'referral': 4,
      'off-campus': 5,
    };
    return (priorityOrder[a.routeType] || 99) - (priorityOrder[b.routeType] || 99);
  });

  // Now resolve the promotion steps from entryLevel to targetLevel
  const steps: PromotionPlanStep[] = [];
  let cumulativeTime = 0;

  const eIdx = trackLevels.findIndex((l) => l.levelCode === entryLevel.levelCode);
  const tIdx = trackLevels.findIndex((l) => l.levelCode === targetLevel.levelCode);

  if (eIdx !== -1 && tIdx !== -1 && eIdx < tIdx) {
    for (let i = eIdx; i < tIdx; i++) {
      const curr = trackLevels[i];
      const next = trackLevels[i + 1];
      const duration = calculateStepDuration(curr, false, 'MEETS', 0);
      cumulativeTime += duration.likely;

      const gradYear = profile.expectedGraduationYear;
      const startCalYear = gradYear + Math.round(cumulativeTime - duration.likely);
      const endCalYear = gradYear + Math.round(cumulativeTime);

      steps.push({
        stepIndex: steps.length + 1,
        fromLevel: curr,
        toLevel: next,
        isCompanySwitch: false,
        stepType: 'INTERNAL_PROMO',
        durationYears: duration,
        cumulativeYears: Number(cumulativeTime.toFixed(1)),
        cycleWindow: next.promotionProcess.cadence || 'Annual Cycle',
        calendarYearWindow: `${startCalYear} – ${endCalYear} (${gradYear}+${Math.round(cumulativeTime)} yrs)`,
        requirements: {
          scope: next.promotionRequirements.scope,
          impact: next.promotionRequirements.impact,
          influence: next.promotionRequirements.influence,
          evidence: next.promotionRequirements.evidence,
        },
        process: {
          cadence: next.promotionProcess.cadence,
          cadenceMonths: next.promotionProcess.cadenceMonths,
          nominator: next.promotionProcess.nominator,
          decider: next.promotionProcess.decider,
          calibrationLayers: next.promotionProcess.calibrationLayers,
          artifacts: next.promotionProcess.artifacts,
          selfNominationAllowed: next.promotionProcess.selfNominationAllowed,
          cycleType: next.promotionProcess.cycleType,
          typicalNoticeAndEffectiveDate: next.promotionProcess.typicalNoticeAndEffectiveDate,
        },
        blockers: next.promotionProcess.blockers,
      });
    }
  }

  // Calculate totals
  const totalMin = steps.reduce((sum, s) => sum + s.durationYears.min, 0);
  const totalLikely = steps.reduce((sum, s) => sum + s.durationYears.likely, 0);
  const totalMax = steps.reduce((sum, s) => sum + s.durationYears.max, 0);

  // Compute compound probability based on stall rates
  const stallRates = steps.map((s) => ({
    levelCode: s.fromLevel.levelCode,
    companyId: s.fromLevel.companyId,
    stallRate: s.fromLevel.timeInLevel.stallRatePct,
  }));

  let compoundSuccessProb = 1.0;
  for (const item of stallRates) {
    const advanceRate = (100 - item.stallRate) / 100;
    compoundSuccessProb *= advanceRate;
  }
  const finalProbPercent = Math.max(5, Math.round(compoundSuccessProb * 100));

  // Build Comp Timeline starting from Graduation Year
  const compTimeline: CompDataPoint[] = [];
  const gradYear = profile.expectedGraduationYear;

  const entryOffer = entryRoutes[0]?.expectedOfferINR || entryLevel.comp.total.p50;

  compTimeline.push({
    year: `${gradYear} (Graduation)`,
    yearNum: 0,
    calendarYear: gradYear,
    salary: entryOffer,
    base: entryLevel.comp.base,
    stock: entryLevel.comp.stock,
    bonus: entryLevel.comp.variable,
    levelCode: entryLevel.levelCode,
    companyName: dreamCompany.name,
  });

  steps.forEach((step) => {
    const targetCalYear = gradYear + Math.round(step.cumulativeYears);
    compTimeline.push({
      year: `${targetCalYear} (+${Math.round(step.cumulativeYears)}y)`,
      yearNum: Math.round(step.cumulativeYears),
      calendarYear: targetCalYear,
      salary: step.toLevel.comp.total.p50,
      base: step.toLevel.comp.base,
      stock: step.toLevel.comp.stock,
      bonus: step.toLevel.comp.variable,
      levelCode: step.toLevel.levelCode,
      companyName: dreamCompany.name,
    });
  });

  // Provide realistic alternate stepping stone routes
  const alternateSteppingStones: SteppingStoneOption[] = [];
  if (dreamCompany.tier === 'Big Tech' || dreamCompany.tier === 'India Product Unicorn') {
    const flipkart = getCompanyLadder('flipkart');
    const tcs = getCompanyLadder('tcs');
    const swiggy = getCompanyLadder('swiggy');

    if (flipkart && dreamCompany.id !== 'flipkart') {
      alternateSteppingStones.push({
        company: flipkart,
        entryRole: 'SDE-1 (Supply Chain / Marketplace)',
        entryOfferINR: 2670000,
        typicalDurationYears: 2,
        targetLevelAtDreamCompany: targetLevel.levelCode,
        rationale: `Start at Flipkart or Swiggy for 2 years as SDE-1 to gain high-concurrency production experience, then switch laterally to ${dreamCompany.name} at ${getEquivalenceHumanLabel(targetLevel.equivalenceGroup)} level.`,
      });
    }

    if (tcs && profile.collegeTier === 'Tier 3') {
      alternateSteppingStones.push({
        company: tcs,
        entryRole: 'Systems Engineer (Digital / Prime)',
        entryOfferINR: 750000,
        typicalDurationYears: 2.5,
        targetLevelAtDreamCompany: targetLevel.levelCode,
        rationale: `Crack TCS Digital or Prime via NQT/CodeVita, build 2-3 years of cloud microservices experience, and transition into product startups before targeting ${dreamCompany.name}.`,
      });
    } else if (swiggy && dreamCompany.id !== 'swiggy') {
      alternateSteppingStones.push({
        company: swiggy,
        entryRole: 'SDE-1 (Delivery Logistics)',
        entryOfferINR: 2500000,
        typicalDurationYears: 2,
        targetLevelAtDreamCompany: targetLevel.levelCode,
        rationale: `Join high-growth product engineering squads at Swiggy, build distributed systems depth, and interview as an experienced lateral engineer.`,
      });
    }
  }

  // Advice
  const advice: string[] = [
    `Your projected timeline starts at graduation in ${gradYear}. Securing a Summer Internship in your 3rd year is the highest-probability route to convert into a full-time offer at ${dreamCompany.name}.`,
  ];
  if (profile.collegeTier === 'Tier 3') {
    advice.push(
      `For Tier 3 students, national competitive challenges (e.g. Flipkart GRiD, TCS CodeVita, Google Summer of Code) bypass campus gatekeeping and provide direct technical interview calls.`
    );
  }

  return {
    status: 'SUCCESS',
    studentProfile: profile,
    dreamCompany,
    entryLevel,
    targetLevel,
    entryRoutes,
    steps,
    totalTimeFromGraduation: {
      min: Number(totalMin.toFixed(1)),
      likely: Number(totalLikely.toFixed(1)),
      max: Number(totalMax.toFixed(1)),
    },
    compTimeline,
    alternateSteppingStones,
    probability: {
      percentage: finalProbPercent,
      timeframeYears: Number(totalLikely.toFixed(1)),
      formulaExplanation: `Calculated from empirical stall rates across ${steps.length} promotion milestones post-graduation: ∏(1 - stallRate_i).`,
      levelStallRates: stallRates,
    },
    strategicAdvice: advice,
  };
}
