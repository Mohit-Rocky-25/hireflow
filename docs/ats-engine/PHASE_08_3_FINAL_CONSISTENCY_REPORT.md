# HIREFLOW ATS RESUME ROASTER — PHASE 08.3 FINAL CONSISTENCY REPORT
## FINAL SCORE RECONCILIATION, SENIORITY CONSISTENCY AND EXPORT PROVENANCE AUDIT

**Date:** November 25, 2026  
**Status:** COMPLETED & AUDITED  
**Phase Scope:** Phase 08.3 Final Consistency & Provenance Audit  
**Base Commit SHA:** `5412214ee8fc0f7580fd5830776dba40fddc39ef` (`main`, with uncommitted working-tree changes across Phases 02–08.3)  
**Boundary:** Strictly closed after Phase 08.3; Phase 09 has **NOT** started.

---

## 1. Benchmark Version and Historical Score Reconciliation (Gate 1)

### 1.1 Score Comparison Table

| Benchmark | Previous Phase 08 / 08.1 Report | Actual Engine & Phase 08.2 / 08.3 | Frozen Fixture ID & SHA-256 (LF) |
|---|---:|---:|---|
| **PayGrid / Rohan Deshmukh** | 89 | **84** | `BENCHMARK_A_V2_PAYTECH_RESUME` (`9d801797f225a2949f91f24aca6f3be38ee65be20c5c8661d9535bf842340096`) + `BENCHMARK_A_JD` (`9292afd6c56a78fb7e63094bc1bc1bc2825aca16d30b2f79fbcab45121000261`) |
| **Northstar / Ananya Rao** | 82 | **69** | `BENCHMARK_B_V2_DATAFLOW_RESUME` (`f3dfe3ba7af6ffc9f96f9b63271da37f6a6f33369d0e16d16d3a288310f13350`) + `BENCHMARK_B_JD` (`262a5236ccd2ace6286fe9d65501198585981651a7512e301bdd2e8adaea3850`) |

### 1.2 Root Cause of the Historical Discrepancy (89 $\to$ 84, 82 $\to$ 69)

The two sets of scores **did NOT evaluate identical inputs and scoring configurations**:

1. **Pre-Phase 07 Prose Carry-Over vs. Frozen V2 Fixtures:**
   - In Phase 04 (`docs/ats-engine/PHASE_04_RESUME_EVIDENCE_REPORT.md`, Section 9.2, line 259), Ananya scored `82/100` on the longer inline `tests/ats/phase04Evidence.test.ts` draft fixtures (which had >250 words, two projects for Rohan — *RateShield* and *LedgerLite* — giving `projectsAndOss = 10` instead of `7`, NO explicit `3+ years` JD threshold in `BENCHMARK_A_JD` / `BENCHMARK_B_JD`, and pre-Phase 07 seniority rules).
   - When Phase 07.1 froze the canonical V2 fixtures in `src/features/ats/fixtures/benchmarkFixtures.ts` (derived from `p0Integrity.test.ts` with 197 words / 1 project for Rohan, 178 words for Ananya, and explicit `Required: 3+ years` gates in both JDs), the engine score deterministically became **84** (PayGrid / Rohan) and **69** (Northstar / Ananya).
   - The automated Phase 08 and 08.1 test suites (`tests/ats/phase08Export.test.ts` and `tests/ats/phase08_1SnapshotFidelity.test.ts`) asserted `expect(snapshot.scoring.score).toBe(response.result.score)` dynamically rather than `89` or `82`, so tests passed while the Phase 08 / 08.1 markdown reports (`PHASE_08_EXPORT_RELIABILITY_REPORT.md` L155–169, `PHASE_08_1_SNAPSHOT_FIDELITY_VERIFICATION_REPORT.md` L142–148) mistakenly carried forward the legacy `89 / 82` figures in prose tables.
2. **Engine & Spec Metadata (Identical Inputs $\implies$ Identical Scores):**
   - **Engine Version:** `4.0.0`
   - **Canonical Spec:** `CANONICAL_SCORING_SPEC` v`2.4.0` (`specFingerprint: 1fa1bc0ae3f440918db713337c217a517b9691ab26066ea2d118066021e8e669`)
   - **Authoritative Scorer Weights (`src/features/ats/knowledge/scoring-config.json`):** `mustHaveCoverage: 30`, `evidenceDepth: 20`, `impactMetrics: 15`, `projectsAndOss: 10`, `seniorityFit: 10`, `formatAndParse: 10`, `tierFit: 5` (total `100`).
   - Re-running identical V2 frozen inputs under the same `asOfDate` (`2024-11-24`) produces **84** and **69** with 100% determinism across repeated executions.

---

## 2. Complete Mathematical ScoreTrace Reconciliation (Gate 2)

In `src/features/ats/engine/scorer.ts`, the final score is strictly:
$$\text{FinalScore} = \text{Clamp}\left(\text{Round}\left(\text{RawSubtotal} + \sum \text{Bonuses} - \sum |\text{Penalties}|\right), 0, 100\right)$$

### 2.1 Benchmark A (PayGrid Systems / Rohan Deshmukh)
- **Word Count:** 197 words (< 250 min for experienced). **Sections:** `summary`, `experience`, `projects`, `skills` (missing `education`).
- **Raw Dimension Contributions:**
  1. Must-Have Skill Coverage (`30%`): **`30.0`**
  2. Evidence & Implementation Depth (`20%`): **`20.0`**
  3. Impact & Quantified Numerical Metrics (`15%`): **`12.5`**
  4. Project Relevance & Open-Source Signals (`10%`): **`7.0`** (1 project parsed: *High-Throughput Idempotent Ledger*)
  5. Seniority Alignment & Experience Fit (`10%`): **`10.0`** (`scoreFactor: 1.0`)
  6. Format, Layout & Parsing Safety (`10%`): **`8.0`** (1 missing standard section `-0.2`)
  7. Target Company Tier Alignment (`5%`): **`3.5`** (`tierScoreFactor: 0.7`)
- **Total Raw Subtotal:** `30 + 20 + 12.5 + 7 + 10 + 8 + 3.5 = 91.0`
- **Bonuses:** `0.0` (none)
- **Individual Deductions:**
  - `missing_education`: **`-3.0`** (*"Missing Dedicated EDUCATION Section: ATS parser expects a dedicated header for education."*)
  - `word_count_outlier`: **`-4.0`** (*"Resume Abnormally Brief: Resume has 197 words (ideal technical resumes range between 250 and 1,200 words)."*)
- **Total Deductions:** **`7.0`**
- **Pre-Clamp Score:** `91.0 + 0.0 - 7.0 = 84.0`
- **Clamping:** Not triggered (`wasClamped: false`, `0 <= 84 <= 100`)
- **Final Authoritative Score:** **`84 / 100`** (`Strong`, Band: `Strong` / `Stable`)

### 2.2 Benchmark B (Northstar Credit / Ananya Rao)
- **Word Count:** 178 words (< 250 min for experienced). **Sections:** `summary`, `experience`, `projects`, `skills` (missing `education`).
- **Raw Dimension Contributions:**
  1. Must-Have Skill Coverage (`30%`): **`30.0`**
  2. Evidence & Implementation Depth (`20%`): **`20.0`**
  3. Impact & Quantified Numerical Metrics (`15%`): **`0.0`** *(see Section 9: `bulletAnalyzer.ts` `METRIC_REGEX` limitation on `"18 million records"`, `"94 minutes to 31 minutes"`, `"14 to 5 per month"`)*
  4. Project Relevance & Open-Source Signals (`10%`): **`7.0`** (1 project parsed: *Real-Time Event Stream Consumer*)
  5. Seniority Alignment & Experience Fit (`10%`): **`7.0`** (`scoreFactor: 0.70` under `AMBIGUOUS` year-only evaluation)
  6. Format, Layout & Parsing Safety (`10%`): **`8.0`** (1 missing standard section `-0.2`)
  7. Target Company Tier Alignment (`5%`): **`3.5`** (`tierScoreFactor: 0.7`)
- **Total Raw Subtotal:** `30 + 20 + 0 + 7 + 7 + 8 + 3.5 = 75.5`
- **Bonuses:** `0.0` (none)
- **Individual Deductions:**
  - `missing_education`: **`-3.0`** (*"Missing Dedicated EDUCATION Section"*)
  - `word_count_outlier`: **`-4.0`** (*"Resume Abnormally Brief: Resume has 178 words"*)
- **Total Deductions:** **`7.0`**
- **Pre-Clamp Score:** `75.5 + 0.0 - 7.0 = 68.5`
- **Clamping & Rounding:** `Math.round(68.5) = 69`, `0 <= 69 <= 100` (`wasClamped: false` relative to rounded integer, fractional `.5` rounded up by `Math.round`)
- **Final Authoritative Score:** **`69 / 100`** (`Competitive` in PDF/dossier verdict band)

### 2.3 Architectural Note on `result.trace` (`CANONICAL_SCORING_SPEC`) vs `scorer.ts`
`src/features/ats/engine/index.ts` runs both `computeAtsScore()` (`scoring-config.json`, 7 dimensions) and `runScoringEngine()` (`CANONICAL_SCORING_SPEC` v2.4.0, 5 pillars returning `67.05` for A and `58.65` for B), then synchronizes `trace.composite = scoring.score` and `trace.compositeDisplay = scoring.score` (`84` / `69`). To eliminate reconciliation ambiguity without modifying Phase 07 weights, `AuthoritativeReportSnapshot.scoring` now records `rawScore` (`91` / `75.5`), `rawSubtotal`, `totalBonuses`, `totalDeductions`, `preClampScore`, and `wasClamped`, and `exportPdf.ts` + `exportDocx.ts` print the exact reconciliation line directly under Layer 1 / Penalties.

---

## 3. Northstar Seniority and Eligibility Reconciliation (Gate 3)

Evaluated using `BENCHMARK_B_V2_DATAFLOW_RESUME` + `BENCHMARK_B_JD` at `asOfDate = 2024-11-24`:

- **JD Requirement & Provenance:** `- Required: 3+ years of professional data engineering experience` $\implies$ `requiredYears: 3`, `requiredMonths: 36`, `scope: 'PROFESSIONAL'`, `provenance: 'EXPLICIT_EMPLOYER'`, `isMandatoryGateActive: true`.
- **Parsed Employment Intervals:**
  1. `DataFlow Analytics` (`Data Engineer`, `FULL_TIME`, `PROFESSIONAL`): `2022 - Present` (year-only start, active role).
     - **Touched months (incl. active Nov 2024):** Jan 2022 (`2022*12+0`) through Nov 2024 (`2024*12+10`) = **`35` months** (`2.9` yrs rounded).
     - **Completed months (excl. active Nov 2024):** Jan 2022 through Oct 2024 = **`34` months** (`2.8` yrs rounded).
     - **Professional uncertainty bounds:** Min (Dec 2022 – Nov 2024) = **`24` months** (`23` completed); Max (Jan 2022 – Nov 2024) = **`35` months** (`34` completed).
  2. `CloudScale Labs` (`Data Engineering Intern`, `INTERNSHIP`, `NON_PROFESSIONAL`): `2021 - 2022` (year-only).
     - Nominal: `24` months (`2021-01` – `2022-12`). Uncertainty bounds: `2m` – `24m`. **Excluded from `PROFESSIONAL` eligibility.**
- **Integer-Month Outcome & Gate Explanation:**
  - `demonstratedMonths`: **`35`** (short of `36` by **`1` touched month**).
  - `completedMonths`: **`34`** (short of `36` by **`2` completed months**).
  - `shortfallMonths`: **`1`** (engine formula `36 - 35 = 1`, formatted `'1 month'`).
  - `minPossibleWorkMonths` / `maxPossibleWorkMonths`: **`26m` – `59m`**.
  - **Why `AMBIGUOUS` and `GATE SHORTFALL`:** In `seniorityMatcher.ts` (L320–325), `scope === 'PROFESSIONAL'` checks whether `reqMonths` (`36`) falls in `(minPossibleWorkMonths, maxPossibleWorkMonths]` (`26m–59m`). Because that interval spans `36m`, `status` is `AMBIGUOUS` (`scoreFactor: 0.70`), and `isEligible` is **`false`** (`GATE SHORTFALL`) because ambiguous year-only dates cannot verify the mandatory `EXPLICIT_EMPLOYER` `36`-month threshold.
  - **Audit Limitation Noted:** Under strict `PROFESSIONAL`-only bounds (`24m–35m` touched, `23m–34m` completed), even the best-case upper bound (`35m`) is strictly below `36m`. Preserving Phase 07 matching logic unmodified per Phase 08.3 mandate, this scope-bound nuance is documented in Section 9.
- **Cross-Surface Parity Fix:** Fixed `exportPdf.ts` (which previously truncated `fitText` to `wrappedFit[0]`) and `dossierModel.ts` (which previously bypassed `authoritativeSnapshot.seniority` for `atsResult`) so Dashboard, History, Reopened History, PDF, and DOCX all display the identical integer month details (`35m touched, 34m completed vs 36m required, shortfall: 1m`), `AMBIGUOUS`, `GATE SHORTFALL`, `[Provenance: EXPLICIT_EMPLOYER]`, and the complete untruncated explanation.

---

## 4. Snapshot ID Implementation Audit (Gate 4)

Inspected `generateSnapshotId()` in `src/features/ats/engine/authoritativeSnapshot.ts`:
- **Defects Found in Phase 08.2:**
  1. JSDoc claimed 128 bits of entropy from `crypto.getRandomValues()` while actually allocating `new Uint8Array(8)` (**64 random bits**).
  2. `crypto.randomUUID()` output was truncated with `.slice(0, 16)`, discarding half the UUIDv4 bits (~60–64 bits instead of **122 random bits**).
- **Phase 08.3 Corrections Applied:**
  - **Primary (`crypto.getRandomValues`):** Allocates `new Uint8Array(16)` (**16 random bytes = 128 random bits**, 32 lowercase hex characters).
  - **Secondary (`crypto.randomUUID`):** Preserves full RFC 4122 UUIDv4 (`crypto.randomUUID().replace(/-/g, '')`, **122 random bits** + 6 fixed version/variant bits, 32 hex chars).
  - **Fallback (no Web Crypto API):** Explicitly tagged `snap_<ts>_prng_<perf>_<rand>` and documented in JSDoc and code comments as **pseudorandom, NOT cryptographically secure**, providing no cryptographic uniqueness guarantee.
  - Note: Zero collisions across 1,000 test calls verifies absence of immediate generator flaws in a small sample, not a proof of cryptographic uniqueness.

---

## 5. Granular Citation Validation Preservation (Gate 5)

Audited `CitationValidationStatus` (`src/features/ats/engine/citationModel.ts`) and `AuthoritativeCitation` (`src/features/ats/engine/authoritativeSnapshot.ts`):
- Kept **4 strictly orthogonal axes** separated across Snapshot, `migrateSnapshot`, `dossierModel`, PDF, and DOCX:
  1. **Original granular quotation-validation status (`validationStatus`):** Preserves all 12 Phase 05 states (`VERIFIED_EXACT`, `VERIFIED_CONTEXTUAL`, `PARTIALLY_SUPPORTED`, `INVALID_QUOTE`, `WRONG_SOURCE`, `WRONG_SECTION`, `WRONG_ENTRY`, `INVALID_OFFSETS`, `CONTEXT_MISMATCH`, `UNSUPPORTED_CLAIM`, `AMBIGUOUS`, `UNRESOLVED`).
  2. **Simplified presentation label (`presentationValidationLabel`):** Added `toCitationPresentationLabel()` (`VERIFIED | PARTIAL | INVALID | MISMATCH | UNRESOLVED`) stored alongside `validationStatus` without overwriting it.
  3. **Claim-support status (`claimSupport`):** Preserves `DIRECTLY_SUPPORTED`, `CONTEXTUALLY_SUPPORTED`, `PARTIALLY_SUPPORTED`, `RELATED_ONLY`, `NOT_SUPPORTED`, `CONTRADICTED`, `AMBIGUOUS`.
  4. **Evidence provenance & environment maturity (`sourceType`, `environmentMaturity`):** Preserved in `AuthoritativeCitation`, `dossierModel.citationsList`, PDF Layer 5, and DOCX Layer 5.
- **Defect Fixed:** Removed `.slice(0, 15)` citation truncation in `src/features/dossier/exportPdf.ts` (L1592) so every citation renders in PDF exports. Verified all 12 statuses across 24 citations round-trip cleanly through serialization, migration, `buildDossierModel`, `pdfjs-dist` PDF extraction, and DOCX `word/document.xml`.

---

## 6. Real Export Consistency Matrix (Gate 6)

| Field | Benchmark A (`Snapshot` $\to$ `Reopen` $\to$ `PDF` $\to$ `DOCX`) | Benchmark B (`Snapshot` $\to$ `Reopen` $\to$ `PDF` $\to$ `DOCX`) | Mismatches Found |
|---|---|---|---|
| **Candidate Name** | `Rohan Deshmukh` across all 5 surfaces | `Ananya Rao` across all 5 surfaces | **0** |
| **Target Employer** | `PayGrid Systems` across all 5 surfaces | `Northstar Credit` across all 5 surfaces | **0** |
| **Employer Role Title** | `Backend Software Engineer — Payments Core (Python)` (PDF `-` via `safePdfText`) | `Data Engineer — Risk & Decisioning` (PDF `-` via `safePdfText`) | **0** *(font-safe ASCII dash in PDF)* |
| **Raw Subtotal / Deductions / Final** | `91` / `-7` / `84` across all surfaces | `75.5` / `-7` / `69` across all surfaces | **0** *(fixed `rawScore` & added reconciliation strip)* |
| **Seniority & Months** | `MEETS_REQUIREMENT` / `ELIGIBLE` / `3.9 yrs` vs `3 yrs` | `AMBIGUOUS` / `GATE SHORTFALL` / `35m touched, 34m completed vs 36m req, shortfall: 1m` | **0** *(fixed PDF line truncation & snapshot hydration)* |
| **Requirement-Match & Citations** | All `engineStatus` + `presentationStatus`, all 12 granular `validationStatus` & quotes preserved | All `engineStatus` + `presentationStatus`, all citations & provenance preserved | **0** *(removed PDF `.slice(0, 15)`)* |

---

## 7. Actual Test and Build Results (Gate 7)

All verification commands executed **after the final source edit**:

1. **ATS Regression, Snapshot Fidelity, PDF Extraction & DOCX XML Suites:**
   - Command: `npx vitest run tests/ats/`
   - Result: **10 passed test files (10 total), 159 passed tests (159 total)** in `21.80s`
     - `tests/ats/phase08_3ConsistencyAudit.test.ts`: **9 passed**
     - `tests/ats/phase08_2ExportAudit.test.ts`: **17 passed**
     - `tests/ats/phase08_1SnapshotFidelity.test.ts`: **16 passed**
     - `tests/ats/phase08Export.test.ts`: **9 passed**
     - `tests/ats/phase07Seniority.test.ts`: **39 passed**
     - `tests/ats/phase06Matching.test.ts`: **17 passed**
     - `tests/ats/phase05Citations.test.ts`: **19 passed**
     - `tests/ats/phase04Evidence.test.ts`: **9 passed**
     - `tests/ats/phase03Ontology.test.ts`: **11 passed**
     - `tests/ats/p0Integrity.test.ts`: **13 passed**
2. **Playwright Real-Browser Suite (Desktop Chromium):**
   - Command: `npx playwright test e2e/e12-export-readiness.spec.ts`
   - Result: **3 passed (3 total)** in `44.0s`
     - `verifies browser font readiness, image loading guards, and zero-dimension protection`: passed (`23.0s`)
     - `executes resume scan and verifies export readiness and anti-stale isolation`: passed (`4.4s`)
     - `validates repeated export invocation and error recovery cleanup`: passed (`9.3s`)
3. **Production Build:**
   - Command: `npm run build` (`tsc && vite build`)
   - Result: **Exit code 0**, 0 TypeScript errors, Vite client bundle built in `6.80s`, PWA precache injected 93 build assets.

---

## 8. Git Commit and Diff Evidence

- **Current Commit SHA (`HEAD`):** `5412214ee8fc0f7580fd5830776dba40fddc39ef`
- **Working Tree Summary (`git diff --stat` vs `HEAD` before Phase 08.3 docs):** 25 tracked files modified (`+1,839` / `-469` lines across Phases 02–08.3), all uncommitted in working tree pending user review/commit.
- **Phase 08.3 Modified / Created Files:**
  - Modified: `src/features/ats/engine/authoritativeSnapshot.ts`
  - Modified: `src/features/dossier/dossierModel.ts`
  - Modified: `src/features/dossier/exportPdf.ts`
  - Modified: `src/features/dossier/exportDocx.ts`
  - Modified: `tests/ats/phase08_2ExportAudit.test.ts`
  - Created: `tests/ats/phase08_3ConsistencyAudit.test.ts`
  - Created: `docs/ats-engine/PHASE_08_3_FINAL_CONSISTENCY_REPORT.md`
  - Modified: `docs/ats-engine/ENGINE_ARCHITECTURE_AUDIT.md`

---

## 9. Remaining Limitations (Strictly Observed, Unmodified Per Scope)

1. **`bulletAnalyzer.ts` `METRIC_REGEX` Misses Written Scale Units in Benchmark B:** Benchmark B bullets contain `"18 million records"`, `"94 minutes to 31 minutes"`, and `"14 to 5 per month"`. Because `METRIC_REGEX` expects `\d+m` rather than `\d+ million`, and does not match `"from X minutes to Y minutes"` or `"from X to Y per month"`, `audit.metricsRatio` evaluates to `0`, yielding `impactMetrics = 0 / 15 pts` and `score = 69`.
2. **`seniorityMatcher.ts` Checks `Work` Bounds Instead of `PROFESSIONAL` Bounds for Year-Only Intervals:** On Benchmark B (`asOfDate = 2024-11-24`), `DataFlow Analytics` (`2022 - Present`) max possible professional tenure is `35` touched / `34` completed months (`24m–35m`), strictly below `36m`. Because `seniorityMatcher.ts` L321 checks `minPossibleWorkMonths..maxPossibleWorkMonths` (`26m–59m`, which includes the `2021 - 2022` internship), status becomes `AMBIGUOUS` (`scoreFactor: 0.70`) rather than `PARTIALLY_MEETS_REQUIREMENT` (`shortfallMonths: 1`). Both paths fail the mandatory gate (`GATE SHORTFALL`).
3. **Dual Scoring Specs in `AtsEngineResult`:** `result.score` (`84` / `69`) derives from the 7-dimension `scorer.ts` (`scoring-config.json`), while `result.trace` attaches the 5-pillar `CANONICAL_SCORING_SPEC` v`2.4.0` (summing to `67.05` / `58.65` before `trace.composite` is synchronized to `scoring.score`).
4. **PDF ASCII Sanitization (`safePdfText`):** Standard PDF Type1 fonts (Helvetica/Courier) sanitize em-dashes (`—`) to hyphen (`-`) and non-WinAnsi characters to spaces, causing minor glyph normalization in PDF text extraction (DOCX preserves full UTF-8 em-dashes).

---

**STOP NOTICE:** Phase 08.3 is complete and closed. Phase 09 has **NOT** been initiated.
