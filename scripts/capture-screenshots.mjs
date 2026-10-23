import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5177';
const targetDir = process.argv[2] || 'docs/design/before';

const routes = [
  { name: 'home', path: '/' },
  { name: 'tools-hub', path: '/tools' },
  { name: 'resume-checker', path: '/tools/resume-checker' },
  { name: 'talent-lens', path: '/tools/talent-lens' },
  { name: 'tailor', path: '/tools/tailor' },
  { name: 'jd-compare', path: '/tools/jd-compare' },
  { name: 'reach-out', path: '/tools/reach-out' },
  { name: 'build-briefs', path: '/tools/build-briefs' },
  { name: 'career-path', path: '/tools/career-path' },
  { name: 'dream-job-roadmap', path: '/tools/career-path/dream-job-roadmap' },
  { name: 'company-levels', path: '/tools/career-path/company-levels' },
  { name: 'credential-engine', path: '/tools/credential-engine' },
  { name: 'matching-demo', path: '/demo' },
  { name: 'company-roles', path: '/demo/company/google' },
  { name: 'careers-data', path: '/dev/careers-data' },
  { name: 'data', path: '/data' },
  { name: 'history', path: '/history' },
  { name: 'jd-library', path: '/jd-library' },
  { name: 'methodology', path: '/methodology' },
];

const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

const absTargetDir = path.resolve(process.cwd(), targetDir);
if (!fs.existsSync(absTargetDir)) {
  fs.mkdirSync(absTargetDir, { recursive: true });
}

console.log(`Capturing screenshots into ${absTargetDir} from ${BASE_URL}...`);

const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'hf_ss_'));

for (const route of routes) {
  for (const vp of viewports) {
    const filename = `${route.name}-${vp.name}.png`;
    const outputPath = path.join(absTargetDir, filename);
    const targetUrl = `${BASE_URL}${route.path}`;
    const profileDir = path.join(tempBase, `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
    
    console.log(`Capturing ${filename} (${targetUrl} at ${vp.width}x${vp.height})...`);
    const cmd = `cmd.exe /c ""${CHROME_PATH}" --headless --no-first-run --no-default-browser-check --user-data-dir="${profileDir}" --virtual-time-budget=4000 --window-size=${vp.width},${vp.height} --screenshot="${outputPath}" "${targetUrl}""`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`  ✓ Saved ${filename} (${stats.size} bytes)`);
      } else {
        console.warn(`  ✗ Failed to save ${filename}`);
      }
    } catch (err) {
      console.error(`  ✗ Error capturing ${filename}:`, err.message);
    }
  }
}

try {
  fs.rmSync(tempBase, { recursive: true, force: true });
} catch {}

console.log('Capture completed!');
