// ============================================================
// Tailor Engine — Inline Segmenter for Flat & Structured Resumes
// ============================================================

import { RecoveredSection, SectionKind } from './types';
import { findHeadingOccurrences, matchExactHeadingLine, HeadingMatch } from './headingDict';

/**
 * Segments flat or run-on resume text into structured sections.
 * Handles both line-broken and single-paragraph flattened inputs.
 */
export function segmentResumeText(rawText: string): RecoveredSection[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Strategy A: If text already has line breaks, check line-by-line first
  const lineSections: RecoveredSection[] = [];
  let currentKind: SectionKind = 'header';
  let currentCanonical = 'Contact Header';
  let currentRaw = 'Header';
  let currentContentLines: string[] = [];
  let detectedSectionsCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingDef = matchExactHeadingLine(line);

    if (headingDef && i > 0) {
      // Save previous section
      if (currentContentLines.length > 0) {
        lineSections.push({
          kind: currentKind,
          canonicalTitle: currentCanonical,
          rawTitle: currentRaw,
          content: currentContentLines.join('\n'),
          confidence: 0.95
        });
      }
      currentKind = headingDef.kind;
      currentCanonical = headingDef.canonicalTitle;
      currentRaw = line;
      currentContentLines = [];
      detectedSectionsCount++;
    } else {
      currentContentLines.push(line);
    }
  }

  if (currentContentLines.length > 0) {
    lineSections.push({
      kind: currentKind,
      canonicalTitle: currentCanonical,
      rawTitle: currentRaw,
      content: currentContentLines.join('\n'),
      confidence: 0.95
    });
  }

  // If Strategy A found at least 2 distinct sections, return it!
  if (detectedSectionsCount >= 2) {
    return lineSections;
  }

  // Strategy B: Inline segmenter for run-on / flattened text (e.g. PDF flattening)
  const matches = findHeadingOccurrences(text);

  // If no heading matches found, return entire text as unsegmented header/body
  if (matches.length === 0) {
    return [
      {
        kind: 'header',
        canonicalTitle: 'Contact Header',
        rawTitle: 'Header',
        content: text,
        confidence: 0.3
      }
    ];
  }

  const sections: RecoveredSection[] = [];

  // 1. Text before the first heading is the Header
  const firstMatch = matches[0];
  if (firstMatch.index > 0) {
    const headerContent = text.substring(0, firstMatch.index).trim();
    if (headerContent) {
      sections.push({
        kind: 'header',
        canonicalTitle: 'Contact Header',
        rawTitle: 'Header',
        content: headerContent,
        confidence: 0.9
      });
    }
  }

  // 2. Extract content between consecutive heading matches
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];

    const contentStart = cur.index + cur.length;
    const contentEnd = next ? next.index : text.length;

    let content = text.substring(contentStart, contentEnd).trim();
    // Strip leading colon or punctuation from content
    content = content.replace(/^[:\-–•*]\s*/, '').trim();

    // Calculate boundary confidence
    let confidence = 0.85;
    // Preceded by boundary punctuation
    const charBefore = cur.index > 0 ? text.charAt(cur.index - 1) : '';
    if (/[\n.!?•\-]/.test(charBefore)) confidence += 0.1;
    // If content is very short (< 3 words) or overly long, adjust
    if (content.split(/\s+/).length < 2) confidence -= 0.3;

    sections.push({
      kind: cur.kind,
      canonicalTitle: cur.canonicalTitle,
      rawTitle: cur.matchedAlias,
      content,
      confidence: Math.min(1.0, Math.max(0.2, Math.round(confidence * 100) / 100))
    });
  }

  return sections;
}
