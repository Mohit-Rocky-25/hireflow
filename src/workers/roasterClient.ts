// ============================================================
// HireFlow v4 — Roaster Worker Client with Graceful Fallback
// Provides non-blocking execution with automatic main-thread fallback
// ============================================================

import { analyzeDeterministic } from '../lib/ats/analyzeDeterministic';
import { DeterministicFacts } from '../lib/ats/types';
import {
  AnalyzePayload,
  RoasterWorkerError,
  RoasterWorkerRequest,
  RoasterWorkerResponse,
} from './roaster.worker';

export class RoasterClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: DeterministicFacts) => void;
      reject: (reason: RoasterWorkerError) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private requestCounter = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('./roaster.worker.ts', import.meta.url), {
          type: 'module',
        });

        this.worker.addEventListener('message', (event: MessageEvent<RoasterWorkerResponse>) => {
          const res = event.data;
          if (!res || !res.id) return;

          const pending = this.pendingRequests.get(res.id);
          if (!pending) return;

          clearTimeout(pending.timer);
          this.pendingRequests.delete(res.id);

          if (res.type === 'ANALYZE_SUCCESS') {
            pending.resolve(res.payload);
          } else if (res.type === 'ANALYZE_ERROR') {
            pending.reject(res.error);
          }
        });

        this.worker.addEventListener('error', (err) => {
          // Worker error occurred: reject all pending and reset
          this.pendingRequests.forEach(({ reject, timer }) => {
            clearTimeout(timer);
            reject({
              code: 'INTERNAL_ERROR',
              message: err.message || 'Worker thread encountered an unhandled exception.',
            });
          });
          this.pendingRequests.clear();
        });
      } catch (e) {
        // Fallback to synchronous execution
        this.worker = null;
      }
    }
  }

  /**
   * Evaluates resume against JD using Web Worker, with fallback to synchronous main thread.
   */
  async analyze(payload: AnalyzePayload, timeoutMs: number = 10000): Promise<DeterministicFacts> {
    const { resumeText, jdText, options } = payload;

    // Fast-path client validations
    if (!resumeText || resumeText.trim().length < 20) {
      throw {
        code: 'INPUT_TOO_SHORT',
        message: 'Resume text is too brief to evaluate (< 20 characters).',
      } as RoasterWorkerError;
    }
    if (!jdText || jdText.trim().length < 10) {
      throw {
        code: 'INPUT_TOO_SHORT',
        message: 'Job description text is too brief (< 10 characters).',
      } as RoasterWorkerError;
    }

    // If Worker is not available (Node/SSR/legacy), execute synchronously
    if (!this.worker) {
      try {
        return analyzeDeterministic(resumeText, jdText, options);
      } catch (err: any) {
        throw {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Synchronous evaluation failed.',
        } as RoasterWorkerError;
      }
    }

    const id = `req_${Date.now()}_${++this.requestCounter}`;

    return new Promise<DeterministicFacts>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject({
          code: 'TIMEOUT_ERROR',
          message: `Worker analysis timed out after ${timeoutMs}ms.`,
        } as RoasterWorkerError);
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      const message: RoasterWorkerRequest = {
        id,
        type: 'ANALYZE',
        payload,
      };

      this.worker!.postMessage(message);
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject({
        code: 'INTERNAL_ERROR',
        message: 'Worker was terminated.',
      });
    });
    this.pendingRequests.clear();
  }
}

// Global singleton client
export const roasterClient = new RoasterClient();
