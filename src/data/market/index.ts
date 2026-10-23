// ============================================================
// HireFlow — Market Realism & Provenance Module (Stage 3)
// Accessors, summaries, and computed profile counts
// ============================================================

import marketDataJson from './market-data.json';
import { MarketEntry, MarketDatasetSummary, ArchetypeId } from './types';

export * from './types';

export const MARKET_ENTRIES: MarketEntry[] = marketDataJson as MarketEntry[];

export function getMarketEntries(): MarketEntry[] {
  return MARKET_ENTRIES;
}

export function getMarketEntryById(id: string): MarketEntry | undefined {
  return MARKET_ENTRIES.find((entry) => entry.id === id);
}

export function getMarketEntriesByArchetype(archetype: ArchetypeId): MarketEntry[] {
  return MARKET_ENTRIES.filter((entry) => entry.archetype === archetype);
}

export function getMarketSummary(): MarketDatasetSummary {
  let officialSourceCount = 0;
  let sourcePendingCount = 0;
  let earliestDate = '9999-99-99';
  let latestDate = '0000-00-00';

  for (const entry of MARKET_ENTRIES) {
    let hasOfficial = false;
    let hasPending = false;

    for (const sig of entry.signals) {
      if (sig.kind === 'official-requirement' && sig.sourceUrl) {
        hasOfficial = true;
      }
      if (!sig.sourceUrl || sig.confidence === 'unverified') {
        hasPending = true;
      }
      if (sig.lastReviewed) {
        if (sig.lastReviewed < earliestDate) earliestDate = sig.lastReviewed;
        if (sig.lastReviewed > latestDate) latestDate = sig.lastReviewed;
      }
    }

    if (hasOfficial) officialSourceCount++;
    if (hasPending) sourcePendingCount++;
  }

  return {
    totalProfiles: MARKET_ENTRIES.length,
    officialSourceCount,
    sourcePendingCount,
    lastReviewedRange: {
      earliest: earliestDate !== '9999-99-99' ? earliestDate : '2026-01-01',
      latest: latestDate !== '0000-00-00' ? latestDate : '2026-03-25',
    },
  };
}
