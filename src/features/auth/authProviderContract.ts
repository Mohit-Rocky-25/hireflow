// ============================================================
// HireFlow — Provider-Based Authentication Contract
// DemoAuthProvider today -> SupabaseAuthProvider tomorrow.
// UI components, protected routes, and My Space depend only on
// the AuthIdentity / useAuthStore contract, never provider internals.
// ============================================================

export type AuthProviderId = 'demo' | 'supabase';
export type AuthMethodKind = 'google' | 'email' | 'demo' | 'e2e';

export interface AuthIdentity {
  userId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  provider: AuthMethodKind;
  isDemo: boolean;
}

/**
 * Minimal non-sensitive descriptor retained strictly in sessionStorage
 * for in-session Demo Mode continuity across page refreshes.
 * Never stores passwords, OAuth tokens, secrets, or application data.
 */
export interface DemoSessionDescriptor {
  userId: string;
  displayName: string;
  email: string;
  provider: 'demo';
  createdAt: string;
  seededSample: boolean;
}

export interface AuthProviderAdapter {
  readonly id: AuthProviderId;
  readonly label: string;
  readonly isCloudBacked: boolean;
  getSession: () => DemoSessionDescriptor | null;
  clearSession: () => void;
}

export const DEMO_SESSION_STORAGE_KEY = 'hireflow:demo:session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getSafeSessionStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
    if (typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis) {
      return (globalThis as { sessionStorage?: Storage }).sessionStorage ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function makeDemoUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `demo-${crypto.randomUUID()}`;
  }
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateDemoRegistrationInput(
  rawName: string,
  rawEmail: string
): { valid: true; displayName: string; email: string } | { valid: false; error: string } {
  const displayName = rawName.trim();
  const email = rawEmail.trim().toLowerCase();

  if (displayName.length < 2) {
    return { valid: false, error: 'Please enter your name (at least 2 characters).' };
  }
  if (displayName.length > 80) {
    return { valid: false, error: 'Name must be 80 characters or fewer.' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, error: 'Please enter a valid email address for the demo session.' };
  }

  return { valid: true, displayName, email };
}

export const DemoAuthProvider: AuthProviderAdapter & {
  registerDemo: (
    fullName: string,
    email: string,
    options?: { seededSample?: boolean }
  ) => DemoSessionDescriptor;
} = {
  id: 'demo',
  label: 'Demo Mode (In-Session Identity)',
  isCloudBacked: false,

  registerDemo(fullName, email, options) {
    const validated = validateDemoRegistrationInput(fullName, email);
    if (!validated.valid) {
      throw new Error(validated.error);
    }

    const descriptor: DemoSessionDescriptor = {
      userId: makeDemoUserId(),
      displayName: validated.displayName,
      email: validated.email,
      provider: 'demo',
      createdAt: new Date().toISOString(),
      seededSample: options?.seededSample !== false,
    };

    const ss = getSafeSessionStorage();
    if (ss) {
      ss.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(descriptor));
    }

    return descriptor;
  },

  getSession() {
    const ss = getSafeSessionStorage();
    if (!ss) return null;
    try {
      const raw = ss.getItem(DEMO_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<DemoSessionDescriptor>;
      if (
        typeof parsed.userId === 'string' &&
        parsed.userId.startsWith('demo-') &&
        typeof parsed.displayName === 'string' &&
        parsed.displayName.trim().length >= 2 &&
        typeof parsed.email === 'string' &&
        EMAIL_PATTERN.test(parsed.email) &&
        parsed.provider === 'demo'
      ) {
        return {
          userId: parsed.userId,
          displayName: parsed.displayName,
          email: parsed.email,
          provider: 'demo',
          createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
          seededSample: Boolean(parsed.seededSample),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  clearSession() {
    const ss = getSafeSessionStorage();
    if (ss) {
      ss.removeItem(DEMO_SESSION_STORAGE_KEY);
    }
  },
};

export const SupabaseAuthProviderMeta = {
  id: 'supabase' as const,
  label: 'Supabase Auth (Google OAuth PKCE)',
  isCloudBacked: true,
};
