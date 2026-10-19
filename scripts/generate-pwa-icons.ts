import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const faviconPath = path.join(rootDir, 'public', 'favicon.svg');
const iconsDir = path.join(rootDir, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const rawSvg = fs.readFileSync(faviconPath, 'utf-8');

// Extract the inner SVG elements (paths, masks, defs)
const innerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
if (!innerMatch) {
  console.error('Could not parse inner SVG from favicon.svg');
  process.exit(1);
}

const innerContent = innerMatch[1];

function buildScaledSvg(size: number, isMaskable: boolean): string {
  // Original is 48w x 46h
  // For standard icons, content occupies ~70% of canvas
  // For maskable icons, content occupies ~60% of canvas (safe area) with solid background
  const contentRatio = isMaskable ? 0.6 : 0.72;
  const contentSize = size * contentRatio;
  const scale = contentSize / 48;
  const offsetX = (size - 48 * scale) / 2;
  const offsetY = (size - 46 * scale) / 2;

  const bgRect = isMaskable
    ? `<rect width="${size}" height="${size}" fill="#020617" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgRect}
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">
    ${innerContent}
  </g>
</svg>`;
}

const icon192 = buildScaledSvg(192, false);
const icon512 = buildScaledSvg(512, false);
const iconMaskable = buildScaledSvg(512, true);

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), icon192, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), icon512, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), iconMaskable, 'utf-8');

console.log('PWA icons successfully generated in public/icons/');
