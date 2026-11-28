// ============================================================
// HireFlow — Centralized Cloud Data-Access Repository
// Single authoritative Postgres & Private Storage boundary.
// Fails loudly and wires retry callbacks — zero silent local fallback.
// ============================================================

import { getCloudGateway, type LegacyImportReceiptRow } from '@/sync/supabaseGateway';
import {
  auditToRow,
  rowToAudit,
  snapshotToRow,
  rowToSnapshot,
  workspaceToRow,
  rowToWorkspace,
  versionToRow,
  rowToVersion,
  eventToRow,
  rowToEvent,
  targetToRow,
  rowToTarget,
  planItemToRow,
  rowToPlanItem,
  outreachToRow,
  rowToOutreach,
  gapStatusToRow,
  rowToGapStatus,
  profileToRow,
  rowToProfile,
  savedJdToRow,
  rowToSavedJd,
  rowToUserDocument,
  feedbackToRow,
  rowToFeedback,
  tailoringSessionToRow,
  rowToTailoringSession,
  tailoringChangeToRow,
  exportArtifactToRow,
  rowToExportArtifact,
  type AuditRow,
  type TextSnapshotRow,
  type ResumeWorkspaceRow,
  type ResumeVersionRow,
  type JournalEventRow,
  type WatchlistTargetRow,
  type PlanItemRow,
  type OutreachDraftRow,
  type GapStatusRow,
  type UserProfileRow,
  type SavedJdRow,
  type UserDocumentRow,
  type FeedbackItemRow,
  type GapStatusRecord,
  type UserDocumentRecord,
  type TailoringSessionRow,
  type TailoringChangeRow,
  type ExportArtifactRow,
} from '@/sync/mappers';
import type {
  AuditEntry,
  TextSnapshot,
  ResumeWorkspace,
  ResumeVersion,
  JournalEvent,
  WatchlistTarget,
  PlanItem,
  OutreachDraft,
  GapOverlayEntry,
  CandidateProfile,
  UserSettings,
} from '@/domain/types';
import type { ExportArtifactContract } from '@/domain/sharedAssetContracts';
import type { TailorWorkspaceSession } from '@/features/tailor/model/tailorWorkspaceTypes';
import type { SavedJD, FeedbackItem } from '@/types/schemas-v4';
import {
  CloudAuthRequiredError,
  CloudNotConfiguredError,
  CloudReadFailedError,
  CloudWriteFailedError,
} from './errors';
import { useCloudSyncStore } from './useCloudSyncStore';

export interface HydratedCloudDataset {
  snapshots: Record<string, TextSnapshot>;
  workspaces: Record<string, ResumeWorkspace>;
  versions: Record<string, ResumeVersion>;
  audits: Record<string, AuditEntry>;
  events: Record<string, JournalEvent>;
  watchlist: Record<string, WatchlistTarget>;
  planItems: Record<string, PlanItem>;
  outreachDrafts: Record<string, OutreachDraft>;
  gapStatus: Record<string, GapOverlayEntry>;
  profileRecord: { profile: CandidateProfile; settings: UserSettings; updatedAt: string } | null;
  savedJds: SavedJD[];
  feedbackItems: FeedbackItem[];
  documents: UserDocumentRecord[];
  importReceipts: LegacyImportReceiptRow[];
  tailoringSessions: Record<string, TailorWorkspaceSession>;
  exportArtifacts: Record<string, ExportArtifactContract[]>;
}

// Pure in-memory session snapshot lookup cache (cleared unconditionally on sign-out / account switch).
// Not persisted to browser disk/localStorage/IndexedDB.
const memorySnapshotCache = new Map<string, TextSnapshot>();

export function cacheSnapshotInMemory(snapshot: TextSnapshot): void {
  memorySnapshotCache.set(snapshot.hash, snapshot);
}

export function clearMemorySnapshotCache(): void {
  memorySnapshotCache.clear();
}

export function getCachedSnapshotInMemory(hash: string): TextSnapshot | null {
  return memorySnapshotCache.get(hash) ?? null;
}

async function assertSessionOwnership(userId: string): Promise<void> {
  if (!userId) {
    throw new CloudAuthRequiredError();
  }
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }
  const activeUid = await gateway.getAuthenticatedUserId();
  if (!activeUid || activeUid !== userId) {
    throw new CloudAuthRequiredError('Active Supabase session missing or switched account.');
  }
}

async function executeCloudWrite<T>(
  label: string,
  fn: () => Promise<T>,
  retryOperation?: () => Promise<void>
): Promise<T> {
  const syncStore = useCloudSyncStore.getState();
  syncStore.setSaving();
  try {
    const res = await fn();
    syncStore.setSynced();
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : `Failed to save ${label} to cloud.`;
    const writeErr =
      err instanceof CloudAuthRequiredError || err instanceof CloudNotConfiguredError
        ? err
        : new CloudWriteFailedError(label, msg, err);

    syncStore.setError(
      label,
      writeErr.message,
      retryOperation ?? (async () => {
        await fn();
        useCloudSyncStore.getState().setSynced();
      })
    );
    throw writeErr;
  }
}

export const cloudRepository = {
  async loadAllUserData(userId: string): Promise<HydratedCloudDataset> {
    await assertSessionOwnership(userId);
    const gateway = getCloudGateway();
    useCloudSyncStore.getState().setHydrating(userId);

    try {
      const [
        profileRows,
        snapshotRows,
        workspaceRows,
        versionRows,
        auditRows,
        eventRows,
        targetRows,
        planRows,
        outreachRows,
        gapRows,
        savedJdRows,
        feedbackRows,
        documentRows,
        receiptRows,
        tailoringSessionRows,
        tailoringChangeRows,
        exportArtifactRows,
      ] = await Promise.all([
        gateway.selectRows<UserProfileRow>('user_profiles', { limit: 1 }),
        gateway.selectRows<TextSnapshotRow>('text_snapshots', { orderBy: 'created_at', ascending: false, limit: 250 }),
        gateway.selectRows<ResumeWorkspaceRow>('resume_workspaces', { orderBy: 'updated_at', ascending: false, limit: 100 }),
        gateway.selectRows<ResumeVersionRow>('resume_versions', { orderBy: 'created_at', ascending: true, limit: 500 }),
        gateway.selectRows<AuditRow>('audit_entries', { orderBy: 'created_at', ascending: false, limit: 250 }),
        gateway.selectRows<JournalEventRow>('journal_events', { orderBy: 'created_at', ascending: false, limit: 500 }),
        gateway.selectRows<WatchlistTargetRow>('watchlist_targets', { orderBy: 'updated_at', ascending: false, limit: 200 }),
        gateway.selectRows<PlanItemRow>('plan_items', { orderBy: 'updated_at', ascending: false, limit: 250 }),
        gateway.selectRows<OutreachDraftRow>('outreach_drafts', { orderBy: 'updated_at', ascending: false, limit: 250 }),
        gateway.selectRows<GapStatusRow>('gap_status', { orderBy: 'updated_at', ascending: false, limit: 1000 }),
        gateway.selectRows<SavedJdRow>('saved_jds', { orderBy: 'updated_at', ascending: false, limit: 100 }),
        gateway.selectRows<FeedbackItemRow>('feedback_items', { orderBy: 'updated_at', ascending: false, limit: 500 }),
        gateway.selectRows<UserDocumentRow>('user_documents', { orderBy: 'created_at', ascending: false, limit: 200 }),
        gateway.selectRows<LegacyImportReceiptRow>('legacy_import_receipts', { orderBy: 'imported_at', ascending: false, limit: 50 }),
        gateway.selectRows<TailoringSessionRow>('tailoring_sessions', { orderBy: 'updated_at', ascending: false, limit: 100 }),
        gateway.selectRows<TailoringChangeRow>('tailoring_changes', { orderBy: 'created_at', ascending: true, limit: 1000 }),
        gateway.selectRows<ExportArtifactRow>('export_artifacts', { orderBy: 'created_at', ascending: false, limit: 200 }),
      ]);

      const snapshots: Record<string, TextSnapshot> = {};
      for (const row of snapshotRows) {
        const snap = rowToSnapshot(row);
        snapshots[snap.hash] = snap;
        memorySnapshotCache.set(snap.hash, snap);
      }

      const workspaces: Record<string, ResumeWorkspace> = {};
      for (const r of workspaceRows) {
        const w = rowToWorkspace(r);
        workspaces[w.id] = w;
      }

      const versions: Record<string, ResumeVersion> = {};
      for (const r of versionRows) {
        const v = rowToVersion(r);
        versions[v.id] = v;
      }

      const audits: Record<string, AuditEntry> = {};
      for (const r of auditRows) {
        const a = rowToAudit(r);
        audits[a.id] = a;
      }

      const events: Record<string, JournalEvent> = {};
      for (const r of eventRows) {
        const ev = rowToEvent(r);
        events[ev.id] = ev;
      }

      const watchlist: Record<string, WatchlistTarget> = {};
      for (const r of targetRows) {
        const t = rowToTarget(r);
        watchlist[t.id] = t;
      }

      const planItems: Record<string, PlanItem> = {};
      for (const r of planRows) {
        const p = rowToPlanItem(r);
        planItems[p.id] = p;
      }

      const outreachDrafts: Record<string, OutreachDraft> = {};
      for (const r of outreachRows) {
        const d = rowToOutreach(r);
        outreachDrafts[d.id] = d;
      }

      const gapStatus: Record<string, GapOverlayEntry> = {};
      for (const r of gapRows) {
        const g = rowToGapStatus(r);
        gapStatus[`${g.targetKey}|${g.gapId}`] = {
          status: g.status,
          planItemId: g.planItemId ?? undefined,
          stillDetected: g.stillDetected,
          updatedAt: g.updatedAt,
        };
      }

      const changesBySession = new Map<string, TailoringChangeRow[]>();
      for (const ch of tailoringChangeRows) {
        const list = changesBySession.get(ch.session_id) ?? [];
        list.push(ch);
        changesBySession.set(ch.session_id, list);
      }

      const tailoringSessions: Record<string, TailorWorkspaceSession> = {};
      for (const sr of tailoringSessionRows) {
        const jdText = sr.jd_snapshot_hash ? snapshots[sr.jd_snapshot_hash]?.text ?? '' : '';
        const sessionObj = rowToTailoringSession(sr, jdText, changesBySession.get(sr.id) ?? []);
        tailoringSessions[sessionObj.sessionId] = sessionObj;
      }

      const exportArtifacts: Record<string, ExportArtifactContract[]> = {};
      for (const er of exportArtifactRows) {
        if (!er.session_id) continue;
        const list = exportArtifacts[er.session_id] ?? [];
        list.push(rowToExportArtifact(er));
        exportArtifacts[er.session_id] = list;
      }

      useCloudSyncStore.getState().setHydrated(userId);

      return {
        snapshots,
        workspaces,
        versions,
        audits,
        events,
        watchlist,
        planItems,
        outreachDrafts,
        gapStatus,
        profileRecord: profileRows[0] ? rowToProfile(profileRows[0]) : null,
        savedJds: savedJdRows.map(rowToSavedJd),
        feedbackItems: feedbackRows.map(rowToFeedback),
        documents: documentRows.map(rowToUserDocument),
        importReceipts: receiptRows,
        tailoringSessions,
        exportArtifacts,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load cloud records.';
      useCloudSyncStore.getState().setError('account hydration', msg, async () => {
        await cloudRepository.loadAllUserData(userId);
      });
      throw new CloudReadFailedError('account data', msg, err);
    }
  },

  async fetchSnapshot(hash: string, userId?: string | null): Promise<TextSnapshot | null> {
    const cached = memorySnapshotCache.get(hash);
    if (cached) return cached;
    if (!userId) return null;

    const gateway = getCloudGateway();
    if (!gateway.isConfigured()) return null;

    try {
      const rows = await gateway.selectRows<TextSnapshotRow>('text_snapshots', {
        eq: { hash },
        limit: 1,
      });
      if (!rows[0]) return null;
      const snap = rowToSnapshot(rows[0]);
      memorySnapshotCache.set(snap.hash, snap);
      return snap;
    } catch {
      return null;
    }
  },

  async saveProfile(
    userId: string,
    profile: CandidateProfile,
    settings: UserSettings,
    updatedAt = new Date().toISOString()
  ): Promise<void> {
    await executeCloudWrite('profile and settings', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'user_profiles',
        [{ user_id: userId, ...profileToRow({ profile, settings, updatedAt }) }],
        { onConflict: 'user_id' }
      );
    });
  },

  async saveWorkspaceWithVersion(
    userId: string,
    workspace: ResumeWorkspace,
    version: ResumeVersion,
    snapshot: TextSnapshot
  ): Promise<void> {
    await executeCloudWrite(`resume workspace "${workspace.name}"`, async () => {
      await assertSessionOwnership(userId);
      const gateway = getCloudGateway();
      await gateway.upsertRows(
        'text_snapshots',
        [snapshotToRow(snapshot) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,hash', ignoreDuplicates: true }
      );
      await gateway.upsertRows(
        'resume_workspaces',
        [workspaceToRow(workspace) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
      await gateway.upsertRows(
        'resume_versions',
        [versionToRow(version) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    });
  },

  async saveAddedVersion(
    userId: string,
    workspace: ResumeWorkspace,
    version: ResumeVersion,
    snapshot: TextSnapshot
  ): Promise<void> {
    await executeCloudWrite(`resume version "${version.label}"`, async () => {
      await assertSessionOwnership(userId);
      const gateway = getCloudGateway();
      await gateway.upsertRows(
        'text_snapshots',
        [snapshotToRow(snapshot) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,hash', ignoreDuplicates: true }
      );
      await gateway.upsertRows(
        'resume_versions',
        [versionToRow(version) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
      await gateway.upsertRows(
        'resume_workspaces',
        [workspaceToRow(workspace) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async saveWorkspace(userId: string, workspace: ResumeWorkspace): Promise<void> {
    await executeCloudWrite(`workspace "${workspace.name}"`, async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'resume_workspaces',
        [workspaceToRow(workspace) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async saveAuditRecord(
    userId: string,
    entry: AuditEntry,
    resumeSnapshot: TextSnapshot,
    jdSnapshot: TextSnapshot,
    gapUpdates: GapStatusRecord[]
  ): Promise<void> {
    await executeCloudWrite('ATS analysis audit', async () => {
      await assertSessionOwnership(userId);
      const gateway = getCloudGateway();

      await gateway.upsertRows(
        'text_snapshots',
        [
          snapshotToRow(resumeSnapshot) as unknown as Record<string, unknown>,
          snapshotToRow(jdSnapshot) as unknown as Record<string, unknown>,
        ],
        { onConflict: 'user_id,hash', ignoreDuplicates: true }
      );

      await gateway.upsertRows(
        'audit_entries',
        [auditToRow(entry) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,run_key', ignoreDuplicates: true }
      );

      if (gapUpdates.length > 0) {
        await gateway.upsertRows(
          'gap_status',
          gapUpdates.map((g) => gapStatusToRow(g) as unknown as Record<string, unknown>),
          { onConflict: 'user_id,target_key,gap_id' }
        );
      }
    });
  },

  async saveJournalEvent(userId: string, event: JournalEvent): Promise<void> {
    await executeCloudWrite('journal activity', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'journal_events',
        [eventToRow(event) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    });
  },

  async upsertGapStatus(userId: string, record: GapStatusRecord): Promise<void> {
    await executeCloudWrite('gap progress', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'gap_status',
        [gapStatusToRow(record) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,target_key,gap_id' }
      );
    });
  },

  async saveSavedJd(userId: string, jd: SavedJD): Promise<void> {
    await executeCloudWrite(`saved JD "${jd.title}"`, async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'saved_jds',
        [savedJdToRow(jd) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async deleteSavedJd(userId: string, id: string): Promise<void> {
    await executeCloudWrite('delete saved JD', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('saved_jds', { user_id: userId, id });
    });
  },

  async saveWatchlistTarget(userId: string, target: WatchlistTarget): Promise<void> {
    await executeCloudWrite(`target "${target.companyName}"`, async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'watchlist_targets',
        [targetToRow(target) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async deleteWatchlistTarget(userId: string, id: string): Promise<void> {
    await executeCloudWrite('remove watchlist target', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('watchlist_targets', { user_id: userId, id });
    });
  },

  async savePlanItem(userId: string, item: PlanItem): Promise<void> {
    await executeCloudWrite(`plan item "${item.title}"`, async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'plan_items',
        [planItemToRow(item) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async deletePlanItem(userId: string, id: string): Promise<void> {
    await executeCloudWrite('remove plan item', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('plan_items', { user_id: userId, id });
    });
  },

  async saveOutreachDraft(userId: string, draft: OutreachDraft): Promise<void> {
    await executeCloudWrite('outreach draft', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'outreach_drafts',
        [outreachToRow(draft) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );
    });
  },

  async deleteOutreachDraft(userId: string, id: string): Promise<void> {
    await executeCloudWrite('remove outreach draft', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('outreach_drafts', { user_id: userId, id });
    });
  },

  async saveFeedbackItem(userId: string, item: FeedbackItem): Promise<void> {
    await executeCloudWrite('feedback verdict', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'feedback_items',
        [feedbackToRow(item) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,target_kind,rule_id' }
      );
    });
  },

  async deleteFeedbackItem(userId: string, id: string): Promise<void> {
    await executeCloudWrite('remove feedback item', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('feedback_items', { user_id: userId, id });
    });
  },

  async saveTailoringSession(
    userId: string,
    session: TailorWorkspaceSession,
    snapshotsToEnsure: TextSnapshot[] = []
  ): Promise<void> {
    await executeCloudWrite(`tailoring session "${session.title}"`, async () => {
      await assertSessionOwnership(userId);
      const gateway = getCloudGateway();

      if (snapshotsToEnsure.length > 0) {
        const unique = Array.from(new Map(snapshotsToEnsure.map((s) => [s.hash, s])).values());
        await gateway.upsertRows(
          'text_snapshots',
          unique.map((s) => snapshotToRow(s) as unknown as Record<string, unknown>),
          { onConflict: 'user_id,hash', ignoreDuplicates: true }
        );
      }

      await gateway.upsertRows(
        'tailoring_sessions',
        [tailoringSessionToRow(session) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id' }
      );

      if (session.suggestions.length > 0) {
        const nowIso = session.updatedAt || new Date().toISOString();
        const changeRows = session.suggestions
          .filter((s) => s.status !== 'pending' || s.truthGatePassed)
          .slice(0, 100)
          .map((s) => tailoringChangeToRow(session.sessionId, s, nowIso) as unknown as Record<string, unknown>);
        if (changeRows.length > 0) {
          await gateway.upsertRows('tailoring_changes', changeRows, { onConflict: 'user_id,id' });
        }
      }
    });
  },

  async loadTailoringSession(userId: string, sessionId: string): Promise<TailorWorkspaceSession | null> {
    await assertSessionOwnership(userId);
    const gateway = getCloudGateway();
    const rows = await gateway.selectRows<TailoringSessionRow>('tailoring_sessions', {
      eq: { id: sessionId },
      limit: 1,
    });
    if (!rows[0]) return null;
    const changeRows = await gateway.selectRows<TailoringChangeRow>('tailoring_changes', {
      eq: { session_id: sessionId },
      orderBy: 'created_at',
      ascending: true,
      limit: 200,
    });
    const jdSnap = rows[0].jd_snapshot_hash
      ? await this.fetchSnapshot(rows[0].jd_snapshot_hash, userId)
      : null;
    return rowToTailoringSession(rows[0], jdSnap?.text ?? '', changeRows);
  },

  async listTailoringSessions(userId: string): Promise<TailorWorkspaceSession[]> {
    await assertSessionOwnership(userId);
    const gateway = getCloudGateway();
    const rows = await gateway.selectRows<TailoringSessionRow>('tailoring_sessions', {
      orderBy: 'updated_at',
      ascending: false,
      limit: 100,
    });
    return rows.map((r) => {
      const cachedJd = r.jd_snapshot_hash ? getCachedSnapshotInMemory(r.jd_snapshot_hash)?.text ?? '' : '';
      return rowToTailoringSession(r, cachedJd, []);
    });
  },

  async deleteTailoringSession(userId: string, sessionId: string): Promise<void> {
    await executeCloudWrite('delete tailoring session', async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().deleteRows('tailoring_sessions', { user_id: userId, id: sessionId });
    });
  },

  async saveExportArtifact(
    userId: string,
    artifact: ExportArtifactContract,
    sessionId: string | null
  ): Promise<void> {
    await executeCloudWrite(`export artifact "${artifact.fileName}"`, async () => {
      await assertSessionOwnership(userId);
      await getCloudGateway().upsertRows(
        'export_artifacts',
        [exportArtifactToRow(artifact, sessionId) as unknown as Record<string, unknown>],
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    });
  },

  async eraseAllUserCloudData(userId: string): Promise<{
    storageCleared: boolean;
    databaseCleared: boolean;
    deletedPaths: string[];
  }> {
    return executeCloudWrite('account cloud erasure', async () => {
      await assertSessionOwnership(userId);
      const gateway = getCloudGateway();
      const rawPaths = await gateway.listUserStoragePaths(userId);
      const scopedPaths = Array.from(
        new Set(rawPaths.filter((p) => typeof p === 'string' && p.startsWith(`${userId}/`)))
      );
      if (scopedPaths.length > 0) {
        await gateway.removeStorageFiles(scopedPaths);
      }
      await gateway.eraseMyDataRpc();
      clearMemorySnapshotCache();
      return {
        storageCleared: true,
        databaseCleared: true,
        deletedPaths: scopedPaths,
      };
    });
  },
};
