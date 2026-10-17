# Audit & Diagnosis: cert-ckad

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 100-hour seed | Lacked concrete terminal lab framing, imperative kubectl bounds, and NetworkPolicy specs | High |
| Rubric | Missing quantitative targets | Lacked concrete rolling update availability targets, packet drop bounds, and anti-fake timeout tests | High |
| Effort Model | Unverified 100 hours | Exceeded ADVANCED difficulty band (max 60h) without bottom-up component hours (standardized to 40h core + 60h extended) | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Minikube and Docker Desktop at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Rolling update uptime (1,000 of 1,000), NetworkPolicy drops (50 of 50), and liveness restart (< 20s) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Kind (Kubernetes in Docker) or K3s if Minikube cannot be provisioned.
4. **Can test data be created in minutes?** YES. Minikube setup scripts and automated lab manifests included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: etcd cluster bootstrapping, Linux eBPF drivers, and cloud production EKS clusters.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 launches an unauthorized curl pod and verifies immediate NetworkPolicy connection timeout.
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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours, conforming to ADVANCED band). Moved killer.sh mock exams to Extended Path (+60h).
- Target Realism: Standardized difficulty with authentic Kubernetes metrics (rolling update request availability, NetworkPolicy packet drops, and probe restart latency).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake rogue pod NetworkPolicy timeout test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
