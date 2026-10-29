// ============================================================
// HIREFLOW REACH OUT (COLD OUTREACH) VERIFICATION GATE (STAGE 6)
// Enforces complete verification across all Stage 0-6 invariants:
// 1. Template schema validation (validator.ts over all 85 templates)
// 2. Authoring lint (D6 standard, 0 overflows, 0 clichés, 0 duplicate openers)
// 3. Engine unit test suite (normalise, validate, assemble, length, subject, quality)
// 4. UI test suite (accessible, deterministic, zero UI math, 360px responsive)
// 5. Privacy & storage test suite (0 network egress, corrupted JSON safe, quota safe)
// 6. Golden snapshot regression suite (85 templates x 5 personas = 425 messages)
// 7. Claims linter (0 banned marketing promises)
// 8. UI math linter (0 math/scoring in UI components)
// 9. Negative verification (demonstrably fails on invalid inputs)
// ============================================================

import { execSync } from 'child_process';
import { validateOutreachTemplate } from '../../src/features/suite/outreach/validator';
import { isMatrixCellValid } from '../../src/config/outreach';
import { fitMessageToLength } from '../../src/features/suite/outreach/engine/lengthFit';
import { lintTemplateLibrary } from './lint-templates';
import { OutreachTemplateV2 } from '../../src/features/suite/outreach/types';
import templatesData from '../../src/data/suite/outreach/templates.json';

interface GateStep {
  name: string;
  command: string;
  description: string;
}

const GATE_STEPS: GateStep[] = [
  {
    name: '1. Template Schema Validation',
    command: 'npx vitest run src/data/__tests__/outreachTemplatesV2.test.ts',
    description: 'Zero-dependency schema validation across all templates',
  },
  {
    name: '2. D6 Authoring Linter',
    command: 'npx tsx scripts/outreach/lint-templates.ts',
    description: 'Audits block variants, opening lines, lengths, and banned patterns',
  },
  {
    name: '3. Engine Unit Tests',
    command: 'npx vitest run tests/outreach/engine.spec.ts',
    description: '105 pure engine tests covering normalisation, slots, assembly, and quality',
  },
  {
    name: '4. UI Integration Tests',
    command: 'npx vitest run tests/outreach/ui.spec.ts',
    description: 'Accessible UI tests, free/premium toggle, variant cycler, and 0 UI math',
  },
  {
    name: '5. Privacy & Storage Tests',
    command: 'npx vitest run tests/outreach/privacyAndStorage.spec.ts',
    description: 'Zero telemetry egress, local quota handling, corrupted JSON safety',
  },
  {
    name: '6. Golden Snapshot Regression',
    command: 'npx vitest run tests/outreach/goldenSnapshot.spec.ts',
    description: '425 deterministic rendered outputs verified against golden SHA-256 hash',
  },
  {
    name: '7. Claims & Honesty Linter',
    command: 'npm run check:claims',
    description: 'Guarantees zero banned or misleading conversion promises',
  },
  {
    name: '8. Zero UI Arithmetic',
    command: 'npm run check:ui-math',
    description: 'Scans UI components for zero scoring/length arithmetic calculations',
  },
];

/**
 * Executes Stage 6.2 negative verification checks.
 * Proves that invalid inputs are demonstrably rejected by the gate.
 */
function runNegativeVerification(): { passed: boolean; log: string[] } {
  const log: string[] = [];
  let allPassed = true;

  // 1. Negative Case A: Cold template with referral ask must fail matrix / validation
  try {
    const res = isMatrixCellValid('cold_email', 'G2', 'engineer or peer', 'cold');
    if (res.valid) {
      log.push('❌ [Negative A Failed]: Cold email with referral ask was incorrectly evaluated as valid matrix cell.');
      allPassed = false;
    } else {
      log.push('✅ [Negative A Passed]: Matrix strictly rejects referral ask from cold stranger (Evidence E5).');
    }
  } catch (e) {
    log.push(`❌ [Negative A Error]: ${(e as Error).message}`);
    allPassed = false;
  }

  // 2. Negative Case B: 250-character free-profile note must overflow free limit
  try {
    const dummyTemplate: OutreachTemplateV2 = {
      id: 'test-overflow-note',
      name: 'Test Overflow Note',
      channel: 'linkedin_connect',
      goal: 'G1',
      recipientType: 'in-house recruiter',
      relationship: 'cold',
      angle: 'skill-led',
      strategy: { whyItWorks: 'Test', whenNotToUse: 'Test', tradeoffs: 'Test' },
      requiredSlots: ['targetCompany'],
      optionalSlots: [],
      blocks: {
        hook: ['A'.repeat(150)],
        proof: ['B'.repeat(50)],
        ask: ['C'.repeat(100)],
        close: ['D'.repeat(20)],
      },
      needsAuthoring: false,
    };
    const fitted = fitMessageToLength(dummyTemplate, { targetCompany: 'Test' }, 0, { isPremiumLinkedIn: false });
    if (fitted.status === 'optimal' || fitted.measuredLength <= 200) {
      log.push(`❌ [Negative B Failed]: 250+ character note failed to trigger length overflow on LinkedIn Free (got status: ${fitted.status}, length: ${fitted.measuredLength}).`);
      allPassed = false;
    } else {
      log.push(`✅ [Negative B Passed]: 250+ char note correctly caught with status "${fitted.status}" (${fitted.measuredLength}/200 chars).`);
    }
  } catch (e) {
    log.push(`❌ [Negative B Error]: ${(e as Error).message}`);
    allPassed = false;
  }

  // 3. Negative Case C: Template with unclosed stray brace must fail validator
  try {
    const strayBraceTemplate: unknown = {
      id: 'test-stray-brace',
      name: 'Test Stray Brace',
      channel: 'cold_email',
      goal: 'G1',
      recipientType: 'in-house recruiter',
      relationship: 'cold',
      angle: 'skill-led',
      strategy: { whyItWorks: 'Test', whenNotToUse: 'Test', tradeoffs: 'Test' },
      requiredSlots: ['targetCompany'],
      optionalSlots: [],
      blocks: {
        hook: ['Hello {{recipientName, how are you?'], // Unclosed brace
        proof: ['Proof'],
        ask: ['Ask'],
        close: ['Close'],
      },
      needsAuthoring: false,
    };
    const validation = validateOutreachTemplate(strayBraceTemplate);
    const hasBraceError = validation.errors.some((i) => i.message.includes('Unclosed brace'));
    if (!hasBraceError) {
      log.push('❌ [Negative C Failed]: Template with stray unclosed brace was not flagged with an error.');
      allPassed = false;
    } else {
      log.push('✅ [Negative C Passed]: Template with unclosed brace correctly rejected by validator.');
    }
  } catch (e) {
    log.push(`❌ [Negative C Error]: ${(e as Error).message}`);
    allPassed = false;
  }

  // 4. Negative Case D: Duplicate opening sentence across templates must fail authoring linter
  try {
    const templates = templatesData as unknown as OutreachTemplateV2[];
    const firstOpener = templates[0]?.blocks.hook[0] || 'Default opening';
    const fakeDuplicateTemplate: OutreachTemplateV2 = {
      id: 'test-duplicate-opener',
      name: 'Test Duplicate Opener',
      channel: 'cold_email',
      goal: 'role_inquiry',
      recipientType: 'recruiter',
      angle: 'direct_pitch',
      strategy: { whyItWorks: 'Test', whenNotToUse: 'Test', tradeoffs: 'Test' },
      requiredSlots: ['targetCompany'],
      optionalSlots: [],
      blocks: {
        hook: [firstOpener], // Duplicate of template[0]
        proof: ['Unique proof'],
        ask: ['Unique ask'],
        close: ['Unique close'],
      },
      needsAuthoring: false,
    };
    const audit = lintTemplateLibrary([templates[0], fakeDuplicateTemplate]);
    const hasDuplicateError = audit.errors.some((err) => err.includes('Duplicate opening sentence'));
    if (!hasDuplicateError) {
      log.push('❌ [Negative D Failed]: Duplicate opening sentence was not caught by authoring linter.');
      allPassed = false;
    } else {
      log.push('✅ [Negative D Passed]: Duplicate opening sentence caught and rejected by authoring linter.');
    }
  } catch (e) {
    log.push(`❌ [Negative D Error]: ${(e as Error).message}`);
    allPassed = false;
  }

  return { passed: allPassed, log };
}

export function runOutreachGate(): boolean {
  console.log('====================================================');
  console.log('HIREFLOW REACH OUT (COLD OUTREACH) — VERIFICATION GATE');
  console.log('====================================================\n');

  let allPassed = true;
  const results: Array<{ name: string; passed: boolean; durationMs: number }> = [];

  // Run Standard Positive Steps
  for (const step of GATE_STEPS) {
    console.log(`[RUNNING] ${step.name}: ${step.description}...`);
    const t0 = Date.now();
    try {
      execSync(step.command, { stdio: 'inherit' });
      const durationMs = Date.now() - t0;
      console.log(`✅ [PASSED] ${step.name} (${durationMs}ms)\n`);
      results.push({ name: step.name, passed: true, durationMs });
    } catch {
      const durationMs = Date.now() - t0;
      console.error(`❌ [FAILED] ${step.name} (${durationMs}ms)\n`);
      results.push({ name: step.name, passed: false, durationMs });
      allPassed = false;
      break; // Exit early on first failure per specification
    }
  }

  if (allPassed) {
    // Run Negative Verification Suite
    console.log('[RUNNING] 9. Negative Verification Suite...');
    const t0 = Date.now();
    const neg = runNegativeVerification();
    const durationMs = Date.now() - t0;
    for (const line of neg.log) {
      console.log(`   ${line}`);
    }
    if (neg.passed) {
      console.log(`✅ [PASSED] 9. Negative Verification Suite (${durationMs}ms)\n`);
      results.push({ name: '9. Negative Verification', passed: true, durationMs });
    } else {
      console.error(`❌ [FAILED] 9. Negative Verification Suite (${durationMs}ms)\n`);
      results.push({ name: '9. Negative Verification', passed: false, durationMs });
      allPassed = false;
    }
  }

  console.log('====================================================');
  console.log('REACH OUT GATE EXECUTIVE SUMMARY');
  console.log('====================================================');
  console.table(results);

  if (allPassed) {
    console.log('\n🎉 ALL GATES PASSED! Reach Out v2 is verified production-ready.\n');
    return true;
  } else {
    console.error('\n⚠️ REACH OUT GATE FAILED. Please review failures above.\n');
    return false;
  }
}

if (process.argv[1].endsWith('gate.ts') || process.argv[1].endsWith('gate.js')) {
  const passed = runOutreachGate();
  process.exit(passed ? 0 : 1);
}
