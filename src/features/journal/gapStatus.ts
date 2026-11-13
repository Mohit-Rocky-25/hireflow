import type { GapOverlay, GapOverlayEntry, IsoDate, Uuid } from '@/domain/types';

export const overlayKey = (targetKey: string, gapId: string): string => `${targetKey}|${gapId}`;

/** A completed plan item only moves a gap from open to pending. It never resolves it. */
export function markGapAddressed(
  overlay: GapOverlay, targetKey: string, gapId: string, planItemId: Uuid, now: IsoDate,
): GapOverlay {
  const key = overlayKey(targetKey, gapId);
  const cur = overlay[key];
  if (cur && cur.status !== 'open') return overlay;
  const next: GapOverlayEntry = { status: 'addressed_pending_rescan', planItemId, updatedAt: now };
  return { ...overlay, [key]: next };
}

export interface RescanReport {
  resolved: string[];
  stillDetected: string[];
  regressed: string[];
}

/** Truth rule: only a later audit that no longer reports a gap can resolve it. */
export function applyRescan(
  overlay: GapOverlay, targetKey: string, currentGapIds: readonly string[], now: IsoDate,
): { overlay: GapOverlay; report: RescanReport } {
  const present = new Set(currentGapIds);
  const prefix = `${targetKey}|`;
  const next: Record<string, GapOverlayEntry> = { ...overlay };
  const report: RescanReport = { resolved: [], stillDetected: [], regressed: [] };
  for (const [key, entry] of Object.entries(overlay)) {
    if (!key.startsWith(prefix)) continue;
    const gapId = key.slice(prefix.length);
    if (entry.status === 'addressed_pending_rescan') {
      if (present.has(gapId)) {
        next[key] = { status: 'open', stillDetected: true, updatedAt: now };
        report.stillDetected.push(gapId);
      } else {
        next[key] = { status: 'resolved', ...(entry.planItemId ? { planItemId: entry.planItemId } : {}), updatedAt: now };
        report.resolved.push(gapId);
      }
    } else if (entry.status === 'resolved' && present.has(gapId)) {
      next[key] = { status: 'open', updatedAt: now };
      report.regressed.push(gapId);
    }
  }
  report.resolved.sort();
  report.stillDetected.sort();
  report.regressed.sort();
  return { overlay: next, report };
}

export function statusOf(overlay: GapOverlay, targetKey: string, gapId: string): GapOverlayEntry['status'] {
  return overlay[overlayKey(targetKey, gapId)]?.status ?? 'open';
}
