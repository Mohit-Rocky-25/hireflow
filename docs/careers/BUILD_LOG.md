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

- [ ] **Stage 1: Gap Audit (G1-G6)**
  - [ ] Write `scripts/careers/audit-gaps.mjs`
  - [ ] Generate `docs/careers/data-gap-report.md` covering G1 (missing level metrics), G2 (branch metadata), G3 (campus hiring), G4 (templated content), G5 (questionable entries), G6 (duplication)

- [ ] **Stage 2: Build the Careers Data Platform (`src/careers-core/`)**
  - [ ] Schema & Types (`schema/`)
  - [ ] Manifest & Invariant Registry (`data/`, `registry/`)
  - [ ] Public API (`api/index.ts`)
  - [ ] Legacy Adapters (`legacy/`)
  - [ ] React Hooks & `<DataBadge>` (`react/`)
  - [ ] Governance check & import restrictions
  - [ ] Documentation (`docs/careers/EXTENDING.md`) & scaffolding script (`scripts/careers/new-dataset.mjs`)
  - [ ] Data validation suite (`scripts/careers/validate.mjs`)

- [ ] **Stage 3: Migrate Every Existing Consumer onto the Platform**
  - [ ] Migrate Career Trajectory / Simulator
  - [ ] Migrate TalentLens / Company Roles
  - [ ] Migrate ATS Resume Roaster
  - [ ] Migrate Tailor My Resume Quick Load
  - [ ] Migrate Tools Hub / Landing Page counts
  - [ ] Resolve G1, G2, G4 in canonical data
  - [ ] Verify baseline snapshot parity

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
