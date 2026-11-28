import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRedirectTarget } from '@/features/my-space/portalRedirectMap';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import {
  getAuthoritativeProfileIdentity,
  syncProfileIdentity,
} from '@/features/profile/profileOwnershipContract';
import {
  useTailorLaunchStore,
  buildTailorLaunchUrl,
  createDualJdLaunchPair,
} from '@/lib/tailor/launchContext';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => {
      store.delete(k);
    },
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
  };
}

describe('Phase 11.0: Shared User Asset & Context Integration Foundation', () => {
  beforeEach(async () => {
    vi.stubGlobal('sessionStorage', createMemoryStorage());
    await useAuthStore.getState().signOut();
  });

  it('1. preserves legacy /portal deep links by redirecting to canonical /my-space routes', () => {
    expect(getRedirectTarget('/portal')).toBe('/my-space');
    expect(getRedirectTarget('/portal/resumes')).toBe('/my-space/resumes');
    expect(getRedirectTarget('/portal/audits/audit-99')).toBe('/my-space/scans?audit=audit-99');
  });

  it('2 & 4 & 10. preserves ResumeWorkspace -> ResumeVersion -> snapshotHash & AuditEntry linkage with zero duplicate ownership', async () => {
    await useAuthStore.getState().registerDemoSession('Ananya Rao', 'ananya@example.com', {
      seedSampleWorkspace: true,
    });

    const resumes = useResumeStore.getState();
    const workspaces = Object.values(resumes.workspaces);
    expect(workspaces.length).toBeGreaterThan(0);

    const primaryWs = workspaces[0]!;
    const headVersion = primaryWs.headVersionId ? resumes.versions[primaryWs.headVersionId] : null;
    expect(headVersion).toBeTruthy();
    expect(headVersion!.workspaceId).toBe(primaryWs.id);
    expect(headVersion!.snapshotHash).toMatch(/^[0-9a-f]{64}$/);

    const audits = Object.values(useAuditStore.getState().entries);
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.some((a) => a.resume.snapshotHash && a.targetKey)).toBe(true);
  });

  it('3. maintains consistent authoritative profile identity across auth and profile stores', async () => {
    await useAuthStore.getState().registerDemoSession('Vikram Nair', 'vikram@example.com', {
      seedSampleWorkspace: false,
    });

    const identity = syncProfileIdentity({ degree: 'B.Tech', branch: 'CSE', targetTier: 'Tier A' });
    expect(identity.displayName).toBe('Vikram Nair');
    expect(identity.email).toBe('vikram@example.com');
    expect(identity.isDemo).toBe(true);
    expect(identity.degree).toBe('B.Tech');
    expect(getAuthoritativeProfileIdentity().displayName).toBe('Vikram Nair');
  });

  it('5 & 6. creates typed ATS Tailoring Launch Context without leaking document text into URLs', () => {
    const ctx = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'resume_roaster',
      mode: 'add_gap',
      workspaceId: 'ws-1',
      versionId: 'ver-1',
      snapshotHash: 'a'.repeat(64),
      auditId: 'audit-1',
      talentLensAssessmentId: null,
      findingIds: ['gap-kafka'],
      evidenceIds: ['ev-1'],
      jdIds: ['b'.repeat(64)],
      jdSnapshotHash: 'b'.repeat(64),
      dualJdComparisonId: null,
      targetKey: 'razorpay:sde2',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: 'Kafka',
    });

    const url = buildTailorLaunchUrl(ctx);
    expect(url).toBe(`/tools/tailor?ctx=${encodeURIComponent(ctx.launchId)}`);
    expect(url).not.toContain('Experience');
    expect(useTailorLaunchStore.getState().getLaunchContext(ctx.launchId)?.auditId).toBe('audit-1');
  });

  it('7. keeps TalentLens demonstrated candidate evidence distinct from missing qualifications', () => {
    const ctx = useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'talentlens',
      mode: 'full_tailor',
      workspaceId: 'ws-1',
      versionId: 'ver-1',
      snapshotHash: 'c'.repeat(64),
      auditId: 'tl-audit-1',
      talentLensAssessmentId: 'tl-audit-1',
      jdIds: ['d'.repeat(64)],
      dualJdComparisonId: null,
      targetKey: 'google:swe2',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: 'Raft Consensus',
      demonstratedEvidenceLabels: ['Built Go microservices', 'PostgreSQL indexing'],
      missingQualificationLabels: ['Raft Consensus', 'Spanner internals'],
    });

    const loaded = useTailorLaunchStore.getState().getLaunchContext(ctx.launchId)!;
    expect(loaded.demonstratedEvidenceLabels).toEqual(['Built Go microservices', 'PostgreSQL indexing']);
    expect(loaded.missingQualificationLabels).toEqual(['Raft Consensus', 'Spanner internals']);
  });

  it('8. spawns two independent Dual-JD tailoring contexts without merging jobs', () => {
    const pair = createDualJdLaunchPair({
      workspaceId: 'ws-1',
      versionId: 'ver-1',
      snapshotHash: 'e'.repeat(64),
      jdA: { id: 'jd-a', title: 'SDE-2 Backend', company: 'Razorpay', targetKey: 'dual:jd-a', missingSkills: ['Kafka'] },
      jdB: { id: 'jd-b', title: 'SWE Systems', company: 'Uber', targetKey: 'dual:jd-b', missingSkills: ['Kubernetes'] },
    });

    expect(pair.ctxA.launchId).not.toBe(pair.ctxB.launchId);
    expect(pair.ctxA.dualJdComparisonId).toBe(pair.comparisonId);
    expect(pair.ctxB.dualJdComparisonId).toBe(pair.comparisonId);
    expect(pair.ctxA.jdIds).toEqual(['jd-a']);
    expect(pair.ctxB.jdIds).toEqual(['jd-b']);
    expect(pair.ctxA.targetKey).toBe('dual:jd-a');
    expect(pair.ctxB.targetKey).toBe('dual:jd-b');
  });

  it('9. persists ReachOut drafts directly into useMySpaceStore Outreach Vault', () => {
    const saved = useMySpaceStore.getState().saveOutreachDraft({
      templateId: 'recruiter-direct-note',
      channel: 'linkedin_connect',
      status: 'draft',
      slots: { person: 'Priya Sharma', company: 'Razorpay' },
      renderedText: 'Hi Priya, sharing my Go transactional outbox benchmark.',
    });

    const vault = useMySpaceStore.getState().outreachDrafts;
    expect(vault[saved.id]).toBeDefined();
    expect(vault[saved.id]!.slots.person).toBe('Priya Sharma');
    expect(vault[saved.id]!.slots.company).toBe('Razorpay');
  });

  it('11. isolates two demo users and clears launch contexts + stores cleanly on signOut', async () => {
    await useAuthStore.getState().registerDemoSession('User One', 'one@example.com', { seedSampleWorkspace: true });
    useTailorLaunchStore.getState().registerLaunchContext({
      sourceEntryPoint: 'my_space',
      mode: 'full_tailor',
      workspaceId: null,
      versionId: null,
      snapshotHash: null,
      auditId: null,
      talentLensAssessmentId: null,
      dualJdComparisonId: null,
      targetKey: 'target:one',
      selectedSection: null,
      selectedBullet: null,
      focusSkill: null,
    });

    await useAuthStore.getState().signOut();
    expect(Object.keys(useTailorLaunchStore.getState().contexts)).toHaveLength(0);
    expect(Object.keys(useAuditStore.getState().entries)).toHaveLength(0);
    expect(Object.keys(useMySpaceStore.getState().outreachDrafts)).toHaveLength(0);

    await useAuthStore.getState().registerDemoSession('User Two', 'two@example.com', { seedSampleWorkspace: false });
    expect(useAuthStore.getState().displayName).toBe('User Two');
    expect(Object.keys(useAuditStore.getState().entries)).toHaveLength(0);
  });
});
