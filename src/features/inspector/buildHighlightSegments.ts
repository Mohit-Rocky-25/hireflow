import type { EvidenceKind, EvidenceSpan } from '@/domain/types';

export interface Segment {
  start: number;
  end: number;
  text: string;
  kinds: EvidenceKind[];
  findingIds: string[];
  primaryKind: EvidenceKind | null;
}

/** Highest priority first. Used to decide which treatment wins where spans overlap. */
export const KIND_PRIORITY: readonly EvidenceKind[] = ['format_issue', 'missing_context', 'weak', 'match'];

/** Partitions the whole text into non-overlapping segments. Invalid spans are clamped or dropped. */
export function buildHighlightSegments(text: string, spans: readonly EvidenceSpan[]): Segment[] {
  const len = text.length;
  if (len === 0) return [];
  const valid = spans
    .map((s) => ({ ...s, start: Math.max(0, Math.floor(s.start)), end: Math.min(len, Math.floor(s.end)) }))
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start);

  const cuts = new Set<number>([0, len]);
  for (const s of valid) {
    cuts.add(s.start);
    cuts.add(s.end);
  }
  const points = [...cuts].sort((a, b) => a - b);
  const sorted = [...valid].sort((a, b) => a.start - b.start || a.end - b.end);

  const segments: Segment[] = [];
  let active: typeof sorted = [];
  let next = 0;
  for (let p = 0; p < points.length - 1; p++) {
    const start = points[p] as number;
    const end = points[p + 1] as number;
    while (next < sorted.length && (sorted[next] as (typeof sorted)[number]).start <= start) {
      active.push(sorted[next] as (typeof sorted)[number]);
      next++;
    }
    active = active.filter((s) => s.end > start);
    const kinds = [...new Set(active.map((s) => s.kind))].sort(
      (a, b) => KIND_PRIORITY.indexOf(a) - KIND_PRIORITY.indexOf(b),
    );
    segments.push({
      start, end, text: text.slice(start, end), kinds,
      findingIds: [...new Set(active.map((s) => s.findingId))],
      primaryKind: kinds[0] ?? null,
    });
  }
  return segments;
}

/** First span (by start offset) belonging to a finding, for scroll-to behaviour. */
export function firstSpanOf(findingId: string, spans: readonly EvidenceSpan[]): EvidenceSpan | null {
  let best: EvidenceSpan | null = null;
  for (const s of spans) if (s.findingId === findingId && (!best || s.start < best.start)) best = s;
  return best;
}
