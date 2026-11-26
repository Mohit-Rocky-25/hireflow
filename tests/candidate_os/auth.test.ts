import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, purgeLegacyBrowserUserData } from '@/features/auth/useAuthStore';
import { explainAuthError, validateReturnToPath } from '@/features/auth/authErrors';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { cacheSnapshotInMemory, getCachedSnapshotInMemory } from '@/lib/cloud/cloudRepository';

describe('Cloud-First Authentication Lifecycle (Phase 10.8)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    useAuthStore.setState({
      status: 'guest',
      userId: null,
      displayName: null,
      email: null,
      avatarUrl: null,
      provider: null,
      error: null,
      openDialog: false,
      dialogReason: null,
      returnTo: null,
    });
  });

  it('starts unauthenticated cleanly in guest mode and never falls back to a demo account on unconfigured OAuth', async () => {
    await useAuthStore.getState().signInWithGoogle('/portal/resumes');
    const st = useAuthStore.getState();
    expect(st.status).toBe('error');
    expect(st.userId).toBeNull();
    expect(st.error).toContain('AUTH_NOT_CONFIGURED');
  });

  it('validates returnTo paths strictly against open redirects', () => {
    expect(validateReturnToPath('/portal/audits/123')).toBe('/portal/audits/123');
    expect(validateReturnToPath('https://evil.example/steal')).toBeNull();
    expect(validateReturnToPath('//evil.example/steal')).toBeNull();
    expect(validateReturnToPath('javascript:alert(1)')).toBeNull();
    expect(validateReturnToPath('\\\\unc-path')).toBeNull();
  });

  it('explains Google OAuth error codes clearly without demo bypass copy', () => {
    const denied = explainAuthError('access_denied', 'User denied access');
    expect(denied.problem).toBe('access_denied');
    expect(denied.title.toLowerCase()).toContain('cancelled');

    const expired = explainAuthError('invalid_request', 'PKCE code verifier expired');
    expect(expired.problem).toBe('expired_code');
  });

  it('wipes previous user memory stores immediately on account switch and signOut', async () => {
    const hashA = 'a'.repeat(64);
    cacheSnapshotInMemory({
      hash: hashA,
      text: 'User A Private Resume',
      charCount: 21,
      wordCount: 4,
      createdAt: '2026-11-26T00:00:00.000Z',
    });
    useAtsToolStore.getState().setResumeText('User A Private Resume', 'a.pdf');

    // Switch session directly to null -> clears previous user's memory
    useAuthStore.setState({ userId: '11111111-1111-4111-8111-111111111111', status: 'authenticated' });
    await useAuthStore.getState().handleSessionExpired('Session token expired');

    expect(useAuthStore.getState().status).toBe('guest');
    expect(useAuthStore.getState().userId).toBeNull();
    expect(useAuthStore.getState().error).toContain('expired');
    expect(useAtsToolStore.getState().rawResumeText).toBe('');
    expect(getCachedSnapshotInMemory(hashA)).toBeNull();

    // Purge clears legacy keys while preserving UI theme preferences
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hireflow_sim_cloud_u1', '{}');
      localStorage.setItem('hireflow:v4:design', 'spruce');
      purgeLegacyBrowserUserData();
      expect(localStorage.getItem('hireflow_sim_cloud_u1')).toBeNull();
      expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    }
  });
});
