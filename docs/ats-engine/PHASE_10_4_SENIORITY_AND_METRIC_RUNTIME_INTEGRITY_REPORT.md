# HIREFLOW ATS — PHASE 10.4 SENIORITY, EXPERIENCE & METRIC RUNTIME INTEGRITY REPORT

**Phase:** 10.4 (`B5` from Phase 10.1 Corrective Backlog + Downstream Integration Defects)  
**Date:** 2026-11-26  
**Repository Baseline:** `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, Branch: `main`  
**Execution Topology:** 2 parallel implementation workers (`seniority-worker` for Workstream A, `metrics-worker` for Workstream B) + coordinator Section 4 preflight, runtime integration, and fix-simulation wiring + 1 strictly read-only independent adversarial verifier (`p4-verifier`, final verdict: **APPROVED**).

---

## Preflight & Repository Protection Summary

- Recorded preflight baseline: `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, `main`; verified `git status --short -- docs/validation-report.md` clean against `HEAD` before and after execution.
- Preserved all prior uncommitted Phases 02–10.3 changes and frozen V1/V2 benchmark fixtures.
- `tests/validation/validateScoring.test.ts` and golden/snapshot writing scripts were **NOT** executed during Phase 10.4.
- Canonical 7-dimension scoring weights and Frozen V2 benchmarks remain preserved (`Benchmark A / PayGrid = 90`, `Benchmark B / Northstar = 88`, `impactMetrics = 15`).

---

## 1. Section 4 Preflight: `LEARNING` / `ASPIRATIONAL` vs Negation Polarity

- **Root Cause (`statementExtractor.ts`, `evidenceModel.ts`, `citationValidator.ts`, `competencyMatcher.ts`, `bulletAnalyzer.ts`):**
  - Previously, `"Currently learning Rust"` and `"Planning to introduce Spark"` triggered `isNegated: true`, causing `competencyMatcher` and `citationValidator` to classify non-assertive intent as `CONTRADICTED`.
  - Meanwhile, after introducing distinct `NegationSentiment` values `'LEARNING'` and `'ASPIRATIONAL'`, `analyzeStatement` checked `c.sentiment` instead of `c.negationSentiment` on `ClausePolarity`, temporarily allowing metrics inside `LEARNING`/`ASPIRATIONAL` clauses to remain `'SUPPORTED'`.
- **Resolution:**
  - Separated `LEARNING_REGEX` and `ASPIRATIONAL_INTENT_REGEX` in `statementExtractor.ts` with `isNegated: false`, emitting `negationSentiment: 'LEARNING' | 'ASPIRATIONAL'`.
  - Updated `citationValidator.ts` (`LEARNING` → `'RELATED_ONLY'`, `ASPIRATIONAL` → `'NOT_SUPPORTED'`) and `competencyMatcher.ts` (`NOT_DEMONSTRATED` rather than `CONTRADICTED` or `SATISFIED`).
  - Wired `negationSentiment === 'LEARNING' || negationSentiment === 'ASPIRATIONAL'` alongside `isNegated` in both `bulletAnalyzer.ts` and `statementExtractor.ts` (`analyzeStatement`) before `extractMetricsFromText()` and clause-level metric tagging so unexecuted/planned metrics get `claimSupport = 'NEGATED'` and zero Impact credit while positive executed clauses in mixed bullets remain `'SUPPORTED'`.

---

## 2. Exact Root Causes Fixed (Workstreams A, B & Coordinator)

### Workstream A — Seniority, Scope Separation & Tenure Precision
1. **Free Seniority Points on Explicit `0 YOE` / `NOT_SPECIFIED` JDs (`scorer.ts:82`, `seniorityMatcher.ts`):** `shouldRedistributeSeniority` previously checked `!isMandatoryGateActive || (isFresher && explicitRequiredYears === 0)`, granting experienced candidates (`candidateYears > 1`) `10` free `seniorityFit` points on explicit `0 YOE` JDs. `SeniorityMatchResult` now exposes `shouldRedistributeWeight` (`!isMandatoryGateActive || requiredMonths === 0`), wired directly in `scorer.ts`.
2. **Academic/Coursework False Positives (`seniorityMatcher.ts`):** Phrases such as `"2026-2027 graduating batch, 4+ years of undergraduate coursework and project experience"` previously parsed as `requiredYears: 4` (`SPECIFIC_COMPETENCY`). Added `ACADEMIC_NON_WORK_EXPERIENCE_REGEX` / `isAcademicExperiencePhrase()` so student/coursework/degree durations never activate an employer multi-year work-experience gate.
3. **Header-Style & Multi-Alternative JD Requirements (`seniorityMatcher.ts`):** Added `LABEL_BEFORE_NUMBER_PATTERN` (`"Experience Required: 5+ Years"`) and prevented disjunction lists (`"in Java, Go, or C++"`) from narrowing `scope` to only the first language (`java`), which had dropped senior backend candidates without explicit per-bullet durations to `demonstratedYears: 0` and `scoreFactor: 0.70`.
4. **Scope Isolation & Date-Splitting Bugs (`tenureCalculator.ts`):** Fixed `/[-–—to]+/i` splitting that corrupted month names (`October`, `September`, `August`); enforced strict isolation of `INTERNSHIP`, `APPRENTICESHIP`, `VOLUNTEER`, `ACADEMIC_PROJECT` / `COURSEWORK`, and personal/OSS projects from `professionalMonths` / `professionalBounds` while preserving `unionMonthIntervals` overlap protection and year-only conservative bounds.
5. **Split-Brain Seniority Consumers (`experienceEstimator.ts`, `index.ts`, `scorer.ts`, `simulateFix.ts`):** Unified `estimateCandidateExperience()` onto `calculateTenure()`; wired `authoritativeRequiredYears`, `authoritativeCandidateYears`, scoped `eligibility.demonstratedYears`, `ScoreTrace` `rawInputs`, and `SimulationFacts.seniorityMatchResult` across `index.ts`, `scorer.ts`, and `simulateFix.ts`.

### Workstream B — Metric Polarity, Locale Parsing, Exclusion Accuracy & Bullet Alignment
1. **Missing Verbs & Directional Polarity Inversions (`metricExtractor.ts`):** Expanded `DELTA_REGEX` and verb regexes (`raised`/`raising`, `lifted`, `elevated`, `grew`, `expanded`, `accelerated`, `halved`, `doubled`, `tripled`). Added `classifyDomainDirection()` with pluralized cost/gain nouns so decreasing gain nouns (`"reduced throughput by 20%"`, `"decreased test coverage from 85% to 60%"`) and increasing cost nouns (`"increased error rate by 15%"`, `"raised cloud spend by $10K"`) produce `polarity: 'NEGATIVE'` and zero Impact credit, without inverting valid improvements (`"cutting query response times by 68%"`, `"decreasing database read load by 55%"`, `"dead-letter queue, improving notification success from 91.2% to 99.4%"`).
2. **Standalone Error-Rate Over-Credit (`metricExtractor.ts`):** Raw error/defect/failure/packet-loss/downtime percentages (`"12% error rate"`, `"5% packet loss"`) no longer receive `'POSITIVE'` Quality credit, while coverage/uptime/cache-hit benchmarks (`"86% branch coverage"`, `"99.95% uptime"`) remain `'QUALITY'` + `'POSITIVE'`.
3. **Indian Numbering & `INR` / `₹` / `Rs` Currency Support (`metricExtractor.ts`):** Added South Asian comma grouping (`8,00,000`, `1,25,00,000`), `₹`/`INR`/`Rs.`/`Rs` currency detection, and bounded `lakh`/`crore` multipliers across baseline->result ranges, deltas, and scale metrics.
4. **Span Exclusions Blocking Quantitative Counts (`metricExtractor.ts`):** Updated `findExcludedSpans()` so counts like `"2000 users"`, `"2020 RPS"`, `"from 2000 to 2024 users"`, and `"Halved RPS from 2000 to 1000"` extract cleanly while calendar year ranges (`"2021 - 2023"`, `"Migrated 2020 to 2024 services."`), versions, HTTP codes, and `"100% remotely"` remain excluded.
5. **Bullet Analyzer & Scorer Sync (`bulletAnalyzer.ts`, `metricModel.ts`, `scorer.ts`):** Prevented leading numeric counts (`"2000 users..."`) from being stripped by numbered-list prefix regexes, gated `metricMatched` and `hasOutcome` cleanly against `validPositiveMetrics`, added provenance fields to `ImpactEvidenceTraceItem`, and forwarded `isNegated: b.isNegated` in `scorer.ts` `impactInputs`.

---

## 3. Files Changed

- **Workstream A (`seniority-worker`):**
  - Modified: `src/features/ats/engine/seniorityMatcher.ts`, `src/features/ats/engine/tenureCalculator.ts`, `src/features/ats/engine/experienceEstimator.ts`
  - Created: `tests/ats/phase10_4SeniorityAndTenure.test.ts` (12 tests)
- **Workstream B (`metrics-worker`):**
  - Modified: `src/features/ats/engine/metricExtractor.ts`, `src/features/ats/engine/metricModel.ts`, `src/features/ats/engine/bulletAnalyzer.ts`
  - Created: `tests/ats/phase10_4MetricIntelligence.test.ts` (15 tests)
- **Coordinator (Preflight, Runtime Integration & Report):**
  - Modified: `src/features/ats/engine/evidenceModel.ts`, `src/features/ats/engine/citationValidator.ts`, `src/features/ats/engine/competencyMatcher.ts`, `src/features/ats/engine/statementExtractor.ts`, `src/features/ats/engine/scorer.ts`, `src/features/ats/engine/index.ts`, `src/features/suite/engine/simulateFix.ts`, `tests/ats/phase10_3CitationAndNegativeEvidence.test.ts`
  - Created: `tests/ats/phase10_4RuntimeIntegration.test.ts` (6 tests), `docs/ats-engine/PHASE_10_4_SENIORITY_AND_METRIC_RUNTIME_INTEGRITY_REPORT.md`

---

## 4. Legacy `analyzeCanonical` Consumers (Documented for Phase 10.5 Parity)

Verified call sites in `src/`:
- `src/features/ats/engine/index.ts:378`: `runAtsEngine` still attaches `canonicalResult: analyzeCanonical(resumeText, jdText, ...)` from `src/lib/ats/canonicalAnalysis.ts:341`.
- `src/pages/tools/ResumeChecker.tsx:528, 730, 906, 941, 944, 960, 963, 980`: UI reads `canonicalResult.quickRoast` (`oneLineVerdict`, `strengths`, `gaps`, `prioritizedActions`) from `index.ts`.
- `src/features/ats/__tests__/canonicalConsistency.test.ts`: Tests `analyzeCanonical()` directly alongside `runAtsEngine().canonicalResult`.
- Legacy adapter `analyzeCanonicalToEngineResult()` remains inside `src/lib/ats/canonicalAnalysis.ts:980, 1084-1086`. Consolidating `quickRoast` onto the primary ATS engine remains scoped for Phase 10.5 without breaking UI contracts prematurely.

---

## 5. Deferred `C7` Accounting Status

- `tests/property_invariants.test.ts` and `scorer.ts` penalty accounting were **NOT** modified.
- Observed by `p4-verifier` after final edits: `tests/property_invariants.test.ts` passed **12/13** invariants (`C1`, `C2`, `C3`–`C6`, `C8`–`C14` all pass — `C3` fixed by Phase 10.4). Only the pre-existing deferred **`C7`** test (`:189`, asserting raw subscore factor sum === `finalScore` without accounting for applied penalty deductions) failed on 11/14 test corpus pairs. Meanwhile, canonical 7-dimension `ScoreTrace` arithmetic (`rawSubtotal + totalBonuses - totalDeductions === preClampScore` and clamped `composite`) holds 100% across `phase08_3ConsistencyAudit.test.ts`, `phase08_4IntegritySuite.test.ts`, and `phase10_4RuntimeIntegration.test.ts`.

---

## 6. Verification Results (Post-Final-Edit Runs)

| Check / Suite | Command | Observed Result |
|---|---|---|
| Validation Report Cleanliness | `git status --short -- docs/validation-report.md` | Exit `0` (clean against `HEAD`) |
| TypeScript Check | `npx tsc --noEmit` | Exit `0` (clean compile) |
| Ontology Audit | `npm run ontology:audit` | Exit `0` (33 nodes, 303 skills, 332 relationships, **0 structural errors**) |
| Full ATS Phase Suite (`tests/ats/`) | `npx vitest run tests/ats/` | **19/19 files, 281/281 tests PASSED** (`Benchmark A = 90`, `Benchmark B = 88`, Phase 09 N=30 `Precision=1.0000, Recall=1.0000, F1=1.0000`, `phase10_4SeniorityAndTenure` 12/12, `phase10_4MetricIntelligence` 15/15, `phase10_4RuntimeIntegration` 6/6) |
| Golden & Regression Suites (`p4-verifier`) | `npx vitest run ... golden-resumes extendedGoldenResumes canonicalConsistency bulletQuality fresherAuditor stageD_seniority_modes` | `golden-resumes`: 1/1 (`P=98.10%, R=94.50%`), `extendedGoldenResumes`: 1/1 (`P=100.00%, R=93.75%`), `canonicalConsistency`: 24/24, `bulletQuality`: 6/6, `fresherAuditor`: 5/5, `stageD_seniority_modes`: 16/16 (`engine.test.ts` 7/8 & `bugs_stage0.test.ts` 12/13 fail only on pre-existing Phase 10.2/10.3 `mustHavesMet`/OR-group test expectations) |
| Property Invariants (`p4-verifier`) | `npx vitest run tests/property_invariants.test.ts` | 12/13 PASSED (`C3` & all non-C7 invariants PASS; only pre-existing deferred `C7` fails) |
| Production Build (`p4-verifier`) | `npm run build` | Exit `0` (Vite v8.3.0, 3628 modules transformed) |
| Independent Adversarial Verifier | `@p4-verifier` (#57) | **APPROVED** |
