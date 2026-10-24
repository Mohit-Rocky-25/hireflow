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

- [x] **1.1**: [DONE] Created `src/scoring/spec/` with typed spec, canonical spec, validator, and verified with unit tests.
- [x] **1.2**: [DONE] Created `src/scoring/core/` pure functions (tokenization safe for C/Go/R, evidence credit, 100-pt bullet score, registered calculators, composite, band, trace).
- [x] **1.3**: [DONE] Defined `ScoreTrace` (no raw resume text, SHA-256 fingerprint, pure data contract).
- [x] **1.4**: [DONE] Implemented exact composite formula with dynamic renormalization and clamping.
- [x] **1.5**: [DONE] Implemented deterministic sensitivity band calculator (perturbations x0.8/x1.2, confidence flips).
- [x] **1.6**: [DONE] Independent oracle test verifying composite and band matching engine to 1e-9 across 24 fixtures.
- [x] **1.7**: [DONE] Implemented and ran `npm run check:constants` ensuring zero hardcoded scoring constants outside spec.

---

## Stage 2: Dynamic Context

- [x] **2.1**: [DONE] Implemented `ScoringContext` with experience level, role family, JD presence, confirmed requirements, archetype.
- [x] **2.2**: [DONE] Implemented runtime profile selection and applicability evaluation from spec (Fresher, Experienced, continuous Experience Fit, role baseline mode).
- [x] **2.3**: [DONE] Implemented deterministic JD requirement extraction, verbatim proposal validation, and unrecognized term warning bucket in `src/scoring/core/jdParser.ts`.
- [x] **2.4**: [DONE] Implemented dynamic context test suite in `tests/scoring/dynamicContext.test.ts` passing all 7 tests.

---

## Stage 3: Roaster Pillars Wired to the Spec

- [x] **3.1**: [DONE] Requirement Coverage (Pillar 1) wired to pure calculator with contextWeight, implied edges, priority weights, and 0.35 skills-only credit.
- [x] **3.2**: [DONE] Evidence Quality (Pillar 2) wired to 100-pt bullet score (action verb 20, measured result 30, tech context 25, impact 25), keyword dump detector (8 pts), and soft plausibility flags.
- [x] **3.3**: [DONE] Parser-Friendliness (Pillar 4) unified format/parse deductions into one heuristic engine with Indian advisory items and zero score penalties for unmeasured styling.
- [x] **3.4**: [DONE] Project & Readiness (Pillar 3) wired to role-aware signal libraries across 6 families and craftsmanship advisory.
- [x] **3.5**: [DONE] Feature-to-pillar canonical mapping table authored in `docs/scoring-spec.md` guaranteeing Rule A3 single-counting across all sub-features.
- [x] **3.6**: [DONE] MRVI isolated to legacy demo slider and mapped for full removal in Stage 6; marketing claims purged from spec descriptions.

---

## Stage 4: TalentLens Wired to the Same Core

- [x] **4.1**: [DONE] TalentLens wired to shared core primitives (matching, contextWeight, bullet score, band, trace).
- [x] **4.2**: [DONE] Market profiles from market-data model with archetypes and signal provenance.
- [x] **4.3**: [DONE] Eligibility gate evaluation (pass / check carefully / likely not eligible / unknown) with source chips & Tier C TCS 60% rule fix.
- [x] **4.3b**: [DONE] Restrict "required" and "minimum" strictly to official signals with sourceUrl; LeetCode/Codeforces as percentiled strong signals.
- [x] **4.4**: [DONE] Market Readiness Estimate computed via core engine with archetype group weights, band, and trace.
- [x] **4.5**: [DONE] Actionable gap classification (7/30/90+ days/not-closable), deterministic what-if rescore, bullet templates.
- [x] **4.6**: [DONE] Unscored reality-factors panel (campus access, referrals, tests) providing guidance only.
- [x] **4.7**: [DONE] Cross-tool consistency tests ensuring shared sub-results match across Roaster and TalentLens.

---

## Stage 5: UI Consumes the Trace

- [x] **5.1**: [DONE] Replace raw score displays with trace-driven estimate + band + label ("Resume Match Estimate" / "Market Readiness Estimate").
- [x] **5.2**: [DONE] Generic "Why this score" drawer rendering exclusively from ScoreTrace.
- [x] **5.3**: [DONE] Add and run `npm run check:ui-scoring` boundary lint enforcing zero UI arithmetic or internal imports.
- [x] **5.4**: [DONE] Stamp stored results with specVersion, engineVersion, specFingerprint; stale version notification.
- [x] **5.5**: [DONE] Zero-PII report-a-wrong-result payload verification test with fake PII fixtures.

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
