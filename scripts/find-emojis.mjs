import fs from 'node:fs';
import path from 'node:path';

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}]/u;

const results = [];

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.git' && f.name !== 'dist' && f.name !== '.agent-notes') {
        walk(full);
      }
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts') || f.name.endsWith('.css') || f.name.endsWith('.html'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (emojiRegex.test(l)) {
          results.push({ file: full, line: idx + 1, text: l.trim().slice(0, 100) });
        }
      });
    }
  }
}

walk('./src');
if (fs.existsSync('./index.html')) {
  const content = fs.readFileSync('./index.html', 'utf8');
  content.split('\n').forEach((l, idx) => {
    if (emojiRegex.test(l)) {
      results.push({ file: './index.html', line: idx + 1, text: l.trim().slice(0, 100) });
    }
  });
}

console.log(`Found ${results.length} emoji instances:`);
for (const r of results) {
  console.log(`${r.file}:${r.line}: ${r.text}`);
}
