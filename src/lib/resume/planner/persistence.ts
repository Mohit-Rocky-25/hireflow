// ============================================================
// HIREFLOW SECTION SEQUENCE PERSISTENCE (STAGE 8)
// Handles safe localStorage persistence of candidate sequence overrides (P7).
// Robust quota and corruption handling (I-18).
// ============================================================

import { SectionType } from '../types';

const OVERRIDE_STORAGE_KEY = 'hireflow_section_sequence_preference_v1';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

export function loadSavedSequencePreference(): SectionType[] | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(OVERRIDE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as SectionType[];
    }
  } catch (err) {
    console.warn('Failed to parse saved section sequence preference:', err);
  }
  return null;
}

export function saveSequencePreference(sequence: SectionType[]): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(sequence));
    return true;
  } catch (err) {
    console.warn('Failed to write section sequence preference to localStorage:', err);
    return false;
  }
}

export function clearSavedSequencePreference(): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(OVERRIDE_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear section sequence preference:', err);
  }
}

