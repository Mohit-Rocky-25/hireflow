# HireFlow Phase 10.8 — Row Level Security, Auth & Browser Privacy Audit

## 1. Purpose & Security Posture

This document records the repository-level security and privacy audit for HireFlow's Cloud-First transition (Phase 10.8), explicitly separating **controls verified locally** (codebase static checks, PGlite SQL execution, mocked gateway tests, and live Chromium dist/ runtime inspection) from **live remote controls pending tomorrow's hosted Supabase & Google Cloud setup**.

---

## 2. Elimination of Durable Browser User Storage & Fake Auth

| Legacy Surface | Action Taken | Verification Basis |
|---|---|---|
| Legacy local storage adapters (`src/lib/storage/*`, `src/lib/backup/*`) | **Deleted** (9 modules removed) | Zero imports in `src/`; `tsc` + `tests/ats/phase10_8CloudFirstArchitecture.test.ts` |
| Legacy offline outbox & sync simulation (`src/sync/outbox.ts`, `syncEngine.ts`, `memoryTransport.ts`, `supabaseTransport.ts`, `src/lib/sync/*`) | **Deleted** (10 modules removed) | Replaced by direct `supabaseGateway` + `cloudRepository` + `CloudSyncBanner` fail-loud Retry |
| Fake Google account chooser & local password hashes (`demoAuth.ts`, `guestMigration.ts`, `AuthModal.tsx`, `LoginPage.tsx`) | **Deleted / Rewritten** | Uses real `signInWithGoogle` (`flowType: 'pkce'`, `prompt: 'select_account'`); verified in `LoginPage` E2E |
| Hardcoded `'Mohit'` identity fallbacks (`useAuthStore.ts`, `OverviewSection.tsx`, `useTalentLensStore.ts`) | **Removed** | Neutral `'Candidate'` / unauthenticated fallback; verified in `tests/mySpaceUi.test.tsx` & `phase10_8CloudFirstArchitecture.test.ts` |
| Production demo auth bypass (`e2eHarness.ts`) | **Gated** behind `!import.meta.env.PROD` | `readE2EHarnessUser()` returns `null` when `import.meta.env.PROD` is true |
| Zustand `persist()` stores (`profileStore`, `savedJdStore`, `scanHistoryStore`, `savedRoleStore`, `briefProgressStore`, `feedbackStore`, `useMySpaceStore`, `useResumeStore`, `useAuditStore`, `atsStore`, `coverLetterStore`, `outreachStore`, `salaryStore`, `interviewStore`, `jobTrackerStore`, `portfolioStore`, `tailorStore`) | **Converted to pure in-memory Zustand stores** | Verified by `phase10_8CloudFirstRuntime.spec.ts` & `phase10_7SecurityRuntime.spec.ts` (`localStorage` & IndexedDB contain zero candidate PII during Guest ATS flows) |
| Legacy browser storage cleanup (`purgeInsecureLegacyCredentialKeys` vs `purgeLegacyBrowserUserData`) | **Separated cleanly** | App startup clears stale auth/outbox/demo keys while preserving pre-cloud user records read-only for `/data` one-time import; `signOut()` and explicit `Erase All Data -> CLEAR` purge all user browser keys and post `{ type: 'CLEAR_USER_CACHES' }` to `public/sw.js` |

### Allowed Browser Storage Keys (Strictly Audited)
1. **Non-PII UI Preferences**: `hireflow:v4:design`, `hireflow:v4:theme-mode` (`localStorage`), `hf_seen_cinematic` (`sessionStorage`).
2. **Supabase Auth PKCE Session State**: Standard `sb-*-auth-token` PKCE state managed by `@supabase/supabase-js`, plus transient `hireflow:returnTo` (validated by `validateReturnToPath` in `src/features/auth/authErrors.ts` to prevent open redirects).

---

## 3. Supabase Database & Storage Security Controls

### 3.1 Module Import Boundaries & Env Hardening
- `src/lib/supabase/env.ts` blocks `service_role` keys via JWT payload `role` inspection, enforces HTTPS (or localhost HTTP for development), and refuses unconfigured remote requests.
- `src/__guarantees__/importBoundaries.test.ts` enforces that `@supabase/supabase-js` is imported ONLY inside `src/features/auth/`, and `supabaseClient.ts` is imported ONLY inside `src/features/auth/` and `src/sync/`.

### 3.2 Postgres RLS Matrix (All 14 `public.*` Tables)
All 14 tables (`user_profiles`, `text_snapshots`, `resume_workspaces`, `resume_versions`, `audit_entries`, `journal_events`, `watchlist_targets`, `plan_items`, `outreach_drafts`, `gap_status`, `saved_jds`, `user_documents`, `feedback_items`, `legacy_import_receipts`):
- Default `user_id uuid not null default auth.uid()` referencing `auth.users(id) on delete cascade`.
- `revoke all on ... from public, anon` paired with least-privilege `authenticated` grants (no `UPDATE`/`DELETE` grants on append-only tables `text_snapshots`, `resume_versions`, `audit_entries`, `journal_events`).
- RLS enabled (`enable row level security`) with explicit per-operation `(select auth.uid()) = user_id` policies.
- Complete deletion RPC `public.erase_my_data()` runs as `security definer set search_path = ''`, raises `'not authenticated'` when `auth.uid() is null`, is revoked from `public, anon`, and deletes rows belonging strictly to `auth.uid()` across all 14 tables.

### 3.3 Private Storage Bucket (`user-documents`)
- Bucket created in `supabase/migrations/0003_storage_private_bucket.sql` with `public = false`, `file_size_limit = 5242880` (5 MB), and MIME allowlist (`application/pdf`, DOCX, `text/plain`, `text/markdown`, `application/json`).
- Four `storage.objects` RLS policies (`user_documents_select_own`, `user_documents_insert_own`, `user_documents_update_own`, `user_documents_delete_own`) enforce `(storage.foldername(name))[1] = (select auth.uid())::text`.
- Application `storageService.ts` generates temporary **signed URLs** only (`createSignedDownloadUrl`), never `getPublicUrl`, and cleans up orphan Storage blobs if Postgres `user_documents` metadata upsert fails.

---

## 4. Audit Verification Scope (Today vs Tomorrow)

- **Verified Locally Today**:
  - `supabase/tests/migration.test.ts` via `@electric-sql/pglite` executes migrations `0001`–`0003`, tests `auth.uid()` ownership constraints, unique constraints, byte-size bounds, `storage.objects` policies, and `erase_my_data()` across all 14 tables.
  - `src/__tests__/security/storage-auth.test.ts`, `tests/candidate_os/auth.test.ts`, `tests/ats/phase10_8CloudFirstArchitecture.test.ts`, and `tests/ats/phase10_6PrivacySyncSw.test.ts` verify cross-user memory isolation, `signOut` wipe, Service Worker `CLEAR_USER_CACHES`, `CloudSyncBanner` fail-loud retries, and mocked `CloudGateway` cross-account isolation.
  - `npm run privacy:check`, `npm run security:secrets` (0 Critical / 0 High), `npm run security:bundle`, and Chromium `phase10_7SecurityRuntime.spec.ts` verify CSP (`theme-init.js`, no `'unsafe-inline'`), zero unauthorized egress, and clean `dist/` output.
- **Pending Tomorrow Against Hosted Supabase**:
  - Live SQL execution of `0001`–`0003` via `supabase db push`.
  - Live two-user (`User A` vs `User B`) RLS read/write denial test against hosted Supabase PostgREST and `storage.objects` (`user-documents`).
  - Live Google OAuth PKCE redirect & session reload verification in browser.
