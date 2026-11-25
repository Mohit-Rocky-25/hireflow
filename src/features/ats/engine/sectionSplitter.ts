// ============================================================
// ATS Resume Roaster — Enhanced Section Splitter (Stage 3/4 / Phase 10.2)
// Robust contextual section recognition supporting standard,
// nonstandard, multi-column pipe tables, inline headings,
// duplicate, and unknown resume headings with exact source locators.
// ============================================================

import sectionHeadingsData from '../knowledge/section-headings.json';
import { ParsedSection } from './types';
import { SourceLocator, buildLineOffsets, offsetToLineNumber } from './sourceLocator';

export interface EnhancedParsedSection extends ParsedSection {
  sectionId: string;
  isDuplicate?: boolean;
  duplicateIndex?: number;
  confidence: number;
  locator?: SourceLocator;
}

// Known non-standard and domain headings mapped to semantic types
const EXTENDED_SECTION_MAP: Record<string, string> = {
  // Experience variants
  'selected engineering work': 'experience',
  'representative production systems': 'experience',
  'key contributions': 'experience',
  'selected experience': 'experience',
  'engineering achievements': 'experience',
  'work history': 'experience',
  'employment history': 'experience',
  'career history': 'experience',
  'professional background': 'experience',
  'relevant experience': 'experience',
  'previous roles': 'experience',
  'prior roles': 'experience',
  'prior experience': 'experience',
  'earlier experience': 'experience',
  'additional experience': 'experience',
  'other experience': 'experience',
  'internships': 'experience',
  'internship experience': 'experience',
  'work & internships': 'experience',

  // Project variants
  'technical portfolio': 'projects',
  'open source contributions': 'projects',
  'key projects': 'projects',
  'selected projects': 'projects',
  'notable projects': 'projects',
  'personal projects': 'projects',
  'academic projects': 'projects',
  'software projects': 'projects',
  'project summary': 'projects',
  'additional projects': 'projects',
  'other projects': 'projects',
  'side projects': 'projects',

  // Research & Publications
  'research experience': 'experience',
  'research': 'achievements',
  'publications': 'achievements',

  // Leadership & Activities
  'leadership and activities': 'achievements',
  'leadership': 'achievements',
  'volunteering': 'achievements',
  'awards and honors': 'achievements',
  'honors & awards': 'achievements',
  'hackathons': 'achievements',

  // Summary variants
  'career objective': 'summary',
  'objective': 'summary',
  'professional summary': 'summary',
  'about me': 'summary',
  'executive summary': 'summary',
  'personal profile': 'summary',
  'profile': 'summary',
  'profile / summary': 'summary',
  'summary / profile': 'summary',

  // Skills variants
  'core competencies': 'skills',
  'technical skills': 'skills',
  'technologies': 'skills',
  'tech stack': 'skills',
  'skills & tools': 'skills',
  'tools & technologies': 'skills',
  'areas of expertise': 'skills',
  'programming skills': 'skills',
  'core skills': 'skills',
  'technical expertise': 'skills',
  'technical proficiencies': 'skills',
  'technical competencies': 'skills',
  'additional skills': 'skills',
  'other skills': 'skills',
  'skills & expertise': 'skills',

  // Education & Certifications
  'academic background': 'education',
  'academic qualifications': 'education',
  'educational background': 'education',
  'education & credentials': 'education',
  'education & training': 'education',
  'academic credentials': 'education',
  'licenses & certifications': 'certifications',
  'professional certifications': 'certifications',
  'courses & certifications': 'certifications',
};

const COMPANY_SUFFIX_REGEX =
  /\b(?:technologies|systems|analytics|solutions|labs|corp|corporation|inc|llc|ltd|limited|group|partners|ventures|consulting|services|industries|enterprises|networks|studio|studios|digital|global|infotech|fintech)\b$/i;

const DATE_OR_RANGE_REGEX =
  /\b(?:19|20)\d{2}\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*(?:19|20)\d{2}\b|\b(?:present|current|ongoing)\b/i;

const LOCATION_REGEX = /,\s*(?:[A-Z]{2}|India|Canada|UK|USA|Germany|Singapore)\b/;

const HORIZONTAL_DIVIDER_REGEX = /^[=\-_~*#]{4,}$/;

const INLINE_SECTION_ALLOWED_LABELS = new Set([
  'summary',
  'professional summary',
  'executive summary',
  'career objective',
  'objective',
  'profile',
  'about me',
  'personal profile',
  'experience',
  'work experience',
  'professional experience',
  'employment history',
  'education',
  'projects',
  'certifications',
  'skills',
  'technical skills',
  'core skills',
]);

const QUALIFIER_PREFIX_REGEX =
  /^(?:my|relevant|professional|technical|work|key|selected|core|additional|other|summary of)\s+/i;

function cleanHeadingLabel(raw: string): string {
  return raw
    .trim()
    .replace(/^[#*\-•▪●\s]+/, '')
    .replace(/^(?:\d+|[IVXLCDMivxlcdm]+)[.:\-)\]]\s*/, '')
    .replace(/^\d+\s+/, '')
    .replace(/[=:|_\-\s]+$/, '')
    .replace(/^[=:|_\-\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function matchKnownHeadingType(
  rawText: string,
  options?: { allowCompanySuffixExactOnly?: boolean }
): { type: string; confidence: number } | null {
  const cleaned = cleanHeadingLabel(rawText);
  if (!cleaned || cleaned.length < 2) return null;

  // Reject employer names ending in Technologies/Systems/Analytics/Solutions unless exact alias
  const isExactExtended = Boolean(EXTENDED_SECTION_MAP[cleaned]);
  const sectionsConfig = sectionHeadingsData.sections as Record<string, string[]>;

  if (isExactExtended) {
    return { type: EXTENDED_SECTION_MAP[cleaned], confidence: 0.95 };
  }

  for (const [secType, aliases] of Object.entries(sectionsConfig)) {
    if (aliases.some(a => cleaned === a.toLowerCase())) {
      return { type: secType, confidence: 0.92 };
    }
  }

  if (options?.allowCompanySuffixExactOnly !== false && COMPANY_SUFFIX_REGEX.test(cleaned)) {
    return null;
  }

  // Strip a single known qualifier prefix (e.g. "relevant work experience" -> "work experience")
  const strippedQualifier = cleaned.replace(QUALIFIER_PREFIX_REGEX, '').trim();
  if (strippedQualifier && strippedQualifier !== cleaned) {
    if (EXTENDED_SECTION_MAP[strippedQualifier]) {
      return { type: EXTENDED_SECTION_MAP[strippedQualifier], confidence: 0.9 };
    }
    for (const [secType, aliases] of Object.entries(sectionsConfig)) {
      if (aliases.some(a => strippedQualifier === a.toLowerCase())) {
        return { type: secType, confidence: 0.88 };
      }
    }
  }

  // Allow compound headings joined by "&" or "/" or "and" where at least one half is exact and total <= 4 words
  const words = cleaned.split(/\s+/);
  if (words.length <= 4) {
    for (const [secType, aliases] of Object.entries(sectionsConfig)) {
      const hasKnownCompound = aliases.some(alias => {
        const lowerAlias = alias.toLowerCase();
        return (
          cleaned === lowerAlias ||
          cleaned.startsWith(lowerAlias + ' & ') ||
          cleaned.startsWith(lowerAlias + ' and ') ||
          cleaned.startsWith(lowerAlias + ' / ') ||
          cleaned.endsWith(' & ' + lowerAlias) ||
          cleaned.endsWith(' and ' + lowerAlias) ||
          cleaned.endsWith(' / ' + lowerAlias)
        );
      });
      if (hasKnownCompound) {
        return { type: secType, confidence: 0.88 };
      }
    }
  }

  // Bilingual or parenthesized headings like "कौशल (Skills):" or "अनुभव और प्रोजेक्ट (Experience & Projects):"
  const parenMatch = /\(([^()]{2,45})\)/.exec(cleaned);
  if (parenMatch && parenMatch[1]) {
    const innerMatch = matchKnownHeadingType(parenMatch[1], options);
    if (innerMatch) {
      return { type: innerMatch.type, confidence: Math.min(innerMatch.confidence, 0.9) };
    }
  }

  return null;
}

function isDisqualifiedStandaloneHeading(rawLine: string, nextLine: string): boolean {
  const trimmed = rawLine.trim();
  if (!trimmed || trimmed.length > 55) return true;
  if (HORIZONTAL_DIVIDER_REGEX.test(trimmed)) return true;
  if (/^[*\-•▪●]\s+/.test(trimmed)) return true;
  if (trimmed.includes('@') || /https?:\/\/|www\./i.test(trimmed)) return true;
  if (DATE_OR_RANGE_REGEX.test(trimmed)) return true;
  if (LOCATION_REGEX.test(trimmed)) return true;
  if (trimmed.endsWith('.')) return true;

  // Reject single-pipe role/contact headers like "Software Engineer | Point72" or "Google | Mountain View"
  const innerPipes = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  if (innerPipes.includes('|')) return true;

  // If next line starts with a date range or has a date range, this line is likely a company/role header
  if (nextLine && DATE_OR_RANGE_REGEX.test(nextLine) && !matchKnownHeadingType(trimmed)) {
    return true;
  }

  return false;
}

interface TwoColumnHeaderMatch {
  leftType: string;
  leftTitle: string;
  rightType: string;
  rightTitle: string;
  colSplitIdx: number;
  leftContentOffsetInLine: number;
  rightContentOffsetInLine: number;
}

function detectTwoColumnHeader(rawLine: string): TwoColumnHeaderMatch | null {
  const trimmed = rawLine.trim();
  if (!trimmed.includes('|')) return null;
  if (trimmed.includes('@') || /https?:\/\/|www\./i.test(trimmed)) return null;
  if (DATE_OR_RANGE_REGEX.test(trimmed)) return null;

  const leadingOffset = rawLine.startsWith('|') ? 1 : 0;
  const trailingIdx = rawLine.trimEnd().endsWith('|') ? rawLine.trimEnd().length - 1 : rawLine.length;

  // Find interior pipe indices
  const interiorPipes: number[] = [];
  for (let idx = leadingOffset; idx < trailingIdx; idx++) {
    if (rawLine[idx] === '|') interiorPipes.push(idx);
  }
  if (interiorPipes.length !== 1) return null;

  const splitIdx = interiorPipes[0];
  const leftRaw = rawLine.slice(leadingOffset, splitIdx).trim();
  const rightRaw = rawLine.slice(splitIdx + 1, trailingIdx).trim();
  if (!leftRaw || !rightRaw) return null;

  const leftMatch = matchKnownHeadingType(leftRaw);
  const rightMatch = matchKnownHeadingType(rightRaw);
  if (!leftMatch || !rightMatch) return null;

  return {
    leftType: leftMatch.type,
    leftTitle: leftRaw,
    rightType: rightMatch.type,
    rightTitle: rightRaw,
    colSplitIdx: splitIdx,
    leftContentOffsetInLine: leadingOffset,
    rightContentOffsetInLine: splitIdx + 1,
  };
}

function splitPipeTableRow(rawLine: string, colSplitIdx: number): { left: string; right: string } | null {
  const trimmed = rawLine.trim();
  if (!trimmed || HORIZONTAL_DIVIDER_REGEX.test(trimmed)) return null;
  if (!trimmed.includes('|')) return null;

  const leadingOffset = rawLine.startsWith('|') ? 1 : 0;
  const trailingIdx = rawLine.trimEnd().endsWith('|') && rawLine.trimEnd().length - 1 > leadingOffset
    ? rawLine.trimEnd().length - 1
    : rawLine.length;

  const interiorPipes: number[] = [];
  for (let idx = leadingOffset; idx < trailingIdx; idx++) {
    if (rawLine[idx] === '|') interiorPipes.push(idx);
  }
  if (interiorPipes.length === 0) return null;

  // Pick the interior pipe closest to colSplitIdx (handles interior pipes inside cells like "Software Engineer | Point72")
  let bestPipe = interiorPipes[0];
  let bestDist = Math.abs(bestPipe - colSplitIdx);
  for (const p of interiorPipes) {
    const dist = Math.abs(p - colSplitIdx);
    if (dist < bestDist) {
      bestDist = dist;
      bestPipe = p;
    }
  }

  const left = rawLine.slice(leadingOffset, bestPipe).trim();
  const right = rawLine.slice(bestPipe + 1, trailingIdx).trim();
  return { left, right };
}

interface SegmentBuilder {
  type: string;
  rawTitle: string;
  charStart: number;
  charEnd: number;
  contentStart?: number;
  confidence: number;
  explicitContent?: string;
}

/**
 * Splits plain text resume into detected sections with exact character ranges,
 * handling standard, non-standard, multi-column pipe tables, inline headings,
 * duplicate, and unknown headings.
 */
export function splitResumeSections(
  resumeText: string,
  options?: { documentId?: string }
): EnhancedParsedSection[] {
  const lineOffsets = buildLineOffsets(resumeText);
  const lines = resumeText.split(/\r?\n/);

  const segments: SegmentBuilder[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineStartOffset = lineOffsets[i];
    const nextLineStartOffset = i + 1 < lineOffsets.length ? lineOffsets[i + 1] : resumeText.length;

    if (!trimmed || HORIZONTAL_DIVIDER_REGEX.test(trimmed)) {
      i++;
      continue;
    }

    // 1. Check 2-column pipe table header (e.g. "| CORE SKILLS | WORK EXPERIENCE")
    const twoCol = detectTwoColumnHeader(rawLine);
    if (twoCol) {
      const leftLines: string[] = [];
      const rightLines: string[] = [];
      let leftFirstOffset: number | null = null;
      let rightFirstOffset: number | null = null;
      let blockEndOffset = nextLineStartOffset;

      let j = i + 1;
      while (j < lines.length) {
        const rowRaw = lines[j];
        const rowTrimmed = rowRaw.trim();
        const rowStartOffset = lineOffsets[j];
        const rowEndOffset = j + 1 < lineOffsets.length ? lineOffsets[j + 1] : resumeText.length;

        if (!rowTrimmed || HORIZONTAL_DIVIDER_REGEX.test(rowTrimmed)) {
          if (HORIZONTAL_DIVIDER_REGEX.test(rowTrimmed)) {
            blockEndOffset = rowEndOffset;
            j++;
          }
          break;
        }
        if (detectTwoColumnHeader(rowRaw)) {
          break;
        }
        const split = splitPipeTableRow(rowRaw, twoCol.colSplitIdx);
        if (!split) {
          break;
        }

        if (split.left) {
          if (leftFirstOffset === null) {
            const localIdx = rowRaw.indexOf(split.left);
            leftFirstOffset = rowStartOffset + (localIdx >= 0 ? localIdx : 0);
          }
          leftLines.push(split.left);
        }
        if (split.right) {
          if (rightFirstOffset === null) {
            const localIdx = rowRaw.indexOf(split.right, twoCol.colSplitIdx);
            rightFirstOffset = rowStartOffset + (localIdx >= 0 ? localIdx : twoCol.colSplitIdx);
          }
          rightLines.push(split.right);
        }

        blockEndOffset = rowEndOffset;
        j++;
      }

      if (leftLines.length > 0) {
        segments.push({
          type: twoCol.leftType,
          rawTitle: twoCol.leftTitle,
          charStart: leftFirstOffset ?? lineStartOffset,
          charEnd: blockEndOffset,
          confidence: 0.92,
          explicitContent: leftLines.join('\n'),
        });
      }
      if (rightLines.length > 0) {
        segments.push({
          type: twoCol.rightType,
          rawTitle: twoCol.rightTitle,
          charStart: rightFirstOffset ?? (lineStartOffset + twoCol.rightContentOffsetInLine),
          charEnd: blockEndOffset,
          confidence: 0.92,
          explicitContent: rightLines.join('\n'),
        });
      }

      i = j;
      continue;
    }

    // 2. Check inline "|? HEADER: body" prefix (e.g. "| SUMMARY: Software Engineer with 3.5 years...")
    const inlineMatch = trimmed.match(/^(\|?)\s*([A-Za-z][A-Za-z\s&/]{1,35}?)\s*:\s+(.+)$/);
    if (inlineMatch) {
      const hasLeadingPipe = inlineMatch[1] === '|';
      const labelRaw = inlineMatch[2].trim();
      const bodyRaw = inlineMatch[3].trim();
      const lowerLabel = cleanHeadingLabel(labelRaw);
      const insideSkillsSection = segments.length > 0 && segments[segments.length - 1].type === 'skills';

      if (
        (hasLeadingPipe || (!insideSkillsSection && INLINE_SECTION_ALLOWED_LABELS.has(lowerLabel))) &&
        !COMPANY_SUFFIX_REGEX.test(lowerLabel)
      ) {
        const known = matchKnownHeadingType(labelRaw);
        if (known) {
          const bodyLocalOffset = rawLine.indexOf(bodyRaw);
          const contentStart = lineStartOffset + (bodyLocalOffset >= 0 ? bodyLocalOffset : 0);
          segments.push({
            type: known.type,
            rawTitle: labelRaw,
            charStart: lineStartOffset,
            charEnd: nextLineStartOffset,
            contentStart,
            confidence: known.confidence,
          });
          i++;
          continue;
        }
      }
    }

    // 3. Standalone heading detection
    const nextLine = lines[i + 1]?.trim() || '';
    if (!isDisqualifiedStandaloneHeading(rawLine, nextLine)) {
      const known = matchKnownHeadingType(trimmed);
      if (known) {
        segments.push({
          type: known.type,
          rawTitle: trimmed,
          charStart: lineStartOffset,
          charEnd: resumeText.length,
          contentStart: nextLineStartOffset,
          confidence: known.confidence,
        });
        i++;
        continue;
      }

      // 4. Fallback: unknown uppercase section header (e.g. "PATENTS AND INVENTIONS"), guarded against company names
      const words = trimmed.split(/\s+/);
      if (
        /^[A-Z][A-Z\s&/]{2,34}$/.test(trimmed) &&
        words.length <= 4 &&
        i > 0 &&
        nextLine.length > 0 &&
        !COMPANY_SUFFIX_REGEX.test(trimmed) &&
        !DATE_OR_RANGE_REGEX.test(nextLine)
      ) {
        segments.push({
          type: 'unknown',
          rawTitle: trimmed,
          charStart: lineStartOffset,
          charEnd: resumeText.length,
          contentStart: nextLineStartOffset,
          confidence: 0.6,
        });
      }
    }

    i++;
  }

  // Handle case where no recognizable headers exist
  if (segments.length === 0) {
    const singleLoc: SourceLocator = {
      documentId: options?.documentId,
      charStart: 0,
      charEnd: resumeText.length,
      lineStart: 1,
      lineEnd: offsetToLineNumber(Math.max(0, resumeText.length - 1), lineOffsets),
      sectionId: 'sec_unknown_0',
    };
    return [
      {
        sectionId: 'sec_unknown_0',
        type: 'unknown',
        rawTitle: 'Document Body',
        content: resumeText,
        charStart: 0,
        charEnd: resumeText.length,
        confidence: 0.5,
        locator: singleLoc,
      },
    ];
  }

  const sections: EnhancedParsedSection[] = [];
  const headingCounts = new Map<string, number>();

  // Extract preamble (Contact & Header) before first recognized segment
  const firstSegmentStart = segments[0].charStart;
  if (firstSegmentStart > 0) {
    const preambleLines = resumeText
      .slice(0, firstSegmentStart)
      .split(/\r?\n/)
      .filter(l => !HORIZONTAL_DIVIDER_REGEX.test(l.trim()))
      .join('\n')
      .trim();

    if (preambleLines.length > 0) {
      const loc: SourceLocator = {
        documentId: options?.documentId,
        charStart: 0,
        charEnd: firstSegmentStart,
        lineStart: 1,
        lineEnd: offsetToLineNumber(Math.max(0, firstSegmentStart - 1), lineOffsets),
        sectionId: 'sec_summary_header',
      };
      sections.push({
        sectionId: 'sec_summary_header',
        type: 'summary',
        rawTitle: 'Contact & Header',
        content: preambleLines,
        charStart: 0,
        charEnd: firstSegmentStart,
        confidence: 0.9,
        locator: loc,
      });
      headingCounts.set('summary', 1);
    }
  }

  for (let idx = 0; idx < segments.length; idx++) {
    const curr = segments[idx];
    const next = segments[idx + 1];

    let charEnd = curr.explicitContent !== undefined ? curr.charEnd : (next ? next.charStart : resumeText.length);
    if (curr.explicitContent === undefined && next && curr.charEnd < next.charStart) {
      // Inline section ends at next segment boundary (may span trailing lines before next heading)
      charEnd = next.charStart;
    }

    const rawSlice =
      curr.explicitContent !== undefined
        ? curr.explicitContent
        : resumeText.slice(curr.contentStart ?? curr.charStart, charEnd);

    const content = rawSlice
      .split(/\r?\n/)
      .filter(l => !HORIZONTAL_DIVIDER_REGEX.test(l.trim()))
      .join('\n')
      .trim();

    const seenCount = headingCounts.get(curr.type) || 0;
    const isDuplicate = seenCount > 0;
    headingCounts.set(curr.type, seenCount + 1);

    const sectionId = `sec_${curr.type}_${seenCount}`;
    const loc: SourceLocator = {
      documentId: options?.documentId,
      charStart: curr.charStart,
      charEnd,
      lineStart: offsetToLineNumber(curr.charStart, lineOffsets),
      lineEnd: offsetToLineNumber(Math.max(curr.charStart, charEnd - 1), lineOffsets),
      sectionId,
    };

    sections.push({
      sectionId,
      type: curr.type,
      rawTitle: curr.rawTitle,
      content,
      charStart: curr.charStart,
      charEnd,
      confidence: curr.confidence,
      isDuplicate,
      duplicateIndex: isDuplicate ? seenCount : undefined,
      locator: loc,
    });
  }

  return sections;
}
