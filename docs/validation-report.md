# HireFlow Scoring Validation Report

Generated on: 2026-10-25T02:16:50.288Z
Spec Version: 2.4.0 | Engine Version: 4.0.0 | Spec Fingerprint: 1fa1bc0ae3f440918db713337c217a517b9691ab26066ea2d118066021e8e669

> [!IMPORTANT]
> **Plain Disclosure on Validation Data:**
> No validation against real hiring outcomes has been performed. The numbers below reflect deterministic software invariants, metamorphic invariance, adversarial resilience, and rank agreement on synthetic benchmark seeds. Real employer hiring outcomes depend on factors outside resume text (campus drive access, online assessment cutoffs, commercial referrals, interview performance).

## 1. Executive Summary

Total Tests Executed: 12
Passed: 12 / 12
Failed: 0

| Suite | Test Name | Status | Key Metric / Verification Details |
|---|---|---|---|
| A. Determinism | 20 Identical Test-Retest Runs | PASSED | All 20 runs produced 100% byte-for-byte identical scores, bands, subscores, and skill credit. |
| B. Metamorphic | Irrelevant Skill Non-Inflation | PASSED | Adding non-technical skills (Knitting, Origami) yielded score 92 vs baseline 96 (difference: -4). |
| B. Metamorphic | Section Permutation Invariance | PASSED | Reordering sections yielded score 96 vs baseline 96 (within tolerance). |
| B. Metamorphic | Alias Equivalence (K8s vs Kubernetes) | PASSED | K8s alias scored 96, Kubernetes scored 96 (exact equality). |
| B. Metamorphic | Monotonicity Under Genuine Bullet Evidence | PASSED | Score with evidence (68) >= score with bare listing only (55). |
| C. Adversarial | Keyword Stuffing Flagging & Deduction | PASSED | Keyword stuffing penalty correctly applied for 25 listed skills with 0 bullet proof. |
| C. Adversarial | Buzzword-Only Bullets Without Substance | PASSED | Buzzword-laden resume scored 49 vs honest quantified baseline 96. |
| C. Adversarial | Duplicated Bullets Resistance | PASSED | Spamming identical high-scoring bullet 4 times scored 49 vs honest varied baseline 96. |
| C. Adversarial | Metric Plausibility Diagnostics | PASSED | Captured metrics while flagging extreme numbers for candidate interview justification. |
| D. Sensitivity | Rank Stability (Kendall's Tau under +/-20% weight perturbation) | PASSED | Kendall's Tau = 1.000 across 10 candidate profiles. Required: >= 0.80. |
| E. Gold-Set Agreement | Spearman Rank Agreement (Synthetic Seed Framework) | PASSED | Spearman Rho = 0.843 on 15 synthetic seed examples. Notice: Synthetic seed only; no validation against real hiring outcomes has been performed until real labelled employer data is provided. |
| F. JD Extraction | Deterministic JD Must-Have Extraction (Indian Styles Seed) | PASSED | Precision: 82.4%, Recall: 93.3%, F1: 0.875. Internal benchmark only, never claimed in UI. |

## 2. Invariance & Metamorphic Test Details
- **Test-Retest Stability:** Evaluated over 20 consecutive executions across identical raw text inputs. Both `runAtsEngine` and `analyzeCanonical` maintain complete determinism with zero non-deterministic float drift or random ordering.
- **Irrelevant Skill Non-Inflation:** Verified that adding non-technical, irrelevant terms (e.g. hobby crafts) contributes 0 points to mandatory or evidence pillars.
- **Section Permutation:** Structural reordering of standardized resume sections (Education, Projects, Skills, Experience) preserves content scoring integrity within 2 points tolerance.
- **Alias Equivalence:** Tested interchangeable canonical aliases (e.g. `K8s` vs `Kubernetes`). Both yield identical credit and identically categorized evidence snippets.
- **Monotonicity Guarantee:** Adding genuine bullet evidence with action verbs and quantifiable metrics for a listed skill strictly improves or maintains the composite score; it never penalizes.

## 3. Adversarial Robustness Evaluation
- **Keyword Stuffing:** Detected when unevidenced skills exceed 60% of total listed skills (with at least 15 skills listed). Applies visible `-10` to `-15` deduction and informs the candidate.
- **Buzzword Bullets:** Bullets with passive buzzwords and zero quantifiable metrics score below 40% on bullet impact criteria.
- **Duplication Resistance:** Repeated identical high-scoring bullets do not multiply score credit.

## 4. Sensitivity & Stability Analysis (Kendall’s Tau)
- **Rank Correlation (Tau):** 1.000 (Benchmark threshold: >= 0.80).
- Perturbing active weights by +/-20% across all 7 pillars preserved relative candidate order with high stability.

## 5. Gold-Set Reviewer Framework (Spearman’s Rho)
- **Spearman Rank Correlation (Rho):** 0.843 against 15 synthetic seed pairs.
- **Dataset Notice:** Marked as `synthetic seed, replace with real data`. Accuracy or outcome numbers must NEVER be published from synthetic seeds.

## 6. JD Extraction Performance (Indian Tech Styles)
- **Precision:** 82.4%
- **Recall:** 93.3%
- **F1 Score:** 0.875
- Tested across campus drives (TCS Digital/Prime), service tracks (Infosys Power Programmer), and Bengaluru product startups.
- Internal engineering benchmark only; never displayed as a product marketing claim.

---
*Report generated autonomously by HireFlow Validation Harness (feat/integrity-v2).*