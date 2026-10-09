# HIREFLOW AI — AUTHENTICATION & ACCESS CONTROL MODEL
### Candidate-First Architecture & Local Identity Boundary

## 1. Overview & Architecture

HireFlow AI operates as a client-side Single Page Application (SPA) powered by Vite, React 19, and Zustand state management with local persistence.

The platform architecture has evolved from legacy multi-tenant enterprise models to a **candidate-first career intelligence platform**. The core user persona is the **Candidate / Job Seeker**, who has full access to their private local career vault, resume analyzer, offer decoder, and application tracking pipeline.

Authentication serves two primary functions:
1. **Candidate Profile Ownership**: Protecting candidate profiles, tailored resume versions, tracked applications, and private compensation analyses within local browser storage.
2. **Local Workstation Evaluation**: Zero external network telemetry required for full application utility.

---

## 2. Authentication Mechanics (Hardened)

### 2.1 Credential Handling (SEC-001 Remediation)
- **Zero Plaintext Storage**: Plaintext passwords are NEVER stored in browser `localStorage` or `sessionStorage`.
- **Salted Hashing**: Candidate registration and password verification uses synchronous NIST FIPS 180-4 standard SHA-256 with unique salting:
  `salt$sha256(salt:password)`
- **Session Purge**: Logging out immediately invokes `sessionStorage.clear()`, clearing all active session authentication tokens, and nullifies Zustand authentication state.
- **Legacy Credential Cleanup**: On application initialization, any legacy `pw_*` keys detected in `localStorage` are automatically purged.
- **Complete Data Reset**: The store provides `clearAllUserData()`, granting candidates one-click deletion of all stored profile, interview, and credential data from browser storage (aligned with privacy compliance and DPDP Act 2023).

---

## 3. Access Control & Route Guarding

Access control is enforced by [ProtectedRoute.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/components/auth/ProtectedRoute.tsx):

| Access Level | Primary Route Prefixes | Behavior |
|---|---|---|
| **Authenticated Candidate** | `/candidate/*`, `/tools/*`, `/jobs/*` | Full access to career tools, resume scoring, offer decoder, and pipeline tracker |
| **Unauthenticated Visitor** | `/`, `/login`, `/register`, `/tools/*` | Public marketing landing page, tools preview, and login/register prompts |
| **Unauthorized Attempt** | Protected paths without session | Redirects cleanly to `/login` (with preserved return destination) |

---

## 4. Security Justification: AR-1 (Local Client-Side Boundary)

> [!NOTE]
> **Candidate-First Privacy Model**
>
> In HireFlow's zero-cloud-egress architecture, all candidate resume data, salary comparisons, and job analyses remain on the user's local machine. 
> 
> Because HireFlow intentionally avoids transmitting candidate resumes to remote servers or third-party LLMs:
> - The client-side authentication boundary provides local data ownership and workflow separation.
> - Data isolation is achieved natively through the browser's Same-Origin Policy (SOP).
>
> **Future Cloud Sync Path (Optional)**:
> - If candidates choose to synchronize their data across devices via an optional cloud provider (e.g., Supabase Free Tier):
>   1. The client will authenticate via Supabase Auth (JWT).
>   2. PostgreSQL Row-Level Security (RLS) will enforce that candidates can only read and write their own records (`auth.uid() = candidate_id`).
