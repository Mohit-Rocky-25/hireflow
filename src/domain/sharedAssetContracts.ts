// ============================================================
// HireFlow — Phase 11.0 Shared User Asset Contracts
// Canonical type boundary unifying Resume Matrix, ATS Roaster,
// TalentLens, Dual-JD, Outreach, and future Tailor Studio.
// ============================================================

import type {
  AuditEntry,
  EvidenceSpan,
  Gap,
  IsoDate,
  Sha256,
  Uuid,
} from '@/domain/types';

export interface SharedResumeWorkspaceRef {
  workspaceId: Uuid;
  name: string;
  roleTrack: string;
  headVersionId: Uuid | null;
  isPrimary: boolean;
}

export interface SharedResumeVersionRef {
  versionId: Uuid;
  workspaceId: Uuid;
  parentVersionId: Uuid | null;
  snapshotHash: Sha256;
  label: string;
  createdAt: IsoDate;
}

export interface SharedSnapshotRef {
  hash: Sha256;
  charCount: number;
  wordCount: number;
  createdAt: IsoDate;
}

export interface SharedJdContextRef {
  jdId?: Uuid | null;
  snapshotHash: Sha256 | null;
  targetKey: string;
  title: string;
  company: string | null;
  origin: 'pasted' | 'uploaded' | 'preset' | 'talentlens' | 'saved_library';
}

export interface SharedAtsAnalysisRef {
  auditId: Uuid;
  kind: AuditEntry['kind'];
  overallScore: number;
  engineVersion: string;
  workspaceId: Uuid | null;
  versionId: Uuid | null;
  resumeSnapshotHash: Sha256;
  jdSnapshotHash: Sha256;
  targetKey: string;
  gaps: readonly Gap[];
  evidence: readonly EvidenceSpan[];
  createdAt: IsoDate;
}

export interface SharedTalentLensAssessmentRef {
  assessmentId: Uuid;
  companyId: string;
  companyName: string;
  roleId: string;
  roleTitle: string;
  overallScore: number;
  /** Strictly candidate-verified evidence matched in resume text. */
  demonstratedEvidence: readonly string[];
  /** Strictly missing or unverified qualifications (distinct from benchmark metadata). */
  missingQualifications: readonly string[];
  /** General role benchmark expectations (not candidate claims). */
  benchmarkExpectations: readonly string[];
  auditId: Uuid | null;
  createdAt: IsoDate;
}

export interface TailoringChangeContract {
  changeId: Uuid;
  section: string;
  targetBulletId?: string;
  originalText: string;
  proposedText: string;
  linkedGapIds: readonly string[];
  linkedEvidenceIds: readonly string[];
  accepted: boolean;
  truthGatePassed: boolean;
}

export interface TailoringSessionContract {
  sessionId: Uuid;
  sourceEntryPoint: 'resume_roaster' | 'talentlens' | 'dual_jd' | 'my_space' | 'resume_matrix' | 'direct';
  sourceWorkspaceId: Uuid | null;
  sourceVersionId: Uuid | null;
  sourceSnapshotHash: Sha256 | null;
  producedVersionId: Uuid | null;
  producedSnapshotHash: Sha256 | null;
  jdContext: SharedJdContextRef | null;
  sourceAuditId: Uuid | null;
  reanalysisAuditId: Uuid | null;
  dualJdComparisonId?: Uuid | null;
  changes: readonly TailoringChangeContract[];
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface ProjectEvidenceContract {
  briefId: string;
  title: string;
  targetKey?: string;
  linkedGapIds: readonly string[];
  verifiedMetrics: readonly string[];
  status: 'planned' | 'in_progress' | 'done';
}

export interface ExportArtifactContract {
  artifactId: Uuid;
  format: 'pdf' | 'docx' | 'md';
  fileName: string;
  sourceAuditId?: Uuid | null;
  sourceVersionId?: Uuid | null;
  byteSize: number;
  createdAt: IsoDate;
}

/**
 * Interface boundary for the upcoming unified Tailor My Resume workspace.
 * Future Tailor UI must consume this contract without changing canonical 7D ATS scoring.
 */
export interface TailorWorkspaceControllerContract {
  hydrateFromLaunchContext: (launchId: string) => Promise<boolean>;
  commitTailoredVersion: (label: string) => Promise<SharedResumeVersionRef>;
  runCanonicalReanalysis: () => Promise<SharedAtsAnalysisRef>;
}
