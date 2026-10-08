import { describe, it, expect } from 'vitest';
import {
  bundleBriefsForGaps,
  evaluateCustomBriefSelection,
  ALL_PROJECT_BRIEFS,
} from '../bundleBriefs';

describe('bundleBriefsForGaps (Set-Cover Algorithm)', () => {
  it('covers target skills with minimal project count', () => {
    // Skills spanning Go, Redis, and Kafka
    const gaps = ['Go', 'Redis', 'Kafka', 'Docker'];
    const result = bundleBriefsForGaps(gaps);

    expect(result.recommendedBriefs.length).toBeGreaterThan(0);
    expect(result.recommendedBriefs.length).toBeLessThanOrEqual(3);
    expect(result.coveredSkills).toEqual(expect.arrayContaining(['Go', 'Redis', 'Kafka', 'Docker']));
    expect(result.coveragePercentage).toBe(100);
    expect(result.totalEstimatedHours).toBeGreaterThan(0);
  });

  it('handles partial coverage cleanly when some skills are outside library', () => {
    const gaps = ['Go', 'Redis', 'Cobol1985', 'HaskellRareTech'];
    const result = bundleBriefsForGaps(gaps);

    expect(result.coveredSkills).toEqual(expect.arrayContaining(['Go', 'Redis']));
    expect(result.uncoveredSkills).toEqual(expect.arrayContaining(['Cobol1985', 'HaskellRareTech']));
    expect(result.coveragePercentage).toBe(50); // 2 out of 4
  });

  it('handles empty gaps gracefully with default portfolio recommendations', () => {
    const result = bundleBriefsForGaps([]);
    expect(result.recommendedBriefs.length).toBe(2);
    expect(result.coveragePercentage).toBe(100);
    expect(result.uncoveredSkills.length).toBe(0);
  });

  it('guarantees pure determinism across multiple runs', () => {
    const gaps = ['React', 'TypeScript', 'PostgreSQL', 'WebSockets', 'Kafka', 'Docker'];
    const run1 = bundleBriefsForGaps(gaps);
    const run2 = bundleBriefsForGaps(gaps);

    expect(run1.recommendedBriefs.map((b) => b.id)).toEqual(run2.recommendedBriefs.map((b) => b.id));
    expect(run1.totalEstimatedHours).toBe(run2.totalEstimatedHours);
    expect(run1.coveragePercentage).toBe(run2.coveragePercentage);
  });

  it('respects maxBriefs constraint', () => {
    const broadGaps = [
      'Go',
      'Rust',
      'Python',
      'Java',
      'React',
      'Kubernetes',
      'Elasticsearch',
      'ClickHouse',
    ];
    const result = bundleBriefsForGaps(broadGaps, ALL_PROJECT_BRIEFS, 2);
    expect(result.recommendedBriefs.length).toBeLessThanOrEqual(2);
  });
});

describe('evaluateCustomBriefSelection', () => {
  it('accurately computes coverage for custom user-pinned projects', () => {
    const gaps = ['React', 'TypeScript', 'WebSockets', 'Go'];
    const selection = ['brief-realtime-collab']; // covers React, TypeScript, WebSockets
    const result = evaluateCustomBriefSelection(selection, gaps);

    expect(result.recommendedBriefs.length).toBe(1);
    expect(result.coveredSkills).toEqual(expect.arrayContaining(['React', 'TypeScript', 'WebSockets']));
    expect(result.uncoveredSkills).toEqual(['Go']);
    expect(result.coveragePercentage).toBe(75); // 3 of 4
    expect(result.briefCoverageMap[0].skillsCovered.length).toBeGreaterThanOrEqual(3);
  });
});
