import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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

describe('Privacy & Zero-Egress Security (Phase 7)', () => {
  it('verifies index.html contains zero external analytics, tracking pixels, or external CDN scripts', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    // Forbidden tracking domains & markers
    const trackingKeywords = [
      'google-analytics.com',
      'googletagmanager.com',
      'connect.facebook.net',
      'hotjar.com',
      'segment.com',
      'mixpanel.com',
      'clarity.ms',
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com',
      'unpkg.com',
    ];

    for (const tracker of trackingKeywords) {
      expect(indexContent.toLowerCase()).not.toContain(tracker);
    }
  });

  it('guarantees Right to Erasure: clearAllUserData permanently deletes stored user data', () => {
    localStorage.clear();
    sessionStorage.clear();

    useStore.setState({
      currentUser: {
        id: 'candidate-99',
        name: 'Private Candidate',
        email: 'private@example.com',
        role: 'CANDIDATE',
        status: 'active',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      candidateProfiles: [
        {
          id: 'cp-1',
          userId: 'candidate-99',
          headline: 'Fullstack Engineer',
          skills: ['TypeScript', 'React'],
          experience: [],
          education: [],
          projects: [],
          preferences: { roles: [], locations: [], remote: true, salaryMin: 0 },
          completionScore: 100,
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    localStorage.setItem('hireflow-storage-v4', JSON.stringify({ test: 'data' }));

    // Execute one-click erasure
    useStore.getState().clearAllUserData();

    expect(useStore.getState().isAuthenticated).toBe(false);
    expect(useStore.getState().currentUser).toBeNull();
    expect(useStore.getState().candidateProfiles).toEqual([]);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
