import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_batch_1 import process_brief

# ==============================================================================
# 14. brief-database-engine
# ==============================================================================
b14_data = {
  "id": "brief-database-engine",
  "title": "Embedded Relational Database Engine with Slotted-Page B-Tree & WAL",
  "domain": "Computer Science Fundamentals",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "CLI/tools/libraries"],
  "problem": "Software engineers interact with relational databases daily through high-level SQL queries, yet the underlying execution mechanisms—slotted page on-disk record serialization, buffer pool frame eviction, B-tree balance maintenance through page splits, and Write-Ahead Logging (WAL) for crash recovery—remain opaque black boxes. Building an embedded storage engine from first principles demystifies how relational data survives unexpected system crashes without page corruption. This project implements a self-contained embedded database engine in C++ featuring a slotted-page disk manager, an LRU-K buffer pool, a B-tree clustered index, a Volcano-style iterator query executor, and ARIES-style write-ahead logging.",
  "use_cases": [
    "Embedded edge persistence for Internet of Things gateways and autonomous devices",
    "High-reliability local transaction logs for financial point-of-sale terminals",
    "Specialized telemetry storage engines requiring deterministic crash recovery"
  ],
  "hard_parts": [
    "Managing slotted-page layout with variable-length tuple offsets and in-place fragment compaction",
    "Implementing thread-safe B-tree node splits, merges, and root page re-allocations during concurrency",
    "Synchronizing buffer pool dirty frame flushing with Write-Ahead Log sequence numbers (WAL protocol)",
    "Executing ARIES crash recovery phases (Analysis, Redo, and Undo) to restore ACID consistency"
  ],
  "screener_signals": [
    "Modular C++ implementation cleanly separating storage, buffer pool, indexing, parser, and recovery",
    "Automated crash-kill test verifying zero committed transaction loss across 10 unexpected SIGKILL terminations",
    "Anti-fake verification script inserting dynamic nonces, terminating process mid-write, and asserting recovery"
  ],
  "job_families": [
    "Database Internals Engineer",
    "Systems Software Engineer",
    "Infrastructure Storage Engineer"
  ],
  "stack": [
    {"tool": "C++", "role": "systems programming language for disk manager, buffer pool, B-tree index, and WAL"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Slotted Page Disk Manager",
        "tools_used": ["C++"],
        "purpose": "Manages 4KB database page allocation on disk, tuple offset arrays, and free space compaction"
      },
      {
        "name": "LRU-K Buffer Pool Manager",
        "tools_used": ["C++"],
        "purpose": "Pins frequently accessed pages in memory and evicts unpinned frames using backward k-distance"
      },
      {
        "name": "B-Tree Index Manager",
        "tools_used": ["C++"],
        "purpose": "Provides logarithmic search, leaf insertion, and node splitting for indexed primary keys"
      },
      {
        "name": "Volcano Query Executor",
        "tools_used": ["C++"],
        "purpose": "Executes SELECT, INSERT, and WHERE filter query plans using open-next-close iterator models"
      },
      {
        "name": "Write-Ahead Log & Recovery Manager",
        "tools_used": ["C++"],
        "purpose": "Appends transaction log records before writing dirty pages and performs crash recovery"
      }
    ],
    "data_flow": "SQL queries enter the Volcano Query Executor; the executor requests index scans from the B-Tree Index Manager; the B-Tree manager requests page IDs from the LRU-K Buffer Pool; the buffer pool fetches unpinned 4KB frames from the Slotted Page Disk Manager; updates append transaction records to the Write-Ahead Log before dirty pages are flushed to disk; on unexpected crash, the Recovery Manager reads WAL records sequentially to reconstruct uncommitted transactions and restore consistency.",
    "enforcement_mechanism": "Page latch pins preventing buffer eviction during active access; WAL sequence numbers strictly enforced prior to flushing dirty memory frames."
  },
  "targets": [
    {
      "metric": "Single-Key Point Lookup Latency",
      "method": "Direct B-tree point lookup timing across 100,000 indexed records stored in 4KB slotted pages",
      "input": "100,000 indexed integer keys stored on disk with a warm 256-frame buffer pool",
      "environment": "Standard 4-core local CPU, C++ 17 compiled with -O3, SSD storage",
      "minimum_pass": "Average point lookup latency is < 150 microseconds",
      "target": "Average point lookup latency is < 50 microseconds",
      "report": "Storage engine microbenchmark summary log detailing p50, p95, and p99 lookup latencies"
    },
    {
      "metric": "Sequential Table Scan Throughput",
      "method": "Full table scan execution timing across 50,000 multi-column records using Volcano iterator",
      "input": "50,000 records totaling 20MB of slotted page data evaluated with predicate filtering",
      "environment": "Standard 4-core local CPU, C++ 17 compiled with -O3, SSD storage",
      "minimum_pass": "Scan throughput exceeds 25,000 records/sec",
      "target": "Scan throughput exceeds 60,000 records/sec",
      "report": "Volcano iterator scan benchmark report reporting records scanned per second"
    },
    {
      "metric": "Crash Recovery Transaction Integrity Rate",
      "method": "Automated kill -9 crash injection during active transaction batch followed by recovery verification",
      "input": "5,000 concurrent transactions with 20 injected mid-commit process terminations",
      "environment": "Standard 4-core local CPU, Linux filesystem with POSIX fsync",
      "minimum_pass": "Recovery reconstructs 20 of 20 committed batches with 0 corrupted slotted pages",
      "target": "Recovery reconstructs 20 of 20 committed batches with 0 corrupted slotted pages",
      "report": "ARIES recovery validation log verifying analysis, redo, and undo log state"
    }
  ],
  "skills": ["C++", "Systems Programming", "B-Tree", "Buffer Pool", "SQL Parsing", "WAL", "Concurrency"],
  "starter_input": {
    "spec": "Slotted page binary layout specification (4096-byte pages, header, slot directory, cell storage) and benchmark schema.",
    "size": "Synthetic dataset generator producing 100,000 structured relational rows with integer keys and string attributes",
    "seeded_cases": "Corrupted log record headers, uncommitted in-flight transactions, and page boundary boundary overflow rows",
    "label_source": "Deterministic CSV fixture containing primary keys and expected point query lookup payloads",
    "personal_data_policy": "Strictly mock synthetic relational schemas; no real user credentials or personal data used"
  },
  "components": [
    {"name": "Slotted Page & Disk Storage Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Buffer Pool Manager with LRU-K Eviction", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "B-Tree Node Index Manager with Node Splits", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "SQL Parser & Volcano Execution Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Write-Ahead Logging & ARIES Crash Recovery", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Performance Benchmark & Chaos Crash Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Architecture Documentation & Slotted Page Layout Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Two-phase locking concurrency control with dynamic wait-for deadlock detection graphs",
      "Cost-based query optimizer selecting index scan versus sequential scan based on table statistics"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Slotted-Page Disk Storage & LRU-K Buffer Pool in C++ Systems Programming",
      "hours": 10,
      "done_criterion": "Disk manager allocates 4KB pages; buffer pool pins frames and evicts pages via LRU-K algorithm."
    },
    {
      "name": "B-Tree Index Traversal, Insert & Leaf Splitting with Concurrency",
      "hours": 10,
      "done_criterion": "B-tree manages internal and leaf nodes, handles page splits, and performs point lookups in O(log N)."
    },
    {
      "name": "SQL Parsing, Lexer & Volcano Query Execution Engine",
      "hours": 11,
      "done_criterion": "Parser converts SQL strings into query trees; Volcano iterator executes scans and predicate filters."
    },
    {
      "name": "Write-Ahead Logging, Crash Recovery Verification & Docs",
      "hours": 10,
      "done_criterion": "WAL protocol appends log records; recovery recovers 20 of 20 crash scenarios; docs and benchmarks pass."
    }
  ],
  "prerequisites": [
    "Proficiency in modern C++ (pointers, memory management, RAII, std::unique_ptr)",
    "Understanding of operating system paging, POSIX file I/O (open, lseek, fsync), and binary byte buffers"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound storage operations)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with GCC 11+ or Clang 13+ installed",
    "fallback_path": "Standard POSIX file operations with in-memory page simulation if direct disk fsync encounters permission limits"
  },
  "riskiest_component": {
    "name": "Page Corruption During Incomplete B-Tree Node Splits",
    "fallback": "Implement shadow-page copy-on-write during leaf split before atomically publishing parent pointer"
  },
  "deliverables": [
    "Git repository containing C++ database engine source code, unit tests, and Makefile/CMake build system",
    "Interactive CLI database shell supporting CREATE TABLE, INSERT, and SELECT queries",
    "Automated crash recovery test harness executing process termination during active transactions",
    "Screener verification script executing automated benchmark and recovery validation in under 2 minutes"
  ],
  "out_of_scope": [
    "Distributed consensus replication or multi-node clustering",
    "Complex nested SQL joins and window function analytical expressions",
    "Network wire protocol compatibility with PostgreSQL or MySQL drivers"
  ],
  "safety_note": None,
  "resources": [
    "Architecture of a Database System (Hellerstein, Stonebraker, Hamilton paper)",
    "Database Internals: A Deep Dive into How Distributed Data Systems Work (Alex Petrov)",
    "CMU Database Group Database Systems Course Lecture Notes and Buffer Pool Specifications"
  ],
  "rubric": [
    {
      "input": "Database file populated with 100,000 records and primary key B-tree index",
      "action": "Run ./build/db_bench --benchmark point_lookup --keys 100000",
      "expected_result": "Engine executes 10,000 random key queries with average latency < 150 microseconds",
      "evidence_location": "Benchmark summary console output table",
      "pass_criterion": "Average point lookup latency is < 150 microseconds with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Table containing 50,000 multi-column records",
      "action": "Run ./build/db_bench --benchmark table_scan --table accounts",
      "expected_result": "Volcano query iterator scans records and evaluates predicates at > 25,000 records/sec",
      "evidence_location": "Scan throughput console output log",
      "pass_criterion": "Measured scan throughput exceeds 25,000 records/sec",
      "kind": "normal"
    },
    {
      "input": "Active transaction workload with 20 injected SIGKILL terminations during WAL write",
      "action": "Run ./scripts/test_crash_recovery.sh --crashes 20",
      "expected_result": "Recovery manager processes WAL, rolls forward committed transactions, and restores slotted page integrity",
      "evidence_location": "Recovery test summary log and consistency check report",
      "pass_criterion": "All 20 crash scenarios recover successfully with 0 corrupt pages and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Buffer pool configured to 64 frames with 500 distinct requested pages",
      "action": "Run ./build/test_buffer_pool --frames 64 --accesses 5000",
      "expected_result": "LRU-K eviction algorithm evicts unpinned frames without memory leaks or page pin corruption",
      "evidence_location": "Buffer pool test execution log",
      "pass_criterion": "Test passes with 0 memory errors reported by Valgrind/ASan",
      "kind": "normal"
    },
    {
      "input": "Dynamic verification token inserted into uncommitted transaction followed by abrupt abort",
      "action": "Run ./scripts/verify_dynamic_storage.sh --nonce 0xDEADBEEF --action abort",
      "expected_result": "Recovery manager rolls back transaction; dynamic nonce does not appear in subsequent table scans",
      "evidence_location": "Dynamic verification stdout output log",
      "pass_criterion": "Dynamic verification confirms zero uncommitted nonce leakage with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected embedded relational database engine in C++ featuring slotted-page disk layout and LRU-K buffer pool; implemented B-tree indexing with sub-[LOOKUP_LATENCY] point lookups across [RECORD_COUNT] records, and achieved [RECOVERY_RATE] crash recovery through Write-Ahead Logging.",
    "claims": [
      {
        "text": "implemented B-tree indexing with sub-[LOOKUP_LATENCY] point lookups across [RECORD_COUNT] records",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved [RECOVERY_RATE] crash recovery through Write-Ahead Logging",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "distributed multi-node consensus replication or full ANSI SQL-92 standard query coverage"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: an embedded C++ relational storage engine with slotted-page layout, LRU-K buffer pool, B-tree index, Volcano query engine, and WAL crash recovery.",
    "q2": "Target users: systems software engineers, edge runtime developers, and database infrastructure specialists.",
    "q3": "3 use cases: edge device persistence, point-of-sale transaction logs, and telemetry storage engines.",
    "q4": "Stated hours: 41 hours. Calculated bottom-up: 36 component hours * 1.15 buffer = 41.4 -> 41 hours. Advanced level.",
    "q5": "Hard parts: slotted page tuple compaction, thread-safe B-tree node splits, WAL dirty frame flushing synchronization, and ARIES recovery phases.",
    "q6": "Starter input: 100,000 structured relational rows with integer keys. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: POSIX file I/O with in-memory page simulation.",
    "q8": "Riskiest component: Page corruption during incomplete B-tree leaf splits. Fallback: shadow-page copy-on-write during split.",
    "q9": "Potential faking: mock query returns without disk access. Anti-fake check 5 inserts dynamic uncommitted nonce, aborts, and asserts zero leakage.",
    "q10": "Safety/ethics: Safe; synthetic relational test records only."
  }
}

b14_old_diag = """
- **Old Title**: Mini Relational Database Engine with B-Tree Storage
- **Domain**: Computer Science Fundamentals
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 40 hours
- **True Effort Estimate of Old Scope**: ~26-30 hours of core implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.0 / 10 (unverifiable marketing claims regarding commercial database company readiness)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.40 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an embedded storage engine using HTTP web-service throughput targets and k6 benchmark tools.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."
"""

b14_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 41 hours (ADVANCED); runs locally on 8GB RAM CPU using C++ at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Point lookup latency (< 150us) and table scan throughput (> 25k records/s) measured directly on local CPU/SSD.",
    "Is there a CPU/local/free fallback?": "YES. In-memory page simulation with standard POSIX file I/O.",
    "Can test data be created in minutes?": "YES. Synthetic 100,000 record relational table generator included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full benchmark suite and dynamic crash test in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. B-tree point lookup latency, Volcano iterator scan throughput, and ARIES crash recovery integrity are unique to storage engines.",
    "Is every bullet claim verified by rubric?": "YES. Point lookup latency verified by Check 1; crash recovery verified by Check 2 & 4.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic uncommitted nonce, executes abrupt abort, and asserts zero leakage.",
    "Are all terms accurate?": "YES. Accurately covers slotted pages, LRU-K buffer pools, B-tree node splits, and ARIES recovery.",
    "Does problem statement promise only what is verified?": "YES. Disk manager, buffer pool, B-tree index, Volcano query engine, and WAL recovery are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic relational schemas; no personal data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering slotted-page compaction, concurrent B-tree node splits, WAL dirty frame flushing synchronization, and ARIES recovery."
}

b14_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (36 component hours * 1.15 buffer = 41 hours). Moved 2PL concurrency and cost-based optimizer to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic database internals metrics (point lookup latency, sequential scan throughput, and crash recovery rate).
- Removed Banned Content: Removed unsubstantiated claims regarding commercial database company readiness.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic abort test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [LOOKUP_LATENCY], [RECORD_COUNT], and [RECOVERY_RATE] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 15. brief-devsecops-pipeline
# ==============================================================================
b15_data = {
  "id": "brief-devsecops-pipeline",
  "title": "DevSecOps CI/CD Pipeline with SAST, SCA & Container Admission Gates",
  "domain": "Security & Platform",
  "difficulty": "INTERMEDIATE",
  "project_types": ["CLI/tools/libraries", "Systems/low-level/networking"],
  "problem": "Software vulnerabilities introduced during feature development become exponentially costlier to remediate once deployed into production environments. Modern software engineering requires automated security gates embedded directly into CI/CD pipelines to intercept security flaws before code merge. This project constructs an automated DevSecOps pipeline using GitHub Actions, Semgrep, Trivy, and Cosign. The system enforces strict static application security testing (SAST), software composition analysis (SCA) for known CVEs, secrets leakage detection, container image vulnerability scanning, and cryptographic artifact signing with automated build failure policies.",
  "use_cases": [
    "Enterprise CI/CD quality gates enforcing SOC2 and PCI-DSS application security standards",
    "Automated dependency audit workflows blocking vulnerable open-source packages in pull requests",
    "Supply chain security pipelines cryptographically signing container images prior to production deployment"
  ],
  "hard_parts": [
    "Tuning SAST rules to eliminate developer false positives while maintaining high recall on critical flaws",
    "Managing software composition analysis vulnerability thresholds across transitive dependency trees",
    "Implementing cryptographic container signing with Cosign keyless infrastructure and admission verification",
    "Designing fail-fast pipeline gating logic that delivers actionable remediation reports without stalling build velocity"
  ],
  "screener_signals": [
    "Modular GitHub Actions workflow configurations cleanly separating SAST, SCA, container scanning, and signing",
    "Automated vulnerability test suite with intentional defect fixtures confirming pipeline blocking enforcement",
    "Anti-fake verification script injecting dynamic secret tokens and high-severity CVEs into test PRs to assert blocking"
  ],
  "job_families": [
    "DevSecOps Engineer",
    "Security Software Engineer",
    "Platform Infrastructure Engineer"
  ],
  "stack": [
    {"tool": "GitHub Actions", "role": "CI/CD orchestration platform executing multi-stage security quality gates"},
    {"tool": "Semgrep", "role": "static application security testing engine analyzing source code for vulnerabilities"},
    {"tool": "Trivy", "role": "security scanner auditing dependencies, SBOMs, and container filesystem vulnerabilities"},
    {"tool": "Docker", "role": "containerization engine building application images for scanning and admission"},
    {"tool": "Cosign", "role": "cryptographic tool signing container images and verifying signatures prior to admission"}
  ],
  "architecture": {
    "components": [
      {
        "name": "SAST DevSecOps Static Code Scanner",
        "tools_used": ["Semgrep", "GitHub Actions"],
        "purpose": "Scans application source code for injection vulnerabilities, insecure cryptosystems, and leaked tokens"
      },
      {
        "name": "SCA Dependency & Secrets Auditor",
        "tools_used": ["Trivy", "GitHub Actions"],
        "purpose": "Audits third-party dependency manifests against known CVE databases and generates CycloneDX SBOMs"
      },
      {
        "name": "Container Vulnerability Scanner",
        "tools_used": ["Trivy", "Docker", "GitHub Actions"],
        "purpose": "Inspects container base images and filesystem packages for high and critical CVE vulnerabilities"
      },
      {
        "name": "Cryptographic Image Signer & Policy Gate",
        "tools_used": ["Cosign", "GitHub Actions"],
        "purpose": "Signs clean container digests cryptographically and rejects unsigned or vulnerable container artifacts"
      }
    ],
    "data_flow": "Pull requests trigger GitHub Actions; Semgrep parses source files for code vulnerabilities and secret keys; Trivy analyzes project lockfiles for known dependency CVEs and generates an SBOM; Docker builds the container image; Trivy executes a deep filesystem scan on the container; if critical CVEs or secrets are detected, the pipeline terminates with exit code 1; if clean, Cosign cryptographically signs the image digest and generates an attestation log.",
    "enforcement_mechanism": "GitHub Actions status checks blocking branch merges; Cosign signature verification rejecting unsigned container admission."
  },
  "targets": [
    {
      "metric": "Injected Critical Security Flaw Interception Rate",
      "method": "Pipeline execution against security benchmark repo containing 15 intentionally planted vulnerabilities",
      "input": "Test repository containing 15 planted security flaws (5 SQLi/XSS, 5 CVE dependencies, 5 leaked secrets)",
      "environment": "GitHub Actions runner or local Act runner, 2-core CPU, Ubuntu 22.04",
      "minimum_pass": "Detection and blocking of 15 of 15 planted vulnerabilities with 0 pipeline escapes",
      "target": "Detection and blocking of 15 of 15 planted vulnerabilities with 0 pipeline escapes",
      "report": "DevSecOps security gate summary log detailing detected flaw IDs and blocking exit status"
    },
    {
      "metric": "Pipeline End-to-End Execution Latency",
      "method": "Full execution duration of all security stages (SAST, SCA, container scan, and signing) on standard codebase",
      "input": "Sample 10,000 LOC microservice repository with 25 third-party dependencies and Dockerfile",
      "environment": "Standard 2-core virtual CPU, 4GB RAM, Linux container runner",
      "minimum_pass": "Execution across security stages finishes in < 240 seconds",
      "target": "Execution across security stages finishes in < 120 seconds",
      "report": "CI/CD execution step timing summary output"
    },
    {
      "metric": "Clean Codebase False Positive Blocking Rate",
      "method": "Pipeline execution across verified clean production repository baseline",
      "input": "Verified clean repository of 10,000 LOC without security flaws or high-severity CVEs",
      "environment": "Standard 2-core virtual CPU, 4GB RAM, Linux container runner",
      "minimum_pass": "0 false positive blocking alerts; pipeline terminates with exit code 0",
      "target": "0 false positive blocking alerts; pipeline terminates with exit code 0",
      "report": "Pipeline run log confirming green build status on clean code"
    }
  ],
  "skills": ["DevSecOps", "GitHub Actions", "Semgrep", "Trivy", "Docker", "Cosign", "Security Engineering"],
  "starter_input": {
    "spec": "Sample Python/Node.js web microservice with vulnerable package manifests, insecure SQL patterns, and Dockerfile.",
    "size": "Source codebase of 10,000 LOC across 45 files with 25 package dependencies",
    "seeded_cases": "Hardcoded AWS secret keys, SQL string concatenation, unpinned base images, and dependencies with known critical CVEs",
    "label_source": "Curated security test fixture manifest mapping planted vulnerability lines to expected scanner rule IDs",
    "personal_data_policy": "Strictly mock synthetic API tokens and fake credentials; zero real private keys used"
  },
  "components": [
    {"name": "SAST & Secret Detection Engine", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "SCA Dependency Vulnerability Scanner", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "Trivy Container Image Scanner & SBOM Generator", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "Cosign Cryptographic Image Signing & Policy Gate", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "Vulnerability Injection Harness & Pipeline Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Threat Model Diagram & CI/CD Documentation", "task_type": "docs + architecture diagram", "hours": 4.0}
  ],
  "extended_path": {
    "items": [
      "Kyverno Kubernetes admission controller enforcing Cosign signature verification on cluster pods",
      "Automated GitHub pull request vulnerability commenting bot with remediation guidance"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "SAST Static Code Analysis & Secret Scanning Gate with Semgrep",
      "hours": 7,
      "done_criterion": "Semgrep scans source files, detects code injection and secrets, and emits SARIF reports."
    },
    {
      "name": "SCA Dependency Auditing & SBOM Generation",
      "hours": 7,
      "done_criterion": "Trivy scans dependency manifests, flags CVEs above CVSS 7.0, and outputs CycloneDX SBOM."
    },
    {
      "name": "Container Vulnerability Scanning with Trivy & Cosign Signature Verification",
      "hours": 7,
      "done_criterion": "Docker builds container image; Trivy scans image; Cosign signs image digest if vulnerability-free."
    },
    {
      "name": "Insecure Build Blocking Verification, Security Engineering Harness & Docs",
      "hours": 7,
      "done_criterion": "Harness verifies 15 of 15 flaws intercepted; anti-fake test validates dynamic secret rejection; docs complete."
    }
  ],
  "prerequisites": [
    "Familiarity with Git branching, pull request workflows, and CI/CD concepts",
    "Basic knowledge of Docker containerization, shell scripting, and application security principles (OWASP Top 10)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound scanner execution)",
    "cost": "$0 (fully open-source software stack on free GitHub public repositories or local runners)",
    "accounts_keys_quotas": "Free GitHub account for Actions, or local Act runner without cloud dependencies",
    "reference_environment": "Ubuntu 22.04 with Docker 24+, Semgrep CLI, and Trivy CLI installed",
    "fallback_path": "Local command-line script running Semgrep and Trivy directly without GitHub Actions"
  },
  "riskiest_component": {
    "name": "Pipeline Flakiness from Upstream CVE Database Rate Limiting",
    "fallback": "Cache Trivy vulnerability database locally in runner cache to decouple scanning from network rate limits"
  },
  "deliverables": [
    "Git repository containing GitHub Actions workflow definitions (.github/workflows/sec-pipeline.yml)",
    "Custom Semgrep rule configuration YAML files targeting insecure application patterns",
    "Automated vulnerability test harness verifying pipeline failure on dirty code branches",
    "Screener verification script executing security scanners and dynamic defect check in under 2 minutes"
  ],
  "out_of_scope": [
    "Dynamic Application Security Testing (DAST) with active network fuzzing",
    "Full-scale runtime cloud security posture management (CSPM)",
    "Manual penetration testing reporting and remediation consulting"
  ],
  "safety_note": "This project executes automated security vulnerability scanners and static analysis tools on local test repositories. It does not perform active network penetration, unauthorized port scanning, or malicious exploitation against external computing systems.",
  "resources": [
    "Semgrep Rule Writing Tutorial and Official Security Registry",
    "Trivy Vulnerability Scanner and SBOM Generation Documentation",
    "Sigstore Cosign Container Signing and Verification Architecture Guide"
  ],
  "rubric": [
    {
      "input": "Dirty branch containing 5 planted SQL injection and hardcoded secret flaws",
      "action": "Run semgrep scan --config .semgrep/rules.yml --error",
      "expected_result": "Semgrep intercepts all 5 flaws and terminates with exit code 1",
      "evidence_location": "Terminal stdout output and reports/sast_report.sarif",
      "pass_criterion": "Exit code 1 with exactly 5 vulnerability violations reported",
      "kind": "normal"
    },
    {
      "input": "Dependency manifest package.json containing outdated library with known CVE-2023-XXXX",
      "action": "Run trivy fs --severity HIGH,CRITICAL --exit-code 1 .",
      "expected_result": "Trivy flags high-severity dependency CVEs and terminates with exit code 1",
      "evidence_location": "Terminal output log and trivy_sca.json",
      "pass_criterion": "Exit code 1 with identified CVE IDs matching planted test fixtures",
      "kind": "normal"
    },
    {
      "input": "Docker image built from clean verified application codebase",
      "action": "Run cosign sign-blob --yes /tmp/image_digest.txt",
      "expected_result": "Cosign creates cryptographic signature and attestation log for clean artifact",
      "evidence_location": "Generated signature file /tmp/image.sig",
      "pass_criterion": "Cosign verification command returns exit code 0",
      "kind": "normal"
    },
    {
      "input": "Full pipeline execution on standard 10,000 LOC microservice repository",
      "action": "Run bash scripts/benchmark_pipeline_speed.sh",
      "expected_result": "All security stages (SAST, SCA, container scan) finish in < 240 seconds",
      "evidence_location": "Benchmark timing report log",
      "pass_criterion": "Total pipeline execution latency is < 240 seconds",
      "kind": "normal"
    },
    {
      "input": "Dynamic high-entropy secret token injected into source file by screener script at runtime",
      "action": "Run python scripts/verify_dynamic_secrets.sh --secret MOCK_AWS_ACCESS_KEY_ID",
      "expected_result": "Security gate detects injected AWS credential pattern, logs rule breach, and halts build",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Exit code 1 with secret scanner pinpointing injected credential string",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected DevSecOps CI/CD security pipeline in GitHub Actions with Semgrep, Trivy, and Cosign; intercepted [VULN_COUNT] of [TOTAL_VULNS] planted security vulnerabilities across SAST and SCA stages, and achieved sub-[PIPELINE_LATENCY] scan execution latency with cryptographic container signing.",
    "claims": [
      {
        "text": "intercepted [VULN_COUNT] of [TOTAL_VULNS] planted security vulnerabilities across SAST and SCA stages",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "achieved sub-[PIPELINE_LATENCY] scan execution latency with cryptographic container signing",
        "rubric_indexes": [2, 3]
      }
    ],
    "do_not_claim": "enterprise runtime intrusion detection or zero-day kernel exploit immunity"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: an automated DevSecOps CI/CD pipeline with Semgrep SAST, Trivy SCA and container scanning, Cosign signing, and blocking gates.",
    "q2": "Target users: DevSecOps engineers, security platform architects, and CI/CD infrastructure teams.",
    "q3": "3 use cases: enterprise SOC2 compliance gates, automated dependency CVE audits, and container supply chain signing.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: SAST rule false-positive tuning, SCA transitive dependency management, Cosign keyless container signing, and fail-fast pipeline gating.",
    "q6": "Starter input: 10,000 LOC microservice with planted vulnerabilities. Mock synthetic credentials only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, free GitHub public repo. Fallback: local CLI scanning without GitHub Actions.",
    "q8": "Riskiest component: Upstream CVE database rate limiting. Fallback: local runner caching of vulnerability databases.",
    "q9": "Potential faking: hardcoded green build logs. Anti-fake check 5 injects dynamic secret at runtime and asserts blocking gate failure.",
    "q10": "Safety/ethics: Safe; automated local vulnerability scanners only, no unauthorized external network penetration."
  }
}

b15_old_diag = """
- **Old Title**: DevSecOps CI/CD Pipeline with SAST & SCA Security Gates
- **Domain**: Security & Platform
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic workflow setup; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Snyk, Veracode, and Checkmarx are billion-dollar security companies', 'India regulatory requirements mandate this')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CI/CD security pipeline using HTTP web-service throughput targets.
2. **Commercial employer marketing**:
   > "Snyk, Veracode, and Checkmarx are billion-dollar security companies built around this problem. India's financial sector regulatory requirements mandate security testing."
"""

b15_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally or on free GitHub Actions runners at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Vulnerability interception rate (15 of 15 flaws) and pipeline latency (< 240s) measured directly on local/runner CPU.",
    "Is there a CPU/local/free fallback?": "YES. Local command-line execution using Semgrep and Trivy directly without GitHub Actions.",
    "Can test data be created in minutes?": "YES. Vulnerable microservice test fixture repository included with planted flaws.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full scanner suite and dynamic secret check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. SAST flaw interception, SCA CVE detection, and Cosign container signing are unique to security pipelines.",
    "Is every bullet claim verified by rubric?": "YES. Vulnerability count verified by Checks 0 & 1; scan latency and signing verified by Checks 2 & 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic secret token at runtime and asserts pipeline blocking.",
    "Are all terms accurate?": "YES. Accurately covers SAST, SCA, SBOM generation, container scanning, and Cosign signing.",
    "Does problem statement promise only what is verified?": "YES. Static analysis, dependency auditing, container scanning, and signature verification are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Safety note confirms local scanning only; mock credentials strictly enforced.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering rule tuning, transitive CVE thresholds, Cosign signing, and fail-fast pipeline gating."
}

b15_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Kubernetes admission controller and PR bot to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic security pipeline metrics (flaw detection rate, pipeline execution latency, and clean code false positive rate).
- Removed Banned Content: Removed marketing regarding billion-dollar security companies and regulatory mandates.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic secret check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [VULN_COUNT], [TOTAL_VULNS], and [PIPELINE_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 16. brief-dist-cache-rust
# ==============================================================================
b16_data = {
  "id": "brief-dist-cache-rust",
  "title": "Distributed In-Memory Key-Value Cache Engine in Rust with Consistent Hashing",
  "domain": "Systems Programming",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "Distributed systems"],
  "problem": "High-throughput distributed web applications exhaust relational database connection pools and disk I/O when handling read-heavy request spikes. Production caching systems mitigate this bottleneck, yet relying solely on prebuilt tools hides critical systems engineering concepts—lock-free concurrent memory management, cache replacement policies, thread contention mitigation, and network protocol framing. This project implements a high-throughput, distributed in-memory key-value cache engine from first principles in Rust. The system features a lock-free sharded storage map, segmented LRU and TinyLFU eviction, consistent hashing with virtual nodes for multi-node partitioning, an asynchronous Tokio TCP protocol parser, and request coalescing (singleflight) to prevent cache stampedes.",
  "use_cases": [
    "Sub-millisecond session and authentication token caching for horizontally scaled APIs",
    "Distributed database query result caching with automatic invalidation and stampede protection",
    "High-frequency algorithmic trading feature store caching low-latency market state"
  ],
  "hard_parts": [
    "Implementing lock-free sharded cache storage to eliminate mutex contention across high thread counts",
    "Designing adaptive eviction combining frequency sketch (TinyLFU) and recency queues without lock contention",
    "Distributing keys evenly across nodes using consistent hashing with virtual nodes and minimal key churn on node joins",
    "Coalescing concurrent identical cache misses through singleflight synchronizers to eliminate database dogpiling"
  ],
  "screener_signals": [
    "Idiomatic Rust implementation utilizing Tokio, parking_lot synchronization, and zero unsafe memory violations",
    "Deterministic load test achieving over 100,000 requests/sec with p99 latency under 2 milliseconds on local hardware",
    "Anti-fake verification script sending dynamic high-concurrency key bursts and asserting singleflight deduplication"
  ],
  "job_families": [
    "Systems Software Engineer",
    "Distributed Systems Engineer",
    "Infrastructure Platform Engineer"
  ],
  "stack": [
    {"tool": "Rust", "role": "systems programming language providing memory safety without garbage collection"},
    {"tool": "Tokio", "role": "asynchronous runtime powering non-blocking TCP network I/O and task scheduling"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Sharded Memory Cache Engine",
        "tools_used": ["Rust"],
        "purpose": "Provides concurrent in-memory key-value storage partitioned across 32 stripes to minimize lock contention"
      },
      {
        "name": "TinyLFU Eviction Manager",
        "tools_used": ["Rust"],
        "purpose": "Tracks key access frequencies with Count-Min sketches and evicts low-utility keys when memory limits trigger"
      },
      {
        "name": "Tokio Asynchronous TCP Server",
        "tools_used": ["Rust", "Tokio"],
        "purpose": "Handles concurrent client TCP connections, parsing binary protocol frames and dispatching commands"
      },
      {
        "name": "Consistent Hashing Ring Router",
        "tools_used": ["Rust"],
        "purpose": "Maps keys across cluster nodes using a 32-bit hash ring with 128 virtual nodes per physical instance"
      },
      {
        "name": "Singleflight Request Coalescer",
        "tools_used": ["Rust", "Tokio"],
        "purpose": "Suppresses redundant upstream fetch operations by merging concurrent misses for identical keys"
      }
    ],
    "data_flow": "Clients connect over TCP to the Tokio server; binary protocol frames are parsed into GET/SET commands; the Consistent Hashing Router determines target node ownership; the target node checks its Sharded Memory Cache; on hit, value bytes return immediately and TinyLFU frequency sketches update; on miss, the Singleflight Coalescer ensures only one upstream fetch executes while other concurrent requests await the shared result; returned data writes to memory and evicts candidates if memory limits are exceeded.",
    "enforcement_mechanism": "Strict memory quota bounds triggering TinyLFU eviction; read-write lock sharding preventing thread starvation."
  },
  "targets": [
    {
      "metric": "Sustained GET Throughput on Multi-Core CPU",
      "method": "Multi-threaded benchmark client issuing 250,000 pipelined GET operations across warm cache",
      "input": "250,000 read operations across 10,000 pre-loaded key-value pairs (1KB value size)",
      "environment": "Standard 4-core local CPU, Rust release build, localhost TCP loopback",
      "minimum_pass": "Sustained throughput exceeds 60,000 requests/sec",
      "target": "Sustained throughput exceeds 120,000 requests/sec",
      "report": "Cache benchmark client throughput summary log"
    },
    {
      "metric": "Tail Read Latency (p99)",
      "method": "High-frequency latency benchmarking recording per-request response time distribution",
      "input": "50,000 requests executed at 50,000 req/sec target load",
      "environment": "Standard 4-core local CPU, Rust release build, localhost TCP loopback",
      "minimum_pass": "p99 latency is < 3.5 milliseconds",
      "target": "p99 latency is < 1.5 milliseconds",
      "report": "HDRHistogram latency percentiles output file"
    },
    {
      "metric": "Consistent Hashing Virtual Node Distribution Skew",
      "method": "Key allocation distribution measurement across 3 cluster nodes with 128 virtual nodes each",
      "input": "100,000 random keys mapped to 3 cache nodes via hash ring",
      "environment": "Standard 4-core local CPU, Rust release build",
      "minimum_pass": "Coefficient of variation between node key allocations is < 15%",
      "target": "Coefficient of variation between node key allocations is < 8%",
      "report": "Cluster node key partition balance summary report"
    }
  ],
  "skills": ["Rust", "Tokio", "Distributed Systems", "Consistent Hashing", "Cache Eviction", "Systems Programming", "Concurrency"],
  "starter_input": {
    "spec": "Binary protocol specification (magic byte, opcode, key length, value length, body) and cluster topology configuration.",
    "size": "Workload dataset of 100,000 synthetic key-value pairs with Zipfian access distribution",
    "seeded_cases": "Simultaneous cache stampede spikes, corrupted protocol header frames, and out-of-memory key allocations",
    "label_source": "Deterministic benchmark client script generating synthetic keys with known frequency distributions",
    "personal_data_policy": "Strictly mock synthetic cache keys and payloads; no personal data used"
  },
  "components": [
    {"name": "Concurrent Sharded In-Memory Hash Table", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Adaptive W-TinyLFU and Segmented LRU Eviction Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Asynchronous Tokio TCP Server & Binary Protocol Parser", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Consistent Hashing Ring with Virtual Nodes", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Cache Stampede Mitigation via Singleflight", "task_type": "low-level/system subsystem", "hours": 4.0},
    {"name": "High-Concurrency Throughput & Latency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Memory Layout & Distributed Sharding Documentation", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "SWIM gossip protocol peer failure detection and automatic ring topology rebalancing",
      "Append-only log (AOF) disk persistence engine with background snapshot compaction"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Lock-Free Sharded Storage & Cache Eviction in Rust Systems Programming",
      "hours": 10,
      "done_criterion": "Sharded map stores key-values; TinyLFU Count-Min sketch tracks frequency and evicts on memory limits."
    },
    {
      "name": "Asynchronous Tokio TCP Protocol Server",
      "hours": 10,
      "done_criterion": "Tokio event loop handles 1,000 concurrent client connections, parsing and responding to binary frames."
    },
    {
      "name": "Distributed Systems Consistent Hashing Cluster Router & Virtual Node Rebalancing",
      "hours": 10,
      "done_criterion": "Hash ring routes keys across 3 nodes; adding a node relocates < 35% of total keys."
    },
    {
      "name": "Singleflight Request Coalescing, Chaos Benchmarking & Docs",
      "hours": 10,
      "done_criterion": "Singleflight coalesces 100 concurrent misses into 1 fetch; benchmark hits > 60k req/s; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Rust fundamentals (ownership, borrowing, lifetimes, traits, pattern matching)",
    "Understanding of concurrency primitives (Mutex, RwLock, channels, atomic operations) and network sockets"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and memory bound operations)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Rust 1.70+ and Cargo installed",
    "fallback_path": "Standard single-node in-process channel mode without distributed TCP networking"
  },
  "riskiest_component": {
    "name": "Memory Leaks or Deadlocks in Concurrent Eviction Ring",
    "fallback": "Enforce bounded lock acquisitions with try_write and fallback to opportunistic round-robin eviction"
  },
  "deliverables": [
    "Git repository containing Rust cache engine source code, unit tests, and Cargo manifest",
    "Standalone TCP server binary and lightweight client library with connection pooling",
    "Automated benchmark test harness measuring throughput, p99 latency, and singleflight deduplication",
    "Screener verification script executing automated benchmark and dynamic test in under 2 minutes"
  ],
  "out_of_scope": [
    "Multi-master distributed transactions and Raft consensus replication",
    "Complex nested data structures like Redis Streams or Geospatial indexes",
    "Cross-datacenter WAN replication and conflict resolution"
  ],
  "safety_note": None,
  "resources": [
    "TinyLFU: A Highly Efficient Cache Admission Policy (Einziger, Friedman, Manes paper)",
    "Consistent Hashing and Random Trees (Karger et al. paper)",
    "Tokio Asynchronous Networking and Protocol Framing Architecture Guide"
  ],
  "rubric": [
    {
      "input": "Cache populated with 10,000 keys queried by multi-threaded client",
      "action": "cargo run --release --bin cache_bench -- --clients 32 --requests 250000",
      "expected_result": "Server processes requests with sustained throughput exceeding 60,000 requests/sec",
      "evidence_location": "Terminal execution benchmark summary log",
      "pass_criterion": "Measured throughput is > 60,000 req/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50,000 continuous requests benchmark measuring latency distribution",
      "action": "cargo run --release --bin latency_profile",
      "expected_result": "Engine delivers p99 latency under 3.5 milliseconds on local loopback",
      "evidence_location": "Latency distribution console table and reports/latency.json",
      "pass_criterion": "p99 latency is < 3.5 milliseconds",
      "kind": "normal"
    },
    {
      "input": "100,000 keys distributed across 3 simulated cache nodes with 128 virtual nodes each",
      "action": "cargo test --release test_consistent_hashing_distribution",
      "expected_result": "Ring balances keys with coefficient of variation under 15%",
      "evidence_location": "Cargo test stdout report",
      "pass_criterion": "Test passes with coefficient of variation < 15%",
      "kind": "normal"
    },
    {
      "input": "Cache instance configured with 10MB memory limit subjected to 25MB of random writes",
      "action": "cargo test --release test_tinylfu_eviction_limits",
      "expected_result": "TinyLFU evicts low-frequency items; memory stays bounded under 10MB",
      "evidence_location": "Eviction test execution output log",
      "pass_criterion": "Memory consumption remains <= 10.5MB with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic cache miss storm of 100 concurrent requests for an identical uncached key",
      "action": "python scripts/verify_dynamic_singleflight.py --key DYNAMIC_KEY_BURST --concurrency 100",
      "expected_result": "Singleflight coalescer intercepts storm and executes exactly 1 upstream fetch call",
      "evidence_location": "Dynamic verification execution log",
      "pass_criterion": "Upstream fetch counter equals 1 with all 100 clients receiving identical payload",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed in-memory key-value cache engine in Rust and Tokio; achieved [THROUGHPUT] sustained GET throughput with sub-[P99_LATENCY] tail latency across [CLIENT_COUNT] concurrent connections, and eliminated cache stampedes via singleflight request coalescing.",
    "claims": [
      {
        "text": "achieved [THROUGHPUT] sustained GET throughput with sub-[P99_LATENCY] tail latency",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "eliminated cache stampedes via singleflight request coalescing",
        "rubric_indexes": [4]
      }
    ],
    "do_not_claim": "distributed multi-master Raft consensus replication or cross-datacenter WAN persistence"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a high-throughput distributed in-memory cache in Rust with Tokio TCP server, TinyLFU eviction, consistent hashing, and singleflight coalescing.",
    "q2": "Target users: systems software engineers, backend infrastructure engineers, and high-performance computing developers.",
    "q3": "3 use cases: sub-millisecond API session caching, database query result caching, and algorithmic trading feature store caching.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: lock-free sharded cache storage, adaptive TinyLFU eviction without lock contention, consistent hashing virtual node distribution, and singleflight stampede coalescing.",
    "q6": "Starter input: 100,000 synthetic key-value pairs with Zipfian distribution. No personal data.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: single-node in-process channel mode.",
    "q8": "Riskiest component: Memory leaks or deadlocks in concurrent eviction. Fallback: bounded try_write lock acquisition with round-robin eviction fallback.",
    "q9": "Potential faking: mock cache responses bypassing storage. Anti-fake check 5 sends 100 concurrent misses for a dynamic key and asserts exactly 1 upstream fetch.",
    "q10": "Safety/ethics: Safe; synthetic key-value pairs only."
  }
}

b16_old_diag = """
- **Old Title**: Distributed In-Memory Cache with Eviction & Sharding
- **Domain**: Systems Programming
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-28 hours of core implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.0 / 10 (unsubstantiated claims regarding commercial caching systems)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.40 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than memory-engine microbenchmarks.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."
"""

b16_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Rust and Tokio at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Throughput (> 60k req/s) and p99 latency (< 3.5ms) measured directly on local CPU loopback.",
    "Is there a CPU/local/free fallback?": "YES. In-process channel mode without distributed TCP networking.",
    "Can test data be created in minutes?": "YES. Synthetic 100,000 key-value generator with Zipfian distribution included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full benchmark suite and dynamic singleflight test in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Cache throughput, p99 tail latency, consistent hash balance, and singleflight deduplication are unique to caching systems.",
    "Is every bullet claim verified by rubric?": "YES. Throughput and p99 verified by Checks 0 & 1; singleflight coalescing verified by Check 4.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] sends 100 concurrent requests for an uncached dynamic key and asserts exactly 1 upstream fetch.",
    "Are all terms accurate?": "YES. Accurately covers sharded storage, TinyLFU frequency sketches, consistent hashing, and singleflight.",
    "Does problem statement promise only what is verified?": "YES. Sharded storage, TinyLFU eviction, TCP server, consistent hashing, and singleflight are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic key-value pairs; no personal data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering lock-free storage, adaptive eviction, consistent hashing, and singleflight coalescing."
}

b16_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved SWIM gossip protocol and AOF disk persistence to Extended Path (+16h).
- Target Realism: Replaced generic web-service targets with authentic in-memory cache metrics (sustained GET throughput, p99 tail latency, and hash ring variance).
- Removed Banned Content: Removed unsubstantiated claims regarding commercial caching systems.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake singleflight deduplication test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [THROUGHPUT], [P99_LATENCY], and [CLIENT_COUNT] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 17. brief-dist-rate-limiter
# ==============================================================================
b17_data = {
  "id": "brief-dist-rate-limiter",
  "title": "Distributed Sliding-Window Rate Limiting Gateway in Go & Redis",
  "domain": "Distributed Systems",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems/low-level/networking", "API/backend service"],
  "problem": "Public APIs and multi-tenant cloud platforms frequently experience abusive traffic spikes, credential stuffing attacks, and noisy-neighbor service degradation. Simple in-memory rate limiting fails across horizontally autoscaled service instances because local nodes lack shared global state. This project builds a distributed, low-latency API rate limiting proxy gateway in Go coordinated via Redis. The system implements atomic sliding-window counter and token bucket algorithms via Lua scripts to eliminate race conditions, supports multi-tier tenant quotas, returns standard RFC 6585 rate limiting headers, and provides an in-memory circuit breaker that gracefully degrades to local limits during Redis cluster outages.",
  "use_cases": [
    "API gateway ingress protecting backend microservices from denial-of-service traffic surges",
    "Multi-tenant SaaS tier enforcement (free tier 60 req/min vs enterprise tier 5,000 req/min)",
    "Authentication endpoint brute-force protection throttling failed login attempts per client IP"
  ],
  "hard_parts": [
    "Writing atomic Redis Lua scripts for sliding-window log and token bucket algorithms with zero race conditions",
    "Achieving sub-3 millisecond gateway proxy overhead under heavy multi-tenant request loads",
    "Designing circuit-breaker fallback to localized in-memory token buckets when Redis nodes fail",
    "Accurately computing and propagating HTTP rate limit headers (X-RateLimit-Limit, Remaining, Reset)"
  ],
  "screener_signals": [
    "Clean Go implementation separating reverse proxy, Redis Lua scripts, configuration, and metrics",
    "High-concurrency benchmark demonstrating strict rate enforcement under 20,000 concurrent requests",
    "Anti-fake verification script sending dynamic client bursts across threshold and asserting exact 429 status transitions"
  ],
  "job_families": [
    "API Platform Engineer",
    "Backend Systems Engineer",
    "Infrastructure Platform Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "systems language powering the high-throughput HTTP reverse proxy gateway"},
    {"tool": "Redis", "role": "in-memory data store maintaining shared sliding window counters atomically via Lua"},
    {"tool": "Docker", "role": "container runtime packaging gateway and Redis for local evaluation"}
  ],
  "architecture": {
    "components": [
      {
        "name": "HTTP Reverse Proxy Gateway",
        "tools_used": ["Go"],
        "purpose": "Intercepts inbound HTTP requests, extracts tenant API keys or client IPs, and proxies valid traffic"
      },
      {
        "name": "Atomic Redis Lua Limiter",
        "tools_used": ["Go", "Redis"],
        "purpose": "Executes atomic sliding-window counter and token bucket evaluation inside Redis without race conditions"
      },
      {
        "name": "Multi-Tenant Quota Matcher",
        "tools_used": ["Go"],
        "purpose": "Resolves client identity to tier limits (e.g. Bronze 100/min, Gold 5000/min) from dynamic configuration"
      },
      {
        "name": "Circuit Breaker Fallback Engine",
        "tools_used": ["Go", "Docker"],
        "purpose": "Detects Redis health degradation and switches to local in-memory token buckets to keep proxy operational"
      }
    ],
    "data_flow": "Inbound HTTP requests arrive at the Go reverse proxy; the Quota Matcher identifies client identity and rate quota rules; the proxy executes an atomic Lua script in Redis passing client key and time window; Redis calculates remaining capacity and updates sliding window counters atomically; if within quota, the proxy forwards the request to upstream backends with rate limit headers; if exceeded, the proxy terminates the request with HTTP 429 Too Many Requests; if Redis is unresponsive, the Circuit Breaker diverts evaluation to local in-memory buckets.",
    "enforcement_mechanism": "HTTP 429 status code returns with RFC 6585 Retry-After headers; Redis Lua script atomicity preventing concurrent race exploits."
  },
  "targets": [
    {
      "metric": "Gateway Processing Overhead Latency (p99)",
      "method": "Proxy round-trip latency overhead benchmark excluding upstream backend execution duration",
      "input": "50,000 requests processed through rate limiter proxy to mock zero-latency upstream server",
      "environment": "Standard 4-core local CPU, Go 1.21+, local Redis 7 instance over Unix socket or TCP",
      "minimum_pass": "p99 proxy overhead latency is < 3.0 milliseconds",
      "target": "p99 proxy overhead latency is < 1.2 milliseconds",
      "report": "Latency benchmark summary output reporting p50, p95, and p99 percentiles"
    },
    {
      "metric": "Sliding-Window Limit Enforcement Accuracy",
      "method": "Bursted traffic test sending 1,000 requests against a configured limit of 500 requests per minute",
      "input": "1,000 concurrent HTTP requests dispatched by 20 worker threads within a 5-second window",
      "environment": "Standard 4-core local CPU, Go 1.21+, Redis 7",
      "minimum_pass": "Gateway permits exactly 500 requests and rejects exactly 500 requests with HTTP 429",
      "target": "Gateway permits exactly 500 requests and rejects exactly 500 requests with HTTP 429",
      "report": "Traffic enforcement verification log reporting HTTP status code counts"
    },
    {
      "metric": "Circuit Breaker Failover Availability",
      "method": "Automated SIGSTOP/kill chaos injection against Redis during active proxy request stream",
      "input": "5,000 continuous requests during simulated Redis downtime event",
      "environment": "Standard 4-core local CPU, Go 1.21+, Docker",
      "minimum_pass": "Gateway fails over to local in-memory limiting within 100ms with 0 unhandled 500 errors",
      "target": "Gateway fails over to local in-memory limiting within 100ms with 0 unhandled 500 errors",
      "report": "Chaos resilience log detailing circuit breaker state transition and request error rates"
    }
  ],
  "skills": ["Go", "Redis", "Docker", "Distributed Systems", "Rate Limiting", "API Gateway", "Concurrency"],
  "starter_input": {
    "spec": "YAML configuration defining tenant tiers, rate limits, burst multipliers, and upstream backend endpoints.",
    "size": "500 simulated tenant configurations across 3 service tiers (Free, Professional, Enterprise)",
    "seeded_cases": "Simultaneous request bursts across window boundaries, Redis network latency timeouts, and invalid API keys",
    "label_source": "Deterministic load generator script asserting exact accepted versus throttled request counts",
    "personal_data_policy": "Strictly mock synthetic API keys and simulated client IPs; no real credentials used"
  },
  "components": [
    {"name": "Sliding Window Counter & Token Bucket Redis Lua Algorithms", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "High-Performance HTTP Reverse Proxy Middleware in Go", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Multi-Tenant Quota & Dynamic Tier Configuration Engine", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "In-Memory Local Cache Fallback & Graceful Degradation", "task_type": "low-level/system subsystem", "hours": 3.0},
    {"name": "Distributed Concurrency & Burst Load Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "System Architecture Diagram & Quota Runbook", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Distributed sliding log with Redis cluster hash slot routing and replica-safe script execution",
      "gRPC interceptor integration with Prometheus metrics exporter and Grafana dashboard"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "Atomic Redis Lua Scripts for Sliding-Window and Token Bucket in Go Distributed Systems",
      "hours": 7,
      "done_criterion": "Lua scripts execute atomically in Redis, returning remaining quota and reset timestamps."
    },
    {
      "name": "HTTP API Gateway Proxy Middleware & Multi-Tenant Quota Matching",
      "hours": 7,
      "done_criterion": "Go proxy intercepts requests, matches tenant tiers, and returns 429 with Retry-After headers."
    },
    {
      "name": "In-Memory Fallback Circuit Breaker & Redis Outage Resilience",
      "hours": 7,
      "done_criterion": "Proxy detects Redis disconnection and falls back to local in-memory token bucket within 100ms."
    },
    {
      "name": "High-Concurrency Burst Benchmark, Docker Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark verifies 500 of 1000 requests throttled with p99 < 3ms; anti-fake test passes; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go (goroutines, channels, net/http, sync primitives)",
    "Familiarity with Redis data structures (strings, sorted sets, hashes) and basic Lua scripting"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound gateway proxy operations)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and Redis 7 installed",
    "fallback_path": "Miniredis in-memory mock Redis server if local Docker or Redis daemon cannot be started"
  },
  "riskiest_component": {
    "name": "Redis Network Latency Increasing API Gateway Overhead",
    "fallback": "Leverage Redis connection pooling and local pipeline batching to minimize TCP handshake overhead"
  },
  "deliverables": [
    "Git repository containing Go reverse proxy gateway source code, Lua scripts, and unit tests",
    "Docker Compose file orchestrating Redis server and rate limiter gateway",
    "Automated load testing harness measuring latency overhead and sliding-window limit accuracy",
    "Screener verification script executing automated benchmark and dynamic burst check in under 2 minutes"
  ],
  "out_of_scope": [
    "Web Application Firewall (WAF) SQL injection and payload inspection",
    "Global BGP Anycast routing and distributed edge DNS routing",
    "Billing payment processor integration for quota overage invoices"
  ],
  "safety_note": None,
  "resources": [
    "RFC 6585: Additional HTTP Status Codes (Status 429 Too Many Requests)",
    "Redis Lua Scripting Documentation and Atomicity Guidelines",
    "High-Performance Go HTTP Reverse Proxy Patterns and Connection Pooling"
  ],
  "rubric": [
    {
      "input": "1,000 rapid requests dispatched to tenant with 500 request/minute quota",
      "action": "Run go run ./cmd/bench --requests 1000 --limit 500",
      "expected_result": "Proxy permits exactly 500 requests and returns HTTP 429 for remaining 500 requests",
      "evidence_location": "Terminal test summary log and reports/status_distribution.json",
      "pass_criterion": "Exactly 500 HTTP 200 and 500 HTTP 429 responses recorded with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50,000 request benchmark measuring gateway latency overhead",
      "action": "Run go run ./cmd/bench --benchmark latency --requests 50000",
      "expected_result": "Measured p99 latency overhead added by rate limiting proxy is < 3.0 milliseconds",
      "evidence_location": "Latency distribution console output table",
      "pass_criterion": "p99 latency overhead is < 3.0 milliseconds",
      "kind": "normal"
    },
    {
      "input": "Redis process termination during active 5,000 request stream",
      "action": "Run ./scripts/test_redis_outage.sh",
      "expected_result": "Circuit breaker trips to local in-memory token bucket; proxy returns 0 HTTP 500 errors",
      "evidence_location": "Outage test execution log",
      "pass_criterion": "Test passes with 0 HTTP 500 responses and circuit breaker state reported as OPEN",
      "kind": "normal"
    },
    {
      "input": "Request exceeding rate quota threshold",
      "action": "curl -i http://localhost:8080/api/data -H 'X-API-Key: test_key'",
      "expected_result": "Response contains HTTP 429 status and X-RateLimit-Limit, Remaining, and Retry-After headers",
      "evidence_location": "HTTP response header output",
      "pass_criterion": "Response status is 429 and Retry-After header is present with positive integer value",
      "kind": "normal"
    },
    {
      "input": "Dynamic API key configured with dynamic limit of 10 requests injected at runtime",
      "action": "python scripts/verify_dynamic_quota.py --key DYNAMIC_KEY_99 --limit 10 --burst 15",
      "expected_result": "Gateway allows first 10 requests and transitions to HTTP 429 on exactly the 11th request",
      "evidence_location": "Dynamic verification output log",
      "pass_criterion": "Request 10 returns 200, request 11 returns 429, and exit code is 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed sliding-window rate limiting gateway in Go and Redis; enforced multi-tenant request quotas with sub-[P99_OVERHEAD] proxy overhead across [REQUEST_COUNT] requests, and ensured continuous availability through in-memory circuit breaker failover.",
    "claims": [
      {
        "text": "enforced multi-tenant request quotas with sub-[P99_OVERHEAD] proxy overhead across [REQUEST_COUNT] requests",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "ensured continuous availability through in-memory circuit breaker failover",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "global multi-region BGP Anycast routing or enterprise WAF payload inspection"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a distributed Go reverse proxy rate limiting gateway using Redis Lua scripts, multi-tenant tiers, and circuit breaker fallback.",
    "q2": "Target users: API platform engineers, backend infrastructure engineers, and systems architects.",
    "q3": "3 use cases: API gateway ingress protection, multi-tenant tier quota enforcement, and login endpoint brute-force throttling.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: atomic Redis Lua sliding-window logic, sub-3ms gateway latency overhead, circuit breaker local fallback, and RFC 6585 header handling.",
    "q6": "Starter input: 500 simulated tenant configurations across 3 service tiers. Synthetic mock credentials only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: Miniredis in-memory mock.",
    "q8": "Riskiest component: Redis network latency overhead. Fallback: connection pooling and pipeline batching.",
    "q9": "Potential faking: hardcoded 200/429 alternating responses. Anti-fake check 5 configures dynamic key with limit 10 and asserts transition on exactly request 11.",
    "q10": "Safety/ethics: Safe; synthetic API keys and simulated HTTP workloads only."
  }
}

b17_old_diag = """
- **Old Title**: Distributed Rate Limiter & Token Bucket Gateway
- **Domain**: Distributed Systems
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic proxy setup; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'top tech platforms, top tech platforms, and top tech platforms enforce this', 'Directly applicable to top tech platforms')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated rate limiting proxy with generic web-service targets rather than proxy overhead latency and quota accuracy.
2. **Duplicated marketing claims**:
   > "API Gateways at top tech platforms, top tech platforms, and top tech platforms enforce per-customer rate limits... Directly applicable to top tech platforms, AWS API Gateway..."
"""

b17_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and Redis at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Proxy latency overhead (< 3.0ms) and sliding-window limit accuracy (500 of 500) measured directly on local loopback.",
    "Is there a CPU/local/free fallback?": "YES. In-memory Miniredis mock server if local Redis daemon cannot be run.",
    "Can test data be created in minutes?": "YES. Synthetic 500-tenant configuration and load generator included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full benchmark suite and dynamic burst test in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Rate limiting proxy overhead, sliding window limit enforcement accuracy, and circuit breaker failover are unique to rate limiters.",
    "Is every bullet claim verified by rubric?": "YES. Overhead latency and quota accuracy verified by Checks 0 & 1; circuit breaker verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic key with limit 10 and asserts 429 transition on exactly request 11.",
    "Are all terms accurate?": "YES. Accurately covers sliding-window counters, token buckets, Redis Lua scripts, and circuit breakers.",
    "Does problem statement promise only what is verified?": "YES. Reverse proxy, Redis Lua scripts, multi-tenant quotas, and circuit breaker fallback are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic API keys and simulated IP addresses.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering atomic Redis Lua scripting, sub-3ms overhead, circuit-breaker fallback, and RFC 6585 headers."
}

b17_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Redis cluster hash slot routing and gRPC interceptor to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic rate limiting metrics (proxy overhead latency, sliding-window enforcement accuracy, and circuit-breaker failover).
- Removed Banned Content: Removed 'top tech platforms' duplicate marketing and employer name-dropping.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic burst check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [P99_OVERHEAD] and [REQUEST_COUNT] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 18. brief-embedding-search-engine
# ==============================================================================
b18_data = {
  "id": "brief-embedding-search-engine",
  "title": "Semantic Code Search Engine with Tree-Sitter AST Chunking & Vector Retrieval",
  "domain": "AI/ML Applications",
  "difficulty": "INTERMEDIATE",
  "project_types": ["AI/ML pipeline/model", "API/backend service"],
  "problem": "Software engineers frequently navigate large unfamiliar codebases using literal string searches or regex queries, which consistently fail to discover code with differing naming conventions or abstract conceptual implementations. Traditional lexical search cannot capture syntactic structures or natural language semantic intent. This project builds an intelligent semantic code search engine in Python. The system parses source code files into structural abstract syntax tree (AST) chunks using Tree-sitter, computes dense vector representations using open-source code embedding models, stores vectors in a local Qdrant vector database, and serves natural language search queries through a FastAPI backend combining dense semantic retrieval with sparse BM25 keyword matching via Reciprocal Rank Fusion.",
  "use_cases": [
    "Developer onboarding tools enabling natural language discovery of repository business logic",
    "Automated duplicate and near-duplicate function identification across enterprise monorepositories",
    "IDE contextual code discovery plugins matching user task descriptions to existing library utilities"
  ],
  "hard_parts": [
    "Extracting structurally coherent function and class blocks across multiple programming languages using Tree-sitter AST queries",
    "Selecting and quantizing code embedding models to execute inference within standard CPU RAM limits",
    "Implementing hybrid retrieval combining dense vector similarity with sparse BM25 scoring via Reciprocal Rank Fusion",
    "Maintaining sub-200 millisecond end-to-end search query latency across indexed repositories exceeding 25,000 code functions"
  ],
  "screener_signals": [
    "Clean Python implementation separating AST parsing, embedding inference, vector indexing, and FastAPI endpoints",
    "Evaluation benchmark evaluating Recall@10 and Mean Reciprocal Rank (MRR) across 100 natural language query test pairs",
    "Anti-fake verification script indexing a dynamic code snippet with unique variable names and retrieving it via pure semantic intent"
  ],
  "job_families": [
    "AI Platform Engineer",
    "Machine Learning Engineer",
    "Developer Tooling Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language for AST extraction, embedding generation, and API services"},
    {"tool": "Tree-sitter", "role": "parser library extracting language syntax trees and structured function blocks"},
    {"tool": "Qdrant", "role": "vector search database storing and indexing dense embeddings locally via HNSW"},
    {"tool": "FastAPI", "role": "web framework serving semantic search endpoints and hybrid ranking queries"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Tree-Sitter AST Extractor",
        "tools_used": ["Python", "Tree-sitter"],
        "purpose": "Parses Python, Go, and JavaScript source files into clean function and class AST nodes with metadata"
      },
      {
        "name": "Code Embedding Pipeline",
        "tools_used": ["Python"],
        "purpose": "Transforms structural code chunks and docstrings into 384-dimensional dense vectors using all-MiniLM-L6-v2"
      },
      {
        "name": "Qdrant Hybrid Vector Index",
        "tools_used": ["Python", "Qdrant"],
        "purpose": "Stores dense embeddings and BM25 sparse payloads, executing cosine similarity search via HNSW graphs"
      },
      {
        "name": "FastAPI Semantic Search Gateway",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Exposes search REST endpoints, combines dense and sparse ranks via Reciprocal Rank Fusion, and returns formatted code snippets"
      }
    ],
    "data_flow": "Source code repositories are scanned by the Tree-Sitter AST Extractor; function definitions, parameters, and docstrings are extracted into structured code chunks; the Code Embedding Pipeline generates dense embeddings for each chunk; embeddings and text metadata are indexed into local Qdrant collections; client natural language queries enter FastAPI; the query is embedded and evaluated against Qdrant dense vectors and BM25 keywords; Reciprocal Rank Fusion merges ranked results; ranked code snippets with syntax highlighting return to the user.",
    "enforcement_mechanism": "Structural AST node boundaries preventing arbitrary line truncation; cosine similarity distance thresholds filtering low-relevance results."
  },
  "targets": [
    {
      "metric": "Code Retrieval Relevance (Recall@10)",
      "method": "Evaluation of top 10 returned code snippets across 100 natural language technical queries against gold-standard labels",
      "input": "100 technical queries evaluated against repository of 5,000 indexed functions with annotated target functions",
      "environment": "Standard 4-core local CPU, Python 3.11, CPU-only embedding inference",
      "minimum_pass": "Recall@10 exceeds 75% on technical query benchmark",
      "target": "Recall@10 exceeds 88% on technical query benchmark",
      "report": "Information retrieval evaluation report reporting MRR, Recall@5, and Recall@10"
    },
    {
      "metric": "End-to-End Query Retrieval Latency",
      "method": "Wall-clock timing from query arrival to final hybrid ranked response output across 25,000 indexed functions",
      "input": "500 consecutive natural language search queries issued against populated Qdrant vector index",
      "environment": "Standard 4-core local CPU, Qdrant in-memory or Docker instance, Python 3.11",
      "minimum_pass": "Average query latency is < 200 milliseconds",
      "target": "Average query latency is < 85 milliseconds",
      "report": "Query benchmark latency percentile log detailing p50, p95, and p99 durations"
    },
    {
      "metric": "AST Function Extraction Accuracy Rate",
      "method": "Automated comparison of Tree-sitter parsed function boundaries against reference AST ground truth",
      "input": "50 multi-language source files containing nested closures, decorators, and multi-line docstrings",
      "environment": "Standard 4-core local CPU, Python 3.11",
      "minimum_pass": "Accurate extraction of 50 of 50 function boundaries with 0 syntax parse errors",
      "target": "Accurate extraction of 50 of 50 function boundaries with 0 syntax parse errors",
      "report": "AST parser boundary accuracy verification log"
    }
  ],
  "skills": ["Python", "Tree-sitter", "Qdrant", "FastAPI", "Vector Search", "Information Retrieval", "NLP"],
  "starter_input": {
    "spec": "Curated multi-language code repository (Python, Go, JavaScript) with 5,000 function definitions and query evaluation benchmark dataset.",
    "size": "Repository of 5,000 functions totaling 120,000 LOC across 350 files with 100 natural language evaluation queries",
    "seeded_cases": "Functions with obfuscated variable names, nested lambda expressions, empty docstrings, and syntax errors",
    "label_source": "Deterministic evaluation dataset mapping 100 natural language intent queries to exact target function signatures",
    "personal_data_policy": "Strictly public open-source code repositories with permissive Apache/MIT licenses; no private code used"
  },
  "components": [
    {"name": "Tree-Sitter Polyglot AST Extractor & Function Chunker", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Code Embedding Pipeline with Hugging Face Models", "task_type": "model train + evaluate cycle", "hours": 4.0},
    {"name": "Qdrant Vector Index & Hybrid BM25 Retrieval Engine", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "FastAPI Semantic Query API & Natural Language Search Endpoint", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Retrieval Relevance Benchmark & Anti-Fake Evaluation Harness", "task_type": "evaluation dataset creation + scoring script", "hours": 4.0},
    {"name": "Pipeline Architecture Diagram & Latency Runbook", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Cross-encoder reranking stage using BGE-reranker-base to refine top 10 retrieval candidates",
      "Real-time Git webhook indexing worker processing diff commits and invalidating stale vector embeddings"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "Tree-Sitter AST Extraction & Structural Code Chunking in Python",
      "hours": 7,
      "done_criterion": "Tree-sitter extracts function boundaries and docstrings from Python, Go, and JS without errors."
    },
    {
      "name": "Hugging Face Embedding Generation & Qdrant Vector Indexing",
      "hours": 7,
      "done_criterion": "Embedding model encodes code chunks into vectors and stores them in Qdrant with HNSW indexing."
    },
    {
      "name": "Hybrid BM25 and Vector Search with Reciprocal Rank Fusion in FastAPI for Information Retrieval",
      "hours": 7,
      "done_criterion": "FastAPI serves search queries, executing hybrid vector + BM25 search and merging ranks via RRF."
    },
    {
      "name": "NLP Semantic Search Evaluation Benchmark, Anti-Fake Verification & Docs",
      "hours": 7,
      "done_criterion": "Benchmark confirms Recall@10 > 75% in < 200ms; anti-fake test validates dynamic function retrieval; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, type annotations, and asynchronous FastAPI development",
    "Understanding of vector embeddings, cosine distance, vector search databases, and text chunking"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound quantized model inference)",
    "cost": "$0 (fully open-source software stack and local embedding weights)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and Qdrant local storage or Docker installed",
    "fallback_path": "In-memory FAISS or Numpy cosine similarity matrix if Qdrant binary cannot be initialized"
  },
  "riskiest_component": {
    "name": "High Embedding Inference Latency on Local CPU",
    "fallback": "Leverage quantized ONNX runtime for embedding models (e.g. all-MiniLM-L6-v2 ONNX) to cut CPU latency by 3x"
  },
  "deliverables": [
    "Git repository containing Python code search engine, AST extractors, Qdrant indexing pipeline, and FastAPI app",
    "Interactive CLI search command line and API documentation at /docs",
    "Automated IR evaluation harness calculating Recall@10 and MRR across query benchmarks",
    "Screener verification script executing automated benchmark and dynamic semantic query in under 2 minutes"
  ],
  "out_of_scope": [
    "Fine-tuning large 70B parameter code foundation models from scratch",
    "Automated code generation, program repair, or synthetic unit test synthesis",
    "Enterprise SSO authentication and role-based repository access controls"
  ],
  "safety_note": None,
  "resources": [
    "Tree-sitter Official Grammar Guide and Query Syntax Reference",
    "Qdrant Hybrid Search and Reciprocal Rank Fusion Architecture Documentation",
    "Dense Passage Retrieval and Semantic Code Search Benchmark Literature"
  ],
  "rubric": [
    {
      "input": "Benchmark dataset of 100 technical queries evaluated against 5,000 indexed functions",
      "action": "python -m search_engine.evaluate --queries data/eval_queries.json",
      "expected_result": "Search engine achieves Recall@10 exceeding 75% and MRR exceeding 0.65",
      "evidence_location": "Terminal stdout output and reports/ir_metrics.json",
      "pass_criterion": "Recall@10 is > 0.75 and MRR is > 0.65 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 consecutive search queries issued to FastAPI search endpoint",
      "action": "python scripts/benchmark_latency.py --queries 500",
      "expected_result": "Average end-to-end query retrieval latency is < 200 milliseconds on local CPU",
      "evidence_location": "Latency benchmark summary output log",
      "pass_criterion": "Average search latency is < 200 milliseconds",
      "kind": "normal"
    },
    {
      "input": "50 source code files containing nested classes and decorated functions",
      "action": "pytest tests/test_ast_parser.py",
      "expected_result": "Tree-sitter parser extracts all 50 function boundaries accurately",
      "evidence_location": "Pytest console execution report",
      "pass_criterion": "50 of 50 function boundary extraction tests pass with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Hybrid search query combining dense vector similarity and BM25 keywords",
      "action": "curl -X POST http://localhost:8000/search -H 'Content-Type: application/json' -d '{\"query\": \"parse json payload\"}'",
      "expected_result": "FastAPI returns structured JSON with top ranked code functions, file paths, and confidence scores",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and results array contains at least 5 matching candidates",
      "kind": "normal"
    },
    {
      "input": "Dynamic synthetic code function with obscure identifiers ('xyz_calc_total_amortization') indexed at runtime",
      "action": "python scripts/verify_dynamic_semantic.py --code 'def xyz_calc_total(p, r, n): ...' --query 'calculate monthly mortgage payment breakdown'",
      "expected_result": "Engine embeds query and retrieves dynamic function in top 3 results despite zero lexical token overlap",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Dynamic function appears in top 3 retrieved results with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected semantic code search engine in Python and FastAPI using Tree-sitter and Qdrant; extracted AST function chunks across [FUNCTION_COUNT] functions, achieved [RECALL_SCORE] top-ten recall on technical query benchmarks, and delivered hybrid retrieval with sub-[QUERY_LATENCY] latency.",
    "claims": [
      {
        "text": "achieved [RECALL_SCORE] top-ten recall on technical query benchmarks",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered hybrid retrieval with sub-[QUERY_LATENCY] latency",
        "rubric_indexes": [1, 3]
      }
    ],
    "do_not_claim": "70B parameter generative code repair or enterprise multi-tenant IAM authorization"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: an intelligent semantic code search engine with Tree-sitter AST extraction, Qdrant hybrid vector index, and FastAPI retrieval API.",
    "q2": "Target users: developer tooling engineers, platform teams, and AI/ML search engineers.",
    "q3": "3 use cases: developer repository onboarding, automated duplicate code detection, and IDE natural language search plugins.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: Tree-sitter polyglot AST chunking, CPU embedding inference optimization, hybrid BM25 + dense Reciprocal Rank Fusion, and sub-200ms query latency.",
    "q6": "Starter input: 5,000 function definitions across 350 files with 100 evaluation queries. Permissive open-source code only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory FAISS/Numpy cosine similarity.",
    "q8": "Riskiest component: High embedding inference latency on local CPU. Fallback: quantized ONNX model runtime.",
    "q9": "Potential faking: substring/grep matching. Anti-fake check 5 indexes dynamic function with obscure names and retrieves it via pure semantic intent with zero token overlap.",
    "q10": "Safety/ethics: Safe; public open-source code repositories only."
  }
}

b18_old_diag = """
- **Old Title**: Semantic Code Search Engine using AST + Embeddings
- **Domain**: AI/ML Applications
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic pipeline script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'GitHub Copilot, Sourcegraph, Phind', 'Developer tools are a hot market')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an AI code search engine using web-service k6 throughput targets.
2. **Commercial employer name-dropping**:
   > "GitHub Copilot's code search, Sourcegraph's intelligence platform, and Phind's code search all solve this. Developer tools are a hot market..."
"""

b18_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, Tree-sitter, and Qdrant at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Recall@10 (> 75%) and query retrieval latency (< 200ms) measured directly on local CPU.",
    "Is there a CPU/local/free fallback?": "YES. In-memory FAISS or Numpy cosine similarity if local Qdrant is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 5,000 function multi-language repository and 100 evaluation queries included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full evaluation suite and dynamic semantic query test in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Recall@10 relevance, hybrid search latency, and AST function boundary extraction are unique to code search engines.",
    "Is every bullet claim verified by rubric?": "YES. Recall@10 verified by Check 0; hybrid latency verified by Checks 1 & 3.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] indexes a dynamic function with obscure names and retrieves it via pure semantic intent with zero token overlap.",
    "Are all terms accurate?": "YES. Accurately covers Tree-sitter AST queries, dense vector embeddings, Qdrant HNSW indexing, and Reciprocal Rank Fusion.",
    "Does problem statement promise only what is verified?": "YES. AST chunking, dense vector indexing, hybrid BM25 + dense search, and FastAPI API are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly permissive public open-source code repositories; no private code.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering polyglot AST chunking, CPU embedding inference optimization, hybrid retrieval, and sub-200ms latency."
}

b18_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cross-encoder reranking and Git webhook worker to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic search engine metrics (Recall@10, query retrieval latency, and AST extraction accuracy).
- Removed Banned Content: Removed employer marketing regarding GitHub Copilot, Sourcegraph, and Phind.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic semantic retrieval test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [FUNCTION_COUNT], [RECALL_SCORE], and [QUERY_LATENCY] with strict 'Do not claim' boundary.
"""


def run_batch_2_part1():
    res14 = process_brief(b14_data, b14_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 6.0, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True}, b14_reviewer, b14_changelog)
    res15 = process_brief(b15_data, b15_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b15_reviewer, b15_changelog)
    res16 = process_brief(b16_data, b16_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 6.0, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True}, b16_reviewer, b16_changelog)
    res17 = process_brief(b17_data, b17_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b17_reviewer, b17_changelog)
    res18 = process_brief(b18_data, b18_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b18_reviewer, b18_changelog)
    return [res14, res15, res16, res17, res18]

if __name__ == "__main__":
    results = run_batch_2_part1()
    print("Batch 2 Part 1 finished successfully:", results)
