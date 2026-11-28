import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

let db: PGlite;
const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';
const DOC_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const JD_A = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const FB_A = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

async function asUser(userId: string) {
  await db.exec(`select set_config('request.jwt.claim.sub', '${userId}', false);`);
  await db.exec('set role authenticated;');
}

async function asAnon() {
  await db.exec(`select set_config('request.jwt.claim.sub', '', false);`);
  await db.exec('set role anon;');
}

async function asOwner() {
  await db.exec('reset role;');
}

describe('Candidate OS & Cloud-First Supabase SQL Migrations (0001 + 0002 + 0004 PGlite SQL Execution; 0003 Static Storage Policy Inspection)', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to anon, authenticated;
      grant usage on schema public to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users (id) values ('${USER_A}'), ('${USER_B}');
    `);
    const sql0001 = fs.readFileSync(
      path.resolve('supabase/migrations/0001_candidate_os.sql'),
      'utf8'
    );
    const sql0002 = fs.readFileSync(
      path.resolve('supabase/migrations/0002_cloud_first_schema_and_storage.sql'),
      'utf8'
    );
    const sql0004 = fs.readFileSync(
      path.resolve('supabase/migrations/0004_tailoring_workspace.sql'),
      'utf8'
    );
    await db.exec(sql0001);
    await db.exec(sql0002);
    await db.exec(sql0004);
  });

  afterAll(async () => {
    await db?.close();
  });

  it('enables RLS on all 17 tables and locks immutable grants on core append-only tables', async () => {
    await asOwner();
    const { rows } = await db.query<{ relname: string; relrowsecurity: boolean }>(`
      select relname, relrowsecurity from pg_class
      join pg_namespace n on n.oid = pg_class.relnamespace
      where n.nspname = 'public' and relkind = 'r'
      order by relname;
    `);
    expect(rows.length).toBe(17);
    for (const r of rows) {
      expect(r.relrowsecurity, `RLS enabled on ${r.relname}`).toBe(true);
    }

    await asUser(USER_A);
    await db.query(
      `insert into public.text_snapshots (hash, body, char_count, word_count) values ($1, $2, $3, $4)`,
      ['a'.repeat(64), 'hello', 5, 1]
    );
    await expect(db.query(`update public.text_snapshots set body = 'hacked'`)).rejects.toThrow();
    await expect(db.query(`delete from public.text_snapshots`)).rejects.toThrow();
  });

  it('enforces RLS isolation across saved_jds, user_documents, feedback_items, legacy_import_receipts', async () => {
    await asUser(USER_A);
    await db.query(
      `insert into public.saved_jds (id, title, company, source, text_body, text_hash, tags)
       values ($1, 'Backend SDE', 'Stripe', 'pasted', 'Go PostgreSQL Kafka', $2, '["go"]'::jsonb)`,
      [JD_A, 'b'.repeat(64)]
    );

    await db.query(
      `insert into public.user_documents (id, doc_kind, storage_path, file_name, mime_type, byte_size, sha256)
       values ($1, 'resume_upload', $2, 'resume.pdf', 'application/pdf', 1024, $3)`,
      [DOC_A, `${USER_A}/resume_upload/${DOC_A}/resume.pdf`, 'c'.repeat(64)]
    );

    await db.query(
      `insert into public.feedback_items (id, target_kind, rule_id, verdict, engine_version)
       values ($1, 'ats_rule', 'must_have', 'up', '4.0.0-ats7d')`,
      [FB_A]
    );

    await db.query(
      `insert into public.legacy_import_receipts (import_key, record_counts)
       values ($1, '{"savedJds":1}'::jsonb)`,
      ['d'.repeat(64)]
    );

    // Reject spoofed user_documents path pointing outside USER_A prefix or >5MB
    await expect(
      db.query(
        `insert into public.user_documents (id, doc_kind, storage_path, file_name, mime_type, byte_size, sha256)
         values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'resume_upload', '${USER_B}/hack.pdf', 'hack.pdf', 'application/pdf', 100, $1)`,
        ['e'.repeat(64)]
      )
    ).rejects.toThrow();

    await expect(
      db.query(
        `insert into public.user_documents (id, doc_kind, storage_path, file_name, mime_type, byte_size, sha256)
         values ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'resume_upload', '${USER_A}/big.pdf', 'big.pdf', 'application/pdf', 6000000, $1)`,
        ['f'.repeat(64)]
      )
    ).rejects.toThrow();

    // Switch to User B: cannot see User A rows
    await asUser(USER_B);
    expect((await db.query('select * from public.saved_jds')).rows).toHaveLength(0);
    expect((await db.query('select * from public.user_documents')).rows).toHaveLength(0);
    expect((await db.query('select * from public.feedback_items')).rows).toHaveLength(0);
    expect((await db.query('select * from public.legacy_import_receipts')).rows).toHaveLength(0);

    // Anonymous caller denied
    await asAnon();
    await expect(db.query('select * from public.saved_jds')).rejects.toThrow();
    await expect(db.query('select * from public.user_documents')).rejects.toThrow();
  });

  it('erase_my_data() erases User A across 0001 + 0002 tables while preserving User B rows', async () => {
    await asUser(USER_B);
    await db.query(
      `insert into public.saved_jds (id, title, company, source, text_body, text_hash)
       values ('99999999-9999-4999-8999-999999999999', 'User B Role', 'Co', 'pasted', 'Rust Python', $1)`,
      ['9'.repeat(64)]
    );

    await asUser(USER_A);
    await db.query('select public.erase_my_data()');

    expect((await db.query('select * from public.text_snapshots')).rows).toHaveLength(0);
    expect((await db.query('select * from public.saved_jds')).rows).toHaveLength(0);
    expect((await db.query('select * from public.user_documents')).rows).toHaveLength(0);
    expect((await db.query('select * from public.feedback_items')).rows).toHaveLength(0);
    expect((await db.query('select * from public.legacy_import_receipts')).rows).toHaveLength(0);

    await asUser(USER_B);
    expect((await db.query('select * from public.saved_jds')).rows).toHaveLength(1);
  });

  it('inspects 0003_storage_private_bucket.sql at policy-string level (Supabase storage.objects cannot execute inside local PGlite)', () => {
    const sql0003 = fs.readFileSync(
      path.resolve('supabase/migrations/0003_storage_private_bucket.sql'),
      'utf8'
    );
    expect(sql0003).toContain("'user-documents'");
    expect(sql0003).toContain('false');
    expect(sql0003).toContain('5242880');
    expect(sql0003).toContain("(storage.foldername(name))[1] = (select auth.uid())::text");
    expect(sql0003).toContain('for select');
    expect(sql0003).toContain('for insert');
    expect(sql0003).toContain('for update');
    expect(sql0003).toContain('for delete');
  });

  it('enforces RLS, composite audit/snapshot FKs, LWW triggers & erase_my_data() across 0004_tailoring_workspace.sql', async () => {
    const SESSION_A = '12121212-1212-4121-8121-121212121212';
    const CHANGE_A = '13131313-1313-4131-8131-131313131313';
    const ARTIFACT_A = '14141414-1414-4141-8141-141414141414';
    const SESSION_B = '23232323-2323-4232-8232-232323232323';
    const BAD_AUDIT = '77777777-7777-4777-8777-777777777777';

    await asUser(USER_A);
    await db.query(
      `insert into public.text_snapshots (hash, body, char_count, word_count) values ($1, 'resume body', 11, 2)`,
      ['1'.repeat(64)]
    );

    // Reject dangling source_audit_id FK
    await expect(
      db.query(
        `insert into public.tailoring_sessions (id, title, mode, draft_status, entry_source, source_audit_id)
         values ($1, 'Bad Audit FK', 'jd', 'in_progress', 'resume_roaster', $2)`,
        [SESSION_A, BAD_AUDIT]
      )
    ).rejects.toThrow();

    await db.query(
      `insert into public.tailoring_sessions (id, title, mode, draft_status, entry_source, source_snapshot_hash, updated_at)
       values ($1, 'Stripe Backend Draft', 'jd', 'in_progress', 'resume_roaster', $2, '2026-11-28T10:00:00Z')`,
      [SESSION_A, '1'.repeat(64)]
    );

    // Verify LWW trigger rejects stale update_at timestamp on tailoring_sessions
    await db.query(
      `update public.tailoring_sessions set title = 'Stale Title', updated_at = '2026-11-28T09:00:00Z' where id = $1`,
      [SESSION_A]
    );
    const afterStale = await db.query<{ title: string }>(
      `select title from public.tailoring_sessions where id = $1`,
      [SESSION_A]
    );
    expect(afterStale.rows[0].title).toBe('Stripe Backend Draft');

    await db.query(
      `insert into public.tailoring_changes (id, session_id, section_id, original_text, proposed_text, provenance_kind, evidence_class, truth_gate_passed, status, updated_at)
       values ($1, $2, 'sec_experience', 'Worked on APIs', 'Built backend APIs', 'full_time', 'supported_paraphrase', true, 'accepted', '2026-11-28T10:00:00Z')`,
      [CHANGE_A, SESSION_A]
    );
    await db.query(
      `insert into public.export_artifacts (id, session_id, format, file_name, byte_size)
       values ($1, $2, 'pdf', 'Candidate_Tailored.pdf', 4096)`,
      [ARTIFACT_A, SESSION_A]
    );

    await asUser(USER_B);
    expect((await db.query('select * from public.tailoring_sessions')).rows).toHaveLength(0);
    expect((await db.query('select * from public.tailoring_changes')).rows).toHaveLength(0);
    expect((await db.query('select * from public.export_artifacts')).rows).toHaveLength(0);

    await db.query(
      `insert into public.tailoring_sessions (id, title, mode, draft_status, entry_source)
       values ($1, 'User B Draft', 'improve', 'new', 'paste')`,
      [SESSION_B]
    );

    await asUser(USER_A);
    await db.query('select public.erase_my_data()');
    expect((await db.query('select * from public.tailoring_sessions')).rows).toHaveLength(0);
    expect((await db.query('select * from public.tailoring_changes')).rows).toHaveLength(0);
    expect((await db.query('select * from public.export_artifacts')).rows).toHaveLength(0);

    await asUser(USER_B);
    expect((await db.query('select * from public.tailoring_sessions')).rows).toHaveLength(1);
  });
});
