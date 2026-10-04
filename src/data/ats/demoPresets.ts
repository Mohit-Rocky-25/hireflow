export interface DemoPreset {
  id: string;
  label: string;
  tag: string;
  resumeText: string;
  jdText: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'fresher-devops-gap',
    label: 'Fresher with React/TS (Missing DevOps)',
    tag: '~65% Match',
    resumeText: `Rahul Sharma
Email: rahul.sharma@email.com | Phone: +91-9123456789
Location: Delhi, India | LinkedIn: linkedin.com/in/rahulsharma

PROFESSIONAL SUMMARY
Passionate and dedicated Software Developer with hands-on experience in building web applications using React, TypeScript, and Node.js. Looking for an opportunity to contribute to a growth-oriented engineering team.

EDUCATION
Delhi Technological University
B.Tech in Information Technology | 2020 - 2024 | CGPA: 7.8/10

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, HTML5, CSS3, SQL
Frameworks & Libraries: React, Node.js, Express.js, Tailwind CSS
APIs & Tools: REST APIs, Git, Postman, VS Code

EXPERIENCE
Frontend Developer Intern | WebMatrix Studios
January 2024 - April 2024 | Delhi, India
- Responsible for developing reusable UI components using React and TypeScript.
- Worked on integrating REST APIs with backend services provided by senior developers.
- Duties included fixing UI bugs, handling form validations, and improving styling.
- Helped with team meetings, code reviews, and sprint planning sessions.

PROJECTS
DevConnect - Developer Community Platform
- Built a developer discussion platform using React, Node.js, and Express.js.
- Implemented user authentication, post creation, and voting mechanisms.
- Utilized Tailwind CSS for building a responsive user interface.
- Deployed frontend on Vercel and backend on Render.`,
    jdText: `Senior Full Stack Engineer
Location: Remote / Bangalore
Experience Required: 2-4 years

ABOUT THE ROLE
We are looking for an ambitious Full Stack Engineer to join our high-scale product team. You will build and scale distributed web services and collaborate with infrastructure teams.

RESPONSIBILITIES
- Architect and develop modern responsive user interfaces with TypeScript and React.
- Build reliable, high-throughput microservices using Node.js and REST APIs.
- Containerize application services using Docker and orchestrate deployments on Kubernetes.
- Set up robust CI/CD pipelines using GitHub Actions for automated testing and zero-downtime releases.
- Participate in System Design reviews and optimize database query latency.

MUST HAVE REQUIREMENTS
- 2+ years of hands-on experience with React, TypeScript, and Node.js.
- Strong knowledge of building and consuming REST APIs.
- Practical experience with Docker containerization and Kubernetes orchestration.
- Hands-on experience setting up CI/CD pipelines.
- Solid understanding of System Design fundamentals.

NICE TO HAVE
- Experience with PostgreSQL and Redis caching.
- Familiarity with Next.js and Tailwind CSS.`,
  },
  {
    id: 'senior-backend',
    label: 'Senior Backend Engineer (Scale Metrics)',
    tag: '~89% Match',
    resumeText: `Vikramaditya Rao
Email: vikram.rao@techpro.com | Phone: +91-9845012345
GitHub: github.com/vikramrao-dev | LinkedIn: linkedin.com/in/vikram-rao-dev

SUMMARY
Principal Backend Engineer with 7+ years of experience designing and scaling fault-tolerant distributed architectures. Proven track record of handling 45,000+ peak RPS with sub-50ms latency.

EXPERIENCE
Lead Distributed Systems Engineer | RazorPay
June 2021 - Present | Bangalore, India
- Architected payment routing gateway processing $4.2B annualized GMV using Go, Java, and Spring Boot, achieving 99.995% uptime SLA.
- Overhauled database caching tier with Redis and Kafka event streams, reducing p99 API latency from 240ms to 38ms across 35M daily requests.
- Spearheaded migration of 40+ legacy services into Kubernetes clusters on AWS with automated Terraform infrastructure provisioning, slashing cloud spend by $180,000/year.
- Designed distributed tracing and observability pipeline with Prometheus and Grafana, reducing Mean-Time-To-Detect (MTTD) incidents by 62%.

TECHNICAL SKILLS
Languages: Java, Go, Python, SQL
Backend: Spring Boot, Microservices, REST APIs, Distributed Systems, Caching Strategies
Databases & Queues: PostgreSQL, MySQL, Redis, Kafka, RabbitMQ
DevOps & Cloud: Docker, Kubernetes, AWS, Terraform, Prometheus, Grafana, CI/CD Pipelines`,
    jdText: `Staff Distributed Systems Backend Engineer
Location: Bangalore / Hybrid
Experience Required: 6+ years

We are hiring a Staff Backend Engineer to lead the architecture of our core distributed transaction engines.

MUST HAVE:
- 5+ years building distributed backend systems in Java or Go.
- Deep expertise in Spring Boot, PostgreSQL, and MySQL.
- Production experience with high-throughput event queues (Kafka, RabbitMQ) and Redis caching.
- Master of container orchestration with Docker, Kubernetes, and AWS infrastructure.
- Demonstrated system design mastery for distributed consensus and caching strategies.

NICE TO HAVE:
- Terraform IaC and Prometheus/Grafana monitoring.`,
  },
  {
    id: 'unformatted-stuffed',
    label: 'Keyword-Stuffed & Unformatted Profile',
    tag: '~30% Match',
    resumeText: `RESUME OF MOHIT

SKILLS LIST:
Python, Java, C++, C, JavaScript, TypeScript, React, Angular, Vue, Node.js, Express, Django, Flask, Ruby on Rails, PHP, Laravel, Docker, Kubernetes, AWS, GCP, Azure, Terraform, Jenkins, Git, Linux, MySQL, PostgreSQL, MongoDB, Redis, Cassandra, GraphQL, REST APIs, Microservices, Hadoop, Spark, Machine Learning, Deep Learning, PyTorch, TensorFlow, Scikit-learn, System Design, CI/CD, Agile, Scrum

WORK HISTORY
Company: ABC Infotech
Role: Software Developer
Duration: 2021 - Present
- Worked on various client projects as assigned.
- Responsible for coding features and fixing software bugs.
- Handled meetings with clients and wrote status reports.
- Used various programming languages and databases.
- Assisted team members in software development life cycle.`,
    jdText: `Full Stack Engineer (React, Node.js, PostgreSQL)
Experience: 3+ years

Looking for a product engineer with hands-on full stack proficiency.
Must have:
- Proven experience building web applications in React and TypeScript.
- Strong backend experience with Node.js and PostgreSQL.
- Clear track record of measurable business outcomes and ownership.`,
  },
];
