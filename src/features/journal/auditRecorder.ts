import type {
  AuditEntry, EvidenceSpan, Gap, IsoDate, JdOrigin, ScoreBreakdownItem, TextSnapshot, ToolKind, Uuid,
} from '@/domain/types';
import { makeRunKey, makeTargetKey } from '@/domain/ids';
import { sha256Hex } from '@/lib/crypto/sha256';
import { countWords, normalizeText } from '@/lib/text/normalize';
import { computeDelta } from './deltaEngine';

export const MAX_RESUME_CHARS = 60_000;
export const MAX_JD_CHARS = 40_000;

export class RecordAuditError extends Error {
  constructor(public readonly code:
    | 'RESUME_TOO_LONG' | 'JD_TOO_LONG' | 'EMPTY_RESUME' | 'EMPTY_JD' | 'BAD_SCORE' | 'DUPLICATE_BREAKDOWN_KEY',
    message: string) { super(message); this.name = 'RecordAuditError'; }
}

export interface RecordAuditInput {
  kind: ToolKind;
  engineVersion: string;
  resume: { workspaceId: Uuid | null; versionId: Uuid | null; label: string; rawText: string };
  jd: { rawText: string; origin: JdOrigin; company?: string; roleTitle?: string; companyId?: string; roleId?: string; datasetVersion?: string };
  overallScore: number;
  breakdown: ScoreBreakdownItem[];
  gaps: Gap[];
  strengths: string[];
  evidence: EvidenceSpan[];
  findings: unknown;
}

export interface RecorderDeps { uuid: () => Uuid; now: () => IsoDate }

export type RecordPlan =
  | { status: 'duplicate'; entry: AuditEntry }
  | { status: 'created'; entry: AuditEntry; resumeSnapshot: TextSnapshot; jdSnapshot: TextSnapshot; droppedEvidence: number };

export async function snapshotOf(raw: string, now: IsoDate): Promise<TextSnapshot> {
  const text = normalizeText(raw);
  return { hash: await sha256Hex(text), text, charCount: text.length, wordCount: countWords(text), createdAt: now };
}

function dedupeGaps(gaps: readonly Gap[]): Gap[] {
  const best = new Map<string, Gap>();
  for (const g of gaps) {
    const cur = best.get(g.id);
    if (!cur || g.severity > cur.severity) best.set(g.id, g);
  }
  return [...best.values()].sort((a, b) => b.severity - a.severity || a.id.localeCompare(b.id));
}

/** Pure planning step: computes the immutable entry. Persisting and syncing happen in the store. */
export async function planAuditRecord(
  input: RecordAuditInput, existing: readonly AuditEntry[], deps: RecorderDeps,
): Promise<RecordPlan> {
  const now = deps.now();
  const resumeSnapshot = await snapshotOf(input.resume.rawText, now);
  const jdSnapshot = await snapshotOf(input.jd.rawText, now);
  if (resumeSnapshot.charCount === 0) throw new RecordAuditError('EMPTY_RESUME', 'Resume text is empty after normalization.');
  if (jdSnapshot.charCount === 0) throw new RecordAuditError('EMPTY_JD', 'Job description text is empty after normalization.');
  if (resumeSnapshot.charCount > MAX_RESUME_CHARS) throw new RecordAuditError('RESUME_TOO_LONG', 'Resume text exceeds the supported length.');
  if (jdSnapshot.charCount > MAX_JD_CHARS) throw new RecordAuditError('JD_TOO_LONG', 'Job description text exceeds the supported length.');
  if (!Number.isFinite(input.overallScore)) throw new RecordAuditError('BAD_SCORE', 'Overall score is not a finite number.');
  const keys = input.breakdown.map((b) => b.key);
  if (new Set(keys).size !== keys.length) throw new RecordAuditError('DUPLICATE_BREAKDOWN_KEY', 'Breakdown keys must be unique.');

  const runKey = await makeRunKey(input.kind, resumeSnapshot.hash, jdSnapshot.hash, input.engineVersion);
  const same = existing.find((e) => e.runKey === runKey);
  if (same) return { status: 'duplicate', entry: same };

  const targetKey = await makeTargetKey({
    ...(input.jd.companyId ? { companyId: input.jd.companyId } : {}),
    ...(input.jd.roleId ? { roleId: input.jd.roleId } : {}),
    ...(input.jd.company ? { company: input.jd.company } : {}),
    ...(input.jd.roleTitle ? { roleTitle: input.jd.roleTitle } : {}),
    jdSnapshotHash: jdSnapshot.hash,
  });

  const len = resumeSnapshot.text.length;
  const evidence = input.evidence.filter((s) => Number.isInteger(s.start) && Number.isInteger(s.end) && s.start >= 0 && s.end <= len && s.end > s.start);
  const overallScore = Math.min(100, Math.max(0, Math.round(input.overallScore)));
  const gaps = dedupeGaps(input.gaps);
  const breakdown = input.breakdown.map((b) => ({ ...b, score: Math.min(100, Math.max(0, Math.round(b.score))) }));

  const baseline = existing
    .filter((e) => e.kind === input.kind && e.targetKey === targetKey && e.runKey !== runKey && e.createdAt <= now)
    .sort((a, b) => (a.createdAt === b.createdAt ? b.id.localeCompare(a.id) : b.createdAt.localeCompare(a.createdAt)))[0];

  const entry: AuditEntry = {
    schemaVersion: 1,
    id: deps.uuid(),
    kind: input.kind,
    createdAt: now,
    engineVersion: input.engineVersion,
    runKey,
    targetKey,
    resume: { workspaceId: input.resume.workspaceId, versionId: input.resume.versionId, snapshotHash: resumeSnapshot.hash, label: input.resume.label },
    jd: {
      snapshotHash: jdSnapshot.hash, origin: input.jd.origin,
      ...(input.jd.company ? { company: input.jd.company } : {}),
      ...(input.jd.roleTitle ? { roleTitle: input.jd.roleTitle } : {}),
      ...(input.jd.companyId ? { companyId: input.jd.companyId } : {}),
      ...(input.jd.roleId ? { roleId: input.jd.roleId } : {}),
      ...(input.jd.datasetVersion ? { datasetVersion: input.jd.datasetVersion } : {}),
    },
    overallScore, breakdown, gaps,
    strengths: [...input.strengths],
    evidence,
    findingsJson: JSON.parse(JSON.stringify(input.findings ?? null)) as unknown,
    delta: baseline ? computeDelta(baseline, { overallScore, breakdown, gaps }) : null,
  };
  return { status: 'created', entry, resumeSnapshot, jdSnapshot, droppedEvidence: input.evidence.length - evidence.length };
}

/** Guest retention: keep only the newest N entries. */
export function capGuestEntries(entries: readonly AuditEntry[], max: number): AuditEntry[] {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, max);
}
