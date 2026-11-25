# HIREFLOW ATS — PHASE 10.3 EVIDENCE, CITATION & SEMANTIC MATCHING INTEGRITY REPORT

**Phase:** 10.3 (`B3` from Phase 10.1 Corrective Backlog + Phase 10.2 Unresolved Consumer Contracts)  
**Date:** 2026-11-26  
**Repository Baseline:** `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, Branch: `main`  
**Execution Topology:** 2 parallel implementation workers (`matching-worker` for Workstream A, `citation-worker` for Workstream B) + coordinator cross-workstream integration + 1 strictly read-only independent adversarial verifier (`p3-verifier`, final verdict: **APPROVED**).

---

## Preflight & Repository Protection Summary

- Recorded preflight baseline: `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, `main`, recovered `docs/validation-report.md` clean against `HEAD`, and preserved all prior uncommitted Phases 02–10.2 files.
- `tests/validation/validateScoring.test.ts` and golden/snapshot writing scripts were NOT executed during Phase 10.3.
- Section 8 explicit exclusions verified untouched after Phase 10.3 start (`22:49`): `seniorityMatcher.ts`, `tenureCalculator.ts`, `experienceEstimator.ts`, `metricExtractor.ts`, `authoritativeSnapshot.ts`, `ResumeChecker.tsx`, `exportPdf.ts`, `exportDocx.ts`, `exportDossier.ts`, `benchmarkFixtures.ts`, `PHASE_02..10_2*`, and `docs/validation-report.md`.

---

## 1. Exact Root Causes

1. **Disjoint Requirement Consumer Paths (`competencyMatcher.ts`, `skillMatcher.ts`):** `competencyMatcher.ts:440-442` re-parsed `req.canonical` instead of reading Phase 10.2 `req.logicalExpression` / `req.unresolved`; standalone `skillMatcher.ts` lacked nested `AND`/`OR` evaluation, `UNRESOLVED` ambiguity preservation, and secondary `orAlternatives` evidence/citation tracking (`Java OR Kotlin` matched via `Kotlin`).
2. **Must/Preferred OR-Group Collisions (`jdAnalyzer.ts`, `scorer.ts`):** Overlapping `Required: Docker` + `Preferred: Docker OR Kubernetes` could share the same primary `skillId` (`'docker'`) and double-count the same underlying Docker evidence inside `evidenceDepth`.
3. **Pass 3 Unreconciled Mutation (`skillMatcher.ts`):** Legacy Pass 3 overwrote `found`, `status`, and `proficiency` without reconciling `evidence`, `validatedCitations`, `claimSupport`, `citationValidity`, `provenance`, `attribution`, or `satisfiedBySkillId`, permitting verified outcomes with empty `evidence: []` or leaking non-equivalent citations (`index.ts:195`).
4. **Weak Matches Counted in `mustHavesMet` (`scorer.ts:108`):** `mustMetCount = mustSkills.filter(s => s.status !== 'missing').length` counted `'weak'` / `'PARTIALLY_SATISFIED'` must-haves as met hard requirements.
5. **Non-Equivalence Before Direct Mention (`citationValidator.ts:210-242`):** `validateClaimSupport()` evaluated `areNonEquivalent()` across all `matchedTerminology` before checking direct `competencyId` matches, rejecting co-occurring bullets (`"Docker and Kubernetes"`) as `NOT_SUPPORTED` / `UNSUPPORTED_CLAIM`.
6. **Generic `sectionId`, Unwired Context Checks & Trailing Period Bug (`evidenceExtractor.ts`, `citationValidator.ts`, `skillMatcher.ts`):** `evidenceExtractor.ts` hardcoded generic strings (`'experience'`, `'projects'`, `'skills'`) into `locator.sectionId` instead of `sec.sectionId`; `validateCitationLedger()` did not supply span-resolved section/entry expectations and omitted `CONTEXT_MISMATCH` from `measureCitationQuality()`; and negative-lookahead `(?![A-Za-z0-9+#.])` rejected sentence-ending punctuation (`"Kotlin."`).
7. **Sentence-Level & Override Negation Bugs (`statementExtractor.ts`, `competencyMatcher.ts`, `bulletAnalyzer.ts`):** `NEGATION_PATTERNS` missed words between `no` and `experience` (`"No production experience with Kubernetes"`), missed contrasted evaluation/migration pairs (`"Evaluated Kafka but selected RabbitMQ"`), missed aspirational phrases (`"Currently learning Rust"`, `"Planning to introduce Spark"`), and lacked `FAMILIARITY_ONLY` / team-observer detection (`"Worked with a team that used GraphQL..."`). Meanwhile `competencyMatcher.ts:73-79` let bare `SKILLS_SECTION` entries override `EXPERIENCE` negations, and `competencyMatcher.ts:455-485` promoted `FAMILIARITY_ONLY` / `ASSISTED_ACTIVITY` `EXPERIENCE` bullets to `SATISFIED` / `verified`.

---

## 2. Files Changed by Each Worker & Coordinator

- **Workstream A (`matching-worker`):**
  - Modified: `src/features/ats/engine/jdAnalyzer.ts`, `src/features/ats/engine/skillMatcher.ts`, `src/features/ats/engine/competencyMatcher.ts`, `src/features/ats/engine/scorer.ts` (narrowly confined to must-have satisfaction & `evidenceDepth` deduplication)
  - Created: `tests/ats/phase10_3SemanticMatching.test.ts` (17 tests)
- **Workstream B (`citation-worker`):**
  - Modified: `src/features/ats/engine/citationValidator.ts`, `src/features/ats/engine/evidenceExtractor.ts`, `src/features/ats/engine/statementExtractor.ts`, `src/features/ats/engine/bulletAnalyzer.ts`
  - Created: `tests/ats/phase10_3CitationAndNegativeEvidence.test.ts` (13 tests)
- **Coordinator Integration:**
  - Modified: `src/features/ats/engine/types.ts` (extended `SkillResult` and `BulletAnalysis`), `src/features/ats/engine/evidenceModel.ts` (`CompetencyPolarity` and `competencySentiments`), `src/features/ats/engine/citationModel.ts` (`contextMismatchCount`), `src/features/ats/engine/index.ts` (alternative/compound `validatedCitations` hydration without leaking non-equivalent citations)
  - Created: `docs/ats-engine/PHASE_10_3_EVIDENCE_CITATION_MATCHING_INTEGRITY_REPORT.md`

---

## 3. Requirement-to-Evidence Architecture Before and After

```
BEFORE (Phase 10.2):
- jdAnalyzer -> req.logicalExpression ignored by competencyMatcher (reparses req.canonical) & skillMatcher
- skillMatcher Pass 3 mutates found/status/proficiency without hydrating evidence/citations; index.ts indexes only citationsByCompetency[sr.skillId]
- scorer: mustMetCount counts 'weak' (s.status !== 'missing'); no deduplication across overlapping Must/Preferred groups
- citationValidator: areNonEquivalent runs before directMatch; measureCitationQuality misses CONTEXT_MISMATCH
- evidenceExtractor: generic sectionId ('experience'); SKILLS_SECTION overrides EXPERIENCE negation; trailing '.' fails token match

AFTER (Phase 10.3):
- Common Contract: SkillResult + ValidatedCitation + CandidateEvidenceRecord expose competencyId, logicalExpression, satisfiedBySkillId/Canonical, evidence, validatedCitations, provenance, attribution, claimSupport, citationValidity, requirementStatus
- statementExtractor + bulletAnalyzer: clause-level per-competency polarity (competencySentiments) + TEAM_OBSERVER_REGEX + aspirational guards + isNegated wired to metricExtractor
- citationValidator: directMatch evaluated BEFORE areNonEquivalent; span-resolved expected/actual section & entry + expectedDocumentId; FAMILIARITY_ONLY -> RELATED_ONLY, ASSISTED_ACTIVITY -> PARTIALLY_SUPPORTED
- competencyMatcher + skillMatcher Pass 3: evaluates req.logicalExpression / UNRESOLVED -> AMBIGUOUS; secondary OR-alts hydrate alternative quotes/citations/attribution; FAMILIARITY_ONLY & non-internship ASSISTED_ACTIVITY bounded to PARTIALLY_SATISFIED/weak; SKILLS_SECTION cannot override negation; verified requires non-empty evidence
- scorer: mustMetCount requires SATISFIED/'verified' with evidence; weak/PARTIALLY_SATISFIED retains 0.5 credit cleanly; evidenceDepth deduplicated by satisfiedBySkillId || skillId
```

---

## 4. OR-Alternative Behaviour (`Java OR Kotlin` & Nested `AND`/`OR`)

- **Primary Only (`Java`):** Matches `java` directly (`SATISFIED` / `'verified'`), attaching Java's citation.
- **Secondary Only (`Kotlin`):** Evaluates `[req.skillId, ...(req.orAlternatives || [])]` in both `competencyMatcher.ts` and standalone `skillMatcher.ts`; returns `SATISFIED` (`matchMethod: 'ALTERNATIVE'`), sets `satisfiedBySkillId: 'kotlin'`, `satisfiedByCanonical: 'Kotlin'`, `isSubstituteMatch: true`, excludes `java` from `matchResult.competencyIds`, and hydrates strictly Kotlin's evidence quotes, offsets, provenance, and `validatedCitations` via `index.ts`.
- **Weak / Negated Secondary Alternative:** `Kotlin` in `SKILLS` only yields `PARTIALLY_SATISFIED` / `'weak'` (not `verified`); negated `Kotlin` yields `CONTRADICTED` / `'missing'`.
- **Unresolved Expressions:** `req.unresolved` or `ast.operator === 'UNRESOLVED'` returns `status: 'AMBIGUOUS'`, `found: false`, `status: 'missing'`, preserving parse limitations.

---

## 5. Must/Preferred Collision Policy

- **Deterministic Disambiguation (`jdAnalyzer.ts`):** When a standalone requirement (`Docker`, `'must'`) and a compound OR-group (`Docker OR Kubernetes`, `'nice'`) share the same primary ID (`'docker'`), the OR-group retains unique key `'or_docker_or_kubernetes'` with `formatLogicalExpression(ast)` canonical (`"Docker OR Kubernetes"`), keeping Mandatory `'docker'` (`must`) and Preferred `'or_docker_or_kubernetes'` (`nice`) separate with original `sourceSentence` preserved.
- **Deduplicated Scoring (`scorer.ts`):** `evidenceDepth` deduplicates found requirements by effective competency `s.satisfiedBySkillId || s.skillId` (keeping the highest-evidence entry), ensuring Docker-only candidates do not double-count Docker evidence.
- **Verified All 4 Cases (`tests/ats/phase10_3SemanticMatching.test.ts`):**
  1. **Docker only:** Mandatory `Docker` = `SATISFIED`; Preferred `Docker OR Kubernetes` = `SATISFIED` via `docker` (deduplicated `evidenceDepth`).
  2. **Kubernetes only:** Mandatory `Docker` = `RELATED_BUT_NOT_EQUIVALENT` / `'missing'`; Preferred `Docker OR Kubernetes` = `SATISFIED` via `kubernetes` (`satisfiedBySkillId: 'kubernetes'`).
  3. **Both technologies:** Both satisfied cleanly without double-counting shared citations.
  4. **Neither technology:** Both unsatisfied (`NOT_DEMONSTRATED`).

---

## 6. Negative-Evidence, Exposure & Assisted Attribution Behaviour

- **Clause-Scoped Mixed Polarity (`statementExtractor.ts`, `evidenceModel.ts`):** Splits contrasted/migrated bullets (`"Evaluated Kafka but selected RabbitMQ"`, `"Evaluated Kafka, but selected RabbitMQ"`, `"Migrated away from MongoDB to PostgreSQL"`, `"Replaced Redis with Memcached"`) into per-competency entries in `ev.competencySentiments` (so `kafka`/`mongodb`/`redis` get `isNegated: true` / `CONTRADICTED` while `rabbitmq`/`postgresql`/`memcached` verify positively on the same bullet).
- **Extended Negation, Aspirational & Metrics Wiring:** Detects `"No production experience with Kubernetes"`, `"Currently learning Rust"`, and `"Planning to introduce Spark"` as negated/non-active (`CONTRADICTED`/`missing`), without false-negating `"machine learning"` or `"capacity planning"`; wires `isNegated` into `bulletAnalyzer.ts` before `extractMetricsFromText()`.
- **No Skills-List Override (`competencyMatcher.ts`):** `SKILLS_SECTION` / `COURSEWORK` (`FAMILIARITY_ONLY`) mentions never override `EXPERIENCE` negations (`No production experience with Kubernetes` + `SKILLS: Kubernetes` -> `CONTRADICTED` / `'missing'`).
- **Exposure, Team-Observer & Assisted Experience Separation:** `FAMILIARITY_ONLY` (`"Exposure to Kubernetes..."`, `"Familiar with Terraform..."`, team-observer `"Worked with a team that used GraphQL..."`) and non-internship `ASSISTED_ACTIVITY` (`"Assisted with Docker container configuration tasks."`) are bounded to `PARTIALLY_SATISFIED` / `'weak'` (`0/1` must-haves met, `RELATED_ONLY` / `PARTIALLY_SUPPORTED` claim support), while active leadership/authorship (`"Led team of 8 engineers..."`, `"Built REST APIs in Go with team..."`) remains `DIRECTLY_SUPPORTED` / `SATISFIED`.

---

## 7. Multi-Competency Matching & Citation Validation Ordering (`B1`, `B4`, `B5`)

- **Direct Mention Before Non-Equivalence (`citationValidator.ts`):** `validateClaimSupport()` checks direct `matchedTermMatch` (via ontology/taxonomy lookup against the quote) and `directIdListed` BEFORE running `areNonEquivalent()` guards. A bullet naming both `"Docker and Kubernetes"` yields `DIRECTLY_SUPPORTED` / `VERIFIED_EXACT` for both `docker` and `kubernetes`, whereas `"Docker"` alone claiming `kubernetes` still returns `NOT_SUPPORTED`.
- **Token Boundaries (`statementExtractor.ts`, `evidenceExtractor.ts`, `skillMatcher.ts`, `jdAnalyzer.ts`):** Unified boundary `(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])` matches `Kotlin.`, `Java.`, `C++.`, `C#.`, `Node.js.`, `ASP.NET.`, `CI/CD.`, `Python,.`, and parenthesized terms while blocking `Node` inside `Node.js`, `Java` inside `JavaScript`, `.NET` inside `ASP.NET`, and `.py`.

---

## 8. Source Offset, Locator & Context Ledger Verification (`B2`, `B3`)

- **Actual `sectionId` (`evidenceExtractor.ts`):** `resolveSectionIdForSpan()` resolves actual `sec.sectionId` (`sec_experience_0`, `sec_experience_1`, `sec_skills_0`, `sec_education_0`, etc.) into both `ev.sectionId` and `ev.locator.sectionId` while keeping `sourceSection` compatible with historical snapshots.
- **Active Ledger Context Enforcement (`citationValidator.ts`):** `validateCitationLedger()` now supplies `expectedDocumentId`, `documentId`, span-resolved `expectedSection`/`actualSection` (with two-column pipe-table awareness), and span-resolved `expectedEntry`/`actualEntry`, exercising `WRONG_SOURCE`, `WRONG_SECTION`, `WRONG_ENTRY`, `INVALID_OFFSETS`, `INVALID_QUOTE`, `CONTEXT_MISMATCH` (counted via `measureCitationQuality().contextMismatchCount`), `UNSUPPORTED_CLAIM`, and `AMBIGUOUS`.

---

## 9. Status Accounting for Must-Have Requirements (`scorer.ts`)

- `mustMetCount` counts ONLY `SATISFIED` / `'verified'` must-haves backed by evidence (`PARTIALLY_SATISFIED` / `'weak'`, `RELATED_BUT_NOT_EQUIVALENT`, `CONTRADICTED`, `AMBIGUOUS`, and `NOT_DEMONSTRATED` are excluded from `mustHavesMet`).
- Partial matches (`'weak'` / `PARTIALLY_SATISFIED`, non-contradicted) continue receiving canonical `0.5` weighted credit in `earnedCreditSum` and are surfaced separately in `mustPartialCount` (`mustHaveCoverage` formula & weights unchanged; Benchmark **A=90**, Benchmark **B=88** preserved).

---

## 10. Independent Adversarial Verification & Regression Outputs (Post-Final-Edit Run)

All checks below ran directly after all Phase 10.3 edits (and were independently verified by `@p3-verifier`, Verdict: **APPROVED**):

| Check / Suite | Command | Observed Result |
|---|---|---|
| **TypeScript Check** | `npx tsc --noEmit` | **PASS (`TSC=0`)** |
| **Ontology Federation Audit** | `npm run ontology:audit` | **PASS (`ONTOLOGY=0`)** — 33 ontology nodes, 303 skills, 332 relationships, **0 structural errors**, 175 advisory warnings |
| **ATS Regression & Phase 10.3 Suites** | `npx vitest run tests/ats/` | **PASS (`ATS=0`)** — **16/16 files, 248/248 tests passed** (`34.79s`): includes `phase05Citations` (19/19), `phase06Matching` (17/17), `phase08_3ConsistencyAudit` (9/9, **A=90, B=88**), `phase09MetricIntelligence` (17/17, N=30 **F1=1.0000**), `phase10_2OntologyFederation` (14/14), `phase10_2ParsingAndJdLogic` (13/13), `phase10_3SemanticMatching` (17/17), `phase10_3CitationAndNegativeEvidence` (13/13) |
| **Knowledge & Golden Benchmarks** | `npx vitest run src/features/ats/__tests__/knowledge.test.ts golden-resumes.test.ts extendedGoldenResumes.test.ts` | **PASS (`GOLDEN=0`)** — **3/3 files, 11/11 tests passed**: Golden Precision `98.10%`, Recall `94.50%`; Extended Precision `100.00%`, Recall `93.75%` |
| **Stage 0 Property Invariants** | `npx vitest run tests/property_invariants.test.ts` | **12/13 PASSED (`INV=1`)** — `C1`, `C2`, `C3`–`C6`, `C8`–`C14` **PASS**; `C7` failed on 11/14 baseline pairs due strictly to `scorer.ts` penalty deduction vs `C7` pre-penalty sum |
| **Production Build** | `npm run build` | **PASS (`BUILD=0`)** — `tsc && vite build` succeeded in `6.85s` (`dist/sw.js` precached 93 assets) |

*(Note: `p3-verifier` also ran live Vite SSR end-to-end `runAtsEngine` / `evaluateSingleCompetency` adversarial probes verifying exposure/familiarity, team-observer, `ASSISTED_ACTIVITY`, active team leadership, mixed-polarity bullets, multi-competency `"Docker and Kubernetes"`, and `evaluateSingleCompetency` with `orAlternatives` + non-equivalent siblings.)*

---

## 11. Verifier Objections & Resolutions

On the first integration review (`#34`), `p3-verifier` issued `CONDITIONAL` after exposing 3 concrete adversarial defects via live SSR probes:
1. **`EXPERIENCE` Exposure/Familiarity Promotion (High):** `"Exposure to Kubernetes..."` / `"Familiar with Terraform..."` produced `SATISFIED`/`verified` (`1/1` must-have) despite `attribution: 'FAMILIARITY_ONLY'` and `claimSupport: 'RELATED_ONLY'`. **Resolved (`#39`):** Filtered `FAMILIARITY_ONLY` out of `prodRecords`/`internRecords`/`projectRecords` in `competencyMatcher.ts` and capped `hasWeakPhrase` in `skillMatcher.ts` -> confirmed `weak` / `PARTIALLY_SATISFIED` / `0/1` (`#41`).
2. **Team-Qualified Observer & `ASSISTED_ACTIVITY` Over-Crediting (Medium):** `"Worked with a team that used GraphQL..."` defaulted to `DIRECT_IMPLEMENTATION`, and `"Assisted with Docker..."` yielded `DIRECTLY_SUPPORTED` / `SATISFIED`. **Resolved (`#38`, `#39`):** Added `TEAM_OBSERVER_REGEX` in `statementExtractor.ts`, bounded `ASSISTED_ACTIVITY` to `PARTIALLY_SUPPORTED` in `citationValidator.ts`, and bounded non-internship `ASSISTED_ACTIVITY` to `PARTIALLY_SATISFIED` / `weak` in `competencyMatcher.ts` / `skillMatcher.ts` while preserving active leadership (`Led team...`) and Benchmark B (`88`) -> confirmed (`#41`).
3. **Direct `evaluateSingleCompetency` `orAlternatives` Ordering (Low/Medium):** Calling `evaluateSingleCompetency({ skillId: 'docker', orAlternatives: ['helm'] }, ...)` with `Kubernetes` + `Helm` returned `RELATED_BUT_NOT_EQUIVALENT` before evaluating `Helm`. **Resolved (`#39`):** Evaluated `req.orAlternatives` via `evaluateOrAlternativesForReq()` before non-equivalence fallback -> confirmed (`#41`).

---

## 12. Remaining Limitations (Out of Phase 10.3 Scope)

1. **Pre-existing `C7` Arithmetic Delta:** `tests/property_invariants.test.ts:173-186` sums the 7 subscores pre-penalty while `scorer.ts:367-371` deducts `appliedPenalties` (scheduled for scoring-unification phase).
2. **Ambiguous Bare JD Lines:** Uncontextualized ambiguous lines like `"- Rust"` or `"- Go"` without context hints are filtered by `verifyAmbiguityGuard` in `jdAnalyzer.ts` Case 3 unless context hints or `confirmedRequirements` are supplied.
3. **Cross-Bullet Contradiction Surface:** If a resume has both `"Built production Redis caching layer."` and `"Migrated away from Redis to Memcached."`, `parsingWarnings` and `ev.contradictionWarning` are emitted while substantive positive experience still satisfies the requirement without surfacing a dedicated warning badge on `SkillResult`.

---

## 13. Git & Untracked-File State

Verified via `git status --short`:
- Phase 10.3 modified tracked files: `src/features/ats/engine/{bulletAnalyzer,index,jdAnalyzer,scorer,skillMatcher,types}.ts`.
- Phase 10.3 updated pre-existing untracked files: `src/features/ats/engine/{citationModel,citationValidator,competencyMatcher,evidenceExtractor,evidenceModel,statementExtractor}.ts`.
- Phase 10.3 created files: `tests/ats/phase10_3SemanticMatching.test.ts`, `tests/ats/phase10_3CitationAndNegativeEvidence.test.ts`, `docs/ats-engine/PHASE_10_3_EVIDENCE_CITATION_MATCHING_INTEGRITY_REPORT.md`.
- `docs/validation-report.md` remains clean against `HEAD`, all Phases 02–10.2 uncommitted work remains intact, and zero commits or pushes were executed.
