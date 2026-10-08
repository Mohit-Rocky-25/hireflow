import { describe, it, expect } from 'vitest';
import { calculateIncomeTax, computeOffer } from '../calc';
import { TAX_CONFIG } from '../../../../data/suite/tax-config';
import { OfferInput } from '../types';

describe('Offer Calculation Engine — Tax & 87A Marginal Relief', () => {
  it('Worked Example 1: Gross ₹12,50,000 yields Taxable ₹11,75,000 and ₹0 tax in New Regime', () => {
    const res = calculateIncomeTax(1250000, 'new');
    expect(res.grossIncome).toBe(1250000);
    expect(res.standardDeduction).toBe(75000);
    expect(res.taxableIncome).toBe(1175000);
    expect(res.totalTax).toBe(0);
    expect(res.rebate87A).toBeGreaterThan(0);
    expect(res.marginalReliefApplied).toBe(false);
  });

  it('Worked Example 2: Gross ₹13,00,000 yields Taxable ₹12,25,000, slab tax ₹63,750, marginal cap ₹25,000 + cess = ₹26,000', () => {
    const res = calculateIncomeTax(1300000, 'new');
    expect(res.grossIncome).toBe(1300000);
    expect(res.standardDeduction).toBe(75000);
    expect(res.taxableIncome).toBe(1225000);
    expect(res.slabTaxBeforeRebate).toBe(63750);
    expect(res.marginalReliefApplied).toBe(true);
    expect(res.baseTaxAfterRelief).toBe(25000); // Capped at excess over 12L (12.25L - 12L)
    expect(res.cessAmount).toBe(1000); // 4% of 25,000
    expect(res.totalTax).toBe(26000);
  });

  it('Worked Example 3: Gross ₹18,00,000 yields Taxable ₹17,25,000, base tax ₹1,45,000 + cess = ₹1,50,800', () => {
    const res = calculateIncomeTax(1800000, 'new');
    expect(res.grossIncome).toBe(1800000);
    expect(res.standardDeduction).toBe(75000);
    expect(res.taxableIncome).toBe(1725000);
    expect(res.baseTaxAfterRelief).toBe(145000);
    expect(res.cessAmount).toBe(5800); // 4% of 145,000
    expect(res.totalTax).toBe(150800);
    expect(res.marginalReliefApplied).toBe(false);
  });

  it('ensures tax monotonicity (higher gross income never results in lower tax)', () => {
    const incomes = [
      800000, 1000000, 1200000, 1250000, 1260000, 1280000, 1300000, 1500000,
      1800000, 2000000, 2500000, 3000000,
    ];
    let prevTax = -1;
    for (const inc of incomes) {
      const tax = calculateIncomeTax(inc, 'new').totalTax;
      expect(tax).toBeGreaterThanOrEqual(prevTax);
      prevTax = tax;
    }
  });

  it('handles zero and negative income guards safely', () => {
    const resZero = calculateIncomeTax(0, 'new');
    expect(resZero.taxableIncome).toBe(0);
    expect(resZero.totalTax).toBe(0);

    const resNeg = calculateIncomeTax(-50000, 'new');
    expect(resNeg.taxableIncome).toBe(0);
    expect(resNeg.totalTax).toBe(0);
  });

  it('correctly compares Old Regime with 80C deductions vs New Regime', () => {
    // Gross 10L:
    // New regime: 10L - 75k = 9.25L -> tax is 0 (87A rebate covers up to 12L)
    const newTax = calculateIncomeTax(1000000, 'new').totalTax;
    expect(newTax).toBe(0);

    // Old regime: 10L - 50k std dec - 150k 80C = 8L
    // Slab tax on 8L in old regime:
    // 0-2.5L: 0, 2.5-5L: 12.5k, 5-8L: 3L*20% = 60k -> 72.5k + 4% cess = 75,400
    const oldTax = calculateIncomeTax(1000000, 'old', 150000).totalTax;
    expect(oldTax).toBe(75400);
  });
});

describe('computeOffer — Full Package Breakdown & Risk Flags', () => {
  const baseInput: OfferInput = {
    id: 'test-offer-1',
    companyName: 'Razorpay',
    roleTitle: 'Software Engineer',
    workState: 'KA',
    workCity: 'Bangalore',
    fixedPay: 1800000,
    basicSalaryMode: 'percentage',
    basicSalaryPct: 50, // 9,00,000 basic
    variablePay: 200000,
    variablePayoutPct: 100,
    joiningBonus: 100000,
    joiningBonusClawbackMonths: 12,
    relocationBonus: 50000,
    retentionBonus: 0,
    esopGrantValue: 800000,
    esopVestingYears: 4,
    esopCliffMonths: 12,
    esopListed: false,
    ctcIncludesEmployerPF: true,
    ctcIncludesGratuity: true,
    ctcIncludesInsurance: true,
    serviceBondAmount: 200000,
    serviceBondMonths: 24,
    noticePeriodDays: 60,
    employeePFMode: '12_percent_basic',
    taxRegime: 'new',
  };

  it('computes realistic take-home, waterfall, and year-1 cash with one-offs', () => {
    const result = computeOffer(baseInput);

    expect(result.grossFixedAnnual).toBe(1800000);
    expect(result.calculatedBasicAnnual).toBe(900000);
    expect(result.annualTax).toBe(150800); // 18L fixed in new regime
    expect(result.employeePFAnnual).toBe(108000); // 12% of 900,000
    expect(result.professionalTaxAnnual).toBe(2400); // KA PT
    expect(result.monthlyInHand).toBe(
      Math.round((1800000 - 108000 - 2400 - 150800) / 12)
    );
    expect(result.monthlyInHand).toBe(128233);

    // Year 1 includes variable (200k) + joining (100k) + relocation (50k)
    expect(result.year1Cash).toBe(
      1800000 - 108000 - 2400 - 150800 + 200000 + 100000 + 50000
    );

    // Stated CTC includes employer PF, gratuity, insurance, and 1 year equity (200k)
    expect(result.statedCTC).toBeGreaterThan(1800000 + 200000);
    expect(result.waterfall.length).toBeGreaterThanOrEqual(5);
  });

  it('detects risk flags: service bond, clawback, CTC inflators', () => {
    const result = computeOffer(baseInput);

    const flagIds = result.riskFlags.map((f) => f.id);
    expect(flagIds).toContain('bond');
    expect(flagIds).toContain('clawback');
    expect(flagIds).toContain('inflated-ctc');
  });

  it('supports PF cap mode at Rs 15,000 basic wage', () => {
    const inputWithCappedPF: OfferInput = {
      ...baseInput,
      employeePFMode: 'capped_15k',
    };
    const result = computeOffer(inputWithCappedPF);
    // 12% of 1,80,000 = 21,600
    expect(result.employeePFAnnual).toBe(21600);
    // Increased take-home compared to uncapped PF
    expect(result.monthlyInHand).toBeGreaterThan(128233);
  });

  it('validates tax-config.ts structure integrity', () => {
    expect(TAX_CONFIG.lastVerified).toBe('2026-10');
    expect(TAX_CONFIG.newRegime.standardDeduction).toBe(75000);
    expect(TAX_CONFIG.newRegime.slabs.length).toBe(7);
    expect(TAX_CONFIG.newRegime.rebate87A.hasMarginalRelief).toBe(true);
    expect(TAX_CONFIG.oldRegime.standardDeduction).toBe(50000);
  });
});
