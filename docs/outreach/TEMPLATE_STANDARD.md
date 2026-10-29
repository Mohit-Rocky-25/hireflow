# Reach Out — Standard D6 Template Authoring Specification

## 1. Overview & Purpose
Standard D6 governs the structure, phrasing, length, and ethics of every outreach template in HireFlow. It ensures that outreach messages generated for Indian engineering candidates are professional, concise, respectful of recipient time, and free of both subservient clichés and sales spam.

---

## 2. The 4-Block Architecture
Every template in HireFlow is composed of 4 modular blocks:

### 2.1 Hook Block (`blocks.hook`)
- **Purpose**: Establishes who the candidate is, why they are contacting this specific recipient, and references verified context (e.g., recipient's public technical writing, company open-source project, or campus visit).
- **Rules**:
  - Must consist of 1 concise sentence (maximum 2).
  - Every template must provide between 2 and 4 distinct hook variants.
  - **Zero generic filler openers**: Banned phrases include *"I hope this email finds you well"*, *"Hope you are doing great"*, *"I came across your profile"*, and *"I am writing to express my interest"*.
  - **No ungrounded flattery**: Prohibited to write *"your esteemed organisation"* or *"I am a huge admirer of your company"* without referencing a specific project (`{{admiredProject}}`).
  - **Global Uniqueness**: Every opening sentence in the entire library must be globally unique across all templates (enforced by `npm run outreach:lint-templates`).

### 2.2 Proof Block (`blocks.proof`)
- **Purpose**: Demonstrates engineering competence with objective, verifiable evidence rather than adjectives.
- **Rules**:
  - Must present at least 1 concrete achievement, benchmark metric, or direct project artifact link (`{{proofPoint}}`, `{{portfolio}}`).
  - Phrasing must connect the candidate's core stack (`{{primarySkill}}`) to the evidence.
  - Must provide between 2 and 4 distinct proof variants.
  - Prohibited to claim *"deep expertise"*, *"industry-leading mastery"*, or unquantified self-praise.

### 2.3 Ask Block (`blocks.ask`)
- **Purpose**: Proposes a single, low-friction, realistic next step.
- **Rules**:
  - Single call-to-action only. Never combine multiple asks (e.g., asking for a referral, a resume review, and a 30-minute phone call in the same note).
  - **Cold Referral Prohibition (Evidence E5)**: In cold outreach (`relationship: "cold"`), asking for a job referral is strictly forbidden. The ask must focus on role availability, team screening processes, or connecting on public technical progress.
  - Must provide between 2 and 4 distinct ask variants.

### 2.4 Close Block (`blocks.close`)
- **Purpose**: Provides a polite, low-pressure exit ("polite out") that respects recipient workload and eliminates awkwardness.
- **Rules**:
  - Phrasing must communicate no pressure: *"Totally understand if hiring is paused right now"*, *"No worries if work keeps you busy"*, or *"Appreciate your time either way"*.
  - Closes are typically optional and prioritized for dropping (`optionalBlockPriority: ['close', 'proof']`) if the message needs to fit tight constraints.
  - Must provide between 1 and 4 variants.

---

## 3. Indian Market Linguistic Calibration

Standard D6 explicitly calibrates English for modern Indian tech hiring cultures (Bengaluru, Hyderabad, Pune, Gurugram, Chennai, and remote):

| Banned / Dated Phrasing | Why It Is Flagged | Calibrated D6 Modern Equivalent |
|---|---|---|
| *"Kindly do the needful"* | Bureaucratic British-Raj cliché; conveys passive dependency | Specific request: *"Could you let me know if this role is still open?"* |
| *"Revert back"* | Grammatically redundant | *"Let me know"*, *"Share your thoughts"* |
| *"Your esteemed organisation"* | Excessive sycophancy; reads as automated mass spam | Direct mention: *"{{targetCompany}}'s engineering team"* |
| *"Humbly request your blessing"* | Subservient posture; damages peer credibility | Professional peer tone: *"Would value your perspective"* |
| *"Passout of 2024"* | Indian collegiate colloquialism confusing to global teams | *"2024 graduate"*, *"Final-year engineering student"* |
| *"Passionate, hardworking, quick learner"* | Unverifiable self-descriptors present on 90% of resumes | Replaced with quantified proof: *"Built {{proofPoint}}"* |

---

## 4. Channel Profiles & Length Budgets

| Channel ID | Metric | Recommended Target | Hard Upper Limit | Overflow Fallback Strategy |
|---|---|---|---|---|
| `linkedin_connect` (Free) | Characters | 160–190 chars | **200 characters** | Drops `close`, then `proof`; never cuts mid-word |
| `linkedin_connect` (Premium) | Characters | 240–280 chars | **300 characters** | Drops `close` if necessary |
| `linkedin_inmail` | Words | 50–90 words | **120 words** | Drops `close`, shortens proof |
| `cold_email` | Words | 60–90 words | **125 words** | Drops `close`, uses concise hook |
| `warm_referral` | Words | 75–110 words | **140 words** | Keeps shared context, drops optional close |
| `follow_up` | Words | 30–65 words | **80 words** | Enforces `followUpNewInfo` and strict brevity |

---

## 5. Subject Line Standards (Email & InMail)
- **Length**: 3 to 8 words maximum (enforced by `subjectBuilder.ts`).
- **Style**: Direct, lowercase/headline mix, scannable in inbox preview.
- **Forbidden Elements**:
  - Emojis (🚀, 🔥, 💼) are strictly forbidden in email/InMail subject lines.
  - Urgent or clickbait claims (*"Urgent: must read"*, *"Quick question regarding your future"*).
  - ALL-CAPS words.
