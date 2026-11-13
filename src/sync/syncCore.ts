import type { IsoDate } from '@/domain/types';

export const SYNC_TABLE_ORDER = [
  'text_snapshots', 'resume_workspaces', 'resume_versions', 'audit_entries', 'journal_events',
  'watchlist_targets', 'plan_items', 'outreach_drafts', 'gap_status', 'user_profiles',
] as const;
export type SyncTable = (typeof SYNC_TABLE_ORDER)[number];

export const IMMUTABLE_TABLES: ReadonlySet<SyncTable> = new Set(['text_snapshots', 'audit_entries', 'journal_events']);

export interface SyncOp {
  opId: string;
  table: SyncTable;
  op: 'upsert' | 'insert_ignore' | 'delete';
  pk: Record<string, string>;
  payload: Record<string, any> | null;
  clientUpdatedAt: IsoDate;
  attempts: number;
  enqueuedAt: IsoDate;
}

/** Dependency order first (parents before children), then FIFO. Stable and pure. */
export function orderOps(ops: readonly SyncOp[]): SyncOp[] {
  const rank = (t: SyncTable): number => SYNC_TABLE_ORDER.indexOf(t);
  return ops
    .map((op, i) => ({ op, i }))
    .sort((a, b) => rank(a.op.table) - rank(b.op.table) || a.op.enqueuedAt.localeCompare(b.op.enqueuedAt) || a.i - b.i)
    .map((x) => x.op);
}

/** Immutable tables can never carry update or delete ops from the client. */
export function validateOp(op: SyncOp): string | null {
  if (IMMUTABLE_TABLES.has(op.table) && op.op !== 'insert_ignore') return `${op.table} is immutable: only insert_ignore is allowed`;
  if (!IMMUTABLE_TABLES.has(op.table) && op.op === 'insert_ignore') return `${op.table} is mutable: use upsert`;
  if (op.op !== 'delete' && op.payload === null) return 'payload required';
  return null;
}

export const BACKOFF_BASE_MS = 1000;
export const BACKOFF_CAP_MS = 300_000;
export const MAX_PAYLOAD_BYTES = 900_000;

/** Equal-jitter exponential backoff. `rand` is injected (0 <= rand < 1) so tests are deterministic. */
export function nextBackoffMs(attempts: number, rand: number): number {
  const exp = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempts));
  return Math.floor(exp / 2 + rand * (exp / 2));
}

export function payloadBytes(payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

export interface Stamped { updatedAt: IsoDate }
/** Last-write-wins for mutable rows. Ties keep local so merges are deterministic. */
export function mergeLww<T extends Stamped>(local: T | undefined, remote: T): T {
  if (!local) return remote;
  return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt) ? remote : local;
}

/** Immutable rows are never overwritten once present. */
export function mergeImmutable<T>(local: T | undefined, remote: T): T {
  return local ?? remote;
}
