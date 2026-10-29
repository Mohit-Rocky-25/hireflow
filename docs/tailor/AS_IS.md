# HireFlow v4.0.0 — Module Landscape: As-Is Tailor My Resume Architecture
**File**: `docs/tailor/AS_IS.md`  
**Purpose**: Complete audit of existing files under `src/lib/tailor/`, `src/engine/tailor/`, and `src/features/suite/tailor/`.

---

## 1. Directory Tree & Module Inventory

```
src/
├── engine/tailor/                     # v3 Engine Subsystem (Partially Orphaned)
│   ├── index.ts                       # Re-exports layoutTree, truthGate, types
│   ├── layoutTree.ts                  # LayoutTree builder & HTML/TXT/DOCX renderer (points-unaware)
│   ├── truthGate.ts                   # TruthGate Sentinel 2 (Claim-strength ladder & keyword caps)
│   └── types.ts                       # LayoutNode, LayoutTree, TailorVariant, TruthGate types
│
├── lib/tailor/                        # v4 SaaS Core Library
│   ├── types.ts                       # Core domain types (CandidateProfile, TailoredResume, etc.)
│   ├── engine/
│   │   ├── accomplishmentGenerator.ts # Canned template-pack accomplishment suggestions
│   │   ├── bulletTailor.ts            # Basic bullet restructurer (weak opener replace)
│   │   ├── makeItBetterEngine.ts      # "Make It Better" auto-verb mapper & 40/40/20 scorer
│   │   ├── strategyPlanner.ts         # Static archetype-based section ordering
│   │   └── truthGate.ts               # TruthGate Sentinel 1 (Metric preservation & skill check)
│   ├── export/
│   │   ├── docxExporter.ts            # Binary .docx generator via `docx` library
│   │   ├── formattingChecker.ts       # Pre-export scanner (glyphs, widow/orphan lines)
│   │   ├── layoutSentinel.ts          # Pixel-based (1056px) page height evaluator
│   │   └── pdfExporter.ts             # Vector PDF generator via `pdf-lib` (WinAnsi sanitization)
│   ├── knowledge/
│   │   ├── occupationsTaxonomy.ts     # Role definitions & seniority inference
│   │   ├── qualifications.ts          # Degree & score parsing (CGPA, GPA, %)
│   │   ├── skillsTaxonomy.ts          # Canonical skills & alias resolution
│   │   └── transferability.ts         # Directed semantic skill graph
│   ├── ledger/
│   │   └── factLedger.ts              # CandidateFact ledger & metric regex extractor
│   ├── matching/
│   │   └── evidenceMatcher.ts         # 4-tier requirement assessment (DIRECT, TRANSFERABLE...)
│   ├── parser/
│   │   ├── jobParser.ts               # Raw JD text extractor & requirement generator
│   │   └── resumeParser.ts            # Raw resume text extractor into CandidateProfile
│   └── store/
│       ├── fixtures.ts                # Demo resumes & JDs (real-looking names)
│       └── tailorStore.ts             # Primary Zustand store for tailoring state
│
└── features/suite/tailor/             # UI Presentation Layer
    ├── TailorResumePage.tsx           # Split-screen workspace page
    └── components/
        ├── DarkPaperPreview.tsx       # Live on-screen paper canvas preview
        ├── DarkTailorHeader.tsx       # Header with score badge, presets & export menu
        ├── DirectInputModal.tsx       # Manual resume/JD text paste modal
        ├── HandmadeResumeEditor.tsx   # Left-hand modular section editor
        ├── MakeItBetterModal.tsx      # Side-by-side diff modal for upgraded bullets
        └── sections/
            ├── CandidateProfileSection.tsx
            ├── EducationSection.tsx
            ├── index.ts
            ├── JobRequirementsSection.tsx
            ├── ProjectsSection.tsx
            ├── SkillsSection.tsx
            ├── SummarySection.tsx
            └── WorkExperienceSection.tsx
```

---

## 2. Module Specifications: Purpose, Exports, and Importers

| Module Path | Primary Purpose | Exported Symbols | Importers in Codebase |
| :--- | :--- | :--- | :--- |
| `src/engine/tailor/index.ts` | Barrel re-export for v3 tailor engine | Re-exports from layoutTree, truthGate, types | `src/engine/index.ts`, test files |
| `src/engine/tailor/layoutTree.ts` | Builds layout tree from candidate ledger | `buildLayoutTree`, `normalizeExportText`, `renderLayoutTreeToPlainText`, `renderLayoutTreeToHtml`, `getArchivedItems` | `src/engine/tailor/index.ts` |
| `src/engine/tailor/truthGate.ts` | Factual sentinel with claim-strength ladder & keyword caps | `evaluateTruthGate` | `src/engine/tailor/index.ts` |
| `src/engine/tailor/types.ts` | Type definitions for v3 layout tree & truth gate | `TruthGateViolationType`, `TruthGateViolation`, `TruthGateInput`, `TruthGateOutput`, `LayoutNode`, `LayoutTree`, `TailorVariant` | `src/engine/tailor/index.ts`, `layoutTree.ts`, `truthGate.ts` |
| `src/lib/tailor/types.ts` | Master TypeScript domain models | `SeniorityLevel`, `CandidateArchetype`, `CandidateProfile`, `TailoredResume`, `TruthGateResult`, etc. | 24 modules across `src/lib/tailor/` and `src/features/suite/tailor/` |
| `src/lib/tailor/engine/accomplishmentGenerator.ts` | Generates canned accomplishment bullets with fake metrics | `SuggestedAccomplishment`, `generateUniqueAccomplishments` | `HandmadeResumeEditor.tsx` |
| `src/lib/tailor/engine/bulletTailor.ts` | Rewrites passive bullet openers | `tailorBulletPoint` | `tailorStore.ts` |
| `src/lib/tailor/engine/makeItBetterEngine.ts` | Automatic power verb replacer & 40/40/20 headline score evaluator | `ImprovementHighlight`, `MakeItBetterResult`, `elevateBulletPoint`, `elevateResumeToBestStandard` | `DarkTailorHeader.tsx`, `HandmadeResumeEditor.tsx`, `MakeItBetterModal.tsx`, `TailorResumePage.tsx`, `tailorStore.ts` |
| `src/lib/tailor/engine/strategyPlanner.ts` | Fixed archetype-based section sequence planner | `planTailoringStrategy` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/engine/truthGate.ts` | Factual integrity sentinel checking preserved metrics and skills | `verifyFactualIntegrity` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/export/docxExporter.ts` | Native Word (.docx) binary compiler | `generateDocxBlob`, `downloadResumeAsDocx` | `DarkTailorHeader.tsx`, unit tests |
| `src/lib/tailor/export/formattingChecker.ts` | Pre-export scanner for broken glyphs and widow/orphan lines | `FormattingIssue`, `FormattingCheckResult`, `runPreExportFormattingChecks` | `DarkPaperPreview.tsx` |
| `src/lib/tailor/export/layoutSentinel.ts` | Computes vertical height against hardcoded 1056px | `LayoutSentinelReport`, `evaluateLayoutHeight` | `DarkPaperPreview.tsx`, `formattingChecker.ts` |
| `src/lib/tailor/export/pdfExporter.ts` | Client-side vector PDF generator using `pdf-lib` | `generatePdfResume`, `downloadResumeAsPdf`, `triggerPrintToPdf`, `downloadResumeAsTxt`, `downloadResumeAsMarkdown`, `downloadResumeAsJson` | `DarkTailorHeader.tsx`, `DarkPaperPreview.tsx` |
| `src/lib/tailor/knowledge/occupationsTaxonomy.ts` | Standard occupational profiles and seniority regex | `OccupationalRole`, `OCCUPATIONAL_ROLES`, `inferSeniorityFromText` | `jobParser.ts` |
| `src/lib/tailor/knowledge/qualifications.ts` | Academic degrees, CGPA/percentage parser | `ParsedScore`, `parseEducationScore`, `normalizeDegreeTitle` | `resumeParser.ts` |
| `src/lib/tailor/knowledge/skillsTaxonomy.ts` | Canonical skills vocabulary and token extractor | `CanonicalSkill`, `CANONICAL_SKILLS`, `resolveCanonicalSkill`, `extractSkillsFromText` | `truthGate.ts`, `factLedger.ts`, `evidenceMatcher.ts`, `jobParser.ts`, `resumeParser.ts` |
| `src/lib/tailor/knowledge/transferability.ts` | Skill adjacency graph for transferable matching | `TransferabilityEdge`, `TRANSFERABILITY_GRAPH`, `findTransferableMatch` | `evidenceMatcher.ts` |
| `src/lib/tailor/ledger/factLedger.ts` | Decomposes raw resume into CandidateFacts | `extractMetricsFromText`, `buildCandidateFactLedger` | `bulletTailor.ts`, `makeItBetterEngine.ts`, `truthGate.ts`, `evidenceMatcher.ts` |
| `src/lib/tailor/matching/evidenceMatcher.ts` | Matches candidate facts to JD requirements | `matchCandidateToJob` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/parser/jobParser.ts` | Parses job description text into requirements | `parseJobDescription` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/parser/resumeParser.ts` | Parses raw resume text into CandidateProfile | `extractContactInfo`, `detectSectionHeader`, `inferCandidateArchetype`, `parseResumeRawText` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/store/fixtures.ts` | Default resume & JD fixture text | `DEMO_FRESHER_RESUME`, `DEMO_SOFTWARE_ENGINEER_JD`, `DEMO_SECURITY_RESUME`, `DEMO_SECURITY_JD` | `tailorStore.ts`, unit tests |
| `src/lib/tailor/store/tailorStore.ts` | Zustand store managing interactive editing state | `PipelineStage`, `AppViewTab`, `useTailorStore` | All UI components in `src/features/suite/tailor/` |
| `src/features/suite/tailor/TailorResumePage.tsx` | Main split-screen workspace container | `TailorResumePage` | `src/App.tsx` (Route: `/tools/tailor`) |
| `src/features/suite/tailor/components/HandmadeResumeEditor.tsx` | Left column modular editor with tabs and cards | `HandmadeResumeEditor` | `TailorResumePage.tsx` |
| `src/features/suite/tailor/components/DarkPaperPreview.tsx` | Right column live on-screen canvas preview | `DarkPaperPreview` | `TailorResumePage.tsx` |
| `src/features/suite/tailor/components/DarkTailorHeader.tsx` | Top bar with presets, score badge & downloads | `DarkTailorHeader` | `TailorResumePage.tsx` |
| `src/features/suite/tailor/components/MakeItBetterModal.tsx` | Interactive modal showing bullet improvement diffs | `MakeItBetterModal` | `TailorResumePage.tsx` |
| `src/features/suite/tailor/components/DirectInputModal.tsx` | Manual text paste modal for resume & JD | `DirectInputModal` | `TailorResumePage.tsx` |
| `src/features/suite/tailor/components/sections/*.tsx` | 7 Individual section editors (Profile, Summary, Experience, Projects, Skills, Education, Requirements) | Section components | `sections/index.ts` -> `HandmadeResumeEditor.tsx` |

---

## 3. Duplication & Architectural Overlap Analysis

1. **Two Disconnected Truth Gates**:
   - `src/lib/tailor/engine/truthGate.ts` (`verifyFactualIntegrity`): Used in the SaaS UI (`tailorStore.ts`). Scans `tailoredResume.sections` against `buildCandidateFactLedger(candidateProfile)` to check for invented metrics and unverified skills.
   - `src/engine/tailor/truthGate.ts` (`evaluateTruthGate`): Orphaned v3 gate. Implements `CLAIM_STRENGTH_LADDER` (verifies action verb ownership tiers) and `TAILOR_MIRRORING_LIMITS` (caps keyword mentions at 2). The SaaS UI does not execute this file at runtime!
2. **Disconnected Layout Engines**:
   - `src/engine/tailor/layoutTree.ts`: Builds an immutable `LayoutTree` from `ResumeFactLedger` with separate text/HTML renderers, but is completely unused by the SaaS UI.
   - `src/features/suite/tailor/components/DarkPaperPreview.tsx`: Renders custom DOM elements directly from `resume.sections` via Tailwind CSS.
   - `src/lib/tailor/export/pdfExporter.ts`: Separately renders vector PDF using hardcoded manual coordinates in `pdf-lib`.
   - `src/lib/tailor/export/docxExporter.ts`: Separately creates DOCX paragraphs from `resume.sections`.
   - **Result**: No shared layout engine; pagination and line breaking differ substantially across the three renderers.
3. **Hardcoded Metric Regex vs True Quantification**:
   - `src/lib/tailor/ledger/factLedger.ts` uses a simplistic regex (`/\b(?:\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|...)\b/gi`) which misclassifies dates, year ranges, version numbers, or misses currency symbols like `Rs.`, `₹` or unit suffixes (`4-6 weeks`, `3.2x`).
4. **Canned Template Generators vs Real Candidate Evidence**:
   - `src/lib/tailor/engine/accomplishmentGenerator.ts` contains hardcoded strings with canned numbers ("28,000+ peak requests/sec while reducing p99 latency by 44%"). These violate the non-fabrication rule.
5. **Ownership Inflation in `makeItBetterEngine.ts`**:
   - Automatically maps "Responsible for" -> "Spearheaded", "Assisted with" -> "Co-engineered", "Worked on" -> "Engineered", which escalates verb strength without candidate confirmation.


---

## 4. Real Implementation Summary (40-Line Technical Synthesis)

1. **`makeItBetterEngine.ts`**: Strips 12 weak opening patterns via regex and unilaterally prepends executive verbs ("Responsible for" -> "Spearheaded", "Worked on" -> "Engineered", "Assisted with" -> "Co-engineered"). Inflates verb ownership without user declaration. Awards a composite score (verb coverage 40%, metric density 40%, passive penalty 20%) that artificially rises to ~80-100% post-upgrade regardless of target job requirements or ATS fit.
2. **`src/lib/tailor/engine/truthGate.ts`**: SaaS truth gate comparing regex-extracted metrics against `CandidateFact` ledger. Flags unevidenced metrics as CRITICAL and unconfirmed skills as WARNING. Emits a scalar 0-100 score; completely lacks verb ladder enforcement and keyword capping.
3. **`src/engine/tailor/truthGate.ts`**: Separate v3 truth gate enforcing `CLAIM_STRENGTH_LADDER` (tiers 1-5) and `TAILOR_MIRRORING_LIMITS` (max 2 keyword mentions). If violations occur, silently falls back to original bullet. Completely orphaned from the active UI store.
4. **`strategyPlanner.ts`**: Assigns section ordering solely based on a static `archetype` enum. Ignores candidate graduation recency, whether JD specifies CGPA/batch eligibility, regional norms, or persistent user overrides. For technical specialists, hardcodes Education to the end.
5. **`accomplishmentGenerator.ts`**: Canned suggestion generator containing hardcoded strings with synthetic numbers ("28,000+ peak req/s, 44% latency reduction", "3.2x throughput", "99.98% uptime"). Injects fabricated evidence instead of composing from user facts.
6. **`layoutSentinel.ts`**: Hardcodes `PAGE_HEIGHT_PX = 1056` for both Letter and A4 (A4 is ~1123px at 96 DPI). Evaluates layout in pixels instead of typographic points, accumulating arbitrary line heights (20px per bullet, 28px per entry).
7. **`formattingChecker.ts`**: Scans for control chars / `\uFFFD` and widow/orphan word remainders (`% 15 in [1, 2]`). Completely lacks detection for unreplaced metric placeholders such as `[X%]`, `[N ms]`, or `TODO`.
8. **`pdfExporter.ts`**: Emits vector PDF using `pdf-lib` with standard WinAnsi fonts (Helvetica/Times-Roman). Silently strips all non-ASCII characters (`/[^\x00-\x7F]/g -> ' '`), mangling Indian names, accents, and diacritics. Operates on independent manual coordinates.
9. **`docxExporter.ts`**: Generates tableless Word documents with Calibri typography. Contains zero pagination tracking or shared layout tree with PDF/DOM preview; cannot guarantee page parity.
10. **`tailorStore.ts`**: Zustand store persisting unvalidated JSON snapshots to `localStorage` without quota protection or corruption recovery. Seeds state with demo fixtures containing real-looking personal names ("Jeswanth Kumar", "Alex Morgan").

