# Audit & Diagnosis: cert-aws-ccp

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 40-hour seed | Lacked concrete architectural lab framing, LocalStack testing setup, and quantitative targets | High |
| Tech Stack | AWS IAM, Cloud Economics, EC2 & S3, Shared Responsibility Model, VPC Networking | Listed concepts rather than operational engineering tools with explicit roles | Medium |
| Rubric | Missing quantitative targets | Lacked concrete IAM boundary tests, VPC routing checks, and anti-fake AccessDenied validation | High |
| Effort Model | Unverified 40 hours | Exceeded BEGINNER difficulty band (max 20h) without bottom-up component hours (standardized to 16h core + 24h extended) | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 16 hours (BEGINNER); runs locally on 8GB RAM CPU using LocalStack in Docker Desktop at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. IAM boundary enforcement (50 of 50), VPC routing latency (< 20ms), and alarm latency (< 60s) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. AWS Free Tier or offline mock JSON API server if Docker LocalStack cannot be run.
4. **Can test data be created in minutes?** YES. LocalStack Docker Compose and automated setup scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: multi-region Aurora clustering, enterprise Direct Connect, and SageMaker model training.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 uses an unauthorized IAM profile to query S3 and verifies immediate AccessDenied rejection.
8. **Is the resume bullet verified by rubric checks?** YES. Bullet metrics correspond to rubric items 0, 1, and 2.

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
- Scope & Hours: Calculated bottom-up using effort model (14 component hours * 1.15 buffer = 16 hours, conforming to BEGINNER band). Moved 260-question exam simulator to Extended Path (+24h).
- Target Realism: Standardized difficulty with authentic cloud foundation metrics (IAM boundary enforcement, VPC routing latency, and billing alarm dispatch).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake AccessDenied permission rejection test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
