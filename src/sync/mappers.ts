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
  const cleanSlots: Record<string, unknown> = { ...(o.slots || {}) };
  cleanSlots.__v3Meta = {
    person: o.person,
    company: o.company,
    targetRole: o.targetRole,
    intent: o.intent,
    relationship: o.relationship,
    subject: o.subject,
    message: o.message,
    sentAt: o.sentAt ?? null,
    followUpDueAt: o.followUpDueAt ?? null,
    parentDraftId: o.parentDraftId ?? null,
    isIncomplete: Boolean(o.isIncomplete),
    slotsSnapshot: o.slotsSnapshot,
  };
  return {
    id: o.id,
    template_id: o.templateId,
    channel: o.channel,
    status: o.status,
    slots: cleanSlots,
    rendered_text: o.renderedText,
    target_key: o.targetKey || null,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

export function rowToOutreach(r: OutreachDraftRow): OutreachDraft {
  const rawSlots = ((r.slots as Record<string, unknown>) || {});
  const v3Meta = (rawSlots.__v3Meta as Record<string, unknown> | undefined) || {};
  const cleanSlots: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSlots)) {
    if (k !== '__v3Meta' && typeof v === 'string') {
      cleanSlots[k] = v;
    }
  }
  const derivedSubject =
    typeof v3Meta.subject === 'string' ? v3Meta.subject : undefined;
  const derivedMessage =
    typeof v3Meta.message === 'string'
      ? v3Meta.message
      : r.rendered_text.replace(/^Subject:\s*[^\r\n]+\r?\n\r?\n/, '');
  return {
    id: r.id,
    templateId: r.template_id,
    channel: r.channel,
    status: r.status,
    slots: cleanSlots,
    renderedText: r.rendered_text,
    targetKey: r.target_key || undefined,
    person: typeof v3Meta.person === 'string' ? v3Meta.person : cleanSlots.person,
    company: typeof v3Meta.company === 'string' ? v3Meta.company : cleanSlots.company,
    targetRole: typeof v3Meta.targetRole === 'string' ? v3Meta.targetRole : undefined,
    intent: v3Meta.intent as OutreachDraft['intent'],
    relationship: typeof v3Meta.relationship === 'string' ? v3Meta.relationship : undefined,
    subject: derivedSubject,
    message: derivedMessage,
    sentAt: typeof v3Meta.sentAt === 'string' ? v3Meta.sentAt : null,
    followUpDueAt: typeof v3Meta.followUpDueAt === 'string' ? v3Meta.followUpDueAt : null,
    parentDraftId: typeof v3Meta.parentDraftId === 'string' ? v3Meta.parentDraftId : null,
    isIncomplete: typeof v3Meta.isIncomplete === 'boolean' ? v3Meta.isIncomplete : false,
    slotsSnapshot: v3Meta.slotsSnapshot as OutreachDraft['slotsSnapshot'],
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

// Phase 11.1 Tailor Sessions, Changes, and Export Artifacts (Migration 0004)
import type {
  CandidateOwnedProjectRecord,
  DraftLifecycleStatus,
  LaunchFocusContext,
  StructuredResumeDocument,
  TailorLayoutId,
  TailorMode,
  TailorSuggestion,
  TailorWorkspaceSession,
  UserConfirmedEvidenceRecord,
} from '@/features/tailor/model/tailorWorkspaceTypes';
import type { ExportArtifactContract } from '@/domain/sharedAssetContracts';

export interface TailoringSessionRow {
  id: string;
  title: string;
  mode: TailorMode;
  draft_status: DraftLifecycleStatus;
  entry_source: string;
  workspace_id: string | null;
  parent_version_id: string | null;
  source_snapshot_hash: string | null;
  produced_version_id: string | null;
  produced_snapshot_hash: string | null;
  source_audit_id: string | null;
  reanalysis_audit_id: string | null;
  talentlens_assessment_id: string | null;
  dual_jd_comparison_id: string | null;
  target_role: string;
  target_industry: string;
  target_seniority: string;
  jd_title: string;
  jd_company: string;
  jd_snapshot_hash: string | null;
  layout_id: TailorLayoutId;
  document_state: unknown;
  user_confirmations: unknown;
  baseline_score: number | null;
  reanalysis_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface TailoringChangeRow {
  id: string;
  session_id: string;
  section_id: string;
  bullet_id: string | null;
  original_text: string;
  proposed_text: string;
  provenance_kind: string;
  evidence_class: string;
  truth_gate_passed: boolean;
  status: TailorSuggestion['status'];
  created_at: string;
  updated_at: string;
}

export interface ExportArtifactRow {
  id: string;
  session_id: string | null;
  source_version_id: string | null;
  source_audit_id: string | null;
  format: ExportArtifactContract['format'];
  file_name: string;
  byte_size: number;
  created_at: string;
}

interface DocumentStateEnvelope {
  document: StructuredResumeDocument;
  sessionMeta?: {
    resumeLabel?: string;
    targetMarket?: string;
    targetKey?: string | null;
    jdId?: string | null;
    demonstratedEvidenceLabels?: string[];
    missingQualificationLabels?: string[];
    linkedProjectIds?: string[];
    plannedProjectBriefIds?: string[];
    ownedProjects?: CandidateOwnedProjectRecord[];
    launchFocus?: LaunchFocusContext | null;
    reanalysisIsDraftSnapshot?: boolean;
  };
}

export function tailoringSessionToRow(s: TailorWorkspaceSession): TailoringSessionRow {
  const envelope: DocumentStateEnvelope = {
    document: s.document,
    sessionMeta: {
      resumeLabel: s.resumeLabel,
      targetMarket: s.targetMarket,
      targetKey: s.targetKey,
      jdId: s.jdId,
      demonstratedEvidenceLabels: s.demonstratedEvidenceLabels,
      missingQualificationLabels: s.missingQualificationLabels,
      linkedProjectIds: s.linkedProjectIds,
      plannedProjectBriefIds: s.plannedProjectBriefIds ?? [],
      ownedProjects: s.ownedProjects ?? [],
      launchFocus: s.launchFocus ?? null,
      reanalysisIsDraftSnapshot: s.reanalysisIsDraftSnapshot ?? false,
    },
  };
  return {
    id: s.sessionId,
    title: s.title.slice(0, 200),
    mode: s.mode,
    draft_status: s.draftStatus,
    entry_source: s.entrySource,
    workspace_id: s.workspaceId,
    parent_version_id: s.parentVersionId,
    source_snapshot_hash: s.sourceSnapshotHash,
    produced_version_id: s.committedVersionId,
    produced_snapshot_hash: s.committedSnapshotHash,
    source_audit_id: s.sourceAuditId,
    reanalysis_audit_id: s.reanalysisAuditId,
    talentlens_assessment_id: s.talentLensAssessmentId,
    dual_jd_comparison_id: s.dualJdComparisonId,
    target_role: s.targetRole.slice(0, 160),
    target_industry: s.targetIndustry.slice(0, 120),
    target_seniority: s.targetSeniority.slice(0, 80),
    jd_title: s.jdTitle.slice(0, 200),
    jd_company: s.jdCompany.slice(0, 160),
    jd_snapshot_hash: s.jdSnapshotHash,
    layout_id: s.document.layoutId,
    document_state: envelope,
    user_confirmations: s.userConfirmations,
    baseline_score: s.baselineScore,
    reanalysis_score: s.reanalysisScore,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

export function rowToTailoringSession(
  r: TailoringSessionRow,
  resolvedJdText = '',
  changes: TailoringChangeRow[] = []
): TailorWorkspaceSession {
  const rawEnvelope = (r.document_state || {}) as Partial<DocumentStateEnvelope> & Partial<StructuredResumeDocument>;
  const doc: StructuredResumeDocument = rawEnvelope.document
    ? rawEnvelope.document
    : ({
        candidateName: (rawEnvelope as StructuredResumeDocument).candidateName || 'Candidate',
        contact: (rawEnvelope as StructuredResumeDocument).contact || {},
        layoutId: r.layout_id || 'ats_single',
        paperSize: (rawEnvelope as StructuredResumeDocument).paperSize || 'a4',
        rawSourceText: (rawEnvelope as StructuredResumeDocument).rawSourceText || '',
        sections: (rawEnvelope as StructuredResumeDocument).sections || [],
      } as StructuredResumeDocument);
  const meta = rawEnvelope.sessionMeta ?? {};
  const confirmations = Array.isArray(r.user_confirmations)
    ? (r.user_confirmations as UserConfirmedEvidenceRecord[])
    : [];

  return {
    sessionId: r.id,
    title: r.title,
    mode: r.mode,
    draftStatus: r.draft_status,
    entrySource: r.entry_source as TailorWorkspaceSession['entrySource'],
    workspaceId: r.workspace_id,
    parentVersionId: r.parent_version_id,
    sourceSnapshotHash: r.source_snapshot_hash,
    resumeLabel: meta.resumeLabel || r.title,
    launchId: null,
    dualJdComparisonId: r.dual_jd_comparison_id,
    sourceAuditId: r.source_audit_id,
    talentLensAssessmentId: r.talentlens_assessment_id,
    demonstratedEvidenceLabels: meta.demonstratedEvidenceLabels ?? [],
    missingQualificationLabels: meta.missingQualificationLabels ?? [],
    targetKey: meta.targetKey ?? null,
    targetRole: r.target_role || '',
    targetIndustry: r.target_industry || '',
    targetSeniority: r.target_seniority || '',
    targetMarket: meta.targetMarket || '',
    jdId: meta.jdId ?? null,
    jdTitle: r.jd_title || '',
    jdCompany: r.jd_company || '',
    jdText: resolvedJdText,
    jdSnapshotHash: r.jd_snapshot_hash,
    document: doc,
    atomicClaims: [],
    strategyPlan: [],
    requirements: [],
    suggestions: changes.map((c) => ({
      id: c.id,
      severity: 'important',
      mode: r.mode,
      sectionId: c.section_id,
      bulletId: c.bullet_id ?? undefined,
      title: 'Restored tailoring change',
      rationale: 'Restored from cloud tailoring ledger.',
      originalText: c.original_text,
      proposedText: c.proposed_text,
      needsMetricPrompt: false,
      evidenceClass: c.evidence_class as TailorSuggestion['evidenceClass'],
      evidenceExcerpts: [c.original_text],
      provenanceKind: c.provenance_kind as TailorSuggestion['provenanceKind'],
      status: c.status,
      truthGatePassed: c.truth_gate_passed,
      truthGateIssues: [],
    })),
    userConfirmations: confirmations,
    linkedProjectIds: meta.linkedProjectIds ?? [],
    plannedProjectBriefIds: meta.plannedProjectBriefIds ?? [],
    ownedProjects: meta.ownedProjects ?? [],
    launchFocus: meta.launchFocus ?? null,
    validationReport: null,
    undoStack: [],
    redoStack: [],
    committedVersionId: r.produced_version_id,
    committedSnapshotHash: r.produced_snapshot_hash,
    reanalysisAuditId: r.reanalysis_audit_id,
    reanalysisIsDraftSnapshot: meta.reanalysisIsDraftSnapshot ?? false,
    baselineScore: r.baseline_score,
    reanalysisScore: r.reanalysis_score,
    cloudSyncStatus: 'saved',
    cloudSyncError: null,
    syncRevision: 1,
    createdAt: toIso(r.created_at),
    updatedAt: toIso(r.updated_at),
  };
}

export function tailoringChangeToRow(sessionId: string, s: TailorSuggestion, nowIso: string): TailoringChangeRow {
  return {
    id: s.id,
    session_id: sessionId,
    section_id: s.sectionId.slice(0, 80),
    bullet_id: s.bulletId ? s.bulletId.slice(0, 80) : null,
    original_text: s.originalText.slice(0, 2000),
    proposed_text: s.proposedText.slice(0, 2000),
    provenance_kind: s.provenanceKind.slice(0, 40),
    evidence_class: s.evidenceClass,
    truth_gate_passed: Boolean(s.truthGatePassed),
    status: s.status,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function exportArtifactToRow(
  a: ExportArtifactContract,
  sessionId: string | null
): ExportArtifactRow {
  return {
    id: a.artifactId,
    session_id: sessionId,
    source_version_id: a.sourceVersionId ?? null,
    source_audit_id: a.sourceAuditId ?? null,
    format: a.format,
    file_name: a.fileName.slice(0, 255),
    byte_size: Math.min(5242880, Math.max(0, Math.round(a.byteSize))),
    created_at: a.createdAt,
  };
}

export function rowToExportArtifact(r: ExportArtifactRow): ExportArtifactContract {
  return {
    artifactId: r.id,
    format: r.format,
    fileName: r.file_name,
    sourceAuditId: r.source_audit_id,
    sourceVersionId: r.source_version_id,
    byteSize: r.byte_size,
    createdAt: toIso(r.created_at),
  };
}
