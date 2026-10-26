/**
 * HireFlo: Supabase Cloud Client & Auto-Sync Adapter
 * Seamless multi-device synchronization for user resumes, profiles, and evaluations.
 */

import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Read environment variables (with safe fallbacks)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[HireFlo Cloud] Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export interface CloudUserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CloudPayload {
  profile: any;
  atsEvaluation: any;
  scanHistory: any[];
  savedJds: any[];
  tailorLedger: any;
  updatedAt: string;
}

/**
 * High-level Cloud Auth & Sync Services
 */
export const cloudAuth = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  async signUp(email: string, password: string, fullName: string) {
    if (!this.isConfigured() || !supabase) {
      // Local fallback simulation when Supabase credentials are not yet configured in .env
      return simulateLocalAuth(email, fullName);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!this.isConfigured() || !supabase) {
      // Local fallback simulation
      return simulateLocalAuth(email, email.split('@')[0]);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    if (!this.isConfigured() || !supabase) {
      // Simulated Google Auth for local dev
      return simulateLocalAuth('candidate.google@example.com', 'Alex Rivera (Google)');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (this.isConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('hireflo_simulated_user');
  },

  async getSession() {
    if (this.isConfigured() && supabase) {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
    const sim = localStorage.getItem('hireflo_simulated_user');
    return sim ? JSON.parse(sim) : null;
  },
};

/**
 * Local simulation helper so users can immediately test multi-device cloud flows
 * even before adding production VITE_SUPABASE_URL keys.
 */
function simulateLocalAuth(email: string, fullName: string) {
  const simulatedUser = {
    id: 'user_' + Math.abs(email.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)).toString(36),
    email,
    user_metadata: { full_name: fullName },
    created_at: new Date().toISOString(),
  };

  localStorage.setItem('hireflo_simulated_user', JSON.stringify({ user: simulatedUser }));
  return { user: simulatedUser, session: { user: simulatedUser } };
}

/**
 * Global Auth State Listener for Supabase (handles OAuth redirect callbacks & session persistence)
 */
export function initSupabaseAuthListener(
  onSignIn?: (user: { id: string; email: string; displayName: string; avatarUrl?: string }) => void,
  onSignOut?: () => void
) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const u = session.user;
      const displayName =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email?.split('@')[0] ||
        'Candidate';

      if (onSignIn) {
        onSignIn({
          id: u.id,
          email: u.email || '',
          displayName,
          avatarUrl: u.user_metadata?.avatar_url || '',
        });
      }
    } else if (event === 'SIGNED_OUT') {
      if (onSignOut) onSignOut();
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
}

