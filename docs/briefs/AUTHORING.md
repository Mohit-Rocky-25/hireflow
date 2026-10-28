# HireFlow Brief Authoring & Maintenance Guide

This guide establishes the mandatory engineering process for adding new project briefs to the HireFlow catalog, updating existing briefs, and verifying them against the automated quality gate (`npm run briefs:gate`).

---

## 1. Quality Standards & Principles
Every brief in the HireFlow catalog must satisfy the **15 Quality Dimensions** outlined in `docs/briefs/STANDARD.md`:
1. **D-01 Technical Correctness**: Pin exact production tools and LTS semver (e.g. `Python 3.11+`, `Go 1.22+`, `PostgreSQL 16+`). Never leave versions unpinned.
2. **D-02 Feasibility**: Must be runnable on standard student hardware (4 vCPU, 8GB RAM). GPU requirements must supply quantized CPU (GGUF / ONNX) fallback paths. Linux syscalls (`epoll`, `splice`) must document WSL2/Docker container prerequisites.
3. **D-03 Measurability**: All scale targets must specify the hardware baseline environment and empirical unit. Conflicting numbers between sections are strictly forbidden.
4. **D-06 Verifiability**: Every brief must ship an automated verification kit in `tests/fixtures/briefs-kits/<briefId>/`. Students must **never** author their own verification tests.
5. **D-10 Resume & Signal Honesty**: Formulas must never make absolute or unfalsifiable claims ("100%", "zero downtime", "never fails"). Use bounded empirical engineering metrics.
6. **D-11 Safety & Legal Boundaries**: Security briefs must provide an explicit scope-of-lawful-use notice. Data must be 100% synthetic with zero real PII.

---

## 2. Step-by-Step: Adding a New Brief

### Step 1: Add Brief to Catalog
Add the brief JSON object to `src/data/suite/project-briefs.json`. Ensure all mandatory fields are defined:
- `id`: unique kebab-case identifier (e.g. `brief-distributed-cache`)
- `title`: comprehensive, descriptive engineering title
- `domain`: one of the 18 standard HireFlow engineering domains
- `difficulty`: `'beginner'` | `'intermediate'` | `'advanced'`
- `estimatedHours`: calibrated effort estimate (e.g. 20, 30, 45)
- `coveredSkills`: array of canonical skills matching `src/data/ats/skills-taxonomy.json`
- `techStack`: array of semver-pinned dependencies
- `problemStatement`: clear technical problem with prerequisite notes
- `architecture`: data flow and structural component breakdown
- `scaleTargets`: bounded throughput and latency targets on reference hardware
- `verificationRubric`: array of bracketed assertions `[...]` mapped to the verification runner
- `portfolioBulletFormula`: diverse starting action verb, bounded empirical metric slots
- `lastReviewed`: ISO date string (e.g. `2026-10-28`)
- `reviewBy`: ISO date string set to 1 year validity (`2027-10-28`)
- `safetyLegal`: lawful use scope, synthetic data flag, and `'clear'` status

### Step 2: Generate Verification Kit & Mutation Self-Tests
Run the automated verification kit generator:
```bash
npx tsx scripts/briefs/generate_verification_kits.ts
```
This scaffolds:
- `manifest.json`: Check definitions mapped 1:1 to rubric items
- `fixtures/golden_reference.json`: Clean golden test vector (MUST PASS)
- `fixtures/mutation_broken_integrity.json`: Integrity mutation (MUST FAIL)
- `fixtures/mutation_broken_latency.json`: SLA latency mutation (MUST FAIL)
- `verify.mjs`: Standalone cross-platform runner
- `kit.test.ts`: Vitest mutation test suite

Verify your kit mutation self-test:
```bash
npx vitest run tests/fixtures/briefs-kits/<your-brief-id>/kit.test.ts
```

### Step 3: Run the Quality Gate
Execute the master quality gate:
```bash
npm run briefs:gate
```
The gate asserts:
- Zero S0/S1 linter findings
- 1:1 rubric to kit check mapping
- Valid and current currency dates (`reviewBy`)
- Resume bullet verb diversity (< 40% dominant verb threshold)
- Dataset schema integrity

### Step 4: Regenerate Exports
Compile deterministic Markdown, text, and zip archives:
```bash
npx tsx scripts/export-all-hireflow-briefs.ts
```

---

## 3. Maintenance & Calibration
- **Annual Review**: When `reviewBy` dates approach expiration, review technical currency of techStack versions and bump `lastReviewed` and `reviewBy`.
- **Effort Model Calibration**: As real student completion telemetry becomes available, calibrate `estimatedHours` in 5-hour increments and re-verify difficulty distribution with `npm run briefs:gate`.
