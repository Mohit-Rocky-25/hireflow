// ============================================================
// ATS Resume Roaster — Structured Competency Ontology Types (Phase 03)
// Canonical definitions, relationship semantics, evidence indicators,
// and limitations across all engineering and professional domains.
// ============================================================

export type DomainId =
  | 'software_engineering'
  | 'data_engineering'
  | 'cloud_devops'
  | 'ai_ml'
  | 'cybersecurity'
  | 'database_platform'
  | 'qa_testing'
  | 'product_business'
  | 'finance_quant'
  | 'research_academic';

export type CompetencyCategory =
  | 'programming_languages'
  | 'backend'
  | 'frontend'
  | 'databases'
  | 'data_orchestration'
  | 'data_storage'
  | 'data_governance'
  | 'cloud_infrastructure'
  | 'containerization'
  | 'ci_cd'
  | 'observability'
  | 'ml_frameworks'
  | 'llm_generative_ai'
  | 'security_identity'
  | 'testing_qa'
  | 'architecture_systems'
  | 'product_management'
  | 'finance_risk'
  | 'research_methods';

/**
 * Explicit relationship types distinguishing terminology, hierarchy,
 * technical dependencies, alternatives, and non-equivalence.
 */
export type RelationshipType =
  // Exact terminology relationships (Same canonical concept)
  | 'ALIAS_OF'
  | 'SYNONYM_OF'
  | 'ABBREVIATION_OF'
  | 'VARIANT_OF'
  // Hierarchy relationships (Specialization/generalization)
  | 'SUBCATEGORY_OF'
  | 'CHILD_OF'
  | 'PART_OF'
  // Technical relationships (Context-dependent support)
  | 'RELATED_TO'
  | 'SUPPORTS'
  | 'IMPLEMENTS'
  | 'DEPENDS_ON'
  | 'PREREQUISITE_OF'
  // Alternatives (For logical OR satisfaction)
  | 'ALTERNATIVE_TO'
  | 'ONE_OF'
  // Compound constraints
  | 'REQUIRES_BOTH'
  | 'REQUIRES_ANY'
  // Non-equivalence guards (Explicit boundaries)
  | 'NOT_EQUIVALENT_TO'
  | 'DOES_NOT_PROVE';

export interface CompetencyRelationship {
  type: RelationshipType;
  targetId: string;
  context?: string;
  confidence?: number; // 0.1 to 1.0
  explanation?: string;
}

export interface EvidenceIndicator {
  type: 'action' | 'artifact' | 'metric' | 'architecture';
  phrase: string;
  strength: 'strong' | 'moderate' | 'weak';
  exampleSnippet?: string;
}

export interface EvidenceLimitation {
  limitationType:
    | 'listed_only'
    | 'coursework_only'
    | 'personal_project'
    | 'prototype_only'
    | 'migrated_away'
    | 'insufficient_depth';
  ruleDescription: string;
  capProficiency?: number;
}

export interface CompetencyNode {
  id: string; // Stable unique ID: e.g. "database.postgresql", "devops.cicd"
  canonical: string; // e.g. "PostgreSQL", "CI/CD Pipelines"
  definition: string;
  domain: DomainId;
  category: CompetencyCategory;
  parentCompetencyId?: string;
  aliases: string[];
  abbreviations?: string[];
  relationships: CompetencyRelationship[];
  evidenceIndicators?: EvidenceIndicator[];
  evidenceLimitations?: EvidenceLimitation[];
  ambiguous?: boolean;
  contextHints?: string[];
  weight?: number; // 1 to 5 default importance
  version: string;
}
