# Phase 10.8 — External Setup & Remote Verification Guide

This guide documents **exact external configuration steps** required in Google Cloud Console, Supabase Dashboard, `.env.local`, and hosting settings before HireFlow operates against live hosted Supabase Postgres, Supabase Auth (Google OAuth PKCE), and Supabase Private Storage.

> [!IMPORTANT]
> Local codebase implementation, build gates, SQL schema validation (via `@electric-sql/pglite`), unit/integration suites, and local Playwright runtime checks are completed in the repository. Live remote OAuth redirects, live Supabase RLS enforcement, and live `user-documents` Storage uploads/signed downloads **remain pending** until you complete the external setup steps below.

---

## Step 1 — Google Cloud Console (Google OAuth Client)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create your HireFlow project.
2. Navigate to **APIs & Services -> OAuth consent screen**:
   - Choose **External** (or Internal for Google Workspace-only testing).
   - App Name: `HireFlow`
   - Support Email & Developer Contact Email: your project maintainer email.
   - Scopes: ensure `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile` are included.
   - If kept in **Testing** status initially, add test Gmail addresses under **Test users** (or publish to Production when ready).
3. Navigate to **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:4173`
     - `https://<your-production-domain>`
   - Authorized redirect URIs:
     - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
4. Copy the generated **Client ID** and **Client Secret**.

---

## Step 2 — Supabase Project & Google Provider Setup

1. Create or open your project in [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication -> Providers -> Google**:
   - Toggle **Google Enabled** ON.
   - Paste the **Client ID** and **Client Secret** from Step 1.
   - Save changes.
3. Navigate to **Authentication -> URL Configuration**:
   - **Site URL**: `https://<your-production-domain>` (or `http://localhost:5173` while testing locally).
   - **Redirect URLs** (add every callback URL used across dev, preview, and production):
     - `http://localhost:5173/auth/callback`
     - `http://localhost:4173/auth/callback`
     - `https://<your-production-domain>/auth/callback`

---

## Step 3 — Apply SQL Schema, RLS Policies & Storage Bucket Migrations

Apply the three ordered migrations cleanly to your remote Supabase database using either the **Supabase CLI** or **Supabase Dashboard -> SQL Editor**:

### Option A — Supabase CLI
```bash
supabase login
supabase link --project-ref <your-supabase-project-ref>
supabase db push
```

### Option B — Supabase SQL Editor (Run Strictly in Order)
1. [0001_candidate_os.sql](../supabase/migrations/0001_candidate_os.sql) — Core Candidate OS tables (`user_profiles`, `text_snapshots`, `resume_workspaces`, `resume_versions`, `audit_entries`, `journal_events`, `watchlist_targets`, `plan_items`, `outreach_drafts`, `gap_status`), immutable grants, LWW triggers, and initial `erase_my_data()`.
2. [0002_cloud_first_schema_and_storage.sql](../supabase/migrations/0002_cloud_first_schema_and_storage.sql) — Adds `saved_jds`, `user_documents`, `feedback_items`, `legacy_import_receipts`, strict per-user RLS policies `(select auth.uid())`, least-privilege `authenticated` grants, and updated `erase_my_data()` covering all 14 user tables.
3. [0003_storage_private_bucket.sql](../supabase/migrations/0003_storage_private_bucket.sql) — Creates private bucket `user-documents` (`public = false`, `5242880` byte cap, strict PDF/DOCX/TXT/MD/JSON MIME allowlist) and `storage.objects` folder isolation policies (`(storage.foldername(name))[1] = (select auth.uid())::text`).

---

## Step 4 — Verify Storage & Schema Policies in Supabase Dashboard

1. Open **Storage -> Buckets**:
   - Confirm `user-documents` exists with **Public bucket = OFF** (`false`), **File size limit = 5 MB (5,242,880 bytes)**, and allowed MIME types configured.
2. Open **Authentication -> Policies**:
   - Verify RLS is **Enabled** on all 14 `public.*` tables and `storage.objects` (`user_documents_select_own`, `user_documents_insert_own`, `user_documents_update_own`, `user_documents_delete_own`).

---

## Step 5 — Configure Environment Variables (Never Commit Real Values)

Copy [.env.example](../.env.example) to `.env.local` for local verification, and configure the same keys in your deployment provider (Vercel / Netlify / Cloudflare Pages):

```dotenv
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-publishable-anon-key>
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

> [!CAUTION]
> - Never set `service_role` keys in any `VITE_*` variable or commit `.env` / `.env.local`. `src/lib/supabase/env.ts` actively parses JWT role claims at runtime and throws `AUTH_NOT_CONFIGURED` if a `service_role` JWT is accidentally placed into `VITE_SUPABASE_ANON_KEY`.

---

## Step 6 — Tomorrow's Live Remote Verification Checklist

Run the application locally against `.env.local` (`npm run dev`) or open your deployed preview URL:

1. **Google OAuth PKCE Login & Reload Persistence**:
   - Visit `/login` -> click **Continue with Google** -> complete Google consent -> confirm redirect lands cleanly on `/auth/callback`, exchanges PKCE code without errors, populates user email/avatar in navbar, and survives full page reload (`F5`).
2. **Postgres Cloud Round-Trip**:
   - Upload/paste a resume, run an ATS scan on `/tools/resume-checker`, save a JD on `/jd-library` (or Roaster), and add a target -> inspect Supabase Table Editor to verify rows exist under your `session.user.id`.
   - Open an Incognito window or second browser -> sign in with the same Google account -> verify all resumes, audits, saved JDs, and targets hydrate from Supabase.
3. **Private Storage (`user-documents`) Upload & Signed URL Access**:
   - Upload a valid PDF or DOCX resume while signed in -> verify entry appears under **Private Cloud Documents** on `/data` and inside Supabase Storage under `<user_id>/resume_upload/<doc_id>/...`.
   - Click **Signed Download** on `/data` -> confirm short-lived `/storage/v1/object/sign/user-documents/...` URL downloads the original file cleanly; verify anonymous direct URL access fails with `403` / `404`.
4. **Two-User RLS Isolation Check**:
   - Sign out -> sign in with a **second** Google account (Account B) -> verify zero resumes, audits, saved JDs, or private documents from Account A appear in UI state or network queries, and direct REST queries for Account A IDs return 0 rows.
5. **Cloud Account Erasure Check (`erase_my_data`)**:
   - On `/data` with a test account -> click **Erase All Data** -> enter `CLEAR` -> confirm Supabase removes all Postgres rows across all 14 tables AND deletes Storage files under `<user_id>/`.
