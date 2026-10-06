// ============================================================
// Academic Calendar & Graduation Year Engine — Date-Driven Math
// Strictly models Indian academic year cycles (July to June),
// program durations, and dynamic year-of-study computation.
// ============================================================

export type DegreeType =
  | 'B.Tech'
  | 'B.E'
  | 'BCA'
  | 'B.Sc'
  | 'BBA'
  | 'Dual Degree'
  | 'Integrated M.Tech'
  | 'B.Arch'
  | 'M.Tech'
  | 'MCA'
  | 'MBA'
  | 'M.Sc'
  | 'Other';

export interface GraduationYearOption {
  gradYear: number;
  yearOfStudy: number;
  label: string;
  shortLabel: string;
  status: 'graduated' | 'final' | 'enrolled' | 'incoming';
  isEligibleForCampus: boolean;
}

/**
 * Returns program duration in years by degree type.
 */
export function getProgramLength(degree: string): number {
  const norm = degree.trim().toLowerCase();

  // 5-Year Programs
  if (
    norm.includes('dual') ||
    norm.includes('integrated') ||
    norm.includes('b.arch') ||
    norm.includes('architecture') ||
    norm.includes('5-year')
  ) {
    return 5;
  }

  // 2-Year Programs (Postgraduate)
  if (
    norm.includes('m.tech') ||
    norm.includes('mca') ||
    norm.includes('mba') ||
    norm.includes('m.sc') ||
    norm.includes('master') ||
    norm.includes('pg')
  ) {
    return 2;
  }

  // 3-Year Programs (BCA, B.Sc, BBA)
  if (
    norm.includes('bca') ||
    norm.includes('b.sc') ||
    norm.includes('bba') ||
    norm.includes('3-year')
  ) {
    return 3;
  }

  // Default: 4-Year B.Tech / B.E
  return 4;
}

/**
 * Parses reference date, supporting dev-only `?today=YYYY-MM-DD` query override.
 */
export function getReferenceDate(override?: Date | string): Date {
  if (override instanceof Date) return override;
  if (typeof override === 'string' && override.trim().length > 0) {
    const parsed = new Date(override);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Check dev-only query param in browser environments
  if (typeof window !== 'undefined' && window.location?.search) {
    const params = new URLSearchParams(window.location.search);
    const todayParam = params.get('today');
    if (todayParam) {
      const parsed = new Date(todayParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  return new Date();
}

/**
 * Computes Academic Year start year S.
 * Academic year starts in July (month index 6 in JS 0-indexed Date).
 * S = (month >= July) ? currentYear : currentYear - 1
 */
export function getAcademicYearStart(date: Date = getReferenceDate()): number {
  const currentYear = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 6 = July, 11 = Dec
  return month >= 6 ? currentYear : currentYear - 1;
}

export interface YearOfStudyResult {
  yearOfStudy: number;
  label: string;
  status: 'graduated' | 'final' | 'enrolled' | 'incoming';
  programLength: number;
  academicYearStart: number;
}

/**
 * Computes the year of study based on graduation year, program duration, and date.
 * Formula: yearOfStudy = programLength - (gradYear - (S + 1))
 */
export function calculateYearOfStudy(
  gradYear: number,
  degree: string,
  referenceDate?: Date | string
): YearOfStudyResult {
  const refDate = getReferenceDate(referenceDate);
  const S = getAcademicYearStart(refDate);
  const programLength = getProgramLength(degree);

  const yearOfStudy = programLength - (gradYear - (S + 1));

  let label: string;
  let status: 'graduated' | 'final' | 'enrolled' | 'incoming';

  if (yearOfStudy < 1) {
    label = 'Incoming / Pre-college';
    status = 'incoming';
  } else if (yearOfStudy > programLength) {
    label = 'Graduated';
    status = 'graduated';
  } else if (yearOfStudy === programLength) {
    label = 'Final Year';
    status = 'final';
  } else {
    const suffix =
      yearOfStudy === 1
        ? '1st Year'
        : yearOfStudy === 2
        ? '2nd Year'
        : yearOfStudy === 3
        ? '3rd Year'
        : `${yearOfStudy}th Year`;
    label = suffix;
    status = 'enrolled';
  }

  return {
    yearOfStudy,
    label,
    status,
    programLength,
    academicYearStart: S,
  };
}

/**
 * Dynamically generates valid graduation year options for a degree.
 */
export function getGraduationYearOptions(
  degree: string,
  referenceDate?: Date | string
): GraduationYearOption[] {
  const refDate = getReferenceDate(referenceDate);
  const S = getAcademicYearStart(refDate);
  const programLength = getProgramLength(degree);

  // Generate options from 1 year past graduation down to incoming year
  // e.g. for B.Tech in Oct 2026 (S = 2026):
  // 2026 (Graduated)
  // 2027 (4th Year / Final Year)
  // 2028 (3rd Year)
  // 2029 (2nd Year)
  // 2030 (1st Year)
  // 2031 (Incoming)
  const options: GraduationYearOption[] = [];
  const minGradYear = S; // Already graduated
  const maxGradYear = S + programLength + 1; // Incoming

  for (let year = minGradYear; year <= maxGradYear; year++) {
    const result = calculateYearOfStudy(year, degree, refDate);
    const isFinal = result.yearOfStudy === programLength;
    const isGrad = result.status === 'graduated';
    const isInc = result.status === 'incoming';

    let displayLabel: string;
    if (isGrad) {
      displayLabel = `${year} (Graduated)`;
    } else if (isFinal) {
      displayLabel = `${year} (${programLength}th Year - Final Year)`;
    } else if (isInc) {
      displayLabel = `${year} (Incoming / Pre-college)`;
    } else {
      displayLabel = `${year} (${result.label})`;
    }

    options.push({
      gradYear: year,
      yearOfStudy: result.yearOfStudy,
      label: displayLabel,
      shortLabel: result.label,
      status: result.status,
      isEligibleForCampus: result.status === 'enrolled' || result.status === 'final',
    });
  }

  return options;
}

/**
 * Snaps an invalid or out-of-range graduation year to the nearest valid option when degree changes.
 */
export function snapToNearestGradYear(
  currentGradYear: number,
  degree: string,
  referenceDate?: Date | string
): number {
  const options = getGraduationYearOptions(degree, referenceDate);
  if (options.length === 0) return currentGradYear;

  // Exact match
  const exact = options.find((o) => o.gradYear === currentGradYear);
  if (exact) return currentGradYear;

  // Find nearest by absolute difference
  let nearest = options[0];
  let minDiff = Math.abs(currentGradYear - nearest.gradYear);

  for (const opt of options) {
    const diff = Math.abs(currentGradYear - opt.gradYear);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = opt;
    }
  }

  return nearest.gradYear;
}
