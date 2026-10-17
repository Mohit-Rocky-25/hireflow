# Audit & Diagnosis: brief-graphql-to-sql-compiler

- **Old Title**: GraphQL to SQL Compiler & Query Optimizer
- **Domain**: Full-Stack Web
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic AST traversal; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Hasura, PostGraphile, and Prisma all solve this at scale')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an internal query compiler using HTTP web-service throughput targets.
2. **Commercial employer marketing**:
   > "Hasura, PostGraphile, and Prisma all solve this at scale. Any company building a data-intensive GraphQL API needs query optimization..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using TypeScript and PostgreSQL at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Compilation latency (< 2.5ms) and single-query round-trip reduction (1 single query) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. SQLite dialect compiler output with in-memory execution if PostgreSQL is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic 8-table relational schema and 50 benchmark GraphQL queries included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full compiler test suite and dynamic query check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. AST compilation latency, database round-trip reduction, and SQL parameterization rate are unique to query compilers.
7. **Is every bullet claim verified by rubric?** YES. Round-trip reduction verified by Check 1; compilation latency and parameterization verified by Checks 0 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] constructs a dynamic aliased GraphQL query at runtime and asserts exact SQL LATERAL reflection.
9. **Are all terms accurate?** YES. Accurately covers GraphQL AST visitor, schema mapping, LATERAL subqueries, and parameterized SQL clauses.
10. **Does problem statement promise only what is verified?** YES. AST visitor, join generator, filter transpiler, complexity analyzer, and SQL formatter are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic relational schemas; no personal data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering AST selection set mapping, LATERAL subqueries, parameterized filters, and static complexity scoring.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved dynamic SQL view materialization and multi-dialect support to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic compiler metrics (compilation latency, database round-trip reduction, and SQL parameterization rate).
- Removed Banned Content: Removed employer marketing regarding Hasura, PostGraphile, and Prisma.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic aliased query test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ROUNDTRIP_COUNT] and [COMPILATION_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
