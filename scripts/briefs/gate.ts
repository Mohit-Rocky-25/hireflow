// ============================================================
// HireFlow Brief Quality Gate (`npm run briefs:gate`)
// Strict automated barrier preventing invalid or defective briefs
// ============================================================

import fs from 'fs';
import path from 'path';
import { lintBriefs } from './lint';

export interface GateResult {
  passed: boolean;
  checksRun: number;
  checksPassed: number;
  failures: string[];
}

export function runBriefsGate(): GateResult {
  const root = process.cwd();
  const datasetPath = path.join(root, 'src/data/suite/project-briefs.json');
  const kitsDir = path.join(root, 'tests/fixtures/briefs-kits');

  const failures: string[] = [];
  let checksRun = 0;
  let checksPassed = 0;

  console.log('====================================================');
  console.log('HIREFLOW AI — MASTER PROJECT BRIEFS QUALITY GATE');
  console.log('====================================================\n');

  // Check 1: Catalog existence and count
  checksRun++;
  if (!fs.existsSync(datasetPath)) {
    failures.push('Dataset file src/data/suite/project-briefs.json missing');
  } else {
    checksPassed++;
  }

  const briefs = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  // Check 2: Schema completeness
  checksRun++;
  let schemaErrors = 0;
  briefs.forEach((b: any) => {
    if (!b.id || !b.title || !b.domain || !b.difficulty || !b.techStack || !b.problemStatement || !b.verificationRubric) {
      schemaErrors++;
    }
    if (!b.lastReviewed || !b.reviewBy || !b.safetyLegal) {
      schemaErrors++;
    }
  });
  if (schemaErrors > 0) {
    failures.push(`Schema Error: ${schemaErrors} briefs missing mandatory standard fields`);
  } else {
    checksPassed++;
  }

  // Check 3: Linter Zero S0/S1 Rule
  checksRun++;
  const lintFindings = lintBriefs(briefs);
  const criticalFindings = lintFindings.filter((f) => f.severity === 'S0' || f.severity === 'S1');
  if (criticalFindings.length > 0) {
    failures.push(`Lint Failure: Found ${criticalFindings.length} open S0/S1 defects (e.g. ${criticalFindings[0].defectClass} in ${criticalFindings[0].briefId})`);
  } else {
    checksPassed++;
  }

  // Check 4: Staleness Gate
  checksRun++;
  const staleBriefs = briefs.filter((b: any) => {
    if (!b.reviewBy) return true;
    return new Date(b.reviewBy) < new Date('2026-10-28');
  });
  if (staleBriefs.length > 0) {
    failures.push(`Currency Failure: ${staleBriefs.length} briefs have expired reviewBy dates`);
  } else {
    checksPassed++;
  }

  // Check 5: Verification Kit & Rubric 1:1 Mapping
  checksRun++;
  let missingKits = 0;
  let unmappedRubricItems = 0;

  briefs.forEach((b: any) => {
    const kitPath = path.join(kitsDir, b.id, 'manifest.json');
    if (!fs.existsSync(kitPath)) {
      missingKits++;
    } else {
      const manifest = JSON.parse(fs.readFileSync(kitPath, 'utf8'));
      if (manifest.checks.length !== b.verificationRubric.length) {
        unmappedRubricItems++;
      }
    }
  });

  if (missingKits > 0) {
    failures.push(`Verification Kit Failure: ${missingKits} briefs lack an isolated verification kit in tests/fixtures/briefs-kits/`);
  } else if (unmappedRubricItems > 0) {
    failures.push(`Verification Kit Failure: ${unmappedRubricItems} briefs have rubric count mismatch with kit checks`);
  } else {
    checksPassed++;
  }

  // Check 6: Verb Diversity in Resume Bullets
  checksRun++;
  const verbCounts: Record<string, number> = {};
  briefs.forEach((b: any) => {
    const formula = b.portfolioBulletFormula || '';
    const firstWord = formula.trim().split(/\s+/)[0] || '';
    if (firstWord) {
      verbCounts[firstWord] = (verbCounts[firstWord] || 0) + 1;
    }
  });

  const dominantVerb = Object.entries(verbCounts).find(([_, count]) => count / briefs.length > 0.4);
  if (dominantVerb) {
    failures.push(`Verb Diversity Breach: Verb "${dominantVerb[0]}" used in ${dominantVerb[1]} briefs (> 40% threshold)`);
  } else {
    checksPassed++;
  }

  // Summary
  const passed = failures.length === 0;
  console.log(`Gate Checks Run: ${checksRun}`);
  console.log(`Gate Checks Passed: ${checksPassed}`);
  console.log(`Gate Result: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`);

  if (!passed) {
    console.error('FAILURES DETECTED:');
    failures.forEach((f) => console.error(` - ❌ ${f}`));
  } else {
    console.log('✓ All quality gates passed! Catalog is verified, consistent, and locked.');
  }

  return { passed, checksRun, checksPassed, failures };
}

if (process.argv[1] && process.argv[1].endsWith('gate.ts')) {
  const res = runBriefsGate();
  process.exit(res.passed ? 0 : 1);
}
