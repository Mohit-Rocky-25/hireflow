// ============================================================
// Candidate Profile — Storage Layer (Stage 1.4)
// Safe, namespaced wrapper over localStorage with quota guard,
// schema-version checks, import/export, and zero UI throws.
// ============================================================

import {
  CandidateProfile,
  ResumeVersion,
  ScanRecord,
  ApplicationEntry,
  BuildPlan,
} from './types';

const PREFIX = 'hireflow.suite.v1.';
const CURRENT_SCHEMA_VERSION = 1;

export interface StorageResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface SuiteExportPayload {
  version: number;
  exportedAt: string;
  profile?: CandidateProfile | null;
  resumeVersions?: ResumeVersion[];
  scanHistory?: ScanRecord[];
  tracker?: ApplicationEntry[];
  offers?: any[];
  buildPlans?: BuildPlan[];
  evidenceCards?: any[];
}

const memStore = new Map<string, string>();

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`${PREFIX}${key}`);
    }
    return memStore.get(`${PREFIX}${key}`) ?? null;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${PREFIX}${key}`, value);
      return true;
    }
    memStore.set(`${PREFIX}${key}`, value);
    return true;
  } catch (err) {
    console.warn(`[Storage] Quota exceeded or error saving ${key}:`, err);
    return false;
  }
}

function safeRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${PREFIX}${key}`);
    }
    memStore.delete(`${PREFIX}${key}`);
  } catch (err) {
    console.warn(`[Storage] Error removing ${key}:`, err);
  }
}

export const SuiteStorage = {
  // --- Profile ---
  loadProfile(): StorageResult<CandidateProfile | null> {
    const raw = safeGet('profile');
    if (!raw) return { ok: true, data: null };
    try {
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        return { ok: false, error: 'Incompatible profile schema version' };
      }
      return { ok: true, data: parsed as CandidateProfile };
    } catch {
      return { ok: false, error: 'Corrupted profile JSON data' };
    }
  },

  saveProfile(profile: CandidateProfile): StorageResult {
    try {
      const serialized = JSON.stringify(profile);
      const success = safeSet('profile', serialized);
      if (!success) {
        return { ok: false, error: 'Storage quota exceeded while saving profile' };
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to serialize profile' };
    }
  },

  clearProfile(): StorageResult {
    safeRemove('profile');
    return { ok: true };
  },

  // --- Resume Versions ---
  loadResumeVersions(): StorageResult<ResumeVersion[]> {
    const raw = safeGet('resume_versions');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) as ResumeVersion[] };
    } catch {
      return { ok: false, error: 'Corrupted resume versions JSON' };
    }
  },

  saveResumeVersions(versions: ResumeVersion[]): StorageResult {
    const success = safeSet('resume_versions', JSON.stringify(versions));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Scan History ---
  loadScanHistory(): StorageResult<ScanRecord[]> {
    const raw = safeGet('scan_history');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) as ScanRecord[] };
    } catch {
      return { ok: false, error: 'Corrupted scan history JSON' };
    }
  },

  saveScanHistory(history: ScanRecord[]): StorageResult {
    const success = safeSet('scan_history', JSON.stringify(history));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Tracker ---
  loadTracker(): StorageResult<ApplicationEntry[]> {
    const raw = safeGet('tracker');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) as ApplicationEntry[] };
    } catch {
      return { ok: false, error: 'Corrupted tracker entries JSON' };
    }
  },

  saveTracker(entries: ApplicationEntry[]): StorageResult {
    const success = safeSet('tracker', JSON.stringify(entries));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Offers ---
  loadOffers(): StorageResult<any[]> {
    const raw = safeGet('offers');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch {
      return { ok: false, error: 'Corrupted offers JSON' };
    }
  },

  saveOffers(offers: any[]): StorageResult {
    const success = safeSet('offers', JSON.stringify(offers));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Build Plans ---
  loadBuildPlans(): StorageResult<BuildPlan[]> {
    const raw = safeGet('build_plans');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) as BuildPlan[] };
    } catch {
      return { ok: false, error: 'Corrupted build plans JSON' };
    }
  },

  saveBuildPlans(plans: BuildPlan[]): StorageResult {
    const success = safeSet('build_plans', JSON.stringify(plans));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Evidence Card Drafts ---
  loadEvidenceCards(): StorageResult<any[]> {
    const raw = safeGet('evidence_cards');
    if (!raw) return { ok: true, data: [] };
    try {
      return { ok: true, data: JSON.parse(raw) };
    } catch {
      return { ok: false, error: 'Corrupted evidence cards JSON' };
    }
  },

  saveEvidenceCards(cards: any[]): StorageResult {
    const success = safeSet('evidence_cards', JSON.stringify(cards));
    return success ? { ok: true } : { ok: false, error: 'Quota exceeded' };
  },

  // --- Export All & Import All ---
  exportAll(): string {
    const payload: SuiteExportPayload = {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      profile: this.loadProfile().data || null,
      resumeVersions: this.loadResumeVersions().data || [],
      scanHistory: this.loadScanHistory().data || [],
      tracker: this.loadTracker().data || [],
      offers: this.loadOffers().data || [],
      buildPlans: this.loadBuildPlans().data || [],
      evidenceCards: this.loadEvidenceCards().data || [],
    };
    return JSON.stringify(payload, null, 2);
  },

  importAll(jsonString: string): StorageResult {
    try {
      const parsed = JSON.parse(jsonString) as SuiteExportPayload;
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'Invalid JSON import file' };
      }
      if (parsed.version !== CURRENT_SCHEMA_VERSION) {
        return {
          ok: false,
          error: `Unsupported schema version: expected ${CURRENT_SCHEMA_VERSION}, received ${parsed.version}`,
        };
      }

      if (parsed.profile) this.saveProfile(parsed.profile);
      if (Array.isArray(parsed.resumeVersions)) this.saveResumeVersions(parsed.resumeVersions);
      if (Array.isArray(parsed.scanHistory)) this.saveScanHistory(parsed.scanHistory);
      if (Array.isArray(parsed.tracker)) this.saveTracker(parsed.tracker);
      if (Array.isArray(parsed.offers)) this.saveOffers(parsed.offers);
      if (Array.isArray(parsed.buildPlans)) this.saveBuildPlans(parsed.buildPlans);
      if (Array.isArray(parsed.evidenceCards)) this.saveEvidenceCards(parsed.evidenceCards);

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Failed to parse JSON file' };
    }
  },

  clearAll(): StorageResult {
    try {
      const keys = [
        'profile',
        'resume_versions',
        'scan_history',
        'tracker',
        'offers',
        'build_plans',
        'evidence_cards',
      ];
      for (const k of keys) {
        safeRemove(k);
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Error clearing data' };
    }
  },

  _setRaw(key: string, value: string): void {
    safeSet(key, value);
  },
};
