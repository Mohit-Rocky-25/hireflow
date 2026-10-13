# As-Is Architecture Audit: Tailor Engine

This document provides a comprehensive audit of the current HireFlow Tailor Engine codebase as required by Phase 0 of `docs/MASTER_SPEC.md`.

---

## 1. Where Sections Are Built

The codebase currently contains **two parallel pathways** for building sections:

### Pathway A: UI & Document Model Path (Active in `TailorResumePage.tsx`)
- **File**: `src/lib/tailorEngine/docModel.ts` (`parseResumeDocModel`)
  - Calls `recoverResumeStructure(resumeText)` from `src/lib/tailorEngine/structure/recoveryEngine.ts`.
  - Maps recovered sections into `ResumeDocModel`:
    - `experience`: `recovered.experience` with `acceptedReplacements` applied.
    - `projects`: `recovered.projects` with `techStack` joined into `linkOrTech`.
    - `leadership`: `recovered.leadership`.
    - `education`: `recovered.education` (degree, institution, dates).
    - `skills`: `recovered.skills.canonicalSkills` merged with `acceptedSkills`.
    - `achievements`: `recovered.achievements` (flat `string[]`).
    - `certifications`: `recovered.certifications` (flat `string[]`).
    - `languages`: `recovered.languages` (`string[]`).
    - `links`: `recovered.links` (`string[]`).
  - Decides `preset` ('fresher' | 'skillsFirst' | 'professional') and `sectionOrder`:
    - `fresher`: summary, education, skills, projects, achievements, leadership, experience, certifications, languages, links.
    - `skillsFirst`: summary, skills, projects, achievements, leadership, experience, education, certifications, languages, links.
    - `professional`: summary, experience, skills, projects, achievements, leadership, education, certifications, languages, links.
  - **Structural Parser Components**:
    - `src/lib/tailorEngine/structure/inlineSegmenter.ts`: Identifies section headers via regex.
    - `src/lib/tailorEngine/structure/headerParser.ts`: Parses name, email, phone, location, links.
    - `src/lib/tailorEngine/structure/educationParser.ts`: Extracts degree, branch, institution, dates.
    - `src/lib/tailorEngine/structure/projectsParser.ts`: Parses project names, tech stack (via `TECH_CLAUSE_REGEX`), and bullets.
    - `src/lib/tailorEngine/structure/experienceParser.ts`: Extracts role, company, dates, bullets.
    - `src/lib/tailorEngine/structure/skillsParser.ts`: Extracts skills taxonomy and categories.
    - `src/lib/tailorEngine/structure/certificationsParser.ts`: Splits certification lines into flat strings.
    - `src/lib/tailorEngine/structure/leadershipParser.ts`: Extracts leadership roles and bullets.
  - **Defect Impact**:
    - Flat string parsing for achievements and certifications loses rich entry metadata (dates, credentials, status).
    - Competition entries (e.g., L3AK CTF) are flattened into arbitrary string arrays in `recoveryEngine.ts:150-151`.

### Pathway B: Modular Staged Pipeline (`src/lib/tailorEngine/engine/`)
- **File**: `src/lib/tailorEngine/engine/index.ts` (`processResumePipeline`, `tailorResumePipeline`)
  - Stage 1: `parseRawContent` (`engine/parse/index.ts`)
  - Stage 2: `normalizeRawBlocks` (`engine/normalize/index.ts`)
  - Stage 3: `routeResumeContent` (`engine/route/index.ts`)
  - Stage 4: `polishResumeContent` (`engine/polish/index.ts`)
  - Stage 5: `buildLayoutTree` (`engine/layout/index.ts`)
  - Stage 6: `validateResume` (`engine/validate/index.ts`)
  - Stage 7: `renderHtmlPreview` (`engine/export/index.ts`)
  - Note: This pipeline enforces canonical Zod schema (`engine/schema.ts`) and layout trees, but is currently disconnected from the main interactive UI in `TailorResumePage.tsx`.

---

## 2. Where Each Exporter Makes Its Own Decisions

There is currently **no unified layout tree** driving all exporters. Each renderer independently inspects the data model and makes divergent formatting and content omission choices:

### 2.1 HTML Preview
- **File**: `src/features/suite/tailor/components/templates/ClassicTemplate.tsx` (also `ModernTemplate.tsx`, `CompactTemplate.tsx`)
- Renders: Summary, Education, Technical Skills, Projects, Work Experience, Leadership, Certifications, Achievements, Languages.
- Renders dynamically following `model.sectionOrder`.
- Applies green highlight chips and diff markers when `showChanges` is active.

### 2.2 PDF Export
- **File**: `src/features/suite/tailor/TailorResumePage.tsx` (`executePrintPdf`)
- Relies on browser `window.print()` targeting the DOM element with `@media print`.
- Paper size is unconstrained or uses system print default; no locale detection (A4 for India vs Letter for US/Canada).

### 2.3 DOCX Export
- **File**: `src/lib/tailorEngine/docxExport.ts` (`generateDocxBlob`)
- **Divergence & Defects**:
  - `sectionMap` (lines 304–311) only defines: `summary`, `experience`, `projects`, `skills`, `education`, `languages`.
  - **DROPS Achievements, Leadership, and Certifications entirely (Bug B01)**.
  - In `renderDocxProjects` (lines 160–189): `proj.date` is never rendered; only `proj.name` and `proj.linkOrTech` are emitted. **Project dates/years vanish (Bug B03)**.
  - In `tabStops` (lines 115, 170, 260): Tab stop position is hardcoded to `position: 9000`. On a standard 0.5" margin page (width 11906–12240 dxa, text width ~10466–10800 dxa), dates float in the middle instead of right-aligning at text width **(Bug B14)**.
  - Hardcodes 0.5" margins on default Letter size without locale adaptation **(Bug B20)**.
  - Dropped sections cause ~25% of the page to appear empty **(Bug B13)**.

### 2.4 LaTeX Export
- **File**: `src/lib/tailorEngine/latexExport.ts` (`generateLatexCode`)
- **Divergence & Defects**:
  - Implements a fixed, hardcoded section order (Heading -> Summary -> Education -> Technical Skills -> Projects -> Experience -> Achievements -> Certifications).
  - Completely **DROPS Leadership (Bug B01)**.
  - Line 20: `escapeLatex` runs `.replace(/[-•*●▪‣]\s*/g, '')`. This globally strips hyphens inside words! For example: `"Second-year"` -> `"Secondyear"`, `"client-side"` -> `"clientside"`, `"VIT-AP"` -> `"VITAP"`, and `"re-signed"` -> `"resigned"` **(Bug B04)**.
  - Hardcodes `\documentclass[letterpaper,10pt]{article}` regardless of user locale **(Bug B20)**.

---

## 3. Where Scores Are Computed

There are multiple conflicting score calculations across the app:

### 3.1 Initial Match Score
- **File**: `src/lib/tailorEngine/engine.ts` (lines 343–346)
  - `matchRatio = (mustHavesMatched.length / totalMust) * 75 + (niceToHavesMatched.length / totalNice) * 15`
  - `baseScore = Math.max(15, Math.min(95, Math.round(matchRatio + (metricsFound > 2 ? 10 : 0))))`

### 3.2 Live Tailored Match Score
- **File**: `src/features/suite/tailor/TailorResumePage.tsx` (lines 255–277)
  - Re-evaluates match ratio dynamically when accepted skills are added:
  - `Math.min(100, Math.max(base, Math.round(matchRatio + 10)))`

### 3.3 Target Max / Projected Score
- **File**: `src/lib/tailorEngine/engine.ts` (line 551)
  - `projectedScoreAfter: baseScore` (or previously inflated projections).

### 3.4 Resume Quality Score
- **File**: `src/lib/tailorEngine/strength.ts` (`calculateResumeQuality`)
  - Evaluates: Structure (25), Metrics (25), Action Verbs (20), Brevity (15), Section Completeness (15).
  - Yields total score out of 100.

### 3.5 UI Confusions (Bug B11)
- `MatchPanel.tsx` displays "Initial Match (18%)", "+0%", "Current Match (18%)", "Target Max (18%)".
- Other panels display Resume Quality (94%) or ATS score.
- The user is confronted with 4–5 different percentage numbers without clear single definitions.

---

## 4. Where Suggestions Are Created and Accepted

### 4.1 Suggestion Generation
- **File**: `src/lib/tailorEngine/engine.ts` (`generateTailoredSuggestions`)
  - **Weak Openers**: `matchWeakOpener` -> generates `SAFE_EDIT` rephrase suggestions (`sug-rephrase-*`).
  - **Context / Metrics**: `detectDomainQuestion` -> generates `QUESTION` suggestions (`sug-context-*`) with empty proposed text.
  - **Reorder**: Generates `SAFE_EDIT` reorder suggestions (`sug-reorder-*`).
  - **Skills**: Generates `QUESTION` skills suggestions (`sug-skill-*`) for missing JD must/nice skills.
- **Defects & Gaps**:
  - In `TailorResumePage.tsx:373-380`, `handleApplyContext` pastes user input directly with simple string concatenation: `applyGrammarGate("- " + originalClean + ", " + cleanSnippet + ".")`.
  - If user types uppercase or unpunctuated snippets (e.g., `"EVALUATED ACORDING TO 12 END points"`), it is pasted verbatim without case fixing or grammatical clause restructuring **(Bug B05)**.
  - Tailoring does NOT rewrite the Summary or reorder the skills categories based on JD relevance **(Bug B10)**.

### 4.2 Suggestion State Management
- **File**: `src/features/suite/tailor/TailorResumePage.tsx`
  - State: `suggestionStatus: Record<string, CardStatus>`.
  - Actions: `handleAccept`, `handleReject`, `handleSaveEdit`, `handleApplyContext`, `handleRevertToSource`.
  - In earlier versions, suggestions were auto-accepted or injected; currently they start as `pending` or `needs_input`, but state machine needs strict formalization per Master Spec Section 8.

---

## 5. Where the Job Description (JD) Is Parsed

### 5.1 Parsing Logic
- **File**: `src/lib/tailorEngine/parser.ts` (`parseJDOverview`)
  - Role detection: Scans lines 0–10 for role prefixes, `#` headers, and `COMMON_ROLE_TITLES`.
  - Company detection: Scans lines 0–10 for company prefixes.
  - Section segmentation: Checks headers against `MUST_HAVE_HEADER_REGEX` and `NICE_TO_HAVE_HEADER_REGEX`.
  - Skill extraction:
    - `extractCanonicalSkills(text)` using taxonomy lookup.
    - Multi-word regex (lines 319–333): `/\b([A-Z][a-zA-Z0-9+#.]+(?:\s+[A-Z][a-zA-Z0-9+#.]+){1,3})\b/g`.

### 5.2 Defects in JD Parsing
- **Junk Meta-Headings Emitted as Skills (Bug B06)**:
  - The multi-word pattern matches meta-headings and labels like `"Job Title"`, `"Job Description"`, `"Employment Type"`, `"Security Engineering"`, and the bare role title itself.
  - When missing from the resume, these become skill requirements, resulting in questions like: *"The job asks for Job Title. Have you used it?"*.
- **Raw Markdown in JD Input (Bug B07)**:
  - Input text containing `**Education:**`, `## Requirements`, or bullet prefixes is not cleanly segmented and stripped before display and parsing.
