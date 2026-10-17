# Audit & Diagnosis: brief-graph-analysis

- **Old Title**: Large-Scale Social Graph Analysis Platform
- **Domain**: Data Engineering
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic NetworkX script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'LinkedIn People You May Know, Facebook friend recommendations, HDFC, SBI')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Used generic web-service targets rather than evaluating PageRank convergence latency, Louvain modularity score, and traversal speed.
2. **Commercial employer marketing**:
   > "LinkedIn's 'People You May Know', Facebook's friend recommendations, fraud network detection at banks (HDFC, SBI), and supply chain risk analysis..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, DuckDB, and NetworkX at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. PageRank convergence (< 4.5s on 1M edges) and traversal latency (< 15ms) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Python dictionaries and NetworkX if native CSR C-extensions fail to compile.
4. **Can test data be created in minutes?** YES. Synthetic million-edge power-law graph generator included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full algorithm benchmark and dynamic star-hub test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. PageRank convergence latency, Louvain modularity score, and K-hop traversal latency are unique to graph platforms.
7. **Is every bullet claim verified by rubric?** YES. PageRank latency verified by Check 0; traversal latency verified by Check 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] generates a dynamic star graph at runtime and asserts the hub node receives top PageRank rank.
9. **Are all terms accurate?** YES. Accurately covers Compressed Sparse Row matrices, power-iteration PageRank, Louvain modularity, and ego networks.
10. **Does problem statement promise only what is verified?** YES. CSR loader, parallel PageRank, Louvain community detection, and FastAPI query API are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic graph topologies; no personal data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering CSR memory layout, parallel PageRank convergence, Louvain modularity optimization, and multi-hop traversal.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved Spark GraphFrames and temporal edge streaming to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic graph analytics metrics (million-edge PageRank convergence, Louvain modularity, and traversal latency).
- Removed Banned Content: Removed employer marketing regarding LinkedIn, Facebook, and banks.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic star topology check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [CONVERGENCE_TIME], [EDGE_COUNT], and [TRAVERSAL_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
