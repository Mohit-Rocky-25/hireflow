import fs from 'node:fs';
import path from 'node:path';

// 1. Company counts
import { CATALOG_COMPANIES } from '../src/data/companyCatalog.ts';
import { COMPANIES as TALENTLENS_COMPANIES } from '../src/pages/demo/talentLensData.ts';
console.log(`Company Catalog entries: ${CATALOG_COMPANIES.length}`);
console.log(`TalentLens deduplicated companies: ${TALENTLENS_COMPANIES.length}`);

// 2. Market live companies
const liveDir = 'src/data/market/live-companies';
if (fs.existsSync(liveDir)) {
  const liveFiles = fs.readdirSync(liveDir).filter(f => f.endsWith('.json'));
  console.log(`Live verified ATS companies: ${liveFiles.length}`);
}

// 3. Project briefs
const briefsPath = 'src/data/suite/project-briefs.json';
if (fs.existsSync(briefsPath)) {
  const briefsData = JSON.parse(fs.readFileSync(briefsPath, 'utf-8'));
  console.log(`Project briefs: ${briefsData.length}`);
}

// 4. Opportunities / credentials
import { ALL_OPPORTUNITIES } from '../src/features/suite/credentials/data/opportunitiesData.ts';
console.log(`Opportunities / Credentials: ${ALL_OPPORTUNITIES.length}`);

// 5. License file
console.log(`LICENSE file exists: ${fs.existsSync('LICENSE')}`);

// 6. Scripts count in package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
console.log(`package.json scripts count: ${Object.keys(pkg.scripts || {}).length}`);
