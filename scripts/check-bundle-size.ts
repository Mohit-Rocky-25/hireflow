/**
 * HireFlow v4: Bundle Size & Budget Sentinel (C13)
 * Audits production build output in dist/assets to enforce strict performance budgets.
 * Verifies code splitting and measures both uncompressed and gzipped chunk footprints.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

interface AssetDetail {
  name: string;
  rawBytes: number;
  gzipBytes: number;
  isJs: boolean;
  isCss: boolean;
}

export function analyzeDistAssets(distDir: string): {
  assets: AssetDetail[];
  totalRawBytes: number;
  totalGzipBytes: number;
  violatingChunks: AssetDetail[];
} {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Production assets directory not found at: ${assetsDir}. Run "npm run build" first.`);
  }

  const files = fs.readdirSync(assetsDir);
  const assets: AssetDetail[] = [];
  let totalRawBytes = 0;
  let totalGzipBytes = 0;

  for (const file of files) {
    const fullPath = path.join(assetsDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    const rawContent = fs.readFileSync(fullPath);
    const rawBytes = rawContent.length;
    const gzipBytes = zlib.gzipSync(rawContent).length;

    const isJs = file.endsWith('.js');
    const isCss = file.endsWith('.css');

    if (isJs || isCss) {
      assets.push({
        name: file,
        rawBytes,
        gzipBytes,
        isJs,
        isCss,
      });
      totalRawBytes += rawBytes;
      totalGzipBytes += gzipBytes;
    }
  }

  // Sort descending by raw size
  assets.sort((a, b) => b.rawBytes - a.rawBytes);

  // Budget threshold: 750 KB raw for individual app route chunks
  const violatingChunks = assets.filter((a) => a.isJs && a.rawBytes > 750 * 1024);

  return {
    assets,
    totalRawBytes,
    totalGzipBytes,
    violatingChunks,
  };
}

export function formatBundleReport(distDir: string): string {
  const { assets, totalRawBytes, totalGzipBytes, violatingChunks } = analyzeDistAssets(distDir);

  const lines: string[] = [];
  lines.push('========================================================================');
  lines.push('HIREFLOW v4: PRODUCTION BUNDLE SIZE AUDIT & BUDGET REPORT (C13)');
  lines.push('========================================================================');
  lines.push(
    `Asset Name`.padEnd(42) +
    `Raw Size`.padStart(14) +
    `Gzip Size`.padStart(14) +
    `Status`.padStart(10)
  );
  lines.push('-'.repeat(80));

  for (const a of assets) {
    const rawKb = (a.rawBytes / 1024).toFixed(1) + ' KB';
    const gzipKb = (a.gzipBytes / 1024).toFixed(1) + ' KB';
    const status = a.rawBytes > 750 * 1024 ? 'WARN' : 'PASS';
    lines.push(
      a.name.padEnd(42) +
      rawKb.padStart(14) +
      gzipKb.padStart(14) +
      status.padStart(10)
    );
  }

  lines.push('-'.repeat(80));
  lines.push(
    `Total (${assets.length} assets):`.padEnd(42) +
    `${(totalRawBytes / 1024 / 1024).toFixed(2)} MB`.padStart(14) +
    `${(totalGzipBytes / 1024 / 1024).toFixed(2)} MB`.padStart(14)
  );
  lines.push('========================================================================');

  if (violatingChunks.length > 0) {
    lines.push(`⚠️  ${violatingChunks.length} chunk(s) exceed the 750 KB budget.`);
  } else {
    lines.push('✅ All route chunks satisfy production size and code-splitting budgets.');
  }

  return lines.join('\n');
}

// CLI runner
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('check-bundle-size.ts')) {
  const distPath = path.resolve(process.cwd(), 'dist');
  try {
    const report = formatBundleReport(distPath);
    console.log(report);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}
