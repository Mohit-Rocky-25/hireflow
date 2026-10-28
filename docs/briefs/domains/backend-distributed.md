# Distributed Systems & High-Scale Backend Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Assuming network**: Assuming network calls never fail (fallacies of distributed computing).
2. **Dual writes**: Dual writes between relational databases and message brokers without transactional outbox or CDC.
3. **Naive in-memory**: Naive in-memory rate limiters that break across multi-instance load balanced deployments.
4. **Unbounded Redis**: Unbounded Redis connection pools exhausting socket file descriptors during traffic surges.
5. **Sagas lacking**: Sagas lacking idempotent compensation handlers, leading to double-refunds on retry.

## 2. Authoritative Reference Sources
- RFC 9112 (HTTP/1.1 Semantics and Content)
- RFC 8941 (Structured Field Values for HTTP)
- Martin Kleppmann, Designing Data-Intensive Applications (O'Reilly)
- Apache Kafka Documentation (Transactional Messaging & Exactly-Once Semantics)
- Redis Documentation (Atomic Transactions & Lua Scripting Guidelines)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify that all mutation endpoints enforce idempotency keys with atomic locks (SETNX or DB unique constraint).
- [ ] **Check 2:** Verify that distributed transactions implement either 2PC or Saga with idempotent compensating transactions.
- [ ] **Check 3:** Assert tail latency metrics (p95/p99) specify concurrent connection count and execution duration.
- [ ] **Check 4:** Ensure circuit breakers define failure percentage thresholds, cooldown intervals, and half-open states.
