# HireFlow Known Issues Register & Architectural Boundaries

## 1. Resolution of Known Issues Register (`I-01` to `I-28`)

| ID | Issue | Status | Resolution |
|---|---|---|---|
| **I-01** | Verb mapping inflates ownership | **RESOLVED** | Stage 4 implemented strict 5-tier ownership ladder. Engine never raises tier; weak phrases are flagged as warnings, not auto-escalated. |
| **I-02** | Two truth gates in two folders | **RESOLVED** | Stage 5 unified all truth gate logic into single canonical engine (`src/lib/resume/gate/evaluator.ts`). |
| **I-03** | Headline 40/40/20 badge ignores fit | **RESOLVED** | Stage 5 & 8 replaced badge with two objective readouts: Target JD Coverage % and Quality Checklist (Blockers vs Warnings). |
| **I-04** | Metric placeholders reach export | **RESOLVED** | Stage 5 enforced hard blocking rule `G-03` catching `[X%]`, `[X]`, `[metric]`. |
| **I-05** | Page height assumed 1056 px for both sizes | **RESOLVED** | Stage 6 implemented point-based geometry distinguishing A4 ($841.89\text{ pt}$) from Letter ($792.00\text{ pt}$). |
| **I-06** | PDF silently drops non-Latin characters | **RESOLVED** | Stage 6 implemented Unicode NFKD normalization and Indic transliteration in `unicode.ts`. |
| **I-07** | Three renderers paginate differently | **RESOLVED** | Stage 6 created unified `LayoutDocument` feeding PDF, DOCX, and DOM renderers identically. |
| **I-08** | Fact ledger has no edit rules | **RESOLVED** | Stage 1 implemented append-only ledger with version incrementing and content hashing. |
| **I-09** | Accomplishment generator fills templates | **RESOLVED** | Stage 4 implemented 4-pattern composer drawing strictly from confirmed facts. |
| **I-10** | Metric preservation relies on naive regex | **RESOLVED** | Stage 1 & 6 built robust tokenizer covering currencies, ranges, multipliers, and units. |
| **I-11** | Education fixed at end for all archetypes | **RESOLVED** | Stage 3 implemented situation rules R1–R8 placing Education first for students/freshers. |
| **I-12** | Demo presets with real-looking personal names | **RESOLVED** | Stage 0 & 1 sanitized all presets and fixtures to fictional candidate personas. |
| **I-13** | Architecture brief had truncated tables | **RESOLVED** | Stage 9 regenerated all architectural docs directly from clean codebase. |
| **I-14** | Keyword cap justified by unproven ATS penalty | **RESOLVED** | Stage 5 aligned scoring with weighted target job requirements without arbitrary penalties. |
| **I-15** | No round-trip verification of exports | **RESOLVED** | Stage 7 built round-trip verification engine re-reading files with text extractor. |
| **I-16** | DOCX pagination mismatch | **RESOLVED** | Stage 6 & 7 aligned DOCX twip margins and spacing with point-based layout floors. |
| **I-17** | No determinism tests | **RESOLVED** | Stages 1 through 8 include 100% deterministic test suites with zero `Math.random()`. |
| **I-18** | LocalStorage quota and corruption handling | **RESOLVED** | Stage 8 implemented robust `try/catch` and JSON validation with safe degradation. |
| **I-19** | Missing campus template format | **RESOLVED** | Stage 6 implemented dedicated `campus` template specification with CGPA hierarchy. |
| **I-20** | Editor lacks ownership tier fields | **RESOLVED** | Stage 2 & 8 added candidate ownership tier selection (1–5). |
| **I-21** | Deep links undocumented | **RESOLVED** | Handled in `TailorResumePage.tsx` (`?focus`, `?skill`, `?bullet`, `?mode`). |
| **I-22** | Regional differences hardcoded | **RESOLVED** | Stage 1 & 3 parameterized regional profiles (`us`, `uk`, `india-campus`, etc.). |
| **I-23** | Skills section has no evidence rule | **RESOLVED** | Stage 2 & 5 flags unevidenced skills (`W-02`) and routes to `/tools/build-briefs`. |
| **I-24** | Summary text buzzword inflation | **RESOLVED** | Stage 4 implemented factual summary generator with buzzword linter (`W-04`). |
| **I-25** | Weak phrases auto-replaced | **RESOLVED** | Stage 4 flags weak phrases for user confirmation instead of auto-swapping. |
| **I-26** | Spelling variants unhandled | **RESOLVED** | Stage 1 built regional spelling normalizer (`spelling.ts`). |
| **I-27** | System clock causes test nondeterminism | **RESOLVED** | All engines inject `asOf` date parameter; zero `new Date()` inside engines. |
| **I-28** | Tailor page accessibility & error states | **RESOLVED** | Stage 8 implemented keyboard accessible drawers, ARIA labels, and error banners. |

---

## 2. Current Architectural Boundaries

1. **Standard PDF Fonts (Zero-Network Egress Boundary)**:
   In adherence with **Hard Rule 1** (zero network egress, zero CDN downloads), vector PDF generation embeds Standard 14 PDF fonts (`Helvetica`, `Times-Roman`, `Courier`). Non-Latin alphabets (Devanagari, Cyrillic, Kanji) are safely transliterated using phonetic NFKD mapping rather than dropping characters or downloading 20MB external TTF font files over the network.
2. **Client-Side Browser Sandboxing**:
   All operations run 100% in-browser on the user's client machine. Processing very large resumes (> 50 pages) is bounded by browser memory, which is actively safeguarded by the 10MB file size limit and 1-Page Sentinel layout checks.
