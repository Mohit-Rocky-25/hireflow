// ============================================================
// Credential & Opportunity Engine — Local Storage Layer
// Safe namespaced wrapper for Opportunity Plan items
// ============================================================

import { OpportunityPlanItem, OpportunityPlanStatus } from './types';

const STORAGE_KEY = 'hireflow.suite.v1.opportunity_plan';

const memStore = new Map<string, string>();

function safeGet(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return memStore.get(STORAGE_KEY) ?? null;
  } catch (err) {
    console.warn('[CredentialsStorage] Failed to read from storage:', err);
    return null;
  }
}

function safeSet(val: string): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, val);
      return true;
    }
    memStore.set(STORAGE_KEY, val);
    return true;
  } catch (err) {
    console.warn('[CredentialsStorage] Failed to write to storage:', err);
    return false;
  }
}

export const CredentialsStorage = {
  loadPlanItems(): OpportunityPlanItem[] {
    const raw = safeGet();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  savePlanItem(item: OpportunityPlanItem): void {
    const existing = this.loadPlanItems();
    const idx = existing.findIndex((i) => i.opportunityId === item.opportunityId);
    if (idx >= 0) {
      existing[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      existing.push({ ...item, addedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    safeSet(JSON.stringify(existing));
  },

  updatePlanItemStatus(opportunityId: string, status: OpportunityPlanStatus): void {
    const existing = this.loadPlanItems();
    const item = existing.find((i) => i.opportunityId === opportunityId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      safeSet(JSON.stringify(existing));
    }
  },

  updatePlanItemTimeline(opportunityId: string, timeline: '30_day' | '90_day' | 'later'): void {
    const existing = this.loadPlanItems();
    const item = existing.find((i) => i.opportunityId === opportunityId);
    if (item) {
      item.targetTimeline = timeline;
      item.updatedAt = new Date().toISOString();
      safeSet(JSON.stringify(existing));
    }
  },

  updatePlanItemNotes(opportunityId: string, notes: string): void {
    const existing = this.loadPlanItems();
    const item = existing.find((i) => i.opportunityId === opportunityId);
    if (item) {
      item.notes = notes;
      item.updatedAt = new Date().toISOString();
      safeSet(JSON.stringify(existing));
    }
  },

  removePlanItem(opportunityId: string): void {
    const existing = this.loadPlanItems();
    const filtered = existing.filter((i) => i.opportunityId !== opportunityId);
    safeSet(JSON.stringify(filtered));
  },

  clearPlan(): void {
    safeSet(JSON.stringify([]));
  },

  getCredentialTruthDetails(opportunityId: string): {
    truthState: 'Planned' | 'In progress' | 'Earned';
    credentialId?: string;
    dateEarned?: string;
    score?: string;
    expectedDate?: string;
  } {
    try {
      const raw = typeof localStorage !== 'undefined'
        ? localStorage.getItem(`hireflow.suite.v1.truth.${opportunityId}`)
        : memStore.get(`hireflow.suite.v1.truth.${opportunityId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return { truthState: 'Planned' };
  },

  saveCredentialTruthDetails(
    opportunityId: string,
    details: {
      truthState: 'Planned' | 'In progress' | 'Earned';
      credentialId?: string;
      dateEarned?: string;
      score?: string;
      expectedDate?: string;
    }
  ): void {
    try {
      const str = JSON.stringify(details);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`hireflow.suite.v1.truth.${opportunityId}`, str);
      } else {
        memStore.set(`hireflow.suite.v1.truth.${opportunityId}`, str);
      }
    } catch (err) {
      console.warn('[CredentialsStorage] Failed to save truth details:', err);
    }
  },
};
