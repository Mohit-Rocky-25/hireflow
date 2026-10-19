/**
 * HireFlow v4: Shared Candidate Profile Store (A1.1)
 * Single source of truth for candidate active resume, versions, preferences, and target.
 * Persists via storage adapter under hireflow:v4:profile with strict Zod validation.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';
import { ProfileStoreSchema, ProfileStoreData } from '../types/schemas-v4';
import { registerBackupSection } from '../lib/backup/registry';

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

  // Actions
  setActiveResume: (resume: ActiveResume | null) => void;
  addResumeVersion: (label: string, ledger: Record<string, any>, textHash: string) => string | null;
  updateResumeLabel: (id: string, label: string) => void;
  deleteResumeVersion: (id: string) => void;
  setLastTarget: (target: LastTarget | null) => void;
  setPreferences: (pref: Partial<ProfilePreferences>) => void;
}

const STORAGE_KEY = 'profile';

function loadInitialProfile(): ProfileStoreData {
  // Attempt to migrate from legacy suite profile if present
  storage.migrateStore(
    STORAGE_KEY,
    ['hireflow.suite.v1.profile', 'hireflow-storage-v4'],
    (legacy: any) => {
      const active = legacy?.activeResume || legacy?.profile || null;
      return {
        activeResume: active
          ? {
              versionId: active.versionId || createId(),
              label: active.label || 'Default Resume',
              ledger: active.ledger || active.facts || {},
              textHash: active.textHash || 'migrated',
              updatedAt: active.updatedAt || nowIso(),
            }
          : null,
        resumeVersions: (legacy?.resumeVersions || []).slice(0, LIMITS.maxResumeVersions).map((v: any) => ({
          id: v.id || createId(),
          label: v.label || 'Resume Version',
          ledger: v.ledger || {},
          textHash: v.textHash || 'migrated',
          createdAt: v.createdAt || nowIso(),
          updatedAt: v.updatedAt || nowIso(),
        })),
        lastTarget: legacy?.lastTarget || null,
        preferences: legacy?.preferences || {},
      };
    },
    ProfileStoreSchema
  );

  const saved = storage.get<ProfileStoreData>(STORAGE_KEY, ProfileStoreSchema);
  if (saved) {
    return saved;
  }

  return {
    activeResume: null,
    resumeVersions: [],
    lastTarget: null,
    preferences: {},
  };
}

const initialData = loadInitialProfile();

export const useProfileStore = create<ProfileState>((set, get) => ({
  activeResume: initialData.activeResume,
  resumeVersions: initialData.resumeVersions,
  lastTarget: initialData.lastTarget,
  preferences: initialData.preferences,

  setActiveResume: (resume) => {
    set({ activeResume: resume });
    const current = get();
    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: current.activeResume,
      resumeVersions: current.resumeVersions,
      lastTarget: current.lastTarget,
      preferences: current.preferences,
    });
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

    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: nextActive,
      resumeVersions: nextVersions,
      lastTarget: current.lastTarget,
      preferences: current.preferences,
    });

    return newId;
  },

  updateResumeLabel: (id, label) => {
    const current = get();
    const nextVersions = current.resumeVersions.map((v) =>
      v.id === id ? { ...v, label, updatedAt: nowIso() } : v
    );
    const nextActive =
      current.activeResume?.versionId === id
        ? { ...current.activeResume, label, updatedAt: nowIso() }
        : current.activeResume;

    set({
      resumeVersions: nextVersions,
      activeResume: nextActive,
    });

    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: nextActive,
      resumeVersions: nextVersions,
      lastTarget: current.lastTarget,
      preferences: current.preferences,
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

    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: nextActive,
      resumeVersions: nextVersions,
      lastTarget: current.lastTarget,
      preferences: current.preferences,
    });
  },

  setLastTarget: (target) => {
    set({ lastTarget: target });
    const current = get();
    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: current.activeResume,
      resumeVersions: current.resumeVersions,
      lastTarget: target,
      preferences: current.preferences,
    });
  },

  setPreferences: (pref) => {
    const current = get();
    const nextPref = { ...current.preferences, ...pref };
    set({ preferences: nextPref });
    storage.set<ProfileStoreData>(STORAGE_KEY, {
      activeResume: current.activeResume,
      resumeVersions: current.resumeVersions,
      lastTarget: current.lastTarget,
      preferences: nextPref,
    });
  },
}));

// Register with backup registry
registerBackupSection<ProfileStoreData>({
  key: 'profile',
  schema: ProfileStoreSchema,
  version: 1,
  export: () => {
    const state = useProfileStore.getState();
    return {
      activeResume: state.activeResume,
      resumeVersions: state.resumeVersions,
      lastTarget: state.lastTarget,
      preferences: state.preferences,
    };
  },
  import: (data, mode) => {
    if (mode === 'replace') {
      useProfileStore.setState({
        activeResume: data.activeResume,
        resumeVersions: data.resumeVersions,
        lastTarget: data.lastTarget,
        preferences: data.preferences,
      });
      storage.set<ProfileStoreData>(STORAGE_KEY, data);
      return true;
    } else {
      // Merge: keep active if existing, combine unique resume versions up to cap
      const current = useProfileStore.getState();
      const existingIds = new Set(current.resumeVersions.map((v) => v.id));
      const newVersions = [...current.resumeVersions];

      for (const v of data.resumeVersions) {
        if (!existingIds.has(v.id) && newVersions.length < LIMITS.maxResumeVersions) {
          newVersions.push(v);
        }
      }

      const mergedData: ProfileStoreData = {
        activeResume: current.activeResume || data.activeResume,
        resumeVersions: newVersions,
        lastTarget: current.lastTarget || data.lastTarget,
        preferences: { ...data.preferences, ...current.preferences },
      };

      useProfileStore.setState(mergedData);
      storage.set<ProfileStoreData>(STORAGE_KEY, mergedData);
      return true;
    }
  },
});
