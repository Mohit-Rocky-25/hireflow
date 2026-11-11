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
    // Listen to network status and internal data mutation events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      window.addEventListener('hireflow:data-changed', () => {
        this.scheduleSync(1500);
      });
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
      // 1. Gather all truth details prefixed with 'hireflow.suite.v1.truth.'
      const truthDetails: Record<string, any> = {};
      const learningSkills: Record<string, boolean> = {};

      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('hireflow.suite.v1.truth.')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                truthDetails[key] = JSON.parse(raw);
              } catch {
                truthDetails[key] = raw;
              }
            }
          } else if (key && key.startsWith('hireflow:v4:learning-path:')) {
            learningSkills[key] = localStorage.getItem(key) === 'true';
          }
        }
      }

      // Read TalentLens session from sessionStorage or localStorage
      let tlSession = null;
      if (typeof sessionStorage !== 'undefined') {
        const rawTl = sessionStorage.getItem('hireflow_talentlens_session_v1');
        if (rawTl) {
          try { tlSession = JSON.parse(rawTl); } catch { /* ignore */ }
        }
      }
      if (!tlSession) {
        tlSession = this.readLocalStorageJson('hireflow_talentlens_session_v1');
      }

      const payload: CloudPayload = {
        // 1. Candidate Profile & Fresher Intake
        profile: this.readLocalStorageJson('hireflow:v4:profile') || this.readLocalStorageJson('hireflow.suite.v1.profile') || {},
        preferences: this.readLocalStorageJson('hireflow:v4:preferences') || {},
        fresherIntake: this.readLocalStorageJson('hireflow:v4:fresher-intake') || {},

        // 2. ATS Resume Roaster & Scan History
        atsEvaluation: this.readLocalStorageJson('hireflow_tool_ats_v3') || {},
        scanHistory: this.readLocalStorageJson('hireflow:v4:scan-history') || this.readLocalStorageJson('hireflow.suite.v1.scan_history') || [],
        savedReports: this.readLocalStorageJson('hireflow:v4:saved_reports') || [],
        savedJds: this.readLocalStorageJson('hireflow:v4:saved-jds') || [],
        actionabilityGaps: this.readLocalStorageJson('hireflow_actionability_plan_completed_gaps') || [],
        realityFactors: this.readLocalStorageJson('hireflow_reality_factors') || {},
        learningPathSkills: learningSkills,

        // 3. Tailor My Resume
        tailorLedger: this.readLocalStorageJson('hireflow-tailor-ledger-v2') || {},

        // 4. Credentials & Opportunity Engine ("My Plan")
        credentialsPlan: this.readLocalStorageJson('hireflow.suite.v1.opportunity_plan') || [],
        credentialTruthDetails: truthDetails,

        // 5. Build Briefs / Proof Projects Progress
        briefProgress: this.readLocalStorageJson('hireflow:v4:brief-progress') || {},
        savedBriefs: this.readLocalStorageJson('hireflow_saved_briefs') || [],

        // 6. Career Trajectory & Target Roles
        savedRoles: this.readLocalStorageJson('hireflow:v4:saved-roles') || [],
        careerPathFilters: this.readLocalStorageJson('hireflow_career_path_filters') || {},

        // 7. TalentLens Calibration Session
        talentLensSession: tlSession,
        talentLensSavedRoles: this.readLocalStorageJson('hireflow:v4:talentlens_saved_roles') || [],

        // 8. Reach Out Studio Drafts & Preferences
        outreachDrafts: this.readLocalStorageJson('hireflow:reachout:draft_v2') || {},
        outreachSelectedTemplate: typeof localStorage !== 'undefined' ? localStorage.getItem('hireflow:reachout:selected_template_v2') || '' : '',
        outreachPremiumMode: typeof localStorage !== 'undefined' ? localStorage.getItem('hireflow:reachout:premium_mode_v2') === 'true' : false,

        // 9. Feedback & Notes
        feedback: this.readLocalStorageJson('hireflow:v4:feedback') || {},

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
      // 1. Profile & Fresher Intake
      if (payload.profile && Object.keys(payload.profile).length > 0) {
        localStorage.setItem('hireflow:v4:profile', JSON.stringify(payload.profile));
        localStorage.setItem('hireflow.suite.v1.profile', JSON.stringify(payload.profile));
      }
      if (payload.preferences && Object.keys(payload.preferences).length > 0) {
        localStorage.setItem('hireflow:v4:preferences', JSON.stringify(payload.preferences));
      }
      if (payload.fresherIntake && Object.keys(payload.fresherIntake).length > 0) {
        localStorage.setItem('hireflow:v4:fresher-intake', JSON.stringify(payload.fresherIntake));
      }

      // 2. ATS & Scans
      if (payload.atsEvaluation && Object.keys(payload.atsEvaluation).length > 0) {
        localStorage.setItem('hireflow_tool_ats_v3', JSON.stringify(payload.atsEvaluation));
      }
      if (payload.scanHistory && Array.isArray(payload.scanHistory) && payload.scanHistory.length > 0) {
        localStorage.setItem('hireflow:v4:scan-history', JSON.stringify(payload.scanHistory));
        localStorage.setItem('hireflow.suite.v1.scan_history', JSON.stringify(payload.scanHistory));
      }
      if (payload.savedReports && Array.isArray(payload.savedReports) && payload.savedReports.length > 0) {
        localStorage.setItem('hireflow:v4:saved_reports', JSON.stringify(payload.savedReports));
      }
      if (payload.savedJds && Array.isArray(payload.savedJds) && payload.savedJds.length > 0) {
        localStorage.setItem('hireflow:v4:saved-jds', JSON.stringify(payload.savedJds));
      }
      if (payload.actionabilityGaps && Array.isArray(payload.actionabilityGaps) && payload.actionabilityGaps.length > 0) {
        localStorage.setItem('hireflow_actionability_plan_completed_gaps', JSON.stringify(payload.actionabilityGaps));
      }
      if (payload.realityFactors && Object.keys(payload.realityFactors).length > 0) {
        localStorage.setItem('hireflow_reality_factors', JSON.stringify(payload.realityFactors));
      }
      if (payload.learningPathSkills && Object.keys(payload.learningPathSkills).length > 0) {
        for (const [key, val] of Object.entries(payload.learningPathSkills)) {
          localStorage.setItem(key, String(val));
        }
      }

      // 3. Tailor Ledger
      if (payload.tailorLedger && Object.keys(payload.tailorLedger).length > 0) {
        localStorage.setItem('hireflow-tailor-ledger-v2', JSON.stringify(payload.tailorLedger));
      }

      // 4. Credentials & Opportunity Plan ("My Plan")
      if (payload.credentialsPlan && Array.isArray(payload.credentialsPlan) && payload.credentialsPlan.length > 0) {
        localStorage.setItem('hireflow.suite.v1.opportunity_plan', JSON.stringify(payload.credentialsPlan));
      }
      if (payload.credentialTruthDetails && Object.keys(payload.credentialTruthDetails).length > 0) {
        for (const [key, val] of Object.entries(payload.credentialTruthDetails)) {
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        }
      }

      // 5. Build Briefs / Proof Projects
      if (payload.briefProgress && Object.keys(payload.briefProgress).length > 0) {
        localStorage.setItem('hireflow:v4:brief-progress', JSON.stringify(payload.briefProgress));
      }
      if (payload.savedBriefs && Array.isArray(payload.savedBriefs) && payload.savedBriefs.length > 0) {
        localStorage.setItem('hireflow_saved_briefs', JSON.stringify(payload.savedBriefs));
      }

      // 6. Career Trajectory & Saved Roles
      if (payload.savedRoles && Array.isArray(payload.savedRoles) && payload.savedRoles.length > 0) {
        localStorage.setItem('hireflow:v4:saved-roles', JSON.stringify(payload.savedRoles));
      }
      if (payload.careerPathFilters && Object.keys(payload.careerPathFilters).length > 0) {
        localStorage.setItem('hireflow_career_path_filters', JSON.stringify(payload.careerPathFilters));
      }

      // 7. TalentLens
      if (payload.talentLensSession) {
        const sessionStr = JSON.stringify(payload.talentLensSession);
        localStorage.setItem('hireflow_talentlens_session_v1', sessionStr);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('hireflow_talentlens_session_v1', sessionStr);
        }
      }
      if (payload.talentLensSavedRoles && Array.isArray(payload.talentLensSavedRoles) && payload.talentLensSavedRoles.length > 0) {
        localStorage.setItem('hireflow:v4:talentlens_saved_roles', JSON.stringify(payload.talentLensSavedRoles));
      }

      // 8. Outreach Studio
      if (payload.outreachDrafts && Object.keys(payload.outreachDrafts).length > 0) {
        localStorage.setItem('hireflow:reachout:draft_v2', JSON.stringify(payload.outreachDrafts));
      }
      if (payload.outreachSelectedTemplate) {
        localStorage.setItem('hireflow:reachout:selected_template_v2', payload.outreachSelectedTemplate);
      }
      if (typeof payload.outreachPremiumMode === 'boolean') {
        localStorage.setItem('hireflow:reachout:premium_mode_v2', String(payload.outreachPremiumMode));
      }

      // 9. Feedback
      if (payload.feedback && Object.keys(payload.feedback).length > 0) {
        localStorage.setItem('hireflow:v4:feedback', JSON.stringify(payload.feedback));
      }

      // Dispatch event to inform all stores and UI components to re-read immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('hireflow:cloud-synced', { detail: payload }));
      }
    } catch (err) {
      console.error('[HireFlo AutoSync] Error restoring cloud state to local storage:', err);
    }
  }
}

export const autoSyncManager = new AutoSyncManager();
