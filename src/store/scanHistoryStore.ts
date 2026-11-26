// ============================================================
// HireFlow — Scan History Store (In-Memory Projection)
// Authenticated history is hydrated from Supabase `audit_entries`.
// Zero localStorage persistence of scan records.
// ============================================================

import { create } from 'zustand';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';
import { ENGINE_VERSION, computeConfigFingerprint } from '../config/versions';
import { ScanRecord } from '../types/schemas-v4';
import { toast } from '../components/ui/Toast';

export interface NewScanInput {
  tool: 'roaster' | 'jd-compare' | 'talentlens' | 'tailor-validate';
  resumeVersionId: string;
  resumeLabel: string;
  resumeTextHash: string;
  targetKind: 'jd' | 'preset' | 'role';
  targetLabel: string;
  targetHash: string;
  scores: Record<string, number>;
  pillars: Record<string, number>;
  gaps: string[];
  findingCounts: Record<string, number>;
}

export interface ScanHistoryState {
  scans: ScanRecord[];
  recordScan: (input: NewScanInput) => string | null;
  deleteScan: (id: string) => void;
  clearAllScans: () => void;
  getScansByTarget: (targetHash: string) => ScanRecord[];
}

export const useScanHistoryStore = create<ScanHistoryState>((set, get) => ({
  scans: [],

  recordScan: (input) => {
    const current = get();
    if (current.scans.length >= LIMITS.maxScanHistory) {
      toast(
        'warning',
        `Scan history cap of ${LIMITS.maxScanHistory} reached. Please delete older scans.`
      );
      return null;
    }

    const newScan: ScanRecord = {
      id: createId(),
      createdAt: nowIso(),
      tool: input.tool,
      resumeVersionId: input.resumeVersionId,
      resumeLabel: input.resumeLabel,
      resumeTextHash: input.resumeTextHash,
      targetKind: input.targetKind,
      targetLabel: input.targetLabel,
      targetHash: input.targetHash,
      scores: input.scores,
      pillars: input.pillars,
      gaps: input.gaps,
      findingCounts: input.findingCounts,
      engineVersion: ENGINE_VERSION,
      configFingerprint: computeConfigFingerprint(),
    };

    const nextScans = [newScan, ...current.scans];
    set({ scans: nextScans });
    return newScan.id;
  },

  deleteScan: (id) => {
    set({ scans: get().scans.filter((s) => s.id !== id) });
  },

  clearAllScans: () => {
    set({ scans: [] });
  },

  getScansByTarget: (targetHash) => {
    return get().scans.filter((s) => s.targetHash === targetHash);
  },
}));
