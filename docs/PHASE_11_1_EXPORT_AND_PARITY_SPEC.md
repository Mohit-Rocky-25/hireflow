# HireFlow — Phase 11.1 Export & Format Parity Specification

**Modules:**
- [tailorExportAdapter.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/export/tailorExportAdapter.ts)
- [pdfExporter.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/tailor/export/pdfExporter.ts)
- [docxExporter.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/tailor/export/docxExporter.ts)
- [unicode.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/resume/layout/unicode.ts)

## Parity & Safety Fixes Implemented
1. **Validation Gate Enforcement:** `TailorWorkspacePage.handleExport` runs `runValidation()` prior to exporting PDF, DOCX, or Markdown and aborts with `role="alert"` if any factual or document blocking issue exists.
2. **PDF WinAnsi Resilience:** `sanitizeTextForPdf` transliterates diacritics (`NFKD`), quotes/hyphens, arrows (`→`, `⇒`), checkmarks (`✓`, `✔`), and safely replaces remaining out-of-range code points so `pdf-lib` Standard14 fonts never crash.
3. **DOCX Paper Size & Location Deduplication:** `generateDocxBlob` applies exact twip dimensions for `a4` vs `letter` from `layoutSettings.paperSize`; `toExportAdapterModels` passes `entry.organization` without duplicating `entry.location` into `secondaryTitle`.
4. **Skills Formatting Parity:** Both PDF and DOCX suppress redundant `"Skills: "` / `"Core: "` prefixes beneath headings when flat skill lists are rendered.
5. **Markdown Fidelity & Zero Identifier Leaks:** `serializeDocumentToMarkdown` produces valid Markdown (`# Candidate`, `## Section`, `### Entry`, `- Bullet`) free of internal IDs (`fact_`, `ctx-`, `claim_`, `b_exp_`, `b_proj_`) and editor provenance tags.
