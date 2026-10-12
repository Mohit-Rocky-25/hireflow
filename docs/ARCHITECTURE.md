# HireFlow Resume Tailor Engine — 7-Stage Pipeline Architecture

## Overview
The Resume Tailor Engine transforms raw resume input (plain text, PDF, DOCX, or JSON) into top-tier, recruiter-grade, ATS-safe, mathematically formatted resumes for any professional domain. The pipeline is strictly deterministic, modular, and unit-testable across 7 sequential stages.

```
+-----------------------------------------------------------------------------------+
|                                  INPUT RESUME                                     |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
 [Stage 1: PARSE]       Raw Input (Text/PDF/DOCX) -> Segmented Structural Blocks
                                         |
                                         v
 [Stage 2: NORMALIZE]   Raw Blocks -> Canonical Typed AST (Validated via Zod)
                                         |
                                         v
 [Stage 3: ROUTE]       Confidence-based Block Routing -> Section Assignment (>=0.7)
                        Low-confidence blocks (<0.7) -> Needs-Review List (Zero Silent Loss)
                                         |
                                         v
 [Stage 4: POLISH]      Deterministic Grammar/Style/Date Harmonizer (LLM-Optional with Faithfulness Guard)
                                         |
                                         v
 [Stage 5: LAYOUT]      Design Tokens + Preset Ordering + Dynamic Page-Fit Iterative Loop
                                         |
                                         v
 [Stage 6: VALIDATE]    ATS Compatibility, Lint Rules, Quality Scorer (0-100) & Non-Blocking Suggestions
                                         |
                                         v
 [Stage 7: EXPORT]      Render Engine: Live Preview, Clean Print CSS/PDF, DOCX
```

---

## The 7 Pipeline Stages

### Stage 1: PARSE (`/engine/parse`)
- Accepts raw text, PDF layout streams, DOCX XML, or structured JSON.
- Extracts lines, indentations, bullets, and section boundaries without discarding punctuation or tokens.
- Emits raw `ParsedBlock[]` with line indexes and boundary flags.

### Stage 2: NORMALIZE (`/engine/normalize`)
- Converts raw blocks into the canonical `ResumeSchema` backed by Zod.
- Enforces atomic typing: skills items are atomic token strings, bullets are isolated array elements.
- Strips malformed delimiters (`.,`, `..`, orphan colons) while preserving user content verbatim.

### Stage 3: ROUTE (`/engine/route`)
- Classifies each block into its true section (`header`, `summary`, `education`, `experience`, `projects`, `skills`, `achievements`, `leadership`, `certifications`, `custom`).
- Assigns a confidence score ($0.0 \le c \le 1.0$) to each classification.
- **Invariants**:
  - Blocks with action verbs + titles route to `projects` or `experience`, never `skills`.
  - Blocks with score $< 0.70$ route to `needs_review` list (Zero Silent Loss).
  - Merges single-item skill orphan categories into neighboring domain categories.

### Stage 4: POLISH (`/engine/polish`)
- Purely deterministic text cleanup:
  - Bullets capitalized, begin with action verbs, end with uniform period.
  - Fixes double punctuation, trims stray whitespace.
  - Normalizes date ranges to uniform en-dash format (e.g., `Jan 2026 – Present`).
  - Bullet length checked (12–28 words ideal); flags fragments or excessive run-ons.
- **Optional LLM Boundary**: LLM may only rephrase bullets/summary; must pass token-containment Faithfulness Check. Never fabricates metrics or tools.

### Stage 5: LAYOUT (`/engine/layout`)
- Driven by `tokens.ts` (single sans-serif typography, unified font sizes, 0.6in margins).
- Implements balanced header contact wrapping to prevent orphan links.
- Emits layout tree with measurable heights and section orders.
- Runs dynamic Page-Fit loop: shrinks spacing, then font to 9.5pt, then margins to 0.5in before dropping bullets with flags.

### Stage 6: VALIDATE (`/engine/validate`)
- Runs rule-based linter and ATS scanner.
- Computes comprehensive Resume Quality Score (0–100) with category breakdown.
- Emits non-blocking actionable suggestions (e.g., missing metrics, missing education dates).

### Stage 7: EXPORT (`/engine/export`)
- Unified single-render path:
  - React/DOM Live Preview.
  - Exact A4/Letter Print CSS.
  - True Microsoft Word `.docx` generator via docx.js.
