# Resume Layout Engine — Execution Log

## Overview
- Date: 2026-10-09
- Baseline Tag: `pre-layout-engine`
- Objective: Make "Tailor My Resume" produce a real, professional resume by adding layout-aware extraction, structure recovery, a professional composer, action-word sequence tailoring, and transparent before/after change tracking.

---

## Real File Paths
- **Tailor Page**: `src/features/suite/tailor/TailorResumePage.tsx`
- **Tailor Engine Core**: `src/lib/tailorEngine/engine.ts`
- **JD & Base Parser**: `src/lib/tailorEngine/parser.ts`
- **File Text Extraction**: `src/lib/tailorEngine/fileParser.ts` (and `src/lib/ats/fileExtractor.ts`)
- **Document Model**: `src/lib/tailorEngine/docModel.ts`
- **Preview & Templates**: `src/features/suite/tailor/components/PaperPreview.tsx` & `src/features/suite/tailor/components/templates/`
- **Input Component**: `src/features/suite/tailor/components/InputBox.tsx`
- **Review Cards & Toolbar**: `src/features/suite/tailor/components/SuggestionCard.tsx`, `ReviewTabBar.tsx`, `ExportToolbar.tsx`
- **Tests**: `src/__tests__/tailor/`

---

## Stages Progress

- [x] **Stage 1: Research & Local Style Guide**
  - [x] Initialize `docs/LAYOUT_ENGINE_LOG.md` and verify baseline
  - [x] Create `src/data/tailor/resume-style-guide.json` distilled from public guidance (Harvard OCS, MIT CAPD, Overleaf/Jake's Resume, Naukri Campus, Indeed)
  - [x] Commit Stage 1 to `main`

- [x] **Stage 2: Layout-Aware Text Extraction**
  - [x] PDF extraction: `pdf.js` y-coordinate line grouping, x-sorting, column detection, heading cues, and bullet preserving (`layoutExtractor.ts`)
  - [x] DOCX extraction: style cues (Heading 1/2, ListParagraph), preserve tab-separated dates
  - [x] Pre-parse normalization: Unicode NFKC, zero-width removal, bullet glyph normalization, hyphenation joining
  - [x] Status chip honesty: amber warning for < 2 sections ("Couldn't detect sections — recovering layout...") in `InputBox.tsx`
  - [x] Unit tests verified in `src/__tests__/tailor/stage2-extraction.test.ts` (5/5 passed, 27/27 suite total) and typecheck clean

- [x] **Stage 3: Structure Recovery Engine**
  - [x] Heading dictionary with aliases & canonical mapping (`headingDict.ts`)
  - [x] Inline segmenter for flattened/run-on text with boundary confidence scoring (`inlineSegmenter.ts`)
  - [x] Header parser: Name, headline, Indian/international phone regex, email, clean links, city (`headerParser.ts`)
  - [x] Education parser: institution, degree, branch, dates, reverse chronological, `(Expected)` tag (`educationParser.ts`)
  - [x] Skills parser: categorized rows (Programming, Web, Tools, Hardware/IoT, Databases, etc.), hidden skill detection from project bodies (`skillsParser.ts`)
  - [x] Projects parser: name, tech-stack line, action bullets (`projectsParser.ts`)
  - [x] Languages & Links parsers with Instagram/social offloading to leftOut (`languagesLinksParser.ts`)
  - [x] Invariants I1 (Conservation), I2 (No invention), I3 (Determinism) enforced in `recoveryEngine.ts`
  - [x] Synthetic fixtures: `flat-ece-fresher.ts` (Alex Kumar prompt 3.9) + 4 more synthetic fixtures with assertions (16/16 tests passing in `stage3-structure-recovery.test.ts`)

- [x] **Stage 4: Professional Composer & Page Renderer**
  - [x] `ResumeDocModel` as single source of truth across preview, DOCX, and PDF backed by layout recovery engine
  - [x] Presets: Fresher (Education first), Skills-first (hybrid), Professional (Experience first) with auto-selection and toolbar toggle
  - [x] Fit-to-page ladder and balanced spacing for sparse resumes (no empty bottom / squeezed top)
  - [x] Classic, Modern, Compact templates upgraded with categorized skills rows, clean bullets (no literal `- `), max 60 words per bullet, languages section, and show changes highlighting
  - [x] "Strengthen this resume" guidance checklist (`StrengthenChecklist.tsx`) with missing contact audit, metrics ratio, and interactive "+ Add to skills" for hidden skills
  - [x] DOCX export updated with dynamic section ordering and categorized skills
  - [x] Unit tests verified in `src/__tests__/tailor/stage4-composer-renderer.test.ts` (6/6 passed, 49/49 total suite)

- [x] **Stage 5: Action Word Engine & JD Tailoring**
  - [x] 4-slot bullet formula chips: Action ✓/✗, Object ✓/✗, Tool ✓/✗, Result ✓/✗ integrated into `SuggestionCard.tsx`
  - [x] Verb ladder data in `src/data/tailor/action-verbs.json` (7 categories with 8-10 verbs each, 61 total verbs)
  - [x] Edit sequence S1–S5 with light-touch budget (≤ 35% words changed per bullet, LCS word diff in `actionWordEngine.ts`)
  - [x] JD seniority mismatch advisory note (`checkSeniorityMismatch`) rendered dynamically in `TailorResumePage.tsx`
  - [x] Unit tests verified in `src/__tests__/tailor/stage5-action-word-engine.test.ts` (7/7 passed, 56/56 total suite)

- [ ] **Stage 6: Change Transparency UI**
  - [ ] Two-group change split: "Layout repairs" (auto-applied, undoable) vs. "Content edits" (needs review)
  - [ ] Every change card shows before/after word diff, reason, JD requirement, and words changed X of Y
  - [ ] Fixed reason text grammar templates
  - [ ] Low-confidence "Check layout" boundary reassignment panel
  - [ ] Contrast fixes: tab bar text meets 4.5:1 ratio

- [ ] **Stage 7: Comprehensive Testing & Verification**
  - [ ] Unit & invariant tests on all fixtures
  - [ ] Render tests (A4 layout constraints, max 60 words per block, no literal `- `)
  - [ ] Multi-resolution checks (1440, 1024, 768, 390)
  - [ ] Regression checks: ATS tests & existing Tailor tests pass

- [ ] **Stage 8: Final Documentation & Commit**
  - [ ] Write `docs/LAYOUT_ENGINE.md`
  - [ ] Full typecheck and `npm run build` verification
  - [ ] Final commit on `main`
