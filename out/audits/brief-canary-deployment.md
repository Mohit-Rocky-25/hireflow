# Audit & Diagnosis: brief-canary-deployment

- **Old Title**: Canary Deployment Controller with Automated Rollback
- **Domain**: Platform & DevOps
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 4.5 / 10 (copied web-service targets onto Kubernetes controller; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned marketing: 'FAANG companies', 'top tech platforms, top tech platforms, and top tech platforms', 'principal-level', 'Any company')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results, two sentences joined by semicolon glitch)
- **Old Weighted Score**: 4.50 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Pasted identical backend service targets onto a Kubernetes operator controller.
2. **Extreme marketing glitches**:
   > "Progressive delivery is the gold standard at FAANG companies. top tech platforms, top tech platforms, and top tech platforms deploy hundreds of times per day..."
3. **Syntax glitch in resume bullet**:
   > "within 60 seconds of threshold violation.; achieved [N] throughput with < [M ms] latency overhead across [K] test transactions."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs locally on Kind or Minikube with Docker at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Progression accuracy within 4% and rollback duration < 45s measured directly on local Kind cluster.
3. **Is there a CPU/local/free fallback?** YES. Controller-runtime envtest test suite without needing full Kubernetes cluster.
4. **Can test data be created in minutes?** YES. Mock Go microservice with programmable fault endpoints provided in repo.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full test and dynamic threshold rollback in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. Traffic shifting accuracy, rollback convergence latency, and operator memory footprint are specific to canary controllers.
7. **Is every bullet claim verified by rubric?** YES. Progressive traffic shifting verified by Check 2; rollback timing verified by Check 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic error threshold and confirms live operator rollback.
9. **Are all terms accurate?** YES. Accurately covers CRDs, client-go, Prometheus scraping, and service mesh traffic weights.
10. **Does problem statement promise only what is verified?** YES. Controller reconciliation, traffic shifting, metric analysis, and rollback are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic local microservices and mock telemetry.
12. **Are all hard parts technical?** YES. 4 technical challenges covering reconciliation idempotency, traffic synchronicity, scrape lag, and rollback safety.

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
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split Slack webhooks and multi-cluster federation to Extended Path (+14h).
- Target Realism: Replaced copied web-service targets with genuine Kubernetes controller targets (traffic shift accuracy, automated rollback duration, and pod memory footprint).
- Removed All Banned Content: Removed FAANG, 'top tech platforms' triple duplication, and 'principal-level' marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic threshold check.
- Resume Formula: Formatted into a single sentence using placeholders [TRAFFIC_STAGES] and [ROLLBACK_TIME] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
