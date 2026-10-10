# HireFlow Careers Data Platform — Build Log

## Overview
- Date: 2026-10-10
- Baseline Tag: `pre-careers-platform`
- Objective: Unify all company, level, fresher/campus program, role, and competency data into a single, platform-level service (`src/careers-core/`) that serves all HireFlow features through ONE public typed API without data fabrication or duplication.

---

## Stages Progress

- [x] **Stage 0: Recon, Backup & Consumer Discovery**
  - [x] Create git tag `pre-careers-platform`
  - [x] Initialize `docs/careers/BUILD_LOG.md`
  - [x] Map real paths, imports, and schemas across all consumers in `docs/careers/consumers.md`
  - [x] Log baseline typecheck (0 errors), test suite (17/17 core data tests passing), and dev server running
  - [x] Generate baseline regression snapshots in `docs/careers/baseline-snapshot.json` (269 KB, 56 ladders + 75 TalentLens companies + degrees & equivalence)

- [x] **Stage 1: Gap Audit (G1-G6)**
  - [x] Write `scripts/careers/audit-gaps.mjs`
  - [x] Generate `docs/careers/data-gap-report.md` covering G1 (182 levels missing rank/YoE), G2 (36 branch entries lacking formal codes/durations), G3 (0 structured fresher programs), G4 (templated content & core SWE track mismatch), G5 (questionable entities & naming drift), G6 (29 shared, 62 TalentLens-only, 27 ladder-only unlinked companies)

- [x] **Stage 2: Build the Careers Data Platform (`src/careers-core/`)**
  - [x] Schema & Types (`schema/`)
  - [x] Manifest & Invariant Registry (`data/`, `registry/`)
  - [x] Public API (`api/index.ts`)
  - [x] Legacy Adapters (`legacy/`)
  - [x] React Hooks & `<DataBadge>` (`react/`)
  - [x] Governance check & import restrictions
  - [x] Documentation (`docs/careers/EXTENDING.md`) & scaffolding script (`scripts/careers/new-dataset.mjs`)
  - [x] Data validation suite (`scripts/careers/validate.mjs` & vitest)

- [x] **Stage 3: Migrate Every Existing Consumer onto the Platform**
  - [x] Migrate Career Trajectory / Simulator (`src/data/careerLadders/index.ts` re-exporting enriched ladders)
  - [x] Migrate TalentLens / Company Roles (`talentLensData.ts` and adapters)
  - [x] Migrate ATS Resume Roaster (`ResumeChecker.tsx` queries `careers.companies` and `careers.roles`)
  - [x] Migrate Tailor My Resume Quick Load (`QuickLoadSelect.tsx` and `TailorResumePage.tsx` use `careers`)
  - [x] Migrate Tools Hub / Landing Page counts (Dynamic `careers.stats.counts()`)
  - [x] Migrate Candidate Company Match (`CompanyMatch.tsx` dynamically driven by `careers`)
  - [x] Resolve G1, G2, G4 in canonical data
  - [x] Verify baseline snapshot parity (`src/__tests__/careers/regressionParity.test.ts` passing)

- [ ] **Stage 4: Pilot Slice Through the Platform**
  - [ ] Add 3 verified pilot programs (TCS Ninja, Indian Product SDE-1, Tata Motors GET)
  - [ ] Validate end-to-end surfacing across 4 consumers

- [ ] **Stage 5: Research Protocol + Pass 1 (All 56 Companies)**
  - [ ] Ledger setup: `data-research/<companyId>.json` + `data-research/_progress.json`
  - [ ] Verified status and 1-3 core programs per company with provenance
  - [ ] Pass 1 validation check

- [ ] **Stage 6: Pass 2 (Depth) + Trajectories + Eligibility**
  - [ ] In-depth campus programs (up to 10 per company, no padding)
  - [ ] Competency profiles & derived keyword profiles
  - [ ] 5-year fresher trajectories mapped to existing level codes
  - [ ] Branch eligibility matrix (`careers.eligibility.matrixFor`)
  - [ ] Write `docs/careers/fresher-vs-lateral.md`

- [ ] **Stage 7: Consumer Features & UI Hooks**
  - [ ] Career Trajectory: Fresher / Campus Entry mode
  - [ ] TalentLens: Fresher / Experienced segmented control
  - [ ] ATS Resume Roaster: Fresher program target scan
  - [ ] Tailor My Resume: Quick load from campus programs
  - [ ] Provenance `<DataBadge>` integration
  - [ ] Dev Data Explorer (`/dev/careers-data`)

- [ ] **Stage 8: Comprehensive QA & Verification**
  - [ ] Platform test suite & referential integrity
  - [ ] Regression snapshots match
  - [ ] Generate `docs/careers/coverage-report.md` & `docs/careers/spot-check.csv`
  - [ ] Multi-resolution browser checks

- [ ] **Stage 9: Documentation & Commit to Main**
  - [ ] Write `docs/careers/README.md`
  - [ ] Full production build & test suite passing
  - [ ] Final commit on `main`
