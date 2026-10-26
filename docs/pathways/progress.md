# Pathways Progress Tracker

Branch: `feat/pathways-v1`
Baseline Tag: `pw-baseline`
Stage 0 Tag: `pw-stage-0`

## Task Status Summary
- **Total Tasks**: 40
- **Completed**: 4 (0.1, 0.2, 0.3, 0.4)
- **In Progress**: 0
- **Pending**: 36

---

## Stage S0: Recon and Bootstrap

### Task 0.1: Branch, Baseline Suite & Progress Tracker
- **Status**: DONE
- **Commands**:
  - `git checkout -b feat/pathways-v1`
  - `npm run test`
  - `git tag pw-baseline`
- **Output (last 20 lines)**:
  ```text
   ✓ tests/unit/stage8/mobileTouchTargets.test.ts (4 tests) 12ms
   ✓ src/features/suite/credentials/__tests__/storage.test.ts (4 tests) 10ms
   ✓ src/features/career-path/__tests__/contrastAudit.test.ts (7 tests) 11ms
   ✓ tests/unit/stage1/useUrlState.test.ts (3 tests) 11ms
   ✓ tests/credentials/calendarExport.test.ts (4 tests) 11ms
   ✓ src/__tests__/security/build-headers.test.ts (2 tests) 13ms
   ✓ tests/reachout/followups.test.ts (3 tests) 10ms
   ✓ tests/unit/stage5/explainability.test.ts (2 tests) 9ms
   ✓ tests/unit/stage1/firstPaintAndQuota.test.ts (2 tests) 10ms
   ✓ src/features/suite/integration/__tests__/trajectory.test.ts (4 tests) 9ms
   ✓ src/__tests__/a11y/contrast.test.ts (6 tests) 11ms
   ✓ tests/unit/methodology/mrviIndex.test.ts (6 tests) 8ms
   ✓ tests/tailor/templatesParity.test.ts (3 tests) 10ms
   ✓ tests/unit/stage3/gapList.test.ts (2 tests) 8ms
   ✓ tests/unit/stage1/versionsConfig.test.ts (2 tests) 10ms
   ✓ src/__tests__/security/smoke.test.ts (1 test) 7ms
   ✓ src/features/career-path/components/__tests__/careerPathComponents.test.ts (9 tests) 22ms

   Test Files  145 passed (145)
        Tests  961 passed (961)
     Start at  15:18:08
     Duration  88.60s (tests 51%, import 41%, transform 6%, worker 2%)
  ```
- **Commit**: `b219172`

### Task 0.2: Bootstrap Constitution & Spec Verbatim
- **Status**: DONE
- **Commands**:
  - Created `docs/pathways/CONSTITUTION.md` verbatim (Part B).
  - Created `docs/pathways/SPEC.md` verbatim (Part C).
- **Commit**: `542b149`

### Task 0.3: Map Legacy Career Trajectory Consumers in recon.md
- **Status**: DONE
- **Commands**:
  - `grep_search` across `src/` for `trajectory`, `careers-core`, and `careerLadders`.
  - Authored Section 2 & 3 in `docs/pathways/recon.md`.
- **Commit**: (bundled in Task 0.4)

### Task 0.4: Reusable Tooling, Storage Keys & Candidate Inventory
- **Status**: DONE
- **Commands**:
  - Extracted 60 fresher program candidate names from `src/careers-core/data/fresherPrograms.ts`.
  - Documented branch codes, alias registries, storage keys, claims linting, and money formatting in `docs/pathways/recon.md`.
  - Verified acceptance: `recon.md` complete, zero application code modified.
- **Commit**: (pending)

---

## Stage S1: Spec Expansion and Review Pack (STOP-1)
- [ ] 1.1 Wireframes (390px), Microcopy Table, Fixture Matrix (20 profiles, 8 offers) [TODO]
- [ ] 1.2 TypeScript Schemas & Validators (`src/pathways/schema/`) [TODO]
- [ ] 1.3 ADR-001 (Design Decisions & Alternatives) [TODO]
- [ ] 1.4 `reports/spec-review.md` (Review Pack for STOP-1) [TODO]

---

## Stage S2: Pipeline & Guardrails (Before Any Data)
- [ ] 2.1 Ledger Tooling (`validate-ledger`, `verify-blind`, `build`, `check:ui-math`, `check:claims`) [TODO]
- [ ] 2.2 Rate-Limited Fetch Helper with Logging & Cache [TODO]
- [ ] 2.3 Validator Tests, H11 Canaries & Bad-Row Rejection [TODO]
- [ ] 2.4 Test Suite & Typecheck Verification [TODO]

---

## Stage S3: Facts Pilot: 5 Programs (STOP-2)
- [ ] 3.1 Pick 5 Official Campus Programs [TODO]
- [ ] 3.2 Extract Ledger Rows for 5 Programs (One at a time) [TODO]
- [ ] 3.3 `reports/pilot-report.md` [TODO]
- [ ] 3.4 `reports/spotcheck-for-user.md` (15 rows) [TODO]

---

## Stage S4: Facts Scale (15+ Programs)
- [ ] 4.1 Extract Batches of 10 Programs [TODO]
- [ ] 4.2 Verify, Build, and Check Generated per Batch [TODO]

---

## Stage S5: Government Rule Facts for Offer Evaluator
- [ ] 5.1 Official Govt Ledger Rows (Tax, EPF, Wages) [TODO]
- [ ] 5.2 `reports/primer-differences.md` [TODO]
- [ ] 5.3 `docs/pathways/tax-rules-used.md` [TODO]

---

## Stage S6: Offer Engine & Worked Examples (STOP-3)
- [ ] 6.1 `src/pathways/engine/offer.ts` Pure Deterministic Functions [TODO]
- [ ] 6.2 Unit Tests & Seeded Property Tests [TODO]
- [ ] 6.3 8 Hand-Worked Examples in `reports/offer-worked-examples.md` [TODO]
- [ ] 6.4 Mutation Spot-Check (10 mutants) & Red-Team Pass S6 [TODO]

---

## Stage S7: Eligibility Engine & CGPA Gap Calculator
- [ ] 7.1 `src/pathways/engine/eligibility.ts` Pure Engine [TODO]
- [ ] 7.2 CGPA Gap Formula Function [TODO]
- [ ] 7.3 Truth Tables, 20-Profile Fixture Tests & Invariant Property Tests [TODO]
- [ ] 7.4 Mutation Spot-Check (10 mutants) & Red-Team Pass S7 [TODO]

---

## Stage S8: Action Plan Engine & Models
- [ ] 8.1 `src/pathways/models/assumptions.ts` (All Draft) [TODO]
- [ ] 8.2 `src/pathways/engine/plan.ts` Pure Engine [TODO]
- [ ] 8.3 Plan Engine Tests & Determinism Validation [TODO]
- [ ] 8.4 Mutation Spot-Check (10 mutants) [TODO]

---

## Stage S9: Readiness Link
- [ ] 9.1 Local TalentLens/Roaster Trace Reader & Archetype Map [TODO]
- [ ] 9.2 Tests for Readiness Integration (Zero Network, Zero Recompute) [TODO]

---

## Stage S10: UI Implementation (Design Tokens Only)
- [ ] 10.1 Profile Store & Core Input Components (3-Input Budget) [TODO]
- [ ] 10.2 Five Routes & All Wireframe States [TODO]
- [ ] 10.3 Evidence Chips, Local Feedback & Non-Affiliation Footer [TODO]
- [ ] 10.4 Feature Flag Registration (`PATHWAYS_ENABLED`) [TODO]
- [ ] 10.5 UI Tests (Input Budget, 390px Mobile, Keyboard, Math Check) [TODO]
- [ ] 10.6 Red-Team Pass S10 [TODO]

---

## Stage S11: Verification Pack (STOP-4)
- [ ] 11.1 Full Verification Pipeline Execution [TODO]
- [ ] 11.2 `reports/audit.md` [TODO]
- [ ] 11.3 AI Recheck of 30 URLs & 20-Row User Spot-Check File [TODO]
- [ ] 11.4 `reports/moderated-session-script.md` [TODO]

---

## Stage S12: Corrections, Refresh & Cutover Prep (STOP-5)
- [ ] 12.1 Correction Workflow & Refresh Scripts [TODO]
- [ ] 12.2 Draft Legal Terms & Privacy Text [TODO]
- [ ] 12.3 `reports/cutover-plan.md` & Exit Scorecard Evaluation [TODO]
- [ ] 12.4 `reports/final-report.md` [TODO]
