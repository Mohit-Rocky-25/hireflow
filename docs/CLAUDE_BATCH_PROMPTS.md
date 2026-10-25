# Claude Ready-to-Copy Prompts (5 Batches of 20 Companies)

To prevent Claude from truncating its output due to response token limits, the 100 companies are divided into 5 balanced batches of 20 companies each. You can copy and paste each batch directly into Claude one by one.

---

## Batch 1: Quant, Prop Trading & GCC Banking Tech (Companies 1–20)
**Companies included**:
`axxela`, `futures_first`, `graviton`, `alphagrep`, `quadeye`, `estee_advisors`, `tmg_india`, `worldquant_india`, `deshaw_india`, `cams`, `socgen_gsc`, `bny_mellon_tech`, `northern_trust`, `fidelity_international`, `state_street_india`, `natwest_group`, `macquarie_india`, `standard_chartered_gbs`, `smarsh`, `concertai`

### Copy this Prompt for Batch 1:
```markdown
You are a Principal Talent Intelligence Engineer for HireFlow (an AI-powered career evaluation and resume auditing engine).
Generate a valid JSON array of 20 companies with calibrated job roles for the following list:

Companies to generate:
1. axxela — Axxela Advisory (Quant Trading & Analytics)
2. futures_first — Futures First (Prop Trading & Financial Markets)
3. graviton — Graviton Research Capital (HFT & Algorithmic Trading)
4. alphagrep — AlphaGrep Securities (Low Latency HFT)
5. quadeye — Quadeye Securities (Algo Trading)
6. estee_advisors — Estee Advisors (Quant Asset Management)
7. tmg_india — TransMarket Group India (Market Making)
8. worldquant_india — WorldQuant India (Quant Research)
9. deshaw_india — D.E. Shaw India (Investment Tech)
10. cams — Computer Age Management Services (Capital Markets Tech)
11. socgen_gsc — Societe Generale Global Solution Centre (Banking Tech GCC)
12. bny_mellon_tech — BNY Mellon Technology (Asset Servicing Tech GCC)
13. northern_trust — Northern Trust India (Custodial Tech GCC)
14. fidelity_international — Fidelity International (Asset Management GCC)
15. state_street_india — State Street Global Advisors (Financial Tech GCC)
16. natwest_group — NatWest Group India (Retail & Commercial Banking GCC)
17. macquarie_india — Macquarie Group India (Investment Banking GCC)
18. standard_chartered_gbs — Standard Chartered GBS (Banking Services GCC)
19. smarsh — Smarsh India (RegTech & Digital Compliance SaaS)
20. concertai — ConcertAI (Oncology AI & Healthcare Data SaaS)

Schema Rules:
- For each company, provide: `id`, `name`, `logo` (1-3 chars), `gradient` (Tailwind class), `industry`, `hq`, `tier` ('PRODUCT_MNC' | 'GCC' | 'UNICORN'), `avgPackage` (e.g. "₹12 - 24 LPA"), `glassdoor` (e.g. 4.2), and 3-4 realistic roles.
- In each role:
  - `competencies`: Choose 4 to 6 keys STRICTLY from: ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].
  - `reqLevel`: map each chosen competency to 'working', 'strong', or 'expert'.
  - `fullText`: structured JD text with Title, About Role, Key Responsibilities, Required Qualifications, Required Skills, and Hiring Process.
- Also output the `eligibility` rule for each company: `aggregatePercent`, `cgpaEquivalent`, `notes`, `sourceName`.

Output ONLY clean, valid JSON formatted as:
{
  "companies": [ ... ],
  "eligibilityRules": [ ... ]
}
```

---

## Batch 2: Core Automotive, Embedded Systems & Industrial IoT (Companies 21–40)
**Companies included**:
`visteon`, `siemens_healthineers`, `honeywell_hts`, `garmin_india`, `syrma_sgs`, `san_radiance`, `continental_automotive`, `aptiv_india`, `bgsw`, `harman_india`, `valeo_india`, `kpit_tech`, `zf_india`, `alstom_india`, `schneider_electric`, `abb_india`, `danfoss_india`, `eaton_india`, `emerson_india`, `rockwell_automation`

### Copy this Prompt for Batch 2:
```markdown
You are a Principal Talent Intelligence Engineer for HireFlow.
Generate a valid JSON array of 20 core automotive, embedded systems, and industrial automation companies with calibrated campus roles:

Companies to generate:
21. visteon — Visteon Corporation (Cockpit Electronics & ADAS)
22. siemens_healthineers — Siemens Healthineers (Diagnostic Imaging Tech)
23. honeywell_hts — Honeywell Technology Solutions HTS (Aerospace & Industrial IoT)
24. garmin_india — Garmin India (GPS & Wearables Tech)
25. syrma_sgs — Syrma SGS Technology (Electronics Manufacturing & IoT)
26. san_radiance — San Radiance Technologies (Embedded & FPGA Design)
27. continental_automotive — Continental Automotive India (Autonomous Mobility & ADAS)
28. aptiv_india — Aptiv India (Connected Vehicle Architecture)
29. bgsw — Bosch Global Software Technologies (Mobility Software & IoT)
30. harman_india — Harman Connected Services / Samsung (Infotainment & Audio)
31. valeo_india — Valeo India (Thermal Systems & ADAS)
32. kpit_tech — KPIT Technologies (Automotive Software & EV Systems)
33. zf_india — ZF Group India (Active Safety & E-Mobility)
34. alstom_india — Alstom India (Railway Signaling & Traction Tech)
35. schneider_electric — Schneider Electric India (Energy Management & Automation)
36. abb_india — ABB India (Robotics & Motion Control)
37. danfoss_india — Danfoss India (Power Electronics & Drives)
38. eaton_india — Eaton India Innovation Center (Power Management)
39. emerson_india — Emerson Innovation Center (Process Automation & SCADA)
40. rockwell_automation — Rockwell Automation India (Industrial Automation)

Schema Rules:
- Tier should be 'PRODUCT_MNC'.
- Competencies must strictly be from: ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].
- Roles should highlight Embedded C, C++, RTOS, Linux, AUTOSAR, and Concurrency.
- Include eligibility cutoffs (e.g. 60-70% aggregate, CS/ECE/EE branches).

Output ONLY clean, valid JSON formatted as:
{
  "companies": [ ... ],
  "eligibilityRules": [ ... ]
}
```

---

## Batch 3: Semiconductors, Storage, Analytics & AI Unicorns (Companies 41–60)
**Companies included**:
`lam_research_india`, `kla_india`, `applied_materials_india`, `western_digital_india`, `seagate_india`, `micron_india`, `texas_instruments_india`, `analog_devices_india`, `nxp_india`, `stmicro_india`, `renesas_india`, `fractal`, `mu_sigma`, `latentview`, `tiger_analytics`, `tredence`, `course5`, `quantiphi`, `polestar_solutions`, `sigmoid`

### Copy this Prompt for Batch 3:
```markdown
You are a Principal Talent Intelligence Engineer for HireFlow.
Generate a valid JSON array of 20 semiconductor, storage hardware, and enterprise AI/Analytics companies:

Companies to generate:
41. lam_research_india — Lam Research India (Semiconductor Equipment Tech)
42. kla_india — KLA Corporation India (Semiconductor Metrology & CV)
43. applied_materials_india — Applied Materials India (Semiconductor Automation)
44. western_digital_india — Western Digital / SanDisk (Flash Memory & Firmware)
45. seagate_india — Seagate Technology India (Storage Cloud & Drives)
46. micron_india — Micron Technology India (DRAM & Memory Tech)
47. texas_instruments_india — Texas Instruments India (Analog & Embedded Systems)
48. analog_devices_india — Analog Devices India (Signal Processing & Semiconductor)
49. nxp_india — NXP Semiconductors India (Microcontrollers & Secure Connectivity)
50. stmicro_india — STMicroelectronics India (Silicon Design & Embedded Firmware)
51. renesas_india — Renesas Electronics India (Automotive & Industrial MCU)
52. fractal — Fractal Analytics (Decision Sciences & Enterprise AI)
53. mu_sigma — Mu Sigma (Big Data & Decision Science)
54. latentview — LatentView Analytics (Digital Analytics Consulting)
55. tiger_analytics — Tiger Analytics (Advanced Analytics & AI)
56. tredence — Tredence Analytics (Data Science & Supply Chain AI)
57. course5 — Course5 Intelligence (Cognitive Analytics & Consumer Insights)
58. quantiphi — Quantiphi (Applied AI & Cloud Transformation)
59. polestar_solutions — Polestar Solutions (Enterprise Data Platforms)
60. sigmoid — Sigmoid Analytics (Data Engineering & Big Data)

Competencies must strictly be from: ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].

Output ONLY clean, valid JSON formatted as:
{
  "companies": [ ... ],
  "eligibilityRules": [ ... ]
}
```

---

## Batch 4: High-Growth Indian Tech, D2C, EdTech & Logistics Unicorns (Companies 61–80)
**Companies included**:
`wakefit`, `zee_tech`, `nxtwave`, `bytexl`, `voxela`, `clevertap`, `moengage`, `leadsquared`, `shiprocket`, `physicswallah_tech`, `scaler_tech`, `porter`, `rapido`, `shadowfax`, `delhivery`, `blackbuck`, `ninjacart`, `urban_company`, `human_security`, `ugam_solutions`

### Copy this Prompt for Batch 4:
```markdown
You are a Principal Talent Intelligence Engineer for HireFlow.
Generate a valid JSON array of 20 high-growth Indian tech unicorns, D2C brands, EdTech platforms, and mobility leaders:

Companies to generate:
61. wakefit — Wakefit Innovations (D2C Sleep Tech & Home Solutions)
62. zee_tech — Zee Entertainment / Zee5 (OTT Streaming & Media Tech)
63. nxtwave — NxtWave Disruptive Tech (EdTech & Tech Upskilling)
64. bytexl — ByteXL (Higher Education Tech & IT Training)
65. voxela — Voxela AI (Computer Vision & Healthcare AI)
66. clevertap — CleverTap (Customer Lifecycle & Retention SaaS)
67. moengage — MoEngage (Customer Engagement & Omnichannel AI)
68. leadsquared — LeadSquared (Sales Execution CRM SaaS)
69. shiprocket — Shiprocket (E-commerce Logistics & Shipping SaaS)
70. physicswallah_tech — PhysicsWallah Tech (EdTech Platform & Live Streaming)
71. scaler_tech — Scaler Academy / InterviewBit (Tech Education & Assessment)
72. porter — Porter (On-Demand Logistics & Fleet Tech)
73. rapido — Rapido (Bike Taxi & Auto Ride-Hailing Platform)
74. shadowfax — Shadowfax Technologies (Hyperlocal Logistics Tech)
75. delhivery — Delhivery Tech (Supply Chain & Express Logistics)
76. blackbuck — BlackBuck (Trucking Platform & Fleet Management)
77. ninjacart — Ninjacart (Agritech & Fresh Produce Supply Chain)
78. urban_company — Urban Company Tech (Home Services Marketplace Tech)
79. human_security — Human Security (Cybersecurity & Ad Fraud Mitigation)
80. ugam_solutions — Ugam Solutions / Merkle (Retail & Analytics)

Tiers: 'UNICORN' or 'STARTUP'.
Competencies must strictly be from: ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].

Output ONLY clean, valid JSON formatted as:
{
  "companies": [ ... ],
  "eligibilityRules": [ ... ]
}
```

---

## Batch 5: Mid-Market IT Consulting, Digital Engineering & Enterprise SaaS (Companies 81–100)
**Companies included**:
`persistent_systems`, `birlasoft`, `cyient`, `happiest_minds`, `coforge`, `zensar`, `sonata_software`, `mastek`, `nucleus_software`, `newgen_software`, `intellect_design`, `tanla_platforms`, `tata_elxsi`, `ltts`, `sasken`, `conneqt`, `incedo`, `nielseniq`, `sgs_india`, `absolutdata`

### Copy this Prompt for Batch 5:
```markdown
You are a Principal Talent Intelligence Engineer for HireFlow.
Generate a valid JSON array of 20 mid-market IT consulting, digital engineering, and enterprise banking software leaders:

Companies to generate:
81. persistent_systems — Persistent Systems (Digital Engineering & Cloud)
82. birlasoft — Birlasoft (Enterprise Cloud & ERP Consulting)
83. cyient — Cyient (Engineering Design & Geospatial Tech)
84. happiest_minds — Happiest Minds Technologies (Mindful IT & AI Solutions)
85. coforge — Coforge (Digital Services, Travel & Insurance Tech)
86. zensar — Zensar Technologies (Digital Experience & Cloud Services)
87. sonata_software — Sonata Software (Cloud Modernization & Dynamics 365)
88. mastek — Mastek (Enterprise Digital Commerce & Cloud)
89. nucleus_software — Nucleus Software (Lending & Core Banking Software)
90. newgen_software — Newgen Software (Low-Code Process Automation)
91. intellect_design — Intellect Design Arena (Fintech & Contextual Banking)
92. tanla_platforms — Tanla Platforms (CPaaS & Cloud Messaging Infrastructure)
93. tata_elxsi — Tata Elxsi (Connected Vehicles & Embedded Software)
94. ltts — L&T Technology Services (Pure-Play ER&D & Industrial IoT)
95. sasken — Sasken Technologies (Telecom, 5G & Satellite Tech)
96. conneqt — Conneqt Business Solutions (Digital CX & BPM Technology)
97. incedo — Incedo Inc (Digital Engineering & Financial Systems Consulting)
98. nielseniq — NielsenIQ India (Consumer Intelligence & Retail Measurement)
99. sgs_india — SGS India (Testing, Verification & Digital Lab Platforms)
100. absolutdata — Absolutdata / Infogain (AI Products & Marketing Analytics)

Competencies must strictly be from: ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].

Output ONLY clean, valid JSON formatted as:
{
  "companies": [ ... ],
  "eligibilityRules": [ ... ]
}
```
