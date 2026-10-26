const fs = require('fs');

const content = fs.readFileSync('docs/companies-100/roster-input.md', 'utf8');
const lines = content.split('\n');
const categories = [];
let curCat = null;

for (const line of lines) {
  if (line.startsWith('### Category ')) {
    curCat = { title: line.trim(), companies: [] };
    categories.push(curCat);
  } else if (curCat && line.trim().startsWith('| `') && !line.includes('ID | Company Name')) {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 6) {
      const id = parts[0].replace(/`/g, '');
      const name = parts[1];
      const tier = parts[2].replace(/`/g, '');
      const industry = parts[3];
      const hq = parts[4];
      const typicalRoles = parts[5];
      curCat.companies.push({ id, name, tier, industry, hq, typicalRoles });
    }
  }
}

console.log('Categories count:', categories.length);
const counts = categories.map(c => c.companies.length);
console.log('Counts per category:', counts.join('/'));
categories.forEach((c, idx) => console.log(`Category ${idx + 1}: ${c.title} -> ${c.companies.length} companies`));

const allCompanies = categories.flatMap(c => c.companies);
console.log('Total companies:', allCompanies.length);
const ids = allCompanies.map(c => c.id);
const uniqueIds = new Set(ids);
console.log('Unique IDs count:', uniqueIds.size);

if (uniqueIds.size !== allCompanies.length) {
  const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
  console.error('ERROR: Duplicate IDs found:', duplicates);
  process.exit(1);
}

fs.writeFileSync('docs/companies-100/roster-parsed.json', JSON.stringify({ categories, allCompanies }, null, 2));
console.log('Successfully saved to docs/companies-100/roster-parsed.json');
