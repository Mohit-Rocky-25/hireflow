// ============================================================
// HireFlow v3 — Cover Letter Tool Store (In-Memory)
// ============================================================

import { create } from 'zustand';

export interface SavedCoverLetter {
  id: string;
  companyName: string;
  roleTitle: string;
  tone: 'professional' | 'enthusiastic' | 'concise' | 'technical';
  content: string;
  createdAt: string;
}

export interface CoverLetterToolState {
  version: number;
  drafts: SavedCoverLetter[];
  activeDraft: string;
  targetCompany: string;
  targetRole: string;
  
  // Actions
  setActiveDraft: (content: string) => void;
  setTargetInfo: (company: string, role: string) => void;
  saveCurrentDraft: (tone: SavedCoverLetter['tone']) => void;
  deleteDraft: (id: string) => void;
  resetCoverLetterTool: () => void;
}

const DEFAULT_STATE = {
  version: 3,
  drafts: [] as SavedCoverLetter[],
  activeDraft: '',
  targetCompany: '',
  targetRole: '',
};

export const useCoverLetterToolStore = create<CoverLetterToolState>()((set) => ({
  ...DEFAULT_STATE,

  setActiveDraft: (activeDraft) => set({ activeDraft }),

  setTargetInfo: (targetCompany, targetRole) => set({ targetCompany, targetRole }),

  saveCurrentDraft: (tone) =>
    set((state) => {
      if (!state.activeDraft.trim()) return state;
      const newDraft: SavedCoverLetter = {
        id: 'cl-' + Date.now().toString(36),
        companyName: state.targetCompany || 'Target Company',
        roleTitle: state.targetRole || 'Software Engineering Fresher',
        tone,
        content: state.activeDraft,
        createdAt: new Date().toISOString(),
      };
      return { drafts: [newDraft, ...state.drafts] };
    }),

  deleteDraft: (id) =>
    set((state) => ({
      drafts: state.drafts.filter((d) => d.id !== id),
    })),

  resetCoverLetterTool: () => set({ ...DEFAULT_STATE }),
}));
