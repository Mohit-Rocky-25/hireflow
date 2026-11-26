// ============================================================
// HireFlow — Cloud-First Browser Storage Non-Persistence & Safety Tests
// Replaces deleted HireFlowStorageAdapter tests after Phase 10.8 migration.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { inspectLegacyBrowserData } from '../../src/lib/cloud/legacyMigration';
import { purgeLegacyBrowserUserData } from '../../src/features/auth/useAuthStore';

class MemoryStorage implements Storage {
  private map: Record<string, string> = {};
  get length() { return Object.keys(this.map).length; }
  clear() { this.map = {}; }
  getItem(k: string) { return this.map[k] ?? null; }
  setItem(k: string, v: string) { this.map[k] = String(v); }
  removeItem(k: string) { delete this.map[k]; }
  key(i: number) { return Object.keys(this.map)[i] ?? null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorage();
}

describe('Phase 10.8 Legacy Browser Storage Non-Persistence & Corrupt Payload Safety', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('safely ignores malformed JSON and schema-invalid legacy payloads during inspection', async () => {
    localStorage.setItem('hireflow:v4:saved-jds', '{malformed json');
    localStorage.setItem('hireflow_tool_ats_v3', JSON.stringify({ state: { scanHistory: 'invalid' } }));

    const preview = await inspectLegacyBrowserData();
    expect(preview.hasLegacyData).toBe(false);
    expect(preview.savedJds).toEqual([]);
    expect(preview.audits).toEqual([]);
  });

  it('purges leftover legacy keys safely while keeping non-PII theme preferences', () => {
    localStorage.setItem('hireflow-storage-v4', '{"state":{"currentUser":{}}}');
    localStorage.setItem('hireflow:v4:design', 'spruce');
    localStorage.setItem('hireflow:v4:theme-mode', 'dark');

    purgeLegacyBrowserUserData();

    expect(localStorage.getItem('hireflow-storage-v4')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    expect(localStorage.getItem('hireflow:v4:theme-mode')).toBe('dark');
  });
});
