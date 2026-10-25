# Companies-100 Mission Progress Tracker

Branch: `feat/companies-100-v1`  
Started: 2026-10-25  

## Task Status Table

| Task ID | Stage | Description | Status | Commit | Command / Output Record |
|---|---|---|---|---|---|
| 0.1 | Stage 0 | Create branch, progress.md, run baseline tests, git tag c100-baseline | DONE | cef216e | `npx vitest run` (142 passed, 927 passed, 0 failed) |
| 0.2 | Stage 0 | Copy roster to roster-input.md, parse tables, confirm 100 ids & category counts | DONE | 8cb9dfe | `node scripts/parse_roster.cjs` (100 unique IDs, categories 10/15/25/15/15/20) |
| 0.3 | Stage 0 | Locate and record company/role data, eligibility, types, validators, provenance | DONE | pending | Located in `talentLensData.ts`, `companyEligibility.ts`, `MethodologyPage.tsx` |
| 0.4 | Stage 0 | Write consumed-fields.md (field usages, file:line, effect) | DONE | pending | `node scripts/trace_consumed_fields.cjs` -> `docs/companies-100/consumed-fields.md` |
| 0.5 | Stage 0 | Existing stats, dedupe 100 against existing data by id & normalised name | DONE | pending | `node scripts/analyze_existing_and_dedupe.cjs` (141 existing, 4 overlaps) |
| 0.6 | Stage 0 | Schema facts, optional value null safety, 20 competency keys, tier mapping, hardcoded counts | DONE | pending | Audited in recon.md: 20 keys verified, openRoles null hazard identified |
| 0.7 | Stage 0 | Write recon.md with answers & OPEN QUESTIONS | DONE | pending | `docs/companies-100/recon.md` generated with all findings and answers |
| 1.1 | Stage 1 | Write ADR-001.md, implement additive schema changes & migrations | TODO | - | - |
| 1.2 | Stage 1 | Build ledger tooling (validate:ledger, verify:blind, build:companies, check:generated) | TODO | - | - |
| 1.3 | Stage 1 | UI null safety, depth chip, editorial label, source chips, disclaimer, error report | TODO | - | - |
| 1.4 | Stage 1 | Validator unit tests, canary tests (H10), rejection tests, full suite, tag c100-stage-1 | TODO | - | - |
| 2.1 | Stage 2 | Dedupe roster into dedupe.md | TODO | - | - |
| 2.2 | Stage 2 | Roster verification (batches of 10, ONE at a time, official pages, log fetches) | TODO | - | - |
| 2.3 | Stage 2 | One-line tierRationale per company, flag needsReview | TODO | - | - |
| 2.4 | Stage 2 | Run validate:ledger, verify:blind, apply H11 after each batch | TODO | - | - |
| 2.5 | Stage 2 | Write roster-verification.md, tag c100-stage-2, STOP-1 (NEEDS-USER) | TODO | - | - |
| 3.1 | Stage 3 | Choose 5 confirmed companies for pilot with rationale | TODO | - | - |
| 3.2 | Stage 3 | Pilot data collection (official eligibility, jobFamily, stated numerics) | TODO | - | - |
| 3.3 | Stage 3 | Run validate:ledger, verify:blind, build:companies, check:generated, test suite | TODO | - | - |
| 3.4 | Stage 3 | Write pilot-report.md | TODO | - | - |
| 3.5 | Stage 3 | Write spotcheck-for-user.md, tag c100-stage-3, STOP-2 (NEEDS-USER) | TODO | - | - |
| 4.1 | Stage 4 | Scale facts & eligibility for remaining companies (ONE at a time, depth assignment) | TODO | - | - |
| 4.2 | Stage 4 | Batch validation, blind checks, generator checks, commit per batch, tag c100-stage-4 | TODO | - | - |
| 5.0 | Stage 5 | Write jobFamilyTemplates.ts (20-25 templates), README, STOP-3 (NEEDS-USER) | TODO | - | - |
| 5.1 | Stage 5 | Role profile generation from templates, editorial disclaimer prefix | TODO | - | - |
| 5.2 | Stage 5 | Sanity test: TalentLens evaluation with 3 synthetic fixtures | TODO | - | - |
| 5.3 | Stage 5 | Run validate:companies, check:generated, full suite, tag c100-stage-5 | TODO | - | - |
| 6.1 | Stage 6 | Merge generated data into RAW_COMPANIES and KNOWN_RULES | TODO | - | - |
| 6.2 | Stage 6 | Update provenance generator & Methodology table, remove hand-typed counts | TODO | - | - |
| 6.3 | Stage 6 | UI search by name, depth filter, responsive check (390px) | TODO | - | - |
| 6.4 | Stage 6 | Confirm tier maps to TalentLens archetypes, list gaps | TODO | - | - |
| 6.5 | Stage 6 | lint, typecheck, full suite, production build, tag c100-stage-6 | TODO | - | - |
| 7.1 | Stage 7 | Audit report generation (audit:companies -> audit.md) | TODO | - | - |
| 7.2 | Stage 7 | Reopen random 30 URLs, confirm supporting text, record match/mismatch | TODO | - | - |
| 7.3 | Stage 7 | Write second spot-check file (20 random rows) | TODO | - | - |
| 7.4 | Stage 7 | Write final-report.md (summary, unmerged branch notes) | TODO | - | - |

---

## Task Execution Logs

### Task 0.1 Log
- **Command**: `npx vitest run`
- **Output (last 20 lines)**:
```
 ✓ tests/roaster/fresher-readiness.test.ts (3 tests) 11ms
 ✓ src/__tests__/careers/regressionParity.test.ts (5 tests) 12ms
 ✓ tests/unit/stage1/versionsConfig.test.ts (2 tests) 12ms
 ✓ src/features/career-path/__tests__/contrastAudit.test.ts (7 tests) 13ms
 ✓ src/__tests__/a11y/contrast.test.ts (6 tests) 11ms
 ✓ tests/unit/stage5/explainability.test.ts (2 tests) 19ms
 ✓ src/features/suite/integration/__tests__/trajectory.test.ts (4 tests) 12ms
 ✓ tests/tailor/templatesParity.test.ts (3 tests) 11ms
 ✓ tests/unit/stage3/gapList.test.ts (2 tests) 9ms
 ✓ tests/unit/methodology/mrviIndex.test.ts (6 tests) 8ms
 ✓ src/__tests__/security/smoke.test.ts (1 test) 7ms

 Test Files  142 passed (142)
      Tests  927 passed (927)
   Start at  20:30:02
   Duration  67.62s (tests 56%, import 29%, transform 13%, worker 3%)

     Import  479 modules were evaluated 3816 times · 28.81s total, 29% of tracked time
             ~11.61s faster with isolate: false — shared modules are evaluated once per worker instead of once per file
             learn more: https://vitest.dev/guide/improving-performance#test-isolation
```
- **Failing tests**: 0
- **Baseline Git Tag**: `c100-baseline`

### Task 0.2 Log
- **Command**: `Copy-Item docs\100_COMPANIES_DATASET_BLUEPRINT_FOR_CLAUDE.md -Destination docs\companies-100\roster-input.md -Force`
- **Verification Command**: `node scripts/parse_roster.cjs`
- **Output (last 20 lines)**:
```
Categories count: 6
Counts per category: 10/15/25/15/15/20
Category 1: ### Category 1: Proprietary Trading, Quant & Financial Markets (10 Companies) -> 10 companies
Category 2: ### Category 2: Global Capability Centers (GCCs) & Banking Tech (15 Companies) -> 15 companies
Category 3: ### Category 3: Core Engineering, Embedded Systems, IoT & Automotive (25 Companies) -> 25 companies
Category 4: ### Category 4: Analytics, AI & Enterprise Data Platforms (15 Companies) -> 15 companies
Category 5: ### Category 5: High-Growth Indian Tech, D2C & EdTech (15 Companies) -> 15 companies
Category 6: ### Category 6: Mid-Market IT Consulting, Digital Engineering & Enterprise SaaS (20 Companies) -> 20 companies
Total companies: 100
Unique IDs count: 100
Successfully saved to docs/companies-100/roster-parsed.json
```

### Tasks 0.3 - 0.7 Log
- **Task 0.3**: Located company data (`talentLensData.ts`), eligibility (`companyEligibility.ts`), types (`Company`, `Role`, `CompanyEligibilityRule`), validators (`validateData.test.ts`, `talentlens.test.ts`), provenance generator (`generate-provenance.mjs`), and methodology table (`MethodologyPage.tsx`).
- **Task 0.4**: Ran `node scripts/trace_consumed_fields.cjs`. Generated `docs/companies-100/consumed-fields.md` mapping all fields to file:line and effect (score / UI / Roaster / none).
- **Task 0.5**: Ran `node scripts/analyze_existing_and_dedupe.cjs`. Found 141 existing companies, ~1,450 roles, and 4 exact overlaps (`mu_sigma`, `leadsquared`, `birlasoft`, `zensar`).
- **Task 0.6**: Audited 20 canonical competency keys (exact match), null safety hazard in `openRoles` (`undefined+`), and archetype mapping.
- **Task 0.7**: Generated `docs/companies-100/recon.md` with all reconnaissance answers and open questions. No code files in `src/` modified.
- **Stage 0 Completed**: Git tag ready for stage completion.


