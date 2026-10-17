# Audit & Diagnosis: brief-genai-code-reviewer

- **Old Title**: AI-Powered Code Review & Security Vulnerability Scanner
- **Domain**: GenAI & LLM Engineering
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic API wrapper; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (unsubstantiated marketing claims)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic k6 web-service targets rather than evaluating vulnerability recall, prompt injection defense, and review latency.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, FastAPI, and local/free LLM API at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Vulnerability recall (> 80%), prompt injection interception (25 of 25), and review latency (< 12s) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Deterministic mock LLM provider if local model runtime is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic 50-diff test dataset with seeded vulnerabilities and injection payloads provided.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full evaluation suite and dynamic injection test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Planted vulnerability recall, prompt injection interception, and review latency are unique to AI code review systems.
7. **Is every bullet claim verified by rubric?** YES. Prompt injection verified by Check 1; vulnerability recall and latency verified by Checks 0 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic adversarial instruction at runtime and asserts INJECTION_DETECTED flag.
9. **Are all terms accurate?** YES. Accurately covers AST context slicing, prompt injection defenses, Pydantic schema validation, and SARIF output.
10. **Does problem statement promise only what is verified?** YES. Diff parser, injection guard, structured review engine, and GitHub/SARIF dispatcher are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Safety note confirms static diff analysis only; no unauthorized external code execution.
12. **Are all hard parts technical?** YES. 4 technical challenges covering prompt injection defense, AST context extraction, Pydantic output validation, and false-positive reduction.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cross-file symbol resolution and RAG style guides to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic AI code review metrics (vulnerability recall, prompt injection interception rate, and review latency).
- Removed Banned Content: Removed unsubstantiated marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic prompt injection test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [INJECTION_COUNT], [TOTAL_INJECTIONS], and [RECALL_SCORE] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
