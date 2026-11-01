import fs from 'fs';
import path from 'path';

const searchWords = [
  'live',
  'verified',
  'authentic',
  'calibrated',
  'ultra-premium',
  'guaranteed',
  '100%',
  'production ready',
  'certified',
  'legal shield',
  'elite',
  'best-in-class',
  '244',
  '99'
];

const patterns = searchWords.map(w => ({
  word: w,
  regex: new RegExp(`\\b${w.replace('%', '\\%').replace('-', '\\-')}\\b|${w.replace('%', '\\%')}`, 'i')
}));

const scanDirs = ['src', 'public'];
const specificFiles = ['index.html', 'README.md', 'public/manifest.webmanifest'];

function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.html', '.json', '.webmanifest', '.md']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (exts.includes(ext) || file.endsWith('.webmanifest')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

let filesToScan = [];
for (const d of scanDirs) {
  filesToScan = filesToScan.concat(getAllFiles(d));
}
for (const f of specificFiles) {
  if (fs.existsSync(f) && !filesToScan.includes(f)) {
    filesToScan.push(f);
  }
}

const hits = [];

for (const file of filesToScan) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      for (const p of patterns) {
        if (p.regex.test(lineText)) {
          hits.push({
            file: file.replace(/\\/g, '/'),
            line: i + 1,
            term: p.word,
            context: lineText.trim().slice(0, 160)
          });
        }
      }
    }
  } catch (e) {
    // skip binary/unreadable
  }
}

// Group hits by term and file
let md = `# HireFlow Claims Inventory & Audit Log
**Generated:** ${new Date().toISOString()}  
**Total Claims Flagged:** ${hits.length}  

This inventory catalogs every instance of over-marketing terminology, unverified claims, and rigid count assertions across \`src/\`, \`public/\`, \`index.html\`, manifests, and documentation. This drives the truth-first remediation in Stage 2.

---

## Summary by Search Term

| Term / Claim | Occurrences |
| :--- | :--- |
`;

const termCounts = {};
for (const p of searchWords) {
  termCounts[p] = hits.filter(h => h.term === p).length;
  md += `| \`${p}\` | ${termCounts[p]} |\n`;
}

md += `\n---\n\n## Detailed Inventory (File, Line, Term, Snippet)\n\n| File | Line | Flagged Term | Snippet Context |\n| :--- | :--- | :--- | :--- |\n`;

for (const h of hits) {
  const safeContext = h.context.replace(/\|/g, '\\|').replace(/`/g, "'");
  md += `| \`${h.file}\` | ${h.line} | **${h.term}** | \`${safeContext}\` |\n`;
}

fs.mkdirSync('docs/audit', { recursive: true });
fs.writeFileSync('docs/audit/CLAIMS_INVENTORY.md', md, 'utf8');
console.log(`Successfully indexed ${hits.length} claims hits across ${filesToScan.length} files into docs/audit/CLAIMS_INVENTORY.md`);
