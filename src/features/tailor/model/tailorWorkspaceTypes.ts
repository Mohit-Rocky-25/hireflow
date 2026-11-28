// ============================================================
// HireFlow — Phase 11.1 Flagship Tailor Domain Types
// Evidence-first, provenance-preserving resume engineering model
// ============================================================

import type { IsoDate, Sha256, Uuid } from '@/domain/types';
import type { TailorEntryPoint } from '@/lib/tailor/launchContext';

export type TailorMode = 'improve' | 'role' | 'jd';

export type ProvenanceKind =
  | 'full_time'
  | 'part_time'
  | 'internship'
  | 'apprenticeship'
  | 'freelance'
  | 'academic_project'
  | 'personal_project'
  | 'open_source'
  | 'research'
  | 'volunteering'
  | 'leadership'
  | 'coursework'
  | 'certification'
  | 'training';

export type TailorLayoutId =
  | 'ats_single'
  | 'executive'
  | 'technical'
  | 'academic_research'
  | 'graduate_concise';

export type ClaimVerificationStatus =
  | 'directly_supported'
  | 'supported_paraphrase'
  | 'partially_supported'
  | 'user_confirmed'
  | 'unsupported'
  | 'contradicted';

export type RequirementEvidenceStatus =
  | 'directly_demonstrated'
  | 'related_experience'
  | 'transferable'
  | 'partially_supported'
  | 'missing_evidence'
  | 'not_found'
  | 'user_confirmed'
  | 'contradicted';

export type SuggestionSeverity = 'critical' | 'important' | 'recommended' | 'optional';

export type DraftLifecycleStatus =
  | 'new'
  | 'in_progress'
  | 'under_review'
  | 'ready_for_validation'
  | 'validated'
  | 'version_created'
  | 'archived';

export type ResumeSectionKind =
  | 'summary'
  | 'experience'
  | 'internships'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'research'
  | 'leadership'
  | 'awards'
  | 'custom';

export interface StructuredBullet {
  id: string;
  text: string;
  originalText: string;
  provenance: ProvenanceKind;
  linkedClaimIds: string[];
  linkedProjectId?: string;
}

export interface StructuredSectionEntry {
  id: string;
  title: string;
  organization?: string;
  location?: string;
  dateRange?: string;
  provenance: ProvenanceKind;
  technologies?: string[];
  bullets: StructuredBullet[];
}

export interface StructuredResumeSection {
  id: string;
  kind: ResumeSectionKind;
  title: string;
  visible: boolean;
  order: number;
  summaryText?: string;
  skillsList?: string[];
  entries?: StructuredSectionEntry[];
}

export interface StructuredResumeDocument {
  candidateName: string;
  headline?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  layoutId: TailorLayoutId;
  paperSize: 'letter' | 'a4';
  rawSourceText: string;
  sections: StructuredResumeSection[];
}

export interface AtomicClaim {
  claimId: string;
  claimText: string;
  sourceWorkspaceId: Uuid | null;
  sourceVersionId: Uuid | null;
  sourceSnapshotHash: Sha256 | null;
  sourceSectionId: string;
  sourceSectionTitle: string;
  bulletId: string | null;
  provenanceKind: ProvenanceKind;
  evidenceExcerpts: string[];
  normalizedConcepts: string[];
  extractedMetrics: string[];
  verificationStatus: ClaimVerificationStatus;
  userConfirmed: boolean;
  confirmationMeta?: {
    confirmedBy: string;
    confirmedAt: IsoDate;
    evidenceNote: string;
  };
}

export interface TailorSuggestion {
  id: string;
  severity: SuggestionSeverity;
  mode: TailorMode;
  sectionId: string;
  entryId?: string;
  bulletId?: string;
  title: string;
  rationale: string;
  originalText: string;
  proposedText: string;
  alternativeText?: string;
  needsMetricPrompt: boolean;
  metricQuestion?: string;
  linkedRequirementText?: string;
  evidenceClass: ClaimVerificationStatus;
  evidenceExcerpts: string[];
  provenanceKind: ProvenanceKind;
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
  truthGatePassed: boolean;
  truthGateIssues: string[];
}

export interface RequirementAssessment {
  id: string;
  requirementText: string;
  priority: 'required' | 'preferred' | 'compound';
  logicalOperator?: 'AND' | 'OR';
  status: RequirementEvidenceStatus;
  supportingExcerpts: string[];
  recommendation: string;
}

export interface ValidationFinding {
  id: string;
  category: 'factual' | 'content' | 'role_jd' | 'document';
  severity: 'blocking' | 'warning' | 'recommendation';
  message: string;
  sectionTitle?: string;
}

export interface ValidationReport {
  blockingIssues: ValidationFinding[];
  warnings: ValidationFinding[];
  recommendations: ValidationFinding[];
  passedChecks: string[];
  factualPassed: boolean;
  documentPassed: boolean;
  roleAlignmentReady: boolean;
}

export interface UserConfirmedEvidenceRecord {
  id: string;
  factText: string;
  evidenceNote: string;
  targetSkillOrMetric: string;
  confirmedBy: string;
  confirmedAt: IsoDate;
  appliedToBulletId?: string;
}

export interface CandidateOwnedProjectRecord {
  id: string;
  linkedBriefId?: string;
  title: string;
  candidateContribution: string;
  technologiesUsed: string[];
  completionStatus: 'completed' | 'in_progress' | 'partial_contributor';
  coContributors?: string;
  evidenceNote: string;
  sourceProvenance: 'personal_project' | 'academic_project' | 'open_source';
  confirmedByCandidate: boolean;
  confirmedAt: IsoDate;
}

export interface LaunchFocusContext {
  mode: 'full_tailor' | 'add_gap' | 'upgrade_bullet' | 'skill_bullet';
  focusSkill: string | null;
  selectedBullet: string | null;
  selectedSection: string | null;
  findingIds: string[];
  evidenceIds: string[];
}

export interface TailorWorkspaceSession {
  sessionId: Uuid;
  title: string;
  mode: TailorMode;
  draftStatus: DraftLifecycleStatus;
  entrySource: TailorEntryPoint | 'upload' | 'paste' | 'resumed_draft';

  // Source Resume Identity
  workspaceId: Uuid | null;
  parentVersionId: Uuid | null;
  sourceSnapshotHash: Sha256 | null;
  resumeLabel: string;

  // Connected Tool Identities
  launchId: Uuid | null;
  dualJdComparisonId: Uuid | null;
  sourceAuditId: Uuid | null;
  talentLensAssessmentId: Uuid | null;
  demonstratedEvidenceLabels: string[];
  missingQualificationLabels: string[];

  // Target Context (Modes 2 & 3)
  targetKey: string | null;
  targetRole: string;
  targetIndustry: string;
  targetSeniority: string;
  targetMarket: string;
  jdId: string | null;
  jdTitle: string;
  jdCompany: string;
  jdText: string;
  jdSnapshotHash: Sha256 | null;

  // Intelligence & Working Document
  document: StructuredResumeDocument;
  atomicClaims: AtomicClaim[];
  strategyPlan: string[];
  requirements: RequirementAssessment[];
  suggestions: TailorSuggestion[];
  userConfirmations: UserConfirmedEvidenceRecord[];
  linkedProjectIds: string[];
  plannedProjectBriefIds?: string[];
  ownedProjects?: CandidateOwnedProjectRecord[];
  launchFocus?: LaunchFocusContext | null;
  validationReport: ValidationReport | null;

  // Undo/Redo Document History
  undoStack: StructuredResumeDocument[];
  redoStack: StructuredResumeDocument[];

  // Committed Outputs & Closed-Loop ATS Re-Analysis
  committedVersionId: Uuid | null;
  committedSnapshotHash: Sha256 | null;
  reanalysisAuditId: Uuid | null;
  reanalysisIsDraftSnapshot?: boolean;
  baselineScore: number | null;
  reanalysisScore: number | null;

  // Cloud / Transient Persistence State
  cloudSyncStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'demo_ephemeral';
  cloudSyncError?: string | null;
  syncRevision?: number;
  lastSavedRevision?: number;

  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface LayoutPresetMeta {
  id: TailorLayoutId;
  name: string;
  audience: string;
  description: string;
}

export const TAILOR_LAYOUT_PRESETS: readonly LayoutPresetMeta[] = [
  {
    id: 'ats_single',
    name: 'ATS Single-Column',
    audience: 'Broad industry & automated parsers',
    description: 'Clean single-column chronology with standard headings and high parser extraction fidelity.',
  },
  {
    id: 'executive',
    name: 'Executive Brief',
    audience: 'Senior, Lead, Staff & Management',
    description: 'Opens with an outcome-focused executive profile and clear scope/ownership headers.',
  },
  {
    id: 'technical',
    name: 'Technical & Engineering',
    audience: 'Software, Data, AI & Cybersecurity',
    description: 'Highlights core architecture stacks, verified project evidence, and technical capabilities cleanly.',
  },
  {
    id: 'academic_research',
    name: 'Academic & Research',
    audience: 'Research, Publications & Fellowships',
    description: 'Foregrounds education, publications, research methodology, and peer-reviewed work.',
  },
  {
    id: 'graduate_concise',
    name: 'Student & Early-Career',
    audience: 'Students, Interns & Fresh Graduates',
    description: 'Prioritizes education, internships, academic capstones, and foundational skills cleanly.',
  },
];
