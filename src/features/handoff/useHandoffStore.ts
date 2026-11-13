import { create } from 'zustand';
import type { Uuid, Sha256, IsoDate } from '@/domain/types';

export interface Handoff {
  id: Uuid;
  from: string;
  to: string;
  resumeVersionId?: Uuid;
  jdSnapshotHash?: Sha256;
  targetKey?: string;
  createdAt: IsoDate;
}

export interface HandoffState {
  current: Handoff | null;
  set: (h: Omit<Handoff, 'id' | 'createdAt'>) => void;
  consume: (to: string) => Handoff | null;
}

export const useHandoffStore = create<HandoffState>((set, get) => ({
  current: null,

  set: (h) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    set({
      current: {
        ...h,
        id,
        createdAt: new Date().toISOString(),
      },
    });
  },

  consume: (to: string) => {
    const cur = get().current;
    if (cur && cur.to === to) {
      set({ current: null });
      return cur;
    }
    return null;
  },
}));
