# Generative AI & LLMOps Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Treating cosine**: Treating cosine similarity in dense vectors as a complete replacement for exact keyword/SKU searches.
2. **Prompt injection**: Prompt injection vulnerabilities allowing user inputs to overwrite system prompt rules (OWASP LLM01).
3. **LLM evaluations**: LLM evaluations relying on single-shot heuristics without statistical significance testing (paired t-test / p-value).
4. **GPU memory**: GPU memory fragmentation causing Out-Of-Memory crashes on variable KV-cache sequences.
5. **Allowing autonomous**: Allowing autonomous agents to execute arbitrary generated code without container sandboxing.

## 2. Authoritative Reference Sources
- OWASP Top 10 for Large Language Model Applications (2025 Edition)
- Ragas Documentation (Evaluation Metrics for Retrieval Augmented Generation)
- vLLM Paper & Documentation (PagedAttention: Memory-Efficient Paging for LLM Serving)
- LangGraph Documentation (Cyclic State Machine Graphs for Agent Orchestration)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Confirm that RAG pipelines include sparse/dense hybrid search with reciprocal rank fusion or reranking.
- [ ] **Check 2:** Assert that code-execution tools run inside isolated Docker containers with no-network and memory limits.
- [ ] **Check 3:** Verify that evaluation metrics specify sample size (N >= 50) and human correlation or statistical confidence.
- [ ] **Check 4:** Ensure an explicit CPU quantized execution path (GGUF / llama.cpp) exists for students without GPUs.
