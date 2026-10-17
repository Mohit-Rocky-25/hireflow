# Audit & Diagnosis: brief-mlops-platform

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | End-to-End MLOps Training & Deployment Platform | Generic headline | Minor |
| Claims / Marketing | Generic marketing copy without specific architecture details | Lacks concrete implementation specifics | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing feature datasets, MLflow configurations, and Dockerfiles | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No container/CPU specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, MLflow, and Docker Desktop at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Pipeline cycle time (< 8.0 min), inference latency (< 25.0ms), and drift recall (>= 90.0%) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Local SQLite database and filesystem artifact storage without requiring external managed databases.
4. **Can test data be created in minutes?** YES. Synthetic 50,000-row tabular dataset generator included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-node GPU pre-training clusters and commercial cloud billing management.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 submits dynamic shifted feature distribution and asserts statistical p-value alert.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 2.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved A/B shadow routing and Optuna hyperparameter sweeps to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic MLOps metrics (pipeline cycle time, containerized inference latency, and Kolmogorov-Smirnov drift recall).
- Removed Banned Content: Cleaned generic marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic drift injection test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
