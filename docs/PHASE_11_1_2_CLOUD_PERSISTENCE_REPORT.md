# Phase 11.1.2 — Cloud Persistence & Account Isolation Report

## Scope
Wired full client-to-Supabase repository synchronization, hydration, error disclosure, stale async write protection, and Demo/Guest ephemeral disclosure across `src/sync/mappers.ts`, `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/cloudHydrator.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/TailorWorkspacePage.tsx`, and `src/features/tailor/components/TailorEntryView.tsx`.

---

## Defect 1 — Tailoring Sessions, Changes & Export Artifacts Not Wired to `CloudRepository` / Hydrator
- **Original defect:** Phase 11.1 created `0004_tailoring_workspace.sql`, but `mappers.ts`, `cloudRepository.ts`, `cloudHydrator.ts`, and `useTailorWorkspaceStore.ts` only kept tailoring drafts and export records in browser RAM.
- **Source file:** `src/sync/mappers.ts`, `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/cloudHydrator.ts`, `src/features/tailor/store/useTailorWorkspaceStore.ts`
- **Root cause:** Row mappers, snapshot-ensuring upsert helpers, hydration loaders, and store mutation hooks for `tailoring_sessions`, `tailoring_changes`, and `export_artifacts` were unimplemented.
- **Exact fix:**
  - Added bidirectional domain <-> DB row mappers (`tailoringSessionToRow`, `rowToTailoringSession`, `tailoringChangeToRow`, `exportArtifactToRow`, etc.) in `src/sync/mappers.ts`.
  - Added snapshot-ensuring CRUD (`upsertTailoringSession`, `upsertTailoringChange`, `deleteTailoringSession`, `upsertExportArtifact`) and `loadAllUserData` fetching in `src/lib/cloud/cloudRepository.ts`.
  - Updated `applyHydratedDataset` and `resetAllUserMemoryStores` (`src/lib/cloud/cloudHydrator.ts`) so sign-in hydrates user tailoring sessions/artifacts and sign-out/user-switch clears in-memory Tailor state.
  - Added `isCloudAuthenticated(auth)` (`auth.status === 'authenticated' && !auth.isDemo && Boolean(auth.userId)`), `persistSessionToCloud`, `deleteDraft`, `hydrateFromCloudSessions`, and cloud persistence on `commitTailoredVersion`, `linkProjectEvidence`, and `recordExportArtifact` in `src/features/tailor/store/useTailorWorkspaceStore.ts`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` — `"persists, hydrates, handles write failures, guards stale async saves, and isolates users via CloudRepository"` (exercising in-memory `CloudGateway`).
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`), verifying upsert -> logout reset -> cross-user `USER_2` isolation -> `USER_1` restore -> cloud delete.
- **Remaining limitation:** Tested in this environment against an in-memory `CloudGateway` mock; live Supabase network persistence depends on applying SQL migrations and configuring active Supabase project credentials.

## Defect 2 — Silent Cloud Failure & Stale Async Save Overwriting Newer Revisions
- **Original defect:** Failed cloud saves were silently swallowed, out-of-order async save completions could mark newer local edits `'saved'`, and Demo Mode could mislead users into assuming reload persistence.
- **Source file:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/TailorWorkspacePage.tsx`, `src/features/tailor/components/TailorEntryView.tsx`
- **Root cause:** No `syncRevision` monotonic counter or explicit `cloudSyncStatus` (`'idle' | 'saving' | 'saved' | 'error'`) / `cloudSyncError` tracking existed on sessions, and UI lacked explicit Demo RAM vs Cloud Save banners.
- **Exact fix:**
  - Added `syncRevision`, `cloudSyncStatus`, and `cloudSyncError` to `TailorWorkspaceSession`; async `persistSessionToCloud` captures start `syncRevision` and ignores `'saved'` transitions if a newer edit bumped `syncRevision` mid-flight, while failures set `cloudSyncStatus: 'error'` with `cloudSyncError`.
  - Added `Save Draft` / `Retry Save` controls and explicit `'Demo RAM Draft (No Reload Persistence)'` vs `'Cloud Saved'` / `'Cloud Save Error'` badges in `TailorWorkspacePage.tsx`, plus Demo transient disclosure in `TailorEntryView.tsx`.
- **New regression test:** `tests/phase11_1_2RemediationAndCorpus.test.ts` tests simulated write failure (`cloudSyncStatus === 'error'`) and mid-flight revision bump (`writeDelayMs = 40` followed by `updateBulletText`, asserting `cloudSyncStatus !== 'saved'`).
- **Actual test result:** Passed in Vitest (`task-8085`, `task-8093`); Demo RAM Draft badge also verified in live Chromium (`task-8155` / `task-8172`).
- **Remaining limitation:** Offline retry queues are manual (`Retry Save` / `Save Draft`) rather than background Service Worker sync.
