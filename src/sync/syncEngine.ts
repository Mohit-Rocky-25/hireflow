import { getOutbox, peekOps, acknowledgeOps, markOpAttempt } from './outbox';
import { orderOps, validateOp, nextBackoffMs, mergeLww, mergeImmutable, type SyncOp } from './syncCore';
import { supabaseTransport } from './supabaseTransport';
import type { SyncTransport, SyncTable } from './transport';
import { useSyncStore } from './useSyncStore';

export class SyncEngine {
  private transport: SyncTransport;
  private isRunning = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private currentUserId: string | null = null;
  private isSyncEnabled = false;
  private consecutiveFailures = 0;

  constructor(transport: SyncTransport = supabaseTransport) {
    this.transport = transport;
  }

  setTransport(transport: SyncTransport): void {
    this.transport = transport;
  }

  setUser(userId: string | null, cloudSyncEnabled: boolean): void {
    this.currentUserId = userId;
    this.isSyncEnabled = cloudSyncEnabled;

    if (!userId || !cloudSyncEnabled) {
      useSyncStore.getState().setStatus('local_only');
      this.stop();
    } else {
      useSyncStore.getState().setStatus('synced');
      this.start();
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.intervalTimer = setInterval(() => {
      void this.flush();
    }, 30_000);

    // Initial flush and pull
    void this.flush();
  }

  stop(): void {
    this.isRunning = false;
    if (this.flushTimer) clearTimeout(this.flushTimer);
    if (this.intervalTimer) clearInterval(this.intervalTimer);

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  scheduleFlush(delayMs = 1500): void {
    if (!this.isRunning || !this.currentUserId || !this.isSyncEnabled) return;
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, delayMs);
  }

  private handleOnline = (): void => {
    void this.flush();
  };

  private handleVisibilityChange = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      void this.flush();
    }
  };

  async flush(): Promise<void> {
    if (!this.currentUserId || !this.isSyncEnabled) return;

    // Leader election: Web Locks API
    if (typeof navigator !== 'undefined' && navigator.locks) {
      try {
        await navigator.locks.request('hireflow-sync', { ifAvailable: true }, async (lock) => {
          if (!lock) return; // Another tab holds the lock
          await this.doFlush(this.currentUserId!);
        });
      } catch {
        await this.doFlush(this.currentUserId);
      }
    } else {
      await this.doFlush(this.currentUserId);
    }
  }

  private async doFlush(userId: string): Promise<void> {
    const rawOps = await peekOps(userId, 25);
    if (rawOps.length === 0) {
      useSyncStore.getState().setPendingCount(0);
      if (this.consecutiveFailures === 0) {
        useSyncStore.getState().setStatus('synced');
      }
      return;
    }

    useSyncStore.getState().setPendingCount(rawOps.length);
    useSyncStore.getState().setStatus('syncing');

    // Filter valid ops and order them parents-before-children
    const validOps: SyncOp[] = [];
    for (const op of rawOps) {
      const err = validateOp(op);
      if (err) {
        // Discard invalid op
        await acknowledgeOps(userId, [op.opId]);
      } else {
        validOps.push(op);
      }
    }

    if (validOps.length === 0) return;

    const ordered = orderOps(validOps);

    try {
      const result = await this.transport.push(ordered);

      if (result.ok.length > 0) {
        await acknowledgeOps(userId, result.ok);
        useSyncStore.getState().setLastSyncedAt(new Date().toISOString());
        this.consecutiveFailures = 0;
      }

      if (result.failed.length > 0) {
        for (const f of result.failed) {
          await markOpAttempt(userId, f.opId);
        }
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= 8) {
          useSyncStore.getState().setStatus('degraded');
        }
      }

      const remainingOps = await getOutbox(userId);
      useSyncStore.getState().setPendingCount(remainingOps.length);
      if (remainingOps.length === 0) {
        useSyncStore.getState().setStatus('synced');
      }
    } catch (err: unknown) {
      this.consecutiveFailures++;
      const msg = err instanceof Error ? err.message : 'Sync network error';
      useSyncStore.getState().setLastError(msg);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        useSyncStore.getState().setStatus('offline');
      } else if (this.consecutiveFailures >= 8) {
        useSyncStore.getState().setStatus('degraded');
      }
    }
  }
}

export const syncEngine = new SyncEngine();
