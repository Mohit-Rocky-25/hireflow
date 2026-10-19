/**
 * HireFlow v4: Application-wide Limits and Storage Budgets
 * All caps are enforced with user-facing messages.
 * Items are never silently dropped when caps are reached.
 */

export const LIMITS = {
  /** Maximum number of scan history records retained before requiring user cleanup or export */
  maxScanHistory: 60,

  /** Maximum number of saved job descriptions in candidate's local library */
  maxSavedJDs: 40,

  /** Maximum number of saved target roles across companies in TalentLens */
  maxSavedRoles: 50,

  /** Maximum number of local feedback items (thumbs up/down and notes) */
  maxFeedbackItems: 500,

  /** Maximum number of distinct resume versions maintained in candidate profile */
  maxResumeVersions: 5,

  /** Maximum size in megabytes permitted for JSON backup file imports */
  maxBackupFileMB: 10,

  /** Maximum size in megabytes permitted for resume and JD document uploads */
  maxFileUploadMB: 5,

  /** Maximum page count permitted when parsing uploaded PDF resumes */
  maxPdfPages: 6,

  /** Maximum character length allowed for user feedback notes */
  maxFindingNoteChars: 500,

  /** Maximum number of saved What-If career trajectory scenarios */
  maxSavedScenarios: 3,

  /** Number of days before prompting user to create a local backup */
  backupReminderDays: 14,

  /** Number of days to suppress backup reminder banner after dismissal */
  backupDismissalDays: 7,

  /** Days threshold before marking an entered credential expiry date as expiring soon */
  credentialExpiringSoonDays: 60,
} as const;

export type Limits = typeof LIMITS;
