// ============================================================
// HireFlow Suite — Offer Calculation Engine (Stage 6.2)
// Pure deterministic gross-to-net waterfall, tax computation with
// Section 87A marginal relief, PF, ESOPs, and risk analysis.
// ============================================================

import { TAX_CONFIG, TaxSlab } from '../../../data/suite/tax-config';
import { getProfessionalTax } from '../../../data/suite/professional-tax';
import { OfferInput, OfferResult, RiskFlag, WaterfallStep } from './types';

export function computeSlabTax(income: number, slabs: TaxSlab[]): number {
  if (income <= 0) return 0;
  let tax = 0;

  for (const slab of slabs) {
    if (income <= slab.min) continue;

    const taxableInThisSlab = slab.max === null
      ? income - slab.min
      : Math.min(income, slab.max) - slab.min;

    if (taxableInThisSlab > 0) {
      tax += taxableInThisSlab * slab.rate;
    }
  }

  return Math.round(tax);
}

export interface TaxCalculationResult {
  grossIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  slabTaxBeforeRebate: number;
  rebate87A: number;
  marginalReliefApplied: boolean;
  marginalReliefBenefit: number;
  baseTaxAfterRelief: number;
  cessAmount: number;
  totalTax: number;
}

export function calculateIncomeTax(
  grossIncome: number,
  regime: 'new' | 'old' = 'new',
  additionalDeductions: number = 0
): TaxCalculationResult {
  const safeGross = Math.max(0, grossIncome);
  const config = regime === 'new' ? TAX_CONFIG.newRegime : TAX_CONFIG.oldRegime;

  const standardDeduction = Math.min(safeGross, config.standardDeduction);
  let taxableIncome = Math.max(0, safeGross - standardDeduction - additionalDeductions);

  let slabTaxBeforeRebate = computeSlabTax(taxableIncome, config.slabs);
  let rebate87A = 0;
  let marginalReliefApplied = false;
  let marginalReliefBenefit = 0;
  let baseTaxAfterRelief = slabTaxBeforeRebate;

  if (regime === 'new') {
    if (taxableIncome <= config.rebate87A.maxTaxableIncome) {
      rebate87A = slabTaxBeforeRebate;
      baseTaxAfterRelief = 0;
    } else if (config.rebate87A.hasMarginalRelief) {
      const excessOver12L = taxableIncome - config.rebate87A.maxTaxableIncome;
      // Section 87A Marginal Relief: tax payable cannot exceed income over Rs 12,00,000
      if (slabTaxBeforeRebate > excessOver12L) {
        marginalReliefApplied = true;
        marginalReliefBenefit = slabTaxBeforeRebate - excessOver12L;
        baseTaxAfterRelief = excessOver12L;
      }
    }
  } else {
    // Old Regime 87A
    if (taxableIncome <= config.rebate87A.maxTaxableIncome) {
      rebate87A = Math.min(slabTaxBeforeRebate, config.rebate87A.maxRebateAmount);
      baseTaxAfterRelief = Math.max(0, slabTaxBeforeRebate - rebate87A);
    }
  }

  const cessAmount = Math.round(baseTaxAfterRelief * config.cessRate);
  const totalTax = baseTaxAfterRelief + cessAmount;

  return {
    grossIncome: safeGross,
    standardDeduction,
    taxableIncome,
    slabTaxBeforeRebate,
    rebate87A,
    marginalReliefApplied,
    marginalReliefBenefit,
    baseTaxAfterRelief,
    cessAmount,
    totalTax,
  };
}

export function computeOffer(input: OfferInput): OfferResult {
  const fixedPay = Math.max(0, input.fixedPay || 0);

  // 1. Basic Salary
  let basicAnnual = 0;
  if (input.basicSalaryMode === 'fixed' && input.basicSalaryAmount) {
    basicAnnual = Math.max(0, input.basicSalaryAmount);
  } else {
    const pct = Math.max(10, Math.min(100, input.basicSalaryPct || 50));
    basicAnnual = Math.round((fixedPay * pct) / 100);
  }

  // 2. Employee and Employer PF
  let employeePFAnnual = 0;
  if (input.employeePFMode === '12_percent_basic') {
    employeePFAnnual = Math.round(basicAnnual * 0.12);
  } else if (input.employeePFMode === 'capped_15k') {
    // 12% of statutory wage ceiling Rs 15,000/mo (Rs 1,80,000/yr) = Rs 21,600/yr
    const cappedBasic = Math.min(basicAnnual, 180000);
    employeePFAnnual = Math.round(cappedBasic * 0.12);
  }
  const employerPFAnnual = employeePFAnnual; // Matches employee contribution

  // 3. Gratuity (approx 4.81% of basic: (15 * basic) / (26 * 12))
  const gratuityAnnual = input.ctcIncludesGratuity
    ? input.gratuityAnnual ?? Math.round((15 * basicAnnual) / 312)
    : 0;

  // 4. Insurance
  const insuranceAnnual = input.ctcIncludesInsurance
    ? input.insuranceAnnual ?? 15000
    : 0;

  // 5. Professional Tax
  let professionalTaxAnnual = 0;
  if (input.manualProfessionalTaxAnnual !== undefined) {
    professionalTaxAnnual = Math.max(0, input.manualProfessionalTaxAnnual);
  } else {
    professionalTaxAnnual = getProfessionalTax(input.workState).annualAmount;
  }

  // 6. Tax Deductions
  let additionalDeductions = 0;
  if (input.taxRegime === 'old') {
    // 80C cap: Rs 1,50,000 (includes employee PF)
    const pf80C = Math.min(150000, employeePFAnnual);
    const user80C = Math.min(150000 - pf80C, Math.max(0, input.oldRegime80CDeductions || 0));
    const other = Math.max(0, input.oldRegimeOtherDeductions || 0);
    additionalDeductions = pf80C + user80C + other;
  }

  // 7. Income Tax
  const taxResult = calculateIncomeTax(fixedPay, input.taxRegime, additionalDeductions);

  // 8. Stated CTC composition
  const expectedVariable = Math.round((input.variablePay || 0) * (Math.max(0, input.variablePayoutPct ?? 100) / 100));
  const joiningBonus = Math.max(0, input.joiningBonus || 0);
  const relocationBonus = Math.max(0, input.relocationBonus || 0);
  const retentionBonus = Math.max(0, input.retentionBonus || 0);
  const esopGrant = Math.max(0, input.esopGrantValue || 0);

  // Stated CTC sum
  let statedCTC = fixedPay + (input.variablePay || 0);
  if (input.ctcIncludesEmployerPF) statedCTC += employerPFAnnual;
  if (input.ctcIncludesGratuity) statedCTC += gratuityAnnual;
  if (input.ctcIncludesInsurance) statedCTC += insuranceAnnual;
  if (input.esopVestingYears > 0) {
    // Typically CTC quotes 1 year of ESOP grant
    statedCTC += Math.round(esopGrant / input.esopVestingYears);
  }

  // 9. Take-Home Cash Figures
  // Monthly In-Hand (in regular months without one-off bonuses or annual variable)
  const netAnnualFixedCash = Math.max(0, fixedPay - employeePFAnnual - professionalTaxAnnual - taxResult.totalTax);
  const monthlyInHand = Math.round(netAnnualFixedCash / 12);

  // Year 1 Real Cash
  const year1Cash = netAnnualFixedCash + expectedVariable + joiningBonus + relocationBonus;

  // Steady Annual Cash
  const steadyAnnualCash = netAnnualFixedCash + expectedVariable + retentionBonus;

  // 4-Year Cash Projection
  const annualVestedEquity = input.esopVestingYears > 0 ? Math.round(esopGrant / input.esopVestingYears) : 0;
  const fourYearCashOnly = year1Cash + steadyAnnualCash * 3;
  const fourYearCash = fourYearCashOnly + esopGrant;

  // 10. Non-Cash in CTC
  const nonCashYear1 = (input.ctcIncludesEmployerPF ? employerPFAnnual : 0) +
    gratuityAnnual +
    insuranceAnnual +
    annualVestedEquity;

  const equityShareOfCTC = statedCTC > 0 ? Math.round((annualVestedEquity / statedCTC) * 100) : 0;
  const variableDependencyPct = statedCTC > 0 ? Math.round(((input.variablePay || 0) / statedCTC) * 100) : 0;
  const inHandPercentageOfCTC = statedCTC > 0 ? Math.round((steadyAnnualCash / statedCTC) * 100) : 0;

  // 11. Waterfall breakdown
  const waterfall: WaterfallStep[] = [
    {
      label: 'Gross Fixed Pay',
      amount: fixedPay,
      kind: 'base',
      description: 'Contracted annual fixed compensation',
    },
    {
      label: 'Employee PF (12%)',
      amount: -employeePFAnnual,
      kind: 'deduction',
      description: 'Statutory Provident Fund deducted at source',
    },
    {
      label: 'Professional Tax',
      amount: -professionalTaxAnnual,
      kind: 'deduction',
      description: `State labor/employment tax (${input.workState})`,
    },
    {
      label: 'Income Tax (TDS)',
      amount: -taxResult.totalTax,
      kind: 'deduction',
      description: `${taxResult.marginalReliefApplied ? 'Includes Section 87A marginal relief cap' : 'Income tax'} + 4% cess`,
    },
    {
      label: 'Net Guaranteed Cash',
      amount: netAnnualFixedCash,
      kind: 'final',
      description: `₹${monthlyInHand.toLocaleString('en-IN')}/mo assured take-home`,
    },
  ];

  if (expectedVariable > 0) {
    waterfall.push({
      label: 'Expected Variable',
      amount: expectedVariable,
      kind: 'addition',
      description: `Target variable at ${input.variablePayoutPct}% expected payout`,
    });
  }

  if (joiningBonus > 0) {
    waterfall.push({
      label: 'Joining Bonus (Yr 1)',
      amount: joiningBonus,
      kind: 'addition',
      description: `One-time bonus with ${input.joiningBonusClawbackMonths}m clawback`,
    });
  }

  // 12. Risk Flags
  const riskFlags: RiskFlag[] = [];

  if (input.serviceBondAmount > 0) {
    riskFlags.push({
      id: 'bond',
      title: 'Service Bond Obligation',
      severity: 'high',
      explanation: `Legal commitment requiring ₹${input.serviceBondAmount.toLocaleString('en-IN')} penalty if resigning before ${input.serviceBondMonths} months.`,
    });
  }

  if (input.joiningBonus > 0 && input.joiningBonusClawbackMonths > 0) {
    riskFlags.push({
      id: 'clawback',
      title: 'Joining Bonus Clawback',
      severity: 'medium',
      explanation: `Full or pro-rated repayment of ₹${input.joiningBonus.toLocaleString('en-IN')} if leaving within ${input.joiningBonusClawbackMonths} months.`,
    });
  }

  if (variableDependencyPct > 20) {
    riskFlags.push({
      id: 'high-variable',
      title: `High Variable Pay (${variableDependencyPct}% of CTC)`,
      severity: 'medium',
      explanation: 'Over 20% of your advertised package depends on individual & company performance quotas.',
    });
  }

  if (equityShareOfCTC > 20) {
    riskFlags.push({
      id: 'high-equity',
      title: `High Equity Concentration (${equityShareOfCTC}% of CTC)`,
      severity: input.esopListed ? 'info' : 'medium',
      explanation: input.esopListed
        ? 'Public stock (RSUs) has liquidity but is subject to market price volatility.'
        : 'Unlisted startup ESOPs are paper wealth until an IPO or secondary buyback event.',
    });
  }

  if (input.ctcIncludesEmployerPF || input.ctcIncludesGratuity || input.ctcIncludesInsurance) {
    const inflatedAmt = (input.ctcIncludesEmployerPF ? employerPFAnnual : 0) + gratuityAnnual + insuranceAnnual;
    riskFlags.push({
      id: 'inflated-ctc',
      title: `CTC Includes Statutory Overhead (₹${inflatedAmt.toLocaleString('en-IN')})`,
      severity: 'info',
      explanation: 'Employer PF, gratuity, or health insurance premiums are counted towards your gross package.',
    });
  }

  return {
    offerId: input.id,
    companyName: input.companyName,
    roleTitle: input.roleTitle,
    statedCTC,
    grossFixedAnnual: fixedPay,
    calculatedBasicAnnual: basicAnnual,
    standardDeduction: taxResult.standardDeduction,
    taxableIncome: taxResult.taxableIncome,
    slabTaxBeforeRebate: taxResult.slabTaxBeforeRebate,
    rebate87A: taxResult.rebate87A,
    marginalReliefApplied: taxResult.marginalReliefApplied,
    marginalReliefBenefit: taxResult.marginalReliefBenefit,
    baseTaxAfterRelief: taxResult.baseTaxAfterRelief,
    cessAmount: taxResult.cessAmount,
    annualTax: taxResult.totalTax,
    employeePFAnnual,
    employerPFAnnual,
    professionalTaxAnnual,
    monthlyInHand,
    year1Cash,
    steadyAnnualCash,
    fourYearCash,
    fourYearCashOnly,
    nonCashInCTC: nonCashYear1,
    nonCashBreakdown: {
      employerPF: input.ctcIncludesEmployerPF ? employerPFAnnual : 0,
      gratuity: gratuityAnnual,
      insurance: insuranceAnnual,
      unvestedEquityYear1: annualVestedEquity,
    },
    equityShareOfCTC,
    variableDependencyPct,
    inHandPercentageOfCTC,
    waterfall,
    riskFlags,
  };
}
