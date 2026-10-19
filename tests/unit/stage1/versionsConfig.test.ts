import { describe, it, expect } from 'vitest';
import { ENGINE_VERSION, computeConfigFingerprint } from '../../../src/config/versions';

describe('HireFlow v4 Versioning and Config Fingerprint (X1.4)', () => {
  it('exports semantic ENGINE_VERSION', () => {
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('produces deterministic config fingerprint starting with fnv1a:', () => {
    const fp1 = computeConfigFingerprint();
    const fp2 = computeConfigFingerprint();
    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^fnv1a:[0-9a-f]{16}$/);
  });
});
