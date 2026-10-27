// ============================================================
// HireFlow ATS Engine — extractSkills
// High-precision token-boundary skill extraction with ambiguity
// handling, evidence tiering, and non-overlapping span resolution.
// ============================================================

import { TaxonomySkill, SkillMention, MentionEvidenceTier } from './types';
import skillsTaxonomyData from '../../data/ats/skills-taxonomy.json';

const TAXONOMY: TaxonomySkill[] = skillsTaxonomyData as TaxonomySkill[];

export interface SearchEntry {
  token: string;
  lowerToken: string;
  canonicalId: string;
  category: string;
  ambiguity?: TaxonomySkill['ambiguity'];
  length: number;
}

// Pre-build index of search tokens sorted by length descending (longest match first)
const SEARCH_ENTRIES: SearchEntry[] = [];
for (const skill of TAXONOMY) {
  const tokens = new Set<string>();
  tokens.add(skill.canonical);
  for (const alias of skill.aliases || []) {
    tokens.add(alias);
  }

  for (const token of tokens) {
    if (!token || token.trim().length === 0) continue;
    SEARCH_ENTRIES.push({
      token: token.trim(),
      lowerToken: token.trim().toLowerCase(),
      canonicalId: skill.canonical,
      category: skill.category,
      ambiguity: skill.ambiguity,
      length: token.trim().length,
    });
  }
}

// Sort longest match first so compounds ("React Native") take precedence over parts ("React")
SEARCH_ENTRIES.sort((a, b) => b.length - a.length);

const ACTION_VERBS = new Set([
  'built', 'developed', 'engineered', 'implemented', 'designed', 'created',
  'optimized', 'scaled', 'architected', 'maintained', 'deployed', 'automated',
  'spearheaded', 'refactored', 'migrated', 'configured', 'integrated', 'delivered',
  'orchestrated', 'authored', 'managed', 'debugged', 'tested', 'wrote', 'programmed',
  'productionized', 'established', 'streamlined', 'cut', 'reduced', 'increased', 'boosted'
]);

const NEGATION_PATTERNS = [
  /\b(?:no|zero|little\s+to\s+no|without|lack\s+of|lacking)\s+(?:prior\s+|hands-on\s+)?(?:experience\s+with|knowledge\s+of|exposure\s+to)\b/i,
  /\b(?:not\s+proficient\s+in|not\s+familiar\s+with|never\s+worked\s+with|never\s+used|haven't\s+worked\s+with|haven't\s+used|have\s+not\s+used|did\s+not\s+use|didn't\s+use)\b/i,
  /\b(?:seeking\s+to\s+learn|looking\s+to\s+learn|want\s+to\s+learn|eager\s+to\s+learn|interested\s+in\s+learning)\b/i,
  /\b(?:without|excluding)\b/i,
];

const HEDGE_PATTERNS = [
  /\b(?:familiar\s+with|exposure\s+to|basic\s+knowledge\s+of|working\s+knowledge\s+of|elementary|learning|beginner\s+in)\b/i,
  /\b(?:basic|elementary|fundamental\s+understanding\s+of)\b/i,
];

/**
 * Checks whether token match at [start, end] in text is bounded properly.
 */
function isTokenBounded(text: string, start: number, end: number, tokenLower: string): boolean {
  // Preceding character check
  if (start > 0) {
    const prevChar = text[start - 1];
    // Alphanumeric character immediately before is invalid boundary
    if (/[a-zA-Z0-9]/.test(prevChar)) return false;
    // Don't match inside URLs or emails
    if (prevChar === '@' || prevChar === '/') {
      const precedingSlice = text.slice(Math.max(0, start - 10), start);
      if (/@|https?:\/\/|www\./.test(precedingSlice)) return false;
    }
  }

  // Following character check
  if (end < text.length) {
    const nextChar = text[end];
    // Alphanumeric immediately after is invalid
    if (/[a-zA-Z0-9]/.test(nextChar)) return false;

    // Special cases for C, C++, C#
    if (tokenLower === 'c') {
      if (nextChar === '+' || nextChar === '#') return false;
    }
    if (tokenLower === 'c++' || tokenLower === 'cpp') {
      if (nextChar === '+') return false;
    }

    // Inside email/domain (e.g. name@go.org or file.go)
    if (nextChar === '.') {
      const rest = text.slice(end + 1, Math.min(text.length, end + 10));
      if (/^[a-zA-Z]{2,4}\b/.test(rest)) {
        // Could be URL or filename
        const snippet = text.slice(Math.max(0, start - 15), Math.min(text.length, end + 15));
        if (/@|https?:\/\/|\.com|\.org|\.net|\.io|\.js|\.ts|\.css/.test(snippet)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Extracts a concise snippet centered on the match
 */
function extractSnippet(text: string, start: number, end: number): string {
  const windowStart = Math.max(0, start - 60);
  const windowEnd = Math.min(text.length, end + 60);
  let snippet = text.slice(windowStart, windowEnd).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (windowStart > 0) snippet = '...' + snippet;
  if (windowEnd < text.length) snippet = snippet + '...';
  return snippet;
}

/**
 * Detects section by line position in resume text
 */
function detectSectionAtOffset(text: string, offset: number): 'skills' | 'experience' | 'projects' | 'education' | 'summary' | 'other' {
  const lines = text.slice(0, offset).split(/\r?\n/);
  let currentSection: 'skills' | 'experience' | 'projects' | 'education' | 'summary' | 'other' = 'other';

  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();
    if (/^(?:TECHNICAL\s+)?SKILLS(?:\s+AND\s+TOOLS)?\b/.test(trimmed)) {
      currentSection = 'skills';
    } else if (/^(?:WORK\s+)?EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY\b/.test(trimmed)) {
      currentSection = 'experience';
    } else if (/^PROJECTS|ACADEMIC\s+PROJECTS|PERSONAL\s+PROJECTS\b/.test(trimmed)) {
      currentSection = 'projects';
    } else if (/^EDUCATION|ACADEMICS|DEGREES\b/.test(trimmed)) {
      currentSection = 'education';
    } else if (/^SUMMARY|PROFESSIONAL\s+SUMMARY|OBJECTIVE\b/.test(trimmed)) {
      currentSection = 'summary';
    }
  }

  return currentSection;
}

/**
 * Checks surrounding text for prose exclusions (e.g. "go to", "react quickly", "swift action")
 */
function hasProseExclusion(text: string, start: number, end: number, exclusions: string[]): boolean {
  const windowStart = Math.max(0, start - 50);
  const windowEnd = Math.min(text.length, end + 50);
  const window = text.slice(windowStart, windowEnd).toLowerCase();

  for (const exc of exclusions) {
    if (window.includes(exc.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Checks surrounding text for technical context words when required
 */
function hasTechnicalContext(text: string, start: number, end: number, contextWords: string[]): boolean {
  const windowStart = Math.max(0, start - 120);
  const windowEnd = Math.min(text.length, end + 120);
  const window = text.slice(windowStart, windowEnd).toLowerCase();

  for (const cw of contextWords) {
    if (window.includes(cw.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluates the evidence tier for a mention
 */
function determineEvidenceTier(
  text: string,
  start: number,
  end: number,
  section: string
): MentionEvidenceTier {
  const lineStart = Math.max(0, text.lastIndexOf('\n', start) + 1);
  const precedingSlice = text.slice(Math.max(lineStart, start - 60), start);

  if (NEGATION_PATTERNS.some((pat) => pat.test(precedingSlice))) {
    return 'negated';
  }

  if (HEDGE_PATTERNS.some((pat) => pat.test(precedingSlice))) {
    return 'familiar';
  }

  if (section === 'skills') {
    return 'listed';
  }

  // In experience or projects, check for action verbs or metrics
  const sentenceStart = Math.max(0, start - 80);
  const sentenceEnd = Math.min(text.length, end + 80);
  const localSentence = text.slice(sentenceStart, sentenceEnd).toLowerCase();

  const words = localSentence.split(/[^a-zA-Z0-9%]/);
  const hasVerb = words.some((w) => ACTION_VERBS.has(w));
  const hasMetric = /[\d]+%|[\d]+k|\$[\d]+|\bms\b|\bseconds\b|\bmillion\b|\bthousand\b/i.test(localSentence);

  if (section === 'experience' || section === 'projects' || hasVerb || hasMetric) {
    return 'used';
  }

  return 'listed';
}

/**
 * Main skill extraction function.
 * Scans text with longest-match-first, resolves ambiguities, handles evidence tiers,
 * and eliminates overlapping spans.
 */
export function extractSkills(
  rawText: string,
  options?: { isSkillsSectionOnly?: boolean }
): SkillMention[] {
  if (!rawText || rawText.trim().length === 0) return [];

  // Mask URLs and email addresses with equal length spaces to avoid false positive matching inside URLs/emails
  const maskedText = rawText
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (m) => ' '.repeat(m.length))
    .replace(/https?:\/\/[^\s),]+/gi, (m) => ' '.repeat(m.length))
    .replace(/(?:www\.|github\.com\/|linkedin\.com\/|docker\.io\/|[a-zA-Z0-9-]+\.(?:io|com|dev|org|net|app|me)\/)[^\s),]+/gi, (m) => ' '.repeat(m.length));

  const rawLower = maskedText.toLowerCase();
  const rawLength = rawText.length;

  // Track occupied character spans to prevent substrings from stealing characters
  const occupiedSpans: { start: number; end: number }[] = [];

  function isOverlapping(start: number, end: number): boolean {
    return occupiedSpans.some((span) => Math.max(start, span.start) < Math.min(end, span.end));
  }

  const rawMentions: SkillMention[] = [];

  for (const entry of SEARCH_ENTRIES) {
    const isCaseSens = Boolean(entry.ambiguity?.caseSensitive);
    const searchTarget = isCaseSens ? maskedText : rawLower;
    const query = isCaseSens ? entry.token : entry.lowerToken;

    let searchIndex = 0;
    while (searchIndex < rawLength) {
      const idx = searchTarget.indexOf(query, searchIndex);
      if (idx === -1) break;

      const endIdx = idx + query.length;
      searchIndex = endIdx; // advance

      // Check boundary
      if (!isTokenBounded(rawText, idx, endIdx, entry.lowerToken)) {
        continue;
      }

      // Check overlapping spans (longest match already claimed)
      if (isOverlapping(idx, endIdx)) {
        continue;
      }

      // Disambiguation: Prose Exclusions
      if (
        entry.ambiguity?.excludeInProse &&
        entry.ambiguity.proseExclusions &&
        entry.ambiguity.proseExclusions.length > 0
      ) {
        if (hasProseExclusion(rawText, idx, endIdx, entry.ambiguity.proseExclusions)) {
          continue; // rejected as prose collision
        }
      }

      const section = options?.isSkillsSectionOnly
        ? 'skills'
        : detectSectionAtOffset(rawText, idx);

      // Disambiguation: Needs Context
      if (
        entry.ambiguity?.needsContext &&
        entry.ambiguity.contextWords &&
        entry.ambiguity.contextWords.length > 0
      ) {
        if (section !== 'skills') {
          const hasContext = hasTechnicalContext(
            rawText,
            idx,
            endIdx,
            entry.ambiguity.contextWords
          );
          if (!hasContext) {
            continue; // rejected due to lack of surrounding technical context
          }
        }
      }

      // Check special trap: Node vs linked list node
      if (entry.lowerToken === 'node' || entry.lowerToken === 'nodejs') {
        const localSlice = rawText.slice(Math.max(0, idx - 40), Math.min(rawLength, endIdx + 40)).toLowerCase();
        if (
          localSlice.includes('tree node') ||
          localSlice.includes('linked list node') ||
          localSlice.includes('leaf node') ||
          localSlice.includes('graph node')
        ) {
          continue;
        }
      }

      // Determine evidence tier
      const evidenceTier = determineEvidenceTier(rawText, idx, endIdx, section);

      // Build mention
      const matchedToken = rawText.slice(idx, endIdx);
      const snippet = extractSnippet(rawText, idx, endIdx);

      occupiedSpans.push({ start: idx, end: endIdx });

      rawMentions.push({
        canonicalId: entry.canonicalId,
        matchedToken,
        startIndex: idx,
        endIndex: endIdx,
        section,
        evidenceTier,
        snippet,
        contextScore: evidenceTier === 'used' ? 1.0 : evidenceTier === 'listed' ? 0.7 : 0.4,
      });
    }
  }

  // Sort mentions by start index
  rawMentions.sort((a, b) => a.startIndex - b.startIndex);

  return rawMentions;
}

/**
 * Deduplicates multiple mentions of the same canonical skill,
 * preserving the highest evidence tier ('used' > 'listed' > 'familiar' > 'negated').
 */
export function getDeduplicatedSkills(mentions: SkillMention[]): Map<string, SkillMention> {
  const tierRanks: Record<MentionEvidenceTier, number> = {
    used: 4,
    listed: 3,
    familiar: 2,
    negated: 1,
  };

  const map = new Map<string, SkillMention>();
  for (const m of mentions) {
    const existing = map.get(m.canonicalId.toLowerCase());
    if (!existing || tierRanks[m.evidenceTier] > tierRanks[existing.evidenceTier]) {
      map.set(m.canonicalId.toLowerCase(), m);
    }
  }
  return map;
}
