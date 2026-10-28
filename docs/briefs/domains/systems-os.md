# Systems Programming, OS & Performance Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **External memory**: External memory fragmentation and bus alignment faults in custom memory allocators.
2. **Assuming POSIX**: Assuming POSIX non-blocking sockets will always read full frames in a single `read()` call.
3. **Redundant kernel-to-user-space**: Redundant kernel-to-user-space memory copies in high-bandwidth network proxies.
4. **Lock contention**: Lock contention on global mutexes bottlenecking multi-core CPU scaling.
5. **Using unpadded**: Using unpadded per-thread data structures leading to cache-line false sharing.

## 2. Authoritative Reference Sources
- Linux Manual Pages (epoll(7), splice(2), mmap(2), pipe2(2))
- Knuth, Donald, The Art of Computer Programming, Vol 1 (Dynamic Storage Allocation)
- Chase, David, & Lev, Yossi (2005), Dynamic Circular Work-Stealing Deque (SPAA)
- Silberschatz, Galvin, Gagne, Operating System Concepts (Storage Hierarchy & Paging)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify custom allocators enforce 8-byte/16-byte memory alignment and test coalescing under Valgrind.
- [ ] **Check 2:** Assert that epoll event loops properly loop on `EAGAIN` / `EWOULDBLOCK` without dropping truncated frames.
- [ ] **Check 3:** Check that multi-threaded work-stealing schedulers use atomic acquire/release memory fences without data races.
- [ ] **Check 4:** Ensure on-disk storage engines manage 4KB slotted-page binary layouts with LRU buffer pools.
