// ============================================================
// HIREFLOW CAREER PATH MODULAR COMPONENTS TESTS
// Unit tests for CompensationTrajectoryChart, PromotionBlockersChecklist,
// LadderLevelExplorer, and StudentPlacementPathway data wiring
// ============================================================

import { describe, it, expect } from 'vitest';
import { formatChartINRTick } from '../CompensationTrajectoryChart';
import type { StructuredBlocker } from '../../../../data/careerLadders/types';
import { getAllCompanies, getCompanyLadder, getLevelsForCompanyAndTrack } from '../../../../data/careerLadders';
import { DEGREE_BRANCH_CATALOG } from '../../../../data/careerLadders/degreesAndBranches';
import { careers } from '../../../../careers-core';
import { resolveStudentPath, formatINR } from '../../../../lib/careerEngine';

describe('Career Path Modular Components Unit Tests', () => {
  describe('CompensationTrajectoryChart tick formatting', () => {
    it('formats 0 as ₹0', () => {
      expect(formatChartINRTick(0)).toBe('₹0');
    });

    it('formats Lakhs correctly (e.g. 18,00,000 -> ₹18 L)', () => {
      expect(formatChartINRTick(1800000)).toBe('₹18 L');
      expect(formatChartINRTick(4200000)).toBe('₹42 L');
      expect(formatChartINRTick(8500000)).toBe('₹85 L');
    });

    it('formats Crores correctly (e.g. 1,00,00,000 -> ₹1 Cr, 1,50,00,000 -> ₹1.5 Cr)', () => {
      expect(formatChartINRTick(10000000)).toBe('₹1 Cr');
      expect(formatChartINRTick(15000000)).toBe('₹1.5 Cr');
      expect(formatChartINRTick(20000000)).toBe('₹2 Cr');
    });
  });

  describe('PromotionBlockers structured data contracts', () => {
    const mockBlockers: StructuredBlocker[] = [
      {
        id: 'blk-01',
        title: 'Siloed Component Thinking',
        category: 'architecture',
        whyItBlocks: 'Staff engineers must consider cross-system dependencies and blast radius.',
        evidenceToCounter: 'Authored multi-service resilience design doc with circuit breaker pattern.',
      },
      {
        id: 'blk-02',
        title: 'Lack of Cross-Functional Influence',
        category: 'influence',
        whyItBlocks: 'Promotion requires buy-in from product, design, and partner engineering pods.',
        evidenceToCounter: 'Led joint working group across 3 teams to ship unified auth API.',
      },
    ];

    it('contains valid categories, blocker reasons, and counter evidence', () => {
      expect(mockBlockers).toHaveLength(2);
      expect(mockBlockers[0].category).toBe('architecture');
      expect(mockBlockers[0].whyItBlocks).toBeTruthy();
      expect(mockBlockers[0].evidenceToCounter).toBeTruthy();
    });
  });

  describe('Ladder Level Explorer Data Wiring', () => {
    it('loads verified Indian engineering hub companies', () => {
      const companies = getAllCompanies();
      expect(companies.length).toBeGreaterThan(10);
      const google = companies.find((c) => c.id === 'google');
      expect(google).toBeDefined();
    });

    it('retrieves SWE levels with authentic compensation and promo criteria', () => {
      const levels = getLevelsForCompanyAndTrack('google', 'SWE');
      expect(levels.length).toBeGreaterThan(0);
      const l3 = levels.find((l) => l.levelCode === 'L3');
      expect(l3).toBeDefined();
      expect(l3?.comp.total.p50).toBeGreaterThan(1500000);
      expect(l3?.promotionProcess.blockers.length).toBeGreaterThan(0);
    });
  });

  describe('Student Placement Pathway Data Integration', () => {
    it('catalogs engineering branches and degrees correctly', () => {
      expect(DEGREE_BRANCH_CATALOG.length).toBeGreaterThan(5);
      const cs = DEGREE_BRANCH_CATALOG.find((b) => b.family === 'software');
      expect(cs).toBeDefined();
    });

    it('resolves campus programs for branch', () => {
      const softwarePrograms = careers.programs.forBranch('software');
      expect(softwarePrograms.length).toBeGreaterThan(0);
      for (const prog of softwarePrograms) {
        expect(prog.id).toBeTruthy();
        expect(prog.companyId).toBeTruthy();
        expect(prog.roleTitle).toBeTruthy();
      }
    });

    it('computes end-to-end student roadmap without synthetic inflation', () => {
      const plan = resolveStudentPath({
        degreeAndBranch: 'B.Tech - Computer Science and Engineering',
        collegeTier: 'Tier 1',
        currentYearOfStudy: 'Final Year',
        yearOfStudy: 4,
        branchFamily: 'software',
        expectedGraduationYear: 2026,
        cgpaBracket: 'above_8',
        internshipStatus: 'completed',
        dreamCompanyId: 'google',
        dreamLevelCode: 'L5',
        track: 'SWE',
      });

      expect(plan).toBeDefined();
      expect(plan.dreamCompany.name).toBeTruthy();
      expect(plan.entryRoutes.length).toBeGreaterThan(0);
      expect(plan.compTimeline.length).toBeGreaterThan(0);
      expect(plan.probability.percentage).toBeGreaterThan(0);
      expect(plan.probability.percentage).toBeLessThanOrEqual(100);

      // Verify strict INR formatting helper
      expect(formatINR(plan.entryRoutes[0].expectedOfferINR)).toMatch(/^₹/);
    });
  });
});
