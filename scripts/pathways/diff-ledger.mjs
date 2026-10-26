// ============================================================
// Pathways Ledger Diff Tool
// Shows changed ledger rows between two git revisions or working tree
// Governed by Spec C9
// ============================================================

import { execSync } from 'node:child_process';

export function diffLedger(rev1 = 'HEAD', rev2 = '') {
  try {
    const diffCmd = rev2
      ? `git diff ${rev1} ${rev2} -- docs/pathways/ledger`
      : `git diff ${rev1} -- docs/pathways/ledger`;

    const output = execSync(diffCmd, { encoding: 'utf8' });

    if (!output.trim()) {
      console.log(`✅ Zero ledger diffs found between ${rev1} and ${rev2 || 'working tree'}.`);
      return;
    }

    console.log(`=== Pathways Ledger Diff (${rev1} .. ${rev2 || 'working tree'}) ===\n`);
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/docs\/pathways\/ledger\/(.+)\.json/);
        if (match) console.log(`\n📄 Subject: ${match[1]}`);
      } else if (line.startsWith('+ ') && !line.startsWith('+++')) {
        console.log(`  ➕ ${line.slice(2).trim()}`);
      } else if (line.startsWith('- ') && !line.startsWith('---')) {
        console.log(`  ➖ ${line.slice(2).trim()}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error running git diff:`, err.message);
  }
}

if (process.argv[1]?.endsWith('diff-ledger.mjs')) {
  const rev1 = process.argv[2] || 'HEAD';
  const rev2 = process.argv[3] || '';
  diffLedger(rev1, rev2);
}
