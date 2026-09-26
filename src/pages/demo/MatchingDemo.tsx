// ============================================================
// HireFlow — AI Matching Demo (v4 — 25 Companies Edition)
// Public demo: pick ANY of 25 real companies + role,
// pick a candidate scenario, run AI analysis, see breakdown
// + rejection reason + improvement suggestions
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Brain, Target, CheckCircle, XCircle,
  AlertTriangle, Lightbulb, ArrowRight, RefreshCw,
  ChevronDown, ChevronUp, Building2, MapPin, Users,
  Search, Filter, Star
} from "lucide-react";
import { Badge, Button } from "../../components/ui/Components";

// ─── 25 Companies with Real Roles and Requirements ────────────────────────────
const COMPANIES = [
  {
    name: "Google", logo: "G", color: "from-blue-600 to-blue-400", industry: "Technology",
    hq: "Bangalore / Hyderabad", tier: "MNC",
    roles: [
      {
        title: "Software Engineer L4",
        requirements: [
          { skill: "Data Structures & Algorithms", level: "Must Have", desc: "Ability to solve medium–hard LeetCode problems. Proficiency in time/space complexity analysis.", weight: 35 },
          { skill: "System Design", level: "Must Have", desc: "Design scalable distributed systems — load balancers, caches, databases, message queues.", weight: 35 },
          { skill: "Python / Java / C++", level: "Must Have", desc: "Deep proficiency in at least one of these languages including OOP, concurrency, and memory management.", weight: 30 },
        ],
      },
      {
        title: "Frontend Engineer",
        requirements: [
          { skill: "React & Hooks", level: "Must Have", desc: "Advanced React patterns: custom hooks, context, Suspense, performance optimization with memo/useMemo.", weight: 40 },
          { skill: "TypeScript", level: "Must Have", desc: "Strict TypeScript with generics, utility types, and discriminated unions.", weight: 35 },
          { skill: "Web Performance", level: "Must Have", desc: "Core Web Vitals, Lighthouse optimization, code-splitting, lazy loading, and bundle analysis.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Microsoft", logo: "M", color: "from-blue-500 to-cyan-400", industry: "Technology",
    hq: "Hyderabad / Noida", tier: "MNC",
    roles: [
      {
        title: "Senior Software Engineer",
        requirements: [
          { skill: "C# / .NET", level: "Must Have", desc: "Deep knowledge of .NET ecosystem, async/await, LINQ, and dependency injection patterns.", weight: 35 },
          { skill: "Azure Cloud", level: "Must Have", desc: "Azure services: App Service, Functions, Service Bus, Cosmos DB, and AKS deployment.", weight: 35 },
          { skill: "Microservices Architecture", level: "Nice to Have", desc: "Domain-driven design, API gateway patterns, event-driven communication between services.", weight: 30 },
        ],
      },
      {
        title: "Cloud Solutions Architect",
        requirements: [
          { skill: "Azure Architecture", level: "Must Have", desc: "Design multi-region, fault-tolerant architectures on Azure with HA requirements.", weight: 40 },
          { skill: "Kubernetes & Terraform", level: "Must Have", desc: "Container orchestration, Helm charts, and Infrastructure-as-Code for cloud provisioning.", weight: 35 },
          { skill: "DevOps / CI-CD", level: "Nice to Have", desc: "Azure DevOps, GitHub Actions pipelines, and deployment automation strategies.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Amazon (AWS)", logo: "A", color: "from-orange-500 to-yellow-400", industry: "E-Commerce / Cloud",
    hq: "Bangalore / Hyderabad", tier: "MNC",
    roles: [
      {
        title: "Software Development Engineer II",
        requirements: [
          { skill: "Java / Distributed Systems", level: "Must Have", desc: "Strong Java programming with concurrent collections, JVM tuning, and distributed system patterns.", weight: 40 },
          { skill: "AWS Services", level: "Must Have", desc: "EC2, S3, SQS, Lambda, DynamoDB, and CloudWatch — design and operate production systems.", weight: 35 },
          { skill: "System Design", level: "Must Have", desc: "Design for high availability, partition tolerance — CAP theorem, consensus algorithms.", weight: 25 },
        ],
      },
      {
        title: "Data Engineer",
        requirements: [
          { skill: "Apache Spark", level: "Must Have", desc: "Build and optimize Spark jobs for large-scale ETL, batch and streaming workloads.", weight: 35 },
          { skill: "AWS Data Services", level: "Must Have", desc: "Glue, Redshift, Athena, Kinesis — design and maintain data pipelines at petabyte scale.", weight: 35 },
          { skill: "SQL & Data Modeling", level: "Must Have", desc: "Complex queries, window functions, star/snowflake schema design, and query optimization.", weight: 30 },
        ],
      },
    ],
  },
  {
    name: "Meta", logo: "M", color: "from-blue-700 to-indigo-500", industry: "Social Media",
    hq: "Bangalore", tier: "MNC",
    roles: [
      {
        title: "Software Engineer (React Core)",
        requirements: [
          { skill: "React & Internals", level: "Must Have", desc: "Deep understanding of React reconciliation, Fiber, concurrent mode, and server components.", weight: 45 },
          { skill: "GraphQL", level: "Must Have", desc: "Relay-style GraphQL, fragments, data-masking, and optimistic updates in production apps.", weight: 30 },
          { skill: "JavaScript Performance", level: "Must Have", desc: "JS engine profiling, V8 optimization, memory leak detection, and rendering pipeline.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Flipkart", logo: "F", color: "from-yellow-500 to-orange-400", industry: "E-Commerce",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Senior Frontend Engineer",
        requirements: [
          { skill: "React / Next.js", level: "Must Have", desc: "Production-scale Next.js apps with SSR, ISR, and micro-frontend architecture.", weight: 40 },
          { skill: "TypeScript & Node.js", level: "Must Have", desc: "Full-stack TypeScript proficiency with backend BFF (Backend-for-Frontend) patterns.", weight: 35 },
          { skill: "Performance Optimization", level: "Must Have", desc: "E-commerce specific: image optimization, above-the-fold rendering, and bundle splitting.", weight: 25 },
        ],
      },
      {
        title: "ML Engineer",
        requirements: [
          { skill: "Python & ML Frameworks", level: "Must Have", desc: "PyTorch / TensorFlow for production model training, fine-tuning, and inference optimization.", weight: 40 },
          { skill: "MLOps", level: "Must Have", desc: "Kubeflow, MLflow, model versioning, A/B testing frameworks, and production monitoring.", weight: 35 },
          { skill: "Feature Engineering", level: "Nice to Have", desc: "Feature stores, real-time feature computation, and recommendation system pipelines.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Infosys", logo: "I", color: "from-indigo-600 to-blue-400", industry: "IT Services",
    hq: "Pan India", tier: "Enterprise",
    roles: [
      {
        title: "Technology Lead",
        requirements: [
          { skill: "Java & Spring Boot", level: "Must Have", desc: "RESTful API design with Spring Boot, JPA/Hibernate, and enterprise integration patterns.", weight: 40 },
          { skill: "Microservices & Cloud", level: "Must Have", desc: "Design and deploy containerized microservices on AWS or Azure with proper observability.", weight: 35 },
          { skill: "Team Leadership", level: "Nice to Have", desc: "Technical mentoring, code reviews, sprint planning, and stakeholder communication.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "TCS", logo: "T", color: "from-purple-600 to-violet-400", industry: "IT Services",
    hq: "Pan India", tier: "Enterprise",
    roles: [
      {
        title: "Systems Engineer",
        requirements: [
          { skill: "Java & SQL", level: "Must Have", desc: "Core Java 8+ features, collections framework, JDBC, and complex SQL queries.", weight: 40 },
          { skill: "REST APIs & Git", level: "Must Have", desc: "Build and consume REST APIs, version control with Git branching strategies.", weight: 35 },
          { skill: "Agile / Scrum", level: "Nice to Have", desc: "Sprint ceremonies, backlog grooming, story point estimation, and Jira proficiency.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Wipro", logo: "W", color: "from-teal-600 to-emerald-400", industry: "IT Services",
    hq: "Bangalore / Pune", tier: "Enterprise",
    roles: [
      {
        title: "Senior Developer (Full Stack)",
        requirements: [
          { skill: "React & Node.js", level: "Must Have", desc: "Full-stack JavaScript: React SPA connected to Express/NestJS REST API backends.", weight: 40 },
          { skill: "MongoDB & Docker", level: "Must Have", desc: "NoSQL data modeling and containerizing applications with Docker Compose.", weight: 35 },
          { skill: "CI/CD Pipeline", level: "Nice to Have", desc: "Jenkins, GitHub Actions, automated testing integration, and deployment pipelines.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Zomato", logo: "Z", color: "from-red-600 to-rose-400", industry: "Food Tech",
    hq: "Gurugram", tier: "Unicorn",
    roles: [
      {
        title: "Backend Engineer",
        requirements: [
          { skill: "Golang / Python", level: "Must Have", desc: "High-throughput backend services in Go or Python, with concurrency patterns and profiling.", weight: 40 },
          { skill: "Kafka & Redis", level: "Must Have", desc: "Event streaming with Kafka, Redis for caching and rate limiting in distributed systems.", weight: 35 },
          { skill: "Kubernetes", level: "Must Have", desc: "Deploy and manage containerized services on K8s with HPA and proper resource limits.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Swiggy", logo: "S", color: "from-orange-600 to-amber-400", industry: "Food Tech",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "SDE-2 (Platform)",
        requirements: [
          { skill: "Java / Go", level: "Must Have", desc: "Production-grade backend services handling millions of RPS with proper fault tolerance.", weight: 40 },
          { skill: "gRPC & Kafka", level: "Must Have", desc: "Internal service communication via gRPC and event-driven architecture with Kafka.", weight: 35 },
          { skill: "PostgreSQL & Caching", level: "Nice to Have", desc: "Complex queries, indexing strategies, and multi-level caching for food delivery logic.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Razorpay", logo: "R", color: "from-blue-800 to-blue-500", industry: "Fintech",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Software Engineer – Payments",
        requirements: [
          { skill: "Node.js / Go", level: "Must Have", desc: "High-reliability payment processing services with idempotency, retries, and reconciliation.", weight: 40 },
          { skill: "PostgreSQL & Redis", level: "Must Have", desc: "ACID transactions for financial data, Redis for distributed locking in payment flows.", weight: 35 },
          { skill: "Security & PCI-DSS", level: "Nice to Have", desc: "Understanding of payment security standards, tokenization, and encryption best practices.", weight: 25 },
        ],
      },
      {
        title: "Frontend Engineer",
        requirements: [
          { skill: "React & TypeScript", level: "Must Have", desc: "Complex form flows for payment UX, accessibility-first components, and secure input handling.", weight: 40 },
          { skill: "Redux & State Management", level: "Must Have", desc: "Predictable state management for multi-step payment wizards and error recovery flows.", weight: 35 },
          { skill: "Web Security", level: "Must Have", desc: "XSS prevention, CSP headers, iframe sandboxing for embedded payment widgets.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "PhonePe", logo: "P", color: "from-violet-700 to-purple-400", industry: "Fintech",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Senior Software Engineer",
        requirements: [
          { skill: "Java & Spring Boot", level: "Must Have", desc: "Microservices for UPI, wallet, and insurance products at 100M+ user scale.", weight: 40 },
          { skill: "Kafka & MySQL", level: "Must Have", desc: "Asynchronous transaction processing with Kafka and highly available MySQL clusters.", weight: 35 },
          { skill: "AWS & Performance", level: "Nice to Have", desc: "AWS infrastructure management and performance profiling for financial services.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "CRED", logo: "C", color: "from-zinc-800 to-zinc-600", industry: "Fintech",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Android Engineer",
        requirements: [
          { skill: "Kotlin & Jetpack Compose", level: "Must Have", desc: "Modern Android development with Compose, ViewModel, and Kotlin Coroutines.", weight: 45 },
          { skill: "MVVM & Clean Architecture", level: "Must Have", desc: "Layered architecture with use cases, repositories, and testable ViewModels.", weight: 35 },
          { skill: "GraphQL & Performance", level: "Nice to Have", desc: "Efficient data fetching with GraphQL and Android performance profiling tools.", weight: 20 },
        ],
      },
    ],
  },
  {
    name: "Ola", logo: "O", color: "from-green-700 to-lime-400", industry: "Mobility",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Senior SDE",
        requirements: [
          { skill: "Java / Go & Microservices", level: "Must Have", desc: "Service mesh patterns, circuit breakers, and distributed tracing for ride-hailing systems.", weight: 40 },
          { skill: "Redis & Kafka", level: "Must Have", desc: "Real-time geolocation matching using Redis geospatial commands and Kafka event streams.", weight: 35 },
          { skill: "System Design", level: "Must Have", desc: "Design ride-matching, surge pricing, and driver allocation systems at city scale.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Zepto", logo: "Z", color: "from-pink-700 to-rose-400", industry: "Quick Commerce",
    hq: "Mumbai", tier: "Unicorn",
    roles: [
      {
        title: "Software Engineer",
        requirements: [
          { skill: "Python / Go", level: "Must Have", desc: "High-performance APIs for dark store inventory management and 10-minute delivery routing.", weight: 40 },
          { skill: "PostgreSQL & Redis", level: "Must Have", desc: "Real-time inventory updates with PostgreSQL and Redis pub/sub for delivery status.", weight: 35 },
          { skill: "Kubernetes & Scaling", level: "Nice to Have", desc: "Horizontal auto-scaling for demand spikes, especially during peak order hours.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Meesho", logo: "M", color: "from-pink-600 to-rose-300", industry: "Social Commerce",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Data Scientist",
        requirements: [
          { skill: "Python & ML Algorithms", level: "Must Have", desc: "Supervised/unsupervised ML, XGBoost, LightGBM for catalogue classification and pricing.", weight: 40 },
          { skill: "Recommendation Systems", level: "Must Have", desc: "Collaborative filtering, content-based filtering, and hybrid models for product discovery.", weight: 35 },
          { skill: "Spark & SQL", level: "Nice to Have", desc: "Distributed feature computation on Spark and complex SQL for experiment analysis.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Paytm", logo: "P", color: "from-blue-600 to-sky-400", industry: "Fintech",
    hq: "Noida / Bangalore", tier: "Enterprise",
    roles: [
      {
        title: "Backend Developer",
        requirements: [
          { skill: "Java & Spring", level: "Must Have", desc: "REST microservices for payments, mini-apps, and financial product integrations.", weight: 40 },
          { skill: "MySQL & Redis", level: "Must Have", desc: "Database sharding for transactional data at scale and Redis for session management.", weight: 35 },
          { skill: "AWS Deployment", level: "Nice to Have", desc: "EC2, RDS, ElastiCache deployment and configuration for production services.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "HCL Tech", logo: "H", color: "from-green-800 to-teal-500", industry: "IT Services",
    hq: "Noida / Pan India", tier: "Enterprise",
    roles: [
      {
        title: "Cloud Engineer",
        requirements: [
          { skill: "Azure / AWS", level: "Must Have", desc: "Design and manage cloud infrastructure for enterprise clients with compliance requirements.", weight: 40 },
          { skill: "Terraform & Ansible", level: "Must Have", desc: "Infrastructure-as-Code for repeatable, auditable cloud provisioning across regions.", weight: 35 },
          { skill: "Kubernetes", level: "Nice to Have", desc: "Container orchestration for migrating enterprise workloads from on-prem to cloud.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Accenture", logo: "A", color: "from-purple-700 to-violet-500", industry: "Consulting",
    hq: "Pan India", tier: "Enterprise",
    roles: [
      {
        title: "Full Stack Developer",
        requirements: [
          { skill: "React & Node.js", level: "Must Have", desc: "Client-facing web applications using React frontend and Node.js/Express backends.", weight: 40 },
          { skill: "SQL & REST APIs", level: "Must Have", desc: "CRUD APIs with proper authentication, complex SQL queries, and ORM frameworks.", weight: 35 },
          { skill: "Agile Delivery", level: "Nice to Have", desc: "Sprint-based delivery, client demos, and iterative product development in consulting context.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "IBM", logo: "I", color: "from-blue-900 to-blue-600", industry: "Technology",
    hq: "Bangalore / Hyderabad", tier: "MNC",
    roles: [
      {
        title: "AI Engineer",
        requirements: [
          { skill: "Python & Deep Learning", level: "Must Have", desc: "PyTorch / TensorFlow for NLP, computer vision, and generative AI model development.", weight: 40 },
          { skill: "IBM Watson / Cloud AI", level: "Must Have", desc: "Watson APIs, watsonx platform for enterprise AI deployments and integration.", weight: 35 },
          { skill: "MLOps on Cloud", level: "Nice to Have", desc: "Model lifecycle management, drift detection, and A/B testing for production AI systems.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Deloitte", logo: "D", color: "from-green-700 to-emerald-500", industry: "Consulting",
    hq: "Pan India", tier: "MNC",
    roles: [
      {
        title: "Technology Consultant",
        requirements: [
          { skill: "Cloud & Architecture", level: "Must Have", desc: "AWS/Azure solution architecture for enterprise digital transformation projects.", weight: 40 },
          { skill: "Python & Data Analytics", level: "Must Have", desc: "Data analysis, dashboards, and Python automation for consulting deliverables.", weight: 35 },
          { skill: "Client Communication", level: "Must Have", desc: "Translate technical solutions to business value, executive presentations, and documentation.", weight: 25 },
        ],
      },
      {
        title: "Cybersecurity Analyst",
        requirements: [
          { skill: "SIEM & Threat Detection", level: "Must Have", desc: "Splunk / Microsoft Sentinel for log analysis, threat hunting, and incident response.", weight: 40 },
          { skill: "Network Security", level: "Must Have", desc: "Firewalls, IDS/IPS, VPNs, and zero-trust network architecture implementation.", weight: 35 },
          { skill: "CISSP / Security Certifications", level: "Nice to Have", desc: "Industry certifications demonstrating formal security knowledge and compliance expertise.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "MakeMyTrip", logo: "M", color: "from-red-700 to-orange-400", industry: "Travel Tech",
    hq: "Gurugram", tier: "Unicorn",
    roles: [
      {
        title: "React Developer",
        requirements: [
          { skill: "React & TypeScript", level: "Must Have", desc: "Complex travel booking flows with multi-step forms, real-time price updates, and seat maps.", weight: 40 },
          { skill: "Redux & GraphQL", level: "Must Have", desc: "State management for cart, bookings, and search filters across travel product categories.", weight: 35 },
          { skill: "Performance Optimization", level: "Must Have", desc: "Search result page optimization, lazy loading of hotel images, and TTI improvements.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "ShareChat", logo: "S", color: "from-yellow-600 to-amber-400", industry: "Social Media",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "ML Engineer (Video AI)",
        requirements: [
          { skill: "Python & PyTorch", level: "Must Have", desc: "Deep learning for video understanding, content moderation, and recommendation models.", weight: 45 },
          { skill: "NLP & Multilingual Models", level: "Must Have", desc: "Indian language NLP, multilingual embeddings, and low-resource language model adaptation.", weight: 35 },
          { skill: "MLOps & Deployment", level: "Nice to Have", desc: "Model serving with Triton, A/B testing frameworks, and GPU cluster management.", weight: 20 },
        ],
      },
    ],
  },
  {
    name: "Freshworks", logo: "F", color: "from-green-600 to-teal-400", industry: "SaaS",
    hq: "Chennai / Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "Senior Software Engineer",
        requirements: [
          { skill: "Ruby on Rails / React", level: "Must Have", desc: "Full-stack SaaS features in Rails backend with React frontend using component-driven design.", weight: 40 },
          { skill: "PostgreSQL & Redis", level: "Must Have", desc: "Multi-tenant database patterns, background jobs with Sidekiq, and Redis for queuing.", weight: 35 },
          { skill: "Kafka & Event-Driven", level: "Nice to Have", desc: "Asynchronous workflows for CRM, helpdesk, and customer engagement product features.", weight: 25 },
        ],
      },
    ],
  },
  {
    name: "Byju's", logo: "B", color: "from-purple-800 to-fuchsia-500", industry: "EdTech",
    hq: "Bangalore", tier: "Unicorn",
    roles: [
      {
        title: "React Native Developer",
        requirements: [
          { skill: "React Native", level: "Must Have", desc: "Cross-platform app development with React Native for video learning and interactive content.", weight: 45 },
          { skill: "Redux & JavaScript", level: "Must Have", desc: "State management for offline learning, progress sync, and content playback controls.", weight: 35 },
          { skill: "Performance & Animations", level: "Nice to Have", desc: "Reanimated 2 for smooth animations and performance optimization for low-end Android devices.", weight: 20 },
        ],
      },
    ],
  },
];

// ─── Demo Candidate Scenarios ─────────────────────────────────────────────────
const CANDIDATE_SCENARIOS = [
  {
    id: "strong",
    label: "Strong Candidate",
    emoji: "🟢",
    color: "text-success",
    borderColor: "border-success/30",
    bgColor: "from-success/15 to-success/5",
    glowClass: "shadow-[0_0_24px_rgba(52,211,153,0.25)]",
    verdictBadge: "success" as const,
    verdict: "Strong Fit",
    name: "Arjun Sharma",
    baseScore: 88,
    description: "5+ years experience, well-rounded technical background matching typical senior roles",
    resume: "Senior Software Engineer with 5+ years of experience. Expert in React, TypeScript, Node.js, and system design. Built scalable microservices on AWS handling 1M+ requests/day. Strong in data structures and algorithms. Led a team of 6 engineers. Proficient in Python, Java, PostgreSQL, Redis, and Kafka. Solid understanding of distributed systems, CAP theorem, and high-availability architecture.",
  },
  {
    id: "partial",
    label: "Mid-Level Candidate",
    emoji: "🟡",
    color: "text-warning",
    borderColor: "border-warning/30",
    bgColor: "from-warning/15 to-warning/5",
    glowClass: "shadow-[0_0_24px_rgba(252,211,77,0.25)]",
    verdictBadge: "warning" as const,
    verdict: "Partial Fit",
    name: "Priya Nair",
    baseScore: 55,
    description: "2-3 years experience, solid fundamentals but missing some advanced skills",
    resume: "Frontend Developer with 2.5 years of experience. Proficient in React and JavaScript. Basic TypeScript usage — mostly type annotations, no generics. Built small to medium web applications. Limited backend experience. No cloud deployment experience. Familiar with REST APIs and Git. Used Redux in one project.",
  },
  {
    id: "weak",
    label: "Entry-Level Candidate",
    emoji: "🔴",
    color: "text-danger",
    borderColor: "border-danger/30",
    bgColor: "from-danger/15 to-danger/5",
    glowClass: "shadow-[0_0_24px_rgba(248,113,113,0.25)]",
    verdictBadge: "danger" as const,
    verdict: "Not a Fit",
    name: "Ravi Kumar",
    baseScore: 18,
    description: "Fresher / career-changer — significant skill gaps for the selected role",
    resume: "Recent graduate with B.Com degree. Completed a 3-month web development bootcamp. Knows basic HTML, CSS, and some JavaScript. Built a to-do app. No professional experience. No knowledge of frameworks, cloud, databases, or system design. Interested in transitioning into software development.",
  },
];

// ─── AI Matching Logic ────────────────────────────────────────────────────────
function computeScenarioResult(
  company: typeof COMPANIES[0],
  role: typeof COMPANIES[0]["roles"][0],
  candidate: typeof CANDIDATE_SCENARIOS[0]
) {
  const resumeLower = candidate.resume.toLowerCase();

  const breakdown = role.requirements.map((req) => {
    const keywords = req.skill.toLowerCase().split(/[\s/&]+/).filter(w => w.length > 2);
    const hits = keywords.filter(kw => resumeLower.includes(kw)).length;
    const ratio = hits / Math.max(keywords.length, 1);

    let status: "pass" | "partial" | "fail";
    let evidence: string;

    if (candidate.id === "strong") {
      status = ratio > 0.3 ? "pass" : ratio > 0 ? "partial" : "fail";
      evidence = status === "pass"
        ? `Resume demonstrates strong ${req.skill} experience with relevant keywords and context.`
        : `Resume mentions ${req.skill}-adjacent skills but lacks direct depth.`;
    } else if (candidate.id === "partial") {
      status = ratio > 0.5 ? "pass" : ratio > 0.2 ? "partial" : "fail";
      evidence = status === "pass"
        ? `Candidate shows working knowledge of ${req.skill}.`
        : status === "partial"
        ? `Limited ${req.skill} exposure — foundational only, not production-depth.`
        : `No evidence of ${req.skill} in resume. Critical gap for this role.`;
    } else {
      status = ratio > 0.7 ? "partial" : "fail";
      evidence = status === "fail"
        ? `No ${req.skill} experience found. Bootcamp background does not cover this requirement.`
        : `Very basic exposure to ${req.skill} — insufficient for the role.`;
    }

    return { ...req, status, evidence };
  });

  const passCount = breakdown.filter(b => b.status === "pass").length;
  const partialCount = breakdown.filter(b => b.status === "partial").length;
  const totalWeight = breakdown.reduce((a, b) => a + b.weight, 0);
  const earnedWeight = breakdown.reduce((a, b) =>
    a + (b.status === "pass" ? b.weight : b.status === "partial" ? b.weight * 0.45 : 0), 0);
  const rawScore = Math.round((earnedWeight / totalWeight) * 100);
  // Blend with scenario base score for realism
  const score = Math.round(rawScore * 0.6 + candidate.baseScore * 0.4);

  // Generate rejection reason
  const missingSkills = breakdown.filter(b => b.status === "fail").map(b => b.skill);
  let rejectionReason: string | null = null;
  if (score < 70 && missingSkills.length > 0) {
    rejectionReason = `Candidate is missing critical requirements: ${missingSkills.join(", ")}. ${
      candidate.id === "weak"
        ? `A ${company.name} ${role.title} role requires ${role.requirements[0].level === "Must Have" ? "professional-level" : "solid"} ${role.requirements[0].skill} — which is not demonstrated in the resume.`
        : `The depth of experience required for ${company.name}'s engineering bar is not yet demonstrated.`
    }`;
  }

  // Generate suggestions
  const suggestions: string[] = [];
  breakdown.filter(b => b.status !== "pass").forEach(b => {
    if (b.status === "fail") {
      suggestions.push(`🎯 Build hands-on experience with ${b.skill} — ${b.desc.split(".")[0]}.`);
    } else if (b.status === "partial") {
      suggestions.push(`📈 Deepen your ${b.skill} skills beyond basics — work on a real production project demonstrating this.`);
    }
  });

  if (candidate.id === "weak") {
    suggestions.push(`🏁 ${company.name} is highly competitive. Start with ${company.industry === "IT Services" ? "entry-level IT service companies" : "smaller startups"} to build 2+ years of industry experience first.`);
    suggestions.push(`📚 Enroll in a structured 6-month full-stack program covering ${role.requirements.map(r => r.skill).slice(0, 2).join(" and ")}.`);
  } else if (candidate.id === "partial") {
    suggestions.push(`💼 Contribute to open-source projects at ${company.name}'s engineering level to demonstrate the required skills.`);
    suggestions.push(`📝 Update your HireFlow resume highlighting measurable impact — scale of systems, user counts, and performance improvements.`);
  } else {
    suggestions.push(`✅ Your profile is a strong match! Apply directly and prepare for ${company.name}'s specific interview process.`);
    suggestions.push(`🎤 Study ${company.name}'s engineering blog and prepare system design examples specific to ${company.industry}.`);
  }

  return { score, breakdown, rejectionReason, suggestions: suggestions.slice(0, 4) };
}

// ── TIER BADGE ─────────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  MNC: "bg-ai-light text-ai border-ai/20",
  Unicorn: "bg-primary-light text-primary border-primary/20",
  Enterprise: "bg-surface-3 text-text-secondary border-border",
};

// ══════════════════════════════════════════════════════════════════════════════
export function MatchingDemo() {
  const [companySearch, setCompanySearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES[0] | null>(null);
  const [selectedRole, setSelectedRole] = useState<typeof COMPANIES[0]["roles"][0] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState(CANDIDATE_SCENARIOS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof computeScenarioResult> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const industries = ["All", ...Array.from(new Set(COMPANIES.map(c => c.industry)))];
  const filteredCompanies = COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.roles.some(r => r.title.toLowerCase().includes(companySearch.toLowerCase()));
    return matchSearch && (industryFilter === "All" || c.industry === industryFilter);
  });

  const handleRoleSelect = (company: typeof COMPANIES[0], role: typeof COMPANIES[0]["roles"][0]) => {
    setSelectedCompany(company);
    setSelectedRole(role);
    setResult(null);
    setShowSuggestions(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnalyze = () => {
    if (!selectedCompany || !selectedRole) return;
    setAnalyzing(true);
    setResult(null);
    setShowSuggestions(false);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(computeScenarioResult(selectedCompany, selectedRole, selectedCandidate));
    }, 2200);
  };

  const scoreColor = result
    ? result.score >= 75 ? "text-success"
    : result.score >= 45 ? "text-warning"
    : "text-danger"
    : "text-ai";

  const scoreBg = result
    ? result.score >= 75 ? "from-success/15 to-success/5 border-success/30 shadow-[0_0_24px_rgba(52,211,153,0.25)]"
    : result.score >= 45 ? "from-warning/15 to-warning/5 border-warning/30 shadow-[0_0_24px_rgba(252,211,77,0.25)]"
    : "from-danger/15 to-danger/5 border-danger/30 shadow-[0_0_24px_rgba(248,113,113,0.25)]"
    : "";

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navbar ── */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-[24px] h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[18px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-[24px]">
            <Link to="/jobs" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">Browse Jobs</Link>
            <Link to="/portal" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors">Candidate Portal</Link>
          </div>
          <div className="flex items-center gap-[10px]">
            <Link to="/login" className="px-[16px] py-[8px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all">Sign In</Link>
            <Link to="/register">
              <Button variant="header" className="h-[40px] px-[18px] text-[14px]">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-[24px] py-[56px] page-enter">
        {/* ── Hero ── */}
        <div className="text-center mb-[56px] max-w-[820px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[24px] shadow-glow-violet">
            <Brain className="w-[14px] h-[14px] stroke-[2px]" />
            Live AI Analysis — 25 Real Companies · 40+ Roles
          </div>
          <h1 className="text-[44px] md:text-[56px] font-extrabold text-text mb-[18px] tracking-[-0.04em] leading-[1.05]">
            See exactly how AI{" "}
            <span className="gradient-text">evaluates your fit</span>
          </h1>
          <p className="text-[17px] text-text-secondary leading-[28px]">
            Pick any company and role from 25 real organizations — Google, Razorpay, Zomato and more.
            Choose a candidate profile and watch the AI explain every match decision with evidence and personalised suggestions.
          </p>
        </div>

        {/* ── Step 1: Pick Company & Role ── */}
        <div className="mb-[40px]">
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[32px] h-[32px] rounded-full bg-primary text-white flex items-center justify-center text-[14px] font-bold shrink-0">1</div>
            <h2 className="text-[18px] font-bold text-text">Select a Company & Role to Evaluate Against</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-[10px] mb-[20px]">
            <div className="relative flex-1">
              <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-muted" />
              <input
                type="text" placeholder="Search companies, roles, tech skills..."
                value={companySearch} onChange={e => setCompanySearch(e.target.value)}
                className="w-full h-[44px] pl-[42px] pr-[14px] rounded-xl bg-surface border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
              />
            </div>
            <div className="flex items-center gap-[8px]">
              <Filter className="w-[14px] h-[14px] text-text-muted shrink-0" />
              <select
                value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                className="h-[44px] px-[14px] rounded-xl bg-surface border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
              >
                {industries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          {/* Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[14px]">
            {filteredCompanies.map(company => (
              <div
                key={company.name}
                className={`bg-surface rounded-xl border shadow-xs overflow-hidden transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md ${
                  selectedCompany?.name === company.name ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-border-strong"
                }`}
              >
                {/* Company Header */}
                <div className={`bg-gradient-to-r ${company.color} px-[16px] py-[12px] flex items-center gap-[12px]`}>
                  <div className="w-[38px] h-[38px] rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-[16px] font-extrabold text-white shrink-0">
                    {company.logo}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <h3 className="text-[15px] font-bold text-white">{company.name}</h3>
                      <span className={`text-[10px] font-bold px-[7px] py-[2px] rounded-full border ${TIER_COLORS[company.tier]}`}>{company.tier}</span>
                    </div>
                    <p className="text-[11px] text-white/70 flex items-center gap-[4px] mt-[1px]">
                      <MapPin className="w-[9px] h-[9px]" />{company.hq} · {company.industry}
                    </p>
                  </div>
                </div>

                {/* Roles */}
                <div className="p-[12px] space-y-[6px]">
                  {company.roles.map((role, ri) => (
                    <button
                      key={ri}
                      onClick={() => handleRoleSelect(company, role)}
                      className={`w-full flex items-center justify-between p-[12px] rounded-lg border text-left transition-all group ${
                        selectedCompany?.name === company.name && selectedRole?.title === role.title
                          ? "border-primary bg-primary-light/30 text-primary"
                          : "border-border hover:border-border-accent hover:bg-surface-2/60 text-text-secondary hover:text-text"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold truncate">{role.title}</p>
                        <p className="text-[11px] text-text-muted mt-[2px]">{role.requirements.length} requirements · {role.requirements.filter(r => r.level === "Must Have").length} must-have</p>
                      </div>
                      <div className={`flex items-center gap-[4px] text-[11px] font-bold shrink-0 ml-[8px] transition-all ${
                        selectedCompany?.name === company.name && selectedRole?.title === role.title
                          ? "text-primary" : "text-text-muted group-hover:text-primary"
                      }`}>
                        {selectedCompany?.name === company.name && selectedRole?.title === role.title ? (
                          <CheckCircle className="w-[14px] h-[14px]" />
                        ) : (
                          <Target className="w-[14px] h-[14px]" />
                        )}
                        Select
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredCompanies.length === 0 && (
              <div className="col-span-3 bg-surface rounded-xl border border-border p-[48px] text-center">
                <Building2 className="w-[36px] h-[36px] text-text-muted mx-auto mb-[10px] opacity-40" />
                <p className="text-[14px] text-text-secondary">No companies match your search</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2: Pick Candidate ── */}
        <div className={`mb-[40px] transition-opacity duration-300 ${selectedRole ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[32px] h-[32px] rounded-full bg-primary text-white flex items-center justify-center text-[14px] font-bold shrink-0">2</div>
            <h2 className="text-[18px] font-bold text-text">Select a Candidate Profile to Test</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
            {CANDIDATE_SCENARIOS.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedCandidate(c); setResult(null); }}
                className={`p-[20px] rounded-xl border-2 text-left transition-all ${
                  selectedCandidate.id === c.id
                    ? `bg-gradient-to-br ${c.bgColor} ${c.borderColor} ${c.glowClass}`
                    : "border-border bg-surface hover:border-border-strong hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center gap-[10px] mb-[10px]">
                  <span className="text-[22px]">{c.emoji}</span>
                  <div>
                    <p className={`text-[14px] font-bold ${selectedCandidate.id === c.id ? c.color : "text-text"}`}>{c.label}</p>
                    <p className="text-[11px] text-text-muted">{c.name}</p>
                  </div>
                </div>
                <p className="text-[12px] text-text-secondary leading-[18px]">{c.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 3: Run Analysis ── */}
        {selectedRole && (
          <div className="mb-[40px]">
            <div className="flex items-center gap-[12px] mb-[20px]">
              <div className="w-[32px] h-[32px] rounded-full bg-primary text-white flex items-center justify-center text-[14px] font-bold shrink-0">3</div>
              <h2 className="text-[18px] font-bold text-text">Run AI Match Analysis</h2>
            </div>

            {/* Selected context */}
            <div className="bg-surface rounded-xl border border-border p-[20px] mb-[16px] flex flex-col sm:flex-row items-start sm:items-center gap-[16px]">
              <div className="flex-1">
                <p className="text-[13px] text-text-muted mb-[4px]">Analyzing candidate against:</p>
                <p className="text-[16px] font-bold text-text">{selectedCandidate.name} <span className="text-text-muted font-normal">→</span> {selectedRole.title} <span className="text-text-muted font-normal">at</span> {selectedCompany?.name}</p>
              </div>
              <div className="bg-surface-2 rounded-xl border border-border p-[12px] max-w-[380px] text-[12px] text-text-secondary leading-[18px] italic">
                "{selectedCandidate.resume.slice(0, 140)}..."
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full h-[56px] text-[16px] font-bold text-white rounded-xl bg-gradient-to-r from-ai-dark to-ai shadow-glow-violet hover:scale-[1.005] active:scale-[0.998] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-[12px]"
            >
              {analyzing ? (
                <><RefreshCw className="w-[18px] h-[18px] animate-spin" /> Running AI Analysis for {selectedCompany?.name}...</>
              ) : (
                <><Brain className="w-[18px] h-[18px] stroke-[1.5px]" /> Run AI Match Analysis</>
              )}
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-[20px] animate-slide-up">
            {/* Score card */}
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${scoreBg} border p-[36px]`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[24px]">
                {/* Score ring */}
                <div className="relative w-[100px] h-[100px] shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="9"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.score / 100)}`}
                      strokeLinecap="round" className={scoreColor}
                      style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-[28px] font-extrabold ${scoreColor} leading-none`}>{result.score}%</span>
                    <span className="text-[10px] text-text-muted mt-[2px]">match</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[12px] mb-[10px] flex-wrap">
                    <h2 className="text-[22px] font-bold text-text tracking-[-0.02em]">
                      {selectedCandidate.name} → {selectedRole?.title} at {selectedCompany?.name}
                    </h2>
                    <Badge variant={selectedCandidate.verdictBadge}>{selectedCandidate.verdict}</Badge>
                  </div>
                  {result.rejectionReason && (
                    <div className="flex items-start gap-[10px] p-[14px] rounded-xl bg-danger-bg border border-danger/20">
                      <XCircle className="w-[15px] h-[15px] text-danger shrink-0 mt-[1px]" />
                      <p className="text-[13px] text-text-secondary leading-[20px]">
                        <span className="font-bold text-danger">Rejection Reason: </span>
                        {result.rejectionReason}
                      </p>
                    </div>
                  )}
                  {result.score >= 75 && (
                    <div className="flex items-start gap-[10px] p-[14px] rounded-xl bg-success-bg border border-success/20">
                      <CheckCircle className="w-[15px] h-[15px] text-success shrink-0 mt-[1px]" />
                      <p className="text-[13px] text-text-secondary leading-[20px]">
                        <span className="font-bold text-success">Strong Match: </span>
                        Candidate profile aligns well with {selectedCompany?.name}'s requirements for this role. Recommend proceeding to technical screening.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-surface rounded-2xl border border-border p-[28px] shadow-xs">
              <h3 className="text-[16px] font-bold text-text mb-[18px] tracking-[-0.01em] flex items-center gap-[10px]">
                <Target className="w-[15px] h-[15px] text-primary" />
                Skill-by-Skill Breakdown — {selectedCompany?.name} Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
                {result.breakdown.map((item, i) => {
                  const cfg = {
                    pass: { icon: CheckCircle, color: "text-success", bg: "bg-success-bg border-success/20", label: "Met" },
                    partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-bg border-warning/20", label: "Partial" },
                    fail: { icon: XCircle, color: "text-danger", bg: "bg-danger-bg border-danger/20", label: "Not Met" },
                  }[item.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className={`rounded-xl border p-[18px] ${cfg.bg}`}>
                      <div className="flex items-center justify-between mb-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <Icon className={`w-[14px] h-[14px] ${cfg.color} stroke-[2px]`} />
                          <h4 className="text-[13px] font-bold text-text">{item.skill}</h4>
                        </div>
                        <div className="flex items-center gap-[6px]">
                          <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                          <Badge variant={item.level === "Must Have" ? "primary" : "warning"} className="text-[9px]">{item.level}</Badge>
                        </div>
                      </div>
                      <p className="text-[12px] text-text-secondary leading-[18px] mb-[10px]">
                        <span className="font-semibold text-text">Evidence: </span>
                        "{item.evidence}"
                      </p>
                      <div className="h-[4px] rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.status === "pass" ? "bg-success" : item.status === "partial" ? "bg-warning" : "bg-danger"}`}
                          style={{ width: item.status === "pass" ? "100%" : item.status === "partial" ? "45%" : "8%", transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted mt-[4px]">
                        <span>Weight: {item.weight}%</span>
                        <span>{item.desc.split(".")[0]}.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between px-[28px] py-[20px] hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-[18px] h-[18px] text-primary stroke-[1.5px]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-text">AI Improvement Suggestions for {selectedCompany?.name}</p>
                      <p className="text-[12px] text-text-secondary">{result.suggestions.length} personalised steps to close the gap and improve your match score</p>
                    </div>
                  </div>
                  {showSuggestions ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                </button>
                {showSuggestions && (
                  <div className="px-[28px] pb-[24px] border-t border-border pt-[20px] space-y-[10px] animate-slide-up">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-[14px] p-[16px] bg-surface-2 rounded-xl border border-border">
                        <div className="w-[26px] h-[26px] rounded-full bg-primary-light border border-primary/20 flex items-center justify-center shrink-0 mt-[1px]">
                          <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-[13px] text-text-secondary leading-[20px]">{s}</p>
                      </div>
                    ))}
                    <div className="flex gap-[12px] pt-[8px]">
                      <Link to="/portal" className="flex-1">
                        <button className="w-full h-[44px] text-[13px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.01] transition-all flex items-center justify-center gap-[8px]">
                          Upload Your Resume <ArrowRight className="w-[14px] h-[14px]" />
                        </button>
                      </Link>
                      <Link to="/jobs" className="flex-1">
                        <button className="w-full h-[44px] text-[13px] font-semibold text-text-secondary rounded-xl border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all">
                          Browse Matching Jobs
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CTA if no role selected ── */}
        {!selectedRole && !result && (
          <div className="mt-[20px] bg-gradient-to-br from-ai-dark/20 to-ai/5 border border-ai/20 rounded-2xl p-[32px] text-center">
            <Brain className="w-[36px] h-[36px] text-ai mx-auto mb-[12px]" />
            <p className="text-[15px] font-bold text-text mb-[6px]">Select a company and role above to begin</p>
            <p className="text-[13px] text-text-secondary">Choose from 25 real companies — Google, Zomato, Razorpay, Infosys and more.</p>
          </div>
        )}
      </div>
    </div>
  );
}
