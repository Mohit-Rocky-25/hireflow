// __HIREFLOW_E2E_HARNESS__
// This harness is used ONLY during E2E testing in 'e2e' mode.
// C9 constraint: Must not be included in the production build.

import { memoryTransport } from '@/sync/memoryTransport';
import { useAuthStore } from './useAuthStore';

declare global {
  interface Window {
    __e2eTransport?: {
      getPushedOps: () => unknown[];
      clear: () => void;
    };
    __e2eSignIn?: (userId?: string, email?: string) => void;
    __e2eSignOut?: () => void;
  }
}

export function installE2eHarness(): void {
  if (typeof window === 'undefined') return;

  window.__e2eTransport = {
    getPushedOps: () => [...memoryTransport.pushedOps],
    clear: () => memoryTransport.reset(),
  };

  const savedUserId = localStorage.getItem('hireflow:v5:e2e-user');
  if (localStorage.getItem('hireflow:v5:auth-hint') === '1' && savedUserId) {
    useAuthStore.setState({
      status: 'authenticated',
      userId: savedUserId,
      email: `${savedUserId}@example.com`,
      error: null,
    });
  }

  window.__e2eSignIn = (userId = 'e2e-user-123', email = 'test@example.com') => {
    localStorage.setItem('hireflow:v5:e2e-user', userId);
    localStorage.setItem('hireflow:v5:auth-hint', '1');
    useAuthStore.setState({
      status: 'authenticated',
      userId,
      email,
      error: null,
    });
  };

  window.__e2eSignOut = () => {
    localStorage.removeItem('hireflow:v5:e2e-user');
    localStorage.removeItem('hireflow:v5:auth-hint');
    useAuthStore.setState({
      status: 'guest',
      userId: null,
      email: null,
      error: null,
    });
  };
}
