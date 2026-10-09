# HIREFLOW AI — PRIVACY & DATA PROTECTION AUDIT

## 1. Executive Summary

This document records the privacy audit of the HireFlow AI application, verifying adherence to **Digital Personal Data Protection Act 2023 (DPDP Act 2023)** and **GDPR** principles.

All candidate resumes, work histories, job descriptions, and user accounts are processed **locally on the user's workstation/browser**, with zero external telemetry, zero advertising trackers, and guaranteed user data erasure.

---

## 2. Personally Identifiable Information (PII) Inventory

| Data Field | Storage Location | Processing Purpose | Retention & Lifespan | Egress / Sharing |
|---|---|---|---|---|
| **Candidate Name & Email** | `localStorage` (`hireflow-storage-v4`) | Authentication & Portal personalization | Until user clicks "Erase All My Data" or clears cache | **None** |
| **Candidate Resumes (PDF/DOCX/TXT)** | Ephemeral browser memory | ATS parsing, skill extraction, matching | Not persisted across sessions; purged upon tab close | **None** |
| **Candidate Profile & Skills** | `localStorage` (`hireflow-storage-v4`) | Career roadmaps & JD comparison | Local persistence across visits | **None** |
| **Authentication Credential Hashes** | `sessionStorage` & `localStorage` (`hf_hash_*`) | Local session verification (Salted SHA-256) | Cleared on logout (`sessionStorage`) or user data reset | **None** |
| **Audit Logs** | `localStorage` (`hireflow-storage-v4`) | Mock admin monitoring demonstration | Cleared on user data reset | **None** |

---

## 3. Network Egress & Telemetry Verification

- **Third-Party Analytics**: Verified **0** external tracking scripts. No Google Analytics, Meta Pixel, Segment, Mixpanel, or Hotjar exist in `index.html` or the bundle.
- **External CDNs**: All application code, styling, and fonts are compiled directly into the local bundle. Zero runtime script downloads from `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, or `unpkg.com`.
- **AI Processing Egress**: AI calls occur strictly via the local dev proxy (`/api/ats/analyze`). No un-proxied direct browser API calls with raw keys in query parameters exist (SEC-003 remediated).

---

## 4. DPDP Act 2023 Alignment & User Rights

1. **Notice & Transparency**: [PrivacyDisclaimer.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/components/common/PrivacyDisclaimer.tsx) provides clear, accessible disclosure to candidates regarding local processing.
2. **Purpose Limitation**: Data entered into tools (Resume Checker, Career Path, Compare JDs) is evaluated solely for the requested analysis and never repurposed.
3. **Data Minimization**: The Evidence Card codec (`cardCodec.ts`) strips PII by default unless explicitly toggled by the candidate.
4. **Right to Erasure**: Candidates have a one-click erasure control (`clearAllUserData()`) that wipes all records from browser storage.
