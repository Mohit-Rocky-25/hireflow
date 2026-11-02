# HIREFLOW AI — DEPENDENCY SECURITY AUDIT REPORT

**Audit Date**: 2026-11-02  
**Tool**: `npm audit`  
**Lockfile Version**: 3 (`package-lock.json`)  

---

## 1. Vulnerability Summary

| Severity | Count | Status |
|---|---|---|
| **Critical** | 0 | Clear |
| **High** | 2 | Action Required |
| **Moderate** | 0 | Review |
| **Low** | 0 | Monitor |
| **Info** | 0 | Informational |
| **Total** | 2 | |

---

## 2. Advisory Breakdown

| Package | Severity | Via / Advisory | Fixed In | Range |
|---|---|---|---|---|
| **vite** (Direct) | HIGH | launch-editor: escapeCmdArgs() omits % escaping on | Fix Available | `8.3.0 - 8.3.2` |
| **zod** (Direct) | HIGH | Zod can exhaust memory while validating oversized  | Fix Available | `<4.6.6` |

---

## 3. Supply-Chain & Package Verification

- **Lockfile Enforced**: `package-lock.json` is tracked in git. All CI/CD workflows must use `npm ci`.
- **Install Scripts Review**: No custom preinstall / postinstall scripts detected in production application packages.
- **Dependency Pinning**: All core runtime dependencies are strictly version-bounded.
