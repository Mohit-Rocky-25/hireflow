// ============================================================
// HireFlow — Session UI State Store (In-Memory)
// Auth identity lives exclusively in useAuthStore / Supabase Auth.
// ============================================================

import { create } from 'zustand';

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
  activeRoleMode: 'CANDIDATE_FRESHER';

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
  telemetryOptOut: true,
  privacyStrict: true,
  autoSaveIntervalMs: 5000,
};

export const useSessionStore = create<SessionState>()((set) => ({
  version: 4,
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
}));
