# HireFlow v4: Repository Audit (Stage 0.2)

Audit Date: 2026-10-19  
Environment: Windows (AMD), Node.js v24.18.0, TypeScript ~6.0.2, Vite 8.3.0  
Scope: Candidate tools only (ATS Resume Roaster, JD Compare, Tailor My Resume, Build Briefs, Credential Engine, Career Trajectory, TalentLens, Reach Out, and shared storage/logic).

---

## 1. Audit Matrix (Items a through j)

| Item | Area | Status | Existing State & Implementation Plan |
|------|------|--------|---------------------------------------|
| **(a)** | Engine layer & config files (scoring weights) | **DONE** | Pure deterministic engine in `src/lib/ats/` (parseResume, parseJD, matchSkills, evidenceScorer, formatAuditor, scoreAggregator). Weights & thresholds in `src/config/scoring.ts`, `thresholds.ts`, `wordlists.ts`, `India-fresher.ts`. |
| **(b)** | Provenance/freshness fields on datasets | **PARTIAL** | `credentials.ts` and `companies.ts` contain `lastVerified`, `source`, `sourceUrl`, `confidence`, and `status`. Will be extended across all datasets (briefs, ladders, roles) and checked via `validate:data`. |
| **(c)** | Fact Ledger v2 & migrations | **DONE** | Located in `src/engine/ledger/schema.ts` with Zod validation, migrations from v1, and safe parsing for corrupt/unknown shapes. |
| **(d)** | Zod schemas | **PARTIAL** | Exists for Fact Ledger v2, resume parsing, and credentials. Schemas for v4 stores (`profile`, `scanHistory`, `savedJDs`, `savedRoles`, `feedback`, `settings`, `briefProgress`, `scenarios`) will be created in Stage 1. |
| **(e)** | Existing Zustand stores & storage keys | **PARTIAL** | Stores exist in `src/store/candidateToolStores.ts` and `src/features/suite/credentials/storage.ts` using isolated keys (`hireflow_tool_*`, `hireflow-storage-v4`). Unified storage adapter with versioned keys `hireflow:v4:<store>`, quota fallbacks, and migration will be introduced in Stage 1. |
| **(f)** | Existing explain/evidence components | **PARTIAL** | `EvidenceQuote`, `ConfidenceChip`, `ProvenanceBadge` exist in `src/components/`. Need formal `ExplainedValue` interface and unified `ExplainDrawer` for all derived numbers (Stage 5 / B6). |
| **(g)** | Deterministic generateOutreach | **DONE** | Located in `src/features/suite/outreach/generateOutreach.ts`. Follows deterministic rules, placeholders, factsUsed traceability, and zero fabrication. |
| **(h)** | Credential Planned / In progress / Earned states | **DONE** | Implemented in `src/features/suite/credentials/storage.ts` with truth gating. |
| **(i)** | Test setup (Vitest environment, jsdom) | **DONE** | Vitest 5.0.3 with jsdom. 75 test files and 617 tests currently passing (100% green). |
| **(j)** | Service worker, manifest, CSP, lazy loading, URL state | **MISSING** | No service worker or web manifest. No CSP plugin for production build. Route lazy loading and URL state hook (`useUrlState`) will be implemented in Stages 1, 2, 7, and 9. |

---

## 2. In-Scope Candidate Tools & Routes

- `/roaster` (`/ats`): ATS Resume Roaster (Resume Strength, findings, annotated view)
- `/jd-compare`: Job Description vs Resume Matcher & Gap Analysis
- `/tailor`: Tailor My Resume (Fact Ledger review, Truth Gate, ATS templates, DOCX export)
- `/briefs`: Build Briefs (portfolio projects, suggested bundle, project scaffolding)
- `/credentials`: Credential Engine (freshness, fee waivers, calendar export)
- `/trajectory`: Career Trajectory (freshers 2-year timeline, eligibility checks, what-if scenarios)
- `/talentlens`: TalentLens (company cards, verified role data, demand aggregation)
- `/reachout`: Reach Out (grounded outreach messages, follow-ups, subject lines)
- `/data`: Your Data & Settings (backup/restore, quota monitor, clear data)
- `/methodology`: Transparent scoring formulas, live config derivations, limitations, feedback report

---

## 3. Strict Boundary Enforcements (P-6)

- Zero recruiter, BHR, interviewer, admin, or multi-tenant code.
- Zero Application Tracker, Job Board, application status pipeline, Offer Decoder, Company-vs-Company page, Profile Check, or Evidence Card.
- Dead links ("Compare with another company", "Have an offer? Decode it") are left untouched and documented.
