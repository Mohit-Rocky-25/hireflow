import { describe, expect, it } from 'vitest';
import { getNextBestAction, buildSummarySentence } from '@/features/my-space/mySpaceSelectors';
import type { AuditEntry, PlanItem, WatchlistTarget, GapOverlay } from '@/domain/types';

describe('getNextBestAction', () => {
  const dummyAudit: AuditEntry = {
    schemaVersion: 1,
    id: 'a1',
    kind: 'ats_roast',
    createdAt: '2026-11-02T09:00:00.000Z',
    engineVersion: '1.0',
    runKey: 'rk1',
    targetKey: 'target-razorpay',
    resume: { workspaceId: 'w1', versionId: 'v1', snapshotHash: 'h1', label: 'v1' },
    jd: { snapshotHash: 'h2', origin: 'talentlens', company: 'Razorpay', roleTitle: 'SDE II' },
    overallScore: 71,
    breakdown: [],
    gaps: [{ id: 'skill:kafka', category: 'skill', label: 'Kafka', severity: 3 }],
    strengths: [],
    evidence: [],
    findingsJson: {},
    delta: {
      baselineAuditId: 'a0',
      baselineCreatedAt: '2026-11-01T09:00:00.000Z',
      overallDeltaPts: 7,
      breakdownDeltaPts: {},
      resolvedGapIds: [],
      newGapIds: [],
      persistedGapIds: [],
    },
  };

  const dummyTarget: WatchlistTarget = {
    id: 't1',
    targetKey: 'target-razorpay',
    companyName: 'Razorpay',
    roleTitle: 'SDE II',
    addedAt: '2026-11-02T09:00:00.000Z',
    archivedAt: null,
  };

  const unscannedTarget: WatchlistTarget = {
    id: 't2',
    targetKey: 'target-atlassian',
    companyName: 'Atlassian',
    roleTitle: 'Software Engineer',
    addedAt: '2026-11-03T09:00:00.000Z',
    archivedAt: null,
  };

  it('Branch D: returns "Scan your resume" when no audits exist', () => {
    const action = getNextBestAction([], [], []);
    expect(action.title).toBe('Scan your resume');
    expect(action.buttonText).toBe('Scan your resume');
  });

  it('Branch C: returns "Scan against <target>" when an unscanned watchlist target exists', () => {
    const action = getNextBestAction([dummyAudit], [dummyTarget, unscannedTarget], [
      { id: 'p1', kind: 'build_brief', refId: 'b1', title: 'Kafka Brief', status: 'planned', linkedGapIds: ['skill:kafka'], targetKey: 'target-razorpay', addedFromAuditId: null, createdAt: '', updatedAt: '', completedAt: null }
    ]);
    expect(action.title).toBe('Scan against Atlassian');
    expect(action.buttonText).toBe('Scan now');
  });

  it('Branch B: returns "Add <skill> to your plan" when a target has open gaps not in the plan', () => {
    const action = getNextBestAction([dummyAudit], [dummyTarget], []);
    expect(action.title).toBe('Add Kafka to your plan');
    expect(action.buttonText).toBe('Add to plan');
  });

  it('Branch A: returns "Re-scan <target>" when gaps are awaiting re-scan (first match wins)', () => {
    const gapOverlay: GapOverlay = {
      'skill:outbox': { status: 'addressed_pending_rescan', updatedAt: '2026-11-03T09:00:00.000Z' },
    };
    const planItems: PlanItem[] = [
      { id: 'p1', kind: 'build_brief', refId: 'b1', title: 'Transactional Outbox in Go', status: 'done', linkedGapIds: ['skill:outbox'], targetKey: 'target-razorpay', addedFromAuditId: null, createdAt: '', updatedAt: '', completedAt: '' },
    ];
    const action = getNextBestAction([dummyAudit], [dummyTarget, unscannedTarget], planItems, gapOverlay);
    expect(action.title).toBe('Re-scan Razorpay');
    expect(action.buttonText).toBe('Re-scan now');
  });
});

describe('buildSummarySentence', () => {
  it('builds summary sentence with company, score, delta, and open gaps', () => {
    const dummyAudit: AuditEntry = {
      schemaVersion: 1,
      id: 'a1',
      kind: 'ats_roast',
      createdAt: '2026-11-02T09:00:00.000Z',
      engineVersion: '1.0',
      runKey: 'rk1',
      targetKey: 'target-razorpay',
      resume: { workspaceId: 'w1', versionId: 'v1', snapshotHash: 'h1', label: 'v1' },
      jd: { snapshotHash: 'h2', origin: 'talentlens', company: 'Razorpay', roleTitle: 'Software Development Engineer II' },
      overallScore: 71,
      breakdown: [],
      gaps: [
        { id: 'skill:locking', category: 'skill', label: 'Distributed locking', severity: 2 },
        { id: 'skill:aws', category: 'skill', label: 'AWS', severity: 2 },
        { id: 'skill:redis', category: 'skill', label: 'Redis', severity: 1 },
      ],
      strengths: [],
      evidence: [],
      findingsJson: {},
      delta: {
        baselineAuditId: 'a0',
        baselineCreatedAt: '2026-11-01T09:00:00.000Z',
        overallDeltaPts: 7,
        breakdownDeltaPts: {},
        resolvedGapIds: [],
        newGapIds: [],
        persistedGapIds: [],
      },
    };

    const sentence = buildSummarySentence([dummyAudit]);
    expect(sentence).toBe(
      'Your best fit is Razorpay, Software Development Engineer II, at 71 of 100, up 7 since your last scan. 3 gaps are still open.'
    );
  });
});

