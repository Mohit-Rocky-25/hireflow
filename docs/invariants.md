# HireFlow v3 — Invariant & Principles Verification Matrix

Every non-negotiable principle (P-1 to P-10) and core architectural invariant in HireFlow v3 is strictly enforced by an automated test. There are zero unverified assertions.

| Principle / Invariant | Core Requirement | Exact Test File | What the Test Asserts |
| :--- | :--- | :--- | :--- |
| **Never Fabricate (Truth Gate)** | P-1, R6.9 | `tests/tailor/truth-gate.test.ts` | 25 adversarial cases (invented metrics, upgraded verbs, ungrounded technologies, swapped dates, stuffed keywords) are blocked; 10 legitimate grounded rewrites pass. |
| **Deterministic Engines** | P-2, R1.3 | `tests/determinism.test.ts` | Ingesting and analyzing the same resume/JD twice with injected clock yields deep-equal output with zero Math.random() or non-deterministic variance. |
| **Explainable Evidence** | P-3, R4.5, R5.5 | `tests/matcher/matcher.test.ts`, `tests/roaster/writing-rules.test.ts` | Every matched skill and finding carries verbatim span offset citations, evidence tier (L0–L3), confidence, and plain-English reasons. |
| **Honest Naming & Copy** | P-4, R2.1 | `tests/copy-audit.test.ts` | Greps entire codebase and docs for banned phrases ("auto-reject", "75%", "guarantee", "Callback Probability", "Glassdoor-calibrated"); fails on any match. |
| **Config, Not Magic Numbers** | P-5, R1.2 | `tests/config-lint.test.ts` | Scans all `src/engine/` modules to confirm zero hardcoded scoring weights or threshold literals; all weights reside in typed `src/config/`. |
| **Data Provenance & Zod Schemas** | P-6, R1.4 | `src/data/__tests__/validateData.test.ts` | Validates credentials, roles, companies, ladders, and briefs against Zod schemas; enforces valid ISO dates, URL shapes, and zero duplicate IDs. |
| **Content Parity (Multi-Format)** | R6.10 | `tests/tailor/content-parity.test.ts` | Normalized text output of the LayoutTree == TXT export == DOCX export re-read via mammoth in the test environment. |
| **Non-Destructive Ledger** | R1.5, R6.5 | `src/engine/ledger/__tests__/ledger.test.ts` | Base candidate ledger remains immutable; tailor operations generate non-destructive versioned variant diffs with undo/redo capabilities. |
| **Zero Silent Loss** | R6.11 | `tests/tailor/content-parity.test.ts` | Any ledger bullet or item omitted from a tailor variant is tracked in the archived items collection with one-click restore. |
| **WCAG AA Contrast** | R1.6 | `src/__tests__/a11y/contrast.test.ts` | Evaluates color tokens against WCAG 2.1 AA specifications; enforces a minimum contrast ratio of 4.5:1 for body text and 3:1 for large headings/charts. |
| **Zero-Egress Privacy** | R8.2 | `tests/privacy-telemetry.test.ts`, `scripts/check-privacy.ts` | Statically scans `src/` for unauthorized `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, or dynamic imports; enforces zero data leakage. |
| **Engine Robustness & Resilience** | R8.3 | `tests/robustness/engineRobustness.test.ts` | Evaluates extreme boundary inputs: empty text, 200 KB documents, Devanagari script, emoji, and malformed symbols without unhandled crashes. |
