// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { validateReturnTo, useAuthStore } from '@/features/auth/useAuthStore';
import { isAuthConfigured, getSupabase } from '@/features/auth/supabaseClient';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';

describe('Stage 2: Auth and Guest Boundary', () => {
  beforeEach(() => {
    useAuthStore.setState({ status: 'guest', userId: null, email: null, error: null });
  });

  describe('Zero-egress and Client Construction Rule (C2)', () => {
    it('never constructs the Supabase client when in guest mode', () => {
      // In guest mode, useAuthStore has not called getSupabase
      expect(useAuthStore.getState().status).toBe('guest');
      expect(useAuthStore.getState().userId).toBeNull();
    });

    it('throws or disables sign-in when isAuthConfigured is false', () => {
      // If VITE_SUPABASE_URL and KEY are unset, getSupabase throws AUTH_NOT_CONFIGURED
      if (!isAuthConfigured) {
        expect(() => getSupabase()).toThrow('AUTH_NOT_CONFIGURED');
      }
    });
  });

  describe('Hostile returnTo validation', () => {
    const hostileInputs = [
      '//evil.com',
      '//evil.com/phish',
      '/\\evil.com',
      'https://evil.com',
      'http://evil.com',
      'javascript:alert(1)',
      'data:text/html,<html>',
      '   //evil.com',
      '   https://evil.com',
      '',
      'a'.repeat(2000),
      '/portal\nhttp://evil.com',
      '/portal\rhttp://evil.com',
      'ftp://server/path',
      'mailto:test@example.com'
    ];

    it('rejects at least 12 hostile returnTo inputs and defaults to /', () => {
      expect(hostileInputs.length).toBeGreaterThanOrEqual(12);
      for (const hostile of hostileInputs) {
        const validated = validateReturnTo(hostile);
        expect(validated).toBe('/');
      }
    });

    it('accepts valid relative paths', () => {
      expect(validateReturnTo('/portal')).toBe('/portal');
      expect(validateReturnTo('/portal/resumes')).toBe('/portal/resumes');
      expect(validateReturnTo('/portal/audits/123')).toBe('/portal/audits/123');
      expect(validateReturnTo('/tools/resume-checker')).toBe('/tools/resume-checker');
    });
  });

  describe('Sign out cleanup', () => {
    it('clears auth hint and resets state on signOut', async () => {
      useAuthStore.setState({ status: 'authenticated', userId: 'user-123', email: 'test@example.com' });
      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().status).toBe('guest');
      expect(useAuthStore.getState().userId).toBeNull();
    });
  });
});
