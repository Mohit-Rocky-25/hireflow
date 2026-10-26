# Pathways Offer Evaluator: Mutation Test Report (10 Mutants)

**Date:** 2026-10-26  
**Status:** COMPLETE (Stage S6)  
**Target:** `src/pathways/engine/offer.ts`  
**Test Suite:** `tests/pathways/offerEngine.test.ts`

---

## 1. Mutation Analysis Summary

10 intentional semantic mutations were evaluated against the test suite. All 10 mutants produce assertion failures, confirming 100% mutation kill rate.

| Mutant ID | Mutation Injected | Expected Behavior | Test Catching Mutant | Result |
| :--- | :--- | :--- | :--- | :--- |
| **M-01** | Standard deduction changed from ₹75k to ₹50k | Taxable income increases; ₹12.75L gross taxed | `Tax Engine: applies standard deduction ₹75,000` | **KILLED** |
| **M-02** | Rebate 87A threshold dropped from ₹12L to ₹7L | ₹12L taxable income now generates positive tax | `Tax Engine: Section 87A rebate for taxable income <= ₹12L` | **KILLED** |
| **M-03** | Health & Education cess changed from 4% to 3% | Cess on ₹16.75L gross falls from ₹4,800 to ₹3,600 | `Tax Engine: computes tax with slabs and 4% cess` | **KILLED** |
| **M-04** | Statutory EPF wage ceiling (₹15,000/mo) removed | ₹65k basic yields ₹7,800 PF deduction instead of ₹1,800 | `OFFER-03: Fixed ₹16 LPA` | **KILLED** |
| **M-05** | Gratuity rate changed from 4.81% to 5.0% | Gratuity provision increases from ₹8,658 to ₹9,000 | `OFFER-01: benefits decomposition` | **KILLED** |
| **M-06** | Inverted linear bond amortization `m/bondMonths` | Month 18 bond drops to ₹1,50,000; month 36 inverted | `OFFER-06: ₹3L bond for 36 months pro-rata` | **KILLED** |
| **M-07** | Joining bonus clawback initialized to 0 | Month 0 exit liability misses ₹1,50,000 clawback | `OFFER-05: bonus clawback schedule` | **KILLED** |
| **M-08** | March partial FY months off-by-one (`12 - joiningMonth = 0`) | Zero months calculated; gross earned drops to 0 | `OFFER-07: joining in March (1 month in FY1)` | **KILLED** |
| **M-09** | ESOP cliff months set to 0 instead of 12 | Month 1 shows early vesting | `OFFER-04: ESOP 4-year vesting with 1-year cliff` | **KILLED** |
| **M-10** | Bond duration red flag threshold changed to > 24 mo | 24-month bond passes without flag | `OFFER-01: bond duration 24 mo > 12 mo flag` | **KILLED** |

---

## 2. Conclusion
The Offer Engine demonstrates 10/10 mutation kill score (100% kill rate). Boundary arithmetic, statutory limits, and warning triggers are verified.
