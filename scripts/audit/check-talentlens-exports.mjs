import fs from 'fs';
const c = fs.readFileSync('dist/assets/data-talentlens-Fim7H67E.js', 'utf8');
const lastPart = c.slice(c.length - 1000);
console.log('Exports from data-talentlens:');
console.log(lastPart);

