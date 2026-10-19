/**
 * HireFlow v4: Scan History Store (A3)
 * Stores lightweight audit records of scans across candidate tools.
 * Never stores raw resume text or JD text. Stamped with ENGINE_VERSION and config fingerprint.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';
import { ENGINE_VERSION, computeConfigFingerprint } from '../config/versions';
import { ScanRecord, ScanHistoryStoreSchema, ScanHistoryStoreData } from '../types/schemas-v4';
import { registerBackupSection } from '../lib/backup/registry';
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

const STORAGE_KEY = 'scan_history';

function loadInitialScans(): ScanHistoryStoreData {
  const saved = storage.get<ScanHistoryStoreData>(STORAGE_KEY, ScanHistoryStoreSchema);
  if (saved) {
    return saved;
  }
  return { scans: [] };
}

const initialData = loadInitialScans();

export const useScanHistoryStore = create<ScanHistoryState>((set, get) => ({
  scans: initialData.scans,

  recordScan: (input) => {
    const current = get();

    // Check cap (max 60): never silently drop oldest
    if (current.scans.length >= LIMITS.maxScanHistory) {
      toast(
        'warning',
        `Scan history cap of ${LIMITS.maxScanHistory} reached. Please export a backup or delete older scans.`
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

    // Prepend to show most recent first
    const nextScans = [newScan, ...current.scans];
    set({ scans: nextScans });

    storage.set<ScanHistoryStoreData>(STORAGE_KEY, { scans: nextScans });
    return newScan.id;
  },

  deleteScan: (id) => {
    const nextScans = get().scans.filter((s) => s.id !== id);
    set({ scans: nextScans });
    storage.set<ScanHistoryStoreData>(STORAGE_KEY, { scans: nextScans });
  },

  clearAllScans: () => {
    set({ scans: [] });
    storage.set<ScanHistoryStoreData>(STORAGE_KEY, { scans: [] });
  },

  getScansByTarget: (targetHash) => {
    return get().scans.filter((s) => s.targetHash === targetHash);
  },
}));

// Register with backup registry
registerBackupSection<ScanHistoryStoreData>({
  key: 'scan_history',
  schema: ScanHistoryStoreSchema,
  version: 1,
  export: () => ({ scans: useScanHistoryStore.getState().scans }),
  import: (data, mode) => {
    if (mode === 'replace') {
      useScanHistoryStore.setState({ scans: data.scans });
      storage.set<ScanHistoryStoreData>(STORAGE_KEY, data);
      return true;
    } else {
      const current = useScanHistoryStore.getState();
      const existingIds = new Set(current.scans.map((s) => s.id));
      const merged = [...current.scans];

      for (const s of data.scans) {
        if (!existingIds.has(s.id) && merged.length < LIMITS.maxScanHistory) {
          merged.push(s);
        }
      }

      useScanHistoryStore.setState({ scans: merged });
      storage.set<ScanHistoryStoreData>(STORAGE_KEY, { scans: merged });
      return true;
    }
  },
});
