import { describe, it, expect } from 'vitest';
import { generateTailoredSuggestions } from '../../lib/tailorEngine/engine';
import { applyGrammarGate } from '../../lib/tailorEngine/grammar';
import { computeWordDiff } from '../../lib/tailorEngine/diff';
import {
  convertGerundToPastTense,
  matchWeakOpener,
  getDeduplicatedVerb,
  detectSpellingConvention
} from '../../lib/tailorEngine/verbs';
import { SAMPLE_RESUME, SAMPLE_JD } from './fixtures/sampleData';

describe('Stage 3 — Tailor Engine Bugs & Review Logic', () => {

  describe('B1 & B5: Weak openers and Gerunds conversion', () => {
    it('detects duty opener and converts gerund to past tense', () => {
      const match = matchWeakOpener('Responsible for developing modular React frontends');
      expect(match).not.toBeNull();
      expect(match?.kind).toBe('duty');
      expect(match?.remainder).toBe('developing modular React frontends');

      const pastVerb = convertGerundToPastTense('developing', 'US');
      expect(pastVerb).toBe('Developed');
    });

    it('respects UK spelling convention if resume uses UK spelling', () => {
      const ukText = 'Experience in optimising queries and organised codebases.';
      const spelling = detectSpellingConvention(ukText);
      expect(spelling).toBe('UK');

      const pastVerbUK = convertGerundToPastTense('optimizing', 'UK');
      expect(pastVerbUK).toBe('Optimised');

      const pastVerbUS = convertGerundToPastTense('optimizing', 'US');
      expect(pastVerbUS).toBe('Optimized');
    });

    it('splits participation phrase into Honest (default) and Ownership options (B5)', () => {
      const match = matchWeakOpener('Helped with writing automated tests using Jest and Cypress');
      expect(match).not.toBeNull();
      expect(match?.kind).toBe('participation');

      const result = generateTailoredSuggestions(SAMPLE_RESUME, SAMPLE_JD);
      const testBulletSug = result.suggestions.find(s => s.originalText.includes('Helped with'));
      
      expect(testBulletSug).toBeDefined();
      expect(testBulletSug?.options).toBeDefined();
      expect(testBulletSug?.options?.length).toBe(2);

      // Option 1: Honest
      const honestOpt = testBulletSug?.options?.[0];
      expect(honestOpt?.badge).toBe('facts');
      expect(honestOpt?.text).toContain('Collaborated');

      // Option 2: Ownership
      const ownershipOpt = testBulletSug?.options?.[1];
      expect(ownershipOpt?.badge).toBe('ownership');
      expect(ownershipOpt?.text).toContain('Wrote');
    });
  });

  describe('B2: Rationale dynamically names appliedVerb', () => {
    it('names the exact applied verb in the rationale for duty phrasing', () => {
      const result = generateTailoredSuggestions(SAMPLE_RESUME, SAMPLE_JD);
      const respSug = result.suggestions.find(s => s.originalText.includes('Responsible for developing'));
      
      expect(respSug).toBeDefined();
      expect(respSug?.appliedVerb).toBe('Developed');
      expect(respSug?.rationale).toContain("'Developed'");
    });
  });

  describe('B3: Grammar Gate', () => {
    it('capitalizes, ensures single terminal period, fixes comma before participle, and removes double words', () => {
      const dirty = '- database indexes indexes reducing latency by 45%';
      const clean = applyGrammarGate(dirty);

      expect(clean.startsWith('- Database')).toBe(true);
      expect(clean.endsWith('.')).toBe(true);
      expect(clean).not.toContain('indexes indexes');
      expect(clean).toContain(', reducing latency by 45%.');
    });

    it('does not duplicate terminal periods', () => {
      const withPeriod = '- Built microservices.';
      const clean = applyGrammarGate(withPeriod);
      expect(clean).toBe('- Built microservices.');
    });
  });

  describe('B8: Verb deduplication within section', () => {
    it('picks a synonym if a verb is already used in the same section', () => {
      const usedVerbs = new Set(['built']);
      const deduplicated = getDeduplicatedVerb('Built', usedVerbs, 'US');
      expect(deduplicated).not.toBe('Built');
      expect(['Engineered', 'Constructed', 'Developed', 'Implemented', 'Architected']).toContain(deduplicated);
    });
  });

  describe('Pure JS Word Diff', () => {
    it('accurately identifies word modifications', () => {
      const orig = '- Helped with writing automated tests';
      const prop = '- Wrote automated tests.';
      const diff = computeWordDiff(orig, prop);

      expect(diff.some(d => d.type === 'removed' && d.value.includes('Helped with'))).toBe(true);
      expect(diff.some(d => d.type === 'added' && d.value.includes('Wrote'))).toBe(true);
      expect(diff.some(d => d.type === 'same' && d.value.includes('automated tests'))).toBe(true);
    });
  });

});
