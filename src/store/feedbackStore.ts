/**
 * HireFlow v4: Feedback Store (B8)
 * Stores local user verdicts (thumbs up/down) and notes on rule findings & metrics.
 * Bounded by LIMITS.maxFeedbackItems (500 items). Registered with backup registry.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { FeedbackItem, FeedbackStoreSchema, FeedbackStoreData } from '../types/schemas-v4';
import { LIMITS } from '../config/limits';
import { ENGINE_VERSION } from '../config/versions';
import { createId, nowIso } from '../lib/safeUtils';
import { registerBackupSection } from '../lib/backup/registry';

const FEEDBACK_STORE_KEY = 'feedback';

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

function loadInitialState(): FeedbackStoreData {
  const loaded = storage.get(FEEDBACK_STORE_KEY, FeedbackStoreSchema);
  return loaded || { items: [] };
}

export const useFeedbackStore = create<FeedbackStoreState>((set, get) => ({
  items: loadInitialState().items,

  submitFeedback: (params: SubmitFeedbackParams) => {
    const state = get();
    const existingIndex = state.items.findIndex(
      (it) => it.ruleId === params.ruleId && it.targetKind === params.targetKind
    );

    const now = nowIso();
    const cleanNote = params.note ? params.note.slice(0, LIMITS.maxFindingNoteChars) : undefined;

    let updatedItems: FeedbackItem[];

    if (existingIndex >= 0) {
      const updatedItem: FeedbackItem = {
        ...state.items[existingIndex],
        verdict: params.verdict,
        note: cleanNote,
        scanId: params.scanId || state.items[existingIndex].scanId,
        engineVersion: ENGINE_VERSION,
        createdAt: now,
      };
      updatedItems = [...state.items];
      updatedItems[existingIndex] = updatedItem;
    } else {
      if (state.items.length >= LIMITS.maxFeedbackItems) {
        // Drop oldest item to respect max bounded limit
        updatedItems = state.items.slice(1);
      } else {
        updatedItems = [...state.items];
      }
      const newItem: FeedbackItem = {
        id: createId(),
        targetKind: params.targetKind,
        ruleId: params.ruleId,
        verdict: params.verdict,
        note: cleanNote,
        scanId: params.scanId,
        engineVersion: ENGINE_VERSION,
        createdAt: now,
      };
      updatedItems.push(newItem);
    }

    const saved = storage.set(FEEDBACK_STORE_KEY, { items: updatedItems });
    if (saved) {
      set({ items: updatedItems });
      const savedItem = existingIndex >= 0 ? updatedItems[existingIndex] : updatedItems[updatedItems.length - 1];
      return { success: true, item: savedItem };
    }

    return { success: false };
  },

  getFeedback: (ruleId: string, targetKind?: string) => {
    return get().items.find(
      (it) => it.ruleId === ruleId && (!targetKind || it.targetKind === targetKind)
    );
  },

  removeFeedback: (id: string) => {
    const updated = get().items.filter((it) => it.id !== id);
    storage.set(FEEDBACK_STORE_KEY, { items: updated });
    set({ items: updated });
  },

  clearFeedback: () => {
    storage.set(FEEDBACK_STORE_KEY, { items: [] });
    set({ items: [] });
  },

  exportFeedbackJson: () => {
    return JSON.stringify({ items: get().items }, null, 2);
  },

  getSummaryStats: () => {
    const items = get().items;
    let up = 0;
    let down = 0;
    for (const it of items) {
      if (it.verdict === 'up') up++;
      else if (it.verdict === 'down') down++;
    }
    return { total: items.length, up, down };
  },
}));

registerBackupSection<FeedbackStoreData>({
  key: 'feedback',
  schema: FeedbackStoreSchema,
  version: 1,
  export: () => ({ items: useFeedbackStore.getState().items }),
  import: (data: FeedbackStoreData, mode) => {
    if (mode === 'replace') {
      storage.set(FEEDBACK_STORE_KEY, data);
      useFeedbackStore.setState({ items: data.items });
      return true;
    } else {
      const current = useFeedbackStore.getState().items;
      const combined = [...data.items, ...current].slice(0, LIMITS.maxFeedbackItems);
      storage.set(FEEDBACK_STORE_KEY, { items: combined });
      useFeedbackStore.setState({ items: combined });
      return true;
    }
  },
});
