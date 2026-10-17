# Audit & Diagnosis: brief-analytics-clickhouse

## 1. Old Brief Diagnosis
- **Old Title**: Multi-Tenant B2B Event Analytics Engine
- **Domain**: Data Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 30 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of actual code, but bloated with unrealistic scale claims ("10M rows" and "10k events/sec" on a standard laptop without explaining data generation or memory constraints).

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 4.5 / 10 (missing 5 fields, no anti-fake check)
- Technical Accuracy: 5.5 / 10 (targets lack 7 fields, Kafka Engine + ClickHouse direct ingestion has known gotchas that were unaddressed)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.5 / 10 (unsubstantiated 10M row claim on standard dev hardware)
- Resume Bullet Safety: 6.0 / 10 (missing "Do not claim" line, placeholder mismatch)
- **Old Weighted Score**: 5.58 / 10 (Band C)

### Problems Found (with exact quotes)
1. **Unsubstantiated scale target without generation path**:
   > "Query Latency: p95 < 100ms for 3-step conversion funnel over 10M rows | Storage Compression: Disk compression ratio ≥ [X:1]"
   *Flaw*: Generating 10 million rows on a student's laptop takes significant disk and RAM, and running Kafka + ClickHouse + Node.js simultaneously in Docker risks OOM crashes on 8GB machines without explicit memory limits and dataset sizing.
2. **Missing operational sections**:
   *Flaw*: Missing `TARGET APPLICATION / STARTER INPUT`, `MILESTONES`, `DELIVERABLES`, `PREREQUISITES, ENVIRONMENT AND ACCOUNTS`, `OUT OF SCOPE`, and `LEARNING RESOURCES`.
3. **Only one technical challenge listed**:
   > "WHY THIS IS HARD (COMPETENCY REDUCER): Preventing Part Explosion: ClickHouse creates immutable physical directory parts for every write transaction..."
   *Flaw*: Part explosion is real, but sparse index key ordering, deduplication overhead under ReplacingMergeTree, and memory limits during `windowFunnel` execution are equally critical gotchas.
4. **Vulnerable to mocked rubric checks**:
   *Flaw*: Screener checks only verified running commands like `npm run query:funnel`. A student could hardcode a JSON response object `{"step_1": 1000, "step_2": 450, "step_3": 120}` without executing actual ClickHouse analytical queries.

### Hidden Hard Parts
1. **ClickHouse primary index ordering**: Ordering by `(tenant_id, event_name, timestamp)` allows fast tenant pruning and event filtering, but requires careful schema design so range queries on timestamps across all event types don't trigger full table scans.
2. **Part explosion prevention under streaming loads**: Ingesting single events causes "Too many parts" crashes; pipeline must implement an in-memory buffer flushing either on batch size (e.g. 5,000 items) or time interval (e.g. 2s).
3. **Deduplication vs Query Performance**: `ReplacingMergeTree` deduplicates asynchronously during background merges; exact deduplication at query time requires `FINAL` keyword or `argMax()` aggregations, which have severe memory and latency implications.
4. **Memory management for multi-step window funnels**: `windowFunnel()` can easily exceed server RAM thresholds if session sliding windows are set too wide on high-volume user streams.

### 3 Interviewer Questions a Student Following the Old Brief Could Not Answer
1. *"Why did you choose `(tenant_id, event_name, timestamp)` as the primary sort key instead of `(timestamp, tenant_id)`, and what happens to query performance when querying across all tenants?"*
2. *"How does ClickHouse handle deduplication in `ReplacingMergeTree`, and why does querying without `FINAL` occasionally return duplicate records?"*
3. *"How did your Node.js ingestion worker ensure zero event loss if the ClickHouse instance paused during a background part merge?"*

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs on 8GB RAM local machine with Docker.
2. **Does each performance target name its bottleneck and is reachable?** YES. Ingestion throughput (> 5,000 events/sec) bounded by batching buffer; query p95 (< 120ms) measured across 500,000 rows.
3. **Is there a CPU/local/free fallback?** YES. "Standalone single-binary ClickHouse local server without Kafka using an in-memory Node.js buffer queue".
4. **Can test data be created in minutes?** YES. Deterministic JavaScript synthetic telemetry generator producing 500,000 records with fixed seed 1337.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full test suite and dynamic tenant check in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. Batch ingestion write throughput without part errors, windowFunnel conversion latency, and columnar disk compression ratio from system.parts are specific to ClickHouse.
7. **Is every bullet claim verified by rubric?** YES. Ingestion throughput verified by Rubric Check 2; funnel query latency verified by Rubric Check 3; compression ratio verified by Rubric Check 4.
8. **Is there an anti-fake check?** YES. Rubric Check 5 [anti_fake] generates dynamic tenant ID and asserts live database mutations in ClickHouse query logs.
9. **Are all terms accurate?** YES. Accurately details columnar storage, ReplacingMergeTree, sparse primary indexes, and micro-batch flushes without buzzwords.
10. **Does problem statement promise only what is verified?** YES. Multi-tenant ingestion, compression, and vectorized analytical aggregations are directly implemented and tested.
11. **Are privacy and safety notes addressed?** YES. Strict synthetic user data policy forbidding real personal data.
12. **Are all hard parts technical?** YES. 4 detailed technical challenges covering part explosion, index ordering, deduplication overhead, and windowFunnel memory ceilings.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.42 / 10 (Band A)

### Change Log
- **Scope & Hours**: Recalculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split distributed multi-node clustering and AggregatingMergeTree materialized views to Extended Path (+14h).
- **Dataset Feasibility**: Resized dataset to 500,000 synthetic records with exact generator spec, keeping memory within 8GB laptop limits.
- **Scale Targets**: Replaced 3 vague targets with three 7-field targets (ingestion batch throughput, 3-step funnel p95 latency, and system.parts columnar compression).
- **Verification**: Added 5 concrete rubric checks including dynamic tenant anti-fake check.
- **Completeness**: Added complete Starter Input specification, 4 milestones summing to 29h, hardware specs, riskiest component fallback, and learning resources.
- **Resume Formula**: Structured with Google X-Y-Z formula using measured placeholders `[INGESTION_RATE]`, `[QUERY_LATENCY]`, `[DATASET_SIZE]`, and `[COMPRESSION_RATIO]` with strict "Do not claim" boundaries.
- **Unverified items ([VERIFY])**: None. All dependencies are open-source and run locally.
