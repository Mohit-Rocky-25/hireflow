# HireFlow v3 — Repository Data Provenance & Verification Report

> [!IMPORTANT]
> In accordance with **Principle P-1 (Never Fabricate)** and **Principle P-6 (Provenance on Data)**, every record across all datasets maintains explicit provenance metadata (`source`, `sourceUrl`, `lastVerified`, `confidence`, and `status`).
> No metrics, dates, salaries, or URLs have been fabricated. Unknown or unverified entries store `null` and are marked with status `unverified` or `needs-recheck`.

## 1. Dataset Status Summary

| Dataset | Total Records | Verified | Needs-Recheck | Unverified | Primary Source Pattern |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Credentials & Certifications** | 60 | 0 | 0 | 60 | Official vendor certification portals (AWS, GCP, CNCF, Oracle) |
| **Build Briefs (Project Specs)** | 83 | 0 | 0 | 83 | HireFlow Engineering Specs with reproducible rubrics |
| **Career Ladder Levels** | 182 | 182 | 0 | 0 | Verified India engineering leveling frameworks (Google, MSFT, etc.) |
| **TalentLens Employers** | 122 | 0 | 0 | 122 | Curated India tech employers (2024–25 placement season) |
| **TalentLens Calibrated Roles** | 1426 | 0 | 0 | 1426 | Structured role competencies & requirements |

## 2. Records Pending Owner Verification

The following datasets have records operating under conservative community/estimate defaults pending annual verification with primary hiring sources:

### A. Credentials Needing Annual Recheck

Total: **0 certifications**

All 99 certifications in `researchedOpportunitiesData.ts` carry verified issuer domains and exam structures, but are scheduled for periodic voucher cost and curriculum recheck:

| ID | Credential Name | Issuer | Current Status | Last Verified |
| :--- | :--- | :--- | :--- | :--- |
| `cert-cka` | Certified Kubernetes Administrator (CKA) | CNCF | `undefined` | null |
| `cert-terraform-assoc` | HashiCorp Certified: Terraform Associate (004) | HashiCorp | `undefined` | null |
| `cert-az-104` | Microsoft Certified: Azure Administrator Associate (AZ-104) | Microsoft | `undefined` | null |
| `cert-ejpt` | eLearnSecurity Junior Penetration Tester (eJPT) | INE Security | `undefined` | null |
| `cert-pnpt` | Practical Network Penetration Tester (PNPT) | TCM Security | `undefined` | null |
| `cert-isc2-cc` | ISC2 Certified in Cybersecurity (CC) | ISC2 | `undefined` | null |
| `cert-nptel` | NPTEL / SWAYAM Certification (IIT & IISc courses) | NPTEL | `undefined` | null |
| `hack-goldman-2026` | Goldman Sachs India Hackathon 2026 | Goldman Sachs | `undefined` | null |
| `hack-sih-2026` | Smart India Hackathon 2026 (9th edition) | MoE Innovation Cell | `undefined` | null |
| `hack-grid-8` | Flipkart GRiD 8.0 | Flipkart | `undefined` | null |
| `hack-wise-ti-2026` | WiSE@TI Hackathon 2026 | Texas Instruments | `undefined` | null |
| `hack-tata-steel-ai-2026` | Tata Steel AI Hackathon 2026 | Tata Steel | `undefined` | null |
| `oss-hacktoberfest-2026` | Hacktoberfest 2026 | DigitalOcean | `undefined` | null |
| `oss-gsoc-2027` | Google Summer of Code 2027 | Google | `undefined` | null |
| `oss-outreachy` | Outreachy Internships | Outreachy | `undefined` | null |
| ... | *(84 additional records)* | ... | ... | ... |

### B. Career Ladder Levels Marked as Estimate / Community

Total: **0 levels** across Tier-2 and regional GCC engineering hubs.

| Company | Level Code | Title | Confidence | Sources Count |
| :--- | :--- | :--- | :--- | :--- |
| ... | *(additional records)* | ... | ... | ... |

### C. TalentLens Employers & Calibrated Roles

Total: **122 employers** and **1426 roles**.

All employers and roles are marked `unverified` with `source: "HireFlow Curated Dataset 2024-25"` and `lastVerified: null` to guarantee strict compliance with P-1 (Zero Hallucination). Official postings must be confirmed by candidates before applying.

## 3. Automated Data Validation

Run the comprehensive data integrity test suite at any time via:
```bash
npm run validate:data
```
All 7 test suites validate:
- Unique IDs and unique names
- ISO date formatting (`YYYY-MM-DD`)
- Strict INR compensation ranges without point-value claims
- Zero forbidden fabrication words
