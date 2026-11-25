# HIREFLOW ATS RESUME ROASTER — PHASE 08.4
## Final Scoring Authority, Scope-Correct Seniority & ScoreTrace Integrity Report

**Date:** 2026-11-25  
**Git Base Commit (`HEAD`):** `5412214ee8fc0f7580fd5830776dba40fddc39ef` (plus Phase 08.4 working-tree changes)  
**Scope:** Corrective implementation closing Phase 08.4 architectural defects without redesigning export architecture, modifying Phase 07 competency weights, or beginning Phase 09.

---

## 1. Executive Summary

Phase 08.4 resolved two core architectural defects surfaced during the Phase 08.3 reconciliation audit alongside duplicate deduction paths and end-to-end citation support serialization checks:

1. **Scope-Correct Seniority Evaluation (Gate 1):** `tenureCalculator.ts` and `seniorityMatcher.ts` now enforce scope-specific calendar-union bounds so `PROFESSIONAL` scope evaluates strictly against full-time professional bounds (`minPossibleProfessionalMonths`, `maxPossibleProfessionalMonths`) and never falls back to `TOTAL_EXPERIENCE` / overall work bounds containing internships. For the frozen Northstar V2 benchmark (`BENCHMARK_B_V2_DATAFLOW_RESUME` evaluated at `2024-11-24` against a `36m` `EXPLICIT_EMPLOYER` `PROFESSIONAL` requirement), Ananya's `2022 - Present` professional employment (`24m–35m` touched, `23m–34m` completed) strictly satisfies `maxQualifyingTouched (35) < requiredMonths (36)`, switching the verdict from `AMBIGUOUS` (`scoreFactor: 0.70`, `seniorityFit: 7.0`) to `BELOW_REQUIREMENT` (`scoreFactor: 0.97`, `seniorityFit: 9.7`, `isEligible: false`, `shortfallMonths: 1`, `completedShortfallMonths: 2`), with the `2021 - 2022` `INTERNSHIP` at `CloudScale Labs` strictly excluded from professional scope.
2. **Unified Canonical Scoring Authority & Trace (Gate 2):** Eliminated the dual 5-pillar `runScoringEngine()` composite divergence and composite overwriting in `src/features/ats/engine/index.ts`. `computeAtsScore()` in `src/features/ats/engine/scorer.ts` now directly constructs the unified 7-dimension `ScoreTrace` (`specVersion: '4.0.0-ats7d'`, `engineVersion: '4.0.0'`), which `AuthoritativeReportSnapshot` and `dossierModel.ts` consume directly with exact arithmetic reconciliation: `RawSubtotal = Sum(7 dimensions)`, `PreClampScore = RawSubtotal + Bonuses - Deductions`, `FinalScore = Clamp(Round(PreClampScore), 0, 100)`.
3. **Single-Owner Deduction Ledger (Gate 3):** Eliminated overlapping penalties between `formatAndParse` (`-2` missing standard section and `-1.5` missing email/phone) and the `penalties` ledger (`missing_education: -3` and `no_contact_info: -5`). Every deduction now carries explicit `owner` and `cause` provenance fields across four clean education scenarios.
4. **Orthogonal `ClaimSupportStatus` Round-Trip Proof (Gate 4):** Verified all 7 `ClaimSupportStatus` values paired orthogonally with distinct `CitationValidationStatus` values across Snapshot creation, JSON serialization/deserialization, History hydration, `buildDossierModel`, PDF text extraction (`pdfjs-dist`), and DOCX XML unpacking (`word/document.xml`).

---

## 2. Gate 1 — Scope-Specific Seniority Evaluation & Duration Measures

### Root Cause
When evaluating year-only or date-uncertain intervals under `PROFESSIONAL` scope, `evaluateSeniorityFit()` previously read overall work bounds (`minPossibleWorkMonths` / `maxPossibleWorkMonths`) that included internship intervals. Because `CloudScale Labs | 2021 - 2022` (`INTERNSHIP`) pushed Northstar's `maxPossibleWorkMonths` to `47`, the interval `[minWork, maxWork]` straddled `36` and produced `AMBIGUOUS` (`0.70`) instead of `BELOW_REQUIREMENT`.

### Implemented Changes
- **`src/features/ats/engine/tenureCalculator.ts`:**
  - Added `minStartMonthIndex` and `minEndMonthIndex` onto `CalendarMonthInterval`.
  - Added scope-specific calendar-union bounds to `TenureBreakdown`:
    - `minPossibleProfessionalMonths`
    - `maxPossibleProfessionalMonths`
    - `minPossibleCompletedProfessionalMonths`
    - `maxPossibleCompletedProfessionalMonths`
    - `hasProfessionalYearOnlyIntervals`
    - `minPossibleCompletedWorkMonths`
    - `maxPossibleCompletedWorkMonths`
    - Union-calculated `minPossibleWorkMonths` / `maxPossibleWorkMonths`
- **`src/features/ats/engine/seniorityMatcher.ts`:**
  - Extended `SeniorityMatchResult` with `touchedMonths`, `minPossibleQualifyingMonths`, `maxPossibleQualifyingMonths`, `minPossibleCompletedQualifyingMonths`, `maxPossibleCompletedQualifyingMonths`, `touchedShortfallMonths`, and `completedShortfallMonths`.
  - Updated `evaluateSeniorityFit()` decision logic so `PROFESSIONAL` scope inspects strictly `[minPossibleProfessionalMonths, maxPossibleProfessionalMonths]` (`hasProfessionalYearOnlyIntervals`), whereas `TOTAL_EXPERIENCE` inspects work bounds.
- **`src/features/ats/engine/authoritativeSnapshot.ts` & `src/features/dossier/dossierModel.ts`:**
  - Propagated Gate 1 integer month counters, qualifying bounds, touched/completed shortfalls, provenance, scope, and eligibility fields end to end across Snapshot, Dossier, PDF, and DOCX outputs.

### Verified Gate 1 Matrix (7 Scenarios in `tests/ats/phase08_4IntegritySuite.test.ts`)
Verified scenarios under `Gate 1: Scope-Specific Seniority Evaluation & Duration Measures`:
1. Northstar V2 year-only employment (`DataFlow Analytics | 2022 - Present`) with concurrent/prior internship (`CloudScale Labs | 2021 - 2022`) excluded under `PROFESSIONAL` scope against `36m` `EXPLICIT_EMPLOYER` requirement at `2024-11-24`: `BELOW_REQUIREMENT`, `isEligible: false`, `touchedMonths: 35`, `completedMonths: 34`, `minPossibleQualifyingMonths: 24`, `maxPossibleQualifyingMonths: 35`, `touchedShortfallMonths: 1`, `completedShortfallMonths: 2`.
2. Month-exact qualifying tenure vs year-only ambiguous straddling vs surplus eligibility vs total-experience scope boundaries across all 7 targeted test cases pass deterministically.

---

## 3. Gate 2 — Unified Canonical Scoring Authority & `ScoreTrace` Integrity

### Root Cause
`src/features/ats/engine/index.ts` previously executed both `computeAtsScore()` (7 ATS dimensions) and the legacy 5-pillar `runScoringEngine()` (`buildScoringContext()`, `parseResumeToScoringInput()`, `parseJobDescriptionToRequirements()`), overwriting the 5-pillar composite while leaving divergent pillar metadata in `ScoreTrace`.

### Implemented Changes
- **`src/scoring/spec/types.ts` & `src/scoring/core/types.ts`:**
  - Exported `AtsDimensionId` union for the 7 canonical ATS dimensions.
  - Widened `PillarTraceItem.id` to `PillarId | AtsDimensionId` while preserving the 5-key `PillarId` union required by `src/scoring/spec/canonicalSpec.ts`.
  - Added optional `owner` and `cause` on `ScoreAdjustment`, plus `rawSubtotal`, `totalBonuses`, `totalDeductions`, `preClampScore`, and `wasClamped` on `ScoreTrace`.
- **`src/features/ats/engine/scorer.ts`:**
  - Added `buildAtsScoreTrace()` directly inside `computeAtsScore()`, emitting a single 7-dimension `ScoreTrace` (`specVersion: '4.0.0-ats7d'`, `engineVersion: '4.0.0'`) without changing any Phase 07 dimension weights.
- **`src/features/ats/engine/index.ts`:**
  - Removed the secondary `runScoringEngine()` / `buildScoringContext()` / `parseResumeToScoringInput()` / `parseJobDescriptionToRequirements()` scoring execution path and bound `result.trace = scoring.trace` directly.
- **`src/features/ats/engine/authoritativeSnapshot.ts` & `src/features/dossier/dossierModel.ts`:**
  - Hydrated snapshot `dimensions` 1:1 from `result.trace.pillars` when present, guaranteeing exact numerical parity across Engine -> `ScoreTrace` -> `AuthoritativeReportSnapshot` -> History -> Dossier -> PDF -> DOCX.

---

## 4. Gate 3 — Elimination of Duplicate Penalties & Single-Owner Deductions

### Root Cause
`src/features/ats/engine/scorer.ts` applied double penalties for the same underlying omission:
- Missing education reduced `formatAndParse` by `-2` (`!presentSections.has('education')`) **and** applied `-3` (`missing_education`) in `penalties` (`-5` total).
- Missing contact info reduced `formatAndParse` by `-1.5` (`!email || !phone`) **and** applied `-5` (`no_contact_info`) in `penalties` (`-6.5` total).

### Implemented Changes
- **`src/features/ats/engine/types.ts`:** Added optional `owner?: string` and `cause?: string` fields to `PenaltyItem`.
- **`src/features/ats/engine/scorer.ts`:**
  - Refactored `formatAndParse` strictly to structural parsing hygiene checks: `UNSEGMENTED_DOCUMENT`, `SINGLE_SECTION_LAYOUT`, `NO_EXTRACTABLE_BULLETS`, `EMPTY_EDUCATION_SECTION` (`-1`), and `INLINE_EDUCATION_NO_HEADER` (`-1`), removing both `-2` missing standard section and `-1.5` contact penalties from `formatAndParse`.
  - Assigned single-owner ownership on `penalties`: `missing_education` (`-3`, skipped when inline education is present), `no_contact_info` (`-5`), `word_count_outlier` (`-4`), and `keyword_stuffing` (`-4` to `-10`).
  - Covered all 4 education scenarios cleanly in `tests/ats/phase08_4IntegritySuite.test.ts` (standard non-empty section, inline education without header `-1`, empty education section `-1`, and completely absent education `-3` via `missing_education` with `formatAndParse = 10`), alongside single-owner `-5` contact info deduction (`formatAndParse = 10`).

---

## 5. Gate 4 — Full 7-Enum `ClaimSupportStatus` Round-Trip Verification

In `tests/ats/phase08_4IntegritySuite.test.ts`, all 7 values of `ClaimSupportStatus`:
- `DIRECTLY_SUPPORTED`
- `CONTEXTUALLY_SUPPORTED`
- `PARTIALLY_SUPPORTED`
- `RELATED_ONLY`
- `NOT_SUPPORTED`
- `CONTRADICTED`
- `AMBIGUOUS`

paired orthogonally with distinct `CitationValidationStatus` values (`VERIFIED_EXACT`, `VERIFIED_CONTEXTUAL`, `PARTIALLY_SUPPORTED`, `INVALID_QUOTE`, `WRONG_SECTION`, `CONTEXT_MISMATCH`, `UNRESOLVED`), were verified end to end through:
1. `createAuthoritativeReportSnapshot()`
2. `serializeSnapshot()` / `deserializeSnapshot()`
3. History entry hydration via `buildDossierModel()`
4. `generatePdfDossier()` verified by `pdfjs-dist` (`pdfjs-dist/legacy/build/pdf.mjs`) text extraction
5. `generateDocxDossier()` verified by `JSZip` unpacking `word/document.xml`

---

## 6. Frozen V2 Benchmark Reconciliation (`2024-11-24`)

Removing the `-2` double education penalty in `formatAndParse` (`8 -> 10`) and fixing Northstar V2 `PROFESSIONAL`-scope seniority (`AMBIGUOUS 7.0 -> BELOW_REQUIREMENT 9.7`) yields the following reconciled frozen V2 scores in `tests/ats/phase08_3ConsistencyAudit.test.ts` and `tests/ats/phase08_4IntegritySuite.test.ts`:

| Metric | Benchmark A V2 (`BENCHMARK_A_V2_PAYTECH_RESUME`, PayGrid / Rohan) | Benchmark B V2 (`BENCHMARK_B_V2_DATAFLOW_RESUME`, Northstar / Ananya) |
|---|---:|---:|
| Raw 7-Dimension Sum | `30 + 20 + 12.5 + 7 + 10 + 10 + 3.5 = 93.0` | `30 + 20 + 0 + 7 + 9.7 + 10 + 3.5 = 80.2` |
| Seniority Verdict (`PROFESSIONAL`, 36m req) | `MEETS_REQUIREMENT` (`isEligible: true`, `36m–47m`) | `BELOW_REQUIREMENT` (`isEligible: false`, `24m–35m`, `35m` touched / `34m` completed) |
| `formatAndParse` Subscore | `10` | `10` |
| `seniorityFit` Subscore | `10` | `9.7` |
| Deductions (`missing_education`, `word_count_outlier`) | `-3 + -4 = -7` | `-3 + -4 = -7` |
| Pre-Clamp Score | `86.0` | `73.2` |
| **Final Authoritative Score** | **`86 / 100`** | **`73 / 100`** |

---

## 7. Verification Results

All build, unit/integration, and E2E checks executed in run `task-3879` after the final code edit exited cleanly with exit code `0`:

| Check Command | Observed Output | Status |
|---|---|---|
| `npm run build` | `✓ built in 7.63s` | **PASSED** |
| `npx vitest run tests/ats/` | `Test Files  11 passed (11)`, `Tests  174 passed (174)`, `Duration  28.42s` (`p0Integrity.test.ts` 13, `phase03Ontology.test.ts` 11, `phase04Evidence.test.ts` 9, `phase05Citations.test.ts` 19, `phase06Matching.test.ts` 17, `phase07Seniority.test.ts` 39, `phase08Export.test.ts` 9, `phase08_1SnapshotFidelity.test.ts` 16, `phase08_2ExportAudit.test.ts` 17, `phase08_3ConsistencyAudit.test.ts` 9, `phase08_4IntegritySuite.test.ts` 15) | **PASSED** |
| `npx playwright test e2e/e12-export-readiness.spec.ts` | `3 passed (37.2s)` (`ok 1` 24.2s, `ok 2` 3.4s, `ok 3` 2.2s) | **PASSED** |

---

## 8. Phase Boundary Confirmation

Phase 08.4 is complete. Per phase boundaries, **Phase 09 has not been started.**
