// ============================================================
// HireFlow v3 — Section Segmenter (R3.7)
// Comprehensive Indian heading dictionary & pattern-based inference
// ============================================================

import { DetectedSection } from './types';

interface HeadingDefinition {
  category: DetectedSection['normalizedCategory'];
  variants: string[];
}

export const HEADING_DICTIONARY: HeadingDefinition[] = [
  {
    category: 'education',
    variants: [
      'academic qualification',
      'academic qualifications',
      'educational qualification',
      'educational qualifications',
      'education',
      'academics',
      'academic background',
      'educational background',
      'educational details',
    ],
  },
  {
    category: 'skills',
    variants: [
      'technical skills',
      'key skills',
      'skills',
      'core competencies',
      'technical skills & competencies',
      'technical skills and competencies',
      'skills & competencies',
      'skills and competencies',
      'technical competencies',
      'programming skills',
      'computer skills',
      'it skills',
      'skills & tools',
      'skills and tools',
      'tech stack',
      'technologies',
      'technical proficiency',
      'areas of expertise',
      'technical expertise',
      'tools & technologies',
      'tools and technologies',
    ],
  },
  {
    category: 'projects',
    variants: [
      'academic projects',
      'projects',
      'key projects',
      'personal projects',
      'major projects',
      'minor projects',
      'course projects',
      'capstone project',
      'selected projects',
      'technical projects',
    ],
  },
  {
    category: 'experience',
    variants: [
      'internship',
      'internships',
      'training',
      'trainings',
      'work experience',
      'experience',
      'professional experience',
      'employment history',
      'summer internship',
      'industrial training',
    ],
  },
  {
    category: 'achievements',
    variants: [
      'achievements',
      'awards',
      'honors',
      'awards and achievements',
      'accolades',
      'accomplishments',
      'scholastic achievements',
      'hackathons',
    ],
  },
  {
    category: 'positions_of_responsibility',
    variants: [
      'positions of responsibility',
      'position of responsibility',
      'extra-curricular',
      'extra curricular',
      'co-curricular',
      'extra-curricular activities',
      'co-curricular activities',
      'leadership',
      'responsibilities',
      'volunteer work',
      'student activities',
    ],
  },
  {
    category: 'certifications',
    variants: [
      'certifications',
      'courses',
      'courses and certifications',
      'licenses and certifications',
      'certificates',
      'online courses',
      'trainings & certifications',
      'certifications & webinars',
      'certifications and webinars',
    ],
  },
  {
    category: 'summary',
    variants: [
      'objective',
      'career objective',
      'professional summary',
      'summary',
      'profile',
      'about me',
      'personal profile',
      'declaration',
    ],
  },
];

/**
 * Checks bounded Levenshtein distance for heading typo tolerance.
 */
function isCloseMatch(s1: string, s2: string): boolean {
  if (s1 === s2) return true;
  if (Math.abs(s1.length - s2.length) > 1) return false;

  let edits = 0;
  let i = 0;
  let j = 0;
  while (i < s1.length && j < s2.length) {
    if (s1[i] !== s2[j]) {
      edits++;
      if (edits > 1) return false;
      if (s1.length > s2.length) i++;
      else if (s2.length > s1.length) j++;
      else {
        i++;
        j++;
      }
    } else {
      i++;
      j++;
    }
  }
  return true;
}

/**
 * Matches a line against heading dictionary definitions.
 */
export function identifySectionHeader(line: string): {
  category: DetectedSection['normalizedCategory'];
  headerName: string;
} | null {
  const clean = line
    .trim()
    .replace(/^[-*#\d.]+\s*/, '') // strip leading bullet or numbering
    .replace(/[:\-–—]+$/, '')     // strip trailing punctuation
    .trim()
    .toLowerCase();

  if (clean.length < 3 || clean.length > 50) return null;

  for (const def of HEADING_DICTIONARY) {
    for (const variant of def.variants) {
      if (clean === variant || isCloseMatch(clean, variant)) {
        return {
          category: def.category,
          headerName: line.trim(),
        };
      }
    }
  }

  return null;
}

/**
 * Segments document lines into structured sections with heading or content-pattern detection (R3.7).
 */
export function segmentSections(lines: string[]): DetectedSection[] {
  const sections: DetectedSection[] = [];
  let currentCategory: DetectedSection['normalizedCategory'] = 'summary';
  let currentName = 'Header & Contact';
  let currentLines: string[] = [];
  let startIndex = 0;
  let isInferred = true;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentLines.push(line);
      return;
    }

    const header = identifySectionHeader(trimmed);

    if (header) {
      // Commit previous section if it has non-empty lines
      if (currentLines.some((l) => l.trim().length > 0)) {
        sections.push({
          name: currentName,
          normalizedCategory: currentCategory,
          rawHeader: currentName,
          startIndex,
          endIndex: index - 1,
          content: currentLines.join('\n').trim(),
          confidence: isInferred ? 'medium' : 'high',
          inferred: isInferred,
        });
      }

      currentCategory = header.category;
      currentName = header.headerName;
      currentLines = [];
      startIndex = index;
      isInferred = false;
    } else {
      currentLines.push(line);
    }
  });

  // Commit trailing section
  if (currentLines.some((l) => l.trim().length > 0)) {
    sections.push({
      name: currentName,
      normalizedCategory: currentCategory,
      rawHeader: currentName,
      startIndex,
      endIndex: lines.length - 1,
      content: currentLines.join('\n').trim(),
      confidence: isInferred ? 'low' : 'high',
      inferred: isInferred,
    });
  }

  return sections;
}
