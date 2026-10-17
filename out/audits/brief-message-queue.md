# Audit & Diagnosis: brief-message-queue

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Persistent Message Queue with At-Least-Once Delivery | Generic headline | Minor |
| Claims / Marketing | 'Kafka is in 70%+ of senior backend JDs... skills that operations teams desperately need' | Marketing claims citing job description statistics | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing binary framing specs and payload datasets | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No storage or Go specs | Major |
| Resume Bullet | 'achieved [N] req/sec msg/sec with guaranteed at-least-once delivery' | Malformed broken units string with unpopulated brackets | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local SSD storage at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Ingestion throughput (>= 45,000 msg/sec), crash recovery (50,000 of 50,000), and redelivery window (< 5.0s) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Standard library Go binary operating directly on local filesystem without requiring external services.
4. **Can test data be created in minutes?** YES. Synthetic 50,000-message payload generator and binary benchmark scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-datacenter geo-replication and in-broker SQL stream processing.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 crashes worker during active publish and asserts surviving consumer receives redelivered message.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Raft consensus replication and log compaction to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic message broker metrics (sustained publish throughput, zero-loss crash recovery, and consumer redelivery duration).
- Removed Banned Content: Removed job description statistical marketing hype.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic worker crash redelivery test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
