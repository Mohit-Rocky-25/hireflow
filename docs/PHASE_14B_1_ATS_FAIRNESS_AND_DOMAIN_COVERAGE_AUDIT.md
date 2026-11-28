# HIREFLOW — PHASE 14B.1
# ATS RESUME ROASTER: SCORING FAIRNESS, DOMAIN COVERAGE & FINAL INTELLIGENCE VERIFICATION

**Date:** 2026-11-28  
**Branch / HEAD:** `main` @ `818c36b2` (all Phases 11–14B changes preserved uncommitted)  
**Final Acceptance Decision:** **`ATS FAIRNESS VERIFIED — READY FOR TALENTLENS`**

---

## 1. Executive Summary

Phase 14B.1 verified scoring fairness, penalty semantics, the dormant 64-point cap policy, JD input-state handling, professional domain coverage, cross-profile fairness, recommendation alignment, and Frozen V2 Benchmark preservation across ATS Resume Roaster V2.

Targeted, evidence-backed fairness improvements applied in this phase:
1. **`no_contact_info` Penalty Fairness ([scorer.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/scorer.ts#L375-L393)):** Omitting a phone number when a valid email is present no longer triggers `-5` (`no_contact_info`). Missing both email and phone triggers `-5`; missing email when phone is present triggers `-2`.
2. **Preferred-Only JD Semantics ([index.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/index.ts#L165-L195)):** JDs containing only preferred/nice-to-have skills (`mustTotalCount === 0`, `skillResults.length > 0`) no longer report `'Ready to apply'`; they cap at `'Apply after high-priority fixes'` or `'Significant gaps to address'` with an explicit preferred-only verdict.
3. **Frozen Benchmark Preservation:** Restoring `minWords = isFresher ? 140 : 250` preserves Frozen V2 Benchmark A (`90`, `96.5 - 7 = 89.5 -> 90`) and Benchmark B (`88`) intact; lowering the experienced `word_count_outlier` floor is documented as a future versioned scoring candidate.

---

## 2. Penalty Inventory and Fairness Findings

| Penalty ID | Trigger Condition | Deduction | Single-Accounted? | Fairness Assessment & Action |
| :--- | :--- | :---: | :---: | :--- |
| `no_contact_info` | `!email && !phone` (`-5`); `!email && phone` (`-2`) | `-5` / `-2` | Yes (deduped by `id` & `cause`) | **Improved:** Privacy-conscious omission of phone when email exists is no longer penalized (`0` pts). |
| `missing_<section>` | Missing standard section (`education/skills/projects` fresher; `experience/education/skills` experienced), skipped if inline edu exists | `-3` each | Yes | Fair structural hygiene; inline education fallback prevents false deductions. |
| `word_count_outlier` | `wordCount < (isFresher ? 140 : 250)` or `> 1200` | `-4` | Yes | Kept at `140 / 250` under `4.0.0-ats7d` to preserve Frozen Benchmark A (`90`). Future version candidate: lower experienced floor to `180` for concise 1-page resumes. |
| `keyword_stuffing` | Fresher: `>85%` unevidenced & `>=25` skills; Experienced: `>70%` unevidenced & `>=20` skills | `-4` to `-10` | Yes | Fair; protects legitimate coursework and foundational skill lists. |

---

## 3. 64-Point Cap Policy Decision (`caps.mustHavesBelow50PercentMaxScore`)

- **State Verified:** `caps.mustHavesBelow50PercentMaxScore: 64` was already removed from active `scoring-config.json` ambiguity in Phase 14B (`_capPolicyNote`).
- **Impact Analysis:** Frozen Benchmarks A (`90`) and B (`88`) both satisfy `mustHavesMetRatio >= 0.5` and would be unaffected, whereas candidates with strong projects/transferable skills on 2–3 missing must-haves would be hard-clamped at `64` even with high `evidenceDepth` and `impactMetrics`.
- **Policy Decision:** **INTENTIONALLY DISABLED / OBSOLETE** under `4.0.0-ats7d`. Existing `mustHaveCoverage` (`30%` weight) + `evidenceDepth` already penalizes missing mandatory skills linearly without an arbitrary cliff at `64`.

---

## 4. JD Input-State Behaviour Matrix

| JD Input Condition | `mustTotalCount` | `applicationGuidance` | Verdict / Behaviour |
| :--- | :---: | :--- | :--- |
| 1. No JD / Empty | `0` | `Insufficient evidence to evaluate` | `No Mandatory Requirements Extracted (0/0)` — never claims `100%` or `Ready to apply`. |
| 2. Valid Must + Nice | `> 0` | `Ready to apply` / `Apply after high-priority fixes` / `Significant gaps` | Full 7D scoring + `ScoreTrace` + `ConfirmRequirementsModal` parity. |
| 3. Preferred-Only JD | `0` (`nice > 0`) | `Apply after high-priority fixes` / `Significant gaps` | Never returns `Ready to apply`; explicitly states `Preferred-only JD (X preferred, 0 mandatory)`. |
| 4. No Recognizable Reqs | `0` | `Insufficient evidence to evaluate` | Explains no verifiable requirements were extracted. |
| 5. Very Short / Incomplete | `0` | `Insufficient evidence to evaluate` | Prompts user to paste full JD or confirm requirements manually. |
| 6. Ambiguous (`Go`, `C`, `R`) | `>= 0` | Context-guarded | `verifyAmbiguityGuard` requires context hints (`Golang`, `C/C++`, `R programming`). |
| 7. Contradictory Seniority | `>= 0` | Seniority-gated | `seniorityMatcher` flags shortfall when explicit years conflict with intern/junior title. |
| 8. Unsupported Domain (HR) | `0` | `Insufficient evidence to evaluate` | Honest unsupported-domain/no-requirements message. |
| 9. Edu/Certs Only | `0` | `Insufficient evidence to evaluate` | Education/certs parsed, but `0` technical skills prevents false `Ready to apply`. |
| 10. Compound `AND`/`OR` | `>= 1` | Full AST evaluation | `logicalExpression.ts` credits any valid `OR` alternative without double-counting. |

---

## 5. Professional Domain Coverage Matrix

| Domain | Status | Evidence & Notes |
| :--- | :--- | :--- |
| Software Engineering (FE/BE/FS/SDE) | **Supported** | Full `roles.json` + `skills.json` + `taxonomy/*` + `ontology/*` + `SKILL_PLAYBOOKS` + 32+ golden pairs. |
| Cloud & DevOps / SRE | **Supported** | `devops_sre` role + `cloudDevopsInfra.ts` + `SKILL_PLAYBOOKS` (`docker`, `kubernetes`, `aws`, `ci_cd`). |
| Data & Analytics | **Supported** | `data_engineer`, `data_scientist`, `ml_engineer` + `dataMlAi.ts` + `tableau`, `power_bi`, `dbt` (`productBusinessDesign.ts`). |
| Cybersecurity | **Partially Supported** | `mobileSecurityEmbedded.ts` + `siem_soc`, `owasp_appsec`; lacks dedicated `roles.json` profile (locked at 11 by `knowledge.test.ts`). |
| Product Management | **Partially Supported** | `product_roadmap`, `a_b_testing`, `product_analytics` + `product_analytics` playbook; no dedicated `roles.json` profile. |
| Design & UX | **Partially Supported** | `figma`, `ux_research`, `design_systems` + `figma` playbook; verified in `phase14bAtsRoasterV2.test.ts`. |
| Business Ops / Marketing / Finance | **Minimal / Experimental** | `seo_growth`, `financial_modeling` in taxonomy only; no role profiles or domain playbooks. |
| Sales / Human Resources / Research | **Unsupported** | Zero dedicated domain competencies (`JD08_Unsupported_HR` triggers `Insufficient evidence to evaluate`). |

---

## 6. Cross-Profile Fairness & 7. Recommendation Fairness

Verified in [phase14b1AtsFairnessAndCoverage.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/phase14b1AtsFairnessAndCoverage.test.ts):
- **Internships vs Full-Time:** `P02_Grad_One_Intern` (`6m` internship) correctly records `totalProfessionalYears = 0` (internships excluded from professional YOE).
- **Phone Omission Privacy:** `P04_Exp_No_Phone` (`email` + `LinkedIn` + `GitHub`, no phone) receives `0` `no_contact_info` penalty.
- **Personal Projects vs Professional Experience:** `evidenceModel` preserves `PERSONAL_PROJECT` vs `PROFESSIONAL_EXPERIENCE` provenance without conflation.
- **Recommendations:** `fixFirst` and `learningPath` tie directly to missing/weak `SkillResult` items and never fabricate metrics or time estimates.

---

## 8. Before / After Scoring Changes & 9. Golden Benchmark Preservation

- **Before -> After:**
  - `P04_Exp_No_Phone` (email present, phone omitted): `-5` `no_contact_info` deduction removed (`+5` pts fairer).
  - `JD03_Preferred_Only`: `applicationGuidance` changed from `'Ready to apply'` to `'Apply after high-priority fixes'` / `'Significant gaps to address'`.
- **Golden Benchmark Preservation:**
  - Frozen Benchmark A = **`90`** (`96.5 - 7 = 89.5 -> 90`), Frozen Benchmark B = **`88`** (`94.9 - 7 = 87.9 -> 88`) — **100% preserved** across all `tests/ats/*` suites.

---

## 10. Actual Verification Results (Post-Final-Edit)

| Check | Command | Outcome |
| :--- | :--- | :--- |
| TypeScript & Build | `npx tsc --noEmit` & `npm run build` | **Passed** (`0` TS errors, `vite v8.3.0`) |
| Privacy & Security | `npm run privacy:check`, `npm run security:secrets`, `npm run security:bundle` | **Passed** (`0` unauthorized egress, `0` Critical/High secrets, clean bundle) |
| Protected Files | `git diff --stat -- docs/validation-report.md src/config/versions.ts src/lib/ats/` | **Passed** (`0` modifications) |
| Vitest ATS & Fairness Suites | `npx vitest run --testTimeout=15000 tests/phase14b1AtsFairnessAndCoverage.test.ts tests/phase14bAtsRoasterV2.test.ts tests/ats/ tests/roaster/ tests/scoring/stage3RoasterPillars.test.ts src/features/ats/__tests__/ src/lib/ats/__tests__/ats-engine.test.ts` | **44 / 44 files passed, 472 / 472 tests passed** (2-page scan `26.8 ms`) |
| Playwright E2E | `npx playwright test e2e/phase14bResumeRoasterParity.spec.ts` | **2 / 2 passed** (`Default` `28.5s`, `Spruce` `4.9s`) |

---

## 11. Files Modified / Added in Phase 14B.1

- Modified:
  - [scorer.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/scorer.ts#L375-L393) (`no_contact_info` fairness)
  - [index.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/ats/engine/index.ts#L165-L195) (Preferred-only JD `applicationGuidance` & verdict)
  - [phase14bAtsRoasterV2.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/phase14bAtsRoasterV2.test.ts#L99-L103) (aligned to fairer `no_contact_info` rule)
- Added:
  - [phase14b1AtsFairnessAndCoverage.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/phase14b1AtsFairnessAndCoverage.test.ts)
  - `docs/PHASE_14B_1_ATS_FAIRNESS_AND_DOMAIN_COVERAGE_AUDIT.md`

---

## 12. Unresolved Issues & 13. Remaining Unsupported Domains

- **Future Version Candidate:** Lowering experienced `word_count_outlier` threshold from `250` to `180` requires an explicit version increment because Frozen Benchmark A (`90`) depends on `-4` at `~200` words.
- **Remaining Unsupported Domains:** Sales, Human Resources, and non-computational Research remain unsupported and surface `'Insufficient evidence to evaluate'` when `0` requirements are extracted.

---

## 14. Git Working-Tree Status

- Branch: `main` @ `818c36b2` (uncommitted Phase 11–14B.1 workspace preserved; zero protected-file diffs).

---

## 15. Final Acceptance Decision

**`ATS FAIRNESS VERIFIED — READY FOR TALENTLENS`**
