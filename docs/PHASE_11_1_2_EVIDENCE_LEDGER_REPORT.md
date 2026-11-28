# Phase 11.1.2 — Project Evidence Ownership & Ledger Integrity Report

## Scope
Remediated P1 catalog-to-resume inflation in `linkProjectEvidence` (`src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/components/TailorIntelligencePanel.tsx`) and aligned validation in `src/features/tailor/engine/intelligencePipeline.ts`.

---

## Defect 1 — One-Click Build Brief Attachment Injected Unowned Project Catalog Templates & Unused Stack
- **Original defect:** Clicking a global Build Brief catalog card in `ALL_PROJECT_BRIEFS` automatically inserted template bullets and template tech-stack items (including version strings like `3.11+` and unused catalog stack technologies) into the resume as completed candidate experience, conflating target opportunities with completed personal work.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/components/TailorIntelligencePanel.tsx`, `src/features/tailor/engine/intelligencePipeline.ts`
- **Root cause:** `linkProjectEvidence(brief)` mutated `doc.sections` directly from static catalog brief templates without requiring ownership confirmation, declared candidate contribution, or actual technologies used.
- **Exact fix:**
  - Extended `tailorWorkspaceTypes.ts` with `CandidateOwnedProjectRecord`, `plannedProjectBriefIds`, and `ownedProjects`.
  - Updated `linkProjectEvidence(brief, ownership?)` (`src/features/tailor/store/useTailorWorkspaceStore.ts`):
    - Without `ownership`, saves the brief only to `plannedProjectBriefIds` (`mode: 'opportunity_saved'`), never mutating resume sections or confirming template technologies.
    - When `ownership` is supplied, enforces `confirmedByCandidate === true` and non-empty `candidateContribution` (`mode: 'rejected'` otherwise), attaches only candidate-declared contribution + `technologiesUsed` (+ optional `coContributors` / `in_progress` status), and writes an explicit `UserConfirmedEvidenceRecord` containing those declared fields (and never unused `brief.techStack`).
  - Updated `validateBeforeFinalize` (`src/features/tailor/engine/intelligencePipeline.ts`) to recognize prefix/composite confirmed `factText` matches (`cb === bTrim || cb.startsWith(bTrim + ' | ')`) so legitimately owned project contributions + `technologiesUsed` pass validation while unused catalog technologies stay blocked.
  - Updated `TailorIntelligencePanel.tsx` UI to split catalog actions into `'Save Opportunity'` and `'Attach Owned...'` (which opens an ownership verification form requiring confirmation checkbox, contribution text, and actual technologies used).
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"enforces Project Evidence Ownership: catalog brief alone creates opportunity only; owned attachment requires explicit contribution & passes validation"`.
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`), verifying `opportunity_saved`, unconfirmed `rejected`, `owned_project` attachment with `"Implemented SQLite schema"`, absence of template `"3.11+"`, absence of unconfirmed catalog `"FastAPI"`, and `validationReport.factualPassed === true`. Backward-compatible `tests/phase11_1TailorWorkspace.test.ts` also passed all 7 tests.
- **Remaining limitation:** Existing saved sessions hydrated without `ownedProjects` rely on their recorded `userConfirmations` ledger entries.
