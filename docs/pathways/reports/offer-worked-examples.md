# Pathways Offer Evaluator: 8 Worked Examples Report

**Date:** 2026-10-26  
**Status:** COMPLETE (Stage S6)  
**Engine Version:** 1.0.0 (`src/pathways/engine/offer.ts`)  
**Standard:** Constitution Part B (B3, E7, H2-H12)

---

## Overview

This report details the exact step-by-step deterministic calculation for all 8 illustrative offer fixtures defined in Spec C15. All rupee amounts use standard integer math and half-up rounding (`roundHalfUp`).

---

### Example 1: `OFFER-01-MASS-SERVICES` (Mass IT Services Standard)
- **Inputs:** Fixed Annual: ₹3,60,000 | Variable: ₹0 | Joining Bonus: ₹0 | Basic: ₹15,000/mo | Service Bond: ₹1,00,000 (24 months) | Joining Month: July (Month 4).
- **Step 1: Benefits Decomposition:**
  - Basic Annual = $15,000 \times 12 = ₹1,80,000$
  - Employer PF = $1,80,000 \times 0.12 = ₹21,600$
  - Gratuity Reserve = $1,80,000 \times 0.0481 = ₹8,658$
  - Total Employer Benefits = $₹21,600 + ₹8,658 = ₹30,258$
- **Step 2: Gross Cash & Monthly In-Hand (0% Variable):**
  - Gross Cash Annual = $₹3,60,000 - ₹30,258 = ₹3,29,742$
  - Gross Monthly Cash = $₹3,29,742 / 12 = ₹27,479$
  - Employee PF Monthly = $₹15,000 \times 0.12 = ₹1,800$ (capped at ₹1,800)
  - Professional Tax = ₹200/mo
  - Taxable Income = $₹3,29,742 - ₹75,000 = ₹2,54,742$ (Tax = ₹0 under Section 87A rebate)
  - **Net In-Hand Monthly = $₹27,479 - ₹1,800 - ₹200 - ₹0 = ₹25,479/mo$**
- **Step 3: Exit Exposure (Months 0–36):**
  - Month 0: Bond ₹1,00,000 + Notice Buyout ₹27,479 = **₹1,27,479**
  - Month 12: Bond ₹1,00,000 + Notice = **₹1,27,479**
  - Month 24: Bond expires (₹0) + Notice = **₹27,479**
- **Step 4: Flags Triggered:**
  - Critical: Extended Service Agreement (24 months > 12 months).
  - Warning: High Service Bond Amount (₹1,00,000 > ₹50,000).

---

### Example 2: `OFFER-02-PREMIUM-SERVICES` (Differential Services Track)
- **Inputs:** Fixed Annual: ₹9,00,000 | Variable Target: ₹1,00,000 | Joining Bonus: ₹50,000 | Basic: ₹37,500/mo (50% basic rule) | Bond: None | Bonus Clawback: 12 months.
- **Monthly In-Hand Scenarios:**
  - 0% Variable: Gross Monthly ₹70,679 | Employee PF ₹1,800 | PT ₹200 | Tax ₹0 (under 12L) $\to$ **₹68,679/mo**
  - 50% Variable: Gross Monthly ₹74,846 | In-Hand $\to$ **₹72,846/mo**
  - 100% Variable: Gross Monthly ₹79,012 | In-Hand $\to$ **₹77,012/mo**
- **Exit Exposure:** Month 0 has ₹50,000 bonus clawback + ₹70,679 notice buyout = **₹1,20,679**. At Month 12, clawback reduces to ₹0.

---

### Example 3: `OFFER-03-GCC-PRODUCT-VARIABLE` (Global Capability Centre)
- **Inputs:** Fixed Annual: ₹16,00,000 | Variable: ₹4,00,000 (20%) | Joining Bonus: ₹2,00,000 | Basic: ₹65,000/mo.
- **Tax Jump Verification:**
  - At 0% Variable ($Gross \approx ₹15.08L$), Taxable income is ₹14.33L ($> ₹12L$ threshold). Annual Tax = ₹98,800 (Monthly TDS = ₹8,233).
  - At 100% Variable ($Gross \approx ₹19.08L$), Taxable income is ₹18.33L. Annual Tax = ₹1,73,264 (Monthly TDS = ₹14,439).
- **Flags Triggered:**
  - Warning: High Variable Component (20% of fixed pay). Generates specific HR question on historical payout multipliers.

---

### Example 4: `OFFER-04-STARTUP-ESOP` (Startup with Equity)
- **Inputs:** Fixed Annual: ₹12,00,000 | Variable: ₹0 | Joining Bonus: ₹1,00,000 | ESOP: ₹8,00,000 grant (1,000 units, 4-yr vesting with 1-yr cliff).
- **Vesting Schedule:**
  - Month 12: 25% (250 units) | ₹2,00,000 base valuation
  - Month 24: 50% (500 units) | ₹4,00,000 base valuation
  - Month 36: 75% (750 units) | ₹6,00,000 base valuation
  - Month 48: 100% (1,000 units) | ₹8,00,000 base valuation
- **Multipliers Modeled:** 1x (₹8L), 2x (₹16L), 5x (₹40L) with mandatory non-guarantee disclosure.

---

### Example 5: `OFFER-05-BONUS-CLAWBACK` (Heavy Sign-on Bonus)
- **Inputs:** Fixed Annual: ₹6,00,000 | Variable: ₹0 | Joining Bonus: ₹1,50,000 (25% of annual compensation) | Clawback: 24 months.
- **Clawback Schedule:**
  - Month 0: ₹1,50,000 (100%)
  - Month 6: ₹1,12,500 (75%)
  - Month 12: ₹75,000 (50%)
  - Month 18: ₹37,500 (25%)
  - Month 24: ₹0 (0%)
- **Flags Triggered:** Warning: Extended Joining Bonus Clawback (24 months > 12 months).

---

### Example 6: `OFFER-06-LONG-BOND` (Heavy 3-Year Pro-Rata Bond)
- **Inputs:** Fixed Annual: ₹4,50,000 | Variable: ₹50,000 | Service Bond: ₹3,00,000 for 36 months (pro-rata).
- **Bond Linear Amortization:**
  - Month 0: ₹3,00,000
  - Month 12: ₹2,00,000
  - Month 18: ₹1,50,000
  - Month 24: ₹1,00,000
  - Month 36: ₹0
- **Flags Triggered:** Critical: Extended Service Agreement (36 months). Warning: High Service Bond Amount (₹3,00,000).

---

### Example 7: `OFFER-07-MARCH-JOINER` (Partial Year Boundary Test)
- **Inputs:** Fixed Annual: ₹8,00,000 | Joining Month: 12 (March = 1 month in Indian FY).
- **Calculations:**
  - Months in FY1 = $13 - 12 = 1\text{ month}$.
  - FY1 Gross Earned = $₹66,667$.
  - Taxable Income = $₹66,667 - ₹75,000 = ₹0$.
  - FY1 Tax = **₹0** (Full-year equivalent is ₹0 due to 87A rebate). Demonstrates zero tax deduction during first month.

---

### Example 8: `OFFER-08-OCTOBER-JOINER` (Mid-Year Joining Test)
- **Inputs:** Fixed Annual: ₹10,00,000 | Joining Month: 7 (October = 6 months in Indian FY).
- **Calculations:**
  - Months in FY1 = $13 - 7 = 6\text{ months}$.
  - FY1 Gross Earned = $6 \times ₹78,000 = ₹4,68,000$.
  - Taxable Income = $₹4,68,000 - ₹75,000 = ₹3,93,000$.
  - FY1 Tax Estimate = **₹0** (under Section 87A rebate).
