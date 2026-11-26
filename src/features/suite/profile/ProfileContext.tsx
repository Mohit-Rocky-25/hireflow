// ============================================================
// Candidate Profile — Profile Context & Provider (Stage 1.5)
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CandidateProfile } from './types';
import { SuiteStorage } from './storage';
import { buildProfile, ManualProfileFields } from './buildProfile';

interface ProfileContextType {
  profile: CandidateProfile | null;
  hasProfile: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  saveFromResumeText: (resumeText: string, manual?: ManualProfileFields) => CandidateProfile;
  updateProfile: (updated: CandidateProfile) => void;
  clearProfile: () => void;
  exportAllData: () => void;
  importAllData: (jsonStr: string) => { ok: boolean; error?: string };
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CandidateProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const reloadProfile = useCallback(() => {
    const res = SuiteStorage.loadProfile();
    if (res.ok && res.data) {
      setProfileState(res.data);
    } else {
      setProfileState(null);
    }
  }, []);

  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  const saveFromResumeText = useCallback((resumeText: string, manual?: ManualProfileFields): CandidateProfile => {
    const built = buildProfile(resumeText, manual);
    SuiteStorage.saveProfile(built);
    setProfileState(built);
    return built;
  }, []);

  const updateProfile = useCallback((updated: CandidateProfile) => {
    SuiteStorage.saveProfile(updated);
    setProfileState(updated);
  }, []);

  const clearProfile = useCallback(() => {
    SuiteStorage.clearAll();
    setProfileState(null);
  }, []);

  const exportAllData = useCallback(() => {
    const dataStr = SuiteStorage.exportAll();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-suite-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importAllData = useCallback((jsonStr: string) => {
    const res = SuiteStorage.importAll(jsonStr);
    if (res.ok) {
      reloadProfile();
    }
    return res;
  }, [reloadProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: Boolean(profile),
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        saveFromResumeText,
        updateProfile,
        clearProfile,
        exportAllData,
        importAllData,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
