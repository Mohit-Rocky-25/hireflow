// ============================================================
// HireFlow — OAuth Error Diagnostics & Safe Return-To Validation
// ============================================================

export type AuthProblem =
  | 'access_denied'
  | 'config_missing'
  | 'expired_code'
  | 'session_expired'
  | 'network'
  | 'unknown';

export function validateReturnToPath(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    trimmed.includes('\\')
  ) {
    return null;
  }
  return trimmed;
}

export function explainAuthError(
  errorParam: string,
  description?: string | null
): { problem: AuthProblem; title: string; detail: string; recoverable: boolean } {
  const normalized = `${errorParam} ${description ?? ''}`.toLowerCase();

  if (normalized.includes('access_denied') || normalized.includes('cancelled')) {
    return {
      problem: 'access_denied',
      title: 'Google sign-in was cancelled',
      detail: 'No account permissions were granted. You can retry Google sign-in anytime or continue as Guest in memory.',
      recoverable: true,
    };
  }

  if (
    normalized.includes('auth_not_configured') ||
    normalized.includes('vite_supabase_url') ||
    normalized.includes('vite_supabase_anon_key')
  ) {
    return {
      problem: 'config_missing',
      title: 'Cloud authentication is not configured yet',
      detail:
        description ||
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set before Google OAuth can complete.',
      recoverable: false,
    };
  }

  if (
    normalized.includes('expired') ||
    normalized.includes('pkce') ||
    normalized.includes('invalid flow state') ||
    normalized.includes('code verifier')
  ) {
    return {
      problem: 'expired_code',
      title: 'Sign-in link expired',
      detail: 'The OAuth callback verification code expired or was already used. Please start Google sign-in again.',
      recoverable: true,
    };
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return {
      problem: 'network',
      title: 'Network error during authentication',
      detail: 'Unable to reach Supabase authentication servers. Check your connection and try again.',
      recoverable: true,
    };
  }

  return {
    problem: 'unknown',
    title: 'Unable to complete sign-in',
    detail: description || errorParam || 'Unexpected authentication failure.',
    recoverable: true,
  };
}
