# Candidate Career Operating System (v5) Architectural Specification

**Date**: November 11, 2026  
**Status**: APPROVED  
**Author**: Mohit-Rocky-25 <yadavmohit12243@gmail.com>

---

## 1. Overview & Core Philosophy

The Candidate Career Operating System (v5) transforms HireFlow from a collection of standalone evaluation tools into a cohesive, deterministic career platform. The architecture prioritizes candidate data privacy, zero-egress sandboxing, and immutable local audit histories.

## 2. Key Subsystems

### 2.1 Candidate Command Center (`/portal`)
- **Unified KPI Strip**: Computes real-time aggregate indicators including Target Readiness, Target Tracker, Unresolved Skill Gaps, Resume Version Count, and Active Plan Items.
- **Target Watchlist**: Pinned employer hiring bars and target roles with calibrated tier benchmarks.
- **Immutable Audit Journal**: Local cryptographic timeline recording every evaluation, score change, and recommendation without cloud transmission.
- **Execution Plan**: Structured, actionable next steps tied directly to closing evaluated competency holes.
- **Outreach Vault**: Draft store for role-specific networking messages and referrals.

### 2.2 Resume Matrix (`/portal/resumes`)
- Partitions resumes into dedicated technical tracks (e.g., Backend Systems, Distributed Architecture, Data Engineering).
- Supports parent-child lineage trees with branch pointers (`head`, `primary`).
- Provides client-side word-level diffing between historical iterations.

### 2.3 Zero-Egress Air-Gapped Guest Sandbox
- Unauthenticated visitors execute all 11 evaluation tools in complete isolation.
- Zero network requests to third-party endpoints or backend servers.
- Optional Google OAuth enables cloud persistence and multi-device sync for authenticated users.
