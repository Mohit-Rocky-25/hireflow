import fs from 'node:fs';
import path from 'node:path';
import {
  getPinned14Roles,
  get30SyntheticResumes,
  generateGoldenRecord,
} from './generateTalentLensGoldens';

interface DiffItem {
  file: string;
  field: string;
  expected: any;
  actual: any;
}

export function runGoldenCheck(): { passed: boolean; diffs: DiffItem[] } {
  const recordsDir = path.join(process.cwd(), 'tests', 'goldens', 'talentlens', 'records');
  if (!fs.existsSync(recordsDir)) {
    console.error(`Records directory not found: ${recordsDir}`);
    return { passed: false, diffs: [{ file: 'recordsDir', field: 'existence', expected: true, actual: false }] };
  }

  const resumes = get30SyntheticResumes();
  const roles = getPinned14Roles();
  const diffs: DiffItem[] = [];

  let totalChecked = 0;

  for (const resume of resumes) {
    for (const role of roles) {
      totalChecked++;
      const key = `${resume.id}__${role.roleId}`;
      const recFile = path.join(recordsDir, `${key}.json`);

      if (!fs.existsSync(recFile)) {
        diffs.push({ file: `${key}.json`, field: 'file_exists', expected: true, actual: false });
        continue;
      }

      const existing = JSON.parse(fs.readFileSync(recFile, 'utf8'));
      const fresh = generateGoldenRecord(resume, role);

      // Compare deterministic core fields
      if (existing.score !== fresh.score) {
        diffs.push({ file: `${key}.json`, field: 'score', expected: existing.score, actual: fresh.score });
      }
      if (existing.band !== fresh.band) {
        diffs.push({ file: `${key}.json`, field: 'band', expected: existing.band, actual: fresh.band });
      }
      if (JSON.stringify(existing.strengths) !== JSON.stringify(fresh.strengths)) {
        diffs.push({ file: `${key}.json`, field: 'strengths', expected: existing.strengths, actual: fresh.strengths });
      }
      if (JSON.stringify(existing.parseSummary) !== JSON.stringify(fresh.parseSummary)) {
        diffs.push({ file: `${key}.json`, field: 'parseSummary', expected: existing.parseSummary, actual: fresh.parseSummary });
      }
      if (JSON.stringify(existing.projectsShown) !== JSON.stringify(fresh.projectsShown)) {
        diffs.push({ file: `${key}.json`, field: 'projectsShown', expected: existing.projectsShown, actual: fresh.projectsShown });
      }
      if (JSON.stringify(existing.scorePathSteps) !== JSON.stringify(fresh.scorePathSteps)) {
        diffs.push({ file: `${key}.json`, field: 'scorePathSteps', expected: existing.scorePathSteps, actual: fresh.scorePathSteps });
      }
      if (JSON.stringify(existing.rewrites) !== JSON.stringify(fresh.rewrites)) {
        diffs.push({ file: `${key}.json`, field: 'rewrites', expected: existing.rewrites, actual: fresh.rewrites });
      }
      if (JSON.stringify(existing.violations) !== JSON.stringify(fresh.violations)) {
        diffs.push({ file: `${key}.json`, field: 'violations', expected: existing.violations, actual: fresh.violations });
      }
    }
  }

  return { passed: diffs.length === 0, diffs };
}

export function runGoldenUpdate(args: string[]) {
  const pendingDir = path.join(process.cwd(), 'tests', 'goldens', 'talentlens', 'pending');
  const recordsDir = path.join(process.cwd(), 'tests', 'goldens', 'talentlens', 'records');
  const manifestFile = path.join(process.cwd(), 'tests', 'goldens', 'talentlens', 'goldenManifest.json');

  fs.mkdirSync(pendingDir, { recursive: true });

  const approveDiffIdx = args.findIndex((a) => a === '--approve-diff');
  const approveReason = approveDiffIdx !== -1 && args[approveDiffIdx + 1] ? args[approveDiffIdx + 1] : null;

  // Check if any existing golden in records is approved
  let hasApproved = false;
  if (fs.existsSync(manifestFile)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      if (manifest.approved === true || (manifest.records && manifest.records.some((r: any) => r.status === 'approved'))) {
        hasApproved = true;
      }
    } catch {
      // ignore
    }
  }

  const resumes = get30SyntheticResumes();
  const roles = getPinned14Roles();

  console.log(`Generating proposed goldens for 420 pairs to ${pendingDir}...`);
  for (const resume of resumes) {
    for (const role of roles) {
      const key = `${resume.id}__${role.roleId}`;
      const fresh = generateGoldenRecord(resume, role);
      fs.writeFileSync(path.join(pendingDir, `${key}.json`), JSON.stringify(fresh, null, 2) + '\n', 'utf8');
    }
  }
  console.log(`Wrote 420 proposed goldens to tests/goldens/talentlens/pending/`);

  if (hasApproved && !approveReason) {
    console.error(`ERROR: Approved goldens exist in manifest. Overwriting approved goldens requires --approve-diff "<reason>".`);
    process.exit(1);
  }

  if (approveReason) {
    console.log(`--approve-diff provided ("${approveReason}"). Promoting pending to records...`);
    fs.mkdirSync(recordsDir, { recursive: true });
    for (const file of fs.readdirSync(pendingDir)) {
      if (file.endsWith('.json')) {
        fs.copyFileSync(path.join(pendingDir, file), path.join(recordsDir, file));
      }
    }
    console.log(`Promoted all pending records to tests/goldens/talentlens/records/ with approval reason: ${approveReason}`);
  }
}

// CLI entry point
const args = process.argv.slice(2);
const isUpdate = args.includes('--update');

if (isUpdate) {
  runGoldenUpdate(args);
} else {
  console.log('Running TalentLens Golden Check (comparing against tests/goldens/talentlens/records/)...');
  const result = runGoldenCheck();
  if (result.passed) {
    console.log('TalentLens Golden Check: PASS (420 records match checked-in golden set, 0 diffs).');
    process.exit(0);
  } else {
    console.error(`TalentLens Golden Check: FAIL (${result.diffs.length} diffs detected):`);
    result.diffs.slice(0, 10).forEach((d) => {
      console.error(`  - [${d.file}] ${d.field}: expected ${JSON.stringify(d.expected)} but got ${JSON.stringify(d.actual)}`);
    });
    if (result.diffs.length > 10) {
      console.error(`  ... and ${result.diffs.length - 10} more diffs.`);
    }
    process.exit(1);
  }
}
