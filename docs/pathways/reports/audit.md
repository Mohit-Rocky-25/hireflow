# Pathways Comprehensive Data & Engine Audit Report

- **Generated At**: 2026-10-26T11:34:54.432Z
- **Audit Tool**: `scripts/pathways/audit.mjs`
- **Governed By**: `docs/pathways/CONSTITUTION.md`

---

## 1. Census & Evidence Breakdown
| Metric | Value |
| :--- | :--- |
| **Total Ledger Rows** | 363 |
| **Official Company Portal Rows** | 340 |
| **Company-Published Documents** | 0 |
| **Government Statutory Rules** | 23 |
| **Active Subjects Shipped** | 23 |
| **Quarantined Subjects** | 0 |
| **Facts Without Sourced Evidence (Must be 0)** | **0** |

---

## 2. Blind Re-Extraction Self-Check (Constitution B4/H10)
- **Total Rows Evaluated**: 248
- **Agreements**: 248
- **Disagreements**: 0
- **Agreement Rate**: **100.00%** (Pass threshold >= 95%)

---

## 3. Field Coverage Distribution
- `bondAmount`: 20 rows
- `bondMonths`: 20 rows
- `eligibility.batchYears`: 20 rows
- `eligibility.branches`: 20 rows
- `eligibility.cgpaMin`: 20 rows
- `eligibility.cgpaScale`: 20 rows
- `eligibility.degrees`: 20 rows
- `eligibility.maxActiveBacklogs`: 20 rows
- `eligibility.maxGapMonths`: 20 rows
- `eligibility.percent10Min`: 4 rows
- `eligibility.percent12Min`: 4 rows
- `eligibility.percentAggregateMin`: 17 rows
- `epf.employeeRate`: 1 rows
- `epf.wageCeiling`: 1 rows
- `labour.wageDefinition.gratuityDays`: 1 rows
- `labour.wageDefinition.gratuityDivisor`: 1 rows
- `labour.wageDefinition.gratuityVestingYears`: 1 rows
- `labour.wageDefinition.minRatio`: 1 rows
- `officialName`: 20 rows
- `programName`: 20 rows
- `programPageUrl`: 20 rows
- `stage.name`: 55 rows
- `stipend`: 20 rows
- `tax.cessRate`: 1 rows
- `tax.newRegime.slab1Max`: 1 rows
- `tax.newRegime.slab1Rate`: 1 rows
- `tax.newRegime.slab2Max`: 1 rows
- `tax.newRegime.slab2Rate`: 1 rows
- `tax.newRegime.slab3Max`: 1 rows
- `tax.newRegime.slab3Rate`: 1 rows
- `tax.newRegime.slab4Max`: 1 rows
- `tax.newRegime.slab4Rate`: 1 rows
- `tax.newRegime.slab5Max`: 1 rows
- `tax.newRegime.slab5Rate`: 1 rows
- `tax.newRegime.slab6Max`: 1 rows
- `tax.newRegime.slab6Rate`: 1 rows
- `tax.newRegime.slab7Rate`: 1 rows
- `tax.rebate87A.maxRebate`: 1 rows
- `tax.rebate87A.threshold`: 1 rows
- `tax.standardDeduction`: 1 rows

---

## 4. Quarantined Subjects Log
*No subjects quarantined.*

---

## 5. Audit Invariants
- [x] Zero runtime network egress verified.
- [x] Zero facts without ledger evidence rows.
- [x] All generated files protected by SHA-256 content hashes.
- [x] UI component arithmetic check clean.
