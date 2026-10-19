# HireFlow v4: Data Model, Schemas & Storage Architecture

Technical specification of client-side storage structures, Zod schemas, versioning, backup registration, and capacity limits.

---

## 1. Storage Architecture (`src/lib/storage/index.ts`)
HireFlow persists user state purely inside client-side `localStorage` using a fault-tolerant adapter:
- **Prefix**: `hireflow:v4:<store_name>`
- **Corrupt Quarantine**: In case of corrupted or tampered JSON, values are automatically isolated under `hireflow:v4:<store_name>_corrupt` and replaced with schema defaults.
- **Quota Exceeded Grace**: Catches `QuotaExceededError` cleanly, alerts candidate via non-blocking toast, and prevents application crashes.
- **LAN / Disabled Fallback**: In environments where `localStorage` is blocked or unavailable, the adapter seamlessly falls back to an in-memory map.

---

## 2. Store Inventory & Backup Sections

| Store Name | Storage Key | Schema | Cap Limit | Backup Registered |
|------------|-------------|--------|-----------|-------------------|
| **Profile** | `profile` | `ProfileStoreSchema` | 5 versions | ✅ Yes (v1) |
| **Scan History** | `scan_history` | `ScanHistoryStoreSchema` | 60 scans | ✅ Yes (v1) |
| **Saved JDs** | `saved_jds` | `SavedJdStoreSchema` | 40 JDs | ✅ Yes (v1) |
| **Saved Roles** | `saved_roles` | `SavedRoleStoreSchema` | 50 roles | ✅ Yes (v1) |
| **Feedback** | `feedback` | `FeedbackStoreSchema` | 500 items | ✅ Yes (v1) |
| **Brief Progress** | `brief_progress` | `BriefProgressStoreSchema` | 30 briefs | ✅ Yes (v1) |

---

## 3. Application-Wide Limits (`src/config/limits.ts`)

```typescript
export const LIMITS = {
  maxScanHistory: 60,
  maxSavedJDs: 40,
  maxSavedRoles: 50,
  maxFeedbackItems: 500,
  maxResumeVersions: 5,
  maxBackupFileMB: 10,
  maxFileUploadMB: 5,
  maxPdfPages: 6,
  maxFindingNoteChars: 500,
} as const;
```

---

## 4. Version Stamps & Config Fingerprints (`src/config/versions.ts`)
- **`ENGINE_VERSION`**: `4.0.0`
- **`computeConfigFingerprint()`**: Deterministic FNV-1a 64-bit hash of scoring weights and thresholds.
- Every scan record stored in history captures both `engineVersion` and `configFingerprint`. When comparing historical scans, if the fingerprint diverges, HireFlow displays a transparent notification:
  > *"Scoring rules changed between these scans: compare with care."*

---

## 5. Tamper-Evident Backup Format (`src/lib/backup/index.ts`)
```json
{
  "app": "hireflow",
  "backupVersion": 1,
  "exportedAt": "2026-10-19T07:50:00.000Z",
  "engineVersion": "4.0.0",
  "sections": {
    "profile": { "version": 1, "data": { ... } },
    "scan_history": { "version": 1, "data": { ... } },
    "saved_jds": { "version": 1, "data": { ... } },
    "saved_roles": { "version": 1, "data": { ... } },
    "feedback": { "version": 1, "data": { ... } },
    "brief_progress": { "version": 1, "data": { ... } }
  },
  "checksum": "fnv1a:9a3f2b1c4e7d8a6b"
}
```
- **Checksum Verification**: Canonical JSON hash computed with algorithm prefix.
- **Import Security**: Rejects corrupted files, forward major versions, and payload keys containing prototype pollution attempts (`__proto__`, `constructor`).
