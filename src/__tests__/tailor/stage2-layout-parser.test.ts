import { describe, it, expect } from 'vitest';
import { pluralize, parseJDOverview, parseResumeOverview } from '../../lib/tailorEngine/parser';
import { calculateBulletStrength, calculateResumeQuality } from '../../lib/tailorEngine/strength';
import { SAMPLE_RESUME, SAMPLE_JD } from './fixtures/sampleData';

describe('Stage 2 — Layout, Inputs, and Parser Hardening', () => {
  describe('B7 Pluralize Helper', () => {
    it('formats singular and plural phrases correctly without awkward "1 metrics"', () => {
      expect(pluralize(1, 'section')).toBe('1 section');
      expect(pluralize(3, 'section')).toBe('3 sections');
      expect(pluralize(1, 'bullet')).toBe('1 bullet');
      expect(pluralize(6, 'bullet')).toBe('6 bullets');
      expect(pluralize(1, 'metric')).toBe('1 metric');
      expect(pluralize(2, 'metric')).toBe('2 metrics');
      expect(pluralize(1, 'skill')).toBe('1 skill');
      expect(pluralize(4, 'skill')).toBe('4 skills');
      expect(pluralize(1, 'must-have')).toBe('1 must-have');
      expect(pluralize(3, 'must-have')).toBe('3 must-haves');
    });
  });

  describe('B6 JD Parser Nice-To-Haves Detection', () => {
    it('correctly classifies "Redis ... is a strong plus" as nice-to-have, resulting in 3 must-haves and 1 nice-to-have', () => {
      const parsed = parseJDOverview(SAMPLE_JD);

      expect(parsed.role).toBe('Senior Backend Engineer');
      expect(parsed.company).toBe('Razorpay');

      // The 3 requirements without plus are must-haves
      expect(parsed.mustHaves.length).toBe(3);
      expect(parsed.mustHaves[0]).toContain('PostgreSQL');
      expect(parsed.mustHaves[1]).toContain('RESTful microservices');
      expect(parsed.mustHaves[2]).toContain('Jest');

      // The line with "strong plus" is nice-to-have
      expect(parsed.niceToHaves.length).toBe(1);
      expect(parsed.niceToHaves[0]).toContain('Redis');
      expect(parsed.niceToHaves[0]).toContain('strong plus');
    });
  });

  describe('Per-Bullet Strength Rubric (0-100)', () => {
    it('calculates deterministic score breakdown across all 6 criteria', () => {
      const weakBullet = '- Responsible for developing modular React and TypeScript frontends serving 60,000 active users.';
      const weakStrength = calculateBulletStrength(weakBullet, SAMPLE_JD);

      // Has weak opener -> hasStrongVerb is false (+0)
      expect(weakStrength.hasStrongVerb).toBe(false);
      // Has 60,000 active users metric -> +25
      expect(weakStrength.hasMetric).toBe(true);
      // Has React, TypeScript -> +15
      expect(weakStrength.hasTechNamed).toBe(true);
      // Has "serving 60,000 active users" -> +10
      expect(weakStrength.hasOutcome).toBe(true);
      // Word count is 13 words (12-28 range) -> +10
      expect(weakStrength.isOptimalLength).toBe(true);

      expect(weakStrength.score).toBeGreaterThanOrEqual(60);

      // Now with strong verb rewrite
      const strongBullet = '- Developed modular React and TypeScript frontends serving 60,000 active users.';
      const strongStrength = calculateBulletStrength(strongBullet, SAMPLE_JD);

      expect(strongStrength.hasStrongVerb).toBe(true);
      expect(strongStrength.score).toBeGreaterThan(weakStrength.score);
    });

    it('summarizes resume quality with average strength, metrics %, and repeated verbs', () => {
      const quality = calculateResumeQuality(SAMPLE_RESUME, SAMPLE_JD);

      expect(quality.avgStrength).toBeGreaterThan(0);
      expect(quality.bulletsWithMetricsPercent).toBeGreaterThan(0);
      expect(Array.isArray(quality.repeatedVerbs)).toBe(true);
    });
  });
});
