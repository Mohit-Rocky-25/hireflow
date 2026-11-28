# Phase 11.1.3 — Account & Private Storage Erasure Report

## Scope
Audit and hardening of `eraseAllUserCloudData` (`src/lib/cloud/cloudRepository.ts`), `LiveSupabaseGateway.listUserStoragePaths` / `removeStorageFiles` / `eraseMyDataRpc` (`src/sync/supabaseGateway.ts`), and Postgres `public.erase_my_data()` (`supabase/migrations/0004_tailoring_workspace.sql`).

---

## 1. Release-Blocking Gap Found & Fixed
- **Original gap:** `LiveSupabaseGateway.listUserStoragePaths(userId)` previously queried only `user_documents.storage_path`. Any orphaned file in the private `user-documents` bucket under `${userId}/...` (failed DB insert, deleted metadata row, JD upload, or PDF/DOCX/MD export object) would not be listed or removed during account erasure.
- **Fix implemented:**
  - Updated `LiveSupabaseGateway.listUserStoragePaths(userId)` (`src/sync/supabaseGateway.ts`) to combine `user_documents.storage_path`, `export_artifacts.storage_path`, **and** a recursive `supabase.storage.from('user-documents').list(prefix)` walk under `${userId}`, strictly filtered to `path.startsWith(`${userId}/`)`.
  - Updated `cloudRepository.eraseAllUserCloudData(userId)` (`src/lib/cloud/cloudRepository.ts`) to:
    1. Enforce `assertSessionOwnership(userId)` (authenticated `auth.uid()` must equal `userId`; client-supplied IDs are rejected).
    2. Delete all user-scoped Storage objects FIRST via `removeStorageFiles(scopedPaths)` (propagating any Storage failure before touching/claiming DB completion).
    3. Execute `eraseMyDataRpc()` (`public.erase_my_data()` `SECURITY DEFINER` using `auth.uid()` across all 17 user-owned tables).
    4. Clear in-memory snapshot cache and return `{ storageCleared: true, databaseCleared: true, deletedPaths }`.

---

## 2. Verification (`tests/phase11_1_3IntegrityGate.test.ts`)
Verified against `CloudGateway` mock:
- **Authorization:** Passing a mismatched `userId` (`OTHER_ID !== auth.uid()`) throws and aborts before listing or deleting anything.
- **Separate failure boundary:** Simulated Storage deletion failure aborts `eraseAllUserCloudData` loudly, leaving `user_documents` intact and never claiming erasure.
- **Complete cleanup:** Removes resume upload, JD upload, PDF/DOCX/MD exports, and orphaned bucket objects (`6/6` `${userId}/...` objects) while leaving `'other-user-999/resumes/private.pdf'` untouched and clearing `user_documents` (`0` rows).

---

## 3. Honest Remote Boundary
- Bucket deletion mechanics and Postgres `erase_my_data()` RPC were verified separately in unit tests (in-memory `CloudGateway` mock) and PGlite (`0004` SQL function execution), respectively. Live Supabase Storage API execution against `storage.objects` requires a remote Supabase project.
