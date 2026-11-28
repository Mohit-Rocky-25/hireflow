# Phase 11.1.3 — Full Migration Sequence & Cloud Readiness Report

## Scope
Sequential audit of `supabase/migrations/0001_candidate_os.sql`, `0002_cloud_first_schema_and_storage.sql`, `0003_storage_private_bucket.sql`, and `0004_tailoring_workspace.sql` via `supabase/tests/migration.test.ts`.

---

## 1. Migration Sequence & Execution Environment

| Order | Migration File | Purpose | Verified In |
|---|---|---|---|
| 1 | `0001_candidate_os.sql` | Core tables (`user_profiles`, `text_snapshots`, `resume_workspaces`, `resume_versions`, `audit_entries`, `journal_events`, `watchlist_targets`, `plan_items`, `outreach_drafts`, `gap_status`), `reject_stale_update()` LWW trigger, initial `erase_my_data()` | **PGlite** (live SQL execution with `auth.uid()` shim) |
| 2 | `0002_cloud_first_schema_and_storage.sql` | `saved_jds`, `user_documents` (`storage_bucket = 'user-documents'`), `feedback_items`, `legacy_import_receipts`, composite ownership FKs, grants, updated `erase_my_data()` | **PGlite** (live SQL execution) |
| 3 | `0003_storage_private_bucket.sql` | Private bucket `user-documents` (5 MB max, strict MIME allowlist) and `storage.objects` RLS policies (`(storage.foldername(name))[1] = (select auth.uid())::text`) | **Static SQL inspection only** (PGlite lacks Supabase `storage.objects`) |
| 4 | `0004_tailoring_workspace.sql` | `tailoring_sessions`, `tailoring_changes`, `export_artifacts`, composite `(user_id, ...)` audit/snapshot FKs, `lww_*` triggers, least-privilege grants, 17-table `erase_my_data()` | **PGlite** (live SQL execution) |

---

## 2. Security & Schema Checks Verified
- **RLS & Cross-User Isolation:** Verified across core, `0002`, and `0004` tables in PGlite (`User B` sees `0` rows of `User A`).
- **Composite Ownership FKs:** Verified `tailoring_sessions` rejects cross-user `source_audit_id` references and applies `ON DELETE SET NULL (col)` cleanly.
- **LWW Concurrency Triggers:** Verified `reject_stale_update()` raises `STALE_UPDATE` on stale `updated_at` writes for `tailoring_sessions` and `tailoring_changes`.
- **Least-Privilege Grants:** `public` and `anon` revoked; `authenticated` granted only required CRUD and `execute on function public.erase_my_data()`.

---

## 3. Remote Activation Preconditions (Not Yet Executed)
- Remote Supabase Postgres migrations (`0001`–`0004`) and real Google OAuth PKCE redirect URIs have **not** been applied or tested against a remote Supabase project in this environment.
- Static inspection of `0003_storage_private_bucket.sql` is **not** counted as live runtime verification of Supabase Storage.
