# HireFlow Document Ingestion Pipeline Specification

## 1. Architectural Overview
PDFs and rich text formats store positional drawing commands rather than sequential reading streams. Simple top-to-bottom sorting interleaves two-column resume layouts into unreadable fragments, propagating errors downstream into skill extraction and evidence scoring.

HireFlow implements a deterministic geometric reading pipeline:
1. **Geometric Item Normalization:** Normalizes ligatures (`fi`, `fl`, `ffi`), smart quotes, private-use bullets, soft hyphens (`\u00AD`), and end-of-line hyphenation breaks (`engi-\nneer` -> `engineer`).
2. **Dynamic Baseline Clustering:** Groups text fragments based on baseline vertical coordinates with dynamic tolerance proportional to font size ($\Delta y \le 0.35 \times \text{fontSize}$).
3. **Column & Whitespace Valley Detection:** Analyzes the distribution of horizontal coordinates ($X$). A page commits to two-column reading order only when:
   - At least two distinct vertical blocks exist.
   - Each column height is $\ge 25\%$ of the tallest column.
   - Gutter bridging text is $\le 15\%$ of total page items.
4. **Sidebar Handling:** Narrow sidebars ($\le 35\%$ width containing contact info and skills) are parsed as separate blocks and emitted prior to the main content block.
5. **Section Segmentation:** Case-insensitive dictionary matching supporting Indian engineering heading variants (e.g., *Academic Qualifications*, *Technical Skills*, *Positions of Responsibility*) with bounded typo tolerance (Levenshtein distance $\le 1$).
6. **Strict Non-Fabricating Entity Extraction:** Uses strict regex patterns to extract only verbatim data (emails, Indian $+91$ phones, LeetCode/GitHub links, CGPA with scale, boards, and normalized degrees).

---

## 2. Diagnostics & "What a Parser Sees" Preview
The ingestion pipeline returns an `IngestionDiagnostics` object displayed directly in the ATS Resume Roaster:
- `pageCount`: Total pages analyzed.
- `columnsPerPage`: Detected columns per page (e.g., `[2, 1]`).
- `readingOrderConfidence`: `high`, `medium`, or `low`.
- `sectionsFound`: List of identified resume sections.
- `entitiesFound`: Verified count of emails, phones, profiles, and degrees.
- `previewText`: The normalized plain-text view with section delimiters (`=== [SECTION: ...] ===`).

---

## 3. Known Limitations & Failure Recovery
1. **Scanned Image PDFs:** PDFs with no extractable text layer or under 200 characters trigger an immediate human-readable warning: *"This looks like a scanned image. OCR isn't supported; paste the text or upload a DOCX."*
2. **Corrupted / Raw Binary Streams:** Files containing unrendered PDF stream syntax (`%PDF-`, `endobj`, `stream`) trigger: *"We couldn't read this PDF's text. Try exporting again, upload a DOCX, or paste the text."*
3. **Complex Flowcharts / Canvas Graphics:** Visual skill bars, non-linear infographic resumes, and canvas drawings cannot be interpreted as structured text. Users are advised to submit standard single-column or clean two-column layouts.
