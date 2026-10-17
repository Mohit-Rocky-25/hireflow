# Audit & Diagnosis: brief-feature-flag-platform

- **Old Title**: Feature Flag & A/B Testing Platform
- **Domain**: Full-Stack Web
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic flag setup; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'LaunchDarkly and Split.io are billion-dollar companies', 'top tech platforms, Zomato, and top tech platforms run extensive A/B experiments')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than evaluating evaluation latency, bucketing uniformity, and SSE update propagation.
2. **Commercial employer marketing**:
   > "LaunchDarkly and Split.io are billion-dollar companies built on this problem... top tech platforms, Zomato, and top tech platforms run extensive A/B experiments..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go, React, PostgreSQL, and Redis at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Evaluation latency (< 1.0ms), bucketing variance (<= 1.5%), and SSE propagation (< 150ms) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory mock store and polling fallback if Docker Redis cannot run.
4. **Can test data be created in minutes?** YES. Synthetic 50-flag configuration and 100,000 user hash generator included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full benchmark and dynamic 37% rollout check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. In-memory evaluation latency, MurmurHash3 distribution variance, and SSE push propagation latency are unique to feature flag platforms.
7. **Is every bullet claim verified by rubric?** YES. Evaluation latency verified by Check 0; SSE propagation verified by Checks 2 & 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] configures a dynamic 37% rollout at runtime and asserts 37% (+/- 1.5%) allocation across 10,000 users.
9. **Are all terms accurate?** YES. Accurately covers MurmurHash3 bucketing, boolean targeting rules, Server-Sent Events, and Redis pub/sub.
10. **Does problem statement promise only what is verified?** YES. Bucketing engine, rule matcher, SSE streamer, and React admin dashboard are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic user IDs and fake attributes.
12. **Are all hard parts technical?** YES. 4 technical challenges covering MurmurHash3 bucketing, SSE propagation, sub-millisecond evaluation, and audit logging.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved statistical A/B experimentation and OpenFeature SDK to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic feature flag metrics (local evaluation latency, MurmurHash3 distribution variance, and SSE propagation time).
- Removed Banned Content: Removed employer marketing regarding LaunchDarkly, Split.io, Zomato, and duplicate company names.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic 37% rollout test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [EVAL_LATENCY], [CLIENT_COUNT], and [PROPAGATION_TIME] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
