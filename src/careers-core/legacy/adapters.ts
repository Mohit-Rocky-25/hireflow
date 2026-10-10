// ============================================================
// Careers Data Platform — Legacy Adapters
// Returns exact backward-compatible shapes for existing consumers
// ============================================================

import { careers } from '../api';
import type { CompanyLadder, CareerLevel } from '../../data/careerLadders/types';
import { ALL_COMPANY_LADDERS } from '../../data/careerLadders';
import type { DegreeBranchOption } from '../../data/careerLadders/degreesAndBranches';
import { DEGREE_BRANCH_CATALOG } from '../../data/careerLadders/degreesAndBranches';
import { COMPANIES as TALENT_LENS_COMPANIES, type Company } from '../../pages/demo/talentLensData';
import { PLATFORM_COMPETENCIES } from '../data/competencies';

/**
 * Returns ALL_COMPANY_LADDERS in the exact legacy shape, enriched with platform resolutions.
 */
export function getLegacyCompanyLadders(): CompanyLadder[] {
  return ALL_COMPANY_LADDERS.map((ladder) => {
    const platformLevels = careers.levels.forCompany(ladder.id);
    const platformLevelMap = new Map(platformLevels.map((l) => [l.levelCode.toLowerCase(), l]));

    const enrichedLevels: CareerLevel[] = ladder.levels.map((lvl) => {
      const pl = platformLevelMap.get(lvl.levelCode.toLowerCase());
      return {
        ...lvl,
        equivalenceGroup: pl?.equivalenceLevelId || lvl.equivalenceGroup || 'L3_ENTRY',
        yoeTypicalMin: pl?.typicalYoE?.min ?? lvl.yoeTypicalMin,
        yoeTypicalMax: pl?.typicalYoE?.max ?? lvl.yoeTypicalMax,
      };
    });

    return {
      ...ladder,
      levels: enrichedLevels,
    };
  });
}

/**
 * Returns legacy COMPANIES array for TalentLens consumers.
 */
export function getLegacyTalentLensCompanies(): Company[] {
  return TALENT_LENS_COMPANIES;
}

/**
 * Returns legacy DEGREE_BRANCH_CATALOG array.
 */
export function getLegacyDegreeBranchCatalog(): DegreeBranchOption[] {
  return DEGREE_BRANCH_CATALOG;
}

/**
 * Legacy COMPETENCY_SIGNALS for TalentLens analysis engine.
 */
export function getLegacyCompetencySignals(): Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }> {
  const result: Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }> = {};
  for (const [k, v] of Object.entries(PLATFORM_COMPETENCIES)) {
    result[k] = {
      keywords: v.keywords,
      contextPhrases: v.contextPhrases,
      redFlags: v.redFlags,
    };
  }
  return result;
}

export const getLegacyCompanySlug = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const findLegacyCompanyBySlug = (slug: string, companies: Company[]): Company | undefined => {
  return companies.find((c) => getLegacyCompanySlug(c.name) === slug || c.id === slug);
};
