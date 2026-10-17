# Audit & Diagnosis: brief-fullstack-ecommerce

- **Old Title**: Full-Stack Headless E-Commerce with Optimistic UI
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic web app; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing and ungrounded career claims)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than evaluating inventory race conditions, optimistic UI latency, and webhook idempotency.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Next.js, React, and PostgreSQL at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Overselling prevention (0 of 500), cart update latency (< 40ms), and webhook idempotency (0 duplicates) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory SQLite with mock payment provider if local PostgreSQL or Stripe is inaccessible.
4. **Can test data be created in minutes?** YES. Synthetic 250-SKU catalog and load generator script included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full concurrency test and dynamic purchase check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Inventory race condition overselling rate, optimistic UI latency, and Stripe webhook idempotency are unique to e-commerce platforms.
7. **Is every bullet claim verified by rubric?** YES. Overselling prevention verified by Check 0; cart latency and webhook idempotency verified by Checks 1 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] provisions a dynamic SKU with 1 stock and asserts exactly 1 success out of 10 concurrent requests.
9. **Are all terms accurate?** YES. Accurately covers Next.js SSR, optimistic React UI, PostgreSQL SELECT FOR UPDATE, and Stripe webhooks.
10. **Does problem statement promise only what is verified?** YES. Storefront, optimistic cart, inventory locking, and Stripe webhook processing are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic product catalogs and Stripe test card numbers.
12. **Are all hard parts technical?** YES. 4 technical challenges covering transactional row locking, optimistic rollbacks, idempotent webhooks, and SSR caching.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Algolia instant search and abandoned cart worker to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic e-commerce metrics (inventory overselling rate, optimistic cart UI latency, and webhook idempotency rate).
- Removed Banned Content: Removed unsubstantiated employer marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic flash sale test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [CONCURRENT_REQUESTS] and [CART_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
