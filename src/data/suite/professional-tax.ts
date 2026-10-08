// ============================================================
// State-Wise Professional Tax Table (Stage 6.1)
// Note: Professional tax varies by state slab; adjust if yours differs.
// ============================================================

export interface StateProfessionalTax {
  stateCode: string;
  stateName: string;
  annualAmount: number; // typical annual deduction for tech salaries (> 15k-20k/mo)
  monthlyAmount: number;
  approx: boolean;
  notes: string;
}

export const PROFESSIONAL_TAX_RATES: Record<string, StateProfessionalTax> = {
  KA: {
    stateCode: 'KA',
    stateName: 'Karnataka',
    annualAmount: 2400, // Rs 200/month
    monthlyAmount: 200,
    approx: true,
    notes: 'Rs 200/mo for gross salary >= Rs 15,000.',
  },
  MH: {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    annualAmount: 2500, // Rs 200/mo, Rs 300 in Feb
    monthlyAmount: 208,
    approx: true,
    notes: 'Rs 200/mo for 11 months, Rs 300 in February.',
  },
  TS: {
    stateCode: 'TS',
    stateName: 'Telangana',
    annualAmount: 2400,
    monthlyAmount: 200,
    approx: true,
    notes: 'Rs 200/mo for gross salary >= Rs 20,000.',
  },
  AP: {
    stateCode: 'AP',
    stateName: 'Andhra Pradesh',
    annualAmount: 2400,
    monthlyAmount: 200,
    approx: true,
    notes: 'Rs 200/mo for gross salary >= Rs 20,000.',
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    annualAmount: 2500,
    monthlyAmount: 208,
    approx: true,
    notes: 'Deducted half-yearly up to Rs 1,250 every 6 months.',
  },
  WB: {
    stateCode: 'WB',
    stateName: 'West Bengal',
    annualAmount: 2400,
    monthlyAmount: 200,
    approx: true,
    notes: 'Rs 200/mo for gross salary >= Rs 40,000.',
  },
  GJ: {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    annualAmount: 2400,
    monthlyAmount: 200,
    approx: true,
    notes: 'Rs 200/mo for gross salary >= Rs 12,000.',
  },
  KL: {
    stateCode: 'KL',
    stateName: 'Kerala',
    annualAmount: 2500,
    monthlyAmount: 208,
    approx: true,
    notes: 'Deducted half-yearly up to Rs 1,250 every 6 months.',
  },
  DL: {
    stateCode: 'DL',
    stateName: 'Delhi (NCR)',
    annualAmount: 0,
    monthlyAmount: 0,
    approx: false,
    notes: 'No professional tax levied in Delhi union territory.',
  },
  OTHER: {
    stateCode: 'OTHER',
    stateName: 'Other / Default',
    annualAmount: 2400,
    monthlyAmount: 200,
    approx: true,
    notes: 'Default national cap estimate (max legal PT is Rs 2,500/year).',
  },
};

export function getProfessionalTax(stateCodeOrName: string): StateProfessionalTax {
  const norm = (stateCodeOrName || '').trim().toUpperCase();
  if (PROFESSIONAL_TAX_RATES[norm]) return PROFESSIONAL_TAX_RATES[norm];

  const found = Object.values(PROFESSIONAL_TAX_RATES).find(
    (s) => s.stateName.toUpperCase().includes(norm) || norm.includes(s.stateCode)
  );
  return found || PROFESSIONAL_TAX_RATES.OTHER;
}
