"""
Batch 5 Part 2: Redesign briefs 49 to 53 from scratch.
49. brief-observability-sdk
50. brief-offline-first-sync
51. brief-opentelemetry-observability
52. brief-osint-data-platform
53. brief-peer-to-peer
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 49. brief-observability-sdk
# ==============================================================================
b49_data = {
  "id": "brief-observability-sdk",
  "title": "In-Process Observability Telemetry SDK & Auto-Instrumentation Library in Go with OTLP Exporters",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems programming", "Platform/infra tool"],
  "problem": "Integrating third-party observability libraries into high-throughput microservices often introduces unacceptable CPU profiling overhead, lock contention in shared metric registries, and memory leaks when upstream collector endpoints experience network partitions. Heavy reflection-based SDKs degrade service p99 latencies and lack backpressure controls. This project builds a lightweight, zero-allocation observability SDK and auto-instrumentation middleware library from scratch in Go. The SDK intercepts HTTP and gRPC traffic, propagates W3C TraceContext headers across process boundaries, aggregates metrics using lock-free atomic counters and sliding-window histograms, and exports batched OpenTelemetry (OTLP) payloads over gRPC with bounded memory queues.",
  "use_cases": [
    {
      "title": "Core Banking Transaction Gateway Latency Tracing",
      "first_sentence": "Financial core transaction gateways processing thousands of credit authorization queries per second require microsecond-accurate distributed tracing without adding request latency.",
      "second_sentence": "The SDK instruments incoming HTTP handler chains, creating child span contexts and streaming OTLP trace bundles over gRPC without blocking transactional worker threads."
    },
    {
      "title": "Microservice Service Mesh Distributed Context Propagation",
      "first_sentence": "Platform engineering teams maintaining complex microservice topologies need standardized distributed trace headers to track requests across polyglot backend tiers.",
      "second_sentence": "The library automatically extracts and injects standard W3C traceparent headers across outgoing client requests, preserving end-to-end trace causality across microservice hops."
    },
    {
      "title": "High-Volume Telemetry Metric Counter Aggregation",
      "first_sentence": "Cloud infrastructure daemons monitoring container network sockets need to aggregate millions of metric data points per second with minimal memory overhead.",
      "second_sentence": "The SDK uses lock-free atomic ring buffers to aggregate request rates and error status codes in-memory, flushing compressed delta batches to central collectors at regular intervals."
    }
  ],
  "hard_parts": [
    "Designing lock-free atomic ring buffers for span collection and metric recording to eliminate mutex contention under high concurrency",
    "Parsing, validating, and injecting W3C TraceContext and baggage headers with zero heap allocations in critical request paths",
    "Implementing memory-bounded queueing with configurable drop-oldest backpressure to protect host services during collector outages",
    "Encoding binary Protocol Buffer OTLP payloads and managing persistent gRPC streaming channels with automatic reconnection"
  ],
  "screener_signals": [
    "Clean idiomatic Go codebase using sync/atomic primitives, minimal allocations, and standard OpenTelemetry semantic conventions",
    "Microbenchmark report demonstrating sub-250 nanosecond span creation overhead and zero heap allocations in core tracer paths",
    "Anti-fake verification script issuing a live HTTP request with a custom traceparent header and verifying the SDK creates a correlated child span"
  ],
  "job_families": [
    "Platform Software Engineer",
    "Observability & SRE Specialist",
    "Distributed Systems Developer"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing SDK interfaces, ring buffers, and middleware handlers"},
    {"tool": "OpenTelemetry", "role": "industry standard telemetry specification defining span data models and semantic attributes"},
    {"tool": "HTTP", "role": "protocol instrumented via middleware wrappers extracting headers and timing request durations"},
    {"tool": "Concurrency", "role": "goroutines, sync/atomic primitives, and channels managing asynchronous batch exports"},
    {"tool": "gRPC", "role": "high-performance binary RPC protocol streaming serialized OTLP protobuf spans to collectors"}
  ],
  "architecture": {
    "components": [
      {
        "name": "W3C TraceContext Propagator & Header Parser",
        "tools_used": ["Go", "HTTP"],
        "purpose": "Parses and injects traceparent and tracestate headers according to W3C distributed tracing standards"
      },
      {
        "name": "Lock-Free Span Tracer & Ring Buffer Store",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Records span lifecycle events (start, annotate, end) with sub-microsecond latency using atomic buffers"
      },
      {
        "name": "Atomic Metric Aggregator & Histogram Collector",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Maintains low-overhead counters, gauges, and explicit bucket histograms for service request telemetry"
      },
      {
        "name": "OTLP Binary Protobuf Serializer & gRPC Exporter",
        "tools_used": ["Go", "gRPC", "OpenTelemetry"],
        "purpose": "Serializes trace and metric batches into OTLP protobuf format and streams payloads over persistent gRPC links"
      },
      {
        "name": "SDK Overhead Microbenchmark & Memory Profiling Suite",
        "tools_used": ["Go"],
        "purpose": "Profiles CPU nanoseconds per operation, heap allocation bytes, and memory residency under continuous loads"
      }
    ],
    "data_flow": "An incoming HTTP request enters the instrumented middleware; the propagator extracts the W3C traceparent header and creates a child SpanContext; the handler executes business logic while recording attribute key-values; upon request completion, the span ends and enqueues into a lock-free ring buffer; background exporter goroutines poll the buffer, serialize spans into OTLP protobuf messages, and transmit batches over gRPC to OpenTelemetry collectors; if the collector is unreachable, the exporter drops oldest spans once the buffer reaches its capacity limit (e.g. 10,000 spans) to prevent memory ballooning.",
    "enforcement_mechanism": "Bounded ring buffer capacities preventing memory leaks; atomic operations preventing race conditions without mutex locks."
  },
  "targets": [
    {
      "metric": "Tracer Middleware Added Latency Overhead",
      "method": "Benchmarking CPU time and latency added per HTTP request when instrumentation middleware is enabled versus disabled",
      "input": "100,000 benchmark HTTP requests passed through instrumented middleware pipeline under high concurrency",
      "environment": "Standard 4-core local CPU, Go 1.21+ benchmark runner with -benchmem flag",
      "minimum_pass": "Average added latency overhead per request is < 0.25 milliseconds with < 3 heap allocations",
      "target": "Average added latency overhead per request is < 0.08 milliseconds with 0 heap allocations",
      "report": "Tracer microbenchmark profiling output and memory allocation log"
    },
    {
      "metric": "OTLP Batch Exporter Throughput",
      "method": "Sustained number of completed telemetry spans serialized and exported per second over local gRPC connection",
      "input": "50,000 synthetic span records flushed to mock OpenTelemetry collector receiver",
      "environment": "Standard 4-core local CPU, local gRPC loopback connection",
      "minimum_pass": "Sustained export throughput is >= 15,000 spans per second",
      "target": "Sustained export throughput is >= 35,000 spans per second",
      "report": "OTLP exporter throughput summary table and benchmark report"
    },
    {
      "metric": "Memory Residency Ceiling Under Collector Outage",
      "method": "Maximum resident set size (RSS) memory consumed by SDK when upstream collector is disconnected and traffic continues",
      "input": "Continuous 5,000 spans per second generation for 60 seconds with collector endpoint intentionally blocked",
      "environment": "Go process monitored via runtime.ReadMemStats under simulated network partition",
      "minimum_pass": "Peak SDK heap allocation is < 35.0 megabytes with drop-oldest policy engaged",
      "target": "Peak SDK heap allocation is < 18.0 megabytes with drop-oldest policy engaged",
      "report": "Memory residency audit log and backpressure queue verification"
    }
  ],
  "skills": ["Go", "OpenTelemetry", "HTTP", "Concurrency", "gRPC", "Observability", "Systems Programming"],
  "starter_input": {
    "spec": "Directory containing Go SDK package scaffolding, mock OpenTelemetry collector receiver, and microservice traffic test scripts.",
    "size": "6 Go source packages, mock OTLP gRPC collector server, and automated benchmark runners",
    "seeded_cases": "Malformed W3C traceparent headers, collector gRPC connection drops, bursty metric increments, and circular baggage contexts",
    "label_source": "Deterministic OTLP protobuf specification assertions and Go benchmark timing metrics",
    "personal_data_policy": "Strictly synthetic mock telemetry spans and simulated HTTP headers; no real personal data used"
  },
  "components": [
    {"name": "W3C TraceContext Propagator & Header Parser", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Lock-Free Span Tracer & Ring Buffer Store", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Atomic Metric Aggregator & Histogram Collector", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "OTLP Binary Protobuf Serializer & gRPC Exporter", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "SDK Overhead Microbenchmark & Memory Profiling Suite", "task_type": "load or performance test harness + report", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic tail-based sampling engine running in-process to filter high-volume HTTP 200 health checks while retaining errors",
      "Auto-instrumentation for database drivers wrapping database/sql with query duration metrics and sanitized SQL statements",
      "eBPF socket tracing integration capturing outbound TCP connections without manual code changes"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "W3C TraceContext & HTTP Middleware in Go and OpenTelemetry",
      "hours": 7,
      "done_criterion": "Middleware extracts traceparent headers and initializes span contexts with zero errors."
    },
    {
      "name": "Lock-Free Ring Buffers & Atomic Metrics in Concurrency and Systems Programming",
      "hours": 7,
      "done_criterion": "Spans record to ring buffer in < 0.25ms; atomic counters aggregate telemetry without mutexes."
    },
    {
      "name": "OTLP gRPC Exporter & Backpressure in gRPC and Observability",
      "hours": 7,
      "done_criterion": "Exporter streams spans to collector over gRPC; memory stays < 35MB during collector outage."
    },
    {
      "name": "Throughput Benchmarking, Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark confirms 15k spans/sec; anti-fake test validates parent-child span linkage; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, pointer mechanics, and synchronization (sync/atomic, channels)",
    "Understanding of distributed tracing concepts (W3C TraceContext, spans, parentage) and gRPC streaming"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and memory bound systems software)",
    "cost": "$0 (fully open-source Go codebase)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ installed",
    "fallback_path": "Local in-memory mock collector receiver running as a background goroutine"
  },
  "riskiest_component": {
    "name": "Memory Leaks and Garbage Collection Pressure from Excessive Span Allocations",
    "mitigation": "Use sync.Pool for span object recycling, pre-allocate buffer slices, and enforce strict queue drop-oldest limits.",
    "fallback": "Fixed-capacity static array ring buffer dropping new spans when capacity is reached."
  },
  "deliverables": [
    "Git repository containing Go telemetry SDK library, HTTP/gRPC middleware, and OTLP exporters",
    "Mock OpenTelemetry collector server binary recording received spans and metrics for verification",
    "Automated microbenchmark suite testing latency overhead, allocations per op, and memory caps",
    "Screener verification script validating span parentage and dynamic header propagation in under 2 minutes"
  ],
  "out_of_scope": [
    "Distributed database storage engine backend implementation (ClickHouse/Cassandra)",
    "Web frontend flamegraph visualization UI authoring outside test logs",
    "Kernel-level hypervisor VM guest introspection"
  ],
  "safety_note": None,
  "resources": [
    "W3C TraceContext Specification: HTTP Headers and Binary Format Standards",
    "OpenTelemetry Protocol (OTLP) Specification: Protobuf Definitions",
    "High Performance Go: Memory Allocation Optimization and Profiling (Dave Cheney)"
  ],
  "rubric": [
    {
      "input": "100,000 HTTP requests passed through instrumented middleware pipeline",
      "action": "go test -bench=BenchmarkMiddlewareOverhead -benchmem ./sdk/...",
      "expected_result": "Microbenchmark confirms added latency overhead is < 0.25 milliseconds per request",
      "evidence_location": "Terminal test execution output log and reports/overhead_benchmark.json",
      "pass_criterion": "Overhead is < 0.25ms/op with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50,000 synthetic telemetry spans exported to local mock collector",
      "action": "go run ./cmd/bench_exporter --spans 50000",
      "expected_result": "SDK achieves sustained export throughput >= 15,000 spans per second over gRPC",
      "evidence_location": "OTLP exporter throughput summary report",
      "pass_criterion": "Export throughput is >= 15,000 spans/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Collector endpoint disconnected while 5,000 spans/sec generate for 60 seconds",
      "action": "go test -v ./sdk/... -run TestMemoryResidencyUnderOutage",
      "expected_result": "Drop-oldest backpressure engages and peak SDK heap memory remains < 35.0 megabytes",
      "evidence_location": "Memory residency audit log in reports/memory_audit.json",
      "pass_criterion": "Peak heap memory < 35.0MB and exit code is 0",
      "kind": "normal"
    },
    {
      "input": "Sample microservice endpoint invoked with HTTP GET",
      "action": "curl -i http://localhost:8080/api/users/123",
      "expected_result": "Response headers contain traceparent header matching emitted span trace ID",
      "evidence_location": "HTTP response header output",
      "pass_criterion": "traceparent header is present and valid format with status 200",
      "kind": "normal"
    },
    {
      "input": "Dynamic HTTP request with custom incoming traceparent '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'",
      "action": "go run ./scripts/verify_dynamic_trace.go --traceparent '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'",
      "expected_result": "SDK extracts parent ID, creates child span with parent '00f067aa0ba902b7', and flushes to collector",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Collector verifies span has ParentSpanID '00f067aa0ba902b7' and TraceID '4bf92f3577b34da6a3ce929d0e0e4736' with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected in-process observability telemetry SDK in Go with OpenTelemetry gRPC exporting; maintained sub-[PROXY_OVERHEAD] microsecond middleware latency overhead, and sustained [INGESTION_THROUGHPUT] spans per second batch export throughput.",
    "claims": [
      {
        "text": "maintained sub-[PROXY_OVERHEAD] microsecond middleware latency overhead",
        "rubric_indexes": [0]
      },
      {
        "text": "sustained [INGESTION_THROUGHPUT] spans per second batch export throughput",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "distributed storage engine database clustering or kernel-level hypervisor VM guest introspection"
  },
  "verify": [
    "Run `go test -v ./...` to verify trace propagation, atomic metrics, and OTLP serialization pass.",
    "Execute `go test -bench=. -benchmem ./sdk/...` to verify latency overhead and zero allocation targets.",
    "Run `go run ./scripts/verify_dynamic_trace.go` to assert parent-child span linkage across W3C headers."
  ],
  "worksheet": {
    "q1": "Core deliverable: an in-process observability telemetry SDK in Go with W3C propagation, lock-free ring buffers, and OTLP gRPC exporters.",
    "q2": "Target users: platform software engineers, SRE specialists, and distributed systems developers.",
    "q3": "3 use cases: banking gateway latency tracing, service mesh context propagation, and high-volume metric counter aggregation.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: lock-free ring buffers without mutexes, zero-allocation W3C header parsing, bounded memory queues with drop-oldest, and binary Protobuf OTLP serialization.",
    "q6": "Starter input: Go SDK package scaffolding, mock OTLP collector server, and microservice traffic test scripts. Synthetic telemetry only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local in-memory collector goroutine.",
    "q8": "Riskiest component: memory leaks and GC pressure. Fallback: sync.Pool object recycling and fixed-capacity static ring buffers.",
    "q9": "Potential faking: mock hardcoded trace headers. Anti-fake check 5 feeds dynamic traceparent, asserts collector receives linked child span with exact parent ID.",
    "q10": "Safety/ethics: Safe; local loopback gRPC and synthetic telemetry only, zero production system risk."
  }
}

b49_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Observability SDK & Auto-Instrumentation Library | Generic headline | Minor |
| Claims / Marketing | 'Every engineering team building microservices needs an internal observability library... Unlocks platform engineering and SRE roles' | Career unlocking marketing claims | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing Go scaffolding and mock collector stubs | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Go runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b49_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local loopback gRPC at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Middleware overhead (< 0.25ms), export throughput (>= 15,000 spans/sec), and memory cap (< 35MB) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory mock collector running as a background goroutine without external network dependencies.",
  "Can test data be created in minutes?": "YES. Synthetic span generator and automated Go benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: distributed database storage backends and kernel hypervisor introspection.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 passes dynamic traceparent and asserts correlated child span emission.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b49_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved in-process tail-based sampling and database driver wrapping to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic SDK metrics (tracer latency overhead, OTLP export throughput, and memory residency during outages).
- Removed Banned Content: Removed career unlocking promotional claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic traceparent propagation test.
"""


# ==============================================================================
# 50. brief-offline-first-sync
# ==============================================================================
b50_data = {
  "id": "brief-offline-first-sync",
  "title": "Offline-First Local Synchronization Protocol with CRDTs, IndexedDB & Bidirectional WebSocket Streaming",
  "domain": "Full-Stack Web",
  "difficulty": "ADVANCED",
  "project_types": ["Full-stack web", "Distributed systems"],
  "problem": "Collaborative productivity applications relying on synchronous cloud API calls freeze or throw network errors during intermittent connectivity, causing lost user edits and frustrating conflict modals upon reconnection. Centralized lock-based synchronization fails when multiple users edit overlapping document sections while disconnected. This project builds a production-grade offline-first collaborative synchronization engine in TypeScript. The system persists local document state in browser IndexedDB, executes optimistic mutations with sub-12ms write latency, streams binary state updates over WebSockets using Conflict-Free Replicated Data Types (CRDTs), and automatically resolves concurrent cross-device editing conflicts deterministically in Node.js and PostgreSQL.",
  "use_cases": [
    {
      "title": "Mobile Field Operations Inspection & Work Order Sync",
      "first_sentence": "Utility maintenance crews operating in underground vaults without cellular signals need to update equipment checklists and assign work tickets.",
      "second_sentence": "The web app writes updates locally to IndexedDB, synchronizing conflict-free CRDT delta states over WebSockets once crew devices reconnect to base station networks."
    },
    {
      "title": "Multi-Author Collaborative Rich-Text Note Taking",
      "first_sentence": "Remote teams collaborating across distributed time zones frequently co-edit documents while offline during travel or flights.",
      "second_sentence": "The engine applies character-level CRDT operations locally, automatically converging document trees into identical states upon reconnection without overwriting peer edits."
    },
    {
      "title": "Retail Warehouse Point-of-Sale Inventory Management",
      "first_sentence": "Retail store cashiers processing checkout queues during sudden network provider disruptions cannot afford checkout register freezes.",
      "second_sentence": "The application records inventory decrements to local CRDT counter registers, guaranteeing deterministic eventual convergence across checkout lanes when network service restores."
    }
  ],
  "hard_parts": [
    "Designing state-based or delta-mutator CRDT data structures that guarantee strong eventual consistency across out-of-order networks",
    "Optimizing IndexedDB read and write transactions to achieve sub-12ms mutation persistence on mobile browser threads",
    "Managing WebSocket connection reconnection state machines with exponential backoff and delta-vector catch-up exchanges",
    "Compacting and garbage-collecting tombstone records in CRDT history logs to prevent unbounded storage bloat in PostgreSQL"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating the IndexedDB storage adapter, CRDT math algorithms, and WebSocket network synchronizers",
    "Multi-client concurrent chaos test suite verifying 100% state convergence across 50 simulated conflicting editing operations",
    "Anti-fake verification script simulating two offline clients editing the exact same property simultaneously and verifying conflict-free convergence upon reconnection"
  ],
  "job_families": [
    "Frontend Systems Architect",
    "Distributed Systems Developer",
    "Full-Stack Web Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language shared across client-side CRDT models and backend synchronization logic"},
    {"tool": "IndexedDB", "role": "browser client-side persistent storage engine maintaining local document states and mutation logs"},
    {"tool": "CRDTs", "role": "mathematical conflict-free data structures guaranteeing deterministic eventual consistency across peers"},
    {"tool": "WebSockets", "role": "bi-directional streaming transport transmitting binary CRDT state vectors and document deltas"},
    {"tool": "Node.js", "role": "runtime hosting the central synchronization server, room coordinator, and persistence relays"},
    {"tool": "PostgreSQL", "role": "relational database storing authoritative document snapshots and append-only CRDT update logs"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Local IndexedDB Storage Engine & Mutation Log",
        "tools_used": ["TypeScript", "IndexedDB"],
        "purpose": "Stores local document states, records uncommitted mutations, and supports fast transactional lookups"
      },
      {
        "name": "CRDT Conflict-Free State Vector Engine",
        "tools_used": ["TypeScript", "CRDTs"],
        "purpose": "Implements State-based LWW-Element-Set and text sequence CRDTs guaranteeing deterministic convergence"
      },
      {
        "name": "WebSocket Delta Synchronization Manager",
        "tools_used": ["TypeScript", "WebSockets"],
        "purpose": "Manages client-server streaming connections, exchanges state vectors, and streams missing delta updates"
      },
      {
        "name": "Node.js Central Relay & Room Coordinator",
        "tools_used": ["Node.js", "WebSockets"],
        "purpose": "Broadcasts validated CRDT updates to peer clients in active document rooms and routes persistence transactions"
      },
      {
        "name": "PostgreSQL Authoritative Snapshot Store",
        "tools_used": ["Node.js", "PostgreSQL"],
        "purpose": "Persists compacted document states and logs immutable CRDT transaction records for recovery"
      },
      {
        "name": "Concurrent Chaos Editing & Convergence Benchmark Suite",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Simulates 50 concurrent offline editing clients and verifies mathematical state equality across all nodes"
      },
      {
        "name": "CRDT Protocol Guide & Sync Architecture Diagram",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Documents state vector exchanges, tombstone compaction strategies, and offline network state machines"
      }
    ],
    "data_flow": "The user edits a document field; the client CRDT engine applies the change to memory and writes the mutation to IndexedDB in < 12ms; the UI updates optimistically; the sync manager checks WebSocket connection status; if online, the client computes a state vector delta and streams it over WebSockets; the Node.js server validates the message, writes it to PostgreSQL, and broadcasts the update to peers in the same room; receiving peers apply the delta to their local CRDT stores and write to IndexedDB; if offline, mutations queue locally in IndexedDB; upon reconnecting, the client and server exchange state vectors and synchronize missing deltas.",
    "enforcement_mechanism": "Mathematically commutative and associative CRDT merge functions eliminating merge order dependencies; vector clocks tracking causality."
  },
  "targets": [
    {
      "metric": "Local IndexedDB Mutation Persistence Latency",
      "method": "Wall-clock timing from client edit event dispatch to completed IndexedDB transaction commit",
      "input": "1,000 sequential document mutations executed in browser runtime",
      "environment": "Standard 4-core local CPU with headless Chromium browser automation",
      "minimum_pass": "p95 local mutation persistence latency is < 15.0 milliseconds",
      "target": "p95 local mutation persistence latency is < 6.5 milliseconds",
      "report": "IndexedDB local write latency benchmark profiling log"
    },
    {
      "metric": "Online Cross-Client Synchronization Convergence Latency",
      "method": "Duration from peer A mutation dispatch over WebSocket to peer B DOM update rendering across simulated local network",
      "input": "500 document editing events streamed across 2 active connected browser clients",
      "environment": "Local Node.js WebSocket server and 2 automated browser worker sessions",
      "minimum_pass": "p95 cross-client synchronization latency is < 180 milliseconds",
      "target": "p95 cross-client synchronization latency is < 65 milliseconds",
      "report": "WebSocket sync latency summary report and distribution table"
    },
    {
      "metric": "Concurrent Conflict Resolution Convergence Rate",
      "method": "Percentage of simulated multi-client concurrent editing trials resulting in mathematically identical document state",
      "input": "50 concurrent conflict trials where 5 simulated clients edit overlapping document properties while partitioned",
      "environment": "Automated Node.js CRDT chaos test runner simulating network partitions and out-of-order packet delivery",
      "minimum_pass": "50 of 50 conflict trials achieve identical converged state across each of 5 clients",
      "target": "50 of 50 conflict trials achieve identical converged state across each of 5 clients",
      "report": "CRDT convergence audit log and mathematical parity report"
    }
  ],
  "skills": ["TypeScript", "IndexedDB", "CRDTs", "WebSockets", "Node.js", "PostgreSQL", "Full-Stack Web", "Distributed Systems"],
  "starter_input": {
    "spec": "Directory containing client-side TypeScript document editor scaffolding, IndexedDB wrapper, Node.js sync server, and test suites.",
    "size": "15 TypeScript source modules, 4 HTML test fixture pages, and automated multi-client chaos test scripts",
    "seeded_cases": "Simultaneous property updates with conflicting timestamps, out-of-order WebSocket frames, and mid-sync disconnects",
    "label_source": "Deterministic CRDT mathematical state invariants and automated JSON document equality assertions",
    "personal_data_policy": "Strictly mock synthetic collaborative notes and simulated work order checklists; no real personal data used"
  },
  "components": [
    {"name": "Local IndexedDB Storage Engine & Mutation Log", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "CRDT Conflict-Free State Vector Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "WebSocket Delta Synchronization Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Node.js Central Relay & Room Coordinator", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "PostgreSQL Authoritative Snapshot Store", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Concurrent Chaos Editing & Convergence Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "CRDT Protocol Guide & Sync Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "End-to-end encryption (E2EE) using Web Crypto API encrypting CRDT updates before server transmission",
      "Awareness and presence protocol broadcasting peer mouse cursor coordinates and selection ranges",
      "Automated tombstone compaction running epoch-based garbage collection to reduce database storage"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Local IndexedDB Storage & CRDT Math Engine in TypeScript and IndexedDB",
      "hours": 10,
      "done_criterion": "CRDT merges commutative updates; IndexedDB commits local mutations in < 15ms."
    },
    {
      "name": "WebSocket Delta Sync & Room Coordinator in WebSockets, Node.js and CRDTs",
      "hours": 10,
      "done_criterion": "WebSocket relays delta vectors; 2 clients sync updates in < 180ms."
    },
    {
      "name": "PostgreSQL Persistence & Multi-Client Chaos Suite in PostgreSQL and Distributed Systems",
      "hours": 10,
      "done_criterion": "Server persists snapshots; chaos suite achieves convergence across 50 of 50 trials."
    },
    {
      "name": "Latency Benchmarking, Anti-Fake Test & Docs in Full-Stack Web",
      "hours": 10,
      "done_criterion": "Benchmark verifies write latency; anti-fake test validates offline convergence; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, asynchronous browser programming, and IndexedDB transactional semantics",
    "Understanding of distributed consistency models, vector clocks, and Conflict-Free Replicated Data Types"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound JavaScript execution and web serving)",
    "cost": "$0 (fully open-source software stack using Node.js and local PostgreSQL)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+, Docker Desktop (PostgreSQL container), and Chromium installed",
    "fallback_path": "In-memory mock database and mock WebSocket loopback if PostgreSQL or Docker is unavailable"
  },
  "riskiest_component": {
    "name": "Unbounded Memory and Storage Bloat from Cumulative CRDT Tombstones",
    "mitigation": "Implement periodic snapshot checkpoints where the authoritative document state consolidates and prunes history.",
    "fallback": "State-based LWW-Element-Set with bounded history truncation."
  },
  "deliverables": [
    "Git repository containing client-side CRDT engine, IndexedDB adapters, Node.js sync server, and PostgreSQL schemas",
    "Interactive collaborative web demo allowing two browser windows to co-edit notes with network simulation controls",
    "Automated chaos test suite simulating network partitions, packet drops, and concurrent editing conflicts",
    "Screener verification script validating offline mutation queuing and dynamic conflict convergence in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial cloud document storage infrastructure billing (S3 / Google Cloud Storage)",
    "Native iOS/Android Swift/Kotlin native bindings outside standard browser web APIs",
    "Complex WYSIWYG document layout rendering (pagination, tables, margins)"
  ],
  "safety_note": None,
  "resources": [
    "A Comprehensive Study of Convergent and Commutative Replicated Data Types (Shapiro et al.)",
    "MDN Web Docs: Working with IndexedDB and Transactional Key-Value Stores",
    "Yjs / Automerge Architecture and Binary CRDT Encoding Manuals"
  ],
  "rubric": [
    {
      "input": "1,000 sequential document mutations executed in browser IndexedDB",
      "action": "npm run test:indexeddb -- --mutations 1000",
      "expected_result": "IndexedDB adapter persists mutations with p95 write latency < 15.0 milliseconds",
      "evidence_location": "Terminal test execution output log and reports/indexeddb_latency.json",
      "pass_criterion": "p95 write latency < 15.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 document editing events streamed across 2 active connected browser clients",
      "action": "npm run test:sync_latency -- --events 500",
      "expected_result": "WebSocket delta sync delivers updates across peers with p95 latency < 180 milliseconds",
      "evidence_location": "Synchronization timing report in reports/sync_summary.json",
      "pass_criterion": "p95 sync latency < 180ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 concurrent conflict trials simulating 5 partitioned clients editing overlapping properties",
      "action": "npm run test:chaos_convergence -- --trials 50 --clients 5",
      "expected_result": "All 50 trials achieve identical converged JSON document states across all 5 clients upon reconnection",
      "evidence_location": "Convergence audit report in reports/crdt_convergence.json",
      "pass_criterion": "50 of 50 trials converge to identical state with exit code 0",
      "kind": "normal"
    },
    {
      "input": "WebSocket request querying document room state snapshot",
      "action": "node scripts/query_room_state.js --room-id doc_test_42",
      "expected_result": "Server returns serialized state vector and document JSON containing valid vector clock",
      "evidence_location": "Room state inspection output",
      "pass_criterion": "Response status confirms synchronized state with non-empty clock metadata",
      "kind": "normal"
    },
    {
      "input": "Simultaneous offline conflicting property updates from client A ('Title Alpha') and client B ('Title Beta')",
      "action": "node scripts/verify_dynamic_conflict.js --doc doc_dyn_99",
      "expected_result": "Both clients update locally offline, connect to server, and converge to identical title deterministically",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Both clients report identical title value and exit code is 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected collaborative offline-first synchronization protocol in TypeScript with IndexedDB and WebSockets; achieved sub-[WRITE_LATENCY] millisecond local write latency, and resolved concurrent document conflicts across [CONFLICT_COUNT] simulated editing trials.",
    "claims": [
      {
        "text": "achieved sub-[WRITE_LATENCY] millisecond local write latency",
        "rubric_indexes": [0]
      },
      {
        "text": "resolved concurrent document conflicts across [CONFLICT_COUNT] simulated editing trials",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "native mobile Swift or Kotlin platform compilation or commercial cloud storage billing infrastructure"
  },
  "verify": [
    "Run `npm test` across client and server packages to verify CRDT merge math and IndexedDB persistence pass.",
    "Execute `npm run test:chaos_convergence` to verify that 50 of 50 concurrent editing trials achieve identical converged state.",
    "Run `node scripts/verify_dynamic_conflict.js` to assert deterministic conflict resolution across disconnected peers."
  ],
  "worksheet": {
    "q1": "Core deliverable: an offline-first collaborative synchronization platform in TypeScript with CRDTs, IndexedDB, WebSockets, and PostgreSQL.",
    "q2": "Target users: frontend systems architects, distributed systems developers, and full-stack web engineers.",
    "q3": "3 use cases: field technician offline inspections, multi-author note taking, and warehouse point-of-sale inventory tracking.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: CRDT commutative state-based vector design, sub-12ms IndexedDB persistence on mobile web threads, WebSocket reconnection state machines, and tombstone compaction.",
    "q6": "Starter input: TypeScript editor scaffolding, IndexedDB wrapper, Node.js sync server, and chaos test suites. Synthetic document data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory mock storage.",
    "q8": "Riskiest component: storage bloat from tombstones. Fallback: periodic snapshot checkpointing and LWW-Element-Set truncation.",
    "q9": "Potential faking: mock sync flags without real CRDTs. Anti-fake check 5 simulates 2 partitioned clients editing same property, verifies identical convergence.",
    "q10": "Safety/ethics: Safe; simulated collaborative documents and synthetic test payloads only, zero private user data."
  }
}

b50_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Offline-First Mobile & Web Local-Sync Protocol | Generic headline | Minor |
| Claims / Marketing | 'Notion, Linear, and Figma are the gold standard... Every modern productivity app is moving to offline-first in 2025' | Named commercial consumer apps as promotional marketing | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing editor scaffolding and multi-client test fixtures | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No IndexedDB/Node.js specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b50_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Node.js 18+ and Chromium at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. IndexedDB write latency (< 15.0ms), sync latency (< 180ms), and conflict convergence (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory mock database and mock WebSocket loopback if PostgreSQL or Docker is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic collaborative notes and automated multi-client chaos test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: native mobile Swift/Kotlin code and commercial cloud storage billing.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 simulates two partitioned clients updating the same property and verifies convergence.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b50_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved E2EE Web Crypto encryption and awareness presence protocols to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic offline sync metrics (IndexedDB write latency, WebSocket sync latency, and conflict resolution convergence rate).
- Removed Banned Content: Removed marketing references to Notion, Linear, and Figma.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic concurrent editing test.
"""


# ==============================================================================
# 51. brief-opentelemetry-observability
# ==============================================================================
b51_data = {
  "id": "brief-opentelemetry-observability",
  "title": "High-Throughput Distributed Tracing & APM Platform in Go with ClickHouse Columnar Storage & Grafana Flamegraphs",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems programming", "Platform/infra tool"],
  "problem": "Commercial Application Performance Monitoring (APM) SaaS platforms charge exorbitant rates for high-volume distributed trace ingestion, forcing engineering teams to drop trace fidelity or pay unpredictable bills. Ingesting millions of OpenTelemetry spans into relational or document databases causes severe disk write saturation and sluggish multi-hop trace retrieval queries. This project builds a production-grade distributed tracing and APM platform in Go and ClickHouse. The system ingests OpenTelemetry (OTLP) traces over gRPC and HTTP, stores span hierarchies in optimized ClickHouse columnar tables, implements tail-based sampling to retain error traces while filtering routine telemetry, and exposes query APIs powering interactive trace flamegraphs in Grafana.",
  "use_cases": [
    {
      "title": "Microservice Distributed Bottleneck Diagnosis",
      "first_sentence": "Platform engineering teams maintaining hundreds of microservices need to pinpoint the exact downstream RPC service causing latency spikes in user-facing checkout flows.",
      "second_sentence": "The platform aggregates distributed trace spans across services, rendering end-to-end waterfall flamegraphs in Grafana that highlight slow database queries and queuing delays."
    },
    {
      "title": "Automated Error Trace Retention & Anomaly Filtering",
      "first_sentence": "Site reliability engineers require 100% capture of failed transactions and exceptions without drowning in gigabytes of mundane health check telemetry.",
      "second_sentence": "The engine applies tail-based sampling rules, retaining all spans associated with HTTP 5xx errors or exceptions while sampling down healthy traces to sustainable storage volumes."
    },
    {
      "title": "SLA & SLO Service Latency Percentile Compliance Auditing",
      "first_sentence": "Cloud infrastructure architects must audit third-party API service level agreements by calculating p95 and p99 latency percentiles across millions of daily API transactions.",
      "second_sentence": "The ClickHouse columnar engine executes analytical aggregation queries across billions of spans in milliseconds, generating real-time SLO latency compliance reports."
    }
  ],
  "hard_parts": [
    "Designing high-throughput ClickHouse columnar table schemas with optimal sorting keys (ServiceName, StartTime, TraceId) for sub-second span queries",
    "Implementing tail-based sampling buffers in Go that hold trace spans in memory until trace completion before deciding retention",
    "Streaming OTLP binary protobuf payloads over gRPC with high-concurrency worker pools and batched database inserts",
    "Constructing parent-child tree reconstruction algorithms that assemble distributed span waterfall graphs from out-of-order span chunks"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating OTLP ingestion receivers, tail-based sampling buffers, and ClickHouse repository layers",
    "High-throughput benchmark report validating 25,000+ spans per second sustained ingestion into ClickHouse with sub-45ms trace retrieval",
    "Anti-fake verification script emitting a synthetic distributed trace with a novel span attribute and asserting the complete tree is reconstructible via API"
  ],
  "job_families": [
    "Observability Platform Engineer",
    "Infrastructure & SRE Architect",
    "Distributed Systems Software Engineer"
  ],
  "stack": [
    {"tool": "OpenTelemetry", "role": "telemetry data standard defining trace, span, and resource attribute formats"},
    {"tool": "Go", "role": "primary systems language implementing the ingestion receiver, sampling engine, and query API"},
    {"tool": "ClickHouse", "role": "high-performance columnar database storing compressed trace spans and powering fast analytical aggregations"},
    {"tool": "Grafana", "role": "visualization platform rendering distributed trace flamegraphs and APM performance dashboards"},
    {"tool": "Docker", "role": "containerization engine orchestrating local ClickHouse, Grafana, and test microservice containers"}
  ],
  "architecture": {
    "components": [
      {
        "name": "OTLP Ingestion Receiver (gRPC & HTTP)",
        "tools_used": ["Go", "OpenTelemetry"],
        "purpose": "Terminates standard OpenTelemetry protocol connections, decodes protobuf spans, and routes to sampling buffers"
      },
      {
        "name": "Tail-Based Sampling & Anomaly Buffer Engine",
        "tools_used": ["Go"],
        "purpose": "Buffers in-flight trace spans, evaluates error statuses, and filters traces according to defined sampling policies"
      },
      {
        "name": "ClickHouse Columnar Trace Persistence Layer",
        "tools_used": ["ClickHouse", "Go"],
        "purpose": "Batches span insertions using native ClickHouse client with ZSTD compression and optimized partitioning"
      },
      {
        "name": "Trace Query API & Flamegraph Assembler",
        "tools_used": ["Go", "ClickHouse"],
        "purpose": "Executes trace lookup queries, reconstructs parent-child span trees, and formats payloads for Grafana"
      },
      {
        "name": "Ingestion Throughput & Query Latency Benchmark Harness",
        "tools_used": ["Go", "Docker"],
        "purpose": "Measures sustained span ingestion throughput, database write latencies, and trace query lookup speeds"
      },
      {
        "name": "Observability & APM Architecture Guide & Grafana Dashboard Manual",
        "tools_used": ["Grafana"],
        "purpose": "Documents Observability ClickHouse schema design, sampling configuration strategies, and Grafana data source setup"
      }
    ],
    "data_flow": "Microservices emit OTLP trace spans over gRPC to the Go receiver; the receiver pushes spans into the tail-based sampling engine; the sampling engine buffers spans for a temporal window (e.g. 5 seconds) to observe the complete trace lifecycle; if any span in the trace contains an error status or latency exceeding thresholds, the entire trace is marked for retention; accepted traces flush in batches of 5,000 spans to ClickHouse; the trace query API queries ClickHouse by TraceID, sorts spans by timestamp, resolves parent-child relationships, and serves the waterfall flamegraph payload to Grafana.",
    "enforcement_mechanism": "ClickHouse primary keys on (ServiceName, toStartOfHour(StartTime), TraceId) ensuring fast scan pruning; bounded buffer sizes preventing memory leaks."
  },
  "targets": [
    {
      "metric": "Sustained Span Ingestion Throughput",
      "method": "Publish throughput measured in spans per second ingested, sampled, and persisted to ClickHouse across 100,000 spans",
      "input": "100,000 synthetic OpenTelemetry trace spans generated across 10 concurrent microservice simulated callers",
      "environment": "Standard 4-core local CPU, ClickHouse 23+ in Docker, Go 1.21+ release binary",
      "minimum_pass": "Sustained span ingestion throughput is >= 25,000 spans per second",
      "target": "Sustained span ingestion throughput is >= 60,000 spans per second",
      "report": "ClickHouse ingestion throughput benchmark report and write latency table"
    },
    {
      "metric": "Distributed Trace Waterfall Query Latency",
      "method": "Wall-clock timing to query, reconstruct, and assemble a 10-span distributed trace tree by TraceID",
      "input": "100 benchmark TraceID queries issued against ClickHouse database containing 1,000,000 historical spans",
      "environment": "Standard 4-core local CPU, ClickHouse columnar store with memory cache",
      "minimum_pass": "p95 trace retrieval and assembly latency is < 45.0 milliseconds",
      "target": "p95 trace retrieval and assembly latency is < 16.0 milliseconds",
      "report": "Trace query response timing log and flamegraph assembly summary"
    },
    {
      "metric": "Tail-Based Error Trace Retention Rate",
      "method": "Percentage of traces containing HTTP 5xx errors or unhandled exceptions retained by sampling engine",
      "input": "1,000 synthetic traces where 100 traces contain error status codes mixed among 900 healthy traces under 10% sampling",
      "environment": "Tail-based sampling test harness in Go with simulated trace completion delays",
      "minimum_pass": "100 of 100 error traces successfully retained while healthy traces sample at target 10% rate",
      "target": "100 of 100 error traces successfully retained while healthy traces sample at target 10% rate",
      "report": "Tail-based sampling audit log and retention accuracy verification"
    }
  ],
  "skills": ["OpenTelemetry", "Go", "ClickHouse", "Grafana", "Docker", "Distributed Tracing", "Observability", "APM"],
  "starter_input": {
    "spec": "Directory of OpenTelemetry collector configuration YAMLs, ClickHouse trace schema DDLs, and synthetic microservice trace generators.",
    "size": "5 Go source packages, ClickHouse migration SQL scripts, and automated benchmark generator",
    "seeded_cases": "Out-of-order child spans arriving before root spans, trace buffer timeout expirations, and missing parent span references",
    "label_source": "Deterministic synthetic trace DAG manifests and ClickHouse system.parts storage verification",
    "personal_data_policy": "Strictly mock synthetic distributed trace attributes and simulated system metrics; no real personal data used"
  },
  "components": [
    {"name": "OTLP Ingestion Receiver (gRPC & HTTP)", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Tail-Based Sampling & Anomaly Buffer Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "ClickHouse Columnar Trace Persistence Layer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Trace Query API & Flamegraph Assembler", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Ingestion Throughput & Query Latency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic service dependency map generation aggregating span parent-child relationships into DAG topology matrices",
      "Automated latency anomaly detection using sliding percentile thresholds and alerting webhook triggers",
      "Integrated log correlation linking structured application logs to trace IDs using ClickHouse materialized views"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "OTLP Receiver & ClickHouse Trace Persistence in Go and ClickHouse",
      "hours": 7,
      "done_criterion": "Receiver accepts OTLP spans over gRPC; ClickHouse persists spans in columnar tables."
    },
    {
      "name": "Tail-Based Sampling Engine & Buffer Management in OpenTelemetry and APM",
      "hours": 7,
      "done_criterion": "Tail-based engine retains 100 of 100 error traces while sampling healthy traffic."
    },
    {
      "name": "Trace Query API & Grafana Flamegraph Visualizer in Grafana and Docker",
      "hours": 7,
      "done_criterion": "Query API assembles span trees in < 45ms; Grafana renders trace flamegraphs in Docker."
    },
    {
      "name": "High-Throughput Benchmarking, Anti-Fake Test & Docs in Distributed Tracing and Observability",
      "hours": 7,
      "done_criterion": "Benchmark confirms 25k spans/sec; anti-fake test validates dynamic trace DAG; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, concurrency, and database client interactions",
    "Understanding of OpenTelemetry specifications, columnar database architectures (ClickHouse), and distributed tracing"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and storage I/O bound database and systems software)",
    "cost": "$0 (fully open-source stack using Go, ClickHouse, and Grafana in Docker)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (ClickHouse 23+ and Grafana containers) and Go 1.21+",
    "fallback_path": "Local SQLite database or in-memory columnar slice store if ClickHouse container is unavailable"
  },
  "riskiest_component": {
    "name": "ClickHouse Write Amplification from Too-Frequent Small Batch Inserts",
    "mitigation": "Buffer incoming spans in Go memory and flush in atomic batches of 5,000 to 10,000 rows or every 1 second.",
    "fallback": "ClickHouse asynchronous inserts feature (async_insert=1) with in-database buffering."
  },
  "deliverables": [
    "Git repository containing Go APM ingestion service, ClickHouse DDL migrations, and query API",
    "Docker Compose environment orchestrating ClickHouse, Grafana with pre-configured OTLP data source, and APM receiver",
    "Automated load testing harness measuring ingestion throughput and trace query response latency",
    "Screener verification script executing automated benchmark and dynamic trace tree validation in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial multi-tenant billing metering infrastructure",
    "Proprietary APM byte-code runtime agent instrumentation authoring for JVM or .NET",
    "Physical hardware network switch sFlow packet capturing"
  ],
  "safety_note": None,
  "resources": [
    "ClickHouse Documentation: Columnar Data Storage and Optimizing Large Ingestions",
    "OpenTelemetry Tracing Data Model and Semantic Conventions Manual",
    "Grafana Tracing Datasource: Jaeger and Zipkin Compatible Protocol Guide"
  ],
  "rubric": [
    {
      "input": "100,000 synthetic OpenTelemetry trace spans published to ingestion receiver",
      "action": "go run ./cmd/benchmarker --spans 100000 --batch-size 5000",
      "expected_result": "System sustains ingestion throughput >= 25,000 spans per second into ClickHouse",
      "evidence_location": "Terminal execution output log and reports/ingestion_benchmark.json",
      "pass_criterion": "Ingestion throughput >= 25,000 spans/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 benchmark TraceID lookup queries issued against 1,000,000 span database",
      "action": "go run ./cmd/bench_query --queries 100",
      "expected_result": "Trace query API retrieves and reconstructs complete span trees with p95 latency < 45.0 milliseconds",
      "evidence_location": "Query latency benchmark profiling report",
      "pass_criterion": "p95 query latency is < 45.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 synthetic traces containing 100 error traces under tail-based sampling",
      "action": "go test -v ./sampler/... -run TestTailBasedSampling",
      "expected_result": "Sampling engine retains 100 of 100 error traces while sampling healthy traces at target 10% rate",
      "evidence_location": "Sampling audit report in reports/sampling_audit.json",
      "pass_criterion": "100 of 100 error traces retained with exit code 0",
      "kind": "normal"
    },
    {
      "input": "REST request querying trace details by TraceID",
      "action": "curl http://localhost:8080/api/v1/traces/trace_test_4892",
      "expected_result": "Server returns structured JSON payload containing ordered spans with parent_span_id relationships",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and JSON contains non-empty spans array with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic synthetic trace with novel attribute 'tenant_id=dyn_client_991' and injected error status emitted at runtime",
      "action": "go run ./scripts/verify_dynamic_trace.go --attribute 'tenant_id=dyn_client_991' --error",
      "expected_result": "Sampling engine retains trace; ClickHouse query confirms complete trace DAG with error flag persisted",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Trace verified in ClickHouse with attribute 'tenant_id=dyn_client_991' and status=ERROR with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed tracing storage and APM engine in Go using ClickHouse and OpenTelemetry; achieved sub-[QUERY_LATENCY] millisecond trace retrieval latency, and sustained [INGESTION_THROUGHPUT] spans per second ingestion throughput.",
    "claims": [
      {
        "text": "achieved sub-[QUERY_LATENCY] millisecond trace retrieval latency",
        "rubric_indexes": [1]
      },
      {
        "text": "sustained [INGESTION_THROUGHPUT] spans per second ingestion throughput",
        "rubric_indexes": [0]
      }
    ],
    "do_not_claim": "commercial multi-tenant SaaS billing metering or proprietary JVM byte-code runtime instrumentation"
  },
  "verify": [
    "Run `go test -v ./...` to verify OTLP decoding, sampling logic, and ClickHouse persistence pass.",
    "Execute `go run ./cmd/benchmarker` to verify span ingestion throughput meets the 25k spans/sec benchmark.",
    "Run `go run ./scripts/verify_dynamic_trace.go` to assert dynamic trace tree ingestion and error status retention."
  ],
  "worksheet": {
    "q1": "Core deliverable: a distributed tracing storage and APM engine in Go with ClickHouse columnar tables, tail-based sampling, and Grafana flamegraphs.",
    "q2": "Target users: observability platform engineers, infrastructure architects, and SRE specialists.",
    "q3": "3 use cases: microservice bottleneck diagnosis, automated error trace retention, and SLA/SLO latency compliance auditing.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: ClickHouse table schema indexing for span lookups, tail-based sampling buffering without memory exhaustion, gRPC OTLP batching, and span parent-child reconstruction.",
    "q6": "Starter input: OpenTelemetry collector configs, ClickHouse DDL schemas, and synthetic trace generators. Synthetic telemetry only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local SQLite or in-memory columnar slice store.",
    "q8": "Riskiest component: ClickHouse write amplification from small batches. Fallback: Go memory buffering and atomic 5,000-row flushes.",
    "q9": "Potential faking: mock hardcoded trace arrays. Anti-fake check 5 emits dynamic trace with unique attribute and error status, asserts ClickHouse query returns exact DAG.",
    "q10": "Safety/ethics: Safe; local loopback Docker containers and synthetic telemetry only, zero production infrastructure exposure."
  }
}

b51_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Full-Stack Distributed Tracing & APM Platform | Generic headline | Minor |
| Claims / Marketing | 'Datadog, New Relic, and Dynatrace are multi-billion-dollar companies...' | Named commercial SaaS observability vendors as promotional hooks | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing OpenTelemetry collector configs and ClickHouse schemas | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No ClickHouse or Go runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b51_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go, ClickHouse in Docker, and Grafana at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Ingestion throughput (>= 25,000 spans/sec), query latency (< 45.0ms), and error retention (100 of 100) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local SQLite or in-memory columnar slice store if ClickHouse container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic 100,000-span generator and automated benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial SaaS billing metering and proprietary JVM agent instrumentation.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 emits dynamic trace with unique attribute and asserts verified retrieval in ClickHouse.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 1 and 0."
}

b51_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved service dependency DAG mapping and log correlation to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic distributed tracing metrics (span ingestion throughput, ClickHouse query latency, and tail-based error retention).
- Removed Banned Content: Removed marketing references to Datadog, New Relic, and Dynatrace.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic trace emission test.
"""


# ==============================================================================
# 52. brief-osint-data-platform
# ==============================================================================
b52_data = {
  "id": "brief-osint-data-platform",
  "title": "Distributed Web Intelligence Crawling & Change Detection Platform with Playwright, Celery & Redis Bloom Filters",
  "domain": "Data Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Data pipeline / ETL", "API/backend service"],
  "problem": "Manual competitive market monitoring is error-prone, unscalable, and blind to dynamic client-side DOM mutations. Naive HTTP scrapers fail completely on modern Single Page Applications (SPAs) that require JavaScript execution, trigger immediate IP bans due to uncoordinated request rates, and repeatedly re-crawl identical URLs wasting network bandwidth. This project builds a distributed web intelligence crawling and change detection platform in Python. The system coordinates headless browser scraping using Playwright and Celery worker queues, prevents duplicate URL crawls using Redis Bloom filters, stores structured page entity snapshots in PostgreSQL, computes content and structural DOM diffs, and sends automated webhook alerts upon detecting significant changes.",
  "use_cases": [
    {
      "title": "E-Commerce Competitor Price & Stock Monitoring",
      "first_sentence": "Retail pricing intelligence teams need to monitor thousands of competitor product listings daily to adjust promotional pricing dynamically.",
      "second_sentence": "The crawler executes headless browser sessions, extracts live pricing and stock availability from dynamic JavaScript storefronts, and flags price changes in PostgreSQL."
    },
    {
      "title": "Technology Job Market Skill Trend Intelligence",
      "first_sentence": "Workforce planning analysts require structured insights into evolving technical requirements across corporate career portals and job boards.",
      "second_sentence": "The platform schedules periodic crawls of designated employer domains, parses required engineering competencies, and aggregates monthly technology demand trends."
    },
    {
      "title": "Corporate Regulatory Disclosure & Policy Tracking",
      "first_sentence": "Compliance auditing teams must track updates across governmental regulatory portal announcements and corporate privacy policy terms.",
      "second_sentence": "The engine computes structural semantic diffs across crawled policy page snapshots, dispatching immediate notification summaries when legal clauses are revised."
    }
  ],
  "hard_parts": [
    "Orchestrating headless Playwright browser contexts in Celery worker processes with strict memory recycling to prevent browser zombie leaks",
    "Implementing scalable URL deduplication using space-efficient Redis Bloom filters across millions of discovered web hyperlinks",
    "Designing semantic DOM diffing algorithms that ignore dynamic ad trackers and timestamps while accurately detecting substantive text/price changes",
    "Enforcing per-domain rate limiting and polite crawl delays with exponential backoff to avoid IP blocks"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating crawler task queues, Playwright browser managers, Bloom filter utilities, and diff engines",
    "Automated load benchmark report verifying 120+ pages per minute extraction throughput across headless JavaScript workers",
    "Anti-fake verification script dynamically modifying a target mock SPA product price and verifying the platform detects the delta and emits a change event"
  ],
  "job_families": [
    "Data Pipeline Engineer",
    "Web Scraping & Intelligence Specialist",
    "Backend Infrastructure Developer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing Celery worker tasks, Playwright scripts, and diffing engines"},
    {"tool": "Playwright", "role": "browser automation library rendering client-side JavaScript Single Page Applications"},
    {"tool": "PostgreSQL", "role": "relational database storing structured product snapshots, crawl histories, and change logs"},
    {"tool": "FastAPI", "role": "REST API framework exposing crawl job dispatch, target registration, and diff query endpoints"},
    {"tool": "Celery", "role": "distributed task queue coordinating asynchronous crawling workers across concurrency pools"},
    {"tool": "Redis", "role": "in-memory message broker and Bloom filter store tracking visited URLs and worker job states"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Target URL Ingestion & Crawl Scheduler API",
        "tools_used": ["FastAPI", "Python"],
        "purpose": "Registers target domain crawl schedules, manages priority queues, and exposes extraction query endpoints"
      },
      {
        "name": "Redis Bloom Filter URL Deduplicator",
        "tools_used": ["Python", "Redis"],
        "purpose": "Maintains space-efficient probabilistic set of visited URLs with sub-millisecond lookup and low false-positive rate"
      },
      {
        "name": "Headless Playwright Browser Worker Pool",
        "tools_used": ["Python", "Playwright", "Celery"],
        "purpose": "Spawns isolated Chromium contexts, waits for selector hydration, and extracts structured DOM elements"
      },
      {
        "name": "Content Hashing & Semantic DOM Diff Engine",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Calculates content hashes, identifies structural deltas against prior snapshots, and flags significant revisions"
      },
      {
        "name": "Crawl Throughput & Deduplication Benchmark Suite",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Measures pages crawled per minute, verifies Bloom filter suppression, and tests webhook alert timings"
      }
    ],
    "data_flow": "Users register target URLs via the FastAPI endpoint; the scheduler checks the Redis Bloom filter; if the URL has not been crawled in the current cycle, a task dispatches to the Celery queue; a Celery worker launches a Playwright Chromium context, navigates to the target page, waits for network idle, and extracts structured JSON attributes; the worker writes the raw snapshot to PostgreSQL; the diff engine computes a SHA-256 hash and compares with the previous crawl; if changes are detected, a semantic diff generates and triggers a notification webhook.",
    "enforcement_mechanism": "Redis Bloom filter capacity checks preventing duplicate crawl dispatches; Playwright navigation timeout limits (max 15s) killing hung browser contexts."
  },
  "targets": [
    {
      "metric": "Dynamic JavaScript Page Extraction Throughput",
      "method": "Sustained number of complex JavaScript-rendered web pages fully rendered, scraped, and persisted per minute across 4 workers",
      "input": "500 target SPA product pages served by local mock React storefront with client-side hydration delays",
      "environment": "Standard 4-core local CPU, 8GB RAM, 4 concurrent Celery worker processes with Playwright Chromium",
      "minimum_pass": "Crawling extraction throughput is >= 120 pages per minute",
      "target": "Crawling extraction throughput is >= 280 pages per minute",
      "report": "Crawl throughput benchmark profiling report and worker timing log"
    },
    {
      "metric": "Redis Bloom Filter URL Deduplication Accuracy",
      "method": "Percentage of duplicate URL crawl requests correctly identified and suppressed by the Bloom filter",
      "input": "5,000 crawl requests containing 1,000 distinct URLs repeated 5 times across randomized queue submissions",
      "environment": "Local Redis 7 container with redis-bloom module or pybloom_live Python library",
      "minimum_pass": "Deduplication accuracy is >= 99.0% with false positive suppression < 1.0%",
      "target": "Deduplication accuracy is >= 99.8% with false positive suppression < 0.2%",
      "report": "Bloom filter deduplication audit log and false positive analysis"
    },
    {
      "metric": "Change Detection Webhook Notification Latency",
      "method": "Duration from target page DOM mutation detection to outgoing alert webhook dispatch",
      "input": "20 simulated product price update events injected into target mock web application",
      "environment": "FastAPI change detection engine connected to local mock webhook receiver",
      "minimum_pass": "Average notification dispatch latency is < 10.0 seconds across 20 trials",
      "target": "Average notification dispatch latency is < 3.2 seconds across 20 trials",
      "report": "Change detection timing summary table and webhook audit report"
    }
  ],
  "skills": ["Python", "Playwright", "PostgreSQL", "FastAPI", "Celery", "Redis", "Data Pipelines", "Web Scraping"],
  "starter_input": {
    "spec": "Directory containing mock e-commerce SPA target web application, Celery worker configurations, and 500 test URL seed manifests.",
    "size": "Mock React SPA codebase, 5 Celery task modules, and automated crawl runner scripts",
    "seeded_cases": "Infinite scrolling product lists, anti-bot Cloudflare challenge mock pages, fluctuating dynamic pricing, and unparseable DOM nodes",
    "label_source": "Deterministic mock SPA database records and pre-calculated ground-truth product price catalogs",
    "personal_data_policy": "Strictly mock synthetic e-commerce storefront listings and simulated product prices; no real personal data used"
  },
  "components": [
    {"name": "Target URL Ingestion & Crawl Scheduler API", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Redis Bloom Filter URL Deduplicator", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Headless Playwright Browser Worker Pool", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "Content Hashing & Semantic DOM Diff Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Crawl Throughput & Deduplication Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic rotating proxy pool integration with automated ban detection and IP pool health scoring",
      "Automated CAPTCHA detection and solving workflow integration using vision models or mock solver stubs",
      "Visual regression screenshot diffing using pixel-level perceptual hashing (SSIM / perceptual hash)"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Target Ingestion API & Redis Bloom Filter in Python, FastAPI and Redis",
      "hours": 7,
      "done_criterion": "FastAPI registers crawl targets; Redis Bloom filter deduplicates 5,000 URLs with > 99% accuracy."
    },
    {
      "name": "Headless Playwright Crawling Workers in Playwright, Celery and Web Scraping",
      "hours": 7,
      "done_criterion": "Celery workers scrape dynamic React SPAs at >= 120 pages/min without zombie memory leaks."
    },
    {
      "name": "DOM Semantic Diffing & Change Webhooks in PostgreSQL and Data Pipelines",
      "hours": 7,
      "done_criterion": "Diff engine detects price updates and dispatches alerts in < 10 seconds."
    },
    {
      "name": "Throughput Benchmarking, Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark verifies crawl throughput; anti-fake test validates dynamic price change; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, asynchronous task queues (Celery/RabbitMQ/Redis), and SQL databases",
    "Understanding of browser automation (Playwright/Puppeteer), DOM manipulation, and HTTP scraping ethics"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound web scraping and data processing)",
    "cost": "$0 (fully open-source stack using local mock SPA and Docker containers)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or proxy subscriptions required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Redis, PostgreSQL containers), Python 3.11, and Playwright Chromium",
    "fallback_path": "Local static HTML file scraping with BeautifulSoup if Playwright browser dependencies fail to install"
  },
  "riskiest_component": {
    "name": "Browser Process Zombie Leaks and Memory Exhaustion in Celery Workers",
    "mitigation": "Configure Celery worker_max_tasks_per_child (e.g. 50 tasks) to recycle worker processes and close browser contexts explicitly in finally blocks.",
    "fallback": "Run browser contexts inside lightweight ephemeral Docker containers."
  },
  "deliverables": [
    "Git repository containing Celery crawler tasks, Playwright scraping modules, and diffing engines",
    "Local mock React e-commerce application serving dynamic pages for reproducible testing",
    "Automated load testing harness measuring crawling throughput and deduplication accuracy",
    "Screener verification script executing automated benchmark and dynamic price change alert in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial paid residential proxy network subscription management",
    "Illegitimate circumvention of authenticated paywalls or copyrighted content extraction",
    "Real-time high-frequency financial exchange order routing"
  ],
  "safety_note": None,
  "resources": [
    "Playwright for Python Documentation: Browser Contexts and Page Automation",
    "Celery Distributed Task Queue Architecture and Worker Memory Management Manual",
    "RedisBloom: Probabilistic Data Structures and Bloom Filter Implementation Guide"
  ],
  "rubric": [
    {
      "input": "500 target SPA product pages rendered by local mock React application",
      "action": "python -m crawler.benchmark_throughput --pages 500 --workers 4",
      "expected_result": "Celery workers scrape and persist pages with throughput >= 120 pages per minute",
      "evidence_location": "Terminal execution output log and reports/crawl_throughput.json",
      "pass_criterion": "Extraction throughput >= 120 pages/min with exit code 0",
      "kind": "normal"
    },
    {
      "input": "5,000 crawl requests containing 1,000 distinct URLs repeated 5 times",
      "action": "python -m crawler.test_bloom_filter --total 5000 --distinct 1000",
      "expected_result": "Bloom filter suppresses duplicate URLs with deduplication accuracy >= 99.0%",
      "evidence_location": "Deduplication audit report in reports/bloom_audit.json",
      "pass_criterion": "Deduplication accuracy >= 99.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 simulated product price update events injected into mock web store",
      "action": "python scripts/test_change_alerts.py --trials 20",
      "expected_result": "System detects DOM price changes and dispatches webhook alerts with average latency < 10.0s",
      "evidence_location": "Change detection timing log in reports/change_audit.json",
      "pass_criterion": "Average alert latency < 10.0s across 20 trials with exit code 0",
      "kind": "normal"
    },
    {
      "input": "REST request querying latest scraped product snapshot by URL",
      "action": "curl http://localhost:8000/api/v1/snapshots?url=http://mock-store.local/item/42",
      "expected_result": "Server returns structured JSON payload containing title, price, currency, and timestamp",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and JSON contains non-empty price and title fields",
      "kind": "normal"
    },
    {
      "input": "Dynamic product price update applied on mock store at runtime ($49.99 to $29.99)",
      "action": "python scripts/verify_dynamic_scrape.py --item-id 882 --new-price 29.99",
      "expected_result": "Worker crawls page, diff engine computes $20 price drop, and emits alert webhook payload",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Alert webhook confirms price change from 49.99 to 29.99 detected with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed web intelligence crawling platform in Python using Playwright and Celery; achieved [CRAWL_THROUGHPUT] pages per minute extraction throughput across dynamic pages, and delivered sub-[ALERT_LATENCY] second change detection notification latency.",
    "claims": [
      {
        "text": "achieved [CRAWL_THROUGHPUT] pages per minute extraction throughput across dynamic pages",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[ALERT_LATENCY] second change detection notification latency",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "commercial paid residential proxy network management or circumvention of authenticated paywalls"
  },
  "verify": [
    "Run `python -m pytest tests/` to confirm Playwright scrapers, Bloom filter logic, and diff algorithms pass.",
    "Execute `python -m crawler.benchmark_throughput` to verify page extraction throughput meets the 120 pages/min benchmark.",
    "Run `python scripts/verify_dynamic_scrape.py` to assert dynamic price change detection and alert webhook emission."
  ],
  "worksheet": {
    "q1": "Core deliverable: a distributed web crawling platform in Python with Playwright headless browsers, Celery task workers, Redis Bloom filters, and PostgreSQL diff storage.",
    "q2": "Target users: data pipeline engineers, web scraping specialists, and market intelligence developers.",
    "q3": "3 use cases: e-commerce price monitoring, job market skill trend intelligence, and corporate regulatory policy tracking.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: headless Playwright browser context recycling in Celery without memory leaks, Redis Bloom filter deduplication, DOM semantic diffing, and polite crawl rate limits.",
    "q6": "Starter input: mock React e-commerce application, Celery configurations, and 500 test URL seed manifests. Synthetic mock data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local static HTML scraping with BeautifulSoup.",
    "q8": "Riskiest component: browser zombie memory leaks in Celery. Fallback: worker_max_tasks_per_child=50 and explicit context closing in finally blocks.",
    "q9": "Potential faking: mock hardcoded diff logs. Anti-fake check 5 updates dynamic mock store price, asserts crawler detects exact price drop to $29.99.",
    "q10": "Safety/ethics: Safe; local loopback mock web applications and synthetic listings only, zero unauthorized third-party site crawling."
  }
}

b52_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Competitive Intelligence Web Scraping & Analysis Platform | Generic headline | Minor |
| Claims / Marketing | 'top tech platforms/top tech platforms seller tools... SimilarWeb, Semrush, and Bombora are multi-billion-dollar businesses...' | Named third-party commercial intelligence companies and contains 'top tech platforms' placeholder | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing mock target SPA applications and crawl manifests | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Playwright or Celery runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b52_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, Playwright, and local mock SPA at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Extraction throughput (>= 120 pages/min), Bloom deduplication (>= 99.0%), and alert latency (< 10.0s) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local static HTML file scraping with BeautifulSoup if Playwright browser dependencies encounter issues.",
  "Can test data be created in minutes?": "YES. Mock React SPA storefront and automated benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial residential proxy networks and paywall circumvention.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 modifies dynamic product price and asserts crawler detects exact price drop.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b52_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved rotating proxy management and visual perceptual diffing to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic scraping metrics (JavaScript extraction throughput, Bloom filter deduplication, and change alert latency).
- Removed Banned Content: Removed marketing mentions of SimilarWeb, Semrush, Bombora, and removed 'top tech platforms' placeholder.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic price change detection test.
"""


# ==============================================================================
# 53. brief-peer-to-peer
# ==============================================================================
b53_data = {
  "id": "brief-peer-to-peer",
  "title": "Decentralized Peer-to-Peer File Distribution Engine in Go with Kademlia DHT & Rarest-First Swarm Scheduling",
  "domain": "Distributed Systems",
  "difficulty": "ADVANCED",
  "project_types": ["Systems programming", "Distributed systems"],
  "problem": "Centralized file distribution architectures suffer from bandwidth exhaustion, single-point-of-failure bottlenecks, and exponential egress bandwidth costs when distributing large software packages to thousands of clients. Naive peer-to-peer implementations experience severe swarm churn when peers disconnect mid-download, choke on corrupted binary blocks due to lack of cryptographic verification, and fail to discover peers when central tracker servers are unreachable. This project builds a decentralized peer-to-peer (P2P) file distribution engine in Go inspired by the BitTorrent protocol. The engine splits files into piece-level SHA-1 hashed blocks, implements a Kademlia Distributed Hash Table (DHT) over UDP for decentralized peer discovery, executes rarest-first piece downloading over concurrent TCP connections, and enforces tit-for-tat choking algorithms to incentivize reciprocal bandwidth sharing.",
  "use_cases": [
    {
      "title": "Large-Scale Container Image & Software Update Distribution",
      "first_sentence": "Enterprise infrastructure teams deploying multi-gigabyte container images across thousands of bare-metal server nodes need to avoid saturating central container registries.",
      "second_sentence": "The engine distributes images peer-to-peer across cluster nodes, enabling servers to download pieces from neighboring rack servers and reducing central registry egress bandwidth by over 80%."
    },
    {
      "title": "Decentralized Open-Source Dataset Distribution",
      "first_sentence": "Machine learning research consortiums sharing multi-terabyte scientific datasets require resilient distribution channels that do not depend on expensive cloud bucket hosting.",
      "second_sentence": "Researchers share dataset torrent manifests, discovering peers via Kademlia DHT and transferring verified data blocks across distributed academic nodes with cryptographic integrity."
    },
    {
      "title": "Edge CDN Cache Re-Seeding & Bandwidth Offloading",
      "first_sentence": "Content delivery network operators distributing high-demand video chunks to regional edge Points of Presence (PoPs) face heavy transit backhaul costs.",
      "second_sentence": "The P2P network allows regional edge servers to re-seed and exchange cached video blocks horizontally across local fiber interconnects without fetching redundant copies from origin storage."
    }
  ],
  "hard_parts": [
    "Implementing the Kademlia DHT routing table with 160-bit XOR distance metrics and iterative node lookup algorithms over UDP",
    "Designing concurrent TCP peer wire protocol state machines managing handshake, bitfield, request, piece, and keep-alive frames",
    "Implementing rarest-first piece scheduling algorithms that optimize piece availability across the swarm without duplicate downloads",
    "Enforcing reciprocal choking/unchoking algorithms (tit-for-tat) to maximize upload and download bandwidth efficiency while preventing free-riding"
  ],
  "screener_signals": [
    "Clean Go codebase adhering to systems design best practices, separating DHT routing, TCP peer state machines, and disk block managers",
    "Swarm benchmark report demonstrating >= 2.4x download speedup across a 5-node swarm compared to single-source HTTP transfers",
    "Anti-fake verification script injecting an intentionally corrupted binary piece from peer B and verifying the client detects hash failure and re-downloads from peer C"
  ],
  "job_families": [
    "Distributed Systems Engineer",
    "Network Protocol Software Developer",
    "Core Infrastructure Architect"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing network protocol framing, state machines, and concurrency"},
    {"tool": "TCP", "role": "reliable transport protocol powering peer-to-peer data block transfers and wire protocol state exchanges"},
    {"tool": "UDP", "role": "transport protocol powering low-latency Kademlia DHT RPC queries (ping, find_node, get_peers, announce)"},
    {"tool": "BitTorrent Protocol", "role": "architectural protocol standard defining metainfo parsing, rarest-first scheduling, and choking"},
    {"tool": "Concurrency", "role": "goroutines, sync primitives, and channels coordinating concurrent peer downloads and disk I/O"},
    {"tool": "SHA-1", "role": "cryptographic hash function generating 20-byte piece hashes verifying block data integrity"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Metainfo Torrent Parser & Block Storage Manager",
        "tools_used": ["Go", "SHA-1"],
        "purpose": "Parses bencoded .torrent files, allocates target disk files, and verifies piece SHA-1 hashes"
      },
      {
        "name": "Kademlia DHT Peer Discovery Engine",
        "tools_used": ["Go", "UDP"],
        "purpose": "Maintains k-buckets indexed by XOR distance and executes iterative node lookups to discover swarm peers"
      },
      {
        "name": "TCP Peer Wire Protocol State Machine",
        "tools_used": ["Go", "TCP", "BitTorrent Protocol"],
        "purpose": "Manages peer connections, parses binary wire framing, and handles choke/unchoke and interested states"
      },
      {
        "name": "Rarest-First Piece Scheduler & Choking Controller",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Calculates swarm piece frequency, schedules rarest piece downloads, and prioritizes unchoked peers"
      },
      {
        "name": "Swarm Speedup & Churn Benchmark Harness",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Benchmarks multi-peer download acceleration and verifies file integrity across simulated peer churn"
      },
      {
        "name": "P2P Network Protocol Guide & Architecture Diagram",
        "tools_used": ["Go", "BitTorrent Protocol"],
        "purpose": "Documents binary wire frame structures, Kademlia XOR routing mechanics, and swarm state machines"
      }
    ],
    "data_flow": "The client loads a metainfo .torrent file, extracts the 20-byte infohash and piece hashes, and allocates disk space; the Kademlia DHT module queries neighboring nodes over UDP to find peers announcing the target infohash; the client establishes concurrent TCP connections to discovered peers, exchanges handshakes and bitfields; the rarest-first scheduler identifies pieces with the lowest frequency across connected peers and requests 16KB sub-blocks; received blocks write to disk; upon receiving all sub-blocks for a piece, the SHA-1 hasher validates integrity; if valid, the client updates its bitfield and announces piece availability to the swarm; when a peer disconnects, the scheduler transparently reassigns pending blocks.",
    "enforcement_mechanism": "Cryptographic SHA-1 verification on every piece discarding corrupted bytes; Kademlia k-bucket replacement rules keeping active nodes."
  },
  "targets": [
    {
      "metric": "Swarm Download Acceleration Speedup Factor",
      "method": "Transfer speedup comparing 5-peer concurrent swarm download against single-source HTTP baseline for 100MB test file",
      "input": "100MB synthetic test payload split into 512KB pieces distributed across 5 seeding peers on local Docker bridge network",
      "environment": "Standard 4-core local CPU, Go 1.21+ release binary, Docker multi-container bridge network with 100Mbps link throttling",
      "minimum_pass": "5-peer swarm download speedup is >= 2.4x over single-source download",
      "target": "5-peer swarm download speedup is >= 3.8x over single-source download",
      "report": "P2P swarm transfer acceleration report and download timing log"
    },
    {
      "metric": "Corrupted Block Detection & Re-Request Rate",
      "method": "Percentage of intentionally corrupted binary piece blocks detected and successfully re-downloaded from alternate peers",
      "input": "20 corrupted piece blocks (flipped bytes) injected into peer download streams across 100MB transfer",
      "environment": "Go test harness simulating Byzantine peer injecting corrupted byte payloads",
      "minimum_pass": "20 of 20 corrupted pieces detected by SHA-1 hash and re-downloaded with 0 corrupted bytes in final file",
      "target": "20 of 20 corrupted pieces detected by SHA-1 hash and re-downloaded with 0 corrupted bytes in final file",
      "report": "Cryptographic piece verification audit log and corruption recovery report"
    },
    {
      "metric": "Peer Disconnection Churn Transfer Survival",
      "method": "Verification of complete file transfer when 2 of 5 seeding peers suddenly terminate connections mid-download",
      "input": "100MB file download with sudden peer SIGKILL disconnection injected at 50% download progress",
      "environment": "5 simulated Docker peer containers with random network kill scripts",
      "minimum_pass": "File transfer reaches verified data integrity confirmed by SHA-1 hash across the piece set",
      "target": "File transfer reaches verified data integrity confirmed by SHA-1 hash across the piece set",
      "report": "Peer churn recovery log and final file checksum verification"
    }
  ],
  "skills": ["Go", "TCP", "UDP", "BitTorrent Protocol", "Concurrency", "SHA-1", "Distributed Systems", "Networking", "P2P"],
  "starter_input": {
    "spec": "Directory containing .torrent bencode parser, simulated 5-node local network swarm in Docker, and 100MB synthetic test payload.",
    "size": "6 Go source packages, sample .torrent manifest, and Docker Compose multi-peer test swarm",
    "seeded_cases": "Corrupted piece hashes, unchoked peer sudden socket closure, Kademlia bucket dead node timeouts, and duplicate block delivery",
    "label_source": "Deterministic SHA-1 piece checksum manifests and ground-truth binary payload files",
    "personal_data_policy": "Strictly mock synthetic binary data files and simulated peer IP addresses; no real personal data used"
  },
  "components": [
    {"name": "Metainfo Torrent Parser & Block Storage Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Kademlia DHT Peer Discovery Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "TCP Peer Wire Protocol State Machine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Rarest-First Piece Scheduler & Choking Controller", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Swarm Speedup & Churn Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 5.0},
    {"name": "P2P Network Protocol Guide & Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 4.0},
    {"name": "Peer Diagnostics CLI & Telemetry Tooling", "task_type": "API endpoint group with tests", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Magnet link URI resolver parsing xt=urn:btih strings and fetching metainfo directly from DHT peers via ut_metadata",
      "uTP (Micro Transport Protocol) implementation over UDP providing congestion-controlled LEDBAT packet streaming",
      "IPv6 Kademlia routing support enabling dual-stack peer discovery"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Torrent Parser & Kademlia DHT Discovery in Go, UDP and SHA-1",
      "hours": 10,
      "done_criterion": "Parser decodes .torrent bencode files; Kademlia DHT discovers peers over UDP."
    },
    {
      "name": "TCP Wire Protocol & Rarest-First Scheduling in TCP, BitTorrent Protocol and Concurrency",
      "hours": 10,
      "done_criterion": "Client connects to peers over TCP; rarest-first scheduler downloads verified pieces."
    },
    {
      "name": "Swarm Acceleration & Churn Recovery in Distributed Systems and Networking",
      "hours": 10,
      "done_criterion": "5-peer swarm achieves >= 2.4x speedup; client survives mid-transfer peer disconnects."
    },
    {
      "name": "Piece Corruption Anti-Fake Test & Docs in P2P",
      "hours": 10,
      "done_criterion": "Corrupted piece triggers SHA-1 rejection; client re-downloads valid piece; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, socket networking (net.Conn, net.PacketConn), and goroutines",
    "Understanding of P2P network architectures, BitTorrent wire specifications, and cryptographic hashing"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound systems software)",
    "cost": "$0 (fully open-source Go codebase)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and Docker Desktop (for multi-peer swarm) installed",
    "fallback_path": "Running 5 peer instances as local OS background processes communicating across loopback ports"
  },
  "riskiest_component": {
    "name": "Deadlocks and Goroutine Leaks in Peer State Machine Sockets",
    "mitigation": "Enforce strict read/write socket timeouts, context cancellation propagation, and buffered channels for peer message queues.",
    "fallback": "Centralized supervisor goroutine terminating unresponsive peer connections after 30-second silence."
  },
  "deliverables": [
    "Git repository containing Go P2P engine, Kademlia DHT node, peer wire protocol client, and CLI tools",
    "Docker Compose test environment orchestrating 5 seeding peers and 1 client peer on throttled bridge network",
    "Automated benchmark harness verifying swarm acceleration and cryptographic block recovery",
    "Screener verification script executing automated benchmark and dynamic corrupted piece recovery in under 3 minutes"
  ],
  "out_of_scope": [
    "Copyrighted media indexing, tracker torrent search engines, or public swarm scraping",
    "NAT traversal using UPnP / NAT-PMP port forwarding protocols on physical residential routers",
    "Custom video player streaming playback codecs"
  ],
  "safety_note": None,
  "resources": [
    "The BitTorrent Protocol Specification (BEP 0003) and DHT Protocol (BEP 0005)",
    "Kademlia: A Peer-to-Peer Information System Based on the XOR Metric (Maymounkov and Mazières)",
    "Building a BitTorrent Client from Scratch in Go (Jesse Li Architecture Guide)"
  ],
  "rubric": [
    {
      "input": "100MB synthetic test payload downloaded across 5-peer Docker swarm",
      "action": "go run ./cmd/bench_swarm --peers 5 --file-size 100MB",
      "expected_result": "5-peer swarm achieves download speedup >= 2.4x compared to single-source baseline",
      "evidence_location": "Terminal execution output log and reports/swarm_speedup.json",
      "pass_criterion": "Speedup factor >= 2.4x with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 corrupted piece blocks injected into incoming peer data streams",
      "action": "go test -v ./peer/... -run TestPieceCorruptionRecovery",
      "expected_result": "SHA-1 hasher detects all 20 corrupted pieces, discards bytes, and re-downloads valid pieces",
      "evidence_location": "Piece integrity audit log in reports/integrity_audit.json",
      "pass_criterion": "20 of 20 corrupted pieces rejected and final file SHA-1 matches ground truth with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Sudden termination of 2 seeding peers at 50% download progress",
      "action": "go run ./scripts/test_peer_churn.go --kill-peers 2",
      "expected_result": "Engine reassigns missing piece blocks to remaining peers and completes 100% of download",
      "evidence_location": "Peer churn recovery report",
      "pass_criterion": "File transfer completes with valid SHA-1 checksum and exit code 0",
      "kind": "normal"
    },
    {
      "input": "CLI request querying active peer swarm status and bitfield progress",
      "action": "go run ./cmd/p2p_cli status --infohash f4b9c1d8...",
      "expected_result": "CLI outputs connected peer list, download rate, upload rate, and bitfield completion percentage",
      "evidence_location": "CLI stdout terminal output",
      "pass_criterion": "Output displays active peer count >= 3 and valid completion progress with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic corrupted piece injected from peer 2 while piece 3 is transferring",
      "action": "go run ./scripts/verify_dynamic_corruption.go --corrupt-piece 3",
      "expected_result": "Client logs 'SHA1_MISMATCH: Piece 3 corrupted', requests piece from peer 3, and verifies valid hash",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms piece 3 rejected from peer 2, re-downloaded from peer 3, with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected decentralized peer-to-peer file sharing protocol in Go with Kademlia DHT peer discovery; achieved [SWARM_SPEEDUP] speedup factor over single-source transfers, and maintained verified payload integrity across multi-peer network swarms.",
    "claims": [
      {
        "text": "achieved [SWARM_SPEEDUP] speedup factor over single-source transfers",
        "rubric_indexes": [0]
      },
      {
        "text": "maintained verified payload integrity across multi-peer network swarms",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "public copyrighted media torrent indexing or residential router UPnP NAT traversal"
  },
  "verify": [
    "Run `go test -v ./...` to confirm torrent parsing, Kademlia DHT, and peer wire protocol tests pass.",
    "Execute `go run ./cmd/bench_swarm` to verify swarm download speedup meets the 2.4x benchmark factor.",
    "Run `go run ./scripts/verify_dynamic_corruption.go` to assert SHA-1 rejection of corrupted pieces and recovery."
  ],
  "worksheet": {
    "q1": "Core deliverable: a decentralized P2P file sharing engine in Go with Kademlia DHT discovery, rarest-first scheduling, and SHA-1 piece verification.",
    "q2": "Target users: distributed systems engineers, network protocol software developers, and core infrastructure architects.",
    "q3": "3 use cases: container image cluster distribution, decentralized open-source dataset sharing, and edge CDN cache re-seeding.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Kademlia 160-bit XOR routing tables over UDP, binary peer wire protocol state machines, rarest-first piece scheduling, and tit-for-tat choking algorithms.",
    "q6": "Starter input: .torrent parser, Docker 5-node test swarm, and 100MB synthetic test payload. Synthetic binary test files only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: 5 local loopback background processes.",
    "q8": "Riskiest component: socket deadlocks and goroutine leaks in peer state machines. Fallback: strict read/write timeouts and supervisor watchdog goroutine.",
    "q9": "Potential faking: single-source mock downloads. Anti-fake check 5 injects corrupted piece from peer 2, asserts SHA-1 rejection and recovery from peer 3.",
    "q10": "Safety/ethics: Safe; synthetic test files and private Docker swarms only, zero copyrighted or public torrent interaction."
  }
}

b53_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Peer-to-Peer File Sharing Network (BitTorrent-like) | Generic headline | Minor |
| Claims / Marketing | 'BitTorrent protocol powers 40% of internet traffic... rare and impressive to any systems-oriented interviewer' | Unsubstantiated internet traffic marketing claims | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing .torrent test manifests and network swarm test suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No network/Go specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b53_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go and local Docker swarm at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Swarm speedup (>= 2.4x), corruption recovery (20 of 20), and churn survival (100%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Running 5 peer instances as local OS background processes across loopback ports without requiring Docker.",
  "Can test data be created in minutes?": "YES. Synthetic 100MB payload generator and automated benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: copyrighted media indexing and router UPnP NAT traversal.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 injects corrupted piece and verifies client rejects it and re-downloads from alternate peer.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b53_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved magnet link resolution and uTP congestion control to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic P2P metrics (swarm download speedup factor, SHA-1 piece corruption recovery, and peer churn survival).
- Removed Banned Content: Removed unsubstantiated marketing claims regarding internet traffic percentages.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic piece corruption recovery test.
"""


# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_5_part2():
    res49 = process_brief(b49_data, b49_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b49_reviewer, b49_changelog)
    res50 = process_brief(b50_data, b50_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b50_reviewer, b50_changelog)
    res51 = process_brief(b51_data, b51_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b51_reviewer, b51_changelog)
    res52 = process_brief(b52_data, b52_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b52_reviewer, b52_changelog)
    res53 = process_brief(b53_data, b53_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b53_reviewer, b53_changelog)
    return [res49, res50, res51, res52, res53]

if __name__ == "__main__":
    results = run_batch_5_part2()
    print("Batch 5 Part 2 finished successfully:", results)
