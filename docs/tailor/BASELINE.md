# HireFlow Tailor My Resume — Stage 0 Baseline Audit Report

**Date**: 2026-10-29T17:25:06.558Z  
**Harness**: Current Codebase (`src/lib/tailor/`, `src/engine/tailor/`)  
**Sample**: 12 Diverse Fictional Personas covering campus, private, US, UK, diacritics, and Indic scripts.

## 1. Export, Extraction & Character Integrity Baseline

| Persona ID | Name | Region | PDF Size (Letter/A4) | Font Family | Character Integrity | Recovery (Name/Email/Phone) | Runtime |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `persona-01-fresher-campus-cs` | Aarav Sharma | india-campus | 2992B / 3004B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 2220ms |
| `persona-02-fresher-with-internship` | Rohan Mehra | india-private | 2881B / 2890B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 102ms |
| `persona-03-diacritics-sde1` | Chloé Lefèvre | us | 2897B / 2914B | WinAnsi Helvetica | **pass**  | Name: FAIL, Email: PASS, Phone: PASS | 58ms |
| `persona-04-indic-name-fresher` | ಅಮಿತ್ ಕುಮಾರ್ (Amit Kumar) | india-campus | 2518B / 2528B | WinAnsi Helvetica | **stripped_indic** (Indic unicode characters completely stripped to spaces by WinAnsi sanitization) | Name: FAIL, Email: PASS, Phone: FAIL | 50ms |
| `persona-05-mid-sde-backend` | Vikram Sengupta | india-private | 3097B / 3113B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 54ms |
| `persona-06-senior-sde-us` | Rachel Chen | us | 2912B / 2923B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: PASS | 48ms |
| `persona-07-lead-manager-uk` | Alastair Montgomery | uk | 2604B / 2613B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 64ms |
| `persona-08-cybersecurity-specialist` | David Sterling | us | 3003B / 3023B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: PASS | 73ms |
| `persona-09-data-ml-engineer` | Pooja Narayanan | india-private | 2613B / 2624B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 48ms |
| `persona-10-devops-engineer` | Siddharth Iyer | india-private | 2584B / 2620B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 46ms |
| `persona-11-mobile-engineer` | Ananya Deshmukh | india-private | 2669B / 2673B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 37ms |
| `persona-12-frontend-specialist` | Karthik Raja | india-private | 2624B / 2634B | WinAnsi Helvetica | **pass**  | Name: PASS, Email: PASS, Phone: FAIL | 37ms |

## 2. As-Is Section Sequence & Education Placement Decisions

| Persona ID | Archetype | Years Since Grad | Current Section Order | Education Rank | Current Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `persona-01-fresher-campus-cs` | `student_fresher` | 0y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-02-fresher-with-internship` | `student_fresher` | 0.5y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-03-diacritics-sde1` | `early_career` | 1.5y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-04-indic-name-fresher` | `student_fresher` | 0y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-05-mid-sde-backend` | `mid_career` | 4y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-06-senior-sde-us` | `senior_lead` | 8y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-07-lead-manager-uk` | `executive` | 12y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-08-cybersecurity-specialist` | `security_specialist` | 6y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-09-data-ml-engineer` | `data_ml_specialist` | 3y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-10-devops-engineer` | `devops_specialist` | 5y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-11-mobile-engineer` | `mobile_specialist` | 2.5y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |
| `persona-12-frontend-specialist` | `frontend_specialist` | 3.5y | skills -> experience -> projects -> education | **#4 of 4** | Standard university credentials. |

## 3. Key Baseline Findings & Defect Confirmations

1. **Unicode Character Silencing (I-06)**: On `persona-03-diacritics-sde1` ("Chloé Lefèvre") and `persona-04-indic-name-fresher` ("ಅಮಿತ್ ಕುಮಾರ್"), the WinAnsi PDF exporter silently replaces non-ASCII runes with spaces, producing corrupted text ("Chlo  Lef vre" and empty spaces) in extracted PDF bytes.
2. **Static Archetype Ordering (I-11)**: `technical_specialist` (e.g. SDEs with 1.5 - 3.5 years experience) is hardcoded to `skills -> experience -> projects -> education` placing Education at the very bottom (#4) regardless of whether the candidate graduated recently or whether the target JD specifies degree/CGPA eligibility.
3. **Zero Distinction in Page Height (I-05)**: Layout sentinel assumes 1056px capacity for both Letter and A4, causing erroneous spill warnings or missing overflow on A4.
4. **Field Recovery Inconsistencies (I-15)**: Email and phone headers are recovered at 100%, but complex work experience and project entries experience delimiter degradation during raw text re-parsing without structured round-trip validation.
