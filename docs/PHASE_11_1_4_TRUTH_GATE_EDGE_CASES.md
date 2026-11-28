# Phase 11.1.4 — Truth Gate Edge Cases & Epistemic Separation

## Scope
Audit of `src/features/tailor/engine/intelligencePipeline.ts` and `src/lib/tailor/engine/truthGate.ts` via `tests/phase11_1_4ReleaseCandidate.test.ts` and `tests/phase11_1_3IntegrityGate.test.ts`.

---

## 1. Edge Cases Tested & Blocked (`0` False Acceptances)

| Edge Case | Example Tested | Enforcement Mechanism | Status |
|---|---|---|---|
| Month-level date alteration | `Jan 2022 - Present` -> `Dec 2022 - Present` | `validateBeforeFinalize` strict normalized `dateRange` check on `experience`/`education` (`val_entry_date_*`) | **Blocked** |
| `Present` substitution | `Jun 2020 - Aug 2020` -> `Jun 2020 - Present` | Strict normalized `dateRange` grounding | **Blocked** |
| Reversed date range | `Jan 2024 - Jan 2021` | Chronological year check (`val_entry_date_rev_*`) | **Blocked** |
| Degree specialization change | `B.S. in Computer Science` -> `B.S. in Aerospace Engineering` | Non-baseline `education` title check (`val_entry_title_*`) | **Blocked** |
| Internship-to-employment escalation | `Software Engineering Intern` -> `Software Engineer` | `baselineExperienceInternTitles` escalation check (`val_entry_intern_escalation_*`) | **Blocked** |
| Lateral role swap | `Software Engineer` -> `DevOps Engineer` | Non-baseline `experience` title check (`val_entry_title_*`) | **Blocked** |
| Indirect client, commercial & completion claims | `Shipped to production for 15 enterprise clients improving EBITDA` | `CLIENT_CUSTOMER_REGEX`, `BUSINESS_RESULT_REGEX`, `COMPLETION_CLAIMS_REGEX` | **Blocked** |
| Unknown / ungrounded proposal | `Owned Kubernetes cluster architecture for 20+ banking accounts` | `verifySingleProposalTruth` (`passed: false`, explicit issues returned) | **Flagged Unsupported** |

---

## 2. Supported Paraphrases & Epistemic Provenance Separation
- **Supported paraphrase accepted:** `"Built billing REST APIs in TypeScript and PostgreSQL handling 8,000 daily requests"` -> `"Developed TypeScript and PostgreSQL billing REST services handling 8,000 daily requests"` passes `verifySingleProposalTruth` (`passed: true`).
- **Epistemic separation preserved:** `source-supported` (`AtomicClaim`), `supported_paraphrase` (`TailorSuggestion`), `user-attested (note only)` (`UserConfirmedEvidenceRecord` / `TailorIntelligencePanel`), and `unsupported` (`truthGatePassed: false`, `blockingIssues`) remain distinct across editing, saving, `commitTailoredVersion`, and exports.
- **Boundary:** Deterministic regex, date-token, taxonomy, and metric checks do not constitute universal natural-language semantic factuality; novel unpatterned phrasing relies on candidate review.
