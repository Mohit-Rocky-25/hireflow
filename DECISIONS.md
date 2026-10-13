# Architectural Decisions Log: Tailor Engine

This file records all architectural decisions, ambiguity resolutions, and dependency rationales following Section 2 of `docs/MASTER_SPEC.md`.

---

## Decision D01: Phase 0 Zero Product Code Mutation
- **Context**: Master Spec Kickoff requires failing tests for B01–B20 to be written first before altering product code.
- **Decision**: Keep all product files (`src/lib/...`, `src/features/...`) unchanged during Phase 0. Tests must directly target existing parser, exporter, scoring, and UI helper functions to reproduce bugs B01 through B20 in their failing state.
- **Rationale**: Strict test-driven verification ensures every bug is reproduced faithfully before implementation begins.

## Decision D02: Unified Layout Tree vs Independent Exporters
- **Context**: B01, B03, B04, B14, and B20 stem from exporters making independent content and styling decisions.
- **Decision**: In Phase 4, preview, PDF, DOCX, and LaTeX will consume an identical intermediate `LayoutTree`. Exporters will be pure dumb translators that do not omit or reorder sections.
- **Rationale**: Satisfies Prime Directive P5 ("ONE LAYOUT TREE, MANY RENDERERS").

## Decision D03: Ambiguity Resolution on Missing Data
- **Context**: Users occasionally provide incomplete dates, missing locations, or unqualified claims.
- **Decision**: Never synthesize or fabricate missing data. Emit a `QUESTION` with an empty input and plain-language explanation.
- **Rationale**: Satisfies Prime Directive P3 ("NEVER FABRICATE. ASK, DON'T ANSWER").

## Decision D04: Cross-Fixture Property Test Harness
- **Context**: Property invariants must prevent regressions across arbitrary resume and JD combinations.
- **Decision**: Combinatorial harness in `src/__tests__/tailor/property-harness.test.ts` tests 12 fixtures against 10 diverse JDs for coverage (P2), zero fabrication (P3), and formatting integrity.
- **Rationale**: Meets Phase 1 exit criteria and ensures continuous quality enforcement.

## Decision D05: Fully Generalized Universal Fact Ledger (Phase 2)
- **Context**: User explicitly directed that candidate logic must be 100% universal and generalized for any profession (Engineering, Nursing, Design, Product, Marketing, Sales), not bespoke to any single individual or archetype.
- **Decision**: Fact ledger decomposes arbitrary text into atomic facts with tokenization, dynamic career stage inference (`student`, `early_career`, `experienced`, `career_changer`), and locale detection (`IN`, `US`, `UK`, `EU`, `GLOBAL`). Invariant P2 (Zero Loss) is proven green across all 12 diverse fixtures in `ledger-coverage.test.ts`.
- **Rationale**: Directly aligns with Prime Directive P2, P7, and user instruction.

## Decision D06: Cross-Discipline Section Recognition & Normalization (Phase 3)
- **Context**: Profiles in non-software domains (e.g., Registered Nurse with "Clinical Skills", Marketing Manager with "Skills & Tools", Healthcare with "Licenses & Certifications") must never have sections or skills dropped.
- **Decision**: Expanded `HEADING_DEFINITIONS` aliases and regex fallbacks across `skills`, `experience`, and `certifications` to natively support healthcare, marketing, design, and business terminology.
- **Rationale**: Eliminates domain bias, ensuring universal candidate applicability.

## Decision D08: Full Integration of 10 Master Knowledge Base Datasets
- **Context**: 10 comprehensive knowledge base files (`section_aliases.json`, `levels.json`, `skills_taxonomy.json`, `verbs.json`, `weak_phrases.json`, `locales.json`, `scoring.json`, `degrees.json`, `jd_rules.json`, `format_lint_rules.json`) were provided to establish the canonical reference system for the tailoring engine.
- **Decision**: Integrated all 10 datasets into both `src/kb/` and `kb/`, and built a typed central KB helper module (`src/lib/tailorEngine/kb/index.ts`) providing cross-discipline section aliasing, seniority fit determination, locale paper sizing, verb past tense lookup, and weak phrase polishing.
- **Rationale**: Provides domain-agnostic, deterministic foundations for all candidate professions with zero hardcoding.

## Decision D09: Multi-Format Exporter Parity & Formatting Guardrails
- **Context**: In Phase 4-7, regressions B01–B20 were resolved across DOCX, LaTeX, Preview, and the Suggestion Engine.
- **Decision**: 
  1. Synchronized DOCX and LaTeX exports to render Achievements, Leadership, and Certifications with identical section order.
  2. Replaced static tab stop positions with dynamic text width calculations based on candidate paper standard (A4 vs Letter).
  3. Corrected LaTeX hyphen handling to preserve lexical hyphens and en/em dashes while stripping leading bullet symbols.
  4. Implemented stateMachineReady with initial 'pending' states, unified scoring, and underfill suggestions for short resumes.
- **Rationale**: Guarantees Prime Directives P1–P7, with 21/21 regression tests passing and 128/128 total tests green across all 5 suites.


