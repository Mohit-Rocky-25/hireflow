/**
 * HireFlow v4: Saved Job Description Library Store (A4.1, A4.2)
 * Local library for saving, deduplicating, and tagging target job descriptions.
 * Strict candidate scope: zero tracker or application-status fields. Max 40 JDs.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { LIMITS } from '../config/limits';
import { createId, nowIso, hashText } from '../lib/safeUtils';
import { SavedJD, SavedJDStoreSchema, SavedJDStoreData } from '../types/schemas-v4';
import { registerBackupSection } from '../lib/backup/registry';
import { toast } from '../components/ui/Toast';

export interface NewJdInput {
  title: string;
  company?: string | null;
  source: 'pasted' | 'talentlens' | 'upload';
  text: string;
  tags?: string[];
}

export interface SaveJdResult {
  id: string | null;
  isDuplicate: boolean;
  capReached: boolean;
}

export interface SavedJdState {
  jds: SavedJD[];
  saveJd: (input: NewJdInput) => SaveJdResult;
  deleteJd: (id: string) => void;
  updateJd: (id: string, updates: Partial<Pick<SavedJD, 'title' | 'company' | 'tags'>>) => void;
  getJdById: (id: string) => SavedJD | undefined;
  getJdByHash: (hash: string) => SavedJD | undefined;
}

const STORAGE_KEY = 'saved_jds';

function loadInitialJds(): SavedJDStoreData {
  const saved = storage.get<SavedJDStoreData>(STORAGE_KEY, SavedJDStoreSchema);
  if (saved) {
    return saved;
  }
  return { jds: [] };
}

const initialData = loadInitialJds();

export const useSavedJdStore = create<SavedJdState>((set, get) => ({
  jds: initialData.jds,

  saveJd: (input) => {
    const current = get();
    const textHash = hashText(input.text.trim());

    // 1. Deduplication check
    const existing = current.jds.find((j) => j.textHash === textHash);
    if (existing) {
      toast('info', `This JD is already in your library as "${existing.title}".`);
      return { id: existing.id, isDuplicate: true, capReached: false };
    }

    // 2. Cap check (max 40)
    if (current.jds.length >= LIMITS.maxSavedJDs) {
      toast(
        'warning',
        `Saved JD cap of ${LIMITS.maxSavedJDs} reached. Please delete an older job description to add a new one.`
      );
      return { id: null, isDuplicate: false, capReached: true };
    }

    const now = nowIso();
    const newJd: SavedJD = {
      id: createId(),
      title: input.title.trim() || 'Untitled Job Description',
      company: input.company?.trim() || null,
      source: input.source,
      text: input.text.trim(),
      textHash,
      tags: input.tags || [],
      addedAt: now,
      updatedAt: now,
    };

    const nextJds = [newJd, ...current.jds];
    set({ jds: nextJds });
    storage.set<SavedJDStoreData>(STORAGE_KEY, { jds: nextJds });
    toast('success', `Saved "${newJd.title}" to your JD library.`);

    return { id: newJd.id, isDuplicate: false, capReached: false };
  },

  deleteJd: (id) => {
    const nextJds = get().jds.filter((j) => j.id !== id);
    set({ jds: nextJds });
    storage.set<SavedJDStoreData>(STORAGE_KEY, { jds: nextJds });
    toast('info', 'Job description removed from library.');
  },

  updateJd: (id, updates) => {
    const nextJds = get().jds.map((j) =>
      j.id === id ? { ...j, ...updates, updatedAt: nowIso() } : j
    );
    set({ jds: nextJds });
    storage.set<SavedJDStoreData>(STORAGE_KEY, { jds: nextJds });
  },

  getJdById: (id) => {
    return get().jds.find((j) => j.id === id);
  },

  getJdByHash: (hash) => {
    return get().jds.find((j) => j.textHash === hash);
  },
}));

// Register with backup registry
registerBackupSection<SavedJDStoreData>({
  key: 'saved_jds',
  schema: SavedJDStoreSchema,
  version: 1,
  export: () => ({ jds: useSavedJdStore.getState().jds }),
  import: (data, mode) => {
    if (mode === 'replace') {
      useSavedJdStore.setState({ jds: data.jds });
      storage.set<SavedJDStoreData>(STORAGE_KEY, data);
      return true;
    } else {
      const current = useSavedJdStore.getState();
      const existingHashes = new Set(current.jds.map((j) => j.textHash));
      const merged = [...current.jds];

      for (const j of data.jds) {
        if (!existingHashes.has(j.textHash) && merged.length < LIMITS.maxSavedJDs) {
          merged.push(j);
        }
      }

      useSavedJdStore.setState({ jds: merged });
      storage.set<SavedJDStoreData>(STORAGE_KEY, { jds: merged });
      return true;
    }
  },
});
