# Requirements Traceability Matrix — HireFlow v3

Traceability table mapping every requirement ID to its stage, acceptance test/validation method, and current implementation status.

| Req ID | Stage | Description | Acceptance Test / Artifact | Status |
| :--- | :--- | :--- | :--- | :--- |
| **0.1** | Stage 0 | Map repo in-scope files & dead/duplicate candidates | `docs/repo-map.md` | **DONE** |
| **0.2** | Stage 0 | Detect already done vs partial vs missing work | Stage 0 Audit Report (`docs/audit.md`) | **DONE** |
| **0.3** | Stage 0 | Create `.agent/rules/hireflow.md` with P-1..P-10 | `.agent/rules/hireflow.md` | **DONE** |
| **0.4** | Stage 0 | Create `.agent/workflows/verify.md` (/verify) | `.agent/workflows/verify.md` | **DONE** |
| **0.5** | Stage 0 | Create traceability matrix `docs/requirements.md` | `docs/requirements.md` | **DONE** |
| **0.6** | Stage 0 | Baseline 6 synthetic resumes + 6 JDs in `tests/fixtures/` & `docs/baseline.md` | `tests/fixtures/synthetic/`, `docs/baseline.md` | **IN PROGRESS** |
| **0.7** | Stage 0 | Record baseline counts for datasets & test suite | `docs/baseline.md` | **DONE** |
| **R1.1** | Stage 1 | Flat structure `src/features/`, `src/engine/`, `src/config/`, `src/data/` | Build passes, `docs/structure.md` | **DONE** |
| **R1.2** | Stage 1 | Config extraction of weights, thresholds, word lists | `tests/config-lint.test.ts` | **DONE** |
| **R1.3** | Stage 1 | Clock injection (`today` parameter) & pure deterministic test | `tests/determinism.test.ts` | **DONE** |
| **R1.4** | Stage 1 | Dataset provenance types + Zod schemas + `npm run validate:data` | `src/data/__tests__/validateData.test.ts` | **DONE** |
| **R1.5** | Stage 1 | Resume Fact Ledger v2 with education, 10th/12th, coding profiles | `src/engine/ledger/__tests__/ledger.test.ts` | **DONE** |
| **R1.6** | Stage 1 | Dark theme design tokens & automated WCAG contrast tests | `src/__tests__/a11y/contrast.test.ts` | **DONE** |
| **R1.7** | Stage 1 | Shared UI primitives: ProvenanceBadge, ConfidenceChip, EvidenceQuote | Unit tests & visual inspection | **DONE** |
| **R1.8** | Stage 1 | ErrorBoundary per tool route with recovery nav | Route crash tests (`tests/unit/toolErrorBoundary.test.tsx`) | **DONE** |
| **R2.1** | Stage 2 | Copy audit against banned hype/fabrication phrases | `tests/copy-audit.test.ts` | **DONE** |
| **R2.2** | Stage 2 | Honest problem framing for freshers on landing / hub | Copy inspection | **DONE** |
| **R2.3** | Stage 2 | Rename ATS Score -> Resume Strength, JD score -> JD Match | Text & display-name inspection (`ScoreHeader.tsx`) | **DONE** |
| **R2.4** | Stage 2 | Replace Callback Probability with Match Confidence factors | Engine & UI inspection (`CompareJDsPage.tsx`) | **DONE** |
| **R2.5** | Stage 2 | Remove or relabel unverifiable recruiter/Glassdoor claims | UI inspection | **DONE** |
| **R2.6** | Stage 2 | Rewrite README and `docs/CONTEXT_BRIEF.md` for honesty | Documentation review | **DONE** |
| **R3.1** | Stage 3 | PDF text layer normalisation & baseline clustering | `tests/ingestion/layout-kit.test.ts` | **DONE** |
| **R3.2** | Stage 3 | Multi-column & sidebar-aware reading order detection | Synthetic layout fidelity tests | **DONE** |
| **R3.3** | Stage 3 | Header/footer repetition removal | `tests/ingestion/layout-kit.test.ts` | **DONE** |
| **R3.4** | Stage 3 | Human-friendly failure detection (scanned, PDF code, caps) | `tests/ingestion/layout-kit.test.ts` | **DONE** |
| **R3.5** | Stage 3 | DOCX flattening via mammoth with warnings | `src/engine/ingestion/` & `docs/ingestion.md` | **DONE** |
| **R3.6** | Stage 3 | Normalisation of messy pasted text | 12 paste fixtures test (`layout-kit.test.ts`) | **DONE** |
| **R3.7** | Stage 3 | Section segmentation with Indian heading variants | `src/engine/ingestion/sectionSegmenter.ts` | **DONE** |
| **R3.8** | Stage 3 | Non-fabricating entity extraction (degrees, CGPA, links) | `src/engine/ingestion/entityExtractor.ts` | **DONE** |
| **R3.9** | Stage 3 | Ingestion diagnostics object & "What a parser sees" preview | `tests/ingestion/layout-kit.test.ts` | **DONE** |
| **R3.10**| Stage 3 | Layout test kit (single, two-col, sidebar, grid, RTL glyphs) | `tests/ingestion/layout-kit.test.ts` | **DONE** |
| **R4.1** | Stage 4 | Canonical skill dictionary in `src/data/skills/` | Skill registry & type tests | **DONE** |
| **R4.2** | Stage 4 | Optional open-taxonomy import script (ESCO / O*NET CC-BY-4.0) | `scripts/import-taxonomy.ts`, `docs/ATTRIBUTION.md` | **DONE** |
| **R4.3** | Stage 4 | Tokeniser with alias resolution & span offsets | `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.4** | Stage 4 | Context & negation classifier (negated, weak, planned, strong)| `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.5** | Stage 4 | Evidence levels L0 (listed) to L3 (metric outcome) | `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.6** | Stage 4 | JD segmentation & mandatory vs preferred classification | `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.7** | Stage 4 | Match classification: DIRECT, TRANSFERABLE, PARTIAL, MISSING | `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.8** | Stage 4 | Configurable hard-skill weighted coverage | `tests/matcher/matcher.test.ts` | **DONE** |
| **R4.9** | Stage 4 | 60+ matcher test cases & comparison against baseline | `docs/engine-delta.md` (60/60 passing) | **DONE** |
| **R5.1** | Stage 5 | 4 calibrated scoring pillars (Hard skills, Evidence, Fresher, Format) | Scorer unit tests | **DONE** |
| **R5.2** | Stage 5 | Writing & evidence rules with question-based fixes | `tests/roaster/writing-rules.test.ts` | **DONE** |
| **R5.3** | Stage 5 | Indian fresher readiness heuristics (projects, GitHub, CGPA note)| `tests/roaster/fresher-readiness.test.ts` | **DONE** |
| **R5.4** | Stage 5 | Format & parse safety score + raw text preview | `src/engine/roaster/formatScorer.ts` | **DONE** |
| **R5.5** | Stage 5 | Verbatim evidence citations & highlighted spans | `EvidenceQuote`, span highlighter | **DONE** |
| **R5.6** | Stage 5 | Harsh truths gated to >= Medium confidence | `src/engine/roaster/roaster.ts` | **DONE** |
| **R5.7** | Stage 5 | Clean 4-tab results view with actionable Next Steps | `src/engine/roaster/roaster.ts` | **DONE** |
| **R5.8** | Stage 5 | Calibration harness & confusion matrix | `tests/calibration/calibration.test.ts`, `docs/calibration-report.md` | **DONE** |
| **R5.9** | Stage 5 | Sub-1.5s scan performance (26.5ms benchmark) | `tests/roaster/performance.test.ts` | **DONE** |
| **R6.1** | Stage 6 | JD Compare fit ring & Match Confidence | `tests/compare/compare.test.ts` | **DONE** |
| **R6.2** | Stage 6 | Venn diagram (Shared / Role A only / Role B only) | `tests/compare/compare.test.ts` | **DONE** |
| **R6.3** | Stage 6 | Bridge plan linking gaps to Build Briefs & Credentials | `tests/compare/compare.test.ts` | **DONE** |
| **R6.4** | Stage 6 | JD input with extraction explanation summary | `tests/compare/compare.test.ts` | **DONE** |
| **R6.5** | Stage 6 | Resume Fact Ledger review & non-destructive edit form | `tests/tailor/content-parity.test.ts` | **DONE** |
| **R6.6** | Stage 6 | Requirement analysis view in plain English | `tests/compare/compare.test.ts` | **DONE** |
| **R6.7** | Stage 6 | Truth map with "Add context" question fields | `tests/tailor/truth-gate.test.ts` | **DONE** |
| **R6.8** | Stage 6 | Configurable fresher section ordering (A4 default) | `src/config/India-fresher.ts`, `layoutTree.ts` | **DONE** |
| **R6.9** | Stage 6 | Truth Gate: 25 adversarial cases blocked & 10 legitimate pass | `tests/tailor/truth-gate.test.ts` | **DONE** |
| **R6.10**| Stage 6 | Content parity across HTML, TXT, and DOCX via LayoutTree | `tests/tailor/content-parity.test.ts` | **DONE** |
| **R6.11**| Stage 6 | Zero silent loss drawer for omitted ledger items | `tests/tailor/content-parity.test.ts` | **DONE** |
| **R7.1** | Stage 7 | Credential Engine freshness badges & yearly change notices | `tests/credentialsFreshnessSchema.test.ts` | **DONE** |
| **R7.2** | Stage 7 | Student eligibility, fee waivers, and next window notes | Data & UI tests | **DONE** |
| **R7.3** | Stage 7 | Placeholder bullets ([CREDENTIAL_ID], [DATE_EARNED]) & copy lock | `tests/credentialsTruthGate.test.ts` | **DONE** |
| **R7.4** | Stage 7 | Project Briefs validation & difficulty contradiction check | `validateData.test.ts`, `docs/data-report.md` | **DONE** |
| **R7.5** | Stage 7 | Hour ranges with assumptions (+/-25% estimate) | `bundleBriefs.ts`, `bundler.test.ts` | **DONE** |
| **R7.6** | Stage 7 | Replace recruiter claims with "What this project demonstrates" | `BuildBriefsPage.tsx`, `bundleBriefs.ts` | **DONE** |
| **R7.7** | Stage 7 | Greedy set cover bundle generator with unit tests | `tests/briefs/bundler.test.ts` | **DONE** |
| **R7.8** | Stage 7 | Career Trajectory compensation ranges in LPA with INR formatting | `CareerPathSimulator.tsx`, `careerEngine.ts` | **DONE** |
| **R7.9** | Stage 7 | Fresher 2-year view without "Promotion Simulator" wording | `CareerPathSimulator.tsx` | **DONE** |
| **R7.10**| Stage 7 | "Skills to close" panel connected to latest ATS scan | `CareerPathSimulator.tsx`, `atsStore.ts` | **DONE** |
| **R7.11**| Stage 7 | TalentLens company provenance & duplicate removal | `talentLensData.ts`, `talentlens.test.ts` | **DONE** |
| **R7.12**| Stage 7 | Company cards search, filters, roles page, Deep Analysis | `CompanyRolesPage.tsx`, `MatchingDemo.tsx` | **DONE** |
| **R7.13**| Stage 7 | JD completeness audit & compiled data disclosure | `docs/jd-gaps.md`, `CompanyRolesPage.tsx` | **DONE** |
| **R7.14**| Stage 7 | Deterministic `generateOutreach` with 3 formats & 2 variants | `src/features/suite/outreach/__tests__/generateOutreach.test.ts` | **DONE** |
| **R8.1** | Stage 8 | A11y: keyboard reachability, visible focus, ARIA labels | `tests/a11y/` | **DONE** |
| **R8.2** | Stage 8 | Privacy: zero-egress static check & local data storage drawer | `scripts/check-privacy.ts` | **DONE** |
| **R8.3** | Stage 8 | Robustness: empty, huge, Devanagari, emoji, limits | Robustness test suite | **DONE** |
| **R8.4** | Stage 8 | Navigation consistency: Back/Home, scroll-to-top, pressed state | UI audit | **DONE** |
| **R9.1** | Stage 9 | `docs/invariants.md`: 1:1 mapping of principles to test cases | `docs/invariants.md` | **DONE** |
| **R9.2** | Stage 9 | Test inventory scripts before/after | `package.json` | **DONE** |
| **R9.3** | Stage 9 | Complete documentation suite (ingestion, scoring, data-policy) | `docs/` | **DONE** |
| **10.1** | Stage 10| Run `/verify` and capture synthetic walkthrough | `npm run verify` & `scripts/e2e-synthetic-walkthrough.ts` | **DONE** |
| **10.2** | Stage 10| Confirm zero out-of-scope files altered | Git diff audit (P-7 verified) | **DONE** |
| **10.3** | Stage 10| Final quality report & owner action checklist | Final report artifact & `docs/blocked.md` | **DONE** |
| **10.4** | Stage 10| Checkpoint commit & push to main and origin | Git commit & push (`hireflow-v3` & `main`) | **DONE** |
