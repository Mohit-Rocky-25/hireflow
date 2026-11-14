# Company-Agnostic Evidence Scoring Specification & Vetting Rubrics

**Date**: November 14, 2026  
**Status**: APPROVED  
**Author**: Mohit-Rocky-25 <yadavmohit12243@gmail.com>

---

## 1. Scope & Invariants

This specification formalizes the scoring requirements for TalentLens evidence calibration. The scoring engine must evaluate candidate credentials against empirical rubrics without hardcoding company brands, tiers, or proprietary role IDs.

## 2. Core Scoring Principles

### 2.1 Company-Agnostic Evaluations
- Zero company identifiers, company names, or brand tiers may be hardcoded into evaluation algorithms or scoring weights.
- All company evaluations are parameterized strictly by structured profile attributes:
  - Technical Bar Tier (e.g., TIER1_FAANG, UNICORN, ENTERPRISE, GROWTH)
  - Stack Complexity Multipliers
  - Role Seniority Expectations (Fresher, L3, L4, L5, Staff)

### 2.2 Template-Free Concept Evidence
- Concept recognition must not rely on trivial substring matching or generic resume template filler phrases.
- A technical concept is verified only when supported by at least two distinct keyword evidence groups (e.g., concurrency requires both async primitives and lock/race handling).
- Letter-spaced text artifacts and OCR noise must be normalized at runtime before tokenization.

### 2.3 Grounded Crediting
- Candidate bullet rewrites must preserve ground truth.
- Zero unearned metrics, fabricated user counts, or hallucinated frameworks may be introduced.
- Gaps and closures must be attributed directly to explicit project brief specifications.
