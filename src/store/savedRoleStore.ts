/**
 * HireFlow v4: Saved Roles Store (D19)
 * Stores saved target company roles from TalentLens for JD Compare & Tailor My Resume bridging.
 * Bounded by LIMITS.maxSavedRoles (60 items). Registered with backup registry.
 */

import { create } from 'zustand';
import { storage } from '../lib/storage';
import { SavedRole, SavedRoleStoreSchema, SavedRoleStoreData } from '../types/schemas-v4';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';
import { registerBackupSection } from '../lib/backup/registry';

const STORAGE_KEY = 'saved-roles';

export interface SavedRoleState {
  roles: SavedRole[];
  saveRole: (role: Omit<SavedRole, 'id' | 'savedAt'>) => {
    success: boolean;
    id?: string;
    isDuplicate?: boolean;
    capReached?: boolean;
  };
  unsaveRole: (id: string) => void;
  isSaved: (companyName: string, roleTitle: string) => boolean;
  getRole: (id: string) => SavedRole | undefined;
  clearRoles: () => void;
}

function loadInitialState(): SavedRoleStoreData {
  const loaded = storage.get(STORAGE_KEY, SavedRoleStoreSchema);
  return loaded || { roles: [] };
}

export const useSavedRoleStore = create<SavedRoleState>((set, get) => ({
  roles: loadInitialState().roles,

  saveRole: (role) => {
    const current = get().roles;

    // Check duplicate by companyName + roleTitle
    const existing = current.find(
      (r) =>
        r.companyName.toLowerCase() === role.companyName.toLowerCase() &&
        r.roleTitle.toLowerCase() === role.roleTitle.toLowerCase()
    );
    if (existing) {
      return { success: true, id: existing.id, isDuplicate: true };
    }

    if (current.length >= LIMITS.maxSavedRoles) {
      return { success: false, capReached: true };
    }

    const id = createId();
    const newRole: SavedRole = {
      ...role,
      id,
      savedAt: nowIso(),
    };

    const updated = [newRole, ...current];
    const saved = storage.set(STORAGE_KEY, { roles: updated });
    if (saved) {
      set({ roles: updated });
      return { success: true, id, isDuplicate: false };
    }

    return { success: false };
  },

  unsaveRole: (id) => {
    const updated = get().roles.filter((r) => r.id !== id);
    storage.set(STORAGE_KEY, { roles: updated });
    set({ roles: updated });
  },

  isSaved: (companyName, roleTitle) => {
    return get().roles.some(
      (r) =>
        r.companyName.toLowerCase() === companyName.toLowerCase() &&
        r.roleTitle.toLowerCase() === roleTitle.toLowerCase()
    );
  },

  getRole: (id) => {
    return get().roles.find((r) => r.id === id);
  },

  clearRoles: () => {
    storage.set(STORAGE_KEY, { roles: [] });
    set({ roles: [] });
  },
}));

registerBackupSection<SavedRoleStoreData>({
  key: 'savedRoles',
  schema: SavedRoleStoreSchema,
  version: 1,
  export: () => ({ roles: useSavedRoleStore.getState().roles }),
  import: (data: SavedRoleStoreData, mode) => {
    if (mode === 'replace') {
      storage.set(STORAGE_KEY, data);
      useSavedRoleStore.setState({ roles: data.roles });
      return true;
    } else {
      const current = useSavedRoleStore.getState().roles;
      const existingIds = new Set(current.map((r) => r.id));
      const combined = [...current];
      for (const r of data.roles) {
        if (!existingIds.has(r.id) && combined.length < LIMITS.maxSavedRoles) {
          combined.push(r);
        }
      }
      storage.set(STORAGE_KEY, { roles: combined });
      useSavedRoleStore.setState({ roles: combined });
      return true;
    }
  },
});
