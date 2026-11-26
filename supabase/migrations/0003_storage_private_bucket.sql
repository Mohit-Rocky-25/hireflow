-- HireFlow Private Supabase Storage Configuration (Phase 10.8)
-- Creates private bucket `user-documents` (5 MB max, strict MIME allowlist)
-- and enforces user-scoped folder ownership on storage.objects via auth.uid().
-- Note: PGlite unit tests mock Supabase's storage schema; run against remote
-- Supabase SQL editor or `supabase db push` for live Storage enforcement.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-documents',
  'user-documents',
  false,
  5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/json'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists user_documents_select_own on storage.objects;
create policy user_documents_select_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists user_documents_insert_own on storage.objects;
create policy user_documents_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists user_documents_update_own on storage.objects;
create policy user_documents_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists user_documents_delete_own on storage.objects;
create policy user_documents_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
