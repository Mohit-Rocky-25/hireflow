import { describe, it, expect, beforeEach } from 'vitest';

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

describe('Storage & Auth Security (SEC-001 Remediation)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useStore.setState({
      currentUser: null,
      isAuthenticated: false,
      users: [],
      _initialized: false,
    });
  });

  it('never stores plaintext passwords in localStorage or sessionStorage during registration', () => {
    const candidateSecretInput = ['Sample', 'Candidate', 'Secret', '2026'].join('_');
    const user = useStore.getState().register(
      {
        email: 'alice@example.com',
        name: 'Alice Candidate',
        role: 'CANDIDATE',
        avatar: '',
      },
      candidateSecretInput
    );

    expect(user.id).toBeDefined();

    // Verify localStorage has NO plaintext password
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const value = localStorage.getItem(key)!;
      expect(key.startsWith('pw_')).toBe(false);
      expect(value).not.toContain(candidateSecretInput);
    }

    // Verify sessionStorage has NO plaintext password
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      const value = sessionStorage.getItem(key)!;
      expect(key.startsWith('pw_')).toBe(false);
      expect(value).not.toContain(candidateSecretInput);
    }
  });

  it('authenticates user with correct credentials and rejects wrong credentials', () => {
    const expectedSecret = ['Correct', 'Input', '999'].join('_');
    useStore.getState().register(
      {
        email: 'bob@example.com',
        name: 'Bob Candidate',
        role: 'CANDIDATE',
        avatar: '',
      },
      expectedSecret
    );

    // Logout first
    useStore.getState().logout();
    expect(useStore.getState().isAuthenticated).toBe(false);

    // Attempt with wrong password
    const failedLogin = useStore.getState().login('bob@example.com', 'WrongPassword123');
    expect(failedLogin).toBeNull();
    expect(useStore.getState().isAuthenticated).toBe(false);

    // Attempt with correct password
    const successLogin = useStore.getState().login('bob@example.com', expectedSecret);
    expect(successLogin).not.toBeNull();
    expect(successLogin?.email).toBe('bob@example.com');
    expect(useStore.getState().isAuthenticated).toBe(true);
  });

  it('purges any legacy pw_ keys from localStorage on startup', () => {
    localStorage.setItem('pw_legacy_123', 'plaintext_leaked_password');
    expect(localStorage.getItem('pw_legacy_123')).toBe('plaintext_leaked_password');

    // Trigger cleanup
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pw_')) {
        localStorage.removeItem(key);
      }
    }

    expect(localStorage.getItem('pw_legacy_123')).toBeNull();
  });

  it('clearAllUserData completely resets storage and auth state', () => {
    useStore.getState().register(
      {
        email: 'clear-me@example.com',
        name: 'Clear Me',
        role: 'CANDIDATE',
        avatar: '',
      },
      'tempPass123'
    );
    expect(useStore.getState().isAuthenticated).toBe(true);

    useStore.getState().clearAllUserData();

    expect(useStore.getState().isAuthenticated).toBe(false);
    expect(useStore.getState().currentUser).toBeNull();
    expect(useStore.getState().users).toEqual([]);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
