import type { SyncTransport, SyncTable, PushResult } from './transport';
import type { SyncOp } from './syncCore';
import { getSupabase } from '@/features/auth/supabaseClient';

export class SupabaseTransport implements SyncTransport {
  async push(ops: SyncOp[]): Promise<PushResult> {
    const supabase = await getSupabase();
    const ok: string[] = [];
    const failed: Array<{ opId: string; retryable: boolean; message: string }> = [];

    for (const op of ops) {
      if (!op.payload && op.op !== 'delete') {
        failed.push({ opId: op.opId, retryable: false, message: 'Missing payload' });
        continue;
      }

      try {
        if (op.table === 'audit_entries' || op.table === 'journal_events' || op.table === 'text_snapshots') {
          // Immutable table: insert_ignore
          const { error } = await supabase
            .from(op.table)
            .upsert(op.payload as never, { ignoreDuplicates: true, onConflict: op.table === 'text_snapshots' ? 'user_id,hash' : 'user_id,id' });
          if (error) {
            failed.push({ opId: op.opId, retryable: true, message: error.message });
          } else {
            ok.push(op.opId);
          }
        } else if (op.op === 'delete') {
          // Delete operation for mutable table
          const { error } = await supabase.from(op.table).delete().match(op.pk);
          if (error) {
            failed.push({ opId: op.opId, retryable: true, message: error.message });
          } else {
            ok.push(op.opId);
          }
        } else {
          // Mutable table: upsert
          const { error } = await supabase.from(op.table).upsert(op.payload as never);
          if (error) {
            failed.push({ opId: op.opId, retryable: true, message: error.message });
          } else {
            ok.push(op.opId);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown transport error';
        failed.push({ opId: op.opId, retryable: true, message: msg });
      }
    }

    return { ok, failed };
  }

  async pull(table: SyncTable, cursor: string | null): Promise<{ rows: unknown[]; nextCursor: string | null }> {
    const supabase = await getSupabase();
    const isImmutable = table === 'audit_entries' || table === 'journal_events' || table === 'text_snapshots';
    const cursorCol = isImmutable ? 'created_at' : 'updated_at';

    let query = supabase.from(table).select('*').order(cursorCol, { ascending: true }).limit(200);
    if (cursor) {
      query = query.gt(cursorCol, cursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as unknown[]) || [];
    let nextCursor: string | null = null;
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1] as Record<string, unknown>;
      nextCursor = typeof lastRow[cursorCol] === 'string' ? (lastRow[cursorCol] as string) : null;
    }

    return { rows, nextCursor };
  }

  async erase(): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await supabase.rpc('erase_my_data');
    if (error) throw error;
  }
}

export const supabaseTransport = new SupabaseTransport();
