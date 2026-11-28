# Phase 11.1.4.1 — Private Storage Erasure Integrity Audit

## 1. Original Defects & Risks
1. **No in-process concurrent upload lock:** `uploadPrivateDocument` (`src/lib/cloud/storageService.ts`) could initiate a new upload in the same client runtime while `eraseAllUserCloudData` was executing.
2. **Single-pass post-DB rescan:** `eraseAllUserCloudData` (`src/lib/cloud/cloudRepository.ts`) ran only one post-DB rescan pass, without a bounded retry loop.

## 2. Actual Code Path & Implementation Changes
- **Files:** `src/lib/cloud/cloudRepository.ts`, `src/lib/cloud/storageService.ts`, `src/sync/supabaseGateway.ts`
- **Changes:**
  - Added synchronous `activeErasureUsers.add(userId)` (cleared in `finally`) and exported `isAccountErasureInProgress(userId)` in `cloudRepository.ts` before `await assertSessionOwnership(userId)`.
  - Updated `uploadPrivateDocument` in `storageService.ts` to reject immediately (`CloudWriteFailedError`) when `isAccountErasureInProgress(params.userId)` is active (checked both post-auth and pre-upload).
  - Replaced single post-DB rescan with bounded `MAX_ERASURE_RESCAN_ATTEMPTS = 3` cleanup/rescan loop in `eraseAllUserCloudData`; if any user-scoped object still remains after 3 attempts, throws `Incomplete account erasure: ...` so complete erasure is never falsely claimed.
  - Preserved `PAGE_SIZE = 1000` `offset` pagination in `listUserStoragePaths` and `100`-path batching in `removeStorageFiles` (`supabaseGateway.ts`).

## 3. Regression Test & Verification Result
- **Test:** `tests/phase11_1_4_1Hardening.test.ts` — `"handles >1000 nested/orphan/export objects, blocks concurrent in-process uploads during erasure, recovers from partial delete, catches rescan leftovers, and rejects stubborn objects"` + `tests/phase11_1_4ReleaseCandidate.test.ts`.
- **Result:** Passed (`55 / 55` Vitest files, `592 / 592` tests in `task-8431`), verifying >1,000 paginated objects, nested folders, orphans, resume/JD/PDF/DOCX/MD exports, cross-user isolation, partial delete failure & retry, concurrent in-process upload rejection, rescan leftover cleanup, and stubborn object rejection.

## 4. Local vs Server-Side Boundary
- **Local (implemented):** In-process `activeErasureUsers` upload lock + bounded rescan loop + strict `${userId}/` prefix filtering.
- **Not local (requires server-side enforcement):** Cross-tab, cross-browser, and cross-device concurrent uploads during account erasure cannot be prevented by an in-memory JS `Set`. Those require the future server-side enforcement documented in `docs/PHASE_11_1_4_1_CLOUD_ACTIVATION_DEPENDENCIES.md`.
