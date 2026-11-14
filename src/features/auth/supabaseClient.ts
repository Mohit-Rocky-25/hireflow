import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : process.env.VITE_SUPABASE_URL;
const envAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(envUrl && envAnonKey);

export function getSupabase(): Promise<SupabaseClient<Database>> {
  if (!isAuthConfigured) {
    throw new Error('AUTH_NOT_CONFIGURED');
  }

  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient<Database>(envUrl as string, envAnonKey as string, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  );

  return clientPromise;
}

/** Reset for testing only */
export function _resetSupabaseClient(): void {
  clientPromise = null;
}
