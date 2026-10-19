/**
 * HireFlow v4: Strict Zod Schemas for All Stores (X1.5)
 * Strict validation (no unknown keys), bounded string/array lengths, and zero tracker fields.
 */

import { z } from 'zod';
import { LIMITS } from '../config/limits';

// -------------------------------------------------------------
// 1. Profile Store Schema
// -------------------------------------------------------------
export const ResumeVersionSchema = z.object({
  id: z.string().max(64),
  label: z.string().min(1).max(100),
  ledger: z.record(z.string(), z.unknown()), // FactLedger payload
  textHash: z.string().max(80),
  createdAt: z.string().datetime({ offset: true }).or(z.string().max(40)),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().max(40)),
}).strict();

export const ActiveResumeSchema = z.object({
  versionId: z.string().max(64),
  label: z.string().min(1).max(100),
  ledger: z.record(z.string(), z.unknown()),
  textHash: z.string().max(80),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().max(40)),
}).strict();

export const ProfilePreferencesSchema = z.object({
  targetFamily: z.string().max(50).optional(),
  branch: z.string().max(50).optional(),
}).strict();

export const LastTargetSchema = z.object({
  jdId: z.string().max(64).optional(),
  presetId: z.string().max(64).optional(),
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
}).strict();

export const ProfileStoreSchema = z.object({
  activeResume: ActiveResumeSchema.nullable(),
  resumeVersions: z.array(ResumeVersionSchema).max(LIMITS.maxResumeVersions),
  lastTarget: LastTargetSchema.nullable(),
  preferences: ProfilePreferencesSchema,
}).strict();

export type ProfileStoreData = z.infer<typeof ProfileStoreSchema>;

// -------------------------------------------------------------
// 2. Scan History Schema
// -------------------------------------------------------------
export const ScanRecordSchema = z.object({
  id: z.string().max(64),
  createdAt: z.string().max(40),
  tool: z.enum(['roaster', 'jd-compare', 'talentlens', 'tailor-validate']),
  resumeVersionId: z.string().max(64),
  resumeLabel: z.string().max(100),
  resumeTextHash: z.string().max(80),
  targetKind: z.enum(['jd', 'preset', 'role']),
  targetLabel: z.string().max(120),
  targetHash: z.string().max(80),
  scores: z.record(z.string().max(50), z.number()),
  pillars: z.record(z.string().max(50), z.number()),
  gaps: z.array(z.string().max(80)).max(50),
  findingCounts: z.record(z.string().max(50), z.number()),
  engineVersion: z.string().max(20),
  configFingerprint: z.string().max(40),
}).strict();

export const ScanHistoryStoreSchema = z.object({
  scans: z.array(ScanRecordSchema).max(LIMITS.maxScanHistory),
}).strict();

export type ScanRecord = z.infer<typeof ScanRecordSchema>;
export type ScanHistoryStoreData = z.infer<typeof ScanHistoryStoreSchema>;

// -------------------------------------------------------------
// 3. Saved JDs Schema (Library only, zero tracker fields)
// -------------------------------------------------------------
export const SavedJDSchema = z.object({
  id: z.string().max(64),
  title: z.string().min(1).max(150),
  company: z.string().max(100).nullable(),
  source: z.enum(['pasted', 'talentlens', 'upload']),
  text: z.string().min(1).max(50000),
  textHash: z.string().max(80),
  tags: z.array(z.string().max(40)).max(20),
  addedAt: z.string().max(40),
  updatedAt: z.string().max(40),
}).strict();

export const SavedJDStoreSchema = z.object({
  jds: z.array(SavedJDSchema).max(LIMITS.maxSavedJDs),
}).strict();

export type SavedJD = z.infer<typeof SavedJDSchema>;
export type SavedJDStoreData = z.infer<typeof SavedJDStoreSchema>;

// -------------------------------------------------------------
// 4. Saved Roles Schema (TalentLens saved roles)
// -------------------------------------------------------------
export const SavedRoleSchema = z.object({
  id: z.string().max(64),
  companyId: z.string().max(64),
  companyName: z.string().max(100),
  roleTitle: z.string().max(120),
  tier: z.string().max(40).optional(),
  ctcRange: z.string().max(80).optional(),
  requiredSkills: z.array(z.string().max(60)).max(40),
  savedAt: z.string().max(40),
}).strict();

export const SavedRoleStoreSchema = z.object({
  roles: z.array(SavedRoleSchema).max(LIMITS.maxSavedRoles),
}).strict();

export type SavedRole = z.infer<typeof SavedRoleSchema>;
export type SavedRoleStoreData = z.infer<typeof SavedRoleStoreSchema>;

// -------------------------------------------------------------
// 5. Feedback Schema (Local thumbs up/down and notes)
// -------------------------------------------------------------
export const FeedbackItemSchema = z.object({
  id: z.string().max(64),
  targetKind: z.string().max(40),
  ruleId: z.string().max(80),
  verdict: z.enum(['up', 'down']),
  note: z.string().max(LIMITS.maxFindingNoteChars).optional(),
  scanId: z.string().max(64).optional(),
  engineVersion: z.string().max(20),
  createdAt: z.string().max(40),
}).strict();

export const FeedbackStoreSchema = z.object({
  items: z.array(FeedbackItemSchema).max(LIMITS.maxFeedbackItems),
}).strict();

export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type FeedbackStoreData = z.infer<typeof FeedbackStoreSchema>;

// -------------------------------------------------------------
// 6. Settings Schema
// -------------------------------------------------------------
export const SettingsStoreSchema = z.object({
  theme: z.literal('dark'),
  persistentStorageGranted: z.boolean(),
  lastBackupExportAt: z.string().max(40).nullable(),
  backupReminderDismissedUntil: z.string().max(40).nullable(),
  highContrast: z.boolean(),
}).strict();

export type SettingsStoreData = z.infer<typeof SettingsStoreSchema>;

// -------------------------------------------------------------
// 7. Brief Progress Schema
// -------------------------------------------------------------
export const BriefProgressItemSchema = z.object({
  status: z.enum(['planned', 'building', 'done']),
  notes: z.string().max(1000).optional(),
  repoUrl: z.string().max(300).nullable().optional(),
  updatedAt: z.string().max(40),
}).strict();

export const BriefProgressStoreSchema = z.object({
  progress: z.record(z.string().max(64), BriefProgressItemSchema),
}).strict();

export type BriefProgressStoreData = z.infer<typeof BriefProgressStoreSchema>;

// -------------------------------------------------------------
// 8. Credential Tracker Schema
// -------------------------------------------------------------
export const UserCredentialStateSchema = z.object({
  state: z.enum(['Planned', 'In progress', 'Earned']),
  dateEarned: z.string().max(40).optional(),
  credentialIdStr: z.string().max(80).optional(),
  expiryDate: z.string().max(40).optional(),
  verificationUrl: z.string().max(300).nullable().optional(),
  updatedAt: z.string().max(40),
}).strict();

export const CredentialTrackerStoreSchema = z.object({
  tracker: z.record(z.string().max(64), UserCredentialStateSchema),
}).strict();

export type CredentialTrackerStoreData = z.infer<typeof CredentialTrackerStoreSchema>;

// -------------------------------------------------------------
// 9. Scenarios Schema (Career Trajectory What-if)
// -------------------------------------------------------------
export const SavedScenarioSchema = z.object({
  id: z.string().max(64),
  label: z.string().min(1).max(100),
  cgpa: z.number().min(0).max(10),
  branch: z.string().max(60),
  collegeTier: z.string().max(40),
  internshipDone: z.boolean(),
  createdAt: z.string().max(40),
}).strict();

export const ScenarioStoreSchema = z.object({
  scenarios: z.array(SavedScenarioSchema).max(LIMITS.maxSavedScenarios),
}).strict();

export type SavedScenario = z.infer<typeof SavedScenarioSchema>;
export type ScenarioStoreData = z.infer<typeof ScenarioStoreSchema>;
