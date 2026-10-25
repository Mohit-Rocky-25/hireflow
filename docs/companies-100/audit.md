# Companies-100 Mission Final Audit Report

Generated on: 2026-10-25T19:19:59.841Z  
Branch: `feat/companies-100-v1`  
Audit Scope: 100 Roster Employers, Primary Evidence Ledger, Evidence Cache, Role Fit, and Blind Verification  

## Executive Compliance Summary

| Compliance Invariant | Required Threshold | Audit Result | Status |
|---|---|---|---|
| **Anti-Hallucination Integrity (Rule H1)** | 100% facts from ledger | 833 / 833 facts from verified ledger | **PASSED** |
| **Closed Field Boundary (Rule H2)** | 0 unregistered fields | 0 unregistered fields detected | **PASSED** |
| **Zero Rows Without Evidence (Rule H4)** | 0 unbacked rows | 0 rows without evidence | **PASSED** |
| **Banned Imputation Words (Rule H7)** | 0 occurrences | 0 occurrences | **PASSED** |
| **Stale Record Boundary (< 180 Days)** | 0 stale records | 0 records > 180 days | **PASSED** |
| **Quarantine Enforcement (Rule H8)** | Ships 0 rows | 2 quarantined entities ship 0 rows | **PASSED** |
| **Blind Re-Extraction Disagreement (Rule H11)** | < 5.0% threshold | 0.0% disagreement (100% agreement) | **PASSED** |
| **Zero Runtime Egress (Rule W8)** | 0 network dependencies | 0 network calls at runtime | **PASSED** |

---

## 1. Catalog Composition & Depth Breakdown

| Segment | Company Count | Role Count | Data Status | Shipped to Catalog | Description |
|---|---|---|---|---|---|
| **Deep** | 30 | 107 | `sourced` | **YES** | Official India campus/early-career intake evidence verified |
| **Standard** | 59 | 40 | `sourced` | **YES** | Confirmed employers with active careers and engineering roles |
| **Basic** | 5 | 0 | `sourced` | **YES** | Profile metadata only (zero role claims) |
| **Quarantined** | 2 | 0 | `quarantined` | **NO** | Zero rows shipped per Rule H8 (`axxela`, `voxela`) |
| **Deduped Overlaps** | 4 | - | `legacy_unaudited` | **SKIPPED** | Pre-existing in legacy dataset (`mu_sigma`, `leadsquared`, `birlasoft`, `zensar`) |
| **Legacy Catalog** | 141 | 1410 | `legacy_unaudited` | **YES** | Untouched pre-existing catalog entries |
| **Total TalentLens Catalog** | **235** | **1557** | - | **YES** | Unified active catalog |

---

## 2. Evidence & Source Distribution

- **Total Ledger Files Audited**: 96
- **Total Verified Ledger Rows**: 833
- **Official Primary Source Rows**: 833 (100.0%)
- **Company-Published Source Rows**: 0 (0.0%)
- **Cached HTML/DOM Snapshots**: 331 files in `.evidence-cache/`
- **Fetch Log Records**: 331 HTTP 200 records in `docs/companies-100/fetch-log.jsonl`

---

## 3. Field Presence & Empty-Rate Analysis

Per Rule H6 (*Null is a good answer*), fields are only populated when explicitly stated on official pages without imputation:

| Field | Populated Companies (out of 94) | Fill Rate (%) | Empty Rate (%) | Status |
|---|---|---|---|---|
| `officialName` | 94 | 100.0% | 0.0% | Mandatory Core Metadata |
| `officialSiteUrl` | 94 | 100.0% | 0.0% | Mandatory Core Metadata |
| `careersUrl` | 94 | 100.0% | 0.0% | Mandatory Core Metadata |
| `hq` | 94 | 100.0% | 0.0% | Mandatory Core Metadata |
| `industry` | 94 | 100.0% | 0.0% | Mandatory Core Metadata |
| `campusPageUrl` | 47 | 50.0% | 50.0% | Official Criteria Only |
| `jobFamily` | 84 | 89.4% | 10.6% | Official Criteria Only |
| `eligibility.aggregatePercent` | 25 | 26.6% | 73.4% | Official Criteria Only |
| `eligibility.cgpa` | 0 | 0.0% | 100.0% | Not Published (Good Null) |
| `eligibility.backlogRule` | 25 | 26.6% | 73.4% | Official Criteria Only |
| `eligibility.branches` | 25 | 26.6% | 73.4% | Official Criteria Only |
| `eligibility.batchYears` | 0 | 0.0% | 100.0% | Not Published (Good Null) |
| `compensation` | 0 | 0.0% | 100.0% | Not Published (Good Null) |
| `hiringRound` | 0 | 0.0% | 100.0% | Not Published (Good Null) |
| `openRoles` | 0 | 0.0% | 100.0% | Not Published (Good Null) |
| `hiringIntake` | 0 | 0.0% | 100.0% | Not Published (Good Null) |

---

## 4. Role Competency Fit & Uncovered Skills Distribution

- **Total Generated Role Profiles**: 147 across 94 confirmed companies
- **Good Fit Profiles**: 60 (40.8%)
- **Approximate Fit Profiles**: 87 (59.2%)

> [!NOTE]
> Roles with `competencyFit === "approximate"` represent specialized domains (Embedded Systems, Firmware, Quant Development, Automotive, Industrial Automation) where the core role requirements rely on languages/frameworks outside the 20 canonical TalentLens keys (e.g. C/C++, Embedded C, RTOS, FPGA, ASIC, AUTOSAR, Low-Latency Networking). In compliance with Rule H7, unrelated keys were NEVER padded into competency profiles.

---

## 5. Security, Privacy & Anti-Hallucination Invariants

1. **Zero Runtime Egress**: All role profiles, company metadata, and eligibility rules compile into immutable static TypeScript data bundles. Zero network fetch calls are made at runtime.
2. **Zero Banned Words**: Automated regex scan confirmed 0 instances of `typical`, `approximately`, `around`, `estimated`, `about`, `expected` across all 833 ledger values.
3. **Zero Orphaned Rows**: Every single ledger row has a matching HTTP 200 fetch log entry and an exact whitespace-normalized snippet found in `.evidence-cache/`.
4. **Zero Duplicate Keys**: Automated verification confirmed 0 duplicate normalized company names or company IDs.

## 6. Audit Conclusion

✅ **PASSED**: The Companies-100 Mission dataset satisfies 100% of the non-negotiable Anti-Hallucination rules (H1–H12) and Working Rules (W1–W8).