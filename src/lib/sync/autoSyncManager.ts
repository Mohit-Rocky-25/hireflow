/**
 * HireFlo Auto-Sync Manager
 * Coordinates automatic background synchronization between local browser storage and cloud database.
 */

import { supabase, isSupabaseConfigured, CloudPayload } from '../supabase/client';
import { useStore } from '../../store/useStore';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type SyncListener = (state: SyncState, lastSyncedAt: string | null) => void;

class AutoSyncManager {
  private syncState: SyncState = 'idle';
  private lastSyncedAt: string | null = null;
  private syncTimer: any = null;
  private listeners: Set<SyncListener> = new Set();
  private isPulling = false;

  constructor() {
    this.lastSyncedAt = typeof localStorage !== 'undefined' ? localStorage.getItem('hireflo_last_cloud_sync_at') : null;
    // Listen to network status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.syncState, this.lastSyncedAt);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.syncState, this.lastSyncedAt);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    }
  }

  public getStatus(): { state: SyncState; lastSyncedAt: string | null } {
    return {
      state: this.syncState,
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  private handleNetworkChange(isOnline: boolean) {
    if (!isOnline) {
      this.syncState = 'offline';
      this.notify();
    } else {
      this.scheduleSync(500);
    }
  }

  /**
   * Schedules a debounced background sync cycle
   */
  public scheduleSync(delayMs = 1500) {
    if (this.isPulling) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);

    this.syncTimer = setTimeout(() => {
      this.triggerPushSync();
    }, delayMs);
  }

  /**
   * Pulls the latest cloud data down to this device (e.g. upon user login)
   */
  public async pullFromCloud(userId: string): Promise<boolean> {
    if (!userId) return false;
    this.isPulling = true;
    this.syncState = 'syncing';
    this.notify();

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('user_sync_data')
          .select('payload, updated_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data && data.payload) {
          this.applyPayloadToLocalStorage(data.payload);
        }
      } else {
        // Simulated local multi-device sync cache
        const simCloud = localStorage.getItem(`hireflo_sim_cloud_${userId}`);
        if (simCloud) {
          const parsed = JSON.parse(simCloud);
          this.applyPayloadToLocalStorage(parsed);
        }
      }

      this.syncState = 'synced';
      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('hireflo_last_cloud_sync_at', this.lastSyncedAt);
      this.notify();
      return true;
    } catch (err) {
      console.warn('[HireFlo AutoSync] Pull failed:', err);
      this.syncState = 'error';
      this.notify();
      return false;
    } finally {
      this.isPulling = false;
    }
  }

  /**
   * Pushes current device state to the cloud
   */
  public async triggerPushSync(): Promise<boolean> {
    const currentUser = useStore.getState().currentUser;
    if (!currentUser || !currentUser.id) {
      // User is not signed in, keep local-only
      this.syncState = 'idle';
      this.notify();
      return false;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.syncState = 'offline';
      this.notify();
      return false;
    }

    this.syncState = 'syncing';
    this.notify();

    try {
      const payload: CloudPayload = {
        profile: this.readLocalStorageJson('hireflow:v4:profile') || {},
        atsEvaluation: this.readLocalStorageJson('hireflow_tool_ats_v3') || {},
        scanHistory: this.readLocalStorageJson('hireflow:v4:scan-history') || [],
        savedJds: this.readLocalStorageJson('hireflow:v4:saved-jds') || [],
        tailorLedger: this.readLocalStorageJson('hireflow-tailor-ledger-v2') || {},
        updatedAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('user_sync_data')
          .upsert({
            user_id: currentUser.id,
            payload,
            updated_at: payload.updatedAt,
          }, { onConflict: 'user_id' });

        if (error) throw error;
      } else {
        // Save to simulated cloud key
        localStorage.setItem(`hireflo_sim_cloud_${currentUser.id}`, JSON.stringify(payload));
      }

      this.syncState = 'synced';
      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('hireflo_last_cloud_sync_at', this.lastSyncedAt);
      this.notify();
      return true;
    } catch (err) {
      console.warn('[HireFlo AutoSync] Push sync failed:', err);
      this.syncState = 'error';
      this.notify();
      return false;
    }
  }

  private readLocalStorageJson(key: string): any {
    try {
      if (typeof localStorage === 'undefined') return null;
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  private applyPayloadToLocalStorage(payload: CloudPayload) {
    if (!payload || typeof localStorage === 'undefined') return;
    try {
      if (payload.profile && Object.keys(payload.profile).length > 0) {
        localStorage.setItem('hireflow:v4:profile', JSON.stringify(payload.profile));
      }
      if (payload.atsEvaluation && Object.keys(payload.atsEvaluation).length > 0) {
        localStorage.setItem('hireflow_tool_ats_v3', JSON.stringify(payload.atsEvaluation));
      }
      if (payload.scanHistory && payload.scanHistory.length > 0) {
        localStorage.setItem('hireflow:v4:scan-history', JSON.stringify(payload.scanHistory));
      }
      if (payload.savedJds && payload.savedJds.length > 0) {
        localStorage.setItem('hireflow:v4:saved-jds', JSON.stringify(payload.savedJds));
      }
      if (payload.tailorLedger && Object.keys(payload.tailorLedger).length > 0) {
        localStorage.setItem('hireflow-tailor-ledger-v2', JSON.stringify(payload.tailorLedger));
      }
    } catch (err) {
      console.error('[HireFlo AutoSync] Error restoring cloud state to local storage:', err);
    }
  }
}

export const autoSyncManager = new AutoSyncManager();
