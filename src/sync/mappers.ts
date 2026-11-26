import type {
  AuditEntry,
  TextSnapshot,
  ResumeWorkspace,
  ResumeVersion,
  JournalEvent,
  WatchlistTarget,
  PlanItem,
  OutreachDraft,
  GapStatus,
  CandidateProfile,
  UserSettings,
} from '@/domain/types';
import type { SavedJD, FeedbackItem } from '@/types/schemas-v4';

/** Postgres timestamptz comes back as `...+00:00`. Always normalize to canonical ISO (`...Z`) so string ordering stays valid. */
export const toIso = (v: string): string => new Date(v).toISOString();

export interface AuditRow {
  id: string;
  kind: string;
  created_at: string;
  engine_version: string;
  run_key: string;
  target_key: string;
  resume_workspace_id: string | null;
  resume_version_id: string | null;
  resume_snapshot_hash: string;
  resume_label: string;
  jd_snapshot_hash: string;
  jd_meta: unknown;
  overall_score: number;
  breakdown: unknown;
  gaps: unknown;
  strengths: unknown;
  evidence: unknown;
  findings: unknown;
  delta: unknown;
}

export function auditToRow(e: AuditEntry): AuditRow {
  return {
    id: e.id,
    kind: e.kind,
    created_at: e.createdAt,
    engine_version: e.engineVersion,
    run_key: e.runKey,
    target_key: e.targetKey,
    resume_workspace_id: e.resume.workspaceId,
    resume_version_id: e.resume.versionId,
    resume_snapshot_hash: e.resume.snapshotHash,
    resume_label: e.resume.label,
    jd_snapshot_hash: e.jd.snapshotHash,
    jd_meta: e.jd,
    overall_score: e.overallScore,
    breakdown: e.breakdown,
    gaps: e.gaps,
    strengths: e.strengths,
    evidence: e.evidence,
    findings: e.findingsJson,
    delta: e.delta,
  };
}

export function rowToAudit(r: AuditRow): AuditEntry {
  return {
    schemaVersion: 1,
    id: r.id,
    kind: r.kind as AuditEntry['kind'],
    createdAt: toIso(r.created_at),
    engineVersion: r.engine_version,
    runKey: r.run_key,
    targetKey: r.target_key,
    resume: {
      workspaceId: r.resume_workspace_id,
      versionId: r.resume_version_id,
      snapshotHash: r.resume_snapshot_hash,
      label: r.resume_label,
    },
    jd: r.jd_meta as AuditEntry['jd'],
    overallScore: r.overall_score,
    breakdown: r.breakdown as AuditEntry['breakdown'],
    gaps: r.gaps as AuditEntry['gaps'],
    strengths: r.strengths as string[],
    evidence: r.evidence as AuditEntry['evidence'],
    findingsJson: r.findings,
    delta: r.delta as AuditEntry['delta'],
  };
}

// Text Snapshots
export interface TextSnapshotRow {
  hash: string;
  body: string;
  char_count: number;
  word_count: number;
  created_at: string;
}

export function snapshotToRow(s: TextSnapshot): TextSnapshotRow {
  return {
    hash: s.hash,
    body: s.text,
    char_count: s.charCount,
    word_count: s.wordCount,
    created_at: s.createdAt,
  };
}

export function rowToSnapshot(r: TextSnapshotRow): TextSnapshot {
  return {
    hash: r.hash,
    text: r.body,
    charCount: r.char_count,
    wordCount: r.word_count,
    createdAt: toIso(r.created_at),
  };
}

// Resume Workspaces
export interface ResumeWorkspaceRow {
  id: string;
  name: string;
  role_track: string;
  is_primary: boolean;
  head_version_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export function workspaceToRow(w: ResumeWorkspace): ResumeWorkspaceRow {
  return {
    id: w.id,
    name: w.name,
    role_track: w.roleTrack,
    is_primary: w.isPrimary,
    head_version_id: w.headVersionId,
    created_at: w.createdAt,
    updated_at: w.updatedAt,
    archived_at: w.archivedAt,
  };
}

export function rowToWorkspace(r: ResumeWorkspaceRow): ResumeWorkspace {
  return {
    id: r.id,
    name: r.name,
    roleTrack: r.role_track,
    isPrimary: r.is_primary,
    headVersionId: r.head_version_id,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    archivedAt: r.archived_at ? toIso(r.archived_at) : null,
  };
}

// Resume Versions
export interface ResumeVersionRow {
  id: string;
  workspace_id: string;
  parent_version_id: string | null;
  label: string;
  snapshot_hash: string;
  source: 'upload' | 'paste' | 'tailor' | 'branch' | 'manual_edit';
  note: string | null;
  source_file_name: string | null;
  created_at: string;
}

export function versionToRow(v: ResumeVersion): ResumeVersionRow {
  return {
    id: v.id,
    workspace_id: v.workspaceId,
    parent_version_id: v.parentVersionId,
    label: v.label,
    snapshot_hash: v.snapshotHash,
    source: v.source,
    note: v.note || null,
    source_file_name: v.sourceFileName || null,
    created_at: v.createdAt,
  };
}

export function rowToVersion(r: ResumeVersionRow): ResumeVersion {
  return {
    id: r.id,
    workspaceId: r.workspace_id,
    parentVersionId: r.parent_version_id,
    label: r.label,
    snapshotHash: r.snapshot_hash,
    source: r.source,
    note: r.note || undefined,
    sourceFileName: r.source_file_name || undefined,
    createdAt: toIso(r.created_at),
  };
}

// Journal Events
export interface JournalEventRow {
  id: string;
  type: string;
  created_at: string;
  target_key: string | null;
  ref_id: string | null;
  summary: string;
  payload: Record<string, string | number | boolean | null> | null;
}

export function eventToRow(e: JournalEvent): JournalEventRow {
  return {
    id: e.id,
    type: e.type,
    created_at: e.createdAt,
    target_key: e.targetKey || null,
    ref_id: e.refId || null,
    summary: e.summary,
    payload: e.payload || null,
  };
}

export function rowToEvent(r: JournalEventRow): JournalEvent {
  return {
    id: r.id,
    type: r.type as JournalEvent['type'],
    createdAt: toIso(r.created_at),
    targetKey: r.target_key || undefined,
    refId: r.ref_id || undefined,
    summary: r.summary,
    payload: r.payload || undefined,
  };
}

// Watchlist Targets
export interface WatchlistTargetRow {
  id: string;
  target_key: string;
  company_id: string | null;
  role_id: string | null;
  company_name: string;
  role_title: string | null;
  jd_snapshot_hash: string | null;
  added_at: string;
  archived_at: string | null;
  updated_at: string;
}

export function targetToRow(t: WatchlistTarget & { updatedAt?: string }): WatchlistTargetRow {
  return {
    id: t.id,
    target_key: t.targetKey,
    company_id: t.companyId || null,
    role_id: t.roleId || null,
    company_name: t.companyName,
    role_title: t.roleTitle || null,
    jd_snapshot_hash: t.jdSnapshotHash || null,
    added_at: t.addedAt,
    archived_at: t.archivedAt,
    updated_at: t.updatedAt || t.addedAt,
  };
}

export function rowToTarget(r: WatchlistTargetRow): WatchlistTarget {
  return {
    id: r.id,
    targetKey: r.target_key,
    companyId: r.company_id || undefined,
    roleId: r.role_id || undefined,
    companyName: r.company_name,
    roleTitle: r.role_title || undefined,
    jdSnapshotHash: r.jd_snapshot_hash || undefined,
    addedAt: toIso(r.added_at),
    archivedAt: r.archived_at ? toIso(r.archived_at) : null,
  };
}

// Plan Items
export interface PlanItemRow {
  id: string;
  kind: 'build_brief' | 'credential';
  ref_id: string;
  title: string;
  status: 'planned' | 'in_progress' | 'done';
  linked_gap_ids: unknown;
  target_key: string | null;
  added_from_audit_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function planItemToRow(p: PlanItem): PlanItemRow {
  return {
    id: p.id,
    kind: p.kind,
    ref_id: p.refId,
    title: p.title,
    status: p.status,
    linked_gap_ids: p.linkedGapIds,
    target_key: p.targetKey || null,
    added_from_audit_id: p.addedFromAuditId,
    note: p.note || null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    completed_at: p.completedAt,
  };
}

export function rowToPlanItem(r: PlanItemRow): PlanItem {
  return {
    id: r.id,
    kind: r.kind,
    refId: r.ref_id,
    title: r.title,
    status: r.status,
    linkedGapIds: (r.linked_gap_ids as string[]) || [],
    targetKey: r.target_key || undefined,
    addedFromAuditId: r.added_from_audit_id,
    note: r.note || undefined,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
    completedAt: r.completed_at ? toIso(r.completed_at) : null,
  };
}

// Outreach Drafts
export interface OutreachDraftRow {
  id: string;
  template_id: string;
  channel: string;
  status: 'draft' | 'sent' | 'replied' | 'archived';
  slots: unknown;
  rendered_text: string;
  target_key: string | null;
  created_at: string;
  updated_at: string;
}

export function outreachToRow(o: OutreachDraft): OutreachDraftRow {
  return {
    id: o.id,
    template_id: o.templateId,
    channel: o.channel,
    status: o.status,
    slots: o.slots,
    rendered_text: o.renderedText,
    target_key: o.targetKey || null,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

export function rowToOutreach(r: OutreachDraftRow): OutreachDraft {
  return {
    id: r.id,
    templateId: r.template_id,
    channel: r.channel,
    status: r.status,
    slots: (r.slots as Record<string, string>) || {},
    renderedText: r.rendered_text,
    targetKey: r.target_key || undefined,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

// Gap Status
export interface GapStatusRecord {
  targetKey: string;
  gapId: string;
  status: GapStatus;
  planItemId?: string | null;
  stillDetected?: boolean;
  updatedAt: string;
}

export interface GapStatusRow {
  target_key: string;
  gap_id: string;
  status: 'open' | 'addressed_pending_rescan' | 'resolved';
  plan_item_id: string | null;
  still_detected: boolean;
  updated_at: string;
}

export function gapStatusToRow(g: GapStatusRecord): GapStatusRow {
  return {
    target_key: g.targetKey,
    gap_id: g.gapId,
    status: g.status,
    plan_item_id: g.planItemId || null,
    still_detected: Boolean(g.stillDetected),
    updated_at: g.updatedAt,
  };
}

export function rowToGapStatus(r: GapStatusRow): GapStatusRecord {
  return {
    targetKey: r.target_key,
    gapId: r.gap_id,
    status: r.status,
    planItemId: r.plan_item_id || undefined,
    stillDetected: r.still_detected,
    updatedAt: toIso(r.updated_at),
  };
}

// User Profiles
export interface UserProfileRecord {
  profile: CandidateProfile;
  settings: UserSettings;
  updatedAt: string;
}

export interface UserProfileRow {
  profile: unknown;
  settings: unknown;
  updated_at: string;
}

export function profileToRow(u: UserProfileRecord): UserProfileRow {
  return {
    profile: u.profile,
    settings: u.settings,
    updated_at: u.updatedAt,
  };
}

export function rowToProfile(r: UserProfileRow): UserProfileRecord {
  return {
    profile: r.profile as CandidateProfile,
    settings: r.settings as UserSettings,
    updatedAt: toIso(r.updated_at),
  };
}

// Saved JDs
export interface SavedJdRow {
  id: string;
  title: string;
  company: string | null;
  source: 'pasted' | 'talentlens' | 'upload';
  text_body: string;
  text_hash: string;
  tags: unknown;
  added_at: string;
  updated_at: string;
}

export function savedJdToRow(j: SavedJD): SavedJdRow {
  return {
    id: j.id,
    title: j.title,
    company: j.company ?? null,
    source: j.source,
    text_body: j.text,
    text_hash: j.textHash,
    tags: j.tags,
    added_at: j.addedAt,
    updated_at: j.updatedAt,
  };
}

export function rowToSavedJd(r: SavedJdRow): SavedJD {
  return {
    id: r.id,
    title: r.title,
    company: r.company ?? null,
    source: r.source,
    text: r.text_body,
    textHash: r.text_hash,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    addedAt: toIso(r.added_at),
    updatedAt: toIso(r.updated_at),
  };
}

// Private User Documents Catalog
export type UserDocumentKind =
  | 'resume_upload'
  | 'jd_upload'
  | 'exported_pdf'
  | 'exported_docx'
  | 'exported_md';

export interface UserDocumentRecord {
  id: string;
  docKind: UserDocumentKind;
  workspaceId: string | null;
  versionId: string | null;
  auditId: string | null;
  storageBucket: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocumentRow {
  id: string;
  doc_kind: UserDocumentKind;
  workspace_id: string | null;
  version_id: string | null;
  audit_id: string | null;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  byte_size: number;
  sha256: string;
  created_at: string;
  updated_at: string;
}

export function userDocumentToRow(d: UserDocumentRecord): UserDocumentRow {
  return {
    id: d.id,
    doc_kind: d.docKind,
    workspace_id: d.workspaceId,
    version_id: d.versionId,
    audit_id: d.auditId,
    storage_bucket: d.storageBucket,
    storage_path: d.storagePath,
    file_name: d.fileName,
    mime_type: d.mimeType,
    byte_size: d.byteSize,
    sha256: d.sha256,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  };
}

export function rowToUserDocument(r: UserDocumentRow): UserDocumentRecord {
  return {
    id: r.id,
    docKind: r.doc_kind,
    workspaceId: r.workspace_id,
    versionId: r.version_id,
    auditId: r.audit_id,
    storageBucket: r.storage_bucket,
    storagePath: r.storage_path,
    fileName: r.file_name,
    mimeType: r.mime_type,
    byteSize: r.byte_size,
    sha256: r.sha256,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

// Feedback Items
export interface FeedbackItemRow {
  id: string;
  target_kind: string;
  rule_id: string;
  verdict: 'up' | 'down';
  note: string | null;
  audit_id: string | null;
  engine_version: string;
  created_at: string;
  updated_at: string;
}

export function feedbackToRow(f: FeedbackItem): FeedbackItemRow {
  return {
    id: f.id,
    target_kind: f.targetKind,
    rule_id: f.ruleId,
    verdict: f.verdict,
    note: f.note || null,
    audit_id: f.scanId || null,
    engine_version: f.engineVersion,
    created_at: f.createdAt,
    updated_at: f.createdAt,
  };
}

export function rowToFeedback(r: FeedbackItemRow): FeedbackItem {
  return {
    id: r.id,
    targetKind: r.target_kind,
    ruleId: r.rule_id,
    verdict: r.verdict,
    note: r.note || undefined,
    scanId: r.audit_id || undefined,
    engineVersion: r.engine_version,
    createdAt: toIso(r.created_at),
  };
}
