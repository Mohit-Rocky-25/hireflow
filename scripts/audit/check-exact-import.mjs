import fs from 'fs';
const c = fs.readFileSync('dist/assets/index-Dnj6Hx6r.js', 'utf8');
const match = c.match(/import\s*\{[^}]*\}\s*from\s*['"]\.\/data-talentlens-[^'"]+['"]/);
if (match) console.log('EXACT IMPORT:', match[0]);
else {
  const idx = c.indexOf('data-talentlens');
  console.log('Snippet around data-talentlens:');
  console.log(c.slice(Math.max(0, idx - 150), idx + 200));
}

