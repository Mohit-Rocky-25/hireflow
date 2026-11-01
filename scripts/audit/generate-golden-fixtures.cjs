const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const goldenDir = path.resolve(__dirname, '../../tests/fixtures/golden');
fs.mkdirSync(goldenDir, { recursive: true });

// 1. Single Column Resume Text & PDF
const resume01 = `ADITYA SHARMA
Bengaluru, India | +91 98765 43210 | aditya.sharma@example.com | linkedin.com/in/aditya-sharma | github.com/aditya-dev

EDUCATION
Indian Institute of Information Technology, Allahabad
B.Tech in Computer Science and Engineering | CGPA: 8.85 / 10.0 (2022 - 2026)

EXPERIENCE
Software Engineering Intern | Groww India | Bengaluru
May 2025 - July 2025
- Engineered real-time mutual fund transaction ledger processing 15,000 requests/minute using Go and Apache Kafka.
- Reduced PostgreSQL query latency by 38% through composite indexing and query plan restructuring.
- Built automated reconciliation pipeline verifying end-of-day balances across payment gateway webhooks.

PROJECTS
Distributed KV Store | Go, Raft Consensus, gRPC
- Implemented leader election, log replication, and heartbeat fault-detection protocol adhering to Raft specification.
- Benchmarked cluster throughput reaching 42,000 write ops/sec across 5 distributed node replicas with sub-15ms latency.
- Containerized deployment using Docker and wrote end-to-end chaos testing harnesses simulating network partitions.

HireFlow Resume Analyzer | TypeScript, React 19, Tailwind CSS
- Developed client-side ATS scoring engine performing deterministic regex parsing and skill extraction.
- Engineered multi-column PDF layout boundary detection to preserve reading order of candidate metadata.
- Automated client-side performance audits achieving 100/100 Lighthouse score with zero external telemetry.

TECHNICAL SKILLS
Languages: Go, Java, TypeScript, C++, SQL, Python
Frameworks & Libraries: Spring Boot, React, Next.js, Express, Tailwind CSS
Databases & Tools: PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, Git, Linux
`;

// 2. Two-Column Overleaf Style Resume Text
const resume02 = `PRIYA VENKATESH
Chennai, India | priya.v@example.com | +91 91234 56789 | github.com/priyav-code

[LEFT COLUMN - EXPERIENCE & PROJECTS]
EXPERIENCE
Full Stack Developer Intern | Freshworks | Chennai (Jan 2025 - Jun 2025)
- Designed ticketing automation workflows handling 50k events daily using Node.js and Redis.
- Implemented role-based access control (RBAC) with JWT tokens and refreshed security audits.
- Migrated legacy AngularJS modules to modern React with TypeScript.

PROJECTS
Next.js E-Commerce Engine | Next.js 15, PostgreSQL, Stripe
- Built full-stack retail portal featuring server actions, Supabase Row-Level Security, and optimistic UI updates.
- Integrated automated webhook handlers processing idempotent order payments with retry queues.

Cloud Event Bus | Python, AWS Lambda, DynamoDB
- Architected serverless event routing service managing asynchronous subscriber notifications.

[RIGHT COLUMN - SKILLS & EDUCATION]
EDUCATION
Anna University, CEG Campus
B.E. Computer Science (2021 - 2025) | CGPA: 9.1 / 10

SKILLS
- Languages: JavaScript, TypeScript, Python, Java
- Frontend: React, Next.js, Redux Toolkit, Tailwind
- Backend: Node.js, Express, FastAPI, Spring Boot
- Cloud/DB: AWS, Docker, PostgreSQL, MongoDB, Redis
`;

// 3. Sidebar Layout Resume Text
const resume03 = `ROHAN VERMA
Pune, Maharashtra | rohan.verma@example.com | +91 98220 12345

[SIDEBAR - 30% WIDTH]
CONTACT
Pune, India
github.com/rohan-v
linkedin.com/in/rohanverma

TECHNICAL SKILLS
- Core Java, Python, C++
- Spring Boot 3, Hibernate
- REST APIs, Microservices
- MySQL, PostgreSQL, Redis
- Git, Docker, Maven, CI/CD

EDUCATION
Pune Institute of Computer Technology (PICT)
B.E. Information Technology (2022 - 2026) | CGPA: 8.4

[MAIN CONTENT - 70% WIDTH]
PROFILE
Software engineering student specializing in Java enterprise microservices and scalable cloud backends.

EXPERIENCE
Backend Intern | Persistent Systems (May 2025 - Jul 2025)
- Developed REST microservices using Spring Boot 3 and Java 21 for healthcare claims processing.
- Wrote JUnit 5 and Mockito test suites achieving 88% branch coverage across domain logic.
- Optimized JPA queries reducing database round-trips by 45%.

ACADEMIC PROJECTS
Scalable Banking Ledger | Java, Spring Cloud, Kafka
- Implemented double-entry accounting ledger with ACID compliance and idempotency keys.
- Handled bank transfer requests with distributed transactions and saga pattern compensation.
`;

// 4. Table-Heavy Resume Text
const resume04 = `MEERA NAIR
Bengaluru, India | meera.nair@example.com | +91 99887 76655 | github.com/meeranair

ACADEMIC QUALIFICATIONS
| Degree / Course | Institution | Board / University | Year | Percentage / CGPA |
| B.Tech (ECE) | NIT Calicut | Autonomous | 2021-2025 | 8.62 CGPA |
| Class XII | Kendriya Vidyalaya | CBSE | 2021 | 94.2% |
| Class X | Kendriya Vidyalaya | CBSE | 2019 | 95.8% |

PROJECT SUMMARY
| Project Title | Technologies Used | Key Contribution | Outcome |
| IoT Fleet Telemetry | C++, FreeRTOS, MQTT, AWS IoT | Designed firmware and telemetry parser | 99.4% uptime across 50 nodes |
| Smart Grid Gateway | Python, Raspberry Pi, InfluxDB | Built edge data aggregator with TLS | 500ms real-time metric latency |

TECHNICAL PROFICIENCIES
| Domain | Proficient | Familiar |
| Languages | C, C++, Python, Embedded C | Rust, Assembly |
| Protocols | UART, SPI, I2C, CAN, MQTT | BLE, Zigbee |
| Tools & Hardware | STM32, ESP32, Keil, Git, Linux | Oscilloscope, Logic Analyzer |
`;

// 5. Stuffed-Skills Resume Text (Intentionally packed with keywords without project proof)
const resume05 = `RAJESH K
rajesh.k@example.com | +91 90000 00000

OBJECTIVE
Looking for an entry-level software engineer job in a top tech company.

SKILLS
Java, Python, C, C++, C#, JavaScript, TypeScript, Go, Rust, Ruby, PHP, Swift, Kotlin, React, Angular, Vue, Next.js, Node.js, Express, Django, Flask, Spring Boot, FastAPI, Ruby on Rails, HTML, CSS, Tailwind CSS, Bootstrap, jQuery, Docker, Kubernetes, AWS, GCP, Azure, Jenkins, Terraform, Ansible, CI/CD, Kafka, RabbitMQ, Redis, Elasticsearch, GraphQL, REST APIs, Microservices, PostgreSQL, MySQL, MongoDB, Cassandra, DynamoDB, Oracle, SQLite, Git, Linux, Jira, Agile, Scrum, DSA, Machine Learning, Deep Learning, PyTorch, TensorFlow, NLP, Computer Vision, System Design, Distributed Systems, Android, iOS.

EXPERIENCE
Academic Projects:
- Created a calculator website using HTML and CSS.
- Submitted college assignment in Python.
- Attended 2-day workshop on Cloud Computing.

EDUCATION
XYZ College of Engineering, B.Tech (2022 - 2026) | CGPA: 6.9
`;

// 6. Weak Fresher Resume Text (Sparse, vague bullets, weak action verbs)
const resume06 = `AMIT KUMAR
amit.k@example.com | +91 91111 22222 | Delhi, India

OBJECTIVE
Hardworking student seeking a challenging position to learn new technologies and grow in an IT company.

EDUCATION
ABC Institute of Technology, Greater Noida
B.Tech CSE (2021 - 2025) | CGPA: 7.1

PROJECTS
Library Management System
- Responsible for doing the frontend part of the website.
- Handled database connections and worked on forms.
- Assisted team members in testing and bug fixing.

Online Food Delivery Clone
- Worked on the UI and made pages using HTML, CSS and JS.
- Helped in connecting backend APIs.

SKILLS
C, C++, Java, HTML, CSS, JavaScript, MySQL
`;

// 7. Strong Fresher Resume Text (Metric-driven, strong verbs, deep tech ownership)
const resume07 = `SNEHA PATEL
Ahmedabad, Gujarat | sneha.patel@example.com | +91 98760 11223 | github.com/snehapatel-eng | linkedin.com/in/snehapatel-dev

EDUCATION
Nirma University, Ahmedabad
B.Tech in Computer Science and Engineering | CGPA: 9.24 / 10.0 (2022 - 2026)
Honors in Distributed Computing | Dean's Academic List (All Semesters)

EXPERIENCE
Software Engineering Intern | Zomato | Gurugram
May 2025 - July 2025
- Architected restaurant menu cache eviction pipeline with Redis Pub/Sub, dropping stale cache reads by 92%.
- Optimized Go HTTP service handling order status polling, reducing p99 latency from 140ms to 24ms.
- Wrote unit and integration tests raising core checkout service test coverage from 64% to 89%.

PROJECTS
High-Throughput Distributed Cache | Go, Consistent Hashing, HTTP/2
- Built in-memory distributed cache cluster with MurmurHash3 consistent hashing and virtual node partitioning.
- Implemented LRU memory eviction and concurrent read-write locks supporting 65k QPS with zero lock contention.
- Wrote comprehensive benchmark harness and integrated GitHub Actions CI pipeline with automated race detection.

Full-Stack Realtime Collab Tool | TypeScript, Next.js 15, WebSockets, PostgreSQL, Tailwind
- Created real-time collaborative workspace utilizing CRDTs for conflict-free multi-user text editing.
- Implemented optimistic updates, presence awareness, and database connection pooling with PgBouncer.

TECHNICAL COMPETENCIES
- Languages: Go, Java 21, TypeScript, C++, SQL
- Systems & Cloud: Docker, Kubernetes, Linux Internals, AWS (ECS, S3, RDS), Git
- Databases & Storage: PostgreSQL, Redis, Apache Kafka, DynamoDB
- Core Concepts: Data Structures & Algorithms, Distributed Systems, OS, DBMS, Computer Networks
`;

// 8. Services-Company Resume Text (Typical 2-year TCS/Infosys/Wipro engineer transitioning to product)
const resume08 = `VIKRAM SINGH
Bengaluru, Karnataka | vikram.singh@example.com | +91 97654 32109 | linkedin.com/in/vikram-singh-dev

PROFESSIONAL SUMMARY
Software Engineer with 2.5 years of experience at Tata Consultancy Services (TCS), specializing in Java enterprise applications, REST API maintenance, and Oracle SQL optimization for European banking client. Notice period: 90 days (negotiable to 30 days buyout).

EXPERIENCE
Tata Consultancy Services (TCS) | Bengaluru
System Engineer (Full-time) | Oct 2023 - Present
- Maintained core payment processing subsystem built on Spring Boot and Java 17 for a Tier-1 UK bank.
- Resolved 140+ production incident tickets with strict 4-hour SLA turnaround; received Star Team Award.
- Refactored legacy PL/SQL stored procedures, improving batch end-of-day settlement duration by 22%.
- Migrated 12 on-premises SOAP service endpoints into containerized REST microservices deployed on OpenShift.

PROJECTS (Self-Driven Product Up-skilling)
Distributed Event-Driven Ledger | Java 21, Spring Boot 3, Kafka, Docker
- Built an event-sourced payment ledger handling money transfers with outbox pattern and Kafka idempotency.
- Demonstrated microservice resiliency using Resilience4j circuit breakers and OpenTelemetry distributed tracing.

EDUCATION
Visvesvaraya Technological University (VTU)
B.E. in Information Science | CGPA: 7.9 / 10.0 (2019 - 2023)

TECHNICAL SKILLS
- Languages: Java (Core, Streams, Concurrency), SQL, JavaScript
- Frameworks: Spring Boot, Spring Data JPA, Hibernate, JUnit 5, Mockito
- Tools & Cloud: Docker, Kubernetes, Git, Jenkins, Oracle DB, PostgreSQL, Maven
`;

// Write text files
const resumes = [
  { name: 'golden_resume_01_single_column.txt', content: resume01 },
  { name: 'golden_resume_02_twocolumn_overleaf.txt', content: resume02 },
  { name: 'golden_resume_03_sidebar.txt', content: resume03 },
  { name: 'golden_resume_04_table_heavy.txt', content: resume04 },
  { name: 'golden_resume_05_stuffed_skills.txt', content: resume05 },
  { name: 'golden_resume_06_weak_fresher.txt', content: resume06 },
  { name: 'golden_resume_07_strong_fresher.txt', content: resume07 },
  { name: 'golden_resume_08_services_company.txt', content: resume08 },
];

for (const r of resumes) {
  fs.writeFileSync(path.join(goldenDir, r.name), r.content, 'utf8');
}

// 6 Representative JDs
const jds = [
  {
    name: 'golden_jd_01_backend_sde.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Software Development Engineer I (Backend)
Level: SDE-1 (0-2 years experience)
Location: Bengaluru / Hyderabad

About the Role:
We are looking for an SDE-1 to join our core backend engineering team. You will build and scale distributed microservices handling millions of daily customer requests.

Key Responsibilities:
- Design and develop scalable backend APIs using Java or Go.
- Optimize database queries and schema designs across PostgreSQL and Redis.
- Collaborate with frontend and mobile teams to define contract schemas.
- Write unit, integration, and performance tests to maintain high reliability.

Requirements:
- Strong proficiency in Java, Go, or C++.
- Solid understanding of Data Structures, Algorithms, and Object-Oriented Design.
- Familiarity with relational databases (PostgreSQL/MySQL) and caching (Redis).
- Hands-on experience with Git, Docker, and Linux environments.
- Excellent communication and analytical skills.
`
  },
  {
    name: 'golden_jd_02_frontend_react.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Frontend Engineer (React & TypeScript)
Level: Entry to Mid (1-3 years experience)
Location: Remote / Bengaluru

About the Role:
Join our design systems and web application team building responsive, highly accessible user interfaces for our flagship analytics product.

Key Responsibilities:
- Build clean, modular components in React 19 and TypeScript.
- Implement responsive UI with Tailwind CSS ensuring pixel-perfect layout and WCAG accessibility.
- Manage client state efficiently using Zustand or Redux Toolkit.
- Optimize web vitals (LCP, FID, CLS) and bundle size.

Requirements:
- Hands-on expertise with modern JavaScript/TypeScript and React ecosystem.
- Deep knowledge of CSS, Tailwind CSS, DOM APIs, and responsive layout.
- Experience writing automated component tests with React Testing Library / Vitest.
- Understanding of web performance, caching, and REST/GraphQL APIs.
`
  },
  {
    name: 'golden_jd_03_fullstack_enterprise.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Full Stack Software Engineer (Spring Boot & Next.js)
Level: SDE (1-3 years experience)
Location: Pune / Chennai

About the Role:
Develop end-to-end features spanning enterprise Spring Boot microservices, Next.js web applications, and relational database workflows.

Key Responsibilities:
- Architect backend REST services in Spring Boot 3 with JPA/Hibernate.
- Develop responsive web applications using Next.js App Router and TypeScript.
- Implement authentication, RBAC authorization, and secure API gateways.
- Automate CI/CD test and build pipelines using GitHub Actions.

Requirements:
- Bachelor's degree in CS, IT, or equivalent practical experience.
- Proficiency in Java and TypeScript/JavaScript.
- Hands-on experience with Spring Boot, Next.js, and PostgreSQL.
- Knowledge of microservice design patterns, security fundamentals, and Docker.
`
  },
  {
    name: 'golden_jd_04_devops_cloud.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Cloud Platform / DevOps Engineer
Level: Associate (0-2 years experience)
Location: Bengaluru / Hyderabad

About the Role:
Scale, monitor, and automate cloud infrastructure supporting high-availability production workloads.

Key Responsibilities:
- Manage Kubernetes clusters, Helm charts, and containerized deployments.
- Build automated CI/CD pipelines using GitHub Actions or GitLab CI.
- Implement observability stacks with Prometheus, Grafana, and OpenTelemetry.
- Enforce infrastructure-as-code (IaC) standards using Terraform.

Requirements:
- Understanding of Linux systems administration, networking, and shell scripting.
- Experience with Docker, Kubernetes, and public cloud providers (AWS/GCP).
- Familiarity with CI/CD concepts, Git, and automated testing gates.
- Knowledge of cloud security, secrets management, and zero-trust concepts.
`
  },
  {
    name: 'golden_jd_05_data_analyst_ml.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Data Analyst & ML Engineer
Level: Fresher to 2 years experience
Location: Gurugram / Mumbai

About the Role:
Transform large-scale telemetry data into actionable business intelligence and train machine learning models for customer segmentation.

Key Responsibilities:
- Write complex SQL queries and ETL pipelines for analytical data marts.
- Develop predictive models in Python using Pandas, Scikit-Learn, and PyTorch.
- Build automated visualization dashboards in Tableau, PowerBI, or Streamlit.
- Monitor model drift and evaluate inference metrics (Precision, Recall, ROC-AUC).

Requirements:
- Strong foundations in Python, SQL, Statistics, and Linear Algebra.
- Experience with data manipulation libraries (Pandas, NumPy) and ML frameworks.
- Demonstrated ability to communicate data insights to technical and non-technical stakeholders.
`
  },
  {
    name: 'golden_jd_06_embedded_systems.txt',
    content: `REPRESENTATIVE JOB DESCRIPTION (Illustrative benchmark)
Role: Embedded Software / Firmware Engineer
Level: Graduate / 0-2 years
Location: Bengaluru

About the Role:
Write low-level firmware, device drivers, and real-time operating system (RTOS) tasks powering smart IoT and industrial hardware devices.

Key Responsibilities:
- Develop production firmware in C and C++ for ARM Cortex-M microcontrollers.
- Implement communication drivers for SPI, I2C, UART, and CAN bus protocols.
- Debug timing, race conditions, and memory leaks using logic analyzers and JTAG.
- Optimize power consumption and execution latency for resource-constrained chips.

Requirements:
- Degree in Electronics, Electrical, or Computer Engineering.
- Deep proficiency in C, C++, and microcontrollers (STM32, ESP32, or NXP).
- Understanding of RTOS principles (tasks, semaphores, queues, mutexes).
- Hands-on lab experience with oscilloscopes and circuit schematics.
`
  }
];

for (const j of jds) {
  fs.writeFileSync(path.join(goldenDir, j.name), j.content, 'utf8');
}

console.log('Successfully created all 8 golden resume texts and 6 representative JDs in tests/fixtures/golden/');

// Now compile HTML templates for the 4 layout resumes and render PDFs via Headless Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;

function renderPdf(html, outputPath) {
  const tempHtml = outputPath.replace('.pdf', '_temp.html');
  fs.writeFileSync(tempHtml, html, 'utf8');
  const cmd = `"${browserExe}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${outputPath}" "${tempHtml}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
    console.log(`Rendered PDF fixture: ${path.basename(outputPath)}`);
  } catch (e) {
    console.error(`Failed to render PDF ${outputPath}:`, e.message);
  }
}

// PDF 1: Single Column
const html01 = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 15mm; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #111; margin: 0; }
h1 { font-size: 16pt; margin: 0 0 2pt 0; text-align: center; }
.contact { font-size: 8.5pt; text-align: center; color: #444; margin-bottom: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 6pt; }
h2 { font-size: 11pt; border-bottom: 1px solid #222; text-transform: uppercase; margin: 10pt 0 4pt 0; padding-bottom: 1pt; }
.job-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 9.5pt; }
.job-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 9pt; color: #333; margin-bottom: 3pt; }
ul { margin: 2pt 0 6pt 16pt; padding: 0; }
li { margin-bottom: 2pt; font-size: 9pt; }
</style></head><body>
<h1>ADITYA SHARMA</h1>
<div class="contact">Bengaluru, India | +91 98765 43210 | aditya.sharma@example.com | linkedin.com/in/aditya-sharma | github.com/aditya-dev</div>

<h2>Education</h2>
<div class="job-header"><span>Indian Institute of Information Technology, Allahabad</span><span>2022 - 2026</span></div>
<div class="job-sub"><span>B.Tech in Computer Science and Engineering</span><span>CGPA: 8.85 / 10.0</span></div>

<h2>Experience</h2>
<div class="job-header"><span>Groww India</span><span>Bengaluru, India</span></div>
<div class="job-sub"><span>Software Engineering Intern</span><span>May 2025 - July 2025</span></div>
<ul>
  <li>Engineered real-time mutual fund transaction ledger processing 15,000 requests/minute using Go and Apache Kafka.</li>
  <li>Reduced PostgreSQL query latency by 38% through composite indexing and query plan restructuring.</li>
  <li>Built automated reconciliation pipeline verifying end-of-day balances across payment gateway webhooks.</li>
</ul>

<h2>Projects</h2>
<div class="job-header"><span>Distributed KV Store (Go, Raft, gRPC)</span><span>2025</span></div>
<ul>
  <li>Implemented leader election, log replication, and heartbeat fault-detection protocol adhering to Raft specification.</li>
  <li>Benchmarked cluster throughput reaching 42,000 write ops/sec across 5 distributed node replicas with sub-15ms latency.</li>
  <li>Containerized deployment using Docker and wrote end-to-end chaos testing harnesses simulating network partitions.</li>
</ul>

<h2>Technical Skills</h2>
<ul>
  <li><strong>Languages:</strong> Go, Java, TypeScript, C++, SQL, Python</li>
  <li><strong>Frameworks:</strong> Spring Boot, React, Next.js, Express, Tailwind CSS</li>
  <li><strong>Tools & Infra:</strong> PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, Git, Linux</li>
</ul>
</body></html>`;

renderPdf(html01, path.join(goldenDir, 'golden_resume_01_single_column.pdf'));

// PDF 2: Two-Column Overleaf Style
const html02 = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 12mm; }
body { font-family: 'Times New Roman', serif; font-size: 9.5pt; line-height: 1.35; color: #111; margin: 0; }
h1 { font-size: 16pt; margin: 0 0 2pt 0; text-align: center; }
.contact { font-size: 8.5pt; text-align: center; color: #444; margin-bottom: 10pt; border-bottom: 1px solid #888; padding-bottom: 4pt; }
.columns { display: flex; gap: 14pt; }
.col-left { flex: 1.3; }
.col-right { flex: 0.9; }
h2 { font-size: 10.5pt; border-bottom: 1px solid #444; text-transform: uppercase; margin: 6pt 0 3pt 0; }
.item-title { font-weight: bold; font-size: 9pt; }
.item-sub { font-style: italic; font-size: 8.5pt; color: #444; margin-bottom: 2pt; }
ul { margin: 2pt 0 4pt 12pt; padding: 0; }
li { margin-bottom: 2pt; font-size: 8.5pt; }
</style></head><body>
<h1>PRIYA VENKATESH</h1>
<div class="contact">Chennai, India | priya.v@example.com | +91 91234 56789 | github.com/priyav-code</div>

<div class="columns">
  <div class="col-left">
    <h2>Work Experience</h2>
    <div class="item-title">Freshworks — Full Stack Intern</div>
    <div class="item-sub">Chennai | Jan 2025 - Jun 2025</div>
    <ul>
      <li>Designed ticketing automation workflows handling 50k events daily using Node.js and Redis.</li>
      <li>Implemented role-based access control (RBAC) with JWT tokens and refreshed security audits.</li>
      <li>Migrated legacy AngularJS modules to modern React with TypeScript.</li>
    </ul>

    <h2>Projects</h2>
    <div class="item-title">Next.js E-Commerce Engine</div>
    <div class="item-sub">Next.js 15, PostgreSQL, Stripe</div>
    <ul>
      <li>Built full-stack retail portal featuring server actions and Supabase RLS.</li>
      <li>Integrated automated webhook handlers processing idempotent order payments.</li>
    </ul>

    <div class="item-title">Cloud Event Bus</div>
    <div class="item-sub">Python, AWS Lambda, DynamoDB</div>
    <ul>
      <li>Architected serverless event routing service managing subscriber notifications.</li>
    </ul>
  </div>

  <div class="col-right">
    <h2>Education</h2>
    <div class="item-title">Anna University, CEG Campus</div>
    <div class="item-sub">B.E. Computer Science (2021 - 2025)</div>
    <div>CGPA: 9.1 / 10</div>

    <h2>Technical Skills</h2>
    <ul>
      <li><strong>Languages:</strong> JavaScript, TypeScript, Python, Java</li>
      <li><strong>Frontend:</strong> React, Next.js, Redux, Tailwind</li>
      <li><strong>Backend:</strong> Node.js, Express, FastAPI, Spring Boot</li>
      <li><strong>Cloud/DB:</strong> AWS, Docker, PostgreSQL, MongoDB, Redis</li>
    </ul>
  </div>
</div>
</body></html>`;

renderPdf(html02, path.join(goldenDir, 'golden_resume_02_twocolumn_overleaf.pdf'));

// PDF 3: Sidebar Layout
const html03 = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 0; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 9pt; line-height: 1.4; color: #222; margin: 0; display: flex; }
.sidebar { width: 32%; background: #1e293b; color: #f8fafc; padding: 24pt 16pt; min-height: 297mm; box-sizing: border-box; }
.main { width: 68%; background: #ffffff; padding: 24pt 20pt; min-height: 297mm; box-sizing: border-box; }
.sidebar h2 { font-size: 10pt; color: #38bdf8; text-transform: uppercase; border-bottom: 1px solid #334155; padding-bottom: 3pt; margin-top: 14pt; }
.sidebar ul { margin: 4pt 0; padding-left: 12pt; }
.sidebar li { margin-bottom: 3pt; font-size: 8.5pt; color: #cbd5e1; }
h1 { font-size: 18pt; margin: 0 0 4pt 0; color: #0f172a; }
.headline { font-size: 9.5pt; color: #0284c7; margin-bottom: 14pt; }
.main h2 { font-size: 11pt; color: #0f172a; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; padding-bottom: 2pt; margin-top: 14pt; }
.exp-title { font-weight: bold; font-size: 9.5pt; display: flex; justify-content: space-between; }
.exp-sub { font-style: italic; color: #64748b; font-size: 8.5pt; margin-bottom: 3pt; }
.main ul { margin: 2pt 0 6pt 14pt; padding: 0; }
.main li { margin-bottom: 2pt; font-size: 8.5pt; }
</style></head><body>
<div class="sidebar">
  <div style="font-size: 14pt; font-weight: bold; color: #ffffff;">ROHAN VERMA</div>
  <div style="font-size: 8.5pt; color: #94a3b8; margin-top: 4pt;">Pune, Maharashtra</div>
  <div style="font-size: 8.5pt; color: #94a3b8;">rohan.verma@example.com</div>
  <div style="font-size: 8.5pt; color: #94a3b8;">+91 98220 12345</div>

  <h2>Technical Skills</h2>
  <ul>
    <li>Core Java, Python, C++</li>
    <li>Spring Boot 3, Hibernate</li>
    <li>REST APIs, Microservices</li>
    <li>MySQL, PostgreSQL, Redis</li>
    <li>Git, Docker, Maven, CI/CD</li>
  </ul>

  <h2>Education</h2>
  <div style="font-size: 8.5pt; font-weight: bold; color: #f1f5f9;">PICT Pune</div>
  <div style="font-size: 8pt; color: #cbd5e1;">B.E. Information Technology</div>
  <div style="font-size: 8pt; color: #94a3b8;">2022 - 2026 | CGPA: 8.4</div>
</div>

<div class="main">
  <h1>ROHAN VERMA</h1>
  <div class="headline">Software Engineering Student &bull; Java Backend Specialist</div>

  <h2>Work Experience</h2>
  <div class="exp-title"><span>Persistent Systems</span><span>May 2025 - Jul 2025</span></div>
  <div class="exp-sub">Backend Engineering Intern &bull; Pune</div>
  <ul>
    <li>Developed REST microservices using Spring Boot 3 and Java 21 for healthcare claims processing.</li>
    <li>Wrote JUnit 5 and Mockito test suites achieving 88% branch coverage across domain logic.</li>
    <li>Optimized JPA queries reducing database round-trips by 45%.</li>
  </ul>

  <h2>Academic Projects</h2>
  <div class="exp-title"><span>Scalable Banking Ledger</span><span>Spring 2025</span></div>
  <div class="exp-sub">Java, Spring Cloud, Kafka, PostgreSQL</div>
  <ul>
    <li>Implemented double-entry accounting ledger with ACID compliance and idempotency keys.</li>
    <li>Handled bank transfer requests with distributed transactions and saga pattern compensation.</li>
  </ul>
</div>
</body></html>`;

renderPdf(html03, path.join(goldenDir, 'golden_resume_03_sidebar.pdf'));

// PDF 4: Table-Heavy
const html04 = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 15mm; }
body { font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.35; color: #111; margin: 0; }
h1 { font-size: 15pt; text-align: center; margin: 0 0 2pt 0; }
.contact { font-size: 8pt; text-align: center; color: #555; margin-bottom: 10pt; }
h2 { font-size: 10pt; background: #e2e8f0; padding: 2pt 4pt; margin: 8pt 0 4pt 0; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; font-size: 8.5pt; }
th, td { border: 1px solid #94a3b8; padding: 3pt 5pt; text-align: left; }
th { background: #f1f5f9; font-weight: bold; }
</style></head><body>
<h1>MEERA NAIR</h1>
<div class="contact">Bengaluru, India | meera.nair@example.com | +91 99887 76655 | github.com/meeranair</div>

<h2>Academic Qualifications</h2>
<table>
  <tr><th>Degree / Course</th><th>Institution</th><th>Board / University</th><th>Year</th><th>Percentage / CGPA</th></tr>
  <tr><td>B.Tech (ECE)</td><td>NIT Calicut</td><td>Autonomous</td><td>2021-2025</td><td>8.62 CGPA</td></tr>
  <tr><td>Class XII</td><td>Kendriya Vidyalaya</td><td>CBSE</td><td>2021</td><td>94.2%</td></tr>
  <tr><td>Class X</td><td>Kendriya Vidyalaya</td><td>CBSE</td><td>2019</td><td>95.8%</td></tr>
</table>

<h2>Project Summary</h2>
<table>
  <tr><th>Project Title</th><th>Technologies Used</th><th>Key Contribution</th><th>Outcome</th></tr>
  <tr><td>IoT Fleet Telemetry</td><td>C++, FreeRTOS, MQTT, AWS IoT</td><td>Designed firmware and telemetry parser</td><td>99.4% uptime across 50 nodes</td></tr>
  <tr><td>Smart Grid Gateway</td><td>Python, Raspberry Pi, InfluxDB</td><td>Built edge data aggregator with TLS</td><td>500ms real-time metric latency</td></tr>
</table>

<h2>Technical Proficiencies</h2>
<table>
  <tr><th>Domain</th><th>Proficient</th><th>Familiar</th></tr>
  <tr><td>Languages</td><td>C, C++, Python, Embedded C</td><td>Rust, Assembly</td></tr>
  <tr><td>Protocols</td><td>UART, SPI, I2C, CAN, MQTT</td><td>BLE, Zigbee</td></tr>
  <tr><td>Tools & Hardware</td><td>STM32, ESP32, Keil, Git, Linux</td><td>Oscilloscope, Logic Analyzer</td></tr>
</table>
</body></html>`;

renderPdf(html04, path.join(goldenDir, 'golden_resume_04_table_heavy.pdf'));
