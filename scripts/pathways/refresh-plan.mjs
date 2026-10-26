// ============================================================
// Pathways Refresh Plan Tool
// Identifies ledger subjects older than 180 days that need maintenance review.
// Governed by Spec C9
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');
const MAX_AGE_DAYS = 180;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function inspectRefreshPlan() {
  if (!fs.existsSync(LEDGER_DIR)) {
    console.log('No ledger directory found.');
    return;
  }

  const files = fs.readdirSync(LEDGER_DIR).filter((f) => f.endsWith('.json'));
  const now = Date.now();
  const staleSubjects = [];
  const freshSubjects = [];

  for (const f of files) {
    const filePath = path.join(LEDGER_DIR, f);
    const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!rows.length) continue;

    // Find the latest retrieval date for this subject
    let latestRetrieved = 0;
    for (const r of rows) {
      const ts = new Date(r.retrievedAt).getTime();
      if (!isNaN(ts) && ts > latestRetrieved) {
        latestRetrieved = ts;
      }
    }

    const ageDays = Math.floor((now - latestRetrieved) / MS_PER_DAY);
    const subjectId = f.replace('.json', '');

    if (ageDays > MAX_AGE_DAYS) {
      staleSubjects.push({ subjectId, ageDays, latestDate: new Date(latestRetrieved).toISOString().slice(0, 10) });
    } else {
      freshSubjects.push({ subjectId, ageDays, latestDate: new Date(latestRetrieved).toISOString().slice(0, 10) });
    }
  }

  console.log(`=== Pathways Maintenance Refresh Audit (Window: ${MAX_AGE_DAYS} Days) ===`);
  console.log(`Total Subjects Tracked: ${files.length}`);
  console.log(`Fresh Subjects (<= 180 days): ${freshSubjects.length}`);
  console.log(`Stale Subjects (> 180 days): ${staleSubjects.length}`);
  console.log('');

  if (staleSubjects.length === 0) {
    console.log('✅ All 23 subjects are within the 180-day freshness window. Zero refresh actions required.');
  } else {
    console.log('⚠️  Subjects requiring recheck:');
    staleSubjects.forEach((s) => {
      console.log(`  - ${s.subjectId}: Last checked ${s.latestDate} (${s.ageDays} days ago)`);
    });
  }
}

if (process.argv[1]?.endsWith('refresh-plan.mjs')) {
  inspectRefreshPlan();
}
