# Knowledge Base: Distributed Rate Limiter & Token Bucket Gateway

## Competency Tags
- `backend`: depth 3 (designed high-throughput Go reverse proxy and gRPC interceptors verified under load)
- `distributed-systems`: depth 3 (designed multi-replica distributed quota coordination backed by atomic Redis state)
- `performance`: depth 3 (engineered < 3.5ms p99 proxy overhead at 25,000 req/sec sustained throughput)
- `testing`: depth 3 (automated concurrent race-condition validation, fault-injection tests, and load benchmarks)
- `system-design-writeup`: depth 3 (complete formal specifications, sequence flows, failure matrices, and mathematical bounds)
- `sync-and-consistency`: depth 2 (applied atomic Lua execution eliminating check-then-act concurrency bugs)
- `api-design`: depth 2 (applied standard HTTP rate limiting headers and gRPC status code semantics)
- `caching`: depth 2 (applied Redis ephemeral TTL state management with memory optimization)
- `observability`: depth 2 (applied Prometheus telemetry exporting tenant and status counters)
- `devops-docker`: depth 2 (applied containerized multi-node topology with health checks and volume isolation)
- `security-auth`: depth 1 (used tenant API-key extraction for quota domain partitioning)

---

## Core Concepts

### 1. Token Bucket Algorithm
- **What it is**: An algorithm maintaining a bucket with a fixed capacity $C$ that continuously fills with tokens at a constant rate $r$ (tokens/sec). Each incoming request consumes $k$ tokens (typically 1). If sufficient tokens exist, the request proceeds; otherwise, it is rejected.
- **Why it matters here**: It allows controlled bursts of traffic (up to capacity $C$) while strictly bounding sustained throughput to $r$, perfectly modeling real-world API traffic spikes.
- **When NOT to use it**: When burstiness is strictly forbidden and traffic must be smoothed out to an exact uniform interval (use Leaky Bucket / Traffic Shaping instead), or when windowed aggregations are required across calendar boundaries (use Sliding Window Counter).

### 2. Atomic Redis Lua Scripts (`EVALSHA`)
- **What it is**: Server-side Lua scripts executed atomically within the Redis single-threaded execution context, guaranteeing that no other command runs between the read and write phases.
- **Why it matters here**: In a distributed environment, a naive "read token count from Redis, decrement in Go, write back to Redis" introduces a classic check-then-act race condition under concurrent requests. Lua ensures 100% atomicity without distributed locks.
- **When NOT to use it**: For long-running computations, heavy disk operations, or multi-shard queries across Redis Cluster without shared hash tags, as blocking Redis stops all other tenant operations.

### 3. Fail-Open vs Fail-Closed Circuit Breaking
- **What it is**: The operational stance assumed when the centralized rate-limiting datastore experiences failure, partitions, or timeouts. Fail-Open admits traffic with warning headers; Fail-Closed drops all unverified traffic.
- **Why it matters here**: An API gateway rate limiter sits in the critical hot path of every request. If Redis becomes unreachable, failing closed takes down the entire business. Failing open degrades protection but keeps customer transactions flowing.
- **When NOT to use it**: For high-cost or safety-critical APIs (e.g., LLM inference billing or financial disbursements) where un-metered usage creates immediate direct financial liability; there, Fail-Closed is mandatory.

---

## Architectural Decision Records (ADRs)

### ADR-01: Redis Lua Script vs. Redis Transactions (`WATCH`/`MULTI`/`EXEC`)
- **Option A**: Optimistic Locking with Redis `WATCH`, `MULTI`, and `EXEC`.
- **Option B**: Atomic Server-side Lua Script via `EVALSHA`.
- **Option C**: Distributed Mutexes via Redlock.
- **Tradeoffs**:
  - `WATCH`/`MULTI`/`EXEC` aborts transactions when another client modifies the watched key, forcing retry loops in Go proxy workers. Under 25,000 req/sec contention on a hot tenant key, abort rates exceed 80%, devastating latency and CPU.
  - Redlock introduces multiple network round-trips per request, introducing 10–30ms of latency overhead.
  - Lua scripts run atomically in a single Redis turn with zero network round-trip retries.
- **Choice Made**: **Option B (Lua Script)**.
- **Rationale**: Delivers deterministic $O(1)$ execution time (< 1ms), zero abort-retry storms, and completely eliminates check-then-act race conditions.

### ADR-02: Algorithmic Token Refill Model
- **Option A**: Background cron/ticker pushing tokens into Redis hashes every second.
- **Option B**: Lazy time-delta calculation on ingress request evaluation.
- **Option C**: Redis Sorted Set (ZSET) timestamp sliding window log.
- **Tradeoffs**:
  - Background tickers create enormous $O(N)$ write overhead as tenant count grows, even for inactive tenants.
  - ZSET sliding window logs store one member per request timestamp, consuming huge RAM under 25,000 req/sec ($O(\text{request count})$ memory).
  - Lazy time-delta computes `tokens = min(capacity, current_tokens + (now - last_ts) * refill_rate)` inside the Lua script on-demand ($O(1)$ memory, only storing 2 numbers per key).
- **Choice Made**: **Option B (Lazy time-delta calculation)**.
- **Rationale**: Minimal memory footprint (~120 bytes per tenant) and zero background maintenance loops.

---

## Common Pitfalls & Detection Guide

| Pitfall | Impact | How to Detect & Verify |
| :--- | :--- | :--- |
| **Check-then-Act Race in Go** | Reading Redis token count in Go and issuing separate `DECRBY`. Causes massive over-quota allocation under concurrent load. | Run `go test -race` with 100 concurrent goroutines; check if total granted tokens exceed bucket capacity. |
| **Unbounded Redis Memory Growth** | Creating rate limit keys per IP/tenant without Redis TTL expiry, causing Redis Out-Of-Memory (OOM). | Inspect Redis memory via `redis-cli info memory` and verify that every key written has a TTL (`redis-cli ttl rate:tenant:xyz > 0`). |
| **Blocking Redis with `EVAL` instead of `EVALSHA`** | Sending raw Lua script strings on every request wastes network bandwidth and CPU re-compiling the script. | Monitor Redis `redis-cli monitor` or metrics; verify proxy computes SHA1 at boot and dispatches `EVALSHA`. |
| **Clock Skew Inconsistency** | Using local proxy host system clocks instead of Redis server time (`TIME`), causing drifting refill calculations across proxy nodes. | Run proxy nodes with synthetically drifted local clocks; check Redis Lua `redis.call('TIME')` usage. |
| **Cascade Outage on Redis Downtime** | Proxy hangs on blocking Redis I/O during network partitions, exhausting Go connection pools and upstream sockets. | Stop Redis container and assert that proxy response latency stays < 20ms and returns `X-RateLimit-Degraded: true`. |
| **Missing Standard HTTP Headers** | Clients have no visibility into remaining quota or reset times, prompting clients to aggressively retry immediately. | Automated curl header assertion checking for `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. |

---

## Glossary
- **Token Bucket**: An algorithmic rate limiting model where tokens accumulate at a fixed rate up to a finite burst capacity.
- **Lua Script (`EVALSHA`)**: A pre-compiled programmatic script executed atomically on Redis server-side to guarantee linearizable state mutations.
- **Fail-Open**: An availability-first resilience strategy where a downstream validation failure defaults to permitting traffic.
- **Check-Then-Act**: A concurrency vulnerability where a condition is verified in one step, but state changes before the subsequent action occurs.
- **Ingress Gateway**: An edge reverse proxy tier handling incoming client connections, routing, and access control.
- **p99 Latency**: The 99th percentile response time, indicating that 99% of requests completed faster than this threshold.

---

## Interview Questions & Short Model Answers

1. **How do you prevent race conditions when multiple proxy nodes decrement the same rate-limit counter in Redis?**  
   *Model Answer*: We avoid read-then-write cycles in the application tier by pushing the calculation into an atomic Redis Lua script. Because Redis executes scripts in a single-threaded event loop without interleaving commands, the token calculation and balance decrement happen atomically.

2. **What is the difference between a Token Bucket and a Leaky Bucket algorithm?**  
   *Model Answer*: A Token Bucket permits bursts of traffic up to the bucket capacity while maintaining a long-term average refill rate. A Leaky Bucket enforces a strictly uniform outbound flow rate, queuing or dropping bursts to smooth traffic completely.

3. **Why is Redis `WATCH`/`MULTI`/`EXEC` problematic under high concurrency for rate limiting?**  
   *Model Answer*: `WATCH` employs optimistic concurrency. When 500 requests arrive concurrently for the same key, only 1 transaction succeeds while 499 fail with transaction aborts, triggering massive client retries and thrashing CPU. Lua scripts eliminate aborts by executing atomically in order.

4. **How would you scale this rate limiter if a single Redis instance becomes the CPU bottleneck?**  
   *Model Answer*: We partition rate limit keys across a Redis Cluster using consistent hashing on `{tenant_id}` hash tags (e.g., `{tenant_123}:limiter`). This ensures each tenant's state remains isolated to a single shard, distributing load evenly across cluster nodes.

5. **What happens when Redis experiences a network partition? What is the tradeoff?**  
   *Model Answer*: We implement a configurable circuit breaker with a 10ms timeout. In high-traffic SaaS endpoints, we default to Fail-Open: traffic is permitted with degraded warning headers to prioritize service availability over strict quota enforcement. For billing APIs, we toggle to Fail-Closed.

6. **How do you calculate continuous token refill without running a background timer for every tenant?**  
   *Model Answer*: We use lazy time-delta replenishment. Each key stores `tokens` and `last_updated_epoch_ms`. When a request arrives, the Lua script computes $\Delta t = \text{now} - \text{last\_updated}$, adds $\Delta t \times r$ tokens (capped at capacity), and updates the timestamp in the same atomic call.

7. **How do you prevent a malicious tenant from causing Redis Out-Of-Memory (OOM) via cardinality explosion?**  
   *Model Answer*: Every key set in the Lua script is written with an explicit TTL (e.g., 3600 seconds). If a tenant becomes inactive, their key automatically expires and is evicted by Redis, bounding active memory to active tenants.

8. **How do you verify that the proxy overhead does not degrade upstream API performance?**  
   *Model Answer*: We benchmark the mock upstream directly to establish a baseline, then execute k6 through the proxy at 25,000 RPS. By subtracting upstream duration from the total `http_req_duration{p(99)}`, we isolate the exact proxy processing overhead.

---

## Further Reading
- Redis Official Documentation: Redis Programmability and Lua Scripting. [Verify link: https://redis.io/docs/manual/programmability/eval-intro/]
- IETF Draft: RateLimit Header Fields for HTTP (draft-ietf-httpapi-ratelimit-headers). [Verify link: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/]
- Stripe Engineering: Scaling your API with rate limiters. [Verify link: https://stripe.com/blog/rate-limiters]
- Martin Kleppmann: Designing Data-Intensive Applications (Chapter 7: Transactions and Concurrency Control). [Verify link: https://dataintensive.net/]
