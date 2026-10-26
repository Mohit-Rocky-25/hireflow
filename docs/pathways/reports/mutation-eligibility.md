# Pathways Eligibility Engine: Mutation Test Report (10 Mutants)

**Date:** 2026-10-26  
**Status:** COMPLETE (Stage S7)  
**Target:** `src/pathways/engine/eligibility.ts`  
**Test Suite:** `tests/pathways/eligibilityEngine.test.ts`

---

## 1. Mutation Analysis Summary

10 intentional semantic mutations were evaluated against the 24-test eligibility suite. All 10 mutants fail assertions, verifying 100% mutation kill rate.

| Mutant ID | Mutation Injected | Expected Behavior | Test Catching Mutant | Result |
| :--- | :--- | :--- | :--- | :--- |
| **M-01** | Linear scale conversion applied to scale 4.0 | Unit mismatch check bypassed | `P-03-SCALE-4: triggers unit_mismatch check` | **KILLED** |
| **M-02** | CGPA gap formula denominator off-by-one ($N - n - 1$) | Required CGPA miscalculated | `CGPA Gap: Current 6.5 after 4 sems, target 7.5` | **KILLED** |
| **M-03** | Impossible CGPA threshold raised from 10.0 to 12.0 | $R = 17.0$ not flagged impossible | `CGPA Gap: flags mathematically impossible target` | **KILLED** |
| **M-04** | Diploma lateral entry 12th waiver removed | Diploma candidate fails 12th grade cutoff | `P-02-DIPLOMA-LATERAL: satisfies 12th requirement` | **KILLED** |
| **M-05** | Unprovided 12th% marked as `pass` instead of `needs_input` | Missing inputs return `meets` instead of `check` | `P-17-BUDGET-MINIMAL: returns check with blockingInputs` | **KILLED** |
| **M-06** | Backlog condition inverted (`profile >= limit`) | 0 backlogs fails; 4 backlogs passes | `P-10-ACTIVE-BACKLOG-1` & `P-19-HIGH-BACKLOGS` | **KILLED** |
| **M-07** | Branch alias normalizer disabled | "E&TC" not normalized to "ECE" | `P-07-ALIAS-ENTC: E&TC resolves to ECE` | **KILLED** |
| **M-08** | Academic gap check removed | 36-month gap passes 24-month limit | `P-09-GAP-36MO: 36 months education gap fails` | **KILLED** |
| **M-09** | Empty program returns `meets` instead of `unknown` | Program with 0 criteria passes | `P-18-NO-CUTOFF-PROGRAM: returns unknown` | **KILLED** |
| **M-10** | Boundary cutoff changed from `>=` to `>` | Exact 6.00 CGPA fails 6.00 cutoff | `P-12-EXACT-THRESHOLD: 6.00 CGPA meets 6.0 cutoff` | **KILLED** |

---

## 2. Conclusion
The Eligibility Engine exhibits 10/10 mutation kill score (100% kill rate). Boundary conditions, alias resolution, unit mismatch guards, and 4-status determinism are verified.
