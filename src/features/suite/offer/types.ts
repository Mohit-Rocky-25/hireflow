// ============================================================
// HireFlow Suite — Offer Decoder Types (Stage 6.1)
// Decision Group: "What offer should I take?" (/tools/offer-decoder)
// Strictly typed compensation models, tax regimes, and risk flags.
// ============================================================

export type TaxRegime = 'new' | 'old';
export type EmployeePFMode = '12_percent_basic' | 'capped_15k' | 'none';
export type BasicSalaryMode = 'percentage' | 'fixed';

export interface OfferInput {
  id: string;
  companyName: string;
  roleTitle: string;
  workState: string; // state code or name for professional tax
  workCity?: string;

  // Fixed Cash Components
  fixedPay: number; // Annual gross fixed in INR
  basicSalaryMode: BasicSalaryMode;
  basicSalaryPct: number; // e.g. 50% of fixed pay
  basicSalaryAmount?: number; // if manual fixed amount

  // Variable & Bonuses
  variablePay: number; // Target annual variable in INR
  variablePayoutPct: number; // 0 to 150% expected payout slider (default 100)
  joiningBonus: number; // One-time joining bonus in INR
  joiningBonusClawbackMonths: number; // e.g. 12 or 24 months
  relocationBonus: number; // One-time relocation assist in INR
  retentionBonus: number; // Annual retention bonus in INR

  // Equity / ESOPs / RSUs (Tracked separately, NOT added to guaranteed cash)
  esopGrantValue: number; // Total grant value in INR
  esopVestingYears: number; // e.g. 4 years
  esopCliffMonths: number; // e.g. 12 months
  esopListed: boolean; // Publicly traded vs unlisted startup

  // CTC Composition Inflators (Included in CTC?)
  ctcIncludesEmployerPF: boolean; // 12% employer PF included in CTC figure
  ctcIncludesGratuity: boolean; // ~4.81% gratuity included in CTC figure
  ctcIncludesInsurance: boolean; // Group medical insurance included in CTC figure
  gratuityAnnual?: number;
  insuranceAnnual?: number;

  // Commitments & Obligations
  serviceBondAmount: number; // Monetary penalty in INR if leaving early
  serviceBondMonths: number; // Bond duration in months
  noticePeriodDays: number; // e.g. 30, 60, 90 days

  // Tax & PF Config
  employeePFMode: EmployeePFMode;
  taxRegime: TaxRegime;
  oldRegime80CDeductions?: number; // Capped at Rs 1,50,000
  oldRegimeOtherDeductions?: number; // 80D, HRA, NPS (80CCD)
  manualProfessionalTaxAnnual?: number; // Optional user override
}

export interface WaterfallStep {
  label: string;
  amount: number;
  kind: 'base' | 'deduction' | 'addition' | 'final';
  description: string;
}

export interface RiskFlag {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'info';
  explanation: string;
}

export interface OfferResult {
  offerId: string;
  companyName: string;
  roleTitle: string;

  // Stated vs Real Figures
  statedCTC: number;
  grossFixedAnnual: number;
  calculatedBasicAnnual: number;

  // Deductions & Tax
  standardDeduction: number;
  taxableIncome: number;
  slabTaxBeforeRebate: number;
  rebate87A: number;
  marginalReliefApplied: boolean;
  marginalReliefBenefit: number;
  baseTaxAfterRelief: number;
  cessAmount: number;
  annualTax: number; // Base tax + 4% cess

  // Statutory Payroll Deductions
  employeePFAnnual: number;
  employerPFAnnual: number;
  professionalTaxAnnual: number;

  // In-Hand Cash Pay
  monthlyInHand: number; // Fixed net monthly (months without bonuses)
  year1Cash: number; // Fixed net + expected variable + joining bonus + relocation
  steadyAnnualCash: number; // Fixed net + expected variable + retention bonus
  fourYearCash: number; // Cumulative 4-year cash + vested equity valuation
  fourYearCashOnly: number; // Cumulative 4-year pure cash (excluding equity)

  // Transparency Metrics
  nonCashInCTC: number; // Total amount in CTC that is not liquid cash
  nonCashBreakdown: {
    employerPF: number;
    gratuity: number;
    insurance: number;
    unvestedEquityYear1: number;
  };
  equityShareOfCTC: number; // % of stated CTC that is equity
  variableDependencyPct: number; // % of stated CTC that is variable
  inHandPercentageOfCTC: number; // Steady annual cash / stated CTC * 100

  waterfall: WaterfallStep[];
  riskFlags: RiskFlag[];
}

export interface PreferenceWeights {
  cashNow: number; // 1-5 slider: Priority on immediate monthly in-hand
  brandTier: number; // 1-5 slider: Priority on company prestige / market tier
  stability: number; // 1-5 slider: Low variable, no bond, low clawback
  equityUpside: number; // 1-5 slider: High upside equity potential
}
