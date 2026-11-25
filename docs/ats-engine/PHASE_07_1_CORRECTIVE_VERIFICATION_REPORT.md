# benchmark fixtures, git history, date calculation algorithms, and scoring formulas.

This audit resolved seven foundational integrity issues:

1. **Benchmark Version Reconciliation:** Discovered and formalized two distinct historical benchmark versions: V1 (Prompt Specification Draft) and V2 (Canonical Frozen Implementation in Repository), assigning them immutable version identifiers and cryptographic SHA-256 hashes.
2. **Competency Tenure Role Inflation Fix:** Eliminated the defect where mentioning a technology in a single bullet point awarded the full multi-year duration of the role to that technology.
3. **Strict Seniority Scope Enforcement:** Eliminated the loophole where internship experience compensated for full-time professional experience under a `PROFESSIONAL` scope requirement.
4. **Plausible Date Uncertainty Bounds:** Replaced constant uncertainty estimates with formal mathematical minimum and maximum duration bounds $[ \text{minMonths}, \text{maxMonths} ]$, detecting true ambiguity when threshold boundaries lie between bounds.
5. **Compound Boolean Tenure Semantics:** Formally separated alternative union tenure (`OR`) from single-technology accumulation, and enforced bottleneck/concurrency rules for `AND` branches.
6. **Deterministic Canonical Scoring Calibration:** Replaced vague scoring ranges with exact mathematical formulas for `scoreFactor`, confirming zero duplicate penalty deductions.
7. **Independent Classification Dimensions:** Enforced strict orthogonality between employment arrangement, source type, and environment maturity.

---

## 2. Benchmark Version Reconciliation (Gate 1)

During development history, two distinct benchmark draft sets existed. Rather than conflating them or overwriting one with another, both are formally declared in `src/features/ats/fixtures/benchmarkFixtures.ts`:

### 2.1 Benchmark Provenance Table

| Fixture Identifier   | Canonical Identifier               | Normalized SHA-256 Checksum                                        | Employment History                                                                         | Consuming Suites                                                                                                                                               |
| :------------------- | :--------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Benchmark A (V1)** | `BENCHMARK_A_V1_SHIPPULSE_RESUME`  | `478ee589c24fe10ce1f5cf19770f77e4aeed4a06ac3d18b4ef4043a9f351692d` | Rohan Deshmukh / ShipPulse Logistics (June 2025–Present) & Kinetix Intern (Jan–May 2025)   | Phase 01 Spec, Phase 07 Prompt, `phase07Seniority.test.ts` (Gate 1)                                                                                            |
| **Benchmark A (V2)** | `BENCHMARK_A_V2_PAYTECH_RESUME`    | `9d801797f225a2949f91f24aca6f3be38ee65be20c5c8661d9535bf842340096` | Rohan Deshmukh / PayTech Solutions (2021–Present)                                          | `p0Integrity.test.ts`, `phase03Ontology.test.ts`, `phase04Evidence.test.ts`, `phase05Citations.test.ts`, `phase06Matching.test.ts`, `phase07Seniority.test.ts` |
| **Benchmark A JD**   | `BENCHMARK_A_JD`                   | `9292afd6c56a78fb7e63094bc1bc1bc2825aca16d30b2f79fbcab45121000261` | PayGrid Systems / Backend Software Engineer (3+ yrs req)                                   | All Benchmark A test suites                                                                                                                                    |
| **Benchmark B (V1)** | `BENCHMARK_B_V1_LENDBRIDGE_RESUME` | `a430de9b3a82354a5e7d77d2250eee73648c81e6305e4d993afe7585bcf71220` | Ananya Rao / LendBridge Technologies (Apr 2024–Present) & CartSpring Intern (Jan–Jun 2023) | Phase 01 Spec, Phase 07 Prompt, `phase07Seniority.test.ts` (Gate 1)                                                                                            |
| **Benchmark B (V2)** | `BENCHMARK_B_V2_DATAFLOW_RESUME`   | `f3dfe3ba7af6ffc9f96f9b63271da37f6a6f33369d0e16d16d3a288310f13350` | Ananya Rao / DataFlow Analytics (2022–Present) & CloudScale Labs Intern (2021–2022)        | `p0Integrity.test.ts`, `phase03Ontology.test.ts`, `phase04Evidence.test.ts`, `phase05Citations.test.ts`, `phase06Matching.test.ts`, `phase07Seniority.test.ts` |
| **Benchmark B JD**   | `BENCHMARK_B_JD`                   | `262a5236ccd2ace6286fe9d65501198585981651a7512e301bdd2e8adaea3850` | Northstar Credit / Data Engineer (3+ yrs req)                                              | All Benchmark B test suites                                                                                                                                    |

---

## 3. Competency Tenure Audit and Fixes (Gate 2)

### 3.1 The Role-Duration Inheritance Defect

In Phase 07, `calculateCompetencyTenure()` matched roles demonstrating a competency and pushed the entire role interval into `matchingIntervals`:

```ts
// Flawed Phase 07 behavior:
if (demonstrated) {
  matchingIntervals.push({
    start: interval.startMonthIndex,
    end: interval.endMonthIndex,
  });
}
```

If a candidate held a 36-month role (Jan 2022 to Dec 2024) and listed one bullet mentioning PostgreSQL optimization, the engine credited the candidate with 36 months of continuous PostgreSQL experience.

### 3.2 The Phase 07.1 Distinction

Phase 07.1 implements a 5-tier classification in `tenureCalculator.ts`:

1. **Employment Interval:** Total calendar span of the role ($[s, e]$, duration $M_{\text{role}}$).
2. **Evidence Occurrences:** Exact count of distinct bullet statements or evidence records referencing the technology ($N_{\text{occ}}$).
3. **Explicit Usage Interval:** Where a bullet states explicit duration (e.g. _"Led a 6-month PostgreSQL optimization project"_).
4. **Proven Competency Duration (`EXPLICITLY_PROVEN`):** Exact duration supported by verbatim text.
5. **Role-Bounded Uncertain Duration (`ROLE_BOUNDED_UNCERTAIN`):** Where explicit duration is absent:
   - `provenMonths`: `undefined` (engine refuses to manufacture a duration).
   - `minPossibleMonths`: $\min(M_{\text{role}}, \max(1, N_{\text{occ}}))$.
   - `maxPossibleMonths`: $M_{\text{role}}$ (role upper bound).
   - `isDurationUncertain`: `true`.

---

## 4. Seniority Scope Audit and Fixes (Gate 3)

The engine enforces four distinct scopes in `seniorityMatcher.ts`:

1. **`PROFESSIONAL` Scope:** Only full-time professional employment (`totalProfessionalMonths`) qualifies. Internships are completely excluded from qualifying months. If a candidate has 2 years FTE + 1 year internship against a 3-year professional requirement, the result is `BELOW_REQUIREMENT` (shortfall: 12 months). Internships are reported only as supporting educational context.
2. **`TOTAL` Scope:** Unions full-time, contract, part-time, and internships (`totalWorkMonths`). 2 years FTE + 1 year internship against 3-year total requirement yields `MEETS_REQUIREMENT`.
3. **`PRODUCTION` Scope:** Only intervals operating in verified production environments (`environmentMaturity === 'PRODUCTION'`) qualify. 3 years professional employment with only 1 year in production yields `BELOW_REQUIREMENT` (24 months shortfall).
4. **`SPECIFIC_COMPETENCY` Scope:** Evaluates supported tenure for the designated technology.
   - If candidate has 3 years employment but only 6 months of supported Python experience against a 2-year Python requirement, the result is `BELOW_REQUIREMENT` (18 months shortfall).
   - If candidate has 3 years employment with PostgreSQL mentioned once without explicit duration, the result is `AMBIGUOUS`.

---

## 5. Date Uncertainty Policy (Gate 4)

Date calculations adhere to mathematically explicit min-max bounds:

| Date Listing Format                    | Start Bound | End Bound   | Minimum Duration | Maximum Duration | Standard Midpoint | Uncertainty |
| :------------------------------------- | :---------- | :---------- | :--------------- | :--------------- | :---------------- | :---------- |
| **`YYYY - YYYY` (e.g. `2021 - 2023`)** | Dec 2021    | Jan 2023    | 14 months        | 36 months        | 24 months         | 22 months   |
| **Single `YYYY` (e.g. `2022`)**        | Dec 2022    | Dec 2022    | 1 month          | 12 months        | 12 months (upper) | 11 months   |
| **`Month YYYY - Month YYYY`**          | Exact month | Exact month | Exact duration   | Exact duration   | Exact duration    | 0 months    |
| **`Month YYYY - Present`**             | Exact month | `asOfDate`  | $D - 1$          | $D$              | Active month      | 1 month     |

**Threshold Ambiguity Invariant:**
When an employer requirement $R$ falls strictly within candidate bounds ($M_{\text{min}} < R \le M_{\text{max}}$), the engine reports `status: 'AMBIGUOUS'` with `scoreFactor: 0.70`, refusing to guess whether the candidate started in January or December.

---

## 6. Compound Competency Tenure Semantics (Gate 5)

Compound boolean tenure expressions are evaluated with strict semantic honesty:

- **Disjunctive (`OR`, e.g. `Airflow OR Prefect`):**
  - Evaluates individual branch durations independently (Airflow: 12m, Prefect: 12m).
  - Combined alternative tenure: 24m union.
  - The explanation explicitly notes: _"Does not represent continuous usage of any single technology."_
- **Conjunctive (`AND`, e.g. `dbt AND Spark`):**
  - Requires all mandatory branches to be demonstrated; any missing branch forces `combinedMonths = 0`.
  - Independent capability across distinct roles is governed by the bottleneck branch: $\min(M_{\text{dbt}}, M_{\text{spark}})$.
  - Concurrent usage in the same role is enforced via interval intersection when `requireConcurrent` is enabled.

---

## 7. Complete Canonical Scoring Formula (Gate 6)

The final ATS score is computed authoritatively via:

$$\text{FinalScore} = \text{Clamp}\left(\text{RawSubtotal} - \sum \text{Penalties}, 0, 100\right)$$

Where:
$$\text{RawSubtotal} = \text{mustHaveCoverage} + \text{evidenceDepth} + \text{impactMetrics} + \text{projectsAndOss} + \text{seniorityFit} + \text{formatAndParse} + \text{tierFit}$$

### 7.1 Seniority Dimension Contribution

Seniority weight $W_{\text{seniority}} = 10$ (standard) or $0$ (fresher $\le 1$ year).
$$\text{seniorityFitScore} = \text{Round}\left(S_{\text{factor}} \times W_{\text{seniority}} \times 10\right) / 10$$

Deterministic selection rules for $S_{\text{factor}}$:

1. `EXCEEDS_REQUIREMENT` or `MEETS_REQUIREMENT` or `NOT_SPECIFIED`:
   $$S_{\text{factor}} = 1.00$$
2. `PARTIALLY_MEETS_REQUIREMENT` ($\text{shortfall} \le 2\text{ months}$):
   $$S_{\text{factor}} = \text{Round}\left(\left(1.00 - \frac{\text{shortfallMonths}}{\text{reqMonths}} \times 0.50\right) \times 100\right) / 100$$
3. `BELOW_REQUIREMENT` ($\text{shortfall} > 2\text{ months}$):
   $$S_{\text{factor}} = \max\left(0.10, \text{Round}\left(\left(1.00 - \frac{\text{shortfallMonths}}{\text{reqMonths}}\right) \times 100\right) / 100\right)$$
4. `AMBIGUOUS`:
   $$S_{\text{factor}} = 0.70 \quad (\text{provisional})$$

### 7.2 Zero Double-Penalties Invariant

The seniority shortfall is absorbed **exclusively** by the `seniorityFit` subscore reduction. The `penalties` array applies zero duplicate deductions for seniority (`penaltyDeduction: 0`), preventing double-counting.

### 7.3 Three Worked Scoring Examples

#### Worked Example 1: Candidate Meets Minimum Requirement

- Experience: 36 months full-time (2021–2023) against 3-year requirement.
- Status: `MEETS_REQUIREMENT`, $S_{\text{factor}} = 1.00$.
- Seniority Contribution: $1.00 \times 10 = \mathbf{10.0 / 10}$.
- Duplicate Penalties: 0.

#### Worked Example 2: Candidate Narrowly Misses Minimum (1-Month Shortfall)

- Experience: 35 months full-time (Jan 2021–Nov 2023) against 36 months required.
- Status: `PARTIALLY_MEETS_REQUIREMENT`, $S_{\text{factor}} = 1.00 - (1/36 \times 0.50) = \mathbf{0.99}$.
- Seniority Contribution: $0.99 \times 10 = \mathbf{9.9 / 10}$.
- Duplicate Penalties: 0.

#### Worked Example 3: Strong Alignment but Insufficient Professional Tenure

- Experience: 24 months full-time (2 years) against 5-year senior requirement (60 months).
- Status: `BELOW_REQUIREMENT`, Shortfall: 36 months, Ratio: $36/60 = 0.60$, $S_{\text{factor}} = 1.00 - 0.60 = \mathbf{0.40}$.
- Seniority Contribution: $0.40 \times 10 = \mathbf{4.0 / 10}$.
- Duplicate Penalties: 0.

---

## 8. Employment & Environment Classification Verification (Gate 7)

The engine enforces strict independence across three orthogonal dimensions:

- **Arrangement:** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`, `INTERNSHIP`.
- **Source Type:** `PROFESSIONAL_EXPERIENCE`, `INTERNSHIP`, `PERSONAL_PROJECT`, `ACADEMIC_PROJECT`, `COURSEWORK`.
- **Environment Maturity:** `PRODUCTION`, `STAGING`, `DEVELOPMENT`, `PROTOTYPE`, `UNKNOWN`.

**Orthogonality Invariants Verified:**

1. A technical title (`Senior Distributed Systems Architect`) in a research prototype does NOT infer production maturity.
2. A project title (`Enterprise Banking Engine`) under personal projects does NOT infer professional employment.
3. A production internship retains `INTERNSHIP` arrangement while preserving `PRODUCTION` environment tags.

---

## 9. Changed Files and Relevant Code Paths

| File Path                                                      | Description of Changes                                                                                                                                  |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/features/ats/fixtures/benchmarkFixtures.ts`               | **NEW**: Archives both V1 and V2 benchmark fixtures with immutable SHA-256 hashes.                                                                      |
| `src/features/ats/engine/tenureCalculator.ts`                  | Implemented competency bounding (`ROLE_BOUNDED_UNCERTAIN`), min-max date uncertainty, and compound boolean semantics.                                   |
| `src/features/ats/engine/seniorityMatcher.ts`                  | Implemented strict scope gates (`PROFESSIONAL`, `TOTAL`, `PRODUCTION`, `SPECIFIC_COMPETENCY`), date ambiguity gates, and deterministic scoring factors. |
| `src/features/ats/engine/scorer.ts`                            | Verified single authoritative accounting, zero double-penalties, and calibrated seniority subscore factor.                                              |
| `tests/ats/phase07Seniority.test.ts`                           | Corrective verification test suite covering Gates 1–8 with 23 targeted test blocks.                                                                     |
| `docs/ats-engine/PHASE_07_1_CORRECTIVE_VERIFICATION_REPORT.md` | **NEW**: Complete Phase 07.1 technical verification report.                                                                                             |

---

## 10. Test and Build Verification (Gate 8)

### 10.1 Test Execution Results

```bash
$ npx vitest run tests/ats/
```

Output:

- `tests/ats/phase03Ontology.test.ts`: **11 passed**
- `tests/ats/phase06Matching.test.ts`: **17 passed**
- `tests/ats/phase04Evidence.test.ts`: **9 passed**
- `tests/ats/p0Integrity.test.ts`: **13 passed**
- `tests/ats/phase05Citations.test.ts`: **19 passed**
- `tests/ats/phase07Seniority.test.ts`: **23 passed**
- **Total Test Files:** 6 passed (6)
- **Total Tests:** 92 passed (92)
- **Failed Tests:** 0

### 10.2 Production Build Results

```bash
$ npm run build
```

Output:

- `tsc`: 0 errors
- `vite v8.3.0 building for production...`: **✓ built in 5.90s**
- `dist/index.html`: 2.96 kB
- PWA assets injected: 93

---

## 11. Remaining Limitations & Transition Guidance

1. **Uncertainty Bounds in UI:** While `AuditTab.tsx` displays the uncertainty warning and shortfall/surplus, interactive range sliders for recruiter sensitivity testing are deferred to UI polishing phases.
2. **Title-Derived Role Scopes:** Roles with generic titles (e.g. "Associate") rely on bullet text for domain classification.
   HireFlow ATS Resume Roaster — Phase 07.1 Corrective Verification Report

# Tenure Accuracy, Benchmark Integrity and Scoring Validation

**Document Version:** 1.0.0  
**Phase Status:** Complete  
**Engine Version:** 4.7.1  
**Target Date:** 2026-11-24  
**Authors:** DeepMind Antigravity Engineering Taskforce  
**Commit SHA:** `5412214ee8fc0f7580fd5830776dba40fddc39ef`

---

## 1. Executive Summary

Phase 07.1 is a dedicated correctness and integrity pass on the HireFlow ATS Resume Roaster engine following Phase 07. Rather than assuming the reported Phase 07 implementation was flawless because tests passed, an exhaustive audit was conducted across the source code,
**STOPPING AT PHASE 07.1:** In adherence to strict user instructions, Phase 08 has not been initiated.
