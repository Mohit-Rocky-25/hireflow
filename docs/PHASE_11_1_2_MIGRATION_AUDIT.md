# Phase 11.1.2 — Migration Audit & Local PGlite Verification Report

## Scope
Hardened relational integrity and concurrency guards in `supabase/migrations/0004_tailoring_workspace.sql` and corrected `supabase/tests/migration.test.ts` to test those guarantees explicitly and accurately frame PGlite vs Supabase Storage scope.

---

## Defect 1 — Missing Composite FKs & LWW Concurrency Triggers in `0004_tailoring_workspace.sql`
- **Original defect:** `tailoring_sessions` referenced audit IDs and snapshot hashes without composite `(user_id, ...)` foreign keys against `audit_entries` / `text_snapshots`, and lacked `reject_stale_update()` last-write-wins (`lww_*`) triggers matching core tables.
- **Source file:** `supabase/migrations/0004_tailoring_workspace.sql`
- **Root cause:** Initial draft migration relied solely on app-layer conventions for `source_audit_id`, `reanalysis_audit_id`, `source_snapshot_hash`, and concurrent update ordering.
- **Exact fix:**
  - Added composite `(user_id, source_audit_id)` and `(user_id, reanalysis_audit_id)` FKs to `audit_entries(user_id, id) ON DELETE SET NULL (col)` and snapshot FKs to `text_snapshots(user_id, hash) ON DELETE SET NULL (hash_col)` across `tailoring_sessions`, `tailoring_changes`, and `export_artifacts`.
  - Added `lww_tailoring_sessions` and `lww_tailoring_changes` `BEFORE UPDATE` triggers executing `reject_stale_update()`.
- **New regression test:** `supabase/tests/migration.test.ts` — explicitly inserts sessions/changes/artifacts, verifies composite FKs block cross-user audit references while allowing valid composite references + `ON DELETE SET NULL (col)` behavior, and verifies `reject_stale_update()` raises `STALE_UPDATE` when updating with an older `updated_at`.
- **Actual test result:** Passed all 5 tests in `supabase/tests/migration.test.ts` (`task-8085`, `task-8093`).
- **Remaining limitation:** Remote Postgres execution was intentionally omitted (`Do not apply remote database migrations`).

## Defect 2 — Over-Claimed Proof of `0003_storage_private_bucket.sql` in PGlite Test Output
- **Original defect:** `supabase/tests/migration.test.ts` previously implied full runtime validation of `0003_storage_private_bucket.sql` even though PGlite lacks Supabase's managed `storage.objects` schema.
- **Source file:** `supabase/tests/migration.test.ts`
- **Root cause:** Test structure mixed PGlite DDL execution (`0001 + 0002 + 0004`) with static SQL inspection of `0003`.
- **Exact fix:** Separated local PGlite SQL execution (`0001_candidate_os.sql`, `0002_rls_and_views.sql`, `0004_tailoring_workspace.sql` plus `auth.uid()` shim) from explicit static policy inspection of `0003_storage_private_bucket.sql` (`bucket_id`, `(storage.foldername(name))[1] = auth.uid()::text`, RLS clauses).
- **New regression test:** `supabase/tests/migration.test.ts` static Storage RLS test + PGlite RLS cross-user isolation tests.
- **Actual test result:** Passed all 5 tests in Vitest (`task-8085`, `task-8093`).
- **Remaining limitation:** Local PGlite proves SQL syntax, schema, triggers, composite FKs, and Postgres `RLS` behavior under a synthetic `auth.uid()` shim — **not** proof of live Supabase Postgres deployment or managed Supabase `storage.objects` runtime behavior until migrations run against a real Supabase project.
