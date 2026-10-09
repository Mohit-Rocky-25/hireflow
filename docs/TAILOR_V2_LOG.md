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
- [ ] **Stage 2: Page Layout, Inputs, Match Panel**
  - [ ] Hero & Numbered inputs (1 Your resume, 2 Target job)
  - [ ] Status chips with `pluralize` helper (B7)
  - [ ] Quick Load searchable select
  - [ ] JD parser Nice-to-haves detection (B6)
  - [ ] Deterministic per-bullet strength score (0-100 rubric) & Resume quality summary
- [ ] **Stage 3: Review Experience + Engine Fixes**
  - [ ] Sticky 44px tab bar with live counts & muted empty states
  - [ ] Review progress bar & word-level diff cards
  - [ ] Add Context inline result inputs with tap-chips (B3, B4)
  - [ ] Engine fixes: B1 (gerund conversion + US/UK spelling), B2 (appliedVerb matching), B5 (Honest vs Ownership), B8 (no repeated opening verbs)
  - [ ] Keyboard shortcuts & toasts
- [ ] **Stage 4: Real Resume Preview + Download**
  - [ ] Single source `ResumeDocModel`
  - [ ] 3 templates: Classic, Modern, Compact
  - [ ] White A4 paper preview + toolbar
  - [ ] Clean ATS-safe `.docx` export (`docx` dynamic import) + print-to-PDF
  - [ ] Pre-download validation dialog & export truth gate
  - [ ] Unit & export tests
- [ ] **Stage 5: Verify and Commit to Main**
  - [ ] Full typecheck, test suites, and build validation
  - [ ] Multi-resolution browser checks & screenshots
  - [ ] Final handoff report & docs
