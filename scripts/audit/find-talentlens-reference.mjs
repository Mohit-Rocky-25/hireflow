import fs from 'fs';
import path from 'path';

const distDir = 'dist/assets';
const files = fs.readdirSync(distDir);
const target = 'data-talentlens-Fim7H67E.js';

console.log('Searching for references to', target);
for (const file of files) {
  if (file.endsWith('.js') && file !== target) {
    const content = fs.readFileSync(path.join(distDir, file), 'utf8');
    if (content.includes(target)) {
      console.log('File referencing target:', file);
    }
  }
}

