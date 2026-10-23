// ============================================================
// HireFlow — Stage 6 Bullet Quality & No-New-Facts Tests
// Validates 100-point bullet scale, diagnostics, rewrite assistance,
// no-new-facts guard, and metric plausibility warnings
// ============================================================

import { describe, it, expect } from 'vitest';
import { analyzeBullet } from '../../src/features/ats/engine/bulletAnalyzer';
import { sanitizeAndGuardRewrite } from '../../src/lib/ats/noNewFactsGuard';

describe('Stage 6: Bullet Point Quality & No-New-Facts Suite', () => {
  it('enforces 100-point bullet scale with exact criteria weights summing to 100', () => {
    // Ideal bullet with action verb, metric, technology, and outcome
    const highQualityBullet =
      'Architected distributed event-driven pipeline using Go and Kafka, cutting p99 processing latency by 45% across 2.5M daily transactions.';
    const analysis = analyzeBullet(highQualityBullet);

    expect(analysis.score).toBeGreaterThanOrEqual(90);
    expect(analysis.score).toBeLessThanOrEqual(100);
    expect(analysis.breakdown).toBeDefined();

    const bd = analysis.breakdown!;
    expect(bd.actionVerbScore).toBe(20);
    expect(bd.metricScore).toBe(30);
    expect(bd.techScore).toBe(25);
    expect(bd.outcomeScore).toBe(25);
    expect(bd.actionVerbScore + bd.metricScore + bd.techScore + bd.outcomeScore).toBe(100);
  });

  it('diagnoses weak passive openers and applies negative deductions', () => {
    const weakBullet = 'Responsible for working on backend bug fixes and assisting team with testing';
    const analysis = analyzeBullet(weakBullet);

    expect(analysis.hasWeakPhrase).toBe(true);
    expect(analysis.hasMetric).toBe(false);
    expect(analysis.score).toBeLessThan(50);
    expect(analysis.issues.some((i) => i.includes('passive or duty-oriented'))).toBe(true);
  });

  it('detects cliché verbs as mild diagnostics', () => {
    const clicheBullet = 'Utilized React and JavaScript to display user records on dashboard screen';
    const analysis = analyzeBullet(clicheBullet);

    expect(analysis.hasClichéVerb).toBe(true);
    expect(analysis.issues.some((i) => i.includes('clichéd or generic action verb'))).toBe(true);
  });

  it('validates recommended word count range (12–28 words)', () => {
    const briefBullet = 'Built website with HTML and CSS.'; // 6 words (< 12)
    const verboseBullet =
      'Engineered and designed and built comprehensive end-to-end full-stack software architecture utilizing advanced technologies and modern programming paradigms while collaborating across multiple functional teams to achieve exceptional software engineering excellence and customer satisfaction.'; // 34 words (> 28)

    const briefAnalysis = analyzeBullet(briefBullet);
    const verboseAnalysis = analyzeBullet(verboseBullet);

    expect(briefAnalysis.issues.some((i) => i.includes('Too brief'))).toBe(true);
    expect(verboseAnalysis.issues.some((i) => i.includes('Overly verbose'))).toBe(true);
  });

  it('no-new-facts guard blocks unverified numbers and technologies from rewrites', () => {
    const originalBullet = 'Helped team with website development';
    const resumeText = 'Aryan Sharma. Skills: HTML, CSS, JavaScript.';

    // Hallucinated rewrite introducing AWS, Docker, and 85%
    const hallucinatedRewrite =
      'Architected microservices using Docker and AWS, boosting throughput by 85% across 100,000 requests.';

    const guard = sanitizeAndGuardRewrite(hallucinatedRewrite, originalBullet, resumeText);

    // Docker and AWS not in resume -> replaced with placeholder
    expect(guard.newFactsBlocked.length).toBeGreaterThan(0);
    expect(guard.guardedRewrite).not.toContain('Docker');
    expect(guard.guardedRewrite).not.toContain('AWS');
    expect(guard.guardedRewrite).toContain('[your technology stack]');
    expect(guard.guardedRewrite).toContain('[X% measured]');
  });

  it('metric plausibility flag warns on extreme claims without adding score', () => {
    const original = 'Optimized queries';
    const extremeRewrite = 'Optimized database queries, improving performance by 850% across endpoints.';

    const guard = sanitizeAndGuardRewrite(extremeRewrite, original, original);
    expect(guard.plausibilityWarning).toBeDefined();
    expect(guard.plausibilityWarning).toContain('>300%');
  });
});
