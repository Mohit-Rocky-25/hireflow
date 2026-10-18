// ============================================================
// HireFlow v3 — Core Engine Layer (Pure TypeScript, No React)
// Target Architecture: src/engine/
// Provides unified, deterministic scoring, parsing, matching, and invariant engines.
// ============================================================

export * from '../features/ats/engine';
export { rankFixes, simulateFix, simulateFix as simulateScoreDelta } from '../features/suite/engine/simulateFix';
export { buildQuickSummary, buildQuickSummary as generateQuickSummary } from '../features/suite/engine/quickSummary';
export * from './ingestion';
export * from './matching';
export * from './ledger';
export * from './roaster';
export * from './tailor';
export * from './compare';

