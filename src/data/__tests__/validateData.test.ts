// ============================================================
// Career Ladders Data Validation Test Suite — India Market Edition
// Asserts strict INR currency, source URLs, 6+ blockers, and verified criteria
// ============================================================

import { describe, it, expect } from 'vitest';
import { ALL_COMPANY_LADDERS } from '../careerLadders';
import { EQUIVALENCE_GROUPS, getEquivalenceOrder } from '../careerLadders/equivalenceMap';

describe('Career Ladder Dataset Integrity & Schema Validation (India Market)', () => {
  it('contains at least 20 tech companies covering Big Tech India, Unicorns, GCCs, and IT Services', () => {
    expect(ALL_COMPANY_LADDERS.length).toBeGreaterThanOrEqual(20);
  });

  it('validates every company has required metadata', () => {
    for (const company of ALL_COMPANY_LADDERS) {
      expect(company.id, `Company ${company.name} missing id`).toBeTruthy();
      expect(company.name, `Company ${company.id} missing name`).toBeTruthy();
      expect(company.marketSegment, `Company ${company.id} missing marketSegment`).toBeTruthy();
      expect(company.tier, `Company ${company.id} missing tier`).toBeTruthy();
      expect(company.headquarters, `Company ${company.id} missing HQ`).toBeTruthy();
      expect(company.tracks.length, `Company ${company.id} has no tracks`).toBeGreaterThan(0);
      expect(company.sources.length, `Company ${company.id} has no sources`).toBeGreaterThan(0);
      expect(company.levels.length, `Company ${company.id} has no levels`).toBeGreaterThan(0);
      expect(company.lastVerified, `Company ${company.id} missing lastVerified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('validates every career level adheres to strict India market rules', () => {
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

        // STRICT RULE 1: Any non-INR currency must fail!
        expect(level.comp, `${idLabel} missing comp`).toBeDefined();
        expect(level.comp.currency, `${idLabel} currency must be strictly INR`).toBe('INR');
        expect(level.comp.region, `${idLabel} region must be IN`).toBe('IN');
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
        expect(level.promotionProcess.decider, `${idLabel} missing decider`).toBeTruthy();
        expect(level.promotionProcess.calibrationLayers, `${idLabel} missing calibrationLayers`).toBeGreaterThanOrEqual(1);
        expect(level.promotionProcess.artifacts.length, `${idLabel} missing artifacts`).toBeGreaterThan(0);

        // STRICT RULE 2: Fewer than 6 structured blockers per level must fail!
        expect(
          level.promotionProcess.blockers.length,
          `${idLabel} must have at least 6 structured blockers (found ${level.promotionProcess.blockers.length})`
        ).toBeGreaterThanOrEqual(6);

        for (const blocker of level.promotionProcess.blockers) {
          expect(blocker.title, `${idLabel} blocker missing title`).toBeTruthy();
          expect(blocker.category, `${idLabel} blocker missing category`).toBeTruthy();
          expect(blocker.whyItBlocks, `${idLabel} blocker missing whyItBlocks`).toBeTruthy();
          expect(blocker.evidenceToCounter, `${idLabel} blocker missing evidenceToCounter`).toBeTruthy();
        }

        // STRICT RULE 3: Missing source URLs must fail!
        expect(level.sources.length, `${idLabel} missing sources`).toBeGreaterThan(0);
        for (const source of level.sources) {
          expect(source.name, `${idLabel} source missing name`).toBeTruthy();
          expect(source.url, `${idLabel} source missing url`).toMatch(/^https?:\/\//);
          expect(source.retrievedAt, `${idLabel} source missing retrievedAt date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(source.extractedFields.length, `${idLabel} source missing extractedFields`).toBeGreaterThan(0);
        }

        // STRICT RULE 4: Missing lastVerified must fail!
        expect(level.lastVerified, `${idLabel} missing lastVerified`).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // STRICT RULE 5: 'Verified' badge without two sources or an official source must fail!
        expect(['verified', 'community', 'estimate'], `${idLabel} invalid confidence`).toContain(level.confidence);
        if (level.confidence === 'verified') {
          const hasTwoSources = level.sources.length >= 2;
          const hasOfficialSource = level.sources.some((s) =>
            s.name.toLowerCase().includes('careers') ||
            s.name.toLowerCase().includes('official') ||
            s.name.toLowerCase().includes('portal') ||
            s.url.includes(company.id)
          );
          expect(
            hasTwoSources || hasOfficialSource,
            `${idLabel} has 'verified' confidence but lacks 2+ independent sources or official source`
          ).toBe(true);
        }

        // STRICT RULE 6: Inconsistent equivalence groups must fail!
        expect(
          EQUIVALENCE_GROUPS[level.equivalenceGroup],
          `${idLabel} invalid equivalenceGroup ${level.equivalenceGroup}`
        ).toBeDefined();
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
          ).toBeGreaterThanOrEqual(current.comp.total.p50 * 0.9);
        }
      }
    }
  });
});
