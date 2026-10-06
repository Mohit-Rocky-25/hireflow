// ============================================================
// Career Ladders Data Validation Test Suite
// Asserts strict ordering, required fields, sources, and equivalence
// ============================================================

import { describe, it, expect } from 'vitest';
import { ALL_COMPANY_LADDERS } from '../careerLadders';
import { EQUIVALENCE_GROUPS, getEquivalenceOrder } from '../careerLadders/equivalenceMap';

describe('Career Ladder Dataset Integrity & Schema Validation', () => {
  it('contains at least 25 tech companies covering Big Tech and India Tech', () => {
    expect(ALL_COMPANY_LADDERS.length).toBeGreaterThanOrEqual(25);
  });

  it('validates every company has required metadata', () => {
    for (const company of ALL_COMPANY_LADDERS) {
      expect(company.id, `Company ${company.name} missing id`).toBeTruthy();
      expect(company.name, `Company ${company.id} missing name`).toBeTruthy();
      expect(company.tier, `Company ${company.id} missing tier`).toBeTruthy();
      expect(company.headquarters, `Company ${company.id} missing HQ`).toBeTruthy();
      expect(company.tracks.length, `Company ${company.id} has no tracks`).toBeGreaterThan(0);
      expect(company.sources.length, `Company ${company.id} has no sources`).toBeGreaterThan(0);
      expect(company.levels.length, `Company ${company.id} has no levels`).toBeGreaterThan(0);
      expect(company.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('validates every career level has all mandatory fields populated', () => {
    for (const company of ALL_COMPANY_LADDERS) {
      for (const level of company.levels) {
        const idLabel = `${company.id} • ${level.levelCode}`;

        // Basic Info
        expect(level.levelCode, `${idLabel} missing levelCode`).toBeTruthy();
        expect(level.title, `${idLabel} missing title`).toBeTruthy();
        expect(level.companyId, `${idLabel} companyId mismatch`).toBe(company.id);
        expect(level.yoeTypicalMin, `${idLabel} invalid yoeMin`).toBeGreaterThanOrEqual(0);
        expect(level.yoeTypicalMax, `${idLabel} invalid yoeMax`).toBeGreaterThanOrEqual(level.yoeTypicalMin);
        expect(typeof level.isTerminal, `${idLabel} isTerminal must be boolean`).toBe('boolean');

        // Comp
        expect(level.comp, `${idLabel} missing comp`).toBeDefined();
        expect(['USD', 'INR'], `${idLabel} invalid currency`).toContain(level.comp.currency);
        expect(level.comp.base, `${idLabel} invalid base`).toBeGreaterThan(0);
        expect(level.comp.total.p50, `${idLabel} invalid total p50`).toBeGreaterThan(0);
        expect(level.comp.total.p25, `${idLabel} invalid total p25`).toBeLessThanOrEqual(level.comp.total.p50);
        expect(level.comp.total.p75, `${idLabel} invalid total p75`).toBeGreaterThanOrEqual(level.comp.total.p50);

        // Time In Level
        expect(level.timeInLevel, `${idLabel} missing timeInLevel`).toBeDefined();
        expect(level.timeInLevel.p25, `${idLabel} invalid timeInLevel p25`).toBeGreaterThan(0);
        expect(level.timeInLevel.median, `${idLabel} invalid median`).toBeGreaterThanOrEqual(level.timeInLevel.p25);
        expect(level.timeInLevel.p75, `${idLabel} invalid timeInLevel p75`).toBeGreaterThanOrEqual(level.timeInLevel.median);
        expect(level.timeInLevel.stallRatePct, `${idLabel} invalid stallRate`).toBeGreaterThanOrEqual(0);
        expect(level.timeInLevel.stallRatePct, `${idLabel} invalid stallRate`).toBeLessThanOrEqual(100);

        // Promotion Requirements
        expect(level.promotionRequirements.scope, `${idLabel} missing scope`).toBeTruthy();
        expect(level.promotionRequirements.impact, `${idLabel} missing impact`).toBeTruthy();
        expect(level.promotionRequirements.influence, `${idLabel} missing influence`).toBeTruthy();
        expect(level.promotionRequirements.evidence.length, `${idLabel} missing evidence`).toBeGreaterThan(0);

        // Promotion Process
        expect(level.promotionProcess.cadence, `${idLabel} missing cadence`).toBeTruthy();
        expect(level.promotionProcess.nominator, `${idLabel} missing nominator`).toBeTruthy();
        expect(level.promotionProcess.committee, `${idLabel} missing committee`).toBeTruthy();
        expect(level.promotionProcess.artifacts.length, `${idLabel} missing artifacts`).toBeGreaterThan(0);
        expect(level.promotionProcess.commonBlockers.length, `${idLabel} missing blockers`).toBeGreaterThan(0);

        // Equivalence & Sources
        expect(EQUIVALENCE_GROUPS[level.equivalenceGroup], `${idLabel} invalid equivalenceGroup ${level.equivalenceGroup}`).toBeDefined();
        expect(level.sources.length, `${idLabel} missing sources`).toBeGreaterThan(0);
        expect(['high', 'medium', 'estimate'], `${idLabel} invalid confidence`).toContain(level.confidence);
      }
    }
  });

  it('validates levels within each company track are strictly ordered by equivalence rank', () => {
    for (const company of ALL_COMPANY_LADDERS) {
      for (const track of company.tracks) {
        const trackLevels = company.levels.filter((l) => l.track === track);
        if (trackLevels.length <= 1) continue;

        for (let i = 0; i < trackLevels.length - 1; i++) {
          const current = trackLevels[i];
          const next = trackLevels[i + 1];
          const currOrder = getEquivalenceOrder(current.equivalenceGroup);
          const nextOrder = getEquivalenceOrder(next.equivalenceGroup);

          expect(
            nextOrder,
            `${company.id} [${track}] levels out of order: ${current.levelCode} (${currOrder}) followed by ${next.levelCode} (${nextOrder})`
          ).toBeGreaterThanOrEqual(currOrder);

          // Total compensation must generally increase with level
          expect(
            next.comp.total.p50,
            `${company.id} [${track}] comp should increase: ${next.levelCode} (p50: ${next.comp.total.p50}) should be >= ${current.levelCode} (p50: ${current.comp.total.p50})`
          ).toBeGreaterThanOrEqual(current.comp.total.p50 * 0.95);
        }
      }
    }
  });
});
