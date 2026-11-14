import { chromium } from 'playwright';
import { findSlopInTexts } from '../src/lib/ui/copy.ts';

const ROUTES = ['/', '/tools', '/tools/resume-checker', '/talentlens', '/portal'];

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const allFindings = [];

  for (const r of ROUTES) {
    try {
      await page.goto(`http://localhost:5173${r}`, { waitUntil: 'networkidle', timeout: 8000 });
      const texts = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const res = [];
        let node;
        while ((node = walker.nextNode())) {
          const t = node.textContent?.trim();
          if (t && node.parentElement && getComputedStyle(node.parentElement).display !== 'none') {
            res.push(t);
          }
        }
        return res;
      });

      const findings = findSlopInTexts(texts);
      for (const f of findings) {
        allFindings.push({ route: r, ...f });
      }
    } catch (e) {
      console.error(`Failed ${r}:`, e.message);
    }
  }

  await browser.close();
  console.log(`\n=== STAGE 0 SLOP FINDINGS TABLE (Total: ${allFindings.length}) ===`);
  console.table(allFindings);
}

main().catch(console.error);
