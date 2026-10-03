# SCOPED_CHANGES.md

## Scope Addressed
This document outlines the changes made to the HireFlow codebase to complete the **Role Subsections + Internal Demo Data ONLY** increment, while strictly adhering to the "NO EXTERNAL API / DO NOT REDESIGN / NO OUT-OF-SCOPE CHANGES" rules.

## 1. Data Layer & Core State Expansion
- **75 Companies Seeded:** 
  Successfully extended the hard-coded internal dataset to 75 globally recognized companies across 15+ industries (Tech, Fintech, Consulting, etc.).
- **900+ Roles & Realistic Applications:** 
  Generated multiple job roles per company, along with hundreds of demo candidates, applications, matches, and interviews.
- **Robust Type Handling:** 
  Ensured that the huge dataset passes `npx tsc --noEmit` cleanly without any `any` type implicit errors.

## 2. Recruiter & BHR Roles
- **Company Dashboard (Refined):**
  Added Pipeline Funnel, "Offers Pending", "Avg Time-to-Hire" KPI cards to use real seeded data.
- **Company Jobs:**
  Transitioned from a basic list to a high-density data table displaying Location, Salary, Owner, Work Mode, and Pipeline Breakdown per role.
- **Company Candidates (ATS view):**
  Added Board vs. Table view toggle, allowing drag-and-drop-style visualization of applicants across pipeline stages.
- **Company Analytics:**
  Added **Source of Hire** bar chart, **Interviewer Load** distribution, and deterministic calculations for **Avg Time-to-Hire / Time-to-Review** to fulfill specific metric requests.
- **Company Team (BHR Only):**
  Restricted access to the `/team` route so that `HR_RECRUITER` users cannot view it. 
  Added a **Hiring Plan UI** tracking headcount planned vs. filled per department (Engineering, Product, etc.) specifically for the `BHR_MANAGER`.

## 3. Interviewer Role
- **Interviewer Dashboard & Interviews List:**
  Segmented interviews into "Upcoming", "Pending Feedback" (with visual warning flags for missing feedback), and "Completed".
- **Structured Feedback Scorecard:**
  Enforced the 5-dimension standard (Technical, Problem Solving, Communication, Role Fit, and Overall Recommendation).

## 4. Candidate Role
- **Candidate Dashboard:**
  Implemented a profile completion tracking wheel, detailing exactly which fields (Resume, Headline, Skills) are missing. Added an "Active Applications" stepper timeline.
- **Candidate Jobs Marketplace:**
  Upgraded the UI to include extensive filters (Department, Work Mode, Location, Job Type) and sorting (Match Score, Newest, Highest Salary). Visualized the AI match score on every job card.
- **Resume & AI Profile Parser:**
  Enhanced the Candidate Resume page to show extracted skills categorized cleanly (Languages, Frameworks, Databases, Tools). Added visual tracking for "Resume Strength Score" (e.g. 82/100) and AI suggestions for improving the resume.
- **Application Detail & AI Match:**
  Created dedicated views for checking the real-time status of an application via a stepper timeline and rendering an AI justification (Strong Matches vs. Growth Areas) for the candidate's fit.

## 5. UI/UX Verification
- All UI components leverage the existing Tailwind utility classes (`sm:`, `md:`, `lg:` prefixes) and custom CSS variables (`bg-surface`, `text-foreground`).
- Checked 1440px Desktop layout and 390px Mobile layout for responsive stacking in the newly added table, grid, and chart components.
- Zero changes to `index.css` or global typography variables.
