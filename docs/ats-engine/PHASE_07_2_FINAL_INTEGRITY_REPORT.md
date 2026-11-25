# HIREFLOW ATS RESUME ROASTER — PHASE 07.2 FINAL INTEGRITY REPORT
## Final Tenure, Seniority and Evidence-Bound Scoring Corrections

**Phase:** Phase 07.2 (Final Tenure, Seniority and Evidence-Bound Scoring Corrections)  
**Status:** COMPLETE & VERIFIED  
**Date:** November 2026  
**Commitment:** Phase 07.2 execution completed. Phase 08 is strictly deferred.

---

## 1. Executive Summary & Audit Overview

Phase 07.2 constitutes a surgical, evidence-bound correctness and integrity pass across the HireFlow ATS Resume Roaster engine. Following the initial architectural foundations in Phase 07 and the reconciliation pass in Phase 07.1, Phase 07.2 permanently remediated mathematical, conceptual, and logical boundary conditions identified in competency duration derivation, fresher scoring behavior, date midpoint arithmetic, employment classification orthogonalities, and safe explicit duration combination.

### Key Achievements in Phase 07.2:
1. **Gate 1 — Competency Tenure Lower Bound Decoupling:** Permanently removed the flawed formula `minPossibleMonths = min(roleMonths, max(1, count))`. Occurrence counts (1, 5, or 10 mentions) do not establish elapsed time. Technology-specific duration without explicit timeframes is now strictly reported as `minPossibleMonths = undefined` and `durationStatus = 'ROLE_BOUNDED_UNCERTAIN'`, bounded above by the containing role duration without manufacturing unearned positive duration.
2. **Gate 2 — Fresher Scoring Invariant Restoration:** Fixed the defect where candidates with $\le 1$ year experience had the seniority dimension zeroed out ($W_{\text{seniority}} = 0$) even when the job description explicitly mandated 2+, 3+, or 5+ years of experience. SeniorityFit weight is now strictly retained whenever the JD mandates experience, recording an explicit `eligibility` ledger with `isEligible: false` and exact shortfall months. Seniority weight redistribution is now strictly reserved for entry-level positions requiring 0 years experience.
3. **Gate 3 — Midpoint Arithmetic & Date Boundary Policies:** Corrected mathematical midpoint calculations without rounding distortions ($\text{midpoint}(14, 36) = 25$, $\text{midpoint}(1, 12) = 6.5$). Clarified and enforced the rule that midpoints are descriptive statistical summaries only and are never used to decide pass/fail eligibility. Formalized the ongoing active-month inclusion policy for current roles (`ongoingActiveMonthIncluded: true` with completed calendar months prior to current date documented separately).
4. **Gate 4 — Independent Employment Arrangement vs. Classification:** Formally decoupled employment `arrangement` (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`, `INTERNSHIP`) from `professionalClassification` (`PROFESSIONAL`, `NON_PROFESSIONAL`, `AMBIGUOUS`). Verified contract and freelance engineering engagements with deliverables now qualify under `PROFESSIONAL` scope, while internships remain strictly excluded from `PROFESSIONAL` scope and are credited under `TOTAL` scope.
5. **Gate 5 — Safe Combination of Explicit Durations:** Implemented formal categorization of duration placement (`KNOWN_CALENDAR_INTERVAL`, `EXPLICIT_KNOWN_PLACEMENT`, `EXPLICIT_UNKNOWN_PLACEMENT`, `ROLE_BOUNDED_UNCERTAIN`, `NO_MEASURABLE_DURATION`). Disjoint non-overlapping roles safely sum explicit durations; overlapping roles are strictly capped at the calendar union of containing roles to prevent double-counting.
6. **Gate 6 — Comprehensive Source-Type Taxonomy:** Verified complete taxonomy across `evidenceModel.ts` and related extractors (`PROFESSIONAL_EXPERIENCE`, `INTERNSHIP`, `PERSONAL_PROJECT`, `ACADEMIC_PROJECT`, `COURSEWORK`, `RESEARCH`, `OPEN_SOURCE`, `HACKATHON`, `CLIENT_PROJECT`, `CLIENT_WORK`, `FREELANCE`, `UNKNOWN`).
7. **Gate 7 — Immutable Benchmark Provenance Ledger:** Exported `BENCHMARK_PROVENANCE_HASHES` maintaining cryptographic SHA-256 hashes for all Benchmark A and B V1 and V2 fixtures and JDs.
8. **Gate 8 — Verification:** 99/99 automated tests passing in Vitest (including 30 dedicated seniority and tenure tests), zero TypeScript compilation errors, and successful production Vite build.

---

## 2. Gate 1 — Fix Competency Tenure Lower Bounds

### 2.1 The Occurrence Inflation Flaw
Prior to Phase 07.2, the engine derived minimum possible months using:
$$\text{minPossibleMonths} = \min(M_{\text{role}}, \max(1, N_{\text{occurrences}}))$$

This formula violated fundamental principles of evidence verification:
- One bullet mentioning PostgreSQL does not prove 1 month of PostgreSQL experience.
- Five bullets mentioning PostgreSQL do not prove 5 months of PostgreSQL experience.
- Ten repeated mentions do not prove 10 months of PostgreSQL experience.

### 2.2 Phase 07.2 Decoupled Representation
In `src/features/ats/engine/tenureCalculator.ts`, `CompetencyTenureResult` was refactored to enforce strict orthogonal dimensions:

```ts
export interface CompetencyTenureResult {
  competencyId: string;
  durationStatus: 'EXPLICITLY_PROVEN' | 'ROLE_BOUNDED_UNCERTAIN' | 'UNKNOWN_DURATION' | 'NOT_DEMONSTRATED';
  durationConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  placementKind?: 'KNOWN_CALENDAR_INTERVAL' | 'EXPLICIT_KNOWN_PLACEMENT' | 'EXPLICIT_UNKNOWN_PLACEMENT' | 'ROLE_BOUNDED_UNCERTAIN' | 'NO_MEASURABLE_DURATION';
  evidenceOccurrenceCount: number;
  employmentMonths: number;
  explicitUsageMonths?: number;
  provenCompetencyMonths?: number;
  minPossibleMonths?: number; // undefined when duration is unstated!
  maxPossibleMonths: number;  // containing role upper bound
  usageInterval?: { start: string; end: string } | null;
  // Backward-compatible aliases
  tenureAssessment: CompetencyTenureAssessment;
  provenMonths?: number;
  roleDurationMonths: number;
  isDurationUncertain: boolean;
  evidenceOccurrences: number;
  contributingRoles: string[];
  formattedDuration: string;
  explanation: string;
}
```

### 2.3 Evaluation Invariants
| Evidence Condition | `evidenceOccurrenceCount` | `employmentMonths` | `explicitUsageMonths` | `provenCompetencyMonths` | `minPossibleMonths` | `maxPossibleMonths` | `durationStatus` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **No Mentions** | 0 | 0 | `undefined` | 0 | 0 | 0 | `NOT_DEMONSTRATED` |
| **1 Mention, No Duration** (e.g. in 36m role) | 1 | 36 | `undefined` | `undefined` | `undefined` | 36 | `ROLE_BOUNDED_UNCERTAIN` |
| **5 Mentions, No Duration** (e.g. in 36m role) | 5 | 36 | `undefined` | `undefined` | `undefined` | 36 | `ROLE_BOUNDED_UNCERTAIN` |
| **10 Mentions, No Duration** (e.g. in 36m role) | 10 | 36 | `undefined` | `undefined` | `undefined` | 36 | `ROLE_BOUNDED_UNCERTAIN` |
| **1 Mention with Explicit Duration** ("6 months") | 1 | 36 | 6 | 6 | 6 | 36 | `EXPLICITLY_PROVEN` |

---

## 3. Gate 2 — Correct Fresher Scoring Behavior

### 3.1 Defect Analysis
In earlier iterations of `scorer.ts`, candidate tenure $\le 1$ year triggered:
```ts
const isFresher = candidateYears <= 1;
const activeWeights = isFresher ? { ...weights, seniorityFit: 0, ... } : weights;
```
If a fresher applied for a Senior Backend Engineer role requiring 4 or 5 years, setting $W_{\text{seniority}} = 0$ completely shielded the candidate from any seniority deduction or shortfall flag. The candidate received full marks across other dimensions without penalty for the 4-year experience deficit.

### 3.2 Phase 07.2 Invariant & Implementation
An explicit JD experience requirement must never disappear merely because a candidate is classified as a fresher.

In `src/features/ats/engine/scorer.ts`:
```ts
const explicitRequiredYears = input.seniorityMatchResult !== undefined
  ? input.seniorityMatchResult.requiredYears
  : (input.requiredYears !== undefined ? input.requiredYears : 0);

const hasExplicitExperienceReq = explicitRequiredYears > 0;
const isFresher = candidateYears <= 1;

// SeniorityFit weight is ONLY redistributed if the role itself is entry-level (requires 0 experience).
// When the JD explicitly mandates experience (e.g. 2, 3, 5 years), the seniority dimension is retained.
const shouldRedistributeSeniority = isFresher && !hasExplicitExperienceReq;

const activeWeights = shouldRedistributeSeniority
  ? {
      ...weights,
      seniorityFit: 0,
      projectsAndOss: weights.projectsAndOss + 5,
      evidenceDepth: weights.evidenceDepth + 5,
    }
  : weights;
```

### 3.3 Explicit Eligibility Ledger
The scorer now outputs an authoritative `eligibility` block:
```ts
eligibility: {
  isEligible: boolean;
  shortfallMonths: number;
  requiredYears: number;
  demonstratedYears: number;
  scope: SeniorityScope;
}
```
When a fresher (0.5 years) applies for a 4-year role ($R = 48\text{m}$):
- `activeWeights.seniorityFit` = 10.
- `subscores.seniorityFit` = 1.0 (calibrated penalty factor 0.10 applied).
- `eligibility.isEligible` = `false`.
- `eligibility.shortfallMonths` = 42 months.

When a fresher applies for an entry-level role ($R = 0\text{m}$):
- `activeWeights.seniorityFit` = 0 (redistributed to projects and evidence).
- `eligibility.isEligible` = `true`.
- `eligibility.shortfallMonths` = 0 months.

---

## 4. Gate 3 — Midpoint Arithmetic & Date Boundaries

### 4.1 Arithmetic Correction
In `tenureCalculator.ts`, the mathematical midpoint helper was formalized:
$$\text{calculateMidpoint}(a, b) = \frac{a + b}{2}$$
- Midpoint of 14 and 36: $(14 + 36) / 2 = 50 / 2 = 25$ (previously misreported as 24 in informal notes).
- Midpoint of 1 and 12: $(1 + 12) / 2 = 13 / 2 = 6.5$ (previously misreported as 12).

### 4.2 Ambiguity vs. Pass/Fail Decision Policy
**Critical Invariant:** Midpoints are descriptive statistical summaries and are NEVER used to decide pass/fail eligibility.
When requirement $R$ falls between minimum possible months and maximum possible months ($M_{\text{min}} < R \le M_{\text{max}}$), the engine marks the evaluation as `AMBIGUOUS` with a deterministic factor of 0.70. It does NOT compare $R$ to the midpoint to guess whether the candidate passes or fails.

### 4.3 Ongoing Active Month Inclusion Policy
For ongoing positions ("Month YYYY - Present" evaluated at `asOfDate`):
- `ongoingActiveMonthIncluded: true` (the current calendar month touched is included in the interval span).
- `completedMonths`: $D - 1$ (the count of full calendar months completed prior to the current month).
- Example: June 2025 to November 24, 2026:
  - Start month index: $2025 \times 12 + 5$.
  - End month index: $2026 \times 12 + 10$.
  - Calendar months touched: $17 + 1 = 18$ months.
  - Full calendar months completed: 17 months.
  - Active current month (November 2026): counted as active month touched.

---

## 5. Gate 4 — Professional, Contract, and Freelance Scope

### 5.1 Orthogonal Dimensions
Employment arrangement and professional classification are maintained as separate fields in `evidenceModel.ts` and `tenureCalculator.ts`:
- **`arrangement` (`EmploymentType`):** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `FREELANCE`, `INTERNSHIP`, `APPRENTICESHIP`, `VOLUNTEER`.
- **`professionalClassification`:** `PROFESSIONAL`, `NON_PROFESSIONAL`, `AMBIGUOUS`.

### 5.2 Scope Rules
1. **`PROFESSIONAL` Scope:**
   - Includes all intervals with `professionalClassification === 'PROFESSIONAL'`.
   - Full-time employment and verified professional contract/freelance engineering engagements with deliverables qualify.
   - Internships, apprenticeships, and volunteer work are classified as `NON_PROFESSIONAL` and do NOT qualify.
2. **`TOTAL` Scope:**
   - Unions all work intervals (`FULL_TIME`, `CONTRACT`, `FREELANCE`, `PART_TIME`, `INTERNSHIP`, `APPRENTICESHIP`).
3. **`PRODUCTION` Scope:**
   - Strictly restricted to roles/evidence operating in verified `PRODUCTION` environments.

---

## 6. Gate 5 — Safe Combination of Explicit Usage Durations

### 6.1 Placement Taxonomy
To prevent duration inflation across multiple roles, duration placements are classified into five explicit categories:
1. `KNOWN_CALENDAR_INTERVAL`: Exact start and end calendar months known.
2. `EXPLICIT_KNOWN_PLACEMENT`: Explicit duration within a known calendar slice.
3. `EXPLICIT_UNKNOWN_PLACEMENT`: Explicit duration stated in a bullet (e.g. "for 6 months"), but exact calendar boundaries within the containing role are unstated.
4. `ROLE_BOUNDED_UNCERTAIN`: Mentioned without stated duration; bounded above by role duration.
5. `NO_MEASURABLE_DURATION`: Not demonstrated or unattached to employment/project records.

### 6.2 Combination Logic
- **Disjoint Roles:** If a candidate demonstrates 6 months explicit PostgreSQL usage in Role A (2021) and 6 months explicit PostgreSQL usage in Role B (2022), the explicit durations safely sum to 12 months because the containing roles are non-overlapping.
- **Concurrent/Overlapping Roles:** If roles overlap in time, the sum of explicit durations is strictly capped at the calendar interval union of the containing roles, preventing double-counting.

---

## 7. Gate 6 — Complete Source-Type Taxonomy

In `src/features/ats/engine/evidenceModel.ts`, the `EvidenceSource` and `ProfessionalClassification` types were validated for full structural completeness:

```ts
export type EvidenceSource =
  | 'PROFESSIONAL_EXPERIENCE'
  | 'INTERNSHIP'
  | 'PERSONAL_PROJECT'
  | 'ACADEMIC_PROJECT'
  | 'HACKATHON'
  | 'OPEN_SOURCE'
  | 'CLIENT_PROJECT'
  | 'CLIENT_WORK'
  | 'FREELANCE'
  | 'RESEARCH'
  | 'COURSEWORK'
  | 'CERTIFICATION'
  | 'SKILLS_SECTION'
  | 'SUMMARY'
  | 'OTHER'
  | 'UNKNOWN';

export type ProfessionalClassification = 'PROFESSIONAL' | 'NON_PROFESSIONAL' | 'AMBIGUOUS';
```

---

## 8. Gate 7 — Benchmark Provenance and Hash Preservation

Both historical benchmark versions (V1 prompt specification and V2 repository implementation) are preserved in `src/features/ats/fixtures/benchmarkFixtures.ts`. The immutable cryptographic ledger is exported as `BENCHMARK_PROVENANCE_HASHES`:

```ts
export const BENCHMARK_PROVENANCE_HASHES = {
  benchmark_a_v1_shippulse_lf: '478ee589c24fe10ce1f5cf19770f77e4aeed4a06ac3d18b4ef4043a9f351692d',
  benchmark_a_v2_paytech_lf: '9d801797f225a2949f91f24aca6f3be38ee65be20c5c8661d9535bf842340096',
  benchmark_a_jd_lf: '9292afd6c56a78fb7e63094bc1bc1bc2825aca16d30b2f79fbcab45121000261',
  benchmark_b_v1_lendbridge_lf: 'a430de9b3a82354a5e7d77d2250eee73648c81e6305e4d993afe7585bcf71220',
  benchmark_b_v2_dataflow_lf: 'f3dfe3ba7af6ffc9f96f9b63271da37f6a6f33369d0e16d16d3a288310f13350',
  benchmark_b_jd_lf: '262a5236ccd2ace6286fe9d65501198585981651a7512e301bdd2e8adaea3850',
};
```

---

## 9. Gate 8 — Verification & Test Results

### 9.1 Test Execution Summary
- **Test Command:** `npx vitest run tests/ats/`
- **Results:** 6 test files passed, **99 tests passed (0 failed, 0 skipped)**.
- **Duration:** 10.74s.

| Test File | Test Count | Focus |
| :--- | :--- | :--- |
| `phase07Seniority.test.ts` | 30 passed | Phase 07.2 Bounded Tenure, Midpoints, Fresher Scoring, Contract Scope, Hash Verification |
| `phase06Matching.test.ts` | 17 passed | Semantic Equivalence, Related Concepts, Non-Equivalence, Compound Boolean |
| `phase05Citations.test.ts` | 19 passed | Verbatim Citation Integrity, Character-Exact Offsets, Claim Verification |
| `phase04Evidence.test.ts` | 9 passed | Structured Evidence Model, Provenance, Environment Maturity |
| `phase03Ontology.test.ts` | 11 passed | Technical Graph, Transitive Relationships, Disambiguation |
| `p0Integrity.test.ts` | 13 passed | Candidate & Company Identity Isolation, Score Invariants, Single Source of Truth |
| **Total** | **99 passed** | **100% Deterministic Local ATS Suite** |

### 9.2 Build Verification
- **Build Command:** `npm run build` (`tsc && vite build`)
- **Status:** EXITED WITH CODE 0 (0 TypeScript errors, 0 Vite build errors).

---

## 10. Conclusion & Stop Directive

Phase 07.2 has resolved every identified defect in tenure bounding, occurrence decoupling, fresher scoring invariants, date midpoint arithmetic, and professional scope handling.

**Per instructions:**
- Phase 07.2 is now complete.
- All modifications are committed to the working tree.
- **Phase 08 is NOT started.** Execution halts here awaiting further user directives.
