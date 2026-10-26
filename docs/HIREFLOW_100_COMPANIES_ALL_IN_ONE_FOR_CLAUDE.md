# HIREFLOW: 100 INDIAN RECRUITER COMPANIES & CALIBRATED ROLES — COMPLETE ALL-IN-ONE MASTER SPECIFICATION

> **DOCUMENT SUMMARY**:  
> This single file contains the **entire blueprint, schemas, 20 competency tokens, 100-company roster, and prompt template** for Claude.  
> You can drag & drop or upload this single file directly into Claude (https://claude.ai).  
> Claude will use this file to generate the stage-by-stage data payloads and instructions for Antigravity to integrate directly into HireFlow.

---

## 1. INSTRUCTIONS FOR CLAUDE

You are a Principal Talent Intelligence Engineer and Technical Recruiter specializing in the Indian engineering placement market (Tier-1, Tier-2, and Tier-3 university campus recruitment, GCCs, core engineering MNCs, prop-trading desks, and Indian tech unicorns).

Your task is to generate the production-ready dataset entries for **HireFlow** (an advanced career intelligence and resume auditing engine) covering our 100-company master roster.

### Execution Protocol:
- Work **Stage-by-Stage** in 5 sequential stages (20 companies per stage).
- For each stage, generate a clean JSON payload matching the exact HireFlow schema defined below.
- Accompany each payload with a direct execution instruction so the user can copy the output and give it directly to Antigravity to inject into the codebase.

---

## 2. STRICT SCHEMA SPECIFICATIONS

### A. The 20 Engine-Recognized Competencies (CHOOSE ONLY FROM THESE):
Every role must select 4 to 6 competencies **strictly** from this list so that HireFlow's `COMPETENCY_SIGNALS` engine can evaluate candidate resumes:
```typescript
export type RecognizedCompetency =
  | 'dsa'            // Data Structures, Algorithms, Problem Solving, LeetCode, Big-O
  | 'systemdesign'   // Distributed Systems, Microservices, Caching, Kafka, Load Balancing
  | 'java'           // Spring Boot, Core Java, JVM Tuning, Hibernate, Enterprise APIs
  | 'python'         // Django, FastAPI, Data Pipelines, Asyncio, Scripting
  | 'golang'         // Go, Goroutines, Channels, Gin, Microservices, gRPC
  | 'nodejs'         // Node.js, Express, Fastify, Event-Loop, Async I/O
  | 'react'          // React.js, Next.js, Redux, State Management, Frontend UI
  | 'typescript'     // Strict TypeScript, Interfaces, Generics, Type Safety
  | 'aws'            // EC2, S3, Lambda, RDS, DynamoDB, Cloud Architecture
  | 'kubernetes'     // K8s, Docker, Helm, Ingress, Pod Management, GitOps
  | 'ml'             // Machine Learning, PyTorch, Scikit-learn, Deep Learning, NLP
  | 'databases'      // PostgreSQL, MySQL, MongoDB, Redis, SQL Optimization, Indexing
  | 'leadership'     // Code Review, Mentorship, Sprint Leadership, Technical Roadmaps
  | 'devops'         // CI/CD, GitHub Actions, Docker, Terraform, Prometheus/Grafana
  | 'security'       // OWASP Top 10, JWT, OAuth2, RBAC, Encryption, AppSec
  | 'swift'          // Swift, SwiftUI, iOS Architecture, CoreData, Combine
  | 'kotlin'         // Kotlin, Jetpack Compose, Android SDK, Coroutines, Room
  | 'finance'        // Payment Gateways, Double-Entry Ledgers, Quant Markets, Banking APIs
  | 'communication'  // Technical Writing, RFCs, System Specs, Client Interactions
  | 'concurrency';   // Multithreading, Thread Pools, Mutexes, Race Condition Prevention
```

### B. Company Data Shape:
```json
{
  "id": "visteon",
  "name": "Visteon Corporation",
  "logo": "VIS",
  "gradient": "from-orange-500 to-amber-400",
  "industry": "Automotive Cockpit Electronics & ADAS",
  "hq": "Chennai / Pune, India",
  "tier": "PRODUCT_MNC",
  "hiring2023": 450,
  "hiring2024": 520,
  "openRoles": 24,
  "avgPackage": "₹8.0 - 13.5 LPA",
  "glassdoor": 4.1,
  "roles": [ ... ]
}
```
*Note for `tier`: Must be one of `'FAANG' | 'UNICORN' | 'PRODUCT_MNC' | 'GCC' | 'IT_SERVICES' | 'STARTUP'`.*

### C. Role Data Shape (3–4 calibrated roles per company):
```json
{
  "title": "Embedded Software Engineer — Digital Cockpit",
  "level": "Entry / GET",
  "desc": "Develops real-time automotive middleware, digital clusters, and AUTOSAR device drivers in Embedded C/C++.",
  "competencies": ["concurrency", "systemdesign", "security", "communication"],
  "reqLevel": {
    "concurrency": "strong",
    "systemdesign": "strong",
    "security": "working",
    "communication": "working"
  },
  "location": "Chennai / Pune, India",
  "employmentType": "Full-time",
  "experienceLevel": "0-2 years",
  "aboutRole": "As an Embedded Software Engineer at Visteon, you will shape the next generation of digital cockpit clusters, infotainment head units, and domain controllers powering millions of connected vehicles worldwide.",
  "responsibilities": [
    "Develop and validate real-time microcontroller firmware and BSPs in Embedded C and modern C++.",
    "Implement automotive communication stack layers including CAN, CAN-FD, LIN, and Automotive Ethernet.",
    "Integrate AUTOSAR Classic and Adaptive architectural components with RTOS platforms.",
    "Debug hardware-software timing anomalies using logic analyzers and oscilloscopes.",
    "Author comprehensive unit tests and automated hardware-in-the-loop (HIL) test suites."
  ],
  "requiredQualifications": [
    "B.Tech / B.E. / M.Tech in Electronics & Communication, Electrical Engineering, or Computer Science.",
    "0-2 years of embedded development experience or strong academic embedded systems projects.",
    "Strong foundation in C/C++, data structures, bitwise manipulation, and microcontroller architectures.",
    "Understanding of real-time operating systems (RTOS), interrupts, concurrency, and memory management."
  ],
  "requiredSkills": [
    { "skill": "Embedded C", "category": "language", "weight": 1.0 },
    { "skill": "C++", "category": "language", "weight": 0.9 },
    { "skill": "RTOS", "category": "concept", "weight": 0.8 },
    { "skill": "CAN Protocol", "category": "tool", "weight": 0.7 }
  ],
  "preferredSkills": ["AUTOSAR Classic/Adaptive knowledge", "Vector CANoe / CANalyzer"],
  "toolsAndTech": ["Embedded C", "C++", "QNX", "FreeRTOS", "Vector CANoe", "Git"],
  "softSkills": ["Attention to Safety Detail", "Collaborative Problem Solving"],
  "hiringProcess": [
    "Online Technical Assessment (C Programming, Aptitude, Core Electronics Fundamentals)",
    "Technical Interview 1: Data Structures, C/C++ Pointers, and Microcontroller Internals",
    "Technical Interview 2: Real-time Concurrency, RTOS Tasks & Architecture",
    "HR & Cultural Alignment Round"
  ],
  "compensation": "₹8.5 - 13.0 LPA",
  "benefits": ["Health Insurance", "Technical Training Academy", "Hybrid Work Model"],
  "fullText": "Job Title: Embedded Software Engineer — Digital Cockpit\nCompany: Visteon Corporation\nLocation: Chennai / Pune, India\nEmployment Type: Full-time\nExperience Level: 0-2 years\n\nAbout the Role:\nAs an Embedded Software Engineer at Visteon, you will shape the next generation of digital cockpit clusters, infotainment head units, and domain controllers powering millions of connected vehicles worldwide.\n\nKey Responsibilities:\n• Develop and validate real-time microcontroller firmware and BSPs in Embedded C and modern C++.\n• Implement automotive communication stack layers including CAN, CAN-FD, LIN, and Automotive Ethernet.\n• Integrate AUTOSAR Classic and Adaptive architectural components with RTOS platforms.\n• Author comprehensive unit tests and automated hardware-in-the-loop test suites.\n\nRequired Qualifications:\n• B.Tech / B.E. / M.Tech in Electronics & Communication, Electrical Engineering, or Computer Science.\n• 0-2 years of embedded development experience or strong academic embedded systems projects.\n• Strong foundation in C/C++, data structures, bitwise manipulation, and microcontroller architectures.\n\nRequired Skills & Technologies:\n• Embedded C\n• C++\n• RTOS\n• CAN Protocol\n\nHiring Process:\n1. Online Technical Assessment\n2. Technical Interview 1: Data Structures & C/C++ Pointers\n3. Technical Interview 2: Real-time Concurrency & RTOS\n4. HR Round"
}
```

### D. Campus Eligibility Rule Data Shape:
```json
{
  "companyId": "visteon",
  "companyName": "Visteon Corporation",
  "displayName": "Visteon — Graduate Engineer Trainee (Campus Intake)",
  "aggregatePercent": 65,
  "cgpaEquivalent": 6.5,
  "sourceName": "Visteon University Relations & Campus Drive Standards",
  "notes": "Minimum 65% or 6.5 CGPA throughout 10th, 12th, and B.Tech/M.Tech (ECE, EEE, CS, IT). Maximum 1 active backlog permitted at assessment time."
}
```

---

## 3. THE COMPLETE 100-COMPANY ROSTER (BY STAGE)

### STAGE 1: Proprietary Trading, Quant & GCC Banking Tech (Companies 1–20)
1. `axxela` — Axxela Advisory (Quant Trading & Financial Analytics, Mumbai)
2. `futures_first` — Futures First (Financial Markets & Algo Trading, Gurugram)
3. `graviton` — Graviton Research Capital (High Frequency Trading HFT, Gurugram)
4. `alphagrep` — AlphaGrep Securities (Low Latency HFT & Algo Trading, Mumbai/BLR)
5. `quadeye` — Quadeye Securities (Algorithmic Trading & Execution, Gurugram)
6. `estee_advisors` — Estee Advisors (Quantitative Asset Management, Gurugram)
7. `tmg_india` — TransMarket Group India (Proprietary Trading & Market Making, Mumbai)
8. `worldquant_india` — WorldQuant India (Quantitative Research & Alphathon, Mumbai)
9. `deshaw_india` — D.E. Shaw India (Investment Tech & Quantitative Analytics, Hyderabad)
10. `cams` — Computer Age Management Services (Mutual Funds & Capital Markets Tech, Chennai)
11. `socgen_gsc` — Societe Generale Global Solution Centre (Banking Tech GCC, Bengaluru/Chennai)
12. `bny_mellon_tech` — BNY Mellon Technology (Asset Servicing Tech GCC, Pune/Chennai)
13. `northern_trust` — Northern Trust India (Custodial Tech & Wealth Management GCC, Pune/BLR)
14. `fidelity_international` — Fidelity International (Asset Management GCC, Gurugram/BLR)
15. `state_street_india` — State Street Global Advisors (Financial Tech GCC, Bengaluru/HYD)
16. `natwest_group` — NatWest Group India (Commercial & Retail Banking GCC, Gurugram/BLR)
17. `macquarie_india` — Macquarie Group India (Commodity & Investment Banking GCC, Gurugram)
18. `standard_chartered_gbs` — Standard Chartered GBS (Global Business Services, Chennai/BLR)
19. `smarsh` — Smarsh India (RegTech & Digital Compliance SaaS, Bengaluru)
20. `concertai` — ConcertAI (Oncology AI & Healthcare Data SaaS GCC, Bengaluru)

### STAGE 2: Core Automotive, Embedded Systems, IoT & Industrial Automation (Companies 21–40)
21. `visteon` — Visteon Corporation (Cockpit Electronics & ADAS, Chennai/Pune)
22. `siemens_healthineers` — Siemens Healthineers (Diagnostic Imaging Tech, Bengaluru)
23. `honeywell_hts` — Honeywell Technology Solutions HTS (Aerospace & Industrial IoT, Bengaluru/HYD)
24. `garmin_india` — Garmin India (GPS & Wearables Tech, Noida/Bengaluru)
25. `syrma_sgs` — Syrma SGS Technology (Electronics Manufacturing & IoT Hardware, Chennai/Gurugram)
26. `san_radiance` — San Radiance Technologies (Embedded & FPGA Design, Bengaluru)
27. `continental_automotive` — Continental Automotive India (Autonomous Mobility & ADAS, Bengaluru)
28. `aptiv_india` — Aptiv India (Connected Vehicle Architecture & Signal Distribution, Bengaluru/Pune)
29. `bgsw` — Bosch Global Software Technologies (Mobility Software & Industrial IoT, Bengaluru/Coimbatore)
30. `harman_india` — Harman Connected Services / Samsung (Infotainment & Audio Electronics, Bengaluru/Pune)
31. `valeo_india` — Valeo India (Thermal Systems & ADAS Software, Chennai)
32. `kpit_tech` — KPIT Technologies (Automotive Software & EV Systems, Pune/Bengaluru)
33. `zf_india` — ZF Group India (Active Safety & E-Mobility, Hyderabad/Chennai)
34. `alstom_india` — Alstom India (Railway Signaling & Traction Tech, Bengaluru/Hyderabad)
35. `schneider_electric` — Schneider Electric India (Energy Management & Automation, Bengaluru)
36. `abb_india` — ABB India (Robotics & Motion Control, Bengaluru/Chennai)
37. `danfoss_india` — Danfoss India (Power Electronics & Drives, Chennai)
38. `eaton_india` — Eaton India Innovation Center (Power Management Tech, Pune)
39. `emerson_india` — Emerson Innovation Center (Process Automation & SCADA, Pune)
40. `rockwell_automation` — Rockwell Automation India (Industrial Automation & Digital Plant, Noida/BLR)

### STAGE 3: Semiconductors, Storage, Analytics & Enterprise AI Unicorns (Companies 41–60)
41. `lam_research_india` — Lam Research India (Semiconductor Equipment Tech, Bengaluru)
42. `kla_india` — KLA Corporation India (Semiconductor Metrology & Computer Vision, Chennai)
43. `applied_materials_india` — Applied Materials India (Semiconductor Automation, Bengaluru)
44. `western_digital_india` — Western Digital / SanDisk (Flash Memory & Storage Firmware, Bengaluru)
45. `seagate_india` — Seagate Technology India (Storage Cloud & Drives, Pune)
46. `micron_india` — Micron Technology India (DRAM & Memory Tech, Hyderabad/Bengaluru)
47. `texas_instruments_india` — Texas Instruments India (Analog & Embedded Systems, Bengaluru)
48. `analog_devices_india` — Analog Devices India (Signal Processing & Semiconductor, Bengaluru)
49. `nxp_india` — NXP Semiconductors India (Microcontrollers & Secure Connectivity, Noida/BLR)
50. `stmicro_india` — STMicroelectronics India (Silicon Design & Embedded Firmware, Greater Noida)
51. `renesas_india` — Renesas Electronics India (Automotive & Industrial MCU, Bengaluru)
52. `fractal` — Fractal Analytics (Decision Sciences & Enterprise AI Unicorn, Mumbai/BLR)
53. `mu_sigma` — Mu Sigma (Big Data & Decision Science, Bengaluru)
54. `latentview` — LatentView Analytics (Digital Analytics Consulting, Chennai)
55. `tiger_analytics` — Tiger Analytics (Advanced Analytics & AI Consulting, Chennai/BLR)
56. `tredence` — Tredence Analytics (Data Science & Supply Chain AI Unicorn, Bengaluru)
57. `course5` — Course5 Intelligence (Cognitive Analytics & Consumer Insights, Bengaluru/Mumbai)
58. `quantiphi` — Quantiphi (Applied AI & Cloud Transformation, Mumbai/BLR)
59. `polestar_solutions` — Polestar Solutions (Enterprise Data Platforms, Noida)
60. `sigmoid` — Sigmoid Analytics (Data Engineering & Big Data, Bengaluru)

### STAGE 4: High-Growth Indian Tech, D2C, EdTech & Logistics Unicorns (Companies 61–80)
61. `wakefit` — Wakefit Innovations (D2C Sleep Tech & Home Solutions, Bengaluru)
62. `zee_tech` — Zee Entertainment / Zee5 (OTT Video Streaming & Media Tech, Bengaluru/Mumbai)
63. `nxtwave` — NxtWave Disruptive Tech (EdTech & Tech Upskilling Platform, Hyderabad)
64. `bytexl` — ByteXL (Higher Education Tech & IT Training, Hyderabad)
65. `voxela` — Voxela AI (Computer Vision & Healthcare AI, Bengaluru/Remote)
66. `clevertap` — CleverTap (Customer Lifecycle & Retention SaaS Unicorn, Mumbai)
67. `moengage` — MoEngage (Customer Engagement & Omnichannel AI Unicorn, Bengaluru)
68. `leadsquared` — LeadSquared (Sales Execution CRM SaaS Unicorn, Bengaluru)
69. `shiprocket` — Shiprocket (E-commerce Logistics & Shipping SaaS Unicorn, Gurugram)
70. `physicswallah_tech` — PhysicsWallah Tech (EdTech Platform & Live Streaming Unicorn, Noida/BLR)
71. `scaler_tech` — Scaler Academy / InterviewBit (Tech Education & Assessment Unicorn, Bengaluru)
72. `porter` — Porter (On-Demand Logistics & Fleet Tech Unicorn, Bengaluru)
73. `rapido` — Rapido (Bike Taxi & Auto Ride-Hailing Platform Unicorn, Bengaluru)
74. `shadowfax` — Shadowfax Technologies (Hyperlocal Logistics Tech Unicorn, Bengaluru)
75. `delhivery` — Delhivery Tech (Supply Chain & Express Logistics Unicorn, Gurugram)
76. `blackbuck` — BlackBuck (Trucking Platform & Fleet Management Unicorn, Bengaluru)
77. `ninjacart` — Ninjacart (Agritech & Fresh Produce Supply Chain Unicorn, Bengaluru)
78. `urban_company` — Urban Company Tech (Home Services Marketplace Tech Unicorn, Gurugram)
79. `human_security` — Human Security (Cybersecurity & Ad Fraud Mitigation, Bengaluru)
80. `ugam_solutions` — Ugam Solutions / Merkle (Retail & Customer Analytics, Mumbai/BLR)

### STAGE 5: Mid-Market IT Consulting, Digital Engineering & Enterprise Software (Companies 81–100)
81. `persistent_systems` — Persistent Systems (Digital Engineering & Cloud Modernization, Pune)
82. `birlasoft` — Birlasoft (Enterprise Cloud & ERP Consulting, Pune/Noida)
83. `cyient` — Cyient (Engineering Design & Geospatial Tech, Hyderabad)
84. `happiest_minds` — Happiest Minds Technologies (Mindful IT & AI Solutions, Bengaluru)
85. `coforge` — Coforge (Digital Services, Travel & Insurance Tech, Noida)
86. `zensar` — Zensar Technologies (Digital Experience & Cloud Services, Pune)
87. `sonata_software` — Sonata Software (Cloud Modernization & Dynamics 365, Bengaluru)
88. `mastek` — Mastek (Enterprise Digital Commerce & Cloud Solutions, Mumbai/Ahmedabad)
89. `nucleus_software` — Nucleus Software (Lending & Core Banking Software, Noida)
90. `newgen_software` — Newgen Software (Low-Code Process Automation, New Delhi)
91. `intellect_design` — Intellect Design Arena (Fintech & Contextual Banking Architecture, Chennai)
92. `tanla_platforms` — Tanla Platforms (CPaaS & Cloud Messaging Infrastructure, Hyderabad)
93. `tata_elxsi` — Tata Elxsi (Connected Vehicles & Embedded Software, Bengaluru/Trivandrum)
94. `ltts` — L&T Technology Services (Pure-Play ER&D & Industrial IoT, Vadodara/BLR)
95. `sasken` — Sasken Technologies (Telecom, 5G & Satellite Tech, Bengaluru)
96. `conneqt` — Conneqt Business Solutions (Digital CX & BPM Technology, Hyderabad/BLR)
97. `incedo` — Incedo Inc (Digital Engineering & Financial Systems Consulting, Gurugram/Pune)
98. `nielseniq` — NielsenIQ India (Consumer Intelligence & Retail Measurement, Bengaluru/Vadodara)
99. `sgs_india` — SGS India (Testing, Verification & Digital Lab Platforms, Mumbai/BLR)
100. `absolutdata` — Absolutdata / Infogain (AI Products & Marketing Analytics, Gurugram)

---

## 4. WHAT TO TELL CLAUDE FIRST

When you upload this file to Claude, send this simple message:

> *"I have uploaded the complete HireFlow 100-company specification document. Please begin with **STAGE 1** (Companies 1 to 20: Quant Trading & GCC Banking Tech). Generate the complete JSON array of companies with calibrated roles and eligibility rules matching the schema exactly. Once done, I will take the output to Antigravity and prompt you for Stage 2."*
