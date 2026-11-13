import type { SyncTransport, SyncTable, PushResult } from './transport';
import type { SyncOp } from './syncCore';

export class MemoryTransport implements SyncTransport {
  public pushedOps: SyncOp[] = [];
  public storedRows: Record<SyncTable, unknown[]> = {
    text_snapshots: [],
    resume_workspaces: [],
    resume_versions: [],
    audit_entries: [],
    journal_events: [],
    watchlist_targets: [],
    plan_items: [],
    outreach_drafts: [],
    gap_status: [],
    user_profiles: [],
  };
  public shouldFail = false;
  public failureMessage = 'Simulated transport failure';

  async push(ops: SyncOp[]): Promise<PushResult> {
    if (this.shouldFail) {
      return {
        ok: [],
        failed: ops.map((o) => ({
          opId: o.opId,
          retryable: true,
          message: this.failureMessage,
        })),
      };
    }

    const ok: string[] = [];
    for (const op of ops) {
      this.pushedOps.push(op);
      ok.push(op.opId);

      // If payload is provided, store or update
      if (op.payload) {
        const tableRows = this.storedRows[op.table];
        if (op.op === 'upsert' || op.op === 'insert_ignore') {
          tableRows.push(op.payload);
        }
      }
    }

    return { ok, failed: [] };
  }

  async pull(table: SyncTable, cursor: string | null): Promise<{ rows: unknown[]; nextCursor: string | null }> {
    const all = this.storedRows[table] || [];
    return { rows: all, nextCursor: null };
  }

  async erase(): Promise<void> {
    this.pushedOps = [];
    for (const key of Object.keys(this.storedRows) as SyncTable[]) {
      this.storedRows[key] = [];
    }
  }

  reset(): void {
    this.pushedOps = [];
    this.shouldFail = false;
    this.erase();
  }
}

export const memoryTransport = new MemoryTransport();
