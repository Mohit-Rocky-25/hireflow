# HireFlow Scoring Core Rebuild — Progress Checklist

> Rebuilding the SCORING CORE of HireFlow so that ATS Resume Roaster, TalentLens, and the Methodology page all run from ONE machine-readable scoring spec.  
> Statuses: `TODO` | `DOING` | `DONE` | `BLOCKED`

---

## Stage 0: Recon and Baseline

- [x] **0.1**: [DONE] Reconnaissance audit in `docs/scoring-recon.md` answering queries 0.1.a through 0.1.j.
- [x] **0.2**: [DONE] Build synthetic fixture set of 24 resumes + matching JDs in `src/scoring/__fixtures__/` and record `docs/baseline-scores.json`.
- [x] **0.3**: [DONE] Created branch `feat/scoring-core-v2` and initialized `docs/progress.md`.

---

## Stage 1: The Spec and The Core

- [ ] **1.1**: [TODO] Create `src/scoring/spec/` with typed spec files and build-time validator.
- [ ] **1.2**: [TODO] Create `src/scoring/core/` with pure functions (tokenization, evidence credit, bullet scoring, registered calculators, composite, band, trace).
- [ ] **1.3**: [TODO] Define `ScoreTrace` (no raw resume text, SHA-256 fingerprint, pure data).
- [ ] **1.4**: [TODO] Implement exact composite formula with dynamic renormalization and clamping.
- [ ] **1.5**: [TODO] Implement deterministic sensitivity band calculator (perturbations x0.8/x1.2, confidence flips).
- [ ] **1.6**: [TODO] Independent oracle test verifying composite and band matching engine to 1e-9.
- [ ] **1.7**: [TODO] Implement and run `npm run check:constants` to ensure zero hardcoded scoring constants outside spec.

---

## Stage 2: Dynamic Context

- [ ] **2.1**: [TODO] Implement `ScoringContext` with experience level, role family, JD presence, confirmed requirements, archetype.
- [ ] **2.2**: [TODO] Runtime profile selection and applicability evaluation from spec (Fresher, Experienced, continuous Experience Fit, role baseline mode).
- [ ] **2.3**: [TODO] Deterministic JD requirement extraction with user-confirmation workflow & unrecognized term warnings.
- [ ] **2.4**: [TODO] Dynamic context test suite (profile switches, role baselines, renormalization, oracle prediction).

---

## Stage 3: Roaster Pillars Wired to the Spec

- [ ] **3.1**: [TODO] Requirement Coverage (Pillar 1) with contextWeight (Experience 1.0, Project 0.8, Academic 0.6, Skills-only 0.35), implied edges, priority weights.
- [ ] **3.2**: [TODO] Evidence Quality (Pillar 2) with 100-pt bullet score (action verb 20, measured result 30, tech context 25, impact 25), keyword dump detector.
- [ ] **3.3**: [TODO] Parser-Friendliness (Pillar 4) merging Format Safety and Parse Safety into one heuristic deduction engine with Indian advisory items.
- [ ] **3.4**: [TODO] Project & Readiness (Pillar 3) with role-aware signal libraries (Backend, Frontend, Data/ML, Mobile, DevOps, General) and Craftsmanship advisory.
- [ ] **3.5**: [TODO] Former indices mapped as sub-breakdowns within canonical pillars (no duplicate features, mapping table in spec).
- [ ] **3.6**: [TODO] Refactor MRVI into "Skill Priority (heuristic)", remove marketing claims, compute from measurable inputs.

---

## Stage 4: TalentLens Wired to the Same Core

- [ ] **4.1**: [TODO] TalentLens wired to shared core primitives (matching, contextWeight, bullet score, band, trace).
- [ ] **4.2**: [TODO] Market profiles from market-data model with archetypes and signal provenance.
- [ ] **4.3**: [TODO] Eligibility gate evaluation (pass / check carefully / likely not eligible / unknown) with source chips & Tier C TCS 60% rule fix.
- [ ] **4.3b**: [TODO] Restrict "required" and "minimum" strictly to official signals with sourceUrl; LeetCode/Codeforces as percentiled strong signals.
- [ ] **4.4**: [TODO] Market Readiness Estimate computed via core engine with archetype group weights, band, and trace.
- [ ] **4.5**: [TODO] Actionable gap classification (7/30/90+ days/not-closable), deterministic what-if rescore, bullet templates.
- [ ] **4.6**: [TODO] Unscored reality-factors panel (campus access, referrals, tests) providing guidance only.
- [ ] **4.7**: [TODO] Cross-tool consistency tests ensuring shared sub-results match across Roaster and TalentLens.

---

## Stage 5: UI Consumes the Trace

- [ ] **5.1**: [TODO] Replace raw score displays with trace-driven estimate + band + label ("Resume Match Estimate" / "Market Readiness Estimate").
- [ ] **5.2**: [TODO] Generic "Why this score" drawer rendering exclusively from ScoreTrace.
- [ ] **5.3**: [TODO] Add and run `npm run check:ui-scoring` boundary lint enforcing zero UI arithmetic or internal imports.
- [ ] **5.4**: [TODO] Stamp stored results with specVersion, engineVersion, specFingerprint; stale version notification.
- [ ] **5.5**: [TODO] Zero-PII report-a-wrong-result payload verification test with fake PII fixtures.

---

## Stage 6: Methodology Page Generated from the Spec

- [ ] **6.1**: [TODO] Methodology page rendered purely from spec data (zero hardcoded numbers or rule text in JSX).
- [ ] **6.2**: [TODO] Index map at the top detailing both estimates, their pillars, and single-counting guarantees.
- [ ] **6.3**: [TODO] "Try the engine" live interactive panel running the real core against synthetic fixtures.
- [ ] **6.4**: [TODO] Validation status box clearly separating real programmatic checks from editorial defaults & blind spots.
- [ ] **6.5**: [TODO] Section 7 provenance derived strictly from repo artifacts (`src/data/provenance.generated.json` & `check:provenance`).
- [ ] **6.6**: [TODO] Wording sweep removing all inflated claims ("mathematically derived", "Zero Magic", "verifiable academic foundations", etc.).
- [ ] **6.7**: [TODO] Implement `npm run check:claims` and `npm run check:provenance`.
- [ ] **6.8**: [TODO] Implement `npm run docs:scoring` generating `docs/scoring-spec.md` and `docs/metric-inventory.md` from the spec.

---

## Stage 7: Verification

- [ ] **7.1**: [TODO] 12 hand-calculated golden fixtures with documented arithmetic.
- [ ] **7.2**: [TODO] 500-iteration seeded PRNG property tests (normalization, range [0, 100], determinism).
- [ ] **7.3**: [TODO] Metamorphic/monotonic invariant tests (irrelevant skills, genuine evidence, reordering, aliases).
- [ ] **7.4**: [TODO] Adversarial test suite (stuffing, white-text, buzzwords, duplicates, implausible metrics).
- [ ] **7.5**: [TODO] Spec-drift test proving spec edits dynamically alter engine and rendered methodology in lockstep.
- [ ] **7.6**: [TODO] Privacy spy tests verifying zero network calls during scan, tailor, export, TalentLens, and methodology.
- [ ] **7.7**: [TODO] Cache fingerprint invalidation test.
- [ ] **7.8**: [TODO] Implement `npm run validate:scoring` generating `docs/validation-report.md`.
- [ ] **7.9**: [TODO] Implement `npm run report:migration` generating `docs/score-migration-report.md` comparing against baseline.
- [ ] **7.10**: [TODO] Run full suite of checks (`check:constants`, `check:ui-scoring`, `check:claims`, `check:provenance`, `docs:scoring`, `validate:scoring`, `report:migration`, lint, typecheck, full vitest suite, build).

---

## Stage 8: Final Report

- [ ] **8.1**: [TODO] Author `docs/scoring-fix-report.md` with complete evidence, walkthrough, and migration audit.
