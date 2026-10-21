import { describe, it, expect, beforeEach } from 'vitest';
import { useProfileStore } from '../../src/store/profileStore';
import { useTalentLensStore } from '../../src/pages/demo/useTalentLensStore';

describe('TalentLens & Profile Store Synchronization (P1)', () => {
  beforeEach(() => {
    useProfileStore.setState({
      activeResume: null,
      resumeVersions: [],
      lastTarget: null,
      preferences: {},
    });
    useTalentLensStore.setState({
      resumeText: '',
      resumeFileName: '',
      step: 1,
      selectedCompanyId: null,
      selectedRoleTitle: null,
      result: null,
    });
  });

  it('allows active resume from profileStore to populate talentLens store', () => {
    const candidateResumeText = 'Backend Engineer experienced in Go, Docker, PostgreSQL, and Kubernetes at scale.';
    useProfileStore.getState().setActiveResume({
      versionId: 'ver-101',
      label: 'Main SWE Resume 2026',
      ledger: { rawText: candidateResumeText },
      textHash: 'hash-abc',
      updatedAt: new Date().toISOString(),
    });

    const active = useProfileStore.getState().activeResume;
    expect(active).not.toBeNull();
    expect(active?.label).toBe('Main SWE Resume 2026');

    // Simulate the auto-population logic in TalentLens
    if (!useTalentLensStore.getState().resumeText.trim() && active?.ledger?.rawText) {
      useTalentLensStore.getState().setResume(active.ledger.rawText, active.label);
    }

    expect(useTalentLensStore.getState().resumeText).toBe(candidateResumeText);
    expect(useTalentLensStore.getState().resumeFileName).toBe('Main SWE Resume 2026');
  });

  it('preserves existing custom resume if user entered specific text in TalentLens', () => {
    const specificResume = 'Custom resume for specific company application';
    useTalentLensStore.getState().setResume(specificResume, 'custom.txt');

    useProfileStore.getState().setActiveResume({
      versionId: 'ver-102',
      label: 'Profile Resume',
      ledger: { rawText: 'Profile raw text' },
      textHash: 'hash-xyz',
      updatedAt: new Date().toISOString(),
    });

    // When resumeText is already populated, it should not overwrite without user action
    const currentTalentResume = useTalentLensStore.getState().resumeText;
    expect(currentTalentResume).toBe(specificResume);
    expect(currentTalentResume).not.toBe('Profile raw text');
  });
});
