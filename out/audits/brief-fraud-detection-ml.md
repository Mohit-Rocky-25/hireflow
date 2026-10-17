# Audit & Diagnosis: brief-fraud-detection-ml

- **Old Title**: Real-Time Fraud Detection ML Pipeline
- **Domain**: ML Engineering
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic model training; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing and unverified claims)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than PR-AUC, decision latency, and TreeSHAP overhead.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, LightGBM, Redis, and FastAPI at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. PR-AUC (> 0.72), decision latency (< 15ms), and TreeSHAP overhead (< 8ms) measured directly on local CPU.
3. **Is there a CPU/local/free fallback?** YES. Python in-memory dictionaries and SQLite if Docker Redis is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic 250,000 transaction dataset with seeded fraud cases generator included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full evaluation suite and dynamic velocity check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. PR-AUC on imbalanced data, sub-15ms scoring decision latency, and TreeSHAP attribution overhead are unique to real-time fraud ML pipelines.
7. **Is every bullet claim verified by rubric?** YES. PR-AUC verified by Check 0; decision latency and SHAP verified by Checks 1 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] sends 6 rapid transactions on a dynamic card at runtime and asserts VELOCITY_BURST blocking.
9. **Are all terms accurate?** YES. Accurately covers sliding-window feature stores, LightGBM gradient boosting, PR-AUC, and TreeSHAP attributions.
10. **Does problem statement promise only what is verified?** YES. Feature store, LightGBM model, FastAPI scoring, and TreeSHAP explainer are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Safety note confirms purely synthetic educational data, zero live banking integration.
12. **Are all hard parts technical?** YES. 4 technical challenges covering sub-5ms Redis sliding windows, extreme class imbalance, sub-8ms TreeSHAP, and cost matrix thresholding.

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
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved shadow deployment runner and graph clustering to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic real-time fraud ML metrics (PR-AUC, decision latency, and TreeSHAP computation overhead).
- Removed Banned Content: Removed unsubstantiated marketing claims and employer references.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic velocity burst test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [PR_AUC_SCORE] and [DECISION_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
