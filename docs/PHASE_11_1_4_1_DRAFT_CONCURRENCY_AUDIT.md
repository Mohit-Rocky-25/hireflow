# Phase 11.1.4.1 — Draft Save/Delete Linearizability Audit

## 1. Original Defects & Risks
1. **Unserialized delete vs queued save:** `deleteDraft` previously awaited only an already-started queue item instead of enqueuing itself inside `enqueueSessionPersist`, leaving a window where a second save or concurrent `deleteDraft` could race.
2. **Optimistic local deletion on remote failure:** `deleteDraft` removed the session from `state.sessions` before `cloudRepository.deleteTailoringSession` completed; if remote deletion failed, the draft vanished from UI while remaining in Postgres, preventing safe user retry.
3. **Stale hydration resurrection:** `hydrateFromCloudSessions` did not filter `deletedSessionIds`, allowing stale in-flight `loadAllUserData()` payloads to restore locally deleted drafts.

## 2. Actual Code Path & Implementation Changes
- **File:** `src/features/tailor/store/useTailorWorkspaceStore.ts`, `src/features/tailor/model/tailorWorkspaceTypes.ts`, `src/features/tailor/TailorWorkspacePage.tsx`
- **Changes:**
  - Updated `deleteDraft` (`Promise<boolean>`) to add `sessionId` to `deletedSessionIds` immediately and enqueue remote deletion onto `enqueueSessionPersist(sessionId, ...)` so all saves and deletes for a session form a single total order.
  - On remote deletion failure, `deleteDraft` leaves the session visible in `state.sessions` with `cloudSyncStatus: 'error'` and `cloudSyncError`, returning `false` so the user can safely retry. Only after remote deletion succeeds (or in Demo/Guest mode) is the session removed from `state.sessions` and `exportHistory`.
  - Updated `hydrateFromCloudSessions` to skip any session ID present in `deletedSessionIds`.
  - Preserved Phase 11.1.4 synchronous `curAtCall` / `revisionSent` capture and `lastSavedRevision` tracking inside `persistSessionToCloud`, plus `beforeunload` warning in `TailorWorkspacePage.tsx`.

## 3. Regression Test & Verification Result
- **Test:** `tests/phase11_1_4_1Hardening.test.ts` — `"guarantees linearizable ordering across in-flight saves, queued saves, edits, failed/retried deletes, stale hydration, and new sessions"` (using deferred promises and controlled network gates) + `tests/phase11_1_4ReleaseCandidate.test.ts`.
- **Result:** Passed (`55 / 55` Vitest files, `592 / 592` tests in `task-8431`), verifying:
  - Save A -> Edit -> Save B ordering preserves `lastSavedRevision === revAfterEdit`.
  - Two queued saves + delete -> saves drain -> delete fails honestly -> post-delete save rejected (`false`) -> retry delete succeeds (`0` cloud rows) -> stale hydration ignored -> new session receives a distinct UUID without inheriting old tombstones.

## 4. Remaining Limitation
- Linearizability (`enqueueSessionPersist`, `deletedSessionIds`, `lastSavedRevision`) is **in-process client protection** within a single browser tab/session. Multi-tab or multi-device concurrent edits rely on Postgres `reject_stale_update()` LWW triggers (`0001`/`0004`) rather than distributed locking.
