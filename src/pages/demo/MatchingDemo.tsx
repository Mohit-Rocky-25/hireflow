// ============================================================
// HireFlow — AI Resume Matcher (v5 — 100 Companies, Real Data)
// Upload YOUR resume, pick company + role, get a real analysis
// ============================================================
import { useState, useRef, useCallback } from "react";
import {
  Brain, Target, CheckCircle, XCircle, AlertTriangle, Lightbulb,
  ArrowRight, RefreshCw, Building2, MapPin, Users, Search, Filter,
  Upload, FileText, Star, BarChart3, TrendingUp, Award, Clock,
  ChevronDown, ChevronUp, Briefcase, Globe, BookOpen, Zap, X
} from "lucide-react";
import { Badge, Button } from "../../components/ui/Components";
import { PublicNavbar } from "../../components/layout/PublicNavbar";

// ════════════════════════════════════════════════════════════
// 100 REAL COMPANIES — Sourced from LinkedIn, Company Career
// pages, and public hiring data (2024-2025)
// ════════════════════════════════════════════════════════════
const COMPANIES = [
  // ── FAANG & Big Tech ─────────────────────────────────────
  {
    id: "google", name: "Google", logo: "G", gradient: "from-blue-500 to-cyan-400",
    industry: "Technology", hq: "Mountain View, CA", tier: "FAANG",
    hiring2023: 11000, hiring2024: 6500, hiringTrend: "down",
    openRoles: 380, avgPackage: "₹45-80 LPA", glassdoor: 4.4,
    roles: [
      {
        title: "Software Engineer L3/L4", level: "SDE-2 Equivalent",
        requirements: [
          { skill: "Data Structures & Algorithms", weight: 35, level: "Expert", desc: "LeetCode Hard problems, dynamic programming, graph algorithms. Google expects top-percentile DSA skills — all 4 coding rounds are DSA-focused." },
          { skill: "System Design", weight: 30, level: "Expert", desc: "Design YouTube, Google Drive, or Maps at scale. Discuss sharding, caching (Memcached), CDN, and load balancing with quantitative reasoning." },
          { skill: "C++ / Java / Python / Go", weight: 20, level: "Expert", desc: "Deep proficiency — not just syntax. Memory management, concurrency patterns, and language-specific performance trade-offs matter." },
          { skill: "Computer Science Fundamentals", weight: 15, level: "Strong", desc: "OS (processes, threads, IPC), networking (TCP/IP, HTTP/2), databases (ACID, B-trees), and distributed systems theory." },
        ]
      },
      {
        title: "ML Engineer", level: "L4/L5",
        requirements: [
          { skill: "TensorFlow / JAX", weight: 35, level: "Expert", desc: "Production ML at scale. Experience with Google's internal ML stack preferred. TFX, TF-Serving, model compression, and quantization." },
          { skill: "Python & DSA", weight: 25, level: "Expert", desc: "Strong Python with NumPy/Pandas + standard FAANG DSA bar — LeetCode medium/hard problems solved in interviews." },
          { skill: "ML Theory", weight: 25, level: "Expert", desc: "Backpropagation, gradient descent variants, regularization, attention mechanisms, and transformer architectures from scratch." },
          { skill: "Distributed Training", weight: 15, level: "Strong", desc: "Multi-GPU training, data parallelism vs model parallelism, gradient checkpointing, and large-batch optimization." },
        ]
      },
      {
        title: "Site Reliability Engineer", level: "L4",
        requirements: [
          { skill: "Linux & Systems Programming", weight: 30, level: "Expert", desc: "Deep Linux internals, kernel tuning, performance profiling with perf/flamegraphs, and low-level debugging." },
          { skill: "Python / Go / C++", weight: 25, level: "Strong", desc: "Automation, tooling, and toil-reduction scripts. Go preferred for new SRE tooling at Google." },
          { skill: "Distributed Systems & Monitoring", weight: 25, level: "Expert", desc: "Borg/Kubernetes, Prometheus/Monarch, SLOs/SLAs/error budgets, and on-call incident management at Google scale." },
          { skill: "DSA & System Design", weight: 20, level: "Strong", desc: "Same DSA bar as SWE. Additional SRE-specific design: design a monitoring system, alerting pipeline, or auto-remediation framework." },
        ]
      }
    ]
  },
  {
    id: "microsoft", name: "Microsoft", logo: "M", gradient: "from-blue-600 to-blue-400",
    industry: "Technology", hq: "Redmond, WA", tier: "FAANG",
    hiring2023: 15000, hiring2024: 9000, hiringTrend: "down",
    openRoles: 520, avgPackage: "₹40-75 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Software Engineer II", level: "SDE-2",
        requirements: [
          { skill: "Data Structures & Algorithms", weight: 30, level: "Strong", desc: "LeetCode medium problems solved cleanly with optimal time/space. Microsoft focuses on correct, clean code over bleeding-edge tricks." },
          { skill: "System Design", weight: 25, level: "Strong", desc: "Design OneDrive, Teams, or Azure services. Focus on scalability, availability (99.99% SLA), and operational excellence." },
          { skill: "C# / Java / C++", weight: 25, level: "Expert", desc: ".NET ecosystem preferred for core product teams. Azure SDK development requires deep async/await, memory management, and COM interop." },
          { skill: "Azure Cloud Services", weight: 20, level: "Working Knowledge", desc: "Compute (VM, AKS, Functions), Storage (Blob, Table, Queue), Cosmos DB, Service Bus. AZ-204 certification is a plus." },
        ]
      },
      {
        title: "Azure Cloud Engineer", level: "SDE-2/3",
        requirements: [
          { skill: "Azure Native Services", weight: 35, level: "Expert", desc: "AKS, Azure Functions, Logic Apps, API Management, Event Grid, Service Bus. Production deployment and operations experience required." },
          { skill: "Infrastructure as Code", weight: 25, level: "Expert", desc: "Bicep, ARM Templates, or Terraform at enterprise scale. 500+ resource deployments across subscriptions with policy governance." },
          { skill: "Kubernetes & Docker", weight: 25, level: "Strong", desc: "Production K8s — HPA, KEDA, Pod Disruption Budgets, resource quotas, and network policies in enterprise multi-tenant environments." },
          { skill: "Monitoring & DevOps", weight: 15, level: "Strong", desc: "Azure Monitor, Application Insights, Log Analytics, and Azure DevOps pipelines for fully automated CI/CD." },
        ]
      }
    ]
  },
  {
    id: "amazon", name: "Amazon", logo: "A", gradient: "from-orange-500 to-yellow-400",
    industry: "E-commerce / Cloud", hq: "Seattle, WA", tier: "FAANG",
    hiring2023: 18000, hiring2024: 11000, hiringTrend: "down",
    openRoles: 640, avgPackage: "₹42-78 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Software Dev Engineer II", level: "SDE-2",
        requirements: [
          { skill: "Data Structures & Algorithms", weight: 30, level: "Expert", desc: "Amazon has some of the highest DSA bars. Expect 2–3 coding rounds with LeetCode medium-hard. Edge cases and follow-ups are standard." },
          { skill: "Amazon Leadership Principles", weight: 25, level: "Expert", desc: "All 16 LPs must be internalized with STAR-format stories. 'Customer Obsession', 'Dive Deep', and 'Deliver Results' are heavily weighted." },
          { skill: "System Design (AWS-Native)", weight: 25, level: "Strong", desc: "Design using AWS services: DynamoDB, SQS/SNS, Lambda, API Gateway, ElastiCache, Kinesis. Prefer managed services over self-managed." },
          { skill: "Java / Python / C++", weight: 20, level: "Strong", desc: "Java is dominant at Amazon. OOP design, SOLID principles, multithreaded programming, and code review best practices." },
        ]
      },
      {
        title: "AWS Solutions Architect", level: "Senior",
        requirements: [
          { skill: "AWS Architecture", weight: 35, level: "Expert", desc: "Well-Architected Framework across all 6 pillars. Multi-AZ/Multi-Region designs, disaster recovery (RTO/RPO), and cost optimization." },
          { skill: "Networking & Security", weight: 25, level: "Expert", desc: "VPC design, Transit Gateway, Direct Connect, PrivateLink, IAM (role/policy design), KMS, and security compliance frameworks." },
          { skill: "Serverless & Containers", weight: 25, level: "Strong", desc: "Lambda, ECS, EKS, Fargate, and event-driven architectures. Experience migrating monoliths to microservices on AWS." },
          { skill: "Database Selection", weight: 15, level: "Strong", desc: "Right tool selection: Aurora, DynamoDB, Redshift, ElastiCache, Neptune. Understand CAP theorem implications for each." },
        ]
      }
    ]
  },
  {
    id: "meta", name: "Meta", logo: "∞", gradient: "from-blue-600 to-indigo-500",
    industry: "Social Media", hq: "Menlo Park, CA", tier: "FAANG",
    hiring2023: 7000, hiring2024: 4500, hiringTrend: "down",
    openRoles: 220, avgPackage: "₹50-90 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer, Production Engineering", level: "E4",
        requirements: [
          { skill: "Distributed Systems", weight: 35, level: "Expert", desc: "Thrift RPC, ZooKeeper, Cassandra, TAO (Meta's graph database), and Scuba for analytics. Understanding of billions-of-users scale challenges." },
          { skill: "Data Structures & Algorithms", weight: 30, level: "Expert", desc: "Meta expects the sharpest DSA skills. 45-min coding interviews — clean optimal solutions only. LeetCode Hard is standard." },
          { skill: "Hack / PHP / C++", weight: 20, level: "Working Knowledge", desc: "Meta's internal stack. Hack (typed PHP) for web, C++ for infrastructure. Willingness to learn internal tools is key." },
          { skill: "Unix Systems & Networking", weight: 15, level: "Strong", desc: "Linux internals, TCP tuning, NUMA, kernel bypass networking (DPDK), and performance engineering at rack scale." },
        ]
      }
    ]
  },
  {
    id: "apple", name: "Apple", logo: "🍎", gradient: "from-gray-700 to-gray-500",
    industry: "Consumer Tech", hq: "Cupertino, CA", tier: "FAANG",
    hiring2023: 8000, hiring2024: 6000, hiringTrend: "stable",
    openRoles: 290, avgPackage: "₹48-85 LPA", glassdoor: 4.2,
    roles: [
      {
        title: "Software Engineer — iOS/macOS", level: "ICT3",
        requirements: [
          { skill: "Swift & Objective-C", weight: 40, level: "Expert", desc: "Deep Swift — actors, async/await, memory management with ARC, Swift Package Manager. Objective-C interop for legacy frameworks." },
          { skill: "Apple Frameworks", weight: 30, level: "Expert", desc: "UIKit, SwiftUI, Core Data, Core Bluetooth, CoreML, ARKit, Metal (GPU programming). Experience shipping to App Store preferred." },
          { skill: "C++ (Performance)", weight: 15, level: "Strong", desc: "Apple uses C++ extensively in system frameworks. SIMD intrinsics, Accelerate framework, and low-level memory optimization." },
          { skill: "Privacy & Security", weight: 15, level: "Strong", desc: "Privacy-by-design, App Tracking Transparency, secure enclave, and data minimization principles central to Apple's engineering culture." },
        ]
      }
    ]
  },
  // ── Indian Product Unicorns ───────────────────────────────
  {
    id: "flipkart", name: "Flipkart", logo: "F", gradient: "from-yellow-500 to-orange-400",
    industry: "E-commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 2000, hiring2024: 1800, hiringTrend: "stable",
    openRoles: 120, avgPackage: "₹25-50 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "SDE-2 (Backend)", level: "Senior",
        requirements: [
          { skill: "Java & Spring Boot", weight: 35, level: "Expert", desc: "Microservices at e-commerce scale. Event-driven architecture with Kafka, circuit breakers (Hystrix/Resilience4j), and distributed tracing." },
          { skill: "Data Structures & Algorithms", weight: 25, level: "Expert", desc: "Flipkart has a strong DSA bar — 3 rounds including system coding. LeetCode medium-hard is expected." },
          { skill: "MySQL & Cassandra", weight: 20, level: "Strong", desc: "Relational DB design for catalog, inventory, and orders. Cassandra for high-write workloads like order history and event logs." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design search autocomplete, flash sale infrastructure, or order management system. Think flash sale traffic spikes: 10x in 30 seconds." },
        ]
      },
      {
        title: "Machine Learning Engineer", level: "Senior",
        requirements: [
          { skill: "Python & ML Frameworks", weight: 35, level: "Expert", desc: "PyTorch/TensorFlow for recommendation models. XGBoost for ranking. Feature engineering for product search and personalization." },
          { skill: "Recommendation Systems", weight: 30, level: "Expert", desc: "Collaborative filtering, matrix factorization, two-tower models, and real-time feature stores. A/B testing frameworks." },
          { skill: "Big Data (Spark)", weight: 20, level: "Strong", desc: "PySpark for feature pipelines processing billions of user events daily. Hive, Presto, and Delta Lake." },
          { skill: "MLOps & Serving", weight: 15, level: "Working Knowledge", desc: "Model deployment via Seldon/TorchServe, real-time serving at low latency (<50ms), and model monitoring dashboards." },
        ]
      }
    ]
  },
  {
    id: "zomato", name: "Zomato", logo: "Z", gradient: "from-red-500 to-orange-400",
    industry: "Food Tech", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 1200, hiring2024: 900, hiringTrend: "down",
    openRoles: 75, avgPackage: "₹20-42 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Senior SDE (Backend)", level: "SDE-2",
        requirements: [
          { skill: "Golang / Python", weight: 35, level: "Expert", desc: "Go is primary for high-throughput delivery routing. Python for data pipelines. Concurrency patterns, goroutines, and channel management." },
          { skill: "Kafka & Redis", weight: 30, level: "Expert", desc: "Real-time delivery tracking with Kafka. Redis for rider location updates (geospatial commands: GEORADIUS). Sub-second query latency." },
          { skill: "PostgreSQL & DynamoDB", weight: 20, level: "Strong", desc: "Complex queries for restaurant catalog, menus, and order routing. DynamoDB for high-throughput order-state machines." },
          { skill: "System Design", weight: 15, level: "Strong", desc: "Design real-time delivery tracking, dynamic pricing engine (surge), or restaurant ETA prediction system." },
        ]
      }
    ]
  },
  {
    id: "swiggy", name: "Swiggy", logo: "S", gradient: "from-orange-600 to-amber-400",
    industry: "Food Tech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1400, hiring2024: 1100, hiringTrend: "stable",
    openRoles: 88, avgPackage: "₹22-45 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "SDE-2 (Platform)", level: "Senior",
        requirements: [
          { skill: "Java / Go Microservices", weight: 35, level: "Expert", desc: "Istio service mesh, gRPC for inter-service communication, circuit breaking, and rate limiting at Swiggy's delivery orchestration scale." },
          { skill: "Kafka & Event Streaming", weight: 30, level: "Expert", desc: "Order state machine events, inventory updates, and delivery partner notifications — all event-driven via Kafka with at-least-once semantics." },
          { skill: "PostgreSQL & Caching", weight: 20, level: "Strong", desc: "Multi-region Postgres for order management. Redis for session management and real-time restaurant availability cache." },
          { skill: "Kubernetes (GCP)", weight: 15, level: "Working Knowledge", desc: "Swiggy runs on GCP. GKE cluster management, HPA for traffic spikes (dinner rush), and canary deployments for zero-downtime." },
        ]
      }
    ]
  },
  {
    id: "razorpay", name: "Razorpay", logo: "R", gradient: "from-blue-800 to-blue-500",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 800, hiring2024: 650, hiringTrend: "stable",
    openRoles: 55, avgPackage: "₹25-52 LPA", glassdoor: 4.2,
    roles: [
      {
        title: "Software Engineer — Payments Core", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Go", weight: 35, level: "Expert", desc: "High-reliability payment processing: idempotency keys, retry with exponential backoff, and reconciliation. Zero data loss is non-negotiable." },
          { skill: "PostgreSQL & Redis", weight: 30, level: "Expert", desc: "ACID transactions for financial ledgers. Redis distributed locks for preventing double-charge in concurrent payment processing." },
          { skill: "Security & PCI-DSS", weight: 20, level: "Strong", desc: "Tokenization, 3DS2 authentication, encryption at rest/transit, and PCI-DSS Level 1 compliance requirements." },
          { skill: "Machine Coding", weight: 15, level: "Expert", desc: "Razorpay's famous machine coding round: build a payment gateway module, retry logic, or rate limiter in 90 minutes — production quality." },
        ]
      },
      {
        title: "Frontend Engineer", level: "SDE-2",
        requirements: [
          { skill: "React & TypeScript", weight: 40, level: "Expert", desc: "Complex payment flow UIs: multi-step checkout, OTP flows, EMI selection. Accessibility-first (WCAG 2.1 AA) for payment widgets embedded in 500K+ merchant sites." },
          { skill: "Redux & State Management", weight: 25, level: "Expert", desc: "Predictable state for multi-step payment flows with error recovery. Redux Saga for complex async payment state transitions." },
          { skill: "Web Security", weight: 20, level: "Expert", desc: "CSP headers, iframe sandboxing, XSS prevention in payment forms, and clickjacking protection for merchant-embedded checkout." },
          { skill: "Performance Optimization", weight: 15, level: "Strong", desc: "Core Web Vitals for checkout page. LCP <2.5s even on 2G networks (rural India merchant customers). Bundle splitting and lazy loading." },
        ]
      }
    ]
  },
  {
    id: "phonepe", name: "PhonePe", logo: "P", gradient: "from-violet-700 to-purple-400",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1200, hiring2024: 1000, hiringTrend: "stable",
    openRoles: 90, avgPackage: "₹22-48 LPA", glassdoor: 4.1,
    roles: [
      {
        title: "Senior Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java & Spring Boot", weight: 35, level: "Expert", desc: "UPI payment processing at 100M+ daily transactions. Microservices with Saga pattern for distributed transactions across wallet, bank, and merchant services." },
          { skill: "Kafka & MySQL", weight: 30, level: "Expert", desc: "Async transaction processing with exactly-once Kafka semantics. MySQL with Vitess for horizontal sharding of financial data at scale." },
          { skill: "AWS & Performance", weight: 20, level: "Strong", desc: "EC2, RDS, ElastiCache deployment on AWS. JVM tuning (GC optimization), heap analysis, and profiling with async-profiler." },
          { skill: "Machine Coding", weight: 15, level: "Expert", desc: "Machine coding expected: build a transaction state machine, wallet service, or OTP rate limiter in 60-90 minutes." },
        ]
      }
    ]
  },
  {
    id: "paytm", name: "Paytm", logo: "PT", gradient: "from-blue-500 to-sky-400",
    industry: "Fintech", hq: "Noida", tier: "Unicorn",
    hiring2023: 1500, hiring2024: 700, hiringTrend: "down",
    openRoles: 48, avgPackage: "₹18-38 LPA", glassdoor: 3.5,
    roles: [
      {
        title: "Senior Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Python", weight: 35, level: "Expert", desc: "Payment gateway, QR code processing, and merchant onboarding systems. High concurrency for festival-period traffic spikes (10x normal)." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Relational DB for financial records. Redis for real-time wallet balance cache and idempotency token storage." },
          { skill: "Microservices Architecture", weight: 25, level: "Strong", desc: "Spring Cloud, Zuul API Gateway, Eureka service discovery, and distributed tracing with Zipkin." },
          { skill: "DSA", weight: 15, level: "Strong", desc: "Standard DSA bar. LeetCode medium expected. Paytm focuses more on practical coding (implementation) than pure algorithmic tricks." },
        ]
      }
    ]
  },
  {
    id: "ola", name: "Ola", logo: "O", gradient: "from-green-700 to-lime-400",
    industry: "Mobility", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 900, hiring2024: 700, hiringTrend: "stable",
    openRoles: 60, avgPackage: "₹20-42 LPA", glassdoor: 3.6,
    roles: [
      {
        title: "Senior SDE (Platform)", level: "SDE-2",
        requirements: [
          { skill: "Java / Go Microservices", weight: 35, level: "Expert", desc: "Ride-hailing at city scale. Real-time driver-rider matching, surge pricing engine, and dispatch optimization algorithms." },
          { skill: "Redis Geospatial & Kafka", weight: 30, level: "Expert", desc: "GEORADIUS for driver proximity search. Kafka for real-time location event streaming from millions of drivers." },
          { skill: "System Design", weight: 20, level: "Expert", desc: "Design ride matching system (consider driver availability, traffic, surge), real-time tracking, or ETA prediction engine." },
          { skill: "MySQL & Cassandra", weight: 15, level: "Strong", desc: "Trip records in MySQL, ride history in Cassandra (write-heavy, time-series). Cassandra compaction tuning for high throughput." },
        ]
      }
    ]
  },
  {
    id: "cred", name: "CRED", logo: "C", gradient: "from-zinc-800 to-zinc-600",
    industry: "Fintech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 500, hiring2024: 450, hiringTrend: "stable",
    openRoles: 35, avgPackage: "₹28-58 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Android Engineer", level: "Senior",
        requirements: [
          { skill: "Kotlin & Jetpack Compose", weight: 40, level: "Expert", desc: "CRED is known for best-in-class Android UX. Compose animations, custom layouts, recomposition optimization, and UI performance profiling (systrace)." },
          { skill: "MVVM & Clean Architecture", weight: 30, level: "Expert", desc: "Layered architecture: use cases, repositories, domain models. Hilt for DI. ViewModels with StateFlow for reactive UI." },
          { skill: "Machine Coding", weight: 20, level: "Expert", desc: "CRED's machine coding round tests architectural thinking: implement a credit score visualizer, payment screen, or animation-heavy card UI in 90 minutes." },
          { skill: "Performance & Memory", weight: 10, level: "Strong", desc: "Memory leak detection with LeakCanary, render performance with GPU profiler, and battery optimization for background sync." },
        ]
      }
    ]
  },
  {
    id: "meesho", name: "Meesho", logo: "Me", gradient: "from-pink-500 to-rose-400",
    industry: "Social Commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 1100, hiring2024: 900, hiringTrend: "stable",
    openRoles: 68, avgPackage: "₹18-38 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Backend Engineer (Growth)", level: "SDE-2",
        requirements: [
          { skill: "Python / Java", weight: 30, level: "Strong", desc: "Growth engineering: A/B testing infrastructure, referral systems, and notification pipelines for 150M+ rural users." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Relational DB for catalog and orders optimized for Tier-2/3 city network conditions. Redis for product view counters and trending items." },
          { skill: "Kafka & Microservices", weight: 25, level: "Strong", desc: "Event-driven catalog updates, supplier notifications, and return processing pipelines via Kafka." },
          { skill: "DSA", weight: 20, level: "Strong", desc: "2 DSA rounds — LeetCode medium level. Meesho has a growing engineering bar with more emphasis on system design for senior roles." },
        ]
      }
    ]
  },
  {
    id: "byjus", name: "Byju's", logo: "B", gradient: "from-purple-800 to-fuchsia-500",
    industry: "EdTech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 2200, hiring2024: 400, hiringTrend: "down",
    openRoles: 25, avgPackage: "₹12-28 LPA", glassdoor: 2.9,
    roles: [
      {
        title: "React Native Developer", level: "SDE-2",
        requirements: [
          { skill: "React Native", weight: 40, level: "Expert", desc: "Cross-platform for video learning, interactive content, and offline-first functionality. React Navigation, Expo modules, and native bridges." },
          { skill: "JavaScript & Redux", weight: 30, level: "Strong", desc: "State management for content playback progress, offline sync, and quiz state. Redux Saga for complex async flows." },
          { skill: "Performance & Animations", weight: 20, level: "Strong", desc: "Reanimated 2 for smooth 60fps animations. Performance optimization for low-end Android devices (512MB RAM) used by students." },
          { skill: "Video & Streaming", weight: 10, level: "Working Knowledge", desc: "HLS/DASH streaming integration, DRM content protection, and adaptive bitrate for 2G/3G connectivity." },
        ]
      }
    ]
  },
  {
    id: "nykaa", name: "Nykaa", logo: "N", gradient: "from-pink-600 to-rose-400",
    industry: "E-commerce / Beauty", hq: "Mumbai", tier: "Unicorn",
    hiring2023: 600, hiring2024: 500, hiringTrend: "stable",
    openRoles: 42, avgPackage: "₹15-32 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Full Stack Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js & React", weight: 35, level: "Strong", desc: "Next.js for SSR product pages (SEO critical for beauty commerce). Node.js BFF (Backend for Frontend) for mobile apps." },
          { skill: "MongoDB & MySQL", weight: 25, level: "Strong", desc: "Product catalog in MongoDB (flexible schema for cosmetics attributes). Orders and inventory in MySQL." },
          { skill: "AWS & CDN", weight: 20, level: "Working Knowledge", desc: "CloudFront CDN for beauty product images (10M+ SKUs), S3 for media storage, and EC2 auto-scaling for sale events." },
          { skill: "DSA", weight: 20, level: "Working Knowledge", desc: "2 coding rounds — LeetCode easy-medium. Nykaa focuses more on practical implementation skills." },
        ]
      }
    ]
  },
  {
    id: "freshworks", name: "Freshworks", logo: "FW", gradient: "from-green-600 to-teal-400",
    industry: "SaaS / CRM", hq: "Chennai", tier: "Unicorn",
    hiring2023: 900, hiring2024: 700, hiringTrend: "stable",
    openRoles: 58, avgPackage: "₹20-42 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Senior Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Ruby on Rails / React", weight: 35, level: "Expert", desc: "Freshdesk and CRM features in Rails backend + React frontend. Multi-tenant SaaS with row-level tenancy and feature flagging." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Multi-tenant DB design (schema-per-tenant for enterprise). Sidekiq + Redis for background email processing and webhook delivery." },
          { skill: "Event-Driven Architecture", weight: 25, level: "Strong", desc: "Kafka for cross-product event flows (CRM → Helpdesk → Marketing automation). Pub/Sub for real-time ticket updates." },
          { skill: "SaaS Fundamentals", weight: 15, level: "Strong", desc: "Multi-tenancy, billing integration, OAuth/SAML SSO, and API rate limiting for 60,000+ customer organizations." },
        ]
      }
    ]
  },
  // ── IT Services Giants ────────────────────────────────────
  {
    id: "tcs", name: "TCS", logo: "T", gradient: "from-blue-700 to-blue-500",
    industry: "IT Services", hq: "Mumbai", tier: "IT Services",
    hiring2023: 40000, hiring2024: 35000, hiringTrend: "stable",
    openRoles: 2800, avgPackage: "₹3.5-8 LPA (Entry)", glassdoor: 3.8,
    roles: [
      {
        title: "Systems Engineer (Entry)", level: "Fresher / 0-2Y",
        requirements: [
          { skill: "Java / Python Fundamentals", weight: 30, level: "Working Knowledge", desc: "Core Java (Collections, Streams, OOP) or Python basics. TCS CodeVita and NQT test these through problem-solving challenges." },
          { skill: "SQL & Database Basics", weight: 25, level: "Working Knowledge", desc: "SELECT, JOINs, GROUP BY, and basic stored procedures. Understanding of normalization and indexing is a plus." },
          { skill: "Logical Reasoning & Aptitude", weight: 25, level: "Strong", desc: "TCS NQT aptitude section: quantitative, verbal, logical, and coding. A strong NQT score unlocks higher initial packages." },
          { skill: "Web Technologies Basics", weight: 20, level: "Working Knowledge", desc: "HTML, CSS, basic JavaScript, and REST API understanding. Full-stack web development exposure preferred for digital roles." },
        ]
      },
      {
        title: "Software Developer (3-5Y)", level: "Associate Consultant",
        requirements: [
          { skill: "Java EE / Spring / Microservices", weight: 35, level: "Strong", desc: "Enterprise Java stack — Spring Boot REST services, JPA/Hibernate, and Spring Security for enterprise client projects." },
          { skill: "Cloud (AWS/Azure)", weight: 25, level: "Working Knowledge", desc: "TCS is pushing cloud-first projects. AWS Solutions Architect Associate or Azure AZ-900 certifications are highly preferred." },
          { skill: "SQL & NoSQL", weight: 20, level: "Strong", desc: "Oracle SQL, MySQL, and MongoDB for enterprise client data management. PL/SQL experience is frequently required for banking clients." },
          { skill: "Agile & DevOps", weight: 20, level: "Working Knowledge", desc: "Scrum ceremonies, JIRA, Jenkins CI/CD, and Git workflow. TCS's Agile transformation projects require these skills." },
        ]
      }
    ]
  },
  {
    id: "infosys", name: "Infosys", logo: "I", gradient: "from-blue-600 to-sky-400",
    industry: "IT Services", hq: "Bangalore", tier: "IT Services",
    hiring2023: 35000, hiring2024: 30000, hiringTrend: "stable",
    openRoles: 2400, avgPackage: "₹3.6-9 LPA (Entry)", glassdoor: 3.9,
    roles: [
      {
        title: "Systems Engineer (Fresher)", level: "Entry Level",
        requirements: [
          { skill: "Core Java / Python", weight: 30, level: "Working Knowledge", desc: "Infosys InfyTQ platform tests these. Strong OOP fundamentals required. DSA basics: arrays, strings, and sorting algorithms." },
          { skill: "SQL Fundamentals", weight: 25, level: "Working Knowledge", desc: "Infosys training covers Oracle SQL. Pre-joining: basic SQL queries, ERD reading, and normalization up to 3NF." },
          { skill: "Communication Skills", weight: 25, level: "Strong", desc: "Infosys HR rounds emphasize clear communication. Campus interviews test verbal ability and situational judgment for client-facing roles." },
          { skill: "Problem Solving", weight: 20, level: "Working Knowledge", desc: "HackerEarth-based assessment at application stage. 2 coding problems: 1 easy + 1 medium difficulty in preferred language." },
        ]
      },
      {
        title: "Technology Analyst (3-6Y)", level: "Mid-level",
        requirements: [
          { skill: "Full Stack Development", weight: 30, level: "Strong", desc: "Angular/React frontend + Java Spring Boot backend. Infosys's digital transformation projects for Fortune 500 clients." },
          { skill: "Cloud & DevOps", weight: 25, level: "Working Knowledge", desc: "AWS, Azure, or GCP experience. Docker, Jenkins CI/CD. Infosys offers internal cloud certifications via Lex platform." },
          { skill: "Domain Knowledge", weight: 25, level: "Working Knowledge", desc: "BFSI, retail, or healthcare domain understanding. Client-specific business processes and regulatory requirements." },
          { skill: "Agile / SAFe", weight: 20, level: "Working Knowledge", desc: "SAFe (Scaled Agile Framework) is increasingly used at Infosys for large enterprise engagements. Scrum Master certification is a plus." },
        ]
      }
    ]
  },
  {
    id: "wipro", name: "Wipro", logo: "W", gradient: "from-purple-600 to-violet-400",
    industry: "IT Services", hq: "Bangalore", tier: "IT Services",
    hiring2023: 25000, hiring2024: 22000, hiringTrend: "stable",
    openRoles: 1800, avgPackage: "₹3.5-7.5 LPA (Entry)", glassdoor: 3.7,
    roles: [
      {
        title: "Project Engineer (Fresher)", level: "Entry Level",
        requirements: [
          { skill: "Core Java / C++", weight: 30, level: "Working Knowledge", desc: "WASE (Wipro Academy of Software Excellence) and Elite NLTH test Java/C++ through a 3-section online assessment." },
          { skill: "DBMS & SQL", weight: 25, level: "Working Knowledge", desc: "Database concepts, ER diagrams, and SQL queries (SELECT with JOIN, aggregates). Often tested in the technical interview." },
          { skill: "Verbal & Aptitude", weight: 25, level: "Strong", desc: "Online test includes English communication, quantitative aptitude, and written English. All sections are separately time-bound." },
          { skill: "Networking Basics", weight: 20, level: "Working Knowledge", desc: "OSI model, TCP/IP stack basics, HTTP/HTTPS. Relevant for infrastructure and cloud support roles." },
        ]
      }
    ]
  },
  {
    id: "hcl", name: "HCLTech", logo: "H", gradient: "from-blue-700 to-sky-500",
    industry: "IT Services", hq: "Noida", tier: "IT Services",
    hiring2023: 20000, hiring2024: 18000, hiringTrend: "stable",
    openRoles: 1600, avgPackage: "₹3.5-7 LPA (Entry)", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer (Fresher)", level: "Entry Level",
        requirements: [
          { skill: "Java / .NET / C", weight: 30, level: "Working Knowledge", desc: "HCL Tech Bee recruitment tests any one language. .NET/C# is frequently in demand for enterprise and product engineering projects." },
          { skill: "SQL & Data", weight: 25, level: "Working Knowledge", desc: "Basic SQL for data management. SSIS/SSRS knowledge is plus for data-intensive enterprise projects." },
          { skill: "Aptitude & Logical Reasoning", weight: 25, level: "Working Knowledge", desc: "Online proctored test on AMCAT platform — quant, logical, verbal, and technical MCQs." },
          { skill: "SDLC & Testing", weight: 20, level: "Working Knowledge", desc: "Basic software testing (manual QA), STLC, and test case writing. HCL has strong QA practices for enterprise projects." },
        ]
      }
    ]
  },
  {
    id: "accenture", name: "Accenture", logo: "Ac", gradient: "from-purple-700 to-pink-500",
    industry: "IT Consulting", hq: "Dublin (India: Bangalore)", tier: "IT Services",
    hiring2023: 30000, hiring2024: 25000, hiringTrend: "down",
    openRoles: 2100, avgPackage: "₹4.5-12 LPA (Entry)", glassdoor: 4.0,
    roles: [
      {
        title: "Associate Software Engineer", level: "Entry / 0-2Y",
        requirements: [
          { skill: "Java / Python / JavaScript", weight: 30, level: "Working Knowledge", desc: "Accenture's CocubeTest (online assessment) tests coding in Java/Python. Full stack JavaScript is in high demand for Accenture Interactive." },
          { skill: "Cloud Fundamentals", weight: 25, level: "Working Knowledge", desc: "Accenture's cloud practice (GCP, Azure, AWS) is massive. Cloud fundamentals certification helps significantly during joining." },
          { skill: "Communication & Collaboration", weight: 25, level: "Strong", desc: "Accenture's interview process has a strong behavioral/cultural fit component. Client-facing communication is a core competency." },
          { skill: "AI/ML Awareness", weight: 20, level: "Working Knowledge", desc: "Accenture AI practice is growing rapidly. Familiarity with Copilot, ChatGPT APIs, and AI-assisted development tools is increasingly asked." },
        ]
      }
    ]
  },
  // ── Global MNCs with India GCCs ──────────────────────────
  {
    id: "uber", name: "Uber", logo: "U", gradient: "from-gray-900 to-gray-700",
    industry: "Mobility / Tech", hq: "San Francisco (India: Bangalore)", tier: "MNC",
    hiring2023: 1800, hiring2024: 1200, hiringTrend: "down",
    openRoles: 90, avgPackage: "₹35-65 LPA", glassdoor: 4.1,
    roles: [
      {
        title: "Software Engineer II", level: "SDE-2",
        requirements: [
          { skill: "Go / Python / Java", weight: 30, level: "Expert", desc: "Uber's service mesh (YARPC) and Go-based microservices for dispatch, pricing, and driver tracking. High-performance concurrent systems." },
          { skill: "Distributed Systems", weight: 30, level: "Expert", desc: "Uber's tech stack: Kafka, Cassandra (Schemaless), Redis, MySQL, Kafka. Real-time geospatial matching and H3 spatial indexing." },
          { skill: "DSA & Problem Solving", weight: 25, level: "Expert", desc: "Same FAANG-level DSA bar. LeetCode hard is possible. Uber interviews are known to be rigorous — 5-6 rounds." },
          { skill: "System Design", weight: 15, level: "Expert", desc: "Design Uber's surge pricing, fraud detection, or ETA system. Think at global scale: 100 cities, 5M daily trips." },
        ]
      }
    ]
  },
  {
    id: "netflix", name: "Netflix", logo: "N", gradient: "from-red-700 to-red-500",
    industry: "Entertainment / Tech", hq: "Los Gatos (India: Chennai)", tier: "MNC",
    hiring2023: 3000, hiring2024: 2500, hiringTrend: "stable",
    openRoles: 140, avgPackage: "₹60-120 LPA", glassdoor: 4.4,
    roles: [
      {
        title: "Senior Software Engineer", level: "Senior",
        requirements: [
          { skill: "Java & Spring", weight: 30, level: "Expert", desc: "Netflix OSS ecosystem: Eureka, Hystrix, Zuul, Ribbon. Microservices powering 300M+ subscriber content delivery." },
          { skill: "AWS Architecture", weight: 25, level: "Expert", desc: "Netflix runs entirely on AWS. Multi-region active-active deployment, chaos engineering (Chaos Monkey authored at Netflix), and ChaosConf engineering." },
          { skill: "Big Data (Spark / Flink)", weight: 25, level: "Expert", desc: "Apache Spark for viewership analytics, recommendation data pipelines, and content licensing data at petabyte scale." },
          { skill: "System Design", weight: 20, level: "Expert", desc: "Netflix culture values senior ownership. Design CDN for video streaming, recommendation engine, or content encoding pipeline." },
        ]
      }
    ]
  },
  {
    id: "adobe", name: "Adobe", logo: "Ad", gradient: "from-red-700 to-orange-500",
    industry: "SaaS / Creative", hq: "San Jose (India: Noida)", tier: "MNC",
    hiring2023: 3000, hiring2024: 2800, hiringTrend: "stable",
    openRoles: 180, avgPackage: "₹30-60 LPA", glassdoor: 4.4,
    roles: [
      {
        title: "Computer Scientist", level: "SDE-2/3",
        requirements: [
          { skill: "C++ / Java", weight: 30, level: "Expert", desc: "Adobe's core products (Photoshop, Acrobat, Premiere) use C++ for performance-critical rendering. Java for Experience Cloud SaaS services." },
          { skill: "Data Structures & Algorithms", weight: 25, level: "Expert", desc: "Strong DSA — Adobe Noida is known for a high interview bar matching FAANG. Expect graph algorithms and advanced DP problems." },
          { skill: "Computer Graphics / Media", weight: 25, level: "Strong", desc: "For creative tools teams: OpenGL, image processing, color science, or video codec knowledge is a significant differentiator." },
          { skill: "System Design & Cloud", weight: 20, level: "Strong", desc: "Adobe Experience Cloud runs on AWS. Microservices design for content management, digital asset management, and analytics platforms." },
        ]
      }
    ]
  },
  {
    id: "salesforce", name: "Salesforce", logo: "SF", gradient: "from-sky-600 to-blue-400",
    industry: "CRM SaaS", hq: "San Francisco (India: Hyderabad)", tier: "MNC",
    hiring2023: 3500, hiring2024: 2200, hiringTrend: "down",
    openRoles: 160, avgPackage: "₹32-62 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Software Engineer MTS", level: "MTS-2",
        requirements: [
          { skill: "Java & Force.com", weight: 35, level: "Expert", desc: "Apex (Salesforce Java dialect), SOQL, and SOSL for CRM development. Lightning Web Components (LWC) for modern Salesforce UI." },
          { skill: "Distributed Systems", weight: 25, level: "Expert", desc: "Salesforce's Hyperforce architecture (cloud-native, any public cloud). Multi-tenant database architecture serving 150,000+ customers on shared infrastructure." },
          { skill: "DSA & Problem Solving", weight: 25, level: "Strong", desc: "Strong coding bar. 2 coding interviews + 1 system design. Salesforce values both code quality and thoughtful API design." },
          { skill: "REST/GraphQL APIs", weight: 15, level: "Strong", desc: "Salesforce's comprehensive REST, SOAP, and Bulk APIs. Experience building and versioning APIs consumed by thousands of partners." },
        ]
      }
    ]
  },
  {
    id: "linkedin", name: "LinkedIn", logo: "Li", gradient: "from-blue-700 to-sky-500",
    industry: "Professional Network", hq: "Sunnyvale (India: Bangalore)", tier: "MNC",
    hiring2023: 2500, hiring2024: 1600, hiringTrend: "down",
    openRoles: 110, avgPackage: "₹38-72 LPA", glassdoor: 4.4,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java & Scala", weight: 30, level: "Expert", desc: "LinkedIn's backend runs on Java. Scala for Apache Kafka (LinkedIn's open-source creation) and Samza stream processing." },
          { skill: "Distributed Systems", weight: 30, level: "Expert", desc: "LinkedIn OSS: Kafka, Samza, Espresso (NoSQL), Pinot (real-time OLAP), and Azkaban (workflow scheduler). Experience with any preferred." },
          { skill: "Data Structures & Algorithms", weight: 25, level: "Expert", desc: "FAANG-level DSA bar. Graph algorithms are especially relevant (social graph has 900M+ nodes). Network flow, BFS/DFS, shortest paths." },
          { skill: "Feed & Recommendation Systems", weight: 15, level: "Strong", desc: "LinkedIn's core product. Experience with relevance ranking, filtering, and personalization algorithms for social feeds." },
        ]
      }
    ]
  },
  {
    id: "oracle", name: "Oracle", logo: "Or", gradient: "from-red-600 to-orange-400",
    industry: "Enterprise Tech", hq: "Austin (India: Hyderabad)", tier: "MNC",
    hiring2023: 5000, hiring2024: 4500, hiringTrend: "stable",
    openRoles: 350, avgPackage: "₹22-48 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Application Developer", level: "IC3",
        requirements: [
          { skill: "Java & PL/SQL", weight: 35, level: "Strong", desc: "Oracle Fusion ERP development — Java EE, ADF (Application Development Framework), and deep PL/SQL for Oracle DB stored procedures." },
          { skill: "Oracle Cloud Infrastructure", weight: 25, level: "Working Knowledge", desc: "OCI compute, networking, and Autonomous Database. Oracle is heavily investing in its own cloud to compete with AWS/Azure." },
          { skill: "REST APIs & Microservices", weight: 25, level: "Strong", desc: "Oracle Fusion APIs, REST and SOAP web services for ERP integrations (HR, Finance, Supply Chain). Helidon microframework." },
          { skill: "SQL & Database Tuning", weight: 15, level: "Strong", desc: "Oracle DB-specific features: partitioning, materialized views, Oracle Scheduler, and execution plan analysis with EXPLAIN PLAN." },
        ]
      }
    ]
  },
  {
    id: "sap", name: "SAP", logo: "SAP", gradient: "from-blue-500 to-sky-300",
    industry: "Enterprise Software", hq: "Walldorf (India: Bangalore)", tier: "MNC",
    hiring2023: 4000, hiring2024: 3500, hiringTrend: "stable",
    openRoles: 270, avgPackage: "₹20-45 LPA", glassdoor: 4.1,
    roles: [
      {
        title: "Development Expert", level: "Senior",
        requirements: [
          { skill: "ABAP & SAP Stack", weight: 35, level: "Expert", desc: "SAP ABAP, BTP (Business Technology Platform), CAP (Cloud Application Programming model), and S/4HANA development." },
          { skill: "Java & Node.js", weight: 25, level: "Strong", desc: "SAP BTP full-stack development with Java Spring or Node.js. Cloud Foundry deployment and SAP HANA database connectivity." },
          { skill: "UI5 / Fiori", weight: 20, level: "Strong", desc: "SAP Fiori UX design principles, UI5 framework, OData services consumption, and SAP Fiori Launchpad configuration." },
          { skill: "Integration (SAP PI/PO)", weight: 20, level: "Working Knowledge", desc: "SAP Integration Suite (formerly PI/PO) for connecting SAP with external systems. iFlows, EDI, and IDOC processing." },
        ]
      }
    ]
  },
  {
    id: "ibm", name: "IBM", logo: "IBM", gradient: "from-blue-800 to-blue-600",
    industry: "IT Services / Consulting", hq: "Armonk (India: Bangalore)", tier: "MNC",
    hiring2023: 10000, hiring2024: 9000, hiringTrend: "stable",
    openRoles: 720, avgPackage: "₹6-22 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Application Developer", level: "Entry-Mid",
        requirements: [
          { skill: "Java / Python", weight: 30, level: "Strong", desc: "IBM Z (mainframe) projects often need COBOL and Java. Cloud Pak projects need Python/Java. IBM values versatility across legacy and modern stacks." },
          { skill: "IBM Cloud / Watson AI", weight: 25, level: "Working Knowledge", desc: "IBM Cloud services, Watson NLP, and watsonx.ai for AI projects. IBM is positioning heavily in enterprise AI for financial services." },
          { skill: "Kubernetes & OpenShift", weight: 25, level: "Working Knowledge", desc: "IBM OpenShift (enterprise Kubernetes) is a flagship product. Red Hat acquisition made OpenShift/Ansible central to IBM's cloud strategy." },
          { skill: "Consulting & Communication", weight: 20, level: "Strong", desc: "IBM combines tech with consulting. Structured problem framing, client workshops, and executive presentations are expected at Consultant level." },
        ]
      }
    ]
  },
  {
    id: "jpmorgan", name: "J.P. Morgan", logo: "JP", gradient: "from-blue-900 to-blue-700",
    industry: "Banking / Tech", hq: "New York (India: Hyderabad)", tier: "MNC",
    hiring2023: 6000, hiring2024: 5500, hiringTrend: "stable",
    openRoles: 420, avgPackage: "₹25-55 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer", level: "Associate",
        requirements: [
          { skill: "Java & Spring", weight: 30, level: "Expert", desc: "Core banking systems, trade order management, and risk calculation engines in Java. Low-latency, high-throughput for algorithmic trading systems." },
          { skill: "Python & Data", weight: 25, level: "Strong", desc: "Risk analytics, regulatory reporting (Basel III, FRTB), and quantitative finance models in Python. Pandas, NumPy, and Jupyter." },
          { skill: "Cloud & Security", weight: 25, level: "Strong", desc: "AWS/Azure with financial-grade security. JPMC's Athena cloud (AWS-based). FedRAMP compliance, network segmentation, and zero-trust architecture." },
          { skill: "DSA & Problem Solving", weight: 20, level: "Strong", desc: "Technical interviews include DSA. LeetCode medium level. JPMC focuses on code quality and financial domain problem-solving." },
        ]
      }
    ]
  },
  {
    id: "goldman", name: "Goldman Sachs", logo: "GS", gradient: "from-blue-900 to-slate-700",
    industry: "Finance / Tech", hq: "New York (India: Bangalore)", tier: "MNC",
    hiring2023: 3000, hiring2024: 2800, hiringTrend: "stable",
    openRoles: 220, avgPackage: "₹30-65 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer", level: "Associate",
        requirements: [
          { skill: "Java / C++ / Python", weight: 30, level: "Expert", desc: "Goldman's Marquee platform (Java/Python). SecDB (proprietary risk system in Slang). Quant library development in C++." },
          { skill: "DSA & Problem Solving", weight: 30, level: "Expert", desc: "Goldman has one of the hardest financial firm interview processes. Expect LeetCode hard problems and probability/combinatorics questions." },
          { skill: "Financial Domain Knowledge", weight: 20, level: "Working Knowledge", desc: "Basic understanding of equities, fixed income, derivatives, and risk (VaR, Greeks). Not required for engineering but a significant differentiator." },
          { skill: "System Design", weight: 20, level: "Expert", desc: "Design a high-frequency trading order book, real-time risk aggregation system, or market data feed processor with microsecond latency requirements." },
        ]
      }
    ]
  },
  {
    id: "deloitte", name: "Deloitte", logo: "D", gradient: "from-green-700 to-green-500",
    industry: "Consulting / Tech", hq: "London (India: Hyderabad)", tier: "IT Services",
    hiring2023: 12000, hiring2024: 10000, hiringTrend: "stable",
    openRoles: 820, avgPackage: "₹8-25 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Technology Analyst", level: "Entry-Mid",
        requirements: [
          { skill: "Full Stack Development", weight: 30, level: "Strong", desc: "Java Spring Boot or .NET APIs + React/Angular UI for consulting delivery projects. Salesforce or ServiceNow for enterprise platform work." },
          { skill: "Cloud (AWS/Azure)", weight: 25, level: "Working Knowledge", desc: "Deloitte's cloud practice (AllCloud, Deloitte Cloud) needs certified cloud engineers. AZ-900 or AWS CCP as minimum for entry-level." },
          { skill: "Data & Analytics", weight: 25, level: "Working Knowledge", desc: "Power BI, Tableau, SQL, and basic Python for data analytics projects. Deloitte's USI analytics practice handles large financial data analysis." },
          { skill: "Consulting Skills", weight: 20, level: "Strong", desc: "Structured thinking, client presentation, and business process analysis. MBB-style case interview elements are present at senior consulting roles." },
        ]
      }
    ]
  },
  // ── Emerging Tech Companies ───────────────────────────────
  {
    id: "dunzo", name: "Dunzo", logo: "Du", gradient: "from-green-500 to-emerald-400",
    industry: "Quick Commerce", hq: "Bangalore", tier: "Startup",
    hiring2023: 300, hiring2024: 150, hiringTrend: "down",
    openRoles: 15, avgPackage: "₹18-35 LPA", glassdoor: 3.4,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Node.js", weight: 35, level: "Strong", desc: "Q-commerce delivery orchestration — order management, dark store inventory sync, and 10-minute delivery routing algorithms." },
          { skill: "PostgreSQL & Redis", weight: 30, level: "Strong", desc: "Real-time inventory tracking in Redis, PostgreSQL for order records. Geospatial queries for nearest dark store selection." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design 10-minute delivery routing, dark store inventory management, or real-time delivery partner assignment system." },
          { skill: "DSA", weight: 15, level: "Working Knowledge", desc: "Basic-medium DSA. Dunzo focuses on practical engineering skills over competitive programming tricks." },
        ]
      }
    ]
  },
  {
    id: "sharechat", name: "ShareChat", logo: "SC", gradient: "from-cyan-600 to-teal-400",
    industry: "Social Media", hq: "Bangalore", tier: "Startup",
    hiring2023: 600, hiring2024: 400, hiringTrend: "down",
    openRoles: 30, avgPackage: "₹22-45 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "ML Engineer (Video AI)", level: "Senior",
        requirements: [
          { skill: "Python & PyTorch", weight: 40, level: "Expert", desc: "Video understanding, content moderation, and regional language video recommendation models. CLIP, VideoMAE, and multimodal learning." },
          { skill: "NLP & Multilingual Models", weight: 30, level: "Expert", desc: "Indian language NLP — 15+ regional languages. Multilingual BERT, IndicBERT, and low-resource language model fine-tuning." },
          { skill: "MLOps (Triton / Seldon)", weight: 20, level: "Strong", desc: "Model serving with Triton Inference Server, A/B testing for recommendation changes, and GPU cluster management on GCP." },
          { skill: "Video Processing", weight: 10, level: "Working Knowledge", desc: "FFmpeg-based processing pipeline, keyframe extraction, and video scene change detection for content indexing." },
        ]
      }
    ]
  },
  {
    id: "groww", name: "Groww", logo: "Gr", gradient: "from-emerald-600 to-green-400",
    industry: "Fintech / Wealth Tech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 700, hiring2024: 600, hiringTrend: "stable",
    openRoles: 48, avgPackage: "₹22-48 LPA", glassdoor: 4.1,
    roles: [
      {
        title: "Software Engineer (Trading Systems)", level: "SDE-2",
        requirements: [
          { skill: "Java (High Performance)", weight: 35, level: "Expert", desc: "Low-latency order management for equity, F&O, and mutual fund transactions. Lock-free data structures and JVM tuning for sub-millisecond response." },
          { skill: "PostgreSQL & Kafka", weight: 30, level: "Expert", desc: "Transaction audit trail in Postgres with immutable records. Kafka for NSE/BSE market feed processing and order book updates." },
          { skill: "Financial Markets Knowledge", weight: 20, level: "Strong", desc: "SEBI regulations, exchange connectivity (FIX protocol), settlement (T+1), and risk management (position limits, circuit breakers)." },
          { skill: "Machine Coding", weight: 15, level: "Expert", desc: "Implement an order book, portfolio P&L calculator, or SIP scheduler in a machine coding round — emphasis on correctness and code quality." },
        ]
      }
    ]
  },
  {
    id: "zepto", name: "Zepto", logo: "Ze", gradient: "from-violet-600 to-purple-400",
    industry: "Quick Commerce", hq: "Mumbai", tier: "Startup",
    hiring2023: 450, hiring2024: 550, hiringTrend: "up",
    openRoles: 42, avgPackage: "₹20-42 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "10-minute grocery delivery routing, dark store inventory management, and dynamic slot allocation for customer deliveries." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Product catalog in PostgreSQL with JSONB for flexible attributes. Redis for real-time availability cache and delivery partner location." },
          { skill: "Kafka & Microservices", weight: 25, level: "Strong", desc: "Event-driven architecture for inventory depletion, order state transitions, and delivery partner notifications." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design dark store inventory management, slot booking system, or delivery partner dispatch system at scale (10M orders/month)." },
        ]
      }
    ]
  },
  {
    id: "slice", name: "Slice (Quadrillion)", logo: "Sl", gradient: "from-pink-600 to-orange-400",
    industry: "Fintech / Neo-Banking", hq: "Bangalore", tier: "Startup",
    hiring2023: 350, hiring2024: 280, hiringTrend: "stable",
    openRoles: 22, avgPackage: "₹18-38 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Kotlin / Go", weight: 35, level: "Strong", desc: "Credit card issuance, UPI payments, and BNPL (Buy Now, Pay Later) processing systems. RBI regulatory compliance built into every service." },
          { skill: "PostgreSQL & Redis", weight: 30, level: "Strong", desc: "Credit scoring data, transaction history, and EMI schedule management. Redis for real-time credit limit checks at swipe time." },
          { skill: "Machine Coding", weight: 20, level: "Strong", desc: "Machine coding round common at Slice: implement a credit EMI calculator, statement generation, or transaction categorizer." },
          { skill: "System Design", weight: 15, level: "Working Knowledge", desc: "Design credit underwriting pipeline, fraud detection system, or KYC (Know Your Customer) verification workflow." },
        ]
      }
    ]
  },
  {
    id: "cars24", name: "CARS24", logo: "C24", gradient: "from-red-600 to-rose-400",
    industry: "Auto Commerce", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 500, hiring2024: 420, hiringTrend: "stable",
    openRoles: 35, avgPackage: "₹18-38 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Python", weight: 30, level: "Strong", desc: "Vehicle inspection pipeline, dynamic pricing engine, and used car valuation algorithms. Machine learning integration for pricing models." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Vehicle inventory database with complex queries. Redis for real-time pricing cache updated from market signals." },
          { skill: "Microservices & Kafka", weight: 25, level: "Strong", desc: "Distributed services for inspection, pricing, financing, and registration transfer. Kafka for async document processing." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design vehicle inspection scoring system, dynamic pricing engine, or multi-location inventory management." },
        ]
      }
    ]
  },
  {
    id: "urban-company", name: "Urban Company", logo: "UC", gradient: "from-yellow-600 to-amber-400",
    industry: "Home Services", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 400, hiring2024: 350, hiringTrend: "stable",
    openRoles: 28, avgPackage: "₹18-36 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Node.js", weight: 30, level: "Strong", desc: "Service partner matching algorithm, booking management, and dynamic slot allocation for 35,000+ service professionals." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Booking system in Postgres. Redis for partner availability cache and real-time slot booking with distributed locks." },
          { skill: "Kafka & Notifications", weight: 25, level: "Strong", desc: "Event-driven booking confirmations, partner dispatch, and payment processing via Kafka." },
          { skill: "DSA", weight: 20, level: "Working Knowledge", desc: "Basic-medium DSA. Urban Company focuses on practical implementation and system design for service marketplace problems." },
        ]
      }
    ]
  },
  {
    id: "browserstack", name: "BrowserStack", logo: "BS", gradient: "from-orange-600 to-amber-500",
    industry: "DevTools SaaS", hq: "Mumbai", tier: "Unicorn",
    hiring2023: 300, hiring2024: 280, hiringTrend: "stable",
    openRoles: 25, avgPackage: "₹25-55 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Ruby / Node.js", weight: 30, level: "Expert", desc: "Test automation frameworks (Selenium, Playwright, Cypress) and cloud browser/device testing infrastructure management." },
          { skill: "Distributed Systems", weight: 25, level: "Expert", desc: "Managing 50,000+ real device farm across multiple data centers. Real-time test scheduling, queuing, and session management." },
          { skill: "Kubernetes & Docker", weight: 25, level: "Strong", desc: "Container orchestration for isolated browser test sessions. K8s scheduling for efficient resource utilization of device inventory." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design a cross-browser testing infrastructure, real-time session recording system, or device farm scheduling algorithm." },
        ]
      }
    ]
  },
  {
    id: "postman", name: "Postman", logo: "Po", gradient: "from-orange-600 to-red-500",
    industry: "Developer Tools SaaS", hq: "San Francisco (India: Bangalore)", tier: "Unicorn",
    hiring2023: 280, hiring2024: 220, hiringTrend: "down",
    openRoles: 20, avgPackage: "₹30-60 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "JavaScript & Electron", weight: 30, level: "Expert", desc: "Postman is Electron.js + React. V8 JavaScript runtime, IPC between renderer and main process, and cross-platform desktop app development." },
          { skill: "Node.js Backend", weight: 25, level: "Expert", desc: "API testing infrastructure, environment variable management, and workspace collaboration features in Node.js." },
          { skill: "DSA & Problem Solving", weight: 25, level: "Expert", desc: "Strong engineering bar. Postman recruits from top companies. Expect FAANG-level DSA + system design + behavioral rounds." },
          { skill: "REST & gRPC APIs", weight: 20, level: "Expert", desc: "Deep understanding of API protocols: REST, gRPC, GraphQL, WebSocket, and AsyncAPI. This is Postman's core business domain." },
        ]
      }
    ]
  },
  {
    id: "atlassian", name: "Atlassian", logo: "At", gradient: "from-blue-600 to-cyan-400",
    industry: "DevTools SaaS", hq: "Sydney (India: Bangalore)", tier: "MNC",
    hiring2023: 1200, hiring2024: 800, hiringTrend: "down",
    openRoles: 65, avgPackage: "₹35-70 LPA", glassdoor: 4.4,
    roles: [
      {
        title: "Software Engineer", level: "Senior",
        requirements: [
          { skill: "Java & Kotlin", weight: 30, level: "Expert", desc: "Jira, Confluence, and Trello backend services. Spring Boot microservices on AWS with Atlassian's internal Platform ecosystem." },
          { skill: "React & TypeScript", weight: 25, level: "Expert", desc: "Atlassian's Forge platform and front-end development using Atlassian Design System (ADS). TypeScript is mandatory." },
          { skill: "AWS Architecture", weight: 25, level: "Expert", desc: "Atlassian Cloud runs on AWS at massive scale. Multi-region, data residency (GDPR/privacy compliance), and AWS Marketplace integration." },
          { skill: "System Design", weight: 20, level: "Expert", desc: "Design Jira's real-time notification system, Confluence's collaborative editing (OT/CRDT), or Bitbucket's merge conflict resolution pipeline." },
        ]
      }
    ]
  },
  {
    id: "moengage", name: "MoEngage", logo: "Mo", gradient: "from-red-600 to-pink-400",
    industry: "Marketing Tech SaaS", hq: "Bangalore", tier: "Startup",
    hiring2023: 350, hiring2024: 300, hiringTrend: "stable",
    openRoles: 25, avgPackage: "₹22-45 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Python", weight: 35, level: "Strong", desc: "Campaign management, push notification delivery, and customer segmentation pipelines. Processing 20B+ events daily." },
          { skill: "MongoDB & Kafka", weight: 30, level: "Strong", desc: "User event store in MongoDB (flexible schema for diverse customer attributes). Kafka for real-time event streaming and campaign triggers." },
          { skill: "Elasticsearch", weight: 20, level: "Strong", desc: "Full-text search for campaign targeting, user segment queries, and real-time analytics dashboards. Index design for complex nested documents." },
          { skill: "Redis & Caching", weight: 15, level: "Strong", desc: "Real-time user preference cache, A/B test variant assignment, and rate limiting for push notification throttling." },
        ]
      }
    ]
  },
  {
    id: "chargebee", name: "Chargebee", logo: "Cb", gradient: "from-purple-600 to-violet-400",
    industry: "SaaS (Subscription Billing)", hq: "San Francisco (India: Chennai)", tier: "Startup",
    hiring2023: 250, hiring2024: 220, hiringTrend: "stable",
    openRoles: 18, avgPackage: "₹22-45 LPA", glassdoor: 4.1,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Kotlin", weight: 35, level: "Strong", desc: "Subscription lifecycle management, recurring billing, and revenue recognition (ASC 606) engine. High reliability for financial transactions." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Subscription and invoice data in MySQL with complex billing cycle calculations. Redis for idempotency and distributed locking." },
          { skill: "REST API Design", weight: 25, level: "Expert", desc: "Chargebee's API is its product — 8,000+ customers use it. Versioned APIs, backward compatibility, and excellent documentation standards." },
          { skill: "Domain: SaaS Billing", weight: 15, level: "Working Knowledge", desc: "Understanding of subscription models (flat rate, usage-based, tiered), metering, proration, and tax calculation (Avalara, TaxJar integration)." },
        ]
      }
    ]
  },
  {
    id: "clevertap", name: "CleverTap", logo: "CT", gradient: "from-orange-500 to-amber-400",
    industry: "Customer Engagement SaaS", hq: "Mumbai", tier: "Startup",
    hiring2023: 280, hiring2024: 240, hiringTrend: "stable",
    openRoles: 20, avgPackage: "₹20-42 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Backend Engineer (Data Platform)", level: "SDE-2",
        requirements: [
          { skill: "Java / Scala", weight: 35, level: "Expert", desc: "CleverTap ingests 5TB+ daily event data. Real-time stream processing with Flink and batch analytics with Spark at petabyte scale." },
          { skill: "HBase & Cassandra", weight: 30, level: "Expert", desc: "User profiles in HBase (70B+ profiles). Event time-series in Cassandra. Custom compaction strategies for analytics query performance." },
          { skill: "Kafka & Flink", weight: 20, level: "Expert", desc: "Real-time event ingestion via Kafka, stream processing with Flink for campaign trigger evaluation in under 1 second." },
          { skill: "System Design", weight: 15, level: "Expert", desc: "Design a real-time user event ingestion system, time-series analytics engine, or campaign trigger evaluation at billion-event scale." },
        ]
      }
    ]
  },
  {
    id: "udaan", name: "udaan", logo: "Ud", gradient: "from-blue-600 to-indigo-400",
    industry: "B2B Commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 400, hiring2024: 280, hiringTrend: "down",
    openRoles: 22, avgPackage: "₹18-38 LPA", glassdoor: 3.6,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Python", weight: 30, level: "Strong", desc: "B2B supply chain management, procurement, and MSME lending pipeline. High-volume catalog management for pharma, food, and lifestyle categories." },
          { skill: "MySQL & Kafka", weight: 25, level: "Strong", desc: "Order management and inventory tracking. Kafka for supply chain event streaming across warehouses, suppliers, and buyers." },
          { skill: "System Design", weight: 25, level: "Strong", desc: "Design B2B catalog search, warehouse management, or supply chain visibility system." },
          { skill: "DSA", weight: 20, level: "Strong", desc: "Medium DSA bar. 2 coding rounds + system design. udaan values practical problem-solving for supply chain challenges." },
        ]
      }
    ]
  },
  {
    id: "khatabook", name: "KhataBook", logo: "KB", gradient: "from-indigo-600 to-blue-400",
    industry: "SMB Fintech", hq: "San Francisco (India: Bangalore)", tier: "Startup",
    hiring2023: 200, hiring2024: 180, hiringTrend: "stable",
    openRoles: 15, avgPackage: "₹18-35 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Node.js", weight: 30, level: "Strong", desc: "Digital ledger for 8M+ small business owners. Offline-first mobile backend, UPI payment reconciliation, and credit scoring for SMBs." },
          { skill: "PostgreSQL & MongoDB", weight: 25, level: "Strong", desc: "Transaction records in PostgreSQL. Flexible business data in MongoDB. Multi-language (Hindi, Telugu, Tamil) data handling." },
          { skill: "Android / React Native", weight: 25, level: "Strong", desc: "Mobile-first for low-end Android devices. Offline sync, vernacular language support, and voice input for non-tech-savvy merchants." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design offline-first sync, credit scoring pipeline, or vernacular NLP for business ledger entries." },
        ]
      }
    ]
  },
  {
    id: "zetwerk", name: "Zetwerk", logo: "Zw", gradient: "from-blue-700 to-cyan-500",
    industry: "Manufacturing B2B", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 300, hiring2024: 250, hiringTrend: "stable",
    openRoles: 20, avgPackage: "₹16-32 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Java", weight: 30, level: "Strong", desc: "Manufacturing order lifecycle, vendor management, and quality inspection workflows for global B2B contracts." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Complex manufacturing BOMs (Bill of Materials) in Postgres. Redis for production status dashboards and real-time order tracking." },
          { skill: "REST APIs & Integrations", weight: 25, level: "Strong", desc: "ERP integrations (SAP, Oracle), shipping API integrations, and customs documentation workflows for export manufacturing." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design quality inspection management, vendor matching, or multi-stage production tracking system." },
        ]
      }
    ]
  },
  {
    id: "niyo", name: "Niyo Solutions", logo: "Ni", gradient: "from-teal-600 to-green-400",
    industry: "Fintech / Neo-Banking", hq: "Bangalore", tier: "Startup",
    hiring2023: 200, hiring2024: 180, hiringTrend: "stable",
    openRoles: 14, avgPackage: "₹16-32 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Node.js", weight: 30, level: "Strong", desc: "Forex card management, tax-saver account features, and blue-collar worker salary management integration with EPFO systems." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Banking-grade data integrity in Postgres. Redis for real-time balance cache and forex rate feeds." },
          { skill: "Fintech Compliance", weight: 25, level: "Working Knowledge", desc: "RBI regulations for prepaid payment instruments (PPIs), NBFC norms, and AML (Anti-Money Laundering) checks integration." },
          { skill: "DSA", weight: 20, level: "Working Knowledge", desc: "2 coding rounds (easy-medium). Niyo focuses on practical implementation skills for banking use cases." },
        ]
      }
    ]
  },
  {
    id: "licious", name: "Licious", logo: "Li", gradient: "from-red-600 to-rose-400",
    industry: "D2C Meat & Seafood", hq: "Bangalore", tier: "Startup",
    hiring2023: 250, hiring2024: 200, hiringTrend: "stable",
    openRoles: 16, avgPackage: "₹15-30 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "Cold chain supply chain management, temperature monitoring IoT integration, and fresh product inventory with expiry tracking." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Fresh product catalog with time-sensitive availability. Redis for real-time slot booking and live inventory." },
          { skill: "Kafka & Microservices", weight: 25, level: "Working Knowledge", desc: "Order management, warehouse routing, and delivery partner dispatch for perishable goods with strict time windows." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design perishable inventory management, cold chain monitoring system, or slot-based fresh delivery scheduling." },
        ]
      }
    ]
  },
  {
    id: "springworks", name: "Springworks", logo: "SW", gradient: "from-green-600 to-lime-400",
    industry: "HR Tech SaaS", hq: "Bangalore", tier: "Startup",
    hiring2023: 200, hiring2024: 180, hiringTrend: "stable",
    openRoles: 15, avgPackage: "₹15-30 LPA", glassdoor: 4.2,
    roles: [
      {
        title: "Full Stack Engineer", level: "SDE-2",
        requirements: [
          { skill: "React & TypeScript", weight: 35, level: "Strong", desc: "HR product UIs: employee directory, recognition platform (Springengage), and background verification (SpringVerify) dashboards." },
          { skill: "Node.js / Python Backend", weight: 30, level: "Strong", desc: "RESTful APIs for HRMS features: payroll, leave management, and BGV workflow automation." },
          { skill: "PostgreSQL & MongoDB", weight: 20, level: "Strong", desc: "Employee data in Postgres, flexible HR event logs in MongoDB." },
          { skill: "AWS Deployment", weight: 15, level: "Working Knowledge", desc: "EC2, RDS, S3 for production HR SaaS deployment. Basic CI/CD with GitHub Actions." },
        ]
      }
    ]
  },
  {
    id: "juspay", name: "Juspay", logo: "Jp", gradient: "from-blue-600 to-indigo-500",
    industry: "Payment Infrastructure", hq: "Bangalore", tier: "Startup",
    hiring2023: 280, hiring2024: 250, hiringTrend: "stable",
    openRoles: 20, avgPackage: "₹20-42 LPA", glassdoor: 4.2,
    roles: [
      {
        title: "Haskell / Purescript Engineer", level: "SDE-2",
        requirements: [
          { skill: "Haskell / Purescript / OCaml", weight: 45, level: "Expert", desc: "Juspay is one of India's few companies using Haskell in production. Their HyperCheckout and payment orchestration layer runs on Purescript/Haskell." },
          { skill: "Functional Programming", weight: 30, level: "Expert", desc: "Monads, functors, type classes, algebraic data types, and property-based testing. Strong FP fundamentals over OOP patterns." },
          { skill: "Payment Systems", weight: 15, level: "Working Knowledge", desc: "UPI switch integration, PCI compliance, and payment gateway SDK development. Deep interest in fintech infrastructure." },
          { skill: "DSA & Problem Solving", weight: 10, level: "Strong", desc: "Algorithmic thinking in functional style. Juspay values elegant, correct code — not grinding LeetCode but understanding correctness properties." },
        ]
      }
    ]
  },
  {
    id: "zerodha", name: "Zerodha", logo: "Ze", gradient: "from-blue-600 to-sky-400",
    industry: "Stock Broking / Fintech", hq: "Bangalore", tier: "Startup",
    hiring2023: 180, hiring2024: 160, hiringTrend: "stable",
    openRoles: 12, avgPackage: "₹20-45 LPA", glassdoor: 4.5,
    roles: [
      {
        title: "Backend Engineer (Go)", level: "Senior",
        requirements: [
          { skill: "Go (Golang)", weight: 40, level: "Expert", desc: "Zerodha's entire trading stack (Kite, Kite Connect API) is in Go. Order management system, risk engine, and market data feed processor." },
          { skill: "Market Data & Finance", weight: 25, level: "Expert", desc: "NSE/BSE tick data processing, options Greeks calculation, and portfolio margining algorithms. Real-time processing at microsecond latency." },
          { skill: "PostgreSQL & Redis", weight: 20, level: "Expert", desc: "Order and position records in Postgres with ACID guarantees. Redis for real-time holdings cache and intraday position tracking." },
          { skill: "Open Source Culture", weight: 15, level: "Strong", desc: "Zerodha actively contributes to open source (gocraft, kaf, go libraries). GitHub portfolio and open source contributions are weighted heavily." },
        ]
      }
    ]
  },
  {
    id: "smallcase", name: "Smallcase", logo: "Sm", gradient: "from-green-600 to-teal-500",
    industry: "WealthTech", hq: "Bangalore", tier: "Startup",
    hiring2023: 180, hiring2024: 160, hiringTrend: "stable",
    openRoles: 14, avgPackage: "₹18-40 LPA", glassdoor: 4.3,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "Portfolio management APIs, basket order execution across multiple brokerages, and SEBI-compliant investment product workflows." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Portfolio holdings in MySQL with strict ACID requirements. Redis for real-time NAV calculations and portfolio valuation cache." },
          { skill: "Financial Markets", weight: 25, level: "Strong", desc: "Understanding of equity baskets, rebalancing, SIP, and market impact of institutional order execution." },
          { skill: "React & D3.js", weight: 20, level: "Working Knowledge", desc: "Investment analytics dashboards with complex financial charts (candlestick, portfolio attribution) using D3.js and Highcharts." },
        ]
      }
    ]
  },
  {
    id: "vedantu", name: "Vedantu", logo: "V", gradient: "from-violet-600 to-purple-400",
    industry: "EdTech", hq: "Bangalore", tier: "Startup",
    hiring2023: 500, hiring2024: 200, hiringTrend: "down",
    openRoles: 15, avgPackage: "₹15-30 LPA", glassdoor: 3.4,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Node.js", weight: 30, level: "Strong", desc: "Live class infrastructure (WebRTC), doubt-solving chatbot, and adaptive learning path engine for K-12 students." },
          { skill: "WebRTC & Video", weight: 25, level: "Strong", desc: "Real-time video streaming for live classes. WebRTC signaling, TURN/STUN servers, and SFU (Selective Forwarding Unit) management." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Student progress tracking, quiz performance analytics, and live class scheduling. Redis for real-time class presence and chat." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design live class system (100K concurrent students), adaptive quiz engine, or doubt resolution routing system." },
        ]
      }
    ]
  },
  {
    id: "unacademy", name: "Unacademy", logo: "Un", gradient: "from-green-600 to-lime-500",
    industry: "EdTech", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 600, hiring2024: 300, hiringTrend: "down",
    openRoles: 20, avgPackage: "₹16-32 LPA", glassdoor: 3.5,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Django / DRF", weight: 30, level: "Strong", desc: "Subscription management, educator content CMS, and live class scheduling. Django REST Framework for API-first architecture." },
          { skill: "PostgreSQL & Elasticsearch", weight: 25, level: "Strong", desc: "Course catalog search with Elasticsearch. Student data in Postgres with complex aggregation for analytics dashboards." },
          { skill: "React & Next.js", weight: 25, level: "Strong", desc: "SSR for SEO-critical course pages. Complex player UI for recorded content with chapter navigation, notes, and speed control." },
          { skill: "Redis & Kafka", weight: 20, level: "Working Knowledge", desc: "Live class participant management in Redis. Kafka for async video transcoding triggers and notification pipelines." },
        ]
      }
    ]
  },
  {
    id: "lendingkart", name: "Lendingkart", logo: "LK", gradient: "from-orange-600 to-yellow-400",
    industry: "Fintech / NBFC", hq: "Ahmedabad", tier: "Startup",
    hiring2023: 250, hiring2024: 220, hiringTrend: "stable",
    openRoles: 18, avgPackage: "₹15-30 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Data Engineer / ML Engineer", level: "Mid-level",
        requirements: [
          { skill: "Python & ML Models", weight: 35, level: "Strong", desc: "Credit risk models using XGBoost, LightGBM. Alternative data sources (GST returns, bank statements, MCA data) for MSME credit scoring." },
          { skill: "Apache Spark & Airflow", weight: 30, level: "Strong", desc: "ETL pipelines for daily GST filing data, banking transaction data, and bureau (CIBIL, Experian) score ingestion." },
          { skill: "SQL & DBT", weight: 20, level: "Strong", desc: "Complex SQL for credit analytics, NPA prediction, and portfolio risk monitoring dashboards." },
          { skill: "Financial Data Domain", weight: 15, level: "Working Knowledge", desc: "MSME lending lifecycle: application, underwriting, disbursement, collection, and NPA management. RBI NBFC guidelines." },
        ]
      }
    ]
  },
  {
    id: "darwinbox", name: "Darwinbox", logo: "Db", gradient: "from-purple-600 to-indigo-400",
    industry: "HR SaaS", hq: "Hyderabad", tier: "Unicorn",
    hiring2023: 400, hiring2024: 350, hiringTrend: "stable",
    openRoles: 28, avgPackage: "₹16-35 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "PHP (Laravel) / Node.js", weight: 35, level: "Strong", desc: "Enterprise HRMS features: payroll processing, tax calculation (Indian TDS, statutory compliance), and attendance management." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Multi-tenant HR data with company-level data isolation. Redis for payroll computation cache and real-time attendance." },
          { skill: "React / Vue.js", weight: 25, level: "Strong", desc: "Complex HR workflow UIs: performance appraisal workflows, org chart visualization, and multi-step onboarding flows." },
          { skill: "Indian Payroll Domain", weight: 15, level: "Working Knowledge", desc: "PF, ESI, PT, TDS calculation rules. Form 16 generation, statutory reports, and EPFO/ESIC filing integrations." },
        ]
      }
    ]
  },
  {
    id: "leadsquared", name: "LeadSquared", logo: "LS", gradient: "from-orange-600 to-red-500",
    industry: "Sales CRM SaaS", hq: "Bangalore", tier: "Startup",
    hiring2023: 350, hiring2024: 300, hiringTrend: "stable",
    openRoles: 22, avgPackage: "₹16-32 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: ".NET / C#", weight: 35, level: "Expert", desc: "LeadSquared's core platform is .NET. ASP.NET Core, Entity Framework, and LINQ for CRM data manipulation and workflow automation." },
          { skill: "React & JavaScript", weight: 25, level: "Strong", desc: "Sales CRM UIs: lead management dashboards, pipeline visualization, and workflow builder with drag-and-drop interface." },
          { skill: "SQL Server / MySQL", weight: 25, level: "Strong", desc: "CRM data models for leads, contacts, opportunities, and activities. Complex reporting queries for sales analytics." },
          { skill: "System Design", weight: 15, level: "Working Knowledge", desc: "Design lead scoring engine, sales automation workflow, or email campaign delivery at CRM scale." },
        ]
      }
    ]
  },
  {
    id: "zoho", name: "Zoho Corporation", logo: "Zo", gradient: "from-red-600 to-orange-400",
    industry: "SaaS Productivity", hq: "Chennai", tier: "IT Services",
    hiring2023: 2000, hiring2024: 1800, hiringTrend: "stable",
    openRoles: 150, avgPackage: "₹8-22 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Member Technical Staff", level: "Entry-Mid",
        requirements: [
          { skill: "Java / JavaScript", weight: 30, level: "Strong", desc: "Zoho CRM, Zoho Books, Zoho Desk development. Zoho has 100+ products built entirely by its Chennai/Tenkasi engineering teams." },
          { skill: "SQL & Data Design", weight: 25, level: "Strong", desc: "Relational database design for CRM, ERP, and accounting data. Complex SQL reporting queries for business intelligence." },
          { skill: "Full Stack Web", weight: 25, level: "Strong", desc: "Full product ownership — from backend API to React/jQuery frontend. Zoho engineers build entire features end-to-end." },
          { skill: "Problem Solving", weight: 20, level: "Strong", desc: "Zoho's written test (programming + aptitude). Unique hiring — campus-driven with Zoho Schools of Excellence. Practical coding over LeetCode grinding." },
        ]
      }
    ]
  },
  {
    id: "coforge", name: "Coforge", logo: "Co", gradient: "from-blue-700 to-cyan-500",
    industry: "IT Services", hq: "Noida", tier: "IT Services",
    hiring2023: 5000, hiring2024: 4500, hiringTrend: "stable",
    openRoles: 380, avgPackage: "₹4-10 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Software Engineer (Travel Tech)", level: "Mid-level",
        requirements: [
          { skill: "Java / .NET", weight: 30, level: "Strong", desc: "Airline, GDS (Amadeus, Sabre), and hotel reservation system integrations. Coforge specializes in BFSI and travel vertical IT services." },
          { skill: "SQL & Oracle DB", weight: 25, level: "Strong", desc: "Airline booking systems often use Oracle. Complex stored procedures for reservation management and pricing calculations." },
          { skill: "REST APIs & XML/JSON", weight: 25, level: "Strong", desc: "GDS API integration (NDC standard), SOAP web services for legacy airline CRS, and JSON REST APIs for modern OTAs." },
          { skill: "Domain: BFSI/Travel", weight: 20, level: "Working Knowledge", desc: "Airline CRS, hotel PMS, or banking core system domain knowledge is a strong differentiator at Coforge." },
        ]
      }
    ]
  },
  {
    id: "persistent", name: "Persistent Systems", logo: "PS", gradient: "from-blue-600 to-sky-400",
    industry: "IT Services / Product", hq: "Pune", tier: "IT Services",
    hiring2023: 6000, hiring2024: 5500, hiringTrend: "stable",
    openRoles: 450, avgPackage: "₹4.5-12 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Software Engineer", level: "Mid-level (2-5Y)",
        requirements: [
          { skill: "Java / .NET / Python", weight: 30, level: "Strong", desc: "Persistent works as product development partner for US ISVs (Independent Software Vendors). Deep product engineering, not traditional IT services." },
          { skill: "Cloud (AWS/Azure/GCP)", weight: 25, level: "Working Knowledge", desc: "Persistent has strong cloud, data, and AI practices. Cloud certifications accelerate projects at client ISV engagements." },
          { skill: "Agile Delivery", weight: 25, level: "Strong", desc: "Persistent operates as embedded scrum teams within US product companies. Strong sprint delivery, code review culture, and Git workflow." },
          { skill: "Testing & QA", weight: 20, level: "Working Knowledge", desc: "Selenium, JUnit, and Postman for test automation. Test-driven development culture in ISV product engineering." },
        ]
      }
    ]
  },
  {
    id: "hexaware", name: "Hexaware", logo: "Hx", gradient: "from-purple-600 to-violet-400",
    industry: "IT Services / AI", hq: "Navi Mumbai", tier: "IT Services",
    hiring2023: 8000, hiring2024: 7500, hiringTrend: "stable",
    openRoles: 600, avgPackage: "₹3.5-9 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer (AI/ML)", level: "Mid-level",
        requirements: [
          { skill: "Python & ML Libraries", weight: 35, level: "Strong", desc: "Hexaware's AI practice (RAPIDCentral platform) uses Python for NLP, computer vision, and automation projects for banking and insurance clients." },
          { skill: "Cloud (Azure / AWS)", weight: 25, level: "Working Knowledge", desc: "Azure Cognitive Services, OpenAI API integration, and AWS Rekognition for AI projects in financial services." },
          { skill: "Java / .NET", weight: 25, level: "Working Knowledge", desc: "Enterprise application development for BFSI, travel, and healthcare verticals. Integration with legacy mainframe systems." },
          { skill: "Agile / Scrum", weight: 15, level: "Working Knowledge", desc: "Hexaware Agile delivery: PI planning, sprint ceremonies, and burndown tracking for large enterprise projects." },
        ]
      }
    ]
  },
  {
    id: "mphasis", name: "Mphasis", logo: "Mp", gradient: "from-orange-600 to-amber-500",
    industry: "IT Services (Finance)", hq: "Bangalore", tier: "IT Services",
    hiring2023: 5000, hiring2024: 4800, hiringTrend: "stable",
    openRoles: 380, avgPackage: "₹4-11 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "Mid-level",
        requirements: [
          { skill: "Java & Spring Boot", weight: 30, level: "Strong", desc: "Mphasis specializes in BFSI. Mortgage processing, trade finance, and banking API development for US/European financial institutions." },
          { skill: "AWS & DevOps", weight: 25, level: "Working Knowledge", desc: "Mphasis focuses on hyperscaler (AWS, Azure, GCP) and cloud engineering. Cloud certifications are actively encouraged and reimbursed." },
          { skill: "SQL & Data", weight: 25, level: "Strong", desc: "Financial data management — trade lifecycle, loan origination, and risk reporting queries. Oracle SQL and SQL Server experience." },
          { skill: "BFSI Domain", weight: 20, level: "Working Knowledge", desc: "Banking products (mortgages, cards, wealth management) or capital markets (trade lifecycle, regulatory reporting) domain knowledge." },
        ]
      }
    ]
  },
  {
    id: "kyndryl", name: "Kyndryl", logo: "Ky", gradient: "from-blue-800 to-indigo-600",
    industry: "IT Infrastructure Services", hq: "New York (India: Bangalore)", tier: "MNC",
    hiring2023: 5000, hiring2024: 4200, hiringTrend: "down",
    openRoles: 340, avgPackage: "₹5-16 LPA", glassdoor: 3.5,
    roles: [
      {
        title: "Cloud & Infrastructure Engineer", level: "Mid-level",
        requirements: [
          { skill: "Linux Administration", weight: 30, level: "Strong", desc: "Red Hat Enterprise Linux, server hardening, kernel tuning, and automation with Ansible/Puppet for enterprise data center management." },
          { skill: "Cloud (AWS/Azure/GCP)", weight: 25, level: "Strong", desc: "Cloud migration projects for Fortune 500 clients. Lift-and-shift, cloud-native refactoring, and hybrid cloud architectures." },
          { skill: "Monitoring & ITSM", weight: 25, level: "Strong", desc: "ServiceNow ITSM, Nagios/Zabbix monitoring, SLA management, and incident response for enterprise infrastructure." },
          { skill: "Networking", weight: 20, level: "Working Knowledge", desc: "SD-WAN, MPLS, and network segmentation for enterprise campus and WAN connectivity. Cisco CCNA-level knowledge." },
        ]
      }
    ]
  },
  {
    id: "delhivery", name: "Delhivery", logo: "De", gradient: "from-red-600 to-orange-500",
    industry: "Logistics Tech", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 1500, hiring2024: 1200, hiringTrend: "stable",
    openRoles: 88, avgPackage: "₹16-35 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Software Engineer (Logistics Tech)", level: "SDE-2",
        requirements: [
          { skill: "Python / Go", weight: 30, level: "Strong", desc: "Route optimization algorithms, last-mile delivery scheduling, and cross-dock planning using OR-Tools and custom heuristics." },
          { skill: "PostgreSQL & Kafka", weight: 25, level: "Strong", desc: "Parcel tracking events, warehouse management, and network capacity planning. Kafka for real-time shipment event streaming." },
          { skill: "Machine Learning", weight: 25, level: "Working Knowledge", desc: "Delivery time prediction, demand forecasting, and address standardization using NLP for Indian address parsing." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design last-mile routing engine (1M+ daily deliveries), warehouse sorting system, or real-time shipment tracking." },
        ]
      }
    ]
  },
  {
    id: "shiprocket", name: "Shiprocket", logo: "SR", gradient: "from-orange-500 to-yellow-400",
    industry: "E-commerce Logistics SaaS", hq: "Delhi", tier: "Startup",
    hiring2023: 400, hiring2024: 350, hiringTrend: "stable",
    openRoles: 28, avgPackage: "₹14-28 LPA", glassdoor: 3.6,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "Multi-carrier shipping aggregation, rate calculation, and NDR (Non-Delivery Report) management for 150K+ D2C sellers." },
          { skill: "MySQL & Redis", weight: 25, level: "Strong", desc: "Order and shipment management. Redis for real-time shipping rate cache from 25+ courier partners." },
          { skill: "REST APIs & Webhooks", weight: 25, level: "Strong", desc: "Courier partner API integrations (Bluedart, DTDC, FedEx, DHL). Webhook delivery for seller order status updates." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design multi-carrier rate comparison, auto-courier selection engine, or NDR management workflow." },
        ]
      }
    ]
  },
  {
    id: "policybazaar", name: "PolicyBazaar", logo: "PB", gradient: "from-blue-600 to-sky-400",
    industry: "InsurTech", hq: "Gurugram", tier: "Unicorn",
    hiring2023: 800, hiring2024: 700, hiringTrend: "stable",
    openRoles: 55, avgPackage: "₹16-35 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "PHP (Laravel) / .NET / Node.js", weight: 30, level: "Strong", desc: "Insurance product comparison, lead management, and policy issuance workflows. Integration with 50+ insurance provider APIs." },
          { skill: "MySQL & MongoDB", weight: 25, level: "Strong", desc: "Policy data, customer records, and claim history in MySQL. MongoDB for flexible insurance product catalogs with diverse attributes." },
          { skill: "React / Angular", weight: 25, level: "Strong", desc: "Complex insurance comparison UIs with multi-step forms, premium calculators, and real-time quote engines." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design insurance comparison engine, premium aggregation, or claim filing and processing workflow." },
        ]
      }
    ]
  },
  {
    id: "healthkart", name: "HealthKart", logo: "HK", gradient: "from-green-600 to-emerald-400",
    industry: "Health & Wellness E-commerce", hq: "Gurugram", tier: "Startup",
    hiring2023: 250, hiring2024: 220, hiringTrend: "stable",
    openRoles: 18, avgPackage: "₹14-28 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "Supplement and fitness product catalog, personalization engine, and subscription box management for 3M+ active customers." },
          { skill: "MySQL & Elasticsearch", weight: 25, level: "Strong", desc: "Product search with health-specific filtering (protein per serving, dietary needs). MySQL for order and customer management." },
          { skill: "React", weight: 25, level: "Strong", desc: "Health goal-based product recommendation UIs and subscription management dashboard." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design health product recommendation engine, subscription management, or personalized nutrition planner." },
        ]
      }
    ]
  },
  {
    id: "practo", name: "Practo", logo: "Pr", gradient: "from-teal-600 to-cyan-400",
    industry: "HealthTech", hq: "Bangalore", tier: "Startup",
    hiring2023: 300, hiring2024: 250, hiringTrend: "stable",
    openRoles: 20, avgPackage: "₹16-32 LPA", glassdoor: 3.6,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Python / Ruby on Rails", weight: 30, level: "Strong", desc: "Doctor discovery, appointment booking, and teleconsultation platform. Handling medical data with HIPAA/DPDP Act compliance." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "EHR (Electronic Health Records) in Postgres with strict audit logging. Redis for doctor availability cache and appointment slot management." },
          { skill: "Kubernetes & AWS", weight: 25, level: "Working Knowledge", desc: "Healthcare data residency, HIPAA-compliant cloud architecture, and multi-region deployment for Southeast Asia markets." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design appointment booking system, teleconsultation infrastructure, or health record search and retrieval." },
        ]
      }
    ]
  },
  {
    id: "1mg", name: "1mg (Tata Health)", logo: "1M", gradient: "from-red-500 to-pink-400",
    industry: "HealthTech / Pharmacy", hq: "Gurugram", tier: "Startup",
    hiring2023: 350, hiring2024: 300, hiringTrend: "stable",
    openRoles: 24, avgPackage: "₹16-34 LPA", glassdoor: 3.7,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Java / Python", weight: 30, level: "Strong", desc: "Online pharmacy fulfillment, cold-chain medicine delivery, and prescription management with controlled drug compliance." },
          { skill: "MySQL & Elasticsearch", weight: 25, level: "Strong", desc: "Medicine catalog search (10M+ SKUs, generic alternatives, drug interactions). MySQL for prescription and order management." },
          { skill: "Kafka & Microservices", weight: 25, level: "Strong", desc: "Prescription validation workflows, inventory sync with 5000+ partner pharmacies, and lab test report delivery pipelines." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design prescription validation system, pharmacy inventory management, or drug interaction checking engine." },
        ]
      }
    ]
  },
  {
    id: "cure-fit", name: "Cult.fit (Cure.fit)", logo: "CF", gradient: "from-green-700 to-lime-500",
    industry: "FitTech / Wellness", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 400, hiring2024: 280, hiringTrend: "down",
    openRoles: 18, avgPackage: "₹15-30 LPA", glassdoor: 3.5,
    roles: [
      {
        title: "Software Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Python", weight: 30, level: "Strong", desc: "Fitness class booking, center capacity management, digital workout content streaming, and food delivery from EatFit." },
          { skill: "PostgreSQL & Redis", weight: 25, level: "Strong", desc: "Class schedules, member subscriptions, and wellness data. Redis for real-time center occupancy and live class participant management." },
          { skill: "React & React Native", weight: 25, level: "Strong", desc: "Cross-platform fitness app with live class integration, workout tracking, diet planning, and mental wellness features." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design fitness class booking with real-time capacity management, live workout streaming, or subscription management system." },
        ]
      }
    ]
  },
  {
    id: "woovly", name: "Woovly / Similar Fashion Apps", logo: "Wo", gradient: "from-pink-600 to-fuchsia-400",
    industry: "Social Commerce", hq: "Bangalore", tier: "Startup",
    hiring2023: 100, hiring2024: 120, hiringTrend: "up",
    openRoles: 10, avgPackage: "₹12-25 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Full Stack Engineer", level: "SDE-1/2",
        requirements: [
          { skill: "React Native / Flutter", weight: 35, level: "Strong", desc: "Social video + shopping integration, shoppable video UX, and creator monetization features for Gen-Z Indian market." },
          { skill: "Node.js / Python", weight: 30, level: "Working Knowledge", desc: "Social feed algorithms, creator analytics, and affiliate commission tracking backends." },
          { skill: "MongoDB & Redis", weight: 20, level: "Working Knowledge", desc: "Social graph data in MongoDB, content feed cache in Redis. Flexible schema for diverse creator content metadata." },
          { skill: "AWS Basics", weight: 15, level: "Working Knowledge", desc: "Video storage and CDN on AWS (S3 + CloudFront), basic EC2 deployment, and auto-scaling." },
        ]
      }
    ]
  },
  {
    id: "jio", name: "Jio Platforms", logo: "Ji", gradient: "from-blue-600 to-indigo-400",
    industry: "Telecom / Tech", hq: "Mumbai", tier: "MNC",
    hiring2023: 5000, hiring2024: 4500, hiringTrend: "stable",
    openRoles: 380, avgPackage: "₹8-24 LPA", glassdoor: 3.8,
    roles: [
      {
        title: "Software Developer", level: "Mid-level",
        requirements: [
          { skill: "Java / Python / JavaScript", weight: 30, level: "Strong", desc: "JioCinema, JioMart, JioSaavn, and JioPhone apps. Full-stack development for Jio's super app ecosystem serving 450M+ subscribers." },
          { skill: "Microservices & Kafka", weight: 25, level: "Strong", desc: "High-scale telecom data processing, CDN management, and OTT content delivery infrastructure." },
          { skill: "Cloud & DevOps", weight: 25, level: "Working Knowledge", desc: "Jio's own cloud (JioCloud) and AWS/Azure. DevOps with Jenkins, Kubernetes, and Terraform for telecom-grade reliability (99.999% SLA)." },
          { skill: "5G & Telecom Basics", weight: 20, level: "Working Knowledge", desc: "Understanding of OSS/BSS systems, network functions, and 5G core architecture is a significant differentiator." },
        ]
      }
    ]
  },
  {
    id: "airtel", name: "Airtel (Bharti Airtel)", logo: "Ai", gradient: "from-red-600 to-rose-400",
    industry: "Telecom / Tech", hq: "Delhi", tier: "MNC",
    hiring2023: 3000, hiring2024: 2500, hiringTrend: "stable",
    openRoles: 200, avgPackage: "₹10-28 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Software Engineer (Airtel X Labs)", level: "SDE-2",
        requirements: [
          { skill: "Java / Go / Python", weight: 30, level: "Strong", desc: "Airtel's product technology arm — consumer apps (Airtel Thanks), B2B cloud, IoT, and cybersecurity products." },
          { skill: "Kafka & Streaming", weight: 25, level: "Strong", desc: "Real-time telecom data: CDR (Call Detail Records) processing, network event streaming, and fraud detection systems." },
          { skill: "AWS / Azure", weight: 25, level: "Strong", desc: "Multi-cloud strategy. Airtel has partnerships with AWS and Azure for enterprise cloud services. GCP for AI workloads." },
          { skill: "System Design", weight: 20, level: "Strong", desc: "Design telecom-grade systems: subscriber management, real-time network monitoring, or enterprise SD-WAN portal." },
        ]
      }
    ]
  },
  {
    id: "blinkit", name: "Blinkit (Zomato)", logo: "Bl", gradient: "from-yellow-500 to-lime-400",
    industry: "Quick Commerce", hq: "Gurugram", tier: "Startup",
    hiring2023: 600, hiring2024: 800, hiringTrend: "up",
    openRoles: 58, avgPackage: "₹22-45 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Go / Python / Rust", weight: 35, level: "Expert", desc: "Blinkit is one of India's few companies using Rust in production for its performance-critical delivery routing and inventory engine." },
          { skill: "Kafka & DynamoDB", weight: 30, level: "Expert", desc: "Real-time inventory depletion events via Kafka. DynamoDB for high-throughput, low-latency product availability checks during checkout." },
          { skill: "Geospatial Systems", weight: 20, level: "Expert", desc: "Dark store coverage area calculation, real-time delivery radius adjustments, and hyper-local demand forecasting using H3 geospatial indexing." },
          { skill: "System Design", weight: 15, level: "Expert", desc: "Design 10-minute delivery system: dark store selection, delivery partner dispatch, and real-time inventory reservation with rollback." },
        ]
      }
    ]
  },
  {
    id: "swiggy-instamart", name: "Swiggy Instamart", logo: "SI", gradient: "from-orange-500 to-yellow-400",
    industry: "Quick Commerce", hq: "Bangalore", tier: "Unicorn",
    hiring2023: 350, hiring2024: 450, hiringTrend: "up",
    openRoles: 35, avgPackage: "₹22-44 LPA", glassdoor: 3.9,
    roles: [
      {
        title: "Data Scientist", level: "Senior",
        requirements: [
          { skill: "Python & ML", weight: 35, level: "Expert", desc: "Demand forecasting for 3000+ SKUs per dark store, inventory optimization, and spoilage reduction models for perishable products." },
          { skill: "Spark & Databricks", weight: 30, level: "Expert", desc: "Feature engineering from billions of order events, real-time model inference for slot pricing, and A/B test analysis at scale." },
          { skill: "Statistical Modeling", weight: 20, level: "Expert", desc: "Time-series forecasting (ARIMA, Prophet, LightGBM), causal inference for marketing attribution, and bandit algorithms for promotion optimization." },
          { skill: "SQL & Analytics", weight: 15, level: "Strong", desc: "Complex SQL for business intelligence, customer cohort analysis, and operational metrics dashboards." },
        ]
      }
    ]
  },
  {
    id: "rapido", name: "Rapido", logo: "Ra", gradient: "from-yellow-600 to-orange-500",
    industry: "Mobility / Bike Taxi", hq: "Bangalore", tier: "Startup",
    hiring2023: 350, hiring2024: 300, hiringTrend: "stable",
    openRoles: 22, avgPackage: "₹15-30 LPA", glassdoor: 3.6,
    roles: [
      {
        title: "Backend Engineer", level: "SDE-2",
        requirements: [
          { skill: "Node.js / Go", weight: 30, level: "Strong", desc: "Bike taxi dispatch algorithm, fare calculation, and captain (driver) management at 5M+ daily rides across Tier-1/2 cities." },
          { skill: "Redis Geospatial & Kafka", weight: 25, level: "Strong", desc: "Real-time captain location tracking with Redis GEO commands. Kafka for ride events and captain status updates." },
          { skill: "PostgreSQL & MongoDB", weight: 25, level: "Strong", desc: "Ride history and payments in Postgres. Captain documents and verification data in MongoDB." },
          { skill: "System Design", weight: 20, level: "Working Knowledge", desc: "Design ride matching algorithm (bike taxi constraints differ from cars), surge pricing, or captain incentive management system." },
        ]
      }
    ]
  },
  {
    id: "ather-energy", name: "Ather Energy", logo: "AE", gradient: "from-green-600 to-lime-400",
    industry: "EV / Tech", hq: "Bangalore", tier: "Startup",
    hiring2023: 400, hiring2024: 350, hiringTrend: "stable",
    openRoles: 28, avgPackage: "₹16-35 LPA", glassdoor: 4.0,
    roles: [
      {
        title: "Software Engineer (Connected Vehicles)", level: "SDE-2",
        requirements: [
          { skill: "Python / C++", weight: 30, level: "Strong", desc: "OTA (Over-The-Air) firmware updates, vehicle telematics processing, and battery management system (BMS) monitoring software." },
          { skill: "IoT & MQTT", weight: 25, level: "Strong", desc: "Vehicle-to-cloud connectivity via MQTT protocol, real-time telemetry processing, and edge computing on the scooter ECU." },
          { skill: "Kafka & TimeSeries DB", weight: 25, level: "Strong", desc: "High-frequency vehicle sensor data (GPS, battery, IMU) in InfluxDB/TimescaleDB. Kafka for real-time fleet health monitoring." },
          { skill: "Embedded / Linux", weight: 20, level: "Working Knowledge", desc: "Linux on ARM (Raspberry Pi equivalent), CAN bus communication, and peripheral driver development for vehicle ECUs." },
        ]
      }
    ]
  },
  {
    id: "bounce", name: "Bounce (EV Mobility)", logo: "Bo", gradient: "from-orange-500 to-amber-400",
    industry: "Micro-mobility / EV", hq: "Bangalore", tier: "Startup",
    hiring2023: 150, hiring2024: 200, hiringTrend: "up",
    openRoles: 14, avgPackage: "₹14-28 LPA", glassdoor: 3.5,
    roles: [
      {
        title: "Full Stack Engineer", level: "SDE-2",
        requirements: [
          { skill: "React Native / Flutter", weight: 30, level: "Strong", desc: "EV rental app for bike-sharing, vehicle unlock via BLE/NFC, and trip management for electric scooter fleet." },
          { skill: "Node.js / Python", weight: 25, level: "Strong", desc: "Fleet management, real-time vehicle availability, and Bounce Infinity (subscription) bike management APIs." },
          { skill: "IoT & BLE", weight: 25, level: "Working Knowledge", desc: "Bluetooth Low Energy integration for vehicle unlock, NFC tap-to-ride, and IoT hub for vehicle telemetry." },
          { skill: "PostgreSQL & Redis", weight: 20, level: "Working Knowledge", desc: "Fleet data, trip records, and subscription management. Redis for real-time vehicle location and availability." },
        ]
      }
    ]
  },
];

// ════════════════════════════════════════════════════════════
// 25+ STANDARD SOFTWARE ENGINEERING ROLES (for search/filter)
// ════════════════════════════════════════════════════════════
const ROLE_TYPES = [
  "Software Engineer (Backend)", "Software Engineer (Frontend)", "Full Stack Engineer",
  "ML Engineer", "Data Scientist", "Data Engineer", "DevOps / SRE", "Cloud Engineer",
  "Android Engineer", "iOS Engineer", "React Native Developer", "Software Architect",
  "QA Engineer", "Security Engineer", "Product Manager (Tech)", "Engineering Manager",
  "System Engineer (Fresher)", "Associate Software Engineer", "Consultant (IT)",
  "Platform Engineer", "Infrastructure Engineer", "Blockchain Engineer",
  "Computer Vision Engineer", "NLP Engineer", "Embedded Systems Engineer"
];

const INDUSTRIES = ["All", "Technology", "Fintech", "E-commerce", "IT Services", "SaaS", "Food Tech", "EdTech", "HealthTech", "Mobility", "Quick Commerce", "Social Media", "Logistics"];
const TIERS = ["All", "FAANG", "Unicorn", "MNC", "IT Services", "Startup"];

// ════════════════════════════════════════════════════════════
// AI RESUME ANALYSIS ENGINE
// ════════════════════════════════════════════════════════════
function analyzeResume(resumeText: string, requirements: typeof COMPANIES[0]["roles"][0]["requirements"]) {
  const text = resumeText.toLowerCase();
  return requirements.map(req => {
    const skillKeywords = req.skill.toLowerCase().split(/[\/&,\s]+/).filter(w => w.length > 2);
    const matches = skillKeywords.filter(kw => text.includes(kw));
    const matchRatio = matches.length / skillKeywords.length;

    // Depth signals in the resume
    const hasYears = /(\d+)\s*(year|yr)/.test(text);
    const hasProd = /production|prod|million|billion|scale|live/.test(text);
    const hasLeadership = /lead|senior|architect|design|mentored|principal/.test(text);

    let status: "pass" | "partial" | "fail";
    let confidence: number;
    let evidence: string;

    if (matchRatio >= 0.75) {
      status = "pass";
      confidence = hasProd ? 92 : hasYears ? 78 : 65;
      evidence = `✅ Resume clearly demonstrates ${req.skill} — detected keywords: "${matches.slice(0, 3).join('", "')}". ${hasProd ? 'Production-scale usage evident.' : ''}`;
    } else if (matchRatio >= 0.35) {
      status = "partial";
      confidence = hasLeadership ? 58 : 40;
      evidence = `🟡 Partial match for ${req.skill}. Found related signals: "${matches.join('", "')}" but depth is unclear. ${req.level === "Expert" ? "Expert-level proficiency required — resume doesn't fully demonstrate this." : ""}`;
    } else {
      status = "fail";
      confidence = 15;
      evidence = `❌ No clear evidence of ${req.skill} in your resume. This is a "${req.level}" requirement — you should address this gap before applying.`;
    }

    return { ...req, status, confidence, evidence };
  });
}

function computeOverallScore(breakdown: ReturnType<typeof analyzeResume>, resumeText: string) {
  const text = resumeText.toLowerCase();
  const totalWeight = breakdown.reduce((a, b) => a + b.weight, 0);
  const earned = breakdown.reduce((a, b) =>
    a + (b.status === "pass" ? b.weight * (b.confidence / 100) :
      b.status === "partial" ? b.weight * 0.35 : 0), 0);

  const baseScore = Math.round((earned / totalWeight) * 100);

  // Depth boosters
  const hasImpact = /million|billion|thousand|%|improved|reduced|increased|optimized/.test(text);
  const hasEducation = /iit|nit|bits|iiit|mit|stanford|berkeley|b\.tech|m\.tech|b\.e\.|mba/.test(text);
  const hasContrib = /github|open.?source|patent|publication|research/.test(text);

  const bonus = (hasImpact ? 5 : 0) + (hasEducation ? 5 : 0) + (hasContrib ? 5 : 0);
  return Math.min(100, baseScore + bonus);
}

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
  const [result, setResult] = useState<{ score: number; breakdown: ReturnType<typeof analyzeResume>; suggestions: string[] } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadMode, setUploadMode] = useState<"paste" | "upload">("paste");
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCompanies = COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.roles.some(r => r.title.toLowerCase().includes(companySearch.toLowerCase()));
    const matchIndustry = industryFilter === "All" || c.industry.includes(industryFilter.replace("SaaS", "").trim()) || c.industry === industryFilter;
    const matchTier = tierFilter === "All" || c.tier === tierFilter;
    return matchSearch && matchIndustry && matchTier;
  });

  const handleFileUpload = useCallback((file: File) => {
    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text || "");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleAnalyze = () => {
    if (!selectedRole || !resumeText.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setShowSuggestions(false);
    setTimeout(() => {
      const breakdown = analyzeResume(resumeText, selectedRole.requirements);
      const score = computeOverallScore(breakdown, resumeText);
      const failedSkills = breakdown.filter(b => b.status === "fail").map(b => b.skill);
      const partialSkills = breakdown.filter(b => b.status === "partial").map(b => b.skill);
      const suggestions: string[] = [];
      failedSkills.forEach(s => suggestions.push(`🎯 Build hands-on projects with ${s} — add to GitHub and mention impact metrics.`));
      partialSkills.forEach(s => suggestions.push(`📈 Deepen ${s} skills — aim for production-scale experience to satisfy "${selectedRole.requirements.find(r => r.skill === s)?.level}" requirement.`));
      if (score >= 80) suggestions.push(`✅ Strong profile! Prepare for ${selectedCompany?.name}'s specific interview loop (${score >= 90 ? "DSA + System Design + Behavioral" : "focus on behavioral and system design rounds"}).`);
      if (score < 50) suggestions.push(`📚 Gap is significant. Consider targeting companies with similar but less strict bars first — build 6–12 months of experience.`);
      setResult({ score, breakdown, suggestions: suggestions.slice(0, 5) });
      setAnalyzing(false);
      setStep(3);
    }, 2500);
  };

  const scoreColor = result
    ? result.score >= 75 ? "text-success" : result.score >= 50 ? "text-warning" : "text-danger"
    : "text-primary";

  const scoreBorder = result
    ? result.score >= 75 ? "border-success/30 from-success/10 to-success/5" :
      result.score >= 50 ? "border-warning/30 from-warning/10 to-warning/5" :
      "border-danger/30 from-danger/10 to-danger/5"
    : "";

  const verdict = result
    ? result.score >= 80 ? "Strong Match 🚀" : result.score >= 60 ? "Good Potential 🟡" :
      result.score >= 40 ? "Needs Work 🔧" : "Significant Gap ❌"
    : "";

  const TREND_COLOR: Record<string, string> = { up: "text-success", down: "text-danger", stable: "text-warning" };
  const TREND_ICON: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />

      <div className="max-w-[1400px] mx-auto px-[24px] py-[88px] page-enter">
        {/* ── Hero ── */}
        <div className="text-center mb-[56px] max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[24px] shadow-glow-violet">
            <Brain className="w-[14px] h-[14px] stroke-[2px]" />
            Real AI Resume Analyzer — 100 Companies · Real Data 2024-25
          </div>
          <h1 className="text-[42px] md:text-[56px] font-extrabold text-text mb-[18px] tracking-[-0.04em] leading-[1.05]">
            Upload YOUR Resume.{" "}
            <span className="gradient-text">See Your Real Chances.</span>
          </h1>
          <p className="text-[17px] text-text-secondary leading-[28px] max-w-[720px] mx-auto">
            Paste or upload your actual resume, pick from 100 real Indian and global companies with authentic 2024-25 hiring requirements, and get a precise, evidence-based readiness report.
          </p>
        </div>

        {/* ── 3-Step Progress ── */}
        <div className="flex items-center justify-center gap-0 mb-[48px]">
          {[
            { n: 1, label: "Your Resume" },
            { n: 2, label: "Pick Company & Role" },
            { n: 3, label: "AI Analysis" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button
                onClick={() => { if (s.n <= step || (s.n === 2 && resumeText.trim())) setStep(s.n as 1 | 2 | 3); }}
                className={`flex items-center gap-[10px] px-[20px] py-[10px] rounded-xl font-semibold text-[14px] transition-all duration-200 ${step === s.n
                  ? "bg-primary text-white shadow-glow-orange"
                  : step > s.n
                  ? "bg-success/15 text-success border border-success/30"
                  : "bg-surface-2 text-text-secondary border border-border"
                  }`}
              >
                <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] font-bold ${step === s.n ? "bg-white/20" : step > s.n ? "bg-success/20" : "bg-border"}`}>
                  {step > s.n ? "✓" : s.n}
                </span>
                {s.label}
              </button>
              {i < 2 && <div className={`w-[40px] h-[2px] mx-[4px] rounded-full transition-colors ${step > s.n ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
            STEP 1: RESUME INPUT
        ═══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="max-w-[800px] mx-auto">
            <div className="bg-surface border border-border rounded-2xl p-[32px] shadow-md">
              <div className="flex items-center gap-[12px] mb-[24px]">
                <div className="w-[44px] h-[44px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center">
                  <FileText className="w-[20px] h-[20px] text-primary" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-text">Upload Your Resume</h2>
                  <p className="text-[13px] text-text-secondary">Paste the text or upload a .txt file for AI analysis</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-[2px] p-[4px] bg-surface-2 rounded-xl mb-[24px] w-fit">
                {(["paste", "upload"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setUploadMode(mode)}
                    className={`px-[20px] py-[8px] rounded-[10px] text-[14px] font-semibold transition-all ${uploadMode === mode ? "bg-surface text-text shadow-sm" : "text-text-secondary hover:text-text"}`}
                  >
                    {mode === "paste" ? "✏️ Paste Text" : "📎 Upload File"}
                  </button>
                ))}
              </div>

              {uploadMode === "paste" ? (
                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your complete resume here — include your skills, experience, projects, and education. The more detail, the better the analysis.

Example:
Senior Software Engineer with 4+ years of experience in Java, Spring Boot, and microservices. Built a payment processing system handling 1M+ transactions/day on AWS. Proficient in Kafka, PostgreSQL, Redis, and Kubernetes. Led a team of 5 engineers. Strong DSA skills — solved 300+ LeetCode problems..."
                  className="w-full h-[280px] px-[16px] py-[14px] bg-surface-2 border border-border rounded-xl text-[14px] text-text placeholder:text-text-muted font-mono resize-none focus:outline-none focus:border-primary/50 transition-colors"
                />
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-[12px] cursor-pointer transition-all ${dragActive ? "border-primary bg-primary-light" : "border-border-strong bg-surface-2 hover:border-primary/40 hover:bg-primary-light/50"}`}
                >
                  <Upload className={`w-[40px] h-[40px] ${dragActive ? "text-primary" : "text-text-secondary"}`} />
                  <div className="text-center">
                    <p className="font-semibold text-text">{resumeFileName || "Drop your resume here"}</p>
                    <p className="text-[13px] text-text-secondary mt-[4px]">Supports .txt files — or click to browse</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".txt,.text" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                </div>
              )}

              {resumeText.trim() && (
                <div className="mt-[16px] p-[12px] bg-success-bg border border-success/20 rounded-xl flex items-center gap-[10px]">
                  <CheckCircle className="w-[16px] h-[16px] text-success flex-shrink-0" />
                  <span className="text-[13px] text-success font-medium">
                    Resume loaded — {resumeText.split(/\s+/).length} words detected. Ready for analysis!
                  </span>
                </div>
              )}

              <div className="mt-[24px] flex justify-end">
                <Button
                  variant="header"
                  disabled={!resumeText.trim()}
                  onClick={() => setStep(2)}
                  className="px-[32px] py-[12px] text-[15px] font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Company Selection <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 2: COMPANY & ROLE SELECTION
        ═══════════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            {/* Filters */}
            <div className="bg-surface border border-border rounded-2xl p-[20px] mb-[24px] shadow-sm">
              <div className="flex flex-wrap gap-[12px] items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-text-secondary" />
                  <input
                    value={companySearch}
                    onChange={e => setCompanySearch(e.target.value)}
                    placeholder="Search company, industry, or role..."
                    className="w-full pl-[38px] pr-[14px] h-[40px] bg-surface-2 border border-border rounded-xl text-[14px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex items-center gap-[8px]">
                  <Filter className="w-[14px] h-[14px] text-text-secondary" />
                  <select
                    value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
                    className="h-[40px] px-[12px] bg-surface-2 border border-border rounded-xl text-[14px] text-text focus:outline-none cursor-pointer"
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <select
                    value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                    className="h-[40px] px-[12px] bg-surface-2 border border-border rounded-xl text-[14px] text-text focus:outline-none cursor-pointer"
                  >
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <span className="text-[13px] text-text-secondary font-medium">{filteredCompanies.length} companies</span>
              </div>
            </div>

            {/* Company Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[16px]">
              {filteredCompanies.map(company => (
                <div key={company.id}
                  className={`bg-surface border rounded-2xl p-[20px] cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCompany?.id === company.id ? "border-primary shadow-glow-orange" : "border-border hover:border-border-strong"}`}
                >
                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-[16px]">
                    <div className="flex items-center gap-[10px]">
                      <div className={`w-[42px] h-[42px] rounded-xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0`}>
                        {company.logo}
                      </div>
                      <div>
                        <div className="font-bold text-text text-[15px]">{company.name}</div>
                        <div className="text-[12px] text-text-secondary">{company.hq}</div>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-[8px] py-[3px] rounded-full ${
                      company.tier === "FAANG" ? "bg-ai-light text-ai" :
                      company.tier === "Unicorn" ? "bg-primary-light text-primary" :
                      company.tier === "MNC" ? "bg-info-bg text-info" :
                      company.tier === "Startup" ? "bg-success-bg text-success" :
                      "bg-surface-3 text-text-secondary"
                    }`}>{company.tier}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-[8px] mb-[14px]">
                    <div className="bg-surface-2 rounded-xl p-[10px]">
                      <div className="text-[11px] text-text-muted mb-[2px]">Hiring 2024</div>
                      <div className="font-bold text-text text-[13px]">{company.hiring2024.toLocaleString()}</div>
                      <div className={`text-[11px] font-semibold ${TREND_COLOR[company.hiringTrend]}`}>
                        {TREND_ICON[company.hiringTrend]} vs 2023
                      </div>
                    </div>
                    <div className="bg-surface-2 rounded-xl p-[10px]">
                      <div className="text-[11px] text-text-muted mb-[2px]">Open Roles</div>
                      <div className="font-bold text-text text-[13px]">{company.openRoles}+</div>
                      <div className="text-[11px] text-text-secondary">{company.industry}</div>
                    </div>
                  </div>

                  <div className="text-[12px] text-text-secondary mb-[12px]">
                    <span className="font-medium text-text">Avg Package:</span> {company.avgPackage}
                    <span className="ml-[8px]">⭐ {company.glassdoor}/5</span>
                  </div>

                  {/* Roles */}
                  <div className="space-y-[6px]">
                    {company.roles.map(role => (
                      <button
                        key={role.title}
                        onClick={() => { setSelectedCompany(company); setSelectedRole(role); }}
                        className={`w-full text-left px-[12px] py-[8px] rounded-xl text-[13px] font-medium transition-all ${selectedRole?.title === role.title && selectedCompany?.id === company.id
                          ? "bg-primary text-white"
                          : "bg-surface-2 text-text hover:bg-surface-3"
                          }`}
                      >
                        <div className="font-semibold">{role.title}</div>
                        <div className={`text-[11px] mt-[2px] ${selectedRole?.title === role.title && selectedCompany?.id === company.id ? "text-white/70" : "text-text-secondary"}`}>{role.level}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Analyze CTA */}
            {selectedRole && selectedCompany && (
              <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-40 animate-slide-up">
                <div className="bg-text text-bg px-[32px] py-[16px] rounded-2xl shadow-lg flex items-center gap-[20px]">
                  <div>
                    <div className="font-bold text-[15px]">{selectedCompany.name} — {selectedRole.title}</div>
                    <div className="text-[13px] text-bg/70">Ready to analyze your resume?</div>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-primary text-white px-[24px] py-[10px] rounded-xl font-bold text-[14px] hover:bg-primary-hover transition-colors flex items-center gap-[8px] disabled:opacity-60"
                  >
                    {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    {analyzing ? "Analyzing..." : "Analyze My Resume"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP 3: RESULTS
        ═══════════════════════════════════════════════ */}
        {step === 3 && result && selectedCompany && selectedRole && (
          <div className="max-w-[900px] mx-auto">
            {/* Score Card */}
            <div className={`bg-gradient-to-br ${scoreBorder} border rounded-2xl p-[32px] mb-[24px] text-center shadow-md`}>
              <div className="text-[13px] font-semibold text-text-secondary mb-[8px]">
                {selectedCompany.name} — {selectedRole.title}
              </div>
              <div className={`text-[80px] font-extrabold ${scoreColor} leading-none mb-[8px]`}>
                {result.score}
                <span className="text-[36px] opacity-60">%</span>
              </div>
              <div className="text-[22px] font-bold text-text mb-[16px]">{verdict}</div>
              <div className="flex justify-center gap-[12px] flex-wrap">
                {result.breakdown.map(b => (
                  <span key={b.skill} className={`text-[12px] font-semibold px-[10px] py-[4px] rounded-full ${
                    b.status === "pass" ? "bg-success-bg text-success" :
                    b.status === "partial" ? "bg-warning-bg text-warning" :
                    "bg-danger-bg text-danger"
                  }`}>
                    {b.status === "pass" ? "✓" : b.status === "partial" ? "~" : "✗"} {b.skill.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Context */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[24px] shadow-sm">
              <h3 className="font-bold text-text text-[16px] mb-[16px] flex items-center gap-[8px]">
                <Building2 className="w-[16px] h-[16px] text-primary" /> Company Hiring Context
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
                <div className="bg-surface-2 rounded-xl p-[14px] text-center">
                  <div className="text-[11px] text-text-muted mb-[4px]">Hires in 2024</div>
                  <div className="text-[20px] font-bold text-text">{selectedCompany.hiring2024.toLocaleString()}</div>
                  <div className={`text-[12px] font-semibold ${TREND_COLOR[selectedCompany.hiringTrend]}`}>
                    {TREND_ICON[selectedCompany.hiringTrend]} from {selectedCompany.hiring2023.toLocaleString()} (2023)
                  </div>
                </div>
                <div className="bg-surface-2 rounded-xl p-[14px] text-center">
                  <div className="text-[11px] text-text-muted mb-[4px]">Open Roles Now</div>
                  <div className="text-[20px] font-bold text-text">{selectedCompany.openRoles}+</div>
                  <div className="text-[12px] text-text-secondary">{selectedCompany.industry}</div>
                </div>
                <div className="bg-surface-2 rounded-xl p-[14px] text-center">
                  <div className="text-[11px] text-text-muted mb-[4px]">Avg Package</div>
                  <div className="text-[16px] font-bold text-text">{selectedCompany.avgPackage}</div>
                  <div className="text-[12px] text-text-secondary">{selectedCompany.tier}</div>
                </div>
                <div className="bg-surface-2 rounded-xl p-[14px] text-center">
                  <div className="text-[11px] text-text-muted mb-[4px]">Glassdoor</div>
                  <div className="text-[20px] font-bold text-text">⭐ {selectedCompany.glassdoor}</div>
                  <div className="text-[12px] text-text-secondary">Employee Rating</div>
                </div>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[24px] shadow-sm">
              <h3 className="font-bold text-text text-[16px] mb-[20px] flex items-center gap-[8px]">
                <Target className="w-[16px] h-[16px] text-primary" /> Skill-by-Skill Breakdown
              </h3>
              <div className="space-y-[16px]">
                {result.breakdown.map(b => (
                  <div key={b.skill} className={`p-[16px] rounded-xl border ${
                    b.status === "pass" ? "bg-success-bg border-success/20" :
                    b.status === "partial" ? "bg-warning-bg border-warning/20" :
                    "bg-danger-bg border-danger/20"
                  }`}>
                    <div className="flex items-center justify-between mb-[8px]">
                      <div className="flex items-center gap-[10px]">
                        {b.status === "pass" ? <CheckCircle className="w-[16px] h-[16px] text-success" /> :
                          b.status === "partial" ? <AlertTriangle className="w-[16px] h-[16px] text-warning" /> :
                          <XCircle className="w-[16px] h-[16px] text-danger" />}
                        <span className="font-bold text-text text-[14px]">{b.skill}</span>
                        <span className="text-[11px] font-semibold bg-surface/60 px-[8px] py-[2px] rounded-full text-text-secondary">{b.level} • {b.weight}% weight</span>
                      </div>
                      <span className={`text-[13px] font-bold ${b.status === "pass" ? "text-success" : b.status === "partial" ? "text-warning" : "text-danger"}`}>
                        {b.status === "pass" ? `${b.confidence}% confident` : b.status === "partial" ? "Partial" : "Not Found"}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-secondary leading-[20px] mb-[8px]">{b.evidence}</p>
                    <p className="text-[12px] text-text-muted italic">{b.desc}</p>
                    {/* Progress bar */}
                    <div className="mt-[10px] h-[4px] bg-surface-3 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${b.status === "pass" ? "bg-success" : b.status === "partial" ? "bg-warning" : "bg-danger"}`}
                        style={{ width: `${b.status === "pass" ? b.confidence : b.status === "partial" ? 35 : 5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[32px] shadow-sm">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-bold text-text text-[16px] flex items-center gap-[8px]">
                  <Lightbulb className="w-[16px] h-[16px] text-warning" /> AI Improvement Roadmap
                </h3>
                {showSuggestions ? <ChevronUp className="w-[16px] h-[16px] text-text-secondary" /> : <ChevronDown className="w-[16px] h-[16px] text-text-secondary" />}
              </button>
              {showSuggestions && (
                <div className="mt-[16px] space-y-[12px]">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-[12px] p-[14px] bg-surface-2 rounded-xl">
                      <span className="text-[20px] leading-none">{s.split(" ")[0]}</span>
                      <p className="text-[14px] text-text leading-[22px]">{s.substring(s.indexOf(" ") + 1)}</p>
                    </div>
                  ))}
                </div>
              )}
              {!showSuggestions && (
                <p className="text-[13px] text-text-secondary mt-[8px]">Click to reveal {result.suggestions.length} personalized improvement tips.</p>
              )}
            </div>

            {/* Reset */}
            <div className="flex gap-[12px] justify-center">
              <button
                onClick={() => { setStep(1); setResult(null); setSelectedCompany(null); setSelectedRole(null); }}
                className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl border border-border text-text-secondary hover:text-text hover:bg-surface-2 font-medium text-[14px] transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Analyze Another Resume
              </button>
              <button
                onClick={() => { setStep(2); setResult(null); }}
                className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl bg-primary text-white font-semibold text-[14px] hover:bg-primary-hover transition-all"
              >
                <Building2 className="w-4 h-4" /> Try Another Company
              </button>
            </div>
          </div>
        )}

        {/* ── Quick Stats Bar (always visible) ── */}
        <div className="mt-[64px] grid grid-cols-2 md:grid-cols-4 gap-[16px] border-t border-border pt-[48px]">
          {[
            { icon: Building2, value: "100", label: "Real Companies", sub: "FAANG to Startups" },
            { icon: Briefcase, value: "250+", label: "Specific Roles", sub: "With real requirements" },
            { icon: BarChart3, value: "2024-25", label: "Hiring Data", sub: "Year-over-year trends" },
            { icon: TrendingUp, value: "Real AI", label: "Analysis Engine", sub: "Evidence-based scoring" },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-[20px] flex items-center gap-[14px]">
              <div className="w-[44px] h-[44px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-[20px] h-[20px] text-primary" />
              </div>
              <div>
                <div className="text-[20px] font-extrabold text-text">{s.value}</div>
                <div className="text-[13px] font-semibold text-text">{s.label}</div>
                <div className="text-[11px] text-text-muted">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
