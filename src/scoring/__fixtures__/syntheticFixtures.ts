// ============================================================
// HireFlow Scoring Suite — 24 Canonical Synthetic Fixtures
// Strictly labelled "synthetic". Zero real candidate PII.
// ============================================================

export interface SyntheticFixture {
  id: string;
  label: string;
  experienceLevel: 'Student' | 'Intern' | '0-2 yrs' | '3+ yrs';
  roleFamily: 'Backend' | 'Frontend' | 'Data/ML' | 'Mobile' | 'DevOps' | 'General';
  category: 'honest' | 'stuffing' | 'skills_dump' | 'buzzwords' | 'duplicates' | 'implausible' | 'no_jd' | 'ugly_format' | 'mismatch';
  description: string;
  resumeText: string;
  jdText: string;
  targetTier?: 'top_product' | 'unicorn' | 'gcc' | 'it_services' | 'startup';
}

export const SYNTHETIC_FIXTURES: SyntheticFixture[] = [
  // 1. Student Backend Honest
  {
    id: 'syn-01-student-backend-honest',
    label: 'Student Backend — Honest Strong Evidence',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'honest',
    description: 'Final year B.Tech student with authentic project evidence, Redis queue, Docker, PostgreSQL, and measurable metrics.',
    resumeText: `John Doe (Synthetic Candidate)
john.synthetic@example.com | +91 98765 43210 | Bengaluru, India
github.com/synthetic-john | linkedin.com/in/synthetic-john

EDUCATION
National Institute of Technology, B.Tech in Computer Science and Engineering
CGPA: 8.7/10 | Expected Graduation: May 2026

TECHNICAL SKILLS
Languages: Java, Go, TypeScript, SQL, Python
Frameworks & Libraries: Spring Boot, Gin, React, Node.js
Databases & Cloud: PostgreSQL, Redis, MongoDB, AWS (EC2, S3), Docker, Git

PROJECTS
Distributed Task Scheduling Engine | Go, Redis, PostgreSQL, Docker
GitHub: github.com/synthetic-john/task-engine | Live: task-engine.demo.app
- Architected an asynchronous task processing engine in Go capable of handling 2,500 tasks/second with p95 execution latency under 45ms.
- Implemented delayed task queues and retry mechanisms using Redis sorted sets and dead-letter queues.
- Containerized microservices using Docker Compose and automated unit and integration tests achieving 84% test coverage.

E-Commerce API & Inventory Service | Java, Spring Boot, PostgreSQL
GitHub: github.com/synthetic-john/ecommerce-api
- Designed RESTful microservices for product catalog and checkout with Spring Boot 3 and Hibernate ORM.
- Optimized slow SQL queries with composite B-tree indexing on order history, reducing API response times by 38% (from 420ms to 260ms).
- Built JWT authentication and role-based access control guarding 14 endpoints.

CAMPUS & COMMUNITY LEADERSHIP
- Core Member, NIT Open Source Society: Organized campus hackathons for 400+ participants.
- Solved 450+ algorithmic problems on LeetCode (Knight rank, peak rating 1920).`,
    jdText: `Backend Software Engineer (Fresher / Campus Intake)
Target Company: Fast-Growing Tech Unicorn

Requirements:
- Bachelor's degree in Computer Science or related engineering stream.
- Strong proficiency in Java, Go, or Python.
- Hands-on knowledge of RESTful API design, relational databases (PostgreSQL/MySQL), and caching systems (Redis).
- Familiarity with Docker, Git version control, and Linux environments.
- Solid understanding of data structures, algorithms, and concurrency fundamentals.
- Good communication and willingness to learn in an agile squad.`,
    targetTier: 'top_product',
  },

  // 2. Intern Frontend Honest
  {
    id: 'syn-02-intern-frontend-honest',
    label: 'Intern Frontend — Component Architecture & Web Vitals',
    experienceLevel: 'Intern',
    roleFamily: 'Frontend',
    category: 'honest',
    description: 'Frontend intern with 6 months internship experience, React, Next.js, TypeScript, and Lighthouse metrics.',
    resumeText: `Priya Sharma (Synthetic Candidate)
priya.synthetic@example.com | +91 91234 56789 | Pune, India
github.com/synthetic-priya | priyasharma.demo.dev

EXPERIENCE
Frontend Engineering Intern | Acme SaaS Solutions
July 2025 – December 2025 | Pune, India
- Built reusable UI component library with React 18, TypeScript, and Tailwind CSS adopted across 4 internal dashboards.
- Refactored legacy customer portal to Next.js App Router, improving Lighthouse performance score from 58 to 92.
- Reduced Initial Largest Contentful Paint (LCP) from 3.8s to 1.4s by implementing image optimization and dynamic code splitting.
- Implemented automated component testing with Vitest and React Testing Library across 45 key user interactions.

EDUCATION
Pune Institute of Computer Technology, B.E. in Information Technology
CGPA: 8.4/10 | Graduated 2025

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, HTML5, CSS3, SQL
Frameworks: React, Next.js, Vite, Tailwind CSS, Zustand, TanStack Query
Tools: Git, Figma, Webpack, Jest, Vitest, npm, Vercel

PROJECTS
Developer Portfolio & Blog Platform | Next.js, TypeScript, MDX, Tailwind CSS
GitHub: github.com/synthetic-priya/dev-blog
- Created high-performance personal publishing engine with static generation and automated dark mode theming.
- Ensured 100% WCAG AA accessibility compliance through semantic HTML, ARIA attributes, and keyboard navigation.`,
    jdText: `Frontend Engineer — React / TypeScript
Company: High-Growth SaaS

We are looking for an early-career Frontend Engineer who cares deeply about UI craftsmanship, responsive design, and web performance.

Key Qualifications:
- 0 to 1 year experience building web applications with modern React and TypeScript.
- Strong understanding of HTML5 semantic structure, modern CSS/Tailwind, and responsive web design.
- Experience with state management (Zustand, Redux, or Context) and client-server caching (TanStack Query).
- Understanding of Core Web Vitals (LCP, FID, CLS) and component testing practices.
- Excellent eye for detail and design fidelity.`,
    targetTier: 'unicorn',
  },

  // 3. 0-2 yr Data/ML Honest
  {
    id: 'syn-03-0to2yr-dataml-honest',
    label: '0-2 yr Data/ML — Pipelines & Metric Rigor',
    experienceLevel: '0-2 yrs',
    roleFamily: 'Data/ML',
    category: 'honest',
    description: 'Junior ML Engineer with 1.5 years experience, PyTorch, Scikit-Learn, MLflow, and reproducible data pipelines.',
    resumeText: `Rahul Verma (Synthetic Candidate)
rahul.synthetic@example.com | +91 99887 76655 | Hyderabad, India
github.com/synthetic-rahul | rahulml.synthetic.page

EXPERIENCE
Associate Machine Learning Engineer | DataCorp India
January 2024 – Present | Hyderabad, India
- Developed automated customer churn prediction pipelines using Python, Scikit-Learn, and XGBoost on 1.2M historical customer records.
- Improved model F1-score from 0.72 to 0.81 by engineering behavioral recency features and handling class imbalance via SMOTE.
- Deployed real-time inference microservices using FastAPI and Docker on AWS ECS, serving 400 requests/sec with p95 latency under 60ms.
- Set up model experiment tracking and artifact registry with MLflow, reducing deployment turnover from 5 days to 4 hours.

EDUCATION
IIT Hyderabad, B.Tech in Electrical Engineering (Minor in AI/ML)
CGPA: 8.9/10 | 2019 – 2023

TECHNICAL SKILLS
Languages: Python, SQL, C++, R
ML & Data: PyTorch, Scikit-Learn, XGBoost, Pandas, NumPy, OpenCV, MLflow
Data Engineering: Apache Spark, PostgreSQL, Snowflake, Airflow
DevOps & Cloud: Docker, FastAPI, AWS (S3, ECS), Git, Linux

PROJECTS
Visual Defect Detection System | PyTorch, TorchVision, FastAPI
GitHub: github.com/synthetic-rahul/defect-detector
- Trained transfer learning models (ResNet-50) for industrial PCB defect segmentation, achieving 94.2% mean Average Precision (mAP).
- Quantized models using ONNX Runtime for edge deployment, reducing model size by 65% with less than 1% accuracy degradation.`,
    jdText: `Junior Machine Learning Engineer
Organization: Enterprise AI Solutions

Responsibilities:
- Build, evaluate, and deploy machine learning models in production environments.
- Develop data pipelines and feature extraction workflows using Python, Pandas, and SQL.
- Collaborate with software engineers to integrate model inference APIs using FastAPI or Flask.
- Monitor model drift and track experiments using tools like MLflow or Weights & Biases.
- Minimum 1 year experience in applied ML, Python, and cloud deployments.`,
    targetTier: 'gcc',
  },

  // 4. 3+ yr Backend Senior
  {
    id: 'syn-04-3plus-backend-senior',
    label: '3+ yr Backend — Distributed Systems Architecture',
    experienceLevel: '3+ yrs',
    roleFamily: 'Backend',
    category: 'honest',
    description: 'Senior SWE with 4 years experience, distributed transaction management, Kafka, Kubernetes, and high-throughput systems.',
    resumeText: `Arjun Nair (Synthetic Candidate)
arjun.synthetic@example.com | +91 98111 22233 | Bengaluru, India
github.com/synthetic-arjun | linkedin.com/in/synthetic-arjun

EXPERIENCE
Senior Software Engineer | FinTech Unicorn
July 2022 – Present | Bengaluru, India
- Spearheaded the redesign of the core payment settlement ledger handling ₹180Cr in daily transaction volume across 6 payment gateways.
- Partitioned monolithic database into distributed microservices backed by Kafka event streams and PostgreSQL shards, cutting p99 checkout latency by 45%.
- Implemented transactional outbox pattern and idempotent consumer logic, eliminating double-debit anomalies during transient network partitions.
- Mentored 5 junior engineers and led architectural review board sessions for payment compliance and SOC2 auditing.

Software Engineer | Consumer Internet Platform
July 2020 – June 2022 | Bengaluru, India
- Built notification dispatch engine in Java and Redis pub/sub delivering 12M push notifications and SMS alerts daily.
- Optimized database query plans and connection pooling configurations (HikariCP), saving $14,000 monthly in AWS RDS provisioned IOPS costs.

EDUCATION
BITS Pilani, B.E. (Hons) in Computer Science
CGPA: 9.1/10 | 2016 – 2020

TECHNICAL SKILLS
Languages: Java, Kotlin, Go, SQL, Python
Frameworks & Architecture: Spring Boot 3, Kafka, gRPC, Distributed Transactions, Microservices
Databases & Cache: PostgreSQL, Redis, Cassandra, Elasticsearch
Cloud & Infra: AWS, Kubernetes, Terraform, Docker, Datadog, Prometheus, Grafana`,
    jdText: `Senior Backend Engineer — Core Payments
Company: Big Tech India / FinTech

We are seeking a Senior Backend Engineer to lead high-scale payment systems.
Requirements:
- 3+ years of professional software engineering experience in backend distributed systems.
- Deep expertise in Java, Kotlin, or Go with robust understanding of concurrency and multithreading.
- Demonstrated experience designing fault-tolerant systems using Kafka, RabbitMQ, or event-driven patterns.
- Experience with relational and distributed databases (PostgreSQL, Cassandra, Redis).
- Proven track record of owning critical production services with 99.99% reliability expectations.`,
    targetTier: 'top_product',
  },

  // 5. Student Mobile Honest
  {
    id: 'syn-05-student-mobile-honest',
    label: 'Student Mobile — Kotlin & Offline Architecture',
    experienceLevel: 'Student',
    roleFamily: 'Mobile',
    category: 'honest',
    description: 'Final year student with Android Kotlin projects, Room database, Jetpack Compose, and offline synchronization.',
    resumeText: `Sneha Patel (Synthetic Candidate)
sneha.synthetic@example.com | +91 94455 66778 | Ahmedabad, India
github.com/synthetic-sneha | playstore.synthetic.demo

EDUCATION
Nirma University, B.Tech in Information Technology
CGPA: 8.6/10 | May 2026

TECHNICAL SKILLS
Mobile: Kotlin, Android SDK, Jetpack Compose, Coroutines, Flow, Room DB, Retrofit
Architecture: MVVM, Clean Architecture, Dependency Injection (Hilt), WorkManager
Languages & Tools: Java, Kotlin, SQLite, Git, Firebase, Android Studio, Gradle

PROJECTS
FinTrack: Offline-First Personal Finance Manager | Android, Kotlin, Jetpack Compose
GitHub: github.com/synthetic-sneha/fintrack-android | 5,000+ Play Store Downloads
- Built an offline-first expense manager using Jetpack Compose, Kotlin Coroutines, and Room SQLite database.
- Implemented background synchronization using WorkManager to sync encrypted transaction batches with Firebase Firestore when network connects.
- Reduced app cold start time by 32% (from 1.8s to 1.2s) through baseline profile generation and lazy loading of composables.
- Achieved a 99.8% crash-free session rate across 12 distinct device models.

Campus Transit & Bus Tracking App | Kotlin, Google Maps SDK, Retrofit
GitHub: github.com/synthetic-sneha/campus-transit
- Developed real-time bus tracking app for 3,000 university students using Google Maps SDK and WebSockets.
- Designed clean MVVM architecture with Hilt dependency injection, achieving 78% unit test coverage using JUnit and Mockk.`,
    jdText: `Junior Android Engineer (Fresher / Intern)
Company: Mobility Unicorn

Requirements:
- Strong knowledge of Kotlin and the Android SDK.
- Understanding of modern Android architecture components (MVVM, Room, ViewModel, Coroutines).
- Familiarity with Jetpack Compose and reactive UI patterns.
- Experience building personal or academic Android projects published on GitHub or Google Play.
- Passion for smooth animations, UI responsiveness, and offline-first mobile apps.`,
    targetTier: 'unicorn',
  },

  // 6. 0-2 yr DevOps Honest
  {
    id: 'syn-06-0to2yr-devops-honest',
    label: '0-2 yr DevOps — CI/CD & Infrastructure as Code',
    experienceLevel: '0-2 yrs',
    roleFamily: 'DevOps',
    category: 'honest',
    description: 'Junior Cloud Engineer with 1 year experience, Terraform, GitHub Actions, Docker, and Kubernetes.',
    resumeText: `Vikram Joshi (Synthetic Candidate)
vikram.synthetic@example.com | +91 97766 55443 | Chennai, India
github.com/synthetic-vikram | vikramcloud.synthetic.io

EXPERIENCE
Cloud Operations Engineer | TechServices Global
August 2024 – Present | Chennai, India
- Maintained and configured multi-environment AWS infrastructure (VPC, EKS, RDS, S3) using Terraform Infrastructure as Code (IaC).
- Automated CI/CD deployment pipelines using GitHub Actions, reducing average deployment cycle duration from 45 minutes to 9 minutes.
- Configured Prometheus and Grafana alerting dashboards for 28 microservices, detecting memory leaks before customer impact.
- Standardized container builds with multi-stage Dockerfiles, decreasing container image sizes by 55% (from 850MB to 380MB).

EDUCATION
Anna University, B.E. in Computer Science
CGPA: 8.2/10 | 2020 – 2024

TECHNICAL SKILLS
Cloud: AWS (EC2, EKS, VPC, IAM, S3, RDS), Cloudflare
IaC & Containers: Terraform, Docker, Kubernetes, Helm
CI/CD & Scripting: GitHub Actions, Jenkins, Bash, Python, Linux Administration
Observability: Prometheus, Grafana, ELK Stack, Datadog`,
    jdText: `Cloud Platform / DevOps Engineer
Company: Global IT Consulting

Looking for an enthusiastic Cloud / DevOps Engineer:
- Hands-on experience with AWS cloud services and networking fundamentals.
- Practical understanding of Docker, container orchestration with Kubernetes, and Terraform.
- Experience building and maintaining CI/CD pipelines (GitHub Actions, GitLab CI, or Jenkins).
- Solid Linux system administration, shell scripting, and monitoring skills.
- 0 to 2 years of relevant experience.`,
    targetTier: 'it_services',
  },

  // 7. Student General Honest
  {
    id: 'syn-07-student-general-honest',
    label: 'Student General — Competitive Programming & Core CS',
    experienceLevel: 'Student',
    roleFamily: 'General',
    category: 'honest',
    description: 'Final year student with strong core CS fundamentals, LeetCode rating, Operating Systems, and full-stack projects.',
    resumeText: `Ananya Roy (Synthetic Candidate)
ananya.synthetic@example.com | +91 93322 11004 | Kolkata, India
github.com/synthetic-ananya | leetcode.com/synthetic-ananya

EDUCATION
Jadavpur University, B.E. in Computer Science and Engineering
CGPA: 9.3/10 | Expected Graduation: 2026

TECHNICAL SKILLS
Languages: C++, Java, JavaScript, Python, SQL
Core CS: Data Structures & Algorithms, Operating Systems, Computer Networks, DBMS
Web Technologies: Node.js, Express, React, PostgreSQL, MongoDB, Git

PROJECTS
P2P File Transfer Protocol Simulation | C++, Socket Programming, Multi-threading
GitHub: github.com/synthetic-ananya/p2p-file-transfer
- Implemented peer-to-peer file sharing protocol over TCP sockets with chunking, SHA-256 verification, and parallel multi-chunk downloading.
- Managed concurrent worker threads using POSIX mutex locks and condition variables, achieving sustained 120MB/s throughput across simulated local nodes.

Collaborative Code Editor | React, Node.js, WebSockets, Redis
GitHub: github.com/synthetic-ananya/collab-code
- Created browser-based real-time document editor using operational transformations and WebSockets.
- Backed session coordination with Redis pub/sub, supporting up to 20 simultaneous editors per room with sub-50ms conflict resolution.

ACHIEVEMENTS
- Candidate Master on Codeforces (peak rating 1940); solved 600+ problems across platforms.
- Finalist, Smart India Hackathon 2024 (selected among top 30 teams nationally).`,
    jdText: `Graduate Engineer Trainee (GET) — Software
Target Organization: Global Investment Bank (GCC)

Requirements:
- Degree in Computer Science, IT, or Mathematics.
- Exceptional problem-solving and algorithmic programming skills in C++, Java, or Python.
- Strong grounding in Object-Oriented Programming, Operating Systems, Networks, and DBMS.
- Excellent academic track record and collaborative mindset.`,
    targetTier: 'gcc',
  },

  // 8. Student Backend No JD (Baseline Mode)
  {
    id: 'syn-08-student-backend-no-jd',
    label: 'Student Backend — No JD Present (Role Baseline)',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'no_jd',
    description: 'Student resume scanned without any job description to trigger role baseline evaluation mode.',
    resumeText: `Karan Malhotra (Synthetic Candidate)
karan.synthetic@example.com | +91 98989 89898 | Delhi, India
github.com/synthetic-karan

EDUCATION
Delhi Technological University (DTU), B.Tech in Software Engineering
CGPA: 8.5/10 | 2026

TECHNICAL SKILLS
Languages: Java, Python, SQL, C++
Frameworks: Spring Boot, Django, Flask, Express
Databases: PostgreSQL, MySQL, Redis
Tools: Docker, Git, Linux, Postman

PROJECTS
Inventory Management Microservice | Java, Spring Boot, PostgreSQL, Docker
GitHub: github.com/synthetic-karan/inventory-service
- Built RESTful service for stock tracking handling 500 requests/sec with Spring Data JPA.
- Implemented Redis caching for high-frequency SKU lookups, cutting query latency by 50%.
- Packaged service into Docker images with automated integration test scripts.

Real-Time Chat Service | Node.js, Socket.io, MongoDB
- Developed multi-room messaging platform with persistent message history and read receipts.`,
    jdText: ``,
    targetTier: 'top_product',
  },

  // 9. 0-2 yr Frontend No JD
  {
    id: 'syn-09-0to2yr-frontend-no-jd',
    label: '0-2 yr Frontend — No JD Present (Role Baseline)',
    experienceLevel: '0-2 yrs',
    roleFamily: 'Frontend',
    category: 'no_jd',
    description: 'Frontend engineer scanned without a target JD, evaluating against generic frontend baseline.',
    resumeText: `Tanvi Mehta (Synthetic Candidate)
tanvi.synthetic@example.com | +91 91223 34455 | Mumbai, India
github.com/synthetic-tanvi

EXPERIENCE
Junior Frontend Developer | Studio Interactive
September 2024 – Present | Mumbai, India
- Developed dynamic responsive user interfaces with React, TypeScript, and CSS Modules.
- Integrated RESTful APIs with Axios and managed global modal/notification state with Zustand.
- Collaborated with UI/UX designers to translate Figma design specs into pixel-accurate code.

EDUCATION
Mumbai University, B.E. in Computer Engineering | CGPA: 7.9/10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, HTML, CSS, SQL
Libraries: React, Redux Toolkit, Tailwind CSS, Vite
Tools: Git, Figma, npm, ESLint`,
    jdText: ``,
    targetTier: 'unicorn',
  },

  // 10. Student Stuffing
  {
    id: 'syn-10-student-stuffing',
    label: 'Student Backend — Blatant Keyword Stuffing',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'stuffing',
    description: 'Candidate lists 28 buzzwords in skills block but project bullets only demonstrate HTML/CSS and basic Python.',
    resumeText: `Rohan Gupta (Synthetic Candidate)
rohan.synthetic@example.com | +91 98711 00223 | Noida, India

EDUCATION
State Technical College, B.Tech CSE | CGPA: 7.1/10 | 2026

TECHNICAL SKILLS
Languages & Frameworks: Java, Python, Go, Rust, C++, C#, Kotlin, Swift, Scala, PHP, Ruby, Spring Boot, Django, Flask, FastAPI, Express, NestJS, React, Angular, Vue, Kubernetes, Docker, Terraform, Kafka, RabbitMQ, Redis, Elasticsearch, GraphQL, gRPC, AWS, GCP, Azure

PROJECTS
Student Attendance Website | Python, HTML, CSS
- Created student attendance registration website for college department.
- Used HTML forms to submit student roll numbers and stored them in text files.
- Worked on user interface styling with CSS and made buttons blue.

Weather Display App | JavaScript, HTML
- Built weather app using free public weather API.
- Displayed temperature and city name on the screen.`,
    jdText: `Backend Software Engineer
Requirements:
- Strong experience in Go, Docker, Kubernetes, and gRPC.
- Hands-on experience with Kafka and Redis distributed streaming.
- Microservices design and relational database optimization.`,
    targetTier: 'top_product',
  },

  // 11. Intern Skills Dump
  {
    id: 'syn-11-intern-skills-dump',
    label: 'Intern Frontend — Massive Skills Dump No Evidence',
    experienceLevel: 'Intern',
    roleFamily: 'Frontend',
    category: 'skills_dump',
    description: 'Lists modern frontend stack (React, Next.js, Redux, Vitest, Tailwind, GraphQL), but experience bullets describe manual testing.',
    resumeText: `Aman Singh (Synthetic Candidate)
aman.synthetic@example.com | +91 97711 22334 | Gurugram, India

EXPERIENCE
Software Intern | Legacy Softworks
June 2025 – August 2025 | Gurugram, India
- Attended daily standup meetings and took meeting notes for senior developers.
- Tested user login pages manually on Chrome browser and documented bugs in Excel sheet.
- Assisted team with verification of button clicks on checkout page.

TECHNICAL SKILLS
React, Next.js, TypeScript, JavaScript, Redux, Zustand, Tailwind CSS, GraphQL, Apollo, Webpack, Vite, Vitest, Jest, Cypress, HTML5, CSS3, Sass, Node.js, Express, MongoDB

EDUCATION
Amity University, B.Tech CSE | CGPA: 7.4/10 | 2025`,
    jdText: `Frontend Software Engineer
Requirements:
- Hands-on experience building web applications in React and TypeScript.
- Strong proficiency in modern state management (Zustand or Redux).
- Experience writing automated tests with Vitest or Jest.
- Understanding of Next.js and Tailwind CSS.`,
    targetTier: 'unicorn',
  },

  // 12. 0-2 yr Buzzwords
  {
    id: 'syn-12-0to2yr-buzzwords',
    label: '0-2 yr Backend — Buzzword Salad Without Context',
    experienceLevel: '0-2 yrs',
    roleFamily: 'Backend',
    category: 'buzzwords',
    description: 'Full of corporate fluff ("synergized cutting-edge paradigms", "orchestrated visionary architecture") with zero concrete facts.',
    resumeText: `Deepak Sharma (Synthetic Candidate)
deepak.synthetic@example.com | +91 96655 44332 | Bengaluru, India

EXPERIENCE
Software Developer | Global Tech Enterprises
2024 – Present | Bengaluru, India
- Synergized cutting-edge distributed paradigms to revolutionize backend ecosystem velocity.
- Orchestrated enterprise-grade microservice methodologies to optimize stakeholder value propositions.
- Leveraged next-generation cloud synergies to accelerate holistic digital transformation across cross-functional verticals.
- Championed visionary agile best practices to maximize scalable pipeline alignment.

EDUCATION
VTU Belgaum, B.E. in Information Science | 2024

SKILLS
Java, Spring Boot, Microservices, Cloud Architecture, Agile Methodologies, DevOps Synergies`,
    jdText: `Backend Software Engineer
Requirements:
- Java, Spring Boot, PostgreSQL, Docker, AWS.
- Measured engineering results: latency reduction, scale, throughput.
- Clear technical contributions.`,
    targetTier: 'top_product',
  },

  // 13. Student Duplicated Bullets
  {
    id: 'syn-13-student-duplicated-bullets',
    label: 'Student Backend — Duplicated Copy-Paste Bullets',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'duplicates',
    description: 'Contains identical repeated bullet points across two projects to inflate resume length.',
    resumeText: `Manish Kumar (Synthetic Candidate)
manish.synthetic@example.com | +91 95544 33221 | Patna, India

EDUCATION
NIT Patna, B.Tech CSE | CGPA: 8.0/10 | 2026

TECHNICAL SKILLS
Java, Spring Boot, MySQL, REST API, Git, Docker

PROJECTS
Hotel Booking Management System | Java, Spring Boot, MySQL
- Architected RESTful microservices with Spring Boot and MySQL for seamless user booking experience.
- Optimized database queries to improve performance and cut API response time significantly.
- Implemented unit tests and automated test suites to ensure high code quality and reliability.

E-Commerce Store Service | Java, Spring Boot, MySQL
- Architected RESTful microservices with Spring Boot and MySQL for seamless user booking experience.
- Optimized database queries to improve performance and cut API response time significantly.
- Implemented unit tests and automated test suites to ensure high code quality and reliability.`,
    jdText: `Junior Backend Developer
Requirements:
- Java, Spring Boot, MySQL, REST APIs.
- Distinct authentic project implementations.`,
    targetTier: 'it_services',
  },

  // 14. Student Implausible Metrics
  {
    id: 'syn-14-student-implausible-metrics',
    label: 'Student Backend — Wildly Implausible Fantasy Metrics',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'implausible',
    description: 'Student project claims 99.999% uptime on localhost, 50 billion users, and 1,000,000% speedup.',
    resumeText: `Abhishek Roy (Synthetic Candidate)
abhishek.synthetic@example.com | +91 94433 22110 | Jaipur, India

EDUCATION
Jaipur National University, B.Tech CSE | CGPA: 8.1/10 | 2026

TECHNICAL SKILLS
Python, Flask, SQLite, JavaScript, HTML, CSS

PROJECTS
Todo List Application | Python, Flask, SQLite
- Scaled application to serve 50 billion concurrent active users with 99.99999% uninterrupted uptime on local machine.
- Optimized SQLite query algorithm, accelerating query throughput by 1,000,000% from 10 minutes to 0.0001 microseconds.
- Saved company $400 million dollars in infrastructure costs during college semester hackathon.

Personal Portfolio Website | HTML, CSS, JavaScript
- Received 8 billion unique visits per hour with zero server latency.`,
    jdText: `Python Developer (Fresher)
Requirements:
- Python, Flask or Django, SQL.
- Real verifiable project experience with plausible outcome metrics.`,
    targetTier: 'startup',
  },

  // 15. Intern Minimal Text
  {
    id: 'syn-15-intern-minimal-text',
    label: 'Intern General — Minimal Length Bordering Threshold',
    experienceLevel: 'Intern',
    roleFamily: 'General',
    category: 'honest',
    description: 'Very short resume text, near the minimum 100-word limit, but formatted cleanly.',
    resumeText: `Siddharth Rao (Synthetic Candidate)
sid.synthetic@example.com | +91 93311 00998 | Kochi, India
github.com/synthetic-sid

EDUCATION
Cochin University of Science and Technology, B.Tech IT | CGPA: 7.8 | 2025

TECHNICAL SKILLS
Python, C++, SQL, Git, Linux, Docker

EXPERIENCE
Software Intern | TechCorp India
June 2025 – August 2025
- Maintained internal script automation tools in Python for daily reporting.
- Executed SQL database verification queries and generated weekly CSV summaries.
- Fixed 12 minor frontend bugs and submitted pull requests using Git.

PROJECTS
Hospital Record System | Python, SQLite
- Created CRUD interface managing patient appointments and bed allocations.`,
    jdText: `Software Trainee
Requirements:
- Degree in engineering.
- Basic knowledge of Python, SQL, and Git.
- Willingness to train in backend systems.`,
    targetTier: 'it_services',
  },

  // 16. Student Ugly Columns
  {
    id: 'syn-16-student-ugly-columns',
    label: 'Student Frontend — Interleaved Two-Column Layout',
    experienceLevel: 'Student',
    roleFamily: 'Frontend',
    category: 'ugly_format',
    description: 'Simulates OCR / text extraction from a 2-column resume where left and right columns bleed together.',
    resumeText: `Kavita Reddy (Synthetic Candidate) | kavita.synthetic@example.com
EDUCATION | SKILLS | PROJECTS
B.Tech CSE, 2026 | React, TypeScript, CSS | Task Manager App
Vellore Institute of Technology | HTML5, JavaScript, Git | Built with React and TypeScript
CGPA: 8.3/10 | Tailwind, Vite, Redux | Filtered tasks by status
HOBBIES | ACHIEVEMENTS | Weather App
Cricket, Reading | 2nd Place Codeathon | Fetched weather data via REST API
Photography | Certified React Dev | Responsive CSS Grid layout`,
    jdText: `Frontend Web Developer
Requirements:
- React, TypeScript, HTML5, CSS3, Tailwind CSS.
- Clean document layout and clear project descriptions.`,
    targetTier: 'unicorn',
  },

  // 17. 0-2 yr Ugly Text Box
  {
    id: 'syn-17-0to2yr-ugly-text-box',
    label: '0-2 yr Backend — Missing Section Headers & Text-Box Flow',
    experienceLevel: '0-2 yrs',
    roleFamily: 'Backend',
    category: 'ugly_format',
    description: 'Lacks standard section headers ("Experience", "Education", "Projects") causing ATS section-segmentation penalties.',
    resumeText: `Harish Chandra (Synthetic Candidate)
harish.synthetic@example.com | +91 92211 44556

Summary of my journey so far:
I worked at TechSolutions for 14 months where I coded REST APIs in Go and managed MySQL database tables. We had about 10,000 users and I added Redis cache to make user sessions faster. Before that I was studying at SRM University where I passed computer science with 7.5 grade in 2024. I know how to use Docker and Git commands and write Linux bash scripts. Also built an online library system in my 3rd year with Java and Spring.`,
    jdText: `Go Backend Engineer
Requirements:
- 1+ years experience with Golang and MySQL.
- Familiarity with Redis caching and Docker.
- Clean resume structure with identifiable work experience and education.`,
    targetTier: 'it_services',
  },

  // 18. Student Data/ML Stuffing
  {
    id: 'syn-18-student-dataml-stuffing',
    label: 'Student Data/ML — ML Framework Stuffing Zero Math',
    experienceLevel: 'Student',
    roleFamily: 'Data/ML',
    category: 'stuffing',
    description: 'Claims deep learning expertise with 20 libraries listed, but project is basic scikit-learn tutorial on Iris dataset.',
    resumeText: `Nikhil Jain (Synthetic Candidate)
nikhil.synthetic@example.com | +91 91100 22998 | Indore, India

EDUCATION
Medicaps University, B.Tech CSE | CGPA: 7.2/10 | 2026

TECHNICAL SKILLS
PyTorch, TensorFlow, Keras, JAX, HuggingFace, Transformers, BERT, GPT-4, LLMs, LangChain, LlamaIndex, Deep Learning, Computer Vision, NLP, Reinforcement Learning, Scikit-Learn, Pandas, NumPy, OpenCV, MLflow, Docker, Kubernetes

PROJECTS
Iris Flower Classification | Python, Scikit-Learn
- Downloaded Iris flower dataset from Kaggle.
- Applied Logistic Regression and printed classification report accuracy.
- Visualized flower petal lengths using Matplotlib scatter plots.`,
    jdText: `Machine Learning Intern
Requirements:
- Solid understanding of ML algorithms and Python.
- Demonstrated project experience training and tuning models on real datasets.
- Knowledge of PyTorch or TensorFlow.`,
    targetTier: 'startup',
  },

  // 19. Intern DevOps Buzzwords
  {
    id: 'syn-19-intern-devops-buzzwords',
    label: 'Intern DevOps — Cloud Enthusiast Buzzword Resume',
    experienceLevel: 'Intern',
    roleFamily: 'DevOps',
    category: 'buzzwords',
    description: 'Lots of cloud keywords ("cloud-native evangelist", "multi-cloud visionary") without a single concrete cluster configuration.',
    resumeText: `Saurabh Tiwari (Synthetic Candidate)
saurabh.synthetic@example.com | +91 90011 33445 | Lucknow, India

EDUCATION
UPTU, B.Tech CSE | CGPA: 7.6/10 | 2025

TECHNICAL SUMMARY
Cloud-native enthusiast and passionate DevOps evangelist dedicated to driving digital excellence across hyperscale multi-cloud environments. Deeply knowledgeable about Kubernetes paradigms, modern GitOps workflows, and zero-trust security postures.

EXPERIENCE
Cloud Enthusiast Intern | CloudVibes
July 2025 – August 2025
- Participated in enterprise knowledge-sharing webinars about AWS serverless architectures.
- Researched cutting-edge Docker containerization patterns for modern organizations.
- Read official documentation on Terraform infrastructure provisioning.`,
    jdText: `Junior Cloud / DevOps Engineer
Requirements:
- Hands-on experience creating Dockerfiles and running containers.
- Basic hands-on AWS or GCP configuration.
- Practical understanding of Linux commands and shell scripting.`,
    targetTier: 'it_services',
  },

  // 20. 3+ yr Frontend Senior
  {
    id: 'syn-20-3plus-frontend-senior',
    label: '3+ yr Frontend — Design System & Micro-Frontends',
    experienceLevel: '3+ yrs',
    roleFamily: 'Frontend',
    category: 'honest',
    description: 'Senior Frontend Engineer with 4 years experience, design token architecture, micro-frontends, and performance budgets.',
    resumeText: `Meera Krishnan (Synthetic Candidate)
meera.synthetic@example.com | +91 98222 33445 | Bengaluru, India
github.com/synthetic-meera | meerafrontend.synthetic.io

EXPERIENCE
Senior Frontend Engineer | E-Commerce Unicorn
August 2022 – Present | Bengaluru, India
- Architected enterprise design system used by 60+ engineers across 8 product squads, ensuring 100% WCAG 2.1 AA accessibility.
- Migrated legacy multi-page storefront to Next.js App Router, cutting overall bundle size by 44% and boosting conversion rate by 6.2%.
- Established client-side performance monitoring with real-user metrics (RUM), maintaining 75th percentile LCP under 1.6s.
- Led front-end guild weekly architecture syncs, code review standards, and automated Playwright E2E testing pipelines.

Frontend Engineer | B2B SaaS Platform
July 2020 – July 2022 | Bengaluru, India
- Built complex real-time analytics dashboard with React, TypeScript, and D3.js charting 500,000 data points smoothly at 60fps.
- Implemented state management using Redux Toolkit and TanStack Query with optimistic UI mutations.

EDUCATION
NIT Surathkal, B.Tech in Information Technology | CGPA: 8.8/10 | 2016 – 2020

TECHNICAL SKILLS
Core: TypeScript, JavaScript (ES6+), React 18, Next.js, HTML5, CSS3/SCSS
Performance & State: Web Vitals, TanStack Query, Zustand, Redux Toolkit, Webpack, Vite
Testing & Quality: Playwright, Cypress, Vitest, Jest, Storybook, ESLint, Axe-core`,
    jdText: `Senior Frontend Engineer
Company: Leading E-Commerce / Consumer Tech

Requirements:
- 3+ years experience building production web applications in React and TypeScript.
- Deep expertise in web performance optimization (Core Web Vitals, bundle splitting, SSR/SSG).
- Experience building or scaling enterprise design systems and component libraries.
- Strong knowledge of automated testing (E2E with Playwright/Cypress and unit testing with Vitest/Jest).
- Track record of mentoring engineers and driving frontend architecture decisions.`,
    targetTier: 'top_product',
  },

  // 21. 3+ yr Data/ML Senior
  {
    id: 'syn-21-3plus-dataml-senior',
    label: '3+ yr Data/ML — Distributed Training & Real-Time ML',
    experienceLevel: '3+ yrs',
    roleFamily: 'Data/ML',
    category: 'honest',
    description: 'Senior ML Engineer with 4 years experience, recommendation systems, feature store, and low-latency inference.',
    resumeText: `Dr. Varun Saxena (Synthetic Candidate)
varun.synthetic@example.com | +91 97111 88990 | Gurugram, India
github.com/synthetic-varun | linkedin.com/in/synthetic-varun

EXPERIENCE
Senior Machine Learning Engineer | Streaming Media Unicorn
October 2022 – Present | Gurugram, India
- Architected real-time candidate recommendation retrieval service serving 45,000 queries/sec with p99 latency under 22ms.
- Built two-tower deep retrieval neural networks with PyTorch and deployed via Triton Inference Server with dynamic batching.
- Established centralized Feast feature store across online Redis and offline Snowflake clusters, reducing feature drift by 80%.
- Managed distributed training jobs over 32 A100 GPUs using PyTorch FSDP and Ray Train.

Machine Learning Engineer | FinTech Analytics
July 2020 – September 2022 | Bengaluru, India
- Developed fraud detection models with LightGBM and Graph Neural Networks, reducing false decline rates by 28%.
- Built automated model retraining pipelines with Kubeflow and Apache Airflow on AWS EKS.

EDUCATION
IIT Delhi, M.Tech & B.Tech Dual Degree in Computer Science | CGPA: 9.2/10 | 2015 – 2020

TECHNICAL SKILLS
ML & Frameworks: PyTorch, Ray, Triton Inference Server, LightGBM, HuggingFace, Scikit-Learn
Data & Infra: Spark, Kafka, Snowflake, Feast, Redis, Airflow, Kubernetes, Docker, AWS
Languages: Python, C++, SQL, Bash`,
    jdText: `Senior Machine Learning Engineer — Recommendations & Search
Company: Media & Entertainment Tech

Requirements:
- 3+ years experience developing and deploying machine learning models at production scale.
- Hands-on expertise in PyTorch or TensorFlow for recommendation, retrieval, or ranking systems.
- Experience with low-latency model serving (Triton, TorchScript, or ONNX) and high-throughput streaming (Kafka, Redis).
- Strong software engineering practices in Python, C++, and Docker.
- Experience with distributed computing (Spark, Ray).`,
    targetTier: 'top_product',
  },

  // 22. 3+ yr Mobile Senior
  {
    id: 'syn-22-3plus-mobile-senior',
    label: '3+ yr Mobile — Dual Platform & Scale Architecture',
    experienceLevel: '3+ yrs',
    roleFamily: 'Mobile',
    category: 'honest',
    description: 'Senior Mobile Engineer with 4 years experience, modular Kotlin/Swift codebase, 5M+ active users, and crash observability.',
    resumeText: `Divya Sundaram (Synthetic Candidate)
divya.synthetic@example.com | +91 98400 11223 | Chennai, India
github.com/synthetic-divya

EXPERIENCE
Lead Mobile Engineer | FoodTech Unicorn
May 2022 – Present | Bengaluru, India
- Owned the core ordering and real-time live order delivery tracking module used by 4.5M monthly active users.
- Refactored monolithic Android app into 16 independent dynamic feature modules, reducing incremental build time by 60% (from 8m to 3.2m).
- Reduced app crash rate from 0.42% to 0.04% by introducing strict Kotlin null-safety conventions and coroutine exception handlers.
- Mentored a squad of 6 mobile engineers across Android (Kotlin/Compose) and iOS (Swift/SwiftUI).

Android Software Engineer | Ride Hailing Platform
August 2020 – April 2022 | Chennai, India
- Implemented real-time driver navigation with Google Maps SDK and WebSockets with smooth route polylines.
- Integrated payment gateways (UPI, Credit Cards, NetBanking) with biometric authentication.

EDUCATION
Anna University (CEG), B.E. in Computer Science | CGPA: 8.7/10 | 2016 – 2020

TECHNICAL SKILLS
Android: Kotlin, Java, Jetpack Compose, Coroutines, Flow, Dagger-Hilt, Room, WorkManager, Retrofit
iOS: Swift, SwiftUI, Combine, URLSession
Tools: Android Studio, Xcode, Gradle, Fastlane, Firebase Crashlytics, Git`,
    jdText: `Senior Mobile Engineer (Android / iOS)
Company: High-Growth Consumer App

Requirements:
- 3+ years of native mobile development experience with high-scale consumer applications.
- Deep expertise in Kotlin and modern Android architecture (Compose, Coroutines, Hilt, MVVM/MVI).
- Track record of driving app performance, memory optimization, and maintaining crash-free rates > 99.9%.
- Experience modularizing large Android codebases and managing build performance.`,
    targetTier: 'unicorn',
  },

  // 23. Student Underqualified for Senior JD
  {
    id: 'syn-23-student-underqualified-for-senior-jd',
    label: 'Student Applying for Staff/Senior Role (Mismatch)',
    experienceLevel: 'Student',
    roleFamily: 'Backend',
    category: 'mismatch',
    description: 'Fresh graduate candidate evaluated against a Staff Engineer JD requiring 8+ years and cross-org technical leadership.',
    resumeText: `Tarun Bajaj (Synthetic Candidate)
tarun.synthetic@example.com | +91 99000 11224 | Chandigarh, India

EDUCATION
Panjab University, B.E. Computer Science | CGPA: 8.0/10 | 2026

TECHNICAL SKILLS
Java, Spring Boot, MySQL, Git, Docker, HTML, CSS

PROJECTS
College Library Portal | Java, Spring Boot, MySQL
- Built web application for students to issue and return books with Spring Boot.
- Designed database tables for books, students, and fines.
- Added login authentication for librarian.

Blog Platform | Node.js, Express, MongoDB
- Created REST API for creating and editing blog posts.`,
    jdText: `Staff Backend Engineer — Infrastructure Core
Organization: Tier-1 Big Tech India

Role Requirements:
- 8+ years of production software engineering experience in distributed infrastructure.
- Proven leadership driving multi-quarter technical roadmaps across multiple engineering teams.
- Deep expertise in multi-region data replication, consensus algorithms (Raft, Paxos), and disaster recovery.
- Track record of mentoring principal engineers and advising executive leadership.`,
    targetTier: 'top_product',
  },

  // 24. 3+ yr Senior Overqualified for Intern JD
  {
    id: 'syn-24-3plus-overqualified-for-intern-jd',
    label: 'Senior SWE Applying for Summer Intern Role (Mismatch)',
    experienceLevel: '3+ yrs',
    roleFamily: 'Backend',
    category: 'mismatch',
    description: 'Senior engineer with 5 years experience evaluated against a campus summer internship role.',
    resumeText: `Sanjay Singhania (Synthetic Candidate)
sanjay.synthetic@example.com | +91 98777 66554 | Mumbai, India

EXPERIENCE
Technical Lead | Enterprise Cloud Corp
2021 – Present | Mumbai, India
- Architected enterprise cloud management platform managing 40,000 virtual machines across AWS and Azure.
- Directed team of 10 senior developers, setting coding guidelines and CI/CD policies.
- Designed high-throughput microservices in Go and Java processing $50M monthly transactions.

Senior Developer | Systems Ltd
2019 – 2021 | Mumbai, India
- Maintained distributed database clusters and optimized SQL queries.

EDUCATION
VJTI Mumbai, B.Tech CSE | 2015 – 2019

SKILLS
Go, Java, Kubernetes, AWS, Terraform, Distributed Systems, SQL`,
    jdText: `Summer Engineering Intern — 2026
Company: Tech Services

Job Description:
- Currently enrolled in a Bachelor's degree in engineering graduating in 2027.
- Basic knowledge of computer programming in C++, Java, or Python.
- Looking for eager learners to shadow senior mentors for 8 weeks during summer break.`,
    targetTier: 'it_services',
  },
];
