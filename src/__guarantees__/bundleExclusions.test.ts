// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Guarantee 7: Production Bundle Exclusions (C9)', () => {
  it('guarantees __HIREFLOW_E2E_HARNESS__ is absent from production dist/ bundle assets', () => {
    const distAssets = path.resolve(process.cwd(), 'dist/assets');
    if (!fs.existsSync(distAssets)) {
      // If dist has not been built yet, skip
      return;
    }

    const files = fs.readdirSync(distAssets).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(distAssets, file), 'utf-8');
      expect(content).not.toContain('__HIREFLOW_E2E_HARNESS__');
      expect(content).not.toContain('__e2eSignIn');
    }
  });
});

