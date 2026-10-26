# Stage S1 Spec Review Pack (STOP-1)

- **Stage**: S1 (Spec Expansion & Architecture Schemas)
- **Status**: NEEDS-USER (STOP-1 Gate)
- **Branch**: `feat/pathways-v1`
- **Target Tag**: `pw-stage-1`
- **Date**: 2026-10-26

---

## 1. What Was Completed in Stage S1
1. **Spec Expansion (`docs/pathways/SPEC.md`)**:
   - **Section C13**: Complete ASCII wireframes designed for 390px mobile screens across all 5 routes (`/tools/pathways`, `/program/:id`, `/plan`, `/offers`, `/about-data`).
   - **Section C14**: Microcopy dictionary enforcing approved labels ("Meets published criteria", "Check these details", "Does not meet a published criterion", "No criteria published") and eliminating banned marketing claims.
   - **Section C15**: Comprehensive fixture matrix containing **20 student profiles** (covering all C12 edge cases including lateral entry, scale 4, backlogs, gaps, aliases) and **8 synthetic offer scenarios** (mass IT services, premium services, GCC variable CTC, startup ESOPs, bonds, clawbacks, and joining months).
2. **TypeScript Schemas & Validators (`src/pathways/schema/`)**:
   - `types.ts`: Strongly-typed contracts for EvidenceRef, RuleRow, StudentProfile, ProgramFacts, ProgramEligibilityResult, ActionPlanResult, OfferInput, OfferResult, EngineTrace, and Assumptions.
   - `validators.ts`: Pure validation functions strictly enforcing the Constitution H2 closed field list, H3 row shape, H8 non-imputation value restrictions, and snippet word limit (max 15 words).
3. **ADR-001 (`docs/pathways/decisions/ADR-001.md`)**:
   - Comprehensive architectural record analyzing the 3 core design decisions and rejected alternatives (Ledger-First vs Scraping, Deterministic Offline vs Cloud Backend, 3-Input Budget vs Long Wizard).

---

## 2. What You (The User) Must Check
Please review the following artifacts before granting approval:
1. **Mobile Wireframes (`docs/pathways/SPEC.md` Section C13)**:
   - Does the 3-input initial budget (Branch, Batch Year, CGPA) feel right for an engineering student on a phone?
   - Do the 4 result buckets (`Meets published criteria`, `Check these details`, `Does not meet a published criterion`, `No criteria published`) match your expectations?
2. **Offer Evaluator Structure (`SPEC.md` Section C7 & C13)**:
   - Are the 3 variable scenarios (0%, 50%, 100%) and the month 0–36 exit exposure timeline clear?
   - Is the fixed service bond note acceptable?
3. **Edge Case Coverage (`SPEC.md` Section C15)**:
   - Do the 20 student profiles adequately cover the realities of Indian engineering campuses (active vs cleared backlogs, lateral entry diplomas, branch aliases like E&TC)?
4. **Architectural Decisions (`docs/pathways/decisions/ADR-001.md`)**:
   - Do you agree with the 3 accepted decisions?

---

## 3. How to Proceed
If the specifications, wireframes, schemas, and ADR meet your requirements:
Reply with:
```text
APPROVED: STOP-1
```
This will release the gate and allow autonomous execution of **Stage S2 (Pipeline & Guardrails)**.
