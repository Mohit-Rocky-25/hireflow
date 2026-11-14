import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WatchlistTarget,
  PlanItem,
  OutreachDraft,
  Uuid,
  PlanStatus,
  OutreachStatus,
} from '@/domain/types';
import { asyncZustandStorage } from '@/lib/storage/zustandStorage';
import { getStorageKey } from '@/lib/storage/namespace';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { enqueueOp } from '@/sync/outbox';
import { targetToRow, planItemToRow, outreachToRow } from '@/sync/mappers';
import { syncEngine } from '@/sync/syncEngine';

function makeId(): Uuid {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface MySpaceStoreState {
  watchlist: Record<Uuid, WatchlistTarget>;
  planItems: Record<Uuid, PlanItem>;
  outreachDrafts: Record<Uuid, OutreachDraft>;

  addWatchlistTarget: (t: Omit<WatchlistTarget, 'id' | 'addedAt' | 'archivedAt'>) => WatchlistTarget;
  removeWatchlistTarget: (id: Uuid) => void;
  restoreWatchlistTarget: (target: WatchlistTarget) => void;

  addPlanItem: (p: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => PlanItem;
  updatePlanItemStatus: (id: Uuid, status: PlanStatus) => void;
  removePlanItem: (id: Uuid) => void;
  restorePlanItem: (item: PlanItem) => void;

  saveOutreachDraft: (d: Omit<OutreachDraft, 'id' | 'createdAt' | 'updatedAt'>) => OutreachDraft;
  updateOutreachStatus: (id: Uuid, status: OutreachStatus) => void;
  removeOutreachDraft: (id: Uuid) => void;
  restoreOutreachDraft: (draft: OutreachDraft) => void;

  resetAll: () => void;
}

export const useMySpaceStore = create<MySpaceStoreState>()(
  persist(
    (set, get) => ({
      watchlist: {},
      planItems: {},
      outreachDrafts: {},

      addWatchlistTarget: (t) => {
        const id = makeId();
        const now = new Date().toISOString();
        const target: WatchlistTarget = {
          ...t,
          id,
          addedAt: now,
          archivedAt: null,
        };

        set((state) => ({
          watchlist: { ...state.watchlist, [id]: target },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `target-add-${id}-${now}`,
            table: 'watchlist_targets',
            op: 'upsert',
            pk: { id },
            payload: targetToRow(target) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }

        return target;
      },

      removeWatchlistTarget: (id) => {
        set((state) => {
          const next = { ...state.watchlist };
          delete next[id];
          return { watchlist: next };
        });

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `target-del-${id}-${now}`,
            table: 'watchlist_targets',
            op: 'delete',
            pk: { id },
            payload: {},
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      restoreWatchlistTarget: (target) => {
        set((state) => ({
          watchlist: { ...state.watchlist, [target.id]: target },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `target-restore-${target.id}-${now}`,
            table: 'watchlist_targets',
            op: 'upsert',
            pk: { id: target.id },
            payload: targetToRow(target) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      addPlanItem: (p) => {
        const id = makeId();
        const now = new Date().toISOString();
        const item: PlanItem = {
          ...p,
          id,
          createdAt: now,
          updatedAt: now,
          completedAt: p.status === 'done' ? now : null,
        };

        set((state) => ({
          planItems: { ...state.planItems, [id]: item },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `plan-add-${id}-${now}`,
            table: 'plan_items',
            op: 'upsert',
            pk: { id },
            payload: planItemToRow(item) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }

        return item;
      },

      updatePlanItemStatus: (id, status) => {
        const item = get().planItems[id];
        if (!item) return;

        const now = new Date().toISOString();
        const updated: PlanItem = {
          ...item,
          status,
          updatedAt: now,
          completedAt: status === 'done' ? (item.completedAt || now) : null,
        };

        set((state) => ({
          planItems: { ...state.planItems, [id]: updated },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `plan-status-${id}-${now}`,
            table: 'plan_items',
            op: 'upsert',
            pk: { id },
            payload: planItemToRow(updated) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      removePlanItem: (id) => {
        set((state) => {
          const next = { ...state.planItems };
          delete next[id];
          return { planItems: next };
        });

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `plan-del-${id}-${now}`,
            table: 'plan_items',
            op: 'delete',
            pk: { id },
            payload: {},
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      restorePlanItem: (item) => {
        set((state) => ({
          planItems: { ...state.planItems, [item.id]: item },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `plan-restore-${item.id}-${now}`,
            table: 'plan_items',
            op: 'upsert',
            pk: { id: item.id },
            payload: planItemToRow(item) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      saveOutreachDraft: (d) => {
        const id = makeId();
        const now = new Date().toISOString();
        const draft: OutreachDraft = {
          ...d,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          outreachDrafts: { ...state.outreachDrafts, [id]: draft },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `outreach-add-${id}-${now}`,
            table: 'outreach_drafts',
            op: 'upsert',
            pk: { id },
            payload: outreachToRow(draft) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }

        return draft;
      },

      updateOutreachStatus: (id, status) => {
        const draft = get().outreachDrafts[id];
        if (!draft) return;

        const now = new Date().toISOString();
        const updated: OutreachDraft = {
          ...draft,
          status,
          updatedAt: now,
        };

        set((state) => ({
          outreachDrafts: { ...state.outreachDrafts, [id]: updated },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `outreach-status-${id}-${now}`,
            table: 'outreach_drafts',
            op: 'upsert',
            pk: { id },
            payload: outreachToRow(updated) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      removeOutreachDraft: (id) => {
        set((state) => {
          const next = { ...state.outreachDrafts };
          delete next[id];
          return { outreachDrafts: next };
        });

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `outreach-del-${id}-${now}`,
            table: 'outreach_drafts',
            op: 'delete',
            pk: { id },
            payload: {},
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      restoreOutreachDraft: (draft) => {
        set((state) => ({
          outreachDrafts: { ...state.outreachDrafts, [draft.id]: draft },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const now = new Date().toISOString();
          void enqueueOp(auth.userId, {
            opId: `outreach-restore-${draft.id}-${now}`,
            table: 'outreach_drafts',
            op: 'upsert',
            pk: { id: draft.id },
            payload: outreachToRow(draft) as unknown as Record<string, unknown>,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => void syncEngine.flush());
        }
      },

      resetAll: () => {
        set({ watchlist: {}, planItems: {}, outreachDrafts: {} });
      },
    }),
    {
      name: getStorageKey('myspace_state_v1', null),
      storage: createJSONStorage(() => asyncZustandStorage),
    }
  )
);
