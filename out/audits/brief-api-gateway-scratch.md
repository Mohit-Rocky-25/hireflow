# Technical Audit: API Gateway from Scratch with Plugin Architecture
**Brief ID:** `brief-api-gateway-scratch`  
**Domain:** Distributed Systems  
**Reviewer:** Senior Engineering Educator & Technical Reviewer  

---

### A. Score Table

| Dimension | Score (0-10) | Reason & Direct Quotation |
| :--- | :---: | :--- |
| **Topic Value** | 9.0 | High-signal systems programming project; implements core networking primitives (reverse proxy, transport pooling, dynamic middleware chain). |
| **Verification Rubric** | 5.0 | Rubric items lack reproducible pass criteria and baselines: *"5. Benchmark showing < 5ms overhead vs direct upstream connection at 10k concurrent requests"* omits payload size, CPU environment, and measurement tool. |
| **Technical Accuracy** | 6.0 | Capped at 6.0: omits Go `http.Transport` connection pooling tuning (`MaxIdleConnsPerHost`) and memory boundaries on body transformations, which are fatal gotchas under 30k RPS. |
| **Scope Realism** | 5.0 | Capped at 4.0-5.0: Stated Est. Time is 25 hours, but Difficulty is ADVANCED (band is 30-60h). Honest true effort is 38h for a production-grade multi-plugin gateway. |
| **Completeness** | 4.0 | Capped at 5.0 (no deliverables AND no milestones). Lacks mock upstream test servers, seed route configurations, and hardware references. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 due to subjective market disparagement: *"Commercial API gateways (Kong, AWS API Gateway) are expensive and opaque"*, plus unsourced claims. |
| **Resume Bullet Safety** | 3.5 | Capped at 4.0 for pre-filled outcome claims: *"handling 30k req/sec with < 5ms proxy overhead"* and *"zero-downtime configuration reload"*. |

#### Arithmetic & Overall Score
- Weights: Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- Calculation:
  $$\text{Weighted Score} = (9.0 \times 0.10) + (5.0 \times 0.15) + (6.0 \times 0.20) + (5.0 \times 0.15) + (4.0 \times 0.15) + (4.0 \times 0.15) + (3.5 \times 0.10)$$
  $$\text{Weighted Score} = 0.90 + 0.75 + 1.20 + 0.75 + 0.60 + 0.60 + 0.35 = 5.15 / 10$$
- **Overall Score:** **5.15 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Metrics and Unverified Performance Claims**
   - *Quote:* `"Built plugin-based API Gateway in Go handling 30k req/sec with < 5ms proxy overhead; implemented dynamic plugin chain ... with zero-downtime configuration reload."`
   - *Why it matters:* Throughput and latency overhead depend on CPU core counts, network interface cards, and payload sizes. Claiming 30k RPS and < 5ms overhead before running local benchmarks on the student's hardware is indefensible.
   - *Fix:* Replace all fixed performance outcomes with standardized placeholders: `[N] req/sec`, `[M ms] overhead`, and `[X of Y]`.

2. **Subjective Commercial Market Disparagement**
   - *Quote:* `"Commercial API gateways (Kong, AWS API Gateway) are expensive and opaque."`
   - *Why it matters:* Violates the strict zero-marketing rule. Technical briefs should neutrally explain the architectural problem rather than making value judgments about commercial SaaS pricing.
   - *Fix:* Remove the disparaging commentary; state the technical objective objectively (decoupling cross-cutting networking concerns like authentication, routing, and rate-limiting from backend microservices).

3. **Inconsistent Difficulty Band vs. Estimated Time**
   - *Quote:* Difficulty: `ADVANCED`, Est. Time: `25 hours`.
   - *Why it matters:* The standardized effort band for ADVANCED projects is 30–60 hours. Implementing a low-level reverse proxy, dynamic atomic route reloading, token bucket rate limiting, weighted round-robin load balancing, and active health checks in 25 hours is severely under-scoped.
   - *Fix:* Recalculate true effort using the standardized effort model and adjust Core Path to 38 hours.

4. **Missing Starter Mock Upstreams and Test Fixtures**
   - *Quote:* `"distribute requests across 3 upstreams and auto-remove failed one"`
   - *Why it matters:* Students need deterministic mock upstreams with configurable latency and error injection to test failover and load balancing reliably.
   - *Fix:* Add a mandatory `TARGET APPLICATION / STARTER INPUT` specifying a lightweight mock upstream HTTP service with chaos endpoints (`/health`, `/slow`, `/fault`).

---

### C. Hidden Hard Parts

1. **Go `http.Transport` Socket Exhaustion:** The default `http.DefaultTransport` in Go sets `MaxIdleConnsPerHost = 2`. When routing thousands of concurrent requests to an upstream, Go opens a new TCP connection for every request and immediately closes it, creating thousands of sockets in `TIME_WAIT` status and crashing the gateway with `connection reset by peer` or `too many open files`.
2. **Atomic Hot-Reloading Without Race Conditions:** Modifying route tables or plugin pipelines while hundreds of worker goroutines are actively routing requests will trigger Go runtime data races unless protected by an atomic pointer swap (`atomic.Pointer[RouteTable]`) or copy-on-write `sync.RWMutex`.
3. **Memory Exhaustion on Unbounded Request Transformation:** If a transformation plugin reads the entire request body (`io.ReadAll(req.Body)`) without enforcing `http.MaxBytesReader`, malicious or oversized requests will cause out-of-memory (OOM) crashes.

---

### D. Interviewer Probes

1. *"How did you configure your Go `http.Transport` (`MaxIdleConns`, `MaxIdleConnsPerHost`, `IdleConnTimeout`) to prevent socket exhaustion under high load?"*
2. *"How does your configuration reloader ensure zero race conditions when thousands of goroutines are simultaneously reading route rules?"*
3. *"What happens if an upstream service takes 30 seconds to respond? How does your gateway handle request cancellation when the downstream client disconnects?"*

---

### E. What's Good

- Excellent systems architecture scope: combines reverse proxying, load balancing, dynamic middleware, and metrics.
- Idiomatic Go problem space: Go's lightweight goroutines and standard `net/http/httputil.ReverseProxy` make it the ideal language for understanding gateway internals.
- Active health checking and weighted round-robin: directly mirrors Envoy and Nginx routing patterns.

---

### F. Estimated True Effort

Applying the standardized Effort Model:
- Repository setup, Go tooling, and mock upstream cluster (Docker Compose): **4.0h**
- Core reverse proxy engine with custom `http.RoundTripper` and connection pool tuning: **7.0h**
- Extensible plugin pipeline interface with Token Bucket rate limiter & auth plugin: **7.0h**
- Admin REST API with atomic pointer hot-reloading: **6.0h**
- Upstream pool management with weighted round-robin and active background health checker: **5.0h**
- Prometheus metrics exporter (`latency_seconds`, `requests_total`) and benchmark harness: **5.0h**
- Documentation, architecture diagrams, and screener verification script: **4.0h**
- **Subtotal:** **38.0h**
- **Debug & tuning buffer (included within milestones):** fits within the **38-hour** Advanced band (30–60h).
