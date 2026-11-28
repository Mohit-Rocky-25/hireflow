# Phase 11.1.4.1 — Cloud Activation Dependencies & Server-Side Design

## Scope
Documents the exact server-side dependencies deferred to the future Cloud Activation phase. None of these are activated or modified in Phase 11.1.4.1.

---

## 1. Cross-Tab / Cross-Device Upload & Erasure Enforcement
- **Current local protection:** `isAccountErasureInProgress(userId)` blocks concurrent `uploadPrivateDocument` calls within the same JS runtime, and `eraseAllUserCloudData` runs a bounded 3-attempt post-DB rescan.
- **Future server-side requirement:**
  - Add an `erasing_at timestamptz` / `account_status` column (or deletion lock table) on `user_profiles` / `account_state` set atomically at the start of server-side erasure (`begin_account_erasure()`).
  - Update `storage.objects` `INSERT`/`UPDATE` RLS policies and `user_documents` `INSERT` RLS policies to reject writes whenever `erasing_at is not null` for `auth.uid()`.
  - Execute Storage deletion + `erase_my_data()` via an authenticated Supabase Edge Function or transactional admin cleanup job so uploads from other tabs, devices, or direct API tokens are blocked atomically on the server.

## 2. Live Remote Verification Checklist (Not Yet Executed)
1. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in staging/production environment.
2. Apply `0001_candidate_os.sql`, `0002_cloud_first_schema_and_storage.sql`, `0003_storage_private_bucket.sql`, and `0004_tailoring_workspace.sql` in order against live Supabase Postgres.
3. Verify `user-documents` private bucket creation, `storage.objects` RLS policies (cross-user access denied), and Google OAuth PKCE redirect/callback flow.
4. Run live end-to-end tests for upload, signed URL download, delete, `erase_my_data()`, and multi-tab concurrency.
