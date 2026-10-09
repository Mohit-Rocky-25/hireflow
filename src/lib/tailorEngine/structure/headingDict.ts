// ============================================================
// Tailor Engine — Heading Dictionary & Canonical Mapping
// ============================================================

import { SectionKind } from './types';

export interface HeadingDefinition {
  kind: SectionKind;
  canonicalTitle: string;
  aliases: string[];
}

export const HEADING_DEFINITIONS: HeadingDefinition[] = [
  {
    kind: 'summary',
    canonicalTitle: 'Professional Summary',
    aliases: [
      'professional summary',
      'career objective',
      'objective',
      'profile',
      'about me',
      'summary',
      'executive summary'
    ]
  },
  {
    kind: 'education',
    canonicalTitle: 'Education',
    aliases: [
      'education',
      'academics',
      'academic background',
      'qualifications',
      'educational background',
      'educational qualifications'
    ]
  },
  {
    kind: 'skills',
    canonicalTitle: 'Technical Skills',
    aliases: [
      'technical skills',
      'areas of expertise',
      'core competencies',
      'skills & abilities',
      'technical proficiency',
      'technologies',
      'tech stack',
      'tools & technologies',
      'skills'
    ]
  },
  {
    kind: 'projects',
    canonicalTitle: 'Projects',
    aliases: [
      'projects',
      'key projects',
      'academic projects',
      'personal projects',
      'technical projects',
      'notable projects'
    ]
  },
  {
    kind: 'experience',
    canonicalTitle: 'Work Experience',
    aliases: [
      'work experience',
      'internship experience',
      'internships',
      'industrial training',
      'employment history',
      'professional experience',
      'experience'
    ]
  },
  {
    kind: 'certifications',
    canonicalTitle: 'Certifications',
    aliases: [
      'certifications',
      'certificates',
      'courses',
      'licenses & certifications',
      'certifications & courses'
    ]
  },
  {
    kind: 'achievements',
    canonicalTitle: 'Achievements',
    aliases: [
      'achievements',
      'awards',
      'honours',
      'honors & awards',
      'extracurricular activities',
      'positions of responsibility',
      'academic achievements'
    ]
  },
  {
    kind: 'languages',
    canonicalTitle: 'Languages',
    aliases: [
      'languages known',
      'languages'
    ]
  },
  {
    kind: 'links',
    canonicalTitle: 'Links',
    aliases: [
      'social presence',
      'profiles',
      'portfolio',
      'online presence',
      'links & profiles',
      'links'
    ]
  },
  {
    kind: 'padding',
    canonicalTitle: 'Personal Details (Left Out)',
    aliases: [
      'declaration',
      'hobbies',
      'interests',
      'personal details',
      'personal profile'
    ]
  }
];

export interface HeadingMatch {
  kind: SectionKind;
  canonicalTitle: string;
  matchedAlias: string;
  index: number;
  length: number;
}

/**
 * Checks if a standalone trimmed line matches a known heading.
 */
export function matchExactHeadingLine(line: string): HeadingDefinition | null {
  const clean = line.replace(/[:\-#•*]+$/, '').trim().toLowerCase();
  if (clean.length < 2 || clean.length > 35) return null;

  for (const def of HEADING_DEFINITIONS) {
    if (def.aliases.includes(clean)) {
      return def;
    }
  }
  return null;
}

/**
 * Searches for all known heading phrases within a flat text string.
 * Uses word boundaries and phrase lengths to prioritize longest matches.
 * In flat/unsegmented text, section headings must be Title Case or UPPERCASE
 * to distinguish them from common nouns in body sentences.
 */
export function findHeadingOccurrences(text: string): HeadingMatch[] {
  const matches: HeadingMatch[] = [];

  // Sort aliases by length descending so "technical skills" matches before "skills"
  const allAliases: Array<{ alias: string; def: HeadingDefinition }> = [];
  for (const def of HEADING_DEFINITIONS) {
    for (const alias of def.aliases) {
      // Exclude sub-labels like 'portfolio' from top-level headings
      if (alias === 'portfolio') continue;
      allAliases.push({ alias, def });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, def } of allAliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b\\s*:?`, 'gi');

    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const matchWord = m[1];
      const matchIndex = m.index;

      // In running text without newlines, section headings are Title Cased or UPPERCASE.
      // (e.g. "Projects", "PROJECTS", "Career Objective", but NOT "managed 3 projects" or "seeking technical skills")
      const isCapitalized = /^[A-Z]/.test(matchWord) && (
        matchWord === matchWord.toUpperCase() ||
        matchWord.split(/\s+/).every((w) => /^[A-Z]/.test(w) || ['and', '&', 'of', 'in', 'to', 'for'].includes(w.toLowerCase()))
      );

      // If text has newlines and match is at start of line, lowercase is allowed
      const isAtLineStart = matchIndex === 0 || text[matchIndex - 1] === '\n';
      if (!isCapitalized && !isAtLineStart) continue;

      // Avoid overlapping with an already discovered longer match
      const overlaps = matches.some(
        (existing) =>
          Math.max(existing.index, matchIndex) <
          Math.min(existing.index + existing.length, matchIndex + matchWord.length)
      );

      if (!overlaps) {
        matches.push({
          kind: def.kind,
          canonicalTitle: def.canonicalTitle,
          matchedAlias: matchWord,
          index: matchIndex,
          length: matchWord.length
        });
      }
    }
  }

  // Sort matches by their appearance index in text
  return matches.sort((a, b) => a.index - b.index);
}
