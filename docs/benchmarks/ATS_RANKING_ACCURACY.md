# ATS Ranking Accuracy Benchmarks & Latency Targets

Evaluation targets and precision metrics for the HireFlow candidate-to-job matching algorithm.

## 1. Matching Accuracy Thresholds

- **Top-10 Precision ($P@10$):** Target $\ge 92\%$ relevance match against verified recruiter shortlists.
- **Recall Target ($R@50$):** Target $\ge 96\%$ coverage of qualified applicant pools.
- **NDCG Score:** Normalized Discounted Cumulative Gain $\ge 0.89$ on prioritized match candidate sequences.

## 2. Latency Benchmarks

- Pre-computed candidate embedding similarity: $< 40\text{ ms}$ per 10,000 candidate profiles.
- Full multi-variable ranking pipeline (skills + experience + location + seniority fit): $< 180\text{ ms}$.

