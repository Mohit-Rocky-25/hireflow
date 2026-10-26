# PATHWAYS SPEC

### C1. Users and jobs
Primary user: a second- to final-year engineering student (tier-2/3 college typical), often on a phone, short on time. Jobs: (1) "which programs can I apply to, and what do I still need to tell the tool?", (2) "what is the process and what should I prepare?", (3) "what should I do this month?", (4) "what is this offer actually worth, and what should I ask HR?". Out of scope for v1: professional promotion modelling, company ladders, salary database, job listings, accounts or backends, payments, languages other than English, ESOP tax computation, HRA exemption maths, state professional-tax tables, M.Tech/PhD special handling beyond basic degree matching.

### C2. Routes (behind `PATHWAYS_ENABLED`)
`/tools/pathways` (Radar), `/tools/pathways/program/:id`, `/tools/pathways/plan`, `/tools/pathways/offers`, `/tools/pathways/about-data`.

### C3. M1 Eligibility Radar (+ CGPA Gap Calculator)
**Inputs (budget 3):** branch (searchable chips: CSE, IT, ECE, EEE, Mechanical, Civil, Other with search through the alias registry), batch year (chips computed from `asOf`: current year to +3), CGPA (numeric, `inputmode="decimal"`, scale selector default "out of 10").
**Upgrades (optional, each shows the live count it would settle):** 10th %, 12th % (or diploma), aggregate %, active backlogs, backlog history, gap months, degree.
**Engine contract:** for each program return `status` (`meets | check | fails | unknown`), a per-criterion table with `state` (`pass | fail | needs_input | unit_mismatch | ambiguous | not_published`), evidence refs, and `blockingInputs` (which missing inputs keep it at `check`).
**Aggregation:** any stated criterion `fail` gives `fails`. Else any `needs_input`, `unit_mismatch` or `ambiguous` gives `check`. Else if the program publishes no criteria at all, `unknown`. Else `meets`, with a caveat chip "No academic cutoff published" when applicable.
**UI:** results appear instantly in four groups with counts; each row has name, status chip (icon + text), "Why" expand showing the criterion table with evidence chips, and a link to the program page. An upgrade row reads, for example, "Add 12th % to settle 6 programs" (the number is computed by the engine from `blockingInputs`). Filters: status, search. Empty states for each group.
**CGPA Gap Calculator:** inputs current CGPA, completed semesters `n`, total semesters `N` (default 8, editable), target threshold `T` from a program's stated `cgpaMin` (scale 10 only). Required average for remaining semesters `R = (T*N - C*n) / (N - n)` under an equal-credit-weight assumption (shown). If `N == n`, say no semesters remain; if `R > 10`, say it is not reachable under equal weights. Always state "Your university's formula may weight credits differently."

### C4. M2 Program page
Official name, link to the official page (`rel="noopener noreferrer"`), last checked date, evidence chip. Sections: Eligibility table (with "Not published" where relevant); Selection stages (names from L1; platform or duration only if stated; an optional L2 "What to expect" note labelled editorial/draft); Readiness (see C6); "Evaluate an offer from this program" link; "Report an error" link.

### C5. M3 Action Plan
**Inputs (budget 3):** target (a program, or one of three target types: direct campus, off-campus via online tests and contests, services-first bridge), pace (Relaxed / Standard / Intense; the multipliers are editable assumptions), current semester (from profile).
**Output:** prioritised task list generated from rules, in this order: (1) eligibility blockers (missing inputs from `blockingInputs`; failing criteria with the CGPA gap result; backlog clearing with "check your college's supplementary exam schedule"); (2) top 2 to 3 readiness gaps from the latest local Roaster/TalentLens trace (deep links); (3) process-prep tasks derived from the stage types a program states, mapped to editorial prep categories (no external course or resource endorsements). Each task has an effort range from the assumptions registry. Show lanes for the chosen target type with `min/likely/max` week ranges. A visible assumptions panel; a "Draft assumptions in use" banner whenever any used assumption has `status: draft`. No calendar dates are promised; ranges are relative ("weeks from now").

### C6. M4 Readiness Link
Reads the latest local Roaster/TalentLens trace through the existing storage helpers (no changes to those tools). An editorial archetype-to-program map (`status: draft`). Shows the top 2 to 3 gaps using existing explanation text. Never recomputes a score. If no trace exists: "Scan your resume to unlock this."

### C7. M5 Offer Evaluator (the most verifiable module)
**Inputs (budget 3 for first result):** fixed pay (annual), variable pay target (annual), joining bonus.
**Step 2 "From your offer letter" (optional):** basic pay, HRA, special/other allowances, whether employer PF is inside the fixed amount (and the amount), whether gratuity is inside it (and the amount), employer-paid insurance, other employer-paid items.
**Step 3 "Contract terms" (optional):** bond months and amount (and whether pro-rata), joining-bonus clawback months and percent, notice period (info), joining month, tax regime (new default; old with a user-entered total deductions figure), PF mode (on actual basic / on the wage ceiling / none), professional tax (user-entered annual), other monthly deductions, ESOP grant (value or units), vesting schedule (4 years with a 1-year cliff preset, or custom percentages from the letter), ESOP value scenarios (user-entered; no default valuations).
**Outputs:**
- *Pay breakdown:* CTC decomposition; gross cash per month; what is paid by the employer but not received as cash (employer PF, gratuity provision, insurance) shown separately.
- *Monthly in-hand estimate:* gross cash minus employee PF, professional tax, income-tax estimate, other deductions. PF is shown as "saved for you", not "lost". Variable shown as three scenarios (0%, 50%, 100% payout) unless the user sets one.
- *First financial year view:* months employed in the first financial year (April to March) drive a partial-year tax estimate; show how it differs from a full year, only through rules traced to ledger rows.
- *Exposure timeline (months 0 to 36):* money at stake if the student leaves in month `m`: bond (full or pro-rata as the offer states) plus joining-bonus clawback. Chart plus table.
- *ESOP:* vesting percentage by month and a value range from the user's scenarios (no tax computed; say so).
- *Red flags* (rules in the assumptions registry, thresholds draft and user-adjustable): variable share of cash high; bond exposure at month 6 as a share of year-one cash; joining-bonus clawback longer than 12 months or 100%; basic pay below half of fixed pay (with the sourced wage-definition rule: "ask how wages are defined under the new labour codes"); any money component left unspecified; ESOP with no vesting terms.
- *Questions to ask HR:* a rule-based checklist generated from the optional fields left empty or flagged (for example "Is gratuity included in the CTC?", "Is the variable pay guaranteed or performance-linked?", "Is the joining bonus subject to clawback, and for how long?").
- *Compare up to 3 offers side by side:* first-year cash, steady-state monthly in-hand, exposure at months 6 and 12, ESOP range, flags. The comparison is order-independent.
**Bond note (fixed text):** "Courts in India have treated reasonable service bonds as enforceable. Whether yours is reasonable is a legal question. This tool shows the money at stake, not legal advice." Add a link to an official judgment page only if you find one on an official government/court domain; otherwise omit the link and use only this text.

### C8. M6 Data & Method page
Generated from the data files: counts by evidence kind; list of programs shipped; quarantine count; the rules used in the Offer Evaluator with their tax-year/effective labels and source links; the assumptions table (draft/reviewed, reviewer category, date); known limitations; spec/engine/data versions and the data content hash; "Report an error".
**Known limitations (fixed, always shown):** college tier, referrals, online-test results and drive-specific changes are not modelled; programs change criteria by drive and batch; tax and statutory rules change and are shown with their tax-year label; estimates are not tax or legal advice; the planner uses draft assumptions until reviewed.

### C9. Corrections flow (no backend)
`.github/ISSUE_TEMPLATE/pathways-correction.yml` (program, field, current value, proposed value, official URL, date seen) when the repo has a GitHub remote. `npm run pathways:apply-correction <file>` turns an accepted correction into a candidate ledger row that must pass the fetch-log and snippet checks like any other row. The maintainer reviews and commits. Add `npm run pathways:refresh-plan` (lists subjects older than 180 days) and `pathways:diff` (shows changed ledger rows between two commits).

### C10. Local feedback
A local-only "Was this useful?" tap per module, stored under `:feedback`, with an export button that copies the JSON (for the user's moderated sessions). No transmission.

### C11. Microcopy rules
Short, plain English. Never "you will". Examples: "Meets published criteria", "Check these details: add your 12th % to settle this", "No criteria published for this program", "Not published". Errors say what to do next.

### C12. Edge cases to cover in fixtures
Lateral entry or diploma (no 12th); CGPA scale other than 10; percentage-only programs; M.Tech/MCA basics; branch aliases (ECE/EEE/E&TC); gap months; active backlog versus cleared backlog; program lists several batch years; program page states only "all branches"; student batch not listed; CGPA exactly at the threshold; zero variable pay; no bond; bond longer than 36 months; joining in March versus October; joining-bonus larger than a month's pay; ESOP with no schedule.

---

## C13. ASCII Wireframes at 390px (Mobile-First)

### Wireframe 1: Eligibility Radar (`/tools/pathways`)
```text
+---------------------------------------+
| Pathways: Eligibility Radar     [?]   |
| Stays in your browser. Never uploaded.|
+---------------------------------------+
| 1. Your Branch                        |
| [CSE*] [IT] [ECE] [EEE] [Mech] [Civil]|
| [+ Other branch search...           ] |
|                                       |
| 2. Batch (Passing Out)                |
| [2026] [2027*] [2028] [2029]          |
|                                       |
| 3. Current CGPA                       |
| [ 8.24 ]  Scale: [10 / 10 v]          |
+---------------------------------------+
|  ⚡ Instant First Results (3 Inputs)  |
|  Meets: 12 | Check: 8 | Fails: 4     |
+---------------------------------------+
| [+] UPGRADE: Add 12th % to settle     |
|     6 programs at "Check"             |
+---------------------------------------+
| ▼ MEETS PUBLISHED CRITERIA (12)       |
| ------------------------------------- |
| • TCS Ninja Campus Hiring             |
|   [✓ Meets Criteria] [Why v] [Open ↗] |
|   └── Min CGPA: 6.0 (You: 8.24) [Pass]|
|       Branch: CSE [Pass]              |
| • Infosys Systems Engineer            |
|   [✓ Meets Criteria] [Why v] [Open ↗] |
+---------------------------------------+
| ► CHECK THESE DETAILS (8)             |
| • Wipro Elite NLTH                    |
|   [? Needs 12th %] [Why v]            |
+---------------------------------------+
| ► DOES NOT MEET A CRITERION (4)       |
+---------------------------------------+
| ► NO CRITERIA PUBLISHED (2)           |
+---------------------------------------+
| CGPA GAP CALCULATOR                   |
| Target: TCS Prime (Min 7.50)          |
| Current: 7.10 | Sem 5 of 8            |
| Req. Avg in Sems 6-8: 8.17 / 10       |
| "Assumes equal credit weight per sem" |
+---------------------------------------+
| Footer: HireFlow is not affiliated... |
| [Copy summary] [Print] [Clear my data]|
+---------------------------------------+
```

### Wireframe 2: Program Detail (`/tools/pathways/program/:id`)
```text
+---------------------------------------+
| < Back to Radar      Report Error [↗] |
| TCS Ninja Campus Hiring               |
| Tata Consultancy Services             |
| Sourced from official portal [Official|
| Checked: 2026-10-15                   |
+---------------------------------------+
| PUBLISHED ELIGIBILITY                 |
| • CGPA Minimum: 6.0 / 10              |
| • Class X Min: 60.0%                  |
| • Class XII Min: 60.0%                |
| • Max Active Backlogs: 1 at test      |
| • Max Academic Gap: 24 months         |
| • Eligible Branches: CSE, IT, ECE...  |
| • Degrees: B.Tech, B.E., MCA, M.Tech  |
| • Bond Terms: Not published           |
+---------------------------------------+
| SELECTION STAGES (Published)          |
| 1. Online Test (Cognitive & Technical)|
| 2. Technical Interview                |
| 3. HR / Management Interview          |
| Note: Editorial prep roadmap draft.   |
+---------------------------------------+
| READINESS                             |
| Scan your resume in Roaster to see    |
| your match and gap analysis.          |
+---------------------------------------+
| [ Evaluate an Offer from This Program]|
| [ Visit Official Portal ↗ ]           |
+---------------------------------------+
```

### Wireframe 3: Action Plan (`/tools/pathways/plan`)
```text
+---------------------------------------+
| Action Plan: Engineering Career Path  |
| Stays in your browser. Never uploaded.|
+---------------------------------------+
| 1. Target Program or Type             |
| [ Direct Campus Hiring           v ]  |
|                                       |
| 2. Preparation Pace                   |
| ( ) Relaxed  (*) Standard  ( ) Intense|
| Multiplier: 1.0x (Standard)           |
|                                       |
| 3. Current Semester                   |
| [ Semester 6                     v ]  |
+---------------------------------------+
| [!] DRAFT ASSUMPTIONS IN USE          |
| Task timelines are editorial draft    |
| estimates. Click to view rationale.   |
+---------------------------------------+
| YOUR PRIORITISED ROADMAP              |
| ───────────────────────────────────── |
| Phase 1: Eligibility Blockers (W1–W3) |
| [ ] Clear 1 active backlog before test|
|     Check college supplementary dates |
| [ ] Target CGPA Gap: needs 7.80/sem   |
|                                       |
| Phase 2: Readiness Gaps (W4–W8)       |
| [ ] System Design Fundamentals        |
|     From Roaster trace: Missing Proof |
| [ ] SQL & Database Indexes            |
|                                       |
| Phase 3: Process Prep (W8–W12)        |
| [ ] Timed Cognitive Aptitude Tests    |
| [ ] Live Technical Interview Practice |
+---------------------------------------+
| [Assumptions Panel] [Copy Plan]       |
+---------------------------------------+
```

### Wireframe 4: Offer Evaluator (`/tools/pathways/offers`)
```text
+---------------------------------------+
| Offer Evaluator & Take-Home Simulator |
| Stays in your browser. Never uploaded.|
+---------------------------------------+
| 3-INPUT FAST ESTIMATE:                |
| Annual Fixed Pay:   [ ₹ 7,00,000    ] |
| Variable Target:    [ ₹ 1,00,000    ] |
| Joining Bonus:      [ ₹   50,000    ] |
|                                       |
| Monthly In-Hand Estimate:             |
| ₹ 51,250 / mo (at 100% variable)      |
| ₹ 46,250 / mo (at 50% variable)       |
| ₹ 41,250 / mo (at 0% variable)        |
| "Estimate based on numbers entered.   |
|  Not tax or legal advice."            |
+---------------------------------------+
| [+] STEP 2: FROM YOUR OFFER LETTER    |
| Basic Pay:        [ ₹ 25,000 / mo   ] |
| Employer PF:      [*] Inside Fixed    |
| Gratuity Prov.:   [*] Inside Fixed    |
|                                       |
| [+] STEP 3: CONTRACT & EXIT TERMS     |
| Service Bond:     ₹ 2,00,000 for 24 mo|
| Clawback:         100% if < 12 mo     |
| Tax Regime:       [ New Regime (26-27)]
+---------------------------------------+
| EXIT EXPOSURE TIMELINE (Month 0–36)   |
| Month  6: ₹ 2,50,000 at stake (35%)   |
| Month 12: ₹ 1,50,000 at stake (18%)   |
| Month 24: ₹        0 at stake (0%)    |
| Note: Service bond enforceable if     |
| reasonable. Shows money at stake.     |
+---------------------------------------+
| RED FLAGS & HR QUESTIONS (3 Found)    |
| [!] Basic pay is < 50% of CTC.        |
|     -> "Ask how wages are defined"    |
| [!] Gratuity deducted from fixed pay. |
|     -> "Ask if gratuity is pre-funded"|
+---------------------------------------+
| [Compare With Another Offer (+)]      |
+---------------------------------------+
```

### Wireframe 5: Data & Method (`/tools/pathways/about-data`)
```text
+---------------------------------------+
| Pathways: Data & Methodology          |
+---------------------------------------+
| DATA PROVENANCE CENSUS                |
| • Official Portals:       45 facts    |
| • Company-Published:      38 facts    |
| • Government Statutes:    14 rules    |
| • Quarantined Subjects:    3 programs |
| Content Hash: sha256:7f49a8b1...      |
+---------------------------------------+
| STATUTORY RULES USED                  |
| • Income Tax Slabs (New Regime FY 26) |
|   Source: incometax.gov.in            |
| • Standard Deduction: ₹75,000         |
| • Rebate u/s 87A: Up to ₹12 Lakh      |
| • EPF Ceiling & Rate: 12% on ₹15,000  |
|   Source: epfindia.gov.in             |
+---------------------------------------+
| EDITORIAL ASSUMPTIONS REGISTER        |
| • A-PLAN-APT-WEEKS (Draft, 4-12 wks)  |
| • A-OFFER-BOND-ALERT (Draft, 30%)     |
| Human review required before launch.  |
+---------------------------------------+
| KNOWN LIMITATIONS (Always Shown)      |
| • College tier and referrals not model|
| • Programs change criteria per batch  |
| • Not tax or legal advice             |
| [Report an Error / Submit Correction] |
+---------------------------------------+
```

---

## C14. Microcopy Dictionary & Guardrails

| Context | Approved Copy | Strictly Banned Words / Phrasing | Rationale |
| :--- | :--- | :--- | :--- |
| Eligibility Status: Pass | "Meets published criteria" | "Eligible", "Qualified", "Guaranteed interview" | Sourced from recorded page cutoffs; never guarantees college drive selection. |
| Eligibility Status: Missing Input | "Check these details: add your 12th % to settle this" | "Ineligible", "Pending verification" | Neutral, instructs the user on what action resolves the ambiguity. |
| Eligibility Status: Fail | "Does not meet a published criterion" | "Rejected", "Disqualified", "Failed" | Factual evaluation of published criteria, not a hiring decision. |
| Eligibility Status: No Data | "No criteria published for this program" | "Unverified", "Unknown company" | Honest acknowledgement of absence of official disclosure. |
| Offer Money Estimates | "Estimate based on the numbers you entered and the rules shown. Not tax or legal advice." | "Accurate salary", "Guaranteed in-hand", "Your exact tax" | Complies with B1/B6. Computes arithmetic on user inputs only. |
| Service Bonds | "Courts in India have treated reasonable service bonds as enforceable. Whether yours is reasonable is a legal question. This tool shows the money at stake, not legal advice." | "Bonds are illegal", "Bond is null and void", "You won't have to pay" | Indian Supreme Court jurisprudence upholds reasonable liquidated damages. |
| Privacy Line | "Stays in your browser. Never uploaded." | "100% secure server", "Cloud encrypted" | Zero runtime egress guarantee; local storage only. |
| Empty Results | "No programs match your current filter. Try selecting 'All' or clearing search." | "No companies found for you", "You have no matches" | Clean, actionable, non-condescending state. |

---

## C15. Fixture Matrix

### Part 1: 20 Student Profiles (Covering C12 Edge Cases)

1. `P-01-STANDARD-CSE`: B.Tech CSE, 2027 batch, CGPA 8.2/10, 10th 88%, 12th 85%, 0 backlogs, 0 gap months. (Baseline standard pass).
2. `P-02-DIPLOMA-LATERAL`: B.Tech Mech, 2026 batch, CGPA 7.5/10, 10th 80%, 12th `null` (Diploma 82%), 0 backlogs. (Lateral entry without 12th grade).
3. `P-03-SCALE-4`: B.Tech IT, 2026 batch, CGPA 3.4/4.0 (scale 4), 10th 75%, 12th 72%. (Scale mismatch detection per E4).
4. `P-04-PERCENTAGE-ONLY`: B.E. ECE, 2026 batch, Aggregate 68.5% (no CGPA issued by university), 10th 70%, 12th 65%. (Percentage aggregate handling).
5. `P-05-MCA-FRESHER`: MCA, 2026 batch, CGPA 7.8/10, BCA aggregate 72%, 10th 65%, 12th 68%. (Postgraduate non-B.Tech degree).
6. `P-06-MTECH-FRESHER`: M.Tech CSE, 2026 batch, CGPA 8.5/10, B.Tech 76%, 0 backlogs. (M.Tech campus eligibility).
7. `P-07-ALIAS-ENTC`: B.Tech "Electronics & Telecommunication" (E&TC alias for ECE), 2027 batch, CGPA 7.2/10. (Branch alias normalization).
8. `P-08-GAP-24MO`: B.Tech Civil, 2026 batch, CGPA 6.8/10, 24 months academic gap between 12th and college. (Max gap boundary test).
9. `P-09-GAP-36MO`: B.Tech CSE, 2026 batch, CGPA 7.0/10, 36 months academic gap. (Gap threshold failure).
10. `P-10-ACTIVE-BACKLOG-1`: B.Tech EEE, 2026 batch, CGPA 6.4/10, 1 active backlog, 1 cleared backlog. (Active backlog limit test).
11. `P-11-CLEARED-BACKLOGS-3`: B.Tech CSE, 2027 batch, CGPA 7.1/10, 0 active backlogs, 3 cleared historic backlogs. (Backlog history rule).
12. `P-12-EXACT-THRESHOLD`: B.Tech CSE, 2026 batch, CGPA 6.00/10, 10th 60.00%, 12th 60.00%. (Exact boundary threshold test).
13. `P-13-JUST-BELOW-THRESHOLD`: B.Tech CSE, 2026 batch, CGPA 5.99/10. (Boundary fail test, no floating point slip).
14. `P-14-BATCH-UNLISTED`: B.Tech CSE, 2024 batch (2 years pass-out). (Graduation year out of fresher drive scope).
15. `P-15-ALL-BRANCHES-PROGRAM`: B.Tech BioTech, 2026 batch, CGPA 7.5/10, applying to "All branches" drive. (Open branch matching).
16. `P-16-RESTRICTED-BRANCH`: B.Tech Chemical, 2026 batch, applying to "Circuit branches only" (CSE/IT/ECE). (Branch rejection).
17. `P-17-BUDGET-MINIMAL`: B.Tech IT, 2027 batch, CGPA 7.4/10. (3 inputs only, optional upgrades unprovided -> `check` states).
18. `P-18-NO-CUTOFF-PROGRAM`: B.Tech CSE, 2026 batch, applying to program with 0 published academic cutoffs. (`unknown` status with caveat chip).
19. `P-19-HIGH-BACKLOGS`: B.Tech Mechanical, 2026 batch, CGPA 6.2/10, 4 active backlogs. (Clear multiple-criterion fail).
20. `P-20-PERFECT-SCORE`: B.Tech CSE, 2026 batch, CGPA 10.0/10, 10th 99%, 12th 98%, 0 backlogs. (Clean universal pass).

---

### Part 2: 8 Offer Scenarios (Illustrative Fixtures — Not Real Offers)

> [!NOTE]
> All figures below are illustrative synthetic test fixtures created to verify arithmetic boundary conditions. They do not represent real employer offers.

1. **`OFFER-01-MASS-SERVICES`**:
   - Fixed CTC: ₹3,60,000 | Variable: ₹0 | Joining Bonus: ₹0
   - Basic: ₹15,000/mo (₹1,80,000/yr) | Employer PF: Inside CTC (12% on basic = ₹21,600)
   - Gratuity provision: Inside CTC (₹8,654) | Statutory Insurance: ₹3,746
   - Terms: Service bond ₹1,00,000 for 24 months | Joining: July | Regime: New.
   - Purpose: Validates mass IT services fixed salary decomposition where employer deductions reduce gross cash.

2. **`OFFER-02-PREMIUM-SERVICES`**:
   - Fixed CTC: ₹9,00,000 | Variable: ₹1,00,000 | Joining Bonus: ₹50,000
   - Basic: ₹37,500/mo (₹4,50,000/yr = 50% of fixed) | Employer PF: Inside CTC
   - Terms: No service bond | 12-month clawback on bonus | Regime: New.
   - Purpose: Tests 50% basic wage compliance rule and variable pay 3-scenario projections.

3. **`OFFER-03-GCC-PRODUCT-VARIABLE`**:
   - Fixed CTC: ₹16,00,000 | Variable Target: ₹4,00,000 (20% of CTC) | Joining Bonus: ₹2,00,000
   - Basic: ₹65,000/mo | HRA: ₹32,500/mo | Special Allowance: ₹35,833/mo
   - Terms: High variable share (>20%) flags red flag warning | Regime: New.
   - Purpose: Validates high-variable percentage red-flag triggers and partial-year tax bracket jump.

4. **`OFFER-04-STARTUP-ESOP`**:
   - Fixed CTC: ₹12,00,000 | Variable: ₹0 | Joining Bonus: ₹1,00,000
   - ESOP: ₹8,00,000 grant value (1000 units) | Vesting: 4 years with 1-year cliff (25% per yr)
   - Terms: ESOP scenario valuations ₹1x, ₹3x, ₹5x entered by user (no tax computed per B1).
   - Purpose: Validates 48-month vesting schedule derivation and zero-tax disclaimer.

5. **`OFFER-05-BONUS-CLAWBACK`**:
   - Fixed CTC: ₹6,00,000 | Variable: ₹0 | Joining Bonus: ₹1,50,000 (25% of annual pay)
   - Terms: 100% clawback if leaving before 24 months.
   - Purpose: Triggers clawback > 12 month red flag and tests month 0-36 net cash exposure.

6. **`OFFER-06-LONG-BOND`**:
   - Fixed CTC: ₹4,50,000 | Variable: ₹50,000 | Joining Bonus: ₹0
   - Terms: Service bond ₹3,00,000 for 36 months (pro-rata).
   - Purpose: Tests pro-rata exposure formula `RemainingMonths / TotalMonths * BondAmount` and bond > 30% first year cash flag.

7. **`OFFER-07-MARCH-JOINER`**:
   - Fixed CTC: ₹8,00,000 | Joining Month: March (Month 12 of Indian Financial Year).
   - Terms: Only 1 month worked in FY 1 -> Gross FY1 income ₹66,667 (below taxable threshold).
   - Purpose: Validates partial-year tax calculation against full-year tax projection.

8. **`OFFER-08-OCTOBER-JOINER`**:
   - Fixed CTC: ₹10,00,000 | Joining Month: October (6 months in FY 1).
   - Terms: 6 months worked in FY 1 -> Gross FY1 income ₹5,00,000 (qualifies for 87A rebate).
   - Purpose: Demonstrates marginal difference between partial FY take-home and full steady-state FY take-home.
