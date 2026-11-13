// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { computeScore, deepAnalyzeCompetency } from '@/pages/demo/talentLensEngine';

const sampleResume = `
ALEX MORGAN
alex.morgan@example.com | github.com/alexm-eng

EXPERIENCE
Senior Software Engineer | Stripe | 2022 - Present
- Architected payment processing pipeline in Go handling 25,000 transactions per second.
- Designed distributed locking system using Redis and Raft consensus for payment settlement.
- Built Docker containers and deployed to Kubernetes clusters across multiple AWS regions.

EDUCATION
B.S. in Computer Science | University of Washington | 2016 - 2020

SKILLS
Go, Distributed Systems, Kubernetes, Docker, Redis, PostgreSQL, Python
`;

const sampleJd = `
Role: Senior Distributed Systems Engineer
Company: Cloudflare
Location: Remote

Requirements:
- 4+ years of professional software engineering experience with Go.
- Deep expertise in distributed systems, consensus algorithms (Raft, Paxos), and concurrency.
- Strong hands-on experience with Kubernetes, Docker, and containerized deployment.
`;

describe('Guarantee 1: Zero-Egress Scoring Engines (C1, C2)', () => {
  it('guarantees runAtsEngine performs zero fetch or network calls', async () => {
    const fetchSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    try {
      const resp = await runAtsEngine(sampleResume, sampleJd);

      expect(fetchSpy).not.toHaveBeenCalled();
      if (!resp.success) throw new Error('Engine failed');
      expect(resp.result.score).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('guarantees computeScore performs zero fetch or network calls', () => {
    const fetchSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    try {
      const dummyCompany = { name: 'Google', tier: 'top_product', industry: 'tech' };
      const dummyRole = { title: 'Software Engineer', level: 'IC2' };
      const analysis = deepAnalyzeCompetency(sampleResume, 'Go', 'working');
      const reqLevelMap: Record<string, string> = { Go: 'working' };

      const score = computeScore([analysis], reqLevelMap, sampleResume, dummyCompany, dummyRole);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(score).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
