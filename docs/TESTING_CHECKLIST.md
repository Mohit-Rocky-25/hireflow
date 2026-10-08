# HireFlow Decision Suite — Testing & Verification Checklist

**Execution Date**: October 8, 2026  
**Git Branch**: `feature/hireflow-suite`  
**Test Runner**: Vitest v5.0.3  
**Total Tests Passing**: 228 / 228 across 27 test files  

---

## 1. Regression & Accuracy Benchmarks

| Test ID | Test Suite File | Test Assertions | Result |
| :--- | :--- | :--- | :--- |
| **BENCH-01** | `golden-resumes.test.ts` | 32 Golden Resumes precision $\ge$ 92%, recall $\ge$ 90%, runtime < 300ms | **PASSED** (100% Prec, 100% Rec, ~27ms) |
| **BENCH-02** | `extendedGoldenResumes.test.ts` | 20 Extended Resumes precision $\ge$ 92%, recall $\ge$ 90%, runtime < 300ms | **PASSED** (100% Prec, 100% Rec, ~27ms) |
| **BENCH-03** | `canonicalConsistency.test.ts` | 24 Canonical invariant consistency tests | **PASSED** (24/24) |
| **BENCH-04** | `engine.test.ts` | Invariants 1–5 assertions, determinism across 3 executions | **PASSED** (8/8) |

---

## 2. Decision Suite Component Tests

### Stage 1: Candidate Profile Foundation
- [x] **PROF-01**: `profileFoundation.test.ts` — Ladder level 0–4 classification with verbatim quote extraction.
- [x] **PROF-02**: `profileFoundation.test.ts` — Pass A & Pass B integration; explicit CGPA and backlogs matching.
- [x] **PROF-03**: `profileFoundation.test.ts` — `SuiteStorage` roundtrip serialization, schema versioning, and export/import.
- [x] **PROF-04**: `profileFoundation.test.ts` — Storage quota guard safely prevents crash on quota exceed.

### Stage 2: Engine Upgrades & Invariant 6
- [x] **ENG-01**: `engineUpgrades.test.ts` — `simulateFix` runs without state mutation in < 2ms.
- [x] **ENG-02**: `engineUpgrades.test.ts` — `rankFixes` orders gaps by expected gain and differentiates Wording vs Learn.
- [x] **ENG-03**: `engineUpgrades.test.ts` — `buildQuickSummary` outputs correct verdict thresholds and top 3 fixes.
- [x] **ENG-04**: `engineUpgrades.test.ts` — Invariant 6 runtime assert passes on matched scores.

### Stage 3: Group A — What should I apply to?
- [x] **JDC-01**: `compareJDs.test.ts` — Ranks 2–3 JDs deterministically by score and must-have coverage.
- [x] **JDC-02**: `compareJDs.test.ts` — Correctly categorizes shared gaps vs JD-unique gaps.
- [x] **JDC-03**: `compareJDs.test.ts` — Computes cross-JD coverage gains.
- [x] **TRK-01**: `insights.test.ts` — Computes response rates, interview conversion, and offer conversion.
- [x] **TRK-02**: `insights.test.ts` — Gone-quiet alerts trigger accurately at >14 days and >30 days.
- [x] **TRK-03**: `insights.test.ts` — RFC 4180 CSV export and state-machine CSV parser roundtrip.
- [x] **CMP-01**: `compareCompanies.test.ts` — Directed prep overlap formula $\|A \cap B\| / \|B\| \times 100$.
- [x] **CMP-02**: `compareCompanies.test.ts` — Compares hiring bars, interview rounds, and Dataset 4 market tiers.

### Stage 4: Group B — How do I present myself better?
- [x] **TLR-01**: `tailor.test.ts` — `truthCheck` rejects hallucinated skills not in original resume text.
- [x] **TLR-02**: `tailor.test.ts` — `truthCheck` rejects unbracketed manufactured numbers and metrics.
- [x] **TLR-03**: `tailor.test.ts` — Generates Reorder, Rephrase, and Add Context suggestions.
- [x] **OUT-01**: `generateOutreach.test.ts` — Fills outreach slots without unbracketed placeholders.
- [x] **OUT-02**: `generateOutreach.test.ts` — Enforces strict 300 character constraint on LinkedIn Connect.
- [x] **PRF-01**: `auditProfile.test.ts` — Evaluates LinkedIn headline keywords, 4-part About rubric, and bullet density.
- [x] **PRF-02**: `auditProfile.test.ts` — Evaluates GitHub repository hygiene signals and commit velocity.

### Stage 5: Group C — What do I build or fix?
- [x] **BRF-01**: `bundleBriefs.test.ts` — Greedy set-cover bundles minimum briefs to cover skill gaps.
- [x] **BRF-02**: `bundleBriefs.test.ts` — Deterministic tie-breaking on hours, difficulty weight, and brief ID.
- [x] **BRF-03**: `bundleBriefs.test.ts` — Returns empty bundle when all skills are already covered.

### Stage 6: Group D — What offer should I take?
- [x] **TAX-01**: `calc.test.ts` — Worked Example 1: Gross ₹12,50,000 $\rightarrow$ Taxable ₹11,75,000 $\rightarrow$ Tax ₹0.
- [x] **TAX-02**: `calc.test.ts` — Worked Example 2: Gross ₹13,00,000 $\rightarrow$ Marginal relief caps base tax to ₹25,000 + 4% cess $\rightarrow$ Tax ₹26,000.
- [x] **TAX-03**: `calc.test.ts` — Worked Example 3: Gross ₹18,00,000 $\rightarrow$ Slabs tax ₹1,45,000 + 4% cess $\rightarrow$ Tax ₹1,50,800.
- [x] **TAX-04**: `calc.test.ts` — State professional tax calculations across KA, MH, TS, and manual override.
- [x] **TAX-05**: `calc.test.ts` — Contract risk flags identify non-compete clauses, notice periods >60d, and joining bonus clawbacks.

### Stage 7: Group E — Connecting HireFlow's Roles
- [x] **CRD-01**: `cardCodec.test.ts` — Deflate-Raw compression and Base64URL encoding roundtrip.
- [x] **CRD-02**: `cardCodec.test.ts` — SHA-256 integrity hash verification detects tampering.
- [x] **CRD-03**: `cardCodec.test.ts` — Safely trims lowest-evidence skills if compressed URL exceeds 6,000 chars.
- [x] **BCH-01**: `batchAnalyzer.test.ts` — Generates deterministic 20-candidate sample cohort.
- [x] **BCH-02**: `batchAnalyzer.test.ts` — Anonymization replaces names with `Candidate 001`, `Candidate 002`.
- [x] **BCH-03**: `batchAnalyzer.test.ts` — Ranks top batch curriculum gaps descending.
- [x] **BCH-04**: `batchAnalyzer.test.ts` — Pure determinism across repeated executions.
- [x] **TRJ-01**: `trajectory.test.ts` — Classifies candidate market tier (Tier C $\rightarrow$ B $\rightarrow$ A $\rightarrow$ S).
- [x] **TRJ-02**: `trajectory.test.ts` — Maps tier bridge gaps and recommended project briefs.

---

## 3. System & Integrity Sweeps

- [x] **Deterministic Execution**: Verified 0 unseeded `Math.random()` in suite logic.
- [x] **Zero-Network Policy**: Verified 0 `fetch()` or `axios` calls in `src/features/suite/`.
- [x] **Truth Invariant**: Verified all tailored bullets require explicit bracket metrics (`[X%]`).
- [x] **Typecheck**: `npx tsc --noEmit` verified with 0 errors.
- [x] **Production Bundle**: `npm run build` completed in 6.28s.
- [x] **Branch Safety**: All work confined strictly to `feature/hireflow-suite`.
