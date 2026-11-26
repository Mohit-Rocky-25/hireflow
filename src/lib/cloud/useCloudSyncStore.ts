// ============================================================
// HireFlow — In-Memory Cloud Write / Hydration UI State
// Surfaces cloud failures loudly with explicit Retry actions.
// Zero localStorage/IndexedDB fallback writes.
// ============================================================

import { create } from 'zustand';

export type CloudSyncPhase = 'idle' | 'hydrating' | 'saving' | 'synced' | 'error';

export interface CloudSyncState {
  phase: CloudSyncPhase;
  hydratedUserId: string | null;
  lastSyncedAt: string | null;
  error: string | null;
  failedOperationLabel: string | null;
  pendingRetry: (() => Promise<void>) | null;

  setHydrating: (userId: string) => void;
  setHydrated: (userId: string) => void;
  setSaving: () => void;
  setSynced: () => void;
  setError: (label: string, message: string, retryFn?: (() => Promise<void>) | null) => void;
  dismissError: () => void;
  reset: () => void;
  retryLastFailed: () => Promise<void>;
}

export const useCloudSyncStore = create<CloudSyncState>((set, get) => ({
  phase: 'idle',
  hydratedUserId: null,
  lastSyncedAt: null,
  error: null,
  failedOperationLabel: null,
  pendingRetry: null,

  setHydrating: (_userId) =>
    set({
      phase: 'hydrating',
      error: null,
      failedOperationLabel: null,
      pendingRetry: null,
    }),

  setHydrated: (userId) =>
    set({
      phase: 'synced',
      hydratedUserId: userId,
      lastSyncedAt: new Date().toISOString(),
      error: null,
      failedOperationLabel: null,
      pendingRetry: null,
    }),

  setSaving: () =>
    set((state) => ({
      ...state,
      phase: 'saving',
      error: null,
      failedOperationLabel: null,
    })),

  setSynced: () =>
    set({
      phase: 'synced',
      lastSyncedAt: new Date().toISOString(),
      error: null,
      failedOperationLabel: null,
      pendingRetry: null,
    }),

  setError: (label, message, retryFn = null) =>
    set({
      phase: 'error',
      error: message,
      failedOperationLabel: label,
      pendingRetry: retryFn,
    }),

  dismissError: () =>
    set((state) => ({
      phase: state.hydratedUserId ? 'synced' : 'idle',
      error: null,
      failedOperationLabel: null,
      pendingRetry: null,
    })),

  reset: () =>
    set({
      phase: 'idle',
      hydratedUserId: null,
      lastSyncedAt: null,
      error: null,
      failedOperationLabel: null,
      pendingRetry: null,
    }),

  retryLastFailed: async () => {
    const retry = get().pendingRetry;
    if (!retry) return;
    set({ phase: 'saving', error: null });
    await retry();
  },
}));
