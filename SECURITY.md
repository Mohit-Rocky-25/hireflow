# HireFlow AI — Security Policy & Controls Register

## 1. Supported Versions

Security updates and vulnerability remediation are actively maintained for the current release branch.

| Version / Branch | Supported | Security Audit Status |
|---|---|---|
| `security/hardening-audit` | :white_check_mark: Active | **Fully Audited & Hardened (Phases 0–11)** |
| `main` | :white_check_mark: Supported | Scheduled for merge from hardening branch |

---

## 2. Reporting a Vulnerability

We practice responsible, coordinated vulnerability disclosure. If you discover a security vulnerability in HireFlow AI, please follow these guidelines:

1. **Do not create public GitHub issues or discussions** detailing unpatched vulnerabilities.
2. Email the maintainers with a detailed description of the vulnerability, reproduction steps, and proof of concept.
3. We will acknowledge receipt within 48 hours and work on remediation prior to public disclosure.

---

## 3. Security Architecture & Controls

HireFlow AI enforces multi-layered application security controls:

### 3.1 Credential & Secret Management
- **Zero Plaintext Storage**: Plaintext passwords are NEVER stored in browser `localStorage` or `sessionStorage`. Registration and demo authentication use salted NIST FIPS 180-4 standard SHA-256 hashes (`src/utils/security.ts`).
- **Pre-Commit Secret Scanning**: Local git hook (`.githooks/pre-commit`) and CI scanner (`scripts/security/scan-secrets.mjs`) automatically scan for API keys, private keys, JWTs, and database URLs on every commit.
- **Client Bundle Protection**: Only explicit public variables are bundled; private keys (`GEMINI_API_KEY`) are restricted to the local backend proxy.

### 3.2 Web Application Security (OWASP Top 10)
- **Anti-XSS & Tabnabbing**: All external links enforce `rel="noopener noreferrer"`. URLs are validated through `sanitizeUrl()` to block `javascript:`, `vbscript:`, and malformed protocol schemes.
- **CSV Formula Injection Defense**: All exported tabular records pass through `sanitizeCsvCell()`, prepending a single quote to neutralise cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return.
- **Untrusted File Validation**: Resume uploads (PDF/DOCX/TXT) undergo binary magic-byte verification, file size caps (10 MB), execution timeouts, and DOCX ZIP path traversal defenses (`src/utils/secureFileValidator.ts`).
- **Regular Expression Denial of Service (ReDoS)**: Strict character bounds (`MAX_INPUT_CHARS`) prevent unbounded input parsing.
- **Decompression Bomb Defense**: Evidence Card share codec enforces a 500 KB uncompressed byte cap (`MAX_DECOMPRESSED_CARD_BYTES`) and prototype pollution defense via `safeJsonParse()`.

### 3.3 Adversarial AI & Prompt Injection Defenses
- **Grounded Invariant Verification**: Scoring metrics are anchored to deterministic taxonomy parsing. AI output commentary is verified against resume text using verbatim-quote invariants (`enforceInvariants()`).
- **12-Category Red-Team Suite**: Validated against direct instruction overrides, indirect prompt injections, jailbreaks, delimiter breaking, BiDi/Unicode homoglyphs, and multilingual attacks (`security/redteam/fixtures.json`).
- **Zero Direct Egress**: Browser calls broker through local proxy (`/api/ats/analyze`) with fallback to deterministic evaluation; no API keys in URL query parameters.

### 3.4 Privacy & Data Protection (DPDP Act 2023)
- **Local-Only Processing**: Resumes, profiles, and candidate documents are processed in-memory and local browser storage.
- **Zero External Telemetry**: Zero analytics tracking pixels, zero marketing cookies, and zero third-party script CDNs.
- **Right to Erasure**: Candidates can permanently wipe all records anytime via the one-click `clearAllUserData()` control.

---

## 4. Audited Accepted Risks

| ID | Category | Description | Technical Justification |
|---|---|---|---|
| **AR-1** | Authentication | Client-Side Demo Auth Boundary | In the client-side SPA demo environment without a dedicated backend server, client-side route guards provide workflow separation rather than cryptographic multi-tenant isolation. Production multi-tenant deployments require a backend API gateway with HTTP-only SameSite JWT cookies. |
| **AR-2** | Dependencies | Transitive `sprintf-js` in `mammoth` | Advisory GHSA-hp3w-g68c-fv3c applies to the CLI argument formatter in `argparse`. Mammoth is executed purely in-browser via buffer extraction (`extractRawText`) and never executes the CLI wrapper. |

---

## 5. Security Check Suite

Run the full security test and scanning harness anytime:
```bash
# Full security verification suite (secrets, bundle, dependencies, adversarial tests)
npm run security:check

# Individual audit stages
npm run security:secrets   # Scan working tree for credentials
npm run security:bundle    # Inspect production distribution
npm run security:audit     # Verify package dependencies
npm run security:redteam   # Run 55-test security & adversarial suite
```
