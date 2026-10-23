# HireFlow Integrity Baseline: Measurement & Evaluation Audit

**Date**: October 23, 2026  
**Auditor**: Senior Full-Stack Engineer & Measurement/Evaluation Specialist (Indian Tech-Hiring Domain)  
**Branch**: `feat/integrity-v2`  
**Target Modules**: `src/lib/ats/`, `src/features/ats/`, `src/pages/demo/`, `src/data/ats/`, `src/pages/tools/`

---

## 1. Baseline Evaluation of Known Flaws (F1 – F19)

| Flaw ID | Summary Description | Exists in Code? | File & Line References | Specific Finding & Code Reality |
| :--- | :--- | :---: | :--- | :--- |
| **F1** | "ATS score" framing implies employers see this number | **YES** | `src/features/ats/engine/scorer.ts:33`, `src/features/suite/compare/compareJDs.ts:48, 155`, `src/pages/methodology/MethodologyPage.tsx:564`, `src/features/ats/components/ScoreHeader.tsx:108` | Function names and commentary reference `computeAtsScore` and "Overall ATS Score". The UI displays a single large ring number (0–100) that users interpret as an industry-standard ATS pass score. |
| **F2** | Deterministic is not valid: arbitrary weights, no outcome validation, JD must-have extraction undocumented | **YES** | `src/lib/ats/scoreAggregator.ts:182-190`, `src/features/ats/knowledge/scoring-config.json:2-12`, `src/lib/ats/parseJD.ts:12-65` | Weights (Must-Have 35%, Evidence 20%, Seniority 15%, Nice-to-Have 10%, Project 10%, Format 10%) are editorial constants with zero empirical validation against real hiring shortlists. JD requirement extraction relies on regex cue phrases without precision/recall metrics. |
| **F3** | Overclaiming: "verified", "proven", "guarantee", "zero hallucination", "cryptographic" | **YES** | `src/lib/ats/canonicalAnalysis.ts:4, 37, 272`, `src/lib/ats/invariants.ts:12, 102`, `src/features/ats/components/SkillsTab.tsx:284`, `src/features/ats/engine/scorer.ts:54, 68` | Code defines `SharedEvidenceStatus = 'proven'`, uses variables like `verifiedSkillsCount`, and describes 64-bit FNV-1a non-cryptographic hashing as "cryptographic fingerprinting". |
| **F4** | No provenance for market claims ("144+ verified employers", "1,000+ calibrated roles", tier thresholds) | **YES** | `src/pages/demo/talentLensData.ts:1-5`, `src/data/ats/market-tiers.json:1-182` | Marketing copy claims "144+ verified employers" and "1,000+ calibrated roles", but market tiers and signals contain no URLs, source dates, or empirical provenance. |
| **F5** | Spec math errors: bullet scoring criteria sum to 70 not 100; seniority shortfall bands leave a gap; anti-gaming ambiguous or/and logic | **YES** | `src/lib/ats/evidenceScorer.ts:87-98`, `src/lib/ats/pipeline.ts:374-376, 394-398`, `src/lib/ats/seniorityFit.ts:26-34`, `src/lib/ats/scoreAggregator.ts:47-49` | In `evidenceScorer.ts`, the four criteria bonuses (verb 20 + metric 25 + tech 15 + outcome 10) sum to 70 on top of an arbitrary 40 baseline. In `pipeline.ts`, a gap exists between `< 1.5 yrs` and `>= 1.5 yrs` creating a 22-point cliff jump. Anti-gaming has conflicting `or` / `and` conditions across modules. |
| **F6** | Rubric rewards what it penalizes: bare keyword mention earns full must-have credit while anti-gaming only fires at extremes | **YES** | `src/lib/ats/scoreAggregator.ts:61-63`, `src/lib/ats/canonicalAnalysis.ts:551-552`, `src/features/ats/engine/scorer.ts:53-65` | A bare listed skill in the "Skills" section (status: `exact`) receives 100% must-have credit. Anti-gaming only deducts points if > 65% of skills are unsupported and the list has $\ge$ 40 skills or > 40% of word count. |
| **F7** | Implication graph over-credits (e.g., EKS implies Docker proficiency) | **YES** | `src/lib/ats/matchSkills.ts:17-30` | Implication graph rules include `'eks': ['Kubernetes', 'AWS', 'Docker']`. Using managed AWS EKS does not imply foundational Docker containerization mastery. |
| **F8** | Missing real hiring drivers (college tier, referrals, internships, online-test results) | **YES** | `src/features/ats/engine/scorer.ts`, `src/lib/ats/scoreAggregator.ts` | The scoring rubric evaluates only resume text, ignoring campus vs off-campus access, referrals, corporate internships, and online test qualifiers (NQT, HackWithInfy, CodeVita). |
| **F9** | Tier mixing (quant vs big tech in one rubric; Adobe/Intuit/Salesforce misfiled as OOP-quirks tier) | **YES** | `src/data/ats/market-tiers.json:3, 96`, `src/data/ats/archetypes.json` | "Tier S" lumps FAANG with high-frequency quant trading (Tower Research). "Tier B" categorizes Adobe and Salesforce as enterprise MNCs evaluated on basic OOP design patterns. |
| **F10** | Java 8 flagged as an outdated anti-pattern regardless of target | **YES** | `src/pages/demo/talentLensEngine.ts:313, 482` | `MARKET_INTELLIGENCE.java.outdated` lists `"java 8 only"`, triggering a "stack appears dated" penalty even when targeting enterprise banking systems where Java 8/11 remains supported. |
| **F11** | Cache key is only a hash of resume+JD; FNV-1a called cryptographic | **YES** | `src/lib/ats/pipeline.ts:229-243`, `src/lib/ats/canonicalAnalysis.ts:272-314` | In `pipeline.ts`, `getCacheKey` hashes only `resumeText + jdText + options`, ignoring engineVersion, taxonomyVersion, and promptVersion. In `canonicalAnalysis.ts`, FNV-1a is termed "cryptographic". |
| **F12** | Curriculum covers only about 5 domains; Tier A stacks need Node, Go, React, SQL, etc. | **YES** | `src/pages/demo/talentLensEngine.ts:565-582`, `src/features/ats/engine/learningPath.ts` | Recommendations are limited to high-level textbook titles; missing structured Indian product stack paths (Node/Express, Go, React/TS, SQL/PostgreSQL, Fresher System Design). |
| **F13** | Text-only input cannot truly detect multi-column/text-box layouts | **YES** | `src/lib/ats/formatAuditor.ts:15-24`, `docs/complete_technical_and_logical_depth_of_talentlens_and_ats_resume_roaster.md` | Plain string input cannot inspect PDF DOM bounding boxes; claims of detecting multi-column layouts from raw text are heuristic guesses. |
| **F14** | One generic 30-day plan for very different gaps; "gap closed" promises | **YES** | `src/pages/demo/talentLensEngine.ts:588, 599`, `src/lib/ats/canonicalAnalysis.ts:654` | All gaps are assigned rigid timelines ("3-6 months", "4-8 weeks") without classifying whether a gap is closable in 7 days, 30 days, 90+ days, or not closable by resume alone (e.g., 4+ years tenure requirement). |
| **F15** | Wrong eligibility fact: Tier C says "60% or 6.5+ CGPA"; TCS rule is 60% aggregate (about 6.0 CGPA); lumps higher tracks | **YES** | `src/data/ats/market-tiers.json:143` | Market tiers assert "60%+ / 6.5+ CGPA". TCS eligibility mandates 60% aggregate (6.0 CGPA). Also omits TCS Digital/Prime and Infosys Power Programmer tracks. |
| **F16** | "Minimum required" and "immediate rejection" language for LeetCode 2100+ / Codeforces Candidate Master | **YES** | `src/data/ats/market-tiers.json:14`, `src/pages/demo/talentLensEngine.ts:238` | LeetCode 2100+ is stated as a requirement, with text claiming "application will be automatically rejected at ATS stage". |
| **F17** | Toy-project detection and production-signal checks are keyword-gameable and used as hard penalties | **YES** | `src/pages/demo/talentLensEngine.ts:110-139`, `src/lib/ats/marketPositioning.ts:59-69` | Hardcoded regex checks for "users", "rps", "tb/gb" award points if keywords appear, while docking genuine student work lacking these exact buzzwords. |
| **F18** | "6-second recruiter scan" presented as fact | **YES** | `src/lib/ats/pipeline.ts:175-178`, `src/lib/ats/canonicalAnalysis.ts:1036-1042` | The schema and UI present `recruiterSixSeconds` as an established empirical truth without acknowledging it as an illustrative simulation. |
| **F19** | Seniority (or any constant) pillar gives free points to students and inflates the composite | **YES** | `src/features/ats/engine/scorer.ts:101-106`, `src/lib/ats/seniorityFit.ts:38-43` | For an entry-level JD (0 years required) and a student resume (0 years candidate), Seniority Fit returns 100%, awarding 10 to 15 unearned points to the composite score instead of marking Seniority as "Not Applicable". |

---

## 2. Actual Codebase Pillars & Weight Configurations

### Scorer A: Canonical Aggregator (`src/lib/ats/scoreAggregator.ts`)
1. **Must-Have Coverage**: Base weight = 0.35 (35%)
2. **Evidence Quality**: Base weight = 0.20 (20%)
3. **Seniority Fit**: Base weight = 0.15 (15%)
4. **Nice-to-Have Coverage**: Base weight = 0.10 (10%)
5. **Project Relevance**: Base weight = 0.10 (10%)
6. **Format Safety**: Base weight = 0.10 (10%)
*Anti-Gaming Penalty*: -15 points deduction

### Scorer B: Feature Scorer (`src/features/ats/engine/scorer.ts`)
1. **Must-Have Coverage**: Weight = 30
2. **Evidence Depth**: Weight = 20
3. **Impact Metrics**: Weight = 15
4. **Projects and OSS**: Weight = 10
5. **Seniority Fit**: Weight = 10
6. **Format and Parse**: Weight = 10
7. **Tier Fit**: Weight = 5
*Penalties*: Up to -10 for keyword stuffing, -10 for contact info, -5 for missing sections, -5 for word count outlier.

---

## 3. Fresher with Entry-Level JD: Current Pillar Behaviors

When a fresher/student (0 years experience, 2 academic projects, listed skills, clean single-page format) is evaluated against an entry-level Software Engineer JD (0–1 years experience required, Must-Haves: React, TypeScript, Node.js):

| Pillar | Raw Score Earned | Effective Weight | Unearned Points / Behavioral Flaw Identified |
| :--- | :---: | :---: | :--- |
| **Seniority Fit** | **100%** | **15% (or 10 pts)** | **Flaw F19 (Free Points)**: Returns 100% simply because diff is 0. An entry-level candidate gets full seniority credit for doing nothing, artificially inflating the baseline match. |
| **Must-Have Coverage** | **100%** | **35% (or 30 pts)** | **Flaw F6**: If candidate merely lists "React, TypeScript, Node.js" in the Skills block with zero project bullets, they still earn 100% of this 35% weight. |
| **Evidence Quality** | **40% – 55%** | **20% (or 15 pts)** | **Flaw F5 & F17**: Lacking production enterprise scale words ("RPS", "million users"), student bullets receive low baseline scores regardless of clean architectural code. |
| **Project Relevance** | **80% – 95%** | **10% (or 10 pts)** | Works reasonably well if project text mentions the technologies, but toy project checks penalize students if buzzwords are absent. |
| **Format Safety** | **90% – 100%** | **10% (or 10 pts)** | **Flaw F13**: Claims to verify ATS layout safety based solely on plain text character counts. |
| **Tier Fit** | **50%** | **5 pts** | **Flaw F9**: Penalizes candidate for lacking 50% metric bullet ratio even for entry-level roles. |

---

## 4. Architectural Transformation Strategy for `feat/integrity-v2`

1. **Stage 1 (Honesty)**: Deploy banned terms linter, rename scores to estimates, add "What this is / isn't" drawer, and eliminate fake-precision language.
2. **Stage 2 (Scoring Validity)**: Fix bullet math (criteria strictly sum to 100), implement continuous piecewise seniority function, enforce evidence-tiered must-haves (bare mention max 0.5), decouple weak managed-service implication edges, exclude constant pillars (F19), and build `validate:scoring` metamorphic test harness.
3. **Stage 3 (Market Realism)**: Transition tiers to verifiable archetypes (separate Quant from Big Tech; add TCS Ninja/Digital/Prime and Infosys SE/DSE/Power Programmer tracks); fix TCS eligibility to 60% aggregate; introduce unscored Reality Factors panel.
4. **Stage 4 (Fresher Fit)**: Add local intake (batch year, branch, CGPA), replace toy-project penalties with distinctiveness advice, add keyword-dump bullet detector.
5. **Stage 5 (Actionability)**: Categorize gaps by closability (7d / 30d / 90d / not closable by resume); parameterize curriculum by weekly hours (5/10/20); expand to 10+ Indian product domains.
6. **Stage 6 (Bullet Quality)**: 4-part structure (Action + What + How + Result) with deterministic "no-new-facts" guardrails forbidding invented metrics.
7. **Stage 7 & 8**: Comprehensive test suite, npm scripts (`check:claims`, `check:market-data`, `validate:scoring`), and final integrity report.
