# Audit & Diagnosis: brief-devsecops-pipeline

- **Old Title**: DevSecOps CI/CD Pipeline with SAST & SCA Security Gates
- **Domain**: Security & Platform
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~16-18 hours of basic workflow setup; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Snyk, Veracode, and Checkmarx are billion-dollar security companies', 'India regulatory requirements mandate this')
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated a CI/CD security pipeline using HTTP web-service throughput targets.
2. **Commercial employer marketing**:
   > "Snyk, Veracode, and Checkmarx are billion-dollar security companies built around this problem. India's financial sector regulatory requirements mandate security testing."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 28 hours (INTERMEDIATE); runs locally or on free GitHub Actions runners at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Vulnerability interception rate (15 of 15 flaws) and pipeline latency (< 240s) measured directly on local/runner CPU.
3. **Is there a CPU/local/free fallback?** YES. Local command-line execution using Semgrep and Trivy directly without GitHub Actions.
4. **Can test data be created in minutes?** YES. Vulnerable microservice test fixture repository included with planted flaws.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full scanner suite and dynamic secret check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. SAST flaw interception, SCA CVE detection, and Cosign container signing are unique to security pipelines.
7. **Is every bullet claim verified by rubric?** YES. Vulnerability count verified by Checks 0 & 1; scan latency and signing verified by Checks 2 & 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] injects a dynamic secret token at runtime and asserts pipeline blocking.
9. **Are all terms accurate?** YES. Accurately covers SAST, SCA, SBOM generation, container scanning, and Cosign signing.
10. **Does problem statement promise only what is verified?** YES. Static analysis, dependency auditing, container scanning, and signature verification are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Safety note confirms local scanning only; mock credentials strictly enforced.
12. **Are all hard parts technical?** YES. 4 technical challenges covering rule tuning, transitive CVE thresholds, Cosign signing, and fail-fast pipeline gating.

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
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Kubernetes admission controller and PR bot to Extended Path (+12h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic security pipeline metrics (flaw detection rate, pipeline execution latency, and clean code false positive rate).
- Removed Banned Content: Removed marketing regarding billion-dollar security companies and regulatory mandates.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic secret check.
- Resume Formula: Formatted into clean single sentence using measured placeholders [VULN_COUNT], [TOTAL_VULNS], and [PIPELINE_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
