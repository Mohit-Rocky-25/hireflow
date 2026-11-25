// ============================================================
// ATS Resume Roaster — Phase 02 P0 Regression Test Suite
// Verifies Candidate & Company Identity, Phantom JD Prevention,
// Scoring Unification, and Penalty Application Invariants.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { extractContactInfo } from '@/features/ats/engine/contactExtractor';
import { extractEmployerFromJd } from '@/features/ats/engine/companyExtractor';
import { analyzeJobDescription } from '@/features/ats/engine/jdAnalyzer';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import { createScanIdentity } from '@/features/ats/engine/scanIdentity';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import { buildDossierModel } from '@/features/dossier/dossierModel';

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

describe('HireFlow ATS Resume Roaster — Phase 02 P0 Integrity Suite', () => {

  describe('P0.1: Candidate & Company Identity Integrity & Scan Isolation', () => {
    it('correctly extracts Rohan Deshmukh from Benchmark A resume', () => {
      const contact = extractContactInfo(BENCHMARK_A_RESUME);
      expect(contact.name).toBe('Rohan Deshmukh');
      expect(contact.email).toBe('rohan.deshmukh@example.com');
    });

    it('correctly extracts Ananya Rao from Benchmark B resume', () => {
      const contact = extractContactInfo(BENCHMARK_B_RESUME);
      expect(contact.name).toBe('Ananya Rao');
      expect(contact.email).toBe('ananya.rao@example.com');
    });

    it('correctly extracts PayGrid Systems from explicit company header', () => {
      const employer = extractEmployerFromJd(BENCHMARK_A_JD);
      expect(employer.companyName).toBe('PayGrid Systems');
      expect(employer.confidence).toBe('high');
    });

    it('correctly extracts Northstar Credit from natural intro phrase ("At Northstar Credit, we are building...")', () => {
      const employer = extractEmployerFromJd(BENCHMARK_B_JD);
      expect(employer.companyName).toBe('Northstar Credit');
      expect(employer.confidence).toBe('high');
    });

    it('guarantees sequential scans do not inherit candidate or employer names', () => {
      const scanA = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(scanA.success).toBe(true);
      expect(scanA.result.candidateName).toBe('Rohan Deshmukh');
      expect(scanA.result.employerName).toBe('PayGrid Systems');

      const scanB = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      expect(scanB.success).toBe(true);
      expect(scanB.result.candidateName).toBe('Ananya Rao');
      expect(scanB.result.employerName).toBe('Northstar Credit');

      // Verify no cross-scan leakage
      expect(scanB.result.candidateName).not.toBe(scanA.result.candidateName);
      expect(scanB.result.employerName).not.toBe(scanA.result.employerName);
    });

    it('preserves parsed candidate name in Dossier model without defaulting to profile account name', () => {
      const resA = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      const auditInput = atsToAuditInput({
        result: resA.result,
        resumeText: BENCHMARK_A_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
        targetCompany: resA.result.employerName || undefined,
        candidateName: resA.result.candidateName || undefined,
      });

      const auditEntry: any = {
        schemaVersion: 1,
        id: 'test-audit-a',
        kind: 'ats_roast',
        createdAt: new Date().toISOString(),
        engineVersion: '4.0.0',
        resume: { label: 'Rohan Resume', snapshotHash: 'hash-a' },
        jd: { origin: 'uploaded', company: resA.result.employerName || 'PayGrid Systems' },
        overallScore: resA.result.score,
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        strengths: auditInput.strengths,
        evidence: auditInput.evidence,
        findingsJson: auditInput.findings,
      };

      const dossier = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_A_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Mohit' }, // Simulates profile store default "Mohit"
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      // The dossier candidate name MUST resolve to the parsed resume candidate "Rohan Deshmukh", NOT "Mohit"!
      expect(dossier.candidate.name).toBe('Rohan Deshmukh');
      expect(dossier.target.company).toBe('PayGrid Systems');
    });
  });

  describe('P0.2: Eliminate Phantom JD Seeding', () => {
    it('does NOT inject unmentioned technologies (Django, GCP) into PayGrid JD', () => {
      const jdAnalysis = analyzeJobDescription(BENCHMARK_A_JD);
      const skillIds = jdAnalysis.requiredSkills.map(s => s.skillId);

      expect(skillIds).not.toContain('django');
      expect(skillIds).not.toContain('gcp');
      expect(jdAnalysis.requiredSkills.every(s => s.sourceType === 'explicit')).toBe(true);
    });

    it('does NOT inject unmentioned technologies (Databricks, Prometheus, Sharding) into Northstar JD', () => {
      const jdAnalysis = analyzeJobDescription(BENCHMARK_B_JD);
      const skillIds = jdAnalysis.requiredSkills.map(s => s.skillId);

      expect(skillIds).not.toContain('databricks');
      expect(skillIds).not.toContain('prometheus');
      expect(skillIds).not.toContain('database_sharding');
    });

    it('preserves short JDs with only 1-2 requirements without auto-injecting must-haves', () => {
      const shortJd = 'We need a Senior Python Developer with expert SQL knowledge.';
      const jdAnalysis = analyzeJobDescription(shortJd);
      
      const mustSkills = jdAnalysis.requiredSkills.filter(s => s.required === 'must');
      expect(mustSkills.length).toBeLessThan(4);
      // Inferred recommendations should be saved in inferredRecommendations, NOT requiredSkills
      expect(jdAnalysis.inferredRecommendations).toBeDefined();
      expect(jdAnalysis.inferredRecommendations!.length).toBeGreaterThan(0);
    });
  });

  describe('P0.3: Unified Authoritative Scoring Engine', () => {
    it('guarantees result.score, trace.composite, and trace.compositeDisplay are identical', () => {
      const res = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      expect(res.success).toBe(true);
      expect(res.result.trace).toBeDefined();

      const authoritativeScore = res.result.score;
      expect(res.result.trace!.composite).toBe(authoritativeScore);
      expect(res.result.trace!.compositeDisplay).toBe(authoritativeScore);
    });

    it('ensures audit entry overallScore equals the engine result score exactly', () => {
      const res = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);
      const auditInput = atsToAuditInput({
        result: res.result,
        resumeText: BENCHMARK_B_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });

      expect(auditInput.overallScore).toBe(res.result.score);
    });
  });

  describe('P0.4: Penalty Calculation and Score Invariants', () => {
    it('applies penalties by actually deducting points from raw score', () => {
      // Resume missing contact info, missing standard sections, but meeting word count & section requirements
      const sparseResume = `
      John Doe
      
      EXPERIENCE
      Software Engineer | Tech Corp | 2022 - Present
      - Built web application backend using Python and Flask framework.
      - Wrote SQL database queries for customer profile records.
      - Developed REST APIs and handled integration with frontend services.
      - Collaborated with senior engineers on sprint backlog tasks and code reviews.
      
      SKILLS
      Python, Flask, SQL, Git, Linux, Docker, HTML, CSS, JavaScript, C++, Java, Rust, Redis, Kafka, Kubernetes, AWS, GCP, Azure, MongoDB, PostgreSQL, GraphQL, Microservices
      `;
      const jd = `
      Software Engineer
      Requirements:
      - Python and Flask web development
      - Relational database experience with SQL
      `;

      const res = runAtsEngine(sparseResume, jd);
      expect(res.success).toBe(true);

      const penaltySum = res.result.penalties.reduce((sum, p) => sum + Math.abs(p.points), 0);
      expect(penaltySum).toBeGreaterThan(0);
      // The final score must not exceed 100 and must reflect active penalty deductions
      expect(res.result.score).toBeLessThanOrEqual(75);
    });

    it('enforces score invariant: 0 <= score <= 100 for all evaluations', () => {
      const resA = runAtsEngine(BENCHMARK_A_RESUME, BENCHMARK_A_JD);
      const resB = runAtsEngine(BENCHMARK_B_RESUME, BENCHMARK_B_JD);

      expect(resA.result.score).toBeGreaterThanOrEqual(0);
      expect(resA.result.score).toBeLessThanOrEqual(100);
      expect(resB.result.score).toBeGreaterThanOrEqual(0);
      expect(resB.result.score).toBeLessThanOrEqual(100);
    });
  });

});
