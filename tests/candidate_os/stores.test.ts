import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useProfileStore, createInitialProfile, createInitialSettings } from '@/features/profile/useProfileStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';
import { clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

function createMockGateway(opts?: { failWrite?: boolean; userId?: string }) {
  const writes: Array<{ table: string; rows: Record<string, unknown>[] }> = [];
  const deletes: Array<{ table: string; match: Record<string, unknown> }> = [];
  const gateway: CloudGateway = {
    isConfigured: () => true,
    getAuthenticatedUserId: async () => opts?.userId ?? '11111111-1111-4111-8111-111111111111',
    selectRows: async () => [],
    upsertRows: async (table, rows) => {
      if (opts?.failWrite) throw new Error('Simulated Postgres RLS / Network Error');
      writes.push({ table, rows });
    },
    deleteRows: async (table, match) => {
      if (opts?.failWrite) throw new Error('Simulated Delete Error');
      deletes.push({ table, match });
    },
    eraseMyDataRpc: async () => {},
    uploadStorageFile: async (p) => ({ path: p }),
    createSignedDownloadUrl: async () => 'https://example.supabase.co/signed',
    downloadStorageFile: async () => new Blob([]),
    removeStorageFiles: async () => {},
    listUserStoragePaths: async () => [],
  };
  return { gateway, writes, deletes };
}

describe('Candidate OS Cloud-First Domain Stores (Phase 10.8)', () => {
  beforeEach(() => {
    _setCloudGatewayForTesting(null);
    clearMemorySnapshotCache();
    useCloudSyncStore.getState().reset();
    useAuthStore.setState({ status: 'guest', userId: null });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useMySpaceStore.getState().resetAll();
    useSavedJdStore.setState({ jds: [] });
    useFeedbackStore.setState({ items: [] });
    useProfileStore.setState({
      profile: createInitialProfile(),
      settings: createInitialSettings(),
    });
  });

  it('runs guest workspaces and audits cleanly in memory without writing to localStorage', async () => {
    const { workspace, version } = await useResumeStore.getState().createWorkspace({
      name: 'Systems Track',
      roleTrack: 'Systems',
      text: 'Built Rust async scheduler and lock-free ring buffer.',
      source: 'paste',
    });

    expect(useResumeStore.getState().workspaces[workspace.id]?.isPrimary).toBe(true);
    expect(useResumeStore.getState().versions[version.id]).toBeDefined();

    const { entry } = await useAuditStore.getState().record({
      kind: 'ats_roast',
      engineVersion: '4.0.0-ats7d',
      resume: {
        workspaceId: workspace.id,
        versionId: version.id,
        label: version.label,
        rawText: 'Built Rust async scheduler and lock-free ring buffer.',
      },
      jd: { rawText: 'Seeking Rust Systems Engineer with concurrency experience.', origin: 'pasted' },
      overallScore: 86,
      breakdown: [{ key: 'must_have_coverage', label: 'Must-Have Skills', score: 86, weight: 0.3 }],
      gaps: [{ id: 'gap:1', category: 'skill', label: 'eBPF', severity: 2, detail: 'Missing' }],
      strengths: ['Rust'],
      evidence: [],
      findings: {},
    });

    expect(entry.overallScore).toBe(86);
    expect(useAuditStore.getState().entries[entry.id]).toBeDefined();
    expect(typeof localStorage !== 'undefined' ? localStorage.length : 0).toBe(0);
  });

  it('persists authenticated workspace, audit, target, saved JD, and feedback writes directly to Supabase Gateway', async () => {
    const uid = '11111111-1111-4111-8111-111111111111';
    const { gateway, writes } = createMockGateway({ userId: uid });
    _setCloudGatewayForTesting(gateway);
    useAuthStore.setState({ status: 'authenticated', userId: uid });

    const { workspace, version } = await useResumeStore.getState().createWorkspace({
      name: 'Cloud Resume',
      roleTrack: 'Backend',
      text: 'Architected Go gRPC microservices handling 20k RPS.',
      source: 'paste',
    });

    await useAuditStore.getState().record({
      kind: 'ats_roast',
      engineVersion: '4.0.0-ats7d',
      resume: {
        workspaceId: workspace.id,
        versionId: version.id,
        label: version.label,
        rawText: 'Architected Go gRPC microservices handling 20k RPS.',
      },
      jd: { rawText: 'Backend Go gRPC Engineer', origin: 'pasted' },
      overallScore: 92,
      breakdown: [{ key: 'must_have_coverage', label: 'Must-Have Skills', score: 92, weight: 0.3 }],
      gaps: [],
      strengths: ['Go', 'gRPC'],
      evidence: [],
      findings: {},
    });

    useSavedJdStore.getState().saveJd({
      title: 'Backend Engineer',
      company: 'Acme Cloud',
      source: 'pasted',
      text: 'Requirements: Go, PostgreSQL, Kubernetes, distributed systems.',
    });

    useFeedbackStore.getState().submitFeedback({
      targetKind: 'ats_rule',
      ruleId: 'impact_metrics',
      verdict: 'up',
      note: 'Accurate detection',
    });

    await new Promise((r) => setTimeout(r, 20));
    const touchedTables = writes.map((w) => w.table);
    expect(touchedTables).toContain('resume_workspaces');
    expect(touchedTables).toContain('resume_versions');
    expect(touchedTables).toContain('audit_entries');
    expect(touchedTables).toContain('saved_jds');
    expect(touchedTables).toContain('feedback_items');
    expect(useCloudSyncStore.getState().phase).toBe('synced');
  });

  it('fails loudly and surfaces retry callback when authenticated cloud write fails (zero silent fallback)', async () => {
    const uid = '11111111-1111-4111-8111-111111111111';
    const { gateway } = createMockGateway({ failWrite: true, userId: uid });
    _setCloudGatewayForTesting(gateway);
    useAuthStore.setState({ status: 'authenticated', userId: uid });

    await expect(
      useResumeStore.getState().createWorkspace({
        name: 'Failed Cloud Resume',
        roleTrack: 'Backend',
        text: 'Python FastAPI backend engineer',
        source: 'paste',
      })
    ).rejects.toThrow(/Simulated Postgres/i);

    const syncState = useCloudSyncStore.getState();
    expect(syncState.phase).toBe('error');
    expect(syncState.error).toContain('Simulated Postgres');
    expect(typeof syncState.pendingRetry).toBe('function');
  });
});
