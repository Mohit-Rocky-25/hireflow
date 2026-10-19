# HireFlow v4: Manual Verification & QA Checklist

Comprehensive, rapid manual verification checklist for the project owner. Each requirement ID can be verified in ~2 minutes with explicit click-paths, expected outcomes, and testing notes.

---

## Testing Environment Setup
1. **Local Dev Server**: Run `npm run dev` (starts on `http://localhost:5173`).
2. **Production Preview (PWA & CSP)**: Run `npm run build && npm run preview` (starts on `http://localhost:4173`).
3. **LAN Testing (Mobile)**: Connect phone to the same Wi-Fi network and open `http://<YOUR_LAN_IP>:5173`.

---

## 1. Group A: Unified Intelligence & Cross-Tool Flow

### A1: One Shared Profile and Gap List
- [ ] **A1.1 Profile Storage & Multi-Version**:
  - **Path**: Navigate to `/data` or click avatar/profile icon in navigation -> View Active Profile.
  - **Action**: Add a new resume version ("Version 2 - Frontend Focus"), paste synthetic resume, set as active.
  - **Expected**: Active resume label updates to "Version 2". Maximum of 5 versions enforced; adding a 6th prompts to replace or delete.
  - **Result**: [PASS / FAIL]
- [ ] **A1.2 Cross-Tool Context Chip**:
  - **Path**: Navigate to `/tools/resume-roaster`, `/tools/jd-compare`, `/tools/tailor`.
  - **Expected**: Each tool displays top banner `Using: <active resume label> (change)`. Does not ask to re-upload.
  - **Result**: [PASS / FAIL]
- [ ] **A1.3 Deterministic Gap Derivation**:
  - **Path**: Run JD Compare with synthetic Fresher JD.
  - **Expected**: Open gaps list automatically populated with missing mandatory/preferred skills. Gaps close only after re-scanning resume containing the missing skills.
  - **Result**: [PASS / FAIL]
- [ ] **A1.4 Cross-Tool Gap Filtering**:
  - **Path**: Open `/tools/build-briefs` and `/tools/credential-engine`.
  - **Expected**: "For your gaps" filter is active by default; project briefs and credentials matching open gaps are prioritized.
  - **Result**: [PASS / FAIL]

### A2: Guided Improvement Loop
- [ ] **A2.1 5-Step Guided Loop**:
  - **Path**: Open ATS Resume Roaster -> Click "Start Guided Improvement".
  - **Action**: Step through Diagnose -> Prioritize -> Author -> Verify -> Progress. Enter accomplishment with metric (e.g., "Reduced latency by 45% using Redis").
  - **Expected**: Verifier prevents fabrication; before/after delta card shows metric score improvement.
  - **Result**: [PASS / FAIL]

### A3: Scan History & Progression
- [ ] **A3.1 Scan Auto-Recording**:
  - **Path**: Perform any scan in JD Compare or Resume Roaster -> Open `/history`.
  - **Expected**: Scan is logged with target name, timestamp, and score breakdown. No raw resume/JD text in storage (verified via DevTools Application tab).
  - **Result**: [PASS / FAIL]
- [ ] **A3.2 Progression Chart & Compare View**:
  - **Path**: In `/history`, select two scans for the same target and click "Compare".
  - **Expected**: Side-by-side diff displays pillar deltas, evidence level shifts, and closed gaps. Warning appears if targets or engine versions differ.
  - **Result**: [PASS / FAIL]

### A4: Saved JD Library & Demand Aggregation
- [ ] **A4.1 Saved JDs**:
  - **Path**: Open `/jd-library` -> Click "Add Job Description".
  - **Action**: Paste synthetic JD, add tags (`Frontend`, `Remote`), save.
  - **Expected**: JD is saved; duplicate JD text is deduplicated via SHA-256 hash. Maximum 40 JDs enforced.
  - **Result**: [PASS / FAIL]
- [ ] **A4.2 Cross-JD Market Demand**:
  - **Path**: Save 3 JDs in `/jd-library`.
  - **Expected**: "Demanded Skills across Saved JDs" table displays skills appearing in >= 3 JDs with demand count.
  - **Result**: [PASS / FAIL]

### A5: Fresher Role Presets & Branch Bridge
- [ ] **A5.1 Role Presets**:
  - **Path**: Open JD Compare -> Select "Use Role Preset" -> Choose "Campus SDE Fresher".
  - **Expected**: Requirements pre-populated with verified tier expectations and required skills.
  - **Result**: [PASS / FAIL]
- [ ] **A5.2 Branch Bridge Guidance**:
  - **Path**: In Role Presets, select ECE or Mechanical pivot option.
  - **Expected**: Actionable bridge guidance displayed (core CS theory needed, hardware-to-software project framing).
  - **Result**: [PASS / FAIL]

---

## 2. Group B: Explainability & Feedback

### B6: "How Is This Calculated?" & ExplainDrawer
- [ ] **B6.1 ExplainDrawer**:
  - **Path**: On any page with a derived score (e.g. ATS Score, Format Score, Trajectory estimate) -> Click the `(i)` info icon next to the number.
  - **Expected**: Slide-over Drawer opens showing exact mathematical formula, dynamic inputs with values, config threshold keys, confidence tier, and known limitations.
  - **Result**: [PASS / FAIL]

### B7: Scoring Methodology Page & Diagnostics
- [ ] **B7.1 Methodology Overview**:
  - **Path**: Open `/methodology` from the footer navigation.
  - **Expected**: Transparent pillar weights table, runtime constants, dataset provenance audit, zero-server privacy guarantee.
  - **Result**: [PASS / FAIL]
- [ ] **B7.2 Diagnostic Payload Generator**:
  - **Path**: In `/methodology`, click "Generate Diagnostic Report".
  - **Expected**: Produces sanitized JSON payload containing score breakdowns and anonymized character lengths; zero PII or resume text.
  - **Result**: [PASS / FAIL]

### B8: Local Finding Feedback
- [ ] **B8.1 Thumbs Up/Down & Notes**:
  - **Path**: In Resume Roaster findings list, click Thumbs Down on any finding -> Enter short note ("Misidentified acronym") -> Save.
  - **Expected**: Feedback stored in local `hireflow:v4:feedback` store (cap: 500 items). Scoring weights remain strictly unchanged (no feedback loop).
  - **Result**: [PASS / FAIL]

---

## 3. Group C: Platform, Performance & Device Polish

### C9: Export / Import All Local Data
- [ ] **C9.1 Data Management & Backup**:
  - **Path**: Open `/data`.
  - **Action**: Review stored data item counts -> Click "Export Backup".
  - **Expected**: Downloads `hireflow-backup-YYYY-MM-DD.json` containing tamper-evident SHA-256 checksum.
  - **Result**: [PASS / FAIL]
- [ ] **C9.2 Backup Tamper Test**:
  - **Action**: Open exported JSON in a text editor, alter one character in a data value, attempt to import via `/data`.
  - **Expected**: Import dialog warns "Checksum mismatch: file may be corrupted or tampered" and safely prevents automatic corruption.
  - **Result**: [PASS / FAIL]
- [ ] **C9.3 Clear All Data**:
  - **Action**: Click "Clear All Data" -> Type confirmation word "DELETE" -> Confirm.
  - **Expected**: All local storage stores reset completely; user redirected to clean initial state.
  - **Result**: [PASS / FAIL]

### C10: URL State & Deep Linking
- [ ] **C10.1 Wizard Deep Links**:
  - **Path**: Open `/tools/talentlens?step=2`.
  - **Expected**: Directly opens Step 2 (Company & Role selection). Browser Back/Forward buttons navigate steps without reloading page.
  - **Result**: [PASS / FAIL]
- [ ] **C10.2 Filter URL Persistence**:
  - **Path**: In `/jd-library?tag=Frontend&sort=name`, refresh the page.
  - **Expected**: Filter and sort state remain intact from search params.
  - **Result**: [PASS / FAIL]

### C11: Security, CSP & Hostile Payload Resistance
- [ ] **C11.1 Hostile Input Pasting**:
  - **Action**: Paste `<script>alert('xss')</script><img src=x onerror=alert(1)>` into resume or JD textarea -> Click scan.
  - **Expected**: Input rendered safely as inert text; zero alert dialogs; zero console errors.
  - **Result**: [PASS / FAIL]
- [ ] **C11.2 Production CSP Check**:
  - **Path**: Open production build in `http://localhost:4173` -> Open DevTools Console & Network.
  - **Expected**: Zero CSP violation warnings; PDF.js worker and Word extractor operate properly.
  - **Result**: [PASS / FAIL]

### C12: Mobile Pass (360px & 390px Viewports)
- [ ] **C12.1 Mobile Viewport Audit**:
  - **Path**: Open DevTools Device Toolbar -> Set dimensions to 360x800 and 390x844.
  - **Action**: Navigate through `/`, `/tools`, `/tools/resume-roaster`, `/tools/tailor`, `/jd-library`.
  - **Expected**: Zero horizontal overflow (`scrollWidth === innerWidth`); all buttons >= 44x44px; Drawer opens as bottom sheet; sticky action bar respects safe-area insets.
  - **Result**: [PASS / FAIL]

### C13: Code Splitting & Dynamic Imports
- [ ] **C13.1 Lazy Loading**:
  - **Path**: Open DevTools Network tab with JS filter enabled.
  - **Action**: Navigate from `/` to `/tools/tailor` -> Upload PDF resume.
  - **Expected**: Initial bundle is lightweight; `pdfjs-dist` and `mammoth` chunks are fetched strictly on-demand when file is selected.
  - **Result**: [PASS / FAIL]

### C14: PWA Installability & Offline Operation
- [ ] **C14.1 Desktop & Mobile Installability**:
  - **Path**: Open production preview in Chrome/Edge (`http://localhost:4173`).
  - **Expected**: Install icon appears in address bar ("Install HireFlow"). Valid manifest with 192, 512, and maskable icons.
  - **Result**: [PASS / FAIL]
- [ ] **C14.2 Offline Operation**:
  - **Path**: In DevTools Network tab, select "Offline" -> Reload page -> Run JD Compare scan with synthetic data.
  - **Expected**: App loads seamlessly from service worker cache; `<OfflineIndicator />` displays "Offline Mode — All tools work locally"; scan executes deterministically offline.
  - **Result**: [PASS / FAIL]
- [ ] **C14.3 Non-Intrusive Update Toast**:
  - **Action**: Trigger service worker update event.
  - **Expected**: `<PwaUpdateToast />` displays "Update Available: Reload". Does not auto-reload or disrupt active user edits.
  - **Result**: [PASS / FAIL]

---

## 4. Group D: Tool-Specific Depth Features

### D15: Tailor My Resume (ATS Parity & Pre-Export Quality Sentinel)
- [ ] **D15.1 Formatting Checker**:
  - **Path**: Open `/tools/tailor` -> Tailor synthetic resume -> Attempt export with overflowing content.
  - **Expected**: Quality sentinel flags warnings for line overflows or orphan headings before download.
  - **Result**: [PASS / FAIL]

### D16: ATS Resume Roaster (Annotated Character-Span View)
- [ ] **D16.1 Character-Span Annotator**:
  - **Path**: Open `/tools/resume-roaster` -> Run scan -> Toggle "Annotated View".
  - **Expected**: Weak verbs highlighted in red, run-on bullets in amber, metrics/skills in green. Clicking a highlighted span opens side rail with rationale and suggested replacement.
  - **Result**: [PASS / FAIL]

### D17: Build Briefs (Scaffold Generator & Progress Tracking)
- [ ] **D17.1 JSZip Scaffold Generator**:
  - **Path**: Open `/tools/build-briefs` -> Select any project brief -> Click "Download Starter Scaffold (.zip)".
  - **Expected**: Downloads valid ZIP archive generated client-side containing `README.md`, architecture diagram, configuration, and test files.
  - **Result**: [PASS / FAIL]
- [ ] **D17.2 Ledger Injection**:
  - **Path**: In Build Briefs, mark a project as "Completed" -> Click "Add to Resume".
  - **Expected**: Inserts structured project bullet with `[METRIC]` placeholders directly into active resume draft.
  - **Result**: [PASS / FAIL]

### D18: Credential Opportunity Engine (iCalendar Export)
- [ ] **D18.1 .ics Calendar Export**:
  - **Path**: Open `/tools/credential-engine` -> Add target exam date -> Click "Export to Calendar (.ics)".
  - **Expected**: Generates client-side RFC 5545 `.ics` file containing official verified dates and user target milestones.
  - **Result**: [PASS / FAIL]

### D19: TalentLens (Saved Roles & Prefill to JD Compare)
- [ ] **D19.1 Saved Roles & Prefill**:
  - **Path**: Open `/tools/talentlens` -> Save 2 roles -> Open "Saved Roles" tab -> Click "Send to JD Compare".
  - **Expected**: Navigates to `/tools/jd-compare` with role requirements prefilled for immediate scanning.
  - **Result**: [PASS / FAIL]

### D20: Career Trajectory (What-If Scenarios & Cutoff Gate)
- [ ] **D20.1 What-If Simulator**:
  - **Path**: Open `/tools/career-path` -> Open What-If Scenario simulator -> Adjust CGPA slider from 6.5 to 8.5.
  - **Expected**: Eligible career routes update in real-time; corporate campus cutoffs clearly indicated; zero success probabilities (honest ranges only).
  - **Result**: [PASS / FAIL]

### D21: Reach Out (Deterministic Follow-Ups & Subject Analyzer)
- [ ] **D21.1 Follow-Up & Cold Email Generator**:
  - **Path**: Open `/tools/reachout`.
  - **Expected**: Generates Day 3, Day 7, and post-interview follow-ups using only grounded candidate facts with `[FILL_IN]` placeholders; cold email subject line analyzer evaluates length and spam triggers.
  - **Result**: [PASS / FAIL]

---

## 5. Phone-over-LAN Testing (Plain HTTP Protocol)
- [ ] **LAN Fallbacks (P-13)**:
  - **Action**: Open app on mobile browser over `http://<IP>:5173`.
  - **Expected**: App functions smoothly; ID generation falls back gracefully to high-entropy counter; hashing falls back to FNV-1a; service worker logs notice without crashing; Your Data page indicates "Some offline features need https or localhost".
  - **Result**: [PASS / FAIL]
