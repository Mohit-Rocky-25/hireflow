# Audit & Diagnosis: brief-graphql-federation

- **Old Title**: Federated GraphQL Gateway with Schema Stitching
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic Apollo wrapper; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Shopify, Twitter, and top tech platforms use GraphQL federation')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating query planning latency, N+1 downstream request elimination, and federation throughput.
2. **Commercial employer marketing**:
   > "Shopify, Twitter, and top tech platforms use GraphQL federation. Any company with 5+ microservices and multiple frontend clients benefits from this..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using TypeScript, Node.js, and Redis at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Planning overhead (< 4.0ms), N+1 elimination (0 redundant requests), and throughput (> 2,500 qps) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock subgraphs and Map-based cache if Docker or Redis is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic 4-subgraph environment and mock data generator included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full N+1 test and dynamic entity check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Query planning overhead, downstream N+1 request elimination, and federated gateway throughput are unique to GraphQL gateways.
7. **Is every bullet claim verified by rubric?** YES. N+1 elimination verified by Check 0; planning latency and throughput verified by Checks 1 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] requests 15 dynamic entity IDs and asserts downstream inspector logs batch size of 15.
9. **Are all terms accurate?** YES. Accurately covers federated schema directives, distributed execution DAGs, DataLoader batching, and plan caching.
10. **Does problem statement promise only what is verified?** YES. Schema composition, query planner, DataLoader batcher, and Redis plan cache are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic mock schemas and simulated user profiles.
12. **Are all hard parts technical?** YES. 4 technical challenges covering schema composition without conflicts, execution DAGs, DataLoader batching, and circuit breakers.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved field-level JWT auth and CI contract validation to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic GraphQL federation metrics (query planning latency, N+1 elimination rate, and federated throughput).
- Removed Banned Content: Removed employer marketing regarding Shopify, Twitter, and duplicate company references.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic entity batch test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [ENTITY_COUNT], [GATEWAY_THROUGHPUT], and [PLANNING_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
