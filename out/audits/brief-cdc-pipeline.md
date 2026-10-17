# Audit & Diagnosis: brief-cdc-pipeline

- **Old Title**: Change Data Capture (CDC) & Event Sourcing Pipeline
- **Domain**: Data Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of actual code; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 4.5 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 4.0 / 10 (banned marketing: 'LinkedIn, top tech platforms', 'table stakes for senior data', 'explicitly listed in JDs')
- Resume Bullet Safety: 4.0 / 10 (syntax glitch: 'at [N] req/sec events/sec with exactly-once guarantees')
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CDC pipeline using HTTP endpoint benchmarking rather than replication freshness lag and capture throughput.
2. **Circular rubric pass lines**:
   > "1. Verify database INSERT/UPDATE/DELETE replicated to Elasticsearch within 500ms; passes when verified by automated test script or benchmark log."
3. **Syntax glitch in resume bullet**:
   > "within [M ms] at [N] req/sec events/sec with exactly-once guarantees."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs locally using Docker Compose on 8GB RAM at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Sync freshness latency (< 1,500ms) and capture throughput (> 1,000 events/sec) measured across 1,000 synthetic mutations.
3. **Is there a CPU/local/free fallback?** YES. Local SQLite WAL mock pipeline without Docker if container memory is restricted.
4. **Can test data be created in minutes?** YES. E-commerce product catalog SQL migration and mutation scripts provided.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full pipeline tests and dynamic record validation in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. Write-ahead log propagation latency, idempotent deduplication, and CDC record throughput are unique to change data pipelines.
7. **Is every bullet claim verified by rubric?** YES. Freshness verified by Check 1 & 3; throughput verified by Check 3; deduplication verified by Check 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] generates dynamic product SKU at runtime and verifies live search index reflection.
9. **Are all terms accurate?** YES. Accurately details logical decoding, write-ahead logging, Debezium connectors, and idempotent consumer upserts.
10. **Does problem statement promise only what is verified?** YES. PostgreSQL WAL capture, Kafka streaming, and idempotent search indexing are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic product catalog data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering replication slot disk management, consumer deduplication, schema evolution, and event ordering.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.43 / 10 (Band A)

### Change Log
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split transactional outbox router and Schema Registry to Extended Path (+14h).
- Target Realism: Replaced copied web-service targets with genuine CDC metrics (end-to-end sync freshness latency, idempotent deduplication, and capture throughput).
- Removed Banned Content: Removed LinkedIn and 'top tech platforms' marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic mutation check.
- Resume Formula: Fixed syntax glitch ('[N] req/sec events/sec') into clean placeholders [P95_LATENCY], [THROUGHPUT_RATE], and [EVENT_COUNT] with 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
