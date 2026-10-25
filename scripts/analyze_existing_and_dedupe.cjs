const fs = require('fs');

// We can read raw JSON if available, or parse companies from talentLensData.ts
const talentLensPath = 'src/pages/demo/talentLensData.ts';
console.log('Reading', talentLensPath, '...');
const content = fs.readFileSync(talentLensPath, 'utf8');

// Find start of RAW_COMPANIES
const rawStart = content.indexOf('const RAW_COMPANIES = [');
if (rawStart === -1) {
  console.error('Could not find RAW_COMPANIES');
  process.exit(1);
}

// Extract objects using regex or bracket matching
// Alternatively, import directly using dynamic import or transpile, but regex for companies is fast
const companyBlocks = [];
const compRegex = /\{\s*id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],\s*logo:\s*["']([^"']*)["'],\s*gradient:\s*["']([^"']*)["'],\s*industry:\s*["']([^"']*)["'],\s*hq:\s*["']([^"']*)["'],\s*tier:\s*["']([^"']*)["']/g;

let match;
while ((match = compRegex.exec(content)) !== null) {
  companyBlocks.push({
    id: match[1],
    name: match[2],
    tier: match[7],
    industry: match[5]
  });
}

console.log('Existing RAW_COMPANIES count:', companyBlocks.length);

// Count roles
const roleMatches = content.match(/title:\s*["'][^"']+["'],\s*level:/g);
console.log('Existing Roles count approx:', roleMatches ? roleMatches.length : 'unknown');

// Tier breakdown
const tierCounts = {};
companyBlocks.forEach(c => {
  tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
});
console.log('Tiers breakdown:', tierCounts);

// Now load the 100 new roster companies
const roster = JSON.parse(fs.readFileSync('docs/companies-100/roster-parsed.json', 'utf8')).allCompanies;
console.log('New roster companies count:', roster.length);

function normalizeName(n) {
  return n.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\b(inc|pvt|ltd|private|limited|technologies|technology|corporation|corp|solutions|services|group|india)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const overlapsById = [];
const overlapsByName = [];

for (const newComp of roster) {
  const normNew = normalizeName(newComp.name);
  
  const matchId = companyBlocks.find(c => c.id.toLowerCase() === newComp.id.toLowerCase());
  if (matchId) {
    overlapsById.push({ newComp, existing: matchId });
  }

  const matchName = companyBlocks.find(c => {
    const normExist = normalizeName(c.name);
    return normExist === normNew && normNew.length > 2;
  });
  if (matchName) {
    overlapsByName.push({ newComp, existing: matchName });
  }
}

console.log(`\nOverlaps by ID (${overlapsById.length}):`);
overlapsById.forEach(o => console.log(`  [ID] ${o.newComp.id} -> existing: ${o.existing.id} (${o.existing.name})`));

console.log(`\nOverlaps by Normalised Name (${overlapsByName.length}):`);
overlapsByName.forEach(o => console.log(`  [Name] "${o.newComp.name}" (norm: "${normalizeName(o.newComp.name)}") -> existing: "${o.existing.name}" (id: ${o.existing.id})`));

const out = {
  existingCompanyCount: companyBlocks.length,
  existingRoleCount: roleMatches ? roleMatches.length : 0,
  tierCounts,
  overlapsById,
  overlapsByName
};

fs.writeFileSync('docs/companies-100/stats-and-overlaps.json', JSON.stringify(out, null, 2));
console.log('Saved to docs/companies-100/stats-and-overlaps.json');
