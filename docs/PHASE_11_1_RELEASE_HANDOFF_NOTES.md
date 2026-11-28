# HireFlow — Phase 11.1 Release Handoff & Preserved Invariants

## Remaining External Setup Before Cloud Production Launch
- Configure Google OAuth & Supabase Auth redirect URLs in Supabase Dashboard & Google Cloud Console.
- Apply migrations in strict chronological order to target Supabase project:
  1. `supabase/migrations/0001_candidate_os.sql`
  2. `supabase/migrations/0002_cloud_first_schema_and_storage.sql`
  3. `supabase/migrations/0003_storage_private_bucket.sql`
  4. `supabase/migrations/0004_tailoring_workspace.sql`
- Verify Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) before running remote smoke verification.

## Preserved Repository Invariants
- Authoritative 7D ATS scoring engine (`4.0.0-ats7d`) and pillar weights remain completely unmodified.
- [docs/validation-report.md](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/docs/validation-report.md) was not altered.
- Guest / Demo sessions keep all tailoring state strictly in memory and wipe cleanly on `signOut` via `resetAllUserMemoryStores()`.
- Legacy `src/lib/tailor/*` exports remain intact with optional strict behavior flags (`preserveEmptyBullets`) so all 19 pre-existing Tailor unit test suites remain green.
