// ============================================================
// HireFlow — Feedback Store (Cloud-First + In-Memory UI State)
// Persists thumbs up/down & notes to Supabase `feedback_items`
// when signed in. Zero localStorage fallback.
// ============================================================

import { create } from 'zustand';
import { FeedbackItem } from '../types/schemas-v4';
import { LIMITS } from '../config/limits';
import { ENGINE_VERSION } from '../config/versions';
import { createId, nowIso } from '../lib/safeUtils';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export interface SubmitFeedbackParams {
  targetKind: string;
  ruleId: string;
  verdict: 'up' | 'down';
  note?: string;
  scanId?: string;
}

export interface FeedbackStoreState {
  items: FeedbackItem[];
  submitFeedback: (params: SubmitFeedbackParams) => { success: boolean; item?: FeedbackItem };
  getFeedback: (ruleId: string, targetKind?: string) => FeedbackItem | undefined;
  removeFeedback: (id: string) => void;
  clearFeedback: () => void;
  exportFeedbackJson: () => string;
  getSummaryStats: () => { total: number; up: number; down: number };
}

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  if (auth.status === 'authenticated' && auth.userId && getCloudGateway().isConfigured()) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
}

export const useFeedbackStore = create<FeedbackStoreState>((set, get) => ({
  items: [],

  submitFeedback: (params: SubmitFeedbackParams) => {
    const state = get();
    const prevItems = state.items;
    const existingIndex = prevItems.findIndex(
      (it) => it.ruleId === params.ruleId && it.targetKind === params.targetKind
    );

    const now = nowIso();
    const cleanNote = params.note ? params.note.slice(0, LIMITS.maxFindingNoteChars) : undefined;

    let updatedItems: FeedbackItem[];
    let savedItem: FeedbackItem;

    if (existingIndex >= 0) {
      savedItem = {
        ...prevItems[existingIndex],
        verdict: params.verdict,
        note: cleanNote,
        scanId: params.scanId || prevItems[existingIndex].scanId,
        engineVersion: ENGINE_VERSION,
        createdAt: now,
      };
      updatedItems = [...prevItems];
      updatedItems[existingIndex] = savedItem;
    } else {
      updatedItems =
        prevItems.length >= LIMITS.maxFeedbackItems ? prevItems.slice(1) : [...prevItems];
      savedItem = {
        id: createId(),
        targetKind: params.targetKind,
        ruleId: params.ruleId,
        verdict: params.verdict,
        note: cleanNote,
        scanId: params.scanId,
        engineVersion: ENGINE_VERSION,
        createdAt: now,
      };
      updatedItems.push(savedItem);
    }

    set({ items: updatedItems });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveFeedbackItem(cloud.userId, savedItem).catch((err) => {
        set({ items: prevItems });
        useCloudSyncStore.getState().setError(
          'save finding feedback',
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            get().submitFeedback(params);
          }
        );
      });
    }

    return { success: true, item: savedItem };
  },

  getFeedback: (ruleId: string, targetKind?: string) => {
    return get().items.find(
      (it) => it.ruleId === ruleId && (!targetKind || it.targetKind === targetKind)
    );
  },

  removeFeedback: (id: string) => {
    const prev = get().items;
    set({ items: prev.filter((it) => it.id !== id) });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.deleteFeedbackItem(cloud.userId, id).catch((err) => {
        set({ items: prev });
        useCloudSyncStore.getState().setError(
          'delete finding feedback',
          err instanceof Error ? err.message : 'Cloud delete failed.',
          async () => {
            get().removeFeedback(id);
          }
        );
      });
    }
  },

  clearFeedback: () => {
    set({ items: [] });
  },

  exportFeedbackJson: () => {
    return JSON.stringify(
      {
        app: 'hireflow',
        exportedAt: nowIso(),
        engineVersion: ENGINE_VERSION,
        items: get().items,
      },
      null,
      2
    );
  },

  getSummaryStats: () => {
    const items = get().items;
    const up = items.filter((it) => it.verdict === 'up').length;
    const down = items.filter((it) => it.verdict === 'down').length;
    return { total: items.length, up, down };
  },
}));
