// ============================================================
// HireFlow v3 — Outreach Tool Store (In-Memory)
// ============================================================

import { create } from 'zustand';

export interface SavedOutreachMessage {
  id: string;
  recipientType: 'ALUMNI' | 'RECRUITER' | 'HIRING_MANAGER' | 'PEER';
  platform: 'LINKEDIN' | 'EMAIL' | 'TWITTER_X';
  recipientName: string;
  targetCompany: string;
  content: string;
  createdAt: string;
}

export interface OutreachToolState {
  version: number;
  savedMessages: SavedOutreachMessage[];
  lastGeneratedText: string;
  
  // Actions
  setLastGeneratedText: (text: string) => void;
  saveMessage: (msg: Omit<SavedOutreachMessage, 'id' | 'createdAt'>) => void;
  deleteMessage: (id: string) => void;
  resetOutreachTool: () => void;
}

const DEFAULT_STATE = {
  version: 3,
  savedMessages: [] as SavedOutreachMessage[],
  lastGeneratedText: '',
};

export const useOutreachToolStore = create<OutreachToolState>()((set) => ({
  ...DEFAULT_STATE,

  setLastGeneratedText: (lastGeneratedText) => set({ lastGeneratedText }),

  saveMessage: (msg) =>
    set((state) => ({
      savedMessages: [
        {
          ...msg,
          id: 'outreach-' + Date.now().toString(36),
          createdAt: new Date().toISOString(),
        },
        ...state.savedMessages,
      ],
    })),

  deleteMessage: (id) =>
    set((state) => ({
      savedMessages: state.savedMessages.filter((m) => m.id !== id),
    })),

  resetOutreachTool: () => set({ ...DEFAULT_STATE }),
}));
