// ============================================================
// ATS Resume Roaster — Section Splitter (Stage 3)
// Splits resume into semantic sections based on section-headings.json
// ============================================================

import sectionHeadingsData from '../knowledge/section-headings.json';
import { ParsedSection } from './types';

interface HeadingMatch {
  type: string;
  rawTitle: string;
  charStart: number;
  contentStart: number;
}

/**
 * Splits plain text resume into detected sections with exact character ranges.
 */
export function splitResumeSections(resumeText: string): ParsedSection[] {
  const lines = resumeText.split(/\r?\n/);
  const sectionsConfig = sectionHeadingsData.sections as Record<string, string[]>;
  const matches: HeadingMatch[] = [];

  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineStartOffset = currentOffset;
    currentOffset += rawLine.length + 1; // account for newline

    if (!trimmed || trimmed.length > 50) continue;

    // Remove markdown headers, numbering, bullets, roman numerals: e.g. "## EXPERIENCE", "1. SKILLS", "I. EDUCATION", "=== PROJECTS ==="
    const cleanedHeading = trimmed
      .replace(/^[#*\-•▪●\d.IVXLCDMivxlcdm]+\s*[.:\-)\]]?\s*/, '')
      .replace(/[=:|_\-\s]+$/, '')
      .replace(/^[=:|_\-\s]+/, '')
      .trim()
      .toLowerCase();

    // Check against all known section aliases
    for (const [secType, aliases] of Object.entries(sectionsConfig)) {
      const isMatch = aliases.some(alias => {
        const lowerAlias = alias.toLowerCase();
        return (
          cleanedHeading === lowerAlias ||
          cleanedHeading.startsWith(lowerAlias + ' ') ||
          cleanedHeading.endsWith(' ' + lowerAlias) ||
          cleanedHeading.includes(lowerAlias)
        );
      });

      if (isMatch) {
        matches.push({
          type: secType,
          rawTitle: trimmed,
          charStart: lineStartOffset,
          contentStart: currentOffset,
        });
        break;
      }
    }
  }

  if (matches.length === 0) {
    return [
      {
        type: 'unknown',
        rawTitle: 'Document Body',
        content: resumeText,
        charStart: 0,
        charEnd: resumeText.length,
      },
    ];
  }

  const sections: ParsedSection[] = [];

  // Preamble before first section (contact/summary)
  if (matches[0].charStart > 0) {
    const preamble = resumeText.slice(0, matches[0].charStart).trim();
    if (preamble.length > 0) {
      sections.push({
        type: 'summary',
        rawTitle: 'Contact & Header',
        content: preamble,
        charStart: 0,
        charEnd: matches[0].charStart,
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const next = matches[i + 1];
    const charEnd = next ? next.charStart : resumeText.length;
    const content = resumeText.slice(curr.contentStart, charEnd).trim();

    sections.push({
      type: curr.type,
      rawTitle: curr.rawTitle,
      content,
      charStart: curr.charStart,
      charEnd,
    });
  }

  return sections;
}
