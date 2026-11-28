-- HireFlow Phase 11.1 Additive Cloud Schema:
-- Tailoring Workspace Sessions, Granular Tailoring Changes, and Export Artifacts.
-- Additive only; preserves 0001, 0002, and 0003 immutability and RLS isolation.

-- 1. Tailoring Sessions (draft workspace state, provenance, target context)
create table public.tailoring_sessions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  mode text not null check (mode in ('improve', 'role', 'jd')),
  draft_status text not null check (
    draft_status in (
      'new',
      'in_progress',
      'under_review',
      'ready_for_validation',
      'validated',
      'version_created',
      'archived'
    )
  ),
  entry_source text not null check (
    entry_source in (
      'resume_roaster',
      'talentlens',
      'dual_jd',
      'my_space',
      'resume_matrix',
      'direct',
      'upload',
      'paste',
      'resumed_draft'
    )
  ),
  workspace_id uuid,
  parent_version_id uuid,
  source_snapshot_hash text check (source_snapshot_hash is null or source_snapshot_hash ~ '^[0-9a-f]{64}$'),
  produced_version_id uuid,
  produced_snapshot_hash text check (produced_snapshot_hash is null or produced_snapshot_hash ~ '^[0-9a-f]{64}$'),
  source_audit_id uuid,
  reanalysis_audit_id uuid,
  talentlens_assessment_id uuid,
  dual_jd_comparison_id uuid,
  target_role text not null default '' check (char_length(target_role) <= 160),
  target_industry text not null default '' check (char_length(target_industry) <= 120),
  target_seniority text not null default '' check (char_length(target_seniority) <= 80),
  jd_title text not null default '' check (char_length(jd_title) <= 200),
  jd_company text not null default '' check (char_length(jd_company) <= 160),
  jd_snapshot_hash text check (jd_snapshot_hash is null or jd_snapshot_hash ~ '^[0-9a-f]{64}$'),
  layout_id text not null default 'ats_single' check (
    layout_id in ('ats_single', 'executive', 'technical', 'academic_research', 'graduate_concise')
  ),
  document_state jsonb not null default '{}'::jsonb,
  user_confirmations jsonb not null default '[]'::jsonb,
  baseline_score int check (baseline_score is null or baseline_score between 0 and 100),
  reanalysis_score int check (reanalysis_score is null or reanalysis_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  check (octet_length(document_state::text) <= 400000),
  foreign key (user_id, workspace_id) references public.resume_workspaces(user_id, id) on delete set null (workspace_id),
  foreign key (user_id, parent_version_id) references public.resume_versions(user_id, id) on delete set null (parent_version_id),
  foreign key (user_id, produced_version_id) references public.resume_versions(user_id, id) on delete set null (produced_version_id),
  foreign key (user_id, source_audit_id) references public.audit_entries(user_id, id) on delete set null (source_audit_id),
  foreign key (user_id, reanalysis_audit_id) references public.audit_entries(user_id, id) on delete set null (reanalysis_audit_id),
  foreign key (user_id, source_snapshot_hash) references public.text_snapshots(user_id, hash) on delete set null (source_snapshot_hash),
  foreign key (user_id, produced_snapshot_hash) references public.text_snapshots(user_id, hash) on delete set null (produced_snapshot_hash),
  foreign key (user_id, jd_snapshot_hash) references public.text_snapshots(user_id, hash) on delete set null (jd_snapshot_hash)
);
create index tailoring_sessions_updated_idx on public.tailoring_sessions (user_id, updated_at desc);
create trigger lww_tailoring_sessions before update on public.tailoring_sessions for each row execute function public.reject_stale_update();

-- 2. Granular Tailoring Changes (per-suggestion auditability & truth-gate record)
create table public.tailoring_changes (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  session_id uuid not null,
  section_id text not null check (char_length(section_id) between 1 and 80),
  bullet_id text check (bullet_id is null or char_length(bullet_id) <= 80),
  original_text text not null check (char_length(original_text) <= 2000),
  proposed_text text not null check (char_length(proposed_text) <= 2000),
  provenance_kind text not null check (char_length(provenance_kind) between 1 and 40),
  evidence_class text not null check (
    evidence_class in (
      'directly_supported',
      'supported_paraphrase',
      'partially_supported',
      'user_confirmed',
      'unsupported',
      'contradicted'
    )
  ),
  truth_gate_passed boolean not null default false,
  status text not null check (status in ('pending', 'accepted', 'rejected', 'edited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, session_id) references public.tailoring_sessions(user_id, id) on delete cascade
);
create index tailoring_changes_session_idx on public.tailoring_changes (user_id, session_id, created_at desc);
create trigger lww_tailoring_changes before update on public.tailoring_changes for each row execute function public.reject_stale_update();

-- 3. Export Artifacts (traceability between tailored versions, audits, and exported files)
create table public.export_artifacts (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  session_id uuid,
  source_version_id uuid,
  source_audit_id uuid,
  format text not null check (format in ('pdf', 'docx', 'md')),
  file_name text not null check (char_length(file_name) between 1 and 255),
  byte_size int not null check (byte_size >= 0 and byte_size <= 5242880),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, session_id) references public.tailoring_sessions(user_id, id) on delete set null (session_id),
  foreign key (user_id, source_version_id) references public.resume_versions(user_id, id) on delete set null (source_version_id),
  foreign key (user_id, source_audit_id) references public.audit_entries(user_id, id) on delete set null (source_audit_id)
);
create index export_artifacts_created_idx on public.export_artifacts (user_id, created_at desc);

-- 4. Enable Row Level Security
alter table public.tailoring_sessions enable row level security;
alter table public.tailoring_changes enable row level security;
alter table public.export_artifacts enable row level security;

-- 5. Policies scoped strictly to authenticated owner via (select auth.uid())
create policy tailoring_sessions_sel on public.tailoring_sessions for select to authenticated using (user_id = (select auth.uid()));
create policy tailoring_sessions_ins on public.tailoring_sessions for insert to authenticated with check (user_id = (select auth.uid()));
create policy tailoring_sessions_upd on public.tailoring_sessions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy tailoring_sessions_del on public.tailoring_sessions for delete to authenticated using (user_id = (select auth.uid()));

create policy tailoring_changes_sel on public.tailoring_changes for select to authenticated using (user_id = (select auth.uid()));
create policy tailoring_changes_ins on public.tailoring_changes for insert to authenticated with check (user_id = (select auth.uid()));
create policy tailoring_changes_upd on public.tailoring_changes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy tailoring_changes_del on public.tailoring_changes for delete to authenticated using (user_id = (select auth.uid()));

create policy export_artifacts_sel on public.export_artifacts for select to authenticated using (user_id = (select auth.uid()));
create policy export_artifacts_ins on public.export_artifacts for insert to authenticated with check (user_id = (select auth.uid()));
create policy export_artifacts_del on public.export_artifacts for delete to authenticated using (user_id = (select auth.uid()));

-- 6. Least-privilege grants
revoke all on public.tailoring_sessions, public.tailoring_changes, public.export_artifacts from public, anon, authenticated;
grant select, insert, update, delete on public.tailoring_sessions, public.tailoring_changes to authenticated;
grant select, insert, delete on public.export_artifacts to authenticated;

-- 7. Extend Self-Service Account Erasure RPC across all 17 user-owned tables
create or replace function public.erase_my_data() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated'; end if;
  delete from public.export_artifacts where user_id = uid;
  delete from public.tailoring_changes where user_id = uid;
  delete from public.tailoring_sessions where user_id = uid;
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
