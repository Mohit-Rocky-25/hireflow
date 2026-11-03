const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const reportDate = 'November 4, 2026';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HireFlow TalentLens™ — Complete Context, Public Marketing Playbook & Launch Guide</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
        font-size: 8pt;
        color: #71717a;
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9pt;
      line-height: 1.55;
      color: #18181b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4 {
      color: #09090b;
      font-weight: 700;
      line-height: 1.25;
      margin-top: 14pt;
      margin-bottom: 5pt;
    }
    h1 {
      font-size: 20pt;
      letter-spacing: -0.03em;
      margin-top: 0;
      margin-bottom: 3pt;
    }
    h2 {
      font-size: 13pt;
      border-bottom: 1.5px solid #e4e4e7;
      padding-bottom: 4pt;
      margin-top: 18pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      margin-top: 12pt;
      page-break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 7pt;
    }
    .page-break {
      page-break-before: always;
    }
    .hero-banner {
      background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
      color: #ffffff;
      padding: 20pt 22pt;
      border-radius: 6pt;
      margin-bottom: 16pt;
    }
    .hero-banner h1 {
      color: #ffffff;
      margin: 0 0 4pt 0;
    }
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 14pt;
      margin-top: 10pt;
      font-size: 8pt;
      color: #a1a1aa;
      border-top: 1px solid #27272a;
      padding-top: 8pt;
    }
    .hero-meta span strong {
      color: #f4f4f5;
    }
    .badge {
      display: inline-block;
      padding: 2pt 6pt;
      border-radius: 3pt;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-volt { background: #f7fee7; color: #4d7c0f; border: 1px solid #bef264; }
    .badge-dark { background: #27272a; color: #f4f4f5; border: 1px solid #3f3f46; }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10pt;
      margin: 8pt 0 12pt 0;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8pt;
      margin: 8pt 0 12pt 0;
    }
    .card {
      border: 1px solid #e4e4e7;
      border-radius: 5pt;
      padding: 10pt 12pt;
      background: #fafafa;
    }
    .card-dark {
      border: 1px solid #27272a;
      border-radius: 5pt;
      padding: 10pt 12pt;
      background: #18181b;
      color: #f4f4f5;
    }
    .card-dark h4 {
      color: #ffffff;
      margin-top: 0;
    }
    .card h4 {
      margin-top: 0;
      margin-bottom: 4pt;
      font-size: 9.5pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin: 8pt 0 12pt 0;
    }
    th, td {
      border: 1px solid #e4e4e7;
      padding: 5.5pt 7pt;
      text-align: left;
    }
    th {
      background: #f4f4f5;
      font-weight: 700;
      color: #09090b;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .highlight-box {
      border-left: 3.5px solid #16a34a;
      background: #f0fdf4;
      padding: 8pt 11pt;
      border-radius: 0 4pt 4pt 0;
      margin: 8pt 0 12pt 0;
      font-size: 8.5pt;
    }
    .warning-box {
      border-left: 3.5px solid #eab308;
      background: #fefce8;
      padding: 8pt 11pt;
      border-radius: 0 4pt 4pt 0;
      margin: 8pt 0 12pt 0;
      font-size: 8.5pt;
    }
    .quote-box {
      border-left: 3.5px solid #3b82f6;
      background: #eff6ff;
      padding: 8pt 11pt;
      border-radius: 0 4pt 4pt 0;
      margin: 8pt 0 12pt 0;
      font-size: 8.5pt;
      font-style: italic;
    }
    ul, ol {
      margin-top: 2pt;
      margin-bottom: 8pt;
      padding-left: 16pt;
    }
    li {
      margin-bottom: 3pt;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      background: #f4f4f5;
      padding: 1.5pt 3pt;
      border-radius: 3pt;
      border: 1px solid #e4e4e7;
    }
    .tag {
      display: inline-block;
      padding: 1.5pt 4.5pt;
      border-radius: 2.5pt;
      background: #e4e4e7;
      color: #18181b;
      font-size: 7.5pt;
      font-family: monospace;
      margin: 1.5pt;
    }
  </style>
</head>
<body>

  <!-- HERO BANNER -->
  <div class="hero-banner">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <span class="badge badge-volt">HireFlow Master Feature Guide</span>
        <h1 style="margin-top: 6pt;">TalentLens™: Comprehensive Context &amp; Public Launch Playbook</h1>
        <p style="margin: 0; font-size: 10pt; color: #d4d4d8;">
          Everything inside HireFlow's flagship Candidate Intelligence Engine — What it is, how it works, complete feature breakdown, and how to market it honestly to engineers, students, and recruiters.
        </p>
      </div>
    </div>
    <div class="hero-meta">
      <span><strong>Product:</strong> HireFlow TalentLens™</span>
      <span><strong>Version:</strong> v2.4 (Engine Stage 4/5)</span>
      <span><strong>Snapshot:</strong> October 2026 Audit</span>
      <span><strong>Privacy:</strong> 100% Client-Side (Zero Egress)</span>
      <span><strong>Coverage:</strong> 235 Full Employer Profiles</span>
    </div>
  </div>

  <!-- CHAPTER 1 -->
  <h2>1. Executive Summary: What TalentLens Actually Is</h2>
  <p>
    <strong>TalentLens™</strong> is HireFlow’s signature candidate-side career intelligence and role simulation engine. It was engineered specifically to solve the core asymmetry in modern tech hiring: <strong>candidates have no transparent way to know whether their resume genuinely satisfies an employer’s engineering criteria before applying.</strong>
  </p>
  <p>
    Existing market tools (Jobscan, Rezi, Teal) treat ATS evaluation as shallow keyword counting: if a job description contains the word "Kafka" five times, they tell the candidate to paste "Kafka" five times into their resume. In contrast, real engineering recruiters and ATS parsers look for <strong>evidenced scope, technical competencies, scale metrics, and level alignment</strong>.
  </p>

  <div class="highlight-box">
    <strong>Core Philosophy:</strong> TalentLens does not sell "shortcuts" or "keyword stuffing hacks". It acts as an objective, evidence-grounded mirror that compares a candidate's verified experience against calibrated level expectations across 235+ premier tech employers in India and globally.
  </div>

  <div class="grid-3">
    <div class="card">
      <h4>🔒 100% Zero-Egress Privacy</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        The entire evaluation engine runs locally in the candidate's browser via client-side TypeScript. Your resume text, contact details, and career history never leave your computer. No cloud logging, no data reselling.
      </p>
    </div>
    <div class="card">
      <h4>🏢 235+ Calibrated Employers</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Pre-mapped career ladders, salary estimate bands, core competencies, and interview loops for Google India, Microsoft, Netflix India, Paytm, Flipkart, Swiggy, Zomato, CRED, Razorpay, and more.
      </p>
    </div>
    <div class="card">
      <h4>🛠️ Multi-Option Project Bridge</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Pinpoints exact skill gaps and provides 3 to 4 distinct, production-grade project options (Distributed Systems, Cloud-Native, FinTech, Data Streaming) so candidates can pick a track to close their gaps.
      </p>
    </div>
  </div>

  <!-- CHAPTER 2 -->
  <h2>2. Complete Feature &amp; Capability Inventory (What is Inside TalentLens)</h2>
  <p>
    TalentLens integrates eight distinct subsystems into a unified, interactive decision workspace for candidates and recruiters:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Subsystem</th>
        <th style="width: 48%;">Functionality &amp; Capabilities</th>
        <th style="width: 30%;">User Benefit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Calibrated Employer Directory</strong></td>
        <td>235 comprehensive engineering company profiles with level codes (L3–L7, SDE-1 to Principal), office hubs (Bengaluru, Hyderabad, Pune, Gurugram), and sector tags.</td>
        <td>Candidates can select their exact target company and view calibrated role expectations.</td>
      </tr>
      <tr>
        <td><strong>2. 6-Layer Deep AI Scoring</strong></td>
        <td>Deterministic multi-dimensional assessment: Must-Have Skills, Contextual Evidence, Seniority (YoE) Fit, Impact Scale Metrics, Architecture Alignment, and Eligibility Gate.</td>
        <td>Replaces arbitrary 0–100 scores with transparent, reproducible, mathematically verifiable sub-scores.</td>
      </tr>
      <tr>
        <td><strong>3. Competency Signals Bank</strong></td>
        <td>20+ deep technical competency profiles (DSA, System Design, Concurrency, Java/Spring, Python/FastAPI, Go, Kubernetes, Security, FinTech, ML Pipelines, Databases).</td>
        <td>Differentiates between actual hands-on engineering experience vs superficial keyword mentions.</td>
      </tr>
      <tr>
        <td><strong>4. Anti-Stuffing &amp; Authenticity Gate</strong></td>
        <td>Analyzes contextual experience verbs (built, architected, optimized, scaled) versus bare keyword spamming. Calculates keyword-to-context ratios.</td>
        <td>Protects candidates from getting penalized or flagged by recruiter human reviews for artificial resume bloating.</td>
      </tr>
      <tr>
        <td><strong>5. 4-Tab Diagnostic Feedback</strong></td>
        <td>
          <strong>Overview:</strong> Recruiter recommendations &amp; action plan.<br>
          <strong>Requirements:</strong> Strong, Partial, Uncertain, Missing breakdown.<br>
          <strong>Skill Gaps:</strong> Why it matters, missing evidence &amp; fixes.<br>
          <strong>Interview Questions:</strong> Simulated technical questions per gap.
        </td>
        <td>Gives candidates an end-to-end interview preparation roadmap tailored to their exact weak points.</td>
      </tr>
      <tr>
        <td><strong>6. Multi-Option Project Bridge</strong></td>
        <td>Dynamically maps left-out skills into 3 to 4 diverse production architectures (Distributed Systems, Cloud-Native, FinTech Ledger, Real-Time Streaming) with complete scale metrics.</td>
        <td>Candidates choose the stack and architectural domain they prefer to build and prove their missing skills.</td>
      </tr>
      <tr>
        <td><strong>7. Salary &amp; Compensation Bands</strong></td>
        <td>Base pay, annual performance bonus, and equity/ESOP estimate ranges calibrated to the Indian tech market (in ₹ Lakhs per Annum / CTC).</td>
        <td>Equips candidates with realistic salary negotiation benchmarks across company tiers (FAANG vs Unicorn vs MNC).</td>
      </tr>
      <tr>
        <td><strong>8. Reality Factors &amp; Fresher Checks</strong></td>
        <td>Checks college tier bias reality factors, hiring freeze notices, notice period constraints, and fresher portfolio requirements.</td>
        <td>Honest, ground-reality insights without sugarcoating market competition.</td>
      </tr>
    </tbody>
  </table>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- CHAPTER 3 -->
  <h2>3. The 6-Layer Deep AI Analysis Engine: How It Thinks</h2>
  <p>
    Unlike black-box LLM wrappers that generate vague paragraphs, TalentLens evaluates a resume through a deterministic, 6-layer pipeline governed by the <code>CANONICAL_SCORING_SPEC</code>:
  </p>

  <div class="grid-2">
    <div class="card">
      <h4>Layer 1: Hard Must-Haves vs Preferred</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Extracts mandatory requirements (e.g. "3+ years production Go", "Kafka event streaming") and separates them from optional "nice-to-haves". Missing a mandatory skill drops candidate eligibility regardless of other strengths.
      </p>
    </div>
    <div class="card">
      <h4>Layer 2: Contextual Experience Verification</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Checks whether each skill token appears inside an active engineering action sentence (e.g. <em>"Architected distributed idempotency gateway in Go using Redis cluster"</em>) rather than an isolated bullet list.
      </p>
    </div>
    <div class="card">
      <h4>Layer 3: Seniority &amp; YoE Calibration</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Extracts candidate graduation year and work experience dates. Calibrates candidate experience against company level codes (e.g., Google L3 vs L4; Swiggy SDE-1 vs SDE-2) to prevent over-leveling or under-leveling.
      </p>
    </div>
    <div class="card">
      <h4>Layer 4: Scale &amp; Impact Metrics Parsing</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Scans bullets for verifiable engineering scale signals: throughput (RPS, QPS), latency reduction (sub-20ms, p99), data volume (TB/day), concurrency (goroutines, threads), and infrastructure cost savings (%).
      </p>
    </div>
    <div class="card">
      <h4>Layer 5: Architectural Domain Synergy</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Evaluates domain alignment: Does a candidate targeting an Event-Driven Distributed Systems role demonstrate outbox patterns, message ordering, and partition rebalancing? Or just CRUD APIs?
      </p>
    </div>
    <div class="card">
      <h4>Layer 6: The Eligibility Gate</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        Separates <strong>Strict Eligibility</strong> (batch year, degrees, legal requirements) from <strong>Topical Relevance</strong> (skills and tools) and <strong>Scoring Confidence</strong> (based on word count &amp; evidence clarity).
      </p>
    </div>
  </div>

  <!-- CHAPTER 4 -->
  <h2>4. The Multi-Option Project Bridge: Solving Skill Gaps with Choice</h2>
  <p>
    A recent major upgrade to TalentLens resolved the "Single-Project Trap". Previously, recommendation algorithms selected a single project covering most skills and left subsequent cards empty.
  </p>
  <p>
    TalentLens now employs a <strong>Multi-Option Path Strategy</strong>:
  </p>
  <ul>
    <li><strong>Every option closes candidate gaps:</strong> If a candidate lacks <em>Kafka, Redis, and Docker</em>, all 3 to 4 recommended project options cover those missing skills. No more filler cards with 0% coverage.</li>
    <li><strong>Candidate stack personalization:</strong> A Java/Spring Boot candidate receives high-scale enterprise ledger and transaction saga options. A Python/FastAPI candidate receives streaming ML pipelines and LLM feature stores. A Go candidate receives low-latency concurrency engines.</li>
    <li><strong>4 Distinct Architectural Tracks:</strong>
      <ol style="margin-top: 4pt;">
        <li><code>Option 1 · Distributed Systems &amp; Concurrency Track</code> (High-throughput caching, rate-limiting &amp; consensus).</li>
        <li><code>Option 2 · AI/ML Systems &amp; Inference Pipeline Track</code> (Vector search, streaming LLM workflows, feature stores).</li>
        <li><code>Option 3 · FinTech &amp; High-Integrity Ledger Track</code> (Double-entry accounting, ACID transactions &amp; audit trails).</li>
        <li><code>Option 4 · Cloud-Native &amp; Container Orchestration Track</code> (Kubernetes, containerized microservices &amp; CI/CD).</li>
      </ol>
    </li>
  </ul>

  <!-- CHAPTER 5 -->
  <h2>5. How to Market TalentLens to the Public (GTM Strategy)</h2>
  <p>
    Marketing tech tools to developers and college students requires radical honesty. Software engineers are immediately turned off by generic marketing buzzwords like <em>"AI magic"</em>, <em>"100% interview guarantee"</em>, or <em>"secret recruiter hack"</em>.
  </p>

  <div class="grid-2">
    <div class="card">
      <h4>🎯 Target Audiences</h4>
      <ul>
        <li><strong>Pre-Final &amp; Final Year Engineering Students (India):</strong> Tier-1, Tier-2, and Tier-3 college students preparing for campus placements or off-campus product company drives.</li>
        <li><strong>Service-to-Product Switchers (1–4 YoE):</strong> Engineers at IT services companies (TCS, Infosys, Wipro, Cognizant) aiming to crack Tier-1 product firms and unicorns.</li>
        <li><strong>Experienced Engineers (4–8 YoE):</strong> Mid-level developers targeting SDE-2 or Senior SDE salary jumps and architectural rounds.</li>
      </ul>
    </div>
    <div class="card">
      <h4>⚡ Core Value Propositions (Hooks)</h4>
      <ul>
        <li><strong>"The Anti-BS ATS Checker":</strong> Don't just count keywords. See what engineering recruiters look for in code and architecture.</li>
        <li><strong>"Zero Egress, Total Privacy":</strong> Your resume never touches a third-party server. Runs 100% in your browser.</li>
        <li><strong>"Calibrated to 235+ Indian Employers":</strong> Specific level ladders for Google, Microsoft, Swiggy, Zomato, Razorpay, CRED, Paytm.</li>
        <li><strong>"From Gaps to Code":</strong> Get production-grade GitHub project briefs to close every missing requirement.</li>
      </ul>
    </div>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- CHAPTER 6 -->
  <h2>6. Launch Campaign &amp; Ready-to-Use Public Copy</h2>

  <h3>A. Product Hunt &amp; Hacker News Launch Post Copy</h3>
  <div class="card-dark">
    <h4>Title: HireFlow TalentLens — Honest, zero-egress ATS &amp; competency mirror for Indian tech careers</h4>
    <p style="font-size: 8pt; color: #a1a1aa; line-height: 1.5;">
      Hey everyone 👋 I'm Mohit, a student engineer who got tired of job hunting tools that do one of two things: charge ₹2,000/month to count keywords, or secretly upload your resume to third-party AI APIs.<br><br>
      So I built <strong>TalentLens</strong> as part of <strong>HireFlow</strong> — a 100% free, client-side candidate intelligence engine calibrated specifically for Indian software engineering hiring.<br><br>
      <strong>What makes it different:</strong><br>
      1. <strong>Zero-Egress Privacy:</strong> Every single analysis happens directly in your browser. Disconnect your Wi-Fi, and it still evaluates your resume.<br>
      2. <strong>235+ Calibrated Employer Ladders:</strong> Real levels, core competencies, and compensation estimate bands for Google India, Netflix India, Microsoft, Swiggy, Paytm, Razorpay, CRED, and 230+ more.<br>
      3. <strong>Anti-Keyword Stuffing Gate:</strong> Distinguishes real engineering sentences from spammed buzzword lists.<br>
      4. <strong>Multi-Option Project Bridge:</strong> Identifies your skill gaps and gives you 3–4 production project architectures (Distributed Systems, Cloud-Native, FinTech, Streaming) so you can build them on GitHub and prove your skills.<br><br>
      Try it free on localhost or web — no sign-up or credit card required. I’d love your brutal feedback!
    </p>
  </div>

  <h3>B. LinkedIn Announcement Post Copy</h3>
  <div class="card">
    <p style="font-size: 8.5pt; color: #27272a; line-height: 1.5; margin: 0;">
      🚀 <strong>Stop guessing what tech recruiters look for. Introducing TalentLens on HireFlow.</strong><br><br>
      Every engineering student has been told: <em>"Beat the ATS by adding keywords."</em><br>
      Here is the harsh reality: Recruiters at Tier-1 product companies and unicorns don't read keyword lists — they look for <strong>evidence of scope, scale metrics, and level readiness</strong>.<br><br>
      I built <strong>TalentLens</strong> to give candidates the exact same clarity recruiters have:<br>
      🔹 <strong>235+ Calibrated Company Ladders:</strong> See what SDE-1 vs SDE-2 actually requires across top tech employers.<br>
      🔹 <strong>Zero Egress Privacy:</strong> 100% on-device evaluation. Your resume never leaves your computer.<br>
      🔹 <strong>4-Tab Deep Feedback:</strong> Recruiter summary, requirements breakdown, skill gaps, and interview questions.<br>
      🔹 <strong>Multi-Option Project Paths:</strong> Don't just look at red flags — choose from 3–4 production engineering projects to build and prove your skills on GitHub.<br><br>
      Check it out locally or visit the repo: <code>https://github.com/Mohit-Rocky-25/hireflow</code><br>
      #SoftwareEngineering #Placements #CareerTech #OpenSource #HireFlow
    </p>
  </div>

  <h3>C. 3-Minute Video / Live Demo Script</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Timestamp</th>
        <th style="width: 30%;">On-Screen Visual</th>
        <th style="width: 55%;">Voiceover Script</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>0:00 – 0:30</strong></td>
        <td>Landing page showing calibrated employers bar (Google, Netflix, Swiggy, Paytm).</td>
        <td>"Most candidates apply to tech companies blindly. They don't know if their resume meets the competency bar, or why they get rejected. This is TalentLens on HireFlow."</td>
      </tr>
      <tr>
        <td><strong>0:30 – 1:15</strong></td>
        <td>Selecting Netflix India / Paytm $\to$ Uploading sample resume $\to$ Instant evaluation.</td>
        <td>"Watch this: I select a target role like Senior Backend Engineer at Netflix India. I drop in my resume. Notice there is zero network latency because the engine runs entirely inside my browser with zero egress."</td>
      </tr>
      <tr>
        <td><strong>1:15 – 2:00</strong></td>
        <td>Deep 4-tab report: Strong vs Missing requirements, Interview Questions tab.</td>
        <td>"Instead of a fake 95% match score, TalentLens breaks down the truth: Strong matches, partial evidence, and exact missing requirements. It even generates the technical interview questions a recruiter will ask based on those gaps."</td>
      </tr>
      <tr>
        <td><strong>2:00 – 2:45</strong></td>
        <td>Multi-Option Project Bridge showing Option 1, Option 2, Option 3, Option 4 cards.</td>
        <td>"Here's the best part: the Multi-Option Project Bridge. It doesn't just tell me I lack Kafka or Redis. It gives me 4 distinct project options: a Distributed Systems track in Go, an Event-Driven Saga in Java, an ML feature store in Python, or a Cloud-Native platform. I can choose either option, click Build Brief, and follow the production architecture."</td>
      </tr>
      <tr>
        <td><strong>2:45 – 3:00</strong></td>
        <td>GitHub repo and zero-egress privacy disclaimer.</td>
        <td>"HireFlow is 100% open source and privacy-first. Try TalentLens today and take control of your engineering career."</td>
      </tr>
    </tbody>
  </table>

  <!-- CHAPTER 7 -->
  <h2>7. Candidate FAQ (Pre-Empting Public Questions)</h2>
  <div class="grid-2">
    <div class="card">
      <h4>Q: Is TalentLens really free?</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        <strong>A:</strong> Yes, 100% free and open-source. There are no paywalls, subscriptions, or hidden charges. It was built as a transparent community tool.
      </p>
    </div>
    <div class="card">
      <h4>Q: Does my resume leave my machine?</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        <strong>A:</strong> No. HireFlow enforces a strict Zero-Egress rule verified by automated static scanners. Your resume is parsed and scored in your local browser memory.
      </p>
    </div>
    <div class="card">
      <h4>Q: How accurate are the salary numbers?</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        <strong>A:</strong> Salary figures are clearly labelled as estimates based on public compensation reports and community disclosures. Actual offers depend on candidate negotiation, campus tier, and experience.
      </p>
    </div>
    <div class="card">
      <h4>Q: Are you affiliated with Google, Netflix, or Swiggy?</h4>
      <p style="font-size: 8pt; color: #52525b; margin: 0;">
        <strong>A:</strong> No. HireFlow is an independent project. Company names and logos are used strictly for nominative identification of employer engineering tracks.
      </p>
    </div>
  </div>

  <div style="margin-top: 25pt; padding-top: 10pt; border-top: 1px solid #e4e4e7; display: flex; justify-content: space-between; font-size: 8pt; color: #71717a;">
    <div><strong>HireFlow Engineering &amp; Product:</strong> Mohit &bull; Lead Engineer</div>
    <div><strong>Document Type:</strong> Master Product &amp; Launch Guide &bull; Generated locally</div>
  </div>

</body>
</html>`;

const tempHtmlPath = path.join(rootDir, 'TALENTLENS_COMPLETE_PUBLIC_GUIDE_TEMP.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

const outputPdf = path.join(rootDir, 'TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf');
const publicPdf = path.join(rootDir, 'public/downloads/TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf');
const userDownloadsPdf = 'C:/Users/yadav/Downloads/TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log('Rendering PDF using:', browserExe);

const cmd = `"${browserExe}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPdf}" "${tempHtmlPath}"`;

try {
  execSync(cmd, { stdio: 'pipe' });
  const size = fs.statSync(outputPdf).size;
  console.log('Successfully generated PDF:', outputPdf, `(${size} bytes)`);

  // Ensure public/downloads directory exists
  fs.mkdirSync(path.join(rootDir, 'public/downloads'), { recursive: true });

  // Copy to public/downloads and user's local Downloads folder
  fs.copyFileSync(outputPdf, publicPdf);
  fs.copyFileSync(outputPdf, userDownloadsPdf);

  console.log('Copied PDF to:');
  console.log('1. User Downloads: C:/Users/yadav/Downloads/TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf');
  console.log('2. Public Downloads: public/downloads/TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf');
  console.log('3. Project Root: TALENTLENS_COMPLETE_PUBLIC_GUIDE.pdf');

  // Clean up temp HTML
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
} catch (e) {
  console.error('Error rendering PDF:', e.message);
  process.exit(1);
}
