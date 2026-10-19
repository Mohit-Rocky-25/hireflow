# HireFlow v3 — Blocked & Deferred Items Log

This document records items that are intentionally blocked, deferred, or require direct repository owner input:

| Item | Reason for Deferral / Block | Action Required from Repository Owner |
| :--- | :--- | :--- |
| **Real Anonymized Calibration Resumes (30–50)** | In accordance with DPDP Act 2023 and privacy principles, real student resumes cannot be committed without explicit anonymization and consent. | Owner must supply 30–50 anonymized candidate resumes with corresponding JDs into `data/calibration/real/` for ground-truth calibration. |
| **Manual Verification of Legacy Records** | 99 legacy credential and role entries currently carry status `"needs-recheck"` or `"unverified"`. In accordance with P-1, dates and fees are not guessed. | Owner or community reviewers should verify official exam fees and dates and update `lastVerified` dates. |
| **Online Open-Taxonomy Fetch (ESCO / O*NET)** | Network egress is locked down under Principle P-2 (Deterministic / Offline First). The import script `scripts/import-taxonomy.ts` is fully implemented but skipped during offline builds. | If internet access is desired, run `npx tsx scripts/import-taxonomy.ts` in an authorized environment with CC-BY-4.0 attribution. |
