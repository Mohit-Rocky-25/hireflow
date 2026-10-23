// ============================================================
// HireFlow — Market Data Linter & Provenance Verifier (Stage 3A)
// Enforces strict truth in advertising:
// - "required" or "minimum" permitted ONLY for official-requirement with real sourceUrl
// - Fails on malformed URLs
// - Warns when lastReviewed is older than 180 days
// ============================================================

import fs from 'fs';
import path from 'path';

interface MarketSignal {
  text: string;
  kind: string;
  sourceUrl: string | null;
  sourceName: string;
  lastReviewed: string;
  confidence: string;
  percentileContext?: string;
}

interface MarketEntry {
  id: string;
  employerOrArchetype: string;
  track?: string;
  archetype: string;
  displayName: string;
  description: string;
  eligibility?: {
    aggregatePercent?: number;
    cgpaEquivalent?: number;
    sourceUrl: string | null;
    sourceName: string;
    note: string;
  };
  signals: MarketSignal[];
}

function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function runMarketDataCheck() {
  const filePath = path.resolve(process.cwd(), 'src/data/market/market-data.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Market data file not found at: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let data: MarketEntry[] = [];
  try {
    data = JSON.parse(raw);
  } catch (err: any) {
    console.error(`❌ Failed to parse market-data.json: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n🔍 [Market Data Linter] Scanning ${data.length} profiles in src/data/market/market-data.json...\n`);

  let violations = 0;
  let warnings = 0;
  let officialCount = 0;
  let pendingCount = 0;

  const today = new Date();
  const maxAgeDays = 180;

  for (const entry of data) {
    let hasOfficial = false;
    let hasPending = false;

    // Check Eligibility if provided
    if (entry.eligibility) {
      if (entry.eligibility.sourceUrl && !isValidHttpUrl(entry.eligibility.sourceUrl)) {
        console.error(`❌ [${entry.id}] Eligibility has invalid sourceUrl: "${entry.eligibility.sourceUrl}"`);
        violations++;
      }
      // F15 check: TCS must not state 6.5 CGPA
      if (entry.id.startsWith('tcs_') && entry.eligibility.cgpaEquivalent && entry.eligibility.cgpaEquivalent > 6.0) {
        console.error(`❌ [${entry.id}] Eligibility violates F15: TCS cutoff must be 60% aggregate (~6.0 CGPA), found ${entry.eligibility.cgpaEquivalent}`);
        violations++;
      }
    }

    for (let i = 0; i < entry.signals.length; i++) {
      const sig = entry.signals[i];
      const sigPrefix = `[${entry.id}][sig #${i + 1}]`;

      if (sig.kind === 'official-requirement' && sig.sourceUrl) {
        hasOfficial = true;
      }
      if (!sig.sourceUrl || sig.confidence === 'unverified') {
        hasPending = true;
      }

      // Check URL validity if present
      if (sig.sourceUrl !== null) {
        if (!isValidHttpUrl(sig.sourceUrl)) {
          console.error(`❌ ${sigPrefix} Malformed sourceUrl: "${sig.sourceUrl}"`);
          violations++;
        }
      }

      // STRICT RULE: "required" or "minimum" may be used ONLY for kind = official-requirement with a real sourceUrl
      const hasStrictWord = /\b(?:required|minimum)\b/i.test(sig.text);
      if (hasStrictWord) {
        if (sig.kind !== 'official-requirement') {
          console.error(
            `❌ ${sigPrefix} STRICT RULE VIOLATION: The word "required" or "minimum" was used in text but kind is "${sig.kind}" (must be "official-requirement").\n   Text: "${sig.text}"`
          );
          violations++;
        }
        if (!sig.sourceUrl || !isValidHttpUrl(sig.sourceUrl)) {
          console.error(
            `❌ ${sigPrefix} STRICT RULE VIOLATION: The word "required" or "minimum" was used without an official sourceUrl.\n   Text: "${sig.text}"`
          );
          violations++;
        }
      }

      // Check freshness
      if (sig.lastReviewed) {
        const reviewedDate = new Date(sig.lastReviewed);
        if (isNaN(reviewedDate.getTime())) {
          console.error(`❌ ${sigPrefix} Invalid lastReviewed date string: "${sig.lastReviewed}"`);
          violations++;
        } else {
          const ageDays = Math.floor((today.getTime() - reviewedDate.getTime()) / (1000 * 60 * 60 * 24));
          if (ageDays > maxAgeDays) {
            console.warn(`⚠️  ${sigPrefix} Freshness warning: lastReviewed (${sig.lastReviewed}) is ${ageDays} days old (> ${maxAgeDays} days).`);
            warnings++;
          }
        }
      } else {
        console.error(`❌ ${sigPrefix} Missing lastReviewed ISO date string.`);
        violations++;
      }
    }

    if (hasOfficial) officialCount++;
    if (hasPending) pendingCount++;
  }

  console.log('--- MARKET DATA LINT REPORT ---');
  console.log(`📊 Summary: ${data.length} employer profiles, ${officialCount} with official sources, ${pendingCount} source pending.`);
  console.log(`   Violations: ${violations} | Warnings: ${warnings}`);

  if (violations > 0) {
    console.error(`\n❌ FAILED: ${violations} market data strict rule violations found.\n`);
    process.exit(1);
  } else {
    console.log(`\n✅ PASSED: All market data entries adhere strictly to provenance and truth rules.\n`);
    process.exit(0);
  }
}

runMarketDataCheck();
