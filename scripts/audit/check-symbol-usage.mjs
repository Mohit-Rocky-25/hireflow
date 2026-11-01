import fs from 'fs';
const c = fs.readFileSync('dist/assets/index-Dnj6Hx6r.js', 'utf8');
const idx = c.indexOf('./data-talentlens-');
const chunk = c.slice(idx - 200, idx + 400);
console.log('Snippet around import in index:');
console.log(chunk);

