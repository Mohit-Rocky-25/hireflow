import { describe, it, expect } from 'vitest';
import { runPreExportFormattingChecks } from '../../src/lib/tailor/export/formattingChecker';
import { TailoredResume } from '../../src/lib/tailor/types';

describe('D15: Tailor My Resume Formatting Sentinel (D15.1 - D15.6)', () => {
  const baseResume: TailoredResume = {
    id: 'res_test',
    projectId: 'p_test',
    candidateId: 'c_test',
    jobId: 'j_test',
    title: 'Frontend Engineer',
    version: 1,
    updatedAt: new Date().toISOString(),
    layoutSettings: {
      template: 'compact',
      paperSize: 'letter',
      fontSize: 'standard',
      margins: 'standard',
      lineSpacing: 'standard',
      accentColor: '#2563eb',
    },
    truthGateResult: {
      passed: true,
      score: 100,
      unsupportedClaimsCount: 0,
      preservedMetricsCount: 3,
      inventedMetricsDetected: [],
      blockingIssues: [],
    },
    sections: [
      {
        id: 'sec_exp',
        type: 'experience',
        title: 'Work Experience',
        visible: true,
        content: {
          entries: [
            {
              id: 'ent_1',
              primaryTitle: 'Frontend Engineer Intern',
              secondaryTitle: 'Acme Corp',
              dateRange: 'May 2025 - Aug 2025',
              bullets: [
                {
                  id: 'b1',
                  text: 'Architected high-throughput React dashboard with TypeScript, reducing load time by 42%.',
                },
              ],
            },
          ],
        },
      },
    ],
  };

  it('passes cleanly for well-formatted single page resume', () => {
    const report = runPreExportFormattingChecks(baseResume);
    expect(report.passed).toBe(true);
    expect(report.metrics.glyphIssues).toBe(0);
    expect(report.metrics.estimatedPages).toBe(1);
  });

  it('flags broken glyphs and unprintable control characters', () => {
    const corruptResume: TailoredResume = {
      ...baseResume,
      sections: [
        {
          id: 'sec_corrupt',
          type: 'experience',
          title: 'Experience',
          visible: true,
          content: {
            entries: [
              {
                id: 'ent_c',
                primaryTitle: 'Engineer',
                secondaryTitle: 'Beta Corp',
                dateRange: '2025',
                bullets: [
                  {
                    id: 'bc1',
                    text: 'Implemented \uFFFD broken character encoding and \u0007 bell character.',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const report = runPreExportFormattingChecks(corruptResume);
    expect(report.passed).toBe(false);
    expect(report.metrics.glyphIssues).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.type === 'broken_glyph')).toBe(true);
  });

  it('detects potential widow/orphan bullet points', () => {
    const widowResume: TailoredResume = {
      ...baseResume,
      sections: [
        {
          id: 'sec_widow',
          type: 'experience',
          title: 'Experience',
          visible: true,
          content: {
            entries: [
              {
                id: 'ent_w',
                primaryTitle: 'Engineer',
                secondaryTitle: 'Acme',
                dateRange: '2025',
                bullets: [
                  {
                    id: 'bw1',
                    // 16 words -> 16 % 15 = 1 word on line 2 (classic widow!)
                    text: 'Engineered a scalable distributed microservices platform with high concurrent throughput and zero downtime for global clients globally.',
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    const report = runPreExportFormattingChecks(widowResume);
    expect(report.metrics.widowOrphanCount).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.type === 'widow_orphan')).toBe(true);
  });
});
