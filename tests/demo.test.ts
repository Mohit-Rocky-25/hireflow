import { describe, it, expect, beforeEach } from 'vitest';
import { explainAuthError, validateReturnToPath } from '@/features/auth/authErrors';
import { buildDemoDataset } from '@/features/demo/demoDataset';
import { importDataset } from '@/features/demo/demoImporter';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { getCachedSnapshotInMemory, clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';

describe('Cloud Auth Error Helper & In-Memory Dataset Preview', () => {
  beforeEach(() => {
    clearMemorySnapshotCache();
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useMySpaceStore.getState().resetAll();
  });

  it('validates OAuth redirect paths and explains OAuth callback failures cleanly', () => {
    expect(validateReturnToPath('/tools/resume-checker')).toBe('/tools/resume-checker');
    expect(validateReturnToPath('https://phish.example')).toBeNull();
    const denied = explainAuthError('access_denied');
    expect(denied.problem).toBe('access_denied');
    expect(denied.recoverable).toBe(true);
  });

  it('loads sample dataset cleanly into in-memory stores without localStorage or outbox writes', async () => {
    const ds = await buildDemoDataset();
    await importDataset(ds, false);
    expect(Object.keys(useResumeStore.getState().workspaces).length).toBeGreaterThan(0);
    expect(Object.keys(useAuditStore.getState().entries).length).toBeGreaterThan(0);
    expect(getCachedSnapshotInMemory(ds.snapshots[0].hash)?.text).toBe(ds.snapshots[0].text);
    if (typeof localStorage !== 'undefined') {
      expect(localStorage.length).toBe(0);
    }
  });
});
