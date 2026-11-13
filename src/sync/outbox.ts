import { kvGet, kvSet } from '@/lib/storage/kv';
import type { SyncOp } from './syncCore';
import { MAX_PAYLOAD_BYTES } from '@/domain/limits';
import { payloadBytes } from './syncCore';

function outboxKey(userId: string): string {
  return `hireflow:v5:u:${userId}:outbox`;
}

export async function getOutbox(userId: string): Promise<SyncOp[]> {
  const ops = await kvGet<SyncOp[]>(outboxKey(userId));
  return ops || [];
}

export async function saveOutbox(userId: string, ops: SyncOp[]): Promise<void> {
  await kvSet(outboxKey(userId), ops);
}

export async function enqueueOp(userId: string, op: SyncOp): Promise<boolean> {
  // Check payload size
  if (op.payload) {
    const size = payloadBytes(op.payload);
    if (size > MAX_PAYLOAD_BYTES) {
      console.warn(`Payload exceeds limit (${size} > ${MAX_PAYLOAD_BYTES}), marked syncSkipped`);
      return false;
    }
  }

  const outbox = await getOutbox(userId);
  // Idempotency: avoid duplicate opId
  if (outbox.some((o) => o.opId === op.opId)) {
    return true;
  }
  outbox.push(op);
  await saveOutbox(userId, outbox);
  return true;
}

export async function peekOps(userId: string, limit = 25): Promise<SyncOp[]> {
  const outbox = await getOutbox(userId);
  return outbox.slice(0, limit);
}

export async function acknowledgeOps(userId: string, opIds: string[]): Promise<void> {
  const set = new Set(opIds);
  const outbox = await getOutbox(userId);
  const remaining = outbox.filter((o) => !set.has(o.opId));
  await saveOutbox(userId, remaining);
}

export async function markOpAttempt(userId: string, opId: string): Promise<void> {
  const outbox = await getOutbox(userId);
  const target = outbox.find((o) => o.opId === opId);
  if (target) {
    target.attempts += 1;
    await saveOutbox(userId, outbox);
  }
}

export async function getOutboxCount(userId: string): Promise<number> {
  const outbox = await getOutbox(userId);
  return outbox.length;
}

export async function clearOutbox(userId: string): Promise<void> {
  await saveOutbox(userId, []);
}
