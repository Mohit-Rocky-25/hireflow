# HireFlow AI — The Candidate-First AI Career & ATS Super-Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security Hardened](https://img.shields.io/badge/Security-Audit_Passed_(100%25)-emerald.svg)](docs/security/AUDIT_LOG.md)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero_Data_Egress-cyan.svg)](docs/security/PRIVACY_AUDIT.md)
[![Tests Passing](https://img.shields.io/badge/Tests-Vitest_Passing-brightgreen.svg)](docs/BUILD_REPORT.md)

> **Empowering job seekers with an uncompromising, private, and deterministic Career & ATS Intelligence Suite.**  
> *Zero cloud API bills. Zero resume data leakage. Zero black-box rejections.*

---

## 🎯 The Motive: Why HireFlow AI Exists

The modern hiring process is broken for job seekers:

1. **The Black-Box ATS Wall**: Over 75% of qualified resumes are filtered out by automated Applicant Tracking Systems (ATS) before any human recruiter ever sees them. Candidates are left wondering why they were rejected.
2. **Predatory & Unreliable Tools**: Most commercial resume tools charge expensive per-scan subscriptions, send your sensitive personal data to remote cloud servers, or use generic LLMs that hallucinate fake skills and experiences—getting candidates disqualified during interviews.
3. **Compensation & CTC Confusion**: Job offers and CTCs (especially in India and global tech hubs) hide massive disparities between inflated headline figures and actual in-hand monthly pay. Candidates lack transparent tools to model tax implications, bonuses, and ESOPs.
4. **The Directionless Search**: Job seekers apply blindly to hundreds of postings without knowing which jobs match their strengths, what specific skills they are missing, or what projects would actually bridge the gap.

### Our Mission
**HireFlow AI flips the power dynamic in favor of the candidate.** 

We provide every job seeker with a free, state-of-the-art career super-suite running **100% locally in your browser**. Your resumes, personal info, and compensation data never leave your machine. You get deterministic, explainable scoring with zero guesswork and zero recurring cost.

---

## 🌟 Architecture & Core Guarantees

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 HIREFLOW AI CORE                                 │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ 🛡️ 100% Privacy & Zero Egress           │ ⚡ Deterministic Edge Engine             │
│ • Runs entirely in the client browser  │ • Pure TypeScript parsing & scoring     │
│ • No resume upload to external servers │ • Sub-50ms execution latency            │
│ • DPDP Act 2023 & GDPR aligned         │ • Zero external AI API keys required    │
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ 🔍 TruthCheck & Verbatim Citations     │ 📊 Comprehensive Career Intelligence    │
│ • Every score backed by exact quotes   │ • Real Indian & global compensation data│
│ • Zero hallucinated skills or claims   │ • Verified promotion ladders & blockers │
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

- **Client-Side Edge Execution**: All resume parsing (PDF/DOCX), keyword extraction, JD analysis, and scoring run completely in-browser via Web APIs and deterministic algorithms.
- **Explainable & Verbatim**: The engine doesn't produce random numbers. Every score includes a transparent breakdown: Matched Skills, Missing Prerequisites, Writing Quality, and Structure.
- **Anti-Hallucination TruthCheck**: Tailoring suggestions are strictly cross-verified against your actual background—ensuring you never misrepresent your credentials.
- **Zero Cost & Offline-Ready**: Works out-of-the-box on static hosting (Vercel, Cloudflare Pages, Netlify) with **$0 cloud maintenance costs**.

---

## 🛠️ Complete Feature Suite

HireFlow AI provides 9 integrated modules designed to support candidates at every stage of their career journey:

### 1. 🎯 Deterministic ATS Resume Scanner & Scorer
- Multi-dimensional scoring across **Hard Skills**, **Domain Competencies**, **Measurable Impact**, and **Formatting / ATS Readability**.
- Real-time feedback identifying exact keyword gaps, weak action verbs, and structural issues.
- Verbatim citation highlighting showing where in your resume each requirement was discovered.

### 2. ⚖️ Compare Job Descriptions (JD Comparator)
- Paste two or more target job descriptions side-by-side.
- Instantly compare required tech stacks, seniority expectations, and responsibilities.
- Prioritize applications where your current profile gives you the highest competitive advantage.

### 3. 💰 Offer Decoder & Indian Tax Engine
- **In-Hand Pay Calculator**: Converts inflated CTC packages into accurate monthly bank credits.
- **Tax Modeling**: Full calculation under the Indian New Tax Regime (FY 2026-27), including standard deduction, slab calculations, and **Section 87A rebate & marginal relief** logic.
- **Equity & Bonus Breakdown**: Models joining bonuses, performance incentives, and multi-year ESOP/RSU vesting schedules.

### 4. 📈 Tech Career Ladders & Progression Hub
- Comprehensive benchmarks covering:
  - **Big Tech India** (Google, Microsoft, Amazon, Meta, Uber, etc.)
  - **Indian Product Unicorns** (Flipkart, Swiggy, Zomato, Razorpay, Zepto, CRED, etc.)
  - **GCCs & Global Finance** (Goldman Sachs, Morgan Stanley, Walmart Global Tech, etc.)
  - **IT Services** (TCS, Infosys, Wipro, Accenture, etc.)
- Real promotion timelines, level equivalences (L3 Entry to L7+ Principal), and documented **structured promotion blockers** to help you break through career plateaus.

### 5. ✍️ TruthCheck Resume Tailor
- Intelligently align your resume against specific target roles without lying.
- Identifies transferable skills and phrasing enhancements while warning against unearned claims.

### 6. 🛠️ Project Briefs & Skill Gap Bundler
- Discovers missing core technologies from target JDs and uses a **set-cover algorithm** to bundle them into concrete, portfolio-ready project specifications.
- Gives you complete project architectures, tech stacks, and step-by-step implementation milestones.

### 7. 📬 Strategic Cold Outreach Generator
- Generates 15+ personalized, high-converting outreach messages for recruiters, engineering managers, and alumni.
- Tailors tone, highlights your verified match points, and avoids spammy generic phrases.

### 8. 📋 Candidate Pipeline & Application Tracker
- Private, local Kanban board to track your active applications from *Saved* and *Applied* to *Interview* and *Offer*.
- Add custom notes, interview dates, referral contacts, and round-by-round debriefs.

### 9. 🧪 TalentLens Competency Assessments
- Interactive technical assessments and coding challenges to test your core engineering knowledge before walking into real interviews.

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand v5](https://github.com/pmndrs/zustand) with local storage persistence
- **Visualizations**: [Recharts](https://recharts.org/)
- **Document Parsers**: `pdfjs-dist` (in-browser canvas PDF parsing) & `mammoth` (DOCX extraction)
- **Testing**: [Vitest](https://vitest.dev/) (Unit, Integration & Security test suites)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/Mohit-Rocky-25/hireflow.git
cd hireflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run automated test suites & navigation validator
```bash
# Run all unit tests
npm run test

# Run navigation registry validator
npm run validate:nav

# Run security and compliance checks
npm run security:check
```

### 5. Build for production
```bash
npm run build
```
The optimized static build will be in the `dist/` folder, ready for immediate $0 deployment to Vercel, Netlify, or Cloudflare Pages.

---

## 🧭 Extensible Navigation Architecture

HireFlow features a decentralized, zero-edit navigation system:
- **Persistent Left-Edge Sidebar**: ~272px expanded, ~72px collapsed icon rail with keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>B</kbd>).
- **Global Command Palette**: Instant modal search (<kbd>Ctrl</kbd> + <kbd>K</kbd>) across tools, sections, and keywords.
- **Zero Central Edits**: Features declare a `*.manifest.ts` file discovered via Vite `import.meta.glob`.
- **Automated Validation**: `npm run validate:nav` guarantees 0 dead routes, 0 broken links, and full role isolation.
- For complete details, see [NAV_GUIDE.md](NAV_GUIDE.md) and [NAV_TESTREPORT.md](NAV_TESTREPORT.md).

---

## 🔒 Security & Privacy Commitments

- **Zero Data Collection**: We do not collect, track, or sell your resumes, personal contact information, or search history.
- **Hardened Credential Storage**: All client credentials and session tokens utilize NIST FIPS 180-4 standard salted SHA-256 hashes (`SEC-001`).
- **Strict Content Security**: Enforced Content Security Policy (CSP), anti-clickjacking (`X-Frame-Options: DENY`), and anti-MIME sniffing headers (`X-Content-Type-Options: nosniff`).
- For complete audit reports, see [SECURITY.md](SECURITY.md) and [docs/security/AUDIT_LOG.md](docs/security/AUDIT_LOG.md).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.