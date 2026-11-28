# HireFlow — Phase 11.1 Additive Cloud Schema Readiness (`0004_tailoring_workspace.sql`)

**Migration:** [0004_tailoring_workspace.sql](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/supabase/migrations/0004_tailoring_workspace.sql)
**Typed Definitions:** [database.types.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/supabase/database.types.ts)
**Local Verification:** [migration.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/supabase/tests/migration.test.ts) (PGlite)

## Additive Tables Added
1. `public.tailoring_sessions`: Stores tailoring session metadata (`mode`, `draft_status`, `entry_source`, `layout_id`), composite `(user_id, workspace_id)` / `(user_id, parent_version_id)` / `(user_id, produced_version_id)` foreign keys, target metadata, SHA-256 `jd_snapshot_hash`, serialized `document_state`, `user_confirmations`, and baseline/reanalysis scores.
2. `public.tailoring_changes`: Granular per-suggestion truth-gate & acceptance audit trail linked via composite FK `(user_id, session_id)` on `delete cascade`.
3. `public.export_artifacts`: Append-only export ledger (`format` in `pdf`/`docx`/`md`, file name, byte size <= 5 MB) linked to `tailoring_sessions` and `resume_versions`.

## Security, RLS & Account Deletion
- Every table enables Row Level Security with owner policies (`user_id = (select auth.uid())`) and least-privilege privileges (`revoke all ... from public, anon, authenticated` followed by explicit `select, insert, update, delete` grants for mutable tables and `select, insert, delete` for append-only `export_artifacts`).
- `public.erase_my_data()` (`security definer set search_path = ''`) is updated atomically to delete from all 17 user-owned tables across `0001`, `0002`, and `0004` in valid FK order (`export_artifacts` -> `tailoring_changes` -> `tailoring_sessions` -> ... -> `text_snapshots` -> `user_profiles`).
- Zero remote Supabase migrations were executed in this phase; schema is validated locally via PGlite.
