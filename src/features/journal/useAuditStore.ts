import { create } from 'zustand';
import type {
  AuditEntry,
  JournalEvent,
  GapOverlayEntry,
  Uuid,
} from '@/domain/types';
import {
  planAuditRecord,
  capGuestEntries,
  type RecordAuditInput,
  type RecorderDeps,
} from './auditRecorder';
import { applyRescan, markGapAddressed as markGapAddressedReducer } from './gapStatus';
import { GUEST_MAX_AUDITS } from '@/domain/limits';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import { cacheSnapshotInMemory, cloudRepository } from '@/lib/cloud/cloudRepository';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';
import type { GapStatusRecord } from '@/sync/mappers';

function defaultDeps(): RecorderDeps {
  return {
    uuid: () =>
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }),
    now: () => new Date().toISOString(),
  };
}

export interface AuditState {
  entries: Record<Uuid, AuditEntry>;
  events: Record<Uuid, JournalEvent>;
  gapStatus: Record<string, GapOverlayEntry>;
  record: (input: RecordAuditInput, deps?: RecorderDeps) => Promise<{ entry: AuditEntry; deduplicated: boolean }>;
  logEvent: (e: Omit<JournalEvent, 'id' | 'createdAt'>, deps?: RecorderDeps) => JournalEvent;
  markGapAddressed: (targetKey: string, gapId: string, planItemId: Uuid) => void;
  getEntry: (id: Uuid) => AuditEntry | undefined;
}

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  if (auth.status === 'authenticated' && auth.userId && getCloudGateway().isConfigured()) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
}

export const useAuditStore = create<AuditState>()((set, get) => ({
  entries: {},
  events: {},
  gapStatus: {},

  record: async (input, deps = defaultDeps()) => {
    const auth = useAuthStore.getState();
    const isGuest = auth.status !== 'authenticated';
    const existingEntries = Object.values(get().entries);

    const plan = await planAuditRecord(input, existingEntries, deps);
    if (plan.status === 'duplicate') {
      return { entry: plan.entry, deduplicated: true };
    }

    const { entry, resumeSnapshot, jdSnapshot } = plan;
    cacheSnapshotInMemory(resumeSnapshot);
    cacheSnapshotInMemory(jdSnapshot);

    const now = deps.now();
    const updatedOverlay = applyRescan(
      get().gapStatus,
      entry.targetKey,
      entry.gaps.map((g) => g.id),
      now
    );

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      const gapUpdates: GapStatusRecord[] = [];
      for (const gap of entry.gaps) {
        const key = `${entry.targetKey}|${gap.id}`;
        const entryStatus = updatedOverlay.overlay[key];
        if (entryStatus) {
          gapUpdates.push({
            targetKey: entry.targetKey,
            gapId: gap.id,
            status: entryStatus.status,
            planItemId: entryStatus.planItemId,
            stillDetected: entryStatus.stillDetected,
            updatedAt: entryStatus.updatedAt,
          });
        }
      }

      // Fail loudly before updating persistent memory state if cloud write fails (zero silent fallback)
      await cloudRepository.saveAuditRecord(
        cloud.userId,
        entry,
        resumeSnapshot,
        jdSnapshot,
        gapUpdates
      );
    }

    let newEntries = { ...get().entries, [entry.id]: entry };
    if (isGuest) {
      const capped = capGuestEntries(Object.values(newEntries), GUEST_MAX_AUDITS);
      const cappedMap: Record<Uuid, AuditEntry> = {};
      capped.forEach((e) => {
        cappedMap[e.id] = e;
      });
      newEntries = cappedMap;
    }

    set({
      entries: newEntries,
      gapStatus: updatedOverlay.overlay,
    });

    return { entry, deduplicated: false };
  },

  logEvent: (e, deps = defaultDeps()) => {
    const id = deps.uuid();
    const now = deps.now();
    const event: JournalEvent = {
      id,
      createdAt: now,
      ...e,
    };

    const prevEvents = get().events;
    set({
      events: { ...prevEvents, [id]: event },
    });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveJournalEvent(cloud.userId, event).catch((err) => {
        set((state) => {
          const next = { ...state.events };
          delete next[id];
          return { events: next };
        });
        useCloudSyncStore.getState().setError(
          'record journal event',
          err instanceof Error ? err.message : 'Failed to save journal event.',
          async () => {
            await cloudRepository.saveJournalEvent(cloud.userId!, event);
            set((state) => ({ events: { ...state.events, [id]: event } }));
          }
        );
      });
    }

    return event;
  },

  markGapAddressed: (targetKey, gapId, planItemId) => {
    const prevGapStatus = get().gapStatus;
    const now = new Date().toISOString();
    const nextGapStatus = markGapAddressedReducer(prevGapStatus, targetKey, gapId, planItemId, now);

    set({ gapStatus: nextGapStatus });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      const key = `${targetKey}|${gapId}`;
      const current = nextGapStatus[key];
      if (current) {
        void cloudRepository
          .upsertGapStatus(cloud.userId, {
            targetKey,
            gapId,
            status: current.status,
            planItemId: current.planItemId,
            stillDetected: current.stillDetected,
            updatedAt: current.updatedAt,
          })
          .catch((err) => {
            set({ gapStatus: prevGapStatus });
            useCloudSyncStore.getState().setError(
              'update gap progress',
              err instanceof Error ? err.message : 'Failed to update gap status.',
              async () => {
                get().markGapAddressed(targetKey, gapId, planItemId);
              }
            );
          });
      }
    }
  },

  getEntry: (id) => get().entries[id],
}));
