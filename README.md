# HireFlow

HireFlow is a privacy-first, client-side career intelligence platform and deterministic Applicant Tracking System (ATS) evaluation engine.

---

## Features

### 1. ATS Resume Roaster (`/tools/resume-checker`)
- Deterministic ATS evidence scoring across Hard Skills, Writing Quality, Seniority Alignment, and Format Safety.
- Verbatim resume evidence citations with exact match, alias, implied, and related skill detection.
- Actionable harsh truths identifying keyword stuffing, missing metrics, and structural risks.

### 2. Dual-Role Job Description Comparison (`/tools/jd-compare`)
- Aligned head-to-head comparison between competing job postings.
- Synchronized metric rings (Fit Score, Must-Haves, Callback Probability, Readiness Tier).
- Architectural divergence analysis isolating shared core technologies versus role-exclusive requirements.
- 3-step actionable bridge preparation plan.

### 3. Resume Tailor Engine (`/tools/tailor`)
- Evidence-grounded tailoring that prevents hallucinated skills or unearned credentials.
- Real-time dark paper preview and Word `.docx` download.
- Sentence-level rewrite suggestions backed by quantifiable metrics.

### 4. Career Trajectory & Roadmaps (`/tools/career-path`)
- Interactive career ladder simulator across major engineering levels and compensation tiers.
- Dream job roadmap generator identifying technical stepping stones and promotion timelines.
- Company levels comparison across Big Tech and Indian flagships.

### 5. TalentLens Intelligence (`/tools/talent-lens`)
- Deep company profiles, interview stage breakdowns, and culture insights.
- Glassdoor-calibrated ratings, engineering compensation bands, and technical interview rubrics.

### 6. Outreach Generator (`/tools/reach-out`)
- Tailored recruiter and hiring manager cold outreach message generator.
- Multi-channel templates (LinkedIn InMail, Referral Request, Cold Email).

### 7. Project Briefs Builder (`/tools/build-briefs`)
- Tailored project specifications designed to close specific technical resume gaps.
- Includes architectural blueprints, database schemas, and resume bullet point templates.

### 8. Enterprise Role Dashboards
- Multi-persona platform supporting Business HR Managers (`/company/dashboard`), HR Recruiters, Interviewers (`/interviewer/dashboard`), and Platform Administrators (`/admin/dashboard`).

---

## Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Zustand with persistent storage
- **Routing**: React Router v7
- **Document Processing**: `pdfjs-dist`, `docx`, `mammoth`
- **Charts & Visualization**: Recharts, Lucide React
- **Validation**: Zod
- **Testing**: Vitest

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
git clone https://github.com/Mohit-Rocky-25/hireflow.git
cd hireflow
npm install
```

### Running Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm run preview
```

---

## Folder Structure

```
hireflow/
├── public/                # Static assets, SVG sprites, and security headers
├── docs/                  # Architecture reference and security specifications
├── scripts/               # Automation, secret scanners, and synthetic fixtures
├── src/
│   ├── app/               # Shell layout, navigation, and protected route guards
│   ├── pages/             # Route-level page components
│   ├── features/          # Core modules (ats, career-path, suite, roles, auth)
│   ├── components/        # Shared reusable UI primitives
│   ├── data/              # Canonical shared datasets (companies, skills, taxonomy)
│   ├── lib/               # Pure helpers, security validators, and word counters
│   ├── store/             # Zustand state store and demo fixtures
│   ├── types/             # Global TypeScript type definitions
│   ├── App.tsx            # Application router and provider tree
│   └── main.tsx           # React DOM root entry point
├── package.json           # Dependencies and project scripts
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite bundler configuration and dev plugins
```

---

## Environment Variables

Copy `.env.example` to `.env` to configure optional server-side enhancements:

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Optional Google Gemini API key for hybrid AI commentary | `""` (runs pure deterministic) |
| `VITE_APP_ENV` | Application environment mode | `development` |
| `MAX_UPLOAD_SIZE_BYTES` | Maximum allowed document upload size | `5242880` (5 MB) |

---

## License

MIT License. Open source for candidates and developers.