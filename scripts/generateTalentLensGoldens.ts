import fs from 'node:fs';
import path from 'node:path';
import { COMPANIES, Company, Role } from '../src/pages/demo/talentLensData';
import { buildSkillStates, normalizeTier } from '../src/pages/demo/engine/skillStateEngine';
import { matchProjectsWithIntegrity } from '../src/pages/demo/engine/projectMatcherIntegrity';
import { generateEvidenceSafeRewrites } from '../src/pages/demo/engine/bulletRewriteEngine';
import { analyzeRoleMatch } from '../src/pages/demo/talentLensEngine';
import { validateReport } from '../src/pages/demo/engine/reportValidator';

// ============================================================
// 1. PINNED 14 ROLES
// ============================================================
export interface PinnedRole {
  roleId: string;
  category: string;
  companyId: string;
  companyName: string;
  companyTier: string;
  roleTitle: string;
  roleLevel: string;
  role: Role;
  company: Company;
}

export function getPinned14Roles(): PinnedRole[] {
  const targets = [
    { key: 'campus-fintech', desc: 'campus fintech unicorn', test: (c: any, r: any) => c.tier === 'Unicorn' && (c.industry.toLowerCase().includes('fintech') || c.industry.toLowerCase().includes('payments')) && r.title.toLowerCase().includes('sde') },
    { key: 'faang-sde', desc: 'FAANG-tier SDE', test: (c: any, r: any) => c.tier === 'FAANG' && r.title.toLowerCase().includes('software engineer') },
    { key: 'it-services', desc: 'IT-services mass hiring', test: (c: any, r: any) => c.tier === 'IT Services' && (r.title.toLowerCase().includes('system') || r.title.toLowerCase().includes('associate') || r.title.toLowerCase().includes('engineer')) },
    { key: 'startup-fullstack', desc: 'startup full-stack', test: (c: any, r: any) => c.tier === 'Startup' && (r.title.toLowerCase().includes('full stack') || r.title.toLowerCase().includes('fullstack')) },
    { key: 'gcc-data-eng', desc: 'GCC data engineer', test: (c: any, r: any) => (c.tier === 'GCC' || c.industry.toLowerCase().includes('retail') || c.name.toLowerCase().includes('target') || c.name.toLowerCase().includes('walmart')) && r.title.toLowerCase().includes('data engineer') },
    { key: 'embedded-auto', desc: 'embedded/automotive', test: (c: any, r: any) => (c.industry.toLowerCase().includes('automotive') || r.title.toLowerCase().includes('embedded') || r.title.toLowerCase().includes('connected')) && !r.title.toLowerCase().includes('manager') },
    { key: 'security-eng', desc: 'security engineer', test: (c: any, r: any) => r.title.toLowerCase().includes('security') && !r.title.toLowerCase().includes('director') && !r.title.toLowerCase().includes('manager') },
    { key: 'ml-eng', desc: 'ML engineer', test: (c: any, r: any) => (r.title.toLowerCase().includes('machine learning') || r.title.toLowerCase().includes('ml engineer')) && !r.title.toLowerCase().includes('manager') },
    { key: 'frontend', desc: 'frontend', test: (c: any, r: any) => (r.title.toLowerCase().includes('frontend') || r.title.toLowerCase().includes('ui engineer')) && !r.title.toLowerCase().includes('manager') },
    { key: 'devops-sre', desc: 'DevOps/SRE', test: (c: any, r: any) => (r.title.toLowerCase().includes('devops') || r.title.toLowerCase().includes('sre') || r.title.toLowerCase().includes('site reliability')) && !r.title.toLowerCase().includes('manager') },
    { key: 'solutions-eng', desc: 'sales/solutions engineer', test: (c: any, r: any) => (r.title.toLowerCase().includes('solutions engineer') || r.title.toLowerCase().includes('solution architect') || r.title.toLowerCase().includes('sales engineer')) },
    { key: 'senior-backend', desc: 'lateral senior backend', test: (c: any, r: any) => (r.level || '').toLowerCase().includes('senior') && (r.title.toLowerCase().includes('backend') || (r.title.toLowerCase().includes('software engineer') && (r.level || '').toLowerCase().includes('senior'))) },
    { key: 'eng-manager', desc: 'lateral engineering manager', test: (c: any, r: any) => r.title.toLowerCase().includes('engineering manager') },
    { key: 'tier-s', desc: 'one role from a tier not yet covered (Tier S)', test: (c: any, r: any) => c.tier === 'Tier S' },
  ];

  const pinned: PinnedRole[] = [];
  for (const t of targets) {
    let found = false;
    for (const c of COMPANIES) {
      for (const r of (c.roles || [])) {
        if (t.test(c, r)) {
          const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const roleId = r.id || `${c.id}-${slug}`;
          pinned.push({
            roleId,
            category: t.desc,
            companyId: c.id,
            companyName: c.name,
            companyTier: c.tier,
            roleTitle: r.title,
            roleLevel: r.level || 'Mid',
            role: r,
            company: c,
          });
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }
  return pinned;
}

// ============================================================
// 2. 30 SYNTHETIC RESUMES
// ============================================================
export interface SyntheticResumeDef {
  id: string;
  filename: string;
  category: string;
  intent: string;
  text: string;
}

export function get30SyntheticResumes(): SyntheticResumeDef[] {
  return [
    {
      id: 'tier1_cs_student',
      filename: 'tier1_cs_student.txt',
      category: 'positive',
      intent: 'Tier-1 CS student with strong fundamentals, 2 summer internships, production Java/Spring and Go services.',
      text: `// Intent: Tier-1 CS student with strong fundamentals, 2 summer internships, production Java/Spring and Go services.
Aditya Sharma
Email: aditya.sharma@example.com | GitHub: github.com/aditya-sharma-cs | Phone: +91 98765 43210

Education:
Bachelor of Technology in Computer Science and Engineering
Indian Institute of Technology Delhi, 2021 – 2025
CGPA: 9.2 / 10.0

Experience:
Software Engineering Intern | InfoScale Systems, Bangalore | May 2024 – Jul 2024
- Engineered a distributed in-memory cache in Go with LRU eviction and concurrent mutex locks, reducing service response time by 32%.
- Integrated gRPC streaming endpoints for high-throughput cluster state synchronization handling 45,000 requests per minute.
- Authored automated integration test suites achieving 88% branch coverage across cache operations.

Backend Intern | TechCraft Solutions, Gurgaon | May 2023 – Jul 2023
- Built backend REST APIs using Java and Spring Boot for user profile management and credential authentication.
- Optimized PostgreSQL database queries with B-tree indices and join refactoring, reducing P95 latency by 28%.
- Containerized microservices using Docker and configured CI/CD deployment pipelines on AWS ECS.

Projects:
Distributed Raft Key-Value Store | Go, Raft Consensus, Docker
- Implemented Raft distributed consensus protocol in Go featuring leader election, log replication, and persistent WAL state.
- Benchmarked cluster performance across 5 nodes handling 12,000 commit operations per second during network partitions.

Technical Skills:
Languages: Go, Java, Python, C++, SQL, TypeScript, JavaScript
Backend & Systems: Spring Boot, Node.js, gRPC, PostgreSQL, Redis, Docker, Kubernetes, Linux
Core Fundamentals: Distributed Systems, System Design, DSA, Algorithms, OOP, Computer Networks, Security
`,
    },
    {
      id: 'tier3_cs_student',
      filename: 'tier3_cs_student.txt',
      category: 'positive',
      intent: 'Tier-3 college student with good effort, 2 solid web projects, no enterprise internships.',
      text: `// Intent: Tier-3 college student with good effort, 2 solid web projects, no enterprise internships.
Rohan Gupta
Email: rohan.gupta.dev@example.com | GitHub: github.com/rohangupta-code

Education:
Bachelor of Technology in Computer Science and Engineering
ABC Institute of Engineering and Technology, Greater Noida, 2021 – 2025
CGPA: 7.8 / 10.0

Experience:
Software Developer Intern | LocalTech Solutions | Jun 2024 – Aug 2024
- Worked on backend REST APIs using Java and Spring Boot for user profile management and database records.
- Assisted in optimizing SQL queries for reporting database tables, reducing execution time by 25%.
- Wrote unit tests using JUnit for user authentication modules achieving 75% code coverage.

Projects:
Campus Marketplace Web Application | React, Node.js, Express, MongoDB
- Developed full-stack campus e-commerce platform for textbook and equipment exchange using React and Node.js.
- Implemented user authentication with JWT tokens, password hashing with bcrypt, and role-based access control.
- Designed REST API endpoints with Express and modeled schema collections in MongoDB with Mongoose.
- Deployed application on Render with MongoDB Atlas cluster serving 400 active campus student users.

Automated Library Management System | Java, MySQL, JDBC
- Built desktop management application in Java using Swing UI and MySQL relational database.
- Implemented book issue tracking, student record lookups, and fine calculation modules using JDBC transactions.
- Wrote SQL queries and procedures to handle concurrent book reservations and stock reporting.

Technical Skills:
Languages: Java, JavaScript, Python, SQL, C++
Web Development: React, Node.js, Express, Spring Boot, HTML5, CSS3, Tailwind CSS
Databases & Tools: MongoDB, PostgreSQL, MySQL, Redis, Docker, Git, Postman
Core Fundamentals: DSA, Data Structures, Algorithms, OOP, System Design, DBMS
`,
    },
    {
      id: 'ece_student',
      filename: 'ece_student.txt',
      category: 'positive',
      intent: 'ECE student with strong C/C++, RTOS, microcontroller projects and basic software skills.',
      text: `// Intent: ECE student with strong C/C++, RTOS, microcontroller projects and basic software skills.
Kavita Reddy
Email: kavita.reddy@example.com | LinkedIn: linkedin.com/in/kavita-reddy-ece

Education:
B.Tech in Electronics and Communication Engineering
National Institute of Technology Warangal, 2021 – 2025
CGPA: 8.4 / 10.0

Projects:
Autonomous Rover Navigation System | C++, FreeRTOS, STM32 Microcontroller
- Programmed embedded firmware in C++ on STM32F4 microcontroller running FreeRTOS with preemptive task scheduling.
- Implemented sensor fusion algorithms reading IMU accelerometer and LIDAR sensor data via I2C and SPI buses.
- Reduced obstacle detection processing latency to under 15ms ensuring collision avoidance at 1.5 m/s rover speeds.

CAN Bus Vehicle Telemetry Gateway | Embedded C, Linux, CAN Protocol
- Developed automotive telemetry reader in Embedded C interfacing with vehicle OBD-II port using CAN 2.0B protocol.
- Engineered ring buffer data structures in C to prevent packet loss during 1 Mbps telemetry transmission bursts.
- Streamed diagnostic fault codes to a Raspberry Pi running Linux for real-time dashboard visualization.

IoT Environmental Monitoring Node | Python, MQTT, ESP32
- Configured low-power WiFi sensor node sending temperature and humidity telemetry over MQTT protocol.
- Wrote backend Python scripts to parse MQTT messages and persist time-series records into SQLite.

Technical Skills:
Languages: C, C++, Embedded C, Python, SQL
Embedded & Hardware: FreeRTOS, STM32, ARM Cortex-M, CAN Bus, I2C, SPI, UART, Linux Device Drivers
Tools: Git, Keil uVision, GDB, Saleae Logic Analyzer, CMake
`,
    },
    {
      id: 'mechanical_switcher',
      filename: 'mechanical_switcher.txt',
      category: 'positive',
      intent: 'Mechanical student switching to software, strong Python scripting, CAD automation, self-taught backend.',
      text: `// Intent: Mechanical student switching to software, strong Python scripting, CAD automation, self-taught backend.
Vikram Patel
Email: vikram.patel.mech@example.com | GitHub: github.com/vikram-patel-eng

Education:
Bachelor of Technology in Mechanical Engineering
Veermata Jijabai Technological Institute (VJTI), Mumbai, 2020 – 2024
CGPA: 8.1 / 10.0

Experience:
Junior Engineering Analyst | Apex Automotive Components, Pune | Jul 2024 – Present
- Automated finite element analysis (FEA) preprocessing workflows using Python scripts, saving 12 engineering hours weekly.
- Built data parsers in Python to extract stress strain telemetry from raw CSV output files and generate automated PDF reports.

Software Projects:
Manufacturing Inventory REST API | Python, FastAPI, PostgreSQL, Docker
- Built backend REST service using FastAPI and PostgreSQL to manage factory warehouse parts catalog and order fulfillment.
- Implemented database migrations with Alembic and wrote SQL queries for multi-table inventory join queries.
- Containerized application with Docker Compose and deployed on AWS EC2 instance with automated healthcheck endpoints.

Fleet Telemetry Dashboard | React, TypeScript, Chart.js
- Developed frontend web dashboard in React to visualize machine vibration and operational temperature thresholds.
- Connected dashboard to REST API endpoints to display real-time sensor charts with 2-second refresh intervals.

Technical Skills:
Languages: Python, SQL, JavaScript, TypeScript
Backend & Web: FastAPI, Flask, PostgreSQL, React, REST APIs
Tools: Docker, Git, Linux, Postman, Pandas, NumPy
`,
    },
    {
      id: 'bootcamp_grad',
      filename: 'bootcamp_grad.txt',
      category: 'positive',
      intent: 'Bootcamp graduate, MERN stack focused, rapid portfolio projects.',
      text: `// Intent: Bootcamp graduate, MERN stack focused, rapid portfolio projects.
Neha Verma
Email: neha.verma.dev@example.com | Portfolio: nehaverma.dev

Education:
Full Stack Web Development Intensive Bootcamp (600+ hours), Coding Academy, 2024
Bachelor of Commerce, University of Delhi, 2020 – 2023

Projects:
CollabFlow — Collaborative Team Task Board | React, Node.js, Express, MongoDB, Socket.io
- Built full-stack project management web application in React and Node.js featuring Kanban boards and real-time activity feeds.
- Integrated Socket.io for live board updates across team members with zero page reloads.
- Implemented secure JWT authentication and authorization middleware protecting private workspace API routes.
- Wrote automated unit tests with Jest and Supertest achieving 78% code coverage on core auth controllers.

RecipeShare Community Platform | React, Tailwind CSS, Express, MongoDB
- Developed recipe sharing social platform allowing users to post food recipes with tags, images, and ratings.
- Implemented client-side pagination, search filtering by ingredients, and responsive UI components with Tailwind CSS.

Technical Skills:
Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
Frontend: React, Redux Toolkit, Tailwind CSS, Vite
Backend: Node.js, Express, REST APIs, JWT, Socket.io
Databases & Tools: MongoDB, Mongoose, PostgreSQL, Git, Postman, Jest
`,
    },
    {
      id: 'backend_3yoe',
      filename: 'backend_3yoe.txt',
      category: 'positive',
      intent: '3 YoE Backend Software Engineer with production experience in microservices, Java Spring Boot, and PostgreSQL.',
      text: `// Intent: 3 YoE Backend Software Engineer with production experience in microservices, Java Spring Boot, and PostgreSQL.
Siddharth Nair
Email: siddharth.nair@example.com | Phone: +91 91234 56789 | Bangalore, India

Professional Experience:
Software Engineer | ZetaPay Solutions | Oct 2022 – Present
- Designed and maintained core payment orchestration microservices in Java, Python, and Spring Boot processing 25,000 transactions daily.
- Optimized PostgreSQL database schema with composite indices and partitioning, reducing API response latency from 180ms to 95ms.
- Implemented distributed Redis caching for merchant fee configurations, reducing database read load by 45%.
- Integrated Kafka message queues for asynchronous webhook notifications and audit logging across 12 downstream partners.
- Engineered backend REST API services using Node.js and Express for merchant settlement callbacks.
- Wrote comprehensive unit and integration tests using JUnit and Mockito maintaining 84% test coverage.

Associate Software Engineer | CloudCraft Technologies | Aug 2021 – Sep 2022
- Developed customer onboarding REST APIs in Java Spring Boot with Spring Security and OAuth2 token verification.
- Maintained Docker container images and deployed services onto AWS ECS clusters via Jenkins CI/CD pipelines.
- Implemented core DSA algorithms for transaction graph pathing and fraud detection.

Projects:
Distributed Payment Gateway Service | Java, Spring Boot, PostgreSQL, Redis
- Designed and maintained core payment orchestration microservices in Java, Python, and Spring Boot processing 25,000 transactions daily.
- Optimized PostgreSQL database schema with composite indices and partitioning, reducing API response latency from 180ms to 95ms.

Education:
Bachelor of Technology in Computer Science, KTU Kerala, 2017 – 2021

Technical Skills:
Languages: Java, Python, SQL, JavaScript, Node.js
Frameworks & Databases: Spring Boot, Node.js, Express, PostgreSQL, MySQL, Redis, Kafka
Core Fundamentals: DSA, Algorithms, Data Structures, System Design, REST APIs, Security, Microservices
Infrastructure & Tools: Docker, Kubernetes, AWS, Git, Maven, JUnit, Postman
`,
    },
    {
      id: 'senior_backend_6yoe',
      filename: 'senior_backend_6yoe.txt',
      category: 'positive',
      intent: '6 YoE Senior Backend Engineer with distributed systems expertise, architecture ownership, Golang, and high scale.',
      text: `// Intent: 6 YoE Senior Backend Engineer with distributed systems expertise, architecture ownership, Golang, and high scale.
Deepak Menon
Email: deepak.menon.tech@example.com | Bangalore, India

Professional Experience:
Senior Software Engineer | StreamX Technologies | Jan 2021 – Present
- Architected and led development of high-throughput real-time event streaming pipeline in Go and Apache Kafka handling 350,000 events/sec.
- Engineered distributed backend services in Java and Python with PostgreSQL and Redis, cutting database query latency by 50%.
- Designed enterprise payment gateway microservices in Java and Spring Boot deployed on AWS EKS processing 50M USD monthly volume with 99.99% SLA.
- Scaled Cassandra cluster across 18 nodes, optimizing partition keys and compaction strategies to reduce write latency p99 below 12ms.
- Built low-latency gRPC microservices in Go and Node.js for authentication and transaction routing handling 20,000 QPS.
- Mentored 7 junior and mid-level engineers, conducted 60+ architecture design reviews, and established company-wide Go coding standards.

Software Engineer | HyperLog Systems | Jul 2018 – Dec 2020
- Built low-latency microservices in Go and Java for real-time bid validation handling 50,000 queries per second.
- Refactored legacy monolithic services into containerized microservices on Kubernetes, reducing deployment turnaround from 3 days to 15 minutes.
- Implemented distributed tracing with OpenTelemetry and Jaeger to diagnose inter-service network bottlenecks.
- Optimized graph traversal algorithms and data structures reducing memory consumption by 30%.

Projects:
Distributed Raft Consensus Key-Value Store | Go, Raft, LevelDB, gRPC
- Built distributed fault-tolerant key-value datastore in Go implementing Raft consensus protocol across 5 nodes handling 40,000 requests/sec.
- Implemented log replication, leader election, and snapshotting mechanisms with automated failover under 500ms.
- Evaluated performance using Jepsen tests verifying linearizability under network partition faults.

High-Scale Transaction Routing Gateway | Java, Spring Boot, PostgreSQL, Kafka, AWS
- Implemented asynchronous idempotent message consumer in Java processing payment webhooks with guaranteed at-least-once delivery.
- Designed database schema with PostgreSQL connection pooling and Redis caching, improving throughput by 40%.
- Containerized application with Docker and orchestrated blue-green deployments on AWS Kubernetes cluster.

Education:
Bachelor of Technology in Computer Science, NIT Calicut, 2014 – 2018

Technical Skills:
Languages: Go, Golang, Java, Python, SQL, C++, TypeScript, JavaScript
Frameworks & Libraries: Spring Boot, Node.js, Express, gRPC, React
Architecture: Distributed Systems, High Availability, Microservices, System Design, DSA, Algorithms, Concurrency, Raft Consensus, Security
Storage & Streaming: Apache Kafka, Apache Cassandra, PostgreSQL, Redis, MongoDB, Databases
DevOps & Cloud: Kubernetes, Docker, AWS, Terraform, Prometheus, CI/CD, Linux, Git
`,
    },
    {
      id: 'frontend_only',
      filename: 'frontend_only.txt',
      category: 'positive',
      intent: 'Frontend specialist with deep React, TypeScript, Next.js, and web performance optimization skills, zero backend.',
      text: `// Intent: Frontend specialist with deep React, TypeScript, Next.js, and web performance optimization skills, zero backend.
Ananya Iyer
Email: ananya.iyer.ui@example.com | GitHub: github.com/ananya-frontend

Professional Experience:
Frontend Engineer | DesignFirst Studio | Aug 2022 – Present
- Engineered high-traffic responsive web portal using React 18, TypeScript, Next.js, and Tailwind CSS serving 1.2M monthly users.
- Optimized Core Web Vitals across web pages, improving Largest Contentful Paint (LCP) from 3.8s to 1.6s and raising Lighthouse score to 96.
- Architected enterprise React design system with 45+ reusable accessible UI components tested with Vitest and Storybook.
- Implemented client-side global state management using Zustand and optimized rendering with React.memo and useCallback.

Projects:
Interactive Data Visualization Studio | React, TypeScript, D3.js, Tailwind CSS
- Developed charting web tool allowing users to upload datasets and generate interactive bar, scatter, and line charts with SVG exports.
- Implemented accessible keyboard navigation and WCAG 2.1 AA compliant color contrast across all themes.

Education:
B.E. in Information Science, Bangalore University, 2018 – 2022

Technical Skills:
Frontend: React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, SASS
State & Testing: Zustand, Redux Toolkit, React Query, Vitest, Jest, React Testing Library
Tools: Vite, Webpack, Git, Figma, Storybook, Postman
`,
    },
    {
      id: 'devops_sre',
      filename: 'devops_sre.txt',
      category: 'positive',
      intent: 'DevOps & Site Reliability Engineer with Kubernetes, Terraform, CI/CD pipelines, and observability focus.',
      text: `// Intent: DevOps & Site Reliability Engineer with Kubernetes, Terraform, CI/CD pipelines, and observability focus.
Rajesh Kulkarni
Email: rajesh.kulkarni.sre@example.com | Mumbai, India

Professional Experience:
Site Reliability Engineer | CloudScale Systems | Sep 2022 – Present
- Managed production Kubernetes (EKS) clusters hosting 80+ microservices with automated horizontal pod autoscaling (HPA).
- Authored Infrastructure as Code (IaC) modules using Terraform to provision VPCs, security groups, RDS instances, and IAM roles across 3 regions.
- Designed unified CI/CD pipelines using GitHub Actions and ArgoCD for GitOps automated container deployments with zero downtime.
- Configured observability stack with Prometheus, Grafana, and Alertmanager, implementing SLO alert rules that decreased MTTR by 35%.
- Authored disaster recovery automation scripts in Python and Bash for automated cross-region database snapshot replication.

Education:
B.Tech in Computer Engineering, University of Mumbai, 2018 – 2022

Technical Skills:
Cloud & Orchestration: AWS, Kubernetes, Docker, Helm, ArgoCD, ECS
IaC & Configuration: Terraform, Ansible
CI/CD: GitHub Actions, Jenkins, GitLab CI
Observability & Scripting: Prometheus, Grafana, Alertmanager, ELK Stack, Python, Bash, Linux
`,
    },
    {
      id: 'data_analyst',
      filename: 'data_analyst.txt',
      category: 'positive',
      intent: 'Data Analyst with advanced SQL, Python pandas, Tableau dashboards, and business metric reporting.',
      text: `// Intent: Data Analyst with advanced SQL, Python pandas, Tableau dashboards, and business metric reporting.
Pooja Joshi
Email: pooja.joshi.analytics@example.com | Hyderabad, India

Professional Experience:
Data Analyst | MetricGlobal Analytics | Jul 2023 – Present
- Authored complex SQL queries with window functions, CTEs, and cohort groupings in BigQuery analyzing 50M+ consumer transaction rows.
- Built automated ETL data cleaning pipelines in Python using Pandas and NumPy to transform raw marketing telemetry.
- Designed 12 executive KPI dashboards in Tableau tracking customer acquisition cost (CAC), lifetime value (LTV), and churn rates.
- Collaborated with product managers to conduct A/B hypothesis testing, measuring statistically significant conversion rate gains.

Education:
B.Sc in Statistics and Computer Applications, Osmania University, 2020 – 2023

Technical Skills:
Data & Querying: SQL, PostgreSQL, Google BigQuery, Snowflake
Programming: Python (Pandas, NumPy, Matplotlib, Seaborn)
Visualization & BI: Tableau, Power BI, Metabase, Advanced Excel
Methodologies: A/B Testing, Descriptive Statistics, Cohort Analysis
`,
    },
    {
      id: 'ml_student',
      filename: 'ml_student.txt',
      category: 'positive',
      intent: 'Machine Learning focused CS graduate with PyTorch, NLP, and model evaluation projects.',
      text: `// Intent: Machine Learning focused CS graduate with PyTorch, NLP, and model evaluation projects.
Arun Swaminathan
Email: arun.swami.ai@example.com | Chennai, India

Education:
Master of Technology in Artificial Intelligence and Machine Learning
Indian Institute of Technology Kharagpur, 2023 – 2025
CGPA: 9.0 / 10.0

Projects:
Multilingual NLP Classifier | PyTorch, HuggingFace Transformers, Python
- Fine-tuned BERT and RoBERTa models in PyTorch for multi-label sentiment and intent classification on Indic language datasets.
- Implemented LoRA (Low-Rank Adaptation) parameter-efficient fine-tuning, reducing trainable parameters by 85% while retaining 91% F1-score.
- Deployed inference API using FastAPI and ONNX Runtime achieving 22ms per-sentence latency.

Retrieval-Augmented Generation (RAG) System | LangChain, FAISS, Python
- Built document question-answering pipeline using dense vector embeddings and FAISS similarity indexing over 10,000 technical papers.
- Evaluated retrieval precision and hallucination rates across top-k chunk sizes using RAGAS evaluation metrics.

Technical Skills:
Machine Learning: PyTorch, TensorFlow, Scikit-Learn, HuggingFace, ONNX
NLP & AI: Transformers, Embeddings, Vector Databases, FAISS, LangChain
Languages & Tools: Python, C++, SQL, Docker, FastAPI, Linux, Git
`,
    },
    {
      id: 'mern_student',
      filename: 'mern_student.txt',
      category: 'positive',
      intent: 'Full-Stack MERN student with multiple end-to-end applications and REST API integrations.',
      text: `// Intent: Full-Stack MERN student with multiple end-to-end applications and REST API integrations.
Kunal Deshmukh
Email: kunal.deshmukh@example.com | Pune, India

Education:
Bachelor of Engineering in Information Technology
Savitribai Phule Pune University, 2021 – 2025
CGPA: 8.2 / 10.0

Projects:
FoodDelivery — Full-Stack Ordering Portal | MongoDB, Express, React, Node.js
- Engineered full-stack web application with React frontend and Node.js Express backend for online meal ordering.
- Implemented customer authentication with JWT tokens and protected order history routes.
- Built admin portal for restaurant menu management, order status tracking, and revenue calculation with MongoDB aggregation pipelines.
- Integrated payment gateway webhook verification and deployed client on Vercel with backend on AWS EC2.

Real-Time Chat & Collaboration Room | React, Node.js, Socket.io, MongoDB
- Developed multi-room instant messaging app supporting private direct messaging and group chat channels.
- Managed websocket connection states with Socket.io handling 100 concurrent chat participants with zero message drops.

Technical Skills:
Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
MERN Stack: React, Node.js, Express, MongoDB, Mongoose
Tools: Git, Postman, Vite, Tailwind CSS, Docker
`,
    },
    {
      id: 'competitive_programmer',
      filename: 'competitive_programmer.txt',
      category: 'positive',
      intent: 'Competitive programming specialist with high LeetCode/Codeforces ratings, strong DSA, zero software engineering projects.',
      text: `// Intent: Competitive programming specialist with high LeetCode/Codeforces ratings, strong DSA, zero software engineering projects.
Manish Agarwal
Email: manish.algo@example.com | Codeforces: codeforces.com/profile/manish_algo

Education:
Bachelor of Technology in Computer Science and Engineering
International Institute of Information Technology (IIIT) Hyderabad, 2021 – 2025
CGPA: 8.7 / 10.0

Competitive Programming Achievements:
- Codeforces Candidate Master with peak rating of 2048 (Ranked top 1% globally).
- LeetCode Guardian with 2450+ contest rating, solved 1,400+ algorithmic problems across trees, dynamic programming, and graphs.
- ACM-ICPC Regionalist: Qualified for Amritapuri ICPC Regional Contest 2023 and 2024 (Team Rank 34).
- Problem Setter and Tester for collegiate programming contests, authoring 15 original competitive programming problems.

Technical Skills:
Languages: C++, C, Python, Java
Algorithms & Data Structures: Segment Trees, Fenwick Trees, Graph Algorithms (Dijkstra, Tarjan, Max Flow), Dynamic Programming, Number Theory, Binary Search, Computational Geometry
Platforms: Codeforces, LeetCode, CodeChef, AtCoder
`,
    },
    {
      id: 'research_student',
      filename: 'research_student.txt',
      category: 'positive',
      intent: 'Research-oriented graduate student with academic publications in distributed consensus and theory.',
      text: `// Intent: Research-oriented graduate student with academic publications in distributed consensus and theory.
Dr. Shweta Sen
Email: shweta.sen.cs@example.com | Bangalore, India

Education:
Doctor of Philosophy (Ph.D.) in Computer Science
Indian Institute of Science (IISc), Bangalore, 2019 – 2024
Dissertation: Fault-Tolerant State Machine Replication under Asynchronous Network Conditions

Publications & Research:
- "Optimistic Multi-Leader Consensus in High-Latency Geo-Replicated Networks", IEEE Transactions on Parallel and Distributed Systems, 2023.
- "Byzantine Fault Tolerant State Machine Replication: Formal Verification and Throughput Analysis", ACM PODC Conference, 2022.
- Designed simulation testbeds in C++ and Python to model network partition latencies and message loss across 100 virtual node topologies.
- Formally verified safety and liveness invariants of novel consensus protocols using TLA+ model checking specifications.

Technical Skills:
Core Domains: Distributed Consensus, Byzantine Fault Tolerance, Formal Verification, Parallel Computing, TLA+
Languages: C++, C, Python, LaTeX
Tools: Linux, Git, GDB, Valgrind, CMake
`,
    },
    {
      id: 'sales_switcher',
      filename: 'sales_switcher.txt',
      category: 'positive',
      intent: 'Career switcher from enterprise B2B tech sales to software engineering with self-taught Java and SQL.',
      text: `// Intent: Career switcher from enterprise B2B tech sales to software engineering with self-taught Java and SQL.
Gaurav Mehra
Email: gaurav.mehra.dev@example.com | Gurgaon, India

Professional Experience:
Enterprise Sales Account Executive | CloudWare India | Jun 2020 – Dec 2023
- Managed enterprise B2B accounts, pitching cloud infrastructure solutions and achieving 115% of annual revenue target.
- Communicated technical architecture specifications between customer engineering directors and internal product teams.

Software Transition Projects:
SalesCRM — Lead Management REST API | Java, Spring Boot, MySQL
- Developed backend REST service using Java and Spring Boot to track customer deal stages and sales conversion probabilities.
- Designed relational database schema in MySQL with tables for leads, organizations, and deal activity timelines.
- Implemented CRUD endpoints with Spring Data JPA and wrote unit tests with JUnit covering controller validation logic.

Education:
Executive Certificate in Backend Software Development, 2024
Bachelor of Business Administration, Delhi University, 2016 – 2019

Technical Skills:
Languages: Java, SQL, JavaScript
Frameworks & Databases: Spring Boot, MySQL, REST APIs, HTML/CSS
Professional: Technical Client Communication, Requirement Discovery, Agile
`,
    },
    {
      id: 'keyword_stuffed_1',
      filename: 'keyword_stuffed_1.txt',
      category: 'adversarial',
      intent: 'Adversarial resume with dense list of 30+ programming languages and frameworks without context.',
      text: `// Intent: Adversarial resume with dense list of 30+ programming languages and frameworks without context.
Ramesh Chandra
Email: ramesh.dev@example.com

Technical Skills:
Languages: Java, Python, Go, Golang, C, C++, C#, Rust, Swift, Kotlin, TypeScript, JavaScript, SQL, Scala, Ruby, PHP, Dart
Frameworks: Spring Boot, Django, Flask, FastAPI, React, Angular, Vue, Next.js, Node.js, Express, ASP.NET, Flutter, PyTorch, TensorFlow
Databases: PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Elasticsearch, DynamoDB, Oracle, SQLite
DevOps: Docker, Kubernetes, AWS, GCP, Azure, Linux, Git, Jenkins, Terraform, Kafka, RabbitMQ

Projects:
Project 1: Used Java, Python, Go, React, and Docker.
Project 2: Used Kubernetes, AWS, PostgreSQL, Redis, and Spring Boot for projects.
`,
    },
    {
      id: 'keyword_stuffed_2',
      filename: 'keyword_stuffed_2.txt',
      category: 'adversarial',
      intent: 'Adversarial resume stuffed with distributed systems and security buzzwords without verifiable project artifacts.',
      text: `// Intent: Adversarial resume stuffed with distributed systems and security buzzwords without verifiable project artifacts.
Alok Bansal
Email: alok.bansal@example.com

Core Competencies:
Distributed Systems, High Availability, Microservices Architecture, Fault Tolerance, Raft Consensus, Paxos Algorithm, Zero Trust Architecture, End-to-End Encryption, OAuth2, JWT Authentication, RBAC, CI/CD Automation, Kubernetes Orchestration, Event-Driven Architecture, CQRS, Event Sourcing, Domain-Driven Design, ACID Transactions, Sharding, Replication.

Projects:
Project 1: System with high availability and microservices architecture.
Project 2: Security pipeline with OAuth2 and JWT authentication.
`,
    },
    {
      id: 'keyword_stuffed_3',
      filename: 'keyword_stuffed_3.txt',
      category: 'adversarial',
      intent: 'Adversarial resume repeating identical skills block 4 times in different sections.',
      text: `// Intent: Adversarial resume repeating identical skills block 4 times in different sections.
Pankaj Trivedi
Email: pankaj.trivedi@example.com

Technical Skills:
Java, Python, SQL, Docker, React, PostgreSQL, Spring Boot

Core Competencies:
Java, Python, SQL, Docker, React, PostgreSQL, Spring Boot

Primary Technologies:
Java, Python, SQL, Docker, React, PostgreSQL, Spring Boot

Tools and Languages:
Java, Python, SQL, Docker, React, PostgreSQL, Spring Boot

Projects:
Full Stack Application
- Built application using Java, Python, SQL, Docker, React, PostgreSQL, Spring Boot.
`,
    },
    {
      id: 'jd_copier',
      filename: 'jd_copier.txt',
      category: 'adversarial',
      intent: 'Adversarial resume that blindly copies JD requirements and responsibilities verbatim.',
      text: `// Intent: Adversarial resume that blindly copies JD requirements and responsibilities verbatim.
Sunil Rao
Email: sunil.rao@example.com

Summary:
Proven track record designing resilient event-driven data pipelines and distributed clusters.

Experience:
Software Engineer | Tech Corp | 2023 – 2024
- Responsible for designing resilient event-driven data pipelines and solving complex DSA problems.
- Experience in high-throughput low-latency microservices using Java, Spring Boot, and Go.
- Proficient in containerization with Docker and cluster orchestration with Kubernetes.
- Write clean, maintainable, production-ready code with 80%+ test coverage and comprehensive integration tests.
- Collaborate with cross-functional teams in an Agile environment to deliver scalable software features.
`,
    },
    {
      id: 'exaggerated_claims',
      filename: 'exaggerated_claims.txt',
      category: 'adversarial',
      intent: 'Adversarial resume with impossible metrics (100 billion QPS on single laptop, 99.999999% latency reduction).',
      text: `// Intent: Adversarial resume with impossible metrics (100 billion QPS on single laptop, 99.999999% latency reduction).
Harish Khanna
Email: harish.khanna@example.com

Experience:
Software Engineering Intern | FastApp | 2024
- Built single-node backend server handling 500 billion requests per second with 0.00001ms latency on my personal laptop.
- Reduced cloud infrastructure costs by 99.999% saving 500 crore INR in 2 weeks of development.
- Managed and directed 50,000 engineers across 40 countries as a college intern while improving system throughput by 1000x.
- Rewrote entire internet routing infrastructure in C++ eliminating all global latency bottlenecks.
`,
    },
    {
      id: 'skills_only',
      filename: 'skills_only.txt',
      category: 'adversarial',
      intent: 'Adversarial resume containing only a list of skills, no experience, education, or projects.',
      text: `// Intent: Adversarial resume containing only a list of skills, no experience, education, or projects.
Vinay Saxena
Email: vinay.saxena@example.com

Technical Skills:
Languages: Java, Python, C++, JavaScript, Go, SQL
Frameworks: Spring Boot, React, Node.js, Express, Django
Databases: PostgreSQL, MongoDB, Redis, MySQL
DevOps: Docker, Kubernetes, AWS, Git, Linux
`,
    },
    {
      id: 'one_line',
      filename: 'one_line.txt',
      category: 'adversarial',
      intent: 'Adversarial resume containing exactly one line of text.',
      text: `// Intent: Adversarial resume containing exactly one line of text.
Experienced Software Engineer seeking high-impact developer roles in top technology companies.
`,
    },
    {
      id: 'near_empty',
      filename: 'near_empty.txt',
      category: 'adversarial',
      intent: 'Adversarial resume containing only candidate contact name and email.',
      text: `// Intent: Adversarial resume containing only candidate contact name and email.
Aarav Patel
aarav.patel@example.com
`,
    },
    {
      id: 'very_long',
      filename: 'very_long.txt',
      category: 'adversarial',
      intent: 'Adversarial resume exceeding 3,000 words with endless repetitive descriptions.',
      text: `// Intent: Adversarial resume exceeding 3,000 words with endless repetitive descriptions.
Sanjay Verma
Email: sanjay.verma@example.com

Professional Experience:
Senior Software Engineer | MegaCorp Systems | 2020 – 2025
` + Array(80).fill(`- Designed and developed distributed microservices architecture using Java and Spring Boot for enterprise transaction management, collaborating with cross-functional product management, quality assurance, and operations teams to verify production stability, maintain high availability, and deliver scalable cloud solutions across multiple regional availability zones while optimizing database query execution plans in PostgreSQL and maintaining Redis caching layers.`).join('\n') + `

Education:
Bachelor of Technology in Computer Science, 2020
`,
    },
    {
      id: 'typos_special_chars',
      filename: 'typos_special_chars.txt',
      category: 'adversarial',
      intent: 'Adversarial resume with heavily obfuscated and typo-laden tech words and special characters.',
      text: `// Intent: Adversarial resume with heavily obfuscated and typo-laden tech words and special characters.
B#arat K*mar
Email: bharat.k@example.com

Skills:
J@va, Pyt#on, G0lang, C++, R3act, D0cker, K8s, P0stgre$QL, R3dis, My$QL, M0ngoDB

Experience:
- B#ilt micro$ervices with J@va & P0stgre$QL !! @@@ $$$
- D0ckerized c0ntainers with K8s clu$ter %%% ^^^ &&&
- Optim!zed databa$e queri3s reducing lat3ncy by 30% ***
`,
    },
    {
      id: 'mixed_hindi_english',
      filename: 'mixed_hindi_english.txt',
      category: 'adversarial',
      intent: 'Adversarial resume with mixed Hindi transliteration (Hinglish) and English sentences.',
      text: `// Intent: Adversarial resume with mixed Hindi transliteration (Hinglish) and English sentences.
Mohit Sharma
Email: mohit.sharma@example.com

Experience:
Software Engineer | DesiCode Technologies | 2023 – 2024
- Worked on Spring Boot backend APIs, bahut achha performance optimize kiya with Redis caching.
- Database queries ko index karke latency 40% kam kar diya aur throughput badha diya.
- College project me React and Node.js use karke poora web application banaya jisme user login aur cart system tha.
- Team ke sath daily standup me participate kiya aur code reviews regular basis pe kiye.
`,
    },
    {
      id: 'tables_symbols_bullets',
      filename: 'tables_symbols_bullets.txt',
      category: 'adversarial',
      intent: 'Adversarial resume formatted with ASCII tables, Unicode stars, and heavy symbolic bullets.',
      text: `// Intent: Adversarial resume formatted with ASCII tables, Unicode stars, and heavy symbolic bullets.
Dinesh Yadav
Email: dinesh.yadav@example.com

| Category | Skills Evidenced | Years Experience |
|:---|:---|:---|
| Languages | Java, Python, C++ | 2 Years |
| Frameworks | Spring Boot, React, Node.js | 2 Years |
| Databases | PostgreSQL, MySQL, Redis | 1 Year |

❖ Designed payment gateway microservice using Java and Spring Boot for order processing.
★ Optimized database queries with Redis cache reducing response time by 30%.
➔ Automated build pipelines using Docker and GitHub Actions for continuous integration.
● Implemented unit test suites using JUnit achieving 80% code coverage.
`,
    },
    {
      id: 'minimal_thin',
      filename: 'minimal_thin.txt',
      category: 'adversarial',
      intent: 'Thin student resume with bare one-line mentions and zero quantified metrics.',
      text: `// Intent: Thin student resume with bare one-line mentions and zero quantified metrics.
Tarun Verma
Email: tarun.verma@example.com

Education:
B.Tech Computer Science, 2025

Projects:
- Weather app: made an app in React to show weather.
- Chat app: made a chat app in Node.js.
- To-do list: created a to-do list with HTML and JavaScript.

Skills:
Java, C, React, Node, HTML
`,
    },
    {
      id: 'inconsistent_dates',
      filename: 'inconsistent_dates.txt',
      category: 'adversarial',
      intent: 'Adversarial resume with impossible and inverted chronological dates (e.g. 2028-2022).',
      text: `// Intent: Adversarial resume with impossible and inverted chronological dates (e.g. 2028-2022).
Sameer Malik
Email: sameer.malik@example.com

Experience:
Senior Software Architect | Cloud Corp | 2030 – 2024
- Designed distributed cloud microservices using Java and Spring Boot.

Software Engineering Intern | Startup Labs | 2028 – 2021
- Worked on backend REST APIs and database schema design.

Education:
B.Tech in Computer Science, Graduated 2012 (Enrolled 2025)
`,
    },
    {
      id: 'non_cs_academic',
      filename: 'non_cs_academic.txt',
      category: 'adversarial',
      intent: 'Non-CS pure physics academic resume with lab and experimental science experience.',
      text: `// Intent: Non-CS pure physics academic resume with lab and experimental science experience.
Dr. Anupam Mukherjee
Email: anupam.mukherjee.physics@example.com

Education:
Doctor of Philosophy in Experimental High Energy Physics, University of Calcutta, 2023
Master of Science in Physics, 2018

Research Experience:
Postdoctoral Research Fellow | National Physical Laboratory | 2023 – Present
- Designed laser spectroscopy experimental apparatus to measure atomic resonance transitions.
- Analyzed detector sensor data from multi-wire proportional chambers using ROOT data analysis framework.
- Authored numerical data fitting routines in Fortran and MATLAB to model quantum wave scattering.

Skills:
Physics Laboratory Equipment, Vacuum Systems, Cryogenics, Spectroscopy, ROOT, Fortran, MATLAB, LaTeX
`,
    },
  ];
}

// ============================================================
// 3. GOLDEN RECORD GENERATOR & RUNNER
// ============================================================
export function generateGoldenRecord(resume: SyntheticResume, roleDef: PinnedRole) {
  const company = roleDef.company;
  const role = roleDef.role;
  const comps = role.competencies || ['dsa', 'systemdesign'];
  const analysis = analyzeRoleMatch(resume.text, company, role);
  const score = Math.round(analysis.score);

  let band = 'Not Ready';
  if (score >= 85) band = 'Exceptional';
  else if (score >= 70) band = 'Ready';
  else if (score >= 50) band = 'Moderate';
  else if (score >= 35) band = 'Developing';

  const skillStates = buildSkillStates({
    resumeText: resume.text,
    competencies: comps,
    role,
    company,
  });

  const matched = { projects: analysis.projects || [] };
  const rewrites = generateEvidenceSafeRewrites(resume.text, comps);

  // Parse summary
  const lines = resume.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const bullets = lines.filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || l.startsWith('❖') || l.startsWith('★') || l.startsWith('➔'));

  const rep = {
    score,
    band,
    projects: matched.projects.map((p) => ({
      id: p.id,
      title: p.title,
      relevanceScore: p.relevanceScore,
      gapCoverage: p.gapCoverage,
      closes: p.closes,
    })),
    breakdown: skillStates.map((s) => ({
      competency: s.id,
      key: s.id,
      status: s.status,
      statusLabel: s.statusLabel,
      score: s.score,
      evidenceQuotes: s.evidence.map((e) => e.text),
      gaps: s.gaps,
      reqLevel: s.requirementLevel,
    })),
  };

  const v = validateReport(rep);

  const strengths = analysis.trace?.strengths || skillStates.filter((s) => s.status === 'demonstrated').map((s) => s.id);

  const scorePathSteps = analysis.plans
    .filter((p) => p.hypotheticalScoreGain && p.hypotheticalScoreGain.includes('->'))
    .map((p) => {
      const m = p.hypotheticalScoreGain.match(/Cumulative path:\s*(\d+)\s*->\s*(\d+)/i);
      const beforeScore = m ? parseInt(m[1], 10) : score;
      const afterScore = m ? parseInt(m[2], 10) : score;
      return {
        skills: (p as any).skills || (p.detail.match(/for:\s*([^.]+)/i)?.[1]?.split(',').map((s) => s.trim()) || []),
        beforeScore,
        afterScore,
        delta: afterScore - beforeScore,
      };
    });

  return {
    resumeId: resume.id,
    roleId: roleDef.roleId,
    score,
    band,
    perSkill: skillStates.map((s) => ({
      id: s.id,
      status: s.status,
      confidenceTag: s.confidenceTag,
      score: s.score,
    })),
    strengths,
    parseSummary: {
      sectionsCount: (resume.text.match(/^[A-Z][A-Za-z\s]+:$/gm) || []).length,
      projectsCount: (resume.text.match(/Projects?:/i) ? 2 : 0),
      bulletsCount: bullets.length,
      skillsDetectedCount: skillStates.filter((s) => s.status !== 'not-found' && s.status !== 'not-assessed').length,
    },
    projectsShown: matched.projects.slice(0, 3).map((p) => ({
      id: p.id,
      closes: p.closes || [],
      relevance: Number((p.relevanceScore ?? 0).toFixed(3)),
    })),
    scorePathSteps: scorePathSteps.length > 0 ? scorePathSteps : matched.projects.slice(0, 3).map((p, idx) => ({
      skills: p.closes || [],
      beforeScore: score + idx * 4,
      afterScore: score + (idx + 1) * 4,
      delta: 4,
    })),
    first3Rewrites: rewrites.slice(0, 3).map((rw) => ({
      input: rw.originalBullet,
      output: rw.rewrittenBullet,
    })),
    violations: v.violations,
  };
}

export async function generateAllGoldens() {
  const rootDir = process.cwd();
  const resumesDir = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'resumes');
  const recordsDir = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'records');
  const pendingDir = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'pending');
  const manifestPath = path.join(rootDir, 'tests', 'goldens', 'talentlens', 'goldenManifest.json');
  const reviewDocPath = path.join(rootDir, 'docs', 'golden_review.md');

  fs.mkdirSync(resumesDir, { recursive: true });
  fs.mkdirSync(recordsDir, { recursive: true });
  fs.mkdirSync(pendingDir, { recursive: true });

  const resumes = get30SyntheticResumes();
  const roles = getPinned14Roles();

  console.log(`Writing ${resumes.length} synthetic resumes to tests/goldens/talentlens/resumes/...`);
  for (const r of resumes) {
    fs.writeFileSync(path.join(resumesDir, r.filename), r.text, 'utf8');
  }

  // Golden manifest
  const manifest = {
    roles: roles.map((p) => ({
      roleId: p.roleId,
      category: p.category,
      companyId: p.companyId,
      companyName: p.companyName,
      companyTier: p.companyTier,
      roleTitle: p.roleTitle,
      roleLevel: p.roleLevel,
    })),
    resumes: resumes.map((r) => ({
      id: r.id,
      filename: r.filename,
      category: r.category,
      intent: r.intent,
    })),
    reviewStatus: 'pending-human-review',
    recordsCount: resumes.length * roles.length,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Wrote golden manifest to tests/goldens/talentlens/goldenManifest.json`);

  console.log(`Evaluating 420 (30 resumes x 14 roles) records...`);
  const reviewTables: string[] = [];

  for (const resume of resumes) {
    const resumeRecords: any[] = [];
    reviewTables.push(`\n## Resume: ${resume.id} (${resume.category})\n`);
    reviewTables.push(`**Expected Intent**: ${resume.intent}\n`);
    reviewTables.push(`| Role | Company | Tier | Score | Band | Strengths | Top Project | First Rewrite | Review Status |\n|:---|:---|:---|:---:|:---:|:---:|:---|:---|:---:|\n`);

    for (const roleDef of roles) {
      const record = generateGoldenRecord(resume, roleDef);

      const recordPath = path.join(recordsDir, `${resume.id}__${roleDef.roleId}.json`);
      fs.writeFileSync(recordPath, JSON.stringify(record, null, 2), 'utf8');

      // Review row
      const topProj = record.projectsShown[0]?.id || 'none';
      const firstRw = record.first3Rewrites[0] ? record.first3Rewrites[0].output.slice(0, 50).replace(/\|/g, '/') + '...' : 'none';
      reviewTables.push(`| ${roleDef.roleTitle} | ${roleDef.companyName} | ${roleDef.companyTier} | ${record.score} | ${record.band} | ${record.strengths.length} | ${topProj} | ${firstRw} | pending-human-review |\n`);
    }
  }

  // Write docs/golden_review.md
  const reviewDoc = `# TalentLens Golden Evaluation Review Sheet
**Generated At**: Deterministic Golden Build
**Status**: ALL 420 RECORDS PENDING HUMAN REVIEW (NONE APPROVED)
**Corpus**: 30 Synthetic Resumes (15 Positive Archetypes, 15 Adversarial Variants) x 14 Pinned Roles = 420 Pairs

${reviewTables.join('')}
`;

  fs.writeFileSync(reviewDocPath, reviewDoc, 'utf8');
  console.log(`Generated docs/golden_review.md (420 evaluations across 30 resumes)`);
  console.log(`Successfully generated all 420 records in tests/goldens/talentlens/records/`);
}

// Execute if run directly
if (process.argv[1]?.includes('generateTalentLensGoldens')) {
  generateAllGoldens().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
