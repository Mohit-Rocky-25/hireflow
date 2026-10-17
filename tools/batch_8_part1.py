"""
Batch 8 Part 1: Redesign briefs 74 to 78 from scratch.
74. brief-tls-certificate-manager
75. brief-upi-payment-gateway
76. brief-vector-db-from-scratch
77. brief-workflow-engine
78. brief-zero-trust-proxy
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 74. brief-tls-certificate-manager
# ==============================================================================
b74_data = {
  "id": "brief-tls-certificate-manager",
  "title": "Automated TLS Certificate Manager with ACME Protocol (DNS-01 / HTTP-01 Challenges) & Dynamic Reload",
  "domain": "Security & Platform",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Security projects", "Systems/low-level/networking"],
  "problem": "Manual TLS certificate management and ad-hoc renewal scripts cause production outages when domain certificates expire unexpectedly, producing disruptive browser trust warnings and breaking critical API gateways. Furthermore, multi-tenant SaaS platforms hosting thousands of customer subdomains cannot rely on manual DNS or HTTP challenge responses without exposing DNS credentials or incurring edge server downtime during certificate reloads. This project builds a production-grade automated TLS certificate manager in Go implementing RFC 8555 ACME protocol client workflows. The daemon automatically fulfills DNS-01 and HTTP-01 validation challenges against Let's Encrypt and Pebble ACME servers, securely encrypts private keys at rest in PostgreSQL, schedules proactive renewals 30 days prior to certificate expiration, executes zero-downtime hot reloads of Nginx edge proxies, and exports certificate lifecycle metrics to Prometheus.",
  "use_cases": [
    {
      "title": "Multi-Tenant SaaS Custom Domain TLS Automation",
      "first_sentence": "Enterprise SaaS platforms hosting custom branded domains for business clients must provision trusted HTTPS endpoints automatically upon domain verification.",
      "second_sentence": "The Go certificate manager completes automated DNS-01 challenges via cloud DNS APIs, receives signed X.509 certificates, and binds them to edge reverse proxies without human intervention."
    },
    {
      "title": "Zero-Downtime Edge Ingress Certificate Rotation",
      "first_sentence": "E-commerce web gateways serving high volumes of active shopping carts cannot drop inflight TCP connections during monthly certificate renewals.",
      "second_sentence": "The daemon pushes newly issued TLS bundles to Nginx via atomic configuration symlinks and sends SIGHUP signals, executing seamless zero-downtime reloads."
    },
    {
      "title": "Internal Microservice mTLS Certificate Lifecycle Management",
      "first_sentence": "Platform engineering teams operating internal microservices need automated rotation of internal CA certificates before strict expiry windows.",
      "second_sentence": "The system monitors certificate expiry timers in PostgreSQL, tracks remaining validity in Prometheus, and fires alerts 14 days before certificate retirement."
    }
  ],
  "hard_parts": [
    "Implementing the RFC 8555 ACME state machine in Go, including account key generation, order authorization, challenge polling, and CSR finalization",
    "Fulfilling DNS-01 challenge propagation checks and HTTP-01 ephemeral token routing through reverse proxies without exposing infrastructure DNS keys",
    "Executing atomic certificate file updates and zero-downtime Nginx hot reloads while maintaining active persistent TLS connections",
    "Designing proactive renewal cron workers with exponential backoff and jitter to prevent thundering herd failures against ACME rate limits"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating ACME protocol client logic, challenge handlers, encrypted certificate storage, and proxy reload drivers",
    "Automated integration test report proving successful order fulfillment, DNS-01 verification, and X.509 certificate issuance against local Pebble ACME server",
    "Anti-fake verification script presenting an expired certificate or invalid ACME signature and confirming immediate handshake failure and validation rejection"
  ],
  "job_families": [
    "Security Engineer",
    "Site Reliability Engineer (SRE)",
    "Cloud Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing the ACME protocol client, challenge engine, and reload daemon"},
    {"tool": "ACME Protocol", "role": "RFC 8555 standard automated certificate management protocol specification for domain validation"},
    {"tool": "TLS", "role": "transport layer security cryptographic protocol providing encrypted communication and X.509 certificate validation"},
    {"tool": "PostgreSQL", "role": "relational database storing domain metadata, encrypted private keys, challenge statuses, and expiry logs"},
    {"tool": "Prometheus", "role": "metrics monitoring system scraping certificate expiration dates, renewal latencies, and challenge error counters"},
    {"tool": "Nginx", "role": "reverse proxy edge server dynamically reloading rotated TLS certificates without dropping active connections"},
    {"tool": "Docker", "role": "container runtime packaging the local Pebble ACME test server, PostgreSQL, Nginx, and manager service"}
  ],
  "architecture": {
    "components": [
      {
        "name": "ACME Protocol Client & Order State Machine in Go",
        "tools_used": ["Go", "ACME Protocol"],
        "purpose": "Manages ACME account keys, orders certificates, signs cryptographic nonces, and retrieves finalized X.509 certificate chains"
      },
      {
        "name": "DNS-01 & HTTP-01 Validation Challenge Engine",
        "tools_used": ["Go", "ACME Protocol", "TLS"],
        "purpose": "Solves challenge tokens by serving HTTP-01 key authorizations or injecting DNS TXT validation records"
      },
      {
        "name": "Encrypted Certificate Store & Postgres Repository",
        "tools_used": ["Go", "PostgreSQL"],
        "purpose": "Encrypts RSA/ECDSA private keys with AES-256-GCM, stores certificate chains, and indexes domain renewal timestamps"
      },
      {
        "name": "Nginx Zero-Downtime Reload Controller & Hot Swapper",
        "tools_used": ["Go", "Nginx", "Docker"],
        "purpose": "Atomically updates TLS bundle symlinks on disk and executes graceful Nginx reloads via SIGHUP signals"
      },
      {
        "name": "Renewal Scheduler & Prometheus Expiry Monitor",
        "tools_used": ["Go", "Prometheus"],
        "purpose": "Runs background ticker querying expiring certificates (< 30 days) and exports certificate_expiry_timestamp_seconds metrics"
      },
      {
        "name": "ACME Certificate Manager Benchmark & Challenge Test Suite",
        "tools_used": ["Go", "Docker"],
        "purpose": "Tests concurrent challenge fulfillment against Pebble server and measures reload latency overhead under synthetic load"
      },
      {
        "name": "Certificate Manager Security Guide & Architecture Diagram",
        "tools_used": ["Go", "TLS"],
        "purpose": "Documents RFC 8555 cryptographic workflows, AES-GCM key storage schemas, and automated disaster recovery procedures"
      }
    ],
    "data_flow": "The renewal scheduler identifies domains with certificates expiring within 30 days from PostgreSQL; the ACME client initiates an order request with the ACME server; the server returns challenge URLs; the challenge engine creates an ephemeral HTTP-01 token endpoint or publishes a DNS-01 TXT record; the ACME server validates the challenge and issues authorization; the Go client generates an ECDSA keypair, signs a Certificate Signing Request (CSR), and finalizes the order; the signed X.509 certificate chain is downloaded, encrypted, and saved to PostgreSQL; the reload controller atomically swaps the certificate file on disk and signals Nginx; Nginx hot-reloads TLS contexts without dropping in-flight requests; Prometheus scrapes remaining validity metrics.",
    "enforcement_mechanism": "Cryptographic ECDSA/RSA key signing and ACME SHA-256 token authorizations validated by RFC 8555 conformance checks."
  },
  "targets": [
    {
      "metric": "Automated ACME Challenge Completion & Issuance Latency",
      "method": "Wall-clock duration from initial ACME order creation to final X.509 certificate download and verification against Pebble ACME server",
      "input": "20 sequential certificate orders issued across synthetic local domain names",
      "environment": "Standard 4-core local CPU, Docker Desktop running Pebble ACME test server and Go manager daemon",
      "minimum_pass": "p95 certificate issuance duration is < 4.5 seconds per domain",
      "target": "p95 certificate issuance duration is < 2.1 seconds per domain",
      "report": "ACME issuance benchmark log and challenge timing distribution summary"
    },
    {
      "metric": "Proactive Expiry Rotation Scheduling Reliability",
      "method": "Percentage of mock certificates expiring within 30 days identified and queued for renewal without operator intervention",
      "input": "50 mock domain certificates seeded with varying expiry dates (10 expiring in 15 days, 40 expiring in 90 days)",
      "environment": "PostgreSQL database instance containing 50 simulated domain certificate records",
      "minimum_pass": "10 of 10 expiring certificates scheduled and 40 of 40 non-expiring certificates ignored",
      "target": "10 of 10 expiring certificates scheduled and 40 of 40 non-expiring certificates ignored",
      "report": "Renewal scheduler audit log and PostgreSQL queue status export"
    },
    {
      "metric": "Zero-Downtime Nginx Edge Gateway TLS Reload Availability",
      "method": "Percentage of HTTP GET requests returning 200 OK without dropped TCP connections during Nginx TLS certificate hot reload",
      "input": "1,000 continuous HTTP GET requests issued at 100 RPS while SIGHUP reload executes mid-stream",
      "environment": "Local Docker container running Nginx reverse proxy with active client curl benchmark",
      "minimum_pass": "1,000 of 1,000 requests succeed with 0 connection resets and p95 latency < 25 milliseconds",
      "target": "1,000 of 1,000 requests succeed with 0 connection resets and p95 latency < 12 milliseconds",
      "report": "Nginx hot reload traffic benchmark report and error log audit"
    }
  ],
  "skills": ["Go", "ACME Protocol", "TLS", "PostgreSQL", "Prometheus", "Nginx", "Docker", "Security", "DevOps"],
  "starter_input": {
    "spec": "Directory containing Go ACME daemon skeleton, Pebble ACME server Docker Compose, PostgreSQL schema, and mock Nginx configs.",
    "size": "10 Go source files, SQL migrations, Docker Compose manifest, Nginx configuration templates, and automated verification scripts",
    "seeded_cases": "Expired X.509 certificates, invalid DNS challenge tokens, revoked intermediate CAs, and abrupt proxy termination mid-reload",
    "label_source": "Deterministic OpenSSL x509 verification outputs, Pebble server challenge logs, and PostgreSQL transaction commits",
    "personal_data_policy": "Strictly mock synthetic domain names and simulated organization identifiers; no real personal data used"
  },
  "components": [
    {"name": "ACME Protocol Client & Order State Machine in Go", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "DNS-01 & HTTP-01 Validation Challenge Engine", "task_type": "security hardening checks", "hours": 5.0},
    {"name": "Encrypted Certificate Store & Postgres Repository", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "Nginx Zero-Downtime Reload Controller & Hot Swapper", "task_type": "concurrency/consistency mechanism with tests", "hours": 4.0},
    {"name": "Renewal Scheduler & Prometheus Expiry Monitor", "task_type": "observability", "hours": 3.0},
    {"name": "Certificate Manager Security Guide & Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Automated OCSP (Online Certificate Status Protocol) stapling cache with background response validation",
      "Multi-cloud DNS challenge provider integrations (AWS Route 53, Cloudflare, Google Cloud DNS)",
      "Hardware Security Module (HSM) PKCS#11 integration for cryptographic private key protection"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "ACME RFC 8555 Protocol State Machine & Pebble Testbed in Go and ACME Protocol",
      "hours": 7,
      "done_criterion": "Pebble ACME server boots in Docker; Go client registers account key and opens certificate order."
    },
    {
      "name": "DNS-01 / HTTP-01 Challenge Validation & X.509 Issuance in TLS and Docker",
      "hours": 7,
      "done_criterion": "HTTP-01 token handler completes verification; Pebble issues cryptographically valid X.509 certificate."
    },
    {
      "name": "Encrypted Storage, Renewal Cron & Nginx Dynamic Reload in PostgreSQL, Nginx and DevOps",
      "hours": 7,
      "done_criterion": "Private keys encrypt at rest in PostgreSQL; Nginx reloads new certificates with 0 dropped requests."
    },
    {
      "name": "Prometheus Metrics, Anti-Fake Tampered Signature Test & Docs in Prometheus and Security",
      "hours": 7,
      "done_criterion": "Prometheus scrapes expiry timestamps; anti-fake test blocks forged certificate; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go programming, goroutines, channels, and standard networking libraries (net/http, crypto/tls)",
    "Understanding of Public Key Infrastructure (PKI), X.509 certificates, TLS handshakes, and DNS record management"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and cryptographic operations)",
    "cost": "$0 (fully open-source stack using local Pebble ACME server in Docker Desktop)",
    "accounts_keys_quotas": "No paid cloud accounts, commercial DNS providers, or public Let's Encrypt production rate limits required",
    "reference_environment": "Local 4-core CPU, Docker Desktop (Pebble ACME, Pebble-Challtestsrv, PostgreSQL), Go 1.21+",
    "fallback_path": "Self-signed mock CA simulator if Docker Pebble container cannot be provisioned"
  },
  "riskiest_component": {
    "name": "Outages from Defective Certificate Symlink Swapping or Failed Nginx Reloads",
    "mitigation": "Validate newly issued certificates via OpenSSL verify against local CA bundle before writing symlink and sending SIGHUP.",
    "fallback": "Automated rollback hook restoring previous verified certificate bundle upon SIGHUP failure."
  },
  "deliverables": [
    "Go source repository containing ACME client daemon, challenge fulfillment handlers, and Nginx reload controller",
    "Docker Compose harness provisioning local Pebble ACME testbed, challenge server, PostgreSQL, and Nginx",
    "Prometheus alert rules monitoring certificate expiration thresholds and ACME challenge failure rates",
    "Screener verification script executing end-to-end issuance, reload test, and anti-fake validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Commercial certificate authority integration (DigiCert, Sectigo paid APIs)",
    "Public DNS registrar domain purchase automation",
    "Physical HSM appliance hardware driver configuration"
  ],
  "safety_note": None,
  "resources": [
    "RFC 8555: Automatic Certificate Management Environment (ACME) Specification",
    "Let's Encrypt Pebble: Lightweight ACME Test Server for Local Testing",
    "Go crypto/x509 and crypto/tls Standard Library Documentation"
  ],
  "rubric": [
    {
      "input": "20 sequential certificate order requests targeting local Pebble ACME server",
      "action": "go run ./cmd/certmgr --domains test.local --issue-all",
      "expected_result": "ACME state machine fulfills challenges and downloads valid X.509 certs in < 4.5s p95",
      "evidence_location": "Terminal output log and reports/acme_issuance.json",
      "pass_criterion": "20 of 20 certificates issued with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 mock database records with 10 certificates expiring in 15 days",
      "action": "go test ./pkg/scheduler -v -run TestProactiveRenewalQueue",
      "expected_result": "Scheduler queues exactly 10 expiring certificates for rotation and ignores 40 healthy ones",
      "evidence_location": "Test log output in reports/scheduler_audit.json",
      "pass_criterion": "10 of 10 expiring certificates queued with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 HTTP requests issued while SIGHUP reload executes on Nginx container",
      "action": "python ./scripts/test_nginx_reload.py --requests 1000 --rps 100",
      "expected_result": "1,000 of 1,000 requests return HTTP 200 OK with 0 dropped sockets and p95 latency < 25ms",
      "evidence_location": "Nginx benchmark report in reports/reload_benchmark.json",
      "pass_criterion": "1,000 of 1,000 requests succeed with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Prometheus scrape targeting certmgr metrics endpoint `/metrics`",
      "action": "curl -s http://localhost:9090/metrics | grep cert_expiry_days",
      "expected_result": "Prometheus metric displays valid integer days remaining for all managed certificates",
      "evidence_location": "Prometheus metric output in reports/metrics_dump.txt",
      "pass_criterion": "Metric reports valid certificate expiry integer with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Forged certificate with tampered RSA signature injected into reload directory",
      "action": "go run ./cmd/certmgr --verify-cert ./fixtures/tampered_cert.pem",
      "expected_result": "Verification engine rejects tampered signature immediately and refuses Nginx reload",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms cryptographic signature verification failure with exit code 1",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected automated TLS certificate manager in Go with ACME protocol standards; delivered sub-[ISSUANCE_LATENCY] second certificate issuance via Pebble, and achieved [RELOAD_UPTIME] request success across Nginx dynamic reloads.",
    "claims": [
      {
        "text": "delivered sub-[ISSUANCE_LATENCY] second certificate issuance via Pebble",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved [RELOAD_UPTIME] request success across Nginx dynamic reloads",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "commercial DigiCert enterprise portal integration or physical HSM driver configuration"
  },
  "verify": [
    "Run `go test ./...` to confirm ACME client state machine, challenge solving, and crypto verification pass.",
    "Execute `go run ./cmd/certmgr --issue-all` to verify certificate fulfillment against Pebble test server.",
    "Run `go run ./cmd/certmgr --verify-cert ./fixtures/tampered_cert.pem` to assert cryptographic rejection."
  ],
  "worksheet": {
    "q1": "Core deliverable: an automated TLS certificate manager in Go implementing ACME protocol, encrypted storage, and dynamic Nginx reloads.",
    "q2": "Target users: security engineers, site reliability engineers, and cloud infrastructure engineers.",
    "q3": "3 use cases: multi-tenant SaaS custom domain provisioning, zero-downtime edge gateway reloads, and microservice certificate lifecycle.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: RFC 8555 state machine, DNS-01/HTTP-01 challenge completion, atomic symlink reloads, and renewal jitter scheduling.",
    "q6": "Starter input: Go ACME skeleton, Pebble Docker Compose, PostgreSQL schema, and mock Nginx configs. Synthetic domains only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Pebble local ACME server in Docker Desktop. Zero cloud fees.",
    "q8": "Riskiest component: outages from broken certificate symlinks or failed Nginx reloads. Fallback: automated pre-validation and rollback hooks.",
    "q9": "Potential faking: simple static cert copy script. Anti-fake check 5 passes a tampered certificate and confirms cryptographic signature rejection.",
    "q10": "Safe; synthetic local domain names and local Pebble container certificates only."
  }
}

b74_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete ACME state machine specifics, Pebble testing setup, and reload bounds | High |
| Recruiter Signal | "explicitly valued in security engineering" | Contains banned promotional marketing phrases | Medium |
| Rubric | Missing quantitative targets | Lacked concrete issuance durations, Nginx reload availability metrics, and anti-fake tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 28h) | Medium |
"""

b74_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go, Docker Desktop, and Pebble ACME at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. ACME issuance latency (< 4.5s), expiry scheduling (10 of 10), and Nginx reload availability (1,000 of 1,000) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Self-signed mock CA simulator if Docker Pebble container cannot be provisioned.",
  "Can test data be created in minutes?": "YES. Pebble ACME server testbed and automated verification scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial DigiCert APIs, public DNS domain purchasing, and physical HSM hardware configuration.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 passes a forged certificate with tampered RSA signature and confirms cryptographic verification rejection.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b74_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved OCSP stapling cache and multi-cloud DNS to Extended Path (+14h).
- Target Realism: Standardized difficulty to 28 hours with authentic ACME metrics (issuance duration, proactive scheduling accuracy, and Nginx reload availability).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake tampered signature rejection test.
"""

# ==============================================================================
# 75. brief-upi-payment-gateway
# ==============================================================================
b75_data = {
  "id": "brief-upi-payment-gateway",
  "title": "UPI-Style Real-Time Payment Gateway with VPA Resolution, Dynamic Bank Routing & T+1 Settlement",
  "domain": "FinTech Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["API/backend", "Security projects"],
  "problem": "Large-scale real-time payment infrastructures like UPI process billions of monthly peer-to-peer and merchant transactions, requiring sub-second response times, multi-bank failover routing, and ironclad financial consistency. Naive payment gateways suffer from double-debiting during network timeouts, race conditions across concurrent wallet balances, and ledger desynchronization during batch settlement failures. This project builds a high-throughput UPI-style payment gateway in Java and Spring Boot with Redis VPA (Virtual Payment Address) resolution, dynamic bank switching heuristics based on live latency and error rates, idempotent payment authorization, PostgreSQL double-entry bookkeeping, and an asynchronous Kafka T+1 net settlement engine.",
  "use_cases": [
    {
      "title": "High-Volume Peer-to-Merchant (P2M) QR Code Checkout",
      "first_sentence": "Retail merchants accepting dynamic QR code payments require instant payment authorization and immediate customer notification without pending state lockups.",
      "second_sentence": "The Spring Boot payment gateway authorizes inbound UPI requests in under 65ms, verifies account balance limits, and publishes payment success events to Kafka."
    },
    {
      "title": "Multi-Bank Dynamic Failover Routing during Bank Outages",
      "first_sentence": "When a major partner bank experiences sudden core banking timeouts, payment success rates across all connected merchant checkouts drop precipitously.",
      "second_sentence": "The gateway monitors rolling 60-second bank health metrics in Redis and automatically shifts transaction volume to secondary partner bank switches."
    },
    {
      "title": "Automated T+1 Merchant Position Netting & Ledger Reconciliation",
      "first_sentence": "Acquiring banks must compute aggregate gross processing volume, deduct interchange fees, and generate net settlement payout batches every 24 hours.",
      "second_sentence": "A Kafka streaming batch worker processes daily payment ledger entries, calculates net clearing positions across all merchants, and generates double-entry payout journals."
    }
  ],
  "hard_parts": [
    "Enforcing strict idempotency across distributed payment requests using atomic Redis locks and PostgreSQL unique constraint ledgers to prevent double-debits",
    "Implementing an automated double-entry bookkeeping ledger guaranteeing asset-liability equality across all financial state transitions",
    "Designing dynamic multi-bank routing algorithms with circuit breakers shifting traffic away from degraded bank simulator switches",
    "Executing asynchronous T+1 net settlement batch processing with exact financial reconciliation across millions of transaction records"
  ],
  "screener_signals": [
    "Clean Java / Spring Boot microservice repository cleanly separating VPA resolution, bank adapter interfaces, double-entry ledger services, and Kafka batchers",
    "High-concurrency benchmark report proving sustained processing of 3,500+ transactions per second with p95 latency under 65ms",
    "Anti-fake verification script issuing concurrent duplicate requests with identical idempotency keys and asserting exactly 1 debit and matching ledger entries"
  ],
  "job_families": [
    "FinTech Backend Engineer",
    "Core Payment Infrastructure Engineer",
    "Senior Distributed Systems Developer"
  ],
  "stack": [
    {"tool": "Java", "role": "primary backend programming language implementing core payment microservices and concurrency control"},
    {"tool": "Spring Boot", "role": "application framework managing REST endpoints, dependency injection, and transaction boundaries"},
    {"tool": "PostgreSQL", "role": "relational database maintaining ACID double-entry bookkeeping ledgers and transaction audit history"},
    {"tool": "Kafka", "role": "distributed event streaming platform decoupling transaction authorization from asynchronous settlement batching"},
    {"tool": "Redis", "role": "in-memory data store caching VPA directory mappings, idempotency locks, and live bank health scores"},
    {"tool": "Docker", "role": "container runtime orchestrating local PostgreSQL, Kafka, Redis, and mock bank switch containers"},
    {"tool": "Prometheus", "role": "observability platform scraping payment throughput, bank success rates, and authorization latency"}
  ],
  "architecture": {
    "components": [
      {
        "name": "VPA Directory Resolver & Virtual Payment Address Service",
        "tools_used": ["Java", "Spring Boot", "Redis"],
        "purpose": "Resolves user virtual payment addresses (e.g. user@bank) to underlying bank account numbers and IFSC routing codes"
      },
      {
        "name": "Dynamic Bank Switch Router & Circuit Breaker Engine",
        "tools_used": ["Java", "Spring Boot", "Redis"],
        "purpose": "Evaluates live bank switch error rates and routes payment requests to the highest-performing banking rail"
      },
      {
        "name": "Double-Entry Bookkeeping Ledger & Idempotency Controller",
        "tools_used": ["Java", "Spring Boot", "PostgreSQL"],
        "purpose": "Enforces distributed idempotency locks and executes atomic double-entry debit-credit accounting journals"
      },
      {
        "name": "Asynchronous Kafka T+1 Settlement & Netting Engine",
        "tools_used": ["Java", "Kafka", "PostgreSQL"],
        "purpose": "Aggregates daily transaction logs from Kafka, nets multi-merchant positions, and generates clearing batches"
      },
      {
        "name": "Payment Gateway Concurrency & Failover Benchmark Suite",
        "tools_used": ["Java", "Docker"],
        "purpose": "Benchmarks 3,500+ TPS payment throughput and verifies bank failover under simulated 504 gateway timeouts"
      },
      {
        "name": "Bank Switch Health Monitoring & Prometheus Telemetry",
        "tools_used": ["Prometheus", "Docker"],
        "purpose": "Exposes real-time payment success rates, bank switch latency histograms, and settlement lag metrics"
      },
      {
        "name": "UPI Payment Architecture Guide & Reconciliation Manual",
        "tools_used": ["Java", "Spring Boot"],
        "purpose": "Documents double-entry accounting schemas, idempotency token lifecycles, and NPCI protocol integration patterns"
      }
    ],
    "data_flow": "A client initiates a payment request with an Idempotency-Key; the gateway validates the key against Redis; the VPA resolver looks up payer and payee bank routing details from Redis cache; the dynamic bank switch router evaluates rolling bank health scores and selects the optimal bank rail; the gateway dispatches payment authorization to the mock bank switch; upon bank confirmation, the double-entry ledger writes an atomic debit-credit transaction in PostgreSQL; an event is emitted to Kafka; the T+1 settlement engine consumes Kafka events to net merchant clearing positions; Prometheus tracks payment latency and bank error rates.",
    "enforcement_mechanism": "Redis SETNX distributed locking combined with PostgreSQL unique constraints on idempotency keys and strict double-entry balance constraints."
  },
  "targets": [
    {
      "metric": "Sustained Payment Authorization Throughput & Latency",
      "method": "Transactions per second processed with full ACID double-entry ledger persistence and bank simulator authorization",
      "input": "20,000 synthetic payment requests streamed at 3,500 requests per second across 50 concurrent worker threads",
      "environment": "Standard 4-core local CPU, Docker Desktop (PostgreSQL, Kafka, Redis, Bank Simulators), Java 17",
      "minimum_pass": "Sustained throughput is >= 2,500 transactions/sec with p95 latency < 90 milliseconds",
      "target": "Sustained throughput is >= 4,200 transactions/sec with p95 latency < 55 milliseconds",
      "report": "Payment throughput benchmark report and transaction latency distribution table"
    },
    {
      "metric": "Idempotent Payment Authorization & Double-Debit Protection",
      "method": "Percentage of duplicate payment requests with identical idempotency keys resolved to exactly 1 debit and identical response",
      "input": "100 duplicate payment requests issued concurrently with the same idempotency key targeting a single user balance",
      "environment": "Spring Boot payment service with Redis distributed locks and PostgreSQL ledger constraints",
      "minimum_pass": "100 of 100 duplicate requests resolve with exactly 1 database debit and 0 balance discrepancies",
      "target": "100 of 100 duplicate requests resolve with exactly 1 database debit and 0 balance discrepancies",
      "report": "Idempotency audit log and double-entry ledger balance verification report"
    },
    {
      "metric": "Dynamic Bank Switching Failover Recovery Latency",
      "method": "Elapsed time to detect bank simulator degradation (> 15% error rate) and shift 100% of subsequent traffic to healthy rail",
      "input": "Injected 20% timeout fault into primary bank switch during continuous 500 RPS payment stream",
      "environment": "Local payment router evaluating rolling 60-second Redis health metrics across Bank A and Bank B",
      "minimum_pass": "Failover triggers within 2.5 seconds with 50 of 50 subsequent transactions routed to Bank B",
      "target": "Failover triggers within 1.1 seconds with 50 of 50 subsequent transactions routed to Bank B",
      "report": "Bank switch failover event log and route selection latency trace"
    }
  ],
  "skills": ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Redis", "Docker", "Prometheus", "FinTech", "Distributed Systems"],
  "starter_input": {
    "spec": "Directory containing Spring Boot multi-module skeleton, PostgreSQL schema migrations, mock bank switch servers, and Kafka configs.",
    "size": "16 Java source files, SQL DDL migrations, Docker Compose manifest, and 20,000 synthetic transaction test payloads",
    "seeded_cases": "Simulated bank switch 504 timeouts, duplicate idempotency keys, insufficient account balances, and corrupted VPA strings",
    "label_source": "Deterministic PostgreSQL double-entry ledger balances, bank switch transaction IDs, and Kafka offset commits",
    "personal_data_policy": "Strictly mock synthetic Indian phone numbers and simulated VPA identifiers; no real personal data used"
  },
  "components": [
    {"name": "VPA Directory Resolver & Virtual Payment Address Service", "task_type": "API endpoint group with tests", "hours": 6.0},
    {"name": "Dynamic Bank Switch Router & Circuit Breaker Engine", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "Double-Entry Bookkeeping Ledger & Idempotency Controller", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Asynchronous Kafka T+1 Settlement & Netting Engine", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Payment Gateway Concurrency & Failover Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 5.0},
    {"name": "Bank Switch Health Monitoring & Prometheus Telemetry", "task_type": "observability", "hours": 4.0},
    {"name": "UPI Payment Architecture Guide & Reconciliation Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Fraud anomaly detection engine using Redis probabilistic Bloom filters and sliding window velocity checks",
      "Hardware-security PIN validation module simulating HSM ISO 8583 payment message packaging",
      "Multi-currency cross-border payment settlement engine supporting FX rate lookups and currency conversion"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Spring Boot Payment Architecture & VPA Resolution in Java and Spring Boot",
      "hours": 10,
      "done_criterion": "VPA resolution service caches virtual payment addresses in Redis; tests pass."
    },
    {
      "name": "Double-Entry Bookkeeping Ledger & Idempotency Locks in PostgreSQL and Redis",
      "hours": 10,
      "done_criterion": "PostgreSQL double-entry ledger enforces balanced debits and credits; duplicate keys reject double-debit."
    },
    {
      "name": "Dynamic Bank Switching & Asynchronous T+1 Settlement in Kafka, Docker and Distributed Systems",
      "hours": 10,
      "done_criterion": "Router shifts traffic to secondary bank during simulated timeouts; Kafka nets T+1 settlement batches."
    },
    {
      "name": "Concurrency Benchmark, Anti-Fake Duplicate Request Test & Docs in Prometheus and FinTech",
      "hours": 10,
      "done_criterion": "System sustains 3,500+ TPS; anti-fake duplicate test prevents double debit; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Java and Spring Boot (Spring Data JPA, Spring Web, Spring Kafka), and SQL transactions",
    "Understanding of distributed systems principles: idempotency, ACID guarantees, message queues, and caching"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, in-memory caching, and relational database bound)",
    "cost": "$0 (fully open-source stack using local PostgreSQL, Kafka, and Redis in Docker Desktop)",
    "accounts_keys_quotas": "No external bank API keys, merchant merchant IDs, or paid cloud services required",
    "reference_environment": "Local 4-core CPU, Docker Desktop (PostgreSQL 15, Redis 7, Kafka 3.4), Java 17+, Maven 3.8+",
    "fallback_path": "H2 in-memory database and embedded Redis mock if Docker containers cannot be provisioned"
  },
  "riskiest_component": {
    "name": "Double-Debit Accounting Inconsistencies from Race Conditions during Bank Timeouts",
    "mitigation": "Wrap ledger mutations in SERIALIZABLE database transactions and enforce distributed Redis locks on idempotency keys.",
    "fallback": "Automated reversal reconciliation daemon scanning pending transactions and issuing offsetting credits."
  },
  "deliverables": [
    "Java Spring Boot microservice repository containing payment gateway, VPA resolver, and bank router",
    "Docker Compose environment orchestrating PostgreSQL, Redis, Kafka, and mock bank switch containers",
    "Prometheus dashboard configuration and Grafana JSON for real-time payment transaction monitoring",
    "Screener verification script executing automated benchmark, bank failover, and anti-fake duplicate tests in under 3 minutes"
  ],
  "out_of_scope": [
    "Live NPCI UPI production switch certification and proprietary XML envelope signatures",
    "Real customer bank account verification with Indian commercial banks",
    "Card network (Visa/Mastercard) ISO 8583 hardware switch terminal integration"
  ],
  "safety_note": None,
  "resources": [
    "NPCI Unified Payments Interface (UPI) Procedural Guidelines & API Specs",
    "Martin Fowler: Accounting Patterns & Double-Entry Bookkeeping Architecture",
    "Spring Boot & Spring Kafka Distributed Systems Documentation"
  ],
  "rubric": [
    {
      "input": "20,000 synthetic payment requests sent across 50 worker threads",
      "action": "mvn test -Dtest=PaymentGatewayThroughputBenchmark",
      "expected_result": "Gateway sustains >= 2,500 TPS with p95 authorization latency < 90ms",
      "evidence_location": "Benchmark report in reports/throughput_benchmark.json",
      "pass_criterion": "Sustained throughput >= 2,500 TPS with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 concurrent duplicate requests with identical idempotency key",
      "action": "python ./scripts/test_idempotency.py --key dup_test_888 --requests 100",
      "expected_result": "100 requests return identical transaction ID; ledger shows exactly 1 debit entry",
      "evidence_location": "Ledger audit log in reports/idempotency_audit.json",
      "pass_criterion": "Exactly 1 debit recorded across 100 requests with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Injected 20% timeout fault into primary bank switch during 500 RPS stream",
      "action": "python ./scripts/test_bank_failover.py --fault timeout --rate 0.2",
      "expected_result": "Router detects degradation within 2.5s and switches 50 of 50 subsequent transactions to Bank B",
      "evidence_location": "Failover audit log in reports/failover_audit.json",
      "pass_criterion": "50 of 50 subsequent transactions route to Bank B with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Kafka T+1 settlement batch job executing over 10,000 daily transaction events",
      "action": "python ./scripts/run_settlement_batch.py --date 2026-10-17",
      "expected_result": "Settlement engine nets merchant balances with exact debit-credit reconciliation matching zero ledger delta",
      "evidence_location": "Settlement report in reports/settlement_audit.json",
      "pass_criterion": "Settlement nets positions with 0 reconciliation discrepancies and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated double-spend attack sending concurrent debit requests on low-balance wallet",
      "action": "python ./scripts/test_double_spend.py --account acc_user_123 --amount 500 --balance 500",
      "expected_result": "First request authorizes successfully; second concurrent request is rejected with HTTP 402 Insufficient Funds",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms exactly 1 authorization and 1 insufficient funds rejection with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected UPI payment gateway in Java and Spring Boot with Redis VPA resolution; sustained [PAYMENT_TPS] transactions per second with sub-[AUTH_LATENCY] millisecond authorization latency, and enforced double-debit protection across multi-bank routing.",
    "claims": [
      {
        "text": "sustained [PAYMENT_TPS] transactions per second with sub-[AUTH_LATENCY] millisecond authorization latency",
        "rubric_indexes": [0]
      },
      {
        "text": "enforced double-debit protection across multi-bank routing",
        "rubric_indexes": [1, 2]
      }
    ],
    "do_not_claim": "live NPCI production switch network access or real customer bank account integrations"
  },
  "verify": [
    "Run `mvn test` to confirm VPA resolution, bank routing, and double-entry ledger tests pass.",
    "Execute `python ./scripts/test_idempotency.py` to verify duplicate payments do not trigger double-debiting.",
    "Run `python ./scripts/test_double_spend.py` to assert wallet balance concurrency protection."
  ],
  "worksheet": {
    "q1": "Core deliverable: a high-throughput UPI-style payment gateway in Java and Spring Boot with VPA resolution, bank routing, and settlement.",
    "q2": "Target users: fintech backend engineers, payment infrastructure engineers, and senior distributed systems developers.",
    "q3": "3 use cases: high-volume P2M QR checkouts, dynamic bank failover during outages, and automated T+1 merchant position netting.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: strict idempotency across distributed nodes, atomic double-entry bookkeeping, dynamic bank failover, and T+1 netting.",
    "q6": "Starter input: Spring Boot multi-module skeleton, PostgreSQL migrations, mock bank switch servers, and transaction test payloads.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/cache bound, $0 cost using Docker containers. Zero cloud fees.",
    "q8": "Riskiest component: double-debiting from race conditions during bank timeouts. Fallback: SERIALIZABLE ledger mutations and Redis distributed locks.",
    "q9": "Potential faking: basic CRUD app pretending to be payment gateway. Anti-fake check 5 executes concurrent double-spend attack and asserts 1 rejection.",
    "q10": "Safe; synthetic Indian phone numbers and mock banking accounts only."
  }
}

b75_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, double-entry ledger specs, and bank switching bounds | High |
| Real World Use Cases | Leftover template phrases "top tech platforms" | Contains broken template strings and repetitive placeholder lines | High |
| Rubric | Missing quantitative targets | Lacked concrete TPS targets, bank failover latencies, and double-spend anti-fake tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b75_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Java 17 and Docker Desktop at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Payment throughput (>= 2,500 TPS), idempotency (100 of 100), and bank failover (< 2.5s) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. H2 in-memory database and embedded Redis mock if Docker containers cannot be provisioned.",
  "Can test data be created in minutes?": "YES. Mock bank switch containers and automated transaction test payloads included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: live NPCI production switches, real commercial bank integrations, and card network hardware switches.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 executes concurrent double-spend requests on a single wallet balance and asserts exactly 1 authorization and 1 rejection.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0, 1, and 2."
}

b75_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved fraud anomaly detection and HSM ISO 8583 packaging to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic payment metrics (sustained TPS, idempotency double-debit prevention, and bank failover latency).
- Removed Banned Content: Removed repetitive 'top tech platforms' placeholder words.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake concurrent double-spend attack test.
"""

# ==============================================================================
# 76. brief-vector-db-from-scratch
# ==============================================================================
b76_data = {
  "id": "brief-vector-db-from-scratch",
  "title": "HNSW Vector Database from Scratch with Cosine Similarity, Multi-Layer Graph Index & REST API",
  "domain": "AI/ML Applications",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "Search/recommendation"],
  "problem": "Modern generative AI systems and Retrieval-Augmented Generation (RAG) pipelines rely fundamentally on high-recall, low-latency vector similarity search across high-dimensional embeddings. Off-the-shelf commercial vector databases (e.g. Pinecone, Weaviate) are expensive managed cloud services that function as opaque black boxes, hiding algorithmic indexing bottlenecks, memory consumption profiles, and recall-latency tradeoffs. Furthermore, naive flat brute-force search scales with O(N) linear complexity, becoming computationally unusable beyond modest vector counts. This project builds a production-grade HNSW (Hierarchical Navigable Small World) vector database from scratch in Python and NumPy without third-party vector search libraries. The engine constructs a multi-layer proximity graph with configurable connection parameters (M) and construction beam widths (ef_construction), implements greedy search with heuristic pruning, achieves >= 95% Recall@10 against exact brute-force search on 100,000 vectors, serializes graph indices to disk, and exposes a high-concurrency FastAPI query interface with sub-6ms search latency.",
  "use_cases": [
    {
      "title": "Retrieval-Augmented Generation (RAG) Semantic Document Retrieval",
      "first_sentence": "Enterprise knowledge base chatbots querying millions of document text chunk embeddings must retrieve the top-10 most semantically relevant contexts in milliseconds.",
      "second_sentence": "The custom HNSW index traverses hierarchical graph layers via cosine distance, returning top-10 nearest chunk vectors with over 95% recall compared to brute-force search."
    },
    {
      "title": "E-Commerce Semantic Product Visual Similarity Search",
      "first_sentence": "Online retail platforms allowing customers to search for visually similar fashion items via deep learning image embeddings need low-latency catalog indexing.",
      "second_sentence": "The engine constructs multi-layer proximity graphs over 100,000 image feature vectors, enabling sub-6ms nearest neighbor lookups during peak traffic."
    },
    {
      "title": "Real-Time Facial Recognition Identity Matching Engine",
      "first_sentence": "Security systems matching live camera video face embeddings against authorized employee databases require deterministic nearest neighbor ranking.",
      "second_sentence": "The vector database serializes binary graph structures to disk and provides instant warm-restart index loading without re-indexing raw vector corpora."
    }
  ],
  "hard_parts": [
    "Implementing the multi-layer HNSW graph construction algorithm with exponential layer decay probabilities and heuristic neighbor selection in pure Python/NumPy",
    "Optimizing beam search traversal across upper sparse layers and greedy search across dense bottom layers to balance query latency with recall accuracy",
    "Vectorizing cosine similarity and L2 Euclidean distance computations using NumPy array operations to achieve sub-6ms query latency on single-core CPU",
    "Implementing compact binary disk persistence for multi-million edge graph adjacency lists and fast memory-mapped index reloading"
  ],
  "screener_signals": [
    "Clean Python repository implementing HNSW graph data structures, distance functions, index builders, and FastAPI endpoints from first principles",
    "Algorithmic benchmark report proving >= 95% Recall@10 against exact brute-force ground truth on a 100,000 vector corpus (128-dimensional)",
    "Anti-fake verification script querying a known synthetic outlier vector with deterministic nearest neighbors and asserting exact rank-order recall parity"
  ],
  "job_families": [
    "Machine Learning Systems Engineer",
    "Search & Retrieval Infrastructure Engineer",
    "Core Backend Systems Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary systems programming language implementing HNSW graph algorithms and distance math"},
    {"tool": "NumPy", "role": "high-performance numerical computing library optimizing vectorized cosine and Euclidean distance calculations"},
    {"tool": "HNSW Algorithm", "role": "hierarchical navigable small world graph-based approximate nearest neighbor indexing algorithm"},
    {"tool": "FastAPI", "role": "asynchronous web framework exposing REST endpoints for vector insertion, batch indexing, and similarity search"},
    {"tool": "Docker", "role": "container runtime packaging the vector database service, benchmark harness, and evaluation test suites"},
    {"tool": "Pytest", "role": "testing framework executing recall benchmarks, algorithmic unit tests, and persistence validation"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Vector Distance Metric Engine & Math Kernels",
        "tools_used": ["Python", "NumPy"],
        "purpose": "Implements vectorized cosine similarity, dot product, and L2 Euclidean distance calculations with SIMD vectorization"
      },
      {
        "name": "HNSW Multi-Layer Graph Construction & Neighbor Pruning Engine",
        "tools_used": ["Python", "HNSW Algorithm"],
        "purpose": "Builds hierarchical small-world graph layers, selects entry points, and applies heuristic neighbor connection limits"
      },
      {
        "name": "Approximate Nearest Neighbor Beam Search Traversal Engine",
        "tools_used": ["Python", "HNSW Algorithm"],
        "purpose": "Executes greedy layer traversal from top layer down to bottom layer with configurable ef_search candidate pools"
      },
      {
        "name": "FastAPI Asynchronous Vector Query & Indexing Service",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Provides high-concurrency HTTP REST API for vector insertion, bulk indexing, top-K search queries, and health checks"
      },
      {
        "name": "Binary Graph Serialization & Memory-Mapped Persistence Layer",
        "tools_used": ["Python", "NumPy"],
        "purpose": "Serializes graph adjacency structures and raw vector arrays to binary disk files with fast deserialization"
      },
      {
        "name": "HNSW Recall & Latency Benchmark Harness with Brute-Force Baseline",
        "tools_used": ["Python", "Docker", "Pytest"],
        "purpose": "Generates 100,000 synthetic embeddings, computes exact brute-force ground truth, and benchmarks Recall@10 and p95 latency"
      },
      {
        "name": "HNSW Algorithm Guide & Vector Database Architecture Manual",
        "tools_used": ["Python", "HNSW Algorithm"],
        "purpose": "Documents small-world navigation theorems, parameter tuning guidelines (M, ef_construction), and complexity proofs"
      }
    ],
    "data_flow": "A client sends an embedding vector via FastAPI `/search`; the API parses query vector and parameters (K, ef_search); the search engine starts at the top-layer entry point of the HNSW graph; greedy search traverses down through sparse layers finding closest local minima; at layer 0, beam search evaluates candidates in a priority queue using NumPy cosine similarity; the top-K nearest vector IDs and similarity scores are returned to the client; on vector insertion (`/insert`), a random layer is assigned via exponential distribution; the graph connects the new vector to M neighbors per layer using heuristic pruning; periodic persistence writes graph state to disk.",
    "enforcement_mechanism": "Exact mathematical cosine distance assertions and ground truth comparison against numpy.linalg brute-force matrix multiplication."
  },
  "targets": [
    {
      "metric": "Approximate Nearest Neighbor Recall@10 vs Brute-Force Ground Truth",
      "method": "Percentage of top-10 true nearest neighbors identified by HNSW search compared to exact brute-force linear scan across 1,000 query vectors",
      "input": "100,000 synthetic 128-dimensional normalized dense vectors with 1,000 test query embeddings",
      "environment": "Standard 4-core local CPU, Python 3.11 with NumPy 1.24+, parameters M=16, ef_construction=200, ef_search=64",
      "minimum_pass": "Average Recall@10 is >= 93.0% across 1,000 test queries",
      "target": "Average Recall@10 is >= 96.5% across 1,000 test queries",
      "report": "HNSW recall evaluation report and recall-vs-ef_search tradeoff curve"
    },
    {
      "metric": "Vector Similarity Search Query Latency",
      "method": "Wall-clock time to execute top-10 similarity search across indexed 100,000 vector corpus",
      "input": "1,000 query vectors executed sequentially with ef_search=64",
      "environment": "Standard 4-core local CPU, single worker process, in-memory graph index",
      "minimum_pass": "p95 search latency is < 8.0 milliseconds per query",
      "target": "p95 search latency is < 4.2 milliseconds per query",
      "report": "Query latency distribution report and percentile breakdown table"
    },
    {
      "metric": "Index Construction Throughput on 100,000 Vector Corpus",
      "method": "Elapsed wall-clock time to insert and index 100,000 vectors with M=16 and ef_construction=100 on standard CPU",
      "input": "100,000 synthetic 128-dimensional dense vectors loaded in memory",
      "environment": "Standard 4-core local CPU, multi-threaded index builder in Python",
      "minimum_pass": "Index construction completes in < 300 seconds (5.0 minutes)",
      "target": "Index construction completes in < 180 seconds (3.0 minutes)",
      "report": "Index build throughput log and memory consumption profile"
    }
  ],
  "skills": ["Python", "NumPy", "HNSW Algorithm", "FastAPI", "Docker", "Pytest", "Algorithms", "Vector Search"],
  "starter_input": {
    "spec": "Directory containing HNSW graph class skeleton, vectorized distance functions, FastAPI web app, and benchmark runner.",
    "size": "8 Python modules, test fixtures, Dockerfile, and 100,000 synthetic 128-dimensional normalized test vectors in NumPy .npy format",
    "seeded_cases": "Zero vectors, identical duplicate embeddings, orthogonal vectors, and corrupted serialized index header files",
    "label_source": "Deterministic brute-force nearest neighbor matrices calculated via exact NumPy dot product linear scans",
    "personal_data_policy": "Strictly mock synthetic dense float vectors generated via normal random distributions; no real personal data used"
  },
  "components": [
    {"name": "Vector Distance Metric Engine & Math Kernels", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "HNSW Multi-Layer Graph Construction & Neighbor Pruning Engine", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "Approximate Nearest Neighbor Beam Search Traversal Engine", "task_type": "model train + evaluate cycle", "hours": 6.0},
    {"name": "FastAPI Asynchronous Vector Query & Indexing Service", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Binary Graph Serialization & Memory-Mapped Persistence Layer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "HNSW Recall & Latency Benchmark Harness with Brute-Force Baseline", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "HNSW Algorithm Guide & Vector Database Architecture Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Product Quantization (PQ) vector compression reducing in-memory footprint by 4x with minimal recall loss",
      "Filtered vector search supporting structured metadata boolean predicates (e.g. category, date range) during graph traversal",
      "Distributed sharding with consistent hashing across multiple HNSW index nodes with scatter-gather queries"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Vector Distance Metrics & Brute-Force Ground Truth in Python and NumPy",
      "hours": 10,
      "done_criterion": "Vectorized cosine and L2 distance functions pass unit tests; exact brute-force baseline generates ground truth."
    },
    {
      "name": "HNSW Multi-Layer Graph Index Construction & Pruning in HNSW Algorithm and Pytest",
      "hours": 10,
      "done_criterion": "Hierarchical graph builds across 100,000 vectors; neighbor pruning respects maximum degree limits."
    },
    {
      "name": "Greedy Beam Search, Recall Tuning & FastAPI Server in FastAPI and Vector Search",
      "hours": 10,
      "done_criterion": "FastAPI exposes `/search` and `/insert`; Recall@10 exceeds 93% with p95 latency under 8ms."
    },
    {
      "name": "Disk Persistence, Anti-Fake Deterministic Parity Test & Docs in Docker and Algorithms",
      "hours": 10,
      "done_criterion": "Index saves and reloads from disk with identical search recall; anti-fake test asserts exact neighbor match; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python, NumPy array broadcasting, data structures (graphs, priority queues, heaps), and algorithm complexity",
    "Understanding of linear algebra, high-dimensional vector spaces, distance metrics, and approximate nearest neighbor concepts"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU bound NumPy vectorized numerical linear algebra)",
    "cost": "$0 (fully open-source stack using local Python and Docker Desktop)",
    "accounts_keys_quotas": "No external cloud API keys, paid vector database accounts (Pinecone/Weaviate), or managed services required",
    "reference_environment": "Local 4-core CPU, 8GB RAM, Python 3.11, NumPy 1.24+, Docker Desktop",
    "fallback_path": "Pure Python math fallback if compiled NumPy C-extensions cannot be initialized"
  },
  "riskiest_component": {
    "name": "Severe Recall Degradation from Poor Upper-Layer Graph Connectivity",
    "mitigation": "Enforce minimum degree constraints on layer-0 entry points and apply heuristic neighbor selection favoring diverse angles.",
    "fallback": "Automatic fallback to larger ef_search candidate pools if recall falls below 90% threshold."
  },
  "deliverables": [
    "Python repository containing pure HNSW graph engine, vectorized distance kernels, and FastAPI server",
    "Benchmark script comparing HNSW recall and latency tradeoffs against exact NumPy brute-force search",
    "Evaluation report containing Recall@10 vs ef_search curves and memory footprint measurements across 100,000 vectors",
    "Screener verification script executing automated benchmark, disk reload test, and anti-fake validation in under 3 minutes"
  ],
  "out_of_scope": [
    "GPU-accelerated CUDA vector search (e.g. FAISS GPU kernel implementations)",
    "Petabyte-scale distributed cluster consensus management (Raft over vector partitions)",
    "End-to-end multimodal embedding model training (CLIP or BERT fine-tuning)"
  ],
  "safety_note": None,
  "resources": [
    "Malkov & Yashunin (2018): Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs",
    "Pinecone Research: Hierarchical Navigable Small World (HNSW) Explained",
    "NumPy Vectorization Best Practices for High-Dimensional Array Distance Computing"
  ],
  "rubric": [
    {
      "input": "1,000 query vectors evaluated across indexed 100,000 vector corpus",
      "action": "python ./benchmarks/evaluate_recall.py --vectors 100000 --queries 1000 --k 10",
      "expected_result": "HNSW search achieves >= 93.0% Recall@10 compared to exact brute force",
      "evidence_location": "Recall report in reports/recall_benchmark.json",
      "pass_criterion": "Recall@10 >= 93.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 sequential top-10 queries executed via FastAPI search endpoint",
      "action": "python ./benchmarks/measure_latency.py --queries 1000 --ef-search 64",
      "expected_result": "Query search latency achieves p95 < 8.0ms per request",
      "evidence_location": "Latency distribution report in reports/latency_benchmark.json",
      "pass_criterion": "p95 search latency < 8.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100,000 synthetic 128-dimensional vectors indexed in single batch",
      "action": "python ./benchmarks/build_index.py --vectors 100000 --m 16 --ef-con 100",
      "expected_result": "Index construction finishes in < 300 seconds with memory consumption < 2.5GB",
      "evidence_location": "Build timing log in reports/index_build.json",
      "pass_criterion": "Build time < 300s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Pre-built HNSW index serialized to disk at `index.bin` and reloaded into fresh process",
      "action": "python ./scripts/verify_persistence.py --index-path ./index.bin",
      "expected_result": "Reloaded index performs 100 sample queries with 100 of 100 identical nearest neighbor IDs",
      "evidence_location": "Persistence verification log in reports/persistence_audit.json",
      "pass_criterion": "100 of 100 identical neighbor results with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Querying synthetic probe vector 'probe_vec_42' with mathematically precomputed nearest neighbor ID 7194",
      "action": "python ./scripts/verify_exact_probe.py --probe-id probe_vec_42 --expected-id 7194",
      "expected_result": "HNSW index returns vector ID 7194 in rank-1 position with cosine distance within 0.0001",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms rank-1 match for ID 7194 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Built HNSW vector database from scratch in Python with NumPy; achieved [RECALL_ACCURACY] recall on [VECTOR_COUNT] high-dimensional vectors, and delivered sub-[SEARCH_LATENCY] millisecond search latency across REST endpoints.",
    "claims": [
      {
        "text": "achieved [RECALL_ACCURACY] recall on [VECTOR_COUNT] high-dimensional vectors",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[SEARCH_LATENCY] millisecond search latency across REST endpoints",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "managed Pinecone cloud infrastructure deployment or CUDA hardware kernel acceleration"
  },
  "verify": [
    "Run `pytest tests/` to confirm distance functions, graph traversal, and FastAPI endpoints pass.",
    "Execute `python ./benchmarks/evaluate_recall.py` to verify Recall@10 exceeds 93% on 100k vectors.",
    "Run `python ./scripts/verify_exact_probe.py` to assert deterministic rank-1 nearest neighbor matching."
  ],
  "worksheet": {
    "q1": "Core deliverable: an HNSW vector database built from scratch in Python and NumPy with cosine distance, graph indexing, and FastAPI.",
    "q2": "Target users: machine learning systems engineers, search infrastructure engineers, and backend systems architects.",
    "q3": "3 use cases: RAG document retrieval, e-commerce visual similarity search, and real-time facial recognition matching.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: pure Python/NumPy HNSW graph construction, greedy beam search traversal, SIMD distance optimizations, and binary disk persistence.",
    "q6": "Starter input: HNSW class skeleton, distance functions, FastAPI web app, and 100k synthetic vectors in .npy format. Synthetic vectors only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using local Python and Docker Desktop. Zero cloud fees.",
    "q8": "Riskiest component: recall degradation from sparse upper-layer graph connections. Fallback: heuristic neighbor selection and dynamic ef_search widening.",
    "q9": "Potential faking: brute force search wrapped in a fake graph class. Anti-fake check 5 queries a synthetic probe vector and asserts exact rank-1 nearest neighbor ID.",
    "q10": "Safe; synthetic dense float vectors generated via normal distributions only."
  }
}

b76_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete algorithmic framing, graph parameter specs (M, ef_construction), and latency bounds | High |
| Tech Stack | Python, NumPy, HNSW Algorithm, FastAPI, Docker | Listed tools without explicit operational roles or mathematical optimization boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete Recall@10 bounds, p95 query latency thresholds, and probe vector anti-fake tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b76_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python 3.11 and NumPy at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Recall@10 (>= 93.0%), search latency (< 8.0ms), and build time (< 300s) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Pure Python math fallback if compiled NumPy C-extensions cannot be initialized.",
  "Can test data be created in minutes?": "YES. Synthetic 128-dimensional dense vector generator and brute-force evaluation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: GPU CUDA kernels, distributed Raft clustering over partitions, and end-to-end embedding model training.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 queries a probe vector with precomputed nearest neighbor and asserts exact rank-1 match and distance tolerance.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b76_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Product Quantization (PQ) and distributed sharding to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic similarity search metrics (Recall@10 vs brute force, query latency, and index construction duration).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake deterministic probe vector nearest neighbor test.
"""

# ==============================================================================
# 77. brief-workflow-engine
# ==============================================================================
b77_data = {
  "id": "brief-workflow-engine",
  "title": "Distributed Workflow Orchestration Engine with Event Sourcing, Saga Compensation & Crash Recovery",
  "domain": "Distributed Systems",
  "difficulty": "ADVANCED",
  "project_types": ["Distributed systems", "API/backend"],
  "problem": "Multi-step distributed business processes (e-commerce order fulfillment, fintech loan origination, cross-service media transcoding) span heterogeneous microservices that fail unpredictably due to network partitions, database deadlocks, and worker node crashes. Ad-hoc script orchestrators and point-to-point HTTP integrations lack crash-safe state checkpointing, resulting in orphaned tasks, duplicated financial activities, and inability to rollback distributed state upon partial failure. This project builds a durable, distributed workflow orchestration engine in Go inspired by Temporal and Conductor. The engine models workflows as deterministic state machines, records execution history via PostgreSQL event sourcing, distributes activity execution over Kafka worker queues, guarantees deterministic replay upon process restart, executes automated Saga compensation handlers on failure, and exposes a management REST API with sub-900ms crash recovery.",
  "use_cases": [
    {
      "title": "E-Commerce Multi-Step Order Fulfillment & Inventory Reservation",
      "first_sentence": "E-commerce platforms executing checkout pipelines involving inventory reservations, payment authorizations, and warehouse dispatch must guarantee end-to-end consistency.",
      "second_sentence": "The Go workflow engine orchestrates multi-step activities; if payment authorization fails, the engine triggers automated compensating actions to release reserved warehouse inventory."
    },
    {
      "title": "FinTech Multi-Tier Loan Origination & KYC Verification Pipeline",
      "first_sentence": "Digital lending applications requiring asynchronous credit bureau checks, document identity verifications, and underwriting approvals can stall across days.",
      "second_sentence": "The engine checkpoints workflow progress into PostgreSQL event stores, waking hibernating workflows deterministically upon asynchronous webhook receipt."
    },
    {
      "title": "Distributed Cloud Media Transcoding & Video Pipeline Orchestration",
      "first_sentence": "Video processing platforms ingesting raw 4K footage must divide files into chunks, execute parallel GPU encoding tasks, and assemble master HLS manifests.",
      "second_sentence": "The engine schedules parallel activities across Kafka worker pools, monitoring task heartbeats and automatically re-queuing dropped tasks upon worker node crashes."
    }
  ],
  "hard_parts": [
    "Designing a deterministic workflow history replayer in Go that reconstructs in-memory execution state from append-only PostgreSQL event streams",
    "Implementing backward Saga compensation workflows that trigger compensating activities in reverse execution order upon downstream failures",
    "Guaranteeing exactly-once activity execution semantics using Kafka message keys, worker heartbeats, and idempotent task completion tokens",
    "Handling worker process crashes (SIGKILL) mid-workflow and recovering execution state within sub-second recovery bounds"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating workflow definitions, state machine history replayer, event sourcing persistence, and Kafka worker dispatchers",
    "High-concurrency benchmark report proving sustained execution of 1,200+ concurrent workflow activities per second with sub-50ms latency",
    "Anti-fake verification script killing a worker node mid-workflow at step 3, asserting heartbeat timeout detection, state recovery, and successful completion"
  ],
  "job_families": [
    "Distributed Systems Engineer",
    "Core Infrastructure Platform Engineer",
    "Senior Backend Systems Architect"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing workflow state machines, history replayer, and worker daemons"},
    {"tool": "PostgreSQL", "role": "relational database serving as append-only event sourcing store for workflow execution history logs"},
    {"tool": "Kafka", "role": "distributed message streaming broker queuing workflow activity tasks and distributing work to worker pools"},
    {"tool": "Event Sourcing", "role": "architectural pattern recording all workflow state changes as immutable append-only event logs"},
    {"tool": "Saga Pattern", "role": "distributed transaction pattern coordinating backward compensating activities upon failure"},
    {"tool": "Docker", "role": "container runtime packaging PostgreSQL, Kafka, workflow coordinator, and mock activity workers"},
    {"tool": "Prometheus", "role": "observability platform scraping workflow completion rates, execution latencies, and compensation counters"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Workflow State Machine & History Replayer Engine",
        "tools_used": ["Go", "Event Sourcing"],
        "purpose": "Executes deterministic workflow decision code, replays historical event streams, and schedules pending activities"
      },
      {
        "name": "Append-Only Event Sourcing Store & Postgres Repository",
        "tools_used": ["Go", "PostgreSQL", "Event Sourcing"],
        "purpose": "Persists immutable event logs (WorkflowStarted, ActivityScheduled, ActivityCompleted) with optimistic concurrency locks"
      },
      {
        "name": "Kafka Activity Task Queue & Worker Dispatcher",
        "tools_used": ["Go", "Kafka"],
        "purpose": "Distributes activity tasks across worker pools, tracks worker heartbeats, and handles task lease expiries"
      },
      {
        "name": "Saga Compensation & Distributed Rollback Controller",
        "tools_used": ["Go", "Saga Pattern"],
        "purpose": "Executes compensating activities in reverse order when a workflow encounters non-retryable failures or cancellations"
      },
      {
        "name": "Workflow Coordinator REST API & Status Query Service",
        "tools_used": ["Go", "Docker"],
        "purpose": "Exposes HTTP endpoints for starting workflows, polling execution status, terminating runs, and querying audit histories"
      },
      {
        "name": "Distributed Workflow Concurrency & Crash Recovery Benchmark Suite",
        "tools_used": ["Go", "Docker", "Prometheus"],
        "purpose": "Generates 1,200 activities/sec and benchmarks crash recovery duration during simulated worker SIGKILL events"
      },
      {
        "name": "Durable Workflow Orchestration Guide & Saga Pattern Manual",
        "tools_used": ["Go", "Saga Pattern"],
        "purpose": "Documents deterministic replay rules, event sourcing schemas, and idempotency key patterns for distributed activities"
      }
    ],
    "data_flow": "A client submits a workflow via REST API; the coordinator writes WorkflowStarted to PostgreSQL; the decision engine determines the first activity and publishes an ActivityTask to Kafka; a worker polls Kafka, executes the activity, and sends ActivityCompleted with results; the coordinator appends the event to PostgreSQL and evaluates the next step; if an unrecoverable failure occurs at step 3, the Saga compensation controller is invoked; it traverses history backwards and dispatches compensating tasks (CompensateStep2, CompensateStep1) to Kafka; upon worker crash, a secondary worker re-reads event history from PostgreSQL, reconstructs state, and resumes execution without re-executing completed activities; Prometheus scrapes workflow metrics.",
    "enforcement_mechanism": "Deterministic event sourcing replay checks verifying state parity before dispatching activities, with PostgreSQL version row locks."
  },
  "targets": [
    {
      "metric": "Sustained Workflow Activity Execution Throughput",
      "method": "Completed activity tasks per second across 500 concurrent workflow instances with full PostgreSQL event sourcing persistence",
      "input": "5,000 multi-step workflow activities distributed across 20 worker threads",
      "environment": "Standard 4-core local CPU, Docker Desktop (PostgreSQL 15, Kafka 3.4), Go 1.21+",
      "minimum_pass": "Sustained throughput is >= 800 activity tasks per second with p95 latency < 75ms",
      "target": "Sustained throughput is >= 1,500 activity tasks per second with p95 latency < 35ms",
      "report": "Workflow execution benchmark report and task processing latency log"
    },
    {
      "metric": "Deterministic Process Crash Recovery Replay Duration",
      "method": "Wall-clock duration from simulated worker SIGKILL mid-workflow to full state recovery and resumption of pending activities",
      "input": "Worker killed at step 3 of a 5-step workflow with 10 historical events stored in PostgreSQL",
      "environment": "Go workflow coordinator running with 500ms heartbeat timeout monitoring",
      "minimum_pass": "State reconstruction and activity resumption completes in < 1.2 seconds with 0 state corruption",
      "target": "State reconstruction and activity resumption completes in < 650 milliseconds with 0 state corruption",
      "report": "Crash recovery event timing log and deterministic replay audit summary"
    },
    {
      "metric": "Saga Backward Compensation Rollback Parity Rate",
      "method": "Percentage of simulated workflow failures triggering exact reverse-order execution of all compensating activities",
      "input": "50 synthetic workflows programmed to fail at step 3, requiring compensation for steps 1 and 2",
      "environment": "Kafka worker pool configured with automated Saga compensation handlers",
      "minimum_pass": "50 of 50 failed workflows execute compensation in exact reverse order with 0 orphaned resources",
      "target": "50 of 50 failed workflows execute compensation in exact reverse order with 0 orphaned resources",
      "report": "Saga compensation execution audit log and reverse activity sequence trace"
    }
  ],
  "skills": ["Go", "PostgreSQL", "Kafka", "Event Sourcing", "Saga Pattern", "Docker", "Prometheus", "Distributed Systems"],
  "starter_input": {
    "spec": "Directory containing Go workflow engine skeleton, PostgreSQL event schema DDL, Kafka activity producers/workers, and test suite.",
    "size": "14 Go source files, SQL migration scripts, Docker Compose manifest, and automated chaos injection scripts",
    "seeded_cases": "Worker crash mid-activity, poison-pill activity payloads, network partitions between worker and DB, and non-deterministic workflow code",
    "label_source": "Deterministic PostgreSQL append-only event stream IDs, Kafka commit offsets, and workflow execution status strings",
    "personal_data_policy": "Strictly mock synthetic enterprise workflow payloads and simulated order IDs; no real personal data used"
  },
  "components": [
    {"name": "Workflow State Machine & History Replayer Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Append-Only Event Sourcing Store & Postgres Repository", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Kafka Activity Task Queue & Worker Dispatcher", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "Saga Compensation & Distributed Rollback Controller", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Workflow Coordinator REST API & Status Query Service", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Distributed Workflow Concurrency & Crash Recovery Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Durable Workflow Orchestration Guide & Saga Pattern Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic cron workflow scheduling with distributed timer wheels and sub-second wakeup resolution",
      "Web-based visual DAG workflow execution dashboard rendering live step status and event timelines",
      "Cross-region active-active PostgreSQL event store replication with conflict-free deterministic replay"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Go State Machine & Event Sourcing Store in Go, PostgreSQL and Event Sourcing",
      "hours": 10,
      "done_criterion": "PostgreSQL append-only event store logs workflow events; state machine replays history deterministically."
    },
    {
      "name": "Kafka Worker Task Queue & Activity Execution in Kafka and Distributed Systems",
      "hours": 10,
      "done_criterion": "Kafka dispatches activities to worker pools; workers execute tasks with heartbeat monitoring."
    },
    {
      "name": "Saga Compensation Rollback & REST API in Saga Pattern and Docker",
      "hours": 10,
      "done_criterion": "REST API manages workflows; failed workflows execute reverse compensating activities cleanly."
    },
    {
      "name": "Crash Recovery Benchmark, Anti-Fake Worker SIGKILL Test & Docs in Prometheus",
      "hours": 10,
      "done_criterion": "System sustains 800+ tasks/sec; anti-fake test recovers from SIGKILL; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go programming (concurrency, context, channels), distributed systems concepts, and SQL transactions",
    "Understanding of event sourcing, distributed state machines, message brokers (Kafka), and Saga compensation patterns"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, message queuing, and database bound)",
    "cost": "$0 (fully open-source stack using local PostgreSQL and Kafka in Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, managed Temporal cloud fees, or third-party orchestrator subscriptions required",
    "reference_environment": "Local 4-core CPU, Docker Desktop (PostgreSQL 15, Kafka 3.4), Go 1.21+",
    "fallback_path": "In-memory event store and Go channel queue if Docker Kafka/Postgres containers cannot be provisioned"
  },
  "riskiest_component": {
    "name": "Non-Deterministic Execution Divergence during Event History Replay",
    "mitigation": "Enforce strict determinism linter forbidding system clock calls, random number generators, or external I/O inside workflow logic.",
    "fallback": "Workflow execution quarantine marking divergent runs for manual operator inspection with audit snapshots."
  },
  "deliverables": [
    "Go source repository containing workflow coordinator, history replayer, event store, and activity workers",
    "Docker Compose environment provisioning local PostgreSQL, Kafka, and sample workflow worker pools",
    "Prometheus dashboard configuration monitoring workflow throughput, task completion latencies, and compensation counts",
    "Screener verification script executing automated benchmark, Saga rollback, and anti-fake worker crash tests in under 3 minutes"
  ],
  "out_of_scope": [
    "Commercial Temporal Cloud / Conductor SaaS enterprise cluster federation",
    "BPMN 2.0 visual drag-and-drop workflow modeler GUI",
    "Multi-cloud geographically dispersed active-active distributed transaction coordination"
  ],
  "safety_note": None,
  "resources": [
    "Temporal Documentation: Designing Durable Workflows & Deterministic Execution",
    "Chris Richardson: Microservices Patterns — Saga Pattern & Event-Driven Architecture",
    "Martin Kleppmann: Designing Data-Intensive Applications (Reliable Message Processing)"
  ],
  "rubric": [
    {
      "input": "5,000 multi-step workflow activities distributed across 20 worker threads",
      "action": "go test ./benchmarks -v -run BenchmarkWorkflowThroughput",
      "expected_result": "Engine sustains >= 800 activity tasks/sec with p95 latency < 75ms",
      "evidence_location": "Throughput benchmark report in reports/throughput_benchmark.json",
      "pass_criterion": "Sustained throughput >= 800 tasks/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Worker process executing 5-step workflow killed via SIGKILL at step 3",
      "action": "python ./scripts/test_crash_recovery.py --kill-step 3 --signal SIGKILL",
      "expected_result": "Engine detects timeout in < 500ms, replays event history, and completes steps 4 and 5 in < 1.2s",
      "evidence_location": "Crash recovery audit log in reports/crash_audit.json",
      "pass_criterion": "Workflow completes all 5 steps after recovery with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 workflows programmed to fail at step 3 of a 5-step process",
      "action": "python ./scripts/test_saga_compensation.py --count 50 --fail-step 3",
      "expected_result": "50 of 50 workflows trigger reverse compensation (step 2, then step 1) with 0 orphaned states",
      "evidence_location": "Saga compensation report in reports/saga_audit.json",
      "pass_criterion": "50 of 50 workflows compensate in reverse order with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Duplicate activity task message published to Kafka queue with identical task token",
      "action": "python ./scripts/test_task_idempotency.py --token task_tok_777 --count 2",
      "expected_result": "Engine detects duplicate token and executes activity exactly once without double execution",
      "evidence_location": "Idempotency audit log in reports/task_idempotency.json",
      "pass_criterion": "Exactly 1 execution recorded across duplicate tokens with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Killing worker during step 3 and asserting zero duplicate executions of step 1 or step 2 during replay",
      "action": "python ./scripts/verify_deterministic_replay.py --workflow-id wf_replay_999",
      "expected_result": "Replay verifies steps 1 and 2 read from PostgreSQL event store; only steps 3, 4, and 5 dispatch to workers",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms exactly 0 duplicate activity executions during recovery with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed workflow orchestration engine in Go with PostgreSQL event sourcing; sustained [WORKFLOW_TPS] activity tasks per second, and delivered sub-[RECOVERY_TIME] millisecond crash recovery replay across Kafka worker pools.",
    "claims": [
      {
        "text": "sustained [WORKFLOW_TPS] activity tasks per second",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[RECOVERY_TIME] millisecond crash recovery replay across Kafka worker pools",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "managed Temporal cloud enterprise deployment or proprietary BPMN graphical designer integration"
  },
  "verify": [
    "Run `go test ./...` to confirm deterministic history replayer, event store, and worker queues pass.",
    "Execute `python ./scripts/test_crash_recovery.py` to verify engine recovers from abrupt SIGKILL.",
    "Run `python ./scripts/verify_deterministic_replay.py` to assert zero duplicate activity executions."
  ],
  "worksheet": {
    "q1": "Core deliverable: a distributed workflow orchestration engine in Go with event sourcing, Kafka worker queues, and Saga rollback.",
    "q2": "Target users: distributed systems engineers, core platform engineers, and backend systems architects.",
    "q3": "3 use cases: e-commerce multi-step order fulfillment, fintech loan origination pipelines, and distributed media transcoding.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: deterministic event history replayer, backward Saga compensation, exactly-once activity execution, and crash recovery.",
    "q6": "Starter input: Go engine skeleton, PostgreSQL event schema DDL, Kafka activity workers, and chaos scripts. Synthetic orders only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/DB bound, $0 cost using local Docker containers. Zero cloud fees.",
    "q8": "Riskiest component: non-deterministic execution divergence during replay. Fallback: strict AST linter and automated quarantine hooks.",
    "q9": "Potential faking: basic linear script runner without crash recovery. Anti-fake check 5 kills worker and verifies zero duplicate execution during replay.",
    "q10": "Safe; synthetic enterprise workflow payloads and mock order IDs only."
  }
}

b77_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, deterministic replay specs, and crash recovery bounds | High |
| Real World Use Cases | Leftover template phrases "top tech platforms" | Contains broken template strings and repetitive placeholder lines | High |
| Rubric | Missing quantitative targets | Lacked concrete activity throughput targets, crash recovery bounds, and deterministic anti-fake tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b77_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go 1.21 and Docker Desktop at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Activity throughput (>= 800 tasks/s), crash recovery (< 1.2s), and Saga rollback (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory event store and Go channel queue if Docker containers cannot be provisioned.",
  "Can test data be created in minutes?": "YES. Automated workflow generators and chaos injection scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial Temporal Cloud federation, BPMN visual modelers, and multi-region active-active replication.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 kills a worker mid-workflow and asserts zero duplicate activity executions during deterministic event history replay.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b77_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved dynamic cron timer wheels and visual DAG dashboard to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic distributed systems metrics (activity throughput, SIGKILL recovery latency, and Saga compensation parity).
- Removed Banned Content: Removed repetitive 'top tech platforms' placeholder words.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake deterministic history replay test.
"""

# ==============================================================================
# 78. brief-zero-trust-proxy
# ==============================================================================
b78_data = {
  "id": "brief-zero-trust-proxy",
  "title": "Least-Privilege API Security Gateway with RS256 JWT Rotation, Redis Bloom Filter & Device Fingerprinting",
  "domain": "Security & Platform",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Security projects", "Systems/low-level/networking"],
  "problem": "Modern cloud-native microservices exposed to public networks face credential theft, token replay attacks, and compromised session hijacking when relying on static API keys or long-lived bearer tokens without instant revocation. Standard API gateways either incur severe latency bottlenecks by performing blocking database queries on every HTTP request or fail to invalidate stolen session tokens across distributed microservices. This project builds a high-performance least-privilege API security gateway in Node.js and Express. The gateway enforces asymmetric RS256 JWT validation with automated JWKS keypair rotation, checks token revocation via an in-memory Redis Bloom filter in sub-millisecond time, verifies cryptographic client device fingerprints, mitigates OWASP Top 10 API vulnerabilities, and signs downstream service-to-service requests with under 3.5ms proxy latency overhead.",
  "use_cases": [
    {
      "title": "High-Security Open Banking API Gateway Authorization",
      "first_sentence": "Financial microservices serving third-party fintech applications must validate asymmetric client signatures without exposing sensitive internal network endpoints.",
      "second_sentence": "The Node.js gateway validates incoming RS256 JWT tokens against published JWKS key endpoints and forwards authenticated requests to internal banking services."
    },
    {
      "title": "Instantaneous Compromised Session Revocation for Enterprise SSO",
      "first_sentence": "When a security incident detects compromised user credentials, security operations teams must invalidate active sessions immediately across all edge nodes.",
      "second_sentence": "The gateway blacklists revoked token IDs in a Redis Bloom filter within 25ms, instantly rejecting subsequent requests without waiting for JWT TTL expiry."
    },
    {
      "title": "Edge Microservice Layer 7 Threat Filtering & Fingerprint Verification",
      "first_sentence": "Public customer portals are targeted by automated credential stuffing bots replaying captured authorization tokens from novel IP addresses.",
      "second_sentence": "The gateway computes SHA-256 client device fingerprints (User-Agent, TLS ciphers, IP subnets) and terminates replayed requests with mismatched fingerprints."
    }
  ],
  "hard_parts": [
    "Implementing automated RS256 asymmetric keypair rotation with zero-downtime JWKS cache invalidation across distributed edge gateway instances",
    "Designing an in-memory Redis Bloom filter token revocation registry supporting sub-millisecond membership checks and 0 false negatives",
    "Constructing cryptographic device fingerprint hashes resistant to token hijacking and header spoofing without impacting legitimate mobile clients",
    "Achieving sub-3.5ms proxy latency overhead while executing cryptographic signature verification and rate limiting under 2,000 RPS"
  ],
  "screener_signals": [
    "Clean Node.js / Express codebase cleanly separating JWT verification middleware, JWKS rotation handlers, Redis Bloom filter clients, and rate limiters",
    "Performance benchmark report proving sustained validation throughput of 2,000+ requests per second with p95 proxy latency under 3.5ms",
    "Anti-fake verification script revoking an active session token via API and confirming immediate rejection across subsequent requests within 50ms"
  ],
  "job_families": [
    "Security Software Engineer",
    "API Gateway Platform Developer",
    "Backend Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "Node.js", "role": "asynchronous JavaScript runtime executing high-concurrency edge proxy middleware and HTTP routing"},
    {"tool": "Express", "role": "web framework routing inbound API requests through security validation pipelines and proxy dispatchers"},
    {"tool": "Redis", "role": "in-memory data store hosting fast Bloom filters for instant token revocation and distributed rate limit counters"},
    {"tool": "Docker", "role": "container runtime packaging the Node.js gateway, Redis container, mock backend services, and test harness"},
    {"tool": "JWT", "role": "JSON Web Token standard providing cryptographically signed RS256 authentication and authorization claims"},
    {"tool": "Security", "role": "cryptographic utilities implementing SHA-256 device fingerprinting and OWASP Top 10 API hardening"},
    {"tool": "Jest", "role": "testing framework executing unit security tests, replay attack suites, and revocation latency benchmarks"}
  ],
  "architecture": {
    "components": [
      {
        "name": "RS256 JWT Verification & JWKS Keypair Rotation Engine",
        "tools_used": ["Node.js", "Express", "JWT"],
        "purpose": "Verifies incoming asymmetric JWT signatures against cached public keys and rotates keypairs automatically on schedule"
      },
      {
        "name": "Redis Bloom Filter Instant Token Revocation Registry",
        "tools_used": ["Node.js", "Redis"],
        "purpose": "Executes sub-millisecond membership queries against Redis Bloom filters to reject blacklisted session tokens"
      },
      {
        "name": "Cryptographic Device Fingerprint & Replay Defense Middleware",
        "tools_used": ["Node.js", "Security"],
        "purpose": "Computes SHA-256 client fingerprint hashes and rejects replayed tokens presented from unauthorized device contexts"
      },
      {
        "name": "Edge Reverse Proxy & Downstream Microservice Dispatcher",
        "tools_used": ["Node.js", "Express", "Docker"],
        "purpose": "Forwards validated requests to downstream microservices with injected security identity headers and mTLS tokens"
      },
      {
        "name": "Security Gateway Concurrency & Replay Attack Benchmark Harness",
        "tools_used": ["Node.js", "Docker", "Jest"],
        "purpose": "Simulates 2,000 RPS request volume, measures proxy latency overhead, and tests replay attack mitigation"
      },
      {
        "name": "API Security Gateway Architecture Guide & OWASP Hardening Manual",
        "tools_used": ["Node.js", "Security"],
        "purpose": "Documents RS256 token rotation patterns, Bloom filter scaling calculations, and OWASP API Top 10 mitigations"
      }
    ],
    "data_flow": "An external client issues an HTTPS request with an Authorization Bearer JWT; the Express gateway extracts the token header to locate the `kid` (key ID); the JWT engine validates the RS256 signature against local cached JWKS public keys; the token's `jti` (JWT ID) is checked against the Redis Bloom filter in < 1ms; if found in the blacklist, the request is rejected with HTTP 401 Unauthorized; the security middleware computes the client device fingerprint and compares it to claims embedded in the token; if valid, the request is proxied to the backend microservice with downstream identity headers; Prometheus tracks latency and rejection counts.",
    "enforcement_mechanism": "Cryptographic RS256 asymmetric signature verification combined with Redis Bloom filter membership checks."
  },
  "targets": [
    {
      "metric": "Edge Token Verification & Proxy Latency Overhead",
      "method": "Wall-clock latency added by JWT RS256 cryptographic verification and Redis Bloom filter check under 2,000 RPS",
      "input": "10,000 requests issued through security proxy at 2,000 requests per second across 20 concurrent connections",
      "environment": "Standard 4-core local CPU, Docker Desktop (Node.js 20, Redis 7), Node cluster with 2 workers",
      "minimum_pass": "p95 proxy latency overhead is < 4.5 milliseconds per request",
      "target": "p95 proxy latency overhead is < 2.2 milliseconds per request",
      "report": "Gateway latency benchmark report and latency percentile breakdown"
    },
    {
      "metric": "Compromised Token Revocation Propagation & Interception Rate",
      "method": "Percentage of requests using revoked tokens rejected with HTTP 401 Unauthorized within 25ms of revocation event",
      "input": "50 active session tokens revoked via admin API and immediately queried across 50 simulated client requests",
      "environment": "Local Node.js gateway connected to local Redis Bloom filter instance",
      "minimum_pass": "50 of 50 revoked token requests rejected with HTTP 401 within 25ms",
      "target": "50 of 50 revoked token requests rejected with HTTP 401 within 25ms",
      "report": "Token revocation audit log and Redis Bloom filter latency trace"
    },
    {
      "metric": "Client Device Fingerprint Replay Attack Mitigation Rate",
      "method": "Percentage of stolen token replay attempts with mismatched client fingerprint headers terminated with HTTP 403 Forbidden",
      "input": "50 replayed requests presenting valid JWT signatures but altered IP subnets or User-Agent headers",
      "environment": "Express gateway running cryptographic device fingerprint verification middleware",
      "minimum_pass": "50 of 50 mismatched fingerprint requests rejected with HTTP 403",
      "target": "50 of 50 mismatched fingerprint requests rejected with HTTP 403",
      "report": "Replay attack mitigation audit log and security event trace"
    }
  ],
  "skills": ["Node.js", "Express", "Redis", "Docker", "JWT", "Security", "Jest", "DevOps"],
  "starter_input": {
    "spec": "Directory containing Express gateway skeleton, RS256 key generator, Redis Bloom filter wrapper, and test suite.",
    "size": "9 JavaScript modules, Docker Compose manifest, Jest test suites, and mock backend microservice",
    "seeded_cases": "Expired tokens, forged signatures, tampered payloads, blacklisted token IDs, and mismatched device fingerprints",
    "label_source": "Deterministic HTTP status codes (200, 401, 403), Redis Bloom filter BITCOUNT responses, and Jest test outputs",
    "personal_data_policy": "Strictly mock synthetic user IDs and simulated device fingerprints; no real personal data used"
  },
  "components": [
    {"name": "RS256 JWT Verification & JWKS Keypair Rotation Engine", "task_type": "security hardening checks", "hours": 5.0},
    {"name": "Redis Bloom Filter Instant Token Revocation Registry", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Cryptographic Device Fingerprint & Replay Defense Middleware", "task_type": "concurrency/consistency mechanism with tests", "hours": 4.0},
    {"name": "Edge Reverse Proxy & Downstream Microservice Dispatcher", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Security Gateway Concurrency & Replay Attack Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "API Security Gateway Architecture Guide & OWASP Hardening Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic token bucket rate limiting with Redis sliding logs and client tier quotas",
      "Mutual TLS (mTLS) client certificate authentication terminating at the edge proxy",
      "Automated WebAssembly (Wasm) threat detection filter inspecting JSON request payloads for SQLi and XSS"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Express Gateway Architecture & RS256 JWKS Keypair Rotation in Node.js and Express",
      "hours": 7,
      "done_criterion": "Express gateway verifies RS256 JWTs against JWKS public key endpoint; rotation works."
    },
    {
      "name": "Redis Bloom Filter Token Revocation & Edge Interception in Redis and Docker",
      "hours": 7,
      "done_criterion": "Redis Bloom filter blacklists token IDs in < 1ms; 50 of 50 revoked tokens reject with HTTP 401."
    },
    {
      "name": "Device Fingerprinting, Replay Defense & Downstream Dispatch in JWT and Security",
      "hours": 7,
      "done_criterion": "Fingerprint middleware blocks 50 of 50 replayed tokens; valid requests proxy to backend."
    },
    {
      "name": "Concurrency Benchmark, Anti-Fake Revoked Session Test & Docs in Jest and DevOps",
      "hours": 7,
      "done_criterion": "System sustains 2,000+ RPS with sub-4.5ms p95 latency; anti-fake test blocks revoked token; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in JavaScript / Node.js (async/await, HTTP middleware, streams), and basic Linux networking",
    "Understanding of cryptography fundamentals: asymmetric keypairs (RSA/ECDSA), JSON Web Tokens (JWT), and hashing (SHA-256)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound)",
    "cost": "$0 (fully open-source stack using local Node.js and Redis in Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, paid API gateway licenses (Kong/Apigee), or commercial SSO fees required",
    "reference_environment": "Local 4-core CPU, Node.js 20+, Docker Desktop (Redis 7), npm 10+",
    "fallback_path": "In-memory JavaScript Set fallback if Docker Redis container is unavailable"
  },
  "riskiest_component": {
    "name": "False Positives in Bloom Filter Token Revocation causing Legitimate User Logouts",
    "mitigation": "Size Bloom filter capacity with 0.001 error probability and perform secondary exact Redis SET check on positive matches.",
    "fallback": "Secondary exact key check eliminating false positives before rejecting requests."
  },
  "deliverables": [
    "Node.js repository containing security gateway, JWT verification pipeline, and Redis Bloom filter client",
    "Docker Compose environment orchestrating Node.js proxy, Redis container, and mock upstream microservice",
    "Automated security attack test suite evaluating replay attacks, tampered signatures, and expired tokens",
    "Screener verification script executing automated benchmark, replay test, and anti-fake token revocation in under 3 minutes"
  ],
  "out_of_scope": [
    "Commercial enterprise Identity Provider (Okta, Auth0 paid cloud tenant) integrations",
    "Hardware Security Module (HSM) key storage hardware appliances",
    "Distributed BGP routing or physical DDoS mitigation appliances"
  ],
  "safety_note": None,
  "resources": [
    "RFC 7519: JSON Web Token (JWT) Standard Specification",
    "OWASP API Security Top 10 Vulnerabilities & Mitigation Guidelines",
    "RedisBloom: Scalable Bloom and Cuckoo Filters for Redis Documentation"
  ],
  "rubric": [
    {
      "input": "10,000 requests issued at 2,000 RPS through security gateway",
      "action": "npm run bench:latency -- --rps 2000 --requests 10000",
      "expected_result": "Gateway processes requests with p95 proxy latency overhead < 4.5ms",
      "evidence_location": "Latency benchmark report in reports/latency_benchmark.json",
      "pass_criterion": "p95 proxy latency < 4.5ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 active session tokens revoked via `/api/auth/revoke`",
      "action": "npm test -- -t 'revocation propagation'",
      "expected_result": "50 of 50 requests using revoked tokens rejected with HTTP 401 within 25ms",
      "evidence_location": "Revocation audit log in reports/revocation_audit.json",
      "pass_criterion": "50 of 50 revoked requests rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 replayed requests presenting valid JWT signatures but altered client fingerprints",
      "action": "npm test -- -t 'device fingerprint replay'",
      "expected_result": "50 of 50 replayed requests rejected with HTTP 403 Forbidden",
      "evidence_location": "Replay audit report in reports/replay_audit.json",
      "pass_criterion": "50 of 50 mismatched requests rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "RS256 keypair rotation triggered via JWKS manager",
      "action": "npm test -- -t 'keypair rotation'",
      "expected_result": "Gateway fetches updated public key and verifies subsequent tokens without downtime",
      "evidence_location": "Rotation audit log in reports/rotation_audit.json",
      "pass_criterion": "Keypair rotation completes with 0 verification errors and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Actively authenticated token 'tok_active_77' revoked via admin API and immediately re-queried",
      "action": "node ./scripts/verify_revocation_lock.js --token tok_active_77",
      "expected_result": "Gateway consults Redis Bloom filter and returns HTTP 401 Unauthorized with error code TOKEN_REVOKED",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms HTTP 401 and TOKEN_REVOKED rejection with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected least-privilege API security gateway in Node.js with asymmetric JWT rotation; delivered sub-[PROXY_OVERHEAD] millisecond proxy latency under [REQUEST_RPS] throughput, and enforced [REVOCATION_SUCCESS] session revocation via Redis Bloom filters.",
    "claims": [
      {
        "text": "delivered sub-[PROXY_OVERHEAD] millisecond proxy latency under [REQUEST_RPS] throughput",
        "rubric_indexes": [0]
      },
      {
        "text": "enforced [REVOCATION_SUCCESS] session revocation via Redis Bloom filters",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "managed Okta enterprise cloud tenant or physical hardware HSM appliance integrations"
  },
  "verify": [
    "Run `npm test` to confirm JWT verification, Redis Bloom filter, and fingerprint middleware pass.",
    "Execute `npm run bench:latency` to verify proxy latency remains under 4.5ms under load.",
    "Run `node ./scripts/verify_revocation_lock.js` to assert immediate rejection of revoked tokens."
  ],
  "worksheet": {
    "q1": "Core deliverable: a least-privilege API security gateway in Node.js with RS256 JWT rotation, Redis Bloom filters, and device fingerprinting.",
    "q2": "Target users: security software engineers, API gateway platform developers, and backend infrastructure engineers.",
    "q3": "3 use cases: open banking API authorization, instant enterprise session revocation, and edge fingerprint threat defense.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: RS256 JWKS rotation with 0 downtime, Redis Bloom filter with sub-ms checks, cryptographic device fingerprinting, and sub-3.5ms latency.",
    "q6": "Starter input: Express gateway skeleton, RS256 key generator, Redis Bloom filter wrapper, and Jest tests. Synthetic tokens only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/network bound, $0 cost using local Docker containers. Zero cloud fees.",
    "q8": "Riskiest component: Bloom filter false positives. Fallback: size filter with 0.001 error rate and secondary exact Redis check.",
    "q9": "Potential faking: simple static JWT decoder without revocation. Anti-fake check 5 blacklists active token and asserts HTTP 401 TOKEN_REVOKED.",
    "q10": "Safe; synthetic user IDs and mock device fingerprints only."
  }
}

b78_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, RS256 rotation specs, and Bloom filter bounds | High |
| Recruiter Signal | "rare and highly valued skill in compliance-heavy industries" | Contains banned promotional marketing phrases | Medium |
| Rubric | Missing quantitative targets | Lacked concrete latency overhead targets, revocation time bounds, and anti-fake tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 28h) | Medium |
"""

b78_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js 20 and Docker Redis at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Proxy latency (< 4.5ms), revocation interception (50 of 50), and fingerprint mitigation (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory JavaScript Set fallback if Docker Redis container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic JWT generator and automated security attack suites included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial Okta cloud tenants, hardware HSM appliances, and physical DDoS hardware.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 revokes an active session token and verifies immediate HTTP 401 TOKEN_REVOKED rejection.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b78_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved dynamic rate limiting and payload Wasm inspection to Extended Path (+14h).
- Target Realism: Standardized difficulty to 28 hours with authentic API gateway metrics (proxy latency overhead, revocation interception rate, and replay defense).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake revoked session lock test.
"""

# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_8_part1():
    std_scores = {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}
    std_caps = {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}
    res74 = process_brief(b74_data, b74_old_diag, std_scores, std_caps, b74_reviewer, b74_changelog)
    res75 = process_brief(b75_data, b75_old_diag, std_scores, std_caps, b75_reviewer, b75_changelog)
    res76 = process_brief(b76_data, b76_old_diag, std_scores, std_caps, b76_reviewer, b76_changelog)
    res77 = process_brief(b77_data, b77_old_diag, std_scores, std_caps, b77_reviewer, b77_changelog)
    res78 = process_brief(b78_data, b78_old_diag, std_scores, std_caps, b78_reviewer, b78_changelog)
    return [res74, res75, res76, res77, res78]

if __name__ == "__main__":
    results = run_batch_8_part1()
    print("Batch 8 Part 1 finished successfully:", results)
