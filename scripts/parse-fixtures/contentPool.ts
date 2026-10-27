// ============================================================
// Realistic Content Pools for Deterministic Resume Generation
// ============================================================

import { SeededPRNG } from './prng';
import { CandidateProfileData } from './types';

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Aditi', 'Vikram', 'Pooja', 'Karthik', 'Sneha',
  'Arjun', 'Meera', 'Rahul', 'Ishaan', 'Tanvi', 'Siddharth', 'Divya', 'Varun',
  'Neha', 'Harsh', 'Anika', 'Pranav', 'Rhea', 'Kunal', 'Shreya', 'Devansh'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Iyer', 'Reddy', 'Nair', 'Gupta', 'Banerjee',
  'Mehta', 'Chopra', 'Rao', 'Kulkarni', 'Joshi', 'Singhania', 'Bose', 'Das',
  'Pillai', 'Menon', 'Chatterjee', 'Deshmukh', 'Mishra', 'Agarwal', 'Bhat'
];

const INSTITUTIONS = [
  { name: 'Indian Institute of Technology Madras', short: 'IIT Madras', loc: 'Chennai, India' },
  { name: 'Indian Institute of Technology Bombay', short: 'IIT Bombay', loc: 'Mumbai, India' },
  { name: 'Birla Institute of Technology and Science', short: 'BITS Pilani', loc: 'Pilani, India' },
  { name: 'National Institute of Technology Tiruchirappalli', short: 'NIT Trichy', loc: 'Tiruchirappalli, India' },
  { name: 'Delhi Technological University', short: 'DTU', loc: 'New Delhi, India' },
  { name: 'Vellore Institute of Technology', short: 'VIT Vellore', loc: 'Vellore, India' },
  { name: 'College of Engineering, Guindy', short: 'Anna University', loc: 'Chennai, India' },
  { name: 'International Institute of Information Technology', short: 'IIIT Hyderabad', loc: 'Hyderabad, India' },
  { name: 'Jadavpur University', short: 'JU Kolkata', loc: 'Kolkata, India' }
];

const DEGREES = [
  'Bachelor of Technology in Computer Science & Engineering',
  'B.Tech in Information Technology',
  'B.E. in Computer Science',
  'Master of Computer Applications (MCA)',
  'B.Tech in Electronics and Communication Engineering',
  'Master of Technology in Software Systems'
];

const COMPANIES = [
  { name: 'Razorpay Software Pvt. Ltd.', loc: 'Bengaluru, India' },
  { name: 'Swiggy (Bundl Technologies)', loc: 'Bengaluru, India' },
  { name: 'Zomato Limited', loc: 'Gurugram, India' },
  { name: 'Flipkart Internet Pvt. Ltd.', loc: 'Bengaluru, India' },
  { name: 'CRED (Dreamplug Technologies)', loc: 'Bengaluru, India' },
  { name: 'PhonePe Pvt. Ltd.', loc: 'Bengaluru, India' },
  { name: 'Postman Software', loc: 'Bengaluru, India' },
  { name: 'Groww (Nextbillion Technology)', loc: 'Bengaluru, India' },
  { name: 'Zepto (KiranaKart Technologies)', loc: 'Mumbai, India' },
  { name: 'InMobi Technologies', loc: 'Bengaluru, India' }
];

const ROLES = [
  'Software Development Engineer I',
  'Backend Engineering Intern',
  'Full Stack Software Engineer',
  'Platform Engineer',
  'Associate Software Engineer',
  'Software Engineer - Core Services'
];

const BULLETS_EXPERIENCE = [
  'Architected high-throughput payment webhook processor using Go and Redis Streams, handling 14,000 requests/sec with p99 latency under 28ms.',
  'Engineered distributed idempotency layer with Redis and PostgreSQL, eliminating 100% of double-debit anomalies during peak flash sales.',
  'Migrated monolithic checkout service to gRPC microservices, shrinking cloud compute costs by 32% and reducing deployment cycle times from 4 hours to 12 minutes.',
  'Optimized database queries and added composite b-tree indexes on partitioned ledger tables, lowering average query execution time from 420ms to 35ms.',
  'Designed real-time event pipeline consuming 5M daily telemetry records via Apache Kafka, providing sub-second fraud detection alerts.',
  'Implemented automated circuit-breaker pattern with Resilience4j across 8 downstream microservices, preventing cascade outages during third-party gateway downtime.',
  'Developed responsive internal operations dashboard in React and TypeScript with TanStack Query, accelerating merchant dispute resolution by 40%.'
];

const PROJECTS = [
  {
    title: 'Distributed Log-Structured Key-Value Store',
    techStack: ['Go', 'Raft Consensus', 'gRPC', 'LSM-Tree', 'Docker'],
    bullets: [
      'Implemented distributed LSM-tree storage engine in Go with write-ahead logging (WAL), SSTable compaction, and bloom filters.',
      'Embedded Raft consensus algorithm for distributed multi-node replication, surviving arbitrary node crashes without state divergence.',
      'Benchmarked performance using custom concurrent load generator, achieving 85,000 read operations/sec across a 5-node cluster.'
    ]
  },
  {
    title: 'High-Concurrency Real-Time Collaboration Canvas',
    techStack: ['TypeScript', 'WebSocket', 'CRDT', 'React', 'Node.js'],
    bullets: [
      'Built multi-user collaborative workspace using Conflict-free Replicated Data Types (CRDTs) to ensure convergence across disconnected edits.',
      'Engineered WebSocket server in Node.js with delta-compression protocol, reducing network bandwidth consumption by 64% during intense cursor movements.',
      'Authored comprehensive property-based test suite with fast-check verifying eventual consistency across simulated random network partitions.'
    ]
  },
  {
    title: 'Autonomous Code Review Linter & Security Auditor',
    techStack: ['Python', 'AST', 'Tree-sitter', 'Docker', 'FastAPI'],
    bullets: [
      'Engineered static analysis pipeline parsing abstract syntax trees (ASTs) to detect SQL injection, unvalidated deserialization, and memory leaks.',
      'Built automated GitHub Action integration running checks across 200+ pull requests with an average scan duration under 3.5 seconds.',
      'Containerized execution sandbox using gVisor and Docker to securely isolate untrusted student code submissions.'
    ]
  },
  {
    title: 'Peer-to-Peer File Transfer Protocol with NAT Traversal',
    techStack: ['Rust', 'STUN/TURN', 'UDP', 'Tokio', 'Cryptography'],
    bullets: [
      'Developed user-space P2P file synchronization tool implementing UDP hole-punching and ICE protocol to bypass restrictive symmetric NATs.',
      'Utilized ChaCha20-Poly1305 authenticated encryption to guarantee confidentiality and packet integrity over public Wi-Fi networks.',
      'Achieved wire-speed throughput of 940 Mbps over local gigabit connections using zero-copy memory-mapped file buffers.'
    ]
  }
];

const SKILL_SETS = [
  {
    category: 'Languages',
    skills: ['Go', 'Java', 'Python', 'TypeScript', 'C++', 'SQL']
  },
  {
    category: 'Frameworks & Systems',
    skills: ['Spring Boot', 'Node.js', 'FastAPI', 'React', 'Next.js', 'gRPC']
  },
  {
    category: 'Databases & Storage',
    skills: ['PostgreSQL', 'Redis', 'MongoDB', 'Apache Kafka', 'Elasticsearch']
  },
  {
    category: 'Cloud & DevOps',
    skills: ['Docker', 'Kubernetes', 'AWS (EC2, S3, RDS)', 'Git', 'CI/CD Pipelines']
  }
];

export function generateCandidateData(prng: SeededPRNG): CandidateProfileData {
  const firstName = prng.pick(FIRST_NAMES);
  const lastName = prng.pick(LAST_NAMES);
  const inst = prng.pick(INSTITUTIONS);
  const deg = prng.pick(DEGREES);
  const comp = prng.pick(COMPANIES);
  const role = prng.pick(ROLES);

  const startYear = prng.nextInt(2020, 2022);
  const endYear = startYear + 4;
  const cgpa = (prng.nextInt(82, 98) / 10).toFixed(2);
  const tenth = `${prng.nextInt(90, 98)}%`;
  const twelfth = `${prng.nextInt(88, 97)}%`;

  const expBullets = prng.pickMultiple(BULLETS_EXPERIENCE, 3);
  const selectedProjects = prng.pickMultiple(PROJECTS, 2);

  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${prng.nextInt(10, 99)}`;

  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+91 ${prng.nextInt(98000, 99999)} ${prng.nextInt(10000, 99999)}`,
    github: `https://github.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    portfolio: `https://${username}.dev`,
    summary: `Results-driven software engineer with strong foundation in distributed systems, high-concurrency backend services, and clean architecture. Experienced in designing fault-tolerant microservices, optimizing database throughput, and shipping production code with rigorous test coverage.`,
    education: [
      {
        degree: deg,
        institution: inst.name,
        location: inst.loc,
        startYear: `${startYear}`,
        endYear: `${endYear}`,
        cgpaOrPercent: `${cgpa}/10.0`,
        tenthScore: tenth,
        twelfthScore: twelfth
      }
    ],
    experience: [
      {
        role,
        company: comp.name,
        location: comp.loc,
        startDate: `Jun ${startYear + 3}`,
        endDate: 'Present',
        isCurrent: true,
        bullets: expBullets
      }
    ],
    projects: selectedProjects,
    skills: SKILL_SETS,
    achievements: [
      `Secured All India Rank ${prng.nextInt(120, 950)} in JEE Advanced out of 250,000 candidates.`,
      `Global Rank ${prng.nextInt(40, 200)} out of 18,000+ participants in LeetCode Weekly Contest.`,
      `Winner of National Smart India Hackathon (Ministry of Education) in Software Edition.`
    ],
    responsibilities: [
      'Lead Coordinator, Departmental Technical Symposium (orchestrated coding marathons for 1,200+ students).',
      'Peer Mentor, Data Structures and Algorithms Laboratory (guided 60+ junior undergraduates).'
    ],
    declaration: 'I hereby declare that all the information furnished above is authentic and true to the best of my knowledge.'
  };
}
