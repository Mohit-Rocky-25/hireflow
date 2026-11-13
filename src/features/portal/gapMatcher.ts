import type { Gap } from '@/domain/types';
import { slug } from '@/domain/ids';

export interface CatalogItem { id: string; title: string; tags: readonly string[] }
export interface RankedItem<T extends CatalogItem> { item: T; score: number; matchedGapIds: string[] }

const tokens = (s: string): string[] => slug(s).split('-').filter((t) => t.length > 0);

/** Deterministic, offline ranking of catalog items against open gaps. */
export function rankForGaps<T extends CatalogItem>(gaps: readonly Gap[], catalog: readonly T[], topN = 5): RankedItem<T>[] {
  const ranked: Array<RankedItem<T> & { order: number }> = [];
  catalog.forEach((item, order) => {
    const tagSlugs = new Set(item.tags.map(slug));
    const tagTokens = new Set(item.tags.flatMap(tokens));
    const titleSlug = slug(item.title);
    let score = 0;
    const matched: string[] = [];
    for (const g of gaps) {
      const gs = slug(g.label);
      if (!gs) continue;
      let s = 0;
      if (tagSlugs.has(gs)) s = 3;
      else if (tokens(g.label).some((t) => tagTokens.has(t))) s = 1;
      if (titleSlug.includes(gs)) s = Math.max(s, 2);
      if (s > 0) {
        score += s * g.severity;
        matched.push(g.id);
      }
    }
    if (score > 0) ranked.push({ item, score, matchedGapIds: matched.sort(), order });
  });
  ranked.sort((a, b) => b.score - a.score || a.order - b.order);
  return ranked.slice(0, topN).map(({ item, score, matchedGapIds }) => ({ item, score, matchedGapIds }));
}
