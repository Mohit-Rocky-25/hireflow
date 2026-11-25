# HIREFLOW ATS — PHASE 10.2 PARSING, JD LOGIC & KNOWLEDGE FEDERATION INTEGRITY REPORT

**Phase:** 10.2 (`B2` + `B4` from Phase 10.1 Corrective Backlog)  
**Date:** 2026-11-25  
**Repository Baseline:** `HEAD = 5412214ee8fc0f7580fd5830776dba40fddc39ef`, Branch: `main`  
**Execution Topology:** 2 parallel implementation workers (`ontology-worker` for Workstream A, `parsing-worker` for Workstream B) + coordinator cross-boundary integration + 1 strictly read-only independent adversarial verifier (`qa-verifier`).

---

## Initial Repository Recovery & Protection (`docs/validation-report.md`)

1. **Preservation Outside Repository:** Before any code or Git changes, the Phase 10.1 overwritten `docs/validation-report.md` (timestamp `2026-11-25 17:14:04`, modified when Batch 3 ran `tests/validation/validateScoring.test.ts`) was copied outside the repository to the conversation scratch artifact directory (`validation-report.phase10_1-overwritten.md`).
2. **Git Verification:** Confirmed `docs/validation-report.md` is tracked (`git ls-files docs/validation-report.md`), compared `git diff` against `git show HEAD:docs/validation-report.md`, and confirmed only the validation timestamp (`2026-11-24T13:02:43.447Z` -> `2026-11-25T11:44:04.103Z`) and generated synthetic run numbers differed.
3. **Recovery Result:** Confirmed `docs/validation-report.md` was clean in `HEAD` before Phase 10.1 and restored only `docs/validation-report.md` from `HEAD` (`git checkout HEAD -- docs/validation-report.md`). Verified `git status --short -- docs/validation-report.md` returned empty and all pre-existing Phases 02–09 uncommitted files remained untouched.
4. **Test Safety Enforcement:** `tests/validation/validateScoring.test.ts` and golden/snapshot generation scripts were excluded from execution throughout Phase 10.2.

---

## 1. Root Cause of B2 and B4

### Workstream A — B2 (Knowledge & Ontology Federation)
- **`src/features/ats/knowledge/taxonomy/index.ts`**: `ONTOLOGY_AS_TAXONOMY` omitted `implies` and `substitutes` and appeared last in `TAXONOMY_REGISTRY`, causing `SKILL_BY_ID.set(skill.id, skill)` to silently overwrite shared core skills (`python`, `fastapi`, `rest_apis`, etc.) and drop graph relationships. The `legacySkillsJson` merge also blindly overwrote `canonical`/`category` and dropped legacy `substitutes`. `IMPLIES_MAP` and `SUBSTITUTE_GRAPH` were exported empty instead of built from the federated registry.
- **`src/features/ats/knowledge/ontology/index.ts`**: `NON_EQUIVALENCE_GUARDS` indexed `NOT_EQUIVALENT_TO` and `DOES_NOT_PROVE` unidirectionally, causing reverse queries (`areNonEquivalent(B, A)`) to return `false`.
- **`src/features/ats/knowledge/ontology/validator.ts`**: The relationship target check (`:61-63`) was an empty `if (!ONTOLOGY_BY_ID.has(rel.targetId)) {}` no-op with no CI/CLI script entrypoint, leaving dangling targets, missing cross-domain taxonomy resolutions, and metadata conflicts undetected.

### Workstream B — B4 (JD Logic & Resume Structural Parsing)
- **`src/features/ats/engine/jdAnalyzer.ts` & `logicalExpression.ts`**: `analyzeJobDescription` never called `parseLogicalRequirement()`. Instead, it flattened any line matching `/\bor\b|\/|\beither\b/` with `>=2` skills into one `or_group`, demoting `sIdx > 0` branches to `'nice'` (corrupting `"dbt AND (Spark OR Flink)"`) and emitting 4 separate `JdRequirement`s (`python`, `java`, `cpp`, `csharp`) for `"Python/Java/C++/C#"` in `02_entry_non_cs_fresher`. Downstream `skillMatcher.ts:251-263` copied `Python`'s `"PYTHON"` quote onto missing `C++`, causing original `C1` failure (`02_entry_non_cs_fresher: C++ cited "PYTHON"`). Meanwhile `logicalExpression.ts` failed on English sentence wrappers, skipped compact `/` (`Python/Java/C++/C#`), lacked `SLASH_OR` tighter-than-`AND` precedence (`Selenium WebDriver and TypeScript/Java`), and lacked an `UNRESOLVED` AST state.
- **`src/features/ats/engine/sectionSplitter.ts`**: Skipped lines `> 55` characters and failed to parse multi-column pipe-delimited tables (`| CORE SKILLS | WORK EXPERIENCE`, `| SUMMARY: ...`), causing body skills in `12_tables_columns_layout` to collapse into `Contact & Header` (`C2` failure). Uppercase/section-like company names also risked false section splits, and downstream `index.ts:125-126` & `evidenceExtractor.ts:315,361,405` used `.find()`, dropping repeated sections.
- **`src/features/ats/engine/experienceParser.ts` & `projectParser.ts`**: Kept `entryStart` frozen at `section.charStart` and mixed document-level offsets into section-local `buildLineOffsets(section.content)`.

---

## 2. Exact Implementation Changes

### Workstream A (`ontology-worker`)
- **`src/features/ats/knowledge/taxonomy/index.ts`**: Implemented deterministic `federateTaxonomySources` sorting by `(sourcePriority, sourceName, id, canonical)`, merging `implies`, `substitutes` (max similarity per target), `aliases`, `contextHints`, and monotonic `ambiguous` without silent overwrites; populated `IMPLIES_MAP`, `SUBSTITUTE_GRAPH`, `ALIAS_LOOKUP_MAP`, `AMBIGUOUS_ALIAS_MAP`, `TAXONOMY_FEDERATION_REPORT`, and context-aware `resolveSkillByTerm()` / `resolveSkillCandidates()`.
- **`src/features/ats/knowledge/ontology/index.ts`**: Made `NON_EQUIVALENCE_GUARDS` bidirectional in both graph construction (`NOT_EQUIVALENT_TO` / `DOES_NOT_PROVE`) and `areNonEquivalent(sourceId, targetId)`, while keeping `DEPENDS_ON`, `IMPLEMENTS`, `SUPPORTS`, `SUBCATEGORY_OF`, `CHILD_OF`, `PART_OF`, `PREREQUISITE_OF` strictly directional (`getRelationshipTargets`, `hasDirectedRelationship`).
- **`src/features/ats/knowledge/ontology/validator.ts`**: Implemented structural, target, cycle (`CIRCULAR_PARENT` DFS across `parentCompetencyId`, hierarchical edges, and taxonomy `implies`), guard conflict, duplicate ID, and alias collision validation resolving against both `ONTOLOGY_BY_ID` and federated `SKILL_BY_ID`, separating hard `errors` from advisory `warnings` (`LEGACY_ALIAS_SHADOW`, `AMBIGUOUS_ALIAS_COLLISION`, `FEDERATION_METADATA_CONFLICT`, `--strict` mode) and adding CLI execution support.
- **Dangling target / typo repairs (zero competency semantic change):**
  - `src/features/ats/knowledge/ontology/competencies.ts`: Fixed `jwt_rbac` `'security'` -> `'cybersecurity'`; removed unreferenced `'relational_databases'` / `'data_orchestration'` edges.
  - `src/features/ats/knowledge/taxonomy/softwareLanguages.ts`: Removed nonexistent `javascript.implies: ['web_fundamentals']`.
  - `src/features/ats/knowledge/taxonomy/frontendWeb.ts`: Fixed `'nextjs'` -> `'next_js'` on `nuxtjs`/`remix`.
  - `src/features/ats/knowledge/taxonomy/backendFrameworks.ts`: Fixed `'nodejs'` -> `'node_js'` and `'expressjs'` -> `'express'` on `nestjs`/`fastify`; added `bun`, `deno`, `micronaut` targets referenced by existing `substitutes`.
  - `src/features/ats/knowledge/taxonomy/databasesData.ts`: Fixed `'apache_kafka'` -> `'kafka'` on `rabbitmq`; added `couchdb`, `solr`, `apache_pulsar`, `activemq`, `dagster` targets referenced by existing `substitutes`.

### Workstream B (`parsing-worker`)
- **`src/features/ats/engine/logicalExpression.ts`**: Extracted competency expressions around English prose wrappers, tokenized compact `/` as `SLASH_OR` (binding tighter than `AND`) while protecting atomic slash skills (`CI/CD`, `TCP/IP`, `TCP/UDP`, `PL/SQL`, `UI/UX`, `I/O`, `Pub/Sub`, etc.), added `extractAndConjuncts()` / `formatLogicalExpression()`, added `UNRESOLVED` state on malformed parentheses/operators, and returned `AMBIGUOUS` during evaluation of unresolved expressions.
- **`src/features/ats/engine/jdAnalyzer.ts`**: Integrated `parseLogicalRequirement()` into `analyzeJobDescription()`; handled inline must/preferred clauses (`splitInlineImportanceClauses`), preserved compound `AND`/`OR` conjuncts without demoting mandatory `AND` branches to `'nice'`, modeled pure `OR`-groups as a single `JdRequirement` unit with real primary `skillId` + `orGroupId` + `orAlternatives` + `logicalExpression` (fixing `C1` without synthetic IDs that broke `golden-resumes`), escalated repeated skills `nice -> must`, and recorded malformed clauses in `unresolvedRequirements`.
- **`src/features/ats/engine/sectionSplitter.ts`**: Added multi-column pipe-table decomposition and inline `| HEADER:` recognition without breaking single-pipe candidate/role headers; guarded uppercase/corporate-suffix employer names (`Technologies`, `Systems`, `Analytics`, `Solutions`, etc.) from becoming section splits while preserving true unknown uppercase headings (`PATENTS AND INVENTIONS`); mapped exact CRLF/LF `lineOffsets`; preserved duplicate section entries (`isDuplicate`, `duplicateIndex`) and fallback `Document Body` for headerless resumes.
- **`src/features/ats/engine/experienceParser.ts` & `projectParser.ts`**: Updated both to accept `ParsedSection | ParsedSection[]`, track true entry `lineOffset` / `charStart` / `charEnd` in the document coordinate space via `resumeText` / `section.content`, compute accurate `lineStart`/`lineEnd` against document line offsets, and handle multi-employer and parenthesized date formats cleanly.

### Coordinator Cross-Boundary Integration
- **`src/features/ats/engine/types.ts`**: Added optional `logicalExpression`, `unresolved`, `parseError` on `JdRequirement`, and `unresolvedRequirements` on `JdAnalysis`.
- **`src/features/ats/engine/index.ts`**: Switched `sections.find(s => s.type === 'experience' | 'projects')` to `sections.filter(...)` passed into `parseExperienceSection` and `parseProjectSection`.
- **`src/features/ats/engine/evidenceExtractor.ts`**: Switched `sections.find(...)` at `:315`, `:361`, `:405` to `sections.filter(...)` loops for `skills`, `education`, and `certifications`.
- **`package.json`**: Added `"ontology:audit": "npx tsx src/features/ats/knowledge/ontology/validator.ts"`.

---

## 3. Files Changed by Each Worker

- **Workstream A (`ontology-worker`):**
  - Modified: `src/features/ats/knowledge/taxonomy/index.ts`, `src/features/ats/knowledge/ontology/index.ts`, `src/features/ats/knowledge/ontology/validator.ts`, `src/features/ats/knowledge/ontology/competencies.ts`, `src/features/ats/knowledge/taxonomy/softwareLanguages.ts`, `src/features/ats/knowledge/taxonomy/frontendWeb.ts`, `src/features/ats/knowledge/taxonomy/backendFrameworks.ts`, `src/features/ats/knowledge/taxonomy/databasesData.ts`
  - Created: `tests/ats/phase10_2OntologyFederation.test.ts`
- **Workstream B (`parsing-worker`):**
  - Modified: `src/features/ats/engine/logicalExpression.ts`, `src/features/ats/engine/jdAnalyzer.ts`, `src/features/ats/engine/sectionSplitter.ts`, `src/features/ats/engine/experienceParser.ts`, `src/features/ats/engine/projectParser.ts`
  - Created: `tests/ats/phase10_2ParsingAndJdLogic.test.ts`
- **Coordinator Integration:**
  - Modified: `src/features/ats/engine/types.ts`, `src/features/ats/engine/index.ts`, `src/features/ats/engine/evidenceExtractor.ts`, `package.json`
  - Restored from `HEAD` (from Phase 10.1 accidental test write): `docs/validation-report.md`
  - Created: `docs/ats-engine/PHASE_10_2_PARSING_AND_KNOWLEDGE_INTEGRITY_REPORT.md`
- **Banned Section 6 Files Modified:** **None (0 files)** — `scorer.ts`, `seniorityMatcher.ts`, `metricExtractor.ts`, `citationValidator.ts`, `competencyMatcher.ts`, `skillMatcher.ts`, `authoritativeSnapshot.ts`, `reportState.ts`, `ResumeChecker.tsx`, PDF/DOCX exports, frozen benchmark fixtures, and Phase 02–09 reports were untouched in Phase 10.2.

---

## 4. Before / After Architecture

```
BEFORE (Phase 10.1):
- TAXONOMY_REGISTRY: [base..., ONTOLOGY_AS_TAXONOMY (no implies/substitutes)] -> last-write-wins overwrites python/fastapi/rest_apis
- NON_EQUIVALENCE_GUARDS: A -> B only (reverse B -> A returns false)
- ontology/validator.ts: empty target check no-op, 0 CLI/CI callers
- jdAnalyzer.ts: never calls logicalExpression.ts -> dbt AND (Spark OR Flink) flattened to or_group; Python/Java/C++/C# explodes 4 items -> C1 fails
- sectionSplitter.ts: skips >55-char pipe table lines -> 12_tables_columns_layout enters Contact & Header -> C2 fails
- index.ts / evidenceExtractor.ts: sections.find() drops duplicate sections
- experienceParser / projectParser: frozen entryStart = section.charStart, section-local lineOffsets

AFTER (Phase 10.2):
- federateTaxonomySources(): deterministic priority-sorted union of aliases, implies, substitutes, hints, conflicts + IMPLIES_MAP / SUBSTITUTE_GRAPH / AMBIGUOUS_ALIAS_MAP
- NON_EQUIVALENCE_GUARDS: bidirectional symmetric guards; directional semantic edges isolated
- ontology/validator.ts: full structural + federated target + cycle + conflict checks via `npm run ontology:audit`
- jdAnalyzer.ts -> parseLogicalRequirement(): preserves nested AND/OR ASTs, SLASH_OR tighter-than-AND, single real-ID OR-group unit (C1 passes), unresolvedRequirements for malformed parens
- sectionSplitter.ts -> index.ts / evidenceExtractor.ts (.filter()): splits multi-column pipe tables cleanly (C2 passes), guards corporate suffixes/uppercase employers, preserves all duplicate sections
- experienceParser / projectParser: advancing document-relative charStart/charEnd/lineStart/lineEnd per entry
```

---

## 5. Taxonomy and Ontology Merge Policy

- **Deterministic Source Precedence:** Sources are sorted canonically (`taxonomy` < `ontology` < `legacy`, then `sourceName`, `id`, `canonical`), eliminating order dependence.
- **Monotonic Union & Non-Destructive Overlay:**
  - `implies`: sorted set union across all contributing definitions.
  - `substitutes`: union keyed by target ID retaining the highest similarity weight.
  - `aliases` & `contextHints`: case-insensitive deduplicated union including `abbreviations` and non-winning alternate canonical spellings.
  - `ambiguous`: monotonic logical OR.
  - `canonical` / `category` / `weight`: retained from highest-priority source while every discrepancy is logged in `TAXONOMY_FEDERATION_REPORT.conflicts`.
- **Polysemy Preservation:** `ALIAS_LOOKUP_MAP` applies deterministic tie-breaking (`taxonomy`/`ontology` > `legacy` shadow, exact canonical match, priority, weight, ID), while overlapping legitimate aliases are retained in `AMBIGUOUS_ALIAS_MAP` and queryable via `resolveSkillCandidates()` and `resolveSkillByTerm(term, context)`.

---

## 6. Relationship and Alias Validation Results

- Executed `npm run ontology:audit` (`npx tsx src/features/ats/knowledge/ontology/validator.ts`):
  - **Checked:** `33` ontology nodes, `303` federated taxonomy skills, `332` relationships.
  - **Structural Errors:** `0` (`exitCode = 0`).
  - **Advisory Warnings:** `175` (`LEGACY_ALIAS_SHADOW`, `AMBIGUOUS_ALIAS_COLLISION`, `FEDERATION_METADATA_CONFLICT`), preserving legitimate legacy shadows/polysemous aliases without breaking runtime (`--strict` promotes alias collisions to errors for strict auditing, verified by `@qa-verifier` reporting 66 strict collision errors).

---

## 7. JD Logical-Expression Behaviour

- **`dbt AND (Spark OR Flink)`:** Parses into `AND [ LEAF('dbt'), OR [ LEAF('apache_spark'), LEAF('apache_flink') ] ]`. `dbt` stays `'must'` and `(Spark OR Flink)` stays `'must'` as one OR-group unit (`skillId: 'apache_spark'`, `orAlternatives: ['apache_flink']`), never flattened to `'nice'`.
- **`Python/Java/C++/C#` & `Selenium WebDriver and TypeScript/Java`:** Compact `/` binds tighter than `AND` (`SLASH_OR` < `AND` < `OR`), while known atomic slash skills (`CI/CD`, `TCP/IP`, `TCP/UDP`, `PL/SQL`, `UI/UX`, `I/O`) are protected from splitting.
- **Pure OR-Groups:** Emitted once using primary canonical `skillId` + `orGroupId` + `orAlternatives` + `logicalExpression` instead of cloning sibling items, eliminating `C1` cross-citation contamination and satisfying `C4`.
- **Malformed Expressions:** Unbalanced parentheses / dangling operators produce `operator: 'UNRESOLVED'`, are recorded in `jdAnalysis.unresolvedRequirements`, and evaluate to `AMBIGUOUS` rather than fabricating simpler logic.
- **Scope & Seeding:** Explicit vs preferred inline clauses are separated via `splitInlineImportanceClauses`; role defaults remain isolated in `inferredRecommendations`.

---

## 8. Resume Section-Splitting Behaviour

- **`12_tables_columns_layout` (Pipe Tables & Multi-Column Rows):** Splits column headers (e.g., `| CORE SKILLS | WORK EXPERIENCE`, `| PREVIOUS ROLES | EDUCATION`) and inline table headers (`| SUMMARY: ...`), de-interleaving column contents cleanly so skills/experience no longer leak into `Contact & Header` (`C2` passes; `missingStandardSections === []`, `experienceEntriesCount === 2`). Single-pipe role/contact headers (`Chloe Martin | ...`, `Software Engineer | Point72 (2022-Present)`) remain intact.
- **Corporate & Uppercase Guards:** Uppercase employers (`ACME ANALYTICS`, `APEX SYSTEMS`) and lines ending in employer suffixes (`Technologies`, `Systems`, `Analytics`, `Solutions`) or containing dates/locations/pipes are not falsely treated as headings, while genuine unknown uppercase headings (`PATENTS AND INVENTIONS`) remain preserved (`type: 'unknown'`).
- **Duplicate Sections:** Multiple `experience`, `projects`, `skills`, `education`, and `certifications` blocks receive unique `sectionId`s (`isDuplicate`, `duplicateIndex`) and are all consumed via `sections.filter(...)` in `index.ts` and `evidenceExtractor.ts`.

---

## 9. Source-Offset Verification

- Verified `experienceParser.ts` and `projectParser.ts` advance `charStart` per entry using true document coordinates rather than freezing at `section.charStart`.
- Document-relative `lineStart` and `lineEnd` align with `buildLineOffsets(resumeText)` across LF and CRLF inputs, and `resumeText.slice(entry.charStart, entry.charEnd)` slices each entry's actual span cleanly (verified across multi-entry experience and projects in `tests/ats/phase10_2ParsingAndJdLogic.test.ts` and `12_tables_columns_layout`).

---

## 10. `C1`, `C2`, and `C7` Results

- **`C1` (`tests/property_invariants.test.ts:12-34`):** **PASSED** (`0` violations; fixed `02_entry_non_cs_fresher: C++ cited "PYTHON"`).
- **`C2` (`tests/property_invariants.test.ts:37-60`):** **PASSED** (`0` violations; fixed 5 `Contact & Header` leaks in `12_tables_columns_layout`).
- **`C7` (`tests/property_invariants.test.ts:166-190`):** **DEFERRED TO SCORING/TEST PHASE (11 failures remain by design of `scorer.ts`)**.
  - **Verified Root Cause:** `scorer.ts:367-371` computes `Final Score = Clamp(Round(rawSubtotal + totalBonuses - totalDeductions), 0, 100)`, subtracting `appliedPenalties`. `tests/property_invariants.test.ts:173-186` sums the 7 positive `res.subscores` without subtracting `res.penalties`.
  - Fixing `sectionSplitter.ts` eliminated the `-6` missing-section penalties on `12_tables_columns_layout`, reducing its `C7` delta from `10` (`29 vs 19`) to `4` (`61 vs 57`, strictly `word_count_outlier`). Remaining observed deltas are exact penalty totals across 11 pairs (`03: 85 vs 81`, `04: 75 vs 71`, `05: 59 vs 55`, `06: 65 vs 61`, `07: 97 vs 93`, `08: 78 vs 67`, `09: 62 vs 58`, `10: 87 vs 83`, `12: 61 vs 57`, `13: 64 vs 57`, `14: 59 vs 55`).

---

## 11. Targeted Regression Test Output (Post-Integration Final Run)

| Command | Scope | Result | Key Observed Output |
|---|---|---|---|
| `npm run ontology:audit` | Ontology & Federated Taxonomy | **PASS** (`0`) | 33 ontology nodes, 303 skills, 332 rels, 0 errors, 175 warnings |
| `npx vitest run tests/ats/` | All 14 ATS Phase 02–10.2 Suites | **PASS** (`0`) | **14/14 files, 218/218 tests passed** (36.11s); incl. `phase03` (11), `phase04` (9), `phase08_3` A=90/B=88 (9), `phase09` F1=1.0000 (17), `phase10_2OntologyFederation` (14), `phase10_2ParsingAndJdLogic` (13) |
| `npx vitest run src/features/ats/__tests__/knowledge.test.ts golden-resumes.test.ts extendedGoldenResumes.test.ts` | Knowledge + 52 Golden Pairs | **PASS** (`0`) | **3/3 files, 11/11 tests passed** (`golden-resumes`: Precision 98.10%, Recall 94.50%; `extendedGoldenResumes`: Precision 100.00%, Recall 93.75%) |
| `npx vitest run tests/property_invariants.test.ts` | Stage 0 Invariants C1–C14 | **12/13 PASS** | `C1`, `C2`, `C3`–`C6`, `C8`–`C14` **PASS**; `C7` fails on 11/14 pairs due to `scorer.ts` penalty subtraction (documented above) |

---

## 12. TypeScript and Production Build Output

- `npx tsc --noEmit`: **PASS (`TSC=0`)** — zero TypeScript compilation or type errors.
- `npm run build` (`tsc && vite build`): **PASS (`BUILD=0`)** — Vite v8.3.0 production bundle built cleanly in `7.11s` with `93` build assets injected into `dist/sw.js`.

---

## 13. Verifier Objections and Resolutions

`qa-verifier` audited all diffs, adversarial cases, boundaries, and runtime behavior (`#23`) and issued **Verdict: `APPROVED`** for Phase 10.2 scope, surfacing these verified caveats:
1. **Integration Catch Fixed Mid-Phase:** An initial `jdAnalyzer.ts` revision emitted synthetic IDs (`or_java_or_selenium_or_typescript`, `or_react_or_websockets`) and parsed `"Selenium WebDriver and TypeScript/Java"` as flat `OR`, temporarily breaking `golden-resumes.test.ts` and `extendedGoldenResumes.test.ts`. Resolved cleanly before handoff to `qa-verifier` by restoring primary canonical IDs (`leafSkills[0].id`) and enforcing `SLASH_OR` tighter-than-`AND` precedence (`golden-resumes` Precision 98.10% / Recall 94.50%, `extendedGoldenResumes` Precision 100.00% / Recall 93.75%).
2. **Legacy `TAXONOMY_REGISTRY` Export:** Raw `TAXONOMY_REGISTRY` (`taxonomy/index.ts:467`) remains un-deduplicated for legacy compatibility; consumers must continue reading federated `ALL_TAXONOMY_SKILLS` / `SKILL_BY_ID`.
3. **Downstream `skillMatcher.ts` / `competencyMatcher.ts` Interactions (Out of Phase 10.2 Scope):** Documented in Section 14 below.

---

## 14. Remaining Limitations (Scoped for Subsequent Phase 10.3+ Remediation)

1. **Secondary OR-Group Alternatives (`skillMatcher.ts` / `competencyMatcher.ts`):** When a pure OR-group JD requirement (e.g., `Java/Kotlin` -> primary `skillId: 'java'`, `orAlternatives: ['kotlin']`) is matched against a resume that demonstrates ONLY the 2nd alternative (`Kotlin`):
   - Standalone `matchRequiredSkills` without `structuredProfile` misses `orAlternatives` in Pass 1/2 (silent false negative).
   - Full `runAtsEngine()` rescues `status = 'verified'` via `competencyMatcher.ts:216-238`, but `result.evidence` / `result.validatedCitations` remain `[]`, `competencyMatcher.ts:219-220` promotes skills-list-only / negated alternatives without checking `isNegated` or section provenance, and `competencyMatcher.ts:440-441` still re-parses `req.canonical` instead of reading `req.logicalExpression`.
2. **Repeated Must + Preferred OR-Group Collision:** If a JD lists `- Docker` under Requirements and `- Docker or Kubernetes` under Preferred, `jdAnalyzer` can emit both `'docker'` (must) and `'docker'`/`or_group` (nice).
3. **Pre-existing Trailing-Period Token Boundary (`evidenceExtractor.ts:35`, `skillMatcher.ts:36`) & `locator.sectionId`:** `(?![A-Za-z0-9+#.])` skips tokens followed immediately by a sentence-ending period (e.g., `"Kotlin."`), and `evidenceExtractor.ts` writes generic section type strings into `locator.sectionId` rather than `sec.sectionId`.
4. **`C7` Scoring/Test Alignment:** Align `tests/property_invariants.test.ts` `C7` or `scorer.ts` accounting in the scoring-unification phase.

---

## 15. Git Working-Tree State

Verified via final `git status --short`:
- Cleanly restored from `HEAD`: `docs/validation-report.md` (no longer dirty).
- Phase 10.2 modified tracked files: `package.json`, `src/features/ats/engine/{jdAnalyzer,experienceParser,projectParser,sectionSplitter,index,types}.ts`, `src/features/ats/knowledge/taxonomy/{index,softwareLanguages,frontendWeb,backendFrameworks,databasesData}.ts`.
- Phase 10.2 new files: `tests/ats/phase10_2OntologyFederation.test.ts`, `tests/ats/phase10_2ParsingAndJdLogic.test.ts`, `docs/ats-engine/PHASE_10_2_PARSING_AND_KNOWLEDGE_INTEGRITY_REPORT.md` *(note: `src/features/ats/engine/logicalExpression.ts`, `evidenceExtractor.ts`, and `src/features/ats/knowledge/ontology/*` were pre-existing untracked files from Phases 03–06 and remain cleanly updated in place)*.
- Zero commits or pushes executed.

---

## 16. Confirmation of Previous Phase 02–09 Preservation

Confirmed via `HEAD` (`5412214ee8fc0f7580fd5830776dba40fddc39ef`), `git status --short`, and `@qa-verifier` file inspection that all uncommitted Phases 02–09 implementation files (`scorer.ts`, `seniorityMatcher.ts`, `metricExtractor.ts`, `citationValidator.ts`, `competencyMatcher.ts`, `skillMatcher.ts`, `authoritativeSnapshot.ts`, `reportState.ts`, `ResumeChecker.tsx`, `exportPdf.ts`, `exportDocx.ts`, `exportDossier.ts`, `benchmarkFixtures.ts`, `docs/ats-engine/PHASE_02..09*`, and `docs/ats-engine/PHASE_10_1*`) remain completely preserved.
