export interface CorpusPair {
  id: string;
  title: string;
  archetype: string;
  resumeText: string;
  jdText: string;
  metadata: {
    expectedSeniority: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
    expectedOrGroups?: string[][];
    hasNoSkillsSection?: boolean;
    hasTablesOrColumns?: boolean;
    wordCountBucket?: 'brief' | 'standard' | 'verbose';
    exclusionTokensPresent?: string[];
    subStringPairsPresent?: Array<{ child: string; parent: string }>;
  };
}

export const TEST_CORPUS: CorpusPair[] = [
  // 1. Entry-level CS Student + University Intake JD with OR-groups
  {
    id: '01_entry_cs_fresher',
    title: 'CS Fresher & Google SWE Campus Intake',
    archetype: 'entry_level_cs',
    metadata: {
      expectedSeniority: 'entry',
      expectedOrGroups: [['python', 'java', 'cpp', 'go']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.Tech', 'Node.js'],
      subStringPairsPresent: [{ child: 'java', parent: 'javascript' }, { child: 'c', parent: 'c++' }],
    },
    resumeText: `Aarav Patel
aarav.patel.dev@gmail.com | +91 9876543210
linkedin.com/in/aarav-patel-cs | github.com/aaravpatel

OBJECTIVE
Motivated Computer Science graduate eager to apply algorithmic problem-solving and software engineering principles in a fast-paced technology organization.

EDUCATION
B.Tech in Computer Science and Engineering
Indian Institute of Information Technology
Graduation Year: 2026 | CGPA: 8.9 / 10

TECHNICAL SKILLS
Languages: Python, C++, Java, SQL
Core Concepts: Data Structures, Algorithms (DSA), Object-Oriented Programming (OOP), Operating Systems
Web & Tools: Node.js, Express, PostgreSQL, Git, Linux, Docker

PROJECTS
AlgoVisualizer — Interactive Algorithm Visualizer
- Built an interactive web platform visualizing sorting and graph traversal algorithms, supporting over 1,200 monthly active student users.
- Implemented state-machine animations with 60 FPS rendering and zero frame drops on complex Dijkstra graphs.

CampusMarket — Peer-to-Peer Campus Marketplace
- Developed microservices-based student exchange portal handling 450+ campus listings with JWT authentication.
- Reduced database query latency by 35% through Redis caching of active listing metadata.

CERTIFICATIONS
- AWS Certified Cloud Practitioner
- HackerRank Problem Solving (5 Stars)`,
    jdText: `Google — Software Engineer, University Graduate 2026
Experience Level: Fresher / University Graduate (2026 Batch)
Location: Bengaluru / Hyderabad, India

About the Role:
As a University Graduate Software Engineer at Google, you will tackle scalability, algorithmic efficiency, and distributed systems challenges across products used by billions of global users.

Minimum Qualifications:
- Bachelor's or Master's degree in Computer Science or related technical field (Class of 2026).
- Proficiency in any one of Python, Java, C++, or Go.
- Solid foundational mastery of Data Structures and Algorithms (DSA).
- Understanding of Object-Oriented Programming and modular software design.

Preferred Qualifications:
- Experience with cloud platforms (GCP, AWS) and containerized workflows.
- Active open source contributions or competitive programming accolades.`,
  },

  // 2. Entry-level Non-CS Student + Microsoft Campus Intake
  {
    id: '02_entry_non_cs_fresher',
    title: 'Non-CS ECE Fresher & Microsoft Campus Intake',
    archetype: 'entry_level_non_cs',
    metadata: {
      expectedSeniority: 'entry',
      expectedOrGroups: [['python', 'java', 'cpp', 'csharp']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.Tech'],
      subStringPairsPresent: [{ child: 'c', parent: 'c++' }, { child: 'c', parent: 'c#' }],
    },
    resumeText: `Rahul Sharma
rahul.sharma@example.com | 9030403525

CAREER OBJECTIVE
Seeking an entry-level software role to leverage web development, Java, and IoT to build impactful software solutions within a dynamic tech team.

PROFILE / SUMMARY
Enthusiastic and motivated Electronics and Communication Engineering graduate with strong analytical capabilities, foundational programming knowledge, disciplined engineering mindset, and active campus software project experience across undergraduate studies.

AREAS OF EXPERTISE
PYTHON

PROJECTS
UniSync
- UniSync campus collaboration platform synchronizing class timetables, examination schedules, and project milestone notifications across academic departments.
- Developed intuitive schedule dashboard assisting peer study cohorts coordinate weekly revision sessions without administrative friction.

LocalPro
- LocalPro neighbourhood directory connecting verified independent local service providers with nearby residential clients through organized service category listings.

Tourly
- Tourly interactive travel recommendation web system assisting university student backpackers discover regional tourist destinations and organize custom travel itineraries.

LostAndFound
- Built campus lost and found portal tracking misplaced student belongings across academic blocks and administrative halls.
- Implemented category search and claim verification workflows for university security desk to return lost items safely.

EDUCATION
B.Tech in Electronics and Communication Engineering (ECE)
National Institute of Technology
Graduation Year: 2026
Cumulative Grade Point Average: 8.6 / 10

TECHNICAL SKILLS
Core Competencies: Data Structures and Algorithms (DSA), Object-Oriented Programming (OOP), Database Systems, System Design
Web Technologies: HTML5, REST APIs
Developer Tools: Git, Linux`,
    jdText: `Microsoft — Software Engineer
Role: Software Engineer (SWE)
Campus Drive: SUPER-DREAM campus intake
Experience Level: Fresher / University Graduate (2026-2027 Batch)
Location: Hyderabad / Bengaluru / Redmond

About the Role:
As a Software Engineer at Microsoft, you will design, code, and test scalable distributed software services. You will collaborate with dynamic engineering teams across the world to build high-impact cloud platforms, intelligent client applications, and developer ecosystems.

Requirements:
- Bachelor's or Master's degree in Computer Science, Electronics, or related engineering discipline (2026-2027 graduating batch, 4+ years of undergraduate coursework and project experience).
- Solid foundational knowledge of Data Structures and Algorithms (DSA).
- Strong understanding of Object-Oriented Programming (OOP) concepts and design principles.
- Working familiarity with System Design, distributed system architectures, and reliable microservices.
- Demonstrated programming proficiency in at least one of Python/Java/C++/C#.
- Passion for problem-solving, clean code craftsmanship, and team collaboration.`,
  },

  // 3. Junior Developer (1-2 years experience) + Stripe Backend
  {
    id: '03_junior_developer',
    title: 'Junior Developer (1.5 YOE) & FinTech Backend Role',
    archetype: 'junior_developer',
    metadata: {
      expectedSeniority: 'junior',
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.E.', 'Node.js', 'Next.js'],
    },
    resumeText: `Priya Nair
priya.nair.tech@gmail.com | +91 9123456780
github.com/priyanair | linkedin.com/in/priya-nair-dev

PROFESSIONAL SUMMARY
Backend Software Engineer with 1.5 years of industry experience architecting resilient financial transaction pipelines, RESTful microservices, and database optimizations in high-throughput Node.js environments.

WORK EXPERIENCE
Associate Software Engineer | PineLabs FinTech
July 2024 - Present | Bengaluru, India
- Engineered distributed merchant settlement service using Node.js and TypeScript, handling over 250,000 daily transaction records.
- Optimized PostgreSQL indexing and connection pooling, reducing p99 API response times from 180ms to 42ms.
- Containerized microservices using Docker and automated CI/CD deployment pipelines on AWS ECS.

Software Engineering Intern | Razorpay
January 2024 - June 2024 | Bengaluru, India
- Implemented webhook delivery retry mechanism with exponential backoff, cutting failed delivery tickets by 45%.
- Authored 85+ unit and integration tests using Jest, boosting test coverage across core payments module from 64% to 91%.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, SQL, Python
Frameworks & Libraries: Node.js, Express, Next.js, Jest, TypeORM
Databases & Infra: PostgreSQL, Redis, Docker, AWS (S3, ECS, RDS), Git

EDUCATION
B.E. in Information Science | Visvesvaraya Technological University (2020 - 2024) | CGPA: 8.7`,
    jdText: `Stripe — Junior Backend Engineer (Payments Infrastructure)
Experience Level: 1-2 years experience
Location: Remote / Bengaluru

Role Overview:
Stripe builds economic infrastructure for the internet. As a Junior Backend Engineer on the Payments team, you will design robust APIs and ensure sub-second reliability for global payment rails.

Requirements:
- 1+ years of professional backend software development experience.
- Strong proficiency in TypeScript, JavaScript, or Go.
- Working knowledge of relational databases (PostgreSQL or MySQL) and query optimization.
- Experience building and maintaining RESTful APIs and asynchronous message queues.
- Commitment to high test coverage, code reviews, and automated CI/CD practices.`,
  },

  // 4. Mid-Level Backend Engineer (4-5 years) + Uber Distributed Systems
  {
    id: '04_mid_backend',
    title: 'Mid-Level Backend Engineer (4.5 YOE) & Distributed Systems JD',
    archetype: 'mid_backend',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['kafka', 'rabbitmq'], ['java', 'go']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.Tech', '.NET'],
    },
    resumeText: `Vikram Malhotra
vikram.malhotra.swe@gmail.com | +91 9988776655
linkedin.com/in/vikram-malhotra | github.com/v-malhotra

SUMMARY
Distributed systems engineer with 4.5 years of hands-on experience building fault-tolerant microservices, event streaming platforms, and high-concurrency storage layers in Java and Go.

EXPERIENCE
Software Engineer II | Swiggy
August 2022 - Present | Bengaluru, India
- Architected real-time order tracking pipeline processing 45,000 events/sec using Apache Kafka and Go, achieving 99.99% uptime.
- Redesigned geo-spatial caching tier in Redis, reducing backend database load by 60% during peak dinner surges.
- Spearheaded migration of legacy monolith endpoints to decoupled gRPC microservices deployed on Kubernetes.

Software Engineer I | Infosys Digital Labs
July 2020 - July 2022 | Pune, India
- Developed core banking transaction auditing API in Java and Spring Boot serving enterprise tier-1 clients.
- Implemented optimistic locking algorithms in PostgreSQL, eliminating double-debit race conditions across concurrent sessions.

SKILLS
Backend: Java, Go, Spring Boot, gRPC, REST APIs
Data & Messaging: Apache Kafka, Redis, PostgreSQL, MongoDB, Elasticsearch
Cloud & DevOps: Kubernetes, Docker, AWS (EC2, EKS, DynamoDB), Terraform, Grafana, Prometheus

EDUCATION
B.Tech in Computer Science | BITS Pilani (2016 - 2020)`,
    jdText: `Uber — Software Engineer II (Core Distributed Systems)
Experience Level: 3-5 years experience
Location: Hyderabad / Bengaluru

Responsibilities:
- Build, scale, and maintain high-throughput backend services that power trip dispatch and payment distribution.
- Design low-latency message streaming architectures capable of sustained millions of events per minute.

Minimum Qualifications:
- 3 to 5 years of software engineering experience in distributed systems.
- Strong proficiency in Java or Go.
- Experience with distributed event buses such as Kafka or RabbitMQ.
- Expertise with relational databases, key-value stores, and microservice orchestration (Kubernetes, Docker).
- Track record of diagnosing performance bottlenecks and concurrency deadlocks.`,
  },

  // 5. Senior / Staff Lead (9 years) + Datadog Systems Architect
  {
    id: '05_senior_lead',
    title: 'Senior/Staff Lead Engineer (9 YOE) & Principal Architect JD',
    archetype: 'senior_lead',
    metadata: {
      expectedSeniority: 'senior',
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['M.Tech', 'B.Tech'],
    },
    resumeText: `Sunita Rao
sunita.rao.staff@gmail.com | +91 9845012345
linkedin.com/in/sunitarao-staff | github.com/sunitarao

EXECUTIVE SUMMARY
Staff Systems Architect with 9+ years of experience leading multi-disciplinary engineering organizations, driving enterprise architectural strategy, and scaling distributed telemetry ingestion engines processing petabyte-scale datasets.

EXPERIENCE
Staff Software Engineer | InMobi Telemetry Core
April 2021 - Present | Bengaluru, India
- Directed technical vision for distributed event-streaming platform handling 1.8M events/sec across 4 global cloud regions.
- Led team of 14 senior engineers in replacing proprietary indexing engine with columnar Rust storage tier, slashing annual AWS compute costs by $1.4M (42%).
- Established organization-wide zero-trust network policies and active-active cross-region failover protocols with sub-minute RTO.

Senior Software Engineer | Flipkart Core Supply Chain
June 2017 - March 2021 | Bengaluru, India
- Designed automated warehouse inventory allocation engine in Golang and Cassandra handling 800,000 orders/hour during Big Billion Days.
- Mentored 8 junior and mid-level engineers, guiding 4 promotions to Senior Engineer through formal system design coaching.

Software Engineer | Cisco Systems
August 2015 - May 2017 | Bengaluru, India
- Engineered network packet inspection daemon in C++ and Linux kernel eBPF modules.

CORE COMPETENCIES
Architecture: Distributed Systems Design, Multi-Region High Availability, Microservices, Domain-Driven Design
Technologies: Go, Rust, C++, Apache Kafka, Cassandra, Kubernetes, AWS, Prometheus, OpenTelemetry
Leadership: Technical Strategy, Cross-Functional Alignment, Engineering Mentorship, Hiring Committee

EDUCATION
M.Tech in Computer Science | IIT Bombay (2013 - 2015)
B.Tech in Computer Science | NIT Surathkal (2009 - 2013)`,
    jdText: `Datadog — Staff Software Engineer (Telemetry Platform)
Experience Level: 8+ years experience
Location: Remote / Bengaluru

Position Description:
Datadog is seeking a Staff Software Engineer to spearhead our next-generation distributed telemetry storage and query engine. You will own architecture, multi-region fault tolerance, and cross-team execution.

Requirements:
- 8+ years of production experience in backend or systems software engineering.
- Deep expertise in systems programming languages (Go, Rust, or C++).
- Proven track record designing large-scale distributed databases, message queues, or storage engines.
- Demonstrated technical leadership across multiple engineering teams.
- Deep understanding of consensus protocols (Raft, Paxos), network topology, and kernel performance tuning.`,
  },

  // 6. Data / Machine Learning Engineer (3 years) + ML / AI Engineer JD
  {
    id: '06_data_ml',
    title: 'Machine Learning Engineer (3 YOE) & MLOps / AI JD',
    archetype: 'data_ml',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['pytorch', 'tensorflow', 'jax']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['M.Sc.', 'B.Sc.'],
    },
    resumeText: `Rohan Sen
rohan.sen.ml@gmail.com | +91 9711223344
github.com/rohan-ml | linkedin.com/in/rohan-sen-ai

PROFESSIONAL SUMMARY
Machine Learning Engineer with 3 years of experience building end-to-end computer vision and NLP deep learning pipelines, transformer fine-tuning, and scalable inference services on GPU clusters.

WORK HISTORY
Machine Learning Engineer | Fractal Analytics
October 2022 - Present | Gurugram, India
- Fine-tuned open-source LLaMA-3 models using LoRA and PyTorch for domain-specific contract risk extraction, improving extraction F1-score from 0.71 to 0.89.
- Architected asynchronous model serving pipeline with NVIDIA Triton and Docker, achieving 28ms p95 inference latency under 400 concurrency.
- Built automated data drift monitoring using MLflow and Great Expectations, catching model performance degradation 3 weeks before client escalation.

Associate Data Scientist | Mu Sigma
July 2021 - September 2022 | Bengaluru, India
- Developed predictive churn classification models using scikit-learn, XGBoost, and pandas over 50M retail customer records.
- Standardized feature engineering pipelines in Apache Spark, cutting daily model training runtime by 55%.

TECHNICAL EXPERTISE
ML & AI: PyTorch, Hugging Face, scikit-learn, MLflow, LangChain, Triton Inference Server
Data Engineering: Python, SQL, Apache Spark, Pandas, NumPy, Redis
Infrastructure: Docker, Kubernetes, AWS SageMaker, Linux, Git

EDUCATION
M.Sc. in Data Science | Chennai Mathematical Institute (2019 - 2021)
B.Sc. in Statistics | Delhi University (2016 - 2019)`,
    jdText: `Scale AI — Machine Learning Engineer (LLM Infrastructure)
Experience Level: 2-4 years experience
Location: Remote / Bengaluru

About the Role:
Scale AI accelerates AI development. We are looking for an ML Engineer to build scalable infrastructure for training, fine-tuning, and evaluating cutting-edge frontier language models.

Qualifications:
- 2+ years of hands-on experience in machine learning or AI engineering.
- Deep proficiency with PyTorch, TensorFlow, or JAX.
- Experience with modern LLM fine-tuning techniques (LoRA, QLoRA, DPO) and Hugging Face ecosystems.
- Familiarity with high-throughput model serving engines (vLLM, TensorRT-LLM, Triton).
- Strong software engineering foundation with clean code, testing, and CI/CD habits.`,
  },

  // 7. Frontend Engineer (3 years) + React/Next.js JD
  {
    id: '07_frontend',
    title: 'Frontend Engineer (3 YOE) & Modern Web UI JD',
    archetype: 'frontend',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['react', 'vue']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['Next.js', 'Vue.js'],
    },
    resumeText: `Ananya Gupta
ananya.gupta.ui@gmail.com | +91 9650123456
ananyagupta.dev | github.com/ananya-ui | linkedin.com/in/ananya-gupta-frontend

SUMMARY
Product-focused Frontend Engineer with 3 years of experience crafting accessible, high-performance web applications using React, TypeScript, Next.js, and modern CSS architecture.

EXPERIENCE
Frontend Software Engineer | Postman
September 2022 - Present | Bengaluru, India
- Re-architected API documentation viewer in React, TypeScript, and Next.js, boosting Google Lighthouse Performance score from 58 to 94.
- Implemented virtualized list rendering with react-window for collections containing 10,000+ endpoints, dropping memory footprint by 62%.
- Enforced WCAG 2.1 AA accessibility compliance across core design system components, eliminating 45 keyboard trap violations.

Junior Frontend Developer | Zomato
June 2021 - August 2022 | Gurugram, India
- Built restaurant partner onboarding flow with multi-step validation and Redux Toolkit state management, improving sign-up completion rate by 18%.
- Authored automated end-to-end UI regression tests in Playwright, reducing critical release bugs by 30%.

TECHNICAL SKILLS
Core: React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS
State & Data: Redux Toolkit, React Query, Zustand, REST APIs, GraphQL
Tooling & Testing: Vite, Webpack, Jest, React Testing Library, Playwright, Git

EDUCATION
B.Tech in Computer Science | Delhi Technological University (2017 - 2021)`,
    jdText: `Airbnb — Frontend Software Engineer (Guest Experience)
Experience Level: 2-4 years experience
Location: Remote / Bengaluru

The Role:
Help craft world-class web interfaces for millions of global travelers. We value clean component abstractions, rigorous performance budgets, and intuitive micro-interactions.

Requirements:
- 2 to 4 years of frontend web application development experience.
- Strong proficiency in modern React or Vue alongside TypeScript.
- Deep understanding of modern browser rendering, Core Web Vitals, and state management.
- Experience building reusable, accessible design systems (WCAG compliance).
- Expertise with automated component and end-to-end testing (Jest, Playwright, or Cypress).`,
  },

  // 8. DevOps / Cloud SRE (5 years) + Infrastructure Reliability JD
  {
    id: '08_devops_cloud',
    title: 'DevOps / SRE (5 YOE) & Cloud Infrastructure JD',
    archetype: 'devops_cloud',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['aws', 'gcp', 'azure'], ['terraform', 'pulumi']],
      wordCountBucket: 'standard',
    },
    resumeText: `David Kim
david.kim.sre@gmail.com | +1 (415) 890-1234
github.com/davidkimsre | linkedin.com/in/david-kim-cloud

SUMMARY
Site Reliability and DevOps Engineer with 5 years of experience managing production Kubernetes clusters, Infrastructure as Code, CI/CD automation, and multi-cloud reliability across AWS and GCP.

PROFESSIONAL EXPERIENCE
Senior Site Reliability Engineer | Twilio
March 2022 - Present | San Francisco, CA / Remote
- Managed multi-region Kubernetes (EKS) clusters hosting 120+ microservices processing 12B API requests monthly.
- Codified 100% of cloud resources into modular Terraform repositories with automated Atlantis pull-request workflows.
- Built automated canary deployment pipeline using ArgoCD and Prometheus metric gates, reducing production rollback rate from 8% to 0.4%.
- Maintained 99.995% SLA for core SMS routing infrastructure through proactive chaos engineering and PagerDuty alert deduplication.

DevOps Engineer | Box
July 2019 - February 2022 | Redwood City, CA
- Consolidated 15 legacy Jenkins servers into centralized GitHub Actions workflows, cutting mean build times by 40%.
- Implemented Prometheus, Grafana, and Alertmanager monitoring dashboards tracking distributed service SLIs/SLOs.

SKILLS & TOOLS
Cloud: AWS (EKS, VPC, IAM, RDS), GCP, Terraform, Pulumi
Containers & Orchestration: Kubernetes, Docker, Helm, ArgoCD, Istio
Observability: Prometheus, Grafana, Datadog, ELK Stack, OpenTelemetry
Scripting & CI/CD: Python, Bash, Go, GitHub Actions, Linux Systems Administration

EDUCATION
B.S. in Computer Engineering | San Jose State University (2015 - 2019)`,
    jdText: `Netflix — Site Reliability Engineer (Cloud Infrastructure)
Experience Level: 4-7 years experience
Location: Los Gatos, CA / Remote

About Netflix Reliability:
Our SRE team enables rapid, fearless releases while ensuring 250M+ global members enjoy uninterrupted entertainment.

Requirements:
- 4 to 7 years of experience in SRE, DevOps, or systems engineering.
- Deep expertise with cloud providers: AWS, GCP, or Azure.
- Proven experience operating production Kubernetes clusters at scale.
- Advanced Infrastructure as Code skills using Terraform or Pulumi.
- Experience with telemetry and incident management (Prometheus, Grafana, Datadog).
- Proficiency in Python, Go, or Bash scripting.`,
  },

  // 9. Mobile Developer (3.5 years) + Mobile App JD
  {
    id: '09_mobile',
    title: 'Mobile Engineer (3.5 YOE) & Mobile Apps JD',
    archetype: 'mobile',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['swift', 'kotlin'], ['react native', 'flutter']],
      wordCountBucket: 'standard',
    },
    resumeText: `Marcus Chen
marcus.chen.mobile@gmail.com | +1 (650) 456-7890
github.com/marcuschen | linkedin.com/in/marcus-chen-mobile

SUMMARY
Mobile Application Engineer with 3.5 years of experience developing cross-platform and native iOS/Android applications, offline-first synchronization, and published consumer applications with 500k+ downloads.

EXPERIENCE
Mobile Software Engineer | Instacart
January 2023 - Present | San Francisco, CA
- Developed customer checkout and real-time delivery tracking flows in React Native and TypeScript used by 450,000 daily active shoppers.
- Profiled and optimized mobile memory allocations, reducing iOS app launch crash rates by 68%.
- Implemented native Swift bridge modules for custom Bluetooth barcode scanner hardware integration.

Junior iOS Developer | HealthJoy
August 2021 - December 2022 | Chicago, IL
- Built telemedicine consultation chat and video interface using Swift, UIKit, and WebRTC.
- Integrated Apple HealthKit biometric data syncing with local SQLite offline database cache.

TECHNICAL SKILLS
Mobile Platforms: React Native, iOS (Swift, UIKit), Android (Kotlin, Jetpack)
Languages: TypeScript, JavaScript, Swift, Kotlin, SQL
Mobile Tools: Xcode, Android Studio, Fastlane, Firebase, App Store Connect, Jest

EDUCATION
B.S. in Computer Science | University of Illinois Urbana-Champaign (2017 - 2021)`,
    jdText: `DoorDash — Mobile Software Engineer (Consumer Experience)
Experience Level: 3+ years experience
Location: San Francisco / Remote

Role:
Deliver magical food and grocery delivery experiences directly into consumer hands.

Requirements:
- 3+ years of professional mobile engineering experience.
- Proficiency in React Native or native mobile development (Swift or Kotlin).
- Solid grasp of mobile app lifecycle, offline caching, and responsive UI design.
- Experience publishing and maintaining production apps on Apple App Store or Google Play Store.
- Passion for smooth 60fps scrolling, micro-animations, and client-side performance.`,
  },

  // 10. QA / SDET (4 years) + Test Automation Lead JD
  {
    id: '10_qa_sdet',
    title: 'SDET Automation Engineer (4 YOE) & QA Lead JD',
    archetype: 'qa_sdet',
    metadata: {
      expectedSeniority: 'mid',
      expectedOrGroups: [['cypress', 'playwright', 'selenium']],
      wordCountBucket: 'standard',
    },
    resumeText: `Elena Rostova
elena.rostova.sdet@gmail.com | +1 (206) 555-0199
github.com/elena-qa | linkedin.com/in/elena-rostova-qa

SUMMARY
Software Development Engineer in Test (SDET) with 4 years of experience architecting automated regression test suites, continuous integration testing gates, and API performance load tests.

EXPERIENCE
Senior QA Automation Engineer | Expedia Group
November 2022 - Present | Seattle, WA
- Designed scalable end-to-end browser automation framework in TypeScript and Playwright, executing 1,400 daily test scenarios across 5 browsers.
- Parallelized test execution using Docker containers in GitHub Actions, slashing suite run time from 55 minutes to 8 minutes.
- Authored REST API verification suites in Java with REST Assured, catching 72 critical integration defects before staging deployment.

QA Automation Engineer | Slalom Build
July 2020 - October 2022 | Chicago, IL
- Automated web regression test suites using Selenium WebDriver and Cypress for healthcare enterprise portal.
- Conducted performance stress testing using k6, identifying database thread pool bottlenecks under 5,000 concurrent virtual users.

TECHNICAL SKILLS
Test Frameworks: Playwright, Cypress, Selenium WebDriver, Jest, REST Assured, k6
Programming: TypeScript, JavaScript, Java, Python, SQL
DevOps & Tools: Docker, GitHub Actions, Jenkins, Postman, Git, Jira

EDUCATION
B.S. in Software Engineering | DePaul University (2016 - 2020)`,
    jdText: `Atlassian — Senior SDET (Engineering Quality)
Experience Level: 3-5 years experience
Location: Mountain View / Remote

Position Overview:
Atlassian is looking for an experienced SDET to elevate quality standards across Jira and Confluence release pipelines.

Requirements:
- 3 to 5 years of automated test development and quality engineering experience.
- Hands-on expertise building automation frameworks with Playwright, Cypress, or Selenium.
- Strong coding skills in TypeScript, JavaScript, or Java.
- Proven experience with CI/CD test automation pipelines and distributed execution.
- Working familiarity with API load and performance testing (k6, JMeter).`,
  },

  // 11. Career Switcher + Associate SWE JD
  {
    id: '11_career_switcher',
    title: 'Career Switcher (Bootcamp + Mechanical) & Associate SWE JD',
    archetype: 'career_switcher',
    metadata: {
      expectedSeniority: 'entry',
      expectedOrGroups: [['python', 'java', 'c++']],
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.Tech'],
    },
    resumeText: `Tariq Al-Mansoor
tariq.mansoor.dev@gmail.com | +1 (512) 334-5566
github.com/tariq-mansoor | linkedin.com/in/tariq-almansoor

PROFESSIONAL SUMMARY
Mechanical Engineer turned Software Developer after completing intensive 900-hour Full-Stack Software Engineering immersive. Combines rigorous analytical mindset with modern Python, Django, and cloud application skills.

TECHNICAL PROJECTS
InventoryFlow — Warehouse Resource Planner
- Architected full-stack inventory management web system using Python, Django, and PostgreSQL.
- Implemented real-time barcode scanning REST APIs and automated purchase order generation for 200+ SKU lines.
- Deployed application on AWS EC2 with automated Docker Compose configuration and Nginx reverse proxy.

FleetTracker — IoT Vehicle Telemetry Dashboard
- Developed live GPS tracking web application utilizing Python, FastAPI, and WebSockets.
- Created interactive map interface rendering vehicle locations with sub-second latency updates.

EDUCATION & CREDENTIALS
Software Engineering Immersive Certificate | General Assembly (2024)
B.S. in Mechanical Engineering | Texas A&M University (2017 - 2021)
AWS Certified Cloud Practitioner (2024)

TECHNICAL SKILLS
Languages: Python, JavaScript, SQL, HTML5, CSS3
Frameworks: Django, FastAPI, React, Node.js
Databases & Cloud: PostgreSQL, SQLite, AWS (EC2, S3), Docker, Git, Linux`,
    jdText: `Amazon — Associate Software Development Engineer (SDE I)
Experience Level: Entry Level / Associate (0-1 year experience)
Location: Austin, TX / Seattle, WA

Role Overview:
Amazon is seeking Associate Software Development Engineers who possess strong fundamentals and passion for technology. We welcome university graduates, coding academy graduates, and career transitioners with strong coding fundamentals.

Basic Qualifications:
- Bachelor's degree in Computer Science or equivalent practical coding experience.
- Programming proficiency in Python, Java, or C++.
- Solid understanding of Object-Oriented Programming (OOP) and Data Structures.
- Demonstrated ability to build working web applications or technical projects.
- Willingness to learn distributed cloud architectures on AWS.`,
  },

  // 12. Multi-column Table Layout + Bloomberg Application Engineer
  {
    id: '12_tables_columns_layout',
    title: 'Multi-column Table Layout Resume & Financial Systems JD',
    archetype: 'tables_columns',
    metadata: {
      expectedSeniority: 'mid',
      hasTablesOrColumns: true,
      wordCountBucket: 'standard',
      exclusionTokensPresent: ['B.Sc.'],
      subStringPairsPresent: [{ child: 'c', parent: 'c++' }],
    },
    resumeText: `Chloe Martin | chloe.martin.finance@gmail.com | +1 (212) 901-4455 | New York, NY
================================================================================
| SUMMARY: Software Engineer with 3.5 years developing high-throughput trading tools
================================================================================
| CORE SKILLS                               | WORK EXPERIENCE
| Languages: C++, Java, Python, SQL         | Software Engineer | Point72 (2022-Present)
| Databases: PostgreSQL, Redis, InfluxDB    | - Developed equity market-data parser in C++
| Tools: Linux, Git, Docker, CMake, Bash    |   processing 80,000 order ticks/sec.
| Concepts: Multi-threading, Low-Latency    | - Built analytics cache in Redis cutting query
|                                           |   latency from 25ms to 3ms.
================================================================================
| PREVIOUS ROLES                            | EDUCATION
| Associate Developer | FactSet (2021-2022) | B.S. in Computer Science & Mathematics
| - Maintained Java financial reporting APIs| New York University (NYU) (2017 - 2021)
| - Optimized SQL views across 20M records. | GPA: 3.8 / 4.0
================================================================================`,
    jdText: `Bloomberg — Senior Application Engineer (Market Data Feed)
Experience Level: 3+ years experience
Location: New York, NY

The Role:
Join the team responsible for processing real-time market data ticks from global financial exchanges.

Requirements:
- 3+ years of software development experience in low-latency environments.
- Strong proficiency in C++ or Java on Linux systems.
- Demonstrated experience with multi-threading, concurrency, and memory management.
- Solid understanding of data structures, network protocols (TCP/UDP), and relational databases.`,
  },

  // 13. Resume with NO Skills Section + Shopify Backend
  {
    id: '13_no_skills_section',
    title: 'Resume with No Skills Section Header & Shopify Backend JD',
    archetype: 'no_skills_section',
    metadata: {
      expectedSeniority: 'junior',
      hasNoSkillsSection: true,
      expectedOrGroups: [['ruby', 'go', 'python']],
      wordCountBucket: 'standard',
    },
    resumeText: `Devansh Mehta
devansh.mehta.dev@gmail.com | +1 (416) 789-0123 | Toronto, ON
github.com/devanshm | linkedin.com/in/devansh-mehta

PROFESSIONAL EXPERIENCE

Backend Developer | Flipp Retail Tech
August 2023 - Present | Toronto, Canada
- Built merchant catalog ingestion workers in Go, processing 500,000 product updates daily.
- Implemented asynchronous queue consumer using Redis and RabbitMQ with automatic poison-pill message dead-lettering.
- Containerized backend microservices using Docker and deployed automated Kubernetes pods on Google Cloud Platform.

Junior Software Developer | Wave Financial
May 2022 - July 2023 | Toronto, Canada
- Maintained core invoicing web services written in Python and Django over PostgreSQL.
- Refactored payment receipt generation endpoints, cutting execution time by 40% via bulk SQL batch queries.
- Authored comprehensive test suites with PyTest and integrated automated pull-request validation via GitHub Actions.

PROJECTS
DistributeCache — Distributed In-Memory Cache
- Built high-performance distributed key-value cache in Go implementing Raft consensus and LRU eviction policy.

EDUCATION
Bachelor of Computer Science | University of Waterloo (2018 - 2022)`,
    jdText: `Shopify — Backend Software Engineer (Merchant Solutions)
Experience Level: 2-4 years experience
Location: Remote / Toronto

About Shopify:
Shopify powers millions of businesses worldwide. We build reliable, performant services capable of handling flash-sale traffic surges.

Qualifications:
- 2 to 4 years of software development experience building scalable backend web applications.
- Experience writing clean, maintainable code in Ruby, Go, or Python.
- Working knowledge of relational databases (PostgreSQL or MySQL) and key-value storage (Redis).
- Familiarity with asynchronous task processing, distributed transactions, and queue architectures.
- Experience operating containerized systems with Docker and automated testing frameworks.`,
  },

  // 14. Extreme Lengths (Very Brief Fresher & Narrative YC Startup JD)
  {
    id: '14_short_and_long_extremes',
    title: 'Very Brief Resume (160 words) & YC Startup Narrative JD',
    archetype: 'extremes_narrative',
    metadata: {
      expectedSeniority: 'entry',
      wordCountBucket: 'brief',
      exclusionTokensPresent: ['B.Tech'],
    },
    resumeText: `Samir Khan
samir.khan.cs@gmail.com | +91 9811223344
github.com/samirkhan

OBJECTIVE
Motivated software engineer with foundational Python and web skills.

EDUCATION
B.Tech in Computer Science, 2026 Batch
Apex Engineering College, CGPA: 7.8

TECHNICAL SKILLS
Languages: Python, JavaScript, HTML, CSS, SQL
Tools: Git, VS Code, Linux

PROJECTS
TaskMaster App
- Built task management web app using Python and Flask.
- Implemented user registration, session management, and task filtering.

WeatherDash
- Created responsive weather dashboard consuming open weather REST API.
- Displayed temperature forecasts and city search history using JavaScript.`,
    jdText: `Founding Full-Stack Engineer at AgentFlow (YC W25)
Location: San Francisco / Remote
Compensation: $110k - $140k + 1.0% - 2.5% Equity

About AgentFlow:
We are building autonomous agents for complex supply chain logistics. We are an early-stage team moving fast. We don't care about years of pedigree or corporate buzzwords. We care about curiosity, speed of execution, and love for shipping real software that customers use every day.

What You Will Do:
You will build full-stack web applications, integrate frontier LLM APIs, design scalable database models, and talk directly to warehouse operators to solve daily friction. If you love building software from first principles in Python, TypeScript, or modern web frameworks, we want to hear from you.`,
  },
];
