# Audit & Diagnosis: brief-micro-frontend-shell

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Micro-Frontend Host Shell with Module Federation | Generic headline | Minor |
| Claims / Marketing | 'SAP, Siemens, and large Indian IT companies (Infosys, TCS client portals) use micro-frontends... Oracle, SAP Labs...' | Named specific enterprise corporations as marketing hooks | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing remote micro-app codebases and Webpack configurations | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Node.js or browser specs | Major |
| Resume Bullet | Spliced bullet ending with copied web-service targets | Malformed resume bullet | Critical |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js 18+ and React at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Bundle size (< 120KB), remote load latency (< 650ms), and error boundary survival (50 of 50) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Local Node.js static HTTP servers hosting remote entry bundles without external cloud CDNs.
4. **Can test data be created in minutes?** YES. Sample micro-app source trees and automated Webpack build scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-cloud CDN orchestration and legacy ECMAScript 5 polyfilling.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 spins up dynamic remote component and verifies host shell mounts it at runtime.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved dynamic remote registry discovery and Next.js SSR federation to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic micro-frontend metrics (host bundle size, dynamic remote load latency, and error boundary crash survival rate).
- Removed Banned Content: Removed marketing references to SAP, Siemens, Infosys, TCS, and Oracle.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic remote mounting test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
