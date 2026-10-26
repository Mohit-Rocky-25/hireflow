# Pathways Red-Team Audit Report: Stage S6 (Offer Engine)

**Date:** 2026-10-26  
**Auditor:** Antigravity Red-Team Module  
**Scope:** `src/pathways/engine/offer.ts`, `src/pathways/utils/money.ts`  
**Governing Rules:** Constitution Part B (B1, B3, B6, E6, E7, H8)

---

## 1. Adversarial Attack Vectors & Findings

### Vector 1: Floating-Point Slip & Micro-Rupee Attacks
- **Attack:** Feeding inputs with high precision decimals (e.g. `fixedAnnual: 360000.789123`, `variable: 100000.333`).
- **Engine Response:** `toIntegerRupees` and `roundHalfUp` systematically enforce integer rupee conversion at the entry boundary. No floating-point residuals escape into monthly or scenario breakdowns.
- **Verdict:** PASS.

### Vector 2: Negative and Inverted Value Injection
- **Attack:** Passing negative fixed annual compensation or negative bonuses (`fixedAnnual: -500000`, `joiningBonus: -10000`).
- **Engine Response:** All breakdown and in-hand calculations enforce `Math.max(0, ...)` bounds. Taxable income and monthly gross cannot drop below ₹0.
- **Verdict:** PASS.

### Vector 3: Zero-CTC and Infinite Division Attacks
- **Attack:** Passing `fixedAnnual: 0`, `variable: 0`, `bonus: 0`.
- **Engine Response:** Safe guards prevent divide-by-zero errors in ratio computations (`totalCtcAnnual > 0 ? ... : 0`). In-hand ratio and percent formatters return clean `0.0%` strings.
- **Verdict:** PASS.

### Vector 4: Unenforceable Legal Advice Claim Scan
- **Attack:** Scan generated warning copy and microcopy for prohibited legal advice claims (e.g., claiming bonds are "void" or "illegal").
- **Audit:** All warning texts strictly adhere to Constitution C14:
  - "Courts in India have treated reasonable service bonds as enforceable... This tool shows the money at stake, not legal advice."
  - Flag descriptions state arithmetic reality: "Offer mandates a X-month service bond. Standard campus norms are 12 months or nil."
- **Verdict:** PASS.

### Vector 5: Outlier Compensation Tests
- **Attack:** Ultra-high compensation (`fixedAnnual: 10,00,00,000` = ₹10 Crores).
- **Engine Response:** Correctly applies the 30% top tax bracket, adds 4% cess, scales exit exposure cleanly, and maintains Indian number comma formatting (`₹10,00,00,000`).
- **Verdict:** PASS.

---

## 2. Red-Team Sign-Off
All 5 red-team vectors passed without vulnerability or rule violation. Stage S6 is approved.
