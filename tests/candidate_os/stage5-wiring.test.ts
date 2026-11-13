import { describe, it, expect, beforeEach } from 'vitest';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { usePortalStore } from '@/features/portal/usePortalStore';
import { useHandoffStore } from '@/features/handoff/useHandoffStore';
import { rankForGaps } from '@/features/portal/gapMatcher';
import { applyRescan, markGapAddressed } from '@/features/journal/gapStatus';
import { getOutbox } from '@/sync/outbox';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Gap, AuditEntry, PlanItem } from '@/domain/types';

describe('Stage 5: Verification of Wiring & Guarantees', () => {
  beforeEach(() => {
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    usePortalStore.setState({ watchlist: {}, plan: {}, drafts: {} });
    useHandoffStore.setState({ current: null });
    useAuthStore.setState({ status: 'guest', userId: null });
  });

  it('Handoff is single-use and cleared on consume', () => {
    useHandoffStore.getState().set({
      from: '/tools/resume-checker',
      to: '/tools/tailor',
      targetKey: 'jd:123',
    });

    // Mismatched destination does not consume
    expect(useHandoffStore.getState().consume('/tools/other')).toBeNull();

    // Matched destination consumes and clears
    const consumed = useHandoffStore.getState().consume('/tools/tailor');
    expect(consumed).not.toBeNull();
    expect(consumed?.targetKey).toBe('jd:123');

    // Second consume returns null (single use)
    expect(useHandoffStore.getState().consume('/tools/tailor')).toBeNull();
  });

  it('Gap matcher rankForGaps is deterministic and severity-weighted', () => {
    const gaps: Gap[] = [
      { id: 'skill:react', category: 'skill', label: 'React', severity: 3 },
      { id: 'skill:docker', category: 'skill', label: 'Docker', severity: 1 },
    ];

    const catalog = [
      { id: 'brief-docker', title: 'Containerization with Docker', tags: ['docker', 'devops'] },
      { id: 'brief-react', title: 'Modern React Architecture', tags: ['react', 'frontend', 'ui'] },
      { id: 'brief-python', title: 'Python Backend Systems', tags: ['python', 'backend'] },
    ];

    const ranked1 = rankForGaps(gaps, catalog);
    const ranked2 = rankForGaps(gaps, catalog);

    // Deterministic output
    expect(ranked1).toEqual(ranked2);

    // React has higher severity (3) so brief-react ranks highest
    expect(ranked1[0].item.id).toBe('brief-react');
    expect(ranked1[1].item.id).toBe('brief-docker');
    expect(ranked1.find((r) => r.item.id === 'brief-python')).toBeUndefined();
  });

  it('Truth rule: Credential completion sets addressed_pending_rescan and NEVER resolved', () => {
    const targetKey = 'jd:target-eng';
    const gapId = 'skill:kubernetes';
    const planItemId = 'plan-123';

    // When plan item marked done:
    const initialOverlay = {};
    const updatedOverlay = markGapAddressed(initialOverlay, targetKey, gapId, planItemId, '2026-11-13T00:00:00Z');

    const overlayKey = `${targetKey}|${gapId}`;
    expect(updatedOverlay[overlayKey].status).toBe('addressed_pending_rescan');
    expect(updatedOverlay[overlayKey].status).not.toBe('resolved');
    expect(updatedOverlay[overlayKey].planItemId).toBe(planItemId);

    // Only a re-scan without that gap marks it resolved
    const currentGapIdsAfterRescan = ['skill:python']; // kubernetes is absent now
    const { overlay: resolvedOverlay } = applyRescan(updatedOverlay, targetKey, currentGapIdsAfterRescan, '2026-11-13T01:00:00Z');
    expect(resolvedOverlay[overlayKey].status).toBe('resolved');
  });

  it('Guest runs never enqueue sync ops', async () => {
    useAuthStore.setState({ status: 'guest', userId: null });
    const guestOpsBefore = await getOutbox('guest-anon');
    expect(guestOpsBefore.length).toBe(0);

    await useAuditStore.getState().record({
      kind: 'ats_roast',
      engineVersion: '4.0.0',
      overallScore: 85,
      resume: { workspaceId: null, versionId: null, label: 'Resume', rawText: 'Aman Gupta Software Engineer Go Docker' },
      jd: { rawText: 'Software Engineer Go Docker', origin: 'pasted' },
      breakdown: [],
      gaps: [],
      strengths: [],
      evidence: [],
      findings: {},
    });

    const guestOpsAfter = await getOutbox('guest-anon');
    expect(guestOpsAfter.length).toBe(0);
  });
});
