import fs from 'fs';
import path from 'path';

const lpContent = fs.readFileSync('dist/assets/LandingPage-BEW3Jo-7.js', 'utf8');
console.log('Landing page length:', lpContent.length);

// Check imports/references
const distFiles = fs.readdirSync('dist/assets');
for (const f of distFiles) {
  if (f.endsWith('.js') && lpContent.includes(f)) {
    console.log('LandingPage references:', f);
  }
}

