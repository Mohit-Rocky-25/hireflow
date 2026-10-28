import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';

describe('Verification Kit Mutation Self-Test: brief-transactional-outbox-worker', () => {
  const kitDir = path.resolve(__dirname);
  const runner = path.join(kitDir, 'verify.mjs');

  it('PASSES when executed against golden reference fixture', () => {
    const golden = path.join(kitDir, 'fixtures/golden_reference.json');
    const stdout = execSync(`node "${runner}" "${golden}"`, { encoding: 'utf8' });
    const res = JSON.parse(stdout);
    expect(res.passed).toBe(true);
    expect(res.failedChecks).toBe(0);
    expect(res.passedChecks).toBe(res.totalChecks);
  });

  it('FAILS specifically when executed against broken integrity mutation', () => {
    const broken1 = path.join(kitDir, 'fixtures/mutation_broken_integrity.json');
    try {
      execSync(`node "${runner}" "${broken1}"`, { encoding: 'utf8', stdio: 'pipe' });
      expect.unreachable('Should have exited with non-zero code');
    } catch (err: any) {
      const res = JSON.parse(err.stdout.toString());
      expect(res.passed).toBe(false);
      expect(res.failedChecks).toBeGreaterThan(0);
      expect(res.checkResults[0].status).toBe('FAIL');
    }
  });

  it('FAILS specifically when executed against broken latency mutation', () => {
    const broken2 = path.join(kitDir, 'fixtures/mutation_broken_latency.json');
    try {
      execSync(`node "${runner}" "${broken2}"`, { encoding: 'utf8', stdio: 'pipe' });
      expect.unreachable('Should have exited with non-zero code');
    } catch (err: any) {
      const res = JSON.parse(err.stdout.toString());
      expect(res.passed).toBe(false);
      expect(res.failedChecks).toBeGreaterThan(0);
    }
  });
});
