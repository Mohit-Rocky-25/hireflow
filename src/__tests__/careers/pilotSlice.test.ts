import { describe, it, expect } from 'vitest';
import { careers } from '../../careers-core';

describe('Careers Platform — Stage 4 Pilot Slice Across 4 Consumers', () => {
  const pilotProgramIds = ['tcs-ninja', 'flipkart-sde1', 'tatamotors-get'];

  it('proves all 3 pilot programs exist and have complete schema contracts', () => {
    for (const pid of pilotProgramIds) {
      const prog = careers.programs.get(pid);
      expect(prog).toBeDefined();
      expect(prog!.id).toBe(pid);
      expect(prog!.companyId).toBeDefined();
      expect(prog!.programName).toBeDefined();
      expect(prog!.roleTitle).toBeDefined();
      expect(prog!.eligibility).toBeDefined();
      expect(prog!.selectionProcess.length).toBeGreaterThan(0);
      expect(prog!.compensation.fixedMinLPA).toBeGreaterThan(0);
      expect(prog!.compensation.fixedMaxLPA).toBeGreaterThanOrEqual(prog!.compensation.fixedMinLPA!);
      expect(prog!.provenance.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Consumer 1 (Career Trajectory): surfaces 5-year trajectories mapped to level ladder', () => {
    const tcsNinja = careers.programs.get('tcs-ninja')!;
    const trajectory = careers.trajectories.forProgram('tcs-ninja');
    expect(trajectory.length).toBeGreaterThanOrEqual(1);

    const firstStep = trajectory[0];
    expect(firstStep.fromLevelCode).toBe('NINJA');
    expect(firstStep.toLevelCode).toBe('DIGITAL');
    expect(firstStep.typicalYearsMin).toBe(1.5);
    expect(firstStep.typicalYearsMax).toBe(2.5);

    // Verify company level exists in ladder
    const ladderLevels = careers.levels.forCompany('tcs');
    const matchedFrom = ladderLevels.find((l) => l.levelCode === firstStep.fromLevelCode);
    const matchedTo = ladderLevels.find((l) => l.levelCode === firstStep.toLevelCode);
    expect(matchedFrom).toBeDefined();
    expect(matchedTo).toBeDefined();
  });

  it('Consumer 2 (TalentLens): evaluates candidate eligibility and exposes competencies', () => {
    const eligibleFacts = { cgpa: 8.0, backlogs: 0, branchCode: 'CSE', gradYear: 2026 };
    const check1 = careers.eligibility.check(eligibleFacts, 'tcs-ninja');
    expect(check1.status).toBe('eligible');

    const lowCgpaFacts = { cgpa: 5.5, backlogs: 0, branchCode: 'CSE', gradYear: 2026 };
    const check2 = careers.eligibility.check(lowCgpaFacts, 'tcs-ninja');
    expect(check2.status).toBe('ineligible');
    expect(check2.reasons.some((r) => r.includes('CGPA'))).toBe(true);

    const comps = careers.competencies.forRole('tcs-ninja');
    expect(comps).toBeDefined();
    expect(comps['java']).toBe('working');
  });

  it('Consumer 3 (ATS Resume Roaster): derives keywords dynamically without hand maintenance', () => {
    const flipkartKeywords = careers.keywords.forRole('flipkart-sde1');
    expect(flipkartKeywords.length).toBeGreaterThan(0);
    // Should include keywords derived from dsa, systemdesign, java
    expect(flipkartKeywords).toContain('dsa');
    expect(flipkartKeywords).toContain('microservices');
  });

  it('Consumer 4 (Tailor Quick Load): loads program profile and requirements basis', () => {
    const getProg = careers.programs.get('tatamotors-get');
    expect(getProg).toBeDefined();
    expect(getProg!.roleFamily).toBe('core-mechanical');
    expect(getProg!.compensation.fixedMinLPA).toBe(6.5);
    expect(getProg!.compensation.fixedMaxLPA).toBe(8.5);

    const tataKeywords = careers.keywords.forRole('tatamotors-get');
    expect(tataKeywords.length).toBeGreaterThan(0);
  });

  it('Unified Parity: all four consumers see identical metadata and provenance badge info', () => {
    for (const pid of pilotProgramIds) {
      const meta = careers.meta.forEntity('program', pid);
      expect(meta).toBeDefined();
      expect(meta!.confidence).toBe('high');
      expect(meta!.sources.length).toBeGreaterThanOrEqual(1);
      expect(meta!.lastVerified).toBe('2026-10-10');
    }
  });
});
