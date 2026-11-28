# Phase 11.1.2 — Cross-Tool Ecosystem Integration Remediation

## Scope
Remediated P1 cross-tool handoff, UI key, focus preservation, and canonical ATS re-analysis attribution defects across TalentLens (`src/pages/demo/CompanyRolesPage.tsx`, `src/features/tailor/store/useTailorWorkspaceStore.ts`), Dual-JD Compare (`src/features/suite/compare/CompareJDsPage.tsx`), and ATS Roaster (`src/features/ats/components/FixTheseFirst.tsx`, `src/pages/tools/ResumeChecker.tsx`, `src/features/tailor/components/TailorDocumentCanvas.tsx`).

---

## Defect 1 — TalentLens Handoff Opened Target JD Mode Without Immediate Fit & Gaps Context
- **Original defect:** Clicking `Tailor for this Role` from TalentLens (`CompanyRolesPage.tsx`) passed a company `jdId` / benchmark snapshot that coerced Tailor into `'jd'` mode instead of `'role'` mode and left the user looking for role fit benchmarks.
- **Source file:** `src/pages/demo/CompanyRolesPage.tsx`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** `CompanyRolesPage.tsx` populated `jdIds` alongside `jdSnapshotHash`, and `hydrateFromLaunchContext` prioritized JD mode over TalentLens origin.
- **Exact fix:**
  - Updated `CompanyRolesPage.tsx` line 717 to pass `jdIds: []` while preserving `jdSnapshotHash`, `jdTitle`, `jdCompany`, and role labels.
  - Updated `hydrateFromLaunchContext` (`src/features/tailor/store/useTailorWorkspaceStore.ts`) to force `mode: 'role'` whenever `sourceEntryPoint === 'talentlens'`, persist `launchFocus`, and materialize demonstrated/missing requirements immediately for the `Fit & Gaps` tab.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` (`"forces TalentLens handoffs into Role mode even when benchmark JD snapshot exists & preserves ATS focus context"`) and Chromium E2E `e2e/phase11_1_2TailorRegressions.spec.ts` (`/demo/company/google` -> `Tailor for this Role`).
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`), confirming `Role Fit` `aria-pressed="true"`, `Fit & Gaps` `aria-selected="true"`, and zero `Switch to Target Role` prompt.
- **Remaining limitation:** Static role benchmarks without a specific employer still require switching to `Target JD` mode if the user subsequently wants JD-specific keyword tailoring.

## Defect 2 — Dual-JD Compare Duplicate React Keys (`'tcs'`), Session ID Drift & Candidate Mismatch
- **Original defect:** `/tools/jd-compare` emitted 6 React duplicate key warnings for `'tcs'`, generated unrelated comparison IDs between JD #1 and JD #2 launches, and risked candidate mismatches between Compare and Tailor.
- **Source file:** `src/features/suite/compare/CompareJDsPage.tsx`
- **Root cause:** `sortedCompanies` included duplicate entries for `'tcs'`; comparison session IDs were regenerated per button click rather than held across JD #1/#2 launches; sample candidate text lacked SHA-256 snapshot caching when not using a `ResumeMatrix` workspace.
- **Exact fix:**
  - Deduplicated `sortedCompanies` by `c.id`.
  - Added a persistent `comparisonSessionId` across Target A and Target B launches (`createDualJdLaunchPair`).
  - Added explicit `primaryMatrixWorkspace` (`activePersonaId === 'matrix'`) resolution plus explicit `sha256Hex` + `cacheSnapshotInMemory` registration for sample candidates so Compare and Tailor evaluate the exact same resume snapshot.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` (`createDualJdLaunchPair` shared ID) + Playwright Chromium `e2e/phase11_1_2TailorRegressions.spec.ts` asserting `consoleErrors.filter((e) => e.includes('tcs')).toEqual([])`.
- **Actual test result:** Passed in Vitest (`task-8093`) and Playwright Chromium (`task-8172`).
- **Remaining limitation:** Clicking `Compare` runs client-side text comparison cleanly, whereas if the user manually pastes a modified resume text in Tailor later, a new draft session is created independently by design.

## Defect 3 — ATS Fix-These-First & ResumeChecker Focus Loss / Competing Handoff Write
- **Original defect:** Launching Tailor from ATS findings dropped the selected skill/section/bullet focus context, and `ResumeChecker.tsx` wrote a competing `useHandoffStore` Tailor payload alongside `useTailorLaunchStore`.
- **Source file:** `src/features/ats/components/FixTheseFirst.tsx`, `src/pages/tools/ResumeChecker.tsx`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/components/TailorDocumentCanvas.tsx`
- **Root cause:** Launch callers passed empty `findingIds`/focus fields, and `ResumeChecker.tsx` duplicated stale handoff state.
- **Exact fix:**
  - Passed full `focusSkill`, `selectedBullet`, `selectedSection`, `findingIds`, `evidenceIds` from `FixTheseFirst.tsx` and `ResumeChecker.tsx` while removing the conflicting `useHandoffStore` Tailor write from `ResumeChecker.tsx`.
  - Stored `launchFocus` on `TailorWorkspaceSession` and surfaced focus highlighting in `TailorDocumentCanvas.tsx`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` verifies `launchFocus.focusSkill === 'Kubernetes'` and `launchFocus.selectedBullet` preservation on hydration.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Bullet text matching for visual highlighting in Canvas uses normalized substring matching and will no longer highlight if the user completely rewrites the target bullet.

## Defect 4 — Canonical ATS Re-Analysis Attributed Unsaved Draft Edits to Parent Version & Left Stale Override JD Requirements
- **Original defect:** Re-scoring an edited draft before committing a child version wrote `versionId = parentVersionId` into the ATS audit log, and providing an override JD text updated ATS score without updating `requirements` / `strategyPlan`.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** `runCanonicalReanalysis` reused `committedVersionId ?? parentVersionId` unconditionally and ignored `overrideJdText` when building requirements.
- **Exact fix:**
  - Compared the serialized draft snapshot hash against the committed/parent version snapshot hash; when un-committed edits exist, records `versionId: null`, labels the audit entry with `(Unsaved Draft Snapshot)`, and sets `reanalysisIsDraftSnapshot: true`.
  - When `overrideJdText` is supplied, updates JD requirements and recalculates strategy plans cleanly.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"never attributes unsaved edited draft ATS scans to parentVersionId and syncs override JD requirements"`.
- **Actual test result:** Passed in Vitest (`task-8093`).
- **Remaining limitation:** Until `commitTailoredVersion` is clicked, re-analysis history rows intentionally link to the snapshot hash rather than a version ID.
