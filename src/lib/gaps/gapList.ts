/**
 * HireFlow v4: Deterministic Gap List Derivation (A1.3)
 * Derives an unified gap list across recent scans.
 * Deduplicates by skillId, preserves highest weightClass, and computes open/closed state.
 */

import { ScanRecord } from '../../types/schemas-v4';
import { ActiveResume } from '../../store/profileStore';

export interface GapItem {
  skillId: string;
  displayName: string;
  weightClass: 'mandatory' | 'preferred';
  currentEvidenceLevel: number | null;
  sourceScanId: string;
  sourceJdLabel: string;
  status: 'open' | 'closed';
}

/**
 * Derives an aggregated, deduplicated gap list from scan records and active resume state.
 */
export function deriveGapList(
  scans: ScanRecord[],
  activeResume?: ActiveResume | null
): GapItem[] {
  if (!scans || scans.length === 0) {
    return [];
  }

  const gapMap = new Map<string, GapItem>();

  // Process scans from oldest to newest so newest values take precedence
  const sortedScans = [...scans].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const scan of sortedScans) {
    for (const rawGap of scan.gaps) {
      const skillId = rawGap.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const isMandatory = !rawGap.toLowerCase().includes('optional') && !rawGap.toLowerCase().includes('preferred');
      const weightClass: 'mandatory' | 'preferred' = isMandatory ? 'mandatory' : 'preferred';

      // Check if candidate demonstrated this skill in active resume ledger
      let currentEvidenceLevel: number | null = null;
      let isClosed = false;

      if (activeResume?.ledger) {
        // Inspect projects, internships, certifications for mentions
        const textToSearch = JSON.stringify(activeResume.ledger).toLowerCase();
        if (textToSearch.includes(rawGap.toLowerCase()) || textToSearch.includes(skillId)) {
          currentEvidenceLevel = 1; // demonstrated in bullet
          isClosed = true;
        }
      }

      const existing = gapMap.get(skillId);
      if (existing) {
        // Upgrade weightClass if mandatory
        const bestWeight =
          existing.weightClass === 'mandatory' || weightClass === 'mandatory'
            ? 'mandatory'
            : 'preferred';

        gapMap.set(skillId, {
          skillId,
          displayName: rawGap,
          weightClass: bestWeight,
          currentEvidenceLevel: currentEvidenceLevel ?? existing.currentEvidenceLevel,
          sourceScanId: scan.id,
          sourceJdLabel: scan.targetLabel,
          status: isClosed ? 'closed' : existing.status,
        });
      } else {
        gapMap.set(skillId, {
          skillId,
          displayName: rawGap,
          weightClass,
          currentEvidenceLevel,
          sourceScanId: scan.id,
          sourceJdLabel: scan.targetLabel,
          status: isClosed ? 'closed' : 'open',
        });
      }
    }
  }

  return Array.from(gapMap.values()).sort((a, b) => {
    // Sort mandatory first, then alphabetically
    if (a.weightClass === 'mandatory' && b.weightClass !== 'mandatory') return -1;
    if (a.weightClass !== 'mandatory' && b.weightClass === 'mandatory') return 1;
    return a.displayName.localeCompare(b.displayName);
  });
}
