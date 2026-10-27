// ============================================================
// Generate Standard Job Description (JD) Evaluation Fixtures
// 10 DEV + 6 HOLDOUT across seniority tiers, domains, boilerplate,
// alternatives ("or"), and priority cues.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JDFixtureTruth } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_DIR = path.resolve(__dirname, '../../tests/fixtures/parsing/jd/dev');
const HOLDOUT_DIR = path.resolve(__dirname, '../../tests/fixtures/parsing/jd/holdout');

fs.mkdirSync(DEV_DIR, { recursive: true });
fs.mkdirSync(HOLDOUT_DIR, { recursive: true });

const JD_FIXTURES: JDFixtureTruth[] = [
  // --- DEV (10) ---
  {
    id: 'jd_fresher_frontend',
    roleTitle: 'Graduate Frontend Engineer',
    seniority: 'fresher',
    yearsRequired: 0,
    mustHaves: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'],
    niceToHaves: ['Next.js', 'Redux', 'Git'],
    toolsMentioned: ['Git'],
    degreeRequired: "Bachelor's degree in Computer Science or related field",
    isHoldout: false,
    rawText: `Role: Graduate Frontend Engineer
Company: WebCraft Technologies
Location: Bangalore, India (Hybrid)
Experience: 0-1 Years (Freshers welcome)

About the Role:
We are looking for an enthusiastic Graduate Frontend Engineer to join our core UI team. You will build dynamic, accessible web applications.

Basic Qualifications:
- Bachelor's degree in Computer Science or related field (2024 / 2025 batch).
- Strong proficiency in React and modern TypeScript / JavaScript.
- Solid foundational knowledge of HTML5 and CSS3 semantics.
- Passion for writing clean, modular component code.

Preferred Qualifications (Nice to Have):
- Familiarity with Next.js or server-side rendering is a strong plus.
- Hands-on experience with Redux or state management libraries is desirable.
- Basic understanding of version control with Git.

What We Offer:
- Mentorship from senior staff engineers.
- Competitive fresher stipend and health benefits.
`,
  },
  {
    id: 'jd_junior_fullstack',
    roleTitle: 'Junior Full-Stack Developer',
    seniority: 'junior',
    yearsRequired: 2,
    mustHaves: ['Node.js', 'React', 'PostgreSQL', 'REST APIs'],
    niceToHaves: ['Docker', 'AWS'],
    toolsMentioned: ['Docker', 'AWS'],
    degreeRequired: "Bachelor's in Engineering or equivalent",
    isHoldout: false,
    rawText: `Position: Junior Full-Stack Developer
Department: Engineering
Experience Required: 1-2 years of software engineering experience

Job Overview:
As a Junior Full-Stack Developer, you will collaborate with cross-functional product teams to deliver robust features across the entire web stack.

Responsibilities:
- Develop and maintain scalable backend services using Node.js.
- Create user-friendly frontend interfaces in React.
- Design relational database schemas and optimize queries in PostgreSQL.
- Build and consume REST APIs following industry best practices.

Requirements:
- 1 to 2 years of proven professional development experience.
- Hands-on experience building backend APIs in Node.js.
- Strong skills in React for component-driven UI development.
- Solid working knowledge of SQL databases, specifically PostgreSQL.
- Understanding of HTTP protocols and RESTful API architecture.

Nice to Have:
- Containerization experience with Docker is a bonus.
- Exposure to Amazon Web Services (AWS) cloud infrastructure is preferred.
`,
  },
  {
    id: 'jd_mid_backend',
    roleTitle: 'Backend Software Engineer',
    seniority: 'mid',
    yearsRequired: 4,
    mustHaves: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices'],
    niceToHaves: ['Kafka', 'Redis'],
    toolsMentioned: ['Kafka', 'Redis'],
    orAlternatives: [{ group: 'database', options: ['PostgreSQL', 'MySQL'] }],
    isHoldout: false,
    rawText: `Title: Backend Software Engineer
Level: Mid-Level (3-5 Years)
Location: Remote, India

Role Summary:
Our platform processes millions of daily transactions. We need an experienced Backend Engineer to scale our services.

Key Responsibilities:
- Design and implement resilient microservices using Java and Spring Boot.
- Manage persistent state across PostgreSQL or MySQL clusters.
- Collaborate with infrastructure teams on high-throughput distributed systems.

Minimum Requirements:
- 3 to 5 years of backend engineering experience (minimum 3 years).
- Deep expertise with Java and the Spring Boot framework.
- Practical experience designing and operating Microservices in production.
- Strong relational database experience with PostgreSQL or MySQL.

Preferred Qualifications:
- Experience with event-driven architecture using Apache Kafka is highly desirable.
- In-memory caching expertise with Redis is a plus.
`,
  },
  {
    id: 'jd_senior_data_engineer',
    roleTitle: 'Senior Data Engineer',
    seniority: 'senior',
    yearsRequired: 6,
    mustHaves: ['Python', 'SQL', 'Apache Spark'],
    niceToHaves: ['Airflow', 'Data Warehousing', 'AWS'],
    toolsMentioned: ['Airflow', 'AWS'],
    isHoldout: false,
    rawText: `Role: Senior Data Engineer
Level: Senior (5+ Years of Experience)
Location: Hyderabad, India

About Us:
We empower enterprises with real-time analytics and predictive insights.

Requirements:
- 5+ years of specialized experience in data engineering and data pipeline architecture.
- Advanced programming skills in Python and complex SQL.
- Strong production experience with Apache Spark for large-scale distributed data processing.
- Proven track record designing dimensional models and ETL workflows.

Bonus Qualifications:
- Experience orchestrating directed acyclic graphs (DAGs) with Apache Airflow.
- Hands-on experience with modern cloud data warehouses like Snowflake.
- Familiarity with AWS data infrastructure (S3, EMR, Redshift) is preferred.
`,
  },
  {
    id: 'jd_lead_architect',
    roleTitle: 'Principal Systems Architect',
    seniority: 'lead',
    yearsRequired: 9,
    mustHaves: ['System Design', 'Distributed Systems', 'Kubernetes', 'High Availability & Fault Tolerance'],
    niceToHaves: ['Go', 'Terraform', 'Kafka'],
    toolsMentioned: ['Kubernetes', 'Terraform', 'Kafka'],
    isHoldout: false,
    rawText: `Position: Principal Systems Architect
Seniority: Staff / Principal / Lead (8+ Years)

Position Description:
We are seeking a Principal Systems Architect to guide the architectural evolution of our multi-region financial platform.

Must-Have Requirements:
- 8+ years of software architecture and engineering experience.
- Masterful expertise in System Design and complex Distributed Systems.
- Production mastery of Kubernetes orchestration at high scale.
- Proven background engineering for High Availability (99.999% SLA) and disaster recovery.

Good-to-Have Skills:
- Systems programming proficiency in Go (Golang).
- Infrastructure as code with Terraform.
- Enterprise streaming with Kafka.
`,
  },
  {
    id: 'jd_devops_engineer',
    roleTitle: 'DevOps & Cloud Engineer',
    seniority: 'mid',
    yearsRequired: 3,
    mustHaves: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux'],
    niceToHaves: ['Terraform', 'Prometheus', 'AWS'],
    toolsMentioned: ['Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'AWS'],
    isHoldout: false,
    rawText: `Job Title: DevOps & Cloud Engineer
Experience: 3-5 Years
Location: Pune, India

Responsibilities:
- Maintain continuous integration and continuous deployment pipelines.
- Automate container builds and manage Kubernetes clusters.
- Administer Linux production environments with zero downtime.

Mandatory Qualifications:
- 3+ years in a dedicated DevOps, SRE, or Cloud Infrastructure role.
- Hands-on mastery of Docker containerization and Kubernetes cluster management.
- Deep experience establishing CI/CD Pipelines with automated gating.
- Strong Linux systems administration and shell scripting skills.

Nice-to-Have:
- Infrastructure-as-code automation using Terraform.
- Telemetry, logging, and metrics gathering using Prometheus and Grafana.
- AWS cloud certifications are an added advantage.
`,
  },
  {
    id: 'jd_qa_automation',
    roleTitle: 'QA Automation Engineer',
    seniority: 'junior',
    yearsRequired: 2,
    mustHaves: ['JavaScript', 'End-to-End Testing'],
    niceToHaves: ['CI/CD Pipelines', 'Postman', 'Git'],
    toolsMentioned: ['Jenkins', 'Postman', 'Git'],
    isHoldout: false,
    rawText: `Role: QA Automation Engineer
Experience: 2+ Years

Job Summary:
Join our Quality Engineering team to build robust automated test suites.

Required Skills:
- 2+ years of software quality engineering and Test Automation experience.
- Proven experience with modern UI test frameworks including Selenium and Cypress.
- Solid programming proficiency in JavaScript or TypeScript.
- Strong ability to design comprehensive end-to-end test plans.

Preferred:
- Experience integrating test suites into Jenkins CI/CD pipelines is a plus.
- API testing experience using Postman.
- Version control with Git.
`,
  },
  {
    id: 'jd_mobile_react_native',
    roleTitle: 'React Native Mobile Developer',
    seniority: 'mid',
    yearsRequired: 4,
    mustHaves: ['React Native', 'TypeScript', 'iOS Development', 'Android Development'],
    niceToHaves: ['GraphQL', 'OAuth2 & JWT'],
    toolsMentioned: [],
    isHoldout: false,
    rawText: `Position: React Native Mobile Developer
Experience: 3-5 Years
Location: Noida, India

What You Will Do:
- Architect cross-platform mobile apps for iOS and Android devices.
- Deliver pixel-perfect user experiences with smooth 60 FPS transitions.

Requirements:
- 3-5 years of mobile app development experience.
- Deep expertise in React Native and TypeScript.
- Strong familiarity with native iOS (Swift/Obj-C) and Android (Kotlin/Java) platform APIs.
- Experience publishing applications to the Apple App Store and Google Play Store.

Nice to Have:
- Integration with GraphQL APIs.
- Push notification workflows and authentication using Firebase.
`,
  },
  {
    id: 'jd_security_engineer',
    roleTitle: 'Senior Application Security Engineer',
    seniority: 'senior',
    yearsRequired: 5,
    mustHaves: ['Web Security & OWASP', 'Python'],
    niceToHaves: ['Kubernetes', 'Docker'],
    toolsMentioned: ['Kubernetes', 'Docker'],
    isHoldout: false,
    rawText: `Title: Senior Application Security Engineer
Experience: 5+ Years
Location: Chennai, India

Role Overview:
Help safeguard our fintech infrastructure from sophisticated threat vectors.

Key Requirements:
- 5+ years of dedicated Application Security and threat modeling experience.
- In-depth understanding of OWASP Top 10 vulnerabilities and modern mitigation strategies.
- Hands-on expertise conducting Penetration Testing and code audits.
- Scripting and automation proficiency using Python.

Preferred Qualifications:
- Experience securing containerized environments including Kubernetes and Docker.
- Relevant certifications (OSCP, CISSP, CEH) are a distinct plus.
`,
  },
  {
    id: 'jd_boilerplate_eeoc_sales',
    roleTitle: 'Full-Stack Web Engineer',
    seniority: 'mid',
    yearsRequired: 3,
    mustHaves: ['Python', 'Django', 'REST APIs'],
    niceToHaves: ['Docker', 'PostgreSQL', 'Redis'],
    toolsMentioned: ['Docker', 'PostgreSQL', 'Redis'],
    isHoldout: false,
    rawText: `Job Title: Full-Stack Web Engineer
Department: Product Engineering
Annual Base Salary: $110,000 - $145,000 / year + Equity

About Our Company:
We are an industry-leading SaaS organization serving global enterprise customers.

Core Requirements:
- At least 3 years of web application development experience.
- Strong mastery of Python and the Django framework.
- Proven experience designing and implementing scalable REST APIs.

Preferred Skills:
- In-memory caching with Redis.
- Containerization with Docker.
- Database query tuning in PostgreSQL.

Equal Employment Opportunity (EEO) Statement:
Acme Global Inc. is an Equal Opportunity / Affirmative Action Employer. All qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, disability, or protected veteran status. We are committed to fostering an inclusive, welcoming work environment.

Benefits & Perks:
- Comprehensive medical, dental, and vision insurance.
- 401(k) matching program up to 5%.
- Unlimited paid time off (PTO) and paid parental leave.
- Annual learning and professional development stipend ($2,500).
- Remote home office setup allowance.
`,
  },

  // --- HOLDOUT (6) ---
  {
    id: 'jd_holdout_fresher_sde',
    roleTitle: 'Software Development Engineer - Fresher',
    seniority: 'fresher',
    yearsRequired: 0,
    mustHaves: ['Java', 'Data Structures & Algorithms', 'SQL'],
    niceToHaves: ['Git', 'Linux'],
    toolsMentioned: ['Git'],
    degreeRequired: 'B.Tech / B.E. in Computer Science',
    isHoldout: true,
    rawText: `Role: Software Development Engineer - Fresher (Campus 2025)
Company: Infosys Technologies
Location: Mysore / Bangalore

Eligibility:
- B.Tech / B.E. in Computer Science, Information Technology, or related disciplines.
- 0 years of prior experience required (Freshers).

Key Requirements:
- Solid grounding in Java programming and Object-Oriented Design.
- Strong problem-solving skills in Data Structures & Algorithms.
- Working knowledge of relational databases and SQL queries.

Bonus Points:
- Practical knowledge of Git version control.
- Basic familiarity with Linux command-line environments.
`,
  },
  {
    id: 'jd_holdout_mid_frontend',
    roleTitle: 'Frontend Engineer (React / Vue)',
    seniority: 'mid',
    yearsRequired: 3,
    mustHaves: ['TypeScript', 'Tailwind CSS'],
    niceToHaves: ['Vitest', 'Webpack'],
    toolsMentioned: ['Vitest', 'Webpack'],
    orAlternatives: [{ group: 'framework', options: ['React', 'Vue.js'] }],
    isHoldout: true,
    rawText: `Title: Frontend Engineer (React / Vue)
Experience: 3-5 Years

Requirements:
- 3+ years of production experience crafting modern web frontends.
- Solid proficiency in either React or Vue.js framework ecosystems.
- Production mastery of TypeScript and strong typing patterns.
- Experience with modern styling systems such as Tailwind CSS.

Good to Have:
- Unit testing experience using Vitest or Jest.
- Deep familiarity with bundlers such as Webpack or Vite.
`,
  },
  {
    id: 'jd_holdout_senior_backend_go',
    roleTitle: 'Senior Go Backend Developer',
    seniority: 'senior',
    yearsRequired: 5,
    mustHaves: ['Go', 'PostgreSQL', 'Docker'],
    niceToHaves: ['Kubernetes', 'Kafka'],
    toolsMentioned: ['Docker', 'Kubernetes', 'Kafka'],
    isHoldout: true,
    rawText: `Role: Senior Go Backend Developer
Experience: 5+ Years Required

Job Overview:
Develop ultra-low latency transaction routing engines in Go.

Minimum Requirements:
- Minimum 5 years of backend development experience.
- Expert proficiency in Go (Golang) and concurrent programming routines.
- Production experience with PostgreSQL schema design and index optimization.
- Containerization proficiency with Docker.

Nice to Have:
- Kubernetes deployment and container orchestration.
- Distributed event streaming with Apache Kafka.
`,
  },
  {
    id: 'jd_holdout_lead_sre',
    roleTitle: 'Lead Site Reliability Engineer',
    seniority: 'lead',
    yearsRequired: 8,
    mustHaves: ['Kubernetes', 'Linux', 'Terraform', 'Distributed Systems'],
    niceToHaves: ['Go', 'Prometheus'],
    toolsMentioned: ['Kubernetes', 'Terraform', 'Prometheus'],
    isHoldout: true,
    rawText: `Position: Lead Site Reliability Engineer
Seniority: Lead (8+ Years Experience)

Role Focus:
Drive platform availability, telemetry, and automated disaster recovery.

Must-Have Qualifications:
- 8+ years experience operating high-scale cloud platforms.
- Deep Kubernetes cluster operations and networking experience.
- Expert Linux systems administration, kernel tuning, and troubleshooting.
- Infrastructure as code with Terraform.
- Architectural mastery of Distributed Systems resilience patterns.

Preferred:
- Systems scripting and automation in Go or Python.
- Observability and alerting using Prometheus and Grafana.
`,
  },
  {
    id: 'jd_holdout_data_scientist',
    roleTitle: 'Machine Learning Engineer',
    seniority: 'mid',
    yearsRequired: 4,
    mustHaves: ['Python', 'SQL', 'Machine Learning'],
    niceToHaves: ['Docker'],
    toolsMentioned: ['Docker'],
    orAlternatives: [{ group: 'deeplearning', options: ['PyTorch', 'TensorFlow'] }],
    isHoldout: true,
    rawText: `Title: Machine Learning Engineer
Experience: 3-5 Years

Key Requirements:
- 3 to 5 years building and deploying Machine Learning models.
- Expert programming skills in Python.
- Advanced SQL for feature store extractions and dataset generation.
- Strong hands-on experience with either PyTorch or TensorFlow frameworks.

Bonus:
- Containerized model deployment with Docker.
- Experience with MLOps pipelines.
`,
  },
  {
    id: 'jd_holdout_android_kotlin',
    roleTitle: 'Senior Android Engineer',
    seniority: 'senior',
    yearsRequired: 6,
    mustHaves: ['Kotlin', 'Android Development'],
    niceToHaves: ['CI/CD Pipelines'],
    toolsMentioned: ['CI/CD Pipelines'],
    isHoldout: true,
    rawText: `Job: Senior Android Engineer
Experience: 5-7 Years (Minimum 5 Years)

Summary:
Lead the engineering and architecture of our flagship consumer Android application.

Mandatory Requirements:
- 5+ years of dedicated Android application development experience.
- Masterful command of Kotlin and modern Android SDK architecture.
- Deep expertise in Mobile UI components, reactive state, and background processing.

Nice-to-Have:
- Continuous integration and deployment with automated CI/CD Pipelines.
`,
  },
];

for (const fix of JD_FIXTURES) {
  const targetDir = fix.isHoldout ? HOLDOUT_DIR : DEV_DIR;
  const txtPath = path.join(targetDir, `${fix.id}.txt`);
  const jsonPath = path.join(targetDir, `${fix.id}.truth.json`);

  fs.writeFileSync(txtPath, fix.rawText, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(fix, null, 2), 'utf-8');
}

console.log(`[JDFixtures] Generated ${JD_FIXTURES.filter(f => !f.isHoldout).length} DEV and ${JD_FIXTURES.filter(f => f.isHoldout).length} HOLDOUT fixtures successfully.`);
