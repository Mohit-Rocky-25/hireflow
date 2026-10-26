// ============================================================
// Pathways Architecture — Offer Evaluator Engine
// Pure deterministic functions (Constitution B3/E2/E7).
// Zero network egress, zero floating point inaccuracies.
// ============================================================

import type {
  OfferInput,
  OfferResult,
  MonthlyInHandScenario,
  ExposureDataPoint,
  OfferRedFlag,
  EngineTrace
} from '../schema/types';
import { roundHalfUp, toIntegerRupees } from '../utils/money';

export const OFFER_ENGINE_VERSION = '1.0.0';

/**
 * Pure function: Calculates Indian income tax under New Tax Regime (FY 2026-27 / AY 2027-28).
 * Standard deduction: ₹75,000.
 * Section 87A rebate: full rebate if taxable income <= ₹12,00,000 (tax is 0).
 * Slabs above 12L:
 * 0 - 4L: 0%
 * 4L - 8L: 5% (20,000)
 * 8L - 12L: 10% (40,000)
 * 12L - 16L: 15%
 * 16L - 20L: 20%
 * 20L - 24L: 25%
 * > 24L: 30%
 * Cess: 4%
 */
export function calculateNewRegimeTax(grossIncome: number): {
  taxableIncome: number;
  taxBeforeCess: number;
  rebate87A: number;
  cess: number;
  totalTax: number;
} {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, toIntegerRupees(grossIncome - standardDeduction));

  // Section 87A rebate applies for taxable income up to 12,00,000
  if (taxableIncome <= 1200000) {
    return {
      taxableIncome,
      taxBeforeCess: 0,
      rebate87A: 0,
      cess: 0,
      totalTax: 0
    };
  }

  // Calculate bracket tax
  let tax = 0;

  // 0 to 4L: 0
  // 4L to 8L: 5% of 400,000 = 20,000
  tax += 20000;

  // 8L to 12L: 10% of 400,000 = 40,000
  tax += 40000;

  // 12L to 16L: 15%
  if (taxableIncome > 1600000) {
    tax += 60000; // 15% of 400,000
  } else {
    tax += roundHalfUp((taxableIncome - 1200000) * 0.15);
  }

  // 16L to 20L: 20%
  if (taxableIncome > 2000000) {
    tax += 80000; // 20% of 400,000
  } else if (taxableIncome > 1600000) {
    tax += roundHalfUp((taxableIncome - 1600000) * 0.20);
  }

  // 20L to 24L: 25%
  if (taxableIncome > 2400000) {
    tax += 100000; // 25% of 400,000
  } else if (taxableIncome > 2000000) {
    tax += roundHalfUp((taxableIncome - 2000000) * 0.25);
  }

  // > 24L: 30%
  if (taxableIncome > 2400000) {
    tax += roundHalfUp((taxableIncome - 2400000) * 0.30);
  }

  const cess = roundHalfUp(tax * 0.04);
  const totalTax = toIntegerRupees(tax + cess);

  return {
    taxableIncome,
    taxBeforeCess: tax,
    rebate87A: 0,
    cess,
    totalTax
  };
}

/**
 * Evaluates an Indian fresher offer letter deterministically.
 */
export function evaluateOffer(input: OfferInput): OfferResult {
  const fixedAnnual = toIntegerRupees(input.fixedAnnual || 0);
  const variableAnnual = toIntegerRupees(input.variableAnnualTarget || 0);
  const joiningBonus = toIntegerRupees(input.joiningBonus || 0);
  const totalCtcAnnual = fixedAnnual + variableAnnual + joiningBonus;

  // 1. Basic & allowances derivation
  let basicMonthly = input.basicMonthly ? toIntegerRupees(input.basicMonthly) : 0;
  if (!basicMonthly) {
    // 50% wages rule under Code on Wages
    basicMonthly = toIntegerRupees((fixedAnnual * 0.50) / 12);
  }

  // 2. Employer benefits calculation
  const pfMode = input.pfMode || 'statutory_ceiling';
  let employerPfMonthly = 0;
  if (pfMode === 'statutory_ceiling') {
    employerPfMonthly = Math.min(roundHalfUp(basicMonthly * 0.12), 1800);
  } else if (pfMode === 'actual_basic') {
    employerPfMonthly = roundHalfUp(basicMonthly * 0.12);
  }

  const employerPfAnnual = input.employerPfAnnual
    ? toIntegerRupees(input.employerPfAnnual)
    : employerPfMonthly * 12;

  // Gratuity provision: 4.81% of basic
  const gratuityAnnual = input.gratuityAnnual
    ? toIntegerRupees(input.gratuityAnnual)
    : roundHalfUp(basicMonthly * 12 * 0.0481);

  const insuranceAnnual = input.insuranceAnnual ? toIntegerRupees(input.insuranceAnnual) : 0;
  const otherBenefitsAnnual = input.otherEmployerPaidAnnual
    ? toIntegerRupees(input.otherEmployerPaidAnnual)
    : 0;

  const totalEmployerBenefits =
    (input.employerPfInsideFixed !== false ? employerPfAnnual : 0) +
    (input.gratuityInsideFixed !== false ? gratuityAnnual : 0) +
    insuranceAnnual +
    otherBenefitsAnnual;

  const grossCashAnnual = Math.max(0, fixedAnnual - totalEmployerBenefits + joiningBonus);
  const fixedGrossCashMonthly = Math.max(0, roundHalfUp((fixedAnnual - totalEmployerBenefits) / 12));

  // Employee deductions
  const employeePfMonthly = employerPfMonthly;
  const professionalTaxMonthly = input.professionalTaxAnnual
    ? roundHalfUp(input.professionalTaxAnnual / 12)
    : 200; // Standard 200/mo in major Indian IT hubs
  const otherMonthlyDeductions = input.otherMonthlyDeductions
    ? toIntegerRupees(input.otherMonthlyDeductions)
    : 0;

  // Helper for monthly scenario
  function buildScenario(variablePercent: number): MonthlyInHandScenario {
    const annualVarReceived = roundHalfUp((variableAnnual * variablePercent) / 100);
    const totalAnnualGross = Math.max(0, fixedAnnual - totalEmployerBenefits + annualVarReceived);
    const taxCalc = calculateNewRegimeTax(totalAnnualGross);
    const monthlyTax = roundHalfUp(taxCalc.totalTax / 12);

    const monthlyGross = fixedGrossCashMonthly + roundHalfUp(annualVarReceived / 12);
    const netInHand = Math.max(
      0,
      monthlyGross -
        employeePfMonthly -
        professionalTaxMonthly -
        monthlyTax -
        otherMonthlyDeductions
    );

    return {
      variablePayoutPercent: variablePercent,
      grossCashMonthly: toIntegerRupees(monthlyGross),
      employeePfMonthly: toIntegerRupees(employeePfMonthly),
      professionalTaxMonthly: toIntegerRupees(professionalTaxMonthly),
      incomeTaxMonthly: toIntegerRupees(monthlyTax),
      otherDeductionsMonthly: toIntegerRupees(otherMonthlyDeductions),
      netInHandMonthly: toIntegerRupees(netInHand)
    };
  }

  const zeroVariable = buildScenario(0);
  const fiftyVariable = buildScenario(50);
  const hundredVariable = buildScenario(100);

  // First FY projection
  // Joining month: 1 (April) to 12 (March). Default July = month 4
  const joiningMonth = input.joiningMonth || 4;
  const monthsInFirstFy = Math.max(1, Math.min(12, 13 - joiningMonth));
  const partialGrossEarned = toIntegerRupees(
    monthsInFirstFy * zeroVariable.grossCashMonthly + joiningBonus
  );
  const partialTax = calculateNewRegimeTax(partialGrossEarned);
  const fullYearTax = calculateNewRegimeTax(grossCashAnnual);

  const partialNetInHand = toIntegerRupees(
    partialGrossEarned -
      partialTax.totalTax -
      monthsInFirstFy * (employeePfMonthly + professionalTaxMonthly + otherMonthlyDeductions)
  );

  // Exit Exposure Timeline (Months 0..36)
  const bondMonths = input.bondMonths || 0;
  const bondAmount = toIntegerRupees(input.bondAmount || 0);
  const bondProRata = Boolean(input.bondProRata);
  const clawbackMonths = input.clawbackMonths || (joiningBonus > 0 ? 12 : 0);
  const clawbackPercent = input.clawbackPercent ?? 100;
  const noticeDays = input.noticePeriodDays || 30;
  const noticeBuyoutCost = roundHalfUp((noticeDays / 30) * fixedGrossCashMonthly);

  const yearOneCash = Math.max(1, zeroVariable.netInHandMonthly * 12 + joiningBonus);
  const exposureTimeline: ExposureDataPoint[] = [];

  for (let m = 0; m <= 36; m++) {
    let currentBond = 0;
    if (m < bondMonths && bondAmount > 0) {
      if (bondProRata) {
        currentBond = roundHalfUp(bondAmount * ((bondMonths - m) / bondMonths));
      } else {
        currentBond = bondAmount;
      }
    }

    let currentClawback = 0;
    if (m < clawbackMonths && joiningBonus > 0) {
      const baseClawback = roundHalfUp((joiningBonus * clawbackPercent) / 100);
      currentClawback = roundHalfUp(baseClawback * ((clawbackMonths - m) / clawbackMonths));
    }

    const totalAtStake = toIntegerRupees(currentBond + currentClawback + noticeBuyoutCost);
    const exposurePercent = roundHalfUp((totalAtStake / yearOneCash) * 100);

    exposureTimeline.push({
      month: m,
      bondExposure: currentBond,
      clawbackExposure: currentClawback,
      totalAtStake,
      exposurePercentOfYearOneCash: exposurePercent
    });
  }

  // ESOP Projection
  let esopProjection: OfferResult['esopProjection'];
  if (input.esopGrantValue || input.esopUnits) {
    const totalUnits = input.esopUnits || 100;
    const schedule = [
      { month: 12, vestedPercent: 25, vestedUnits: roundHalfUp(totalUnits * 0.25) },
      { month: 24, vestedPercent: 50, vestedUnits: roundHalfUp(totalUnits * 0.50) },
      { month: 36, vestedPercent: 75, vestedUnits: roundHalfUp(totalUnits * 0.75) },
      { month: 48, vestedPercent: 100, vestedUnits: totalUnits }
    ];

    const baseVal = input.esopGrantValue || 100000;
    const scenarios = [
      { multiplier: 1, estimatedValue: baseVal },
      { multiplier: 2, estimatedValue: baseVal * 2 },
      { multiplier: 5, estimatedValue: baseVal * 5 }
    ];

    esopProjection = {
      totalUnits,
      cliffMonths: 12,
      schedule,
      scenarios
    };
  }

  // Red Flags & HR Questions
  const redFlags: OfferRedFlag[] = [];
  const questionsForHr: string[] = [];

  if (bondMonths > 12) {
    redFlags.push({
      id: 'bond_duration_excessive',
      severity: 'critical',
      title: 'Extended Service Agreement (> 12 Months)',
      description: `Offer mandates a ${bondMonths}-month service bond. Standard campus norms are 12 months or nil.`,
      thresholdUsed: 'bondMonths > 12',
      suggestedHrQuestion: `Can you clarify the legal basis of the ${bondMonths}-month bond and whether training expenses are amortized pro-rata?`
    });
    questionsForHr.push(`Can you clarify if the ${bondMonths}-month service agreement reduces pro-rata over time?`);
  }

  if (bondAmount > 50000) {
    redFlags.push({
      id: 'bond_amount_high',
      severity: 'warning',
      title: 'High Service Bond Amount (> ₹50,000)',
      description: `Service agreement bond of ₹${bondAmount.toLocaleString('en-IN')} exceeds standard ₹50,000 threshold.`,
      thresholdUsed: 'bondAmount > 50000',
      suggestedHrQuestion: `What specific itemized training costs correspond to the ₹${bondAmount.toLocaleString('en-IN')} bond?`
    });
    questionsForHr.push(`What specific formal certifications or training justify the ₹${bondAmount.toLocaleString('en-IN')} bond amount?`);
  }

  if (noticeDays > 60) {
    redFlags.push({
      id: 'long_notice_period',
      severity: 'warning',
      title: 'Lengthy Notice Period (> 60 Days)',
      description: `Notice period of ${noticeDays} days may severely restrict future career transitions.`,
      thresholdUsed: 'noticePeriodDays > 60',
      suggestedHrQuestion: `Is the ${noticeDays}-day notice period applicable during the initial probation period?`
    });
    questionsForHr.push(`Is the ${noticeDays}-day notice period negotiable or reduced during probation?`);
  }

  const inHandRatio = zeroVariable.netInHandMonthly / (totalCtcAnnual / 12);
  if (inHandRatio < 0.60 && totalCtcAnnual > 0) {
    redFlags.push({
      id: 'low_in_hand_ratio',
      severity: 'critical',
      title: 'High CTC Inflation (In-Hand < 60% of CTC)',
      description: `Fixed monthly take-home is only ${(inHandRatio * 100).toFixed(1)}% of nominal CTC due to heavy deductions or variable components.`,
      thresholdUsed: 'netInHand / (ctc / 12) < 0.60',
      suggestedHrQuestion: `What exact percentage of the variable component was achieved and paid out to freshers in the last 2 cycles?`
    });
    questionsForHr.push(`What was the average variable payout percentage for batch freshers in the preceding year?`);
  }

  if (variableAnnual >= fixedAnnual * 0.20 && variableAnnual > 0) {
    redFlags.push({
      id: 'high_variable_component',
      severity: 'warning',
      title: 'High Variable Pay Component (>= 20% of Fixed Pay)',
      description: `Variable pay of ₹${variableAnnual.toLocaleString('en-IN')} represents ${(
        (variableAnnual / fixedAnnual) *
        100
      ).toFixed(1)}% of fixed salary. Actual payout depends on appraisal multipliers.`,
      thresholdUsed: 'variableAnnual >= fixedAnnual * 0.20',
      suggestedHrQuestion: 'Is the variable component linked to individual performance metrics, company business targets, or both?'
    });
    questionsForHr.push('Is the variable component linked to individual performance metrics, company business targets, or both?');
  }

  if (joiningBonus > 0 && clawbackMonths > 12) {
    redFlags.push({
      id: 'extended_clawback',
      severity: 'warning',
      title: 'Extended Joining Bonus Clawback (> 12 Months)',
      description: `Joining bonus of ₹${joiningBonus.toLocaleString('en-IN')} has a clawback period of ${clawbackMonths} months.`,
      thresholdUsed: 'clawbackMonths > 12',
      suggestedHrQuestion: `Does the joining bonus clawback reduce quarterly, or is 100% repayable if leaving before ${clawbackMonths} months?`
    });
  }

  const trace: EngineTrace = {
    engine: 'offer',
    engineVersion: OFFER_ENGINE_VERSION,
    asOf: new Date().toISOString().slice(0, 10),
    inputsUsed: ['fixedAnnual', 'variableAnnualTarget', 'joiningBonus', 'basicMonthly', 'bondMonths', 'bondAmount'],
    rulesApplied: [
      'tax.standardDeduction:75000',
      'tax.newRegime.slabs:FY26-27',
      'tax.rebate87A:1200000',
      'epf.statutoryCeiling:15000',
      'labour.wageDefinition.minRatio:0.50'
    ],
    evidenceRefs: [
      'govt-incometax-tax-standardDeduction-0',
      'govt-incometax-tax-rebate87A-threshold-14',
      'govt-epfo-epf-wageCeiling-1'
    ],
    assumptionsUsed: [],
    unknowns: []
  };

  return {
    totalCtcAnnual,
    fixedAnnual,
    grossCashAnnual,
    employerBenefitsAnnual: {
      employerPf: employerPfAnnual,
      gratuityProvision: gratuityAnnual,
      insurance: insuranceAnnual,
      otherBenefits: otherBenefitsAnnual,
      total: totalEmployerBenefits
    },
    scenarios: {
      zeroVariable,
      fiftyVariable,
      hundredVariable
    },
    firstFinancialYear: {
      joiningMonth,
      monthsInFirstFy,
      partialGrossEarned,
      partialTaxEstimate: partialTax.totalTax,
      partialNetInHand,
      fullYearTaxEquivalent: fullYearTax.totalTax,
      taxReliefRuleApplied: partialTax.totalTax === 0 ? 'Section 87A Full Rebate (Zero FY1 Tax)' : undefined
    },
    exposureTimeline,
    esopProjection,
    redFlags,
    questionsForHr,
    trace
  };
}

/**
 * Side-by-side comparison of up to 3 candidate offers.
 */
export function compareOffers(offers: Array<{ name: string; input: OfferInput }>): {
  evaluatedOffers: Array<{ name: string; result: OfferResult }>;
  highestGuaranteedCashOffer: string;
  lowestExitExposureOffer: string;
  summaryTradeoffs: string[];
} {
  const evaluatedOffers = offers.slice(0, 3).map((o) => ({
    name: o.name,
    result: evaluateOffer(o.input)
  }));

  let highestCash = evaluatedOffers[0]?.name || '';
  let maxCash = -1;

  let lowestExposure = evaluatedOffers[0]?.name || '';
  let minExposure = Infinity;

  for (const item of evaluatedOffers) {
    if (item.result.scenarios.zeroVariable.netInHandMonthly > maxCash) {
      maxCash = item.result.scenarios.zeroVariable.netInHandMonthly;
      highestCash = item.name;
    }
    const maxAtStake = Math.max(...item.result.exposureTimeline.map((e) => e.totalAtStake));
    if (maxAtStake < minExposure) {
      minExposure = maxAtStake;
      lowestExposure = item.name;
    }
  }

  const summaryTradeoffs: string[] = [];
  if (evaluatedOffers.length > 1) {
    summaryTradeoffs.push(
      `Offer "${highestCash}" delivers the highest baseline monthly in-hand (₹${maxCash.toLocaleString('en-IN')}/mo at 0% variable).`
    );
    summaryTradeoffs.push(
      `Offer "${lowestExposure}" imposes the lowest financial exit liability across 36 months.`
    );
  }

  return {
    evaluatedOffers,
    highestGuaranteedCashOffer: highestCash,
    lowestExitExposureOffer: lowestExposure,
    summaryTradeoffs
  };
}
