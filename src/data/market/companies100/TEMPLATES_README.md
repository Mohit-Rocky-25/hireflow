# Job Family Templates Rationale & Architecture (Stage 5)

**File**: `src/data/market/companies100/jobFamilyTemplates.ts`  
**Purpose**: Authoritative editorial role templates for the 100 Companies Expansion.  
**Guarantees**: Zero company-specific claims, zero fabricated salary figures, zero unverified interview stages. Deterministic mapping only from verified `jobFamily` ledger rows.

---

## 1. Design Principles

1. **Strictly Engine-Aligned Competencies**:
   - Each template specifies between **2 and 6** competencies drawn strictly from HireFlow's 20 canonical engine keys (`dsa`, `systemdesign`, `java`, `python`, `golang`, `nodejs`, `react`, `typescript`, `aws`, `kubernetes`, `ml`, `devops`, `sql`, `nosql`, `docker`, `ci_cd`, `graphql`, `rest`, `security`, `testing`).
   - Zero padding with irrelevant or artificial keys.
2. **Transparent Competency Fit (`good` vs `approximate`)**:
   - Where a role's essential skills cannot be mapped to the 20 web/backend/cloud engine keys (e.g. C/C++, Embedded C, RTOS, AUTOSAR, FPGA, UVM, CAN, low-latency), the template explicitly documents these in `uncoveredSkills[]` and sets `competencyFit: 'approximate'`.
   - Web, Cloud, and standard Software Engineering roles map cleanly and are marked `competencyFit: 'good'`.
3. **Representative Editorial Disclaimer**:
   - Every generated role fullText begins with the required editorial prefix:
     `Representative role profile (editorial). Not an actual job posting. See the official careers page: <careersUrl>`

---

## 2. Catalog of 22 Curated Job Families

| Family Key | Title | Track | Competencies (Engine Keys) | Competency Fit | Uncovered Core Skills | Rationale |
|---|---|---|---|---|---|---|
| `backend-engineer` | Backend Software Engineer | Backend | `java`, `dsa`, `systemdesign`, `sql`, `rest` | `good` | None | Core server-side services across GCCs, SaaS, and product firms. |
| `frontend-engineer` | Frontend Software Engineer | Frontend | `react`, `typescript`, `testing`, `rest` | `good` | None | Client-side web applications in D2C, High-Growth Tech, and SaaS. |
| `fullstack-engineer` | Full Stack Engineer | Full Stack | `react`, `typescript`, `nodejs`, `sql`, `rest`, `docker` | `good` | None | End-to-end feature engineering across web apps and cloud services. |
| `mobile-engineer` | Mobile Applications Engineer | Mobile | `react`, `typescript`, `rest`, `testing` | `approximate` | iOS Swift, Android Kotlin | Mobile platforms in consumer logistics, fintech, and EdTech. |
| `embedded-engineer` | Embedded Software Engineer | Embedded | `dsa`, `testing` | `approximate` | C/C++, embedded C, RTOS, microcontrollers | Automotive, IoT, and industrial electronics firmware. |
| `firmware-engineer` | Firmware Engineer | Embedded | `dsa`, `testing` | `approximate` | C/C++, firmware, memory-mapped I/O | Storage devices, memory controllers, and silicon bringup. |
| `fpga-asic-engineer` | FPGA / ASIC Verification Engineer | Hardware/VLSI | `dsa`, `python` | `approximate` | FPGA, ASIC, SystemVerilog, UVM | Semiconductor design verification (TI, ADI, Micron). |
| `automotive-software-engineer` | Automotive Software Engineer | Automotive | `dsa`, `testing` | `approximate` | C/C++, AUTOSAR, CAN bus, Simulink | Tier-1 automotive electronics (Bosch, Visteon, Continental). |
| `industrial-automation-engineer` | Industrial Automation Software Engineer | Industrial | `python`, `testing` | `approximate` | PLC, SCADA, control theory | Energy automation, robotics, and smart grids (ABB, Schneider). |
| `data-engineer` | Data Platform Engineer | Data & Analytics | `python`, `sql`, `aws`, `docker` | `approximate` | Snowflake, Spark, dbt | Enterprise analytical pipelines, warehouses, and lakehouses. |
| `data-scientist` | Data Scientist | Data & Analytics | `python`, `ml`, `sql` | `approximate` | Inferential statistics, hypothesis testing | Predictive modeling and statistical decision intelligence. |
| `ml-engineer` | Machine Learning Engineer | AI & ML | `python`, `ml`, `docker`, `kubernetes` | `approximate` | Vector DBs, LLM fine-tuning, MLOps | Production model serving and cognitive AI systems. |
| `qa-automation` | Quality Assurance & SDET | Quality | `testing`, `python`, `ci_cd`, `rest` | `approximate` | Playwright, Selenium, load testing | Automated testing frameworks and continuous quality gates. |
| `devops-cloud-engineer` | DevOps & Cloud Engineer | Platform Infra | `aws`, `kubernetes`, `docker`, `ci_cd`, `devops` | `approximate` | Terraform, Linux admin, IaC | Cloud orchestration, automated deployment, and observability. |
| `security-engineer` | Cybersecurity & InfoSec Engineer | Security | `security`, `python`, `aws`, `docker` | `approximate` | Vulnerability assessment, OWASP Top 10 | Application security, cloud posture audits, and compliance. |
| `quant-developer` | Quantitative Software Developer | Quant Tech | `dsa`, `systemdesign`, `python` | `approximate` | C/C++, low-latency, market data | Nanosecond-sensitive algorithmic trading engines. |
| `quant-researcher` | Quantitative Research Associate | Quant Research | `python`, `ml`, `dsa` | `approximate` | Stat arb, time-series, stochastic calculus | Mathematical alpha discovery and risk simulation models. |
| `systems-software-engineer` | Systems & Storage Software Engineer | Systems | `dsa`, `systemdesign`, `testing` | `approximate` | C/C++, Linux kernel, PCIe, NVMe | High-performance distributed file systems and OS drivers. |
| `solutions-engineer` | Technical Solutions Engineer | Solutions | `rest`, `sql`, `python`, `testing` | `approximate` | Enterprise integrations, consulting | Technical customer implementations and API integrations. |
| `hardware-engineer` | Electronic Hardware Design Engineer | Hardware | `testing` | `approximate` | PCB design, schematics, board bringup | Physical electronic circuit board and system design. |
| `software-engineer` | Software Development Engineer | Core SDE | `dsa`, `java`, `sql`, `rest`, `testing` | `good` | None | General SDE campus and early-career software roles. |
| `core-software-engineer` | Graduate Software Engineer (Trainee) | Core SDE | `dsa`, `python`, `sql`, `testing` | `good` | None | Entry-level trainee software engineering roles. |

---

## 3. Role Allocation per Depth Level

- **`deep`** (30 employers): Up to **5 roles** generated per company based on verified `jobFamily` rows.
- **`standard`** (59 employers): Up to **2 roles** generated based on verified `jobFamily` rows.
- **`basic`** (5 employers): **0 roles** (profile metadata and official careers portal link only).
- **`quarantined`** (2 entities): **0 roles** (quarantined, ships nothing).
