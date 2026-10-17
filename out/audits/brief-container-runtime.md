# Audit & Diagnosis: brief-container-runtime

- **Old Title**: Minimal Container Runtime (Docker-like) in Go
- **Domain**: Systems Programming
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~24-26 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned claims: 'extremely rare and highly valued', 'actively seek this knowledge', 'principal-level platform engineering')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 5.00 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an operating system container runtime using HTTP web-service throughput targets.
2. **Banned marketing claims**:
   > "demonstrates kernel-level systems programming knowledge that is extremely rare and highly valued... Immediately signals principal-level platform engineering capability."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 34 hours (ADVANCED); runs on standard Linux VM or WSL2 with Go at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Memory limit OOM kill (< 500ms) and shell boot latency (< 250ms) measured directly on local kernel.
3. **Is there a CPU/local/free fallback?** YES. Local disposable VM via Multipass if host OS lacks native Linux namespaces.
4. **Can test data be created in minutes?** YES. Minimal 5MB Alpine rootfs and memory test binary provided via provisioning script.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full container tests and dynamic hostname check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. PID namespace isolation, cgroups v2 OOM killing, and container shell startup latency are unique to container runtimes.
7. **Is every bullet claim verified by rubric?** YES. PID isolation verified by Check 1; OOM memory enforcement verified by Check 2; startup speed verified by Check 4.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] sets dynamic hostname inside container and proves host hostname remains unchanged.
9. **Are all terms accurate?** YES. Accurately details clone, unshare, pivot_root, cgroups v2 unified controllers, and mount private propagation.
10. **Does problem statement promise only what is verified?** YES. Namespace isolation, cgroup resource limits, and rootfs pivoting are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Safety note included detailing requirement for sudo privileges inside disposable VM.
12. **Are all hard parts technical?** YES. 4 technical challenges covering Go syscall execution, cgroups v2 hierarchy, pivot_root shared mounts, and process sync.

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
- Scope & Hours: Calculated bottom-up using effort model (30 component hours * 1.15 buffer = 34 hours). Split veth networking and rootless user namespaces to Extended Path (+15h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic kernel runtime targets (PID isolation, cgroups v2 memory limit enforcement, and shell boot latency).
- Removed Banned Content: Removed 'extremely rare and highly valued' and 'principal-level platform engineering' claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic UTS hostname check.
- Added Safety Note: Added clear warning regarding sudo privileges and disposable VM recommendation.
- Resume Formula: Formatted into clean single sentence using measured placeholders [OOM_MEMORY] and [STARTUP_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
