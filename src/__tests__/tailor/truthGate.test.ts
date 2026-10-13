// ============================================================
// HIREFLOW UNIT TESTS — TRUTH GATE & FACTUAL INTEGRITY
// Verifies 0% hallucination enforcement and metric preservation
// ============================================================

import { describe, it, expect } from 'vitest';
import { verifyFactualIntegrity } from '../../lib/tailor/engine/truthGate';
import { parseResumeRawText } from '../../lib/tailor/parser/resumeParser';
import { DEMO_FRESHER_RESUME } from '../../lib/tailor/store/fixtures';
import { TailoredResume } from '../../lib/tailor/types';

describe('Truth Gate & Factual Integrity Sentinel', () => {
  it('passes cleanly when all metrics originate from candidate facts', () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const validResume: TailoredResume = {
      id: 'res_valid',
      projectId: 'proj_1',
      candidateId: candidate.id,
      jobId: 'job_1',
      title: 'Valid Resume',
      version: 1,
      layoutSettings: {
        template: 'modern',
        paperSize: 'letter',
        fontSize: 'standard',
        margins: 'standard',
        lineSpacing: 'standard',
        accentColor: '#1E3A8A'
      },
      truthGateResult: {
        passed: true,
        score: 100,
        unsupportedClaimsCount: 0,
        preservedMetricsCount: 0,
        inventedMetricsDetected: [],
        blockingIssues: []
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
                id: 'exp_1',
                primaryTitle: 'Software Engineering Intern',
                secondaryTitle: 'NextGen Cloud Solutions',
                bullets: [
                  {
                    id: 'b1',
                    text: 'Developed 12 REST API endpoints in Node.js handling 15,000+ daily requests.',
                    originalText: 'Developed 12 REST API endpoints in Node.js and Express handling 15,000+ daily requests.'
                  }
                ]
              }
            ]
          }
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const result = verifyFactualIntegrity(validResume, candidate);
    expect(result.passed).toBe(true);
    expect(result.inventedMetricsDetected.length).toBe(0);
    expect(result.score).toBe(100);
  });

  it('detects and blocks invented metrics (hallucinations)', () => {
    const candidate = parseResumeRawText(DEMO_FRESHER_RESUME);
    const hallucinatedResume: TailoredResume = {
      id: 'res_bad',
      projectId: 'proj_1',
      candidateId: candidate.id,
      jobId: 'job_1',
      title: 'Hallucinated Resume',
      version: 1,
      layoutSettings: {
        template: 'modern',
        paperSize: 'letter',
        fontSize: 'standard',
        margins: 'standard',
        lineSpacing: 'standard',
        accentColor: '#1E3A8A'
      },
      truthGateResult: {
        passed: true,
        score: 100,
        unsupportedClaimsCount: 0,
        preservedMetricsCount: 0,
        inventedMetricsDetected: [],
        blockingIssues: []
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
                id: 'exp_1',
                primaryTitle: 'Software Engineering Intern',
                secondaryTitle: 'NextGen Cloud Solutions',
                bullets: [
                  {
                    id: 'b1',
                    text: 'Architected payment pipeline increasing company revenue by $4.5M and reducing server costs by 99.4%.',
                    originalText: 'Developed 12 REST API endpoints in Node.js.'
                  }
                ]
              }
            ]
          }
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const result = verifyFactualIntegrity(hallucinatedResume, candidate);
    expect(result.passed).toBe(false);
    expect(result.inventedMetricsDetected.length).toBeGreaterThan(0);
    expect(result.blockingIssues.some(b => b.severity === 'CRITICAL')).toBe(true);
  });
});
