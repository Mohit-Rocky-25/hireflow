# HireFlow v3 Directory Structure

This document outlines the architectural responsibilities of each directory in the HireFlow codebase. Each directory follows a single-responsibility principle to ensure privacy, determinism, and maintainability.

| Directory | Purpose / Architectural Responsibility |
| :--- | :--- |
| `src/config/` | Centralized typed configuration tokens, scoring weights, penalty thresholds, word limits, and Indian fresher career heuristics. |
| `src/engine/` | Pure TypeScript computational engines for parsing, matching, deterministic scoring, and invariant enforcement (zero React dependencies). |
| `src/features/` | Feature-specific UI components, custom hooks, and presentation state for candidate tools (ATS Roaster, Outreach, Career Finder, etc.). |
| `src/features/ats/engine/` | Core ATS parsing, seniority signal extraction, BM25 matching, rule auditing, and state machine transitions. |
| `src/features/suite/engine/` | Career suite simulation engines, fix ranking algorithms, and deterministic resume summary generators. |
| `src/data/` | Static domain datasets (India colleges, skills taxonomy, career ladders, certifications, market tiers) with Zod provenance schemas. |
| `src/components/` | Shared, reusable React UI components (Navigation, Layout, Buttons, Modals, Error Boundaries) adhering to WCAG 2.2 AA. |
| `src/pages/` | Top-level routing views and container layouts for candidate tools, platform tools, and shared portal views. |
| `src/lib/` | Lightweight cross-cutting utility functions, security guards (network sandbox), and formatting helpers. |
| `src/store/` | Zustand state management stores partitioned per tool with local storage persistence and clean isolation. |
| `src/types/` | Shared TypeScript domain interfaces, data transfer contracts, and provenance definitions. |
| `src/assets/` | Static visual assets, brand icons, and illustration vectors. |
| `tests/` | Comprehensive test suites: property invariants, baseline regression scorecards, privacy telemetry guards, and bug repro tests. |
| `scripts/` | Autonomous automation scripts for security audits, secret scanning, dependency verification, and baseline metrics recording. |
| `docs/` | Architectural specifications, security threat models, baseline reports, and compliance documentation. |
