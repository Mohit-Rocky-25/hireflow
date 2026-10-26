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
