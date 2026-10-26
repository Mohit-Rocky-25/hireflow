// ============================================================
// Pathways Architecture — Eligibility Engine & CGPA Gap Calculator
// Pure deterministic functions (Constitution B3, C3, E4, E7).
// Zero network egress, zero imputation of missing data.
// ============================================================

import type {
  StudentProfile,
  ProgramRecord,
  ProgramEligibilityResult,
  CriterionResult,
  ProgramOverallStatus,
  EngineTrace
} from '../schema/types';

export const ELIGIBILITY_ENGINE_VERSION = '1.0.0';

/**
 * Branch alias mapping for Indian engineering programs.
 */
const BRANCH_ALIASES: Record<string, string> = {
  cs: 'CSE',
  cse: 'CSE',
  'computer science': 'CSE',
  'computer science engineering': 'CSE',
  it: 'IT',
  'information technology': 'IT',
  aiml: 'AIML',
  'ai and ml': 'AIML',
  'ai & ml': 'AIML',
  aids: 'AIDS',
  'ai and ds': 'AIDS',
  'ai & ds': 'AIDS',
  ds: 'DS',
  'data science': 'DS',
  ece: 'ECE',
  'electronics and communication': 'ECE',
  'electronics & communication': 'ECE',
  'e&tc': 'ECE',
  entc: 'ECE',
  'electronics and telecommunication': 'ECE',
  eee: 'EEE',
  'electrical and electronics': 'EEE',
  'electrical & electronics': 'EEE',
  ee: 'EEE',
  electrical: 'EEE',
  me: 'ME',
  mechanical: 'ME',
  'mechanical engineering': 'ME',
  mech: 'ME',
  civil: 'CIVIL',
  'civil engineering': 'CIVIL',
  chem: 'CHEM',
  chemical: 'CHEM',
  biotech: 'BIOTECH',
  biotechnology: 'BIOTECH',
  mca: 'MCA',
  mtech: 'M.TECH',
  'm.tech': 'M.TECH'
};

export function normalizeBranch(branch: string): string {
  if (!branch) return '';
  const clean = branch.trim().toLowerCase();
  return BRANCH_ALIASES[clean] || branch.trim().toUpperCase();
}

/**
 * Evaluates student profile against official program published criteria.
 * Strictly 4 statuses: meets, check, fails, unknown (Constitution C3).
 */
export function evaluateEligibility(
  profile: StudentProfile,
  program: ProgramRecord
): ProgramEligibilityResult {
  const criteria: CriterionResult[] = [];
  const blockingInputs: string[] = [];
  const caveats: string[] = [];
  const evidenceRefs: string[] = [];

  const facts = program.facts;
  const elig = facts.eligibility || {};

  // Check if program published zero criteria
  const hasCriteria =
    elig.cgpaMin !== undefined ||
    elig.percentAggregateMin !== undefined ||
    elig.percent10Min !== undefined ||
    elig.percent12Min !== undefined ||
    elig.maxActiveBacklogs !== undefined ||
    (elig.branches && elig.branches.length > 0) ||
    (elig.degrees && elig.degrees.length > 0) ||
    (elig.batchYears && elig.batchYears.length > 0);

  if (!hasCriteria) {
    const trace: EngineTrace = {
      engine: 'eligibility',
      engineVersion: ELIGIBILITY_ENGINE_VERSION,
      asOf: new Date().toISOString().slice(0, 10),
      inputsUsed: ['branch', 'batchYear', 'cgpa'],
      rulesApplied: ['zero_published_criteria_check'],
      evidenceRefs: [],
      assumptionsUsed: [],
      unknowns: ['all_academic_cutoffs']
    };

    return {
      programId: program.id,
      officialName: facts.officialName,
      programName: facts.programName,
      programPageUrl: facts.programPageUrl,
      status: 'unknown',
      criteria: [],
      blockingInputs: [],
      caveats: ['No criteria published for this program by employer.'],
      trace
    };
  }

  // 1. Degree Evaluation
  if (elig.degrees && elig.degrees.length > 0) {
    const studentDegree = profile.degree || 'B.Tech';
    const normStudentDegree = studentDegree.toLowerCase().replace(/[^a-z]/g, '');
    const degreePass = elig.degrees.some((d) =>
      d.toLowerCase().replace(/[^a-z]/g, '') === normStudentDegree
    );
    const evRef = program.evidence['eligibility.degrees']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    criteria.push({
      criterion: 'degree',
      state: degreePass ? 'pass' : 'fail',
      required: elig.degrees,
      provided: studentDegree,
      evidence: evRef ? [evRef] : [],
      note: degreePass ? undefined : `Degree ${studentDegree} not listed in published degrees.`
    });
  }

  // 2. Branch Evaluation
  if (elig.branches && elig.branches.length > 0) {
    const studentDegree = profile.degree || 'B.Tech';
    const normStudentDegree = studentDegree.toLowerCase().replace(/[^a-z]/g, '');
    const isDegreeSelfContained =
      normStudentDegree === 'mca' && Boolean(elig.degrees?.some((d) => d.toLowerCase().includes('mca')));
    const normStudentBranch = normalizeBranch(profile.branch);
    const branchPass =
      isDegreeSelfContained ||
      elig.branches.some(
        (b) => normalizeBranch(b) === normStudentBranch || b.toUpperCase() === 'ALL'
      );
    const evRef = program.evidence['eligibility.branches']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    criteria.push({
      criterion: 'branch',
      state: branchPass ? 'pass' : 'fail',
      required: elig.branches,
      provided: isDegreeSelfContained ? 'MCA (Computer Applications)' : profile.branch,
      evidence: evRef ? [evRef] : [],
      note: branchPass ? undefined : `Branch ${profile.branch} not among published eligible branches.`
    });
  }

  // 3. Batch Year Evaluation
  if (elig.batchYears && elig.batchYears.length > 0) {
    const batchPass = elig.batchYears.includes(profile.batchYear);
    const evRef = program.evidence['eligibility.batchYears']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    criteria.push({
      criterion: 'batch_year',
      state: batchPass ? 'pass' : 'fail',
      required: elig.batchYears,
      provided: profile.batchYear,
      evidence: evRef ? [evRef] : [],
      note: batchPass ? undefined : `Class of ${profile.batchYear} is outside eligible batches.`
    });
  }

  // 4. CGPA & Scale Evaluation (Constitution E4 unit mismatch)
  if (elig.cgpaMin !== undefined) {
    const progScale = elig.cgpaScale || 10;
    const studentScale = profile.cgpaScale || 10;
    const evRef = program.evidence['eligibility.cgpaMin']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    if (studentScale !== progScale) {
      // Unit mismatch: NEVER convert linearly
      caveats.push(
        `Scale mismatch: your university marks on a ${studentScale}-point scale while the published criteria requires a ${progScale}-point scale. We never linearly convert CGPA.`
      );
      criteria.push({
        criterion: 'cgpa',
        state: 'unit_mismatch',
        required: `${elig.cgpaMin} (on ${progScale}.0 scale)`,
        provided: `${profile.cgpa} (on ${studentScale}.0 scale)`,
        evidence: evRef ? [evRef] : [],
        note: 'Scale mismatch. Check university conversion manual.'
      });
    } else {
      const cgpaPass = profile.cgpa >= elig.cgpaMin;
      criteria.push({
        criterion: 'cgpa',
        state: cgpaPass ? 'pass' : 'fail',
        required: elig.cgpaMin,
        provided: profile.cgpa,
        evidence: evRef ? [evRef] : [],
        note: cgpaPass ? undefined : `Published cutoff is ${elig.cgpaMin}; current is ${profile.cgpa}.`
      });
    }
  }

  // 5. Aggregate Percentage Evaluation
  if (elig.percentAggregateMin !== undefined) {
    const evRef = program.evidence['eligibility.percentAggregateMin']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    if (profile.percentAggregate !== undefined && profile.percentAggregate !== null) {
      const aggPass = profile.percentAggregate >= elig.percentAggregateMin;
      criteria.push({
        criterion: 'percent_aggregate',
        state: aggPass ? 'pass' : 'fail',
        required: elig.percentAggregateMin,
        provided: profile.percentAggregate,
        evidence: evRef ? [evRef] : []
      });
    } else {
      blockingInputs.push('percentAggregate');
      criteria.push({
        criterion: 'percent_aggregate',
        state: 'needs_input',
        required: elig.percentAggregateMin,
        provided: null,
        evidence: evRef ? [evRef] : [],
        note: 'Check these details: add your aggregate percentage to settle this.'
      });
    }
  }

  // 6. 10th Percentage Evaluation
  if (elig.percent10Min !== undefined) {
    const evRef = program.evidence['eligibility.percent10Min']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    if (profile.percent10 !== undefined && profile.percent10 !== null) {
      const p10Pass = profile.percent10 >= elig.percent10Min;
      criteria.push({
        criterion: 'percent_10th',
        state: p10Pass ? 'pass' : 'fail',
        required: elig.percent10Min,
        provided: profile.percent10,
        evidence: evRef ? [evRef] : []
      });
    } else {
      blockingInputs.push('percent10');
      criteria.push({
        criterion: 'percent_10th',
        state: 'needs_input',
        required: elig.percent10Min,
        provided: null,
        evidence: evRef ? [evRef] : [],
        note: 'Check these details: add your 10th marks to settle this.'
      });
    }
  }

  // 7. 12th Percentage Evaluation (handles Diploma lateral entry)
  if (elig.percent12Min !== undefined) {
    const evRef = program.evidence['eligibility.percent12Min']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    if (profile.isDiploma) {
      // 12th waived for lateral entry students with diploma
      criteria.push({
        criterion: 'percent_12th',
        state: 'pass',
        required: `${elig.percent12Min}% (Waived for Diploma)`,
        provided: 'Diploma Lateral Entry',
        evidence: evRef ? [evRef] : [],
        note: '12th requirement satisfied via Diploma qualification.'
      });
    } else if (profile.percent12 !== undefined && profile.percent12 !== null) {
      const p12Pass = profile.percent12 >= elig.percent12Min;
      criteria.push({
        criterion: 'percent_12th',
        state: p12Pass ? 'pass' : 'fail',
        required: elig.percent12Min,
        provided: profile.percent12,
        evidence: evRef ? [evRef] : []
      });
    } else {
      blockingInputs.push('percent12');
      criteria.push({
        criterion: 'percent_12th',
        state: 'needs_input',
        required: elig.percent12Min,
        provided: null,
        evidence: evRef ? [evRef] : [],
        note: 'Check these details: add your 12th % to settle this.'
      });
    }
  }

  // 8. Active Backlogs Evaluation
  if (elig.maxActiveBacklogs !== undefined) {
    const evRef = program.evidence['eligibility.maxActiveBacklogs']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    if (profile.activeBacklogs !== undefined && profile.activeBacklogs !== null) {
      const backlogsPass = profile.activeBacklogs <= elig.maxActiveBacklogs;
      criteria.push({
        criterion: 'active_backlogs',
        state: backlogsPass ? 'pass' : 'fail',
        required: `Maximum ${elig.maxActiveBacklogs}`,
        provided: profile.activeBacklogs,
        evidence: evRef ? [evRef] : [],
        note: backlogsPass
          ? undefined
          : `Has ${profile.activeBacklogs} active backlogs; limit is ${elig.maxActiveBacklogs}.`
      });
    } else {
      blockingInputs.push('activeBacklogs');
      criteria.push({
        criterion: 'active_backlogs',
        state: 'needs_input',
        required: `Maximum ${elig.maxActiveBacklogs}`,
        provided: null,
        evidence: evRef ? [evRef] : [],
        note: 'Check these details: specify active backlog count.'
      });
    }
  }

  // 9. Education Gap Evaluation
  if (elig.maxGapMonths !== undefined && profile.gapMonths !== undefined && profile.gapMonths !== null) {
    const evRef = program.evidence['eligibility.maxGapMonths']?.rowId;
    if (evRef) evidenceRefs.push(evRef);

    const gapPass = profile.gapMonths <= elig.maxGapMonths;
    criteria.push({
      criterion: 'max_gap_months',
      state: gapPass ? 'pass' : 'fail',
      required: `Maximum ${elig.maxGapMonths} months`,
      provided: `${profile.gapMonths} months`,
      evidence: evRef ? [evRef] : [],
      note: gapPass ? undefined : `Gap of ${profile.gapMonths} months exceeds ${elig.maxGapMonths} month limit.`
    });
  }

  // Compute Overall Status (Constitution C3)
  let status: ProgramOverallStatus = 'meets';

  const hasFail = criteria.some((c) => c.state === 'fail');
  const hasNeedsInput = criteria.some(
    (c) => c.state === 'needs_input' || c.state === 'unit_mismatch' || c.state === 'ambiguous'
  );

  if (hasFail) {
    status = 'fails';
  } else if (hasNeedsInput) {
    status = 'check';
  } else {
    status = 'meets';
  }

  const trace: EngineTrace = {
    engine: 'eligibility',
    engineVersion: ELIGIBILITY_ENGINE_VERSION,
    asOf: new Date().toISOString().slice(0, 10),
    inputsUsed: ['branch', 'batchYear', 'cgpa', ...Object.keys(profile)],
    rulesApplied: criteria.map((c) => `eval:${c.criterion}:${c.state}`),
    evidenceRefs,
    assumptionsUsed: [],
    unknowns: blockingInputs
  };

  return {
    programId: program.id,
    officialName: facts.officialName,
    programName: facts.programName,
    programPageUrl: facts.programPageUrl,
    status,
    criteria,
    blockingInputs,
    caveats,
    trace
  };
}

/**
 * CGPA Gap Calculator.
 * Exact formula: R = (T * N - C * n) / (N - n)
 * Where:
 * T = target CGPA
 * N = total semesters (e.g. 8 for B.Tech)
 * C = current CGPA
 * n = current completed semesters
 */
export function calculateCgpaGap(
  currentCgpa: number,
  currentSemesters: number,
  totalSemesters: number,
  targetCgpa: number
): {
  requiredRemainingCgpa: number | null;
  isPossible: boolean;
  isAchieved: boolean;
  reason?: string;
} {
  if (currentSemesters >= totalSemesters) {
    if (currentCgpa >= targetCgpa) {
      return {
        requiredRemainingCgpa: currentCgpa,
        isPossible: true,
        isAchieved: true,
        reason: 'Target already achieved on final graduation scale.'
      };
    }
    return {
      requiredRemainingCgpa: null,
      isPossible: false,
      isAchieved: false,
      reason: 'All semesters completed. No further semesters remaining to improve CGPA.'
    };
  }

  const remainingSemesters = totalSemesters - currentSemesters;
  const rawR = (targetCgpa * totalSemesters - currentCgpa * currentSemesters) / remainingSemesters;
  const roundedR = Math.round((rawR + Number.EPSILON) * 100) / 100;

  if (roundedR <= currentCgpa && currentCgpa >= targetCgpa) {
    return {
      requiredRemainingCgpa: roundedR,
      isPossible: true,
      isAchieved: true,
      reason: 'Current CGPA is already at or above target cutoff.'
    };
  }

  if (roundedR > 10.0) {
    return {
      requiredRemainingCgpa: roundedR,
      isPossible: false,
      isAchieved: false,
      reason: `Required remaining semester average (${roundedR.toFixed(2)}) exceeds maximum possible 10.0 scale.`
    };
  }

  return {
    requiredRemainingCgpa: roundedR,
    isPossible: true,
    isAchieved: false
  };
}
