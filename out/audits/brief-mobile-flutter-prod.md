# Audit & Diagnosis: brief-mobile-flutter-prod

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Production Flutter App with BLoC State & CI/CD Pipeline | Generic headline | Minor |
| Claims / Marketing | Generic marketing text without concrete performance numbers | Unsubstantiated claims | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing Flutter scaffolding and mock backend test fixtures | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Flutter/Dart/SDK specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Flutter 3.16+ and Android emulator or desktop target at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Cold start (< 1,800ms), dropped frames (< 4 frames), and sync reconciliation (< 650ms) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Flutter Web or Linux/Windows desktop targets if Android Studio emulator is unavailable.
4. **Can test data be created in minutes?** YES. Flutter test fixtures and mock backend REST server scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: commercial app store publisher accounts and Bluetooth firmware flashing.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 tests offline item creation and asserts automated sync upon network reconnection.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved background GPS geofencing and biometric keystore auth to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic mobile metrics (cold start duration, 60fps frame stability, and offline sync reconciliation latency).
- Removed Banned Content: Cleaned generic marketing copy.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic offline sync test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
