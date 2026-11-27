# Future Google OAuth & Supabase Integration Plan

## 1. Swapping `DemoAuthProvider` → `SupabaseAuthProvider`
Because `MySpaceWorkspacePage`, `RequireAuth`, `PublicNavbar`, and all tool routes depend exclusively on `useAuthStore` (`AuthIdentity`: `userId`, `displayName`, `email`, `provider`, `isDemo`), enabling real cloud authentication later requires **zero UI redesign**:

1. **External Setup (Deferred):** Configure Google Cloud Console OAuth Web Client + Supabase Auth Google Provider + Redirect URLs (`http://localhost:5173/auth/callback`, production domain `/auth/callback`) and apply `supabase/migrations/0001`–`0003`.
2. **Environment Configuration:** Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` / hosting environment variables.
3. **Automatic Provider Activation:** Once configured, `isSupabaseRuntimeConfigured()` becomes `true`, `AuthProvider` switches automatically to Supabase Auth PKCE (`signInWithGoogle`, `resolveSession`, `hydrateUserFromCloud`), and `cloudRepository` / `storageService` persist all user-owned Postgres rows and private `user-documents` blobs with database-enforced RLS.

## 2. Preserved Engineering Roadmap for Later Phases
- Connect **Resume Roaster** (`AuditEntry` + `ResumeVersion`) → **Tailor My Resume** → new `ResumeVersion` → **Resume Roaster Re-Analysis** → **My Space** delta progression.
- Connect **TalentLens** candidate/benchmark context → **Tailor My Resume**.
- Connect **Dual-JD Compare** → independent per-JD tailoring drafts.
- Connect **Reach Out Studio** (`/tools/reach-out`) → `useMySpaceStore.saveOutreachDraft()` so newly composed outreach messages appear automatically in My Space Outreach Vault.
