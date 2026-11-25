// ============================================================
// ATS Skill Taxonomy — Unified Knowledge Engine (Stage 6 / Phase 10.2)
// Deterministic, source-order-invariant federation across structured
// taxonomy modules, Phase 03 domain ontology, and legacy skills.json.
// ============================================================

import { TaxonomyCategory, TaxonomySkill, SubstituteSkill } from './types';
import { SOFTWARE_LANGUAGES } from './softwareLanguages';
import { FRONTEND_WEB } from './frontendWeb';
import { BACKEND_FRAMEWORKS } from './backendFrameworks';
import { DATABASES_DATA } from './databasesData';
import { DATA_ML_AI } from './dataMlAi';
import { CLOUD_DEVOPS_INFRA } from './cloudDevopsInfra';
import { MOBILE_SECURITY_EMBEDDED } from './mobileSecurityEmbedded';
import { CORE_ENGINEERING_TOOLS } from './coreEngineeringTools';
import { DOMAIN_COMPETENCIES } from '../ontology/competencies';
import { CompetencyNode } from '../ontology/types';
import legacySkillsJson from '../skills.json';

export * from './types';
export * from '../ontology';

export type TaxonomySourceKind = 'taxonomy' | 'ontology' | 'legacy';

export interface TaxonomySourceEntry {
  source: TaxonomySourceKind;
  sourceName: string;
  skill: TaxonomySkill;
}

export interface FederationConflict {
  id: string;
  field: 'canonical' | 'category' | 'weight' | 'ambiguous' | 'duplicate_id';
  existingSource: string;
  incomingSource: string;
  existingValue: unknown;
  incomingValue: unknown;
  resolution: string;
}

export interface AliasCollisionRecord {
  alias: string;
  normalizedAlias: string;
  primarySkillId: string;
  competingSkillIds: string[];
  hasLegacyCompetitor: boolean;
  resolution: 'primary_canonical_match' | 'explicit_polysemy_disambiguated' | 'precedence_resolved';
}

export interface FederatedTaxonomyResult {
  skills: TaxonomySkill[];
  skillById: Map<string, TaxonomySkill>;
  aliasLookupMap: Map<string, TaxonomySkill>;
  ambiguousAliasMap: Map<string, TaxonomySkill[]>;
  substituteGraph: Map<string, SubstituteSkill[]>;
  impliesMap: Map<string, string[]>;
  ambiguousSkillsSet: Set<string>;
  conflicts: FederationConflict[];
  aliasCollisions: AliasCollisionRecord[];
  duplicateSameSourceIds: Array<{ id: string; sourceName: string }>;
  sourceOriginById: Map<string, TaxonomySourceKind>;
}

const SOURCE_PRIORITY: Record<TaxonomySourceKind, number> = {
  taxonomy: 0,
  ontology: 1,
  legacy: 2,
};

const HARD_AMBIGUOUS_IDS = ['c', 'go', 'r', 'rust', 'swift', 'excel'];

function mapOntologyDomainToCategory(node: CompetencyNode): TaxonomyCategory {
  if (node.domain === 'database_platform') return 'databases';
  if (node.domain === 'data_engineering' || node.domain === 'ai_ml') return 'data_ml';
  if (node.domain === 'cloud_devops') return 'cloud_devops';
  if (node.domain === 'cybersecurity') return 'security';
  if (node.category === 'frontend') return 'frontend';
  return 'backend';
}

function normalizeLegacyCategory(rawCategory: string | undefined): TaxonomyCategory {
  switch (rawCategory) {
    case 'languages':
    case 'frontend':
    case 'backend':
    case 'databases':
    case 'data_ml':
    case 'cloud_devops':
    case 'mobile':
    case 'security':
    case 'embedded':
    case 'core_engineering':
      return rawCategory;
    case 'cloud':
    case 'devops':
      return 'cloud_devops';
    case 'testing':
    case 'tools':
      return 'core_engineering';
    case 'architecture':
      return 'backend';
    default:
      return 'backend';
  }
}

function dedupeStringsCaseInsensitive(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const val of values) {
    if (!val) continue;
    const trimmed = val.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
}

function mergeSubstitutes(
  existing: SubstituteSkill[] | undefined,
  incoming: SubstituteSkill[] | undefined
): SubstituteSkill[] | undefined {
  if ((!existing || existing.length === 0) && (!incoming || incoming.length === 0)) {
    return undefined;
  }
  const byId = new Map<string, number>();
  for (const sub of [...(existing || []), ...(incoming || [])]) {
    if (!sub?.id) continue;
    const prev = byId.get(sub.id);
    const sim = typeof sub.similarity === 'number' ? sub.similarity : 0.5;
    byId.set(sub.id, prev === undefined ? sim : Math.max(prev, sim));
  }
  return Array.from(byId.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, similarity]) => ({ id, similarity }));
}

function cloneSkill(skill: TaxonomySkill): TaxonomySkill {
  return {
    id: skill.id,
    canonical: skill.canonical,
    category: skill.category,
    aliases: dedupeStringsCaseInsensitive([skill.canonical, ...(skill.aliases || [])]),
    implies: skill.implies && skill.implies.length > 0 ? Array.from(new Set(skill.implies)).sort() : undefined,
    substitutes: mergeSubstitutes(skill.substitutes, undefined),
    ambiguous: skill.ambiguous ? true : undefined,
    contextHints:
      skill.contextHints && skill.contextHints.length > 0
        ? dedupeStringsCaseInsensitive(skill.contextHints)
        : undefined,
    weight: skill.weight ?? 4,
  };
}

/**
 * Deterministically federates taxonomy entries across sources without silently overwriting
 * `implies`, `substitutes`, `aliases`, `contextHints`, `ambiguous`, `category`, or `weight`.
 * Produces identical output regardless of input source ordering.
 */
export function federateTaxonomySources(sources: TaxonomySourceEntry[]): FederatedTaxonomyResult {
  // Sort deterministically by source precedence -> sourceName -> skill.id -> canonical
  const ordered = [...sources].sort((a, b) => {
    const pDiff = SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source];
    if (pDiff !== 0) return pDiff;
    const srcDiff = a.sourceName.localeCompare(b.sourceName);
    if (srcDiff !== 0) return srcDiff;
    const idDiff = a.skill.id.localeCompare(b.skill.id);
    if (idDiff !== 0) return idDiff;
    return a.skill.canonical.localeCompare(b.skill.canonical);
  });

  const skillById = new Map<string, TaxonomySkill>();
  const winningMetaById = new Map<string, { source: TaxonomySourceKind; sourceName: string }>();
  const aliasOriginPriorityBySkill = new Map<string, Map<string, number>>();
  const seenPerSource = new Map<string, Set<string>>();
  const duplicateSameSourceIds: Array<{ id: string; sourceName: string }> = [];
  const conflicts: FederationConflict[] = [];

  const recordAliasOrigins = (skillId: string, terms: Array<string | undefined>, priority: number) => {
    let map = aliasOriginPriorityBySkill.get(skillId);
    if (!map) {
      map = new Map<string, number>();
      aliasOriginPriorityBySkill.set(skillId, map);
    }
    for (const term of terms) {
      if (!term) continue;
      const lower = term.trim().toLowerCase();
      if (!lower) continue;
      const prev = map.get(lower);
      if (prev === undefined || priority < prev) {
        map.set(lower, priority);
      }
    }
  };

  for (const entry of ordered) {
    const id = entry.skill.id.trim();
    if (!id) continue;

    recordAliasOrigins(id, [entry.skill.canonical, ...(entry.skill.aliases || [])], SOURCE_PRIORITY[entry.source]);

    let seenSet = seenPerSource.get(entry.sourceName);
    if (!seenSet) {
      seenSet = new Set<string>();
      seenPerSource.set(entry.sourceName, seenSet);
    }
    if (seenSet.has(id)) {
      duplicateSameSourceIds.push({ id, sourceName: entry.sourceName });
    }
    seenSet.add(id);

    const existing = skillById.get(id);
    if (!existing) {
      const cloned = cloneSkill({ ...entry.skill, id });
      skillById.set(id, cloned);
      winningMetaById.set(id, { source: entry.source, sourceName: entry.sourceName });
      continue;
    }

    const existingMeta = winningMetaById.get(id)!;

    if (existingMeta.source === entry.source && existingMeta.sourceName === entry.sourceName) {
      conflicts.push({
        id,
        field: 'duplicate_id',
        existingSource: existingMeta.sourceName,
        incomingSource: entry.sourceName,
        existingValue: existing.canonical,
        incomingValue: entry.skill.canonical,
        resolution: 'merged_with_first_sorted_entry',
      });
    }

    // 1. Canonical name: keep higher-precedence source; preserve incoming canonical in aliases
    if (entry.skill.canonical && entry.skill.canonical.trim() !== existing.canonical) {
      conflicts.push({
        id,
        field: 'canonical',
        existingSource: existingMeta.sourceName,
        incomingSource: entry.sourceName,
        existingValue: existing.canonical,
        incomingValue: entry.skill.canonical,
        resolution: `retained_${existingMeta.source}_canonical`,
      });
    }

    // 2. Category: keep higher-precedence source; never let ontology/legacy overwrite taxonomy
    if (entry.skill.category && entry.skill.category !== existing.category) {
      conflicts.push({
        id,
        field: 'category',
        existingSource: existingMeta.sourceName,
        incomingSource: entry.sourceName,
        existingValue: existing.category,
        incomingValue: entry.skill.category,
        resolution: `retained_${existingMeta.source}_category`,
      });
    }

    // 3. Weight: keep higher-precedence explicit weight; record disagreement if different
    if (
      typeof entry.skill.weight === 'number' &&
      typeof existing.weight === 'number' &&
      entry.skill.weight !== existing.weight
    ) {
      conflicts.push({
        id,
        field: 'weight',
        existingSource: existingMeta.sourceName,
        incomingSource: entry.sourceName,
        existingValue: existing.weight,
        incomingValue: entry.skill.weight,
        resolution: `retained_${existingMeta.source}_weight`,
      });
    }
    if (existing.weight === undefined && typeof entry.skill.weight === 'number') {
      existing.weight = entry.skill.weight;
    }

    // 4. Ambiguity & contextHints: additive / monotonic union (never lose ambiguity guards)
    if (entry.skill.ambiguous && !existing.ambiguous) {
      conflicts.push({
        id,
        field: 'ambiguous',
        existingSource: existingMeta.sourceName,
        incomingSource: entry.sourceName,
        existingValue: Boolean(existing.ambiguous),
        incomingValue: true,
        resolution: 'promoted_ambiguous_true',
      });
      existing.ambiguous = true;
    }
    if (entry.skill.contextHints && entry.skill.contextHints.length > 0) {
      existing.contextHints = dedupeStringsCaseInsensitive([
        ...(existing.contextHints || []),
        ...entry.skill.contextHints,
      ]);
    }

    // 5. Aliases: deterministic case-insensitive union (includes incoming canonical if distinct)
    existing.aliases = dedupeStringsCaseInsensitive([
      ...existing.aliases,
      entry.skill.canonical,
      ...(entry.skill.aliases || []),
    ]);

    // 6. Implies: non-destructive union (NEVER overwrite existing implies with undefined!)
    if (entry.skill.implies && entry.skill.implies.length > 0) {
      existing.implies = Array.from(
        new Set([...(existing.implies || []), ...entry.skill.implies.filter(imp => imp !== id)])
      ).sort();
    }

    // 7. Substitutes: non-destructive union keeping max similarity per substitute target
    if (entry.skill.substitutes && entry.skill.substitutes.length > 0) {
      existing.substitutes = mergeSubstitutes(existing.substitutes, entry.skill.substitutes);
    }
  }

  // Enforce hard ambiguity guards consistently
  const ambiguousSkillsSet = new Set<string>();
  for (const id of HARD_AMBIGUOUS_IDS) {
    const skill = skillById.get(id);
    if (skill) {
      skill.ambiguous = true;
    }
  }

  const skills = Array.from(skillById.values()).sort((a, b) => a.id.localeCompare(b.id));
  const sourceOriginById = new Map<string, TaxonomySourceKind>();
  for (const skill of skills) {
    sourceOriginById.set(skill.id, winningMetaById.get(skill.id)!.source);
    if (skill.ambiguous) {
      ambiguousSkillsSet.add(skill.id);
    }
  }

  // Build candidate map for all normalized aliases/canonicals
  const candidatesByAlias = new Map<
    string,
    Array<{
      skill: TaxonomySkill;
      isCanonical: boolean;
      aliasSourcePriority: number;
      rawAlias: string;
    }>
  >();
  for (const skill of skills) {
    const canonLower = skill.canonical.trim().toLowerCase();
    const skillAliasOrigins = aliasOriginPriorityBySkill.get(skill.id);
    const allTerms = dedupeStringsCaseInsensitive([skill.canonical, ...skill.aliases]);
    for (const term of allTerms) {
      const key = term.toLowerCase();
      let list = candidatesByAlias.get(key);
      if (!list) {
        list = [];
        candidatesByAlias.set(key, list);
      }
      if (!list.some(item => item.skill.id === skill.id)) {
        const aliasSourcePriority =
          skillAliasOrigins?.get(key) ?? SOURCE_PRIORITY[sourceOriginById.get(skill.id)!];
        list.push({
          skill,
          isCanonical: key === canonLower,
          aliasSourcePriority,
          rawAlias: term,
        });
      }
    }
  }

  // Deterministic precedence resolution for ALIAS_LOOKUP_MAP and polysemy tracking
  const aliasLookupMap = new Map<string, TaxonomySkill>();
  const ambiguousAliasMap = new Map<string, TaxonomySkill[]>();
  const aliasCollisions: AliasCollisionRecord[] = [];

  for (const [normalizedAlias, candidates] of candidatesByAlias.entries()) {
    const sortedCandidates = [...candidates].sort((a, b) => {
      // 1. Non-legacy alias provenance (taxonomy/ontology) beats legacy-only provenance
      const aIsLegacyAlias = a.aliasSourcePriority >= SOURCE_PRIORITY.legacy;
      const bIsLegacyAlias = b.aliasSourcePriority >= SOURCE_PRIORITY.legacy;
      if (aIsLegacyAlias !== bIsLegacyAlias) return aIsLegacyAlias ? 1 : -1;
      // 2. Exact canonical match wins
      if (a.isCanonical !== b.isCanonical) return a.isCanonical ? -1 : 1;
      // 3. Higher alias-contributing source priority wins (taxonomy > ontology > legacy)
      if (a.aliasSourcePriority !== b.aliasSourcePriority) {
        return a.aliasSourcePriority - b.aliasSourcePriority;
      }
      // 4. Higher weight wins
      const wDiff = (b.skill.weight ?? 0) - (a.skill.weight ?? 0);
      if (wDiff !== 0) return wDiff;
      // 5. Deterministic ID tie-breaker
      return a.skill.id.localeCompare(b.skill.id);
    });

    const winner = sortedCandidates[0];
    aliasLookupMap.set(normalizedAlias, winner.skill);

    if (sortedCandidates.length > 1) {
      ambiguousAliasMap.set(
        normalizedAlias,
        sortedCandidates.map(c => c.skill)
      );
      const hasLegacyCompetitor = sortedCandidates.some(
        c => c.aliasSourcePriority >= SOURCE_PRIORITY.legacy || sourceOriginById.get(c.skill.id) === 'legacy'
      );
      const hasMultipleNonLegacy =
        sortedCandidates.filter(c => c.aliasSourcePriority < SOURCE_PRIORITY.legacy).length > 1;
      aliasCollisions.push({
        alias: winner.rawAlias,
        normalizedAlias,
        primarySkillId: winner.skill.id,
        competingSkillIds: sortedCandidates.slice(1).map(c => c.skill.id),
        hasLegacyCompetitor,
        resolution: winner.isCanonical
          ? 'primary_canonical_match'
          : hasMultipleNonLegacy
            ? 'explicit_polysemy_disambiguated'
            : 'precedence_resolved',
      });
    }
  }

  // Populate Substitute graph and Implication graph from merged skills
  const substituteGraph = new Map<string, SubstituteSkill[]>();
  const impliesMap = new Map<string, string[]>();

  for (const skill of skills) {
    if (skill.substitutes && skill.substitutes.length > 0) {
      substituteGraph.set(skill.id, skill.substitutes);
    }
    if (skill.implies && skill.implies.length > 0) {
      impliesMap.set(skill.id, skill.implies);
    }
  }

  return {
    skills,
    skillById,
    aliasLookupMap,
    ambiguousAliasMap,
    substituteGraph,
    impliesMap,
    ambiguousSkillsSet,
    conflicts,
    aliasCollisions,
    duplicateSameSourceIds,
    sourceOriginById,
  };
}

// 1. Convert Phase 03 ontology nodes to TaxonomySkill entries (preserving abbreviations & hints)
const ONTOLOGY_AS_TAXONOMY: TaxonomySkill[] = DOMAIN_COMPETENCIES.map(node => ({
  id: node.id,
  canonical: node.canonical,
  category: mapOntologyDomainToCategory(node),
  aliases: dedupeStringsCaseInsensitive([node.canonical, ...node.aliases, ...(node.abbreviations || [])]),
  ambiguous: node.ambiguous,
  contextHints: node.contextHints,
  weight: node.weight || 4,
}));

export const TAXONOMY_REGISTRY: TaxonomySkill[] = [
  ...SOFTWARE_LANGUAGES,
  ...FRONTEND_WEB,
  ...BACKEND_FRAMEWORKS,
  ...DATABASES_DATA,
  ...DATA_ML_AI,
  ...CLOUD_DEVOPS_INFRA,
  ...MOBILE_SECURITY_EMBEDDED,
  ...CORE_ENGINEERING_TOOLS,
  ...ONTOLOGY_AS_TAXONOMY,
];

const TAXONOMY_SOURCE_ENTRIES: TaxonomySourceEntry[] = [
  ...SOFTWARE_LANGUAGES.map(skill => ({ source: 'taxonomy' as const, sourceName: 'softwareLanguages', skill })),
  ...FRONTEND_WEB.map(skill => ({ source: 'taxonomy' as const, sourceName: 'frontendWeb', skill })),
  ...BACKEND_FRAMEWORKS.map(skill => ({ source: 'taxonomy' as const, sourceName: 'backendFrameworks', skill })),
  ...DATABASES_DATA.map(skill => ({ source: 'taxonomy' as const, sourceName: 'databasesData', skill })),
  ...DATA_ML_AI.map(skill => ({ source: 'taxonomy' as const, sourceName: 'dataMlAi', skill })),
  ...CLOUD_DEVOPS_INFRA.map(skill => ({ source: 'taxonomy' as const, sourceName: 'cloudDevopsInfra', skill })),
  ...MOBILE_SECURITY_EMBEDDED.map(skill => ({ source: 'taxonomy' as const, sourceName: 'mobileSecurityEmbedded', skill })),
  ...CORE_ENGINEERING_TOOLS.map(skill => ({ source: 'taxonomy' as const, sourceName: 'coreEngineeringTools', skill })),
  ...ONTOLOGY_AS_TAXONOMY.map(skill => ({ source: 'ontology' as const, sourceName: 'domainCompetencies', skill })),
  ...(legacySkillsJson && Array.isArray((legacySkillsJson as any).skills)
    ? ((legacySkillsJson as any).skills as any[]).map(legacy => ({
        source: 'legacy' as const,
        sourceName: 'skills.json',
        skill: {
          id: legacy.id,
          canonical: legacy.canonical,
          category: normalizeLegacyCategory(legacy.category),
          aliases: legacy.aliases || [legacy.canonical],
          ambiguous: legacy.ambiguous,
          contextHints: legacy.contextHints,
          implies: legacy.implies,
          weight: legacy.weight || 4,
        } satisfies TaxonomySkill,
      }))
    : []),
];

const FEDERATED = federateTaxonomySources(TAXONOMY_SOURCE_ENTRIES);

// 2. Export federated canonical map and complete list
export const SKILL_BY_ID = FEDERATED.skillById;
export const ALL_TAXONOMY_SKILLS: TaxonomySkill[] = FEDERATED.skills;

// 3. Fast O(1) normalized alias lookup map + polysemy candidate map
export const ALIAS_LOOKUP_MAP = FEDERATED.aliasLookupMap;
export const AMBIGUOUS_ALIAS_MAP = FEDERATED.ambiguousAliasMap;

// 4. Substitute graph and Implication graph
export const SUBSTITUTE_GRAPH = FEDERATED.substituteGraph;
export const IMPLIES_MAP = FEDERATED.impliesMap;

// 5. Ambiguity Guards set
export const AMBIGUOUS_SKILLS_SET = FEDERATED.ambiguousSkillsSet;

// 6. Federation diagnostic report for validation & audit consumers
export const TAXONOMY_FEDERATION_REPORT = {
  conflicts: FEDERATED.conflicts,
  aliasCollisions: FEDERATED.aliasCollisions,
  duplicateSameSourceIds: FEDERATED.duplicateSameSourceIds,
  sourceOriginById: FEDERATED.sourceOriginById,
};

/**
 * Returns all candidate TaxonomySkills matching a raw term or alias (for polysemy-aware resolution).
 */
export function resolveSkillCandidates(term: string): TaxonomySkill[] {
  if (!term) return [];
  const normalized = term.trim().toLowerCase();
  const candidates = AMBIGUOUS_ALIAS_MAP.get(normalized);
  if (candidates && candidates.length > 0) {
    return [...candidates];
  }
  const single = ALIAS_LOOKUP_MAP.get(normalized) || SKILL_BY_ID.get(normalized);
  return single ? [single] : [];
}

/**
 * Resolves a raw term or token to a canonical TaxonomySkill.
 * When `surroundingContext` is provided and an alias is polysemous across multiple skills,
 * uses explicit context hints / ambiguity guards before falling back to deterministic precedence.
 */
export function resolveSkillByTerm(term: string, surroundingContext?: string): TaxonomySkill | undefined {
  if (!term) return undefined;
  const normalized = term.trim().toLowerCase();

  if (surroundingContext) {
    const candidates = AMBIGUOUS_ALIAS_MAP.get(normalized);
    if (candidates && candidates.length > 1) {
      // Check if surrounding context explicitly matches one candidate's non-shared hints or canonical
      const matched = candidates.find(candidate => {
        if (candidate.ambiguous && !verifyAmbiguityGuard(candidate, surroundingContext)) {
          return false;
        }
        if (candidate.contextHints && candidate.contextHints.length > 0) {
          return candidate.contextHints.some(hint => {
            const escaped = hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'i').test(surroundingContext);
          });
        }
        return false;
      });
      if (matched) return matched;
    }
  }

  return ALIAS_LOOKUP_MAP.get(normalized) || SKILL_BY_ID.get(normalized);
}

/**
 * Checks if a skill match meets required context when ambiguous.
 * Enforces boundary checking so hints like "in C" do not match inside "Vitamin C".
 */
export function verifyAmbiguityGuard(skill: TaxonomySkill, surroundingContext: string): boolean {
  if (!skill.ambiguous) return true;
  if (!skill.contextHints || skill.contextHints.length === 0) return true;
  return skill.contextHints.some(hint => {
    const escaped = hint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'i');
    return regex.test(surroundingContext);
  });
}
