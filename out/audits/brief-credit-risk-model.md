# Audit & Diagnosis: brief-credit-risk-model

- **Old Title**: Credit Risk Scoring & Loan Underwriting ML System
- **Domain**: FinTech Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Slice, KreditBee, EarlySalary, Navi, and MoneyTap', 'BNPL companies (LazyPay, Simpl)', 'FinTech ML roles at Slice, Navi, top tech platforms')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.60 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an ML financial risk model with generic web-service throughput targets.
2. **Heavy employer marketing list**:
   > "Slice, KreditBee, EarlySalary, Navi, and MoneyTap are all building alternative credit models in India. RBI guidelines require explainable AI for credit decisions. BNPL companies (LazyPay, Simpl) need this..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Scikit-learn and XGBoost at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. ROC-AUC (>= 0.74) and Brier score (<= 0.14) evaluated directly on held-out test split.
3. **Is there a CPU/local/free fallback?** YES. Logistic regression with statsmodels if XGBoost installation encounters issues.
4. **Can test data be created in minutes?** YES. Synthetic 10,000-applicant financial dataset provided with fixed seed 9912.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full model evaluation and dynamic applicant check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. ROC-AUC discrimination, Brier score calibration, and monotonicity constraint verification are unique to credit risk ML.
7. **Is every bullet claim verified by rubric?** YES. ROC-AUC verified by Check 1; Brier score verified by Check 2; decision latency verified by Check 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] generates dynamic applicant with 95.5% utilization and asserts adverse reason code.
9. **Are all terms accurate?** YES. Accurately covers monotonic constraints, Platt scaling, Brier score, and TreeSHAP attribution.
10. **Does problem statement promise only what is verified?** YES. Feature engineering, monotonic tree training, probability calibration, and SHAP explainability are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic financial attributes; disclaimer forbidding real-money underwriting without compliance.
12. **Are all hard parts technical?** YES. 4 technical challenges covering class imbalance, monotonic constraints, probability calibration, and TreeSHAP latency.

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
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split population stability index (PSI) and cashflow time-series to Extended Path (+14h).
- Target Realism: Eliminated generic web-service targets; replaced with authentic credit scoring metrics (ROC-AUC discrimination, Brier score calibration, and real-time decision latency).
- Removed Banned Content: Removed all mentions of Slice, KreditBee, EarlySalary, Navi, MoneyTap, LazyPay, and Simpl.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic applicant test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [MODEL_AUC], [TEST_SET_SIZE], [BRIER_SCORE], and [DECISION_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
