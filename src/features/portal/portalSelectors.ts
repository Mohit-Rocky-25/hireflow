import type { AuditEntry, IsoDate, JournalEvent, ToolKind, Uuid, WatchlistTarget } from '@/domain/types';

export interface WatchlistRow {
  target: WatchlistTarget;
  bestScore: number | null;
  latestScore: number | null;
  latestDeltaPts: number | null;
  openGapCount: number;
  lastAuditId: Uuid | null;
  lastAuditAt: IsoDate | null;
  sparkline: number[];
}

const byTimeAsc = (a: AuditEntry, b: AuditEntry): number => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);

/** O(n) grouping. Entries from every tool kind for the same target contribute to the row. */
export function buildWatchlistRows(targets: readonly WatchlistTarget[], entries: readonly AuditEntry[]): WatchlistRow[] {
  const byTarget = new Map<string, AuditEntry[]>();
  for (const e of entries) {
    const list = byTarget.get(e.targetKey);
    if (list) list.push(e);
    else byTarget.set(e.targetKey, [e]);
  }
  return targets
    .filter((t) => t.archivedAt === null)
    .map((target): WatchlistRow => {
      const list = (byTarget.get(target.targetKey) ?? []).sort(byTimeAsc);
      const latest = list[list.length - 1];
      return {
        target,
        bestScore: list.length ? Math.max(...list.map((e) => e.overallScore)) : null,
        latestScore: latest?.overallScore ?? null,
        latestDeltaPts: latest?.delta?.overallDeltaPts ?? null,
        openGapCount: latest?.gaps.length ?? 0,
        lastAuditId: latest?.id ?? null,
        lastAuditAt: latest?.createdAt ?? null,
        sparkline: list.slice(-8).map((e) => e.overallScore),
      };
    })
    .sort((a, b) => (b.lastAuditAt ?? b.target.addedAt).localeCompare(a.lastAuditAt ?? a.target.addedAt));
}

export interface TimelineItem {
  id: Uuid;
  at: IsoDate;
  type: 'audit' | 'event';
  title: string;
  subtitle: string;
  deltaPts: number | null;
  score: number | null;
  auditId?: Uuid;
}
export interface TimelineFilter { kind?: ToolKind | 'all'; targetKey?: string | null }

export function buildTimeline(entries: readonly AuditEntry[], events: readonly JournalEvent[], f: TimelineFilter = {}): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const e of entries) {
    if (f.kind && f.kind !== 'all' && e.kind !== f.kind) continue;
    if (f.targetKey && e.targetKey !== f.targetKey) continue;
    items.push({
      id: e.id, at: e.createdAt, type: 'audit', score: e.overallScore, deltaPts: e.delta?.overallDeltaPts ?? null, auditId: e.id,
      title: [e.jd.company, e.jd.roleTitle].filter(Boolean).join(' / ') || 'Untitled target', subtitle: e.resume.label,
    });
  }
  if (!f.kind || f.kind === 'all') {
    for (const ev of events) {
      if (f.targetKey && ev.targetKey !== f.targetKey) continue;
      items.push({ id: ev.id, at: ev.createdAt, type: 'event', score: null, deltaPts: null, title: ev.summary, subtitle: ev.type });
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
}

export function groupByDay(items: readonly TimelineItem[]): Array<{ day: string; items: TimelineItem[] }> {
  const groups: Array<{ day: string; items: TimelineItem[] }> = [];
  for (const it of items) {
    const day = it.at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(it);
    else groups.push({ day, items: [it] });
  }
  return groups;
}

export function averageRecentDelta(entries: readonly AuditEntry[], n = 5): number | null {
  const deltas = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .filter((e) => e.delta !== null).slice(0, n).map((e) => (e.delta as NonNullable<AuditEntry['delta']>).overallDeltaPts);
  return deltas.length ? Math.round((deltas.reduce((s, x) => s + x, 0) / deltas.length) * 10) / 10 : null;
}
