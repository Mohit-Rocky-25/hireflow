// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const H1 = 'a'.repeat(64), H2 = 'b'.repeat(64);
let db: PGlite;

async function asUser(uid: string | null, sql: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); ${uid ? 'set role authenticated;' : 'set role anon;'}`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
const audit = (uid: string, id: string, runKey: string, resumeHash = H1, jdHash = H2) =>
  `insert into public.audit_entries (user_id,id,kind,created_at,engine_version,run_key,target_key,resume_snapshot_hash,resume_label,jd_snapshot_hash,jd_meta,overall_score,breakdown,gaps,strengths,evidence,findings)
   values ('${uid}','${id}','ats_roast',now(),'1','${runKey}','tl:a:b','${resumeHash}','R','${jdHash}','{}',70,'[]','[]','[]','[]','{}')`;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `);
  await db.exec(readFileSync(new URL('../../sql/0001_candidate_os.sql', import.meta.url), 'utf8'));
  for (const u of [A, B]) {
    await asUser(u, `insert into public.text_snapshots (user_id,hash,body,char_count,word_count) values ('${u}','${H1}','resume',6,1),('${u}','${H2}','jd',2,1)`);
  }
});

describe('migration (real Postgres via PGlite)', () => {
  it('applies cleanly and enables RLS on every public table', async () => {
    const r = await db.query<{ relname: string; relrowsecurity: boolean }>(`select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'`);
    expect(r.rows).toHaveLength(10); expect(r.rows.every((x) => x.relrowsecurity)).toBe(true);
  });
  it('lets a user insert and read their own audit', async () => {
    await asUser(A, audit(A, '00000000-0000-4000-8000-000000000001', 'c'.repeat(64)));
    const r = await asUser(A, 'select id from public.audit_entries'); expect(r.rows).toHaveLength(1);
  });
  it('isolates users: B cannot see or insert as A', async () => {
    expect((await asUser(B, 'select id from public.audit_entries')).rows).toHaveLength(0);
    await expect(asUser(B, audit(A, '00000000-0000-4000-8000-000000000002', 'd'.repeat(64)))).rejects.toThrow();
  });
  it('audit_entries is immutable: update and delete are denied', async () => {
    await expect(asUser(A, `update public.audit_entries set overall_score = 1`)).rejects.toThrow(/permission denied/);
    await expect(asUser(A, `delete from public.audit_entries`)).rejects.toThrow(/permission denied/);
    await expect(asUser(A, `update public.text_snapshots set body='x'`)).rejects.toThrow(/permission denied/);
    await expect(asUser(A, `delete from public.journal_events`)).rejects.toThrow(/permission denied/);
  });
  it('rejects duplicate run_key (idempotent re-send) and out-of-range scores', async () => {
    await expect(asUser(A, audit(A, '00000000-0000-4000-8000-000000000003', 'c'.repeat(64)))).rejects.toThrow(/duplicate key/);
    await expect(asUser(A, audit(A, '00000000-0000-4000-8000-000000000004', 'e'.repeat(64)).replace(',70,', ',170,'))).rejects.toThrow(/check constraint/);
  });
  it('snapshot-lock is a database guarantee: audit requires its resume and JD snapshots', async () => {
    await expect(asUser(A, audit(A, '00000000-0000-4000-8000-000000000005', 'f'.repeat(64), '9'.repeat(64)))).rejects.toThrow(/foreign key/);
  });
  it('snapshots cannot be deleted while referenced', async () => {
    await expect(asUser(A, `delete from public.text_snapshots`)).rejects.toThrow(/permission denied/);
  });
  it('anon has no access at all', async () => {
    await expect(asUser(null, 'select 1 from public.audit_entries')).rejects.toThrow(/permission denied/);
    await expect(asUser(null, `select public.erase_my_data()`)).rejects.toThrow(/permission denied/);
  });
  it('last-write-wins trigger ignores stale updates and accepts newer ones', async () => {
    const id = '33333333-3333-4333-8333-333333333333';
    await asUser(A, `insert into public.plan_items (user_id,id,kind,ref_id,title,status,created_at,updated_at) values ('${A}','${id}','credential','c1','T','planned','2026-01-02','2026-01-02')`);
    await asUser(A, `update public.plan_items set status='done', updated_at='2026-01-01' where id='${id}'`);
    expect((await asUser(A, `select status from public.plan_items where id='${id}'`)).rows[0]).toEqual({ status: 'planned' });
    await asUser(A, `update public.plan_items set status='done', updated_at='2026-01-03' where id='${id}'`);
    expect((await asUser(A, `select status from public.plan_items where id='${id}'`)).rows[0]).toEqual({ status: 'done' });
  });
  it('erase_my_data removes only the caller\'s rows, including immutable ones', async () => {
    await asUser(B, audit(B, '00000000-0000-4000-8000-0000000000b1', '1'.repeat(64)));
    await asUser(A, 'select public.erase_my_data()');
    expect((await asUser(A, 'select id from public.audit_entries')).rows).toHaveLength(0);
    expect((await asUser(A, 'select hash from public.text_snapshots')).rows).toHaveLength(0);
    expect((await asUser(B, 'select id from public.audit_entries')).rows).toHaveLength(1);
  });
});
