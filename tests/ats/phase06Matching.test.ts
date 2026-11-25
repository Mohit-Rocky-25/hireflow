// ============================================================
// ATS Resume Roaster — Phase 06 Context-Aware Competency Matching Suite
// Verifies Decisions A, B, C, D, strict non-equivalence, compound AND/OR logic,
// adversarial cases A-L, Benchmark A (PayGrid), and Benchmark B (Northstar).
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '../../src/features/ats/engine';
import {
  parseLogicalRequirement,
  evaluateLogicalExpression,
} from '../../src/features/ats/engine/logicalExpression';
import {
  evaluateSingleCompetency,
  matchRequirementsWithContext,
} from '../../src/features/ats/engine/competencyMatcher';
import {
  CandidateEvidenceRecord,
  StructuredCandidateProfile,
} from '../../src/features/ats/engine/evidenceModel';
import { JdRequirement } from '../../src/features/ats/engine/types';

// ============================================================
// IMMUTABLE BENCHMARK FIXTURES
// ============================================================

const BENCHMARK_A_RESUME = `
Rohan Deshmukh
rohan.deshmukh@example.com | +91 98765 43210 | Bangalore, India
linkedin.com/in/rohandeshmukh | github.com/rohandeshmukh

PROFESSIONAL SUMMARY
Backend Software Engineer with 4+ years of experience designing and scaling distributed payment systems.

EXPERIENCE
Senior Backend Engineer | PayTech Solutions | 2021 - Present
- Architected core payment orchestration service using Python and FastAPI handling 15,000+ RPS with 45ms p99 latency across 120k daily requests.
- Implemented PostgreSQL composite B-tree indexes and optimized query plans using EXPLAIN ANALYZE, cutting query response times by 68% and p95 latency from 640ms to 185ms.
- Integrated Redis read-through caching layer with cache stampede mitigation, decreasing database read load by 55%.
- Built asynchronous webhook delivery engine with Celery, RabbitMQ, and exponential backoff retry with dead-letter queue, improving notification success from 91.2% to 99.4%.
- Implemented JWT authentication with RBAC and HMAC-SHA256 request signatures for 24 partner banking REST endpoints.
- Authored 140+ Pytest unit and integration test suite achieving 86% branch coverage in GitHub Actions CI/CD pipeline.
- Provisioned Docker containers deployed onto AWS EC2, RDS PostgreSQL, and S3 using Terraform.
- Monitored system health and request rates using Prometheus metrics.

PROJECTS
RateShield — Redis Lua Rate Limiter | 2023
- Designed high-throughput sliding window rate limiter in Redis Lua handling 4,200 requests per second benchmark.

LedgerLite — Double-Entry Transaction Ledger | 2022
- Implemented transactional double-entry ledger with ACID invariants, PostgreSQL row-level locks, and idempotency keys.

SKILLS
Languages: Python, SQL, Bash
Frameworks & Tools: FastAPI, PostgreSQL, Redis, Celery, RabbitMQ, Docker, GitHub Actions, AWS (EC2, RDS, S3), Pytest, Prometheus
`;

const BENCHMARK_A_JD = `
Backend Software Engineer — Payments Core (Python)
Company: PayGrid Systems
Location: Bangalore, India

About the Role:
At PayGrid Systems, we are building next-generation real-time payment infrastructure.

Requirements:
- Strong proficiency in Python and modern frameworks such as FastAPI
- Deep relational database experience with PostgreSQL, including indexing and query optimization
- Experience with Redis caching and asynchronous messaging (Celery, RabbitMQ)
- Hands-on experience with automated testing (Pytest) and CI/CD pipelines
- Cloud infrastructure exposure with AWS and Docker containers
`;

const BENCHMARK_B_RESUME = `
Ananya Rao
ananya.rao@example.com | +91 91234 56789 | Hyderabad, India
linkedin.com/in/ananyarao | github.com/ananyarao

SUMMARY
Data Engineer with 2+ years of experience building reliable batch and streaming data pipelines.

EXPERIENCE
Data Engineer | DataFlow Analytics | 2022 - Present
- Developed and maintained 35+ production Airflow DAGs processing over 18 million records daily across AWS S3 and Snowflake data lakehouse.
- Re-architected dbt incremental models, reducing daily pipeline runtime from 94 minutes to 31 minutes.
- Implemented Great Expectations data-quality validation suites and automated data contracts, decreasing data incidents from 14 to 5 per month.
- Established end-to-end data lineage tracking across 50+ data warehouse tables.

Data Engineering Intern | CloudScale Labs | 2021 - 2022
- Assisted in building ETL scripts using Python and SQL to ingest customer clickstream data into BigQuery, processing 600,000 rows per day.

PROJECTS
StreamWatch Kafka Prototype | 2023
- Built personal prototype streaming consumer using Apache Kafka and Python with 3 Kafka topics, 2 consumer groups, offset commits, replay, dead-letter queue, and consumer lag monitoring.

SKILLS
Languages: Python, SQL
Tools & Platforms: Apache Airflow, dbt, Snowflake, AWS S3, Great Expectations, Docker, Git, Spark
Coursework: BigQuery, Apache Spark basics, Distributed Systems
`;

const BENCHMARK_B_JD = `
Data Engineer — Risk & Decisioning
Company: Northstar Credit
Location: Hyderabad, India

About the Role:
At Northstar Credit, we are building intelligent automated decisioning platforms.

Requirements:
- Strong data pipeline engineering with Apache Airflow or Prefect
- Experience with dbt AND (Spark OR Flink)
- Cloud data warehousing with Snowflake or BigQuery
- Data quality assurance with automated test suites
- 3+ years of professional data engineering experience
`;

// ============================================================
// TEST SUITE
// ============================================================

describe('HireFlow ATS Resume Roaster — Phase 06 Competency Matching & Semantic Interpretation', () => {

  describe('1. AST Compound Requirement Parsing & Evaluation (Section 10)', () => {
    it('parses "Airflow OR Prefect" into an OR LogicalExpression', () => {
      const ast = parseLogicalRequirement('Airflow OR Prefect');
      expect(ast).toBeDefined();
      expect(ast?.operator).toBe('OR');
      expect(ast?.operands?.length).toBe(2);
      expect(ast?.operands?.[0].skillId).toBe('apache_airflow');
      expect(ast?.operands?.[1].skillId).toBe('prefect');
    });

    it('parses "dbt AND (Spark OR Flink)" into nested AND-OR AST', () => {
      const ast = parseLogicalRequirement('dbt AND (Spark OR Flink)');
      expect(ast).toBeDefined();
      expect(ast?.operator).toBe('AND');
      expect(ast?.operands?.length).toBe(2);

      const left = ast?.operands?.[0];
      expect(left?.operator).toBe('LEAF');
      expect(left?.skillId).toBe('dbt');

      const right = ast?.operands?.[1];
      expect(right?.operator).toBe('OR');
      expect(right?.operands?.length).toBe(2);
      expect(right?.operands?.[0].skillId).toBe('apache_spark');
      expect(right?.operands?.[1].skillId).toBe('apache_flink');
    });

    it('evaluates "Airflow OR Prefect" with Airflow present as SATISFIED', () => {
      const ast = parseLogicalRequirement('Airflow OR Prefect')!;
      const res = evaluateLogicalExpression(ast, (skillId) => {
        if (skillId === 'apache_airflow') {
          return { satisfied: true, status: 'SATISFIED', reason: 'Production Airflow verified' };
        }
        return { satisfied: false, status: 'NOT_DEMONSTRATED', reason: 'Prefect not found' };
      });

      expect(res.satisfied).toBe(true);
      expect(res.status).toBe('SATISFIED');
      expect(res.explanation).toContain('Airflow');
    });

    it('evaluates "dbt AND (Spark OR Flink)" where dbt is verified but Spark/Flink lack production evidence as PARTIALLY_SATISFIED', () => {
      const ast = parseLogicalRequirement('dbt AND (Spark OR Flink)')!;
      const res = evaluateLogicalExpression(ast, (skillId) => {
        if (skillId === 'dbt') {
          return { satisfied: true, status: 'SATISFIED', reason: 'dbt incremental models verified' };
        }
        if (skillId === 'apache_spark') {
          return { satisfied: false, status: 'PARTIALLY_SATISFIED', reason: 'Spark listed in skills only' };
        }
        return { satisfied: false, status: 'NOT_DEMONSTRATED', reason: 'Flink not found' };
      });

      expect(res.satisfied).toBe(false);
      expect(res.status).toBe('PARTIALLY_SATISFIED');
      expect(res.explanation).toContain('Satisfied: [dbt');
      expect(res.explanation).toContain('Missing/insufficient:');
    });
  });

  describe('2. Four-Decision Evaluation & Strict Non-Equivalence (Decisions A, B, C, D)', () => {
    it('Decision A & B: Semantic indicator matches EXPLAIN ANALYZE to database_query_optimization without exact phrase', () => {
      const ev: CandidateEvidenceRecord = {
        id: 'ev_1',
        originalText: 'Implemented PostgreSQL composite B-tree indexes and optimized query plans using EXPLAIN ANALYZE, cutting query response times by 68%.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['postgresql', 'database_query_optimization'],
        matchedTerminology: ['PostgreSQL', 'EXPLAIN ANALYZE', 'composite B-tree'],
        metricsReferences: ['68%'],
        hasMetric: true,
        evidenceStrength: 'strong',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: 100, lineStart: 1, lineEnd: 1 },
      };

      const dummyProfile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Rohan Deshmukh',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [ev],
        competencyEvidenceMap: { database_query_optimization: [ev] },
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const req: JdRequirement = {
        skillId: 'database_query_optimization',
        canonical: 'Database Query Optimization',
        category: 'databases',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(req, dummyProfile);
      expect(res.status).toBe('SATISFIED');
      expect(res.matchMethod).toBe('ALIAS');
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('Decision B: Docker does NOT prove Kubernetes (RELATED_BUT_NOT_EQUIVALENT)', () => {
      const evDocker: CandidateEvidenceRecord = {
        id: 'ev_doc',
        originalText: 'Provisioned Docker containers deployed onto AWS EC2.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['docker'],
        matchedTerminology: ['Docker'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: 50, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evDocker],
        competencyEvidenceMap: { docker: [evDocker] },
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const reqK8s: JdRequirement = {
        skillId: 'kubernetes',
        canonical: 'Kubernetes',
        category: 'containerization',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(reqK8s, profile);
      expect(res.status).toBe('RELATED_BUT_NOT_EQUIVALENT');
      expect(res.limitations[0]).toContain('does NOT prove or substitute for "Kubernetes"');
    });

    it('Decision B: RabbitMQ does NOT prove Kafka (RELATED_BUT_NOT_EQUIVALENT)', () => {
      const evRabbit: CandidateEvidenceRecord = {
        id: 'ev_rab',
        originalText: 'Built asynchronous webhook delivery engine with RabbitMQ and Celery.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['rabbitmq', 'celery'],
        matchedTerminology: ['RabbitMQ', 'Celery'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evRabbit],
        competencyEvidenceMap: { rabbitmq: [evRabbit] },
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const reqKafka: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(reqKafka, profile);
      expect(res.status).toBe('RELATED_BUT_NOT_EQUIVALENT');
      expect(res.explanation).toContain('non-equivalent');
    });

    it('Decision C & D: Personal Project prototype yields PARTIALLY_SATISFIED for production requirement', () => {
      const evKafkaProto: CandidateEvidenceRecord = {
        id: 'ev_kproto',
        originalText: 'StreamWatch Kafka Prototype — Built personal event stream simulator.',
        sourceSection: 'projects',
        sourceType: 'PERSONAL_PROJECT',
        environmentMaturity: 'PROTOTYPE',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kafka'],
        matchedTerminology: ['Kafka'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Ananya Rao',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evKafkaProto],
        competencyEvidenceMap: { kafka: [evKafkaProto] },
        provenanceCounts: { professional: 0, internship: 0, personalProject: 1, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const reqProdKafka: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(reqProdKafka, profile);
      expect(res.status).toBe('PARTIALLY_SATISFIED');
      expect(res.limitations[0]).toContain('personal prototype');
    });
  });

  describe('3. Adversarial Cases A through L (Section 17)', () => {
    it('Case A: Exact keyword in skills list only yields PARTIALLY_SATISFIED (claimed only), not production satisfied', () => {
      const evSkills: CandidateEvidenceRecord = {
        id: 'ev_sk',
        originalText: 'Skills: Kubernetes, Docker, Python',
        sourceSection: 'skills',
        sourceType: 'SKILLS_SECTION',
        environmentMaturity: 'UNKNOWN',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kubernetes'],
        matchedTerminology: ['Kubernetes'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.6,
        locator: { charStart: 0, charEnd: 30, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evSkills],
        competencyEvidenceMap: { kubernetes: [evSkills] },
        provenanceCounts: { professional: 0, internship: 0, personalProject: 0, coursework: 0, skillsList: 1, other: 0 },
        version: '4.0.0',
      };

      const req: JdRequirement = {
        skillId: 'kubernetes',
        canonical: 'Kubernetes',
        category: 'containerization',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(req, profile);
      expect(res.status).toBe('PARTIALLY_SATISFIED');
      expect(res.limitations[0]).toContain('skills inventory without contextual deliverables');
    });

    it('Case G: Negative usage ("Evaluated Kafka but selected RabbitMQ") yields CONTRADICTED', () => {
      const evNeg: CandidateEvidenceRecord = {
        id: 'ev_neg',
        originalText: 'Evaluated Kafka but selected RabbitMQ for the final implementation due to lower cluster overhead.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'PARTIALLY_SUPPORTED',
        negationSentiment: 'EVALUATION_ONLY',
        isNegated: true,
        competencyIds: ['kafka', 'rabbitmq'],
        matchedTerminology: ['Kafka', 'RabbitMQ'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: 80, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evNeg],
        competencyEvidenceMap: { kafka: [evNeg] },
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const req: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };

      const res = evaluateSingleCompetency(req, profile);
      expect(res.status).toBe('CONTRADICTED');
    });

    it('Case J: Generic description ("Worked with clean and reliable datasets") does NOT prove Data Governance', () => {
      const evGeneric: CandidateEvidenceRecord = {
        id: 'ev_gen',
        originalText: 'Worked with clean and reliable datasets across team workflows.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'OPERATIONAL_RESPONSIBILITY',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: [], // Generic phrase matches no specific technical ontology node
        matchedTerminology: [],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.4,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evGeneric],
        competencyEvidenceMap: {},
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const req: JdRequirement = {
        skillId: 'data_governance',
        canonical: 'Data Governance',
        category: 'data_governance',
        required: 'must',
        weight: 4,
      };

      const res = evaluateSingleCompetency(req, profile);
      expect(res.status).toBe('NOT_DEMONSTRATED');
    });

    it('Case F: Project-level requirement is SATISFIED by personal project prototype, while production requirement is PARTIALLY_SATISFIED', () => {
      const evKafkaProto: CandidateEvidenceRecord = {
        id: 'ev_proto_k',
        originalText: 'StreamWatch Kafka Prototype — Built personal event stream simulator in Kafka.',
        sourceSection: 'projects',
        sourceType: 'PERSONAL_PROJECT',
        environmentMaturity: 'PROTOTYPE',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kafka'],
        matchedTerminology: ['Kafka'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evKafkaProto],
        competencyEvidenceMap: { kafka: [evKafkaProto] },
        provenanceCounts: { professional: 0, internship: 0, personalProject: 1, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      // 1. Nice-to-have / project requirement
      const reqProject: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'nice',
        weight: 3,
      };
      const resProject = evaluateSingleCompetency(reqProject, profile);
      expect(resProject.status).toBe('SATISFIED');

      // 2. Must-have enterprise production requirement
      const reqProd: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };
      const resProd = evaluateSingleCompetency(reqProd, profile);
      expect(resProd.status).toBe('PARTIALLY_SATISFIED');
      expect(resProd.limitations[0]).toContain('personal prototype');
    });

    it('Case H: Transferable asynchronous processing (Celery/RabbitMQ) does NOT award false Kafka streaming credit', () => {
      const evCelery: CandidateEvidenceRecord = {
        id: 'ev_cel',
        originalText: 'Built asynchronous webhook delivery engine with Celery and RabbitMQ workers.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['celery', 'rabbitmq'],
        matchedTerminology: ['Celery', 'RabbitMQ'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'strong',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evCelery],
        competencyEvidenceMap: { celery: [evCelery], rabbitmq: [evCelery] },
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const reqKafka: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };
      const resKafka = evaluateSingleCompetency(reqKafka, profile);
      expect(resKafka.status).toBe('RELATED_BUT_NOT_EQUIVALENT');
    });

    it('Case K: Leadership requirement ("Led architecture design") is NOT satisfied by assistance statement', () => {
      const evAssist: CandidateEvidenceRecord = {
        id: 'ev_asst',
        originalText: 'Assisted with service deployment and deployment verification checklists.',
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'OPERATIONAL_RESPONSIBILITY',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: [],
        matchedTerminology: ['deployment'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.7,
        locator: { charStart: 0, charEnd: 60, lineStart: 1, lineEnd: 1 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evAssist],
        competencyEvidenceMap: {},
        provenanceCounts: { professional: 1, internship: 0, personalProject: 0, coursework: 0, skillsList: 0, other: 0 },
        version: '4.0.0',
      };

      const reqArch: JdRequirement = {
        skillId: 'system_architecture',
        canonical: 'Led Distributed System Architecture',
        category: 'architecture_systems',
        required: 'must',
        weight: 5,
      };
      const res = evaluateSingleCompetency(reqArch, profile);
      expect(res.status).toBe('NOT_DEMONSTRATED');
    });

    it('Case L: Repeated keyword stuffing does not multiply candidate competency demonstrations', () => {
      const evStuffed1: CandidateEvidenceRecord = {
        id: 'ev_st1',
        originalText: 'Kubernetes, Docker, Python',
        sourceSection: 'skills',
        sourceType: 'SKILLS_SECTION',
        environmentMaturity: 'UNKNOWN',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kubernetes'],
        matchedTerminology: ['Kubernetes'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.5,
        locator: { charStart: 0, charEnd: 25, lineStart: 1, lineEnd: 1 },
      };
      const evStuffed2: CandidateEvidenceRecord = {
        id: 'ev_st2',
        originalText: 'Kubernetes environment setup',
        sourceSection: 'skills',
        sourceType: 'SKILLS_SECTION',
        environmentMaturity: 'UNKNOWN',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kubernetes'],
        matchedTerminology: ['Kubernetes'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.5,
        locator: { charStart: 30, charEnd: 60, lineStart: 2, lineEnd: 2 },
      };

      const profile: StructuredCandidateProfile = {
        scanId: 's1',
        candidateName: 'Candidate',
        employment: [],
        projects: [],
        education: [],
        allEvidenceRecords: [evStuffed1, evStuffed2],
        competencyEvidenceMap: { kubernetes: [evStuffed1, evStuffed2] },
        provenanceCounts: { professional: 0, internship: 0, personalProject: 0, coursework: 0, skillsList: 2, other: 0 },
        version: '4.0.0',
      };

      const req: JdRequirement = {
        skillId: 'kubernetes',
        canonical: 'Kubernetes',
        category: 'containerization',
        required: 'must',
        weight: 5,
      };
      const res = evaluateSingleCompetency(req, profile);
      // Both are skills list only; status must remain PARTIALLY_SATISFIED (or claimed only), not elevated to SATISFIED
      expect(res.status).toBe('PARTIALLY_SATISFIED');
      expect(res.limitations[0]).toContain('skills inventory without contextual deliverables');
    });
  });

  describe('4. Benchmark A — PayGrid Systems (Rohan Deshmukh)', () => {
    it('verifies genuine competencies with zero false positives or unearned sharding/Kubernetes credit', () => {
      const response = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const results = response.result.skillResults;
      expect(results.length).toBeGreaterThanOrEqual(5);

      // 1. Python & FastAPI
      const fastapi = results.find(s => s.skillId === 'fastapi');
      expect(fastapi).toBeDefined();
      expect(fastapi!.status).toBe('verified');

      // 2. PostgreSQL Query Optimization (matched via EXPLAIN ANALYZE & composite B-tree)
      const dbOpt = results.find(s => s.skillId === 'database_query_optimization' || s.canonical.includes('Optimization') || s.canonical.includes('PostgreSQL'));
      expect(dbOpt).toBeDefined();
      expect(dbOpt!.found).toBe(true);

      // 3. Celery / RabbitMQ / Redis
      const redis = results.find(s => s.skillId === 'redis');
      expect(redis).toBeDefined();
      expect(redis!.status).toBe('verified');

      // 4. Pytest
      const pytest = results.find(s => s.skillId === 'pytest');
      expect(pytest).toBeDefined();
      expect(pytest!.status).toBe('verified');

      // 5. CI/CD
      const cicd = results.find(s => s.skillId === 'ci_cd' || s.canonical.includes('CI/CD'));
      expect(cicd).toBeDefined();
      expect(cicd!.status).toBe('verified');

      // 6. Verify Docker does NOT satisfy Kubernetes
      const k8sReq: JdRequirement = {
        skillId: 'kubernetes',
        canonical: 'Kubernetes',
        category: 'containerization',
        required: 'must',
        weight: 5,
      };
      const k8sMatch = evaluateSingleCompetency(k8sReq, response.result.structuredProfile!);
      expect(k8sMatch.status).toBe('RELATED_BUT_NOT_EQUIVALENT');

      // 7. Verify single-node EXPLAIN ANALYZE does NOT satisfy database sharding
      const shardingReq: JdRequirement = {
        skillId: 'database_sharding',
        canonical: 'Database Sharding & Partitioning',
        category: 'databases',
        required: 'must',
        weight: 5,
      };
      const shardingMatch = evaluateSingleCompetency(shardingReq, response.result.structuredProfile!);
      expect(shardingMatch.status).toBe('RELATED_BUT_NOT_EQUIVALENT');
    });
  });

  describe('5. Benchmark B — Northstar Credit (Ananya Rao)', () => {
    it('evaluates Airflow OR Prefect (SATISFIED) and bounds Kafka prototype to PARTIALLY_SATISFIED', () => {
      const response = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const profile = response.result.structuredProfile!;
      expect(profile).toBeDefined();

      // 1. Airflow OR Prefect -> SATISFIED via production Airflow
      const airflowPrefectAst = parseLogicalRequirement('Apache Airflow or Prefect')!;
      const orEval = evaluateLogicalExpression(airflowPrefectAst, (skillId) => {
        const dummyReq: JdRequirement = { skillId, canonical: skillId, category: 'data_orchestration', required: 'must', weight: 5 };
        const res = evaluateSingleCompetency(dummyReq, profile);
        return { satisfied: res.status === 'SATISFIED', status: res.status, reason: res.explanation };
      });
      expect(orEval.satisfied).toBe(true);
      expect(orEval.status).toBe('SATISFIED');

      // 2. Kafka personal prototype evaluated against production requirement
      const prodKafkaReq: JdRequirement = {
        skillId: 'kafka',
        canonical: 'Apache Kafka',
        category: 'data_orchestration',
        required: 'must',
        weight: 5,
      };
      const kafkaMatch = evaluateSingleCompetency(prodKafkaReq, profile);
      expect(kafkaMatch.status).toBe('PARTIALLY_SATISFIED');
      expect(kafkaMatch.limitations[0]).toContain('personal prototype');

      // 3. dbt AND (Spark OR Flink)
      const dbtSparkAst = parseLogicalRequirement('dbt AND (Spark OR Flink)')!;
      const dbtEval = evaluateLogicalExpression(dbtSparkAst, (skillId) => {
        const dummyReq: JdRequirement = { skillId, canonical: skillId, category: 'data_storage', required: 'must', weight: 5 };
        const res = evaluateSingleCompetency(dummyReq, profile);
        return { satisfied: res.status === 'SATISFIED', status: res.status, reason: res.explanation };
      });
      // dbt is satisfied, but Spark is skills-list only and Flink is absent -> PARTIALLY_SATISFIED
      expect(dbtEval.satisfied).toBe(false);
      expect(dbtEval.status).toBe('PARTIALLY_SATISFIED');
      expect(dbtEval.explanation).toContain('Compound requirement incomplete');
    });
  });

});
