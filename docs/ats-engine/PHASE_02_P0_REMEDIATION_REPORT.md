# HireFlow ATS Resume Roaster — Phase 02 P0 Remediation Report
**Document Version:** 1.0.0  
**Phase:** Phase 02 — Core Engine Integrity and P0 Defect Remediation  
**Status:** Complete & Verified via Automated Invariant Tests  
**Author:** DeepMind Antigravity Engineering Taskforce  

---

## 1. Executive Summary

Phase 02 resolved all foundational **P0 defects** identified during the Phase 01 engineering audit. The modifications eliminate candidate and company identity decoupling, prevent automatic role-archetype phantom requirement seeding, unify the divergent scoring paths into a single source of truth, and ensure that penalty deductions mathematically reduce final ATS composite scores.

All changes were implemented within existing architectural boundaries without expanding the competency taxonomy or altering unrelated product areas. Every fix is backed by automated regression tests in `tests/ats/p0Integrity.test.ts` (13/13 passing) and the full ATS engine test suite (80/80 passing).

---

## 2. Defects Confirmed and Root Causes

| Defect ID | Description | Confirmed Root Cause |
| :--- | :--- | :--- |
| **P0.1A** | Candidate identity defaulted to `"Mohit"` instead of `"Rohan Deshmukh"` or `"Ananya Rao"`. | `dossierModel.ts` and `exportDossier.ts` directly queried `useProfileStore.getState().profile?.displayName`, completely ignoring the parsed candidate name from `contactExtractor.ts`. |
| **P0.1B** | Target employer extracted as `"Target Organization"` instead of `"Northstar Credit"`. | `ResumeChecker.tsx` relied exclusively on rigid `(?:Company\|Employer):` regexes, failing on natural language introductions like `"At Northstar Credit, we are building..."`. |
| **P0.1C** | Scan identity shared state across scans. | Scans lacked an isolated, immutable session identity object tracking candidate, employer, hashes, and timestamps. |
| **P0.2** | Phantom requirements (Django, GCP, Databricks, Prometheus, Sharding) auto-injected. | In `jdAnalyzer.ts`, when fewer than 4 must-have skills were detected, the engine auto-injected default musts from `roles.json` into `requiredSkills`, penalizing candidates for unmentioned tech. |
| **P0.3** | Dual divergent scoring paths (`computeAtsScore()` vs. `runScoringEngine()`). | UI and history pulled `result.score` while other views pulled `result.trace.compositeDisplay`, allowing scores to diverge by up to 15 points. |
| **P0.4** | Penalty calculations were purely cosmetic. | `computeAtsScore()` generated penalty objects into an array, but never subtracted them from `rawSubtotal` before returning `finalScore`. |

---

## 3. Files and Functions Modified

1. **`src/features/ats/engine/contactExtractor.ts`**:
   - Function: `extractContactInfo(resumeText)`
   - Fix: Hardened line-scanning heuristics and added negative token filtering (`summary`, `experience`, `education`, etc.) to prevent section headers from polluting candidate name extraction.
2. **`src/features/ats/engine/companyExtractor.ts`** *(New File)*:
   - Function: `extractEmployerFromJd(jdText)`
   - Feature: Multi-strategy contextual company extractor checking explicit headers, natural introductions (`"At <Company>, we..."`, `"Join <Company>..."`), and title-line contexts (`"<Role> at <Company>"`).
3. **`src/features/ats/engine/scanIdentity.ts`** *(New File)*:
   - Function: `createScanIdentity(params)`
   - Feature: Creates isolated scan records containing `scanId`, `candidateName`, `employerName`, content hashes, and timestamps.
4. **`src/features/ats/engine/jdAnalyzer.ts`**:
   - Function: `analyzeJobDescription(jdText, confirmedRequirements)`
   - Fix: Removed automatic promotion of archetype must-haves into `requiredSkills`. Added `inferredRecommendations` array preserving archetype skills strictly as non-penalizing supplementary recommendations. Added provenance metadata (`sourceType: 'explicit'`).
5. **`src/features/ats/engine/types.ts`**:
   - Types: Extended `JdRequirement` with `sourceType`, `sourceSentence`, `confidence`. Added `InferredRecommendation` interface. Added `scanIdentity`, `candidateName`, and `employerName` to `AtsEngineResult`.
6. **`src/features/ats/engine/scorer.ts`**:
   - Function: `computeAtsScore(input)`
   - Fix: Integrated active penalty deductions: `finalScore = Math.max(0, Math.min(100, Math.round(rawSubtotal - totalDeductions)))`. Added deduplication of penalties to prevent double-penalizing single root causes.
7. **`src/features/ats/engine/index.ts`**:
   - Function: `runAtsEngine(resumeText, jdText, options)`
   - Fix: Integrated `extractEmployerFromJd` and `createScanIdentity`. Unified scoring by binding `trace.composite` and `trace.compositeDisplay` directly to the authoritative evaluation score.
8. **`src/pages/tools/ResumeChecker.tsx`**:
   - Function: `executeAnalysis()`
   - Fix: Forwarded `response.result.candidateName` and `response.result.employerName` to `atsToAuditInput()`.
9. **`src/features/ats/journalAdapter.ts`**:
   - Function: `atsToAuditInput(input)`
   - Fix: Captured `candidateName` and `targetCompany` into `findingsJson` audit metadata.
10. **`src/features/dossier/dossierModel.ts`**:
    - Function: `buildDossierModel(input)`
    - Fix: Resolved `candidate.name` from `rawFindings.candidateName || atsResult.candidateName` with fallback to input, never defaulting to logged-in user profile.
11. **`src/features/dossier/exportDossier.ts`**:
    - Functions: `exportDossier()`, `generateDossierMarkdown()`
    - Fix: Extracted `resolvedCandidateName` from audit findings rather than defaulting to `profile?.displayName`.

---

## 4. Remediation Details by Category

### P0.1: Candidate & Company Identity Integrity
- **Candidate Provenance:** `contactExtractor.ts` extracts the candidate's actual name. The name is propagated via `AtsEngineResult.candidateName`, recorded into `AuditEntry.findingsJson`, and consumed by `dossierModel.ts` and `exportDossier.ts`. If no name is detected, it returns `"Candidate name not detected"` rather than substituting `"Mohit"`.
- **Contextual Employer Resolution:** `companyExtractor.ts` evaluates four natural language patterns:
  1. Explicit headers: `Company: PayGrid Systems` -> `"PayGrid Systems"`.
  2. Introductory phrases: `At Northstar Credit, we are building...` -> `"Northstar Credit"`.
  3. Welcome phrases: `Join Uber as a...` -> `"Uber"`.
  4. Title lines: `Backend Engineer at Razorpay` -> `"Razorpay"`.
- **Scan Identity Isolation:** Every scan generates a deterministic or UUID-based `ScanIdentity` object preventing state leakage between consecutive analyses in the same browser session.

### P0.2: Eliminate Phantom JD Seeding
- Archetype defaults from `roles.json` no longer enter `requiredSkills`.
- If a JD has fewer than 4 must-haves, only explicit requirements participate in scoring.
- Archetype suggestions are retained in `jdAnalysis.inferredRecommendations` for optional candidate guidance, but never trigger missing-skill deductions or lower the match percentage.

### P0.3: Unified Single Source of Truth Scoring
- `computeAtsScore()` serves as the single authoritative scoring engine for ATS Roaster.
- `runScoringEngine()` score traces are synchronized directly (`trace.composite = scoring.score; trace.compositeDisplay = scoring.score;`).
- All consumers—ResumeChecker UI, score headers, audit entries, dossier models, and PDF/DOCX exporters—consume the identical score.

### P0.4: Correct Penalty Deductions & Score Invariants
- Penalties (`keyword_stuffing`, `no_contact_info`, `missing_standard_section`, `word_count_outlier`) are deduplicated.
- Deductions are subtracted directly from `rawSubtotal`:
  $$\text{FinalScore} = \text{clamp}(\text{rawSubtotal} - \sum |\text{penalty}|, 0, 100)$$
- Keyword stuffing penalties distinguish legitimate coursework/foundation lists from deliberate spamming by requiring unevidenced skills $> 70\%$ across $\ge 20$ listed tools.

---

## 5. Automated Regression Test Results

A dedicated automated regression test suite was created in `tests/ats/p0Integrity.test.ts`.

### Test Execution Summary:
- **`tests/ats/p0Integrity.test.ts`**: 13/13 Passed (843ms)
- **`src/features/ats/__tests__/`**: 67/67 Passed (6.79s)
- **Total Combined ATS Suite**: 80/80 Passed (12.39s)
- **Production Build (`npm run build`)**: Succeeded with code 0 in 6.66s.

### Verified Test Cases:
1. `correctly extracts Rohan Deshmukh from Benchmark A resume` (Passed)
2. `correctly extracts Ananya Rao from Benchmark B resume` (Passed)
3. `correctly extracts PayGrid Systems from explicit company header` (Passed)
4. `correctly extracts Northstar Credit from natural intro phrase` (Passed)
5. `guarantees sequential scans do not inherit candidate or employer names` (Passed)
6. `preserves parsed candidate name in Dossier model without defaulting to profile account name` (Passed)
7. `does NOT inject unmentioned technologies (Django, GCP) into PayGrid JD` (Passed)
8. `does NOT inject unmentioned technologies (Databricks, Prometheus, Sharding) into Northstar JD` (Passed)
9. `preserves short JDs with only 1-2 requirements without auto-injecting must-haves` (Passed)
10. `guarantees result.score, trace.composite, and trace.compositeDisplay are identical` (Passed)
11. `ensures audit entry overallScore equals the engine result score exactly` (Passed)
12. `applies penalties by actually deducting points from raw score` (Passed)
13. `enforces score invariant: 0 <= score <= 100 for all evaluations` (Passed)

---

## 6. Updated P0 Status in Architecture Audit

| Audit Backlog Item | Target Area | Status | Verified By |
| :--- | :--- | :--- | :--- |
| **P0.1** | Candidate & Company Identity Resolution | **Fixed & Tested** | `p0Integrity.test.ts:P0.1` (6 tests) |
| **P0.2** | Abolish Phantom Requirement Seeding | **Fixed & Tested** | `p0Integrity.test.ts:P0.2` (3 tests) |
| **P0.3** | Unify Dual Scoring Engines | **Fixed & Tested** | `p0Integrity.test.ts:P0.3` (2 tests) |
| **P0.4** | Connect Penalty Math to Final Score | **Fixed & Tested** | `p0Integrity.test.ts:P0.4` (2 tests) |

---

## 7. Remaining Limitations & Next Phase Handoff

The core engine integrity and identity foundation are now solid. The following non-P0 items identified in Phase 01 remain deferred to subsequent phases as planned:
- **Phase 03 (Competency Knowledge & Synonym Expansion):** Adding taxonomy nodes and implication mappings for `composite B-tree indexes`, `EXPLAIN ANALYZE`, `GitHub Actions` -> `CI/CD`, and `Great Expectations` / `data contracts`.
- **Phase 04 (Evidence Provenance & Experience Calibration):** Distinguishing personal/academic projects from enterprise production experience in `skillMatcher.ts`.
- **Phase 05 (Narrative Metric Extraction):** Supporting complex multi-token metrics ("reduced from 94m to 31m", "decreased from 14 to 5 incidents/month") in `bulletAnalyzer.ts`.
