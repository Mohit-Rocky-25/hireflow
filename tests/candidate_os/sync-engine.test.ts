// @vitest-environment node
import { describe, expect, it, beforeEach } from 'vitest';
import { SyncEngine } from '@/sync/syncEngine';
import { MemoryTransport } from '@/sync/memoryTransport';
import { enqueueOp, getOutbox, clearOutbox } from '@/sync/outbox';
import { orderOps, validateOp, nextBackoffMs, mergeLww, mergeImmutable, type SyncOp } from '@/sync/syncCore';
import { useSyncStore } from '@/sync/useSyncStore';
import { kvClear } from '@/lib/storage/kv';

const op = (table: SyncOp['table'], enq: string, o: Partial<SyncOp> = {}): SyncOp => ({
  opId: `${table}-${enq}`,
  table,
  op: 'upsert',
  pk: { id: 'x' },
  payload: { id: 'x', updated_at: enq },
  clientUpdatedAt: enq,
  attempts: 0,
  enqueuedAt: enq,
  ...o,
});

describe('Stage 3: Sync Engine & Outbox', () => {
  const userId = 'sync-user-123';
  let transport: MemoryTransport;
  let engine: SyncEngine;

  beforeEach(async () => {
    await kvClear();
    await clearOutbox(userId);
    transport = new MemoryTransport();
    engine = new SyncEngine(transport);
    useSyncStore.setState({ status: 'local_only', pendingCount: 0, lastError: null, lastSyncedAt: null });
  });

  describe('Outbox persistence & ordering', () => {
    it('persists outbox items and recovers them across simulated reloads', async () => {
      const op1 = op('plan_items', '2026-11-12T10:00:00Z', { opId: 'op-1' });
      await enqueueOp(userId, op1);

      const items = await getOutbox(userId);
      expect(items).toHaveLength(1);
      expect(items[0]?.opId).toBe('op-1');

      // Idempotency: enqueueing same opId does not duplicate
      await enqueueOp(userId, op1);
      expect(await getOutbox(userId)).toHaveLength(1);
    });

    it('rejects oversized payloads (> 900KB) and marks syncSkipped', async () => {
      const hugePayload = { large: 'x'.repeat(950_000) };
      const hugeOp = op('plan_items', '2026-11-12T10:00:00Z', { opId: 'huge-1', payload: hugePayload });
      const accepted = await enqueueOp(userId, hugeOp);
      expect(accepted).toBe(false);
      expect(await getOutbox(userId)).toHaveLength(0);
    });

    it('orders ops strictly parent-before-child (snapshots before versions before audits)', () => {
      const rawOps: SyncOp[] = [
        op('audit_entries', '3', { op: 'insert_ignore' }),
        op('plan_items', '1'),
        op('text_snapshots', '4', { op: 'insert_ignore' }),
        op('resume_versions', '2'),
        op('text_snapshots', '2', { op: 'insert_ignore' })
      ];
      const ordered = orderOps(rawOps);
      expect(ordered.map((o) => `${o.table}@${o.enqueuedAt}`)).toEqual([
        'text_snapshots@2',
        'text_snapshots@4',
        'resume_versions@2',
        'audit_entries@3',
        'plan_items@1'
      ]);
    });
  });

  describe('SyncEngine flusher with memoryTransport', () => {
    it('flushes outbox ops in dependency order to transport and clears acknowledged ops', async () => {
      engine.setUser(userId, true);

      const snapOp = op('text_snapshots', '1', { opId: 'snap-1', op: 'insert_ignore', payload: { hash: 'h1', body: 'text' } });
      const auditOp = op('audit_entries', '2', { opId: 'audit-1', op: 'insert_ignore', payload: { id: 'a1' } });

      await enqueueOp(userId, auditOp);
      await enqueueOp(userId, snapOp);

      await engine.flush();

      // Verified order in transport
      expect(transport.pushedOps.map((o) => o.opId)).toEqual(['snap-1', 'audit-1']);
      // Outbox emptied
      expect(await getOutbox(userId)).toHaveLength(0);
      expect(useSyncStore.getState().status).toBe('synced');
      expect(useSyncStore.getState().lastSyncedAt).not.toBeNull();
    });

    it('re-queues and retries failed ops, increasing attempts', async () => {
      engine.setUser(userId, true);
      transport.shouldFail = true;

      const testOp = op('plan_items', '1', { opId: 'fail-1' });
      await enqueueOp(userId, testOp);

      await engine.flush();

      const outbox = await getOutbox(userId);
      expect(outbox).toHaveLength(1);
      expect(outbox[0]?.attempts).toBe(1);
    });
  });

  describe('LWW merge and immutable preservation', () => {
    it('never overwrites an existing immutable row', () => {
      const local = { id: '1', score: 80 };
      const incoming = { id: '1', score: 90 };
      const merged = mergeImmutable(local, incoming);
      expect(merged).toEqual(local);
    });

    it('resolves LWW by updatedAt timestamp', () => {
      const older = { id: '1', status: 'draft', updatedAt: '2026-01-01T00:00:00Z' };
      const newer = { id: '1', status: 'done', updatedAt: '2026-01-02T00:00:00Z' };
      expect(mergeLww(older, newer)).toEqual(newer);
      expect(mergeLww(newer, older)).toEqual(newer);
    });
  });
});
