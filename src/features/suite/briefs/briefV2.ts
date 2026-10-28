// ============================================================
// HireFlow Brief Standard v2 — Core Schema & Validator
// Solves all structural and defect classes discovered in Stage 0
// ============================================================

export type BriefDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MetricDirection = 'higher_is_better' | 'lower_is_better' | 'target_range';
export type EvidenceStatus = 'verified' | 'analytically-checked' | 'unverified' | 'spec-only';
export type SafetyReviewStatus = 'clear' | 'flagged' | 'needs-decision';
export type BulletStructure = 'outcome-first' | 'scale-first' | 'technique-first';

export interface BriefMetricV2 {
  id: string;
  name: string;
  unit: string;
  direction: MetricDirection;
  measurementMethod: string;
  environment: string;
  passThreshold: number | string;
  stretchTarget?: number | string;
  evidenceStatus: EvidenceStatus;
  evidenceRef?: string;
}

export interface BriefRubricItemV2 {
  id: string;
  metricId?: string;
  command: string;
  expectedOutcome: string;
  verifierArtifact?: string;
  interpreter?: 'bash' | 'pwsh' | 'python' | 'go' | 'node';
}

export interface ArchitectureComponentV2 {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
}

export interface BriefScopeV2 {
  core: string[];
  extensions: string[];
  outOfScope: string[];
  hiddenWork: string[];
}

export interface BriefEffortV2 {
  minHours: number;
  maxHours: number;
  complexityFactor: number;
  basis: string;
}

export interface BriefPrerequisitesV2 {
  os: ('windows' | 'linux' | 'darwin')[];
  privileges: 'user' | 'root' | 'docker';
  hardwareClass: 'standard-laptop' | 'high-memory' | 'gpu-enabled';
  accountsRequired: string[];
  paidServices: string[];
  inrCost: number;
  freeTierPath: string;
}

export interface BriefClaimV2 {
  id: string;
  claim: string;
  status: 'verified' | 'unverified' | 'needs-review';
  source?: string;
}

export interface BriefMilestoneV2 {
  id: string;
  stepNumber: number;
  title: string;
  conceptIntroduced: string;
  verifiableOutput: string;
  effortSharePercent: number;
}

export interface BriefResourceV2 {
  concept: string;
  title: string;
  url: string;
  section: string;
  verified: boolean;
}

export interface BriefStuckPointV2 {
  milestoneId: string;
  symptom: string;
  rootCause: string;
  hint: string;
}

export interface BriefResumeBulletV2 {
  structure: BulletStructure;
  template: string;
  metricIds: string[];
}

export interface InterviewDefenseItemV2 {
  question: string;
  answerOutline: string;
  tradeOffs: string;
  failureModes: string;
}

export interface BriefSafetyLegalV2 {
  lawfulUseScope: string;
  syntheticDataOnly: boolean;
  piiRisk: boolean;
  trademarkNotes?: string;
  status: SafetyReviewStatus;
}

export interface ProjectBriefV2 {
  id: string;
  title: string;
  domain: string;
  difficulty: BriefDifficulty;
  coveredSkills: string[];
  techStack: string[];
  versionsPinned: Record<string, string>;

  // Core Narratives
  problemStatement: string;
  useCases: string;
  problemItSolves: string;
  recruiterSignal: string;

  // Structural V2 Enhancements
  scope: BriefScopeV2;
  effort: BriefEffortV2;
  prerequisites: BriefPrerequisitesV2;
  architectureComponents: ArchitectureComponentV2[];
  architectureDataFlow: string;

  metrics: BriefMetricV2[];
  rubric: BriefRubricItemV2[];
  milestones: BriefMilestoneV2[];
  resources: BriefResourceV2[];
  stuckPoints: BriefStuckPointV2[];
  resumeBullets: BriefResumeBulletV2[];
  interviewDefense: InterviewDefenseItemV2[];
  claims: BriefClaimV2[];
  safetyLegal: BriefSafetyLegalV2;

  // Metadata
  lastReviewed: string; // ISO date
  reviewBy: string;     // ISO date
  version: '2.0.0';
}

/**
 * Validates a ProjectBriefV2 object against the v2 specification.
 */
export function validateBriefV2(obj: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['Brief must be a non-null object'] };
  }

  const b = obj as Record<string, unknown>;

  // Basic required string fields
  ['id', 'title', 'domain', 'difficulty', 'problemStatement', 'architectureDataFlow'].forEach((key) => {
    if (typeof b[key] !== 'string' || (b[key] as string).trim().length === 0) {
      errors.push(`Missing or invalid string field: ${key}`);
    }
  });

  // Difficulty enum
  if (!['beginner', 'intermediate', 'advanced'].includes(b.difficulty as string)) {
    errors.push(`Invalid difficulty: ${b.difficulty}`);
  }

  // Arrays
  if (!Array.isArray(b.coveredSkills) || b.coveredSkills.length === 0) {
    errors.push('coveredSkills must be a non-empty array');
  }
  if (!Array.isArray(b.techStack) || b.techStack.length === 0) {
    errors.push('techStack must be a non-empty array');
  }

  // Effort range
  const effort = b.effort as BriefEffortV2 | undefined;
  if (!effort || typeof effort.minHours !== 'number' || typeof effort.maxHours !== 'number' || effort.minHours > effort.maxHours) {
    errors.push('Invalid effort object: minHours must be <= maxHours');
  }

  // Prerequisites
  const prereq = b.prerequisites as BriefPrerequisitesV2 | undefined;
  if (!prereq || !Array.isArray(prereq.os) || prereq.os.length === 0 || typeof prereq.freeTierPath !== 'string') {
    errors.push('Invalid prerequisites: must specify supported OS and freeTierPath');
  }

  // Metrics
  if (!Array.isArray(b.metrics) || b.metrics.length === 0) {
    errors.push('metrics must be a non-empty array');
  } else {
    const metricIds = new Set<string>();
    (b.metrics as BriefMetricV2[]).forEach((m, idx) => {
      if (!m.id || !m.name || !m.unit || m.passThreshold === undefined) {
        errors.push(`Metric at index ${idx} missing required fields (id, name, unit, passThreshold)`);
      }
      if (metricIds.has(m.id)) {
        errors.push(`Duplicate metric id: ${m.id}`);
      }
      metricIds.add(m.id);
    });
  }

  // Rubric
  if (!Array.isArray(b.rubric) || b.rubric.length === 0) {
    errors.push('rubric must be a non-empty array');
  } else {
    (b.rubric as BriefRubricItemV2[]).forEach((r, idx) => {
      if (!r.id || !r.command || !r.expectedOutcome) {
        errors.push(`Rubric item at index ${idx} missing required fields (id, command, expectedOutcome)`);
      }
      if (r.metricId) {
        const metricExists = (b.metrics as BriefMetricV2[] | undefined)?.some((m) => m.id === r.metricId);
        if (!metricExists) {
          errors.push(`Rubric item ${r.id} references non-existent metricId: ${r.metricId}`);
        }
      }
    });
  }

  // Milestones
  if (!Array.isArray(b.milestones) || b.milestones.length < 3) {
    errors.push('milestones must contain at least 3 progressive milestones');
  }

  // Resume Bullets
  if (!Array.isArray(b.resumeBullets) || b.resumeBullets.length < 2) {
    errors.push('resumeBullets must contain at least 2 structured variants');
  }

  // Safety / Legal
  const safety = b.safetyLegal as BriefSafetyLegalV2 | undefined;
  if (!safety || !safety.status || !safety.lawfulUseScope) {
    errors.push('safetyLegal must be defined with lawfulUseScope and status');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
