// ============================================================
// HireFlow — Authoritative Profile & Identity Ownership Contract
// Reconciles useAuthStore + useProfileStore (authoritative) with
// legacy Suite ProfileContext without deleting existing consumers.
// ============================================================

import { useAuthStore } from '@/features/auth/useAuthStore';
import { useProfileStore } from './useProfileStore';
import type { CandidateProfile } from '@/domain/types';

export interface AuthoritativeProfileIdentity {
  userId: string | null;
  displayName: string;
  email: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  provider: string | null;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  targetTier?: string;
  targetRoles: string[];
  activeWorkspaceId: string | null;
}

export function getAuthoritativeProfileIdentity(): AuthoritativeProfileIdentity {
  const auth = useAuthStore.getState();
  const profile: CandidateProfile = useProfileStore.getState().profile;

  const resolvedName =
    (auth.displayName && auth.displayName.trim()) ||
    (profile.displayName && profile.displayName.trim()) ||
    'Candidate';

  return {
    userId: auth.userId,
    displayName: resolvedName,
    email: auth.email,
    isAuthenticated: auth.status === 'authenticated',
    isDemo: auth.isDemo,
    provider: auth.provider,
    degree: profile.degree,
    branch: profile.branch,
    graduationYear: profile.graduationYear,
    targetTier: profile.targetTier,
    targetRoles: profile.targetRoles || [],
    activeWorkspaceId: profile.activeWorkspaceId,
  };
}

/**
 * Syncs displayName from auth or Suite profile into the canonical useProfileStore
 * without creating duplicate competing identity stores.
 */
export function syncProfileIdentity(patch: Partial<CandidateProfile>): AuthoritativeProfileIdentity {
  useProfileStore.getState().updateProfile(patch);
  return getAuthoritativeProfileIdentity();
}
