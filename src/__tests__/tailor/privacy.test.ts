// ============================================================
// HIREFLOW UNIT TESTS — PRIVACY & DATA PURGE
// Verifies complete state clearance and local sovereignty
// ============================================================

import { describe, it, expect } from 'vitest';
import { useTailorStore } from '../../lib/tailor/store/tailorStore';

describe('Privacy & Data Purge Sentinel', () => {
  it('resets state and purges project records on wipeAllData', () => {
    const store = useTailorStore.getState();

    // Upload custom candidate
    store.uploadResumeText('Custom Candidate Name\ncustom@example.com\nExperience at Secret Corp', 'secret.pdf');
    expect(useTailorStore.getState().activeProject.candidate.fullName).toBe('Custom Candidate Name');

    // Execute wipe
    store.wipeAllData();

    // Verify pristine state restored
    const afterState = useTailorStore.getState();
    expect(afterState.currentStage).toBe('resume');
    expect(afterState.savedProjects.length).toBe(0);
    expect(afterState.activeProject.candidate.fullName).not.toBe('Custom Candidate Name');
  });
});
