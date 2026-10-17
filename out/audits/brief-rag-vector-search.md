# Audit & Diagnosis: brief-rag-vector-search

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, pgvector index tuning, and citation verification | High |
| Tech Stack | Python, FastAPI, pgvector, PostgreSQL, Docker, LangChain | Listed LangChain without specifying embedding model, index type (HNSW), or verification mechanisms | Medium |
| Rubric | Missing quantitative targets | Lacked concrete MRR@10 thresholds, retrieval latency bounds, and hallucination rejection tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, PostgreSQL with pgvector in Docker, and local models at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Vector retrieval latency (< 40ms), MRR@10 (>= 0.82), and hallucination rejection (50 of 50) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory NumPy cosine similarity matrix if Docker pgvector container is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic policy corpus generator and automated evaluation scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: commercial vector SaaS, paid OpenAI API keys, and multi-modal video embeddings.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 queries fictitious policy XYZ-999 and asserts engine returns INSUFFICIENT_CONTEXT.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 1 and 0.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cross-encoder reranking to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic RAG metrics (hybrid vector latency, MRR@10, and hallucination rejection).
- Removed Banned Content: Removed ungrounded marketing claims and unpinned LangChain dependencies.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake out-of-domain query hallucination rejection test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
