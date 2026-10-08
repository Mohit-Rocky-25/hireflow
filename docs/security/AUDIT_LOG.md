# HIREFLOW AI — SECURITY AUDIT LOG & HANDOFF CHECKLIST

**Branch**: `security/hardening-audit`  
**Auditor**: Senior Application-Security Engineer & AI Red-Teamer  
**Date Started**: 2026-10-09  
**Status**: IN PROGRESS  

---

## Live Audit Checklist

- [x] **Phase 0 — Recon and Threat Model**
  - [x] 0.1 Branch created (`security/hardening-audit`), uncommitted snapshot saved (`62a7b3f`), live checklist initialized.
  - [x] 0.2 Real architecture inventory documented in `THREAT_MODEL.md`.
  - [x] 0.3 Baseline build and test execution recorded.
- [x] **Phase 1 — Security Tooling**
  - [x] 1.1 Create `scripts/security/` helper tools (`scan-secrets.mjs`, `audit-deps.mjs`, `scan-bundle.mjs`, `run-check.mjs`).
  - [x] 1.2 Wire npm scripts (`security:secrets`, `security:audit`, `security:bundle`, `security:redteam`, `security:check`).
  - [x] 1.3 Initialize `src/__tests__/security/` test directory and test harness.
- [ ] **Phase 2 — Secrets, Environment Variables and Hard-Coded Confidential Data**
  - [ ] 2.1 Build `scripts/security/scan-secrets.mjs` with masked reporting.
  - [ ] 2.2 Scan working tree and complete git history for committed secrets.
  - [ ] 2.3 Classify findings (Critical, High, Medium, Low, Info).
  - [ ] 2.4 Remediate working tree findings, update `.gitignore`, `.env.example`.
  - [ ] 2.5 Generate `ROTATION_CHECKLIST.md`.
  - [ ] 2.6 Install pre-commit hook guard and `.github/workflows/security.yml`.
  - [ ] 2.7 Re-scan working tree and `--dist`.
- [ ] **Phase 3 — Dependency and Supply-Chain Security**
  - [ ] 3.1 Run `npm audit` and generate `docs/security/DEPENDENCIES.md`.
  - [ ] 3.2 Remediate vulnerable dependencies or document accepted risks.
  - [ ] 3.3 Verify lockfile integrity and unpinned dependencies.
  - [ ] 3.4 Audit install scripts and unused packages.
  - [ ] 3.5 Check for typosquatting risks.
  - [ ] 3.6 Audit external scripts and fonts in `index.html`.
- [ ] **Phase 4 — Web Application Vulnerabilities**
  - [ ] 4.1 XSS, HTML sinks, unsafe links, open redirects.
  - [ ] 4.2 Untrusted file handling (PDF/DOCX/TXT size caps, zip-bomb protection).
  - [ ] 4.3 Regex Denial of Service (ReDoS) test suite and engine fixes.
  - [ ] 4.4 Prototype pollution and unsafe deserialization defense.
  - [ ] 4.5 Formula injection in CSV exports and HTML output escaping.
  - [ ] 4.6 Browser storage audit: remove plaintext password storage (`pw_${id}`).
  - [ ] 4.7 Information leakage: debug drawer gating, console PII logging.
  - [ ] 4.8 Clickjacking / framing defenses.
- [ ] **Phase 5 — Authentication, Roles and Access Control**
  - [ ] 5.1 Document auth architecture (client-side demo state vs production).
  - [ ] 5.2 Document AR-1 (Client-Side Demo Auth boundary limitation).
  - [ ] 5.3 Route guard verification and session clearing on logout.
  - [ ] 5.4 Regression tests for route protection and access control.
- [ ] **Phase 6 — AI Security: Prompt Injection, Model Abuse, Data Leakage**
  - [ ] 6.1 Attack surface definition (Dev server Gemini proxy + Deterministic Engine).
  - [ ] 6.2 Proxy key security, strict schema enforcement, and output sanitization.
  - [ ] 6.3 Build 12-category Red-Team Fixture Library in `security/redteam/`.
  - [ ] 6.4 Build automated red-team test suite `src/__tests__/security/ai-redteam.test.ts`.
  - [ ] 6.5 Verify anti-gaming integrity, invariant enforcement, and Unicode normalization.
- [ ] **Phase 7 — Privacy and Data Protection**
  - [ ] 7.1 PII inventory across memory, localStorage, and exports.
  - [ ] 7.2 Network egress audit: verify zero external telemetry during scan.
  - [ ] 7.3 In-app privacy notice conforming to DPDP Act 2023 principles.
  - [ ] 7.4 Third-party SDK / font privacy review.
- [ ] **Phase 8 — Build and Deploy Hardening**
  - [ ] 8.1 Production build configuration: sourcemaps disabled in prod.
  - [ ] 8.2 Content-Security-Policy (CSP) build plugin for production.
  - [ ] 8.3 Security headers (`public/_headers` for static hosting).
  - [ ] 8.4 Vite server configuration review (`server.host` LAN exposure check).
  - [ ] 8.5 Gate test and debug routes.
- [ ] **Phase 9 — Dynamic Verification**
  - [ ] 9.1 Build and preview server verification.
  - [ ] 9.2 Asset inspection and served bundle secret scan.
  - [ ] 9.3 Full test suite verification (existing ATS tests + new security tests).
- [ ] **Phase 10 — Fix Loop Until Clean**
  - [ ] 10.1 Verify zero Open findings at Low or above.
  - [ ] 10.2 Confirm `npm run security:check` exits 0.
- [ ] **Phase 11 — Documentation, Handoff and Final Commit**
  - [ ] 11.1 Finalize `THREAT_MODEL.md`, `FINDINGS.md`, `ROTATION_CHECKLIST.md`, `DEPENDENCIES.md`, `SECURITY.md`.
  - [ ] 11.2 Run secret scanner over `docs/` and reports to ensure zero secret leakage.
  - [ ] 11.3 Final commit on branch `security/hardening-audit`.
  - [ ] 11.4 Output user handoff summary.

---

## Phase Handoff Notes

### Phase 0 Handoff Note
- **Branch**: `security/hardening-audit` created. Initial commit `62a7b3f` saved uncommitted workspace state.
- **Threat Model**: Documented real architecture in `THREAT_MODEL.md`. Found dev server proxy in `vite.config.ts`, optional direct Gemini call in `src/lib/ats/index.ts`, and client-side Zustand store with localStorage.
- **Baseline Test State**:
  - `npm run build`: PASSED (TypeScript 0 errors, Vite 0 errors).
  - Vitest: 185 passed, 4 failed. Failures noted:
    - `extendedGoldenResumes.test.ts`: runtime jitter (301ms vs 300ms limit on Windows).
    - `generateOutreach.test.ts`: template count assertion (5 vs 15).
    - `tailor.test.ts`: `acceptedIds` undefined reference in recent workspace script.
    - All 32 core Golden Resumes passed with 100% precision & 100% recall.
- Next: Proceed to Phase 1 (Tooling).

### Phase 1 Handoff Note
- **Tooling Implemented**:
  - `scripts/security/scan-secrets.mjs`: Node ESM scanner with Shannon entropy and masked reporting.
  - `scripts/security/audit-deps.mjs`: Dependency auditor generating `docs/security/DEPENDENCIES.md`.
  - `scripts/security/scan-bundle.mjs`: Bundle analyzer detecting source maps and stray files in `dist/`.
  - `scripts/security/run-check.mjs`: Unified CI/CD security check runner.
  - `scripts/security/allowlist.json`: Documented allowlist for false positives.
  - `src/__tests__/security/smoke.test.ts`: Test harness verified.
- **NPM Scripts Wired**: `security:secrets`, `security:audit`, `security:bundle`, `security:redteam`, `security:check`.
- Next: Proceed to Phase 2 (Secrets, Env Data and Hard-Coded Confidential Data).
