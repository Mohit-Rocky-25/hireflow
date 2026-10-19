# HireFlow v4: Metric Inventory & Mathematical Specifications

This inventory documents every derived score, ratio, and match percentage across candidate tools in HireFlow v4.
In accordance with Principle P-1 (Zero Fabrication) and Requirement B6 ("How is this calculated?"), every metric is deterministically derived from live configuration constants (`src/config/scoring.ts`, `src/config/limits.ts`, `src/data/presets/role-presets.json`) and runtime candidate inputs.

---

## 1. Overall ATS Score (`overall-ats-score`)

- **Identifier**: `overall-ats-score`
- **User-Facing Title**: Resume Strength & ATS Score
- **Unit**: `/100`
- **Dynamic Formula**:
  ```
  OverallScore = (HardSkills * ATS_PILLAR_WEIGHTS.hardSkills)
               + (EvidenceQuality * ATS_PILLAR_WEIGHTS.evidenceQuality)
               + (FresherReadiness * ATS_PILLAR_WEIGHTS.fresherReadiness)
               + (FormatSafety * ATS_PILLAR_WEIGHTS.formatSafety)
  ```
- **Configuration Source**: `ATS_PILLAR_WEIGHTS` in `src/config/scoring.ts`
  - `hardSkills`: 0.40 (40%)
  - `evidenceQuality`: 0.25 (25%)
  - `fresherReadiness`: 0.20 (20%)
  - `formatSafety`: 0.15 (15%)
- **Inputs**:
  1. `HardSkillsScore` (0-100): Weighted match against target role / JD skills
  2. `EvidenceQualityScore` (0-100): Quantifiable metrics, active verbs, and bullet depth
  3. `FresherReadinessScore` (0-100): Academic/personal projects, GitHub links, degree proof
  4. `FormatSafetyScore` (0-100): Parsing fidelity, absence of tables/multi-columns/broken glyphs
- **Data Provenance**: 2026–2027 Indian Campus Placement & Fresher ATS benchmarks.
- **Honest Limitations**:
  - Heuristic score based on standard ATS parser behaviors (Workday, Greenhouse, Taleo, Darwinbox).
  - High score does not guarantee interview shortlisting, which depends on campus quota and hiring volumes.
  - Cannot verify whether stated project accomplishments correspond to active repositories.

---

## 2. JD Match Score (`jd-match-score`)

- **Identifier**: `jd-match-score`
- **User-Facing Title**: Job Description Match Score
- **Unit**: `%`
- **Dynamic Formula**:
  ```
  MatchScore = (∑ (RequirementWeight * MatchCredit * EvidenceMultiplier)) / (∑ RequirementWeight) * 100
  ```
- **Configuration Source**:
  - `REQUIREMENT_WEIGHT_CLASSES` (`mandatory`: 3.0, `preferred`: 1.5, `mentioned`: 1.0)
  - `MATCH_CLASSIFICATION_MULTIPLIERS` (`DIRECT`: 1.0, `TRANSFERABLE`: 0.7, `PARTIAL`: 0.4, `MISSING`: 0.0)
  - `EVIDENCE_LEVEL_MULTIPLIERS` (`L3`: 1.0, `L2`: 0.85, `L1`: 0.65, `L0`: 0.35)
- **Inputs**:
  - Target Job Description parsed requirements
  - Candidate resume matched tokens, alias graph resolution, and section placement
- **Data Provenance**: Parsed directly from user-uploaded or pasted target JD.
- **Honest Limitations**:
  - Semantic matching evaluates textual overlap and known technical taxonomies.
  - Cannot evaluate problem-solving intuition or live debugging abilities.

---

## 3. Hard Skills Coverage (`hard-skills-coverage`)

- **Identifier**: `hard-skills-coverage`
- **User-Facing Title**: Technical Hard Skills Coverage
- **Unit**: `%`
- **Dynamic Formula**:
  ```
  Coverage = (Evidenced Mandatory Skills / Total Mandatory Skills in JD) * 100
  ```
- **Configuration Source**: `REQUIREMENT_WEIGHT_CLASSES.mandatory` (3.0)
- **Inputs**:
  - Count of mandatory skills identified in target role
  - Count of those skills found in candidate projects or skills list
- **Data Provenance**: Target role specifications.
- **Honest Limitations**:
  - A skill listed in a "Skills" section counts as evidenced (L0 tier) even without bullet proof. Check Evidence Quality for demonstrated ability.

---

## 4. Evidence Quality & Depth (`evidence-depth-score`)

- **Identifier**: `evidence-depth-score`
- **User-Facing Title**: Evidence Depth & Quantifiable Metrics
- **Unit**: `/100`
- **Dynamic Formula**:
  ```
  EvidenceScore = (∑ BulletTierMultipliers) / TotalBullets * 100
  where L3_MEASURED_OUTCOME = 1.0, L2_INTERNSHIP = 0.85, L1_PROJECT = 0.65, L0_LISTED = 0.35
  ```
- **Configuration Source**: `EVIDENCE_LEVEL_MULTIPLIERS` in `src/config/scoring.ts`
- **Inputs**:
  - Bullet points parsed from Experience and Project sections
  - Regex detection of numerical metrics (percentages, latency ms, query times, throughput, user counts)
- **Data Provenance**: Client-side regex pattern extraction over candidate resume text.
- **Honest Limitations**:
  - Detects syntactic presence of digits and units; cannot mathematically verify whether "reduced latency by 45%" was real.

---

## 5. Verb Impact Score (`verb-impact-score`)

- **Identifier**: `verb-impact-score`
- **User-Facing Title**: Action Verb Impact Density
- **Unit**: `/100`
- **Dynamic Formula**:
  ```
  VerbScore = ((StrongVerbs * 1.15) + (StandardVerbs * 1.0) - (WeakVerbs * 0.3)) / TotalBullets * 100
  ```
- **Configuration Source**: `VERB_STRENGTH_MODIFIERS` in `src/config/scoring.ts`
  - `STRONG`: 1.15 (architected, implemented, built, optimized, deployed)
  - `STANDARD`: 1.0 (created, developed, configured, maintained)
  - `WEAK`: 0.70 (assisted, worked on, helped)
- **Inputs**: Initial token of each bullet point across projects and experience.
- **Data Provenance**: Indian engineering placement resume taxonomy.
- **Honest Limitations**:
  - Lexical evaluation only; strong verbs cannot compensate for an absence of technical depth.

---

## 6. Demanded Skill Cross-JD Score (`demanded-skill-score`)

- **Identifier**: `demanded-skill-score`
- **User-Facing Title**: Cross-JD Market Demand Score
- **Unit**: `pts`
- **Dynamic Formula**:
  ```
  Score = (MandatoryCount * 3.0 + PreferredCount * 1.5 + MentionedCount * 1.0) / TotalSavedJDs
  ```
- **Configuration Source**: `REQUIREMENT_WEIGHT_CLASSES` in `src/config/scoring.ts`
- **Inputs**: Candidate's library of saved JDs (threshold: ≥ 3 JDs required).
- **Data Provenance**: User's saved job description library.
- **Honest Limitations**:
  - Reflects only the JDs manually saved by the user. If the user only saves fintech JDs, enterprise SaaS requirements will be underrepresented.

---

## 7. Branch Bridge Transferability (`branch-bridge-match`)

- **Identifier**: `branch-bridge-match`
- **User-Facing Title**: Non-CS Branch Bridge Alignment
- **Unit**: `%`
- **Dynamic Formula**:
  ```
  BridgeAlignment = (CandidateTransferableSkills.length + CandidateCoreSkills.length) / TotalRoleCoreSkills * 100
  ```
- **Configuration Source**: `src/data/presets/role-presets.json` (AICTE curriculum mappings).
- **Inputs**: User declared engineering branch (e.g. ECE, EEE, Mechanical, Civil), evidenced resume skills.
- **Data Provenance**: Standard Indian AICTE model curriculum (2018–2024 revisions).
- **Honest Limitations**:
  - Autonomous engineering colleges and tier-1 universities (IITs, NITs, BITS) may offer custom software electives not captured in standard AICTE branch profiles.
