import fs from 'fs';
const c = fs.readFileSync('dist/assets/index-Dnj6Hx6r.js', 'utf8');

function findUsage(sym) {
  const matches = [...c.matchAll(new RegExp(`\\b${sym}\\b`, 'g'))];
  console.log(`Symbol ${sym} used ${matches.length} times`);
  for (let i = 0; i < Math.min(3, matches.length); i++) {
    const idx = matches[i].index;
    console.log(`  Snippet ${i}:`, c.slice(Math.max(0, idx - 60), idx + 60));
  }
}

findUsage('T');
findUsage('we');
findUsage('Te');
findUsage('Ee');

