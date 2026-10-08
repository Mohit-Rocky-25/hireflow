# HIREFLOW AI — SECURITY FINDINGS REGISTER

**Format**: `ID | Severity (Critical/High/Medium/Low/Info) | Category | Location (file:line) | Evidence (MASKED) | Impact | Fix applied | Test that proves it | Status (Open/Fixed/Accepted-risk with justification)`

---

## Findings Summary Table

| ID | Severity | Category | Location | Summary | Status |
|---|---|---|---|---|---|
| ID | Severity | Category | Location | Summary | Status |
|---|---|---|---|---|---|
| SEC-001 | Medium | Storage / Credentials | `src/store/useStore.ts:120, 138, 411` | Plaintext passwords stored in browser localStorage under `pw_${userId}` | Fixed |
| SEC-002 | Medium | Client Secrets Risk | `src/ai/AIProvider.ts:6-8` | Comments instructing `VITE_GEMINI_API_KEY` / `VITE_OPENAI_API_KEY` which leak to browser bundle | Fixed |
| SEC-003 | Low | Client Direct LLM Egress | `src/lib/ats/index.ts:237` | Direct browser fetch to Gemini API with user-provided key without rate-limiting or proxy | Open |
| SEC-004 | Low | Reverse Tabnabbing | Multiple pages | External `target="_blank"` links lacking `rel="noopener noreferrer"` or unvalidated URLs | Fixed |
| SEC-005 | Medium | File Handling | `fileParser.ts` | Missing file size bounds, magic byte inspection, and zip bomb/traversal guards | Fixed |
| SEC-006 | Medium | Regular Expression DoS | `pipeline.ts`, `limits.ts` | Unbounded resume/JD input length leading to polynomial regex parsing delays | Fixed |
| SEC-007 | Medium | Decompression Bomb | `cardCodec.ts` | Evidence Card codec missing decompression budget cap | Fixed |
| SEC-008 | Low | CSV Injection | `AdminAuditLog.tsx`, `CompareJDsPage.tsx` | Unescaped formula trigger characters in CSV exports | Fixed |
| AR-1 | Accepted-Risk | Authentication | `src/components/auth/ProtectedRoute.tsx` | Client-Side Demo Auth: In-browser role checks are not a cryptographic security boundary | Accepted-Risk |
| AR-2 | Accepted-Risk | Dependency | `package-lock.json` | `sprintf-js` moderate via `mammoth -> argparse` (GHSA-hp3w-g68c-fv3c); browser buffer parsing does not execute CLI formatter | Accepted-Risk |

---

## Detailed Findings

### SEC-001: Plaintext Password Storage in LocalStorage
- **Severity**: Medium
- **Category**: Storage Security / Credential Handling
- **Location**: `src/store/useStore.ts:120, 138, 411`
- **Evidence (MASKED)**: `localStorage.setItem('pw_' + user.id, password)` and `localStorage.setItem('pw_' + u.id, 'demo****')`
- **Impact**: Any script running in the browser origin or malicious extension can read credentials from localStorage.
- **Fix Applied**: Removed plaintext password persistence in localStorage; implemented salted SHA-256 hash validation in scoped session/localStorage; purged all legacy `pw_*` keys on startup; added `clearAllUserData()` action.
- **Test That Proves It**: `src/__tests__/security/storage-auth.test.ts`
- **Status**: Fixed

### SEC-002: Comments Recommending `VITE_` Prefixed API Keys
- **Severity**: Medium
- **Category**: Secret Management
- **Location**: `src/ai/AIProvider.ts:6-8`
- **Evidence (MASKED)**: `VITE_GEMINI_API_KEY=...` / `VITE_OPENAI_API_KEY=...`
- **Impact**: Developers copying these variable names will place private API keys into `VITE_` variables, causing Vite to bundle them into public client-side JavaScript.
- **Fix Applied**: Removed `VITE_` key examples; documented server-only env variables (`GEMINI_API_KEY`) and clarified that client bundle never receives backend keys.
- **Test That Proves It**: `scripts/security/scan-secrets.mjs`
- **Status**: Fixed

### SEC-003: Direct Browser Network Egress with Custom API Key
- **Severity**: Low
- **Category**: Egress & Key Protection
- **Location**: `src/lib/ats/index.ts:237`
- **Evidence (MASKED)**: `fetch('https://generativelanguage.googleapis.com/v1beta/models/...:generateContent?key=' + options.geminiApiKey)`
- **Impact**: Direct browser calls expose the key in browser DevTools Network tab and bypass CORS and rate limiting controls.
- **Fix Applied**: Route all AI analysis through `/api/ats/analyze` proxy or deterministic local fallback.
- **Test That Proves It**: `src/__tests__/security/egress.test.ts`
- **Status**: Open

### AR-1: Client-Side Demo Auth Is Not a Security Boundary
- **Severity**: Accepted-Risk (Info)
- **Category**: Architecture / Access Control
- **Location**: `src/components/auth/ProtectedRoute.tsx`, `src/store/useStore.ts`
- **Evidence (MASKED)**: Client-side routing with role checking based on Zustand client state.
- **Justification**: HireFlow is currently a client-side prototype SPA without a dedicated multi-tenant backend server. All mock data (candidates, companies, jobs) lives in the client browser. No private enterprise data exists behind client guards. A visible "Demo Mode" banner clarifies this architecture. Real multi-tenant security requires a backend API gateway with JWT/session cookies.
- **Status**: Accepted-Risk

### AR-2: Transitive CLI Dependency in Mammoth (sprintf-js)
- **Severity**: Accepted-Risk (Moderate)
- **Category**: Supply Chain / Dependencies
- **Location**: `node_modules/mammoth/node_modules/argparse/node_modules/sprintf-js`
- **Evidence (MASKED)**: Advisory GHSA-hp3w-g68c-fv3c (Moderate denial of service via unbounded precision specifiers).
- **Justification**: Mammoth is used strictly in-browser via `mammoth.extractRawText({ arrayBuffer })` to parse candidate `.docx` files. The CLI wrapper (`argparse` and `sprintf-js`) is never invoked during runtime file processing. Downgrading via `npm audit fix --force` would install a legacy mammoth version (v0.3.29 from 10+ years ago) breaking modern docx parsing.
- **Status**: Accepted-Risk
