# Demo Authentication Architecture (`DemoAuthProvider`)

## 1. Purpose & Honest Boundary
- Provides a temporary, zero-credential registration and session experience so users can enter **My Space** and all HireFlow tools today without configuring Google Cloud Console or Supabase.
- **Explicitly labelled as Demo Mode** across `/register`, the navbar account chip, and the My Space workspace banner.
- Collects **no passwords, OAuth tokens, or secrets**.

---

## 2. Contract & Implementation

- **Contract Module (`src/features/auth/authProviderContract.ts`):**
  - Defines `AuthProviderAdapter`, `AuthIdentity`, and `DemoSessionDescriptor`.
  - Implements `DemoAuthProvider`:
    - `registerDemo(fullName, email, options)` validates name (>= 2 chars) and email format, generates a `demo-<uuid>` ID, and stores **only** the minimal `DemoSessionDescriptor` in `sessionStorage` (`hireflow:demo:session`).
    - `getSession()` validates and restores the descriptor across browser refreshes.
    - `clearSession()` deletes `hireflow:demo:session`.
- **Store & Provider Integration (`useAuthStore.ts`, `AuthProvider.tsx`):**
  - When `isSupabaseRuntimeConfigured()` is false, `AuthProvider` calls `useAuthStore.getState().restoreDemoSession()` on boot.
  - `registerDemoSession()` clears prior in-memory stores (`resetAllUserMemoryStores()`), sets `status: 'authenticated'`, `provider: 'demo'`, `isDemo: true`, syncs `displayName` to `useProfileStore`, and optionally seeds labelled **Demo / Sample** assets via `loadDemoIntoStores()`.
  - `signOut()` calls `DemoAuthProvider.clearSession()`, resets all user memory stores, purges legacy browser keys, and clears Service Worker caches (`CLEAR_USER_CACHES`).
- **Demo Registration Page (`src/pages/auth/DemoRegisterPage.tsx` at `/register`):**
  - Renders HireFlow branding, Name + Email inputs, form validation, loading state, error alerts, option to preload sample workspace, and one-click resume for an already-active demo session.
