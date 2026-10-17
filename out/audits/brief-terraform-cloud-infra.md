# Audit & Diagnosis: brief-terraform-cloud-infra

| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Problem Statement | Vague 28-hour seed | Lacked concrete architectural framing, module hierarchy specs, and LocalStack emulation rules | High |
| Tech Stack | Terraform, AWS ECS, AWS RDS, CloudWatch, GitHub Actions | Listed AWS tools without pinning local free execution (LocalStack) or specifying static linters (TFLint) | Medium |
| Rubric | Missing quantitative targets | Lacked concrete provisioning latency bounds, drift detection checks, and security policy tests | High |
| Effort Model | Unverified 28 hours | Lacked bottom-up task-based hour derivations matching component breakdown | Medium |

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Docker Desktop for LocalStack at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Provisioning latency (< 90s for 25 resources), security enforcement (20 of 20), and drift detection (10 of 10) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. Running `terraform validate` and `terraform plan` with mock provider credentials if Docker is unavailable.
4. **Can test data be created in minutes?** YES. Synthetic infrastructure modules and automated validation scripts included in repository.
5. **Does the brief specify what NOT to build?** YES. Clearly out of scope: live commercial AWS accounts, public Route 53 domains, and multi-cloud simultaneous orchestration.
6. **Are screener verification steps concrete and runnable in < 10 min?** YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.
7. **Is there an anti-fake check?** YES. Anti-fake check 5 attempts to commit an unencrypted RDS database and asserts Checkov blocks deployment with exit code 1.
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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Terragrunt orchestration and Infracost pull request estimation to Extended Path (+14h).
- Target Realism: Eliminated generic descriptions; replaced with authentic IaC metrics (provisioning latency, Checkov security enforcement, and drift detection).
- Removed Banned Content: Removed promotional career unlocking marketing claims.
- Fixed Rubric: Replaced circular verification lines with 5 concrete checks including anti-fake unencrypted storage policy block test.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
