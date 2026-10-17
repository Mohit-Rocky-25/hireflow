import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_batch_1 import process_brief

# ==============================================================================
# 19. brief-event-driven-saas
# ==============================================================================
b19_data = {
  "id": "brief-event-driven-saas",
  "title": "Multi-Tenant B2B SaaS Backend with Row-Level Security & Outbox Messaging",
  "domain": "Full-Stack Web",
  "difficulty": "ADVANCED",
  "project_types": ["API/backend service", "Distributed systems"],
  "problem": "Modern enterprise B2B SaaS platforms must enforce strict data isolation between rival corporate tenants, support asynchronous inter-service communication without data loss, and deliver outbound customer webhooks reliably. Naive application-level WHERE tenant_id filtering risks catastrophic data leakage if a single developer forgets a clause, and direct HTTP calls between microservices introduce cascading downtime. This project constructs an enterprise multi-tenant backend in TypeScript and Node.js using PostgreSQL Row-Level Security (RLS) to enforce database-level tenant isolation, Kafka event streaming with the Transactional Outbox pattern to guarantee at-least-once message delivery, Redis for tenant rate quotas, and an idempotent webhook delivery worker with exponential backoff retries.",
  "use_cases": [
    "Enterprise B2B SaaS products requiring strict compliance-certified tenant data boundaries",
    "Usage-metered cloud platforms aggregating customer API consumption for billing pipelines",
    "Developer webhook delivery backends guaranteeing reliable event delivery to external customer systems"
  ],
  "hard_parts": [
    "Enforcing PostgreSQL Row-Level Security policies dynamically bound to active connection tenant session variables",
    "Implementing the Transactional Outbox pattern to atomically commit database changes and publish Kafka events without distributed transactions",
    "Preventing cross-tenant noisy-neighbor starvation through fair-share Redis rate limiting and concurrency throttling",
    "Managing reliable webhook dispatching with HMAC signature verification, exponential backoff, and dead-letter queue routing"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating tenant middleware, outbox workers, Kafka consumers, and webhook dispatchers",
    "Automated cross-tenant penetration test asserting zero cross-tenant row leakage across 1,000 concurrent database queries",
    "Anti-fake verification script creating dynamic tenant accounts, dispatching outbox messages, and asserting strict boundary isolation"
  ],
  "job_families": [
    "Backend SaaS Engineer",
    "Platform Architect",
    "Distributed Systems Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language for SaaS API handlers, outbox workers, and event schemas"},
    {"tool": "Node.js", "role": "asynchronous JavaScript runtime hosting API server and background consumers"},
    {"tool": "PostgreSQL", "role": "relational database enforcing multi-tenant isolation via Row-Level Security and storing outbox tables"},
    {"tool": "Kafka", "role": "distributed event streaming broker transmitting domain events between services"},
    {"tool": "Redis", "role": "in-memory data store managing tenant rate quotas and webhook retry deduplication"}
  ],
  "architecture": {
    "components": [
      {
        "name": "PostgreSQL Multi-Tenant RLS Store",
        "tools_used": ["PostgreSQL", "TypeScript"],
        "purpose": "Enforces tenant data boundaries via database-level Row-Level Security policies and session variables"
      },
      {
        "name": "Transactional Outbox Publisher",
        "tools_used": ["PostgreSQL", "Kafka", "TypeScript"],
        "purpose": "Atomically polls outbox table rows within database transactions and publishes domain events to Kafka topics"
      },
      {
        "name": "Tenant Context & Ingress Middleware",
        "tools_used": ["Node.js", "TypeScript", "Redis"],
        "purpose": "Validates tenant JWT claims, sets database session variables, and enforces per-tenant Redis rate quotas"
      },
      {
        "name": "Metered Usage Aggregator",
        "tools_used": ["Kafka", "PostgreSQL", "TypeScript"],
        "purpose": "Consumes domain events from Kafka and aggregates customer resource consumption into billing ledgers"
      },
      {
        "name": "Reliable Webhook Dispatcher",
        "tools_used": ["Node.js", "Redis", "TypeScript"],
        "purpose": "Signs and dispatches customer webhooks with HMAC-SHA256, handling retries and routing failures to DLQ"
      }
    ],
    "data_flow": "Incoming client HTTP requests pass through Tenant Ingress Middleware; tenant ID is validated and injected into PostgreSQL session config via SET LOCAL app.current_tenant_id; CRUD queries execute with RLS automatically restricting rows to active tenant; mutations atomically insert domain events into an outbox table within the same transaction; the Transactional Outbox Publisher polls pending outbox entries and publishes them to Kafka; the Metered Usage Aggregator consumes Kafka events to calculate usage; the Webhook Dispatcher signs and posts payloads to customer endpoints with exponential backoff.",
    "enforcement_mechanism": "PostgreSQL Row-Level Security policies rejecting queries lacking valid tenant context; Redis token buckets throttling noisy-neighbor tenant spikes."
  },
  "targets": [
    {
      "metric": "Cross-Tenant Data Leakage Rate",
      "method": "Penetration test suite executing 1,000 unauthorized cross-tenant queries against active database session",
      "input": "1,000 cross-tenant read/write queries dispatched using tenant A credentials targeting tenant B records",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+, Node.js 18+",
      "minimum_pass": "0 unauthorized records accessed across 1,000 test requests with 0 security escapes",
      "target": "0 unauthorized records accessed across 1,000 test requests with 0 security escapes",
      "report": "Cross-tenant security penetration test summary report"
    },
    {
      "metric": "Transactional Outbox Publishing Latency",
      "method": "Duration between database transaction commit and message publication confirmation in Kafka",
      "input": "5,000 database mutations processed through transactional outbox polling loop",
      "environment": "Standard 4-core local CPU, local Kafka broker and PostgreSQL instance",
      "minimum_pass": "Average outbox-to-broker latency is < 250 milliseconds",
      "target": "Average outbox-to-broker latency is < 95 milliseconds",
      "report": "Outbox pipeline latency benchmark log"
    },
    {
      "metric": "Webhook Dispatch Delivery Success Rate",
      "method": "Automated delivery benchmark across 1,000 customer webhook payloads with 10% injected endpoint dropouts",
      "input": "1,000 webhook payloads dispatched to mock customer endpoints with injected intermittent 503 errors",
      "environment": "Standard 4-core local CPU, Node.js 18+, Redis 7",
      "minimum_pass": "Delivery success rate exceeds 95% following exponential backoff retries",
      "target": "Delivery success rate exceeds 99% following exponential backoff retries",
      "report": "Webhook dispatcher execution report detailing delivery attempts and DLQ transfers"
    }
  ],
  "skills": ["TypeScript", "Node.js", "PostgreSQL", "Kafka", "Redis", "Multi-Tenancy", "Distributed Systems"],
  "starter_input": {
    "spec": "Multi-tenant database schema with RLS policies, sample tenant profiles, and domain event JSON schema.",
    "size": "50 tenant accounts with 25,000 customer records and 5,000 simulated domain events",
    "seeded_cases": "Cross-tenant SQL injection attempts, outbox polling crash scenarios, and dead-letter webhook endpoints",
    "label_source": "Deterministic penetration test suite asserting exact HTTP 403 / empty result sets on cross-tenant probes",
    "personal_data_policy": "Strictly mock synthetic enterprise tenant profiles and fake business entities; no real personal data used"
  },
  "components": [
    {"name": "PostgreSQL Multi-Tenant Schema & RLS Policy Manager", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Transactional Outbox Engine & Kafka Event Publisher", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Multi-Tenant JWT Context & Ingress Middleware", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Metered Billing & Usage Aggregation Worker", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Reliable Webhook Dispatcher with Dead Letter Queue", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "High-Throughput Ingestion & Multi-Tenant Isolation Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "SaaS Security Model & Outbox Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Stripe usage-based billing meter event ingestion and automatic customer invoice generation",
      "Dynamic tenant schema migration worker with zero-downtime Blue-Green database deployments"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "PostgreSQL Row-Level Security & Multi-Tenancy Context Ingress in TypeScript",
      "hours": 10,
      "done_criterion": "PostgreSQL RLS policies enforce tenant boundaries; middleware binds tenant context from JWT claims."
    },
    {
      "name": "Transactional Outbox Pattern & Kafka Event Streaming in Distributed Systems",
      "hours": 10,
      "done_criterion": "Mutations write outbox records atomically; publisher streams events to Kafka in < 250ms."
    },
    {
      "name": "Metered Usage Aggregation & Reliable Webhook Delivery Engine",
      "hours": 10,
      "done_criterion": "Worker aggregates usage from Kafka; webhook dispatcher delivers payloads with HMAC signatures and retries."
    },
    {
      "name": "Cross-Tenant Isolation Verification, Load Benchmark & Docs",
      "hours": 9,
      "done_criterion": "Security test confirms 0 cross-tenant leaks across 1,000 queries; benchmark passes; architecture docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, asynchronous Node.js, and relational database modeling",
    "Understanding of PostgreSQL row-level security, event streaming concepts, and REST API architectures"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and I/O bound application services)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+, Docker 24+, and Docker Compose installed",
    "fallback_path": "SQLite with schema-level tenant tables and in-memory event bus if Docker Kafka/Postgres cannot run"
  },
  "riskiest_component": {
    "name": "Database Connection Pool Exhaustion from Unset RLS Session Variables",
    "fallback": "Enforce automated connection checkout hooks resetting session variables upon connection return"
  },
  "deliverables": [
    "Git repository containing TypeScript SaaS backend, database migrations, and Kafka outbox publisher",
    "Docker Compose environment spinning up PostgreSQL, Kafka, and Redis services",
    "Automated cross-tenant penetration test suite verifying Row-Level Security boundary enforcement",
    "Screener verification script executing automated benchmark and dynamic tenant isolation test in under 2 minutes"
  ],
  "out_of_scope": [
    "Complex frontend micro-frontend single-spa portal implementations",
    "Multi-region geo-replicated active-active database clusters",
    "PCI-DSS Level 1 direct credit card vaulting infrastructure"
  ],
  "safety_note": None,
  "resources": [
    "PostgreSQL Documentation on Row Security Policies and Session Variables",
    "Transactional Outbox Pattern Architecture Specification (Chris Richardson)",
    "Standard Webhooks Security and HMAC-SHA256 Signing Specification"
  ],
  "rubric": [
    {
      "input": "Penetration test suite attempting 1,000 cross-tenant unauthorized reads",
      "action": "npm run test:penetration",
      "expected_result": "PostgreSQL Row-Level Security blocks all unauthorized tenant access queries",
      "evidence_location": "Terminal test execution output log",
      "pass_criterion": "1,000 of 1,000 penetration checks pass with 0 unauthorized records exposed and exit code 0",
      "kind": "normal"
    },
    {
      "input": "5,000 database mutations processed through outbox worker loop",
      "action": "npm run bench:outbox",
      "expected_result": "Transactional outbox publishes events to Kafka with average latency < 250 milliseconds",
      "evidence_location": "Outbox benchmark summary table and reports/outbox_latency.json",
      "pass_criterion": "Average outbox latency is < 250 milliseconds",
      "kind": "normal"
    },
    {
      "input": "1,000 webhooks dispatched to simulated unstable customer endpoints",
      "action": "npm run test:webhooks",
      "expected_result": "Dispatcher retries failed deliveries using exponential backoff, achieving > 95% success",
      "evidence_location": "Webhook execution report log",
      "pass_criterion": "Delivery success rate exceeds 95% with failed items placed into DLQ",
      "kind": "normal"
    },
    {
      "input": "Rapid burst of 100 requests from single tenant exceeding quota limit",
      "action": "npm run test:ratelimit -- --tenant tenant-abc --requests 100",
      "expected_result": "Redis rate limiter throttles excess requests and returns HTTP 429",
      "evidence_location": "HTTP response status log",
      "pass_criterion": "Responses transition to HTTP 429 once tenant quota threshold is reached",
      "kind": "normal"
    },
    {
      "input": "Two dynamic tenant accounts (Tenant-Dynamic-X and Tenant-Dynamic-Y) provisioned at runtime",
      "action": "node scripts/verify_dynamic_multitenancy.js --tenantA Tenant-Dynamic-X --tenantB Tenant-Dynamic-Y",
      "expected_result": "Tenant X creates private resource; Tenant Y attempts direct query by ID and receives empty result set",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Query by Tenant Y returns null/404 and exit code is 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected multi-tenant enterprise SaaS backend in TypeScript and Node.js with PostgreSQL Row-Level Security; enforced strict tenant isolation without data leakage across [QUERY_COUNT] penetration queries, and guaranteed event delivery via transactional outbox messaging with sub-[OUTBOX_LATENCY] latency.",
    "claims": [
      {
        "text": "enforced strict tenant isolation without data leakage across [QUERY_COUNT] penetration queries",
        "rubric_indexes": [0]
      },
      {
        "text": "guaranteed event delivery via transactional outbox messaging with sub-[OUTBOX_LATENCY] latency",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "global multi-region active-active database clustering or direct PCI-DSS card vaulting"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a multi-tenant B2B SaaS backend in TypeScript/Node.js with PostgreSQL RLS, transactional outbox to Kafka, and reliable webhooks.",
    "q2": "Target users: SaaS backend engineers, platform architects, and cloud infrastructure developers.",
    "q3": "3 use cases: enterprise B2B SaaS data isolation, metered cloud usage billing, and customer webhook delivery backends.",
    "q4": "Stated hours: 39 hours. Calculated bottom-up: 34 component hours * 1.15 buffer = 39.1 -> 39 hours. Advanced level.",
    "q5": "Hard parts: dynamic PostgreSQL RLS session configuration, transactional outbox atomicity, fair-share rate limiting, and reliable webhook backoff.",
    "q6": "Starter input: 50 tenant profiles, 25,000 customer records, and 5,000 simulated events. Synthetic profiles only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: SQLite and in-memory event bus.",
    "q8": "Riskiest component: Connection pool exhaustion from unset RLS session variables. Fallback: automated connection checkout/reset hooks.",
    "q9": "Potential faking: hardcoded tenant query filtering. Anti-fake check 5 provisions two dynamic tenants at runtime and asserts boundary rejection.",
    "q10": "Safety/ethics: Safe; synthetic business profiles and mock customer accounts only."
  }
}

b19_old_diag = """
- **Old Title**: Multi-Tenant SaaS Backend with Event-Driven Architecture
- **Domain**: Full-Stack Web
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of core CRUD implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (extreme employer marketing duplication: 'Zoho, top tech platforms, top tech platforms, top tech platforms', 'commands senior engineering titles')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating multi-tenant isolation, outbox publishing, and webhook delivery.
2. **Extreme marketing duplication**:
   > "Every B2B SaaS product in India  Zoho, top tech platforms, top tech platforms, top tech platforms  faces multi-tenancy challenges... commands senior engineering titles at B2B software companies."
"""

b19_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using TypeScript, Node.js, and Docker Compose at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Outbox latency (< 250ms), zero cross-tenant leakage (0 in 1,000), and webhook success (> 95%) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. In-memory event bus and SQLite tenant tables if Docker cannot be started.",
    "Can test data be created in minutes?": "YES. Synthetic 50-tenant configuration and test dataset generator included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full penetration suite and dynamic tenant check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Cross-tenant leakage rate, outbox publishing latency, and webhook delivery success are unique to multi-tenant event-driven backends.",
    "Is every bullet claim verified by rubric?": "YES. Tenant isolation verified by Check 0; outbox delivery verified by Check 1.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] creates two dynamic tenants at runtime and asserts cross-tenant resource rejection.",
    "Are all terms accurate?": "YES. Accurately covers PostgreSQL RLS, transactional outbox pattern, Kafka event streaming, and HMAC webhooks.",
    "Does problem statement promise only what is verified?": "YES. RLS isolation, outbox publisher, usage aggregation, and reliable webhooks are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic business entities and mock customer profiles.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering dynamic RLS session bindings, outbox atomicity, fair-share rate quotas, and reliable webhooks."
}

b19_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved Stripe meter billing and blue-green schema migrations to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic multi-tenant metrics (cross-tenant leakage rate, outbox publishing latency, and webhook delivery rate).
- Removed Banned Content: Removed 'Zoho, top tech platforms' quadruple duplicate marketing and claims about commanding senior titles.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic tenant test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [QUERY_COUNT] and [OUTBOX_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 20. brief-event-recon
# ==============================================================================
b20_data = {
  "id": "brief-event-recon",
  "title": "Event-Driven Payment Reconciliation Engine with Double-Entry Ledger",
  "domain": "FinTech Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Distributed systems", "Data pipeline/ETL"],
  "problem": "Financial platforms process millions of money movements across payment gateways, banking settlement rails, and merchant accounts. Webhook packet loss, bank batch file settlement delays, currency rounding, and timezone drift cause constant transaction discrepancies. Manual reconciliation is slow and prone to errors. This project builds an automated, event-driven payment reconciliation engine in Python and FastAPI. The system processes payment gateway webhook streams from Kafka, parses daily bank settlement CSV files, enforces double-entry ledger accounting invariants in PostgreSQL, executes three-way match algorithms across transactions, classifies breaks into distinct categories (unmatched settlement, fee drift, timing discrepancy), and generates audit-ready financial break reports.",
  "use_cases": [
    "FinTech payment processor daily settlement reconciliation against banking partner clearing files",
    "E-commerce merchant multi-gateway audit verifying Stripe, Adyen, and PayPal payout accuracy",
    "Lending platform loan disbursement and repayment tracking with automated discrepancy detection"
  ],
  "hard_parts": [
    "Enforcing immutable double-entry ledger accounting invariants (Assets = Liabilities + Equity) across high concurrency",
    "Resolving three-way matching between asynchronous gateway webhooks, internal ledger entries, and delayed bank clearing files",
    "Classifying financial discrepancies into actionable break buckets (unmatched settlement, fee mismatch, timing drift)",
    "Ensuring idempotent event ingestion so replayed Kafka webhooks never create duplicate ledger journal postings"
  ],
  "screener_signals": [
    "Clean Python implementation separating double-entry ledger, Kafka consumers, reconciliation matchers, and break reporters",
    "Automated reconciliation test suite with 25 intentionally seeded financial break scenarios verifying 100% detection",
    "Anti-fake verification script injecting a dynamic unrecorded settlement row and asserting exact discrepancy flag generation"
  ],
  "job_families": [
    "FinTech Software Engineer",
    "Core Ledger Backend Engineer",
    "Financial Data Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary programming language for ledger logic, settlement parsing, and reconciliation"},
    {"tool": "Kafka", "role": "event streaming platform delivering gateway payment event webhooks"},
    {"tool": "PostgreSQL", "role": "relational database storing immutable double-entry ledger journals and transactions"},
    {"tool": "FastAPI", "role": "web framework serving reconciliation status APIs and audit report endpoints"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Double-Entry General Ledger Core",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Enforces immutable debit/credit journal entries and guarantees ledger balance invariant integrity"
      },
      {
        "name": "Kafka Webhook Ingestion Consumer",
        "tools_used": ["Python", "Kafka"],
        "purpose": "Consumes gateway payment webhooks idempotently, preventing duplicate transaction recordings"
      },
      {
        "name": "Bank Settlement File Parser",
        "tools_used": ["Python"],
        "purpose": "Parses structured daily bank clearing CSV/BAI2 settlement records and normalizes payout line items"
      },
      {
        "name": "Three-Way Reconciliation Matcher",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Executes rule-based matching across gateway events, internal orders, and bank settlement deposits"
      },
      {
        "name": "Financial Break Classifier & Reporter",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Categorizes unmatched records into fee, timing, and missing break buckets, exposing audit endpoints"
      }
    ],
    "data_flow": "Payment gateway webhooks arrive via Kafka; the Ingestion Consumer validates idempotency and posts balanced debit/credit entries to the Double-Entry General Ledger; daily bank settlement CSV files are ingested by the Settlement Parser; the Three-Way Reconciliation Matcher links internal order IDs, gateway transaction references, and bank settlement lines; matching records are marked RECONCILED; mismatched records are categorized by the Break Classifier into fee variances, timing delays, or missing settlements; audit reports and summary metrics are exposed via FastAPI.",
    "enforcement_mechanism": "PostgreSQL database check constraints guaranteeing zero debit/credit imbalance per journal transaction; idempotent event keys preventing double posting."
  },
  "targets": [
    {
      "metric": "Seeded Financial Break Detection Rate",
      "method": "Reconciliation engine execution against historical financial batch with 25 seeded monetary discrepancies",
      "input": "Batch of 50,000 transactions containing 25 seeded breaks (10 fee drifts, 10 missing settlements, 5 duplicate webhooks)",
      "environment": "Standard 4-core local CPU, Python 3.11, PostgreSQL 15+",
      "minimum_pass": "Detection of 25 of 25 seeded breaks with 0 false negatives",
      "target": "Detection of 25 of 25 seeded breaks with 0 false negatives",
      "report": "Financial reconciliation audit log detailing detected break categories and transaction references"
    },
    {
      "metric": "Batch Reconciliation Execution Throughput",
      "method": "Processing throughput to ingest, normalize, and reconcile three-way financial transactions",
      "input": "100,000 transactions evaluated against 100,000 bank settlement records",
      "environment": "Standard 4-core local CPU, Python 3.11, PostgreSQL 15+",
      "minimum_pass": "Throughput exceeds 5,000 transactions/sec",
      "target": "Throughput exceeds 12,000 transactions/sec",
      "report": "Reconciliation benchmark performance report"
    },
    {
      "metric": "Double-Entry Ledger Balance Invariant Violation Rate",
      "method": "Integrity validation verifying total debits equal total credits across all posted journal entries",
      "input": "100,000 posted financial journal entries evaluated after heavy concurrent execution",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+",
      "minimum_pass": "0 ledger balance invariant violations across journal transactions",
      "target": "0 ledger balance invariant violations across journal transactions",
      "report": "Trial balance accounting verification report confirming zero variance"
    }
  ],
  "skills": ["Python", "Kafka", "PostgreSQL", "FastAPI", "FinTech", "Distributed Systems", "Data Pipelines"],
  "starter_input": {
    "spec": "Sample gateway webhook event schema, bank clearing settlement CSV specification, and double-entry ledger chart of accounts.",
    "size": "50,000 synthetic transaction records, 48,000 bank settlement lines, and 25 intentionally seeded discrepancies",
    "seeded_cases": "Uncaptured gateway authorisations, foreign exchange fee variances, missing bank settlement lines, and replay webhooks",
    "label_source": "Deterministic reconciliation ground truth manifest mapping transaction IDs to expected break classifications",
    "personal_data_policy": "Strictly mock synthetic financial records and simulated account numbers; zero real banking or cardholder data used"
  },
  "components": [
    {"name": "Double-Entry General Ledger Core & Invariant Validator", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Kafka Gateway Webhook Ingestion & Idempotent Consumer", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Bank Settlement Batch Parser & Normalizer", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Three-Way Reconciliation Matching Engine", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "Break Classifier & Financial Exception Manager", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Discrepancy Injection Test Harness & Audit Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Ledger State Flow Diagram & Accounting Runbook", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Automated dispute resolution and chargeback adjustment workflow with refund ledger reversal",
      "High-throughput parallel reconciliation worker using DuckDB for multi-million row settlement files"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Double-Entry Ledger Engine & Invariant Enforcement in Python FinTech",
      "hours": 10,
      "done_criterion": "General ledger stores balanced entries; database constraints reject any unbalanced transaction."
    },
    {
      "name": "Kafka Payment Webhook Consumer & Bank Settlement File Parser in Data Pipelines",
      "hours": 10,
      "done_criterion": "Consumer ingests webhooks idempotently; parser normalizes daily bank CSV settlement records."
    },
    {
      "name": "Three-Way Reconciliation Algorithm & Discrepancy Break Classifier in Distributed Systems",
      "hours": 10,
      "done_criterion": "Matching engine executes 3-way match, classifying unmatched rows into fee, timing, and missing breaks."
    },
    {
      "name": "Injected Break Detection Benchmark, Audit Reports & Docs",
      "hours": 9,
      "done_criterion": "Engine detects 25 of 25 seeded breaks at > 5,000 tx/s; zero ledger violations; audit docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python, SQL relational databases, and data manipulation libraries (Pandas)",
    "Understanding of double-entry accounting fundamentals (debits, credits, trial balance) and event-driven patterns"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound data processing and SQL execution)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and PostgreSQL 15+ installed",
    "fallback_path": "SQLite in-memory database with POSIX CSV file simulation if Docker/Kafka cannot be started"
  },
  "riskiest_component": {
    "name": "Floating Point Rounding Errors Causing False Ledger Break Alerts",
    "fallback": "Enforce integer minor currency units (cents/paise) or Python Decimal throughout all calculations"
  },
  "deliverables": [
    "Git repository containing Python reconciliation engine, double-entry ledger models, and FastAPI app",
    "Deterministic financial discrepancy test generator injecting known break scenarios",
    "Automated reconciliation audit harness outputting trial balance and break summaries",
    "Screener verification script executing automated benchmark and dynamic break test in under 2 minutes"
  ],
  "out_of_scope": [
    "Direct SWIFT MT101 / ISO 20022 inter-bank wire clearing integration",
    "Automated banking credit underwriting and loan origination decisioning",
    "Live physical cash vault counting and ATM network reconciliation"
  ],
  "safety_note": "This project processes synthetic financial records and mock transaction identifiers for educational testing. It does not interface with live banking payment rails, initiate real fund transfers, or process sensitive cardholder payment details.",
  "resources": [
    "Martin Fowler: Accounting Patterns and Double-Entry Ledger Principles",
    "Financial Data Reconciliation Architecture and Break Management Standards",
    "FastAPI and PostgreSQL High-Performance Ledger Design Documentation"
  ],
  "rubric": [
    {
      "input": "Financial dataset of 50,000 transactions with 25 seeded discrepancy breaks",
      "action": "python -m recon_engine.reconcile --transactions data/tx.json --bank data/settlement.csv",
      "expected_result": "Engine detects all 25 seeded breaks and outputs categorized discrepancy breakdown",
      "evidence_location": "Terminal execution output log and reports/recon_summary.json",
      "pass_criterion": "25 of 25 seeded breaks detected with zero false negatives and exit code 0",
      "kind": "normal"
    },
    {
      "input": "100,000 transactions evaluated against 100,000 settlement records",
      "action": "python scripts/benchmark_recon_speed.py --count 100000",
      "expected_result": "Reconciliation engine achieves throughput exceeding 5,000 transactions/sec",
      "evidence_location": "Throughput benchmark console table",
      "pass_criterion": "Measured throughput exceeds 5,000 transactions/sec",
      "kind": "normal"
    },
    {
      "input": "Trial balance accounting verification across all posted transactions",
      "action": "python -m recon_engine.audit_ledger",
      "expected_result": "Sum of all debits equals sum of all credits with zero balance variance",
      "evidence_location": "Audit ledger console output log",
      "pass_criterion": "Total debits minus total credits equals 0.00 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "FastAPI audit report request for discrepancy summary",
      "action": "curl http://localhost:8000/api/reports/breaks",
      "expected_result": "API returns JSON detailing break buckets (fee_variance, missing_settlement, timing_delay)",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 with break categories matching seeded counts",
      "kind": "normal"
    },
    {
      "input": "Dynamic unrecorded bank deposit line item ($12,345.67) injected into clearing file at runtime",
      "action": "python scripts/verify_dynamic_recon.py --amount 12345.67 --bank-ref DYNAMIC_REF_77",
      "expected_result": "Reconciliation engine flags unrecorded deposit as UNMATCHED_BANK_SETTLEMENT break",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Engine creates break record with reference DYNAMIC_REF_77 and exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected event-driven payment reconciliation engine in Python and FastAPI with PostgreSQL double-entry ledger; detected [BREAK_COUNT] of [TOTAL_BREAKS] seeded financial discrepancies with verified ledger balance invariant integrity, and achieved [RECON_THROUGHPUT] reconciliation throughput.",
    "claims": [
      {
        "text": "detected [BREAK_COUNT] of [TOTAL_BREAKS] seeded financial discrepancies with verified ledger balance invariant integrity",
        "rubric_indexes": [0, 2]
      },
      {
        "text": "achieved [RECON_THROUGHPUT] reconciliation throughput",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "direct live SWIFT inter-bank clearing integration or real-money banking custody"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: an automated event-driven payment reconciliation engine in Python with double-entry ledger, Kafka webhook consumer, and break classifier.",
    "q2": "Target users: FinTech engineers, core banking platform developers, and financial data engineers.",
    "q3": "3 use cases: daily payment gateway settlement reconciliation, multi-gateway merchant audit, and lending repayment reconciliation.",
    "q4": "Stated hours: 39 hours. Calculated bottom-up: 34 component hours * 1.15 buffer = 39.1 -> 39 hours. Advanced level.",
    "q5": "Hard parts: double-entry ledger accounting invariants, three-way matching logic, financial break classification, and idempotent webhook ingestion.",
    "q6": "Starter input: 50,000 transactions, 48,000 settlement lines, and 25 seeded breaks. Synthetic records only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: SQLite in-memory mode.",
    "q8": "Riskiest component: Floating-point currency rounding errors. Fallback: integer cents/paise or Python Decimal throughout.",
    "q9": "Potential faking: hardcoded break reports. Anti-fake check 5 injects dynamic deposit line at runtime and asserts UNMATCHED break flag.",
    "q10": "Safety/ethics: Safe; synthetic financial records only, no live banking rails or real funds."
  }
}

b20_old_diag = """
- **Old Title**: Event-Driven Payment Reconciliation Engine
- **Domain**: FinTech Engineering
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of core scripting; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (extreme employer marketing duplication: 'top tech platforms, top tech platforms, top tech platforms, top tech platforms', 'massive differentiation signal')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than evaluating financial break detection, ledger balance integrity, and batch reconciliation throughput.
2. **Extreme marketing duplication**:
   > "Every payment company in India  top tech platforms, top tech platforms, top tech platforms, top tech platforms  runs reconciliation systems... a massive differentiation signal for FinTech roles at top tech platforms, top tech platforms, top tech platforms..."
"""

b20_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, Kafka, and PostgreSQL at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Seeded break detection (25 of 25), reconciliation throughput (> 5,000 tx/s), and ledger balance integrity (0 errors) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. SQLite in-memory execution with POSIX CSV files if Docker/Kafka is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 50,000 transaction dataset with seeded discrepancies provided via generator.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full reconciliation suite and dynamic break check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Break detection accuracy, reconciliation throughput, and double-entry trial balance integrity are unique to reconciliation engines.",
    "Is every bullet claim verified by rubric?": "YES. Discrepancy detection verified by Check 0; throughput verified by Check 1; ledger integrity verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic unrecorded bank settlement line at runtime and asserts UNMATCHED break flag.",
    "Are all terms accurate?": "YES. Accurately covers double-entry ledger bookkeeping, three-way matching, break classification, and idempotent Kafka webhooks.",
    "Does problem statement promise only what is verified?": "YES. Ledger engine, webhook consumer, settlement parser, 3-way matcher, and break reporter are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Safety note confirms purely synthetic educational data, zero live banking integration.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering double-entry accounting invariants, 3-way reconciliation, break classification, and idempotent event ingestion."
}

b20_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved chargeback adjustment workflows and DuckDB parallel reconciliation to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic financial reconciliation metrics (seeded break detection rate, batch throughput, and ledger balance invariant rate).
- Removed Banned Content: Removed 'top tech platforms' quadruple duplicate marketing and claims about massive career differentiation signals.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic break check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [BREAK_COUNT], [TOTAL_BREAKS], and [RECON_THROUGHPUT] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 21. brief-event-sourcing
# ==============================================================================
b21_data = {
  "id": "brief-event-sourcing",
  "title": "Event Sourcing & CQRS Core Engine with Optimistic Concurrency Control",
  "domain": "Distributed Systems",
  "difficulty": "ADVANCED",
  "project_types": ["Distributed systems", "Systems/low-level/networking"],
  "problem": "Traditional relational CRUD architectures mutate state in-place, permanently discarding historical context regarding how and why data changed. Debugging concurrency race conditions, proving complete regulatory audit trails, and executing temporal queries become impossible once previous states are overwritten. This project implements a production Event Sourcing and Command Query Responsibility Segregation (CQRS) framework in TypeScript and Node.js with PostgreSQL and Kafka. The system records all domain state changes as an immutable append-only sequence of domain events, enforces optimistic concurrency control via sequence revision checking, creates periodic aggregate snapshots to bound replay time, projects domain events into query-optimized read models, and exposes a temporal query engine capable of replaying entity state to any historical millisecond.",
  "use_cases": [
    "Financial banking systems requiring immutable audit trails of every balance-impacting event",
    "Supply chain logistics platforms tracking historical ownership transfers and custody changes",
    "Complex domain-driven design applications requiring historical time-travel state reconstruction"
  ],
  "hard_parts": [
    "Enforcing optimistic concurrency control in the append-only event store to prevent concurrent write split-brain",
    "Maintaining exactly-once projection updates from asynchronous Kafka event streams into query read models",
    "Designing aggregate snapshotting and event replay mechanisms that reconstruct state in sub-10 milliseconds",
    "Handling temporal time-travel queries by projecting domain events up to an arbitrary historical timestamp"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating event store, aggregate roots, projections, and CQRS commands",
    "Automated concurrency race test asserting 100% collision rejection when two writes target identical aggregate revisions",
    "Anti-fake verification script appending dynamic events, executing historical replay, and asserting exact state reconstruction"
  ],
  "job_families": [
    "Distributed Systems Engineer",
    "Senior Backend Architect",
    "Core Platform Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language for aggregate models, event definitions, and command handlers"},
    {"tool": "Node.js", "role": "runtime hosting CQRS command API and background projection workers"},
    {"tool": "PostgreSQL", "role": "append-only immutable event store and read-model projection relational database"},
    {"tool": "Kafka", "role": "distributed event streaming broker transmitting domain events to projection subscribers"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Append-Only Event Store",
        "tools_used": ["PostgreSQL", "TypeScript"],
        "purpose": "Persists immutable domain events with unique sequence revisions, enforcing optimistic concurrency"
      },
      {
        "name": "Aggregate Root Base & Concurrency Guard",
        "tools_used": ["TypeScript"],
        "purpose": "Encapsulates business domain invariants, handles command dispatch, and applies internal event handlers"
      },
      {
        "name": "Kafka Event Streaming Dispatcher",
        "tools_used": ["Kafka", "TypeScript"],
        "purpose": "Publishes newly appended domain events from event store to Kafka topics in strict sequence order"
      },
      {
        "name": "Read-Model Projection Worker",
        "tools_used": ["Node.js", "PostgreSQL", "Kafka"],
        "purpose": "Consumes domain events from Kafka and builds materialized, denormalized read views for fast queries"
      },
      {
        "name": "Snapshot & Temporal Replay Engine",
        "tools_used": ["TypeScript", "PostgreSQL"],
        "purpose": "Creates aggregate state snapshots every 100 events and reconstructs entity state at any point in time"
      }
    ],
    "data_flow": "Commands arrive at the CQRS Command Gateway; the target Aggregate Root loads its latest snapshot and replays subsequent events from the Append-Only Event Store; the aggregate validates business invariants and produces new domain events; the Event Store attempts to commit events with the expected aggregate version; if a concurrent write modified the version, an OptimisticConcurrencyError terminates the transaction; on success, the Kafka Dispatcher publishes committed events; the Read-Model Projection Worker updates denormalized tables; temporal queries reconstruct historical state by replaying events up to the requested timestamp.",
    "enforcement_mechanism": "Unique compound database constraint on (aggregate_id, version) rejecting concurrent race writes; immutable event tables preventing updates or deletes."
  },
  "targets": [
    {
      "metric": "Optimistic Concurrency Collision Interception Rate",
      "method": "Stress test issuing 100 concurrent competing mutation commands against an identical aggregate instance",
      "input": "100 concurrent HTTP commands issued simultaneously to append mutations to a single entity instance",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+, Node.js 18+",
      "minimum_pass": "Exactly 1 command succeeds and exactly 99 commands fail with OptimisticConcurrencyError",
      "target": "Exactly 1 command succeeds and exactly 99 commands fail with OptimisticConcurrencyError",
      "report": "Concurrency conflict benchmark log verifying exact version increment count"
    },
    {
      "metric": "Aggregate State Rehydration Latency",
      "method": "Duration to load snapshot and replay remaining events to restore active aggregate state in memory",
      "input": "Aggregate entity with 1,000 historical events and periodic snapshot taken at event 900",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+, Node.js 18+",
      "minimum_pass": "Average rehydration latency is < 15 milliseconds",
      "target": "Average rehydration latency is < 4 milliseconds",
      "report": "Rehydration timing summary log detailing snapshot load versus event replay durations"
    },
    {
      "metric": "Read-Model Projection Eventual Consistency Lag",
      "method": "Duration from event store commit confirmation until read-model projection table reflects updated state",
      "input": "5,000 sequential domain events processed through Kafka projection pipeline",
      "environment": "Standard 4-core local CPU, local Kafka broker and PostgreSQL instance",
      "minimum_pass": "Average projection lag is < 150 milliseconds",
      "target": "Average projection lag is < 50 milliseconds",
      "report": "CQRS projection lag benchmark report"
    }
  ],
  "skills": ["TypeScript", "Node.js", "PostgreSQL", "Kafka", "Event Sourcing", "CQRS", "Distributed Systems"],
  "starter_input": {
    "spec": "Event sourcing schema specification (events table, snapshots table, read projections), and sample bank account domain aggregate.",
    "size": "500 simulated aggregate entities with 50,000 historical domain events across 5 domain event types",
    "seeded_cases": "Simultaneous write collisions on identical version, corrupted event payload schemas, and temporal replay timestamp boundaries",
    "label_source": "Deterministic aggregate event history fixture mapping expected balance states to specific timestamp points",
    "personal_data_policy": "Strictly mock synthetic financial aggregates and fake account numbers; no real personal data used"
  },
  "components": [
    {"name": "Append-Only Event Store & Revision Manager", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Aggregate Root Base & Optimistic Concurrency Guard", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Asynchronous Read-Model Projection Worker", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Event Snapshotting & Replay Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "CQRS Command Gateway & Temporal Query API", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Concurrency Conflict & Event Replay Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Event Sourcing Architecture Diagram & CQRS Protocol Docs", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Distributed event store replication with multi-partition Kafka ordering guarantees",
      "Schema evolution upcasting engine transforming legacy event payloads into current domain versions"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Append-Only Event Store & Optimistic Concurrency in TypeScript Distributed Systems",
      "hours": 10,
      "done_criterion": "PostgreSQL event store enforces unique version constraints; concurrency conflicts throw cleanly."
    },
    {
      "name": "Aggregate Rehydration, Event Replay & Snapshot Engine in Event Sourcing",
      "hours": 10,
      "done_criterion": "Aggregate snapshots save every 100 events; state rehydrates in < 15ms by replaying subsequent events."
    },
    {
      "name": "CQRS Read-Model Projections & Temporal Query API",
      "hours": 10,
      "done_criterion": "Kafka worker projects events into read tables with < 150ms lag; temporal query reconstructs past state."
    },
    {
      "name": "High-Concurrency Conflict Benchmark, Anti-Fake Test & Docs",
      "hours": 9,
      "done_criterion": "Benchmark confirms 99 of 100 concurrent race writes rejected; anti-fake test validates dynamic replay; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, asynchronous Node.js, and SQL relational databases",
    "Understanding of Domain-Driven Design concepts (aggregates, domain events), optimistic concurrency, and CQRS"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and disk bound operations)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+, Docker 24+, and Docker Compose installed",
    "fallback_path": "SQLite in-memory append-only event table and Node.js EventEmitter if Docker Kafka cannot run"
  },
  "riskiest_component": {
    "name": "Long Aggregate Replay Latency on Entities with Many Events",
    "fallback": "Enforce automatic snapshot generation every 100 events to cap maximum replay length to 100 items"
  },
  "deliverables": [
    "Git repository containing TypeScript Event Sourcing framework, aggregate models, and CQRS API",
    "Docker Compose environment hosting PostgreSQL database and Kafka event broker",
    "Automated concurrency race test harness verifying optimistic concurrency collision rejection",
    "Screener verification script executing automated benchmark and dynamic temporal replay test in under 2 minutes"
  ],
  "out_of_scope": [
    "Distributed multi-cluster event replication across wide-area networks",
    "Complex event processing (CEP) state machine engines like Apache Flink",
    "Automated natural language aggregate command generation"
  ],
  "safety_note": None,
  "resources": [
    "Martin Fowler: Event Sourcing Architecture Patterns and Best Practices",
    "Greg Young: CQRS Documents and Event Store Implementation Guidelines",
    "Microsoft Cloud Design Patterns: Command and Query Responsibility Segregation (CQRS)"
  ],
  "rubric": [
    {
      "input": "100 concurrent competing mutation commands dispatched to identical aggregate instance",
      "action": "npm run test:concurrency",
      "expected_result": "Optimistic concurrency guard permits exactly 1 write and rejects 99 competing attempts",
      "evidence_location": "Terminal execution output log and reports/concurrency_results.json",
      "pass_criterion": "Exactly 1 success and 99 OptimisticConcurrencyError rejections with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Aggregate instance with 1,000 historical events and snapshot at event 900",
      "action": "npm run bench:rehydrate -- --aggregate-id acct-1234",
      "expected_result": "Aggregate rehydration loads snapshot, replays 100 events, and completes in < 15 milliseconds",
      "evidence_location": "Benchmark timing console output",
      "pass_criterion": "Rehydration latency is < 15 milliseconds on local machine",
      "kind": "normal"
    },
    {
      "input": "5,000 domain events dispatched through Kafka projection worker",
      "action": "npm run bench:projections",
      "expected_result": "Denormalized read-model projection tables reflect committed state with < 150ms average lag",
      "evidence_location": "Projection lag summary report log",
      "pass_criterion": "Average projection lag is < 150 milliseconds",
      "kind": "normal"
    },
    {
      "input": "Temporal time-travel query requesting entity state at historical timestamp T-minus-2-hours",
      "action": "curl http://localhost:3000/api/accounts/acct-1234/history?timestamp=1697500000",
      "expected_result": "API reconstructs and returns exact entity balance and status as of historical timestamp",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Returned state matches expected historical balance at specified timestamp with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic series of 5 deposit and withdrawal events appended to a new entity at runtime",
      "action": "node scripts/verify_dynamic_eventsourcing.js --entity DYNAMIC_ENTITY_88 --events 5",
      "expected_result": "Engine reconstructs state at event 3 and compares against event 5, proving temporal accuracy",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Historical state at event 3 exactly matches intermediate balance, final matches event 5, exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected Event Sourcing and CQRS framework in TypeScript and Node.js with PostgreSQL and Kafka; eliminated race conditions via optimistic concurrency control across [CONCURRENT_WRITES] competing writes, and achieved sub-[REHYDRATION_LATENCY] aggregate rehydration across [EVENT_COUNT] historical events.",
    "claims": [
      {
        "text": "eliminated race conditions via optimistic concurrency control across [CONCURRENT_WRITES] competing writes",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved sub-[REHYDRATION_LATENCY] aggregate rehydration across [EVENT_COUNT] historical events",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "global multi-region active-active event clustering or distributed Apache Flink streaming"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: an Event Sourcing and CQRS engine in TypeScript with append-only event store, optimistic concurrency, snapshots, and temporal queries.",
    "q2": "Target users: distributed systems engineers, backend architects, and enterprise platform developers.",
    "q3": "3 use cases: banking immutable audit trails, supply chain custody tracking, and DDD domain state reconstruction.",
    "q4": "Stated hours: 39 hours. Calculated bottom-up: 34 component hours * 1.15 buffer = 39.1 -> 39 hours. Advanced level.",
    "q5": "Hard parts: optimistic concurrency control in event store, exactly-once read projections, sub-15ms aggregate rehydration, and temporal replay.",
    "q6": "Starter input: 500 aggregate entities, 50,000 historical events across 5 domain event types. Synthetic records only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: SQLite in-memory mode.",
    "q8": "Riskiest component: Long replay latency on entities with many events. Fallback: snapshot every 100 events to bound replay to 100 items.",
    "q9": "Potential faking: mock state storage. Anti-fake check 5 appends 5 dynamic events at runtime and asserts temporal state match at step 3 vs step 5.",
    "q10": "Safety/ethics: Safe; synthetic business aggregates only."
  }
}

b21_old_diag = """
- **Old Title**: Event Sourcing & CQRS Application Framework
- **Domain**: Distributed Systems
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of core implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Martin Fowler pattern used at top tech platforms, top tech platforms', 'Zoho, top tech platforms value this')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than measuring concurrency collision rejection and aggregate rehydration latency.
2. **Duplicated marketing claims**:
   > "Martin Fowler's event sourcing pattern is used at top tech platforms, top tech platforms... Zoho, top tech platforms, and any company building complex B2B products..."
"""

b21_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using TypeScript, Node.js, and Docker Compose at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Concurrency collision accuracy (99 of 99), rehydration latency (< 15ms), and projection lag (< 150ms) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. In-memory append-only SQLite event table and Node.js EventEmitter if Docker cannot run.",
    "Can test data be created in minutes?": "YES. Synthetic 500-aggregate dataset with 50,000 historical events generator included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full concurrency test and dynamic temporal replay in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Optimistic concurrency collision rejection, aggregate rehydration latency, and projection lag are unique to event-sourced architectures.",
    "Is every bullet claim verified by rubric?": "YES. Concurrency collision verified by Check 0; rehydration latency verified by Check 1.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] appends 5 dynamic events at runtime and verifies temporal state reconstruction at intermediate step 3.",
    "Are all terms accurate?": "YES. Accurately covers append-only event store, aggregate roots, optimistic concurrency, snapshotting, and CQRS projections.",
    "Does problem statement promise only what is verified?": "YES. Event store, aggregate rehydration, snapshotting, CQRS projections, and temporal queries are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic domain events and mock account numbers.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering optimistic concurrency control, projection consistency, sub-15ms rehydration, and temporal queries."
}

b21_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved multi-partition Kafka ordering and schema upcasting to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic Event Sourcing metrics (concurrency collision rejection rate, rehydration latency, and projection lag).
- Removed Banned Content: Removed employer marketing regarding Martin Fowler name-dropping and duplicate company listings.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic temporal replay check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [CONCURRENT_WRITES], [REHYDRATION_LATENCY], and [EVENT_COUNT] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 22. brief-feature-flag-platform
# ==============================================================================
b22_data = {
  "id": "brief-feature-flag-platform",
  "title": "Feature Flag & Progressive Rollout Platform with MurmurHash3 Bucketing",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Full-stack web", "API/backend service"],
  "problem": "Software engineering teams must decouple code deployment from feature release to minimize production blast radiuses and perform gradual canary validations. Deploying features directly to all users simultaneously risks widespread service degradation, while coordinating rollouts via manual code releases slows engineering velocity. This project builds a high-performance feature flag and progressive rollout platform in Go, React, PostgreSQL, and Redis. The system supports percentage rollouts using deterministic MurmurHash3 user bucketing, complex attribute targeting rules (e.g., country, subscription tier, beta tag), sub-millisecond local in-memory flag evaluation, Server-Sent Events (SSE) for real-time flag push propagation without polling, and an administrative React dashboard with real-time audit logs and instant kill-switches.",
  "use_cases": [
    "Continuous delivery pipelines executing progressive percentage canary rollouts (1% to 10% to 100%)",
    "Targeted beta feature releases restricted to specific customer subscription tiers and internal employee emails",
    "Emergency kill-switch activation instantly disabling broken third-party integrations across clusters without redeployment"
  ],
  "hard_parts": [
    "Implementing deterministic MurmurHash3 user bucketing so a user remains consistently assigned to the same variant",
    "Propagating flag configuration updates in real-time across distributed client instances via Server-Sent Events (SSE)",
    "Achieving sub-millisecond evaluation latency in local SDK memory while guaranteeing dynamic rule synchronization",
    "Building an atomic administrative audit trail in PostgreSQL that records every rule change, variant shift, and kill-switch toggle"
  ],
  "screener_signals": [
    "Clean full-stack implementation separating Go evaluation engine, SSE streamer, React admin dashboard, and Redis pub/sub",
    "Deterministic uniform distribution benchmark proving MurmurHash3 distributes 100,000 users evenly within 1.5% variance",
    "Anti-fake verification script toggling an emergency kill-switch and asserting that client evaluation flips instantly within 50ms"
  ],
  "job_families": [
    "Platform Software Engineer",
    "Full-Stack Web Engineer",
    "Developer Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "systems language powering the high-performance flag evaluation engine and SSE streaming server"},
    {"tool": "React", "role": "frontend library powering the administrative flag management dashboard and audit UI"},
    {"tool": "PostgreSQL", "role": "relational database storing flag definitions, targeting rules, and audit logs"},
    {"tool": "Redis", "role": "in-memory pub/sub broker distributing real-time flag invalidation events to connected servers"}
  ],
  "architecture": {
    "components": [
      {
        "name": "MurmurHash3 User Bucketing Engine",
        "tools_used": ["Go"],
        "purpose": "Calculates deterministic 32-bit hash integers for user keys to ensure consistent percentage rollout assignment"
      },
      {
        "name": "Targeting Rule Evaluation Engine",
        "tools_used": ["Go", "PostgreSQL"],
        "purpose": "Evaluates user attributes (country, tier, email regex) against declarative boolean rule criteria"
      },
      {
        "name": "SSE Real-Time Push Streamer",
        "tools_used": ["Go", "Redis"],
        "purpose": "Pushes instantaneous flag configuration diffs to connected client SDKs via Server-Sent Events"
      },
      {
        "name": "React Administration Dashboard",
        "tools_used": ["React"],
        "purpose": "Provides user interface for creating flags, configuring rollout percentages, and toggling emergency kill-switches"
      }
    ],
    "data_flow": "Administrators create or modify flags in the React Dashboard; the Go API validates changes, appends an entry to PostgreSQL audit logs, and commits updated rules; the server publishes an invalidation event to Redis Pub/Sub; the SSE Push Streamer broadcasts the new configuration to connected client applications over persistent HTTP streams; client SDKs update their local in-memory flag caches; incoming evaluation requests compute MurmurHash3 hashes across user ID and flag key to determine variant assignment locally in sub-millisecond time.",
    "enforcement_mechanism": "Deterministic hashing preventing user bucket flapping; atomic PostgreSQL transactions recording audit records before publishing updates."
  },
  "targets": [
    {
      "metric": "Local In-Memory Evaluation Latency (p99)",
      "method": "Microbenchmark measuring SDK in-memory flag evaluation duration across complex multi-rule flags",
      "input": "100,000 evaluation calls evaluated against 50 active flags with compound attribute targeting rules",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "p99 evaluation latency is < 1.0 milliseconds",
      "target": "p99 evaluation latency is < 0.25 milliseconds",
      "report": "Evaluation latency benchmark summary output reporting p50, p95, and p99 percentiles"
    },
    {
      "metric": "Percentage Rollout Uniform Distribution Variance",
      "method": "Statistical distribution test bucketing 100,000 distinct user identifiers across a 50% rollout flag",
      "input": "100,000 synthetic UUID user identifiers hashed via MurmurHash3 against a configured 50% rollout",
      "environment": "Standard 4-core local CPU, Go 1.21+",
      "minimum_pass": "Observed percentage allocation falls between 48.5% and 51.5% (variance <= 1.5%)",
      "target": "Observed percentage allocation falls between 49.2% and 50.8% (variance <= 0.8%)",
      "report": "Statistical distribution uniformity verification log"
    },
    {
      "metric": "Real-Time Flag Propagation Latency",
      "method": "Duration from administrative dashboard kill-switch toggle until connected SSE client SDK updates local state",
      "input": "Emergency kill-switch toggle dispatched across 1,000 active simulated SSE client connections",
      "environment": "Standard 4-core local CPU, Go 1.21+, Redis 7",
      "minimum_pass": "Connected clients update local evaluation within 150 milliseconds",
      "target": "Connected clients update local evaluation within 50 milliseconds",
      "report": "SSE real-time propagation timing summary log"
    }
  ],
  "skills": ["Go", "React", "PostgreSQL", "Redis", "Feature Flags", "Distributed Systems", "Full-Stack Web"],
  "starter_input": {
    "spec": "YAML/JSON specification defining flag schema, targeting rules, rollout percentages, and sample user profiles.",
    "size": "50 active feature flags, 1,000 user profiles with attributes, and 100,000 evaluation request benchmark scripts",
    "seeded_cases": "Evaluation of non-existent flags, malformed user attribute types, rapid toggle flapping, and SSE disconnection retries",
    "label_source": "Deterministic evaluation test fixture mapping specific user IDs and attributes to expected variant outputs",
    "personal_data_policy": "Strictly mock synthetic user IDs and fake demographic attributes; no personal data used"
  },
  "components": [
    {"name": "Deterministic MurmurHash3 User Bucketing Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Rule Evaluation & Target Matching Engine", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Server-Sent Events (SSE) Real-Time Flag Streamer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "React Management Dashboard with Kill-Switch", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Evaluation Latency & Uniform Distribution Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "System Architecture Diagram & Flag Lifecycle Runbook", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Automated statistical experimentation engine calculating sample size and p-values for A/B conversion events",
      "OpenFeature specification compliant SDK client for Node.js and Go"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "MurmurHash3 Bucketing & Rule Evaluation Engine in Go Feature Flags",
      "hours": 7,
      "done_criterion": "Go engine hashes user keys, evaluates attribute rules, and returns variant in < 1ms."
    },
    {
      "name": "Server-Sent Events Real-Time Flag Propagation with Redis in Distributed Systems",
      "hours": 7,
      "done_criterion": "Redis pub/sub dispatches invalidations; SSE streamer broadcasts updates to clients in < 150ms."
    },
    {
      "name": "React Admin Dashboard, Audit Log & Instant Kill-Switch in Full-Stack Web",
      "hours": 7,
      "done_criterion": "React UI creates flags, edits percentages, toggles kill-switch, and renders PostgreSQL audit logs."
    },
    {
      "name": "Uniform Distribution Benchmark, Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark confirms 50% rollout has < 1.5% variance across 100,000 users; anti-fake test passes; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go programming, HTTP web servers, and concurrent goroutines",
    "Experience with React state management, PostgreSQL relational modeling, and Redis pub/sub"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound evaluation and web UI)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+, Node.js 18+, and Redis 7 installed",
    "fallback_path": "In-memory mock store and polling fallback if Docker Redis pub/sub cannot be run"
  },
  "riskiest_component": {
    "name": "SSE Connection Dropping Causing Stale Client Flag States",
    "fallback": "Implement automatic client reconnection with Last-Event-ID header and periodic 30-second polling fallback"
  },
  "deliverables": [
    "Git repository containing Go backend API, SSE streaming service, and React admin frontend",
    "Docker Compose file running Go server, React dashboard, PostgreSQL, and Redis",
    "Automated load testing harness verifying MurmurHash3 distribution uniformity and p99 evaluation latency",
    "Screener verification script executing automated benchmark and dynamic kill-switch test in under 2 minutes"
  ],
  "out_of_scope": [
    "Machine learning multi-armed bandit automated traffic reallocation algorithms",
    "Full-scale session recording or frontend user telemetry heatmaps",
    "Native mobile iOS and Android SDK library packaging"
  ],
  "safety_note": None,
  "resources": [
    "MurmurHash3 32-bit Algorithm Specification and Distribution Properties",
    "Server-Sent Events (SSE) W3C Standard and High-Concurrency Go Patterns",
    "OpenFeature Standard Specification for Feature Flag Management"
  ],
  "rubric": [
    {
      "input": "100,000 evaluation queries issued to local in-memory Go SDK",
      "action": "go test -bench=BenchmarkEvaluate -benchmem ./pkg/evaluator",
      "expected_result": "Evaluator achieves p99 latency under 1.0 milliseconds",
      "evidence_location": "Go benchmark stdout output log",
      "pass_criterion": "p99 evaluation latency is < 1.0 milliseconds with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100,000 synthetic user IDs evaluated against 50% rollout flag",
      "action": "go run ./cmd/distribution_test --users 100000 --rollout 50",
      "expected_result": "Allocation percentage falls between 48.5% and 51.5%",
      "evidence_location": "Terminal test execution output report",
      "pass_criterion": "Calculated percentage is between 48.5% and 51.5% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Admin toggles emergency kill-switch via React API endpoint",
      "action": "curl -X POST http://localhost:8080/api/flags/payment-v2/kill",
      "expected_result": "Flag status updates in PostgreSQL and broadcasts invalidation to connected clients",
      "evidence_location": "HTTP response payload and PostgreSQL audit log table",
      "pass_criterion": "Response status is 200 and audit table contains entry with action KILL_SWITCH",
      "kind": "normal"
    },
    {
      "input": "1,000 simulated client connections receiving SSE flag update broadcast",
      "action": "go run ./cmd/bench_sse --clients 1000",
      "expected_result": "Clients receive invalidation event within 150 milliseconds of toggle",
      "evidence_location": "SSE timing summary log",
      "pass_criterion": "All 1,000 clients confirm state update in < 150 milliseconds",
      "kind": "normal"
    },
    {
      "input": "Dynamic flag created with dynamic percentage rollout (37%) at runtime",
      "action": "python scripts/verify_dynamic_rollout.py --flag DYNAMIC_ROLLOUT_37 --percent 37 --users 10000",
      "expected_result": "Engine allocates users consistently matching 37% target (+/- 1.5%)",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Allocated percentage falls between 35.5% and 38.5% with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected feature flag and rollout platform in Go and React using MurmurHash bucketing; achieved sub-[EVAL_LATENCY] in-memory evaluation latency, and delivered instantaneous flag push propagation across [CLIENT_COUNT] connected clients with sub-[PROPAGATION_TIME] latency.",
    "claims": [
      {
        "text": "achieved sub-[EVAL_LATENCY] in-memory evaluation latency",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered instantaneous flag push propagation across [CLIENT_COUNT] connected clients with sub-[PROPAGATION_TIME] latency",
        "rubric_indexes": [2, 3]
      }
    ],
    "do_not_claim": "automated ML multi-armed bandit traffic allocation or native mobile SDK packaging"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a feature flag and progressive rollout platform in Go/React with MurmurHash3 bucketing, SSE propagation, and admin audit dashboard.",
    "q2": "Target users: platform software engineers, full-stack developers, and DevOps teams.",
    "q3": "3 use cases: progressive percentage canary rollouts, targeted subscription tier beta releases, and emergency kill-switch activation.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: deterministic MurmurHash3 bucketing, real-time SSE propagation via Redis pub/sub, sub-millisecond evaluation, and atomic audit logging.",
    "q6": "Starter input: 50 active flags, 1,000 user profiles, and 100,000 evaluation request test scripts. Synthetic profiles only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory mock store and polling.",
    "q8": "Riskiest component: SSE connection dropping causing stale client states. Fallback: automatic client reconnect with Last-Event-ID header.",
    "q9": "Potential faking: hardcoded 50% split. Anti-fake check 5 creates dynamic flag with 37% rollout at runtime and asserts 37% allocation across 10,000 users.",
    "q10": "Safety/ethics: Safe; synthetic user profiles only."
  }
}

b22_old_diag = """
- **Old Title**: Feature Flag & A/B Testing Platform
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic flag setup; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'LaunchDarkly and Split.io are billion-dollar companies', 'top tech platforms, Zomato, and top tech platforms run extensive A/B experiments')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than evaluating evaluation latency, bucketing uniformity, and SSE update propagation.
2. **Commercial employer marketing**:
   > "LaunchDarkly and Split.io are billion-dollar companies built on this problem... top tech platforms, Zomato, and top tech platforms run extensive A/B experiments..."
"""

b22_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go, React, PostgreSQL, and Redis at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Evaluation latency (< 1.0ms), bucketing variance (<= 1.5%), and SSE propagation (< 150ms) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. In-memory mock store and polling fallback if Docker Redis cannot run.",
    "Can test data be created in minutes?": "YES. Synthetic 50-flag configuration and 100,000 user hash generator included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full benchmark and dynamic 37% rollout check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. In-memory evaluation latency, MurmurHash3 distribution variance, and SSE push propagation latency are unique to feature flag platforms.",
    "Is every bullet claim verified by rubric?": "YES. Evaluation latency verified by Check 0; SSE propagation verified by Checks 2 & 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] configures a dynamic 37% rollout at runtime and asserts 37% (+/- 1.5%) allocation across 10,000 users.",
    "Are all terms accurate?": "YES. Accurately covers MurmurHash3 bucketing, boolean targeting rules, Server-Sent Events, and Redis pub/sub.",
    "Does problem statement promise only what is verified?": "YES. Bucketing engine, rule matcher, SSE streamer, and React admin dashboard are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic user IDs and fake attributes.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering MurmurHash3 bucketing, SSE propagation, sub-millisecond evaluation, and audit logging."
}

b22_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved statistical A/B experimentation and OpenFeature SDK to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic feature flag metrics (local evaluation latency, MurmurHash3 distribution variance, and SSE propagation time).
- Removed Banned Content: Removed employer marketing regarding LaunchDarkly, Split.io, Zomato, and duplicate company names.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic 37% rollout test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [EVAL_LATENCY], [CLIENT_COUNT], and [PROPAGATION_TIME] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 23. brief-fraud-detection-ml
# ==============================================================================
b23_data = {
  "id": "brief-fraud-detection-ml",
  "title": "Real-Time Fraud Detection ML Pipeline with Sliding-Window Feature Store",
  "domain": "ML Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["AI/ML pipeline/model", "Distributed systems"],
  "problem": "Financial payment networks process credit card transactions in under 50 milliseconds, creating a strict latency envelope to intercept fraudulent operations before approval. Batch scoring algorithms cannot detect rapid card-testing spikes or immediate velocity surges, while raw ML models lacking real-time feature context produce unacceptable false positive declines that alienate legitimate users. This project implements a real-time fraud detection pipeline in Python, FastAPI, LightGBM, Kafka, and Redis. The system streams transactions through Kafka, aggregates velocity and historical spending patterns into a Redis sliding-window feature store across 10-minute and 24-hour windows, evaluates transactions in under 15 milliseconds using a calibrated LightGBM classifier, provides explainable decision attributions via TreeSHAP, and tracks experiments and metrics in MLflow.",
  "use_cases": [
    "Credit card payment gateway ingress blocking fraudulent authorization attempts before issuing bank approval",
    "Digital wallet peer-to-peer transfer fraud prevention intercepting account takeover fund siphoning",
    "E-commerce merchant checkout risk scoring detecting automated card-testing bots and stolen credentials"
  ],
  "hard_parts": [
    "Maintaining sliding-window aggregation features (transaction velocity, rolling sum, distinct merchants) in Redis under sub-5ms latency budgets",
    "Handling extreme dataset class imbalance (< 0.2% fraud prevalence) during LightGBM model training using focal loss and probability calibration",
    "Computing TreeSHAP local feature attribution values in under 8 milliseconds to return human-interpretable adverse action codes",
    "Tuning decision classification thresholds against an asymmetric business cost matrix balancing fraud loss versus false decline merchant penalties"
  ],
  "screener_signals": [
    "Modular Python codebase cleanly separating feature store aggregators, model training pipelines, scoring services, and SHAP explainers",
    "High-concurrency benchmark demonstrating sub-15ms end-to-end scoring latency under a load of 1,000 transactions/sec",
    "Anti-fake verification script sending dynamic high-velocity payment bursts and asserting immediate transaction blocking with adverse reason codes"
  ],
  "job_families": [
    "Machine Learning Engineer",
    "Fraud Data Scientist",
    "ML Platform Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language for feature engineering, model training, and inference serving"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving sub-15ms fraud scoring endpoints"},
    {"tool": "LightGBM", "role": "gradient boosting framework trained on tabular transaction and velocity features"},
    {"tool": "Kafka", "role": "distributed streaming broker ingesting high-throughput payment transaction events"},
    {"tool": "Redis", "role": "in-memory feature store managing sliding-window transaction counters and rolling sums"},
    {"tool": "MLflow", "role": "experiment tracking registry versioning model artifacts, ROC curves, and parameters"},
    {"tool": "Docker", "role": "containerization engine packaging scoring microservice, Kafka, and Redis"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Sliding-Window Redis Feature Store",
        "tools_used": ["Python", "Redis"],
        "purpose": "Calculates rolling transaction velocity and amount sums across 10-minute and 24-hour sliding windows"
      },
      {
        "name": "LightGBM Fraud Classification Engine",
        "tools_used": ["Python", "LightGBM", "MLflow"],
        "purpose": "Scores enriched transaction vectors, outputting calibrated fraud probabilities using gradient boosted trees"
      },
      {
        "name": "FastAPI Low-Latency Scoring Service",
        "tools_used": ["Python", "FastAPI", "Docker"],
        "purpose": "Ingests transaction payloads, queries Redis feature store, runs LightGBM inference, and returns risk decisions"
      },
      {
        "name": "TreeSHAP Local Explainability Engine",
        "tools_used": ["Python"],
        "purpose": "Computes top 3 feature contribution values for flagged payments to deliver adverse reason codes"
      },
      {
        "name": "Kafka Event Streaming Ingestion Worker",
        "tools_used": ["Python", "Kafka"],
        "purpose": "Consumes raw payment authorization events and feeds background feature store updates"
      }
    ],
    "data_flow": "Payment authorizations arrive at the FastAPI scoring service; the service fetches rolling velocity and aggregation features from Redis in parallel; the combined transaction and feature vector is fed to the calibrated LightGBM model; if the fraud probability exceeds the cost-optimized decision threshold, TreeSHAP calculates the top contributing factors; the API returns an APPROVED or BLOCKED response with reason codes in < 15 milliseconds; background Kafka workers consume the approved transaction event and update Redis sliding window structures for future scoring.",
    "enforcement_mechanism": "Calibrated decision probability thresholds halting risky payments; Redis TTL expiration pruning stale sliding window event keys."
  },
  "targets": [
    {
      "metric": "Fraud Detection Precision-Recall Area (PR-AUC)",
      "method": "Model evaluation across held-out test split of 50,000 transactions with 0.2% positive fraud prevalence",
      "input": "Held-out test split of 50,000 transactions with 100 positive fraud cases and 49,900 legitimate transactions",
      "environment": "Standard 4-core local CPU, Python 3.11, LightGBM release",
      "minimum_pass": "PR-AUC exceeds 0.72 on imbalanced test split",
      "target": "PR-AUC exceeds 0.84 on imbalanced test split",
      "report": "MLflow experiment evaluation report detailing PR-AUC, ROC-AUC, and confusion matrix"
    },
    {
      "metric": "End-to-End Scoring Decision Latency (p99)",
      "method": "Wall-clock timing from HTTP request arrival, Redis feature enrichment, LightGBM inference, to response",
      "input": "10,000 transactions processed through scoring API at 500 requests/sec load",
      "environment": "Standard 4-core local CPU, Python 3.11, local Redis 7 instance",
      "minimum_pass": "p99 decision latency is < 15.0 milliseconds",
      "target": "p99 decision latency is < 8.0 milliseconds",
      "report": "Scoring API benchmark latency percentile output log"
    },
    {
      "metric": "SHAP Adverse Factor Computation Overhead",
      "method": "Execution timing to compute top 3 local TreeSHAP attribution factors on flagged high-risk transactions",
      "input": "1,000 flagged high-risk transaction vectors processed through TreeSHAP explainer",
      "environment": "Standard 4-core local CPU, Python 3.11",
      "minimum_pass": "Average SHAP attribution computation completes in < 8.0 milliseconds",
      "target": "Average SHAP attribution computation completes in < 3.5 milliseconds",
      "report": "Explainability benchmark timing summary report"
    }
  ],
  "skills": ["Python", "FastAPI", "LightGBM", "Kafka", "Redis", "MLflow", "Docker", "Machine Learning", "Feature Store"],
  "starter_input": {
    "spec": "Tabular credit card transaction schema (timestamp, card_id, amount, merchant_category, country) and evaluation queries.",
    "size": "250,000 transaction records spanning 30 days with 500 labeled positive fraud events (0.2% prevalence)",
    "seeded_cases": "Card-testing micro-transactions, sudden foreign country transactions, velocity surges, and duplicate chargebacks",
    "label_source": "Deterministic CSV fixture mapping transactions to verified ground-truth fraud flags and reason labels",
    "personal_data_policy": "Strictly mock synthetic credit card tokens and simulated merchant records; no real cardholder data used"
  },
  "components": [
    {"name": "Sliding-Window Real-Time Feature Store in Redis", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Imbalanced Fraud Classification Model Training Pipeline", "task_type": "model train + evaluate cycle", "hours": 6.0},
    {"name": "FastAPI Low-Latency Scoring Service with SHAP Attributions", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Kafka Stream Ingestion & Feature Enrichment Worker", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Decision Boundary & Business Cost Matrix Evaluator", "task_type": "evaluation dataset creation + scoring script", "hours": 5.0},
    {"name": "End-to-End Latency & Fraud Interception Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Feature Store Architecture & Threat Model Documentation", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Shadow deployment runner comparing production live model against candidate model with Kolmogorov-Smirnov drift metrics",
      "Graph feature extraction pipeline detecting fraud rings based on shared device fingerprints and IP clusters"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Sliding-Window Feature Store Aggregator & Redis Ingestion in Python",
      "hours": 10,
      "done_criterion": "Redis feature store calculates rolling 10m and 24h velocity and sum features in < 5ms."
    },
    {
      "name": "Calibrated LightGBM Model Training & MLflow Tracking in Machine Learning",
      "hours": 10,
      "done_criterion": "LightGBM model trains on imbalanced dataset, achieving PR-AUC > 0.72 with artifacts logged to MLflow."
    },
    {
      "name": "Low-Latency FastAPI Scoring Service with Real-Time SHAP Explanations",
      "hours": 10,
      "done_criterion": "FastAPI scores transactions in < 15ms and returns top 3 TreeSHAP adverse reason codes."
    },
    {
      "name": "Fraud Interception Benchmark, Anti-Fake Test & Docs",
      "hours": 9,
      "done_criterion": "Benchmark verifies sub-15ms p99 at 500 req/s; anti-fake test catches dynamic burst; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python, asynchronous FastAPI, and machine learning libraries (LightGBM, Scikit-learn)",
    "Understanding of imbalanced classification, PR-AUC vs ROC-AUC, Redis data structures, and Kafka streaming"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound gradient boosting and Redis operations)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11, Docker 24+, and Redis 7 installed",
    "fallback_path": "In-memory Python dictionaries with SQLite if local Docker Redis cannot be initialized"
  },
  "riskiest_component": {
    "name": "TreeSHAP Local Attribution Computation Exceeding Latency Budget",
    "fallback": "Pre-compute background FastTreeSHAP or approximate top feature contributors using linear feature contributions"
  },
  "deliverables": [
    "Git repository containing Python fraud scoring service, LightGBM training pipeline, and Redis feature store",
    "Docker Compose file spinning up FastAPI service, Kafka broker, Redis, and MLflow tracking server",
    "Automated latency and precision-recall evaluation harness measuring PR-AUC and p99 response time",
    "Screener verification script executing automated benchmark and dynamic velocity attack in under 2 minutes"
  ],
  "out_of_scope": [
    "Complex deep learning graph neural networks running on GPU clusters",
    "Real-time biometric facial recognition and device sensor telemetry processing",
    "Manual fraud operations analyst investigation queue and case management UI"
  ],
  "safety_note": "This project processes synthetic payment transactions and simulated cardholder identifiers for fraud detection engineering. It does not interface with live banking payment networks or process real financial funds.",
  "resources": [
    "LightGBM Documentation on Imbalanced Classification and Fast Training",
    "TreeSHAP: Explainable Predictions with Fast Tree Explanations (Lundberg et al.)",
    "Designing Real-Time Feature Stores with Redis and Kafka for Low-Latency ML"
  ],
  "rubric": [
    {
      "input": "Held-out imbalanced test dataset of 50,000 transactions with 0.2% fraud prevalence",
      "action": "python -m fraud_pipeline.evaluate --test-data data/test_split.parquet",
      "expected_result": "Model achieves PR-AUC exceeding 0.72 on positive fraud class",
      "evidence_location": "Terminal evaluation stdout and reports/pr_auc_metrics.json",
      "pass_criterion": "PR-AUC is > 0.72 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "10,000 transactions processed through FastAPI scoring service at 500 req/sec",
      "action": "python scripts/benchmark_scoring_latency.py --requests 10000 --rate 500",
      "expected_result": "p99 decision latency added by feature lookup, inference, and SHAP is < 15.0 milliseconds",
      "evidence_location": "Scoring benchmark latency summary table",
      "pass_criterion": "p99 decision latency is < 15.0 milliseconds",
      "kind": "normal"
    },
    {
      "input": "1,000 flagged fraudulent transactions evaluated with TreeSHAP",
      "action": "python scripts/benchmark_shap_speed.py --samples 1000",
      "expected_result": "TreeSHAP computes top 3 feature attribution reasons in < 8.0 milliseconds average",
      "evidence_location": "SHAP timing output report log",
      "pass_criterion": "Average SHAP latency is < 8.0 milliseconds with exit code 0",
      "kind": "normal"
    },
    {
      "input": "High-risk transaction exceeding threshold",
      "action": "curl -X POST http://localhost:8000/score -H 'Content-Type: application/json' -d '{\"card_id\": \"card-99\", \"amount\": 4500.0, \"category\": \"electronics\"}'",
      "expected_result": "API returns status BLOCKED with top 3 adverse reason codes",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200, decision is BLOCKED, and reason_codes array has at least 1 item",
      "kind": "normal"
    },
    {
      "input": "Dynamic burst of 6 rapid transactions on a single card within 30 seconds injected at runtime",
      "action": "python scripts/verify_dynamic_fraud.py --card-id DYNAMIC_BURST_CARD --count 6 --interval 5",
      "expected_result": "Redis velocity counter detects anomaly; 6th transaction is blocked with VELOCITY_BURST reason",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "6th transaction returns BLOCKED with reason VELOCITY_BURST and exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected low-latency fraud detection pipeline in Python and FastAPI with Redis sliding-window feature store; achieved [PR_AUC_SCORE] PR-AUC on imbalanced transaction data, and delivered sub-[DECISION_LATENCY] decision latency with TreeSHAP adverse factor explanations.",
    "claims": [
      {
        "text": "achieved [PR_AUC_SCORE] PR-AUC on imbalanced transaction data",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[DECISION_LATENCY] decision latency with TreeSHAP adverse factor explanations",
        "rubric_indexes": [1, 2]
      }
    ],
    "do_not_claim": "deep learning graph neural network ring clustering or real live fund blocking"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a real-time fraud detection pipeline in Python/FastAPI with Redis sliding-window feature store, LightGBM, and TreeSHAP explainability.",
    "q2": "Target users: ML engineers, fraud data scientists, and platform architects.",
    "q3": "3 use cases: credit card gateway ingress, digital wallet P2P transfer risk, and e-commerce bot detection.",
    "q4": "Stated hours: 39 hours. Calculated bottom-up: 34 component hours * 1.15 buffer = 39.1 -> 39 hours. Advanced level.",
    "q5": "Hard parts: sliding-window Redis aggregations in sub-5ms, extreme class imbalance training, sub-8ms TreeSHAP attributions, and cost matrix thresholding.",
    "q6": "Starter input: 250,000 transactions over 30 days with 500 labeled fraud events (0.2%). Synthetic tokens only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: Python dicts and SQLite.",
    "q8": "Riskiest component: TreeSHAP attribution latency exceeding budget. Fallback: FastTreeSHAP or linear approximation.",
    "q9": "Potential faking: static threshold returns. Anti-fake check 5 injects 6 rapid transactions on dynamic card at runtime and asserts VELOCITY_BURST block.",
    "q10": "Safety/ethics: Safe; synthetic transaction data only, no live banking rails."
  }
}

b23_old_diag = """
- **Old Title**: Real-Time Fraud Detection ML Pipeline
- **Domain**: ML Engineering
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic model training; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing and unverified claims)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than PR-AUC, decision latency, and TreeSHAP overhead.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."
"""

b23_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, LightGBM, Redis, and FastAPI at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. PR-AUC (> 0.72), decision latency (< 15ms), and TreeSHAP overhead (< 8ms) measured directly on local CPU.",
    "Is there a CPU/local/free fallback?": "YES. Python in-memory dictionaries and SQLite if Docker Redis is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 250,000 transaction dataset with seeded fraud cases generator included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full evaluation suite and dynamic velocity check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. PR-AUC on imbalanced data, sub-15ms scoring decision latency, and TreeSHAP attribution overhead are unique to real-time fraud ML pipelines.",
    "Is every bullet claim verified by rubric?": "YES. PR-AUC verified by Check 0; decision latency and SHAP verified by Checks 1 & 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] sends 6 rapid transactions on a dynamic card at runtime and asserts VELOCITY_BURST blocking.",
    "Are all terms accurate?": "YES. Accurately covers sliding-window feature stores, LightGBM gradient boosting, PR-AUC, and TreeSHAP attributions.",
    "Does problem statement promise only what is verified?": "YES. Feature store, LightGBM model, FastAPI scoring, and TreeSHAP explainer are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Safety note confirms purely synthetic educational data, zero live banking integration.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering sub-5ms Redis sliding windows, extreme class imbalance, sub-8ms TreeSHAP, and cost matrix thresholding."
}

b23_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved shadow deployment runner and graph clustering to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic real-time fraud ML metrics (PR-AUC, decision latency, and TreeSHAP computation overhead).
- Removed Banned Content: Removed unsubstantiated marketing claims and employer references.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic velocity burst test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [PR_AUC_SCORE] and [DECISION_LATENCY] with strict 'Do not claim' boundary.
"""


def run_batch_2_part2():
    res19 = process_brief(b19_data, b19_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b19_reviewer, b19_changelog)
    res20 = process_brief(b20_data, b20_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b20_reviewer, b20_changelog)
    res21 = process_brief(b21_data, b21_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b21_reviewer, b21_changelog)
    res22 = process_brief(b22_data, b22_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b22_reviewer, b22_changelog)
    res23 = process_brief(b23_data, b23_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b23_reviewer, b23_changelog)
    return [res19, res20, res21, res22, res23]

if __name__ == "__main__":
    results = run_batch_2_part2()
    print("Batch 2 Part 2 finished successfully:", results)
