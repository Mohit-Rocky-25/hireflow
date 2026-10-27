# HireFlow ATS Roaster — Human Rating Sheet & Reliability Analysis (Stage 2)

> ⚠️ **DISCLAIMER: Benchmark Evaluation Only.** Synthetic multi-archetype benchmark evaluation for regression detection and score ranking consistency. No hiring guarantee or real-world employment prediction is implied.

## 1. Reliability & Agreement Summary

- **Total Benchmark Cases**: 12
- **Pairwise Ranking Concordance**: **97.9%** (47/48 concordant pairs)
- **Spearman Rank Correlation (ρ)**: **0.92** (Target $\ge 0.70$)
- **Cohen's Quadratic Weighted Kappa (κ_w)**: **0.625** (Substantial agreement $\ge 0.60$)

---

## 2. Complete Rating Sheet

| Case ID | Archetype | Human Verdict | Engine Score | Engine Tier | Skills (0.40) | Evidence (0.25) | Readiness (0.20) | Format (0.15) | Concordant? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CASE-01** | Top CS Graduate vs Campus SDE | `SHORTLIST` | **63** | `MAYBE` | 86 | 38 | 100 | 100 | ⚠️ |
| **CASE-02** | ECE Embedded Specialist vs Firmware Role | `SHORTLIST` | **75** | `SHORTLIST` | 91 | 18 | 100 | 80 | ✅ |
| **CASE-03** | Sparse Bullets vs Campus SDE | `MAYBE` | **48** | `REJECT` | 50 | 8 | 95 | 100 | ⚠️ |
| **CASE-04** | Multi-column Raw Paste vs Frontend Fresher | `MAYBE` | **38** | `REJECT` | 100 | 0 | 60 | 80 | ⚠️ |
| **CASE-05** | Mech Switcher vs Backend Intern | `MAYBE` | **44** | `REJECT` | 65 | 18 | 90 | 80 | ⚠️ |
| **CASE-06** | Overstuffed Buzzwords vs Backend Intern | `REJECT` | **30** | `REJECT` | 67 | 3 | 75 | 100 | ✅ |
| **CASE-07** | Embedded Specialist vs Frontend Fresher (Domain Mismatch) | `REJECT` | **31** | `REJECT` | 17 | 18 | 100 | 80 | ✅ |
| **CASE-08** | Top CS Graduate vs Frontend Fresher | `SHORTLIST` | **69** | `MAYBE` | 90 | 38 | 100 | 100 | ⚠️ |
| **CASE-09** | Mech Switcher vs Data Analyst Fresher | `MAYBE` | **57** | `MAYBE` | 100 | 18 | 90 | 80 | ✅ |
| **CASE-10** | Top CS Graduate vs Unstructured Messy JD | `SHORTLIST` | **59** | `MAYBE` | 100 | 38 | 100 | 100 | ⚠️ |
| **CASE-11** | Sparse Bullets vs Backend Intern | `REJECT` | **42** | `REJECT` | 51 | 8 | 95 | 100 | ✅ |
| **CASE-12** | Overstuffed Buzzwords vs Campus SDE | `REJECT` | **25** | `REJECT` | 55 | 3 | 75 | 100 | ✅ |

---

## 3. Confusion Matrix

| Human Verdict \ Engine Tier | Shortlist (Score $\ge$ 75) | Maybe (Score 50–74) | Reject (Score < 50) |
| :--- | :---: | :---: | :---: |
| **Shortlist** | 1 | 3 | 0 |
| **Maybe** | 0 | 1 | 3 |
| **Reject** | 0 | 0 | 4 |

---

## 4. Score Distribution by Human Tier

- **Shortlist Tier**: Mean Engine Score = **66.5**
- **Maybe Tier**: Mean Engine Score = **46.8**
- **Reject Tier**: Mean Engine Score = **32.0**

---

## 5. Residuals & Diagnostic Notes

- **CASE-01 (Top CS Graduate vs Campus SDE)**: Human=`shortlist`, Engine=`maybe` (63/100). Strong CS degree, 8.64 CGPA, fullstack internship with quantified throughput metrics.
- **CASE-02 (ECE Embedded Specialist vs Firmware Role)**: Human=`shortlist`, Engine=`shortlist` (75/100). ECE fresher with STM32, FreeRTOS, hardware I2C/SPI projects and C/C++ core.
- **CASE-03 (Sparse Bullets vs Campus SDE)**: Human=`maybe`, Engine=`reject` (48/100). Passing academic record, but bullets lack quantifiable metrics and depth.
- **CASE-04 (Multi-column Raw Paste vs Frontend Fresher)**: Human=`maybe`, Engine=`reject` (38/100). Solid React/CSS skills, but formatting hazard causes parsing column bleed.
- **CASE-05 (Mech Switcher vs Backend Intern)**: Human=`maybe`, Engine=`reject` (44/100). Self-taught Python/SQL portfolio; lacking formal CS coursework and systems depth.
- **CASE-06 (Overstuffed Buzzwords vs Backend Intern)**: Human=`reject`, Engine=`reject` (30/100). 40+ buzzwords listed without bullet evidence; basic tutorial clone project only.
- **CASE-07 (Embedded Specialist vs Frontend Fresher (Domain Mismatch))**: Human=`reject`, Engine=`reject` (31/100). Zero React/HTML/CSS or web stack experience; complete domain mismatch.
- **CASE-08 (Top CS Graduate vs Frontend Fresher)**: Human=`shortlist`, Engine=`maybe` (69/100). Demonstrated React, TypeScript, and modern responsive UI engineering experience.
- **CASE-09 (Mech Switcher vs Data Analyst Fresher)**: Human=`maybe`, Engine=`maybe` (57/100). Python, Pandas, SQL data cleaning projects present, good analytical aptitude.
- **CASE-10 (Top CS Graduate vs Unstructured Messy JD)**: Human=`shortlist`, Engine=`maybe` (59/100). Engine extracts implicit requirements from unstructured text; strong match holds.
- **CASE-11 (Sparse Bullets vs Backend Intern)**: Human=`reject`, Engine=`reject` (42/100). Zero backend system design or SQL evidence; unconvincing entry-level candidacy.
- **CASE-12 (Overstuffed Buzzwords vs Campus SDE)**: Human=`reject`, Engine=`reject` (25/100). Severe unevidenced skill ratio triggers keyword stuffing penalty; zero depth.
