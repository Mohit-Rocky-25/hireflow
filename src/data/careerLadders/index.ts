// ============================================================
// Career Ladders Master Registry
// Aggregates verified ladders across Big Tech, India Tech & IT Services
// ============================================================

import type { CompanyLadder, CareerLevel, CareerTrack } from './types';
import { BIG_TECH_LADDERS } from './companies/bigTechUS';
import { BIG_TECH_MORE_LADDERS } from './companies/bigTechUSMore';
import { INDIA_TECH_LADDERS } from './companies/indiaTech';
import { IT_SERVICES_LADDERS } from './companies/itServices';
import { IT_SERVICES_MORE_LADDERS } from './companies/itServicesMore';

export * from './types';
export * from './equivalenceMap';

export const ALL_COMPANY_LADDERS: CompanyLadder[] = [
  ...BIG_TECH_LADDERS,
  ...BIG_TECH_MORE_LADDERS,
  ...INDIA_TECH_LADDERS,
  ...IT_SERVICES_LADDERS,
  ...IT_SERVICES_MORE_LADDERS,
];

// Map companyId -> CompanyLadder for O(1) lookup
const LADDER_MAP = new Map<string, CompanyLadder>();
for (const ladder of ALL_COMPANY_LADDERS) {
  LADDER_MAP.set(ladder.id.toLowerCase(), ladder);
}

export function getAllCompanies(): CompanyLadder[] {
  return ALL_COMPANY_LADDERS;
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
