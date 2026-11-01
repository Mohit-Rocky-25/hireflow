import fs from 'fs';

console.log('--- Applying Stage 3.1 Lazy-Load Data Architecture ---');

// 1. src/careers-core/api/index.ts
const coreApiPath = 'src/careers-core/api/index.ts';
if (fs.existsSync(coreApiPath)) {
  let content = fs.readFileSync(coreApiPath, 'utf8');
  content = content.replace(
    /import { COMPANIES, type Company } from '\.\.\/\.\.\/pages\/demo\/talentLensData';/,
    "import { CATALOG_COMPANIES as COMPANIES, type CatalogCompany as Company } from '../../data/companyCatalog';"
  );
  fs.writeFileSync(coreApiPath, content, 'utf8');
  console.log('Updated careers-core/api/index.ts to use lightweight companyCatalog');
}

// 2. src/careers-core/legacy/adapters.ts
const adaptersPath = 'src/careers-core/legacy/adapters.ts';
if (fs.existsSync(adaptersPath)) {
  let content = fs.readFileSync(adaptersPath, 'utf8');
  content = content.replace(
    /import { COMPANIES } from '\.\.\/\.\.\/pages\/demo\/talentLensData';/,
    "import { CATALOG_COMPANIES as COMPANIES } from '../../data/companyCatalog';"
  );
  content = content.replace(
    /import type { Company } from '\.\.\/\.\.\/pages\/demo\/talentLensData';/,
    "import type { CatalogCompany as Company } from '../../data/companyCatalog';"
  );
  fs.writeFileSync(adaptersPath, content, 'utf8');
  console.log('Updated careers-core/legacy/adapters.ts to use lightweight companyCatalog');
}

// 3. src/data/careerLadders/synthesizer.ts
const synthPath = 'src/data/careerLadders/synthesizer.ts';
if (fs.existsSync(synthPath)) {
  let content = fs.readFileSync(synthPath, 'utf8');
  content = content.replace(
    /import type { Company, Role } from '\.\.\/\.\.\/pages\/demo\/talentLensData';/,
    "import type { CatalogCompany } from '../companyCatalog';\ntype Company = CatalogCompany | any;\ntype Role = any;"
  );
  fs.writeFileSync(synthPath, content, 'utf8');
  console.log('Updated synthesizer.ts to accept CatalogCompany');
}

// 4. Outreach & Compare consumers
const consumers = [
  'src/features/reach-out/components/TemplateInputsPanel.tsx',
  'src/features/reach-out/engine/companyHooks.ts',
  'src/features/suite/outreach/ReachOutPage.tsx',
  'src/features/suite/compare/CompareJDsPage.tsx',
];

for (const file of consumers) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /import { COMPANIES(?:, Company)? } from '\.\.\/\.\.\/\.\.\/pages\/demo\/talentLensData';/g,
      "import { CATALOG_COMPANIES as COMPANIES } from '../../../data/companyCatalog';"
    );
    content = content.replace(
      /import { COMPANIES } from '\.\.\/\.\.\/\.\.\/pages\/demo\/talentLensData';/g,
      "import { CATALOG_COMPANIES as COMPANIES } from '../../../data/companyCatalog';"
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated consumer to use lightweight companyCatalog: ${file}`);
  }
}

console.log('--- Step 3.1 applied successfully ---');

