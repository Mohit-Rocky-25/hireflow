// ============================================================
// HireFlow — ATS Candidate Tool In-Memory Session Store
// Persisted scans and snapshots for signed-in users live in Supabase Postgres
// (`audit_entries` & `text_snapshots`), never in browser localStorage.
// ============================================================

import { create } from 'zustand';
import type { AuthoritativeReportSnapshot } from '@/features/ats/engine/authoritativeSnapshot';

export interface AtsScanHistoryEntry {
  id: string;
  timestamp: string;
  resumeFileName: string;
  targetRole: string;
  score: number;
  matchedCount: number;
  missingCount: number;
  specVersion?: string;
  engineVersion?: string;
  specFingerprint?: string;
  candidateName?: string;
  targetCompany?: string;
  seniorityStatus?: string;
  isEligible?: boolean;
  authoritativeSnapshot?: AuthoritativeReportSnapshot;
  isReconstructed?: boolean;
  reconstructedFields?: string[];
  insufficientData?: boolean;
}

export interface AtsToolState {
  version: number;
  rawResumeText: string;
  resumeFileName: string;
  jdText: string;
  appliedFixIds: string[];
  scanHistory: AtsScanHistoryEntry[];
  latestMissingSkills: string[];

  setResumeText: (text: string, fileName?: string) => void;
  setJdText: (text: string) => void;
  toggleFix: (fixId: string) => void;
  clearFixes: () => void;
  setLatestMissingSkills: (skills: string[]) => void;
  addHistoryEntry: (entry: Omit<AtsScanHistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  resetAtsTool: () => void;
}

const DEFAULT_STATE = {
  version: 4,
  rawResumeText: '',
  resumeFileName: '',
  jdText: '',
  appliedFixIds: [] as string[],
  scanHistory: [] as AtsScanHistoryEntry[],
  latestMissingSkills: [] as string[],
};

export const useAtsToolStore = create<AtsToolState>()((set) => ({
  ...DEFAULT_STATE,

  setResumeText: (text, fileName = 'resume.pdf') =>
    set({ rawResumeText: text, resumeFileName: fileName }),

  setJdText: (text) => set({ jdText: text }),

  toggleFix: (fixId) =>
    set((state) => {
      const exists = state.appliedFixIds.includes(fixId);
      return {
        appliedFixIds: exists
          ? state.appliedFixIds.filter((id) => id !== fixId)
          : [...state.appliedFixIds, fixId],
      };
    }),

  clearFixes: () => set({ appliedFixIds: [] }),

  setLatestMissingSkills: (skills) => set({ latestMissingSkills: skills }),

  addHistoryEntry: (entry) =>
    set((state) => ({
      scanHistory: [
        {
          ...entry,
          id: 'scan-' + Date.now().toString(36),
          timestamp: new Date().toISOString(),
        },
        ...state.scanHistory.slice(0, 19),
      ],
    })),

  clearHistory: () => set({ scanHistory: [] }),

  resetAtsTool: () => set({ ...DEFAULT_STATE }),
}));
