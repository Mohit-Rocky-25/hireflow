import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'test-results/visual/before');
fs.mkdirSync(OUT_DIR, { recursive: true });

const WIDTHS = [1440, 1024, 390];
const ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'tools_hub', path: '/tools' },
  { name: 'resume_checker', path: '/tools/resume-checker' },
  { name: 'talentlens', path: '/talentlens' },
  { name: 'portal_guest', path: '/portal' },
];

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext();

  for (const width of WIDTHS) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 900 });

    for (const r of ROUTES) {
      try {
        await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle', timeout: 10000 });
        const filePath = path.join(OUT_DIR, `${r.name}_${width}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Saved: ${filePath}`);
      } catch (err) {
        console.error(`Failed ${r.path} at ${width}:`, err.message);
      }
    }
    await page.close();
  }

  // Also capture guest Tools Hub specifically for M8 baseline
  const hubPage = await context.newPage();
  await hubPage.setViewportSize({ width: 1440, height: 900 });
  await hubPage.goto('http://localhost:5173/tools', { waitUntil: 'networkidle' });
  await hubPage.screenshot({ path: path.join(OUT_DIR, 'hub_baseline_1440.png') });
  await hubPage.close();

  await browser.close();
  console.log('Baseline crawl complete.');
}

main().catch(console.error);
