# Audit & Diagnosis: brief-service-mesh

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 38-hour seed | Lacked concrete architectural framing, STRICT mTLS specs, and proxy latency targets | High |
| Tech Stack | Kubernetes, Istio, Envoy, Docker, Prometheus, Kiali | Listed tools without explicit operational roles or sidecar lifecycle boundaries | Medium |
| Rubric | Missing quantitative targets | Lacked concrete proxy latency bounds, canary distribution margins, and rogue pod security tests | High |
| Effort Model | Unverified 38 hours | Lacked bottom-up task-based hour derivations matching component breakdown (standardized to 40h) | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Minikube / Kind and Docker Desktop at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Proxy latency overhead (< 5.0ms), mTLS rejection (50 of 50), and canary distribution (9.0% - 11.0%) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Docker Compose multi-container Envoy proxy mesh if local Kubernetes cluster cannot be provisioned.
4. **Can test data be created in minutes?** YES. Sample microservice manifests and automated mesh verification scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: managed cloud EKS peering, hardware HSM certificate authorities, and BGP hardware routing.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 spawns a rogue unauthenticated curl pod and verifies immediate connection termination via SSL handshake error.
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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved multi-cluster mesh expansion and Wasm filters to Extended Path (+16h).
- Target Realism: Standardized difficulty to 40 hours with authentic service mesh metrics (Envoy proxy overhead, STRICT mTLS rejection rate, and canary split margin).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake rogue pod connection rejection test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
