"""
Batch 7 Part 1: Redesign briefs 64 to 68 from scratch.
64. brief-recommendation-engine
65. brief-schema-registry
66. brief-search-engine
67. brief-semantic-kernel-agent
68. brief-serverless-backend
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 64. brief-recommendation-engine
# ==============================================================================
b64_data = {
  "id": "brief-recommendation-engine",
  "title": "Hybrid Recommendation Engine with PyTorch Two-Tower NCF, FAISS Vector Retrieval & FastAPI Scoring",
  "domain": "ML Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML/data pipeline", "Full-stack web"],
  "problem": "Modern e-commerce and media platforms suffer from significant conversion drop-offs, user churn, and cold-start attrition when recommendation systems rely solely on static heuristic ranking or unindexed collaborative filtering. Traditional matrix factorization approaches fail to capture multi-modal item metadata, while brute-force cosine distance calculations over millions of catalog items introduce multi-second inference latencies that overwhelm web servers during peak traffic surges. This project builds a production-grade hybrid recommendation engine in Python. The system trains a two-tower Neural Collaborative Filtering (NCF) model in PyTorch combining user interaction histories and item metadata, indexes dense 128-dimensional item embeddings in FAISS using an Inverted File with Flat Quantization (IVF-Flat) index for sub-12ms candidate retrieval, serves personalized ranking predictions via FastAPI, and caches active session feature vectors in Redis.",
  "use_cases": [
    {
      "title": "E-Commerce Personalized Product Discovery",
      "first_sentence": "Online retail platforms need to display personalized product recommendations on homepages and category checkout funnels based on browsing history.",
      "second_sentence": "The engine matches active user embeddings against FAISS vector indices, retrieving top-50 candidate items and re-ranking them via FastAPI in under 15 milliseconds."
    },
    {
      "title": "Digital Streaming Media Next-Up Content Suggestions",
      "first_sentence": "Video and audio streaming services must keep users engaged by recommending relevant content tracks and podcasts as previous media ends.",
      "second_sentence": "The hybrid recommender combines user watch history embeddings with audio/genre metadata tags, generating fresh personalized queues with zero recommendation lag."
    },
    {
      "title": "Subscription Box Catalog Cross-Sell Bundling",
      "first_sentence": "Direct-to-consumer subscription platforms need to recommend complementary add-on products during monthly checkout renewal windows.",
      "second_sentence": "The model uses collaborative embeddings to identify products frequently co-purchased across peer segments, lifting average order values without manual merchandising."
    }
  ],
  "hard_parts": [
    "Training a two-tower neural network in PyTorch that maps disparate user interactions and item categorical features into a shared 128-dimensional embedding space",
    "Tuning FAISS IVF-Flat index hyperparameters (nlist clusters, nprobe search depth) to achieve >= 90% recall while sustaining sub-12ms candidate retrieval latency",
    "Designing an asynchronous Redis caching layer that maintains rolling user session vectors and prevents redundant neural network embedding recomputations",
    "Handling the item cold-start problem by falling back to content-based attribute similarities when newly introduced items lack collaborative interaction history"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating PyTorch model definitions, FAISS index builders, Redis feature stores, and FastAPI inference routers",
    "Benchmark report proving sub-15ms p95 recommendation inference latency across 100,000 candidate catalog items",
    "Anti-fake verification script passing a novel user interaction vector and asserting the top-5 recommended items dynamically align with the selected category within 50 milliseconds"
  ],
  "job_families": [
    "Machine Learning Engineer",
    "Recommendation Systems Developer",
    "Applied AI Software Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing neural network training, vector indexing, and inference endpoints"},
    {"tool": "PyTorch", "role": "deep learning framework implementing two-tower neural collaborative filtering architecture and loss functions"},
    {"tool": "FAISS", "role": "vector similarity library powering high-speed approximate nearest neighbor search over item embeddings"},
    {"tool": "Redis", "role": "in-memory cache serving user interaction histories, session vectors, and precomputed popular fallback items"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving real-time personalized item recommendation requests"},
    {"tool": "PostgreSQL", "role": "relational database storing historical interaction logs, product catalogs, and evaluation metrics"}
  ],
  "architecture": {
    "components": [
      {
        "name": "PyTorch Two-Tower NCF Training Pipeline & Loss Engine",
        "tools_used": ["Python", "PyTorch"],
        "purpose": "Trains user and item neural towers with binary cross-entropy and Triplet Margin loss on interaction datasets"
      },
      {
        "name": "FAISS IVF-Flat Vector Indexing & Candidate Generator",
        "tools_used": ["Python", "FAISS"],
        "purpose": "Builds and queries 128-d vector index over 100,000 items, executing sub-10ms approximate nearest neighbor search"
      },
      {
        "name": "Redis Real-Time Feature Store & Cold-Start Cache Layer",
        "tools_used": ["Python", "Redis"],
        "purpose": "Maintains recent user interaction sequences and caches global popular items for cold-start fallbacks"
      },
      {
        "name": "FastAPI Low-Latency Recommendation Inference Service",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Accepts user recommendation requests, queries FAISS and Redis, applies ranking filters, and returns scored IDs"
      },
      {
        "name": "PostgreSQL Interaction Log & Catalog Persistence Store",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Stores permanent product metadata, user purchase transactions, and evaluation ranking ground truth datasets"
      },
      {
        "name": "Recommendation Retrieval Accuracy & Latency Benchmark Harness",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Evaluates NDCG@10, HitRate@10, and p95 inference latencies across 10,000 synthetic test queries"
      },
      {
        "name": "Hybrid Recommender Architecture Guide & FAISS Tuning Manual",
        "tools_used": ["Python", "FAISS"],
        "purpose": "Documents embedding dimensionality trade-offs, IVF cluster tuning, and cold-start heuristics"
      }
    ],
    "data_flow": "A user opens the application and requests recommendations; FastAPI receives the user ID and queries Redis to fetch the user's recent interaction history in < 2ms; the user tower computes a 128-dimensional query vector; the FAISS IVF-Flat index executes approximate nearest neighbor search using nprobe=10 to retrieve top-50 item candidates in < 8ms; the ranking module scores candidates against the user vector, filters previously purchased item IDs, applies cold-start popularity blending if necessary, and returns the top-10 recommended items with confidence scores; background jobs sync interaction logs from PostgreSQL to retrain PyTorch models.",
    "enforcement_mechanism": "L2 normalization on user and item embedding vectors bounding dot products to [-1, 1]; similarity thresholds filtering irrelevant candidates."
  },
  "targets": [
    {
      "metric": "p95 Hybrid Recommendation Inference Latency",
      "method": "Wall-clock timing from FastAPI request arrival to response dispatch under 200 concurrent queries per second across 100,000 items",
      "input": "5,000 recommendation requests issued against catalog of 100,000 items indexed in FAISS",
      "environment": "Standard 4-core local CPU, Redis 7+ and PostgreSQL 15+ in Docker, Python 3.11 with PyTorch CPU",
      "minimum_pass": "p95 recommendation inference latency is < 25.0 milliseconds",
      "target": "p95 recommendation inference latency is < 11.5 milliseconds",
      "report": "FastAPI recommendation latency profiling log and response percentile table"
    },
    {
      "metric": "Top-10 Ranking Accuracy (NDCG@10)",
      "method": "Normalized Discounted Cumulative Gain evaluated against held-out user interaction test split across 2,000 test users",
      "input": "Held-out test dataset of 2,000 users with positive click and purchase interaction ground truth",
      "environment": "Deterministic evaluation script executing PyTorch and FAISS candidate retrieval",
      "minimum_pass": "NDCG@10 ranking score is >= 0.72",
      "target": "NDCG@10 ranking score is >= 0.84",
      "report": "Recommendation quality evaluation report and NDCG/HitRate curves"
    },
    {
      "metric": "Candidate Retrieval Recall (HitRate@50)",
      "method": "Percentage of relevant ground-truth test items present within top-50 candidates returned by FAISS approximate search",
      "input": "2,000 test user interaction vectors evaluated against 100,000 candidate item embeddings",
      "environment": "FAISS IVF-Flat index with nlist=256 and nprobe=16 running on CPU",
      "minimum_pass": "HitRate@50 candidate retrieval recall is >= 85.0%",
      "target": "HitRate@50 candidate retrieval recall is >= 93.5%",
      "report": "FAISS approximate search recall benchmark log and cluster parameter table"
    }
  ],
  "skills": ["Python", "PyTorch", "FAISS", "Redis", "FastAPI", "PostgreSQL", "Recommendation Systems", "ML Engineering"],
  "starter_input": {
    "spec": "Directory containing PyTorch two-tower model code, FAISS index builder, synthetic user-item interaction generator, and FastAPI service.",
    "size": "9 Python source modules, SQL migration schema, Docker Compose manifest, and 100,000 synthetic product item catalog",
    "seeded_cases": "Cold-start users with empty interaction histories, newly introduced items without ratings, and extreme catalog popularity skews",
    "label_source": "Deterministic synthetic user preference matrices and held-out collaborative filtering ground truth splits",
    "personal_data_policy": "Strictly mock synthetic user IDs and simulated product metadata; no real personal data used"
  },
  "components": [
    {"name": "PyTorch Two-Tower NCF Training Pipeline & Loss Engine", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "FAISS IVF-Flat Vector Indexing & Candidate Generator", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Redis Real-Time Feature Store & Cold-Start Cache Layer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "FastAPI Low-Latency Recommendation Inference Service", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "PostgreSQL Interaction Log & Catalog Persistence Store", "task_type": "data pipeline step", "hours": 3.0},
    {"name": "Hybrid Recommender Architecture Guide & FAISS Tuning Manual", "task_type": "docs + architecture diagram", "hours": 1.0}
  ],
  "extended_path": {
    "features": [
      "Multi-task learning head predicting both click-through rate (CTR) and conversion rate (CVR) simultaneously",
      "Graph neural network (LightGCN) user-item bipartite graph embedding generator in PyTorch Geometric",
      "Online contextual bandit re-ranking layer dynamically balancing exploitation and exploration"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "PyTorch Two-Tower Model & Offline Training in Python, PyTorch and ML Engineering",
      "hours": 7,
      "done_criterion": "Two-tower model trains on interaction dataset; NDCG@10 achieves >= 0.72 on held-out test split."
    },
    {
      "name": "FAISS IVF-Flat Indexing & Candidate Generation in FAISS and PostgreSQL",
      "hours": 7,
      "done_criterion": "FAISS indexes 100,000 item vectors; candidate retrieval achieves HitRate@50 >= 85% in < 12ms."
    },
    {
      "name": "Redis Feature Store & FastAPI Inference API in FastAPI and Redis",
      "hours": 7,
      "done_criterion": "FastAPI endpoint serves recommendations with p95 latency < 25ms under 200 RPS."
    },
    {
      "name": "Dynamic Preference Shift Anti-Fake Test & Docs in Recommendation Systems",
      "hours": 7,
      "done_criterion": "Anti-fake test confirms top-5 recommendation shift upon preference update; docs and schemas complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python machine learning development, PyTorch tensor mechanics, and FastAPI",
    "Understanding of recommendation algorithms (collaborative filtering, two-tower models) and vector search concepts (FAISS, IVF indices)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (compact two-tower MLP embedding models and FAISS CPU index run efficiently on CPU)",
    "cost": "$0 (fully open-source stack using local Python and Docker containers for PostgreSQL and Redis)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (PostgreSQL 15+ and Redis 7+ containers) and Python 3.11 with PyTorch CPU",
    "fallback_path": "Local SQLite database and in-memory cosine similarity matrix if Docker containers are unavailable"
  },
  "riskiest_component": {
    "name": "FAISS Vector Index Memory Bloat and Cold-Start Latency Degradation",
    "mitigation": "Quantize embeddings with IVF-Flat and enforce fixed 128-d vectors; precompute global trending items in Redis for cold-start users.",
    "fallback": "Exact flat scan for smaller catalog subsets (< 10,000 items) or metadata-based category fallbacks."
  },
  "deliverables": [
    "Git repository containing PyTorch training script, FAISS index builder, Redis feature store, and FastAPI service",
    "Docker Compose file launching PostgreSQL and Redis containers with persistent volume mappings",
    "Automated evaluation benchmark script measuring NDCG@10, HitRate@50, and p95 inference latency",
    "Screener verification script executing automated candidate retrieval and dynamic preference adaptation in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial recommendation SaaS APIs (AWS Personalize / Algolia Recommend)",
    "Multi-billion parameter foundation vision/text LLM encoders",
    "Real-time streaming distributed graph neural network training on Spark clusters"
  ],
  "safety_note": None,
  "resources": [
    "Neural Collaborative Filtering (He et al., WWW 2017)",
    "FAISS: A Library for Efficient Similarity Search (Johnson, Douze, Jégou - IEEE Big Data)",
    "Deep Neural Networks for YouTube Recommendations (Covington, Adams, Sargin)"
  ],
  "rubric": [
    {
      "input": "5,000 recommendation requests issued across 100,000 candidate items in FAISS",
      "action": "python ./benchmarks/bench_inference.py --requests 5000 --concurrency 20",
      "expected_result": "FastAPI returns top-10 recommendations with p95 inference latency < 25.0ms",
      "evidence_location": "Terminal output log and reports/inference_latency.json",
      "pass_criterion": "p95 latency < 25.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Held-out test split of 2,000 user interaction profiles",
      "action": "python ./evaluation/eval_metrics.py --test-split ./data/test_interactions.csv",
      "expected_result": "Recommender achieves NDCG@10 >= 0.72 and HitRate@50 >= 85.0%",
      "evidence_location": "Recommendation evaluation report in reports/eval_results.json",
      "pass_criterion": "NDCG@10 >= 0.72 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Catalog of 100,000 items indexed using FAISS IVF-Flat index builder",
      "action": "python ./indexing/build_index.py --items 100000 --nlist 256",
      "expected_result": "Index builds successfully and persists to disk with memory footprint < 150MB",
      "evidence_location": "Index generation audit log in reports/index_build.json",
      "pass_criterion": "100 of 100 clusters initialized with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Cold-start user profile with zero historical interactions queried via API",
      "action": "curl -X POST http://localhost:8000/api/v1/recommend -H 'Content-Type: application/json' -d '{\"user_id\":\"cold_user_999\"}'",
      "expected_result": "API falls back to popular trending items cached in Redis and returns 10 valid item recommendations",
      "evidence_location": "HTTP response JSON and fallback audit log",
      "pass_criterion": "Response status 200 with 10 non-empty recommendations and exit code 0",
      "kind": "normal"
    },
    {
      "input": "User adding 3 electronics items to browsing history in rapid succession",
      "action": "python ./scripts/verify_dynamic_preference.py --user test_user_01 --add-items 'elec_1,elec_2,elec_3'",
      "expected_result": "Recommender updates user representation and returns top-5 items containing at least 4 electronics items",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms top recommendations shift to electronics category with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected hybrid recommendation engine in Python with PyTorch two-tower embeddings and FAISS; achieved [MODEL_NDCG] ranking accuracy across [CATALOG_SIZE] items, and delivered sub-[INFERENCE_LATENCY] millisecond inference latency.",
    "claims": [
      {
        "text": "achieved [MODEL_NDCG] ranking accuracy across [CATALOG_SIZE] items",
        "rubric_indexes": [1]
      },
      {
        "text": "delivered sub-[INFERENCE_LATENCY] millisecond inference latency",
        "rubric_indexes": [0]
      }
    ],
    "do_not_claim": "commercial recommendation cloud SaaS or billion-parameter transformer foundation models"
  },
  "verify": [
    "Run `pytest tests/` to confirm two-tower neural architectures, FAISS indexing, and FastAPI endpoints pass.",
    "Execute `python ./benchmarks/bench_inference.py` to verify p95 latency remains < 25ms under load.",
    "Run `python ./scripts/verify_dynamic_preference.py` to confirm real-time category recommendation shifts."
  ],
  "worksheet": {
    "q1": "Core deliverable: a hybrid recommendation engine in Python with PyTorch two-tower NCF, FAISS vector retrieval, and FastAPI scoring.",
    "q2": "Target users: machine learning engineers, recommendation systems developers, and applied AI software engineers.",
    "q3": "3 use cases: e-commerce product discovery, digital media next-up suggestions, and subscription box catalog cross-sell bundling.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: PyTorch two-tower 128-d mapping, FAISS IVF-Flat hyperparameter tuning (nlist, nprobe), Redis session caching, and cold-start fallback heuristics.",
    "q6": "Starter input: PyTorch model code, FAISS builder, synthetic interaction generator, and 100k item catalog. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker PostgreSQL and Redis.",
    "q8": "Riskiest component: FAISS memory bloat and cold-start latency spikes. Fallback: IVF quantization and Redis trending item precomputations.",
    "q9": "Potential faking: static unpersonalized item list. Anti-fake check 5 simulates adding 3 electronics items and verifies top-5 recommendations shift to electronics.",
    "q10": "Safe; synthetic product catalog and simulated user interactions only, zero personal data."
  }
}

b64_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, two-tower NCF specs, and FAISS index parameters | High |
| Tech Stack | Python, PyTorch, FAISS, Redis, FastAPI, PostgreSQL | Listed tools without explicit operational roles or data flow boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete NDCG@10 thresholds, retrieval latency bounds, and dynamic preference shift tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b64_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, PyTorch CPU, and Docker at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Inference latency (< 25ms), NDCG@10 (>= 0.72), and HitRate@50 (>= 85%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local SQLite database and in-memory cosine similarity matrix if Docker containers are unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic 100,000 item catalog generator and automated evaluation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial recommendation SaaS (AWS Personalize), billion-parameter LLM encoders, and distributed Spark clusters.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 simulates 3 electronics clicks and verifies top-5 recommendations shift dynamically to electronics.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 1 and 0."
}

b64_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved multi-task CTR/CVR learning and LightGCN to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic recommender metrics (NDCG@10, HitRate@50, and FAISS retrieval latency).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake dynamic preference adaptation test.
"""

# ==============================================================================
# 65. brief-schema-registry
# ==============================================================================
b65_data = {
  "id": "brief-schema-registry",
  "title": "Event Schema Registry & Contract Testing Platform with Python, Kafka, Apache Avro & FastAPI",
  "domain": "Data Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Platform/infra tool", "Data pipeline"],
  "problem": "Microservice topologies publishing and consuming high-velocity streaming events over Apache Kafka experience catastrophic silent pipeline failures, downstream consumer crashes, and data lake corruption when producer services deploy schema modifications without coordinating changes. Lack of centralized schema governance results in breaking field deletions, incompatible data type mutations, and untraceable payload drift across polyglot service teams. This project builds a production-grade centralized schema registry and event contract testing platform in Python. The system registers and versions Apache Avro schemas, enforces strict compatibility validation rules (BACKWARD, FORWARD, FULL, NONE), assigns global monotonically increasing schema IDs, persists schema definitions in PostgreSQL, provides a high-throughput REST API in FastAPI, and supplies serializer/deserializer interceptors for Kafka producers and consumers.",
  "use_cases": [
    {
      "title": "Financial Transaction Payment Event Governance",
      "first_sentence": "Core banking microservices streaming debit card authorization events must ensure downstream fraud detection engines never receive malformed payloads.",
      "second_sentence": "The schema registry intercepts outgoing payment messages, validating Avro schemas against registered contract versions before publishing to production Kafka topics."
    },
    {
      "title": "Continuous Delivery Pipeline Contract Compatibility Gate",
      "first_sentence": "Platform CI/CD pipelines need automated contract verification to block deployments of producer microservices that introduce breaking schema modifications.",
      "second_sentence": "The registry CLI runs pre-deployment compatibility checks against existing consumer versions, failing CI jobs with detailed diffs when non-backward-compatible changes are detected."
    },
    {
      "title": "Enterprise Data Lake Analytics Ingestion Parity",
      "first_sentence": "Data engineering teams consuming Kafka topics into analytical warehouses require consistent schema history to maintain partition evolution without table re-writes.",
      "second_sentence": "The registry assigns unique 4-byte schema IDs embedded in message wire framing, allowing warehouse loaders to parse diverse event versions deterministically."
    }
  ],
  "hard_parts": [
    "Implementing comprehensive Apache Avro schema compatibility validation algorithms (BACKWARD, FORWARD, FULL, and transitive variants) according to the Avro specification",
    "Designing confluent-wire-format binary serializers and deserializers that encode a magic byte and 4-byte global schema ID prefix with sub-millisecond serialization overhead",
    "Managing concurrent schema registration race conditions in PostgreSQL to guarantee unique version numbers and avoid duplicate schema fingerprint allocations",
    "Building an automated contract testing suite in Python that simulates evolving producer/consumer deployments across 10 distinct schema lifecycle iterations"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating Avro compatibility algorithms, REST API routers, PostgreSQL storage repositories, and Kafka serializer interceptors",
    "High-throughput benchmark report proving sub-10ms schema validation and registration latency under 500 concurrent registration requests per second",
    "Anti-fake verification script attempting to register an incompatible breaking schema (removing a required field without default value) under BACKWARD mode and asserting HTTP 409 Conflict with detailed field diff"
  ],
  "job_families": [
    "Data Platform Engineer",
    "Distributed Systems Developer",
    "Enterprise Infrastructure Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing compatibility algorithms, serializer interceptors, and REST services"},
    {"tool": "Kafka", "role": "distributed streaming broker transporting binary Avro events encoded with schema registry wire framing"},
    {"tool": "Avro", "role": "data serialization system defining compact binary event schemas, record structures, and data types"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving schema registration, lookup, and compatibility verification endpoints"},
    {"tool": "PostgreSQL", "role": "relational database storing immutable schema definitions, versions, subject mappings, and global IDs"},
    {"tool": "Docker", "role": "container runtime orchestrating local single-node Kafka, Zookeeper/KRaft, and PostgreSQL instances"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Avro Schema Compatibility & Diff Validator Engine",
        "tools_used": ["Python", "Avro"],
        "purpose": "Evaluates candidate schemas against existing versions enforcing BACKWARD, FORWARD, and FULL rules"
      },
      {
        "name": "FastAPI Schema Management & Versioning REST API",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Exposes endpoints to register subjects, fetch schema versions by ID, configure compatibility modes, and test diffs"
      },
      {
        "name": "PostgreSQL Authoritative Schema & Subject Repository",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Stores immutable canonical schema JSONs, calculates SHA-256 fingerprints, and assigns global sequential IDs"
      },
      {
        "name": "Kafka Avro Producer & Consumer Wire Serializer Interceptor",
        "tools_used": ["Python", "Kafka", "Avro"],
        "purpose": "Prepends 5-byte Confluent wire framing (magic byte + 4-byte ID) and serializes/deserializes binary payloads"
      },
      {
        "name": "Schema Registry Throughput & Compatibility Benchmark Harness",
        "tools_used": ["Python", "Docker"],
        "purpose": "Profiles schema validation throughput, serialization latency, and database query performance under concurrent load"
      },
      {
        "name": "Event Governance Architecture Guide & Schema Evolution Manual",
        "tools_used": ["Python", "Avro"],
        "purpose": "Documents Avro evolution best practices, default value rules, and CI/CD contract testing workflows"
      }
    ],
    "data_flow": "A producer prepares to emit a Kafka event; the serializer checks its local schema cache; if missing, it calls FastAPI `POST /subjects/{subject}/versions` with the Avro schema; the registry queries PostgreSQL for the latest version; the compatibility engine validates that the candidate complies with the subject's mode (e.g. BACKWARD); if valid, it assigns a global schema ID (or returns the existing ID) and persists to PostgreSQL; the producer encodes the magic byte and 4-byte schema ID followed by the Avro binary payload and sends to Kafka; consumer interceptors read the 4-byte ID from the header, fetch the schema from the registry, and deserialize the payload safely.",
    "enforcement_mechanism": "Transactional unique constraints on (subject, version) and schema fingerprint hashes in PostgreSQL preventing duplicate registrations."
  },
  "targets": [
    {
      "metric": "Schema Registration & Compatibility Validation Latency",
      "method": "Wall-clock timing to receive schema JSON, execute full Avro compatibility check against historical versions, and commit to PostgreSQL",
      "input": "1,000 sequential schema registration requests issued against subjects containing 10 historical versions",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+ in Docker, Python 3.11 with asyncpg",
      "minimum_pass": "p95 registration and validation latency is < 25.0 milliseconds",
      "target": "p95 registration and validation latency is < 9.5 milliseconds",
      "report": "Schema registry registration latency benchmark report and database write timing"
    },
    {
      "metric": "Kafka Avro Wire Serialization & Deserialization Overhead",
      "method": "Average duration added to Kafka message publishing and consumption pipelines by schema lookup and Avro binary encoding",
      "input": "50,000 synthetic transaction events serialized and deserialized using cached schema IDs",
      "environment": "Local Python Kafka producer/consumer client with in-memory schema LRU cache",
      "minimum_pass": "p95 serialization and deserialization overhead is < 2.0 milliseconds per event",
      "target": "p95 serialization and deserialization overhead is < 0.65 milliseconds per event",
      "report": "Wire serializer profiling benchmark log and event throughput distribution"
    },
    {
      "metric": "Incompatible Breaking Schema Rejection Parity Rate",
      "method": "Percentage of intentionally incompatible schema evolution mutations correctly detected and rejected with HTTP 409 Conflict",
      "input": "50 breaking schema mutations (deleting required fields, altering primitive types, reordering union records without defaults)",
      "environment": "Automated contract testing harness running compatibility validation suite",
      "minimum_pass": "50 of 50 breaking schema mutations rejected with detailed field conflict reasons",
      "target": "50 of 50 breaking schema mutations rejected with detailed field conflict reasons",
      "report": "Schema compatibility test audit log and rejection verification report"
    }
  ],
  "skills": ["Python", "Kafka", "Avro", "FastAPI", "PostgreSQL", "Docker", "Data Engineering", "Event-Driven Architecture"],
  "starter_input": {
    "spec": "Directory containing FastAPI schema registry service, Avro compatibility validator, Kafka serializer interceptor, and contract tests.",
    "size": "8 Python source modules, PostgreSQL SQL DDL schema, Docker Compose manifest, and 50 sample Avro schema definitions",
    "seeded_cases": "Missing field default values, incompatible union type expansions, concurrent duplicate registrations, and malformed wire format headers",
    "label_source": "Deterministic Apache Avro specification test suites and PostgreSQL relational schema constraint assertions",
    "personal_data_policy": "Strictly mock synthetic financial event schemas and simulated customer account attributes; no real personal data used"
  },
  "components": [
    {"name": "Avro Schema Compatibility & Diff Validator Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "FastAPI Schema Management & Versioning REST API", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "PostgreSQL Authoritative Schema & Subject Repository", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Kafka Avro Producer & Consumer Wire Serializer Interceptor", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Schema Registry Throughput & Compatibility Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 2.0},
    {"name": "Event Governance Architecture Guide & Schema Evolution Manual", "task_type": "docs + architecture diagram", "hours": 1.0}
  ],
  "extended_path": {
    "features": [
      "Protobuf and JSON Schema multi-format serializer support extending wire protocol beyond Apache Avro",
      "GitOps webhook integration executing automated pull request schema contract validation directly in GitHub Actions",
      "Data lineage graph generator mapping producer and consumer dependencies across registered subject topics"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Avro Compatibility Engine & PostgreSQL Storage in Python, Avro and PostgreSQL",
      "hours": 7,
      "done_criterion": "Compatibility validator enforces BACKWARD/FORWARD rules; PostgreSQL persists schema versions and IDs."
    },
    {
      "name": "FastAPI REST API & Subject Management in FastAPI and Data Engineering",
      "hours": 7,
      "done_criterion": "FastAPI endpoints serve schema lookups and registrations with p95 latency < 25ms."
    },
    {
      "name": "Kafka Wire Serializer & Deserializer Interceptors in Kafka and Docker",
      "hours": 7,
      "done_criterion": "Producer/consumer interceptors encode 5-byte wire format; overhead remains < 2.0ms per event."
    },
    {
      "name": "Breaking Schema Rejection Anti-Fake Test & Docs in Event-Driven Architecture",
      "hours": 7,
      "done_criterion": "Anti-fake test confirms breaking schema is rejected with 409; documentation and diagrams complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python backend development, asynchronous programming (FastAPI), and SQL database interactions",
    "Understanding of event-driven architectures, Apache Kafka messaging patterns, and serialization formats (Apache Avro)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, network, and storage I/O bound data platform software)",
    "cost": "$0 (fully open-source stack using local Python and Docker Desktop for Kafka and PostgreSQL)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or commercial Confluent licenses required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Kafka and PostgreSQL containers) and Python 3.11+",
    "fallback_path": "Local SQLite database and in-memory mock Kafka event bus if Docker containers are unavailable"
  },
  "riskiest_component": {
    "name": "Incomplete Avro Specification Support and False-Positive Incompatibility Rejections",
    "mitigation": "Test against the official Apache Avro specification compliance suite and implement configurable compatibility modes.",
    "fallback": "Manual compatibility override endpoint allowing authorized platform administrators to force-register emergency schemas."
  },
  "deliverables": [
    "Git repository containing FastAPI schema registry, Avro validator, Kafka serializer library, and CLI contract test tool",
    "Docker Compose file launching local Kafka, Zookeeper/KRaft, and PostgreSQL instances",
    "Automated benchmark harness verifying registration throughput, wire serialization latency, and compatibility parity",
    "Screener verification script executing automated compatibility test and dynamic breaking change rejection in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial Confluent Schema Registry proprietary enterprise security plugins (RBAC / audit logs)",
    "Multi-datacenter active-active Kafka cluster schema replication across cloud regions",
    "Real-time event streaming transformation engines (Kafka Streams / Apache Flink)"
  ],
  "safety_note": None,
  "resources": [
    "Apache Avro Specification (Official Apache Avro Document)",
    "Confluent Schema Registry Wire Format and Evolution Rules",
    "Designing Data-Intensive Applications: Chapter on Formats and Schemas (Martin Kleppmann)"
  ],
  "rubric": [
    {
      "input": "1,000 sequential schema registration requests across 10 subject versions",
      "action": "python ./benchmarks/bench_registry.py --requests 1000 --concurrency 10",
      "expected_result": "Registry validates and commits schemas with p95 latency < 25.0ms and 0 HTTP errors",
      "evidence_location": "Terminal output log and reports/registry_latency.json",
      "pass_criterion": "p95 latency < 25.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50,000 synthetic transaction events serialized and deserialized with cached schema IDs",
      "action": "python ./benchmarks/bench_wire_serializer.py --events 50000",
      "expected_result": "Serializer encodes and decodes wire payloads with average overhead < 2.0ms per event",
      "evidence_location": "Wire serializer benchmark report in reports/serializer_perf.json",
      "pass_criterion": "Average overhead < 2.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 breaking schema evolution mutations evaluated under BACKWARD mode",
      "action": "python ./tests/test_compatibility_matrix.py --mode BACKWARD",
      "expected_result": "Validator rejects all 50 breaking schemas and outputs specific conflicting field names",
      "evidence_location": "Compatibility audit log in reports/compatibility_audit.json",
      "pass_criterion": "50 of 50 breaking schemas rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "CLI contract validation command executed against valid backward-compatible schema update",
      "action": "python ./cli/schema_ctl.py validate --subject payment-events --schema ./schemas/payment_v2.avsc",
      "expected_result": "CLI outputs 'COMPATIBLE: Schema satisfies BACKWARD compatibility' with exit code 0",
      "evidence_location": "CLI stdout terminal output",
      "pass_criterion": "Output displays COMPATIBLE status with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Candidate schema removing required field 'account_id' without default value under BACKWARD mode",
      "action": "python ./scripts/verify_breaking_rejection.py --subject user-events --schema-diff remove_account_id",
      "expected_result": "API responds with HTTP 409 Conflict, stating 'Field account_id was removed without default value'",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms HTTP 409 and specific field diff error with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected event schema registry in Python using FastAPI, Apache Avro, and Kafka; delivered sub-[REGISTRATION_LATENCY] millisecond schema validation latency, and eliminated breaking downstream events across [TEST_MUTATIONS] contract compatibility mutations.",
    "claims": [
      {
        "text": "delivered sub-[REGISTRATION_LATENCY] millisecond schema validation latency",
        "rubric_indexes": [0]
      },
      {
        "text": "eliminated breaking downstream events across [TEST_MUTATIONS] contract compatibility mutations",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "commercial Confluent enterprise cloud deployment or multi-datacenter active-active cluster replication"
  },
  "verify": [
    "Run `pytest tests/` to confirm Avro compatibility rules, REST API routers, and wire serializers pass.",
    "Execute `python ./benchmarks/bench_registry.py` to verify p95 latency remains < 25ms under load.",
    "Run `python ./scripts/verify_breaking_rejection.py` to assert breaking schemas are rejected with HTTP 409."
  ],
  "worksheet": {
    "q1": "Core deliverable: a centralized event schema registry and contract testing platform in Python with Apache Avro, Kafka, and FastAPI.",
    "q2": "Target users: data platform engineers, distributed systems software developers, and enterprise infrastructure architects.",
    "q3": "3 use cases: financial transaction payment event governance, CI/CD pipeline contract gate, and data lake ingestion parity.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: Avro compatibility evaluation algorithms, Confluent 5-byte wire framing, PostgreSQL concurrent version locking, and contract tests.",
    "q6": "Starter input: FastAPI schema registry code, Avro validator, Kafka serializer interceptor, and sample schemas. Synthetic schema data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker Kafka and PostgreSQL.",
    "q8": "Riskiest component: incomplete Avro spec support causing false rejections. Fallback: official Apache Avro test suites and manual override endpoints.",
    "q9": "Potential faking: accepting all schemas without actual compatibility validation. Anti-fake check 5 submits a breaking schema removing a required field and asserts HTTP 409.",
    "q10": "Safe; synthetic financial event schemas and simulated customer attributes only, zero personal data."
  }
}

b65_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, Avro compatibility rules, and wire format specifications | High |
| Tech Stack | Python, Kafka, Avro, FastAPI, PostgreSQL, Confluent | Listed Confluent without specifying whether proprietary cloud or open-source local Docker stack | Medium |
| Rubric | Missing quantitative targets | Lacked concrete registration latency bounds, serializer overhead thresholds, and breaking schema diff tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b65_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Docker Desktop for Kafka and PostgreSQL at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Registration latency (< 25ms), serializer overhead (< 2.0ms), and rejection parity (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local SQLite database and in-memory mock event bus if Docker containers are unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic Avro schema definitions and automated compatibility test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial Confluent enterprise plugins (RBAC), multi-region replication, and streaming Flink engines.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 removes a required field without default and verifies API responds with HTTP 409 and exact field diff.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b65_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Protobuf/JSON Schema support and GitOps CI/CD webhooks to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic schema registry metrics (registration latency, wire serializer overhead, and breaking change rejection rate).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake breaking schema removal rejection test.
"""

# ==============================================================================
# 66. brief-search-engine
# ==============================================================================
b66_data = {
  "id": "brief-search-engine",
  "title": "Full-Text Search Engine from Scratch in Go with Inverted Index, BM25 Scoring & Concurrent Segment Merging",
  "domain": "Distributed Systems",
  "difficulty": "ADVANCED",
  "project_types": ["Systems programming", "Distributed systems"],
  "problem": "Engineering teams building search interfaces often treat full-text search as an opaque black box provided by managed Elasticsearch or Solr clusters, leaving them unable to diagnose high heap memory churn, segment merge storm freezes, or unexpected relevance ranking degradation. Commercial search engines incur high infrastructure costs and severe memory overhead for small-to-medium embedded datasets. This project builds a production-grade full-text search engine from scratch in Go inspired by the Lucene architecture. The engine implements a custom text tokenizer with stop-word removal and Porter stemming, constructs memory-efficient inverted indexes with compressed posting lists using Roaring Bitmaps, executes the BM25 probabilistic relevance ranking algorithm, coordinates concurrent multi-segment memory flushes and background merges, and exposes a high-throughput HTTP search API delivering sub-15ms queries across 100,000 documents.",
  "use_cases": [
    {
      "title": "Enterprise Knowledge Base Documentation Search",
      "first_sentence": "Internal developer portals hosting hundreds of thousands of engineering design docs and markdown pages need fast keyword and phrase search.",
      "second_sentence": "The engine indexes markdown content into inverted posting lists, ranking documentation snippets with BM25 relevance scores and serving search queries in under 12 milliseconds."
    },
    {
      "title": "E-Commerce Product Catalog Multi-Field Search",
      "first_sentence": "Online retail platforms require accurate product discovery across title, description, and brand attributes with boolean query operators.",
      "second_sentence": "The search engine parses multi-field boolean queries (AND, OR, NOT), computes disjunctive union and conjunctive intersection over compressed bitmaps, and returns ranked product IDs."
    },
    {
      "title": "High-Throughput Application Log Inspection Search",
      "first_sentence": "Site reliability engineers troubleshooting production incidents need to grep and filter through gigabytes of structured server log lines in real time.",
      "second_sentence": "The engine streams incoming log lines into memory segments, flushing immutable disk segments and enabling instant sub-second text queries across millions of log events."
    }
  ],
  "hard_parts": [
    "Implementing compressed posting lists using Roaring Bitmaps or Variable-Byte integer encoding to minimize RAM residency across high-cardinality vocabularies",
    "Implementing the Okapi BM25 relevance scoring formula with term frequency (TF), inverse document frequency (IDF), and document length normalization (k1=1.2, b=0.75)",
    "Designing a concurrent LSM-like segment architecture where mutable memory buffers flush to immutable on-disk segment files with background merge routines",
    "Constructing an Abstract Syntax Tree (AST) query parser supporting complex boolean expressions (AND, OR, NOT, phrase queries, and field prefixes)"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating the text analysis pipeline, inverted index structures, BM25 scoring modules, segment merge workers, and HTTP query handlers",
    "Search performance benchmark proving sub-15ms p95 query latency across an indexed corpus of 100,000 documents with memory consumption under 250MB",
    "Anti-fake verification script indexing 3 documents with subtle term frequency differences and asserting the BM25 score ranking matches exact mathematical calculation"
  ],
  "job_families": [
    "Search Infrastructure Software Engineer",
    "Distributed Systems Developer",
    "Core Systems Software Engineer"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems language implementing text analysis, inverted indexes, segment flushes, and HTTP APIs"},
    {"tool": "Concurrency", "role": "goroutines, mutexes, and channels orchestrating non-blocking background segment flushes and disk merges"},
    {"tool": "Algorithms", "role": "Okapi BM25 probabilistic relevance ranking, Porter stemmer, and roaring bitmap set operations"},
    {"tool": "Data Structures", "role": "inverted posting lists, term dictionary tries, skip lists, and immutable disk segment files"},
    {"tool": "HTTP", "role": "RESTful web API server accepting document ingestion batches and executing structured search queries"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Text Tokenizer, Stemmer & Normalization Pipeline",
        "tools_used": ["Go", "Algorithms"],
        "purpose": "Splits text streams into normalized tokens, filters stop-words, and applies the Porter stemming algorithm"
      },
      {
        "name": "Inverted Index Memory Buffer & Posting List Store",
        "tools_used": ["Go", "Data Structures"],
        "purpose": "Maps terms to compressed posting lists (docID, term frequency, position offsets) using Roaring Bitmaps"
      },
      {
        "name": "Okapi BM25 Relevance Scoring & Ranking Engine",
        "tools_used": ["Go", "Algorithms"],
        "purpose": "Calculates BM25 relevance scores across matched document sets, normalizing by document length and term frequency"
      },
      {
        "name": "Concurrent Disk Segment Flusher & Merge Controller",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Flushes full in-memory index buffers to immutable disk files and merges multiple small segments into unified segments"
      },
      {
        "name": "Boolean AST Query Parser & Execution Coordinator",
        "tools_used": ["Go", "Data Structures"],
        "purpose": "Parses boolean search queries (AND, OR, NOT) into AST execution plans and evaluates posting list intersections"
      },
      {
        "name": "Search Engine Query Latency & Throughput Benchmark Harness",
        "tools_used": ["Go", "HTTP"],
        "purpose": "Benchmarks query throughput, memory usage, and p95 retrieval latency across 100,000 indexed documents"
      },
      {
        "name": "Search Engine Architecture Guide & Inverted Index Manual",
        "tools_used": ["Go", "Algorithms"],
        "purpose": "Documents BM25 parameter tuning, posting list compression schemes, and segment merge policies"
      }
    ],
    "data_flow": "Documents post to the `/api/v1/index` HTTP endpoint; the text analysis pipeline tokenizes, normalizes, and stems the text; tokens and position offsets insert into the active in-memory index segment; when the memory buffer reaches 10MB, a background goroutine flushes the segment to an immutable disk file; when a search query arrives at `/api/v1/search`, the boolean parser tokenizes the query into an AST; the query engine fetches posting lists for each term across all active disk segments, computes set intersections/unions, evaluates the BM25 relevance score for each matching document, sorts top-K results, and returns the JSON payload; periodically, the merge controller merges disk segments.",
    "enforcement_mechanism": "Thread-safe read-write mutex locks isolating active write buffers from read segments; document length bounds preventing score skew."
  },
  "targets": [
    {
      "metric": "p95 Full-Text Search Query Latency",
      "method": "Wall-clock timing from HTTP query arrival to JSON response dispatch across 100,000 indexed documents",
      "input": "10,000 multi-word boolean queries issued at 500 queries per second against corpus of 100,000 documents",
      "environment": "Standard 4-core local CPU, Go 1.21+ release binary running on Linux / Windows WSL2",
      "minimum_pass": "p95 full-text query latency is < 25.0 milliseconds",
      "target": "p95 full-text query latency is < 9.5 milliseconds",
      "report": "Search engine query latency benchmark report and percentile response table"
    },
    {
      "metric": "Document Ingestion & Indexing Throughput",
      "method": "Documents per second tokenized, indexed into posting lists, and persisted across 100,000 documents",
      "input": "100,000 text documents (average length 500 words) ingested in batches of 1,000",
      "environment": "Local Go search engine binary utilizing 4 concurrent worker goroutines",
      "minimum_pass": "Sustained document indexing throughput is >= 4,000 documents per second",
      "target": "Sustained document indexing throughput is >= 12,000 documents per second",
      "report": "Ingestion throughput profiling log and memory allocation trace"
    },
    {
      "metric": "BM25 Scoring Mathematical Parity Rate",
      "method": "Percentage of test document ranking queries matching exact analytical BM25 ground-truth calculation to 4 decimal places",
      "input": "50 multi-term evaluation queries tested across synthetic document sets with varied term frequencies",
      "environment": "Deterministic mathematical scoring test harness comparing Go output against reference Python script",
      "minimum_pass": "50 of 50 query evaluations match reference BM25 calculations exactly",
      "target": "50 of 50 query evaluations match reference BM25 calculations exactly",
      "report": "BM25 scoring verification audit log and numerical precision table"
    }
  ],
  "skills": ["Go", "Concurrency", "Algorithms", "Data Structures", "HTTP", "Distributed Systems", "Systems Programming"],
  "starter_input": {
    "spec": "Directory containing Go search engine scaffolding, Porter stemmer package, Roaring Bitmap wrapper, and 100,000 synthetic text docs.",
    "size": "10 Go source packages, sample test corpus, and automated benchmark load testing suite",
    "seeded_cases": "Hyphenated technical terms, stop-word edge cases, empty search queries, and concurrent read/write segment merge contention",
    "label_source": "Deterministic BM25 analytical reference calculations and exact word frequency assertion matrices",
    "personal_data_policy": "Strictly mock synthetic technical articles and simulated public domain documents; no real personal data used"
  },
  "components": [
    {"name": "Text Tokenizer, Stemmer & Normalization Pipeline", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Inverted Index Memory Buffer & Posting List Store", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Okapi BM25 Relevance Scoring & Ranking Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Concurrent Disk Segment Flusher & Merge Controller", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Boolean AST Query Parser & Execution Coordinator", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Search Engine Query Latency & Throughput Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Search Engine Architecture Guide & Inverted Index Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Fuzzy search with Levenshtein automaton supporting typo-tolerant fuzzy matching within edit distance 2",
      "Distributed sharding routing search queries across 3 independent search engine shard nodes over gRPC",
      "Faceted aggregation counts calculating category and author bucket distributions on search results"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Text Analysis Pipeline & Inverted Index in Go, Algorithms and Data Structures",
      "hours": 10,
      "done_criterion": "Tokenizer and stemmer process text; inverted index stores posting lists with Roaring Bitmaps."
    },
    {
      "name": "BM25 Relevance Scoring & Boolean Query Parser in Algorithms and Systems Programming",
      "hours": 10,
      "done_criterion": "Parser evaluates AND/OR/NOT queries; BM25 ranks results matching reference math across 50 trials."
    },
    {
      "name": "Concurrent Segment Flushing & HTTP Search API in Concurrency and HTTP",
      "hours": 10,
      "done_criterion": "Memory segments flush to disk without blocking reads; HTTP API serves queries with p95 < 25ms."
    },
    {
      "name": "Throughput Benchmark, Relevance Anti-Fake Test & Docs in Distributed Systems",
      "hours": 10,
      "done_criterion": "Ingestion sustains >= 4,000 docs/sec; anti-fake test validates exact BM25 ranking; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, goroutines, mutex synchronization, and file I/O",
    "Understanding of information retrieval concepts (inverted indices, posting lists, BM25 scoring) and data structures"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, memory, and disk I/O bound systems software)",
    "cost": "$0 (fully open-source Go codebase)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ compiler and standard Linux/macOS/WSL2 terminal",
    "fallback_path": "In-memory mock filesystem if local disk write permissions are restricted"
  },
  "riskiest_component": {
    "name": "Memory Churn During Large Segment Merges and Posting List Decompression",
    "mitigation": "Use fixed memory buffer pools (`sync.Pool`) for roaring bitmap decompression and stream disk merges in sorted chunks.",
    "fallback": "Limit maximum open segments to 10 and throttle background merge concurrency during peak query traffic."
  },
  "deliverables": [
    "Git repository containing Go search engine source code, HTTP server, index builders, and CLI tools",
    "Automated unit test suite verifying tokenization, BM25 scoring accuracy, and boolean query parsing",
    "Load testing benchmark harness profiling query latency and indexing throughput across 100,000 documents",
    "Screener verification script executing automated benchmark and dynamic BM25 ranking validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Managed Elasticsearch / Solr / OpenSearch cluster wrappers",
    "Multi-node distributed consensus replication (Raft sharding)",
    "Deep learning semantic neural vector search models"
  ],
  "safety_note": None,
  "resources": [
    "Information Retrieval: Implementing and Evaluating Search Engines (Büttcher, Clarke, Cormack)",
    "The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin and Page)",
    "Roaring Bitmaps: Implementation and Evaluation of Fast Compressed Bitmaps (Lemire et al.)"
  ],
  "rubric": [
    {
      "input": "10,000 multi-word boolean queries issued against 100,000 indexed documents",
      "action": "go run ./cmd/bench_search --queries 10000 --concurrency 20",
      "expected_result": "Search engine serves queries with p95 query latency < 25.0ms and 0 HTTP errors",
      "evidence_location": "Terminal output log and reports/query_latency.json",
      "pass_criterion": "p95 latency < 25.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100,000 text documents ingested in batches of 1,000",
      "action": "go run ./cmd/bench_indexing --docs 100000 --batch-size 1000",
      "expected_result": "Engine indexes corpus with sustained throughput >= 4,000 docs/sec and memory < 250MB",
      "evidence_location": "Indexing throughput report in reports/indexing_perf.json",
      "pass_criterion": "Throughput >= 4000 docs/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Complex boolean query `(database AND distributed) NOT relational`",
      "action": "go test -v ./query/... -run TestBooleanASTExecution",
      "expected_result": "AST parser evaluates query correctly; all returned documents match boolean constraints",
      "evidence_location": "Boolean query test log in reports/boolean_audit.json",
      "pass_criterion": "All returned documents satisfy boolean logic with exit code 0",
      "kind": "normal"
    },
    {
      "input": "In-memory segment reaching 10MB threshold during active read traffic",
      "action": "go test -v ./segment/... -run TestConcurrentSegmentFlush",
      "expected_result": "Buffer flushes to disk segment file cleanly without dropping in-flight search queries",
      "evidence_location": "Segment flush audit report in reports/segment_audit.json",
      "pass_criterion": "Flush completes without read errors and exit code 0",
      "kind": "normal"
    },
    {
      "input": "3 documents indexed with term counts: DocA(term=5), DocB(term=2), DocC(term=0)",
      "action": "go run ./scripts/verify_bm25_ranking.go --query 'search' --expected-order 'DocA,DocB'",
      "expected_result": "Engine ranks DocA higher than DocB with BM25 score difference matching reference formula",
      "evidence_location": "Dynamic relevance verification console execution output log",
      "pass_criterion": "Console confirms DocA rank 1 and DocB rank 2 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected full-text search engine from scratch in Go with inverted indexing and probabilistic relevance scoring; achieved sub-[QUERY_LATENCY] millisecond search latency across [DOC_COUNT] documents, and sustained [INDEX_THROUGHPUT] documents per second indexing throughput.",
    "claims": [
      {
        "text": "achieved sub-[QUERY_LATENCY] millisecond search latency across [DOC_COUNT] documents",
        "rubric_indexes": [0]
      },
      {
        "text": "sustained [INDEX_THROUGHPUT] documents per second indexing throughput",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "managed Elasticsearch cluster deployment or distributed cross-region consensus sharding"
  },
  "verify": [
    "Run `go test -v ./...` to confirm tokenization, BM25 ranking, and segment merging pass.",
    "Execute `go run ./cmd/bench_search` to verify query latency remains < 25ms under load.",
    "Run `go run ./scripts/verify_bm25_ranking.go` to assert exact BM25 mathematical ranking order."
  ],
  "worksheet": {
    "q1": "Core deliverable: a full-text search engine from scratch in Go with inverted index, BM25 scoring, and concurrent segment merges.",
    "q2": "Target users: search infrastructure software engineers, distributed systems developers, and core systems engineers.",
    "q3": "3 use cases: enterprise doc search, e-commerce catalog multi-field search, and high-throughput application log search.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: compressed posting lists with Roaring Bitmaps, BM25 mathematical scoring, concurrent segment flushing, and boolean AST parsing.",
    "q6": "Starter input: Go search engine scaffolding, Porter stemmer, bitmap wrapper, and 100k synthetic documents. Synthetic text only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/disk bound, $0 cost, zero cloud accounts. Fallback: in-memory mock filesystem.",
    "q8": "Riskiest component: memory churn during posting list decompression. Fallback: sync.Pool buffer reuse and limiting open segments to 10.",
    "q9": "Potential faking: brute-force grep pretending to be an inverted index. Anti-fake check 5 indexes 3 docs with exact term counts and verifies mathematical BM25 ranking.",
    "q10": "Safe; synthetic documentation and simulated public domain text only, zero personal data."
  }
}

b66_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, inverted index specs, and BM25 math parameters | High |
| Tech Stack | Go, Algorithms, Data Structures, HTTP, Concurrency | Listed generic computer science topics without concrete segment architecture mappings | Medium |
| Rubric | Missing quantitative targets | Lacked concrete query latency bounds, indexing throughput thresholds, and BM25 parity tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b66_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go and local filesystem at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Query latency (< 25ms), indexing throughput (>= 4,000 docs/sec), and BM25 parity (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory mock filesystem if local disk write permissions are restricted.",
  "Can test data be created in minutes?": "YES. Synthetic text document generator and automated search benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: managed Elasticsearch wrappers, distributed consensus sharding, and deep neural vector search.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 indexes 3 documents with known term frequencies and verifies exact BM25 mathematical ranking.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b66_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Levenshtein fuzzy search and distributed sharding to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic search engine metrics (p95 query latency, indexing throughput, and BM25 scoring parity).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake BM25 mathematical relevance ranking test.
"""

# ==============================================================================
# 67. brief-semantic-kernel-agent
# ==============================================================================
b67_data = {
  "id": "brief-semantic-kernel-agent",
  "title": "Hierarchical Multi-Agent Orchestration Framework in Python with Semantic Kernel, Qdrant & FastAPI",
  "domain": "GenAI & LLM Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["AI/ML Applications", "Full-stack web"],
  "problem": "Single-prompt LLM applications and monolithic prompt chains fail when tasked with multi-step enterprise workflows requiring information retrieval, data validation, iterative code execution, and peer critique. Naive agent implementations suffer from compounding hallucination loops, runaway token expenditures, fragile tool invocation parsing, and lack of deterministic state recovery when intermediate steps fail. This project builds a production-grade hierarchical multi-agent orchestration framework in Python inspired by Microsoft Semantic Kernel. The framework implements a director agent decomposing high-level user goals into structured DAG plans, specialized worker agents (Researcher, Coder, Critic) executing sandboxed steps with Pydantic contract validation, semantic long-term memory powered by Qdrant vector database, and reflective critique-retry loops guaranteeing deterministic goal completion.",
  "use_cases": [
    {
      "title": "Automated Financial Due Diligence & Market Analysis",
      "first_sentence": "Investment analysis teams need automated synthesis of corporate SEC filings, earnings call transcripts, and market news into comprehensive investment memos.",
      "second_sentence": "The director agent delegates filing parsing to the researcher, numerical ratio calculations to the coder, and risk assessment to the critic, assembling a verified audit memo."
    },
    {
      "title": "Autonomous Software Bug Diagnosis & Patch Synthesis",
      "first_sentence": "DevOps engineering teams investigating production exceptions require automated diagnosis, reproduction script synthesis, and candidate code patches.",
      "second_sentence": "Worker agents retrieve stack traces, generate localized reproduction tests, verify patches in sandboxes, and submit peer-reviewed pull request summaries."
    },
    {
      "title": "Enterprise Compliance Regulatory Audit QA",
      "first_sentence": "Compliance officers reviewing vendor contracts against strict corporate security standards need automated clause verification and deviation analysis.",
      "second_sentence": "The multi-agent system cross-references contract text against Qdrant policy memory, highlighting non-compliant liability clauses and suggesting remediation wording."
    }
  ],
  "hard_parts": [
    "Designing hierarchical goal decomposition algorithms that construct executable, acyclic dependency graphs (DAGs) from underspecified natural language user prompts",
    "Implementing strict Pydantic JSON schema function-calling filters that eliminate invalid tool invocations and parse errors",
    "Structuring semantic long-term memory in Qdrant with hybrid dense-sparse vector indexing to preserve agent cross-session context without token explosion",
    "Managing cyclic reflection loops where the Critic agent evaluates intermediate worker outputs against objective rubric criteria and triggers bounded auto-remediation"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating the DAG planner, worker agent implementations, Qdrant memory adapters, and FastAPI orchestration endpoints",
    "Autonomous multi-step execution report proving >= 92% goal completion rate across 50 complex multi-agent workflows with zero infinite loop traps",
    "Anti-fake verification script submitting an adversarial flawed research task and asserting the Critic agent rejects the first draft and forces the Coder agent to remediate within 2 retry cycles"
  ],
  "job_families": [
    "AI Systems Engineer",
    "LLM Platform Developer",
    "Autonomous Agent Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language powering the agent orchestration runtime, planner, and evaluation harness"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving workflow execution APIs, agent streaming status, and metrics"},
    {"tool": "Pydantic", "role": "data validation library enforcing strict structured tool call contracts and agent state schemas"},
    {"tool": "Qdrant", "role": "vector search engine providing long-term semantic memory storage and fast context retrieval"},
    {"tool": "Docker", "role": "container runtime hosting local Qdrant vector database and isolated tool execution sandboxes"},
    {"tool": "Sentence-Transformers", "role": "embedding model generating 384-dimensional dense semantic vectors for memory storage"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Hierarchical DAG Planner & Goal Decomposition Engine",
        "tools_used": ["Python", "Pydantic"],
        "purpose": "Decomposes user prompts into dependency graphs, assigns tasks to specialized agents, and validates state"
      },
      {
        "name": "Specialized Worker Agent Pool (Researcher, Coder, Critic)",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Executes domain-specific workflow steps with sandboxed tool access and generates structured intermediate outputs"
      },
      {
        "name": "Qdrant Semantic Long-Term Memory & Context Adapter",
        "tools_used": ["Python", "Qdrant", "Sentence-Transformers"],
        "purpose": "Stores agent episodic memories and technical guidelines as 384-d vectors, executing hybrid semantic recall"
      },
      {
        "name": "Reflective Critique & Auto-Remediation Loop Controller",
        "tools_used": ["Python", "Pydantic"],
        "purpose": "Evaluates worker outputs against objective quality rubrics and routes back to workers upon critique failure"
      },
      {
        "name": "Multi-Agent Workflow Execution API & Streaming Gateway",
        "tools_used": ["Python", "FastAPI", "Docker"],
        "purpose": "Exposes workflow submission endpoints, streams agent reasoning steps via Server-Sent Events, and records telemetry"
      },
      {
        "name": "Agent Autonomous Task Completion & Token Benchmark Harness",
        "tools_used": ["Python", "Docker"],
        "purpose": "Benchmarks multi-agent goal completion rate, execution latency, and token efficiency across 50 complex tasks"
      },
      {
        "name": "Semantic Kernel Agent Architecture Guide & Memory Manual",
        "tools_used": ["Python", "Qdrant"],
        "purpose": "Documents DAG orchestration algorithms, reflection guardrails, and Qdrant memory collection schemas"
      }
    ],
    "data_flow": "A user submits a complex task to FastAPI; the Hierarchical Planner calls an LLM with Pydantic schema enforcement to generate a step-by-step DAG; task 1 assigns to the Researcher agent, which queries Qdrant for historical context and extracts relevant facts; task 2 routes to the Coder agent to synthesize a solution; output forwards to the Critic agent; the Critic evaluates the output against defined constraints; if flawed, the Critic emits concrete remediation feedback and re-queues task 2 (up to a max of 3 retries); if approved, the planner marks the step complete and routes to subsequent DAG nodes; final verified results stream to the client via FastAPI SSE.",
    "enforcement_mechanism": "Bounded reflection retry counters (max 3 loops) preventing infinite agent cycles; Pydantic model validation on all tool parameters."
  },
  "targets": [
    {
      "metric": "Complex Multi-Step Task Completion Rate",
      "method": "Percentage of complex multi-agent workflows completed successfully with all rubric constraints verified and 0 unhandled failures",
      "input": "50 multi-step enterprise tasks requiring web search, data transformation, code execution, and verification",
      "environment": "Standard 4-core local CPU, Qdrant in Docker, Python 3.11 with local open-source models / mock LLM client",
      "minimum_pass": "Multi-step task completion rate is >= 88.0%",
      "target": "Multi-step task completion rate is >= 94.0%",
      "report": "Multi-agent evaluation benchmark report and task execution trajectory log"
    },
    {
      "metric": "p95 Agent Step Execution Latency",
      "method": "Wall-clock timing per intermediate agent reasoning and tool invocation step (excluding external LLM generation token time)",
      "input": "500 intermediate agent execution steps across 50 workflows",
      "environment": "Local FastAPI agent runtime with Qdrant vector memory lookup",
      "minimum_pass": "p95 agent orchestration and tool execution overhead is < 250 milliseconds per step",
      "target": "p95 agent orchestration and tool execution overhead is < 95 milliseconds per step",
      "report": "Agent step latency breakdown log and tool execution timing distribution"
    },
    {
      "metric": "Critic Reflection & Flaw Remediation Parity Rate",
      "method": "Percentage of intentionally flawed worker drafts successfully caught by the Critic agent and remediated on retry",
      "input": "20 flawed draft solutions (containing calculation errors, schema violations, or missing citations) injected into workflows",
      "environment": "Automated multi-agent test harness running reflection critique controllers",
      "minimum_pass": "20 of 20 flawed drafts detected by Critic and successfully corrected within 2 retry cycles",
      "target": "20 of 20 flawed drafts detected by Critic and successfully corrected within 2 retry cycles",
      "report": "Critic reflection audit log and remediation verification report"
    }
  ],
  "skills": ["Python", "FastAPI", "Pydantic", "Qdrant", "Docker", "Sentence-Transformers", "AI Agents", "GenAI Engineering"],
  "starter_input": {
    "spec": "Directory containing hierarchical agent planner, specialized worker implementations, Qdrant memory adapter, and test tasks.",
    "size": "12 Python source modules, Qdrant collection setup script, Docker Compose manifest, and 50 benchmark enterprise task definitions",
    "seeded_cases": "Cyclic DAG dependencies, tool argument schema mismatches, context token limit overflows, and adversarial unanswerable goals",
    "label_source": "Deterministic task rubric verification functions and synthetic enterprise task evaluation manifests",
    "personal_data_policy": "Strictly mock synthetic financial statements and simulated corporate memos; no real personal data used"
  },
  "components": [
    {"name": "Hierarchical DAG Planner & Goal Decomposition Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Specialized Worker Agent Pool (Researcher, Coder, Critic)", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Qdrant Semantic Long-Term Memory & Context Adapter", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Reflective Critique & Auto-Remediation Loop Controller", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Multi-Agent Workflow Execution API & Streaming Gateway", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Agent Autonomous Task Completion & Token Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Semantic Kernel Agent Architecture Guide & Memory Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Human-in-the-loop approval breakpoint pausing execution when agent plans high-impact file deletions or external API mutations",
      "Dynamic agent skill discovery enabling agents to dynamically register new Python functions into the tool catalog",
      "Multi-modal vision agent analyzing system architecture diagrams and generating code scaffolds directly"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Hierarchical DAG Planner & Pydantic Tool Schemas in Python, Pydantic and AI Agents",
      "hours": 10,
      "done_criterion": "Planner decomposes goals into executable DAGs; Pydantic validates tool inputs with 0 parse errors."
    },
    {
      "name": "Qdrant Semantic Memory & Context Retrieval in Qdrant, Docker and Sentence-Transformers",
      "hours": 10,
      "done_criterion": "Qdrant stores episodic agent memory; hybrid search retrieves relevant context in < 25ms."
    },
    {
      "name": "Worker Pool & Reflective Critique Loops in FastAPI and GenAI Engineering",
      "hours": 10,
      "done_criterion": "Researcher, Coder, and Critic collaborate; Critic catches and remediates flawed drafts within 2 retries."
    },
    {
      "name": "Completion Benchmark, Reflection Anti-Fake Test & Docs in GenAI & LLM Engineering",
      "hours": 10,
      "done_criterion": "Benchmark confirms >= 88% task completion; anti-fake test validates forced remediation; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python backend development, asynchronous programming (FastAPI), and Pydantic validation",
    "Understanding of LLM agent architectures (ReAct, plan-and-solve, reflection), tool-use schemas, and vector memory systems (Qdrant)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (uses lightweight local Sentence-Transformers embeddings and mock/local LLM endpoints)",
    "cost": "$0 (fully open-source stack using local Qdrant in Docker and local test models)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or commercial OpenAI/Anthropic API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Qdrant container) and Python 3.11 with PyTorch CPU",
    "fallback_path": "In-memory mock vector dictionary if Docker Qdrant container is unavailable"
  },
  "riskiest_component": {
    "name": "Infinite Reflection Loops and Token Budget Exhaustion",
    "mitigation": "Enforce strict hard-coded iteration caps (max 3 retries per step) and token budget monitors terminating runaway loops.",
    "fallback": "Escalate to user approval or terminate workflow with partial execution state preserved."
  },
  "deliverables": [
    "Git repository containing agent planner, worker pool, Qdrant memory adapter, and FastAPI orchestration server",
    "Docker Compose file launching local Qdrant instance with pre-configured memory collections",
    "Automated benchmark harness evaluating multi-step goal completion rates, latency, and critique accuracy",
    "Screener verification script executing automated 3-agent collaboration and forced flaw remediation in under 3 minutes"
  ],
  "out_of_scope": [
    "Commercial multi-agent SaaS platforms (CrewAI Enterprise / LangChain LangGraph Cloud)",
    "Paid proprietary foundation LLM fine-tuning API integrations",
    "Physical robotics or hardware actuator control systems"
  ],
  "safety_note": None,
  "resources": [
    "Semantic Kernel Framework Architecture Documentation (Microsoft Learn)",
    "Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., NeurIPS 2023)",
    "Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al., NeurIPS 2023)"
  ],
  "rubric": [
    {
      "input": "50 multi-step enterprise workflows requiring research, coding, and critique",
      "action": "python ./benchmarks/bench_completion.py --tasks 50",
      "expected_result": "Multi-agent framework successfully completes >= 88.0% of workflows with all criteria satisfied",
      "evidence_location": "Terminal output log and reports/task_completion.json",
      "pass_criterion": "Task completion rate >= 88.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 intermediate agent reasoning and tool invocation steps",
      "action": "python ./benchmarks/bench_step_latency.py --steps 500",
      "expected_result": "Orchestration and tool execution overhead exhibits p95 latency < 250ms per step",
      "evidence_location": "Step latency benchmark report in reports/step_latency.json",
      "pass_criterion": "p95 latency < 250ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 flawed draft solutions injected into worker execution pipeline",
      "action": "python ./tests/test_critic_reflection.py --flawed-drafts 20",
      "expected_result": "Critic agent detects flaws in all 20 drafts and forces worker auto-remediation within 2 cycles",
      "evidence_location": "Critic reflection audit log in reports/critic_audit.json",
      "pass_criterion": "20 of 20 flawed drafts caught and remediated with exit code 0",
      "kind": "normal"
    },
    {
      "input": "User request querying cross-session agent memory stored in Qdrant",
      "action": "curl -X POST http://localhost:8000/api/v1/memory/recall -H 'Content-Type: application/json' -d '{\"query\":\"What was the database schema discussed earlier?\"}'",
      "expected_result": "API retrieves relevant episodic memory chunks from Qdrant with similarity score >= 0.80",
      "evidence_location": "HTTP response JSON and memory audit log",
      "pass_criterion": "Response status 200 with non-empty relevant memories and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Adversarial flawed calculation task designed to trick Coder into syntax error",
      "action": "python ./scripts/verify_forced_remediation.py --task 'divide_by_zero_recovery'",
      "expected_result": "Coder generates flawed code; Critic rejects; Coder remediates with try/except; Critic approves",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms rejection of draft 1 and approval of draft 2 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected hierarchical multi-agent orchestration framework in Python with Semantic Kernel and Qdrant; achieved [COMPLETION_RATE] task completion rate across multi-step enterprise workflows, and eliminated execution loops with reflective critique cycles.",
    "claims": [
      {
        "text": "achieved [COMPLETION_RATE] task completion rate across multi-step enterprise workflows",
        "rubric_indexes": [0]
      },
      {
        "text": "eliminated execution loops with reflective critique cycles",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "commercial agent cloud SaaS deployment or proprietary foundation model pretraining"
  },
  "verify": [
    "Run `pytest tests/` to confirm DAG planner, Pydantic schemas, Qdrant memory, and Critic reflection pass.",
    "Execute `python ./benchmarks/bench_completion.py` to verify completion rate meets >= 88% threshold.",
    "Run `python ./scripts/verify_forced_remediation.py` to assert Critic catches and remediates flawed drafts."
  ],
  "worksheet": {
    "q1": "Core deliverable: a hierarchical multi-agent orchestration framework in Python with Semantic Kernel, Qdrant vector memory, and FastAPI.",
    "q2": "Target users: AI systems engineers, LLM platform developers, and autonomous agent architects.",
    "q3": "3 use cases: automated financial due diligence, autonomous bug diagnosis/patching, and regulatory compliance audits.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: hierarchical DAG goal decomposition, Pydantic function-calling validation, Qdrant episodic memory, and bounded reflection loops.",
    "q6": "Starter input: DAG planner, specialized worker agents, Qdrant memory adapter, and 50 benchmark tasks. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker Qdrant and local models.",
    "q8": "Riskiest component: infinite reflection loops and token exhaustion. Fallback: hard-coded max 3 retries and automatic circuit breakers.",
    "q9": "Potential faking: mock agent outputting canned text without actual multi-step reasoning. Anti-fake check 5 injects flawed code, verifies Critic rejection, and confirms remediation.",
    "q10": "Safe; synthetic corporate documents and private local container sandboxes only."
  }
}

b67_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, DAG planning specs, and reflection loop bounds | High |
| Tech Stack | Python, AutoGen / CrewAI, LangChain, Qdrant, FastAPI, Pydantic | Listed competing frameworks (AutoGen/CrewAI/LangChain) without architectural focus on Semantic Kernel | High |
| Rubric | Missing quantitative targets | Lacked concrete task completion thresholds, step latency bounds, and reflection tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b67_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Docker Desktop for Qdrant and local models at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Task completion (>= 88%), step overhead (< 250ms), and critique remediation (20 of 20) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory vector dictionary and local mock LLM client without external API keys.",
  "Can test data be created in minutes?": "YES. Synthetic enterprise task definitions and automated evaluation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial multi-agent SaaS (CrewAI cloud), paid model fine-tuning, and physical robotics.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 injects a flawed calculation task, asserts Critic rejects draft 1, and confirms draft 2 is remediated.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b67_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved human-in-the-loop approvals and dynamic skill discovery to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic multi-agent metrics (task completion rate, step latency, and reflection accuracy).
- Removed Banned Content: Removed ungrounded marketing claims and unpinned framework dependencies.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake Critic rejection and forced remediation test.
"""

# ==============================================================================
# 68. brief-serverless-backend
# ==============================================================================
b68_data = {
  "id": "brief-serverless-backend",
  "title": "Serverless Event-Driven Order Processing Backend with AWS Lambda, DynamoDB, SQS & LocalStack",
  "domain": "Platform & DevOps",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Cloud architecture", "Platform/infra tool"],
  "problem": "Traditional monolithic servers running continuously for variable or seasonal business workloads waste thousands of dollars in idle cloud compute costs, require complex auto-scaling group management, and suffer from single-point-of-failure bottlenecks during sudden traffic spikes. Naive serverless deployments experience crippling cold-start latency spikes, duplicate transaction executions from unhandled SQS retries, and silent message loss when downstream APIs fail. This project builds a production-grade serverless event-driven order processing backend in Python. The system deploys AWS Lambda functions emulated entirely on LocalStack, ingests order submissions via API Gateway, buffers asynchronous transactional workflows through Amazon SQS with Dead Letter Queues (DLQ), enforces idempotent ACID order state updates in Amazon DynamoDB, and achieves sub-100ms execution latency with zero external cloud expenses.",
  "use_cases": [
    {
      "title": "E-Commerce Flash-Sale Order Intake & Inventory Decrement",
      "first_sentence": "Retail web applications processing sudden flash-sale traffic spikes need to accept thousands of order submissions without web server crashes.",
      "second_sentence": "API Gateway immediately buffers orders into an SQS queue, returning a tracking ID to the buyer, while Lambda workers process inventory decrements asynchronously."
    },
    {
      "title": "Subscription Billing Webhook Processing Pipeline",
      "first_sentence": "SaaS platforms receiving third-party payment gateway webhooks (e.g. Stripe, PayPal) need resilient ingestion that survives intermittent backend outages.",
      "second_sentence": "Lambda functions validate webhook signatures and queue events to SQS; DLQs isolate failing webhooks for automated retry without dropping payment events."
    },
    {
      "title": "IoT Telemetry Batch Processing & State Storage",
      "first_sentence": "Smart building sensor networks emitting periodic temperature and energy telemetry require scalable serverless ingestion that scales to zero overnight.",
      "second_sentence": "Incoming telemetry bursts buffer through SQS and trigger batch Lambda executions, writing summarized device readings to DynamoDB with automated TTL expiry."
    }
  ],
  "hard_parts": [
    "Configuring LocalStack container environments to emulate AWS Lambda, API Gateway, SQS, and DynamoDB with 100% API fidelity",
    "Designing idempotent Lambda handlers using DynamoDB conditional writes (`attribute_not_exists`) to prevent duplicate charge transactions from SQS at-least-once delivery",
    "Implementing exponential backoff retry policies and Dead Letter Queue (DLQ) redrive mechanisms to handle poison pill payloads cleanly",
    "Optimizing Python Lambda function packaging and cold-start execution latency to achieve sub-100ms warm invocation durations"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating Lambda entrypoint handlers, SQS queue publishers, DynamoDB data access layers, and LocalStack deployment scripts",
    "High-throughput benchmark report proving sustained processing of 1,000 asynchronous orders per minute with sub-100ms Lambda execution latency",
    "Anti-fake verification script publishing duplicate order messages with the same idempotency key and asserting DynamoDB rejects the duplicate with zero duplicate charges"
  ],
  "job_families": [
    "Cloud Infrastructure Engineer",
    "Serverless Backend Developer",
    "DevOps / Platform Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language implementing Lambda serverless handlers and data access layers"},
    {"tool": "LocalStack", "role": "local cloud emulator providing fully functional offline AWS Lambda, DynamoDB, SQS, and API Gateway"},
    {"tool": "AWS Lambda", "role": "event-driven serverless compute runtime executing order ingestion, validation, and fulfillment logic"},
    {"tool": "DynamoDB", "role": "NoSQL key-value database persisting order states with conditional writes and TTL attributes"},
    {"tool": "SQS", "role": "distributed message queuing service buffering incoming order events and managing DLQ retry policies"},
    {"tool": "API Gateway", "role": "HTTP entrypoint routing client REST requests to Lambda functions and SQS direct integrations"}
  ],
  "architecture": {
    "components": [
      {
        "name": "API Gateway Order Submission Endpoint & Request Validator",
        "tools_used": ["Python", "API Gateway", "LocalStack"],
        "purpose": "Terminates client HTTP POST orders, validates payload schemas, and proxies messages directly to Amazon SQS"
      },
      {
        "name": "Amazon SQS Order Buffer & Dead Letter Queue (DLQ) Manager",
        "tools_used": ["Python", "SQS", "LocalStack"],
        "purpose": "Buffers order messages, manages visibility timeouts, and routes persistently failing messages to a dead letter queue"
      },
      {
        "name": "AWS Lambda Idempotent Order Processing & Fulfillment Worker",
        "tools_used": ["Python", "AWS Lambda", "LocalStack"],
        "purpose": "Consumes batches of SQS messages, verifies idempotency keys, and triggers order fulfillment status changes"
      },
      {
        "name": "Amazon DynamoDB Order State Table & Conditional Writer",
        "tools_used": ["Python", "DynamoDB", "LocalStack"],
        "purpose": "Stores order records with composite primary keys (CustomerID, OrderID) and enforces atomic conditional updates"
      },
      {
        "name": "Serverless Order Throughput & Concurrency Benchmark Harness",
        "tools_used": ["Python", "LocalStack"],
        "purpose": "Simulates 1,000 concurrent order submissions and measures end-to-end processing latencies and DLQ routing"
      },
      {
        "name": "Serverless Architecture Guide & LocalStack Infrastructure Manual",
        "tools_used": ["Python", "LocalStack"],
        "purpose": "Documents serverless deployment automation, IAM least-privilege policies, and DynamoDB single-table design"
      }
    ],
    "data_flow": "A client sends an order JSON via HTTP POST to API Gateway; API Gateway validates the schema and enqueues the message directly into Amazon SQS, returning an order receipt ID to the client in < 25ms; SQS triggers the Order Processing Lambda function in batches of 10 messages; the Lambda function extracts the idempotency key and executes a conditional PutItem on DynamoDB (`attribute_not_exists(order_id)`); if the order already exists, it ignores duplicate processing; if new, it writes the order with status 'CONFIRMED' and updates inventory; if an unhandled error occurs, SQS retries the message 3 times before moving the payload to the DLQ; clients query order status via a secondary API Gateway endpoint.",
    "enforcement_mechanism": "DynamoDB conditional expressions (`attribute_not_exists(order_id)`) preventing duplicate transactions; SQS maxReceiveCount=3 bounding retries."
  },
  "targets": [
    {
      "metric": "End-to-End Serverless Order Processing Latency",
      "method": "Wall-clock timing from API Gateway POST arrival to DynamoDB order confirmation write across 1,000 orders",
      "input": "1,000 orders submitted at 50 requests per second to API Gateway endpoint",
      "environment": "Standard 4-core local CPU, LocalStack 3+ in Docker, Python 3.11 runtime",
      "minimum_pass": "p95 end-to-end order processing latency is < 250 milliseconds",
      "target": "p95 end-to-end order processing latency is < 85 milliseconds",
      "report": "Serverless order processing latency report and CloudWatch log timing trace"
    },
    {
      "metric": "Idempotent Duplicate Message Rejection Rate",
      "method": "Percentage of duplicate SQS messages with identical order IDs rejected without duplicate DynamoDB writes or multiple charges",
      "input": "100 duplicate order messages injected into SQS queue simulating network retries",
      "environment": "LocalStack DynamoDB instance with conditional write checks enabled",
      "minimum_pass": "100 of 100 duplicate order messages detected with 0 duplicate records created in DynamoDB",
      "target": "100 of 100 duplicate order messages detected with 0 duplicate records created in DynamoDB",
      "report": "Idempotency verification audit log and DynamoDB record count parity report"
    },
    {
      "metric": "Dead Letter Queue (DLQ) Poison Pill Isolation",
      "method": "Verification of automatic dead-letter queue routing for malformed payloads after 3 failed Lambda execution attempts",
      "input": "20 intentionally malformed order payloads with invalid payment tokens injected into primary SQS queue",
      "environment": "SQS queue with maxReceiveCount=3 linked to dead-letter queue in LocalStack",
      "minimum_pass": "20 of 20 poison pill messages routed to DLQ with 0 impact on healthy message processing",
      "target": "20 of 20 poison pill messages routed to DLQ with 0 impact on healthy message processing",
      "report": "DLQ isolation test audit log and SQS queue depth monitoring report"
    }
  ],
  "skills": ["Python", "LocalStack", "AWS Lambda", "DynamoDB", "SQS", "API Gateway", "Platform & DevOps", "Serverless"],
  "starter_input": {
    "spec": "Directory containing Lambda handler functions, LocalStack setup scripts, DynamoDB table DDLs, and automated test runners.",
    "size": "7 Python source modules, CloudFormation / SAM template YAML, Docker Compose manifest, and 1,000 synthetic order payloads",
    "seeded_cases": "Duplicate order idempotency keys, malformed JSON bodies, SQS timeout race conditions, and DynamoDB transaction contention",
    "label_source": "Deterministic DynamoDB table item counts and SQS queue attribute message counters in LocalStack",
    "personal_data_policy": "Strictly mock synthetic customer account IDs and simulated retail order line items; no real personal data used"
  },
  "components": [
    {"name": "API Gateway Order Submission Endpoint & Request Validator", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Amazon SQS Order Buffer & Dead Letter Queue (DLQ) Manager", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "AWS Lambda Idempotent Order Processing & Fulfillment Worker", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Amazon DynamoDB Order State Table & Conditional Writer", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Serverless Order Throughput & Concurrency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Serverless Architecture Guide & LocalStack Infrastructure Manual", "task_type": "docs + architecture diagram", "hours": 1.0}
  ],
  "extended_path": {
    "features": [
      "AWS Step Functions state machine orchestrating multi-step saga compensation transactions (payment, inventory, shipping)",
      "DynamoDB Streams integration triggering downstream notification lambdas upon order status transitions",
      "Automated infrastructure-as-code deployment pipeline using AWS CDK / Terraform"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "LocalStack Setup & DynamoDB Order Schema in LocalStack and DynamoDB",
      "hours": 7,
      "done_criterion": "LocalStack initializes; DynamoDB creates order tables with composite keys and conditional writes."
    },
    {
      "name": "SQS Queue & Dead Letter Queue Routing in SQS and Platform & DevOps",
      "hours": 7,
      "done_criterion": "SQS queue buffers messages; poison pills route to DLQ after 3 failed attempts."
    },
    {
      "name": "Lambda Processing & Idempotency Enforcement in AWS Lambda and Python",
      "hours": 7,
      "done_criterion": "Lambda consumes SQS batches; conditional writes reject duplicate orders with 0 duplicates."
    },
    {
      "name": "End-to-End Benchmark, Duplicate Anti-Fake Test & Docs in API Gateway and Serverless",
      "hours": 7,
      "done_criterion": "Benchmark verifies p95 latency < 250ms; anti-fake test confirms duplicate rejection; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python backend development and asynchronous AWS SDK interactions (boto3 / aioboto3)",
    "Understanding of serverless architecture principles (Lambda, API Gateway), NoSQL databases (DynamoDB), and message queues (SQS)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and local container bound cloud emulator software)",
    "cost": "$0 (fully open-source stack using local LocalStack container and Python)",
    "accounts_keys_quotas": "No external AWS cloud accounts, credit cards, or paid service quotas required (runs 100% offline via LocalStack)",
    "reference_environment": "Local 4-core CPU with Docker Desktop (LocalStack 3+ container) and Python 3.11 with boto3",
    "fallback_path": "Mock Python in-memory queues and dictionaries mimicking SQS and DynamoDB APIs if LocalStack container is unavailable"
  },
  "riskiest_component": {
    "name": "Duplicate Transaction Execution Under SQS At-Least-Once Delivery Retries",
    "mitigation": "Enforce strict conditional writes on DynamoDB using unique idempotency keys (`attribute_not_exists(order_id)`).",
    "fallback": "Secondary DynamoDB idempotency ledger table tracking processed message IDs."
  },
  "deliverables": [
    "Git repository containing Lambda handlers, LocalStack initialization scripts, DynamoDB schemas, and test suites",
    "Docker Compose file launching LocalStack with pre-provisioned Lambda, DynamoDB, SQS, and API Gateway services",
    "Automated load testing harness measuring end-to-end order processing latency and DLQ routing accuracy",
    "Screener verification script executing automated order flow and dynamic duplicate rejection in under 2 minutes"
  ],
  "out_of_scope": [
    "Live AWS commercial production account deployments or route 53 public DNS domain routing",
    "Complex multi-account AWS Organization IAM role federations",
    "Real credit card merchant processing gateways (Stripe live keys)"
  ],
  "safety_note": None,
  "resources": [
    "AWS Serverless Multi-Tier Architectures (AWS Whitepaper)",
    "LocalStack Documentation: Emulating AWS Serverless Services Locally",
    "DynamoDB Developer Guide: Conditional Writes and Single-Table Design"
  ],
  "rubric": [
    {
      "input": "1,000 orders submitted at 50 requests per second to API Gateway endpoint",
      "action": "python ./benchmarks/bench_orders.py --orders 1000 --rate 50",
      "expected_result": "Pipeline processes orders into DynamoDB with p95 end-to-end latency < 250.0ms",
      "evidence_location": "Terminal output log and reports/order_latency.json",
      "pass_criterion": "p95 latency < 250.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 duplicate order messages with identical order IDs sent to SQS",
      "action": "python ./tests/test_idempotency.py --duplicates 100",
      "expected_result": "Lambda conditional writes reject duplicate messages; exactly 1 record created per order ID",
      "evidence_location": "Idempotency test log in reports/idempotency_audit.json",
      "pass_criterion": "100 of 100 duplicate messages rejected with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 malformed poison pill payloads injected into primary SQS queue",
      "action": "python ./tests/test_dlq_redrive.py --poison-pills 20",
      "expected_result": "SQS retries 3 times, fails cleanly, and routes all 20 messages to Dead Letter Queue",
      "evidence_location": "DLQ isolation test report in reports/dlq_audit.json",
      "pass_criterion": "20 of 20 messages verified in DLQ with exit code 0",
      "kind": "normal"
    },
    {
      "input": "CLI request querying order status by ID via API Gateway endpoint",
      "action": "curl -X GET http://localhost:4566/restapis/order-api/orders/order_test_101",
      "expected_result": "API returns order details from DynamoDB with status 'CONFIRMED' and timestamp",
      "evidence_location": "HTTP response JSON and CloudWatch logs",
      "pass_criterion": "Response status 200 with valid order body and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated concurrent network retry posting identical order ID 'order_dup_999' simultaneously",
      "action": "python ./scripts/verify_concurrent_idempotency.py --order-id order_dup_999 --attempts 5",
      "expected_result": "First request writes record; subsequent 4 requests receive ConditionalCheckFailedException and succeed idempotently",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms exactly 1 DynamoDB write and 4 idempotent skips with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected serverless event-driven backend in Python using AWS Lambda, DynamoDB, and SQS; achieved sub-[PROCESSING_LATENCY] millisecond end-to-end order processing latency, and prevented duplicate transactions across [DUPLICATE_EVENTS] duplicate SQS event retries.",
    "claims": [
      {
        "text": "achieved sub-[PROCESSING_LATENCY] millisecond end-to-end order processing latency",
        "rubric_indexes": [0]
      },
      {
        "text": "prevented duplicate transactions across [DUPLICATE_EVENTS] duplicate SQS event retries",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "live commercial AWS account deployment or multi-account IAM role federation"
  },
  "verify": [
    "Run `pytest tests/` to confirm Lambda handlers, SQS queue logic, and DynamoDB conditional writes pass.",
    "Execute `python ./benchmarks/bench_orders.py` to verify p95 latency remains < 250ms under load.",
    "Run `python ./scripts/verify_concurrent_idempotency.py` to assert duplicate order rejection."
  ],
  "worksheet": {
    "q1": "Core deliverable: a serverless event-driven order processing backend in Python with AWS Lambda, DynamoDB, SQS, and LocalStack.",
    "q2": "Target users: cloud infrastructure engineers, serverless backend developers, and platform architects.",
    "q3": "3 use cases: e-commerce flash-sale order intake, subscription billing webhook processing, and IoT telemetry batch processing.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: LocalStack offline emulation, DynamoDB conditional write idempotency, SQS DLQ redrive policies, and Lambda cold-start optimizations.",
    "q6": "Starter input: Lambda handlers, LocalStack setup scripts, DynamoDB schemas, and synthetic order payloads. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker LocalStack. Zero AWS charges.",
    "q8": "Riskiest component: duplicate order execution under SQS retries. Fallback: DynamoDB conditional writes with unique idempotency keys.",
    "q9": "Potential faking: synchronous Flask app pretending to be serverless. Anti-fake check 5 fires 5 concurrent identical order requests and verifies exactly 1 write.",
    "q10": "Safe; synthetic customer IDs and simulated retail order line items only, zero personal data."
  }
}

b68_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, SQS DLQ specifications, and LocalStack emulator rules | High |
| Tech Stack | Python, AWS Lambda, DynamoDB, SQS, API Gateway, SAM | Listed AWS tools without pinning local execution (LocalStack) or specifying idempotency mechanisms | Medium |
| Rubric | Missing quantitative targets | Lacked concrete processing latency bounds, duplicate message rejection tests, and DLQ routing | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b68_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Docker Desktop for LocalStack at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Processing latency (< 250ms), duplicate rejection (100 of 100), and DLQ routing (20 of 20) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory Python mock queues and dictionaries if LocalStack container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic order payloads and automated load test scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: live commercial AWS accounts, multi-account IAM federation, and real Stripe payment keys.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 submits 5 concurrent identical order requests and verifies exactly 1 write and 4 idempotent skips.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b68_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Step Functions sagas and DynamoDB Streams to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic serverless metrics (end-to-end processing latency, idempotency rejection rate, and DLQ poison pill isolation).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake concurrent duplicate order rejection test.
"""

# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_7_part1():
    std_scores = {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}
    std_caps = {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}
    res64 = process_brief(b64_data, b64_old_diag, std_scores, std_caps, b64_reviewer, b64_changelog)
    res65 = process_brief(b65_data, b65_old_diag, std_scores, std_caps, b65_reviewer, b65_changelog)
    res66 = process_brief(b66_data, b66_old_diag, std_scores, std_caps, b66_reviewer, b66_changelog)
    res67 = process_brief(b67_data, b67_old_diag, std_scores, std_caps, b67_reviewer, b67_changelog)
    res68 = process_brief(b68_data, b68_old_diag, std_scores, std_caps, b68_reviewer, b68_changelog)
    return [res64, res65, res66, res67, res68]

if __name__ == "__main__":
    results = run_batch_7_part1()
    print("Batch 7 Part 1 finished successfully:", results)
