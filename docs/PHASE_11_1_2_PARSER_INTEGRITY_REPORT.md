# Phase 11.1.2 — Parser Integrity & Complete Data Preservation Report

## Scope
Remediated P0 data-loss and misattribution defects in resume parsing (`src/lib/tailor/parser/resumeParser.ts`), degree normalization (`src/lib/tailor/knowledge/qualifications.ts`), skills taxonomy matching (`src/lib/tailor/knowledge/skillsTaxonomy.ts`), shared parser types (`src/lib/tailor/types.ts`), and structured document hydration (`src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/store/tailorStore.ts`).

---

## Defect 1 — Single-Line Education Parsing Emitting `University / Institute`
- **Original defect:** Single-line education lines such as `B.S. Computer Science, University of Washington (2025)` dropped the institution or emitted placeholder `'University / Institute'`, and degree-only lines like `B.S. in Computer Science (2024)` produced truncated normalization or fake institution placeholders.
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`, `src/lib/tailor/knowledge/qualifications.ts`
- **Root cause:** `parseEducationLines` expected multi-line institution/degree splitting and fell back to `'University / Institute'` on single-line entries, while degree regexes left trailing dots/punctuation when stripping degree tokens.
- **Exact fix:**
  - Updated `normalizeDegreeTitle` in `src/lib/tailor/knowledge/qualifications.ts` for normalized degree strings (`B.Tech`, `Bachelor of Science`, `Ph.D.`).
  - Rewrote `parseEducationLines` in `src/lib/tailor/parser/resumeParser.ts` using `\b\.?` and trailing `[.,:\s]+` cleanup to parse single-line comma/at/in formats, preserve blank institution when absent rather than emitting `'University / Institute'`, and retain `rawText`, `school`, `fieldOfStudy`, and `year` (`EducationEntry` in `src/lib/tailor/types.ts`).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"parses single-line degrees retaining institution, field & year without University / Institute placeholder"`.
- **Actual test result:** Passed in Vitest (`task-8093`: 52 files / 584 tests passed; verified `"University of Washington"` present and `"University / Institute"` absent in live Playwright PDF & DOCX binary exports in `e2e/phase11_1_2TailorRegressions.spec.ts`).
- **Remaining limitation:** Highly irregular multi-column PDF table layouts pasted without delimiters may require manual entry-field refinement in the document canvas.

## Defect 2 — Custom, Academic, Leadership, Volunteering, Bilingual & Open-Source Headers Misclassified into Education
- **Original defect:** Headings such as `RESEARCH & PUBLICATIONS`, `AWARDS`, `LEADERSHIP`, `VOLUNTEERING`, `OPEN SOURCE`, `COURSEWORK`, `ADDITIONAL`, `EXTRACURRICULAR`, and bilingual `/` headings fell into the wrong section parser (often `Education` or dropped).
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/types.ts`
- **Root cause:** `detectSectionHeader` recognized only a narrow set of fixed core headings; subsequent bullets stayed attached to whatever section preceded them.
- **Exact fix:**
  - Added `detectSectionHeaderWithMeta` supporting `research`, `awards`, `leadership`, `volunteering`, `open_source`, `coursework`, `extracurricular`, `additional`, `work experience & internships`, bilingual `/` headings, and unknown ALL-CAPS/Markdown section fallbacks.
  - Added `sectionKind` and `sourceOrder` tracking on `customSections` and `sectionOrder` in `src/lib/tailor/types.ts`.
  - Updated `parseSourceToStructuredDocument` (`src/features/tailor/engine/intelligencePipeline.ts`) to preserve original titles on research/custom/bilingual sections and original document section order while retaining core canonical section titles (`Professional Summary`, `Experience`, `Projects`, `Skills & Competencies`, `Education`, `Certifications & Credentials`).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"preserves Research, Publications, Awards, Leadership, Volunteering, Open Source, Coursework, Additional, Extracurricular & bilingual headers in source order"`.
- **Actual test result:** Passed in Vitest (`task-8093`) and verified end-to-end with `RESEARCH & PUBLICATIONS` + custom `Open Source` section in Playwright Chromium (`task-8172`).
- **Remaining limitation:** Lowercase inline subheaders lacking blank lines, capitalization cues, or markdown prefixes are treated as bullets of the parent section.

## Defect 3 — Non-Taxonomy Skills Dropped & `.js` Inferring `JavaScript` + `coreConcepts`/`other` Dropped in `tailorStore`
- **Original defect:** Explicit skills outside the engineering taxonomy (e.g., `Clinical Triage`, `HIPAA Compliance`, `Vendor SLA Management`) were dropped, `"Node.js"` falsely matched/injected `"JavaScript"`, and `buildInitialTailoredSections` omitted `coreConcepts`, `softSkills`, and `other`.
- **Source file:** `src/lib/tailor/knowledge/skillsTaxonomy.ts`, `src/lib/tailor/parser/resumeParser.ts`, `src/features/tailor/engine/intelligencePipeline.ts`, `src/lib/tailor/store/tailorStore.ts`
- **Root cause:** Taxonomy matching stripped/split around punctuation so `.js` triggered `js` -> `JavaScript`; non-taxonomy skills had no fallback token preservation; `buildInitialTailoredSections` only mapped 5 of the 8 `CategorizedSkills` buckets.
- **Exact fix:**
  - Fixed dot-aware boundaries `(?:^|[^a-z0-9.])...(?=$|[^a-z0-9.])` in `src/lib/tailor/knowledge/skillsTaxonomy.ts` and added `extractStructuredSkillsFromSection` preserving non-taxonomy tokens with `unresolved: true`.
  - Updated `parseResumeRawText` (`src/lib/tailor/parser/resumeParser.ts`) to keep `extractedSkillRecords` verbatim and only scan prose skills when explicit skills are absent (`explicitOnly` alignment in `intelligencePipeline.ts`).
  - Updated `buildInitialTailoredSections` (`src/lib/tailor/store/tailorStore.ts`) to map `coreConcepts`, `softSkills`, and `other` into `skillsByCategory`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"preserves non-taxonomy skills verbatim and does not infer JavaScript from TypeScript or Node.js"`; plus existing `tests/tailor/stage8-ui.spec.ts` test #6 (`Fresher Demo Persona with Razorpay JD achieves >70% JD Coverage and 0 Blockers`).
- **Actual test result:** Both passed in Vitest (`task-8085`, `task-8093`), and Chromium PDF extraction verified `not.toContain('JavaScript')` on Arjun's `Node.js`/`TypeScript` resume (`task-8172`).
- **Remaining limitation:** Free-form comma phrases inside prose paragraphs without a Skills section still rely on taxonomy recognition rather than arbitrary noun-phrase chunking.

## Defect 4 — Experience Title `'Role'` Fallback & Internship Over-Promotion
- **Original defect:** Lines like `Team Lead | NimbusPay | Jan 2022 - Present` could lose the `Team Lead` title into `'Role'` fallback, and project internships inside `Projects` risked being promoted into `Experience`.
- **Source file:** `src/lib/tailor/parser/resumeParser.ts`
- **Root cause:** Title parsing regex rejected valid non-list leadership headers and lacked strict section-isolation guards for internships appearing under project sections.
- **Exact fix:** Preserved explicit `Team Lead` and role/organization header extraction in `parseExperienceSection` without substituting `'Role'`, and constrained `Projects` internship lines to remain inside `Projects`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"keeps Team Lead title intact and does not promote project internships into full-time employment"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Resume formats placing employer and title on separate undated lines without separators still fall back to best-effort header inference.
