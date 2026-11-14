import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'test-results/visual/reference');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWS = ['overview', 'scans', 'signin'];
const WIDTHS = [1440, 390];
const REF_FILE = `file://${path.resolve(process.cwd(), 'design/my-space-reference.html')}`;

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext();

  for (const view of VIEWS) {
    for (const width of WIDTHS) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${REF_FILE}#${view}`, { waitUntil: 'load' });
      await page.waitForTimeout(200);
      const outPath = path.join(OUT_DIR, `ref_${view}_${width}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${outPath}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('Reference screenshots saved.');
}

main().catch(console.error);

