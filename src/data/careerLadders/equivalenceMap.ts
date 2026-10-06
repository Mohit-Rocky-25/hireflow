// ============================================================
// Career Equivalence Mapping
// Industry-standard level parity index between tech companies
// ============================================================

export interface EquivalenceGroupDef {
  key: string;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  terminalExpectation: string;
  typicalYoeRange: string;
}

export const EQUIVALENCE_GROUPS: Record<string, EquivalenceGroupDef> = {
  L3_ENTRY: {
    key: 'L3_ENTRY',
    order: 0,
    label: 'Entry Level / Associate',
    shortLabel: 'Entry (L3)',
    description: 'New graduates and early-career engineers. Focused on execution of bounded tasks with guidance.',
    terminalExpectation: 'Up-or-out expected at most Big Tech within 24-36 months.',
    typicalYoeRange: '0-2 years',
  },
  L4_MID: {
    key: 'L4_MID',
    order: 1,
    label: 'Mid-Level Software Engineer',
    shortLabel: 'Mid (L4)',
    description: 'Fully autonomous individual contributor. Owns end-to-end features, unblocks self, designs sub-systems.',
    terminalExpectation: 'Many companies require promotion to Senior (L5) within 3-5 years (semi-terminal).',
    typicalYoeRange: '2-5 years',
  },
  L5_SENIOR: {
    key: 'L5_SENIOR',
    order: 2,
    label: 'Senior Software Engineer',
    shortLabel: 'Senior (L5)',
    description: 'Career-terminal level for ~70% of engineers. Owns complex system architecture, sets standards, mentors juniors.',
    terminalExpectation: 'Fully terminal level. Engineers can stay here indefinitely with strong performance.',
    typicalYoeRange: '5-8+ years',
  },
  L6_STAFF: {
    key: 'L6_STAFF',
    order: 3,
    label: 'Staff Engineer / Tech Lead',
    shortLabel: 'Staff (L6)',
    description: 'Multi-team and org-wide technical leadership. Defines multi-quarter roadmaps, solves ambiguous cross-cutting problems.',
    terminalExpectation: 'Requires demonstrated business-critical scope. High stall rate (~80% fail to advance further).',
    typicalYoeRange: '8-12+ years',
  },
  L7_PRINCIPAL: {
    key: 'L7_PRINCIPAL',
    order: 4,
    label: 'Principal / Senior Staff Engineer',
    shortLabel: 'Principal (L7)',
    description: 'Company-wide or business-unit technical authority. Steers technology strategy, interfaces with VP/C-suite.',
    terminalExpectation: 'Fewer than 3-5% of company engineers reach this level.',
    typicalYoeRange: '12-16+ years',
  },
  L8_DISTINGUISHED: {
    key: 'L8_DISTINGUISHED',
    order: 5,
    label: 'Distinguished Engineer / Fellow',
    shortLabel: 'Distinguished (L8)',
    description: 'Industry-level technical luminary. Influences industry standards, patents, core company platform foundations.',
    terminalExpectation: 'Appointed by executive committee. < 0.5% of engineering population.',
    typicalYoeRange: '16+ years',
  },
  // Management Track Equivalences
  M1_MANAGER: {
    key: 'M1_MANAGER',
    order: 2, // Equivalent scope to L5/L6 SWE
    label: 'Engineering Manager',
    shortLabel: 'EM (M1)',
    description: 'Direct people manager for 6-12 engineers. Responsible for delivery, career growth, team health, and execution.',
    terminalExpectation: 'Can be terminal at mid-size companies, progression requires scaling team or multiple pods.',
    typicalYoeRange: '6-10 years',
  },
  M2_SENIOR_MANAGER: {
    key: 'M2_SENIOR_MANAGER',
    order: 3, // Equivalent scope to L6/L7 SWE
    label: 'Senior Engineering Manager',
    shortLabel: 'Sr EM (M2)',
    description: 'Second-line manager (manages managers or large org of 20-40 engineers). Strategic roadmap and talent calibration.',
    terminalExpectation: 'High bar, requires managing complex cross-functional group.',
    typicalYoeRange: '10-14 years',
  },
  M3_DIRECTOR: {
    key: 'M3_DIRECTOR',
    order: 4, // Equivalent scope to L7/L8 SWE
    label: 'Director of Engineering',
    shortLabel: 'Director (M3)',
    description: 'Executive leader of an entire engineering pillar (50-150+ engineers). Accountable for organizational P&L/business outcomes.',
    terminalExpectation: 'Executive band.',
    typicalYoeRange: '14+ years',
  },
};

export function getEquivalenceOrder(groupKey: string): number {
  return EQUIVALENCE_GROUPS[groupKey]?.order ?? 0;
}
