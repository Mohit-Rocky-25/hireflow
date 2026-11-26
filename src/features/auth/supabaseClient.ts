import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import {
  getSupabaseConfigStatus,
  requireSupabaseEnv,
  getAuthRedirectUrl,
  PRIVATE_DOCUMENT_BUCKET,
} from '@/lib/supabase/env';

let clientPromise: Promise<SupabaseClient<Database>> | null = null;
let cachedEnvSignature = '';

const initialStatus = getSupabaseConfigStatus();
export const isAuthConfigured = initialStatus.configured;

export { getSupabaseConfigStatus, getAuthRedirectUrl, PRIVATE_DOCUMENT_BUCKET };

export function isSupabaseRuntimeConfigured(): boolean {
  return getSupabaseConfigStatus().configured;
}

export function getSupabase(): Promise<SupabaseClient<Database>> {
  const { url, anonKey } = requireSupabaseEnv();
  const sig = `${url}|${anonKey.slice(0, 8)}`;

  if (!clientPromise || cachedEnvSignature !== sig) {
    cachedEnvSignature = sig;
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient<Database>(url, anonKey, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    );
  }

  return clientPromise;
}

/** Reset for testing or account/config switches */
export function _resetSupabaseClient(): void {
  clientPromise = null;
  cachedEnvSignature = '';
}
