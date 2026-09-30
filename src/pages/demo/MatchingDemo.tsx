// ============================================================
// HireFlow — AI Resume Analyzer v6
// 100 Companies × 10-15 Real Roles | Deep Contextual AI Engine
// ============================================================
import { useState, useRef, useCallback } from "react";
import {
  Brain, Target, CheckCircle, XCircle, AlertTriangle, Lightbulb,
  ArrowRight, RefreshCw, Building2, Search, Filter,
  Upload, FileText, Star, BarChart3, TrendingUp,
  ChevronDown, ChevronUp, Briefcase, Zap, BookOpen, X
} from "lucide-react";
import { Badge, Button } from "../../components/ui/Components";
import { PublicNavbar } from "../../components/layout/PublicNavbar";

// ════════════════════════════════════════════════════════════
// DEEP AI KNOWLEDGE BASE — Role Competency Profiles
// Each competency has contextual signals the AI looks for
// ════════════════════════════════════════════════════════════
const COMPETENCY_SIGNALS: Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }> = {
  dsa: {
    keywords: ["data structure", "algorithm", "leetcode", "competitive", "dynamic programming", "graph", "tree", "binary search", "sorting", "hash", "complexity", "o(n)", "o(log n)", "big o"],
    contextPhrases: ["solved 300+", "competitive programmer", "icpc", "codeforces", "hackerrank gold", "top", "rating"],
    redFlags: ["basic understanding", "learning data structures", "no coding experience"]
  },
  systemdesign: {
    keywords: ["microservices", "distributed system", "scalable", "high availability", "load balancer", "cdn", "cache", "sharding", "cap theorem", "kafka", "architecture", "design", "million users", "billion", "throughput"],
    contextPhrases: ["designed system", "architected", "handles million", "scale to", "99.9%", "fault tolerant", "horizontally scalable"],
    redFlags: ["basic architecture", "monolith only", "no distributed experience"]
  },
  java: {
    keywords: ["java", "spring boot", "spring", "jvm", "jpa", "hibernate", "maven", "gradle", "java ee", "multithreading", "concurrency", "jdk", "collections", "streams", "lambda"],
    contextPhrases: ["production java", "spring microservices", "jvm tuning", "millions of requests", "enterprise java"],
    redFlags: ["java basics", "learning java", "hello world"]
  },
  python: {
    keywords: ["python", "django", "flask", "fastapi", "pandas", "numpy", "pytorch", "tensorflow", "scikit-learn", "asyncio", "celery", "pytest", "pydantic"],
    contextPhrases: ["python expert", "5 years python", "ml pipeline", "production python", "data science"],
    redFlags: ["python beginner", "learning python", "basic python scripts"]
  },
  golang: {
    keywords: ["golang", "go language", "goroutine", "channel", "gin", "echo", "gorm", "grpc", "protobuf", "go modules"],
    contextPhrases: ["production go", "concurrent systems", "go routines", "high performance go"],
    redFlags: ["learning go", "go basics"]
  },
  nodejs: {
    keywords: ["node.js", "nodejs", "express", "fastify", "nestjs", "async await", "event loop", "npm", "yarn", "typescript node", "websocket", "restful"],
    contextPhrases: ["node production", "high throughput node", "event-driven", "real-time"],
    redFlags: ["node beginner", "learning node"]
  },
  react: {
    keywords: ["react", "react.js", "hooks", "redux", "context api", "next.js", "gatsby", "jsx", "tsx", "react native", "recoil", "zustand", "react query"],
    contextPhrases: ["react expert", "complex react app", "react at scale", "performance optimization react"],
    redFlags: ["learning react", "react basics", "tutorial project"]
  },
  typescript: {
    keywords: ["typescript", "ts", "tsx", "type-safe", "generics", "decorators", "type inference", "interfaces", "enums", "utility types"],
    contextPhrases: ["strict typescript", "typed system", "complex generics"],
    redFlags: ["just started typescript", "basic types only"]
  },
  aws: {
    keywords: ["aws", "amazon web services", "ec2", "s3", "lambda", "rds", "dynamodb", "sqs", "sns", "cloudfront", "iam", "vpc", "eks", "ecs", "cloudformation", "terraform aws"],
    contextPhrases: ["aws certified", "aws architect", "production aws", "multi-region", "aws solutions"],
    redFlags: ["no cloud experience", "learning aws", "basic aws"]
  },
  kubernetes: {
    keywords: ["kubernetes", "k8s", "docker", "container", "helm", "kubectl", "pod", "deployment", "service mesh", "istio", "argo", "gitops", "hpa", "autoscaling"],
    contextPhrases: ["production k8s", "managed kubernetes cluster", "eks/gke/aks", "100+ microservices"],
    redFlags: ["basic docker", "no k8s", "just learned containers"]
  },
  ml: {
    keywords: ["machine learning", "deep learning", "neural network", "tensorflow", "pytorch", "scikit", "xgboost", "lightgbm", "regression", "classification", "nlp", "computer vision", "transformer", "bert", "llm", "fine-tuning"],
    contextPhrases: ["trained model", "deployed ml", "ml pipeline", "production model", "research paper", "model accuracy", "a/b test model"],
    redFlags: ["ml basics", "andrew ng", "course project only"]
  },
  databases: {
    keywords: ["postgresql", "mysql", "mongodb", "cassandra", "redis", "elasticsearch", "oracle", "sql", "nosql", "database design", "query optimization", "indexing", "normalization", "acid", "replication", "sharding"],
    contextPhrases: ["billion rows", "query tuning", "database architect", "production dba", "schema design"],
    redFlags: ["basic sql", "tutorial sql", "no db experience"]
  },
  leadership: {
    keywords: ["lead", "mentor", "manage", "team lead", "principal", "architect", "hire", "grow team", "drive", "cross-functional", "stakeholder", "roadmap", "strategy"],
    contextPhrases: ["led team of", "managed engineers", "hired and grew", "drove initiative"],
    redFlags: ["no leadership", "individual contributor only"]
  },
  devops: {
    keywords: ["ci/cd", "jenkins", "github actions", "gitlab ci", "terraform", "ansible", "puppet", "chef", "monitoring", "prometheus", "grafana", "elk stack", "datadog", "pagerduty", "sre", "slo", "sla"],
    contextPhrases: ["production ci/cd", "zero downtime deployment", "infrastructure as code", "sre practice"],
    redFlags: ["no devops", "manual deployments", "learning ci/cd"]
  },
  security: {
    keywords: ["security", "pci-dss", "oauth", "jwt", "ssl/tls", "encryption", "xss", "sql injection", "owasp", "penetration testing", "vault", "iam", "rbac", "soc2", "hipaa", "gdpr"],
    contextPhrases: ["security audit", "penetration tested", "pci compliant", "hipaa certified", "vulnerability assessment"],
    redFlags: ["no security experience", "basic auth only"]
  },
  swift: {
    keywords: ["swift", "objective-c", "uikit", "swiftui", "xcode", "cocoa touch", "core data", "combine", "async await swift", "app store", "arkit", "coreml", "metal"],
    contextPhrases: ["shipped ios app", "app store", "million downloads", "production swift"],
    redFlags: ["learning swift", "basic ios", "tutorial app"]
  },
  kotlin: {
    keywords: ["kotlin", "android", "jetpack compose", "mvvm", "viewmodel", "livedata", "coroutines", "room db", "hilt", "dagger", "retrofit", "android studio", "play store"],
    contextPhrases: ["shipped android app", "million downloads", "production android", "compose expert"],
    redFlags: ["learning android", "basic android", "hello world app"]
  },
  finance: {
    keywords: ["fintech", "payment", "upi", "banking", "trading", "financial", "pci", "sebi", "rbi", "nbfc", "credit", "risk", "compliance", "regulatory", "aml", "kyc", "fix protocol"],
    contextPhrases: ["financial systems", "payment gateway", "high frequency", "risk engine", "regulatory reporting"],
    redFlags: ["no finance experience", "no banking knowledge"]
  },
  communication: {
    keywords: ["communication", "presentation", "stakeholder", "documentation", "mentoring", "collaboration", "cross-functional", "leadership", "client facing", "written"],
    contextPhrases: ["excellent communicator", "led workshops", "presented to", "clear technical writing"],
    redFlags: ["poor communication", "introvert"]
  }
};

// ════════════════════════════════════════════════════════════
// 100 COMPANIES × 10-15 ROLES — Real Data 2024-25
// ════════════════════════════════════════════════════════════
const COMPANIES = [
  // ── FAANG ─────────────────────────────────────────────────
  {
    id: "google", name: "Google", logo: "G", gradient: "from-blue-500 to-cyan-400",
    industry: "Technology", hq: "Mountain View, CA", tier: "FAANG",
    hiring2023: 11000, hiring2024: 6500, trend: "down",
    openRoles: 380, avgPackage: "₹45-80 LPA", glassdoor: 4.4,
    roles: [
      { title: "Software Engineer L3", level: "SDE-2", competencies: ["dsa", "systemdesign", "java", "python"], reqLevel: { dsa: "expert", systemdesign: "expert", java: "strong", python: "strong" }, desc: "Core product engineering. 4 coding rounds + system design + behavioural." },
      { title: "Software Engineer L4", level: "Senior SDE", competencies: ["dsa", "systemdesign", "java", "leadership"], reqLevel: { dsa: "expert", systemdesign: "expert", java: "expert", leadership: "strong" }, desc: "Senior IC role. Owns design decisions for large features across Google's product surface." },
      { title: "ML Engineer L4", level: "Senior", competencies: ["ml", "python", "dsa", "systemdesign"], reqLevel: { ml: "expert", python: "expert", dsa: "strong", systemdesign: "strong" }, desc: "Production ML at scale with TF/JAX. Model training pipelines, distributed training." },
      { title: "Site Reliability Engineer", level: "L4", competencies: ["kubernetes", "devops", "systemdesign", "golang"], reqLevel: { kubernetes: "expert", devops: "expert", systemdesign: "expert", golang: "strong" }, desc: "SRE with SLO ownership. Toil reduction, on-call, incident post-mortems." },
      { title: "Software Engineer — Android", level: "L3/L4", competencies: ["kotlin", "dsa", "systemdesign", "java"], reqLevel: { kotlin: "expert", dsa: "strong", systemdesign: "strong", java: "strong" }, desc: "Android apps used by 2 billion users. Compose, performance, and battery optimization." },
      { title: "Software Engineer — iOS", level: "L3/L4", competencies: ["swift", "dsa", "systemdesign", "databases"], reqLevel: { swift: "expert", dsa: "strong", systemdesign: "strong", databases: "working" }, desc: "iOS products including Chrome, Gmail, Maps, and YouTube for Apple platforms." },
      { title: "Data Engineer", level: "L4", competencies: ["python", "databases", "systemdesign", "ml"], reqLevel: { python: "expert", databases: "expert", systemdesign: "strong", ml: "working" }, desc: "Petabyte-scale data pipelines on BigQuery. Dataflow, Pub/Sub, and Apache Beam." },
      { title: "Cloud Architect (GCP)", level: "L5", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", kubernetes: "expert", devops: "expert", systemdesign: "expert" }, desc: "GCP product development — designing next-gen cloud primitives and managed services." },
      { title: "Security Engineer", level: "L4", competencies: ["security", "python", "dsa", "systemdesign"], reqLevel: { security: "expert", python: "strong", dsa: "strong", systemdesign: "strong" }, desc: "Google's vulnerability research, red teaming, and security infrastructure engineering." },
      { title: "Research Scientist (AI)", level: "L5/L6", competencies: ["ml", "python", "dsa", "communication"], reqLevel: { ml: "expert", python: "expert", dsa: "expert", communication: "expert" }, desc: "Novel AI research — Gemini, AlphaFold, and future AI systems. PhD strongly preferred." },
      { title: "Frontend Engineer", level: "L3/L4", competencies: ["react", "typescript", "dsa", "systemdesign"], reqLevel: { react: "expert", typescript: "strong", dsa: "strong", systemdesign: "strong" }, desc: "Google Search, Ads, and Workspace frontend. Angular/TypeScript ecosystem at scale." },
      { title: "DevOps Engineer", level: "L4", competencies: ["devops", "kubernetes", "golang", "systemdesign"], reqLevel: { devops: "expert", kubernetes: "expert", golang: "strong", systemdesign: "strong" }, desc: "Internal developer platforms, tooling, and CI/CD infrastructure for 100K+ engineers." },
    ]
  },
  {
    id: "microsoft", name: "Microsoft", logo: "M", gradient: "from-blue-600 to-blue-400",
    industry: "Technology", hq: "Redmond, WA", tier: "FAANG",
    hiring2023: 15000, hiring2024: 9000, trend: "down",
    openRoles: 520, avgPackage: "₹40-75 LPA", glassdoor: 4.3,
    roles: [
      { title: "Software Engineer II", level: "SDE-2", competencies: ["dsa", "systemdesign", "java", "typescript"], reqLevel: { dsa: "strong", systemdesign: "strong", java: "expert", typescript: "strong" }, desc: "Core engineering across Teams, Office, Windows, and Azure product lines." },
      { title: "Senior Software Engineer", level: "SDE-3", competencies: ["dsa", "systemdesign", "java", "leadership"], reqLevel: { dsa: "strong", systemdesign: "expert", java: "expert", leadership: "strong" }, desc: "Owns features end-to-end. Technical mentoring and cross-team collaboration expected." },
      { title: "Azure Cloud Engineer", level: "SDE-2/3", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", kubernetes: "expert", devops: "expert", systemdesign: "expert" }, desc: "Azure compute, networking, and data services for the world's second-largest cloud." },
      { title: "Frontend Engineer (React)", level: "SDE-2", competencies: ["react", "typescript", "dsa", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", dsa: "strong", systemdesign: "strong" }, desc: "Microsoft Fluent UI, Teams frontend, and Office web applications." },
      { title: "ML Engineer (Azure AI)", level: "Senior", competencies: ["ml", "python", "azure", "systemdesign"], reqLevel: { ml: "expert", python: "expert", systemdesign: "strong" }, desc: "Azure Cognitive Services, OpenAI integration, and Copilot AI platform engineering." },
      { title: "Site Reliability Engineer", level: "SDE-3", competencies: ["devops", "kubernetes", "systemdesign", "golang"], reqLevel: { devops: "expert", kubernetes: "expert", systemdesign: "expert" }, desc: "99.99% SLA for Azure services. Incident management, chaos engineering, auto-healing." },
      { title: "Security Engineer (MSRC)", level: "Senior", competencies: ["security", "java", "python", "dsa"], reqLevel: { security: "expert", java: "strong", python: "strong", dsa: "strong" }, desc: "Microsoft Security Response Center — vulnerability research, threat intelligence." },
      { title: "Principal Engineer", level: "L67", competencies: ["systemdesign", "leadership", "dsa", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", dsa: "expert", communication: "expert" }, desc: "Technical leadership across multiple orgs. Sets multi-year engineering direction." },
      { title: "Data Scientist", level: "SDE-2", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong", communication: "strong" }, desc: "Data science for LinkedIn, Bing, and Xbox analytics. A/B testing and causal inference." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "react", "java", "dsa"], reqLevel: { kotlin: "expert", java: "strong", dsa: "strong" }, desc: "Microsoft Teams, Outlook, and Office Android apps with 100M+ active users." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "typescript"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Teams, Outlook, and Office for iOS. Swift, Combine, and performance profiling." },
      { title: "DevOps Engineer", level: "SDE-2", competencies: ["devops", "kubernetes", "aws", "golang"], reqLevel: { devops: "expert", kubernetes: "strong", aws: "strong" }, desc: "Azure DevOps pipelines, GitHub Actions, and release engineering for 10,000+ services." },
    ]
  },
  {
    id: "amazon", name: "Amazon", logo: "A", gradient: "from-orange-500 to-yellow-400",
    industry: "E-commerce / Cloud", hq: "Seattle, WA", tier: "FAANG",
    hiring2023: 18000, hiring2024: 11000, trend: "down",
    openRoles: 640, avgPackage: "₹42-78 LPA", glassdoor: 3.9,
    roles: [
      { title: "Software Dev Engineer II", level: "SDE-2", competencies: ["dsa", "systemdesign", "java", "communication"], reqLevel: { dsa: "expert", systemdesign: "strong", java: "strong", communication: "expert" }, desc: "Amazon Leadership Principles are mandatory. 2-3 coding rounds + system design + LP interview." },
      { title: "Senior SDE", level: "SDE-3", competencies: ["dsa", "systemdesign", "java", "leadership"], reqLevel: { dsa: "expert", systemdesign: "expert", java: "expert", leadership: "strong" }, desc: "Owns end-to-end service reliability for critical Amazon services." },
      { title: "AWS Solutions Architect", level: "Senior", competencies: ["aws", "systemdesign", "security", "communication"], reqLevel: { aws: "expert", systemdesign: "expert", security: "strong", communication: "expert" }, desc: "Design multi-AZ, multi-region enterprise AWS architectures for Fortune 500 clients." },
      { title: "Machine Learning Engineer", level: "Senior", competencies: ["ml", "python", "java", "systemdesign"], reqLevel: { ml: "expert", python: "expert", systemdesign: "strong" }, desc: "Alexa AI, product recommendations, fraud detection, and supply chain ML at Amazon." },
      { title: "Data Engineer (Redshift/EMR)", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Petabyte-scale data warehousing on Redshift. Real-time analytics with Kinesis and EMR." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "dsa"], reqLevel: { react: "expert", typescript: "strong", nodejs: "strong", dsa: "strong" }, desc: "Amazon.com, Prime, and AWS Console frontend. React/TypeScript with 300M+ customers." },
      { title: "SDE — Alexa/Devices", level: "SDE-2", competencies: ["java", "ml", "systemdesign", "security"], reqLevel: { java: "strong", ml: "strong", systemdesign: "strong" }, desc: "Alexa voice AI, smart home integration, and Kindle/Echo device software." },
      { title: "Security Engineer (AWS)", level: "Senior", competencies: ["security", "aws", "python", "systemdesign"], reqLevel: { security: "expert", aws: "expert", python: "strong" }, desc: "AWS shared responsibility model, pen testing, and cloud security architecture." },
      { title: "Principal Engineer", level: "L7", competencies: ["systemdesign", "leadership", "communication", "dsa"], reqLevel: { systemdesign: "expert", leadership: "expert", communication: "expert", dsa: "expert" }, desc: "Technical direction across Amazon. Bar-raisers in interviews. Cross-org influence." },
      { title: "Supply Chain Engineer", level: "SDE-2", competencies: ["java", "python", "ml", "databases"], reqLevel: { java: "strong", python: "strong", ml: "working", databases: "strong" }, desc: "World's most complex supply chain optimized by ML and real-time systems at Amazon." },
      { title: "SDE — Payments", level: "SDE-2", competencies: ["java", "security", "databases", "systemdesign"], reqLevel: { java: "expert", security: "expert", databases: "strong", systemdesign: "strong" }, desc: "Amazon Pay global payment infrastructure — PCI-DSS Level 1, zero-downtime payment flows." },
    ]
  },
  {
    id: "meta", name: "Meta", logo: "∞", gradient: "from-blue-600 to-indigo-500",
    industry: "Social Media", hq: "Menlo Park, CA", tier: "FAANG",
    hiring2023: 7000, hiring2024: 4500, trend: "down",
    openRoles: 220, avgPackage: "₹50-90 LPA", glassdoor: 4.0,
    roles: [
      { title: "Software Engineer E4", level: "Mid-level", competencies: ["dsa", "systemdesign", "java", "python"], reqLevel: { dsa: "expert", systemdesign: "expert", java: "strong", python: "strong" }, desc: "Facebook, Instagram, WhatsApp engineering. Highest DSA bar in industry." },
      { title: "ML Engineer (Core AI)", level: "E5", competencies: ["ml", "python", "dsa", "systemdesign"], reqLevel: { ml: "expert", python: "expert", dsa: "expert", systemdesign: "expert" }, desc: "Ranking, feed algorithms, content moderation, and Llama model development." },
      { title: "Production Engineer", level: "E4", competencies: ["devops", "kubernetes", "systemdesign", "golang"], reqLevel: { devops: "expert", kubernetes: "expert", systemdesign: "expert" }, desc: "SRE at Meta scale — Thrift, ZooKeeper, Cassandra, TAO graph database reliability." },
      { title: "Android Engineer", level: "E4", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "expert", java: "strong" }, desc: "Facebook, Instagram, WhatsApp Android. Used by 3+ billion people globally." },
      { title: "iOS Engineer", level: "E4", competencies: ["swift", "dsa", "systemdesign", "security"], reqLevel: { swift: "expert", dsa: "expert", systemdesign: "strong" }, desc: "Meta's iOS apps. React Native bridge, C++, and native Swift for performance-critical paths." },
      { title: "Data Scientist (Product Analytics)", level: "E4", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "expert", communication: "expert" }, desc: "Drive product decisions with experimentation, causal inference, and growth analytics." },
      { title: "Security Engineer (Red Team)", level: "E5", competencies: ["security", "python", "systemdesign", "dsa"], reqLevel: { security: "expert", python: "expert", dsa: "strong" }, desc: "Offensive security, vulnerability research, and zero-day hunting across Meta's infrastructure." },
      { title: "Infrastructure Engineer", level: "E5", competencies: ["systemdesign", "devops", "kubernetes", "leadership"], reqLevel: { systemdesign: "expert", devops: "expert", leadership: "strong" }, desc: "Design Meta's data center infrastructure, networking (SDN), and storage at exabyte scale." },
      { title: "AR/VR Engineer", level: "E4", competencies: ["swift", "kotlin", "ml", "systemdesign"], reqLevel: { ml: "strong", systemdesign: "strong" }, desc: "Meta Quest, Ray-Ban Smart Glasses, and Horizon Worlds immersive tech engineering." },
      { title: "Research Scientist", level: "E5/E6", competencies: ["ml", "python", "communication", "dsa"], reqLevel: { ml: "expert", python: "expert", communication: "expert", dsa: "expert" }, desc: "FAIR (Fundamental AI Research) — publishing at NeurIPS, ICML, CVPR. PhD required." },
    ]
  },
  {
    id: "apple", name: "Apple", logo: "🍎", gradient: "from-gray-700 to-gray-500",
    industry: "Consumer Tech", hq: "Cupertino, CA", tier: "FAANG",
    hiring2023: 8000, hiring2024: 6000, trend: "stable",
    openRoles: 290, avgPackage: "₹48-85 LPA", glassdoor: 4.2,
    roles: [
      { title: "iOS Software Engineer", level: "ICT3/4", competencies: ["swift", "dsa", "systemdesign", "security"], reqLevel: { swift: "expert", dsa: "strong", systemdesign: "strong", security: "strong" }, desc: "iPhone, iPad, and Apple Watch apps and frameworks. Secrecy culture is paramount." },
      { title: "macOS Engineer", level: "ICT3/4", competencies: ["swift", "java", "dsa", "systemdesign"], reqLevel: { swift: "expert", java: "strong", dsa: "strong", systemdesign: "strong" }, desc: "macOS system frameworks, AppKit, SwiftUI, and Finder/Spotlight development." },
      { title: "ML Engineer (Core ML)", level: "ICT4", competencies: ["ml", "swift", "python", "systemdesign"], reqLevel: { ml: "expert", swift: "strong", python: "expert", systemdesign: "strong" }, desc: "On-device ML — Siri, face recognition, autocorrect, and CoreML framework." },
      { title: "Silicon Performance Engineer", level: "ICT4", competencies: ["dsa", "devops", "java", "security"], reqLevel: { dsa: "expert", systemdesign: "expert" }, desc: "Apple Silicon (M-series) performance optimization, CPU/GPU workload analysis." },
      { title: "Security Engineer", level: "ICT4", competencies: ["security", "swift", "python", "systemdesign"], reqLevel: { security: "expert", python: "strong", systemdesign: "expert" }, desc: "Secure Enclave, Face ID, encrypted messaging, and Apple's world-class security research." },
      { title: "Cloud Engineer (iCloud)", level: "ICT3/4", competencies: ["aws", "kubernetes", "databases", "systemdesign"], reqLevel: { aws: "strong", kubernetes: "strong", databases: "expert", systemdesign: "expert" }, desc: "iCloud stores 800 billion photos. Multi-petabyte storage, sync, and backup at global scale." },
      { title: "Compiler Engineer", level: "ICT4", competencies: ["java", "golang", "dsa", "systemdesign"], reqLevel: { dsa: "expert", systemdesign: "strong", java: "expert" }, desc: "LLVM, Swift compiler, and Clang development. Deep CS fundamentals in code generation." },
      { title: "Safari/WebKit Engineer", level: "ICT3/4", competencies: ["react", "javascript", "dsa", "security"], reqLevel: { react: "expert", dsa: "expert", security: "strong" }, desc: "WebKit browser engine powering 1 billion Safari users. Web standards, JS engine, privacy." },
      { title: "SRE (Infrastructure)", level: "ICT4", competencies: ["devops", "kubernetes", "systemdesign", "security"], reqLevel: { devops: "expert", kubernetes: "expert", systemdesign: "expert" }, desc: "Apple Store, App Store, and iCloud infrastructure reliability for launch-day 10x spikes." },
      { title: "Privacy Engineer", level: "ICT4", competencies: ["security", "swift", "communication", "systemdesign"], reqLevel: { security: "expert", communication: "strong", systemdesign: "strong" }, desc: "Differential privacy, on-device AI, and App Tracking Transparency framework engineering." },
    ]
  },
  // ── Indian Unicorns ───────────────────────────────────────
  {
    id: "flipkart", name: "Flipkart", logo: "F", gradient: "from-yellow-500 to-orange-400",
    industry: "E-commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 2000, hiring2024: 1800, trend: "stable",
    openRoles: 120, avgPackage: "₹25-50 LPA", glassdoor: 4.0,
    roles: [
      { title: "SDE-2 (Backend)", level: "Senior", competencies: ["java", "systemdesign", "databases", "dsa"], reqLevel: { java: "expert", systemdesign: "strong", databases: "strong", dsa: "expert" }, desc: "E-commerce platform APIs, catalog, and cart systems handling 100M+ users." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "Recommendation, search ranking, demand forecasting, and fraud detection ML models." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "strong", nodejs: "strong", dsa: "strong" }, desc: "Flipkart.com web platform. Next.js SSR for SEO, performance, and Indian mobile network optimization." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong", java: "strong" }, desc: "Flipkart app used by 100M users. Offline browsing, image optimization for low-bandwidth India." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "working" }, desc: "Customer behavior analytics, seller analytics, and supply chain data pipelines on Apache Spark." },
      { title: "SDE-2 (Payments)", level: "Senior", competencies: ["java", "security", "databases", "systemdesign"], reqLevel: { java: "expert", security: "strong", databases: "expert" }, desc: "PhonePe (formerly Flipkart payments) — UPI, wallet, EMI, and COD processing." },
      { title: "Platform Engineer", level: "SDE-2", competencies: ["kubernetes", "devops", "golang", "systemdesign"], reqLevel: { kubernetes: "expert", devops: "expert", golang: "strong" }, desc: "Internal developer platform — service mesh, deployment pipelines, and auto-scaling." },
      { title: "Search Engineer", level: "Senior", competencies: ["java", "databases", "ml", "systemdesign"], reqLevel: { java: "expert", databases: "expert", ml: "strong" }, desc: "Product search serving 1M+ queries/second. Elasticsearch, NLP query understanding, and ranking." },
      { title: "SDE-3 (Architecture)", level: "Principal", competencies: ["systemdesign", "leadership", "java", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", java: "expert", communication: "expert" }, desc: "Flip-kart's architecture council. Design systems for Big Billion Days (3x traffic surges)." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "java", "python", "systemdesign"], reqLevel: { security: "expert", python: "strong", java: "strong" }, desc: "Vulnerability assessment, bug bounty program management, and security tooling." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "kotlin"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Flipkart iOS app for Apple users. Shared codebase via React Native for new features." },
    ]
  },
  {
    id: "zomato", name: "Zomato", logo: "Z", gradient: "from-red-500 to-orange-400",
    industry: "Food Tech", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 1200, hiring2024: 900, trend: "down",
    openRoles: 75, avgPackage: "₹20-42 LPA", glassdoor: 3.8,
    roles: [
      { title: "Senior SDE (Backend)", level: "SDE-2", competencies: ["golang", "databases", "systemdesign", "dsa"], reqLevel: { golang: "expert", databases: "expert", systemdesign: "strong", dsa: "strong" }, desc: "Delivery routing, restaurant catalog, and live order tracking in Go microservices." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong" }, desc: "Zomato app for 80M+ monthly users. Real-time order tracking, map integration, and payments." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "ETA prediction, restaurant scoring, dynamic pricing, and personalized feed ranking." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong", communication: "strong" }, desc: "Food delivery economics — customer LTV, delivery partner incentive optimization, demand forecasting." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "dsa"], reqLevel: { react: "expert", typescript: "strong", nodejs: "strong" }, desc: "Zomato web experience — restaurant search, food ordering flow, and live tracking UI." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Zomato iOS app with real-time map tracking, restaurant discovery, and payment flows." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "golang", "systemdesign"], reqLevel: { kubernetes: "strong", devops: "expert", golang: "strong" }, desc: "Internal platform, monitoring, and deployment infrastructure for Zomato's microservices." },
      { title: "SDE-2 (Payments)", level: "Senior", competencies: ["java", "security", "databases", "systemdesign"], reqLevel: { java: "strong", security: "strong", databases: "strong" }, desc: "UPI, card, wallet, and COD payment flows. PCI-DSS compliance for Zomato Pay." },
      { title: "SDE-3 (Tech Lead)", level: "Principal", competencies: ["systemdesign", "leadership", "golang", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", golang: "expert", communication: "expert" }, desc: "Technical leadership for delivery experience squads. Designs systems for peak load events." },
      { title: "DevOps Engineer", level: "Senior", competencies: ["devops", "kubernetes", "aws", "golang"], reqLevel: { devops: "expert", kubernetes: "strong", aws: "strong" }, desc: "AWS GCP infrastructure, deployment pipelines, and monitoring for Zomato's services." },
    ]
  },
  {
    id: "razorpay", name: "Razorpay", logo: "R", gradient: "from-blue-800 to-blue-500",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 800, hiring2024: 650, trend: "stable",
    openRoles: 55, avgPackage: "₹25-52 LPA", glassdoor: 4.2,
    roles: [
      { title: "SDE-2 (Payments Core)", level: "Senior", competencies: ["nodejs", "databases", "security", "systemdesign"], reqLevel: { nodejs: "expert", databases: "expert", security: "expert", systemdesign: "strong" }, desc: "UPI switch, card vault, and payment routing. Zero-downtime, idempotent at ₹2 lakh crore processed." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "security", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", security: "expert", dsa: "strong" }, desc: "Checkout widget embedded in 500K+ merchant sites. Web security, CSP, and payment UX." },
      { title: "ML Engineer (Risk)", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "expert", python: "expert", finance: "strong", databases: "strong" }, desc: "Real-time fraud detection, risk scoring for merchants, and anomaly detection in payment flows." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "security", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", security: "strong", dsa: "strong" }, desc: "Razorpay Android SDK used by 500K+ merchant apps. Payment integration, UPI deep links." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "golang", "systemdesign"], reqLevel: { kubernetes: "expert", devops: "expert", golang: "strong" }, desc: "Razorpay's cloud infrastructure handling ₹20K crore daily transaction volume." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Payment analytics, merchant reporting, and regulatory reporting pipelines." },
      { title: "SDE-2 (API Products)", level: "Senior", competencies: ["nodejs", "databases", "security", "communication"], reqLevel: { nodejs: "expert", databases: "strong", security: "expert" }, desc: "Razorpay APIs consumed by 8M+ developers. API design, versioning, and documentation." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "python", "databases", "systemdesign"], reqLevel: { security: "expert", python: "strong", systemdesign: "strong" }, desc: "PCI-DSS Level 1 compliance, penetration testing, and security architecture for fintech." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "security", "dsa", "systemdesign"], reqLevel: { swift: "expert", security: "strong", dsa: "strong" }, desc: "Razorpay iOS SDK and Razorpay app for merchant management. Payment UX on Apple platforms." },
      { title: "SDE-3 (Tech Lead)", level: "Principal", competencies: ["systemdesign", "leadership", "nodejs", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", nodejs: "expert", communication: "expert" }, desc: "Architect Razorpay's next-gen payment infrastructure. Set bar for reliability and compliance." },
      { title: "Backend Engineer (Lending)", level: "SDE-2", competencies: ["java", "databases", "finance", "security"], reqLevel: { java: "strong", databases: "expert", finance: "expert", security: "strong" }, desc: "RazorpayX lending products — BNPL, business credit lines, and working capital loans." },
    ]
  },
  {
    id: "phonepe", name: "PhonePe", logo: "P", gradient: "from-violet-700 to-purple-400",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1200, hiring2024: 1000, trend: "stable",
    openRoles: 90, avgPackage: "₹22-48 LPA", glassdoor: 4.1,
    roles: [
      { title: "Senior Software Engineer", level: "SDE-2", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "expert", databases: "expert", systemdesign: "strong", dsa: "expert" }, desc: "UPI payments at 100M+ daily transactions. Vitess MySQL sharding for financial data." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "security", "dsa", "java"], reqLevel: { kotlin: "expert", security: "strong", dsa: "strong", java: "strong" }, desc: "PhonePe app — India's #1 UPI app with 500M registered users. Machine coding rounds standard." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "security", "dsa", "systemdesign"], reqLevel: { swift: "expert", security: "strong", dsa: "strong" }, desc: "PhonePe iOS app for iOS users. Payment flows, biometric authentication, and security." },
      { title: "Data Scientist (Risk)", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "expert", python: "expert", finance: "strong", databases: "expert" }, desc: "Fraud detection, credit risk scoring for PhonePe Wealth, and ML-driven user segmentation." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "aws", "systemdesign"], reqLevel: { kubernetes: "expert", devops: "expert", aws: "strong" }, desc: "AWS-based infrastructure for PhonePe's payment stack. Site reliability for 99.99% uptime." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "security", "systemdesign"], reqLevel: { react: "expert", typescript: "strong", security: "strong" }, desc: "PhonePe Business web dashboard for merchants managing payment analytics." },
      { title: "SDE-2 (Insurance)", level: "Senior", competencies: ["java", "databases", "finance", "systemdesign"], reqLevel: { java: "strong", databases: "strong", finance: "strong" }, desc: "PhonePe Insurance marketplace — policy management, claims, and premium calculation engine." },
      { title: "ML Engineer (Voice/NLP)", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", systemdesign: "strong" }, desc: "Voice-based UPI payments in Indic languages. Hindi, Telugu, Tamil NLP and ASR models." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "java", "python", "finance"], reqLevel: { security: "expert", java: "strong", finance: "strong" }, desc: "RBI compliance, PPI regulations, and cyber security for 500M user financial data." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Transaction analytics, regulatory reporting (RBI, SEBI), and data warehouse at petabyte scale." },
    ]
  },
  {
    id: "swiggy", name: "Swiggy", logo: "S", gradient: "from-orange-600 to-amber-400",
    industry: "Food Tech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1400, hiring2024: 1100, trend: "stable",
    openRoles: 88, avgPackage: "₹22-45 LPA", glassdoor: 3.9,
    roles: [
      { title: "SDE-2 (Platform)", level: "Senior", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "expert", databases: "strong", systemdesign: "expert", dsa: "strong" }, desc: "Delivery orchestration microservices on GCP. Istio service mesh, gRPC, and circuit breaking." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong", java: "strong" }, desc: "Swiggy consumer and delivery partner apps. Real-time tracking and seamless checkout." },
      { title: "ML Engineer (Recommendations)", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "Personalized food recommendations, restaurant ranking, and search relevance." },
      { title: "Instamart Engineer", level: "SDE-2", competencies: ["golang", "databases", "systemdesign", "ml"], reqLevel: { golang: "strong", databases: "strong", systemdesign: "strong", ml: "working" }, desc: "10-minute grocery delivery — dark store inventory, slot management, and demand forecasting." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "expert", communication: "strong" }, desc: "Delivery time prediction, restaurant partner profitability analytics, and A/B testing." },
      { title: "Platform SRE", level: "Senior", competencies: ["devops", "kubernetes", "golang", "systemdesign"], reqLevel: { devops: "expert", kubernetes: "expert", golang: "strong" }, desc: "GCP-based SRE for Swiggy's delivery platform. Canary deployments, chaos engineering." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "kotlin"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Swiggy iOS app — map integration, order tracking, and payment flows for Apple users." },
      { title: "SDE-2 (Payments)", level: "Senior", competencies: ["java", "security", "databases", "finance"], reqLevel: { java: "strong", security: "strong", databases: "strong", finance: "strong" }, desc: "Swiggy Money wallet, UPI integration, and subscription (One membership) payment flows." },
      { title: "Tech Lead (Architecture)", level: "SDE-3", competencies: ["systemdesign", "leadership", "java", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", java: "expert", communication: "expert" }, desc: "Architect Swiggy's delivery platform for peak loads (IPL nights, weekend rush: 5x normal)." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "strong", nodejs: "strong" }, desc: "Swiggy web experience — restaurant listing, order tracking, and subscription management." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Event-driven data pipelines on GCP — BigQuery, Dataflow, and Pub/Sub for analytics." },
    ]
  },
  {
    id: "cred", name: "CRED", logo: "C", gradient: "from-zinc-800 to-zinc-600",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 500, hiring2024: 450, trend: "stable",
    openRoles: 35, avgPackage: "₹28-58 LPA", glassdoor: 4.3,
    roles: [
      { title: "Android Engineer", level: "Senior", competencies: ["kotlin", "dsa", "systemdesign", "security"], reqLevel: { kotlin: "expert", dsa: "strong", systemdesign: "strong", security: "strong" }, desc: "CRED is India's benchmark Android UI. Compose animations, custom transitions, GPU profiling." },
      { title: "iOS Engineer", level: "Senior", competencies: ["swift", "dsa", "security", "systemdesign"], reqLevel: { swift: "expert", dsa: "strong", security: "strong" }, desc: "Best-in-class iOS UX. SwiftUI animations, custom gesture recognizers, and secure enclave integration." },
      { title: "Backend Engineer", level: "SDE-2", competencies: ["java", "databases", "security", "systemdesign"], reqLevel: { java: "expert", databases: "expert", security: "expert", systemdesign: "strong" }, desc: "Credit card bill payment, CRED store, rewards engine, and CRED Cash backend." },
      { title: "ML Engineer (Credit)", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "expert", python: "expert", finance: "expert", databases: "strong" }, desc: "Credit scoring, behavioural analytics, and personalisation for India's high-credit-score users." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "security", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", security: "strong" }, desc: "CRED web dashboard for payments, offers, and rentals. Design-driven engineering." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "finance", "communication"], reqLevel: { ml: "strong", python: "expert", finance: "strong", communication: "strong" }, desc: "User lifetime value, recommendation systems for CRED store, and risk-based pricing models." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "java", "systemdesign"], reqLevel: { kubernetes: "expert", devops: "expert", java: "strong" }, desc: "Reliability engineering for CRED's fintech platform. Zero-downtime deploys for sensitive financial ops." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "python", "java", "finance"], reqLevel: { security: "expert", finance: "expert", python: "strong" }, desc: "Financial data protection, KYC pipeline security, and fraud prevention for premium users." },
      { title: "SDE-3 (Tech Lead)", level: "Principal", competencies: ["systemdesign", "leadership", "java", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", java: "expert" }, desc: "Architect CRED's product engineering with obsessive attention to UX and reliability." },
      { title: "Golang Engineer", level: "SDE-2", competencies: ["golang", "databases", "systemdesign", "security"], reqLevel: { golang: "expert", databases: "strong", security: "strong" }, desc: "High-performance Go microservices for CRED's transaction processing and rewards engine." },
    ]
  },
  {
    id: "zerodha", name: "Zerodha", logo: "Ze", gradient: "from-blue-600 to-sky-400",
    industry: "Stock Broking", hq: "Bangalore", tier: "Startup",
    hiring2023: 180, hiring2024: 160, trend: "stable",
    openRoles: 12, avgPackage: "₹20-45 LPA", glassdoor: 4.5,
    roles: [
      { title: "Backend Engineer (Go)", level: "Senior", competencies: ["golang", "databases", "finance", "systemdesign"], reqLevel: { golang: "expert", databases: "expert", finance: "expert", systemdesign: "expert" }, desc: "Zerodha's entire stack is Go. Order management, risk engine, and market data processing." },
      { title: "Frontend Engineer (Kite)", level: "Senior", competencies: ["react", "typescript", "finance", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", finance: "strong" }, desc: "Kite trading platform used by 10M+ traders. Real-time charts, order placement, and portfolio P&L." },
      { title: "Android Engineer", level: "Senior", competencies: ["kotlin", "finance", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", finance: "strong", dsa: "strong" }, desc: "Kite Android app for trading. Real-time WebSocket feeds and options chain visualization." },
      { title: "iOS Engineer", level: "Senior", competencies: ["swift", "finance", "dsa", "systemdesign"], reqLevel: { swift: "expert", finance: "strong", dsa: "strong" }, desc: "Kite iOS app — market watch, order management, and fund transfer for active traders." },
      { title: "Data Engineer", level: "Senior", competencies: ["python", "databases", "finance", "systemdesign"], reqLevel: { python: "expert", databases: "expert", finance: "expert" }, desc: "Market data pipelines, trade analytics, and regulatory reporting (SEBI, NSE/BSE)." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "expert", python: "expert", finance: "expert" }, desc: "Risk model, portfolio analytics, and nudge systems for Smallcase-style investment products." },
      { title: "DevOps Engineer", level: "Senior", competencies: ["devops", "golang", "kubernetes", "security"], reqLevel: { devops: "expert", golang: "strong", kubernetes: "strong", security: "strong" }, desc: "Exchange connectivity infrastructure. 99.999% uptime during NSE/BSE trading hours." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "golang", "finance", "systemdesign"], reqLevel: { security: "expert", golang: "strong", finance: "expert" }, desc: "SEBI regulations, two-factor auth, and trading platform security for ₹5 lakh crore AUM." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "golang", "devops", "finance"], reqLevel: { kubernetes: "expert", golang: "expert", devops: "expert" }, desc: "Low-latency order routing and market data distribution infrastructure." },
      { title: "Open Source Engineer", level: "Senior", competencies: ["golang", "react", "databases", "communication"], reqLevel: { golang: "expert", react: "strong", communication: "expert" }, desc: "Zerodha actively maintains 20+ open source projects. GitHub profile is a primary evaluation signal." },
    ]
  },
  // ── IT Services ───────────────────────────────────────────
  {
    id: "tcs", name: "TCS", logo: "T", gradient: "from-blue-700 to-blue-500",
    industry: "IT Services", hq: "Mumbai", tier: "IT Services",
    hiring2023: 40000, hiring2024: 35000, trend: "stable",
    openRoles: 2800, avgPackage: "₹3.5-8 LPA (Entry)", glassdoor: 3.8,
    roles: [
      { title: "Systems Engineer (Fresher)", level: "Entry Level", competencies: ["java", "databases", "communication", "dsa"], reqLevel: { java: "working", databases: "working", communication: "strong", dsa: "working" }, desc: "TCS NQT and CodeVita tests. BFSI, retail, and telecom client projects." },
      { title: "IT Analyst (2-4Y)", level: "Junior-Mid", competencies: ["java", "databases", "aws", "devops"], reqLevel: { java: "strong", databases: "strong", aws: "working" }, desc: "Project execution on client accounts. Spring Boot microservices for enterprise clients." },
      { title: "Assistant Consultant (4-6Y)", level: "Mid-Senior", competencies: ["java", "aws", "systemdesign", "communication"], reqLevel: { java: "strong", aws: "strong", systemdesign: "strong", communication: "strong" }, desc: "Team lead on delivery projects. Client communication and technical solution ownership." },
      { title: "Consultant (6-9Y)", level: "Senior", competencies: ["systemdesign", "aws", "leadership", "communication"], reqLevel: { systemdesign: "expert", aws: "strong", leadership: "strong", communication: "expert" }, desc: "Solution architect on large engagements. Pre-sales technical presentations and SOW writing." },
      { title: "Cloud Engineer", level: "Mid-level", competencies: ["aws", "kubernetes", "devops", "java"], reqLevel: { aws: "strong", kubernetes: "working", devops: "strong" }, desc: "TCS's cloud migration and modernization practice — AWS, Azure, GCP for Fortune 500 clients." },
      { title: "Data Engineer", level: "Mid-level", competencies: ["python", "databases", "aws", "communication"], reqLevel: { python: "strong", databases: "strong", aws: "working" }, desc: "ETL pipelines, data warehouse migration, and BI dashboards for enterprise clients." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "aws", "communication"], reqLevel: { ml: "strong", python: "expert", aws: "working", communication: "strong" }, desc: "TCS.ai — AI solutions for banking, retail, and manufacturing clients using pre-built AI platforms." },
      { title: "SAP Consultant", level: "Mid-level", competencies: ["databases", "java", "communication", "devops"], reqLevel: { databases: "strong", communication: "strong" }, desc: "SAP S/4HANA implementations for TCS's manufacturing and retail clients." },
      { title: "Cybersecurity Analyst", level: "Mid-level", competencies: ["security", "devops", "communication", "databases"], reqLevel: { security: "strong", communication: "strong" }, desc: "SOC operations, threat intelligence, and VAPT (Vulnerability Assessment and Penetration Testing)." },
      { title: "Full Stack Developer", level: "Mid-level", competencies: ["react", "java", "databases", "aws"], reqLevel: { react: "strong", java: "strong", databases: "strong" }, desc: "Digital transformation projects — React/Angular frontend with Java Spring backend for enterprise clients." },
      { title: "Quality Engineer", level: "Mid-level", competencies: ["java", "python", "databases", "communication"], reqLevel: { java: "working", python: "working", communication: "strong" }, desc: "Test automation with Selenium, API testing with Postman/RestAssured, and performance testing." },
    ]
  },
  {
    id: "infosys", name: "Infosys", logo: "I", gradient: "from-blue-600 to-sky-400",
    industry: "IT Services", hq: "Bangalore", tier: "IT Services",
    hiring2023: 35000, hiring2024: 30000, trend: "stable",
    openRoles: 2400, avgPackage: "₹3.6-9 LPA (Entry)", glassdoor: 3.9,
    roles: [
      { title: "Systems Engineer (Fresher)", level: "Entry Level", competencies: ["java", "databases", "communication", "python"], reqLevel: { java: "working", databases: "working", communication: "strong" }, desc: "InfyTQ assessment and campus hiring. Training at Mysore campus before project allocation." },
      { title: "Senior Systems Engineer (2-4Y)", level: "Junior-Mid", competencies: ["java", "databases", "aws", "react"], reqLevel: { java: "strong", databases: "strong", aws: "working" }, desc: "Project delivery on BFSI, retail, and healthcare client accounts." },
      { title: "Technology Analyst (4-6Y)", level: "Mid-Senior", competencies: ["java", "aws", "systemdesign", "leadership"], reqLevel: { java: "strong", aws: "strong", systemdesign: "strong", leadership: "working" }, desc: "Module lead on delivery projects. Technical client interaction and code review." },
      { title: "Senior Technology Analyst (6-9Y)", level: "Senior", competencies: ["systemdesign", "aws", "leadership", "communication"], reqLevel: { systemdesign: "expert", aws: "strong", leadership: "strong", communication: "expert" }, desc: "Solution design for enterprise engagements. Proposal writing and architecture review." },
      { title: "Cloud Engineer (Azure/AWS/GCP)", level: "Mid-level", competencies: ["aws", "kubernetes", "devops", "java"], reqLevel: { aws: "strong", kubernetes: "working", devops: "strong" }, desc: "Infosys Cobalt cloud platform — cloud migration, modernization, and managed services." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", communication: "strong" }, desc: "Infosys Nia AI platform — ML models for banking, retail, and supply chain clients." },
      { title: "React/Angular Developer", level: "Mid-level", competencies: ["react", "typescript", "nodejs", "java"], reqLevel: { react: "strong", typescript: "working", java: "working" }, desc: "Digital UX for Infosys's digital transformation projects across global clients." },
      { title: "Java Developer", level: "Mid-level", competencies: ["java", "databases", "aws", "devops"], reqLevel: { java: "expert", databases: "strong", aws: "working" }, desc: "Spring Boot microservices for enterprise clients in BFSI, telecom, and manufacturing." },
      { title: "SAP HANA Developer", level: "Mid-level", competencies: ["databases", "java", "communication"], reqLevel: { databases: "expert", communication: "strong" }, desc: "SAP S/4HANA development and support for Fortune 500 client implementations." },
      { title: "QA Engineer", level: "Mid-level", competencies: ["java", "python", "communication", "databases"], reqLevel: { java: "working", python: "working", communication: "strong" }, desc: "Test automation, performance testing (JMeter), and API testing for enterprise client applications." },
    ]
  },
  // ── MNCs ──────────────────────────────────────────────────
  {
    id: "uber", name: "Uber", logo: "U", gradient: "from-gray-900 to-gray-700",
    industry: "Mobility / Tech", hq: "San Francisco (India: Bangalore)", tier: "MNC",
    hiring2023: 1800, hiring2024: 1200, trend: "down",
    openRoles: 90, avgPackage: "₹35-65 LPA", glassdoor: 4.1,
    roles: [
      { title: "Software Engineer II", level: "SDE-2", competencies: ["golang", "systemdesign", "databases", "dsa"], reqLevel: { golang: "expert", systemdesign: "expert", databases: "expert", dsa: "expert" }, desc: "Dispatch, pricing, driver-rider matching in Go microservices on Uber's YARPC service mesh." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", systemdesign: "strong" }, desc: "ETA prediction, surge pricing ML, fraud detection, and H3 geospatial demand forecasting." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", nodejs: "strong" }, desc: "Uber Eats web, driver app dashboard, and Uber for Business fleet management UI." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "expert", java: "strong" }, desc: "Uber rider app and Uber Driver app. Real-time map UX and payment flows." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "security"], reqLevel: { swift: "expert", dsa: "expert", systemdesign: "strong" }, desc: "Uber iOS rider and driver apps. Real-time geolocation, Apple Pay integration." },
      { title: "Data Engineer", level: "Senior", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Petabyte-scale analytics on Uber's Hudi data lake. Apache Spark and Presto for trip analytics." },
      { title: "SRE", level: "Senior", competencies: ["devops", "kubernetes", "golang", "systemdesign"], reqLevel: { devops: "expert", kubernetes: "expert", golang: "strong" }, desc: "Mission-critical reliability for Uber's real-time dispatch system — 50M+ trips daily." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "golang", "python", "systemdesign"], reqLevel: { security: "expert", golang: "strong", python: "strong" }, desc: "Uber's fraud, identity, and application security. Bug bounty program management." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "golang", "aws"], reqLevel: { kubernetes: "expert", devops: "expert", golang: "expert", aws: "strong" }, desc: "Uber's Peloton scheduler (Kubernetes alternative), service mesh, and deployment platform." },
      { title: "Staff Engineer", level: "Senior+", competencies: ["systemdesign", "leadership", "golang", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", golang: "expert", communication: "expert" }, desc: "Cross-org technical leadership. Uber ATG autonomous driving data infrastructure architecture." },
    ]
  },
  {
    id: "adobe", name: "Adobe", logo: "Ad", gradient: "from-red-700 to-orange-500",
    industry: "SaaS / Creative", hq: "San Jose (India: Noida)", tier: "MNC",
    hiring2023: 3000, hiring2024: 2800, trend: "stable",
    openRoles: 180, avgPackage: "₹30-60 LPA", glassdoor: 4.4,
    roles: [
      { title: "Computer Scientist (Creative Cloud)", level: "SDE-2", competencies: ["java", "dsa", "systemdesign", "databases"], reqLevel: { java: "expert", dsa: "expert", systemdesign: "strong" }, desc: "Photoshop, Illustrator, or Premiere Pro feature development. C++ and Java for core product." },
      { title: "ML Engineer (Sensei AI)", level: "Senior", competencies: ["ml", "python", "dsa", "systemdesign"], reqLevel: { ml: "expert", python: "expert", dsa: "strong", systemdesign: "strong" }, desc: "Adobe Sensei — generative AI (Firefly), image AI, video AI, and content intelligence." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "systemdesign", "dsa"], reqLevel: { react: "expert", typescript: "expert", dsa: "strong" }, desc: "Adobe Express and Creative Cloud web apps. React/TypeScript design system development." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "java", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", java: "strong", dsa: "strong" }, desc: "Adobe Lightroom, Photoshop Express, and Scan Android apps with complex media editing features." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "java"], reqLevel: { swift: "expert", dsa: "expert", systemdesign: "strong" }, desc: "Adobe Lightroom and Photoshop iOS — Apple Pencil support, ProRAW editing, and iCloud sync." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong", communication: "strong" }, desc: "Adobe Analytics, customer experience intelligence, and A/B testing for Creative Cloud." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "aws", "devops", "systemdesign"], reqLevel: { kubernetes: "expert", aws: "expert", devops: "expert" }, desc: "Adobe Experience Cloud infrastructure — 99.9% SLA for AEM, Analytics, and Target." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "java", "python", "systemdesign"], reqLevel: { security: "expert", java: "strong", python: "strong" }, desc: "Adobe's product security, penetration testing, and DRM (Digital Rights Management) engineering." },
      { title: "Backend Engineer (Document Cloud)", level: "SDE-2", competencies: ["java", "databases", "security", "aws"], reqLevel: { java: "expert", databases: "strong", security: "strong", aws: "strong" }, desc: "Adobe PDF services, Acrobat Sign e-signatures, and document intelligence APIs." },
      { title: "Computer Scientist (Graphics)", level: "SDE-3", competencies: ["java", "ml", "dsa", "systemdesign"], reqLevel: { java: "expert", dsa: "expert", ml: "strong", systemdesign: "expert" }, desc: "Rendering algorithms, color science, and GPU shader programming for Creative Cloud products." },
    ]
  },
  {
    id: "jpmorgan", name: "J.P. Morgan", logo: "JP", gradient: "from-blue-900 to-blue-700",
    industry: "Banking / Tech", hq: "New York (India: Hyderabad)", tier: "MNC",
    hiring2023: 6000, hiring2024: 5500, trend: "stable",
    openRoles: 420, avgPackage: "₹25-55 LPA", glassdoor: 4.0,
    roles: [
      { title: "Software Engineer (Core Banking)", level: "Associate", competencies: ["java", "databases", "security", "finance"], reqLevel: { java: "expert", databases: "expert", security: "strong", finance: "strong" }, desc: "Trade order management, risk systems, and core banking APIs for JPMC's investment bank." },
      { title: "Quantitative Analyst", level: "Associate", competencies: ["python", "ml", "finance", "databases"], reqLevel: { python: "expert", ml: "strong", finance: "expert", databases: "strong" }, desc: "Options pricing models, risk factor analysis, and algorithmic trading signal development." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "expert", python: "expert", finance: "strong" }, desc: "Fraud detection, AML (Anti-Money Laundering) models, and credit risk ML for Chase banking." },
      { title: "Cloud Engineer (AWS/Azure)", level: "Senior", competencies: ["aws", "kubernetes", "devops", "security"], reqLevel: { aws: "expert", kubernetes: "strong", devops: "strong", security: "expert" }, desc: "JPMC Athena (AWS-based cloud). FedRAMP compliance, financial-grade data residency." },
      { title: "Frontend Engineer", level: "Associate", competencies: ["react", "typescript", "security", "systemdesign"], reqLevel: { react: "expert", typescript: "strong", security: "strong" }, desc: "J.P. Morgan Markets, Corporate Finance Portal, and Chase web banking UIs." },
      { title: "Data Engineer", level: "Associate", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "expert", databases: "expert", aws: "strong", finance: "strong" }, desc: "Trade data pipelines, regulatory reporting (MiFID II, Basel III, CCAR), and risk analytics data." },
      { title: "Security Engineer (Cybersecurity)", level: "Senior", competencies: ["security", "python", "aws", "communication"], reqLevel: { security: "expert", python: "strong", aws: "strong", communication: "strong" }, desc: "Financial-grade cybersecurity — threat intelligence, SIEM operations, and zero-trust architecture." },
      { title: "Android Engineer", level: "Associate", competencies: ["kotlin", "security", "java", "finance"], reqLevel: { kotlin: "expert", security: "strong", java: "strong" }, desc: "Chase Bank Android app with 30M+ users. Biometric auth, PCI-DSS compliance." },
      { title: "iOS Engineer", level: "Associate", competencies: ["swift", "security", "finance", "dsa"], reqLevel: { swift: "expert", security: "expert", finance: "strong" }, desc: "Chase iOS app. Secure enclave for Face ID, Apple Pay integration, and financial account management." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "aws", "security"], reqLevel: { kubernetes: "expert", devops: "expert", aws: "expert", security: "strong" }, desc: "Financial-grade platform engineering. 99.999% SLA, disaster recovery, and SOX compliance." },
    ]
  },
  // ── More Indian companies ─────────────────────────────────
  {
    id: "blinkit", name: "Blinkit (Zomato)", logo: "Bl", gradient: "from-yellow-500 to-lime-400",
    industry: "Quick Commerce", hq: "Gurugram", tier: "Startup",
    hiring2023: 600, hiring2024: 800, trend: "up",
    openRoles: 58, avgPackage: "₹22-45 LPA", glassdoor: 4.0,
    roles: [
      { title: "Backend Engineer (Go/Rust)", level: "SDE-2", competencies: ["golang", "databases", "systemdesign", "dsa"], reqLevel: { golang: "expert", databases: "expert", systemdesign: "expert", dsa: "strong" }, desc: "Inventory engine in Rust (rare in India!), delivery routing in Go. 10-minute delivery system." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong", systemdesign: "strong" }, desc: "Blinkit consumer app — real-time inventory, address detection, and payment flows." },
      { title: "ML Engineer (Demand Forecasting)", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "Per-SKU demand forecasting for 3000+ products per dark store, spoilage prediction." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong", communication: "strong" }, desc: "Unit economics, customer cohort analysis, and dark store profitability optimization." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "strong" }, desc: "Blinkit web and merchant dashboard for dark store operations management." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Blinkit iOS app with instant checkout, address management, and real-time tracking." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert" }, desc: "Real-time inventory events pipeline, dark store operations analytics, and delivery metrics." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "golang", "aws"], reqLevel: { kubernetes: "expert", devops: "expert", golang: "strong" }, desc: "GCP-based infrastructure for Blinkit's growing dark store network across 40+ cities." },
      { title: "Geospatial Engineer", level: "SDE-2", competencies: ["golang", "databases", "ml", "systemdesign"], reqLevel: { golang: "strong", databases: "expert", ml: "working" }, desc: "H3 geospatial indexing, dark store coverage area optimization, and hyperlocal demand mapping." },
    ]
  },
  {
    id: "meesho", name: "Meesho", logo: "Me", gradient: "from-pink-500 to-rose-400",
    industry: "Social Commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1100, hiring2024: 900, trend: "stable",
    openRoles: 68, avgPackage: "₹18-38 LPA", glassdoor: 3.9,
    roles: [
      { title: "Backend Engineer", level: "SDE-2", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "strong", databases: "strong", systemdesign: "strong", dsa: "strong" }, desc: "Catalog, orders, and supplier management for India's largest social commerce platform." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "dsa", "java", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong" }, desc: "Meesho app optimized for 150M+ rural users on low-end Android devices with 2G connectivity." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert" }, desc: "Product recommendation, image-based search (vernacular users), and price optimization." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "strong" }, desc: "Meesho Supplier Panel and web storefront. Optimized for Tier-2/3 city users." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong" }, desc: "Supplier profitability, logistics optimization, and customer segmentation for rural e-commerce." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "aws", "systemdesign"], reqLevel: { kubernetes: "strong", devops: "expert", aws: "strong" }, desc: "AWS-based infrastructure scaling from 0 to 1M orders per day during sale events." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Meesho iOS app for resellers and end consumers. Product discovery and order management." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert" }, desc: "Supplier analytics, shipping performance data pipelines, and return rate analysis." },
      { title: "Growth Engineer", level: "SDE-2", competencies: ["nodejs", "databases", "ml", "react"], reqLevel: { nodejs: "strong", databases: "strong", ml: "working" }, desc: "A/B testing infrastructure, referral system, and notification optimization for 150M users." },
    ]
  },
  {
    id: "freshworks", name: "Freshworks", logo: "FW", gradient: "from-green-600 to-teal-400",
    industry: "SaaS / CRM", hq: "Chennai", tier: "Unicorn",
    hiring2023: 900, hiring2024: 700, trend: "stable",
    openRoles: 58, avgPackage: "₹20-42 LPA", glassdoor: 4.0,
    roles: [
      { title: "Senior Software Engineer (Rails)", level: "SDE-2", competencies: ["ruby", "databases", "systemdesign", "react"], reqLevel: { databases: "expert", systemdesign: "strong", react: "strong" }, desc: "Freshdesk and Freshservice in Ruby on Rails. Multi-tenant SaaS with 60,000+ customers." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "expert", nodejs: "strong" }, desc: "Freshchat, Freshdesk agent UI, and customer portal. Design system and accessibility-first." },
      { title: "Backend Engineer (Node.js)", level: "SDE-2", competencies: ["nodejs", "databases", "systemdesign", "aws"], reqLevel: { nodejs: "expert", databases: "expert", systemdesign: "strong", aws: "strong" }, desc: "Freshchat real-time messaging, webhook delivery, and API platform for 60K business customers." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert" }, desc: "Freddy AI — customer support automation, ticket summarization, and intent classification." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "java", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong" }, desc: "Freshservice and Freshteam mobile apps for IT and HR teams." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "kotlin"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Freshdesk, Freshchat, and Freshservice iOS apps for enterprise customers." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert" }, desc: "Multi-tenant analytics pipelines, Freshinsight business analytics, and custom reporting." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "aws", "devops", "systemdesign"], reqLevel: { kubernetes: "expert", aws: "expert", devops: "expert" }, desc: "Freshworks Cloud on AWS — multi-region, enterprise-grade SaaS infrastructure for 60K accounts." },
      { title: "SDE-3 (Tech Lead)", level: "Principal", competencies: ["systemdesign", "leadership", "nodejs", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", communication: "expert" }, desc: "Lead feature squads for Freshdesk or Freshservice. Architecture for multi-tenant enterprise features." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "aws", "python", "communication"], reqLevel: { security: "expert", aws: "strong", communication: "strong" }, desc: "SOC2 Type II compliance, penetration testing, and data privacy for enterprise customer data." },
    ]
  },
  {
    id: "atlassian", name: "Atlassian", logo: "At", gradient: "from-blue-600 to-cyan-400",
    industry: "DevTools SaaS", hq: "Sydney (India: Bangalore)", tier: "MNC",
    hiring2023: 1200, hiring2024: 800, trend: "down",
    openRoles: 65, avgPackage: "₹35-70 LPA", glassdoor: 4.4,
    roles: [
      { title: "Software Engineer (Jira)", level: "Senior", competencies: ["java", "react", "systemdesign", "dsa"], reqLevel: { java: "expert", react: "strong", systemdesign: "expert", dsa: "strong" }, desc: "Jira Software backend — issues, workflows, and sprint management for 300,000 companies." },
      { title: "Frontend Engineer (Confluence)", level: "Senior", competencies: ["react", "typescript", "systemdesign", "dsa"], reqLevel: { react: "expert", typescript: "expert", systemdesign: "expert", dsa: "strong" }, desc: "Confluence collaborative editing — OT (Operational Transformation) and real-time sync." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert" }, desc: "Atlassian Intelligence — AI-powered Jira summarization, Confluence search, and code review." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "aws", "devops", "systemdesign"], reqLevel: { kubernetes: "expert", aws: "expert", devops: "expert" }, desc: "Atlassian Cloud on AWS. Multi-region infrastructure for 200K+ cloud customers." },
      { title: "Android Engineer", level: "Senior", competencies: ["kotlin", "java", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong", java: "strong" }, desc: "Jira, Confluence, and Trello Android apps for enterprise on-the-go teams." },
      { title: "iOS Engineer", level: "Senior", competencies: ["swift", "dsa", "systemdesign"], reqLevel: { swift: "expert", dsa: "strong", systemdesign: "strong" }, desc: "Atlassian iOS suite — Jira, Confluence, Trello, and Opsgenie for iOS users." },
      { title: "Data Engineer", level: "Senior", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert", aws: "strong" }, desc: "Product analytics, usage telemetry pipelines, and license compliance reporting at scale." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "aws", "python", "systemdesign"], reqLevel: { security: "expert", aws: "strong", systemdesign: "strong" }, desc: "SOC2, ISO 27001, and FedRAMP compliance. Penetration testing and vulnerability management." },
      { title: "Staff Engineer", level: "Senior+", competencies: ["systemdesign", "leadership", "java", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", java: "expert", communication: "expert" }, desc: "Cross-product technical leadership. Atlassian's next-gen architecture for Forge platform." },
    ]
  },
  {
    id: "wipro", name: "Wipro", logo: "W", gradient: "from-blue-700 to-indigo-500",
    industry: "IT Services", hq: "Bangalore", tier: "IT Services",
    hiring2023: 20000, hiring2024: 15000, trend: "down",
    openRoles: 1500, avgPackage: "₹3.5-9 LPA", glassdoor: 3.7,
    roles: [
      { title: "Project Engineer", level: "Entry", competencies: ["java", "databases", "communication", "python"], reqLevel: { java: "working", databases: "working", communication: "strong" }, desc: "Wipro Elite National Talent Hunt. Enterprise application development and maintenance." },
      { title: "Senior Software Engineer", level: "Mid", competencies: ["java", "aws", "databases", "react"], reqLevel: { java: "strong", aws: "working", databases: "strong" }, desc: "BFSI and Healthcare client projects. Spring Boot and REST API development." },
      { title: "Technical Lead", level: "Senior", competencies: ["systemdesign", "java", "leadership", "aws"], reqLevel: { systemdesign: "strong", java: "expert", leadership: "strong" }, desc: "Lead team of 5-10 engineers for offshore client delivery." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", kubernetes: "strong", systemdesign: "expert" }, desc: "Design cloud-native solutions for Fortune 500 digital transformations." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "communication"], reqLevel: { python: "strong", databases: "strong" }, desc: "Big Data pipelines, Hadoop to AWS/Azure migrations." },
      { title: "Full Stack Developer", level: "Mid", competencies: ["react", "nodejs", "databases", "typescript"], reqLevel: { react: "strong", nodejs: "strong" }, desc: "MERN/MEAN stack development for digital banking portals." },
      { title: "Cybersecurity Analyst", level: "Mid", competencies: ["security", "communication", "python"], reqLevel: { security: "strong" }, desc: "SOC operations, Identity and Access Management (IAM), and compliance." },
      { title: "QA Automation Engineer", level: "Mid", competencies: ["java", "python", "communication", "databases"], reqLevel: { java: "working" }, desc: "Selenium, Appium, and API automation frameworks." },
      { title: "SAP Consultant", level: "Mid", competencies: ["databases", "communication", "java"], reqLevel: { databases: "strong", communication: "strong" }, desc: "SAP ABAP, Fiori, and S/4HANA implementations." },
      { title: "AI/ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "aws"], reqLevel: { ml: "strong", python: "expert" }, desc: "Enterprise AI solutions — conversational AI, RPA, and predictive analytics." }
    ]
  },
  {
    id: "hcltech", name: "HCLTech", logo: "HCL", gradient: "from-blue-600 to-blue-400",
    industry: "IT Services", hq: "Noida", tier: "IT Services",
    hiring2023: 18000, hiring2024: 12000, trend: "down",
    openRoles: 1200, avgPackage: "₹3.5-10 LPA", glassdoor: 3.8,
    roles: [
      { title: "Software Engineer", level: "Entry", competencies: ["java", "python", "databases", "communication"], reqLevel: { java: "working", communication: "strong" }, desc: "Development and L3 support for telecom and aerospace clients." },
      { title: "Senior Developer", level: "Mid", competencies: ["java", "aws", "kubernetes", "databases"], reqLevel: { java: "strong", aws: "working" }, desc: "Core modernization projects. Monolith to microservices architecture." },
      { title: "Lead Engineer", level: "Senior", competencies: ["systemdesign", "java", "devops", "leadership"], reqLevel: { systemdesign: "strong", java: "expert", leadership: "working" }, desc: "Agile squad lead for European banking clients." },
      { title: "Cloud Infrastructure Specialist", level: "Senior", competencies: ["aws", "devops", "kubernetes", "python"], reqLevel: { aws: "expert", devops: "strong" }, desc: "Hybrid cloud management, Terraform, and CI/CD pipelines." },
      { title: "Data Scientist", level: "Mid", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "strong" }, desc: "Predictive maintenance models for manufacturing clients." },
      { title: "Embedded C/C++ Developer", level: "Mid", competencies: ["systemdesign", "communication", "databases"], reqLevel: { systemdesign: "working" }, desc: "Automotive (ADAS) and aero engineering services." },
      { title: "React Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "communication"], reqLevel: { react: "strong", typescript: "working" }, desc: "Frontend modernization for legacy enterprise portals." },
      { title: "Security Consultant", level: "Senior", competencies: ["security", "aws", "communication", "python"], reqLevel: { security: "expert", aws: "working" }, desc: "Cloud security architecture, threat modeling, and VAPT." },
      { title: "Network Engineer", level: "Mid", competencies: ["devops", "aws", "security", "communication"], reqLevel: { devops: "working", security: "working" }, desc: "SD-WAN, Cisco ACI, and enterprise network architecture." },
      { title: "ServiceNow Developer", level: "Mid", competencies: ["java", "databases", "communication", "react"], reqLevel: { java: "working" }, desc: "ITSM, ITOM, and custom workflow development on ServiceNow platform." }
    ]
  },
  {
    id: "techmahindra", name: "Tech Mahindra", logo: "TM", gradient: "from-red-600 to-red-400",
    industry: "IT Services", hq: "Pune", tier: "IT Services",
    hiring2023: 15000, hiring2024: 10000, trend: "down",
    openRoles: 900, avgPackage: "₹3.5-8.5 LPA", glassdoor: 3.6,
    roles: [
      { title: "Software Engineer", level: "Entry", competencies: ["java", "databases", "communication", "python"], reqLevel: { java: "working", databases: "working", communication: "strong" }, desc: "Telecom and manufacturing client projects. Development and integration." },
      { title: "Senior Software Engineer", level: "Mid", competencies: ["java", "aws", "databases", "react"], reqLevel: { java: "strong", aws: "working", databases: "strong" }, desc: "OSS/BSS systems development for global telecom operators." },
      { title: "Solution Architect", level: "Senior", competencies: ["systemdesign", "aws", "leadership", "communication"], reqLevel: { systemdesign: "expert", aws: "strong", leadership: "strong" }, desc: "5G integration, IoT platforms, and digital transformation architecture." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "devops"], reqLevel: { python: "strong", databases: "strong" }, desc: "Data pipelines for telecom analytics and customer churn prediction." },
      { title: "Blockchain Developer", level: "Mid", competencies: ["golang", "nodejs", "databases", "security"], reqLevel: { golang: "working", nodejs: "strong" }, desc: "Supply chain and telecom roaming blockchain solutions." },
      { title: "Frontend Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "communication"], reqLevel: { react: "strong", typescript: "working" }, desc: "Self-care portals and CRM UIs for telecom clients." },
      { title: "Cybersecurity Analyst", level: "Mid", competencies: ["security", "communication", "python", "devops"], reqLevel: { security: "strong", communication: "strong" }, desc: "Managed Security Services (MSSP) operations for enterprise clients." },
      { title: "Automation Tester", level: "Mid", competencies: ["java", "python", "communication", "databases"], reqLevel: { java: "working", python: "working" }, desc: "Test automation for large-scale telecom billing systems." },
      { title: "Oracle Apps DBA", level: "Senior", competencies: ["databases", "devops", "aws", "communication"], reqLevel: { databases: "expert" }, desc: "Database administration and cloud migration for Oracle E-Business Suite." },
      { title: "AI/ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "aws"], reqLevel: { ml: "strong", python: "expert" }, desc: "Generative AI applications and conversational bots for customer support." }
    ]
  },
  {
    id: "cognizant", name: "Cognizant", logo: "CTS", gradient: "from-blue-800 to-blue-600",
    industry: "IT Services", hq: "Teaneck, NJ (India: Chennai)", tier: "IT Services",
    hiring2023: 25000, hiring2024: 18000, trend: "down",
    openRoles: 1800, avgPackage: "₹4-10 LPA", glassdoor: 3.8,
    roles: [
      { title: "Programmer Analyst Trainee", level: "Entry", competencies: ["java", "databases", "communication", "python"], reqLevel: { java: "working", databases: "working", communication: "strong" }, desc: "GenC hiring. Training and deployment in healthcare and banking domains." },
      { title: "Associate", level: "Mid", competencies: ["java", "aws", "databases", "react"], reqLevel: { java: "strong", aws: "working", databases: "strong" }, desc: "Core development for top US healthcare and financial institutions." },
      { title: "Manager - Projects", level: "Senior", competencies: ["leadership", "systemdesign", "communication", "java"], reqLevel: { leadership: "expert", communication: "expert", systemdesign: "strong" }, desc: "Scrum master, project delivery, and stakeholder management." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", kubernetes: "strong", systemdesign: "expert" }, desc: "Multi-cloud strategy and migration architecture for Fortune 500 clients." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "finance"], reqLevel: { ml: "strong", python: "expert", finance: "working" }, desc: "Fraud detection models, healthcare claims analytics, and predictive modeling." },
      { title: "React Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "aws"], reqLevel: { react: "strong", typescript: "strong" }, desc: "Digital engineering projects. High-performance consumer-facing web apps." },
      { title: "Salesforce Developer", level: "Mid", competencies: ["java", "databases", "communication", "react"], reqLevel: { java: "working" }, desc: "Salesforce Lightning development for enterprise CRM implementations." },
      { title: "Security Engineer", level: "Mid", competencies: ["security", "aws", "python", "communication"], reqLevel: { security: "strong", aws: "working" }, desc: "Cloud security posture management and DevSecOps integration." },
      { title: "Performance Test Engineer", level: "Mid", competencies: ["java", "python", "databases", "devops"], reqLevel: { java: "working", devops: "working" }, desc: "LoadRunner, JMeter, and APM tools (Dynatrace, AppDynamics) expertise." },
      { title: "IoT Engineer", level: "Mid", competencies: ["python", "aws", "java", "systemdesign"], reqLevel: { python: "strong", aws: "strong" }, desc: "Connected devices, smart manufacturing, and IoT data pipelines." }
    ]
  },
  {
    id: "ltimindtree", name: "LTIMindtree", logo: "LTI", gradient: "from-blue-600 to-indigo-600",
    industry: "IT Services", hq: "Mumbai", tier: "IT Services",
    hiring2023: 12000, hiring2024: 9000, trend: "down",
    openRoles: 800, avgPackage: "₹4-12 LPA", glassdoor: 3.9,
    roles: [
      { title: "Software Engineer", level: "Entry", competencies: ["java", "databases", "communication", "python"], reqLevel: { java: "working", databases: "working", communication: "strong" }, desc: "Application development for banking, media, and tech clients." },
      { title: "Senior Software Engineer", level: "Mid", competencies: ["java", "aws", "kubernetes", "databases"], reqLevel: { java: "strong", aws: "strong", databases: "strong" }, desc: "Microservices development, API gateways, and cloud deployment." },
      { title: "Technical Architect", level: "Senior", competencies: ["systemdesign", "aws", "java", "leadership"], reqLevel: { systemdesign: "expert", aws: "strong", java: "expert" }, desc: "Design scalable architectures for digital transformation projects." },
      { title: "Data Engineer (Snowflake)", level: "Mid", competencies: ["python", "databases", "aws", "devops"], reqLevel: { python: "strong", databases: "expert", aws: "strong" }, desc: "Cloud data warehousing, ETL pipelines, and dbt." },
      { title: "Full Stack Developer", level: "Mid", competencies: ["react", "nodejs", "typescript", "databases"], reqLevel: { react: "strong", typescript: "strong", nodejs: "strong" }, desc: "MEAN/MERN stack for enterprise digital platforms." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "kubernetes", "aws", "python"], reqLevel: { devops: "strong", kubernetes: "working", aws: "strong" }, desc: "CI/CD, Infrastructure as Code (Terraform), and monitoring setup." },
      { title: "QA Automation Lead", level: "Senior", competencies: ["java", "python", "leadership", "communication"], reqLevel: { java: "strong", leadership: "strong" }, desc: "Lead test automation strategy, BDD frameworks, and continuous testing." },
      { title: "SAP HANA Consultant", level: "Senior", competencies: ["databases", "communication", "leadership"], reqLevel: { databases: "expert", communication: "strong" }, desc: "SAP S/4HANA migration, implementation, and support." },
      { title: "Security Analyst", level: "Mid", competencies: ["security", "communication", "aws"], reqLevel: { security: "strong" }, desc: "Vulnerability management, threat hunting, and compliance audits." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "aws"], reqLevel: { ml: "strong", python: "expert" }, desc: "Deploying machine learning models in production for retail/CPG clients." }
    ]
  },
  {
    id: "reliancejio", name: "Reliance Jio", logo: "JIO", gradient: "from-blue-600 to-red-500",
    industry: "Telecom / Tech", hq: "Mumbai", tier: "MNC",
    hiring2023: 5000, hiring2024: 6000, trend: "up",
    openRoles: 400, avgPackage: "₹6-20 LPA", glassdoor: 3.7,
    roles: [
      { title: "Software Engineer", level: "Mid", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "strong", databases: "strong", systemdesign: "working" }, desc: "Jio Apps ecosystem (JioTV, JioCinema, JioSaavn) backend services." },
      { title: "Senior Developer (5G)", level: "Senior", competencies: ["golang", "kubernetes", "devops", "systemdesign"], reqLevel: { golang: "strong", kubernetes: "expert", systemdesign: "strong" }, desc: "5G Core network functions (AMF, SMF, UPF) development and cloud-native integration." },
      { title: "Android Developer", level: "Mid", competencies: ["kotlin", "java", "dsa", "systemdesign"], reqLevel: { kotlin: "strong", java: "strong" }, desc: "Jio consumer apps with 400M+ active user base. Video streaming and payments." },
      { title: "iOS Developer", level: "Mid", competencies: ["swift", "dsa", "systemdesign", "security"], reqLevel: { swift: "strong", dsa: "working" }, desc: "Jio iOS apps. High-performance media playback and secure payments." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "Network analytics, churn prediction, and personalized content recommendation." },
      { title: "React Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "dsa"], reqLevel: { react: "strong", typescript: "strong" }, desc: "Jio.com, self-care portals, and internal OSS/BSS web dashboards." },
      { title: "Data Engineer", level: "Senior", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert" }, desc: "Petabyte-scale telecom data lake. Spark, Kafka, and real-time analytics." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "kubernetes", "aws", "python"], reqLevel: { devops: "strong", kubernetes: "strong" }, desc: "Jio Cloud infrastructure. CI/CD for hundreds of microservices." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "python", "devops", "systemdesign"], reqLevel: { security: "expert", python: "strong" }, desc: "Telecom security, 5G security architecture, and threat intelligence." },
      { title: "Blockchain Developer", level: "Mid", competencies: ["golang", "nodejs", "databases", "systemdesign"], reqLevel: { golang: "working", nodejs: "strong" }, desc: "Jio Blockchain platform for telecom roaming, supply chain, and IoT." }
    ]
  },
  {
    id: "airtel", name: "Airtel", logo: "AIR", gradient: "from-red-600 to-red-500",
    industry: "Telecom", hq: "New Delhi", tier: "MNC",
    hiring2023: 3000, hiring2024: 2500, trend: "stable",
    openRoles: 250, avgPackage: "₹8-25 LPA", glassdoor: 3.8,
    roles: [
      { title: "Backend Engineer", level: "SDE-2", competencies: ["java", "databases", "systemdesign", "dsa"], reqLevel: { java: "expert", databases: "strong", systemdesign: "strong" }, desc: "Airtel Thanks app backend, Wynk Music, and Airtel Xstream API services." },
      { title: "Frontend Engineer", level: "SDE-2", competencies: ["react", "typescript", "nodejs", "systemdesign"], reqLevel: { react: "expert", typescript: "strong" }, desc: "Airtel digital properties. High-performance, SEO-optimized web applications." },
      { title: "Android Engineer", level: "SDE-2", competencies: ["kotlin", "java", "dsa", "systemdesign"], reqLevel: { kotlin: "expert", dsa: "strong" }, desc: "Airtel Thanks app serving 350M+ customers. Payments, recharge, and media." },
      { title: "ML Engineer", level: "Senior", competencies: ["ml", "python", "databases", "systemdesign"], reqLevel: { ml: "expert", python: "expert", databases: "strong" }, desc: "Wynk Music recommendations, network fault prediction, and customer 360 AI." },
      { title: "Data Engineer", level: "SDE-2", competencies: ["python", "databases", "aws", "systemdesign"], reqLevel: { python: "expert", databases: "expert" }, desc: "Telecom data warehouse. Processing billions of call data records (CDRs) daily." },
      { title: "Platform Engineer", level: "Senior", competencies: ["kubernetes", "devops", "aws", "golang"], reqLevel: { kubernetes: "expert", devops: "expert", aws: "strong" }, desc: "Airtel Digital's cloud-native platform. EKS, service mesh, and observability." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "python", "aws", "systemdesign"], reqLevel: { security: "expert", aws: "strong" }, desc: "Securing telecom infrastructure, customer data privacy, and compliance." },
      { title: "iOS Engineer", level: "SDE-2", competencies: ["swift", "dsa", "systemdesign", "security"], reqLevel: { swift: "expert", dsa: "strong" }, desc: "Airtel iOS apps. Smooth UI, complex API integrations, and Apple Pay." },
      { title: "Lead Engineer", level: "SDE-3", competencies: ["systemdesign", "leadership", "java", "communication"], reqLevel: { systemdesign: "expert", leadership: "expert", java: "expert" }, desc: "Architectural ownership of core digital products. Mentoring engineering squads." },
      { title: "Network Automation Engineer", level: "Senior", competencies: ["python", "devops", "kubernetes", "systemdesign"], reqLevel: { python: "expert", devops: "strong" }, desc: "SDN, NFV, and automated provisioning of 5G network slices." }
    ]
  },
  {
    id: "tatamotors", name: "Tata Motors", logo: "TM", gradient: "from-blue-800 to-blue-600",
    industry: "Automotive", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 2000, hiring2024: 2500, trend: "up",
    openRoles: 150, avgPackage: "₹6-18 LPA", glassdoor: 3.9,
    roles: [
      { title: "Connected Car Engineer", level: "Mid", competencies: ["python", "aws", "java", "systemdesign"], reqLevel: { python: "strong", aws: "strong", systemdesign: "working" }, desc: "ZConnect and iRA connected car platforms. IoT telemetry data ingestion." },
      { title: "Embedded Software Engineer", level: "Senior", competencies: ["systemdesign", "communication", "databases"], reqLevel: { systemdesign: "strong" }, desc: "ECU programming, CAN bus, AUTOSAR, and ADAS feature development." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert", databases: "strong" }, desc: "Predictive maintenance, battery health algorithms for EVs, and supply chain analytics." },
      { title: "Backend Engineer", level: "Mid", competencies: ["java", "databases", "aws", "systemdesign"], reqLevel: { java: "strong", databases: "strong", aws: "working" }, desc: "Customer portal, dealer management system, and vehicle diagnostics APIs." },
      { title: "Frontend Engineer", level: "Mid", competencies: ["react", "typescript", "nodejs", "communication"], reqLevel: { react: "strong", typescript: "working" }, desc: "Web applications for fleet management, EV charging station locator, and e-commerce." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "devops"], reqLevel: { python: "strong", databases: "strong" }, desc: "IoT data pipelines, streaming vehicle telemetry to AWS data lakes." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", systemdesign: "expert" }, desc: "Cloud infrastructure for global connected vehicle fleets. Scalability and security." },
      { title: "Mobile App Developer", level: "Mid", competencies: ["kotlin", "swift", "react", "dsa"], reqLevel: { kotlin: "working", swift: "working", react: "strong" }, desc: "Tata Motors consumer apps for remote vehicle control (lock/unlock, AC)." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "aws", "python", "communication"], reqLevel: { security: "expert", aws: "strong" }, desc: "Automotive cybersecurity, secure OTA (Over-The-Air) updates, and PKI." },
      { title: "AI Engineer (Computer Vision)", level: "Senior", competencies: ["ml", "python", "systemdesign", "aws"], reqLevel: { ml: "expert", python: "expert" }, desc: "Driver monitoring systems, lane assist, and autonomous driving R&D." }
    ]
  },
  {
    id: "mahindra", name: "Mahindra", logo: "M&M", gradient: "from-red-700 to-red-500",
    industry: "Automotive", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 1500, hiring2024: 1800, trend: "up",
    openRoles: 120, avgPackage: "₹6-16 LPA", glassdoor: 3.8,
    roles: [
      { title: "IoT Platform Engineer", level: "Mid", competencies: ["java", "python", "aws", "systemdesign"], reqLevel: { java: "strong", aws: "strong", python: "working" }, desc: "AdrenoX connected SUV platform. High-frequency telemetry ingestion." },
      { title: "Embedded Systems Engineer", level: "Senior", competencies: ["systemdesign", "communication", "databases"], reqLevel: { systemdesign: "strong" }, desc: "Vehicle control units, infotainment systems, and EV battery management systems." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert" }, desc: "Manufacturing quality prediction, demand forecasting, and smart agriculture analytics (Tractors)." },
      { title: "Full Stack Developer", level: "Mid", competencies: ["react", "java", "databases", "aws"], reqLevel: { react: "strong", java: "strong" }, desc: "Dealer management systems, customer booking portals, and internal enterprise apps." },
      { title: "Cloud Engineer", level: "Mid", competencies: ["aws", "devops", "kubernetes", "python"], reqLevel: { aws: "strong", devops: "strong" }, desc: "AWS infrastructure for connected vehicle services and enterprise workloads." },
      { title: "Mobile Developer (Android/iOS)", level: "Mid", competencies: ["kotlin", "swift", "java", "dsa"], reqLevel: { kotlin: "working", swift: "working", java: "strong" }, desc: "Mahindra customer apps for vehicle tracking, remote diagnostics, and service booking." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "devops"], reqLevel: { python: "strong", databases: "strong" }, desc: "Enterprise data warehouse, ETL processes, and reporting data models." },
      { title: "Cybersecurity Analyst", level: "Mid", competencies: ["security", "communication", "aws"], reqLevel: { security: "strong" }, desc: "IT and OT (Operational Technology) security, ISO 21434 automotive cybersecurity." },
      { title: "UI/UX Developer", level: "Mid", competencies: ["react", "communication", "typescript"], reqLevel: { react: "strong", communication: "strong" }, desc: "In-car infotainment UI development using modern web technologies." },
      { title: "ML Engineer (EV)", level: "Senior", competencies: ["ml", "python", "aws", "systemdesign"], reqLevel: { ml: "expert", python: "expert" }, desc: "Range prediction algorithms, charging optimization, and battery degradation modeling." }
    ]
  },
  {
    id: "marutisuzuki", name: "Maruti Suzuki", logo: "MS", gradient: "from-blue-700 to-blue-500",
    industry: "Automotive", hq: "New Delhi", tier: "Enterprise",
    hiring2023: 1200, hiring2024: 1500, trend: "up",
    openRoles: 100, avgPackage: "₹7-15 LPA", glassdoor: 3.8,
    roles: [
      { title: "Software Engineer (Connected Cars)", level: "Mid", competencies: ["java", "aws", "databases", "systemdesign"], reqLevel: { java: "strong", aws: "strong" }, desc: "Suzuki Connect platform backend. Handling telemetry from millions of vehicles." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "databases", "communication"], reqLevel: { ml: "strong", python: "expert" }, desc: "Sales forecasting, spare parts inventory optimization, and customer churn models." },
      { title: "Full Stack Developer", level: "Mid", competencies: ["react", "nodejs", "databases", "typescript"], reqLevel: { react: "strong", nodejs: "strong" }, desc: "Nexa and Arena digital showrooms, online booking platforms." },
      { title: "Embedded Software Engineer", level: "Senior", competencies: ["systemdesign", "communication", "databases"], reqLevel: { systemdesign: "strong" }, desc: "Infotainment systems, instrument clusters, and body control modules." },
      { title: "Cloud Infrastructure Engineer", level: "Mid", competencies: ["aws", "devops", "kubernetes", "python"], reqLevel: { aws: "strong", devops: "strong" }, desc: "Managing AWS environments for connected car and enterprise applications." },
      { title: "Mobile App Developer", level: "Mid", competencies: ["react", "kotlin", "swift", "dsa"], reqLevel: { react: "strong", kotlin: "working" }, desc: "Maruti Suzuki Rewards and Suzuki Connect consumer mobile applications." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "devops"], reqLevel: { python: "strong", databases: "strong" }, desc: "Building data pipelines for manufacturing analytics and quality control." },
      { title: "Information Security Analyst", level: "Mid", competencies: ["security", "communication", "aws"], reqLevel: { security: "strong" }, desc: "Enterprise IT security, risk management, and compliance." },
      { title: "AI Engineer (Manufacturing)", level: "Senior", competencies: ["ml", "python", "systemdesign", "aws"], reqLevel: { ml: "strong", python: "expert" }, desc: "Computer vision for defect detection on the assembly line, robotics integration." },
      { title: "SAP Technical Consultant", level: "Senior", competencies: ["databases", "communication", "java"], reqLevel: { databases: "expert" }, desc: "SAP ERP customization, ABAP development, and system integration." }
    ]
  },
  {
    id: "hdfcbank", name: "HDFC Bank", logo: "HDFC", gradient: "from-blue-900 to-red-600",
    industry: "Banking", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 4000, hiring2024: 4500, trend: "up",
    openRoles: 300, avgPackage: "₹8-22 LPA", glassdoor: 3.7,
    roles: [
      { title: "Java Backend Developer", level: "Mid", competencies: ["java", "databases", "finance", "systemdesign"], reqLevel: { java: "expert", databases: "strong", finance: "working" }, desc: "Core banking modernization, payment gateways, and UPI integration." },
      { title: "Frontend Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "security"], reqLevel: { react: "strong", typescript: "working", security: "working" }, desc: "NetBanking portal revamp, customer onboarding journeys." },
      { title: "Mobile Developer", level: "Senior", competencies: ["kotlin", "swift", "security", "finance"], reqLevel: { kotlin: "strong", swift: "working", security: "strong" }, desc: "HDFC MobileBanking app, PayZapp. Focus on security and performance." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "strong", databases: "expert" }, desc: "Enterprise data warehouse, regulatory reporting (RBI), and transaction data pipelines." },
      { title: "Data Scientist (Risk)", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "strong", python: "expert", finance: "strong" }, desc: "Credit scoring models, fraud detection, and anti-money laundering (AML) analytics." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "security"], reqLevel: { aws: "expert", systemdesign: "expert", security: "strong" }, desc: "Cloud migration strategy, hybrid cloud architecture for banking workloads." },
      { title: "Cybersecurity Engineer", level: "Senior", competencies: ["security", "python", "finance", "aws"], reqLevel: { security: "expert", finance: "working" }, desc: "Threat hunting, SOC operations, and securing digital banking channels." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "kubernetes", "aws", "java"], reqLevel: { devops: "strong", kubernetes: "working" }, desc: "CI/CD pipelines for banking applications, infrastructure automation." },
      { title: "API Integration Engineer", level: "Mid", competencies: ["nodejs", "java", "databases", "security"], reqLevel: { nodejs: "strong", java: "strong" }, desc: "Open banking APIs, partner integrations (fintechs, merchants)." },
      { title: "Performance Engineer", level: "Mid", competencies: ["java", "databases", "devops", "python"], reqLevel: { java: "working", databases: "strong" }, desc: "Load testing banking applications for peak traffic (salary days, Diwali)." }
    ]
  },
  {
    id: "icicibank", name: "ICICI Bank", logo: "ICICI", gradient: "from-orange-600 to-red-600",
    industry: "Banking", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 3500, hiring2024: 4000, trend: "up",
    openRoles: 280, avgPackage: "₹7-20 LPA", glassdoor: 3.8,
    roles: [
      { title: "Software Engineer (Java)", level: "Mid", competencies: ["java", "databases", "finance", "systemdesign"], reqLevel: { java: "strong", databases: "strong", finance: "working" }, desc: "iMobile Pay backend, internet banking, and wealth management platforms." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "strong", python: "expert", finance: "strong" }, desc: "Next Best Action (NBA) recommendation engine, credit risk models." },
      { title: "Frontend Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "security"], reqLevel: { react: "strong", typescript: "working" }, desc: "Corporate banking portals (InstaBIZ), trade finance UIs." },
      { title: "Mobile App Developer", level: "Senior", competencies: ["kotlin", "swift", "security", "dsa"], reqLevel: { kotlin: "strong", security: "strong" }, desc: "iMobile Pay app development. Biometrics, UPI, and secure storage." },
      { title: "Cloud Engineer", level: "Mid", competencies: ["aws", "devops", "kubernetes", "security"], reqLevel: { aws: "strong", devops: "strong" }, desc: "Managing cloud infrastructure for digital banking initiatives." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "strong", databases: "expert" }, desc: "Building scalable data pipelines for customer analytics and reporting." },
      { title: "Information Security Manager", level: "Senior", competencies: ["security", "finance", "aws", "communication"], reqLevel: { security: "expert", finance: "strong" }, desc: "Information security governance, risk management, and compliance." },
      { title: "Blockchain Developer", level: "Mid", competencies: ["golang", "nodejs", "databases", "finance"], reqLevel: { golang: "working", nodejs: "strong" }, desc: "Trade finance network consortiums, cross-border remittance solutions." },
      { title: "API Developer", level: "Mid", competencies: ["nodejs", "java", "security", "databases"], reqLevel: { nodejs: "strong", java: "strong" }, desc: "ICICI API Banking portal. Exposing banking services to fintech partners." },
      { title: "RPA Developer", level: "Mid", competencies: ["python", "java", "databases", "communication"], reqLevel: { python: "strong" }, desc: "Robotic Process Automation for back-office banking operations." }
    ]
  },
  {
    id: "kotak", name: "Kotak Mahindra Bank", logo: "KMB", gradient: "from-red-700 to-red-500",
    industry: "Banking", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 2500, hiring2024: 3000, trend: "up",
    openRoles: 200, avgPackage: "₹7-22 LPA", glassdoor: 3.7,
    roles: [
      { title: "Backend Developer (Java/Go)", level: "Senior", competencies: ["java", "golang", "databases", "systemdesign"], reqLevel: { java: "strong", golang: "working", databases: "expert" }, desc: "Kotak 811 digital banking platform, core banking integrations." },
      { title: "Frontend Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "security"], reqLevel: { react: "strong", typescript: "strong" }, desc: "Net banking, corporate portals, and wealth management UIs." },
      { title: "Mobile Engineer", level: "Mid", competencies: ["kotlin", "swift", "react", "security"], reqLevel: { kotlin: "strong", react: "working", security: "strong" }, desc: "Kotak Mobile Banking App (Kotak811). Native and React Native development." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "strong", python: "expert", finance: "working" }, desc: "Propensity models, cross-sell algorithms, and risk analytics." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "strong", databases: "expert" }, desc: "Data lake architecture, streaming analytics for fraud detection." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "security"], reqLevel: { aws: "expert", systemdesign: "expert", security: "strong" }, desc: "Designing secure, highly available cloud architectures for banking." },
      { title: "Cybersecurity Analyst", level: "Mid", competencies: ["security", "python", "finance", "communication"], reqLevel: { security: "strong", finance: "working" }, desc: "Vulnerability assessment, incident response, and security monitoring." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "kubernetes", "aws", "python"], reqLevel: { devops: "strong", kubernetes: "strong" }, desc: "Automating infrastructure provisioning and application deployments." },
      { title: "Integration Specialist", level: "Senior", competencies: ["java", "databases", "security", "systemdesign"], reqLevel: { java: "expert", security: "strong" }, desc: "Enterprise Service Bus (ESB) and API gateway integrations." },
      { title: "QA Automation Engineer", level: "Mid", competencies: ["java", "python", "databases", "devops"], reqLevel: { java: "working", python: "working" }, desc: "Automated testing for critical banking workflows and APIs." }
    ]
  },
  {
    id: "axisbank", name: "Axis Bank", logo: "AXIS", gradient: "from-red-800 to-red-600",
    industry: "Banking", hq: "Mumbai", tier: "Enterprise",
    hiring2023: 3000, hiring2024: 3500, trend: "up",
    openRoles: 220, avgPackage: "₹7-20 LPA", glassdoor: 3.8,
    roles: [
      { title: "Full Stack Developer", level: "Senior", competencies: ["react", "java", "nodejs", "databases"], reqLevel: { react: "strong", java: "strong", nodejs: "working" }, desc: "Axis Mobile app backend, internet banking, and corporate portals." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "strong", python: "expert", finance: "strong" }, desc: "AI-driven customer insights, credit underwriting models." },
      { title: "Cloud Engineer", level: "Mid", competencies: ["aws", "devops", "kubernetes", "security"], reqLevel: { aws: "strong", devops: "strong" }, desc: "AWS infrastructure management, migrating legacy apps to the cloud." },
      { title: "Mobile App Developer", level: "Mid", competencies: ["kotlin", "swift", "react", "security"], reqLevel: { kotlin: "strong", security: "strong" }, desc: "Axis Mobile app development. Seamless UX and secure transactions." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "strong", databases: "expert" }, desc: "Building scalable data platforms for business intelligence." },
      { title: "Security Engineer", level: "Senior", competencies: ["security", "aws", "python", "finance"], reqLevel: { security: "expert", finance: "working" }, desc: "Application security, DevSecOps, and cloud security posture." },
      { title: "Backend Developer (Node.js)", level: "Mid", competencies: ["nodejs", "databases", "systemdesign", "security"], reqLevel: { nodejs: "strong", databases: "strong" }, desc: "Building scalable APIs for digital lending and payments." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "kubernetes", "aws", "python"], reqLevel: { devops: "strong", kubernetes: "working" }, desc: "Implementing CI/CD pipelines and infrastructure as code." },
      { title: "Database Administrator", level: "Senior", competencies: ["databases", "aws", "devops", "communication"], reqLevel: { databases: "expert" }, desc: "Managing large-scale Oracle/PostgreSQL databases, performance tuning." },
      { title: "Business Analyst (IT)", level: "Mid", competencies: ["finance", "communication", "databases", "systemdesign"], reqLevel: { finance: "strong", communication: "expert" }, desc: "Bridging the gap between business requirements and technical solutions." }
    ]
  },
  {
    id: "bajajfinserv", name: "Bajaj Finserv", logo: "BF", gradient: "from-blue-700 to-blue-500",
    industry: "Financial Services", hq: "Pune", tier: "Enterprise",
    hiring2023: 2000, hiring2024: 2500, trend: "up",
    openRoles: 180, avgPackage: "₹6-18 LPA", glassdoor: 3.9,
    roles: [
      { title: "Software Engineer (Java)", level: "Mid", competencies: ["java", "databases", "finance", "systemdesign"], reqLevel: { java: "strong", databases: "strong" }, desc: "Loan origination systems, EMI card backend, and payment integrations." },
      { title: "Data Scientist", level: "Senior", competencies: ["ml", "python", "finance", "databases"], reqLevel: { ml: "strong", python: "expert", finance: "strong" }, desc: "Credit risk modeling, cross-sell propensity, and collection optimization." },
      { title: "Frontend Developer", level: "Mid", competencies: ["react", "typescript", "nodejs", "communication"], reqLevel: { react: "strong", typescript: "working" }, desc: "Customer portals, EMI store UI, and internal dashboards." },
      { title: "Mobile Developer", level: "Mid", competencies: ["kotlin", "swift", "react", "security"], reqLevel: { react: "strong", kotlin: "working" }, desc: "Bajaj Finserv mobile app. React Native development for cross-platform." },
      { title: "Data Engineer", level: "Mid", competencies: ["python", "databases", "aws", "finance"], reqLevel: { python: "strong", databases: "expert" }, desc: "Data pipelines for analytics and regulatory reporting." },
      { title: "Cloud Architect", level: "Senior", competencies: ["aws", "kubernetes", "devops", "systemdesign"], reqLevel: { aws: "expert", systemdesign: "expert" }, desc: "Cloud-native architecture for scalable financial services applications." },
      { title: "Security Analyst", level: "Mid", competencies: ["security", "finance", "python", "aws"], reqLevel: { security: "strong" }, desc: "Information security, compliance, and vulnerability management." },
      { title: "DevOps Engineer", level: "Mid", competencies: ["devops", "aws", "kubernetes", "python"], reqLevel: { devops: "strong", aws: "strong" }, desc: "Automation of infrastructure and deployment pipelines." },
      { title: "API Developer", level: "Mid", competencies: ["nodejs", "java", "databases", "security"], reqLevel: { nodejs: "strong", databases: "strong" }, desc: "Building partner APIs for merchant integrations and digital lending." },
      { title: "QA Engineer", level: "Mid", competencies: ["java", "python", "databases", "communication"], reqLevel: { java: "working", python: "working" }, desc: "Automated testing for financial applications and APIs." }
    ]
  }
];

// ════════════════════════════════════════════════════════════
// DEEP AI ANALYSIS ENGINE v2
// Uses contextual understanding, not just keyword matching
// ════════════════════════════════════════════════════════════
function deepAnalyzeCompetency(resumeText: string, competency: string, reqLevel: string): {
  status: "expert" | "strong" | "working" | "absent";
  confidence: number;
  evidence: string[];
  gaps: string[];
} {
  const text = resumeText.toLowerCase();
  const signals = COMPETENCY_SIGNALS[competency] || { keywords: [competency], contextPhrases: [], redFlags: [] };

  // 1. Keyword presence scoring
  const kwMatches = signals.keywords.filter(kw => text.includes(kw));
  const kwScore = kwMatches.length;

  // 2. Context phrase scoring (production depth signals)
  const ctxMatches = signals.contextPhrases.filter(phrase => text.includes(phrase));
  const hasProductionDepth = ctxMatches.length > 0;

  // 3. Red flag detection
  const redFlagCount = signals.redFlags.filter(rf => text.includes(rf)).length;

  // 4. Quantified impact detection
  const impactPatterns = [
    /\d+\s*(million|billion|thousand|m\+|k\+)\s*(users|requests|transactions|customers)/,
    /\d+%\s*(improvement|reduction|increase|faster)/,
    /(production|live|deployed|shipped)\s+\w+/,
    /team of \d+/,
    /led|architected|designed|built\s+\w+/,
    /\d+\s*(years?|yrs?)\s+(of|in|with)/,
  ];
  const impactScore = impactPatterns.filter(p => p.test(text)).length;

  // 5. Determine detected level
  let detectedLevel: "expert" | "strong" | "working" | "absent";
  let confidence: number;

  if (redFlagCount > 0 && kwScore < 2) {
    detectedLevel = "absent";
    confidence = 10;
  } else if (kwScore >= 4 && (hasProductionDepth || impactScore >= 2)) {
    detectedLevel = "expert";
    confidence = Math.min(95, 70 + (ctxMatches.length * 8) + (impactScore * 5));
  } else if (kwScore >= 2 || hasProductionDepth) {
    detectedLevel = "strong";
    confidence = Math.min(75, 45 + (kwScore * 5) + (impactScore * 3));
  } else if (kwScore >= 1) {
    detectedLevel = "working";
    confidence = Math.min(50, 25 + (kwScore * 8));
  } else {
    detectedLevel = "absent";
    confidence = 5;
  }

  // 6. Level hierarchy comparison
  const LEVELS = ["working", "strong", "expert"];
  const detectedIdx = LEVELS.indexOf(detectedLevel);
  const requiredIdx = LEVELS.indexOf(reqLevel === "working" ? "working" : reqLevel);

  const meetsRequirement = detectedLevel !== "absent" && detectedIdx >= requiredIdx;

  // 7. Build evidence and gap messages
  const evidence: string[] = [];
  const gaps: string[] = [];

  if (kwMatches.length > 0) {
    evidence.push(`Keywords detected: ${kwMatches.slice(0, 4).map(k => `"${k}"`).join(", ")}`);
  }
  if (ctxMatches.length > 0) {
    evidence.push(`Production-depth signals: ${ctxMatches.slice(0, 2).map(c => `"${c}"`).join(", ")}`);
  }
  if (impactScore >= 2) {
    evidence.push("Quantified impact statements found — strong signal of real-world application.");
  }
  if (impactScore === 0 && detectedLevel !== "absent") {
    gaps.push("No quantified metrics found. Add numbers: users served, latency improvements, or scale of systems.");
  }
  if (!hasProductionDepth && reqLevel === "expert") {
    gaps.push(`Expert-level required. Your resume needs production-scale ${competency.toUpperCase()} experience — not just project/course work.`);
  }
  if (detectedLevel === "absent") {
    gaps.push(`No ${competency.toUpperCase()} evidence found. This is a core requirement — address before applying.`);
  }
  if (!meetsRequirement && detectedLevel !== "absent") {
    gaps.push(`Detected "${detectedLevel}" but role requires "${reqLevel}". Bridge this gap with production experience.`);
  }

  return { status: meetsRequirement ? detectedLevel as any : (detectedLevel === "absent" ? "absent" : "working"), confidence: Math.round(confidence), evidence, gaps };
}

function computeScore(roleAnalysis: ReturnType<typeof deepAnalyzeCompetency>[], reqLevels: Record<string, string>, resumeText: string): number {
  const text = resumeText.toLowerCase();
  let totalWeighted = 0;
  let earnedWeighted = 0;
  const LEVELS = { absent: 0, working: 0.35, strong: 0.7, expert: 1.0 };
  const REQUIRED = { working: 0.35, strong: 0.7, expert: 1.0 };

  roleAnalysis.forEach((a, i) => {
    const weight = 1; // equal weight per competency
    totalWeighted += weight;
    const score = LEVELS[a.status] ?? 0;
    earnedWeighted += score * weight;
  });

  const base = Math.round((earnedWeighted / totalWeighted) * 100);

  // Context bonuses
  const hasPremiumEdu = /iit|nit|bits|iiit|mit|stanford|berkeley|carnegie|waterloo/.test(text);
  const hasOpenSource = /github\.com|open.?source|contributor|maintainer/.test(text);
  const hasImpact = /million|billion|(\d+)k\+/.test(text);
  const hasLeadership = /led\s+(\w+\s+)*(team|engineers)|managed\s+\d+|principal|staff/.test(text);

  const bonus = (hasPremiumEdu ? 5 : 0) + (hasOpenSource ? 4 : 0) + (hasImpact ? 4 : 0) + (hasLeadership ? 3 : 0);
  return Math.min(99, base + bonus);
}

const INDUSTRIES = ["All", "Technology", "Fintech", "E-commerce", "IT Services", "SaaS", "Food Tech", "Mobility", "Quick Commerce", "Stock Broking"];
const TIERS = ["All", "FAANG", "Unicorn", "MNC", "IT Services", "Startup"];

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function MatchingDemo() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES[0] | null>(null);
  const [selectedRole, setSelectedRole] = useState<typeof COMPANIES[0]["roles"][0] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number; breakdown: { competency: string; reqLevel: string; analysis: ReturnType<typeof deepAnalyzeCompetency> }[]; suggestions: string[] } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadMode, setUploadMode] = useState<"paste" | "upload">("paste");
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText((e.target?.result as string) || "");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const filteredCompanies = COMPANIES.filter(c => {
    const q = companySearch.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.roles.some(r => r.title.toLowerCase().includes(q));
    const matchIndustry = industryFilter === "All" || c.industry.includes(industryFilter);
    const matchTier = tierFilter === "All" || c.tier === tierFilter;
    return matchSearch && matchIndustry && matchTier;
  });

  const handleAnalyze = () => {
    if (!selectedRole || !resumeText.trim()) return;
    setAnalyzing(true); setResult(null); setShowSuggestions(false);
    setTimeout(() => {
      const reqLevelMap = selectedRole.reqLevel as unknown as Record<string, string>;
      const breakdown = selectedRole.competencies.map(comp => ({
        competency: comp,
        reqLevel: reqLevelMap[comp] || "working",
        analysis: deepAnalyzeCompetency(resumeText, comp, reqLevelMap[comp] || "working"),
      }));
      const score = computeScore(breakdown.map(b => b.analysis), reqLevelMap, resumeText);

      const suggestions: string[] = [];
      breakdown.filter(b => b.analysis.status === "absent").forEach(b => {
        suggestions.push(`🎯 Critical gap: ${b.competency.toUpperCase()} not found. Build hands-on production projects and quantify impact.`);
      });
      breakdown.filter(b => b.analysis.gaps.length > 0 && b.analysis.status !== "absent").forEach(b => {
        suggestions.push(`📈 ${b.analysis.gaps[0]}`);
      });
      if (score >= 80) suggestions.push(`✅ Strong match! Focus on ${selectedCompany?.name}'s specific interview process — research their engineering blog and recent papers.`);
      if (score >= 60 && score < 80) suggestions.push(`💼 You're competitive. Address the ${breakdown.filter(b => b.analysis.status === "absent").length} missing skills within 3-6 months to strengthen your application.`);
      if (score < 50) suggestions.push(`📚 Significant gap to ${selectedCompany?.tier === "FAANG" ? "FAANG" : selectedCompany?.name} bar. Consider targeting companies one tier below first to build experience.`);
      suggestions.push(`🎤 Prepare for ${selectedCompany?.name}'s specific interview format. Study their engineering blog, GitHub, and recent tech talks.`);

      setResult({ score, breakdown, suggestions: suggestions.slice(0, 6) });
      setAnalyzing(false); setStep(3);
    }, 2800);
  };

  const scoreColor = result ? result.score >= 80 ? "text-success" : result.score >= 55 ? "text-warning" : "text-danger" : "text-primary";
  const verdict = result ? result.score >= 85 ? "Strong Match 🚀" : result.score >= 70 ? "Good Potential 🟡" : result.score >= 50 ? "Needs Work 🔧" : "Significant Gap ❌" : "";

  const TREND_COLOR: Record<string, string> = { up: "text-success", down: "text-danger", stable: "text-warning" };
  const TREND_ICON: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

  const STATUS_CONFIG = {
    expert: { label: "Expert", color: "text-success", bg: "bg-success-bg", border: "border-success/20", bar: "bg-success" },
    strong: { label: "Strong", color: "text-primary", bg: "bg-primary-light", border: "border-primary/20", bar: "bg-primary" },
    working: { label: "Partial", color: "text-warning", bg: "bg-warning-bg", border: "border-warning/20", bar: "bg-warning" },
    absent: { label: "Not Found", color: "text-danger", bg: "bg-danger-bg", border: "border-danger/20", bar: "bg-danger" },
  };

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />
      <div className="max-w-[1400px] mx-auto px-[24px] py-[88px] page-enter">

        {/* Hero */}
        <div className="text-center mb-[48px] max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[20px]">
            <Brain className="w-[14px] h-[14px]" />
            Deep AI Resume Analyzer — {COMPANIES.length} Companies · {COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+ Roles · 2024-25 Data
          </div>
          <h1 className="text-[40px] md:text-[54px] font-extrabold text-text mb-[14px] tracking-[-0.04em] leading-[1.05]">
            Upload Resume. <span className="gradient-text">See Your Real Chances.</span>
          </h1>
          <p className="text-[16px] text-text-secondary leading-[26px]">
            Deep contextual AI analysis — not just keyword matching. Evaluates production depth, quantified impact, and skill level against real 2024-25 hiring bars.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-0 mb-[40px]">
          {[{ n: 1, label: "Your Resume" }, { n: 2, label: "Company & Role" }, { n: 3, label: "AI Analysis" }].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button
                onClick={() => { if (s.n === 1 || s.n <= step || resumeText.trim()) setStep(s.n as 1 | 2 | 3); }}
                className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all ${step === s.n ? "bg-text text-bg shadow-md" : step > s.n ? "bg-success/15 text-success border border-success/30" : "bg-surface border border-border text-text-secondary"}`}
              >
                <span className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold ${step === s.n ? "bg-white/20" : step > s.n ? "bg-success/20" : "bg-border"}`}>
                  {step > s.n ? "✓" : s.n}
                </span>
                {s.label}
              </button>
              {i < 2 && <div className={`w-[32px] h-[2px] mx-[2px] rounded-full ${step > s.n ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="max-w-[800px] mx-auto">
            <div className="bg-surface border border-border rounded-2xl p-[32px] shadow-md">
              <div className="flex items-center gap-[12px] mb-[24px]">
                <div className="w-[44px] h-[44px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                  <FileText className="w-[20px] h-[20px] text-primary" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-text">Upload Your Resume</h2>
                  <p className="text-[13px] text-text-secondary">More detail = deeper, more accurate AI analysis</p>
                </div>
              </div>

              <div className="flex gap-[2px] p-[4px] bg-surface-2 rounded-xl mb-[20px] w-fit">
                {(["paste", "upload"] as const).map(mode => (
                  <button key={mode} onClick={() => setUploadMode(mode)}
                    className={`px-[18px] py-[7px] rounded-[10px] text-[13px] font-semibold transition-all ${uploadMode === mode ? "bg-surface text-text shadow-sm" : "text-text-secondary"}`}>
                    {mode === "paste" ? "✏️ Paste Text" : "📎 Upload File"}
                  </button>
                ))}
              </div>

              {uploadMode === "paste" ? (
                <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                  placeholder={`Paste your complete resume here for the most accurate analysis.

Include:
• Work experience with specific technologies used and scale (million users, requests/day, etc.)
• Project descriptions with tech stack and measurable impact
• Skills section with proficiency levels
• Education (college name matters for bonus scoring)
• Open source contributions or GitHub links

Example:
"Senior Backend Engineer with 4 years experience. Built payment service in Java Spring Boot handling 5M+ transactions/day on AWS. Led team of 6 engineers. Proficient in Kafka, PostgreSQL, Redis, and Kubernetes. Solved 400+ LeetCode problems."`}
                  className="w-full h-[300px] px-[16px] py-[14px] bg-surface-2 border border-border rounded-xl text-[14px] text-text placeholder:text-text-muted font-mono resize-none focus:outline-none focus:border-primary/50 transition-colors leading-[22px]"
                />
              ) : (
                <div onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-[10px] cursor-pointer transition-all ${dragActive ? "border-primary bg-primary-light" : "border-border-strong bg-surface-2 hover:border-primary/40"}`}>
                  <Upload className={`w-[36px] h-[36px] ${dragActive ? "text-primary" : "text-text-secondary"}`} />
                  <div className="text-center">
                    <p className="font-semibold text-text">{resumeFileName || "Drop your resume (.txt)"}</p>
                    <p className="text-[12px] text-text-secondary mt-[2px]">Click to browse</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                </div>
              )}

              {resumeText.trim() && (
                <div className="mt-[14px] p-[12px] bg-success-bg border border-success/20 rounded-xl flex items-center gap-[10px]">
                  <CheckCircle className="w-[15px] h-[15px] text-success flex-shrink-0" />
                  <span className="text-[13px] text-success font-medium">{resumeText.split(/\s+/).length} words loaded — deep AI analysis will begin when you select a role.</span>
                </div>
              )}

              <div className="mt-[24px] flex justify-end">
                <Button variant="header" disabled={!resumeText.trim()} onClick={() => setStep(2)}
                  className="px-[28px] py-[11px] text-[14px] font-bold rounded-xl disabled:opacity-40">
                  Select Company & Role <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <div className="bg-surface border border-border rounded-2xl p-[18px] mb-[20px] shadow-sm">
              <div className="flex flex-wrap gap-[10px] items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-secondary" />
                  <input value={companySearch} onChange={e => setCompanySearch(e.target.value)}
                    placeholder="Search company or role..."
                    className="w-full pl-[36px] pr-[12px] h-[38px] bg-surface-2 border border-border rounded-xl text-[13px] focus:outline-none focus:border-primary/50" />
                </div>
                <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                  className="h-[38px] px-[12px] bg-surface-2 border border-border rounded-xl text-[13px] focus:outline-none cursor-pointer">
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                  className="h-[38px] px-[12px] bg-surface-2 border border-border rounded-xl text-[13px] focus:outline-none cursor-pointer">
                  {TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
                <span className="text-[13px] text-text-secondary">{filteredCompanies.length} companies · {filteredCompanies.reduce((a, c) => a + c.roles.length, 0)} roles</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] mb-[100px]">
              {filteredCompanies.map(company => (
                <div key={company.id} className={`bg-surface border rounded-2xl p-[18px] transition-all hover:shadow-md ${selectedCompany?.id === company.id ? "border-primary shadow-glow-orange" : "border-border hover:border-border-strong"}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-[12px]">
                    <div className="flex items-center gap-[10px]">
                      <div className={`w-[40px] h-[40px] rounded-xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0`}>{company.logo}</div>
                      <div>
                        <div className="font-bold text-text text-[14px]">{company.name}</div>
                        <div className="text-[11px] text-text-secondary">{company.hq}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-[7px] py-[2px] rounded-full ${company.tier === "FAANG" ? "bg-ai-light text-ai" : company.tier === "Unicorn" ? "bg-primary-light text-primary" : company.tier === "MNC" ? "bg-info-bg text-info" : company.tier === "Startup" ? "bg-success-bg text-success" : "bg-surface-3 text-text-secondary"}`}>{company.tier}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-[6px] mb-[12px]">
                    <div className="bg-surface-2 rounded-lg p-[8px] text-center">
                      <div className="text-[12px] font-bold text-text">{company.hiring2024.toLocaleString()}</div>
                      <div className="text-[10px] text-text-muted">Hires 2024</div>
                      <div className={`text-[10px] font-bold ${TREND_COLOR[company.trend]}`}>{TREND_ICON[company.trend]}</div>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-[8px] text-center">
                      <div className="text-[12px] font-bold text-text">{company.openRoles}+</div>
                      <div className="text-[10px] text-text-muted">Open Roles</div>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-[8px] text-center">
                      <div className="text-[11px] font-bold text-text">⭐{company.glassdoor}</div>
                      <div className="text-[10px] text-text-muted">Glassdoor</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-secondary mb-[10px]">{company.avgPackage}</div>

                  {/* Roles — scrollable list */}
                  <div className="space-y-[4px] max-h-[320px] overflow-y-auto pr-[2px]">
                    {company.roles.map(role => (
                      <button key={role.title} onClick={() => { setSelectedCompany(company); setSelectedRole(role); }}
                        className={`w-full text-left px-[10px] py-[7px] rounded-xl text-[12px] font-medium transition-all ${selectedRole?.title === role.title && selectedCompany?.id === company.id ? "bg-text text-bg" : "bg-surface-2 text-text hover:bg-surface-3"}`}>
                        <div className="font-semibold truncate">{role.title}</div>
                        <div className={`text-[10px] mt-[1px] ${selectedRole?.title === role.title && selectedCompany?.id === company.id ? "text-bg/60" : "text-text-secondary"}`}>{role.level}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky CTA */}
            {selectedRole && selectedCompany && (
              <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-40 animate-slide-up">
                <div className="bg-text text-bg px-[28px] py-[14px] rounded-2xl shadow-xl flex items-center gap-[16px]">
                  <div>
                    <div className="font-bold text-[14px]">{selectedCompany.name} — {selectedRole.title}</div>
                    <div className="text-[12px] text-bg/60">{selectedRole.competencies.length} competencies to analyze</div>
                  </div>
                  <button onClick={handleAnalyze} disabled={analyzing}
                    className="bg-primary text-white px-[22px] py-[9px] rounded-xl font-bold text-[13px] hover:bg-primary-hover transition-all flex items-center gap-[8px] disabled:opacity-60">
                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    {analyzing ? "Analyzing deeply..." : "Run Deep AI Analysis"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — RESULTS ── */}
        {step === 3 && result && selectedCompany && selectedRole && (
          <div className="max-w-[900px] mx-auto">
            {/* Score hero */}
            <div className={`bg-surface border rounded-2xl p-[28px] mb-[20px] text-center shadow-md ${result.score >= 80 ? "border-success/30" : result.score >= 55 ? "border-warning/30" : "border-danger/30"}`}>
              <div className="text-[13px] font-semibold text-text-secondary mb-[6px]">{selectedCompany.name} — {selectedRole.title}</div>
              <div className={`text-[76px] font-extrabold ${scoreColor} leading-none mb-[6px]`}>{result.score}<span className="text-[32px] opacity-50">%</span></div>
              <div className="text-[20px] font-bold text-text mb-[16px]">{verdict}</div>
              <div className="flex justify-center gap-[8px] flex-wrap">
                {result.breakdown.map(b => {
                  const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
                  return (
                    <span key={b.competency} className={`text-[11px] font-bold px-[10px] py-[4px] rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {b.analysis.status === "expert" ? "✓✓" : b.analysis.status === "strong" ? "✓" : b.analysis.status === "working" ? "~" : "✗"} {b.competency.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Company context */}
            <div className="bg-surface border border-border rounded-2xl p-[20px] mb-[20px] shadow-sm">
              <h3 className="font-bold text-text text-[15px] mb-[14px] flex items-center gap-[8px]"><Building2 className="w-[15px] h-[15px] text-primary" /> Hiring Context</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
                {[
                  { label: "Hires 2024", value: selectedCompany.hiring2024.toLocaleString(), sub: `${TREND_ICON[selectedCompany.trend]} from ${selectedCompany.hiring2023.toLocaleString()} (2023)`, subColor: TREND_COLOR[selectedCompany.trend] },
                  { label: "Open Roles", value: `${selectedCompany.openRoles}+`, sub: selectedCompany.industry },
                  { label: "Avg Package", value: selectedCompany.avgPackage, sub: selectedCompany.tier },
                  { label: "Glassdoor", value: `⭐ ${selectedCompany.glassdoor}`, sub: "Employee Rating" },
                ].map(({ label, value, sub, subColor }) => (
                  <div key={label} className="bg-surface-2 rounded-xl p-[12px] text-center">
                    <div className="text-[10px] text-text-muted mb-[2px]">{label}</div>
                    <div className="text-[17px] font-bold text-text">{value}</div>
                    <div className={`text-[11px] mt-[1px] ${subColor || "text-text-secondary"}`}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep skill breakdown */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[20px] shadow-sm">
              <h3 className="font-bold text-text text-[15px] mb-[18px] flex items-center gap-[8px]"><Target className="w-[15px] h-[15px] text-primary" /> Deep Competency Analysis</h3>
              <div className="space-y-[14px]">
                {result.breakdown.map(b => {
                  const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
                  const barWidth = b.analysis.status === "expert" ? b.analysis.confidence : b.analysis.status === "strong" ? Math.min(b.analysis.confidence, 68) : b.analysis.status === "working" ? Math.min(b.analysis.confidence, 40) : 5;
                  return (
                    <div key={b.competency} className={`p-[14px] rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-center justify-between mb-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <span className={`text-[14px] font-extrabold uppercase ${cfg.color}`}>{b.competency}</span>
                          <span className="text-[10px] bg-surface/60 text-text-secondary px-[7px] py-[2px] rounded-full font-medium">Required: {b.reqLevel}</span>
                        </div>
                        <span className={`text-[12px] font-bold ${cfg.color}`}>{cfg.label} ({b.analysis.confidence}%)</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-[3px] bg-surface-3 rounded-full mb-[10px]">
                        <div className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`} style={{ width: `${barWidth}%` }} />
                      </div>
                      {/* Evidence */}
                      {b.analysis.evidence.length > 0 && (
                        <div className="space-y-[4px] mb-[6px]">
                          {b.analysis.evidence.map((ev, i) => <p key={i} className="text-[12px] text-text-secondary leading-[18px]">✓ {ev}</p>)}
                        </div>
                      )}
                      {/* Gaps */}
                      {b.analysis.gaps.length > 0 && (
                        <div className="space-y-[4px]">
                          {b.analysis.gaps.map((g, i) => <p key={i} className="text-[12px] text-danger leading-[18px]">⚠ {g}</p>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
              <button onClick={() => setShowSuggestions(!showSuggestions)} className="w-full flex items-center justify-between mb-[2px]">
                <h3 className="font-bold text-text text-[15px] flex items-center gap-[8px]"><Lightbulb className="w-[15px] h-[15px] text-warning" /> AI Improvement Roadmap ({result.suggestions.length} tips)</h3>
                {showSuggestions ? <ChevronUp className="w-[15px] h-[15px] text-text-secondary" /> : <ChevronDown className="w-[15px] h-[15px] text-text-secondary" />}
              </button>
              {showSuggestions && (
                <div className="mt-[14px] space-y-[10px]">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-[10px] p-[12px] bg-surface-2 rounded-xl">
                      <span className="text-[18px] leading-none">{s.split(" ")[0]}</span>
                      <p className="text-[13px] text-text leading-[20px]">{s.substring(s.indexOf(" ") + 1)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-[10px] justify-center">
              <button onClick={() => { setStep(1); setResult(null); setSelectedCompany(null); setSelectedRole(null); }}
                className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl border border-border text-text-secondary hover:text-text hover:bg-surface-2 font-medium text-[13px] transition-all">
                <RefreshCw className="w-4 h-4" /> New Resume
              </button>
              <button onClick={() => { setStep(2); setResult(null); }}
                className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary-hover transition-all">
                <Building2 className="w-4 h-4" /> Try Another Company
              </button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-[56px] grid grid-cols-2 md:grid-cols-4 gap-[14px] border-t border-border pt-[40px]">
          {[
            { icon: Building2, value: `${COMPANIES.length}`, label: "Companies", sub: "FAANG to Startups" },
            { icon: Briefcase, value: `${COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+`, label: "Specific Roles", sub: "Real requirements" },
            { icon: BarChart3, value: "2024-25", label: "Hiring Data", sub: "Year-over-year" },
            { icon: Zap, value: "Deep AI", label: "Analysis Engine", sub: "Contextual scoring" },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-[16px] flex items-center gap-[12px]">
              <div className="w-[40px] h-[40px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold text-text">{s.value}</div>
                <div className="text-[12px] font-semibold text-text">{s.label}</div>
                <div className="text-[11px] text-text-muted">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
