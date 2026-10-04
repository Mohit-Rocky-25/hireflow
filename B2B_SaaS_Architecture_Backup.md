# HireFlow: B2B Multi-Tenant Architecture & Cinematic UI Blueprint
*This document contains the exact architectural models, UI design aesthetics, and a massive copy-paste prompt to flawlessly reconstruct the premium B2B Company portal in your future project.*

## 1. Cinematic UI & Design Aesthetics (To Replicate)
The current B2B portal feels like a premium, state-of-the-art enterprise app. To maintain this "Wow Factor" in your new project, you must enforce these UI rules:
*   **Colors & Glassmorphism:** Use deep `bg-surface` (white/dark gray) with subtle `bg-primary/5` (light purple/blue) accents. Use `backdrop-blur-md` for floating menus and modals.
*   **Micro-Animations:** Use `transition-all duration-300`, `hover:shadow-md`, and `group-hover` extensively. Buttons must scale slightly (`active:scale-95`). 
*   **Data Visualization:** Use `recharts`. Dashboards must not be boring tables. Use `RadarChart`, `ScatterChart`, and `AreaChart` with gradient fills (`<defs><linearGradient/></defs>`).
*   **Typography:** Small, uppercase tracking for labels (`text-[10px] uppercase tracking-wider text-muted`). Bold, tightly tracked headers (`text-2xl font-bold tracking-tight`).

## 2. Core Architecture & State Management
*   **Zustand Store (`useStore.ts`):** Single source of truth.
*   **Multi-tenancy:** Filter all queries by `companyId === currentCompanyId`.
*   **Relational Models Needed:** `Company`, `CompanyMember` (with RBAC roles: `RECRUITER`, `BHR`, `INTERVIEWER`), `Job`, `Application`, `Interview`, `CandidateMatch`.

## 3. The 4 Main B2B Portals Built
1.  **BHR Dashboard (`CompanyTeam.tsx` & `CompanyAnalytics.tsx`):** Drag-and-drop Org Chart Sandbox with live budget burn calculator. Talent Poaching ScatterChart and AI Flight Risk Predictor.
2.  **Recruiter Portal (`CompanyCandidates.tsx`):** Interactive HTML5 Drag-and-Drop Kanban Board. AI context chips and Quick Action hover menus on candidate cards.
3.  **Interviewer Workspace (`CompanyInterviewers.tsx`):** Split "Upcoming/Completed" view. AI Copilot Intel briefing cards generated before interviews. Team Burnout Tracker.
4.  **AI Candidate Ranking (`CompanyJobDetail.tsx`):** Swiping/Selecting portal. Fast Reject and Select for Interview action bar.

---

## 4. The Ultimate Copy-Paste Prompt
*Copy everything inside the blockquote below and paste it into an AI (like Claude, ChatGPT, or Gemini) when you are ready to rebuild the B2B SaaS project. It forces the AI to build exactly what we had today.*

> **System Prompt: Build a Premium B2B Multi-Tenant ATS SaaS**
> 
> You are a senior full-stack engineer tasked with building a premium, highly cinematic B2B SaaS platform for Hiring/HR. You must use React, TailwindCSS, Lucide-React, Recharts, and Zustand for global state management.
> 
> **CRITICAL UI RULES:**
> Do not build a boring, basic MVP. The UI must feel like a state-of-the-art $1B enterprise app. Use glassmorphism, subtle micro-animations (hover:shadow-md, active:scale-95), and modern typography (small uppercase bold labels, tight tracking on headers). Use gradient backgrounds for primary buttons and AI elements. 
> 
> **ARCHITECTURAL REQUIREMENTS:**
> 1. Use a single Zustand store handling multi-tenancy (filter all arrays by `currentCompanyId`).
> 2. Create the following relational models: Company, CompanyMember (with roles RECRUITER, BHR, INTERVIEWER), Job, Application, Interview, CandidateMatch.
> 
> **PORTALS TO BUILD:**
> 1. **Recruiter Kanban Board:** Build a gorgeous, interactive HTML5 Drag-and-Drop Kanban board for applications. Candidate cards must feature "AI Context Chips" explaining why they match, and a floating hover menu with "Fast Reject" and "Move to Interview" icons.
> 2. **BHR Analytics & Org Chart:** Build a dashboard using Recharts. Include a "Talent Poaching Heatmap" (ScatterChart) and an "AI Flight Risk Predictor". Build a separate "Company Team" page featuring a recursive, CSS-drawn Drag-and-Drop Org Chart. Allow BHR to drag employees between managers and see a live "Virtual Seat Budget Burn" calculator.
> 3. **Interviewer Workspace:** Build a portal for employees conducting interviews. Show "Upcoming" vs "Completed" tabs. For upcoming interviews, show a beautifully styled "Copilot Intel" card summarizing what the interviewer should ask based on resume gaps. Include a "Team Load" radar showing which interviewers are getting burned out.
> 4. **AI Job Ranking:** Inside the specific Job Detail page, build an "AI Ranking" tab that lists candidates sorted by an AI score. Each card must have a "Fast Reject" and "Select for Interview" action bar for rapid swiping/selection.
> 
> Please generate all necessary files, state logic, and mock data to render this cinematic experience perfectly.
