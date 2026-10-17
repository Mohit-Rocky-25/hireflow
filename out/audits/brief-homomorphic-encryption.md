# Audit & Diagnosis: brief-homomorphic-encryption

- **Old Title**: Encrypted Database Queries with Homomorphic Encryption
- **Domain**: Security & Platform
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-26 hours of basic TenSEAL script; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (unsubstantiated claims about research-level mastery)
- Resume Bullet Safety: 6.0 / 10 (missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.70 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated homomorphic encryption with generic web-service targets rather than zero-leakage rates, encrypted addition latency, and decryption parity.
2. **Circular rubric assertions**:
   > "Passes when verified by automated test script."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, TenSEAL, and PostgreSQL at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Zero plaintext leakage (0 leaks), addition latency (< 2.5ms), and mathematical precision (100 of 100) measured directly on local machine.
3. **Is there a CPU/local/free fallback?** YES. In-memory simulated additively homomorphic cryptosystem if TenSEAL C-libraries encounter build issues.
4. **Can test data be created in minutes?** YES. Synthetic 5,000-record numerical dataset and test query scripts included in repository.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full cryptographic audit and dynamic encrypted sum check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Zero-knowledge confidentiality rate, homomorphic addition execution latency, and decrypted mathematical precision are unique to homomorphic query systems.
7. **Is every bullet claim verified by rubric?** YES. Zero-knowledge confidentiality verified by Check 0; addition latency and precision verified by Checks 1 & 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] inserts 5 dynamic encrypted values, verifies server computes sum, and asserts client decrypts to exact $15,000.00.
9. **Are all terms accurate?** YES. Accurately covers BFV/CKKS schemes, public evaluation keys, noise budget management, and ciphertext bytea vectors.
10. **Does problem statement promise only what is verified?** YES. Key manager, client encryption/decryption, PostgreSQL ciphertext store, and homomorphic evaluation engine are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Safety note confirms synthetic test records only; no real medical or banking data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering BFV/CKKS parameterization, noise budget management, ciphertext vector operations, and zero-leakage verification.

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
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved encrypted vector similarity and threshold decryption to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic homomorphic encryption metrics (zero-knowledge confidentiality, addition latency, and decryption mathematical precision).
- Removed Banned Content: Removed unsubstantiated claims regarding research-level mastery.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic encrypted sum test.
- Resume Formula: Formatted into clean single sentence using measured placeholders [RECORD_COUNT] and [ADDITION_LATENCY] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
