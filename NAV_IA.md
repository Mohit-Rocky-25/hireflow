# HireFlow Information Architecture & Sidebar Structure (NAV_IA.md)

**Date**: 2026-10-15  
**Architect**: Principal Front-End Architect & UX Engineer  
**Stage**: Stage 2 Information Architecture Specification  
**Governing Standard**: ISO 9241-210 (Human-Centered Design), WCAG 2.2 AA, Nielsen Norman Group Navigation Guidelines

---

## 1. Core Architectural Principles

1. **Group by User Goal, Not Internal Code Names**:
   Instead of arbitrary technical names (e.g. "Module A", "Suite"), navigation labels describe concrete user actions (*"Fix My Resume"*, *"Target Roles & Levels"*, *"Prove My Skills"*, *"Jobs & Applications"*).
2. **Strict 2-Level Hierarchy (Section → Subsection)**:
   Every single route is reachable within **max 2 levels** (Section Group → Subsection Nav Item) and **at most 2 clicks**.
3. **5 to 7 Top-Level Groups at Most**:
   Complies with Miller's Rule (7 ± 2 items) for optimal working memory and immediate cognitive clarity.
4. **Role-Aware Adaptive Scoping**:
   Each role (Candidate, Recruiter/BHR, Interviewer, Admin) sees a curated, goal-oriented view containing only what is relevant to their workflow, with cross-tool access for maximum utility.
5. **Clear Anchors**:
   - Top Anchor: **HireFlow Brand + Direct Home/Dashboard link** + **Command Palette Search (<kbd>Ctrl</kbd>+<kbd>K</kbd>)**.
   - Bottom Anchor: **User Profile, Role Pill, Account Settings & Sign Out**.
6. **Zero Dead Links & Backward Compatibility**:
   All historic and deprecated routes automatically redirect to their canonical equivalents.

---

## 2. Proposed Information Architecture Tree by Role

### A. Candidate / Tech Talent Role (`CANDIDATE`)
*Target User: Engineering college fresher or professional seeking tech jobs, resume fixes, and skill credentials.*

```text
├── 🏠 Home Dashboard (/candidate/dashboard)
│
├── 📂 1. Fix My Resume
│   ├── ATS Resume Scanner (/tools/resume-checker)
│   ├── Bullet & Content Tailor (/tools/tailor)
│   └── My Master Resume (/candidate/resume)
│
├── 📂 2. Target Roles & Roadmaps
│   ├── Career Trajectory Hub (/tools/career-path)
│   ├── Career Milestone Planner (/tools/career-path/dream-job-roadmap)
│   ├── Company Levels & Pay (/tools/career-path/company-levels)
│   └── Recruiter POV Simulator (/tools/talent-lens)
│
├── 📂 3. Prove My Skills
│   └── Credential & Contest Catalog (/tools/credential-engine)
│
├── 📂 4. Find & Compare Jobs
│   ├── Explore Jobs (/candidate/jobs)
│   ├── Side-by-Side JD Match (/tools/jd-compare)
│   └── Company Match Score (/candidate/company-match)
│
├── 📂 5. Applications & Outreach
│   ├── My Applications (/candidate/applications)
│   ├── Cold Outreach Generator (/tools/reach-out)
│   ├── Interview Prep Briefs (/tools/build-briefs)
│   └── Interview Schedule (/candidate/interviews)
│
├── 📂 6. Career Suite Overview
│   └── All Tools Directory (/tools)
│
└── ⚙️ Account & Profile
    ├── Candidate Profile (/candidate/profile)
    └── Notifications (/candidate/notifications)
```

---

### B. Company / BHR Manager & HR Recruiter Roles (`BHR_MANAGER`, `HR_RECRUITER`)
*Target User: Talent acquisition leads, recruiters, and HR heads hiring engineering talent.*

```text
├── 📊 Recruiter Dashboard (/company/dashboard)
│
├── 📂 1. Jobs & Postings
│   ├── Active Requisitions (/company/jobs)
│   └── Create New Job (/company/jobs/new)
│
├── 📂 2. Candidate Pipeline
│   ├── Candidate Applicants (/company/candidates)
│   └── Offer Approvals (/company/offers)
│
├── 📂 3. Interview Panels
│   ├── Interviewer Load & Passes (/company/interviewers)
│   └── Company Team & Roles (/company/team) [BHR Manager Only]
│
├── 📂 4. Hiring Intelligence & Tools
│   ├── Recruitment Analytics (/company/analytics)
│   ├── ATS Roaster Benchmark (/tools/resume-checker)
│   ├── JD Compare & Calibrate (/tools/jd-compare)
│   ├── TalentLens Recruiter POV (/tools/talent-lens)
│   └── Decision Suite Tools Hub (/tools)
│
└── ⚙️ Company & Profile
    ├── Company Settings (/company/settings) [BHR Manager Only]
    └── Notifications (/company/notifications)
```

---

### C. Technical Interviewer Role (`INTERVIEWER`)
*Target User: Engineering staff conducting rounds, scoring candidates, and validating competency.*

```text
├── 📅 Interviewer Dashboard (/interviewer/dashboard)
│
├── 📂 1. My Evaluations
│   └── Scheduled Interviews (/interviewer/interviews)
│
├── 📂 2. Interviewer Tools
│   ├── Candidate Briefs Builder (/tools/build-briefs)
│   ├── Role Requirements Benchmark (/tools/jd-compare)
│   ├── Engineering Levels Matrix (/tools/career-path/company-levels)
│   └── Career Tools Hub (/tools)
│
└── ⚙️ Profile & Schedule
    ├── My Profile & Availability (/interviewer/profile)
    └── Notifications (/interviewer/notifications)
```

---

### D. Platform Administrator Role (`PLATFORM_ADMIN`)
*Target User: System administrator managing multi-tenant enterprise companies, security, and global roles.*

```text
├── 🛡️ Admin Dashboard (/admin/dashboard)
│
├── 📂 1. Platform Tenants
│   ├── Managed Companies (/admin/companies)
│   └── User Directory & Roles (/admin/users)
│
├── 📂 2. Governance & Diagnostics
│   ├── Security Audit Log (/admin/audit)
│   ├── Platform Settings & AI Keys (/admin/settings)
│   └── Careers Data Platform (/dev/careers-data)
│
├── 📂 3. Suite Diagnostic
│   └── Decision Suite Hub (/tools)
│
└── ⚙️ System
    └── Notifications (/admin/notifications)
```

---

## 3. Canonical URLs & Redirects Table

To maintain 100% backward compatibility and eliminate dead links discovered in Stage 1:

| Source / Deprecated URL | Canonical Target URL | Status | Rationale |
| :--- | :--- | :---: | :--- |
| `/tools/tracker` | `/candidate/applications` | Permanent Redirect | Resolves orphan link in `ReachOutPage.tsx:170`. |
| `/jobs/:id` | `/candidate/jobs/:id` | Permanent Redirect | Resolves broken link in `CandidateJobs.tsx:168`. |
| `/tools/credentials` | `/tools/credential-engine` | Permanent Redirect | Alias for Credential Engine. |
| `/tools/opportunity-engine` | `/tools/credential-engine` | Permanent Redirect | Alias for Credential Engine. |
| `/tools/career-path/promotion-simulator` | `/tools/career-path/dream-job-roadmap` | Permanent Redirect | Unified under Dream Job Roadmap tab. |
| `/tools/career-path/company-ladder` | `/tools/career-path/company-levels` | Permanent Redirect | Unified under Company Levels tab. |
| `/tools/career-path/simulator` | `/tools/career-path/dream-job-roadmap` | Permanent Redirect | Short alias redirect. |
| `/tools/career-path/explorer` | `/tools/career-path/company-levels` | Permanent Redirect | Short alias redirect. |
| `/admin/analytics` | `/admin/dashboard` | Permanent Redirect | Consolidates admin analytics on dashboard. |
| `/admin/ai` | `/admin/settings` | Permanent Redirect | Consolidates AI settings under admin settings. |

---

## 4. Design & Typography Tokens for Navigation Elements

Following the project's visual guidelines:
- **Font**: Inter (`var(--font-sans)`).
- **Labels**: 15px - 16px font size, weight `600` (SemiBold / Bold).
- **Sidebar Background**: Dark cool-toned surface `bg-[#0F172A]` (Slate 900) or `bg-surface` border `border-border`.
- **Active Navigation Item**: Solid filled background (`bg-primary/10` or `bg-surface-2`) with left accent bar (3px width, `bg-primary`), `text-primary font-bold`, and `aria-current="page"`.
- **Inactive Item**: `text-text-secondary hover:text-text hover:bg-surface-2/60`.
- **Touch Target**: Minimum `44px` height (`min-h-[44px]`).
- **Icons**: 20px (`w-5 h-5`), stroke width `1.75px` from `lucide-react`.
- **Badges**: Pill badges (`text-[11px] font-bold px-2 py-0.5 rounded-full`) with live dynamic counts computed from shared datasets.
