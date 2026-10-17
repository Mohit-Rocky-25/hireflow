# Audit & Diagnosis: brief-database-engine

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

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 41 hours (ADVANCED); runs locally on 8GB RAM CPU using C++ at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Point lookup latency (< 150us) and table scan throughput (> 25k records/s) measured directly on local CPU/SSD.
3. **Is there a CPU/local/free fallback?** YES. In-memory page simulation with standard POSIX file I/O.
4. **Can test data be created in minutes?** YES. Synthetic 100,000 record relational table generator included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full benchmark suite and dynamic crash test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. B-tree point lookup latency, Volcano iterator scan throughput, and ARIES crash recovery integrity are unique to storage engines.
7. **Is every bullet claim verified by rubric?** YES. Point lookup latency verified by Check 1; crash recovery verified by Check 2 & 4.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic uncommitted nonce, executes abrupt abort, and asserts zero leakage.
9. **Are all terms accurate?** YES. Accurately covers slotted pages, LRU-K buffer pools, B-tree node splits, and ARIES recovery.
10. **Does problem statement promise only what is verified?** YES. Disk manager, buffer pool, B-tree index, Volcano query engine, and WAL recovery are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic relational schemas; no personal data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering slotted-page compaction, concurrent B-tree node splits, WAL dirty frame flushing synchronization, and ARIES recovery.

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
- Scope & Hours: Calculated bottom-up using effort model (36 component hours * 1.15 buffer = 41 hours). Moved 2PL concurrency and cost-based optimizer to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic database internals metrics (point lookup latency, sequential scan throughput, and crash recovery rate).
- Removed Banned Content: Removed unsubstantiated claims regarding commercial database company readiness.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic abort test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [LOOKUP_LATENCY], [RECORD_COUNT], and [RECOVERY_RATE] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
