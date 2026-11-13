// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { AuditEntry, EvidenceSpan, JournalEvent, WatchlistTarget } from '@/domain/types';
import { buildHighlightSegments, firstSpanOf } from '@/features/inspector/buildHighlightSegments';
import { rankForGaps } from '@/features/portal/gapMatcher';
import { averageRecentDelta, buildTimeline, buildWatchlistRows, groupByDay } from '@/features/portal/portalSelectors';
import { gap } from './fixtures';

const sp = (start: number, end: number, findingId: string, kind: EvidenceSpan['kind'] = 'match'): EvidenceSpan => ({ start, end, findingId, kind });

describe('buildHighlightSegments', () => {
  it('partitions the full text with no gaps or overlaps (fuzz)', () => {
    let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
    const kinds: EvidenceSpan['kind'][] = ['match', 'weak', 'missing_context', 'format_issue'];
    for (let n = 0; n < 300; n++) {
      const text = 'x'.repeat(1 + Math.floor(rnd() * 200));
      const spans = Array.from({ length: Math.floor(rnd() * 12) }, (_, i) => { const a = Math.floor(rnd() * 260) - 20; return sp(a, a + Math.floor(rnd() * 60) - 5, `f${i}`, kinds[Math.floor(rnd() * 4)]!); });
      const segs = buildHighlightSegments(text, spans);
      expect(segs.map((s) => s.text).join('')).toBe(text);
      let pos = 0; for (const s of segs) { expect(s.start).toBe(pos); expect(s.end).toBeGreaterThan(s.start); pos = s.end; }
      expect(pos).toBe(text.length);
    }
  });
  it('splits overlaps and applies priority', () => {
    const segs = buildHighlightSegments('0123456789', [sp(0, 6, 'a', 'match'), sp(4, 9, 'b', 'format_issue')]);
    expect(segs.map((s) => [s.start, s.end, s.primaryKind])).toEqual([[0, 4, 'match'], [4, 6, 'format_issue'], [6, 9, 'format_issue'], [9, 10, null]]);
    expect(segs[1]!.findingIds.sort()).toEqual(['a', 'b']);
  });
  it('handles empty text, empty spans, and finds first span', () => {
    expect(buildHighlightSegments('', [sp(0, 3, 'a')])).toEqual([]);
    expect(buildHighlightSegments('abc', [])).toEqual([{ start: 0, end: 3, text: 'abc', kinds: [], findingIds: [], primaryKind: null }]);
    expect(firstSpanOf('f', [sp(9, 12, 'f'), sp(2, 4, 'f'), sp(0, 1, 'g')])).toEqual(sp(2, 4, 'f'));
    expect(firstSpanOf('none', [])).toBeNull();
  });
});

describe('rankForGaps', () => {
  const catalog = [
    { id: 'c1', title: 'Apache Kafka Fundamentals', tags: ['Kafka', 'Streaming'] },
    { id: 'c2', title: 'Kubernetes Administrator', tags: ['Kubernetes', 'Docker'] },
    { id: 'c3', title: 'Intro to Cooking', tags: ['Food'] },
    { id: 'c4', title: 'Docker Deep Dive', tags: ['Docker'] },
  ];
  it('ranks by severity-weighted match, deterministically, excluding non-matches', () => {
    const r = rankForGaps([gap('skill:kafka', 3), gap('skill:docker', 1)], catalog, 5);
    // c2 and c4 tie (both match the docker gap via tag), so catalog order decides: c2 before c4.
    expect(r.map((x) => x.item.id)).toEqual(['c1', 'c2', 'c4']);
    expect(r[0]!.item.id).toBe('c1'); expect(r.find((x) => x.item.id === 'c3')).toBeUndefined();
    expect(rankForGaps([gap('skill:kafka', 3), gap('skill:docker', 1)], catalog, 5)).toEqual(r);
  });
  it('does not confuse c with c++', () => {
    const cat = [{ id: 'a', title: 'C Programming', tags: ['C'] }, { id: 'b', title: 'C++ Mastery', tags: ['C++'] }];
    expect(rankForGaps([{ ...gap('skill:c++', 3), label: 'C++' }], cat).map((x) => x.item.id)).toEqual(['b']);
  });
});

function entry(i: number, over: Partial<AuditEntry> = {}): AuditEntry {
  return { schemaVersion: 1, id: `e${String(i).padStart(5, '0')}`, kind: 'ats_roast', createdAt: new Date(Date.UTC(2026, 0, 1) + i * 3_600_000).toISOString(), engineVersion: '1', runKey: `r${i}`,
    targetKey: `t${i % 40}`, resume: { workspaceId: null, versionId: null, snapshotHash: 'h', label: 'R' }, jd: { snapshotHash: 'j', origin: 'pasted', company: `C${i % 40}`, roleTitle: 'Eng' },
    overallScore: 40 + (i % 50), breakdown: [], gaps: [gap('skill:a')], strengths: [], evidence: [], findingsJson: null, delta: i % 3 === 0 ? null : { baselineAuditId: 'x', baselineCreatedAt: 'y', overallDeltaPts: (i % 7) - 3, breakdownDeltaPts: {}, resolvedGapIds: [], newGapIds: [], persistedGapIds: [] }, ...over };
}
const target = (k: string, archived = false): WatchlistTarget => ({ id: k, targetKey: k, companyName: k, addedAt: '2026-01-01T00:00:00.000Z', archivedAt: archived ? 'z' : null });

describe('portal selectors', () => {
  it('builds watchlist rows with best/latest/sparkline and skips archived', () => {
    const es = [entry(0, { targetKey: 'T', overallScore: 50 }), entry(1, { targetKey: 'T', overallScore: 80 }), entry(2, { targetKey: 'T', overallScore: 70 })];
    const rows = buildWatchlistRows([target('T'), target('A', true), target('Empty')], es);
    expect(rows.map((r) => r.target.targetKey)).toEqual(['T', 'Empty']);
    expect(rows[0]).toMatchObject({ bestScore: 80, latestScore: 70, sparkline: [50, 80, 70], lastAuditId: 'e00002' });
    expect(rows[1]).toMatchObject({ bestScore: null, latestScore: null, sparkline: [] });
  });
  it('merges, filters and groups the timeline', () => {
    const ev: JournalEvent = { id: 'ev1', type: 'plan_item_added', createdAt: '2026-01-01T02:30:00.000Z', summary: 'Added Kafka course', targetKey: 'T' };
    const es = [entry(0, { targetKey: 'T' }), entry(1, { targetKey: 'T' }), entry(5, { targetKey: 'U', kind: 'talentlens' })];
    const all = buildTimeline(es, [ev]);
    expect(all.map((x) => x.id)).toEqual(['e00005', 'ev1', 'e00001', 'e00000']);
    expect(buildTimeline(es, [ev], { kind: 'talentlens' }).map((x) => x.id)).toEqual(['e00005']);
    expect(buildTimeline(es, [ev], { targetKey: 'T' }).map((x) => x.id)).toEqual(['ev1', 'e00001', 'e00000']);
    expect(groupByDay(all).map((g) => [g.day, g.items.length])).toEqual([['2026-01-01', 4]]);
  });
  it('averages the last five deltas', () => {
    expect(averageRecentDelta([entry(0), entry(1, { delta: { baselineAuditId: 'x', baselineCreatedAt: 'y', overallDeltaPts: 10, breakdownDeltaPts: {}, resolvedGapIds: [], newGapIds: [], persistedGapIds: [] } })])).toBe(10);
    expect(averageRecentDelta([])).toBeNull();
  });
  it('stays fast with 5,000 audits and 40 targets (perf budget)', () => {
    const es = Array.from({ length: 5000 }, (_, i) => entry(i)); const ts = Array.from({ length: 40 }, (_, i) => target(`t${i}`));
    const t0 = performance.now(); const rows = buildWatchlistRows(ts, es); const tl = buildTimeline(es, []); const g = groupByDay(tl); const dt = performance.now() - t0;
    expect(rows).toHaveLength(40); expect(g.length).toBeGreaterThan(0); expect(dt).toBeLessThan(250);
  });
});
