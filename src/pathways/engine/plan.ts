// ============================================================
// Pathways Architecture — Action Plan Engine
// Pure deterministic functions (Constitution B3, C5, E7).
// Strict 3-lane ordering: Blocker -> Readiness -> Process Prep.
// Relative week ranges only, zero calendar assumptions.
// ============================================================

import type {
  StudentProfile,
  ProgramRecord,
  ActionPlanResult,
  PlanTask,
  EngineTrace
} from '../schema/types';
import { roundHalfUp } from '../utils/money';
import { EDITORIAL_ASSUMPTIONS } from '../models/assumptions';
import { calculateCgpaGap } from './eligibility';

export const PLAN_ENGINE_VERSION = '1.0.0';

export function getPaceMultiplier(pace: 'relaxed' | 'standard' | 'intense'): number {
  switch (pace) {
    case 'relaxed':
      return 1.5;
    case 'intense':
      return 0.67;
    case 'standard':
    default:
      return 1.0;
  }
}

/**
 * Pure function: Generates structured preparation timeline across 3 ordered lanes.
 */
export function generateActionPlan(
  profile: StudentProfile,
  target: ProgramRecord,
  pace: 'relaxed' | 'standard' | 'intense' = 'standard'
): ActionPlanResult {
  const mult = getPaceMultiplier(pace);
  const tasks: PlanTask[] = [];
  const assumptionsUsed: Array<{ id: string; status: 'draft' | 'reviewed' }> = [];

  const elig = target.facts.eligibility || {};

  // ------------------------------------------------------------
  // LANE 1: Eligibility Blockers
  // ------------------------------------------------------------

  // 1.1 Active Backlogs Resolution
  if (
    elig.maxActiveBacklogs !== undefined &&
    profile.activeBacklogs !== undefined &&
    profile.activeBacklogs !== null &&
    profile.activeBacklogs > elig.maxActiveBacklogs
  ) {
    const minW = Math.max(1, roundHalfUp(4 * mult));
    const likelyW = Math.max(minW, roundHalfUp(8 * mult));
    const maxW = Math.max(likelyW, roundHalfUp(12 * mult));

    tasks.push({
      id: 'task-blocker-backlog-clear',
      title: 'Clear Active Academic Backlog(s)',
      category: 'eligibility_blocker',
      effortMinWeeks: minW,
      effortLikelyWeeks: likelyW,
      effortMaxWeeks: maxW,
      actionRequired: `Clear ${profile.activeBacklogs} active backlog(s) in upcoming university supplementary examinations before drive cutoffs.`,
      sourceNote: 'Mandatory cutoff: employer allows max ' + elig.maxActiveBacklogs + ' backlogs.',
      isDraftAssumption: true
    });
    assumptionsUsed.push({ id: 'A-PLAN-BACKLOG-CLEAR-WEEKS', status: 'draft' });
  }

  // 1.2 CGPA Recovery Plan
  if (elig.cgpaMin !== undefined && profile.cgpa < elig.cgpaMin) {
    const gap = calculateCgpaGap(profile.cgpa, 4, 8, elig.cgpaMin);
    const minW = Math.max(2, roundHalfUp(6 * mult));
    const likelyW = Math.max(minW, roundHalfUp(12 * mult));
    const maxW = Math.max(likelyW, roundHalfUp(16 * mult));

    tasks.push({
      id: 'task-blocker-cgpa-recovery',
      title: 'Target CGPA Improvement across Next Semester(s)',
      category: 'eligibility_blocker',
      effortMinWeeks: minW,
      effortLikelyWeeks: likelyW,
      effortMaxWeeks: maxW,
      actionRequired: gap.isPossible
        ? `Target average of ${gap.requiredRemainingCgpa} CGPA in remaining semesters to reach published cutoff ${elig.cgpaMin}.`
        : `Published cutoff is ${elig.cgpaMin}. Consult university academic council for grade improvement / re-evaluation rules.`,
      sourceNote: `Current CGPA ${profile.cgpa} is below published cutoff ${elig.cgpaMin}.`,
      isDraftAssumption: true
    });
  }

  // ------------------------------------------------------------
  // LANE 2: Readiness Gaps (Technical & Cognitive)
  // ------------------------------------------------------------

  // 2.1 Quantitative & Logical Aptitude
  const minApt = Math.max(1, roundHalfUp(4 * mult));
  const likelyApt = Math.max(minApt, roundHalfUp(6 * mult));
  const maxApt = Math.max(likelyApt, roundHalfUp(8 * mult));

  tasks.push({
    id: 'task-readiness-aptitude',
    title: 'Cognitive & Quantitative Aptitude Mastery',
    category: 'readiness_gap',
    effortMinWeeks: minApt,
    effortLikelyWeeks: likelyApt,
    effortMaxWeeks: maxApt,
    actionRequired: 'Cover numbers, arithmetic speed math, logical deduction, and data interpretation patterns used in campus screening assessments.',
    sourceNote: 'Required for first round elimination online assessments.',
    isDraftAssumption: true
  });
  assumptionsUsed.push({ id: 'A-PLAN-APT-WEEKS', status: 'draft' });

  // 2.2 Data Structures & Algorithms
  const minDsa = Math.max(2, roundHalfUp(8 * mult));
  const likelyDsa = Math.max(minDsa, roundHalfUp(12 * mult));
  const maxDsa = Math.max(likelyDsa, roundHalfUp(16 * mult));

  tasks.push({
    id: 'task-readiness-dsa',
    title: 'Data Structures & Core Problem Solving',
    category: 'readiness_gap',
    effortMinWeeks: minDsa,
    effortLikelyWeeks: likelyDsa,
    effortMaxWeeks: maxDsa,
    actionRequired: 'Arrays, Strings, Hash Maps, Linked Lists, Trees, Graphs, Sorting, and Dynamic Programming in C++, Java, or Python.',
    sourceNote: 'Core evaluation in technical test and primary interview rounds.',
    isDraftAssumption: true
  });
  assumptionsUsed.push({ id: 'A-PLAN-DSA-WEEKS', status: 'draft' });

  // 2.3 Computer Science Fundamentals (OS, DBMS, Networks, OOP)
  const minCs = Math.max(1, roundHalfUp(3 * mult));
  const likelyCs = Math.max(minCs, roundHalfUp(4 * mult));
  const maxCs = Math.max(likelyCs, roundHalfUp(6 * mult));

  tasks.push({
    id: 'task-readiness-core-cs',
    title: 'Core CS Foundations (OS, DBMS, Computer Networks, OOP)',
    category: 'readiness_gap',
    effortMinWeeks: minCs,
    effortLikelyWeeks: likelyCs,
    effortMaxWeeks: maxCs,
    actionRequired: 'Prepare SQL indexing, database normalization, OS concurrency & memory paging, and socket protocols for technical panels.',
    sourceNote: 'Standard technical interview syllabus.',
    isDraftAssumption: true
  });
  assumptionsUsed.push({ id: 'A-PLAN-CORE-CS-WEEKS', status: 'draft' });

  // ------------------------------------------------------------
  // LANE 3: Process Preparation
  // ------------------------------------------------------------

  // 3.1 Fresher Resume Tailoring
  const minRes = Math.max(1, roundHalfUp(1 * mult));
  const likelyRes = Math.max(minRes, roundHalfUp(2 * mult));
  const maxRes = Math.max(likelyRes, roundHalfUp(3 * mult));

  tasks.push({
    id: 'task-process-resume',
    title: 'Single-Page Technical Fresher Resume Tailoring',
    category: 'process_prep',
    effortMinWeeks: minRes,
    effortLikelyWeeks: likelyRes,
    effortMaxWeeks: maxRes,
    actionRequired: 'Highlight verifiable academic projects, GitHub repositories, competitive programming ratings, and technical proficiencies without fluff.',
    sourceNote: 'First impressions for placement cell and screening recruiters.',
    isDraftAssumption: false
  });

  // 3.2 Mock Technical & HR Interviews
  const minMock = Math.max(1, roundHalfUp(2 * mult));
  const likelyMock = Math.max(minMock, roundHalfUp(3 * mult));
  const maxMock = Math.max(likelyMock, roundHalfUp(4 * mult));

  tasks.push({
    id: 'task-process-mock-interviews',
    title: 'Simulated Technical & Managerial Mock Interviews',
    category: 'process_prep',
    effortMinWeeks: minMock,
    effortLikelyWeeks: likelyMock,
    effortMaxWeeks: maxMock,
    actionRequired: 'Conduct live code explanations on whiteboard/editor and practice articulating project architecture choices under timed interview conditions.',
    sourceNote: 'Final stage selection preparation.',
    isDraftAssumption: false
  });

  // Total weeks range calculation
  // Since readiness lanes run concurrently with some overlap, likely duration represents parallel execution
  const totalMin = Math.max(...tasks.map((t) => t.effortMinWeeks));
  const totalLikely = Math.max(...tasks.map((t) => t.effortLikelyWeeks));
  const totalMax = tasks.reduce((sum, t) => sum + t.effortMaxWeeks, 0);

  const trace: EngineTrace = {
    engine: 'plan',
    engineVersion: PLAN_ENGINE_VERSION,
    asOf: new Date().toISOString().slice(0, 10),
    inputsUsed: ['branch', 'batchYear', 'cgpa', 'activeBacklogs', 'pace'],
    rulesApplied: [
      `lane_order:blocker_then_readiness_then_process`,
      `pace_multiplier:${mult}`
    ],
    evidenceRefs: [],
    assumptionsUsed,
    unknowns: []
  };

  return {
    targetId: target.id,
    targetType: 'direct_campus',
    pace,
    paceMultiplier: mult,
    tasks,
    totalWeeksRange: {
      min: totalMin,
      likely: totalLikely,
      max: totalMax
    },
    draftAssumptionsInUse: assumptionsUsed.length > 0,
    trace
  };
}
