# Pathways Moderated Usability Testing Protocol (Stage S11)

**Version**: 1.0.0  
**Target Audience**: 5 Undergraduates (B.Tech/B.E./MCA), 3rd/4th Year, Tier-2/Tier-3 Engineering Colleges in India  
**Format**: 45-minute remote/in-person moderated think-aloud session  
**Governing Standard**: Constitution Part B & Spec C10/C14  

---

## 1. Moderator Guide & Pre-Session Setup

### 1.1 Facilitator Welcome & Context (2 minutes)
> *"Hello! Thank you for taking the time to test HireFlow Pathways. Today we are testing an intelligence and offer simulation tool built specifically for Indian engineering students preparing for campus placements. There are no right or wrong answers; we are testing the tool, not you. Please think out loud as you interact with each screen. All your entries remain strictly local in your browser and are never uploaded."*

### 1.2 Participant Baseline Profiles
- **Participant 1 (P1)**: 3rd Year (Sem 6) B.Tech CSE, CGPA 8.1, cleared backlogs.
- **Participant 2 (P2)**: 4th Year (Sem 7) B.Tech ECE, CGPA 6.4, 1 active backlog.
- **Participant 3 (P3)**: 3rd Year (Sem 5) B.Tech Mechanical, CGPA 7.2, target IT mass hiring.
- **Participant 4 (P4)**: 4th Year (Sem 8) MCA, CGPA 7.8, multiple campus offers pending review.
- **Participant 5 (P5)**: 3rd Year (Sem 6) B.Tech IT, Diploma background (no 12th percentage), CGPA 8.6.

---

## 2. Structured Evaluation Tasks

### Task 1: 30-Second Eligibility Radar (Budget 3 Inputs)
- **Prompt**: *"Open the Pathways Eligibility Radar. Using only your branch, passing year, and current CGPA, find which campus programs you qualify for right now."*
- **Success Criteria**:
  - Participant enters only 3 core inputs without feeling compelled to fill optional fields.
  - Understands the difference between "Meets Published Criteria", "Check These Details", and "Does Not Meet a Criterion" in $< 30$ seconds.
- **Observation Metrics**:
  - Time to first result (Target: $< 15$ seconds).
  - Number of clicks before understanding criteria status.
  - Confusion or hesitation around branch aliases (e.g. E&TC vs ECE).

### Task 2: CGPA Gap Bridge Target
- **Prompt**: *"You want to qualify for TCS Prime, which requires a minimum 7.50 CGPA. Using the CGPA Gap Calculator, figure out what average GPA you need to score across your remaining semesters."*
- **Success Criteria**:
  - Participant locates the CGPA Gap Calculator.
  - Inputs current CGPA and completed semesters.
  - Understands the output formula ($R = \frac{T \cdot N - C \cdot n}{N - n}$) and notes the assumption of equal credit weighting.
- **Observation Metrics**:
  - Did the student notice the caveat *"Your university's formula may weight credits differently"*?
  - Does the student recognize if the target is mathematically unreachable ($R > 10$)?

### Task 3: Offer Deconstruction & Exit Exposure Evaluation
- **Prompt**: *"Imagine you received an offer: Annual Fixed Pay of ₹7,00,000, Variable Target of ₹1,00,000, Joining Bonus of ₹50,000, with a 24-month service bond of ₹2,00,000. Use the Offer Evaluator to determine: (1) what you receive monthly if variable pay is zero, (2) how much money you owe if you leave at Month 6, and (3) what questions you should ask HR before accepting."*
- **Success Criteria**:
  - Locates the 3 monthly in-hand scenarios (100%, 50%, 0%).
  - Identifies that Employee PF is marked as *"saved for you in EPFO, not lost"*.
  - Reads the Month 6 exit exposure figure in the timeline table.
  - Reads the suggested HR questions and checks off at least two items.
- **Observation Metrics**:
  - Did the participant comprehend the difference between CTC and gross cash?
  - Did the participant read the statutory service bond disclaimer?

### Task 4: Data Provenance & Error Reporting
- **Prompt**: *"You suspect that a company changed its backlog cutoff last week. Find out where Pathways gets its data from, and show how you would report an error or submit a correction."*
- **Success Criteria**:
  - Navigates to `/tools/pathways/about-data` or clicks an EvidenceChip.
  - Reads the official government and company primary source references.
  - Opens the Report an Error modal, copies the correction YAML, or submits local feedback.
- **Observation Metrics**:
  - Trust level in the data after seeing exact snippets ($\le 15$ words) and retrieval dates.

---

## 3. Post-Session Quantitative Questionnaire

1. **System Usability Score (SUS)** (Scale 1–5):
   - *"I found Pathways easy to use without external instructions."*
   - *"I feel confident that the offer take-home simulator gave me an honest picture of CTC deductions."*
   - *"The fact that all my data stays in my browser makes me trust the tool more."*
2. **Copy Clarity Rating**:
   - Were any terms confusing? (e.g., "Pro-rata bond", "Statutory ceiling", "87A rebate").
3. **Net Utility**:
   - Would you recommend Pathways to a classmate before attending campus placement drives?

---

## 4. Archival & Feedback Loop
All moderated feedback is stored locally using the local export mechanism (C10) and committed to `docs/pathways/reports/moderated-session-findings.md` upon completion.
