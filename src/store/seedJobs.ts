import type { Job, JobRequirement } from "../types";
import { DEMO_IDS, daysAgo, daysFromNow, defaultScreening } from "./seedHelpers";

function req(id: string, jobId: string, name: string, cat: JobRequirement["category"], pri: JobRequirement["priority"], wt: number, desc?: string, yrs?: number): JobRequirement {
  return { id, jobId, name, category: cat, priority: pri, weight: wt, description: desc, yearsRequired: yrs };
}

const reqs = {
  jobA1: [
    req("req-1", DEMO_IDS.jobA1, "Java", "skill", "MANDATORY", 25, "Strong Java programming skills", 2),
    req("req-2", DEMO_IDS.jobA1, "Spring Boot", "technology", "MANDATORY", 20),
    req("req-3", DEMO_IDS.jobA1, "SQL / PostgreSQL", "skill", "MANDATORY", 15),
    req("req-4", DEMO_IDS.jobA1, "REST API Development", "skill", "MANDATORY", 10),
    req("req-5", DEMO_IDS.jobA1, "2+ years experience", "experience", "MANDATORY", 15, undefined, 2),
    req("req-6", DEMO_IDS.jobA1, "Docker / Kubernetes", "technology", "PREFERRED", 8),
  ],
  jobA2: [
    req("req-f1", DEMO_IDS.jobA2, "React", "skill", "MANDATORY", 30),
    req("req-f2", DEMO_IDS.jobA2, "TypeScript", "skill", "MANDATORY", 20),
    req("req-f5", DEMO_IDS.jobA2, "1+ year experience", "experience", "MANDATORY", 15, undefined, 1),
  ],
  jobA3: [
    req("req-dv1", DEMO_IDS.jobA3, "Kubernetes", "technology", "MANDATORY", 25),
    req("req-dv2", DEMO_IDS.jobA3, "Terraform / IaC", "technology", "MANDATORY", 20),
    req("req-dv3", DEMO_IDS.jobA3, "AWS / GCP / Azure", "technology", "MANDATORY", 20),
  ],
  jobA4: [
    req("req-de1", DEMO_IDS.jobA4, "Python", "skill", "MANDATORY", 25),
    req("req-de2", DEMO_IDS.jobA4, "Apache Spark", "technology", "MANDATORY", 20),
    req("req-de3", DEMO_IDS.jobA4, "SQL", "skill", "MANDATORY", 20),
  ],
  jobA5: [
    req("req-ml1", DEMO_IDS.jobA5, "Python / PyTorch", "skill", "MANDATORY", 30),
    req("req-ml2", DEMO_IDS.jobA5, "ML Model Training", "domain", "MANDATORY", 25),
  ],
  jobA6: [
    req("req-qa1", DEMO_IDS.jobA6, "Selenium / Playwright", "technology", "MANDATORY", 30),
    req("req-qa2", DEMO_IDS.jobA6, "Java or Python for testing", "skill", "MANDATORY", 25),
  ],
  jobA7: [
    req("req-pa1", DEMO_IDS.jobA7, "SQL / Data Analysis", "skill", "MANDATORY", 30),
    req("req-pa2", DEMO_IDS.jobA7, "Product Metrics / KPIs", "domain", "MANDATORY", 25),
  ],
  jobA8: [
    req("req-in1", DEMO_IDS.jobA8, "React or Angular", "skill", "MANDATORY", 40),
    req("req-in2", DEMO_IDS.jobA8, "Java or Node.js", "skill", "MANDATORY", 35),
  ],
  jobA9: [
    req("req-ux1", DEMO_IDS.jobA9, "Figma", "technology", "MANDATORY", 35),
    req("req-ux2", DEMO_IDS.jobA9, "User Research", "domain", "MANDATORY", 30),
  ],
  jobA10: [
    req("req-sb1", DEMO_IDS.jobA10, "Java / Kotlin", "skill", "MANDATORY", 25),
    req("req-sb2", DEMO_IDS.jobA10, "Distributed Systems", "domain", "MANDATORY", 20),
    req("req-sb3", DEMO_IDS.jobA10, "Kafka / Message Queues", "technology", "MANDATORY", 15),
  ],
  jobB1: [
    req("req-d1", DEMO_IDS.jobB1, "Python", "skill", "MANDATORY", 25),
    req("req-d2", DEMO_IDS.jobB1, "Apache Spark", "technology", "MANDATORY", 20),
  ],
  jobB2: [
    req("req-da1", DEMO_IDS.jobB2, "SQL", "skill", "MANDATORY", 35),
    req("req-da2", DEMO_IDS.jobB2, "Tableau / Power BI", "technology", "MANDATORY", 30),
  ],
  jobB3: [
    req("req-py1", DEMO_IDS.jobB3, "Python", "skill", "MANDATORY", 40),
    req("req-py2", DEMO_IDS.jobB3, "FastAPI / Django", "technology", "MANDATORY", 30),
  ],
  jobB4: [
    req("req-bi1", DEMO_IDS.jobB4, "Power BI / Tableau", "technology", "MANDATORY", 35),
    req("req-bi2", DEMO_IDS.jobB4, "DAX / SQL", "skill", "MANDATORY", 35),
  ],
  jobB5: [
    req("req-ds1", DEMO_IDS.jobB5, "Python / R", "skill", "MANDATORY", 30),
    req("req-ds2", DEMO_IDS.jobB5, "ML / Statistics", "domain", "MANDATORY", 30),
  ],
  jobB6: [
    req("req-hr1", DEMO_IDS.jobB6, "HR Operations", "domain", "MANDATORY", 40),
    req("req-hr2", DEMO_IDS.jobB6, "Payroll / Compliance", "domain", "MANDATORY", 35),
  ],
  jobC1: [
    req("req-gb1", DEMO_IDS.jobC1, "Go / Golang", "skill", "MANDATORY", 35),
    req("req-gb2", DEMO_IDS.jobC1, "REST / gRPC APIs", "skill", "MANDATORY", 25),
  ],
  jobC2: [
    req("req-gi1", DEMO_IDS.jobC2, "Go or Python", "skill", "MANDATORY", 50),
    req("req-gi2", DEMO_IDS.jobC2, "Cloud basics", "domain", "PREFERRED", 50),
  ],
  jobC3: [
    req("req-gd1", DEMO_IDS.jobC3, "Kubernetes / Helm", "technology", "MANDATORY", 35),
    req("req-gd2", DEMO_IDS.jobC3, "Terraform", "technology", "MANDATORY", 30),
    req("req-gd3", DEMO_IDS.jobC3, "AWS", "technology", "MANDATORY", 25),
  ]
};

export const jobs: Job[] = [
  { id: DEMO_IDS.jobA1, companyId: DEMO_IDS.companyA, title: "Backend Developer", department: "Engineering", employmentType: "full-time", workMode: "hybrid", location: "Bangalore, India", salaryMin: 800000, salaryMax: 1500000, salaryCurrency: "INR", openings: 3, deadline: daysFromNow(26), summary: "Design and build high-performance microservices using Java and Spring Boot.", requirements: reqs.jobA1, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(64), updatedAt: daysAgo(49), publishedAt: daysAgo(49) },
  { id: DEMO_IDS.jobA2, companyId: DEMO_IDS.companyA, title: "Frontend Developer", department: "Engineering", employmentType: "full-time", workMode: "remote", location: "Remote (India)", salaryMin: 700000, salaryMax: 1200000, salaryCurrency: "INR", openings: 2, deadline: daysFromNow(41), summary: "Build modern, responsive UIs using React and TypeScript.", requirements: reqs.jobA2, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(44), updatedAt: daysAgo(33), publishedAt: daysAgo(33) },
  { id: DEMO_IDS.jobA3, companyId: DEMO_IDS.companyA, title: "DevOps Engineer", department: "DevOps/Cloud", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad, India", salaryMin: 1200000, salaryMax: 2000000, salaryCurrency: "INR", openings: 2, deadline: daysFromNow(21), summary: "Own and evolve our cloud infrastructure on AWS.", requirements: reqs.jobA3, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(55), updatedAt: daysAgo(40), publishedAt: daysAgo(40) },
  { id: DEMO_IDS.jobA4, companyId: DEMO_IDS.companyA, title: "Data Engineer", department: "Data", employmentType: "full-time", workMode: "hybrid", location: "Bangalore, India", salaryMin: 1000000, salaryMax: 1800000, salaryCurrency: "INR", openings: 1, summary: "Design and maintain data pipelines.", requirements: reqs.jobA4, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(50), updatedAt: daysAgo(38), publishedAt: daysAgo(38) },
  { id: DEMO_IDS.jobA5, companyId: DEMO_IDS.companyA, title: "ML Engineer", department: "Data", employmentType: "full-time", workMode: "hybrid", location: "Bangalore, India", salaryMin: 1500000, salaryMax: 2500000, salaryCurrency: "INR", openings: 1, summary: "Build and deploy ML models.", requirements: reqs.jobA5, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(40), updatedAt: daysAgo(28), publishedAt: daysAgo(28) },
  { id: DEMO_IDS.jobA6, companyId: DEMO_IDS.companyA, title: "QA Automation Engineer", department: "QA", employmentType: "full-time", workMode: "hybrid", location: "Pune, India", salaryMin: 700000, salaryMax: 1300000, salaryCurrency: "INR", openings: 2, summary: "Build automated test suite.", requirements: reqs.jobA6, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(35), updatedAt: daysAgo(22), publishedAt: daysAgo(22) },
  { id: DEMO_IDS.jobA7, companyId: DEMO_IDS.companyA, title: "Product Analyst", department: "Product", employmentType: "full-time", workMode: "hybrid", location: "Bangalore, India", salaryMin: 900000, salaryMax: 1600000, salaryCurrency: "INR", openings: 1, summary: "Define and track product KPIs.", requirements: reqs.jobA7, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(30), updatedAt: daysAgo(20), publishedAt: daysAgo(20) },
  { id: DEMO_IDS.jobA8, companyId: DEMO_IDS.companyA, title: "Full-Stack Developer Intern", department: "Engineering", employmentType: "internship", workMode: "hybrid", location: "Bangalore, India", salaryMin: 20000, salaryMax: 35000, salaryCurrency: "INR", openings: 3, summary: "6-month internship.", requirements: reqs.jobA8, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(25), updatedAt: daysAgo(15), publishedAt: daysAgo(15) },
  { id: DEMO_IDS.jobA9, companyId: DEMO_IDS.companyA, title: "UX Designer", department: "Design", employmentType: "full-time", workMode: "remote", location: "Remote (India)", salaryMin: 800000, salaryMax: 1400000, salaryCurrency: "INR", openings: 1, summary: "Own the end-to-end UX.", requirements: reqs.jobA9, responsibilities: [], screeningConfig: defaultScreening, status: "draft", createdAt: daysAgo(10), updatedAt: daysAgo(5) },
  { id: DEMO_IDS.jobA10, companyId: DEMO_IDS.companyA, title: "Senior Backend Developer", department: "Engineering", employmentType: "full-time", workMode: "hybrid", location: "Bangalore, India", salaryMin: 2000000, salaryMax: 3500000, salaryCurrency: "INR", openings: 1, deadline: daysFromNow(14), summary: "Lead design of distributed backend systems.", requirements: reqs.jobA10, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(60), updatedAt: daysAgo(45), publishedAt: daysAgo(45) },
  { id: DEMO_IDS.jobB1, companyId: DEMO_IDS.companyB, title: "Data Engineer", department: "Data Platform", employmentType: "full-time", workMode: "onsite", location: "Hyderabad, India", salaryMin: 1000000, salaryMax: 1800000, salaryCurrency: "INR", openings: 1, summary: "Design and maintain data pipelines.", requirements: reqs.jobB1, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(55), updatedAt: daysAgo(45), publishedAt: daysAgo(45) },
  { id: DEMO_IDS.jobB2, companyId: DEMO_IDS.companyB, title: "Data Analyst", department: "Analytics", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad, India", salaryMin: 600000, salaryMax: 1100000, salaryCurrency: "INR", openings: 2, summary: "Analyse business data.", requirements: reqs.jobB2, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(45), updatedAt: daysAgo(35), publishedAt: daysAgo(35) },
  { id: DEMO_IDS.jobB3, companyId: DEMO_IDS.companyB, title: "Python Developer", department: "Engineering", employmentType: "full-time", workMode: "hybrid", location: "Chennai, India", salaryMin: 800000, salaryMax: 1400000, salaryCurrency: "INR", openings: 1, summary: "Build data-ingestion APIs.", requirements: reqs.jobB3, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(40), updatedAt: daysAgo(30), publishedAt: daysAgo(30) },
  { id: DEMO_IDS.jobB4, companyId: DEMO_IDS.companyB, title: "BI Developer", department: "Analytics", employmentType: "full-time", workMode: "onsite", location: "Hyderabad, India", salaryMin: 700000, salaryMax: 1200000, salaryCurrency: "INR", openings: 1, summary: "Build Power BI reports.", requirements: reqs.jobB4, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(30), updatedAt: daysAgo(22), publishedAt: daysAgo(22) },
  { id: DEMO_IDS.jobB5, companyId: DEMO_IDS.companyB, title: "Data Scientist", department: "Data Platform", employmentType: "full-time", workMode: "hybrid", location: "Hyderabad, India", salaryMin: 1200000, salaryMax: 2000000, salaryCurrency: "INR", openings: 1, summary: "Build predictive models.", requirements: reqs.jobB5, responsibilities: [], screeningConfig: defaultScreening, status: "draft", createdAt: daysAgo(8), updatedAt: daysAgo(3) },
  { id: DEMO_IDS.jobB6, companyId: DEMO_IDS.companyB, title: "HR Executive", department: "HR", employmentType: "full-time", workMode: "onsite", location: "Hyderabad, India", salaryMin: 400000, salaryMax: 700000, salaryCurrency: "INR", openings: 1, summary: "Handle end-to-end HR operations.", requirements: reqs.jobB6, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(20), updatedAt: daysAgo(15), publishedAt: daysAgo(15) },
  { id: DEMO_IDS.jobC1, companyId: DEMO_IDS.companyC, title: "Backend Engineer (Go)", department: "Engineering", employmentType: "full-time", workMode: "remote", location: "Remote (India)", salaryMin: 1000000, salaryMax: 1800000, salaryCurrency: "INR", openings: 1, summary: "Build API layer in Go.", requirements: reqs.jobC1, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(30), updatedAt: daysAgo(22), publishedAt: daysAgo(22) },
  { id: DEMO_IDS.jobC2, companyId: DEMO_IDS.companyC, title: "Software Intern (Go/Python)", department: "Engineering", employmentType: "internship", workMode: "remote", location: "Remote (India)", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "INR", openings: 2, summary: "3-month internship.", requirements: reqs.jobC2, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(20), updatedAt: daysAgo(14), publishedAt: daysAgo(14) },
  { id: DEMO_IDS.jobC3, companyId: DEMO_IDS.companyC, title: "DevOps Engineer", department: "DevOps", employmentType: "full-time", workMode: "remote", location: "Remote (India)", salaryMin: 1200000, salaryMax: 2000000, salaryCurrency: "INR", openings: 1, summary: "Own AWS + Kubernetes infrastructure.", requirements: reqs.jobC3, responsibilities: [], screeningConfig: defaultScreening, status: "published", createdAt: daysAgo(15), updatedAt: daysAgo(10), publishedAt: daysAgo(10) }
];
