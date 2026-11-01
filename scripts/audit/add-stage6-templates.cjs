const fs = require('fs');
const path = require('path');

const templatesPath = path.resolve('src/data/suite/outreach/templates.json');
const syncTemplatesPath = path.resolve('src/data/suite/outreach-templates.json');

const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

// Remove if already present
const filtered = templates.filter(t => t.id !== 'alumni-advice' && t.id !== 'senior-intro');

const alumniAdvice = {
  id: "alumni-advice",
  version: 2,
  channel: "cold_email",
  tab: "cold_email",
  name: "Alumni Technical Advice Request",
  goal: "G3",
  relationship: "alumni",
  recipientTypes: ["alumnus/alumna"],
  candidateStages: ["student", "fresher"],
  companyTypes: ["product", "gcc", "startup", "it-services"],
  angle: "shared-background-led",
  askStrength: "low",
  requiredSlots: [
    "recipient_name",
    "company",
    "role",
    "college",
    "primary_skill",
    "proof_point"
  ],
  optionalSlots: ["portfolio", "your_name"],
  subjectVariants: [
    "{{college}} student query: early-career {{role}} advice at {{company}}",
    "Advice on {{company}} engineering from fellow {{college}} student",
    "{{college}} to {{company}}: technical transition advice"
  ],
  blocks: {
    hook: [
      "Hi {{recipient_name}},\n\nI am currently an undergraduate at {{college}} and follow the engineering updates shared by {{company}}'s infrastructure team.",
      "Hi {{recipient_name}},\n\nReaching out as a junior from {{college}} who has been studying the systems your team builds at {{company}}."
    ],
    proof: [
      "I prepare primarily in {{primary_skill}}, and recently {{proof_point}} (details: {{portfolio}}).",
      "My primary technical projects center on {{primary_skill}}, where I recently {{proof_point}} to understand production patterns."
    ],
    ask: [
      "Could you share one quick pointer on what technical competencies the engineering team at {{company}} values most when reviewing early-career applicants?",
      "Would you be open to sharing a brief perspective on how {{college}} graduates best navigate the transition into {{company}}'s engineering groups?"
    ],
    close: [
      "Completely understand if your schedule is packed. Thank you for your time and guidance.\n\nBest regards,\n{{your_name}}",
      "No worries at all if work keeps you busy. Appreciate any perspective you can share.\n\nBest,\n{{your_name}}"
    ]
  },
  optionalBlockPriority: ["close", "proof"],
  lengthProfile: {
    metric: "words",
    target: 80,
    warn: 115,
    hardMax: 160
  },
  whenToUse: "Connecting with a college alumnus at your target employer to ask for technical guidance without requesting an unearned referral.",
  whenNotToUse: "Do not request a referral or interview recommendation on first contact.",
  risks: [
    "Alumni receive multiple student queries; keep the inquiry concise and specific to their engineering team."
  ],
  whyItWorks: "College affinity generates authentic goodwill, while a focused technical advice ask respects their calendar.",
  exampleFilled: "Hi Rahul,\n\nI am currently an undergraduate at NIT Warangal and follow the engineering updates shared by Finlo's infrastructure team.\n\nI prepare primarily in Go, PostgreSQL & Redis, and recently built Go distributed job queue handling 6,500 jobs/sec (details: github.com/aarav-demo/pgqueue).\n\nCould you share one quick pointer on what technical competencies the engineering team at Finlo values most when reviewing early-career applicants?\n\nCompletely understand if your schedule is packed. Thank you for your time and guidance.\n\nBest regards,\nAarav Menon",
  followUpTemplateIds: ["gentle-follow-up"],
  lastReviewed: "2026-11-01",
  notes: "Warm alumni advice inquiry focused on engineering competencies.",
  needsAuthoring: false
};

const seniorIntro = {
  id: "senior-intro",
  version: 2,
  channel: "cold_email",
  tab: "cold_email",
  name: "Engineering Team Lead Introduction",
  goal: "G1",
  relationship: "warm",
  recipientTypes: ["hiring manager", "engineer or peer"],
  candidateStages: ["student", "fresher"],
  companyTypes: ["product", "startup", "gcc"],
  angle: "project-led",
  askStrength: "low",
  requiredSlots: [
    "recipient_name",
    "company",
    "role",
    "admired_project",
    "primary_skill",
    "proof_point"
  ],
  optionalSlots: ["portfolio", "your_name"],
  subjectVariants: [
    "Question on {{admired_project}} at {{company}} from junior {{role}} candidate",
    "Note on {{admired_project}} & technical introduction",
    "{{role}} inquiry regarding {{company}}'s {{admired_project}}"
  ],
  blocks: {
    hook: [
      "Hi {{recipient_name}},\n\nI read your recent technical breakdown regarding {{admired_project}} and wanted to share how insightful I found your architecture.",
      "Hi {{recipient_name}},\n\nFollowing your engineering notes on {{company}}'s work around {{admired_project}}, I wanted to introduce myself."
    ],
    proof: [
      "I specialize in {{primary_skill}}, and recently {{proof_point}} (walkthrough: {{portfolio}}).",
      "Working mainly with {{primary_skill}}, I recently {{proof_point}}, which was motivated by similar design trade-offs."
    ],
    ask: [
      "Could you let me know if your team has upcoming openings for junior engineers with this background?",
      "Would you be open to a brief conversation if your group has plans to expand junior engineering headcount this quarter?"
    ],
    close: [
      "No expectation of a lengthy reply if you are heads-down on roadmap delivery. Thank you for your time.\n\nBest regards,\n{{your_name}}",
      "Completely understand if headcount is full right now. Thank you for your time and technical writing.\n\nBest,\n{{your_name}}"
    ]
  },
  optionalBlockPriority: ["close", "proof"],
  lengthProfile: {
    metric: "words",
    target: 80,
    warn: 115,
    hardMax: 160
  },
  whenToUse: "Introducing yourself to an engineering manager or lead after reading their technical post, talk, or architectural initiative.",
  whenNotToUse: "Do not send generic praise without actually reading the post or understanding the architectural trade-offs.",
  risks: [
    "Managers are busy; keep praise specific to avoid looking like automated mass outreach."
  ],
  whyItWorks: "Anchors on their public technical output first, then provides one concrete demonstration of technical capability.",
  exampleFilled: "Hi Priya,\n\nI read your recent technical breakdown regarding settlement reconciliation engine and wanted to share how insightful I found your architecture.\n\nI specialize in Go, PostgreSQL & Redis, and recently built Go distributed job queue handling 6,500 jobs/sec (walkthrough: github.com/aarav-demo/pgqueue).\n\nCould you let me know if your team has upcoming openings for junior engineers with this background?\n\nNo expectation of a lengthy reply if you are heads-down on roadmap delivery. Thank you for your time.\n\nBest regards,\nAarav Menon",
  followUpTemplateIds: ["gentle-follow-up"],
  lastReviewed: "2026-11-01",
  notes: "Polite engineering team lead introduction referencing specific technical initiative.",
  needsAuthoring: false
};

filtered.push(alumniAdvice);
filtered.push(seniorIntro);

fs.writeFileSync(templatesPath, JSON.stringify(filtered, null, 2) + '\n', 'utf8');
fs.writeFileSync(syncTemplatesPath, JSON.stringify(filtered, null, 2) + '\n', 'utf8');

console.log(`Updated templates successfully: total count is now ${filtered.length}.`);

