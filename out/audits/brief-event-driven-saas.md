# Audit & Diagnosis: brief-event-driven-saas

- **Old Title**: Multi-Tenant SaaS Backend with Event-Driven Architecture
- **Domain**: Full-Stack Web
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of core CRUD implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (extreme employer marketing duplication: 'Zoho, top tech platforms, top tech platforms, top tech platforms', 'commands senior engineering titles')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating multi-tenant isolation, outbox publishing, and webhook delivery.
2. **Extreme marketing duplication**:
   > "Every B2B SaaS product in India  Zoho, top tech platforms, top tech platforms, top tech platforms  faces multi-tenancy challenges... commands senior engineering titles at B2B software companies."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 39 hours (ADVANCED); runs locally on 8GB RAM CPU using TypeScript, Node.js, and Docker Compose at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Outbox latency (< 250ms), zero cross-tenant leakage (0 in 1,000), and webhook success (> 95%) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory event bus and SQLite tenant tables if Docker cannot be started.
4. **Can test data be created in minutes?** YES. Synthetic 50-tenant configuration and test dataset generator included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full penetration suite and dynamic tenant check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Cross-tenant leakage rate, outbox publishing latency, and webhook delivery success are unique to multi-tenant event-driven backends.
7. **Is every bullet claim verified by rubric?** YES. Tenant isolation verified by Check 0; outbox delivery verified by Check 1.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] creates two dynamic tenants at runtime and asserts cross-tenant resource rejection.
9. **Are all terms accurate?** YES. Accurately covers PostgreSQL RLS, transactional outbox pattern, Kafka event streaming, and HMAC webhooks.
10. **Does problem statement promise only what is verified?** YES. RLS isolation, outbox publisher, usage aggregation, and reliable webhooks are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic business entities and mock customer profiles.
12. **Are all hard parts technical?** YES. 4 technical challenges covering dynamic RLS session bindings, outbox atomicity, fair-share rate quotas, and reliable webhooks.

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
- Scope & Hours: Calculated bottom-up using effort model (34 component hours * 1.15 buffer = 39 hours). Moved Stripe meter billing and blue-green schema migrations to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic multi-tenant metrics (cross-tenant leakage rate, outbox publishing latency, and webhook delivery rate).
- Removed Banned Content: Removed 'Zoho, top tech platforms' quadruple duplicate marketing and claims about commanding senior titles.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic tenant test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [QUERY_COUNT] and [OUTBOX_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
