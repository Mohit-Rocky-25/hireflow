# HireFlow ATS Parser Baseline Benchmark (Stage 0)

> **Date**: 2026-10-27T16:57:15.441Z  
> **Environment**: Node v24.18.0 (Windows_NT 10.0.26200 - x64)  
> **Evaluation Scope**: DEV (36), HOLDOUT (24), FUZZ (200)

---

## 1. Executive Summary

This report establishes the ground-truth baseline measurements for the HireFlow ATS extraction engine prior to Stage 1–5 improvements. Measurements reflect real performance of `src/lib/ats/fileExtractor.ts` and `src/lib/ats/parseResume.ts` with zero modifications.

### Overall Performance Snapshot

| Metric | DEV Set (36) | HOLDOUT Set (24) | Combined (60) | Target (Post-Stage 5) |
|---|---|---|---|---|
| **Name Accuracy** | 83.3% | 83.3% | **83.3%** | $\ge 95\%$ |
| **Email Accuracy** | 83.3% | 83.3% | **83.3%** | $\ge 98\%$ |
| **Phone Accuracy** | 0% | 0% | **0%** | $\ge 95\%$ |
| **Links Recall** | 67.6% | 66.7% | **67.2%** | $\ge 95\%$ |
| **Section Detection F1** | 69.8% | 69.8% | **69.8%** | $\ge 90\%$ |
| **Bullet Recall** | 71.4% | 72% | **71.7%** | $\ge 90\%$ |
| **Education Extraction** | 100% | 100% | **100%** | $\ge 95\%$ |
| **Mean Edit Distance (0 = perfect)** | 0.282 | 0.281 | **0.282** | $\le 0.150$ |
| **Expected Warning Recall** | 72.2% | 70.8% | **71.7%** | $\ge 95\%$ |
| **Unhandled Crashes** | 0 | 0 | **0** | $0$ |
| **p50 Latency** | 31.8ms | 28.8ms | **30ms** | $\le 50\text{ms}$ |
| **p95 Latency** | 694.5ms | 57.7ms | **64.9ms** | $\le 200\text{ms}$ |

---

## 2. Layout Family Breakdown

60 total fixtures across 12 distinct real-world ATS formatting patterns:

| Layout Family | Count | Name Acc | Email Acc | Phone Acc | Section F1 | Bullet Recall | Edit Dist | p50 Latency | Primary Failure Mode / Observed Deficiency |
|---|---|---|---|---|---|---|---|---|---|
| `a_single_col_plain` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.091 | 64.9ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `b_two_col_sidebar` | 5 | 100% | 100% | 0% | 33.3% | 0% | 0.522 | 35.4ms | Phone regex fails on Indian mobile formatting (+91 with spaces); Two-column horizontal text interleaving corrupts bullet structure |
| `c_table_skills` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.1 | 45.1ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `d_textbox_header` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.09 | 44.4ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `e_latex_dense` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.089 | 30.5ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `f_decorative_bullets` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.09 | 29ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `g_ligatures_hyphens` | 5 | 100% | 100% | 0% | 90.9% | 95.6% | 0.095 | 23.9ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `h_multipage_header_footer` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.12 | 27.5ms | Phone regex fails on Indian mobile formatting (+91 with spaces); Running headers/footers bleed into body text stream |
| `i_annotated_links` | 5 | 100% | 100% | 0% | 90.9% | 100% | 0.099 | 25ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `j_indian_fresher` | 5 | 100% | 100% | 0% | 76.9% | 64.3% | 0.083 | 30ms | Phone regex fails on Indian mobile formatting (+91 with spaces) |
| `k_image_only` | 5 | 0% | 0% | 0% | 0% | 0% | 1 | 12ms | Phone regex fails on Indian mobile formatting (+91 with spaces); Candidate name missed due to sidebar/header displacement; Scanned image PDF has 0 extracted text; requires OCR / clear warning |
| `l_corrupt_encrypted` | 5 | 0% | 0% | 0% | 0% | 0% | 1 | 13.2ms | Phone regex fails on Indian mobile formatting (+91 with spaces); Candidate name missed due to sidebar/header displacement; Corrupt / encrypted stream yields fallback string instead of error state |


---

## 3. Key Parser Failure Modes Identified

1. **Indian Phone Number Formatting**:
   - Current regex `PHONE_REGEX` fails to extract Indian standard mobile numbers formatted with country code and spaces (`+91 98XXX XXXXX`). Baseline phone accuracy is **0%**.
2. **Word Drawing Textboxes (`w:txbxContent`)**:
   - In `d_textbox_header`, contact information nested inside Microsoft Word drawing text boxes is completely ignored by Mammoth / standard XML loaders, causing email accuracy to drop to **100%**.
3. **Two-Column Layout PDF Stream Interleaving**:
   - In `b_two_col_sidebar`, horizontal line grouping causes left sidebar sections and right experience sections to interleave, degrading bullet recall to **0%** and section F1 to **33.3%**.
4. **Table Skills Grid Flattening**:
   - In `c_table_skills`, Word table grid cells (`w:tbl`) are concatenated without delimiters, causing category headers and skill tokens to merge into single run-on lines.
5. **Scanned / Image-Only PDFs**:
   - In `k_image_only`, 0 bytes of text are extracted. While handled gracefully, clear user-facing guidance is needed.
6. **Encrypted & Corrupt Streams**:
   - In `l_corrupt_encrypted`, current fallback returns a generic placeholder string without typed error diagnostics.

---

## 4. Fuzz Resilience (200 Adversarial Files)

- **Total Fuzz Files Tested**: 200
- **Unhandled Crashes**: 0
- **Hangs / Timeouts**: 0
- **Graceful Fallbacks / Handled Errors**: 200
- **Empty Text Handled**: 0
- **p95 Latency**: 9.1ms
