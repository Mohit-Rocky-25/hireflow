// ============================================================
// ATS Resume Roaster — Competency Ontology Registry & Graph Engine (Phase 03 / 10.2)
// High-performance index maps, semantic relationship queries,
// alternative resolution, and symmetric non-equivalence validation guards.
// ============================================================

import { CompetencyNode, RelationshipType } from './types';
import { DOMAIN_COMPETENCIES } from './competencies';

export * from './types';
export * from './competencies';

export interface OntologyIndexes {
  byId: Map<string, CompetencyNode>;
  aliasMap: Map<string, CompetencyNode>;
  relationshipsBySource: Map<string, Map<RelationshipType, string[]>>;
  nonEquivalenceGuards: Map<string, Set<string>>;
  alternativesMap: Map<string, Set<string>>;
}

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string): void {
  let set = map.get(key);
  if (!set) {
    set = new Set<string>();
    map.set(key, set);
  }
  set.add(value);
}

/**
 * Builds deterministic ontology lookup and relationship indexes from a list of CompetencyNodes.
 * - Canonical names take precedence over aliases/abbreviations in `aliasMap`.
 * - Non-equivalence guards (`NOT_EQUIVALENT_TO`, `DOES_NOT_PROVE`) are indexed symmetrically.
 * - Alternatives (`ALTERNATIVE_TO`, `ONE_OF`) are indexed symmetrically.
 * - Directed relationships (`DEPENDS_ON`, `IMPLEMENTS`, `SUPPORTS`, `SUBCATEGORY_OF`, etc.)
 *   remain strictly directional in `relationshipsBySource`.
 */
export function buildOntologyIndexes(nodes: CompetencyNode[]): OntologyIndexes {
  const byId = new Map<string, CompetencyNode>();
  const aliasMap = new Map<string, CompetencyNode>();
  const canonicalKeys = new Set<string>();
  const relationshipsBySource = new Map<string, Map<RelationshipType, string[]>>();
  const nonEquivalenceGuards = new Map<string, Set<string>>();
  const alternativesMap = new Map<string, Set<string>>();

  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

  for (const node of sortedNodes) {
    byId.set(node.id, node);

    const canonLower = node.canonical.trim().toLowerCase();
    if (canonLower) {
      aliasMap.set(canonLower, node);
      canonicalKeys.add(canonLower);
    }

    const relMap = new Map<RelationshipType, string[]>();
    for (const rel of node.relationships) {
      const existing = relMap.get(rel.type) || [];
      if (!existing.includes(rel.targetId)) {
        existing.push(rel.targetId);
      }
      relMap.set(rel.type, existing);

      // Track non-equivalence guards symmetrically so areNonEquivalent(A, B) === areNonEquivalent(B, A)
      if (rel.type === 'NOT_EQUIVALENT_TO' || rel.type === 'DOES_NOT_PROVE') {
        if (rel.targetId && rel.targetId !== node.id) {
          addToSetMap(nonEquivalenceGuards, node.id, rel.targetId);
          addToSetMap(nonEquivalenceGuards, rel.targetId, node.id);
        }
      }

      // Track alternatives symmetrically
      if (rel.type === 'ALTERNATIVE_TO' || rel.type === 'ONE_OF') {
        if (rel.targetId && rel.targetId !== node.id) {
          addToSetMap(alternativesMap, node.id, rel.targetId);
          addToSetMap(alternativesMap, rel.targetId, node.id);
        }
      }
    }
    relationshipsBySource.set(node.id, relMap);
  }

  // Index aliases and abbreviations in a second pass so canonical names always take precedence
  for (const node of sortedNodes) {
    const tokens = [...node.aliases, ...(node.abbreviations || [])];
    for (const token of tokens) {
      const key = token.trim().toLowerCase();
      if (!key || canonicalKeys.has(key)) continue;
      if (!aliasMap.has(key)) {
        aliasMap.set(key, node);
      }
    }
  }

  return {
    byId,
    aliasMap,
    relationshipsBySource,
    nonEquivalenceGuards,
    alternativesMap,
  };
}

const DEFAULT_INDEXES = buildOntologyIndexes(DOMAIN_COMPETENCIES);

// 1. Primary Indexed Registry by Unique Competency ID
export const ONTOLOGY_BY_ID = DEFAULT_INDEXES.byId;

// 2. Normalized Fast Lookup Map by Alias / Synonyms
export const ONTOLOGY_ALIAS_MAP = DEFAULT_INDEXES.aliasMap;

// 3. Graph Mappings by Relationship Type
export const RELATIONSHIPS_BY_SOURCE = DEFAULT_INDEXES.relationshipsBySource;
export const NON_EQUIVALENCE_GUARDS = DEFAULT_INDEXES.nonEquivalenceGuards;
export const ALTERNATIVES_MAP = DEFAULT_INDEXES.alternativesMap;

/**
 * Checks if two competencies have a symmetric non-equivalence guard
 * preventing either from being treated as proof of the other.
 */
export function areNonEquivalent(sourceId: string, targetId: string): boolean {
  if (!sourceId || !targetId || sourceId === targetId) return false;
  const forward = NON_EQUIVALENCE_GUARDS.get(sourceId);
  if (forward && forward.has(targetId)) return true;
  const reverse = NON_EQUIVALENCE_GUARDS.get(targetId);
  return Boolean(reverse && reverse.has(sourceId));
}

/**
 * Checks whether candidate competency A can satisfy requirement B via ALTERNATIVE_TO / ONE_OF.
 */
export function isPermissibleAlternative(requirementId: string, candidateCompetencyId: string): boolean {
  if (!requirementId || !candidateCompetencyId) return false;
  if (requirementId === candidateCompetencyId) return true;
  const alts = ALTERNATIVES_MAP.get(requirementId);
  return Boolean(alts && alts.has(candidateCompetencyId));
}

/**
 * Returns directed relationship targets from `sourceId` for a given `RelationshipType`.
 * Preserves directional semantics for DEPENDS_ON, IMPLEMENTS, SUPPORTS, SUBCATEGORY_OF, etc.
 */
export function getRelationshipTargets(sourceId: string, type: RelationshipType): string[] {
  const relMap = RELATIONSHIPS_BY_SOURCE.get(sourceId);
  return relMap ? [...(relMap.get(type) || [])] : [];
}

/**
 * Checks whether a directed relationship of `type` exists from `sourceId` to `targetId`.
 */
export function hasDirectedRelationship(
  sourceId: string,
  type: RelationshipType,
  targetId: string
): boolean {
  const targets = RELATIONSHIPS_BY_SOURCE.get(sourceId)?.get(type);
  return Boolean(targets && targets.includes(targetId));
}

/**
 * Finds a competency node by ID, canonical name, alias, or abbreviation.
 */
export function resolveCompetency(query: string): CompetencyNode | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();
  return ONTOLOGY_BY_ID.get(clean) || ONTOLOGY_ALIAS_MAP.get(clean);
}
