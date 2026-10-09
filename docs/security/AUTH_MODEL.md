# HIREFLOW AI — AUTHENTICATION & ACCESS CONTROL MODEL

## 1. Overview & Architecture

HireFlow AI operates as a client-side Single Page Application (SPA) powered by Vite, React 19, and Zustand state management with local persistence.

Authentication in the current release serves two primary workflows:
1. **Interactive Demo / Candidate Sandbox**: Immediate role switching between Candidate, HR Recruiter, Interviewer, and Platform Admin personas without mandatory external OAuth setup.
2. **Local Workstation Evaluation**: Zero external network telemetry required for full application utility.

---

## 2. Authentication Mechanics (Hardened)

### 2.1 Credential Handling (SEC-001 Remediation)
- **Zero Plaintext Storage**: Plaintext passwords are NEVER stored in browser `localStorage` or `sessionStorage`.
- **Salted Hashing**: Registration and demo password verification uses synchronous NIST FIPS 180-4 standard SHA-256 with unique salting:
  `salt$sha256(salt:password)`
- **Session Purge**: Logging out immediately invokes `sessionStorage.clear()`, clearing all active session authentication tokens, and nullifies Zustand authentication state.
- **Legacy Credential Cleanup**: On application initialization, any legacy `pw_*` keys detected in `localStorage` are automatically deleted.
- **Complete Data Reset**: The store provides `clearAllUserData()`, granting candidates and users one-click deletion of all stored profile, interview, and credential data from browser storage.

---

## 3. Role-Based Access Control (RBAC) Matrix

HireFlow defines 5 distinct user roles with strict routing isolation managed by [ProtectedRoute.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/components/auth/ProtectedRoute.tsx):

| Role | Authorized Route Prefixes | Unauthorized Attempt Redirect |
|---|---|---|
| `PLATFORM_ADMIN` | `/admin/*`, `/tools/*` | `/admin/dashboard` |
| `BHR_MANAGER` | `/company/*`, `/tools/*` | `/company/dashboard` |
| `HR_RECRUITER` | `/company/*`, `/tools/*` | `/company/dashboard` |
| `INTERVIEWER` | `/interviewer/*`, `/tools/*` | `/interviewer/dashboard` |
| `CANDIDATE` | `/candidate/*`, `/tools/*` | `/candidate/dashboard` |
| *Unauthenticated* | `/`, `/login`, `/register`, `/jobs/*`, `/tools/*` | `/login` (with preserved return destination) |

---

## 4. Accepted-Risk Justification: AR-1 (Client-Side Demo Auth Boundary)

> [!WARNING]
> **Accepted-Risk AR-1: Client-Side Auth Is Not a Cryptographic Server Boundary**
>
> In any pure client-side SPA lacking an active multi-tenant backend server, state stored in browser memory or `localStorage` can be inspected and modified via browser Developer Tools.
>
> **Threat Model Context**:
> - HireFlow's data (demo companies, mock jobs, candidate profiles) is bundled client-side or synthesized in local browser state.
> - No remote backend database with cross-tenant enterprise data is currently connected.
> - Therefore, client-side route guards provide structural user interface segregation and workflow guidance rather than cryptographic multi-tenant isolation.
>
> **Production Migration Path**:
> - When integrating a production backend API (e.g., Node/Go/Python backend):
>   1. Route guards must validate an HTTP-only, `SameSite=Strict`, `Secure` JWT session cookie.
>   2. Backend endpoints must enforce server-side ACL authorization middleware on every request (`req.user.role in [ALLOWED_ROLES]`).
>   3. Data access must be filtered by server-side `companyId` and `userId` tenant scoping, never trusting client parameters.
