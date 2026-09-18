# HireFlow — Multi-Tenant AI-Assisted Hiring Platform

HireFlow is a production-grade multi-tenant hiring marketplace and recruitment operating platform designed to streamline the entire recruitment lifecycle from requisition to final offer.

## 🚀 Key Features

### 1. Multi-Tenant Architecture & Role-Based Access Control (RBAC)
- **5 Distinct Roles**:
  - **`PLATFORM_ADMIN`**: Platform monitoring, cross-company governance, system audit logs, and user directory.
  - **`BHR_MANAGER`**: End-to-end recruitment management, requisition approval, AI screening configurations, candidate shortlisting, and hiring analytics.
  - **`HR_RECRUITER`**: Job posting, applicant screening, interview coordination, and pipeline tracking.
  - **`INTERVIEWER`**: Scoped access to assigned interview sessions, structured evaluation rubrics, and feedback submission.
  - **`CANDIDATE`**: Discover job opportunities, AI resume upload & auto-parsing, pipeline tracking, and interview scheduling.

### 2. Multi-Step Job Requisition Builder
- 7-step wizard: Basic info, AI job description generator, weighted requirement criteria, screening thresholds, and live preview.

### 3. AI-Assisted Candidate Screening & Ranking
- Deterministic requirement extraction and matching.
- Objective scoring with evidence breakdown (strong matches, gaps, confidence score, and explainable rationale).
- Candidate ranking matrix.

### 4. Structured Interview Evaluation System
- Technical Knowledge, Problem Solving, Communication, and Role Competence ratings (1-5 scale).
- Standardized recommendations: *Strong Hire*, *Hire*, *Maybe*, *No Hire*, *Strong No Hire*.

### 5. Candidate Experience Portal
- Interactive application pipeline tracker.
- Intelligent resume parser with automatic skill extraction.
- Interview video room integration.

---

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Design Tokens (Inter font, 10px button radius, 14px card radius)
- **Icons**: Lucide React
- **State & Persistence**: Zustand with localStorage persistence
- **Charts**: Recharts

---

## 💻 Getting Started

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | `admin@hireflow.io` | `admin123` |
| BHR Manager | `sarah@techcorp.com` | `demo123` |
| HR Recruiter | `marcus@techcorp.com` | `demo123` |
| Interviewer | `elena@techcorp.com` | `demo123` |
| Candidate | `alex@example.com` | `demo123` |
