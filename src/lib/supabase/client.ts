/**
 * HireFlo: Supabase Cloud Client & Auto-Sync Adapter (v4 legacy compatibility)
 * All v5 operations use src/features/auth/supabaseClient.ts and src/sync/
 * C2: Zero network calls at startup for guests.
 */

export const isSupabaseConfigured = false;
export let supabase: any = null;

export interface CloudUserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CloudPayload {
  profile: any;
  preferences?: any;
  fresherIntake?: any;
  atsEvaluation: any;
  scanHistory: any[];
  savedReports?: any[];
  savedJds: any[];
  actionabilityGaps?: any[];
  realityFactors?: any;
  learningPathSkills?: Record<string, boolean>;
  tailorLedger: any;
  credentialsPlan?: any[];
  credentialTruthDetails?: Record<string, any>;
  briefProgress?: any;
  savedBriefs?: any[];
  savedRoles?: any[];
  careerPathFilters?: any;
  talentLensSession?: any;
  talentLensSavedRoles?: any[];
  outreachDrafts?: any;
  outreachSelectedTemplate?: string;
  outreachPremiumMode?: boolean;
  feedback?: any;
  dreamJobs?: any[];
  offerEvaluations?: any[];
  bookmarkedPrograms?: any[];
  updatedAt: string;
}

export const cloudAuth = {
  isConfigured(): boolean {
    return false;
  },

  async signUp(email: string, _password: string, fullName: string) {
    return simulateLocalAuth(email, fullName);
  },

  async signIn(email: string, _password: string) {
    return simulateLocalAuth(email, email.split('@')[0]);
  },

  async signInWithGoogle() {
    return simulateLocalAuth('candidate.google@example.com', 'Alex Rivera (Google)');
  },

  async signOut() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('hireflo_simulated_user');
    }
  },

  async getSession() {
    if (typeof localStorage === 'undefined') return null;
    const sim = localStorage.getItem('hireflo_simulated_user');
    return sim ? JSON.parse(sim) : null;
  },
};

function simulateLocalAuth(email: string, fullName: string) {
  const simulatedUser = {
    id: 'user_' + Math.abs(email.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)).toString(36),
    email,
    user_metadata: { full_name: fullName },
    created_at: new Date().toISOString(),
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hireflo_simulated_user', JSON.stringify({ user: simulatedUser }));
  }
  return { user: simulatedUser, session: { user: simulatedUser } };
}

export async function uploadLocalToCloud(_userId: string, _payload: CloudPayload): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function downloadCloudToLocal(_userId: string): Promise<{ success: boolean; data?: CloudPayload; error?: string }> {
  return { success: false, error: 'Legacy sync disabled in Candidate OS v5' };
}

export function initSupabaseAuthListener(
  _onSignIn?: (user: { id: string; email: string; displayName: string; avatarUrl?: string }) => void,
  _onSignOut?: () => void
): () => void {
  return () => {};
}
