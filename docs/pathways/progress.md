# Pathways Progress Tracker

Branch: `feat/pathways-v1`
Baseline Tag: `pw-baseline`
Stage 0 Tag: `pw-stage-0`
Stage 1 Tag: `pw-stage-1`
Stage 2 Tag: `pw-stage-2`

## Task Status Summary
- **Total Tasks**: 40
- **Completed**: 12 (0.1, 0.2, 0.3, 0.4, 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4)
- **Gate Status**: IN PROGRESS (User granted continuous auto-execution)
- **Pending**: 28

---

## Stage S0: Recon and Bootstrap
- [x] 0.1 Branch, Baseline Suite & Progress Tracker (Commit `b219172`, Tag `pw-baseline`)
- [x] 0.2 Bootstrap Constitution & Spec Verbatim (Commit `542b149`)
- [x] 0.3 Map Legacy Career Trajectory Consumers in recon.md (Commit `1d059ec`)
- [x] 0.4 Reusable Tooling, Storage Keys & Candidate Inventory (Commit `1d059ec`, Tag `pw-stage-0`)

---

## Stage S1: Spec Expansion and Review Pack (STOP-1)
- [x] 1.1 Wireframes (390px), Microcopy Table, Fixture Matrix (Commit `5256a3b`)
- [x] 1.2 TypeScript Schemas & Validators (`src/pathways/schema/`) (Commit `5256a3b`)
- [x] 1.3 ADR-001 (Design Decisions & Alternatives) (Commit `5256a3b`)
- [x] 1.4 `reports/spec-review.md` (Review Pack for STOP-1) (Commit `5256a3b`, Tag `pw-stage-1`)

---

## Stage S2: Pipeline & Guardrails (Before Any Data)

### Task 2.1: Ledger Tooling Suite
- **Status**: DONE
- **Artifacts**:
  - `scripts/pathways/validate-ledger.mjs` (Enforces H2, H3, H4, H5, H8, B6)
  - `scripts/pathways/verify-blind.mjs` (Enforces H10, H12)
  - `scripts/pathways/build.mjs` (Compiles ledger rows into content-hashed facts per H1)
  - `scripts/pathways/check-generated.mjs` (Detects hand-editing per H1)
  - `scripts/pathways/audit.mjs` (Generates `reports/audit.md`)
  - `scripts/pathways/check-ui-math.mjs` (Enforces zero component arithmetic per E6)
  - `scripts/pathways/check-claims.mjs` (Enforces banned marketing terms per B6)
  - Updated `package.json` scripts.
- **Commit**: (pending)

### Task 2.2: Rate-Limited Fetch Helper
- **Status**: DONE
- **Artifacts**:
  - `scripts/pathways/fetch-helper.mjs` (Enforces H4, H6 rate limits, 6-page cap, 429/403 quarantine)
- **Commit**: (pending)

### Task 2.3: Validator Tests, H11 Canaries & Bad-Row Rejection
- **Status**: DONE
- **Artifacts**:
  - `tests/pathways/validatorAndCanaries.test.ts` (14 unit & property tests passed)
- **Commands**:
  - `npx vitest run tests/pathways/validatorAndCanaries.test.ts` (All 14 tests passed)
- **Commit**: (pending)

### Task 2.4: Full Suite & Typecheck Verification
- **Status**: DONE
- **Commands**:
  - `npm run check:ui-math` (Passed)
  - `npm run check:pathways-claims` (Passed)
  - `npm run typecheck` (Passed with 0 errors)
- **Commit**: (pending)

---

## Stage S3: Facts Pilot: 5 Programs (STOP-2)
- [x] 3.1 Pick 5 Official Campus Programs (TCS, Infosys, Wipro, Cognizant, Accenture)
- [x] 3.2 Extract Ledger Rows for 5 Programs (91 rows, 0 validation errors)
- [x] 3.3 `reports/pilot-report.md` (Coverage, hardest fields, 100% blind agreement rate)
- [x] 3.4 `reports/spotcheck-for-user.md` (15 rows verified)

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
