import type { DemoDataset } from './demoDataset';
import { kvSet } from '@/lib/storage/kv';
import { getSnapshotKey } from '@/lib/storage/namespace';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { enqueueOp } from '@/sync/outbox';
import { orderOps, type SyncOp } from '@/sync/syncCore';
import {
  snapshotToRow,
  workspaceToRow,
  versionToRow,
  auditToRow,
  targetToRow,
  planItemToRow,
  outreachToRow,
  eventToRow,
  gapStatusToRow,
} from '@/sync/mappers';
import { syncEngine } from '@/sync/syncEngine';

/**
 * Imports a complete demo dataset into all local stores and enqueues sync ops in dependency order.
 * Idempotent and deterministic.
 */
export async function importDataset(ds: DemoDataset, enqueueSync = true): Promise<void> {
  // 1. Write text snapshots to KV storage
  for (const snap of ds.snapshots) {
    await kvSet(getSnapshotKey(snap.hash), snap);
  }

  // 2. Hydrate Resume Store
  const workspacesMap: Record<string, typeof ds.workspaces[0]> = {};
  for (const w of ds.workspaces) workspacesMap[w.id] = w;
  const versionsMap: Record<string, typeof ds.versions[0]> = {};
  for (const v of ds.versions) versionsMap[v.id] = v;

  useResumeStore.setState({
    workspaces: workspacesMap,
    versions: versionsMap,
    activeWorkspaceId: ds.workspaces[0]?.id ?? null,
  });

  // 3. Hydrate Audit Store
  const auditsMap: Record<string, typeof ds.audits[0]> = {};
  for (const a of ds.audits) auditsMap[a.id] = a;
  const eventsMap: Record<string, typeof ds.events[0]> = {};
  for (const e of ds.events) eventsMap[e.id] = e;

  useAuditStore.setState({
    entries: auditsMap,
    events: eventsMap,
    gapStatus: ds.gapOverlay,
  });

  // 4. Hydrate My Space Store
  const targetsMap: Record<string, typeof ds.targets[0]> = {};
  for (const t of ds.targets) targetsMap[t.id] = t;
  const planItemsMap: Record<string, typeof ds.planItems[0]> = {};
  for (const p of ds.planItems) planItemsMap[p.id] = p;
  const draftsMap: Record<string, typeof ds.drafts[0]> = {};
  for (const d of ds.drafts) draftsMap[d.id] = d;

  useMySpaceStore.setState({
    watchlist: targetsMap,
    planItems: planItemsMap,
    outreachDrafts: draftsMap,
  });

  // 5. Hydrate Profile Store
  useProfileStore.setState({
    profile: ds.profile,
  });

  // 6. Enqueue sync operations in dependency order if requested
  if (enqueueSync) {
    const rawOps: SyncOp[] = [];

    // Snapshots
    for (const s of ds.snapshots) {
      rawOps.push({
        opId: `snap_${s.hash}`,
        table: 'text_snapshots',
        op: 'insert_ignore',
        pk: { hash: s.hash },
        payload: snapshotToRow(s) as unknown as Record<string, unknown>,
        clientUpdatedAt: s.createdAt,
        attempts: 0,
        enqueuedAt: s.createdAt,
      });
    }

    // Workspaces
    for (const w of ds.workspaces) {
      rawOps.push({
        opId: `ws_${w.id}`,
        table: 'resume_workspaces',
        op: 'upsert',
        pk: { id: w.id },
        payload: workspaceToRow(w) as unknown as Record<string, unknown>,
        clientUpdatedAt: w.updatedAt,
        attempts: 0,
        enqueuedAt: w.updatedAt,
      });
    }

    // Versions
    for (const v of ds.versions) {
      rawOps.push({
        opId: `ver_${v.id}`,
        table: 'resume_versions',
        op: 'insert_ignore',
        pk: { id: v.id },
        payload: versionToRow(v) as unknown as Record<string, unknown>,
        clientUpdatedAt: v.createdAt,
        attempts: 0,
        enqueuedAt: v.createdAt,
      });
    }

    // Audits
    for (const a of ds.audits) {
      rawOps.push({
        opId: `aud_${a.id}`,
        table: 'audit_entries',
        op: 'insert_ignore',
        pk: { id: a.id },
        payload: auditToRow(a) as unknown as Record<string, unknown>,
        clientUpdatedAt: a.createdAt,
        attempts: 0,
        enqueuedAt: a.createdAt,
      });
    }

    // Targets
    for (const t of ds.targets) {
      rawOps.push({
        opId: `tgt_${t.id}`,
        table: 'watchlist_targets',
        op: 'upsert',
        pk: { id: t.id },
        payload: targetToRow(t) as unknown as Record<string, unknown>,
        clientUpdatedAt: t.addedAt,
        attempts: 0,
        enqueuedAt: t.addedAt,
      });
    }

    // Plan Items
    for (const p of ds.planItems) {
      rawOps.push({
        opId: `plan_${p.id}`,
        table: 'plan_items',
        op: 'upsert',
        pk: { id: p.id },
        payload: planItemToRow(p) as unknown as Record<string, unknown>,
        clientUpdatedAt: p.updatedAt,
        attempts: 0,
        enqueuedAt: p.updatedAt,
      });
    }

    // Drafts
    for (const d of ds.drafts) {
      rawOps.push({
        opId: `drf_${d.id}`,
        table: 'outreach_drafts',
        op: 'upsert',
        pk: { id: d.id },
        payload: outreachToRow(d) as unknown as Record<string, unknown>,
        clientUpdatedAt: d.updatedAt,
        attempts: 0,
        enqueuedAt: d.updatedAt,
      });
    }

    // Events
    for (const ev of ds.events) {
      rawOps.push({
        opId: `ev_${ev.id}`,
        table: 'journal_events',
        op: 'insert_ignore',
        pk: { id: ev.id },
        payload: eventToRow(ev) as unknown as Record<string, unknown>,
        clientUpdatedAt: ev.createdAt,
        attempts: 0,
        enqueuedAt: ev.createdAt,
      });
    }

    // Gap overlays
    const targetKey = ds.audits[0]?.targetKey || '';
    for (const [gapId, overlay] of Object.entries(ds.gapOverlay)) {
      rawOps.push({
        opId: `gap_${gapId}`,
        table: 'gap_status',
        op: 'upsert',
        pk: { target_key: targetKey, gap_id: gapId },
        payload: gapStatusToRow({
          targetKey,
          gapId,
          status: overlay.status,
          planItemId: overlay.planItemId,
          stillDetected: overlay.status !== 'resolved',
          updatedAt: overlay.updatedAt,
        }) as unknown as Record<string, unknown>,
        clientUpdatedAt: overlay.updatedAt,
        attempts: 0,
        enqueuedAt: overlay.updatedAt,
      });
    }

    // Order ops in dependency order (snapshots -> workspaces -> versions -> audits ...)
    const ordered = orderOps(rawOps);
    const userId = useAuthStore.getState().userId || 'demo-local';
    for (const op of ordered) {
      await enqueueOp(userId, op);
    }

    void syncEngine.flush();
  }
}

