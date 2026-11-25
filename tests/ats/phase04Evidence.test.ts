// ============================================================
// ATS Resume Roaster — Phase 04 Evidence Extraction Test Suite
// Verifies structured employment, project origins, provenance tiers,
// negation detection, source locators, Benchmark A, and Benchmark B.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { splitResumeSections } from '@/features/ats/engine/sectionSplitter';
import { parseExperienceSection, detectEmploymentType } from '@/features/ats/engine/experienceParser';
import { parseProjectSection, classifyProjectOrigin } from '@/features/ats/engine/projectParser';
import { analyzeStatement } from '@/features/ats/engine/statementExtractor';
import { normalizePreservingSource } from '@/features/ats/engine/sourceLocator';

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

describe('HireFlow ATS Resume Roaster — Phase 04 Evidence & Parser Suite', () => {
  describe('1. Source Locator & Normalization Integrity', () => {
    it('preserves bidirectional character and line mapping across normalization', () => {
      const raw = `John Doe\n• Architected distributed systems\n  using  Python   and   FastAPI.\n– p95 latency reduced by 40%`;
      const doc = normalizePreservingSource(raw, 'doc_test_1');

      expect(doc.normalizedText).toContain('- Architected distributed systems');
      expect(doc.normalizedText).toContain('using Python and FastAPI.');
      expect(doc.normalizedText).toContain('- p95 latency reduced by 40%');

      // Check locator creation
      const loc = doc.createLocator(10, 45, { sectionId: 'exp', entryId: 'role1' });
      expect(loc.charStart).toBe(10);
      expect(loc.charEnd).toBe(45);
      expect(loc.lineStart).toBeGreaterThanOrEqual(1);
      expect(loc.lineEnd).toBeGreaterThanOrEqual(loc.lineStart);
      expect(loc.documentId).toBe('doc_test_1');
    });
  });

  describe('2. Enhanced Section Splitter (Standard & Nonstandard)', () => {
    it('recognizes nonstandard and representative headings accurately', () => {
      const resume = `
Alex Mercer
alex@example.com

SELECTED ENGINEERING WORK
Acme Corp | Staff Engineer | 2022 - Present
- Designed microservices in Go.

TECHNICAL PORTFOLIO
Distributed KV Store | 2023
- Implemented Raft consensus in Rust.

AREAS OF EXPERTISE
Go, Rust, Distributed Systems, Raft, Kubernetes
`;
      const sections = splitResumeSections(resume);
      expect(sections.some(s => s.type === 'experience' && s.rawTitle === 'SELECTED ENGINEERING WORK')).toBe(true);
      expect(sections.some(s => s.type === 'projects' && s.rawTitle === 'TECHNICAL PORTFOLIO')).toBe(true);
      expect(sections.some(s => s.type === 'skills' && s.rawTitle === 'AREAS OF EXPERTISE')).toBe(true);
    });

    it('preserves unknown sections without discarding content', () => {
      const resume = `
Jane Doe
jane@example.com

EXPERIENCE
Acme Corp | 2022 - Present
- Built web apps.

PATENTS AND INVENTIONS
US Patent 10,999,999 - Distributed Consensus Protocol for Edge Nodes

SKILLS
Python, Go
`;
      const sections = splitResumeSections(resume);
      const unknownSec = sections.find(s => s.rawTitle === 'PATENTS AND INVENTIONS');
      expect(unknownSec).toBeDefined();
      expect(unknownSec?.type).toBe('unknown');
      expect(unknownSec?.content).toContain('Distributed Consensus Protocol');
    });
  });

  describe('3. Employment Parsing & Role Disambiguation', () => {
    it('correctly classifies employment types (FULL_TIME, INTERNSHIP, CONTRACT)', () => {
      expect(detectEmploymentType('Software Engineer')).toBe('FULL_TIME');
      expect(detectEmploymentType('Data Engineering Intern')).toBe('INTERNSHIP');
      expect(detectEmploymentType('Summer Technology Associate (Co-op)')).toBe('INTERNSHIP');
      expect(detectEmploymentType('DevOps Consultant (Contract)')).toBe('CONTRACT');
      expect(detectEmploymentType('Freelance Fullstack Developer')).toBe('FREELANCE');
    });

    it('handles multiple roles and promotions at the same company', () => {
      const expText = `
EXPERIENCE
Google | Mountain View, CA
Senior Software Engineer | 2023 - Present
- Led team of 8 engineers building payment APIs.

Software Engineer | 2021 - 2023
- Built backend services in C++ and Go.
`;
      const sections = splitResumeSections(expText);
      const expSec = sections.find(s => s.type === 'experience');
      const roles = parseExperienceSection(expSec);

      expect(roles.length).toBe(2);
      expect(roles[0].title).toBe('Senior Software Engineer');
      expect(roles[0].isCurrent).toBe(true);
      expect(roles[1].title).toBe('Software Engineer');
      expect(roles[1].startYear).toBe(2021);
      expect(roles[1].endYear).toBe(2023);
    });
  });

  describe('4. Project Origin & Environment Maturity Separation', () => {
    it('classifies project origins correctly', () => {
      expect(classifyProjectOrigin('StreamWatch — Personal Kafka Prototype')).toBe('PERSONAL_PROJECT');
      expect(classifyProjectOrigin('Autonomous Drone Navigation (Final Year Capstone)')).toBe('ACADEMIC_PROJECT');
      expect(classifyProjectOrigin('HackMIT Winner — HealthAI Emergency Dispatch')).toBe('HACKATHON_PROJECT');
      expect(classifyProjectOrigin('Contributor to Apache Arrow (Open Source)')).toBe('OPEN_SOURCE_PROJECT');
    });
  });

  describe('5. Statement Analysis & Negation Detection', () => {
    it('detects negated usage and prevents false positive competency attribution', () => {
      const s1 = analyzeStatement('Evaluated Kafka but decided against using it in production due to cluster complexity.');
      expect(s1.isNegated).toBe(true);
      expect(s1.negationSentiment).toBe('EVALUATION_ONLY');

      const s2 = analyzeStatement('Migrated away from MongoDB to PostgreSQL for relational integrity.');
      expect(s2.isNegated).toBe(true);
      expect(s2.negationSentiment).toBe('MIGRATED_AWAY');

      const s3 = analyzeStatement('Built core microservice in Go without prior experience in Kubernetes.');
      expect(s3.isNegated).toBe(true);
      expect(s3.negationSentiment).toBe('NEGATED_USAGE');

      const s4 = analyzeStatement('Architected high-throughput payment gateway using FastAPI and PostgreSQL handling 15k RPS.');
      expect(s4.isNegated).toBe(false);
      expect(s4.candidateContribution).toBe('ARCHITECTURE_DESIGN');
      expect(s4.environmentMaturity).toBe('PRODUCTION');
      expect(s4.hasMetric).toBe(true);
    });
  });

  describe('6. Benchmark A — PayGrid Systems (Rohan Deshmukh)', () => {
    it('extracts rich structured employment evidence without conflating RateShield / LedgerLite personal projects', () => {
      const response = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const profile = response.result.structuredProfile!;
      expect(profile).toBeDefined();
      expect(profile.candidateName).toBe('Rohan Deshmukh');
      expect(profile.employment.length).toBeGreaterThanOrEqual(1);

      // Verify Employment Entry
      const payTech = profile.employment[0];
      expect(payTech.employerName).toBe('PayTech Solutions');
      expect(payTech.jobTitle).toBe('Senior Backend Engineer');
      expect(payTech.employmentType).toBe('FULL_TIME');
      expect(payTech.isCurrent).toBe(true);

      // Verify Projects
      expect(profile.projects.length).toBe(2);
      const rateShield = profile.projects.find(p => p.projectName.includes('RateShield'));
      expect(rateShield).toBeDefined();
      expect(rateShield?.projectOrigin).toBe('PERSONAL_PROJECT');

      const ledgerLite = profile.projects.find(p => p.projectName.includes('LedgerLite'));
      expect(ledgerLite).toBeDefined();
      expect(ledgerLite?.projectOrigin).toBe('PERSONAL_PROJECT');

      // Verify Specific Verified Competencies with exact provenance
      const evidenceRecords = response.result.evidenceRecords!;
      expect(evidenceRecords.length).toBeGreaterThan(0);

      // EXPLAIN ANALYZE / Composite B-Tree
      const dbRecord = evidenceRecords.find(e =>
        e.originalText.includes('EXPLAIN ANALYZE') && e.originalText.includes('composite B-tree')
      );
      expect(dbRecord).toBeDefined();
      expect(dbRecord?.sourceType).toBe('PROFESSIONAL_EXPERIENCE');
      expect(dbRecord?.environmentMaturity).toBe('PRODUCTION');
      expect(dbRecord?.hasMetric).toBe(true);

      // Celery & RabbitMQ
      const celeryRecord = evidenceRecords.find(e =>
        e.originalText.includes('Celery') && e.originalText.includes('RabbitMQ')
      );
      expect(celeryRecord).toBeDefined();
      expect(celeryRecord?.sourceType).toBe('PROFESSIONAL_EXPERIENCE');
      expect(celeryRecord?.hasMetric).toBe(true);

      // 140+ Pytest tests in GitHub Actions
      const pytestRecord = evidenceRecords.find(e =>
        e.originalText.includes('Pytest') && e.originalText.includes('86%')
      );
      expect(pytestRecord).toBeDefined();
      expect(pytestRecord?.sourceType).toBe('PROFESSIONAL_EXPERIENCE');
      expect(pytestRecord?.hasMetric).toBe(true);

      // Overall Score verification
      expect(response.result.score).toBeGreaterThanOrEqual(80);
      expect(response.result.scanIdentity?.candidateName).toBe('Rohan Deshmukh');
      expect(response.result.scanIdentity?.employerName).toBe('PayGrid Systems');
    });
  });

  describe('7. Benchmark B — Northstar Credit (Ananya Rao)', () => {
    it('correctly distinguishes professional Airflow from personal Kafka prototype and internship BigQuery', () => {
      const response = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const profile = response.result.structuredProfile!;
      expect(profile).toBeDefined();
      expect(profile.candidateName).toBe('Ananya Rao');

      // Verify Employment Roles: 1 Full-time + 1 Internship
      expect(profile.employment.length).toBe(2);
      const dataFlowRole = profile.employment.find(e => e.employerName.includes('DataFlow'));
      expect(dataFlowRole).toBeDefined();
      expect(dataFlowRole?.employmentType).toBe('FULL_TIME');

      const internRole = profile.employment.find(e => e.employerName.includes('CloudScale'));
      expect(internRole).toBeDefined();
      expect(internRole?.employmentType).toBe('INTERNSHIP');

      // Verify Airflow 35+ DAGs is Professional Experience
      const airflowRecord = response.result.evidenceRecords!.find(e =>
        e.originalText.includes('Airflow DAGs') && e.originalText.includes('18 million')
      );
      expect(airflowRecord).toBeDefined();
      expect(airflowRecord?.sourceType).toBe('PROFESSIONAL_EXPERIENCE');
      expect(airflowRecord?.environmentMaturity).toBe('PRODUCTION');
      expect(airflowRecord?.hasMetric).toBe(true);

      // Verify dbt 94 to 31 min is Professional Experience
      const dbtRecord = response.result.evidenceRecords!.find(e =>
        e.originalText.includes('dbt incremental models')
      );
      expect(dbtRecord).toBeDefined();
      expect(dbtRecord?.sourceType).toBe('PROFESSIONAL_EXPERIENCE');

      // Verify Kafka is strictly Personal Project / Prototype
      const kafkaRecord = response.result.evidenceRecords!.find(e =>
        e.originalText.includes('StreamWatch') || (e.originalText.includes('Kafka') && e.sourceSection === 'projects')
      );
      expect(kafkaRecord).toBeDefined();
      expect(kafkaRecord?.sourceType).toBe('PERSONAL_PROJECT');
      expect(kafkaRecord?.environmentMaturity).toBe('PROTOTYPE');

      // Verify BigQuery in Coursework vs Internship
      const bqCoursework = response.result.evidenceRecords!.find(e =>
        e.sourceType === 'COURSEWORK' && e.originalText.includes('BigQuery')
      );
      expect(bqCoursework).toBeDefined();
      expect(bqCoursework?.environmentMaturity).toBe('COURSEWORK_ENVIRONMENT');

      // Target employer and candidate identity
      expect(response.result.scanIdentity?.candidateName).toBe('Ananya Rao');
      expect(response.result.scanIdentity?.employerName).toBe('Northstar Credit');
    });
  });
});
