// ============================================================
// ATS Resume Roaster — Golden Evaluation Test Suite (Stage 6.6)
// 32 Resume/JD pairs across SDE, Frontend, Backend, Data, ML/AI,
// DevOps, Embedded, and Core Mechanical engineering.
// Strict benchmarking: Precision >= 0.92, Recall >= 0.90, Runtime < 300ms.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '../engine';

export interface GoldenTestCase {
  id: string;
  domain: string;
  role: string;
  resumeText: string;
  jdText: string;
  expectedPresent: string[]; // Skill IDs that MUST be found
  expectedMissing: string[]; // Skill IDs in JD that MUST be marked missing
}

export const GOLDEN_PAIRS: GoldenTestCase[] = [
  // 1. SDE - Junior Fullstack
  {
    id: 'sde_junior_01',
    domain: 'Software Engineering',
    role: 'Junior Fullstack Engineer',
    resumeText: `Alex Chen
Software Developer
alex@example.com | 555-0101 | San Francisco, CA

PROFESSIONAL SUMMARY
Motivated fullstack software developer with foundational background in modern web application engineering, clean code principles, and building responsive user interfaces with robust backend services.

EXPERIENCE
Junior Web Developer | Startify Inc | 2023 - Present
- Built customer dashboard using React, TypeScript, and Tailwind CSS.
- Implemented REST APIs in Node.js and Express with PostgreSQL database.
- Wrote automated unit tests in Jest achieving 85% code test coverage.
- Participated in weekly agile code reviews and continuous delivery cycles.

EDUCATION
B.S. in Computer Science | State University | 2019 - 2023

SKILLS
React, TypeScript, Node.js, Express, PostgreSQL, Jest, Git, HTML, CSS`,
    jdText: `Junior Fullstack Developer
Requirements:
- Must have React and TypeScript experience
- Backend development with Node.js and PostgreSQL
- Experience with AWS and Kubernetes is preferred`,
    expectedPresent: ['react', 'typescript', 'node_js', 'postgresql'],
    expectedMissing: ['aws', 'kubernetes'],
  },

  // 2. SDE - Senior Backend (Java)
  {
    id: 'sde_senior_java_02',
    domain: 'Software Engineering',
    role: 'Senior Java Backend Engineer',
    resumeText: `Marcus Brody
Staff Software Engineer
marcus@example.com | 555-0102 | New York, NY

PROFESSIONAL SUMMARY
Senior backend systems engineer with 6+ years specializing in distributed financial systems, mission-critical microservice architectures, high-volume database engineering, and low-latency APIs.

EXPERIENCE
Senior Backend Engineer | FinTech Cloud | 2019 - Present
- Architected payment processing pipeline in Java and Spring Boot handling 20,000 TPS.
- Tuned PostgreSQL queries and connection pooling, cutting latency by 40%.
- Deployed distributed microservices onto Docker and Kubernetes clusters.
- Mentored 5 junior engineers and authored core architecture design RFCs.

EDUCATION
B.S. in Computer Science | Tech Institute | 2015 - 2019

SKILLS
Java, Spring Boot, PostgreSQL, Docker, Kubernetes, Redis, Microservices, Git`,
    jdText: `Senior Backend Engineer
Requirements:
- 5+ years Java and Spring Boot experience
- Strong database knowledge in PostgreSQL and Redis
- Microservices architecture with Docker and Kubernetes
- Nice to have: Go programming`,
    expectedPresent: ['java', 'spring_boot', 'postgresql', 'redis', 'docker', 'kubernetes', 'microservices'],
    expectedMissing: ['go'],
  },

  // 3. Frontend - React & Next.js Performance
  {
    id: 'fe_react_next_03',
    domain: 'Frontend Web',
    role: 'Lead Frontend Engineer',
    resumeText: `Elena Rostova
Lead Frontend Engineer
elena@example.com | 555-0103 | Seattle, WA

PROFESSIONAL SUMMARY
Staff UI engineer with deep expertise in modern frontend architectures, server-side rendering, web performance optimization, and design systems for enterprise scale e-commerce applications.

EXPERIENCE
Lead UI Engineer | ShopGlobal | 2020 - Present
- Engineered SSR web storefront using Next.js, React, and TypeScript.
- Optimized Core Web Vitals, slashing LCP from 3.8s to 1.2s across 2M monthly visitors.
- Managed client state with Zustand and cached server queries with TanStack Query.
- Built reusable component library styled with Tailwind CSS and Radix UI.

EDUCATION
B.S. in Software Engineering | University of Washington | 2016 - 2020

SKILLS
React, Next.js, TypeScript, Zustand, TanStack Query, Tailwind CSS, Web Performance, HTML5`,
    jdText: `Senior Frontend Developer
Requirements:
- Expert knowledge of React, Next.js, and TypeScript
- Proven experience with Web Performance and Core Web Vitals
- State management with Zustand or Redux
- Preferred: GraphQL and Angular`,
    expectedPresent: ['react', 'next_js', 'typescript', 'zustand'],
    expectedMissing: ['angular'],
  },

  // 4. Frontend - Vue & Nuxt
  {
    id: 'fe_vue_nuxt_04',
    domain: 'Frontend Web',
    role: 'Vue.js Developer',
    resumeText: `David Kim
Frontend Engineer
david@example.com | 555-0104 | Austin, TX

PROFESSIONAL SUMMARY
Frontend developer passionate about progressive reactive user interfaces, component-driven design systems, clean animations, and building fast web portals with Vue and Nuxt frameworks.

EXPERIENCE
Frontend Developer | MediaCorp | 2021 - Present
- Developed video streaming portal using Vue.js, Nuxt.js, and Pinia.
- Styled responsive interfaces using Tailwind CSS and CSS Grid layouts.
- Integrated WebSocket client for live chat synchronization and instant notifications.
- Collaborated closely with UI/UX designers to translate Figma tokens into code.

EDUCATION
B.S. in Computer Science | UT Austin | 2017 - 2021

SKILLS
Vue, Nuxt, JavaScript, Tailwind CSS, WebSockets, HTML, CSS, Git`,
    jdText: `Vue Developer
Requirements:
- Deep experience with Vue and Nuxt.js
- Strong HTML, CSS, and Tailwind CSS
- Desired: Svelte and React`,
    expectedPresent: ['vue', 'nuxtjs', 'tailwind_css'],
    expectedMissing: ['svelte', 'react'],
  },

  // 5. Backend - Go Microservices
  {
    id: 'be_golang_05',
    domain: 'Backend Engineering',
    role: 'Go Platform Engineer',
    resumeText: `Vikram Patel
Platform Engineer
vikram@example.com | 555-0105 | Chicago, IL

PROFESSIONAL SUMMARY
High-throughput systems programmer experienced in concurrent backend engineering in Go, building low-latency distributed networks, high-volume RPC channels, and stream processing.

EXPERIENCE
Backend Engineer | StreamScale | 2021 - Present
- Engineered high-throughput telemetry collector in Go (Golang) handling 50k RPS.
- Implemented gRPC communication between internal distributed microservices.
- Published event messages to Apache Kafka real-time streaming brokers.
- Packaged services into lightweight container images running on Linux hosts.

EDUCATION
B.Tech in Computer Engineering | 2017 - 2021

SKILLS
Go, Golang, gRPC, Kafka, Docker, Linux, Git, REST APIs`,
    jdText: `Go Systems Engineer
Requirements:
- Must have production experience in Go (Golang)
- High performance RPC communication using gRPC
- Event streaming with Kafka
- Nice to have: Rust and C++`,
    expectedPresent: ['go', 'grpc', 'kafka'],
    expectedMissing: ['rust', 'cpp'],
  },

  // 6. Backend - Python / Django / FastAPI
  {
    id: 'be_python_06',
    domain: 'Backend Engineering',
    role: 'Python Backend Engineer',
    resumeText: `Sara Miller
Python Engineer
sara@example.com | 555-0106 | Denver, CO

PROFESSIONAL SUMMARY
Backend developer with 4+ years specializing in Python service development, high-speed asynchronous APIs with FastAPI, relational databases, and enterprise data models in Django.

EXPERIENCE
Backend Engineer | CloudData | 2021 - Present
- Built asynchronous REST APIs with FastAPI and Python 3.
- Managed background asynchronous worker processing tasks using Celery and Redis.
- Migrated legacy monolithic Django endpoints to modern microservices.
- Optimized relational queries in PostgreSQL reducing response latency by 35%.

EDUCATION
B.S. in Computer Science | Colorado State | 2017 - 2021

SKILLS
Python, FastAPI, Django, Celery, Redis, PostgreSQL, Git, Linux`,
    jdText: `Python Developer
Requirements:
- Extensive experience with Python, FastAPI, and Django
- Distributed task queue with Celery and Redis
- Database design in PostgreSQL
- Preferred: Ruby on Rails`,
    expectedPresent: ['python', 'fastapi', 'django', 'celery', 'redis', 'postgresql'],
    expectedMissing: ['ruby_on_rails'],
  },

  // 7. Backend - .NET Core / C#
  {
    id: 'be_dotnet_07',
    domain: 'Backend Engineering',
    role: '.NET Core Engineer',
    resumeText: `Thomas Weber
Senior .NET Developer
thomas@example.com | 555-0107 | Boston, MA

PROFESSIONAL SUMMARY
Senior enterprise software engineer with over 6 years building mission-critical services on Microsoft .NET platforms, resilient microservices, and database systems.

EXPERIENCE
Software Engineer | Enterprise Soft | 2018 - Present
- Built enterprise ERP services using C# and ASP.NET Core.
- Designed database schemas in Microsoft SQL Server with Entity Framework.
- Deployed cloud services to Microsoft Azure App Services and Azure SQL.
- Maintained 99.9% uptime SLA across enterprise customer accounts.

EDUCATION
B.S. in Computer Science | Boston University | 2014 - 2018

SKILLS
C#, ASP.NET Core, SQL Server, Entity Framework, Azure, Git`,
    jdText: `Senior C# Developer
Requirements:
- C# programming and ASP.NET Core
- Microsoft SQL Server and Entity Framework
- Azure cloud deployment
- Preferred: PHP or Java`,
    expectedPresent: ['csharp', 'aspnet_core', 'sql_server', 'azure'],
    expectedMissing: ['php', 'java'],
  },

  // 8. Data Analyst - SQL & BI
  {
    id: 'data_analyst_08',
    domain: 'Data Analytics',
    role: 'Senior Data Analyst',
    resumeText: `Priya Sharma
Data Analyst
priya@example.com | 555-0108 | Atlanta, GA

PROFESSIONAL SUMMARY
Analytical data specialist experienced in statistical modeling, business intelligence reporting, and turning multi-terabyte data warehouses into actionable leadership insights.

EXPERIENCE
Data Analyst | RetailMetrics | 2020 - Present
- Authored complex SQL queries and window functions in Snowflake warehouse.
- Designed executive dashboards and automated KPI reporting pipelines.
- Automated daily cohort retention analysis using Python and Pandas.
- Partnered with product managers to deliver data-backed user journey insights.

EDUCATION
B.S. in Statistics | Georgia Tech | 2016 - 2020

SKILLS
SQL, Snowflake, Python, Pandas, Data Modeling, Statistics, Excel`,
    jdText: `Senior Data Analyst
Requirements:
- Advanced SQL querying and Snowflake data warehouse
- Data analysis in Python and Pandas
- Experience with Tableau dashboards
- Nice to have: Apache Spark`,
    expectedPresent: ['sql', 'snowflake', 'python', 'pandas'],
    expectedMissing: ['apache_spark'],
  },

  // 9. Data Engineer - Spark / Airflow / dbt
  {
    id: 'data_engineer_09',
    domain: 'Data Engineering',
    role: 'Lead Data Engineer',
    resumeText: `Arthur Dent
Data Engineer
arthur@example.com | 555-0109 | London, UK

PROFESSIONAL SUMMARY
Data infrastructure engineer specializing in distributed ETL/ELT pipelines, large-scale data ingestion, and building reliable modern data platforms for analytics teams.

EXPERIENCE
Staff Data Engineer | DataPipe | 2019 - Present
- Orchestrated batch ELT data pipelines using Apache Airflow and dbt.
- Processed 5TB daily log streams using Apache Spark and PySpark.
- Designed dimensional models in Google BigQuery for enterprise analysts.
- Enforced data quality checks and automated alerting workflows.

EDUCATION
M.S. in Computer Science | University of London | 2017 - 2019

SKILLS
Apache Spark, PySpark, Airflow, dbt, BigQuery, SQL, Python, Git`,
    jdText: `Lead Data Engineer
Requirements:
- Apache Spark and PySpark distributed computing
- Workflow orchestration with Apache Airflow and dbt
- Cloud warehouse in BigQuery
- Database querying with SQL and Python scripting
- Plus: Databricks and Kafka`,
    expectedPresent: ['apache_spark', 'apache_airflow', 'dbt', 'bigquery', 'sql', 'python'],
    expectedMissing: ['databricks'],
  },

  // 10. ML Engineer - PyTorch & MLOps
  {
    id: 'ml_engineer_10',
    domain: 'Machine Learning',
    role: 'Machine Learning Engineer',
    resumeText: `Mei Lin
Machine Learning Engineer
mei@example.com | 555-0110 | San Jose, CA

PROFESSIONAL SUMMARY
Machine learning engineer specializing in deep learning computer vision, predictive modeling, and productionizing scalable inference models using modern MLOps pipelines.

EXPERIENCE
ML Engineer | VisionAI | 2021 - Present
- Trained computer vision object detection models using PyTorch.
- Built MLOps tracking pipelines with MLflow and Docker containers.
- Packaged feature store transformations using Scikit-learn and Pandas.
- Accelerated GPU inference throughput by 3x using TensorRT quantization.

EDUCATION
M.S. in Artificial Intelligence | Stanford University | 2019 - 2021

SKILLS
Machine Learning, Deep Learning, PyTorch, Scikit-learn, MLflow, Docker, Python`,
    jdText: `Machine Learning Engineer
Requirements:
- PyTorch or TensorFlow for deep learning model training
- MLOps experiment tracking with MLflow
- Scikit-learn and Pandas data prep
- Container deployment with Docker and Python
- Preferred: Hugging Face and LangChain`,
    expectedPresent: ['machine_learning', 'deep_learning', 'pytorch', 'scikit_learn', 'mlops', 'docker', 'python'],
    expectedMissing: ['langchain'],
  },

  // 11. AI / LLM Engineer - RAG & LangChain
  {
    id: 'ai_rag_11',
    domain: 'Artificial Intelligence',
    role: 'Generative AI Engineer',
    resumeText: `Kavita Reddy
AI Solutions Engineer
kavita@example.com | 555-0111 | San Francisco, CA

PROFESSIONAL SUMMARY
Applied AI researcher and developer creating enterprise generative AI applications, retrieval-augmented generation pipelines, vector indexing, and agentic LLM workflows.

EXPERIENCE
AI Engineer | CogniTech | 2022 - Present
- Built conversational RAG applications using LangChain and OpenAI API.
- Indexed 1M knowledge documents into Pinecone vector database.
- Fine-tuned transformer models using Hugging Face pipelines.
- Reduced hallucination rates by 40% with multi-stage verification prompts.

EDUCATION
B.S. in Computer Science | UC Berkeley | 2018 - 2022

SKILLS
LLMs, LangChain, RAG, Pinecone, Hugging Face, Python, Git`,
    jdText: `Generative AI Engineer
Requirements:
- Hands-on experience building RAG systems with LangChain
- Vector search using Pinecone or Milvus
- Hugging Face transformers fine-tuning
- Python software engineering
- Desired: C++ and CUDA`,
    expectedPresent: ['llms', 'langchain', 'rag', 'vector_databases', 'transformers_hf', 'python'],
    expectedMissing: ['cpp'],
  },

  // 12. DevOps - Kubernetes & Terraform
  {
    id: 'devops_k8s_12',
    domain: 'Cloud / DevOps',
    role: 'Senior DevOps Engineer',
    resumeText: `Liam O'Connor
DevOps Engineer
liam@example.com | 555-0112 | Dublin, Ireland

PROFESSIONAL SUMMARY
Infrastructure engineer with extensive background automating multi-cloud environments, infrastructure-as-code, continuous deployment pipelines, and managing container clusters.

EXPERIENCE
Cloud Infrastructure Engineer | ScaleOps | 2019 - Present
- Provisioned multi-region AWS cloud infrastructure with Terraform.
- Managed production Kubernetes (EKS) clusters and Helm charts.
- Built CI/CD automation pipelines using GitHub Actions.
- Secured cloud environments using AWS IAM least-privilege policies.

EDUCATION
B.S. in Computer Systems | Trinity College | 2015 - 2019

SKILLS
AWS, Terraform, Kubernetes, Helm, GitHub Actions, Docker, Linux, CI/CD`,
    jdText: `Senior DevOps Engineer
Requirements:
- Deep expertise with AWS, Terraform, and Kubernetes
- Helm package manager and GitHub Actions CI/CD
- Linux systems administration and Docker containerization
- Desired: Ansible and Pulumi`,
    expectedPresent: ['aws', 'terraform', 'kubernetes', 'helm', 'github_actions', 'docker', 'linux_sysadmin'],
    expectedMissing: ['ansible', 'pulumi'],
  },

  // 13. SRE - Observability & Reliability
  {
    id: 'sre_observability_13',
    domain: 'Cloud / DevOps',
    role: 'Site Reliability Engineer',
    resumeText: `Rohan Gupta
SRE Lead
rohan@example.com | 555-0113 | Bangalore, India

PROFESSIONAL SUMMARY
Site Reliability Engineer focused on system telemetry, distributed observability, incident command, and building self-healing cloud production architectures.

EXPERIENCE
Site Reliability Engineer | UltraReliable | 2020 - Present
- Implemented Prometheus alerting and Grafana monitoring dashboards.
- Instrumented distributed tracing with OpenTelemetry and Jaeger.
- Maintained 99.99% SLO availability across 50 production microservices.
- Led root-cause postmortems and created automated remediation playbooks.

EDUCATION
B.Tech in Computer Science | 2016 - 2020

SKILLS
Prometheus, Grafana, OpenTelemetry, SRE, Linux, Docker, Python, Git`,
    jdText: `Site Reliability Engineer
Requirements:
- Prometheus and Grafana observability stack
- OpenTelemetry distributed tracing
- SRE error budgets and incident response
- Bonus: Splunk and Datadog`,
    expectedPresent: ['prometheus', 'grafana', 'opentelemetry', 'site_reliability_engineering'],
    expectedMissing: ['datadog'],
  },

  // 14. Mobile - iOS & Swift
  {
    id: 'mobile_ios_14',
    domain: 'Mobile Engineering',
    role: 'Senior iOS Developer',
    resumeText: `Hannah Schmidt
iOS Developer
hannah@example.com | 555-0114 | Berlin, Germany

PROFESSIONAL SUMMARY
Native iOS software engineer with 5+ years crafting high-performance mobile consumer applications, elegant user interfaces in SwiftUI, and App Store automation.

EXPERIENCE
Senior iOS Engineer | AppWorks | 2019 - Present
- Architected native iOS mobile application using Swift and SwiftUI.
- Integrated offline CoreData caching and asynchronous REST API networking.
- Automated App Store releases with Fastlane CI/CD pipelines.
- Reduced application launch times by 35% using Instruments profiling.

EDUCATION
B.S. in Informatics | Technical University Berlin | 2015 - 2019

SKILLS
Swift, SwiftUI, iOS Development, Xcode, Fastlane, Git, Mobile CI/CD`,
    jdText: `Senior iOS Engineer
Requirements:
- Production Swift programming and SwiftUI / UIKit
- iOS Development with Xcode and Cocoa
- Fastlane automated deployments
- Nice to have: Android or Flutter`,
    expectedPresent: ['swift', 'ios_development', 'mobile_cicd'],
    expectedMissing: ['android_development', 'flutter'],
  },

  // 15. Mobile - Android & Kotlin
  {
    id: 'mobile_android_15',
    domain: 'Mobile Engineering',
    role: 'Android Engineer',
    resumeText: `Rahul Verma
Android Developer
rahul@example.com | 555-0115 | Pune, India

PROFESSIONAL SUMMARY
Senior Android developer experienced with modern Jetpack Compose architectures, reactive coroutines, hardware sensors, and delivering top-tier Play Store apps.

EXPERIENCE
Android Engineer | MobilePlus | 2020 - Present
- Built consumer Android application using Kotlin and Jetpack Compose.
- Implemented Coroutines and Flow for reactive background processing.
- Published app updates to Google Play Console maintaining 4.8 star rating.
- Designed offline-first caching layer using Room database.

EDUCATION
B.Tech in Information Technology | 2016 - 2020

SKILLS
Kotlin, Android Development, Jetpack Compose, Android SDK, Git, REST APIs`,
    jdText: `Android Developer
Requirements:
- Strong Kotlin and Android SDK skills
- UI development in Jetpack Compose
- Google Play app publishing
- Nice to have: React Native`,
    expectedPresent: ['kotlin', 'android_development'],
    expectedMissing: ['react_native'],
  },

  // 16. Mobile - React Native
  {
    id: 'mobile_rn_16',
    domain: 'Mobile Engineering',
    role: 'Cross-Platform Mobile Engineer',
    resumeText: `Carlos Gomez
Mobile Engineer
carlos@example.com | 555-0116 | Miami, FL

PROFESSIONAL SUMMARY
Cross-platform mobile engineer experienced in delivering production iOS and Android apps from unified JavaScript and TypeScript codebases with native device bridges.

EXPERIENCE
Mobile App Developer | OmniApp | 2021 - Present
- Developed cross-platform iOS and Android apps using React Native and Expo.
- Reused 85% of codebase across mobile platforms, speeding time to market.
- Styled views with Tailwind CSS and integrated camera hardware APIs.
- Built push notification dispatchers and in-app purchase modules.

EDUCATION
B.S. in Computer Science | FIU | 2017 - 2021

SKILLS
React Native, React, TypeScript, JavaScript, Git, Mobile Development`,
    jdText: `React Native Developer
Requirements:
- React Native and TypeScript development
- State management in React
- Preferred: Swift and Objective-C native bridge experience`,
    expectedPresent: ['react_native', 'react', 'typescript', 'javascript'],
    expectedMissing: ['objective_c'],
  },

  // 17. Cybersecurity - Pen Testing & AppSec
  {
    id: 'security_pentest_17',
    domain: 'Cybersecurity',
    role: 'Security Engineer',
    resumeText: `Zack Taylor
Security Analyst
zack@example.com | 555-0117 | Washington, DC

PROFESSIONAL SUMMARY
Cybersecurity practitioner with strong offensive and defensive security experience, vulnerability research, ethical hacking, and securing enterprise cloud workloads.

EXPERIENCE
Cybersecurity Specialist | CyberShield | 2020 - Present
- Conducted web application penetration testing using Burp Suite and Metasploit.
- Identified OWASP Top 10 vulnerabilities including SQL injection and XSS.
- Performed network reconnaissance with Nmap and Wireshark.
- Authored comprehensive remediation reports for executive stakeholders.

EDUCATION
B.S. in Cybersecurity | George Mason University | 2016 - 2020

SKILLS
Cybersecurity, Penetration Testing, OWASP, Burp Suite, Wireshark, Network Security`,
    jdText: `Application Security Engineer
Requirements:
- In-depth knowledge of Cybersecurity and OWASP Top 10
- Hands-on Penetration Testing with Burp Suite and Wireshark
- Vulnerability assessment and remediation
- Preferred: CISSP certification and Cryptography`,
    expectedPresent: ['cybersecurity', 'application_security', 'penetration_testing', 'security_tools'],
    expectedMissing: ['cryptography'],
  },

  // 18. Embedded Systems - Firmware & C
  {
    id: 'embedded_firmware_18',
    domain: 'Embedded Systems',
    role: 'Firmware Engineer',
    resumeText: `Nikhil Rao
Embedded Systems Engineer
nikhil@example.com | 555-0118 | Detroit, MI

PROFESSIONAL SUMMARY
Hardware-software embedded engineer experienced in bare-metal C/C++ firmware design, device drivers, low-power microcontrollers, and real-time scheduling.

EXPERIENCE
Firmware Developer | IoT Devices | 2019 - Present
- Programmed bare-metal firmware in Embedded C for STM32 ARM Cortex microcontrollers.
- Implemented sensor drivers over I2C, SPI, and UART communication protocols.
- Integrated FreeRTOS multitasking scheduler for brushless motor control.
- Debugged hardware signals using digital oscilloscopes and logic analyzers.

EDUCATION
B.S. in Electrical and Computer Engineering | 2015 - 2019

SKILLS
Embedded C, C, Microcontrollers, STM32, ARM Cortex, FreeRTOS, I2C, SPI, UART`,
    jdText: `Firmware Engineer
Requirements:
- Embedded C development for microcontrollers (ARM Cortex / STM32)
- FreeRTOS real-time operating system
- Hardware communication over I2C, SPI, UART
- Desired: ROS and Robotics`,
    expectedPresent: ['embedded_c', 'c', 'microcontrollers', 'rtos', 'hardware_protocols'],
    expectedMissing: ['robotics_ros'],
  },

  // 19. Core Mechanical - CAD & SolidWorks
  {
    id: 'mech_cad_19',
    domain: 'Core Mechanical',
    role: 'Mechanical Design Engineer',
    resumeText: `Arun Nair
Mechanical Engineer
arun@example.com | 555-0119 | Cleveland, OH

PROFESSIONAL SUMMARY
Mechanical design engineer with 4+ years creating precision parts, sheet metal components, injection molded housings, and manufacturing drawings following industry standards.

EXPERIENCE
Mechanical Design Engineer | AutoParts Ltd | 2020 - Present
- Designed sheet metal parts and plastic enclosures using SolidWorks and AutoCAD.
- Applied GD&T (Geometric Dimensioning and Tolerancing) standards for precision fabrication.
- Performed DFM (Design for Manufacturing) reviews with tooling suppliers.
- Managed assembly bills of materials (BOM) and tolerance stackup analyses.

EDUCATION
B.S. in Mechanical Engineering | Ohio State | 2016 - 2020

SKILLS
SolidWorks, AutoCAD, GD&T, DFM, Mechanical Engineering, Manufacturing`,
    jdText: `Mechanical Design Engineer
Requirements:
- Proficient in SolidWorks 3D CAD modeling and AutoCAD
- In-depth knowledge of GD&T and DFM/DFA engineering
- Nice to have: ANSYS FEA simulation`,
    expectedPresent: ['solidworks', 'autocad', 'gdt_standards', 'dfm_dfa'],
    expectedMissing: ['ansys'],
  },

  // 20. Core Mechanical - FEA & Simulation (ANSYS)
  {
    id: 'mech_fea_20',
    domain: 'Core Mechanical',
    role: 'CAE Simulation Engineer',
    resumeText: `Siddharth Roy
CAE Engineer
siddharth@example.com | 555-0120 | Houston, TX

PROFESSIONAL SUMMARY
Simulation specialist with extensive knowledge of finite element analysis, computational fluid dynamics, multiphysics modeling, and structural optimization.

EXPERIENCE
CAE Analyst | AeroMech | 2019 - Present
- Performed structural FEA and thermal simulations using ANSYS Mechanical.
- Conducted computational fluid dynamics (CFD) analysis using ANSYS Fluent.
- Validated physical strain gauge test results against finite element simulation models.
- Modeled parametric components in CATIA for aerodynamic testing.

EDUCATION
M.S. in Aerospace Engineering | Texas A&M | 2017 - 2019

SKILLS
ANSYS, ANSYS Mechanical, CFD, ANSYS Fluent, FEA, CATIA, CAD`,
    jdText: `CAE Simulation Specialist
Requirements:
- Structural FEA simulation using ANSYS or Abaqus
- Computational Fluid Dynamics (CFD) with Fluent
- CAD modeling in CATIA
- Preferred: Siemens NX`,
    expectedPresent: ['ansys', 'cfd_fluent', 'catia'],
    expectedMissing: ['siemens_nx'],
  },

  // 21. Core Civil - Structural Analysis & Revit
  {
    id: 'civil_structural_21',
    domain: 'Core Civil',
    role: 'Structural Civil Engineer',
    resumeText: `Ananya Das
Civil Structural Engineer
ananya@example.com | 555-0121 | Chicago, IL

PROFESSIONAL SUMMARY
Civil engineer focused on structural dynamics, building information modeling (BIM), concrete analysis, and commercial construction planning and execution.

EXPERIENCE
Structural Engineer | InfraBuild | 2020 - Present
- Modeled high-rise concrete structures in STAAD.Pro and ETABS.
- Prepared structural drawings and 3D architectural models in Autodesk Revit (BIM).
- Managed construction schedules and critical path tracking using Primavera P6.
- Ensured design calculations adhered to international building code standards.

EDUCATION
B.S. in Civil Engineering | Illinois Tech | 2016 - 2020

SKILLS
STAAD.Pro, ETABS, Revit, BIM, Primavera P6, AutoCAD, Civil Engineering`,
    jdText: `Senior Structural Engineer
Requirements:
- Structural analysis in STAAD.Pro or ETABS
- BIM drafting with Autodesk Revit and AutoCAD
- Project scheduling with Primavera P6
- Plus: GIS and Civil 3D`,
    expectedPresent: ['staad_pro', 'revit_bim', 'project_planning_eng', 'autocad'],
    expectedMissing: ['civil_3d'],
  },

  // 22. Industrial Automation - PLC & SCADA
  {
    id: 'automation_plc_22',
    domain: 'Industrial Automation',
    role: 'Automation Controls Engineer',
    resumeText: `Rajesh Kulkarni
Automation Engineer
rajesh@example.com | 555-0122 | Milwaukee, WI

PROFESSIONAL SUMMARY
Controls and automation engineer with 6+ years designing programmable logic control logic, plant-wide SCADA monitoring, and commissioning factory equipment.

EXPERIENCE
Controls Engineer | PlantTech | 2018 - Present
- Programmed Siemens PLC and Allen Bradley logic controllers in ladder logic.
- Built supervisory SCADA and HMI dashboards for manufacturing lines.
- Commissioned industrial communication networks over Modbus and Profinet.
- Diagnosed machine faults to minimize factory downtime by 25%.

EDUCATION
B.S. in Electrical Engineering | UW Madison | 2014 - 2018

SKILLS
PLC Programming, Siemens PLC, Allen Bradley, SCADA, HMI, Modbus, Robotics`,
    jdText: `Automation Controls Engineer
Requirements:
- Industrial PLC Programming (Siemens / Allen Bradley)
- SCADA and HMI screen development
- Fieldbus protocols (Modbus / Profibus)
- Desired: Six Sigma Green Belt`,
    expectedPresent: ['plc_programming', 'scada_hmi', 'hardware_protocols'],
    expectedMissing: ['six_sigma_lean'],
  },

  // 23. Ambiguity Guard: C Language vs Letter C
  {
    id: 'ambiguity_c_23',
    domain: 'Ambiguity Guard',
    role: 'Systems Programmer',
    resumeText: `Gregory House
Systems Developer
greg@example.com | 555-0123 | Princeton, NJ

PROFESSIONAL SUMMARY
Low-level systems software developer specializing in compiler design, Linux kernel memory management, operating system internals, and performance-critical systems.

EXPERIENCE
Systems Software Engineer | CoreTech | 2020 - Present
- Wrote low-level kernel modules in C programming language.
- Optimized memory allocations with custom pointer pools and cache alignment.
- Maintained core daemons across Debian Linux server fleets.
- Authored test harnesses verifying memory safety and zero memory leaks.

EDUCATION
B.S. in Computer Science | Princeton University | 2016 - 2020

SKILLS
C programming, C language, Linux, Git, Systems Software`,
    jdText: `Systems Engineer
Requirements:
- C systems programming
- Linux kernel development
- Plus: Rust language`,
    expectedPresent: ['c', 'linux_sysadmin'],
    expectedMissing: ['rust'],
  },

  // 24. Ambiguity Guard: False C Mention ("Vitamin C", "Plan C")
  {
    id: 'ambiguity_false_c_24',
    domain: 'Ambiguity Guard',
    role: 'Nutrition Analyst',
    resumeText: `Olivia Pope
Nutrition Specialist
olivia@example.com | 555-0124 | Washington, DC

PROFESSIONAL SUMMARY
Clinical nutrition analyst with extensive experience evaluating dietary supplements, patient wellness plans, and healthcare survey research in academic medical centers.

EXPERIENCE
Health Analyst | BioHealth Labs | 2021 - Present
- Evaluated dietary intake of Vitamin C and Vitamin D in clinical trials.
- Implemented backup recovery Plan C for laboratory survey data storage.
- Prepared quarterly dietary assessment charts for participating hospital clinics.
- Organized patient interview records and verified nutritional compliance.

EDUCATION
B.S. in Nutritional Sciences | Howard University | 2017 - 2021

SKILLS
Nutrition, Clinical Research, Laboratory Documentation, Data Organization`,
    jdText: `Software Engineer
Requirements:
- C programming language
- Python scripting`,
    expectedPresent: [],
    expectedMissing: ['c', 'python'],
  },

  // 25. Ambiguity Guard: Go (Golang) vs "ready to go"
  {
    id: 'ambiguity_false_go_25',
    domain: 'Ambiguity Guard',
    role: 'Project Coordinator',
    resumeText: `Barry Allen
Project Coordinator
barry@example.com | 555-0125 | Central City, MO

PROFESSIONAL SUMMARY
Energetic operations coordinator skilled in cross-team scheduling, event logistics, resource management, and ensuring projects are completed ahead of schedule.

EXPERIENCE
Operations Assistant | FastTrack Logistics | 2022 - Present
- Ensured event deliverables were ready to go on tight deadline schedules.
- Encouraged team members to go above and beyond expectations for clients.
- Scheduled vendor shipments and tracked delivery metrics across three warehouses.
- Prepared weekly status summaries for senior department leadership.

EDUCATION
B.A. in Business Administration | Central University | 2018 - 2022

SKILLS
Coordination, Scheduling, Agile, Event Planning, Vendor Management`,
    jdText: `Backend Engineer
Requirements:
- Go (Golang) development
- PostgreSQL database`,
    expectedPresent: [],
    expectedMissing: ['go', 'postgresql'],
  },

  // 26. Ambiguity Guard: Rust Language vs Metal Rust
  {
    id: 'ambiguity_false_rust_26',
    domain: 'Ambiguity Guard',
    role: 'Materials Inspector',
    resumeText: `Peter Parker
Quality Inspector
peter@example.com | 555-0126 | Queens, NY

PROFESSIONAL SUMMARY
Experienced materials quality inspector certified in non-destructive testing, corrosion assessment, industrial metal safety, and structural integrity evaluations.

EXPERIENCE
Structural Inspector | MetalWorks Corporation | 2020 - Present
- Inspected steel pipes for surface rust and oxidation degradation.
- Applied anti-corrosive coating to prevent rust formation across outdoor frames.
- Logged ultrasonic thickness measurements and reported structural anomalies.
- Ensured compliance with municipal safety and bridge maintenance codes.

EDUCATION
A.S. in Industrial Technology | Queens College | 2018 - 2020

SKILLS
Quality Control, Material Inspection, Safety, Non-Destructive Testing`,
    jdText: `Systems Programmer
Requirements:
- Rust systems programming
- Docker containers`,
    expectedPresent: [],
    expectedMissing: ['rust', 'docker'],
  },

  // 27. Ambiguity Guard: Swift Language vs "swift response"
  {
    id: 'ambiguity_false_swift_27',
    domain: 'Ambiguity Guard',
    role: 'Customer Support Rep',
    resumeText: `Diana Prince
Support Representative
diana@example.com | 555-0127 | Gateway City, CA

PROFESSIONAL SUMMARY
Customer service lead committed to high customer satisfaction scores, empathetic communication, fast issue triage, and managing support ticket queues.

EXPERIENCE
Support Lead | CareHelp Tech | 2021 - Present
- Provided swift response times to critical customer escalation tickets.
- Commended for swift problem resolution across technical user inquiries.
- Maintained a 98% customer satisfaction score across 4,000 resolved chats.
- Mentored onboarding support agents on company knowledge base software.

EDUCATION
B.A. in Communications | Gateway University | 2017 - 2021

SKILLS
Customer Support, Communication, Ticketing, Troubleshooting, CRM`,
    jdText: `iOS App Developer
Requirements:
- Swift programming language
- iOS Development`,
    expectedPresent: [],
    expectedMissing: ['swift', 'ios_development'],
  },

  // 28. Negation Guard: "No experience with AWS"
  {
    id: 'negation_aws_28',
    domain: 'Negation Guard',
    role: 'Web Developer',
    resumeText: `Clark Kent
Frontend Developer
clark@example.com | 555-0128 | Metropolis, NY

PROFESSIONAL SUMMARY
Frontend web developer with focus on semantic HTML, accessible component design, TypeScript, and collaborating with cross-functional backend engineering teams.

EXPERIENCE
Web Developer | DailyPlanet Media | 2021 - Present
- Developed UI features in React and TypeScript for news portal.
- Styled responsive layouts using modern CSS and Flexbox.
- Collaborated with devops team; have no prior experience with AWS cloud services.
- Tested web application accessibility using Screen Readers and WCAG audits.

EDUCATION
B.S. in Computer Science | Metropolis University | 2017 - 2021

SKILLS
React, TypeScript, CSS, Git, HTML, Responsive Design`,
    jdText: `Fullstack Engineer
Requirements:
- React and TypeScript
- AWS cloud experience`,
    expectedPresent: ['react', 'typescript'],
    expectedMissing: ['aws'],
  },

  // 29. Implication Graph: Next.js implies React & JavaScript
  {
    id: 'implication_nextjs_29',
    domain: 'Implication Graph',
    role: 'SSR Web Developer',
    resumeText: `Natasha Romanoff
Web Architect
natasha@example.com | 555-0129 | New York, NY

PROFESSIONAL SUMMARY
Senior web architect specializing in server-side rendered architectures, modern web frameworks, performant API integration, and headless web portals.

EXPERIENCE
Lead Web Developer | ShieldTech | 2021 - Present
- Architected high-traffic e-commerce portal with Next.js and Node.js.
- Scaled serverless SSR endpoints serving 500,000 daily hits.
- Configured dynamic caching and incremental static regeneration.
- Integrated payment gateways and customer authentication flows.

EDUCATION
B.S. in Computer Engineering | 2017 - 2021

SKILLS
Next.js, Node.js, HTML, CSS, Git, Web Development`,
    jdText: `Senior React Developer
Requirements:
- React web development
- JavaScript fundamentals`,
    expectedPresent: ['react', 'javascript'],
    expectedMissing: [],
  },

  // 30. Substitute Graph: Candidate has PostgreSQL, JD requests MySQL
  {
    id: 'substitute_db_30',
    domain: 'Substitute Graph',
    role: 'Backend Engineer',
    resumeText: `Steve Rogers
Backend Developer
steve@example.com | 555-0130 | Brooklyn, NY

PROFESSIONAL SUMMARY
Backend developer with 5 years in relational database design, data modeling, ACID transactions, and building scalable API services.

EXPERIENCE
Database Developer | AvengerCorp | 2020 - Present
- Designed normalized relational schemas in PostgreSQL.
- Optimized query execution plans and index partitioning.
- Built automated backup and disaster recovery replication pipelines.
- Integrated Python data loaders and Docker testing environments.

EDUCATION
B.S. in Software Engineering | 2016 - 2020

SKILLS
PostgreSQL, SQL, Python, Docker, Git, Database Design`,
    jdText: `Database Administrator
Requirements:
- MySQL database administration
- SQL query optimization`,
    expectedPresent: ['sql'],
    expectedMissing: ['mysql'],
  },

  // 31. OR Group: JD requests "Java or Kotlin", candidate has Kotlin
  {
    id: 'or_group_java_kotlin_31',
    domain: 'OR Group',
    role: 'Android Engineer',
    resumeText: `Tony Stark
Mobile Architect
tony@example.com | 555-0131 | Malibu, CA

PROFESSIONAL SUMMARY
Mobile solutions architect with deep expertise in Android operating system internals, modular mobile architectures, hardware SDKs, and clean code.

EXPERIENCE
Lead Mobile Engineer | StarkTech | 2019 - Present
- Architected reactive Android mobile services in Kotlin.
- Built modular architecture with 99.9% crash-free sessions across 1M devices.
- Created custom hardware communication bridges for Bluetooth peripherals.
- Led mobile release cycles and Play Store deployment pipelines.

EDUCATION
B.S. in Computer Science | MIT | 2015 - 2019

SKILLS
Kotlin, Android Development, Android SDK, Git, Architecture`,
    jdText: `Senior Mobile Engineer
Requirements:
- Core knowledge of Java or Kotlin
- Android SDK architecture`,
    expectedPresent: ['kotlin', 'android_development'],
    expectedMissing: [],
  },

  // 32. Multi-disciplinary Lateral: Mechanical student targeting Software lateral
  {
    id: 'lateral_mech_software_32',
    domain: 'Cross-Discipline',
    role: 'Mechanical Engineer learning Software',
    resumeText: `Bruce Banner
Computational Engineer
bruce@example.com | 555-0132 | Dayton, OH

PROFESSIONAL SUMMARY
Dual-discipline mechanical and software engineer combining finite element analysis and computational simulation with modern web visualization tools.

EXPERIENCE
Mechanical Simulation Intern | GammaLab | 2022 - 2023
- Automated CAD geometric simulations using Python scripts and NumPy.
- Modeled machine structures in SolidWorks with tight tolerances.
- Built interactive web dashboard in React to display simulation results.
- Wrote data pipelines transforming 3D point cloud meshes into JSON payloads.

EDUCATION
B.Tech in Mechanical Engineering | 2019 - 2023

SKILLS
SolidWorks, Python, NumPy, React, JavaScript, Git, CAD`,
    jdText: `Junior Software Engineer (CAD / Graphics)
Requirements:
- Python and React development
- SolidWorks familiarity is a plus
- Nice to have: C++ and OpenGL`,
    expectedPresent: ['python', 'react', 'solidworks'],
    expectedMissing: ['cpp'],
  },
];

describe('Stage 6.6 — 32 Golden Resumes Evaluation & Performance Benchmark', () => {
  it('Evaluates all 32 golden test cases, asserting Precision >= 0.92, Recall >= 0.90, and Runtime < 300ms', () => {
    let totalTP = 0;
    let totalFP = 0;
    let totalFN = 0;
    const runtimes: number[] = [];

    // Warm-up pass to ensure cold module initialization does not skew benchmark
    runAtsEngine('Software Engineer proficient in React and TypeScript with Docker', 'Looking for Software Engineer with React');

    for (const testCase of GOLDEN_PAIRS) {
      const startTime = performance.now();
      const response = runAtsEngine(testCase.resumeText, testCase.jdText);
      const elapsed = performance.now() - startTime;
      runtimes.push(elapsed);

      if (!response.success) {
        console.error(`FAILED ON TESTCASE ${testCase.id}: ${(response as any).message}`);
      }
      expect(response.success).toBe(true);
      if (!response.success) continue;

      const result = response.result;
      const foundSkillIds = new Set(result.skillResults.filter(s => s.found).map(s => s.skillId));

      // Calculate True Positives and False Negatives for expected present skills
      for (const expectedSkill of testCase.expectedPresent) {
        if (foundSkillIds.has(expectedSkill)) {
          totalTP++;
        } else {
          totalFN++;
        }
      }

      // Calculate False Positives for expected missing skills
      for (const missingSkill of testCase.expectedMissing) {
        if (foundSkillIds.has(missingSkill)) {
          totalFP++;
        }
      }

      // Assert each single test case executes under 600ms
      expect(elapsed).toBeLessThan(600);
    }

    const precision = totalTP / Math.max(1, totalTP + totalFP);
    const recall = totalTP / Math.max(1, totalTP + totalFN);
    const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
    const maxRuntime = Math.max(...runtimes);

    console.log(`\n============================================================`);
    console.log(`GOLDEN SUITE EVALUATION REPORT (32 TEST PAIRS):`);
    console.log(`True Positives (TP):  ${totalTP}`);
    console.log(`False Positives (FP): ${totalFP}`);
    console.log(`False Negatives (FN): ${totalFN}`);
    console.log(`Overall Precision:    ${(precision * 100).toFixed(2)}% (Target: >= 92.00%)`);
    console.log(`Overall Recall:       ${(recall * 100).toFixed(2)}% (Target: >= 90.00%)`);
    console.log(`Average Runtime:      ${avgRuntime.toFixed(2)}ms (Target: < 300ms)`);
    console.log(`Max Runtime:          ${maxRuntime.toFixed(2)}ms (Target: < 300ms)`);
    console.log(`============================================================\n`);

    expect(precision).toBeGreaterThanOrEqual(0.92);
    expect(recall).toBeGreaterThanOrEqual(0.90);
    expect(avgRuntime).toBeLessThan(300);
  });
});
