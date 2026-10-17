#!/usr/bin/env python3
"""
score.py - Calculates weighted score and band for project briefs according to Part 2 & Part 8.
Weights:
  Topic value: 10
  Verification rubric: 15
  Technical accuracy: 20
  Scope realism: 15
  Completeness: 15
  Honesty: 15
  Resume bullet safety: 10
Bands:
  A >= 8.5 (no dimension below 7.0)
  B 7.0 - 8.4
  C 5.5 - 6.9
  D < 5.5

Caps:
  - pre-filled results OR salary/employer/growth claims -> Honesty and Bullet safety max 4
  - stack mismatch, missing starter input, or a wrong statement about a tool -> Technical accuracy max 6
  - no milestones AND no deliverables -> Completeness max 5
  - real effort above 1.5x stated hours -> Scope realism max 4
  - targets or rubric from a different kind of project -> Technical accuracy max 5
"""

import sys
import json

WEIGHTS = {
    "topic_value": 10,
    "verification_rubric": 15,
    "technical_accuracy": 20,
    "scope_realism": 15,
    "completeness": 15,
    "honesty": 15,
    "resume_bullet_safety": 10
}

def calculate_score(raw_scores, caps=None):
    """
    raw_scores: dict with keys matching WEIGHTS, values 0.0 - 10.0
    caps: dict or list of active cap reasons:
      - 'prefilled_or_marketing': bool
      - 'stack_or_tool_mismatch': bool
      - 'no_milestones_and_deliverables': bool
      - 'scope_exceeds_1_5x': bool
      - 'wrong_project_targets': bool
    """
    scores = dict(raw_scores)
    caps = caps or {}

    # Apply caps
    if caps.get("prefilled_or_marketing"):
        scores["honesty"] = min(scores.get("honesty", 10.0), 4.0)
        scores["resume_bullet_safety"] = min(scores.get("resume_bullet_safety", 10.0), 4.0)
    
    if caps.get("stack_or_tool_mismatch"):
        scores["technical_accuracy"] = min(scores.get("technical_accuracy", 10.0), 6.0)

    if caps.get("wrong_project_targets"):
        scores["technical_accuracy"] = min(scores.get("technical_accuracy", 10.0), 5.0)

    if caps.get("no_milestones_and_deliverables"):
        scores["completeness"] = min(scores.get("completeness", 10.0), 5.0)

    if caps.get("scope_exceeds_1_5x"):
        scores["scope_realism"] = min(scores.get("scope_realism", 10.0), 4.0)

    # Weighted calculation
    total_weight = sum(WEIGHTS.values())
    weighted_sum = sum(scores[dim] * WEIGHTS[dim] for dim in WEIGHTS)
    overall_score = round(weighted_sum / total_weight, 2)

    # Band determination
    min_dim = min(scores.values())
    if overall_score >= 8.5 and min_dim >= 7.0:
        band = "A"
    elif overall_score >= 7.0:
        band = "B"
    elif overall_score >= 5.5:
        band = "C"
    else:
        band = "D"

    return {
        "scores": scores,
        "overall": overall_score,
        "band": band,
        "min_dimension": min_dim,
        "meets_target": (band == "A")
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI usage: pass JSON file or scores string
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
        raw_scores = data.get("raw_scores", data)
        caps = data.get("caps", {})
        res = calculate_score(raw_scores, caps)
        print(json.dumps(res, indent=2))
    else:
        # Demo / self-test
        sample_old = {
            "topic_value": 9.0,
            "verification_rubric": 5.0,
            "technical_accuracy": 6.0,
            "scope_realism": 3.0,
            "completeness": 4.0,
            "honesty": 3.0,
            "resume_bullet_safety": 3.0
        }
        res_old = calculate_score(sample_old, {"prefilled_or_marketing": True, "scope_exceeds_1_5x": True})
        print("Sample Old Brief Score:", res_old)

        sample_new = {
            "topic_value": 9.5,
            "verification_rubric": 9.0,
            "technical_accuracy": 9.0,
            "scope_realism": 8.5,
            "completeness": 9.0,
            "honesty": 9.5,
            "resume_bullet_safety": 9.0
        }
        res_new = calculate_score(sample_new)
        print("Sample New Brief Score:", res_new)
