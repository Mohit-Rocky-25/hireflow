# Changelog

All notable changes to the **HireFloo** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-09-24

### Added
- **Matching Engine Specification (ADR-0924):** Defined the 4-dimensional weighted scoring framework (Hard Skills 40%, Experience Calibration 25%, Domain Relevance 20%, Credentials & Education 15%).
- **Deterministic Role Ladders:** Drafted preliminary taxonomy matrices for Indian tech ecosystem leaders (CRED, Razorpay, Swiggy, Flipkart, Zepto) and IT service enterprise tiers.
- **Privacy Policy Core:** Hardened client-side execution boundaries guaranteeing 100% in-browser resume evaluation with zero remote telemetry.

### Changed
- Refactored company workflow interfaces and job marketplace candidate filtering logic.
- Standardized candidate journey stages across application tracker and interview simulator.

---

## [2.0.0] - 2026-09-23

### Added
- Multi-tenant company dashboard and candidate application portal scaffolding.
- Candidate role-aware navigation and responsive layout foundations.
- LocalStorage state persistence layer for deterministic evaluation sessions.

---

## [1.0.0] - 2026-09-19

### Initial Release
- Initial project scaffolding with React 19, TypeScript, and Tailwind CSS.
- Basic ATS resume roaster and keyword overlap scoring engine.
