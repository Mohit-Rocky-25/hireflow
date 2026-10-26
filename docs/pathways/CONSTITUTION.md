# PATHWAYS CONSTITUTION

### B1. Product principle
Pathways informs, estimates and simulates. It does not verify, guarantee, certify, rank employers, predict hiring outcomes, or give tax or legal advice. Everything shown is exactly one of: a sourced **fact**, a labelled **assumption**, or **arithmetic on the student's own inputs**.

### B2. Three layers that never mix
- **L1 FACTS.** Eligibility criteria, program names, stage names, tax/PF/labour rules. Written only by the generator from the evidence ledger. Every fact carries evidence `{sourceKind, url, retrievedAt, snippet}`.
- **L2 MODELS.** Timelines, task effort ranges, archetype mapping, red-flag thresholds. Live in `src/pathways/models`. Every entry: `kind: "editorial"`, visible rationale, `status: "draft" | "reviewed"` (reviewed only when a human sets `reviewerCategory` and `reviewedAt`), and is editable by the user in the UI where it affects results.
- **L3 SCENARIO.** The student's own inputs. Stored locally only.

### B3. Engine rules
- E1. Engines are pure deterministic functions. No randomness, no `Date.now()`; pass `asOf` explicitly.
- E2. Every output carries a **Trace**: inputs used, rules applied, evidence refs, assumptions used (with draft/reviewed state), and a list of unknowns.
- E3. Unknown stays unknown. A missing fact is never defaulted to a pass.
- E4. Never convert CGPA to percentage or the reverse. A unit mismatch means the criterion is `unit_mismatch` and the program is `check`.
- E5. Plans and projections are ranges (`min / likely / max`), never a single point.
- E6. UI components do no scoring and no arithmetic on result fields. Add `npm run check:ui-math`, which fails on arithmetic on result fields inside components.
- E7. Money is integer rupees internally. Rounding happens only at display, half-up, documented. Display uses Indian grouping (lakh/crore) and an LPA helper; both are unit-tested.
- E8. **Input budget.** Each module gives a useful first result from at most 3 user inputs. Extra inputs are optional, clearly rewarded upgrades whose benefit is computed live from the engine (never hard-coded text such as "narrows to 9").
- E9. Remember everything locally; never ask for the same input twice. At every input point show: "Stays in your browser. Never uploaded."
- E10. Engines never throw on bad input: they return a structured `needs_input` or `invalid` result.

### B4. Data honesty rules (non-negotiable)
- H1. **Ledger first.** Facts enter only as ledger rows. Generated files (`src/pathways/facts/*.generated.ts`) are written ONLY by `npm run pathways:build` and carry a content-hash header. A test fails if one is hand-edited.
- H2. **Closed field list.** Program rows: `officialName, programName, programPageUrl, eligibility.cgpaMin, eligibility.cgpaScale, eligibility.percentAggregateMin, eligibility.percent10Min, eligibility.percent12Min, eligibility.maxActiveBacklogs, eligibility.backlogHistoryRule, eligibility.maxGapMonths, eligibility.branches, eligibility.degrees, eligibility.batchYears, stage.name, stage.type (only if stated), bondMonths, bondAmount, stipend` (the last three only if an official page states them). Rule rows (government): income-tax slab bounds and rates per regime, standard deduction, rebate rule (including any marginal-relief rule), cess rate, PF employee rate, PF wage ceiling, wage-definition rule (basic/wage share) and its effective date, each with the tax-year or effective label exactly as the page states it. Anything else is rejected by the validator.
- H3. **Row format:** `{rowId, subjectId, field, value, unit, sourceKind: "official" | "company-published", publisherType: "company" | "government", url, retrievedAt (ISO), snippet (an exact copy of AT MOST 15 words from the page), extractedBy: "ai"}`.
- H4. **Fetch log and cache.** Every page you open is appended to `fetch-log.jsonl {url, httpStatus, timestamp, subjectId}`. Save the page's visible text (HTML, JS-rendered text via browser, or PDF text extraction) to `.evidence-cache/<hash>.txt`. A ledger URL with no fetch-log entry of status 200 is rejected. A snippet not found (whitespace and case normalised) in the cached text of its URL is rejected. These are script checks, not your judgement.
- H5. **Source allowlist.** Company subjects: official company domains (record them per subject in Stage S3/S4). Government rules: official government domains; record the exact domains you observe (likely candidates to look for: `incometax.gov.in`, `epfindia.gov.in`, `labour.gov.in`, `pib.gov.in`, `indiacode.nic.in`). Banned as sources: Glassdoor, AmbitionBox, LinkedIn, Naukri, PrepInsta, FACE Prep, Levels.fyi, news sites, blogs, aggregators, Wikipedia, calculators, law-firm blogs, bank/lender blogs.
- H6. **Fetch etiquette.** Honest user agent; respect robots.txt and site terms; at most 1 request per 2 seconds per domain; at most 6 pages per subject; stop on HTTP 429/403 and quarantine; never bypass a login, captcha or paywall; no bulk crawling.
- H7. **Null is a good answer.** No completeness quotas or fill-rate targets. "Not found on an official page" means no row; the UI says "Not published".
- H8. **No imputation.** Never derive a value from category, peers or "typical" practice; never convert or round; never write `typical, approximately, around, estimated, about, expected` inside a fact value.
- H9. **Quarantine.** A subject whose official page cannot be found, or whose page does not state it is an India early-career program, ships nothing.
- H10. **Blind re-extraction.** After each batch, for every numeric/eligibility row, re-read the cached page WITHOUT looking at the ledger value, extract again, compare. Disagreement or unresolved: drop the row and log it. This is an AI self-check, not independent verification; never call it verification in code, UI or docs. The user's spot-check is the real check.
- H11. **Canaries (tests).** (a) Three invented programs ("Zorblax Systems Campus Hiring", "Quenmark Robotics Graduate Program", "Hyphenvale Labs Fresher Drive") run through the pipeline against mock page fixtures must end quarantined with zero rows. (b) Mock programs whose page states no criteria must evaluate to `unknown`, never `meets`.
- H12. **Auto-halt.** Stop and report if: blind-check disagreement exceeds 5% of checked rows in a batch; any canary fails; any row fails the fetch-log or snippet check twice; a generated file differs from regeneration; a previously passing test cannot be fixed in 3 attempts.

### B5. Scope and safety
- Write new code only in `src/pathways/` and `docs/pathways/`, plus the minimum route/hub registration behind the feature flag `PATHWAYS_ENABLED` (default off).
- Do NOT modify or delete `careers-core`, `careerLadders`, or `src/features/suite/integration/trajectory.ts` (other tools may depend on them). Do NOT touch other tools, existing localStorage keys, or scoring engines. Existing tests stay green; record any expectation change with the reason.
- Zero runtime network egress; no new runtime dependencies. Only stages S3, S4 and S5 use the browser. Build-time scripts read local files only.
- No logos or brand assets. Never copy company or government text beyond 15-word snippets; write in your own words. Footer on every screen: "HireFlow is not affiliated with or endorsed by any company named. Names are used only to identify employers; trademarks belong to their owners."

### B6. Words and tone
- Banned in UI, data, docs and test names: `verified, guaranteed, proven, predicted, accurate, certified, "you will get", "best company"`, and any ranking of employers. (The Constitution, Spec and the banned-words config itself are exempt from the lint.) Add a render-time lint over every new screen.
- Eligibility labels are: **Meets published criteria / Check these details / Does not meet a published criterion / No criteria published.** Never "Eligible", never "Rejected".
- Money results always carry: "Estimate based on the numbers you entered and the rules shown. Not tax or legal advice."

### B7. Privacy
Local storage keys (all new): `hireflow:v4:pathways:profile`, `:offers`, `:plan`, `:feedback`. A visible "Clear my data" action. No analytics. Sharing is a local "Copy summary" text and a print view only.

### B8. Quality budgets
Mobile-first (verify at 390px). Touch targets at least 44px. Body text 16px, nothing below 12px. WCAG AA contrast using existing design tokens only (no hardcoded colours). Full keyboard access, visible focus, `aria-live` for result-count changes, meaning never conveyed by colour alone, honour reduced-motion. New routes lazy-loaded; report bundle sizes but invent no budget numbers.
