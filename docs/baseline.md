# HireFlow v3 Baseline Performance Report (Stage 0.6)

> Recorded on: 2026-10-18
> Status: Baseline measurements before any engine changes or refactoring.

## Baseline Evaluation Matrix

| Test Pair | Candidate & Role | Overall ATS Score | Hard Skills Met | Evidence Score | Seniority / Readiness | Format Safety | Top Warnings / Findings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pair 1** | Strong CS B.Tech, 8.64 CGPA, Node/React/PG, Internship | **61 / 100** | 7/8 | N/A | 7 | N/A | Keyword Stuffing Detected (-10) |
| **Pair 2** | ECE B.E., Embedded C, FreeRTOS, STM32/ESP32, No internship | **69 / 100** | 7/9 | N/A | 5 | N/A | Missing Dedicated EXPERIENCE Section (-3) |
| **Pair 3** | Tier-3 IT B.Tech, 7.15 CGPA, weak verbs, no metrics | **29 / 100** | 6/8 | N/A | 5 | N/A | Keyword Stuffing Detected (-10); Missing Dedicated EXPERIENCE Section (-3); Resume Abnormally Brief (-4) |
| **Pair 4** | Two-column interleaved paste, React/TS/Next, FinTech intern | **8 / 100** | 9/15 | N/A | 10 | N/A | Keyword Stuffing Detected (-10); Missing Dedicated EXPERIENCE Section (-3); Missing Dedicated EDUCATION Section (-3); Missing Dedicated SKILLS Section (-3); Missing Dedicated PROJECTS Section (-3); Resume Abnormally Brief (-4) |
| **Pair 5** | Mechanical B.Tech switcher, Django/Python/SQL projects | **59 / 100** | 13/20 | N/A | 5 | N/A | Missing Dedicated EXPERIENCE Section (-3) |
| **Pair 6** | 40+ buzzwords listed, only 1 basic portfolio project | **30 / 100** | 12/20 | N/A | 5 | N/A | Keyword Stuffing Detected (-10); Missing Dedicated EXPERIENCE Section (-3); Resume Abnormally Brief (-4) |

## Detailed Fixture Outputs

### Pair 1: Strong CS Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_01_strong_cs.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 61
- **Band:** Needs work
- **Confidence:** High
- **Headline:** Strong Core Match (7/8 must-haves met) · Minor evidence gaps detected
- **Must Haves Met:** 7/8
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 7, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10)
- **Skills Detected (12):** java, cpp, dsa, sql, linux_sysadmin, linux, git, javascript, html, css, spring_boot, rest_apis
- **Missing Sections:** None
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 44%

### Pair 2: ECE Embedded Fresher vs Embedded Firmware GET
- **Resume Fixture:** `resume_02_ece_embedded.txt`
- **JD Fixture:** `jd_05_embedded_firmware_engineer.txt`
- **ATS Overall Score:** 69
- **Band:** Needs work
- **Confidence:** High
- **Headline:** Strong Core Match (7/9 must-haves met) · Minor evidence gaps detected
- **Must Haves Met:** 7/9
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 5, Format Safety: undefined
- **Penalties:** Missing Dedicated EXPERIENCE Section (-3)
- **Skills Detected (8):** embedded_c, rtos, iot, microcontrollers, hardware_protocols, c, cpp, python
- **Missing Sections:** experience
- **Weak Bullets Count:** 1
- **Metrics Ratio:** 25%

### Pair 3: Sparse Bullets Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_03_sparse_bullets.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 29
- **Band:** Weak match
- **Confidence:** High
- **Headline:** Strong Core Match (6/8 must-haves met) · Minor evidence gaps detected
- **Must Haves Met:** 6/8
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 5, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10), Missing Dedicated EXPERIENCE Section (-3), Resume Abnormally Brief (-4)
- **Skills Detected (9):** java, cpp, sql, linux_sysadmin, linux, git, javascript, html, css
- **Missing Sections:** experience
- **Weak Bullets Count:** 1
- **Metrics Ratio:** 0%

### Pair 4: Two-Column Paste Fresher vs Junior Frontend Startup
- **Resume Fixture:** `resume_04_twocolumn_raw_paste.txt`
- **JD Fixture:** `jd_02_startup_frontend_fresher.txt`
- **ATS Overall Score:** 8
- **Band:** Weak match
- **Confidence:** Medium
- **Headline:** Moderate Alignment (9/15 must-haves met) · Key requirements missing
- **Must Haves Met:** 9/15
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 10, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10), Missing Dedicated EXPERIENCE Section (-3), Missing Dedicated EDUCATION Section (-3), Missing Dedicated SKILLS Section (-3), Missing Dedicated PROJECTS Section (-3), Resume Abnormally Brief (-4)
- **Skills Detected (11):** typescript, react, tailwind_css, rest_apis, vitest, javascript, css, redux, zustand, next_js, docker
- **Missing Sections:** experience, education, skills, projects
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 0%

### Pair 5: Mechanical Switcher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_05_career_switcher_mech.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 59
- **Band:** Needs work
- **Confidence:** High
- **Headline:** Moderate Alignment (13/20 must-haves met) · Key requirements missing
- **Must Haves Met:** 13/20
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 5, Format Safety: undefined
- **Penalties:** Missing Dedicated EXPERIENCE Section (-3)
- **Skills Detected (13):** python, typescript, node_js, django, fastapi, rest_apis, microservices, sql, postgresql, mysql, linux_sysadmin, linux, git
- **Missing Sections:** experience
- **Weak Bullets Count:** 1
- **Metrics Ratio:** 25%

### Pair 6: Overstuffed Skills Fresher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_06_overstuffed_skills.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 30
- **Band:** Weak match
- **Confidence:** High
- **Headline:** Moderate Alignment (12/20 must-haves met) · Key requirements missing
- **Must Haves Met:** 12/20
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 5, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10), Missing Dedicated EXPERIENCE Section (-3), Resume Abnormally Brief (-4)
- **Skills Detected (16):** python, typescript, node_js, django, fastapi, rest_apis, microservices, sql, redis, docker, postgresql, mysql, message_queues, kafka, rabbitmq, aws
- **Missing Sections:** experience
- **Weak Bullets Count:** 1
- **Metrics Ratio:** 0%

