import { describe, expect, it } from 'vitest';
import { buildDemoDataset } from '@/features/demo/demoDataset';
import { demoAvailability, explainAuthError } from '@/features/auth/demoAuth';
import { statusOf } from '@/features/journal/gapStatus';
import { auditToRow, rowToAudit } from '@/sync/mappers';
import { MAX_PAYLOAD_BYTES, orderOps, payloadBytes, validateOp, type SyncOp } from '@/sync/syncCore';
import { findSlopInTexts, humanizeEnum } from '@/lib/ui/copy';
import { formatDelta } from '@/features/journal/deltaEngine';
import { buildTimeline, buildWatchlistRows } from '@/features/my-space/mySpaceSelectors';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe('demo dataset', () => {
  it('is deterministic', async () => { expect(await buildDemoDataset()).toEqual(await buildDemoDataset()); });

  it('tells a coherent improvement story through the real recorder', async () => {
    const d = await buildDemoDataset();
    const rz = d.audits.filter((a) => a.jd.company === 'Razorpay');
    expect(rz.map((a) => a.overallScore)).toEqual([52, 64, 71]);
    expect(rz.map((a) => (a.delta ? formatDelta(a.delta.overallDeltaPts) : null))).toEqual([null, '+12%', '+7%']);
    expect(rz[1]!.delta!.resolvedGapIds.sort()).toEqual(['skill:change-data-capture', 'skill:transactional-outbox']);
    expect(rz[2]!.delta!.resolvedGapIds).toEqual(['skill:kafka']);
    const goog = d.audits.find((a) => a.jd.company === 'Google')!;
    expect(goog.kind).toBe('talentlens'); expect(goog.delta).toBeNull();
  });

  it('honours the truth rule: completed brief resolved only after the re-scan, in-progress items stay open', async () => {
    const d = await buildDemoDataset(); const tk = d.audits[0]!.targetKey;
    expect(statusOf(d.gapOverlay, tk, 'skill:transactional-outbox')).toBe('resolved');
    expect(statusOf(d.gapOverlay, tk, 'skill:change-data-capture')).toBe('resolved');
    expect(statusOf(d.gapOverlay, tk, 'skill:aws')).toBe('open');
    expect(d.planItems.map((p) => p.status).sort()).toEqual(['done', 'in_progress', 'planned']);
  });

  it('is internally consistent: valid uuids, snapshots exist for every reference, evidence inside bounds', async () => {
    const d = await buildDemoDataset(); const snaps = new Map(d.snapshots.map((s) => [s.hash, s]));
    const ids = [...d.audits, ...d.workspaces, ...d.versions, ...d.targets, ...d.planItems, ...d.drafts, ...d.events].map((x) => x.id);
    expect(ids.every((i) => UUID.test(i))).toBe(true); expect(new Set(ids).size).toBe(ids.length);
    for (const v of d.versions) expect(snaps.has(v.snapshotHash)).toBe(true);
    for (const a of d.audits) {
      const r = snaps.get(a.resume.snapshotHash)!; expect(snaps.has(a.jd.snapshotHash)).toBe(true);
      for (const s of a.evidence) { expect(s.start).toBeGreaterThanOrEqual(0); expect(s.end).toBeLessThanOrEqual(r.text.length); }
      expect(d.versions.some((v) => v.id === a.resume.versionId)).toBe(true);
    }
    for (const w of d.workspaces) expect(d.versions.some((v) => v.id === w.headVersionId)).toBe(true);
  });

  it('syncs cleanly: audit rows round-trip, ops validate, order parents first, stay under the payload cap', async () => {
    const d = await buildDemoDataset();
    const ops: SyncOp[] = [
      ...d.audits.map((a): SyncOp => ({ opId: `a${a.id}`, table: 'audit_entries', op: 'insert_ignore', pk: { id: a.id }, payload: auditToRow(a) as unknown as Record<string, unknown>, clientUpdatedAt: a.createdAt, attempts: 0, enqueuedAt: a.createdAt })),
      ...d.snapshots.map((s): SyncOp => ({ opId: `s${s.hash}`, table: 'text_snapshots', op: 'insert_ignore', pk: { hash: s.hash }, payload: { hash: s.hash, body: s.text }, clientUpdatedAt: s.createdAt, attempts: 0, enqueuedAt: s.createdAt })),
    ];
    for (const o of ops) { expect(validateOp(o)).toBeNull(); expect(payloadBytes(o.payload)).toBeLessThan(MAX_PAYLOAD_BYTES); }
    const ordered = orderOps(ops); const firstAudit = ordered.findIndex((o) => o.table === 'audit_entries');
    expect(ordered.slice(0, firstAudit).every((o) => o.table === 'text_snapshots')).toBe(true);
    for (const a of d.audits) expect(rowToAudit(auditToRow(a))).toEqual(a);
  });

  it('renders through the real selectors with no slop in anything a person would read', async () => {
    const d = await buildDemoDataset();
    const rows = buildWatchlistRows(d.targets, d.audits);
    // Most recently scanned target first: Google was analysed after the last Razorpay scan.
    expect(rows.map((r) => [r.target.companyName, r.latestScore, r.bestScore])).toEqual([['Google', 48, 48], ['Razorpay', 71, 71]]);
    expect(buildTimeline(d.audits, d.events).length).toBe(d.audits.length + d.events.length);
    const visible = [d.profile.displayName, ...d.planItems.map((p) => p.title), ...d.drafts.map((x) => x.renderedText), ...d.drafts.map((x) => humanizeEnum(x.channel)),
      ...d.targets.map((t) => `${t.companyName} ${t.roleTitle ?? ''}`), ...d.events.map((e) => e.summary), ...d.workspaces.map((w) => w.name)];
    expect(findSlopInTexts(visible)).toEqual([]);
  });
});

describe('demoAvailability', () => {
  const cloud = { VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k', VITE_DEMO_EMAIL: 'demo@hireflow.dev', VITE_DEMO_PASSWORD: 'pw' };
  it('is off by default and blocked in production unless explicitly allowed', () => {
    expect(demoAvailability({})).toEqual({ enabled: false, reason: 'flag_off' });
    expect(demoAvailability({ MODE: 'production', VITE_DEMO_LOGIN: '1', ...cloud })).toEqual({ enabled: false, reason: 'blocked_in_production' });
    expect(demoAvailability({ MODE: 'production', VITE_DEMO_LOGIN: '1', VITE_DEMO_ALLOW_PRODUCTION: '1', ...cloud })).toEqual({ enabled: true, storage: 'cloud' });
  });
  it('uses cloud storage when Supabase is configured, local otherwise, and requires credentials for cloud', () => {
    expect(demoAvailability({ MODE: 'development', VITE_DEMO_LOGIN: '1', ...cloud })).toEqual({ enabled: true, storage: 'cloud' });
    expect(demoAvailability({ MODE: 'development', VITE_DEMO_LOGIN: '1' })).toEqual({ enabled: true, storage: 'local' });
    expect(demoAvailability({ MODE: 'development', VITE_DEMO_LOGIN: '1', VITE_SUPABASE_URL: 'u', VITE_SUPABASE_ANON_KEY: 'k' })).toEqual({ enabled: false, reason: 'missing_credentials' });
  });
});

describe('explainAuthError', () => {
  it('maps the common Google and Supabase failures to a fix', () => {
    expect(explainAuthError({})).toBeNull();
    expect(explainAuthError({ error: 'invalid_request', error_description: 'redirect_uri_mismatch' })!.title).toMatch(/redirect/i);
    expect(explainAuthError({ error_code: 'validation_failed', error_description: 'Unsupported provider: provider is not enabled' })!.title).toMatch(/not turned on/i);
    expect(explainAuthError({ error: 'access_denied' })!.fix).toMatch(/test user/i);
    expect(explainAuthError({ error_description: 'invalid flow state, no valid flow state found' })!.title).toMatch(/could not be completed/i);
    expect(explainAuthError({ error: 'server_error' })!.title).toBe('Sign-in failed');
  });
  it('produces copy that passes the slop check', () => {
    const texts = ['redirect_uri_mismatch', 'provider is not enabled', 'access_denied', 'invalid flow state', 'server_error']
      .flatMap((e) => { const p = explainAuthError({ error_description: e })!; return [p.title, p.detail, p.fix]; });
    expect(findSlopInTexts(texts)).toEqual([]);
  });
});

