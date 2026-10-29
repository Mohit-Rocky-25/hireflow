// ============================================================
// HIREFLOW TAILOR STATE MIGRATION UTILITY (STAGE 1)
// Migrates legacy localStorage states to AppendOnlyFactLedger.
// Invariant: All migrated facts have source: 'imported', confirmed: false,
// ownership: undefined. Old state backed up under safe timestamped key.
// ============================================================

import { AppendOnlyFactLedger } from './ledger';
import { extractMetrics } from './extractor';

export interface LegacyTailorState {
  currentStage?: string;
  state?: {
    currentProject?: any;
    activeProject?: any;
  };
  currentProject?: any;
  activeProject?: any;
}

export interface MigrationResult {
  migrated: boolean;
  factsCount: number;
  backupKeyWritten: string;
  ledger: AppendOnlyFactLedger | null;
  error?: string;
}

const BACKUP_PREFIX = 'hireflow_tailor_state_v2_backup_';

export function migrateLegacyTailorState(
  storageKeyOrRaw: string,
  backupTimestamp: string = '2026-10-28T12-00-00-000Z'
): MigrationResult {
  let rawJson: string | null = null;

  // Retrieve from localStorage if key matches or exists
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    try {
      rawJson = (globalThis as any).localStorage.getItem(storageKeyOrRaw);
    } catch {
      // Ignore
    }
  }

  // If not in localStorage, test if input itself is a JSON string
  if (!rawJson) {
    if (storageKeyOrRaw.trim().startsWith('{')) {
      rawJson = storageKeyOrRaw;
    } else {
      return {
        migrated: false,
        factsCount: 0,
        backupKeyWritten: '',
        ledger: null
      };
    }
  }

  let legacy: LegacyTailorState;
  try {
    legacy = JSON.parse(rawJson);
  } catch (err: any) {
    return {
      migrated: false,
      factsCount: 0,
      backupKeyWritten: '',
      ledger: null,
      error: `Corrupted state JSON: ${err?.message || err}`
    };
  }

  const backupKey = `${BACKUP_PREFIX}${backupTimestamp}`;

  // Write backup to localStorage if available
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    try {
      (globalThis as any).localStorage.setItem(backupKey, rawJson);
    } catch (e) {
      console.warn('Could not write localStorage backup key:', e);
    }
  }

  const ledger = new AppendOnlyFactLedger();
  let count = 0;

  const project = legacy.activeProject || legacy.currentProject || legacy.state?.currentProject || legacy.state?.activeProject;
  const candidate = project?.candidate;

  // 1. Extract from candidate experience
  if (candidate?.experience && Array.isArray(candidate.experience)) {
    for (const exp of candidate.experience) {
      const bullets = exp.bullets || [];
      for (let i = 0; i < bullets.length; i++) {
        const text = typeof bullets[i] === 'string' ? bullets[i] : bullets[i]?.text || '';
        if (!text) continue;
        const metrics = extractMetrics(text);
        const firstMetric = metrics.length > 0 ? metrics[0] : undefined;
        const words = text.split(' ');

        ledger.addFact({
          id: `fact_${exp.id || 'exp'}_${i}`,
          source: 'imported',
          confirmed: false,
          kind: 'experience',
          parentId: exp.id || 'exp',
          action: words[0] || 'Delivered',
          object: words.slice(1).join(' ') || text,
          tech: [],
          evidence: firstMetric ? { type: 'metric', value: firstMetric.raw } : undefined,
          ownership: undefined, // Invariant: ownership unset
          createdAt: new Date().toISOString()
        });
        count++;
      }
    }
  }

  // 2. Extract from candidate projects
  if (candidate?.projects && Array.isArray(candidate.projects)) {
    for (const proj of candidate.projects) {
      const bullets = proj.bullets || [];
      for (let i = 0; i < bullets.length; i++) {
        const text = typeof bullets[i] === 'string' ? bullets[i] : bullets[i]?.text || '';
        if (!text) continue;
        const metrics = extractMetrics(text);
        const firstMetric = metrics.length > 0 ? metrics[0] : undefined;
        const words = text.split(' ');

        ledger.addFact({
          id: `fact_${proj.id || 'proj'}_${i}`,
          source: 'imported',
          confirmed: false,
          kind: 'project',
          parentId: proj.id || 'proj',
          action: words[0] || 'Built',
          object: words.slice(1).join(' ') || text,
          tech: proj.technologiesUsed || [],
          evidence: firstMetric ? { type: 'metric', value: firstMetric.raw } : undefined,
          ownership: undefined, // Invariant: ownership unset
          createdAt: new Date().toISOString()
        });
        count++;
      }
    }
  }

  // 3. Extract from candidate education
  if (candidate?.education && Array.isArray(candidate.education)) {
    for (let i = 0; i < candidate.education.length; i++) {
      const edu = candidate.education[i];
      ledger.addFact({
        id: `fact_edu_${i}`,
        source: 'imported',
        confirmed: false,
        kind: 'education',
        action: 'Completed',
        object: `${edu.degree || 'Degree'} at ${edu.institution || 'Institution'}`,
        tech: [],
        evidence: edu.score ? { type: 'metric', value: edu.score } : undefined,
        ownership: undefined,
        createdAt: new Date().toISOString()
      });
      count++;
    }
  }

  return {
    migrated: true,
    factsCount: count,
    backupKeyWritten: backupKey,
    ledger
  };
}
