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
- [x] 4.1 Extract Batches of 10 Programs (20 programs total across 4 tracks)
- [x] 4.2 Verify, Build, and Check Generated per Batch (340 rows, 100% blind agreement rate)
- [x] 4.3 `reports/audit.md` updated and validated with 0 errors

---

## Stage S5: Government Rule Facts for Offer Evaluator
- [x] 5.1 Official Govt Ledger Rows (Tax, EPF, Wages: 23 statutory rows verified)
- [x] 5.2 `reports/primer-differences.md` (Partial FY, EPF ceiling, gratuity reality)
- [x] 5.3 `docs/pathways/tax-rules-used.md` (Student-facing statutory reference guide)

---

## Stage S6: Offer Engine & Worked Examples (STOP-3)
- [x] 6.1 `src/pathways/engine/offer.ts` Pure Deterministic Functions (Tax, EPF, Exit Timeline, Red Flags, 3-offer compare)
- [x] 6.2 Unit Tests & Seeded Property Tests (14 tests passed, 8 C15 fixtures)
- [x] 6.3 8 Hand-Worked Examples in `reports/offer-worked-examples.md`
- [x] 6.4 Mutation Spot-Check (10 mutants, 100% kill score in `reports/mutation-offer.md`)
- [x] 6.5 Red-Team Pass S6 (`reports/redteam-s6.md`)

---

## Stage S7: Eligibility Engine & CGPA Gap Calculator
- [x] 7.1 `src/pathways/engine/eligibility.ts` Pure Engine (4 statuses, E4 unit mismatch handling)
- [x] 7.2 CGPA Gap Formula Function ($R = (T\cdot N - C\cdot n)/(N - n)$)
- [x] 7.3 Truth Tables, 20-Profile Fixture Tests & Invariant Property Tests (24 tests passed)
- [x] 7.4 Mutation Spot-Check (10 mutants, 100% kill score in `reports/mutation-eligibility.md`)
- [x] 7.5 Red-Team Pass S7 (`reports/redteam-s7.md`)

---

## Stage S8: Action Plan Engine & Models
- [x] 8.1 `src/pathways/models/assumptions.ts` (All draft status per B5/C4)
- [x] 8.2 `src/pathways/engine/plan.ts` Pure Engine (3 ordered lanes, relative weeks, pace multiplier)
- [x] 8.3 Plan Engine Tests & Determinism Validation (5 tests passed)
- [x] 8.4 Mutation Spot-Check (10 mutants, 100% kill score in `reports/mutation-plan.md`)

---

## Stage S9: Readiness Link
- [x] 9.1 Local TalentLens/Roaster Trace Reader & Archetype Map (`src/pathways/engine/readiness.ts`)
- [x] 9.2 Tests for Readiness Integration (Zero network egress, zero score recomputation, 4 tests passed)

---

## Stage S10: UI Implementation (Design Tokens Only)
- [x] 10.1 Profile Store & Core Input Components (3-Input Budget: `profileStore.ts`, `ProfileBudgetBar.tsx`)
- [x] 10.2 Five Routes & All Wireframe States (`PathwaysRadarPage`, `ProgramDetailPage`, `ActionPlanPage`, `OfferEvaluatorPage`, `AboutDataPage`)
- [x] 10.3 Evidence Chips, Local Feedback & Non-Affiliation Footer (`EvidenceChip.tsx`, `FeedbackModal.tsx`, `NonAffiliationFooter.tsx`)
- [x] 10.4 Feature Flag Registration (`PATHWAYS_ENABLED: true` in `features.ts`, route wiring in `App.tsx`, entry in `ToolsHubPage.tsx`)
- [x] 10.5 UI Tests (Input Budget, 390px Mobile, Keyboard, Zero Math Check: `tests/pathways/ui.test.ts` 9/9 passed)
- [x] 10.6 Red-Team Pass S10 (`docs/pathways/reports/redteam-s10.md`)

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
