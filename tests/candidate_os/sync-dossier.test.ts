// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { AuditEntry } from '@/domain/types';
import { BACKOFF_CAP_MS, mergeImmutable, mergeLww, nextBackoffMs, orderOps, payloadBytes, validateOp, type SyncOp } from '@/sync/syncCore';
import {
  auditToRow, rowToAudit, toIso,
  snapshotToRow, rowToSnapshot,
  workspaceToRow, rowToWorkspace,
  versionToRow, rowToVersion,
  eventToRow, rowToEvent,
  targetToRow, rowToTarget,
  planItemToRow, rowToPlanItem,
  outreachToRow, rowToOutreach,
  gapStatusToRow, rowToGapStatus,
  profileToRow, rowToProfile
} from '@/sync/mappers';
import { buildDossierModel, dossierFilename, executiveSummary, scoreBand } from '@/features/dossier/dossierModel';
import { planAuditRecord } from '@/features/journal/auditRecorder';
import { gap, input, makeDeps, RESUME_B } from './fixtures';

const op = (table: SyncOp['table'], enq: string, o: Partial<SyncOp> = {}): SyncOp => ({ opId: `${table}-${enq}`, table, op: 'upsert', pk: { id: 'x' }, payload: {}, clientUpdatedAt: enq, attempts: 0, enqueuedAt: enq, ...o });

describe('sync core', () => {
  it('orders ops parents-first then FIFO, stably', () => {
    const ops = [op('audit_entries', '3', { op: 'insert_ignore' }), op('plan_items', '1'), op('text_snapshots', '4', { op: 'insert_ignore' }), op('resume_versions', '2'), op('text_snapshots', '2', { op: 'insert_ignore' })];
    expect(orderOps(ops).map((o) => `${o.table}@${o.enqueuedAt}`)).toEqual(['text_snapshots@2', 'text_snapshots@4', 'resume_versions@2', 'audit_entries@3', 'plan_items@1']);
  });
  it('forbids update/delete on immutable tables and insert_ignore on mutable ones', () => {
    expect(validateOp(op('audit_entries', '1', { op: 'upsert' }))).toMatch(/immutable/);
    expect(validateOp(op('journal_events', '1', { op: 'delete', payload: null }))).toMatch(/immutable/);
    expect(validateOp(op('text_snapshots', '1', { op: 'insert_ignore' }))).toBeNull();
    expect(validateOp(op('plan_items', '1', { op: 'insert_ignore' }))).toMatch(/mutable/);
    expect(validateOp(op('plan_items', '1', { op: 'upsert', payload: null }))).toMatch(/payload/);
    expect(validateOp(op('plan_items', '1', { op: 'delete', payload: null }))).toBeNull();
  });
  it('backoff grows, is jittered within [exp/2, exp), and caps', () => {
    expect(nextBackoffMs(0, 0)).toBe(500); expect(nextBackoffMs(0, 0.999)).toBeLessThan(1000);
    expect(nextBackoffMs(3, 0)).toBe(4000); expect(nextBackoffMs(30, 0.999)).toBeLessThan(BACKOFF_CAP_MS); expect(nextBackoffMs(30, 0)).toBe(BACKOFF_CAP_MS / 2);
    for (let a = 0; a < 12; a++) expect(nextBackoffMs(a + 1, 0)).toBeGreaterThanOrEqual(nextBackoffMs(a, 0));
  });
  it('last-write-wins keeps local on ties and never overwrites immutables', () => {
    const l = { v: 'local', updatedAt: '2026-01-01T00:00:00.000Z' }; const r = { v: 'remote', updatedAt: '2026-01-02T00:00:00.000Z' };
    expect(mergeLww(l, r).v).toBe('remote'); expect(mergeLww(r, l).v).toBe('remote'); expect(mergeLww(l, { ...r, updatedAt: l.updatedAt }).v).toBe('local'); expect(mergeLww(undefined, r).v).toBe('remote');
    expect(mergeImmutable({ a: 1 }, { a: 2 })).toEqual({ a: 1 }); expect(mergeImmutable(undefined, { a: 2 })).toEqual({ a: 2 });
  });
  it('measures payload bytes in UTF-8', () => { expect(payloadBytes({ a: 'é' })).toBe(JSON.stringify({ a: 'é' }).length + 1); });
  it('audit mapper round-trips and normalizes Postgres timestamps', async () => {
    const p = await planAuditRecord(input(), [], makeDeps()); if (p.status !== 'created') throw new Error();
    const row = auditToRow(p.entry); expect(rowToAudit(row)).toEqual(p.entry);
    const fromPg = rowToAudit({ ...row, created_at: p.entry.createdAt.replace('Z', '+00:00') });
    expect(fromPg.createdAt).toBe(p.entry.createdAt); expect(toIso('2026-11-01T10:00:00.5+00:00')).toBe('2026-11-01T10:00:00.500Z');
  });

  it('round-trips all table mappers and normalizes timestamps', () => {
    // 1. TextSnapshot
    const snap = { hash: 'a'.repeat(64), text: 'Sample text', charCount: 11, wordCount: 2, createdAt: '2026-11-12T10:00:00.000Z' };
    const snapRow = snapshotToRow(snap);
    expect(rowToSnapshot({ ...snapRow, created_at: snap.createdAt.replace('Z', '+00:00') })).toEqual(snap);

    // 2. ResumeWorkspace
    const ws = { id: 'w1', name: 'Backend', roleTrack: 'backend', isPrimary: true, headVersionId: 'v1', createdAt: '2026-11-12T10:00:00.000Z', updatedAt: '2026-11-12T10:00:00.000Z', archivedAt: null };
    const wsRow = workspaceToRow(ws);
    expect(rowToWorkspace({ ...wsRow, created_at: ws.createdAt.replace('Z', '+00:00'), updated_at: ws.updatedAt.replace('Z', '+00:00') })).toEqual(ws);

    // 3. ResumeVersion
    const ver = { id: 'v1', workspaceId: 'w1', parentVersionId: null, label: 'v1', snapshotHash: 'a'.repeat(64), source: 'upload' as const, note: 'initial', sourceFileName: 'resume.pdf', createdAt: '2026-11-12T10:00:00.000Z' };
    const verRow = versionToRow(ver);
    expect(rowToVersion({ ...verRow, created_at: ver.createdAt.replace('Z', '+00:00') })).toEqual(ver);

    // 4. JournalEvent
    const ev = { id: 'e1', type: 'plan_item_added' as const, createdAt: '2026-11-12T10:00:00.000Z', targetKey: 'tl:a:b', refId: 'r1', summary: 'Added plan', payload: { ok: true } };
    const evRow = eventToRow(ev);
    expect(rowToEvent({ ...evRow, created_at: ev.createdAt.replace('Z', '+00:00') })).toEqual(ev);

    // 5. WatchlistTarget
    const tgt = { id: 't1', targetKey: 'tl:google:swe', companyId: 'google', roleId: 'swe', companyName: 'Google', roleTitle: 'SWE', jdSnapshotHash: 'b'.repeat(64), addedAt: '2026-11-12T10:00:00.000Z', archivedAt: null };
    const tgtRow = targetToRow(tgt);
    expect(rowToTarget({ ...tgtRow, added_at: tgt.addedAt.replace('Z', '+00:00') })).toEqual(tgt);

    // 6. PlanItem
    const plan = { id: 'p1', kind: 'credential' as const, refId: 'c1', title: 'Cert', status: 'planned' as const, linkedGapIds: ['g1'], targetKey: 'tl:google:swe', addedFromAuditId: null, note: 'Study hard', createdAt: '2026-11-12T10:00:00.000Z', updatedAt: '2026-11-12T10:00:00.000Z', completedAt: null };
    const planRow = planItemToRow(plan);
    expect(rowToPlanItem({ ...planRow, created_at: plan.createdAt.replace('Z', '+00:00'), updated_at: plan.updatedAt.replace('Z', '+00:00') })).toEqual(plan);

    // 7. OutreachDraft
    const draft = { id: 'd1', templateId: 'alumni', channel: 'linkedin', status: 'draft' as const, slots: { name: 'Alex' }, renderedText: 'Hi Alex', targetKey: 'tl:google:swe', createdAt: '2026-11-12T10:00:00.000Z', updatedAt: '2026-11-12T10:00:00.000Z' };
    const draftRow = outreachToRow(draft);
    expect(rowToOutreach({ ...draftRow, created_at: draft.createdAt.replace('Z', '+00:00'), updated_at: draft.updatedAt.replace('Z', '+00:00') })).toEqual(draft);

    // 8. GapStatus
    const gs = { targetKey: 'tl:google:swe', gapId: 'skill:k8s', status: 'addressed_pending_rescan' as const, planItemId: 'p1', stillDetected: false, updatedAt: '2026-11-12T10:00:00.000Z' };
    const gsRow = gapStatusToRow(gs);
    expect(rowToGapStatus({ ...gsRow, updated_at: gs.updatedAt.replace('Z', '+00:00') })).toEqual(gs);

    // 9. UserProfiles
    const prof = {
      profile: { displayName: 'John Doe', email: 'john@example.com', targetRoles: ['SWE'], links: {}, activeWorkspaceId: null, updatedAt: '2026-11-12T10:00:00.000Z' },
      settings: { cloudSyncEnabled: true, consentRecordedAt: '2026-11-12T10:00:00.000Z' },
      updatedAt: '2026-11-12T10:00:00.000Z'
    };
    const profRow = profileToRow(prof);
    expect(rowToProfile({ ...profRow, updated_at: prof.updatedAt.replace('Z', '+00:00') })).toEqual(prof);
  });
});

describe('dossier model', () => {
  async function pair() {
    const deps = makeDeps(); const first = await planAuditRecord(input(), [], deps); if (first.status !== 'created') throw new Error(); deps.tick();
    const second = await planAuditRecord(input({ resume: { workspaceId: 'w1', versionId: 'v2', label: 'Backend Systems / v2', rawText: RESUME_B }, overallScore: 71, gaps: [gap('skill:docker', 2)] }), [first.entry], deps); if (second.status !== 'created') throw new Error();
    return { first: first.entry, second: second.entry, second_p: second };
  }
  it('builds a first-run model without delta', async () => {
    const deps = makeDeps(); const p = await planAuditRecord(input(), [], deps); if (p.status !== 'created') throw new Error();
    const m = buildDossierModel({ entry: p.entry, resumeText: p.resumeSnapshot.text, jdText: p.jdSnapshot.text, baseline: null, candidate: {}, planItems: [], generatedAt: deps.now() });
    expect(m.candidate.name).toBe('Candidate'); expect(m.headline.deltaText).toBeNull(); expect(m.summary.join(' ')).not.toMatch(/Compared with/);
    expect(m.meta.integrity.resumeHash).toBe(p.resumeSnapshot.hash);
  });
  it('builds a delta model with resolved/added gaps and plan items for the same target', async () => {
    const { first, second, second_p } = await pair();
    const m = buildDossierModel({ entry: second, resumeText: second_p.resumeSnapshot.text, jdText: second_p.jdSnapshot.text, baseline: first, candidate: { name: 'Mohit' },
      planItems: [{ id: 'p', kind: 'credential', refId: 'c', title: 'Kafka course', status: 'in_progress', linkedGapIds: [], targetKey: second.targetKey, addedFromAuditId: null, createdAt: 'x', updatedAt: 'x', completedAt: null },
        { id: 'q', kind: 'build_brief', refId: 'b', title: 'Other target', status: 'planned', linkedGapIds: [], targetKey: 'other', addedFromAuditId: null, createdAt: 'x', updatedAt: 'x', completedAt: null }], generatedAt: 'now' });
    expect(m.headline.deltaText).toBe('+18%'); expect(m.gaps.resolved.map((g) => g.id)).toEqual(['skill:kafka', 'skill:kubernetes']);
    expect(m.planned).toEqual([{ title: 'Kafka course', kind: 'credential', status: 'in_progress' }]);
    expect(m.summary.join(' ')).toContain('improved by +18%'); expect(m.summary.join(' ')).toContain('2 previously reported gaps were resolved');
  });
  it('summary bands, determinism and filename sanitation', () => {
    expect([10, 40, 60, 75, 90].map(scoreBand)).toEqual(['early', 'developing', 'competitive', 'strong', 'excellent']);
    const s = { headline: { score: 71, deltaPts: 0, deltaText: '0%', baselineDate: 'x' }, target: { company: 'Airtel', roleTitle: 'Backend Engineer', jdOrigin: 'pasted' as const }, gaps: { open: [], resolved: [], added: [] }, candidate: { name: 'a', resumeLabel: 'R' } };
    expect(executiveSummary(s)).toEqual(executiveSummary(s)); expect(executiveSummary(s).join(' ')).toContain('unchanged'); expect(executiveSummary(s).join(' ')).toContain('No open gaps');
    expect(dossierFilename('Tata Consultancy Services (TCS)!', 'Software/Dev Engineer', '2026-11-12T10:00:00.000Z', 'pdf')).toBe('hireflow-dossier_tata-consultancy-services-tcs_software-dev-engineer_2026-11-12.pdf');
    const trunc = dossierFilename('Tata Consultancy Services (TCS)!', 'Software/Dev Engineer — Grad', '2026-11-12T10:00:00.000Z', 'pdf');
    expect(trunc).toMatch(/^[a-z0-9_.-]+$/); expect(trunc.endsWith('_2026-11-12.pdf')).toBe(true); expect(trunc.length).toBeLessThanOrEqual(84);
    expect(dossierFilename(undefined, undefined, '2026-11-12T10:00:00Z', 'docx')).toBe('hireflow-dossier_2026-11-12.docx');
    const long = dossierFilename('x'.repeat(200), 'y', '2026-11-12T00:00:00Z', 'pdf');
    expect(long.length).toBeLessThanOrEqual(84); expect(long.endsWith('_2026-11-12.pdf')).toBe(true);
  });
});
export type _E = AuditEntry;
