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

export function searchLevels(query: string): {
  company: CompanyLadder;
  level: CareerLevel;
  label: string;
}[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const results: { company: CompanyLadder; level: CareerLevel; label: string }[] = [];

  for (const company of ALL_COMPANY_LADDERS) {
    for (const level of company.levels) {
      const matchScore =
        (company.name.toLowerCase().includes(q) ? 3 : 0) +
        (level.levelCode.toLowerCase().includes(q) ? 4 : 0) +
        (level.title.toLowerCase().includes(q) ? 2 : 0);

      if (matchScore > 0 || `${company.name} ${level.levelCode} ${level.title}`.toLowerCase().includes(q)) {
        results.push({
          company,
          level,
          label: `${company.name} • ${level.levelCode} (${level.title})`,
        });
      }
    }
  }

  return results.slice(0, 15);
}
