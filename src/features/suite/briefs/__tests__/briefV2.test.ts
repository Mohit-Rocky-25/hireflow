import { describe, it, expect } from 'vitest';
import { validateBriefV2 } from '../briefV2';
import { migrateLegacyToV2, toLegacyText } from '../briefMigration';
import { ALL_PROJECT_BRIEFS } from '../bundleBriefs';

describe('BriefV2 Schema & Validator', () => {
  it('validates a migrated legacy brief as valid V2 structure', () => {
    const legacy = ALL_PROJECT_BRIEFS[0];
    const v2 = migrateLegacyToV2(legacy);
    const result = validateBriefV2(v2);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(v2.metrics.length).toBeGreaterThan(0);
    expect(v2.milestones.length).toBeGreaterThanOrEqual(3);
    expect(v2.effort.minHours).toBeLessThanOrEqual(v2.effort.maxHours);
  });

  it('detects missing required fields and duplicate metric IDs', () => {
    const invalidObj = {
      id: 'brief-broken',
      title: 'Broken Brief',
      difficulty: 'super-hard', // invalid enum
      metrics: [
        { id: 'm1', name: 'Latency', unit: 'ms', passThreshold: 5 },
        { id: 'm1', name: 'Duplicate Latency', unit: 'ms', passThreshold: 10 },
      ],
      rubric: [
        { id: 'r1', command: 'run test', expectedOutcome: 'pass', metricId: 'non-existent' },
      ],
    };

    const result = validateBriefV2(invalidObj);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid difficulty'))).toBe(true);
    expect(result.errors.some((e) => e.includes('Duplicate metric id'))).toBe(true);
    expect(result.errors.some((e) => e.includes('non-existent metricId'))).toBe(true);
  });

  it('toLegacyText reproduces key metadata without crashing', () => {
    const sample = ALL_PROJECT_BRIEFS[0];
    const text = toLegacyText(sample, 1);

    expect(text).toContain(`PROJECT #1: ${sample.title.toUpperCase()}`);
    expect(text).toContain(`ID          : ${sample.id}`);
    expect(text).toContain(`Domain      : ${sample.domain}`);
    expect(text).toContain('[1. PROBLEM STATEMENT]');
    expect(text).toContain('[7. SCREENER VERIFICATION RUBRIC]');
  });
});

