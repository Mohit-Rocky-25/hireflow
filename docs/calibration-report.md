# HireFlow v3 — ATS Roaster Calibration Report (R5.8)

> ⚠️ **DISCLAIMER: NOT ground truth.** This calibration harness is currently evaluated exclusively against 6 synthetic benchmark cases for regression testing. No claims of predictive accuracy or real-world hiring guarantees are made (Principles P-1, P-4).


- **Total Evaluated Cases**: 6
- **Dataset Mode**: Synthetic Benchmark Set (6 cases)
- **Pairwise Ranking Agreement**: **91%** (10/11 concordant pairs)
- **Spearman Rank Correlation (ρ)**: **0.757**

---

## 1. Per-Case Calibration Breakdown

| Case ID | Human Verdict | Overall Score | Hard Skills (0.40) | Evidence (0.25) | Fresher (0.20) | Format (0.15) | Labeller Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **case_01** | `SHORTLIST` | **86** | 86 | 66 | 100 | 100 | synthetic - harness test only: Strong CS degree, 8.64 CGPA, verified fullstack internship with metrics. |
| **case_02** | `SHORTLIST` | **85** | 91 | 65 | 100 | 80 | synthetic - harness test only: ECE fresher with verified FreeRTOS, STM32 hardware and C/C++ projects. |
| **case_03** | `MAYBE` | **59** | 50 | 20 | 95 | 100 | synthetic - harness test only: Passing CGPA, but bullets are sparse and lack measured outcome metrics. |
| **case_04** | `MAYBE` | **85** | 100 | 85 | 60 | 80 | synthetic - harness test only: Solid React skills but messy multi-column layout requires parser review. |
| **case_05** | `MAYBE` | **80** | 72 | 85 | 90 | 80 | synthetic - harness test only: Mechanical graduate with good self-taught Python/SQL portfolio; lacking CS core. |
| **case_06** | `REJECT` | **74** | 69 | 65 | 75 | 100 | synthetic - harness test only: 40+ buzzwords listed without evidence; only one basic tutorial clone project. |

---

## 2. Score Distribution by Verdict Tier

- **Shortlist Cases**: Mean Score = 85.5
- **Maybe Cases**: Mean Score = 74.7
- **Reject Cases**: Mean Score = 74.0

---

## 3. Confusion Table (Score Thresholds: Shortlist >= 75, Maybe 50-74, Reject < 50)

| Human Verdict \ Engine Tier | Shortlist (>=75) | Maybe (50-74) | Reject (<50) |
| :--- | :--- | :--- | :--- |
| **Shortlist** | 2 | 0 | 0 |
| **Maybe** | 2 | 1 | 0 |
| **Reject** | 0 | 1 | 0 |

---

## 4. Owner Verification Requirement (Stage 10 Checklist)
To upgrade this harness from synthetic testing to production calibration:
1. Provide 30–50 real, anonymized candidate resumes paired with target campus/entry-level JDs.
2. Label each with actual screening outcomes (`shortlist`, `maybe`, `reject`).
3. Store anonymized pairs under `data/calibration/real/` adhering strictly to the privacy protocol.
