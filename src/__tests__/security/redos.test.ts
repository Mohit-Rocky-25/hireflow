import { describe, it, expect } from 'vitest';
import { normalizeExtractedText, isGarbageOrBinary } from '@/features/ats/fileParser';
import { countWords } from '@/utils/wordCount';
import { parseResume } from '@/lib/ats/parseResume';
import { parseJD } from '@/lib/ats/parseJD';
import { matchSkills } from '@/lib/ats/matchSkills';
import { analyzeDeterministic } from '@/lib/ats/index';

describe('Regex Denial of Service (ReDoS) Resilience (Rule 4.3)', () => {
  const TIME_BUDGET_MS = 500; // 500 ms hard budget per pathological test

  it('handles 50,000 repeated characters without catastrophic backtracking', () => {
    const pathological = 'a'.repeat(50000) + '!';
    const start = performance.now();
    const result = normalizeExtractedText(pathological);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(TIME_BUDGET_MS);
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles deeply nested bullet glyphs and repeated whitespace without hanging', () => {
    const spaces = ('- '.repeat(5000) + '   \n\n\n').repeat(10);
    const start = performance.now();
    const result = normalizeExtractedText(spaces);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(TIME_BUDGET_MS);
    expect(result).toBeDefined();
  });

  it('runs word counter on 100,000 words in under 100ms', () => {
    const text = 'word '.repeat(100000);
    const start = performance.now();
    const count = countWords(text);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(count).toBe(100000);
  });

  it('evaluates garbage guard on 100 KB binary noise in under 50ms', () => {
    const noise = '\x00\x01\x02\x03objendobj'.repeat(10000);
    const start = performance.now();
    const isGarbage = isGarbageOrBinary(noise);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
    expect(isGarbage).toBe(true);
  });

  it('parses pathological skills and C++ / Go edge cases in under 300ms', () => {
    const trickySkills = ('C++ Go Java Python React TypeScript '.repeat(2000));
    const start = performance.now();
    const parsed = parseResume(trickySkills);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(300);
    expect(parsed.skillsExtracted).toBeDefined();
  });

  it('matches skills against 100 KB text within time budget', () => {
    const jdSample = 'Looking for senior engineer with Python, React, AWS, Docker, Kubernetes, SQL, TypeScript.';
    const largeResume = ('Built scalable microservices in Python, React, and AWS. '.repeat(1500));
    const parsedResume = parseResume(largeResume);
    const parsedJd = parseJD(jdSample);

    const start = performance.now();
    const matches = matchSkills(
      parsedResume.skillsExtracted,
      parsedJd.mustHaves,
      parsedJd.niceToHaves,
      largeResume
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(TIME_BUDGET_MS);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('runs full deterministic analysis on a 100 KB document in under 500ms', () => {
    const resume = 'Software Engineer with experience in TypeScript, React, Node.js.\n' + 'Led development of core features. '.repeat(2000);
    const jd = 'Seeking Fullstack Engineer with TypeScript, React, and Node.js. Minimum 3 years experience.';

    const start = performance.now();
    const analysis = analyzeDeterministic(resume, jd);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(TIME_BUDGET_MS);
    expect(analysis.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(0);
    expect(analysis.scoreBreakdown.finalScore).toBeLessThanOrEqual(100);
  });
});
