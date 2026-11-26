-- HireFlow Cloud-First Schema Extensions (Phase 10.8)
-- Adds saved_jds, user_documents (private Storage catalog), feedback_items,
-- legacy_import_receipts (idempotent one-time legacy import ledger),
-- updates erase_my_data() for complete account erasure, and enforces strict RLS.
-- Builds cleanly on top of 0001_candidate_os.sql without destructive changes.

-- 1. Saved Job Descriptions Library (cloud-backed JDs)
create table if not exists public.saved_jds (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  company text check (char_length(company) <= 200),
  source text not null check (source in ('pasted', 'talentlens', 'upload')),
  text_body text not null check (char_length(text_body) between 1 and 80000),
  text_hash text not null check (text_hash ~ '^[0-9a-f]{64}$'),
  tags jsonb not null default '[]'::jsonb,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, text_hash)
);
create index if not exists saved_jds_updated_idx on public.saved_jds (user_id, updated_at desc);

-- 2. Private User Documents Catalog (maps authenticated Postgres metadata <-> Private Storage object)
create table if not exists public.user_documents (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  doc_kind text not null check (doc_kind in ('resume_upload', 'jd_upload', 'exported_pdf', 'exported_docx', 'exported_md')),
  workspace_id uuid,
  version_id uuid,
  audit_id uuid,
  storage_bucket text not null default 'user-documents' check (storage_bucket = 'user-documents'),
  storage_path text not null,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (char_length(mime_type) between 1 and 160),
  byte_size int not null check (byte_size > 0 and byte_size <= 5242880),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, storage_path),
  check (storage_path like (user_id::text || '/%')),
  foreign key (user_id, workspace_id) references public.resume_workspaces(user_id, id) on delete set null,
  foreign key (user_id, version_id) references public.resume_versions(user_id, id) on delete set null,
  foreign key (user_id, audit_id) references public.audit_entries(user_id, id) on delete set null
);
create index if not exists user_documents_created_idx on public.user_documents (user_id, created_at desc);
create index if not exists user_documents_kind_idx on public.user_documents (user_id, doc_kind, created_at desc);

-- 3. Finding & Engine Feedback Items
create table if not exists public.feedback_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  target_kind text not null check (char_length(target_kind) between 1 and 80),
  rule_id text not null check (char_length(rule_id) between 1 and 160),
  verdict text not null check (verdict in ('up', 'down')),
  note text check (char_length(note) <= 1000),
  audit_id uuid,
  engine_version text not null check (char_length(engine_version) between 1 and 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, target_kind, rule_id),
  foreign key (user_id, audit_id) references public.audit_entries(user_id, id) on delete set null
);
create index if not exists feedback_items_updated_idx on public.feedback_items (user_id, updated_at desc);

-- 4. One-Time Legacy Browser Data Migration Ledger (prevents duplicate cloud imports)
create table if not exists public.legacy_import_receipts (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  import_key text not null check (import_key ~ '^[0-9a-f]{64}$'),
  imported_at timestamptz not null default now(),
  record_counts jsonb not null default '{}'::jsonb,
  source_summary jsonb not null default '{}'::jsonb,
  primary key (user_id, import_key)
);

-- 5. Last-Write-Wins Triggers on Mutable Tables
drop trigger if exists lww_saved_jds on public.saved_jds;
create trigger lww_saved_jds before update on public.saved_jds
  for each row execute function public.reject_stale_update();

drop trigger if exists lww_user_documents on public.user_documents;
create trigger lww_user_documents before update on public.user_documents
  for each row execute function public.reject_stale_update();

drop trigger if exists lww_feedback_items on public.feedback_items;
create trigger lww_feedback_items before update on public.feedback_items
  for each row execute function public.reject_stale_update();

-- 6. Enable Row Level Security
alter table public.saved_jds enable row level security;
alter table public.user_documents enable row level security;
alter table public.feedback_items enable row level security;
alter table public.legacy_import_receipts enable row level security;

-- 7. Explicit Per-Operation Ownership Policies (SELECT, INSERT, UPDATE, DELETE)
drop policy if exists own_select on public.saved_jds;
drop policy if exists own_insert on public.saved_jds;
drop policy if exists own_update on public.saved_jds;
drop policy if exists own_delete on public.saved_jds;
create policy own_select on public.saved_jds for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.saved_jds for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_update on public.saved_jds for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_delete on public.saved_jds for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists own_select on public.user_documents;
drop policy if exists own_insert on public.user_documents;
drop policy if exists own_update on public.user_documents;
drop policy if exists own_delete on public.user_documents;
create policy own_select on public.user_documents for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.user_documents for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_update on public.user_documents for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_delete on public.user_documents for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists own_select on public.feedback_items;
drop policy if exists own_insert on public.feedback_items;
drop policy if exists own_update on public.feedback_items;
drop policy if exists own_delete on public.feedback_items;
create policy own_select on public.feedback_items for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.feedback_items for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_update on public.feedback_items for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_delete on public.feedback_items for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists own_select on public.legacy_import_receipts;
drop policy if exists own_insert on public.legacy_import_receipts;
drop policy if exists own_delete on public.legacy_import_receipts;
create policy own_select on public.legacy_import_receipts for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.legacy_import_receipts for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_delete on public.legacy_import_receipts for delete to authenticated using (user_id = (select auth.uid()));

-- 8. Least-Privilege Table Grants
revoke all on public.saved_jds, public.user_documents, public.feedback_items, public.legacy_import_receipts
  from public, anon, authenticated;

grant select, insert, update, delete on public.saved_jds, public.user_documents, public.feedback_items
  to authenticated;
grant select, insert, delete on public.legacy_import_receipts to authenticated;

-- 9. Update Self-Service Account Erasure RPC to include all Phase 10.8 user-owned tables
create or replace function public.erase_my_data() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated'; end if;
  delete from public.user_documents where user_id = uid;
  delete from public.feedback_items where user_id = uid;
  delete from public.legacy_import_receipts where user_id = uid;
  delete from public.audit_entries where user_id = uid;
  delete from public.journal_events where user_id = uid;
  delete from public.gap_status where user_id = uid;
  delete from public.plan_items where user_id = uid;
  delete from public.outreach_drafts where user_id = uid;
  delete from public.watchlist_targets where user_id = uid;
  delete from public.saved_jds where user_id = uid;
  delete from public.resume_versions where user_id = uid;
  delete from public.resume_workspaces where user_id = uid;
  delete from public.text_snapshots where user_id = uid;
  delete from public.user_profiles where user_id = uid;
end $$;
revoke all on function public.erase_my_data() from public, anon;
grant execute on function public.erase_my_data() to authenticated;
