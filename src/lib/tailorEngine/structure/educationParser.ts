// ============================================================
// Tailor Engine — Education Parser
// Detects institutions, degrees, branches, dates, Expected tags, and reverses order
// ============================================================

import { RecoveredEducation } from './types';

const DEGREE_PATTERNS = [
  { match: /\b(?:B\.?\s*Tech|B\.?\s*E\.?|Bachelor of Technology|Bachelor of Engineering)\b(?:\s+in\s+([a-zA-Z\s]+))?/i, name: 'B.Tech' },
  { match: /\b(?:M\.?\s*Tech|M\.?\s*E\.?|Master of Technology)\b(?:\s+in\s+([a-zA-Z\s]+))?/i, name: 'M.Tech' },
  { match: /\b(?:B\.?\s*S\.?|B\.?\s*Sc\.?|Bachelor of Science)\b(?:\s+in\s+([a-zA-Z\s]+))?/i, name: 'B.S.' },
  { match: /\b(?:M\.?\s*S\.?|M\.?\s*Sc\.?|Master of Science)\b(?:\s+in\s+([a-zA-Z\s]+))?/i, name: 'M.S.' },
  { match: /\b(?:BCA|MCA|MBA|BBA)\b/i, name: 'Degree' },
  { match: /\b(?:Intermediate|12th|Higher Secondary|Junior College|Class XII)\b(?:\s+schooling|\s+education)?/i, name: 'Intermediate' },
  { match: /\b(?:10th|Secondary School|SSC|Matriculation|Class X)\b/i, name: 'Secondary School (10th)' },
  { match: /\b(?:Diploma)\b(?:\s+in\s+([a-zA-Z\s]+))?/i, name: 'Diploma' }
];

const DATE_RANGE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*)?\b(20\d{2})\b\s*(?:to|-|–|—)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*)?\b(20\d{2}|Present)\b/gi;

function titleCaseWithAcronyms(str: string): string {
  return str
    .split(/([ -/])/)
    .map((part) => {
      const lower = part.toLowerCase();
      if (['vit', 'vit-ap', 'iit', 'nit', 'ece', 'cse', 'it', 'ai', 'ml', 'b.tech', 'm.tech'].includes(lower)) {
        return part.toUpperCase();
      }
      if (lower === 'of' || lower === 'in' || lower === 'and') return lower;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

export function parseEducationSection(content: string): RecoveredEducation[] {
  if (!content || !content.trim()) return [];

  const raw = content.trim();

  // Find all date range matches to split multiple education records
  const dateMatches: Array<{ full: string; start: number; end: number; startYear: number; endYear: number; isExpected: boolean; matchIndex: number; length: number }> = [];

  const regex = new RegExp(DATE_RANGE_REGEX.source, 'gi');
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    const startYear = parseInt(m[1], 10);
    const endStr = m[2];
    const endYear = endStr.toLowerCase() === 'present' ? 2099 : parseInt(endStr, 10);
    // Any future year (> 2026) or present is expected
    const isExpected = endYear > 2026;

    dateMatches.push({
      full: m[0],
      start: startYear,
      end: endYear,
      startYear,
      endYear,
      isExpected,
      matchIndex: m.index,
      length: m[0].length
    });
  }

  // If no date ranges detected, parse whole block as a single education entry
  if (dateMatches.length === 0) {
    return [
      {
        institution: titleCaseWithAcronyms(raw.slice(0, 45)),
        degree: 'Education',
        dates: '',
        isExpected: false,
        rawLine: raw
      }
    ];
  }

  const results: RecoveredEducation[] = [];

  // Each education entry is the text preceding its date range (or between previous date and current date)
  let prevEnd = 0;
  for (let i = 0; i < dateMatches.length; i++) {
    const curDate = dateMatches[i];
    const chunkStart = prevEnd;
    const chunkEnd = curDate.matchIndex + curDate.length;
    prevEnd = chunkEnd;

    const chunk = raw.substring(chunkStart, chunkEnd).trim();
    // Text before the date
    let textBeforeDate = raw.substring(chunkStart, curDate.matchIndex).trim();

    // Check degree
    let degreeName = 'Bachelor of Technology';
    let branchName = '';

    for (const dp of DEGREE_PATTERNS) {
      const match = textBeforeDate.match(dp.match);
      if (match) {
        degreeName = dp.name;
        if (match[1]) {
          branchName = match[1].trim().toUpperCase();
        } else if (/\bECE\b/i.test(textBeforeDate)) {
          branchName = 'ECE';
        } else if (/\bCSE\b/i.test(textBeforeDate)) {
          branchName = 'CSE';
        }
        // Remove degree from institution text
        textBeforeDate = textBeforeDate.replace(match[0], ' ');
        break;
      }
    }

    if (branchName) {
      degreeName = `${degreeName} in ${branchName}`;
    }

    // CGPA or Percentage
    let cgpa: string | undefined = undefined;
    const cgpaMatch = textBeforeDate.match(/(?:CGPA|GPA|percentage|score)?:?\s*(\d+(?:\.\d+)?(?:\s*\/\s*10|\s*%)?)/i);
    if (cgpaMatch && parseFloat(cgpaMatch[1]) > 0) {
      cgpa = cgpaMatch[0];
      textBeforeDate = textBeforeDate.replace(cgpaMatch[0], ' ');
    }

    // Clean institution and city
    let instTokens = textBeforeDate
      .replace(/[,|-]+/g, ',')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let institution = instTokens[0] || 'University / Institution';
    let city = instTokens[1] || '';

    // Clean formatting
    institution = titleCaseWithAcronyms(institution.replace(/\s{2,}/g, ' '));
    if (city) city = titleCaseWithAcronyms(city);

    // Format clean date string: "Sept 2025 - Aug 2029 (Expected)"
    let formattedDates = curDate.full.replace(/\s+to\s+/i, ' - ');
    if (curDate.isExpected && !formattedDates.includes('Expected')) {
      formattedDates += ' (Expected)';
    }

    results.push({
      institution,
      degree: degreeName,
      branch: branchName || undefined,
      dates: formattedDates,
      isExpected: curDate.isExpected,
      cgpaOrPercentage: cgpa,
      city: city || undefined,
      startYear: curDate.startYear,
      endYear: curDate.endYear,
      rawLine: chunk
    });
  }

  // Reverse chronological sort: later endYear first!
  return results.sort((a, b) => (b.endYear || 0) - (a.endYear || 0));
}
