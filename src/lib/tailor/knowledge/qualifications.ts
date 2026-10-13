// ============================================================
// HIREFLOW QUALIFICATIONS & EDUCATION NORMALIZER
// Parses degrees, universities, CGPA, GPA, percentages, and honors
// ============================================================

import { EducationEntry } from '../types';

export interface ParsedScore {
  scoreType: 'CGPA' | 'GPA' | 'PERCENTAGE' | 'HONORS' | 'NONE';
  scoreValue?: string;
}

export function parseEducationScore(text: string): ParsedScore {
  if (!text) return { scoreType: 'NONE' };

  // CGPA match: e.g. "CGPA: 8.9 / 10", "8.9 CGPA", "CGPA 9.2"
  const cgpaMatch = text.match(/cgpa[:\s]*([0-9]+(?:\.[0-9]+)?)(?:\s*\/\s*(?:10(?:\.0)?))?/i);
  if (cgpaMatch) {
    return { scoreType: 'CGPA', scoreValue: `${cgpaMatch[1]}/10` };
  }

  // GPA match: e.g. "GPA: 3.8 / 4.0", "3.75 GPA"
  const gpaMatch = text.match(/gpa[:\s]*([0-9]+(?:\.[0-9]+)?)(?:\s*\/\s*(?:4(?:\.0)?))?/i);
  if (gpaMatch) {
    return { scoreType: 'GPA', scoreValue: `${gpaMatch[1]}/4.0` };
  }

  // Percentage match: e.g. "88%", "88.5 %"
  const pctMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (pctMatch) {
    return { scoreType: 'PERCENTAGE', scoreValue: `${pctMatch[1]}%` };
  }

  // Honors
  if (/summa cum laude|magna cum laude|cum laude|first class with distinction|dean's list/i.test(text)) {
    return { scoreType: 'HONORS', scoreValue: 'Honors / Distinction' };
  }

  return { scoreType: 'NONE' };
}

export function normalizeDegreeTitle(rawDegree: string): string {
  const lower = rawDegree.toLowerCase();
  if (/b\.?\s*tech|bachelor of technology/i.test(lower)) return 'B.Tech in Computer Science / Engineering';
  if (/b\.?\s*e\.|bachelor of engineering/i.test(lower)) return 'Bachelor of Engineering';
  if (/b\.?\s*s\.|bachelor of science/i.test(lower)) return 'Bachelor of Science';
  if (/m\.?\s*s\.|master of science/i.test(lower)) return 'Master of Science';
  if (/m\.?\s*tech|master of technology/i.test(lower)) return 'M.Tech in Engineering';
  if (/m\.?\s*b\.?\s*a|master of business administration/i.test(lower)) return 'MBA';
  if (/ph\.?\s*d|doctor of philosophy/i.test(lower)) return 'Ph.D.';
  if (/diploma/i.test(lower)) return 'Diploma';
  return rawDegree.trim();
}
