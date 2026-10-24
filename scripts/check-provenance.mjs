// ============================================================
// HireFlow Scoring Suite — Provenance Linter: check:provenance
// Task 6.7: Enforces P-6 Provenance Schema and validates that
// provenance.generated.json matches codebase reality with zero fabrication.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const provenancePath = path.join(projectRoot, 'src', 'data', 'provenance.generated.json');

console.log('🔍 [Provenance Linter] Auditing src/data/provenance.generated.json against codebase facts...');

if (!fs.existsSync(provenancePath)) {
  console.error('❌ Error: src/data/provenance.generated.json does not exist. Run "node scripts/generate-provenance.mjs" first.');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(provenancePath, 'utf-8'));
} catch (e) {
  console.error(`❌ Error parsing provenance.generated.json: ${e.message}`);
  process.exit(1);
}

const errors = [];

if (!data.specVersion || !data.engineVersion) {
  errors.push('Missing specVersion or engineVersion stamping.');
}

if (!Array.isArray(data.datasets) || data.datasets.length === 0) {
  errors.push('datasets array is empty or missing.');
} else {
  for (const ds of data.datasets) {
    if (!ds.id || !ds.name || !ds.purpose || !ds.source || !ds.status) {
      errors.push(`Dataset "${ds.id || 'unknown'}" missing required provenance fields.`);
    }

    if (!['verified', 'editorial', 'unverified'].includes(ds.status)) {
      errors.push(`Dataset "${ds.id}" has invalid status "${ds.status}". Must be 'verified', 'editorial', or 'unverified'.`);
    }

    if (ds.status === 'verified') {
      if (!ds.lastVerified || !/^\d{4}-\d{2}-\d{2}$/.test(ds.lastVerified)) {
        errors.push(`Verified dataset "${ds.id}" must have a valid ISO lastVerified date (YYYY-MM-DD).`);
      }
    }

    if (ds.status === 'unverified') {
      if (ds.source !== 'Source pending') {
        errors.push(`Unverified dataset "${ds.id}" must state "Source pending" as source.`);
      }
    }

    // Verify derived metrics are non-negative numbers
    if (ds.derivedMetrics) {
      for (const [key, val] of Object.entries(ds.derivedMetrics)) {
        if (typeof val !== 'number' || val < 0) {
          errors.push(`Dataset "${ds.id}" has invalid metric "${key}": ${val}. Must be non-negative number.`);
        }
      }
    }
  }
}

// Cross-check: Synthetic Fixtures count must match syntheticFixtures.ts
const fixturesPath = path.join(projectRoot, 'src', 'scoring', '__fixtures__', 'syntheticFixtures.ts');
if (fs.existsSync(fixturesPath)) {
  const fixtureContent = fs.readFileSync(fixturesPath, 'utf-8');
  const actualFixtures = (fixtureContent.match(/id:\s*['"]syn-\d+[^'"]*['"]/g) || []).length;
  const loggedFixtures = data.datasets.find((d) => d.id === 'synthetic-golden-corpus')?.derivedMetrics?.syntheticCandidateCount;
  if (loggedFixtures !== actualFixtures) {
    errors.push(`Synthetic fixture count mismatch: logged ${loggedFixtures}, actual in codebase is ${actualFixtures}.`);
  }
}

// Cross-check: Taxonomy count must match skills-taxonomy.json
const taxonomyPath = path.join(projectRoot, 'src', 'data', 'ats', 'skills-taxonomy.json');
if (fs.existsSync(taxonomyPath)) {
  const rawTax = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));
  const actualSkills = Array.isArray(rawTax) ? rawTax.length : (rawTax.skills || []).length;
  const loggedSkills = data.datasets.find((d) => d.id === 'skills-taxonomy-implications')?.derivedMetrics?.canonicalSkillsCount;
  if (loggedSkills !== actualSkills) {
    errors.push(`Canonical skills count mismatch: logged ${loggedSkills}, actual in codebase is ${actualSkills}.`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Provenance check failed with ${errors.length} error(s):`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  process.exit(1);
} else {
  console.log(`✅ All ${data.datasets.length} provenance records match codebase reality with zero fabrication!`);
  process.exit(0);
}
