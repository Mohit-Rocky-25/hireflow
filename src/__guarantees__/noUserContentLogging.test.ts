// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import type { AtsEngineResult } from '@/lib/ats';

describe('Guarantee 6: Privacy — No User Content in Console (C2)', () => {
  it('guarantees journal adapters never log raw candidate resume text to console', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const secretText = 'CONFIDENTIAL_RESUME_SECRET_TEXT_12345';

    atsToAuditInput({
      result: {
        score: 80,
        subscores: { mustHaveCoverage: 80, evidenceDepth: 80, impactMetrics: 80 },
        skillResults: [],
        penalties: [],
        fixFirst: [],
      } as unknown as AtsEngineResult,
      resumeText: secretText,
      jdText: 'Job description text',
      source: 'paste',
    });

    for (const call of consoleSpy.mock.calls) {
      for (const arg of call) {
        expect(String(arg)).not.toContain(secretText);
      }
    }

    consoleSpy.mockRestore();
  });
});

