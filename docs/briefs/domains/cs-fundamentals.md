# Computer Science Fundamentals Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Buffer overflows**: Buffer overflows or string slicing errors when parsing raw byte streams from TCP sockets.
2. **Missing crash-consistency**: Missing crash-consistency testing on Write-Ahead Logs after sudden SIGKILL terminations.
3. **Integer overflow**: Integer overflow or underflow in cyclic hash algorithms or binary conversion routines.
4. **Linear search**: Linear search complexity $O(N)$ hidden inside supposed $O(1)$ cache eviction logic.
5. **Recursive AST**: Recursive AST evaluators causing stack overflows on deep syntax trees without tail recursion or iteration.

## 2. Authoritative Reference Sources
- RFC 9112 (HTTP/1.1 Specification)
- Redis Serialization Protocol (RESP) Specification
- Git Internals (The Git Object Model and Packfile Specification)
- Cormen, Leiserson, Rivest, Stein, Introduction to Algorithms (CLRS)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify that TCP socket servers handle keep-alive connection reuse and timeout reap loops cleanly.
- [ ] **Check 2:** Assert Write-Ahead Logs compute and verify CRC32 frame checksums before applying replayed mutations.
- [ ] **Check 3:** Check that LRU caches achieve strict $O(1)$ get/set time complexity using hash map + doubly linked list.
- [ ] **Check 4:** Ensure Bloom filters mathematically calculate optimal bit array size $M$ and hash count $K$ for target false positive rate.
