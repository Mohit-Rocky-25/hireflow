// ============================================================
// ATS Resume Roaster — Canonical Benchmark Fixtures (Phase 07.1)
// Explicitly archives both Benchmark V1 (Prompt Specification)
// and Benchmark V2 (Repository Implementation) with immutable SHA-256 hashes.
// ============================================================

/**
 * Benchmark A — Version 1 (Prompt Specification Draft)
 * Employment: ShipPulse Logistics (June 2025 - Present)
 * Internship: Kinetix (Jan - May 2025)
 */
export const BENCHMARK_A_V1_SHIPPULSE_RESUME = `
Rohan Deshmukh
rohan.deshmukh@example.com | +91 98765 43210 | Bangalore, India
linkedin.com/in/rohandeshmukh | github.com/rohandeshmukh

PROFESSIONAL SUMMARY
Backend Software Engineer with hands-on experience designing and scaling distributed payment services and high-throughput APIs.

EXPERIENCE
Backend Software Engineer | ShipPulse Logistics | June 2025 - Present
- Architected core payment orchestration microservice using Python and FastAPI handling 15,000+ RPS with 45ms p99 latency.
- Implemented PostgreSQL composite B-tree indexes and optimized query plans using EXPLAIN ANALYZE, cutting query response times by 68%.
- Integrated Redis read-through caching layer with cache stampede mitigation, decreasing database read load by 55%.
- Built asynchronous webhook delivery engine with Celery, RabbitMQ, and exponential backoff retry with dead-letter queue.
- Implemented JWT authentication with RBAC and HMAC-SHA256 request signatures for partner banking APIs.
- Authored 140+ Pytest unit and integration test suite achieving 86% branch coverage in GitHub Actions CI/CD pipeline.
- Provisioned Docker containers deployed onto AWS EC2, RDS PostgreSQL, and S3 using Terraform.

Backend Engineering Intern | Kinetix | January 2025 - May 2025
- Assisted in developing RESTful endpoints with Python and Flask for shipment tracking.
- Wrote database migration scripts and SQL queries for PostgreSQL tables.

PROJECTS
High-Throughput Idempotent Ledger | 2025
- Designed double-entry transaction processing ledger with ACID guarantees, row-level database locks, and idempotency keys.

SKILLS
Languages: Python, SQL, Bash
Frameworks & Tools: FastAPI, PostgreSQL, Redis, Celery, RabbitMQ, Docker, GitHub Actions, AWS (EC2, RDS, S3), Pytest, Prometheus
`.trim();

/**
 * Benchmark A — Version 2 (Canonical Repository Frozen Implementation)
 * Employment: PayTech Solutions (2021 - Present)
 */
export const BENCHMARK_A_V2_PAYTECH_RESUME = `
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
`.trim();

export const BENCHMARK_A_JD = `
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
- Required: 3+ years of backend software engineering experience
`.trim();

/**
 * Benchmark B — Version 1 (Prompt Specification Draft)
 * Employment: LendBridge Technologies (April 2024 - Present)
 * Internship: CartSpring (Jan - June 2023)
 * Coursework: BigQuery
 */
export const BENCHMARK_B_V1_LENDBRIDGE_RESUME = `
Ananya Rao
ananya.rao@example.com | +91 91234 56789 | Hyderabad, India
linkedin.com/in/ananyarao | github.com/ananyarao

SUMMARY
Data Engineer with experience building reliable batch and streaming data pipelines.

EXPERIENCE
Data Engineer | LendBridge Technologies | April 2024 - Present
- Developed and maintained 35+ production Airflow DAGs processing over 18 million records daily across AWS S3 and Snowflake data lakehouse.
- Re-architected dbt incremental models, reducing daily pipeline runtime from 94 minutes to 31 minutes.
- Implemented Great Expectations data-quality validation suites and automated data contracts, decreasing data incidents from 14 to 5 per month.
- Established end-to-end data lineage tracking across 50+ data warehouse tables.

Data Engineering Intern | CartSpring | January 2023 - June 2023
- Assisted in building ETL scripts using Python and SQL to ingest clickstream data into Snowflake.

PROJECTS
Real-Time Event Stream Consumer | 2023
- Built personal prototype streaming consumer using Apache Kafka and Python to simulate fraud detection event feeds.

SKILLS
Languages: Python, SQL
Tools & Platforms: Apache Airflow, dbt, Snowflake, AWS S3, Great Expectations, Docker, Git
Coursework: BigQuery, Apache Spark basics
`.trim();

/**
 * Benchmark B — Version 2 (Canonical Repository Frozen Implementation)
 * Employment: DataFlow Analytics (2022 - Present)
 * Internship: CloudScale Labs (2021 - 2022)
 * Coursework: BigQuery, Apache Spark basics
 */
export const BENCHMARK_B_V2_DATAFLOW_RESUME = `
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
`.trim();

export const BENCHMARK_B_JD = `
Data Engineer — Risk & Decisioning
At Northstar Credit, we are building real-time credit risk assessment platforms.

What You'll Do:
- Build and optimize data pipelines using Python, SQL, and Snowflake
- Develop modular transformations with dbt and maintain workflow orchestration using Airflow
- Ensure data reliability, governance, and automated data quality checks
- Required: 3+ years of professional data engineering experience
`.trim();

/**
 * Gate 4 (Phase 07.3): Cryptographic hash ledger for frozen benchmark provenance.
 * Preserves both raw-byte and LF-normalized SHA-256 hashes to guarantee benchmark stability across platforms.
 * Normalization rule: string.trim().replace(/\r\n/g, '\n')
 */
export const BENCHMARK_PROVENANCE_HASHES = {
  // LF Normalized Hashes
  benchmark_a_v1_shippulse_lf: '478ee589c24fe10ce1f5cf19770f77e4aeed4a06ac3d18b4ef4043a9f351692d',
  benchmark_a_v2_paytech_lf: '9d801797f225a2949f91f24aca6f3be38ee65be20c5c8661d9535bf842340096',
  benchmark_a_jd_lf: '9292afd6c56a78fb7e63094bc1bc1bc2825aca16d30b2f79fbcab45121000261',
  benchmark_b_v1_lendbridge_lf: 'a430de9b3a82354a5e7d77d2250eee73648c81e6305e4d993afe7585bcf71220',
  benchmark_b_v2_dataflow_lf: 'f3dfe3ba7af6ffc9f96f9b63271da37f6a6f33369d0e16d16d3a288310f13350',
  benchmark_b_jd_lf: '262a5236ccd2ace6286fe9d65501198585981651a7512e301bdd2e8adaea3850',

  // Raw Hashes (identical under LF newline preservation)
  benchmark_a_v1_shippulse_raw: '478ee589c24fe10ce1f5cf19770f77e4aeed4a06ac3d18b4ef4043a9f351692d',
  benchmark_a_v2_paytech_raw: '9d801797f225a2949f91f24aca6f3be38ee65be20c5c8661d9535bf842340096',
  benchmark_a_jd_raw: '9292afd6c56a78fb7e63094bc1bc1bc2825aca16d30b2f79fbcab45121000261',
  benchmark_b_v1_lendbridge_raw: 'a430de9b3a82354a5e7d77d2250eee73648c81e6305e4d993afe7585bcf71220',
  benchmark_b_v2_dataflow_raw: 'f3dfe3ba7af6ffc9f96f9b63271da37f6a6f33369d0e16d16d3a288310f13350',
  benchmark_b_jd_raw: '262a5236ccd2ace6286fe9d65501198585981651a7512e301bdd2e8adaea3850',

  // Metadata and normalization spec
  normalizationRule: 'string.trim().replace(/\\r\\n/g, "\\n")',
  digestAlgorithm: 'sha256',
  encoding: 'hex',
};
