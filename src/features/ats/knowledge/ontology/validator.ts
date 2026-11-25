// ============================================================
// ATS Resume Roaster — Knowledge Base Validator (Phase 03 / 10.2)
// Audits the competency ontology and federated taxonomy for:
// - invalid identifiers & malformed relationship structures
// - duplicate IDs & conflicting cross-source definitions
// - missing relationship / implication / substitute / alias targets
//   (resolved against BOTH ONTOLOGY_BY_ID and federated SKILL_BY_ID)
// - circular parentage & cyclic implication chains
// - conflicting non-equivalence vs alternative guards
// - ambiguous alias collisions vs intentionally ambiguous legacy aliases
// ============================================================

import { DOMAIN_COMPETENCIES } from './competencies';
import { CompetencyNode, RelationshipType } from './types';
import {
  ALL_TAXONOMY_SKILLS,
  ALIAS_LOOKUP_MAP,
  SKILL_BY_ID,
  TAXONOMY_FEDERATION_REPORT,
  TaxonomySkill,
  AliasCollisionRecord,
  FederationConflict,
} from '../taxonomy';

export type ValidationErrorType =
  | 'INVALID_ID'
  | 'DUPLICATE_ID'
  | 'DUPLICATE_ALIAS'
  | 'CIRCULAR_PARENT'
  | 'UNRESOLVED_TARGET'
  | 'INVALID_RELATIONSHIP'
  | 'CONFLICTING_GUARD';

export type ValidationWarningType =
  | 'AMBIGUOUS_ALIAS_COLLISION'
  | 'LEGACY_ALIAS_SHADOW'
  | 'FEDERATION_METADATA_CONFLICT';

export interface ValidationError {
  type: ValidationErrorType;
  competencyId: string;
  message: string;
}

export interface ValidationWarning {
  type: ValidationWarningType;
  competencyId: string;
  message: string;
  competingIds?: string[];
}

export interface ValidationOptions {
  nodes?: CompetencyNode[];
  taxonomySkills?: TaxonomySkill[];
  aliasLookupMap?: Map<string, TaxonomySkill>;
  federationConflicts?: FederationConflict[];
  aliasCollisions?: AliasCollisionRecord[];
  duplicateSameSourceIds?: Array<{ id: string; sourceName: string }>;
  strictAliases?: boolean;
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: {
    ontologyNodeCount: number;
    taxonomySkillCount: number;
    relationshipsChecked: number;
    errorCount: number;
    warningCount: number;
  };
}

const VALID_ID_REGEX = /^[a-z][a-z0-9_]*$/;

const HIERARCHICAL_REL_TYPES = new Set<RelationshipType>([
  'SUBCATEGORY_OF',
  'CHILD_OF',
  'PART_OF',
]);

const VALID_RELATIONSHIP_TYPES = new Set<RelationshipType>([
  'ALIAS_OF',
  'SYNONYM_OF',
  'ABBREVIATION_OF',
  'VARIANT_OF',
  'SUBCATEGORY_OF',
  'CHILD_OF',
  'PART_OF',
  'RELATED_TO',
  'SUPPORTS',
  'IMPLEMENTS',
  'DEPENDS_ON',
  'PREREQUISITE_OF',
  'ALTERNATIVE_TO',
  'ONE_OF',
  'REQUIRES_BOTH',
  'REQUIRES_ANY',
  'NOT_EQUIVALENT_TO',
  'DOES_NOT_PROVE',
]);

function isAlternativeType(type: RelationshipType): boolean {
  return type === 'ALTERNATIVE_TO' || type === 'ONE_OF';
}

function isNonEquivalenceType(type: RelationshipType): boolean {
  return type === 'NOT_EQUIVALENT_TO' || type === 'DOES_NOT_PROVE';
}

/**
 * Audits the competency ontology and federated taxonomy registry.
 */
export function validateCompetencyOntology(options: ValidationOptions = {}): ValidationReport {
  const isDefaultRegistry = !options.nodes && !options.taxonomySkills;
  const nodes = options.nodes ?? DOMAIN_COMPETENCIES;
  const taxonomySkills = options.taxonomySkills ?? ALL_TAXONOMY_SKILLS;

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const ontologyById = new Map<string, CompetencyNode>();
  const taxonomyById = new Map<string, TaxonomySkill>();

  // 1. Audit Ontology Node IDs, Canonicals, and Aliases
  const seenOntologyIds = new Set<string>();
  const ontologyCanonicalToId = new Map<string, string>();
  const ontologyAliasToIds = new Map<string, Set<string>>();

  for (const node of nodes) {
    if (!node.id || typeof node.id !== 'string' || !VALID_ID_REGEX.test(node.id)) {
      errors.push({
        type: 'INVALID_ID',
        competencyId: String(node.id || '<empty>'),
        message: `Invalid ontology competency ID "${node.id}". Expected snake_case matching ${VALID_ID_REGEX}.`,
      });
    }

    if (!node.canonical || typeof node.canonical !== 'string' || !node.canonical.trim()) {
      errors.push({
        type: 'INVALID_ID',
        competencyId: node.id,
        message: `Ontology competency "${node.id}" has an empty canonical name.`,
      });
    }

    if (seenOntologyIds.has(node.id)) {
      errors.push({
        type: 'DUPLICATE_ID',
        competencyId: node.id,
        message: `Duplicate ontology competency ID detected: "${node.id}".`,
      });
    } else {
      seenOntologyIds.add(node.id);
      ontologyById.set(node.id, node);
    }

    const canonLower = (node.canonical || '').trim().toLowerCase();
    if (canonLower) {
      const prevId = ontologyCanonicalToId.get(canonLower);
      if (prevId && prevId !== node.id) {
        errors.push({
          type: 'DUPLICATE_ALIAS',
          competencyId: node.id,
          message: `Ontology canonical name "${node.canonical}" conflicts with "${prevId}".`,
        });
      } else {
        ontologyCanonicalToId.set(canonLower, node.id);
      }
    }

    const allNodeTerms = [...(node.aliases || []), ...(node.abbreviations || [])];
    for (const term of allNodeTerms) {
      if (typeof term !== 'string' || !term.trim()) {
        errors.push({
          type: 'INVALID_ID',
          competencyId: node.id,
          message: `Ontology competency "${node.id}" contains an empty alias/abbreviation.`,
        });
        continue;
      }
      const lower = term.trim().toLowerCase();
      let set = ontologyAliasToIds.get(lower);
      if (!set) {
        set = new Set<string>();
        ontologyAliasToIds.set(lower, set);
      }
      set.add(node.id);
    }
  }

  for (const [aliasLower, claimingIds] of ontologyAliasToIds.entries()) {
    if (claimingIds.size <= 1) continue;
    const ids = Array.from(claimingIds);
    const allAmbiguous = ids.every(id => Boolean(ontologyById.get(id)?.ambiguous));
    if (allAmbiguous && !options.strictAliases) {
      warnings.push({
        type: 'AMBIGUOUS_ALIAS_COLLISION',
        competencyId: ids[0],
        competingIds: ids.slice(1),
        message: `Intentional polysemous alias "${aliasLower}" shared across ambiguous ontology nodes [${ids.join(', ')}].`,
      });
    } else {
      errors.push({
        type: 'DUPLICATE_ALIAS',
        competencyId: ids[1],
        message: `Ontology alias "${aliasLower}" on "${ids[1]}" is already claimed by "${ids[0]}".`,
      });
    }
  }

  // 2. Audit Federated Taxonomy IDs, Same-Source Duplicates, and Canonical Uniqueness
  const seenTaxonomyIds = new Set<string>();
  const nonLegacyCanonicalToId = new Map<string, string>();
  const sourceOriginById = isDefaultRegistry
    ? TAXONOMY_FEDERATION_REPORT.sourceOriginById
    : undefined;

  for (const skill of taxonomySkills) {
    if (!skill.id || typeof skill.id !== 'string' || !VALID_ID_REGEX.test(skill.id)) {
      errors.push({
        type: 'INVALID_ID',
        competencyId: String(skill.id || '<empty>'),
        message: `Invalid taxonomy skill ID "${skill.id}". Expected snake_case matching ${VALID_ID_REGEX}.`,
      });
    }
    if (!skill.canonical || typeof skill.canonical !== 'string' || !skill.canonical.trim()) {
      errors.push({
        type: 'INVALID_ID',
        competencyId: skill.id,
        message: `Taxonomy skill "${skill.id}" has an empty canonical name.`,
      });
    }
    if (seenTaxonomyIds.has(skill.id)) {
      errors.push({
        type: 'DUPLICATE_ID',
        competencyId: skill.id,
        message: `Duplicate taxonomy skill ID detected: "${skill.id}".`,
      });
    } else {
      seenTaxonomyIds.add(skill.id);
      taxonomyById.set(skill.id, skill);
    }

    const isLegacyOnly = sourceOriginById?.get(skill.id) === 'legacy';
    const canonLower = (skill.canonical || '').trim().toLowerCase();
    if (canonLower && !isLegacyOnly) {
      const prevId = nonLegacyCanonicalToId.get(canonLower);
      if (prevId && prevId !== skill.id) {
        errors.push({
          type: 'DUPLICATE_ALIAS',
          competencyId: skill.id,
          message: `Canonical name "${skill.canonical}" on "${skill.id}" conflicts with "${prevId}".`,
        });
      } else {
        nonLegacyCanonicalToId.set(canonLower, skill.id);
      }
    }
  }

  const sameSourceDupes =
    options.duplicateSameSourceIds ??
    (isDefaultRegistry ? TAXONOMY_FEDERATION_REPORT.duplicateSameSourceIds : []);
  for (const dupe of sameSourceDupes) {
    errors.push({
      type: 'DUPLICATE_ID',
      competencyId: dupe.id,
      message: `Duplicate skill ID "${dupe.id}" inside source "${dupe.sourceName}".`,
    });
  }

  // 3. Audit Alias Lookup Target Integrity & Alias Collisions
  const aliasLookup = options.aliasLookupMap ?? (isDefaultRegistry ? ALIAS_LOOKUP_MAP : undefined);
  if (aliasLookup) {
    for (const [aliasKey, targetSkill] of aliasLookup.entries()) {
      if (!targetSkill || !targetSkill.id || !taxonomyById.has(targetSkill.id)) {
        errors.push({
          type: 'UNRESOLVED_TARGET',
          competencyId: targetSkill?.id || aliasKey,
          message: `Alias lookup entry "${aliasKey}" points to non-existent skill "${targetSkill?.id}".`,
        });
      }
    }
  }

  const aliasCollisions =
    options.aliasCollisions ??
    (isDefaultRegistry ? TAXONOMY_FEDERATION_REPORT.aliasCollisions : computeAliasCollisions(taxonomySkills));

  for (const col of aliasCollisions) {
    if (options.strictAliases) {
      errors.push({
        type: 'DUPLICATE_ALIAS',
        competencyId: col.primarySkillId,
        message: `Alias "${col.alias}" collides across [${col.primarySkillId}, ${col.competingSkillIds.join(', ')}] (resolution: ${col.resolution}).`,
      });
    } else {
      warnings.push({
        type: col.hasLegacyCompetitor ? 'LEGACY_ALIAS_SHADOW' : 'AMBIGUOUS_ALIAS_COLLISION',
        competencyId: col.primarySkillId,
        competingIds: col.competingSkillIds,
        message: `Alias "${col.alias}" resolves to "${col.primarySkillId}" (${col.resolution}); competing skills: [${col.competingSkillIds.join(', ')}].`,
      });
    }
  }

  const federationConflicts =
    options.federationConflicts ??
    (isDefaultRegistry ? TAXONOMY_FEDERATION_REPORT.conflicts : []);
  for (const conflict of federationConflicts) {
    if (conflict.field === 'duplicate_id') {
      errors.push({
        type: 'DUPLICATE_ID',
        competencyId: conflict.id,
        message: `Duplicate ID "${conflict.id}" in "${conflict.existingSource}" and "${conflict.incomingSource}".`,
      });
    } else {
      warnings.push({
        type: 'FEDERATION_METADATA_CONFLICT',
        competencyId: conflict.id,
        message: `Cross-source ${conflict.field} difference on "${conflict.id}" (${conflict.existingSource}=${JSON.stringify(conflict.existingValue)} vs ${conflict.incomingSource}=${JSON.stringify(conflict.incomingValue)} -> ${conflict.resolution}).`,
      });
    }
  }

  // 4. Audit Ontology Relationships, Target Resolution, & Conflicting Guards
  let relationshipsChecked = 0;
  const hierarchyAdjacency = new Map<string, string[]>();

  for (const node of nodes) {
    const hierarchyTargets: string[] = [];

    if (node.parentCompetencyId !== undefined) {
      if (!node.parentCompetencyId || !VALID_ID_REGEX.test(node.parentCompetencyId)) {
        errors.push({
          type: 'INVALID_ID',
          competencyId: node.id,
          message: `Invalid parentCompetencyId "${node.parentCompetencyId}" on "${node.id}".`,
        });
      } else if (node.parentCompetencyId === node.id) {
        errors.push({
          type: 'CIRCULAR_PARENT',
          competencyId: node.id,
          message: `Competency "${node.id}" references itself as parentCompetencyId.`,
        });
      } else if (!ontologyById.has(node.parentCompetencyId) && !taxonomyById.has(node.parentCompetencyId)) {
        errors.push({
          type: 'UNRESOLVED_TARGET',
          competencyId: node.id,
          message: `Competency "${node.id}" has unresolved parentCompetencyId "${node.parentCompetencyId}".`,
        });
      } else {
        hierarchyTargets.push(node.parentCompetencyId);
      }
    }

    for (const rel of node.relationships || []) {
      relationshipsChecked++;

      if (!rel || !VALID_RELATIONSHIP_TYPES.has(rel.type)) {
        errors.push({
          type: 'INVALID_RELATIONSHIP',
          competencyId: node.id,
          message: `Invalid relationship type "${rel?.type}" on competency "${node.id}".`,
        });
        continue;
      }

      if (!rel.targetId || typeof rel.targetId !== 'string' || !VALID_ID_REGEX.test(rel.targetId)) {
        errors.push({
          type: 'INVALID_RELATIONSHIP',
          competencyId: node.id,
          message: `Invalid relationship targetId "${rel.targetId}" for ${rel.type} on "${node.id}".`,
        });
        continue;
      }

      if (rel.targetId === node.id) {
        errors.push({
          type: 'INVALID_RELATIONSHIP',
          competencyId: node.id,
          message: `Self-referential ${rel.type} relationship on "${node.id}".`,
        });
      }

      if (
        rel.confidence !== undefined &&
        (typeof rel.confidence !== 'number' || Number.isNaN(rel.confidence) || rel.confidence <= 0 || rel.confidence > 1)
      ) {
        errors.push({
          type: 'INVALID_RELATIONSHIP',
          competencyId: node.id,
          message: `Invalid relationship confidence ${rel.confidence} on "${node.id}" -> "${rel.targetId}".`,
        });
      }

      // Resolve target against BOTH ONTOLOGY_BY_ID and federated SKILL_BY_ID
      if (!ontologyById.has(rel.targetId) && !taxonomyById.has(rel.targetId)) {
        errors.push({
          type: 'UNRESOLVED_TARGET',
          competencyId: node.id,
          message: `Competency "${node.id}" (${rel.type}) references missing target "${rel.targetId}" (not found in ontology or taxonomy).`,
        });
      }

      if (HIERARCHICAL_REL_TYPES.has(rel.type)) {
        hierarchyTargets.push(rel.targetId);
      }

      // Check conflicting guards locally and across target node
      if (isAlternativeType(rel.type)) {
        const hasLocalGuard = node.relationships.some(
          r => isNonEquivalenceType(r.type) && r.targetId === rel.targetId
        );
        const targetNode = ontologyById.get(rel.targetId);
        const hasReverseGuard = Boolean(
          targetNode?.relationships.some(
            r => isNonEquivalenceType(r.type) && r.targetId === node.id
          )
        );
        if (hasLocalGuard || hasReverseGuard) {
          errors.push({
            type: 'CONFLICTING_GUARD',
            competencyId: node.id,
            message: `Competency "${node.id}" lists "${rel.targetId}" as both ${rel.type} and non-equivalent.`,
          });
        }
      }
    }

    if (hierarchyTargets.length > 0) {
      hierarchyAdjacency.set(node.id, hierarchyTargets);
    }
  }

  // 5. Audit Taxonomy Implies & Substitutes Targets
  const impliesAdjacency = new Map<string, string[]>();
  for (const skill of taxonomySkills) {
    if (skill.implies && skill.implies.length > 0) {
      impliesAdjacency.set(skill.id, skill.implies);
      for (const imp of skill.implies) {
        relationshipsChecked++;
        if (!imp || !VALID_ID_REGEX.test(imp)) {
          errors.push({
            type: 'INVALID_RELATIONSHIP',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" has invalid implies target "${imp}".`,
          });
        } else if (imp === skill.id) {
          errors.push({
            type: 'CIRCULAR_PARENT',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" implies itself.`,
          });
        } else if (!taxonomyById.has(imp) && !ontologyById.has(imp)) {
          errors.push({
            type: 'UNRESOLVED_TARGET',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" implies missing target "${imp}".`,
          });
        }
      }
    }

    if (skill.substitutes && skill.substitutes.length > 0) {
      for (const sub of skill.substitutes) {
        relationshipsChecked++;
        if (!sub || !sub.id || !VALID_ID_REGEX.test(sub.id)) {
          errors.push({
            type: 'INVALID_RELATIONSHIP',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" has invalid substitute ID "${sub?.id}".`,
          });
          continue;
        }
        if (sub.id === skill.id) {
          errors.push({
            type: 'INVALID_RELATIONSHIP',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" lists itself as a substitute.`,
          });
        }
        if (
          typeof sub.similarity !== 'number' ||
          Number.isNaN(sub.similarity) ||
          sub.similarity <= 0 ||
          sub.similarity > 1
        ) {
          errors.push({
            type: 'INVALID_RELATIONSHIP',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" has invalid substitute similarity ${sub.similarity} for "${sub.id}".`,
          });
        }
        if (!taxonomyById.has(sub.id) && !ontologyById.has(sub.id)) {
          errors.push({
            type: 'UNRESOLVED_TARGET',
            competencyId: skill.id,
            message: `Taxonomy skill "${skill.id}" lists missing substitute target "${sub.id}".`,
          });
        }
      }
    }
  }

  // 6. Detect Circular Parentage in Ontology Hierarchy and Taxonomy Implies
  detectGraphCycles(hierarchyAdjacency, 'ontology hierarchy', errors);
  detectGraphCycles(impliesAdjacency, 'taxonomy implies', errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      ontologyNodeCount: nodes.length,
      taxonomySkillCount: taxonomySkills.length,
      relationshipsChecked,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
  };
}

function detectGraphCycles(
  adjacency: Map<string, string[]>,
  graphLabel: string,
  errors: ValidationError[]
): void {
  const state = new Map<string, 0 | 1 | 2>(); // 0=unvisited, 1=visiting, 2=visited
  const reportedCycles = new Set<string>();

  function dfs(nodeId: string, trace: string[]): void {
    state.set(nodeId, 1);
    const neighbors = adjacency.get(nodeId) || [];
    for (const next of neighbors) {
      const nextState = state.get(next) ?? 0;
      if (nextState === 1) {
        const cycleStart = trace.indexOf(next);
        const cyclePath = [...trace.slice(cycleStart >= 0 ? cycleStart : 0), next];
        const key = [...cyclePath].sort().join('|');
        if (!reportedCycles.has(key)) {
          reportedCycles.add(key);
          errors.push({
            type: 'CIRCULAR_PARENT',
            competencyId: next,
            message: `Circular parentage detected in ${graphLabel}: ${cyclePath.join(' -> ')}.`,
          });
        }
      } else if (nextState === 0 && adjacency.has(next)) {
        dfs(next, [...trace, next]);
      }
    }
    state.set(nodeId, 2);
  }

  for (const nodeId of adjacency.keys()) {
    if ((state.get(nodeId) ?? 0) === 0) {
      dfs(nodeId, [nodeId]);
    }
  }
}

function computeAliasCollisions(skills: TaxonomySkill[]): AliasCollisionRecord[] {
  const byAlias = new Map<string, TaxonomySkill[]>();
  for (const skill of skills) {
    const terms = Array.from(new Set([skill.canonical, ...(skill.aliases || [])].map(t => t.trim().toLowerCase()).filter(Boolean)));
    for (const term of terms) {
      const list = byAlias.get(term) || [];
      list.push(skill);
      byAlias.set(term, list);
    }
  }
  const collisions: AliasCollisionRecord[] = [];
  for (const [alias, list] of byAlias.entries()) {
    if (list.length > 1) {
      const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
      collisions.push({
        alias,
        normalizedAlias: alias,
        primarySkillId: sorted[0].id,
        competingSkillIds: sorted.slice(1).map(s => s.id),
        hasLegacyCompetitor: false,
        resolution: 'precedence_resolved',
      });
    }
  }
  return collisions;
}

/**
 * CLI / CI-callable validation entrypoint.
 * Supports `--strict` to fail on alias collisions as well as structural errors.
 */
export function runOntologyValidationCli(argv: string[] = []): { exitCode: number; report: ValidationReport } {
  const strictAliases = argv.includes('--strict');
  const report = validateCompetencyOntology({ strictAliases });

  console.log(
    `[Ontology Validator] Checked ${report.stats.ontologyNodeCount} ontology nodes, ` +
      `${report.stats.taxonomySkillCount} federated taxonomy skills, ` +
      `${report.stats.relationshipsChecked} relationships.`
  );

  if (report.warnings.length > 0) {
    console.warn(`[Ontology Validator] ${report.warnings.length} advisory warning(s):`);
    for (const w of report.warnings.slice(0, 15)) {
      console.warn(`  - [${w.type}] ${w.competencyId}: ${w.message}`);
    }
    if (report.warnings.length > 15) {
      console.warn(`  ... and ${report.warnings.length - 15} more warnings.`);
    }
  }

  if (!report.isValid) {
    console.error(`[Ontology Validator] FAILED with ${report.errors.length} error(s):`);
    for (const err of report.errors) {
      console.error(`  - [${err.type}] ${err.competencyId}: ${err.message}`);
    }
    return { exitCode: 1, report };
  }

  console.log('[Ontology Validator] PASSED with 0 structural errors.');
  return { exitCode: 0, report };
}

// Browser-safe CLI entrypoint when invoked directly via tsx/node
if (
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  process.argv[1].replace(/\\/g, '/').endsWith('knowledge/ontology/validator.ts')
) {
  const { exitCode } = runOntologyValidationCli(process.argv.slice(2));
  process.exit(exitCode);
}
