# TAILOR ENGINE: MASTER SPEC AND BUILD PROMPT (v2)

Save this file as `docs/MASTER_SPEC.md` in the repo. Paste the KICKOFF MESSAGE (Section 15) into the agent.
Audience: the coding agent (Antigravity, Gemini Flash High) AND the engine's own runtime LLM calls.

---

## 0. MISSION

Build a resume tailoring engine that takes ANY user's resume plus ANY job description and produces a resume that is:

1. **At least as good as the original on every measurable dimension** (never degraded).
2. **Complete**: every fact the user wrote is either shown or safely archived, never silently lost.
3. **Truthful**: nothing the user did not say or confirm is ever added.
4. **Better for THIS job**: reordered, relabelled, emphasised and re-worded in the job's vocabulary wherever the user's real experience supports it.
5. **Perfectly formatted** and identical in preview, PDF, DOCX and (optional) LaTeX.

The benchmark is a hand-crafted resume made by a careful human expert. For the regression fixture "Jeswanth", the engine's output on his RAW resume must score >= the hand-made gold file (Section 13) on every rubric category. If the engine scores lower than a human on the same facts, the engine is broken, not the human.

---

## 1. PRIME DIRECTIVES (override everything else)

- **P1 QUALITY FLOOR.** For every rubric dimension (Section 9), score(output) >= score(source). If any element of the output would lower a dimension, that element falls back to the source version automatically.
- **P2 ZERO SILENT LOSS.** Every source fact (see Fact Ledger, Section 6) must be in the output OR in a visible "Archived / Trimmed" list the user can restore. Section-level loss (e.g. Achievements, Leadership, Certifications disappearing) is a release blocker.
- **P3 NEVER FABRICATE. ASK, DON'T ANSWER.** The engine never adds a tool, skill, number, metric, outcome, employer, date, grade or claim. Missing facts become QUESTIONS with EMPTY inputs. The user supplies the fact.
- **P4 TAILOR HARD, WITHIN P1 TO P3.** Reorder, regroup, relabel, emphasise, mirror the job's vocabulary (only where equivalence is verified), rewrite the summary and title line. Tailoring is the product. Doing nothing is also a failure.
- **P5 ONE LAYOUT TREE, MANY RENDERERS.** Preview, PDF, DOCX, LaTeX only translate the same layout tree. Renderers never decide content, sections or order.
- **P6 DETERMINISTIC FIRST.** Parsing, routing, matching, ordering, dedupe, validation and scoring are code. The LLM is used ONLY for language tasks (extraction assist, phrasing), always behind a verifier, always with a deterministic fallback. The app must produce a complete, correct resume with the LLM turned off.
- **P7 NON-DESTRUCTIVE.** Base Resume = immutable fact ledger. Each job gets a Variant = ordered list of operations on top of it. Nothing a variant does can delete a fact.
- **P8 SAFE FOR NON-EXPERTS.** Users cannot judge what is legitimate. Every one-click button the UI offers must be safe by construction.
- **P9 HONEST SCORES.** One definition per number, no duplicates, no number goes up unless real evidence or real prominence improved.
- **P10 READABLE UI.** Every piece of text in the UI meets WCAG AA contrast (Section 11). Unreadable UI is a bug of the same severity as a wrong resume.

---

## 2. AGENT OPERATING PROTOCOL (for Gemini Flash High or any fast model)

Fast models fail when they try to do everything in one pass. Follow this protocol exactly:

1. **Phase gating.** Work through Section 14 one phase at a time. Do not start phase N+1 until phase N's exit criteria pass.
2. **Read before edit.** Never assume file contents. Open and read a file before changing it. After a successful edit, re-read before editing the same region again.
3. **Failing test first.** For every bug in Section 3, write a failing test that reproduces it, then fix, then show it green.
4. **Small steps.** No single edit over ~300 lines. Commit after every green step with a message naming the bug IDs fixed.
5. **State files.** Maintain `PROGRESS.md` (done / next / blocked) and `DECISIONS.md` (every ambiguity and the safe choice made). Update them after every phase. Re-read them at the start of every session.
6. **Ambiguity rule.** Choose the option that is safer for the user's content (preserve, ask, don't delete), record it in DECISIONS.md, and continue. Stop and ask only for: changing a public export format, deleting data, adding a paid dependency.
7. **Verify command.** `npm run verify` runs: unit tests, property tests, fixture pipeline, renderer parity, contrast check. Run it after every phase and paste the pass/fail table.
8. **No scope creep.** Do not redesign things not listed. Do not add dependencies without a one-line justification in DECISIONS.md.
9. **Show the plan first** for each phase (files to touch, tests to add), then implement.
10. **Two-strike rule.** If a fix fails twice, write the blocker in PROGRESS.md with the evidence, and move to the next independent item.

---

## 3. BUG LEDGER FROM REAL RUNS (each needs a regression test)

| ID | Observed defect | Required behaviour | Test |
|---|---|---|---|
| B01 | Preview showed Achievements, Leadership, Certifications; DOCX export dropped all three; LaTeX dropped Leadership | Preview/DOCX/PDF/LaTeX contain the identical section set and text | T-PARITY |
| B02 | Tool name "JADX" rendered in the date slot (fixed once, regressed) | Date fields hold only dates; tools live in `stack[]` | T-DATE-FIELD |
| B03 | Project years (2026) vanished in DOCX export | Every dated entry renders its date in every renderer | T-PARITY |
| B04 | LaTeX export stripped hyphens ("Secondyear", "clientside", "VITAP") and turned "re-signed" into "resigned" (meaning changed) | Hyphens, en/em dashes survive in all exporters | T-HYPHEN |
| B05 | User-typed metrics were pasted raw: "EVALUATED ACORDING TO 12 END points", "soanning 4 subsets upon 2 routers" | User input is spell-fixed, case-fixed and merged grammatically into the sentence; digits and tool names untouched | T-USERTEXT |
| B06 | JD parser produced junk requirements: "Job Title", "Job Description", "Employment Type", "Security Engineering", the job title itself, and bare "Cybersecurity"; it then asked "Have you used Job Title?" | Meta headings, titles and fields-of-work are never skill questions | T-JD |
| B07 | JD input box shows raw markdown (`**Education:**`, `- `) | JD is cleaned and segmented before display and parsing | T-JD |
| B08 | Education rendered last for a student, with no dates and the hierarchy inverted | Student preset puts Education right after Summary; degree bold, institution below, date right-aligned; missing dates trigger a QUESTION | T-ORDER |
| B09 | Header shows stray "Cybersecurity" in the contact line; no title line; no location | Title line under the name; location is a QUESTION if missing | T-HEADER |
| B10 | Tailoring left Summary and skill order unchanged although a role was chosen | Summary, title line, skill order and project order visibly adapt to the JD | T-TAILOR |
| B11 | Several competing scores (18%, 28%, "Target Max 18%", 94%, 17/100) and a dark panel that clashes with the light page | One JD Match score, one Resume Quality score, one Integrity badge, each defined in a tooltip | T-SCORE |
| B12 | Light UI has low-contrast grey text, tiny type and pale chips | Meets Section 11 tokens; automated contrast test | T-CONTRAST |
| B13 | ~25% of the DOCX page left blank because sections were lost | Page-fit uses real content; underfill produces suggestions, not stretching | T-FIT |
| B14 | DOCX date column not right-aligned | Right-aligned tab stop at text width | T-DOCX |
| B15 | One long vertical scroll of many cards; user cannot see the resume while reviewing | 3-pane layout with sticky preview (Section 11) | manual + e2e |
| B16 | Earlier versions auto-accepted fabricated edits and injected JD skills (Terraform) | Section 8 state machine; JD keywords never injected | T-NOFAB |
| B17 | Merged fragment bullets produced mixed tenses and run-ons | Bullet engine repairs parallelism | T-BULLET |
| B18 | Partial "Tools:" line (only some projects, incomplete lists) | Consistent derived stack for all projects or none | T-STACK |
| B19 | Certifications section mixed courses, self-study and in-progress items | Group by status; coursework is not a "certification" | T-CERT |
| B20 | Letter paper by default for an India-based user | Locale-aware: A4 for India, Letter for US/Canada, toggle available | T-PAGE |

---

## 4. DOMAIN KNOWLEDGE: WHAT A TOP-TIER TAILORED RESUME IS

### 4.1 The three readers
1. **ATS / parser.** Wants plain text order, standard headings, no tables/text boxes/images/columns, real text, exact keyword forms (spelled-out + acronym once, e.g. "Static Application Security Testing (SAST)").
2. **Recruiter, 6 to 10 seconds.** Scans top third: name, title line, location, summary, education/last role, skills, first bullets. Needs the role match visible without scrolling.
3. **Hiring manager / interviewer.** Reads bullets for proof: what, how (tool/method), result. Will probe every claim. Anything the candidate cannot explain is a liability.

### 4.2 Anatomy of a job description
Segments: title, about-company (ignore), responsibilities, must-have requirements, preferred/nice-to-have, education, years of experience, benefits (ignore), EEO boilerplate (ignore).
Requirement types: HARD_SKILL, TOOL, DOMAIN_KNOWLEDGE, CERTIFICATION, EDUCATION, YEARS_EXPERIENCE, RESPONSIBILITY, SOFT_SKILL.
Weights: must-have 3, preferred 1.5, single mention 1. Add +1 if it appears in the title or 2+ times. Cap soft skills at 3 total.
NOT requirements: the job title itself, meta headings (Job Title, Job Description, Employment Type, Location), the industry word alone ("Cybersecurity"), benefits, perks.

### 4.3 Career-stage playbooks (auto-detect, user can override)
| Stage | Detect | Order | Page |
|---|---|---|---|
| STUDENT / FRESHER | 0 paid roles, or only internships/projects | Header, Summary (2 to 3 lines), Education, Skills, Projects, Experience/Internships, Achievements, Leadership, Certifications | 1 |
| EARLY CAREER (0 to 3 yrs) | 1+ paid roles | Header, Summary, Experience, Skills, Projects, Education, Certifications | 1 |
| EXPERIENCED (3+ yrs) | multiple roles | Header, Summary, Experience, Skills, Education, Certifications, Projects | 1 to 2 |
| CAREER CHANGER | user selects | Header, Summary, Skills, Relevant Projects/Experience, Other Experience, Education | 1 to 2 |
Order is template config, never hardcoded. Within a section, order by relevance to the JD first, then recency.

### 4.4 Section standards
Use only standard headings (ATS-safe): Summary, Education, Skills, Projects, Experience, Achievements, Leadership, Certifications, Continuous Learning. Omit empty sections. Entry row: bold title left, date right, organisation and location italic beneath or inline.

### 4.5 Bullet science
Formula: **Action verb + what/where + method/tool + result/scope**. 12 to 28 words, one sentence, ends with a period, consistent tense (past for finished, present for current roles). Lead with the verb that matches the JD's vocabulary when truthful. Never use "responsible for", "worked on", "helped with", "involved in". Result slot is filled ONLY from facts the user supplied; if absent, the bullet is still valid and a QUESTION may ask for scope/scale (Section 8).

### 4.6 Summary science
2 to 3 lines, <= 55 words. Formula: `[Level + field] + [focus aligned to target role] + [2 strongest proof points that match the JD's must-haves] + [one differentiator] + [target-role intent]`. No clichés ("hard-working", "passionate", "seeking to leverage"). Never claim years of experience, seniority or skills not in the ledger. Target-role intent is allowed as an intent statement ("Seeking a Cybersecurity Engineer role in application security") because it is a goal, not a claim.

### 4.7 Skills science
3 to 5 groups, 3 to 10 atomic items each. Order groups and items by JD weight (matched first), but NEVER delete a user's skill; unmatched skills move to the end. Preserve user qualifiers ("PowerShell basics", "VPN fundamentals"): qualifiers are honesty, not noise. Canonical names (Wireshark, Nmap, JavaScript) via KB; if the KB has no entry, keep the user's casing. Skills that appear only in the Skills list but never in a project are "claimed"; skills shown in a bullet are "demonstrated" (stronger).

### 4.8 Keyword strategy and its ethics
Mirror the job's vocabulary only through the Equivalence Tiers (Section 5.3). Legitimate: relabelling "Security Testing" to "Application Security Testing" when the bullets demonstrate it; using "penetration testing" instead of "pentesting" if the JD does. Illegitimate: adding a tool/skill the user has not used, stuffing keywords, hidden text.

### 4.9 Locale conventions
- **India (default for IN users):** A4. Include city/state, +91 phone, LinkedIn/GitHub. Education with expected graduation and CGPA/percentage IF the user supplies it (ask, never invent). Internships named clearly. Do NOT include photo, date of birth, marital status, full postal address, religion, "References available" or a Declaration paragraph.
- **US/Canada:** Letter, no photo/age/marital status, city + state optional.
- **EU/UK:** A4, follow user's choice on photo (default none).

### 4.10 Format rules
Single column. One sans-serif family (fallbacks defined). Body 10 to 10.5pt, minimum 9.5pt. Left-aligned, never justified. Real bullets. Real hyperlinks with visible text. No icons, tables, text boxes, images, columns in the ATS template. Sentence-case or Title-case consistency inside each list.

### 4.11 Honest fit advisory
If the JD demands more than the user has (e.g. "3 to 5 years" vs a student), show a plain note: "This role asks for 3 to 5 years. Your profile fits internships and junior roles better. You can still tailor, but expect lower odds." Never hide a mismatch to make a score look better.

---

## 5. KNOWLEDGE BASE FILES (build under `/kb`, versioned JSON, loaded at runtime)

The agent must create these files, seed them with the content below, and design them so new role packs can be added without code changes.

### 5.1 `/kb/section_aliases.json`
```json
{
  "summary": ["summary", "professional summary", "profile", "objective", "career objective", "about me"],
  "education": ["education", "academic background", "academics", "qualifications"],
  "skills": ["skills", "technical skills", "core competencies", "key skills", "technologies"],
  "projects": ["projects", "academic projects", "personal projects", "security projects", "security projects & practical experience", "practical experience"],
  "experience": ["experience", "work experience", "professional experience", "internships", "employment"],
  "achievements": ["achievements", "awards", "honors", "competitions", "ctf", "hackathons"],
  "leadership": ["leadership", "leadership & involvement", "positions of responsibility", "extracurricular", "volunteering", "clubs"],
  "certifications": ["certifications", "licenses", "certificates"],
  "learning": ["continuous learning", "courses", "training", "coursework", "self-directed learning"]
}
```
Routing is by alias match first, then by content classification with a confidence score; below 0.7 goes to `needs_review`, never dropped.

### 5.2 `/kb/verbs.json` (seed; extend to 150+)
Categories, past tense / present tense forms:
- **Analysis:** Analyzed, Assessed, Audited, Evaluated, Inspected, Investigated, Reviewed, Examined, Profiled, Mapped
- **Build:** Built, Developed, Designed, Implemented, Configured, Deployed, Automated, Engineered, Constructed, Integrated
- **Security:** Identified, Exploited, Reverse engineered, Decompiled, Patched, Hardened, Remediated, Triaged, Detected, Scanned, Intercepted, Bypassed (only for authorised lab/CTF context)
- **Improve:** Optimized, Reduced, Streamlined, Refactored, Accelerated, Strengthened
- **Document/communicate:** Documented, Presented, Reported, Authored, Mentored, Coordinated, Facilitated
- **Learn/compete:** Completed, Competed, Solved, Practiced, Studied (use sparingly)
Weak openers to rewrite: "responsible for", "worked on", "helped with", "involved in", "participated in", "assisted with", "tried to".
Verb swaps must stay inside the same category and preserve meaning (never turn "Reviewed" into "Led").

### 5.3 `/kb/equivalence.json`: tiers (CRITICAL for honest tailoring)
Each entry: `{ "resume_term": [...], "jd_term": [...], "tier": "SAME" | "NARROWER" | "RELATED" }`
- **SAME**: interchangeable. Engine may switch to the JD's form automatically (SAFE_EDIT). Example: pentesting = pen testing = penetration testing; AppSec = application security; VAPT = vulnerability assessment and penetration testing (only if both halves evidenced); TCP/IP = TCP/IP stack.
- **NARROWER**: the resume term is a specific instance of the JD term (e.g. "Android application pentesting" is narrower than "application security testing"; "OWASP MASTG methodology" is narrower than "mobile application security testing"). Engine may ADD the broader JD term as a group label or alongside the specific wording, never replace the specific wording. Shown as a SAFE_EDIT with before/after.
- **RELATED**: adjacent but not equivalent (e.g. "static analysis with JADX" vs "SAST"; "Wireshark traffic analysis" vs "SIEM monitoring"). NEVER auto-applied. Shown in the Gap Report as "adjacent evidence" with an honest note, and may feed a QUESTION ("Have you used a SAST tool?").
Rules: equivalence entries are hand-reviewed; the engine may suggest new ones into a review queue but never activate them itself.

### 5.4 `/kb/role_packs/cybersecurity.json` (seed; create the same schema for others)
```json
{
  "family": "cybersecurity",
  "roles": {
    "application_security_engineer": {
      "must": ["application security", "vulnerability assessment", "secure code review", "owasp top 10", "threat modeling"],
      "tools": ["burp suite", "owasp zap", "semgrep", "sonarqube", "mobsf", "frida", "jadx", "apktool", "ghidra"],
      "responsibilities": ["identify and remediate vulnerabilities", "security testing in sdlc", "document findings"]
    },
    "penetration_tester": {
      "must": ["penetration testing", "web application testing", "network testing", "reporting"],
      "tools": ["nmap", "metasploit", "burp suite", "wireshark", "kali linux"]
    },
    "soc_analyst": {
      "must": ["siem", "incident response", "log analysis", "threat detection"],
      "tools": ["splunk", "wazuh", "elastic", "wireshark"]
    },
    "security_engineer": {
      "must": ["security architecture", "hardening", "iam", "network security", "cloud security"],
      "tools": ["firewalls", "vpn", "terraform", "aws", "azure"]
    }
  },
  "canonical_names": {
    "jadx": "JADX", "apktool": "APKTool", "adb": "ADB", "nmap": "Nmap",
    "wireshark": "Wireshark", "owasp mastg": "OWASP MASTG", "owasp top 10": "OWASP Top 10",
    "burp suite": "Burp Suite", "kali linux": "Kali Linux", "powershell": "PowerShell"
  },
  "protected_tokens": ["JADX", "APKTool", "ADB", "OWASP", "MASTG", "CSRF", "XSS", "ICMP", "HTTPS", "TCP/IP", "NAT/PAT", "ACLs", "IIS", "CIDR", "DHCP", "VPN", "OSINT", "GeoOSINT", "SharedPreferences", "isAdmin"]
}
```
**Pack authoring protocol:** to add a new family (software engineering backend/frontend, data analyst/scientist, devops/cloud, product management, marketing, finance, design, nursing, etc.), collect terminology from at least 10 real JDs (as terms only, never copy text), group into must/tools/responsibilities, add canonical names, protected tokens and equivalence entries. Create at least 8 packs by Phase 8. The engine must still work on unknown fields using generic extraction.

### 5.5 `/kb/jd_stoplist.json`
Meta headings and non-requirements: job title, job description, employment type, full-time, part-time, location, remote, hybrid, salary, benefits, about us, who we are, equal opportunity, reports to, department, requisition id, apply now, nice to have (as a heading), and the bare industry word.

---

## 6. DATA MODEL

### 6.1 Fact Ledger (the heart of "never degrade")
Parse every resume into atomic facts. Each fact:
```ts
Fact { id, type: "skill"|"bullet"|"entry_meta"|"education"|"cert"|"achievement"|"link"|"contact"|"summary_sentence",
       text, section, parentId?, tokens: {tools[], numbers[], names[], dates[]},
       source: {file, span}, provenance: "source"|"user_input", pinned: boolean }
```
- **Coverage invariant:** every fact id is referenced by the rendered tree or by `archive[]` (with reason). The export gate enforces this.
- **Pinned facts:** the user can pin "must keep". Pinned facts can never be archived or trimmed. Trimming for space never touches pinned facts, entry titles, or education.

### 6.2 Base Resume and Variants
```ts
BaseResume { facts[], structure (sections/entries referencing fact ids), header, locale, stage }
Variant { id, jdId, ops: Op[] }   // ops are small, reversible, typed
Op = Reorder | Relabel | Emphasise(bulletId) | AlignTerm(factId, tier, from, to) | SetTitleLine | RewriteSummary | Demote(factId)
```
Rules: Variants never mutate the base. Switching JD = switching variant. "Revert" = clear ops. `Demote` moves a fact to the archive and requires user confirmation unless it is a pure re-ordering.

### 6.3 Canonical schema
Use the Zod schema from earlier rounds: header, summary, education[], experience[], projects[] (`stack[]` separate from `date`), skills.groups[] (atomic items), achievements[], leadership[], certifications[] (status: completed | in_progress | coursework), custom[]. Add `locale`, `stage`, `targetRole?`.

---

## 7. PIPELINE (each stage pure, separate module, unit-tested)

1. **PARSE.** DOCX/PDF/TXT/JSON to raw blocks. Keep source spans.
2. **PARSE REVIEW (user-visible checkpoint).** Show "We found N sections, M facts" side by side with the source and let the user fix anything BEFORE tailoring. This catches dropped sections early (B01).
3. **NORMALIZE and ROUTE.** Alias match then classifier; confidence per block; < 0.7 to `needs_review`. Competitions to Achievements; clubs/roles to Leadership; courses/self-study to Certifications or Learning with a status; project blocks to Projects with `stack[]` separate from `date`.
4. **JD INTELLIGENCE.** (a) Strip markdown and normalise bullets. (b) Segment by headings using the stoplist. (c) Extract requirement candidates (patterns: "experience with", "knowledge of", "proficiency in", "familiarity with", "ability to", "N+ years", "degree in", plus noun-phrase extraction against the role pack). (d) Canonicalise via KB. (e) Classify type, assign weight. (f) Filter junk with the stoplist and title detection. (g) Run twice with the runtime LLM (self-consistency) and keep the intersection plus high-confidence deterministic hits; if fewer than 4 requirements are found, show "low confidence: paste more of the JD". (h) Always let the user edit, add and delete requirements.
5. **MATCH (evidence ladder).** For each requirement find evidence facts:
   - Demonstrated (appears in a project/experience bullet): exact or SAME alias = credit 1.0; NARROWER = 0.7.
   - Claimed only (appears only in Skills): 0.6.
   - RELATED: 0.25 (counted only in "Potential", never in "Matched").
   - None: 0 (Gap).
6. **TAILOR (SAFE ops only; Section 8).** Reorder sections by stage preset; reorder skill groups and items by JD weight; reorder projects by relevance; reorder bullets inside an entry to lead with the strongest JD match; relabel groups via NARROWER/SAME equivalence; align terms via SAME; set the title line; rewrite the summary; propose page-fit tightening.
7. **POLISH.** Deterministic cleanup first (whitespace, punctuation, ".,", "..", capitalisation, tense, parallelism, spelling with protected tokens). Optional LLM rephrase behind the verifier.
8. **LAYOUT.** schema + variant + template tokens to a layout tree. Page-fit loop (Section 10.3).
9. **VALIDATE.** Coverage gate, provenance gate, placeholder gate, lint, ATS checks, regression gate (P1).
10. **EXPORT.** HTML preview, PDF, DOCX, optional LaTeX, all from the layout tree.

### 7.1 Bullet engine details
- **Fragment repair:** a line starting lowercase or with no verb merges into the previous bullet ONLY if grammatical; otherwise rewrite or send to needs_review. After merging, run a parallelism check: mixed verb forms or 3+ "and" means split into two bullets or normalise the forms.
- **User-typed metric merge:** deterministic template first, e.g. insert `{participle phrase}` or `{with N ...}`; the LLM may smooth grammar. Verifier: all digits and protected tokens in the user text appear in the output; no new tokens. If the verifier fails, use the deterministic template.
- **Spelling/casing of user input:** fix obvious typos and casing ("ACORDING" to "according", "END points" to "endpoints"), never touching digits, protected tokens or proper nouns. If a word is unrecognised and ambiguous ("subsets" vs "subnets"), keep it and ask: "Did you mean 'subnets'?" (QUESTION, empty input not required, but needs a click).
- **Derived stack:** scan bullets against the tool lexicon; every project that mentions a known tool renders a complete "Tools:" line, otherwise none do.

### 7.2 Summary engine
Deterministic template builds a draft from ledger facts (education level, top 2 matched demonstrated proof points, differentiator, intent). The LLM may polish language only. Verifier: tokens subset of ledger tokens plus the target-role label. Keep the user's original summary as a fallback; the engine picks whichever scores higher on the rubric, and shows both so the user chooses.

### 7.3 Title line
Under the name. Format: `{honest level label} | {focus areas}`. Example for a student: `Application & Mobile Security | Penetration Testing`. Never present a student as "Engineer". If the JD title is used, it must be as intent ("Aspiring Cybersecurity Engineer") and only after the user confirms the target-role label.

---

## 8. SUGGESTION SYSTEM

Three classes only. There is no fourth.

| Class | Meaning | UI | Default state |
|---|---|---|---|
| **SAFE_EDIT** | Built purely from existing facts: reorder, relabel (SAME/NARROWER), tense, tightening, term alignment | Before/after, one-click Accept, Undo | pending |
| **QUESTION** | Needs a new fact (number, scope, outcome, tool, date, grade, location) | Plain-language question + EMPTY input. No Accept until the user types a valid value and ticks "this is true and I can explain it in an interview" | pending |
| **GAP** | JD requirement with no evidence | Read-only Gap Report row: requirement, evidence found (none/adjacent), honest note, optional "Have you used it? Yes (describe where) / No" | n/a |

**State machine:** `pending -> accepted | rejected | skipped`. Only a user event handler may change state. Never on load, refresh, preset switch, JD change, timers or LLM callbacks. "Accept all safe" applies to SAFE_EDIT only. State persists only when the user presses Save.
**Question budget (avoid fatigue):** at most 5 skill/requirement questions per JD (highest weight first), at most 1 bullet-enhancement question per entry, plus fixed profile questions (education dates, location, target-role label) when missing. Never ask about job titles, fields of work or meta headings (B06).
**Question copy:** plain language, consequence line, example format only as grey placeholder text inside the empty input ("Example format, replace with your own"). No clickable pre-written claims. No bracket placeholders anywhere.
**Gap answers:** "No" = nothing added, 0 credit, row stays in Gap Report. "Yes" requires typed evidence ("where did you use it?") before the skill can enter the resume with provenance `user_input`.

---

## 9. SCORING (one definition per number)

1. **JD Match (0 to 100)** = 70% **Coverage** + 30% **Prominence**.
   Coverage = sum(weight x credit) / sum(weight) using the evidence ladder (Section 7 step 5).
   Prominence = share of matched weight whose evidence appears in the summary, the first skills group, the first project/experience entry, or the top half of the page.
   Tailoring legitimately raises Match through Prominence and verified term alignment; it never rises through added claims. Show **Now** and **Potential if you answer the open questions** (never labelled "target max").
2. **Resume Quality (0 to 100):** Structure 20, Content 30 (bullet formula, verbs, no fragments, quantified only where facts exist), Consistency 15 (tense, dates, casing, punctuation), ATS 20 (parsable, headings, fonts, keyword forms), Completeness 15 (contact, location, education dates, links, title line).
3. **Integrity:** green "All content comes from your resume or your own input" or red "N unverified claims" (blocks export, lists the lines).
4. **Regression gate (P1):** every rubric dimension for the output must be >= the same dimension for the source. Failing elements fall back to source and are listed in a "Kept original" log.
5. Remove duplicate or undefined numbers. Every score has a tooltip explaining the formula. Never show "gained" badges unless the gain came from confirmed content or measurable prominence.

---

## 10. RENDERING AND EXPORT

### 10.1 One path
`Base + Variant -> layout tree -> {HTML preview, PDF, DOCX, LaTeX}`. Renderers are dumb translators.
**Parity test:** for every fixture and every variant, extract the section list and the normalised text from each export and diff against the layout tree. Any difference fails the build.
**Export gate:** block export if coverage < 100% (without archive entries), any provenance is missing, any `[ ]` placeholder exists, any preview-only styling leaked.

### 10.2 Renderer specifics
- **PDF:** render from the same HTML with headless Chromium (Playwright). Text must be selectable; fonts embedded; `@page` size from locale (A4 for IN); `break-inside: avoid` on entries; no orphaned headings.
- **DOCX:** use a real DOCX library. Section headings use real Heading styles. Bullets use real numbering definitions. **Right-aligned tab stop at the text width** for dates (fixes B14). Real hyperlinks. No text boxes or tables. Page size and margins from tokens. Document properties set (title, author).
- **LaTeX (optional, ship only if parity passes):** generated from the layout tree. Escape only `& % $ # _ { } ~ ^ \`. Never strip hyphens: map U+2010/U+2011 to `-`, U+2013 to `--`, U+2014 to `---`. Round-trip test: every hyphenated word in the source must survive in the PDF text.
- **Preview-only styling** (green highlights, "UPDATED" badges, added chips) must never appear in exports. Test by diffing.

### 10.3 Page-fit
Default 1 page for Student and Early Career, up to 2 for Experienced. Fit loop in order: reduce section spacing; body font down to 9.5pt; margins down to 0.5in; SAFE tightening of long bullets; then ASK the user before archiving the lowest-priority bullets (never pinned, never entry titles, never education). If content fills under 75% of the page, do not stretch: show suggestions ("Add your CGPA", "Add a Certifications section") and keep spacing normal.

### 10.4 Tokens (single source of truth)
One sans family (Inter on screen, Calibri/Carlito in DOCX, with system fallbacks). Name 24pt, section heading 11pt caps with a 0.5pt rule, body 10pt, meta 9pt, line-height 1.35, left-aligned. Templates: ATS Classic (default), Modern Compact (one accent colour, still single column), Two-tone. Templates change tokens and order config only, never content.

---

## 11. UI/UX AND LIGHT-THEME VISIBILITY

### 11.1 Layout (fixes B15)
Three panes on desktop (>=1200px):
- **Left (320px): Inputs.** Resume file card with parse summary ("7 sections, 31 facts"), "Review parse" button; JD input (cleaned, collapsible) with parsed requirement chips grouped Must / Preferred, each editable and deletable.
- **Center: Live preview**, sticky, WYSIWYG from the layout tree, A4/Letter toggle, preset switcher (Fresher / Skills First / Professional) as a segmented control, "Show changes" toggle.
- **Right (380px): Review queue** in tabs: **Safe edits** (Accept all safe), **Questions** (answer / skip), **Gaps**, **Archive / Trimmed** (restore), **Quality**.
- **Top bar (sticky):** three numbers only: JD Match (Now to Potential), Resume Quality, Integrity badge. Export button disabled with a reason tooltip when the gate fails.
Tablet/mobile: stacked with a bottom tab bar (Preview / Review / Inputs). Everything reachable by keyboard.

### 11.2 Contrast and type tokens (WCAG 2.2 AA, enforced by CI)
| Token | Value | Use | Contrast on white |
|---|---|---|---|
| text-primary | #0F172A | body, headings | ~17:1 |
| text-secondary | #334155 | labels, helper text | ~10:1 |
| text-muted | #475569 | minimum for any readable text | ~7.6:1 |
| border-control | #64748B | inputs, buttons (>=3:1) | ~4.8:1 |
| border-decor | #CBD5E1 | dividers only | decorative |
| surface-app | #F1F5F9 | page background | |
| surface-card | #FFFFFF | cards, with `1px solid #CBD5E1` and a soft shadow | |
| accent | #4338CA | primary buttons (white text), links | ~8.6:1 |
| success | bg #DCFCE7 / text #14532D | matched, accepted | >=7:1 |
| warning | bg #FEF3C7 / text #78350F | questions, needs input | >=7:1 |
| danger | bg #FEE2E2 / text #7F1D1D | errors, blocking | >=7:1 |
| info | bg #E0E7FF / text #312E81 | adjacent evidence | >=7:1 |
Rules: never use grey lighter than text-muted for text; no text below 12px (badges 12px bold); body 14 to 15px; monospace only for code-like values, at >=13px; every status uses colour AND an icon AND a word (never colour alone); visible 2px focus ring in accent; hover and disabled states still meet 3:1 for the control. Use ONE theme consistently: no dark panels inside the light page unless the whole app has a dark mode toggle. Add a dark theme with the same contrast rules and a toggle, defaulting to the OS setting.
**Test:** automated contrast check (axe-core via Playwright) fails CI on any violation at the fixture screens.

### 11.3 Key components
- **Requirement chip:** label + status icon + word ("Demonstrated", "Claimed", "Adjacent", "Gap") + tooltip with the evidence fact and where it appears.
- **Safe edit card:** section name, before/after diff, "Accept", "Reject", "Why this helps" one-liner referencing the JD requirement.
- **Question card:** plain question, empty input, optional unit, "I confirm this is true and I can explain it in an interview" checkbox, "Skip". Apply disabled until valid.
- **Parse review:** two columns, source on the left, parsed structure on the right, mismatches highlighted.
- **Archive list:** every trimmed/demoted fact with reason and a Restore button.

---

## 12. RUNTIME LLM USAGE (model-agnostic, tuned for fast models)

Tasks the LLM may do: (L1) JD requirement extraction assist, (L2) parse assist when deterministic confidence < 0.8, (L3) bullet rephrase, (L4) summary polish, (L5) user-text cleanup merge, (L6) second-opinion faithfulness judge. Everything else is code.
**Rules for every call:**
- One purpose per call, input under ~2k tokens: send only the relevant fact ids and texts, never the whole resume plus KB.
- Structured output with a JSON schema; temperature 0 for extraction/verification, <= 0.3 for rephrasing; no commentary.
- Include 2 to 3 few-shot examples from Appendix A in the prompt.
- Verify every output deterministically (token subset, digit preservation, protected tokens, length limits, no brackets). On failure: one retry with the verifier's error message, then fall back to the deterministic version.
- Self-consistency x2 for JD extraction; keep the intersection.
- Cache by content hash; log prompt, output and verifier result for evaluation; never call the LLM during layout, routing or page-fit.
- The engine must fully work with the LLM disabled (use the Phase 0 to 6 outputs).

---

## 13. TESTING

**Gold set:** `/fixtures/gold/jeswanth_gold.docx` (the hand-made resume) with `/fixtures/gold/jeswanth_raw.*` (his original raw resume). Acceptance: engine(raw + JD) scores >= gold on every Resume Quality category and contains every gold section (Summary, Education with expected graduation if the user answered the question, Skills, Projects including the L3AK CTF, Leadership, Continuous Learning).
**Fixtures:** 12+ diverse resumes (fresher cybersecurity student, senior backend engineer, designer, nurse, marketing manager, career changer, no projects, 15 skill groups, very long summary, non-English names, missing dates, deliberately messy) and 10+ real JDs (including one with raw markdown and one with 3 to 5 years required).
**Property tests (every fixture x preset x JD):**
- Coverage: every source fact in output or archive (P2).
- No fabrication: output tokens (tools, numbers, proper nouns) subset of source plus user_input (P3).
- No skill item over 6 words; no lowercase bullet start; no ".," ".." "[" "]" in output.
- No tool token in a date field; no empty headings.
- Parity across HTML/PDF/DOCX/LaTeX text (T-PARITY), hyphens preserved (T-HYPHEN).
- Education index < Skills index for Student stage.
- JD parser never emits meta headings, titles or bare industry words (T-JD).
- Quality floor: output >= source on each dimension (P1).
- All state stays `pending` after load, refresh, preset switch, JD change (T-NOFAB).
- Contrast test passes (T-CONTRAST); DOCX date tab stop is right-aligned (T-DOCX).
**Mutation tests:** inject typos, lowercase fragments and tool names into date fields; the polish stage and validators must catch each.
**Visual regression:** golden PDF snapshot per fixture; fail on diff.
**LLM eval harness:** run L1/L3/L4 on all fixtures, report verifier pass rate, fallback rate and faithfulness failures; target >= 95% verified-first-pass.

---

## 14. EXECUTION PLAN (phases with exit criteria)

| Phase | Work | Exit criteria |
|---|---|---|
| 0 | Read the codebase; write `docs/AS_IS.md` (every place that builds sections, exports, scores, accepts suggestions); write failing tests for B01 to B20; create PROGRESS.md, DECISIONS.md, `npm run verify` | AS_IS.md reviewed; all bug tests exist and fail |
| 1 | Fixtures and gold set, property-test harness | Harness runs on all fixtures |
| 2 | Fact Ledger, schema, Base/Variant model; coverage invariant | T-COVERAGE green on all fixtures |
| 3 | PARSE, PARSE REVIEW screen, NORMALIZE and ROUTE with confidence | No section loss; B02, B18, B19 green |
| 4 | One layout tree; renderers (HTML, PDF, DOCX, LaTeX) with parity and export gate | B01, B03, B04, B13, B14, B20 green; T-PARITY green |
| 5 | Polish and bullet/summary/title engines (deterministic) | B05, B08, B09, B17 green |
| 6 | KB files and JD intelligence; matching ladder; scoring | B06, B07, B10, B11 green |
| 7 | Suggestion system: SAFE_EDIT / QUESTION / GAP, state machine, question budget, Archive and Restore | B16 green; T-NOFAB green |
| 8 | UI rebuild: 3-pane layout, tokens, components, contrast CI | B12, B15 green; axe check clean |
| 9 | Runtime LLM layer with verifiers and fallbacks; LLM eval harness | Verified-first-pass >= 95%; engine still passes with LLM off |
| 10 | Role packs (8+), docs, changelog, final gold-set comparison | Gold acceptance met; all B-tests green |
After EVERY phase: run `npm run verify`, paste the pass/fail table, update PROGRESS.md.

---

## 15. KICKOFF MESSAGE (paste this into the agent)

```
Read docs/MASTER_SPEC.md fully, then follow Section 2 (operating protocol).
Start with Phase 0 ONLY:
1) Read the codebase and write docs/AS_IS.md describing where sections are built,
   where each exporter (preview, PDF, DOCX, LaTeX) makes its own decisions, where
   scores are computed, where suggestions are created and accepted, and where the JD
   is parsed.
2) Create PROGRESS.md, DECISIONS.md and `npm run verify`.
3) Write failing tests for bugs B01 to B20.
Show me the plan first. Do not change product code until the failing tests exist.
When done, report the table of failing tests and wait for my go-ahead for Phase 1.
```

---

## APPENDIX A: GOLDEN EXAMPLES (use as few-shot and as tests)

**A1. Metric merge (B05)**
- Source bullet: `Performed static analysis with JADX to locate hardcoded secrets (API keys, promo codes, tokens) embedded in a vulnerable Android APK.`
- User typed: `EVALUATED ACORDING TO 12 END points and tested 5 high level cases`
- WRONG: `...vulnerable Android APK, EVALUATED ACORDING TO 12 END points and tested 5 high level cases.`
- RIGHT: `Performed static analysis with JADX to locate hardcoded secrets (API keys, promo codes, tokens) in a vulnerable Android APK, evaluating 12 endpoints and testing 5 high-level cases.`
- Checks: digits {12, 5} preserved, tokens JADX/APK/API preserved, no new tools or numbers.

**A2. Ambiguous typo**
- User typed: `soanning 4 subsets upon 2 routers` on a Packet Tracer bullet.
- Engine: fix "soanning" to "spanning"; ask "Did you mean 4 subnets?" with a one-click confirm. Never silently change "subsets" to "subnets".

**A3. Summary (student, target Cybersecurity Engineer, application security JD)**
- Source: 75-word six-line summary ending "Seeking a cybersecurity/penetration testing internship to apply and grow these skills in a professional environment."
- RIGHT (about 50 words): `Second-year ECE student at VIT-AP focused on Android application security: static and dynamic analysis, reverse engineering and binary patching with JADX, APKTool and ADB, following OWASP MASTG. Competed in L3AK CTF 2026 and contribute to the Null InfoSec chapter. Seeking a Cybersecurity Engineer role in application security.`
- Checks: every fact exists in the ledger; no seniority claim; intent statement only.

**A4. Skills tailoring (JD wants application security, vulnerability assessment, OWASP Top 10, secure coding)**
- Reorder groups: Security Testing first, items with demonstrated evidence first (OWASP Top 10, Android application pentesting, static and dynamic analysis).
- Relabel "Security Testing" to "Application Security Testing" (NARROWER, shown as before/after).
- Keep "PowerShell basics" with its qualifier; move unmatched items (DHCP, IIS) to the end. Delete nothing.
- "Secure code review": no evidence, so it goes to the Gap Report ("Have you used it? Yes/No"), never into Skills.

**A5. Section routing (B01, B19)**
- `L3AK CTF 2026 (International Capture the Flag Competition)` with three bullets is ONE entry: title, year, bullets. Under Achievements for a student with strong projects, or kept inside Projects, but never split into four flat bullets and never dropped.
- Udemy course plus "studying OWASP MASTG" plus "solving PortSwigger labs" go under "Continuous Learning", grouped by status, never labelled "Certifications" unless a certificate exists.

**A6. JD cleanup (B06, B07)**
- Input contains `Job Title: Cybersecurity Engineer`, `Employment Type: Full-time`, `**Education:** Bachelor's degree in CS...`.
- Output: title = "Cybersecurity Engineer"; employment type ignored; education requirement = bachelor's in CS/InfoSec or equivalent (EDUCATION type, not a skill question); no "Have you used Job Title?" cards.

**A7. Fit advisory (4.11)**
- JD: "3 to 5 years of experience". Resume: student. Show the advisory, still tailor, set Potential honestly.

---

## APPENDIX B: RUNTIME PROMPT TEMPLATES (store in `/prompts`, version them)

**B1. JD extraction (temperature 0, JSON schema)**
```
You extract requirements from a cleaned job description. Return ONLY JSON.
Schema: {"title": string, "seniority": "intern|junior|mid|senior|unknown", "years_min": number|null,
 "requirements": [{"text": string, "type": "HARD_SKILL|TOOL|DOMAIN|CERT|EDUCATION|YEARS|RESPONSIBILITY|SOFT_SKILL",
 "priority": "must|preferred", "quote_span": string}]}
Rules: exclude the job title, field names (Job Title, Employment Type), benefits, company
description and the bare industry word. Each requirement must be a real skill, tool,
knowledge area, credential or responsibility, copied from the text in "quote_span".
Do not invent requirements. At most 25.
JD:
{{cleaned_jd}}
```

**B2. Bullet rephrase (temperature 0.2, JSON schema)**
```
Rewrite ONE resume bullet. Return ONLY {"bullet": string}.
Rules: keep every fact, tool, number and proper noun exactly; add nothing; start with a strong
past-tense verb from the same meaning category; 12 to 28 words; one sentence ending with a
period; use the target term "{{jd_term}}" only if it is listed as SAME or NARROWER-equivalent
to "{{resume_term}}".
Protected tokens: {{protected_tokens}}
Bullet: {{bullet}}
```

**B3. User-text merge (temperature 0)**
```
Merge the user's added detail into the bullet as a grammatical clause. Return ONLY {"bullet": string}.
Fix spelling and casing in the added detail. Do not change any digit. Do not add facts.
If a word is ambiguous, keep it unchanged and list it in "unsure": [string].
Bullet: {{bullet}}
Added detail (user-typed): {{user_text}}
```

**B4. Summary polish (temperature 0.2)**
```
Polish this draft summary using ONLY the facts provided. Return ONLY {"summary": string}.
Max 55 words, 2 to 3 sentences, no clichés, no seniority or experience claims.
Facts: {{facts}}
Target role label (intent only): {{target_role}}
Draft: {{draft}}
```

**B5. Faithfulness judge (temperature 0; secondary to the deterministic verifier)**
```
Compare SOURCE and OUTPUT. Return ONLY {"added_claims": [string], "removed_facts": [string], "verdict": "pass|fail"}.
Fail if OUTPUT adds any tool, number, name, date, outcome or skill absent from SOURCE.
SOURCE: {{source}}
OUTPUT: {{output}}
```

---

## DEFINITION OF DONE

1. Every bug B01 to B20 has a passing regression test.
2. On the Jeswanth gold set, engine output >= gold on every Resume Quality category, with all sections present and exports identical.
3. Zero fabricated tokens across all fixtures x presets x JDs, with the LLM on and off.
4. One JD Match, one Resume Quality, one Integrity number, each defined.
5. UI passes the contrast check and the resume is visible while reviewing.
6. Changelog maps every change to the bug IDs it fixes.
