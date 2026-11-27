import type { DemoDataset } from './demoDataset';
import { buildDemoDataset } from './demoDataset';
import { cacheSnapshotInMemory } from '@/lib/cloud/cloudRepository';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { projectAuditsToScanRecords, projectAuditsToAtsHistory } from '@/lib/cloud/cloudHydrator';

/**
 * Imports a sample dataset purely into in-memory session stores for unit tests & guest previews.
 * Never persists to browser localStorage or offline outboxes.
 */
export async function importDataset(ds: DemoDataset, _unusedSyncFlag = false): Promise<void> {
  for (const snap of ds.snapshots) {
    cacheSnapshotInMemory(snap);
  }

  const workspacesMap: Record<string, typeof ds.workspaces[0]> = {};
  for (const w of ds.workspaces) workspacesMap[w.id] = w;
  const versionsMap: Record<string, typeof ds.versions[0]> = {};
  for (const v of ds.versions) versionsMap[v.id] = v;

  useResumeStore.setState({
    workspaces: workspacesMap,
    versions: versionsMap,
    activeWorkspaceId: ds.workspaces[0]?.id ?? null,
  });

  const auditsMap: Record<string, typeof ds.audits[0]> = {};
  for (const a of ds.audits) auditsMap[a.id] = a;
  const eventsMap: Record<string, typeof ds.events[0]> = {};
  for (const e of ds.events) eventsMap[e.id] = e;

  useAuditStore.setState({
    entries: auditsMap,
    events: eventsMap,
    gapStatus: ds.gapOverlay,
  });

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

  useProfileStore.setState({
    profile: ds.profile,
  });

  useScanHistoryStore.setState({
    scans: projectAuditsToScanRecords(ds.audits),
  });

  useAtsToolStore.setState({
    scanHistory: projectAuditsToAtsHistory(ds.audits),
  });
}

export async function loadDemoIntoStores(overrideDisplayName?: string): Promise<void> {
  const ds = await buildDemoDataset();
  const profile = overrideDisplayName
    ? { ...ds.profile, displayName: overrideDisplayName }
    : ds.profile;
  await importDataset({ ...ds, profile });
}
