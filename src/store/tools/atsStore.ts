// ============================================================
// HireFlow v3 — ATS Candidate Tool Store
// Ephemeral store for resume scanning, JD matching, fix simulation.
// Versioned schema with auto-migration.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export interface AtsToolState {
  version: number;
  rawResumeText: string;
  resumeFileName: string;
  jdText: string;
  appliedFixIds: string[];
  scanHistory: AtsScanHistoryEntry[];
  latestMissingSkills: string[];
  
  // Actions
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
  version: 3,
  rawResumeText: '',
  resumeFileName: '',
  jdText: '',
  appliedFixIds: [] as string[],
  scanHistory: [] as AtsScanHistoryEntry[],
  latestMissingSkills: [] as string[],
};

export const useAtsToolStore = create<AtsToolState>()(
  persist(
    (set) => ({
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
            ...state.scanHistory.slice(0, 19), // Keep latest 20 scans
          ],
        })),

      clearHistory: () => set({ scanHistory: [] }),

      resetAtsTool: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'hireflow_tool_ats_v3',
      version: 3,
      migrate: (persisted: any) => {
        if (!persisted) return DEFAULT_STATE;
        return {
          ...DEFAULT_STATE,
          ...persisted,
          version: 3,
        };
      },
    }
  )
);
