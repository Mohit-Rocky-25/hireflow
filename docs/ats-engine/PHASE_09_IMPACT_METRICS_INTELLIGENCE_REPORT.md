# HIREFLOW ATS RESUME ROASTER — PHASE 09
## Impact Metrics Intelligence & Outcome Evidence Evaluation — Technical Report

**Date:** 2026-11-25  
**Base Commit SHA (`HEAD`):** `5412214ee8fc0f7580fd5830776dba40fddc39ef`  
**Repository State:** Uncommitted working-tree implementation across Phases 02–09 (not committed; no remote push).  
**Boundary Confirmation:** Phase 09 implementation and acceptance verification are complete; no subsequent phase has been started.

---

## A. Architecture Inspection & Component Changes

### 1. Pre-Existing Metric Extraction & Active Scoring Path
Repository inspection across the runtime execution chain (`runAtsEngine()` -> `splitResumeSections()` -> `parseExperienceSection()` / `parseProjectSection()` -> `extractStructuredCandidateProfile()` -> `matchRequiredSkills()` -> `evaluateSeniorityFit()` -> `computeAtsScore()` -> `createAuthoritativeReportSnapshot()` -> `buildDossierModel()` -> `generatePdfDossier()` / `generateDocxDossier()`) revealed three separate legacy regex checks:
1. **`src/features/ats/engine/bulletAnalyzer.ts` (`METRIC_REGEX`):** Active path used by `experienceParser.ts` and `projectParser.ts` to populate `BulletAnalysis.hasMetric`. Because `computeAtsScore()` computed `impactMetrics` from `allBullets.filter(b => b.hasMetric).length / allBullets.length`, natural-language units like `records daily`, `minutes`, `incidents`, `production DAGs`, and `tables` were completely missed (`impactMetrics = 0` on Benchmark B V2).
2. **`src/features/ats/engine/statementExtractor.ts` (`METRIC_REGEX`):** Captured only the first raw substring (`trimmed.match(METRIC_REGEX)[0]`) with no unit normalization, no baseline/result separation, no derived delta/percentage math, no attribution analysis, and no contribution to the Impact score.
3. **`src/features/ats/engine/skillMatcher.ts` (`METRIC_REGEX`):** A third private copy used only for `hasMetricEvidence` proficiency boosting (`proficiency = 4–5`).

### 2. Reused vs. Newly Implemented Components
- **New:**
  - `src/features/ats/engine/metricModel.ts`: Typed `MetricEvidence`, `MetricCategory`, `MetricChangeType`, `MetricPolarity`, `MetricAttributionStatus`, `MetricTimeframe`, `ImpactEvidenceTraceItem`, and `ImpactEvaluationResult`.
  - `src/features/ats/engine/metricExtractor.ts`: Bounded linear-time deterministic parser (`extractMetricsFromText`), attribution classifier (`assessMetricAttribution`), deduplication fingerprinting, derived math validation (`calculatedDelta`, `calculatedRelativeChange`, `calculatedPercentagePointDelta`), and single-dimension Impact evaluator (`evaluateResumeImpact`).
  - `tests/ats/phase09MetricIntelligence.test.ts`: 17 deterministic tests spanning preflight seniority reconciliation, positive patterns, 18+ negative/adversarial safeguards, snapshot migration, PDF/DOCX provenance verification, and a 30-item labelled evaluation benchmark.
- **Reused & Integrated:**
  - Removed all three separate legacy `METRIC_REGEX` definitions from `bulletAnalyzer.ts`, `statementExtractor.ts`, and `skillMatcher.ts`, routing every parser/matcher/scorer path through `extractMetricsFromText` and `evaluateResumeImpact`.
  - Preserved the canonical 7-dimensional ATS scoring formula (`specVersion: '4.0.0-ats7d'`, `engineVersion: '4.0.0'`, Impact weight `15`), `AuthoritativeReportSnapshot` (`schemaVersion: '1.0.0'` with backward-compatible upgrade in `migrateSnapshot`), `buildDossierModel`, `exportPdf.ts` (`Layer 5B`), and `exportDocx.ts` (`LAYER 5B`).
- **Files Modified / Added in Phase 09:**
  - Added: `src/features/ats/engine/metricModel.ts`, `src/features/ats/engine/metricExtractor.ts`, `tests/ats/phase09MetricIntelligence.test.ts`, `docs/ats-engine/PHASE_09_IMPACT_METRICS_INTELLIGENCE_REPORT.md`
  - Updated: `src/features/ats/engine/seniorityMatcher.ts`, `src/features/ats/engine/types.ts`, `src/features/ats/engine/evidenceModel.ts`, `src/features/ats/engine/bulletAnalyzer.ts`, `src/features/ats/engine/statementExtractor.ts`, `src/features/ats/engine/evidenceExtractor.ts`, `src/features/ats/engine/experienceParser.ts`, `src/features/ats/engine/projectParser.ts`, `src/features/ats/engine/skillMatcher.ts`, `src/features/ats/engine/scorer.ts`, `src/features/ats/engine/index.ts`, `src/features/ats/engine/authoritativeSnapshot.ts`, `src/features/dossier/dossierModel.ts`, `src/features/dossier/exportPdf.ts`, `src/features/dossier/exportDocx.ts`, `tests/ats/phase08_1SnapshotFidelity.test.ts`, `tests/ats/phase08_2ExportAudit.test.ts`, `tests/ats/phase08_3ConsistencyAudit.test.ts`, `tests/ats/phase08_4IntegritySuite.test.ts`, `docs/ats-engine/ENGINE_ARCHITECTURE_AUDIT.md`.

---

## B. Preflight Seniority Reconciliation (Phase 08.4 Boundary Cases)

Both frozen V2 cases (`today: 2024-11-24`, `EXPLICIT_EMPLOYER` `PROFESSIONAL` requirement of `36` months) were audited and reconciled in `src/features/ats/engine/seniorityMatcher.ts` against Phase 07.3's completed-month policy:

| Field | Case A — Rohan V2 (`PayTech Solutions`, `2021 - Present`) | Case B — Ananya V2 (`DataFlow Analytics`, `2022 - Present`) |
|---|---|---|
| Previous Phase 08.4 Output | `MEETS_REQUIREMENT`, `isEligible: true`, `scoreFactor: 1.00` (`10/10`), `shortfallMonths: 0` | `BELOW_REQUIREMENT`, `isEligible: false`, `scoreFactor: 0.97` (`9.7/10`), `shortfallMonths: 1` (optimistic Jan 2022 start) |
| Professional Touched Bounds | `36–47` months | `24–35` months (`CloudScale Labs 2021-2022` `24m` `INTERNSHIP` excluded) |
| Professional Completed Bounds | `35–46` months | `23–34` months (midpoint `28.5m`) |
| Reconciled Status & Eligibility | **`AMBIGUOUS`**, **`isEligible: false`** | **`BELOW_REQUIREMENT`**, **`isEligible: false`** |
| Shortfall Representation | `shortfallMonths: 0` (`minCompletedShortfallMonths: 0`, `maxCompletedShortfallMonths: 1`, `formattedShortfall: '0-1 month (uncertain start)'`) | `shortfallMonths: 8` (`touchedShortfallMonths: 1`, `completedShortfallMonths: 2` upper bound, `maxCompletedShortfallMonths: 13`, `expectedCompletedShortfallMonths: 7.5`) |
| Reconciled Score Factor & Score | **`0.95`** (`9.5 / 10` pts) | **`0.79`** (`7.9 / 10` pts) |
| Policy Explanation | Year-only `2021 - Present` lower bound (`Dec 2021`) completes only `35` months prior to active `Nov 2024`, crossing the `36m` completed threshold (`[35m, 46m]`). Unconditional `MEETS_REQUIREMENT` cannot be claimed; active-month boundary factor `0.95` preserves strict monotonicity above Case B (`0.79`) without altering weights. | Even the optimistic `Jan 2022` touched (`35m`) and completed (`34m`) upper bounds remain below `36m`. Using `1 - 1/36 = 0.97` from `Jan 2022` overstated evidence given `11` months of uncertainty (`23–34m` completed). Midpoint completed tenure (`28.5m / 36m = 0.79`) aligns factor, shortfall, bounds, and explanation. |

---

## C. Metric Extraction Results (Frozen Fixtures & Regression Patterns)

### Frozen V2 Benchmark Extractions

**Benchmark A V2 (`BENCHMARK_A_V2_PAYTECH_RESUME`, evaluated against `BENCHMARK_A_JD`):**
- `"45ms p99 latency"` (`LATENCY`, `DIRECT_OWNERSHIP`, `PRODUCTION`, no fabricated %, credited `0.55`)
- `"15,000+ RPS"` (`LATENCY` + `SCALE`, `DIRECT_OWNERSHIP`, `PRODUCTION`, `per_second`, credited `0.55`)
- `"cutting query response times by 68%"` (`OUTCOME`, delta-only `68%`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `0.80`)
- `"decreasing database read load by 55%"` (`OUTCOME`, delta-only `55%`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `0.80`)
- `"86% branch coverage"` (`QUALITY`, standalone quality indicator, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `0.65`)
- `"140+ Pytest unit and integration test suite"` (`QUALITY`, `140` `tests`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `0.65`)

**Benchmark B V2 (`BENCHMARK_B_V2_DATAFLOW_RESUME`, evaluated against `BENCHMARK_B_JD`):**
- `"35+ production Airflow DAGs"` (`SCALE` + `SCOPE`, `35` `dags`, `DIRECT_OWNERSHIP`, `PRODUCTION`, no fabricated %, credited `0.55`)
- `"over 18 million records daily"` (`SCALE`, `18,000,000` `records`, `per_day`, `DIRECT_OWNERSHIP`, `PRODUCTION`, no fabricated %, credited `0.55`)
- `"from 94 minutes to 31 minutes"` (`OUTCOME` + `PRODUCTIVITY`, `Derived: -63 minutes (67.02% reduction)`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `1.00`)
- `"from 14 to 5 per month"` (`OUTCOME` + `RELIABILITY`, `Derived: -9 incidents (64.29% reduction)`, `per_month`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `1.00`)
- `"50+ data warehouse tables"` (`SCOPE`, `50` `tables`, `DIRECT_OWNERSHIP`, `PRODUCTION`, credited `0.55`)

### Safeguard & Attribution Verification
Verified in `tests/ats/phase09MetricIntelligence.test.ts`:
- **Rejected false positives (`0` extractions):** Dates (`June 2021 to May 2023`, `2021 - Present`), experience years (`4+ years of backend software engineering experience`), versions/codes/hashes (`Python 3.11`, `React 18`, `PostgreSQL 15`, `v2.4.0`, `AWS S3`, `EC2`, `HMAC-SHA256`, `HTTP 404`, `TLS 1.3`, `OAuth 2.0`), remote work (`100% remotely`), unitless numbers (`Achieved 45 and improved to 100`), bare arrows (`Batch jobs 10 → 20`, `from 10 → 20` without units).
- **Preserved safeguards:** Incompatible units (`from 12 seconds to 300 requests` -> `isDerivedMathValid: false`, `polarity: 'AMBIGUOUS'`), zero baseline (`from 0 to 50 alerts` -> `calculatedRelativeChange: undefined`), worsening outcomes (`latency to increase from 120ms to 340ms` & `incidents rose from 4 to 11 per month` -> `polarity: 'NEGATIVE'`, `0` Impact credit), percentage-point change (`72% to 86%` -> `+14 pp`, `+19.44% relative`), attribution separation (`TEAM_QUALIFIED`, `CONTRIBUTED`, `SCOPE_SUPPORT`, `EXPOSURE_ONLY`), prototype vs. production maturity (`PROTOTYPE: 0.50` vs `PRODUCTION: 1.00`), cross-bullet deduplication (`94 minutes to 31 minutes` & `94 min to 31 min`), negated claim exclusion, and non-quantitative qualitative role baseline (`QUALITATIVE_OUTCOME_ROLE_BASELINE`).

---

## D. Scoring Integrity & Seven-Dimensional Trace Reconciliation

Weights remain completely unchanged (`30 / 20 / 15 / 10 / 10 / 10 / 5`). Single canonical `ScoreTrace` reconciliation (`RawSubtotal + Bonuses - Deductions = PreClampScore -> FinalScore`):

| Benchmark Fixture (V2 at `2024-11-24`) | Must-Have (30) | Evidence (20) | Impact (15) | Projects (10) | Seniority (10) | Format (10) | Tier (5) | Raw Subtotal | Deductions | Pre-Clamp | **Final** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Benchmark A V2 (Phase 08.4 Before)** | `30` | `20` | `12.5` | `7` | `10.0` | `10` | `3.5` | `93.0` | `-7` | `86.0` | **`86`** |
| **Benchmark A V2 (Phase 09 After)** | `30` | `20` | **`15.0`** | `7` | **`9.5`** | `10` | **`5.0`** | **`96.5`** | `-7` | `89.5` | **`90`** |
| **Benchmark B V2 (Phase 08.4 Before)** | `30` | `20` | `0.0` | `7` | `9.7` | `10` | `3.5` | `80.2` | `-7` | `73.2` | **`73`** |
| **Benchmark B V2 (Phase 09 After)** | `30` | `20` | **`15.0`** | `7` | **`7.9`** | `10` | **`5.0`** | **`94.9`** | `-7` | `87.9` | **`88`** |

- **Benchmark A V2 Explanation:** Impact rose (`12.5 -> 15.0`) once `Integrated Redis...` attribution and full backend metrics (`15,000+ RPS`, `45ms p99 latency`, `-68%`, `-55%`, `86% branch coverage`, `140+ Pytest suite`) were properly evaluated; `tierFit` (`3.5 -> 5.0`) unlocked because `metricScoreFactor >= 0.7`; `seniorityFit` dropped (`10.0 -> 9.5`, `AMBIGUOUS`) per completed-month threshold preflight reconciliation.
- **Benchmark B V2 Explanation:** Impact moved (`0.0 -> 15.0`) because Data Engineer production metrics (`35+ DAGs`, `18M records daily`, `94 -> 31 minutes`, `14 -> 5 incidents/month`, `50+ tables`) were previously invisible to legacy `METRIC_REGEX`; `tierFit` (`3.5 -> 5.0`) unlocked accordingly; `seniorityFit` adjusted downward (`9.7 -> 7.9`) to reflect `[23m, 34m]` midpoint completed tenure (`28.5m`) rather than the optimistic `Jan 2022` start.
- **Penalty Ledger (Unchanged, Single-Owner):** `missing_education` (`-3`), `word_count_outlier` (`-4`), total `-7` on both V2 fixtures.

---

## E. Test, Evaluation & Build Evidence (`task-4151`)

All builds, unit/integration suites, evaluation benchmarks, and Playwright browser tests ran cleanly after the final code edit:

1. **Production Build (`npm run build`):** `tsc && vite build` passed (`✓ 3628 modules transformed`, `✓ built in 6.20s`, 0 errors).
2. **Vitest Suites (`npx vitest run tests/ats/ src/features/ats/__tests__/`):**
   - **Total:** `Test Files  19 passed (19)`, `Tests  258 passed (258)`, `Duration  31.14s`
   - Includes `tests/ats/phase09MetricIntelligence.test.ts` (**17/17 passed**), `phase08_1SnapshotFidelity.test.ts` (16), `phase08_2ExportAudit.test.ts` (17), `phase08_3ConsistencyAudit.test.ts` (9), `phase08_4IntegritySuite.test.ts` (15), `phase08Export.test.ts` (9), `phase07Seniority.test.ts` (39), `phase06Matching.test.ts` (17), `phase05Citations.test.ts` (19), `phase04Evidence.test.ts` (9), `phase03Ontology.test.ts` (11), `p0Integrity.test.ts` (13), plus `src/features/ats/__tests__/` (`engine.test.ts` 8, `golden-resumes.test.ts` 1 [32 pairs: Precision `98.18%`, Recall `99.08%`], `extendedGoldenResumes.test.ts` 1 [20 pairs: Precision `100.00%`, Recall `93.75%`], `canonicalConsistency.test.ts` 24, `fileParser.test.ts` 16, `knowledge.test.ts` 9, `learningPath.test.ts` 8).
3. **Labelled Metric Intelligence Evaluation Set (`N = 30` in `phase09MetricIntelligence.test.ts`):**
   - Dataset composition: 20 positive ground-truth bullets across `baseline_result` (8), `delta_only` (4), `scale_throughput` (4), `latency` (2), `quality` (2) + 10 adversarial negative/non-metric traps. (Note: `N = 30` is a targeted benchmark set verifying pattern/safeguard accuracy, not a large-scale statistical sample of unconstrained real-world CVs.)
   - **Observed Metrics:** `TP = 20`, `FP = 0`, `FN = 0`, **`Precision = 1.0000`**, **`Recall = 1.0000`**, **`F1 = 1.0000`**.
4. **Playwright E2E Export Readiness (`npx playwright test e2e/e12-export-readiness.spec.ts`):** `3 passed (33.9s)`.

---

## F. Repository State & Known Limitations

- **Base Commit SHA:** `5412214ee8fc0f7580fd5830776dba40fddc39ef`
- **Commit Status:** Working-tree modifications and new files remain uncommitted as requested.
- **Known Limitations / Deferred Work:**
  1. **Company-Name Collision in `sectionSplitter.ts` (Existing Parser Behavior):** Company names ending in a section keyword (e.g. `"Software Engineering Intern | DevScale Technologies"` in `01-strong-fresher-resume.txt`) match `cleanedHeading.endsWith(' technologies')` and split experience bullets under a second `skills` block. Left out of scope for Phase 09 per section-parser freeze rules.
  2. **Natural-Language Baseline Paraphrase Formats Without Connectors:** Forms requiring full syntactic dependency parsing across multi-sentence paragraphs (e.g., baseline stated in sentence 1, result stated two sentences later) are outside bounded single-bullet deterministic extraction.
  3. **Currency Exchange Normalization:** Currency amounts (`USD`, `INR`, `LPA`) are normalized by symbol/unit family rather than converted via live FX rates (prohibited under deterministic offline constraints).
