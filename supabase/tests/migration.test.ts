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

describe('Candidate OS & Cloud-First Supabase SQL Migrations (0001 + 0002 + 0003)', () => {
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
    await db.exec(sql0001);
    await db.exec(sql0002);
  });

  afterAll(async () => {
    await db?.close();
  });

  it('enables RLS on all 14 tables and locks immutable grants on core append-only tables', async () => {
    await asOwner();
    const { rows } = await db.query<{ relname: string; relrowsecurity: boolean }>(`
      select relname, relrowsecurity from pg_class
      join pg_namespace n on n.oid = pg_class.relnamespace
      where n.nspname = 'public' and relkind = 'r'
      order by relname;
    `);
    expect(rows.length).toBe(14);
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

  it('validates 0003_storage_private_bucket.sql enforces private 5MB bucket & per-user folder RLS', () => {
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
});
