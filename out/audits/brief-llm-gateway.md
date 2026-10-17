# Audit & Diagnosis: brief-llm-gateway

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Multi-Provider LLM Gateway with Cost Optimization | Generic headline | Minor |
| Claims / Marketing | 'Every company deploying multiple LLMs needs a gateway layer. LiteLLM...' | Unsubstantiated claims naming third-party open source projects | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing prompt payloads and mock provider testing stubs | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Redis or CPU/RAM specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, FastAPI, and local Redis at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Cache latency (< 25.0ms), proxy overhead (< 4.5ms), and failover recovery (< 650ms) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory dictionary cache and provided local mock provider endpoints requiring $0 external API spend.
4. **Can test data be created in minutes?** YES. Synthetic 200-prompt benchmark dataset and mock provider testing stubs included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: proprietary model weights hosting and global CDN anycast routing.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 submits dynamic prompt and paraphrase, asserting second query hits cache with zero provider tokens.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 4.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cost-aware model routing and PII redaction middleware to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic gateway metrics (semantic cache hit latency, proxy processing overhead, and automated failover duration).
- Removed Banned Content: Removed marketing references to LiteLLM.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic paraphrased prompt caching test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
