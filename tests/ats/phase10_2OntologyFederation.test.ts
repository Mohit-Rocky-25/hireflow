// ============================================================
// Phase 10.2 — Competency Ontology & Taxonomy Federation Regression Suite
// Covers Workstream A (A1–A5) & Section 8 Ontology Adversarial Cases:
// - Non-destructive federation across taxonomy, ontology, and legacy skills.json
// - Registry source-order invariance
// - Conflicting metadata detection & deterministic merge policy
// - Symmetric non-equivalence guards vs asymmetric relationship preservation
// - Alias collision deterministic resolution & polysemy preservation
// - Ontology/taxonomy validator structural error & warning enforcement
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  SKILL_BY_ID,
  ALL_TAXONOMY_SKILLS,
  ALIAS_LOOKUP_MAP,
  AMBIGUOUS_ALIAS_MAP,
  IMPLIES_MAP,
  SUBSTITUTE_GRAPH,
  AMBIGUOUS_SKILLS_SET,
  TAXONOMY_FEDERATION_REPORT,
  federateTaxonomySources,
  resolveSkillByTerm,
  resolveSkillCandidates,
  verifyAmbiguityGuard,
  TaxonomySourceEntry,
} from '@/features/ats/knowledge/taxonomy';
import {
  areNonEquivalent,
  isPermissibleAlternative,
  getRelationshipTargets,
  hasDirectedRelationship,
  buildOntologyIndexes,
  CompetencyNode,
} from '@/features/ats/knowledge/ontology';
import {
  validateCompetencyOntology,
  runOntologyValidationCli,
} from '@/features/ats/knowledge/ontology/validator';

describe('Phase 10.2 — Ontology & Taxonomy Federation Integrity', () => {
  describe('A1: Non-Destructive Federation & Regression on Shared Core Skills', () => {
    it('preserves implies, substitutes, categories, and merged aliases on all previously overwritten skills', () => {
      const python = SKILL_BY_ID.get('python')!;
      expect(python).toBeDefined();
      expect(python.category).toBe('languages');
      expect(python.canonical).toBe('Python');
      expect(python.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['ruby', 'javascript']));
      expect(python.aliases).toEqual(expect.arrayContaining(['Python', 'Python3', 'Python 3', 'CPython', 'PyPy', 'Py']));

      const fastapi = SKILL_BY_ID.get('fastapi')!;
      expect(fastapi.implies).toContain('python');
      expect(fastapi.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['django', 'flask']));
      expect(fastapi.aliases).toEqual(expect.arrayContaining(['FastAPI', 'Fast-API']));

      const restApis = SKILL_BY_ID.get('rest_apis')!;
      expect(restApis.canonical).toBe('RESTful APIs');
      expect(restApis.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['graphql', 'grpc']));
      expect(restApis.aliases).toEqual(expect.arrayContaining(['REST APIs', 'RESTful APIs', 'HTTP APIs', 'API Design']));

      const postgresql = SKILL_BY_ID.get('postgresql')!;
      expect(postgresql.category).toBe('databases');
      expect(postgresql.implies).toContain('sql');
      expect(postgresql.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['mysql', 'oracle_db']));
      expect(postgresql.aliases).toEqual(expect.arrayContaining(['PostgreSQL', 'PGSQL', 'PSQL', 'PostgreSQL 15']));

      const kubernetes = SKILL_BY_ID.get('kubernetes')!;
      expect(kubernetes.category).toBe('cloud_devops');
      expect(kubernetes.implies).toContain('docker');
      expect(kubernetes.aliases).toEqual(expect.arrayContaining(['Kubernetes', 'K8s', 'EKS', 'GKE', 'AKS', 'K9s']));

      const githubActions = SKILL_BY_ID.get('github_actions')!;
      expect(githubActions.implies).toContain('ci_cd');
      expect(githubActions.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['gitlab_ci', 'jenkins']));

      const dbt = SKILL_BY_ID.get('dbt')!;
      expect(dbt.category).toBe('databases');
      expect(dbt.implies).toContain('sql');
      expect(dbt.aliases).toEqual(expect.arrayContaining(['dbt', 'Data Build Tool', 'dbt incremental models']));

      const airflow = SKILL_BY_ID.get('apache_airflow')!;
      expect(airflow.implies).toContain('python');
      expect(airflow.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['prefect', 'dagster']));
      expect(airflow.aliases).toEqual(expect.arrayContaining(['Apache Airflow', 'Airflow', 'Airflow DAGs']));

      const aws = SKILL_BY_ID.get('aws')!;
      expect(aws.category).toBe('cloud_devops');
      expect(aws.substitutes?.map(s => s.id)).toEqual(expect.arrayContaining(['gcp', 'azure']));

      const docker = SKILL_BY_ID.get('docker')!;
      expect(docker.category).toBe('cloud_devops');
      expect(docker.substitutes?.map(s => s.id)).toContain('podman');
    });

    it('keeps IMPLIES_MAP, SUBSTITUTE_GRAPH, AMBIGUOUS_SKILLS_SET, and ALIAS_LOOKUP_MAP consistent with SKILL_BY_ID', () => {
      for (const skill of ALL_TAXONOMY_SKILLS) {
        expect(SKILL_BY_ID.get(skill.id)).toBe(skill);

        if (skill.implies && skill.implies.length > 0) {
          expect(IMPLIES_MAP.get(skill.id)).toEqual(skill.implies);
        } else {
          expect(IMPLIES_MAP.has(skill.id)).toBe(false);
        }

        if (skill.substitutes && skill.substitutes.length > 0) {
          expect(SUBSTITUTE_GRAPH.get(skill.id)).toEqual(skill.substitutes);
        } else {
          expect(SUBSTITUTE_GRAPH.has(skill.id)).toBe(false);
        }

        if (skill.ambiguous) {
          expect(AMBIGUOUS_SKILLS_SET.has(skill.id)).toBe(true);
        }
      }

      expect(IMPLIES_MAP.get('kubernetes')).toContain('docker');
      expect(IMPLIES_MAP.get('fastapi')).toContain('python');
      expect(IMPLIES_MAP.get('dbt')).toContain('sql');
      expect(SUBSTITUTE_GRAPH.get('postgresql')?.some(s => s.id === 'mysql')).toBe(true);
      expect(SUBSTITUTE_GRAPH.get('docker')?.some(s => s.id === 'podman')).toBe(true);
    });

    it('produces identical federated graphs regardless of source order (order invariance)', () => {
      const taxEntry: TaxonomySourceEntry = {
        source: 'taxonomy',
        sourceName: 'backendFrameworks',
        skill: {
          id: 'fastapi',
          canonical: 'FastAPI',
          category: 'backend',
          aliases: ['FastAPI'],
          implies: ['python'],
          substitutes: [{ id: 'flask', similarity: 0.8 }],
          weight: 5,
        },
      };
      const ontEntry: TaxonomySourceEntry = {
        source: 'ontology',
        sourceName: 'domainCompetencies',
        skill: {
          id: 'fastapi',
          canonical: 'FastAPI',
          category: 'backend',
          aliases: ['FastAPI', 'Fast-API'],
          weight: 4,
        },
      };
      const legacyEntry: TaxonomySourceEntry = {
        source: 'legacy',
        sourceName: 'skills.json',
        skill: {
          id: 'fastapi',
          canonical: 'FastAPI Legacy',
          category: 'core_engineering',
          aliases: ['FastAPI', 'FastAPI Async'],
          ambiguous: false,
          weight: 3,
        },
      };
      const pythonEntry: TaxonomySourceEntry = {
        source: 'taxonomy',
        sourceName: 'softwareLanguages',
        skill: {
          id: 'python',
          canonical: 'Python',
          category: 'languages',
          aliases: ['Python', 'Python3'],
          weight: 5,
        },
      };
      const flaskEntry: TaxonomySourceEntry = {
        source: 'taxonomy',
        sourceName: 'backendFrameworks',
        skill: {
          id: 'flask',
          canonical: 'Flask',
          category: 'backend',
          aliases: ['Flask'],
          implies: ['python'],
          weight: 4,
        },
      };

      const order1 = federateTaxonomySources([taxEntry, ontEntry, legacyEntry, pythonEntry, flaskEntry]);
      const order2 = federateTaxonomySources([legacyEntry, ontEntry, flaskEntry, pythonEntry, taxEntry]);
      const order3 = federateTaxonomySources([ontEntry, legacyEntry, taxEntry, pythonEntry, flaskEntry]);

      for (const res of [order1, order2, order3]) {
        const merged = res.skillById.get('fastapi')!;
        expect(merged.canonical).toBe('FastAPI');
        expect(merged.category).toBe('backend');
        expect(merged.weight).toBe(5);
        expect(merged.implies).toEqual(['python']);
        expect(merged.substitutes).toEqual([{ id: 'flask', similarity: 0.8 }]);
        expect(merged.aliases).toEqual(
          expect.arrayContaining(['FastAPI', 'Fast-API', 'FastAPI Legacy', 'FastAPI Async'])
        );
      }

      expect(order1.skills).toEqual(order2.skills);
      expect(order2.skills).toEqual(order3.skills);
      expect(Array.from(order1.impliesMap.entries())).toEqual(Array.from(order2.impliesMap.entries()));
      expect(Array.from(order1.substituteGraph.entries())).toEqual(Array.from(order2.substituteGraph.entries()));
      expect(order1.conflicts).toEqual(order2.conflicts);
    });

    it('detects conflicting metadata across two sources and promotes ambiguity without losing hints', () => {
      const res = federateTaxonomySources([
        {
          source: 'ontology',
          sourceName: 'ontologyA',
          skill: {
            id: 'custom_tool',
            canonical: 'Custom Tool Alpha',
            category: 'backend',
            aliases: ['CTA'],
            ambiguous: false,
            weight: 3,
          },
        },
        {
          source: 'legacy',
          sourceName: 'legacyB',
          skill: {
            id: 'custom_tool',
            canonical: 'Custom Tool Beta',
            category: 'databases',
            aliases: ['CTB'],
            ambiguous: true,
            contextHints: ['in Custom Tool'],
            implies: ['sql'],
            substitutes: [{ id: 'postgres', similarity: 0.7 }],
            weight: 5,
          },
        },
      ]);

      const merged = res.skillById.get('custom_tool')!;
      expect(merged.canonical).toBe('Custom Tool Alpha');
      expect(merged.category).toBe('backend');
      expect(merged.weight).toBe(3);
      expect(merged.ambiguous).toBe(true);
      expect(merged.contextHints).toEqual(['in Custom Tool']);
      expect(merged.implies).toEqual(['sql']);
      expect(merged.substitutes).toEqual([{ id: 'postgres', similarity: 0.7 }]);
      expect(merged.aliases).toEqual(
        expect.arrayContaining(['Custom Tool Alpha', 'CTA', 'Custom Tool Beta', 'CTB'])
      );
      expect(res.conflicts.map(c => c.field)).toEqual(
        expect.arrayContaining(['canonical', 'category', 'weight', 'ambiguous'])
      );
    });
  });

  describe('A2: Alias Collisions, Deterministic Precedence & Polysemy Preservation', () => {
    it('resolves authoritative non-legacy skills over legacy shadow IDs and nested aliases', () => {
      expect(resolveSkillByTerm('Airflow')?.id).toBe('apache_airflow');
      expect(resolveSkillByTerm('Apache Airflow')?.id).toBe('apache_airflow');
      expect(resolveSkillByTerm('EKS')?.id).toBe('kubernetes');
      expect(resolveSkillByTerm('GKE')?.id).toBe('kubernetes');
      expect(resolveSkillByTerm('CloudFormation')?.id).toBe('cloudformation');
      expect(resolveSkillByTerm('API Gateway')?.id).toBe('api_gateway');
      expect(resolveSkillByTerm('BigQuery')?.id).toBe('bigquery');
      expect(resolveSkillByTerm('Snowflake')?.id).toBe('snowflake');
      expect(resolveSkillByTerm('OpenSearch')?.id).toBe('opensearch');
      expect(resolveSkillByTerm('Query Optimization')?.id).toBe('database_query_optimization');
      expect(resolveSkillByTerm('Linux')?.id).toBe('linux_sysadmin');
      expect(resolveSkillByTerm('ETL')?.id).toBe('etl_pipelines');
      expect(resolveSkillByTerm('Accessibility')?.id).toBe('web_accessibility');
      expect(resolveSkillByTerm('RabbitMQ')?.id).toBe('rabbitmq');
      expect(resolveSkillByTerm('Celery')?.id).toBe('celery');
    });

    it('preserves legitimate multi-meaning/polysemous aliases and supports context disambiguation', () => {
      const tsqlCandidates = resolveSkillCandidates('T-SQL');
      expect(tsqlCandidates.map(c => c.id)).toEqual(expect.arrayContaining(['plsql', 'sql_server']));
      expect(AMBIGUOUS_ALIAS_MAP.has('t-sql')).toBe(true);

      const eksCandidates = resolveSkillCandidates('EKS');
      expect(eksCandidates.map(c => c.id)).toEqual(expect.arrayContaining(['kubernetes', 'aws']));

      // Context-aware disambiguation using polysemous candidates
      const disambiguated = federateTaxonomySources([
        {
          source: 'taxonomy',
          sourceName: 'a',
          skill: {
            id: 'spark_stream',
            canonical: 'Spark Streaming',
            category: 'data_ml',
            aliases: ['Spark', 'Streaming Engine'],
            contextHints: ['PySpark', 'Spark SQL'],
            weight: 4,
          },
        },
        {
          source: 'taxonomy',
          sourceName: 'b',
          skill: {
            id: 'spark_design',
            canonical: 'Adobe Spark',
            category: 'frontend',
            aliases: ['Spark'],
            contextHints: ['Adobe', 'Creative Cloud'],
            weight: 4,
          },
        },
      ]);
      expect(disambiguated.ambiguousAliasMap.get('spark')?.map(s => s.id)).toEqual([
        'spark_design',
        'spark_stream',
      ]);
      expect(TAXONOMY_FEDERATION_REPORT.aliasCollisions.length).toBeGreaterThan(0);
    });

    it('enforces ambiguity guards without false positives on prose', () => {
      const goSkill = SKILL_BY_ID.get('go')!;
      const rustSkill = SKILL_BY_ID.get('rust')!;
      const cSkill = SKILL_BY_ID.get('c')!;

      expect(verifyAmbiguityGuard(goSkill, 'We are ready to go live tomorrow')).toBe(false);
      expect(verifyAmbiguityGuard(goSkill, 'Built backend microservices in Go and Docker')).toBe(true);
      expect(verifyAmbiguityGuard(rustSkill, 'Inspected surface rust on pipeline')).toBe(false);
      expect(verifyAmbiguityGuard(rustSkill, 'Systems programming in Rust using Cargo')).toBe(true);
      expect(verifyAmbiguityGuard(cSkill, 'Rich in Vitamin C supplements')).toBe(false);
      expect(verifyAmbiguityGuard(cSkill, 'Embedded systems firmware in C/C++')).toBe(true);
    });
  });

  describe('A3: Symmetric Non-Equivalence Guards & Asymmetric Relationship Semantics', () => {
    it('enforces symmetry for all non-equivalence pairs regardless of query direction', () => {
      expect(areNonEquivalent('docker', 'kubernetes')).toBe(true);
      expect(areNonEquivalent('kubernetes', 'docker')).toBe(true);

      expect(areNonEquivalent('rabbitmq', 'kafka')).toBe(true);
      expect(areNonEquivalent('kafka', 'rabbitmq')).toBe(true);

      expect(areNonEquivalent('database_query_optimization', 'database_sharding')).toBe(true);
      expect(areNonEquivalent('database_sharding', 'database_query_optimization')).toBe(true);

      // Previously unidirectional edge: snowflake -> database_sharding
      expect(areNonEquivalent('snowflake', 'database_sharding')).toBe(true);
      expect(areNonEquivalent('database_sharding', 'snowflake')).toBe(true);

      expect(areNonEquivalent('docker', 'docker')).toBe(false);
      expect(areNonEquivalent('python', 'fastapi')).toBe(false);
    });

    it('makes synthetic unidirectional NOT_EQUIVALENT_TO and DOES_NOT_PROVE symmetric in buildOntologyIndexes', () => {
      const syntheticNodes: CompetencyNode[] = [
        {
          id: 'node_a',
          canonical: 'Node A',
          definition: 'Test node A',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Node A'],
          relationships: [
            { type: 'DOES_NOT_PROVE', targetId: 'node_b' },
            { type: 'DEPENDS_ON', targetId: 'node_c' },
          ],
          version: '1.0.0',
        },
        {
          id: 'node_b',
          canonical: 'Node B',
          definition: 'Test node B',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Node B'],
          relationships: [],
          version: '1.0.0',
        },
        {
          id: 'node_c',
          canonical: 'Node C',
          definition: 'Test node C',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Node C'],
          relationships: [],
          version: '1.0.0',
        },
      ];

      const idx = buildOntologyIndexes(syntheticNodes);
      expect(idx.nonEquivalenceGuards.get('node_a')?.has('node_b')).toBe(true);
      expect(idx.nonEquivalenceGuards.get('node_b')?.has('node_a')).toBe(true);
      expect(idx.relationshipsBySource.get('node_a')?.get('DEPENDS_ON')).toEqual(['node_c']);
      expect(idx.relationshipsBySource.get('node_c')?.get('DEPENDS_ON')).toBeUndefined();
    });

    it('preserves asymmetric semantics for DEPENDS_ON, IMPLEMENTS, SUPPORTS, and SUBCATEGORY_OF', () => {
      expect(hasDirectedRelationship('fastapi', 'DEPENDS_ON', 'python')).toBe(true);
      expect(hasDirectedRelationship('python', 'DEPENDS_ON', 'fastapi')).toBe(false);

      expect(hasDirectedRelationship('fastapi', 'IMPLEMENTS', 'rest_apis')).toBe(true);
      expect(hasDirectedRelationship('rest_apis', 'IMPLEMENTS', 'fastapi')).toBe(false);

      expect(hasDirectedRelationship('github_actions', 'IMPLEMENTS', 'ci_cd')).toBe(true);
      expect(hasDirectedRelationship('ci_cd', 'IMPLEMENTS', 'github_actions')).toBe(false);

      expect(hasDirectedRelationship('docker', 'SUPPORTS', 'kubernetes')).toBe(true);
      expect(hasDirectedRelationship('kubernetes', 'SUPPORTS', 'docker')).toBe(false);

      expect(hasDirectedRelationship('jwt_rbac', 'SUBCATEGORY_OF', 'cybersecurity')).toBe(true);
      expect(hasDirectedRelationship('cybersecurity', 'SUBCATEGORY_OF', 'jwt_rbac')).toBe(false);

      expect(getRelationshipTargets('dbt', 'DEPENDS_ON')).toEqual(['sql']);
      expect(isPermissibleAlternative('apache_airflow', 'prefect')).toBe(true);
      expect(isPermissibleAlternative('prefect', 'apache_airflow')).toBe(true);
    });
  });

  describe('A4: Ontology & Federated Taxonomy Validator', () => {
    it('passes production validation with 0 structural errors while surfacing advisory warnings', () => {
      const report = validateCompetencyOntology();
      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
      expect(report.stats.ontologyNodeCount).toBeGreaterThanOrEqual(33);
      expect(report.stats.taxonomySkillCount).toBeGreaterThanOrEqual(300);
      expect(report.warnings.length).toBeGreaterThan(0);

      const cli = runOntologyValidationCli([]);
      expect(cli.exitCode).toBe(0);
    });

    it('reports UNRESOLVED_TARGET when target is missing from both ontology and taxonomy', () => {
      const badNodes: CompetencyNode[] = [
        {
          id: 'service_x',
          canonical: 'Service X',
          definition: 'Test',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Service X'],
          relationships: [
            { type: 'ALTERNATIVE_TO', targetId: 'mysql' }, // Exists in taxonomy -> VALID
            { type: 'DEPENDS_ON', targetId: 'ghost_dependency' }, // Missing everywhere -> ERROR
          ],
          version: '1.0.0',
        },
      ];

      const report = validateCompetencyOntology({
        nodes: badNodes,
        taxonomySkills: ALL_TAXONOMY_SKILLS,
      });
      expect(report.isValid).toBe(false);
      expect(report.errors.some(e => e.type === 'UNRESOLVED_TARGET' && e.message.includes('ghost_dependency'))).toBe(true);
      expect(report.errors.some(e => e.message.includes('mysql'))).toBe(false);
    });

    it('detects DUPLICATE_ID, INVALID_ID, CIRCULAR_PARENT, CONFLICTING_GUARD, INVALID_RELATIONSHIP, and DUPLICATE_ALIAS', () => {
      const brokenNodes: CompetencyNode[] = [
        {
          id: 'node_one',
          canonical: 'Node One',
          definition: 'One',
          domain: 'software_engineering',
          category: 'backend',
          parentCompetencyId: 'node_two',
          aliases: ['Shared Alias'],
          relationships: [
            { type: 'ALTERNATIVE_TO', targetId: 'node_two' },
            { type: 'NOT_EQUIVALENT_TO', targetId: 'node_two' },
            { type: 'SUPPORTS', targetId: 'node_one' }, // self-loop
          ],
          version: '1.0.0',
        },
        {
          id: 'node_two',
          canonical: 'Node Two',
          definition: 'Two',
          domain: 'software_engineering',
          category: 'backend',
          parentCompetencyId: 'node_one', // circular parentage!
          aliases: ['Shared Alias'], // non-ambiguous duplicate alias!
          relationships: [],
          version: '1.0.0',
        },
        {
          id: 'node_two', // duplicate ID!
          canonical: 'Node Two Duplicate',
          definition: 'Two dupe',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Unique Two'],
          relationships: [],
          version: '1.0.0',
        },
        {
          id: 'Bad-Id!',
          canonical: '',
          definition: 'Bad',
          domain: 'software_engineering',
          category: 'backend',
          aliases: ['Bad'],
          relationships: [{ type: 'DEPENDS_ON', targetId: 'node_one', confidence: 1.5 }],
          version: '1.0.0',
        },
      ];

      const brokenTaxonomy = [
        {
          id: 'skill_a',
          canonical: 'Skill A',
          category: 'backend' as const,
          aliases: ['Skill A'],
          implies: ['skill_b'],
          substitutes: [{ id: 'missing_sub', similarity: 1.5 }],
        },
        {
          id: 'skill_b',
          canonical: 'Skill B',
          category: 'backend' as const,
          aliases: ['Skill B'],
          implies: ['skill_a'], // circular implies!
        },
      ];

      const report = validateCompetencyOntology({
        nodes: brokenNodes,
        taxonomySkills: brokenTaxonomy,
      });

      expect(report.isValid).toBe(false);
      const types = new Set(report.errors.map(e => e.type));
      expect(types.has('DUPLICATE_ID')).toBe(true);
      expect(types.has('INVALID_ID')).toBe(true);
      expect(types.has('CIRCULAR_PARENT')).toBe(true);
      expect(types.has('CONFLICTING_GUARD')).toBe(true);
      expect(types.has('INVALID_RELATIONSHIP')).toBe(true);
      expect(types.has('DUPLICATE_ALIAS')).toBe(true);
      expect(types.has('UNRESOLVED_TARGET')).toBe(true);
    });

    it('detects non-existent alias targets in ALIAS_LOOKUP_MAP', () => {
      const badAliasMap = new Map(ALIAS_LOOKUP_MAP);
      badAliasMap.set('dangling_alias', {
        id: 'non_existent_skill',
        canonical: 'Ghost Skill',
        category: 'backend',
        aliases: ['Ghost'],
      });

      const report = validateCompetencyOntology({
        nodes: [],
        taxonomySkills: ALL_TAXONOMY_SKILLS,
        aliasLookupMap: badAliasMap,
      });

      expect(report.isValid).toBe(false);
      expect(
        report.errors.some(
          e => e.type === 'UNRESOLVED_TARGET' && e.message.includes('dangling_alias')
        )
      ).toBe(true);
    });
  });
});
