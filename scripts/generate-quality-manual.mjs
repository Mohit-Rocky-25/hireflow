import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const downloadsDir = 'C:\\Users\\yadav\\Downloads';

// Target file names
const manualPdfName = 'HIREFLOW_COMPLETE_QUALITY_ENGINE_MANUAL.pdf';
const manualTxtName = 'HIREFLOW_COMPLETE_QUALITY_ENGINE_MANUAL.txt';
const briefPdfName = 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.pdf';
const briefTxtName = 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.txt';
const briefZipName = 'HIREFLOW_COMPLETE_CONTEXT_BRIEF.zip';

const manualPdfTarget = path.join(downloadsDir, manualPdfName);
const manualTxtTarget = path.join(downloadsDir, manualTxtName);
const briefPdfTarget = path.join(downloadsDir, briefPdfName);
const briefTxtTarget = path.join(downloadsDir, briefTxtName);
const briefZipTarget = path.join(downloadsDir, briefZipName);

const localDocsManualPdf = path.join(rootDir, 'docs', manualPdfName);
const localDocsManualTxt = path.join(rootDir, 'docs', manualTxtName);
const localDocsBriefPdf = path.join(rootDir, 'docs', briefPdfName);
const localDocsBriefTxt = path.join(rootDir, 'docs', briefTxtName);
const tempHtmlPath = path.join(rootDir, 'docs', 'temp_quality_manual.html');

console.log('Generating HireFlow Complete Quality Engine & Subsections Manual...');

// Read sample briefs to include real data
const briefsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/suite/project-briefs.json'), 'utf8'));
const sampleBrief = briefsData[0]; // Bayesian A/B Experimentation Engine

const manualText = `================================================================================
HIREFLOW AI — COMPLETE QUALITY ENGINE, SUBSECTIONS & ARCHITECTURE MANUAL
The Comprehensive Technical Guide to All Subsections, UI/UX Layouts, Project Briefs,
and Quality Calibration Engines (For System Designers, Developers & Evaluators)
Version: 4.0.0 • Candidate Career Decision Suite • Production Engineering Edition
Generated: ${new Date().toISOString()}
Author: Mohit-Rocky-25 <yadavmohit12243@gmail.com>
================================================================================

================================================================================
TABLE OF CONTENTS
================================================================================
CHAPTER 1: SYSTEM ARCHITECTURE & UI/UX DESIGN SYSTEM
   1.1 The Visual Language, Dark Ambient Canvas & Design Tokens
   1.2 Global Component Hierarchy & Persistent Navigation
   1.3 Responsive Layout Standards (Desktop, Tablet, 360x800 & 390x844 Mobile)
   1.4 Micro-Interactions, Drawers, Modals & Focus Management

CHAPTER 2: COMPREHENSIVE SUBSECTION-BY-SUBSECTION UI/UX BREAKDOWN
   2.1 ATS Resume Roaster & Character-Span Annotator (/tools/resume-roaster)
   2.2 Dual-Role Job Description Comparison Engine (/tools/jd-compare)
   2.3 Handmade Resume Tailor & Studio Canvas (/tools/tailor)
   2.4 Project Build Briefs & Set-Cover Bundler (/tools/build-briefs)
   2.5 Credential & Opportunity Engine (/tools/credential-engine)
   2.6 Career Trajectory Hub & What-If Simulator (/tools/career-path)
   2.7 TalentLens Market Intelligence & Saved Roles (/tools/talentlens)
   2.8 Grounded Outreach Generator & Cold Email Analyzer (/tools/reach-out)
   2.9 Unified Candidate Profile & Scan History Timeline (/history, /data)
   2.10 Saved Job Description Library & Market Demand Aggregator (/jd-library)
   2.11 Scoring Methodology & Diagnostic Reporter (/methodology)
   2.12 Data Portability, Storage Quotas & Hard Reset (/data)

CHAPTER 3: PROJECT BUILD BRIEFS ARCHITECTURE, SCHEMA & QUALITY RUBRIC
   3.1 The 15-Field Project Brief Anatomy
   3.2 Domain Taxonomy (14 Technical Specializations)
   3.3 The 4 Quality Sentinels of a Production Brief
   3.4 Greedy Set-Cover Project Bundler Algorithm (bundleBriefs.ts)
   3.5 In-Browser JSZip Scaffold Generator (scaffoldGenerator.ts)
   3.6 Resume Ledger Injection with [METRIC] Placeholders
   3.7 Developer Protocol: How to Add, Edit, or Verify Project Briefs

CHAPTER 4: THE COMPLETE QUALITY & SCORING ENGINES
   4.1 ATS Ingestion & Layout Quality Engine (src/engine/ingestion/)
   4.2 Calibrated 4-Pillar Scoring Engine (src/engine/roaster/, src/config/scoring.ts)
   4.3 Semantic Matcher, Alias Graph & Taxonomy Engine (src/engine/matching/)
   4.4 Truth Gate & Anti-Hallucination Honesty Engine (src/engine/tailor/truthGate.ts)
   4.5 Pre-Export Formatting Quality Sentinel (src/lib/tailor/export/formattingChecker.ts)
   4.6 What-If Readiness Delta & Campus Corporate Cutoff Engine
   4.7 Subject Line Effectiveness & Cold Outreach Quality Meter

CHAPTER 5: DATA MODELS, STORAGE ADAPTER & ZOD SCHEMAS
   5.1 Store Architecture & Storage Key Prefixes
   5.2 Application Capacity Limits (src/config/limits.ts)
   5.3 Corrupt Quarantine Workflow (_corrupt)
   5.4 Strict Zod Schemas (src/types/schemas-v4.ts)
   5.5 Tamper-Evident Backup Export/Import & SHA-256 Integrity Verification

CHAPTER 6: DEVELOPER'S EXTENSION BLUEPRINT ("IN ORDER TO MAKE CHANGES")
   6.1 Modifying UI Components, Subsections & Layouts
   6.2 Updating or Adding Project Briefs in project-briefs.json
   6.3 Calibrating Scoring Weights, Pillars & Thresholds
   6.4 Modifying Datasets, Role Presets & Credentials
   6.5 Running the 106-Suite Automated Quality Gate

================================================================================
CHAPTER 1: SYSTEM ARCHITECTURE & UI/UX DESIGN SYSTEM
================================================================================

1.1 THE VISUAL LANGUAGE, DARK AMBIENT CANVAS & DESIGN TOKENS
HireFlow v4 employs a tailored dark canvas designed for high-density technical work.
The visual system avoids generic black backgrounds, utilizing a deeply layered
slate/neutral palette with subtle ambient radial gradients:

• Canvas Background: #020617 (slate-950) and #0a0a0a (neutral-950)
• Ambient Glows: Top-centered radial gradients (e.g. from-blue-600/15 via-violet-600/10 to-emerald-600/15 blur-3xl)
• Card Surfaces: #0f172a / #171717 with 1px border highlights (border-neutral-800 or border-border/80)
• Surface Elevation: Glassmorphism backdrops using backdrop-blur-md and bg-surface/70
• Typography:
  - System sans-serif font stack prioritizing native rendering speed
  - Clear hierarchy: Bold/Black display titles (text-xl to text-3xl font-black)
  - Monospace font stack (font-mono) for code tokens, formulas, and metric tags
• Color Accents & Status Pairings:
  - Blue / Sky: Information, Primary actions, Navigation accents (#0284c7 / #38bdf8)
  - Emerald / Green: Verified credentials, High evidence, L3 outcomes, Strong verbs (#059669 / #10b981)
  - Amber / Yellow: Needs-recheck status, Medium priority, Run-on sentences (#d97706 / #f59e0b)
  - Red / Rose: Weak verbs, Unverified claims, Dangerous formatting, Gaps (#dc2626 / #ef4444)
  - Violet / Purple: GenAI, Machine Learning, Deep Trajectory tools (#7c3aed / #a855f7)

1.2 GLOBAL COMPONENT HIERARCHY & PERSISTENT NAVIGATION
Every view in HireFlow follows a predictable, accessible layout structure:

[1] TOP NAVIGATION (PublicNavbar or PageNav):
    - Logo with version badge ("v4.0.0")
    - Quick route links: Tools Hub, History, Methodology, Settings
    - Profile Resume Chip: "Using: <active resume label> (change)"
    - Offline Indicator Badge: Automatically shows when network drops

[2] HERO & CONTROL SECTION:
    - Tool Title with uppercase domain badge
    - Concise 1-sentence purpose statement
    - Primary action controls, view toggles, and filter pills

[3] MAIN INTERACTION CANVAS (Split or Stacked):
    - Desktop: Typically 2-column or 12-column responsive grid (e.g. 7-col editor, 5-col live preview)
    - Mobile: Segmented control switching between Editor and Preview canvas

[4] INTERACTIVE SIDE-OVER & BOTTOM-SHEET DRAWERS:
    - Drawer.tsx: Slide-over on desktop (w-96 to w-[480px]), bottom sheet on mobile (h-[85vh])
    - ExplainDrawer.tsx: Triggered by any (i) icon next to a derived score
    - Span Detail Drawer: Triggered by clicking any highlighted resume token

[5] GLOBAL OVERLAYS:
    - LocalhostNavigator.tsx (Ctrl+/): Fast jump palette to all 14 tools and views
    - PwaUpdateToast.tsx: Non-intrusive notification when a new service worker builds

1.3 RESPONSIVE LAYOUT STANDARDS (DESKTOP TO 360px MOBILE)
Strictly validated against 360x800, 390x844, and 768x1024 viewports:
• Zero Horizontal Page Overflow: document.body.scrollWidth === window.innerWidth
• Minimum Touch Target Size: Every interactive button or icon is >= 44x44px
• Mobile Bottom-Sheet Behavior: Slide-over panels adapt to swipeable bottom sheets
• Horizontal Scroll Wrappers: Tables and skill tag clouds wrap or scroll with visual fades

================================================================================
CHAPTER 2: COMPREHENSIVE SUBSECTION-BY-SUBSECTION UI/UX BREAKDOWN
================================================================================

2.1 ATS RESUME ROASTER & CHARACTER-SPAN ANNOTATOR (/tools/resume-roaster)
The primary diagnostic tool for resume evidence depth.

SUBSECTION LAYOUT:
[A] Header & Score Gauge:
    - Large circular or radial ATS Score gauge (0-100)
    - Calibrated 4-pillar badges: Hard Skills (/40), Evidence (/25), Fresher (/20), Format (/15)
    - Target role match indicator and calibrated grade (e.g. "Competitive - Top 15%")
    - "How is this calculated?" (i) trigger opening ExplainDrawer

[B] View Mode Switcher:
    - Segmented control offering 3 distinct view modes:
      1. Annotated View: Character-by-character color-highlighted resume text
      2. Clean View: Formatted typography view with highlighted bullet scores
      3. Raw View: Raw ingested text stream revealing hidden parsing glitches

[C] Character-Span Annotations (D16):
    - Evaluates exact character indices (start, end) without DOM mutations:
      • RED: Weak verbs ("helped", "assisted", "worked on", "handled")
      • AMBER: Run-on bullets (>35 words), passive voice, missing metric proof
      • GREEN: Evidenced technical skills, verified metric patterns (%, ms, QPS)
    - Clicking any highlight opens the Span Drawer:
      - Rationale explaining screener reaction
      - Live replacement suggestion
      - One-click "Apply Rewrite" button that patches the resume text in-place

[D] Tabbed Analysis Deck (TabBar.tsx):
    - Tab 1: Overview — Pillar breakdown, seniority signals, contact details
    - Tab 2: Skills — Matched vs missing hard skills, transferable skills
    - Tab 3: Fix These First — Prioritized high-impact fixes ordered by score delta
    - Tab 4: Learning Path — Curated roadmaps to close identified skill gaps
    - Tab 5: Annotated View — Direct character-span inspection view

[E] Local Finding Feedback Widget (B8):
    - Thumbs up/down on individual findings with optional note dialog
    - Stored locally in feedbackStore (cap: 500); invariant: zero scoring mutation

--------------------------------------------------------------------------------
2.2 DUAL-ROLE JOB DESCRIPTION COMPARISON ENGINE (/tools/jd-compare)
Evaluates a candidate resume against two target JDs simultaneously.

SUBSECTION LAYOUT:
[A] Dual Input Panel:
    - Left Column: Target Role A (Paste text or select Role Preset)
    - Right Column: Target Role B (Paste text or select Role Preset)
    - Preset Selector: One-click selection from 7 canonical fresher archetypes

[B] Semantic Overlap Breakdown:
    - Overlap percentage calculation
    - Shared Technical Skills (intersection)
    - Role A Unique Requirements vs Role B Unique Requirements
    - Requirement weight classification (Mandatory, Preferred, Mentioned)

[C] Visual Radar Score:
    - Comparative radar chart comparing candidate coverage against Role A vs Role B

[D] Deterministic Gap Derivation (A1):
    - Automatically derives missing skills and populates the global Gap List
    - Marks gaps as "Open" until candidate re-scans a resume containing proof

--------------------------------------------------------------------------------
2.3 HANDMADE RESUME TAILOR & STUDIO CANVAS (/tools/tailor)
Studio editor featuring 2-column subsection cards and a live A4 paper canvas.

SUBSECTION LAYOUT:
[A] Left Column: Handmade Resume Editor (HandmadeResumeEditor.tsx):
    - Filter Pills: All, Experience, Projects, Skills, Education, Summary, Requirements
    - Live Requirement Mapping Card:
      - Displays target JD requirements alongside matched resume bullets
      - Direct indicators showing L0, L1, L2, L3 evidence levels
    - Subsection Cards (Draggable & Collapsible):
      - Header & Contact: Name, email, phone, GitHub, LinkedIn, portfolio
      - Professional Summary: Google XYZ elevation with active character count
      - Experience / Internships: Role, company, duration, location, bullet editor
      - Projects: Title, tech stack, live demo URL, architecture bullets
      - Technical Skills: Grouped by category (Languages, Frameworks, Cloud, Databases)
      - Education: Degree, branch, CGPA, graduation year
    - In-Place Bullet Elevation:
      - "Elevate Bullet" button transforms weak bullets into STAR / Google XYZ format
      - Generates bullet rewrite suggestions with [METRIC] placeholders

[B] Right Column: Live Paper Canvas (DarkPaperPreview.tsx):
    - True A4 aspect-ratio paper preview with zoom controls
    - Live synchronization: Any edit in the left column updates the canvas instantly
    - 1-Page Overflow Sentinel:
      - Real-time page height measurement
      - Visual warning badge if content spills onto page 2
      - "Auto-Fit One Page" button: Intelligently adjusts line height, padding,
        and font size within safe bounds (10pt minimum) to ensure 1-page fit

[C] Pre-Export Formatting Quality Sentinel (D15):
    - Triggered before PDF / DOCX download:
      - Broken Unicode glyph scanner (detects squares, , replacement glyphs)
      - Widow/Orphan line detector (flags trailing lines with < 3 words)
      - Heading isolation check (prevents section headers detached from content)

--------------------------------------------------------------------------------
2.4 PROJECT BUILD BRIEFS & SET-COVER BUNDLER (/tools/build-briefs)
Production project specifications engineered for portfolio proof.

SUBSECTION LAYOUT:
[A] Filter & Search Deck:
    - Domain Category Pills: 14 domains with distinctive color tokens
    - Difficulty Toggles: Beginner, Intermediate, Advanced
    - Estimated Hours Range Filter (e.g. 15-30h, 30-50h, 50h+)
    - "For Your Gaps" Toggle: Filter briefs that directly resolve open profile gaps

[B] Greedy Set-Cover Recommendations Tray:
    - When open gaps exist, calculates the minimum combination of projects
      covering all missing skills using the greedy set-cover algorithm
    - Displays total hours required and consolidated skills covered

[C] Project Brief Cards:
    - Title, Domain, Estimated Hours, Difficulty Badge
    - Problem Statement preview
    - Key Tech Stack badges
    - "Open Full Brief" button and bookmark toggle

[D] Detail Modal (BriefDetailModal):
    - Displays all 10 deep sections (Problem Statement, Use Cases, Architecture,
      Scale Targets, Verification Rubric, Resume Bullet Formula)
    - "Download Brief (.txt)" and "Copy to Clipboard" buttons
    - "Download Starter Scaffold (.zip)" button: Triggers client-side JSZip generator
    - "Mark Completed & Inject to Resume" button: Adds project to resume ledger

--------------------------------------------------------------------------------
2.5 CREDENTIAL & OPPORTUNITY ENGINE (/tools/credential-engine)
Evidence builder covering national exams, cloud certifications, and hackathons.

SUBSECTION LAYOUT:
[A] Category Subsections:
    - Certifications Tab: Verified cloud & software certifications
    - Events Tab: Hackathons, coding contests, CTFs, AI challenges
    - Open Source Tab: Fellowships, mentorships (GSoC, LFX, MLH)
    - Opportunity Plan Tab: Saved targets, deadlines, milestone tracker

[B] Opportunity Detail Modal:
    - Overview, Syllabus, Eligibility Rules, Student Fee Waiver guide
    - Provenance badge: "Verified", "Needs-Recheck", "Unverified"
    - Last verified timestamp and source URL

[C] RFC 5545 iCalendar Generator (.ics) (D18):
    - Generates calendar file with verified application deadlines and exam dates

[D] National Exam Eligibility Evaluator:
    - Evaluates eligibility rules for GATE, ISRO ICRB, AWS SAA, CDAC

--------------------------------------------------------------------------------
2.6 CAREER TRAJECTORY HUB & WHAT-IF SIMULATOR (/tools/career-path)
Exploration of Indian IT and global tech leveling tracks.

SUBSECTION LAYOUT:
[A] Career Explorer Subsections:
    - Company Tracks: IT Services (TCS/Infosys), Unicorns, GCCs, Big Tech India
    - Equivalent Levels: Cross-company ladder equivalence mapping
    - CTC Salary Visualizer: Transparent base vs variable vs stock breakdowns

[B] What-If Scenario Simulator (D20):
    - Live Sliders: CGPA (5.0 to 10.0), College Tier (1, 2, 3), Branch, Internships
    - Campus Corporate Cutoff Gates:
      - Visual boundary flags (e.g. "Cutoff: 7.0 CGPA for Tier-1 Tech")
      - Reveals eligibility changes in real time without fake probabilities

--------------------------------------------------------------------------------
2.7 TALENTLENS MARKET INTELLIGENCE & SAVED ROLES (/tools/talentlens)
Role requirements library and candidate bridge.

SUBSECTION LAYOUT:
[A] Role Catalog & Search:
    - Filters by company type, experience tier, and technology family
    - Deep requirements breakdown: Mandatory vs Preferred vs Mentioned

[B] Saved Roles Tray (D19):
    - Local storage persistence for up to 50 bookmarked roles
    - "Send to JD Compare" button: Pre-populates JD Compare with one click

--------------------------------------------------------------------------------
2.8 GROUNDED OUTREACH GENERATOR & COLD EMAIL ANALYZER (/tools/reach-out)
Recruiter outreach generator adhering to strict ground-truth constraints.

SUBSECTION LAYOUT:
[A] Message Archetype Selectors:
    - Cold Outreach (Engineering Manager, Recruiter, Senior Peer)
    - Day 3 Follow-Up
    - Day 7 Follow-Up
    - Post-Interview Thank You

[B] Grounded Message Generator:
    - Synthesizes messages using candidate resume facts
    - Inserts explicit [FILL_IN] placeholders for company-specific details
    - Zero hallucinated achievements

[C] Subject Line Effectiveness Meter:
    - Evaluates subject line length, personalization, urgency, and spam triggers

--------------------------------------------------------------------------------
2.9 UNIFIED CANDIDATE PROFILE & SCAN HISTORY (/history, /data)
Persistent candidate state across all tools.

SUBSECTION LAYOUT:
[A] Multi-Version Resume Slots:
    - Up to 5 labeled versions (e.g. "Default", "Backend SDE", "Full Stack")
    - One-click active resume swap

[B] Scan History Progression Chart:
    - Logs up to 60 scans automatically
    - Recharts line graph showing ATS Score and Evidence Depth progression over time
    - Side-by-side comparator displaying score deltas between any two historical scans
    - Configuration fingerprint warning if scoring weights differed between scans

--------------------------------------------------------------------------------
2.10 SAVED JOB DESCRIPTION LIBRARY (/jd-library)
Curated personal repository of target opportunities.

SUBSECTION LAYOUT:
[A] Saved JDs Grid:
    - Up to 40 saved JDs with tags and dates
    - Automatic deduplication via SHA-256 hashText()

[B] Cross-JD Market Demand Aggregator:
    - Aggregates demanded skills across all saved JDs (threshold: >= 3 JDs)
    - Displays frequency count and demand weight

--------------------------------------------------------------------------------
2.11 SCORING METHODOLOGY & DIAGNOSTIC REPORTER (/methodology)
Transparent algorithmic documentation.

SUBSECTION LAYOUT:
[A] Live Configuration Inspector:
    - Displays live weights from scoring.ts and limits.ts
    - Data provenance table with audit timestamps

[B] Sanitized Diagnostic Generator:
    - Generates PII-free JSON report containing score components and token counts
    - Safe to share for bug reports or engine tuning

--------------------------------------------------------------------------------
2.12 DATA PORTABILITY, STORAGE QUOTAS & RESET (/data)
Candidate data management and safety controls.

SUBSECTION LAYOUT:
[A] Storage Usage Gauges:
    - Live item counts across all 6 local stores

[B] Export / Import Data:
    - Downloads tamper-evident hireflow-backup-YYYY-MM-DD.json with checksum
    - Import validates Zod schemas and checksum with Merge/Replace modes

[C] Typed Deletion Guard:
    - Requires typing "DELETE" into ConfirmDialog to execute hard storage wipe

================================================================================
CHAPTER 3: PROJECT BUILD BRIEFS ARCHITECTURE, SCHEMA & QUALITY RUBRIC
================================================================================

3.1 THE 15-FIELD PROJECT BRIEF ANATOMY
Every project brief in src/data/suite/project-briefs.json adheres to a strict schema:

1.  id                      (string): Unique kebab-case slug (e.g. "brief-ab-experimentation")
2.  title                   (string): Production-grade system title
3.  domain                  (string): One of 14 canonical technical domains
4.  estimatedHours          (number): Defensible, realistic time to complete
5.  difficulty              (enum)  : "beginner" | "intermediate" | "advanced"
6.  coveredSkills           (array) : List of skills demonstrated by the project
7.  problemStatement        (string): Industry pain point the system addresses
8.  useCases                (string): Real-world business scenarios where this is deployed
9.  problemItSolves         (string): Why this problem is technically difficult
10. recruiterSignal         (string): Explicit competencies demonstrated to an engineering screener
11. architecture            (string): Components, data flow, failure modes, storage layer
12. scaleTargets            (string): Throughput (QPS), latency (p99), memory, and data size targets
13. techStack               (array) : Languages, frameworks, databases, and tooling
14. verificationRubric      (array) : Concrete verification checklist for screeners
15. portfolioBulletFormula  (string): Exact STAR/Google XYZ resume bullet with metrics

3.2 DOMAIN TAXONOMY (14 TECHNICAL SPECIALIZATIONS)
1.  Distributed Systems          (Blue)    : Consensus, caching, rate limiting, queuing
2.  Full-Stack Web               (Emerald) : React, Node, WebSockets, SSR, GraphQL
3.  Data Engineering             (Amber)   : ETL pipelines, Spark, Kafka, Parquet, OLAP
4.  AI/ML Applications           (Purple)  : Embeddings, vector search, RAG, inference
5.  GenAI & LLM Engineering      (Violet)  : Fine-tuning, agents, prompt evaluations
6.  ML Engineering               (Pink)    : Feature stores, model serving, drift monitoring
7.  Platform & DevOps            (Cyan)    : Kubernetes, Terraform, CI/CD, observability
8.  Security & Platform          (Red)     : OAuth2, mTLS, zero trust, secret management
9.  FinTech Engineering          (Green)   : Ledgers, double-entry accounting, reconciliations
10. Systems Programming          (Orange)  : Rust/C++, memory management, network protocols
11. Mobile Engineering           (Teal)    : Offline-first sync, SQLite, push notifications
12. Blockchain & Web3            (Yellow)  : Smart contracts, EVM, verifiable credentials
13. Computer Science Fundamentals(Indigo)  : Compilers, virtual machines, operating systems
14. Algorithms & Applied Math    (Rose)    : Bayesian inference, graph algorithms, optimization

3.3 THE 4 QUALITY SENTINELS OF A PRODUCTION BRIEF
A brief is rejected if it fails any of these 4 quality sentinels:
[Sentinel 1: No Invented Facts]
  Zero fabricated salaries, unrealistic claims, or fake benchmarks.
  Every tool named must be an active, real-world open-source or industry technology.

[Sentinel 2: Defensible Scale Targets]
  Scale targets must be achievable on a developer laptop or free-tier cloud account.
  (e.g. "1,000 requests/sec with p99 < 15ms using Redis on localhost", NOT "100M QPS").

[Sentinel 3: Concrete Verification Rubric]
  Screener rubrics must contain reproducible tests:
  (e.g. "Run \`k6 run loadtest.js\` to verify 1,000 QPS with zero 5xx responses").

[Sentinel 4: Google XYZ Resume Bullet Formula]
  Resume bullet formulas must follow the pattern:
  "Accomplished [X], as measured by [Y], by doing [Z]"
  (e.g. "Engineered sequential Bayesian A/B test evaluator in FastAPI, reducing sample exposure time by 38% while bounding false discovery rates via posterior probability stopping rules").

3.4 GREEDY SET-COVER PROJECT BUNDLER ALGORITHM (bundleBriefs.ts)
When candidate has open skill gaps U = {s1, s2, ..., sn}:
• Objective: Find subset of briefs B ⊆ ALL_PROJECT_BRIEFS that covers U with minimal total hours.
• Algorithm:
  1. Let RemainingGaps = U.
  2. While RemainingGaps is not empty and available briefs remain:
     a. For each brief b, calculate MarginalCoverage(b) = |b.coveredSkills ∩ RemainingGaps|.
     b. Compute Efficiency(b) = MarginalCoverage(b) / b.estimatedHours.
     c. Select brief b* that maximizes Efficiency(b*).
     d. Add b* to Bundle.
     e. RemainingGaps = RemainingGaps \ b*.coveredSkills.
  3. Return Bundle sorted by priority.

3.5 IN-BROWSER JSZIP SCAFFOLD GENERATOR (scaffoldGenerator.ts)
Generates starter code without any server-side dependencies:
• Generates ZIP containing:
  - README.md: Title, architecture overview, scale targets, verification rubric
  - docs/architecture.mmd: Renderable Mermaid system diagram
  - package.json / requirements.txt: Pre-configured dependencies
  - src/index.ts or app.py: Clean starter scaffolding with TODO markers
  - tests/verification.test.ts: Pre-written test cases validating the rubric

3.6 RESUME LEDGER INJECTION
When user clicks "Mark Completed & Inject to Resume":
• Formats the brief's portfolioBulletFormula into a structured project block.
• Inserts explicit [METRIC] placeholders for the candidate to fill in verified numbers.
• Injects directly into active resume draft in profileStore and tailorStore.

3.7 DEVELOPER PROTOCOL: HOW TO ADD OR EDIT PROJECT BRIEFS
1. Open src/data/suite/project-briefs.json.
2. Create new object conforming to the 15-field schema.
3. Validate unique id (must not collide with existing 83 IDs).
4. Run validation test: npx vitest run src/data/__tests__/validateData.test.ts.

================================================================================
CHAPTER 4: THE COMPLETE QUALITY & SCORING ENGINES
================================================================================

4.1 ATS INGESTION & LAYOUT QUALITY ENGINE (src/engine/ingestion/)
Multi-format document ingestion pipeline:
• Multi-Format Parsers (fileParser.ts):
  - PDF: Handled via dynamic import of pdfjs-dist; extracts text coordinates, fonts.
  - DOCX: Handled via dynamic import of mammoth; converts styles to clean text streams.
  - TXT / Markdown: Normalized UTF-8 decoding.
• Section Segmenter (sectionSegmenter.ts):
  - Detects 12 standard resume section headings via regex pattern matching
  - Identifies Experience, Projects, Education, Skills, Certifications, Summary
• Layout Reader (layoutReader.ts):
  - Evaluates bounding boxes to detect multi-column layouts
  - Reassembles natural reading order: prevents left/right column text interleaving
• Entity Extractor (entityExtractor.ts):
  - Extracts contact information: email, phone, LinkedIn, GitHub, portfolio URLs
  - Extracts GPA/CGPA and degree metadata

4.2 CALIBRATED 4-PILLAR SCORING ENGINE (src/engine/roaster/, src/config/scoring.ts)
The definitive ATS evaluator calibrated to the Indian fresher hiring market:

PILLAR 1: HARD SKILLS COVERAGE (40% Weight)
  Formula: HardSkillsScore = (EvidencedSkills / TargetSkills) * 100
  Evaluates candidate skills against target role taxonomy.

PILLAR 2: EVIDENCE QUALITY & DEPTH (25% Weight)
  Formula: EvidenceScore = (∑ BulletLevelMultipliers) / TotalBullets * 100
  Levels:
  - L3 (Measured Outcome): 1.00 — Contains digits, metrics, and outcomes
  - L2 (Internship/Work): 0.85 — Work experience bullet with context
  - L1 (Project Bullet): 0.65 — Academic or personal project bullet
  - L0 (Listed Skill): 0.35 — Skill mentioned only in skills list

PILLAR 3: FRESHER READINESS (20% Weight)
  Formula: FresherScore = ProjectPoints (40) + DegreePoints (25) + GitHubPoints (20) + CSTheory (15)
  Rewards concrete project evidence over unverified claims.

PILLAR 4: FORMAT SAFETY (15% Weight)
  Evaluates ATS parsing risks:
  - Multi-column penalty: -15 pts
  - Broken glyphs / symbols: -10 pts
  - Missing section headings: -10 pts
  - Tables detected: -15 pts

OVERALL ATS SCORE:
  OverallATS = (HardSkills * 0.40) + (Evidence * 0.25) + (Fresher * 0.20) + (Format * 0.15)
  Clamped to range [25, 100].

4.3 SEMANTIC MATCHER, ALIAS GRAPH & TAXONOMY ENGINE (src/engine/matching/)
Matches candidate capabilities against job descriptions:
• Alias Resolution:
  - Resolves abbreviations: "k8s" -> "Kubernetes", "aws" -> "Amazon Web Services", "postgres" -> "PostgreSQL"
• Context Classifier:
  - Classifies where a skill appears: Primary Tool, Secondary Environment, or Passing Mention
• Multiplier Matrix:
  - DIRECT MATCH: 1.00
  - TRANSFERABLE MATCH (e.g. PyTorch for TensorFlow): 0.70
  - PARTIAL MATCH (e.g. C++ for C): 0.40
  - MISSING: 0.00

4.4 TRUTH GATE & ANTI-HALLUCINATION HONESTY ENGINE (src/engine/tailor/truthGate.ts)
Guarantees that tailoring never fabricates resume content:
• Parity Audit: Compares tailored resume tokens against source resume tokens.
• Rules Enforced:
  - Project bullets cannot introduce new technologies not evidenced in source draft.
  - Metrics (percentages, counts) cannot be altered without candidate confirmation.
  - Stored in activeProject.evidenceMapping.

4.5 PRE-EXPORT FORMATTING QUALITY SENTINEL (src/lib/tailor/export/formattingChecker.ts)
Pre-export linter enforcing quality before file download:
• Broken Glyph Check: Scans for \\uFFFD, non-printable characters, unclosed brackets.
• Widow/Orphan Check: Flags bullet points ending with < 3 words on the final line.
• Length Overflow Check: Computes vertical line counts; warns if > 1 page.

4.6 WHAT-IF READINESS DELTA & CORPORATE CUTOFF ENGINE (src/features/career-path/whatIfSimulator.ts)
Evaluates Indian campus eligibility:
• Live sliders: CGPA, College Tier, Branch, Internships.
• Cutoff Matrix:
  - Tier-1 Product: 7.5+ CGPA, CS/IT preferred, 2+ projects, 1+ internship
  - GCCs (Global Capability Centers): 7.0+ CGPA, all branches considered
  - IT Services: 6.0+ CGPA, strict zero active backlogs
• Displays eligibility delta and exact prerequisite gaps.

4.7 SUBJECT LINE EFFECTIVENESS & OUTREACH QUALITY METER
Evaluates cold email outreach before sending:
• Word Count Check: Optimal range 5 to 9 words.
• Spam Trigger Scanner: Flags "URGENT", "FREE", "GUARANTEED", "100%", all-caps tokens.
• Personalization Density: Checks for [COMPANY_NAME] and role-specific hooks.

================================================================================
CHAPTER 5: DATA MODELS, STORAGE ADAPTER & ZOD SCHEMAS
================================================================================

5.1 STORE INVENTORY & STORAGE KEYS
All state is persisted in client localStorage with hireflow:v4: prefix:
• Profile:      hireflow:v4:profile       (ProfileStoreSchema)
• Scan History: hireflow:v4:scan_history  (ScanHistoryStoreSchema)
• Saved JDs:    hireflow:v4:saved_jds     (SavedJdStoreSchema)
• Saved Roles:  hireflow:v4:saved_roles   (SavedRoleStoreSchema)
• Feedback:     hireflow:v4:feedback      (FeedbackStoreSchema)
• Briefs:       hireflow:v4:brief_progress(BriefProgressStoreSchema)

5.2 APPLICATION CAPACITY LIMITS (src/config/limits.ts)
• maxScanHistory     : 60 scans (Ring buffer)
• maxSavedJDs        : 40 JDs
• maxSavedRoles      : 50 roles
• maxFeedbackItems   : 500 notes
• maxResumeVersions  : 5 versions
• maxBackupFileMB    : 10 MB
• maxFileUploadMB    : 5 MB
• maxPdfPages        : 6 pages

5.3 CORRUPT QUARANTINE WORKFLOW
If storage parsing fails:
1. Catches syntax or schema error.
2. Moves damaged value to hireflow:v4:<key>_corrupt.
3. Initializes clean default state.
4. Notifies user via toast; zero crash impact.

5.4 TAMPER-EVIDENT BACKUP FORMAT
Exported JSON contains:
- backupVersion: 1
- exportedAt: ISO timestamp
- engineVersion: "4.0.0"
- sections: { profile, scan_history, saved_jds, saved_roles, feedback, brief_progress }
- checksum: "fnv1a:<hash>"
Import verifies checksum; warns if modified.

================================================================================
CHAPTER 6: DEVELOPER'S EXTENSION BLUEPRINT ("IN ORDER TO MAKE CHANGES")
================================================================================

6.1 MODIFYING UI COMPONENTS, SUBSECTIONS & LAYOUTS
• Adding a new subsection to a tool:
  1. Open the tool page in src/features/suite/<tool>/ or src/pages/tools/.
  2. Implement the component under src/components/common/ or the tool's components/ directory.
  3. Ensure it uses design tokens (border-border/80, bg-surface/70, text-foreground).
  4. Ensure WCAG compliance: focus-visible:ring-2, min 44px touch targets.

6.2 UPDATING OR ADDING PROJECT BRIEFS
• Open src/data/suite/project-briefs.json.
• Add or edit the brief adhering to the 15-field schema.
• Run validation: npx vitest run src/data/__tests__/validateData.test.ts.

6.3 CALIBRATING SCORING WEIGHTS, PILLARS & THRESHOLDS
• Open src/config/scoring.ts to adjust pillar weights (ATS_PILLAR_WEIGHTS).
• Note: Changing weights automatically alters computeConfigFingerprint() in src/config/versions.ts,
  which alerts users on historical scan comparisons that scoring rules have changed.
• Document any changes in docs/metric-inventory.md and update src/types/explain.ts.

6.4 RUNNING THE QUALITY GATE BEFORE PUSHING
$ npm run typecheck
$ npm run privacy:check
$ npx vitest run
$ npm run build

================================================================================
END OF COMPLETE QUALITY ENGINE & SUBSECTIONS MANUAL • HIREFLOW AI v4.0.0
================================================================================
`;

// Save text version to Downloads and local docs
fs.writeFileSync(manualTxtTarget, manualText, 'utf8');
fs.writeFileSync(localDocsManualTxt, manualText, 'utf8');
fs.writeFileSync(briefTxtTarget, manualText, 'utf8');
fs.writeFileSync(localDocsBriefTxt, manualText, 'utf8');

console.log(`[TXT] Successfully generated:\n  - ${manualTxtTarget}\n  - ${briefTxtTarget}`);

// Build Rich HTML Template for PDF Rendering
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HireFlow AI — Complete Quality Engine, Subsections & Architecture Manual</title>
<style>
  @page {
    size: A4;
    margin: 1.4cm 1.1cm 1.4cm 1.1cm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8pt;
      color: #64748b;
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    line-height: 1.45;
    font-size: 9pt;
    margin: 0;
    padding: 0;
  }
  
  .header-box {
    background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 6px solid #38bdf8;
  }
  .header-box h1 {
    margin: 0 0 6px 0;
    font-size: 18pt;
    color: #38bdf8;
    letter-spacing: -0.5px;
  }
  .header-box p {
    margin: 0;
    color: #94a3b8;
    font-size: 9.5pt;
  }
  
  .badges {
    margin-top: 10px;
    display: flex;
    gap: 8px;
  }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .badge-primary { background: #0284c7; color: white; }
  .badge-success { background: #059669; color: white; }
  .badge-slate   { background: #334155; color: #f8fafc; }
  
  h2 {
    color: #0f172a;
    font-size: 13pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 3px;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }
  h3 {
    color: #1e293b;
    font-size: 10.5pt;
    margin-top: 14px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }
  h4 {
    color: #334155;
    font-size: 9.5pt;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }
  th, td {
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }
  th {
    background-color: #f1f5f9;
    font-weight: 600;
    color: #334155;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  
  .card {
    background: #f8fafc;
    border-left: 3px solid #0284c7;
    padding: 8px 12px;
    margin: 8px 0;
    border-radius: 0 4px 4px 0;
    page-break-inside: avoid;
  }
  .card-title {
    font-weight: bold;
    color: #0369a1;
    font-size: 8.5pt;
    margin-bottom: 2px;
  }
  
  code, pre {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7.5pt;
  }
  code {
    background: #f1f5f9;
    padding: 1.5px 3px;
    border-radius: 3px;
    color: #0f172a;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    line-height: 1.35;
    page-break-inside: avoid;
    margin: 8px 0;
  }
  
  ul, ol {
    margin: 4px 0;
    padding-left: 18px;
  }
  li {
    margin-bottom: 3px;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .span-red { background: #fee2e2; color: #991b1b; padding: 1px 3px; border-radius: 2px; font-weight: bold; }
  .span-amber { background: #fef3c7; color: #92400e; padding: 1px 3px; border-radius: 2px; font-weight: bold; }
  .span-green { background: #dcfce7; color: #166534; padding: 1px 3px; border-radius: 2px; font-weight: bold; }
</style>
</head>
<body>

<div class="header-box">
  <h1>HIREFLOW AI — QUALITY ENGINE & ARCHITECTURE MANUAL</h1>
  <p>The Comprehensive Technical Reference to All Subsections, UI/UX Layouts, Project Briefs & Calibration Engines</p>
  <div class="badges">
    <span class="badge badge-primary">Version 4.0.0</span>
    <span class="badge badge-success">106 Suites Passed (738 Tests)</span>
    <span class="badge badge-slate">Production Architecture Edition</span>
  </div>
</div>

<h2>Chapter 1: System Architecture & UI/UX Design System</h2>
<p>
  HireFlow v4 is engineered as an offline-capable, zero-egress candidate career decision and evidence platform. It operates 100% inside the browser with zero external telemetry, zero server-side state, and deterministic pure engines.
</p>

<h3>1.1 Dark Ambient Canvas & Design Tokens</h3>
<ul>
  <li><strong>Background Canvas</strong>: Deep slate/neutral tones (<code>#020617</code> and <code>#0a0a0a</code>) paired with subtle ambient radial gradients.</li>
  <li><strong>Glassmorphic Surfaces</strong>: <code>bg-surface/70</code> with <code>backdrop-blur-md</code> and <code>border-border/80</code> for tactile elevation.</li>
  <li><strong>Color Accent Tokens</strong>:
    <ul>
      <li><span style="color: #0284c7; font-weight: bold;">Sky / Blue (#0284c7)</span>: Primary action controls, active resume chips, and interactive navigation.</li>
      <li><span style="color: #059669; font-weight: bold;">Emerald / Green (#059669)</span>: High-quality evidence, verified credentials, and L3 measured outcomes.</li>
      <li><span style="color: #d97706; font-weight: bold;">Amber / Yellow (#d97706)</span>: Medium priority items, run-on sentences, and needs-recheck badges.</li>
      <li><span style="color: #dc2626; font-weight: bold;">Red / Rose (#dc2626)</span>: Weak action verbs, unverified claims, formatting dangers, and skill gaps.</li>
    </ul>
  </li>
  <li><strong>Typography</strong>: High-density system sans-serif hierarchy; monospace (<code>font-mono</code>) for metrics, code tokens, and math formulas.</li>
</ul>

<h3>1.2 Component Hierarchy & Persistent Navigation</h3>
<p>
  Every view in HireFlow follows a disciplined component tree:
</p>
<ul>
  <li><strong>PublicNavbar / PageNav</strong>: Sticky top navigation displaying logo, quick tool links, the global <code>ProfileResumeChip</code> ("Using: &lt;resume&gt; (change)"), and <code>OfflineIndicator</code>.</li>
  <li><strong>Tool Workspace</strong>: Structured into Hero Control Bar &rarr; Responsive Multi-Column Grid &rarr; Live Output Canvas.</li>
  <li><strong>Slide-Over & Bottom-Sheet Drawers (<code>Drawer.tsx</code>)</strong>: <code>w-96</code> to <code>w-[480px]</code> slide-over on desktop; automatically converts to an <code>h-[85vh]</code> swipeable bottom sheet on mobile viewports (&lt;768px).</li>
  <li><strong>Global Floating Navigator (<code>LocalhostNavigator.tsx</code>)</strong>: Triggered via <kbd>Ctrl</kbd> + <kbd>/</kbd> for rapid keyboard switching across all 14 tools and views.</li>
</ul>

<div class="page-break"></div>

<h2>Chapter 2: Comprehensive Subsection-by-Subsection UI/UX Breakdown</h2>

<h3>2.1 ATS Resume Roaster & Character-Span Annotator (<code>/tools/resume-roaster</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Score Header</strong>: Large circular ATS Score gauge (0-100), 4 calibrated pillar badges (Hard Skills, Evidence, Fresher, Format), and target alignment badge. Includes <code>(i)</code> ExplainDrawer trigger.</li>
    <li><strong>3-Way View Mode Switcher</strong>:
      <ul>
        <li><code>Annotated View</code>: Text highlighted with character-span spans (<span class="span-red">Red weak verbs</span>, <span class="span-amber">Amber passive/run-on</span>, <span class="span-green">Green metrics</span>).</li>
        <li><code>Clean View</code>: High-contrast typography view with inline score badges.</li>
        <li><code>Raw View</code>: Monospace text stream showing exactly what the parser parsed (reveals column mangling).</li>
      </ul>
    </li>
    <li><strong>Span Drawer & Rewrite Applicator</strong>: Clicking any highlighted span slides out a drawer detailing screener rationale and offers a 1-click rewrite replacement.</li>
    <li><strong>TabBar Subsections</strong>: Overview, Skills Breakdown, Fix These First (prioritized by score impact), Learning Path, and Annotated View.</li>
  </ul>
</div>

<h3>2.2 Dual-Role Job Description Compare Engine (<code>/tools/jd-compare</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Dual Input Zones</strong>: Side-by-side textareas for Role A and Role B with quick-fill from 7 Indian Fresher Role Presets.</li>
    <li><strong>Overlap Breakdown</strong>: Displays shared requirements, unique Role A skills, and unique Role B skills.</li>
    <li><strong>Radar Comparison</strong>: Visual radar chart comparing candidate coverage against both roles simultaneously.</li>
    <li><strong>Deterministic Gap Derivation</strong>: Automatically extracts missing skills into the global profile gap list.</li>
  </ul>
</div>

<h3>2.3 Handmade Resume Tailor & Studio Canvas (<code>/tools/tailor</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Left Column (Handmade Resume Editor)</strong>: 2-column cards for Profile, Summary, Experience, Projects, Skills, and Education. Includes live requirement mapping, in-place bullet elevation ("Elevate Bullet" button), and drag-and-drop reordering.</li>
    <li><strong>Right Column (Live Paper Canvas - <code>DarkPaperPreview.tsx</code>)</strong>: Real-time A4 preview with live sync, responsive zoom, and the 1-Page Overflow Sentinel (warns if text spills onto page 2; includes <code>Auto-Fit One Page</code> adjuster).</li>
    <li><strong>Pre-Export Formatting Sentinel (D15)</strong>: Scans for broken Unicode glyphs, widow/orphan lines (&lt; 3 words), and heading overflows before downloading PDF.</li>
  </ul>
</div>

<h3>2.4 Project Build Briefs & Set-Cover Bundler (<code>/tools/build-briefs</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Domain Category Pills</strong>: 14 color-coded domains (Distributed Systems, Web, Data Eng, AI/ML, GenAI, DevOps, Security, FinTech, etc.).</li>
    <li><strong>Greedy Set-Cover Bundler Tray</strong>: Calculates the minimum combination of projects covering all open candidate gaps.</li>
    <li><strong>Brief Cards & Detail Modal</strong>: Detailed view of all 10 deep sections (Problem Statement, Use Cases, Architecture, Scale Targets, Screener Rubric, Resume Bullet Formula).</li>
    <li><strong>JSZip Starter Scaffold Generator (D17)</strong>: Generates starter repository ZIP in-browser (README with Mermaid diagram, config, tests).</li>
    <li><strong>Resume Ledger Injection</strong>: Injects completed project bullet with <code>[METRIC]</code> placeholders directly into draft.</li>
  </ul>
</div>

<h3>2.5 Credential & Opportunity Engine (<code>/tools/credential-engine</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Category Subsections</strong>: Certifications, Events (Hackathons, CTFs, Contests), Open Source (GSoC, LFX), Opportunity Plan.</li>
    <li><strong>Opportunity Detail Modal</strong>: Exam dates, syllabus, official links, fee waiver eligibility, and provenance badges.</li>
    <li><strong>RFC 5545 iCalendar Export (D18)</strong>: Generates <code>.ics</code> calendar file with exam dates and milestone study schedules.</li>
    <li><strong>National Exam Checker</strong>: Rule-based eligibility checker for GATE, ISRO ICRB, AWS SAA, CDAC.</li>
  </ul>
</div>

<h3>2.6 Career Trajectory Hub & What-If Simulator (<code>/tools/career-path</code>)</h3>
<div class="card">
  <div class="card-title">Core Subsections & Interaction Canvas</div>
  <ul>
    <li><strong>Career Explorer</strong>: Leveling tracks across IT Services, Unicorns, GCCs, and Big Tech India with compensation visuals.</li>
    <li><strong>What-If Simulator (D20)</strong>: Interactive sliders for CGPA (5.0-10.0), College Tier (1/2/3), Branch, and Internships. Displays campus corporate cutoff gates (e.g. 7.0 CGPA) and reveals exact gap prerequisites without fake odds.</li>
  </ul>
</div>

<div class="page-break"></div>

<h2>Chapter 3: Project Build Briefs Architecture, Schema & Quality Rubric</h2>

<h3>3.1 The 15-Field Project Brief Schema</h3>
<p>
  Every project brief in <code>src/data/suite/project-briefs.json</code> adheres to this formal structure:
</p>
<pre>
{
  "id": "brief-ab-experimentation",
  "title": "Bayesian A/B Experimentation Engine",
  "domain": "ML Engineering",
  "estimatedHours": 29,
  "difficulty": "intermediate",
  "coveredSkills": ["Python", "NumPy", "SciPy", "FastAPI", "SQLite", "Docker", "Statistics"],
  "problemStatement": "Fixed-horizon frequentist experiment evaluation forces product teams to wait...",
  "useCases": "Feature flagging, recommendation algorithm comparison, search ranking...",
  "problemItSolves": "Frequentist peeking inflates false discovery rates; Bayesian sequential methods...",
  "recruiterSignal": "Understands statistical decision theory, sample efficiency, and REST API design...",
  "architecture": "FastAPI ingestion layer -> SQLite state store -> SciPy beta-binomial posterior...",
  "scaleTargets": "Evaluates 10,000 experiment arms in < 50ms; p99 API response < 15ms...",
  "techStack": ["Python", "FastAPI", "SciPy", "NumPy", "SQLite", "Docker"],
  "verificationRubric": [
    "1. Run \`pytest tests/test_bayesian_engine.py\` to verify posterior convergence",
    "2. Execute \`k6 run loadtest.js\` to verify 1,000 QPS with zero 5xx responses"
  ],
  "portfolioBulletFormula": "Engineered sequential Bayesian A/B test evaluator in FastAPI, reducing sample exposure time by 38%..."
}
</pre>

<h3>3.2 The 4 Quality Sentinels of a Production Brief</h3>
<table>
  <thead>
    <tr>
      <th>Quality Sentinel</th>
      <th>Quality Standard</th>
      <th>Enforcement & Verification Method</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Zero Invented Facts</strong></td>
      <td>No fake salaries, fake hiring guarantees, or invented benchmarks.</td>
      <td>Manual audit checklist; missing data stored as <code>null</code> / <code>unverified</code>.</td>
    </tr>
    <tr>
      <td><strong>2. Defensible Scale Targets</strong></td>
      <td>Targets must be achievable on a single developer machine.</td>
      <td>No "100M QPS"; realistic targets like "1,000 req/s with p99 &lt; 15ms on localhost".</td>
    </tr>
    <tr>
      <td><strong>3. Screener Verification Rubric</strong></td>
      <td>Concrete automated test commands a screener can execute.</td>
      <td>Must contain reproducible commands (e.g. <code>pytest</code>, <code>k6</code>, <code>npm test</code>).</td>
    </tr>
    <tr>
      <td><strong>4. Google XYZ Bullet Formula</strong></td>
      <td>Resume bullet must follow "Accomplished [X] measured by [Y] by doing [Z]".</td>
      <td>Must contain quantifiable metric tags and active engineering verbs.</td>
    </tr>
  </tbody>
</table>

<h3>3.3 Greedy Set-Cover Project Bundler Algorithm (<code>bundleBriefs.ts</code>)</h3>
<p>
  When a candidate has open skill gaps $U = \{s_1, s_2, \dots, s_n\}$:
</p>
<ul>
  <li>At each step, calculate marginal coverage: $M(b) = |b.\text{coveredSkills} \cap U|$.</li>
  <li>Calculate efficiency: $E(b) = M(b) / b.\text{estimatedHours}$.</li>
  <li>Select brief $b^*$ maximizing $E(b^*)$.</li>
  <li>Update $U \leftarrow U \setminus b^*.\text{coveredSkills}$ until all gaps are covered.</li>
</ul>

<div class="page-break"></div>

<h2>Chapter 4: The Complete Quality & Scoring Engines</h2>

<h3>4.1 ATS Ingestion & Layout Quality Engine (<code>src/engine/ingestion/</code>)</h3>
<ul>
  <li><strong>Multi-Format Parsing (<code>fileParser.ts</code>)</strong>: Dynamic runtime loading of <code>pdfjs-dist</code>, <code>mammoth</code>, and <code>jszip</code>. Initial load size remains lightweight (1.83 MB).</li>
  <li><strong>Layout Reader (<code>layoutReader.ts</code>)</strong>: Detects multi-column grids, bounding box coordinates, and prevents inter-column line interleaving.</li>
  <li><strong>Section Segmenter (<code>sectionSegmenter.ts</code>)</strong>: Regex classification of 12 standard resume section headings (Experience, Education, Skills, Projects, Certifications, etc.).</li>
</ul>

<h3>4.2 Calibrated 4-Pillar Scoring Mathematics</h3>
<table>
  <thead>
    <tr>
      <th>Pillar Name</th>
      <th>Weight</th>
      <th>Formula & Core Evaluation Mechanism</th>
      <th>Calibration Baseline</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Hard Skills Coverage</strong></td>
      <td><strong>40%</strong></td>
      <td><code>(Evidenced Skills / Target Role Mandatory Skills) * 100</code></td>
      <td>Mandatory: 3.0, Preferred: 1.5, Mentioned: 1.0</td>
    </tr>
    <tr>
      <td><strong>2. Evidence Quality & Depth</strong></td>
      <td><strong>25%</strong></td>
      <td><code>(∑ BulletMultipliers) / TotalBullets * 100</code><br>L3 (Outcome): 1.0, L2 (Experience): 0.85, L1 (Project): 0.65, L0: 0.35</td>
      <td>Regex extracts digits, %, latency ms, QPS, user counts</td>
    </tr>
    <tr>
      <td><strong>3. Fresher Readiness</strong></td>
      <td><strong>20%</strong></td>
      <td>Projects (40) + Degree Proof (25) + GitHub Links (20) + CS Theory (15)</td>
      <td>Rewards reproducible projects over unverified claims</td>
    </tr>
    <tr>
      <td><strong>4. Format Safety</strong></td>
      <td><strong>15%</strong></td>
      <td>Base 100 minus penalties (Multi-column -15, Broken glyphs -10, Tables -15)</td>
      <td>Anchor score at 25.0 to prevent demoralizing 0s</td>
    </tr>
  </tbody>
</table>

<h3>4.3 Truth Gate Honesty Engine (<code>src/engine/tailor/truthGate.ts</code>)</h3>
<ul>
  <li><strong>Zero Hallucination Guarantee</strong>: Resume tailoring strictly forbids adding skills not evidenced in the original draft.</li>
  <li><strong>Parity Checker</strong>: Confirms that bullet point revisions maintain semantic alignment with original accomplishments.</li>
</ul>

<h3>4.4 Pre-Export Formatting Quality Sentinel (<code>src/lib/tailor/export/formattingChecker.ts</code>)</h3>
<ul>
  <li><strong>Broken Glyph Check</strong>: Scans for <code>\uFFFD</code>, unprintable control characters, and unclosed quotes.</li>
  <li><strong>Widow & Orphan Lines</strong>: Flags bullet points where the final line contains &lt; 3 words.</li>
  <li><strong>1-Page Fit</strong>: Checks vertical page height; warns before export if resume overflows standard 1-page bounds.</li>
</ul>

<div class="page-break"></div>

<h2>Chapter 5: Data Models, Storage Adapter & Zod Schemas</h2>

<h3>5.1 Storage Architecture & Quotas</h3>
<table>
  <thead>
    <tr>
      <th>Store Name</th>
      <th>Key Prefix</th>
      <th>Quota Cap</th>
      <th>Quarantine & Eviction Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Candidate Profile</strong></td>
      <td><code>hireflow:v4:profile</code></td>
      <td>5 versions</td>
      <td>Prompt to replace or delete when 6th added</td>
    </tr>
    <tr>
      <td><strong>Scan History</strong></td>
      <td><code>hireflow:v4:scan_history</code></td>
      <td>60 scans</td>
      <td>Ring buffer: oldest scan automatically evicted</td>
    </tr>
    <tr>
      <td><strong>Saved JDs</strong></td>
      <td><code>hireflow:v4:saved_jds</code></td>
      <td>40 JDs</td>
      <td>Deduplicated via SHA-256 hashText(); cap prompt</td>
    </tr>
    <tr>
      <td><strong>Saved Roles</strong></td>
      <td><code>hireflow:v4:saved_roles</code></td>
      <td>50 roles</td>
      <td>Cap prompt when limit reached</td>
    </tr>
    <tr>
      <td><strong>Local Feedback</strong></td>
      <td><code>hireflow:v4:feedback</code></td>
      <td>500 notes</td>
      <td>Oldest evicted; invariant: zero scoring mutation</td>
    </tr>
    <tr>
      <td><strong>Brief Progress</strong></td>
      <td><code>hireflow:v4:brief_progress</code></td>
      <td>30 briefs</td>
      <td>Progress status and resume ledger injection</td>
    </tr>
  </tbody>
</table>

<h3>5.2 Tamper-Evident Backup Format & Checksum Verification</h3>
<p>
  Backups are exported as canonical JSON with a tamper-evident checksum (<code>fnv1a:&lt;hash&gt;</code>). Upon import, the adapter validates the checksum and Zod schemas, offering <strong>Merge</strong> (combines records) or <strong>Replace</strong> (overwrites existing state) modes.
</p>

<h2>Chapter 6: Developer's Extension Blueprint ("In Order to Make Changes")</h2>

<h3>6.1 How to Add or Modify a Subsection in the UI</h3>
<ol>
  <li>Create or modify the component in <code>src/features/suite/&lt;tool&gt;/components/</code> or <code>src/components/common/</code>.</li>
  <li>Ensure it uses standard design tokens (<code>bg-surface/70</code>, <code>border-border/80</code>, <code>text-foreground</code>).</li>
  <li>Ensure accessibility compliance: visible focus rings (<code>focus-visible:ring-2</code>), min 44x44px touch targets.</li>
  <li>For slide-overs, wrap inside <code>Drawer.tsx</code> to automatically gain mobile bottom-sheet ergonomics.</li>
</ol>

<h3>6.2 How to Add or Edit Project Briefs</h3>
<ol>
  <li>Open <code>src/data/suite/project-briefs.json</code>.</li>
  <li>Add an entry conforming to the 15-field schema.</li>
  <li>Verify that <code>portfolioBulletFormula</code> adheres to the Google XYZ framework.</li>
  <li>Run the automated dataset validator: <code>npx vitest run src/data/__tests__/validateData.test.ts</code>.</li>
</ol>

<h3>6.3 How to Calibrate Scoring Weights & Pillars</h3>
<ol>
  <li>Edit <code>ATS_PILLAR_WEIGHTS</code> in <code>src/config/scoring.ts</code>.</li>
  <li>Note: Changing weights automatically updates <code>computeConfigFingerprint()</code> in <code>src/config/versions.ts</code>.</li>
  <li>Update formula descriptions in <code>docs/metric-inventory.md</code> and <code>src/types/explain.ts</code>.</li>
</ol>

<h3>6.4 Running the Automated Quality Gates</h3>
<pre>
# 1. Typecheck the entire codebase
npm run typecheck

# 2. Verify zero network egress / telemetry leaks
npm run privacy:check

# 3. Run all 106 automated test suites (738 passing tests)
npx vitest run

# 4. Build and verify production bundle size budget
npm run build
npx tsx scripts/check-bundle-size.ts
</pre>

<div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 8pt; border-top: 1px solid #cbd5e1; padding-top: 8px;">
  HireFlow AI — Candidate Career Decision Suite • Quality Engine & Subsections Manual • Production Ready
</div>

</body>
</html>
`;

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
console.log(`[HTML] Generated print template at: ${tempHtmlPath}`);

// Render PDF via Chrome Headless
console.log('[PDF] Rendering high-fidelity PDF via Google Chrome Headless...');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const proc = spawnSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${manualPdfTarget}`,
  tempHtmlPath
]);

if (fs.existsSync(manualPdfTarget)) {
  fs.copyFileSync(manualPdfTarget, localDocsManualPdf);
  fs.copyFileSync(manualPdfTarget, briefPdfTarget);
  fs.copyFileSync(manualPdfTarget, localDocsBriefPdf);
  console.log(`[PDF] Successfully created PDF:\n  - ${manualPdfTarget}\n  - ${briefPdfTarget}`);
} else {
  console.error('[PDF] Failed to create PDF with Chrome. Retrying with Edge...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  spawnSync(edgePath, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${manualPdfTarget}`,
    tempHtmlPath
  ]);
  if (fs.existsSync(manualPdfTarget)) {
    fs.copyFileSync(manualPdfTarget, localDocsManualPdf);
    fs.copyFileSync(manualPdfTarget, briefPdfTarget);
    fs.copyFileSync(manualPdfTarget, localDocsBriefPdf);
    console.log(`[PDF] Successfully created PDF via Edge:\n  - ${manualPdfTarget}`);
  }
}

// Cleanup temp HTML
if (fs.existsSync(tempHtmlPath)) {
  fs.unlinkSync(tempHtmlPath);
}

// Create updated ZIP archive
console.log('[ZIP] Updating comprehensive ZIP archive...');
const psScript = `Compress-Archive -Path "${manualTxtTarget}", "${manualPdfTarget}", "${briefTxtTarget}", "${briefPdfTarget}" -DestinationPath "${briefZipTarget}" -Force`;
spawnSync('powershell', ['-Command', psScript]);

console.log('✅ Generation & Downloads Complete!');
