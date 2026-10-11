# Screener Rubric: Distributed Rate Limiter & Token Bucket Gateway

## Reviewer Quick Path (5-Minute Evaluation)
Run `./scripts/verify.sh` inside the project root; this script boots `docker compose`, seeds rules, executes unit and concurrency tests, runs a 30s k6 load test, stops Redis to assert the fail-open fallback, scrapes Prometheus, and outputs a consolidated `PASS/FAIL` audit summary to terminal in under 4 minutes.

---

## Rubric Items Table

| ID | Criterion | Verification Method (Command / Steps) | Pass Threshold | Evidence Artifact | Weight | Machine Verifiable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RUB-01** | Multi-Container Orchestration (`Docker`) | `docker compose up -d && docker compose ps --format json` | All 5 containers (`proxy-1`, `proxy-2`, `redis`, `mock-upstream`, `prometheus`) report status `healthy`/`running`. | `artifacts/docker_ps.json` | 10% | Yes |
| **RUB-02** | Concurrency & Zero-Leakage Data Integrity (`Redis`, `Go`) | `go test -v -run TestConcurrentAtomicTokenConsumption ./pkg/limiter` | 50 concurrent worker goroutines competing for 1,000 tokens consume exactly 1,000 with 0 balance leakage or negative balance. Exit code 0. | `artifacts/concurrency_test.log` | 20% | Yes |
| **RUB-03** | HTTP Ingress & Header Compliance (`Go`) | `curl -s -D artifacts/http_headers.txt http://localhost:8080/v1/payments/charge -H "X-API-Key: tenant_fintech_alpha"` | HTTP 200 with headers `X-RateLimit-Limit: 500`, `X-RateLimit-Remaining: 499`, and `X-RateLimit-Reset`; exhaustion returns HTTP 429. | `artifacts/http_headers.txt` | 15% | Yes |
| **RUB-04** | gRPC Unary Interceptor Enforcement (`gRPC`, `Go`) | `grpcurl -plaintext -H "x-tenant-id: tenant_fintech_alpha" localhost:50051 payment.PaymentService/ProcessPayment` | Permits request under quota; upon exhaustion returns gRPC error code `8` (`ResourceExhausted`) with descriptive metadata. | `artifacts/grpcurl_output.txt` | 15% | Yes |
| **RUB-05** | Failure-Mode Resilience & Circuit Breaking | `docker compose stop redis && curl -s -D - http://localhost:8080/v1/payments/charge -H "X-API-Key: tenant_fintech_alpha"` | Fail-Open policy permits request with HTTP 200 and injects header `X-RateLimit-Degraded: true` with latency < 20ms (no 500 crash). | `artifacts/fail_open_test.log` | 15% | Yes |
| **RUB-06** | Observability Telemetry & Metrics (`Prometheus`) | `curl -s http://localhost:8080/metrics \| grep ratelimit_` | Outputs gauge and counter metrics `ratelimit_requests_total{status="allowed"}` and `ratelimit_requests_total{status="rejected"}` with values > 0. | `artifacts/metrics_scrape.txt` | 10% | Yes |
| **RUB-07** | Scale & Sustained Throughput Target | `k6 run scripts/load_test.js --duration 30s --summary-export=artifacts/k6_summary.json` | Sustains >= 20,000 req/sec with p99 proxy latency overhead < 3.5ms and 0 unhandled socket drops. | `artifacts/k6_summary.json` | 15% | Yes |

*Total Weight: 100% | Machine-Verifiable Weight: 100% (Mandate >= 50% met).*

---

## Machine-Readable Rubric Specification (JSON)

```json
{
  "rubric_version": "1.0",
  "project_slug": "distributed-rate-limiter",
  "reviewer_quick_path": "./scripts/verify.sh",
  "total_weight": 100,
  "machine_verifiable_percentage": 100,
  "items": [
    {
      "id": "RUB-01",
      "stack_item": "Docker",
      "criterion": "Multi-container topology orchestration",
      "verification_command": "docker compose up -d && docker compose ps --format json",
      "pass_threshold": "5 containers healthy and running",
      "evidence_artifact": "artifacts/docker_ps.json",
      "weight": 10,
      "machine_verifiable": true,
      "category": "infrastructure"
    },
    {
      "id": "RUB-02",
      "stack_item": "Redis",
      "criterion": "Concurrency and data integrity with atomic Lua scripts",
      "verification_command": "go test -v -run TestConcurrentAtomicTokenConsumption ./pkg/limiter",
      "pass_threshold": "Zero token leakage under 50 concurrent goroutines, exit 0",
      "evidence_artifact": "artifacts/concurrency_test.log",
      "weight": 20,
      "machine_verifiable": true,
      "category": "data-integrity"
    },
    {
      "id": "RUB-03",
      "stack_item": "Go",
      "criterion": "HTTP reverse proxy and rate limit response headers",
      "verification_command": "curl -s -D artifacts/http_headers.txt http://localhost:8080/v1/payments/charge -H \"X-API-Key: tenant_fintech_alpha\"",
      "pass_threshold": "HTTP 200 with X-RateLimit headers; HTTP 429 when exhausted",
      "evidence_artifact": "artifacts/http_headers.txt",
      "weight": 15,
      "machine_verifiable": true,
      "category": "api-contract"
    },
    {
      "id": "RUB-04",
      "stack_item": "gRPC",
      "criterion": "gRPC unary interceptor quota enforcement",
      "verification_command": "grpcurl -plaintext -H \"x-tenant-id: tenant_fintech_alpha\" localhost:50051 payment.PaymentService/ProcessPayment",
      "pass_threshold": "Code 0 (OK) on permitted calls, Code 8 (ResourceExhausted) on limit hit",
      "evidence_artifact": "artifacts/grpcurl_output.txt",
      "weight": 15,
      "machine_verifiable": true,
      "category": "protocol"
    },
    {
      "id": "RUB-05",
      "stack_item": "Go",
      "criterion": "Failure mode resilience: Fail-Open during Redis downtime",
      "verification_command": "docker compose stop redis && curl -s -D - http://localhost:8080/v1/payments/charge -H \"X-API-Key: tenant_fintech_alpha\"",
      "pass_threshold": "Returns 200 with X-RateLimit-Degraded: true and latency < 20ms",
      "evidence_artifact": "artifacts/fail_open_test.log",
      "weight": 15,
      "machine_verifiable": true,
      "category": "failure-mode"
    },
    {
      "id": "RUB-06",
      "stack_item": "Prometheus",
      "criterion": "Prometheus telemetry and error counters",
      "verification_command": "curl -s http://localhost:8080/metrics | grep ratelimit_",
      "pass_threshold": "Exports ratelimit_requests_total counters for allowed and rejected",
      "evidence_artifact": "artifacts/metrics_scrape.txt",
      "weight": 10,
      "machine_verifiable": true,
      "category": "observability"
    },
    {
      "id": "RUB-07",
      "stack_item": "Go",
      "criterion": "High throughput and low latency under k6 load",
      "verification_command": "k6 run scripts/load_test.js --duration 30s --summary-export=artifacts/k6_summary.json",
      "pass_threshold": "Throughput >= 20,000 req/sec with p99 overhead < 3.5ms",
      "evidence_artifact": "artifacts/k6_summary.json",
      "weight": 15,
      "machine_verifiable": true,
      "category": "performance"
    }
  ]
}
```
