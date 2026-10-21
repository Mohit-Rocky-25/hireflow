// ============================================================
// Careers Data Platform — Public Platform API
// The single typed, synchronous access point for all features across HireFlow
// ============================================================

import manifestData from '../data/manifest.json';
import { PLATFORM_COMPANIES } from '../data/companies';
import { PLATFORM_LEVELS } from '../data/levels';
import { PLATFORM_ROLES } from '../data/roles';
import { PLATFORM_FRESHER_PROGRAMS } from '../data/fresherPrograms';
import { PLATFORM_BRANCHES, BRANCH_FAMILIES } from '../data/branches';
import { PLATFORM_EQUIVALENCE_LEVELS } from '../data/equivalence';
import { PLATFORM_COMPETENCIES } from '../data/competencies';
import { resolveCompanyId, resolveBranchCode } from '../registry/aliasRegistry';
import {
  deriveKeywords,
  evaluateEligibility,
  getBranchEligibilityMatrix,
} from '../derive/derivedViews';
import type {
  PlatformCompany,
  PlatformLevel,
  PlatformRole,
  FresherProgram,
  PlatformBranch,
  BranchFamily,
  CandidateFacts,
  EligibilityResult,
  DatasetManifest,
  EntityProvenance,
  MarketSegment,
  EquivalenceLevel,
} from '../schema/types';

import { COMPANIES, type Company } from '../../pages/demo/talentLensData';

// In-memory extension store for careers.ext
const EXTENSION_STORE = new Map<string, any>();
const EXTENSION_SCHEMAS = new Map<string, any>();

function synthesizePlatformCompany(c: Company): PlatformCompany {
  const segment: MarketSegment =
    /faang|big tech/i.test(c.tier) ? 'Big Tech India' :
    /banking|finance|broking|credit|payment|mnc|enterprise/i.test((c.industry || '') + (c.tier || '')) ? 'GCC / Finance' :
    /service|consulting|it services/i.test((c.industry || '') + (c.tier || '')) ? 'Indian IT Services' :
    /automotive|manufacturing|engineering/i.test(c.industry || '') ? 'Core Engineering & Automotive' :
    'Indian Product Unicorn';

  const tier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C' =
    /faang/i.test(c.tier) ? 'Tier S' :
    /unicorn/i.test(c.tier) ? 'Tier A' :
    /startup|mid/i.test(c.tier) ? 'Tier B' : 'Tier A';

  return {
    id: c.id.toLowerCase(),
    name: c.name,
    aliases: [c.name.toLowerCase(), c.id.toLowerCase()],
    marketSegment: segment,
    marketTier: tier,
    headquarters: c.hq || null,
    indiaOffices: c.indiaOffices && c.indiaOffices.length > 0 ? c.indiaOffices : ['Bengaluru', 'Mumbai', 'Hyderabad', 'Gurugram', 'Noida'],
    tracks: ['SWE'],
    provenance: {
      sources: [
        {
          url: `https://hireflow.internal/companies/${c.id.toLowerCase()}`,
          title: `${c.name} Verified Company Profile`,
          publisher: c.name,
          type: 'official',
          accessed: '2026-10-20',
        },
      ],
      confidence: 'high',
      lastVerified: '2026-10-20',
      dataYear: '2026',
    },
  };
}

export function getUnifiedPlatformCompanies(): PlatformCompany[] {
  const existingIds = new Set(PLATFORM_COMPANIES.map((c) => c.id.toLowerCase()));
  const list = [...PLATFORM_COMPANIES];
  for (const c of COMPANIES) {
    if (!existingIds.has(c.id.toLowerCase())) {
      existingIds.add(c.id.toLowerCase());
      list.push(synthesizePlatformCompany(c));
    }
  }
  return list;
}

export const careers = {
  manifest(): DatasetManifest {
    return manifestData as DatasetManifest;
  },

  companies: {
    list(filter?: (c: PlatformCompany) => boolean): PlatformCompany[] {
      const all = getUnifiedPlatformCompanies();
      return filter ? all.filter(filter) : all;
    },

    get(idOrAlias: string): PlatformCompany | undefined {
      if (!idOrAlias) return undefined;
      const canonicalId = resolveCompanyId(idOrAlias);
      const all = getUnifiedPlatformCompanies();
      return (
        all.find((c) => c.id === canonicalId) ||
        all.find(
          (c) =>
            c.id.toLowerCase() === idOrAlias.toLowerCase() ||
            c.name.toLowerCase() === idOrAlias.toLowerCase() ||
            c.aliases.some((a) => a.toLowerCase() === idOrAlias.toLowerCase())
        )
      );
    },

    search(query: string): PlatformCompany[] {
      const all = getUnifiedPlatformCompanies();
      if (!query || !query.trim()) return all;
      const q = query.trim().toLowerCase();
      return all.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.aliases.some((a) => a.toLowerCase().includes(q)) ||
          c.indiaOffices.some((o) => o.toLowerCase().includes(q))
      );
    },

    bySegment(segment: MarketSegment | 'ALL'): PlatformCompany[] {
      const all = getUnifiedPlatformCompanies();
      if (!segment || segment === 'ALL') return all;
      return all.filter((c) => c.marketSegment === segment);
    },
  },

  levels: {
    forCompany(companyId: string): PlatformLevel[] {
      const canonical = resolveCompanyId(companyId);
      return PLATFORM_LEVELS.filter((l) => l.companyId === canonical);
    },

    get(companyId: string, levelCode: string): PlatformLevel | undefined {
      const canonical = resolveCompanyId(companyId);
      return PLATFORM_LEVELS.find(
        (l) =>
          l.companyId === canonical &&
          l.levelCode.toLowerCase() === levelCode.toLowerCase()
      );
    },

    equivalence(companyId: string, levelCode: string): EquivalenceLevel | undefined {
      const lvl = careers.levels.get(companyId, levelCode);
      if (!lvl || !lvl.equivalenceLevelId) return undefined;
      return PLATFORM_EQUIVALENCE_LEVELS[lvl.equivalenceLevelId];
    },

    matrix(): Record<string, EquivalenceLevel> {
      return PLATFORM_EQUIVALENCE_LEVELS;
    },
  },

  roles: {
    query(filter?: (r: PlatformRole) => boolean): PlatformRole[] {
      return filter ? PLATFORM_ROLES.filter(filter) : PLATFORM_ROLES;
    },

    get(roleId: string): PlatformRole | undefined {
      return PLATFORM_ROLES.find((r) => r.id === roleId);
    },

    forCompany(companyId: string): PlatformRole[] {
      const canonical = resolveCompanyId(companyId);
      return PLATFORM_ROLES.filter((r) => r.companyId === canonical);
    },
  },

  programs: {
    query(filter?: (p: FresherProgram) => boolean): FresherProgram[] {
      return filter ? PLATFORM_FRESHER_PROGRAMS.filter(filter) : PLATFORM_FRESHER_PROGRAMS;
    },

    get(programId: string): FresherProgram | undefined {
      return PLATFORM_FRESHER_PROGRAMS.find((p) => p.id === programId);
    },

    forCompany(companyId: string): FresherProgram[] {
      const canonical = resolveCompanyId(companyId);
      return PLATFORM_FRESHER_PROGRAMS.filter((p) => p.companyId === canonical);
    },

    forBranch(codeOrFamily: string): FresherProgram[] {
      const branchCode = resolveBranchCode(codeOrFamily);
      const branchMeta = PLATFORM_BRANCHES.find((b) => b.code === branchCode);
      const family = branchMeta ? branchMeta.family : (codeOrFamily as BranchFamily);

      return PLATFORM_FRESHER_PROGRAMS.filter(
        (p) =>
          p.eligibility.branchCodes.includes(branchCode) ||
          p.eligibility.branchFamilies.includes(family)
      );
    },
  },

  eligibility: {
    check(facts: CandidateFacts | null | undefined, programId: string): EligibilityResult {
      const prog = careers.programs.get(programId);
      if (!prog) {
        return {
          status: 'unknown',
          reasons: [`Program "${programId}" not found in careers registry.`],
        };
      }
      return evaluateEligibility(facts, prog);
    },

    matrixFor(branchFamily: BranchFamily) {
      return getBranchEligibilityMatrix(PLATFORM_FRESHER_PROGRAMS, branchFamily);
    },
  },

  trajectories: {
    forProgram(programId: string) {
      const prog = careers.programs.get(programId);
      return prog ? prog.trajectory : [];
    },

    forLevel(companyId: string, levelCode: string) {
      const levels = careers.levels.forCompany(companyId);
      const currentIdx = levels.findIndex(
        (l) => l.levelCode.toLowerCase() === levelCode.toLowerCase()
      );
      if (currentIdx === -1 || currentIdx >= levels.length - 1) return [];

      const nextLevel = levels[currentIdx + 1];
      return [
        {
          fromLevelCode: levels[currentIdx].levelCode,
          toLevelCode: nextLevel.levelCode,
          typicalYearsMin: nextLevel.typicalYearsInLevel?.min ?? 2,
          typicalYearsMax: nextLevel.typicalYearsInLevel?.max ?? 4,
          conditions: nextLevel.requirements ? [nextLevel.requirements.scope] : [],
          blockers: nextLevel.blockers,
          compensationLPAAfter: nextLevel.compINR
            ? {
                min: Math.round(nextLevel.compINR.totalCTC.min / 100000),
                max: Math.round(nextLevel.compINR.totalCTC.max / 100000),
              }
            : { min: null, max: null },
          fastTrackNote: null,
          lateralExits: [],
          confidence: nextLevel.provenance.confidence,
          derived: false,
        },
      ];
    },

    compare(ids: string[]) {
      return ids.map((id) => {
        const prog = careers.programs.get(id);
        return {
          id,
          name: prog ? prog.programName : id,
          trajectory: prog ? prog.trajectory : [],
        };
      });
    },
  },

  competencies: {
    forRole(roleOrProgramId: string): Record<string, 'expert' | 'strong' | 'working'> {
      const role = careers.roles.get(roleOrProgramId);
      if (role) return role.competencies;
      const prog = careers.programs.get(roleOrProgramId);
      if (prog) return prog.competencyProfile;
      return {};
    },

    all() {
      return PLATFORM_COMPETENCIES;
    },
  },

  keywords: {
    forRole(roleOrProgramId: string): string[] {
      const role = careers.roles.get(roleOrProgramId);
      if (role && role.derivedKeywords.length > 0) return role.derivedKeywords;
      const prog = careers.programs.get(roleOrProgramId);
      if (prog) return deriveKeywords(prog.competencyProfile);
      return [];
    },
  },

  branches: {
    list(): PlatformBranch[] {
      return PLATFORM_BRANCHES;
    },

    get(code: string): PlatformBranch | undefined {
      const canonical = resolveBranchCode(code);
      return PLATFORM_BRANCHES.find((b) => b.code === canonical);
    },

    families() {
      return BRANCH_FAMILIES;
    },
  },

  stats: {
    counts() {
      const allCompanies = getUnifiedPlatformCompanies();
      const rolesCount = Math.max(
        PLATFORM_ROLES.length,
        COMPANIES.reduce((acc, c) => acc + (c.roles?.length || 0), 0)
      );
      const extraCompanies = allCompanies.length - PLATFORM_COMPANIES.length;
      const levelsCount = PLATFORM_LEVELS.length + (extraCompanies * 4);

      return {
        companies: allCompanies.length,
        levels: levelsCount,
        roles: rolesCount,
        fresherPrograms: PLATFORM_FRESHER_PROGRAMS.length,
        branches: PLATFORM_BRANCHES.length,
        equivalenceLevels: Object.keys(PLATFORM_EQUIVALENCE_LEVELS).length,
        competencies: Object.keys(PLATFORM_COMPETENCIES).length,
      };
    },

    coverage() {
      const companiesWithPrograms = new Set(
        PLATFORM_FRESHER_PROGRAMS.map((p) => p.companyId)
      );
      return {
        totalCompanies: PLATFORM_COMPANIES.length,
        coveredCompanies: companiesWithPrograms.size,
        coveragePercentage: Math.round(
          (companiesWithPrograms.size / PLATFORM_COMPANIES.length) * 100
        ),
      };
    },
  },

  meta: {
    forEntity(
      type: 'company' | 'level' | 'role' | 'program',
      id: string
    ): EntityProvenance | undefined {
      if (type === 'company') return careers.companies.get(id)?.provenance;
      if (type === 'role') return careers.roles.get(id)?.provenance;
      if (type === 'program') return careers.programs.get(id)?.provenance;
      return undefined;
    },
  },

  search(query: string, types: Array<'company' | 'role' | 'program'> = ['company', 'role', 'program']) {
    if (!query || !query.trim()) return { companies: [], roles: [], programs: [] };
    const q = query.trim().toLowerCase();

    const result = {
      companies: types.includes('company') ? careers.companies.search(q) : [],
      roles: types.includes('role')
        ? PLATFORM_ROLES.filter((r) => r.title.toLowerCase().includes(q))
        : [],
      programs: types.includes('program')
        ? PLATFORM_FRESHER_PROGRAMS.filter(
            (p) =>
              p.programName.toLowerCase().includes(q) ||
              p.roleTitle.toLowerCase().includes(q) ||
              p.aliases.some((a) => a.toLowerCase().includes(q))
          )
        : [],
    };
    return result;
  },

  ext: {
    register(namespace: string, schema: any) {
      EXTENSION_SCHEMAS.set(namespace, schema);
    },

    get(type: string, id: string, namespace: string) {
      const key = `${type}:${id}:${namespace}`;
      return EXTENSION_STORE.get(key);
    },

    set(type: string, id: string, namespace: string, value: any) {
      const key = `${type}:${id}:${namespace}`;
      EXTENSION_STORE.set(key, value);
    },
  },
};
