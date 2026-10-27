// ============================================================
// Fixture Determinism Verification Tool
// Computes SHA-256 before & after regenerating all fixtures
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { generateFixtures } from './generateAllFixtures';

function getFileHashes(dir: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(dir)) return result;
  for (const filename of fs.readdirSync(dir)) {
    const full = path.join(dir, filename);
    const stat = fs.statSync(full);
    if (stat.isFile()) {
      const buf = fs.readFileSync(full);
      result[filename] = crypto.createHash('sha256').update(buf).digest('hex');
    }
  }
  return result;
}

export async function verifyDeterminism(): Promise<boolean> {
  const baseDir = path.resolve('tests/fixtures/parsing');
  console.log('[Determinism Test] Step 1: Generating first run...');
  await generateFixtures(baseDir);

  const devHashes1 = getFileHashes(path.join(baseDir, 'dev'));
  const holdoutHashes1 = getFileHashes(path.join(baseDir, 'holdout'));

  console.log(
    `[Determinism Test] Recorded hashes for ${Object.keys(devHashes1).length} DEV files and ${
      Object.keys(holdoutHashes1).length
    } HOLDOUT files.`
  );

  console.log('[Determinism Test] Step 2: Regenerating second run...');
  // Brief delay to ensure system clock advances
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await generateFixtures(baseDir);

  const devHashes2 = getFileHashes(path.join(baseDir, 'dev'));
  const holdoutHashes2 = getFileHashes(path.join(baseDir, 'holdout'));

  let mismatches = 0;
  for (const [file, hash1] of Object.entries(devHashes1)) {
    const hash2 = devHashes2[file];
    if (hash1 !== hash2) {
      console.error(`[Determinism Test] MISMATCH in DEV: ${file} (Run 1: ${hash1.slice(0, 8)} != Run 2: ${hash2?.slice(0, 8)})`);
      mismatches++;
    }
  }

  for (const [file, hash1] of Object.entries(holdoutHashes1)) {
    const hash2 = holdoutHashes2[file];
    if (hash1 !== hash2) {
      console.error(`[Determinism Test] MISMATCH in HOLDOUT: ${file} (Run 1: ${hash1.slice(0, 8)} != Run 2: ${hash2?.slice(0, 8)})`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log(
      `[Determinism Test] SUCCESS! All ${
        Object.keys(devHashes1).length + Object.keys(holdoutHashes1).length
      } fixtures are 100% byte-identical across runs.`
    );
    return true;
  } else {
    console.error(`[Determinism Test] FAILED with ${mismatches} mismatches.`);
    return false;
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('verifyDeterminism')) {
  verifyDeterminism().then((ok) => {
    process.exit(ok ? 0 : 1);
  });
}
