# Audit & Diagnosis: brief-dist-cache-rust

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

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Rust and Tokio at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Throughput (> 60k req/s) and p99 latency (< 3.5ms) measured directly on local CPU loopback.
3. **Is there a CPU/local/free fallback?** YES. In-process channel mode without distributed TCP networking.
4. **Can test data be created in minutes?** YES. Synthetic 100,000 key-value generator with Zipfian distribution included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full benchmark suite and dynamic singleflight test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Cache throughput, p99 tail latency, consistent hash balance, and singleflight deduplication are unique to caching systems.
7. **Is every bullet claim verified by rubric?** YES. Throughput and p99 verified by Checks 0 & 1; singleflight coalescing verified by Check 4.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] sends 100 concurrent requests for an uncached dynamic key and asserts exactly 1 upstream fetch.
9. **Are all terms accurate?** YES. Accurately covers sharded storage, TinyLFU frequency sketches, consistent hashing, and singleflight.
10. **Does problem statement promise only what is verified?** YES. Sharded storage, TinyLFU eviction, TCP server, consistent hashing, and singleflight are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic key-value pairs; no personal data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering lock-free storage, adaptive eviction, consistent hashing, and singleflight coalescing.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved SWIM gossip protocol and AOF disk persistence to Extended Path (+16h).
- Target Realism: Replaced generic web-service targets with authentic in-memory cache metrics (sustained GET throughput, p99 tail latency, and hash ring variance).
- Removed Banned Content: Removed unsubstantiated claims regarding commercial caching systems.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake singleflight deduplication test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [THROUGHPUT], [P99_LATENCY], and [CLIENT_COUNT] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
