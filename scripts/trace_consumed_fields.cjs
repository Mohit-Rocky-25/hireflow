const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walk(fullPath));
      }
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');

const companyFields = ['id', 'name', 'logo', 'gradient', 'industry', 'hq', 'tier', 'hiring2023', 'hiring2024', 'openRoles', 'roles', 'source', 'sourceUrl', 'lastVerified', 'confidence', 'status'];
const roleFields = ['title', 'level', 'desc', 'competencies', 'reqLevel', 'location', 'employmentType', 'experienceLevel', 'aboutRole', 'responsibilities', 'requiredQualifications', 'requiredSkills', 'preferredSkills', 'toolsAndTech', 'softSkills', 'hiringProcess', 'selectionProcess', 'compensation', 'benefits', 'fullText'];
const eligibilityFields = ['companyId', 'companyName', 'displayName', 'aggregatePercent', 'cgpaEquivalent', 'sourceName', 'sourceUrl', 'notes', 'confidence', 'lastReviewed'];

console.log('Total source files scanned:', files.length);

const results = {
  company: {},
  role: {},
  eligibility: {}
};

for (const field of companyFields) results.company[field] = [];
for (const field of roleFields) results.role[field] = [];
for (const field of eligibilityFields) results.eligibility[field] = [];

// Regex patterns to detect access on company, c., role, r., rule, rule.
for (const file of files) {
  const relPath = path.relative('.', file).replace(/\\/g, '/');
  // Skip the massive data file itself for reads, but scan consumers
  if (relPath.includes('talentLensData.ts') && fs.statSync(file).size > 1000000) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Check company field accesses: company.<field>, c.<field>, comp.<field>, selectedCompany.<field>
    for (const f of companyFields) {
      const re = new RegExp(`\\b(company|c|comp|selectedCompany|targetCompany)\\.${f}\\b`);
      if (re.test(line)) {
        results.company[f].push({ file: relPath, line: lineNum, text: line.trim() });
      }
    }

    // Check role field accesses: role.<field>, r.<field>, selectedRole.<field>, targetRole.<field>
    for (const f of roleFields) {
      const re = new RegExp(`\\b(role|r|selectedRole|targetRole)\\.${f}\\b`);
      if (re.test(line)) {
        results.role[f].push({ file: relPath, line: lineNum, text: line.trim() });
      }
    }

    // Check eligibility field accesses: rule.<field>, elig.<field>, eligibility.<field>
    for (const f of eligibilityFields) {
      const re = new RegExp(`\\b(rule|elig|eligibility|eligibilityRule)\\.${f}\\b`);
      if (re.test(line)) {
        results.eligibility[f].push({ file: relPath, line: lineNum, text: line.trim() });
      }
    }
  });
}

fs.writeFileSync('docs/companies-100/field-trace.json', JSON.stringify(results, null, 2));
console.log('Saved field trace to docs/companies-100/field-trace.json');
