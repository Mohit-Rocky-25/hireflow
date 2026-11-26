// ============================================================
// Pathways Architecture — Student Profile Store (In-Memory)
// Zero browser database persistence of user profile data.
// ============================================================

import { create } from 'zustand';
import type { StudentProfile } from '../schema/types';

interface ProfileState {
  profile: StudentProfile;
  setProfile: (updates: Partial<StudentProfile>) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: StudentProfile = {
  branch: 'CSE',
  batchYear: 2026,
  cgpa: 7.5,
  cgpaScale: 10,
  degree: 'B.Tech',
  percent10: null,
  percent12: null,
  percentAggregate: null,
  isDiploma: false,
  activeBacklogs: 0,
  gapMonths: 0,
};

export const usePathwaysProfileStore = create<ProfileState>()((set) => ({
  profile: DEFAULT_PROFILE,
  setProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
  resetProfile: () => set({ profile: DEFAULT_PROFILE }),
}));
