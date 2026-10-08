// ============================================================
// Unit Tests — Batch Readiness Engine (batchAnalyzer.test.ts)
// Stage 7.3: College Placement Cell Cohort Analyzer
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  analyzeBatch,
  generateSampleCohort,
  exportBatchReadinessCSV,
  CohortCandidate,
} from '../batchAnalyzer';

describe('Batch Readiness Analyzer (batchAnalyzer.ts)', () => {
  it('generates a deterministic sample cohort of specified size', () => {
    const cohort20 = generateSampleCohort(20);
    expect(cohort20).toHaveLength(20);
    expect(cohort20[0].id).toBe('stu-1');
    expect(cohort20[0].name).toBe('Aarav Sharma');
    expect(cohort20[0].skills.length).toBeGreaterThan(0);
    expect(cohort20[0].cgpa).toBeGreaterThanOrEqual(7.0);

    const cohort10 = generateSampleCohort(10);
    expect(cohort10).toHaveLength(10);
  });

  it('anonymizes candidate names by default and exposes real names when disabled', () => {
    const sample = generateSampleCohort(5);

    // Default: anonymize = true
    const anonReport = analyzeBatch(sample, true);
    expect(anonReport.anonymized).toBe(true);
    expect(anonReport.rows[0].candidateName).toBe('Candidate 001');
    expect(anonReport.rows[1].candidateName).toBe('Candidate 002');
    expect(anonReport.rows[0].realName).toBe('Aarav Sharma');

    // Reveal names: anonymize = false
    const namedReport = analyzeBatch(sample, false);
    expect(namedReport.anonymized).toBe(false);
    expect(namedReport.rows[0].candidateName).toBe('Aarav Sharma');
    expect(namedReport.rows[1].candidateName).toBe('Ananya Verma');
  });

  it('accurately calculates readiness scores and classifies tiers', () => {
    const candidates: CohortCandidate[] = [
      {
        id: 'c-high',
        name: 'High Performer',
        branch: 'CSE',
        cgpa: 9.2,
        skills: ['Java', 'Spring Boot', 'DSA', 'SQL', 'System Design', 'Docker', 'AWS', 'Kafka', 'Redis', 'Python'],
      },
      {
        id: 'c-low',
        name: 'Beginner Student',
        branch: 'ECE',
        cgpa: 7.1,
        skills: ['HTML', 'CSS'],
      },
    ];

    const report = analyzeBatch(candidates, false);
    expect(report.rows).toHaveLength(2);

    const highRow = report.rows[0];
    const lowRow = report.rows[1];

    expect(highRow.avgScore).toBeGreaterThan(lowRow.avgScore);
    expect(highRow.readyNowCount).toBeGreaterThan(0);
    expect(lowRow.readyNowCount).toBe(0);

    // Low candidate scores should be marked as high_gap (< 60)
    const lowScores = Object.values(lowRow.scores);
    expect(lowScores.every((s) => s.readinessTier === 'high_gap')).toBe(true);
  });

  it('ranks top batch gaps descending and generates actionable workshops', () => {
    const sample = generateSampleCohort(15);
    const report = analyzeBatch(sample, true);

    expect(report.topBatchGaps.length).toBeGreaterThan(0);
    // Assert strictly descending order
    for (let i = 0; i < report.topBatchGaps.length - 1; i++) {
      expect(report.topBatchGaps[i].missingCount).toBeGreaterThanOrEqual(
        report.topBatchGaps[i + 1].missingCount
      );
    }

    const topGap = report.topBatchGaps[0];
    expect(topGap.recommendedWorkshop).toBeDefined();
    expect(topGap.recommendedWorkshop.length).toBeGreaterThan(5);
    expect(topGap.missingPercent).toBeGreaterThanOrEqual(0);
    expect(topGap.missingPercent).toBeLessThanOrEqual(100);
  });

  it('generates compliant RFC 4180 CSV with cohort table and gap summaries', () => {
    const sample = generateSampleCohort(10);
    const report = analyzeBatch(sample, true);
    const csv = exportBatchReadinessCSV(report);

    expect(csv).toContain('"Candidate ID","Candidate Name"');
    expect(csv).toContain('Candidate 001');
    expect(csv).toContain('--- TOP CURRICULUM GAPS ACROSS BATCH ---');
    expect(csv).toContain('"Recommended Action / Workshop"');
  });

  it('guarantees pure deterministic output across repeated executions', () => {
    const sample = generateSampleCohort(12);
    const report1 = analyzeBatch(sample, true);
    const report2 = analyzeBatch(sample, true);

    expect(JSON.stringify(report1)).toEqual(JSON.stringify(report2));
  });
});
