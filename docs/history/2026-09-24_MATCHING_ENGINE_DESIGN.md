# HireFloo Architecture Checkpoint — September 24, 2026
**Milestone:** v2 Core Matching Engine & Candidate Journey Architecture  
**Author:** Mohit-Rocky-25  
**Date:** September 24, 2026  

---

## 1. Executive Summary

This architecture milestone documents the design decisions and technical specifications established on **September 24, 2026**, bridging the Stage 2 Company Workflow refactoring (committed September 23, 2026) and the Stage 3 AI Demo & Design Polish integration (committed September 25, 2026).

---

## 2. Problem Statement & Context

Between September 23 and September 25, the HireFloo platform was transitioned from an initial multi-portal skeleton to a high-precision, client-side career intelligence engine. 

Key challenges identified on September 24:
1. **Scoring Consistency:** Raw keyword overlap yielded excessive false positives on generic software engineering job descriptions.
2. **Indian Market Alignment:** ATS benchmarks required calibrated role ladders for Indian product unicorns (CRED, Razorpay, Swiggy, Zepto) and enterprise leaders (TCS, Infosys, Wipro).
3. **Privacy-Preserving Execution:** All resume parsing, scoring calculations, and gap analysis algorithms must execute 100% client-side with zero telemetry egress.

---

## 3. Architecture Decisions (ADR-0924)

### ADR-0924.1: Weighted Multi-Dimensional Matching Engine
- **Decision:** Shift from flat keyword counting to a 4-dimensional weighted scoring model:
  - Hard Skills Alignment (40%)
  - Experience & Career Level Calibration (25%)
  - Domain & Ecosystem Relevance (20%)
  - Education, Credentials & Evidence (15%)
- **Rationale:** Ensures candidates receive actionable gap breakdowns rather than arbitrary percentage scores.

### ADR-0924.2: Deterministic Taxonomy Baseline
- **Decision:** Maintain a versioned, static catalog of 100+ verified Indian tech companies with calibrated salary bands, career stages, and interview benchmarks.
- **Rationale:** Guarantees deterministic, reproducible results without depending on volatile third-party scraping APIs.

### ADR-0924.3: High-Contrast Visual System Direction
- **Decision:** Lay the groundwork for the platform's signature high-contrast dark luxury theme (Obsidian Void `#000000`, Neon Volt `#faff69`/`#F5FF00`, and Electric Cyan `#00F0FF`).
- **Rationale:** Elevates developer and candidate ergonomics while maintaining strict WCAG AAA readability standards.

---

## 4. Next Implementation Milestones

1. Complete the interactive AI Match Demo supporting 25+ top tech employers (Target: September 25-27, 2026).
2. Author comprehensive offline testing fixtures and privacy verification gates.
3. Establish unified PublicNavbar and persistent candidate session profiles.
