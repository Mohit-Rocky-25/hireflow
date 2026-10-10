import { describe, it, expect } from 'vitest';
import { careers } from '../../careers-core';
import { PLATFORM_COMPANIES } from '../../careers-core/data/companies';
import { PLATFORM_LEVELS } from '../../careers-core/data/levels';
import { PLATFORM_FRESHER_PROGRAMS } from '../../careers-core/data/fresherPrograms';
import { PLATFORM_BRANCHES } from '../../careers-core/data/branches';
import { PLATFORM_EQUIVALENCE_LEVELS } from '../../careers-core/data/equivalence';
import { PLATFORM_COMPETENCIES } from '../../careers-core/data/competencies';

describe('Careers Platform Data Integrity & Contract Validation', () => {
  it('validates referential integrity between companies and levels', () => {
    const companyIds = new Set(PLATFORM_COMPANIES.map((c) => c.id));
    expect(companyIds.size).toBe(PLATFORM_COMPANIES.length); // All IDs unique

    for (const level of PLATFORM_LEVELS) {
      expect(companyIds.has(level.companyId)).toBe(true);
      expect(level.levelCode).toBeTruthy();
      expect(level.title).toBeTruthy();

      // Equivalence Level ID must exist if present
      if (level.equivalenceLevelId) {
        expect(PLATFORM_EQUIVALENCE_LEVELS[level.equivalenceLevelId]).toBeDefined();
      }

      // Sanity bounds on compensation
      if (level.compINR) {
        expect(level.compINR.base.min).toBeLessThanOrEqual(level.compINR.base.max);
        expect(level.compINR.totalCTC.min).toBeLessThanOrEqual(level.compINR.totalCTC.max);
      }
    }
  });

  it('validates referential integrity for fresher programs', () => {
    const companyIds = new Set(PLATFORM_COMPANIES.map((c) => c.id));

    for (const prog of PLATFORM_FRESHER_PROGRAMS) {
      expect(companyIds.has(prog.companyId)).toBe(true);
      expect(prog.programName).toBeTruthy();
      expect(prog.roleTitle).toBeTruthy();

      // Must have >= 1 recorded source
      expect(prog.provenance.sources.length).toBeGreaterThanOrEqual(1);

      // Sanity bounds on CTC
      const { fixedMinLPA, fixedMaxLPA } = prog.compensation;
      if (fixedMinLPA !== null && fixedMaxLPA !== null) {
        expect(fixedMinLPA).toBeLessThanOrEqual(fixedMaxLPA);
        expect(fixedMinLPA).toBeGreaterThanOrEqual(2.0);
        expect(fixedMaxLPA).toBeLessThanOrEqual(60.0);
      }

      // Branch codes and families must be valid
      for (const code of prog.eligibility.branchCodes) {
        expect(PLATFORM_BRANCHES.some((b) => b.code === code)).toBe(true);
      }

      // Competency profile keys must exist in canonical competencies
      for (const compId of Object.keys(prog.competencyProfile)) {
        expect(PLATFORM_COMPETENCIES[compId.toLowerCase()]).toBeDefined();
      }
    }
  });

  it('validates public API operations and determinism', () => {
    const manifest = careers.manifest();
    expect(manifest.schemaVersion).toBe('1.0.0');

    // Company operations
    const allCompanies = careers.companies.list();
    expect(allCompanies.length).toBe(PLATFORM_COMPANIES.length);
    const google = careers.companies.get('google');
    expect(google).toBeDefined();
    expect(google?.name).toBe('Google India');

    // Search operations
    const searchRes = careers.companies.search('TCS');
    expect(searchRes.length).toBeGreaterThanOrEqual(1);

    // Levels operations
    const tcsLevels = careers.levels.forCompany('tcs');
    expect(tcsLevels.length).toBeGreaterThanOrEqual(1);

    // Programs operations
    const tcsPrograms = careers.programs.forCompany('tcs');
    expect(tcsPrograms.length).toBeGreaterThanOrEqual(1);

    // Eligibility check
    const elig = careers.eligibility.check(
      { cgpa: 8.5, backlogs: 0, branchCode: 'CSE', gradYear: 2026 },
      'tcs-ninja'
    );
    expect(elig.status).toBe('eligible');

    // Extension API
    careers.ext.register('test-ns', {});
    careers.ext.set('company', 'google', 'test-ns', { flag: true });
    expect(careers.ext.get('company', 'google', 'test-ns')).toEqual({ flag: true });
  });
});
