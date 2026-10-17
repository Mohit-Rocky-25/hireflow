# Audit & Diagnosis: brief-data-quality-framework

- **Old Title**: Automated Data Quality Monitoring & Anomaly Detection
- **Domain**: Data Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'top tech platforms, top tech platforms, top tech platforms', 'Monte Carlo, Great Expectations, and dbt', 'highly paid and in-demand')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an analytical data quality framework with generic web-service throughput targets.
2. **Extreme marketing duplication**:
   > "Every data team at a mature tech company (top tech platforms, top tech platforms, top tech platforms) runs data quality checks... a highly paid and in-demand role."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using DuckDB and Python at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Validation execution speed (< 4.5s on 250k rows) and 20 of 20 defect detections measured directly on local CPU.
3. **Is there a CPU/local/free fallback?** YES. In-memory SQLite execution engine without DuckDB if binaries fail.
4. **Can test data be created in minutes?** YES. Synthetic 250,000 transaction dataset with 20 injected defects provided via script.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full validation and dynamic defect check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Quality defect detection rate, DuckDB validation execution speed, and clean baseline false positive rates are unique to data quality frameworks.
7. **Is every bullet claim verified by rubric?** YES. Execution speed verified by Check 2; defect count verified by Check 1; blocking gate verified by Check 1 & 5.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic negative amount row at runtime and asserts blocking gate failure.
9. **Are all terms accurate?** YES. Accurately covers declarative contracts, DuckDB vectorized SQL, distribution drift, and pipeline blocking gates.
10. **Does problem statement promise only what is verified?** YES. Contract parsing, SQL assertions, drift profiling, and automated blocking gates are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic e-commerce transaction data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering declarative rule performance, distribution drift without memory bloat, false positive tuning, and fail-fast gating.

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
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split Slack/PagerDuty alerts and Great Expectations exporter to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic data quality metrics (seeded defect detection rate, validation execution latency, and clean baseline false positive rate).
- Removed Banned Content: Removed 'top tech platforms' triple duplication and 'highly paid and in-demand' claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic defect check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ROW_COUNT], [VALIDATION_TIME], [DEFECT_COUNT], and [TOTAL_DEFECTS] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
