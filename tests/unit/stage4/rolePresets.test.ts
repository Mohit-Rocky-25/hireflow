import { describe, it, expect } from 'vitest';
import {
  getRolePresets,
  getPresetById,
  buildRequirementsFromPreset,
  getBranchBridgeAdvice,
} from '../../../src/lib/presets/rolePresets';
import { REQUIREMENT_WEIGHT_CLASSES } from '../../../src/config/scoring';

describe('A5: Fresher Role Presets & Branch Bridge (A5.1 - A5.4)', () => {
  it('loads all 7 canonical Indian fresher role families with provenance metadata', () => {
    const presets = getRolePresets();
    expect(presets.length).toBe(7);

    const familyIds = presets.map((p) => p.familyId);
    expect(familyIds).toContain('web-fullstack');
    expect(familyIds).toContain('backend');
    expect(familyIds).toContain('data-ml');
    expect(familyIds).toContain('qa-test');
    expect(familyIds).toContain('embedded-iot');
    expect(familyIds).toContain('devops-cloud');
    expect(familyIds).toContain('mobile');

    // All presets have core, common, bonus skills
    expect(presets.every((p) => p.coreSkills.length >= 4)).toBe(true);
    expect(presets.every((p) => p.commonSkills.length >= 3)).toBe(true);
    expect(presets.every((p) => p.bonusSkills.length >= 3)).toBe(true);
  });

  it('builds synthetic requirements with strict config weights from preset', () => {
    const backendPreset = getPresetById('backend')!;
    expect(backendPreset).toBeDefined();

    const { requirements, baselineLabel } = buildRequirementsFromPreset(backendPreset);
    expect(baselineLabel).toContain('HireFlow Fresher Baseline: Backend Software Engineer');

    // Core skills -> mandatory (3.0)
    const coreReqs = requirements.filter((r) => r.sourceCategory === 'core');
    expect(coreReqs.every((r) => r.weight === REQUIREMENT_WEIGHT_CLASSES.mandatory)).toBe(true);
    expect(coreReqs.every((r) => r.importance === 'must_have')).toBe(true);

    // Common skills -> preferred (1.5)
    const commonReqs = requirements.filter((r) => r.sourceCategory === 'common');
    expect(commonReqs.every((r) => r.weight === REQUIREMENT_WEIGHT_CLASSES.preferred)).toBe(true);

    // Bonus skills -> mentioned (1.0)
    const bonusReqs = requirements.filter((r) => r.sourceCategory === 'bonus');
    expect(bonusReqs.every((r) => r.weight === REQUIREMENT_WEIGHT_CLASSES.mentioned)).toBe(true);
  });

  describe('getBranchBridgeAdvice()', () => {
    it('prompts to set branch if branch is unknown or undefined', () => {
      const advice = getBranchBridgeAdvice(null, 'backend');
      expect(advice.promptSetBranch).toBe(true);
      expect(advice.message).toContain('Set your engineering branch');
    });

    it('identifies direct CS/IT branch match without bridge gaps', () => {
      const advice = getBranchBridgeAdvice('B.Tech Computer Science and Engineering', 'backend');
      expect(advice.isCsIt).toBe(true);
      expect(advice.promptSetBranch).toBe(false);
      expect(advice.message).toContain('Direct engineering branch match');
    });

    it('computes transferable hardware/systems skills and missing software skills for ECE fresher', () => {
      const advice = getBranchBridgeAdvice('Electronics and Communication Engineering', 'backend', ['C', 'C++']);

      expect(advice.isCsIt).toBe(false);
      expect(advice.branch).toContain('ECE');
      // Transferable hardware skills
      expect(advice.transferableSkills.length).toBeGreaterThan(0);
      expect(advice.transferableSkills).toContain('RTOS');
      expect(advice.transferableSkills).toContain('Linux');

      // Skills to add: core skills not yet evidenced
      expect(advice.skillsToAdd).toContain('Java');
      expect(advice.skillsToAdd).toContain('SQL');
      expect(advice.message).toContain('Bridging from');
    });
  });
});
