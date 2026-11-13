import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AuditEntry,
  JournalEvent,
  GapOverlayEntry,
  Uuid,
  GapStatus,
} from '@/domain/types';
import {
  planAuditRecord,
  capGuestEntries,
  type RecordAuditInput,
  type RecorderDeps,
} from './auditRecorder';
import { applyRescan, markGapAddressed as markGapAddressedReducer } from './gapStatus';
import { GUEST_MAX_AUDITS } from '@/domain/limits';
import { kvSet, kvGet } from '@/lib/storage/kv';
import { getSnapshotKey, getStorageKey } from '@/lib/storage/namespace';
import { asyncZustandStorage } from '@/lib/storage/zustandStorage';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { enqueueOp } from '@/sync/outbox';
import { auditToRow, snapshotToRow, eventToRow, gapStatusToRow } from '@/sync/mappers';
import { syncEngine } from '@/sync/syncEngine';

function defaultDeps(): RecorderDeps {
  return {
    uuid: () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
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

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
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

        // Persist snapshots to kv first
        await kvSet(getSnapshotKey(resumeSnapshot.hash), resumeSnapshot);
        await kvSet(getSnapshotKey(jdSnapshot.hash), jdSnapshot);

        const now = deps.now();

        // Update gap overlay via applyRescan
        const updatedOverlay = applyRescan(
          get().gapStatus,
          entry.targetKey,
          entry.gaps.map((g) => g.id),
          now
        );

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

        // Enqueue sync if signed in
        if (!isGuest && auth.userId) {
          await enqueueOp(auth.userId, {
            opId: `snap-${resumeSnapshot.hash}`,
            table: 'text_snapshots',
            op: 'insert_ignore',
            pk: { hash: resumeSnapshot.hash },
            payload: snapshotToRow(resumeSnapshot),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `snap-${jdSnapshot.hash}`,
            table: 'text_snapshots',
            op: 'insert_ignore',
            pk: { hash: jdSnapshot.hash },
            payload: snapshotToRow(jdSnapshot),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `audit-${entry.id}`,
            table: 'audit_entries',
            op: 'insert_ignore',
            pk: { id: entry.id },
            payload: auditToRow(entry),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });

          // Enqueue updated gap status records
          for (const gap of entry.gaps) {
            const key = `${entry.targetKey}|${gap.id}`;
            const entryStatus = updatedOverlay.overlay[key];
            if (entryStatus) {
              await enqueueOp(auth.userId, {
                opId: `gap-${key}`,
                table: 'gap_status',
                op: 'upsert',
                pk: { target_key: entry.targetKey, gap_id: gap.id },
                payload: gapStatusToRow({
                  targetKey: entry.targetKey,
                  gapId: gap.id,
                  status: entryStatus.status,
                  planItemId: entryStatus.planItemId,
                  stillDetected: entryStatus.stillDetected,
                  updatedAt: entryStatus.updatedAt,
                }),
                clientUpdatedAt: now,
                attempts: 0,
                enqueuedAt: now,
              });
            }
          }

          syncEngine.scheduleFlush();
        }

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

        set((state) => ({
          events: { ...state.events, [id]: event },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          void enqueueOp(auth.userId, {
            opId: `ev-${id}`,
            table: 'journal_events',
            op: 'insert_ignore',
            pk: { id },
            payload: eventToRow(event),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }

        return event;
      },

      markGapAddressed: (targetKey, gapId, planItemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          gapStatus: markGapAddressedReducer(state.gapStatus, targetKey, gapId, planItemId, now),
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId) {
          const key = `${targetKey}|${gapId}`;
          const current = get().gapStatus[key];
          if (current) {
            void enqueueOp(auth.userId, {
              opId: `gap-${key}-${now}`,
              table: 'gap_status',
              op: 'upsert',
              pk: { target_key: targetKey, gap_id: gapId },
              payload: gapStatusToRow({
                targetKey,
                gapId,
                status: current.status,
                planItemId: current.planItemId,
                stillDetected: current.stillDetected,
                updatedAt: current.updatedAt,
              }),
              clientUpdatedAt: now,
              attempts: 0,
              enqueuedAt: now,
            }).then(() => syncEngine.scheduleFlush());
          }
        }
      },

      getEntry: (id) => get().entries[id],
    }),
    {
      name: getStorageKey('audit', null),
      storage: createJSONStorage(() => asyncZustandStorage),
      version: 1,
    }
  )
);
