# Audit & Diagnosis: brief-dist-rate-limiter

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

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and Redis at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Proxy latency overhead (< 3.0ms) and sliding-window limit accuracy (500 of 500) measured directly on local loopback.
3. **Is there a CPU/local/free fallback?** YES. In-memory Miniredis mock server if local Redis daemon cannot be run.
4. **Can test data be created in minutes?** YES. Synthetic 500-tenant configuration and load generator included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full benchmark suite and dynamic burst test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Rate limiting proxy overhead, sliding window limit enforcement accuracy, and circuit breaker failover are unique to rate limiters.
7. **Is every bullet claim verified by rubric?** YES. Overhead latency and quota accuracy verified by Checks 0 & 1; circuit breaker verified by Check 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic key with limit 10 and asserts 429 transition on exactly request 11.
9. **Are all terms accurate?** YES. Accurately covers sliding-window counters, token buckets, Redis Lua scripts, and circuit breakers.
10. **Does problem statement promise only what is verified?** YES. Reverse proxy, Redis Lua scripts, multi-tenant quotas, and circuit breaker fallback are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic API keys and simulated IP addresses.
12. **Are all hard parts technical?** YES. 4 technical challenges covering atomic Redis Lua scripting, sub-3ms overhead, circuit-breaker fallback, and RFC 6585 headers.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Redis cluster hash slot routing and gRPC interceptor to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic rate limiting metrics (proxy overhead latency, sliding-window enforcement accuracy, and circuit-breaker failover).
- Removed Banned Content: Removed 'top tech platforms' duplicate marketing and employer name-dropping.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic burst check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [P99_OVERHEAD] and [REQUEST_COUNT] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
