// ============================================================
// Suite Compare — Curated Real-World Job Description Presets
// Authentic, calibrated production engineering job descriptions
// with realistic tech stacks, requirements, CTC, and seniority
// ============================================================

import { JDInput } from './compareJDs';

export interface ComparisonPreset {
  id: string;
  title: string;
  category: 'big_tech' | 'fintech_ecommerce' | 'ai_data' | 'startup_growth';
  badge: string;
  description: string;
  jdA: JDInput;
  jdB: JDInput;
  strategicContext: string;
  keyDivergenceSummary: string;
}

export interface CandidatePersona {
  id: string;
  name: string;
  role: string;
  experience: string;
  skillsHeadline: string;
  resumeText: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'preset-google-microsoft',
    title: 'Google (L3 SDE) vs Microsoft (SDE II)',
    category: 'big_tech',
    badge: 'Tier S Big Tech',
    description: 'Compare entry/early-mid distributed systems engineering at Google with full-stack cloud platforms at Microsoft.',
    strategicContext: 'Google leans heavily on algorithmic efficiency, language-agnostic distributed primitives, and concurrency. Microsoft demands solid TypeScript/React, microservices orchestration, and enterprise relational database resilience.',
    keyDivergenceSummary: 'Google evaluates algorithmic data structures and low-level concurrency; Microsoft evaluates hands-on TypeScript microservices, Docker, and SQL schema tuning.',
    jdA: {
      id: 'jd-google-l3',
      label: 'Google — Software Engineer L3 (Distributed Systems)',
      company: 'Google',
      roleTitle: 'Software Engineer L3 (Distributed Systems)',
      experienceLevel: '1–3 Years Experience (Early Career)',
      location: 'Bangalore / Hyderabad, India (Hybrid)',
      salaryRange: '₹32,00,000 – ₹42,00,000 CTC + Stocks',
      marketTier: 'Tier S (Global Tech)',
      text: `About the Role:
Google is seeking a Software Engineer L3 to join our Core Infrastructure & Distributed Services group. In this role, you will design, implement, and maintain high-throughput distributed systems that power global infrastructure used by billions of daily active users.

Responsibilities:
- Write clean, maintainable, and high-performance code across multi-threaded distributed microservices.
- Design data structures and algorithmic solutions that minimize p99 latency and network overhead.
- Partner with site reliability and product teams to implement automated regression testing, CI/CD pipelines, and telemetry dashboards.
- Manage individual project deliverables, triage production bottlenecks, and author clear technical architecture proposals.

Minimum Requirements:
- Bachelor's or Master's degree in Computer Science, Electrical Engineering, or related technical field.
- 1+ years of production experience in software engineering with Java, C++, Go, or Python.
- Proven command of foundational computer science principles: data structures, algorithm design, memory management, and computational complexity.
- Experience building and consuming scalable REST or gRPC APIs.

Preferred Qualifications:
- Hands-on experience with distributed systems primitives (consensus protocols, sharding, replication, asynchronous queues).
- Experience with cloud platform architectures (GCP, AWS, or Azure) and containerized deployments using Docker and Kubernetes.
- Familiarity with relational or distributed databases (PostgreSQL, Spanner, Redis) and distributed tracing tools.`,
    },
    jdB: {
      id: 'jd-msft-sde2',
      label: 'Microsoft — Software Engineer II (Cloud & Web Platforms)',
      company: 'Microsoft',
      roleTitle: 'Software Engineer II (Cloud & Web Platforms)',
      experienceLevel: '2–4 Years Experience (Mid-Level SDE)',
      location: 'Bangalore / Noida, India (Hybrid)',
      salaryRange: '₹28,00,000 – ₹38,00,000 CTC + Benefits',
      marketTier: 'Tier S (Global Tech)',
      text: `About the Role:
Microsoft Azure & Modern Web experiences is hiring a Software Engineer II to architect customer-facing enterprise services, high-availability microservices, and reactive web interfaces. You will work on software products that empower millions of commercial enterprises globally.

Responsibilities:
- Architect, build, and deploy resilient web applications and microservices using TypeScript, Node.js, and modern React.
- Design and optimize relational database models in PostgreSQL or SQL Server with indexing and connection pooling.
- Ensure end-to-end software quality with comprehensive automated integration tests, Jest/Cypress testing, and automated GitHub CI/CD workflows.
- Champion operational excellence, monitor service telemetry via Azure Monitor / Prometheus, and resolve production incidents.

Minimum Requirements:
- 2+ years of professional software engineering experience delivering customer-facing web services or full-stack platforms.
- Strong proficiency in modern TypeScript, JavaScript (ES6+), React, and Node.js backend services.
- Solid working knowledge of relational database design, SQL query optimization, and transaction isolation.
- Experience with Git version control, RESTful API design standards, and automated testing frameworks.

Preferred Qualifications:
- Production exposure to containerization using Docker and container orchestrators (Kubernetes / AKS).
- Experience with Redis caching strategies, asynchronous messaging queues (Kafka or RabbitMQ), and cloud deployment pipelines.
- Knowledge of web accessibility (WCAG), bundle optimization, and security practices (OWASP Top 10).`,
    },
  },
  {
    id: 'preset-razorpay-flipkart',
    title: 'Razorpay (Payments Backend) vs Flipkart (Full Stack SDE II)',
    category: 'fintech_ecommerce',
    badge: 'Tier 1 Indian Flagships',
    description: 'Compare mission-critical fintech transactional systems with massive-scale e-commerce consumer checkout platforms.',
    strategicContext: 'Razorpay requires strict ACID compliance, idempotency, Java/Golang microservices, and distributed locking. Flipkart prioritizes high-throughput consumer web apps, React performance, Redis caches, and Kafka event streaming.',
    keyDivergenceSummary: 'Razorpay focuses on financial reconciliation, payment gateways, and backend zero-data-loss; Flipkart focuses on high-concurrency consumer UI, microservices, and event queues.',
    jdA: {
      id: 'jd-razorpay-payments',
      label: 'Razorpay — Backend SDE (Payments Core & Gateway)',
      company: 'Razorpay',
      roleTitle: 'Software Development Engineer (Payments Core)',
      experienceLevel: '2–4 Years Experience',
      location: 'Bangalore, India (Onsite / Hybrid)',
      salaryRange: '₹24,00,000 – ₹34,00,000 CTC',
      marketTier: 'Tier 1 (Fintech Unicorn)',
      text: `About the Role:
Razorpay is India's premier payments and financial infrastructure platform. As a Backend SDE in the Payments Core team, you will engineer ultra-low-latency transaction pipelines processing over 10,000 payments per second with five-nines (99.999%) availability.

Responsibilities:
- Build fault-tolerant, idempotent transaction processing engines and settlement pipelines.
- Design low-latency REST and gRPC microservices in Java, Go, or Node.js.
- Ensure zero data loss through distributed transaction patterns (Saga, 2PC) and strict ACID PostgreSQL relational management.
- Integrate banking network APIs, handle webhook callbacks, and prevent payment double-spend scenarios.

Requirements:
- 2+ years of backend engineering experience with strong proficiency in Java, Go, or Node.js.
- Solid expertise in relational database architecture, schema migrations, and indexing strategies in PostgreSQL or MySQL.
- Practical experience with Redis caching, distributed locks, and message brokers (Kafka, RabbitMQ, or SQS).
- Strong computer science foundation in data structures, concurrency, and API security (JWT, mutual TLS).

Preferred:
- Experience with Docker containerization, Kubernetes deployments, and Prometheus/Grafana monitoring.
- Familiarity with fintech regulations (PCI-DSS, tokenization standards, and RBI security circulars).`,
    },
    jdB: {
      id: 'jd-flipkart-fullstack',
      label: 'Flipkart — SDE II (Consumer Marketplace & Checkout)',
      company: 'Flipkart',
      roleTitle: 'Software Development Engineer II (Full Stack)',
      experienceLevel: '2–4 Years Experience',
      location: 'Bangalore, India (Hybrid)',
      salaryRange: '₹26,00,000 – ₹36,00,000 CTC + ESOPs',
      marketTier: 'Tier 1 (E-Commerce Leader)',
      text: `About the Role:
Flipkart is looking for an SDE II to build scalable consumer checkout journeys, catalog browsing, and real-time inventory systems handling millions of peak requests during Big Billion Days.

Responsibilities:
- Develop high-performance client applications in React and TypeScript alongside scalable backend microservices.
- Optimize web vitals, server-side rendering (SSR), and bundle split sizes to ensure sub-second page loads across tier-2/3 Indian cellular networks.
- Build resilient backend microservices in Node.js or Java that integrate with distributed inventory and order management systems.
- Collaborate with product designers, QA engineers, and infrastructure architects to ship features weekly.

Requirements:
- 2+ years of full stack software engineering experience building production web platforms.
- Deep expertise in React, TypeScript, state management (Redux/Zustand), and modern CSS frameworks.
- Strong proficiency in Node.js, Express, or Java backend microservices and RESTful API development.
- Hands-on experience with SQL databases (MySQL/PostgreSQL) and in-memory caches (Redis).

Preferred:
- Experience with Docker, CI/CD automation with GitHub Actions, and cloud deployment pipelines.
- Familiarity with event-driven architectures using Apache Kafka and micro-frontend design patterns.`,
    },
  },
  {
    id: 'preset-swiggy-uber',
    title: 'Swiggy (ML Engineer) vs Uber (Data Platform Engineer)',
    category: 'ai_data',
    badge: 'Applied AI & Data Platform',
    description: 'Compare applied recommender systems & real-time ETA inference with massive-scale distributed streaming data platform infrastructure.',
    strategicContext: 'Swiggy emphasizes feature engineering, PyTorch models, real-time ranking, and ML serving latency. Uber requires Apache Kafka, Spark, distributed streaming, telemetry, and distributed storage pipelines.',
    keyDivergenceSummary: 'Swiggy tests ML modeling, feature stores, and inference latency; Uber tests distributed streaming pipelines, Kafka partitions, and data lake storage.',
    jdA: {
      id: 'jd-swiggy-mle',
      label: 'Swiggy — Machine Learning Engineer (Discovery & Ranking)',
      company: 'Swiggy',
      roleTitle: 'Machine Learning Engineer (Discovery & Ranking)',
      experienceLevel: '2–4 Years Experience',
      location: 'Bangalore, India (Hybrid)',
      salaryRange: '₹28,00,000 – ₹38,00,000 CTC',
      marketTier: 'Tier 1 (Consumer Tech)',
      text: `About the Role:
Swiggy's Consumer Intelligence team is seeking a Machine Learning Engineer to build recommendation systems, search relevance models, and personalized restaurant ranking algorithms driving hundreds of millions in order value.

Responsibilities:
- Train, evaluate, and deploy deep learning and gradient boosted decision tree (GBDT) models for personalization and ranking.
- Engineer real-time and offline feature pipelines using Python, SQL, and feature stores (Feast).
- Package and deploy models as low-latency microservices using FastAPI, Docker, and Triton Inference Server.
- Run rigorous online A/B testing, monitor model drift, and conduct automated model re-training.

Requirements:
- 2+ years of production experience in machine learning and data engineering using Python.
- Strong proficiency in ML frameworks: PyTorch, TensorFlow, Scikit-learn, and XGBoost/LightGBM.
- Solid experience writing optimized SQL queries and data manipulation with Pandas and NumPy.
- Understanding of production API serving, Docker containers, and software engineering best practices.

Preferred:
- Experience with distributed computing (Apache Spark), streaming feature extraction (Kafka), and cloud ML infrastructure (AWS SageMaker).
- Solid theoretical grounding in learning-to-rank (LTR), collaborative filtering, and embeddings.`,
    },
    jdB: {
      id: 'jd-uber-data-platform',
      label: 'Uber — Data Platform Engineer (Streaming & Telemetry)',
      company: 'Uber',
      roleTitle: 'Data Platform Engineer (Streaming & Telemetry)',
      experienceLevel: '2–5 Years Experience',
      location: 'Hyderabad / Bangalore, India (Hybrid)',
      salaryRange: '₹34,00,000 – ₹46,00,000 CTC + RSU Grants',
      marketTier: 'Tier S (Global Tech)',
      text: `About the Role:
Uber is hiring a Data Platform Engineer to design, scale, and maintain our global streaming data bus and analytics infrastructure that ingests petabytes of vehicle telemetry, trip events, and marketplace metrics daily.

Responsibilities:
- Architect and operate large-scale distributed streaming pipelines using Apache Kafka, Apache Flink, and Spark Streaming.
- Build fault-tolerant ingestion services in Java, Go, or Python that process billions of events per second with sub-second latency.
- Optimize distributed storage formats (Parquet, Apache Hudi) and query performance on analytical data lakes.
- Build monitoring tools and auto-remediation scripts for cluster health, partition re-balancing, and backpressure detection.

Requirements:
- 2+ years of hands-on data engineering or systems infrastructure experience in Java, Go, or Python.
- Deep expertise in distributed message queues (Apache Kafka internals, consumer groups, partition tuning).
- Strong understanding of distributed systems principles, data consistency, and Linux system performance.
- Experience with SQL and analytical data processing engines (Spark, Presto, or Snowflake).

Preferred:
- Experience with Docker, Kubernetes cluster deployments, and Terraform infrastructure-as-code.
- Knowledge of stream-table duality, exactly-once processing semantics, and schema registries.`,
    },
  },
  {
    id: 'preset-cred-zepto',
    title: 'CRED (Senior Frontend) vs Zepto (Founding Product Engineer)',
    category: 'startup_growth',
    badge: 'Product & Design Systems',
    description: 'Compare high-polish, micro-animated consumer mobile-web interfaces with lightning-fast quick-commerce startup delivery.',
    strategicContext: 'CRED emphasizes 60fps micro-animations, design tokens, TypeScript, and state management. Zepto requires end-to-end full stack velocity, Node/Go services, PostgreSQL, and instant prototyping.',
    keyDivergenceSummary: 'CRED tests UI fidelity, CSS performance, and React component architecture; Zepto tests full-stack speed, PostgreSQL querying, and delivery under tight deadlines.',
    jdA: {
      id: 'jd-cred-frontend',
      label: 'CRED — Senior Frontend Engineer (Design Systems & Web)',
      company: 'CRED',
      roleTitle: 'Frontend Engineer (Design Systems & Web)',
      experienceLevel: '2–4 Years Experience',
      location: 'Bangalore, India (Onsite)',
      salaryRange: '₹26,00,000 – ₹36,00,000 CTC',
      marketTier: 'Tier 1 (Fintech / Design-Led)',
      text: `About the Role:
CRED is looking for a craft-obsessed Frontend Engineer who bridges the gap between state-of-the-art visual design and high-performance client engineering. You will create buttery-smooth web and webview experiences for India's top creditworthy community.

Responsibilities:
- Build fluid, 60fps responsive interfaces and custom design system primitives using React, TypeScript, and modern CSS.
- Implement complex micro-interactions, canvas/SVG animations, and accessible component architectures.
- Partner with product designers and frontend architects to build reusable, themeable component libraries.
- Optimize rendering performance, minimize re-renders, and ensure cross-browser consistency across mobile webviews.

Requirements:
- 2+ years of production experience in frontend web development using React and TypeScript.
- Mastery of CSS3, flexbox, grid, animations, and CSS-in-JS or Tailwind CSS styling.
- Strong understanding of JavaScript engine internals, the event loop, DOM rendering tree, and browser performance profiling.
- Deep appreciation for design consistency, typography, accessibility (a11y), and interaction feedback.

Preferred:
- Experience with Next.js, Webpack/Vite bundle analysis, and progressive web applications (PWAs).
- Familiarity with state management libraries (Zustand, Jotai) and automated UI testing with Storybook.`,
    },
    jdB: {
      id: 'jd-zepto-product',
      label: 'Zepto — Product Software Engineer (Full Stack Delivery)',
      company: 'Zepto',
      roleTitle: 'Software Engineer (Quick Commerce Growth & Delivery)',
      experienceLevel: '1–3 Years Experience',
      location: 'Mumbai / Bangalore, India (Onsite)',
      salaryRange: '₹22,00,000 – ₹32,00,000 CTC + High ESOPs',
      marketTier: 'High-Growth Unicorn',
      text: `About the Role:
Zepto is India's fastest-growing quick-commerce unicorn delivering groceries in 10 minutes. As a Product Engineer, you will build and scale the software that powers dark-store picking, rider routing, and real-time inventory management.

Responsibilities:
- Deliver end-to-end user features across React web/mobile applications and Node.js or Golang backend services.
- Work directly with product managers and operations leads to prototype, test, and ship features within days.
- Design relational database tables, transactions, and stored queries in PostgreSQL.
- Maintain high service uptime during sudden order spikes, flash sales, and delivery rush hours.

Requirements:
- 1+ years of software development experience across the full stack (React + Node.js/Golang or Python).
- Proficiency with TypeScript or modern JavaScript, REST APIs, and responsive web development.
- Practical experience with relational databases (PostgreSQL or MySQL) and basic indexing.
- Startup mindset: high agency, ability to navigate ambiguity, and passion for rapid shipping.

Preferred:
- Hands-on experience with Docker, AWS/GCP services, and Redis in-memory caches.
- Exposure to real-time communication via WebSockets or MQTT.`,
    },
  },
];

export const SAMPLE_CANDIDATES: CandidatePersona[] = [
  {
    id: 'persona-arjun',
    name: 'Arjun Mehta',
    role: 'Full Stack Engineer',
    experience: '3 Years Experience',
    skillsHeadline: 'React, TypeScript, Node.js, PostgreSQL, Redis, REST APIs, Git, Docker (Basic)',
    resumeText: `Arjun Mehta | arjun.mehta@email.com | +91 98765 43210 | Bangalore, India | linkedin.com/in/arjun-mehta | github.com/arjunmehta

SUMMARY:
Software Engineer with 3 years of production experience designing and building scalable web applications and microservices. Strong proficiency in TypeScript, React, Node.js, and PostgreSQL with a solid grasp of data structures and cloud deployments. Proven track record of improving API latency by 42% and building mission-critical checkout workflows.

WORK EXPERIENCE:
Software Engineer | CloudTech Solutions Pvt. Ltd., Bangalore | July 2023 – Present
- Architected and deployed scalable full-stack features using React 18, TypeScript, and Node.js microservices serving 120,000 monthly active users.
- Designed normalized relational database schemas in PostgreSQL with B-tree indexing and connection pooling, reducing p95 query times from 240ms to 45ms.
- Built asynchronous task processing pipelines using Redis queues for automated invoice generation and email notifications.
- Integrated automated CI/CD pipelines using GitHub Actions and containerized microservices with Docker, reducing deployment cycle times by 60%.
- Implemented JWT-based authentication, role-based access control (RBAC), and rate-limiting middleware to protect sensitive customer endpoints.

Associate Software Engineer | NexaDigital Technologies, Pune | August 2021 – June 2023
- Developed responsive web interfaces using React, Redux Toolkit, and Tailwind CSS adhering to WCAG 2.1 AA accessibility guidelines.
- Created reusable RESTful endpoints using Express.js and Node.js with comprehensive Joi schema validations.
- Wrote unit and integration tests using Jest and React Testing Library, achieving 84% test coverage across core payment journeys.
- Collaborated in an agile team of 8 engineers, participating in daily standups, sprint retrospectives, and peer code reviews.

TECHNICAL SKILLS:
- Languages & Frameworks: TypeScript, JavaScript (ES6+), React.js, Node.js, Express.js, HTML5, CSS3, Tailwind CSS
- Databases & Caching: PostgreSQL, MySQL, Redis, MongoDB
- Tools & Cloud: Docker (Intermediate), Git, GitHub Actions, AWS (S3, EC2 basic), Postman, Linux CLI
- Core Competencies: Data Structures & Algorithms, RESTful API Design, Microservices, System Design fundamentals

EDUCATION:
B.Tech in Computer Science and Engineering | Pune Institute of Computer Technology (PICT) | 2017 – 2021 | CGPA: 8.4/10

PROJECTS:
Distributed Event Registry | github.com/arjunmehta/event-registry
- Built a fault-tolerant webhook ingestion engine in Node.js and TypeScript handling 2,500 payload events/sec with Redis queue buffering and PostgreSQL persistence.`,
  },
  {
    id: 'persona-priya',
    name: 'Priya Sharma',
    role: 'Backend SDE (Java & Cloud)',
    experience: '2.5 Years Experience',
    skillsHeadline: 'Java, Spring Boot, Microservices, PostgreSQL, Kafka, AWS, Docker, Kubernetes',
    resumeText: `Priya Sharma | priya.sharma@email.com | +91 91234 56789 | Hyderabad, India | github.com/priyasharma

SUMMARY:
Backend Software Engineer with 2.5 years of experience engineering high-throughput distributed microservices in Java, Spring Boot, and PostgreSQL. Experienced in event-driven streaming with Apache Kafka, Docker containerization, and AWS cloud infrastructure.

WORK EXPERIENCE:
Backend Engineer | Zeta FinServe, Hyderabad | January 2023 – Present
- Designed resilient financial ledger microservices using Java 17 and Spring Boot processing ₹15 Cr in daily transactional settlements.
- Implemented event-driven message consumption using Apache Kafka with custom partitioning keys to preserve strict transaction ordering.
- Optimized PostgreSQL relational queries, authored complex stored procedures, and resolved concurrency lock contentions.
- Deployed microservices into Kubernetes clusters on AWS (EKS) using Helm charts and automated ArgoCD gitops pipelines.

Junior Backend Developer | Infosys Ltd., Bangalore | July 2021 – December 2022
- Developed enterprise REST APIs in Java using Spring MVC and Hibernate/JPA ORM with Oracle and MySQL backends.
- Conducted unit testing with JUnit 5 and Mockito, ensuring reliable error handling and logging using Logback and ELK stack.

TECHNICAL SKILLS:
- Languages: Java (8/11/17), SQL, Go (Beginner), Python (Scripting)
- Frameworks: Spring Boot, Spring Data JPA, Hibernate, JUnit, Mockito
- Systems & Middleware: Apache Kafka, Redis, PostgreSQL, MySQL, Docker, Kubernetes, AWS (EKS, RDS, S3)
- Foundations: Distributed Transactions, ACID properties, Multithreading, Algorithms

EDUCATION:
B.Tech in Information Technology | Osmania University College of Engineering | 2017 – 2021 | CGPA: 8.7/10`,
  },
];
