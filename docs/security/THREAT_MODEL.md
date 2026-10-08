# HIREFLOW AI — THREAT MODEL & ARCHITECTURE INVENTORY

**System**: HireFlow AI (Multi-tenant AI-assisted hiring platform)  
**Version**: 0.0.0 (Vite Single Page Application)  
**Audit Scope**: Repository codebase and local development/preview runtime  
**Date**: 2026-10-09  

---

## 1. Technical Stack Inventory

- **Frontend Framework**: React 19 (`react`, `react-dom` v19.3.0) with TypeScript (~6.0.2).
- **Build System & Bundler**: Vite 8.3.0 (`@vitejs/plugin-react` v6.1.1, `@tailwindcss/vite` v4.3.3, Tailwind CSS v4.3.3).
- **Client Routing**: React Router v7.18.4 (`react-router-dom`).
- **State Management**: Zustand v5.0.15 with client `localStorage` and `sessionStorage` persistence.
- **Parsing Libraries**:
  - PDF: `pdfjs-dist` v6.4.299 (in-browser canvas/text extraction).
  - DOCX: `mammoth` v1.13.0 (in-browser arrayBuffer to text conversion).
- **Validation**: Zod v4.6.5.
- **Data Visualization**: Recharts v3.10.1, Lucide React v1.47.0.
- **Testing Framework**: Vitest v5.0.3 (`vitest run`).
- **Runtime Environment**: Node.js v20/v22 on Windows x64.
- **Deployment / Hosting Target**: Static SPA deployment. No existing `vercel.json`, `netlify.toml`, `_headers`, `Dockerfile`, or `firebase.json` was detected. A `public/_headers` configuration is required for production security headers.

---

## 2. Server & Backend Analysis

- **Dedicated Backend**: NONE. There is no external production backend server (Express, Fastify, Django, Spring, Supabase, Firebase, or PostgreSQL/MySQL).
- **Development Server API Middleware**:
  - Located in `vite.config.ts` (`atsApiPlugin` middleware).
  - Intercepts `POST /api/ats/analyze` during `npm run dev`.
  - Reads `GEMINI_API_KEY` and `GEMINI_MODEL` from development environment via `loadEnv('development', process.cwd(), '')` or `process.env`.
  - Proxies analysis requests to Google Generative Language API (`https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`).
  - If no `GEMINI_API_KEY` is configured, gracefully falls back to deterministic local analysis.
- **Client Fallback AI Calls**:
  - `src/lib/ats/index.ts` lines 234–265 contains a fallback path that attempts a direct browser `fetch()` to `generativelanguage.googleapis.com` if a user provides an API key in the UI.
- **Database / Storage**: All application data is stored in memory via Zustand stores (`src/store/useStore.ts`) and cached in browser `localStorage` and `sessionStorage`.

---

## 3. Input Attack Surface

| Entry Point | Location | Data Type | Validation & Risk |
|---|---|---|---|
| **Resume Upload** | ATS Roaster & Tailor (`AtsInputSection.tsx`, `fileParser.ts`) | `.pdf`, `.docx`, `.txt` | File size caps, magic byte verification, decompression bombs in DOCX zip entries, PDF.js script execution. |
| **Pasted Resume Text** | ATS Roaster, Tailor, JD Compare, TalentLens | Plain text (up to hundreds of KB) | ReDoS via complex regexes, hidden text, indirect prompt injection, keyword stuffing, zero-width / bidi Unicode. |
| **Pasted JD Text** | ATS Roaster, Compare JDs, Tailor | Plain text | ReDoS, indirect prompt injection, HTML injection. |
| **Route Parameters** | `/company/:id`, `/jobs/:id`, `/candidates/:id` | String IDs | Unsanitized rendering in DOM, prototype pollution in route state. |
| **Share Link Hash** | `src/features/suite/share/cardCodec.ts` | URL hash fragment (base64 / compressed) | Decompression bombs, prototype pollution upon decoding JSON objects. |
| **Form Inputs** | Auth, Job Creation, Candidate Review, Outreach | Text inputs | Stored XSS if rendered unescaped, formula injection in exportable fields. |
| **Browser Storage** | `localStorage` (`hireflow_*`, `pw_*`) | JSON strings | Plaintext credential leakage, unsanitized JSON parsing. |

---

## 4. Egress & Data Outflow Surface

- **Network Calls**:
  - Same-origin `POST /api/ats/analyze` (dev server proxy only).
  - Optional `POST https://generativelanguage.googleapis.com` (if user enters key).
  - Fonts / CDN assets: None hard-coded in index.html (uses system fonts and bundled packages).
- **Exports & Downloads**:
  - Resume bullet exports, tailored resume markdown/text downloads.
  - CSV candidate data exports (potential formula injection risk `=cmd\|...`).
  - Outreach email / connection message clipboard copy.
- **Logging**:
  - `console.debug`, `console.log`, `console.error` throughout source.
  - Must ensure candidate PII, raw resumes, and API tokens are never logged.

---

## 5. AI / LLM Threat Surface

- **Primary Engine**: Deterministic TypeScript ATS Engine (`src/lib/ats/`, `src/features/ats/engine/`).
  - Rules-based parser, skills taxonomy (`skills-taxonomy.json`), scoring aggregator, and invariant enforcer (`invariants.ts`).
  - Attack vectors: Keyword stuffing, hidden Unicode, ReDoS, score gaming.
- **Secondary / Optional Engine**: Google Gemini Flash via dev proxy.
  - Attack vectors: Direct prompt injection, delimiter breaking, jailbreaking, score inflation, system prompt extraction, SSRF / key exfiltration.
  - Mitigations: Strict output schema enforcement, invariant checks overriding AI, server-side-only key storage.

---

## 6. Assets & Threat Boundaries

### Assets
1. **Candidate PII**: Names, emails, phones, compensation, work history, resume files.
2. **API Keys**: Google Gemini API key (`GEMINI_API_KEY`).
3. **Application State**: In-browser session state, role flags, candidate assessments.
4. **Scoring Integrity**: ATS simulation accuracy, invariant truthfulness (zero hallucinations).

### Threat Actors & Boundaries
- **Adversarial Candidate**: Submits malicious files or crafted prompt injections to artificially inflate ATS score or exploit recruiter view.
- **Curious Browser User**: Inspects client bundle / DevTools to extract secrets, bypass client route guards, or manipulate client state.
- **Supply-Chain Attacker**: Attempts compromise via npm dependencies.
- **Git Repository Inspector**: Searches commit history for leaked developer credentials or configuration files.
