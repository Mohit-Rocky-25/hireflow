"""
Batch 7 Part 2: Redesign briefs 69 to 73 from scratch.
69. brief-service-mesh
70. brief-streaming-data-pipeline
71. brief-supply-chain-optimization
72. brief-terraform-cloud-infra
73. brief-time-series-forecasting
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 69. brief-service-mesh
# ==============================================================================
b69_data = {
  "id": "brief-service-mesh",
  "title": "Service Mesh Zero-Trust Architecture with Istio, Envoy Sidecars, mTLS & SPIFFE Identity",
  "domain": "Platform & DevOps",
  "difficulty": "ADVANCED",
  "project_types": ["Cloud architecture", "Platform/infra tool"],
  "problem": "Microservice topologies operating on Kubernetes clusters leave east-west (service-to-service) network traffic unencrypted and unauthenticated by default. In the event of a single pod breach, lateral attacker movement across internal cluster networks is trivial due to cleartext HTTP communications, static IP trust assumptions, and absence of granular Layer 7 authorization policies. Furthermore, lack of unified traffic management makes progressive canary rollouts risky and creates blind spots in distributed service latency tracing. This project builds a production-grade zero-trust service mesh architecture on Kubernetes using Istio and Envoy. The platform enforces strict mutual TLS (mTLS) with cryptographically verified SPIFFE identities, implements fine-grained authorization policies and Layer 7 traffic routing (canary splits, circuit breaking), exports telemetry to Prometheus, and visualizes live dependency topologies via Kiali with under 3.5ms proxy latency overhead.",
  "use_cases": [
    {
      "title": "FinTech Core Banking Microservice East-West Encryption",
      "first_sentence": "Financial microservices transferring customer fund balances across internal payment and ledger services must comply with zero-trust regulatory mandates.",
      "second_sentence": "Istio sidecars automatically enforce mutual TLS across all inter-service connections, ensuring encrypted data in transit with rotated X.509 certificates and SPIFFE IDs."
    },
    {
      "title": "Progressive Canary Traffic Shifting for High-Volume APIs",
      "first_sentence": "Platform engineering teams releasing new versions of customer-facing recommendation services need automated canary deployments without traffic disruption.",
      "second_sentence": "The service mesh splits production traffic dynamically (e.g. 90% v1, 10% v2) using Istio VirtualService weights, monitoring error rates before promoting releases."
    },
    {
      "title": "Resilient Microservice Cascading Failure Prevention",
      "first_sentence": "E-commerce checkout pipelines relying on downstream inventory microservices risk cascading cluster failure during inventory database connection stalls.",
      "second_sentence": "Envoy circuit breakers trip when consecutive 5xx errors exceed thresholds, failing fast with cached responses and isolating failing pods from healthy cluster tiers."
    }
  ],
  "hard_parts": [
    "Configuring Istio mutual TLS (mTLS) in STRICT mode across multi-namespace Kubernetes clusters with automated SPIFFE certificate issuance and rotation",
    "Writing fine-grained Istio AuthorizationPolicy resources restricting pod-to-pod RPC communication using authenticated SPIFFE identities and HTTP method rules",
    "Implementing advanced traffic management with VirtualServices and DestinationRules governing canary percentage splits and outlier detection circuit breaking",
    "Minimizing Envoy proxy latency overhead and CPU utilization under high-throughput microservice request volumes using optimized filter chains"
  ],
  "screener_signals": [
    "Clean Kubernetes and Istio configuration repository cleanly separating namespace manifests, VirtualService routes, AuthorizationPolicies, and Prometheus dashboards",
    "Security penetration benchmark report proving 100 of 100 unauthorized inter-service plaintext connection attempts are blocked by strict mTLS",
    "Anti-fake verification script sending an unauthenticated HTTP request from a rogue curl pod to an internal payment service and asserting connection termination via SSL handshake failure"
  ],
  "job_families": [
    "Site Reliability Engineer (SRE)",
    "Cloud Platform Architect",
    "DevSecOps / Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "Kubernetes", "role": "container orchestration platform managing microservice deployments, services, and namespace isolation"},
    {"tool": "Istio", "role": "service mesh control plane distributing cryptographic certificates, routing rules, and security policies"},
    {"tool": "Envoy", "role": "high-performance L7 sidecar proxy intercepting inbound and outbound network traffic across pods"},
    {"tool": "Docker", "role": "container runtime packaging sample microservice applications and test traffic generators"},
    {"tool": "Prometheus", "role": "monitoring system scraping Envoy proxy telemetry metrics including request rates and latency"},
    {"tool": "Kiali", "role": "service mesh management console visualizing live microservice topology graphs and mTLS encryption status"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Kubernetes Microservice Mesh & Istio Control Plane",
        "tools_used": ["Kubernetes", "Istio"],
        "purpose": "Provisions Istiod control plane, manages sidecar auto-injection, and establishes cluster service namespaces"
      },
      {
        "name": "Envoy Sidecar mTLS & SPIFFE Identity Enforcement Engine",
        "tools_used": ["Istio", "Envoy"],
        "purpose": "Enforces STRICT mutual TLS, validates SPIFFE identity URIs, and rotates X.509 client certificates"
      },
      {
        "name": "Traffic Shifting, Canary Routing & Circuit Breaker Controller",
        "tools_used": ["Kubernetes", "Istio"],
        "purpose": "Configures VirtualServices and DestinationRules for canary weight distributions and consecutive error tripping"
      },
      {
        "name": "Prometheus Telemetry Scraping & Kiali Topology Visualizer",
        "tools_used": ["Prometheus", "Kiali"],
        "purpose": "Scrapes Envoy sidecar metrics, visualizes live service traffic graphs, and validates mTLS lock badge statuses"
      },
      {
        "name": "Chaos Latency Injection & Fault Tolerance Test Suite",
        "tools_used": ["Kubernetes", "Docker"],
        "purpose": "Injects synthetic HTTP 503 faults and latency spikes to test circuit breaking and timeout recovery"
      },
      {
        "name": "Service Mesh Concurrency & Proxy Overhead Benchmark Harness",
        "tools_used": ["Kubernetes", "Envoy"],
        "purpose": "Measures sidecar latency overhead and sustained request throughput across 5 microservice tiers"
      },
      {
        "name": "Zero-Trust Service Mesh Security Guide & Architecture Diagram",
        "tools_used": ["Kubernetes", "Istio"],
        "purpose": "Documents STRICT mTLS policies, SPIFFE identity structures, and Envoy filter chain optimization guides"
      }
    ],
    "data_flow": "A user request enters via the Istio Ingress Gateway; the gateway verifies TLS and routes to the frontend microservice; the frontend Envoy sidecar establishes an mTLS connection to the backend payment service Envoy sidecar; sidecars exchange and validate SPIFFE X.509 certificates issued by Istiod; the payment service's Istio AuthorizationPolicy evaluates the client SPIFFE ID; if authorized, the request forwards to the local application container over localhost; Envoy streams access metrics to Prometheus; Kiali queries Prometheus to render real-time service dependency graphs; when a canary deployment triggers, VirtualService routing splits 10% of traffic to the v2 payment pod.",
    "enforcement_mechanism": "Cryptographic TLS handshake verification rejecting non-SPIFFE certificates; Envoy L7 filter chain evaluating RBAC policies at kernel socket boundaries."
  },
  "targets": [
    {
      "metric": "Envoy Sidecar Proxy Latency Overhead",
      "method": "Wall-clock round-trip latency added by Envoy sidecar proxy interception compared to direct pod-to-pod baseline under 1,000 RPS",
      "input": "10,000 requests issued through 3 microservice mesh hops at 1,000 requests per second",
      "environment": "Standard 4-core local CPU, Minikube / Kind local Kubernetes cluster with Istio 1.18+",
      "minimum_pass": "p95 proxy latency overhead per hop is < 5.0 milliseconds",
      "target": "p95 proxy latency overhead per hop is < 2.2 milliseconds",
      "report": "Envoy proxy latency benchmark report and latency percentile table"
    },
    {
      "metric": "STRICT mTLS Unauthorized Connection Block Rate",
      "method": "Percentage of unauthorized plaintext or invalid-certificate connection attempts rejected by Envoy sidecars",
      "input": "50 connection attempts from non-mesh pods or pods with forged certificates targeting internal services",
      "environment": "Local Kubernetes cluster with PeerAuthentication mode set to STRICT across all namespaces",
      "minimum_pass": "50 of 50 unauthorized connection attempts terminated with SSL handshake failure",
      "target": "50 of 50 unauthorized connection attempts terminated with SSL handshake failure",
      "report": "mTLS security enforcement audit log and TLS handshake rejection trace"
    },
    {
      "metric": "Canary Traffic Shift Distribution Accuracy",
      "method": "Observed percentage of requests routed to canary v2 deployment compared to configured VirtualService weight (10%)",
      "input": "5,000 synthetic HTTP GET requests issued to canary-instrumented service endpoint",
      "environment": "Istio VirtualService configured with 90% weight to v1 and 10% weight to v2",
      "minimum_pass": "Observed canary traffic split is within 9.0% to 11.0% across 5,000 requests",
      "target": "Observed canary traffic split is within 9.5% to 10.5% across 5,000 requests",
      "report": "Canary traffic routing distribution log and Prometheus metrics export"
    }
  ],
  "skills": ["Kubernetes", "Istio", "Envoy", "Docker", "Prometheus", "Kiali", "DevOps", "Service Mesh"],
  "starter_input": {
    "spec": "Directory containing Kubernetes manifests for sample microservices, Istio Gateway/VirtualService YAMLs, and test runner.",
    "size": "14 YAML configuration manifests, 3 sample microservice Dockerfiles, and automated mesh verification scripts",
    "seeded_cases": "Plaintext bypass attempts, expired SPIFFE certificates, misconfigured service port names, and missing destination rules",
    "label_source": "Deterministic Prometheus istio_requests_total counters and Envoy proxy access log status codes",
    "personal_data_policy": "Strictly mock synthetic financial transactions and simulated user IDs; no real personal data used"
  },
  "components": [
    {"name": "Kubernetes Microservice Mesh & Istio Control Plane", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Envoy Sidecar mTLS & SPIFFE Identity Enforcement Engine", "task_type": "security hardening checks", "hours": 6.0},
    {"name": "Traffic Shifting, Canary Routing & Circuit Breaker Controller", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "Prometheus Telemetry Scraping & Kiali Topology Visualizer", "task_type": "observability", "hours": 5.0},
    {"name": "Chaos Latency Injection & Fault Tolerance Test Suite", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Service Mesh Concurrency & Proxy Overhead Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Zero-Trust Service Mesh Security Guide & Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Multi-cluster mesh expansion connecting two independent Kubernetes clusters with cross-cluster service discovery",
      "Wasm (WebAssembly) custom Envoy filter injecting corporate compliance headers into HTTP request streams",
      "Automated canary analysis using Flagger to automatically promote releases based on Prometheus error rates"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Kubernetes Microservice Deployment & Istio Mesh in Kubernetes and Istio",
      "hours": 10,
      "done_criterion": "Istiod installs in cluster; sidecars auto-inject into sample microservice pods."
    },
    {
      "name": "STRICT mTLS & SPIFFE Authorization Policies in Envoy and Service Mesh",
      "hours": 10,
      "done_criterion": "PeerAuthentication STRICT mode activates; 50 of 50 plaintext requests reject with SSL failure."
    },
    {
      "name": "Canary Traffic Shifting & Circuit Breaking in Docker and DevOps",
      "hours": 10,
      "done_criterion": "VirtualService routes 10% traffic to canary v2; circuit breakers trip upon injected 503 errors."
    },
    {
      "name": "Observability Dashboard, Anti-Fake Rogue Pod Test & Docs in Prometheus and Kiali",
      "hours": 10,
      "done_criterion": "Kiali renders mTLS graph; anti-fake test blocks unauthenticated pod; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Kubernetes administration, container orchestration concepts (Pods, Services, Namespaces), and YAML",
    "Understanding of service mesh architectures (Istio, Envoy), mutual TLS (mTLS), and network traffic management"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network proxy bound container orchestration software)",
    "cost": "$0 (fully open-source stack using local Minikube / Kind in Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or managed cloud Kubernetes clusters required",
    "reference_environment": "Local 4-core CPU with Docker Desktop, Minikube / Kind (Kubernetes 1.26+), kubectl, and Istioctl installed",
    "fallback_path": "Docker Compose multi-container Envoy proxy mesh if local Kubernetes cluster cannot be provisioned"
  },
  "riskiest_component": {
    "name": "Cluster-Wide Outages from Misconfigured STRICT mTLS Policies",
    "mitigation": "Deploy mTLS initially in PERMISSIVE mode while verifying Prometheus mTLS telemetry, then transition to STRICT.",
    "fallback": "Emergency Istio PeerAuthentication patch reverting namespace to PERMISSIVE mode."
  },
  "deliverables": [
    "Git repository containing Kubernetes manifests, Istio routing rules, AuthorizationPolicies, and sample microservices",
    "Automated bash/python test harness verifying mTLS enforcement, canary traffic splits, and circuit breaker tripping",
    "Prometheus alert rules and Kiali configuration guides for service mesh visualization",
    "Screener verification script executing automated benchmark and dynamic rogue pod rejection in under 3 minutes"
  ],
  "out_of_scope": [
    "Multi-cloud production AWS EKS / GCP GKE cluster provisioning",
    "Complex hardware security module (HSM) certificate authority integration",
    "BGP route reflector networking or physical hardware switch configurations"
  ],
  "safety_note": None,
  "resources": [
    "Istio Documentation: Security, mTLS, and Traffic Management Architecture",
    "Envoy Proxy Architecture & Filter Chain Documentation",
    "SPIFFE/SPIRE Specification: Secure Production Identity Framework for Everyone"
  ],
  "rubric": [
    {
      "input": "10,000 requests sent across 3 microservice hops at 1,000 RPS",
      "action": "kubectl exec -it deploy/traffic-gen -- ./bench_mesh.sh --rps 1000 --requests 10000",
      "expected_result": "Envoy proxy intercepts requests with p95 latency overhead < 5.0ms per hop",
      "evidence_location": "Terminal output log and reports/mesh_latency.json",
      "pass_criterion": "p95 latency overhead < 5.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 unauthorized plaintext connection attempts to payment microservice",
      "action": "python ./scripts/test_mtls_enforcement.py --attempts 50",
      "expected_result": "STRICT mTLS policy rejects all 50 attempts; 0 plaintext bytes delivered",
      "evidence_location": "mTLS enforcement audit log in reports/mtls_audit.json",
      "pass_criterion": "50 of 50 connections rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "5,000 requests issued to canary-configured service endpoint",
      "action": "python ./scripts/verify_canary_split.py --requests 5000 --target-split 10",
      "expected_result": "Traffic distributes with observed canary share between 9.0% and 11.0%",
      "evidence_location": "Canary distribution report in reports/canary_audit.json",
      "pass_criterion": "Canary traffic split within 9.0% - 11.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Consecutive HTTP 503 errors injected into backend service pod",
      "action": "python ./scripts/test_circuit_breaker.py --fault 503 --count 5",
      "expected_result": "DestinationRule outlier detection trips circuit breaker; subsequent requests fail fast in < 2ms",
      "evidence_location": "Circuit breaker audit log in reports/breaker_audit.json",
      "pass_criterion": "Circuit breaker trips and fails fast with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Unauthenticated rogue pod attempting to bypass sidecar and curl payment service",
      "action": "kubectl run rogue-pod --rm -i --restart=Never --image=curlimages/curl -- curl -v http://payment-service:8080/pay",
      "expected_result": "Connection terminates immediately with SSL handshake error or HTTP 403 RBAC denied",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms connection reset / handshake failure with exit code 35 or 56",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected mutual-trust service mesh on Kubernetes using Istio and Envoy sidecars; enforced mutual TLS across microservices with sub-[PROXY_OVERHEAD] millisecond proxy latency overhead, and executed traffic canary shifts within [CANARY_MARGIN] of target ratios.",
    "claims": [
      {
        "text": "enforced mutual TLS across microservices with sub-[PROXY_OVERHEAD] millisecond proxy latency overhead",
        "rubric_indexes": [0]
      },
      {
        "text": "executed traffic canary shifts within [CANARY_MARGIN] of target ratios",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "managed cloud EKS production multi-cluster peering or hardware HSM certificate integrations"
  },
  "verify": [
    "Run `kubectl get pods -n istio-system` to confirm Istiod control plane is operational.",
    "Execute `python ./scripts/test_mtls_enforcement.py` to verify peer authentication rejects plaintext requests.",
    "Run `kubectl run rogue-pod` to assert rogue pods cannot bypass mTLS or call protected services."
  ],
  "worksheet": {
    "q1": "Core deliverable: a zero-trust service mesh on Kubernetes with Istio, Envoy sidecar proxies, STRICT mTLS, and traffic shifting.",
    "q2": "Target users: site reliability engineers, cloud platform architects, and DevSecOps engineers.",
    "q3": "3 use cases: fintech east-west microservice encryption, progressive canary traffic shifts, and cascading failure circuit breaking.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: STRICT mTLS configuration across namespaces, SPIFFE X.509 certificate validation, canary routing rules, and sub-3.5ms proxy latency.",
    "q6": "Starter input: Kubernetes manifests, Istio routing YAMLs, sample microservice Dockerfiles, and test scripts. Synthetic test data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using local Minikube / Kind. Zero cloud fees.",
    "q8": "Riskiest component: cluster-wide outages from misconfigured mTLS. Fallback: deploy initially in PERMISSIVE mode before locking to STRICT.",
    "q9": "Potential faking: standard Kubernetes cluster without actual service mesh proxy interception. Anti-fake check 5 spawns a rogue pod and verifies SSL handshake failure.",
    "q10": "Safe; synthetic microservice workloads and isolated local cluster containers only."
  }
}

b69_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, STRICT mTLS specs, and proxy latency targets | High |
| Tech Stack | Kubernetes, Istio, Envoy, Docker, Prometheus, Kiali | Listed tools without explicit operational roles or sidecar lifecycle boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete proxy latency bounds, canary distribution margins, and rogue pod security tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b69_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Minikube / Kind and Docker Desktop at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Proxy latency overhead (< 5.0ms), mTLS rejection (50 of 50), and canary distribution (9.0% - 11.0%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Docker Compose multi-container Envoy proxy mesh if local Kubernetes cluster cannot be provisioned.",
  "Can test data be created in minutes?": "YES. Sample microservice manifests and automated mesh verification scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: managed cloud EKS peering, hardware HSM certificate authorities, and BGP hardware routing.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 spawns a rogue unauthenticated curl pod and verifies immediate connection termination via SSL handshake error.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b69_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved multi-cluster mesh expansion and Wasm filters to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic service mesh metrics (Envoy proxy overhead, STRICT mTLS rejection rate, and canary split margin).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake rogue pod connection rejection test.
"""

# ==============================================================================
# 70. brief-streaming-data-pipeline
# ==============================================================================
b70_data = {
  "id": "brief-streaming-data-pipeline",
  "title": "Real-Time Lakehouse Streaming ETL Pipeline with Apache Spark, Delta Lake, Kafka & MinIO",
  "domain": "Data Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Data pipeline", "Distributed systems"],
  "problem": "Traditional corporate data platforms relying on overnight batch ETL jobs inflict a 24-hour analytical lag on decision makers, preventing fraud detection, inventory rebalancing, and live operational monitoring. Naive streaming architectures built on raw object storage suffer from dirty reads, duplicate event writes, corrupt file fragmentation (the small-file problem), and lack of ACID transactional guarantees when streaming jobs fail mid-microbatch. This project builds a production-grade real-time lakehouse streaming ETL pipeline in Python using Apache Spark Structured Streaming, Delta Lake, and Apache Kafka. The pipeline ingests high-velocity events into a Medallion architecture (Bronze raw, Silver cleaned/deduplicated, Gold aggregated business marts), enforces ACID transactions with Delta Lake write-ahead logs, executes stateful stream-stream joins with event-time watermarking, and stores Parquet datasets in MinIO (S3-compatible) object storage with sub-5s end-to-end latency.",
  "use_cases": [
    {
      "title": "FinTech Fraud Detection & Live Transaction Scoring",
      "first_sentence": "Credit card networks processing thousands of point-of-sale swipes per second must detect fraudulent spending bursts across merchant categories.",
      "second_sentence": "The streaming pipeline consumes transaction events from Kafka, dedupes events using watermarks in Spark, and updates rolling user spending profiles in Delta Lake tables within 4 seconds."
    },
    {
      "title": "Ride-Hailing Dynamic Surge Pricing & Supply Balancing",
      "first_sentence": "Urban ride-hailing platforms need to match passenger ride requests with available driver locations in localized geographic zones.",
      "second_sentence": "The Spark engine executes stateful stream-stream joins between passenger requests and driver GPS pings, computing localized supply-demand ratios in real time."
    },
    {
      "title": "E-Commerce Real-Time Inventory Ledger Reconciliation",
      "first_sentence": "Retail fulfillment systems distributing orders across multiple regional warehouses need an immutable audit ledger of stock decrements.",
      "second_sentence": "The system writes ACID micro-batches to Delta Lake, guaranteeing exactly-once semantics and supporting historical time-travel audit queries for financial compliance."
    }
  ],
  "hard_parts": [
    "Configuring Apache Spark Structured Streaming watermarks and event-time stateful operations to handle late-arriving events without unbounded memory leaks",
    "Enforcing Delta Lake ACID transaction guarantees with optimistic concurrency control and idempotent checkpointing during simulated node crashes",
    "Implementing automatic small-file compaction (OPTIMIZE / bin-packing) on streaming Delta tables to prevent query degradation over millions of Parquet files",
    "Structuring the Medallion architecture (Bronze raw ingestion, Silver deduplicated data cleaning, Gold continuous aggregate rollups) with Delta schema evolution"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating Kafka ingestion schemas, Spark Structured Streaming jobs, Delta Lake table definitions, and MinIO storage configs",
    "Streaming benchmark proving sustained ingestion of 15,000+ events per second with sub-5s end-to-end processing latency from Kafka to Delta Gold",
    "Anti-fake verification script injecting 10 duplicate events with identical transaction IDs and 5 late-arriving events, asserting exactly-once deduplication in the Silver table"
  ],
  "job_families": [
    "Senior Data Engineer",
    "Big Data Platform Architect",
    "Distributed Systems Developer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing Spark streaming jobs, PySpark transforms, and test harnesses"},
    {"tool": "Apache Spark", "role": "distributed compute engine executing Structured Streaming micro-batches and stateful transformations"},
    {"tool": "Delta Lake", "role": "storage layer providing ACID transactions, time travel, schema enforcement, and compaction"},
    {"tool": "Kafka", "role": "distributed streaming broker capturing raw high-velocity event streams from producer sources"},
    {"tool": "MinIO", "role": "S3-compatible high-performance object storage hosting underlying Parquet and Delta log files"},
    {"tool": "SQL", "role": "declarative query language executing analytical continuous aggregations and Gold table validations"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Kafka Streaming Ingestion & Bronze Raw Event Lakehouse Layer",
        "tools_used": ["Python", "Kafka", "Delta Lake"],
        "purpose": "Consumes raw JSON event streams from Kafka and appends unparsed payloads to Bronze Delta table with ingestion timestamps"
      },
      {
        "name": "Spark Structured Streaming Deduplication & Silver Cleaning Engine",
        "tools_used": ["Python", "Apache Spark"],
        "purpose": "Parses JSON payloads, applies watermarking (10m), drops duplicate transaction IDs, and writes to Silver Delta table"
      },
      {
        "name": "Delta Lake ACID Transaction Log & Parquet Compaction Worker",
        "tools_used": ["Delta Lake", "MinIO"],
        "purpose": "Manages Delta transaction logs, enforces schema validity, and executes background OPTIMIZE compaction"
      },
      {
        "name": "Gold Dimension Aggregations & Analytical SQL Data Mart",
        "tools_used": ["Python", "Apache Spark", "SQL"],
        "purpose": "Computes rolling 5-minute sliding window aggregations and writes business-ready analytical metrics to Gold Delta table"
      },
      {
        "name": "MinIO Object Storage & S3-Compatible Cloud Lakehouse Store",
        "tools_used": ["MinIO"],
        "purpose": "Stores immutable Parquet files and Delta transaction logs with S3 API compatibility and bucket lifecycle policies"
      },
      {
        "name": "Streaming Lakehouse Throughput & Watermark Lag Benchmark Harness",
        "tools_used": ["Python", "Apache Spark"],
        "purpose": "Generates 15,000 events/sec and benchmarks end-to-end streaming latency, checkpoint recovery, and deduplication"
      },
      {
        "name": "Lakehouse Architecture Guide & Medallion Schema Manual",
        "tools_used": ["Python", "Delta Lake"],
        "purpose": "Documents watermarking strategies, Delta Lake time-travel queries, and small-file compaction schedules"
      }
    ],
    "data_flow": "Producers publish transaction events to Kafka; Spark Structured Streaming consumes events and writes raw payloads to the Bronze Delta table in MinIO; a secondary streaming query reads Bronze, applies a 10-minute watermark on event_time, deduplicates transactions by transaction_id, validates schemas, and appends to the Silver Delta table; a third streaming query computes 5-minute sliding window aggregations (total volume, merchant counts), writing to the Gold Delta table; downstream analytical BI dashboards query Gold Delta tables using Spark SQL; if a worker fails, Spark resumes from the S3 checkpoint with zero duplicate records.",
    "enforcement_mechanism": "Delta Lake ACID write-ahead transaction logs (`_delta_log/`) and Spark Structured Streaming WAL checkpoints ensuring exactly-once delivery."
  },
  "targets": [
    {
      "metric": "Sustained Streaming Event Ingestion Throughput",
      "method": "Events per second ingested through Kafka, transformed in Spark, and committed to Delta Lake across 100,000 events",
      "input": "100,000 synthetic transaction events streamed at 15,000 events per second across 4 Kafka partitions",
      "environment": "Standard 4-core local CPU, Docker Desktop (Kafka, Spark standalone master/worker, MinIO), Python 3.11",
      "minimum_pass": "Sustained streaming throughput is >= 10,000 events per second",
      "target": "Sustained streaming throughput is >= 22,000 events per second",
      "report": "Spark Structured Streaming throughput benchmark report and micro-batch timing log"
    },
    {
      "metric": "End-to-End Event-to-Gold Commit Latency",
      "method": "Wall-clock duration from Kafka message publish timestamp to availability in Gold Delta table query",
      "input": "5,000 continuous transaction events streamed under 2-second microbatch trigger intervals",
      "environment": "Local PySpark streaming pipeline writing Parquet files to local MinIO bucket",
      "minimum_pass": "p95 end-to-end processing latency is < 6.0 seconds",
      "target": "p95 end-to-end processing latency is < 3.2 seconds",
      "report": "Streaming latency breakdown log and micro-batch processing duration table"
    },
    {
      "metric": "Event-Time Watermark Deduplication Parity Rate",
      "method": "Percentage of duplicate events within watermark window successfully discarded without contaminating Silver table",
      "input": "50 duplicate event pairs injected with staggered arrival times inside 10-minute watermark window",
      "environment": "Spark Structured Streaming job running `dropDuplicates(['transaction_id', 'event_time'])`",
      "minimum_pass": "50 of 50 duplicate events successfully dropped with exactly 1 record per transaction in Silver table",
      "target": "50 of 50 duplicate events successfully dropped with exactly 1 record per transaction in Silver table",
      "report": "Watermark deduplication audit log and Silver table count verification report"
    }
  ],
  "skills": ["Python", "Apache Spark", "Delta Lake", "Kafka", "MinIO", "SQL", "Data Engineering", "Streaming Systems"],
  "starter_input": {
    "spec": "Directory containing PySpark streaming jobs, Kafka event producers, Delta Lake schemas, and MinIO setup scripts.",
    "size": "9 Python source modules, SQL DDL schema scripts, Docker Compose manifest, and 100,000 synthetic financial transaction events",
    "seeded_cases": "Late-arriving events outside watermark, schema mismatch fields, out-of-order timestamps, and worker abrupt kill mid-microbatch",
    "label_source": "Deterministic transaction ID manifests and Delta Lake transaction log version commit counts",
    "personal_data_policy": "Strictly mock synthetic credit card transactions and simulated merchant IDs; no real personal data used"
  },
  "components": [
    {"name": "Kafka Streaming Ingestion & Bronze Raw Event Lakehouse Layer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Spark Structured Streaming Deduplication & Silver Cleaning Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Delta Lake ACID Transaction Log & Parquet Compaction Worker", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Gold Dimension Aggregations & Analytical SQL Data Mart", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "MinIO Object Storage & S3-Compatible Cloud Lakehouse Store", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Streaming Lakehouse Throughput & Watermark Lag Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Lakehouse Architecture Guide & Medallion Schema Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Delta Lake Change Data Feed (CDF) propagating row-level updates and deletes downstream to external search indexes",
      "Automated Z-Order clustering optimization on high-cardinality merchant and customer ID columns",
      "Streaming dead-letter quarantine routing corrupted JSON records to error buckets without failing the main pipeline"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Kafka & MinIO Infrastructure Setup in Kafka and MinIO",
      "hours": 10,
      "done_criterion": "Docker Compose launches Kafka and MinIO; test events publish and read successfully."
    },
    {
      "name": "Bronze Ingestion & Silver Deduplication in Python, Apache Spark and Delta Lake",
      "hours": 10,
      "done_criterion": "Spark streams to Bronze; Silver cleans and drops duplicates within 10-minute watermark."
    },
    {
      "name": "Gold Analytical Aggregations & Delta Time Travel in SQL and Data Engineering",
      "hours": 10,
      "done_criterion": "Gold table computes 5-minute sliding metrics; Delta time travel queries historical snapshots."
    },
    {
      "name": "Streaming Benchmark, Deduplication Anti-Fake Test & Docs in Streaming Systems",
      "hours": 10,
      "done_criterion": "Ingestion sustains >= 10,000 events/sec; anti-fake test validates deduplication; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python, PySpark Structured Streaming APIs, and SQL data transformations",
    "Understanding of distributed lakehouse concepts (Delta Lake, ACID transactions), Kafka streaming, and object storage (S3/MinIO)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, memory, and disk I/O bound data pipeline software)",
    "cost": "$0 (fully open-source stack using local Docker Desktop for Kafka, Spark, and MinIO)",
    "accounts_keys_quotas": "No external AWS cloud accounts, Databricks licenses, or paid S3 quotas required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Kafka, Spark standalone master, and MinIO containers) and Python 3.11",
    "fallback_path": "Running PySpark in local mode (`spark.master=local[*]`) writing to local filesystem directory if MinIO container is unavailable"
  },
  "riskiest_component": {
    "name": "Small File Problem and Out-of-Memory Errors in Stateful Streaming Aggregations",
    "mitigation": "Configure watermarks to purge state stores after 10 minutes and schedule periodic Delta OPTIMIZE compaction jobs.",
    "fallback": "Increase micro-batch trigger interval to 5 seconds to reduce generated Parquet file frequency."
  },
  "deliverables": [
    "Git repository containing PySpark streaming jobs, Kafka event producers, Delta Lake schemas, and MinIO scripts",
    "Docker Compose file launching local Kafka, Spark standalone cluster, and MinIO instances",
    "Automated benchmark harness profiling streaming throughput, end-to-end latency, and checkpoint recovery",
    "Screener verification script executing automated streaming pipeline and dynamic deduplication validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Commercial Databricks Lakehouse Platform or AWS EMR multi-node cluster deployment",
    "Multi-terabyte distributed machine learning model training on Spark",
    "Complex real-time CDC extraction from physical production Oracle databases"
  ],
  "safety_note": None,
  "resources": [
    "Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores (Armbrust et al., VLDB 2020)",
    "Apache Spark Structured Streaming Programming Guide (Official Apache Spark Documentation)",
    "The Log-Structured Merge-Tree and Modern Lakehouse Storage (Martin Kleppmann)"
  ],
  "rubric": [
    {
      "input": "100,000 synthetic transaction events streamed at 15,000 events per second",
      "action": "python ./benchmarks/bench_streaming.py --events 100000 --rate 15000",
      "expected_result": "Pipeline processes events with sustained throughput >= 10,000 events/sec into Delta Lake",
      "evidence_location": "Terminal output log and reports/streaming_throughput.json",
      "pass_criterion": "Throughput >= 10000 events/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "5,000 continuous transaction events streamed under 2-second microbatch trigger",
      "action": "python ./benchmarks/bench_latency.py --events 5000 --trigger-interval 2s",
      "expected_result": "Events appear in Gold Delta table with p95 end-to-end latency < 6.0 seconds",
      "evidence_location": "Latency timing report in reports/e2e_latency.json",
      "pass_criterion": "p95 latency < 6.0s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 duplicate event pairs published to Kafka within 10-minute watermark window",
      "action": "python ./tests/test_watermark_dedup.py --duplicates 50",
      "expected_result": "Silver Delta table contains exactly 50 records; all duplicates dropped by Spark Structured Streaming",
      "evidence_location": "Deduplication audit report in reports/dedup_audit.json",
      "pass_criterion": "Silver table record count matches ground truth with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Abrupt SIGKILL termination of Spark worker process mid-streaming microbatch",
      "action": "python ./tests/test_checkpoint_recovery.py --kill-worker",
      "expected_result": "Spark restarts from MinIO checkpoint with 0 missing records and 0 duplicate records committed",
      "evidence_location": "Checkpoint recovery test log in reports/recovery_audit.json",
      "pass_criterion": "Pipeline recovers cleanly with valid transaction logs and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated transaction 'tx_test_999' published twice to Kafka topic with 5-second interval",
      "action": "python ./scripts/verify_exact_dedup.py --tx-id tx_test_999 --delay 5",
      "expected_result": "Bronze table records 2 raw rows; Silver table contains exactly 1 deduplicated row",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms exactly 1 row in Silver for tx_test_999 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected continuous lakehouse streaming ETL pipeline in Python with Apache Spark, Delta Lake, and Kafka; sustained [STREAM_THROUGHPUT] events per second ingestion throughput, and delivered sub-[STREAM_LATENCY] second end-to-end processing latency.",
    "claims": [
      {
        "text": "sustained [STREAM_THROUGHPUT] events per second ingestion throughput",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[STREAM_LATENCY] second end-to-end processing latency",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "managed Databricks cloud platform deployment or commercial AWS EMR clustering"
  },
  "verify": [
    "Run `pytest tests/` to confirm Spark streaming transforms, Delta Lake table writes, and watermarking pass.",
    "Execute `python ./benchmarks/bench_streaming.py` to verify streaming throughput exceeds 10,000 events/sec.",
    "Run `python ./scripts/verify_exact_dedup.py` to assert exactly-once deduplication in Silver tables."
  ],
  "worksheet": {
    "q1": "Core deliverable: a real-time lakehouse streaming ETL pipeline in Python with Apache Spark Structured Streaming, Delta Lake, and Kafka.",
    "q2": "Target users: senior data engineers, big data platform architects, and distributed systems developers.",
    "q3": "3 use cases: fintech fraud detection, ride-hailing surge pricing, and e-commerce inventory ledger reconciliation.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Spark watermarks and state stores, Delta Lake ACID transactions under failures, small-file Parquet compaction, and Medallion architecture.",
    "q6": "Starter input: PySpark streaming jobs, Kafka event producers, Delta schemas, and MinIO setup scripts. Synthetic transaction data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/storage bound, $0 cost using Docker containers. Zero AWS cloud fees.",
    "q8": "Riskiest component: small-file problem and streaming state memory leaks. Fallback: 10-minute state purges and periodic Delta OPTIMIZE compaction.",
    "q9": "Potential faking: batch script pretending to be streaming. Anti-fake check 5 emits duplicate transactions with 5s delay and asserts Silver table deduplication.",
    "q10": "Safe; synthetic financial transactions and local MinIO storage buckets only."
  }
}

b70_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, Medallion layer specs, and Delta Lake ACID parameters | High |
| Tech Stack | Python, Apache Spark, Delta Lake, Kafka, AWS S3, SQL | Listed AWS S3 without pinning free local execution (MinIO) or defining checkpoint strategies | Medium |
| Rubric | Missing quantitative targets | Lacked concrete streaming throughput thresholds, end-to-end latency bounds, and deduplication tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b70_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Docker Desktop for Kafka, Spark, and MinIO at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Streaming throughput (>= 10,000 events/sec), end-to-end latency (< 6.0s), and deduplication parity (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. PySpark in local mode (`spark.master=local[*]`) writing to local filesystem if MinIO container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic transaction generator and automated load test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: managed Databricks cloud suites, AWS EMR multi-node clusters, and physical Oracle CDC replication.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 emits duplicate events with 5s delay, asserting 2 rows in Bronze but exactly 1 row in Silver.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b70_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Delta Change Data Feed and Z-Order clustering to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic streaming metrics (ingestion throughput, end-to-end latency, and watermark deduplication).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake duplicate event deduplication test.
"""

# ==============================================================================
# 71. brief-supply-chain-optimization
# ==============================================================================
b71_data = {
  "id": "brief-supply-chain-optimization",
  "title": "Supply Chain Vehicle Routing Optimizer with Google OR-Tools, OpenStreetMap & FastAPI",
  "domain": "Algorithms & Applied Math",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML/data pipeline", "Full-stack web"],
  "problem": "Last-mile delivery and supply chain logistics fleets waste thousands of fuel hours, fail strict delivery appointment windows, and incur excessive driver overtime costs when route dispatchers rely on manual scheduling or naive greedy distance heuristics. The Vehicle Routing Problem with Time Windows (VRPTW) and capacity constraints is an NP-hard combinatorial optimization challenge where adding even 20 delivery stops creates factorial search spaces that overwhelm standard computing pipelines. This project builds a production-grade supply chain route optimization engine in Python using Google OR-Tools. The system models multi-vehicle capacity limits, customer delivery time windows, and driver shift constraints, calculates real-world distance matrices using OpenStreetMap, solves routes using Guided Local Search metaheuristics in under 15 seconds for 100 stops, and visualizes turn-by-turn routes on interactive React map dashboards.",
  "use_cases": [
    {
      "title": "E-Commerce Urban Last-Mile Parcel Delivery",
      "first_sentence": "Urban courier delivery fleets dispatching 500 packages daily across 20 vans need optimal delivery sequencing to minimize total transit miles.",
      "second_sentence": "The solver ingests delivery coordinates and parcel weight packages, generating turn-by-turn routes that reduce fleet vehicle mileage by over 22%."
    },
    {
      "title": "Grocery Cold-Chain Delivery with Strict Time Windows",
      "first_sentence": "Fresh grocery delivery platforms promising 1-hour customer delivery windows must balance vehicle refrigeration capacities against customer arrival commitments.",
      "second_sentence": "The OR-Tools routing model enforces strict time window boundaries, ensuring refrigerated delivery vans arrive within designated customer windows without perishable spoilage."
    },
    {
      "title": "Medical Specimen Hospital Pickup Fleet Dispatch",
      "first_sentence": "Clinical diagnostic laboratories picking up laboratory specimens from regional clinics must guarantee sample pickup within 2 hours of collection.",
      "second_sentence": "The optimization engine schedules on-demand hospital pickup dispatches, assigning couriers to priority clinic stops while respecting vehicle specimen volume caps."
    }
  ],
  "hard_parts": [
    "Formulating the multi-vehicle routing problem (VRPTW) in Google OR-Tools with heterogeneous fleet capacities, drop-off service times, and penalty dropped-node costs",
    "Configuring metaheuristic search strategies (Guided Local Search, Tabu Search) to escape local minima and converge to high-quality solutions within 15 seconds",
    "Constructing and caching real-world distance and travel-time matrices using OpenStreetMap road network graphs without hitting external API rate limits",
    "Handling dynamic route recalculations when emergency priority pickup orders are inserted into an active dispatch schedule mid-shift"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating the OR-Tools mathematical model, OpenStreetMap matrix calculators, FastAPI optimization routers, and React map views",
    "Optimization benchmark proving >= 20% total route mileage reduction compared to nearest-neighbor greedy heuristics across 100 delivery stops",
    "Anti-fake verification script adding an impossible constraint (stop demanding 500kg when max van capacity is 200kg) and asserting the solver drops the node with a penalty violation rather than crashing"
  ],
  "job_families": [
    "Operations Research Engineer",
    "Logistics Platform Software Developer",
    "Applied Math / Algorithm Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language implementing mathematical routing models, distance caches, and REST services"},
    {"tool": "OR-Tools", "role": "Google operations research constraint programming and vehicle routing solver library"},
    {"tool": "OpenStreetMap", "role": "open-source geospatial road network dataset providing routing coordinates and travel time graphs"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving optimization submission endpoints and solution payloads"},
    {"tool": "React", "role": "frontend dashboard framework rendering interactive route polylines and delivery stop markers"}
  ],
  "architecture": {
    "components": [
      {
        "name": "OR-Tools Constraint Programming & Vehicle Routing Solver",
        "tools_used": ["Python", "OR-Tools"],
        "purpose": "Constructs routing index managers, registers transit callbacks, sets vehicle capacity dimensions, and executes Guided Local Search"
      },
      {
        "name": "OpenStreetMap Geocoding & Distance Matrix Cache Worker",
        "tools_used": ["Python", "OpenStreetMap"],
        "purpose": "Calculates pairwise travel duration and distance matrices from road network coordinates and caches matrices in SQLite"
      },
      {
        "name": "FastAPI Route Optimization API & Dispatch Fleet Scheduler",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Validates fleet dispatch requests, triggers asynchronous solver jobs, and formats turn-by-turn route itineraries"
      },
      {
        "name": "Interactive Fleet Route Map & Turn-by-Turn React Dashboard",
        "tools_used": ["Python", "React"],
        "purpose": "Renders delivery stops, color-coded vehicle path polylines, customer time window badges, and vehicle capacity meters"
      },
      {
        "name": "Routing Solver Efficiency & Solution Cost Benchmark Harness",
        "tools_used": ["Python", "OR-Tools"],
        "purpose": "Benchmarks solver convergence speed, mileage savings over greedy baselines, and time window violation penalties"
      },
      {
        "name": "Supply Chain Optimization Guide & Vehicle Routing Manual",
        "tools_used": ["Python", "OR-Tools"],
        "purpose": "Documents VRPTW mathematical formulations, metaheuristic tuning parameters, and OpenStreetMap graph setups"
      }
    ],
    "data_flow": "A dispatcher submits 100 delivery orders with customer coordinates, package weights, and delivery windows to FastAPI; the distance matrix worker checks its local SQLite cache for pairwise travel times (or computes Haversine/OSM routes) and returns a 100x100 matrix; the OR-Tools model creates the RoutingIndexManager, adds vehicle capacity constraints (max 1,000kg per van across 5 vans), and defines time window dimensions; the solver executes Guided Local Search with a 15-second time limit; the optimal route sequence, arrival times, and vehicle assignments return via JSON; the React dashboard renders delivery polylines and stop markers on an interactive map.",
    "enforcement_mechanism": "Hard constraint dimensions on vehicle capacities and time windows rejecting infeasible assignment combinations."
  },
  "targets": [
    {
      "metric": "Mileage Reduction Over Greedy Baseline",
      "method": "Total fleet transit mileage reduction achieved by Guided Local Search compared to nearest-neighbor greedy heuristic across 100 stops",
      "input": "100 benchmark delivery stops distributed across a 50km urban radius with 5 delivery vehicles",
      "environment": "Standard 4-core local CPU, Python 3.11 with Google OR-Tools 9.7+",
      "minimum_pass": "Total fleet mileage reduction is >= 18.0% over greedy baseline",
      "target": "Total fleet mileage reduction is >= 24.5% over greedy baseline",
      "report": "Route optimization cost comparison report and mileage reduction breakdown"
    },
    {
      "metric": "100-Stop Solver Convergence Execution Latency",
      "method": "Wall-clock timing from optimization initiation to solution extraction for a 100-stop multi-vehicle VRPTW problem",
      "input": "100 customer delivery stops with time windows and 5 capacity-constrained delivery vans",
      "environment": "Standard 4-core local CPU, OR-Tools solver with 15-second search time limit",
      "minimum_pass": "Solver returns feasible high-quality solution in < 15.0 seconds",
      "target": "Solver returns feasible high-quality solution in < 7.5 seconds",
      "report": "Solver convergence profiling log and objective function progression curve"
    },
    {
      "metric": "Delivery Time Window & Capacity Violation Parity Rate",
      "method": "Percentage of generated vehicle routes satisfying 100% of defined customer delivery time windows and capacity caps",
      "input": "50 simulated delivery dispatch runs with strict 1-hour customer arrival windows and 500kg vehicle caps",
      "environment": "Deterministic mathematical constraint validation test suite in Python",
      "minimum_pass": "50 of 50 delivery dispatch runs exhibit 0 time window and 0 capacity constraint violations",
      "target": "50 of 50 delivery dispatch runs exhibit 0 time window and 0 capacity constraint violations",
      "report": "Constraint satisfaction audit log and schedule feasibility verification"
    }
  ],
  "skills": ["Python", "OR-Tools", "OpenStreetMap", "FastAPI", "React", "Algorithms", "Operations Research"],
  "starter_input": {
    "spec": "Directory containing OR-Tools VRPTW solver code, OpenStreetMap distance calculator, FastAPI service, and React map viewer.",
    "size": "8 Python source modules, React map component, sample 100-stop urban coordinate dataset, and automated benchmark harness",
    "seeded_cases": "Overlapping customer time windows, tight vehicle capacity bottlenecks, unreachable road coordinates, and isolated outlier stops",
    "label_source": "Deterministic OR-Tools objective values and mathematical constraint validation assertions",
    "personal_data_policy": "Strictly mock synthetic customer delivery addresses and simulated package weights; no real personal data used"
  },
  "components": [
    {"name": "OR-Tools Constraint Programming & Vehicle Routing Solver", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "OpenStreetMap Geocoding & Distance Matrix Cache Worker", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "FastAPI Route Optimization API & Dispatch Fleet Scheduler", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Interactive Fleet Route Map & Turn-by-Turn React Dashboard", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Routing Solver Efficiency & Solution Cost Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Supply Chain Optimization Guide & Vehicle Routing Manual", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic real-time traffic congestion factor integration scaling travel times based on time of day",
      "Electric vehicle (EV) charging station detour scheduling considering battery range and charging duration",
      "Pickup-and-delivery paired constraints (PDPTW) ensuring items are picked up before corresponding deliveries"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "OR-Tools VRPTW Formulation & Constraints in Python and OR-Tools",
      "hours": 7,
      "done_criterion": "Solver models capacity and time windows; Guided Local Search converges to feasible routes."
    },
    {
      "name": "OpenStreetMap Distance Matrix & Geocoding in OpenStreetMap and Algorithms",
      "hours": 7,
      "done_criterion": "Distance matrix worker calculates pairwise times; SQLite caches road network distances."
    },
    {
      "name": "FastAPI Solver API & React Route Map Dashboard in FastAPI and React",
      "hours": 7,
      "done_criterion": "FastAPI serves optimization jobs; React UI renders interactive vehicle routes and stop markers."
    },
    {
      "name": "Mileage Reduction Benchmark, Infeasible Drop Anti-Fake Test & Docs in Operations Research",
      "hours": 7,
      "done_criterion": "Benchmark confirms >= 18% mileage reduction; anti-fake test drops overweight stop; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, combinatorial optimization algorithms, and FastAPI",
    "Understanding of Operations Research principles (linear programming, constraint satisfaction, vehicle routing problems)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU bound constraint programming algorithms and local web servers)",
    "cost": "$0 (fully open-source stack using local Python, OR-Tools, and open geospatial datasets)",
    "accounts_keys_quotas": "No external Google Maps paid API keys required (uses open-source OpenStreetMap / Haversine matrices)",
    "reference_environment": "Local 4-core CPU with Python 3.11, Google OR-Tools 9.7+, and Node.js (for React map viewer)",
    "fallback_path": "Calculated geometric Euclidean/Haversine distance matrices if local OpenStreetMap server is unavailable"
  },
  "riskiest_component": {
    "name": "Combinatorial Explosion Causing Solver Timeout on Complex Time Windows",
    "mitigation": "Set strict solver time limits (15 seconds) and use initial greedy heuristic solutions (PATH_CHEAPEST_ARC) before metaheuristic refinement.",
    "fallback": "Cluster stops into geographical zones using K-Means and solve smaller sub-problems independently."
  },
  "deliverables": [
    "Git repository containing OR-Tools routing engine, distance matrix calculator, FastAPI service, and React map viewer",
    "Sample 100-stop benchmark dataset with customer time windows and parcel weight attributes",
    "Automated evaluation benchmark script comparing Guided Local Search mileage against greedy heuristics",
    "Screener verification script executing automated 100-stop optimization and dynamic constraint violation test in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial Google Maps Route Optimization paid API integrations",
    "Turn-by-turn mobile GPS turn navigation audio synthesis",
    "Autonomous drone flight path 3D aerodynamic routing"
  ],
  "safety_note": None,
  "resources": [
    "Google OR-Tools Vehicle Routing Problem Documentation & Guides",
    "The Vehicle Routing Problem with Time Windows (Solomon, Transportation Science)",
    "OpenStreetMap OSRM Routing Engine Documentation"
  ],
  "rubric": [
    {
      "input": "100 benchmark delivery stops solved using Guided Local Search vs greedy heuristic",
      "action": "python ./benchmarks/bench_mileage.py --stops 100 --vehicles 5",
      "expected_result": "OR-Tools Guided Local Search achieves >= 18.0% mileage reduction compared to greedy baseline",
      "evidence_location": "Terminal output log and reports/mileage_comparison.json",
      "pass_criterion": "Mileage reduction >= 18.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100-stop multi-vehicle VRPTW problem submitted to optimization solver",
      "action": "python ./solver/run_vrptw.py --stops 100 --timeout 15",
      "expected_result": "Solver converges to feasible schedule with 0 constraint violations in < 15.0 seconds",
      "evidence_location": "Optimization execution log in reports/solver_timing.json",
      "pass_criterion": "Execution latency < 15.0s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 simulated dispatch runs with strict 1-hour customer delivery windows",
      "action": "python ./tests/test_time_windows.py --runs 50",
      "expected_result": "All 50 runs satisfy time windows with 0 arrival violations across all delivery stops",
      "evidence_location": "Constraint satisfaction test log in reports/window_audit.json",
      "pass_criterion": "0 arrival violations with exit code 0",
      "kind": "normal"
    },
    {
      "input": "FastAPI request submitting 20 delivery stops and requesting route GeoJSON",
      "action": "curl -X POST http://localhost:8000/api/v1/optimize -H 'Content-Type: application/json' -d @data/sample_stops.json",
      "expected_result": "API responds with vehicle routes, stop sequences, and GeoJSON polylines in < 5 seconds",
      "evidence_location": "HTTP response JSON and route itinerary file",
      "pass_criterion": "Response status 200 with non-empty route polylines and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Impossible delivery request with 500kg parcel where all available vehicles have 200kg capacity",
      "action": "python ./scripts/verify_unfeasible_drop.py --overweight-kg 500 --max-capacity-kg 200",
      "expected_result": "Solver detects capacity violation, drops the unfeasible stop with penalty, and solves remaining stops",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms unfeasible node dropped with penalty and remaining solved with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected supply chain vehicle routing optimizer in Python using Google OR-Tools and OpenStreetMap; reduced fleet transit mileage by [MILEAGE_REDUCTION] over heuristic baselines, and converged multi-vehicle schedules across [STOP_COUNT] stops in sub-[SOLVER_LATENCY] seconds.",
    "claims": [
      {
        "text": "reduced fleet transit mileage by [MILEAGE_REDUCTION] over heuristic baselines",
        "rubric_indexes": [0]
      },
      {
        "text": "converged multi-vehicle schedules across [STOP_COUNT] stops in sub-[SOLVER_LATENCY] seconds",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "paid Google Maps commercial API usage or autonomous drone aerodynamic pathing"
  },
  "verify": [
    "Run `pytest tests/` to confirm OR-Tools model formulations, distance matrix caching, and FastAPI endpoints pass.",
    "Execute `python ./benchmarks/bench_mileage.py` to verify mileage reduction exceeds 18% threshold.",
    "Run `python ./scripts/verify_unfeasible_drop.py` to assert unfeasible stops are dropped gracefully."
  ],
  "worksheet": {
    "q1": "Core deliverable: a supply chain vehicle routing optimizer in Python using Google OR-Tools, OpenStreetMap, and FastAPI.",
    "q2": "Target users: operations research engineers, logistics platform developers, and algorithm engineers.",
    "q3": "3 use cases: e-commerce urban parcel delivery, grocery cold-chain delivery with time windows, and medical specimen hospital pickups.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: VRPTW capacity and time window constraint formulations, Guided Local Search convergence, OpenStreetMap distance caching, and dynamic re-routing.",
    "q6": "Starter input: OR-Tools solver code, distance matrix calculator, FastAPI service, and 100-stop urban coordinate dataset. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using open-source OR-Tools and OpenStreetMap. Zero paid Google keys.",
    "q8": "Riskiest component: combinatorial explosion causing solver timeouts. Fallback: 15-second time limits and initial PATH_CHEAPEST_ARC solutions.",
    "q9": "Potential faking: returning simple straight-line order without solving constraints. Anti-fake check 5 injects an impossible 500kg stop into 200kg vans and asserts penalty node dropping.",
    "q10": "Safe; synthetic delivery coordinates and simulated parcel weights only, zero personal data."
  }
}

b71_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, VRPTW mathematical specifications, and solver convergence bounds | High |
| Tech Stack | Python, OR-Tools, Google Maps API, FastAPI, React | Listed Google Maps API requiring paid credit card keys instead of free open-source alternatives (OpenStreetMap) | High |
| Rubric | Missing quantitative targets | Lacked concrete mileage reduction criteria, solver timing bounds, and unfeasible constraint tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b71_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python and open-source Google OR-Tools at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Mileage reduction (>= 18%), solver latency (< 15s for 100 stops), and window parity (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Geometric Haversine distance calculations without requiring external OpenStreetMap routing servers.",
  "Can test data be created in minutes?": "YES. Synthetic 100-stop urban coordinate generator and automated routing benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial Google Maps paid API integrations, mobile audio turn-by-turn navigation, and drone 3D flight paths.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 injects an impossible 500kg parcel for 200kg vans and verifies solver drops the node with penalty.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b71_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved dynamic traffic congestion factors and EV charging detours to Extended Path (+14h).
- Target Realism: Eliminated paid Google Maps API dependencies in favor of OpenStreetMap; established authentic OR-Tools metrics (mileage reduction, solve latency, and constraint satisfaction).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake unfeasible capacity constraint drop test.
"""

# ==============================================================================
# 72. brief-terraform-cloud-infra
# ==============================================================================
b72_data = {
  "id": "brief-terraform-cloud-infra",
  "title": "Production Infrastructure as Code with Modular Terraform, TFLint & LocalStack Cloud Emulation",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Cloud architecture", "Platform/infra tool"],
  "problem": "Software engineering teams managing cloud resources through ad-hoc manual console clicking or monolithic copy-pasted configuration files suffer from severe configuration drift, untracked security misconfigurations, and catastrophic accidental resource destructions. Furthermore, practicing Infrastructure as Code (IaC) against live cloud provider environments incurs unpredictable monthly billing, risks accidental credential leakage, and creates slow feedback cycles. This project builds a production-grade infrastructure-as-code automation platform in Terraform. The system provisions a multi-tier cloud topology (VPC, public/private subnets, ECS Fargate containers, Application Load Balancers, RDS PostgreSQL, and CloudWatch alarms) using reusable Terraform modules, enforces strict static linting and security scanning with TFLint and Checkov, validates state deployments offline on LocalStack, and executes automated plan/apply CI/CD workflows with zero cloud expenses.",
  "use_cases": [
    {
      "title": "Multi-Environment Staging and Production Parity",
      "first_sentence": "Enterprise software platform teams require identical infrastructure topology across staging, QA, and production environments.",
      "second_sentence": "Parameterized Terraform modules deploy environment tiers with variable sizing while maintaining identical networking and security group topologies."
    },
    {
      "title": "Automated Pull Request Infrastructure Drift Detection",
      "first_sentence": "DevOps teams need continuous verification that cloud resource states match declared Git repositories without out-of-band manual drift.",
      "second_sentence": "Scheduled GitHub Actions workflows execute `terraform plan -detailed-exitcode` against LocalStack, alerting engineers immediately upon drift detection."
    },
    {
      "title": "Automated Security Compliance Policy Gate",
      "first_sentence": "Security operations teams must ensure no S3 buckets are public and all database storage volumes are encrypted before infrastructure commits.",
      "second_sentence": "Pre-commit Checkov and TFLint static analysis hooks inspect Terraform HCL code, automatically blocking commits that violate defined security standards."
    }
  ],
  "hard_parts": [
    "Structuring reusable, composable Terraform modules (networking, compute, database, monitoring) with strict input type constraints and sensible default variables",
    "Configuring LocalStack Docker container environments to emulate AWS VPC, ECS, RDS, and CloudWatch APIs with accurate resource attribute mappings",
    "Integrating static analysis scanners (TFLint and Checkov) into pre-commit and CI/CD pipelines to catch security violations prior to deployment",
    "Designing atomic remote state management strategies with S3 backend locking simulation and sensitive variable isolation"
  ],
  "screener_signals": [
    "Clean Terraform codebase cleanly separating root environment entrypoints, reusable `/modules/` subdirectories, TFLint rules, and Checkov policy configs",
    "Automated deployment benchmark report proving complete multi-tier infrastructure provisioning and verification in under 90 seconds on LocalStack",
    "Anti-fake verification script attempting to commit an unencrypted RDS database and public ingress security group and asserting Checkov fails with exit code 1"
  ],
  "job_families": [
    "DevOps Engineer",
    "Cloud Infrastructure Architect",
    "Platform Systems Software Engineer"
  ],
  "stack": [
    {"tool": "Terraform", "role": "declarative infrastructure as code tool defining cloud resources, modules, and state backends"},
    {"tool": "LocalStack", "role": "local cloud emulator providing offline AWS VPC, ECS, RDS, and CloudWatch APIs at $0 cost"},
    {"tool": "Docker", "role": "container runtime hosting LocalStack and testing containerized application deployments"},
    {"tool": "TFLint", "role": "Terraform linter checking for syntax errors, deprecated syntax, and provider-specific best practices"},
    {"tool": "GitHub Actions", "role": "continuous integration workflow engine executing automated plan, security scan, and apply stages"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Modular Terraform VPC & Network Foundation Architecture",
        "tools_used": ["Terraform", "LocalStack"],
        "purpose": "Provisions custom VPC with public and private subnets across 2 availability zones, route tables, and NAT gateways"
      },
      {
        "name": "Terraform ECS Fargate Application & Load Balancer Module",
        "tools_used": ["Terraform", "LocalStack", "Docker"],
        "purpose": "Configures ECS cluster, task definitions, Fargate services, Application Load Balancers, and target groups"
      },
      {
        "name": "Terraform RDS Database & CloudWatch Observability Module",
        "tools_used": ["Terraform", "LocalStack"],
        "purpose": "Deploys PostgreSQL RDS database with storage encryption and provisions CloudWatch metric alarms"
      },
      {
        "name": "TFLint Static Analysis, Checkov Security & Policy Enforcement Layer",
        "tools_used": ["Terraform", "TFLint"],
        "purpose": "Executes static linting and security scanning against HCL modules to enforce encryption and tagging policies"
      },
      {
        "name": "LocalStack Automated Plan, Apply & Drift Detection Benchmark Harness",
        "tools_used": ["Terraform", "LocalStack", "GitHub Actions"],
        "purpose": "Executes automated end-to-end plan, apply, and destroy lifecycles and measures provisioning latency"
      },
      {
        "name": "Infrastructure as Code Modular Architecture Guide & Runbook",
        "tools_used": ["Terraform", "LocalStack"],
        "purpose": "Documents module inputs/outputs, state file locking procedures, and LocalStack endpoint override configs"
      }
    ],
    "data_flow": "An engineer modifies an infrastructure parameter in `environments/staging/`; GitHub Actions triggers a CI workflow; TFLint and Checkov scan the Terraform code for syntax errors and security policy violations; if clean, the workflow initializes Terraform pointing provider endpoints to LocalStack at `http://localhost:4566`; `terraform plan` executes, generating an execution plan artifact; `terraform apply` applies the plan, creating the VPC, subnets, ECS Fargate cluster, RDS database, and CloudWatch alarms in LocalStack; automated verification scripts run health checks against the provisioned ALB endpoint; `terraform plan -detailed-exitcode` verifies zero drift.",
    "enforcement_mechanism": "Checkov policy rules blocking insecure HCL configurations; Terraform state locking preventing concurrent execution races."
  },
  "targets": [
    {
      "metric": "End-to-End Infrastructure Provisioning Latency",
      "method": "Wall-clock timing to execute `terraform apply` across multi-tier modular architecture (VPC, ECS, RDS, CloudWatch) on LocalStack",
      "input": "Complete production infrastructure stack containing 25 distinct cloud resources",
      "environment": "Standard 4-core local CPU, LocalStack 3+ in Docker, Terraform 1.5+",
      "minimum_pass": "Full infrastructure deployment completes in < 90.0 seconds",
      "target": "Full infrastructure deployment completes in < 42.0 seconds",
      "report": "Terraform apply timing trace log and resource creation breakdown table"
    },
    {
      "metric": "Static Security & Compliance Policy Enforcement Rate",
      "method": "Percentage of introduced security misconfigurations (e.g. unencrypted storage, open ingress) caught and blocked by Checkov/TFLint",
      "input": "20 intentional security flaws injected into Terraform HCL modules",
      "environment": "Checkov security scanner and TFLint CLI running in automated test suite",
      "minimum_pass": "20 of 20 security violations detected and blocked with exit code 1",
      "target": "20 of 20 security violations detected and blocked with exit code 1",
      "report": "Checkov security scan report and policy violation summary"
    },
    {
      "metric": "Post-Apply Configuration Drift Detection Rate",
      "method": "Verification of zero drift detected by `terraform plan -detailed-exitcode` following successful apply",
      "input": "Applied 25-resource infrastructure state tested across 10 repeated drift detection checks",
      "environment": "LocalStack local cloud emulator with simulated S3 state backend",
      "minimum_pass": "10 of 10 drift checks return exit code 0 confirming perfect infrastructure parity",
      "target": "10 of 10 drift checks return exit code 0 confirming perfect infrastructure parity",
      "report": "Drift detection audit log and Terraform plan exit code report"
    }
  ],
  "skills": ["Terraform", "LocalStack", "Docker", "TFLint", "GitHub Actions", "Platform & DevOps", "Cloud Architecture", "IaC"],
  "starter_input": {
    "spec": "Directory containing modular Terraform code (VPC, ECS, RDS, CloudWatch), LocalStack overrides, TFLint rules, and test scripts.",
    "size": "15 Terraform HCL files, TFLint configuration file, Checkov policy config, and automated test runner",
    "seeded_cases": "Unencrypted RDS storage volumes, public security groups (0.0.0.0/0 on port 22), missing resource tags, and circular module references",
    "label_source": "Deterministic Terraform state JSON schemas and TFLint/Checkov violation exit codes",
    "personal_data_policy": "Strictly mock synthetic infrastructure configurations and simulated AWS account IDs; no real personal data used"
  },
  "components": [
    {"name": "Modular Terraform VPC & Network Foundation Architecture", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Terraform ECS Fargate Application & Load Balancer Module", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Terraform RDS Database & CloudWatch Observability Module", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "TFLint Static Analysis, Checkov Security & Policy Enforcement Layer", "task_type": "security hardening checks", "hours": 4.0},
    {"name": "LocalStack Automated Plan, Apply & Drift Detection Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Infrastructure as Code Modular Architecture Guide & Runbook", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "features": [
      "Terragrunt DRY architecture orchestration managing multi-account and multi-region module hierarchies",
      "Automated cost estimation using Infracost CLI calculating simulated monthly expenditure diffs in pull requests",
      "Terraform custom provider plugin written in Go managing proprietary local internal service resources"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Modular VPC & Network Foundation in Terraform and LocalStack",
      "hours": 7,
      "done_criterion": "VPC module provisions public/private subnets and route tables in LocalStack."
    },
    {
      "name": "ECS Fargate & RDS Database Modules in Docker and Cloud Architecture",
      "hours": 7,
      "done_criterion": "ECS cluster, Fargate service, and RDS PostgreSQL deploy with storage encryption."
    },
    {
      "name": "TFLint & Checkov Security Policy Enforcement in TFLint and IaC",
      "hours": 7,
      "done_criterion": "TFLint and Checkov validate HCL; 20 of 20 injected security flaws block with exit code 1."
    },
    {
      "name": "CI/CD Plan/Apply Pipeline, Anti-Fake Test & Docs in GitHub Actions and Platform & DevOps",
      "hours": 7,
      "done_criterion": "Deployment completes in < 90s with 0 drift; anti-fake blocks unencrypted RDS; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Terraform HCL syntax, module composition, input/output variables, and state management",
    "Understanding of cloud networking (VPC, subnets, routing), container platforms (ECS Fargate), and CI/CD pipelines"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and local container bound IaC toolchains)",
    "cost": "$0 (fully open-source stack using local Terraform CLI and Docker LocalStack)",
    "accounts_keys_quotas": "No external AWS cloud accounts, credit cards, or paid service quotas required (runs 100% offline via LocalStack)",
    "reference_environment": "Local 4-core CPU with Docker Desktop (LocalStack 3+ container), Terraform 1.5+, TFLint, and checkov installed",
    "fallback_path": "Running `terraform validate` and `terraform plan` with mock provider credentials if Docker is unavailable"
  },
  "riskiest_component": {
    "name": "State File Corruption and Concurrency Race Conditions",
    "mitigation": "Configure S3 remote state storage with DynamoDB state locking simulation in LocalStack and enforce atomic apply workflows.",
    "fallback": "Versioned state backup files enabling automatic state rollback."
  },
  "deliverables": [
    "Git repository containing modular Terraform code (VPC, ECS, RDS, CloudWatch), LocalStack overrides, and CI configs",
    "TFLint and Checkov security scanning policy files and automated validation scripts",
    "Automated deployment benchmark harness profiling plan, apply, and drift detection latencies",
    "Screener verification script executing automated LocalStack deployment and dynamic security violation rejection in under 2 minutes"
  ],
  "out_of_scope": [
    "Live commercial AWS production account resource deployment",
    "Production domain DNS registration with public Route 53 zones",
    "Multi-cloud provider orchestration (Azure / GCP simultaneously)"
  ],
  "safety_note": None,
  "resources": [
    "Terraform Up & Running: Writing Infrastructure as Code (Yevgeniy Brikman)",
    "LocalStack Documentation: Emulating AWS Infrastructure Locally",
    "TFLint and Checkov Documentation on Infrastructure Security Scanning"
  ],
  "rubric": [
    {
      "input": "Complete 25-resource multi-tier Terraform stack deployed to LocalStack",
      "action": "terraform apply -auto-approve",
      "expected_result": "Terraform creates VPC, subnets, ECS, RDS, and CloudWatch alarms in < 90.0 seconds",
      "evidence_location": "Terminal output log and reports/terraform_apply.json",
      "pass_criterion": "Deployment duration < 90.0s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 intentional security misconfigurations evaluated by Checkov scanner",
      "action": "checkov -d ./modules --framework terraform",
      "expected_result": "Checkov catches all 20 security violations (unencrypted volumes, open ingress) and exits with code 1",
      "evidence_location": "Checkov security report in reports/checkov_audit.json",
      "pass_criterion": "20 of 20 violations detected with exit code 1",
      "kind": "normal"
    },
    {
      "input": "Post-deployment drift inspection executed against LocalStack resources",
      "action": "terraform plan -detailed-exitcode",
      "expected_result": "Terraform confirms no changes required; infrastructure state matches configuration with exit code 0",
      "evidence_location": "Drift detection audit report in reports/drift_audit.json",
      "pass_criterion": "Exit code 0 confirming perfect infrastructure parity",
      "kind": "normal"
    },
    {
      "input": "TFLint static analysis check across all reusable module subdirectories",
      "action": "tflint --recursive",
      "expected_result": "TFLint verifies HCL syntax, provider constraints, and deprecated attributes with 0 errors",
      "evidence_location": "TFLint execution log in reports/tflint_audit.json",
      "pass_criterion": "0 lint errors with exit code 0",
      "kind": "normal"
    },
    {
      "input": "PR branch adding unencrypted RDS storage volume (`storage_encrypted = false`)",
      "action": "python ./scripts/verify_policy_gate.py --violation unencrypted_rds",
      "expected_result": "Security policy gate blocks deployment and outputs 'FAILED: RDS storage must be encrypted'",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms security policy violation and blocked deployment with exit code 1",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected modular infrastructure as code platform in Terraform with LocalStack and TFLint; provisioned [RESOURCE_COUNT] multi-tier cloud resources in sub-[PROVISION_LATENCY] seconds, and eliminated security regressions with Checkov automated policy enforcement.",
    "claims": [
      {
        "text": "provisioned [RESOURCE_COUNT] multi-tier cloud resources in sub-[PROVISION_LATENCY] seconds",
        "rubric_indexes": [0]
      },
      {
        "text": "eliminated security regressions with Checkov automated policy enforcement",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "live commercial AWS account deployment or multi-cloud simultaneous orchestration"
  },
  "verify": [
    "Run `terraform validate` and `tflint --recursive` to confirm modular HCL syntax passes.",
    "Execute `terraform apply -auto-approve` to verify resources deploy to LocalStack in < 90s.",
    "Run `python ./scripts/verify_policy_gate.py` to assert Checkov security gates block unencrypted storage."
  ],
  "worksheet": {
    "q1": "Core deliverable: a modular infrastructure as code platform in Terraform with LocalStack cloud emulation, TFLint, and Checkov.",
    "q2": "Target users: DevOps engineers, cloud infrastructure architects, and platform systems software developers.",
    "q3": "3 use cases: multi-environment staging/production parity, automated pull request drift detection, and security policy gates.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: reusable module composition, LocalStack API emulation configuration, TFLint/Checkov static policy gates, and drift detection.",
    "q6": "Starter input: Terraform modules (VPC, ECS, RDS, CloudWatch), LocalStack overrides, TFLint rules, and test scripts. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker LocalStack. Zero AWS charges.",
    "q8": "Riskiest component: state file corruption and concurrency races. Fallback: S3 state backend with DynamoDB locking simulation.",
    "q9": "Potential faking: manual AWS console clicking pretending to be IaC. Anti-fake check 5 commits unencrypted RDS and asserts Checkov blocks deployment.",
    "q10": "Safe; synthetic infrastructure configurations and local LocalStack containers only, zero personal data."
  }
}

b72_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, module hierarchy specs, and LocalStack emulation rules | High |
| Tech Stack | Terraform, AWS ECS, AWS RDS, CloudWatch, GitHub Actions | Listed AWS tools without pinning local free execution (LocalStack) or specifying static linters (TFLint) | Medium |
| Rubric | Missing quantitative targets | Lacked concrete provisioning latency bounds, drift detection checks, and security policy tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b72_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Docker Desktop for LocalStack at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Provisioning latency (< 90s for 25 resources), security enforcement (20 of 20), and drift detection (10 of 10) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Running `terraform validate` and `terraform plan` with mock provider credentials if Docker is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic infrastructure modules and automated validation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: live commercial AWS accounts, public Route 53 domains, and multi-cloud simultaneous orchestration.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 attempts to commit an unencrypted RDS database and asserts Checkov blocks deployment with exit code 1.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b72_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Terragrunt orchestration and Infracost pull request estimation to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic IaC metrics (provisioning latency, Checkov security enforcement, and drift detection).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake unencrypted storage policy block test.
"""

# ==============================================================================
# 73. brief-time-series-forecasting
# ==============================================================================
b73_data = {
  "id": "brief-time-series-forecasting",
  "title": "Production Time-Series Forecasting Platform with Prophet, XGBoost Ensembles & FastAPI",
  "domain": "ML Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML/data pipeline", "Full-stack web"],
  "problem": "Enterprises forecasting demand, retail inventory depletion, cloud infrastructure capacity, and financial cash flows suffer from severe forecast errors when relying on single-model architectures or naive statistical moving averages. Isolated models fail to capture composite time-series dynamics: classical statistical methods miss complex nonlinear exogenous covariates, while deep neural networks overfit on short historical datasets and struggle with abrupt holiday shocks. This project builds a production-grade time-series forecasting platform in Python. The system engineers rolling lag features, trains an ensemble combining additive trend/seasonality decomposition (Facebook Prophet) and gradient-boosted decision trees (XGBoost), serves multi-horizon forecasts via FastAPI with sub-25ms inference latency, caches predictions in Redis, and continuously evaluates accuracy using rolling backtests with Weighted Absolute Percentage Error (WAPE).",
  "use_cases": [
    {
      "title": "Retail Omnichannel Product Demand Forecasting",
      "first_sentence": "Retail merchandising directors need 14-day demand forecasts across thousands of store SKUs to prevent stockouts while avoiding excess inventory holding costs.",
      "second_sentence": "The ensemble model captures day-of-week seasonality and holiday sales promotions, outputting item-level demand forecasts that reduce inventory variance by 18%."
    },
    {
      "title": "Cloud Compute Capacity & Autoscaling Prediction",
      "first_sentence": "Cloud infrastructure platform engineers need to anticipate server cluster CPU and memory loads 2 hours in advance to pre-warm container nodes.",
      "second_sentence": "The time-series engine forecasts rolling workload metrics, triggering predictive scaling events before traffic surges cause service degradation."
    },
    {
      "title": "Corporate Cash Flow & Treasury Forecasting",
      "first_sentence": "Corporate financial officers requiring 30-day liquidity projections must forecast daily accounts receivable cash collections.",
      "second_sentence": "The system combines historical recurring invoice payment cycles with calendar month-end effects, generating probabilistic cash flow confidence intervals."
    }
  ],
  "hard_parts": [
    "Engineering robust temporal lag, rolling window statistics, and cyclical calendar features without creating target data leakage across train/validation splits",
    "Combining statistical decomposition (Prophet) and gradient boosting (XGBoost) into a weighted ensemble that minimizes out-of-sample Weighted Absolute Percentage Error (WAPE)",
    "Designing rolling-origin cross-validation backtesting pipelines that evaluate forecast stability across 10 distinct historical time horizons",
    "Serving low-latency multi-horizon forecast requests in FastAPI while caching precomputed predictions and feature matrices in Redis"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating feature engineering pipelines, Prophet/XGBoost model trainers, FastAPI forecast routers, and Redis caching layers",
    "Backtesting benchmark report proving out-of-sample WAPE <= 12.5% and sub-25ms p95 forecast inference latency across 1,000 time series",
    "Anti-fake verification script simulating an unexpected sudden demand spike shock and asserting the model widens its forecast confidence interval bounds appropriately"
  ],
  "job_families": [
    "Time-Series Machine Learning Engineer",
    "Quantitative Data Scientist",
    "Applied Machine Learning Developer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing feature engineering, ensemble modeling, and inference APIs"},
    {"tool": "Prophet", "role": "additive time-series forecasting library modeling non-linear trends, yearly/weekly seasonality, and holidays"},
    {"tool": "XGBoost", "role": "gradient-boosted decision tree algorithm training on autoregressive lag and rolling window features"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving multi-horizon forecast endpoints and backtest metrics"},
    {"tool": "Redis", "role": "in-memory key-value cache storing latest forecast predictions and rolling feature state"},
    {"tool": "Docker", "role": "container runtime hosting Redis cache and orchestrating isolated test environments"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Time-Series Rolling Window Feature Engineering Pipeline",
        "tools_used": ["Python"],
        "purpose": "Computes rolling mean/std features, exponential moving averages, and cyclical date encodings without data leakage"
      },
      {
        "name": "Prophet Trend, Seasonality & Holiday Decomposition Engine",
        "tools_used": ["Python", "Prophet"],
        "purpose": "Fits Bayesian additive models decomposing time-series into trend changepoints, seasonalities, and holiday effects"
      },
      {
        "name": "XGBoost Autoregressive Lag & Gradient Boosting Regressor",
        "tools_used": ["Python", "XGBoost"],
        "purpose": "Trains gradient-boosted trees on engineered lag features and exogenous regressors to predict residual variations"
      },
      {
        "name": "FastAPI Multi-Horizon Forecast Inference & Redis Cache Service",
        "tools_used": ["Python", "FastAPI", "Redis"],
        "purpose": "Exposes forecast generation endpoints, blends ensemble predictions, and caches results in Redis"
      },
      {
        "name": "Time-Series Backtesting & WAPE Accuracy Benchmark Harness",
        "tools_used": ["Python", "Docker"],
        "purpose": "Executes rolling-origin cross-validation, evaluates WAPE and SMAPE metrics, and profiles inference latency"
      },
      {
        "name": "Forecasting Architecture Guide & Rolling Backtest Manual",
        "tools_used": ["Python", "Prophet"],
        "purpose": "Documents feature leakage prevention guidelines, ensemble weighting math, and uncertainty interval calculations"
      }
    ],
    "data_flow": "Historical time-series metrics ingest into the feature pipeline; the pipeline computes rolling lag windows and cyclical features using strict temporal splits; the Prophet model fits trend and seasonality curves, generating baseline predictions and uncertainty intervals; the XGBoost model trains on residual errors and exogenous regressors; the ensemble engine combines predictions using inverse-variance weights; when an API client requests a 14-day forecast for a series, FastAPI checks Redis for precomputed predictions in < 2ms; if missing, it computes the ensemble inference in < 20ms, caches the payload in Redis, and returns the point forecast and 80%/95% confidence intervals; periodic rolling backtests monitor WAPE drift.",
    "enforcement_mechanism": "Temporal cross-validation blocking future data leakage; clipping bounds preventing negative value predictions."
  },
  "targets": [
    {
      "metric": "Out-of-Sample Forecast Accuracy (WAPE)",
      "method": "Weighted Absolute Percentage Error evaluated across 1,000 time series over a 14-day rolling test horizon",
      "input": "1,000 synthetic retail and cloud demand time series covering 2 years of daily observations",
      "environment": "Standard 4-core local CPU, Python 3.11 with Prophet and XGBoost",
      "minimum_pass": "Out-of-sample WAPE is <= 14.5% across the 14-day test horizon",
      "target": "Out-of-sample WAPE is <= 10.8% across the 14-day test horizon",
      "report": "Time-series forecasting accuracy benchmark report and WAPE error distribution"
    },
    {
      "metric": "p95 Forecast Generation Inference Latency",
      "method": "Wall-clock timing from FastAPI request arrival to response dispatch for a 30-day forecast horizon",
      "input": "2,000 forecast queries issued across 50 concurrent client connections",
      "environment": "Standard 4-core local CPU, Redis 7+ in Docker, Python 3.11 with Uvicorn workers",
      "minimum_pass": "p95 forecast inference latency is < 35.0 milliseconds",
      "target": "p95 forecast inference latency is < 14.5 milliseconds",
      "report": "FastAPI forecast latency profiling log and response percentile table"
    },
    {
      "metric": "Uncertainty Interval Coverage Parity Rate",
      "method": "Percentage of actual test observations falling within the model's predicted 90% confidence interval band",
      "input": "10,000 actual test data points evaluated against predicted 90% confidence interval bounds",
      "environment": "Deterministic uncertainty evaluation test suite in Python",
      "minimum_pass": "Observed test coverage is between 87.0% and 93.0% across 10,000 test observations",
      "target": "Observed test coverage is between 89.0% and 91.5% across 10,000 test observations",
      "report": "Confidence interval calibration audit log and empirical coverage curve"
    }
  ],
  "skills": ["Python", "Prophet", "XGBoost", "FastAPI", "Redis", "Docker", "ML Engineering", "Time-Series Forecasting"],
  "starter_input": {
    "spec": "Directory containing feature pipeline code, Prophet/XGBoost ensemble trainers, FastAPI service, and backtest runner.",
    "size": "8 Python source modules, Docker Compose manifest for Redis, and 1,000 synthetic daily time-series datasets",
    "seeded_cases": "Missing dates and irregular intervals, sudden regime change level shifts, extreme outlier demand spikes, and negative inventory values",
    "label_source": "Deterministic synthetic time-series generation formulas and held-out rolling test splits",
    "personal_data_policy": "Strictly mock synthetic product sales numbers and simulated cloud CPU utilization metrics; no real personal data used"
  },
  "components": [
    {"name": "Time-Series Rolling Window Feature Engineering Pipeline", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "Prophet Trend, Seasonality & Holiday Decomposition Engine", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "XGBoost Autoregressive Lag & Gradient Boosting Regressor", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "FastAPI Multi-Horizon Forecast Inference & Redis Cache Service", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Time-Series Backtesting & WAPE Accuracy Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Forecasting Architecture Guide & Rolling Backtest Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Deep learning neural forecasting architecture (N-BEATS or PatchTST) implemented in PyTorch Forecasting",
      "Hierarchical time-series reconciliation using MinT (Minimum Trace) algorithm across store and category trees",
      "Automated automated changepoint and anomaly detection alerting when recent trend slopes deviate significantly"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Rolling Feature Pipeline & Prophet Modeling in Python and Prophet",
      "hours": 7,
      "done_criterion": "Feature pipeline computes lag windows; Prophet models trend, seasonality, and holidays."
    },
    {
      "name": "XGBoost Gradient Boosting & Ensemble Weighting in XGBoost and ML Engineering",
      "hours": 7,
      "done_criterion": "XGBoost trains on residuals; weighted ensemble achieves out-of-sample WAPE <= 14.5%."
    },
    {
      "name": "FastAPI Forecast Inference & Redis Caching in FastAPI, Redis and Docker",
      "hours": 7,
      "done_criterion": "FastAPI serves 14-day forecasts; Redis caches predictions with p95 latency < 35ms."
    },
    {
      "name": "Rolling Backtest Benchmark, Shock Anti-Fake Test & Docs in Time-Series Forecasting",
      "hours": 7,
      "done_criterion": "Backtest confirms WAPE <= 14.5%; anti-fake test widens bounds on shock; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python data science libraries (Pandas, NumPy, Scikit-learn) and machine learning workflows",
    "Understanding of time-series analysis concepts (seasonality, stationarity, autocorrelation) and ensemble methods (Prophet, XGBoost)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (Prophet and XGBoost CPU training runs efficiently on local CPU)",
    "cost": "$0 (fully open-source stack using local Python and Docker Redis)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or commercial API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Redis container) and Python 3.11 with Prophet and XGBoost installed",
    "fallback_path": "In-memory Python dictionary cache if Docker Redis container is unavailable"
  },
  "riskiest_component": {
    "name": "Data Leakage Across Time Splits and Overfitting on Non-Stationary Trends",
    "mitigation": "Enforce strict temporal rolling-origin cross-validation and apply first-order differencing on non-stationary series.",
    "fallback": "Constrain XGBoost max_depth to 4 and apply L2 regularization on leaf weights."
  },
  "deliverables": [
    "Git repository containing feature engineering pipeline, Prophet/XGBoost ensemble code, and FastAPI server",
    "Docker Compose file launching local Redis instance with persistent caching configuration",
    "Automated backtesting benchmark script evaluating WAPE, SMAPE, and prediction intervals",
    "Screener verification script executing automated 14-day forecast and dynamic shock adaptation test in under 2 minutes"
  ],
  "out_of_scope": [
    "Multi-billion parameter foundation time-series transformer models",
    "High-frequency microsecond algorithmic trading market making",
    "Proprietary cloud automated ML forecasting suites (AWS Forecast)"
  ],
  "safety_note": None,
  "resources": [
    "Forecasting: Principles and Practice (Hyndman and Athanasopoulos - 3rd Edition)",
    "Forecasting at Scale (Taylor and Letham - Facebook Prophet Paper)",
    "XGBoost: A Scalable Tree Boosting System (Chen and Guestrin)"
  ],
  "rubric": [
    {
      "input": "1,000 time-series evaluated across a 14-day rolling test horizon",
      "action": "python ./evaluation/eval_wape.py --series 1000 --horizon 14",
      "expected_result": "Ensemble model achieves out-of-sample WAPE <= 14.5% across test series",
      "evidence_location": "Terminal output log and reports/wape_evaluation.json",
      "pass_criterion": "WAPE <= 14.5% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "2,000 forecast requests issued to FastAPI service across 50 concurrent connections",
      "action": "python ./benchmarks/bench_inference.py --requests 2000 --concurrency 50",
      "expected_result": "FastAPI returns 30-day forecast predictions with p95 latency < 35.0ms",
      "evidence_location": "Inference benchmark report in reports/inference_perf.json",
      "pass_criterion": "p95 latency < 35.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "10,000 test observations evaluated against predicted 90% confidence intervals",
      "action": "python ./evaluation/eval_intervals.py --points 10000 --level 90",
      "expected_result": "Empirical interval coverage is between 87.0% and 93.0%",
      "evidence_location": "Interval calibration audit log in reports/calibration_audit.json",
      "pass_criterion": "Coverage between 87.0% and 93.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "FastAPI request asking for 14-day demand forecast for series 'sku_retail_101'",
      "action": "curl -X POST http://localhost:8000/api/v1/forecast -H 'Content-Type: application/json' -d '{\"series_id\":\"sku_retail_101\",\"horizon\":14}'",
      "expected_result": "API responds with 14 daily point predictions, 80% bounds, and 95% bounds",
      "evidence_location": "HTTP response JSON and forecast payload",
      "pass_criterion": "Response status 200 with 14 daily forecast points and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated sudden demand shock of +300% injected into historical series",
      "action": "python ./scripts/verify_shock_adaptation.py --shock-pct 300",
      "expected_result": "Ensemble detects elevated variance and widens 95% confidence interval width by at least 40%",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms interval width widened by >= 40% with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected time-series forecasting platform in Python with Prophet and XGBoost ensembles; achieved [MODEL_WAPE] WAPE on multi-horizon demand forecasting across [SERIES_COUNT] time series, and delivered sub-[FORECAST_LATENCY] millisecond inference latency with Redis caching.",
    "claims": [
      {
        "text": "achieved [MODEL_WAPE] WAPE on multi-horizon demand forecasting across [SERIES_COUNT] time series",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[FORECAST_LATENCY] millisecond inference latency with Redis caching",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "commercial automated cloud forecasting SaaS or microsecond high-frequency trading models"
  },
  "verify": [
    "Run `pytest tests/` to confirm feature engineering pipelines, Prophet/XGBoost ensembles, and FastAPI pass.",
    "Execute `python ./evaluation/eval_wape.py` to verify out-of-sample WAPE meets <= 14.5% benchmark.",
    "Run `python ./scripts/verify_shock_adaptation.py` to assert uncertainty intervals widen appropriately upon shock."
  ],
  "worksheet": {
    "q1": "Core deliverable: a production time-series forecasting platform in Python with Prophet, XGBoost ensembles, FastAPI, and Redis.",
    "q2": "Target users: time-series machine learning engineers, quantitative data scientists, and applied ML developers.",
    "q3": "3 use cases: retail demand forecasting, cloud compute capacity prediction, and corporate cash flow forecasting.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: rolling lag feature engineering without leakage, Prophet/XGBoost ensemble weighting, rolling-origin backtesting, and sub-25ms inference.",
    "q6": "Starter input: feature pipeline code, Prophet/XGBoost models, FastAPI service, and 1,000 synthetic daily series. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker Redis and open-source packages.",
    "q8": "Riskiest component: data leakage across temporal splits. Fallback: strict rolling-origin cross-validation and first-order differencing.",
    "q9": "Potential faking: returning simple moving average pretending to be ensemble. Anti-fake check 5 injects +300% shock and verifies interval width widens by >= 40%.",
    "q10": "Safe; synthetic demand numbers and simulated CPU utilization metrics only, zero personal data."
  }
}

b73_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, ensemble weighting math, and backtest evaluation metrics | High |
| Tech Stack | Python, Prophet, N-BEATS, XGBoost, FastAPI, Redis | Listed competing neural frameworks (N-BEATS) without concrete ensemble pipeline integration | Medium |
| Rubric | Missing quantitative targets | Lacked concrete WAPE error bounds, inference latency thresholds, and uncertainty interval tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b73_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python and Docker Redis at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Forecast WAPE (<= 14.5%), inference latency (< 35ms), and interval coverage (87% - 93%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory Python dictionary cache if Docker Redis container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic daily time-series generator and automated backtesting scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: foundation transformer LLMs, microsecond HFT models, and commercial cloud AutoML suites.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 injects a +300% shock and verifies model widens uncertainty confidence interval width by at least 40%.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b73_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved PyTorch N-BEATS and MinT hierarchical reconciliation to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic forecasting metrics (WAPE accuracy, inference latency, and prediction interval calibration).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake demand shock uncertainty widening test.
"""

# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_7_part2():
    std_scores = {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}
    std_caps = {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}
    res69 = process_brief(b69_data, b69_old_diag, std_scores, std_caps, b69_reviewer, b69_changelog)
    res70 = process_brief(b70_data, b70_old_diag, std_scores, std_caps, b70_reviewer, b70_changelog)
    res71 = process_brief(b71_data, b71_old_diag, std_scores, std_caps, b71_reviewer, b71_changelog)
    res72 = process_brief(b72_data, b72_old_diag, std_scores, std_caps, b72_reviewer, b72_changelog)
    res73 = process_brief(b73_data, b73_old_diag, std_scores, std_caps, b73_reviewer, b73_changelog)
    return [res69, res70, res71, res72, res73]

if __name__ == "__main__":
    results = run_batch_7_part2()
    print("Batch 7 Part 2 finished successfully:", results)
