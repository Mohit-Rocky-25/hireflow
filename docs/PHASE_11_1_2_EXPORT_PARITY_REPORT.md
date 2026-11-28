# Phase 11.1.2 — Field-Level Editor, Upload Guardrails, Viewport Scroll & Export Parity Report

## Scope
Remediated P2 editor gaps, export content mismatches (`Headline`, `Technologies`, blank title suppression), upload rejection / progress states, and navbar overlap across `src/features/tailor/components/TailorDocumentCanvas.tsx`, `src/features/tailor/export/tailorExportAdapter.ts`, `src/lib/tailor/export/pdfExporter.ts`, `src/lib/tailor/export/docxExporter.ts`, `src/features/tailor/components/TailorEntryView.tsx`, and `src/features/tailor/TailorWorkspacePage.tsx`.

---

## Defect 1 — Missing Header/Entry Field Editors & Empty Custom Section Dead-End
- **Original defect:** Users could not edit candidate `headline` or individual contact links (`linkedin`, `github`, `portfolio`), could not edit `entry.title`, `entry.organization`, `entry.dateRange`, `entry.location`, or `entry.technologies`, could not add an entry to a newly created empty custom section, and could not add/delete/reorder individual bullets inside an entry.
- **Source file:** `src/features/tailor/components/TailorDocumentCanvas.tsx`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** Canvas edit controls previously covered only bullet text and section titles.
- **Exact fix:**
  - Added full candidate header editor (`fullName`, `headline`, `email`, `phone`, `location`, `linkedin`, `github`, `portfolio`) in `TailorDocumentCanvas.tsx` backed by `updateHeader`.
  - Added entry field editor (`title`, `organization`, `dateRange`, `location`, comma-separated `technologies`), `Add entry to <section>` modal/form (unblocking newly added empty custom sections), and per-bullet add / edit / move-up / move-down / delete controls.
  - Added live estimated page & word count readout (`~N page(s)`).
- **New regression test:** `e2e/phase11_1_2TailorRegressions.spec.ts` edits `Candidate headline`, adds custom section `Open Source`, adds entry `Go Retry Library` with `Go, PostgreSQL`, and validates rendered exports.
- **Actual test result:** Passed in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Multi-column WYSIWYG drag-and-drop block splitting across exact pixel page boundaries is approximated via word/entry heuristics (`Estimated page length`).

## Defect 2 — Canvas vs Snapshot vs PDF vs DOCX vs Markdown Parity Drops (`Headline`, `Technologies`, Duplicate Title)
- **Original defect:** `headline` and `entry.technologies` appeared inconsistently or were dropped between Canvas, plain-text `serializeDocumentToText`, Markdown, PDF (`pdfExporter.ts`), and DOCX (`docxExporter.ts`), and custom entries with matching `secondaryTitle` rendered duplicate headings.
- **Source file:** `src/features/tailor/export/tailorExportAdapter.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/export/pdfExporter.ts`, `src/lib/tailor/export/docxExporter.ts`, `src/features/tailor/components/TailorDocumentCanvas.tsx`
- **Root cause:** Adapter metadata dropped `headline` and `entry.technologies`, and PDF/DOCX exporters lacked `headline` / `metadata.technologies` serialization and blank `primaryTitle` suppression.
- **Exact fix:**
  - Rendered `entry.technologies` (`Technologies: ...`) on Canvas, included `headline` + `technologies` in `serializeDocumentToText` / `toExportAdapterModels` (`metadata: { technologies }`), suppressed duplicate blank `primaryTitle` rendering, and updated `pdfExporter.ts` and `docxExporter.ts` to emit both `headline` and `Technologies: ...`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` (extracting text via `pdfjs-dist` and `jszip` XML) and `e2e/phase11_1_2TailorRegressions.spec.ts` (browser-downloaded `.pdf` and `.docx` inspection).
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`).
- **Remaining limitation:** Font metrics differ slightly between browser preview CSS and `pdf-lib` Helvetica/Times-Roman fallback metrics.

## Defect 3 — Corrupt/Empty/Oversized Upload Silence & Sticky Navbar Scroll Overlap on Session Open
- **Original defect:** Corrupt/empty/oversized uploads (<40 extracted characters or >5 MB or 0 bytes) lacked clear blocking feedback & upload progress status, and initializing a workspace from a scrolled `TailorEntryView` left the new workspace `<h1>` behind the fixed `PublicNavbar`.
- **Source file:** `src/features/tailor/components/TailorEntryView.tsx`, `src/features/tailor/TailorWorkspacePage.tsx`
- **Root cause:** `handleFileUpload` lacked size/empty/min-text alerts and busy status, and initial `useEffect` `window.scrollTo` ran asynchronously after first paint (also susceptible to smooth scroll behavior).
- **Exact fix:**
  - Added `>5 MB`, `0-byte`, unsupported-extension, and `<40 chars` readable-text error alerts (`role="alert"`) plus an active parsing progress banner (`status`) in `TailorEntryView.tsx`.
  - Replaced post-paint scroll reset with synchronous `useLayoutEffect` calling `document.documentElement.scrollTop = 0`, `document.body.scrollTop = 0`, and `window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })` in `TailorWorkspacePage.tsx`.
- **New regression test:** `e2e/phase11_1_2TailorRegressions.spec.ts` uploads `corrupt.pdf` (asserts `<alert>` visible), scrolls entry view to `y=700`, initializes paste, and asserts `#main-content h1` `top >= nav bottom`.
- **Actual test result:** Passed in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Scanned image-only PDFs without an embedded OCR text layer cannot be extracted client-side and trigger the `<40 chars` corrupt/unreadable alert instructing the user to paste text.
