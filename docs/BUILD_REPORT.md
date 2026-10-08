# HireFlow Decision Suite — Build Report

**Autonomous Build & Engineering Manifest**  
**Date**: October 8, 2026  
**Branch**: `feature/hireflow-suite`  
**Test Suite**: 228 / 228 Unit Tests Passing (27 test files, 100% pass rate)  
**TypeScript**: Clean (0 errors across strict bundler compilation)  
**Production Bundle**: Built in 6.28s (`vite v8.3.0`)  
**Golden Benchmarks**: 100% Precision, 100% Recall, ~31ms average runtime  

---

## 1. Executive Summary

The HireFlow Suite build expands HireFlow from a standalone ATS keyword scanner into an end-to-end, multi-role recruitment and career decision engine. Built entirely with client-side execution, pure determinism, and zero network dependencies, the suite addresses every critical decision point in the candidate journey and hiring pipeline across five core decision groups.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HIREFLOW SUITE DECISION MATRIX                              │
├──────────────────────────┬─────────────────────────────┬────────────────────────────────────┤
│ Group A: Where to apply? │ Group B: How to present?    │ Group C: What to build or fix?     │
│ • Compare JDs            │ • Tailor Resume (TruthCheck)│ • Project Briefs (Set-cover bundler│
│ • Application Tracker    │ • Reach Out (15 templates)  │   covering missing skills)         │
│ • Company vs Company     │ • Public Profile Check      │                                    │
├──────────────────────────┴─────────────────────────────┴────────────────────────────────────┤
│ Group D: What offer should I take?                     │ Group E: Connecting HireFlow Roles │
│ • Offer Decoder (FY 2026-27 Tax Engine + S.87A cap)   │ • Cryptographic Evidence Card      │
│                                                        │ • Candidate, BHR & Interviewer UX  │
│                                                        │ • Batch Readiness (Placement Cell) │
│                                                        │ • Career Trajectory Link-Up        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Upgrades

### 2.1 Candidate Profile Foundation (Stage 1)
- **Strictly Typed Schema** (`src/features/suite/profile/types.ts`): Unified data models for `CandidateProfile`, `ProfileSkill`, `EvidenceLevel` (0–4), `ResumeVersion`, `ScanRecord`, and `BuildPlan`.
- **Level 0–4 Evidence Ladder Engine** (`src/features/suite/profile/evidenceLadder.ts`):
  - **Level 4 (Code Repository)**: Validated git repo links or commit hashes citing real implementations.
  - **Level 3 (Verbatim Metric)**: Measurable business or engineering outcomes (`%`, `ms`, `QPS`, users).
  - **Level 2 (Project Context)**: Project or work history mentions with technical context.
  - **Level 1 (Listing Only)**: Passive keyword mentions in skills list without supporting bullets.
  - **Level 0 (Unverified Claim)**: Assertions contradicted by red flags or lacking proof.
- **Storage Layer** (`src/features/suite/profile/storage.ts`): Quota-guarded `SuiteStorage` (5MB quota safety, schema versioning, JSON export/import, and memory store fallback).
- **Global UX Integration**: Global React Context (`ProfileContext.tsx`), slide-out drawer (`ProfileDrawer.tsx`), and real-time status chips (`ProfileStatusChip.tsx`).

### 2.2 Scoring Engine Upgrades & Invariant 6 (Stage 2)
- **Zero-Mutation Fix Simulator** (`src/features/suite/engine/simulateFix.ts`): Simulates score gains in < 2ms without mutating state.
- **Fix Ranker**: Classifies gaps into "Wording Fix" vs "Learn Needed" based on taxonomy weights and proficiency distance.
- **Invariant 6 (Summary Consistency)**: Strict assert function ensuring score thresholds, verdicts ('Strong fit', 'Close', 'Stretch', 'Insufficient input'), and top fixes match canonical engine results.
- **Pinned Quick Summary Card** (`src/features/suite/components/QuickSummaryCard.tsx`): Pinned atop ATS Roaster (`ResumeChecker.tsx`) and TalentLens (`TalentLens.tsx`).
- **New Golden Test Cases**: 20 new test pairs added in `extendedGoldenResumes.test.ts` expanding coverage to ECE, Mechanical, Go, Rust, Swift, and Big Data.

---

## 3. Tool Implementations (10 Tools Across 5 Decision Groups)

### Group A: What Should I Apply To?

#### 1. Compare Job Descriptions (`/tools/jd-compare`)
- **Engine**: `src/features/suite/compare/compareJDs.ts`
- **Capabilities**: Compares 2–3 JDs simultaneously, evaluates must-have coverage, identifies shared missing skills vs JD-specific gaps, and computes cross-JD coverage gains.
- **UI**: `src/features/suite/compare/CompareJDsPage.tsx` with Dataset 6 preset selector and candidate profile prefill.

#### 2. Application Tracker (`/tools/tracker`)
- **Engine**: `src/features/suite/tracker/insights.ts`
- **Capabilities**: Computes response rates, interview conversion rates, offer conversion rates, and gone-quiet threshold alerts (>14 days, >30 days). Includes deterministic RFC 4180 CSV parser and exporter.
- **UI**: `src/features/suite/tracker/ApplicationTrackerPage.tsx` with Kanban pipeline board, table list, and quick ATS Roaster linkage.

#### 3. Company vs Company (`/tools/company-compare`)
- **Engine**: `src/features/suite/companies/compareCompanies.ts`
- **Capabilities**: Directed preparation overlap percentage $\|Skills(A) \cap Skills(B)\| / \|Skills(B)\| \times 100$, interview rounds comparison, market tier mapping, and candidate profile prioritization.
- **UI**: `src/features/suite/companies/CompanyComparePage.tsx` with 3 tabs (Overview, Requirements, Prioritize).

---

### Group B: How Do I Present Myself Better?

#### 4. Tailor My Resume (`/tools/tailor`)
- **Engine**: `src/features/suite/tailor/tailorResume.ts` & `src/features/suite/tailor/truthCheck.ts`
- **Capabilities**: Truth-checker strictly prevents hallucinated skills and unbracketed metrics. Generates Reorder, Rephrase, and Add Context suggestions with before/after score deltas.
- **UI**: `src/features/suite/tailor/TailorResumePage.tsx` with side-by-side diff view, live bullet preview, and version persistence.

#### 5. Reach Out Cold Outreach Generator (`/tools/reach-out`)
- **Data & Engine**: `src/data/suite/outreach-templates.json` (15 templates) & `src/features/suite/outreach/generateOutreach.ts`
- **Capabilities**: Slot-filling across 5 channels (LinkedIn Connect with strict 300 char limits, InMail, Cold Email, Warm Referral, Follow-Up). Pulls top verbatim proof points from profile.
- **UI**: `src/features/suite/outreach/ReachOutPage.tsx` with live char counter, placeholder alerts, 1-click clipboard copy, and Application Tracker handoff.

#### 6. Profile Check (LinkedIn & GitHub Audit) (`/tools/profile-check`)
- **Engine**: `src/features/suite/profile-check/auditProfile.ts`
- **Capabilities**: Offline public audit for LinkedIn (headline keywords, 4-part About rubric, bullet quantification) and GitHub (README hygiene, commit velocity). Outputs 0–100 Public Signal Score and screener checklist.
- **UI**: `src/features/suite/profile-check/ProfileCheckPage.tsx`.

---

### Group C: What Do I Build or Fix?

#### 7. Project Build Briefs (`/tools/build-briefs`)
- **Data & Engine**: `src/data/suite/project-briefs.json` (14 engineering briefs) & `src/features/suite/briefs/bundleBriefs.ts`
- **Capabilities**: Deterministic greedy set-cover bundler that selects the minimum number of engineering briefs to cover missing skills with deterministic tie-breaking (fewest hours, difficulty weight, ID).
- **UI**: `src/features/suite/briefs/BuildBriefsPage.tsx` with Company preset, Profile gaps, and Custom skill modes, full modal inspection, and Build Plan persistence.

---

### Group D: What Offer Should I Take?

#### 8. Offer Decoder (`/tools/offer-decoder`)
- **Engine & Config**: `src/features/suite/offer/calc.ts`, `src/data/suite/tax-config.ts`, `src/data/suite/professional-tax.ts`
- **Capabilities**:
  - FY 2026-27 New Tax Regime default slabs (0–4L 0%, 4–8L 5%, 8–12L 10%, 12–16L 15%, 16–20L 20%, 20–24L 25%, >24L 30%).
  - Standard deduction ₹75,000.
  - Section 87A rebate & marginal relief threshold ₹12,00,000 (tax strictly capped at excess income over ₹12L).
  - 4% Health & Education cess.
  - State Professional Tax tables (KA, MH, TS, AP, TN, WB, GJ, KL, DL) + manual override.
  - ESOP/RSU vesting projections, joining bonus clawback flags, and contract risk detection.
- **Verified Worked Examples**:
  - Gross ₹12,50,000 $\rightarrow$ Tax ₹0
  - Gross ₹13,00,000 $\rightarrow$ Tax ₹26,000
  - Gross ₹18,00,000 $\rightarrow$ Tax ₹1,50,800
- **UI**: `src/features/suite/offer/OfferDecoderPage.tsx` with monthly take-home, 4-year projection, dark waterfall chart, side-by-side comparison matrix, preference sliders, and risk flags.

---

### Group E: Connecting HireFlow's Roles

#### 9. Verifiable Evidence Card (`/tools/evidence-card` & `/card`)
- **Codec**: `src/features/suite/share/cardCodec.ts`
- **Capabilities**: Client-side Deflate-Raw compression, Base64URL fragment encoding, SHA-256 tamper-proof digest, and automatic trimming of lowest-evidence skills if exceeding 6,000 characters. Zero backend storage required.
- **UI**:
  - Builder: `src/features/suite/share/EvidenceCardBuilderPage.tsx` (`/tools/evidence-card`).
  - Public Viewer: `src/features/suite/share/EvidenceCardViewerPage.tsx` (`/card#...`) with SHA-256 integrity verification badge.

#### 10. Batch Readiness for College Placement Cells (`/tools/batch-readiness`)
- **Engine**: `src/features/suite/cohort/batchAnalyzer.ts`
- **Capabilities**: Institutional readiness intelligence for student cohorts against target companies. Privacy-first candidate anonymization (`Candidate 001`, `Candidate 002`) ON by default. Computes student $\times$ company readiness heatmap matrix, aggregates batch-wide curriculum gaps, and exports RFC 4180 CSV reports.
- **UI**: `src/features/suite/cohort/BatchReadinessPage.tsx` with Overview, Heatmap, and Gaps tabs.

---

## 4. Multi-Role UX Integrations (Stage 7.2 & 7.4)

1. **Candidate Role** (`src/pages/candidate/CandidateDashboard.tsx`):
   - Dedicated "Verifiable Evidence Card" panel displaying verified skill counts and 1-click builder launch.
2. **HR Recruiter Role** (`src/pages/company/CandidateDetail.tsx` & `CandidateEvidenceCardPanel.tsx`):
   - Card verification panel supporting URL/hash input and prefill.
   - Live SHA-256 integrity badge check.
   - Deterministic skill-only match calculation against company open jobs.
3. **Interviewer Role** (`src/pages/interviewer/InterviewDetail.tsx` & `InterviewEvidenceChecklistPanel.tsx`):
   - Live technical interview checklist for skills $\le$ Level 2 and unverified claims.
   - Verbatim claim verification checkboxes with scratchpad notes.
   - 1-click button appending verified checklist items into the structured evaluation feedback.
4. **Career Trajectory Integration** (`src/features/suite/integration/trajectory.ts` & `CareerPathHub.tsx`):
   - Computes candidate market tier (Tier C $\rightarrow$ B $\rightarrow$ A $\rightarrow$ S).
   - "My Market Tier Positioning" banner on Career Path Hub with readiness progress and bridge gaps.
   - Reverse links on career ladder levels to pre-fill ATS Roaster.

---

## 5. Unified Navigation & Polish (Stage 8)

- **Unified Tools Hub** (`src/pages/tools/ToolsHubPage.tsx`): Registered at `/tools`, presenting all 10 tools organized under the 5 decision groups with search, capability tags, and direct CTAs.
- **Global Navigation**: Updated `PublicNavbar.tsx`, `LandingPage.tsx`, and authenticated `Sidebar.tsx` to include direct access to the Decision Suite.

---

## 6. Verification Metrics

| Benchmark Suite | Total Cases | Target | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| Golden Resumes (32 Cases) | 32 | Prec $\ge$ 92%, Rec $\ge$ 90%, Runtime < 300ms | **100% Prec, 100% Rec, 27.16ms** | **PASSED** |
| Extended Golden Suite | 20 | Prec $\ge$ 92%, Rec $\ge$ 90%, Runtime < 300ms | **100% Prec, 100% Rec, 27.58ms** | **PASSED** |
| Offer Decoder Tax Slabs | 10 | Strict tax calculation | **10/10 Worked Examples Pass** | **PASSED** |
| Set-Cover Bundler | 6 | Minimum cardinality & tie-break | **6/6 Tests Pass** | **PASSED** |
| Evidence Card Codec | 5 | Compression & SHA-256 hash | **5/5 Tests Pass** | **PASSED** |
| Batch Readiness Analyzer | 6 | Anonymization & gap sorting | **6/6 Tests Pass** | **PASSED** |
| Full Test Suite | 228 | 100% passing | **228 / 228 PASSED** | **PASSED** |
| TypeScript Check | — | 0 errors | **`tsc --noEmit` CLEAN** | **PASSED** |
| Production Build | — | Clean bundle | **Built in 6.28s** | **PASSED** |

---

## 7. Sweeps & Invariants Verified

- **No-Network Sweep**: 0 external API calls (`fetch`, `axios`) found in `src/features/suite/`.
- **Determinism Sweep**: 0 unseeded `Math.random()` calls in suite engines; identical inputs produce identical outputs across repeated executions.
- **Truth Invariant**: 0 unbracketed hallucinated metrics; all tailored suggestions enforce explicit bracket placeholders (`[X%]`, `[metric]`).
- **Timing Invariant**: 0 time-based false promises ("learn in 2 weeks") generated in learning recommendations.
