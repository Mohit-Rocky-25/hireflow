// ============================================================
// Pathways Offer Engine Test Suite
// Validates 8 C15 Fixtures, New Regime Tax Math, and Invariants
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  calculateNewRegimeTax,
  evaluateOffer,
  compareOffers
} from '../../src/pathways/engine/offer';
import { formatRupees, formatLpa, roundHalfUp } from '../../src/pathways/utils/money';

describe('Pathways Offer Evaluator Engine', () => {
  describe('1. Tax Engine (FY 2026-27 / AY 2027-28)', () => {
    it('applies standard deduction ₹75,000 and Section 87A rebate for taxable income <= ₹12,00,000', () => {
      // Gross: 12,75,000 -> Taxable: 12,00,000 -> Tax: 0
      const res = calculateNewRegimeTax(1275000);
      expect(res.taxableIncome).toBe(1200000);
      expect(res.totalTax).toBe(0);
    });

    it('computes tax with slabs and 4% cess for taxable income above ₹12,00,000', () => {
      // Gross: 16,75,000 -> Taxable: 16,00,000
      // 0-4L: 0
      // 4-8L: 20,000
      // 8-12L: 40,000
      // 12-16L: 60,000
      // Total tax before cess: 120,000
      // Cess 4%: 4,800
      // Total tax: 124,800
      const res = calculateNewRegimeTax(1675000);
      expect(res.taxableIncome).toBe(1600000);
      expect(res.taxBeforeCess).toBe(1200000 * 0 + 20000 + 40000 + 60000);
      expect(res.cess).toBe(4800);
      expect(res.totalTax).toBe(124800);
    });
  });

  describe('2. Eight C15 Hand-Worked Offer Fixtures', () => {
    // 1. OFFER-01-MASS-SERVICES
    it('OFFER-01-MASS-SERVICES: Fixed ₹3.6 LPA, basic ₹15,000, 24-mo bond ₹1,00,000', () => {
      const res = evaluateOffer({
        fixedAnnual: 360000,
        variableAnnualTarget: 0,
        joiningBonus: 0,
        basicMonthly: 15000,
        bondMonths: 24,
        bondAmount: 100000,
        joiningMonth: 4 // July (9 months in FY1)
      });

      expect(res.totalCtcAnnual).toBe(360000);
      // In-hand monthly scenario 0%
      expect(res.scenarios.zeroVariable.netInHandMonthly).toBeGreaterThan(20000);
      expect(res.scenarios.zeroVariable.incomeTaxMonthly).toBe(0); // Under 87A rebate
      // Red flags: bond duration 24 mo > 12 mo, bond amount 100k > 50k
      expect(res.redFlags.some((rf) => rf.id === 'bond_duration_excessive')).toBe(true);
      expect(res.redFlags.some((rf) => rf.id === 'bond_amount_high')).toBe(true);
      // Exit exposure at month 0 must include full bond
      expect(res.exposureTimeline[0].bondExposure).toBe(100000);
    });

    // 2. OFFER-02-PREMIUM-SERVICES
    it('OFFER-02-PREMIUM-SERVICES: Fixed ₹9 LPA, variable ₹1 LPA, bonus ₹50k, 50% basic', () => {
      const res = evaluateOffer({
        fixedAnnual: 900000,
        variableAnnualTarget: 100000,
        joiningBonus: 50000,
        basicMonthly: 37500,
        bondMonths: 0,
        clawbackMonths: 12
      });

      expect(res.totalCtcAnnual).toBe(1050000);
      // Tax is 0 because gross cash is under ₹12.75 Lakhs
      expect(res.scenarios.zeroVariable.incomeTaxMonthly).toBe(0);
      expect(res.scenarios.hundredVariable.incomeTaxMonthly).toBe(0);
      // No bond red flag
      expect(res.redFlags.some((rf) => rf.id === 'bond_duration_excessive')).toBe(false);
    });

    // 3. OFFER-03-GCC-PRODUCT-VARIABLE
    it('OFFER-03-GCC-PRODUCT-VARIABLE: Fixed ₹16 LPA, variable ₹4 LPA (20%), bonus ₹2 LPA', () => {
      const res = evaluateOffer({
        fixedAnnual: 1600000,
        variableAnnualTarget: 400000,
        joiningBonus: 200000,
        basicMonthly: 65000,
        noticePeriodDays: 60
      });

      expect(res.totalCtcAnnual).toBe(2200000);
      // At 100% variable, gross cash exceeds 12.75L, so tax is positive
      expect(res.scenarios.hundredVariable.incomeTaxMonthly).toBeGreaterThan(0);
      // Variable pay inquiry is generated
      expect(res.questionsForHr.length).toBeGreaterThan(0);
    });

    // 4. OFFER-04-STARTUP-ESOP
    it('OFFER-04-STARTUP-ESOP: Fixed ₹12 LPA, ESOP ₹8 LPA (1000 units, 4yr cliff)', () => {
      const res = evaluateOffer({
        fixedAnnual: 1200000,
        variableAnnualTarget: 0,
        joiningBonus: 100000,
        esopGrantValue: 800000,
        esopUnits: 1000
      });

      expect(res.esopProjection).toBeDefined();
      expect(res.esopProjection?.totalUnits).toBe(1000);
      expect(res.esopProjection?.cliffMonths).toBe(12);
      expect(res.esopProjection?.schedule.length).toBe(4);
      expect(res.esopProjection?.schedule[0].vestedUnits).toBe(250); // 25% at 12 mo
      expect(res.esopProjection?.schedule[3].vestedUnits).toBe(1000); // 100% at 48 mo
    });

    // 5. OFFER-05-BONUS-CLAWBACK
    it('OFFER-05-BONUS-CLAWBACK: Fixed ₹6 LPA, bonus ₹1.5 LPA, 24-mo clawback', () => {
      const res = evaluateOffer({
        fixedAnnual: 600000,
        variableAnnualTarget: 0,
        joiningBonus: 150000,
        clawbackMonths: 24
      });

      expect(res.redFlags.some((rf) => rf.id === 'extended_clawback')).toBe(true);
      // Month 0 clawback is full ₹1.5L
      expect(res.exposureTimeline[0].clawbackExposure).toBe(150000);
      // Month 12 clawback is 50% = ₹75,000
      expect(res.exposureTimeline[12].clawbackExposure).toBe(75000);
      // Month 24 clawback is 0
      expect(res.exposureTimeline[24].clawbackExposure).toBe(0);
    });

    // 6. OFFER-06-LONG-BOND
    it('OFFER-06-LONG-BOND: Fixed ₹4.5 LPA, ₹3L bond for 36 months pro-rata', () => {
      const res = evaluateOffer({
        fixedAnnual: 450000,
        variableAnnualTarget: 50000,
        joiningBonus: 0,
        bondMonths: 36,
        bondAmount: 300000,
        bondProRata: true
      });

      // Month 0 bond is full ₹3L
      expect(res.exposureTimeline[0].bondExposure).toBe(300000);
      // Month 18 bond is exactly half ₹1.5L
      expect(res.exposureTimeline[18].bondExposure).toBe(150000);
      // Month 36 bond is 0
      expect(res.exposureTimeline[36].bondExposure).toBe(0);
      // Extended bond duration flag
      expect(res.redFlags.some((rf) => rf.id === 'bond_duration_excessive')).toBe(true);
    });

    // 7. OFFER-07-MARCH-JOINER
    it('OFFER-07-MARCH-JOINER: Fixed ₹8 LPA, joining in March (1 month in FY1)', () => {
      const res = evaluateOffer({
        fixedAnnual: 800000,
        variableAnnualTarget: 0,
        joiningBonus: 0,
        joiningMonth: 12 // March
      });

      expect(res.firstFinancialYear.monthsInFirstFy).toBe(1);
      // 1 month earned is ~₹66k, well below 12L rebate
      expect(res.firstFinancialYear.partialTaxEstimate).toBe(0);
      expect(res.firstFinancialYear.taxReliefRuleApplied).toContain('Section 87A');
    });

    // 8. OFFER-08-OCTOBER-JOINER
    it('OFFER-08-OCTOBER-JOINER: Fixed ₹10 LPA, joining in October (6 months in FY1)', () => {
      const res = evaluateOffer({
        fixedAnnual: 1000000,
        variableAnnualTarget: 0,
        joiningBonus: 0,
        joiningMonth: 7 // October (month 7 of Indian FY)
      });

      expect(res.firstFinancialYear.monthsInFirstFy).toBe(6);
      // 6 months gross is ~₹5,00,000, taxable is well below 12L threshold
      expect(res.firstFinancialYear.partialTaxEstimate).toBe(0);
    });
  });

  describe('3. Seeded Invariant Property Tests', () => {
    it('exit exposure is monotonically non-increasing after peak', () => {
      const res = evaluateOffer({
        fixedAnnual: 600000,
        variableAnnualTarget: 100000,
        joiningBonus: 100000,
        bondMonths: 24,
        bondAmount: 100000,
        bondProRata: true,
        clawbackMonths: 12
      });

      for (let m = 1; m <= 36; m++) {
        expect(res.exposureTimeline[m].bondExposure).toBeLessThanOrEqual(
          res.exposureTimeline[m - 1].bondExposure
        );
        expect(res.exposureTimeline[m].clawbackExposure).toBeLessThanOrEqual(
          res.exposureTimeline[m - 1].clawbackExposure
        );
        expect(res.exposureTimeline[m].totalAtStake).toBeLessThanOrEqual(
          res.exposureTimeline[m - 1].totalAtStake
        );
      }
    });

    it('deterministic reproducibility: identical inputs produce identical outputs', () => {
      const input = {
        fixedAnnual: 750000,
        variableAnnualTarget: 75000,
        joiningBonus: 50000,
        bondMonths: 12,
        bondAmount: 50000
      };
      const run1 = evaluateOffer(input);
      const run2 = evaluateOffer(input);
      expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    });

    it('money utility roundHalfUp and Indian formatting', () => {
      expect(roundHalfUp(12.5)).toBe(13);
      expect(roundHalfUp(12.4)).toBe(12);
      expect(formatRupees(1200000)).toBe('₹12,00,000');
      expect(formatRupees(45000)).toBe('₹45,000');
      expect(formatLpa(850000)).toBe('8.5 LPA');
    });
  });

  describe('4. Side-by-Side Offer Comparison', () => {
    it('evaluates and compares 3 offers side-by-side', () => {
      const comparison = compareOffers([
        {
          name: 'Offer A (Mass Services)',
          input: { fixedAnnual: 400000, variableAnnualTarget: 0, joiningBonus: 0, bondMonths: 24, bondAmount: 100000 }
        },
        {
          name: 'Offer B (GCC)',
          input: { fixedAnnual: 1200000, variableAnnualTarget: 100000, joiningBonus: 100000, bondMonths: 0, bondAmount: 0 }
        },
        {
          name: 'Offer C (Product)',
          input: { fixedAnnual: 1000000, variableAnnualTarget: 200000, joiningBonus: 50000, bondMonths: 0, bondAmount: 0 }
        }
      ]);

      expect(comparison.evaluatedOffers.length).toBe(3);
      expect(comparison.highestGuaranteedCashOffer).toBe('Offer B (GCC)');
      expect(comparison.lowestExitExposureOffer).toBe('Offer C (Product)');
      expect(comparison.summaryTradeoffs.length).toBe(2);
    });
  });
});
