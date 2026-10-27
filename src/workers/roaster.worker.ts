// ============================================================
// HireFlow v4 — Resume Roaster Web Worker
// Executes complete deterministic ATS evaluation off the main thread
// ============================================================

import { analyzeDeterministic } from '../lib/ats/analyzeDeterministic';
import { DeterministicFacts } from '../lib/ats/types';

export interface AnalyzePayload {
  resumeText: string;
  jdText: string;
  options?: {
    targetCompanyTier?: string;
    experienceLevel?: string;
  };
}

export type RoasterWorkerRequest =
  | { id: string; type: 'ANALYZE'; payload: AnalyzePayload }
  | { id: string; type: 'PING' };

export type RoasterWorkerErrorCode =
  | 'INPUT_TOO_SHORT'
  | 'PARSE_ERROR'
  | 'INTERNAL_ERROR'
  | 'TIMEOUT_ERROR';

export interface RoasterWorkerError {
  code: RoasterWorkerErrorCode;
  message: string;
  details?: string;
}

export type RoasterWorkerResponse =
  | { id: string; type: 'ANALYZE_SUCCESS'; payload: DeterministicFacts }
  | { id: string; type: 'ANALYZE_ERROR'; error: RoasterWorkerError }
  | { id: string; type: 'PONG' };

// Dedicated worker message listener
if (typeof self !== 'undefined' && typeof (self as any).postMessage === 'function') {
  self.addEventListener('message', (event: MessageEvent<RoasterWorkerRequest>) => {
    const req = event.data;
    if (!req || !req.type) return;

    if (req.type === 'PING') {
      self.postMessage({ id: req.id, type: 'PONG' } satisfies RoasterWorkerResponse);
      return;
    }

    if (req.type === 'ANALYZE') {
      try {
        const { resumeText, jdText, options } = req.payload;

        if (!resumeText || resumeText.trim().length < 20) {
          self.postMessage({
            id: req.id,
            type: 'ANALYZE_ERROR',
            error: {
              code: 'INPUT_TOO_SHORT',
              message: 'Resume text is too brief to evaluate (< 20 characters).',
            },
          } satisfies RoasterWorkerResponse);
          return;
        }

        if (!jdText || jdText.trim().length < 10) {
          self.postMessage({
            id: req.id,
            type: 'ANALYZE_ERROR',
            error: {
              code: 'INPUT_TOO_SHORT',
              message: 'Job description text is too brief (< 10 characters).',
            },
          } satisfies RoasterWorkerResponse);
          return;
        }

        const facts = analyzeDeterministic(resumeText, jdText, options);

        self.postMessage({
          id: req.id,
          type: 'ANALYZE_SUCCESS',
          payload: facts,
        } satisfies RoasterWorkerResponse);
      } catch (err: any) {
        self.postMessage({
          id: req.id,
          type: 'ANALYZE_ERROR',
          error: {
            code: 'INTERNAL_ERROR',
            message: err?.message || 'Unexpected error in deterministic analyzer worker.',
            details: err?.stack,
          },
        } satisfies RoasterWorkerResponse);
      }
    }
  });
}
