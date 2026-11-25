# HireFlow ATS Resume Roaster — Phase 07 Technical Report
# Calibrated Seniority, Tenure Intelligence and Canonical Scoring Integration

**Document Version:** 1.0.0  
**Phase Status:** Complete  
**Engine Version:** 4.7.0  
**Target Date:** 2026-11-24  
**Authors:** DeepMind Antigravity Engineering Taskforce  

---

## 1. Executive Summary & Objective

Phase 07 introduces a calibrated seniority, tenure intelligence, and canonical scoring integration engine into the HireFlow ATS Resume Roaster platform. 

Prior to Phase 07, candidate experience estimation relied on crude year subtraction (e.g. `endYear - startYear`), which suffered from severe architectural flaws:
1. **Artificial Upward Rounding:** Fractional experience like 2 years and 7 months was coarsely rounded or flattened to 3 years.
2. **Double-Counting of Overlapping Roles:** Multiple concurrent, freelance, or overlapping positions were summed additively rather than unified across calendar time, artificially inflating candidate tenure.
3. **Conflation of Employment Tiers:** Internships, part-time jobs, and personal projects were counted on equal footing with full-time professional production engineering.
4. **Scoring Desynchronization and Double Penalties:** Seniority shortfalls frequently triggered both a subscore reduction and an ad-hoc negative penalty, penalizing candidates twice for the identical shortfall.
5. **Brittle JD Seniority Parsing:** Regular expressions frequently misidentified numeric metrics (e.g. `15,000+ RPS`, `68% latency cut`, `35+ DAGs`, `$10M ARR`) as required years of experience.

Phase 07 replaces these heuristics with a mathematically rigorous, calendar-interval-union tenure engine (`tenureCalculator.ts`) and an explainable seniority matcher (`seniorityMatcher.ts`) integrated into canonical scoring with zero double-counting.

---

## 2. Gate 0 Reconciliation & Benchmark Provenance Freeze

Before implementation, a repository-wide inspection verified the canonical ground truth benchmark fixtures and reconciled historical prompt drafting discrepancies with the codebase.

### 2.1 Benchmark Hash Provenance Table

| Fixture Identifier | Canonical File Location | SHA-256 Checksum | Canonical Employer / Role |
| :--- | :--- | :--- | :--- |
| **Benchmark A Resume** | `tests/ats/p0Integrity.test.ts` (L17-42) | `9a4e3739362d7d311d1a20a322243c95707bc4f7e2360440d35a2d1bb50059c3` | Rohan Deshmukh / PayTech Solutions (2021 - Present) |
| **Benchmark A JD** | `tests/ats/p0Integrity.test.ts` (L44-59) | `a0986c71c34ed6ab56c2b031307cbfd0100f30feda488557b3f25840fcf19b1a` | PayGrid Systems / Backend Software Engineer |
| **Benchmark B Resume** | `tests/ats/p0Integrity.test.ts` (L60-86) | `235e0082fd259a20f03af9abad3bd926ddcdf156a9b4edefefb7208b3dd49856` | Ananya Rao / DataFlow Analytics (2022 - Present) & CloudScale Labs Intern (2021 - 2022) |
| **Benchmark B JD** | `tests/ats/p0Integrity.test.ts` (L88-98) | `e17ffbf7d0ae96b79c35489f668fc7183e20d52b12eb559eb43152c1df5f3851` | Northstar Credit / Data Engineer (3+ yrs required) |

### 2.2 Historical Draft Reconciliation

- **Benchmark A:** Early conceptual drafts referenced "ShipPulse Logistics" / "Kinetix". The actual repository test suites (Phases 01 through 06) and golden suites have consistently frozen `PayTech Solutions | 2021 - Present` as the sole canonical employment history for Rohan Deshmukh.
- **Benchmark B:** Early conceptual drafts referenced "LendBridge Technologies" / "CartSpring". The repository test suites and fixtures across all phases have consistently frozen `DataFlow Analytics | 2022 - Present` (Full-time) and `CloudScale Labs | 2021 - 2022` (Internship) as the sole canonical employment history for Ananya Rao.

Both benchmark fixtures are permanently frozen and validated against regression in `tests/ats/phase07Seniority.test.ts`.

---

## 3. Mathematical Model of Calendar Interval Unions

To eliminate the double-counting of concurrent roles, all experience entries are projected into discrete 0-indexed calendar-month coordinate space:

$$\text{monthIndex} = \text{year} \times 12 + \text{month} \quad (\text{where } \text{month} \in [0, 11])$$

An employment duration spanning from start month $s$ to end month $e$ inclusive defines a closed interval $[s, e]$, with duration:

$$\Delta m = e - s + 1$$

### 3.1 Interval Union Algorithm

Given $n$ recorded employment intervals $I = \{[s_1, e_1], [s_2, e_2], \dots, [s_n, e_n]\}$:
1. Intervals are sorted primarily by $s_i$ ascending and secondarily by $e_i$ ascending.
2. The merged interval list $M$ is computed iteratively:
   $$\text{If } s_{i} \le \text{last}(M).e + 1, \quad \text{last}(M).e \leftarrow \max(\text{last}(M).e, e_i)$$
   $$\text{Else}, \quad M \leftarrow M \cup \{[s_i, e_i]\}$$
3. Total unique qualifying tenure is the sum of disjoint merged lengths:
   $$\text{Total Months} = \sum_{[s_k, e_k] \in M} (e_k - s_k + 1)$$

This guarantees that two simultaneous 12-month roles over the identical calendar year yield exactly 12 months of qualifying tenure, never 24.

---

## 4. Tenure Classification Architecture

The engine segments candidate experience into five distinct contextual categories:

1. **Full-Time Professional (`totalProfessionalMonths`):** Enterprise and production engineering positions (`FULL_TIME`, technical titles like `Senior Backend Engineer`, `Data Engineer`).
2. **Internships (`internshipMonths`):** Educational, trainee, apprentice, and co-op roles (`INTERNSHIP`, `APPRENTICESHIP`).
3. **Contract / Freelance (`contractMonths`):** Temporary or third-party client engagements (`CONTRACT`, `FREELANCE`).
4. **Part-Time (`partTimeMonths`):** Partial commitments (`PART_TIME`).
5. **Projects (`projectMonths`):** Academic, open-source, or personal prototypes.

Each tier maintains its own independent interval union, while a combined `totalWorkMonths` represents the overall union across all working contexts.

---

## 5. Competency-Specific Tenure Tracing

Beyond overall professional tenure, employers frequently demand competency-specific tenure (e.g. *"At least 3 years experience with PostgreSQL"*).

Phase 07 connects competency detection to Phase 04 structured employment records, Phase 05 citation offsets, and Phase 06 matched competency IDs:
1. For competency $C$, all employment entries containing verified evidence records, citations, or explicit competency tags for $C$ are identified.
2. The calendar intervals $[s_j, e_j]$ for those specific roles are collected.
3. The interval union of those roles is evaluated:
   $$\text{Tenure}(C) = \text{UnionMonths}(\{[s_j, e_j] \mid \text{Role } j \text{ demonstrates } C\})$$
4. If a candidate used PostgreSQL at Company A (2021–2022) and concurrent Company B (2021–2022), PostgreSQL tenure is 24 months, not 48.

---

## 6. Compound Boolean Tenure Evaluation

Compound requirements with boolean operators are evaluated using formal interval operations:

- **Disjunction (`OR`):** $\text{Tenure}(A \lor B) = \text{UnionMonths}(\text{Intervals}(A) \cup \text{Intervals}(B))$. A candidate demonstrating Airflow in 2021 and Prefect in 2022 achieves 24 continuous months toward `Airflow OR Prefect`.
- **Conjunction (`AND`):** $\text{Tenure}(A \land B) = \min(\text{Tenure}(A), \text{Tenure}(B))$. For `dbt AND (Spark OR Flink)`, both branches must independently satisfy the duration threshold.

---

## 7. Job Description Seniority Parsing & Non-Metric Safeguards

The seniority parser extracts target experience requirements while implementing strict safeguards against non-experience metrics.

### 7.1 Safeguarded Metrics (Excluded from Seniority Extraction)

The following patterns are explicitly shielded and will never trigger tenure requirements:
- Request rates: `15,000+ RPS`, `200k QPS`
- Latency & performance: `45ms p99`, `68% query response cut`
- Scale counts: `35+ production Airflow DAGs`, `50+ warehouse tables`
- Financial/business metrics: `$10M ARR`, `14 to 5 per month`
- Team size: `Team of 5 engineers`, `Led 8 developers`

### 7.2 Parsed Experience Scopes

- `PROFESSIONAL`: Requires full-time professional experience.
- `TOTAL`: Permits internship and contract tenure.
- `PRODUCTION`: Requires evidence from production environments (`environmentMaturity === 'PRODUCTION'`).
- `SPECIFIC_COMPETENCY`: Requires qualifying tenure within the designated technology.

---

## 8. Seniority Match Decision States & Exact Shortfall/Surplus Formulae

The evaluator outputs one of six authoritative states without artificial rounding:

| Status State | Condition | Score Factor | Shortfall Formula |
| :--- | :--- | :--- | :--- |
| `EXCEEDS_REQUIREMENT` | $\text{Dem} \ge \text{Req} + 12\text{m}$ | $1.00$ | $0\text{m}$ (Surplus: $\text{Dem} - \text{Req}$) |
| `MEETS_REQUIREMENT` | $\text{Req} \le \text{Dem} < \text{Req} + 12\text{m}$ | $1.00$ | $0\text{m}$ (Surplus: $\text{Dem} - \text{Req}$) |
| `PARTIALLY_MEETS_REQUIREMENT` | $\text{Dem} + \text{Intern} \ge \text{Req}$ OR $\text{Shortfall} \le 2\text{m}$ | $0.80 - 0.90$ | $\text{Req} - \text{Dem}$ |
| `BELOW_REQUIREMENT` | $\text{Shortfall} > 2\text{m}$ | $\max(0.10, 1.0 - \frac{\text{Shortfall}}{\text{Req}})$ | $\text{Req} - \text{Dem}$ |
| `AMBIGUOUS` | Date listings lack year bounds | $0.70$ | Flagged with uncertainty |
| `NOT_SPECIFIED` | JD specifies no experience minimum | $1.00$ | $0\text{m}$ |

---

## 9. Canonical Scoring Calibration & Prevention of Double Deductions

A central mandate of Phase 07 is the enforcement of single authoritative accounting.

### 9.1 The Double-Deduction Trap
In previous versions, a candidate with a 1-year experience shortfall suffered:
1. Deduction in the `seniorityFit` subscore (e.g. dropping from 10 points to 4 points).
2. A separate penalty item (`id: 'seniority_shortfall'`) deducting an additional -6 points from the final score.

### 9.2 The Phase 07 Single-Deduction Architecture
In Phase 07:
- The shortfall is absorbed exclusively by the `seniorityFit` subscore through `scoreFactor`.
- The penalties array records zero duplicate deductions for seniority (`penaltyDeduction: 0`).
- The ScoreTrace, dossier exports, and visual breakdown display identical numbers without double-counting.

---

## 10. UI & Dossier Transparency Integration

`src/features/ats/components/AuditTab.tsx` and dossier models now expose the full seniority breakdown:
- Overall status pill (`MEETS_REQUIREMENT`, `BELOW_REQUIREMENT`, etc.).
- Qualifying demonstrated tenure vs required experience.
- Full-time professional months, internship months, and contract months displayed in dedicated cards.
- Exact unrounded shortfall or surplus (e.g. `"-5 months"`, `"+11 months"`).
- Uncertainty alerts when year-only date ranges are detected.

---

## 11. Regression Test Suite Analysis

The complete Phase 07 test suite (`tests/ats/phase07Seniority.test.ts`) verifies 25 core engineering scenarios plus full Benchmark A & B integration:

1. **Scenario 1:** Continuous 24 months (Jan 2022 - Dec 2023 = 24m). (PASS)
2. **Scenario 2:** Sequential non-overlapping roles (12m + 12m = 24m). (PASS)
3. **Scenario 3:** Overlapping full-time roles (24m & 13m unified to 24m, 0 double counting). (PASS)
4. **Scenario 4:** Partial overlap (Jan 2021–Dec 2021 & Jun 2021–May 2022 unified to 17m). (PASS)
5. **Scenario 5:** Concurrent roles (3 simultaneous gigs across 6-month window unified to 6m). (PASS)
6. **Scenario 6:** Internship separation during employment (24m FTE, 3m internship). (PASS)
7. **Scenario 7:** Year-only dates with 11-month uncertainty tracking. (PASS)
8. **Scenario 8:** Current role evaluated strictly against anchor `asOfDate`. (PASS)
9. **Scenario 9:** Missing end date handled gracefully without crash. (PASS)
10. **Scenario 10:** 12-month career gap detected between non-adjacent roles. (PASS)
11. **Scenario 11:** Production internship classification isolated from FTE. (PASS)
12. **Scenario 12:** Contract tenure isolated from full-time professional experience. (PASS)
13. **Scenario 13:** Competency-specific tenure for Python across non-consecutive roles. (PASS)
14. **Scenario 14:** Competency tenure unified across overlapping roles without double counting. (PASS)
15. **Scenario 15:** Compound OR competency tenure (`Airflow OR Prefect` = 24m). (PASS)
16. **Scenario 16:** Compound AND competency tenure (`dbt AND Spark` = 12m minimum). (PASS)
17. **Scenario 17:** Total experience extraction from JD (`5+ years` = 60m). (PASS)
18. **Scenario 18:** Role-specific experience extraction (`3+ years data engineering` = 36m). (PASS)
19. **Scenario 19:** Non-experience metric safeguards (RPS, %, table counts, ARR ignored). (PASS)
20. **Scenario 20:** `MEETS_REQUIREMENT` evaluation (36m for 36m req, shortfall = 0). (PASS)
21. **Scenario 21:** `BELOW_REQUIREMENT` evaluation (24m for 36m req, shortfall = 12m, formatted `"1 year"`). (PASS)
22. **Scenario 22:** Boundary condition +/- 1 month (35m for 36m req, shortfall = 1m, no rounding up). (PASS)
23. **Scenario 23:** Dual `asOfDate` determinism (T1 vs T2 produces strictly monotonic progression). (PASS)
24. **Scenario 24:** Scoring single-accounting invariant (subscore reduces, zero double penalty). (PASS)
25. **Scenario 25:** Full end-to-end evaluation of Benchmark A (Rohan Deshmukh) and Benchmark B (Ananya Rao). (PASS)

---

## 12. Architectural Impact & Invariant Verification

| Test Suite | Total Tests | Status |
| :--- | :--- | :--- |
| `tests/ats/p0Integrity.test.ts` (Phase 02) | 13 | PASS |
| `tests/ats/phase03Ontology.test.ts` (Phase 03) | 11 | PASS |
| `tests/ats/phase04Evidence.test.ts` (Phase 04) | 9 | PASS |
| `tests/ats/phase05Citations.test.ts` (Phase 05) | 19 | PASS |
| `tests/ats/phase06Matching.test.ts` (Phase 06) | 17 | PASS |
| `tests/ats/phase07Seniority.test.ts` (Phase 07) | 26 | PASS |
| **Total ATS Engine Phase Tests** | **95** | **100% PASS** |
| Existing Core & Golden Resumes Suite (`src/features/ats/__tests__/`) | 67 | **100% PASS** |
| Production Build (`tsc && vite build`) | — | **0 Errors** |

---

## 13. Phase Completion Sign-Off & Transition Guidance

Phase 07 is fully verified, mathematically grounded, and complete. All 25 required test cases and all regression benchmarks pass with zero failures.

**Transition Guidance:**
In compliance with user instructions, execution strictly terminates at the completion of Phase 07. The codebase is fully prepared for subsequent phases.
