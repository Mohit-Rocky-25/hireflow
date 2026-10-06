// ============================================================
// Degree & Branch Catalog with Branch Families — India Higher Education
// Comprehensive catalog supporting 30+ engineering and technology disciplines
// Organized into degree groups and mapped to branch families for tailored roadmaps
// ============================================================

export type BranchFamily =
  | 'software'
  | 'data-ai'
  | 'electronics-embedded'
  | 'core-mechanical'
  | 'core-civil'
  | 'chemical-bio'
  | 'management';

export interface DegreeBranchOption {
  id: string;
  degreeGroup: 'B.Tech / B.E' | 'Integrated / Dual Degree' | 'UG Others' | 'PG (Postgraduate)';
  degreeName: string;
  branchName: string;
  family: BranchFamily;
  familyLabel: string;
  programLength: number;
  label: string;
}

export const BRANCH_FAMILY_LABELS: Record<BranchFamily, string> = {
  software: 'Software & Core CS',
  'data-ai': 'Data Science & AI/ML',
  'electronics-embedded': 'Electronics & Embedded Hardware',
  'core-mechanical': 'Mechanical, Automotive & Robotics',
  'core-civil': 'Civil & Infrastructure Engineering',
  'chemical-bio': 'Chemical, Biotech & Agro Engineering',
  management: 'Tech Management & Business Analytics',
};

export const DEGREE_BRANCH_CATALOG: DegreeBranchOption[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. B.Tech / B.E (4-Year Programs)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'btech-cse',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Computer Science & Engineering (CSE)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 4,
    label: 'B.Tech / B.E — Computer Science & Engineering (CSE)',
  },
  {
    id: 'btech-it',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Information Technology (IT)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 4,
    label: 'B.Tech / B.E — Information Technology (IT)',
  },
  {
    id: 'btech-aiml',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Artificial Intelligence & Machine Learning (AI & ML)',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 4,
    label: 'B.Tech / B.E — AI & ML',
  },
  {
    id: 'btech-aids',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'AI & Data Science',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 4,
    label: 'B.Tech / B.E — AI & Data Science',
  },
  {
    id: 'btech-ds',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Data Science',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 4,
    label: 'B.Tech / B.E — Data Science',
  },
  {
    id: 'btech-cyber',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'CSE (Cyber Security)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 4,
    label: 'B.Tech / B.E — CSE (Cyber Security)',
  },
  {
    id: 'btech-iot',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'CSE (Internet of Things - IoT)',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — CSE (IoT)',
  },
  {
    id: 'btech-blockchain',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'CSE (Blockchain Technology)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 4,
    label: 'B.Tech / B.E — CSE (Blockchain)',
  },
  {
    id: 'btech-mnc',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Mathematics & Computing (MnC)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 4,
    label: 'B.Tech / B.E — Mathematics & Computing',
  },
  {
    id: 'btech-ece',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Electronics & Communication Engineering (ECE)',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Electronics & Communication (ECE)',
  },
  {
    id: 'btech-eee',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Electrical & Electronics Engineering (EEE)',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Electrical & Electronics (EEE)',
  },
  {
    id: 'btech-ee',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Electrical Engineering',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Electrical Engineering',
  },
  {
    id: 'btech-ei',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Electronics & Instrumentation Engineering',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Electronics & Instrumentation',
  },
  {
    id: 'btech-ic',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Instrumentation & Control Engineering',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Instrumentation & Control',
  },
  {
    id: 'btech-mech',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Mechanical Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Mechanical Engineering',
  },
  {
    id: 'btech-mechatronics',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Mechatronics Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Mechatronics Engineering',
  },
  {
    id: 'btech-robotics',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Robotics & Automation',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Robotics & Automation',
  },
  {
    id: 'btech-auto',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Automobile Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Automobile Engineering',
  },
  {
    id: 'btech-aero',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Aerospace & Aeronautical Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Aerospace Engineering',
  },
  {
    id: 'btech-civil',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Civil Engineering',
    family: 'core-civil',
    familyLabel: BRANCH_FAMILY_LABELS['core-civil'],
    programLength: 4,
    label: 'B.Tech / B.E — Civil Engineering',
  },
  {
    id: 'btech-chem',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Chemical Engineering',
    family: 'chemical-bio',
    familyLabel: BRANCH_FAMILY_LABELS['chemical-bio'],
    programLength: 4,
    label: 'B.Tech / B.E — Chemical Engineering',
  },
  {
    id: 'btech-biotech',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Biotechnology & Biochemical Engineering',
    family: 'chemical-bio',
    familyLabel: BRANCH_FAMILY_LABELS['chemical-bio'],
    programLength: 4,
    label: 'B.Tech / B.E — Biotechnology',
  },
  {
    id: 'btech-production',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Production & Industrial Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Production & Industrial',
  },
  {
    id: 'btech-metallurgy',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Metallurgy & Materials Engineering',
    family: 'core-mechanical',
    familyLabel: BRANCH_FAMILY_LABELS['core-mechanical'],
    programLength: 4,
    label: 'B.Tech / B.E — Metallurgy & Materials',
  },
  {
    id: 'btech-mining',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Mining Engineering',
    family: 'core-civil',
    familyLabel: BRANCH_FAMILY_LABELS['core-civil'],
    programLength: 4,
    label: 'B.Tech / B.E — Mining Engineering',
  },
  {
    id: 'btech-agri',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Agricultural Engineering',
    family: 'chemical-bio',
    familyLabel: BRANCH_FAMILY_LABELS['chemical-bio'],
    programLength: 4,
    label: 'B.Tech / B.E — Agricultural Engineering',
  },
  {
    id: 'btech-ep',
    degreeGroup: 'B.Tech / B.E',
    degreeName: 'B.Tech / B.E',
    branchName: 'Engineering Physics',
    family: 'electronics-embedded',
    familyLabel: BRANCH_FAMILY_LABELS['electronics-embedded'],
    programLength: 4,
    label: 'B.Tech / B.E — Engineering Physics',
  },

  // ─────────────────────────────────────────────────────────────
  // 2. Integrated / Dual Degree (5-Year Programs)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'dual-btech-mtech',
    degreeGroup: 'Integrated / Dual Degree',
    degreeName: 'B.Tech + M.Tech Dual Degree',
    branchName: 'B.Tech + M.Tech Dual Degree (Computer Science / Engineering)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 5,
    label: 'Dual Degree — B.Tech + M.Tech Dual Degree',
  },
  {
    id: 'integrated-mtech',
    degreeGroup: 'Integrated / Dual Degree',
    degreeName: 'Integrated M.Tech',
    branchName: 'Integrated M.Tech (5-Year Integrated Program)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 5,
    label: 'Integrated — Integrated M.Tech (5-Year)',
  },

  // ─────────────────────────────────────────────────────────────
  // 3. UG Others (3-Year Programs)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ug-bca',
    degreeGroup: 'UG Others',
    degreeName: 'BCA',
    branchName: 'Bachelor of Computer Applications (BCA)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 3,
    label: 'BCA — Bachelor of Computer Applications',
  },
  {
    id: 'ug-bsc-cs',
    degreeGroup: 'UG Others',
    degreeName: 'B.Sc',
    branchName: 'B.Sc (Computer Science / IT / Data Science)',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 3,
    label: 'B.Sc — Computer Science / IT / Data Science',
  },
  {
    id: 'ug-bba-analytics',
    degreeGroup: 'UG Others',
    degreeName: 'BBA',
    branchName: 'BBA (Business Analytics / Information Systems)',
    family: 'management',
    familyLabel: BRANCH_FAMILY_LABELS['management'],
    programLength: 3,
    label: 'BBA — Business Analytics / Management',
  },

  // ─────────────────────────────────────────────────────────────
  // 4. PG (Postgraduate) (2-Year Programs)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'pg-mtech-cs',
    degreeGroup: 'PG (Postgraduate)',
    degreeName: 'M.Tech',
    branchName: 'M.Tech (CSE / AI / VLSI / Data Science)',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 2,
    label: 'M.Tech — CSE / AI / VLSI / Data Science',
  },
  {
    id: 'pg-mca',
    degreeGroup: 'PG (Postgraduate)',
    degreeName: 'MCA',
    branchName: 'Master of Computer Applications (MCA)',
    family: 'software',
    familyLabel: BRANCH_FAMILY_LABELS['software'],
    programLength: 2,
    label: 'MCA — Master of Computer Applications',
  },
  {
    id: 'pg-msc-cs',
    degreeGroup: 'PG (Postgraduate)',
    degreeName: 'M.Sc',
    branchName: 'M.Sc (Computer Science / Data Science)',
    family: 'data-ai',
    familyLabel: BRANCH_FAMILY_LABELS['data-ai'],
    programLength: 2,
    label: 'M.Sc — Computer Science / Data Science',
  },
  {
    id: 'pg-mba-tech',
    degreeGroup: 'PG (Postgraduate)',
    degreeName: 'MBA',
    branchName: 'MBA (Tech Management / Business Analytics)',
    family: 'management',
    familyLabel: BRANCH_FAMILY_LABELS['management'],
    programLength: 2,
    label: 'MBA — Tech Management / Business Analytics',
  },
];

/**
 * Detects the nearest branch family from custom user input.
 */
export function detectBranchFamily(input: string): BranchFamily {
  const norm = input.trim().toLowerCase();

  // Mechanical / Automobile / Robotics
  if (
    norm.includes('mech') ||
    norm.includes('auto') ||
    norm.includes('robot') ||
    norm.includes('aero') ||
    norm.includes('manufacturing') ||
    norm.includes('production') ||
    norm.includes('metallurg') ||
    norm.includes('thermal') ||
    norm.includes('cad') ||
    norm.includes('cae')
  ) {
    return 'core-mechanical';
  }

  // Civil & Infrastructure
  if (
    norm.includes('civil') ||
    norm.includes('struct') ||
    norm.includes('construct') ||
    norm.includes('mining') ||
    norm.includes('geotech') ||
    norm.includes('survey')
  ) {
    return 'core-civil';
  }

  // Chemical, Biotech & Agriculture
  if (
    norm.includes('chem') ||
    norm.includes('bio') ||
    norm.includes('agri') ||
    norm.includes('food') ||
    norm.includes('pharm') ||
    norm.includes('environmental')
  ) {
    return 'chemical-bio';
  }

  // Electronics & Embedded
  if (
    norm.includes('electr') ||
    norm.includes('ece') ||
    norm.includes('eee') ||
    norm.includes('vlsi') ||
    norm.includes('embedded') ||
    norm.includes('iot') ||
    norm.includes('sensor') ||
    norm.includes('instrument') ||
    norm.includes('telecom')
  ) {
    return 'electronics-embedded';
  }

  // Data & AI
  if (
    norm.includes('data') ||
    norm.includes('ai') ||
    norm.includes('ml') ||
    norm.includes('machine learning') ||
    norm.includes('artificial') ||
    norm.includes('stat') ||
    norm.includes('analytics')
  ) {
    return 'data-ai';
  }

  // Management & Business
  if (
    norm.includes('mba') ||
    norm.includes('bba') ||
    norm.includes('manage') ||
    norm.includes('business') ||
    norm.includes('finance') ||
    norm.includes('market') ||
    norm.includes('product')
  ) {
    return 'management';
  }

  // Default to Software
  return 'software';
}

/**
 * Returns grouped list of degrees and branches for combobox display.
 */
export function getGroupedDegreeOptions(): Record<string, DegreeBranchOption[]> {
  const groups: Record<string, DegreeBranchOption[]> = {
    'B.Tech / B.E': [],
    'Integrated / Dual Degree': [],
    'UG Others': [],
    'PG (Postgraduate)': [],
  };

  DEGREE_BRANCH_CATALOG.forEach((item) => {
    if (groups[item.degreeGroup]) {
      groups[item.degreeGroup].push(item);
    }
  });

  return groups;
}

/**
 * Resolves a degree/branch option by id or returns custom option for custom input.
 */
export function resolveDegreeBranchOption(value: string): DegreeBranchOption {
  const found = DEGREE_BRANCH_CATALOG.find((o) => o.id === value || o.label === value || o.branchName === value);
  if (found) return found;

  // Custom user input
  const family = detectBranchFamily(value);
  const isPg = value.toLowerCase().includes('m.tech') || value.toLowerCase().includes('mca') || value.toLowerCase().includes('mba') || value.toLowerCase().includes('m.sc');
  const isDual = value.toLowerCase().includes('dual') || value.toLowerCase().includes('integrated') || value.toLowerCase().includes('arch');
  const isUg3 = value.toLowerCase().includes('bca') || value.toLowerCase().includes('b.sc') || value.toLowerCase().includes('bba');
  const programLength = isDual ? 5 : isPg ? 2 : isUg3 ? 3 : 4;

  return {
    id: 'custom-other',
    degreeGroup: isDual ? 'Integrated / Dual Degree' : isPg ? 'PG (Postgraduate)' : isUg3 ? 'UG Others' : 'B.Tech / B.E',
    degreeName: value,
    branchName: value,
    family,
    familyLabel: BRANCH_FAMILY_LABELS[family],
    programLength,
    label: value,
  };
}
