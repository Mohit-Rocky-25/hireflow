import fs from 'node:fs';
import path from 'node:path';
import { auditScript } from './auditLogClassification';

const originalPath = path.join(process.cwd(), 'scripts', 'verifyTalentLens.ts');
const tempPath = path.join(process.cwd(), 'scripts', 'verifyTalentLens.temp.ts');

try {
  const content = fs.readFileSync(originalPath, 'utf8');
  // Inject an uncomputed static claim
  const injectedContent = content.replace(
    "console.log('TALENTLENS VERIFICATION SUITE');",
    "console.log('TALENTLENS VERIFICATION SUITE');\n  console.log('injected uncomputed static claim: accuracy 99.5% PASS verified');"
  );
  fs.writeFileSync(tempPath, injectedContent, 'utf8');

  console.log('=== A0 AST SCANNER FAILURE PROOF (TEMPORARY SCRIPT WITH INJECTED STATIC CLAIM) ===');
  const results = auditScript(tempPath);
  const staticClaims = results.filter((r) => r.classification === 'STATIC CLAIM');

  console.log(`Audited temporary copy: ${tempPath}`);
  console.log(`Static claim violations detected: ${staticClaims.length}`);
  staticClaims.forEach((c) => {
    console.log(`  Line ${c.line}: [${c.classification}] ${c.excerpt} — ${c.reason}`);
  });

  const a0Pass = staticClaims.length === 0;
  console.log(`A0 Assertion Result on injected script: ${a0Pass ? 'PASS' : 'FAIL'}`);
  if (!a0Pass) {
    console.log('PROOF SUCCESS: A0 AST scanner successfully detected the injected static claim and failed!');
  } else {
    throw new Error('PROOF FAILED: A0 failed to detect the injected static claim!');
  }
} finally {
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
    console.log('Temporary file deleted cleanly.');
  }
}
