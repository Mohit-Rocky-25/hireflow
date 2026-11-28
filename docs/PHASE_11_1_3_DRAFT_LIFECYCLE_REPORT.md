# Phase 11.1.3 — Draft Lifecycle & Cloud Durability Report

## Scope
Complete mutation audit of `src/features/tailor/store/useTailorWorkspaceStore.ts` and repository persistence boundaries (`src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/cloudHydrator.ts`).

---

## 1. Complete Mutation Matrix (`useTailorWorkspaceStore.ts`)

| Mutation / Action | Marks Session Dirty (`syncRevision++`, `cloudSyncStatus: 'idle' \| 'demo_ephemeral'`) | Auto-Triggers `persistSessionToCloud` |
|---|---|---|
| `createSessionFromText`, `hydrateFromLaunchContext`, `createSessionFromWorkspace` | Initializes `syncRevision: 1` | Yes (when `isCloudAuthenticated(auth)`) |
| Manual edits (`updateHeader`, `updateSummary`, `updateSkills`, `updateBulletText`, `setLayout`, `setPaperSize`, section/entry/bullet add/remove/reorder) via `pushUndoAndUpdateDoc` | **Yes** | Manual (`Save Draft` / `Retry Save`) |
| `undo` / `redo` | **Yes** (fixed in Phase 11.1.3 via `markSessionDirty`) | Manual (`Save Draft` / `Retry Save`) |
| `acceptSuggestion` | **Yes** (uses `pushUndoAndUpdateDoc`) | Manual (`Save Draft` / `Retry Save`) |
| `rejectSuggestion` / `editSuggestionProposedText` | **Yes** (fixed in Phase 11.1.3 via `markSessionDirty`) | Manual (`Save Draft` / `Retry Save`) |
| `confirmUserEvidence` | **Yes** (fixed in Phase 11.1.3 via `markSessionDirty` even without `bulletId`) | Manual (`Save Draft` / `Retry Save`) |
| `setMode` / `setTargetContext` | **Yes** (fixed in Phase 11.1.3 via `markSessionDirty`) | Manual (`Save Draft` / `Retry Save`) |
| `linkProjectEvidence` (confirmed ownership) | **Yes** | Yes (when `isCloudAuthenticated(auth)`) |
| `commitTailoredVersion` | **Yes** | Yes (when `isCloudAuthenticated(auth)`) |
| `recordExportArtifact` | **No** (appends to `exportHistory` only) | Saves export artifact (`cloudRepository.saveExportArtifact`) when `isCloudAuthenticated(auth)` |
| `deleteDraft` | Deletes session | Yes (`cloudRepository.deleteTailoringSession`) |

---

## 2. Save Mode & UI State Accuracy
- **Saving behavior:** Hybrid — **automatic** on session creation and major lifecycle milestones (`linkProjectEvidence`, `commitTailoredVersion`; `recordExportArtifact` persists the `export_artifacts` row directly), and **manual** (`Save Draft` / `Retry Save` button in `TailorWorkspacePage.tsx`) for inline edits (`undo`, `redo`, suggestion triage, mode/target switches).
- **UI indicators:**
  - Authenticated Cloud mode shows `'Cloud Saved'`, `'Saving...'`, `'Cloud Save Error'`, or `'Unsaved Cloud Changes'`.
  - Stale async save protection: `persistSessionToCloud` captures `revisionSent` and suppresses `'saved'` if `latest.syncRevision > revisionSent`.
  - Demo / Guest mode explicitly discloses `'Demo RAM Draft (No Reload Persistence)'` and never writes resume PII to permanent browser `localStorage` or `IndexedDB`.

---

## 3. Repository Boundary Verification & Remote Boundary
- Verified create, dirty tracking (`updateHeader`, `undo`, `redo`, `confirmUserEvidence`, `setMode`; `rejectSuggestion`, `editSuggestionProposedText`, and `setTargetContext` verified via `markSessionDirty` inspection in `useTailorWorkspaceStore.ts`), manual save, hydration restore (`loadAllUserData` + `applyHydratedDataset`), write-failure surfacing (`cloudSyncStatus === 'error'`), stale revision guard, and delete against an in-memory `CloudGateway` mock (`tests/phase11_1_3IntegrityGate.test.ts`, `tests/phase11_1_2RemediationAndCorpus.test.ts`).
- **Remote boundary:** Live Supabase network persistence remains **unverified** until active Supabase credentials and migrations are configured in the target environment.
