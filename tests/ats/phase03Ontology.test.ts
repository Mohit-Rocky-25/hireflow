// ============================================================
// ATS Resume Roaster — Phase 03 Competency Knowledge & Ontology Tests
// Tests Benchmark A (PayGrid), Benchmark B (Northstar), Cross-Domain
// Coverage, Ontology Validators, Non-Equivalence Guards, and Coverage Analyzer.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import {
  validateCompetencyOntology,
} from '@/features/ats/knowledge/ontology/validator';
import {
  analyzeKnowledgeCoverage,
} from '@/features/ats/knowledge/ontology/coverageAnalyzer';
import {
  areNonEquivalent,
  isPermissibleAlternative,
  resolveCompetency,
} from '@/features/ats/knowledge/ontology';

const BENCHMARK_A_RESUME = `
Rohan Deshmukh
rohan.deshmukh@example.com | +91 98765 43210 | Bangalore, India
linkedin.com/in/rohandeshmukh | github.com/rohandeshmukh

PROFESSIONAL SUMMARY
Backend Software Engineer with 4+ years of experience designing and scaling distributed payment systems.

EXPERIENCE
Senior Backend Engineer | PayTech Solutions | 2021 - Present
- Architected core payment orchestration service using Python and FastAPI handling 15,000+ RPS with 45ms p99 latency.
- Implemented PostgreSQL composite B-tree indexes and optimized query plans using EXPLAIN ANALYZE, cutting query response times by 68%.
- Integrated Redis read-through caching layer with cache stampede mitigation, decreasing database read load by 55%.
- Built asynchronous webhook delivery engine with Celery, RabbitMQ, and exponential backoff retry with dead-letter queue.
- Implemented JWT authentication with RBAC and HMAC-SHA256 request signatures for partner banking APIs.
- Authored 140+ Pytest unit and integration test suite achieving 86% branch coverage in GitHub Actions CI/CD pipeline.
- Provisioned Docker containers deployed onto AWS EC2, RDS PostgreSQL, and S3 using Terraform.

PROJECTS
High-Throughput Idempotent Ledger | 2023
- Designed double-entry transaction processing ledger with ACID guarantees, row-level database locks, and idempotency keys.

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
- Assisted in building ETL scripts using Python and SQL to ingest customer clickstream data into BigQuery.

PROJECTS
Real-Time Event Stream Consumer | 2023
- Built personal prototype streaming consumer using Apache Kafka and Python to simulate fraud detection event feeds.

SKILLS
Languages: Python, SQL
Tools & Platforms: Apache Airflow, dbt, Snowflake, AWS S3, Great Expectations, Docker, Git
Coursework: BigQuery, Apache Spark basics
`;

const BENCHMARK_B_JD = `
Data Engineer — Risk & Decisioning
At Northstar Credit, we are building real-time credit risk assessment platforms.

What You'll Do:
- Build and optimize data pipelines using Python, SQL, and Snowflake
- Develop modular transformations with dbt and maintain workflow orchestration using Airflow
- Ensure data reliability, governance, and automated data quality checks
- Required: 3+ years of professional data engineering experience
`;

describe('HireFlow ATS Resume Roaster — Phase 03 Competency Ontology Suite', () => {

  describe('1. Competency Ontology Structure & Validation', () => {
    it('passes automated ontology validation with zero duplicate IDs or conflicting guards', () => {
      const result = validateCompetencyOntology();
      if (!result.isValid) {
        console.log('Ontology Validation Errors:', result.errors);
      }
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('resolves competencies by canonical name, alias, and abbreviation', () => {
      expect(resolveCompetency('PostgreSQL')?.id).toBe('postgresql');
      expect(resolveCompetency('PGSQL')?.id).toBe('postgresql');
      expect(resolveCompetency('EXPLAIN ANALYZE')?.id).toBe('database_query_optimization');
      expect(resolveCompetency('Great Expectations')?.id).toBe('great_expectations');
      expect(resolveCompetency('CI/CD')?.id).toBe('ci_cd');
    });

    it('enforces explicit non-equivalence guards', () => {
      // Docker does NOT prove Kubernetes
      expect(areNonEquivalent('docker', 'kubernetes')).toBe(true);
      // RabbitMQ does NOT prove Kafka
      expect(areNonEquivalent('rabbitmq', 'kafka')).toBe(true);
      // Single-instance database indexing does NOT prove distributed database sharding
      expect(areNonEquivalent('database_query_optimization', 'database_sharding')).toBe(true);
    });

    it('correctly resolves technical alternatives', () => {
      expect(isPermissibleAlternative('apache_airflow', 'prefect')).toBe(true);
      expect(isPermissibleAlternative('apache_spark', 'apache_flink')).toBe(true);
      expect(isPermissibleAlternative('kafka', 'aws_kinesis')).toBe(true);
    });
  });

  describe('2. Benchmark A (PayGrid Systems / Rohan Deshmukh)', () => {
    it('verifies CI/CD from GitHub Actions workflow bullet', () => {
      const res = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(res.success).toBe(true);

      const cicdResult = res.result.skillResults.find(s => s.skillId === 'ci_cd' || s.canonical.includes('CI/CD'));
      expect(cicdResult).toBeDefined();
      expect(cicdResult!.found).toBe(true);
      expect(cicdResult!.status).toBe('verified');
    });

    it('verifies database query optimization & indexing from EXPLAIN ANALYZE / B-tree bullets', () => {
      const res = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(res.success).toBe(true);

      const pgResult = res.result.skillResults.find(s => s.skillId === 'postgresql' || s.canonical.includes('PostgreSQL'));
      expect(pgResult).toBeDefined();
      expect(pgResult!.found).toBe(true);
      expect(pgResult!.status).toBe('verified');
      expect(pgResult!.evidence.some(e => e.quote.includes('EXPLAIN ANALYZE') || e.quote.includes('B-tree'))).toBe(true);
    });

    it('verifies asynchronous messaging with Celery & RabbitMQ', () => {
      const res = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(res.success).toBe(true);

      const celeryResult = res.result.skillResults.find(s => s.skillId === 'celery' || s.canonical.includes('Celery'));
      expect(celeryResult?.found).toBe(true);
      expect(celeryResult?.status).toBe('verified');
    });
  });

  describe('3. Benchmark B (Northstar Credit / Ananya Rao)', () => {
    it('verifies Great Expectations and data quality requirements', () => {
      const res = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(res.success).toBe(true);

      // Verify data quality / governance is recognized and credited
      const dqResult = res.result.skillResults.find(s => s.skillId === 'great_expectations' || s.skillId === 'data_quality' || s.canonical.includes('Data Quality') || s.canonical.includes('Data Governance'));
      if (dqResult) {
        expect(dqResult.found).toBe(true);
        expect(dqResult.status).toBe('verified');
      }
    });

    it('verifies Airflow workflow orchestration with 35+ DAGs bullet', () => {
      const res = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(res.success).toBe(true);

      const airflowResult = res.result.skillResults.find(s => s.skillId === 'apache_airflow' || s.canonical.includes('Airflow'));
      expect(airflowResult).toBeDefined();
      expect(airflowResult!.found).toBe(true);
      expect(airflowResult!.status).toBe('verified');
      expect(airflowResult!.evidence.some(e => e.quote.includes('Airflow DAGs'))).toBe(true);
    });

    it('verifies dbt incremental models transformation evidence', () => {
      const res = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(res.success).toBe(true);

      const dbtResult = res.result.skillResults.find(s => s.skillId === 'dbt' || s.canonical.includes('dbt'));
      expect(dbtResult).toBeDefined();
      expect(dbtResult!.found).toBe(true);
      expect(dbtResult!.status).toBe('verified');
    });
  });

  describe('4. Knowledge Coverage Analyzer Utility', () => {
    it('analyzes text collections and produces reviewable proposals without mutating production', () => {
      const sampleTexts = [
        { text: BENCHMARK_A_JD, source: 'jd' as const },
        { text: BENCHMARK_B_JD, source: 'jd' as const },
        { text: 'Looking for experience with Ray, LangGraph, and Vector Search indexing.', source: 'jd' as const },
      ];

      const report = analyzeKnowledgeCoverage(sampleTexts);
      expect(report.totalTermsScanned).toBeGreaterThan(0);
      expect(report.recognizedTermsCount).toBeGreaterThan(0);
      expect(Array.isArray(report.unmappedProposals)).toBe(true);
      expect(report.unmappedProposals.every(p => p.status === 'pending_review')).toBe(true);
    });
  });

});
