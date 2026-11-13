// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { planAuditRecord } from '@/features/journal/auditRecorder';
import type { RecordAuditInput } from '@/features/journal/auditRecorder';

describe('Guarantee 3: Audit Journal Immutability & Idempotence (C8)', () => {
  it('deduplicates audits sharing the same runKey without mutating historical records', async () => {
    const input: RecordAuditInput = {
      kind: 'ats_roast',
      engineVersion: '5.0.0',
      overallScore: 85,
      resume: {
        workspaceId: null,
        versionId: null,
        label: 'Candidate Resume',
        rawText: 'Resume text for immutability test',
      },
      jd: {
        rawText: 'Job description text for immutability test',
        origin: 'pasted',
        company: 'Stripe',
        roleTitle: 'Staff Engineer',
      },
      breakdown: [],
      gaps: [],
      strengths: [],
      evidence: [],
      findings: {},
    };

    const deps = {
      uuid: () => 'fixed-uuid-1',
      now: () => '2026-11-13T10:00:00Z',
    };

    const first = await planAuditRecord(input, [], deps);
    expect(first.status).toBe('created');
    if (first.status !== 'created') return;

    // Plan again with identical input and existing list containing first entry
    const second = await planAuditRecord(input, [first.entry], deps);
    expect(second.status).toBe('duplicate');
    if (second.status !== 'duplicate') return;

    expect(second.entry.id).toBe(first.entry.id);
    expect(second.entry.runKey).toBe(first.entry.runKey);
  });
});
