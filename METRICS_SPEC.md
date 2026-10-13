# METRICS SPECIFICATION — HIREFLOW AI RESUME TAILORING SAAS

## 1. Quality & Tailoring Metrics

### 1.1 Mandatory Requirement Coverage (MRC)
$$\text{MRC} = \frac{\text{Count}(\text{Mandatory Requirements with DIRECT or TRANSFERABLE evidence})}{\text{Total Mandatory Requirements}} \times 100\%$$
- **Interpretation**: Measures qualification baseline. If MRC < 100%, highlights specific gaps for candidate review rather than arbitrarily rejecting.

### 1.2 Preferred Requirement Coverage (PRC)
$$\text{PRC} = \frac{\text{Count}(\text{Preferred Requirements with DIRECT or TRANSFERABLE evidence})}{\text{Total Preferred Requirements}} \times 100\%$$
- **Interpretation**: Measures competitive differentiation.

### 1.3 Evidence Confidence Index (ECI)
$$\text{ECI} = \frac{\sum_{i=1}^{N} \text{Weight}_i \times \text{Confidence}_i}{\sum_{i=1}^{N} \text{Weight}_i}$$
Where:
- $\text{Weight} = 2.0$ for Mandatory, $1.0$ for Preferred.
- $\text{Confidence} = 1.0$ (Direct), $0.75$ (Transferable), $0.40$ (Partial), $0.0$ (Missing).

### 1.4 Factual Integrity Index (FII)
$$\text{FII} = 100\% - (\text{Invented Metrics Count} \times 50\% + \text{Unconfirmed Claims Count} \times 25\%)$$
- **Enforcement Rule**: If $\text{FII} < 100\%$, export is flagged and gated with a Truth Check modal until the candidate confirms or resolves the claims.

### 1.5 Document Layout Sentinel Index (LSI)
- **Target Page Count**: 1 page (standard) or 2 pages (senior).
- **Overflow Penalty**: Flagged if estimated rendered height exceeds single page boundaries (1050px @ 96 DPI for Letter/A4) by more than 15px.
- **Visual Alert**: Highlights overflow with actionable trimming recommendations.
