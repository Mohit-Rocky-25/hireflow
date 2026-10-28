# HireFlow Project Brief Standard v2 & Quality Specification

> **Version**: 2.0.0  
> **Status**: Approved Standard  
> **Scope**: All project build briefs in the HireFlow catalog (158 briefs across 18 specialized engineering tracks).  
> **Prime Objective**: Every brief must be correct, consistent, feasible, measurable, verifiable, teachable, honest on a resume, safe, current, and distinct.

---

## 1. Severity Scale

Every defect, finding, or discrepancy discovered in a brief is assigned an objective severity:

- **S0 (Critical Blocker / Infeasible / False / Unsafe)**:
  - Misleads or blocks a student from completing the project.
  - States a false technical claim, an impossible performance target, or an unrunnable command.
  - Requires hardware or paid services that are inaccessible to a typical second-year student without a free/emulated fallback path.
  - Presents an unethical, unlawful, or dangerous testing instruction without safety containment.
- **S1 (Major Quality Defect / Inconsistency / Unverifiable)**:
  - Internal contradiction between sections (e.g. stack lists Go, but architecture mandates Python).
  - Unverifiable screener rubric that depends on self-authored student assertions without an external verification harness.
  - Hidden scope or unstated mandatory dependencies (e.g. requires external API keys or undocumented backend services).
  - Gameable checks that can be satisfied by a trivial stub without implementing the real algorithmic core.
  - Linux-only syscalls without Windows / WSL2 / Docker prerequisites.
- **S2 (Minor Defect / Suboptimal Pedagogy / Weak Signal)**:
  - Unpinned tool versions prone to future breaking drift.
  - Weak or generic resume bullet phrasing that lacks high-signal metric impact.
  - Missing structured pedagogical progression (monolithic architecture without milestone breakdown).
  - Absolute phrasing ("100%", "zero", "never") in claims that cannot be statistically falsified.
  - Missing stuck-point remediation hints or missing official reference documentation citations.
- **S3 (Cosmetic / Formatting / Presentation)**:
  - Export formatting issues, duplicate rubric numbering, typography glitches.
  - Minor text layout misalignment or non-standard punctuation.

---

## 2. The 15 Review Dimensions

Every project brief is evaluated across all fifteen dimensions:

### D-01: Technical Correctness
- **Criteria**: Facts, terminology, library names, protocol specifications (RFCs), and architectural patterns are strictly accurate.
- **Pass**: All protocol names (e.g. RFC 9112 HTTP/1.1, RFC 7636 PKCE, RFC 6455 WebSockets), data structures, and algorithmic principles match official documentation.
- **Fail**: Mislabeling concepts (e.g. calling homomorphic encryption "zero-knowledge", or calling a hash table a B-Tree).

### D-02: Feasibility
- **Criteria**: A second-year engineering student in India with a standard mid-range laptop (Windows 10/11, 8GB-16GB RAM, standard internet, no paid cloud accounts) can execute and verify the project.
- **Pass**: Complete local execution path using open-source tools, emulators (LocalStack, MinIO), or Docker. Any heavy dependency (e.g. GPU, cloud APIs) provides a free quantized CPU fallback.
- **Fail**: Hard requirements on expensive enterprise cloud subscriptions, paid API keys, or enterprise GPU hardware without fallbacks.

### D-03: Measurability
- **Criteria**: Every quantitative performance target is explicitly measurable with a defined unit, measurement method, and reference environment.
- **Pass**: Targets specify pass thresholds, stretch targets, measurement tools (e.g. wrk, k6, locust), and baseline hardware (e.g. "on 4-core 8GB host").
- **Fail**: Floating numbers with no environment (e.g. "> 10,000 req/sec" with no core count, concurrency, or duration specified).

### D-04: Internal Consistency
- **Criteria**: Component names, stack items, port numbers, scale numbers, and rubric assertions agree 100% across all sections.
- **Pass**: Every technology named in the problem statement or architecture is present in `techStack` and exercised in `verificationRubric`.
- **Fail**: Text says "stores vectors in Qdrant", but `techStack` lists `pgvector`, and rubric queries `ChromaDB`.

### D-05: Completeness
- **Criteria**: Brief contains everything required to take a project from an empty directory to verified completion.
- **Pass**: Explicit prerequisites, architecture data flow, deliverable files, and Definition of Done provided.
- **Fail**: Hand-waving implementation details (e.g. "implement machine learning model" without specifying framework, inputs, outputs, or loss function).

### D-06: Verifiability
- **Criteria**: Rubric checks are objective and executed against pre-packaged verification kits rather than self-authored student scripts.
- **Pass**: Rubric provides explicit CLI commands with expected exit codes, byte-exact outputs, or bracketed outcomes `[...]` evaluated against reference fixtures.
- **Fail**: "Run my_tests.py and verify it passes" where the student authors both the code and the test assertions.

### D-07: Scope and Effort Realism
- **Criteria**: Estimated build hours honestly reflect the scope of work, including setup, debugging, and verification.
- **Pass**: Realistic hour ranges (e.g. 16h–24h for beginner, 24h–36h for intermediate, 36h–48h for advanced) that account for all components.
- **Fail**: Flat cloned hours across tiers (e.g. all intermediate briefs labeled 28h) or massive underestimations (e.g. building a full distributed Raft consensus database in 15h).

### D-08: Pedagogy
- **Criteria**: Projects are structured into 4–8 progressive milestones with intermediate testable checkpoints.
- **Pass**: Logical build order (e.g. Lexer -> AST Parser -> Type Checker -> Evaluator -> REPL), with known stuck points and conceptual guidance.
- **Fail**: Monolithic wall of requirements with no progression, forcing students to build everything before seeing anything run.

### D-09: Career Value & Recruiter Signal
- **Criteria**: Provides high-signal, defensible portfolio artifacts and honest resume bullets that stand up to rigorous senior technical interviewer questioning.
- **Pass**: Metric-backed resume bullet formulas bound to verifiable test outputs; interview defense pack addressing trade-offs, bottlenecks, and failure modes.
- **Fail**: Buzzword-heavy, unsubstantiated bullets claiming "100% bug-free architecture" or trivial CRUD apps claiming senior-level scale.

### D-10: Originality and Voice
- **Criteria**: Project addresses real-world, non-cookie-cutter engineering challenges with distinct architectural identity.
- **Pass**: Focuses on deep systems, infrastructure, data engines, security tools, and developer platforms.
- **Fail**: Generic clone projects (e.g. "Yet Another Todo App", "Basic Blog with Firebase") with templated boilerplate.

### D-11: Accessibility & Inclusion
- **Criteria**: Plain, concise English; cross-platform compatibility; clear documentation of Windows, macOS, and Linux setup instructions.
- **Pass**: WSL2 / Docker container instructions for Linux-specific syscalls; zero financial cost barriers.
- **Fail**: Undocumented Linux-only requirements that crash on Windows command prompts.

### D-12: Safety, Ethics, and Legal Compliance
- **Criteria**: All security, scraping, and networking briefs enforce strict lawful testing boundaries.
- **Pass**: Clear lawful-use disclaimers; tests run only against local loopback ports, isolated Docker containers, or synthetic fixtures; synthetic data only for sensitive domains (finance, healthcare, PII).
- **Fail**: Instructions to scan external production IP ranges, scrape copyrighted websites violating robots.txt, or use real consumer PII.

### D-13: Currency and Maintainability
- **Criteria**: Tooling, SDKs, and dependencies specify modern, non-deprecated releases with pinned minimum semver versions.
- **Pass**: Modern LTS stacks (e.g. Go 1.22+, Python 3.11+, Node 20+, React 18+); review dates recorded.
- **Fail**: Recommending deprecated libraries (e.g. `request` in Node, `pkg_resources` in Python, Angular.js) or unpinned wildcards.

### D-14: Presentation
- **Criteria**: High-fidelity rendering across Web UI, plain-text export, and Markdown compendiums.
- **Pass**: Clean markdown, proper code block fences, zero brand typos (HireFlow, hireflow.io), and cleanly indexed rubrics without duplicate numbering.
- **Fail**: Duplicate rubric numbering (`[ ] 1. 1. `), text running together, or unescaped characters breaking JSON/Markdown parsers.

### D-15: Domain-Specific Correctness
- **Criteria**: Adheres to the specific technical standards, compliance norms, and mathematical invariants of the brief's domain (e.g. ISO 20022 for payments, IEEE 754 float traps in ledgers, Ragas for RAG evaluation, POSIX compliance for systems).
- **Pass**: Domain standards explicitly verified against domain checklist packs.
- **Fail**: Floating point arithmetic used for monetary balances, ungrounded LLM completions treated as verified facts, or lack of idempotency on payment APIs.

---

## 3. Definition of Done (DoD) for a Project Brief

A project brief is certified **DONE (Grade A / Production Ready)** if and only if it satisfies all of the following conditions:

1. **Zero Open S0 or S1 Findings**: No critical, infeasible, false, contradictory, or unverifiable defects exist.
2. **At Most Two Open S2 Findings**: Minor items (e.g. cosmetic phrasing optimizations) are bounded and documented.
3. **Structured Metrics with Pass & Stretch Targets**: Every performance claim is mapped to a discrete metric with:
   - Name and Unit
   - Pass Threshold (minimum required for certification)
   - Stretch Target (aspirational target for top candidates)
   - Measurement Method (CLI tool and command)
   - Reference Hardware / Environment
   - Evidence Status (`verified`, `analytically-checked`, or `spec-only`)
4. **Objective Verification Kit**: Every rubric item maps 1:1 to an automated, non-student-authored verification script or test fixture.
5. **Realistic Effort Model**: Build hours are computed from component complexity and presented as a realistic range (`[minHours, maxHours]`).
6. **Prerequisites & Cost Transparency**: OS compatibility (Windows/WSL2/Linux), hardware requirements, memory footprint, and an explicit **$0 Free-Tier Path** are stated.
7. **Pedagogical Milestones & Hints**: Divided into 4–8 progressive milestones with intermediate deliverables and stuck-point hints.
8. **Interview Defense & Resume Bullets**: Contains at least 3 resume bullet variants and 8+ interview defense questions with architectural trade-offs.
9. **Safety, Privacy & Lawful Scope**: Disclaimers present for security/scraping/financial projects; synthetic test data mandated.
10. **Pinned Tool Versions & Review Metadata**: Minimum semver versions pinned for all tools; `lastReviewed` and `reviewBy` dates recorded.
