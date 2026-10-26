import { describe, it, expect } from 'vitest';
import { readAndClassifyDocument } from '../../src/lib/resumeDocumentAgent';
import { validateResumeAuthenticity } from '../../src/lib/resumeValidator';
import { getCompanyEligibilityRule } from '../../src/data/market/companyEligibility';
import { analyzeRoleMatch, Company, Role } from '../../src/pages/demo/talentLensEngine';

describe('Resume Document Agent & Document Authenticity Intelligence', () => {
  const genuineResume = `
    Alex Rivera
    alex.rivera@example.com | (555) 123-4567 | github.com/alexrivera | linkedin.com/in/alexrivera
    San Francisco, CA

    PROFESSIONAL SUMMARY
    Senior Software Engineer with 5+ years of experience designing and scaling distributed backend systems and cloud infrastructure.

    WORK EXPERIENCE
    Stripe — Senior Software Engineer
    June 2021 – Present | San Francisco, CA
    • Architected and deployed distributed payment processing microservices handling $40M+ in daily transaction volume with 99.999% SLA.
    • Reduced p99 API response latency by 38% using Java 21, Redis cluster caching, and asynchronous event streaming with Apache Kafka.
    • Led migration of 14 core legacy services to Kubernetes on AWS, cutting monthly infrastructure spend by $120,000.
    • Mentored 5 junior engineers and established zero-downtime blue/green deployment workflows.

    DoorDash — Software Engineer II
    August 2019 – May 2021 | San Francisco, CA
    • Built real-time dispatch routing engine in Golang and PostgreSQL processing 45,000 requests/minute.
    • Engineered automated fraud detection rules pipeline, reducing fraudulent delivery claims by 24%.

    TECHNICAL SKILLS
    Languages: Java, Golang, Python, TypeScript, SQL
    Backend & Cloud: Spring Boot, Node.js, AWS, Kubernetes, Docker, Kafka, Redis, PostgreSQL
    Methodologies: Microservices, Distributed Systems, CI/CD, System Design, Unit Testing

    EDUCATION
    University of California, Berkeley
    Bachelor of Science in Computer Science | 2015 – 2019
    GPA: 3.8 / 4.0
  `;

  const studentAssignment = `
    CS 401: Advanced Operating Systems
    Homework Assignment 3: Distributed Synchronization & Semaphores
    Submitted by: Rohan Sharma (Roll No: 2021CSB1042)
    Instructor: Prof. K. V. Ramanathan
    Due Date: October 24, 2026

    Problem Statement:
    In this assignment, we examine the Readers-Writers problem using POSIX semaphores in C++.
    Explain how reader starvation can occur when writers are given priority.

    Solution:
    When multiple reader threads arrive continuously, a writer thread may wait indefinitely
    if priority is not inverted. We implement a monitor pattern with condition variables.
    
    Question 2:
    Calculate the memory overhead of maintaining page tables with a 4-level paging hierarchy
    on an x86-64 Linux kernel.
  `;

  const billingInvoice = `
    TAX INVOICE
    Invoice Number: INV-2026-9042
    Date: 2026-10-14
    Bill To: TechCorp Solutions Pvt Ltd
    GSTIN: 27AABCT3518Q1Z4
    Order ID: ORD-8849102

    Item Description                      Qty    Unit Price    Total
    1. Cloud Dedicated Hosting (Linux)     2     $450.00       $900.00
    2. Managed PostgreSQL Instance         1     $250.00       $250.00
    3. SSL Wildcard Certificate            1     $120.00       $120.00

    Subtotal: $1,270.00
    Tax (18%): $228.60
    Total Amount Due: $1,498.60
    Payment Method: Corporate Credit Card
  `;

  const researchEssay = `
    A Comparative Evaluation of Transformer Attention Mechanisms in Low-Resource NLP
    Abstract:
    In this paper, we explore the computational complexity of quadratic self-attention
    versus linear attention approximations. We survey recent architectures including
    FlashAttention-2 and state space models.

    1. Introduction
    Recent advances in natural language processing have enabled massive generative models.
    However, context window scaling remains bounded by quadratic VRAM consumption.

    2. Methodology
    We benchmark inference throughput on an NVIDIA H100 cluster across sequence lengths
    ranging from 2,048 to 128,000 tokens.

    3. References
    Vaswani et al., Attention Is All You Need, 2017.
    Dao et al., FlashAttention: Fast and Memory-Efficient Exact Attention, 2022.
  `;

  it('classifies genuine technical resumes as isValidResume = true with documentType: resume', () => {
    const report = readAndClassifyDocument(genuineResume);
    expect(report.isValidResume).toBe(true);
    expect(report.documentType).toBe('resume');
    expect(report.confidenceScore).toBeGreaterThanOrEqual(75);
    expect(report.sectionsFound).toContain('Experience');
    expect(report.sectionsFound).toContain('Education');
    expect(report.sectionsFound).toContain('Skills');
    expect(report.contactSignals.hasEmail).toBe(true);
    expect(report.hasChronologicalDates).toBe(true);
  });

  it('detects academic assignments and rejects them as non-resume', () => {
    const report = readAndClassifyDocument(studentAssignment);
    expect(report.isValidResume).toBe(false);
    expect(report.documentType).toBe('academic_assignment');
    expect(report.documentTypeLabel).toContain('Academic Assignment');
    expect(report.refusalReason).toBeDefined();
    expect(report.diagnostics.length).toBeGreaterThan(0);
  });

  it('detects invoices and financial documents and rejects them as non-resume', () => {
    const report = readAndClassifyDocument(billingInvoice);
    expect(report.isValidResume).toBe(false);
    expect(report.documentType).toBe('invoice_or_receipt');
    expect(report.refusalReason).toContain('Invoice');
  });

  it('detects research papers and essays and rejects them as non-resume', () => {
    const report = readAndClassifyDocument(researchEssay);
    expect(report.isValidResume).toBe(false);
    expect(report.documentType).toBe('research_paper_or_essay');
    expect(report.refusalReason).toBeDefined();
  });

  it('halts calibration and returns 0% (unscoreable) when evaluating non-resume assignment in analyzeRoleMatch', () => {
    const mockCompany: Company = {
      id: 'microsoft',
      name: 'Microsoft',
      logo: '',
      gradient: '',
      industry: 'Technology',
      hq: 'Redmond, WA',
      tier: 'FAANG',
      roles: [],
    };

    const mockRole: Role = {
      id: 'sde-2',
      title: 'Software Engineer II (SDE-2)',
      level: 'L61',
      desc: 'Build scalable Azure services in C++ or Java.',
      competencies: ['java', 'distributed_systems', 'cloud'],
      reqLevel: { java: 'strong', distributed_systems: 'strong', cloud: 'working' },
    };

    const result = analyzeRoleMatch(studentAssignment, mockCompany, mockRole);
    expect(result.isValidResume).toBe(false);
    expect(result.score).toBe(0);
    expect(result.readinessLabel).toBe('Far');
    expect(result.invalidReason).toBeDefined();
    expect(result.invalidReason).toContain('Academic Assignment');
    expect(result.trace.compositeDisplay).toBe(0);
  });
});

describe('Company Eligibility & Logo Synchronization', () => {
  it('resolves Microsoft eligibility with Microsoft companyId and 70% cutoff (never TCS)', () => {
    const rule = getCompanyEligibilityRule('microsoft');
    expect(rule.companyId).toBe('microsoft');
    expect(rule.displayName).toContain('Microsoft');
    expect(rule.aggregatePercent).toBe(70);
    expect(rule.cgpaEquivalent).toBe(7.0);
    expect(rule.displayName).not.toContain('TCS');
  });

  it('resolves Google eligibility with Google companyId and 65% cutoff', () => {
    const rule = getCompanyEligibilityRule('google');
    expect(rule.companyId).toBe('google');
    expect(rule.displayName).toContain('Google');
    expect(rule.aggregatePercent).toBe(65);
    expect(rule.displayName).not.toContain('TCS');
  });

  it('resolves Amazon eligibility with Amazon companyId and 65% cutoff', () => {
    const rule = getCompanyEligibilityRule('amazon');
    expect(rule.companyId).toBe('amazon');
    expect(rule.displayName).toContain('Amazon');
    expect(rule.aggregatePercent).toBe(65);
  });

  it('resolves TCS eligibility with TCS companyId and 60% cutoff', () => {
    const rule = getCompanyEligibilityRule('tcs');
    expect(rule.companyId).toBe('tcs');
    expect(rule.displayName).toContain('TCS');
    expect(rule.aggregatePercent).toBe(60);
  });

  it('resolves Infosys and Wipro eligibility without cross-company bleed', () => {
    const infosysRule = getCompanyEligibilityRule('infosys');
    expect(infosysRule.companyId).toBe('infosys');
    expect(infosysRule.displayName).toContain('Infosys');

    const wiproRule = getCompanyEligibilityRule('wipro');
    expect(wiproRule.companyId).toBe('wipro');
    expect(wiproRule.displayName).toContain('Wipro');
  });

  it('synthesizes consistent eligibility rule for any arbitrary company with matching companyId', () => {
    const credRule = getCompanyEligibilityRule('cred', 'unicorn');
    expect(credRule.companyId).toBe('cred');
    expect(credRule.displayName).toContain('Cred');
    expect(credRule.aggregatePercent).toBe(65);
  });
});
