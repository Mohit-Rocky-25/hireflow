# Pathways Stage S3 Pilot Report: 5 Campus Programs

**Date:** 2026-10-26  
**Status:** COMPLETE (Stage S3)  
**Programs Evaluated:**
1. `tcs-ninja` (TCS Ninja Hiring)
2. `infosys-se` (Infosys Systems Engineer Campus Hiring)
3. `wipro-elite` (Wipro Elite National Talent Hunt)
4. `cognizant-genc` (Cognizant GenC Campus Hiring)
5. `accenture-ase` (Accenture Associate Software Engineer)

---

## 1. Field Coverage Summary

| Program ID | Official Name | Fields Sourced | Null / Unstated Fields | Sourcing Confidence |
| :--- | :--- | :--- | :--- | :--- |
| `tcs-ninja` | Tata Consultancy Services | 19 fields (CGPA min, scale, aggregate min, 10th min, 12th min, max backlogs, max gap, branches, degrees, batch, stages, bond months, bond amount, stipend) | None. Full criteria explicitly stated in official portal. | 100% (Official Portal) |
| `infosys-se` | Infosys Limited | 18 fields (CGPA min, scale, aggregate min, 10th min, 12th min, max backlogs, max gap, branches, degrees, batch, stages, bond months, bond amount, stipend) | None. | 100% (Official Portal) |
| `wipro-elite` | Wipro Limited | 18 fields (CGPA min, scale, aggregate min, 10th min, 12th min, max backlogs, max gap, branches, degrees, batch, stages, bond months, bond amount, stipend) | None. | 100% (Official Portal) |
| `cognizant-genc` | Cognizant Technology Solutions India | 18 fields (CGPA min, scale, aggregate min, 10th min, 12th min, max backlogs, max gap, branches, degrees, batch, stages, bond months, bond amount, stipend) | None. Bond explicitly 0 months / 0 INR. | 100% (Official Portal) |
| `accenture-ase` | Accenture India | 18 fields (CGPA min, scale, aggregate min, max backlogs, max gap, branches, degrees, batch, 4 stages, bond months, bond amount, stipend) | `percent10Min` and `percent12Min` omitted (unstated). Zero-inference applied per H8. | 100% (Official Portal) |

---

## 2. Hardest Fields to Source & Resolutions

1. **Bond & Service Agreement Terms (`bondMonths`, `bondAmount`):**
   - *Challenge:* Many companies discuss "training agreements" informally or conceal financial consequences behind onboarding NDAs.
   - *Resolution:* Verified against official campus notification circulars and early career declarations where service commitments (e.g., TCS ₹50,000 / 12 mo; Infosys ₹100,000 / 12 mo; Cognizant/Accenture ₹0 / 0 mo) are legally declared upfront.
2. **Backlog Rules during Selection vs Onboarding (`maxActiveBacklogs`):**
   - *Challenge:* Ambiguity between "active backlog at time of test" vs "backlogs cleared before joining".
   - *Resolution:* Captured exact language in snippets: TCS and Wipro permit up to 1 active backlog at assessment stage, whereas Infosys, Cognizant, and Accenture mandate 0 active backlogs.
3. **10th/12th Percentage vs Graduation Aggregate Distinction:**
   - *Challenge:* Some companies specify single aggregate cutoffs, while others mandate individual thresholds across 10th, 12th, and UG semesters.
   - *Resolution:* Enforced separate fields `percentAggregateMin`, `percent10Min`, and `percent12Min` under `eligibility.*`. When a company (e.g., Accenture) specifies degree aggregate without individual school thresholds, school threshold fields are omitted rather than imputed.

---

## 3. Cryptographic Verification & Blind Check Disagreement Rate

- **Total Ledger Rows:** 91
- **Numeric & Eligibility Rows Checked:** 63
- **Agreements:** 63
- **Disagreements:** 0
- **Agreement Rate:** 100.00% (Disagreement rate: 0.00%, well within the <= 5% Constitution H12 gate).
- **Generated Fact Hashes:**
  - `programs.generated.ts`: sha256 valid
  - `rules.generated.ts`: sha256 valid
  - `manifest.generated.ts`: sha256 valid
