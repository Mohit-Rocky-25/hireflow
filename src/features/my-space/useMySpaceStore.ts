import { create } from 'zustand';
import type {
  WatchlistTarget,
  PlanItem,
  OutreachDraft,
  Uuid,
  PlanStatus,
  OutreachStatus,
} from '@/domain/types';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

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

export function addCalendarDaysIso(isoDate: string, days: number): string {
  const parsed = new Date(isoDate);
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const target = new Date(
    Date.UTC(
      base.getUTCFullYear(),
      base.getUTCMonth(),
      base.getUTCDate() + days,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds()
    )
  );
  return target.toISOString();
}

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  if (
    auth.status === 'authenticated' &&
    !auth.isDemo &&
    auth.userId &&
    getCloudGateway().isConfigured()
  ) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
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

  saveOutreachDraft: (
    d: Omit<OutreachDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: Uuid }
  ) => OutreachDraft;
  updateOutreachDraft: (
    id: Uuid,
    patch: Partial<Omit<OutreachDraft, 'id' | 'createdAt'>>
  ) => OutreachDraft | undefined;
  markOutreachSent: (id: Uuid) => OutreachDraft | undefined;
  updateOutreachStatus: (id: Uuid, status: OutreachStatus) => void;
  removeOutreachDraft: (id: Uuid) => void;
  restoreOutreachDraft: (draft: OutreachDraft) => void;

  resetAll: () => void;
}

export const useMySpaceStore = create<MySpaceStoreState>()((set, get) => ({
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

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveWatchlistTarget(cloud.userId, target).catch((err) => {
        set((state) => {
          const next = { ...state.watchlist };
          delete next[id];
          return { watchlist: next };
        });
        useCloudSyncStore.getState().setError(
          `save watchlist target "${target.companyName}"`,
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            await cloudRepository.saveWatchlistTarget(cloud.userId!, target);
            set((state) => ({ watchlist: { ...state.watchlist, [id]: target } }));
          }
        );
      });
    }

    return target;
  },

  removeWatchlistTarget: (id) => {
    const prev = get().watchlist[id];
    set((state) => {
      const next = { ...state.watchlist };
      delete next[id];
      return { watchlist: next };
    });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.deleteWatchlistTarget(cloud.userId, id).catch((err) => {
        if (prev) {
          set((state) => ({ watchlist: { ...state.watchlist, [id]: prev } }));
        }
        useCloudSyncStore.getState().setError(
          'remove watchlist target',
          err instanceof Error ? err.message : 'Cloud delete failed.',
          async () => {
            get().removeWatchlistTarget(id);
          }
        );
      });
    }
  },

  restoreWatchlistTarget: (target) => {
    set((state) => ({
      watchlist: { ...state.watchlist, [target.id]: target },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveWatchlistTarget(cloud.userId, target).catch((err) => {
        set((state) => {
          const next = { ...state.watchlist };
          delete next[target.id];
          return { watchlist: next };
        });
        useCloudSyncStore.getState().setError(
          'restore watchlist target',
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            get().restoreWatchlistTarget(target);
          }
        );
      });
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

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.savePlanItem(cloud.userId, item).catch((err) => {
        set((state) => {
          const next = { ...state.planItems };
          delete next[id];
          return { planItems: next };
        });
        useCloudSyncStore.getState().setError(
          `save plan item "${item.title}"`,
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            await cloudRepository.savePlanItem(cloud.userId!, item);
            set((state) => ({ planItems: { ...state.planItems, [id]: item } }));
          }
        );
      });
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

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.savePlanItem(cloud.userId, updated).catch((err) => {
        set((state) => ({
          planItems: { ...state.planItems, [id]: item },
        }));
        useCloudSyncStore.getState().setError(
          `update plan item "${item.title}"`,
          err instanceof Error ? err.message : 'Cloud update failed.',
          async () => {
            get().updatePlanItemStatus(id, status);
          }
        );
      });
    }
  },

  removePlanItem: (id) => {
    const prev = get().planItems[id];
    set((state) => {
      const next = { ...state.planItems };
      delete next[id];
      return { planItems: next };
    });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.deletePlanItem(cloud.userId, id).catch((err) => {
        if (prev) {
          set((state) => ({ planItems: { ...state.planItems, [id]: prev } }));
        }
        useCloudSyncStore.getState().setError(
          'remove plan item',
          err instanceof Error ? err.message : 'Cloud delete failed.',
          async () => {
            get().removePlanItem(id);
          }
        );
      });
    }
  },

  restorePlanItem: (item) => {
    set((state) => ({
      planItems: { ...state.planItems, [item.id]: item },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.savePlanItem(cloud.userId, item).catch((err) => {
        set((state) => {
          const next = { ...state.planItems };
          delete next[item.id];
          return { planItems: next };
        });
        useCloudSyncStore.getState().setError(
          'restore plan item',
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            get().restorePlanItem(item);
          }
        );
      });
    }
  },

  saveOutreachDraft: (d) => {
    const existing = d.id ? get().outreachDrafts[d.id] : undefined;
    const id = existing?.id || d.id || makeId();
    const now = new Date().toISOString();
    const isSent = d.status === 'sent';
    const sentAt = isSent ? (d.sentAt || existing?.sentAt || now) : (d.sentAt ?? existing?.sentAt ?? null);
    const followUpDueAt = isSent
      ? (d.followUpDueAt || existing?.followUpDueAt || addCalendarDaysIso(sentAt || now, 5))
      : (d.followUpDueAt ?? existing?.followUpDueAt ?? null);
    const draft: OutreachDraft = {
      ...existing,
      ...d,
      id,
      person: d.person || d.slots?.person || existing?.person,
      company: d.company || d.slots?.company || existing?.company,
      sentAt,
      followUpDueAt,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    set((state) => ({
      outreachDrafts: { ...state.outreachDrafts, [id]: draft },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveOutreachDraft(cloud.userId, draft).catch((err) => {
        set((state) => {
          const next = { ...state.outreachDrafts };
          if (existing) next[id] = existing;
          else delete next[id];
          return { outreachDrafts: next };
        });
        useCloudSyncStore.getState().setError(
          'save outreach draft',
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            await cloudRepository.saveOutreachDraft(cloud.userId!, draft);
            set((state) => ({ outreachDrafts: { ...state.outreachDrafts, [id]: draft } }));
          }
        );
      });
    }

    return draft;
  },

  updateOutreachDraft: (id, patch) => {
    const draft = get().outreachDrafts[id];
    if (!draft) return undefined;
    const now = new Date().toISOString();
    const updated: OutreachDraft = {
      ...draft,
      ...patch,
      id,
      updatedAt: now,
    };
    set((state) => ({
      outreachDrafts: { ...state.outreachDrafts, [id]: updated },
    }));
    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveOutreachDraft(cloud.userId, updated).catch((err) => {
        set((state) => ({
          outreachDrafts: { ...state.outreachDrafts, [id]: draft },
        }));
        useCloudSyncStore.getState().setError(
          'update outreach draft',
          err instanceof Error ? err.message : 'Cloud update failed.',
          async () => {
            get().updateOutreachDraft(id, patch);
          }
        );
      });
    }
    return updated;
  },

  markOutreachSent: (id) => {
    const draft = get().outreachDrafts[id];
    if (!draft) return undefined;
    const now = new Date().toISOString();
    const sentAt = draft.sentAt || now;
    const followUpDueAt = draft.followUpDueAt || addCalendarDaysIso(sentAt, 5);
    return get().updateOutreachDraft(id, {
      status: 'sent',
      sentAt,
      followUpDueAt,
    });
  },

  updateOutreachStatus: (id, status) => {
    const draft = get().outreachDrafts[id];
    if (!draft) return;

    const now = new Date().toISOString();
    const sentAt = status === 'sent' ? (draft.sentAt || now) : draft.sentAt;
    const followUpDueAt =
      status === 'sent'
        ? (draft.followUpDueAt || addCalendarDaysIso(sentAt || now, 5))
        : draft.followUpDueAt;
    const updated: OutreachDraft = {
      ...draft,
      status,
      sentAt,
      followUpDueAt,
      updatedAt: now,
    };

    set((state) => ({
      outreachDrafts: { ...state.outreachDrafts, [id]: updated },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveOutreachDraft(cloud.userId, updated).catch((err) => {
        set((state) => ({
          outreachDrafts: { ...state.outreachDrafts, [id]: draft },
        }));
        useCloudSyncStore.getState().setError(
          'update outreach draft',
          err instanceof Error ? err.message : 'Cloud update failed.',
          async () => {
            get().updateOutreachStatus(id, status);
          }
        );
      });
    }
  },

  removeOutreachDraft: (id) => {
    const prev = get().outreachDrafts[id];
    set((state) => {
      const next = { ...state.outreachDrafts };
      delete next[id];
      return { outreachDrafts: next };
    });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.deleteOutreachDraft(cloud.userId, id).catch((err) => {
        if (prev) {
          set((state) => ({ outreachDrafts: { ...state.outreachDrafts, [id]: prev } }));
        }
        useCloudSyncStore.getState().setError(
          'remove outreach draft',
          err instanceof Error ? err.message : 'Cloud delete failed.',
          async () => {
            get().removeOutreachDraft(id);
          }
        );
      });
    }
  },

  restoreOutreachDraft: (draft) => {
    set((state) => ({
      outreachDrafts: { ...state.outreachDrafts, [draft.id]: draft },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveOutreachDraft(cloud.userId, draft).catch((err) => {
        set((state) => {
          const next = { ...state.outreachDrafts };
          delete next[draft.id];
          return { outreachDrafts: next };
        });
        useCloudSyncStore.getState().setError(
          'restore outreach draft',
          err instanceof Error ? err.message : 'Cloud write failed.',
          async () => {
            get().restoreOutreachDraft(draft);
          }
        );
      });
    }
  },

  resetAll: () => {
    set({ watchlist: {}, planItems: {}, outreachDrafts: {} });
  },
}));
