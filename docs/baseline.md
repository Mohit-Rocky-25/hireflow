# HireFlow v3 Baseline Performance Report (Stage 0.6)

> Recorded on: 2026-10-21
> Status: Baseline measurements before any engine changes or refactoring.

## Baseline Evaluation Matrix

| Test Pair | Candidate & Role | Overall ATS Score | Hard Skills Met | Evidence Score | Seniority / Readiness | Format Safety | Top Warnings / Findings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pair 1** | Strong CS B.Tech, 8.64 CGPA, Node/React/PG, Internship | **59 / 100** | 3/7 | N/A | 10 | N/A | Keyword Stuffing Detected (-9) |
| **Pair 2** | ECE B.E., Embedded C, FreeRTOS, STM32/ESP32, No internship | **78 / 100** | 7/9 | N/A | 10 | N/A | None |
| **Pair 3** | Tier-3 IT B.Tech, 7.15 CGPA, weak verbs, no metrics | **53 / 100** | 5/7 | N/A | 10 | N/A | Keyword Stuffing Detected (-10) |
| **Pair 4** | Two-column interleaved paste, React/TS/Next, FinTech intern | **29 / 100** | 7/13 | N/A | 10 | N/A | Keyword Stuffing Detected (-10); Missing Dedicated EDUCATION Section (-3); Missing Dedicated SKILLS Section (-3); Missing Dedicated PROJECTS Section (-3) |
| **Pair 5** | Mechanical B.Tech switcher, Django/Python/SQL projects | **55 / 100** | 7/16 | N/A | 10 | N/A | None |
| **Pair 6** | 40+ buzzwords listed, only 1 basic portfolio project | **46 / 100** | 6/16 | N/A | 10 | N/A | Keyword Stuffing Detected (-10) |

## Detailed Fixture Outputs

### Pair 1: Strong CS Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_01_strong_cs.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 59
- **Band:** Needs work
- **Confidence:** High
- **Headline:** High Risk ATS Profile (3/7 must-haves met) · Missing core job requirements
- **Must Haves Met:** 3/7
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-9)
- **Skills Detected (8):** java, cpp, dsa, sql, javascript, css, spring_boot, rest_apis
- **Missing Sections:** None
- **Weak Bullets Count:** 1
- **Metrics Ratio:** 33%

### Pair 2: ECE Embedded Fresher vs Embedded Firmware GET
- **Resume Fixture:** `resume_02_ece_embedded.txt`
- **JD Fixture:** `jd_05_embedded_firmware_engineer.txt`
- **ATS Overall Score:** 78
- **Band:** Competitive
- **Confidence:** High
- **Headline:** Strong Core Match (7/9 must-haves met) · Minor evidence gaps detected
- **Must Haves Met:** 7/9
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** None
- **Skills Detected (8):** embedded_c, rtos, iot, microcontrollers, hardware_protocols, c, cpp, python
- **Missing Sections:** None
- **Weak Bullets Count:** 2
- **Metrics Ratio:** 20%

### Pair 3: Sparse Bullets Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_03_sparse_bullets.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 53
- **Band:** Needs work
- **Confidence:** High
- **Headline:** Moderate Alignment (5/7 must-haves met) · Key requirements missing
- **Must Haves Met:** 5/7
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10)
- **Skills Detected (8):** java, sql, linux_sysadmin, linux, git, javascript, html, css
- **Missing Sections:** None
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 0%

### Pair 4: Two-Column Paste Fresher vs Junior Frontend Startup
- **Resume Fixture:** `resume_04_twocolumn_raw_paste.txt`
- **JD Fixture:** `jd_02_startup_frontend_fresher.txt`
- **ATS Overall Score:** 29
- **Band:** Weak match
- **Confidence:** Low
- **Headline:** Moderate Alignment (7/13 must-haves met) · Key requirements missing
- **Must Haves Met:** 7/13
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10), Missing Dedicated EDUCATION Section (-3), Missing Dedicated SKILLS Section (-3), Missing Dedicated PROJECTS Section (-3)
- **Skills Detected (9):** typescript, react, tailwind_css, rest_apis, vitest, javascript, css, next_js, docker
- **Missing Sections:** education, skills, projects
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 0%

### Pair 5: Mechanical Switcher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_05_career_switcher_mech.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 55
- **Band:** Needs work
- **Confidence:** High
- **Headline:** High Risk ATS Profile (7/16 must-haves met) · Missing core job requirements
- **Must Haves Met:** 7/16
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** None
- **Skills Detected (8):** python, django, rest_apis, sql, postgresql, linux_sysadmin, linux, git
- **Missing Sections:** None
- **Weak Bullets Count:** 2
- **Metrics Ratio:** 20%

### Pair 6: Overstuffed Skills Fresher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_06_overstuffed_skills.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 46
- **Band:** Needs work
- **Confidence:** High
- **Headline:** High Risk ATS Profile (6/16 must-haves met) · Missing core job requirements
- **Must Haves Met:** 6/16
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10)
- **Skills Detected (14):** python, typescript, node_js, django, fastapi, sql, redis, docker, postgresql, mysql, message_queues, kafka, rabbitmq, aws
- **Missing Sections:** None
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 0%

