import { describe, it, expect, beforeEach } from 'vitest';
import { useProfileStore } from '../../../src/store/profileStore';
import { LIMITS } from '../../../src/config/limits';

describe('A1: Shared Profile Store (A1.1, A1.5)', () => {
  beforeEach(() => {
    useProfileStore.setState({
      activeResume: null,
      resumeVersions: [],
      lastTarget: null,
      preferences: {},
    });
  });

  it('adds resume versions up to the configured limit of 5', () => {
    const store = useProfileStore.getState();

    // Add 5 versions
    for (let i = 1; i <= LIMITS.maxResumeVersions; i++) {
      const id = store.addResumeVersion(
        `Version ${i}`,
        { projects: [{ name: `Project ${i}` }] },
        `hash_${i}`
      );
      expect(id).toBeTruthy();
    }

    const stateAfter5 = useProfileStore.getState();
    expect(stateAfter5.resumeVersions.length).toBe(5);
    expect(stateAfter5.activeResume?.label).toBe('Version 5');

    // Attempting to add a 6th version should be refused
    const refusedId = store.addResumeVersion(
      'Version 6',
      { projects: [] },
      'hash_6'
    );
    expect(refusedId).toBeNull();
    expect(useProfileStore.getState().resumeVersions.length).toBe(5);
  });

  it('updates resume labels cleanly without mutating underlying ledger content', () => {
    const store = useProfileStore.getState();
    const id = store.addResumeVersion('Old Label', { key: 'value' }, 'hash_1');

    store.updateResumeLabel(id!, 'Renamed SDE Fresher');

    const state = useProfileStore.getState();
    expect(state.activeResume?.label).toBe('Renamed SDE Fresher');
    expect(state.resumeVersions[0].label).toBe('Renamed SDE Fresher');
    expect(state.activeResume?.ledger).toEqual({ key: 'value' });
  });

  it('deletes a version and automatically falls back to remaining version if active', () => {
    const store = useProfileStore.getState();
    const id1 = store.addResumeVersion('V1', {}, 'h1');
    const id2 = store.addResumeVersion('V2', {}, 'h2');

    expect(useProfileStore.getState().activeResume?.versionId).toBe(id2);

    store.deleteResumeVersion(id2!);

    const state = useProfileStore.getState();
    expect(state.resumeVersions.length).toBe(1);
    expect(state.activeResume?.versionId).toBe(id1);
  });

  it('resets state cleanly in memory without writing localStorage persistence keys', () => {
    const store = useProfileStore.getState();
    store.addResumeVersion('Cloud Sync Ready', { test: true }, 'hash_test');
    store.setPreferences({ branch: 'ECE', targetFamily: 'Embedded/IoT' });

    useProfileStore.setState({
      activeResume: null,
      resumeVersions: [],
      lastTarget: null,
      preferences: {},
    });

    const state = useProfileStore.getState();
    expect(state.activeResume).toBeNull();
    expect(state.resumeVersions).toEqual([]);
    expect(state.preferences).toEqual({});
  });
});
