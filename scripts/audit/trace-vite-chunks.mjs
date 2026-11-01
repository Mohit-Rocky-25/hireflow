import fs from 'fs';
import path from 'path';

const distDir = 'dist/assets';
const files = fs.readdirSync(distDir);
const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const mainContent = fs.readFileSync(path.join(distDir, mainJs), 'utf8');

// Look at all __vite__mapDeps or dynamic imports
const mapDepsMatch = mainContent.match(/__vite__mapDeps\s*=\s*\[(.*?)\]/);
if (mapDepsMatch) {
  console.log('__vite__mapDeps:', mapDepsMatch[1]);
} else {
  console.log('No __vite__mapDeps found, searching for import("...');
  const dynImports = [...mainContent.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)];
  console.log('Dynamic imports in main:', dynImports.map(m => m[1]));
}

// Check every chunk for static import of data-talentlens
console.log('\nChecking static imports (from "assets/data-talentlens..."):');
for (const f of files) {
  if (f.endsWith('.js')) {
    const c = fs.readFileSync(path.join(distDir, f), 'utf8');
    const staticImp = c.match(/from\s*["'][^"']*data-talentlens[^"']*["']/);
    if (staticImp) {
      console.log(`${f} statically imports data-talentlens via: ${staticImp[0]}`);
    }
  }
}

