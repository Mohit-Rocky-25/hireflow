// ============================================================
// Candidate Profile — Evidence Ladder (Stage 1.3)
// Deterministic 0-4 evidence tiering with verbatim spans
// ============================================================

import { EvidenceLevel, EvidenceSpan } from './types';

export const METRIC_REGEX =
  /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d{3})*\s*(?:users|requests|qps|tps|transactions|dau|mau|records|clients)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

export const LINK_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/[a-zA-Z0-9_\-\.\/]+|gitlab\.com\/[a-zA-Z0-9_\-\.\/]+|[a-zA-Z0-9_\-\.]+\.(?:io|dev|app|me|com)(?:\/[^\s,)]+)?)/i;

export interface SectionInput {
  type: 'skills' | 'experience' | 'projects' | 'education' | 'summary' | 'other';
  content: string;
  bullets?: string[];
  links?: string[];
}

export interface SkillMatchInput {
  id: string;
  displayName: string;
  aliases: string[];
  matchTier: 'exact' | 'alias' | 'implied' | 'related';
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a word-boundary regex for a skill alias/name.
 */
function buildTokenRegex(token: string): RegExp {
  const escaped = escapeRegex(token.trim());
  return new RegExp(`(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`, 'i');
}

/**
 * Deterministically grades a skill across resume sections.
 * Returns { level, spans } where level is 0..4 and spans are up to 3 best verbatim spans.
 */
export function gradeSkill(
  skill: SkillMatchInput,
  sections: SectionInput[],
  rawResumeText: string
): { level: EvidenceLevel; spans: EvidenceSpan[] } {
  // Taxonomy-implied only (not explicitly mentioned in text) gets level 0
  if (skill.matchTier === 'implied') {
    return { level: 0, spans: [] };
  }

  const allTokens = [skill.displayName, ...skill.aliases];
  const uniqueTokens = Array.from(new Set(allTokens.filter(Boolean)));
  const collectedSpans: { span: EvidenceSpan; level: EvidenceLevel }[] = [];

  for (const section of sections) {
    const sectionType = section.type;
    const content = section.content;
    const bullets = section.bullets && section.bullets.length > 0
      ? section.bullets
      : content.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const bullet of bullets) {
      for (const token of uniqueTokens) {
        const regex = buildTokenRegex(token);
        if (regex.test(bullet)) {
          const hasMetric = METRIC_REGEX.test(bullet);
          const hasDirectLink = LINK_REGEX.test(bullet);
          const hasSectionLink = Boolean(section.links && section.links.length > 0);
          const hasLink = hasDirectLink || hasSectionLink;

          // Compute level for this occurrence
          let occLevel: EvidenceLevel = 1;
          if (sectionType === 'skills') {
            occLevel = 1;
          } else if (sectionType === 'projects' || sectionType === 'experience') {
            if (hasLink) {
              occLevel = 4;
            } else if (hasMetric) {
              occLevel = 3;
            } else {
              occLevel = 2;
            }
          } else {
            // summary or education or other
            occLevel = hasMetric ? 3 : 2;
          }

          // Locate verbatim start and end in rawResumeText if possible
          let start = rawResumeText.indexOf(bullet);
          let end = start >= 0 ? start + bullet.length : 0;
          if (start < 0) {
            // Find token in rawResumeText
            const tokenIdx = rawResumeText.toLowerCase().indexOf(token.toLowerCase());
            start = Math.max(0, tokenIdx);
            end = start + token.length;
          }

          collectedSpans.push({
            span: {
              section: sectionType,
              text: bullet,
              start,
              end,
              hasMetric,
              hasLink,
            },
            level: occLevel,
          });
          break; // Avoid duplicate spans for multiple aliases in same bullet
        }
      }
    }
  }

  if (collectedSpans.length === 0) {
    // If not matched in discrete sections, check if mentioned in rawResumeText
    for (const token of uniqueTokens) {
      const regex = buildTokenRegex(token);
      if (regex.test(rawResumeText)) {
        return {
          level: 1,
          spans: [
            {
              section: 'other',
              text: token,
              start: rawResumeText.indexOf(token),
              end: rawResumeText.indexOf(token) + token.length,
              hasMetric: false,
              hasLink: false,
            },
          ],
        };
      }
    }
    return { level: 0, spans: [] };
  }

  // Highest level achieved
  const maxLevel = Math.max(...collectedSpans.map((s) => s.level)) as EvidenceLevel;

  // Deduplicate spans by text
  const seenTexts = new Set<string>();
  const uniqueSpans = collectedSpans.filter((s) => {
    if (seenTexts.has(s.span.text)) return false;
    seenTexts.add(s.span.text);
    return true;
  });

  // Sort: prefer highest level, then shortest text
  uniqueSpans.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.span.text.length - b.span.text.length;
  });

  const bestSpans = uniqueSpans.slice(0, 3).map((s) => s.span);

  return {
    level: maxLevel,
    spans: bestSpans,
  };
}
