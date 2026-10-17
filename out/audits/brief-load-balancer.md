# Audit & Diagnosis: brief-load-balancer

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Layer 7 Load Balancer with Health Checks & Adaptive Routing | Generic headline | Minor |
| Claims / Marketing | 'HAProxy, Nginx, and Envoy are all implementations of this... Unlocks senior backend and platform engineering roles' | Marketing claims regarding interview unlocking | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing mock backend servers and traffic generation suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Go version or CPU/network specs | Major |
| Resume Bullet | 'handled [N] req/sec req/sec with < [M ms] overhead' | Broken duplicated text string with unpopulated brackets | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local mock HTTP backends at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Proxy latency overhead (< 2.0ms), upstream removal (< 3.0s), and balance variance (< 15.0%) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Local mock HTTP servers running as OS background processes without requiring Docker.
4. **Can test data be created in minutes?** YES. Go mock server binaries and automated k6 traffic configurations included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: Layer 4 packet routing and hardware ASIC switch programming.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 terminates upstream server during active streaming traffic and asserts 0 dropped requests.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved TLS termination and WebSockets proxying to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic load balancer metrics (proxy latency overhead under 5,000 req/sec, upstream crash removal duration, and balance variance).
- Removed Banned Content: Removed interview unlocking marketing hype.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic upstream crash test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
