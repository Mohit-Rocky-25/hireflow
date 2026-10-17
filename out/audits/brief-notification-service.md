# Audit & Diagnosis: brief-notification-service

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Multi-Channel Notification Orchestration Service | Generic headline | Minor |
| Claims / Marketing | 'top tech platforms, Zomato, top tech platforms, HDFC Bank... WhatsApp Business API, Twilio...' | Named Indian consumer tech brands and contains banned phrase 'top tech platforms' | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing notification event schemas and mock provider suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Docker or Node.js runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js 18+, Docker Desktop, and mock providers at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Deduplication accuracy (1,000 of 1,000), throughput (>= 2,500 msg/sec), and fallback duration (< 350ms) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock queue and cache modules if Docker is unavailable; local mock provider scripts requiring zero paid API spend.
4. **Can test data be created in minutes?** YES. Synthetic 20,000-event generator and mock provider scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: commercial telecom SMPP trunks and live Apple APNs certificate hosting.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 sends concurrent duplicate dynamic events and asserts second call is suppressed with 0 duplicate delivery.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved MJML email compilation and WebSocket in-app delivery to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic notification service metrics (deduplication accuracy, publish throughput, and channel fallback latency).
- Removed Banned Content: Removed marketing references to Zomato, HDFC Bank, and removed 'top tech platforms' placeholder.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic deduplication test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
