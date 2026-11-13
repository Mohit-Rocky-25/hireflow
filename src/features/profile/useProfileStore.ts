import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CandidateProfile, UserSettings, Uuid } from '@/domain/types';
import { asyncZustandStorage } from '@/lib/storage/zustandStorage';
import { getStorageKey } from '@/lib/storage/namespace';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { enqueueOp } from '@/sync/outbox';
import { profileToRow } from '@/sync/mappers';
import { syncEngine } from '@/sync/syncEngine';

export interface ProfileStoreState {
  profile: CandidateProfile;
  settings: UserSettings;

  updateProfile: (patch: Partial<CandidateProfile>) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setActiveWorkspace: (id: Uuid | null) => void;
}

const initialProfile: CandidateProfile = {
  displayName: 'Candidate',
  email: undefined,
  avatarUrl: undefined,
  degree: undefined,
  branch: undefined,
  graduationYear: undefined,
  targetTier: 'top_product',
  targetRoles: [],
  links: {},
  activeWorkspaceId: null,
  updatedAt: new Date().toISOString(),
};

const initialSettings: UserSettings = {
  cloudSyncEnabled: false,
  consentRecordedAt: null,
};

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      settings: initialSettings,

      updateProfile: (patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          profile: {
            ...state.profile,
            ...patch,
            updatedAt: now,
          },
        }));

        const auth = useAuthStore.getState();
        if (auth.status === 'authenticated' && auth.userId && get().settings.cloudSyncEnabled) {
          void enqueueOp(auth.userId, {
            opId: `prof-${auth.userId}-${now}`,
            table: 'user_profiles',
            op: 'upsert',
            pk: { user_id: auth.userId },
            payload: profileToRow({
              profile: get().profile,
              settings: get().settings,
              updatedAt: now,
            }),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }
      },

      updateSettings: (patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
        }));

        const auth = useAuthStore.getState();
        // Update sync engine with new sync state
        syncEngine.setUser(auth.userId, get().settings.cloudSyncEnabled);

        if (auth.status === 'authenticated' && auth.userId && get().settings.cloudSyncEnabled) {
          void enqueueOp(auth.userId, {
            opId: `prof-settings-${auth.userId}-${now}`,
            table: 'user_profiles',
            op: 'upsert',
            pk: { user_id: auth.userId },
            payload: profileToRow({
              profile: get().profile,
              settings: get().settings,
              updatedAt: now,
            }),
            clientUpdatedAt: now,
            attempts: 0,
            enqueuedAt: now,
          }).then(() => syncEngine.scheduleFlush());
        }
      },

      setActiveWorkspace: (id) => {
        get().updateProfile({ activeWorkspaceId: id });
      },
    }),
    {
      name: getStorageKey('profile', null),
      storage: createJSONStorage(() => asyncZustandStorage),
      version: 1,
    }
  )
);
