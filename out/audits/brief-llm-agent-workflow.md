# Audit & Diagnosis: brief-llm-agent-workflow

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Autonomous LLM Agent Workflow Engine with Tool Calling | Vague headline | Minor |
| Claims / Marketing | 'Every enterprise deploying AI is moving from chat to autonomous workflow agents in 2025. This is the #1 differentiator for Applied AI Engineer roles.' | Unsubstantiated hype, marketing claims | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing task definitions and mock tool plugin suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No container/CPU specs for running agent loops | Major |
| Resume Bullet | 'achieved 95% task completion rate...; achieved [N] throughput with < [M ms] latency overhead' | Broken spliced bullet with unpopulated brackets | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, local Redis container, and mock/Ollama LLM at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Goal completion rate (>= 82.0%), schema compliance (>= 95.0%), and chaos failure recovery (>= 80.0%) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory dictionary state store if Redis is unavailable; local mock LLM provider requiring $0 API cost.
4. **Can test data be created in minutes?** YES. Synthetic 100-task benchmark definitions and mock tool plugin stubs included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: arbitrary unsandboxed code execution and autonomous financial transactions.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 dynamically breaks primary tool and verifies agent routes to fallback tool.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 2.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved hierarchical multi-agent delegation and ChromaDB memory to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic agent metrics (task completion rate, Pydantic schema compliance, and chaos recovery rate).
- Removed Banned Content: Removed marketing claims stating agent engineering is the #1 differentiator in 2025.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic tool failure test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
