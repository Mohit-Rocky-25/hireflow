# HireFlow — Phase 11.1 Product Architecture (`Tailor My Resume`)

**Route:** `/tools/tailor` (legacy `/tailor`, `/tools/resume-tailor`, `/tools/tailor-draft` preserve query params via `RedirectWithSearch`)

## 1. Core Positioning
`TailorWorkspacePage` ([TailorWorkspacePage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/TailorWorkspacePage.tsx)) replaces the legacy split Classic/Spruce tailor shells with a unified, evidence-first Resume Engineering Workspace:
- **Zero fake initialization:** Never boots with `PRESET_FIXTURES[0]` or a synthetic persona. On mount without an active session or valid `?ctx=` / `?draft=` parameter, users land in `TailorEntryView`.
- **Entry Paths:**
  1. **Resume Matrix:** Select an existing non-archived `ResumeWorkspace` and exact `ResumeVersion` (`useResumeStore`).
  2. **Upload Resume File:** Parse `.pdf`, `.docx`, `.txt`, or `.md` cleanly via `extractFromFile` (`src/lib/ats/fileExtractor.ts`), registering an immutable `v1` original version.
  3. **Paste Resume Text:** Initialize from raw resume text with optional immutable `v1` workspace persistence.
  4. **Continue Draft:** Resume an in-memory tailoring draft from Entry View or My Space (`SavedTailorDraftsPanel`).
  5. **Contextual Tool Handoff (`?ctx=<launchId>`):** Hydrates cleanly from Resume Roaster, TalentLens, Dual-JD Compare, or My Space Saved JDs via `useTailorLaunchStore`.

## 2. Three Engineering Modes
Defined in `TailorMode` ([tailorWorkspaceTypes.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/model/tailorWorkspaceTypes.ts)):
- `improve`: General resume quality refinement without requiring a JD (clarifying passive openers cleanly, prompting candidates to confirm authentic outcomes).
- `role`: Role/industry positioning (target role title, seniority, industry, and TalentLens competency alignment without hallucinating role history).
- `jd`: Job-description tailoring with requirement-by-requirement verification and canonical 7D ATS comparison.

## 3. Provenance & Layout System
- **14 Provenance Kinds:** `full_time`, `part_time`, `internship`, `apprenticeship`, `freelance`, `academic_project`, `personal_project`, `open_source`, `research`, `volunteering`, `leadership`, `coursework`, `certification`, `training`.
- **5 Layout Presets (`TAILOR_LAYOUT_PRESETS`):** `ats_single`, `executive`, `technical`, `academic_research`, `graduate_concise`.
