// ============================================================
// HireFlow — Supabase Gateway (Postgres + Private Storage)
// Enforces importBoundaries guarantee: @supabase/supabase-js
// and supabaseClient live strictly within auth/ and sync/.
// ============================================================

import {
  getSupabase,
  isSupabaseRuntimeConfigured,
  PRIVATE_DOCUMENT_BUCKET,
} from '@/features/auth/supabaseClient';
import type { Database } from '@/lib/supabase/database.types';

export type PublicTableName = keyof Database['public']['Tables'];

export interface LegacyImportReceiptRow {
  user_id?: string;
  import_key: string;
  imported_at: string;
  record_counts: Record<string, number>;
  source_summary: Record<string, unknown>;
}

export interface CloudGateway {
  isConfigured(): boolean;
  getAuthenticatedUserId(): Promise<string | null>;
  selectRows<T = Record<string, unknown>>(
    table: PublicTableName,
    options?: {
      orderBy?: string;
      ascending?: boolean;
      limit?: number;
      eq?: Record<string, string>;
    }
  ): Promise<T[]>;
  upsertRows(
    table: PublicTableName,
    rows: Record<string, unknown>[],
    options?: { onConflict?: string; ignoreDuplicates?: boolean }
  ): Promise<void>;
  deleteRows(table: PublicTableName, match: Record<string, string>): Promise<void>;
  uploadStorageFile(
    path: string,
    body: Blob | ArrayBuffer | Uint8Array,
    contentType: string
  ): Promise<{ path: string }>;
  downloadStorageFile(path: string): Promise<Blob>;
  createSignedDownloadUrl(path: string, expiresInSeconds?: number): Promise<string>;
  removeStorageFiles(paths: string[]): Promise<void>;
  listUserStoragePaths(userId: string): Promise<string[]>;
  eraseMyDataRpc(): Promise<void>;
}

class LiveSupabaseGateway implements CloudGateway {
  isConfigured(): boolean {
    return isSupabaseRuntimeConfigured();
  }

  async getAuthenticatedUserId(): Promise<string | null> {
    if (!this.isConfigured()) return null;
    const supabase = await getSupabase();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.user?.id) {
      return null;
    }
    return session.user.id;
  }

  async selectRows<T = Record<string, unknown>>(
    table: PublicTableName,
    options: {
      orderBy?: string;
      ascending?: boolean;
      limit?: number;
      eq?: Record<string, string>;
    } = {}
  ): Promise<T[]> {
    const supabase = await getSupabase();
    let query = supabase.from(table).select('*') as any;
    if (options.eq) {
      for (const [k, v] of Object.entries(options.eq)) {
        query = query.eq(k, v);
      }
    }
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message || `Select failed on ${table}`);
    }
    return (data as T[]) ?? [];
  }

  async upsertRows(
    table: PublicTableName,
    rows: Record<string, unknown>[],
    options: { onConflict?: string; ignoreDuplicates?: boolean } = {}
  ): Promise<void> {
    if (rows.length === 0) return;
    const supabase = await getSupabase();
    const { error } = await (supabase.from(table) as any).upsert(rows, {
      onConflict: options.onConflict,
      ignoreDuplicates: options.ignoreDuplicates ?? false,
    });
    if (error) {
      throw new Error(error.message || `Upsert failed on ${table}`);
    }
  }

  async deleteRows(table: PublicTableName, match: Record<string, string>): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await (supabase.from(table) as any).delete().match(match);
    if (error) {
      throw new Error(error.message || `Delete failed on ${table}`);
    }
  }

  async uploadStorageFile(
    path: string,
    body: Blob | ArrayBuffer | Uint8Array,
    contentType: string
  ): Promise<{ path: string }> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage
      .from(PRIVATE_DOCUMENT_BUCKET)
      .upload(path, body, {
        contentType,
        upsert: false,
      });
    if (error || !data) {
      throw new Error(error?.message || `Failed to upload object ${path}`);
    }
    return { path: data.path };
  }

  async downloadStorageFile(path: string): Promise<Blob> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage
      .from(PRIVATE_DOCUMENT_BUCKET)
      .download(path);
    if (error || !data) {
      throw new Error(error?.message || `Failed to download object ${path}`);
    }
    return data;
  }

  async createSignedDownloadUrl(path: string, expiresInSeconds = 60): Promise<string> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.storage
      .from(PRIVATE_DOCUMENT_BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data?.signedUrl) {
      throw new Error(error?.message || `Failed to sign URL for ${path}`);
    }
    return data.signedUrl;
  }

  async removeStorageFiles(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const supabase = await getSupabase();
    const { error } = await supabase.storage
      .from(PRIVATE_DOCUMENT_BUCKET)
      .remove(paths);
    if (error) {
      throw new Error(error.message || 'Failed to delete storage files');
    }
  }

  async listUserStoragePaths(userId: string): Promise<string[]> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('user_documents')
      .select('storage_path')
      .eq('user_id', userId);
    if (error) {
      throw new Error(error.message || 'Failed to list user document paths');
    }
    return ((data as Array<{ storage_path: string }>) || []).map((r) => r.storage_path);
  }

  async eraseMyDataRpc(): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await supabase.rpc('erase_my_data');
    if (error) {
      throw new Error(error.message || 'erase_my_data RPC failed');
    }
  }
}

const defaultGateway = new LiveSupabaseGateway();
let activeGateway: CloudGateway = defaultGateway;

export function getCloudGateway(): CloudGateway {
  return activeGateway;
}

/** Test-only override to exercise cloud workflows deterministically without remote credentials. */
export function _setCloudGatewayForTesting(gateway: CloudGateway | null): void {
  activeGateway = gateway ?? defaultGateway;
}
