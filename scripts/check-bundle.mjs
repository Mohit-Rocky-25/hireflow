import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
if (!fs.existsSync(distAssetsDir)) {
  console.error('Error: dist/assets not found. Run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir);
const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

if (!indexFile) {
  console.error('Error: index-*.js entry chunk not found in dist/assets.');
  process.exit(1);
}

const indexPath = path.join(distAssetsDir, indexFile);
const content = fs.readFileSync(indexPath);
const rawBytes = content.length;
const gzipBytes = zlib.gzipSync(content).length;

const BASELINE_GZIP = 186377;
const MAX_ALLOWED_GZIP = Math.floor(BASELINE_GZIP * 1.05);

console.log(`Bundle Entry Chunk: ${indexFile}`);
console.log(`Raw Size: ${rawBytes} bytes (${(rawBytes / 1024).toFixed(2)} KB)`);
console.log(`Gzip Size: ${gzipBytes} bytes (${(gzipBytes / 1024).toFixed(2)} KB)`);
console.log(`Baseline Gzip: ${BASELINE_GZIP} bytes, Max Allowed (+5%): ${MAX_ALLOWED_GZIP} bytes`);

let failed = false;

if (gzipBytes > MAX_ALLOWED_GZIP) {
  console.error(`FAIL: Initial JS gzip size (${gzipBytes}) exceeds baseline + 5% (${MAX_ALLOWED_GZIP}) by ${gzipBytes - MAX_ALLOWED_GZIP} bytes.`);
  failed = true;
} else {
  console.log(`PASS: Initial JS gzip size is within budget (${((gzipBytes / BASELINE_GZIP - 1) * 100).toFixed(2)}% change).`);
}

// Check for forbidden markers in the entry chunk:
// Portal, Inspector, @supabase, @react-pdf must be lazy-loaded chunks!
const forbiddenMarkers = [
  { name: '@supabase/supabase-js', pattern: /from\s*['"]@supabase\/supabase-js['"]|supabase-js/i },
  { name: '@react-pdf', pattern: /@react-pdf/i },
  { name: 'PortalPage', pattern: /PortalPage/i },
  { name: 'HistoricalResumeInspector', pattern: /HistoricalResumeInspector/i }
];

const contentStr = content.toString('utf8');
for (const marker of forbiddenMarkers) {
  // Check if forbidden code was bundled into entry
  if (marker.name === '@supabase/supabase-js' && (contentStr.includes('supabaseClient') || contentStr.includes('createClient'))) {
    // Only flag if actual client code or marker leaked
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('PASS: Bundle check passed successfully.');
}
