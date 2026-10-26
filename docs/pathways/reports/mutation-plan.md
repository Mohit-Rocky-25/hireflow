# Pathways Action Plan Engine: Mutation Test Report (10 Mutants)

**Date:** 2026-10-26  
**Status:** COMPLETE (Stage S8)  
**Target:** `src/pathways/engine/plan.ts`, `src/pathways/models/assumptions.ts`  
**Test Suite:** `tests/pathways/planEngine.test.ts`

---

## 1. Mutation Analysis Summary

10 intentional semantic mutations were evaluated against the plan engine test suite. All 10 mutants fail test assertions, confirming 100% mutation kill rate.

| Mutant ID | Mutation Injected | Expected Behavior | Test Catching Mutant | Result |
| :--- | :--- | :--- | :--- | :--- |
| **M-01** | Category order inverted (process prep before blocker) | Strict 3-lane ordering broken | `strictly orders tasks: eligibility_blocker -> readiness_gap -> process_prep` | **KILLED** |
| **M-02** | Active backlog blocker emitted for student with 0 backlogs | Clean student receives blocker task | `omits eligibility blockers when student has zero blockers` | **KILLED** |
| **M-03** | Active backlog blocker omitted when backlogs exceed limit | Student with 2 backlogs misses blocker | `strictly orders tasks (category presence check)` | **KILLED** |
| **M-04** | CGPA recovery task omitted when CGPA < minimum cutoff | Low CGPA student misses recovery plan | `strictly orders tasks (category presence check)` | **KILLED** |
| **M-05** | Pace multiplier inverted (`relaxed: 0.67`, `intense: 1.5`) | Relaxed pace results in fewer weeks | `applies standard, relaxed, and intense pace multipliers` | **KILLED** |
| **M-06** | Task duration violates ordering (`effortMinWeeks > likelyWeeks`) | Invariant `min <= likely` violated | `all tasks maintain effortMinWeeks <= effortLikelyWeeks` | **KILLED** |
| **M-07** | Task duration violates ordering (`effortLikelyWeeks > maxWeeks`) | Invariant `likely <= max` violated | `all tasks maintain effortMinWeeks <= effortLikelyWeeks <= effortMaxWeeks` | **KILLED** |
| **M-08** | Assumption status changed to `'verified'` before review | Constitution B5 draft-only rule violated | `draftAssumptionsInUse check` & assumption register | **KILLED** |
| **M-09** | Non-deterministic task IDs (UUIDs instead of stable slugs) | Output varies between runs | `deterministic reproducibility: identical inputs yield identical task plans` | **KILLED** |
| **M-10** | Minimum effort weeks permitted to drop to 0 | Non-positive week durations | `all tasks maintain effortMinWeeks > 0` | **KILLED** |

---

## 2. Conclusion
The Action Plan Engine achieves 10/10 mutation kill score (100% kill rate). Lane ordering, relative week invariance, and pace scaling determinism are verified.
