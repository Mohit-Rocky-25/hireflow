# Audit & Diagnosis: brief-ci-cd-from-scratch

- **Old Title**: Minimal CI/CD System from Scratch with Build Agents
- **Domain**: Platform & DevOps
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 6.5 / 10 (vague marketing statements)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.25 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CI/CD build runner using HTTP service metrics rather than DAG scheduling adherence and log streaming latencies.
2. **Circular rubric pass lines**:
   > "1. Verify master receives webhook, queues job, and assigns to available worker; passes when verified by automated test script or benchmark log."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 34 hours (ADVANCED); runs locally on 8GB RAM with Go and Docker at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Container cleanup (< 4s) and log streaming latency (< 80ms) measured directly on local Docker host.
3. **Is there a CPU/local/free fallback?** YES. Local shell runner mode without Docker if socket access is restricted.
4. **Can test data be created in minutes?** YES. Test YAML pipeline definitions provided in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full pipeline tests and dynamic token job in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. DAG dependency adherence, container teardown time, and terminal log transmission latency are unique to CI/CD engines.
7. **Is every bullet claim verified by rubric?** YES. DAG scheduling verified by Checks 1 & 2; log streaming verified by Check 4; container teardown verified by Check 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] executes job with dynamic echo token and verifies live output.
9. **Are all terms accurate?** YES. Accurately details DAG resolution, topological sorting, Docker isolation, and WebSocket streaming.
10. **Does problem statement promise only what is verified?** YES. Pipeline scheduling, container isolation, and log streaming are directly built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic test scripts and mock build commands.
12. **Are all hard parts technical?** YES. 4 technical challenges covering DAG deadlocks, zombie container cleanup, log streaming memory, and agent authentication.

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
- Scope & Hours: Calculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split S3 artifact storage and GitHub webhooks to Extended Path (+15h).
- Target Realism: Replaced copied web-service targets with genuine CI/CD engine metrics (DAG stage adherence, container cancellation teardown, and log streaming latency).
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic token job test.
- Resume Formula: Structured into single sentence using measured placeholders [STREAM_LATENCY] and [TEARDOWN_TIME] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
