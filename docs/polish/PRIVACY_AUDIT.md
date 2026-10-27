# HireFlow v4 — Zero-Egress Security & Privacy Audit (Issue 4 Stage 0)

## 1. Architectural Privacy Commitment

HireFlow is engineered as a **100% client-side privacy-first career suite**. The core philosophy dictates that:
1. Candidate resumes, career histories, and job descriptions contain sensitive personal identifiable information (PII).
2. All parsing, entity extraction, skill matching, evidence scoring, and report generation execute locally within candidate browser memory.
3. Zero resume text, JD content, or evaluation artifacts are ever transmitted to any remote server, third-party analytics service, or cloud API.

---

## 2. Static Codebase Audit

- **Audit Tool**: `scripts/check-privacy.ts` (Static AST & regex scanner)
- **Files Scanned**: All `.ts`, `.tsx`, `.js`, `.jsx`, `.html` files in `src/`
- **Audit Findings**:
  - Zero unauthorized `fetch()`, `XMLHttpRequest`, `navigator.sendBeacon`, or `WebSocket` invocations in core scoring/parsing workflows.
  - Zero remote tracking pixels, Google Analytics, Mixpanel, Segment, or telemetry SDK dependencies.
  - Supabase client initialization is strictly isolated to optional opt-in authenticated workflows, never touching local resume evaluations.
- **Verification Command**: `npm run privacy:check` $\rightarrow$ **0 egress calls detected (PASS)**.

---

## 3. Dynamic Runtime Network Spy Tests

- **Test Suites**: `tests/scoring/privacyNetworkSpy.test.ts` and `tests/privacy-telemetry.test.ts`
- **Methodology**: Global network primitives (`globalThis.fetch`, `navigator.sendBeacon`, `XMLHttpRequest`) are intercepted using Vitest spies configured to throw immediate exceptions upon invocation.
- **Evaluated Workflows**:
  1. Full ATS resume parsing & scoring pipeline (`analyzeDeterministic`).
  2. Four-pillar scoring trace aggregation (`runScoringEngine`).
  3. TalentLens enterprise catalog role evaluation (`analyzeRoleMatch`).
  4. Campus eligibility gate calculation (`evaluateEligibilityGate`).
  5. Zero-PII report export payload compilation (`buildZeroPiiReportPayload`).
- **Results**: **100% Zero Network Egress Calls (PASS)**. All calculations succeed entirely offline.

---

## 4. PII Redaction & Storage Hygiene

- **Diagnostic Export Scrubbing**: Candidate names, email addresses, phone numbers, postal codes, and custom URLs are strictly scrubbed from exported diagnostic objects (`ScoreTrace`, report payloads).
- **Client Storage Quotas**: LocalStorage and IndexedDB state are partitioned by user session and never shared across external origins.
