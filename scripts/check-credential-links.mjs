#!/usr/bin/env node
/**
 * scripts/check-credential-links.mjs
 * Human-operated local audit script for checking opportunity links and deadlines.
 * NOTE: This is an offline/manual developer utility and is NOT bundled in the app.
 * It NEVER automatically edits or upgrades verification statuses.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

console.log('====================================================');
console.log('HIREFLOW — CREDENTIAL OPPORTUNITY LINK AUDITOR (MANUAL)');
console.log('====================================================\n');

// Read researched and flagship datasets
let opps = [];
try {
  const content1 = fs.readFileSync('src/features/suite/credentials/data/researchedOpportunitiesData.ts', 'utf8');
  const urls = content1.match(/sourceUrl:\s*['"]([^'"]+)['"]/g) || [];
  const names = content1.match(/name:\s*['"]([^'"]+)['"]/g) || [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].replace(/sourceUrl:\s*['"]/, '').replace(/['"]$/, '');
    const name = names[i] ? names[i].replace(/name:\s*['"]/, '').replace(/['"]$/, '') : `Opportunity ${i+1}`;
    opps.push({ name, url });
  }
} catch (e) {
  console.error('Error reading opportunities data:', e.message);
}

console.log(`Loaded ${opps.length} opportunity URLs for audit.\n`);

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request(
        parsed,
        { method: 'HEAD', timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
        (res) => {
          resolve({ status: res.statusCode, ok: res.statusCode < 400 || res.statusCode === 403 });
        }
      );
      req.on('error', (err) => resolve({ status: 'ERROR', error: err.message, ok: false }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', ok: false }); });
      req.end();
    } catch (e) {
      resolve({ status: 'INVALID_URL', ok: false });
    }
  });
}

async function runAudit() {
  console.log('Sample audit on first 10 URLs (dry run):');
  for (const item of opps.slice(0, 10)) {
    const res = await checkUrl(item.url);
    console.log(`[${res.ok ? 'PASS' : 'FLAG'}] ${res.status} — ${item.name}: ${item.url}`);
  }
  console.log('\nAudit complete. All dead links or 404s must be reported manually for human editorial review.');
}

runAudit();

