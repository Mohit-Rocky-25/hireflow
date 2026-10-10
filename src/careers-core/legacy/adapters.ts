// ============================================================
// Careers Data Platform — Legacy Adapters
// Returns exact backward-compatible shapes for existing consumers
// ============================================================

import { careers } from '../api';
import type { CompanyLadder, CareerLevel } from '../../data/careerLadders/types';
import { BIG_TECH_INDIA_LADDERS } from '../../data/careerLadders/companies/bigTechIndia';
import { INDIAN_PRODUCT_UNICORN_LADDERS } from '../../data/careerLadders/companies/indianProductUnicorns';
import { GCC_FINANCE_LADDERS } from '../../data/careerLadders/companies/gccFinance';
import { IT_SERVICES_INDIA_LADDERS } from '../../data/careerLadders/companies/itServicesIndia';
import { CORE_ENGINEERING_LADDERS } from '../../data/careerLadders/companies/coreEngineering';
import type { DegreeBranchOption } from '../../data/careerLadders/degreesAndBranches';
import { DEGREE_BRANCH_CATALOG } from '../../data/careerLadders/degreesAndBranches';
import { COMPANIES as TALENT_LENS_COMPANIES, type Company } from '../../pages/demo/talentLensData';
import { PLATFORM_COMPETENCIES } from '../data/competencies';

const RAW_COMPANY_LADDERS: CompanyLadder[] = [
  ...BIG_TECH_INDIA_LADDERS,
  ...INDIAN_PRODUCT_UNICORN_LADDERS,
  ...GCC_FINANCE_LADDERS,
  ...IT_SERVICES_INDIA_LADDERS,
  ...CORE_ENGINEERING_LADDERS,
];

/**
 * Returns ALL_COMPANY_LADDERS in the exact legacy shape, enriched with platform resolutions.
 */
export function getLegacyCompanyLadders(): CompanyLadder[] {
  return RAW_COMPANY_LADDERS.map((ladder) => {
    const platformLevels = careers.levels.forCompany(ladder.id);
    const platformLevelMap = new Map(platformLevels.map((l) => [l.levelCode.toLowerCase(), l]));

    const enrichedLevels: CareerLevel[] = ladder.levels.map((lvl) => {
      const pl = platformLevelMap.get(lvl.levelCode.toLowerCase());
      return {
        ...lvl,
        equivalenceGroup: lvl.equivalenceGroup || pl?.equivalenceLevelId || 'L3_ENTRY',
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
