// ============================================================
// HireFlow Master Compiler: Complete System Contextual Brief & Dataset Extracts
// Compiles full system architecture, code blueprints, data pipelines,
// and embedded dataset extracts into a single standalone Markdown and HTML document.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const DOWNLOADS_DIR = 'C:\\Users\\yadav\\Downloads\\HireFlow_Complete_Contextual_Brief';

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// 1. Helper to safely read file content
function readFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return `[File not found: ${relPath}]`;
}

// 2. Read all core datasets
console.log('Reading core datasets and configurations...');

const skillsTaxonomyRaw = readFile('src/data/ats/skills-taxonomy.json');
const marketTiersRaw = readFile('src/data/ats/market-tiers.json');
const atsFormatRulesRaw = readFile('src/data/ats/ats-format-rules.json');
const implicationGraphRaw = readFile('src/data/ats/implication-graph.json');
const writingQualityRaw = readFile('src/data/ats/writing-quality.json');
const archetypesRaw = readFile('src/data/ats/archetypes.json');
const thresholdsTs = readFile('src/config/thresholds.ts');
const scoringTs = readFile('src/config/scoring.ts');
const featuresTs = readFile('src/config/features.ts');
const pathwaysManifestTs = readFile('src/pathways/facts/manifest.generated.ts');
const pathwaysRulesTs = readFile('src/pathways/facts/rules.generated.ts');
const pathwaysAssumptionsTs = readFile('src/pathways/models/assumptions.ts');
const professionalTaxTs = readFile('src/data/suite/professional-tax.ts');
const blockerCatalogTs = readFile('src/data/careerLadders/blockerCatalog.ts');
const degreesAndBranchesTs = readFile('src/data/careerLadders/degreesAndBranches.ts');
const credentialsSchemaTs = readFile('src/features/suite/credentials/data/credentialsSchema.ts');

// Summarize parsed datasets
let skillsTaxonomyObj = {};
try { skillsTaxonomyObj = JSON.parse(skillsTaxonomyRaw); } catch {}
const totalSkillCategories = Object.keys(skillsTaxonomyObj).length;
let totalSkillsCount = 0;
Object.values(skillsTaxonomyObj).forEach(cat => {
  if (Array.isArray(cat)) totalSkillsCount += cat.length;
  else if (typeof cat === 'object') {
    Object.values(cat).forEach(sub => {
      if (Array.isArray(sub)) totalSkillsCount += sub.length;
    });
  }
});

let marketTiersObj = {};
try { marketTiersObj = JSON.parse(marketTiersRaw); } catch {}

// 3. Assemble Master Contextual Brief Markdown
console.log('Assembling master contextual brief markdown...');

const masterMarkdown = `# HireFlow Architecture: Complete System Contextual Brief & Rewiring Manual

> **System Version**: HireFlow v4.0.0 (India Engineering & Candidate Career Decision Suite)  
> **Architecture Core**: 100% Client-Side Pure TypeScript Engines (Zero Runtime Network Egress)  
> **Platform Components**: ATS Resume Roaster, Tailor My Resume, Reach Out, Project Briefs, Credential Engine, Career Trajectory, Compare JDs, TalentLens, and Pathways  
> **Document Purpose**: End-to-end contextual manual and complete dataset extract repository for deep system comprehension, architecture rewiring, and dataset inspection.

---

## Table of Contents

1. [Executive Overview & Platform Philosophy](#1-executive-overview--platform-philosophy)
2. [Complete Physical Architecture & Directory Map](#2-complete-physical-architecture--directory-map)
3. [Deep-Dive into the 9 Subsystems](#3-deep-dive-into-the-9-subsystems)
   - [3.1 ATS Resume Roaster & Invariant Scorer](#31-ats-resume-roaster--invariant-scorer)
   - [3.2 Tailor My Resume Diff Engine](#32-tailor-my-resume-diff-engine)
   - [3.3 Reach Out Cold Outreach Generator](#33-reach-out-cold-outreach-generator)
   - [3.4 Project Build Briefs Engine](#34-project-build-briefs-engine)
   - [3.5 Credential & Opportunity Engine](#35-credential--opportunity-engine)
   - [3.6 Career Trajectory & Company Ladders](#36-career-trajectory--company-ladders)
   - [3.7 Compare Job Descriptions Engine](#37-compare-job-descriptions-engine)
   - [3.8 TalentLens Diagnostic Engine](#38-talentlens-diagnostic-engine)
   - [3.9 Pathways Fresher Campus Intelligence Suite](#39-pathways-fresher-campus-intelligence-suite)
4. [Master Data Pipeline & Ingestion Flow](#4-master-data-pipeline--ingestion-flow)
   - [How Data Enters, Translates, and Resolves in the System](#how-data-enters-translates-and-resolves-in-the-system)
   - [State Management & Local Storage Namespaces](#state-management--local-storage-namespaces)
5. [Complete Rewiring & Customization Manual](#5-complete-rewiring--customization-manual)
   - [Guide 1: Modifying Scoring Weights & Tolerances](#guide-1-modifying-scoring-weights--tolerances)
   - [Guide 2: Adding New Skills or Implication Graph Nodes](#guide-2-adding-new-skills-or-implication-graph-nodes)
   - [Guide 3: Adding New Companies, Levels, and CTC Bands](#guide-3-adding-new-companies-levels-and-ctc-bands)
   - [Guide 4: Adding New Project Briefs & Opportunities](#guide-4-adding-new-project-briefs--opportunities)
   - [Guide 5: Updating Campus Programs & Statutory Tax Rules](#guide-5-updating-campus-programs--statutory-tax-rules)
6. [Complete Embedded Dataset Extracts](#6-complete-embedded-dataset-extracts)
   - [Dataset Extract 1: Engine Thresholds & Limits (\`thresholds.ts\`)](#dataset-extract-1-engine-thresholds--limits)
   - [Dataset Extract 2: Scoring Spec Weights & Modifiers (\`scoring.ts\`)](#dataset-extract-2-scoring-spec-weights--modifiers)
   - [Dataset Extract 3: ATS Format & Parsing Rules (\`ats-format-rules.json\`)](#dataset-extract-3-ats-format--parsing-rules)
   - [Dataset Extract 4: Skills Implication Graph (\`implication-graph.json\`)](#dataset-extract-4-skills-implication-graph)
   - [Dataset Extract 5: Writing Quality & Verb Modifiers (\`writing-quality.json\`)](#dataset-extract-5-writing-quality--verb-modifiers)
   - [Dataset Extract 6: India Market Tiers & Compensation Bands (\`market-tiers.json\`)](#dataset-extract-6-india-market-tiers--compensation-bands)
   - [Dataset Extract 7: Technical Role Archetypes (\`archetypes.json\`)](#dataset-extract-7-technical-role-archetypes)
   - [Dataset Extract 8: Statutory Rules & Tax Slabs (\`rules.generated.ts\`)](#dataset-extract-8-statutory-rules--tax-slabs)
   - [Dataset Extract 9: Editorial Assumptions Register (\`assumptions.ts\`)](#dataset-extract-9-editorial-assumptions-register)
   - [Dataset Extract 10: State Professional Tax Rules (\`professional-tax.ts\`)](#dataset-extract-10-state-professional-tax-rules)
   - [Dataset Extract 11: Promotion Blockers Catalog (\`blockerCatalog.ts\`)](#dataset-extract-11-promotion-blockers-catalog)
   - [Dataset Extract 12: Engineering Degrees & Branches Catalog (\`degreesAndBranches.ts\`)](#dataset-extract-12-engineering-degrees--branches-catalog)
7. [System Verification & Quality Guardrails](#7-system-verification--quality-guardrails)

---

## 1. Executive Overview & Platform Philosophy

HireFlow is an advanced, client-side engineering intelligence platform designed to empower job seekers—from 2nd-to-final year Indian engineering students to senior staff engineers—with deterministic, truth-checked career diagnostics and simulations.

### Core Architectural Axioms
1. **Zero Runtime Network Egress**: User resumes, JDs, compensation numbers, and profile details are evaluated **entirely inside the browser**. No telemetry or tracking SDKs exist.
2. **Deterministic Invariant Scoring**: Scores are not random LLM guesses. They are calculated using pure, mathematical formulas with strict invariant properties (e.g. scores always strictly in range [0, 100], zero score without matching skills, predictable subscore derivations).
3. **No-Hallucination Rewriting (Truth Gate)**: The system strictly prevents AI from fabricating achievements. An original bullet stating *"assisted with database testing"* can never be rewritten to claim *"architected distributed PostgreSQL clusters"*.
4. **India Market Calibration**: All compensation calculations, tax computations, service bond evaluations, college placement tiers, and career progression models are tailored to Indian engineering realities (INR Lakhs per Annum / LPA, New Regime FY 26–27 income tax, EPFO statutory ceilings, Section 74 service bonds).

---

## 2. Complete Physical Architecture & Directory Map

\`\`\`text
hireflow/
├── src/
│   ├── config/                     # Global thresholds, scoring weights, feature flags
│   │   ├── thresholds.ts           # Word counts, penalty limits, claim strength ladder
│   │   ├── scoring.ts              # ATS pillar weights (40/25/20/15), match multipliers
│   │   ├── features.ts             # Feature flag registry (PATHWAYS_ENABLED, etc.)
│   │   └── India-fresher.ts        # Fresher placement bands and tier cutoffs
│   ├── data/                       # Master datasets & calibrated tables
│   │   ├── ats/                    # ATS taxonomy, market tiers, format rules, archetypes
│   │   │   ├── skills-taxonomy.json # Multi-tiered canonical skill alias dictionary
│   │   │   ├── implication-graph.json # Skill relationship DAG (React -> JS, etc.)
│   │   │   ├── ats-format-rules.json  # Regex patterns for headers, text boxes, tables
│   │   │   ├── market-tiers.json   # CTC bands across Tier S, A, B, C, D
│   │   │   ├── writing-quality.json # Impact verbs, weak verbs, metric patterns
│   │   │   └── archetypes.json     # 6 core technical talent archetypes
│   │   ├── careerLadders/          # 56 Indian employer ladders, levels, and blockers
│   │   │   ├── companies/          # Individual company JSON definitions
│   │   │   ├── blockerCatalog.ts   # Real promo blockers (system design, visibility)
│   │   │   ├── degreesAndBranches.ts # Circuit vs non-circuit branch classification
│   │   │   └── equivalenceMap.ts   # Cross-company level equivalence matrix
│   │   └── suite/                  # Outreach templates, project briefs, tax configs
│   │       ├── outreach-templates.json # Pre-calibrated high-conversion templates
│   │       ├── project-briefs.json # Production engineering specs (466 KB)
│   │       └── professional-tax.ts # State-by-state PT deductions in India
│   ├── lib/ats/                    # Core ATS Resume Roaster engine
│   │   ├── fileExtractor.ts        # PDF (pdfjs) and DOCX (mammoth) binary parser
│   │   ├── parseResume.ts          # Section partitioner, contact & bullet extractor
│   │   ├── parseJD.ts              # Role title, yoe, and skill requirement parser
│   │   ├── matchSkills.ts          # Direct + implication graph transitive matcher
│   │   ├── evidenceScorer.ts       # XYZ bullet formula & impact metric evaluator
│   │   ├── formatAuditor.ts        # ATS format safety & layout risk inspector
│   │   ├── seniorityFit.ts         # Experience alignment & over/under-qualification
│   │   ├── marketPositioning.ts    # Best fit tier classifier & signal gap analyzer
│   │   ├── scoreAggregator.ts      # Strict 4-pillar composite score calculation
│   │   ├── invariants.ts           # Formal mathematical invariant assertions
│   │   └── pipeline.ts             # Orchestrates deterministic analysis + AI roasting
│   ├── features/                   # Major functional modules
│   │   ├── suite/                  # Decision Suite tools
│   │   │   ├── briefs/             # Project Build Briefs engine
│   │   │   ├── compare/            # Multi-JD comparison engine
│   │   │   ├── credentials/        # Credential & Opportunity engine
│   │   │   ├── outreach/           # Reach Out cold messaging generator
│   │   │   └── tailor/             # Tailor My Resume diff & truth gate engine
│   │   └── career-path/            # Career Trajectory simulator & ladders
│   ├── pathways/                   # Fresher Campus Intelligence Suite
│   │   ├── components/             # Reusable UI (EvidenceChip, BudgetBar, Footers)
│   │   ├── engine/                 # Pure engines (eligibility, offer, plan, readiness)
│   │   ├── facts/                  # Compiled facts (programs, statutory rules, manifest)
│   │   ├── models/                 # Editorial assumptions register
│   │   ├── pages/                  # 5 routes (Radar, Detail, Plan, Offers, AboutData)
│   │   └── utils/money.ts          # Integer rupee arithmetic & half-up rounding
│   ├── scoring/                    # Canonical Scoring Specification Engine
│   ├── store/                      # Zustand state management & localStorage persistence
│   └── App.tsx                     # Master routing table & code-split lazy routes
├── scripts/                        # Tooling, audits, validation, and verification
│   ├── pathways/                   # Pathways verification, blind check, and compilers
│   ├── security/                   # Secret scanner, dependency auditor
│   └── calibrate.ts                # Calibration harness for ATS scoring golden fixtures
└── tests/                          # 70+ automated unit, property, and invariant test suites
\`\`\`

---

## 3. Deep-Dive into the 9 Subsystems

### 3.1 ATS Resume Roaster & Invariant Scorer
- **Path**: \`src/lib/ats/\`, \`src/pages/tools/ResumeChecker.tsx\`
- **Core Problem Solved**: Eliminates opaque, subjective resume reviews with transparent, deterministic scoring.
- **The Four Evaluation Pillars**:
  1. **Hard Skill Requirement Coverage (40%)**:
     - Evaluates mandatory vs. preferred skills extracted from the JD.
     - Direct matches earn 1.0 credit; transferable skills (via \`implication-graph.json\`) earn 0.7 credit; partial mentions earn 0.4 credit.
  2. **Evidence Quality & Bullet Impact (25%)**:
     - Audits every bullet against Google's XYZ formula: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
     - Uses \`writing-quality.json\` to credit decisive action verbs and penalize passive/weak language.
  3. **Fresher / Project Readiness (20%)**:
     - Evaluates verified project deliverables, GitHub repositories, competitive programming links, and technical coursework.
  4. **Format & Parser Safety (15%)**:
     - Audits layout against multi-column tables, floating text boxes, graphic icons, non-standard section headers, and font anomalies.
- **Penalty Penalties**:
  - Keyword stuffing: -10 points deducted if $>60\\%$ of listed skills lack bullet evidence.
  - Missing standard sections: -3 points per section.
  - Abnormally sparse resume: -4 points.
- **Invariant Guarantees**:
  - Score $\\in [0, 100]$ strictly.
  - If zero mandatory skills match, final score cannot exceed 35.
  - Deterministic: identical inputs generate identical scores down to the decimal.

---

### 3.2 Tailor My Resume Diff Engine
- **Path**: \`src/features/suite/tailor/\`, \`src/engine/tailor/\`
- **Core Problem Solved**: Allows candidates to align their resume to a specific JD without fabricating qualifications.
- **Key Modules**:
  - **Layout Tree Parser**: Deconstructs raw resume text into semantic blocks (Header, Experience, Projects, Education, Skills).
  - **The Truth Gate (\`truthGate.ts\`)**: Evaluates rewrites using the 4-tier Claim Strength Ladder:
    - Tier 1 (Supportive): *assisted, helped, supported, participated*
    - Tier 2 (Contributory): *contributed, worked, collaborated, maintained*
    - Tier 3 (Direct Execution): *built, created, developed, implemented, designed*
    - Tier 4 (Leadership / Architecture): *architected, spearheaded, orchestrated, led*
    - **Rule**: A rewrite may never elevate a verb by more than one tier without explicit project evidence.
  - **Required Metric Placeholders**: Leaves highlighted tags like \`[X]% latency reduction\` for the user to substitute real metrics.

---

### 3.3 Reach Out Cold Outreach Generator
- **Path**: \`src/features/suite/outreach/\`
- **Core Problem Solved**: Replaces awkward, generic messages with context-aware, verifiable cold emails and connection notes.
- **Key Capabilities**:
  - **LinkedIn 300-Char Mode**: Strict character-counter ensuring messages fit LinkedIn connection request constraints.
  - **Channel Modes**: InMail, Cold Email, Alumni Network, Recruiter Follow-up.
  - **Proof-Point Integration**: Automatically weaves candidate's strongest verified metric or project into the hook.
  - **Spam Word Filter**: Flags high-risk words (*"urgent"*, *"guarantee"*, *"pleased to inform"*) that trigger spam quarantine.

---

### 3.4 Project Build Briefs Engine
- **Path**: \`src/features/suite/briefs/\`, \`src/data/suite/project-briefs.json\`
- **Core Problem Solved**: Tells candidates exactly what to build to close their specific resume gaps.
- **How It Works**:
  - Identifies missing skills from the ATS scan.
  - Matches gaps to production engineering project briefs.
  - Each brief includes:
    1. System Architecture & Component Diagram
    2. Real-World Scale Targets (e.g., 10k concurrent WebSockets, <50ms p99 latency)
    3. Mandatory Deliverables (Docker Compose, CI/CD pipeline, integration tests)
    4. Verification Rubric (How to prove it works on GitHub)
    5. Interview Defense Guide (Anticipated technical questions and failure modes)

---

### 3.5 Credential & Opportunity Engine
- **Path**: \`src/features/suite/credentials/\`
- **Core Problem Solved**: Maps verified, high-ROI credentials and national competitions for Indian engineering students.
- **Opportunity Catalog**:
  - **National Competitions**: Smart India Hackathon (SIH), Flipkart GRiD, Tata Crucible, Amazon ML Challenge.
  - **Global Fellowships**: Google Summer of Code (GSoC), Linux Foundation Mentorship (LFX), MLH Fellowship.
  - **Industry Certifications**: AWS Certified Developer, CKA (Certified Kubernetes Administrator), Meta Frontend/Backend.
- **Eligibility Engine**: Filters by university year, degree (B.Tech, B.E., MCA), branch, and fee waiver eligibility.

---

### 3.6 Career Trajectory & Company Ladders
- **Path**: \`src/careers-core/\`, \`src/data/careerLadders/\`, \`src/pages/tools/career-path/\`
- **Core Problem Solved**: Models progression ladders, salary growth, and promotion stall rates across 56+ Indian employers.
- **Tiers & Down-Leveling Rules**:
  - **Tier S**: FAANG, Uber, HFTs (CTC ₹35L–₹1.2Cr+)
  - **Tier A**: High-Growth Unicorns (Swiggy, Razorpay, Cred; CTC ₹22L–₹50L)
  - **Tier B**: Product & Established Fintech (Paytm, Zoho, MakeMyTrip; CTC ₹12L–₹28L)
  - **Tier C**: IT Services & Consulting (TCS, Infosys, Cognizant; CTC ₹3.6L–₹12L)
  - **Down-Leveling Factor**: When moving from Tier C to Tier S, candidates face an average 1–2 level down-leveling discount due to architectural depth expectations.

---

### 3.7 Compare Job Descriptions Engine
- **Path**: \`src/features/suite/compare/\`
- **Core Problem Solved**: Evaluates multiple job offers or descriptions side-by-side to prioritize application efforts.
- **Outputs**:
  - Shared skill intersections across JDs.
  - Unique technical requirements per company.
  - Coverage Yield: Calculates which target JD offers the greatest marginal return for the candidate's existing skillset.

---

### 3.8 TalentLens Diagnostic Engine
- **Path**: \`src/pages/tools/TalentLens.tsx\`, \`src/data/ats/archetypes.json\`
- **Core Problem Solved**: Comprehensive candidate diagnostic benchmark.
- **The 6 Core Technical Archetypes**:
  1. *Systems Architect*: Distributed systems, concurrency, cloud infrastructure, latency optimization.
  2. *Full-Stack Builder*: End-to-end web apps, API design, relational databases, state management.
  3. *Data & ML Specialist*: Python, PyTorch, SQL, data pipelines, model serving.
  4. *Cloud & DevOps Specialist*: Kubernetes, Terraform, CI/CD, observability, Linux internals.
  5. *Frontend Specialist*: React, performance optimization, accessibility, component systems.
  6. *Quality & Reliability Engineer*: Automation frameworks, load testing, chaos engineering.

---

### 3.9 Pathways Fresher Campus Intelligence Suite
- **Path**: \`src/pathways/\`
- **Core Problem Solved**: Replaces outdated career trajectory tools for Indian freshers with verified campus data.
- **Five Key Modules**:
  1. **Eligibility Radar (\`/tools/pathways\`)**: Instant 3-input evaluation (Branch, Batch, CGPA) against 20 verified programs.
  2. **CGPA Gap Calculator**: Pure formula:
     $$R = \\frac{T \\cdot N - C \\cdot n}{N - n}$$
     Calculates required GPA in remaining semesters with equal-credit caveat.
  3. **Offer Evaluator (\`/tools/pathways/offers\`)**:
     - Decomposes CTC into Gross Cash vs. Employer Provisions (PF, Gratuity, Insurance).
     - 3 monthly scenarios (100%, 50%, 0% variable payout).
     - New Regime FY 26–27 income tax calculation with ₹75,000 standard deduction and ₹12,00,000 Section 87A rebate.
     - Month 0–36 Exit Exposure Timeline (Service Bond + Bonus Clawback).
  4. **Action Plan (\`/tools/pathways/plan\`)**: Prioritized 3-lane roadmap (Blockers $\\to$ Readiness Gaps $\\to$ Process Prep).
  5. **Data & Methodology (\`/tools/pathways/about-data\`)**: Open provenance ledger with SHA-256 integrity proofs.

---

## 4. Master Data Pipeline & Ingestion Flow

\`\`\`mermaid
flowchart TD
    subgraph DataSources["Data Sources (Compile Time)"]
        Taxonomy[skills-taxonomy.json]
        Ladders[careerLadders / companies]
        Ledger[docs/pathways/ledger/*.json]
        StatutoryRules[govt-*.json]
    end

    subgraph BuildPipeline["Build & Compilation Pipeline"]
        Validate[validate-ledger.mjs]
        BlindCheck[verify-blind.mjs]
        Compiler[build.mjs]
        CheckGenerated[check-generated.mjs]
        ASTCheck[check-ui-math.mjs]
    end

    subgraph RuntimeState["Browser Local Storage (Client-Side)"]
        PStore["hireflow:v4:pathways:profile"]
        ATSSession["hireflow_tool_ats_v3"]
        TLSound["hireflow_talentlens_session_v1"]
        History["hireflow_scan_history_v2"]
    end

    subgraph PureEngines["Deterministic Execution Engines"]
        OfferEngine[offer.ts]
        EligEngine[eligibility.ts]
        PlanEngine[plan.ts]
        ATSPipeline[pipeline.ts]
    end

    DataSources --> BuildPipeline
    BuildPipeline -->|Generated Static Facts| PureEngines
    RuntimeState <--> PureEngines
    PureEngines -->|Precomputed Results| UIComponents[UI Presentation Layer - Zero Math]
\`\`\`

---

## 5. Complete Rewiring & Customization Manual

### Guide 1: Modifying Scoring Weights & Tolerances
- **Target File**: [\`src/config/thresholds.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/thresholds.ts) and [\`src/config/scoring.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts)
- **To adjust word count bounds**: Edit \`BULLET_LIMITS\` or \`DOCUMENT_BOUNDS\` in \`thresholds.ts\`.
- **To modify ATS pillar weights**: Edit \`ATS_PILLAR_WEIGHTS\` in \`scoring.ts\`. Ensure the four weights sum to exactly 1.0.
- **To adjust keyword stuffing penalties**: Edit \`PENALTY_THRESHOLDS.maxUnevidencedSkillRatio\` (default 0.60) or penalty points.

### Guide 2: Adding New Skills or Implication Graph Nodes
- **Target File**: [\`src/data/ats/skills-taxonomy.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/skills-taxonomy.json) and [\`src/data/ats/implication-graph.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/implication-graph.json)
- **Step 1**: Add the canonical skill and all known aliases to the appropriate category in \`skills-taxonomy.json\`.
- **Step 2**: If the skill implies parent or sibling competencies (e.g., \`FastAPI\` implies \`Python\` and \`REST APIs\`), add an entry in \`implication-graph.json\`:
  \`\`\`json
  "fastapi": {
    "implies": ["python", "rest-api"],
    "weight": 0.85
  }
  \`\`\`

### Guide 3: Adding New Companies, Levels, and CTC Bands
- **Target File**: [\`src/data/careerLadders/companies/\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/careerLadders/companies/)
- **Step 1**: Create or edit the company definition JSON.
- **Step 2**: Define ladder levels with level name, Indian base salary, target performance bonus, and stock grants.
- **Step 3**: Re-run \`npm run test:data\` to validate schema compliance.

### Guide 4: Adding New Project Briefs & Opportunities
- **Target File**: [\`src/data/suite/project-briefs.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/project-briefs.json)
- **Step 1**: Add a new JSON object conforming to the Brief schema (problem statement, scale targets, architecture, deliverables).
- **Step 2**: Ensure \`skillsTargeted\` links to canonical skills in \`skills-taxonomy.json\`.

### Guide 5: Updating Campus Programs & Statutory Tax Rules
- **Target File**: [\`docs/pathways/ledger/<program-id>.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/docs/pathways/ledger/)
- **Step 1**: Add or modify rows adhering to Constitution Part B (exact $\\le 15$ word snippet, official URL, retrieved timestamp).
- **Step 2**: Run the pipeline compiler:
  \`\`\`bash
  npm run pathways:validate-ledger
  npm run pathways:verify-blind
  npm run pathways:build
  npm run pathways:check-generated
  \`\`\`

---

## 6. Complete Embedded Dataset Extracts

### Dataset Extract 1: Engine Thresholds & Limits
*Source: [\`src/config/thresholds.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/thresholds.ts)*
\`\`\`typescript
${thresholdsTs.trim()}
\`\`\`

---

### Dataset Extract 2: Scoring Spec Weights & Modifiers
*Source: [\`src/config/scoring.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/scoring.ts)*
\`\`\`typescript
${scoringTs.trim()}
\`\`\`

---

### Dataset Extract 3: ATS Format & Parsing Rules
*Source: [\`src/data/ats/ats-format-rules.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/ats-format-rules.json)*
\`\`\`json
${atsFormatRulesRaw.trim()}
\`\`\`

---

### Dataset Extract 4: Skills Implication Graph
*Source: [\`src/data/ats/implication-graph.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/implication-graph.json)*
\`\`\`json
${implicationGraphRaw.trim()}
\`\`\`

---

### Dataset Extract 5: Writing Quality & Verb Modifiers
*Source: [\`src/data/ats/writing-quality.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/writing-quality.json)*
\`\`\`json
${writingQualityRaw.trim()}
\`\`\`

---

### Dataset Extract 6: India Market Tiers & Compensation Bands
*Source: [\`src/data/ats/market-tiers.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/market-tiers.json)*
\`\`\`json
${marketTiersRaw.trim()}
\`\`\`

---

### Dataset Extract 7: Technical Role Archetypes
*Source: [\`src/data/ats/archetypes.json\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/ats/archetypes.json)*
\`\`\`json
${archetypesRaw.trim()}
\`\`\`

---

### Dataset Extract 8: Statutory Rules & Tax Slabs
*Source: [\`src/pathways/facts/rules.generated.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pathways/facts/rules.generated.ts)*
\`\`\`typescript
${pathwaysRulesTs.trim()}
\`\`\`

---

### Dataset Extract 9: Editorial Assumptions Register
*Source: [\`src/pathways/models/assumptions.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pathways/models/assumptions.ts)*
\`\`\`typescript
${pathwaysAssumptionsTs.trim()}
\`\`\`

---

### Dataset Extract 10: State Professional Tax Rules
*Source: [\`src/data/suite/professional-tax.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/professional-tax.ts)*
\`\`\`typescript
${professionalTaxTs.trim()}
\`\`\`

---

### Dataset Extract 11: Promotion Blockers Catalog
*Source: [\`src/data/careerLadders/blockerCatalog.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/careerLadders/blockerCatalog.ts)*
\`\`\`typescript
${blockerCatalogTs.trim()}
\`\`\`

---

### Dataset Extract 12: Engineering Degrees & Branches Catalog
*Source: [\`src/data/careerLadders/degreesAndBranches.ts\`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/careerLadders/degreesAndBranches.ts)*
\`\`\`typescript
${degreesAndBranchesTs.trim()}
\`\`\`

---

## 7. System Verification & Quality Guardrails

The HireFlow codebase is protected by comprehensive pre-commit quality gates and automated invariant suites:

1. **Security Secret Scan**: Scans all staged files before commit for AWS keys, API tokens, and private credentials.
2. **TypeScript Compilation**: Zero compilation or emit errors (\`tsc --noEmit\`).
3. **AST Component Math Checker (\`check:ui-math\`)**: Scans all React components to ensure zero derivation or arithmetic occurs inside UI layer.
4. **Banned Word & Claims Checker (\`check:pathways-claims\`)**: Scans source and reports for unevidenced marketing claims (\`guaranteed\`, \`proven\`, \`predicted\`, \`certified\`).
5. **Privacy & Telemetry Purge (\`tests/privacy-telemetry.test.ts\`)**: Guarantees zero remote analytics or tracking SDKs.
6. **Mutation Testing**: 100% kill score across all algorithmic engines.
`;

// 4. Write Markdown to docs/ and to Downloads
const mdTargetDocs = path.join(DOCS_DIR, 'HIREFLOW_COMPLETE_SYSTEM_CONTEXTUAL_BRIEF.md');
const mdTargetDownloads = path.join(DOWNLOADS_DIR, 'HIREFLOW_COMPLETE_SYSTEM_CONTEXTUAL_BRIEF.md');

fs.writeFileSync(mdTargetDocs, masterMarkdown, 'utf8');
fs.writeFileSync(mdTargetDownloads, masterMarkdown, 'utf8');
console.log(`✅ Wrote Markdown brief to: ${mdTargetDocs}`);
console.log(`✅ Downloaded Markdown brief to: ${mdTargetDownloads}`);

// 5. Generate Standalone Interactive Dark-Themed HTML with Print/Save-as-PDF support
function generateHtml(md) {
  // Convert Markdown to clean HTML
  let body = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  body = body.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<div class="code-wrapper">
      <div class="code-header">
        <span class="lang-tag">${lang || 'code'}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-wrapper').querySelector('code').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);">Copy</button>
      </div>
      <pre><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Inline code
  body = body.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  body = body.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>');
  body = body.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>');
  body = body.replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>');

  // Blockquotes
  body = body.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  body = body.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  body = body.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // HR
  body = body.replace(/^---$/gim, '<hr class="divider" />');

  // Tables
  body = body.replace(/((?:\|[^\n]+\|\n?)+)/g, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    let tableHtml = '<div class="table-container"><table>';
    lines.forEach((line, idx) => {
      if (idx === 1 && line.includes('---')) return;
      const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
      const tag = idx === 0 ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    });
    tableHtml += '</table></div>';
    return tableHtml;
  });

  // Unordered lists
  body = body.replace(/^\- (.*$)/gim, '<li>$1</li>');
  body = body.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireFlow: Complete System Contextual Brief & Rewiring Manual</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121215;
      --border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --volt: #22c55e;
      --volt-glow: rgba(34, 197, 94, 0.15);
      --amber: #f59e0b;
      --code-bg: #000000;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 32px 16px;
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-family: monospace;
      text-transform: uppercase;
      background: var(--volt-glow);
      color: var(--volt);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .print-btn {
      padding: 8px 16px;
      background: #18181b;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 12px;
      font-family: monospace;
      cursor: pointer;
      transition: background 0.2s;
    }
    .print-btn:hover { background: #27272a; color: #fff; }

    h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.02em; color: #ffffff; }
    h2 { font-size: 20px; font-weight: 700; margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; color: #ffffff; }
    h3 { font-size: 16px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #e4e4e7; }
    p { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }

    blockquote {
      background: var(--card-bg);
      border-left: 3px solid var(--volt);
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #d4d4d8;
      border-radius: 0 8px 8px 0;
    }

    .divider { border: none; border-top: 1px solid var(--border); margin: 32px 0; }

    .code-wrapper {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin: 16px 0 24px 0;
      overflow: hidden;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background: #18181b;
      border-bottom: 1px solid var(--border);
      font-size: 11px;
      font-family: monospace;
      color: var(--text-muted);
    }

    .copy-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      cursor: pointer;
    }
    .copy-btn:hover { color: #fff; border-color: #52525b; }

    pre {
      padding: 16px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #e4e4e7;
      max-height: 500px;
    }

    .inline-code {
      background: #18181b;
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #a7f3d0;
    }

    .table-container {
      overflow-x: auto;
      margin: 20px 0;
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }

    th {
      background: #18181b;
      padding: 10px 14px;
      font-weight: 600;
      color: #fff;
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid #1f1f23;
      color: #d4d4d8;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    ul, ol {
      padding-left: 20px;
      margin-bottom: 16px;
      font-size: 13.5px;
      color: var(--text-muted);
    }
    li { margin-bottom: 6px; }

    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .top-bar, .print-btn, .copy-btn { display: none; }
      pre { max-height: none; color: #000; background: #f4f4f5; }
      .code-wrapper { border-color: #ccc; }
      th { background: #eee; color: #000; }
      td { color: #222; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar">
      <span class="badge">HireFlow Architecture & Datasets</span>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
    ${body}
  </div>
</body>
</html>`;
}

console.log('Generating standalone interactive HTML document...');
const masterHtml = generateHtml(masterMarkdown);

const htmlTargetDocs = path.join(DOCS_DIR, 'HIREFLOW_COMPLETE_SYSTEM_CONTEXTUAL_BRIEF.html');
const htmlTargetDownloads = path.join(DOWNLOADS_DIR, 'HIREFLOW_COMPLETE_SYSTEM_CONTEXTUAL_BRIEF.html');

fs.writeFileSync(htmlTargetDocs, masterHtml, 'utf8');
fs.writeFileSync(htmlTargetDownloads, masterHtml, 'utf8');
console.log(`✅ Wrote HTML document to: ${htmlTargetDocs}`);
console.log(`✅ Downloaded HTML document to: ${htmlTargetDownloads}`);

console.log('🎉 Compilation complete! All files generated and downloaded to local machine.');
