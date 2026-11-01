import fs from 'fs';
import path from 'path';

const distDir = 'dist/assets';
const files = fs.readdirSync(distDir);
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
console.log('Main entry file:', indexFile);

const content = fs.readFileSync(path.join(distDir, indexFile), 'utf8');
const talentLensMatch = content.match(/data-talentlens-[a-zA-Z0-9_-]+\.js/g);
console.log('Matches for data-talentlens in main bundle:', talentLensMatch);

// Look at snippet around match
if (talentLensMatch) {
  const idx = content.indexOf(talentLensMatch[0]);
  console.log('Snippet around talentlens reference:');
  console.log(content.slice(Math.max(0, idx - 200), idx + 200));
}

