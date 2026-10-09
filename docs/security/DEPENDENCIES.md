# HIREFLOW AI — DEPENDENCY SECURITY AUDIT REPORT

**Audit Date**: 2026-10-09  
**Tool**: `npm audit`  
**Lockfile Version**: 3 (`package-lock.json`)  

---

## 1. Vulnerability Summary

| Severity | Count | Status |
|---|---|---|
| **Critical** | 0 | Clear |
| **High** | 0 | Clear |
| **Moderate** | 3 | Review |
| **Low** | 0 | Monitor |
| **Info** | 0 | Informational |
| **Total** | 3 | |

---

## 2. Advisory Breakdown

| Package | Severity | Via / Advisory | Fixed In | Range |
|---|---|---|---|---|
| **argparse** (Transitive) | MODERATE | sprintf-js | Fix Available | `1.0.0 - 1.0.10` |
| **mammoth** (Direct) | MODERATE | argparse | Fix Available | `>=0.3.30` |
| **sprintf-js** (Transitive) | MODERATE | sprintf-js vulnerable to denial of service through | Fix Available | `*` |

---

## 3. Supply-Chain & Package Verification

- **Lockfile Enforced**: `package-lock.json` is tracked in git. All CI/CD workflows must use `npm ci`.
- **Install Scripts Review**: No custom preinstall / postinstall scripts detected in production application packages.
- **Dependency Pinning**: All core runtime dependencies are strictly version-bounded.
