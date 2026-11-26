# HireFlow Supabase Postgres & Storage Schema

Authoritative SQL migrations live under `supabase/migrations/` and must be applied strictly in numerical order:
1. `0001_candidate_os.sql`
2. `0002_cloud_first_schema_and_storage.sql`
3. `0003_storage_private_bucket.sql`

---

## 1. Tables Overview (14 User-Owned Tables)

Every table uses composite ownership keys `(user_id, ...)` defaulting `user_id` to `auth.uid()` with `on delete cascade` referencing `auth.users(id)`, database-enforced **Row Level Security**, explicit `(select auth.uid())` per-operation policies, and `revoke all ... from public, anon`.

### From `0001_candidate_os.sql` (Core Candidate OS)

| Table | Primary Key | Immutability / Mutability | Notes |
|---|---|---|---|
| `public.user_profiles` | `user_id` | Mutable (`UPDATE` via `lww_user_profiles`) | Stores candidate profile JSON & preferences |
| `public.text_snapshots` | `(user_id, hash)` | **Append-Only** (`SELECT, INSERT` only) | SHA-256 deduplicated resume & JD text snapshots |
| `public.resume_workspaces` | `(user_id, id)` | Mutable (`UPDATE` via `lww_workspaces`) | Workspace tracks + `head_version_id` |
| `public.resume_versions` | `(user_id, id)` | **Append-Only** (`SELECT, INSERT` only) | Links `(user_id, workspace_id)` and `(user_id, snapshot_hash)` via composite FKs |
| `public.audit_entries` | `(user_id, id)` | **Append-Only** (`SELECT, INSERT` only) | Deterministic ATS & TalentLens evaluation records (`unique (user_id, run_key)`) |
| `public.journal_events` | `(user_id, id)` | **Append-Only** (`SELECT, INSERT` only) | Chronological candidate action timeline |
| `public.watchlist_targets` | `(user_id, id)` | Mutable (`UPDATE` via `lww_targets`) | Saved company/role targets (`unique (user_id, target_key)`) |
| `public.plan_items` | `(user_id, id)` | Mutable (`UPDATE` via `lww_plan_items`) | Build briefs & credential roadmap items |
| `public.outreach_drafts` | `(user_id, id)` | Mutable (`UPDATE` via `lww_outreach`) | Cold outreach templates & statuses |
| `public.gap_status` | `(user_id, target_key, gap_id)` | Mutable (`UPDATE` via `lww_gap_status`) | Evidence-gap resolution overlay |

### From `0002_cloud_first_schema_and_storage.sql` (Phase 10.8 Extensions)

| Table | Primary Key | Constraints & Indexes | Notes |
|---|---|---|---|
| `public.saved_jds` | `(user_id, id)` | `unique (user_id, text_hash)`, `char_length(text_body) between 1 and 80000`, `text_hash ~ '^[0-9a-f]{64}$'`, LWW trigger | Cloud-backed JD Library |
| `public.user_documents` | `(user_id, id)` | `storage_bucket = 'user-documents'`, `storage_path like (user_id::text || '/%')`, `byte_size > 0 and byte_size <= 5242880`, composite FKs (`on delete set null`) to workspaces/versions/audits, LWW trigger | Private uploaded PDF/DOCX/TXT/MD/JSON catalog |
| `public.feedback_items` | `(user_id, id)` | `unique (user_id, target_kind, rule_id)`, `verdict in ('up', 'down')`, FK (`on delete set null`) to `audit_entries`, LWW trigger | Engine/finding thumbs up/down feedback |
| `public.legacy_import_receipts` | `(user_id, import_key)` | `import_key ~ '^[0-9a-f]{64}$'` (`SELECT, INSERT, DELETE` grants) | Prevents duplicate imports during one-time legacy migration |

---

## 2. Private Supabase Storage (`0003_storage_private_bucket.sql`)

- **Bucket ID**: `user-documents`
- **Access**: Private (`public = false`)
- **Object Size Cap**: `5242880` bytes (5 MB, aligned with Phase 10.6 ingestion cap)
- **Allowed MIME Types**:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`
  - `text/markdown`
  - `application/json`
- **RLS Policies (`storage.objects`)**:
  Four separate policies (`user_documents_select_own`, `user_documents_insert_own`, `user_documents_update_own`, `user_documents_delete_own`) enforce:
  ```sql
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  ```

---

## 3. Complete Account Erasure RPC (`public.erase_my_data()`)

Defined in `0001_candidate_os.sql` and extended in `0002_cloud_first_schema_and_storage.sql`:
- Executes as `security definer set search_path = ''`.
- Rejects unauthenticated callers (`if uid is null then raise exception 'not authenticated'`).
- Revoked from `public, anon`; executable solely by `authenticated`.
- Deletes rows scoped to `user_id = (select auth.uid())` across **all 14 tables** in safe child-to-parent dependency order while keeping Storage cleanup orchestrated prior to database row removal in `cloudRepository.eraseAllUserCloudData(userId)`.
