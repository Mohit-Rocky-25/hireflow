import { create } from 'zustand';
import type { CandidateProfile, UserSettings, Uuid } from '@/domain/types';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { getCloudGateway } from '@/sync/supabaseGateway';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export interface ProfileStoreState {
  profile: CandidateProfile;
  settings: UserSettings;

  updateProfile: (patch: Partial<CandidateProfile>) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setActiveWorkspace: (id: Uuid | null) => void;
  reset: () => void;
}

export function createInitialProfile(): CandidateProfile {
  return {
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
}

export function createInitialSettings(): UserSettings {
  return {
    cloudSyncEnabled: true,
    consentRecordedAt: null,
  };
}

function shouldPersistToCloud(): { enabled: boolean; userId: string | null } {
  const auth = useAuthStore.getState();
  if (auth.status === 'authenticated' && auth.userId && getCloudGateway().isConfigured()) {
    return { enabled: true, userId: auth.userId };
  }
  return { enabled: false, userId: null };
}

export const useProfileStore = create<ProfileStoreState>()((set, get) => ({
  profile: createInitialProfile(),
  settings: createInitialSettings(),

  updateProfile: (patch) => {
    const prevProfile = get().profile;
    const prevSettings = get().settings;
    const now = new Date().toISOString();
    const nextProfile: CandidateProfile = {
      ...prevProfile,
      ...patch,
      updatedAt: now,
    };

    set({ profile: nextProfile });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository
        .saveProfile(cloud.userId, nextProfile, prevSettings, now)
        .catch((err) => {
          set({ profile: prevProfile });
          useCloudSyncStore.getState().setError(
            'save profile',
            err instanceof Error ? err.message : 'Cloud write failed.',
            async () => {
              get().updateProfile(patch);
            }
          );
        });
    }
  },

  updateSettings: (patch) => {
    const prevProfile = get().profile;
    const prevSettings = get().settings;
    const now = new Date().toISOString();
    const nextSettings: UserSettings = {
      ...prevSettings,
      ...patch,
    };

    set({ settings: nextSettings });

    const cloud = shouldPersistToCloud();
    if (cloud.enabled && cloud.userId) {
      void cloudRepository
        .saveProfile(cloud.userId, prevProfile, nextSettings, now)
        .catch((err) => {
          set({ settings: prevSettings });
          useCloudSyncStore.getState().setError(
            'save settings',
            err instanceof Error ? err.message : 'Cloud write failed.',
            async () => {
              get().updateSettings(patch);
            }
          );
        });
    }
  },

  setActiveWorkspace: (id) => {
    get().updateProfile({ activeWorkspaceId: id });
  },

  reset: () =>
    set({
      profile: createInitialProfile(),
      settings: createInitialSettings(),
    }),
}));
