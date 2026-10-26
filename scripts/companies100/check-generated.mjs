import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCompaniesArtifacts, computeSha256 } from './build-companies.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

console.log('=== HireFlow Check Generated Files (Rule H1 Enforcement) ===');

const generatedDir = path.join(REPO_ROOT, 'src/data/market/companies100/generated');
const companiesPath = path.join(generatedDir, 'companies.ts');
const eligibilityPath = path.join(generatedDir, 'eligibility.ts');

if (!fs.existsSync(companiesPath) || !fs.existsSync(eligibilityPath)) {
  console.error('❌ Generated files missing on disk. Run `npm run build:companies` to generate them.');
  process.exit(1);
}

const onDiskCompanies = fs.readFileSync(companiesPath, 'utf8');
const onDiskEligibility = fs.readFileSync(eligibilityPath, 'utf8');

// Validate headers and hashes on disk
function checkHeaderHash(fileContent, fileName) {
  const match = fileContent.match(/^\/\/ @generated hireflow:companies-100 hash:sha256:([a-f0-9]{64})\r?\n\/\/ DO NOT EDIT MANUALLY[^\n]*\r?\n\r?\n([\s\S]*)$/);
  if (!match) {
    console.error(`❌ Header format invalid or missing in ${fileName}. Hand-editing generated files is forbidden (Rule H1).`);
    return false;
  }
  const expectedHash = match[1];
  const body = match[2];
  const actualHash = computeSha256(body);

  if (expectedHash !== actualHash) {
    console.error(`❌ Content hash mismatch in ${fileName}! Expected ${expectedHash}, computed ${actualHash}. File was modified outside generator.`);
    return false;
  }
  return true;
}

if (!checkHeaderHash(onDiskCompanies, 'companies.ts') || !checkHeaderHash(onDiskEligibility, 'eligibility.ts')) {
  process.exit(1);
}

// Regenerate in memory and compare
const artifacts = generateCompaniesArtifacts();

if (onDiskCompanies !== artifacts.finalCompaniesContent) {
  console.error('❌ Disk companies.ts differs from fresh generation from ledger. Run `npm run build:companies`.');
  process.exit(1);
}

if (onDiskEligibility !== artifacts.finalEligibilityContent) {
  console.error('❌ Disk eligibility.ts differs from fresh generation from ledger. Run `npm run build:companies`.');
  process.exit(1);
}

console.log('✅ Generated files are in sync with ledger and hash-verified.');
process.exit(0);
