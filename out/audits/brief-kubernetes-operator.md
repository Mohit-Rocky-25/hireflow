# Audit & Diagnosis: brief-kubernetes-operator

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Custom Kubernetes Operator with CRD Lifecycle Management | Generic headline | Minor |
| Claims / Marketing | 'separates Kubernetes users from Kubernetes platform engineers, who command 50-100% higher salaries' | Banned salary marketing claim | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing CRD manifests and test cluster specs | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No specs for Go/KinD/envtest | Major |
| Resume Bullet | Broken string with semicolons and copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Go, envtest, and KinD in Docker at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Reconciliation latency (< 650ms), failover time (< 25s), and schema validation rejection (50 of 50) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. envtest local control plane binaries if KinD or Docker is unavailable.
4. **Can test data be created in minutes?** YES. Sample CRD manifests and mock cluster deployment scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-tenant cloud billing and hardware SAN storage array management.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 applies dynamic CRD and asserts created StatefulSet pods and services.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 2 and 1.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved cross-region replication and mutating webhooks to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic operator metrics (reconciliation latency, failover duration, and CRD validation rejection rate).
- Removed Banned Content: Removed marketing claims stating platform engineers command 50-100% higher salaries.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic CRD reconciliation test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
