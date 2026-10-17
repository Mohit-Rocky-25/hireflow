import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_batch_1 import process_brief

# ==============================================================================
# 29. brief-graph-analysis
# ==============================================================================
b29_data = {
  "id": "brief-graph-analysis",
  "title": "Large-Scale Social Graph Analytics Platform with PageRank & Community Detection",
  "domain": "Data Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Data pipeline/ETL", "Systems/low-level/networking"],
  "problem": "Modern social networks, financial transaction webs, and logistics supply chains contain deep relationship networks that traditional relational database SQL joins cannot analyze efficiently at scale. Calculating graph centrality, identifying dense community clusters, and locating anomalous cycles require specialized graph storage layouts and iterative graph algorithms. This project implements a high-performance graph analytics engine in Python, DuckDB, NetworkX, and FastAPI. The platform ingests million-edge datasets into compressed sparse row (CSR) memory structures, executes multi-threaded PageRank and Louvain community detection algorithms, evaluates multi-hop subgraph paths, and serves analytical graph queries through a FastAPI backend.",
  "use_cases": [
    "Social network influence scoring calculating user centrality across large follower graphs",
    "Anti-money laundering financial intelligence detecting circular fund transfer rings",
    "Supply chain dependency analysis identifying single-point-of-failure bottlenecks"
  ],
  "hard_parts": [
    "Optimizing graph memory layout using Compressed Sparse Row (CSR) matrices to prevent RAM bloat on million-edge graphs",
    "Parallelizing iterative PageRank matrix computations across multi-core CPUs with strict convergence bounds",
    "Implementing modularity-optimizing Louvain community partitioning across densely connected subgraphs",
    "Executing sub-15 millisecond K-hop neighborhood traversals without combinatorial path explosion"
  ],
  "screener_signals": [
    "Modular Python codebase separating CSR graph loaders, parallel iterative algorithms, and FastAPI endpoints",
    "Deterministic benchmark demonstrating PageRank convergence on 1,000,000 edges in under 4.5 seconds on local CPU",
    "Anti-fake verification script generating a dynamic star-hub topology and asserting exact centrality rankings"
  ],
  "job_families": [
    "Graph Data Engineer",
    "Distributed Systems Data Engineer",
    "High-Performance Computing Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary programming language for graph data structures and algorithm pipelines"},
    {"tool": "DuckDB", "role": "analytical in-process database staging raw edge lists and attribute tables"},
    {"tool": "NetworkX", "role": "graph library providing reference baseline implementations and topological verifications"},
    {"tool": "FastAPI", "role": "web framework exposing graph traversal and centrality analytics endpoints"},
    {"tool": "Docker", "role": "containerization engine packaging analytics engine and local dependencies"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Compressed Sparse Row (CSR) Graph Loader",
        "tools_used": ["Python", "DuckDB"],
        "purpose": "Ingests raw edge lists from DuckDB and constructs memory-efficient CSR adjacency structures"
      },
      {
        "name": "Parallel PageRank Centrality Engine",
        "tools_used": ["Python"],
        "purpose": "Executes power-iteration PageRank across node matrices to measure influence and authority"
      },
      {
        "name": "Louvain Community Detection Partitioning",
        "tools_used": ["Python", "NetworkX"],
        "purpose": "Partitions graph nodes into modular communities through iterative local modularity optimization"
      },
      {
        "name": "FastAPI Graph Analytics Gateway",
        "tools_used": ["FastAPI", "Python", "Docker"],
        "purpose": "Serves multi-hop neighborhood queries, community membership looks, and centrality rankings"
      }
    ],
    "data_flow": "Raw CSV/Parquet edge lists load into DuckDB tables; the CSR Graph Loader extracts directed edge pairs into compressed index pointers and column arrays; the PageRank Centrality Engine executes iterative vector updates until the L1 norm delta falls below 1e-6; the Louvain Engine assigns nodes to community clusters maximizing modularity Q; client analytical queries enter FastAPI; the gateway performs multi-hop neighbor lookups in CSR arrays and returns structured graph JSON in under 15 milliseconds.",
    "enforcement_mechanism": "Matrix convergence tolerance thresholds guaranteeing mathematical accuracy; bounded search depths preventing recursive traversal loops."
  },
  "targets": [
    {
      "metric": "Million-Edge PageRank Convergence Latency",
      "method": "Wall-clock timing to execute power-iteration PageRank until tolerance threshold (1e-6) on 1,000,000 edges",
      "input": "Directed benchmark graph containing 100,000 nodes and 1,000,000 edges with power-law degree distribution",
      "environment": "Standard 4-core local CPU, Python 3.11 with NumPy/SciPy",
      "minimum_pass": "Execution converges in < 4.5 seconds across 1,000,000 edges",
      "target": "Execution converges in < 2.0 seconds across 1,000,000 edges",
      "report": "PageRank algorithm performance and convergence iteration log"
    },
    {
      "metric": "Louvain Community Detection Modularity Score",
      "method": "Modularity metric Q calculation across benchmark social network graph with known community clusters",
      "input": "Synthetic social graph containing 25,000 nodes partitioned into 10 ground-truth clusters",
      "environment": "Standard 4-core local CPU, Python 3.11",
      "minimum_pass": "Calculated modularity Q exceeds 0.65",
      "target": "Calculated modularity Q exceeds 0.78",
      "report": "Community detection modularity score verification output"
    },
    {
      "metric": "Multi-Hop Neighborhood Traversal Latency",
      "method": "Response timing for 3-hop breadth-first neighborhood expansion across indexed graph",
      "input": "500 random node seed queries requesting 3-hop ego network subgraphs",
      "environment": "Standard 4-core local CPU, Python 3.11, CSR memory structures",
      "minimum_pass": "Average 3-hop traversal latency is < 15.0 milliseconds",
      "target": "Average 3-hop traversal latency is < 6.0 milliseconds",
      "report": "Graph traversal microbenchmark latency report"
    }
  ],
  "skills": ["Python", "NetworkX", "DuckDB", "FastAPI", "Docker", "Graph Analysis", "Data Engineering", "Distributed Systems"],
  "starter_input": {
    "spec": "Graph edge list dataset (source_id, target_id, weight) and node metadata schema in CSV/Parquet format.",
    "size": "Synthetic social graph of 100,000 nodes and 1,000,000 edges following power-law degree distribution",
    "seeded_cases": "Isolated disconnected nodes, cyclic sink nodes with zero outbound edges, and dense clique clusters",
    "label_source": "Deterministic ground truth manifest with verified PageRank scores and community cluster IDs",
    "personal_data_policy": "Strictly mock synthetic graph node identifiers and simulated edge weights; no personal data used"
  },
  "components": [
    {"name": "Graph Ingestion & Adjacency CSR Matrix Loader", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "Parallel PageRank & Centrality Scoring Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Louvain Community Detection & Modular Partitioning", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Graph Traversal & Subgraph Anomaly Extraction", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "FastAPI Graph Query & Visualization API", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Graph Algorithm Convergence & Scale Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Graph Topology Architecture Diagram & Partitioning Runbook", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Distributed GraphX / GraphFrames cluster execution across multi-node Apache Spark workers",
      "Dynamic temporal edge streaming with incremental PageRank recalculation"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "CSR Graph Adjacency Ingestion & DuckDB Storage in Python",
      "hours": 10,
      "done_criterion": "Ingestion loads 1,000,000 edges into CSR arrays; DuckDB stores node attributes efficiently."
    },
    {
      "name": "Parallel PageRank & Centrality in Data Engineering and Graph Analysis",
      "hours": 10,
      "done_criterion": "PageRank converges in < 4.5s on 1M edges; betweenness centrality evaluates accurately."
    },
    {
      "name": "Louvain Community Detection & Subgraph Extraction in FastAPI Distributed Systems",
      "hours": 10,
      "done_criterion": "Louvain achieves modularity Q > 0.65; FastAPI serves 3-hop subgraph queries in < 15ms."
    },
    {
      "name": "Million-Edge Algorithm Benchmark, Docker Anti-Fake Test & Docs",
      "hours": 10,
      "done_criterion": "Benchmark verifies convergence latency; anti-fake test identifies star hub; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, NumPy matrix operations, and asynchronous FastAPI",
    "Understanding of graph theory fundamentals (adjacency representations, PageRank, community modularity)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound sparse matrix computations)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and DuckDB installed",
    "fallback_path": "In-memory Python dictionaries with NetworkX if native CSR C-extensions encounter build errors"
  },
  "riskiest_component": {
    "name": "Memory Exhaustion from Storing Dense Adjacency Matrices",
    "fallback": "Enforce Compressed Sparse Row (CSR) representation using 32-bit integer index arrays"
  },
  "deliverables": [
    "Git repository containing Python graph analytics engine, CSR data structures, and FastAPI service",
    "Synthetic million-edge graph generation script with power-law degree distribution",
    "Automated performance evaluation harness measuring convergence speed and modularity scores",
    "Screener verification script executing automated benchmark and dynamic graph test in under 2 minutes"
  ],
  "out_of_scope": [
    "Distributed multi-terabyte graph computing on 100-node supercomputer clusters",
    "Deep graph neural network (GNN) model training using PyTorch Geometric on GPUs",
    "Commercial frontend interactive graph canvas WebGL rendering engine"
  ],
  "safety_note": None,
  "resources": [
    "The PageRank Citation Ranking: Bringing Order to the Web (Page et al. paper)",
    "Fast Unfolding of Communities in Large Networks (Blondel et al. Louvain paper)",
    "Compressed Sparse Graph Representations and Scipy Sparse Matrix Architecture"
  ],
  "rubric": [
    {
      "input": "1,000,000 edge benchmark graph with power-law degree distribution",
      "action": "python -m graph_engine.bench_pagerank --edges data/graph_1m.parquet",
      "expected_result": "PageRank algorithm converges within tolerance threshold in < 4.5 seconds",
      "evidence_location": "Terminal execution output log and reports/pagerank_timing.json",
      "pass_criterion": "Convergence time is < 4.5 seconds with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Synthetic social graph containing 25,000 nodes with known community structure",
      "action": "python -m graph_engine.test_louvain --graph data/communities.parquet",
      "expected_result": "Louvain algorithm partitions graph with modularity score Q exceeding 0.65",
      "evidence_location": "Modularity report log",
      "pass_criterion": "Modularity score Q is > 0.65 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 multi-hop neighborhood traversal requests issued to FastAPI endpoint",
      "action": "python scripts/benchmark_traversal.py --requests 500 --hops 3",
      "expected_result": "Average 3-hop ego network extraction completes in < 15.0 milliseconds",
      "evidence_location": "Traversal timing summary table",
      "pass_criterion": "Average traversal latency is < 15.0 milliseconds",
      "kind": "normal"
    },
    {
      "input": "FastAPI request requesting top 10 central nodes in graph",
      "action": "curl http://localhost:8000/api/centrality/top?k=10",
      "expected_result": "API returns JSON list of top 10 nodes with computed PageRank scores",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and results array has exactly 10 ranked items",
      "kind": "normal"
    },
    {
      "input": "Dynamic star graph topology generated at runtime (1 central hub node connected to 50 peripheral leaves)",
      "action": "python scripts/verify_dynamic_graph.py --hub-id DYNAMIC_HUB_99 --leaves 50",
      "expected_result": "PageRank algorithm identifies hub node as highest ranked node with score exceeding 0.15",
      "evidence_location": "Dynamic verification console output log",
      "pass_criterion": "Top ranked node equals DYNAMIC_HUB_99 with score > 0.15 and exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected large-scale social graph analytics platform in Python and DuckDB with Compressed Sparse Row indexing; achieved sub-[CONVERGENCE_TIME] PageRank convergence across [EDGE_COUNT] edges, and delivered multi-hop subgraph traversals with sub-[TRAVERSAL_LATENCY] latency.",
    "claims": [
      {
        "text": "achieved sub-[CONVERGENCE_TIME] PageRank convergence across [EDGE_COUNT] edges",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered multi-hop subgraph traversals with sub-[TRAVERSAL_LATENCY] latency",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "multi-node supercomputer cluster parallelism or deep graph neural network GPU training"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a graph analytics platform in Python/DuckDB with CSR indexing, parallel PageRank, Louvain community detection, and FastAPI.",
    "q2": "Target users: graph data engineers, distributed systems developers, and analytics architects.",
    "q3": "3 use cases: social network influence scoring, anti-money laundering ring detection, and supply chain bottleneck analysis.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Compressed Sparse Row memory optimization, parallel PageRank convergence, Louvain community modularity, and sub-15ms K-hop traversal.",
    "q6": "Starter input: 100,000 nodes and 1,000,000 edges following power-law degree distribution. Synthetic graph data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: Python dicts and NetworkX.",
    "q8": "Riskiest component: Memory exhaustion from dense adjacency storage. Fallback: 32-bit CSR sparse representation.",
    "q9": "Potential faking: mock centrality returns. Anti-fake check 5 constructs dynamic star-hub topology at runtime and asserts hub receives top PageRank.",
    "q10": "Safety/ethics: Safe; synthetic topology records only."
  }
}

b29_old_diag = """
- **Old Title**: Large-Scale Social Graph Analysis Platform
- **Domain**: Data Engineering
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic NetworkX script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'LinkedIn People You May Know, Facebook friend recommendations, HDFC, SBI')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating PageRank convergence latency, Louvain modularity score, and traversal speed.
2. **Commercial employer marketing**:
   > "LinkedIn's 'People You May Know', Facebook's friend recommendations, fraud network detection at banks (HDFC, SBI), and supply chain risk analysis..."
"""

b29_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, DuckDB, and NetworkX at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. PageRank convergence (< 4.5s on 1M edges) and traversal latency (< 15ms) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. Python dictionaries and NetworkX if native CSR C-extensions fail to compile.",
    "Can test data be created in minutes?": "YES. Synthetic million-edge power-law graph generator included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full algorithm benchmark and dynamic star-hub test in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. PageRank convergence latency, Louvain modularity score, and K-hop traversal latency are unique to graph platforms.",
    "Is every bullet claim verified by rubric?": "YES. PageRank latency verified by Check 0; traversal latency verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] generates a dynamic star graph at runtime and asserts the hub node receives top PageRank rank.",
    "Are all terms accurate?": "YES. Accurately covers Compressed Sparse Row matrices, power-iteration PageRank, Louvain modularity, and ego networks.",
    "Does problem statement promise only what is verified?": "YES. CSR loader, parallel PageRank, Louvain community detection, and FastAPI query API are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic graph topologies; no personal data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering CSR memory layout, parallel PageRank convergence, Louvain modularity optimization, and multi-hop traversal."
}

b29_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Spark GraphFrames and temporal edge streaming to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic graph analytics metrics (million-edge PageRank convergence, Louvain modularity, and traversal latency).
- Removed Banned Content: Removed employer marketing regarding LinkedIn, Facebook, and banks.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic star topology check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [CONVERGENCE_TIME], [EDGE_COUNT], and [TRAVERSAL_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 30. brief-graphql-federation
# ==============================================================================
b30_data = {
  "id": "brief-graphql-federation",
  "title": "Federated GraphQL Gateway with Distributed Query Planning & DataLoader Batching",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["API/backend service", "Distributed systems"],
  "problem": "Modern microservice architectures fracture domain data across dozens of isolated REST services, forcing client web applications to make redundant round-trips to assemble screens. Naive GraphQL gateways that resolve nested fields sequentially introduce disastrous N+1 request cascades that overwhelm downstream backends. This project builds a high-performance federated GraphQL gateway in TypeScript and Node.js. The system composes independent subgraph schemas into a unified supergraph, generates optimized distributed query execution DAGs, eliminates N+1 downstream round-trips via DataLoader request batching and entity reference resolution, and caches query plans in Redis to achieve sub-4ms routing overhead.",
  "use_cases": [
    "Enterprise microservice unification providing single typed API entrypoint for web and mobile clients",
    "B2B SaaS data composition joining customer accounts, billing subscriptions, and usage analytics",
    "High-throughput developer platform exposing coherent entity graph across decentralized teams"
  ],
  "hard_parts": [
    "Composing heterogeneous subgraph schemas into a unified federated supergraph without type conflicts",
    "Constructing optimal distributed query execution DAGs that parallelize non-dependent downstream sub-queries",
    "Eliminating N+1 downstream microservice request floods using DataLoader batching across entity boundaries",
    "Managing schema versioning and live subgraph health checking with graceful partial query execution"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating schema composition, query planners, DataLoader batchers, and execution engines",
    "Automated N+1 stress test demonstrating that a 4-level nested query issues exactly 1 batched request per downstream service",
    "Anti-fake verification script issuing dynamic nested entity queries and verifying downstream batch consolidation"
  ],
  "job_families": [
    "API Platform Engineer",
    "Backend Software Engineer",
    "Full-Stack Web Architect"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language for federation schemas, query planning DAGs, and entity loaders"},
    {"tool": "Node.js", "role": "runtime hosting gateway server, HTTP client pools, and asynchronous event loops"},
    {"tool": "GraphQL", "role": "query language and runtime executing federated schemas and field resolution"},
    {"tool": "PostgreSQL", "role": "relational database backing downstream mock microservices"},
    {"tool": "Redis", "role": "in-memory data store caching compiled query plans and entity resolution batches"},
    {"tool": "Docker", "role": "containerization engine packaging gateway and downstream mock microservices"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Subgraph Schema Composition Engine",
        "tools_used": ["TypeScript", "GraphQL"],
        "purpose": "Merges independent subgraph schemas into a single unified supergraph with entity key directives"
      },
      {
        "name": "Distributed Query Execution Planner",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Analyzes incoming queries and builds parallel execution directed acyclic graphs (DAGs) for downstream dispatch"
      },
      {
        "name": "DataLoader Entity Batching Service",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Coalesces identical entity key lookups into single batched requests, eliminating downstream N+1 floods"
      },
      {
        "name": "Redis Query Plan Caching Middleware",
        "tools_used": ["Redis", "TypeScript", "Docker"],
        "purpose": "Caches parsed query execution plans in Redis to bypass compilation overhead on repeated query shapes"
      }
    ],
    "data_flow": "Client GraphQL queries arrive at the gateway; the Redis Query Plan Cache checks if a pre-compiled plan exists; on cache miss, the Distributed Query Planner constructs an execution DAG identifying dependencies between subgraphs; parallel execution steps dispatch simultaneously to downstream microservices; the DataLoader Entity Batching Service combines entity reference IDs into single batched HTTP requests; returned partial JSON payloads merge into the response shape; the final unified payload returns to client in sub-millisecond overhead.",
    "enforcement_mechanism": "Federated schema entity key directives guaranteeing type alignment; DataLoader per-request deduplication preventing redundant network calls."
  },
  "targets": [
    {
      "metric": "Gateway Query Planning Overhead Latency",
      "method": "Overhead duration added by schema parsing, query analysis, and plan compilation excluding downstream network duration",
      "input": "1,000 complex multi-entity GraphQL queries evaluated on warm gateway runtime",
      "environment": "Standard 4-core local CPU, Node.js 18+, TypeScript",
      "minimum_pass": "Average query planning overhead is < 4.0 milliseconds",
      "target": "Average query planning overhead is < 1.2 milliseconds",
      "report": "Gateway microbenchmark timing log reporting p50, p95, and p99 overhead percentiles"
    },
    {
      "metric": "Downstream N+1 Request Elimination Rate",
      "method": "Request count audit verifying number of downstream HTTP calls made to resolve 50 nested entities",
      "input": "GraphQL query requesting 50 user entities and their associated nested order and shipping details",
      "environment": "Standard 4-core local CPU, Node.js 18+",
      "minimum_pass": "0 redundant requests; exactly 1 batched request per downstream subgraph service",
      "target": "0 redundant requests; exactly 1 batched request per downstream subgraph service",
      "report": "Downstream HTTP call tracing report confirming zero unbatched individual queries"
    },
    {
      "metric": "Federated Gateway Sustained Throughput",
      "method": "Multi-threaded benchmark issuing 10,000 federated queries against warm Redis plan cache",
      "input": "10,000 queries processed across 50 concurrent worker connections",
      "environment": "Standard 4-core local CPU, Node.js 18+, local Redis 7",
      "minimum_pass": "Sustained throughput exceeds 2,500 queries/sec",
      "target": "Sustained throughput exceeds 6,000 queries/sec",
      "report": "Gateway throughput benchmark summary output"
    }
  ],
  "skills": ["TypeScript", "Node.js", "GraphQL", "PostgreSQL", "Redis", "Docker", "GraphQL Federation", "Full-Stack Web"],
  "starter_input": {
    "spec": "Federated subgraph schemas (Users, Products, Orders, Reviews), entity key definitions, and mock REST/GraphQL downstream services.",
    "size": "4 subgraph services with 35 GraphQL types, 1,000 mock records per service, and 50 benchmark query shapes",
    "seeded_cases": "Cyclic entity references, missing entity keys, downstream microservice timeouts, and invalid directive arguments",
    "label_source": "Deterministic query response fixtures mapping input GraphQL queries to exact unified JSON payload shapes",
    "personal_data_policy": "Strictly mock synthetic user accounts and simulated product catalogs; zero personal data used"
  },
  "components": [
    {"name": "Subgraph Schema Composition & Type Merger", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Distributed Query Planner & Execution DAG Builder", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "DataLoader Batching & Entity Reference Resolver", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "In-Memory Redis Query Plan Caching Middleware", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "High-Concurrency Federation & N+1 Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Gateway Federation Architecture Diagram & Subgraph Guide", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "items": [
      "Field-level JWT authorization directives with attribute-based access control",
      "Automated subgraph schema contract validation and breaking change detection in CI/CD"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "Subgraph Schema Parsing & Federation Type Composition in TypeScript",
      "hours": 7,
      "done_criterion": "Merger composes 4 subgraphs into unified supergraph without schema conflicts."
    },
    {
      "name": "Query Planning DAG & Downstream Request Dispatcher in Node.js GraphQL",
      "hours": 7,
      "done_criterion": "Planner creates parallel execution DAGs, achieving < 4ms planning latency."
    },
    {
      "name": "DataLoader Entity Resolution & Redis Plan Caching in Full-Stack Web and PostgreSQL",
      "hours": 7,
      "done_criterion": "DataLoaders eliminate N+1 calls; Redis caches query plans; throughput hits > 2,500 qps."
    },
    {
      "name": "N+1 Elimination Benchmark, Docker Anti-Fake Test & Docs in GraphQL Federation",
      "hours": 7,
      "done_criterion": "Benchmark confirms exactly 1 batched call per service; anti-fake test passes; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, asynchronous Node.js, and GraphQL core schema concepts (types, queries, resolvers)",
    "Understanding of distributed microservice architectures, DataLoader patterns, and HTTP connection pooling"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound API gateway execution)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+ and Redis 7 installed",
    "fallback_path": "In-memory mock subgraphs and Map-based cache if Docker or Redis is unavailable"
  },
  "riskiest_component": {
    "name": "Downstream Subgraph Latency Amplification Stalling Gateway Workers",
    "fallback": "Enforce per-subgraph circuit breakers and strict 500ms timeout deadlines with partial response fallback"
  },
  "deliverables": [
    "Git repository containing TypeScript GraphQL federation gateway, query planner, and mock subgraphs",
    "Docker Compose file running gateway, 4 downstream microservices, and Redis",
    "Automated N+1 elimination and concurrency load testing benchmark harness",
    "Screener verification script executing automated benchmark and dynamic entity test in under 2 minutes"
  ],
  "out_of_scope": [
    "Automatic schema inference from arbitrary legacy SOAP or gRPC endpoints",
    "Multi-region active-active distributed gateway clustering with Geo-DNS",
    "Proprietary Apollo Studio schema registry cloud account integration"
  ],
  "safety_note": None,
  "resources": [
    "GraphQL Federation Specification (Entity Key and Extends Directives)",
    "DataLoader Architecture: Batching and Caching for GraphQL Applications",
    "High-Performance Asynchronous Query Planning in Node.js"
  ],
  "rubric": [
    {
      "input": "GraphQL query requesting 50 user entities with nested order and review data",
      "action": "npm run test:n-plus-one",
      "expected_result": "DataLoader consolidates entity lookups into exactly 1 batched request per downstream service",
      "evidence_location": "Terminal test output log and reports/downstream_call_counts.json",
      "pass_criterion": "Each downstream subgraph records exactly 1 batched request with 0 unbatched calls, exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 multi-entity GraphQL queries issued to gateway",
      "action": "npm run bench:planning-latency",
      "expected_result": "Average query planning and execution overhead added by gateway is < 4.0 milliseconds",
      "evidence_location": "Planning latency benchmark console report",
      "pass_criterion": "Average planning overhead is < 4.0 milliseconds",
      "kind": "normal"
    },
    {
      "input": "10,000 federated queries executed against warm Redis plan cache",
      "action": "npm run bench:throughput -- --requests 10000 --concurrency 50",
      "expected_result": "Gateway delivers sustained throughput exceeding 2,500 queries/sec",
      "evidence_location": "Throughput benchmark output table",
      "pass_criterion": "Measured throughput is > 2,500 queries/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Federated query request fetching merged fields from Users and Orders subgraphs",
      "action": "curl -X POST http://localhost:4000/graphql -H 'Content-Type: application/json' -d '{\"query\": \"{ user(id: 1) { name orders { id total } } }\"}'",
      "expected_result": "Gateway returns unified JSON response containing both user name and orders array",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200, data.user.name exists, and data.user.orders has items",
      "kind": "normal"
    },
    {
      "input": "Dynamic query requesting 15 distinct entity IDs generated at runtime",
      "action": "node scripts/verify_dynamic_federation.js --entity-count 15",
      "expected_result": "Gateway intercepts request, batches all 15 IDs into single downstream call, and returns unified payload",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Downstream call inspector confirms batch size equals 15 and exit code is 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected federated GraphQL gateway in TypeScript and Node.js with distributed query planning; eliminated downstream cascading request amplification across [ENTITY_COUNT] nested entities, and achieved [GATEWAY_THROUGHPUT] sustained throughput with sub-[PLANNING_LATENCY] planning overhead.",
    "claims": [
      {
        "text": "eliminated downstream cascading request amplification across [ENTITY_COUNT] nested entities",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved [GATEWAY_THROUGHPUT] sustained throughput with sub-[PLANNING_LATENCY] planning overhead",
        "rubric_indexes": [1, 2]
      }
    ],
    "do_not_claim": "multi-region active-active cloud gateway clustering or proprietary Apollo Studio cloud lock-in"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a federated GraphQL gateway in TypeScript/Node.js with schema composition, query planning DAGs, and DataLoader batching.",
    "q2": "Target users: API platform engineers, full-stack architects, and backend developers.",
    "q3": "3 use cases: microservice unification, B2B SaaS cross-service data joins, and multi-client API gateways.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: subgraph schema composition without collisions, execution DAG planning, DataLoader entity batching, and Redis plan caching.",
    "q6": "Starter input: 4 subgraph services with 35 GraphQL types and 1,000 mock records per service. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory mock subgraphs.",
    "q8": "Riskiest component: Downstream subgraph latency amplification. Fallback: circuit breakers and 500ms deadlines with partial fallbacks.",
    "q9": "Potential faking: static responses. Anti-fake check 5 sends 15 dynamic entity IDs and asserts downstream inspector logs batch size of 15.",
    "q10": "Safety/ethics: Safe; synthetic mock schemas and local services only."
  }
}

b30_old_diag = """
- **Old Title**: Federated GraphQL Gateway with Schema Stitching
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic Apollo wrapper; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Shopify, Twitter, and top tech platforms use GraphQL federation')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating query planning latency, N+1 downstream request elimination, and federation throughput.
2. **Commercial employer marketing**:
   > "Shopify, Twitter, and top tech platforms use GraphQL federation. Any company with 5+ microservices and multiple frontend clients benefits from this..."
"""

b30_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using TypeScript, Node.js, and Redis at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Planning overhead (< 4.0ms), N+1 elimination (0 redundant requests), and throughput (> 2,500 qps) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. In-memory mock subgraphs and Map-based cache if Docker or Redis is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 4-subgraph environment and mock data generator included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full N+1 test and dynamic entity check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Query planning overhead, downstream N+1 request elimination, and federated gateway throughput are unique to GraphQL gateways.",
    "Is every bullet claim verified by rubric?": "YES. N+1 elimination verified by Check 0; planning latency and throughput verified by Checks 1 & 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] requests 15 dynamic entity IDs and asserts downstream inspector logs batch size of 15.",
    "Are all terms accurate?": "YES. Accurately covers federated schema directives, distributed execution DAGs, DataLoader batching, and plan caching.",
    "Does problem statement promise only what is verified?": "YES. Schema composition, query planner, DataLoader batcher, and Redis plan cache are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic mock schemas and simulated user profiles.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering schema composition without conflicts, execution DAGs, DataLoader batching, and circuit breakers."
}

b30_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved field-level JWT auth and CI contract validation to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic GraphQL federation metrics (query planning latency, N+1 elimination rate, and federated throughput).
- Removed Banned Content: Removed employer marketing regarding Shopify, Twitter, and duplicate company references.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic entity batch test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ENTITY_COUNT], [GATEWAY_THROUGHPUT], and [PLANNING_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 31. brief-graphql-to-sql-compiler
# ==============================================================================
b31_data = {
  "id": "brief-graphql-to-sql-compiler",
  "title": "GraphQL-to-SQL AST Compiler & Query Optimizer with LATERAL Joins",
  "domain": "Full-Stack Web",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "CLI/tools/libraries"],
  "problem": "GraphQL APIs built with traditional ORM resolver models suffer from the devastating N+1 query problem, triggering hundreds of sequential database queries to fulfill a single nested API request. Application-level caching and DataLoaders patch the symptom but fail to optimize database execution plans. This project builds a production-grade GraphQL-to-SQL compiler in TypeScript and Node.js. The compiler traverses GraphQL abstract syntax trees (ASTs), maps selection sets to relational schemas, infers table relationships, and transpiles deeply nested GraphQL queries into a single, highly-optimized SQL query utilizing PostgreSQL JOINs and LATERAL subqueries with parameterized prepared statements.",
  "use_cases": [
    "High-performance backend database gateways eliminating N+1 database queries at the compiler level",
    "Data-intensive enterprise analytics APIs serving deeply nested relational data in a single database round-trip",
    "Open-source ORM and GraphQL engine internals optimizing query execution pipelines"
  ],
  "hard_parts": [
    "Traversing arbitrary GraphQL AST selection sets and generating corresponding relational SQL JOIN and LATERAL expressions",
    "Resolving complex nested pagination (e.g. first: 5, offset: 10) inside SQL LATERAL subqueries without multiplying result sets",
    "Parameterizing all user filter arguments securely to guarantee complete SQL injection immunity",
    "Calculating static query complexity scores during compilation to reject computationally abusive queries"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating AST visitors, schema mappers, SQL expression builders, and complexity guards",
    "Automated compiler test suite verifying that a 4-level nested query compiles into exactly 1 parameterized SQL query",
    "Anti-fake verification script submitting dynamic nested queries and asserting exact single-statement SQL generation"
  ],
  "job_families": [
    "Database Systems Engineer",
    "Compiler & Tooling Engineer",
    "Backend Infrastructure Architect"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language for AST visitors, SQL expression generators, and schema mappers"},
    {"tool": "Node.js", "role": "runtime hosting the compiler library, CLI benchmarking tool, and test suites"},
    {"tool": "GraphQL", "role": "parser and type system library providing AST tokens and validation rules"},
    {"tool": "PostgreSQL", "role": "target relational database executing compiled SQL queries and validating execution plans"}
  ],
  "architecture": {
    "components": [
      {
        "name": "GraphQL AST Visitor & Schema Mapper",
        "tools_used": ["TypeScript", "GraphQL"],
        "purpose": "Traverses GraphQL query ASTs, validates selections against schema metadata, and builds intermediate IR trees"
      },
      {
        "name": "SQL Join & LATERAL Expression Generator",
        "tools_used": ["TypeScript", "PostgreSQL"],
        "purpose": "Transpiles intermediate representation trees into unified SQL SELECT statements using JOIN and LATERAL subqueries"
      },
      {
        "name": "Parameterized Predicate & Pagination Transpiler",
        "tools_used": ["TypeScript"],
        "purpose": "Transforms GraphQL where filters and pagination arguments into parameterized SQL clauses ($1, $2)"
      },
      {
        "name": "Query Complexity Analyzer & Guard",
        "tools_used": ["TypeScript", "Node.js"],
        "purpose": "Computes static query cost based on field depth and multipliers, rejecting queries exceeding safety budgets"
      }
    ],
    "data_flow": "Incoming GraphQL query strings enter the compiler; the GraphQL parser generates an AST; the Complexity Analyzer calculates static query depth and multiplier costs, terminating execution if safety thresholds are breached; the AST Visitor traverses selection sets, mapping fields to relational table columns; the Join Generator constructs a single unified SQL query using LATERAL subqueries for one-to-many relationships; all filter values extract into parameterized arrays; the final single SQL statement dispatches to PostgreSQL in exactly one database round-trip.",
    "enforcement_mechanism": "Static complexity thresholds rejecting queries exceeding maximum cost budgets; strict parameterization preventing SQL injection."
  },
  "targets": [
    {
      "metric": "AST Compilation Latency per Document",
      "method": "Wall-clock compilation timing to transform a complex 4-level nested GraphQL query into optimized SQL",
      "input": "1,000 compilation runs on complex GraphQL query (Users -> Orders -> Items -> Product) with filters and pagination",
      "environment": "Standard 4-core local CPU, Node.js 18+, TypeScript release",
      "minimum_pass": "Average compilation latency is < 2.5 milliseconds",
      "target": "Average compilation latency is < 0.8 milliseconds",
      "report": "Compiler microbenchmark timing summary log"
    },
    {
      "metric": "Database Query Execution Round-Trip Reduction",
      "method": "Comparison of database round-trip count between naive resolver execution and compiled single-statement SQL",
      "input": "Query requesting 20 users with 5 orders each and 3 items per order (100 orders, 300 items total)",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+",
      "minimum_pass": "Exactly 1 single SQL round-trip executed; 0 secondary resolver queries",
      "target": "Exactly 1 single SQL round-trip executed; 0 secondary resolver queries",
      "report": "PostgreSQL query execution trace and round-trip verification report"
    },
    {
      "metric": "SQL Parameterization Security Rate",
      "method": "Adversarial test suite injecting 50 malicious SQL payload strings via GraphQL filter arguments",
      "input": "50 adversarial GraphQL queries containing SQL injection patterns (e.g. \"' OR '1'='1; DROP TABLE users;--\")",
      "environment": "Standard 4-core local CPU, Node.js 18+",
      "minimum_pass": "0 unparameterized literals; 50 of 50 values emitted strictly as positional SQL parameters ($1, $2)",
      "target": "0 unparameterized literals; 50 of 50 values emitted strictly as positional SQL parameters ($1, $2)",
      "report": "SQL parameterization and security verification log"
    }
  ],
  "skills": ["TypeScript", "Node.js", "GraphQL", "PostgreSQL", "Compilers", "SQL", "AST Parsing", "Query Optimization"],
  "starter_input": {
    "spec": "GraphQL schema definition, matching PostgreSQL relational DDL schema (users, orders, products, reviews), and query suite.",
    "size": "Relational schema with 8 tables, 40 columns, and 50 benchmark GraphQL test queries of varying nesting depth",
    "seeded_cases": "Deeply nested 5-level queries, cyclic relation traversals, SQL injection attempt literals, and pagination offset edge cases",
    "label_source": "Deterministic SQL ground-truth fixture mapping input GraphQL documents to verified canonical SQL statements",
    "personal_data_policy": "Strictly mock synthetic e-commerce relational schemas; zero personal data used"
  },
  "components": [
    {"name": "GraphQL AST Visitor & Schema Mapping Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "SQL Join Tree & LATERAL Subquery Generator", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Filter Predicate & Pagination SQL Transpiler", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Query Cost Analyzer & Complexity Guard", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "SQL Dialect Output Formatter & Parameter Binder", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Query Optimization & Compilation Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Compiler Pipeline Architecture Diagram & AST Grammar Guide", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Dynamic SQL view materialization and query result fingerprint caching",
      "Multi-dialect SQL compiler supporting PostgreSQL, SQLite, and MySQL"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "GraphQL AST Tokenization & Schema Table Mapper in TypeScript and Compilers",
      "hours": 10,
      "done_criterion": "Parser tokenizes GraphQL queries; mapper binds selection fields to relational table metadata."
    },
    {
      "name": "SQL JOIN Tree & LATERAL Subquery Generation in Systems Programming and AST Parsing",
      "hours": 10,
      "done_criterion": "Compiler generates single SQL queries with JOIN and LATERAL clauses for nested 1-to-many fields."
    },
    {
      "name": "Filter Transpiler, Pagination & Complexity Guard in PostgreSQL and SQL",
      "hours": 10,
      "done_criterion": "Compiler parameterizes filters ($1, $2); complexity guard terminates abusive nested queries."
    },
    {
      "name": "Single-Query Execution Benchmark, Anti-Fake Test & Docs in Query Optimization",
      "hours": 10,
      "done_criterion": "Benchmark confirms 1 single SQL round-trip in < 2.5ms; anti-fake test validates dynamic query; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in TypeScript, AST traversal algorithms, and visitor patterns",
    "Deep understanding of advanced SQL (JOINs, LATERAL subqueries, window functions, prepared statements)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound compiler and database execution)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+ and PostgreSQL 15+ installed",
    "fallback_path": "SQLite dialect compiler output with in-memory execution if PostgreSQL is unavailable"
  },
  "riskiest_component": {
    "name": "Cartesian Product Blowup on Multiple Nested One-to-Many Relationships",
    "fallback": "Generate independent JSON-aggregated LATERAL subqueries rather than direct Cartesian JOINs"
  },
  "deliverables": [
    "Git repository containing TypeScript GraphQL-to-SQL compiler library and CLI test runner",
    "Interactive test playground compiling input GraphQL queries to visual SQL with explain plans",
    "Automated SQL injection and round-trip reduction benchmark test harness",
    "Screener verification script executing automated benchmark and dynamic query compilation in under 2 minutes"
  ],
  "out_of_scope": [
    "Dynamic GraphQL schema stitching across remote third-party web services",
    "Direct distributed transaction coordination across multi-database shards",
    "Automatic database schema migration DDL generation from GraphQL types"
  ],
  "safety_note": None,
  "resources": [
    "GraphQL AST Specification and Visitor Architecture Documentation",
    "PostgreSQL LATERAL Joins and JSON Aggregation Performance Guide",
    "Hasura and PostGraphile Architecture: Compiling GraphQL to Single SQL Queries"
  ],
  "rubric": [
    {
      "input": "Complex 4-level nested GraphQL query with filtering and pagination",
      "action": "npm run test:compile -- --query samples/nested_orders.graphql",
      "expected_result": "Compiler outputs a single unified SQL query with compilation latency < 2.5 milliseconds",
      "evidence_location": "Terminal output log and reports/compiler_bench.json",
      "pass_criterion": "Output contains exactly 1 SELECT statement, compilation latency < 2.5ms, exit code 0",
      "kind": "normal"
    },
    {
      "input": "Query requesting 20 users and their 100 orders executed against PostgreSQL",
      "action": "npm run test:round-trip",
      "expected_result": "Database executes exactly 1 single SQL round-trip instead of 100+ sequential queries",
      "evidence_location": "PostgreSQL query execution trace log",
      "pass_criterion": "Recorded SQL statement count equals 1 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 adversarial GraphQL filter payloads containing SQL injection strings",
      "action": "npm run test:security",
      "expected_result": "All 50 filter values are emitted as positional parameters ($1, $2) with zero string concatenation",
      "evidence_location": "Security parameterization audit report",
      "pass_criterion": "50 of 50 filter inputs safely parameterized with 0 injection escapes",
      "kind": "normal"
    },
    {
      "input": "Deeply nested query exceeding configured complexity budget of 500 points",
      "action": "npm run test:complexity -- --depth 6",
      "expected_result": "Complexity analyzer rejects query during compilation and throws QueryTooComplexError",
      "evidence_location": "Compiler error stdout output",
      "pass_criterion": "Compiler rejects query with QueryTooComplexError and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic 3-level GraphQL query constructed with dynamic alias fields at runtime",
      "action": "node scripts/verify_dynamic_compiler.js --query '{ user { id dynamic_order: orders { total } } }'",
      "expected_result": "Compiler transpiles aliased query into single SQL statement using exact alias in LATERAL json_build_object",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Generated SQL contains dynamic_order alias inside LATERAL subquery and exit code is 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected GraphQL-to-SQL AST compiler in TypeScript and Node.js with PostgreSQL; replaced cascading iterative database queries with [ROUNDTRIP_COUNT] single SQL statement via LATERAL joins, and achieved sub-[COMPILATION_LATENCY] compilation latency with parameterized security.",
    "claims": [
      {
        "text": "replaced cascading iterative database queries with [ROUNDTRIP_COUNT] single SQL statement via LATERAL joins",
        "rubric_indexes": [1]
      },
      {
        "text": "achieved sub-[COMPILATION_LATENCY] compilation latency with parameterized security",
        "rubric_indexes": [0, 2]
      }
    ],
    "do_not_claim": "distributed multi-database sharding coordination or automated DDL schema migrations"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a GraphQL-to-SQL compiler in TypeScript that transpiles nested queries into a single SQL statement using LATERAL subqueries.",
    "q2": "Target users: database engineers, compiler developers, and backend platform architects.",
    "q3": "3 use cases: high-performance database gateways, analytics APIs, and ORM internals.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: AST selection set traversal, LATERAL subquery generation, parameterized filter extraction, and static query complexity scoring.",
    "q6": "Starter input: 8-table relational schema with 40 columns and 50 benchmark queries. Synthetic schemas only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: SQLite dialect mode.",
    "q8": "Riskiest component: Cartesian product explosion. Fallback: JSON-aggregated LATERAL subqueries.",
    "q9": "Potential faking: static SQL strings. Anti-fake check 5 constructs dynamic aliased query at runtime and asserts alias appears in generated LATERAL SQL.",
    "q10": "Safety/ethics: Safe; local relational schema transpilation only."
  }
}

b31_old_diag = """
- **Old Title**: GraphQL to SQL Compiler & Query Optimizer
- **Domain**: Full-Stack Web
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic AST traversal; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Hasura, PostGraphile, and Prisma all solve this at scale')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an internal query compiler using HTTP web-service throughput targets.
2. **Commercial employer marketing**:
   > "Hasura, PostGraphile, and Prisma all solve this at scale. Any company building a data-intensive GraphQL API needs query optimization..."
"""

b31_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using TypeScript and PostgreSQL at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Compilation latency (< 2.5ms) and single-query round-trip reduction (1 single query) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. SQLite dialect compiler output with in-memory execution if PostgreSQL is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 8-table relational schema and 50 benchmark GraphQL queries included.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full compiler test suite and dynamic query check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. AST compilation latency, database round-trip reduction, and SQL parameterization rate are unique to query compilers.",
    "Is every bullet claim verified by rubric?": "YES. Round-trip reduction verified by Check 1; compilation latency and parameterization verified by Checks 0 & 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] constructs a dynamic aliased GraphQL query at runtime and asserts exact SQL LATERAL reflection.",
    "Are all terms accurate?": "YES. Accurately covers GraphQL AST visitor, schema mapping, LATERAL subqueries, and parameterized SQL clauses.",
    "Does problem statement promise only what is verified?": "YES. AST visitor, join generator, filter transpiler, complexity analyzer, and SQL formatter are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic relational schemas; no personal data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering AST selection set mapping, LATERAL subqueries, parameterized filters, and static complexity scoring."
}

b31_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved dynamic SQL view materialization and multi-dialect support to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic compiler metrics (compilation latency, database round-trip reduction, and SQL parameterization rate).
- Removed Banned Content: Removed employer marketing regarding Hasura, PostGraphile, and Prisma.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic aliased query test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ROUNDTRIP_COUNT] and [COMPILATION_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 32. brief-high-throughput-logging
# ==============================================================================
b32_data = {
  "id": "brief-high-throughput-logging",
  "title": "High-Throughput Log Processing & Alerting Daemon in Go with Ring Buffers",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems/low-level/networking", "CLI/tools/libraries"],
  "problem": "Production cloud applications generate tens of thousands of unstructured log events per second that quickly saturate network bandwidth, overwhelm centralized observability databases, and delay incident alerting. Naive log forwarders cause high CPU utilization, memory leaks from unbounded queueing during network partitions, and dropped critical alert signals. This project implements a high-throughput, low-latency log processing and alerting daemon from first principles in Go. The daemon reads high-volume log streams over stdio and Unix sockets into bounded circular ring buffers, parses structured attributes using optimized regular expressions, detects sliding-window error rate anomalies using Redis, and dispatches bulk indexing batches to Elasticsearch with backpressure control.",
  "use_cases": [
    "Container host sidecar daemon parsing microservice logs and filtering noisy debug outputs locally",
    "Real-time security anomaly monitoring detecting sudden spikes in HTTP 401/403 credential attacks",
    "Observability pipeline ingesting high-throughput application logs into centralized search clusters"
  ],
  "hard_parts": [
    "Managing bounded lock-free circular ring buffers to eliminate memory allocation churn during log surges",
    "Optimizing regular expression tokenizers to parse structured attributes without creating CPU bottlenecks",
    "Tracking sliding-window error rate anomalies across millisecond buckets with bounded Redis storage",
    "Implementing backpressure and exponential backoff retry buffers when downstream Elasticsearch clusters saturate"
  ],
  "screener_signals": [
    "Clean Go implementation cleanly separating ring buffer readers, Grok/regex parsers, Redis anomaly detectors, and bulk dispatchers",
    "High-throughput load benchmark sustaining greater than 75,000 log lines/sec on a standard 4-core CPU with memory < 65MB",
    "Anti-fake verification script streaming sudden dynamic fatal error bursts and asserting immediate anomaly threshold alert trigger"
  ],
  "job_families": [
    "Platform Engineer",
    "Site Reliability Engineer",
    "Observability Systems Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "systems language powering the high-throughput log processing daemon and ring buffer memory"},
    {"tool": "Redis", "role": "in-memory data store maintaining sliding-window log anomaly counters atomically"},
    {"tool": "Docker", "role": "container runtime packaging log daemon, Elasticsearch, and Redis services"},
    {"tool": "Elasticsearch", "role": "search and analytics engine receiving batched structured log index payloads"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Bounded Ring Buffer Ingestion Daemon",
        "tools_used": ["Go"],
        "purpose": "Consumes raw log byte streams over stdio/sockets into pre-allocated memory ring buffers with zero allocations"
      },
      {
        "name": "Structured Regex Log Parser",
        "tools_used": ["Go"],
        "purpose": "Tokenizes raw lines into timestamp, severity level, service name, and message payload structures"
      },
      {
        "name": "Sliding-Window Anomaly & Alert Engine",
        "tools_used": ["Go", "Redis"],
        "purpose": "Tracks error counts in sliding time buckets and triggers alerts when threshold breaches occur"
      },
      {
        "name": "Elasticsearch Bulk Indexer with Backpressure",
        "tools_used": ["Go", "Elasticsearch", "Docker"],
        "purpose": "Batches parsed logs into bulk HTTP requests, managing worker pools and backpressure rate limits"
      }
    ],
    "data_flow": "Application log streams arrive over stdio or Unix sockets; the Ingestion Daemon writes lines into pre-allocated circular ring buffers; worker goroutines pull lines and execute optimized regex tokenization into structured log events; the Anomaly Engine updates Redis sliding-window error counters; if error rates cross configured thresholds, an alert dispatches immediately; parsed events accumulate in memory batches of 500 items; the Bulk Indexer flushes batches to Elasticsearch via HTTP; if Elasticsearch slows down, backpressure throttles ingestion buffer intake.",
    "enforcement_mechanism": "Bounded circular ring buffers dropping lowest-severity debug lines during persistent downstream backpressure; atomic Redis counters."
  },
  "targets": [
    {
      "metric": "Sustained Log Ingestion Processing Throughput",
      "method": "Multi-threaded benchmark streaming raw log lines through ingestion, parsing, and pipeline staging",
      "input": "500,000 standard Apache/JSON log lines streamed through stdin across 8 worker goroutines",
      "environment": "Standard 4-core local CPU, Go 1.21+ release build",
      "minimum_pass": "Throughput exceeds 75,000 log lines/sec",
      "target": "Throughput exceeds 150,000 log lines/sec",
      "report": "Log processing throughput benchmark summary report"
    },
    {
      "metric": "Daemon Memory Consumption Under Peak Load",
      "method": "Resident Set Size (RSS) memory measurement during sustained peak 100,000 lines/sec log surge",
      "input": "Continuous 5-minute sustained log stream under simulated downstream Elasticsearch backpressure",
      "environment": "Standard 4-core local CPU, Go 1.21+, Linux container",
      "minimum_pass": "Resident memory consumption remains < 65 Megabytes",
      "target": "Resident memory consumption remains < 35 Megabytes",
      "report": "Memory profile log detailing heap allocations and RSS boundaries"
    },
    {
      "metric": "Sliding-Window Threshold Alert Trigger Latency",
      "method": "Wall-clock timing from arrival of threshold-breaching error log burst to alert notification emission",
      "input": "Burst of 100 ERROR log events injected within a 1-second window against a threshold of 50/sec",
      "environment": "Standard 4-core local CPU, Go 1.21+, Redis 7",
      "minimum_pass": "Alert notification triggers in < 500 milliseconds from threshold breach",
      "target": "Alert notification triggers in < 150 milliseconds from threshold breach",
      "report": "Alert trigger timing verification log"
    }
  ],
  "skills": ["Go", "Redis", "Docker", "Elasticsearch", "Logging", "Platform Engineering", "DevOps", "Systems Programming"],
  "starter_input": {
    "spec": "Log dataset schemas (standard JSON log format, Nginx combined format, syslog RFC 5424) and benchmark load generator.",
    "size": "500,000 synthetic log lines totaling 85MB with realistic severity distribution (80% INFO, 15% WARN, 5% ERROR)",
    "seeded_cases": "Sudden 10x error spikes, malformed multiline log traces, non-UTF8 binary byte corruptions, and downstream network disconnects",
    "label_source": "Deterministic log generator fixture with known injected anomaly timestamps and expected error counts",
    "personal_data_policy": "Strictly mock synthetic log messages and fake IP addresses; zero personal data used"
  },
  "components": [
    {"name": "Ring-Buffer Log Ingestion & Tokenizer Daemon", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Structured Grok/Regex Log Parser & Classifier", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "Sliding-Window Anomaly & Threshold Detector", "task_type": "low-level/system subsystem", "hours": 4.0},
    {"name": "Elasticsearch Bulk Indexer with Backpressure", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 4.0},
    {"name": "High-Throughput Ingestion & Anomaly Alert Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Logging Architecture Diagram & Alert Policy Runbook", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "items": [
      "Kafka multi-partition consumer group with dynamic rebalancing",
      "PagerDuty and Slack webhook alert dispatcher with interactive deduplication"
    ],
    "hours": 12
  },
  "milestones": [
    {
      "name": "Ring-Buffer Ingestion Daemon & High-Throughput Stdio Reader in Go Systems Programming",
      "hours": 7,
      "done_criterion": "Daemon ingests lines into circular ring buffers, sustaining > 75,000 lines/sec."
    },
    {
      "name": "Regex Log Parsing & Structured Schema Extraction in Platform Engineering",
      "hours": 7,
      "done_criterion": "Parser tokenizes JSON and Nginx lines into structured events; memory stays < 65MB."
    },
    {
      "name": "Sliding-Window Threshold Alerting with Redis in DevOps and Logging",
      "hours": 7,
      "done_criterion": "Redis sliding-window detects error spikes and emits alerts in < 500ms."
    },
    {
      "name": "Elasticsearch Bulk Ingestion Benchmark, Docker Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark verifies bulk flushing; anti-fake test catches dynamic fatal error burst; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go (goroutines, channels, sync primitives, byte buffers)",
    "Understanding of regular expression optimization, ring buffers, and backpressure patterns"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and memory bound operations)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and Docker 24+ installed",
    "fallback_path": "Local mock file indexer and in-memory Redis simulator if Docker containers cannot run"
  },
  "riskiest_component": {
    "name": "Garbage Collection Latency Pauses During High-Allocation String Parsing",
    "fallback": "Leverage sync.Pool to reuse byte buffers and pre-allocated token structs without dynamic heap allocation"
  },
  "deliverables": [
    "Git repository containing Go log processing daemon, regex tokenizers, and benchmark harness",
    "Docker Compose file running log daemon, Elasticsearch, and Redis",
    "High-throughput load testing script generating 500,000 structured log lines",
    "Screener verification script executing automated benchmark and dynamic alert test in under 2 minutes"
  ],
  "out_of_scope": [
    "Full-featured interactive web visualization UI replicating Kibana or Grafana dashboards",
    "Machine learning natural language log clustering with unsupervised embeddings",
    "Hardware network interface card (NIC) kernel-bypass packet capture (e.g. DPDK)"
  ],
  "safety_note": None,
  "resources": [
    "High-Performance Go: Buffer Reuse and Garbage Collection Optimization",
    "Sliding Window Counter Algorithms Using Redis Sorted Sets",
    "Elasticsearch Bulk Indexing and Backpressure Architecture Guidelines"
  ],
  "rubric": [
    {
      "input": "500,000 log lines streamed through stdin to log processing daemon",
      "action": "go run ./cmd/logbench --input data/logs_500k.log",
      "expected_result": "Daemon processes lines with sustained throughput exceeding 75,000 lines/sec",
      "evidence_location": "Throughput benchmark summary output log",
      "pass_criterion": "Measured throughput is > 75,000 lines/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Continuous 5-minute peak load stream testing memory stability",
      "action": "python scripts/monitor_memory.py --process logdaemon --duration 300",
      "expected_result": "Resident memory consumption remains bounded below 65 Megabytes",
      "evidence_location": "Memory profiling output log",
      "pass_criterion": "Peak RSS memory is < 65MB with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Burst of 100 ERROR logs injected within 1-second against 50/sec threshold",
      "action": "bash scripts/inject_error_burst.sh --count 100 --window 1",
      "expected_result": "Daemon detects anomaly and dispatches alert notification in < 500 milliseconds",
      "evidence_location": "Alert notification log and reports/alert_latency.json",
      "pass_criterion": "Alert latency is < 500 milliseconds with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Batch of 500 parsed log events dispatched to Elasticsearch",
      "action": "curl http://localhost:9200/app-logs/_count",
      "expected_result": "Elasticsearch confirms indexed documents match dispatched batch count",
      "evidence_location": "Elasticsearch document count response",
      "pass_criterion": "Indexed document count matches expected input with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic burst of 25 error logs containing dynamic token 'FATAL_DYNAMIC_CRASH_99' injected at runtime",
      "action": "python scripts/verify_dynamic_alerts.py --token FATAL_DYNAMIC_CRASH_99 --burst 25",
      "expected_result": "Anomaly detector triggers alert explicitly referencing FATAL_DYNAMIC_CRASH_99 token within 500ms",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Alert message contains FATAL_DYNAMIC_CRASH_99, latency < 500ms, exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected high-throughput log processing daemon in Go with bounded circular ring buffers; sustained [LOG_THROUGHPUT] ingestion throughput within a [MEMORY_FOOTPRINT] memory footprint, and achieved sub-[ALERT_LATENCY] sliding-window anomaly alert triggering.",
    "claims": [
      {
        "text": "sustained [LOG_THROUGHPUT] ingestion throughput within a [MEMORY_FOOTPRINT] memory footprint",
        "rubric_indexes": [0, 1]
      },
      {
        "text": "achieved sub-[ALERT_LATENCY] sliding-window anomaly alert triggering",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "unsupervised machine learning log clustering or kernel-bypass DPDK networking"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a high-throughput log processing daemon in Go with ring buffers, regex parsing, Redis sliding-window alerts, and Elasticsearch bulk flushing.",
    "q2": "Target users: platform engineers, SREs, and observability infrastructure developers.",
    "q3": "3 use cases: container sidecar log filtering, real-time security anomaly monitoring, and central log aggregation.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: bounded lock-free ring buffers, regex optimization, sliding-window Redis error counters, and backpressure buffer management.",
    "q6": "Starter input: 500,000 log lines totaling 85MB across JSON and Nginx formats. Synthetic logs only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local file indexer and in-memory Redis mock.",
    "q8": "Riskiest component: GC latency pauses during high allocation. Fallback: sync.Pool buffer reuse.",
    "q9": "Potential faking: mock alert triggers. Anti-fake check 5 injects dynamic fatal error token at runtime and asserts alert message references token.",
    "q10": "Safety/ethics: Safe; synthetic log streams only."
  }
}

b32_old_diag = """
- **Old Title**: High-Throughput Log Processing & Alerting Daemon
- **Domain**: Platform & DevOps
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic log forwarder; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Datadog, Elastic Stack, Splunk are billion-dollar businesses', 'top tech platforms, top tech platforms, and Ola')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating log line throughput, daemon memory footprint, and anomaly alert latency.
2. **Commercial employer marketing**:
   > "Datadog, Elastic Stack (ELK), and Splunk are billion-dollar businesses built on this problem. In India, companies like top tech platforms, top tech platforms, and Ola have built internal platforms..."
"""

b32_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go, Redis, and Elasticsearch at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Log throughput (> 75k lines/s), memory footprint (< 65MB), and alert latency (< 500ms) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. Local mock file indexer and in-memory Redis mock if Docker is unavailable.",
    "Can test data be created in minutes?": "YES. Synthetic 500,000 log line generator script included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full throughput test and dynamic alert check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Sustained log ingestion throughput, memory footprint under load, and sliding-window alert trigger latency are unique to logging daemons.",
    "Is every bullet claim verified by rubric?": "YES. Throughput and memory verified by Checks 0 & 1; alert latency verified by Check 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] injects a dynamic fatal error token at runtime and asserts the alert message references the token.",
    "Are all terms accurate?": "YES. Accurately covers bounded ring buffers, regex tokenization, sliding-window Redis buckets, and backpressure bulk flushing.",
    "Does problem statement promise only what is verified?": "YES. Ring buffer ingestion, regex parser, anomaly detector, and bulk indexer are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Strictly synthetic log streams and simulated IP addresses.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering bounded ring buffers, regex optimization, sliding-window Redis counters, and backpressure management."
}

b32_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Kafka consumer groups and PagerDuty dispatcher to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic logging daemon metrics (log throughput, daemon memory footprint, and anomaly alert trigger latency).
- Removed Banned Content: Removed employer marketing regarding Datadog, Splunk, Elastic, and duplicate company names.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic fatal token alert test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [LOG_THROUGHPUT], [MEMORY_FOOTPRINT], and [ALERT_LATENCY] with strict 'Do not claim' boundary.
"""


# ==============================================================================
# 33. brief-homomorphic-encryption
# ==============================================================================
b33_data = {
  "id": "brief-homomorphic-encryption",
  "title": "Confidential Database Query Engine with Homomorphic Encryption",
  "domain": "Security & Platform",
  "difficulty": "ADVANCED",
  "project_types": ["Systems/low-level/networking", "CLI/tools/libraries"],
  "problem": "Traditional database encryption-at-rest models protect files on disk but force database servers to decrypt data into plaintext memory during query execution, exposing sensitive financial and healthcare records to rogue database administrators, memory-scraping malware, and cloud hypervisor compromises. Homomorphic Encryption (HE) solves this by enabling mathematical operations directly on ciphertexts without decryption. This project builds a confidential database query prototype in Python, TenSEAL, PostgreSQL, and Cryptography. The system encrypts sensitive numerical records client-side using BFV and CKKS homomorphic schemes, stores encrypted vector blobs in PostgreSQL, executes homomorphic SUM and AVG aggregations entirely on the server without plaintext access, and monitors ciphertext noise budgets to guarantee mathematical correctness upon client decryption.",
  "use_cases": [
    "Healthcare research platforms aggregating encrypted patient clinical metrics across hospitals without HIPAA disclosures",
    "Financial banking compliance audits verifying aggregate capital reserves without viewing individual customer balances",
    "Confidential cloud database services offering zero-knowledge query processing on untrusted cloud infrastructure"
  ],
  "hard_parts": [
    "Selecting and parameterizing BFV and CKKS homomorphic encryption polynomial modulus degrees and coefficient sizes",
    "Tracking and managing ciphertext noise budget consumption across successive multiplication and addition operations",
    "Executing homomorphic arithmetic operations across PostgreSQL bytea ciphertext vectors without memory exhaustion",
    "Guaranteeing zero plaintext information leakage in database query logs, execution buffers, and temporary storage"
  ],
  "screener_signals": [
    "Clean Python codebase separating client cryptographic key managers, homomorphic arithmetic engines, and PostgreSQL storage handlers",
    "Zero-knowledge audit verifying that database query logs and server memory contain zero plaintext numerical records",
    "Anti-fake verification script inserting dynamic encrypted payroll records and verifying exact decrypted mathematical sum parity"
  ],
  "job_families": [
    "Applied Cryptography Engineer",
    "Security Platform Engineer",
    "Privacy-Preserving Systems Developer"
  ],
  "stack": [
    {"tool": "Python", "role": "programming language implementing client encryption wrappers and server query routines"},
    {"tool": "PostgreSQL", "role": "relational database storing encrypted ciphertext byte buffers and metadata"},
    {"tool": "Cryptography", "role": "library generating underlying key material and public-private keypairs"},
    {"tool": "Docker", "role": "container runtime packaging confidential database environment and dependencies"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Homomorphic Cryptosystem Context & Key Manager",
        "tools_used": ["Python", "Cryptography"],
        "purpose": "Generates BFV/CKKS public evaluation keys, secret keys, and Galois rotation keys with configurable parameters"
      },
      {
        "name": "Client Encryption & Decryption Module",
        "tools_used": ["Python"],
        "purpose": "Encrypts client plaintext vectors before transmission and decrypts aggregated server response ciphertexts"
      },
      {
        "name": "PostgreSQL Ciphertext Storage Layer",
        "tools_used": ["PostgreSQL", "Docker"],
        "purpose": "Stores serialized homomorphic ciphertext bytea arrays and associated non-sensitive relational attributes"
      },
      {
        "name": "Confidential Homomorphic Evaluation Engine",
        "tools_used": ["Python"],
        "purpose": "Executes homomorphic vector additions, multiplications, and scalar scalings directly on server ciphertexts"
      }
    ],
    "data_flow": "The client Key Manager initializes BFV/CKKS cryptographic context parameters; public evaluation keys serialize and transmit to the server while private secret keys remain on the client; the client encrypts numerical records (e.g. salaries) and uploads ciphertext bytes to PostgreSQL; when an analytical query (e.g. SUM or AVG) arrives, the Confidential Evaluation Engine loads ciphertext byte arrays into memory; the engine performs homomorphic additions directly on ciphertexts without decryption; the resulting aggregated ciphertext byte buffer returns to the client; the client decrypts the payload using its private secret key, verifying noise budget and recovering the exact mathematical result.",
    "enforcement_mechanism": "Cryptographic zero-knowledge guarantee: secret keys never leave the client; database server possesses only evaluation keys capable of arithmetic but incapable of decryption."
  },
  "targets": [
    {
      "metric": "Zero-Knowledge Plaintext Confidentiality Rate",
      "method": "Memory dump inspection and database query log audit searching for plaintext numerical fragments during active query execution",
      "input": "1,000 encrypted financial records processed through server aggregation queries",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+, Python 3.11",
      "minimum_pass": "0 plaintext values discovered in database query logs or server memory buffers",
      "target": "0 plaintext values discovered in database query logs or server memory buffers",
      "report": "Confidential computing memory inspection and audit verification report"
    },
    {
      "metric": "Homomorphic Vector Addition Execution Latency",
      "method": "Wall-clock timing to execute homomorphic vector addition across 1,000 encrypted ciphertext records",
      "input": "1,000 encrypted BFV ciphertext vectors evaluated on server CPU",
      "environment": "Standard 4-core local CPU, Python 3.11, TenSEAL release build",
      "minimum_pass": "Execution completes in < 2.5 milliseconds per record pair",
      "target": "Execution completes in < 0.8 milliseconds per record pair",
      "report": "Homomorphic arithmetic benchmark timing log"
    },
    {
      "metric": "Decrypted Result Mathematical Precision Parity Rate",
      "method": "Comparison between decrypted homomorphic aggregation result and canonical plaintext floating-point sum",
      "input": "100 distinct batch aggregations evaluated across varying dataset sizes and numerical scales",
      "environment": "Standard 4-core local CPU, Python 3.11",
      "minimum_pass": "100 of 100 batch aggregations match plaintext mathematical sum within 1e-4 tolerance",
      "target": "100 of 100 batch aggregations match plaintext mathematical sum within 1e-4 tolerance",
      "report": "Decrypted mathematical precision verification output log"
    }
  ],
  "skills": ["Python", "PostgreSQL", "Cryptography", "Docker", "Homomorphic Encryption", "Security Engineering", "Systems Programming"],
  "starter_input": {
    "spec": "Homomorphic encryption parameter specification (poly_modulus_degree=8192, coeff_mod_bit_sizes), database DDL, and sample financial batch.",
    "size": "5,000 numerical financial records with simulated account attributes and benchmark test queries",
    "seeded_cases": "Ciphertext noise budget exhaustion, scale factor mismatch during CKKS multiplication, and serialization corruption",
    "label_source": "Deterministic plaintext calculation manifest mapping test batches to exact expected mathematical sums and averages",
    "personal_data_policy": "Strictly mock synthetic financial records and simulated payroll values; zero real personal data used"
  },
  "components": [
    {"name": "BFV/CKKS Cryptosystem Key Generator & Encryptor", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Homomorphic Arithmetic Engine (Add, Multiply, Rescale)", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "PostgreSQL Encrypted Vector Store & Ciphertext Tables", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Encrypted Aggregation & Equality Evaluation Service", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Client Decryption & Noise Budget Monitor", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Encrypted Query Latency & Ciphertext Expansion Benchmark", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Cryptographic Threat Model & Zero-Trust Database Guide", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "items": [
      "Encrypted inner product vector similarity search for private semantic retrieval",
      "Bounded multi-party threshold decryption where multiple keys are required to decrypt query results"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "TenSEAL Context Setup & Homomorphic Key Generation in Python Security Engineering",
      "hours": 10,
      "done_criterion": "Context generates BFV/CKKS keys; public evaluation keys separate safely from secret keys."
    },
    {
      "name": "Encrypted Arithmetic Operations & Noise Budget Tracking in Cryptography Systems Programming",
      "hours": 10,
      "done_criterion": "Engine executes encrypted additions and multiplications; noise budget monitor tracks consumption."
    },
    {
      "name": "PostgreSQL Ciphertext Persistence & Encrypted Aggregations in Homomorphic Encryption",
      "hours": 10,
      "done_criterion": "PostgreSQL stores ciphertext bytea arrays; server computes SUM and AVG without plaintext access."
    },
    {
      "name": "Zero-Knowledge Query Benchmark, Docker Anti-Fake Test & Docs",
      "hours": 10,
      "done_criterion": "Benchmark verifies 0 plaintext leakage; decrypted sum matches ground truth; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, binary byte serialization, and SQL database operations",
    "Understanding of applied cryptography concepts (public-key encryption, lattice cryptography, homomorphic properties)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound polynomial arithmetic)",
    "cost": "$0 (fully open-source software stack via Docker Compose)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Python 3.11 and PostgreSQL 15+ installed",
    "fallback_path": "In-memory simulated Paillier or basic additively homomorphic cryptosystem if TenSEAL C-libraries encounter build issues"
  },
  "riskiest_component": {
    "name": "Ciphertext Noise Budget Exhaustion Corrupting Decrypted Results",
    "fallback": "Parameterize polynomial modulus degree to 8192 or 16384 to provide sufficient noise headroom for required arithmetic depth"
  },
  "deliverables": [
    "Git repository containing Python confidential query engine, TenSEAL wrappers, and PostgreSQL schema",
    "Docker Compose file hosting PostgreSQL database with ciphertext tables",
    "Automated confidentiality audit and mathematical precision verification test harness",
    "Screener verification script executing automated benchmark and dynamic encrypted aggregation test in under 2 minutes"
  ],
  "out_of_scope": [
    "Fully Homomorphic Encryption (FHE) with arbitrary deep circuit bootstrapping",
    "Custom lattice cryptography assembly optimizations for AVX-512 vector units",
    "Hardware security module (HSM) PKCS#11 hardware token integration"
  ],
  "safety_note": "This project processes mock financial records and synthetic numerical vectors to demonstrate privacy-preserving database encryption. It does not handle real personal health information or live commercial banking assets.",
  "resources": [
    "A Full (R)Homomorphic Encryption Scheme (Brakerski, Gentry, Vaikuntanathan BGV/BFV paper)",
    "TenSEAL: A Library for Doing Homomorphic Encryption on Tensors (OpenMined)",
    "Microsoft SEAL Architecture and Homomorphic Encryption Parameter Selection Manual"
  ],
  "rubric": [
    {
      "input": "1,000 encrypted financial records processed through server aggregation query",
      "action": "python -m confidential_db.audit_leakage",
      "expected_result": "Inspection confirms zero plaintext numeric values exist in server query logs or memory dumps",
      "evidence_location": "Terminal execution output log and reports/confidentiality_audit.json",
      "pass_criterion": "0 plaintext values discovered with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 encrypted BFV ciphertext vectors evaluated on server",
      "action": "python scripts/benchmark_he_speed.py --records 1000 --op add",
      "expected_result": "Homomorphic addition execution completes in < 2.5 milliseconds per record pair",
      "evidence_location": "Arithmetic benchmark timing summary table",
      "pass_criterion": "Average operation latency is < 2.5 milliseconds",
      "kind": "normal"
    },
    {
      "input": "100 distinct batch aggregations evaluated for mathematical precision",
      "action": "python -m confidential_db.test_precision",
      "expected_result": "Decrypted client sums match exact plaintext mathematical calculations within 1e-4 tolerance",
      "evidence_location": "Precision verification log",
      "pass_criterion": "100 of 100 batch precision tests pass within tolerance with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Encrypted aggregation query dispatched to confidential database service",
      "action": "curl http://localhost:8000/api/query/encrypted_sum?column=payroll",
      "expected_result": "Server returns serialized ciphertext byte buffer without possessing decryption keys",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and ciphertext bytes field is non-empty",
      "kind": "normal"
    },
    {
      "input": "Dynamic batch of 5 encrypted numerical values ($1,000 to $5,000) inserted at runtime",
      "action": "python scripts/verify_dynamic_he.py --values 1000,2000,3000,4000,5000",
      "expected_result": "Server computes encrypted sum; client decrypts payload to exactly $15,000.00 while server logs show only ciphertext",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Decrypted sum equals 15000.00, server log contains zero plaintext, exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected confidential database query engine in Python and PostgreSQL using Homomorphic Encryption; executed encrypted aggregations without plaintext leakage across [RECORD_COUNT] records, and delivered sub-[ADDITION_LATENCY] encrypted addition latency with verified mathematical precision.",
    "claims": [
      {
        "text": "executed encrypted aggregations without plaintext leakage across [RECORD_COUNT] records",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered sub-[ADDITION_LATENCY] encrypted addition latency with verified mathematical precision",
        "rubric_indexes": [1, 2]
      }
    ],
    "do_not_claim": "arbitrary circuit FHE bootstrapping or hardware security module PKCS token integration"
  },
  "verify": [],
  "worksheet": {
    "q1": "Core deliverable: a confidential database query engine in Python with TenSEAL, PostgreSQL ciphertext tables, and client-side key management.",
    "q2": "Target users: applied cryptography engineers, security platform architects, and privacy-preserving developers.",
    "q3": "3 use cases: HIPAA-compliant healthcare analytics, zero-knowledge financial audits, and confidential cloud databases.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: BFV/CKKS parameterization, noise budget management, ciphertext vector operations in PostgreSQL, and zero-leakage verification.",
    "q6": "Starter input: 5,000 numerical records with simulated account attributes and test queries. Synthetic records only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory Paillier simulation.",
    "q8": "Riskiest component: Noise budget exhaustion. Fallback: poly_modulus_degree=8192 or 16384 for noise headroom.",
    "q9": "Potential faking: server plaintext calculations. Anti-fake check 5 inserts 5 dynamic encrypted values, asserts server computes sum, client decrypts to 15,000.",
    "q10": "Safety/ethics: Safe; synthetic records only, no real medical or banking assets."
  }
}

b33_old_diag = """
- **Old Title**: Encrypted Database Queries with Homomorphic Encryption
- **Domain**: Security & Platform
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic TenSEAL script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (unsubstantiated claims about research-level mastery)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated homomorphic encryption with generic web-service targets rather than zero-leakage rates, encrypted addition latency, and decryption parity.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."
"""

b33_reviewer = {
    "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, TenSEAL, and PostgreSQL at $0 cost.",
    "Does each performance target name its bottleneck and is reachable?": "YES. Zero plaintext leakage (0 leaks), addition latency (< 2.5ms), and mathematical precision (100 of 100) measured directly on local machine.",
    "Is there a CPU/local/free fallback?": "YES. In-memory simulated additively homomorphic cryptosystem if TenSEAL C-libraries encounter build issues.",
    "Can test data be created in minutes?": "YES. Synthetic 5,000-record numerical dataset and test query scripts included in repository.",
    "Can screener check rubric in under 10 minutes?": "YES. Screener verification script runs full cryptographic audit and dynamic encrypted sum check in under 2 minutes.",
    "Are targets and rubric project-specific?": "YES. Zero-knowledge confidentiality rate, homomorphic addition execution latency, and decrypted mathematical precision are unique to homomorphic query systems.",
    "Is every bullet claim verified by rubric?": "YES. Zero-knowledge confidentiality verified by Check 0; addition latency and precision verified by Checks 1 & 2.",
    "Is there an anti-fake check?": "YES. Check 5 [anti_fake] inserts 5 dynamic encrypted values, verifies server computes sum, and asserts client decrypts to exact $15,000.00.",
    "Are all terms accurate?": "YES. Accurately covers BFV/CKKS schemes, public evaluation keys, noise budget management, and ciphertext bytea vectors.",
    "Does problem statement promise only what is verified?": "YES. Key manager, client encryption/decryption, PostgreSQL ciphertext store, and homomorphic evaluation engine are all built and tested.",
    "Are privacy and safety notes addressed?": "YES. Safety note confirms synthetic test records only; no real medical or banking data.",
    "Are all hard parts technical?": "YES. 4 technical challenges covering BFV/CKKS parameterization, noise budget management, ciphertext vector operations, and zero-leakage verification."
}

b33_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved encrypted vector similarity and threshold decryption to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic homomorphic encryption metrics (zero-knowledge confidentiality, addition latency, and decryption mathematical precision).
- Removed Banned Content: Removed unsubstantiated claims regarding research-level mastery.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic encrypted sum test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [RECORD_COUNT] and [ADDITION_LATENCY] with strict 'Do not claim' boundary.
"""


def run_batch_3_part2():
    res29 = process_brief(b29_data, b29_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b29_reviewer, b29_changelog)
    res30 = process_brief(b30_data, b30_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b30_reviewer, b30_changelog)
    res31 = process_brief(b31_data, b31_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b31_reviewer, b31_changelog)
    res32 = process_brief(b32_data, b32_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b32_reviewer, b32_changelog)
    res33 = process_brief(b33_data, b33_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b33_reviewer, b33_changelog)
    return [res29, res30, res31, res32, res33]

if __name__ == "__main__":
    results = run_batch_3_part2()
    print("Batch 3 Part 2 finished successfully:", results)
