import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ingestRawText } from '../../src/engine/ingestion/index';
import { analyzeDeterministic } from '../../src/lib/ats/analyzeDeterministic';
import { evaluateTruthGate } from '../../src/engine/tailor/truthGate';
import { generateOutreach } from '../../src/features/suite/outreach/generateOutreach';
import { bundleBriefsForGaps } from '../../src/features/suite/briefs/bundleBriefs';

describe('HireFlow v4: End-to-End Synthetic Pipeline & Candidate Flow', () => {
  const rootDir = process.cwd();
  const fixturesDir = path.join(rootDir, 'tests', 'fixtures', 'synthetic');

  const resume1 = fs.readFileSync(path.join(fixturesDir, 'resume_01_strong_cs.txt'), 'utf8');
  const jd1 = fs.readFileSync(path.join(fixturesDir, 'jd_01_campus_sde_fresher.txt'), 'utf8');

  let networkCallCount = 0;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    networkCallCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      networkCallCount++;
      return Promise.reject(new Error('Network access strictly blocked in test'));
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('runs complete candidate flow with 100% determinism and zero network egress', () => {
    // 1. Ingestion
    const ingest = ingestRawText(resume1);
    expect(ingest.diagnostics.totalLines).toBeGreaterThan(20);
    expect(ingest.sections.length).toBeGreaterThan(0);
    expect(ingest.entities.degrees.length).toBeGreaterThan(0);

    // 2. ATS Deterministic Analysis
    const result1 = analyzeDeterministic(resume1, jd1);
    expect(result1.scoreBreakdown.finalScore).toBeGreaterThanOrEqual(0);
    expect(result1.scoreBreakdown.finalScore).toBeLessThanOrEqual(100);
    expect(result1.scoreBreakdown.scoreBand).toBeDefined();
    expect(result1.scoreBreakdown.uncertaintyInterval).toHaveLength(2);
    expect(result1.scoreBreakdown.uncertaintyInterval[0]).toBeLessThanOrEqual(result1.scoreBreakdown.finalScore);
    expect(result1.scoreBreakdown.uncertaintyInterval[1]).toBeGreaterThanOrEqual(result1.scoreBreakdown.finalScore);

    // 3. Repeat to verify strict mathematical determinism
    const result2 = analyzeDeterministic(resume1, jd1);
    expect(result2.scoreBreakdown.finalScore).toBe(result1.scoreBreakdown.finalScore);
    expect(result2.scoreBreakdown.scoreBand).toBe(result1.scoreBreakdown.scoreBand);
    expect(result2.scoreBreakdown.uncertaintyInterval).toEqual(result1.scoreBreakdown.uncertaintyInterval);
    expect(result2.skillMatches).toEqual(result1.skillMatches);

    // 4. Tailor Truth Gate validation
    const truthGate = evaluateTruthGate({
      candidateLedger: {
        projects: [{ name: 'Portfolio API', techStack: ['PostgreSQL', 'Node.js'], bullets: ['Built REST APIs with 500k users'] }],
        skills: ['PostgreSQL', 'Node.js', 'React']
      } as any,
      originalBullet: 'Built REST APIs with 500k users using PostgreSQL',
      proposedBullet: 'Engineered scalable REST APIs serving 500k users using PostgreSQL'
    });
    expect(truthGate.passed).toBe(true);
    expect(truthGate.violations).toHaveLength(0);

    // 5. Outreach Generator
    const outreach = generateOutreach({
      candidateName: 'Test Candidate',
      targetCompany: 'Razorpay',
      targetRole: 'Software Engineer - Fresher',
      recipientRole: 'Campus Hiring Lead',
      topSkills: ['React', 'Node.js', 'PostgreSQL'],
      factsUsed: ['B.Tech CSE 2026', 'Built Scalable Portfolio API', 'GitHub: testcand']
    }, 'linkedin', 'project-first');
    expect(outreach.body).toContain('Razorpay');
    expect(outreach.body.length).toBeGreaterThan(50);

    // 6. Gaps & Briefs Bundler
    const missingSkills = result1.skillMatches
      .filter((m) => m.status === 'missing')
      .map((m) => m.skill);
    const bundle = bundleBriefsForGaps(missingSkills.length > 0 ? missingSkills : ['react', 'docker']);
    expect(bundle.totalEstimatedHours).toBeGreaterThanOrEqual(0);

    // 7. Network Egress assertion
    expect(networkCallCount).toBe(0);
  });
});
