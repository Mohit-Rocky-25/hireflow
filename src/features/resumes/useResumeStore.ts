import { create } from 'zustand';
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
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import {
  cloudRepository,
  getCachedSnapshotInMemory,
} from '@/lib/cloud/cloudRepository';
import { uploadPrivateDocument } from '@/lib/cloud/storageService';
import { useCloudDocumentsStore } from '@/lib/cloud/useDocumentsStore';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export interface ResumeFileAttachment {
  fileName: string;
  mimeType: string;
  buffer: ArrayBuffer;
}

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
    fileAttachment?: ResumeFileAttachment;
  }) => Promise<{ workspace: ResumeWorkspace; version: ResumeVersion }>;

  addVersion: (i: {
    workspaceId: Uuid;
    text: string;
    label: string;
    source: VersionSource;
    parentVersionId?: Uuid | null;
    note?: string;
    fileName?: string;
    fileAttachment?: ResumeFileAttachment;
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

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  const isCloudReady = getCloudGateway().isConfigured();
  if (auth.status === 'authenticated' && auth.userId && isCloudReady) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
}

export const useResumeStore = create<ResumeState>()((set, get) => ({
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

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      await cloudRepository.saveWorkspaceWithVersion(cloud.userId, workspace, version, snapshot);
      if (i.fileAttachment) {
        const doc = await uploadPrivateDocument({
          userId: cloud.userId,
          docKind: 'resume_upload',
          fileName: i.fileAttachment.fileName,
          mimeType: i.fileAttachment.mimeType,
          buffer: i.fileAttachment.buffer,
          workspaceId: workspace.id,
          versionId: version.id,
        });
        useCloudDocumentsStore.getState().addDocument(doc);
      }
    }

    set((state) => ({
      workspaces: { ...state.workspaces, [workspace.id]: workspace },
      versions: { ...state.versions, [version.id]: version },
      activeWorkspaceId: state.activeWorkspaceId ?? workspace.id,
    }));

    return { workspace, version };
  },

  addVersion: async (i) => {
    const { version, isDeduplicated, snapshot } = await addVersionService(
      get().workspaces,
      get().versions,
      i
    );

    if (isDeduplicated) {
      return version;
    }

    const existingWs = get().workspaces[i.workspaceId];
    if (!existingWs) {
      return version;
    }

    const now = new Date().toISOString();
    const updatedWs: ResumeWorkspace = {
      ...existingWs,
      headVersionId: version.id,
      updatedAt: now,
    };

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      await cloudRepository.saveAddedVersion(cloud.userId, updatedWs, version, snapshot);
      if (i.fileAttachment) {
        const doc = await uploadPrivateDocument({
          userId: cloud.userId,
          docKind: 'resume_upload',
          fileName: i.fileAttachment.fileName,
          mimeType: i.fileAttachment.mimeType,
          buffer: i.fileAttachment.buffer,
          workspaceId: updatedWs.id,
          versionId: version.id,
        });
        useCloudDocumentsStore.getState().addDocument(doc);
      }
    }

    set((state) => ({
      workspaces: { ...state.workspaces, [updatedWs.id]: updatedWs },
      versions: { ...state.versions, [version.id]: version },
    }));

    return version;
  },

  forkWorkspace: async (i) => {
    const auth = useAuthStore.getState();
    const isGuest = auth.status !== 'authenticated';
    const { workspace, version, snapshot } = await forkWorkspaceService(
      get().workspaces,
      get().versions,
      { ...i, isGuest, userId: auth.userId }
    );

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      await cloudRepository.saveWorkspaceWithVersion(cloud.userId, workspace, version, snapshot);
    }

    set((state) => ({
      workspaces: { ...state.workspaces, [workspace.id]: workspace },
      versions: { ...state.versions, [version.id]: version },
    }));

    return workspace;
  },

  setHead: (workspaceId, versionId) => {
    const prev = get().workspaces[workspaceId];
    if (!prev) return;
    const now = new Date().toISOString();
    const updated: ResumeWorkspace = { ...prev, headVersionId: versionId, updatedAt: now };

    set((state) => ({
      workspaces: { ...state.workspaces, [workspaceId]: updated },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveWorkspace(cloud.userId, updated).catch((err) => {
        set((state) => ({
          workspaces: { ...state.workspaces, [workspaceId]: prev },
        }));
        useCloudSyncStore.getState().setError(
          'update workspace head version',
          err instanceof Error ? err.message : 'Failed to save workspace update.',
          async () => {
            get().setHead(workspaceId, versionId);
          }
        );
      });
    }
  },

  setPrimary: (workspaceId) => {
    const prevAll = get().workspaces;
    const now = new Date().toISOString();
    const updated: Record<Uuid, ResumeWorkspace> = {};
    for (const [id, ws] of Object.entries(prevAll)) {
      updated[id] = { ...ws, isPrimary: id === workspaceId, updatedAt: now };
    }
    set({ workspaces: updated });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void Promise.all(
        Object.values(updated).map((ws) => cloudRepository.saveWorkspace(cloud.userId!, ws))
      ).catch((err) => {
        set({ workspaces: prevAll });
        useCloudSyncStore.getState().setError(
          'set primary resume workspace',
          err instanceof Error ? err.message : 'Failed to update primary workspace.',
          async () => {
            get().setPrimary(workspaceId);
          }
        );
      });
    }
  },

  renameWorkspace: (id, name, roleTrack) => {
    const prev = get().workspaces[id];
    if (!prev) return;
    const now = new Date().toISOString();
    const updated: ResumeWorkspace = {
      ...prev,
      name: name.trim(),
      roleTrack: roleTrack.trim(),
      updatedAt: now,
    };

    set((state) => ({
      workspaces: { ...state.workspaces, [id]: updated },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveWorkspace(cloud.userId, updated).catch((err) => {
        set((state) => ({
          workspaces: { ...state.workspaces, [id]: prev },
        }));
        useCloudSyncStore.getState().setError(
          'rename resume workspace',
          err instanceof Error ? err.message : 'Failed to rename workspace.',
          async () => {
            get().renameWorkspace(id, name, roleTrack);
          }
        );
      });
    }
  },

  archiveWorkspace: (id) => {
    const prev = get().workspaces[id];
    if (!prev) return;
    const now = new Date().toISOString();
    const updated: ResumeWorkspace = { ...prev, archivedAt: now, updatedAt: now };

    set((state) => ({
      workspaces: { ...state.workspaces, [id]: updated },
    }));

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository.saveWorkspace(cloud.userId, updated).catch((err) => {
        set((state) => ({
          workspaces: { ...state.workspaces, [id]: prev },
        }));
        useCloudSyncStore.getState().setError(
          'archive resume workspace',
          err instanceof Error ? err.message : 'Failed to archive workspace.',
          async () => {
            get().archiveWorkspace(id);
          }
        );
      });
    }
  },

  setActive: (id) => set({ activeWorkspaceId: id }),

  getHeadSnapshot: async (workspaceId) => {
    const ws = get().workspaces[workspaceId];
    if (!ws || !ws.headVersionId) return null;
    const ver = get().versions[ws.headVersionId];
    if (!ver) return null;
    const auth = useAuthStore.getState();
    return (
      getCachedSnapshotInMemory(ver.snapshotHash) ??
      (await cloudRepository.fetchSnapshot(ver.snapshotHash, auth.userId))
    );
  },
}));
