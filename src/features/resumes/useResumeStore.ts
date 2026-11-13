import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ResumeWorkspace,
  ResumeVersion,
  VersionSource,
  Uuid,
  TextSnapshot,
} from '@/domain/types';
import {
  createWorkspaceService,
  addVersionService,
  forkWorkspaceService,
} from './resumeService';
import { asyncZustandStorage } from '@/lib/storage/zustandStorage';
import { kvGet } from '@/lib/storage/kv';
import { getSnapshotKey, getStorageKey } from '@/lib/storage/namespace';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { enqueueOp } from '@/sync/outbox';
import { workspaceToRow, versionToRow, snapshotToRow } from '@/sync/mappers';
import { syncEngine } from '@/sync/syncEngine';

export interface ResumeState {
  workspaces: Record<Uuid, ResumeWorkspace>;
  versions: Record<Uuid, ResumeVersion>;
  activeWorkspaceId: Uuid | null;

  createWorkspace: (i: {
    name: string;
    roleTrack: string;
    text: string;
    source: VersionSource;
    fileName?: string;
  }) => Promise<{ workspace: ResumeWorkspace; version: ResumeVersion }>;

  addVersion: (i: {
    workspaceId: Uuid;
    text: string;
    label: string;
    source: VersionSource;
    parentVersionId?: Uuid | null;
    note?: string;
    fileName?: string;
  }) => Promise<ResumeVersion>;

  forkWorkspace: (i: {
    fromWorkspaceId: Uuid;
    fromVersionId?: Uuid;
    name: string;
    roleTrack: string;
  }) => Promise<ResumeWorkspace>;

  setHead: (workspaceId: Uuid, versionId: Uuid) => void;
  setPrimary: (workspaceId: Uuid) => void;
  renameWorkspace: (id: Uuid, name: string, roleTrack: string) => void;
  archiveWorkspace: (id: Uuid) => void;
  setActive: (id: Uuid | null) => void;
  getHeadSnapshot: (workspaceId: Uuid) => Promise<TextSnapshot | null>;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      workspaces: {},
      versions: {},
      activeWorkspaceId: null,

      createWorkspace: async (i) => {
        const auth = useAuthStore.getState();
        const isGuest = auth.status !== 'authenticated';
        const { workspace, version, snapshot } = await createWorkspaceService(
          get().workspaces,
          get().versions,
          { ...i, isGuest }
        );

        set((state) => ({
          workspaces: { ...state.workspaces, [workspace.id]: workspace },
          versions: { ...state.versions, [version.id]: version },
          activeWorkspaceId: state.activeWorkspaceId ?? workspace.id,
        }));

        // Enqueue sync if signed in
        if (!isGuest && auth.userId) {
          const now = new Date().toISOString();
          await enqueueOp(auth.userId, {
            opId: `snap-${snapshot.hash}`,
            table: 'text_snapshots',
            op: 'insert_ignore',
            pk: { hash: snapshot.hash },
            payload: snapshotToRow(snapshot),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `ws-${workspace.id}`,
            table: 'resume_workspaces',
            op: 'upsert',
            pk: { id: workspace.id },
            payload: workspaceToRow(workspace),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `ver-${version.id}`,
            table: 'resume_versions',
            op: 'insert_ignore',
            pk: { id: version.id },
            payload: versionToRow(version),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          syncEngine.scheduleFlush();
        }

        return { workspace, version };
      },

      addVersion: async (i) => {
        const auth = useAuthStore.getState();
        const isGuest = auth.status !== 'authenticated';
        const { version, isDeduplicated, snapshot } = await addVersionService(
          get().workspaces,
          get().versions,
          i
        );

        if (isDeduplicated) {
          return version;
        }

        const now = new Date().toISOString();
        set((state) => {
          const ws = state.workspaces[i.workspaceId];
          if (!ws) return state;
          const updatedWs: ResumeWorkspace = {
            ...ws,
            headVersionId: version.id,
            updatedAt: now,
          };
          return {
            workspaces: { ...state.workspaces, [ws.id]: updatedWs },
            versions: { ...state.versions, [version.id]: version },
          };
        });

        if (!isGuest && auth.userId) {
          await enqueueOp(auth.userId, {
            opId: `snap-${snapshot.hash}`,
            table: 'text_snapshots',
            op: 'insert_ignore',
            pk: { hash: snapshot.hash },
            payload: snapshotToRow(snapshot),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `ver-${version.id}`,
            table: 'resume_versions',
            op: 'insert_ignore',
            pk: { id: version.id },
            payload: versionToRow(version),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          const ws = get().workspaces[i.workspaceId];
          if (ws) {
            await enqueueOp(auth.userId, {
              opId: `ws-${ws.id}`,
              table: 'resume_workspaces',
              op: 'upsert',
              pk: { id: ws.id },
              payload: workspaceToRow(ws),
              clientUpdatedAt: now,
              attempts: 0,
              enqueuedAt: now,
            });
          }
          syncEngine.scheduleFlush();
        }

        return version;
      },

      forkWorkspace: async (i) => {
        const auth = useAuthStore.getState();
        const isGuest = auth.status !== 'authenticated';
        const { workspace, version, snapshot } = await forkWorkspaceService(
          get().workspaces,
          get().versions,
          { ...i, isGuest }
        );

        set((state) => ({
          workspaces: { ...state.workspaces, [workspace.id]: workspace },
          versions: { ...state.versions, [version.id]: version },
        }));

        if (!isGuest && auth.userId) {
          const now = new Date().toISOString();
          await enqueueOp(auth.userId, {
            opId: `snap-${snapshot.hash}`,
            table: 'text_snapshots',
            op: 'insert_ignore',
            pk: { hash: snapshot.hash },
            payload: snapshotToRow(snapshot),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `ws-${workspace.id}`,
            table: 'resume_workspaces',
            op: 'upsert',
            pk: { id: workspace.id },
            payload: workspaceToRow(workspace),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          await enqueueOp(auth.userId, {
            opId: `ver-${version.id}`,
            table: 'resume_versions',
            op: 'insert_ignore',
            pk: { id: version.id },
            payload: versionToRow(version),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          });
          syncEngine.scheduleFlush();
        }

        return workspace;
      },

      setHead: (workspaceId, versionId) => {
        const now = new Date().toISOString();
        set((state) => {
          const ws = state.workspaces[workspaceId];
          if (!ws) return state;
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: { ...ws, headVersionId: versionId, updatedAt: now },
            },
          };
        });
      },

      setPrimary: (workspaceId) => {
        const now = new Date().toISOString();
        set((state) => {
          const updated: Record<Uuid, ResumeWorkspace> = {};
          for (const [id, ws] of Object.entries(state.workspaces)) {
            updated[id] = { ...ws, isPrimary: id === workspaceId, updatedAt: now };
          }
          return { workspaces: updated };
        });
      },

      renameWorkspace: (id, name, roleTrack) => {
        const now = new Date().toISOString();
        set((state) => {
          const ws = state.workspaces[id];
          if (!ws) return state;
          return {
            workspaces: {
              ...state.workspaces,
              [id]: { ...ws, name: name.trim(), roleTrack: roleTrack.trim(), updatedAt: now },
            },
          };
        });
      },

      archiveWorkspace: (id) => {
        const now = new Date().toISOString();
        set((state) => {
          const ws = state.workspaces[id];
          if (!ws) return state;
          return {
            workspaces: {
              ...state.workspaces,
              [id]: { ...ws, archivedAt: now, updatedAt: now },
            },
          };
        });
      },

      setActive: (id) => set({ activeWorkspaceId: id }),

      getHeadSnapshot: async (workspaceId) => {
        const ws = get().workspaces[workspaceId];
        if (!ws || !ws.headVersionId) return null;
        const ver = get().versions[ws.headVersionId];
        if (!ver) return null;
        return kvGet<TextSnapshot>(getSnapshotKey(ver.snapshotHash));
      },
    }),
    {
      name: getStorageKey('resumes', null),
      storage: createJSONStorage(() => asyncZustandStorage),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Graceful migration from v4 if applicable
          return persistedState as ResumeState;
        }
        return persistedState as ResumeState;
      },
    }
  )
);
