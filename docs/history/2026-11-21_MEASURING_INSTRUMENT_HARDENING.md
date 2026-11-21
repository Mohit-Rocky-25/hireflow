# TalentLens Measuring Instrument Hardening & AST Claim Scanner Specification

**Date**: November 21, 2026  
**Status**: APPROVED  
**Author**: Mohit-Rocky-25 <yadavmohit12243@gmail.com>

---

## 1. Context & Motivation

To guarantee absolute trust in TalentLens reports, the measuring instrument itself (`scripts/verifyTalentLens.ts`) must never print hardcoded assertions, uncomputed percentages, or synthetic pass verdicts. Every single number and claim presented to auditors must be derived directly from programmatic evaluation of real datasets.

## 2. Structural Requirements (Stages H1–H3)

### 2.1 Read-Only Verification (Stage H1)
- Running `npm run verify:talentlens` must leave the working tree 100% untouched.
- Output artifacts are restricted exclusively to git-ignored directories (`.verify/`).
- Golden candidate updates are isolated into an explicit command (`npm run golden:pending`).

### 2.2 AST Log Statement Audit & Claim Banning (Stage H2)
- The TypeScript Compiler API must parse all `console.log` statements in the verification harness.
- Every argument is categorized into one of three strict states:
  - `COMPUTED`: Numbers, percentages, or verdicts dynamically computed from runtime variables.
  - `STATIC LABEL`: Human-readable descriptors containing zero digits, metrics, or outcome words.
  - `STATIC CLAIM`: FORBIDDEN. Uncomputed strings asserting accuracy, counts, or passes.
- Assertion A0 fails if any `STATIC CLAIM` is present in the verification script AST.

### 2.3 Output Provenance (Stage H3)
- Verification execution is wrapped by `scripts/runVerify.ts`.
- The exact stdout is saved to `.verify/last-run.txt`.
- The final terminal line must output a deterministic SHA-256 hash of `.verify/last-run.txt` for cryptographically verifiable audit trails.
