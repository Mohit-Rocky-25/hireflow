// ============================================================
// Careers Data Platform — Canonical Integrity & Data Validator
// Runs comprehensive Vitest validation suite on TypeScript platform data
// ============================================================

import { execSync } from 'child_process';

try {
  console.log('Running Careers Platform Data Validation via Vitest...');
  const output = execSync('npx vitest run src/__tests__/careers/validatePlatformData.test.ts', {
    encoding: 'utf-8',
    stdio: 'inherit',
  });
  console.log('✓ All Careers Platform Data Integrity Checks PASSED');
} catch (err) {
  console.error('Validation test failed');
  process.exit(1);
}
