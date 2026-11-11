import fs from 'node:fs';
import path from 'node:path';

function walkDir(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.agent-notes'].includes(file)) {
        walkDir(fullPath, filterFn, fileList);
      }
    } else if (filterFn(fullPath)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// 1. Emoji Search
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
const srcFiles = walkDir('src', (f) => /\.(tsx?|jsx?|css|html)$/.test(f));

let emojiMatches = [];
let hardcodedHexColors = new Map();
let inlineStyleCount = 0;
let backdropFilterCount = 0;
let gradientCount = 0;
let boxShadowCount = 0;
let arbitraryPxCount = 0;
let arbitraryTextSizeCount = 0;
let fileViolations = new Map();

const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const inlineStyleRegex = /style=\{\{/g;
const backdropRegex = /backdrop-blur|backdrop-filter/g;
const gradientRegex = /bg-gradient|linear-gradient|radial-gradient/g;
const boxShadowRegex = /shadow-\[[^\]]+\]|box-shadow/g;
const arbitraryPxRegex = /-(?:m|p|w|h|top|bottom|left|right|gap)-\[\d+px\]/g;
const arbitraryTextRegex = /text-\[\d+px\]/g;

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // emojis
  let m;
  while ((m = emojiRegex.exec(content)) !== null) {
    emojiMatches.push({ file, char: m[0], index: m.index });
  }

  // hex colors (exclude spruce tokens or design tokens files if desired, but let's count all src)
  const isTokenFile = file.includes('tokens.css');
  if (!isTokenFile) {
    const hexes = content.match(hexRegex) || [];
    for (const hex of hexes) {
      hardcodedHexColors.set(hex.toLowerCase(), (hardcodedHexColors.get(hex.toLowerCase()) || 0) + 1);
      fileViolations.set(file, (fileViolations.get(file) || 0) + 1);
    }
  }

  const styles = content.match(inlineStyleRegex) || [];
  inlineStyleCount += styles.length;

  const bds = content.match(backdropRegex) || [];
  backdropFilterCount += bds.length;

  const grads = content.match(gradientRegex) || [];
  gradientCount += grads.length;

  const shadows = content.match(boxShadowRegex) || [];
  boxShadowCount += shadows.length;

  const pxs = content.match(arbitraryPxRegex) || [];
  arbitraryPxCount += pxs.length;

  const texts = content.match(arbitraryTextRegex) || [];
  arbitraryTextSizeCount += texts.length;
}

console.log('=== AUDIT METRICS ===');
console.log(`Source files audited: ${srcFiles.length}`);
console.log(`Total emojis found: ${emojiMatches.length}`);
console.log(`Unique hardcoded hex colors: ${hardcodedHexColors.size}`);
let totalHexCount = 0;
for (const count of hardcodedHexColors.values()) totalHexCount += count;
console.log(`Total hardcoded hex instances: ${totalHexCount}`);
console.log(`Inline style={{ instances: ${inlineStyleCount}`);
console.log(`Backdrop blur/filter instances: ${backdropFilterCount}`);
console.log(`Gradient instances: ${gradientCount}`);
console.log(`Arbitrary box-shadow instances: ${boxShadowCount}`);
console.log(`Arbitrary px spacing/size instances: ${arbitraryPxCount}`);
console.log(`Arbitrary text-[Npx] instances: ${arbitraryTextSizeCount}`);

console.log('\nTop 10 files with hardcoded hex colors:');
const sortedFiles = [...fileViolations.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
for (const [file, count] of sortedFiles) {
  console.log(`  ${file}: ${count}`);
}

console.log('\nSample emojis found:');
for (const em of emojiMatches.slice(0, 15)) {
  console.log(`  ${em.file}: ${em.char}`);
}

