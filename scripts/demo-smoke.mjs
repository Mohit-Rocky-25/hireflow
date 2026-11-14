import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.VITE_DEMO_EMAIL;
const password = process.env.VITE_DEMO_PASSWORD;

async function run() {
  console.log('=== DEMO ACCOUNT SMOKE TEST ===');

  if (!url || !key || !email || !password || url.includes('dummy-local-instance')) {
    console.log('STATUS: SKIPPED');
    console.log('Reason: Active Supabase credentials or VITE_DEMO_EMAIL/PASSWORD not configured in environment.');
    process.exit(0);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Step 1: Sign in
  console.log('Step 1: Signing in as demo user...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    console.error('FAIL: Could not sign in:', authError?.message);
    process.exit(1);
  }
  console.log('PASS: Signed in as demo user', authData.user.id);

  // Step 2: Insert one snapshot
  console.log('Step 2: Inserting text snapshot...');
  const testHash = '0000000000000000000000000000000000000000000000000000000000000001';
  const testBody = 'Smoke test resume text body';
  const { error: snapError } = await supabase.from('text_snapshots').upsert({
    hash: testHash,
    body: testBody,
  }, { onConflict: 'hash', ignoreDuplicates: true });

  if (snapError) {
    console.error('FAIL: Snapshot insert failed:', snapError.message);
    process.exit(1);
  }
  console.log('PASS: Snapshot inserted with insert_ignore semantics');

  // Step 3: Insert one audit
  console.log('Step 3: Inserting audit entry...');
  const auditId = '00000000-0000-4000-8000-000000000001';
  const runKey = '0000000000000000000000000000000000000000000000000000000000000002';
  const { error: auditInsertError } = await supabase.from('audit_entries').insert({
    id: auditId,
    user_id: authData.user.id,
    tool_kind: 'ats_roast',
    engine_version: '3.4.0',
    run_key: runKey,
    target_key: 'smoke-target',
    resume_snapshot_hash: testHash,
    jd_snapshot_hash: testHash,
    resume_label: 'Smoke Version',
    jd_origin: 'talentlens',
    company_name: 'Smoke Company',
    role_title: 'Software Engineer',
    overall_score: 75,
    score_breakdown: [],
    gaps: [],
    strengths: [],
    evidence_spans: [],
    findings_json: {},
    created_at: new Date().toISOString(),
  });

  if (auditInsertError && !auditInsertError.message.includes('duplicate')) {
    console.error('FAIL: Audit insert failed:', auditInsertError.message);
    process.exit(1);
  }
  console.log('PASS: Audit inserted');

  // Step 4: Attempt update on audit (must fail via immutability trigger)
  console.log('Step 4: Attempting update on immutable audit (must be refused)...');
  const { error: updateError } = await supabase
    .from('audit_entries')
    .update({ overall_score: 99 })
    .eq('id', auditId);

  if (!updateError) {
    console.error('FAIL: Audit update was not refused!');
    process.exit(1);
  }
  console.log('PASS: Audit update refused by DB trigger:', updateError.message);

  // Step 5: Attempt delete on audit (must fail via immutability trigger)
  console.log('Step 5: Attempting delete on immutable audit (must be refused)...');
  const { error: deleteError } = await supabase
    .from('audit_entries')
    .delete()
    .eq('id', auditId);

  if (!deleteError) {
    console.error('FAIL: Audit delete was not refused!');
    process.exit(1);
  }
  console.log('PASS: Audit delete refused by DB trigger:', deleteError.message);

  // Step 6: Insert same audit again (assert rejected as duplicate)
  console.log('Step 6: Inserting same audit again (must be rejected as duplicate)...');
  const { error: dupError } = await supabase.from('audit_entries').insert({
    id: auditId,
    user_id: authData.user.id,
    tool_kind: 'ats_roast',
    engine_version: '3.4.0',
    run_key: runKey,
    target_key: 'smoke-target',
    resume_snapshot_hash: testHash,
    jd_snapshot_hash: testHash,
    resume_label: 'Smoke Version',
    jd_origin: 'talentlens',
    company_name: 'Smoke Company',
    role_title: 'Software Engineer',
    overall_score: 75,
    score_breakdown: [],
    gaps: [],
    strengths: [],
    evidence_spans: [],
    findings_json: {},
    created_at: new Date().toISOString(),
  });

  if (!dupError) {
    console.error('FAIL: Duplicate audit was not rejected!');
    process.exit(1);
  }
  console.log('PASS: Duplicate audit correctly rejected:', dupError.message);

  // Step 7: Sign out
  await supabase.auth.signOut();
  console.log('PASS: Signed out cleanly.');
  console.log('=== SMOKE TEST COMPLETE: ALL PASS ===');
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

