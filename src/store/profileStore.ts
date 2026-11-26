// ============================================================
// HireFlow — Shared Candidate Profile In-Memory Store
// Authenticated profiles persist in Supabase `user_profiles`
// & `resume_workspaces`. Zero localStorage writes.
// ============================================================

import { create } from 'zustand';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';

export interface ActiveResume {
  versionId: string;
  label: string;
  ledger: Record<string, any>;
  textHash: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  label: string;
  ledger: Record<string, any>;
  textHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface LastTarget {
  jdId?: string;
  presetId?: string;
  company?: string;
  role?: string;
}

export interface ProfilePreferences {
  targetFamily?: string;
  branch?: string;
}

export interface ProfileState {
  activeResume: ActiveResume | null;
  resumeVersions: ResumeVersion[];
  lastTarget: LastTarget | null;
  preferences: ProfilePreferences;

  setActiveResume: (resume: ActiveResume | null) => void;
  addResumeVersion: (label: string, ledger: Record<string, any>, textHash: string) => string | null;
  updateResumeLabel: (id: string, label: string) => void;
  deleteResumeVersion: (id: string) => void;
  setLastTarget: (target: LastTarget | null) => void;
  setPreferences: (pref: Partial<ProfilePreferences>) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  activeResume: null,
  resumeVersions: [],
  lastTarget: null,
  preferences: {},

  setActiveResume: (resume) => {
    set({ activeResume: resume });
  },

  addResumeVersion: (label, ledger, textHash) => {
    const current = get();
    if (current.resumeVersions.length >= LIMITS.maxResumeVersions) {
      return null;
    }

    const newId = createId();
    const now = nowIso();
    const newVersion: ResumeVersion = {
      id: newId,
      label,
      ledger,
      textHash,
      createdAt: now,
      updatedAt: now,
    };

    const nextVersions = [...current.resumeVersions, newVersion];
    const nextActive: ActiveResume = {
      versionId: newId,
      label,
      ledger,
      textHash,
      updatedAt: now,
    };

    set({
      resumeVersions: nextVersions,
      activeResume: nextActive,
    });

    return newId;
  },

  updateResumeLabel: (id, label) => {
    const current = get();
    const now = nowIso();
    const nextVersions = current.resumeVersions.map((v) =>
      v.id === id ? { ...v, label, updatedAt: now } : v
    );
    const nextActive =
      current.activeResume?.versionId === id
        ? { ...current.activeResume, label, updatedAt: now }
        : current.activeResume;

    set({
      resumeVersions: nextVersions,
      activeResume: nextActive,
    });
  },

  deleteResumeVersion: (id) => {
    const current = get();
    const nextVersions = current.resumeVersions.filter((v) => v.id !== id);
    const nextActive =
      current.activeResume?.versionId === id
        ? nextVersions.length > 0
          ? {
              versionId: nextVersions[0].id,
              label: nextVersions[0].label,
              ledger: nextVersions[0].ledger,
              textHash: nextVersions[0].textHash,
              updatedAt: nextVersions[0].updatedAt,
            }
          : null
        : current.activeResume;

    set({
      resumeVersions: nextVersions,
      activeResume: nextActive,
    });
  },

  setLastTarget: (target) => {
    set({ lastTarget: target });
  },

  setPreferences: (pref) => {
    set({ preferences: { ...get().preferences, ...pref } });
  },
}));
