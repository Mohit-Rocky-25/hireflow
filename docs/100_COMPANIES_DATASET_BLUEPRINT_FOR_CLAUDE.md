# HireFlow — 100 Companies & Calibrated Roles Dataset Blueprint for Claude

> **Version**: 1.0.0  
> **Target System**: HireFlow TalentLens™ Engine & ATS Resume Roaster  
> **Purpose**: Master specification, schema dictionary, and prompt template for Claude to generate structured data for 100 verified Indian campus & early-career recruiters.

---

## 1. Executive Summary & Architecture Overview

HireFlow's **TalentLens™** and **ATS Resume Roaster** rely on calibrated, high-depth company and role profiles. For each employer, the engine requires:
1. **Company Metadata**: Unique ID, official brand name, tier classification, industry sector, Indian campus hiring trends, and typical compensation bands.
2. **Calibrated Job Roles**: Specific campus/entry/early-career roles (e.g., Graduate Engineer Trainee, SDE-1, Associate Quant Analyst, Embedded Firmware Engineer) with:
   - **Competency Mapping**: 4–6 core competencies selected **strictly** from the 20 engine-recognized keys.
   - **Required Proficiency Levels**: `'working' | 'strong' | 'expert'`.
   - **Structured Job Description (`fullText`)**: Complete text including About Role, Key Responsibilities, Required Qualifications, Required Skills, and Hiring Process rounds.
3. **Campus Eligibility Rule**: Official CGPA/aggregate percentage cutoffs, backlog allowances, and eligible degree streams.
4. **Brand Vector & Logo Specification**: Official corporate vector or brand hex code.

---

## 2. Master List of the 100 Companies

Below is the verified roster of 100 recruiters, organized into 6 strategic recruitment sectors.

### Category 1: Proprietary Trading, Quant & Financial Markets (10 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `axxela` | Axxela Advisory | `UNICORN` | Quantitative Trading & Analytics | Mumbai, Maharashtra | Junior Quant Analyst, Trainee Prop Trader, Python Data Engineer |
| `futures_first` | Futures First | `PRODUCT_MNC` | Financial Markets & Algo Trading | Gurugram, Haryana | Market Analyst Trainee, Quantitative Research Associate |
| `graviton` | Graviton Research Capital | `UNICORN` | High Frequency Trading (HFT) | Gurugram, Haryana | Quantitative Software Engineer, Algo Trader |
| `alphagrep` | AlphaGrep Securities | `UNICORN` | Quantitative Trading & HFT | Mumbai / Bengaluru | C++ Low Latency Developer, Quantitative Researcher |
| `quadeye` | Quadeye Securities | `UNICORN` | Algorithmic Trading | Gurugram, Haryana | Systems Software Engineer, Quantitative Strategist |
| `estee_advisors` | Estee Advisors | `PRODUCT_MNC` | Algo Trading & Asset Management | Gurugram, Haryana | Quantitative Developer, Machine Learning Trader |
| `tmg_india` | TransMarket Group India | `PRODUCT_MNC` | Prop Trading & Market Making | Mumbai, Maharashtra | Trainee Quantitative Trader, Software Engineer (C++) |
| `worldquant_india` | WorldQuant India | `PRODUCT_MNC` | Quantitative Investment Management | Mumbai, Maharashtra | Quantitative Research Consultant, Data Engineering Associate |
| `deshaw_india` | D.E. Shaw India | `PRODUCT_MNC` | Investment Tech & Quantitative Analytics | Hyderabad, Telangana | Software Development Engineer, Systems Technologist |
| `cams` | Computer Age Management Services (CAMS) | `PRODUCT_MNC` | Capital Markets & BFSI Infrastructure | Chennai, Tamil Nadu | Associate Software Engineer, Database Analyst |

### Category 2: Global Capability Centers (GCCs) & Banking Tech (15 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `socgen_gsc` | Societe Generale GSC | `GCC` | Banking Tech & Financial Services | Bengaluru / Chennai | Software Engineer (Java/Cloud), Data Analytics Specialist |
| `bny_mellon_tech` | BNY Mellon Technology | `GCC` | Global Custody & Asset Servicing Tech | Pune / Chennai | Application Developer, Cloud Infrastructure Engineer |
| `northern_trust` | Northern Trust India | `GCC` | Wealth Management & Asset Servicing | Pune / Bengaluru | Associate Software Engineer, Systems Specialist |
| `fidelity_international` | Fidelity International | `GCC` | Investment Management & Financial Tech | Gurugram / Bengaluru | Technology Associate, Quality Assurance Engineer |
| `state_street_india` | State Street Global Advisors | `GCC` | Financial Tech & Custodial Services | Bengaluru / Hyderabad | Associate Software Engineer, Reporting Analyst |
| `natwest_group` | NatWest Group India | `GCC` | Commercial & Retail Banking Tech | Gurugram / Bengaluru | Software Engineer Trainee, Risk Analytics Specialist |
| `macquarie_india` | Macquarie Group India | `GCC` | Investment Banking & Commodity Tech | Gurugram, Haryana | Graduate Software Engineer, Cloud Operations Analyst |
| `standard_chartered_gbs` | Standard Chartered GBS | `GCC` | International Banking Services | Chennai / Bengaluru | Analyst — Core Banking Platforms, API Integration Developer |
| `smarsh` | Smarsh India | `GCC` | RegTech & Digital Compliance SaaS | Bengaluru, Karnataka | Software Development Engineer, QA Automation Engineer |
| `concertai` | ConcertAI | `GCC` | Healthcare AI & Oncology SaaS | Bengaluru, Karnataka | Associate Data Engineer, ML Pipeline Associate |
| `nielseniq` | NielsenIQ India | `GCC` | Consumer Intelligence & Big Data | Bengaluru / Vadodara | Associate Data Scientist, Big Data Engineer |
| `conneqt` | Conneqt Business Solutions | `IT_SERVICES` | Digital CX & BPM Technology | Hyderabad / Bengaluru | Software Trainee, Full Stack Web Developer |
| `incedo` | Incedo Inc | `IT_SERVICES` | Digital Engineering & Cloud Consulting | Gurugram / Pune | Associate Software Engineer, Data Integration Analyst |
| `human_security` | Human Security | `GCC` | Cybersecurity & Bot Mitigation | Bengaluru, Karnataka | Security Software Engineer, Threat Intelligence Analyst |
| `sgs_india` | SGS India | `GCC` | Inspection, Verification & Lab Tech | Mumbai / Bengaluru | Junior Software Developer, Systems Integration Trainee |

### Category 3: Core Engineering, Embedded Systems, IoT & Automotive (25 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `visteon` | Visteon Corporation | `PRODUCT_MNC` | Automotive Cockpit Electronics & ADAS | Chennai / Pune | Embedded Software Engineer, Android Automotive Developer |
| `siemens_healthineers` | Siemens Healthineers | `PRODUCT_MNC` | MedTech & Diagnostic Imaging Software | Bengaluru, Karnataka | Graduate Engineer Trainee (C++), Imaging Software Developer |
| `honeywell_hts` | Honeywell Technology Solutions (HTS) | `PRODUCT_MNC` | Aerospace, Building Tech & Industrial IoT | Bengaluru / Hyderabad | Software Engineer Trainee, Embedded Systems Engineer |
| `garmin_india` | Garmin India | `PRODUCT_MNC` | GPS Navigation & Wearables Tech | Noida / Bengaluru | Embedded Firmware Engineer, Mobile App Developer (iOS/Android) |
| `syrma_sgs` | Syrma SGS Technology | `PRODUCT_MNC` | Electronics Manufacturing & IoT Hardware | Chennai / Gurugram | Embedded Hardware Engineer, Firmware Trainee |
| `san_radiance` | San Radiance Technologies | `PRODUCT_MNC` | Embedded Systems & FPGA Design | Bengaluru, Karnataka | FPGA Design Engineer, Embedded C Developer |
| `continental_automotive` | Continental Automotive India | `PRODUCT_MNC` | Autonomous Mobility & Chassis Safety | Bengaluru, Karnataka | Autonomous Driving Software Engineer, Autosar Developer |
| `aptiv_india` | Aptiv India | `PRODUCT_MNC` | Connected Services & Vehicle Architecture | Bengaluru / Pune | Embedded Software Engineer (Autosar/C++), Vehicle Network Engineer |
| `bgsw` | Bosch Global Software Technologies (BGSW) | `PRODUCT_MNC` | Mobility Software & Industrial IoT | Bengaluru / Coimbatore | Graduate Engineer Trainee, Embedded Linux Developer |
| `harman_india` | Harman Connected Services (Samsung) | `PRODUCT_MNC` | Connected Car & Audio Electronics | Bengaluru / Pune | Associate Software Engineer, Android Infotainment Developer |
| `valeo_india` | Valeo India | `PRODUCT_MNC` | Powertrain & Thermal Systems Tech | Chennai, Tamil Nadu | Embedded C Developer, Model-Based Design Engineer (Simulink) |
| `kpit_tech` | KPIT Technologies | `PRODUCT_MNC` | Automotive Software & EV Architecture | Pune / Bengaluru | Trainee Software Engineer, Battery Management System (BMS) Engineer |
| `zf_india` | ZF Group India | `PRODUCT_MNC` | Active Safety & E-Mobility Systems | Hyderabad / Chennai | Embedded Firmware Engineer, ADAS Validation Engineer |
| `alstom_india` | Alstom India | `PRODUCT_MNC` | Railway Signaling & Mobility Tech | Bengaluru / Hyderabad | Signaling Software Trainee, SCADA Validation Engineer |
| `schneider_electric` | Schneider Electric India | `PRODUCT_MNC` | Energy Management & Automation | Bengaluru, Karnataka | Graduate Engineer Trainee — R&D, Cloud IoT Developer |
| `abb_india` | ABB India | `PRODUCT_MNC` | Robotics, Power Grids & Automation | Bengaluru / Chennai | Junior Robotics Software Engineer, Control Systems Trainee |
| `danfoss_india` | Danfoss India | `PRODUCT_MNC` | Drives, Refrigeration & Power Electronics | Chennai, Tamil Nadu | Power Electronics Engineer, Embedded Firmware Trainee |
| `eaton_india` | Eaton India Innovation Center | `PRODUCT_MNC` | Intelligent Power Management Tech | Pune, Maharashtra | Associate Engineer — Software, Electrical Systems Modeler |
| `emerson_india` | Emerson Innovation Center | `PRODUCT_MNC` | Process Automation & Control Systems | Pune, Maharashtra | Software Trainee (Industrial SCADA), Systems Engineer |
| `rockwell_automation` | Rockwell Automation India | `PRODUCT_MNC` | Industrial Automation & Digital Plant Tech | Noida / Bengaluru | Software Engineer Trainee, Industrial Cloud Developer |
| `lam_research_india` | Lam Research India | `PRODUCT_MNC` | Semiconductor Equipment Software | Bengaluru, Karnataka | Software Engineer (C++/Distributed Systems), Controls Engineer |
| `kla_india` | KLA Corporation India | `PRODUCT_MNC` | Semiconductor Inspection & Metrology | Chennai, Tamil Nadu | Algorithms Software Engineer, Computer Vision Engineer |
| `applied_materials_india` | Applied Materials India | `PRODUCT_MNC` | Nano-manufacturing Technology | Bengaluru, Karnataka | Software Engineer (Semiconductor Automation), Equipment Control Developer |
| `western_digital_india` | Western Digital / SanDisk | `PRODUCT_MNC` | Flash Memory & Data Storage Hardware | Bengaluru, Karnataka | Firmware Engineer Trainee, ASIC Design Verification Associate |
| `seagate_india` | Seagate Technology India | `PRODUCT_MNC` | Storage Solutions & Cloud Drives | Pune, Maharashtra | Storage Firmware Engineer, Linux Systems Trainee |

### Category 4: Analytics, AI & Enterprise Data Platforms (15 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `fractal` | Fractal Analytics | `UNICORN` | Artificial Intelligence & Decision Science | Mumbai / Bengaluru | Data Science Associate, Decision Analytics Trainee |
| `mu_sigma` | Mu Sigma | `UNICORN` | Decision Sciences & Big Data Analytics | Bengaluru, Karnataka | Trainee Decision Scientist, Analytics Associate |
| `latentview` | LatentView Analytics | `PRODUCT_MNC` | Digital Analytics & Data Consulting | Chennai, Tamil Nadu | Analyst — Data Engineering, Analytics Consultant |
| `tiger_analytics` | Tiger Analytics | `PRODUCT_MNC` | Advanced Analytics & AI Consulting | Chennai / Bengaluru | Junior Data Scientist, Big Data Engineer |
| `tredence` | Tredence Analytics | `UNICORN` | Data Science & Enterprise AI Solutions | Bengaluru, Karnataka | Data Engineer Associate, Business Intelligence Trainee |
| `course5` | Course5 Intelligence | `PRODUCT_MNC` | Cognitive Analytics & Customer Insights | Bengaluru / Mumbai | Analytics Specialist, AI Solutions Developer |
| `quantiphi` | Quantiphi | `PRODUCT_MNC` | Applied AI & Cloud Transformation | Mumbai / Bengaluru | Machine Learning Engineer, Cloud Data Engineer |
| `polestar_solutions` | Polestar Solutions | `PRODUCT_MNC` | Enterprise Data Management & Analytics | Noida, Uttar Pradesh | Business Intelligence Developer, Data Engineering Trainee |
| `sigmoid` | Sigmoid Analytics | `PRODUCT_MNC` | Data Engineering & Generative AI | Bengaluru, Karnataka | Big Data Engineer, Machine Learning Associate |
| `ugam_solutions` | Ugam Solutions (Merkle) | `PRODUCT_MNC` | Retail Analytics & Digital Transformation | Mumbai / Bengaluru | Associate Analyst, Data Scientist Trainee |
| `absolutdata` | Absolutdata (Infogain) | `PRODUCT_MNC` | AI Solutions & Marketing Analytics | Gurugram, Haryana | Associate Data Engineer, Predictive Modeler |
| `micron_india` | Micron Technology India | `PRODUCT_MNC` | Semiconductor Memory & Storage | Hyderabad / Bengaluru | Software Engineer Trainee, Semiconductor Yield Analyst |
| `texas_instruments_india` | Texas Instruments India | `PRODUCT_MNC` | Analog & Embedded Semiconductor Tech | Bengaluru, Karnataka | Embedded Software Associate, Design Verification Engineer |
| `analog_devices_india` | Analog Devices India | `PRODUCT_MNC` | High Performance Semiconductor Tech | Bengaluru, Karnataka | Digital Signal Processing Engineer, Applications Trainee |
| `nxp_india` | NXP Semiconductors India | `PRODUCT_MNC` | Secure Connectivity & Microcontrollers | Noida / Bengaluru | Embedded Software Engineer (RTOS), Validation Engineer |

### Category 5: High-Growth Indian Tech, D2C & EdTech (15 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `wakefit` | Wakefit Innovations | `UNICORN` | D2C Sleep Tech & Home Solutions | Bengaluru, Karnataka | Full Stack Engineer, Supply Chain Analytics Trainee |
| `zee_tech` | Zee Entertainment (Zee5) | `PRODUCT_MNC` | OTT Video Streaming & Media Tech | Bengaluru / Mumbai | Backend Engineer (Node/Go), Video Streaming Engineer |
| `nxtwave` | NxtWave Disruptive Tech | `STARTUP` | EdTech & Upskilling Platform | Hyderabad, Telangana | Software Engineer (React/Node), Product Operations Associate |
| `bytexl` | ByteXL | `STARTUP` | Higher Education Tech & IT Training | Hyderabad, Telangana | Full Stack Developer, Curriculum Tech Associate |
| `voxela` | Voxela AI | `STARTUP` | Computer Vision & Healthcare AI | Bengaluru / Remote | Computer Vision Trainee, Python Backend Developer |
| `clevertap` | CleverTap | `UNICORN` | Customer Engagement & Retention SaaS | Mumbai, Maharashtra | Software Engineer I (Data/Distributed), Frontend Engineer |
| `moengage` | MoEngage | `UNICORN` | Customer Engagement & Marketing AI | Bengaluru, Karnataka | Backend Software Engineer (Java/Python), DevOps Trainee |
| `leadsquared` | LeadSquared | `UNICORN` | Sales Automation & CRM SaaS | Bengaluru, Karnataka | Associate Software Engineer (C#/Python), QA Automation Trainee |
| `shiprocket` | Shiprocket | `UNICORN` | E-commerce Logistics & Supply Chain SaaS | Gurugram, Haryana | Software Development Engineer I, Logistics Analytics Trainee |
| `physicswallah_tech` | PhysicsWallah Tech | `UNICORN` | EdTech Platform & Streaming Tech | Noida / Bengaluru | Android App Developer, Backend Engineer (Microservices) |
| `scaler_tech` | Scaler Academy (InterviewBit) | `UNICORN` | Tech Education & Assessment Platform | Bengaluru, Karnataka | Software Development Engineer I, Frontend Engineer (React/Next) |
| `porter` | Porter (SmartShift Logistics) | `UNICORN` | On-Demand Intra-City Logistics Tech | Bengaluru, Karnataka | SDE I (Backend - Go/Java), Mobile Engineer (Kotlin) |
| `rapido` | Rapido | `UNICORN` | Bike Taxi & Auto Mobility Platform | Bengaluru, Karnataka | Software Engineer — Dispatch Systems, Backend Developer |
| `shadowfax` | Shadowfax Technologies | `UNICORN` | Hyperlocal & E-commerce Logistics Tech | Bengaluru, Karnataka | SDE-1 (Java/Spring Boot), Routing Optimization Trainee |
| `delhivery` | Delhivery Tech | `UNICORN` | Supply Chain & Express Logistics Tech | Gurugram, Haryana | Software Development Engineer I, Big Data Associate |

### Category 6: Mid-Market IT Consulting, Digital Engineering & Enterprise SaaS (20 Companies)
| ID | Company Name | Tier | Industry | Indian HQ / Tech Center | Typical Campus Roles |
|---|---|---|---|---|---|
| `persistent_systems` | Persistent Systems | `IT_SERVICES` | Digital Engineering & Cloud Modernization | Pune, Maharashtra | Associate Software Engineer, Cloud Solutions Trainee |
| `birlasoft` | Birlasoft | `IT_SERVICES` | Enterprise Cloud & ERP Transformation | Pune / Noida | Graduate Trainee Engineer, Salesforce Developer Trainee |
| `cyient` | Cyient | `PRODUCT_MNC` | Engineering Design, Telecom & Geospatial | Hyderabad, Telangana | Trainee Software Engineer, Embedded Systems Trainee |
| `happiest_minds` | Happiest Minds Technologies | `IT_SERVICES` | Mindful IT, AI & Digital Infrastructure | Bengaluru, Karnataka | Software Trainee, DevOps Associate |
| `coforge` | Coforge | `IT_SERVICES` | Digital Services, Insurance & Travel Tech | Noida / Greater Noida | Graduate Engineer Trainee, Java Full Stack Associate |
| `zensar` | Zensar Technologies | `IT_SERVICES` | Digital Transformation & Experience Tech | Pune, Maharashtra | Associate Software Engineer, Cloud Infrastructure Trainee |
| `sonata_software` | Sonata Software | `IT_SERVICES` | Modernization Engineering & Cloud Data | Bengaluru, Karnataka | Software Engineer Trainee, Microsoft Dynamics Trainee |
| `mastek` | Mastek | `IT_SERVICES` | Digital Commerce & Cloud Solutions | Mumbai / Ahmedabad | Graduate Engineer Trainee, Oracle Cloud Associate |
| `nucleus_software` | Nucleus Software | `PRODUCT_MNC` | Lending & Transaction Banking Software | Noida, Uttar Pradesh | Assistant Software Engineer (Java/Fintech), Product Trainee |
| `newgen_software` | Newgen Software | `PRODUCT_MNC` | Low-Code Digital Automation Platform | New Delhi, Delhi | Software Engineer Trainee, Solutions Architect Trainee |
| `intellect_design` | Intellect Design Arena | `PRODUCT_MNC` | Contextual Banking & FinTech Architecture | Chennai, Tamil Nadu | Associate Software Engineer, Cloud Microservices Trainee |
| `tanla_platforms` | Tanla Platforms | `PRODUCT_MNC` | CPaaS & Cloud Communications Tech | Hyderabad, Telangana | Software Engineer I (Distributed messaging), API Trainee |
| `tata_elxsi` | Tata Elxsi | `PRODUCT_MNC` | Design-led Technology & Connected Vehicles | Bengaluru / Thiruvananthapuram | Engineer Trainee — Connected Vehicles, Embedded C Developer |
| `ltts` | L&T Technology Services (LTTS) | `PRODUCT_MNC` | Pure-Play Engineering R&D (ER&D) | Vadodara / Bengaluru | Associate Software Engineer, Industrial Automation Trainee |
| `sasken` | Sasken Technologies | `PRODUCT_MNC` | Telecom, Automotive & Satellite Tech | Bengaluru, Karnataka | Embedded Software Trainee, 5G Wireless Validation Engineer |
| `stmicro_india` | STMicroelectronics India | `PRODUCT_MNC` | Semiconductors, Microcontrollers & MEMS | Greater Noida, Uttar Pradesh | Embedded Software Engineer Trainee, Silicon Design Trainee |
| `renesas_india` | Renesas Electronics India | `PRODUCT_MNC` | Automotive & Industrial Microcontrollers | Bengaluru, Karnataka | Firmware Validation Engineer, Applications Trainee |
| `blackbuck` | BlackBuck (Zinka Logistics) | `UNICORN` | Fleet Management & Trucking Freight Tech | Bengaluru, Karnataka | Software Development Engineer I, Tracking Systems Associate |
| `ninjacart` | Ninjacart | `UNICORN` | Agritech B2B Supply Chain & Cold Chain | Bengaluru, Karnataka | SDE I (Backend), Logistics Optimization Engineer |
| `urban_company` | Urban Company Tech | `UNICORN` | Home Services Marketplace Tech | Gurugram, Haryana | Software Development Engineer I, Mobile App Trainee |

---

## 3. Allowed Competency Keys (The 20 Core Signals)

When defining the `competencies` and `reqLevel` fields for any job role, **ONLY** use keys from this list:

```typescript
export type RecognizedCompetency =
  | 'dsa'            // Data Structures, Algorithms, Problem Solving, LeetCode, Competitive Programming
  | 'systemdesign'   // Distributed Systems, Microservices, Caching, Sharding, Message Queues
  | 'java'           // Spring Boot, Core Java, JVM Tuning, Hibernate, Enterprise APIs
  | 'python'         // Django, FastAPI, Data Pipelines, Scripting, Asyncio
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

---

## 4. Exact TypeScript Interfaces

### Company Schema
```typescript
export interface Company {
  id: string;               // Unique slug: e.g. "axxela", "visteon", "socgen_gsc"
  name: string;             // Official Name: e.g. "Axxela Advisory", "Visteon Corporation"
  logo: string;             // 1-3 letter monogram fallback: e.g. "AX", "VIS", "SG"
  gradient: string;         // Tailwind CSS gradient: e.g. "from-emerald-500 to-teal-400"
  industry: string;         // Industry string: e.g. "Automotive Cockpit Electronics & ADAS"
  hq: string;               // Headquarters: e.g. "Chennai / Pune, India"
  tier: 'FAANG' | 'UNICORN' | 'PRODUCT_MNC' | 'GCC' | 'IT_SERVICES' | 'STARTUP';
  hiring2023?: number;      // Annual intake estimate: e.g. 150
  hiring2024?: number;      // Annual intake estimate: e.g. 180
  openRoles?: number;       // Open openings: e.g. 12
  avgPackage: string;       // Average package: e.g. "₹8.5 - 14.0 LPA"
  glassdoor: number;        // Glassdoor rating: e.g. 4.2
  roles: Role[];            // List of calibrated roles (5 to 10 roles per company)
}
```

### Role Schema
```typescript
export interface Role {
  title: string;                                // e.g. "Embedded Software Engineer — ADAS"
  level: string;                                // e.g. "Entry / GET", "Fresher / SDE I", "0-2 years"
  desc: string;                                 // 1-2 sentence calibration description
  competencies: string[];                       // 4-6 keys strictly from the 20 RecognizedCompetency list
  reqLevel: Record<string, 'working' | 'strong' | 'expert'>;
  location: string;                             // e.g. "Chennai / Bengaluru, India"
  employmentType: 'Full-time' | 'Internship + PPO';
  experienceLevel: '0-2 years' | 'Entry Level' | 'Fresher';
  aboutRole: string;                            // Rich 2-3 sentence overview of the role and impact
  responsibilities: string[];                   // 5-7 clear, bulleted technical responsibilities
  requiredQualifications: string[];             // 5-6 academic and technical requirements
  requiredSkills: Array<{
    skill: string;                              // e.g. "dsa", "c++", "embedded", "SQL"
    category: 'language' | 'framework' | 'concept' | 'tool';
    weight: number;                             // 0.5 to 1.0
  }>;
  preferredSkills?: string[];                   // 2-4 nice-to-have capabilities
  toolsAndTech?: string[];                      // 4-6 tools used daily
  softSkills?: string[];                        // 3 key soft skills
  hiringProcess: string[];                      // 4-5 exact interview stages
  compensation: string;                         // e.g. "₹9.0 - 14.5 LPA"
  benefits: string[];                           // 4-5 company perks
  fullText: string;                             // Complete formatted job description document
}
```

### Campus Eligibility Rule Schema
```typescript
export interface CompanyEligibilityRule {
  companyId: string;        // Must exactly match Company.id
  companyName: string;      // e.g. "Visteon Corporation"
  displayName: string;      // e.g. "Visteon — Graduate Engineer Trainee (Campus Intake)"
  aggregatePercent: number; // e.g. 65 (for 65% cutoff) or 70
  cgpaEquivalent: number;   // e.g. 6.5 or 7.0
  sourceName: string;       // e.g. "Visteon University Relations & Campus Drive Standards"
  sourceUrl?: string;       // Official student/career page
  notes: string;            // Eligibility details: Allowed backlogs, eligible degree branches
  confidence: 'high' | 'medium';
  lastReviewed: string;     // e.g. "2026-10-25"
}
```

---

## 5. Reference Implementation Example

Here is an authentic reference object for **`visteon`** to demonstrate the exact expected quality, field depth, and structural validity:

```json
{
  "id": "visteon",
  "name": "Visteon Corporation",
  "logo": "VIS",
  "gradient": "from-orange-500 to-amber-400",
  "industry": "Automotive Cockpit Electronics & ADAS",
  "hq": "Chennai / Pune, India (Global HQ: Van Buren Township, MI)",
  "tier": "PRODUCT_MNC",
  "hiring2023": 450,
  "hiring2024": 520,
  "openRoles": 24,
  "avgPackage": "₹8.0 - 13.5 LPA",
  "glassdoor": 4.1,
  "roles": [
    {
      "title": "Embedded Software Engineer — Digital Cockpit",
      "level": "Entry / GET",
      "desc": "Develops real-time automotive middleware, digital clusters, and AUTOSAR device drivers in Embedded C/C++.",
      "competencies": [
        "concurrency",
        "systemdesign",
        "security",
        "communication"
      ],
      "reqLevel": {
        "concurrency": "strong",
        "systemdesign": "strong",
        "security": "working",
        "communication": "working"
      },
      "location": "Chennai / Pune, India",
      "employmentType": "Full-time",
      "experienceLevel": "0-2 years",
      "aboutRole": "As an Embedded Software Engineer at Visteon, you will shape the next generation of digital cockpit clusters, infotainment head units, and domain controllers powering millions of connected vehicles worldwide. You will collaborate with automotive OEM architects to write safe, ISO 26262 compliant real-time software.",
      "responsibilities": [
        "Develop and validate real-time microcontroller firmware and BSPs in Embedded C and modern C++.",
        "Implement automotive communication stack layers including CAN, CAN-FD, LIN, and Automotive Ethernet.",
        "Integrate AUTOSAR Classic and Adaptive architectural components with RTOS platforms (QNX, FreeRTOS, Linux).",
        "Participate in ASPICE Level 3 software development lifecycle processes, static analysis, and code reviews.",
        "Debug hardware-software timing anomalies using logic analyzers, oscilloscopes, and Lauterbach trace debuggers.",
        "Author comprehensive unit tests and automated hardware-in-the-loop (HIL) test suites."
      ],
      "requiredQualifications": [
        "B.Tech / B.E. / M.Tech in Electronics & Communication, Electrical Engineering, or Computer Science.",
        "0-2 years of embedded development experience or strong academic embedded systems projects.",
        "Strong foundation in C/C++, data structures, bitwise manipulation, and microcontroller architectures (ARM Cortex-M/R).",
        "Understanding of real-time operating systems (RTOS), interrupts, concurrency, and memory management.",
        "Familiarity with automotive communication protocols (CAN, SPI, I2C, UART)."
      ],
      "requiredSkills": [
        { "skill": "Embedded C", "category": "language", "weight": 1.0 },
        { "skill": "C++", "category": "language", "weight": 0.9 },
        { "skill": "RTOS", "category": "concept", "weight": 0.8 },
        { "skill": "CAN Protocol", "category": "tool", "weight": 0.7 }
      ],
      "preferredSkills": [
        "AUTOSAR Classic/Adaptive knowledge",
        "MATLAB Simulink Model-Based Design",
        "Vector CANoe / CANalyzer experience"
      ],
      "toolsAndTech": ["Embedded C", "C++", "QNX", "FreeRTOS", "Vector CANoe", "Git"],
      "softSkills": ["Attention to Safety Detail", "Collaborative Problem Solving", "Technical Documentation"],
      "hiringProcess": [
        "Online Technical Assessment (C Programming, Aptitude, Core Electronics/OS Fundamentals)",
        "Technical Interview 1: Data Structures, C/C++ Pointers, Memory Mapping, and Microcontroller Internals",
        "Technical Interview 2: Real-time Concurrency, RTOS Tasks, CAN Communication & Architecture",
        "HR & Cultural Alignment Round"
      ],
      "compensation": "₹8.5 - 13.0 LPA",
      "benefits": [
        "Comprehensive Health & Accident Insurance",
        "Automotive Technical Training Academy",
        "Hybrid Work Model",
        "Annual Performance Bonus",
        "Higher Education Sponsorship"
      ],
      "fullText": "Job Title: Embedded Software Engineer — Digital Cockpit\nCompany: Visteon Corporation\nLocation: Chennai / Pune, India\nEmployment Type: Full-time\nExperience Level: 0-2 years\n\nAbout the Role:\nAs an Embedded Software Engineer at Visteon, you will shape the next generation of digital cockpit clusters, infotainment head units, and domain controllers powering millions of connected vehicles worldwide. You will collaborate with automotive OEM architects to write safe, ISO 26262 compliant real-time software.\n\nKey Responsibilities:\n• Develop and validate real-time microcontroller firmware and BSPs in Embedded C and modern C++.\n• Implement automotive communication stack layers including CAN, CAN-FD, LIN, and Automotive Ethernet.\n• Integrate AUTOSAR Classic and Adaptive architectural components with RTOS platforms (QNX, FreeRTOS, Linux).\n• Debug hardware-software timing anomalies using logic analyzers and oscilloscopes.\n• Author comprehensive unit tests and automated hardware-in-the-loop (HIL) test suites.\n\nRequired Qualifications:\n• B.Tech / B.E. / M.Tech in Electronics & Communication, Electrical Engineering, or Computer Science.\n• 0-2 years of embedded development experience or strong academic embedded systems projects.\n• Strong foundation in C/C++, data structures, bitwise manipulation, and microcontroller architectures (ARM Cortex-M/R).\n• Understanding of real-time operating systems (RTOS), interrupts, concurrency, and memory management.\n\nRequired Skills & Technologies:\n• Embedded C\n• C++\n• RTOS\n• CAN Protocol\n\nHiring Process:\n1. Online Technical Assessment (C Programming, Aptitude, Core Electronics/OS Fundamentals)\n2. Technical Interview 1: Data Structures, C/C++ Pointers, Memory Mapping, and Microcontroller Internals\n3. Technical Interview 2: Real-time Concurrency, RTOS Tasks, CAN Communication & Architecture\n4. HR & Cultural Alignment Round"
    }
  ]
}
```

---

## 6. The Master Prompt for Claude (Copy & Paste this into Claude)

```markdown
You are an expert Principal Talent Intelligence Engineer and Technical Recruiter specializing in the Indian engineering placement market (Tier-1, Tier-2, and Tier-3 university campus recruitment, GCCs, core engineering MNCs, prop-trading desks, and Indian tech unicorns).

I am building HireFlow (an advanced career intelligence and resume auditing platform). I need you to generate production-ready dataset entries for a specific batch of companies from our target 100-company master roster.

### Mandatory Rules:
1. Every company must have:
   - `id`: unique lowercase slug (e.g., "axxela", "visteon", "socgen_gsc").
   - `name`: Official registered corporate name.
   - `logo`: 1-3 letter clean monogram.
   - `gradient`: Tailwind CSS linear gradient class (e.g., "from-emerald-500 to-teal-400").
   - `industry`: Accurate industry sector.
   - `hq`: Indian tech center/headquarters.
   - `tier`: One of 'FAANG' | 'UNICORN' | 'PRODUCT_MNC' | 'GCC' | 'IT_SERVICES' | 'STARTUP'.
   - `avgPackage`: Realistic Indian LPA range (e.g. "₹8.0 - 13.5 LPA", "₹18 - 32 LPA").
   - `roles`: An array of calibrated roles (at least 3-5 distinct roles per company, covering Fresher / Campus intake, SDE-1, and domain-specialized tracks).

2. In each role:
   - `competencies`: Choose 4 to 6 keys STRICTLY from this 20-key list:
     ['dsa', 'systemdesign', 'java', 'python', 'golang', 'nodejs', 'react', 'typescript', 'aws', 'kubernetes', 'ml', 'databases', 'leadership', 'devops', 'security', 'swift', 'kotlin', 'finance', 'communication', 'concurrency'].
   - `reqLevel`: Map each chosen competency to 'working', 'strong', or 'expert'.
   - `fullText`: Must be a complete, realistic job description string (including Title, About Role, Responsibilities, Qualifications, Required Skills, and Hiring Process rounds).
   - `hiringProcess`: Realistic campus drive stages (e.g., Online Assessment, Technical Round 1, Technical Round 2, HR Round).

3. Also generate the Campus Eligibility Rule for each company:
   - `aggregatePercent`: Typical campus cutoff (e.g., 60, 65, 70).
   - `cgpaEquivalent`: Corresponding CGPA (e.g., 6.0, 6.5, 7.0).
   - `notes`: Backlog restrictions, eligible branches (CS, IT, ECE, EE, etc.).

Generate the output in valid, parseable JSON format.

Here is the batch of companies to generate:
[INSERT LIST OF 10-20 COMPANY NAMES FROM THE MASTER LIST HERE]
```

---

## 7. Delivery & Integration Checklist

Once Claude generates your JSON batches:
1. **Append to `talentLensData.ts`**:
   Insert the generated company objects into `RAW_COMPANIES` in [`src/pages/demo/talentLensData.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/demo/talentLensData.ts).
2. **Register Eligibility Rules**:
   Insert the generated `CompanyEligibilityRule` objects into `KNOWN_RULES` in [`src/data/market/companyEligibility.ts`](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/data/market/companyEligibility.ts).
3. **Verify Build & Test Safety**:
   Run the regression validation suite:
   ```bash
   npx tsc --noEmit
   npx vitest run
   ```
4. **Deploy**:
   Commit and push to `origin/main` and `origin/design-1`.
