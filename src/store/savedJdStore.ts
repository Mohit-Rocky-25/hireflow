// ============================================================
// HireFlow — Saved Job Description Library Store
// Cloud-first (Supabase `saved_jds`) with in-memory UI state.
// Zero localStorage persistence or silent local fallback.
// ============================================================

import { create } from 'zustand';
import { LIMITS } from '../config/limits';
import { createId, nowIso, hashText } from '../lib/safeUtils';
import { SavedJD } from '../types/schemas-v4';
import { toast } from '../components/ui/Toast';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export interface NewJdInput {
  title: string;
  company?: string | null;
  source: 'pasted' | 'talentlens' | 'upload';
  text: string;
  tags?: string[];
}

export interface SaveJdResult {
  id: string | null;
  isDuplicate: boolean;
  capReached: boolean;
}

export interface SavedJdState {
  jds: SavedJD[];
  saveJd: (input: NewJdInput) => SaveJdResult;
  deleteJd: (id: string) => void;
  updateJd: (id: string, updates: Partial<Pick<SavedJD, 'title' | 'company' | 'tags'>>) => void;
  getJdById: (id: string) => SavedJD | undefined;
  getJdByHash: (hash: string) => SavedJD | undefined;
}

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  if (auth.status === 'authenticated' && auth.userId && getCloudGateway().isConfigured()) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
}

export const useSavedJdStore = create<SavedJdState>((set, get) => ({
  jds: [],

  saveJd: (input) => {
    const current = get();
    const textHash = hashText(input.text.trim());

    const existing = current.jds.find((j) => j.textHash === textHash);
    if (existing) {
      toast('info', `This JD is already in your library as "${existing.title}".`);
      return { id: existing.id, isDuplicate: true, capReached: false };
    }

    if (current.jds.length >= LIMITS.maxSavedJDs) {
      toast(
        'warning',
        `Saved JD cap of ${LIMITS.maxSavedJDs} reached. Please delete an older job description to add a new one.`
      );
      return { id: null, isDuplicate: false, capReached: true };
    }

    const now = nowIso();
    const newJd: SavedJD = {
      id: createId(),
      title: input.title.trim() || 'Untitled Job Description',
      company: input.company?.trim() || null,
      source: input.source,
      text: input.text.trim(),
      textHash,
      tags: input.tags || [],
      addedAt: now,
      updatedAt: now,
    };

    const prevJds = current.jds;
    const nextJds = [newJd, ...prevJds];
    set({ jds: nextJds });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository
        .saveSavedJd(cloud.userId, newJd)
        .then(() => {
          toast('success', `Saved "${newJd.title}" to your cloud JD library.`);
        })
        .catch((err) => {
          set({ jds: prevJds });
          const msg = err instanceof Error ? err.message : 'Failed to save job description to cloud.';
          toast('error', msg);
          useCloudSyncStore.getState().setError(`save JD "${newJd.title}"`, msg, async () => {
            await cloudRepository.saveSavedJd(cloud.userId!, newJd);
            set((state) => ({ jds: [newJd, ...state.jds.filter((j) => j.id !== newJd.id)] }));
          });
        });
    } else {
      toast('success', `Added "${newJd.title}" to session JD library.`);
    }

    return { id: newJd.id, isDuplicate: false, capReached: false };
  },

  deleteJd: (id) => {
    const prevJds = get().jds;
    set({ jds: prevJds.filter((j) => j.id !== id) });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository
        .deleteSavedJd(cloud.userId, id)
        .then(() => {
          toast('info', 'Job description removed from cloud library.');
        })
        .catch((err) => {
          set({ jds: prevJds });
          const msg = err instanceof Error ? err.message : 'Failed to delete saved JD from cloud.';
          toast('error', msg);
          useCloudSyncStore.getState().setError('delete saved JD', msg, async () => {
            get().deleteJd(id);
          });
        });
    } else {
      toast('info', 'Job description removed from session library.');
    }
  },

  updateJd: (id, updates) => {
    const prevJds = get().jds;
    const now = nowIso();
    let updatedItem: SavedJD | null = null;
    const nextJds = prevJds.map((j) => {
      if (j.id !== id) return j;
      updatedItem = { ...j, ...updates, updatedAt: now };
      return updatedItem;
    });
    set({ jds: nextJds });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId && updatedItem) {
      const target = updatedItem;
      void cloudRepository.saveSavedJd(cloud.userId, target).catch((err) => {
        set({ jds: prevJds });
        useCloudSyncStore.getState().setError(
          'update saved JD',
          err instanceof Error ? err.message : 'Failed to update saved JD.',
          async () => {
            get().updateJd(id, updates);
          }
        );
      });
    }
  },

  getJdById: (id) => {
    return get().jds.find((j) => j.id === id);
  },

  getJdByHash: (hash) => {
    return get().jds.find((j) => j.textHash === hash);
  },
}));
