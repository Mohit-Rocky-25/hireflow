"""
Batch 6 Part 2: Redesign briefs 59 to 63 from scratch.
59. brief-react-native-offline
60. brief-realtime-analytics-dashboard
61. brief-realtime-code-execution
62. brief-realtime-collab
63. brief-realtime-stock-platform
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 59. brief-react-native-offline
# ==============================================================================
b59_data = {
  "id": "brief-react-native-offline",
  "title": "Offline-First Mobile Inspection Engine in React Native with WatermelonDB SQLite & Idempotent Delta Sync",
  "domain": "Mobile Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Mobile app", "Full-stack web"],
  "problem": "Mobile applications for field agents (insurance surveyors, equipment inspectors, and logistics personnel) suffer from frozen user interfaces and catastrophic data loss when operating in basements, rural regions, or cellular dead zones. Standard mobile architectures relying on synchronous REST calls fail completely without internet access, while naive local caching strategies overwrite remote changes during bulk reconnection syncs. This project builds a production-grade offline-first mobile inspection engine in TypeScript using React Native and WatermelonDB. The system persists complex relational inspection records locally in SQLite, executes optimistic UI mutations with sub-15ms local commit times, synchronizes differential delta vectors with a Node.js backend using idempotent transactions, and deterministically resolves concurrent field edits using column-level Last-Write-Wins (LWW) timestamps.",
  "use_cases": [
    {
      "title": "Aviation Runway & Aircraft Maintenance Logging",
      "first_sentence": "Aircraft maintenance engineers conducting pre-flight checks inside shielded airport hangars frequently lose cellular and Wi-Fi connectivity.",
      "second_sentence": "The mobile app records structural component wear measurements locally in SQLite, synchronizing delta updates to airline maintenance servers once the tablet reconnects."
    },
    {
      "title": "Insurance Property Damage Claims Assessment",
      "first_sentence": "Insurance field claims adjusters assessing remote flood or hurricane damage sites must log detailed property estimates without active cell towers.",
      "second_sentence": "The surveyor captures inspection items and estimated repair costs locally, automatically queuing updates that flush to the claims processing backend upon network reconnection."
    },
    {
      "title": "Commercial Cold-Storage Logistics Inventory Auditing",
      "first_sentence": "Warehouse auditors working inside heavily insulated refrigerated facilities need continuous mobile checklist performance without network latency.",
      "second_sentence": "The mobile client provides instantaneous UI state transitions using local WatermelonDB queries, synchronizing inventory count reconciliations upon exiting the refrigerated vault."
    }
  ],
  "hard_parts": [
    "Configuring WatermelonDB reactive observable queries over SQLite to maintain 60 FPS scrolling across 5,000 cached records on mobile devices",
    "Designing an idempotent differential synchronization protocol that tracks created, updated, and deleted record IDs with server-assigned sync timestamps",
    "Resolving concurrent multi-device editing conflicts deterministically without overwriting unrelated fields in the same inspection entity",
    "Managing background sync retries with exponential backoff and jitter to prevent thundering herd spikes during intermittent connection flapping"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating React Native UI views, WatermelonDB SQLite schema models, sync protocol clients, and Redux state slices",
    "Mobile performance report proving sub-15ms local SQLite write latency and zero UI freeze across 5,000 local records",
    "Anti-fake verification script simulating an airplane mode network cutoff, editing an inspection record locally, modifying the same record on the backend, reconnecting, and asserting non-conflicting field merge"
  ],
  "job_families": [
    "Mobile Software Engineer (React Native)",
    "Frontend Systems Architect",
    "Full-Stack Mobile Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language shared across React Native components, database models, and sync handlers"},
    {"tool": "React Native", "role": "mobile framework rendering performant native UI components across iOS and Android"},
    {"tool": "SQLite", "role": "embedded relational database engine persisting offline mobile application records on disk"},
    {"tool": "WatermelonDB", "role": "high-performance reactive database framework bridging React Native to native SQLite"},
    {"tool": "Node.js", "role": "backend API server orchestrating sync transactions, database persistence, and conflict resolution"},
    {"tool": "Redux Toolkit", "role": "state management library tracking network connectivity status and sync progress indicators"}
  ],
  "architecture": {
    "components": [
      {
        "name": "WatermelonDB & SQLite Local Persistent Storage Schema",
        "tools_used": ["TypeScript", "WatermelonDB", "SQLite"],
        "purpose": "Defines relational schema tables, columns, and indices; executes lazy queries and transactional mutations"
      },
      {
        "name": "Differential Sync Protocol & Idempotent Mutation Queue",
        "tools_used": ["TypeScript", "WatermelonDB"],
        "purpose": "Tracks created, updated, and deleted records using sync status flags; prepares delta payload batches"
      },
      {
        "name": "Node.js Authoritative Sync API & Conflict Resolver",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Processes incoming push/pull sync requests, verifies timestamps, and executes column-level LWW merge logic"
      },
      {
        "name": "Offline-First Mobile Field Inspection React Native UI",
        "tools_used": ["TypeScript", "React Native", "Redux Toolkit"],
        "purpose": "Renders inspection checklists, displays offline connectivity badges, and provides instant optimistic UI updates"
      },
      {
        "name": "Offline Sync Latency & Data Parity Benchmark Harness",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Profiles local SQLite write latencies, network payload sizes, and verifies record parity across 1,000 entities"
      },
      {
        "name": "Mobile Architecture Guide & SQLite Migration Manual",
        "tools_used": ["TypeScript", "React Native"],
        "purpose": "Documents SQLite schema migration steps, WatermelonDB indexing rules, and conflict resolution policies"
      }
    ],
    "data_flow": "The field agent updates an inspection item on the React Native UI; WatermelonDB writes the mutation to SQLite in < 15ms and sets the record sync_status to 'updated'; the UI updates instantly via reactive observables; Redux Toolkit monitors NetInfo network status; when network connectivity is detected, the sync manager triggers a push/pull transaction with Node.js; the client sends local deltas since last_pulled_at; the Node.js server applies non-conflicting fields, resolves concurrent edits using column-level timestamps, commits to database, and returns server changes; the client applies server deltas to SQLite and updates last_pulled_at.",
    "enforcement_mechanism": "Server-side monotonically increasing sync sequence numbers and UUID v4 idempotency keys preventing duplicate record creation."
  },
  "targets": [
    {
      "metric": "Local SQLite Mutation Persistence Latency",
      "method": "Wall-clock timing from UI form submission to completed WatermelonDB SQLite transaction commit",
      "input": "1,000 sequential inspection record updates executed on simulated mobile device runtime",
      "environment": "Standard 4-core local CPU with headless Node.js mobile runtime / React Native test harness",
      "minimum_pass": "p95 local mutation persistence latency is < 20.0 milliseconds",
      "target": "p95 local mutation persistence latency is < 9.5 milliseconds",
      "report": "WatermelonDB SQLite write latency profiling log and transaction duration histogram"
    },
    {
      "metric": "Differential Reconnection Synchronization Throughput",
      "method": "Total duration to serialize, upload, resolve conflicts, and apply 500 queued offline changes upon reconnection",
      "input": "500 offline inspection records queued during simulated 30-minute network outage",
      "environment": "Local Node.js sync server communicating with React Native mobile client over throttled loopback network",
      "minimum_pass": "p95 sync duration for 500 records is < 2,500 milliseconds",
      "target": "p95 sync duration for 500 records is < 950 milliseconds",
      "report": "Differential sync performance report and network bandwidth breakdown"
    },
    {
      "metric": "Concurrent Multi-Device Field Conflict Merge Parity Rate",
      "method": "Percentage of simulated multi-device concurrent conflict trials resulting in correct non-conflicting field merges",
      "input": "50 concurrent editing trials where device A and device B edit different fields of the same record simultaneously while offline",
      "environment": "Automated sync conflict test runner simulating two partitioned mobile clients and central Node.js server",
      "minimum_pass": "50 of 50 conflict trials successfully merge without overwriting peer edits",
      "target": "50 of 50 conflict trials successfully merge without overwriting peer edits",
      "report": "Conflict resolution audit log and entity field consistency report"
    }
  ],
  "skills": ["TypeScript", "React Native", "SQLite", "WatermelonDB", "Node.js", "Redux Toolkit", "Mobile Engineering", "Offline Sync"],
  "starter_input": {
    "spec": "Directory containing React Native mobile scaffolding, WatermelonDB SQLite schema models, Node.js sync server, and automated tests.",
    "size": "12 TypeScript source files, SQLite migration definitions, and automated multi-client offline sync test suite",
    "seeded_cases": "Simultaneous field edits on same record, network disconnect mid-sync, and foreign key constraint validations on orphaned records",
    "label_source": "Deterministic SQLite table checksums and automated JSON field assertion manifests",
    "personal_data_policy": "Strictly mock synthetic equipment inspection records and simulated surveyor IDs; no real personal data used"
  },
  "components": [
    {"name": "WatermelonDB & SQLite Local Persistent Storage Schema", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Differential Sync Protocol & Idempotent Mutation Queue", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Node.js Authoritative Sync API & Conflict Resolver", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Offline-First Mobile Field Inspection React Native UI", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Offline Sync Latency & Data Parity Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Mobile Architecture Guide & SQLite Migration Manual", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "features": [
      "Binary media attachment offline sync compressing photos locally before uploading via multipart streaming",
      "Background Fetch API scheduling periodic silent database synchronizations when device connects to Wi-Fi",
      "End-to-end encrypted SQLite database using SQLCipher cryptographic extension"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "WatermelonDB & SQLite Local Schema Setup in TypeScript and SQLite",
      "hours": 7,
      "done_criterion": "Relational schema initializes; WatermelonDB executes CRUD queries in SQLite with sub-20ms latency."
    },
    {
      "name": "Differential Sync Protocol & Idempotent Queue in WatermelonDB and Node.js",
      "hours": 7,
      "done_criterion": "Local changes track in mutation queue; differential push/pull synchronizes with Node.js backend."
    },
    {
      "name": "React Native Mobile UI & Redux State in React Native and Redux Toolkit",
      "hours": 7,
      "done_criterion": "UI renders inspection checklists; Redux tracks connectivity; offline mutations apply optimistically."
    },
    {
      "name": "Conflict Merge Anti-Fake Test & Docs in Mobile Engineering and Offline Sync",
      "hours": 7,
      "done_criterion": "Anti-fake test confirms non-conflicting field merge across 2 offline devices; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, React Native, and asynchronous JavaScript state management (Redux Toolkit)",
    "Understanding of relational database concepts (SQLite), schema migrations, and differential synchronization protocols"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (runs on local CPU via headless Node.js mobile test harnesses or React Native CLI)",
    "cost": "$0 (fully open-source stack using local Node.js and SQLite)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or mobile app store licenses required",
    "reference_environment": "Local 4-core CPU with Node.js 18+, npm/yarn, and SQLite3 installed",
    "fallback_path": "Running mobile tests against simulated in-memory SQLite store if native iOS/Android simulators are unavailable"
  },
  "riskiest_component": {
    "name": "Database Schema Desynchronization and Unresolvable Merge Conflicts",
    "mitigation": "Enforce strict schema migration version numbers and isolate conflict resolution logic into deterministic column-level merge reducers.",
    "fallback": "Server-side conflict archive table preserving conflicting payloads for manual auditor review."
  },
  "deliverables": [
    "Git repository containing React Native mobile app, WatermelonDB SQLite models, Node.js sync server, and test suites",
    "SQLite migration scripts, sample seed datasets, and schema documentation",
    "Automated benchmark harness verifying local SQLite write latencies and sync throughput",
    "Screener verification script executing automated 2-device offline conflict resolution in under 2 minutes"
  ],
  "out_of_scope": [
    "Native iOS/Android App Store release pipeline provisioning",
    "Proprietary cloud mobile databases (Firebase Firestore / AWS AppSync)",
    "Complex AR camera scanning or 3D point cloud rendering"
  ],
  "safety_note": None,
  "resources": [
    "WatermelonDB Official Documentation & Architecture Guide",
    "Designing Data-Intensive Applications: Chapter on Multi-Leader & Offline Replication (Martin Kleppmann)",
    "Offline-First Web and Mobile Architecture Patterns (Martin Fowler)"
  ],
  "rubric": [
    {
      "input": "1,000 sequential inspection record updates executed against WatermelonDB SQLite",
      "action": "npm run bench:sqlite-writes -- --records 1000",
      "expected_result": "Database commits mutations with p95 write latency < 20.0ms and 0 disk errors",
      "evidence_location": "Terminal output log and reports/sqlite_latency.json",
      "pass_criterion": "p95 latency < 20.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 offline inspection records queued during simulated network outage",
      "action": "npm run test:sync-throughput -- --records 500",
      "expected_result": "Sync manager synchronizes 500 records with Node.js backend in < 2,500ms total elapsed time",
      "evidence_location": "Sync throughput benchmark report in reports/sync_perf.json",
      "pass_criterion": "Sync duration < 2500ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "WatermelonDB schema migration executing table alter and column additions",
      "action": "npm run test:migrations",
      "expected_result": "Migrations upgrade schema version cleanly without data corruption across 1,000 pre-existing records",
      "evidence_location": "Migration test report in reports/migration_audit.json",
      "pass_criterion": "All migration steps pass with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Redux Toolkit network state transition from online to offline to online",
      "action": "npm run test:network-state",
      "expected_result": "App updates connectivity banner and optimistic mutation queue indicator with 0 UI drops",
      "evidence_location": "State transition test log in reports/state_audit.json",
      "pass_criterion": "State assertions verify valid status flags with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Two offline devices editing different fields of inspection record 101 simultaneously",
      "action": "node ./scripts/verify_offline_merge.js --record 101 --devA-field notes='Passed' --devB-field status='Approved'",
      "expected_result": "Backend merges updates deterministically; both notes='Passed' and status='Approved' persist without data loss",
      "evidence_location": "Dynamic conflict verification console execution output log",
      "pass_criterion": "Console confirms merged record contains both edits with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected offline-first mobile inspection engine in TypeScript using React Native and WatermelonDB; achieved sub-[WRITE_LATENCY] millisecond local SQLite write latency, and synchronized [SYNC_RECORDS] queued offline records in under [SYNC_DURATION] seconds upon reconnection.",
    "claims": [
      {
        "text": "achieved sub-[WRITE_LATENCY] millisecond local SQLite write latency",
        "rubric_indexes": [0]
      },
      {
        "text": "synchronized [SYNC_RECORDS] queued offline records in under [SYNC_DURATION] seconds upon reconnection",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "native mobile app store deployment or proprietary cloud database replication"
  },
  "verify": [
    "Run `npm test` to confirm WatermelonDB schemas, sync protocol handlers, and UI components pass.",
    "Execute `npm run bench:sqlite-writes` to verify local write latency remains < 20ms.",
    "Run `node ./scripts/verify_offline_merge.js` to assert multi-device concurrent conflict resolution."
  ],
  "worksheet": {
    "q1": "Core deliverable: an offline-first mobile inspection engine in TypeScript with React Native, WatermelonDB SQLite, and Node.js differential sync.",
    "q2": "Target users: mobile software engineers (React Native), frontend systems architects, and full-stack mobile developers.",
    "q3": "3 use cases: aviation runway maintenance logging, insurance property claims assessment, and cold-storage logistics auditing.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: WatermelonDB SQLite reactive queries, idempotent differential delta sync, multi-device column-level conflict resolution, and network retry backoff.",
    "q6": "Starter input: React Native scaffolding, WatermelonDB models, Node.js sync server, and multi-client test suite. Synthetic inspection records only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero app store licenses. Fallback: in-memory SQLite store.",
    "q8": "Riskiest component: database schema desynchronization and unresolvable merge conflicts. Fallback: strict migration versions and conflict audit archives.",
    "q9": "Potential faking: standard mobile app without real offline persistence. Anti-fake check 5 simulates two partitioned offline clients editing the same record and asserts deterministic merge.",
    "q10": "Safe; synthetic equipment inspection data and local test servers only, zero personal data."
  }
}

b59_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, sync protocol specs, and conflict resolution rules | High |
| Tech Stack | React Native, TypeScript, WatermelonDB, Redux Saga, REST APIs | Listed Redux Saga without modern best practices (Redux Toolkit) or explicit backend roles | Medium |
| Rubric | Missing quantitative targets | Lacked concrete SQLite write latency bounds, sync throughput thresholds, and multi-device merge tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b59_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js and headless mobile test runners at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. SQLite write latency (< 20ms), sync throughput (< 2,500ms for 500 records), and conflict parity (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory SQLite store and Node.js mock test runner without requiring native mobile simulators.",
  "Can test data be created in minutes?": "YES. Synthetic equipment inspection records and automated test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: native App Store provisioning, proprietary cloud databases, and AR 3D scanning.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 simulates two partitioned offline devices editing the same record and verifies column-level merge.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b59_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved binary media attachment sync and SQLCipher encryption to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic mobile database metrics (SQLite write latency, differential sync throughput, and conflict resolution rate).
- Removed Banned Content: Removed promotional marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake multi-device concurrent conflict merge test.
"""

# ==============================================================================
# 60. brief-realtime-analytics-dashboard
# ==============================================================================
b60_data = {
  "id": "brief-realtime-analytics-dashboard",
  "title": "Real-Time Business Intelligence Analytics Dashboard with Node.js WebSockets, Redis Pub/Sub & PostgreSQL Rollups",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Full-stack web", "Data pipeline"],
  "problem": "Executive and operational teams relying on periodic page refreshes to monitor critical business KPIs suffer from stale metrics, uncoordinated decision-making, and heavy database load from repetitive analytical queries. Polling REST APIs every few seconds exhausts server connection pools and introduces significant latency lag during rapid traffic surges. This project builds a production-grade real-time business intelligence (BI) dashboard in TypeScript and React. The system ingests business transaction events in Node.js, distributes live metric mutations horizontally across worker processes using Redis Pub/Sub, pushes delta updates to thousands of browser clients over WebSockets with sub-35ms broadcast latency, computes historical multi-dimensional rollups in PostgreSQL, and renders interactive SVG/Canvas charts with zero UI stutter.",
  "use_cases": [
    {
      "title": "E-Commerce Black Friday Flash-Sale Monitoring",
      "first_sentence": "Retail merchandise directors need to monitor live revenue, order volume, and inventory depletion velocity across product categories during flash sales.",
      "second_sentence": "The dashboard displays real-time ticker updates and conversion rate heatmaps, streaming purchase deltas over WebSockets within 25 milliseconds of order placement."
    },
    {
      "title": "FinTech Payment Gateway Transaction & Anomaly Operations",
      "first_sentence": "Payment platform reliability teams require immediate visualization of payment authorization success rates and fraud decline spikes across banking partners.",
      "second_sentence": "The streaming dashboard graphs rolling authorization percentages in real time, triggering visual alert banners when gateway error rates exceed defined thresholds."
    },
    {
      "title": "SaaS Platform User Activity & Subscription ARR Metrics",
      "first_sentence": "Executive leadership needs an operational display tracking active user concurrency, plan upgrades, and recurring revenue metrics updated continuously.",
      "second_sentence": "The system aggregates live billing and activity events in Redis, streaming live ARR and user count updates to executive browser sessions without requiring manual page reloads."
    }
  ],
  "hard_parts": [
    "Designing high-throughput WebSocket connection management in Node.js supporting 2,000 concurrent browser sessions with heartbeats and auto-reconnection",
    "Implementing horizontal multi-worker broadcast fan-out using Redis Pub/Sub channels to distribute events across clustered Node.js processes",
    "Writing efficient SQL window functions and continuous aggregate rollups in PostgreSQL to support fast historical interval slicing (1m, 5m, 1h, 24h)",
    "Rendering dynamic 60 FPS live charts and animated metric counters in React without triggering unnecessary component re-renders or layout reflows"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating React dashboard views, Node.js WebSocket socket gateways, Redis Pub/Sub distributors, and PostgreSQL queries",
    "High-concurrency benchmark report validating 2,000 concurrent WebSocket client connections receiving 1,000 event broadcasts per second with sub-35ms latency",
    "Anti-fake verification script publishing a synthetic $10,000 transaction event and asserting the connected browser UI increments the total revenue counter within 100 milliseconds"
  ],
  "job_families": [
    "Full-Stack Web Developer",
    "Frontend Systems Architect",
    "Real-Time Data Platform Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language shared across frontend React components and backend Node.js services"},
    {"tool": "React", "role": "frontend component framework rendering dynamic KPI cards, SVG charts, and live activity streams"},
    {"tool": "Node.js", "role": "high-concurrency event-driven runtime hosting the WebSocket server and ingestion API"},
    {"tool": "WebSockets", "role": "bi-directional streaming transport pushing real-time metric updates to connected clients"},
    {"tool": "PostgreSQL", "role": "relational database storing persistent transaction events, audit trails, and analytical rollups"},
    {"tool": "Redis", "role": "in-memory Pub/Sub message broker broadcasting events across Node.js cluster processes"}
  ],
  "architecture": {
    "components": [
      {
        "name": "WebSocket Subscription Server & Connection Manager",
        "tools_used": ["TypeScript", "Node.js", "WebSockets"],
        "purpose": "Manages client WebSocket lifecycles, authenticates sessions, handles topic subscriptions, and streams delta updates"
      },
      {
        "name": "Redis Pub/Sub Fan-Out & Metric Aggregation Engine",
        "tools_used": ["TypeScript", "Redis"],
        "purpose": "Subscribes to internal event channels, fans out broadcasts across server nodes, and caches rolling 60-second metrics"
      },
      {
        "name": "PostgreSQL Analytical Rollup & Historical Query API",
        "tools_used": ["TypeScript", "PostgreSQL"],
        "purpose": "Executes optimized SQL aggregation queries for historical time buckets and stores permanent event records"
      },
      {
        "name": "Dynamic Live Analytics Dashboard with SVG/Canvas Charts",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Renders real-time KPI metric counters, live line charts, and event activity logs with optimized React memoization"
      },
      {
        "name": "WebSocket Concurrency & Broadcast Latency Benchmark Harness",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Simulates 2,000 concurrent WebSocket clients and benchmarks broadcast fan-out latencies and server memory overhead"
      },
      {
        "name": "Real-Time BI Architecture Guide & Pub/Sub Topology Diagram",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Documents Redis Pub/Sub scaling topology, client reconnection exponential backoff, and PostgreSQL query tuning"
      }
    ],
    "data_flow": "A transaction event posts to the ingestion API; Node.js writes the raw event to PostgreSQL; simultaneously, the server publishes a lightweight delta payload to the Redis 'metrics:updates' channel; all active Node.js worker processes receive the Redis message; each worker identifies connected WebSocket clients subscribed to that metric room; the worker serializes the JSON frame and broadcasts it over WebSockets in < 35ms; the React client receives the WebSocket message, updates its local state store, and smoothly re-renders the KPI card and live chart; when the user changes historical date ranges, the client fetches aggregated buckets from the PostgreSQL REST API.",
    "enforcement_mechanism": "Bounded WebSocket send buffers and client-side throttled requestAnimationFrame animation loops preventing UI freezes."
  },
  "targets": [
    {
      "metric": "p95 Event-to-Client Broadcast Latency",
      "method": "Wall-clock timing from event ingestion POST request arrival to WebSocket frame delivery across 2,000 connected clients",
      "input": "10,000 events streamed at 500 events per second across 2,000 active WebSocket client connections",
      "environment": "Standard 4-core local CPU, Redis 7+ and PostgreSQL 15+ in Docker, Node.js 18+ runtime",
      "minimum_pass": "p95 broadcast latency across connected clients is < 50.0 milliseconds",
      "target": "p95 broadcast latency across connected clients is < 22.5 milliseconds",
      "report": "WebSocket broadcast latency benchmark report and delivery percentile table"
    },
    {
      "metric": "PostgreSQL Historical Aggregate Query Latency",
      "method": "Execution timing to query and assemble 24-hour hourly metric rollups across 1,000,000 historical records",
      "input": "100 repeated analytical SQL aggregation queries issued against database with 1,000,000 event rows",
      "environment": "Local PostgreSQL 15+ instance with indexed timestamp and category columns",
      "minimum_pass": "p95 historical query execution latency is < 65.0 milliseconds",
      "target": "p95 historical query execution latency is < 24.0 milliseconds",
      "report": "PostgreSQL query plan EXPLAIN ANALYZE log and execution duration table"
    },
    {
      "metric": "Concurrent Client Connection Capacity",
      "method": "Sustained simultaneous WebSocket connections maintained without socket drops or memory exhaustion",
      "input": "2,000 headless WebSocket client connections established and maintained for 10 continuous minutes",
      "environment": "Node.js WebSocket cluster on standard 4-core local CPU with 8GB RAM",
      "minimum_pass": "Cluster sustains >= 2,000 active connections with 0 socket drops and RSS memory < 250MB",
      "target": "Cluster sustains >= 3,500 active connections with 0 socket drops and RSS memory < 320MB",
      "report": "WebSocket concurrency stress test report and memory usage trajectory"
    }
  ],
  "skills": ["TypeScript", "React", "Node.js", "WebSockets", "PostgreSQL", "Redis", "Full-Stack Web", "Real-Time Analytics"],
  "starter_input": {
    "spec": "Directory containing React dashboard scaffolding, Node.js WebSocket gateway, Redis Pub/Sub wrapper, and PostgreSQL schema DDLs.",
    "size": "15 TypeScript source files, SQL migration scripts, Docker Compose manifest, and automated WebSocket load generator",
    "seeded_cases": "WebSocket abrupt client disconnects, slow consumer backpressure saturation, and concurrent multi-node Redis message delivery",
    "label_source": "Deterministic PostgreSQL aggregate query assertions and WebSocket message sequence counters",
    "personal_data_policy": "Strictly mock synthetic financial transaction records and simulated merchant IDs; no real personal data used"
  },
  "components": [
    {"name": "WebSocket Subscription Server & Connection Manager", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Redis Pub/Sub Fan-Out & Metric Aggregation Engine", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "PostgreSQL Analytical Rollup & Historical Query API", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Dynamic Live Analytics Dashboard with SVG/Canvas Charts", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "WebSocket Concurrency & Broadcast Latency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Real-Time BI Architecture Guide & Pub/Sub Topology Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Custom user-configurable dashboard layout builder with drag-and-drop grid repositioning and persistent layout state",
      "Automated metric anomaly detection triggering webhook notifications when transaction rates deviate by > 3 standard deviations",
      "Distributed tracing integration linking slow WebSocket broadcast loops to OpenTelemetry spans"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "WebSocket Gateway & Redis Pub/Sub Infrastructure in Node.js, WebSockets and Redis",
      "hours": 7,
      "done_criterion": "WebSocket server connects clients; Redis Pub/Sub broadcasts messages across worker instances."
    },
    {
      "name": "PostgreSQL Analytical Rollups & Historical API in PostgreSQL and TypeScript",
      "hours": 7,
      "done_criterion": "PostgreSQL persists events; SQL rollup queries execute with p95 latency < 65ms on 1M rows."
    },
    {
      "name": "React Live Analytics Dashboard UI & SVG Charts in React and Full-Stack Web",
      "hours": 7,
      "done_criterion": "Dashboard renders live KPI cards and SVG charts; updates stream smoothly over WebSockets."
    },
    {
      "name": "Concurrency Benchmark, Anti-Fake Live Event Test & Docs in Real-Time Analytics",
      "hours": 7,
      "done_criterion": "Benchmark verifies 2,000 connections; anti-fake test validates real-time revenue update; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in modern TypeScript, React, Node.js asynchronous I/O, and relational SQL queries",
    "Understanding of WebSocket protocols, Redis Pub/Sub patterns, and high-concurrency client connection management"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound web services and database software)",
    "cost": "$0 (fully open-source stack using local Node.js and Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (PostgreSQL 15+ and Redis 7+ containers) and Node.js 18+",
    "fallback_path": "Local SQLite database and in-memory event emitter if Docker containers are unavailable"
  },
  "riskiest_component": {
    "name": "WebSocket Slow-Consumer Buffer Bloat and Memory Leaks",
    "mitigation": "Implement bounded client-side socket send buffers and automatically drop unacknowledged telemetry frames for lagging clients.",
    "fallback": "Rate-limit broadcast frequencies to max 10 updates per second per client room."
  },
  "deliverables": [
    "Git repository containing React dashboard app, Node.js WebSocket server, Redis distributor, and PostgreSQL migrations",
    "Docker Compose file launching PostgreSQL and Redis containers with persistent volume mounts",
    "Automated load testing harness measuring broadcast latency percentiles and client concurrency limits",
    "Screener verification script executing automated 2,000-client load test and dynamic transaction verification in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial BI cloud platforms (Tableau / Looker / PowerBI)",
    "Multi-petabyte data warehouse infrastructure (Snowflake / BigQuery)",
    "Complex 3D WebGL spatial visualization engines"
  ],
  "safety_note": None,
  "resources": [
    "High Performance Browser Networking: Chapter on WebSockets (Ilya Grigorik)",
    "Redis Documentation on Pub/Sub Messaging Patterns",
    "PostgreSQL Documentation on Window Functions and Aggregate Queries"
  ],
  "rubric": [
    {
      "input": "10,000 events streamed at 500 events per second across 2,000 connected clients",
      "action": "npm run bench:websocket -- --clients 2000 --rate 500 --events 10000",
      "expected_result": "WebSocket server broadcasts frames to all clients with p95 delivery latency < 50.0ms",
      "evidence_location": "Terminal output log and reports/broadcast_latency.json",
      "pass_criterion": "p95 latency < 50.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 repeated 24-hour hourly aggregation queries on 1,000,000 historical rows",
      "action": "npm run bench:postgres-query -- --queries 100",
      "expected_result": "PostgreSQL executes analytical rollup queries with p95 execution latency < 65.0ms",
      "evidence_location": "Query execution timing report in reports/query_perf.json",
      "pass_criterion": "p95 latency < 65.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "2,000 concurrent WebSocket clients connected continuously for 10 minutes",
      "action": "npm run test:concurrency-soak -- --clients 2000 --duration 600",
      "expected_result": "Node.js server maintains all 2,000 connections with 0 socket disconnects and memory < 250MB",
      "evidence_location": "Concurrency soak test log in reports/concurrency_audit.json",
      "pass_criterion": "2,000 active connections maintained with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated multi-process horizontal fan-out across 2 Node.js cluster workers",
      "action": "npm run test:cluster-fanout",
      "expected_result": "Redis Pub/Sub successfully routes messages to clients connected across both worker processes",
      "evidence_location": "Cluster routing audit report in reports/cluster_audit.json",
      "pass_criterion": "All messages received across worker partitions with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Single synthetic $10,000 transaction event published to ingestion API",
      "action": "node ./scripts/verify_live_update.js --amount 10000",
      "expected_result": "Connected browser client receives WebSocket update and increments total revenue display within 100ms",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms revenue counter incremented by 10000 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected analytics dashboard in TypeScript and React using Node.js and WebSockets; achieved sub-[BROADCAST_LATENCY] millisecond broadcast latency across [CONCURRENT_CLIENTS] concurrent clients, and sustained sub-[QUERY_LATENCY] millisecond analytical query rollups.",
    "claims": [
      {
        "text": "achieved sub-[BROADCAST_LATENCY] millisecond broadcast latency across [CONCURRENT_CLIENTS] concurrent clients",
        "rubric_indexes": [0]
      },
      {
        "text": "sustained sub-[QUERY_LATENCY] millisecond analytical query rollups",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "commercial data warehouse deployment or multi-petabyte analytics clustering"
  },
  "verify": [
    "Run `npm test` to confirm WebSocket routing, Redis Pub/Sub handlers, and React components pass.",
    "Execute `npm run bench:websocket` to verify broadcast latency remains < 50ms across 2,000 clients.",
    "Run `node ./scripts/verify_live_update.js` to assert real-time transaction counter updates."
  ],
  "worksheet": {
    "q1": "Core deliverable: a real-time business intelligence dashboard in TypeScript and React with Node.js WebSockets, Redis Pub/Sub, and PostgreSQL.",
    "q2": "Target users: full-stack web developers, frontend systems architects, and real-time data platform engineers.",
    "q3": "3 use cases: e-commerce flash-sale monitoring, fintech payment gateway anomaly ops, and SaaS ARR subscription metrics.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: 2,000 concurrent WebSocket connections, Redis Pub/Sub horizontal fan-out, fast PostgreSQL window rollups, and 60 FPS live rendering.",
    "q6": "Starter input: React dashboard scaffolding, Node.js WebSocket gateway, Redis Pub/Sub wrapper, and PostgreSQL DDLs. Synthetic transaction data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker PostgreSQL and Redis.",
    "q8": "Riskiest component: slow-consumer buffer bloat in WebSockets. Fallback: bounded send buffers and frame dropping for lagging clients.",
    "q9": "Potential faking: polling REST APIs pretending to be real-time. Anti-fake check 5 publishes a $10,000 event and asserts WebSocket counter increment within 100ms.",
    "q10": "Safe; synthetic financial records and private local Docker containers only."
  }
}

b60_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, WebSocket scaling specs, and fan-out mechanics | High |
| Tech Stack | React, TypeScript, Node.js, WebSockets, PostgreSQL, Redis | Listed tools without explicit operational roles or data flow boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete broadcast latency thresholds, concurrency bounds, and live state update tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b60_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js, Redis, and PostgreSQL in Docker at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Broadcast latency (< 50ms), query latency (< 65ms on 1M rows), and connection concurrency (2,000 clients) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local SQLite database and in-memory event emitters if Docker containers are unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic transaction generator and automated load test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial cloud BI suites (Looker/Tableau), petabyte data warehouses, and 3D WebGL graphics.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 publishes a $10,000 transaction and verifies real-time revenue counter increment in under 100ms.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b60_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved drag-and-drop layout builder and anomaly alerts to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic streaming dashboard metrics (broadcast latency, PostgreSQL rollup speed, and WebSocket concurrency).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake live transaction revenue update verification.
"""

# ==============================================================================
# 61. brief-realtime-code-execution
# ==============================================================================
b61_data = {
  "id": "brief-realtime-code-execution",
  "title": "Secure Remote Code Execution Sandbox in Go with Linux Namespaces, cgroups v2 & seccomp BPF Syscall Filtering",
  "domain": "Security & Platform",
  "difficulty": "ADVANCED",
  "project_types": ["Systems programming", "Security tool"],
  "problem": "Online code assessment platforms, interactive coding sandboxes, and continuous integration runners need to execute untrusted user-submitted code at high concurrency. Naive execution directly on host operating systems exposes servers to catastrophic remote code execution (RCE) attacks, denial-of-service fork bombs, network port scanning, and host filesystem tampering. Relying on heavy full-system virtual machines introduces multi-second boot latency and unsustainable compute costs. This project builds a production-grade secure remote code execution engine and judge sandbox from scratch in Go. The system enforces strict process containment using Linux Namespaces (Mount, PID, Network, IPC, UTS), restricts CPU time and memory quotas with cgroups v2, filters dangerous kernel syscalls using seccomp BPF profiles, and executes code in under 120ms with zero host escape vulnerabilities.",
  "use_cases": [
    {
      "title": "Competitive Programming & Automated Assessment Judge",
      "first_sentence": "Online algorithmic evaluation platforms need to compile and execute thousands of untrusted Python, C++, and Go solutions submitted simultaneously by candidates.",
      "second_sentence": "The engine runs each submission inside an isolated micro-sandbox, comparing standard output against test fixtures and enforcing strict execution time and memory limits."
    },
    {
      "title": "AI Agent Sandboxed Tool Execution Environment",
      "first_sentence": "Autonomous LLM coding agents generating dynamic Python scripts require a secure runtime environment to test code without risking host machine deletion.",
      "second_sentence": "The sandbox provides an ephemeral filesystem overlay, executing agent code with network isolation and returning execution outputs or stack traces safely."
    },
    {
      "title": "Continuous Integration Micro-Build Container Runner",
      "first_sentence": "Developer platform teams need fast, lightweight sandboxes to run untrusted third-party pull request scripts and unit test suites.",
      "second_sentence": "The sandbox isolates build tasks using cgroups v2 quotas, preventing runaway infinite loops or resource-hogging background crypto miners from degrading cluster nodes."
    }
  ],
  "hard_parts": [
    "Configuring isolated Linux namespaces (unshare clone flags) and pivot_root filesystems with zero residual access to the host root filesystem",
    "Writing custom seccomp BPF filter rules blocking dangerous system calls (clone without flags, ptrace, reboot, mount) while permitting safe language runtime operations",
    "Enforcing precise cgroups v2 CPU quotas, memory limits, and pids.max thresholds to neutralize fork-bomb exploits and OOM panics",
    "Managing high-concurrency ephemeral execution worker pools in Go with context timeouts and clean resource reclamation in sub-120ms"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating the sandbox supervisor, namespace isolation routines, cgroups v2 controllers, seccomp filters, and execution worker queues",
    "Security penetration report proving complete containment across 5 attack vectors: fork bomb, host file access, network socket creation, memory exhaustion, and privilege escalation",
    "Anti-fake verification script attempting to read `/etc/shadow` from the host filesystem inside the sandbox and asserting `PERMISSION_DENIED` / file not found"
  ],
  "job_families": [
    "Systems Security Software Engineer",
    "Platform Infrastructure Engineer",
    "Core Linux Systems Developer"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems language implementing the sandbox supervisor, process executor, and worker queue"},
    {"tool": "Linux Namespaces", "role": "kernel isolation primitives creating private mount, PID, network, IPC, and UTS views"},
    {"tool": "cgroups", "role": "control groups v2 restricting CPU bandwidth, memory limits, and maximum process counts"},
    {"tool": "seccomp", "role": "secure computing mode BPF filters blocking disallowed system calls at the kernel boundary"},
    {"tool": "Docker", "role": "containerization tool providing reproducible minimal rootfs base images for compiler toolchains"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Sandbox Process Isolation Supervisor & Namespace Manager",
        "tools_used": ["Go", "Linux Namespaces"],
        "purpose": "Configures unshare clone flags, mounts private proc/tmpfs, executes pivot_root, and switches to unprivileged UID"
      },
      {
        "name": "cgroups v2 Resource Limiter & Quota Enforcement Daemon",
        "tools_used": ["Go", "cgroups"],
        "purpose": "Creates ephemeral cgroup slices, writes cpu.max, memory.max, and pids.max, and monitors throttling counters"
      },
      {
        "name": "seccomp BPF Syscall Filtering & Security Hardening Layer",
        "tools_used": ["Go", "seccomp"],
        "purpose": "Compiles BPF filter programs, whitelists required runtime syscalls, and kills processes invoking forbidden syscalls"
      },
      {
        "name": "Multi-Language Compilation & Execution Pipeline in Go",
        "tools_used": ["Go", "Docker"],
        "purpose": "Compiles and executes Python, C++, and Go source files within language-specific rootfs environments"
      },
      {
        "name": "Asynchronous Job Queue Worker & Memory Pool Manager",
        "tools_used": ["Go"],
        "purpose": "Orchestrates concurrent job execution, captures stdout/stderr, enforces timeout cancellation, and cleans up cgroups"
      },
      {
        "name": "Sandboxed Security Penetration & Fork-Bomb Benchmark Harness",
        "tools_used": ["Go", "cgroups", "seccomp"],
        "purpose": "Executes 5 malicious exploit scripts and measures sandbox startup latency under 100 concurrent execution jobs"
      },
      {
        "name": "Execution Engine Security Architecture & Threat Model Manual",
        "tools_used": ["Go", "Linux Namespaces"],
        "purpose": "Documents Linux kernel attack surface mitigations, seccomp whitelist specifications, and cgroups v2 controller setups"
      }
    ],
    "data_flow": "A client submits source code and execution parameters to the Go supervisor; the supervisor pulls an execution worker from the pool, writes the code to a temporary tmpfs directory, and creates a dedicated cgroup v2 slice setting memory limit to 128MB and pids limit to 20; the supervisor forks an isolated process with new PID, Mount, Network, and IPC namespaces; the child process executes pivot_root to bind a minimal read-only rootfs, applies the seccomp BPF filter to restrict syscalls, drops privileges to UID 65534 (nobody), and execs the compiler/interpreter; the supervisor monitors execution duration; upon completion or timeout, it captures stdout/stderr, records execution telemetry, destroys the cgroup slice, and returns the verdict JSON.",
    "enforcement_mechanism": "Kernel-level seccomp SECCOMP_RET_KILL on unauthorized syscalls; cgroups v2 memory.max OOM killer bounding RAM usage."
  },
  "targets": [
    {
      "metric": "Sandboxed Code Execution Cold-Start Latency",
      "method": "Wall-clock timing from job receipt to completed execution and output capture for a simple C++/Python script",
      "input": "1,000 standard algorithmic execution requests submitted across 10 concurrent worker goroutines",
      "environment": "Standard 4-core local CPU with Linux kernel 5.15+ (or WSL2 on Windows) with cgroups v2 enabled",
      "minimum_pass": "p95 execution cold-start latency is < 180 milliseconds",
      "target": "p95 execution cold-start latency is < 85 milliseconds",
      "report": "Sandbox execution latency profiling log and duration distribution table"
    },
    {
      "metric": "Host Escape & Filesystem Containment Defense Rate",
      "method": "Percentage of simulated malicious exploit scripts neutralized without host penetration or data leakage",
      "input": "50 malicious scripts executing fork-bombs, `/etc/shadow` file reads, raw socket creation, and cgroup escape attempts",
      "environment": "Automated security penetration test harness running under dedicated non-root test user",
      "minimum_pass": "50 of 50 malicious exploit scripts successfully neutralized with 0 host compromise",
      "target": "50 of 50 malicious exploit scripts successfully neutralized with 0 host compromise",
      "report": "Sandbox security penetration test audit log and vulnerability assessment report"
    },
    {
      "metric": "Fork-Bomb Process Quota Suppression Latency",
      "method": "Duration from fork-bomb process trigger (`:(){ :|:& };:`) to cgroups v2 PID suppression without host CPU starvation",
      "input": "20 repeated fork-bomb execution trials injected into isolated sandbox containers",
      "environment": "cgroups v2 slice with pids.max=20 running under Linux kernel supervisor",
      "minimum_pass": "Fork-bomb suppressed in < 15.0 milliseconds with 0 impact on host CPU responsiveness",
      "target": "Fork-bomb suppressed in < 4.5 milliseconds with 0 impact on host CPU responsiveness",
      "report": "cgroups v2 PID containment audit log and host CPU monitoring trace"
    }
  ],
  "skills": ["Go", "Linux Namespaces", "cgroups", "seccomp", "Docker", "Systems Programming", "Security"],
  "starter_input": {
    "spec": "Directory containing Go sandbox supervisor scaffolding, seccomp BPF policy definitions, cgroups v2 helper, and exploit test suite.",
    "size": "10 Go source packages, seccomp JSON policy files, minimal Alpine rootfs tarball, and 5 exploit test scripts",
    "seeded_cases": "Fork bomb infinite subprocess recursion, port scanning socket creation, and memory allocation exhaustion loops",
    "label_source": "Deterministic process exit codes, cgroup event logs, and seccomp violation dmesg audit logs",
    "personal_data_policy": "Strictly mock synthetic code submissions and simulated algorithmic test inputs; no real personal data used"
  },
  "components": [
    {"name": "Sandbox Process Isolation Supervisor & Namespace Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "cgroups v2 Resource Limiter & Quota Enforcement Daemon", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "seccomp BPF Syscall Filtering & Security Hardening Layer", "task_type": "security hardening checks", "hours": 6.0},
    {"name": "Multi-Language Compilation & Execution Pipeline in Go", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Asynchronous Job Queue Worker & Memory Pool Manager", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Sandboxed Security Penetration & Fork-Bomb Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Execution Engine Security Architecture & Threat Model Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "User namespace mapping (newuidmap / newgidmap) enabling rootless unprivileged container execution",
      "OverlayFS copy-on-write temporary storage layers recycling rootfs images across executions",
      "eBPF execution telemetry capturing network packet attempts and detailed syscall latency metrics"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Namespace Process Isolation & Rootfs Mounting in Go and Linux Namespaces",
      "hours": 10,
      "done_criterion": "Supervisor spawns process in private namespaces; pivot_root isolates filesystem to minimal rootfs."
    },
    {
      "name": "cgroups v2 Quota Limiting & Resource Enforcement in cgroups and Systems Programming",
      "hours": 10,
      "done_criterion": "cgroups v2 limits CPU and memory; fork bombs suppress in < 15ms without host starvation."
    },
    {
      "name": "seccomp BPF Syscall Filtering & Multi-Language Support in seccomp and Docker",
      "hours": 10,
      "done_criterion": "seccomp BPF blocks forbidden syscalls; Python and C++ execute safely in sub-180ms."
    },
    {
      "name": "Exploit Containment Anti-Fake Test & Docs in Security",
      "hours": 10,
      "done_criterion": "Anti-fake test confirms host /etc/shadow read fails; security threat model documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, low-level process spawning (os/exec, syscall packages), and concurrency",
    "Deep understanding of Linux kernel isolation primitives (Namespaces, cgroups v2, seccomp BPF filters, and pivot_root)"
  ],
  "environment": {
    "os": "Linux (Ubuntu 22.04+) or Windows WSL2 with Linux kernel 5.15+",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and Linux kernel bound systems software)",
    "cost": "$0 (fully open-source Go codebase using standard Linux kernel features)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Linux kernel supporting cgroups v2, root/sudo access (for initial namespace setup), and Go 1.21+",
    "fallback_path": "Docker containerized test harness (`--privileged` or `--cap-add=SYS_ADMIN`) if running on Windows WSL2 or macOS"
  },
  "riskiest_component": {
    "name": "Kernel Exploits and Improper Syscall Whitelist Configuration",
    "mitigation": "Enforce a strict default-kill seccomp BPF policy, permit only minimal necessary syscalls, and drop all Linux capabilities.",
    "fallback": "Execute sandbox processes inside a secondary unprivileged Docker container layer."
  },
  "deliverables": [
    "Git repository containing Go sandbox supervisor, seccomp BPF policies, cgroups v2 manager, and CLI runner",
    "Minimal rootfs creation scripts and multi-language compilation drivers (Python, C++, Go)",
    "Automated exploit penetration test suite verifying containment against 5 attack vectors",
    "Screener verification script executing automated benchmark and dynamic exploit neutralization in under 3 minutes"
  ],
  "out_of_scope": [
    "Hardware-level microVM virtualization (AWS Firecracker / QEMU)",
    "Distributed multi-cluster container orchestration (Kubernetes CRI)",
    "Windows native container isolation (Job Objects / Windows Sandbox)"
  ],
  "safety_note": None,
  "resources": [
    "Linux Manual Pages: clone(2), namespaces(7), cgroups(7), seccomp(2)",
    "The Linux Programming Interface (Michael Kerrisk - Process Isolation Chapters)",
    "Building a Container from Scratch in Go (Liz Rice Architecture Reference)"
  ],
  "rubric": [
    {
      "input": "1,000 standard algorithmic execution requests submitted across 10 concurrent workers",
      "action": "go run ./cmd/bench_executor --jobs 1000 --concurrency 10",
      "expected_result": "Sandbox executes code and captures outputs with p95 cold-start latency < 180ms",
      "evidence_location": "Terminal output log and reports/execution_latency.json",
      "pass_criterion": "p95 latency < 180ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Fork-bomb script (`:(){ :|:& };:`) executed inside sandbox with pids.max=20",
      "action": "go test -v ./sandbox/... -run TestForkBombSuppression",
      "expected_result": "cgroups v2 blocks new process creation; fork bomb terminates in < 15ms with 0 host CPU freeze",
      "evidence_location": "Process containment audit log in reports/forkbomb_audit.json",
      "pass_criterion": "Process contained with exit code 0 and host CPU unaffected",
      "kind": "normal"
    },
    {
      "input": "Exploit script attempting to open raw network socket inside sandbox",
      "action": "go test -v ./security/... -run TestNetworkNamespaceIsolation",
      "expected_result": "Network namespace blocks socket creation; process receives network unreachable error",
      "evidence_location": "Network security test report in reports/network_audit.json",
      "pass_criterion": "Socket creation rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Memory exhaustion script allocating 500MB inside 128MB memory.max cgroup",
      "action": "go test -v ./sandbox/... -run TestOOMSuppression",
      "expected_result": "cgroup OOM killer terminates process cleanly; supervisor reports exit status 'MEMORY_LIMIT_EXCEEDED'",
      "evidence_location": "Memory limit audit log in reports/oom_audit.json",
      "pass_criterion": "OOM handled cleanly with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Malicious code submission attempting to read `/etc/shadow` from the host filesystem",
      "action": "go run ./scripts/verify_host_containment.go --target-file /etc/shadow",
      "expected_result": "Sandbox pivot_root isolation blocks access; process receives file not found / access denied",
      "evidence_location": "Dynamic security verification console execution output log",
      "pass_criterion": "Console confirms access denied / file not found with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected secure remote code execution sandbox in Go using Linux namespaces and cgroups; achieved sub-[COLD_START_LATENCY] millisecond execution cold-start latency, and neutralized [EXPLOIT_COUNT] exploit attack vectors with seccomp BPF syscall filtering.",
    "claims": [
      {
        "text": "achieved sub-[COLD_START_LATENCY] millisecond execution cold-start latency",
        "rubric_indexes": [0]
      },
      {
        "text": "neutralized [EXPLOIT_COUNT] exploit attack vectors with seccomp BPF syscall filtering",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "hardware microVM virtualization or production Kubernetes CRI daemon integration"
  },
  "verify": [
    "Run `go test -v ./...` to confirm namespace creation, cgroup limiting, and seccomp filters pass.",
    "Execute `go run ./cmd/bench_executor` to verify cold-start latency remains < 180ms.",
    "Run `go run ./scripts/verify_host_containment.go` to assert host filesystem access is completely blocked."
  ],
  "worksheet": {
    "q1": "Core deliverable: a secure remote code execution engine in Go using Linux namespaces, cgroups v2, and seccomp BPF filters.",
    "q2": "Target users: systems security software engineers, platform infrastructure developers, and core Linux systems engineers.",
    "q3": "3 use cases: competitive programming evaluation, AI agent sandboxed tool execution, and CI micro-build runners.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Linux namespaces pivot_root isolation, seccomp BPF syscall whitelisting, cgroups v2 pids/memory enforcement, and sub-120ms cold-start cleanup.",
    "q6": "Starter input: Go supervisor scaffolding, seccomp BPF policies, cgroups v2 helper, and exploit test suite. Synthetic test programs only.",
    "q7": "Hardware: Linux (or Windows WSL2), 8GB RAM, CPU bound, $0 cost, zero cloud keys. Fallback: Docker container with SYS_ADMIN capability.",
    "q8": "Riskiest component: kernel exploits and improper syscall whitelists. Fallback: strict default-kill seccomp policies and dropping all capabilities.",
    "q9": "Potential faking: executing code directly on host without containment. Anti-fake check 5 attempts to read `/etc/shadow` from host and asserts access is completely denied.",
    "q10": "Safe; synthetic benchmark scripts and isolated local test environments only."
  }
}

b61_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, cgroups v2 specs, and seccomp filtering rules | High |
| Tech Stack | Go, Docker, seccomp, Linux Namespaces, cgroups | Listed tools without explicit operational roles or sandbox lifecycle boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete cold-start latency bounds, fork-bomb suppression thresholds, and penetration tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b61_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Linux (or Windows WSL2) with standard kernel features at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Cold-start latency (< 180ms), exploit containment (50 of 50), and fork-bomb suppression (< 15ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Running inside a Docker container with SYS_ADMIN capabilities on Windows or macOS if native Linux is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic algorithmic test programs and automated exploit scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: hardware microVMs (Firecracker), Kubernetes CRI daemons, and Windows containers.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 attempts to read `/etc/shadow` from host filesystem inside sandbox and verifies access denial.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b61_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved rootless user namespaces and OverlayFS recycling to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic sandbox metrics (cold-start latency, exploit containment rate, and fork-bomb suppression).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake host filesystem containment test.
"""

# ==============================================================================
# 62. brief-realtime-collab
# ==============================================================================
b62_data = {
  "id": "brief-realtime-collab",
  "title": "Real-Time Collaborative Document Canvas in TypeScript with Yjs CRDTs, WebSockets & IndexedDB Offline Sync",
  "domain": "Full-Stack Web",
  "difficulty": "ADVANCED",
  "project_types": ["Full-stack web", "Distributed systems"],
  "problem": "Collaborative web applications (digital whiteboards, multi-cursor document editors, and design canvases) suffer from text jumping, cursor desynchronization, and silent data loss when multiple users edit concurrently over high-latency or intermittent networks. Centralized lock-based synchronization introduces unacceptable UI freezes, while naive operational transformation (OT) engines require complex central coordination servers that fail when network connections drop. This project builds a production-grade real-time collaborative document and canvas editor in TypeScript and React. The system resolves concurrent character and geometric mutations deterministically using Yjs Conflict-Free Replicated Data Types (CRDTs), streams binary update vectors over WebSockets with sub-25ms latency, stores local document snapshots and uncommitted deltas in IndexedDB, and renders multi-peer awareness presence cursors with zero layout stutter.",
  "use_cases": [
    {
      "title": "Cross-Functional Digital Architecture Whiteboard",
      "first_sentence": "Distributed engineering and design teams sketching system architecture diagrams need to co-edit geometric nodes and connectors simultaneously without locking.",
      "second_sentence": "The canvas syncs Yjs shared map data structures over WebSockets, converging node positions deterministically even when two engineers move the same node concurrently."
    },
    {
      "title": "Multi-Author Collaborative Rich-Text Policy Drafting",
      "first_sentence": "Legal counsel and compliance officers co-drafting regulatory compliance policies need seamless real-time typing with character-level attribution.",
      "second_sentence": "The editor binds Yjs shared text types to rich-text views, rendering peer presence cursors and merging concurrent typing deltas without character transposition."
    },
    {
      "title": "Offline-to-Online Field Operations Report Collaboration",
      "first_sentence": "Emergency response coordinators drafting incident mitigation plans frequently lose Wi-Fi connectivity while walking between disaster command centers.",
      "second_sentence": "The web app persists document updates locally in IndexedDB, automatically synchronizing state vectors and converging with remote edits upon network reconnection."
    }
  ],
  "hard_parts": [
    "Integrating Yjs binary CRDT state vector encoding with custom React state hooks without causing excessive DOM re-renders during high-frequency typing",
    "Managing ephemeral user awareness states (cursor coordinates, active selection spans, user profile avatars) over WebSockets with automatic timeout cleanup",
    "Designing an IndexedDB storage adapter that caches compact document snapshots and replays uncommitted CRDT delta buffers upon browser reload",
    "Handling complex concurrent editing conflicts (simultaneous text insertions, deletions, and block repositioning) while maintaining mathematical convergence across 50 simulated clients"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating React canvas UI components, Yjs CRDT state bindings, WebSocket room synchronizers, and IndexedDB storage adapters",
    "Multi-client concurrent chaos test report proving 100 of 100 simulated conflicting edits converge to mathematically identical document state across 5 concurrent peers",
    "Anti-fake verification script simulating two partitioned clients concurrently inserting conflicting words at index 0, reconnecting, and asserting identical converged text across both browser instances"
  ],
  "job_families": [
    "Frontend Systems Architect",
    "Full-Stack Web Developer",
    "Distributed Collaborative Systems Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language shared across frontend React views, CRDT state logic, and backend room coordinators"},
    {"tool": "React", "role": "frontend component framework rendering collaborative rich-text canvas and peer presence cursors"},
    {"tool": "WebSockets", "role": "bi-directional binary protocol streaming Yjs document update vectors and awareness frames"},
    {"tool": "Node.js", "role": "runtime hosting the collaborative room coordinator, binary relays, and persistence adapters"},
    {"tool": "Yjs", "role": "shared data type CRDT library resolving concurrent text and canvas mutations deterministically"},
    {"tool": "IndexedDB", "role": "browser client-side storage persisting offline document state and local uncommitted delta logs"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Yjs CRDT Document State Machine & Conflict Resolution Core",
        "tools_used": ["TypeScript", "Yjs"],
        "purpose": "Manages Y.Doc instances, shared text/maps, binary state vectors, and deterministic concurrent conflict merges"
      },
      {
        "name": "IndexedDB Local Persistence & Offline Delta Sync Adapter",
        "tools_used": ["TypeScript", "IndexedDB", "Yjs"],
        "purpose": "Persists binary document state updates to IndexedDB and reloads cached documents instantly upon browser restart"
      },
      {
        "name": "WebSocket Room Coordinator & Binary Awareness Protocol",
        "tools_used": ["TypeScript", "Node.js", "WebSockets"],
        "purpose": "Routes binary CRDT updates between active room peers and broadcasts client cursor awareness coordinates"
      },
      {
        "name": "Collaborative Canvas UI with Multi-User Presence Cursors in React",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Renders real-time document editor, animated peer cursors, selection highlights, and online/offline status banners"
      },
      {
        "name": "Server Document Snapshot & LevelDB Log Store",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Compacts document updates into authoritative snapshots and persists immutable transaction logs for recovery"
      },
      {
        "name": "Concurrent Multi-User Chaos Editing Benchmark Harness",
        "tools_used": ["TypeScript", "Node.js", "Yjs"],
        "purpose": "Simulates 50 concurrent virtual users issuing 5,000 conflicting edits and asserts mathematical state parity"
      },
      {
        "name": "Collaborative CRDT Protocol Guide & Sync Architecture Diagram",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Documents state vector exchanges, awareness heartbeat protocols, and IndexedDB compaction strategies"
      }
    ],
    "data_flow": "A user types a character in the React editor; the local Yjs binding generates a compact binary update vector and writes it to IndexedDB in < 10ms; the WebSocket synchronizer streams the binary payload over WebSockets; the Node.js room coordinator verifies the frame, saves it to the document update log, and broadcasts the frame to all other peers in the room; remote peers apply the update to their local Y.Doc instances, which deterministically merges the change and updates the React DOM via Yjs event listeners; simultaneously, mouse movements stream awareness updates (x, y coordinates) to render animated peer cursor flags.",
    "enforcement_mechanism": "Mathematically proven commutative, associative, and idempotent CRDT merge operations eliminating conflict resolution ordering dependencies."
  },
  "targets": [
    {
      "metric": "Cross-Client Real-Time Delta Propagation Latency",
      "method": "Wall-clock timing from peer A keystroke dispatch over WebSocket to peer B DOM update rendering across simulated local network",
      "input": "1,000 sequential typing and canvas mutations streamed between 2 connected browser client sessions",
      "environment": "Standard 4-core local CPU with Node.js WebSocket server and 2 automated headless Chromium sessions",
      "minimum_pass": "p95 cross-client update propagation latency is < 45.0 milliseconds",
      "target": "p95 cross-client update propagation latency is < 18.0 milliseconds",
      "report": "WebSocket delta propagation timing report and latency distribution table"
    },
    {
      "metric": "Concurrent Conflict Resolution Convergence Rate",
      "method": "Percentage of simulated multi-client concurrent editing trials resulting in mathematically identical document state",
      "input": "50 concurrent conflict trials where 5 simulated clients issue 100 overlapping edits while partitioned",
      "environment": "Node.js CRDT chaos test runner simulating network packet delays and out-of-order frame delivery",
      "minimum_pass": "50 of 50 conflict trials achieve identical converged state across each of 5 clients",
      "target": "50 of 50 conflict trials achieve identical converged state across each of 5 clients",
      "report": "CRDT convergence audit log and document content hash verification"
    },
    {
      "metric": "Offline Cold-Start Document Reload Latency",
      "method": "Wall-clock timing to restore complete document state from IndexedDB cache during browser cold reload with network disconnected",
      "input": "Document containing 5,000 words and 200 geometric canvas elements restored from local storage",
      "environment": "Headless Chromium browser session running under offline network emulation",
      "minimum_pass": "p95 offline document restoration latency is < 50.0 milliseconds",
      "target": "p95 offline document restoration latency is < 16.5 milliseconds",
      "report": "IndexedDB document reload benchmark log and state reconstruction timing"
    }
  ],
  "skills": ["TypeScript", "React", "WebSockets", "Node.js", "Yjs", "IndexedDB", "Full-Stack Web", "CRDTs"],
  "starter_input": {
    "spec": "Directory containing React collaborative canvas scaffolding, Yjs CRDT binding, Node.js WebSocket server, and chaos test runner.",
    "size": "14 TypeScript source files, 2 HTML test fixture pages, and automated multi-client chaos test scripts",
    "seeded_cases": "Simultaneous character insertions at same string index, out-of-order binary WebSocket frames, and mid-session network disconnects",
    "label_source": "Deterministic Yjs mathematical state invariants and SHA-256 document content checksum assertions",
    "personal_data_policy": "Strictly mock synthetic document text and simulated canvas shapes; no real personal data used"
  },
  "components": [
    {"name": "Yjs CRDT Document State Machine & Conflict Resolution Core", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "IndexedDB Local Persistence & Offline Delta Sync Adapter", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "WebSocket Room Coordinator & Binary Awareness Protocol", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Collaborative Canvas UI with Multi-User Presence Cursors in React", "task_type": "one UI view with state", "hours": 5.0},
    {"name": "Server Document Snapshot & LevelDB Log Store", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Concurrent Multi-User Chaos Editing Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Collaborative CRDT Protocol Guide & Sync Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Undo/redo history manager with multi-user selective attribution tracking local mutations without reverting peer edits",
      "WebRTC peer-to-peer mesh fallback allowing direct browser-to-browser synchronization during server outages",
      "End-to-end document encryption encrypting Yjs binary updates with client-side AES-GCM keys"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Yjs CRDT Core & WebSocket Room Coordinator in TypeScript, Yjs and Node.js",
      "hours": 10,
      "done_criterion": "WebSocket server coordinates rooms; Yjs binary updates stream and merge deterministically."
    },
    {
      "name": "IndexedDB Offline Delta Sync & Local Storage in IndexedDB and WebSockets",
      "hours": 10,
      "done_criterion": "Document updates persist in IndexedDB; offline reload restores document in < 50ms."
    },
    {
      "name": "Collaborative Canvas UI & Presence Awareness in React and Full-Stack Web",
      "hours": 10,
      "done_criterion": "React UI renders multi-user presence cursors; typing deltas propagate with p95 latency < 45ms."
    },
    {
      "name": "Concurrent Chaos Convergence Anti-Fake Test & Docs in CRDTs",
      "hours": 10,
      "done_criterion": "Anti-fake test confirms 50 of 50 concurrent conflict trials converge identically; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in modern TypeScript, React, and asynchronous JavaScript programming",
    "Understanding of CRDT mathematical principles (Yjs), binary WebSocket framing, and browser storage (IndexedDB)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and browser event loop bound web applications)",
    "cost": "$0 (fully open-source stack using local Node.js and browser)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+, modern Chromium/Chrome browser, and npm",
    "fallback_path": "Running tests in headless Chromium or automated Node.js virtual clients without GUI"
  },
  "riskiest_component": {
    "name": "Memory Leaks and Tombstone Bloat in CRDT History Logs",
    "mitigation": "Execute periodic server-side Yjs document compaction and snapshotting to prune unreferenced deletion tombstones.",
    "fallback": "Client-side state vector catch-up discarding delta history older than 7 days."
  },
  "deliverables": [
    "Git repository containing React collaborative canvas, Yjs CRDT binding, Node.js WebSocket server, and tests",
    "Automated Playwright multi-client test suite verifying real-time sync and peer cursor rendering",
    "Chaos testing harness simulating concurrent editing conflicts and network partitions",
    "Screener verification script executing automated 50-trial conflict convergence test in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial cloud whiteboard SaaS integrations (Miro / Figma plugins)",
    "Complex 3D graphics rendering or CAD geometry solids",
    "Native mobile app compilation"
  ],
  "safety_note": None,
  "resources": [
    "Yjs Architecture and CRDT Theory Documentation (Kevin Jahns)",
    "Conflict-Free Replicated Data Types (Shapiro et al., Inria Research Report)",
    "Real-Time Collaboration with WebSockets and CRDTs (Martin Kleppmann)"
  ],
  "rubric": [
    {
      "input": "1,000 typing mutations streamed between 2 connected browser clients",
      "action": "npm run bench:delta-latency -- --mutations 1000",
      "expected_result": "WebSocket streams deltas with p95 cross-client update latency < 45.0ms",
      "evidence_location": "Terminal output log and reports/delta_latency.json",
      "pass_criterion": "p95 latency < 45.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 concurrent conflict trials where 5 clients edit overlapping text simultaneously",
      "action": "npm run test:chaos-convergence -- --trials 50 --clients 5",
      "expected_result": "50 of 50 trials achieve identical converged document content across each of 5 clients",
      "evidence_location": "Chaos convergence audit log in reports/convergence_audit.json",
      "pass_criterion": "50 of 50 trials converge with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Document containing 5,000 words restored from IndexedDB during offline reload",
      "action": "npm run test:offline-reload",
      "expected_result": "IndexedDB adapter loads and parses cached Y.Doc binary state in < 50.0ms",
      "evidence_location": "Offline reload benchmark report in reports/reload_perf.json",
      "pass_criterion": "Reload latency < 50.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Active mouse movements streamed across 5 connected client canvas sessions",
      "action": "npm run test:presence-cursors -- --clients 5",
      "expected_result": "WebSocket broadcasts awareness state; all 5 clients render active peer cursor coordinates",
      "evidence_location": "Presence awareness test log in reports/awareness_audit.json",
      "pass_criterion": "5 active cursor positions verified with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Two partitioned clients inserting conflicting words at index 0 concurrently",
      "action": "node ./scripts/verify_dynamic_crdt.js --clientA-text 'Alpha ' --clientB-text 'Beta '",
      "expected_result": "Upon reconnection, both clients converge to mathematically identical string (e.g. 'Alpha Beta ')",
      "evidence_location": "Dynamic CRDT verification console execution output log",
      "pass_criterion": "Console confirms identical text on both clients with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected collaborative canvas application in TypeScript and React using Yjs CRDTs; delivered sub-[PROPAGATION_LATENCY] millisecond cross-client update propagation, and maintained document convergence across [CONFLICT_TRIALS] concurrent editing trials.",
    "claims": [
      {
        "text": "delivered sub-[PROPAGATION_LATENCY] millisecond cross-client update propagation",
        "rubric_indexes": [0]
      },
      {
        "text": "maintained document convergence across [CONFLICT_TRIALS] concurrent editing trials",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "commercial cloud whiteboard SaaS integrations or CAD geometry solids"
  },
  "verify": [
    "Run `npm test` to confirm Yjs CRDT bindings, WebSocket room coordinator, and React canvas views pass.",
    "Execute `npm run test:chaos-convergence` to verify mathematical convergence across multi-client conflict trials.",
    "Run `node ./scripts/verify_dynamic_crdt.js` to assert deterministic conflict resolution upon reconnection."
  ],
  "worksheet": {
    "q1": "Core deliverable: a real-time collaborative document and canvas editor in TypeScript and React with Yjs CRDTs, WebSockets, and IndexedDB.",
    "q2": "Target users: frontend systems architects, full-stack web developers, and distributed collaborative systems engineers.",
    "q3": "3 use cases: digital architecture whiteboard, multi-author rich-text policy drafting, and offline-to-online field report collaboration.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Yjs binary state vector integration with React, ephemeral awareness presence cursors, IndexedDB offline snapshot caching, and concurrent chaos convergence.",
    "q6": "Starter input: React canvas scaffolding, Yjs CRDT bindings, Node.js WebSocket server, and chaos test scripts. Synthetic document data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using local Node.js and browser.",
    "q8": "Riskiest component: memory leaks and tombstone bloat in CRDT logs. Fallback: server-side snapshot compaction and pruning.",
    "q9": "Potential faking: lock-based server synchronization pretending to be CRDTs. Anti-fake check 5 simulates two partitioned clients inserting conflicting text at index 0 and asserts mathematical convergence.",
    "q10": "Safe; synthetic canvas shapes and document text only, zero personal data."
  }
}

b62_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, Yjs CRDT specs, and awareness protocol rules | High |
| Tech Stack | TypeScript, React, WebSockets, Node.js, Yjs, IndexedDB | Listed tools without explicit operational roles or data flow boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete update latency bounds, convergence test counts, and offline reload thresholds | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b62_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Node.js and modern browser at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Propagation latency (< 45ms), conflict convergence (50 of 50 trials), and offline reload (< 50ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Headless Chromium browser automation or automated virtual Node.js clients without GUI dependencies.",
  "Can test data be created in minutes?": "YES. Synthetic canvas shapes and automated multi-client chaos test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial whiteboard SaaS plugins, complex 3D CAD engines, and native mobile apps.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 partitions two clients inserting conflicting text at index 0 and verifies identical string convergence upon reconnection.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b62_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved selective multi-user undo/redo and WebRTC P2P fallback to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic collaborative CRDT metrics (delta latency, chaos convergence, and offline reload).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake partitioned text insertion convergence test.
"""

# ==============================================================================
# 63. brief-realtime-stock-platform
# ==============================================================================
b63_data = {
  "id": "brief-realtime-stock-platform",
  "title": "Real-Time Stock Market Data Platform & Alert Engine with Python, Kafka, TimescaleDB & Redis",
  "domain": "FinTech Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Full-stack web", "Data pipeline"],
  "problem": "Retail investors and quantitative traders miss lucrative market opportunities and risk severe losses during flash crashes when trading platforms suffer from delayed quote updates, sluggish chart rendering, and unresponsive price alerts. Polling relational databases for market ticks introduces multi-second staleness and database lock contention under high-frequency tick volume. This project builds a production-grade real-time stock market data platform and alert engine in Python. The system ingests streaming trade ticks over Apache Kafka at 10,000+ ticks per second, generates 1-minute and 5-minute OHLCV candlestick bars in TimescaleDB hypertables, caches live ticker prices and trigger thresholds in Redis, evaluates dynamic price alerts with sub-12ms latency, and streams real-time market updates to React trading dashboards over WebSockets.",
  "use_cases": [
    {
      "title": "Algorithmic Day-Trading Price Spike Alerts",
      "first_sentence": "Active day traders monitoring volatile equities need instant notifications when a stock crosses a moving average or breaks out of a price range.",
      "second_sentence": "The alert engine evaluates incoming price ticks against Redis threshold sets in memory, pushing an alert to the trader's dashboard within 10 milliseconds of trigger."
    },
    {
      "title": "Real-Time Multi-Asset Portfolio Valuation",
      "first_sentence": "FinTech investment platforms managing customer equity portfolios require continuous net asset value (NAV) recalculations as asset prices fluctuate.",
      "second_sentence": "The system streams live price ticks over WebSockets, updating portfolio valuation totals and sector allocation charts in real time without screen reloads."
    },
    {
      "title": "Quantitative Backtesting & Historical OHLCV Analysis",
      "first_sentence": "Quantitative analysts designing automated trading strategies need fast access to historical multi-year candlestick bars for technical indicator calculations.",
      "second_sentence": "TimescaleDB continuous aggregates compute rolling 1-minute and 1-hour OHLCV candles, serving multi-year chart lookups in sub-30ms analytical query response times."
    }
  ],
  "hard_parts": [
    "Ingesting and aggregating high-velocity market tick streams in Kafka into 1-minute OHLCV candlestick bars without dropping out-of-order ticks",
    "Designing TimescaleDB hypertables with optimal chunk time intervals and continuous aggregate policies for fast analytical charting",
    "Evaluating thousands of active user price threshold alerts in Redis using sorted sets (ZREVRANGEBYSCORE) with sub-12ms evaluation latency",
    "Streaming real-time ticker quotes and candlestick updates over WebSockets to React trading dashboards with zero UI jank"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating Kafka tick consumers, TimescaleDB hypertable managers, Redis alert engines, and WebSocket push services",
    "Throughput benchmark proving sustained ingestion of 10,000+ market ticks per second with sub-12ms alert evaluation latency",
    "Anti-fake verification script setting an alert for 'AAPL >= 195.00', emitting a synthetic Kafka tick for AAPL at $195.50, and asserting the alert trigger notification fires in under 50 milliseconds"
  ],
  "job_families": [
    "FinTech Software Engineer",
    "Quantitative Platform Developer",
    "Real-Time Data Platform Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language powering Kafka stream consumers, alert evaluators, and API endpoints"},
    {"tool": "Kafka", "role": "distributed streaming broker capturing high-velocity market trade ticks and order book events"},
    {"tool": "TimescaleDB", "role": "time-series relational database storing hypertable candlestick bars and historical trades"},
    {"tool": "Redis", "role": "in-memory cache maintaining latest ticker prices and sorted set alert trigger registries"},
    {"tool": "React", "role": "frontend dashboard framework rendering live candlestick charts and real-time alert notifications"},
    {"tool": "WebSockets", "role": "streaming transport pushing live price quotes and candlestick bar updates to browser clients"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Kafka Market Tick Ingestion & OHLCV Bar Aggregator",
        "tools_used": ["Python", "Kafka"],
        "purpose": "Consumes raw trade tick streams from Kafka, aggregates ticks into rolling 1-minute OHLCV bars, and flushes to database"
      },
      {
        "name": "TimescaleDB Hypertable Storage & Continuous Aggregates Worker",
        "tools_used": ["Python", "TimescaleDB"],
        "purpose": "Manages time-series hypertables, defines retention policies, and computes multi-interval continuous aggregates"
      },
      {
        "name": "Redis Real-Time Price Cache & Dynamic Alert Evaluation Engine",
        "tools_used": ["Python", "Redis"],
        "purpose": "Caches current prices, indexes user price alerts in sorted sets, and evaluates triggers upon each incoming tick"
      },
      {
        "name": "WebSocket Streaming Gateway & Subscription Manager in Python",
        "tools_used": ["Python", "WebSockets"],
        "purpose": "Maintains client WebSocket connections, manages ticker symbol subscriptions, and streams quote updates"
      },
      {
        "name": "Market Feed Throughput & Alert Latency Benchmark Harness",
        "tools_used": ["Python", "Kafka", "TimescaleDB"],
        "purpose": "Generates 10,000 ticks/sec and benchmarks ingestion throughput, alert trigger latency, and database write performance"
      },
      {
        "name": "Stock Platform Architecture Guide & Hypertable Schema Manual",
        "tools_used": ["Python", "React"],
        "purpose": "Documents hypertable chunk sizing, Redis alert indexing algorithms, and React candlestick chart optimizations"
      }
    ],
    "data_flow": "Market data sources publish trade ticks to the Kafka 'stock-ticks' topic; the Python streaming worker consumes ticks, updates the latest price in Redis, and pushes price updates to the WebSocket gateway; the alert engine queries Redis sorted sets to identify triggered price alerts and emits alert events; simultaneously, the worker aggregates ticks into 1-minute OHLCV candlestick records and batches inserts into TimescaleDB; connected React clients receive real-time ticker updates over WebSockets, re-rendering candlestick charts and displaying alert notification modals; historical chart requests query TimescaleDB continuous aggregates via REST API.",
    "enforcement_mechanism": "Redis sorted set atomic score lookups preventing missed alert triggers; TimescaleDB hypertable constraints enforcing trade time validity."
  },
  "targets": [
    {
      "metric": "Sustained Market Tick Ingestion Throughput",
      "method": "Market ticks per second ingested, aggregated into OHLCV bars, and persisted across 100,000 benchmark ticks",
      "input": "100,000 synthetic market trade ticks streamed at 10,000 ticks per second across 50 simulated equity symbols",
      "environment": "Standard 4-core local CPU, Kafka and TimescaleDB in Docker, Python 3.11 with async workers",
      "minimum_pass": "Sustained ingestion throughput is >= 8,000 ticks per second",
      "target": "Sustained ingestion throughput is >= 18,500 ticks per second",
      "report": "Market data ingestion throughput benchmark report and write latency table"
    },
    {
      "metric": "Price Alert Evaluation & Trigger Latency",
      "method": "Wall-clock timing from price tick ingestion to alert dispatch notification across 1,000 active registered alerts",
      "input": "1,000 active price threshold alerts registered in Redis across 50 equity ticker symbols",
      "environment": "Redis 7+ in Docker with local Python alert evaluation worker",
      "minimum_pass": "p95 alert evaluation latency is < 20.0 milliseconds",
      "target": "p95 alert evaluation latency is < 8.5 milliseconds",
      "report": "Alert evaluation timing report and notification dispatch log"
    },
    {
      "metric": "TimescaleDB Historical Candlestick Query Latency",
      "method": "Execution timing to query and return 30-day 1-hour OHLCV candlestick chart data across 1,000,000 historical ticks",
      "input": "100 repeated historical chart queries issued against TimescaleDB continuous aggregate hypertable",
      "environment": "Local TimescaleDB instance with compression policies enabled",
      "minimum_pass": "p95 candlestick query execution latency is < 40.0 milliseconds",
      "target": "p95 candlestick query execution latency is < 15.0 milliseconds",
      "report": "TimescaleDB query benchmark report and continuous aggregate performance table"
    }
  ],
  "skills": ["Python", "Kafka", "TimescaleDB", "Redis", "React", "WebSockets", "FinTech Engineering", "Time-Series Data"],
  "starter_input": {
    "spec": "Directory containing market tick generator, Kafka stream consumers, TimescaleDB migrations, and React trading dashboard.",
    "size": "11 Python source modules, TimescaleDB SQL DDL scripts, Docker Compose manifest, and automated tick feed simulator",
    "seeded_cases": "Out-of-order trade timestamps, market open/close volume surges, and rapid duplicate alert trigger conditions",
    "label_source": "Deterministic synthetic market price trajectories and TimescaleDB hypertable aggregation assertions",
    "personal_data_policy": "Strictly mock synthetic market trade ticks and simulated trading account IDs; no real personal data used"
  },
  "components": [
    {"name": "Kafka Market Tick Ingestion & OHLCV Bar Aggregator", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "TimescaleDB Hypertable Storage & Continuous Aggregates Worker", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Redis Real-Time Price Cache & Dynamic Alert Evaluation Engine", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "WebSocket Streaming Gateway & Subscription Manager in Python", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Market Feed Throughput & Alert Latency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Stock Platform Architecture Guide & Hypertable Schema Manual", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "features": [
      "Technical indicator calculation engine computing live RSI, MACD, and Bollinger Bands on streaming 1-minute bars",
      "Level 2 order book depth visualization rendering live bid/ask ladder queues over WebSockets",
      "Automated paper trading simulator executing simulated limit and market orders with slippage models"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Kafka Ingestion & TimescaleDB Hypertables in Python, Kafka and TimescaleDB",
      "hours": 7,
      "done_criterion": "Kafka worker consumes ticks; TimescaleDB aggregates 1-minute OHLCV candles in hypertables."
    },
    {
      "name": "Redis Price Cache & Dynamic Alert Engine in Redis and FinTech Engineering",
      "hours": 7,
      "done_criterion": "Redis caches latest quotes; alert engine evaluates thresholds with p95 latency < 20ms."
    },
    {
      "name": "WebSocket Streaming Gateway & React Charts in WebSockets, React and Full-Stack Web",
      "hours": 7,
      "done_criterion": "Gateway streams real-time quotes; React dashboard renders live candlestick charts."
    },
    {
      "name": "Throughput Benchmark, Dynamic Alert Anti-Fake Test & Docs in Time-Series Data",
      "hours": 7,
      "done_criterion": "Ingestion sustains >= 8,000 ticks/sec; anti-fake test triggers AAPL alert; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python asynchronous programming, streaming architectures (Kafka), and database interactions",
    "Understanding of time-series databases (TimescaleDB / PostgreSQL), in-memory caching (Redis), and WebSocket streaming"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, network, and storage I/O bound data pipeline software)",
    "cost": "$0 (fully open-source stack using local Docker Desktop for Kafka, TimescaleDB, and Redis)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or real stock brokerage API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Kafka, TimescaleDB, and Redis containers) and Python 3.11+",
    "fallback_path": "In-memory Python queue and SQLite database fallback if Docker containers are unavailable"
  },
  "riskiest_component": {
    "name": "TimescaleDB Write Amplification and Alert Trigger Stampedes",
    "mitigation": "Buffer tick insertions in memory and execute bulk COPY commands into TimescaleDB, and rate-limit duplicate alert notifications.",
    "fallback": "Tiered downsampling aggregating ticks into 5-second summary batches before database persistence."
  },
  "deliverables": [
    "Git repository containing Kafka tick consumer, TimescaleDB migrations, Redis alert engine, and React dashboard",
    "Docker Compose configuration launching Kafka, TimescaleDB, and Redis containers",
    "Automated load testing harness generating 10,000 ticks/sec and measuring alert latency percentiles",
    "Screener verification script executing automated benchmark and dynamic alert trigger verification in under 2 minutes"
  ],
  "out_of_scope": [
    "Real money trading order routing to live brokerage exchanges (Interactive Brokers / Alpaca live)",
    "Direct market data feed connections to NASDAQ/NYSE ITCH/FIX protocols",
    "Machine learning stock price prediction models"
  ],
  "safety_note": None,
  "resources": [
    "TimescaleDB Documentation on Hypertables and Continuous Aggregates",
    "Designing Data-Intensive Applications: Chapter on Stream Processing (Martin Kleppmann)",
    "Building Real-Time Financial Data Pipelines with Apache Kafka"
  ],
  "rubric": [
    {
      "input": "100,000 synthetic market ticks streamed at 10,000 ticks per second",
      "action": "python ./benchmarks/bench_ingestion.py --ticks 100000 --rate 10000",
      "expected_result": "Pipeline ingests and persists ticks with sustained throughput >= 8,000 ticks/sec",
      "evidence_location": "Terminal output log and reports/ingestion_throughput.json",
      "pass_criterion": "Throughput >= 8000 ticks/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 active price threshold alerts registered in Redis",
      "action": "python ./alerts/eval_alerts.py --alerts 1000",
      "expected_result": "Alert engine evaluates incoming ticks against Redis sets with p95 latency < 20.0ms",
      "evidence_location": "Alert evaluation benchmark report in reports/alert_perf.json",
      "pass_criterion": "p95 latency < 20.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 repeated 30-day hourly OHLCV candlestick queries on 1,000,000 historical rows",
      "action": "python ./benchmarks/bench_timescale.py --queries 100",
      "expected_result": "TimescaleDB returns candlestick data with p95 query latency < 40.0ms",
      "evidence_location": "TimescaleDB query benchmark report in reports/timescale_perf.json",
      "pass_criterion": "p95 latency < 40.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "WebSocket quote subscription request for 10 equity ticker symbols",
      "action": "python ./scripts/test_websocket_stream.py --symbols AAPL,MSFT,GOOGL,AMZN,TSLA",
      "expected_result": "WebSocket streams real-time quote frames with sub-50ms inter-message interval",
      "evidence_location": "WebSocket streaming test log in reports/ws_stream.json",
      "pass_criterion": "Quotes received continuously with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Registration of alert 'AAPL >= 195.00' followed by synthetic tick at $195.50",
      "action": "python ./scripts/verify_dynamic_alert.py --symbol AAPL --threshold 195.00 --tick-price 195.50",
      "expected_result": "Alert engine detects threshold violation and emits trigger notification within 50ms",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms alert triggered for AAPL with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected stock market data platform in Python with Kafka, TimescaleDB, and Redis; sustained [TICK_THROUGHPUT] market ticks per second ingestion throughput, and delivered sub-[ALERT_LATENCY] millisecond price alert evaluation latency.",
    "claims": [
      {
        "text": "sustained [TICK_THROUGHPUT] market ticks per second ingestion throughput",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[ALERT_LATENCY] millisecond price alert evaluation latency",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "live brokerage exchange order execution or machine learning price prediction"
  },
  "verify": [
    "Run `pytest tests/` to confirm Kafka consumers, TimescaleDB hypertables, and Redis alert engines pass.",
    "Execute `python ./benchmarks/bench_ingestion.py` to verify ingestion throughput exceeds 8,000 ticks/sec.",
    "Run `python ./scripts/verify_dynamic_alert.py` to assert real-time price alert triggering."
  ],
  "worksheet": {
    "q1": "Core deliverable: a real-time stock market data platform and alert engine in Python with Kafka, TimescaleDB, Redis, and WebSockets.",
    "q2": "Target users: fintech software engineers, quantitative platform developers, and real-time data architects.",
    "q3": "3 use cases: day-trading price spike alerts, multi-asset portfolio valuation, and quantitative historical backtesting.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: Kafka tick ingestion without drops, TimescaleDB continuous aggregates, sub-12ms Redis alert evaluations, and WebSocket streaming.",
    "q6": "Starter input: market tick simulator, Kafka consumers, TimescaleDB migrations, and React trading dashboard. Synthetic market data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/network bound, $0 cost using Docker containers. Zero live brokerage keys.",
    "q8": "Riskiest component: TimescaleDB write amplification and alert trigger stampedes. Fallback: in-memory bulk COPY and duplicate rate-limiting.",
    "q9": "Potential faking: mock price display without actual stream processing. Anti-fake check 5 registers an alert for AAPL at $195, emits a $195.50 tick, and asserts alert fires in < 50ms.",
    "q10": "Safe; synthetic stock trade ticks and local private Docker containers only."
  }
}

b63_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, TimescaleDB hypertable specs, and alert indexing | High |
| Tech Stack | Python, Kafka, TimescaleDB, Redis, React, WebSockets | Listed tools without explicit operational roles or data flow boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete ingestion throughput thresholds, alert latency bounds, and dynamic trigger tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b63_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Docker Desktop for Kafka, TimescaleDB, and Redis at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Tick throughput (>= 8,000 ticks/sec), alert latency (< 20ms), and candlestick query latency (< 40ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory Python queues and SQLite database fallback if Docker containers are unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic market tick simulator and automated load testing scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: live brokerage execution (Interactive Brokers), direct exchange feeds (NASDAQ ITCH), and ML price predictors.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 registers alert for AAPL at $195, emits $195.50 tick, and verifies alert fires in < 50ms.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b63_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved technical indicator streaming and Level 2 order book to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic FinTech metrics (tick throughput, alert evaluation latency, and candlestick query speed).
- Removed Banned Content: Removed promotional marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake dynamic price threshold alert trigger test.
"""

# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_6_part2():
    std_scores = {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}
    std_caps = {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}
    res59 = process_brief(b59_data, b59_old_diag, std_scores, std_caps, b59_reviewer, b59_changelog)
    res60 = process_brief(b60_data, b60_old_diag, std_scores, std_caps, b60_reviewer, b60_changelog)
    res61 = process_brief(b61_data, b61_old_diag, std_scores, std_caps, b61_reviewer, b61_changelog)
    res62 = process_brief(b62_data, b62_old_diag, std_scores, std_caps, b62_reviewer, b62_changelog)
    res63 = process_brief(b63_data, b63_old_diag, std_scores, std_caps, b63_reviewer, b63_changelog)
    return [res59, res60, res61, res62, res63]

if __name__ == "__main__":
    results = run_batch_6_part2()
    print("Batch 6 Part 2 finished successfully:", results)
