# Audit & Diagnosis: brief-offline-first-sync

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Offline-First Mobile & Web Local-Sync Protocol | Generic headline | Minor |
| Claims / Marketing | 'Notion, Linear, and Figma are the gold standard... Every modern productivity app is moving to offline-first in 2025' | Named commercial consumer apps as promotional marketing | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing editor scaffolding and multi-client test fixtures | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No IndexedDB/Node.js specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Node.js 18+ and Chromium at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. IndexedDB write latency (< 15.0ms), sync latency (< 180ms), and conflict convergence (50 of 50) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock database and mock WebSocket loopback if PostgreSQL or Docker is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic collaborative notes and automated multi-client chaos test scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: native mobile Swift/Kotlin code and commercial cloud storage billing.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 simulates two partitioned clients updating the same property and verifies convergence.
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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved E2EE Web Crypto encryption and awareness presence protocols to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic offline sync metrics (IndexedDB write latency, WebSocket sync latency, and conflict resolution convergence rate).
- Removed Banned Content: Removed marketing references to Notion, Linear, and Figma.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic concurrent editing test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
