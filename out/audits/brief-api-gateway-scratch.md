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
| **Technical Accuracy** | 6.0 | Capped at 6.0: omits Go `http.Transport` connection pooling tuning (`MaxIdleConnsPerHost`) and memory boundaries on body transformations, which are fatal gotchas under high concurrent RPS. |
| **Scope Realism** | 5.0 | Capped at 5.0: Stated Est. Time was 25 hours, but Difficulty is ADVANCED (band is 30-60h). Honest true effort is 38h for a production-grade multi-plugin gateway. |
| **Completeness** | 4.0 | Capped at 5.0 (no deliverables AND no milestones). Lacks mock upstream test servers, seed route configurations, and hardware references. |
| **Honesty of Claims** | 4.0 | Capped at 4.0 due to subjective market disparagement: *"Commercial API gateways (Kong, AWS API Gateway) are expensive and opaque"*, plus unsourced claims. |
| **Resume Bullet Safety** | 3.5 | Capped at 4.0 for pre-filled outcome claims: *"handling 30k req/sec with < 5ms proxy overhead"* and *"zero-downtime configuration reload"*. |

#### Arithmetic & Overall Score
- **Weights:** Topic (10%), Rubric (15%), Tech Accuracy (20%), Scope Realism (15%), Completeness (15%), Honesty (15%), Resume Safety (10%)
- **Calculation:**
  $$\text{Weighted Score} = (9.0 \times 0.10) + (5.0 \times 0.15) + (6.0 \times 0.20) + (5.0 \times 0.15) + (4.0 \times 0.15) + (4.0 \times 0.15) + (3.5 \times 0.10)$$
  $$\text{Weighted Score} = 0.90 + 0.75 + 1.20 + 0.75 + 0.60 + 0.60 + 0.35 = 5.15 / 10$$
- **Overall Score:** **5.15 / 10**
- **Band:** **D (< 5.5)**

---

### B. Serious Problems

1. **Pre-filled Metrics and Unverified Performance Claims**
   - *Quote:* `"Built plugin-based API Gateway in Go handling 30k req/sec with < 5ms proxy overhead; implemented dynamic plugin chain ... with zero-downtime configuration reload."`
   - *Why it matters:* Throughput and latency overhead depend on CPU core counts, network interface cards, and payload sizes. Claiming 30k RPS and < 5ms overhead before running local benchmarks on the student's hardware is indefensible.
   - *Fix:* Replace all fixed performance outcomes with standardized placeholders: `[N] req/sec`, `[M ms] overhead`, and `[X of Y]`. Add strict "Do not claim" line.

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
- **Total Core Path Effort:** **38.0 hours** (fits Advanced band: 30–60h).

---

### G. Feasibility Check

1. **Can a student with stated prerequisites finish CORE PATH in Est. Time on a normal personal laptop or free cloud tier?**  
   **YES.** Go compiles to native standalone binaries in seconds; mock upstreams and gateway run locally with minimal memory footprint (< 100MB RAM).
2. **Does each performance target name its bottleneck and is it reachable on reference environment?**  
   **YES.** Bottlenecks are OS ephemeral port availability and CPU context switching. Tuned connection pooling reaches 10k-25k RPS on a modern 4-core CPU over loopback.
3. **Does the project need paid services, licensed data, restricted APIs, GPU, root access, or specific OS?**  
   **NO.** Built exclusively using Go standard library (`net/http`) and open-source Docker/Prometheus.
4. **Can the student create test data or starter input in minutes?**  
   **YES.** Provided via a lightweight Go mock upstream server (`cmd/mock_upstream/main.go`) with configurable latency and error routes.
5. **Can a screener check every rubric item in under 10 minutes without student machine access?**  
   **YES.** Screener runs `go test -v ./...` and `bash scripts/verify_gateway.sh` which executes route tests, hot-reload PUT, and failover validation in < 2 minutes.
6. **Which one component is most likely to blow the budget, and what is the written fallback?**  
   **Component:** Complex dynamic shared-library (`.so`) plugin loading.  
   **Fallback:** Implement plugins as compile-time Go interfaces chained in request pipeline; avoid OS CGO `.so` dynamic loading complexity.
7. **Could the result be faked?**  
   **YES.** Student could hardcode a 200 OK proxy response without actually proxying upstream.  
   **Countermeasure:** Rubric requires injecting dynamic header `X-Upstream-Instance-ID` from mock backend and verifying round-robin distribution.
8. **Do licenses, terms of service, data protection, or safety matter?**  
   **YES.** Clear warning that gateway must run only on loopback (`127.0.0.1`) during testing to prevent exposing open proxies to public networks.

---

### H. Change Log

- **Header:** Difficulty retained as ADVANCED; Est. Time upgraded from 25h to 38h (Core Path) to honestly reflect Advanced band standards. Extended path (+6h) noted for distributed Redis cluster plugin.
- **Tech Stack:** Annotated Go, net/http, Prometheus, Docker, JSON, and Concurrency with precise functional roles.
- **Problem Statement:** Removed subjective commercial SaaS pricing critique; focused on networking cross-cutting concerns, proxy latency, and connection reuse.
- **Use Cases:** Replaced claims with 3 neutral architectural examples (Envoy, Apache APISIX, Traefik).
- **Why This Is Hard:** Added specific technical coverage of Go `http.Transport` connection exhaustion (`TIME_WAIT` saturation) and atomic pointer hot-reload race prevention.
- **Recruiter Signal:** Replaced vague assertions with specific systems engineering job families (Platform Engineer, Cloud Infrastructure Engineer).
- **Architecture:** Documented `atomic.Pointer` swap mechanism for zero-downtime routing table mutation, along with tuned pool constants (`MaxIdleConns: 1000, MaxIdleConnsPerHost: 200`).
- **Scale & Performance Targets:** Converted to the mandatory 7-field table format covering Proxy Latency Overhead, Sustained Throughput, and Failover Duration.
- **Added Required Sections:** TARGET APPLICATION / STARTER INPUT, MILESTONES (38h sum), PREREQUISITES, ENVIRONMENT AND ACCOUNTS, DELIVERABLES, OUT OF SCOPE AND EXTENDED PATH, SAFETY AND ETHICS NOTE, LEARNING RESOURCES.
- **Verification Rubric:** Overhauled into 5 distinct, single-check verifiable items with exact curl commands and anti-fake round-robin assertions.
- **Resume Bullet:** Replaced hardcoded numbers with standard Google XYZ bracketed placeholders (`[N]`, `< [M ms]`, `[S]`) and added "Do not claim" line.
- **Verification Tagged Items:** `[VERIFY]` Go standard library `httputil.ReverseProxy.ErrorHandler` cancellation propagation semantics in Go 1.21+.

---

### I. Self-Check

- [x] All original headings present, in order; footer present; clean text with no casing glitches, duplicated words, or stray punctuation: **PASS**
- [x] Resume bullet: one sentence; no digits, percent signs, or outcome words outside placeholders; "Do not claim" line present: **PASS**
- [x] Every tool is in Tech Stack with a role; every Tech Stack item is used somewhere; concepts in Skills: **PASS**
- [x] Every Skills item is exercised in architecture, milestones, or rubric: **PASS**
- [x] Milestone hours sum exactly to Est. Time (38h); fits Advanced band (30-60h); Extended path specified (+6h): **PASS**
- [x] Every target has all seven fields, is specific to this project, and has no absolute claims: **PASS**
- [x] Same numbers in Targets, Rubric, and Bullet placeholders: **PASS**
- [x] Rubric has 5 single-check items with input, action, expected result, evidence location, and concrete pass criterion: **PASS**
- [x] Every claim in the bullet is verified by a rubric item; anti-fake round-robin header check included: **PASS**
- [x] No statistics, salaries, growth claims, employer claims, or invented URLs: **PASS**
- [x] A reference environment and fallback path are stated: **PASS**
- [x] A starter application/dataset spec exists; deliverables and milestones exist: **PASS**
- [x] Terms are accurate; problem statement promises only what is built and verified: **PASS**
- [x] Core idea and domain unchanged: **PASS**
- [x] Every [VERIFY] is listed in the change log: **PASS**

---

### J. Re-Score of Improved Brief

| Dimension | Score (0-10) | Evaluation of Improved Brief |
| :--- | :---: | :--- |
| **Topic Value** | 9.2 | High-leverage systems and distributed networking project. |
| **Verification Rubric** | 9.2 | 5 single-check items testing proxying, hot-reload, rate limiting, upstream failover, and latency overhead. |
| **Technical Accuracy** | 9.2 | Fully details `http.Transport` connection reuse, `atomic.Pointer` swap, and body memory ceilings. |
| **Scope Realism** | 9.0 | Upgraded to honest 38h effort band with precise milestone breakdown. |
| **Completeness** | 9.5 | All 14 standard sections populated with mock upstream specs, fallbacks, and deliverables. |
| **Honesty of Claims** | 9.5 | Zero market disparagement, zero salary claims, all numbers properly bracketed. |
| **Resume Bullet Safety** | 9.5 | Single sentence, strict placeholders only, explicit "Do not claim" boundaries. |

#### Re-Score Arithmetic
$$\text{Weighted Score} = (9.2 \times 0.10) + (9.2 \times 0.15) + (9.2 \times 0.20) + (9.0 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.15) + (9.5 \times 0.10)$$
$$\text{Weighted Score} = 0.92 + 1.38 + 1.84 + 1.35 + 1.425 + 1.425 + 0.95 = 9.29 / 10$$
- **Improved Score:** **9.29 / 10**
- **Band:** **A (>= 8.5)**
- *Note: This re-score is a structured self-assessment against the standardized technical review rubric.*
