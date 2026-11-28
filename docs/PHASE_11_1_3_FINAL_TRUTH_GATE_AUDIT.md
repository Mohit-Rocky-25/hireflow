# Phase 11.1.3 — Final Truth Gate & Extended Factuality Audit

## Scope
Independent audit and hardening of `detectEntityAndScopeViolations`, `verifySingleProposalTruth`, and `validateBeforeFinalize` in `src/features/tailor/engine/intelligencePipeline.ts` (alongside `src/lib/tailor/engine/truthGate.ts`).

---

## 1. Release-Blocking Gaps Found & Remediated in Phase 11.1.3
During code inspection of `intelligencePipeline.ts`:
1. **Altered employment & education dates (`entry.dateRange`)** were not checked in `validateBeforeFinalize`. Fixed by validating `entry.dateRange` years against `allowedCorpusLower` (`val_entry_date_*`).
2. **Altered non-baseline `entry.title` in `education` and `experience`** (e.g., changing `B.S. Computer Science` to `Ph.D. in Distributed Systems`, or `Software Engineer` to `Product Manager`) only ran `SENIORITY_AND_LEADERSHIP_REGEX`, allowing lateral/degree title swaps. Fixed by enforcing baseline/confirmed title grounding for `education` and `experience` entries (`val_entry_title_*`).
3. **Fabricated client/customer claims, invented business outcomes (`ARR`/`MRR`/`EBITDA`/`revenue`/`ROI`), and unsupported production completion claims (`launched to production`, `shipped to production`)** were not matched in `detectEntityAndScopeViolations`. Fixed by adding `CLIENT_CUSTOMER_REGEX`, `BUSINESS_RESULT_REGEX`, and `COMPLETION_CLAIMS_REGEX`.

---

## 2. 16-Category Adversarial Factuality Coverage
Tested in `tests/phase11_1_3IntegrityGate.test.ts` (complementing the 10-archetype corpus in `tests/phase11_1_2RemediationAndCorpus.test.ts`):

| # | Claim Category | Validation Path | Result |
|---|---|---|---|
| 1 | Fabricated employers (`at Stripe`) | `detectEntityAndScopeViolations` (`EMPLOYER_PHRASE_REGEX`) | Blocked |
| 2 | Fabricated professional titles (`Product Manager`) | `validateBeforeFinalize` (`val_entry_title_*`) | Blocked |
| 3 | Inflated seniority (`Principal Staff Architect`) | `detectEntityAndScopeViolations` (`SENIORITY_AND_LEADERSHIP_REGEX`) | Blocked |
| 4 | Invented years of experience (`12+ years`) | `detectEntityAndScopeViolations` (`YEARS_OF_EXP_REGEX`) | Blocked |
| 5 | Unsupported leadership (`Engineering Manager & Tech Lead`) | `detectEntityAndScopeViolations` (`SENIORITY_AND_LEADERSHIP_REGEX`) | Blocked |
| 6 | Team ownership inflation (`team of 25 engineers`) | `detectEntityAndScopeViolations` (`TEAM_SIZE_REGEX`) | Blocked |
| 7 | Unverified compliance qualifications (`SOC 2 Compliance`) | `NON_TECH_CREDENTIALS_REGEX` + `validateBeforeFinalize` Skills check | Blocked |
| 8 | Unsupported technical skills (`Kubernetes`) | `validateBeforeFinalize` Skills / Bullet taxonomy check | Blocked |
| 9 | Unsupported domain skills (`Quantitative Equity Derivatives`) | `validateBeforeFinalize` raw non-taxonomy Skills check | Blocked |
| 10 | Altered education (`Ph.D. in Distributed Systems`) | `validateBeforeFinalize` (`val_entry_title_*` on `education`) | Blocked |
| 11 | Altered employment dates (`Jan 2015 - Present`) | `validateBeforeFinalize` (`val_entry_date_*`) | Blocked |
| 12 | Invented business results (`$18M ARR`) | `BUSINESS_RESULT_REGEX` + metric baseline check | Blocked |
| 13 | Contradictory metrics (`92%` vs source `25%`) | `truthGate.ts` `verifyFactualIntegrity` metric check | Blocked |
| 14 | Unsupported project completion (`Launched to production`) | `COMPLETION_CLAIMS_REGEX` + custom/new verb rank check | Blocked |
| 15 | Fabricated client/customer claims (`Fortune 500 enterprise clients`) | `CLIENT_CUSTOMER_REGEX` | Blocked |
| 16 | Unsupported custom-section content (`Leadership` -> `Architected global Kubernetes fleet`) | Custom bullet verb rank + skill check | Blocked |

- **Adversarial Metrics (`tests/phase11_1_3IntegrityGate.test.ts`):** `16 / 16` True Reject, `0` False Accept, `0` False Reject on clean resume & supported paraphrase (`verifySingleProposalTruth`).
- **10-Archetype Corpus (`tests/phase11_1_2RemediationAndCorpus.test.ts`):** `10 / 10` True Accept, `0` False Reject, `10 / 10` True Reject, `0` False Accept.

---

## 3. Epistemic Classification & Honest Scope Boundary
- **Provenance separation:** Source-extracted claims (`source-supported`), paraphrased proposals (`supported_paraphrase`), candidate-confirmed notes (`user-attested (note only)`), and unsupported claims (`unsupported` — blocked with explicit confirmation/review prompt) remain strictly separated.
- **Explicit limitation:** Deterministic regex/taxonomy/metric/title checks do not provide universal natural-language semantic factuality; novel unpatterned synonyms or subjective phrasing outside tracked categories remain advisory and rely on candidate review.
