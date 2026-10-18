// ============================================================
// HireFlow v3 — Session Store (Candidate Fresher Focus)
// Single global session store: user identity, preferences,
// active role mode (strictly candidate-only for freshers).
// Versioned schema with auto-migration.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FresherProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  collegeTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  graduationYear: number;
  skills: string[];
  dreamCompanies: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  telemetryOptOut: boolean;
  privacyStrict: boolean;
  autoSaveIntervalMs: number;
}

export interface SessionState {
  version: number;
  profile: FresherProfile;
  preferences: UserPreferences;
  // Strictly candidate-only for freshers
  activeRoleMode: 'CANDIDATE_FRESHER';
  
  // Actions
  updateProfile: (updates: Partial<FresherProfile>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetSession: () => void;
}

const DEFAULT_PROFILE: FresherProfile = {
  id: 'cand-fresher-default',
  name: 'Candidate Fresher',
  email: '',
  targetRole: 'Software Engineer - Fresher',
  collegeTier: 'TIER_3',
  graduationYear: new Date().getFullYear(),
  skills: ['Python', 'JavaScript', 'SQL', 'Data Structures & Algorithms'],
  dreamCompanies: ['TCS Digital', 'Infosys Specialist Programmer', 'Amazon', 'Accenture Advance'],
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  telemetryOptOut: true, // Privacy-first default
  privacyStrict: true,
  autoSaveIntervalMs: 5000,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      version: 3,
      profile: DEFAULT_PROFILE,
      preferences: DEFAULT_PREFERENCES,
      activeRoleMode: 'CANDIDATE_FRESHER',

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      resetSession: () =>
        set({
          profile: DEFAULT_PROFILE,
          preferences: DEFAULT_PREFERENCES,
          activeRoleMode: 'CANDIDATE_FRESHER',
        }),
    }),
    {
      name: 'hireflow_session_v3',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) {
          return {
            version: 3,
            profile: DEFAULT_PROFILE,
            preferences: DEFAULT_PREFERENCES,
            activeRoleMode: 'CANDIDATE_FRESHER',
          };
        }
        if (version < 3) {
          // Auto-migrate legacy user or profile data
          const legacy = persistedState as any;
          const user = legacy.currentUser || legacy.profile || {};
          return {
            version: 3,
            profile: {
              ...DEFAULT_PROFILE,
              id: user.id || DEFAULT_PROFILE.id,
              name: user.name || DEFAULT_PROFILE.name,
              email: user.email || DEFAULT_PROFILE.email,
              targetRole: user.title || user.targetRole || DEFAULT_PROFILE.targetRole,
            },
            preferences: {
              ...DEFAULT_PREFERENCES,
              ...(legacy.preferences || {}),
            },
            activeRoleMode: 'CANDIDATE_FRESHER',
          };
        }
        return persistedState as SessionState;
      },
    }
  )
);
