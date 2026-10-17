"""
Batch 6 Part 1: Redesign briefs 54 to 58 from scratch.
54. brief-personalization-engine
55. brief-privacy-preserving-ml
56. brief-progressive-web-app
57. brief-raft-consensus
58. brief-rag-vector-search
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 54. brief-personalization-engine
# ==============================================================================
b54_data = {
  "id": "brief-personalization-engine",
  "title": "Real-Time User Personalization & Contextual Bandit Recommendation Engine with Kafka Streaming, Redis Feature Store & Scikit-learn",
  "domain": "ML Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML/data pipeline", "Full-stack web"],
  "problem": "Generic static UI interfaces deliver lower user engagement, subpar conversion rates, and elevated bounce rates compared to dynamic personalized digital experiences. However, traditional batch-recomputed recommendation pipelines suffer from multi-hour stale recommendations, inability to capture intra-session user intent shifts, and crippling cold-start latency for newly launched items. This project builds a production-grade real-time personalization and contextual bandit recommendation engine in Python. The system ingests user interaction event streams over Apache Kafka, aggregates real-time session feature vectors in Redis with sub-millisecond retrieval, trains LinUCB and Thompson Sampling contextual bandit models with Scikit-learn, and serves personalized ranking recommendations via FastAPI with sub-18ms p95 latency.",
  "use_cases": [
    {
      "title": "E-Commerce Dynamic Product Listing Ranking",
      "first_sentence": "Retail platforms need to re-rank search results and category listing carousels based on real-time item views and cart additions within the user's active session.",
      "second_sentence": "The engine consumes clickstream events via Kafka, updates the user's affinity vector in Redis, and computes personalized product re-rankings via FastAPI in under 15 milliseconds."
    },
    {
      "title": "Digital Media & News Feed Article Personalization",
      "first_sentence": "Online news publishers need to balance showing trending breaking news articles against exploring newly published editorial pieces to discover reader preferences.",
      "second_sentence": "The contextual bandit engine balances exploitation of known topic affinities with exploration of fresh content, maximizing long-term reader retention while avoiding stale filter bubbles."
    },
    {
      "title": "SaaS Onboarding Feature Discovery Recommendations",
      "first_sentence": "Software product teams need to recommend relevant workflow templates and product tours to newly onboarded users based on their initial setup clicks.",
      "second_sentence": "The system matches incoming user metadata with bandit feature vectors to recommend optimal onboarding actions, elevating free-to-paid activation rates."
    }
  ],
  "hard_parts": [
    "Balancing exploitation of high-affinity items with algorithmic exploration of unvisited items using LinUCB upper confidence bounds",
    "Maintaining low-latency sliding-window feature aggregation in Redis while consuming thousands of concurrent Kafka clickstream events",
    "Managing cold-start penalties for new items with zero interaction history through feature fallback embeddings",
    "Designing asynchronous offline batch model retraining in Celery that safely deploys updated bandit weight matrices to FastAPI without dropping live inference traffic"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating Kafka stream processors, Redis feature extractors, bandit math models, and FastAPI inference routers",
    "Real-time benchmark proving sub-18ms p95 recommendation inference latency under 500 concurrent recommendation requests per second",
    "Anti-fake verification script simulating an active user clicking 5 technology articles and asserting the recommendation distribution shifts toward technology within 300 milliseconds"
  ],
  "job_families": [
    "Machine Learning Engineer",
    "Recommendation Systems Developer",
    "Real-Time Data Platform Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing streaming processors, feature stores, and inference endpoints"},
    {"tool": "Kafka", "role": "distributed message streaming broker capturing high-velocity user clickstream and conversion events"},
    {"tool": "Redis", "role": "in-memory key-value store serving user session feature vectors and item affinity state"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving real-time personalized item recommendation requests"},
    {"tool": "Scikit-learn", "role": "machine learning library powering linear reward regressions and contextual bandit models"},
    {"tool": "Celery", "role": "asynchronous task queue executing scheduled batch model retraining and evaluation jobs"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Kafka Clickstream Ingestion & Event Processing Worker",
        "tools_used": ["Python", "Kafka"],
        "purpose": "Consumes user interaction events (views, clicks, purchases) from Kafka topics and normalizes event payloads"
      },
      {
        "name": "Redis Real-Time Session Feature Store & Aggregator",
        "tools_used": ["Python", "Redis"],
        "purpose": "Updates rolling category interaction counters and maintains low-latency user session feature vectors in Redis"
      },
      {
        "name": "Contextual Bandit & Thompson Sampling Model Engine",
        "tools_used": ["Python", "Scikit-learn"],
        "purpose": "Implements LinUCB and Thompson Sampling algorithms balancing exploration and exploitation across candidate items"
      },
      {
        "name": "FastAPI Low-Latency Recommendation Inference Service",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Accepts user recommendation requests, fetches session features from Redis, scores candidates, and returns ranked IDs"
      },
      {
        "name": "Celery Batch Retraining & Offline Evaluation Pipeline",
        "tools_used": ["Python", "Celery", "Scikit-learn"],
        "purpose": "Executes background batch retraining of bandit inverse covariance matrices and logs cumulative regret metrics"
      },
      {
        "name": "Recommendation Throughput & Latency Benchmark Harness",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Simulates 500 concurrent recommendation requests per second and profiles Redis lookup and scoring latencies"
      },
      {
        "name": "Personalization Architecture Guide & Feature Store Schema",
        "tools_used": ["Python", "Redis"],
        "purpose": "Documents feature vector TTL strategies, cold-start fallback heuristics, and contextual bandit math proofs"
      }
    ],
    "data_flow": "A user clicks an item on the client UI; an engagement event publishes to the Kafka 'user-clicks' topic; the Kafka worker consumes the event and updates category view counters in Redis with a 30-minute sliding TTL; when the client requests personalized recommendations, FastAPI receives the user ID, executes an MGET against Redis to retrieve active session features in < 2ms, feeds the features into the LinUCB bandit scoring model, computes confidence bound scores for candidate items, filters previously viewed items, and returns top-K ranked item IDs; Celery periodically pulls historical conversion logs to retrain offline models.",
    "enforcement_mechanism": "Linear algebra ridge regression matrix inversion updates with L2 regularization preventing numerical divergence; bounded Redis memory TTLs."
  },
  "targets": [
    {
      "metric": "p95 Recommendation Inference Latency",
      "method": "Wall-clock timing from FastAPI HTTP request arrival to JSON response dispatch under concurrent load",
      "input": "10,000 recommendation requests issued at 500 queries per second across 1,000 candidate items",
      "environment": "Standard 4-core local CPU, Redis 7+ in Docker, Python 3.11 with Uvicorn ASGI workers",
      "minimum_pass": "p95 recommendation latency is < 30.0 milliseconds",
      "target": "p95 recommendation latency is < 14.5 milliseconds",
      "report": "FastAPI recommendation latency profiling log and response percentile table"
    },
    {
      "metric": "Clickstream-to-Feature Update Propagation Latency",
      "method": "Duration from Kafka event publication to updated session feature availability in Redis MGET lookup",
      "input": "5,000 synthetic click events published in bursts of 500 events per second",
      "environment": "Local Kafka broker with single partition and automated Redis verification consumer",
      "minimum_pass": "p95 event-to-feature update latency is < 250 milliseconds",
      "target": "p95 event-to-feature update latency is < 85 milliseconds",
      "report": "Streaming feature propagation latency benchmark log"
    },
    {
      "metric": "Contextual Bandit Cumulative Regret Reduction",
      "method": "Cumulative regret reduction of LinUCB bandit compared to random exploration baseline across 10,000 simulated rounds",
      "input": "10,000 simulated user interaction rounds with 10 arms and 5-dimensional context vectors",
      "environment": "Deterministic synthetic bandit simulation test bench in Scikit-learn",
      "minimum_pass": "LinUCB cumulative regret is >= 40% lower than random exploration baseline",
      "target": "LinUCB cumulative regret is >= 65% lower than random exploration baseline",
      "report": "Bandit regret comparison audit log and cumulative reward curves"
    }
  ],
  "skills": ["Python", "Kafka", "Redis", "FastAPI", "Scikit-learn", "Celery", "Recommendation Systems", "ML Engineering"],
  "starter_input": {
    "spec": "Directory containing Kafka event schema definitions, Redis feature store client, LinUCB bandit implementation, and FastAPI service.",
    "size": "8 Python modules, Docker Compose file for Kafka and Redis, and simulated user clickstream generator",
    "seeded_cases": "Cold-start users with empty Redis session keys, expired session TTLs, and rapid duplicate clickstream bursts",
    "label_source": "Deterministic synthetic user preference reward functions and Scikit-learn offline test dataset",
    "personal_data_policy": "Strictly mock synthetic user IDs and simulated product categories; no real personal data used"
  },
  "components": [
    {"name": "Kafka Clickstream Ingestion & Event Processing Worker", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Redis Real-Time Session Feature Store & Aggregator", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Contextual Bandit & Thompson Sampling Model Engine", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "FastAPI Low-Latency Recommendation Inference Service", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Celery Batch Retraining & Offline Evaluation Pipeline", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "Personalization Architecture Guide & Feature Store Schema", "task_type": "docs + architecture diagram", "hours": 1.0}
  ],
  "extended_path": {
    "features": [
      "Two-tower deep neural network candidate retrieval model in PyTorch generating 64-dimensional user and item embeddings",
      "Real-time A/B experimentation routing layer partitioning traffic between Thompson Sampling and LinUCB variants",
      "Drift detection monitor calculating Kolmogorov-Smirnov statistics across feature distributions"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Kafka Ingestion & Redis Session Feature Store in Python, Kafka and Redis",
      "hours": 7,
      "done_criterion": "Kafka worker consumes clickstream events; Redis aggregates rolling user session vectors in < 2ms."
    },
    {
      "name": "Contextual Bandit Models & Offline Evaluation in Scikit-learn and Celery",
      "hours": 7,
      "done_criterion": "LinUCB model trains on context vectors; cumulative regret achieves >= 40% reduction over baseline."
    },
    {
      "name": "FastAPI Recommendation Service & Latency Benchmarks in FastAPI and ML Engineering",
      "hours": 7,
      "done_criterion": "Inference endpoint serves top-K recommendations with p95 latency < 30ms under 500 RPS."
    },
    {
      "name": "Dynamic Session Shift Anti-Fake Test, Docs & Architecture in Recommendation Systems",
      "hours": 7,
      "done_criterion": "Anti-fake test confirms real-time recommendation shift upon 5 clicks; docs and schemas complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python asynchronous programming, FastAPI, and Scikit-learn",
    "Understanding of message queues (Kafka), in-memory stores (Redis), and reinforcement learning / multi-armed bandit concepts"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-based tabular bandit models and in-memory caches)",
    "cost": "$0 (fully open-source stack using local Docker containers for Kafka and Redis)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Kafka and Redis containers) and Python 3.11+",
    "fallback_path": "In-memory Python queue and dictionary fallback store if Docker containers are unavailable"
  },
  "riskiest_component": {
    "name": "Redis Memory Exhaustion and Cold-Start Latency Spikes",
    "mitigation": "Enforce strict key expiration TTLs (30 minutes) on session vectors and pre-cache global popular item fallback lists.",
    "fallback": "Tiered fallback returning top trending items when user session key is missing or Redis is unreachable."
  },
  "deliverables": [
    "Git repository containing Kafka stream worker, Redis feature store client, LinUCB bandit engine, and FastAPI app",
    "Docker Compose configuration launching single-node Kafka, Zookeeper/KRaft, and Redis instances",
    "Automated benchmark harness measuring recommendation throughput, latency percentiles, and regret reduction",
    "Screener verification script validating real-time preference adaptation and cold-start handling in under 2 minutes"
  ],
  "out_of_scope": [
    "Large-scale distributed Hadoop/Spark cluster deployment",
    "Third-party commercial CDPs or customer tracking cookies",
    "Complex multi-billion parameter foundation LLM recommendation rankers"
  ],
  "safety_note": None,
  "resources": [
    "A Contextual-Bandit Approach to Personalized News Recommendation (Li et al., WWW 2010)",
    "Designing Machine Learning Systems: An Iterative Process for Production-Ready Applications (Chip Huyen)",
    "Redis Documentation on Hashes, Sorted Sets, and Real-Time Feature Stores"
  ],
  "rubric": [
    {
      "input": "10,000 recommendation requests dispatched at 500 queries per second",
      "action": "python ./benchmarks/bench_inference.py --concurrency 50 --requests 10000",
      "expected_result": "FastAPI returns top-5 recommendations with p95 latency < 30.0ms and 0 HTTP errors",
      "evidence_location": "Terminal output log and reports/inference_latency.json",
      "pass_criterion": "p95 latency is < 30.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "5,000 synthetic click events published to Kafka user-clicks topic",
      "action": "python ./scripts/test_feature_pipeline.py --events 5000",
      "expected_result": "Worker processes all events and updates Redis session vectors with p95 lag < 250ms",
      "evidence_location": "Feature store update audit log in reports/feature_sync.json",
      "pass_criterion": "p95 lag < 250ms and 0 unhandled exceptions with exit code 0",
      "kind": "normal"
    },
    {
      "input": "10,000 simulated rounds comparing LinUCB bandit against random baseline",
      "action": "python ./models/eval_regret.py --rounds 10000",
      "expected_result": "LinUCB achieves >= 40% cumulative regret reduction compared to random policy",
      "evidence_location": "Regret analysis summary in reports/bandit_regret.json",
      "pass_criterion": "Regret reduction >= 40% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Celery scheduled offline model retraining task execution",
      "action": "celery -A tasks.retrain worker --loglevel=info --concurrency=2 & python ./tasks/trigger_retrain.py",
      "expected_result": "Celery worker updates inverse covariance matrices and persists weights without service interruption",
      "evidence_location": "Celery execution log and model weight checksum file",
      "pass_criterion": "Retraining task status completes with SUCCESS and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated user clicking 5 technology articles in rapid succession",
      "action": "python ./scripts/verify_dynamic_personalization.py --clicks tech,tech,tech,tech,tech",
      "expected_result": "FastAPI recommendation distribution shifts to technology items with top-3 rank within 300ms",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms top-3 recommendations belong to technology category with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected user personalization engine in Python with Kafka and Redis; delivered sub-[INFERENCE_LATENCY] millisecond recommendation latency, and reduced cumulative regret by [REGRET_REDUCTION] compared to baseline exploration.",
    "claims": [
      {
        "text": "delivered sub-[INFERENCE_LATENCY] millisecond recommendation latency",
        "rubric_indexes": [0]
      },
      {
        "text": "reduced cumulative regret by [REGRET_REDUCTION] compared to baseline exploration",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "multi-billion parameter transformer models or production ad-tech click-fraud detection"
  },
  "verify": [
    "Run `pytest tests/` to confirm Kafka event schemas, Redis feature store, and bandit algorithms pass.",
    "Execute `python ./benchmarks/bench_inference.py` to verify p95 latency remains < 30ms under load.",
    "Run `python ./scripts/verify_dynamic_personalization.py` to confirm real-time dynamic recommendation shifts."
  ],
  "worksheet": {
    "q1": "Core deliverable: a real-time personalization engine with Kafka clickstream ingestion, Redis feature store, LinUCB bandit ranker, and FastAPI inference.",
    "q2": "Target users: machine learning engineers, recommendation systems developers, and real-time data platform engineers.",
    "q3": "3 use cases: e-commerce product re-ranking, digital news article personalization, and SaaS onboarding feature recommendations.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: exploration vs exploitation balance with LinUCB, sub-millisecond Redis session feature updates, cold-start handling, and non-blocking model retraining.",
    "q6": "Starter input: Kafka event schemas, Redis feature store client, LinUCB implementation, and simulated clickstream generator. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero paid cloud keys. Fallback: in-memory queues and dictionaries.",
    "q8": "Riskiest component: Redis memory exhaustion and cold-start latency spikes. Fallback: 30-min key TTLs and tiered trending item fallbacks.",
    "q9": "Potential faking: returning hardcoded static recommendations. Anti-fake check 5 simulates 5 tech clicks and verifies top-3 output shifts to tech.",
    "q10": "Safety/ethics: Safe; strictly synthetic user interaction logs and simulated product IDs, zero personal data."
  }
}

b54_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague generic description | Lacked concrete architectural framing, streaming ingestion specs, and latency bounds | High |
| Tech Stack | Python, Kafka, Redis, FastAPI, Scikit-learn, Celery | Listed tools without explicit operational roles or data flow boundaries | Medium |
| Rubric | Missing concrete benchmarks | No quantitative latency thresholds or dynamic state shift anti-fake verification | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b54_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, Kafka, and Redis in Docker at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Inference latency (< 30ms), event propagation (< 250ms), and regret reduction (>= 40%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory queue and dictionary store if Docker containers are unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic clickstream generator and automated evaluation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: large-scale Hadoop clusters, ad-tech click fraud, and transformer LLM rankers.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 simulates 5 tech clicks and verifies top-3 output shifts to tech category.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b54_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved two-tower neural retrieval to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic streaming recommendation metrics (inference latency, propagation lag, and cumulative regret).
- Removed Banned Content: Removed unsubstantiated marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake dynamic session preference adaptation test.
"""

# ==============================================================================
# 55. brief-privacy-preserving-ml
# ==============================================================================
b55_data = {
  "id": "brief-privacy-preserving-ml",
  "title": "Federated Learning System for Privacy-Preserving ML with PyTorch, Differential Privacy DP-SGD & gRPC Aggregation",
  "domain": "ML Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["ML/data pipeline", "Security tool"],
  "problem": "Strict data privacy regulations (GDPR, HIPAA, and DPDP) forbid pooling sensitive customer records, financial transactions, or medical telemetry into centralized cloud servers for machine learning training. Centralized model training risks catastrophic data exposure during transit and storage. Federated Learning allows edge nodes to train models locally and share only encrypted weight updates. However, naive federated averaging is vulnerable to gradient inversion attacks, model poisoning by Byzantine clients, and non-IID data distribution divergence. This project builds a production-grade federated learning platform in Python with PyTorch and gRPC. The system orchestrates distributed edge training across isolated nodes, enforces Differential Privacy with DP-SGD clipping and Gaussian noise addition, tracks cumulative privacy loss (epsilon-delta) via R\u00e9nyi differential privacy accountants, and aggregates robust model weights using secure Federated Averaging (FedAvg).",
  "use_cases": [
    {
      "title": "Cross-Hospital Diagnostic Predictive Modeling",
      "first_sentence": "Consortiums of regional hospitals need to collaboratively train medical diagnostic classifiers on patient electronic health records without transferring protected patient data.",
      "second_sentence": "Hospital nodes train local PyTorch models on on-premise clinical data, add calibrated differential privacy noise, and stream parameter updates over gRPC to a central aggregator."
    },
    {
      "title": "Multi-Bank Fraud Pattern Detection Collaboration",
      "first_sentence": "Competing financial institutions require shared fraud detection models to detect emerging syndicated money laundering rings without disclosing proprietary customer transactions.",
      "second_sentence": "Each bank trains localized neural network anomaly detectors, uploading clipped gradient updates that aggregate into a joint global fraud detection model while preserving bank privacy."
    },
    {
      "title": "Edge Mobile Keyboard Next-Word Prediction",
      "first_sentence": "Mobile device manufacturers need to train next-token language models on user typing habits without uploading sensitive text inputs or passwords to cloud backends.",
      "second_sentence": "Mobile client workers compute local gradient updates overnight during charging cycles, applying differential privacy to ensure zero individual keystrokes can be reconstructed."
    }
  ],
  "hard_parts": [
    "Implementing differential privacy DP-SGD in PyTorch with per-sample gradient clipping and calibrated Gaussian noise injection",
    "Tracking cumulative privacy loss (epsilon, delta) across multiple federated training rounds using R\u00e9nyi Differential Privacy (RDP) accounting",
    "Managing non-IID (non-identically distributed) client data partitions that cause local gradient drift and slow global model convergence",
    "Securing gRPC parameter exchange pipelines against gradient inversion and reconstruction attacks with Byzantine-resilient aggregation (e.g. Coordinate-wise Median)"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating the central FedAvg aggregator, gRPC communication stubs, PyTorch local worker trainers, and DP privacy accountants",
    "Empirical privacy-utility trade-off report demonstrating >= 85% model accuracy while maintaining provable differential privacy epsilon <= 3.0",
    "Anti-fake verification script running a gradient inversion attack against an aggregated model update and proving individual training sample pixels/tokens cannot be reconstructed"
  ],
  "job_families": [
    "Privacy-Preserving ML Engineer",
    "Federated Learning Researcher",
    "ML Infrastructure & Security Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary systems language implementing server aggregation, client training routines, and privacy math"},
    {"tool": "PyTorch", "role": "deep learning framework implementing neural network models, loss functions, and per-sample gradient clipping"},
    {"tool": "gRPC", "role": "high-performance binary RPC protocol streaming serialized model weights and gradients between clients and coordinator"},
    {"tool": "Differential Privacy", "role": "mathematical framework providing formal privacy guarantees via Gaussian noise and RDP accountants"},
    {"tool": "Docker", "role": "containerization engine isolating simulated hospital and banking client nodes in independent network sandboxes"},
    {"tool": "NumPy", "role": "numerical computation library executing tensor weight averaging, coordinate-wise median, and metrics analysis"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Federated Coordination Server & FedAvg Aggregator",
        "tools_used": ["Python", "NumPy"],
        "purpose": "Coordinates training rounds, selects participating client nodes, and averages model weights using Federated Averaging"
      },
      {
        "name": "Local Client PyTorch Training Engine & Worker Node",
        "tools_used": ["Python", "PyTorch"],
        "purpose": "Executes localized backpropagation training loops on private client data slices and computes parameter updates"
      },
      {
        "name": "Differential Privacy Gaussian Noise & Gradient Clipping Layer",
        "tools_used": ["Python", "Differential Privacy", "PyTorch"],
        "purpose": "Clips per-sample gradient L2 norms to threshold C and injects calibrated Gaussian noise scaled to noise multiplier sigma"
      },
      {
        "name": "gRPC Model Gradient Streaming Protocol & RPC Layer",
        "tools_used": ["Python", "gRPC"],
        "purpose": "Streams protobuf-encoded model weights and gradient deltas between worker nodes and the central aggregation server"
      },
      {
        "name": "Privacy Budget (Epsilon-Delta) Accountant & Tracker",
        "tools_used": ["Python", "Differential Privacy"],
        "purpose": "Calculates cumulative privacy budget consumption across rounds using R\u00e9nyi Differential Privacy composition theorems"
      },
      {
        "name": "Federated Convergence & Epsilon Privacy Benchmark Harness",
        "tools_used": ["Python", "PyTorch", "Docker"],
        "purpose": "Benchmarks federated global accuracy on non-IID test data across 20 rounds under varying differential privacy budgets"
      },
      {
        "name": "Federated ML Security Guide & System Architecture Diagram",
        "tools_used": ["Python", "Differential Privacy"],
        "purpose": "Documents DP-SGD hyperparameter guidelines, non-IID Dirichlet distribution handling, and threat models"
      }
    ],
    "data_flow": "The central coordinator initializes global model weights and announces round 1 over gRPC; 5 simulated client nodes in Docker containers download the global model; each client executes 3 local epochs on private non-IID data using PyTorch; the DP-SGD hook clips per-sample gradients to maximum norm C=1.0 and injects calibrated Gaussian noise; clients stream updated weights back over gRPC; the coordinator aggregates weights using Federated Averaging (or trimmed mean), updates the global model, and logs privacy budget expenditure from the RDP accountant; the updated global model distributes to clients for evaluation.",
    "enforcement_mechanism": "Strict gradient L2 clipping and calibrated Gaussian perturbation bounding sensitivity; RDP accountant halting training if epsilon exceeds target threshold."
  },
  "targets": [
    {
      "metric": "Global Model Accuracy Under Differential Privacy",
      "method": "Classification accuracy on held-out global validation test set (10,000 samples) after 20 federated training rounds",
      "input": "10,000 synthetic multi-class tabular/image test records distributed non-IID (Dirichlet alpha=0.5) across 5 client nodes",
      "environment": "Standard 4-core local CPU, PyTorch 2.0+ CPU tensor runtime, 5 Docker container worker sandboxes",
      "minimum_pass": "Global model validation accuracy is >= 78.0% while cumulative epsilon is <= 4.0",
      "target": "Global model validation accuracy is >= 86.5% while cumulative epsilon is <= 2.5",
      "report": "Federated training convergence report and accuracy progression curve"
    },
    {
      "metric": "Differential Privacy Budget Enforcement",
      "method": "Audited cumulative epsilon calculation from RDP accountant compared to pre-configured training budget",
      "input": "20 federated training rounds with per-sample clipping C=1.0, noise multiplier sigma=1.2, and delta=1e-5",
      "environment": "Analytical RDP accountant test script executing composition across 10,000 total client batch steps",
      "minimum_pass": "Audited cumulative epsilon is <= 3.0 at delta=1e-5 across 20 completed rounds",
      "target": "Audited cumulative epsilon is <= 2.2 at delta=1e-5 across 20 completed rounds",
      "report": "Privacy budget audit log and epsilon-delta consumption trajectory"
    },
    {
      "metric": "Gradient Inversion Reconstruction Defense Rate",
      "method": "Mean Squared Error (MSE) of sample reconstruction using DLG (Deep Leakage from Gradients) optimization attack against privatized gradients",
      "input": "50 simulated gradient inversion attack attempts on privatized client model updates",
      "environment": "DLG optimization attacker script running 300 gradient descent iterations in PyTorch",
      "minimum_pass": "Reconstruction MSE is >= 0.45 across 50 of 50 attack attempts, preventing raw input reconstruction",
      "target": "Reconstruction MSE is >= 0.75 across 50 of 50 attack attempts, completely obfuscating input features",
      "report": "Gradient inversion security evaluation log and image/feature reconstruction error summary"
    }
  ],
  "skills": ["Python", "PyTorch", "gRPC", "Differential Privacy", "Docker", "NumPy", "Federated Learning", "ML Engineering"],
  "starter_input": {
    "spec": "Directory containing federated coordinator server, PyTorch worker training script, gRPC proto definitions, and DP-SGD hooks.",
    "size": "7 Python source modules, 1 protobuf definition file, Docker Compose multi-node manifest, and non-IID data partitioner",
    "seeded_cases": "Non-IID Dirichlet label skew, unresponsive client timeouts during aggregation, and malicious Byzantine gradient poisoning",
    "label_source": "Deterministic synthetic classification benchmark dataset and mathematical privacy accounting proofs",
    "personal_data_policy": "Strictly mock synthetic diagnostic records and simulated transaction features; no real personal data used"
  },
  "components": [
    {"name": "Federated Coordination Server & FedAvg Aggregator", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Local Client PyTorch Training Engine & Worker Node", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Differential Privacy Gaussian Noise & Gradient Clipping Layer", "task_type": "concurrency/consistency mechanism with tests", "hours": 6.0},
    {"name": "gRPC Model Gradient Streaming Protocol & RPC Layer", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Privacy Budget (Epsilon-Delta) Accountant & Tracker", "task_type": "security hardening checks", "hours": 5.0},
    {"name": "Federated Convergence & Epsilon Privacy Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Federated ML Security Guide & System Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Secure Multi-Party Computation (SMPC) additive secret sharing protocol encrypting client updates prior to aggregation",
      "Adaptive clipping mechanism dynamically adjusting L2 norm thresholds without user intervention",
      "Asynchronous federated optimization (FedAsync) supporting straggler clients with staleness penalization weights"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "gRPC Client-Server Protocol & Local PyTorch Training in Python, PyTorch and gRPC",
      "hours": 10,
      "done_criterion": "gRPC server coordinates rounds; client workers train local PyTorch models and return updates."
    },
    {
      "name": "Differential Privacy DP-SGD & RDP Accountant in Differential Privacy and NumPy",
      "hours": 10,
      "done_criterion": "DP-SGD clips gradients and injects Gaussian noise; RDP accountant tracks cumulative epsilon."
    },
    {
      "name": "FedAvg Aggregation & Convergence Benchmarks in Federated Learning and Docker",
      "hours": 10,
      "done_criterion": "Global model achieves >= 78% accuracy on non-IID data across 5 Docker clients under epsilon <= 3.0."
    },
    {
      "name": "Gradient Inversion Defense Anti-Fake Test & Docs in ML Engineering",
      "hours": 10,
      "done_criterion": "Anti-fake DLG attack confirms sample reconstruction is blocked (MSE >= 0.45); docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in PyTorch deep learning development, tensor operations, and backpropagation mechanics",
    "Understanding of distributed systems networking (gRPC/Protobuf) and mathematical privacy concepts (Differential Privacy, DP-SGD)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (CPU-only PyTorch training on compact neural architectures like 3-layer MLPs or small CNNs)",
    "cost": "$0 (fully open-source stack using local Python and Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop (5 client containers) and Python 3.11 with PyTorch CPU",
    "fallback_path": "Running 5 client workers as local Python subprocesses communicating over localhost loopback ports"
  },
  "riskiest_component": {
    "name": "Gradient Inversion Leakage and Privacy Budget Exhaustion",
    "mitigation": "Enforce per-sample gradient clipping before noise addition and integrate automated training termination when epsilon hits target threshold.",
    "fallback": "Coordinate-wise trimmed mean aggregator discarding extreme outlier updates from suspected Byzantine nodes."
  },
  "deliverables": [
    "Git repository containing federated coordination server, PyTorch training worker, gRPC protos, and DP-SGD hooks",
    "Docker Compose test environment orchestrating 5 isolated client containers and 1 central coordinator",
    "Automated benchmark harness evaluating non-IID convergence, epsilon tracking, and communication latency",
    "Screener verification script executing automated 3-round federated training and DLG attack defense in under 3 minutes"
  ],
  "out_of_scope": [
    "Hardware trusted execution environments (Intel SGX / ARM TrustZone)",
    "Fully Homomorphic Encryption (FHE) with multi-hour ciphertext evaluation times",
    "Multi-billion parameter LLM pre-training across thousands of physical mobile devices"
  ],
  "safety_note": None,
  "resources": [
    "Communication-Efficient Learning of Deep Networks from Decentralized Data (McMahan et al., FedAvg Paper)",
    "Deep Learning with Differential Privacy (Abadi et al., CCS 2016 - DP-SGD)",
    "Deep Leakage from Gradients (Zhu et al., NeurIPS 2019 - Gradient Inversion Attacks)"
  ],
  "rubric": [
    {
      "input": "20 federated training rounds on non-IID split dataset with 5 client nodes",
      "action": "python ./federated/coordinator.py --rounds 20 --clients 5 --dp-noise 1.2",
      "expected_result": "Global model reaches validation accuracy >= 78.0% while cumulative epsilon remains <= 3.0",
      "evidence_location": "Terminal output log and reports/federated_convergence.json",
      "pass_criterion": "Accuracy >= 78.0% and epsilon <= 3.0 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Audited RDP privacy budget evaluation across 10,000 training batch steps",
      "action": "python ./privacy/eval_budget.py --steps 10000 --batch-size 32 --noise-multiplier 1.2",
      "expected_result": "Accountant calculates cumulative epsilon <= 3.0 at delta=1e-5",
      "evidence_location": "Privacy expenditure audit log in reports/privacy_audit.json",
      "pass_criterion": "Calculated epsilon <= 3.0 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated Byzantine malicious client sending poisoned gradient vectors",
      "action": "python ./tests/test_byzantine_resilience.py --poisoned-clients 1",
      "expected_result": "Trimmed mean / median aggregation filters poisoned updates without degrading global accuracy by > 3%",
      "evidence_location": "Byzantine resilience test report in reports/byzantine_test.json",
      "pass_criterion": "Global accuracy drop <= 3.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "gRPC parameter exchange serialization and network bandwidth audit",
      "action": "python ./benchmarks/bench_grpc_streaming.py --payload-size 5MB",
      "expected_result": "gRPC streams compressed model weights with p95 transfer latency < 120ms per client",
      "evidence_location": "Streaming benchmark log in reports/grpc_throughput.json",
      "pass_criterion": "p95 latency < 120ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "DLG gradient inversion attack running 300 iterations against privatized client update",
      "action": "python ./scripts/verify_dlg_defense.py --iterations 300",
      "expected_result": "Attacker fails to reconstruct private sample; reconstruction MSE is >= 0.45",
      "evidence_location": "DLG defense verification terminal log and reports/dlg_reconstruction.json",
      "pass_criterion": "Reconstruction MSE is >= 0.45 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected federated learning system in Python using PyTorch, gRPC, and Differential Privacy; achieved [MODEL_ACCURACY] global accuracy on non-IID data under provable epsilon [PRIVACY_EPSILON], and prevented gradient inversion attacks with reconstruction error above [INVERSION_MSE].",
    "claims": [
      {
        "text": "achieved [MODEL_ACCURACY] global accuracy on non-IID data under provable epsilon [PRIVACY_EPSILON]",
        "rubric_indexes": [0]
      },
      {
        "text": "prevented gradient inversion attacks with reconstruction error above [INVERSION_MSE]",
        "rubric_indexes": [4]
      }
    ],
    "do_not_claim": "hardware enclave trusted execution or multi-thousand node production mobile deployments"
  },
  "verify": [
    "Run `pytest tests/` to confirm gRPC protobuf serialization, FedAvg aggregation, and DP-SGD hooks pass.",
    "Execute `python ./federated/coordinator.py` to confirm model achieves >= 78% accuracy with epsilon <= 3.0.",
    "Run `python ./scripts/verify_dlg_defense.py` to verify gradient inversion reconstruction attacks are thwarted."
  ],
  "worksheet": {
    "q1": "Core deliverable: a federated learning platform in Python with PyTorch local training, gRPC streaming, DP-SGD clipping, and FedAvg aggregation.",
    "q2": "Target users: privacy-preserving ML engineers, federated learning researchers, and ML infrastructure architects.",
    "q3": "3 use cases: cross-hospital diagnostic modeling, multi-bank fraud pattern detection, and edge mobile keyboard prediction.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: DP-SGD per-sample gradient clipping, R\u00e9nyi privacy accounting across rounds, non-IID drift handling, and DLG defense.",
    "q6": "Starter input: federated coordinator, PyTorch worker, gRPC protobufs, DP-SGD hooks, and synthetic data generator. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local subprocesses.",
    "q8": "Riskiest component: gradient inversion leakage and privacy budget exhaustion. Fallback: per-sample L2 clipping and automatic budget cutoffs.",
    "q9": "Potential faking: mock averaging without actual differential privacy. Anti-fake check 5 executes real DLG attack and asserts sample reconstruction MSE >= 0.45.",
    "q10": "Safety/ethics: Safe; strictly synthetic health/fraud records and private Docker sandboxes, zero personal data."
  }
}

b55_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, DP-SGD specs, and formal privacy proofs | High |
| Tech Stack | Python, PyTorch, PySyft, gRPC, Differential Privacy | Listed PySyft without pinning API stability or specifying concrete DP mechanisms | High |
| Rubric | Missing quantitative targets | Lacked concrete epsilon-delta thresholds, non-IID convergence criteria, and DLG attack tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |
"""

b55_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using PyTorch CPU and Docker container sandboxes at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Global model accuracy (>= 78%), cumulative privacy loss (epsilon <= 3.0), and DLG defense (MSE >= 0.45) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Running 5 client workers as local Python subprocesses communicating over loopback ports.",
  "Can test data be created in minutes?": "YES. Synthetic non-IID partitioner and automated federated benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: hardware enclaves (Intel SGX), FHE encryption, and multi-billion parameter foundation LLMs.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 executes real DLG gradient inversion attack and verifies reconstruction MSE >= 0.45.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 4."
}

b55_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved SMPC additive secret sharing to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic federated metrics (non-IID classification accuracy, epsilon-delta accounting, and DLG defense).
- Removed Banned Content: Removed unverified PySyft dependencies and career marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake DLG gradient inversion defense test.
"""

# ==============================================================================
# 56. brief-progressive-web-app
# ==============================================================================
b56_data = {
  "id": "brief-progressive-web-app",
  "title": "Production Progressive Web App (PWA) with Workbox Service Worker, IndexedDB Offline Mutation Sync & Web Push Notifications",
  "domain": "Mobile Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Full-stack web", "Mobile app"],
  "problem": "Native mobile applications impose substantial distribution friction, lengthy app store review cycles, and large download sizes, while standard responsive web applications break entirely when network connectivity drops. Users in areas with intermittent mobile coverage lose unsaved form inputs, encounter browser dinosaur error pages, and miss critical real-time alerts. This project builds a production-grade Progressive Web App (PWA) in TypeScript and React. The system implements an app-shell architecture precached via Workbox Service Workers, stores application data and offline mutation queues in browser IndexedDB, synchronizes queued transactions in the background upon network reconnection using the Background Sync API, and delivers timely transactional alerts via the Web Push API with VAPID authentication.",
  "use_cases": [
    {
      "title": "Field Technician Maintenance Logging & Work Orders",
      "first_sentence": "Field service technicians inspecting remote wind turbines or basements frequently lose cellular signal while drafting maintenance reports.",
      "second_sentence": "The PWA renders the precached app shell instantly offline, queues maintenance log submissions to IndexedDB, and automatically flushes queued updates to backend APIs once connectivity restores."
    },
    {
      "title": "Warehouse Logistics Barcode Scanning & Inventory Auditing",
      "first_sentence": "Warehouse workers scanning physical inventory pallets in shielded distribution hubs need continuous UI responsiveness without network lag.",
      "second_sentence": "The application persists inventory counts locally, updating quantities optimistically in the UI and synchronizing delta updates via background service worker sync."
    },
    {
      "title": "Emergency Dispatch & Public Safety Broadcast Alerts",
      "first_sentence": "Municipal disaster relief teams require immediate real-time broadcast alerts on mobile web browsers even when the main app tab is closed.",
      "second_sentence": "The service worker intercepts Web Push notifications using VAPID keys, rendering rich system notification badges and routing users to localized evacuation maps."
    }
  ],
  "hard_parts": [
    "Designing cache invalidation and stale-while-revalidate routing strategies with Workbox to eliminate stale app-shell bundles without serving broken assets",
    "Managing an append-only IndexedDB mutation queue that guarantees idempotent, FIFO transaction playback without duplicating orders upon reconnection",
    "Handling browser Web Push subscription lifecycles, VAPID public/private key cryptographic verification, and push service endpoint changes",
    "Architecting offline-first UI state synchronization in React that indicates network status changes with zero layout shift"
  ],
  "screener_signals": [
    "Clean TypeScript and React codebase cleanly separating UI views, Workbox service worker routing, IndexedDB storage adapters, and Web Push managers",
    "Lighthouse PWA audit achieving 100/100 PWA score and sub-1.2s First Contentful Paint (FCP) on simulated 4G mobile networks",
    "Anti-fake verification script simulating complete browser offline mode (navigator.onLine=false), queuing an order in IndexedDB, and verifying automatic API commit upon reconnection"
  ],
  "job_families": [
    "Mobile Web Application Developer",
    "Frontend Systems Architect",
    "Full-Stack Web Engineer"
  ],
  "stack": [
    {"tool": "TypeScript", "role": "strongly typed language shared across React components, service worker logic, and IndexedDB sync"},
    {"tool": "React", "role": "frontend component framework rendering responsive offline-aware mobile user interfaces"},
    {"tool": "Workbox", "role": "service worker library managing precaching, runtime caching strategies, and background sync"},
    {"tool": "Service Workers", "role": "browser background execution threads intercepting network requests and handling push events"},
    {"tool": "IndexedDB", "role": "browser client-side structured storage engine persisting offline mutation queues and local entities"},
    {"tool": "Web Push API", "role": "browser notification standard delivering push messages authenticated via VAPID keys"}
  ],
  "architecture": {
    "components": [
      {
        "name": "App Shell Architecture & Workbox Precaching Service Worker",
        "tools_used": ["TypeScript", "Workbox", "Service Workers"],
        "purpose": "Precaches critical HTML, CSS, and JS bundles during installation and serves assets cache-first with background updates"
      },
      {
        "name": "IndexedDB Offline Mutation Queue & Background Sync Engine",
        "tools_used": ["TypeScript", "IndexedDB", "Service Workers"],
        "purpose": "Captures user mutations offline, persists ordered transaction logs in IndexedDB, and flushes queue upon network restoration"
      },
      {
        "name": "Web Push Notification & VAPID Subscription Manager",
        "tools_used": ["TypeScript", "Web Push API"],
        "purpose": "Manages browser push permission dialogs, subscribes to push service endpoints, and handles push and notificationclick events"
      },
      {
        "name": "Responsive Offline-First React Application Dashboard",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Renders mobile-optimized UI views, displays online/offline connectivity badges, and provides optimistic UI updates"
      },
      {
        "name": "Offline Lighthouse PWA & Sync Latency Benchmark Harness",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Automates headless Chromium testing to verify 100/100 Lighthouse PWA audit compliance and offline load performance"
      },
      {
        "name": "PWA Deployment Guide & Offline Service Worker Architecture Diagram",
        "tools_used": ["TypeScript", "React"],
        "purpose": "Documents cache versioning policies, VAPID key rotation procedures, and mobile home-screen install criteria"
      }
    ],
    "data_flow": "The user loads the web app; the browser registers the Workbox service worker which precaches the app shell; user navigates between views; API data caches using a stale-while-revalidate strategy; if the device goes offline, network requests intercept and serve from IndexedDB or cache; when the user submits a form while offline, the payload writes to the IndexedDB mutation queue with a pending status and updates the UI optimistically; when network connectivity returns (via window online event or Background Sync), the service worker drains the queue in FIFO order, posts mutations to the backend API, and updates local record IDs; backend triggers Web Push events to display system notifications.",
    "enforcement_mechanism": "Idempotency keys on queued mutations preventing duplicate execution; cryptographic VAPID signatures validating push payloads."
  },
  "targets": [
    {
      "metric": "Lighthouse PWA Audit Compliance Score",
      "method": "Automated Lighthouse CLI audit measuring PWA criteria, offline capability, installability, and service worker registration",
      "input": "Headless Chromium browser session loading production PWA build on simulated throttled mobile device",
      "environment": "Standard 4-core local CPU, Node.js 18+, Lighthouse CLI 10+",
      "minimum_pass": "Lighthouse PWA audit score is >= 95 out of 100",
      "target": "Lighthouse PWA audit score is 100 out of 100",
      "report": "Lighthouse JSON audit report and PWA category checklist"
    },
    {
      "metric": "Offline App Shell First Contentful Paint (FCP)",
      "method": "Navigation timing measuring duration from navigation start to first rendered paint while network is completely disconnected",
      "input": "10 repeated cold page loads executed with browser network disconnected (offline mode)",
      "environment": "Headless Chromium browser running under simulated slow 4-core mobile CPU emulation",
      "minimum_pass": "p95 offline First Contentful Paint is < 1,500 milliseconds",
      "target": "p95 offline First Contentful Paint is < 650 milliseconds",
      "report": "Chromium DevTools performance trace log and paint timing table"
    },
    {
      "metric": "Offline Mutation Queue Idempotent Reconnection Sync Rate",
      "method": "Percentage of mutations created while disconnected successfully submitted and committed to backend API upon reconnection",
      "input": "50 offline form submissions queued in IndexedDB across simulated 60-second network outage",
      "environment": "Playwright automated browser test suite simulating network offline toggling and mock backend API",
      "minimum_pass": "50 of 50 offline mutations successfully synchronize with 0 duplicate submissions",
      "target": "50 of 50 offline mutations successfully synchronize with 0 duplicate submissions",
      "report": "Offline mutation replay audit log and backend transaction consistency verification"
    }
  ],
  "skills": ["TypeScript", "React", "Workbox", "Service Workers", "IndexedDB", "Web Push API", "Full-Stack Web", "Mobile Engineering"],
  "starter_input": {
    "spec": "Directory containing React application scaffolding, Workbox service worker configuration, IndexedDB sync helper, and mock API server.",
    "size": "14 TypeScript source files, Web App Manifest JSON, icon assets, and Playwright automated test scripts",
    "seeded_cases": "Service worker update waiting states, quota exceeded errors in IndexedDB, and rapid network flap transitions",
    "label_source": "Deterministic Lighthouse audit JSON reports and Playwright browser assertion invariants",
    "personal_data_policy": "Strictly mock synthetic field work order records and simulated notification payloads; no real personal data used"
  },
  "components": [
    {"name": "App Shell Architecture & Workbox Precaching Service Worker", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "IndexedDB Offline Mutation Queue & Background Sync Engine", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Web Push Notification & VAPID Subscription Manager", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Responsive Offline-First React Application Dashboard", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Offline Lighthouse PWA & Sync Latency Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "PWA Deployment Guide & Offline Service Worker Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 2.0}
  ],
  "extended_path": {
    "features": [
      "Periodic Background Sync API updating local cached catalog data every 12 hours while application is closed",
      "Web Share Target API allowing the PWA to receive shared images and URLs directly from native mobile share sheets",
      "Multi-device conflict resolution using CRDT counter registers for collaborative offline quantity updates"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "App Shell Architecture & Workbox Precaching in TypeScript, Workbox and Service Workers",
      "hours": 7,
      "done_criterion": "Service worker installs and precaches shell; app loads offline with sub-1.5s FCP."
    },
    {
      "name": "IndexedDB Offline Mutation Queue & Background Sync in IndexedDB and Mobile Engineering",
      "hours": 7,
      "done_criterion": "Mutations queue in IndexedDB while offline; 50 of 50 mutations synchronize upon reconnection."
    },
    {
      "name": "Web Push Notifications & VAPID Authentication in Web Push API and React",
      "hours": 7,
      "done_criterion": "VAPID keys generate; service worker displays push notifications and handles click routing."
    },
    {
      "name": "Lighthouse 100 Audit, Reconnection Anti-Fake Test & Docs in Full-Stack Web",
      "hours": 7,
      "done_criterion": "Lighthouse PWA audit scores >= 95; anti-fake offline sync passes; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in modern TypeScript, React, and asynchronous JavaScript (Promises, async/await)",
    "Understanding of browser Service Worker lifecycles, Cache API, IndexedDB transactions, and Web Push concepts"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (client-side browser JavaScript and Node.js backend mock server)",
    "cost": "$0 (fully open-source stack using local browser and Node.js)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required (local VAPID key pairs generated via web-push library)",
    "reference_environment": "Local 4-core CPU with Node.js 18+, modern Chromium/Chrome browser, and npm",
    "fallback_path": "Running tests against local headless Chromium without push service for environments blocking browser notifications"
  },
  "riskiest_component": {
    "name": "Stale Cache Traps and Broken Service Worker Update Cycles",
    "mitigation": "Configure Workbox precache manifest revisions and implement skipWaiting prompt allowing users to activate new versions immediately.",
    "fallback": "Hard-coded emergency unregister hook allowing client force-reload to clear corrupted service worker states."
  },
  "deliverables": [
    "Git repository containing React PWA, Workbox service worker, IndexedDB sync layer, and Node.js mock API server",
    "Web App Manifest, custom app icons, and offline fallback HTML page",
    "Automated Playwright test suite verifying offline mutation queuing and reconnection synchronization",
    "Screener verification script executing Lighthouse audit and dynamic offline-to-online sync in under 2 minutes"
  ],
  "out_of_scope": [
    "Native iOS/Android Swift or Kotlin container wrappers (Cordova / Capacitor)",
    "Third-party proprietary commercial mobile push providers (OneSignal / Braze)",
    "Bluetooth / NFC hardware peripheral integration APIs"
  ],
  "safety_note": None,
  "resources": [
    "Google Chrome Workbox Documentation & Service Worker Best Practices",
    "Progressive Web Apps Specification (W3C Working Group Note)",
    "Web Push API and VAPID RFC 8292 Specification"
  ],
  "rubric": [
    {
      "input": "Headless Chromium browser loading production PWA build",
      "action": "npx lighthouse http://localhost:3000 --output=json --output-path=./reports/lighthouse.json --only-categories=pwa",
      "expected_result": "Lighthouse audit confirms service worker registration, offline loading, and scores >= 95 PWA score",
      "evidence_location": "Lighthouse audit JSON file in reports/lighthouse.json",
      "pass_criterion": "PWA score >= 95 out of 100 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "10 repeated cold page loads executed under offline network emulation",
      "action": "npm run test:offline-fcp",
      "expected_result": "App shell renders completely from service worker cache with p95 FCP < 1,500ms",
      "evidence_location": "Performance timing trace in reports/offline_perf.json",
      "pass_criterion": "p95 FCP < 1500ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 offline form submissions queued in IndexedDB while disconnected",
      "action": "npx playwright test tests/offline_sync.spec.ts",
      "expected_result": "Mutations persist in IndexedDB and flush to mock API with 0 duplicates upon reconnection",
      "evidence_location": "Playwright test execution log and reports/sync_results.json",
      "pass_criterion": "50 of 50 mutations committed successfully with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Web Push test payload dispatched via web-push library using local VAPID keys",
      "action": "npm run test:push-notification",
      "expected_result": "Service worker receives push event, verifies VAPID signature, and shows notification badge",
      "evidence_location": "Service worker push execution log in reports/push_audit.json",
      "pass_criterion": "Notification event received and displayed with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Simulated offline user creating a maintenance ticket while disconnected",
      "action": "npm run test:verify-offline-flow",
      "expected_result": "Browser creates ticket in IndexedDB, displays pending sync badge, and commits to backend upon online event",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms offline creation and successful online commit with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected production Progressive Web App in TypeScript and React using Workbox service workers; achieved [LIGHTHOUSE_SCORE] Lighthouse PWA audit compliance, and maintained offline mutation reliability across [SYNC_TRANSACTIONS] queued offline transactions.",
    "claims": [
      {
        "text": "achieved [LIGHTHOUSE_SCORE] Lighthouse PWA audit compliance",
        "rubric_indexes": [0]
      },
      {
        "text": "maintained offline mutation reliability across [SYNC_TRANSACTIONS] queued offline transactions",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "native mobile Swift or Kotlin wrapper compilation or proprietary commercial push SaaS"
  },
  "verify": [
    "Run `npm test` to confirm unit tests for IndexedDB sync, React views, and VAPID handlers pass.",
    "Execute `npx lighthouse http://localhost:3000 --only-categories=pwa` to verify PWA score meets >= 95 threshold.",
    "Run `npm run test:verify-offline-flow` to assert offline ticket creation and online sync commit."
  ],
  "worksheet": {
    "q1": "Core deliverable: a production Progressive Web App in TypeScript and React with Workbox service workers, IndexedDB offline sync, and Web Push.",
    "q2": "Target users: mobile web application developers, frontend systems architects, and full-stack web engineers.",
    "q3": "3 use cases: field technician maintenance logging, warehouse inventory auditing, and emergency dispatch broadcast alerts.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: Workbox cache invalidation strategies, IndexedDB FIFO transaction replay, VAPID push subscriptions, and offline UI state.",
    "q6": "Starter input: React app scaffolding, Workbox config, IndexedDB sync helper, and mock API server. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Local VAPID keys generated via npm.",
    "q8": "Riskiest component: stale cache traps in service worker. Fallback: precache manifest revisions and skipWaiting activation prompts.",
    "q9": "Potential faking: standard responsive web app without actual offline support. Anti-fake check 5 simulates offline disconnection and asserts IndexedDB queuing and sync.",
    "q10": "Safety/ethics: Safe; synthetic field inspection logs and local VAPID keys, zero personal data."
  }
}

b56_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, Workbox routing strategies, and offline sync specs | High |
| Tech Stack | React, Workbox, Service Workers, Web Push API, IndexedDB | Lacked TypeScript specification and explicit architectural component mappings | Medium |
| Rubric | Missing quantitative targets | Lacked concrete Lighthouse PWA thresholds, FCP timing bounds, and offline sync verification | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b56_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js, modern Chromium, and local VAPID keys at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Lighthouse score (>= 95), offline FCP (< 1,500ms), and reconnection sync (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Headless Chromium browser automation running on localhost without external push services.",
  "Can test data be created in minutes?": "YES. Synthetic work order records and automated Playwright scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: native mobile Swift/Kotlin wrappers, commercial push SaaS, and Bluetooth hardware APIs.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 simulates offline disconnection and verifies IndexedDB queuing and online sync.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b56_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Periodic Background Sync to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic PWA metrics (Lighthouse score, offline FCP, and idempotent mutation sync).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake offline disconnection and sync replay test.
"""

# ==============================================================================
# 57. brief-raft-consensus
# ==============================================================================
b57_data = {
  "id": "brief-raft-consensus",
  "title": "Distributed Replicated Key-Value Store from Scratch in Go with Raft Consensus, LevelDB WAL & gRPC Cluster Transport",
  "domain": "Distributed Systems",
  "difficulty": "ADVANCED",
  "project_types": ["Systems programming", "Distributed systems"],
  "problem": "Single-point-of-failure database architectures suffer from catastrophic outages, data corruption, and prolonged downtime when server hardware fails or network partitions isolate data centers. Off-the-shelf distributed stores obscure consensus mechanics, leaving software engineers unprepared to diagnose split-brain anomalies, phantom reads, and cascading leader failover storms. This project builds a production-grade distributed replicated key-value storage engine from scratch in Go implementing the Raft consensus algorithm. The engine implements randomized election timers, leader heartbeats, persistent write-ahead logging (WAL) using LevelDB, gRPC peer-to-peer RPC transport, cluster membership changes, log compaction via snapshotting, and linearizable read/write request semantics.",
  "use_cases": [
    {
      "title": "Mission-Critical Distributed Configuration Management",
      "first_sentence": "Cloud infrastructure control planes require a distributed configuration registry to coordinate microservice routing tables and database connection strings.",
      "second_sentence": "The Raft cluster replicates configuration key-value pairs across 5 server nodes, guaranteeing linearizable reads and continuous availability even if 2 nodes fail."
    },
    {
      "title": "Distributed Lock Manager & Leader Election Coordinator",
      "first_sentence": "High-throughput message processing workers require mutual exclusion distributed locks to prevent multiple worker nodes from processing the same queue partition.",
      "second_sentence": "The key-value engine manages atomic compare-and-swap lease keys with TTL expirations, electing single active partition masters with zero split-brain risk."
    },
    {
      "title": "Distributed Service Discovery Registry & Health Tracker",
      "first_sentence": "Dynamic container platforms need a resilient service discovery catalog that updates service instance IP endpoints as pods spawn and terminate.",
      "second_sentence": "Service agents register ephemeral keys via gRPC client sessions, automatically replicating instance state across the Raft consensus quorum with low commit latency."
    }
  ],
  "hard_parts": [
    "Implementing the Raft state machine transitions (Follower, Candidate, Leader) with thread-safe goroutine channels and randomized election timeouts",
    "Enforcing the Raft Log Matching and Leader Completeness safety invariants during out-of-order AppendEntries RPC retries",
    "Implementing LevelDB write-ahead log persistence and state snapshotting to truncate committed logs and prevent disk saturation",
    "Handling complex cluster network partitions (minority vs majority split-brain) while guaranteeing linearizability and client request redirection"
  ],
  "screener_signals": [
    "Clean Go codebase cleanly separating the Raft consensus state machine, gRPC RPC transport, LevelDB storage engine, and client API handlers",
    "Chaos network partition benchmark report demonstrating automatic leader re-election in < 350ms upon primary leader termination",
    "Anti-fake verification script partitioning 2 nodes of a 5-node cluster, writing 20 key-value pairs to the majority partition, healing the partition, and asserting the minority catches up with identical log state"
  ],
  "job_families": [
    "Distributed Systems Engineer",
    "Infrastructure Core Software Developer",
    "Database Systems Architect"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing concurrent state machines and networking"},
    {"tool": "Raft", "role": "distributed consensus protocol governing leader election, log replication, and safety"},
    {"tool": "gRPC", "role": "remote procedure call framework powering peer-to-peer AppendEntries and RequestVote RPCs"},
    {"tool": "Concurrency", "role": "goroutines, sync primitives, and atomic channels orchestrating non-blocking state loops"},
    {"tool": "LevelDB", "role": "embedded key-value storage engine persisting Raft write-ahead logs and state snapshots"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Raft Core State Machine & Randomized Election Timer",
        "tools_used": ["Go", "Raft", "Concurrency"],
        "purpose": "Manages Follower/Candidate/Leader roles, term increments, randomized election timeouts (150-300ms), and voting logic"
      },
      {
        "name": "Raft Log Replication Engine & Commit Safety Verifier",
        "tools_used": ["Go", "Raft"],
        "purpose": "Coordinates AppendEntries RPCs, verifies term and index matches, commits entries upon majority quorum, and applies to state"
      },
      {
        "name": "LevelDB Persistent Write-Ahead Log & Snapshot Manager",
        "tools_used": ["Go", "LevelDB"],
        "purpose": "Persists currentTerm, votedFor, and log entries to LevelDB before replying to RPCs; generates and installs compact snapshots"
      },
      {
        "name": "Peer gRPC Cluster RPC Transport & Heartbeat Coordinator",
        "tools_used": ["Go", "gRPC"],
        "purpose": "Implements RequestVote, AppendEntries, and InstallSnapshot RPC handlers and client connection connection pools"
      },
      {
        "name": "Client Key-Value State Machine & Linearizable Read Handler",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Executes Get, Put, and Delete operations against in-memory state machine; routes client requests to active leader"
      },
      {
        "name": "Cluster Partition Chaos & Throughput Benchmark Harness",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Simulates network partitions, measures election failover latency, and benchmarks write throughput across 5 nodes"
      },
      {
        "name": "Raft Protocol Implementation Guide & Architecture Diagram",
        "tools_used": ["Go", "Raft"],
        "purpose": "Documents state machine transition invariants, election timeout calculations, and LevelDB log encoding layouts"
      }
    ],
    "data_flow": "A client sends a Put(key, value) request to node 1; if node 1 is a follower, it returns the current leader's gRPC address; client redirects request to leader node 2; leader appends the command to its local log and persists to LevelDB; leader sends AppendEntries RPCs containing the new entry to all followers over gRPC; once a majority (3 of 5 nodes) acknowledge replication, the leader advances its commitIndex, applies the entry to the state machine, and replies success to the client; during subsequent heartbeats, followers learn of the new commitIndex and apply the entry to their local state machines.",
    "enforcement_mechanism": "Raft Election Safety invariant ensuring at most one leader per term; strict quorum write replication (majority = N/2 + 1)."
  },
  "targets": [
    {
      "metric": "Leader Election Failover Latency",
      "method": "Wall-clock timing from abrupt leader termination (SIGKILL) to successful election of new cluster leader across 5 nodes",
      "input": "10 repeated leader termination trials injected during active client traffic",
      "environment": "Standard 4-core local CPU, Go 1.21+ release binary, 5-node local cluster communicating over loopback ports",
      "minimum_pass": "p95 leader election failover latency is < 450 milliseconds",
      "target": "p95 leader election failover latency is < 220 milliseconds",
      "report": "Leader election failover latency summary and cluster transition log"
    },
    {
      "metric": "Sustained Linearizable Write Throughput",
      "method": "Committed key-value write transactions per second replicated across majority quorum and persisted to LevelDB",
      "input": "10,000 sequential Put requests issued across 20 concurrent client worker goroutines",
      "environment": "5-node local Raft cluster with LevelDB synchronous write options enabled",
      "minimum_pass": "Sustained write throughput is >= 1,500 operations per second",
      "target": "Sustained write throughput is >= 4,200 operations per second",
      "report": "Raft cluster write throughput benchmark report and latency distribution"
    },
    {
      "metric": "Network Partition Recovery Log Consistency Rate",
      "method": "Verification of identical log entry sequences and state machine key-value pairs across all nodes after partition healing",
      "input": "Network partition isolating 2 nodes for 30 seconds while 100 writes are committed to the 3-node majority partition",
      "environment": "Automated network chaos test runner injecting TCP connection drop filters between cluster nodes",
      "minimum_pass": "5 of 5 nodes achieve identical state machine hash and log parity after partition healing",
      "target": "5 of 5 nodes achieve identical state machine hash and log parity after partition healing",
      "report": "Network partition chaos test log and state checksum verification report"
    }
  ],
  "skills": ["Go", "Raft", "gRPC", "Concurrency", "LevelDB", "Distributed Systems", "Systems Programming"],
  "starter_input": {
    "spec": "Directory containing Raft state machine interface, gRPC protobuf schemas, LevelDB storage wrapper, and test harness.",
    "size": "9 Go source packages, protobuf definition file, and automated cluster chaos test suite",
    "seeded_cases": "Split-vote election ties, delayed out-of-order AppendEntries frames, and abrupt SIGKILL node terminations",
    "label_source": "Deterministic Raft paper TLA+ safety invariants and SHA-256 state machine checksum assertions",
    "personal_data_policy": "Strictly mock synthetic configuration keys and simulated cluster node IDs; no real personal data used"
  },
  "components": [
    {"name": "Raft Core State Machine & Randomized Election Timer", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Raft Log Replication Engine & Commit Safety Verifier", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "LevelDB Persistent Write-Ahead Log & Snapshot Manager", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Peer gRPC Cluster RPC Transport & Heartbeat Coordinator", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Client Key-Value State Machine & Linearizable Read Handler", "task_type": "concurrency/consistency mechanism with tests", "hours": 5.0},
    {"name": "Cluster Partition Chaos & Throughput Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Raft Protocol Implementation Guide & Architecture Diagram", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic cluster membership changes via Joint Consensus (C_old -> C_old,new -> C_new) configuration transitions",
      "ReadIndex / LeaseRead optimization servicing linearizable reads without executing AppendEntries disk logging",
      "Pre-Vote protocol extension preventing partitioned stale nodes from disrupting active cluster leaders upon reconnection"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Raft Core State Machine & gRPC Election Protocol in Go, Raft and gRPC",
      "hours": 10,
      "done_criterion": "Randomized timers trigger elections; candidate gathers majority votes and becomes leader."
    },
    {
      "name": "Log Replication & LevelDB Write-Ahead Logging in LevelDB and Concurrency",
      "hours": 10,
      "done_criterion": "Leader replicates log entries across nodes; LevelDB persists WAL; commitIndex advances."
    },
    {
      "name": "Linearizable Key-Value State Machine & Throughput in Distributed Systems",
      "hours": 10,
      "done_criterion": "Client executes Get/Put requests; sustained throughput achieves >= 1,500 operations/sec."
    },
    {
      "name": "Network Partition Recovery Anti-Fake Test & Docs in Systems Programming",
      "hours": 10,
      "done_criterion": "Partition chaos test confirms majority commits and minority heals; docs and diagrams complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, goroutines, mutex synchronization, and channel communication",
    "Deep understanding of distributed consensus concepts, state machine replication, and gRPC/Protobuf protocols"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU, memory, and disk I/O bound systems software)",
    "cost": "$0 (fully open-source Go codebase)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ release compiler and LevelDB dependencies installed",
    "fallback_path": "In-memory append-only slice persistence if LevelDB CGO bindings encounter compilation hurdles"
  },
  "riskiest_component": {
    "name": "Deadlocks in Concurrent State Transitions and Split-Brain Split-Votes",
    "mitigation": "Enforce strict lock acquisition hierarchies, randomized election timeouts (150-300ms), and buffered event channels.",
    "fallback": "Watchdog supervisor goroutine detecting lock stalls exceeding 1 second and dumping goroutine stack traces."
  },
  "deliverables": [
    "Git repository containing Go Raft implementation, gRPC cluster server, LevelDB storage driver, and CLI client",
    "Automated unit test suite verifying election safety, log matching invariants, and commit progression",
    "Cluster chaos test harness simulating network partitions and measuring failover latency percentiles",
    "Screener verification script executing automated 5-node cluster election and partition healing in under 3 minutes"
  ],
  "out_of_scope": [
    "Multi-Raft sharding or distributed range partition architectures (CockroachDB style)",
    "Byzantine Fault Tolerance (BFT) algorithms handling malicious adversarial nodes",
    "Cross-WAN geo-distributed consensus optimization"
  ],
  "safety_note": None,
  "resources": [
    "In Search of an Understandable Consensus Algorithm (Ongaro and Ousterhout - Raft Paper)",
    "Raft Protocol Interactive Visualization (The Secret Lives of Data)",
    "Students' Guide to Raft (Jon Gjengset Architecture Reference)"
  ],
  "rubric": [
    {
      "input": "10 repeated leader kill trials across 5-node local Raft cluster",
      "action": "go run ./cmd/bench_election --trials 10 --nodes 5",
      "expected_result": "Cluster detects leader death and successfully elects new leader with p95 latency < 450ms",
      "evidence_location": "Terminal execution output log and reports/election_failover.json",
      "pass_criterion": "p95 failover latency < 450ms and 0 split-brain leaders with exit code 0",
      "kind": "normal"
    },
    {
      "input": "10,000 sequential Put requests across 20 concurrent client goroutines",
      "action": "go run ./cmd/bench_throughput --requests 10000 --concurrency 20",
      "expected_result": "Cluster commits transactions across majority and achieves throughput >= 1,500 ops/sec",
      "evidence_location": "Throughput benchmark report in reports/write_throughput.json",
      "pass_criterion": "Throughput >= 1500 ops/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "LevelDB persistent WAL recovery test after unexpected cluster process kill",
      "action": "go test -v ./storage/... -run TestLevelDBWALRecovery",
      "expected_result": "Node restores currentTerm, votedFor, and all uncompacted log entries from LevelDB with 0 data loss",
      "evidence_location": "Storage recovery audit log in reports/wal_recovery.json",
      "pass_criterion": "100 of 100 persisted log entries restored with exit code 0",
      "kind": "normal"
    },
    {
      "input": "CLI request querying cluster membership and node status via gRPC",
      "action": "go run ./cmd/raft_cli status --endpoint localhost:5001",
      "expected_result": "CLI outputs current leader ID, term, active follower addresses, and commitIndex",
      "evidence_location": "CLI stdout terminal output",
      "pass_criterion": "Output displays valid leader and 4 connected followers with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Network partition isolating 2 nodes while 20 writes commit to majority",
      "action": "go test -v ./chaos/... -run TestPartitionHealingConvergence",
      "expected_result": "Majority commits writes; after partition heals, minority catches up to identical SHA-256 state hash",
      "evidence_location": "Dynamic partition verification console log and reports/chaos_parity.json",
      "pass_criterion": "Console confirms identical SHA-256 state hash across all 5 nodes with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected distributed replicated key-value store in Go implementing Raft consensus; achieved sub-[FAILOVER_LATENCY] millisecond leader election failover, and sustained [WRITE_THROUGHPUT] write operations per second with LevelDB persistence.",
    "claims": [
      {
        "text": "achieved sub-[FAILOVER_LATENCY] millisecond leader election failover",
        "rubric_indexes": [0]
      },
      {
        "text": "sustained [WRITE_THROUGHPUT] write operations per second with LevelDB persistence",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "byzantine fault tolerance or multi-raft sharded transaction coordination"
  },
  "verify": [
    "Run `go test -v ./raft/...` to confirm election safety, log replication, and snapshot tests pass.",
    "Execute `go run ./cmd/bench_election` to verify failover latency remains < 450ms.",
    "Run `go test -v ./chaos/... -run TestPartitionHealingConvergence` to confirm partition recovery."
  ],
  "worksheet": {
    "q1": "Core deliverable: a distributed replicated key-value storage engine in Go implementing Raft consensus, LevelDB WAL, and gRPC transport.",
    "q2": "Target users: distributed systems engineers, infrastructure software developers, and database architects.",
    "q3": "3 use cases: distributed configuration management, distributed lock manager/leader coordinator, and dynamic service discovery.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: thread-safe Raft state transitions, AppendEntries safety invariants, LevelDB log compaction/snapshots, and partition chaos.",
    "q6": "Starter input: Raft interfaces, gRPC protobufs, LevelDB wrapper, and cluster chaos runner. Synthetic test data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU/disk bound, $0 cost, zero cloud keys. Fallback: in-memory slice store.",
    "q8": "Riskiest component: state transition deadlocks and split-vote ties. Fallback: randomized 150-300ms timers and deadlock watchdog.",
    "q9": "Potential faking: single-node key-value store pretending to be Raft. Anti-fake check 5 partitions 2 nodes, commits 20 writes to majority, heals, and asserts identical state hash.",
    "q10": "Safe; synthetic configuration keys and private loopback network ports only."
  }
}

b57_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 40-hour seed | Lacked concrete architectural framing, Raft invariant specifications, and storage mechanics | High |
| Tech Stack | Go, Distributed Systems, Raft, gRPC, Concurrency | Lacked concrete storage engine (LevelDB) and explicit architectural component mappings | Medium |
| Rubric | Missing quantitative targets | Lacked concrete failover latency bounds, throughput criteria, and network partition chaos tests | High |
| Effort Model | Unverified 40 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b57_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go and LevelDB at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Failover latency (< 450ms), write throughput (>= 1,500 ops/sec), and partition parity (5 of 5 nodes) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory append-only slice persistence if LevelDB CGO bindings encounter compilation hurdles.",
  "Can test data be created in minutes?": "YES. Synthetic cluster key-value generator and automated cluster chaos runner included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: multi-raft range sharding, Byzantine fault tolerance, and cross-WAN geo-replication.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 partitions 2 nodes, commits 20 writes to majority, heals, and asserts identical state hash.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b57_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved joint consensus membership changes and ReadIndex to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic distributed consensus metrics (election failover, majority throughput, and partition recovery).
- Removed Banned Content: Removed promotional marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake network partition healing state hash verification.
"""

# ==============================================================================
# 58. brief-rag-vector-search
# ==============================================================================
b58_data = {
  "id": "brief-rag-vector-search",
  "title": "Enterprise RAG Semantic Search & Hallucination Verification Engine with FastAPI, pgvector & Sentence-Transformers",
  "domain": "AI/ML Applications",
  "difficulty": "INTERMEDIATE",
  "project_types": ["ML/data pipeline", "Full-stack web"],
  "problem": "Enterprise retrieval-augmented generation (RAG) applications frequently generate plausible-sounding hallucinations, quote non-existent policy clauses, and expose internal knowledge bases to context-stuffing vulnerabilities. Naive vector retrieval relying solely on dense similarity returns irrelevant chunks when users query specific entity IDs, keyword codes, or acronyms, degrading answer quality. This project builds a production-grade enterprise RAG semantic search and verification engine in Python. The system ingests technical documentation, generates dense vector representations with open-source Sentence-Transformers, stores and indexes chunks using PostgreSQL with the pgvector extension (HNSW indexing), performs hybrid dense-sparse semantic retrieval with Reciprocal Rank Fusion (RRF), synthesizes answers with local LLMs, and verifies generated claims using automated citation verification.",
  "use_cases": [
    {
      "title": "Enterprise IT Policy & Compliance QA Assistant",
      "first_sentence": "Enterprise employees querying internal security policy handbooks need exact policy answers with verifiable paragraph citations rather than generic advice.",
      "second_sentence": "The engine retrieves top relevant policy chunks using hybrid vector search, synthesizes a grounded response via FastAPI, and highlights exact sentence citations matching source documents."
    },
    {
      "title": "Engineering Technical Architecture Specification Retrieval",
      "first_sentence": "Software engineering teams navigating large system architecture repositories need to query API contract specifications and database schemas.",
      "second_sentence": "The RAG backend combines pgvector semantic similarity with keyword matching to retrieve accurate technical snippets, reducing developer search time from hours to seconds."
    },
    {
      "title": "Customer Support Agent Troubleshooting Copilot",
      "first_sentence": "Support engineers handling complex hardware troubleshooting tickets require fast access to relevant diagnostic flowcharts and error resolution manuals.",
      "second_sentence": "The system matches incoming customer error logs to service manual chunks, generating step-by-step diagnostic workflows verified against official manuals."
    }
  ],
  "hard_parts": [
    "Implementing hybrid dense-sparse retrieval combining pgvector HNSW cosine similarity with PostgreSQL full-text search (tsvector) using Reciprocal Rank Fusion",
    "Designing semantic chunking pipelines that preserve document hierarchical context without fragmenting code blocks or structured tables",
    "Building an automated claim-level hallucination verification module that cross-checks generated sentences against retrieved source chunk spans",
    "Optimizing pgvector HNSW index parameters (m, ef_construction, ef_search) to achieve sub-25ms retrieval latency across 100,000 document chunks"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating document chunkers, pgvector database adapters, embedding generators, and verification endpoints",
    "Search latency and accuracy report proving sub-25ms p95 vector retrieval and >= 88% Mean Reciprocal Rank (MRR@10) on technical queries",
    "Anti-fake verification script submitting an adversarial ungrounded question (querying non-existent policy XYZ-999) and asserting the engine responds with 'INSUFFICIENT_CONTEXT' rather than hallucinating"
  ],
  "job_families": [
    "AI Systems Engineer",
    "RAG / NLP Software Developer",
    "Full-Stack Machine Learning Engineer"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language powering chunking pipelines, embedding generation, and retrieval APIs"},
    {"tool": "FastAPI", "role": "asynchronous web framework serving vector search queries, RAG synthesis, and citation verification"},
    {"tool": "pgvector", "role": "PostgreSQL vector extension providing HNSW indexing and low-latency cosine distance calculations"},
    {"tool": "PostgreSQL", "role": "relational database storing document metadata, chunk text, full-text tsvectors, and query audit logs"},
    {"tool": "Docker", "role": "containerization runtime hosting local PostgreSQL with pgvector extension pre-installed"},
    {"tool": "Sentence-Transformers", "role": "open-source embedding model generating 384-dimensional dense semantic vectors (all-MiniLM-L6-v2)"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Document Ingestion, Cleaning & Recursive Text Chunking Pipeline",
        "tools_used": ["Python"],
        "purpose": "Parses markdown and text files, cleans formatting, and generates overlapping semantic chunks with metadata headers"
      },
      {
        "name": "Sentence-Transformers Dense Embedding Generation Worker",
        "tools_used": ["Python", "Sentence-Transformers"],
        "purpose": "Computes 384-dimensional dense semantic vector representations for document chunks in batched inference loops"
      },
      {
        "name": "pgvector Columnar Indexing & Hybrid Cosine Retrieval Engine",
        "tools_used": ["Python", "PostgreSQL", "pgvector"],
        "purpose": "Stores chunk embeddings, manages HNSW index, executes hybrid dense-sparse queries, and ranks with RRF"
      },
      {
        "name": "FastAPI Grounded Generation & Hallucination Citation Verifier",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Constructs grounded context prompts, generates answers, and verifies that every output claim references a valid chunk"
      },
      {
        "name": "Retrieval Accuracy & Latency Evaluation Benchmark Harness",
        "tools_used": ["Python", "Docker"],
        "purpose": "Evaluates MRR@10, Hit Rate@5, and p95 retrieval latencies across 500 enterprise evaluation queries"
      },
      {
        "name": "Enterprise RAG Architecture Guide & pgvector Schema Manual",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Documents HNSW tuning benchmarks, chunk size trade-offs, and hallucination guardrail mechanisms"
      }
    ],
    "data_flow": "Documents ingest into the pipeline; the chunker splits content into 500-token chunks with 50-token overlap; Sentence-Transformers computes 384-d embeddings; chunks and vectors insert into PostgreSQL; pgvector maintains the HNSW index; a user submits a query via FastAPI; the query converts to an embedding and a tsquery; pgvector executes hybrid dense-sparse search and merges results using Reciprocal Rank Fusion; top-5 chunks assemble into a prompt context; the generation module synthesizes an answer; the citation verifier validates extracted claim spans against source chunk text; the response returns with verified citation badges.",
    "enforcement_mechanism": "Strict cosine distance similarity thresholds and citation verification algorithms rejecting ungrounded claims."
  },
  "targets": [
    {
      "metric": "p95 Hybrid Vector Retrieval Latency",
      "method": "Wall-clock timing to generate query embedding, execute pgvector HNSW search, and merge RRF results across 100,000 chunks",
      "input": "1,000 benchmark queries issued against PostgreSQL database containing 100,000 indexed document chunks",
      "environment": "Standard 4-core local CPU, PostgreSQL 15+ with pgvector in Docker, Python 3.11",
      "minimum_pass": "p95 hybrid retrieval latency is < 40.0 milliseconds",
      "target": "p95 hybrid retrieval latency is < 18.5 milliseconds",
      "report": "pgvector query latency benchmark report and HNSW index scan timing"
    },
    {
      "metric": "Retrieval Mean Reciprocal Rank (MRR@10)",
      "method": "Mean Reciprocal Rank evaluated against ground-truth question-chunk matching dataset of 500 technical queries",
      "input": "500 enterprise technical questions with human-annotated relevant document chunk IDs",
      "environment": "Deterministic evaluation harness executing hybrid dense-sparse retrieval",
      "minimum_pass": "Mean Reciprocal Rank (MRR@10) is >= 0.82",
      "target": "Mean Reciprocal Rank (MRR@10) is >= 0.91",
      "report": "Information retrieval benchmark evaluation log and recall/precision curves"
    },
    {
      "metric": "Hallucination Rejection on Out-of-Domain Queries",
      "method": "Percentage of intentionally adversarial or out-of-domain queries correctly answered with 'INSUFFICIENT_CONTEXT' rather than fabricated text",
      "input": "50 adversarial queries asking about fictitious corporate policies, nonexistent product codes, or fabricated employees",
      "environment": "FastAPI RAG testing pipeline running citation verification guardrails",
      "minimum_pass": "50 of 50 adversarial queries trigger INSUFFICIENT_CONTEXT with 0 fabricated claims",
      "target": "50 of 50 adversarial queries trigger INSUFFICIENT_CONTEXT with 0 fabricated claims",
      "report": "Hallucination guardrail evaluation log and citation verification audit"
    }
  ],
  "skills": ["Python", "FastAPI", "pgvector", "PostgreSQL", "Docker", "Sentence-Transformers", "RAG", "AI/ML Applications"],
  "starter_input": {
    "spec": "Directory containing document chunking scripts, pgvector database migrations, Sentence-Transformers embedding pipeline, and FastAPI app.",
    "size": "7 Python source modules, SQL migration scripts, Docker Compose file for pgvector, and 500 synthetic enterprise policy docs",
    "seeded_cases": "Tables split across chunk boundaries, acronym disambiguation queries, and adversarial ungrounded prompts",
    "label_source": "Deterministic question-to-chunk ground truth mappings and synthetic enterprise policy corpus",
    "personal_data_policy": "Strictly mock synthetic corporate policy guidelines and simulated technical documentation; no real personal data used"
  },
  "components": [
    {"name": "Document Ingestion, Cleaning & Recursive Text Chunking Pipeline", "task_type": "data pipeline step", "hours": 4.0},
    {"name": "Sentence-Transformers Dense Embedding Generation Worker", "task_type": "model train + evaluate cycle", "hours": 5.0},
    {"name": "pgvector Columnar Indexing & Hybrid Cosine Retrieval Engine", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "FastAPI Grounded Generation & Hallucination Citation Verifier", "task_type": "API endpoint group with tests", "hours": 4.0},
    {"name": "Retrieval Accuracy & Latency Evaluation Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 3.0},
    {"name": "Enterprise RAG Architecture Guide & pgvector Schema Manual", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Cross-encoder reranking model (e.g. bge-reranker-base) scoring top-20 retrieved candidates before prompt assembly",
      "Parent-document retrieval storing small chunks for vector search while returning full parent sections to the LLM",
      "Automated evaluation pipeline calculating RAGAS metrics (Faithfulness, Answer Relevance, Context Recall)"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Document Chunking & Sentence-Transformers Embeddings in Python and Sentence-Transformers",
      "hours": 7,
      "done_criterion": "Ingestion pipeline chunks documents and generates 384-d embeddings in batched loops."
    },
    {
      "name": "pgvector Storage & Hybrid Cosine Retrieval in pgvector, PostgreSQL and Docker",
      "hours": 7,
      "done_criterion": "pgvector stores vectors with HNSW index; hybrid retrieval achieves MRR@10 >= 0.82."
    },
    {
      "name": "FastAPI Grounded QA & Citation Verifier in FastAPI and RAG",
      "hours": 7,
      "done_criterion": "FastAPI endpoint serves grounded answers; citation verifier validates source text spans."
    },
    {
      "name": "Hallucination Rejection Anti-Fake Test & Docs in AI/ML Applications",
      "hours": 7,
      "done_criterion": "50 of 50 adversarial queries trigger INSUFFICIENT_CONTEXT; docs and schema guides complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python backend development, FastAPI, and relational database interactions (SQLAlchemy / asyncpg)",
    "Understanding of vector search concepts (embeddings, cosine similarity, HNSW indexing) and RAG architecture principles"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (compact Sentence-Transformers all-MiniLM-L6-v2 embedding model runs efficiently on CPU)",
    "cost": "$0 (fully open-source stack using local PostgreSQL with pgvector in Docker)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required (uses open-source local embeddings and local QA synthesis)",
    "reference_environment": "Local 4-core CPU with Docker Desktop (pgvector container) and Python 3.11 with PyTorch CPU",
    "fallback_path": "Local SQLite vector extension or in-memory NumPy cosine similarity matrix if Docker pgvector is unavailable"
  },
  "riskiest_component": {
    "name": "HNSW Vector Index Saturation and Out-of-Domain Hallucinations",
    "mitigation": "Tune HNSW ef_construction and m parameters for high recall, and enforce similarity distance cutoffs that trigger INSUFFICIENT_CONTEXT.",
    "fallback": "Exact flat cosine distance scan (ivfflat or sequential scan) for datasets under 20,000 chunks."
  },
  "deliverables": [
    "Git repository containing document chunking scripts, pgvector migrations, embedding pipeline, and FastAPI app",
    "Docker Compose configuration launching PostgreSQL with pgvector extension pre-installed",
    "Automated evaluation benchmark script measuring MRR@10, Hit Rate@5, and p95 retrieval latency",
    "Screener verification script executing automated hybrid search and adversarial hallucination rejection in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial vector SaaS databases (Pinecone / Weaviate Cloud / Qdrant Cloud)",
    "Proprietary OpenAI or Anthropic paid API key integrations",
    "Complex multi-modal image and video embedding processing pipelines"
  ],
  "safety_note": None,
  "resources": [
    "pgvector Open-Source Extension Documentation & HNSW Indexing Guidelines",
    "Sentence-Transformers: Multilingual Sentence Embeddings (Reimers and Gurevych)",
    "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., NeurIPS 2020)"
  ],
  "rubric": [
    {
      "input": "1,000 benchmark queries against pgvector database with 100,000 chunks",
      "action": "python ./benchmarks/bench_retrieval.py --queries 1000 --concurrency 10",
      "expected_result": "pgvector returns top-5 chunks with p95 hybrid latency < 40.0ms",
      "evidence_location": "Retrieval benchmark execution log and reports/retrieval_latency.json",
      "pass_criterion": "p95 latency < 40.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 technical queries evaluated against ground-truth chunk labels",
      "action": "python ./evaluation/eval_mrr.py --queries 500",
      "expected_result": "Hybrid dense-sparse retrieval achieves MRR@10 >= 0.82 and Hit Rate@5 >= 0.90",
      "evidence_location": "Information retrieval evaluation report in reports/mrr_eval.json",
      "pass_criterion": "MRR@10 >= 0.82 with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Document chunking pipeline processing 100 markdown documents",
      "action": "python ./ingestion/chunk_documents.py --input-dir ./docs/sample",
      "expected_result": "Chunks preserve code block integrity and generate valid 384-d vector embeddings",
      "evidence_location": "Ingestion processing log in reports/chunking_audit.json",
      "pass_criterion": "100 of 100 documents chunked and embedded with exit code 0",
      "kind": "normal"
    },
    {
      "input": "FastAPI request asking valid question present in technical documentation",
      "action": "curl -X POST http://localhost:8000/api/v1/query -H 'Content-Type: application/json' -d '{\"question\":\"What is the database connection timeout?\"}'",
      "expected_result": "FastAPI returns grounded answer with verified source chunk ID and text citation span",
      "evidence_location": "HTTP response JSON and citation audit log",
      "pass_criterion": "Response status 200 with non-empty citation list and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Adversarial ungrounded query asking about fictitious policy clause XYZ-999",
      "action": "python ./scripts/verify_hallucination_rejection.py --query 'What are the penalties under policy XYZ-999?'",
      "expected_result": "System detects low similarity scores and returns 'INSUFFICIENT_CONTEXT' with 0 fabricated text",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console confirms response is 'INSUFFICIENT_CONTEXT' with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected enterprise RAG semantic search engine in Python using FastAPI, PostgreSQL, and pgvector; achieved [RETRIEVAL_MRR] ranking accuracy on technical documentation retrieval, and maintained sub-[QUERY_LATENCY] millisecond hybrid vector search latency.",
    "claims": [
      {
        "text": "achieved [RETRIEVAL_MRR] ranking accuracy on technical documentation retrieval",
        "rubric_indexes": [1]
      },
      {
        "text": "maintained sub-[QUERY_LATENCY] millisecond hybrid vector search latency",
        "rubric_indexes": [0]
      }
    ],
    "do_not_claim": "proprietary commercial OpenAI API fine-tuning or closed-source vector cloud infrastructure"
  },
  "verify": [
    "Run `pytest tests/` to confirm chunking, pgvector HNSW querying, and citation verification pass.",
    "Execute `python ./evaluation/eval_mrr.py` to confirm MRR@10 meets the >= 0.82 benchmark.",
    "Run `python ./scripts/verify_hallucination_rejection.py` to assert adversarial queries trigger INSUFFICIENT_CONTEXT."
  ],
  "worksheet": {
    "q1": "Core deliverable: an enterprise RAG semantic search and verification engine in Python with FastAPI, pgvector, and Sentence-Transformers.",
    "q2": "Target users: AI systems engineers, RAG/NLP software developers, and full-stack machine learning engineers.",
    "q3": "3 use cases: enterprise IT policy QA, engineering technical spec retrieval, and customer support troubleshooting.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: hybrid dense-sparse retrieval with RRF, semantic chunking preserving hierarchy, claim-level citation verification, and HNSW index tuning.",
    "q6": "Starter input: document chunking scripts, pgvector migrations, embedding pipeline, and synthetic policy corpus. Synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU bound, $0 cost using Docker pgvector and Sentence-Transformers. Zero cloud API keys.",
    "q8": "Riskiest component: HNSW index saturation and out-of-domain hallucinations. Fallback: similarity distance cutoffs returning INSUFFICIENT_CONTEXT.",
    "q9": "Potential faking: ungrounded LLM completions claiming to be RAG. Anti-fake check 5 queries fictitious policy XYZ-999 and asserts INSUFFICIENT_CONTEXT is returned.",
    "q10": "Safe; synthetic corporate policy documents and private local database only."
  }
}

b58_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, pgvector index tuning, and citation verification | High |
| Tech Stack | Python, FastAPI, pgvector, PostgreSQL, Docker, LangChain | Listed LangChain without specifying embedding model, index type (HNSW), or verification mechanisms | Medium |
| Rubric | Missing quantitative targets | Lacked concrete MRR@10 thresholds, retrieval latency bounds, and hallucination rejection tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |
"""

b58_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, PostgreSQL with pgvector in Docker, and local models at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Vector retrieval latency (< 40ms), MRR@10 (>= 0.82), and hallucination rejection (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory NumPy cosine similarity matrix if Docker pgvector container is unavailable.",
  "Can test data be created in minutes?": "YES. Synthetic policy corpus generator and automated evaluation scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial vector SaaS, paid OpenAI API keys, and multi-modal video embeddings.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 queries fictitious policy XYZ-999 and asserts engine returns INSUFFICIENT_CONTEXT.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 1 and 0."
}

b58_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cross-encoder reranking to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic RAG metrics (hybrid vector latency, MRR@10, and hallucination rejection).
- Removed Banned Content: Removed ungrounded marketing claims and unpinned LangChain dependencies.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake out-of-domain query hallucination rejection test.
"""

# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_6_part1():
    std_scores = {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}
    std_caps = {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}
    res54 = process_brief(b54_data, b54_old_diag, std_scores, std_caps, b54_reviewer, b54_changelog)
    res55 = process_brief(b55_data, b55_old_diag, std_scores, std_caps, b55_reviewer, b55_changelog)
    res56 = process_brief(b56_data, b56_old_diag, std_scores, std_caps, b56_reviewer, b56_changelog)
    res57 = process_brief(b57_data, b57_old_diag, std_scores, std_caps, b57_reviewer, b57_changelog)
    res58 = process_brief(b58_data, b58_old_diag, std_scores, std_caps, b58_reviewer, b58_changelog)
    return [res54, res55, res56, res57, res58]

if __name__ == "__main__":
    results = run_batch_6_part1()
    print("Batch 6 Part 1 finished successfully:", results)

