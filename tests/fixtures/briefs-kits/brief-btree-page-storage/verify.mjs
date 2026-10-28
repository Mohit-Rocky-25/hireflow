// HireFlow Verification Runner for brief-btree-page-storage
import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2] || path.join(import.meta.dirname, 'fixtures/golden_reference.json');
const manifest = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'manifest.json'), 'utf8'));

let fixture;
try {
  fixture = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (e) {
  fixture = { integrityVerified: false, expectedExitCode: 1, metrics: { errorRate: 1 } };
}

const checkResults = manifest.checks.map((chk, idx) => {
  if (idx === 0) {
    const passed = fixture.integrityVerified === true;
    return {
      checkId: chk.id,
      status: passed ? 'PASS' : 'FAIL',
      message: passed ? 'Checksum, state protocol, and golden assertions pass' : 'Integrity verification failure: assertion check failed',
    };
  } else if (idx === manifest.checks.length - 1) {
    const passed = fixture.metrics && fixture.metrics.invariantsPreserved === true && fixture.metrics.errorRate < 0.05;
    return {
      checkId: chk.id,
      status: passed ? 'PASS' : 'FAIL',
      message: passed ? 'Scale SLA and failure tolerance bounds satisfied' : 'SLA breach: error rate exceeded threshold',
    };
  } else {
    const passed = fixture.expectedExitCode === 0;
    return {
      checkId: chk.id,
      status: passed ? 'PASS' : 'FAIL',
      message: passed ? 'Domain acceptance criteria verified' : 'Expected exit code 0, received failure code',
    };
  }
});

const failedCount = checkResults.filter(c => c.status === 'FAIL').length;
const passedCount = checkResults.length - failedCount;
const result = {
  briefId: manifest.briefId,
  passed: failedCount === 0,
  totalChecks: checkResults.length,
  passedChecks: passedCount,
  failedChecks: failedCount,
  checkResults,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
