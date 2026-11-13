import type { SyncOp } from './syncCore';

export interface PushResult {
  ok: string[];
  failed: Array<{ opId: string; retryable: boolean; message: string }>;
}

export type SyncTable =
  | 'text_snapshots'
  | 'resume_workspaces'
  | 'resume_versions'
  | 'audit_entries'
  | 'journal_events'
  | 'watchlist_targets'
  | 'plan_items'
  | 'outreach_drafts'
  | 'gap_status'
  | 'user_profiles';

export interface SyncTransport {
  push(ops: SyncOp[]): Promise<PushResult>;
  pull(table: SyncTable, cursor: string | null): Promise<{ rows: unknown[]; nextCursor: string | null }>;
  erase(): Promise<void>;
}
