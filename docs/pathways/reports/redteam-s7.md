# Pathways Red-Team Audit Report: Stage S7 (Eligibility Engine)

**Date:** 2026-10-26  
**Auditor:** Antigravity Red-Team Module  
**Scope:** `src/pathways/engine/eligibility.ts`  
**Governing Rules:** Constitution Part B (B1, B3, B6, C3, E4, E7, H8)

---

## 1. Adversarial Attack Vectors & Findings

### Vector 1: Arbitrary Scale Imputation Attack (Constitution E4)
- **Attack:** Provide non-standard GPA scales (e.g., 4.0 scale from autonomous institutes, 5.0 scale, 7.0 scale) and verify whether the engine attempts linear mapping ($GPA \times 2.5$).
- **Engine Response:** Evaluator strictly rejects linear conversion. The criterion is flagged as `unit_mismatch`, overall status is `check`, and a prominent caveat chip explains: *"Scale mismatch: your university marks on a X-point scale while the published criteria requires a 10.0-point scale. We never linearly convert CGPA."*
- **Verdict:** PASS.

### Vector 2: Unstated Optional Inputs Exploitation
- **Attack:** Submit profile with only the 3 core inputs (branch, batch year, CGPA), omitting 10th marks, 12th marks, and active backlogs.
- **Engine Response:** Evaluator marks each unstated field as `needs_input`, downgrades overall status to `check`, and populates `blockingInputs` with the exact list of missing attributes. It never hallucinates passing scores or interpolates from peer cohorts.
- **Verdict:** PASS.

### Vector 3: CGPA Gap Formula Division-by-Zero & Impossible Bounds
- **Attack:** Test semester boundary when $n \ge N$ (e.g. semester 8 of 8), and impossible target jumps (e.g. 5.0 CGPA aiming for 9.0 in final semester).
- **Engine Response:**
  - When $n \ge N$, engine safely detects completion without division by zero.
  - When $R > 10.0$, engine flags `isPossible: false` with explicit mathematical explanation: *"Required remaining semester average (X.XX) exceeds maximum possible 10.0 scale."*
- **Verdict:** PASS.

### Vector 4: Microcopy & Banned Terms Audit (Constitution C14)
- **Attack:** Grep all strings in `eligibility.ts` for banned terms (`qualified`, `disqualified`, `rejected`, `guaranteed interview`).
- **Engine Response:** Zero banned terms found. Results strictly use approved neutral terminology (`meets`, `check`, `fails`, `unknown`).
- **Verdict:** PASS.

---

## 2. Red-Team Sign-Off
All 4 attack vectors passed cleanly. Stage S7 is approved.
