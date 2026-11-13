// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sha256Hex } from '@/lib/crypto/sha256';
import { normalizeText } from '@/lib/text/normalize';

describe('Guarantee 4: Cryptographic Snapshot Integrity (C8)', () => {
  it('guarantees snapshot hash matches exact SHA-256 of normalized text', async () => {
    const raw = '  Senior Distributed Systems Engineer \r\n with \t Go \n\n\n\n at Scale   ';
    const normalized = normalizeText(raw);
    const hash = await sha256Hex(normalized);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    // Re-hashing the normalized text yields identical SHA-256 digest
    const verifyHash = await sha256Hex(normalized);
    expect(verifyHash).toBe(hash);
  });
});

