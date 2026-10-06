// ============================================================
// Career Ladders Master Registry — India Market
// Comprehensive dataset across Big Tech India, GCCs, Unicorns, & IT Services
// ============================================================

import type { CompanyLadder, CareerLevel, CareerTrack, MarketSegment } from './types';
import { BIG_TECH_INDIA_LADDERS } from './companies/bigTechIndia';
import { INDIAN_PRODUCT_UNICORN_LADDERS } from './companies/indianProductUnicorns';
import { GCC_FINANCE_LADDERS } from './companies/gccFinance';
import { IT_SERVICES_INDIA_LADDERS } from './companies/itServicesIndia';
import { CORE_ENGINEERING_LADDERS } from './companies/coreEngineering';

export * from './types';
export * from './equivalenceMap';
export * from './blockerCatalog';
export * from './hiringRoutesCatalog';

export const ALL_COMPANY_LADDERS: CompanyLadder[] = [
  ...BIG_TECH_INDIA_LADDERS,
  ...INDIAN_PRODUCT_UNICORN_LADDERS,
  ...GCC_FINANCE_LADDERS,
  ...IT_SERVICES_INDIA_LADDERS,
  ...CORE_ENGINEERING_LADDERS,
];

// Map companyId -> CompanyLadder for O(1) lookup
const LADDER_MAP = new Map<string, CompanyLadder>();
for (const ladder of ALL_COMPANY_LADDERS) {
  LADDER_MAP.set(ladder.id.toLowerCase(), ladder);
}

export function getAllCompanies(): CompanyLadder[] {
  return ALL_COMPANY_LADDERS;
}

export function getAllMarketSegments(): MarketSegment[] {
  return [
    'Big Tech India',
    'Indian Product Unicorn',
    'GCC / Finance',
    'Indian IT Services',
    'Core Engineering & Automotive',
  ];
}

export function filterByMarketSegment(segment?: MarketSegment | 'ALL'): CompanyLadder[] {
  if (!segment || segment === 'ALL') return ALL_COMPANY_LADDERS;
  return ALL_COMPANY_LADDERS.filter((c) => c.marketSegment === segment);
}

export function getCompanyLadder(companyId: string): CompanyLadder | undefined {
  return LADDER_MAP.get(companyId.toLowerCase());
}

export function getLevel(
  companyId: string,
  levelCode: string,
  track: CareerTrack = 'SWE'
): CareerLevel | undefined {
  const ladder = getCompanyLadder(companyId);
  if (!ladder) return undefined;
  return ladder.levels.find(
    (lvl) =>
      lvl.levelCode.toLowerCase() === levelCode.toLowerCase() &&
      (!track || lvl.track === track)
  );
}

export function getLevelsForCompanyAndTrack(
  companyId: string,
  track: CareerTrack = 'SWE'
): CareerLevel[] {
  const ladder = getCompanyLadder(companyId);
  if (!ladder) return [];
  return ladder.levels.filter((lvl) => lvl.track === track);
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function searchLevels(query: string): {
  company: CompanyLadder;
  level: CareerLevel;
  label: string;
}[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { company: CompanyLadder; level: CareerLevel; label: string; score: number }[] = [];

  for (const company of ALL_COMPANY_LADDERS) {
    for (const level of company.levels) {
      const fullText = `${company.name} ${level.levelCode} ${level.title}`.toLowerCase();
      let score = 0;

      if (fullText.includes(q)) score += 50;
      if (company.name.toLowerCase() === q) score += 30;
      if (level.levelCode.toLowerCase() === q) score += 40;
      if (level.title.toLowerCase().includes(q)) score += 20;

      // Token coverage
      const allTokensMatch = tokens.every((tok) => fullText.includes(tok));
      if (allTokensMatch) score += 25;

      if (score > 0) {
        scored.push({
          company,
          level,
          label: `${company.name} • ${level.levelCode} (${level.title})`,
          score,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 15).map(({ company, level, label }) => ({ company, level, label }));
}

export function getFuzzySuggestion(query: string): {
  company: CompanyLadder;
  level: CareerLevel;
  label: string;
} | null {
  if (!query || query.trim().length < 3) return null;
  const q = query.toLowerCase().trim();

  // If search already finds direct matches, no fuzzy suggestion needed
  const directMatches = searchLevels(query);
  if (directMatches.length > 0) return null;

  let bestScore = Infinity;
  let bestCandidate: { company: CompanyLadder; level: CareerLevel; label: string } | null = null;

  for (const company of ALL_COMPANY_LADDERS) {
    const compDist = levenshteinDistance(q, company.name.toLowerCase());
    if (compDist < bestScore && compDist <= Math.max(3, Math.floor(company.name.length * 0.45))) {
      bestScore = compDist;
      const defaultLvl = company.levels[1] || company.levels[0];
      bestCandidate = {
        company,
        level: defaultLvl,
        label: `${company.name} • ${defaultLvl.levelCode} (${defaultLvl.title})`,
      };
    }

    for (const level of company.levels) {
      const titleDist = levenshteinDistance(q, level.title.toLowerCase());
      if (titleDist < bestScore && titleDist <= Math.max(3, Math.floor(level.title.length * 0.4))) {
        bestScore = titleDist;
        bestCandidate = {
          company,
          level,
          label: `${company.name} • ${level.levelCode} (${level.title})`,
        };
      }
    }
  }

  return bestCandidate;
}
