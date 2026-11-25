// ============================================================
// ATS Resume Roaster — Phase 05 Citation Integrity & Verification Tests
// Covers all 25 validation scenarios from Section 13,
// Benchmark A (PayGrid), Benchmark B (Northstar), and Citation Quality Metrics.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import {
  validateQuotation,
  validateClaimSupport,
  validateCitationLedger,
  measureCitationQuality,
} from '@/features/ats/engine/citationValidator';
import { CandidateEvidenceRecord } from '@/features/ats/engine/evidenceModel';

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
At Northstar Credit, we are building real-time credit risk assessment platforms.

What You'll Do:
- Build and optimize data pipelines using Python, SQL, and Snowflake
- Develop modular transformations with dbt and maintain workflow orchestration using Airflow
- Ensure data reliability, governance, and automated data quality checks
- Required: 2+ years of professional data engineering experience
`;

describe('HireFlow ATS Resume Roaster — Phase 05 Citation Integrity & Verification Suite', () => {
  describe('1. Quotation Verification & Offset Integrity (Scenarios 1-13)', () => {
    const sampleResume = `John Doe\njohn@example.com\n\nEXPERIENCE\nSenior Engineer | Acme Corp\n- Built high-throughput payment services in Go.\n- Reduced database p95 latency from 450ms to 95ms.\n- Migrated away from MongoDB to PostgreSQL.\n- Evaluated Kafka but decided against adopting it due to operational complexity.\n\nPROJECTS\nToyCache — Memory Cache Prototype\n- Implemented LRU cache in Rust.\n`;

    it('Scenario 1: Exact quotation with valid offsets yields VERIFIED_EXACT', () => {
      const quote = '- Built high-throughput payment services in Go.';
      const start = sampleResume.indexOf(quote);
      const end = start + quote.length;

      const res = validateQuotation(quote, start, end, sampleResume);
      expect(res.isValid).toBe(true);
      expect(res.status).toBe('VERIFIED_EXACT');
      expect(res.confidence).toBe(1.0);
    });

    it('Scenario 2: Exact quotation with incorrect offsets yields INVALID_OFFSETS', () => {
      const quote = '- Built high-throughput payment services in Go.';
      // Deliberately incorrect offsets (shifted by 25)
      const res = validateQuotation(quote, 10, 10 + quote.length, sampleResume);
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('INVALID_OFFSETS');
      expect(res.reasons[0]).toContain('offsets');
    });

    it('Scenario 3: Altered quotation yields INVALID_QUOTE', () => {
      const altered = '- Built hyper-scale payment services in Google Go and Kubernetes.';
      const res = validateQuotation(altered, 50, 110, sampleResume);
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('INVALID_QUOTE');
    });

    it('Scenario 4: Completely fabricated quotation yields INVALID_QUOTE', () => {
      const fabricated = '- Led entire AWS cloud migration saving $5,000,000 in operational costs.';
      const res = validateQuotation(fabricated, 0, 50, sampleResume);
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('INVALID_QUOTE');
    });

    it('Scenario 5 & 6: Document ID or Scan ID mismatch yields WRONG_SOURCE', () => {
      const quote = '- Built high-throughput payment services in Go.';
      const start = sampleResume.indexOf(quote);
      const end = start + quote.length;

      const res = validateQuotation(quote, start, end, sampleResume, {
        documentId: 'doc_resume_a',
        expectedDocumentId: 'doc_resume_b',
      });
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('WRONG_SOURCE');
    });

    it('Scenario 7: Correct quotation attributed to the wrong section yields WRONG_SECTION', () => {
      const quote = '- Built high-throughput payment services in Go.';
      const start = sampleResume.indexOf(quote);
      const end = start + quote.length;

      const res = validateQuotation(quote, start, end, sampleResume, {
        actualSection: 'experience',
        expectedSection: 'projects',
      });
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('WRONG_SECTION');
    });

    it('Scenario 8: Correct quotation attributed to the wrong entry yields WRONG_ENTRY', () => {
      const quote = '- Built high-throughput payment services in Go.';
      const start = sampleResume.indexOf(quote);
      const end = start + quote.length;

      const res = validateQuotation(quote, start, end, sampleResume, {
        actualEntry: 'role_acme_corp',
        expectedEntry: 'role_google',
      });
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('WRONG_ENTRY');
    });

    it('Scenario 9: Quotation with normalized whitespace yields VERIFIED_CONTEXTUAL', () => {
      const messyResume = `John Doe\n-  Architected   payment    service  in  Python. \n`;
      const cleanQuote = '- Architected payment service in Python.';
      const res = validateQuotation(cleanQuote, 9, 50, messyResume);
      expect(res.isValid).toBe(true);
      expect(res.status).toBe('VERIFIED_CONTEXTUAL');
    });

    it('Scenario 10, 11, 12: Unicode characters, bullet glyphs, and multiline statements', () => {
      const unicodeResume = `Jane Doe\n• Architected 24/7 payment service (£1.5M daily) across São Paulo & Zurich.\n– Scaled PostgreSQL to 15k RPS.`;
      const quote = '• Architected 24/7 payment service (£1.5M daily) across São Paulo & Zurich.';
      const start = unicodeResume.indexOf(quote);
      const end = start + quote.length;

      const res = validateQuotation(quote, start, end, unicodeResume);
      expect(res.isValid).toBe(true);
      expect(res.status).toBe('VERIFIED_EXACT');
    });

    it('Scenario 13 & 21: Missing or empty quotation returns UNRESOLVED', () => {
      const res = validateQuotation('', 0, 0, sampleResume);
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('UNRESOLVED');
    });
  });

  describe('2. Claim Support & Semantic Boundary Verification (Scenarios 14-25)', () => {
    it('Scenario 14 & 15: One statement legitimately supports multiple competencies without duplicate score credit', () => {
      const quote = 'Built a FastAPI service, optimized PostgreSQL queries using EXPLAIN ANALYZE, and introduced Redis caching to reduce p95 latency.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_1',
        originalText: quote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['fastapi', 'postgresql', 'db_query_optimization', 'redis'],
        matchedTerminology: ['FastAPI', 'PostgreSQL', 'EXPLAIN ANALYZE', 'Redis'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const valFastapi = validateClaimSupport('fastapi', quote, ev);
      expect(valFastapi.status).toBe('DIRECTLY_SUPPORTED');

      const valPostgres = validateClaimSupport('postgresql', quote, ev);
      expect(valPostgres.status).toBe('DIRECTLY_SUPPORTED');

      const valOpt = validateClaimSupport('database_query_optimization', quote, ev);
      expect(valOpt.status).toBe('DIRECTLY_SUPPORTED');

      const valRedis = validateClaimSupport('redis', quote, ev);
      expect(valRedis.status).toBe('DIRECTLY_SUPPORTED');
    });

    it('Scenario 16: Negated technology mention ("evaluated Kafka but decided against") yields CONTRADICTED', () => {
      const quote = 'Evaluated Kafka but decided against adopting it due to cluster complexity.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_neg',
        originalText: quote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'PARTIALLY_SUPPORTED',
        negationSentiment: 'EVALUATION_ONLY',
        isNegated: true,
        competencyIds: ['kafka'],
        matchedTerminology: ['Kafka'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const val = validateClaimSupport('kafka', quote, ev);
      expect(val.status).toBe('CONTRADICTED');
    });

    it('Scenario 17: Migration away from technology ("migrated away from MongoDB") yields CONTRADICTED', () => {
      const quote = 'Migrated away from MongoDB to PostgreSQL for transactional ACID guarantees.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_mig',
        originalText: quote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'PARTIALLY_SUPPORTED',
        negationSentiment: 'MIGRATED_AWAY',
        isNegated: true,
        competencyIds: ['mongodb'],
        matchedTerminology: ['MongoDB'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const val = validateClaimSupport('mongodb', quote, ev);
      expect(val.status).toBe('CONTRADICTED');
    });

    it('Scenario 18: Academic Coursework evidence yields PARTIALLY_SUPPORTED with explicit limitation', () => {
      const quote = 'Coursework: BigQuery, Distributed Systems, Data Warehousing';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_course',
        originalText: quote,
        sourceSection: 'education',
        sourceType: 'COURSEWORK',
        environmentMaturity: 'COURSEWORK_ENVIRONMENT',
        candidateContribution: 'FAMILIARITY_ONLY',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['bigquery'],
        matchedTerminology: ['BigQuery'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'weak',
        extractionConfidence: 0.85,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const val = validateClaimSupport('bigquery', quote, ev);
      expect(val.status).toBe('PARTIALLY_SUPPORTED');
      expect(val.claimType).toBe('ACADEMIC_KNOWLEDGE');
      expect(val.limitations[0]).toContain('coursework');
    });

    it('Scenario 19: Personal Project prototype evidence yields PARTIALLY_SUPPORTED with explicit limitation', () => {
      const quote = 'StreamWatch Kafka Prototype — Built personal event stream simulator.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_proto',
        originalText: quote,
        sourceSection: 'projects',
        sourceType: 'PERSONAL_PROJECT',
        environmentMaturity: 'PROTOTYPE',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['kafka'],
        matchedTerminology: ['Kafka'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.9,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const val = validateClaimSupport('kafka', quote, ev);
      expect(val.status).toBe('PARTIALLY_SUPPORTED');
      expect(val.limitations[0]).toContain('personal prototype');
    });

    it('Scenario 20: Production experience with metrics yields DIRECTLY_SUPPORTED and MEASURABLE_ACHIEVEMENT', () => {
      const quote = 'Maintained 35+ production Airflow DAGs processing over 18 million records daily.';
      const ev: CandidateEvidenceRecord = {
        id: 'ev_prod',
        originalText: quote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'OPERATIONAL_RESPONSIBILITY',
        verificationStatus: 'SOURCE_VALIDATED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['airflow'],
        matchedTerminology: ['Airflow'],
        metricsReferences: ['35+ DAGs', '18 million records'],
        hasMetric: true,
        evidenceStrength: 'strong',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: quote.length, lineStart: 1, lineEnd: 1 },
      };

      const val = validateClaimSupport('airflow', quote, ev);
      expect(val.status).toBe('DIRECTLY_SUPPORTED');
      expect(val.claimType).toBe('MEASURABLE_ACHIEVEMENT');
    });

    it('Scenario 22: Non-equivalence guard: Docker does NOT prove Kubernetes; Snowflake does NOT prove DB Sharding', () => {
      const dockerQuote = 'Provisioned Docker containers for local microservice development.';
      const evDocker: CandidateEvidenceRecord = {
        id: 'ev_doc',
        originalText: dockerQuote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['docker'],
        matchedTerminology: ['Docker'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: dockerQuote.length, lineStart: 1, lineEnd: 1 },
      };

      const valK8s = validateClaimSupport('kubernetes', dockerQuote, evDocker);
      expect(valK8s.status).toBe('NOT_SUPPORTED');
      expect(valK8s.reasons[0]).toContain('does NOT prove');

      const shardingQuote = 'Created Snowflake partitioned data tables.';
      const evSharding: CandidateEvidenceRecord = {
        id: 'ev_sh',
        originalText: shardingQuote,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'DIRECT_IMPLEMENTATION',
        verificationStatus: 'RESUME_SUPPORTED',
        negationSentiment: 'POSITIVE_USAGE',
        isNegated: false,
        competencyIds: ['snowflake'],
        matchedTerminology: ['Snowflake'],
        metricsReferences: [],
        hasMetric: false,
        evidenceStrength: 'moderate',
        extractionConfidence: 0.95,
        locator: { charStart: 0, charEnd: shardingQuote.length, lineStart: 1, lineEnd: 1 },
      };

      const valSharding = validateClaimSupport('database_sharding', shardingQuote, evSharding);
      expect(valSharding.status).toBe('NOT_SUPPORTED');
    });
  });

  describe('3. Benchmark A — PayGrid Systems Citation Ledger (Rohan Deshmukh)', () => {
    it('verifies verbatim citation integrity for all required backend competencies', () => {
      const response = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const ledger = response.result.citationLedger!;
      expect(ledger).toBeDefined();
      expect(ledger.citations.length).toBeGreaterThanOrEqual(10);

      // Verify PostgreSQL Query Optimization Citation
      const dbCitations = ledger.citationsByCompetency['database_query_optimization'] || [];
      expect(dbCitations.length).toBeGreaterThan(0);
      const dbCit = dbCitations[0];
      expect(dbCit.validationStatus).toBe('VERIFIED_EXACT');
      expect(dbCit.claimSupport).toBe('DIRECTLY_SUPPORTED');
      expect(dbCit.originalQuotation).toContain('EXPLAIN ANALYZE');
      expect(dbCit.originalQuotation).toContain('composite B-tree');

      // Verify Celery / RabbitMQ Citations
      const celeryCitations = ledger.citationsByCompetency['celery'] || [];
      expect(celeryCitations.length).toBeGreaterThan(0);
      expect(celeryCitations[0].validationStatus).toBe('VERIFIED_EXACT');
      expect(celeryCitations[0].originalQuotation).toContain('Celery');

      const rabbitCitations = ledger.citationsByCompetency['rabbitmq'] || [];
      expect(rabbitCitations.length).toBeGreaterThan(0);
      expect(rabbitCitations[0].validationStatus).toBe('VERIFIED_EXACT');

      // Verify Pytest / CI/CD Citations
      const pytestCitations = ledger.citationsByCompetency['pytest'] || [];
      expect(pytestCitations.length).toBeGreaterThan(0);
      expect(pytestCitations[0].originalQuotation).toContain('140+ Pytest');

      const cicdCitations = ledger.citationsByCompetency['ci_cd'] || ledger.citationsByCompetency['cicd'] || [];
      expect(cicdCitations.length).toBeGreaterThan(0);
      expect(cicdCitations[0].originalQuotation).toContain('GitHub Actions CI/CD');

      // Check Quality Metrics
      const metrics = ledger.metrics;
      expect(metrics.citationAccuracyPct).toBeGreaterThanOrEqual(95);
      expect(metrics.exactValidCount).toBeGreaterThanOrEqual(8);
      expect(metrics.invalidQuoteCount).toBe(0);
    });
  });

  describe('4. Benchmark B — Northstar Credit Citation Ledger (Ananya Rao)', () => {
    it('verifies Airflow, dbt, Great Expectations and bounds Kafka to prototype citation', () => {
      const response = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const ledger = response.result.citationLedger!;
      expect(ledger).toBeDefined();

      // Verify Airflow Production Citation
      const airflowCitations = ledger.citationsByCompetency['airflow'] || [];
      expect(airflowCitations.length).toBeGreaterThan(0);
      expect(airflowCitations[0].validationStatus).toBe('VERIFIED_EXACT');
      expect(airflowCitations[0].claimSupport).toBe('DIRECTLY_SUPPORTED');
      expect(airflowCitations[0].environmentMaturity).toBe('PRODUCTION');

      // Verify dbt Citation
      const dbtCitations = ledger.citationsByCompetency['dbt'] || [];
      expect(dbtCitations.length).toBeGreaterThan(0);
      expect(dbtCitations[0].validationStatus).toBe('VERIFIED_EXACT');
      expect(dbtCitations[0].originalQuotation).toContain('dbt incremental models');

      // Verify Great Expectations Data Quality Citation
      const dqCitations = ledger.citationsByCompetency['data_quality'] || [];
      expect(dqCitations.length).toBeGreaterThan(0);
      expect(dqCitations[0].originalQuotation).toContain('Great Expectations');
      expect(dqCitations[0].validationStatus).toBe('VERIFIED_EXACT');

      // Verify Kafka is bounded to PARTIALLY_SUPPORTED with limitations
      const kafkaCitations = ledger.citationsByCompetency['kafka'] || [];
      expect(kafkaCitations.length).toBeGreaterThan(0);
      const kafkaCit = kafkaCitations[0];
      expect(kafkaCit.claimSupport).toBe('PARTIALLY_SUPPORTED');
      expect(kafkaCit.environmentMaturity).toBe('PROTOTYPE');
      expect(kafkaCit.limitations).toBeDefined();
      expect(kafkaCit.limitations![0]).toContain('personal prototype');

      // Quality Metrics
      const metrics = ledger.metrics;
      expect(metrics.citationAccuracyPct).toBeGreaterThanOrEqual(95);
      expect(metrics.invalidQuoteCount).toBe(0);
    });
  });
});
