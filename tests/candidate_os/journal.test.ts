// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { AuditEntry } from '@/domain/types';
import { planAuditRecord, RecordAuditError, capGuestEntries, snapshotOf } from '@/features/journal/auditRecorder';
import { computeDelta, formatDelta } from '@/features/journal/deltaEngine';
import { applyRescan, markGapAddressed, statusOf } from '@/features/journal/gapStatus';
import { gap, input, makeDeps, RESUME_B, JD } from './fixtures';

async function run(entries: AuditEntry[], deps: ReturnType<typeof makeDeps>, over = {}) {
  const plan = await planAuditRecord(input(over), entries, deps);
  if (plan.status === 'created') entries.push(plan.entry);
  return plan;
}

describe('planAuditRecord', () => {
  it('snapshot-locks the exact normalized text that was scored', async () => {
    const deps = makeDeps(); const p = await planAuditRecord(input({ resume: { workspaceId: null, versionId: null, label: 'x', rawText: 'A\r\nB  \r\n' } }), [], deps);
    if (p.status !== 'created') throw new Error('expected created');
    expect(p.resumeSnapshot.text).toBe('A\nB');
    expect(p.entry.resume.snapshotHash).toBe(p.resumeSnapshot.hash);
    expect(p.entry.jd.snapshotHash).toBe(p.jdSnapshot.hash);
    expect((await snapshotOf('A\nB', deps.now())).hash).toBe(p.resumeSnapshot.hash);
  });
  it('is idempotent by runKey: identical inputs never create a second row', async () => {
    const deps = makeDeps(); const entries: AuditEntry[] = [];
    const a = await run(entries, deps); deps.tick(); const b = await run(entries, deps);
    expect(a.status).toBe('created'); expect(b.status).toBe('duplicate'); expect(entries).toHaveLength(1);
  });
  it('treats an engine version bump as a new run', async () => {
    const deps = makeDeps(); const entries: AuditEntry[] = [];
    await run(entries, deps); deps.tick(); const b = await run(entries, deps, { engineVersion: '3.5.0' });
    expect(b.status).toBe('created');
  });
  it('first run has no delta; second run for the same target gets +18% with resolved gaps', async () => {
    const deps = makeDeps(); const entries: AuditEntry[] = [];
    const first = await run(entries, deps);
    expect(first.entry.delta).toBeNull();
    deps.tick();
    const second = await run(entries, deps, {
      resume: { workspaceId: 'w1', versionId: 'v2', label: 'Backend Systems / v2', rawText: RESUME_B }, overallScore: 71,
      breakdown: [{ key: 'skills', label: 'Skills', score: 74 }, { key: 'impact', label: 'Impact', score: 40 }],
      gaps: [gap('skill:docker', 2), gap('skill:system-design', 1)],
    });
    const d = second.entry.delta!;
    expect(formatDelta(d.overallDeltaPts)).toBe('+18%');
    expect(d.baselineAuditId).toBe(first.entry.id);
    expect(d.resolvedGapIds).toEqual(['skill:kafka', 'skill:kubernetes']);
    expect(d.newGapIds).toEqual(['skill:system-design']);
    expect(d.persistedGapIds).toEqual(['skill:docker']);
    expect(d.breakdownDeltaPts).toEqual({ skills: 19, impact: 0 });
  });
  it('never mixes baselines across tools or targets', async () => {
    const deps = makeDeps(); const entries: AuditEntry[] = [];
    await run(entries, deps); deps.tick();
    const otherKind = await run(entries, deps, { kind: 'talentlens', resume: { workspaceId: null, versionId: null, label: 'r', rawText: RESUME_B } });
    expect(otherKind.entry.delta).toBeNull();
    deps.tick();
    const otherTarget = await run(entries, deps, { jd: { rawText: JD, origin: 'pasted', company: 'Zeta', roleTitle: 'SRE' }, resume: { workspaceId: null, versionId: null, label: 'r', rawText: RESUME_B } });
    expect(otherTarget.entry.delta).toBeNull();
  });
  it('uses the most recent earlier entry as baseline (three runs)', async () => {
    const deps = makeDeps(); const entries: AuditEntry[] = [];
    const r1 = await run(entries, deps, { overallScore: 40 }); deps.tick();
    const r2 = await run(entries, deps, { overallScore: 55, resume: { workspaceId: null, versionId: null, label: 'r2', rawText: RESUME_B } }); deps.tick();
    const r3 = await run(entries, deps, { overallScore: 70, resume: { workspaceId: null, versionId: null, label: 'r3', rawText: RESUME_B + '\nMore.' } });
    expect(r2.entry.delta!.baselineAuditId).toBe(r1.entry.id);
    expect(r3.entry.delta!.baselineAuditId).toBe(r2.entry.id);
    expect(r3.entry.delta!.overallDeltaPts).toBe(15);
  });
  it('validates, clamps and sanitizes', async () => {
    const deps = makeDeps();
    await expect(planAuditRecord(input({ overallScore: NaN }), [], deps)).rejects.toMatchObject({ code: 'BAD_SCORE' });
    await expect(planAuditRecord(input({ resume: { workspaceId: null, versionId: null, label: 'x', rawText: ' \n ' } }), [], deps)).rejects.toBeInstanceOf(RecordAuditError);
    await expect(planAuditRecord(input({ resume: { workspaceId: null, versionId: null, label: 'x', rawText: 'a'.repeat(60_001) } }), [], deps)).rejects.toMatchObject({ code: 'RESUME_TOO_LONG' });
    await expect(planAuditRecord(input({ breakdown: [{ key: 'a', label: 'A', score: 1 }, { key: 'a', label: 'A2', score: 2 }] }), [], deps)).rejects.toMatchObject({ code: 'DUPLICATE_BREAKDOWN_KEY' });
    const p = await planAuditRecord(input({ overallScore: 130.4, gaps: [gap('skill:a', 1), gap('skill:a', 3)], evidence: [{ start: 0, end: 5, findingId: 'f', kind: 'match' }, { start: 9999, end: 10005, findingId: 'g', kind: 'weak' }, { start: 3, end: 3, findingId: 'h', kind: 'weak' }] }), [], deps);
    if (p.status !== 'created') throw new Error();
    expect(p.entry.overallScore).toBe(100); expect(p.entry.gaps).toHaveLength(1); expect(p.entry.gaps[0]!.severity).toBe(3);
    expect(p.entry.evidence).toHaveLength(1); expect(p.droppedEvidence).toBe(2);
  });
  it('deep-copies findings so later engine mutations cannot rewrite history', async () => {
    const deps = makeDeps(); const findings = { a: { b: 1 } };
    const p = await planAuditRecord(input({ findings }), [], deps); findings.a.b = 999;
    expect((p.entry.findingsJson as typeof findings).a.b).toBe(1);
  });
  it('caps guest history to the newest N', () => {
    const e = (i: number) => ({ id: String(i), createdAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }) as AuditEntry;
    expect(capGuestEntries([e(0), e(5), e(2), e(9)], 2).map((x) => x.id)).toEqual(['9', '5']);
  });
});

describe('computeDelta', () => {
  it('omits breakdown keys that exist on one side only and formats signs', () => {
    const d = computeDelta({ id: 'b', createdAt: 'x', overallScore: 50, breakdown: [{ key: 'a', label: 'A', score: 50 }, { key: 'old', label: 'O', score: 10 }], gaps: [] },
      { overallScore: 44, breakdown: [{ key: 'a', label: 'A', score: 45 }, { key: 'new', label: 'N', score: 10 }], gaps: [] });
    expect(d.breakdownDeltaPts).toEqual({ a: -5 }); expect(formatDelta(d.overallDeltaPts)).toBe('-6%'); expect(formatDelta(0)).toBe('0%');
  });
});

describe('gap overlay truth rule', () => {
  const T = 'tl:airtel:be';
  it('completing a plan item only marks pending, never resolved', () => {
    const o = markGapAddressed({}, T, 'skill:kafka', 'p1', 't1');
    expect(statusOf(o, T, 'skill:kafka')).toBe('addressed_pending_rescan');
    expect(markGapAddressed(o, T, 'skill:kafka', 'p2', 't2')).toBe(o);
  });
  it('resolves only when a later audit no longer reports the gap', () => {
    const o = markGapAddressed({}, T, 'skill:kafka', 'p1', 't1');
    const gone = applyRescan(o, T, ['skill:docker'], 't2');
    expect(statusOf(gone.overlay, T, 'skill:kafka')).toBe('resolved'); expect(gone.report.resolved).toEqual(['skill:kafka']);
    const still = applyRescan(o, T, ['skill:kafka'], 't2');
    expect(statusOf(still.overlay, T, 'skill:kafka')).toBe('open'); expect(still.overlay[`${T}|skill:kafka`]!.stillDetected).toBe(true);
  });
  it('detects regressions and ignores other targets', () => {
    const resolved = applyRescan(markGapAddressed({}, T, 'skill:kafka', 'p1', 't1'), T, [], 't2').overlay;
    const back = applyRescan(resolved, T, ['skill:kafka'], 't3');
    expect(back.report.regressed).toEqual(['skill:kafka']); expect(statusOf(back.overlay, T, 'skill:kafka')).toBe('open');
    const other = applyRescan(markGapAddressed({}, 'jd:other', 'skill:kafka', 'p', 't'), T, [], 't9');
    expect(statusOf(other.overlay, 'jd:other', 'skill:kafka')).toBe('addressed_pending_rescan');
  });
  it('does not mutate the input overlay', () => {
    const o = Object.freeze({ [`${T}|skill:a`]: { status: 'addressed_pending_rescan' as const, updatedAt: 't' } });
    expect(() => applyRescan(o, T, [], 'x')).not.toThrow();
  });
});
