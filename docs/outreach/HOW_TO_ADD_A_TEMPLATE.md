# How to Add a Template to Reach Out

This guide explains how to author and contribute a new outreach template to HireFlow. Every new template must conform to Standard D6, satisfy Schema v2, and pass `npm run outreach:gate`.

---

## 1. Prerequisites & Rules Before You Begin

1. **Check the Taxonomy Matrix**: Ensure your proposed `(channel, goal, recipientType, relationship)` combination is valid according to `src/config/outreach.ts`. Specifically:
   - Never pair a cold stranger (`relationship: "cold"`) with a referral ask (`goal: "G2"`).
   - Never create a follow-up without linking to a predecessor template.
2. **Follow the 4-Block Architecture**:
   - `hook`: 2 to 4 variants. Opening sentence MUST be globally unique across all 85+ templates.
   - `proof`: 2 to 4 variants. Must tie to verifiable technical work.
   - `ask`: 2 to 4 variants. Single low-friction call-to-action.
   - `close`: 1 to 4 variants. Polite out ("no worries if not relevant").
3. **Respect Length Budgets**:
   - LinkedIn Connect: All variants must fit within 200 characters on the worst-case fixture (or safely compress using `optionalBlockPriority: ['close', 'proof']`).
   - Cold Email / InMail: 50–100 words.
4. **Zero Banned Clichés**:
   - Do NOT use *"hope all is well"*, *"came across your profile"*, *"kindly do the needful"*, *"revert back"*, or *"esteemed organisation"*.
   - Do NOT use banned marketing claims (*"high-converting"*, *"guaranteed"*, *"proven"*).

---

## 2. Step-by-Step Instructions

### Step 1: Open the Templates Master File
Open `src/data/suite/outreach/templates.json`.

### Step 2: Append Your New Template Object
Add your template object matching the `OutreachTemplateV2` schema:

```json
{
  "id": "cold-email-event-tech-booth",
  "name": "Tech Conference Booth Follow-Up Email",
  "channel": "cold_email",
  "goal": "G1",
  "relationship": "warm",
  "recipientTypes": ["engineer or peer", "hiring manager"],
  "candidateStages": ["final-year student", "recent graduate"],
  "companyTypes": ["growth-stage startup", "mid-market product"],
  "angle": "event-led",
  "askStrength": "low",
  "requiredSlots": ["recipientName", "targetCompany", "admiredProject", "primarySkill", "proofPoint"],
  "optionalSlots": ["portfolio", "your_name"],
  "subjectVariants": [
    "Follow-up from {{admiredProject}} demo at conference",
    "Technical question on {{primarySkill}} architecture following demo"
  ],
  "blocks": {
    "hook": [
      "Hi {{recipientName}}, enjoyed our brief technical discussion regarding {{admiredProject}} at the conference yesterday.",
      "Hi {{recipientName}}, reaching out following our chat about {{targetCompany}}'s {{admiredProject}} implementation."
    ],
    "proof": [
      "I work primarily with {{primarySkill}}. Recently, I {{proofPoint}}, which relates directly to the latency constraints we discussed.",
      "Focusing on {{primarySkill}}, I recently {{proofPoint}} and wanted to share the benchmark notes we touched upon."
    ],
    "ask": [
      "Could you let me know if your team is open to discussing junior engineering opportunities this quarter?",
      "Would you be open to reviewing my repository link if your squad has open requisitions?"
    ],
    "close": [
      "No worries if hiring is currently on hold. Appreciate you sharing insights at the booth.",
      "Totally fine if work keeps you busy. Great meeting you at the event."
    ]
  },
  "optionalBlockPriority": ["close", "proof"],
  "lengthProfile": {
    "metric": "words",
    "target": 75,
    "hardMax": 115
  },
  "whenToUse": "Within 24–48 hours after meeting an engineer or tech lead at an in-person tech summit or career booth.",
  "whenNotToUse": "Cold outreach to individuals you have never met or interacted with.",
  "whyItWorks": "Builds upon warm in-person rapport while immediately backing up conversational claims with concrete GitHub benchmarks.",
  "exampleFilled": "Hi Rahul, enjoyed our brief discussion regarding Finlo Technologies's settlement engine...",
  "needsAuthoring": false
}
```

### Step 3: Run the Authoring Linter
Execute the linter to verify that lengths, variant counts, uniqueness, and banned patterns pass:

```bash
npm run outreach:lint-templates
```

If the linter reports any duplicate opener, length overflow, or cliché:
- Fix the wording in your variants.
- Re-run until it outputs: `✅ ALL TEMPLATES PASS THE D6 AUTHORING STANDARD.`

### Step 4: Run the Complete Verification Gate
Execute the comprehensive gate:

```bash
npm run outreach:gate
```

If all 9 stages pass, your new template is ready for commit!
