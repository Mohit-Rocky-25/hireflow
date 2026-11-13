// @vitest-environment node
import { describe, expect, it, beforeEach } from 'vitest';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { usePortalStore } from '@/features/portal/usePortalStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useHandoffStore } from '@/features/handoff/useHandoffStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { kvClear } from '@/lib/storage/kv';
import { clearOutbox, getOutbox } from '@/sync/outbox';
import { statusOf } from '@/features/journal/gapStatus';

describe('Stage 4: Stores & Resume Matrix', () => {
  beforeEach(async () => {
    await kvClear();
    await clearOutbox('test-user');
    useAuthStore.setState({ status: 'guest', userId: null, email: null });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    usePortalStore.setState({ watchlist: {}, planItems: {}, outreachDrafts: {} });
    useProfileStore.setState({
      profile: {
        displayName: 'Candidate',
        targetTier: 'top_product',
        targetRoles: [],
        links: {},
        activeWorkspaceId: null,
        updatedAt: '2026-11-12T00:00:00Z',
      },
      settings: { cloudSyncEnabled: false, consentRecordedAt: null },
    });
    useHandoffStore.setState({ current: null });
  });

  describe('Resume Matrix store', () => {
    it('creates a workspace and version snapshot', async () => {
      const { workspace, version } = await useResumeStore.getState().createWorkspace({
        name: 'Backend Track',
        roleTrack: 'Distributed Systems',
        text: 'Senior Go Developer with 5 years experience',
        source: 'paste',
      });

      expect(workspace.name).toBe('Backend Track');
      expect(workspace.isPrimary).toBe(true);
      expect(workspace.headVersionId).toBe(version.id);
      expect(version.label).toBe('v1: Initial import');

      const headSnap = await useResumeStore.getState().getHeadSnapshot(workspace.id);
      expect(headSnap?.text).toBe('Senior Go Developer with 5 years experience');
    });

    it('deduplicates versions with identical text to head', async () => {
      const { workspace, version: v1 } = await useResumeStore.getState().createWorkspace({
        name: 'Backend Track',
        roleTrack: 'Distributed Systems',
        text: 'Initial resume text',
        source: 'paste',
      });

      const v2 = await useResumeStore.getState().addVersion({
        workspaceId: workspace.id,
        text: 'Initial resume text',
        label: 'v2 Attempt',
        source: 'paste',
      });

      expect(v2.id).toBe(v1.id);
      const wsVersions = Object.values(useResumeStore.getState().versions);
      expect(wsVersions).toHaveLength(1);
    });

    it('forks workspace preserving parent snapshot text', async () => {
      useAuthStore.setState({ status: 'authenticated', userId: 'user-1' });
      const { workspace: original } = await useResumeStore.getState().createWorkspace({
        name: 'Core',
        roleTrack: 'General',
        text: 'Original resume content',
        source: 'paste',
      });

      const forked = await useResumeStore.getState().forkWorkspace({
        fromWorkspaceId: original.id,
        name: 'Core Forked',
        roleTrack: 'Specialized',
      });

      expect(forked.name).toBe('Core Forked');
      expect(forked.id).not.toBe(original.id);
      const forkedSnap = await useResumeStore.getState().getHeadSnapshot(forked.id);
      expect(forkedSnap?.text).toBe('Original resume content');
    });

    it('enforces guest limit of 1 workspace', async () => {
      await useResumeStore.getState().createWorkspace({
        name: 'WS 1',
        roleTrack: 'Track 1',
        text: 'Text 1',
        source: 'paste',
      });

      await expect(
        useResumeStore.getState().createWorkspace({
          name: 'WS 2',
          roleTrack: 'Track 2',
          text: 'Text 2',
          source: 'paste',
        })
      ).rejects.toThrow(/limit reached/);
    });
  });

  describe('Audit store & gap overlay transitions', () => {
    const sampleInput = (score = 70, gaps = [{ id: 'skill:k8s', category: 'skill' as const, label: 'Kubernetes', severity: 2 as const }], resumeText = 'Senior Backend Engineer'): RecordAuditInput => ({
      kind: 'ats_roast',
      engineVersion: '3.4.0',
      resume: { workspaceId: null, versionId: null, label: 'Custom', rawText: resumeText },
      jd: { rawText: 'Looking for Kubernetes engineer', origin: 'pasted' },
      overallScore: score,
      breakdown: [{ key: 'skills', label: 'Skills', score: 70 }],
      gaps,
      strengths: ['Great experience'],
      evidence: [],
      findings: {},
    });

    it('records an audit and transitions gap status overlay', async () => {
      const { entry, deduplicated } = await useAuditStore.getState().record(sampleInput());
      expect(deduplicated).toBe(false);
      expect(entry.overallScore).toBe(70);

      // Gap overlay initially reports open via statusOf
      expect(statusOf(useAuditStore.getState().gapStatus, entry.targetKey, 'skill:k8s')).toBe('open');

      // Mark gap addressed
      useAuditStore.getState().markGapAddressed(entry.targetKey, 'skill:k8s', 'plan-item-1');
      expect(statusOf(useAuditStore.getState().gapStatus, entry.targetKey, 'skill:k8s')).toBe('addressed_pending_rescan');

      // Rescan with updated resume where the gap is no longer reported -> becomes resolved
      await useAuditStore.getState().record(sampleInput(85, [], 'Senior Backend Engineer with Kubernetes in production'));
      expect(statusOf(useAuditStore.getState().gapStatus, entry.targetKey, 'skill:k8s')).toBe('resolved');
    });

    it('caps guest audit entries to 10 max', async () => {
      for (let i = 0; i < 12; i++) {
        await useAuditStore.getState().record(sampleInput(50 + i, []), {
          uuid: () => `id-${i}`,
          now: () => new Date(Date.now() + i * 1000).toISOString(),
        });
      }

      const entries = Object.values(useAuditStore.getState().entries);
      expect(entries.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Handoff store', () => {
    it('is single use and matches destination tool', () => {
      useHandoffStore.getState().set({
        from: '/portal/resumes',
        to: '/tools/resume-checker',
        resumeVersionId: 'ver-123',
      });

      // Wrong tool consumption returns null
      const wrong = useHandoffStore.getState().consume('/tools/tailor');
      expect(wrong).toBeNull();

      // Right tool consumption returns handoff and clears
      const right = useHandoffStore.getState().consume('/tools/resume-checker');
      expect(right?.resumeVersionId).toBe('ver-123');

      // Second consumption returns null
      expect(useHandoffStore.getState().consume('/tools/resume-checker')).toBeNull();
    });
  });
});
