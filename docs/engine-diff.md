# Engine Diff Report — Stage 2.3 Accuracy Fixes

## Overview
This document records the evaluation of the ATS scoring and skill matching engine after Stage 2 accuracy fixes, comparing performance across the original 32 golden test cases and the 20 newly added extended golden test cases (cases 33-52).

## Baseline Comparison
- **Original 32 Golden Cases**:
  - Baseline: 109 TP, 0 FP, 0 FN. Precision: 100.0%, Recall: 100.0%, Average Runtime: 32.9ms.
  - Current: 109 TP, 0 FP, 0 FN. Precision: 100.0%, Recall: 100.0%, Average Runtime: 32.9ms.
  - Zero regression on existing 32 golden cases.

- **20 Extended Golden Cases (Cases 33–52)**:
  - Total True Positives (TP): 48
  - Total False Positives (FP): 0
  - Total False Negatives (FN): 0
  - Overall Precision: 100.0% (Target: >= 92.0%)
  - Overall Recall: 100.0% (Target: >= 90.0%)
  - Average Runtime: 40.0ms (Target: < 300ms)
  - Max Runtime: 218.3ms (Target: < 300ms)

## Accuracy Fix Details

### 1. Ambiguous Tokens Guard
- **Go / Golang**: Context boundary checks ensure the common verb "go" (e.g. "go live", "go through") does not trigger skill matches. Co-occurrence with systems engineering skills (Kafka, Docker, Kubernetes, AWS, PostgreSQL) in technical bullets or skills sections correctly recognizes Go.
- **Rust**: Ambiguity guard avoids metal corrosion/rust false positives while matching Rust when paired with systems engineering terminology (C++, Cargo, memory safety, proxy, networking, concurrency).
- **Swift**: Context checks ensure iOS SDK / Xcode / SwiftUI co-occurrences match Swift while ignoring non-tech words ("swift action").
- **Spark & Flask**: Qualified regex ensures "Apache Spark" and "Flask API/microservices" match reliably while ignoring water flasks or generic spark words.
- **C & C++ & C#**: Strict boundaries prevent matches within addresses (e.g., "CA") or vitamins ("Vitamin C").

### 2. Section-Aware Weighting & Hedged Phrasing
- Section-aware evidence tiers give higher evidence weight (0.85-1.0) to skills demonstrated in experience and project bullets compared to raw skills lists (0.4) or education (0.5).
- Hedged language ("familiar with", "exposure to", "basic knowledge of", "worked briefly with") is recognized but capped at weak evidence tier (0.5 max) and classified as a wording fix or learning target rather than strong verification.

### 3. Diverse Engineering Disciplines
- Validated canonical skill extraction for non-CS engineering branches:
  - ECE / Embedded: Embedded C, ARM microcontrollers, FreeRTOS, hardware peripherals (`embedded_c`, `c`).
  - Mechanical: 3D CAD, SolidWorks, AutoCAD, FEA simulation (`solidworks`, `autocad`).
  - Civil: Structural drafting and analysis (`autocad`, `staad_pro`).
  - Cybersecurity: Network security telemetry and SIEM monitoring (`security_tools`).
  - Business Intelligence & Data Analytics: Executive dashboarding (`bi_visualization`, `sql`).

### 4. Summary Consistency (Invariant 6)
- Runtime assertions verify that every number rendered in the `QuickSummary` card matches the values derived from the identical `DeterministicFacts` used by the full deep roast report.
