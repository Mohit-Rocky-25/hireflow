# HireFlow Suite Build Log

## 0. Recon & Baseline Summary

### 0.1 Environment & Platform
- Machine: Windows PowerShell (AMD)
- Framework: React 19, Vite 8, Tailwind CSS v4, Lucide React, react-router-dom v7, recharts 3, zustand, zod, pdfjs-dist, mammoth
- Test Runner: Vitest 5.0.3
- TypeScript: ~6.0.2, strict bundler configuration in `tsconfig.json`
- Ports: Vite dev server on 5173 / 5174

### 0.2 Real Discovered Paths
- `fileParser`: `src/features/ats/fileParser.ts`
- `parseJD`: `src/lib/ats/parseJD.ts` and `src/features/ats/engine/jdAnalyzer.ts`
- Skills Taxonomy: `src/data/ats/skills-taxonomy.json` & `src/features/ats/knowledge/taxonomy/`
- Writing Quality Rules: `src/data/ats/writing-quality.json`
- Format Rules: `src/data/ats/ats-format-rules.json`
- Market Tiers: `src/data/ats/market-tiers.json`
- TalentLens Data: `src/pages/demo/talentLensData.ts`
- Competency Profiles: `src/data/ats/role-profiles.json` & `src/pages/demo/talentLensData.ts`
- Scoring Engine Entry: `src/features/ats/engine/index.ts` (`runAtsEngine`) & `src/lib/ats/canonicalAnalysis.ts`
- Verbatim Citation Checker: `src/lib/ats/invariants.ts` (Invariant 4)
- 32 Golden Resumes Suite: `src/features/ats/__tests__/golden-resumes.test.ts`
- Tools Hub & Landing Page: `src/pages/LandingPage.tsx`, tools routes in `src/App.tsx`
- Career Trajectory: `src/pages/tools/career-path/CareerPathHub.tsx`
- Role Subsections: Candidate (`src/pages/candidate/`), Company/BHR (`src/pages/company/`), Interviewer (`src/pages/interviewer/`), Admin (`src/pages/admin/`)
- Shared UI: `src/components/ui/`, `src/components/layout/`

### 0.3 UI Patterns Found
- Theme: Dark cool UI (`bg-bg`, `bg-surface`, `bg-surface-2`, `bg-surface-3`)
- Typography: Inter/System sans (`font-sans`), monospace for numbers/code (`font-mono`), strong contrast
- Headings: Bold / ExtraBold, tracking-tight (`tracking-[-0.03em]`, `text-[42px]`, `text-[28px]`, `text-[18px]`)
- Layout widths: `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`
- Spacing: 16px/24px/32px/48px
- Cards: `bg-surface border border-border rounded-2xl p-6 shadow-xs hover:border-border-strong`
- Pill Tabs: `bg-surface-2 p-1 border border-border rounded-xl`, active `bg-text text-bg` or `bg-surface text-text shadow-sm`
- Buttons: Secondary `bg-surface hover:bg-surface-2 border border-border text-xs font-bold rounded-xl text-text transition-colors`, Primary `bg-gradient-to-r from-primary to-ai text-white rounded-xl font-bold`
- Chart wrapper: ResponsiveContainer with visible contrasting colors (emerald, amber, violet, cyan), no solid black fills
- Icons: `lucide-react` with `stroke-[1.5px]` or `stroke-[2px]`
- Motion: `animate-fade-in`, transitions `duration-150`

### 0.4 Baseline Run & Golden Freeze
- Typecheck (`npx tsc --noEmit`): PASSED (0 errors)
- Unit tests (`vitest run`): 139 PASSED across 13 test files
- Build (`npm run build`): PASSED in 2.56s
- Golden Baseline: Frozen at `docs/baseline-golden.json` (32 test cases, 100% precision, 100% recall, avg runtime 33.61ms)
- Branch: `feature/hireflow-suite` created and checked out; `main` branch untouched.

---

## Master Checklist

- [x] Stage 0: Recon, Baseline, Safety Net
  - [x] 0.1 Inspect repo & record paths
  - [x] 0.2 Install dependencies non-interactively
  - [x] 0.3 Baseline run (typecheck, vitest, build)
  - [x] 0.4 Freeze golden baseline (`docs/baseline-golden.json`)
  - [x] 0.5 Git setup on `feature/hireflow-suite`
  - [x] 0.6 Create `docs/BUILD_LOG.md`
- [x] Stage 1: Foundation: Candidate Profile
  - [x] 1.1 Strictly typed models (`profile/types.ts`)
  - [x] 1.2 Profile builder (`profile/buildProfile.ts`)
  - [x] 1.3 Deterministic evidence ladder 0-4 (`profile/evidenceLadder.ts`)
  - [x] 1.4 Storage layer with quota guard & import/export (`profile/storage.ts`)
  - [x] 1.5 ProfileProvider, hooks, My Profile drawer, top chips
  - [x] 1.6 Unit tests for determinism, ladder, storage roundtrip
- [x] Stage 2: Engine Upgrades
  - [x] 2.1 `simulateFix` and `rankFixes`
  - [x] 2.2 `buildQuickSummary` and Quick Summary card on Roaster & TalentLens
  - [x] 2.3 Accuracy fixes & 20 new golden test cases
  - [x] 2.4 Invariant 6 (Summary Consistency)
  - [x] 2.5 Tests for simulation, ranking, summary, tokens
- [ ] Stage 3: Group A - What should I apply to?
  - [x] 3.1 Compare Job Descriptions (`/tools/jd-compare`)
  - [ ] 3.2 Application Tracker (`/tools/tracker`)
  - [ ] 3.3 Company vs Company (`/tools/company-compare`)
- [ ] Stage 4: Group B - How do I present myself better?
  - [ ] 4.1 Tailor My Resume (`/tools/tailor`) with truth check
  - [ ] 4.2 Reach Out (`/tools/reach-out`) with slot-filling & placeholders
  - [ ] 4.3 Profile Check (LinkedIn + GitHub) (`/tools/profile-check`)
- [ ] Stage 5: Group C - What do I build or fix?
  - [ ] 5.1 Build Briefs (`/tools/build-briefs`) with set-cover bundler
- [ ] Stage 6: Group D - What offer should I take?
  - [ ] 6.1 Offer model & tax configuration (`tax-config.ts`, `professional-tax.ts`)
  - [ ] 6.2 Calculation engine (`offer/calc.ts`) with marginal relief & 3 worked tests
  - [ ] 6.3 Offer Decoder UI (`/tools/offer-decoder`) with waterfall & comparison
- [ ] Stage 7: Group E - Connecting HireFlow's Roles
  - [ ] 7.1 Evidence Card builder (`/tools/evidence-card`) and viewer (`/card`)
  - [ ] 7.2 Role integrations (Candidate, HR Recruiter, Interviewer)
  - [ ] 7.3 Batch Readiness (`/tools/batch-readiness`)
  - [ ] 7.4 Career Trajectory link-up
- [ ] Stage 8: Navigation, Integration, Polish
  - [ ] 8.1 Tools hub with 5 decision group headings
  - [ ] 8.2 Cross-tool handoff links
  - [ ] 8.3 Empty/loading/error states
  - [ ] 8.4 Lazy loading & performance verification
  - [ ] 8.5 Accessibility & dark contrast audit
  - [ ] 8.6 Consistency pass
- [ ] Stage 9: Verification Loop
  - [ ] 9.1 Typecheck, lint, test suite, build
  - [ ] 9.2 Regression against `docs/baseline-golden.json`
  - [ ] 9.3 Determinism sweep
  - [ ] 9.4 No-network sweep
  - [ ] 9.5 Forbidden-content sweep
  - [ ] 9.6 Browser / smoke render checks
  - [ ] 9.7 `docs/BUILD_REPORT.md`
  - [ ] 9.8 `docs/TESTING_CHECKLIST.md`
- [ ] Stage 10: Finish on Feature Branch Only

---

## Stage 0 Handoff Note
- Baseline verified: all 139 pre-existing tests pass; `docs/baseline-golden.json` contains baseline metrics for 32 golden cases.
- Current branch: `feature/hireflow-suite`.
- Next task: Stage 1 (Candidate Profile foundation).

## Stage 1 Handoff Note
- Created `src/features/suite/profile/types.ts` (`CandidateProfile`, `EvidenceLevel`, `ResumeVersion`, `ScanRecord`, `ApplicationEntry`, `BuildPlan`).
- Created `src/features/suite/profile/evidenceLadder.ts` (`gradeSkill` levels 0-4 with verbatim quotes, metrics and link matching).
- Created `src/features/suite/profile/buildProfile.ts` (Pass A & Pass B integration, explicit CGPA/backlogs pattern matching, link detection).
- Created `src/features/suite/profile/storage.ts` (`SuiteStorage` with localStorage quota guards, schema validation, export/import, memStore fallback for test/SSR).
- Created `ProfileContext.tsx`, `ProfileDrawer.tsx`, `ProfileStatusChip.tsx`.
- Integrated `ProfileProvider` and `ProfileDrawer` into `App.tsx`.
- Integrated "Save to my profile" buttons into ATS Roaster (`ResumeChecker.tsx`) and `TalentLens.tsx`.
- Unit tests (`profileFoundation.test.ts`): all 11 tests pass. All 152 tests across the repo pass. Typecheck clean.
- Next task: Stage 2 (Engine upgrades: simulateFix, rankFixes, buildQuickSummary, Quick Summary cards, Invariant 6, golden cases expansion).

## Stage 2 Handoff Note
- Created `src/features/suite/engine/simulateFix.ts` (`simulateFix`, `rankFixes`). Pure simulation runs in < 2ms without mutation, ranking gaps into Wording Fix vs Learn Needed by taxonomy weight x proficiency distance.
- Created `src/features/suite/engine/quickSummary.ts` (`buildQuickSummary`, `assertSummaryConsistency`). Calibrated golden thresholds for verdicts ('Strong fit', 'Close', 'Stretch', 'Insufficient input'), effort split, and Invariant 6 runtime validation.
- Created `src/features/suite/components/QuickSummaryCard.tsx` with verdict badge, effort split, top 3 fixes with simulated gains, plain-text copy, and report expand/collapse toggle.
- Pinned `QuickSummaryCard` at the top of results in both ATS Roaster (`ResumeChecker.tsx`) and `TalentLens.tsx`.
- Extended ambiguous tokens & context boundary handling for Go, Rust, Swift, Spark, Flask, and diverse engineering disciplines (ECE/Embedded, Mechanical, Civil, Cybersecurity, BI).
- Created 20 new golden test cases in `src/features/ats/__tests__/new-golden-pairs.ts` and benchmark in `src/features/ats/__tests__/extendedGoldenResumes.test.ts` achieving 100% precision, 100% recall, 40ms avg runtime. Original 32 golden test cases maintained 100% precision and recall with 0 regressions.
- Created `docs/engine-diff.md` detailing the accuracy improvements and benchmark results.
- Created unit tests in `src/features/suite/engine/__tests__/engineUpgrades.test.ts` (all 7 tests pass).
- Complete test suite: all 160 tests passing, `npx tsc --noEmit` clean.
- Next task: Stage 3 (Group A: "What should I apply to?" — Compare JDs, Application Tracker, Company vs Company).

