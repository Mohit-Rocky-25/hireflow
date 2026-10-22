# Reach Out Reconnaissance Note (Stage 0)

## 1. Executive Summary & File Map
The "Reach Out" tool in HireFlow generates deterministic cold outreach messages across communication channels (LinkedIn, email, referrals, follow-ups).

### File Map
- **UI View**: `src/features/suite/outreach/ReachOutPage.tsx` (Route: `/tools/reach-out`, registered in `src/App.tsx`)
- **Generation Engine**: `src/features/suite/outreach/generateOutreach.ts`
- **Template Library**: `src/data/suite/outreach-templates.json`
- **Follow-Up & Subject Line Engine**: `src/features/suite/outreach/followUpAndSubjectAnalyzer.ts`
- **Engine Tests**: `src/features/suite/outreach/__tests__/generateOutreach.test.ts`
- **Follow-Up Tests**: `tests/reachout/followups.test.ts`
- **Hub Navigation & Entry**: `src/pages/tools/ToolsHubPage.tsx`
- **Global Design Tokens**: `src/index.css` (Tailwind v4 theme tokens and scoped dark mode tokens)
- **Shared Components & Utilities**: `src/components/career-path/CareerPathBackButton.tsx` (Back and Home button styling with black press effect)

---

## 2. Current 15 Baseline Templates
The current baseline contains 15 templates across 5 channels:

| ID | Name | Channel | Target Audience | Length Limit |
|---|---|---|---|---|
| `li-conn-recruiter` | Recruiter Direct Note | `linkedin_connect` | Recruiter | 300 chars |
| `li-conn-manager` | Hiring Manager Project Hook | `linkedin_connect` | Hiring Manager | 300 chars |
| `li-conn-alumni` | Alumni Common Ground | `linkedin_connect` | Alumnus | 300 chars |
| `li-inmail-recruiter` | Recruiter InMail Value Proposition | `linkedin_inmail` | Recruiter | Unlimited (120 words recommended) |
| `li-inmail-engineer` | Peer Engineer Tech Conversation | `linkedin_inmail` | Peer Engineer | Unlimited |
| `li-inmail-manager` | Hiring Manager High-Impact Pitch | `linkedin_inmail` | Hiring Manager | Unlimited |
| `email-cold-pitch` | Cold Email Direct Role Application | `cold_email` | Recruiter | Unlimited (Email body + Subject) |
| `email-hiring-manager` | Cold Email Solutions & Problem Solving | `cold_email` | Hiring Manager | Unlimited (Email body + Subject) |
| `email-recruiter-fast` | Cold Email Scannable Bullet Pitch | `cold_email` | Recruiter | Unlimited (Email body + Subject) |
| `ref-alumni-warm` | Alumni Warm Referral Ask | `warm_referral` | Alumnus | Unlimited |
| `ref-second-degree` | Mutual Connection / Peer Referral | `warm_referral` | Peer Engineer | Unlimited |
| `ref-manager-intro` | Referral Recommendation via Team Lead | `warm_referral` | Hiring Manager | Unlimited |
| `followup-gentle` | Gentle Follow-Up (Day 5-7) | `follow_up` | Recruiter | Unlimited (~60 words) |
| `followup-new-milestone` | Value-Add Follow-Up with Update | `follow_up` | Hiring Manager | Unlimited |
| `followup-closing-loop` | Final Polite Loop Closure | `follow_up` | Recruiter | Unlimited |

---

## 3. Current Slot Names
The current slot filling engine supports the following 13 slots:
1. `recipientName`: Name of recipient (e.g. "Vikram", fallback: `[Recipient Name]`)
2. `recipientRole`: Recipient category (`Recruiter`, `Hiring Manager`, `Peer Engineer`, `Alumnus`)
3. `recipientTitle`: Specific role title (fallback: `[Title, e.g. Senior Software Engineer]`)
4. `targetCompany`: Company name (fallback: `[Target Company]`)
5. `targetRole`: Target position (fallback: `[Target Role]`)
6. `primarySkill`: Candidate's key tech stack (fallback: `[Your Primary Stack, e.g. React & TypeScript]`)
7. `proofPoint`: Quantified evidence bullet (fallback: `[Your #1 quantified achievement...]`)
8. `commonGround`: Shared domain/tech topic (fallback: `[Shared open-source / tech domain interest]`)
9. `collegeName`: Educational institution (fallback: `[Your College / University]`)
10. `admiredProject`: Team feature or system admired (fallback: `[Specific feature or open-source tool you admired]`)
11. `portfolioLink`: GitHub / portfolio URL (fallback: `[Portfolio / GitHub Link]`)
12. `candidateName`: Sender name (fallback: `[Your Name]`)
13. `candidateEmail`: Sender email (fallback: `[Your Email]`)

---

## 4. Current Character-Limit Logic
- In `generateOutreach.ts`, each template optionally defines `maxLength?: number`.
- LinkedIn Connection requests specify `maxLength: 300`.
- Length evaluation:
  - `charCount = body.length`
  - `wordCount = body.split(/\s+/).filter(Boolean).length`
  - `exceedsLimit = item.maxLength !== undefined && charCount > item.maxLength`
- In `ReachOutPage.tsx`:
  - Visual progress bar displays `Math.min(100, (charCount / 300) * 100)`.
  - Progress bar color transitions from `bg-primary` (under 270 chars) to `bg-amber-500` (> 270 chars) to `bg-red-500` (> 300 chars).
  - Character counter badge renders `${300 - charCount} left` or `OVER LIMIT`.

---

## 5. Mojibake Audit
All occurrences of corrupted characters in the repository are cataloged below:

| File | Line | Corrupted String | Correct Character / Fix |
|---|---|---|---|
| `src/features/suite/outreach/ReachOutPage.tsx` | 2 | `Suite UI ΓÇö Reach Out` | Hyphen or comma (`// Suite UI - Reach Out`) |
| `src/features/suite/outreach/ReachOutPage.tsx` | 174 | `Reach Out ΓÇö Cold Outreach Generator` | Hyphen (`Reach Out: Cold Outreach Generator`) |
| `src/features/suite/outreach/ReachOutPage.tsx` | 376 | `<span>┬╖</span>` | Middot `·` or plain hyphen |
| `src/features/suite/outreach/ReachOutPage.tsx` | 440 | `Ready to send ΓÇö 0 placeholders remaining` | Hyphen or comma (`Ready to send: 0 placeholders remaining`) |
| `src/features/suite/outreach/generateOutreach.ts` | 2 | `HireFlow Suite ΓÇö Cold Outreach Generator` | Hyphen (`// HireFlow Suite - Cold Outreach Generator`) |
| `src/features/suite/outreach/generateOutreach.ts` | 88 | `^[*\-ΓÇóΓû¬ΓùÅ\d.]+\s*` | Unicode bullet classes `•▪●` |
| `src/features/suite/outreach/generateOutreach.ts` | 96 | `^[*\-ΓÇóΓû¬ΓùÅ\d.]+\s*` | Unicode bullet classes `•▪●` |
| `src/data/suite/outreach-templates.json` | 32 | `Recruiter InMail ΓÇö Value Proposition` | Hyphen (`Recruiter InMail - Value Proposition`) |
| `src/data/suite/outreach-templates.json` | 56 | `Cold Email ΓÇö Direct Role Application` | Hyphen (`Cold Email - Direct Role Application`) |
| `src/data/suite/outreach-templates.json` | 58 | `Application: {{targetRole}} ΓÇö {{candidateName}}` | Hyphen (`Application: {{targetRole}} - {{candidateName}}`) |
| `src/data/suite/outreach-templates.json` | 65 | `Cold Email ΓÇö Solutions & Problem Solving` | Hyphen (`Cold Email - Solutions & Problem Solving`) |
| `src/data/suite/outreach-templates.json` | 74 | `Cold Email ΓÇö Scannable Bullet Pitch` | Hyphen (`Cold Email - Scannable Bullet Pitch`) |
| `src/data/suite/outreach-templates.json` | 76 | `{{candidateName}} ΓÇö {{targetRole}} candidate` | Hyphen (`{{candidateName}} - {{targetRole}} candidate`) |

*Note: As per guardrails, no em dashes will be used in any template text or UI strings.*

---

## 6. Theme Tokens (Dark Decision Suite Hub)
The Reach Out redesign will adhere to the existing dark design tokens used across the Decision Suite:
- Base Background: `bg-[#0a0a0a]` / `--color-bg`
- Surfaces:
  - Base Surface (`surface-1`): `#141414`
  - Elevated Card (`surface-2`): `#1e1e1e`
  - Highlight Surface (`surface-3`): `#2a2a2a`
- Borders:
  - Subtle: `rgba(255, 255, 255, 0.10)`
  - Strong: `rgba(255, 255, 255, 0.20)`
- Typography:
  - Primary: `#ffffff`
  - Secondary: `#cbd5e1`
  - Muted: `#94a3b8`
- Button & Action Styles:
  - Cool-neutral dark buttons (`bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60`)
  - Back/Home navigation buttons matching `CareerPathBackButton` with 44px minimum touch targets and black press active states.
  - No glossy glows or bright blue button fills.
