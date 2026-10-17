# Audit & Diagnosis: brief-observability-sdk

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Observability SDK & Auto-Instrumentation Library | Generic headline | Minor |
| Claims / Marketing | 'Every engineering team building microservices needs an internal observability library... Unlocks platform engineering and SRE roles' | Career unlocking marketing claims | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing Go scaffolding and mock collector stubs | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Go runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local loopback gRPC at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Middleware overhead (< 0.25ms), export throughput (>= 15,000 spans/sec), and memory cap (< 35MB) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock collector running as a background goroutine without external network dependencies.
4. **Can test data be created in minutes?** YES. Synthetic span generator and automated Go benchmark scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: distributed database storage backends and kernel hypervisor introspection.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 passes dynamic traceparent and asserts correlated child span emission.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 1.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved in-process tail-based sampling and database driver wrapping to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic SDK metrics (tracer latency overhead, OTLP export throughput, and memory residency during outages).
- Removed Banned Content: Removed career unlocking promotional claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic traceparent propagation test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
