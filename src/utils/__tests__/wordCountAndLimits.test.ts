// ============================================================
// HireFlow — Word Count & Limit Validation Unit Tests
// Tests countWords, getMinWords, validateAtsInputs, and canAnalyze
// ============================================================

import { describe, it, expect } from 'vitest';
import { countWords, cleanText } from '../wordCount';
import {
  WORD_LIMITS,
  PREFILLED_MIN_WORDS,
  getMinWords,
  validateAtsInputs,
} from '../../config/limits';

describe('Word Count & Validation Logic', () => {
  describe('countWords & cleanText', () => {
    it('accurately counts words in normal text', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
      expect(countWords('hello world')).toBe(2);
      expect(countWords('one   two\nthree\r\nfour\tfive')).toBe(5);
    });

    it('strips placeholder prefixes before counting', () => {
      const rawText =
        '[Simulated text extraction from resume-final-2.pdf]\nSenior Software Engineer with 5 years experience.';
      expect(cleanText(rawText)).toBe(
        'Senior Software Engineer with 5 years experience.'
      );
      // "Senior Software Engineer with 5 years experience." has 7 words
      expect(countWords(rawText)).toBe(7);
    });

    it('handles multiple placeholder headers or non-standard formatting', () => {
      const text =
        '[Simulated text extraction from test.docx] [Simulated text extraction from other.pdf] Hello world';
      expect(countWords(text)).toBe(2);
    });
  });

  describe('getMinWords', () => {
    it('returns PREFILLED_MIN_WORDS (20) for prefilled and talentlens sources', () => {
      expect(getMinWords('resume', 'talentlens')).toBe(PREFILLED_MIN_WORDS);
      expect(getMinWords('resume', 'prefilled')).toBe(PREFILLED_MIN_WORDS);
      expect(getMinWords('resume', 'template')).toBe(PREFILLED_MIN_WORDS);

      expect(getMinWords('jd', 'talentlens')).toBe(PREFILLED_MIN_WORDS);
      expect(getMinWords('jd', 'prefilled')).toBe(PREFILLED_MIN_WORDS);
      expect(getMinWords('jd', 'template')).toBe(PREFILLED_MIN_WORDS);
    });

    it('returns standard WORD_LIMITS minimum (30) for user upload, paste, or manual', () => {
      expect(getMinWords('resume', 'upload')).toBe(WORD_LIMITS.resume.min);
      expect(getMinWords('resume', 'paste')).toBe(WORD_LIMITS.resume.min);
      expect(getMinWords('resume', 'manual')).toBe(WORD_LIMITS.resume.min);
      expect(getMinWords('resume', undefined)).toBe(WORD_LIMITS.resume.min);

      expect(getMinWords('jd', 'upload')).toBe(WORD_LIMITS.jd.min);
      expect(getMinWords('jd', 'paste')).toBe(WORD_LIMITS.jd.min);
      expect(getMinWords('jd', undefined)).toBe(WORD_LIMITS.jd.min);
    });
  });

  describe('validateAtsInputs and canAnalyze', () => {
    it('enables analysis for 48-word resume + 58-word JD from the Microsoft link', () => {
      // 48 words sample resume
      const sample48WordResume = Array(48).fill('engineering').join(' ');
      // 58 words sample Microsoft SDE-2 JD
      const sample58WordJd = Array(58).fill('requirement').join(' ');

      expect(countWords(sample48WordResume)).toBe(48);
      expect(countWords(sample58WordJd)).toBe(58);

      const result = validateAtsInputs(sample48WordResume, sample58WordJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
      });

      expect(result.resumeMin).toBe(20);
      expect(result.jdMin).toBe(20);
      expect(result.resumeOk).toBe(true);
      expect(result.jdOk).toBe(true);
      expect(result.canAnalyze).toBe(true);
      expect(result.disabledReason).toBe('');
    });

    it('disables analysis for 10-word resume with the correct message', () => {
      const tenWordResume = 'Software Engineer with experience in React Node AWS and Docker';
      expect(countWords(tenWordResume)).toBe(10);

      const validJd = Array(50).fill('requirement').join(' ');

      // When loaded from talentlens (min = 20)
      const tlResult = validateAtsInputs(tenWordResume, validJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
      });
      expect(tlResult.canAnalyze).toBe(false);
      expect(tlResult.disabledReason).toBe('Resume needs 20+ words (currently 10)');

      // When pasted by user (min = 30)
      const manualResult = validateAtsInputs(tenWordResume, validJd, {
        resumeSource: 'paste',
        jobSource: 'paste',
      });
      expect(manualResult.canAnalyze).toBe(false);
      expect(manualResult.disabledReason).toBe('Resume needs 30+ words (currently 10)');
    });

    it('disables analysis for 2,500-word JD with the max-limit message', () => {
      const validResume = Array(50).fill('experience').join(' ');
      const longJd = Array(2500).fill('spec').join(' ');

      expect(countWords(validResume)).toBe(50);
      expect(countWords(longJd)).toBe(2500);

      const result = validateAtsInputs(validResume, longJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
      });

      expect(result.canAnalyze).toBe(false);
      expect(result.jdOk).toBe(false);
      expect(result.disabledReason).toContain('Maximum 2000 words, please trim');
    });

    it('mentions only the side that fails in the helper message', () => {
      const validResume = Array(50).fill('engineer').join(' ');
      const shortJd = 'Just a few words here';

      const result = validateAtsInputs(validResume, shortJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
      });

      expect(result.canAnalyze).toBe(false);
      expect(result.disabledReason).toBe('Job description needs 20+ words (currently 5)');
      expect(result.disabledReason).not.toContain('Resume');
    });

    it('mentions both sides if both fail', () => {
      const shortResume = 'Short resume';
      const shortJd = 'Short JD';

      const result = validateAtsInputs(shortResume, shortJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
      });

      expect(result.canAnalyze).toBe(false);
      expect(result.disabledReason).toBe(
        'Resume needs 20+ words (currently 2) · Job description needs 20+ words (currently 2)'
      );
    });

    it('disables when file extraction is active', () => {
      const validResume = Array(50).fill('engineer').join(' ');
      const validJd = Array(50).fill('spec').join(' ');

      const result = validateAtsInputs(validResume, validJd, {
        resumeSource: 'talentlens',
        jobSource: 'prefilled',
        isFileExtracting: true,
      });

      expect(result.canAnalyze).toBe(false);
      expect(result.disabledReason).toBe('Reading and validating uploaded file...');
    });
  });
});
