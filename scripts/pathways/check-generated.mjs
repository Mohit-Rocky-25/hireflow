// ============================================================
// Pathways Generated Files Hash Checker
// Enforces Constitution Rule B4/H1 (Hand-edit detection)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const FACTS_DIR = path.join(ROOT_DIR, 'src', 'pathways', 'facts');

export function checkGeneratedHashes() {
  if (!fs.existsSync(FACTS_DIR)) return { ok: true, checked: 0 };

  const files = fs.readdirSync(FACTS_DIR).filter((f) => f.endsWith('.generated.ts'));
  const errors = [];

  for (const file of files) {
    const filePath = path.join(FACTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const match = content.match(/\/\/ CONTENT-HASH: sha256:([a-f0-9]{64})/);
    if (!match) {
      errors.push(`${file}: Missing valid CONTENT-HASH header. Hand-editing is strictly forbidden (H1).`);
      continue;
    }

    const expectedHash = match[1];
    const headerSplit = content.indexOf('// ============================================================', 20);
    const rest = content.slice(headerSplit);
    const splitMatch = rest.match(/\r?\n\r?\n/);
    const bodyContent = splitMatch ? rest.slice(splitMatch.index + splitMatch[0].length) : '';

    const actualHash = crypto.createHash('sha256').update(bodyContent.replace(/\r\n/g, '\n').trim()).digest('hex');
    if (actualHash !== expectedHash) {
      errors.push(`${file}: CONTENT-HASH MISMATCH! Expected ${expectedHash}, computed ${actualHash}. File was hand-edited or out-of-sync (H1). Run npm run pathways:build to regenerate.`);
    }
  }

  return { ok: errors.length === 0, checked: files.length, errors };
}

if (process.argv[1]?.endsWith('check-generated.mjs')) {
  const result = checkGeneratedHashes();
  if (!result.ok) {
    console.error(`❌ Generated Files Verification FAILED with ${result.errors.length} errors:`);
    result.errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log(`✅ All ${result.checked} generated facts verified with valid cryptographic content hashes.`);
    process.exit(0);
  }
}
