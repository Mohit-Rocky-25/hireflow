# HireFlow Brief Linter Baseline Report

> **Audit Scope**: All 158 project briefs in catalog
> **Total Findings**: 492

## Severity Distribution
- **S0 (Critical)**: 2
- **S1 (Major)**: 151
- **S2 (Minor)**: 181
- **S3 (Cosmetic)**: 158

## Defect Class Breakdown
| Defect Class | Count | Severity | Rationale |
|---|:---:|:---:|---|
| `C-UNPINNED-VERSIONS` | 158 | `S2` | Dependencies without pinned minimum semver drift and break on student machines |
| `C-SELF-AUTHORED-TESTS` | 128 | `S1` | Rubric invoking student-authored test files without external test harness is easily gameable |
| `C-RUBRIC-DUPLICATE-NUMBERING` | 158 | `S3` | Embedded numeric index causes "[ ] 1. 1. " duplicate indexing in plaintext and markdown exports |
| `C-UNBOUNDED-HARDWARE-CLAIM` | 4 | `S1` | Throughput claims without hardware profile are unfalsifiable and environmentally brittle |
| `C-LINUX-SYSCALL-PORTABILITY` | 6 | `S1` | Linux kernel primitives fail on Windows hosts without explicit WSL2/Docker prerequisites |
| `C-MISSING-LAWFUL-SCOPE-DISCLAIMER` | 13 | `S1` | Security testing tools require strict scope disclaimers for ethical and legal compliance |
| `C-ABSOLUTE-UNFALSIFIABLE-CLAIMS` | 23 | `S2` | Absolute words ("100%", "zero", "never") in resume bullets invite skeptical interviewer grilling |
| `C-UNATTAINABLE-HARDWARE-REQUIREMENT` | 2 | `S0` | Mandating high-end dedicated GPU hardware blocks standard second-year student laptops |
