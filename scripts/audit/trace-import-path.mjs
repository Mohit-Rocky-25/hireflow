import fs from 'fs';
import path from 'path';

function findImports(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  // Match static import ... from '...'
  const regex = /import\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(filePath);
      let resolved = path.resolve(dir, importPath);
      if (fs.existsSync(resolved + '.ts')) resolved += '.ts';
      else if (fs.existsSync(resolved + '.tsx')) resolved += '.tsx';
      else if (fs.existsSync(resolved + '/index.ts')) resolved += '/index.ts';
      else if (fs.existsSync(resolved + '/index.tsx')) resolved += '/index.tsx';
      imports.push(resolved);
    }
  }
  return imports;
}

const visited = new Set();
function dfs(current, targetFile, currentPath) {
  if (current.includes(targetFile)) {
    console.log('FOUND PATH TO TARGET:');
    console.log(currentPath.join(' -> '));
    return true;
  }
  visited.add(current);
  const nextImports = findImports(current);
  let found = false;
  for (const imp of nextImports) {
    if (!visited.has(imp)) {
      if (dfs(imp, targetFile, [...currentPath, imp])) {
        found = true;
      }
    }
  }
  return found;
}

console.log('--- Tracing static import paths from src/main.tsx to talentLensData ---');
dfs(path.resolve('src/main.tsx'), 'talentLensData', ['src/main.tsx']);

