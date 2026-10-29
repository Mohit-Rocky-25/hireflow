# Reach Out (Cold Outreach Generator) — As-Is Architecture & Discovery (Stage 0)

## 1. Executive Summary
This document records the as-is architecture, data schemas, routing, template library, and quality baseline of the Reach Out tool in HireFlow prior to the v2 rebuild. It establishes the empirical baseline against which all improvements in Stages 1–7 are measured.

---

## 2. File Inventory & Real Implementation

### Files Under `src/features/suite/outreach/`:
1. [ReachOutPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/ReachOutPage.tsx):
   - Primary page component routed at `/tools/reach-out`.
   - Length: 1,540 lines.
   - Contains navigation breadcrumb with Back (`←` to `/tools`) and Home (`/`) links.
   - Currently imports scenario groups, evidence presets, and renderer from `src/features/reach-out/`.
   - Manages interactive topic rail (12 scenario groups), evidence presets, channel filtering tabs, slot customization form, and clipboard/download actions.
2. [generateOutreach.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/generateOutreach.ts):
   - Pure slot-filling engine and grounded generator.
   - Length: 552 lines.
   - Implements `fillSlots`, `generateGroundedOutreach`, `generateOutreach` (overloaded), `extractSlotsFromProfile`, `detectBannedPhrases`, and `detectPlaceholders`.
   - Imports `src/data/suite/outreach-templates.json`.
3. [followUpAndSubjectAnalyzer.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/followUpAndSubjectAnalyzer.ts):
   - Utility for follow-up templates (day 3 nudge, day 7 value add, post-interview thank you) and subject line analysis.
4. [generateOutreach.test.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/outreach/__tests__/generateOutreach.test.ts):
   - Unit test suite (16 tests) covering slot filling, placeholder extraction, profile mapping, and grounded outreach.

### Related Data and Store Files:
- [outreach-templates.json](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/suite/outreach-templates.json): 50 templates across 5 channels.
- [outreachStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/store/tools/outreachStore.ts): Zustand store with `hireflow_tool_outreach_v3` local storage persistence.

---

## 3. Routing & Shared Profile Integration

### Routing
- Route: `/tools/reach-out` in [src/App.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/App.tsx#L137).
- Nav link: [src/pages/tools/ToolsHubPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/tools/ToolsHubPage.tsx#L67) under "Application & Outreach" (`id: 'reach-out'`, `cta: 'Generate Outreach'`).
- Localhost Navigator: [src/components/common/LocalhostNavigator.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/components/common/LocalhostNavigator.tsx#L106).
- Navigation back actions: Top header has standard icons linking to `/` (Home) and `/tools` (Tools Hub).

### Shared Profile Reading
- In `ReachOutPage.tsx`, profile is accessed via `const { profile } = useProfile()` from [src/features/suite/profile/ProfileContext.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/suite/profile/ProfileContext.tsx).
- `generateOutreach.ts` includes `extractSlotsFromProfile(profile, company, role)` which inspects:
  - `profile.identity.name`, `profile.identity.email`
  - `profile.education[0].institution`
  - `profile.identity.links` (github/portfolio)
  - `profile.skills` (top 2 canonical skills)
  - `profile.projects` and `profile.roles` (extracts metric bullets for proof point)

---

## 4. Reconciling the Brief vs. Real Code

| Aspect | Brief Description | Real Code Implementation | Resolution for v2 |
|---|---|---|---|
| **Template Count** | 15 templates (with 35 requested) | 50 templates currently in `outreach-templates.json` | Rebuild full library per taxonomy matrix (70-100 templates) ensuring D6 quality bar |
| **Channels / Tabs** | InMail, Cold Email, Alumni Network, Recruiter Follow-up | 5 channel keys: `linkedin_connect`, `linkedin_inmail`, `cold_email`, `direct_message`, `reply` | Preserve core tabs per D3: All Channels, LinkedIn Connect, LinkedIn InMail, Cold Email, Warm Referral, Follow-Up. Alumni and Recruiter become relationship/recipient filters |
| **Slot Names** | targetCompany, targetRole, recipientType, recipientName, primarySkill, admiredProject, proofPoint, college, portfolio | Mixed camelCase and snake_case (`company`, `recipient_name`, `targetCompany`, `recipientName`, `primary_skill`, `admired_project`, etc.) | Normalize slot names cleanly in v2 engine with complete bidirectional alias mapping |
| **LinkedIn Limit** | 300 characters default | Hardcoded 300 max length | Implement Free (200 char default) vs Premium (300 char) toggle per Evidence E1 |
| **Spam Filter** | Old keyword filter (`BANNED_OUTREACH_PHRASES`) | 15 canned phrases checked via substring matching | Replace with deterministic message-quality checker per Evidence E4 & Design D4 |

---

## 5. Actual Template Schema & Slot Interpolation

### Current Schema in `outreach-templates.json`:
```json
{
  "id": "recruiter-direct-note",
  "channel": "linkedin_connect",
  "name": "Recruiter Direct Note",
  "targetAudience": "Recruiter",
  "maxLength": 300,
  "template": "Hi {{recipient_name}}, saw your updates hiring for {{company}} engineering. I build with {{primary_skill}}, recently {{proof_point}}. Would value connecting here as relevant openings take shape.",
  "description": "Establish a direct connection with a technical recruiter...",
  "group": "first-touch-recruiters",
  "recipientTypes": ["Recruiter", "Campus Recruiter"],
  "openingMove": "observation",
  "askType": "connect",
  "toneNote": "Concise and respectful...",
  "altOpeners": ["..."],
  "whenToUse": "...",
  "whenNotToUse": "...",
  "sendWindowNote": "...",
  "followUpNote": "..."
}
```

### Slot Interpolation Defects Identified:
1. Interpolation uses regex replacement over an incomplete dictionary.
2. 15 template slots (e.g. `{{job_id}}`, `{{source_trigger}}`, `{{event_name}}`, `{{availability_date}}`) are not mapped in `generateOutreach.ts`, causing 720 of 1500 outputs to have raw leftover braces in Stage 0.3 test run.
3. No sound-based article selection (`a SDE`, `a ML intern`, `a UI engineer`).
4. Honorifics and name formatting are unhandled (leaving `Hi Dr. Vikram Sen` or mangling compound Indian names).

---

## 6. Template Audit Summary (All 50 Templates)

A full algorithmic scan across all 50 templates against Evidence E1–E6 and Design D6 standard revealed:
- **Generic Openers**: Found in 6 templates ("saw your updates", "noticed your focus", etc.).
- **Banned Claims / Hype Wording**: Found in description and tone notes ("high-converting", "pre-calibrated").
- **Cold Referral Violations**: 2 templates ask a stranger for a referral in cold outreach.
- **LinkedIn Connect Length Overflow**: 5 out of 5 LinkedIn Connect templates exceed 200 characters (E1 free limit) when filled with realistic candidate data (avg length: 228 characters).
- **Audit Verdict**: 100% of the 15 baseline templates and subsequent templates require rewrite to D6 block standard (hook, proof, ask, close) with variant phrasings.
