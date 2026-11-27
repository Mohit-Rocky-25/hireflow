# My Space — Complete Architecture Audit

## 1. Entry Point & Shell Architecture (Current Baseline)

- **Global Entry Component:** `MySpaceSheet` (`src/features/my-space/MySpaceSheet.tsx`), mounted globally inside `src/App.tsx`.
- **Activation Mechanism:** URL search parameter `?my=<section>` (`overview` | `scans` | `targets` | `plan` | `outreach` | `resumes` | `profile`) plus optional `&audit=<auditId>`.
- **Legacy Route Redirects (`src/features/my-space/portalRedirectMap.tsx`):**
  - `/portal` → `/?my=overview`
  - `/portal/resumes` → `/?my=resumes`
  - `/portal/audits/:auditId` → `/?my=scans&audit=:id`
  - `/portal/*` → `/?my=overview`
- **Navbar Trigger (`src/components/common/PublicNavbar.tsx`):**
  - Renders `My Space` pill button only when `useAuthStore().status === 'authenticated'`.
  - Account menu chip also exposes `Active Resume Track` selector (`useResumeStore`), sync status readout (`useCloudSyncStore`), `Delete my cloud data`, and `Sign out`.
- **Rendering Mode:** Modal dialog overlay (`role="dialog"`, `aria-modal="true"`, `z-50`) over whichever public/tool page is currently active, with a `232px` left rail (`76px` collapsed when `InspectorView` is open).

---

## 2. Discovered Stores & Data Owners

| Store / Module | Path | Owns | Current Persistence |
|---|---|---|---|
| `useMySpaceStore` | `src/features/my-space/useMySpaceStore.ts` | `watchlist`, `planItems`, `outreachDrafts` | In-memory Zustand + `cloudRepository` when `authenticated` |
| `useAuditStore` | `src/features/journal/useAuditStore.ts` | `entries` (`AuditEntry`), `events` (`JournalEvent`), `gapStatus` (`GapOverlay`) | In-memory Zustand + `cloudRepository` when `authenticated` |
| `useResumeStore` | `src/features/resumes/useResumeStore.ts` | `workspaces`, `versions`, `activeWorkspaceId` | In-memory Zustand + `cloudRepository` when `authenticated` |
| `useProfileStore` | `src/features/profile/useProfileStore.ts` | `profile` (`displayName`, `degree`, `branch`, `graduationYear`, `targetTier`, `targetRoles`) | In-memory Zustand + `cloudRepository` when `authenticated` |
| `useSavedJdStore` | `src/store/savedJdStore.ts` | `jds` (`SavedJD[]`) | In-memory Zustand + `cloudRepository` (used by `/jd-library` and `/data`, **not** surfaced in `MySpaceSheet`) |
| `useScanHistoryStore` | `src/store/scanHistoryStore.ts` | `scans` (`ScanRecord[]`) | In-memory Zustand projected from audits (used by `/history`, **not** surfaced in `MySpaceSheet`) |
| `useCloudDocumentsStore` | `src/lib/cloud/useDocumentsStore.ts` | `documents` (uploaded files metadata) | In-memory Zustand + `storageService` (used on `/data`, **not** surfaced in `MySpaceSheet`) |
| `useTailorStore` | `src/lib/tailor/store/tailorStore.ts` | `activeProject` (tailored resume draft, fact ledger, truth/layout reports) | In-memory Zustand seeded from static `PRESET_FIXTURES[0]` (**disconnected** from My Space) |
| `ProfileContext` (`ProfileDrawer`) | `src/features/suite/profile/ProfileContext.tsx` | Legacy Suite `CandidateProfile` JSON (`masterResumeText`, skills, education) | In-memory + `ProfileDrawer` overlay in `App.tsx` (parallel to `useProfileStore`) |

---

## 3. Structural Architectural Findings

1. **Modal Sheet Instead of Primary Workspace:** My Space is currently an overlay dialog (`?my=...`) rather than a dedicated authenticated workspace shell, making deep-linking, breadcrumbs, and multi-tool workflows fragmented.
2. **Parallel Unlinked Asset Pages:** `/history` (`useScanHistoryStore`), `/jd-library` (`useSavedJdStore`), and `/data` (`useCloudDocumentsStore`) manage core candidate assets outside My Space.
3. **Disconnected Downstream Tools:**
   - `OutreachSection` reads `outreachDrafts`, but `ReachOutPage` (`/tools/reach-out`) never calls `saveOutreachDraft`.
   - `useTailorStore` (`/tools/tailor`) boots from `PRESET_FIXTURES[0]` and never reads `useResumeStore` or writes back tailored `ResumeVersion` records.
   - `TalentLens` (`/demo`) has no direct handoff into Tailor or Watchlist.
