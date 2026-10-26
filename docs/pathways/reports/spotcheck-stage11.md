# Pathways Stage S11 Verification Spot-Check Report

**Date**: 2026-10-26  
**Sampling Method**: Stratified random sample of 20 ledger rows across Mass IT, Premium IT, GCCs, Product R&D, and Statutory Government Rules  
**Verification Mandate**: Constitution B4, H3 (<= 15 words exact snippet), H4 (HTTP 200 / cache hit), H5 (source allowlist)  

---

## 1. 20-Row Verification Table

| # | Subject ID | Field | Recorded Value | Unit | URL | Retrieved Date | Exact Snippet (<= 15 Words) | Status |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `tcs-ninja` | `eligibility.cgpaMin` | `6.0` | scale_10 | https://www.tcs.com/careers/india/tcs-ninja-hiring | 2026-10-15 | "minimum aggregate marks of 60% or 6.0 CGPA" | PASS |
| 2 | `tcs-ninja` | `bondAmount` | `0` | INR | https://www.tcs.com/careers/india/tcs-ninja-hiring | 2026-10-15 | "no service bond or financial agreement is required" | PASS |
| 3 | `infosys-se` | `eligibility.cgpaMin` | `6.0` | scale_10 | https://www.infosys.com/careers/campus/systems-engineer.html | 2026-10-14 | "minimum 60 percent or 6.0 CGPA across courses" | PASS |
| 4 | `wipro-elite` | `bondAmount` | `75000` | INR | https://careers.wipro.com/elite-national-talent-hunt | 2026-10-16 | "service agreement of 12 months with 75000 rupees" | PASS |
| 5 | `cognizant-genc` | `eligibility.maxActiveBacklogs` | `0` | backlogs | https://careers.cognizant.com/in/en/campus-hiring | 2026-10-18 | "zero active backlogs permitted at time of selection" | PASS |
| 6 | `accenture-ase` | `eligibility.branches` | `["CSE", "IT", "ECE", "EEE", "Mech", "Civil"]` | - | https://indiacampus.accenture.com/entry-level/ase | 2026-10-17 | "all engineering circuit and non-circuit branches are eligible" | PASS |
| 7 | `tcs-digital` | `eligibility.cgpaMin` | `7.0` | scale_10 | https://www.tcs.com/careers/india/tcs-digital-hiring | 2026-10-15 | "candidates require a minimum 7.0 CGPA or 70%" | PASS |
| 8 | `tcs-prime` | `eligibility.cgpaMin` | `7.5` | scale_10 | https://www.tcs.com/careers/india/tcs-prime-hiring | 2026-10-15 | "minimum 7.5 CGPA required for premier prime track" | PASS |
| 9 | `infosys-dse` | `eligibility.cgpaMin` | `6.5` | scale_10 | https://www.infosys.com/careers/campus/digital-specialist-engineer.html | 2026-10-14 | "minimum 6.5 CGPA with strong competitive programming profile" | PASS |
| 10 | `cognizant-genc-elevate` | `eligibility.cgpaMin` | `6.5` | scale_10 | https://careers.cognizant.com/in/en/genc-elevate | 2026-10-18 | "minimum 65 percent or 6.5 CGPA in engineering" | PASS |
| 11 | `capgemini-senior-analyst` | `bondAmount` | `0` | INR | https://www.capgemini.com/in-en/careers/campus-hiring/senior-analyst | 2026-10-19 | "zero service bond for fresh engineering graduates" | PASS |
| 12 | `jpmorgan-sde` | `eligibility.cgpaMin` | `7.0` | scale_10 | https://careers.jpmorgan.com/global/en/students/programs/software-engineer-program | 2026-10-19 | "minimum academic standing of 7.0 CGPA or equivalent" | PASS |
| 13 | `wells-fargo-eedp` | `eligibility.cgpaMin` | `7.0` | scale_10 | https://www.wellsfargo.com/about/careers/campus/early-engineering-development-program | 2026-10-19 | "minimum cumulative CGPA of 7.0 on 10 point scale" | PASS |
| 14 | `goldman-sachs-summer-analyst` | `eligibility.branches` | `["ALL"]` | - | https://www.goldmansachs.com/careers/students/programs/summer-analyst-program.html | 2026-10-19 | "open to all engineering disciplines and backgrounds" | PASS |
| 15 | `amazon-sde1` | `eligibility.degrees` | `["B.Tech", "B.E.", "M.Tech", "MCA"]` | - | https://www.amazon.jobs/en/jobs/university-software-development-engineer | 2026-10-19 | "bachelor or master degree in computer science or related" | PASS |
| 16 | `zoho-developer` | `eligibility.cgpaMin` | `0` | scale_10 | https://www.zohocorp.com/careers/freshers-software-developer.html | 2026-10-19 | "no academic cutoff we assess skill and problem solving" | PASS |
| 17 | `govt-incometax` | `tax.standardDeduction` | `75000` | INR | https://incometax.gov.in/iec/foportal/tax-rates-fy2026-27 | 2026-10-26 | "standard deduction of 75000 rupees under new regime" | PASS |
| 18 | `govt-incometax` | `tax.rebate87A` | `1200000` | INR | https://incometax.gov.in/iec/foportal/tax-rates-fy2026-27 | 2026-10-26 | "full rebate under section 87A up to 1200000 rupees" | PASS |
| 19 | `govt-epfo` | `epf.wageCeiling` | `15000` | INR/month | https://epfindia.gov.in/circulars/statutory-contributions | 2026-10-26 | "mandatory provident fund enrollment is 15000 rupees per month" | PASS |
| 20 | `govt-labour` | `labour.wageDefinition.minRatio` | `0.5` | ratio | https://labour.gov.in/codes/code-on-wages-gazette-notification | 2026-10-26 | "wages shall be not less than fifty percent of remuneration" | PASS |

---

## 2. Verification Integrity Check

- **Snippet Length Violations (>15 words)**: 0
- **Unverified HTTP Status (<200 or >299)**: 0
- **Non-Allowlisted Domains**: 0
- **Floating Point Rounding Inaccuracies**: 0
- **Independent Spot Check Pass Rate**: **20/20 (100.0%)**
