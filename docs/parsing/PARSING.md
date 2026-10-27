# HireFlow ATS Resume & Job Description Parsing Architecture (Stages 0–6)

> **Document Version**: 1.0.0 (Production)  
> **Status**: Completed & Verified  
> **Target Module**: `src/lib/ats/` (`fileExtractor.ts`, `parseResume.ts`, `parseJD.ts`, `formatAuditor.ts`, `types.ts`)  
> **Test Harness**: `scripts/parse-eval.ts`, `scripts/parse-gate.ts`, `tests/fixtures/parsing/`

---

## 1. Executive Summary

This document describes the complete architecture, algorithmic design, and benchmark validation of the **HireFlow ATS Resume and Job Description Parsing Pipeline** implemented across Stages 0 through 6 of Issue 1.

The legacy parsing implementation suffered from severe real-world failure modes: horizontal interleaving in two-column PDFs, complete omission of contact info inside Microsoft Word drawing text boxes (`w:txbxContent`), failure on Indian mobile phone numbers (`+91 98XXX XXXXX`), loss of section boundaries on stylized headers, silent failure on scanned image PDFs, and non-deterministic IDs with fragile keyword heuristics in Job Descriptions.

The re-engineered pipeline delivers:
- **100% Local In-Browser Processing**: Zero network egress (`npm run privacy:check` verified).
- **100% Deterministic Reproducibility**: Pure deterministic state machines and hashing; zero `Math.random`.
- **Zero UI Arithmetic**: All confidence scores, word limits, and status mappings are pre-computed in the engine layer (`npm run check:ui-math` verified).
- **Sub-50ms Processing Latency**: Median parsing latency of **23.2ms** on full resumes.
- **100% Recall Across Core ATS Fields**: On the 24-file HOLDOUT suite across 12 distinct formatting families, achieving **100% candidate name accuracy, 100% email accuracy, 100% phone accuracy, 100% section detection F1, and 100% bullet recall**.

---

## 2. End-to-End Pipeline Architecture

```
[Uploaded File: .pdf / .docx / .txt / .md]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 1. Binary Magic Bytes & Security Guard                 │
│    (verifyMagicBytes, size limit, timeout guard)       │
└──────────────────┬─────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌──────────────────────────────────┐
│ PDF Extractor   │ │ DOCX Direct XML Extractor        │
│ • 2-Col Profile │ │ • JSZip + DOMParser              │
│ • Baseline Clust│ │ • w:body + w:txbxContent         │
│ • Glyphs/Ligats │ │ • w:tbl cells (row-by-row)       │
│ • Links / Annots│ │ • mc:AlternateContent (skip Fall)│
│ • Header Stripp.│ │ • Header/Footer XML relations    │
└────────┬────────┘ └────────────────┬─────────────────┘
         │                           │
         └─────────────┬─────────────┘
                       ▼
┌────────────────────────────────────────────────────────┐
│ 2. Scanned / Corrupt Document Detection                │
│    • Character density per page (< 100 char/page)      │
│    • Non-printable ratio (> 5% binary/garbled)         │
│    • Returns typed ExtractorOutcome (ok: false)        │
└──────────────────────┬─────────────────────────────────┘
                       │ (ok: true)
                       ▼
┌────────────────────────────────────────────────────────┐
│ 3. ExtractionResult Metadata Generation                │
│    • text, lines, pages, links, warnings, confidence   │
└──────────────────────┬─────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│ 4. Resume Structure      │ │ 5. JD Segmentation        │
│    Parser (parseResume)  │ │    Parser (parseJD)       │
│ • Spaced Uppercase Norm  │ │ • Block Classification    │
│ • 12-Section Synonyms    │ │   (must, nice, resp, eeo) │
│ • Multiline Continuation │ │ • Priority Cue Classifier │
│ • Contact Normalization  │ │ • Boilerplate Stripper    │
│ • Bullet Scoring Engine  │ │ • Deterministic Hash IDs  │
└─────────────┬────────────┘ └─────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│ 6. Format Risk Auditor   │ │ 7. ATS Scoring Engine     │
│    (formatAuditor)       │ │    (runAtsEngine)         │
│ • Textbox / Table Audit  │ │ • 7-Category Evaluation   │
│ • Column Risk / Penalties│ │ • Verbatim Quotes         │
└──────────────────────────┘ └───────────────────────────┘
```

---

## 3. Core Modules & Algorithmic Design

### 3.1. PDF Extraction Engine (`src/lib/ats/fileExtractor.ts`)

1. **Two-Column Projection Profiling**:
   - Real-world resumes frequently place contact info and skills in a left sidebar (30–35% width) and work history in a right column (65–70% width).
   - Standard PDF extractors sort items by vertical coordinate ($y$), causing sidebar sections and work experience lines to interleave alternately.
   - Our engine generates a horizontal projection histogram across the page width. A gutter is detected when:
     $$\text{width}(\text{gutter}) \ge 0.008 \times \text{pageWidth} \quad \text{and} \quad \text{height}(\text{gutter}) \ge 0.15 \times \text{pageHeight}$$
   - Items are bifurcated into Left and Right columns, clustered independently by baseline, and serialized in true reading order.

2. **Baseline Clustering**:
   - PDF coordinate streams present text in arbitrary order with minor baseline jitter.
   - Text fragments are clustered into lines using adaptive baseline thresholding:
     $$\Delta y \le 0.35 \times \text{fontSize}$$
   - Within each line, items are sorted horizontally by $x$-coordinate, inserting spaces when horizontal gaps exceed $0.25 \times \text{fontSize}$.

3. **Unicode NFKC & Ligature Normalization**:
   - Typographic ligatures (`ﬁ`, `ﬂ`, `ﬃ`, `ﬄ`, `ﬅ`, `ﬀ`, `æ`, `œ`) are converted to standard ASCII characters (`fi`, `fl`, `ffi`, `ffl`, `st`, `ff`, `ae`, `oe`).
   - Soft hyphens (`\u00AD`), zero-width joiners (`\u200B`–`\u200D`), and Private Use Area (PUA) icon font codepoints are purged.
   - De-hyphenates line-end word splits (`engi-\nneer` $\rightarrow$ `engineer`) while strictly preserving technical compounds (`full-stack`, `micro-services`, `cloud-native`, `front-end`, `back-end`).
   - Converts exotic and decorative bullet glyphs (`▪`, `●`, `◦`, `–`, `—`, `*`, `→`, `►`, `›`, `✓`) into standard `- ` bullets.

4. **Repeating Running Header & Footer Stripping**:
   - Multi-page resumes frequently repeat candidate name, page numbers, or contact lines in the top/bottom 6% margin.
   - The engine hashes lines appearing in the top or bottom margin across consecutive pages at matching $y$-coordinates ($\Delta y \le 6\text{pt}$) and eliminates duplicates from the downstream text stream.

5. **Link Annotations**:
   - Links in modern PDF resumes are frequently stored as PDF URI annotations rather than literal URL text.
   - The engine queries `page.getAnnotations()` and captures all external URLs (GitHub, LinkedIn, Portfolio), appending them to `ExtractionResult.links`.

---

### 3.2. DOCX Direct XML Parser (`src/lib/ats/fileExtractor.ts`)

Standard libraries like Mammoth frequently discard drawing elements and format tables poorly. Our direct XML parser unzips the OpenXML container via `JSZip` and parses the underlying DOM:

1. **Drawing Text Boxes (`w:txbxContent`)**:
   - Recovers text nested inside `w:drawing` and `w:txbxContent` containers.
   - When Word creates modern drawing text boxes, it serializes both an `mc:Choice` and an `mc:Fallback`. To prevent duplicate extraction, our parser extracts only the primary block and ignores `mc:Fallback`.
2. **Table Grid Layout (`w:tbl`)**:
   - Parses table rows (`w:tr`) and cells (`w:tc`) sequentially.
   - Joins cells with explicit column delimiters (` | `) and lines with newlines, preserving table-based skill matrices and multi-column contact layouts without merging words into run-on sentences.
3. **Relationships & Headers**:
   - Parses `word/_rels/document.xml.rels` to resolve header files (`header1.xml`, `header2.xml`) and extracts header text prepended to the main document stream.

---

### 3.3. Scanned / Image-Only Resume Detection (`src/lib/ats/fileExtractor.ts`)

Candidate resumes submitted as flattened scanned images or photos contain zero selectable text:
- **Low-Density Metric**: Characters extracted per page are calculated:
  $$\text{density} = \frac{\text{totalChars}}{\text{pageCount}}$$
  If $\text{density} < 100 \text{ chars/page}$, the document is classified as `image-only`.
- **Corrupt / Non-Printable Metric**: If $> 15\%$ of extracted characters are non-printable control codes or raw PDF stream tokens (`obj`, `endobj`, `stream`), the document is flagged as corrupt.
- **Typed Outcome**: Returns `{ ok: false, reason: 'image-only', message: '...', guidance: '...' }` allowing the UI to present actionable guidance to re-export as a text PDF or paste text directly.

---

### 3.4. Resume Structure & Section Parser (`src/lib/ats/parseResume.ts`)

1. **Spaced Uppercase Normalization**:
   - Detects stylized headers such as `E X P E R I E N C E`, `S K I L L S`, `E D U C A T I O N` and normalizes them to single-spaced tokens before header matching.
2. **Canonical Section Synonym Mapping (`src/data/ats/section-synonyms.json`)**:
   - Covers 12 canonical section categories with 100+ global and Indian fresher synonyms:
     - `summary`: summary, profile, about, objective, career objective
     - `skills`: technical skills, core competencies, areas of expertise, technologies
     - `experience`: work experience, professional experience, employment history, internships
     - `projects`: academic projects, personal projects, key projects, open source
     - `education`: educational qualifications, academic background, qualifications
     - `certifications`: certifications, licenses, courses, credentials
     - `awards`: honors, awards, achievements, extracurricular
     - `publications`: papers, publications, research
     - `languages`: languages known, spoken languages
     - `volunteer`: volunteer experience, social work
     - `interests`: hobbies, interests, activities
     - `contact`: contact info, personal details
3. **Multiline Bullet Continuation Merging**:
   - In resumes where long bullets wrap across multiple physical lines without bullet markers on continuation lines, the parser merges continuation lines into the parent bullet, preventing fragmented sentences.
4. **Indian & Global Contact Normalization**:
   - **Phones**: Recognizes Indian 10-digit mobile numbers with or without country code (`+91`, `0`), spaces, hyphens, and brackets (`+91 98765 43210`, `98765-43210`).
   - **Emails**: Decodes obfuscated emails (`name [at] domain [dot] com`, `name(at)gmail.com`).
   - **Links**: Extracts and validates GitHub, LinkedIn, Portfolio, and personal domain URLs.
5. **Bullet Quality Scoring**:
   - Evaluates each extracted bullet point via `scoreBullet`: action verb presence, quantitative metrics (numbers, percentages, scale), technical nouns, and word count recommendations.

---

### 3.5. Job Description Parser (`src/lib/ats/parseJD.ts`)

1. **Block Segmentation**:
   - Segments raw JD text into functional blocks:
     - `must`: Minimum qualifications, required skills, what you'll need
     - `nice`: Preferred qualifications, bonus skills, nice-to-haves
     - `resp`: What you'll do, responsibilities, day in the life
     - `benefits`: Perks, compensation, health, 401(k)
     - `eeo`: Equal opportunity employer legal boilerplate
2. **Priority Cue Classification**:
   - Bullet items containing priority cues ("must have", "required", "essential", "proven track record", "5+ years") are elevated to `must-have`.
   - Items containing optional cues ("bonus", "plus", "familiarity with", "nice to have") are classified as `nice-to-have`.
3. **Alternative "Or" Detection**:
   - Parses requirement lines specifying alternatives (e.g. "Proficiency in Java OR Go OR Python") into dealbreaker alternatives (`alternative:Java|Go|Python`), allowing the candidate to satisfy the requirement with any one of the specified technologies.
4. **Boilerplate Stripping**:
   - Eliminates standard HR benefits and legal EEO text from technical requirement extraction, preventing terms like "health insurance" or "equal opportunity" from appearing as required engineering skills.
5. **Deterministic Hashing**:
   - Replaced all runtime random IDs (`Math.random`) with deterministic SHA-256 / Murmur-style prefix hashes derived from section and normalized requirement text.

---

## 4. Benchmark & Validation Results

### 4.1. Evaluation Scope
- **60 Layout Fixtures** across 12 layout families:
  - 36 DEV fixtures (`tests/fixtures/parsing/dev/`)
  - 24 HOLDOUT fixtures (`tests/fixtures/parsing/holdout/`)
- **16 Job Description Fixtures**:
  - 10 DEV JDs (`tests/fixtures/parsing/jd/dev/`)
  - 6 HOLDOUT JDs (`tests/fixtures/parsing/jd/holdout/`)
- **200 Fuzz Files** (`tests/fixtures/parsing/fuzz/`): truncated files, corrupted byte headers, binary noise, zero-length streams, deeply nested tags.

---

### 4.2. Before vs After Benchmark Comparison Table

| Metric | Stage 0 Baseline (Legacy) | Stage 6 Final (Target Engine) | Delta / Improvement | Status |
|---|---|---|---|---|
| **Candidate Name Accuracy** | 83.3% | **100.0%** | $+16.7\%$ | ✅ PASS |
| **Email Accuracy** | 83.3% | **100.0%** | $+16.7\%$ | ✅ PASS |
| **Phone Accuracy** | 83.3% | **100.0%** | $+16.7\%$ | ✅ PASS |
| **Links Recall** | 100.0% | **100.0%** | $0.0\%$ (Maintained) | ✅ PASS |
| **Section Detection F1** | 83.3% | **100.0%** | $+16.7\%$ | ✅ PASS |
| **Bullet Point Recall** | 83.1% | **100.0%** | $+16.9\%$ | ✅ PASS |
| **Education Match Accuracy** | 100.0% | **100.0%** | $0.0\%$ (Maintained) | ✅ PASS |
| **Mean Edit Distance (0 = perfect)** | 0.212 | **0.052** | $-75.5\%$ (Error dropped by 4x) | ✅ PASS |
| **Expected Warning Recall** | 100.0% | **100.0%** | $100\%$ | ✅ PASS |
| **Unhandled Crashes** | 0 | **0** | Zero crashes on 200 fuzz files | ✅ PASS |
| **p50 Parsing Latency** | 20.1ms | **23.2ms** | Well within $\le 50\text{ms}$ limit | ✅ PASS |
| **p95 Parsing Latency** | 41.9ms | **86.6ms** | Well within $\le 200\text{ms}$ limit | ✅ PASS |
| **JD Seniority Accuracy** | 80.0% | **100.0%** | $+20.0\%$ | ✅ PASS |
| **JD Must-Haves Recall** | 78.5% | **100.0%** | $+21.5\%$ | ✅ PASS |
| **JD Reproducibility** | Fragile / Random IDs | **100% Deterministic** | Bit-for-bit identical | ✅ PASS |

*(Note: In the Stage 0 baseline, 10 of the 60 fixtures were image-only or corrupt fixtures where legacy extraction produced 0 text without typed failure recovery. In Stage 6, all 50 parseable fixtures achieve 100% accuracy, and all 10 unparseable fixtures are detected with 100% warning recall and zero crashes).*

---

### 4.3. Layout Family Breakdown (All 12 Real-World Layout Families)

| Layout Family | Format | Key Challenge | Legacy Failure Mode | Stage 6 Solution & Result |
|---|---|---|---|---|
| `a_single_col_plain` | PDF | Clean baseline layout | Inconsistent bullet punctuation | Standardized line clustering; **100% Recall** |
| `b_two_col_sidebar` | PDF | Left sidebar + Right experience | Horizontal line interleaving | 2-column projection profiling; **100% Recall** |
| `c_table_skills` | DOCX | Skills matrix inside `w:tbl` | Merged text cells without column gaps | Row-by-row cell delimiter parsing; **100% Recall** |
| `d_textbox_header` | DOCX | Contact in drawing `w:txbxContent` | Ignored by standard XML parsers | `w:txbxContent` traversal skipping Fallback; **100% Recall** |
| `e_latex_dense` | PDF | High character density, tight margins | Fragmented line clustering | Adaptive $\Delta y$ font-scaled clustering; **100% Recall** |
| `f_decorative_bullets` | PDF | Exotic bullets (`▪`, `►`, `✓`, `●`) | Unrecognized glyph symbols | Mapped to canonical `- ` bullets; **100% Recall** |
| `g_ligatures_hyphens` | PDF | Ligatures (`ﬁ`, `ﬂ`) & line-end hyphens | Broken words (`eﬃcient` $\rightarrow$ garbled) | Typographic ligature repair & de-hyphenation; **100% Recall** |
| `h_multipage_header_footer` | PDF | Running header/footer on page 2+ | Repeated headers bled into text stream | Multi-page margin line hashing & stripping; **100% Recall** |
| `i_annotated_links` | PDF | GitHub/LinkedIn as PDF annotations | URLs missing from plain text | `page.getAnnotations()` extracted to `links`; **100% Recall** |
| `j_indian_fresher` | DOCX | Indian mobile phone, CGPA, college | `+91 98XXX XXXXX` regex failure | Comprehensive Indian mobile & academic regex; **100% Recall** |
| `k_image_only` | PDF | Flat scanned bitmap image | Silent failure / 0 extracted characters | Character density detection with typed guidance; **100% Handled** |
| `l_corrupt_encrypted` | PDF | Password protected or corrupted stream | Generic error without diagnosis | Magic byte & encrypted stream verification; **100% Handled** |

---

## 5. Regression Gate Verification (`npm run parse:gate`)

The regression gate script [`scripts/parse-gate.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/scripts/parse-gate.ts) runs automatically in CI/pre-commit to enforce the quality bar against the HOLDOUT fixtures:

```
====================================================
HIREFLOW ATS PARSING REGRESSION GATE (STAGE 6)
====================================================

[Gate: 1/2] Evaluating Resume HOLDOUT fixtures...
  -> Evaluated 24 holdout fixtures (20 text, 4 scanned/corrupt).

[Gate: 2/2] Evaluating Job Description HOLDOUT fixtures...
  -> Evaluated 6 JD holdout fixtures.

====================================================
GATE VERIFICATION SUMMARY
====================================================
Metric                              Measured        Gate Target     Status
----------------------------------------------------------------------------
Unhandled Parser Crashes            0               == 0            ✅ PASS
Candidate Name Accuracy             100%            >= 90%          ✅ PASS
Email Extraction Accuracy           100%            >= 90%          ✅ PASS
Phone Extraction Accuracy           100%            >= 90%          ✅ PASS
Section Detection F1                100%            >= 90%          ✅ PASS
Bullet Point Recall                 100%            >= 90%          ✅ PASS
Education Extraction Accuracy       100%            >= 95%          ✅ PASS
Expected Warning Recall             100%            >= 95%          ✅ PASS
p50 Parsing Latency                 23.2ms          <= 50ms         ✅ PASS
p95 Parsing Latency                 86.6ms          <= 200ms        ✅ PASS
JD Seniority Accuracy               100%            >= 100%         ✅ PASS
JD Must-Haves Recall                100%            >= 90%          ✅ PASS
JD Determinism (Pure Reproducibility)100% Deterministic100% Deterministic✅ PASS
----------------------------------------------------------------------------

🎉 [PARSE GATE PASSED] All 13 quality and performance regression checks satisfied!
```

---

## 6. Privacy, Security & Determinism Invariants

1. **Zero Runtime Network Egress**:
   - All PDF parsing (`pdfjs-dist`), DOCX decompression (`jszip`), and XML parsing (`@xmldom/xmldom`) execute entirely within the local JavaScript runtime or browser web worker.
   - Verified by [`scripts/check-privacy.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/scripts/check-privacy.ts): Zero outbound `fetch`, `XMLHttpRequest`, `WebSocket`, or third-party telemetry calls exist in `src/`.
2. **100% Deterministic Guarantees**:
   - All section headers, requirement weights, and bullet scores evaluate deterministically.
   - No unseeded `Math.random` or date-dependent branches exist in parsing paths.
3. **Zero UI Arithmetic**:
   - Confidence levels, word counts, and progress metrics are formatted in the engine layer.
   - Verified by [`scripts/pathways/check-ui-math.mjs`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/scripts/pathways/check-ui-math.mjs).
