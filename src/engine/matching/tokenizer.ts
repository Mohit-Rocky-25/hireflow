// ============================================================
// HireFlow v3 — Technology Tokenizer & Skill Extractor (R4.3)
// Longest-match-first, word-boundary preservation & ambiguity gates
// ============================================================

import { CANONICAL_SKILLS, SkillDefinition } from '../../data/skills';

export interface TokenSpanMatch {
  skill: SkillDefinition;
  matchedAlias: string;
  spanStart: number;
  spanEnd: number;
  surroundingContext: string;
  isAmbiguousResolved: boolean;
}

// Build pre-sorted alias lookup list (longest aliases first to prevent partial truncation)
interface AliasLookupItem {
  alias: string;
  normalizedAlias: string;
  skill: SkillDefinition;
  isSymbol: boolean;
}

const LOOKUP_TABLE: AliasLookupItem[] = (() => {
  const items: AliasLookupItem[] = [];

  for (const skill of CANONICAL_SKILLS) {
    const allNames = [skill.canonical, ...skill.aliases];
    for (const name of allNames) {
      const clean = name.trim();
      if (!clean) continue;
      const isSymbol = /[+#./-]/.test(clean);
      items.push({
        alias: clean,
        normalizedAlias: clean.toLowerCase(),
        skill,
        isSymbol,
      });
    }
  }

  // Sort descending by character length (longest matches first)
  return items.sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);
})();

/**
 * Scans text and extracts all verified technology skill occurrences.
 * Handles preserved symbols (c++, c#, .net, ci/cd, node.js) and disambiguates risky tokens.
 */
export function extractSkillsFromText(
  text: string,
  sectionName = ''
): TokenSpanMatch[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const matchedSpans: { start: number; end: number }[] = [];
  const results: TokenSpanMatch[] = [];

  const isSkillsSection = /skill|technolog|stack|tool|expertise|requirement|qualification|what\s+you'?ll\s+need|must\s+have/i.test(sectionName);

  for (const item of LOOKUP_TABLE) {
    const aliasLower = item.normalizedAlias;
    let searchIndex = 0;

    while (searchIndex < lowerText.length) {
      const foundPos = lowerText.indexOf(aliasLower, searchIndex);
      if (foundPos === -1) break;

      const spanEnd = foundPos + aliasLower.length;
      searchIndex = spanEnd;

      // 1. Check for overlap with already matched longer token (e.g. "React.js" matches before "React")
      const overlaps = matchedSpans.some(
        (span) => Math.max(span.start, foundPos) < Math.min(span.end, spanEnd)
      );
      if (overlaps) continue;

      // 2. Word boundary checks
      const charBefore = foundPos > 0 ? lowerText[foundPos - 1] : ' ';
      const charAfter = spanEnd < lowerText.length ? lowerText[spanEnd] : ' ';

      // For alphanumeric tokens without symbols, ensure clean word boundary
      const isWordChar = (c: string) => /[a-z0-9_]/i.test(c);

      // Special handling for tokens ending with '+' or '#' (like c++, c#)
      const endsWithSymbol = /[+#]/.test(item.alias);
      const startsWithDot = item.alias.startsWith('.');

      if (!startsWithDot && isWordChar(charBefore)) {
        continue;
      }
      if (!endsWithSymbol && isWordChar(charAfter)) {
        continue;
      }

      // 3. Ambiguity Context Gate (R4.3)
      // Tokens like "Go", "C", "R", "Rust", "Swift", "Spring", "Express" require context words or Skills section
      let isAmbiguousResolved = true;
      if (item.skill.isAmbiguous) {
        if (!isSkillsSection) {
          // Check bounded context window (+/- 140 chars)
          const windowStart = Math.max(0, foundPos - 140);
          const windowEnd = Math.min(lowerText.length, spanEnd + 140);
          const contextSlice = lowerText.slice(windowStart, windowEnd);

          const required = item.skill.requiredContext || [];
          const hasRequiredContext = required.some((req) =>
            contextSlice.includes(req.toLowerCase())
          );

          if (!hasRequiredContext) {
            isAmbiguousResolved = false;
            continue; // Skip ambiguous token that lacks required domain context
          }
        }
      }

      // Valid match confirmed
      matchedSpans.push({ start: foundPos, end: spanEnd });

      const contextStart = Math.max(0, foundPos - 60);
      const contextEnd = Math.min(text.length, spanEnd + 60);

      results.push({
        skill: item.skill,
        matchedAlias: text.slice(foundPos, spanEnd),
        spanStart: foundPos,
        spanEnd,
        surroundingContext: text.slice(contextStart, contextEnd),
        isAmbiguousResolved,
      });
    }
  }

  // Return sorted by start position
  return results.sort((a, b) => a.spanStart - b.spanStart);
}
