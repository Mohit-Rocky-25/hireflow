# HIREFLOW ATS — PHASE 10.5 SINGLE SCORING AUTHORITY, UI CONSISTENCY & EXPORT INTEGRITY REPORT

**Phase:** 10.5 (`B1`, `B6`, `B7` from Phase 10.1 Corrective Backlog + `C7` Accounting Reconciliation)  
**Date:** 2026-11-26  
**Repository Baseline:** `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, Branch: `main`  
**Execution Topology:** 3 parallel implementation workers (`authority-worker` for Workstream A, `ui-lifecycle-worker` for Workstream B, `export-parity-worker` for Workstream C) + Coordinator integration (`types.ts`, `scorer.ts`, `journalAdapter.ts`, `property_invariants.test.ts` `C7`, Section 9 independence suite, Section 10 regression triage) + 1 strictly read-only independent adversarial verifier (`p5-verifier`, final verdict: **APPROVED**).

---

## 1. Initial & Protected Repository State

- Recorded `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef` on branch `main`.
- Preserved all uncommitted Phases 02–10.4 changes, frozen benchmark fixtures, and 7-dimensional canonical scoring weights (`30 / 20 / 15 / 10 / 10 / 10 / 5`).
- Verified `git status --short -- docs/validation-report.md` clean (empty) before and after all Phase 10.5 changes.
- `tests/validation/validateScoring.test.ts` and golden/snapshot generation scripts were **NOT** executed.

---

## 2. Complete Scoring-Consumer Inventory (Section 4 Preflight)

| Consumer / Module | Classification | Legacy/Pre-Fix Defect | Phase 10.5 Action |
|---|---|---|---|
| `src/features/ats/engine/index.ts` | **Active Production Runtime** | Invoked `analyzeCanonical()` (`canonicalResult`) on every `runAtsEngine()` call; lacked presentation-only `quickRoast` & `applicationGuidance` | Retired `analyzeCanonical()` from `runAtsEngine()`, replaced with presentation-only `buildPresentationProjections()`, re-exported ATS 7D spec constants |
| `src/pages/tools/ResumeChecker.tsx` | **Active Production Runtime** | Read `canonical?.quickRoast`, `canonical.scores.finalScore`, `SkillResult.name`; lacked scan-scoped `latestAuditEntry` invalidation & failed-scan reset | Migrated to authoritative `engineResult.quickRoast` / `score` / `canonical`; added `activeScanIdRef`, `latestSnapshot`, dynamic fallback breakdown |
| `src/features/ats/components/ScoreHeader.tsx` & `StaleVersionBanner.tsx` | **Active Production Runtime** | Compared `4.0.0-ats7d` against TalentLens `2.4.0` (`CANONICAL_SCORING_SPEC`); read `m.name` instead of `m.canonical`; static `/30..` fallback | Passed `ATS_SEVEN_DIMENSION_SPEC_VERSION` / `FINGERPRINT` to `StaleVersionBanner`; fixed `m.canonical`; used dynamic weights & zero guards |
| `src/features/ats/components/OverviewTab.tsx` | **Active Production Runtime** | Divided `cat.score / cat.max` with no zero guard (`0 / 0 = NaN%` on fresher/0-YOE redistributed weights) | Preferred `trace.pillars` / `activeWeights`, added `cat.max <= 0` N/A state (`0%` meter width, zero `NaN`) |
| `src/features/ats/components/SkillsTab.tsx` | **Active Production Runtime** | Positional `validatedCitations[0]`; omitted orthogonal `claimSupport` / provenance / attribution distinctions | Replaced with `findMatchingCitation()` + explicit `claimSupport`, `sourceType`, `environmentMaturity`, and attribution badges |
| `src/designs/spruce/pages/ResumeChecker/ResumeCheckerPage.tsx` & `useAtsRoasterController.ts` | **Active Production Runtime** (`/tools/resume-checker` Spruce gate) | Static `/30, /20, /15, /10, /10, /10` grid; read `skill.name` / `'related' \| 'partial'`; lacked `activeScanIdRef` & history snapshot | Switched to dynamic `trace.pillars` / `activeWeights` + `Tier Fit` + `skill.canonical`; added scan-scoped isolation + `authoritativeSnapshot` in history |
| `src/features/ats/journalAdapter.ts` | **Active Production Runtime** | Hardcoded static weights (`0.3..0.05`) and stored raw unnormalized subscores (`0–30`, etc.) instead of `0–100` in persisted `AuditEntry.breakdown` | Built `breakdown` from `trace.pillars` / `activeWeights` with normalized `0–100` `rawScore` and omitted `0`-weight pillars |
| `src/features/ats/engine/reportState.ts` | **Active Production Runtime** | `roundedScore` & `verdict.band` summed `ledgerLines` without subtracting penalties (`totalDeductions`) | Used post-penalty `trace?.composite ?? scoring.score` for `roundedScore` & `verdict.band`; aligned `assertReportConsistency` |
| `src/features/ats/engine/authoritativeSnapshot.ts`, `dossierModel.ts`, `exportPdf.ts`, `exportDocx.ts`, `exportDossier.ts` | **Active Production Runtime** (Exports & History) | Static `/30..` denominators in PDF/DOCX/MD; omitted Layer 5B/integer seniority/ScoreTrace in MD; synthetic identity/penalty/year fallbacks; unwrapped `runAtsEngine` wrapper in legacy fallback | Dynamic `resolveDossierDimensions()` across PDF/DOCX/MD; full MD parity + `escapeMarkdownCell()`; unwrapped `runAtsEngine()`; removed synthetic fallbacks |
| `src/lib/ats/canonicalAnalysis.ts`, `evidenceScorer.ts`, `canonicalSpec.ts` (in `lib/ats`), `pipeline.ts`, `scoreAggregator.ts` | **Test-Only Compatibility / Retired from Live ATS Roaster** | `analyzeCanonical` used `Date.now()` (`368`) & loose cache normalization | Marked `@deprecated`; hardened cache key normalization & deterministic timestamp metadata; zero live `ResumeChecker` / `runAtsEngine` callers |
| `src/scoring/core/traceBuilder.ts` (`runScoringEngine`) & `src/scoring/spec/canonicalSpec.ts` | **Secondary Product Runtime** (TalentLens Demo & Methodology Page only) | Isolated to `src/pages/demo/talentLensEngine.ts` & `src/pages/methodology/MethodologyPage.tsx` | Kept untouched for TalentLens/Methodology compatibility; `StaleVersionBanner` continues using `2.4.0` when caller omits ATS 7D overrides |
| `tests/validation/validateScoring.test.ts` | **Excluded / Validation Script** | Calls legacy `analyzeCanonical` / `scoreBullet` and writes reports | **Not executed** per safety rules |

---

## 3. Before & After Execution Architecture

```
BEFORE (Phase 10.4):
  runAtsEngine()
    ├─► 7-Dim Scorer (4.0.0-ats7d) ──► ScoreHeader (compared against v2.4.0 -> permanent Stale Banner!)
    │                                  ──► OverviewTab (0 / 0 = NaN%) & SkillsTab (validatedCitations[0])
    │                                  ──► reportState (ignored penalties!) & exports (hardcoded /30../5)
    └─► analyzeCanonical() [SECOND ENGINE] ──► canonicalResult.quickRoast / guidance ──► ResumeChecker UI

AFTER (Phase 10.5):
  runAtsEngine()  [SOLE LIVE AUTHORITATIVE PATH — ZERO analyzeCanonical() CALLS]
    └─► ScoreTrace (4.0.0-ats7d, single composite + dynamic activeWeights/effectiveWeight)
          ├──► buildPresentationProjections() ──► quickRoast + applicationGuidance + talentLensReadiness
          ├──► buildReportState()             ──► post-penalty roundedScore & verdict.band
          ├──► createAuthoritativeReportSnapshot() ──► Snapshot (dimensions + applicable/notApplicableReason)
          ├──► atsToAuditInput() + Scan-Scoped UI (ResumeChecker, Spruce, ScoreHeader, OverviewTab, SkillsTab)
          └──► buildDossierModel() ──► exportPdf / exportDocx / generateMarkdownDossier (100% score, weight, identity & evidence parity)
```

---

## 4. Legacy Engine Retirement Details

- Removed `analyzeCanonical()` import and execution from `src/features/ats/engine/index.ts`. `AtsEngineResult.canonicalResult` is now `@deprecated` and `undefined` on live scans, and `CANONICAL_CACHE` remains empty (`size === 0`) across `runAtsEngine()` execution.
- `src/lib/ats/canonicalAnalysis.ts`, `src/lib/ats/evidenceScorer.ts`, and legacy exports in `src/lib/ats/index.ts` are retained strictly as `@deprecated` test-only compatibility adapters so legacy Stage 2/consistency suites remain inspectable without affecting production execution.
- Replaced `timestamp: Date.now()` in `canonicalAnalysis.ts` with deterministic `LEGACY_CANONICAL_METADATA_TIMESTAMP` (`Date.UTC(2024, 10, 24)`) and hardened `generateFingerprint()` against whitespace/company-context cache pollution.
- **Secondary Runtime Disclosure:** `src/scoring/core/traceBuilder.ts` (`runScoringEngine`) and `src/scoring/spec/canonicalSpec.ts` remain active only for TalentLens Demo (`src/pages/demo/`) and Methodology (`src/pages/methodology/`), never for ATS Resume Roaster (`/tools/resume-checker`).

---

## 5. Quick Roast Migration (`A2`)

- Implemented pure presentation-only `buildPresentationProjections()` in `src/features/ats/engine/index.ts`:
  - `quickRoast.finalScore` equals `unifiedTrace.composite ?? scoring.score`.
  - `applicationGuidance` (`'Ready to apply' | 'Apply after high-priority fixes' | 'Significant gaps to address' | 'Insufficient evidence to evaluate'`) is derived strictly from composite score, `mustHavesMetRatio`, `seniorityMatchResult?.isEligible`, contradicted must-haves, and `parseQuality`.
  - `strengths` (up to 3) cite strictly verified `skillResults` (`validatedCitations`/`evidence`) and `creditedInImpact` `metricEvidences` with zero invented quotes.
  - `gaps` (up to 3) surface seniority shortfalls (`!isEligible`), contradicted must-haves, missing must-haves, and weak-evidence must-haves.
  - `prioritizedActions` project directly from `fixFirst` and `learningPath.rewrites`.

---

## 6. Authoritative `ScoreTrace` Ownership (`A5`)

- `ScoreHeader.tsx`, `OverviewTab.tsx`, `ResumeChecker.tsx`, `ResumeCheckerPage.tsx`, `journalAdapter.ts`, `reportState.ts`, `authoritativeSnapshot.ts`, `dossierModel.ts`, `exportPdf.ts`, `exportDocx.ts`, and `exportDossier.ts` now read directly from canonical `ScoreTrace` (`pillars`, `rawSubtotal`, `totalBonuses`, `totalDeductions`, `preClampScore`, `wasClamped`, `composite`, `effectiveWeight`).
- Extended `ScorerInput` in `scorer.ts` with optional `bonuses` (defaulting to `0` when omitted, zero impact on canonical scoring weights or benchmark scores `A=90` / `B=88`).

---

## 7. Score-Version Correction (`A3`)

- Extended `StaleVersionBanner.tsx` with optional `currentSpecVersion` and `currentFingerprint` props (defaulting to `CANONICAL_SCORING_SPEC` only when omitted by TalentLens callers).
- Re-exported `ATS_SEVEN_DIMENSION_SPEC_VERSION` (`4.0.0-ats7d`), `ATS_ENGINE_VERSION` (`4.0.0`), and `ATS_SEVEN_DIMENSION_FINGERPRINT` from `src/features/ats/engine/index.ts` and passed them into `<StaleVersionBanner />` in `ScoreHeader.tsx`, eliminating the false permanent `4.0.0-ats7d vs 2.4.0` warning while still detecting genuinely outdated (`v2.4.0`) or mismatched-fingerprint snapshots.

---

## 8. `ReportState` Penalty Reconciliation (`C1`)

- Extended `ReportScoreLedger` and `BuildReportStateParams.scoring` in `reportState.ts` with `rawSubtotal`, `totalBonuses`, `totalDeductions`, `preClampScore`, `wasClamped`, and `trace`.
- `buildReportState()` now sets `roundedScore` from authoritative post-penalty `trace?.composite ?? scoring.score`, derives `verdict.band` and `verdict.oneParagraphSummary` from that same `roundedScore`, and updates `assertReportConsistency()` + `migrateReportState()` to validate `(rawSubtotal + totalBonuses - totalDeductions)` -> `preClampScore` -> clamped `roundedScore` with zero double subtraction.

---

## 9. `C7` Accounting Invariant Correction & Output

- Replaced the penalty-blind `factorSum === res.score` check in `tests/property_invariants.test.ts` (`C7`) with full financial-accounting reconciliation across:
  - All 14 `TEST_CORPUS` pairs end-to-end (`ScoreTrace` <-> `result.score` <-> `quickRoast.finalScore` <-> `reportState.scoreLedger.roundedScore` <-> `AuthoritativeReportSnapshot` <-> `DossierModel.headline.score`).
  - All 8 controlled accounting cases: (1) no deductions, (2) one penalty (`-3`), (3) multiple penalties (`-12`), (4) positive bonus (`+3`), (5) combined bonuses & deductions (`+6 - 3`), (6) max clamp (`> 100 -> 100`), (7) negative `preClampScore` min clamp (`-4.5 -> 0` without zero-bullet override), and (8) effective-weight redistribution (`30/25/15/15/0/10/5`).
- Observed result: `tests/property_invariants.test.ts` **13/13 passed (including C7)**.

---

## 10. UI Score & Identity Consistency (`B1`, `B2`, `B4`, `B5`)

- Fixed `SkillResult.name` -> `SkillResult.canonical || SkillResult.skillId` in `ScoreHeader.tsx`, `ResumeChecker.tsx`, and `ResumeCheckerPage.tsx` (Spruce).
- Fixed `0 / 0 = NaN%` in `OverviewTab.tsx` and hardcoded `/30../5` denominators in `OverviewTab.tsx`, `ScoreHeader.tsx`, `ResumeCheckerPage.tsx`, and `journalAdapter.ts` (renders `N/A — Weight redistributed` and `0%` width for 0-weight pillars).
- Replaced positional `validatedCitations[0]` in `SkillsTab.tsx` with `findMatchingCitation()` and added distinct `claimSupport`, `sourceType`, `environmentMaturity`, and `candidateContribution` badges.

---

## 11. Fresh Scan & Stale-State Isolation (`B3`)

- Added `activeScanIdRef` and synchronous `latestSnapshot` state in `ResumeChecker.tsx` and `useAtsRoasterController.ts`:
  - Starting a scan invalidates `latestAuditEntry`, `latestSnapshot`, and `fileError`.
  - Async `useAuditStore.record()` commits `setLatestAuditEntry(entry)` only when `activeScanIdRef.current === currentScanId`.
  - Failed scans (`!response.success` or thrown exception) clear stale `engineResult` instead of leaving the prior candidate's score on screen.
  - `buildFallbackAuditEntry()` attaches `effectiveSnapshot` directly so exports immediately reflect the active scan even before async persistence completes, and `ResumeChecker.tsx:624` checks `resumeSource === 'upload'` accurately.

---

## 12. Effective-Weight & Export Parity (`C2`, `C3`, `C4`, `C5`)

- **Dynamic Weights Across PDF, DOCX & Markdown (`C2`, `C4`):** Added `resolveDossierDimensions()` in `dossierModel.ts` and updated `exportPdf.ts`, `exportDocx.ts`, and `exportDossier.ts` (including PDF composite fallback) to consume `dimensions[].effectiveWeight` (displaying `contribution / maxPts pts` or `N/A (Redistributed) (0%)` when `effectiveWeight === 0`).
- **Markdown Parity & Table Safety (`C3`):** `generateMarkdownDossier()` now includes Seniority & Eligibility Assessment (exact touched/completed/required months, shortfall, scope, provenance, gate), Mathematical ScoreTrace Reconciliation, and Layer 5B Quantified Impact & Outcome Metrics Ledger, with `escapeMarkdownCell()` escaping `|`, `\r`/`\n`, and backticks across all table cells.
- **No Synthetic Identity/Penalty Fabrication (`C5`):** Removed `'Target Organization'` / `'Software Engineer'` / `'Candidate'` synthetic labels (`'Unresolved Candidate'`, `'Unspecified Role'`, `'Unspecified Employer'` when absent), removed synthetic `p-scale` (`-5`) penalty, synthetic `3/4 yrs` seniority fallback, synthetic `fixFirst` placeholders, and `wordCount: 450` / `metricsRatio: 0.5` fabrications. Also unwrapped `runAtsEngine()` (`{ success, result }`) cleanly in `dossierModel.ts:547-555` for legacy `findingsJson: {}` fallbacks.

---

## 13. Existing Test-Failure Triage (Section 10)

1. **`src/features/ats/__tests__/engine.test.ts:180` (`Test 8`):**
   - **Original Assumption:** Counted `mustSkills.filter(s => s.status !== 'missing').length` (including bare skills-list `'weak'` mentions) in the `mustHavesMet` numerator.
   - **Actual Specification (`Phase 10.3`):** `scorer.ts` strictly defines `mustMetCount` as `SATISFIED` / `'verified'` must-haves backed by evidence while retaining `0.5` partial credit (`weak` cannot satisfy a hard requirement).
   - **Disposition:** Updated assertion at `engine.test.ts:180` to match the verified must-have contract (`8/8` passing).
2. **`tests/bugs_stage0.test.ts:28-37` (`B2`):**
   - **Original Assumption:** Looked up standalone `skillId === 'java'` on `microsoft_swe_jd.txt` (`"at least one of Python/Java/C++/C#"`). Meanwhile `B4` (`bugs_stage0.test.ts:50-54`) explicitly asserts those four languages form one OR-group (`python` + `orAlternatives: ['java', 'cpp', 'csharp']`).
   - **Disposition:** Verified `Java` on `fresher_resume.txt` still extracts from `CAREER OBJECTIVE` (never `Contact & Header`) when targeted as a requirement; updated `B2` to verify both the OR-group on `microsoft_swe_jd.txt` AND `CAREER OBJECTIVE` section tagging for standalone `Java` (`13/13` passing).

---

## 14. Scoring Independence & Runtime Verification (Section 9)

- Added [phase10_5RuntimeParity.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/ats/phase10_5RuntimeParity.test.ts) (6 tests): verified Tier Fit saturation independence above threshold, identity invariance, Impact saturation invariance across tiers, isolation of unrelated missing skills, non-mutating snapshot/Markdown/PDF/DOCX exports, persisted `AuditEntry.breakdown` normalization (`0–100`), and dynamic effective-weight redistribution.

---

## 15. Independent Verifier Objections & Resolution (`p5-verifier`)

1. **Objection #1 (`#69`): `dossierModel.ts:547-553` did not unwrap `runAtsEngine()` `{ success, result }` wrapper.** Fixed by `export-parity-worker` (`#72`) + regression test in `phase10_5ExportParity.test.ts`.
2. **Objection #2 (`#69`): `journalAdapter.ts:36-79` stored static weights and raw subscores in persisted `AuditEntry.breakdown`.** Fixed by Coordinator + regression test in `phase10_5RuntimeParity.test.ts`.
3. **Non-blocking Notes (`#69`): `ResumeChecker.tsx:624` `'uploaded'` -> `'upload'`; `useAtsRoasterController.ts:306-312` snapshot/version fields in `addHistoryEntry`.** Fixed by `ui-lifecycle-worker` (`#73`).
4. **Objection #3 (`#75`): `phase10_5RuntimeParity.test.ts:240` asserted `100` for a `PROJECTS`-only candidate whose `mustHaveCoverage.rawScore` was `50`.** Fixed by Coordinator to assert exact `mustRawScore === 50`.
5. **Final Verdict (`#77`):** `p5-verifier` **APPROVED** across all checks.

---

## 16. Observed Verification Results (Post-Final-Edit Runs)

| Check / Suite | Command | Observed Result |
|---|---|---|
| Validation Report Cleanliness | `git status --short -- docs/validation-report.md` | Exit `0` (clean against `HEAD`) |
| TypeScript Check | `npx tsc --noEmit` | Exit `0` |
| Ontology Audit | `npm run ontology:audit` | Exit `0` (`33` ontology nodes, `303` skills, `332` relationships, `0` structural errors) |
| Production Build | `npm run build` | Exit `0` (Vite v8.3.0, `3628` modules transformed) |
| Comprehensive Safe Vitest Suite (Coordinator final run) | `npx vitest run tests/ats/ tests/property_invariants.test.ts src/features/ats/__tests__/ src/designs/spruce/smoke.test.tsx tests/stage1_report_state.test.ts tests/stageD_seniority_modes.test.ts tests/bugs_stage0.test.ts tests/bullets/bulletQuality.test.ts tests/fresher/fresherAuditor.test.ts tests/candidate_os/dossier-export.test.ts tests/unit/stage2/scoringValidity.test.ts tests/unit/whyThisScoreDrawer.test.tsx` | **40/40 files passed, 466/466 tests passed, exit `0`** (includes `property_invariants` 13/13, `phase10_5SingleAuthority` 7/7, `phase10_5UiConsistency` 11/11, `phase10_5ExportParity` 8/8, `phase10_5RuntimeParity` 6/6, `Benchmark A = 90`, `Benchmark B = 88`, `golden-resumes`, `extendedGoldenResumes`, `canonicalConsistency` 24/24, `engine` 8/8, `bugs_stage0` 13/13, `stage1_report_state` 5/5) |
| Browser E2E (`p5-verifier`) | `npx playwright test e2e/e12-export-readiness.spec.ts` | Exit `0` (`2 passed`, `1 flaky` passed on retry -> all `3` green in Chromium) |
| Excluded Validation Suite | `tests/validation/validateScoring.test.ts` | **Not executed** per repository safety policy |

---

## 17. Remaining Limitations

- Full interactive browser QA of the React/Spruce UI forms (`ResumeChecker.tsx` / `ResumeCheckerPage.tsx`) beyond `e12-export-readiness.spec.ts`, SSR smoke tests (`smoke.test.tsx`), and RTL/JSDOM unit tests (`phase10_5UiConsistency.test.tsx`) was not executed against a live dev server UI session.
- `TalentLens` demo (`src/pages/demo/talentLensEngine.ts`) and Methodology explorer (`src/pages/methodology/MethodologyPage.tsx`) intentionally retain `runScoringEngine()` (`2.4.0`), separated from the ATS Resume Roaster (`4.0.0-ats7d`) pipeline.
- Security/DOCX decompression/CSP hardening and `tests/validation/validateScoring.test.ts` remain explicitly excluded from Phase 10.5.

---

## 18. Full Git Status & Untracked File Inventory

Observed at `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef` (`main`):

### Modified Tracked Files (`M`)
- `docs/ats-engine/ENGINE_ARCHITECTURE_AUDIT.md`
- `docs/baseline-scores.json`
- `docs/baseline.md`
- `docs/pathways/fetch-log.jsonl`
- `package.json`
- `src/components/scoring/StaleVersionBanner.tsx`
- `src/designs/spruce/pages/ResumeChecker/ResumeCheckerPage.tsx`
- `src/features/ats/__tests__/canonicalConsistency.test.ts`
- `src/features/ats/__tests__/engine.test.ts`
- `src/features/ats/components/AuditTab.tsx`
- `src/features/ats/components/OverviewTab.tsx`
- `src/features/ats/components/ScoreHeader.tsx`
- `src/features/ats/components/SkillsTab.tsx`
- `src/features/ats/engine/bulletAnalyzer.ts`
- `src/features/ats/engine/contactExtractor.ts`
- `src/features/ats/engine/experienceEstimator.ts`
- `src/features/ats/engine/experienceParser.ts`
- `src/features/ats/engine/index.ts`
- `src/features/ats/engine/jdAnalyzer.ts`
- `src/features/ats/engine/projectParser.ts`
- `src/features/ats/engine/reportState.ts`
- `src/features/ats/engine/scorer.ts`
- `src/features/ats/engine/sectionSplitter.ts`
- `src/features/ats/engine/skillMatcher.ts`
- `src/features/ats/engine/types.ts`
- `src/features/ats/hooks/useAtsRoasterController.ts`
- `src/features/ats/journalAdapter.ts`
- `src/features/ats/knowledge/taxonomy/backendFrameworks.ts`
- `src/features/ats/knowledge/taxonomy/databasesData.ts`
- `src/features/ats/knowledge/taxonomy/frontendWeb.ts`
- `src/features/ats/knowledge/taxonomy/index.ts`
- `src/features/ats/knowledge/taxonomy/softwareLanguages.ts`
- `src/features/dossier/dossierModel.ts`
- `src/features/dossier/exportDocx.ts`
- `src/features/dossier/exportDossier.ts`
- `src/features/dossier/exportPdf.ts`
- `src/features/suite/engine/simulateFix.ts`
- `src/lib/ats/canonicalAnalysis.ts`
- `src/lib/ats/evidenceScorer.ts`
- `src/lib/ats/index.ts`
- `src/pages/tools/ResumeChecker.tsx`
- `src/scoring/core/types.ts`
- `src/scoring/spec/types.ts`
- `src/store/tools/atsStore.ts`
- `tests/bugs_stage0.test.ts`
- `tests/property_invariants.test.ts`

### Untracked Files & Directories (`??`)
- `docs/ats-engine/PHASE_02_P0_REMEDIATION_REPORT.md` through `docs/ats-engine/PHASE_10_4_SENIORITY_AND_METRIC_RUNTIME_INTEGRITY_REPORT.md`
- `docs/ats-engine/PHASE_10_5_SINGLE_SCORING_AUTHORITY_UI_EXPORT_INTEGRITY_REPORT.md` (created in Phase 10.5)
- `e2e/e12-export-readiness.spec.ts`
- `src/features/ats/engine/authoritativeSnapshot.ts`
- `src/features/ats/engine/citationModel.ts`
- `src/features/ats/engine/citationValidator.ts`
- `src/features/ats/engine/companyExtractor.ts`
- `src/features/ats/engine/competencyMatcher.ts`
- `src/features/ats/engine/evidenceExtractor.ts`
- `src/features/ats/engine/evidenceModel.ts`
- `src/features/ats/engine/logicalExpression.ts`
- `src/features/ats/engine/metricExtractor.ts`
- `src/features/ats/engine/metricModel.ts`
- `src/features/ats/engine/scanIdentity.ts`
- `src/features/ats/engine/seniorityMatcher.ts`
- `src/features/ats/engine/sourceLocator.ts`
- `src/features/ats/engine/statementExtractor.ts`
- `src/features/ats/engine/tenureCalculator.ts`
- `src/features/ats/fixtures/`
- `src/features/ats/knowledge/ontology/`
- `tests/ats/` (including `phase10_5SingleAuthority.test.ts`, `phase10_5UiConsistency.test.tsx`, `phase10_5ExportParity.test.ts`, and `phase10_5RuntimeParity.test.ts`)
