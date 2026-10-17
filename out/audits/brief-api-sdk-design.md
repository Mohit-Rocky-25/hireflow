# Audit & Diagnosis: brief-api-sdk-design

- **Old Title**: Developer-First API SDK with Type Safety & Auto-Generation
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 35 hours
- **True Effort Estimate of Old Scope**: ~20-22 hours of implementation; ungrounded stated hours without task breakdown.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 4.5 / 10 (missing 5 fields, no anti-fake check)
- Technical Accuracy: 6.0 / 10 (targets lack 7 fields, claimed '100% strict type safety with 0 any types' using absolute words)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 7.0 / 10 (no direct salary claims, but exaggerated marketing language)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.72 / 10 (Band C)

### Problems Found (with exact quotes)
1. **Absolute words in targets**:
   > "Strict Type Coverage: 100% strict type safety with 0 any types verified via tsc --strict"
   *Flaw*: Targets used absolute language ('100%') and lacked reference environments and report formats.
2. **Missing operational sections**:
   *Flaw*: Missing `TARGET APPLICATION / STARTER INPUT`, `MILESTONES`, `DELIVERABLES`, `PREREQUISITES, ENVIRONMENT AND ACCOUNTS`, `OUT OF SCOPE`, and `LEARNING RESOURCES`.
3. **No Anti-Fake Verification**:
   *Flaw*: Screener checks tested static fixtures that could be hardcoded without building a real code generator.

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours; environment requires only local Node.js and TypeScript on 8GB RAM at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Generation latency is bounded at < 8.0s on Petstore spec; retry recovery is evaluated against MSW injected faults.
3. **Is there a CPU/local/free fallback?** YES. Standard tsc compile mode without tsup bundling if local bundler bindings fail.
4. **Can test data be created in minutes?** YES. Standard OpenAPI 3.0 specification fixtures provided in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Verification script runs full generation, type checks, and retry tests in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. OpenAPI parsing duration, tsc strict mode compilation, and jittered HTTP retry recovery are specific to SDK generators.
7. **Is every bullet claim verified by rubric?** YES. Type safety verified by Check 2; generation speed verified by Check 1; retries verified by Check 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] generates and validates client code from a dynamic runtime specification.
9. **Are all terms accurate?** YES. Accurately covers OpenAPI 3.0, AST normalization, discriminated unions, and dual CJS/ESM bundling.
10. **Does problem statement promise only what is verified?** YES. Spec parsing, type-safe generation, retry runtime, and bundling are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strict synthetic mock API data policy.
12. **Are all hard parts technical?** YES. 4 detailed technical challenges covering circular references, discriminated unions, module compatibility, and retry storms.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.43 / 10 (Band A)

### Change Log
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split private npm publishing and SSE streaming to Extended Path (+12h).
- Scale Targets: Replaced absolute 100% claims with 7-field targets (generation latency, strict compile verification, and retry recovery rate).
- Verification: Added 5 concrete rubric checks including dynamic spec anti-fake test.
- Completeness: Added complete Starter Input spec, 4 milestones summing to 29h, environment specs, and learning resources.
- Resume Formula: Structured with Google X-Y-Z formula using measured placeholders [OPERATION_COUNT], [GENERATION_TIME] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
