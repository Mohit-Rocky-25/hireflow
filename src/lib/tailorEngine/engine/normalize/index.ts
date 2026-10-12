import { RawBlock } from '../parse';

export interface NormalizedSectionChunk {
  rawHeading: string;
  normalizedKindHint?: string;
  blocks: RawBlock[];
  confidence: number;
}

const HEADING_HINT_MAP: Record<string, string> = {
  summary: 'summary',
  'professional summary': 'summary',
  'career summary': 'summary',
  about: 'summary',
  profile: 'summary',
  education: 'education',
  academic: 'education',
  'academic history': 'education',
  'work experience': 'experience',
  experience: 'experience',
  'professional experience': 'experience',
  employment: 'experience',
  'clinical experience': 'experience',
  projects: 'projects',
  'key projects': 'projects',
  'personal projects': 'projects',
  'technical projects': 'projects',
  'security projects': 'projects',
  'security projects & practical experience': 'projects',
  'skills & tools': 'skills',
  'technical skills': 'skills',
  skills: 'skills',
  'core competencies': 'skills',
  competencies: 'skills',
  'clinical skills': 'skills',
  leadership: 'leadership',
  'leadership & involvement': 'leadership',
  involvement: 'leadership',
  certifications: 'certifications',
  'licenses & certifications': 'certifications',
  'continuous learning': 'certifications',
  achievements: 'achievements',
  awards: 'achievements',
  'honors & achievements': 'achievements',
  'awards & achievements': 'achievements'
};

/**
 * Stage 2: NORMALIZE
 * Converts raw blocks into clean, structured section chunks with normalized headers.
 */
export function normalizeRawBlocks(blocks: RawBlock[]): NormalizedSectionChunk[] {
  if (!blocks || blocks.length === 0) return [];

  const chunks: NormalizedSectionChunk[] = [];
  let currentHeading = 'HEADER';
  let currentHint: string | undefined = 'header';
  let currentBlocks: RawBlock[] = [];

  for (const block of blocks) {
    const cleanLine = block.rawText
      .replace(/^[#*_\-\s]+/, '')
      .replace(/[:\-#•*_\s]+$/, '')
      .trim()
      .toLowerCase();

    // Check if this block matches a known section heading
    let matchedHint: string | undefined = undefined;
    if (block.isHeadingCandidate) {
      if (HEADING_HINT_MAP[cleanLine]) {
        matchedHint = HEADING_HINT_MAP[cleanLine];
      } else if (/\bprojects?\b/i.test(cleanLine) && !/\b(?:management|coordination)\b/i.test(cleanLine)) {
        matchedHint = 'projects';
      } else if (/\b(?:experience|employment|internships?)\b/i.test(cleanLine)) {
        matchedHint = 'experience';
      } else if (/\b(?:skills?|competencies)\b/i.test(cleanLine)) {
        matchedHint = 'skills';
      } else if (/\b(?:education|academic)\b/i.test(cleanLine)) {
        matchedHint = 'education';
      } else if (/\b(?:certifications?|licenses?)\b/i.test(cleanLine)) {
        matchedHint = 'certifications';
      } else if (/\b(?:leadership|involvement)\b/i.test(cleanLine)) {
        matchedHint = 'leadership';
      } else if (/\b(?:achievements?|awards?|honors?)\b/i.test(cleanLine)) {
        matchedHint = 'achievements';
      }
    }

    if (matchedHint) {
      // Save current chunk if populated
      if (currentBlocks.length > 0) {
        chunks.push({
          rawHeading: currentHeading,
          normalizedKindHint: currentHint,
          blocks: currentBlocks,
          confidence: currentHint === 'header' ? 0.98 : 0.95
        });
      }
      currentHeading = block.rawText;
      currentHint = matchedHint;
      currentBlocks = [];
    } else {
      currentBlocks.push(block);
    }
  }

  if (currentBlocks.length > 0) {
    chunks.push({
      rawHeading: currentHeading,
      normalizedKindHint: currentHint,
      blocks: currentBlocks,
      confidence: currentHint ? 0.9 : 0.6
    });
  }

  return chunks;
}
