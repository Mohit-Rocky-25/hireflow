# Phase 13.1 — Outreach Content Quality Benchmark & Intelligence Refinement

**Date:** 2026-11-28  
**Branch / Commit:** `main` (`818c36b2`, uncommitted Phase 12–13.1 workspace)  
**Scope:** Content quality audit of all 87 outreach templates, Channel vs Intent separation, evidence-aware personalization, 10-dimension 1–5 quality rubric, 20-scenario benchmark, and Default + Spruce E2E verification.  
**Acceptance Decision:** **`OUTREACH CONTENT QUALITY ACCEPTED`**

---

## 1. Full 87-Template Content Audit & Targeted Improvements

Every template in [templates.json](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/outreach/templates.json) (`87` templates total, `87` unique `hook[0]` and `87` unique `ask[0]` strings) was audited for naturalness, specificity, relevance, professional tone, clarity, credibility, ask quality, relationship fit, candidate-stage appropriateness, repetition, unnecessary formality, generic wording, and unsupported assumptions.

- **81 templates verified sound** and preserved untouched to protect calibrated channel constraints and deterministic behavior.
- **6 templates exhibited concrete quality defects** (ungrounded hiring/scaling assumptions, student/fresher-only hardcoding on general goals, hollow filler openers, or vague engineering-culture asks) and were refined in place.
- **`tests/outreach/goldenSnapshot.spec.ts` integrity:** After the 6 targeted template edits, the deterministic 435-combination SHA-256 snapshot changed from `5fc260bafb5525d15fe6557c723fa115504b8e3c55d8efe6621a69d9054d617e` to `42a8963ddedb183729fcf9598fe01ae9e6527aed51ba2f812f465f680f38e05c` and was updated in [goldenSnapshot.spec.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/outreach/goldenSnapshot.spec.ts#L129-L133).

### 1.1 Exact Template Diffs (6 Improved Templates)

| # | Template ID | Quality Defect Identified | Improvement Applied | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `recruiter-direct-note` | `hook` assumed `"saw {{company}} is actively recruiting..."` and `"scales its technical engineering teams"` without verified hiring evidence. | Replaced with honest role-interest phrasing (`"I'm interested in {{role}} work..."`, `"introduce my background for {{role}} work..."`). | Eliminates ungrounded hiring/scaling claims. |
| 4 | `cold-email-scannable-pitch` | `subjectVariants`, `hook`, and `ask` hardcoded `"entry-level"`, `"junior"`, `"fresher"`, and `"upcoming graduate or fresher openings"` on general `G1` pitch. | Replaced with stage-neutral `{{role}}` phrasing (`"regarding {{role}} opportunities"`, `"Are there {{role}} openings..."`). | Prevents mid-career or non-fresher candidates from sending mismatched fresher copy. |
| 7 | `peer-engineer-tech-convo` | `ask[0]` used generic `"learn about {{company}}'s engineering culture"`. | Updated to `"follow your team's {{primary_skill}} work"`. | Anchors the connection request in concrete shared engineering work. |
| 11 | `mutual-connection-referral` | `hook[0]` opened with `"Hope you are doing well!"` filler. | Replaced with direct context (`"I noticed you are working closely with engineering at {{company}} and wanted to reach out."`). | Removes hollow pleasantries while keeping warm tone. |
| 12 | `referral-recommendation-team-lead` | `hook[0..1]` opened with `"Hope you and the team are having a great quarter!"` / `"Hope all is thriving on your end."` | Replaced with direct project-update openers (`"Wanted to share a quick update on my recent engineering work since we last worked together."`). | Respects senior leader time with immediate relevance. |
| 69 | `post-accept-recruiter-availability` | `hook[0]` assumed `"{{company}} is actively growing its technical team"` and `ask[0]` hardcoded `"early-career applicants"`. | Replaced with neutral post-acceptance introduction and stack-matched `{{role}}` inquiry. | Removes unverified growth claims and stage bias. |

### 1.2 Complete 87-Template Inventory

| # | Template ID | Channel | Goal | Relationship | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `recruiter-direct-note` | linkedin_connect | G1 | cold | Improved (Phase 13.1) |
| 2 | `recruiter-inmail-value-prop` | linkedin_inmail | G1 | cold | Verified Sound |
| 3 | `cold-email-direct-role-app` | cold_email | G4 | cold | Verified Sound |
| 4 | `cold-email-scannable-pitch` | cold_email | G1 | cold | Improved (Phase 13.1) |
| 5 | `hiring-manager-project-hook` | linkedin_inmail | G5 | cold | Verified Sound |
| 6 | `hiring-manager-high-impact-pitch` | cold_email | G1 | cold | Verified Sound |
| 7 | `peer-engineer-tech-convo` | linkedin_connect | G3 | cold | Improved (Phase 13.1) |
| 8 | `cold-email-solutions-problem-solving` | cold_email | G5 | cold | Verified Sound |
| 9 | `alumni-common-ground` | cold_email | G3 | alumni | Verified Sound |
| 10 | `alumni-warm-referral-ask` | warm_referral | G2 | alumni | Verified Sound |
| 11 | `mutual-connection-referral` | warm_referral | G2 | warm | Improved (Phase 13.1) |
| 12 | `referral-recommendation-team-lead` | warm_referral | G2 | warm | Improved (Phase 13.1) |
| 13 | `gentle-follow-up` | follow_up | G6 | cold | Verified Sound |
| 14 | `value-add-follow-up` | follow_up | G6 | cold | Verified Sound |
| 15 | `final-polite-loop-closure` | follow_up | G6 | cold | Verified Sound |
| 16 | `founder-cold-email-product-obs` | cold_email | G5 | cold | Verified Sound |
| 17 | `cto-stack-question-dm` | linkedin_connect | G3 | cold | Verified Sound |
| 18 | `founding-engineer-scope-pitch` | cold_email | G1 | cold | Verified Sound |
| 19 | `build-first-prototype` | cold_email | G5 | cold | Verified Sound |
| 20 | `response-we-are-hiring-post` | linkedin_connect | G4 | cold | Verified Sound |
| 21 | `university-relations-eligibility-query` | cold_email | G4 | cold | Verified Sound |
| 22 | `off-campus-fresher-drive-follow-up` | follow_up | G7 | cold | Verified Sound |
| 23 | `intern-to-ppo-conversion-note` | warm_referral | G1 | warm | Verified Sound |
| 24 | `campus-drive-process-question-alumnus` | linkedin_connect | G3 | alumni | Verified Sound |
| 25 | `ask-placement-cell-forward-profile` | cold_email | G4 | warm | Verified Sound |
| 26 | `oss-contribution-to-maintainer` | cold_email | G5 | cold | Verified Sound |
| 27 | `engineering-blog-reaction` | linkedin_connect | G5 | cold | Verified Sound |
| 28 | `product-teardown-improvement-note` | cold_email | G5 | cold | Verified Sound |
| 29 | `hackathon-project-demo-share` | cold_email | G9 | cold | Verified Sound |
| 30 | `post-meetup-webinar-speaker-follow-up` | linkedin_connect | G9 | warm | Verified Sound |
| 31 | `hackathon-judge-sponsor-follow-up` | cold_email | G9 | warm | Verified Sound |
| 32 | `community-chat-to-dm` | linkedin_connect | G9 | warm | Verified Sound |
| 33 | `booth-career-fair-recruiter-follow-up` | cold_email | G7 | warm | Verified Sound |
| 34 | `job-id-referral-ask-forwardable-fit` | warm_referral | G2 | warm | Verified Sound |
| 35 | `thank-you-referral-submitted` | warm_referral | G8 | warm | Verified Sound |
| 36 | `referral-status-nudge` | warm_referral | G6 | warm | Verified Sound |
| 37 | `give-first-note-before-any-ask` | cold_email | G5 | cold | Verified Sound |
| 38 | `post-oa-note-to-recruiter` | follow_up | G7 | after-accept | Verified Sound |
| 39 | `thank-you-after-technical-round` | follow_up | G8 | after-accept | Verified Sound |
| 40 | `silence-after-final-round` | follow_up | G7 | after-accept | Verified Sound |
| 41 | `real-competing-deadline-note` | follow_up | G7 | after-accept | Verified Sound |
| 42 | `polite-withdrawal-from-process` | follow_up | G7 | after-accept | Verified Sound |
| 43 | `advice-ask-senior-engineer` | cold_email | G3 | cold | Verified Sound |
| 44 | `prospective-teammate-stack-question` | linkedin_connect | G5 | cold | Verified Sound |
| 45 | `interview-process-question-recent-hire` | linkedin_connect | G3 | cold | Verified Sound |
| 46 | `one-question-note-after-talk` | cold_email | G9 | cold | Verified Sound |
| 47 | `reapply-after-rejection` | cold_email | G1 | after-accept | Verified Sound |
| 48 | `reply-no-openings-right-now` | follow_up | G6 | after-accept | Verified Sound |
| 49 | `reply-share-your-details` | follow_up | G1 | after-accept | Verified Sound |
| 50 | `reply-open-to-other-roles-mismatch` | follow_up | G1 | after-accept | Verified Sound |
| 51 | `li-connect-alumni-curiosity` | linkedin_connect | G3 | alumni | Verified Sound |
| 52 | `li-connect-peer-project` | linkedin_connect | G5 | cold | Verified Sound |
| 53 | `li-connect-founder-early-stage` | linkedin_connect | G1 | cold | Verified Sound |
| 54 | `li-connect-campus-recruiter-event` | linkedin_connect | G9 | warm | Verified Sound |
| 55 | `li-connect-manager-open-source` | linkedin_connect | G5 | cold | Verified Sound |
| 56 | `li-connect-alumni-career-guidance` | linkedin_connect | G3 | alumni | Verified Sound |
| 57 | `li-inmail-manager-project-deep-dive` | linkedin_inmail | G5 | cold | Verified Sound |
| 58 | `li-inmail-recruiter-campus-batch` | linkedin_inmail | G1 | cold | Verified Sound |
| 59 | `li-inmail-founder-scaling-pitch` | linkedin_inmail | G1 | cold | Verified Sound |
| 60 | `li-inmail-peer-tech-exchange` | linkedin_inmail | G5 | cold | Verified Sound |
| 61 | `li-inmail-alumni-reconnect` | linkedin_inmail | G3 | alumni | Verified Sound |
| 62 | `li-inmail-posting-response` | linkedin_inmail | G4 | cold | Verified Sound |
| 63 | `post-accept-alumni-referral-ask` | warm_referral | G2 | alumni | Verified Sound |
| 64 | `post-accept-peer-portfolio-review` | linkedin_inmail | G3 | after-accept | Verified Sound |
| 65 | `post-accept-manager-role-inquiry` | cold_email | G1 | after-accept | Verified Sound |
| 66 | `warm-referral-former-colleague-forwardable` | warm_referral | G2 | warm | Verified Sound |
| 67 | `warm-referral-mentor-endorsement` | warm_referral | G2 | warm | Verified Sound |
| 68 | `warm-referral-alumni-internship` | warm_referral | G2 | alumni | Verified Sound |
| 69 | `post-accept-recruiter-availability` | linkedin_inmail | G1 | after-accept | Improved (Phase 13.1) |
| 70 | `warm-referral-campus-senior` | warm_referral | G2 | alumni | Verified Sound |
| 71 | `post-accept-hiring-manager-screening-inquiry` | cold_email | G4 | after-accept | Verified Sound |
| 72 | `warm-referral-event-speaker-connection` | warm_referral | G9 | warm | Verified Sound |
| 73 | `post-accept-peer-team-insight` | linkedin_inmail | G3 | after-accept | Verified Sound |
| 74 | `cold-email-founder-seed-stage` | cold_email | G1 | cold | Verified Sound |
| 75 | `cold-email-peer-architecture-question` | cold_email | G3 | cold | Verified Sound |
| 76 | `cold-email-campus-relations-offcampus` | cold_email | G1 | cold | Verified Sound |
| 77 | `cold-email-hiring-manager-posting-specific` | cold_email | G4 | cold | Verified Sound |
| 78 | `cold-email-alumni-shared-lab` | cold_email | G3 | alumni | Verified Sound |
| 79 | `follow-up-post-application-recruiter` | follow_up | G7 | cold | Verified Sound |
| 80 | `follow-up-hiring-manager-new-benchmark` | follow_up | G6 | cold | Verified Sound |
| 81 | `follow-up-alumni-conversation-recap` | follow_up | G8 | alumni | Verified Sound |
| 82 | `follow-up-interview-thank-you-peer` | follow_up | G8 | warm | Verified Sound |
| 83 | `event-outreach-hackathon-judge` | cold_email | G9 | warm | Verified Sound |
| 84 | `event-outreach-tech-talk-attendee` | cold_email | G9 | warm | Verified Sound |
| 85 | `follow-up-final-courtesy-close` | follow_up | G6 | cold | Verified Sound |
| 86 | `alumni-advice` | cold_email | G3 | alumni | Verified Sound |
| 87 | `senior-intro` | cold_email | G1 | warm | Verified Sound |

---

## 2. Channel vs. Intent Separation & Evidence-Aware Personalization

- **Clean Channel Tabs:** Both Default ([ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/ReachOutPage.tsx#L55-L88)) and Spruce ([ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/designs/spruce/pages/ReachOut/ReachOutPage.tsx#L45-L50)) now expose primary communication channels (`LinkedIn Connect`, `Email`, `LinkedIn InMail` / `InMail`, `All Channels`) instead of mixing `Follow-Up` or `Warm Referral` into the channel tab bar.
- **Intent Resolution & Backward Compatibility:** In [useReachOutStudio.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/useReachOutStudio.ts#L377-L388) and [contextIntelligence.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/contextIntelligence.ts#L414-L437), selecting `post_application`, `conversation_follow_up`, or `warm_referral` resolves follow-up (`G6`/`G7`) and warm-referral (`G2`) templates without overwriting the active communication channel, while preserving legacy saved `OutreachDraft` records whose `channel` is `'follow_up'` or `'warm_referral'`.
- **Relevance-Ranked Evidence Selection:** `selectRelevantProofAndSkills` in [contextIntelligence.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/contextIntelligence.ts#L457-L520) ranks candidate projects by keyword overlap with `targetRole`/`jdText`, selects at most 1–2 relevant projects, trims skill lists to `<= 3` skills, preserves provenance (`source_supported`, `supported_paraphrase`, `candidate_attested`, `unconfirmed`), and sets `weakEvidence: true` with empty proof rather than fabricating claims when evidence is absent.

---

## 3. 10-Dimension Message Quality Rubric & 20-Scenario Benchmark

`scoreMessageQualityRubric` in [contextIntelligence.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/engine/contextIntelligence.ts#L561-L686) scores generated messages from `1` to `5` across 10 dimensions:
1. `contextualRelevance`
2. `evidenceSpecificity`
3. `naturalHumanLanguage`
4. `professionalTone`
5. `recipientRelevance`
6. `clarityOfPurpose`
7. `askQuality`
8. `channelFit`
9. `factualIntegrity`
10. `conciseness`

> [!NOTE]
> `scoreMessageQualityRubric` is a deterministic heuristic supplement to human review (zero paid AI APIs) and is kept strictly separate from `canCopyOrExport` structural gating.

### 3.1 Weak vs. Improved Comparison (Verified in [phase13_1OutreachQualityBenchmark.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/tests/phase13_1OutreachQualityBenchmark.test.ts))

- **Weak Baseline:** `"Hi Kiran, I hope this email finds you well! Saw Acme Systems is actively recruiting for Backend Engineer roles. Please find attached my resume."` (with `unconfirmed` provenance and missing concrete proof) — penalized for generic cliche opener, unverified hiring assumption, and missing evidence (`factualIntegrity <= 3`, `overallScore` strictly lower than improved outputs).
- **Improved Output (`recruiter-direct-note` / `cold-email-scannable-pitch`):** Grounded in candidate-attested proof (`4,500 jobs/sec` Go worker queue or `45%` render latency reduction), stage-neutral role targeting, zero unverified hiring assumptions, `factualIntegrity >= 4`, `naturalHumanLanguage >= 4`, and `overallScore >= 3.8` across all **20 benchmark scenarios (S01–S20)**.

---

## 4. Verification Results

All checks below were executed after the final edit with zero skipped assertions:

| Check | Command | Result |
| :--- | :--- | :--- |
| TypeScript & Production Build | `npx tsc --noEmit` & `npm run build` | Passed (`0` errors, `vite v8.3.0` built cleanly) |
| Privacy & Security Scans | `npm run privacy:check`, `npm run security:secrets`, `npm run security:bundle` | Passed (bundle clean, zero source maps/secrets) |
| Protected Files Integrity | `git diff --stat -- docs/validation-report.md src/config/versions.ts src/lib/ats/` | Passed (`0` diff) |
| Outreach & My Space Vitest Suite | `npx vitest run ...` (16 files including `phase13_1OutreachQualityBenchmark.test.ts`, `goldenSnapshot.spec.ts`, `outreachTemplatesV2.test.ts`, `phase13OutreachV3.test.tsx`, `reachOutTrust.test.tsx`, `privacyAndStorage.spec.ts`) | **16 / 16 files passed, 193 / 193 tests passed** |
| Playwright E2E (Default + Spruce + My Space) | `npx playwright test e2e/phase13OutreachV3.spec.ts` + `e2e/mySpaceDemoApp.spec.ts` + `e2e/phase12MySpaceResponsiveAndHandoffs.spec.ts` | **4 / 4 E2E tests passed** (Default & Spruce Reach Out V3 verified) |

---

## 5. Known Limitations & Final Decision

- **Deterministic Heuristic Boundary:** `scoreMessageQualityRubric` detects structural signals, cliche openers, placeholder leaks, unverified hiring phrases, and proof presence deterministically, but cannot substitute for human judgment on domain nuance or company-specific tone.
- **Future Server/AI Boundary:** Remote Supabase/OAuth sync and optional LLM-assisted rewriting remain intentionally unactivated in this local-first release.
- **Final Decision:** **`OUTREACH CONTENT QUALITY ACCEPTED`**
