export interface DemoEnv {
  MODE?: string;
  VITE_DEMO_LOGIN?: string;
  VITE_DEMO_EMAIL?: string;
  VITE_DEMO_PASSWORD?: string;
  VITE_DEMO_ALLOW_PRODUCTION?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}
export type DemoAvailability =
  | { enabled: false; reason: 'flag_off' | 'missing_credentials' | 'blocked_in_production' }
  | { enabled: true; storage: 'cloud' | 'local' };

/**
 * The demo login is off unless explicitly enabled. In a production build it also needs an explicit second flag,
 * because the demo password ships inside the client bundle and every visitor shares that account.
 * Without Supabase configured, the demo still works but keeps its data on this browser only.
 */
export function demoAvailability(env: DemoEnv): DemoAvailability {
  if (env.VITE_DEMO_LOGIN !== '1') return { enabled: false, reason: 'flag_off' };
  if (env.MODE === 'production' && env.VITE_DEMO_ALLOW_PRODUCTION !== '1') return { enabled: false, reason: 'blocked_in_production' };
  const cloud = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  if (cloud && !(env.VITE_DEMO_EMAIL && env.VITE_DEMO_PASSWORD)) return { enabled: false, reason: 'missing_credentials' };
  return { enabled: true, storage: cloud ? 'cloud' : 'local' };
}

export interface AuthProblem { title: string; detail: string; fix: string }

/** Turns the raw error parameters of an auth redirect into something a person (or the developer) can act on. */
export function explainAuthError(params: Readonly<Record<string, string | undefined>>): AuthProblem | null {
  const code = (params.error_code ?? params.error ?? '').toLowerCase();
  const desc = (params.error_description ?? '').toLowerCase();
  if (!code && !desc) return null;
  const both = `${code} ${desc}`;
  if (both.includes('redirect_uri_mismatch') || both.includes('redirect uri') || both.includes('redirect_to')) {
    return { title: 'The sign-in redirect address is not allowed', detail: 'Google or Supabase rejected the address this site asked to return to.',
      fix: 'Add the exact site URL plus /auth/callback to Supabase Auth URL Configuration (Redirect URLs) and to the Google OAuth client authorized redirect URIs.' };
  }
  if (both.includes('provider is not enabled') || both.includes('unsupported provider') || both.includes('provider_disabled')) {
    return { title: 'Google sign-in is not turned on', detail: 'The Google provider is disabled in this Supabase project.',
      fix: 'Enable Google under Supabase Authentication, Providers, and paste the Google client ID and secret. Or use the demo account.' };
  }
  if (both.includes('access_denied')) {
    return { title: 'Sign-in was cancelled or not allowed', detail: 'Google did not grant access. If the Google app is in testing mode, only listed test users may sign in.',
      fix: 'Try again, or add your Google account as a test user in the Google Cloud consent screen. Or use the demo account.' };
  }
  if (both.includes('flow state') || both.includes('code verifier') || both.includes('invalid_grant') || both.includes('pkce')) {
    return { title: 'The sign-in session could not be completed', detail: 'The browser lost the secure sign-in token, which happens when the flow is opened in another tab or browser, or storage was cleared.',
      fix: 'Start sign-in again in the same browser tab, with site data not blocked.' };
  }
  return { title: 'Sign-in failed', detail: 'The sign-in service returned an error.', fix: 'Try again, or use the demo account.' };
}

