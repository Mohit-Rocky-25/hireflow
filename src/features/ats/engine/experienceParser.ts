// ============================================================
// ATS Resume Roaster — Enhanced Experience Parser (Stage 3/4 / Phase 10.2)
// Parses experience sections into structured date-range entries with
// employment types, promotion handling, multi-section support, and exact document-relative locators.
// ============================================================

import { ParsedSection, ExperienceEntry } from './types';
import { analyzeBullet } from './bulletAnalyzer';
import {
  EmploymentType,
  StructuredEmploymentEntry,
} from './evidenceModel';
import { SourceLocator, buildLineOffsets, offsetToLineNumber } from './sourceLocator';

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
];

const DATE_RANGE_REGEX =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*(?:\d{4}|\d{2})|\b\d{1,2}\/\d{2,4}|\b(?:19|20)\d{2})\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*(?:\d{4}|\d{2})|\b\d{1,2}\/\d{2,4}|\b(?:19|20)\d{2}|Present|Current|Now|Ongoing)/i;

const YEAR_REGEX = /\b(20\d{2}|19\d{2})\b/g;
const MONTH_REGEX = new RegExp(`\\b(${MONTH_NAMES.join('|')})\\b`, 'i');

export interface ParsedRoleEntry extends ExperienceEntry, StructuredEmploymentEntry {}

interface IndexedLine {
  text: string;
  docStart: number;
  docEnd: number;
}

/**
 * Detects employment type from role title and line text.
 */
export function detectEmploymentType(title: string, contextLine: string = ''): EmploymentType {
  const combined = `${title} ${contextLine}`.toLowerCase();

  if (/\b(?:intern|internship|co-op|coop|trainee|summer associate)\b/.test(combined)) {
    return 'INTERNSHIP';
  }
  if (/\b(?:contract|contractor|consultant)\b/.test(combined)) {
    return 'CONTRACT';
  }
  if (/\b(?:freelance|independent contractor)\b/.test(combined)) {
    return 'FREELANCE';
  }
  if (/\b(?:part-time|part time)\b/.test(combined)) {
    return 'PART_TIME';
  }
  if (/\b(?:apprentice|apprenticeship)\b/.test(combined)) {
    return 'APPRENTICESHIP';
  }
  if (/\b(?:volunteer|volunteering)\b/.test(combined)) {
    return 'VOLUNTEER';
  }
  if (/\b(?:temporary|temp)\b/.test(combined)) {
    return 'TEMPORARY';
  }
  if (/\b(?:full-time|full time|lead|senior|staff|principal|director|manager|engineer|developer|analyst)\b/.test(combined)) {
    return 'FULL_TIME';
  }

  return 'UNKNOWN';
}

/**
 * Parses date range text to extract start and end years/months.
 */
export function parseDateDetails(dateStr: string): {
  startYear?: number;
  startMonth?: string;
  endYear?: number;
  endMonth?: string;
  isCurrent: boolean;
} {
  const isCurrent = /present|current|now|ongoing/i.test(dateStr);
  const years = Array.from(dateStr.matchAll(YEAR_REGEX)).map(m => parseInt(m[1], 10));
  const startYear = years[0];
  const endYear = years.length > 1 ? years[1] : (isCurrent ? new Date().getFullYear() : undefined);

  const parts = dateStr.split(/[-–—to]+/i);
  let startMonth: string | undefined;
  let endMonth: string | undefined;

  if (parts[0]) {
    const m = parts[0].match(MONTH_REGEX);
    if (m) startMonth = m[1];
  }
  if (parts[1] && !isCurrent) {
    const m = parts[1].match(MONTH_REGEX);
    if (m) endMonth = m[1];
  }

  return { startYear, startMonth, endYear, endMonth, isCurrent };
}

function stripDateFromLine(line: string, matchedDate: string): string {
  return line
    .replace(matchedDate, '')
    .replace(/\(\s*\)|\[\s*\]/g, '')
    .replace(/[|•–—,\s-]+$/, '')
    .replace(/^[|•–—,\s-]+/, '')
    .trim();
}

function buildIndexedLines(section: ParsedSection, resumeText?: string): IndexedLine[] {
  const rawLines = section.content.split(/\r?\n/);
  const result: IndexedLine[] = [];
  let searchCursor = Math.max(0, section.charStart);
  let localOffset = 0;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    const step = rawLine.length + 1;
    if (!trimmed) {
      localOffset += step;
      continue;
    }

    let docStart = -1;
    let docEnd = -1;

    if (resumeText) {
      const idx = resumeText.indexOf(trimmed, Math.max(0, searchCursor - 16));
      if (idx !== -1 && idx <= Math.max(section.charEnd, searchCursor + trimmed.length + 250)) {
        docStart = idx;
        docEnd = idx + trimmed.length;
        searchCursor = docEnd;
      }
    }

    if (docStart === -1) {
      // Fallback relative to section when resumeText isn't supplied
      const titleOffset = section.rawTitle ? section.rawTitle.length + 1 : 0;
      const base = section.charStart + (resumeText ? 0 : titleOffset);
      docStart = base + localOffset;
      docEnd = docStart + trimmed.length;
    }

    result.push({ text: trimmed, docStart, docEnd });
    localOffset += step;
  }

  return result;
}

/**
 * Enhanced experience parser with structured employment types and true document-relative locators.
 * Accepts either a single ParsedSection or an array of duplicate/split experience sections.
 */
export function parseExperienceSection(
  experienceSection?: ParsedSection | ParsedSection[],
  options?: { documentId?: string; resumeText?: string }
): ParsedRoleEntry[] {
  if (!experienceSection) return [];
  const sectionList = Array.isArray(experienceSection) ? experienceSection : [experienceSection];
  const entries: ParsedRoleEntry[] = [];
  const docLineOffsets = options?.resumeText ? buildLineOffsets(options.resumeText) : null;
  let entryCount = 0;

  for (const section of sectionList) {
    if (!section || !section.content.trim()) continue;

    const indexedLines = buildIndexedLines(section, options?.resumeText);
    if (indexedLines.length === 0) continue;

    const lineOffsets = docLineOffsets || buildLineOffsets(section.content);
    const sectionId = (section as { sectionId?: string }).sectionId || 'experience';

    let currentCompany = '';
    let currentTitle = '';
    let currentLocation = '';
    let currentDateRange = '';
    let currentBullets: string[] = [];
    let pendingCompanyLineStart: number | null = null;
    let entryStart = indexedLines[0].docStart;
    let entryEnd = indexedLines[0].docEnd;

    const commitEntry = () => {
      if (currentTitle || currentBullets.length > 0) {
        entryCount++;
        const entryId = `exp_entry_${entryCount}`;
        const dateDetails = parseDateDetails(currentDateRange);
        const employmentType = detectEmploymentType(currentTitle, `${currentCompany} ${currentDateRange}`);
        const isInternship = employmentType === 'INTERNSHIP';
        const analyzedBullets = currentBullets.map((b) =>
          analyzeBullet(b, {
            sourceType: isInternship ? 'INTERNSHIP' : 'PROFESSIONAL_EXPERIENCE',
            environmentMaturity: isInternship ? 'DEVELOPMENT' : 'PRODUCTION',
            roleOrProject: currentCompany || currentTitle || 'Professional Role',
            entryId,
            sectionType: 'experience',
            resumeText: options?.resumeText,
            searchHintStart: entryStart,
          })
        );

        const safeEnd = Math.max(entryStart, entryEnd);
        const locatorStartLine = docLineOffsets
          ? offsetToLineNumber(entryStart, lineOffsets)
          : offsetToLineNumber(Math.max(0, entryStart - section.charStart), lineOffsets);
        const locatorEndLine = docLineOffsets
          ? offsetToLineNumber(Math.max(entryStart, safeEnd - 1), lineOffsets)
          : offsetToLineNumber(Math.max(0, safeEnd - 1 - section.charStart), lineOffsets);

        const locator: SourceLocator = {
          documentId: options?.documentId,
          charStart: entryStart,
          charEnd: safeEnd,
          lineStart: locatorStartLine,
          lineEnd: locatorEndLine,
          sectionId,
          entryId,
        };

        const entry: ParsedRoleEntry = {
          company: currentCompany || 'Engineering Organization',
          title: currentTitle || 'Software Engineer',
          dateRangeStr: currentDateRange || 'Date Range Not Specified',
          startYear: dateDetails.startYear,
          endYear: dateDetails.endYear,
          isCurrent: dateDetails.isCurrent,
          bullets: analyzedBullets,
          charStart: entryStart,
          charEnd: safeEnd,

          id: entryId,
          employerName: currentCompany || 'Engineering Organization',
          jobTitle: currentTitle || 'Software Engineer',
          location: currentLocation || undefined,
          startMonth: dateDetails.startMonth,
          endMonth: dateDetails.endMonth,
          employmentType,
          originalDateText: currentDateRange || 'Unspecified',
          responsibilities: analyzedBullets.filter((b) => !b.hasMetric).map((b) => b.rawText),
          achievements: analyzedBullets.filter((b) => b.hasMetric).map((b) => b.rawText),
          technologies: [],
          competencies: [],
          evidenceRecords: [],
          parsingConfidence: currentTitle && currentDateRange ? 0.95 : 0.75,
          locator,
        };

        entries.push(entry);
      }

      currentTitle = '';
      currentLocation = '';
      currentDateRange = '';
      currentBullets = [];
    };

    for (let i = 0; i < indexedLines.length; i++) {
      const { text: line, docStart, docEnd } = indexedLines[i];
      const isBullet = /^[*\-•▪●]+\s+/.test(line) || /^\d+[.)]\s+/.test(line);
      const dateMatch = line.match(DATE_RANGE_REGEX);

      if (dateMatch && !isBullet) {
        const prevCompany = currentCompany;
        const hadPendingCompany = pendingCompanyLineStart !== null;
        commitEntry();

        currentDateRange = dateMatch[0];
        const withoutDate = stripDateFromLine(line, dateMatch[0]);
        const parts = withoutDate.split(/\s*(?:\||@|[-–—]{1,2}\s|\s[-–—]{1,2})\s*/).map(p => p.trim()).filter(Boolean);

        // Determine if entryStart starts at a preceding Company/Title header line
        if (hadPendingCompany && pendingCompanyLineStart !== null) {
          entryStart = pendingCompanyLineStart;
        } else {
          entryStart = docStart;
        }
        pendingCompanyLineStart = null;
        entryEnd = docEnd;

        if (parts.length >= 3) {
          currentTitle = parts[0];
          currentCompany = parts[1];
          currentLocation = parts[2];
        } else if (parts.length === 2) {
          currentTitle = parts[0];
          currentCompany = parts[1];
        } else if (parts.length === 1) {
          if (hadPendingCompany && currentTitle && currentCompany) {
            // Line above already provided Title | Company; this line has Date | Location
            currentLocation = parts[0];
          } else {
            currentTitle = parts[0];
            currentCompany = prevCompany;
          }
        }
      } else if (isBullet) {
        if (!currentTitle && currentBullets.length === 0) {
          entryStart = docStart;
        }
        currentBullets.push(line);
        entryEnd = docEnd;
      } else if (
        line.length < 90 &&
        i + 1 < indexedLines.length &&
        DATE_RANGE_REGEX.test(indexedLines[i + 1].text)
      ) {
        // Header line immediately preceding a date line:
        // Could be "Company | Location" (followed by "Title | 2023 - Present")
        // OR "Title | Company" (followed by "Aug 2023 - Present | Toronto, Canada")
        commitEntry();
        const nextLine = indexedLines[i + 1].text;
        const nextDateMatch = nextLine.match(DATE_RANGE_REGEX)!;
        const nextWithoutDate = stripDateFromLine(nextLine, nextDateMatch[0]);
        const parts = line.split(/\s*[|@]\s*|\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);

        const nextLooksLikeLocationOnly =
          !nextWithoutDate ||
          /^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(nextWithoutDate) ||
          /\b(?:remote|india|usa|uk|canada)\b/i.test(nextWithoutDate);

        if (nextLooksLikeLocationOnly && parts.length >= 2) {
          currentTitle = parts[0];
          currentCompany = parts[1];
        } else {
          currentCompany = parts[0];
          if (parts[1]) currentLocation = parts[1];
        }
        pendingCompanyLineStart = docStart;
        entryStart = docStart;
        entryEnd = docEnd;
      } else {
        if (!currentTitle && currentBullets.length === 0) {
          entryStart = docStart;
        }
        currentBullets.push(line);
        entryEnd = docEnd;
      }
    }

    commitEntry();
  }

  return entries;
}
