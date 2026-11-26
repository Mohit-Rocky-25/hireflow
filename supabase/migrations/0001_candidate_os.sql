-- HireFlow Candidate OS: schema, immutability, RLS, least-privilege grants.
-- Safe to run once on a fresh Supabase project (SQL editor or `supabase db push`).

create table public.text_snapshots (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hash text not null check (hash ~ '^[0-9a-f]{64}$'),
  body text not null check (char_length(body) <= 80000),
  char_count int not null check (char_count >= 0),
  word_count int not null check (word_count >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, hash)
);

create table public.resume_workspaces (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  name text not null check (char_length(name) between 1 and 120),
  role_track text not null default '' check (char_length(role_track) <= 120),
  is_primary boolean not null default false,
  head_version_id uuid,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  archived_at timestamptz,
  primary key (user_id, id)
);

create table public.resume_versions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  workspace_id uuid not null,
  parent_version_id uuid,
  label text not null check (char_length(label) between 1 and 160),
  snapshot_hash text not null,
  source text not null check (source in ('upload','paste','tailor','branch','manual_edit')),
  note text check (char_length(note) <= 500),
  source_file_name text check (char_length(source_file_name) <= 255),
  created_at timestamptz not null,
  primary key (user_id, id),
  foreign key (user_id, workspace_id) references public.resume_workspaces(user_id, id) on delete cascade,
  foreign key (user_id, snapshot_hash) references public.text_snapshots(user_id, hash) on delete restrict
);

-- Immutable audit journal. The composite foreign keys make "snapshot-locked" a database guarantee:
-- an audit cannot exist without the exact resume and JD text it was scored against.
create table public.audit_entries (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  kind text not null check (kind in ('ats_roast','talentlens','jd_compare','tailor')),
  created_at timestamptz not null,
  engine_version text not null,
  run_key text not null check (run_key ~ '^[0-9a-f]{64}$'),
  target_key text not null,
  resume_workspace_id uuid,
  resume_version_id uuid,
  resume_snapshot_hash text not null,
  resume_label text not null,
  jd_snapshot_hash text not null,
  jd_meta jsonb not null,
  overall_score int not null check (overall_score between 0 and 100),
  breakdown jsonb not null,
  gaps jsonb not null,
  strengths jsonb not null,
  evidence jsonb not null,
  findings jsonb not null,
  delta jsonb,
  primary key (user_id, id),
  unique (user_id, run_key),
  check (octet_length(findings::text) <= 950000),
  foreign key (user_id, resume_snapshot_hash) references public.text_snapshots(user_id, hash) on delete restrict,
  foreign key (user_id, jd_snapshot_hash) references public.text_snapshots(user_id, hash) on delete restrict
);
create index audit_entries_target_idx on public.audit_entries (user_id, target_key, created_at desc);
create index audit_entries_created_idx on public.audit_entries (user_id, created_at desc);

create table public.journal_events (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  type text not null,
  created_at timestamptz not null,
  target_key text,
  ref_id text,
  summary text not null check (char_length(summary) <= 500),
  payload jsonb,
  primary key (user_id, id)
);
create index journal_events_created_idx on public.journal_events (user_id, created_at desc);

create table public.watchlist_targets (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  target_key text not null,
  company_id text,
  role_id text,
  company_name text not null,
  role_title text,
  jd_snapshot_hash text,
  added_at timestamptz not null,
  archived_at timestamptz,
  updated_at timestamptz not null,
  primary key (user_id, id),
  unique (user_id, target_key)
);

create table public.plan_items (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  kind text not null check (kind in ('build_brief','credential')),
  ref_id text not null,
  title text not null,
  status text not null check (status in ('planned','in_progress','done')),
  linked_gap_ids jsonb not null default '[]'::jsonb,
  target_key text,
  added_from_audit_id uuid,
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  completed_at timestamptz,
  primary key (user_id, id)
);

create table public.outreach_drafts (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  template_id text not null,
  channel text not null,
  status text not null check (status in ('draft','sent','replied','archived')),
  slots jsonb not null,
  rendered_text text not null check (char_length(rendered_text) <= 10000),
  target_key text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id)
);

create table public.gap_status (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_key text not null,
  gap_id text not null,
  status text not null check (status in ('open','addressed_pending_rescan','resolved')),
  plan_item_id uuid,
  still_detected boolean not null default false,
  updated_at timestamptz not null,
  primary key (user_id, target_key, gap_id)
);

create table public.user_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  profile jsonb not null,
  settings jsonb not null,
  updated_at timestamptz not null
);

-- Last-write-wins guard: an older client write can never overwrite newer server state.
create or replace function public.reject_stale_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.updated_at < old.updated_at then
    return old;
  end if;
  return new;
end $$;

create trigger lww_resume_workspaces before update on public.resume_workspaces for each row execute function public.reject_stale_update();
create trigger lww_watchlist_targets before update on public.watchlist_targets for each row execute function public.reject_stale_update();
create trigger lww_plan_items before update on public.plan_items for each row execute function public.reject_stale_update();
create trigger lww_outreach_drafts before update on public.outreach_drafts for each row execute function public.reject_stale_update();
create trigger lww_gap_status before update on public.gap_status for each row execute function public.reject_stale_update();
create trigger lww_user_profiles before update on public.user_profiles for each row execute function public.reject_stale_update();

-- Row Level Security on every table.
alter table public.text_snapshots enable row level security;
alter table public.resume_workspaces enable row level security;
alter table public.resume_versions enable row level security;
alter table public.audit_entries enable row level security;
alter table public.journal_events enable row level security;
alter table public.watchlist_targets enable row level security;
alter table public.plan_items enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.gap_status enable row level security;
alter table public.user_profiles enable row level security;

-- Immutable tables: select + insert only.
create policy own_select on public.text_snapshots for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.text_snapshots for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_select on public.audit_entries for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.audit_entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_select on public.journal_events for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.journal_events for insert to authenticated with check (user_id = (select auth.uid()));

-- Mutable tables: full own-row access.
create policy own_all on public.resume_workspaces for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.resume_versions for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.watchlist_targets for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.plan_items for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.outreach_drafts for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.gap_status for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_all on public.user_profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Least privilege at the grant layer too (Supabase default privileges would otherwise grant ALL).
revoke all on public.text_snapshots, public.resume_workspaces, public.resume_versions, public.audit_entries,
  public.journal_events, public.watchlist_targets, public.plan_items, public.outreach_drafts,
  public.gap_status, public.user_profiles from anon, authenticated;

grant select, insert on public.text_snapshots, public.audit_entries, public.journal_events to authenticated;
grant select, insert, update, delete on public.resume_workspaces, public.resume_versions, public.watchlist_targets,
  public.plan_items, public.outreach_drafts, public.gap_status, public.user_profiles to authenticated;

-- The only way to erase the immutable journal: an explicit, authenticated, self-service erase.
create or replace function public.erase_my_data() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'not authenticated'; end if;
  delete from public.audit_entries where user_id = uid;
  delete from public.journal_events where user_id = uid;
  delete from public.gap_status where user_id = uid;
  delete from public.plan_items where user_id = uid;
  delete from public.outreach_drafts where user_id = uid;
  delete from public.watchlist_targets where user_id = uid;
  delete from public.resume_versions where user_id = uid;
  delete from public.resume_workspaces where user_id = uid;
  delete from public.text_snapshots where user_id = uid;
  delete from public.user_profiles where user_id = uid;
end $$;
revoke all on function public.erase_my_data() from public, anon;
grant execute on function public.erase_my_data() to authenticated;
