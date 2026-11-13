import { create } from 'zustand';
import type { SyncTable } from './transport';

export type SyncStatus = 'local_only' | 'synced' | 'syncing' | 'offline' | 'degraded';

export interface SyncStoreState {
  status: SyncStatus;
  pendingCount: number;
  lastError: string | null;
  lastSyncedAt: string | null;
  lastPulledAt: Record<SyncTable, string | null>;
  setStatus: (status: SyncStatus) => void;
  setPendingCount: (count: number) => void;
  setLastError: (err: string | null) => void;
  setLastSyncedAt: (iso: string | null) => void;
  setLastPulledAt: (table: SyncTable, iso: string) => void;
}

const initialLastPulledAt: Record<SyncTable, string | null> = {
  text_snapshots: null,
  resume_workspaces: null,
  resume_versions: null,
  audit_entries: null,
  journal_events: null,
  watchlist_targets: null,
  plan_items: null,
  outreach_drafts: null,
  gap_status: null,
  user_profiles: null,
};

export const useSyncStore = create<SyncStoreState>((set) => ({
  status: 'local_only',
  pendingCount: 0,
  lastError: null,
  lastSyncedAt: null,
  lastPulledAt: initialLastPulledAt,

  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastError: (lastError) => set({ lastError }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setLastPulledAt: (table, iso) =>
    set((state) => ({
      lastPulledAt: {
        ...state.lastPulledAt,
        [table]: iso,
      },
    })),
}));
