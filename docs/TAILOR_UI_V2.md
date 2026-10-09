# Tailor My Resume (v2) — Architecture & Release Documentation

## Overview
**Tailor My Resume** (`/tools/tailor`) has been re-architected to deliver zero-overlap responsive navigation, deterministic non-fabrication revisions, pure JavaScript word-level diffing, a live white A4 paper canvas preview, and professional ATS-safe DOCX/PDF export.

---

## 1. Resolved Engine Bugs (B1 – B8)

| Bug ID | Problem | Resolution |
|---|---|---|
| **B1** | Weak openers leaving passive phrasing or dangling gerunds (e.g. *"Responsible for developing..."*). | Implemented 80+ gerund-to-past-tense dictionary (`verbs.ts`) with automatic US vs. UK spelling convention detection (`Optimized` vs. `Optimised`). |
| **B2** | Rationale text hardcoding generic descriptions without naming the applied verb. | `TailorSuggestion` stores `{ appliedVerb }` and dynamically formats rationale: `Action verb 'Developed' replaces passive duty phrasing...` |
| **B3** | Unpolished grammar, accidental double words (*"the the"*), missing terminal punctuation, and unpunctuated participles. | Deterministic `applyGrammarGate` (`grammar.ts`) enforces capitalization, deduplicates adjacent repeated words, inserts commas before participial result clauses, and guarantees single terminal periods. |
| **B4** | Bullets without metrics left unguided. | Added inline **Add Context** flow with quick tap-chips (`reduced latency by __%`, `served __ users`, `saved __ hours/week`). Keeps cards in `Needs input` until filled. |
| **B5** | Unclear distinction between direct duties and shared/team participation. | Duty phrases (*"responsible for"*) convert directly to strong verbs. Participation phrases (*"helped with"*) split into **Honest** (`Facts ✓`, default) and **Direct Ownership** (`Ownership ⚠`) options. |
| **B6** | Nice-to-haves (e.g., Redis *"strong plus"*) incorrectly bucketed as must-haves. | Hardened JD overview parser (`parser.ts`) with prioritized bullet detection and regex classification for *"strong plus"*, *"bonus"*, *"preferred"*, *"nice to have"*. |
| **B7** | Grammatical errors like *"1 skills"*. | Added deterministic `pluralize` helper in `parser.ts` to ensure clean pluralization throughout the UI. |
| **B8** | Repetitive opening verbs within the same role or project entry. | Added section-scoped verb tracking (`verbs.ts`) that automatically selects unused action synonyms (e.g., swapping duplicate `Built` for `Engineered` or `Architected`). |

---

## 2. UI / UX Upgrades

### Unified 64px Header
- **Target Size**: Minimum 44px touch targets on Back and Home buttons.
- **Sweep Effect**: Black press sweep effect on button interactions.
- **Breadcrumb**: Centered `Decision Suite / Tailor My Resume`.
- **Title Behavior**: Full H1 hero scrolls smoothly; compact title fades into the sticky header via an `IntersectionObserver`.
- **Zero Overlap**: Tested across 1440px, 1024px, 768px, and 390px viewports with 0 layout collisions.

### Two-Column Input Panel
- Numbered cards: **1 Your resume** & **2 Target job**.
- 15px monospace textareas with 1.6 line height and 260px minimum height.
- Quick Load searchable dropdown featuring company and role presets.
- 52px tall primary CTA with loading state and disabled state feedback.

### Match Panel & Quality Rubric
- Dual gauges: **Base Match** vs. **Projected Match** with dynamic delta badge.
- Requirement chips: Solid emerald for matched skills, outlined rose for missing skills.
- Resume Quality summary calculating average bullet strength (0–100 rubric), metrics ratio, and opening verb variety.

### Review Experience & Word Diff
- **Sticky 44px Tab Bar**: `All`, `Rephrase`, `Skills`, and `Add Context` with live counts and progress indicator (`X of Y reviewed`).
- **Review Next**: Auto-scrolls smoothly to the next pending item.
- **Bulk Actions**: `Accept All` (skips incomplete context items) and `Reject All` with a 6-second undo toast.
- **Word-Level Diff**: Pure JS Longest Common Subsequence (LCS) diff rendering deleted words in red strikethrough and revisions in emerald highlights.
- **Inline Editor**: Allows direct fine-tuning of any bullet before acceptance.

### White A4 Canvas & Professional Export
- **Paper Canvas**: Realistic `#ffffff` sheet with subtle depth shadows and A4 dimensions.
- **3 Templates**:
  1. **Classic**: Traditional serif typography with horizontal section dividers.
  2. **Modern**: Sans-serif layout with indigo accent markers and metadata tags.
  3. **Compact**: High-density single-page format for constrained resumes.
- **Toggles**:
  - `Show changes`: Highlights accepted revisions in emerald.
  - `ATS text view`: Displays raw plain text as seen by ATS bots.
- **ATS-Safe DOCX Export**:
  - Dynamically code-split chunk (`dist-ChwFBwu-.js`, ~467 kB) keeping initial load minimal.
  - No tables, graphics, or text frames in body text.
  - Native Word bullets and right-aligned tab stops for dates.
- **Print-to-PDF**: Dedicated `@media print` styling ensuring crisp printing without web UI chrome.
- **Export Truth Gate**: Modal dialog that warns against exporting bracketed placeholders (`[...___]`) or unresolved metric fields.

---

## 3. Test Verification Summary

All 22 test cases passing across 4 dedicated vitest test suites:

```text
 ✓ src/__tests__/tailor/header-overlap.test.ts (5 tests)
 ✓ src/__tests__/tailor/stage2-layout-parser.test.ts (4 tests)
 ✓ src/__tests__/tailor/stage3-engine-review.test.ts (8 tests)
 ✓ src/__tests__/tailor/stage4-export.test.ts (5 tests)

 Test Files  4 passed (4)
      Tests  22 passed (22)
```

- **Typecheck**: `npx tsc --noEmit` exited with code `0`.
- **Production Build**: `npm run build` exited with code `0`.
- **Dev Server**: Verified live on `http://localhost:5174/tools/tailor` returning `HTTP 200 OK`.

---

## 4. Rollback Command

To immediately revert the repository to the baseline prior to these changes:
```bash
git reset --hard pre-tailor-ui-v2
```
