import type {
  AuditEntry, CandidateProfile, Gap, GapOverlay, JournalEvent, OutreachDraft, PlanItem, ResumeVersion, ResumeWorkspace,
  TextSnapshot, WatchlistTarget,
} from '@/domain/types';
import { makeGapId } from '@/domain/ids';
import { applyRescan, markGapAddressed } from '@/features/journal/gapStatus';
import { planAuditRecord, snapshotOf, type RecordAuditInput } from '@/features/journal/auditRecorder';

export interface DemoDataset {
  profile: CandidateProfile;
  workspaces: ResumeWorkspace[];
  versions: ResumeVersion[];
  snapshots: TextSnapshot[];
  audits: AuditEntry[];
  targets: WatchlistTarget[];
  planItems: PlanItem[];
  drafts: OutreachDraft[];
  events: JournalEvent[];
  gapOverlay: GapOverlay;
}

const RESUME_BASE = [
  'Y. Mohit Sai', 'Backend engineer, distributed systems', '', 'Experience',
  'Improved p99 latency of a Spring Boot API by 40 percent.',
  'Built a REST service in Java handling 10k requests per day.', '', 'Skills', 'Java, Spring Boot, PostgreSQL, Docker, Redis',
];
const OUTBOX = 'Built a payments reconciliation service in Go handling 5k messages per second with a transactional outbox and change data capture into Kafka.';
const RAFT = 'Implemented Raft consensus in Go as a learning project, with leader election and log compaction.';
const K8S = 'Deployed services to Kubernetes on AWS with health checks and rolling updates.';
const JD_RAZORPAY = 'Software Development Engineer II (Backend)\nRequired: Go or Java, distributed systems, Kafka, transactional outbox, change data capture, distributed locking, AWS.\nPreferred: Redis, PostgreSQL, system design.';
const JD_GOOGLE = 'Software Engineer II (Systems)\nRequired: C++ or Go, distributed systems, consensus protocols, performance engineering.\nPreferred: Spanner-like storage, Raft, Paxos.';

const gap = (cat: Gap['category'], label: string, severity: Gap['severity']): Gap => ({ id: makeGapId(cat, label), category: cat, label, severity });
const G = {
  outbox: gap('skill', 'Transactional outbox', 3), cdc: gap('skill', 'Change data capture', 3), kafka: gap('skill', 'Kafka', 3),
  locking: gap('skill', 'Distributed locking', 2), aws: gap('skill', 'AWS', 2), redis: gap('skill', 'Redis evidence', 1),
};

function spans(text: string, terms: string[], kind: 'match' | 'weak') {
  const out: Array<{ start: number; end: number; findingId: string; kind: 'match' | 'weak' }> = [];
  for (const t of terms) {
    const i = text.toLowerCase().indexOf(t.toLowerCase());
    if (i >= 0) out.push({ start: i, end: i + t.length, findingId: makeGapId('skill', t), kind });
  }
  return out;
}

/** Deterministic sample data for the shared demo account. Built through the real recorder, so deltas and gap states are genuine. */
export async function buildDemoDataset(startIso = '2026-11-02T09:00:00.000Z'): Promise<DemoDataset> {
  let t = Date.parse(startIso);
  let n = 0;
  const deps = { uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`, now: () => new Date(t).toISOString() };
  const tick = (days: number, hours = 0) => { t += days * 86_400_000 + hours * 3_600_000; };
  const uuid = deps.uuid;

  const wsBackend = uuid();
  const wsFull = uuid();
  const v1Text = RESUME_BASE.join('\n');
  const v2Text = [...RESUME_BASE.slice(0, 5), OUTBOX, RAFT, ...RESUME_BASE.slice(5)].join('\n');
  const v3Text = [...RESUME_BASE.slice(0, 5), OUTBOX, RAFT, K8S, ...RESUME_BASE.slice(5)].join('\n');
  const fullText = ['Y. Mohit Sai', 'Full-stack developer', '', 'Experience', 'Built a React and Node dashboard used by 300 students.', '', 'Skills', 'React, TypeScript, Node.js, PostgreSQL'].join('\n');

  const audits: AuditEntry[] = [];
  const snapshots = new Map<string, TextSnapshot>();
  let overlay: GapOverlay = {};
  const events: JournalEvent[] = [];
  const versions: ResumeVersion[] = [];
  const planItems: PlanItem[] = [];

  const mkVersion = async (workspaceId: string, parent: string | null, label: string, text: string, source: ResumeVersion['source']) => {
    const snap = await snapshotOf(text, deps.now());
    snapshots.set(snap.hash, snap);
    const v: ResumeVersion = { id: uuid(), workspaceId, parentVersionId: parent, label, snapshotHash: snap.hash, source, createdAt: deps.now() };
    versions.push(v);
    events.push({ id: uuid(), type: 'resume_version_created', createdAt: deps.now(), refId: v.id, summary: `Saved resume version: ${label}` });
    return v;
  };

  const record = async (input: RecordAuditInput) => {
    const plan = await planAuditRecord(input, audits, deps);
    if (plan.status !== 'created') throw new Error('demo dataset produced a duplicate audit');
    audits.push(plan.entry);
    snapshots.set(plan.resumeSnapshot.hash, plan.resumeSnapshot);
    snapshots.set(plan.jdSnapshot.hash, plan.jdSnapshot);
    overlay = applyRescan(overlay, plan.entry.targetKey, plan.entry.gaps.map((g) => g.id), deps.now()).overlay;
    return plan.entry;
  };

  const rz = { company: 'Razorpay', roleTitle: 'Software Development Engineer II (Backend)', companyId: 'razorpay', roleId: 'sde-ii-backend' };
  const mkInput = (v: ResumeVersion, label: string, text: string, score: number, breakdown: [number, number, number], gaps: Gap[], matches: string[], weak: string[]): RecordAuditInput => ({
    kind: 'ats_roast', engineVersion: '3.4.0',
    resume: { workspaceId: v.workspaceId, versionId: v.id, label, rawText: text },
    jd: { rawText: JD_RAZORPAY, origin: 'talentlens', ...rz },
    overallScore: score,
    breakdown: [{ key: 'skills', label: 'Skills', score: breakdown[0] }, { key: 'impact', label: 'Impact', score: breakdown[1] }, { key: 'keywords', label: 'Keywords', score: breakdown[2] }],
    gaps, strengths: ['Relevant backend stack', 'Quantified results'],
    evidence: [...spans(text, matches, 'match'), ...spans(text, weak, 'weak')], findings: { summary: `Demo scan, score ${score}` },
  });

  // Day 0: first version and first scan
  const v1 = await mkVersion(wsBackend, null, 'Version 1', v1Text, 'upload');
  const a1 = await record(mkInput(v1, 'Backend & Distributed Systems, version 1', v1Text, 52, [50, 48, 58], [G.outbox, G.cdc, G.kafka, G.locking, G.aws, G.redis], ['Spring Boot'], ['Redis']));

  // Day 2: plan items; the outbox brief is completed, which only marks its gaps as awaiting a re-scan
  tick(1, 2);
  const plan = (kind: PlanItem['kind'], refId: string, title: string, status: PlanItem['status'], linked: Gap[], addedFrom: AuditEntry) => {
    const p: PlanItem = { id: uuid(), kind, refId, title, status, linkedGapIds: linked.map((g) => g.id), targetKey: a1.targetKey, addedFromAuditId: addedFrom.id, createdAt: deps.now(), updatedAt: deps.now(), completedAt: status === 'done' ? deps.now() : null };
    planItems.push(p);
    events.push({ id: uuid(), type: 'plan_item_added', createdAt: deps.now(), targetKey: a1.targetKey, refId: p.id, summary: `Added to plan: ${title}` });
    return p;
  };
  const brief = plan('build_brief', 'brief-transactional-outbox-go', 'Build a transactional outbox in Go with CDC', 'planned', [G.outbox, G.cdc], a1);
  plan('credential', 'cred-aws-saa-c03', 'AWS Certified Solutions Architect Associate (SAA-C03)', 'planned', [G.aws], a1);
  plan('build_brief', 'brief-redis-redlock', 'Benchmark Redis Redlock under split-brain scenarios', 'planned', [G.locking], a1);
  tick(5);
  brief.status = 'done'; brief.completedAt = deps.now(); brief.updatedAt = deps.now();
  events.push({ id: uuid(), type: 'plan_item_status_changed', createdAt: deps.now(), targetKey: a1.targetKey, refId: brief.id, summary: 'Finished: Build a transactional outbox in Go with CDC' });
  for (const g of [G.outbox, G.cdc]) overlay = markGapAddressed(overlay, a1.targetKey, g.id, brief.id, deps.now());
  const aws = planItems.find((p) => p.refId === 'cred-aws-saa-c03');
  if (aws) { aws.status = 'in_progress'; aws.updatedAt = deps.now(); }

  // Day 7: second version and scan; the two addressed gaps are no longer reported, so they become resolved
  tick(0, 3);
  const v2 = await mkVersion(wsBackend, v1.id, 'Version 2', v2Text, 'tailor');
  await record(mkInput(v2, 'Backend & Distributed Systems, version 2', v2Text, 64, [66, 60, 70], [G.kafka, G.locking, G.aws, G.redis], ['transactional outbox', 'change data capture', 'Raft consensus'], ['Redis']));

  // Day 11: third version, Kafka gap closed
  tick(4);
  const v3 = await mkVersion(wsBackend, v2.id, 'Version 3', v3Text, 'tailor');
  await record(mkInput(v3, 'Backend & Distributed Systems, version 3', v3Text, 71, [74, 66, 76], [G.locking, G.aws, G.redis], ['transactional outbox', 'Kafka', 'Kubernetes'], ['Redis']));

  // Google target scanned once through TalentLens
  tick(0, 1);
  const vf = await mkVersion(wsFull, null, 'Version 1', fullText, 'paste');
  const goog = { company: 'Google', roleTitle: 'Software Engineer II (Systems)', companyId: 'google', roleId: 'swe-ii-systems' };
  await record({
    kind: 'talentlens', engineVersion: '2.1.0',
    resume: { workspaceId: wsBackend, versionId: v3.id, label: 'Backend & Distributed Systems, version 3', rawText: v3Text },
    jd: { rawText: JD_GOOGLE, origin: 'talentlens', ...goog }, overallScore: 48,
    breakdown: [{ key: 'fit', label: 'Role fit', score: 48 }, { key: 'depth', label: 'Systems depth', score: 44 }],
    gaps: [gap('skill', 'C++', 3), gap('skill', 'Paxos', 2), gap('skill', 'Performance engineering', 2)],
    strengths: ['Consensus project'], evidence: spans(v3Text, ['Raft consensus'], 'match'), findings: { summary: 'Demo analysis' },
  });

  const rzTarget = audits[0]!.targetKey;
  const gTarget = audits[audits.length - 1]!.targetKey;
  const targets: WatchlistTarget[] = [
    { id: uuid(), targetKey: rzTarget, companyId: 'razorpay', roleId: 'sde-ii-backend', companyName: 'Razorpay', roleTitle: 'Software Development Engineer II (Backend)', addedAt: audits[0]!.createdAt, archivedAt: null },
    { id: uuid(), targetKey: gTarget, companyId: 'google', roleId: 'swe-ii-systems', companyName: 'Google', roleTitle: 'Software Engineer II (Systems)', addedAt: audits[audits.length - 1]!.createdAt, archivedAt: null },
  ];
  for (const tg of targets) events.push({ id: uuid(), type: 'watchlist_added', createdAt: tg.addedAt, targetKey: tg.targetKey, refId: tg.id, summary: `Tracking ${tg.companyName}, ${tg.roleTitle ?? ''}`.trim() });

  const drafts: OutreachDraft[] = [
    { id: uuid(), templateId: 'linkedin_connect', channel: 'linkedin_connect', status: 'draft', slots: { person: 'Arjun Rao', company: 'Razorpay' }, targetKey: rzTarget, createdAt: deps.now(), updatedAt: deps.now(),
      renderedText: 'Hi Arjun, I came across your team\'s work on payment infrastructure at Razorpay. I recently built a distributed transactional outbox worker handling 5k messages per second in Go and would love to connect.' },
    { id: uuid(), templateId: 'cold_email', channel: 'cold_email', status: 'sent', slots: { person: 'Priya Sharma', company: 'Google' }, targetKey: gTarget, createdAt: deps.now(), updatedAt: deps.now(),
      renderedText: 'Hi Priya, I have been following the Google Cloud Spanner engineering blogs and recently implemented Raft consensus in Go. I would love to share my project architecture and learn about upcoming open roles on your team.' },
  ];
  for (const d of drafts) events.push({ id: uuid(), type: 'outreach_saved', createdAt: d.createdAt, targetKey: d.targetKey as string, refId: d.id, summary: `Saved a ${d.channel === 'cold_email' ? 'cold email' : 'LinkedIn connect'} draft` });

  const workspaces: ResumeWorkspace[] = [
    { id: wsBackend, name: 'Backend & Distributed Systems', roleTrack: 'Backend Engineering', isPrimary: true, headVersionId: v3.id, createdAt: v1.createdAt, updatedAt: v3.createdAt, archivedAt: null },
    { id: wsFull, name: 'Full-Stack Web', roleTrack: 'Full-Stack Engineering', isPrimary: false, headVersionId: vf.id, createdAt: vf.createdAt, updatedAt: vf.createdAt, archivedAt: null },
  ];
  const profile: CandidateProfile = {
    displayName: 'Mohit', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2027, targetTier: 'Tier A',
    targetRoles: ['Backend Engineer', 'Systems Engineer'], links: {}, activeWorkspaceId: wsBackend, updatedAt: deps.now(),
  };

  return {
    profile, workspaces, versions, snapshots: [...snapshots.values()], audits, targets, planItems, drafts,
    events: events.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)), gapOverlay: overlay,
  };
}

