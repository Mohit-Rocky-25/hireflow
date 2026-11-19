# Empirical Score-Path Projection & Monotonic Delta Calibration

**Date**: November 19, 2026  
**Status**: APPROVED  
**Author**: Mohit-Rocky-25 <yadavmohit12243@gmail.com>

---

## 1. Context & Objectives

TalentLens provides a recommended multi-step improvement pathway ("Score Path") indicating the projected composite score gain if a candidate completes specific project briefs. This audit establishes mathematical guarantees preventing score inflation and ensuring monotonicity.

## 2. Invariants & Proof Requirements

### 2.1 Arithmetic Convergence & Monotonicity
- Every score-path step delta must represent a real, measurable capability gain ($\ge 0$ points).
- Steps that provide zero point gain must be labeled as `OPTIONAL` and never tagged as `CRITICAL`.
- Monotonicity invariant: Composite score after step $i$ must be $\ge$ composite score after step $i-1$.

### 2.2 Re-Scoring Accuracy Bounds
- Across all 4 standard test fixtures and 200 seeded candidate pairs, projected deltas must equal the actual re-scored composite minus initial composite:
  $$\Delta_{\text{projected}} = C_{\text{final}} - C_{\text{initial}}$$
- Projected score bounds must lie within $[ \text{actual} - 3, \text{actual} + 3 ]$ on average.
- Over-promising by $> 5$ points is strictly prohibited without triggering fallback empirical re-scoring.

### 2.3 Single Gap Resolution
- No individual technical skill gap may be credited or closed more than once across multiple pathway cards.
- Project card closures, score-path step closures, and excluded skills must remain in 1:1 correspondence.
