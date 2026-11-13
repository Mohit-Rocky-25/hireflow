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

export interface PortalStoreState {
  watchlist: Record<Uuid, WatchlistTarget>;
  planItems: Record<Uuid, PlanItem>;
  outreachDrafts: Record<Uuid, OutreachDraft>;

  addWatchlistTarget: (t: Omit<WatchlistTarget, 'id' | 'addedAt' | 'archivedAt'>) => WatchlistTarget;
  removeWatchlistTarget: (id: Uuid) => void;

  addPlanItem: (p: Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => PlanItem;
  updatePlanItemStatus: (id: Uuid, status: PlanStatus) => void;
  removePlanItem: (id: Uuid) => void;

  saveOutreachDraft: (d: Omit<OutreachDraft, 'id' | 'createdAt' | 'updatedAt'>) => OutreachDraft;
  updateOutreachStatus: (id: Uuid, status: OutreachStatus) => void;
  removeOutreachDraft: (id: Uuid) => void;
}

export const usePortalStore = create<PortalStoreState>()(
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
            opId: `tgt-${id}`,
            table: 'watchlist_targets',
            op: 'upsert',
            pk: { id },
            payload: targetToRow(target),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
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
            opId: `tgt-del-${id}`,
            table: 'watchlist_targets',
            op: 'delete',
            pk: { id },
            payload: null,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
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
            opId: `plan-${id}`,
            table: 'plan_items',
            op: 'upsert',
            pk: { id },
            payload: planItemToRow(item),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }

        return item;
      },

      updatePlanItemStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const item = state.planItems[id];
          if (!item) return state;
          const updated: PlanItem = {
            ...item,
            status,
            updatedAt: now,
            completedAt: status === 'done' ? now : null,
          };
          return { planItems: { ...state.planItems, [id]: updated } };
        });

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const item = get().planItems[id];
          if (item) {
            void enqueueOp(auth.userId, {
              opId: `plan-${id}-${now}`,
              table: 'plan_items',
              op: 'upsert',
              pk: { id },
              payload: planItemToRow(item),
              clientUpdatedAt: now,
              attempts: 0,
              enqueuedAt: now,
            }).then(() => syncEngine.scheduleFlush());
          }
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
            opId: `plan-del-${id}`,
            table: 'plan_items',
            op: 'delete',
            pk: { id },
            payload: null,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
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
            opId: `outreach-${id}`,
            table: 'outreach_drafts',
            op: 'upsert',
            pk: { id },
            payload: outreachToRow(draft),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }

        return draft;
      },

      updateOutreachStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => {
          const draft = state.outreachDrafts[id];
          if (!draft) return state;
          return {
            outreachDrafts: {
              ...state.outreachDrafts,
              [id]: { ...draft, status, updatedAt: now },
            },
          };
        });

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const draft = get().outreachDrafts[id];
          if (draft) {
            void enqueueOp(auth.userId, {
              opId: `outreach-${id}-${now}`,
              table: 'outreach_drafts',
              op: 'upsert',
              pk: { id },
              payload: outreachToRow(draft),
              clientUpdatedAt: now,
              attempts: 0,
              enqueuedAt: now,
            }).then(() => syncEngine.scheduleFlush());
          }
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
            opId: `outreach-del-${id}`,
            table: 'outreach_drafts',
            op: 'delete',
            pk: { id },
            payload: null,
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }
      },
    }),
    {
      name: getStorageKey('portal', null),
      storage: createJSONStorage(() => asyncZustandStorage),
      version: 1,
    }
  )
);
