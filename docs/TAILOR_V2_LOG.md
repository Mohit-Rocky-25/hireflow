# Tailor My Resume (v2) — Engineering & Execution Log

## Overview
- Date: 2026-10-09
- Base Commit: `pre-tailor-ui-v2` (`a8611e8`)
- Goal: Fix UI overlaps, professional DOCX/PDF export, eliminate engine bugs B1–B8, deterministic truth checks.

---

## Stage Tracking

- [x] **Stage 1: Recon + Header Fix**
  - [x] Tag `pre-tailor-ui-v2` created
  - [x] Paths discovery & baseline runs (typecheck, tests, build)
  - [x] Fixture creation (`src/__tests__/tailor/fixtures/`)
  - [x] Single cohesive header (~64px, Back + Home left with 44px targets, breadcrumb center, TruthCheck right, 0 overlap)
  - [x] Multi-resolution verification (1440, 1024, 768, 390) passing in `header-overlap.test.ts`
- [x] **Stage 2: Page Layout, Inputs, Match Panel**
  - [x] Hero & Numbered inputs (1 Your resume, 2 Target job)
  - [x] Status chips with `pluralize` helper (B7)
  - [x] Quick Load searchable select with company/role presets
  - [x] JD parser Nice-to-haves detection (B6)
  - [x] Deterministic per-bullet strength score (0-100 rubric) & Resume quality summary
  - [x] MatchPanel with Base vs After match gauges, delta chips, solid matched vs outlined missing chips, and quality breakdown
  - [x] Tests verified in `src/__tests__/tailor/stage2-layout-parser.test.ts` (4/4 passed) and typecheck clean
- [x] **Stage 3: Review Experience + Engine Fixes**
  - [x] Sticky 44px tab bar (`ReviewTabBar`) with live counts, progress bar ("X of Y reviewed"), and "Review next"
  - [x] Review cards (`SuggestionCard`) with pure JS word-level diff (`WordDiffViewer`), inline edit, and states (Pending, Accepted, Rejected, Needs input)
  - [x] Add Context inline result inputs with quick tap-chips (latency %, users, hours/week, throughput)
  - [x] Bulk actions: Accept All / Reject All with 6-second undo toast (skips uncompleted context items)
  - [x] Grouping by section (`EXPERIENCE`, `PROJECTS`, `SKILLS`) in "All" view with muted empty states
  - [x] Engine fixes:
    - B1: Weak opener + gerund -> past tense conversion via 80+ verb table + US/UK spelling detection (`verbs.ts`)
    - B2: Dynamic rationale naming exact applied verb
    - B5: Duty phrases direct conversion vs Participation phrases with Honest (Facts ✓) and Ownership (Ownership ⚠) options
    - B3: Deterministic grammar gate (`grammar.ts`) for capitalization, punctuation, and double words
    - B8: Deduplication of opening verbs within roles/sections
  - [x] Tests verified in `src/__tests__/tailor/stage3-engine-review.test.ts` (8/8 passed, 17/17 total across suite) and typecheck clean
- [x] **Stage 4: Real Resume Preview + Download**
  - [x] Single source `ResumeDocModel` (`docModel.ts`) cleanly parsing contact, summary, experience, projects, education, and skills with overlay replacements
  - [x] 3 templates: Classic (traditional serif/clean), Modern (indigo accents & chips), Compact (dense single-page)
  - [x] White A4 paper preview (`PaperPreview.tsx`) with realistic drop shadow, `#ffffff` canvas, and print media optimization
  - [x] Customization & Export toolbar (`ExportToolbar.tsx`): template selector, "Show changes" green highlight toggle, "ATS text view" raw toggle, copy, save, and downloads
  - [x] Clean ATS-safe `.docx` export (`docxExport.ts` via dynamic `import('docx')`) with real bullets, right-aligned tab stops for dates, and standard fonts
  - [x] Print-to-PDF via browser print engine
  - [x] Export truth gate modal (`ExportTruthGateModal.tsx`) warning against unresolved bracket placeholders or unfilled metric fields
  - [x] Unit tests verified in `src/__tests__/tailor/stage4-export.test.ts` (5/5 passed, 22/22 total across suite) and typecheck clean
- [x] **Stage 5: Verify and Commit to Main**
  - [x] Full typecheck (`tsc --noEmit`), test suites (22/22 passed), and build validation (`npm run build`)
  - [x] Dynamic code-splitting of `docx` confirmed (~467 kB separate chunk)
  - [x] Background dev server active and verified (`HTTP 200 OK`)
  - [x] Comprehensive architecture & release documentation written in `docs/TAILOR_UI_V2.md`
  - [x] Per-stage git commits on `main` with rollback tag `pre-tailor-ui-v2` preserved
