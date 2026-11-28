# HireFlow v3 Baseline Performance Report (Stage 0.6)

> Recorded on: 2026-11-27
> Status: Baseline measurements before any engine changes or refactoring.

## Baseline Evaluation Matrix

| Test Pair | Candidate & Role | Overall ATS Score | Hard Skills Met | Evidence Score | Seniority / Readiness | Format Safety | Top Warnings / Findings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pair 1** | Strong CS B.Tech, 8.64 CGPA, Node/React/PG, Internship | **71 / 100** | 2/9 | N/A | 0 | N/A | None |
| **Pair 2** | ECE B.E., Embedded C, FreeRTOS, STM32/ESP32, No internship | **44 / 100** | 0/9 | N/A | 0 | N/A | None |
| **Pair 3** | Tier-3 IT B.Tech, 7.15 CGPA, weak verbs, no metrics | **43 / 100** | 0/9 | N/A | 0 | N/A | None |
| **Pair 4** | Two-column interleaved paste, React/TS/Next, FinTech intern | **16 / 100** | 0/16 | N/A | 0 | N/A | Missing Dedicated SKILLS Section (-3); Missing Dedicated PROJECTS Section (-3) |
| **Pair 5** | Mechanical B.Tech switcher, Django/Python/SQL projects | **39 / 100** | 0/19 | N/A | 0 | N/A | Missing Dedicated SKILLS Section (-3) |
| **Pair 6** | 40+ buzzwords listed, only 1 basic portfolio project | **24 / 100** | 0/19 | N/A | 0 | N/A | Keyword Stuffing Detected (-10) |

## Detailed Fixture Outputs

### Pair 1: Strong CS Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_01_strong_cs.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 71
- **Band:** Competitive
- **Confidence:** High
- **Headline:** High Risk ATS Profile (2/9 must-haves met) · Missing core job requirements
- **Must Haves Met:** 2/9
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** None
- **Skills Detected (8):** java, dsa, sql, git, linux, linux_sysadmin, html, rest_apis
- **Missing Sections:** None
- **Weak Bullets Count:** 5
- **Metrics Ratio:** 44%

### Pair 2: ECE Embedded Fresher vs Embedded Firmware GET
- **Resume Fixture:** `resume_02_ece_embedded.txt`
- **JD Fixture:** `jd_05_embedded_firmware_engineer.txt`
- **ATS Overall Score:** 44
- **Band:** Weak match
- **Confidence:** High
- **Headline:** High Risk ATS Profile (0/9 must-haves met) · Missing core job requirements
- **Must Haves Met:** 0/9
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** None
- **Skills Detected (7):** embedded_c, iot, rtos, hardware_protocols, c, cpp, python
- **Missing Sections:** None
- **Weak Bullets Count:** 8
- **Metrics Ratio:** 0%

### Pair 3: Sparse Bullets Fresher vs Campus SDE Drive
- **Resume Fixture:** `resume_03_sparse_bullets.txt`
- **JD Fixture:** `jd_01_campus_sde_fresher.txt`
- **ATS Overall Score:** 43
- **Band:** Weak match
- **Confidence:** High
- **Headline:** High Risk ATS Profile (0/9 must-haves met) · Missing core job requirements
- **Must Haves Met:** 0/9
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** None
- **Skills Detected (6):** java, sql, git, linux, linux_sysadmin, html
- **Missing Sections:** None
- **Weak Bullets Count:** 10
- **Metrics Ratio:** 0%

### Pair 4: Two-Column Paste Fresher vs Junior Frontend Startup
- **Resume Fixture:** `resume_04_twocolumn_raw_paste.txt`
- **JD Fixture:** `jd_02_startup_frontend_fresher.txt`
- **ATS Overall Score:** 16
- **Band:** Weak match
- **Confidence:** Low
- **Headline:** High Risk ATS Profile (0/16 must-haves met) · Missing core job requirements
- **Must Haves Met:** 0/16
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** Missing Dedicated SKILLS Section (-3), Missing Dedicated PROJECTS Section (-3)
- **Skills Detected (11):** css, react, tailwind_css, typescript, rest_apis, tanstack_query, vitest, javascript, zustand, next_js, docker
- **Missing Sections:** education, skills, projects
- **Weak Bullets Count:** 0
- **Metrics Ratio:** 0%

### Pair 5: Mechanical Switcher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_05_career_switcher_mech.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 39
- **Band:** Weak match
- **Confidence:** High
- **Headline:** High Risk ATS Profile (0/19 must-haves met) · Missing core job requirements
- **Must Haves Met:** 0/19
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** Missing Dedicated SKILLS Section (-3)
- **Skills Detected (8):** rest_apis, postgresql, sql, node_js, or_mysql_or_postgresql, git, linux, linux_sysadmin
- **Missing Sections:** skills
- **Weak Bullets Count:** 6
- **Metrics Ratio:** 14%

### Pair 6: Overstuffed Skills Fresher vs Fintech Backend SDE 1
- **Resume Fixture:** `resume_06_overstuffed_skills.txt`
- **JD Fixture:** `jd_03_backend_intern_to_fte.txt`
- **ATS Overall Score:** 24
- **Band:** Weak match
- **Confidence:** High
- **Headline:** High Risk ATS Profile (0/19 must-haves met) · Missing core job requirements
- **Must Haves Met:** 0/19
- **Subscores:** Hard Skills: undefined, Evidence: undefined, Seniority: 0, Format Safety: undefined
- **Penalties:** Keyword Stuffing Detected (-10)
- **Skills Detected (11):** rest_apis, postgresql, sql, redis, aws, docker, node_js, or_mysql_or_postgresql, kafka, message_queues, rabbitmq
- **Missing Sections:** None
- **Weak Bullets Count:** 3
- **Metrics Ratio:** 0%

