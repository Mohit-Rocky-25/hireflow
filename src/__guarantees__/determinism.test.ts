// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { makeRunKey } from '@/domain/ids';
import { sha256Hex } from '@/lib/crypto/sha256';

const sampleResume = `
ALEX MORGAN
alex.morgan@example.com | github.com/alexm-eng

EXPERIENCE
Senior Software Engineer | Stripe | 2022 - Present
- Architected payment processing pipeline in Go handling 25,000 transactions per second.
- Designed distributed locking system using Redis and Raft consensus for payment settlement.
- Built Docker containers and deployed to Kubernetes clusters across multiple AWS regions.

Software Engineer | Datadog | 2020 - 2022
- Maintained distributed telemetry collection agent in Go and C++.
- Reduced CPU consumption by 35% through lock-free memory buffers.

EDUCATION
B.S. in Computer Science | University of Washington | 2016 - 2020

SKILLS
Go, Distributed Systems, Kubernetes, Docker, Redis, PostgreSQL, Microservices
`;

const sampleJd = `
Role: Senior Distributed Systems Engineer
Company: Cloudflare
Location: Remote

Requirements:
- 4+ years of professional software engineering experience with Go.
- Deep expertise in distributed systems, consensus algorithms (Raft, Paxos), and concurrency.
- Strong hands-on experience with Kubernetes, Docker, and containerized deployment.
- Experience building high-throughput low-latency network services and APIs.
`;

describe('Guarantee 2: Deterministic Engine Scoring (C1)', () => {
  it('guarantees identical inputs produce byte-identical scoring breakdowns and runKeys', async () => {
    const run1 = await runAtsEngine(sampleResume, sampleJd);
    const run2 = await runAtsEngine(sampleResume, sampleJd);

    if (!run1.success || !run2.success) {
      throw new Error('ATS engine failed');
    }

    expect(run1.result.score).toBe(run2.result.score);
    expect(run1.result.subscores).toEqual(run2.result.subscores);

    const rHash = await sha256Hex(sampleResume);
    const jHash = await sha256Hex(sampleJd);

    const key1 = await makeRunKey('ats_roast', rHash, jHash, '5.0.0');
    const key2 = await makeRunKey('ats_roast', rHash, jHash, '5.0.0');

    expect(key1).toBe(key2);
    expect(key1).toMatch(/^[0-9a-f]{64}$/);
  });
});
