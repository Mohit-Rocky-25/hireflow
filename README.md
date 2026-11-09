# HireFlow AI — Candidate Career & ATS Intelligence Suite

> **The Candidate-First AI Career Super-Platform.**  
> *Deterministic ATS resume evaluation, zero-hallucination tailoring, career trajectories, verified build briefs, and company intelligence.*

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10B981)](#security-privacy--zero-egress)
[![Truth Gate](https://img.shields.io/badge/Integrity-Zero%20Hallucination-F59E0B)](#the-truth-gate-standard)

---

## Executive Summary

**HireFlow** is a client-side career intelligence platform and deterministic Applicant Tracking System (ATS) evaluation engine. Unlike standard generative "AI resume builders" that hallucinate fake metrics, invent unearned technologies, and degrade candidate credibility, HireFlow enforces mathematical evidence, verifiable factual integrity, and 100% client-side privacy.

All parsing, evaluation, scoring, and document generation execute entirely in the candidate's browser sandbox. Your resume text, job descriptions, and personal notes **never leave your local machine**.

---

## Core Pillars & Prime Directives

1. **The Truth Gate Standard (Zero Hallucination)**:
   Every metric, date, framework, or claim in a tailored resume must originate from the candidate's verified **Fact Ledger**. The engine strictly rejects invented achievements or unearned buzzwords.
2. **100% Client-Side Privacy (Zero Egress)**:
   Zero remote tracking, zero analytics beacons, zero server-side resume databases. Local browser storage (`localStorage` & `IndexedDB`) keeps candidate data safe.
3. **Deterministic Evaluation**:
   Given the same resume and job description, HireFlow's scoring mathematical engine produces the exact same calibrated scores, citations, and gap analyses every time.
4. **Verifiable Data Provenance**:
   Every salary benchmark, company interview loop, and curriculum credential carries provenance metadata: origin source, verification timestamp, and confidence rating.

---

## The 9 Core Tools

HireFlow delivers a unified decision suite accessible from the central **Tools Hub** (`/tools`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIREFLOW DECISION SUITE                         │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│ 1. ATS Resume Roaster    │ 4. Project Build Briefs  │ 7. TalentLens    │
│    (/tools/resume-checker)│    (/tools/build-briefs) │    (/demo)       │
├──────────────────────────┼──────────────────────────┼──────────────────┤
│ 2. Resume Tailor Studio  │ 5. Credential Engine     │ 8. Reach Out     │
│    (/tools/tailor)       │    (/tools/credential)   │    (/tools/reach)│
├──────────────────────────┼──────────────────────────┼──────────────────┤
│ 3. Dual-Role JD Compare  │ 6. Career Trajectory     │ 9. Tools Hub     │
│    (/tools/jd-compare)   │    (/tools/career-path)  │    (/tools)      │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

### 1. ATS Resume Roaster (`/tools/resume-checker`)
- **Deterministic 4-Pillar Rubric**: Evaluates resumes across *Hard Skills Alignment*, *Evidence & Impact*, *Fresher Readiness*, and *Format Safety*.
- **Span-Level Citations**: Highlights verbatim text citations from the resume with calibrated evidence tiers ($L0$ ungrounded keyword through $L3$ quantified production outcome).
- **Zero Buzzword Fluff**: Flags ambiguous claims, missing metrics, and weak action verbs with step-by-step rewrite suggestions.

### 2. Resume Tailor Studio (`/tools/tailor`)
- **Fact Ledger v2 Engine**: A structured, non-destructive candidate ledger that preserves your real experiences.
- **Truth Gate Verification**: Synthesizes tailored bullet points while mathematically enforcing that no unearned technologies or inflated numbers are introduced.
- **Multi-Format Export Parity**: Generates pixel-accurate HTML preview, clean plain-text ASCII, and true binary `.docx` Word documents.

### 3. Dual-Role JD Comparison (`/tools/jd-compare`)
- **Side-by-Side Architectural Analysis**: Compare two target Job Descriptions simultaneously.
- **Skill Divergence Mapping**: Isolates common core competencies versus role-specific prerequisites.
- **Actionable Gap Bridge**: Generates custom 3-step project learning paths to target missing requirements.

### 4. Project Build Briefs & Set-Cover Bundler (`/tools/build-briefs`)
- **83 Full-Scale Engineering Briefs**: Production-grade system specifications across 10 technical tracks (Distributed Systems, Cloud & DevOps, Data Engineering, FinTech, Systems/OS, etc.).
- **Multi-Option Gap Coverage**: Suggests 3 to 4 distinct gap-closing projects so candidates can choose their preferred domain.
- **Substance Checklists**: Complete with architectural constraints, verification commands, and real recruiter talking points.

### 5. Credential & Opportunity Engine (`/tools/credential-engine`)
- **Verified Opportunities**: 100+ accredited industry certifications, hackathons, and open-source fellowship roadmaps.
- **India Fresher Playbooks**: Fee-waiver guides, application schedules, and eligibility checklists for tier-2/tier-3 engineering students.
- **iCalendar (.ics) Sync**: One-click local calendar generation for application and examination deadlines.

### 6. Career Trajectory & What-If Simulator (`/tools/career-path`)
- **Compensation & Level Ladders**: Realistic Indian tech compensation benchmarks (LPA and INR) across 100+ verified companies.
- **2-Year Engineering Milestones**: Structured fresher-to-SDE2 roadmap detailing expected technical autonomy and deliverables.
- **What-If Career Simulator**: Interactive progression trees simulating promotion requirements and skill acquisition.

### 7. TalentLens Company Intelligence (`/demo`)
- **100+ Employer Profiles**: Deep hiring insights for top product companies, high-growth startups, and GCCs in India.
- **Interview Stages & Hiring Bars**: Stage-by-stage interview breakdowns, DSA difficulty ratings, and evaluation criteria.
- **Recruiter Perspective Simulation**: Dual-sided view revealing how hiring managers evaluate candidate profiles.

### 8. Reach Out Cold Email & InMail Generator (`/tools/reach-out`)
- **Concise Outreach**: Generates deterministic outreach notes for LinkedIn connection requests (strictly capped at 300 characters), cold emails, and referral inquiries.
- **Honest Slot Resolution**: Uses explicit `[FILL_IN]` placeholders for missing facts without generating fake mutual connections.

### 9. Central Tools Hub (`/tools`)
- **Unified Launchpad**: Quick-action cards, live application status, local storage backup controls, and tool progress monitoring.

---

## Architecture & Technology Stack

```
HireFlow AI Architecture
├── Client-Side Presentation
│   ├── React 19 + TypeScript (Strict Mode)
│   ├── Vite 8 Build System & HMR
│   ├── Tailwind CSS v4 + Dark Luxury Design Tokens
│   └── Lucide React + Recharts
│
├── Ingestion & Parser Pipelines
│   ├── pdfjs-dist (Pure client-side PDF text-layer extraction)
│   ├── mammoth (DOCX structure and typography extraction)
│   ├── pdf-lib (Vector-accurate PDF synthesis)
│   └── docx (Binary Word document compiler)
│
├── Evaluation & Reasoning Engine
│   ├── Deterministic Scoring Rubrics (Zero-hallucination)
│   ├── Mathematical Truth Gate & Fact Ledger Invariants
│   ├── Zod v4 Runtime Schema Validation
│   └── Greedy Set-Cover Project Matcher
│
└── Storage & Security Sandbox
    ├── LocalStorage & IndexedDB Adapters
    ├── Zero-Egress Network Isolation
    └── Automated Pre-Commit Secret & Privacy Scanner
```

---

## Repository Directory Topology

```
hireflow/
├── .github/               # CI/CD workflows and automated quality checks
├── .githooks/             # Pre-commit gates (secrets, typecheck, privacy)
├── config/                # Platform limits, India market heuristics, constants
├── data/                  # Standardized role taxonomies and skill registries
├── docs/                  # Authoritative system specs and architecture guides
│   ├── ats/               # ATS scoring models & construct validity
│   ├── briefs/            # Engineering project brief catalog & DAG
│   ├── careers/           # Career trajectory models & level maps
│   ├── companies-100/     # 100-company hiring research & verification
│   ├── scoring/           # Scoring specification & sensitivity models
│   ├── security/          # Threat models, privacy audit & auth specs
│   └── tailor/            # Resume tailor engine architecture & rules
├── public/                # Static assets, Web App Manifest, download portal
├── scripts/               # Build helpers, test runners, and taxonomy linters
├── src/
│   ├── components/        # Reusable UI components, modals, and navbar
│   ├── config/            # Feature flags, scoring weights, wordlists
│   ├── data/              # Live market datasets, company logos, curriculum
│   ├── engine/            # Core matching, roaster, tailor & ledger engines
│   ├── features/          # Modular feature domains (ATS, tailor, outreach)
│   ├── lib/               # Storage adapters, parsers, and safe render utils
│   ├── pages/             # Route views (Landing, ToolsHub, Roaster, Tailor)
│   ├── scoring/           # Deterministic scoring specification & validators
│   ├── store/             # Zustand state management stores
│   └── styles/            # Tailwind theme tokens and print stylesheets
└── tests/                 # Vitest test suites (Unit, Engine, Invariance)
```

---

## Security, Privacy & Zero-Egress

- **Zero Remote Tracking**: Completely free of Google Analytics, Mixpanel, Sentry, or third-party telemetry beacons.
- **Zero Cloud Storage**: All candidate resumes, notes, and audit outputs remain strictly inside your browser's local memory.
- **Automated Security Pre-Commit**: A multi-stage Git hook scans staged files on every commit to prevent sensitive key leakage and verify TypeScript compilation.

---

## Getting Started

### Prerequisites
- **Node.js**: `18.0.0` or higher
- **npm**: `9.0.0` or higher

### Installation & Launch

```powershell
# 1. Clone the repository
git clone https://github.com/Mohit-Rocky-25/hireflow.git
cd hireflow

# 2. Install exact dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Quality Gates & Verification Commands

```powershell
# Run complete test suite
npm run test

# Run core evaluation & engine tests (289 tests)
npm run test:engine

# Run TypeScript compiler check (Zero-error gate)
npm run typecheck

# Run automated privacy and telemetry verification
npm run privacy:check

# Run full repository security audit
npm run security:check

# Production build compilation
npm run build

# Preview production build locally
npm run preview
```

---

## License & Attribution

- **Project**: HireFlow AI — Candidate Career & ATS Intelligence Suite
- **Engineering**: Independent, privacy-first software system engineered for students and early-career developers.
- **Trademarks**: All company names, logos, and trademarks referenced are the property of their respective owners and used solely for identification and educational reference.
