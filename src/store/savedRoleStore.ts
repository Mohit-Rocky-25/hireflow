// ============================================================
// HireFlow — Saved Roles In-Memory Store
// Durable target persistence lives in Supabase `watchlist_targets`.
// ============================================================

import { create } from 'zustand';
import { SavedRole } from '../types/schemas-v4';
import { LIMITS } from '../config/limits';
import { createId, nowIso } from '../lib/safeUtils';

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

export const useSavedRoleStore = create<SavedRoleState>((set, get) => ({
  roles: [],

  saveRole: (role) => {
    const current = get().roles;
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

    set({ roles: [newRole, ...current] });
    return { success: true, id, isDuplicate: false };
  },

  unsaveRole: (id) => {
    set({ roles: get().roles.filter((r) => r.id !== id) });
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
    set({ roles: [] });
  },
}));
