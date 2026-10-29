// ============================================================
// HIREFLOW TAILOR MY RESUME REGRESSION GATE (STAGE 9)
// Enforces complete verification across all Stage 0-8 invariants:
// 1. TypeScript compilation (Strict, zero any)
// 2. Known Issues Register (12/12 defects fixed)
// 3. Dataset Integrity & Privacy
// 4. Zero UI arithmetic (check:ui-math)
// 5. Zero banned claims (check:claims)
// 6. Zero network egress (privacy:check)
// 7. Full Tailor Test Suite (Stages 1-8 unit, round-trip, layout)
// ============================================================

import { execSync } from 'child_process';

interface GateStep {
  name: string;
  command: string;
  description: string;
}

const GATE_STEPS: GateStep[] = [
  {
    name: '1. TypeScript Typecheck',
    command: 'npx tsc --noEmit',
    description: 'Strict TypeScript compilation with zero errors',
  },
  {
    name: '2. Known Issues Register',
    command: 'npm run test:known-issues',
    description: 'Verifies 12/12 reproduced defects are resolved',
  },
  {
    name: '3. Dataset Integrity',
    command: 'npm run test:data',
    description: 'Validates schemas, synthetic personas, and datasets',
  },
  {
    name: '4. Zero UI Arithmetic',
    command: 'npm run check:ui-math',
    description: 'Scans UI components for zero scoring/math calculations',
  },
  {
    name: '5. Claims & Honesty Linter',
    command: 'npm run check:claims',
    description: 'Guarantees zero banned or misleading claims',
  },
  {
    name: '6. Privacy & Zero-Egress Scanner',
    command: 'npm run privacy:check',
    description: 'Guarantees zero network calls or telemetry',
  },
  {
    name: '7. Tailor Test Suites (Stages 1-8)',
    command: 'npx vitest run tests/tailor/stage1-ledger.spec.ts tests/tailor/stage2-ingest.spec.ts tests/tailor/stage3-planner.spec.ts tests/tailor/stage4-composer.spec.ts tests/tailor/stage5-truth-gate.spec.ts tests/tailor/stage6-layout.spec.ts tests/tailor/stage7-round-trip.spec.ts tests/tailor/stage8-ui.spec.ts',
    description: 'All unit, round-trip, layout, and UI test suites',
  },
];

export function runTailorGate(): boolean {
  console.log('====================================================');
  console.log('HIREFLOW RESUME REBUILD — COMPREHENSIVE TAILOR GATE');
  console.log('====================================================\n');

  let allPassed = true;
  const results: Array<{ name: string; passed: boolean; durationMs: number }> = [];

  for (const step of GATE_STEPS) {
    console.log(`[RUNNING] ${step.name}: ${step.description}...`);
    const t0 = Date.now();
    try {
      execSync(step.command, { stdio: 'inherit' });
      const durationMs = Date.now() - t0;
      console.log(`✅ [PASSED] ${step.name} (${durationMs}ms)\n`);
      results.push({ name: step.name, passed: true, durationMs });
    } catch (err) {
      const durationMs = Date.now() - t0;
      console.error(`❌ [FAILED] ${step.name} (${durationMs}ms)\n`);
      results.push({ name: step.name, passed: false, durationMs });
      allPassed = false;
    }
  }

  console.log('====================================================');
  console.log('TAILOR GATE EXECUTIVE SUMMARY');
  console.log('====================================================');
  console.table(results);

  if (allPassed) {
    console.log('\n🎉 ALL GATES PASSED! Tailor My Resume rebuild is verified production-ready.\n');
    return true;
  } else {
    console.error('\n⚠️ TAILOR GATE FAILED. Please review failures above.\n');
    return false;
  }
}

if (process.argv[1].endsWith('tailor-gate.ts') || process.argv[1].endsWith('tailor-gate.js')) {
  const passed = runTailorGate();
  process.exit(passed ? 0 : 1);
}
