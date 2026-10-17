# Audit & Diagnosis: brief-embedding-search-engine

- **Old Title**: Semantic Code Search Engine using AST + Embeddings
- **Domain**: AI/ML Applications
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic pipeline script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'GitHub Copilot, Sourcegraph, Phind', 'Developer tools are a hot market')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an AI code search engine using web-service k6 throughput targets.
2. **Commercial employer name-dropping**:
   > "GitHub Copilot's code search, Sourcegraph's intelligence platform, and Phind's code search all solve this. Developer tools are a hot market..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, Tree-sitter, and Qdrant at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Recall@10 (> 75%) and query retrieval latency (< 200ms) measured directly on local CPU.
3. **Is there a CPU/local/free fallback?** YES. In-memory FAISS or Numpy cosine similarity if local Qdrant is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic 5,000 function multi-language repository and 100 evaluation queries included.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full evaluation suite and dynamic semantic query test in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Recall@10 relevance, hybrid search latency, and AST function boundary extraction are unique to code search engines.
7. **Is every bullet claim verified by rubric?** YES. Recall@10 verified by Check 0; hybrid latency verified by Checks 1 & 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] indexes a dynamic function with obscure names and retrieves it via pure semantic intent with zero token overlap.
9. **Are all terms accurate?** YES. Accurately covers Tree-sitter AST queries, dense vector embeddings, Qdrant HNSW indexing, and Reciprocal Rank Fusion.
10. **Does problem statement promise only what is verified?** YES. AST chunking, dense vector indexing, hybrid BM25 + dense search, and FastAPI API are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly permissive public open-source code repositories; no private code.
12. **Are all hard parts technical?** YES. 4 technical challenges covering polyglot AST chunking, CPU embedding inference optimization, hybrid retrieval, and sub-200ms latency.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cross-encoder reranking and Git webhook worker to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic search engine metrics (Recall@10, query retrieval latency, and AST extraction accuracy).
- Removed Banned Content: Removed employer marketing regarding GitHub Copilot, Sourcegraph, and Phind.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic semantic retrieval test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [FUNCTION_COUNT], [RECALL_SCORE], and [QUERY_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
