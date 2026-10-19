import { describe, it, expect } from 'vitest';
import { generateDiagnosticPayload } from '../../../src/lib/diagnostics/reportWrongResult';
import { generateFeedbackReport } from '../../../scripts/feedback-report';
import { ENGINE_VERSION, computeConfigFingerprint } from '../../../src/config/versions';

describe('B6 & B7: Explainability & Diagnostics (B6.1 - B7.5)', () => {
  it('generates a sanitized diagnostic payload with zero PII and active config fingerprints', () => {
    const rawInputs = [
      { name: 'Hard Skills Match', value: '85%' },
      { name: 'Evidence Depth', value: '72/100' },
    ];

    const payload = generateDiagnosticPayload(
      'overall-ats-score',
      82,
      '(HardSkills * 0.4) + (EvidenceQuality * 0.25)...',
      rawInputs
    );

    // Metadata validation
    expect(payload.metricId).toBe('overall-ats-score');
    expect(payload.metricValue).toBe(82);
    expect(payload.engineVersion).toBe(ENGINE_VERSION);
    expect(payload.configFingerprint).toBe(computeConfigFingerprint());
    expect(payload.timestamp).toBeTruthy();

    // Verify scoring config constants are attached
    expect(payload.scoringConfig.atsPillarWeights.hardSkills).toBe(0.40);
    expect(payload.scoringConfig.requirementWeightClasses.mandatory).toBe(3.0);

    // Verify sanitization: inputs must contain name and value, no candidate PII
    expect(payload.sanitizedInputs.length).toBe(2);
    const jsonString = JSON.stringify(payload);
    expect(jsonString).not.toContain('@example.com');
    expect(jsonString).not.toContain('+91');
  });

  it('formats feedback report CLI summary correctly', () => {
    const items = [
      {
        id: '1',
        targetKind: 'finding',
        ruleId: 'action-verbs',
        verdict: 'up' as const,
        note: 'Helpful',
        engineVersion: '4.0.0',
        createdAt: '2026-10-19T00:00:00Z',
      },
      {
        id: '2',
        targetKind: 'finding',
        ruleId: 'action-verbs',
        verdict: 'down' as const,
        note: 'False positive',
        engineVersion: '4.0.0',
        createdAt: '2026-10-19T00:00:00Z',
      },
    ];

    const report = generateFeedbackReport(items);
    expect(report).toContain('HIREFLOW v4: CANDIDATE FEEDBACK SUMMARY REPORT');
    expect(report).toContain('Total Feedback Items:  2');
    expect(report).toContain('action-verbs');
    expect(report).toContain('Helpful');
    expect(report).toContain('False positive');
  });
});
