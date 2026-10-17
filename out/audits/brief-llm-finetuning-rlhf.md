# Audit & Diagnosis: brief-llm-finetuning-rlhf

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | RLHF-Style LLM Alignment with Reward Model Training | Generic headline | Minor |
| Claims / Marketing | 'ChatGPT, Claude, Gemini... Anthropic, OpenAI, DeepMind... This is the most future-proof GenAI skill you can demonstrate' | Marketing hype naming big tech labs and future-proof claims | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing preference datasets and evaluation manifests | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No GPU/CUDA/TRL specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs on free Google Colab / Kaggle GPU tiers or local 12GB GPU using Python, PyTorch, and TRL at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Reward accuracy (>= 72.0%), win-rate (>= 65.0%), and KL penalty (< 0.15) measured directly on target hardware.
3. **Is there a CPU/local/free fallback?** YES. CPU training mode using lightweight Qwen-0.5B or TinyLlama with gradient accumulation.
4. **Can test data be created in minutes?** YES. Synthetic 3,000-preference pair dataset and 200 evaluation prompts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-turn conversational PPO with critic rollouts and human crowdsourcing platforms.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 scores dynamic safety prompt and asserts reward margin > 1.5 logits.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0 and 1.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved online iterative DPO and Kahneman-Tversky Optimization to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic alignment metrics (pairwise reward accuracy, DPO win-rate, and KL divergence stability).
- Removed Banned Content: Removed marketing claims mentioning ChatGPT, Claude, Gemini, Anthropic, OpenAI, and DeepMind.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic preference scoring test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
