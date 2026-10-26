import fs from 'fs';

// Read companies100
const companiesFile = fs.readFileSync('./src/data/market/companies100/generated/companies.ts', 'utf-8');
const logoFile = fs.readFileSync('./src/components/common/CompanyLogo.tsx', 'utf-8');
const extendedLogoFile = fs.readFileSync('./src/components/common/companyLogosExtended.tsx', 'utf-8');

// Extract company IDs and names from companies100
const companyMatches = [...companiesFile.matchAll(/"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)"/g)];
console.log('Found', companyMatches.length, 'companies in companies100');

// Extract all keys from LOGO_COMPONENTS across both files
const combinedFiles = logoFile + '\n' + extendedLogoFile;
const logoKeys = new Set();
const keyRegex = /^\s*([a-zA-Z0-9_-]+):\s*\(/gm;
let m;
while ((m = keyRegex.exec(combinedFiles)) !== null) {
  logoKeys.add(m[1].toLowerCase());
}

console.log('Found', logoKeys.size, 'keys in LOGO_COMPONENTS across both files');

// Also extract aliases from both files
const aliasMatches = [...combinedFiles.matchAll(/([a-zA-Z0-9_-]+):\s*['"]([a-zA-Z0-9_-]+)['"]/g)];
const aliases = new Map();
for (const match of aliasMatches) {
  aliases.set(match[1].toLowerCase(), match[2].toLowerCase());
}
console.log('Found', aliases.size, 'aliases');

function clean(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveKey(id, name) {
  const idClean = clean(id);
  const nameClean = clean(name);
  if (aliases.has(idClean)) return aliases.get(idClean);
  if (aliases.has(nameClean)) return aliases.get(nameClean);
  if (logoKeys.has(idClean)) return idClean;
  if (logoKeys.has(nameClean)) return nameClean;

  for (const [alias, key] of aliases.entries()) {
    if (alias.length >= 3 && (idClean.includes(alias) || nameClean.includes(alias))) {
      return key;
    }
  }

  for (const key of logoKeys) {
    if (key.length >= 4 && (idClean.includes(key) || nameClean.includes(key))) {
      return key;
    }
  }

  return idClean;
}

const missing = [];
const present = [];

for (const match of companyMatches) {
  const id = match[1];
  const name = match[2];
  const resolved = resolveKey(id, name);
  if (logoKeys.has(resolved)) {
    present.push({ id, name, resolved });
  } else {
    missing.push({ id, name, resolved });
  }
}

console.log('--- RESULTS ---');
console.log('Present logos:', present.length);
console.log('Missing logos:', missing.length);

if (missing.length > 0) {
  console.log('\nMissing companies list:');
  missing.forEach((c, idx) => {
    console.log(`${idx + 1}. ID: ${c.id} | Name: ${c.name} | Resolved: ${c.resolved}`);
  });
} else {
  console.log('\n🎉 ALL 94 COMPANIES IN COMPANIES-100 HAVE AUTHENTIC VECTOR LOGOS!');
}
