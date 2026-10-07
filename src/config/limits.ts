// ============================================================
// HireFlow — Word Limits & Validation Configuration
// Single source of truth for resume & JD input limits
// ============================================================

import { countWords } from '../utils/wordCount';

export const WORD_LIMITS = {
  resume: { min: 30, max: 1500 },
  jd:     { min: 30, max: 2000 },
} as const;

export const PREFILLED_MIN_WORDS = 20;

export type WordLimitSide = 'resume' | 'jd';
export type WordLimitSource =
  | 'talentlens'
  | 'prefilled'
  | 'template'
  | 'manual'
  | 'upload'
  | 'paste'
  | string
  | null
  | undefined;

/**
 * Returns the effective minimum word count for a given side and source.
 * Prefilled sources (TalentLens handoff, URL query params, templates) use a relaxed minimum of 20.
 * Standard user uploads / pastes use the configured WORD_LIMITS minimum (30).
 */
export function getMinWords(side: WordLimitSide, source?: WordLimitSource): number {
  if (
    source === 'talentlens' ||
    source === 'prefilled' ||
    source === 'template'
  ) {
    return PREFILLED_MIN_WORDS;
  }
  return WORD_LIMITS[side].min;
}

export interface AtsValidationResult {
  canAnalyze: boolean;
  resumeOk: boolean;
  jdOk: boolean;
  resumeWords: number;
  jdWords: number;
  resumeMin: number;
  jdMin: number;
  resumeMax: number;
  jdMax: number;
  disabledReason: string;
}

/**
 * Validates resume and JD texts against configured boundaries.
 * Live-computed from text directly.
 */
export function validateAtsInputs(
  resumeText = '',
  jdText = '',
  options?: {
    resumeSource?: WordLimitSource;
    jobSource?: WordLimitSource;
    isFileExtracting?: boolean;
    isScanning?: boolean;
  }
): AtsValidationResult {
  const resumeWords = countWords(resumeText);
  const jdWords = countWords(jdText);
  const resumeMin = getMinWords('resume', options?.resumeSource);
  const jdMin = getMinWords('jd', options?.jobSource);
  const resumeMax = WORD_LIMITS.resume.max;
  const jdMax = WORD_LIMITS.jd.max;

  const resumeBelow = resumeWords < resumeMin;
  const resumeAbove = resumeWords > resumeMax;
  const resumeOk = !resumeBelow && !resumeAbove;

  const jdBelow = jdWords < jdMin;
  const jdAbove = jdWords > jdMax;
  const jdOk = !jdBelow && !jdAbove;

  const canAnalyze = resumeOk && jdOk && !options?.isFileExtracting && !options?.isScanning;

  let disabledReason = '';
  if (options?.isFileExtracting) {
    disabledReason = 'Reading and validating uploaded file...';
  } else if (!canAnalyze) {
    const reasons: string[] = [];

    if (resumeBelow) {
      reasons.push(`Resume needs ${resumeMin}+ words (currently ${resumeWords})`);
    } else if (resumeAbove) {
      reasons.push(`Maximum ${resumeMax} words, please trim`);
    }

    if (jdBelow) {
      reasons.push(`Job description needs ${jdMin}+ words (currently ${jdWords})`);
    } else if (jdAbove) {
      reasons.push(`Maximum ${jdMax} words, please trim`);
    }

    disabledReason = reasons.join(' · ');
  }

  return {
    canAnalyze,
    resumeOk,
    jdOk,
    resumeWords,
    jdWords,
    resumeMin,
    jdMin,
    resumeMax,
    jdMax,
    disabledReason,
  };
}
