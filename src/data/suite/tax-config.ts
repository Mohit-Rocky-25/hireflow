// ============================================================
// Indian Income Tax Configuration (Stage 6.1)
// FY 2026-27 (Assessment Year 2027-28)
// Note: Verify against official Income Tax Department sources each financial year.
// ============================================================

export interface TaxSlab {
  min: number;
  max: number | null; // null for above threshold
  rate: number; // decimal e.g. 0.05 for 5%
}

export interface TaxRegimeConfig {
  name: string;
  financialYear: string;
  standardDeduction: number;
  slabs: TaxSlab[];
  rebate87A: {
    maxTaxableIncome: number;
    maxRebateAmount: number;
    hasMarginalRelief: boolean;
  };
  cessRate: number; // 4% Health and Education Cess
}

export const TAX_CONFIG: {
  lastVerified: string;
  newRegime: TaxRegimeConfig;
  oldRegime: TaxRegimeConfig;
} = {
  lastVerified: '2026-10', // Verify against official sources each financial year

  // New Tax Regime (Section 115BAC) default for FY 2026-27
  newRegime: {
    name: 'New Tax Regime',
    financialYear: '2026-27',
    standardDeduction: 75000, // Standard deduction for salaried individuals
    slabs: [
      { min: 0, max: 400000, rate: 0.0 }, // 0 - 4L: Nil
      { min: 400000, max: 800000, rate: 0.05 }, // 4L - 8L: 5%
      { min: 800000, max: 1200000, rate: 0.1 }, // 8L - 12L: 10%
      { min: 1200000, max: 1600000, rate: 0.15 }, // 12L - 16L: 15%
      { min: 1600000, max: 2000000, rate: 0.2 }, // 16L - 20L: 20%
      { min: 2000000, max: 2400000, rate: 0.25 }, // 20L - 24L: 25%
      { min: 2400000, max: null, rate: 0.3 }, // Above 24L: 30%
    ],
    rebate87A: {
      maxTaxableIncome: 1200000, // Tax is nil if taxable income <= 12,00,000
      maxRebateAmount: 60000, // Full tax on 12L (20k + 40k) is rebated
      hasMarginalRelief: true, // Tax cannot exceed income over 12,00,000
    },
    cessRate: 0.04,
  },

  // Old Tax Regime (Optional with 80C/80D/HRA deductions)
  oldRegime: {
    name: 'Old Tax Regime',
    financialYear: '2026-27',
    standardDeduction: 50000,
    slabs: [
      { min: 0, max: 250000, rate: 0.0 }, // 0 - 2.5L: Nil
      { min: 250000, max: 500000, rate: 0.05 }, // 2.5L - 5L: 5%
      { min: 500000, max: 1000000, rate: 0.2 }, // 5L - 10L: 20%
      { min: 1000000, max: null, rate: 0.3 }, // Above 10L: 30%
    ],
    rebate87A: {
      maxTaxableIncome: 500000, // Nil tax if taxable income <= 5,00,000
      maxRebateAmount: 12500,
      hasMarginalRelief: false,
    },
    cessRate: 0.04,
  },
};
