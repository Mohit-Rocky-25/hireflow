import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateRouteGuard } from '@/components/auth/ProtectedRoute';
import type { UserRole } from '@/types';

class StorageMock implements Storage {
  private store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  key(index: number) { return Object.keys(this.store)[index] ?? null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new StorageMock();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new StorageMock();
}

import { useStore } from '@/store/useStore';

describe('Authentication & Route Guard Security (Phase 5)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useStore.setState({
      currentUser: null,
      isAuthenticated: false,
    });
  });

  describe('Unauthenticated Access Controls', () => {
    it('redirects unauthenticated visitors to /login', () => {
      const decision = evaluateRouteGuard(false, null, ['CANDIDATE']);
      expect(decision.allowed).toBe(false);
      if (!decision.allowed) {
        expect(decision.redirect).toBe('/login');
      }
    });

    it('preserves attempted destination URL in location state for post-login redirect', () => {
      const mockLocation = { pathname: '/candidate/jobs/job-123' };
      const decision = evaluateRouteGuard(false, null, ['CANDIDATE'], mockLocation);
      expect(decision.allowed).toBe(false);
      if (!decision.allowed) {
        expect(decision.state).toEqual({ from: mockLocation });
      }
    });
  });

  describe('Role-Based Access Control (RBAC) Matrix', () => {
    it('grants access when user role matches authorized roles', () => {
      const decision = evaluateRouteGuard(true, { role: 'PLATFORM_ADMIN' }, ['PLATFORM_ADMIN']);
      expect(decision.allowed).toBe(true);
    });

    it('blocks CANDIDATE from accessing PLATFORM_ADMIN routes and redirects to candidate dashboard', () => {
      const decision = evaluateRouteGuard(true, { role: 'CANDIDATE' }, ['PLATFORM_ADMIN']);
      expect(decision.allowed).toBe(false);
      if (!decision.allowed) {
        expect(decision.redirect).toBe('/candidate/dashboard');
      }
    });

    it('blocks CANDIDATE from accessing Company/BHR routes', () => {
      const decision = evaluateRouteGuard(true, { role: 'CANDIDATE' }, ['BHR_MANAGER', 'HR_RECRUITER']);
      expect(decision.allowed).toBe(false);
      if (!decision.allowed) {
        expect(decision.redirect).toBe('/candidate/dashboard');
      }
    });

    it('blocks INTERVIEWER from accessing Admin routes', () => {
      const decision = evaluateRouteGuard(true, { role: 'INTERVIEWER' }, ['PLATFORM_ADMIN']);
      expect(decision.allowed).toBe(false);
      if (!decision.allowed) {
        expect(decision.redirect).toBe('/interviewer/dashboard');
      }
    });

    it('allows both BHR_MANAGER and HR_RECRUITER on company routes', () => {
      const decisionBhr = evaluateRouteGuard(true, { role: 'BHR_MANAGER' }, ['BHR_MANAGER', 'HR_RECRUITER']);
      const decisionHr = evaluateRouteGuard(true, { role: 'HR_RECRUITER' }, ['BHR_MANAGER', 'HR_RECRUITER']);
      expect(decisionBhr.allowed).toBe(true);
      expect(decisionHr.allowed).toBe(true);
    });
  });

  describe('Session Termination (Logout)', () => {
    it('invalidates authentication status and purges session tokens on logout', () => {
      useStore.setState({
        isAuthenticated: true,
        currentUser: {
          id: 'user-cand-1',
          name: 'Demo Candidate',
          email: 'cand@example.com',
          role: 'CANDIDATE',
          status: 'active',
          avatar: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      sessionStorage.setItem('hf_hash_user-cand-1', 'active_session_token');

      useStore.getState().logout();

      expect(useStore.getState().isAuthenticated).toBe(false);
      expect(useStore.getState().currentUser).toBeNull();
      expect(sessionStorage.getItem('hf_hash_user-cand-1')).toBeNull();
    });
  });
});
