// ============================================================
// HireFlow — Centralized Supabase Environment Validation
// Never hardcodes secrets; never allows service-role keys in browser code.
// ============================================================

export const PRIVATE_DOCUMENT_BUCKET = 'user-documents';
export const AUTH_CALLBACK_PATH = '/auth/callback';

export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  siteUrl?: string;
}

export interface SupabaseConfigStatus {
  configured: boolean;
  missingVars: Array<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'>;
  invalidReason: string | null;
  url: string | null;
  redirectUrl: string;
  storageBucket: string;
}

function readEnvValue(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const val = (import.meta.env as Record<string, unknown>)[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
  } catch {
    // fallback to process.env below
  }

  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
  } catch {
    // ignore process.env access errors in restricted runtimes
  }

  return '';
}

function isServiceRoleJwt(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

function isValidSupabaseUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'https:') return Boolean(parsed.hostname);
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getAuthRedirectUrl(siteUrlOverride?: string): string {
  const configuredSiteUrl = siteUrlOverride?.trim() || readEnvValue('VITE_PUBLIC_SITE_URL');
  if (configuredSiteUrl && isValidSupabaseUrl(configuredSiteUrl)) {
    return `${configuredSiteUrl.replace(/\/+$/, '')}${AUTH_CALLBACK_PATH}`;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin.replace(/\/+$/, '')}${AUTH_CALLBACK_PATH}`;
  }
  return `http://localhost:5173${AUTH_CALLBACK_PATH}`;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = readEnvValue('VITE_SUPABASE_URL');
  const anonKey = readEnvValue('VITE_SUPABASE_ANON_KEY');
  const missingVars: Array<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'> = [];

  if (!url) missingVars.push('VITE_SUPABASE_URL');
  if (!anonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  let invalidReason: string | null = null;
  if (url && !isValidSupabaseUrl(url)) {
    invalidReason =
      'VITE_SUPABASE_URL must be an https:// Supabase project URL (or http://localhost for local Supabase CLI).';
  } else if (anonKey && isServiceRoleJwt(anonKey)) {
    invalidReason =
      'SECURITY ERROR: VITE_SUPABASE_ANON_KEY appears to be a Supabase service_role key. Never expose service_role keys to browser bundles.';
  }

  const configured = missingVars.length === 0 && invalidReason === null;

  return {
    configured,
    missingVars,
    invalidReason,
    url: configured ? url : null,
    redirectUrl: getAuthRedirectUrl(),
    storageBucket: PRIVATE_DOCUMENT_BUCKET,
  };
}

export function requireSupabaseEnv(): SupabaseEnvConfig {
  const status = getSupabaseConfigStatus();
  if (!status.configured) {
    if (status.invalidReason) {
      throw new Error(`AUTH_NOT_CONFIGURED: ${status.invalidReason}`);
    }
    throw new Error(
      `AUTH_NOT_CONFIGURED: Missing required environment variable(s): ${status.missingVars.join(', ')}. Configure .env.local or deployment environment variables before using cloud authentication or storage.`
    );
  }

  return {
    url: readEnvValue('VITE_SUPABASE_URL'),
    anonKey: readEnvValue('VITE_SUPABASE_ANON_KEY'),
    siteUrl: readEnvValue('VITE_PUBLIC_SITE_URL') || undefined,
  };
}
