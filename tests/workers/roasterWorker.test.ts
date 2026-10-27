// ============================================================
// HireFlow v4 — Roaster Worker & Client Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { RoasterClient } from '../../src/workers/roasterClient';
import { RoasterWorkerError } from '../../src/workers/roaster.worker';

describe('Issue 4 Stage 1: Web Worker Orchestration & Typed Errors', () => {
  const client = new RoasterClient();

  const validResume = `
    Rohan Patel | rohan@example.com | +91 98765 43210
    Technical Skills:
    Python, Django, PostgreSQL, Docker, Git
    Experience:
    Backend Engineer | Tech Corp (2022 - Present)
    - Architected scalable REST microservices handling 10,000 requests/sec.
    - Optimized PostgreSQL query execution plans, reducing p99 latency by 35%.
  `;

  const validJd = `
    Role: Senior Python Developer
    Requirements:
    - 3+ years experience with Python and Django.
    - Strong database skills in PostgreSQL.
    - Nice to have: Docker and Git.
  `;

  it('rejects empty or brief resume text with typed INPUT_TOO_SHORT error', async () => {
    try {
      await client.analyze({ resumeText: 'Too short', jdText: validJd });
      expect.fail('Should have thrown INPUT_TOO_SHORT');
    } catch (err: any) {
      const workerError = err as RoasterWorkerError;
      expect(workerError.code).toBe('INPUT_TOO_SHORT');
      expect(workerError.message).toContain('Resume text is too brief');
    }
  });

  it('rejects empty or brief JD text with typed INPUT_TOO_SHORT error', async () => {
    try {
      await client.analyze({ resumeText: validResume, jdText: 'Tiny' });
      expect.fail('Should have thrown INPUT_TOO_SHORT');
    } catch (err: any) {
      const workerError = err as RoasterWorkerError;
      expect(workerError.code).toBe('INPUT_TOO_SHORT');
      expect(workerError.message).toContain('Job description text is too brief');
    }
  });

  it('successfully evaluates valid inputs via resilient fallback path', async () => {
    const facts = await client.analyze({
      resumeText: validResume,
      jdText: validJd,
      options: { experienceLevel: '1-3' },
    });

    expect(facts).toBeDefined();
    expect(facts.scoreBreakdown).toBeDefined();
    expect(facts.scoreBreakdown.finalScore).toBeGreaterThan(0);
    expect(facts.scoreBreakdown.finalScore).toBeLessThanOrEqual(100);
    expect(facts.scoreBreakdown.scoreBand).toBeDefined();
    expect(facts.scoreBreakdown.uncertaintyInterval).toBeDefined();
    expect(facts.scoreBreakdown.mustHaveCoverageScore).toBeGreaterThan(0);
  });
});
