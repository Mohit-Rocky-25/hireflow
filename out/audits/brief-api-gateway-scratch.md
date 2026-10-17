# Audit & Diagnosis: brief-api-gateway-scratch

## 1. Old Brief Diagnosis
- **Old Title**: API Gateway from Scratch with Plugin Architecture
- **Domain**: Distributed Systems
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation, but inflated with unverified scale claims ("10k concurrent requests", "25k req/sec" on local laptop).

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 4.5 / 10 (missing 5 fields, no anti-fake check)
- Technical Accuracy: 5.5 / 10 (10k concurrent requests causes ephemeral port exhaustion on laptop loopback; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.5 / 10 (exaggerated local concurrency numbers)
- Resume Bullet Safety: 6.0 / 10 (missing "Do not claim" line, placeholder mismatch)
- **Old Weighted Score**: 5.68 / 10 (Band C)

### Problems Found (with exact quotes)
1. **Unrealistic local concurrency claims**:
   > "Proxy Latency Overhead: p99 overhead < 5ms under 10k concurrent requests | Sustained Throughput: > [N] req/sec sustained (target 25k req/sec)"
   *Flaw*: Spawning 10,000 concurrent TCP sockets over localhost loopback on macOS or Windows WSL2 rapidly exhausts default ulimits (typically 1024 or 4096 file descriptors) and triggers ephemeral port exhaustion. A realistic benchmark targets 200-500 concurrent connections sustaining 2,000 to 5,000 req/sec.
2. **Missing operational sections**:
   *Flaw*: Missing `TARGET APPLICATION / STARTER INPUT`, `MILESTONES`, `DELIVERABLES`, `PREREQUISITES, ENVIRONMENT AND ACCOUNTS`, `OUT OF SCOPE`, and `LEARNING RESOURCES`.
3. **Only one technical challenge listed**:
   > "WHY THIS IS HARD (COMPETENCY REDUCER): TCP Connection Pooling & File Descriptor Leaks: Default HTTP transports restrict concurrent connections per upstream host (MaxIdleConnsPerHost = 2)..."
   *Flaw*: Connection pooling is essential, but lock-free hot reload without dropping in-flight requests, memory recycling with `sync.Pool`, and health check flapping mitigation are equally critical systems challenges.
4. **Vulnerable to mocked rubric checks**:
   *Flaw*: Checks like "Verify HTTP GET /api/users proxies successfully and returns HTTP 200 with X-Gateway-Proxy: true" could be faked by a static Go server that returns hardcoded headers without actual proxying or load balancing.

### Hidden Hard Parts
1. **Socket reuse and TIME_WAIT saturation**: High-throughput reverse proxying without connection pool tuning creates thousands of short-lived sockets in TIME_WAIT state, exhausting local ports within seconds.
2. **Lock-free route hot-reloading**: Updating route tables during live traffic without mutex contention or memory races requires atomic snapshot swapping with `sync/atomic.Pointer`.
3. **Garbage collection pause reduction**: Allocating new byte buffers and header maps per request causes GC latency spikes; high-performance proxies reuse buffers via `sync.Pool`.
4. **Upstream health flapping**: Network jitter or temporary timeouts can cause rapid oscillation between healthy and dead states unless hysteresis thresholds are enforced.

### 3 Interviewer Questions a Student Following the Old Brief Could Not Answer
1. *"How did you implement route table hot-reloading so that in-flight requests were not dropped or corrupted when the configuration changed?"*
2. *"Why did your reverse proxy use `sync.Pool`, and how did you verify that byte buffers were safely returned without memory corruption?"*
3. *"What happens to TCP connections when an upstream server abruptly crashes, and how did your gateway prevent cascading client timeouts?"*

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 34 hours (ADVANCED band); environment requires only local 4-core CPU, 8GB RAM, and Go with Docker at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Latency overhead measured under 2,000 req/sec over loopback; hot-reload stability measured across 10,000 consecutive requests.
3. **Is there a CPU/local/free fallback?** YES. "Run mock upstreams directly as background Go processes on localhost ports without Docker".
4. **Can test data be created in minutes?** YES. Multi-instance mock Go backend server with 10 synthetic endpoints.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full test suite and dynamic upstream verification in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. Reverse proxy tail latency overhead, atomic hot-reload stability, and failover convergence time are specific to API gateway infrastructure.
7. **Is every bullet claim verified by rubric?** YES. Proxy throughput verified by Check 1 & benchmark; hot-reload verified by Check 2; failover verified by Check 4.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] starts a dynamic mock upstream on a random port at runtime and verifies routing registration and header mutation.
9. **Are all terms accurate?** YES. Accurately details atomic pointers, sync.Pool buffer recycling, connection pooling, and health check flapping without buzzwords.
10. **Does problem statement promise only what is verified?** YES. Reverse proxying, atomic routing, middleware plugin pipeline, and active load balancing are all built and measured.
11. **Are privacy and safety notes addressed?** YES. Strict synthetic token and mock payload entity policy forbidding real credentials.
12. **Are all hard parts technical?** YES. 4 detailed technical challenges covering socket exhaustion, atomic pointer swapping, buffer recycling, and upstream flapping.

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
- **Scope & Hours**: Recalculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split distributed Redis cluster rate limiting, automated ACME/TLS, and WebAssembly plugin engine to Extended Path (+15h).
- **Feasible Scale Targets**: Calibrated targets to 2,000 req/sec on local hardware, replacing unfeasible 10k/25k claims that exhaust OS socket descriptors.
- **Verification**: Added 5 concrete rubric checks including dynamic upstream anti-fake check.
- **Completeness**: Added complete Starter Input specification, 4 milestones summing to 34h, hardware specs, riskiest component fallback, and learning resources.
- **Resume Formula**: Structured with Google X-Y-Z formula using measured placeholders `[PROXY_THROUGHPUT]`, `[P99_OVERHEAD]`, and `[FAILOVER_TIME]` with strict "Do not claim" boundaries.
- **Unverified items ([VERIFY])**: None. All dependencies are open-source and run locally.
