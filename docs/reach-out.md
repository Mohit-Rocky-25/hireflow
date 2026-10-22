# HireFlow Reach Out v2 (Cold Outreach Generator)

## 1. Overview & Purpose
HireFlow's **Reach Out** tool (`/tools/reach-out`) is a deterministic cold outreach engine designed for Indian technical candidates (campus and off-campus recruitment, 2026). It bridges the gap between candidates and engineering hiring teams by generating highly contextual, concise, and respectful outreach messages across 5 channels.

### Core Philosophy
1. **Zero Hallucination / Zero Fake Facts**: Outreach templates only reference verified company data from the shared company dataset or what the candidate typed into input slots.
2. **Zero Fake Statistics**: No artificial "reply rates", "success probabilities", or unsourced percentages.
3. **Zero Network Egress**: All generation is static knowledge-base logic executing strictly within the client browser.
4. **Natural Indian-Professional Voice**: Plain, specific, human English. No corporate cliches, empty flattery, or false seniority claims.
5. **No Em Dashes**: Em dashes (`—`) are completely eliminated in all template content and UI labels to preserve natural readability.

---

## 2. Taxonomy & Scenario Groups (50 Templates across 12 Groups)

Outreach is structured by candidate intent and relational context across 12 scenario groups:

| Group # | Group Title | Group ID | Template Count | Allowed Recipients | Primary Ask Types |
|---|---|---|---|---|---|
| **1** | First Touch: Recruiters & Talent | `first-touch-recruiters` | 4 | Recruiter | connect, schedule |
| **2** | First Touch: Hiring Managers & Engineers | `first-touch-engineers` | 4 | Hiring Manager, Peer Engineer | connect, ten-minute-chat, single-question |
| **3** | Alumni, Mutual & Warm Intros | `alumni-mutual-warm` | 4 | Alumnus, Referrer | connect, ten-minute-chat, referral |
| **4** | Follow-Ups | `follow-ups` | 3 | Recruiter, Hiring Manager | status-update, keep-warm |
| **5** | Startup & Founder Direct | `startup-founder-direct` | 5 | Founder/CTO | ten-minute-chat, single-question, feedback-on-artifact, schedule |
| **6** | Campus & Fresher Programs | `campus-fresher-programs` | 5 | Campus Recruiter, Recruiter, Intern Manager, Alumnus, TPO | single-question, status-update, schedule, resume-review |
| **7** | Open Source & Portfolio-Led | `open-source-portfolio` | 4 | Peer Engineer, Hiring Manager | single-question, feedback-on-artifact, ten-minute-chat |
| **8** | Events & Community | `events-community` | 4 | Speaker, Judge, Peer Engineer, Recruiter | connect, feedback-on-artifact, single-question, status-update |
| **9** | Referral Engine | `referral-engine` | 4 | Alumnus, Referrer, Peer Engineer | referral, keep-warm, status-update, connect |
| **10** | Interview Lifecycle | `interview-lifecycle` | 5 | Recruiter, Interviewer | schedule, keep-warm, status-update |
| **11** | Informational Chats | `informational-chats` | 4 | Senior Engineer, Peer Engineer, Recent Hire, Hiring Manager | ten-minute-chat, single-question |
| **12** | Re-engagement & Reply Handling | `re-engagement-replies` | 4 | Recruiter | schedule, keep-warm, single-question |

**Total Templates**: 50 (4 + 4 + 4 + 3 + 5 + 5 + 4 + 4 + 4 + 5 + 4 + 4)

---

## 3. Strict Template Schema

Every outreach template satisfies the TypeScript strict interface `ReachOutTemplate` defined in `src/features/reach-out/types.ts`:

```typescript
export interface ReachOutTemplate {
  id: string;                                // Stable kebab-case ID (e.g. 'founder-cold-email-product-observation')
  group: ScenarioGroupId;                    // One of the 12 scenario groups
  channel: ChannelId;                        // 'linkedin_connect' | 'linkedin_inmail' | 'cold_email' | 'direct_message' | 'reply'
  name: string;                              // Descriptive human-readable title
  recipientTypes: RecipientTypeId[];         // Valid recipient personas
  intent: string;                            // Clear statement of what the sender wants to achieve
  openingMove: OpeningMove;                  // 'observation' | 'proof-first' | 'question-first' | 'mutual-context' | 'event-context' | 'artifact-first' | 'reply-context'
  askType: AskType;                          // 'connect' | 'ten-minute-chat' | 'single-question' | 'referral' | 'resume-review' | 'status-update' | 'schedule' | 'keep-warm' | 'feedback-on-artifact'
  toneNote: string;                          // Guidelines on delivery style
  body: string;                              // Template body with {{slot}} placeholders
  subjects?: string[];                       // 2-3 alternate subjects for Email / InMail
  altOpeners: string[];                      // 2-3 alternate openers rotated deterministically
  requiredSlots: string[];                   // Mandatory fields needed to make the message coherent
  optionalSlots: string[];                   // Supplementary fields that enrich context
  limits: {
    maxChars?: number;                       // E.g. 200 or 300 for LinkedIn Connect
    maxWords?: number;                       // E.g. 120 for Cold Email
    minWords?: number;
  };
  whenToUse: string;                         // Specific situation when this template is appropriate
  whenNotToUse: string;                      // Counter-indications or warnings
  sendWindowNote: string;                    // Time-of-day or day-of-week timing advice ("common practice")
  followUpNote: string;                      // Next step and recommended follow-up template ID
  riskNotes: string[];                       // Compliance, ethical, and anti-spam guardrails
  experienceFit: ExperienceFit[];            // 'Intern' | 'Fresher' | '0-2 yrs'
  roleFamilies: RoleFamilyId[] | 'all';     // Role families this template is calibrated for
}
```

---

## 4. Recipient Compatibility & Anti-Spam Guardrails

1. **Gated Referral Asks**:
   - Templates with `askType === 'referral'` are strictly restricted to non-strangers (`Alumnus`, `Referrer`, or relationships where `referrer_relationship` is `alumnus`, `mutual_connection`, or `prior_interaction`).
   - Cold referral asks to complete strangers are blocked by design.
2. **Anti-Fabrication Deadline Gate**:
   - Template `real-competing-deadline-note` requires explicit candidate confirmation: `"This is a real deadline"`. The UI prevents rendering unverified deadlines.
3. **Zero Security Disclosure Outreach**:
   - Vulnerability disclosure via direct messaging is prohibited. Templates point candidates to the company's verified `security.txt` or responsible disclosure portal.
4. **Inline Recipient Validation**:
   - If a candidate selects an incompatible recipient type (e.g. using an Alumni template for a general HR Recruiter), the UI displays a clear inline warning and a one-click button to switch to the nearest compatible template.

---

## 5. Send-Readiness Checklist & Deterministic Lint Rules

Rather than arbitrary "reply scores", HireFlow Reach Out evaluates outreach messages using an objective 8-point checklist:

1. **All Required Slots Filled**: Verifies that every required variable in `template.requiredSlots` is provided.
2. **Channel Limits**:
   - **LinkedIn Connect**: Enforces a strict character meter toggleable between **Free (200 characters)** and **Premium (300 characters)** accounts.
   - **Direct Messages**: 40-80 words.
   - **Cold Email**: 70-120 words.
   - **LinkedIn InMail**: 90-150 words.
   - **Replies**: 40-90 words.
3. **Single Ask Enforcement**: Outreach notes must contain at most one question or primary action item.
4. **Single Link Rule**: Cold first-touches are restricted to at most one relevant hyperlink (e.g., GitHub, live demo, or portfolio).
5. **No Cold Attachments**: Flags unsolicited PDFs or resumes on initial cold touch.
6. **Email Subject Brevity**: Enforces subject lines under 60 characters for high notification preview readability.
7. **Banned Cliché Detection**: Checks for boilerplate phrases:
   - "I hope this email finds you well"
   - "I am writing to express"
   - "esteemed"
   - "passionate about"
   - "pick your brain"
   - "kindly revert"
   - "at your earliest convenience"
   - "i would be grateful if you could spare"
   - "dear sir/madam"
   - "to whom it may concern"
   - Any em dash (`—`) or emojis
8. **Unverified Numbers Audit**: Any quantitative metric (e.g., `45%`, `10k`) in the rendered output must originate from candidate-supplied slots, preventing ungrounded metric hallucination.

---

## 6. How to Add a New Outreach Template

To register a new template:

1. Locate the appropriate scenario group file in `src/features/reach-out/data/`:
   - `group1-first-touch-recruiters.ts`
   - `group2-first-touch-engineers.ts`
   - ...
   - `group12-re-engagement-replies.ts`
2. Define the template following the strict `ReachOutTemplate` interface:
   - Use kebab-case for `id`.
   - Provide 2-3 `subjects` if channel is email or InMail.
   - Provide 2-3 distinct `altOpeners`.
   - Ensure the opening move and ask type pairing is unique within the group.
   - Use plain ASCII characters, hyphens, or commas; do not use em dashes (`—`).
3. Update `src/data/suite/outreach-templates.json` to ensure mirror synchronization if shared across suite tools.
4. Run the automated test suite to verify uniqueness, Jaccard distance, and contrast:
   ```bash
   npx vitest run src/features/reach-out/__tests__/reachOutV2.test.ts
   ```

---

## 7. Master-Detail UI Design Tokens

The Reach Out v2 visual interface matches the dark, cool-neutral aesthetic of the Decision Suite hub (`/tools`):

- **Theme Root**: Scoped via `[data-theme="reach-out-dark"]` in `src/index.css`.
- **Surfaces**:
  - Base background: `#0a0a0a` (`bg-neutral-950`)
  - Rail & Panels: `#141414` (`bg-neutral-900`)
  - Cards & Reading Canvas: `#1e1e1e` (`bg-neutral-900/60`)
  - Borders: `rgba(255, 255, 255, 0.10)` (`border-neutral-800`)
- **Typography**: 16-17px body font with 1.65 line-height and max reading width of ~68ch.
- **Interactive Inline Chips**: Amber outline on dark (`border-amber-500/40 bg-amber-500/10 text-amber-200`) with tab navigation and keyboard accessibility.
- **Copy Button**: Copies plain text with preserved newlines. Displays an inline confirmation modal if any required fields are empty, and announces success via `aria-live="polite"`.
- **Log in Tracker**: Retains direct integration with `<Link to="/tools/tracker">` across desktop and mobile.
