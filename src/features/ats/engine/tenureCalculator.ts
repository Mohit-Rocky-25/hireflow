// ============================================================
// ATS Resume Roaster — Calibrated Tenure Calculator (Phase 07.2)
// Calculates exact calendar-month intervals, interval union for overlaps,
// context-aware tenure categories, min-max date uncertainty,
// safe combination of explicit durations, and bounded, non-inflated
// competency-specific tenure with evidence-duration decoupling.
// ============================================================

import { EmploymentType, ProfessionalClassification } from './evidenceModel';
import { resolveCompetency } from '../knowledge/ontology';
import { SKILL_BY_ID } from '../knowledge/taxonomy';

export interface CalendarMonthInterval {
  startMonthIndex: number; // year * 12 + month (0-11)
  endMonthIndex: number;   // inclusive
  minStartMonthIndex?: number;
  minEndMonthIndex?: number;
  isCurrent?: boolean;
  ongoingActiveMonthIncluded?: boolean;
  completedMonths?: number;
  isYearOnly?: boolean;
  minPossibleMonths: number;
  maxPossibleMonths: number;
  uncertaintyMonths: number;
  type: EmploymentType | 'PROJECT';
  arrangement?: EmploymentType | 'PROJECT';
  professionalClassification?: ProfessionalClassification;
  employerOrProject: string;
  roleTitle?: string;
  competencyIds?: string[];
}

export interface DetailedIntervalRecord {
  employer: string;
  title: string;
  type: string;
  arrangement: string;
  professionalClassification: ProfessionalClassification;
  start: string;
  end: string;
  months: number;
  completedMonths: number;
  ongoingActiveMonthIncluded: boolean;
  minPossibleMonths: number;
  maxPossibleMonths: number;
  isCurrent: boolean;
  isYearOnly?: boolean;
  uncertaintyMonths: number;
}

export interface TenureBreakdown {
  totalProfessionalMonths: number;
  totalProfessionalYears: number;
  totalCompletedProfessionalMonths: number;
  totalCompletedProfessionalYears: number;
  internshipMonths: number;
  internshipYears: number;
  contractMonths: number;
  contractYears: number;
  partTimeMonths: number;
  partTimeYears: number;
  projectMonths: number;
  projectYears: number;
  totalWorkMonths: number;
  totalWorkYears: number;
  totalCompletedWorkMonths: number;
  totalCompletedWorkYears: number;
  hasOngoingActiveMonth: boolean;
  minPossibleWorkMonths: number;
  maxPossibleWorkMonths: number;
  minPossibleCompletedWorkMonths: number;
  maxPossibleCompletedWorkMonths: number;
  minPossibleProfessionalMonths: number;
  maxPossibleProfessionalMonths: number;
  minPossibleCompletedProfessionalMonths: number;
  maxPossibleCompletedProfessionalMonths: number;
  hasProfessionalYearOnlyIntervals: boolean;
  hasYearOnlyIntervals: boolean;
  maxUncertaintyMonths: number;
  intervals: DetailedIntervalRecord[];
  gaps: Array<{ startMonthIndex: number; endMonthIndex: number; gapMonths: number; formatted: string }>;
}

export interface TenureCalculationOptions {
  asOfDate?: Date;
  strictProductionOnly?: boolean;
  professionalOnly?: boolean;
  userRequiredYears?: number;
  userExperienceOverrideYears?: number;
}

export type CompetencyTenureAssessment =
  | 'EXPLICITLY_PROVEN'
  | 'ROLE_BOUNDED_UNCERTAIN'
  | 'UNKNOWN_DURATION'
  | 'NOT_DEMONSTRATED';

export type CompetencyDurationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type CompetencyDurationPlacement =
  | 'KNOWN_CALENDAR_INTERVAL'
  | 'EXPLICIT_KNOWN_PLACEMENT'
  | 'EXPLICIT_UNKNOWN_PLACEMENT'
  | 'ROLE_BOUNDED_UNCERTAIN'
  | 'NO_MEASURABLE_DURATION';

export interface CompetencyTenureResult {
  competencyId: string;
  durationStatus: CompetencyTenureAssessment;
  durationConfidence: CompetencyDurationConfidence;
  placementKind?: CompetencyDurationPlacement;
  evidenceOccurrenceCount: number;
  employmentMonths: number;
  explicitUsageMonths?: number;
  provenCompetencyMonths?: number;
  minPossibleMonths?: number;
  maxPossibleMonths: number;
  usageInterval?: { start: string; end: string } | null;
  isCombinedPlacementAmbiguous?: boolean;
  minCombinedMonths?: number;
  maxCombinedMonths?: number;
  // Aliases and backward compatibility
  tenureAssessment: CompetencyTenureAssessment;
  provenMonths?: number;
  roleDurationMonths: number;
  minPossibleDurationMonths?: number;
  maxPossibleDurationMonths: number;
  isDurationUncertain: boolean;
  evidenceOccurrences: number;
  contributingRoles: string[];
  formattedDuration: string;
  explanation: string;
}

/**
 * Calculates mathematical midpoint between min and max bounds without artificial rounding.
 * Midpoints are strictly descriptive statistical summaries, NEVER used to decide pass/fail.
 */
export function calculateMidpoint(min: number, max: number): number {
  return (min + max) / 2;
}

export interface CompoundBranchEvaluation {
  competencyId: string;
  months: number;
  tenureAssessment: CompetencyTenureAssessment;
  roleDurationMonths: number;
  isDemonstrated: boolean;
  contributingRoles: string[];
}

export interface CompoundCompetencyTenureResult {
  type: 'OR' | 'AND';
  combinedMonths: number;
  combinedYears: number;
  formattedDuration: string;
  isConcurrent?: boolean;
  branchResults: CompoundBranchEvaluation[];
  explanation: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

// Default immutable anchor date for 100% deterministic testing if not specified
export const DEFAULT_ANCHOR_DATE = new Date(2026, 10, 24); // Nov 24, 2026

/**
 * Parses a month name or numeric string into a 0-indexed month number (0-11).
 */
export function parseMonthString(monthStr?: string): number | undefined {
  if (!monthStr) return undefined;
  const clean = monthStr.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (MONTH_MAP[clean] !== undefined) {
    return MONTH_MAP[clean];
  }
  const numeric = parseInt(clean, 10);
  if (!isNaN(numeric) && numeric >= 1 && numeric <= 12) {
    return numeric - 1;
  }
  return undefined;
}

/**
 * Converts a year and month to an absolute month index (year * 12 + month).
 */
export function toMonthIndex(year: number, month: number): number {
  return year * 12 + Math.max(0, Math.min(11, month));
}

/**
 * Converts an absolute month index back to year and month.
 */
export function fromMonthIndex(monthIndex: number): { year: number; month: number } {
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex % 12;
  return { year, month };
}

/**
 * Formats a month duration as a human-readable string without rounding.
 * e.g., 28 months -> "2 years, 4 months", 24 months -> "2 years", 7 months -> "7 months".
 */
export function formatMonthDuration(totalMonths: number): string {
  if (totalMonths <= 0) return '0 months';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
}

/**
 * Computes the union of a set of inclusive month intervals [start, end].
 * Overlapping intervals are merged to prevent double-counting.
 */
export function unionMonthIntervals(
  intervals: Array<{ start: number; end: number }>,
  mergeAdjacent = true
): Array<{ start: number; end: number }> {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = merged[merged.length - 1];

    const adjacentThreshold = mergeAdjacent ? 1 : 0;
    if (current.start <= prev.end + adjacentThreshold) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }

  return merged;
}

/**
 * Calculates the total number of unique calendar months covered by a set of intervals.
 */
export function calculateUniqueCoveredMonths(intervals: Array<{ start: number; end: number }>): number {
  const merged = unionMonthIntervals(intervals);
  return merged.reduce((acc, curr) => acc + (curr.end - curr.start + 1), 0);
}

const NON_PROFESSIONAL_ROLE_REGEX =
  /\b(?:intern|internship|co-op|coop|trainee|summer\s+associate|summer\s+analyst|apprentice|apprenticeship|volunteer|volunteering|pro\s+bono|student\s+assistant|teaching\s+assistant|graduate\s+assistant|graduate\s+teaching\s+assistant|lab\s+assistant|course\s+assistant|undergraduate\s+assistant|undergraduate\s+researcher|academic\s+project|coursework|capstone\s+project|class\s+project|university\s+project|personal\s+project|side\s+project|hobby\s+project|open[\s-]*source\s+(?:contributor|maintainer|project)|oss\s+contributor|independent\s+project)\b/i;

const ACADEMIC_OR_PROJECT_ROLE_REGEX =
  /\b(?:student\s+assistant|teaching\s+assistant|graduate\s+assistant|graduate\s+teaching\s+assistant|lab\s+assistant|course\s+assistant|undergraduate\s+assistant|undergraduate\s+researcher|academic\s+project|coursework|capstone\s+project|class\s+project|university\s+project|personal\s+project|side\s+project|hobby\s+project|open[\s-]*source\s+(?:contributor|maintainer|project)|oss\s+contributor|independent\s+project)\b/i;

const NON_PROFESSIONAL_SOURCE_TYPES = new Set([
  'INTERNSHIP',
  'ACADEMIC_PROJECT',
  'COURSEWORK',
  'PERSONAL_PROJECT',
  'OPEN_SOURCE',
  'OPEN_SOURCE_PROJECT',
  'HACKATHON',
  'HACKATHON_PROJECT',
  'RESEARCH_PROJECT',
  'VOLUNTEER',
]);

function resolveEmploymentClassification(
  entry: {
    employmentType?: EmploymentType | 'PROJECT';
    arrangement?: EmploymentType | 'PROJECT';
    professionalClassification?: ProfessionalClassification;
    sourceType?: string;
    projectOrigin?: string;
  },
  employerName: string,
  roleTitle: string
): { empType: EmploymentType | 'PROJECT'; profClassification: ProfessionalClassification } {
  const combinedTitle = `${roleTitle} ${employerName}`.trim();
  const explicitType =
    entry.employmentType && entry.employmentType !== 'UNKNOWN'
      ? entry.employmentType
      : entry.arrangement && entry.arrangement !== 'UNKNOWN'
        ? entry.arrangement
        : undefined;

  const sourceTypeUpper = (entry.sourceType || '').toUpperCase();
  const originUpper = (entry.projectOrigin || '').toUpperCase();

  let empType: EmploymentType | 'PROJECT' = explicitType || 'FULL_TIME';
  if (!explicitType) {
    if (
      sourceTypeUpper === 'INTERNSHIP' ||
      /\b(?:intern|internship|co-op|coop|trainee|summer\s+associate|summer\s+analyst)\b/i.test(combinedTitle)
    ) {
      empType = 'INTERNSHIP';
    } else if (/\b(?:apprentice|apprenticeship)\b/i.test(combinedTitle)) {
      empType = 'APPRENTICESHIP';
    } else if (sourceTypeUpper === 'VOLUNTEER' || /\b(?:volunteer|volunteering|pro\s+bono)\b/i.test(combinedTitle)) {
      empType = 'VOLUNTEER';
    } else if (
      NON_PROFESSIONAL_SOURCE_TYPES.has(sourceTypeUpper) ||
      NON_PROFESSIONAL_SOURCE_TYPES.has(originUpper) ||
      ACADEMIC_OR_PROJECT_ROLE_REGEX.test(combinedTitle)
    ) {
      empType = 'PROJECT';
    } else if (/\b(?:contract|contractor|consultant)\b/i.test(combinedTitle)) {
      empType = 'CONTRACT';
    } else if (/\b(?:freelance|independent\s+contractor)\b/i.test(combinedTitle)) {
      empType = 'FREELANCE';
    } else if (/\b(?:part[\s-]*time)\b/i.test(combinedTitle)) {
      empType = 'PART_TIME';
    } else if (/\b(?:temporary|temp)\b/i.test(combinedTitle)) {
      empType = 'TEMPORARY';
    }
  } else if (
    empType === 'FULL_TIME' &&
    entry.professionalClassification !== 'PROFESSIONAL' &&
    ACADEMIC_OR_PROJECT_ROLE_REGEX.test(combinedTitle)
  ) {
    // Guard against upstream parsers defaulting student/academic/OSS roles to FULL_TIME
    empType = 'PROJECT';
  }

  let profClassification: ProfessionalClassification = 'PROFESSIONAL';
  if (entry.professionalClassification === 'NON_PROFESSIONAL' || entry.professionalClassification === 'AMBIGUOUS') {
    profClassification = entry.professionalClassification;
  } else if (
    empType === 'INTERNSHIP' ||
    empType === 'APPRENTICESHIP' ||
    empType === 'VOLUNTEER' ||
    empType === 'PROJECT' ||
    NON_PROFESSIONAL_SOURCE_TYPES.has(sourceTypeUpper) ||
    NON_PROFESSIONAL_SOURCE_TYPES.has(originUpper) ||
    (entry.professionalClassification !== 'PROFESSIONAL' && NON_PROFESSIONAL_ROLE_REGEX.test(combinedTitle))
  ) {
    profClassification = 'NON_PROFESSIONAL';
  } else if (entry.professionalClassification) {
    profClassification = entry.professionalClassification;
  }

  return { empType, profClassification };
}

/**
 * Determines whether an employment entry reflects verified production maturity.
 */
export function isProductionRole(emp: {
  environmentMaturity?: string;
  evidenceRecords?: Array<{ environmentMaturity?: string; isNegated?: boolean }>;
  bullets?: Array<{ rawText: string; isNegated?: boolean }>;
}): boolean {
  if (emp.environmentMaturity === 'PRODUCTION') {
    return true;
  }
  const hasExplicitNonProdEnv =
    emp.environmentMaturity !== undefined &&
    emp.environmentMaturity !== 'UNKNOWN' &&
    emp.environmentMaturity !== 'PRODUCTION';

  if (
    emp.evidenceRecords &&
    emp.evidenceRecords.some(e => e.environmentMaturity === 'PRODUCTION' && !e.isNegated)
  ) {
    return true;
  }

  if (
    !hasExplicitNonProdEnv &&
    emp.bullets &&
    emp.bullets.some(b => !b.isNegated && /\bproduction\b/i.test(b.rawText))
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts a calendar interval from raw date text or structured year/month components,
 * computing strict min and max duration bounds based on date precision.
 */
export function extractIntervalFromEntry(
  entry: {
    employerName?: string;
    company?: string;
    jobTitle?: string;
    title?: string;
    originalDateText?: string;
    dateRangeStr?: string;
    startYear?: number;
    startMonth?: string;
    endYear?: number;
    endMonth?: string;
    isCurrent?: boolean;
    employmentType?: EmploymentType | 'PROJECT';
    arrangement?: EmploymentType | 'PROJECT';
    professionalClassification?: ProfessionalClassification;
    sourceType?: string;
    projectOrigin?: string;
  },
  asOfDate: Date = DEFAULT_ANCHOR_DATE
): CalendarMonthInterval | null {
  const asOfYear = asOfDate.getFullYear();
  const asOfMonth = asOfDate.getMonth();
  const asOfMonthIdx = toMonthIndex(asOfYear, asOfMonth);

  const rawDate = entry.originalDateText || entry.dateRangeStr || '';
  const isCurrent = Boolean(
    entry.isCurrent ||
    /present|current|now|ongoing/i.test(rawDate)
  );

  let startYear = entry.startYear;
  let endYear = entry.endYear;
  let startMonthStr = entry.startMonth;
  let endMonthStr = entry.endMonth;

  // If startYear is missing, parse from rawDate
  if (!startYear) {
    const years = Array.from(rawDate.matchAll(/\b(20\d{2}|19\d{2})\b/g)).map(m => parseInt(m[1], 10));
    if (years.length > 0) {
      startYear = years[0];
      if (years.length > 1 && !isCurrent) {
        endYear = years[1];
      }
    }
  }

  if (!startYear) {
    return null;
  }

  // Parse months if available (split on dashes or whole word "to", never letters inside "October"/"September")
  if (!startMonthStr || !endMonthStr) {
    const parts = rawDate.split(/\s*(?:[-–—]+|\bto\b)\s*/i);
    const monthOrSlashRegex =
      /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\b|\b(\d{1,2}\/(?:20\d{2}|19\d{2}))\b/i;
    if (parts[0] && !startMonthStr) {
      const match = parts[0].match(monthOrSlashRegex);
      if (match) {
        startMonthStr = match[2] ? match[2].split('/')[0] : match[1];
      }
    }
    if (parts[1] && !endMonthStr && !isCurrent) {
      const match = parts[1].match(monthOrSlashRegex);
      if (match) {
        endMonthStr = match[2] ? match[2].split('/')[0] : match[1];
      }
    }
  }

  const parsedStartMonth = parseMonthString(startMonthStr);
  const parsedEndMonth = parseMonthString(endMonthStr);
  const isYearOnly = parsedStartMonth === undefined && (isCurrent || parsedEndMonth === undefined);

  let startMonthIndex: number;
  let endMonthIndex: number;
  let minStartMonthIndex: number;
  let minEndMonthIndex: number;
  let minPossibleMonths: number;
  let maxPossibleMonths: number;
  let uncertaintyMonths = 0;

  if (isYearOnly) {
    // Year-only range, e.g. "2021 - 2023" or single year "2022" or "2021 - Present"
    const finalEndYear = isCurrent ? asOfYear : (endYear || startYear);

    if (isCurrent) {
      // "2021 - Present": start could be Dec 2021 (min) or Jan 2021 (max)
      startMonthIndex = toMonthIndex(startYear, 0); // Jan standard estimate
      endMonthIndex = asOfMonthIdx;
      const decStart = toMonthIndex(startYear, 11);
      minStartMonthIndex = Math.min(decStart, asOfMonthIdx);
      minEndMonthIndex = asOfMonthIdx;
      minPossibleMonths = Math.max(1, (asOfMonthIdx - toMonthIndex(startYear, 11) + 1));
      maxPossibleMonths = asOfMonthIdx - toMonthIndex(startYear, 0) + 1;
      uncertaintyMonths = maxPossibleMonths - minPossibleMonths;
    } else if (finalEndYear === startYear) {
      // Single year e.g. "2022": min is 1 month (e.g. Dec 2022), max is 12 months (Jan-Dec 2022)
      startMonthIndex = toMonthIndex(startYear, 0);
      endMonthIndex = toMonthIndex(startYear, 11);
      minStartMonthIndex = toMonthIndex(startYear, 11);
      minEndMonthIndex = toMonthIndex(startYear, 11);
      minPossibleMonths = 1;
      maxPossibleMonths = 12;
      uncertaintyMonths = 11;
    } else {
      // Multi-year e.g. "2021 - 2023":
      // Max possible: Jan 2021 to Dec 2023 = (2023 - 2021 + 1) * 12 = 36 months
      // Min possible: Dec 2021 to Jan 2023 = 14 months
      startMonthIndex = toMonthIndex(startYear, 0);
      endMonthIndex = toMonthIndex(finalEndYear, 11);
      const yearDiff = finalEndYear - startYear;
      minStartMonthIndex = toMonthIndex(startYear, 11);
      minEndMonthIndex = toMonthIndex(finalEndYear, 0);
      minPossibleMonths = Math.max(1, (yearDiff - 1) * 12 + 2); // e.g. 2021-2023 -> 1*12 + 2 = 14m
      maxPossibleMonths = (yearDiff + 1) * 12;                  // e.g. 2021-2023 -> 3*12 = 36m
      uncertaintyMonths = maxPossibleMonths - minPossibleMonths; // 22 months uncertainty
    }
  } else {
    // Explicit month specified: Exact bounds
    const sMonth = parsedStartMonth !== undefined ? parsedStartMonth : 0;
    startMonthIndex = toMonthIndex(startYear, sMonth);
    minStartMonthIndex = startMonthIndex;

    if (isCurrent) {
      endMonthIndex = asOfMonthIdx;
      minEndMonthIndex = endMonthIndex;
      const duration = endMonthIndex - startMonthIndex + 1;
      minPossibleMonths = Math.max(1, duration - 1);
      maxPossibleMonths = duration;
      uncertaintyMonths = 1;
    } else if (endYear) {
      const eMonth = parsedEndMonth !== undefined ? parsedEndMonth : 11;
      endMonthIndex = toMonthIndex(endYear, eMonth);
      minEndMonthIndex = endMonthIndex;
      const exactDuration = endMonthIndex - startMonthIndex + 1;
      minPossibleMonths = exactDuration;
      maxPossibleMonths = exactDuration;
      uncertaintyMonths = 0;
    } else {
      endMonthIndex = toMonthIndex(startYear, sMonth);
      minEndMonthIndex = endMonthIndex;
      minPossibleMonths = 1;
      maxPossibleMonths = 1;
      uncertaintyMonths = 0;
    }
  }

  // Ensure end >= start
  if (endMonthIndex < startMonthIndex) {
    endMonthIndex = startMonthIndex;
    minStartMonthIndex = startMonthIndex;
    minEndMonthIndex = startMonthIndex;
    minPossibleMonths = 1;
    maxPossibleMonths = 1;
  }

  const employerName = entry.employerName || entry.company || 'Unknown Employer';
  const roleTitle = entry.jobTitle || entry.title || 'Role';

  // Ongoing role policy tracking
  const ongoingActiveMonthIncluded = isCurrent;
  const completedMonths = isCurrent ? Math.max(0, (endMonthIndex - startMonthIndex)) : (endMonthIndex - startMonthIndex + 1);

  const { empType, profClassification } = resolveEmploymentClassification(entry, employerName, roleTitle);

  return {
    startMonthIndex,
    endMonthIndex,
    minStartMonthIndex,
    minEndMonthIndex,
    isCurrent,
    ongoingActiveMonthIncluded,
    completedMonths,
    isYearOnly,
    minPossibleMonths,
    maxPossibleMonths,
    uncertaintyMonths,
    type: empType,
    arrangement: empType,
    professionalClassification: profClassification,
    employerOrProject: employerName,
    roleTitle,
  };
}

/**
 * Calculates tenure breakdown across all employment entries using calendar interval unions,
 * preserving min-max uncertainty bounds and independent professional classification.
 */
export function calculateTenure(
  entries: Array<{
    employerName?: string;
    company?: string;
    jobTitle?: string;
    title?: string;
    originalDateText?: string;
    dateRangeStr?: string;
    startYear?: number;
    startMonth?: string;
    endYear?: number;
    endMonth?: string;
    isCurrent?: boolean;
    employmentType?: EmploymentType | 'PROJECT';
    arrangement?: EmploymentType | 'PROJECT';
    professionalClassification?: ProfessionalClassification;
    sourceType?: string;
    projectOrigin?: string;
  }>,
  options?: TenureCalculationOptions
): TenureBreakdown {
  const asOfDate = options?.asOfDate || DEFAULT_ANCHOR_DATE;

  const professionalIntervals: Array<{ start: number; end: number }> = [];
  const completedProfessionalIntervals: Array<{ start: number; end: number }> = [];
  const minProfessionalIntervals: Array<{ start: number; end: number }> = [];
  const minCompletedProfessionalIntervals: Array<{ start: number; end: number }> = [];
  const fullTimeIntervals: Array<{ start: number; end: number }> = [];
  const internshipIntervals: Array<{ start: number; end: number }> = [];
  const contractIntervals: Array<{ start: number; end: number }> = [];
  const partTimeIntervals: Array<{ start: number; end: number }> = [];
  const projectIntervals: Array<{ start: number; end: number }> = [];
  const allWorkIntervals: Array<{ start: number; end: number }> = [];
  const completedWorkIntervals: Array<{ start: number; end: number }> = [];
  const minWorkIntervals: Array<{ start: number; end: number }> = [];
  const minCompletedWorkIntervals: Array<{ start: number; end: number }> = [];

  const detailedRecords: DetailedIntervalRecord[] = [];
  let hasYearOnly = false;
  let hasProfessionalYearOnly = false;
  let maxUncertainty = 0;

  for (const entry of entries) {
    const interval = extractIntervalFromEntry(entry, asOfDate);
    if (!interval) continue;

    const months = interval.endMonthIndex - interval.startMonthIndex + 1;
    const startObj = fromMonthIndex(interval.startMonthIndex);
    const endObj = fromMonthIndex(interval.endMonthIndex);

    const startStr = `${startObj.year}-${String(startObj.month + 1).padStart(2, '0')}`;
    const endStr = interval.isCurrent ? 'Present' : `${endObj.year}-${String(endObj.month + 1).padStart(2, '0')}`;

    if (interval.isYearOnly) {
      hasYearOnly = true;
      if (interval.professionalClassification === 'PROFESSIONAL') {
        hasProfessionalYearOnly = true;
      }
      maxUncertainty = Math.max(maxUncertainty, interval.uncertaintyMonths);
    }

    detailedRecords.push({
      employer: interval.employerOrProject,
      title: interval.roleTitle || 'Professional Role',
      type: interval.type,
      arrangement: interval.type,
      professionalClassification: interval.professionalClassification || 'PROFESSIONAL',
      start: startStr,
      end: endStr,
      months,
      completedMonths: interval.completedMonths !== undefined ? interval.completedMonths : months,
      ongoingActiveMonthIncluded: Boolean(interval.ongoingActiveMonthIncluded),
      minPossibleMonths: interval.minPossibleMonths,
      maxPossibleMonths: interval.maxPossibleMonths,
      isCurrent: Boolean(interval.isCurrent),
      isYearOnly: interval.isYearOnly,
      uncertaintyMonths: interval.uncertaintyMonths,
    });

    const span = { start: interval.startMonthIndex, end: interval.endMonthIndex };
    const minSpan = {
      start: interval.minStartMonthIndex ?? interval.startMonthIndex,
      end: interval.minEndMonthIndex ?? interval.endMonthIndex,
    };
    allWorkIntervals.push(span);
    minWorkIntervals.push(minSpan);

    // Gate 3: Track fully completed months span (excluding partially completed current month)
    const completedEnd = interval.isCurrent ? Math.max(interval.startMonthIndex - 1, interval.endMonthIndex - 1) : interval.endMonthIndex;
    if (completedEnd >= interval.startMonthIndex) {
      const completedSpan = { start: interval.startMonthIndex, end: completedEnd };
      completedWorkIntervals.push(completedSpan);
      if (interval.professionalClassification === 'PROFESSIONAL') {
        completedProfessionalIntervals.push(completedSpan);
      }
    }
    const minCompletedEnd = interval.isCurrent ? Math.max(minSpan.start - 1, minSpan.end - 1) : minSpan.end;
    if (minCompletedEnd >= minSpan.start) {
      const minCompletedSpan = { start: minSpan.start, end: minCompletedEnd };
      minCompletedWorkIntervals.push(minCompletedSpan);
      if (interval.professionalClassification === 'PROFESSIONAL') {
        minCompletedProfessionalIntervals.push(minCompletedSpan);
      }
    }

    // Gate 4: Professional classification gate
    if (interval.professionalClassification === 'PROFESSIONAL') {
      professionalIntervals.push(span);
      minProfessionalIntervals.push(minSpan);
    }

    switch (interval.type) {
      case 'FULL_TIME':
      case 'UNKNOWN':
        fullTimeIntervals.push(span);
        break;
      case 'INTERNSHIP':
      case 'APPRENTICESHIP':
        internshipIntervals.push(span);
        break;
      case 'CONTRACT':
      case 'FREELANCE':
        contractIntervals.push(span);
        break;
      case 'PART_TIME':
        partTimeIntervals.push(span);
        break;
      case 'PROJECT':
      case 'VOLUNTEER':
        projectIntervals.push(span);
        break;
      default:
        fullTimeIntervals.push(span);
        break;
    }
  }

  // Gate 4: Total professional months counts all verified PROFESSIONAL intervals (FTE + professional Contract/Freelance)
  const totalProfessionalMonths = calculateUniqueCoveredMonths(professionalIntervals);
  const totalCompletedProfessionalMonths = calculateUniqueCoveredMonths(completedProfessionalIntervals);
  const minPossibleProfessionalMonths = calculateUniqueCoveredMonths(minProfessionalIntervals);
  const maxPossibleProfessionalMonths = totalProfessionalMonths;
  const minPossibleCompletedProfessionalMonths = calculateUniqueCoveredMonths(minCompletedProfessionalIntervals);
  const maxPossibleCompletedProfessionalMonths = totalCompletedProfessionalMonths;

  const internshipMonths = calculateUniqueCoveredMonths(internshipIntervals);
  const contractMonths = calculateUniqueCoveredMonths(contractIntervals);
  const partTimeMonths = calculateUniqueCoveredMonths(partTimeIntervals);
  const projectMonths = calculateUniqueCoveredMonths(projectIntervals);
  const totalWorkMonths = calculateUniqueCoveredMonths(allWorkIntervals);
  const totalCompletedWorkMonths = calculateUniqueCoveredMonths(completedWorkIntervals);
  const minPossibleWorkMonths = calculateUniqueCoveredMonths(minWorkIntervals);
  const maxPossibleWorkMonths = totalWorkMonths;
  const minPossibleCompletedWorkMonths = calculateUniqueCoveredMonths(minCompletedWorkIntervals);
  const maxPossibleCompletedWorkMonths = totalCompletedWorkMonths;
  const hasOngoingActiveMonth = detailedRecords.some(r => r.ongoingActiveMonthIncluded);

  // Gaps calculation
  const mergedProfessional = unionMonthIntervals(professionalIntervals, false);
  const gaps: Array<{ startMonthIndex: number; endMonthIndex: number; gapMonths: number; formatted: string }> = [];

  for (let i = 0; i < mergedProfessional.length - 1; i++) {
    const currentEnd = mergedProfessional[i].end;
    const nextStart = mergedProfessional[i + 1].start;
    const gapMonths = nextStart - currentEnd - 1;
    if (gapMonths >= 2) {
      const startGap = fromMonthIndex(currentEnd + 1);
      const endGap = fromMonthIndex(nextStart - 1);
      gaps.push({
        startMonthIndex: currentEnd + 1,
        endMonthIndex: nextStart - 1,
        gapMonths,
        formatted: `${formatMonthDuration(gapMonths)} gap (${startGap.year}-${startGap.month + 1} to ${endGap.year}-${endGap.month + 1})`,
      });
    }
  }

  return {
    totalProfessionalMonths,
    totalProfessionalYears: Math.round((totalProfessionalMonths / 12) * 10) / 10,
    totalCompletedProfessionalMonths,
    totalCompletedProfessionalYears: Math.round((totalCompletedProfessionalMonths / 12) * 10) / 10,
    minPossibleProfessionalMonths,
    maxPossibleProfessionalMonths,
    minPossibleCompletedProfessionalMonths,
    maxPossibleCompletedProfessionalMonths,
    hasProfessionalYearOnlyIntervals: hasProfessionalYearOnly,
    internshipMonths,
    internshipYears: Math.round((internshipMonths / 12) * 10) / 10,
    contractMonths,
    contractYears: Math.round((contractMonths / 12) * 10) / 10,
    partTimeMonths,
    partTimeYears: Math.round((partTimeMonths / 12) * 10) / 10,
    projectMonths,
    projectYears: Math.round((projectMonths / 12) * 10) / 10,
    totalWorkMonths,
    totalWorkYears: Math.round((totalWorkMonths / 12) * 10) / 10,
    totalCompletedWorkMonths,
    totalCompletedWorkYears: Math.round((totalCompletedWorkMonths / 12) * 10) / 10,
    hasOngoingActiveMonth,
    minPossibleWorkMonths,
    maxPossibleWorkMonths,
    minPossibleCompletedWorkMonths,
    maxPossibleCompletedWorkMonths,
    hasYearOnlyIntervals: hasYearOnly,
    maxUncertaintyMonths: maxUncertainty,
    intervals: detailedRecords,
    gaps,
  };
}

/**
 * Gate 1 & Gate 5 Core Correction:
 * Calculates competency-specific tenure with strict evidence-duration decoupling.
 * Does NOT derive duration from occurrence counts (min(roleMonths, max(1, count)) is invalid).
 *
 * Implements strict distinction between:
 * - evidenceOccurrenceCount: number of statements mentioning the technology
 * - employmentMonths: duration of the containing role or project
 * - explicitUsageMonths: stated duration in the evidence, if present
 * - provenCompetencyMonths: validated elapsed time
 * - minPossibleMonths: confidence interval lower bound (undefined when unstated)
 * - maxPossibleMonths: confidence interval upper bound (= containing role months)
 * - durationStatus: 'EXPLICITLY_PROVEN' | 'ROLE_BOUNDED_UNCERTAIN' | 'UNKNOWN_DURATION' | 'NOT_DEMONSTRATED'
 * - durationConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
 */
function escapeCompetencyRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCompetencyAliases(competencyId: string): { resolvedId: string; matchTerms: string[] } {
  const targetLower = competencyId.trim().toLowerCase();
  const terms = new Set<string>([targetLower]);
  let resolvedId = targetLower;

  const ontNode = resolveCompetency(targetLower);
  if (ontNode) {
    resolvedId = ontNode.id.toLowerCase();
    terms.add(resolvedId);
    terms.add(ontNode.canonical.toLowerCase());
    for (const alias of ontNode.aliases || []) {
      if (alias.trim().length >= 2) {
        terms.add(alias.trim().toLowerCase());
      }
    }
  }

  const taxEntry =
    SKILL_BY_ID.get(resolvedId) ||
    SKILL_BY_ID.get(targetLower);
  if (taxEntry) {
    resolvedId = taxEntry.id.toLowerCase();
    terms.add(resolvedId);
    terms.add(taxEntry.canonical.toLowerCase());
    for (const alias of taxEntry.aliases || []) {
      if (alias.trim().length >= 2) {
        terms.add(alias.trim().toLowerCase());
      }
    }
  }

  return { resolvedId, matchTerms: Array.from(terms) };
}

export function calculateCompetencyTenure(
  competencyId: string,
  structuredEmployment: Array<{
    employerName?: string;
    company?: string;
    jobTitle?: string;
    title?: string;
    originalDateText?: string;
    dateRangeStr?: string;
    startYear?: number;
    startMonth?: string;
    endYear?: number;
    endMonth?: string;
    isCurrent?: boolean;
    employmentType?: EmploymentType | 'PROJECT';
    arrangement?: EmploymentType | 'PROJECT';
    professionalClassification?: ProfessionalClassification;
    sourceType?: string;
    projectOrigin?: string;
    environmentMaturity?: string;
    competencies?: string[];
    evidenceRecords?: Array<{
      competencyIds?: string[];
      matchedTerminology?: string[];
      environmentMaturity?: string;
      isNegated?: boolean;
      competencySentiments?: Record<string, { isNegated?: boolean }>;
    }>;
    bullets?: Array<{ rawText: string; isNegated?: boolean }>;
  }>,
  options?: TenureCalculationOptions
): CompetencyTenureResult {
  const asOfDate = options?.asOfDate || DEFAULT_ANCHOR_DATE;
  const targetId = competencyId.toLowerCase();
  const { resolvedId, matchTerms } = buildCompetencyAliases(competencyId);
  const termSet = new Set(matchTerms);
  const termRegexes = matchTerms.map(t => {
    const flex = escapeCompetencyRegex(t).replace(/[-_]/g, '[-\\s_]?');
    return new RegExp(`(?<![A-Za-z0-9+#.])${flex}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])`, 'i');
  });

  const matchingRoleIntervals: Array<{ start: number; end: number }> = [];
  const contributingRoles: string[] = [];
  const explicitRoles: Array<{
    employer: string;
    interval: { start: number; end: number };
    explicitMonths: number;
    roleMonths: number;
  }> = [];
  let totalOccurrences = 0;

  for (const emp of structuredEmployment) {
    const interval = extractIntervalFromEntry(emp, asOfDate);
    if (!interval) continue;

    if ((options?.strictProductionOnly || options?.professionalOnly) && interval.professionalClassification !== 'PROFESSIONAL') {
      continue;
    }
    if (options?.strictProductionOnly && !isProductionRole(emp)) {
      continue;
    }

    const employerLabel = emp.employerName || emp.company || 'Unknown Employer';
    let occurrencesInRole = 0;
    let explicitMonthsInRole: number | null = null;

    // Check direct competency tags
    if (emp.competencies && emp.competencies.some(c => termSet.has(c.toLowerCase()))) {
      occurrencesInRole += 1;
    }

    // Check evidence records (excluding negated claims)
    if (emp.evidenceRecords) {
      for (const er of emp.evidenceRecords) {
        if (options?.strictProductionOnly && er.environmentMaturity && er.environmentMaturity !== 'PRODUCTION') {
          continue;
        }
        const matchedCid = er.competencyIds?.find(cid => termSet.has(cid.toLowerCase()));
        if (!matchedCid) continue;
        const compNegated =
          er.isNegated ||
          er.competencySentiments?.[matchedCid]?.isNegated ||
          er.competencySentiments?.[resolvedId]?.isNegated ||
          er.competencySentiments?.[targetId]?.isNegated;
        if (compNegated) continue;
        occurrencesInRole += 1;
      }
    }

    // Check bullets for occurrences and explicit duration mentions (supporting integer and fractional years/months)
    if (emp.bullets) {
      for (const b of emp.bullets) {
        if (b.isNegated) continue;
        if (termRegexes.some(re => re.test(b.rawText))) {
          occurrencesInRole += 1;
          const durationMatches = b.rawText.matchAll(
            /\b(?:for|over|spanning|across)?\s*(\d+(?:\.\d+)?)\s*[-–—]?\s*(months?|mos?|yrs?|years?)\b/gi
          );
          for (const durationMatch of durationMatches) {
            const num = parseFloat(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            const parsedMonths = unit.startsWith('y') ? Math.round(num * 12) : Math.round(num);
            if (parsedMonths > 0 && parsedMonths <= 120) {
              explicitMonthsInRole = Math.max(explicitMonthsInRole || 0, parsedMonths);
            }
          }
        }
      }
    }

    if (occurrencesInRole > 0) {
      totalOccurrences += occurrencesInRole;
      matchingRoleIntervals.push({ start: interval.startMonthIndex, end: interval.endMonthIndex });
      contributingRoles.push(employerLabel);
      if (explicitMonthsInRole !== null) {
        explicitRoles.push({
          employer: employerLabel,
          interval: { start: interval.startMonthIndex, end: interval.endMonthIndex },
          explicitMonths: explicitMonthsInRole,
          roleMonths: interval.endMonthIndex - interval.startMonthIndex + 1,
        });
      }
    }
  }

  if (totalOccurrences === 0 || matchingRoleIntervals.length === 0) {
    return {
      competencyId,
      durationStatus: 'NOT_DEMONSTRATED',
      durationConfidence: 'NONE',
      placementKind: 'NO_MEASURABLE_DURATION',
      evidenceOccurrenceCount: 0,
      employmentMonths: 0,
      explicitUsageMonths: undefined,
      provenCompetencyMonths: 0,
      minPossibleMonths: 0,
      maxPossibleMonths: 0,
      usageInterval: null,
      tenureAssessment: 'NOT_DEMONSTRATED',
      provenMonths: 0,
      roleDurationMonths: 0,
      minPossibleDurationMonths: 0,
      maxPossibleDurationMonths: 0,
      isDurationUncertain: false,
      evidenceOccurrences: 0,
      contributingRoles: [],
      formattedDuration: '0 months',
      explanation: `No verified evidence of ${competencyId} found in work experience.`,
    };
  }

  const roleDurationMonths = calculateUniqueCoveredMonths(matchingRoleIntervals);

  // Gate 2 (Phase 07.3): Explicit Duration Combination with Overlap Bounding
  if (explicitRoles.length > 0) {
    // Partition explicitRoles into connected components of overlapping intervals
    const components: Array<typeof explicitRoles> = [];
    const visited = new Set<number>();

    for (let i = 0; i < explicitRoles.length; i++) {
      if (visited.has(i)) continue;
      const comp: typeof explicitRoles = [explicitRoles[i]];
      visited.add(i);

      let queue = [explicitRoles[i]];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        for (let j = 0; j < explicitRoles.length; j++) {
          if (!visited.has(j)) {
            const other = explicitRoles[j];
            const overlap = Math.max(curr.interval.start, other.interval.start) <= Math.min(curr.interval.end, other.interval.end);
            if (overlap) {
              visited.add(j);
              comp.push(other);
              queue.push(other);
            }
          }
        }
      }
      components.push(comp);
    }

    let minCombined = 0;
    let maxCombined = 0;
    let hasOverlappingAmbiguity = false;

    for (const comp of components) {
      if (comp.length === 1) {
        const single = comp[0];
        const boundedMonths = Math.min(single.roleMonths, single.explicitMonths);
        minCombined += boundedMonths;
        maxCombined += boundedMonths;
      } else {
        const compUnionMonths = calculateUniqueCoveredMonths(comp.map(c => c.interval));
        const sumExplicit = comp.reduce((acc, c) => acc + c.explicitMonths, 0);
        const maxExplicit = Math.max(...comp.map(c => c.explicitMonths));

        const compMin = maxExplicit; // if concurrent/coinciding in the overlap
        const compMax = Math.min(compUnionMonths, sumExplicit); // if disjoint

        minCombined += compMin;
        maxCombined += compMax;

        if (compMin < compMax) {
          hasOverlappingAmbiguity = true;
        }
      }
    }

    const totalExplicitSum = explicitRoles.reduce((acc, r) => acc + r.explicitMonths, 0);

    if (!hasOverlappingAmbiguity && minCombined === maxCombined) {
      return {
        competencyId,
        durationStatus: 'EXPLICITLY_PROVEN',
        durationConfidence: 'HIGH',
        placementKind: 'EXPLICIT_UNKNOWN_PLACEMENT',
        evidenceOccurrenceCount: totalOccurrences,
        employmentMonths: roleDurationMonths,
        explicitUsageMonths: totalExplicitSum,
        provenCompetencyMonths: minCombined,
        minPossibleMonths: minCombined,
        maxPossibleMonths: roleDurationMonths,
        usageInterval: null,
        isCombinedPlacementAmbiguous: false,
        minCombinedMonths: minCombined,
        maxCombinedMonths: maxCombined,
        tenureAssessment: 'EXPLICITLY_PROVEN',
        provenMonths: minCombined,
        roleDurationMonths,
        minPossibleDurationMonths: minCombined,
        maxPossibleDurationMonths: maxCombined,
        isDurationUncertain: false,
        evidenceOccurrences: totalOccurrences,
        contributingRoles: Array.from(new Set(contributingRoles)),
        formattedDuration: formatMonthDuration(minCombined),
        explanation: `Explicitly proven duration: ${formatMonthDuration(minCombined)} of ${competencyId} verified across disjoint roles (${contributingRoles.join(', ')}).`,
      };
    } else {
      return {
        competencyId,
        durationStatus: 'ROLE_BOUNDED_UNCERTAIN',
        durationConfidence: 'MEDIUM',
        placementKind: 'EXPLICIT_UNKNOWN_PLACEMENT',
        evidenceOccurrenceCount: totalOccurrences,
        employmentMonths: roleDurationMonths,
        explicitUsageMonths: totalExplicitSum,
        provenCompetencyMonths: undefined,
        minPossibleMonths: minCombined,
        maxPossibleMonths: maxCombined,
        usageInterval: null,
        isCombinedPlacementAmbiguous: true,
        minCombinedMonths: minCombined,
        maxCombinedMonths: maxCombined,
        tenureAssessment: 'ROLE_BOUNDED_UNCERTAIN',
        provenMonths: undefined,
        roleDurationMonths,
        minPossibleDurationMonths: minCombined,
        maxPossibleDurationMonths: maxCombined,
        isDurationUncertain: true,
        evidenceOccurrences: totalOccurrences,
        contributingRoles: Array.from(new Set(contributingRoles)),
        formattedDuration: `Ambiguous bounds (${minCombined}m - ${maxCombined}m)`,
        explanation: `Explicit usage durations across overlapping roles (${explicitRoles.map(r => r.employer).join(', ')}) have unknown calendar placement. Combined distinct duration is bounded between ${minCombined}m (if concurrent during overlap) and ${maxCombined}m (if disjoint).`,
      };
    }
  }

  // Gate 1 Core Invariant: Without explicit technology dates/duration, do NOT manufacture
  // a positive minimum duration from occurrence count.
  // minPossibleMonths is undefined; upper bound is roleDurationMonths.
  const maxPossibleMonths = roleDurationMonths;

  return {
    competencyId,
    durationStatus: 'ROLE_BOUNDED_UNCERTAIN',
    durationConfidence: 'LOW',
    placementKind: 'ROLE_BOUNDED_UNCERTAIN',
    evidenceOccurrenceCount: totalOccurrences,
    employmentMonths: roleDurationMonths,
    explicitUsageMonths: undefined,
    provenCompetencyMonths: undefined,
    minPossibleMonths: undefined, // Core Gate 1 Fix: elapsed time unstated, no manufactured lower bound
    maxPossibleMonths,
    usageInterval: null,
    tenureAssessment: 'ROLE_BOUNDED_UNCERTAIN',
    provenMonths: undefined, // Intentionally undefined: do not manufacture a precise duration
    roleDurationMonths,
    minPossibleDurationMonths: undefined,
    maxPossibleDurationMonths: maxPossibleMonths,
    isDurationUncertain: true,
    evidenceOccurrences: totalOccurrences,
    contributingRoles: Array.from(new Set(contributingRoles)),
    formattedDuration: `Bounded (unstated - ${formatMonthDuration(maxPossibleMonths)})`,
    explanation: `Competency demonstrated across ${contributingRoles.join(', ')} (${totalOccurrences} evidence statements). Total containing role tenure is ${formatMonthDuration(roleDurationMonths)}, but technology-specific elapsed time is unstated (bounded above by ${formatMonthDuration(roleDurationMonths)}; lower bound is unestablished without explicit duration).`,
  };
}

/**
 * Gate 5 Core Correction:
 * Calculates compound competency tenure for boolean expressions (OR / AND),
 * preserving individual branch calculations and never conflating alternatives with single technologies.
 */
export function calculateCompoundCompetencyTenure(
  expression: { type: 'OR' | 'AND'; competencies: string[]; requireConcurrent?: boolean },
  structuredEmployment: any[],
  options?: TenureCalculationOptions
): CompoundCompetencyTenureResult {
  const asOfDate = options?.asOfDate || DEFAULT_ANCHOR_DATE;
  const branchResults: CompoundBranchEvaluation[] = [];

  for (const compId of expression.competencies) {
    const res = calculateCompetencyTenure(compId, structuredEmployment, options);
    const months = res.provenMonths !== undefined ? res.provenMonths : res.roleDurationMonths;
    branchResults.push({
      competencyId: compId,
      months,
      tenureAssessment: res.tenureAssessment,
      roleDurationMonths: res.roleDurationMonths,
      isDemonstrated: res.tenureAssessment !== 'NOT_DEMONSTRATED',
      contributingRoles: res.contributingRoles,
    });
  }

  if (expression.type === 'OR') {
    const allMatchingIntervals: Array<{ start: number; end: number }> = [];

    for (const b of branchResults) {
      if (!b.isDemonstrated) continue;
      for (const emp of structuredEmployment) {
        if (b.contributingRoles.includes(emp.employerName)) {
          const interval = extractIntervalFromEntry(emp, asOfDate);
          if (interval) {
            allMatchingIntervals.push({ start: interval.startMonthIndex, end: interval.endMonthIndex });
          }
        }
      }
    }

    const combinedMonths = calculateUniqueCoveredMonths(allMatchingIntervals);
    const branchDetails = branchResults.map(b => `${b.competencyId}: ${b.months}m`).join(', ');

    return {
      type: 'OR',
      combinedMonths,
      combinedYears: Math.round((combinedMonths / 12) * 10) / 10,
      formattedDuration: formatMonthDuration(combinedMonths),
      branchResults,
      explanation: `Combined alternative tenure across (${expression.competencies.join(' OR ')}): ${formatMonthDuration(combinedMonths)} union duration (${branchDetails}). Does not represent continuous usage of any single technology.`,
    };
  } else {
    const demonstratedCount = branchResults.filter(b => b.isDemonstrated).length;
    const allDemonstrated = demonstratedCount === expression.competencies.length;

    if (!allDemonstrated) {
      const missing = branchResults.filter(b => !b.isDemonstrated).map(b => b.competencyId);
      return {
        type: 'AND',
        combinedMonths: 0,
        combinedYears: 0,
        formattedDuration: '0 months',
        isConcurrent: false,
        branchResults,
        explanation: `Conjunctive requirement failed: Missing mandatory branch(es): ${missing.join(', ')}. Full credit cannot be awarded.`,
      };
    }

    let combinedMonths: number;
    let isConcurrent = false;

    if (expression.requireConcurrent) {
      const commonRoles = branchResults[0].contributingRoles.filter(role =>
        branchResults.every(b => b.contributingRoles.includes(role))
      );

      if (commonRoles.length > 0) {
        isConcurrent = true;
        const concurrentIntervals: Array<{ start: number; end: number }> = [];
        for (const emp of structuredEmployment) {
          if (commonRoles.includes(emp.employerName)) {
            const interval = extractIntervalFromEntry(emp, asOfDate);
            if (interval) {
              concurrentIntervals.push({ start: interval.startMonthIndex, end: interval.endMonthIndex });
            }
          }
        }
        combinedMonths = calculateUniqueCoveredMonths(concurrentIntervals);
      } else {
        isConcurrent = false;
        combinedMonths = 0;
      }
    } else {
      combinedMonths = Math.min(...branchResults.map(b => b.months));
    }

    return {
      type: 'AND',
      combinedMonths,
      combinedYears: Math.round((combinedMonths / 12) * 10) / 10,
      formattedDuration: formatMonthDuration(combinedMonths),
      isConcurrent,
      branchResults,
      explanation: isConcurrent
        ? `Concurrent combined-stack experience: ${formatMonthDuration(combinedMonths)} verified across shared roles (${branchResults.map(b => `${b.competencyId}: ${b.months}m`).join(' AND ')}).`
        : `Independent capability across all required technologies: limited by bottleneck branch (${formatMonthDuration(combinedMonths)}).`,
    };
  }
}
