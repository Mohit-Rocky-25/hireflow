// ============================================================
// Careers Data Platform — Dataset Scaffolding CLI
// Usage: node scripts/careers/new-dataset.mjs <dataset-name>
// ============================================================

import fs from 'fs';
import path from 'path';

const datasetName = process.argv[2];

if (!datasetName) {
  console.error('Error: Please provide a dataset name. Example: node scripts/careers/new-dataset.mjs salaries');
  process.exit(1);
}

const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, 'src', 'careers-core', 'data');
const manifestPath = path.join(dataDir, 'manifest.json');

const stubFile = path.join(dataDir, `${datasetName}.ts`);
if (fs.existsSync(stubFile)) {
  console.error(`Error: Dataset file ${stubFile} already exists!`);
  process.exit(1);
}

const stubContent = `// ============================================================
// Careers Data Platform — ${datasetName.toUpperCase()} Dataset
// ============================================================

export interface ${datasetName.charAt(0).toUpperCase() + datasetName.slice(1)}Record {
  id: string;
  name: string;
  data: Record<string, any>;
  lastUpdated: string;
}

export const PLATFORM_${datasetName.toUpperCase()}: ${datasetName.charAt(0).toUpperCase() + datasetName.slice(1)}Record[] = [];
`;

fs.writeFileSync(stubFile, stubContent, 'utf-8');
console.log(`✓ Created dataset file at: src/careers-core/data/${datasetName}.ts`);

// Update manifest
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (!manifest.registeredSubsystems) manifest.registeredSubsystems = [];
  manifest.registeredSubsystems.push({
    name: datasetName,
    path: `src/careers-core/data/${datasetName}.ts`,
    access: 'read-write',
    created: new Date().toISOString()
  });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Registered dataset in manifest.json`);
}
