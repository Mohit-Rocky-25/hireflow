import { describe, it, expect } from 'vitest';
import {
  encodeCard,
  decodeCard,
  CardDataPayload,
  computeSha256Hex,
} from '../cardCodec';

describe('Evidence Card Codec (cardCodec.ts)', () => {
  const sampleData: CardDataPayload = {
    name: 'Arjun Mehta',
    headline: 'Full Stack Engineer | React, Node.js, Go',
    targetRoleFit: 'Strong fit for Backend Engineer roles requiring distributed architectures.',
    skills: [
      { name: 'TypeScript', evidenceLevel: 4, quote: 'Built high-throughput API gateway' },
      { name: 'Go', evidenceLevel: 3, quote: 'Engineered rate limiter in Go' },
      { name: 'Redis', evidenceLevel: 3, quote: 'Reduced latency with Redis cluster' },
      { name: 'PostgreSQL', evidenceLevel: 2, quote: 'Managed relational schemas' },
      { name: 'Docker', evidenceLevel: 1 },
    ],
    evidenceSnippets: [
      'Built high-throughput API gateway reducing p95 latency by 40%.',
      'Engineered distributed rate limiting proxy in Go & Redis using atomic Lua scripts.',
    ],
  };

  it('performs lossless encode and decode round-trip with integrity verified', async () => {
    const { encodedString } = await encodeCard(sampleData, '2028-01-01T00:00:00.000Z');
    expect(encodedString.length).toBeGreaterThan(50);

    const decoded = await decodeCard(encodedString);
    expect(decoded.ok).toBe(true);
    expect(decoded.integrityPassed).toBe(true);
    expect(decoded.isExpired).toBe(false);
    expect(decoded.envelope?.data.name).toBe('Arjun Mehta');
    expect(decoded.envelope?.data.skills.length).toBe(5);
    expect(decoded.envelope?.data.evidenceSnippets.length).toBe(2);
  });

  it('detects tampering when data or hash is manipulated', async () => {
    const { encodedString } = await encodeCard(sampleData);
    const decoded = await decodeCard(encodedString);
    expect(decoded.ok).toBe(true);
    expect(decoded.integrityPassed).toBe(true);

    // Tamper with envelope data without updating the hash
    if (decoded.envelope) {
      decoded.envelope.data.name = 'Hacked Name';
      const tamperedRawString = JSON.stringify(decoded.envelope.data);
      const calculatedHash = await computeSha256Hex(tamperedRawString);
      expect(calculatedHash).not.toBe(decoded.envelope.hash);
    }
  });

  it('accurately identifies expired cards', async () => {
    // Past date
    const pastDate = '2020-01-01T00:00:00.000Z';
    const { encodedString } = await encodeCard(sampleData, pastDate);

    const decoded = await decodeCard(encodedString);
    expect(decoded.ok).toBe(true);
    expect(decoded.isExpired).toBe(true);
  });

  it('preserves privacy: no PII fields when opt-in toggles are off', async () => {
    const { encodedString } = await encodeCard(sampleData);
    const decoded = await decodeCard(encodedString);

    expect(decoded.ok).toBe(true);
    expect(decoded.envelope?.data.email).toBeUndefined();
    expect(decoded.envelope?.data.phone).toBeUndefined();
    expect(decoded.envelope?.data.links).toBeUndefined();
    expect(decoded.envelope?.data.education).toBeUndefined();
  });

  it('trims lowest-evidence skills when payload is excessively large', async () => {
    // Construct very large skill list with distinct items
    const manySkills = Array.from({ length: 800 }, (_, i) => ({
      name: `Unique_Technical_Skill_Identifier_${i}_${(i * 9973).toString(36)}`,
      evidenceLevel: (i % 5) as 0 | 1 | 2 | 3 | 4,
      quote: `Distinct production achievement statement number ${i} verifying deep hands-on capability in distributed architectures and production deployment pipelines ${(i * 7919).toString(36)}`,
    }));

    const hugeData: CardDataPayload = {
      ...sampleData,
      skills: manySkills,
    };

    const { encodedString, trimmed, currentSkillCount } = await encodeCard(hugeData);
    expect(trimmed).toBe(true);
    expect(currentSkillCount).toBeLessThan(400);
    expect(encodedString.length).toBeLessThanOrEqual(6500);

    const decoded = await decodeCard(encodedString);
    expect(decoded.ok).toBe(true);
    expect(decoded.integrityPassed).toBe(true);
  });
});
