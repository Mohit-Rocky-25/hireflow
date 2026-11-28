export type Sha256 = string;
export type Uuid = string;
export type IsoDate = string;

export interface TextSnapshot {
  hash: Sha256;
  text: string;
  charCount: number;
  wordCount: number;
  createdAt: IsoDate;
}

export type JdOrigin = 'pasted' | 'uploaded' | 'talentlens';

export interface JdMeta {
  snapshotHash: Sha256;
  origin: JdOrigin;
  company?: string;
  roleTitle?: string;
  companyId?: string;
  roleId?: string;
  datasetVersion?: string;
}

export type ToolKind = 'ats_roast' | 'talentlens' | 'jd_compare' | 'tailor';
export type GapCategory = 'skill' | 'keyword' | 'impact' | 'format' | 'experience' | 'education' | 'other';

export interface Gap {
  id: string;
  category: GapCategory;
  label: string;
  severity: 1 | 2 | 3;
  detail?: string;
}

export type GapStatus = 'open' | 'addressed_pending_rescan' | 'resolved';
export interface GapOverlayEntry {
  status: GapStatus;
  planItemId?: Uuid;
  stillDetected?: boolean;
  updatedAt: IsoDate;
}
export type GapOverlay = Readonly<Record<string, GapOverlayEntry>>;

export type EvidenceKind = 'match' | 'weak' | 'missing_context' | 'format_issue';
export interface EvidenceSpan {
  start: number;
  end: number;
  findingId: string;
  kind: EvidenceKind;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  score: number;
  weight?: number;
}

export interface AuditDelta {
  baselineAuditId: Uuid;
  baselineCreatedAt: IsoDate;
  overallDeltaPts: number;
  breakdownDeltaPts: Record<string, number>;
  resolvedGapIds: string[];
  newGapIds: string[];
  persistedGapIds: string[];
}

export interface AuditEntry {
  schemaVersion: 1;
  id: Uuid;
  kind: ToolKind;
  createdAt: IsoDate;
  engineVersion: string;
  runKey: Sha256;
  targetKey: string;
  resume: { workspaceId: Uuid | null; versionId: Uuid | null; snapshotHash: Sha256; label: string };
  jd: JdMeta;
  overallScore: number;
  breakdown: ScoreBreakdownItem[];
  gaps: Gap[];
  strengths: string[];
  evidence: EvidenceSpan[];
  findingsJson: unknown;
  delta: AuditDelta | null;
}

export type PlanKind = 'build_brief' | 'credential';
export type PlanStatus = 'planned' | 'in_progress' | 'done';
export interface PlanItem {
  id: Uuid;
  kind: PlanKind;
  refId: string;
  title: string;
  status: PlanStatus;
  linkedGapIds: string[];
  targetKey?: string;
  addedFromAuditId: Uuid | null;
  note?: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
  completedAt: IsoDate | null;
}

export interface WatchlistTarget {
  id: Uuid;
  targetKey: string;
  companyId?: string;
  roleId?: string;
  companyName: string;
  roleTitle?: string;
  jdSnapshotHash?: Sha256;
  addedAt: IsoDate;
  archivedAt: IsoDate | null;
}

export type JournalEventType =
  | 'resume_version_created' | 'plan_item_added' | 'plan_item_status_changed'
  | 'outreach_saved' | 'watchlist_added' | 'watchlist_removed' | 'offer_evaluated' | 'profile_updated';

export interface JournalEvent {
  id: Uuid;
  type: JournalEventType;
  createdAt: IsoDate;
  targetKey?: string;
  refId?: string;
  summary: string;
  payload?: Record<string, string | number | boolean | null>;
}

// Resume Matrix
export interface ResumeWorkspace {
  id: Uuid;
  name: string;
  roleTrack: string;
  isPrimary: boolean;
  headVersionId: Uuid | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
  archivedAt: IsoDate | null;
}

export type VersionSource = 'upload' | 'paste' | 'tailor' | 'branch' | 'manual_edit';

export interface ResumeVersion {
  id: Uuid;
  workspaceId: Uuid;
  parentVersionId: Uuid | null;
  label: string;
  snapshotHash: Sha256;
  source: VersionSource;
  note?: string;
  sourceFileName?: string;
  createdAt: IsoDate;
}

// Outreach vault
export type OutreachStatus = 'draft' | 'sent' | 'replied' | 'archived';

export type OutreachIntent =
  | 'introduction'
  | 'referral_ask'
  | 'advice'
  | 'role_pitch'
  | 'work_share'
  | 'follow_up'
  | 'thank_you'
  | 'event_connect';

export interface OutreachSlotsSnapshot {
  slots: Record<string, string>;
  candidateSourceLabel?: string;
  candidateSourceKind?: 'profile' | 'resume_matrix' | 'tailor' | 'manual' | 'sample';
  targetSourceLabel?: string;
  targetSourceKind?: 'saved_jd' | 'watchlist' | 'saved_role' | 'manual' | 'sample';
  provenanceNotes?: string[];
}

export interface OutreachDraft {
  id: Uuid;
  templateId: string;
  channel: string;
  status: OutreachStatus;
  slots: Record<string, string>;
  renderedText: string;
  targetKey?: string;
  // Phase 13 V3 fields (backward-compatible)
  person?: string;
  company?: string;
  targetRole?: string;
  intent?: OutreachIntent;
  relationship?: string;
  subject?: string;
  message?: string;
  sentAt?: IsoDate | null;
  followUpDueAt?: IsoDate | null;
  parentDraftId?: Uuid | null;
  isIncomplete?: boolean;
  slotsSnapshot?: OutreachSlotsSnapshot;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

// Profile: single source of truth for identity-like data
export interface CandidateProfile {
  displayName: string;
  email?: string;
  avatarUrl?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  targetTier?: string;
  targetRoles: string[];
  links: { github?: string; linkedin?: string; portfolio?: string };
  activeWorkspaceId: Uuid | null;
  updatedAt: IsoDate;
}

export interface UserSettings {
  cloudSyncEnabled: boolean;
  consentRecordedAt: IsoDate | null;
}

