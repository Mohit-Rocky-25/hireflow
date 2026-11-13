import { kvGet, kvSet, kvKeys } from '@/lib/storage/kv';
import { getStorageKey } from '@/lib/storage/namespace';

export interface MigrationSummary {
  resumesMigrated: number;
  auditsMigrated: number;
}

export async function hasGuestData(): Promise<boolean> {
  const guestKeys = await kvKeys('hireflow:v5:guest:');
  return guestKeys.length > 0;
}

export async function migrateGuestToUser(userId: string): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    resumesMigrated: 0,
    auditsMigrated: 0,
  };

  const guestResumesKey = getStorageKey('resumes', null);
  const userResumesKey = getStorageKey('resumes', userId);
  const guestResumes = await kvGet<unknown>(guestResumesKey);
  if (guestResumes) {
    await kvSet(userResumesKey, guestResumes);
    summary.resumesMigrated++;
  }

  const guestAuditKey = getStorageKey('audit', null);
  const userAuditKey = getStorageKey('audit', userId);
  const guestAudit = await kvGet<unknown>(guestAuditKey);
  if (guestAudit) {
    await kvSet(userAuditKey, guestAudit);
    summary.auditsMigrated++;
  }

  const guestPortalKey = getStorageKey('portal', null);
  const userPortalKey = getStorageKey('portal', userId);
  const guestPortal = await kvGet<unknown>(guestPortalKey);
  if (guestPortal) {
    await kvSet(userPortalKey, guestPortal);
  }

  const guestProfileKey = getStorageKey('profile', null);
  const userProfileKey = getStorageKey('profile', userId);
  const guestProfile = await kvGet<unknown>(guestProfileKey);
  if (guestProfile) {
    await kvSet(userProfileKey, guestProfile);
  }

  return summary;
}
