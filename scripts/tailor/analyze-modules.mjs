import fs from 'fs';
import path from 'path';

const dirs = ['src/lib/tailor', 'src/engine/tailor', 'src/features/suite/tailor'];
const targetFiles = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(full)) targetFiles.push(full.replace(/\\/g, '/'));
  }
}
dirs.forEach(walk);

const allSrcFiles = [];
function walkSrc(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walkSrc(full);
    else if (/\.(ts|tsx)$/.test(full)) allSrcFiles.push(full.replace(/\\/g, '/'));
  }
}
walkSrc('src');

const map = {};
for (const tf of targetFiles) {
  const content = fs.readFileSync(tf, 'utf8');

  // Exports
  const exportMatches = content.match(/export\s+(?:(?:default\s+)?(?:const|function|class|interface|type|enum)\s+([a-zA-Z0-9_$]+)|\{([^}]+)\})/g) || [];
  const exports = [];
  exportMatches.forEach(em => {
    const m1 = em.match(/export\s+(?:default\s+)?(?:const|function|class|interface|type|enum)\s+([a-zA-Z0-9_$]+)/);
    if (m1) exports.push(m1[1]);
    const m2 = em.match(/export\s+\{([^}]+)\}/);
    if (m2) m2[1].split(',').forEach(s => exports.push(s.trim().split(/\s+as\s+/)[0]));
  });

  // Importers
  const importers = [];
  for (const sf of allSrcFiles) {
    if (sf === tf) continue;
    const sc = fs.readFileSync(sf, 'utf8');
    const sfDir = path.dirname(sf);
    
    // Check all import paths in sf
    const importRegex = /(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]|(?:import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = importRegex.exec(sc)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath.startsWith('.')) continue; // relative only
      
      const resolved = path.resolve(sfDir, importPath).replace(/\\/g, '/');
      const tfNoExt = path.resolve(tf.replace(/\.(ts|tsx)$/, '')).replace(/\\/g, '/');
      const resolvedDir = path.dirname(resolved);
      const tfDir = path.dirname(tfNoExt);
      
      if (resolved === tfNoExt || (path.basename(resolved) === 'index' && resolved === tfDir)) {
        importers.push(sf);
      }
    }
  }

  map[tf] = {
    exports: Array.from(new Set(exports)),
    importers: Array.from(new Set(importers))
  };
}

fs.writeFileSync('docs/tailor/module_map.json', JSON.stringify(map, null, 2));
console.log('Exact module map generated.');
