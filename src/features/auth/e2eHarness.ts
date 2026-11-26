// ============================================================
// HireFlow — Strictly Test-Only In-Memory E2E Harness
// Never enabled in production builds; stores zero auth flags in localStorage.
// ============================================================

export interface E2EHarnessUser {
  userId: string;
  displayName?: string;
  email?: string;
}

declare global {
  interface Window {
    __HIREFLOW_E2E_AUTH__?: E2EHarnessUser | null;
  }
}

export function isE2EHarnessEnabled(): boolean {
  return Boolean(!import.meta.env.PROD && import.meta.env.VITE_E2E_AUTH_BYPASS === 'true');
}

export function readE2EHarnessUser(): E2EHarnessUser | null {
  if (!isE2EHarnessEnabled() || typeof window === 'undefined') return null;
  return window.__HIREFLOW_E2E_AUTH__ ?? null;
}

export function setE2EHarnessUser(user: E2EHarnessUser | null): void {
  if (!isE2EHarnessEnabled() || typeof window === 'undefined') return;
  window.__HIREFLOW_E2E_AUTH__ = user;
}
