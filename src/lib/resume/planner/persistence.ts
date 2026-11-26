// ============================================================
// HIREFLOW SECTION SEQUENCE PREFERENCE (IN-MEMORY)
// Handles transient in-memory candidate sequence overrides (P7)
// without persisting candidate artifacts to browser localStorage.
// ============================================================

import { SectionType } from '../types';

let inMemorySequencePreference: SectionType[] | null = null;

export function loadSavedSequencePreference(): SectionType[] | null {
  return inMemorySequencePreference ? [...inMemorySequencePreference] : null;
}

export function saveSequencePreference(sequence: SectionType[]): boolean {
  inMemorySequencePreference = [...sequence];
  return true;
}

export function clearSavedSequencePreference(): void {
  inMemorySequencePreference = null;
}


