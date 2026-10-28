import fs from 'fs';

const existing = JSON.parse(fs.readFileSync('src/data/suite/project-briefs.json', 'utf8'));

console.log('--- Checking Rubric Brackets in existing briefs ---');
let missingBrackets = 0;
existing.forEach(b => {
  b.verificationRubric.forEach((item, idx) => {
    if (!item.includes('[') || !item.includes(']')) {
      console.log(`Brief ${b.id} rubric item #${idx+1} missing brackets: "${item}"`);
      missingBrackets++;
    }
  });
});
console.log('Total missing brackets in existing:', missingBrackets);

console.log('--- Checking Portfolio Bullet Formulas ---');
let bulletIssues = 0;
existing.forEach(b => {
  const matches = b.portfolioBulletFormula.match(/\[([a-zA-Z0-9_]+)\]/g);
  if (!matches) {
    console.log(`Brief ${b.id} has no metric placeholders in formula: "${b.portfolioBulletFormula}"`);
    bulletIssues++;
  } else {
    matches.forEach(m => {
      const inner = m.slice(1, -1);
      if (inner !== inner.toUpperCase()) {
        console.log(`Brief ${b.id} placeholder not all uppercase: ${m}`);
        bulletIssues++;
      }
    });
  }
});
console.log('Total formula placeholder issues in existing:', bulletIssues);

