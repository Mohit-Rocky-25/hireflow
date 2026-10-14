// ============================================================
// Credential & Opportunity Engine — In-Depth Briefs for Top 30
// Schema 2.0 Rich Details: Overview, Syllabus, Fees, Aid, Evidence, Pitfalls & Sources
// ============================================================

import { OpportunityRecord } from '../types';

export const CURATED_TOP_30_BRIEFS: Record<string, Partial<OpportunityRecord>> = {
  // 1. Google Summer of Code (GSoC)
  'opp-gsoc': {
    trust: 'verified_official',
    flags: ['open_now', 'paid_stipend', 'best_value'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free application. Selected contributors receive competitive PPP stipend (~₹1,65,000 to ₹2,50,000 INR in India).',
    },
    stipendDisplay: {
      headline: '₹1,65,000 – ₹2,50,000 INR (India PPP)',
      note: 'Paid in two milestone disbursements directly via Payoneer upon passing evaluations.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Google provides monthly living stipends tailored to Indian purchasing power parity (PPP).',
      steps: [
        'Engage 2-3 months early in chosen open-source organization channels (IRC, Discord, Slack, Zulip).',
        'Contribute 2-3 merged pull requests (good-first-issues or test coverage) before proposal deadline.',
        'Draft technical design proposal adhering to the organization-specific Google Doc template.',
        'Submit official application on the Google Summer of Code portal before the April deadline.',
      ],
    },
    windows: [
      { label: 'Mentoring Orgs Announced', status: 'open', date: 'February Annually' },
      { label: 'Contributor Proposals Open', status: 'open_now', date: 'March – April Annually' },
      { label: 'Coding Period Sprints', status: 'upcoming', date: 'May – August (12 to 22 weeks)' },
    ],
    richDetails: {
      overview: 'Google Summer of Code is a premier global open-source program that brings student and beginner developers into open-source software organizations (Apache, Linux Foundation, Python, Mozilla, Chromium). Selected contributors complete a 175-hour or 350-hour engineering project with 1:1 mentorship from veteran maintainers.',
      what_it_covers: [
        'Production open-source architecture in languages like C++, Go, Rust, Python, and TypeScript',
        'Git branch workflows, PR etiquette, rebase conflict resolution, and CI/CD pipelines',
        'Writing comprehensive unit and integration test suites conforming to repository invariants',
        'Distributed systems asynchronous communication and open RFC technical documentation',
      ],
      format: {
        delivery: 'Online, asynchronous remote mentorship',
        style: '12-week standard (175h) or 22-week extended (350h) production engineering sprint',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Application Fee', inr: 0, usd: 0 },
        { item: 'Contributor Stipend (Disbursed to Student)', inr: 210000, usd: 2500 },
      ],
      validity_renewal: 'Lifetime prestigious credential verifiable on Google Summer of Code official archive.',
      prerequisites: 'Comfortable with Git/GitHub, strong proficiency in at least one systems or web language, clear written English communication.',
      eligibility: '18+ years of age, open to university students and early-career developers new to open source.',
      how_to_apply: [
        'Explore organizations from previous GSoC cohorts matching your tech stack.',
        'Join developer chat channels, introduce yourself, and pick beginner-friendly unresolved issues.',
        'Submit clean, well-tested PRs to demonstrate commitment and codebase understanding.',
        'Draft a milestone-based project proposal with estimated weekly deliverables and solicit maintainer feedback.',
        'Submit final proposal on summerofcode.withgoogle.com before the cutoff timestamp.',
      ],
      timeline: [
        { label: 'Organization Application Period', status: 'past', date: 'Jan – Feb' },
        { label: 'Student Proposal Submissions', status: 'open_now', date: 'March – April' },
        { label: 'Accepted Contributors Announced', status: 'upcoming', date: 'Early May' },
        { label: 'Community Bonding & Coding', status: 'upcoming', date: 'May – Sept' },
      ],
      student_aid_steps: [
        'No exam or application fees required.',
        'Set up a verified Payoneer account connected to an Indian bank savings account for swift automated INR wire transfers.',
      ],
      resume_evidence: {
        attach: [
          'Direct link to official GSoC Archive Profile',
          'Merged Pull Request permalinks on upstream open-source GitHub organization',
          'Final project submission gist detailing architectural design and performance metrics',
        ],
        line_template: 'Google Summer of Code Contributor @ [Organization] | Engineered [Feature/Module] across [X] merged PRs, improving [metric/latency] by [Y]% and authoring [Z] integration tests.',
      },
      pitfalls: [
        'Submitting generic, copy-pasted proposals without engaging with the organization community beforehand.',
        'Disappearing after receiving the initial milestone stipend; maintainers evaluate mid-term progress strictly.',
        'Over-promising scope instead of breaking down a realistic, test-backed architecture.',
      ],
      sources: [
        {
          title: 'Google Summer of Code Official Guide',
          url: 'https://summerofcode.withgoogle.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'timeline', 'eligibility'],
        },
      ],
    },
  },

  // 2. Smart India Hackathon (SIH)
  'opp-sih': {
    trust: 'verified_official',
    flags: ['open_now', 'best_value', 'hiring_pipeline'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free Government of India national initiative. Travel and accommodation subsidized for finalists.',
    },
    rewardDisplay: {
      headline: '₹1,00,000 INR per Problem Statement Winner',
      note: 'Direct PPIs and hiring fast-tracks from partnering ministries, PSUs, and enterprise sponsors.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'MoE Innovation Cell reimburses train travel allowances and provides food/stay at Nodal Centers.',
      steps: [
        'Form a mandatory 6-member team with at least 1 female teammate.',
        'Pitch your solution at your College Internal Hackathon conducted by your college SPOC.',
        'College SPOC nominates top selected teams on the official sih.gov.in portal.',
        'Selected finalists travel to designated All-India Nodal Centers for a 36-hour non-stop Grand Finale.',
      ],
    },
    windows: [
      { label: 'College SPOC Registration & Problem Statements', status: 'open', date: 'August – September' },
      { label: 'Idea Submission & Internal Hackathons', status: 'open_now', date: 'September – October' },
      { label: 'National Grand Finale (36h Hackathon)', status: 'upcoming', date: 'November – December' },
    ],
    richDetails: {
      overview: 'Smart India Hackathon (SIH) is the world\'s largest open innovation model launched by the Ministry of Education (MoE), AICTE, and MIC. Over 50,000 collegiate teams compete on real-world challenges submitted by Central Ministries, State Governments, PSUs, and top industries.',
      what_it_covers: [
        'Full-stack software application development or IoT/embedded hardware prototyping',
        'API security, encrypted database schemas, and role-based access control (RBAC)',
        'Resilient architecture handling rural/offline network conditions and regional languages',
        'Live 36-hour continuous sprint under technical jury evaluation from Ministry domain experts',
      ],
      format: {
        delivery: 'Hybrid (Online college nomination + 36h in-person Nodal Center sprint)',
        style: '36-hour non-stop hackathon with 3 iterative jury mentoring rounds',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Registration Fee', inr: 0, usd: 0 },
        { item: 'Travel & Accommodation at Nodal Center', inr: 0, note: 'Provided / subsidized by MoE' },
      ],
      validity_renewal: 'Permanent national milestone recognition with Ministry certificate and cash awards.',
      prerequisites: 'Strong team composition: 2 backend devs, 1 frontend/UI dev, 1 AI/data specialist, 1 mobile/hardware engineer, 1 pitch presenter.',
      eligibility: 'Regular bona fide students in AICTE/UGC approved institutes in India. 6 members with >= 1 female member.',
      how_to_apply: [
        'Study published Problem Statements on sih.gov.in and download technical requirements.',
        'Build a functional proof of concept before the internal college hackathon.',
        'Win college internal selection (AICTE enforces a cap of nominations per college).',
        'Have college Single Point of Contact (SPOC) upload PPT and prototype documentation on SIH portal.',
        'Prepare deployment scripts, live demo servers, and pitch deck for national finale.',
      ],
      timeline: [
        { label: 'Problem Statements Released', status: 'past', date: 'Aug' },
        { label: 'College Internal Hackathons', status: 'open_now', date: 'Sept – Oct' },
        { label: 'Grand Finale Nodal Center Sprint', status: 'upcoming', date: 'Nov – Dec' },
      ],
      student_aid_steps: [
        'No fees whatsoever. Keep rail booking tickets safe for Nodal Center travel allowance claims.',
      ],
      resume_evidence: {
        attach: [
          'Official SIH Ministry of Education Certificate with Verification QR code',
          'GitHub repository containing the complete full-stack implementation',
          'Live deployed prototype link on AWS/Vercel/Railway demonstrated during Grand Finale',
        ],
        line_template: 'Smart India Hackathon Finalist / Winner | Architected [Project Name] for [Ministry/Problem Statement ID], deploying [Tech Stack] serving [Feature] with 36h non-stop SLA.',
      },
      pitfalls: [
        'Presenting slides and Figma mockups during evaluation instead of a running, clickable prototype with realistic mock data.',
        'Ignoring the mandatory female team member rule which leads to immediate automated disqualification.',
        'Failing to implement jury feedback given during Round 1 and Round 2 mentoring reviews.',
      ],
      sources: [
        {
          title: 'Smart India Hackathon Official Portal',
          url: 'https://www.sih.gov.in/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['rules', 'dates', 'rewards'],
        },
      ],
    },
  },

  // 3. AWS Certified Cloud Practitioner (CLF-C02)
  'opp-aws-ccp': {
    trust: 'verified_official',
    flags: ['best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 100,
      inr_official: 8680,
      priceConfidence: 'verified',
      note: '$100 USD (~₹8,680 INR). Indian students can unlock 50% discount vouchers via AWS Educate & AWS Academy.',
    },
    studentAid: {
      available: true,
      summary: 'AWS Educate / AWS Academy provides 50% discount vouchers to enrolled students in India.',
      steps: [
        'Sign up for AWS Educate using your institutional (.edu / .ac.in) email address.',
        'Complete the Cloud Foundations learning pathway and earn the digital badge.',
        'Claim the 50% Pearson VUE exam discount voucher code in the student benefits tab.',
        'Schedule your proctored online exam on Pearson VUE using the voucher code.',
      ],
    },
    windows: [{ label: 'Always Open (Pearson VUE Online / In-Person)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'AWS Certified Cloud Practitioner validates overall understanding of the AWS Cloud platform, covering foundational cloud concepts, core security and compliance models, cloud economics, billing, and fundamental architectural best practices.',
      what_it_covers: [
        'Cloud concepts: high availability, elasticity, fault tolerance, and shared responsibility model',
        'AWS Cloud security: IAM policies, MFA, KMS, AWS Shield, WAF, and compliance frameworks',
        'Core AWS services: EC2, S3, RDS, Lambda, VPC, CloudFront, Route 53, and DynamoDB',
        'Cloud economics and billing: Cost Explorer, AWS Budgets, Pricing Calculator, and Support tiers',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE test center',
        style: '65 Multiple-choice / multiple-response questions in 90 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Standard Exam Registration', usd: 100, inr: 8680 },
        { item: 'With 50% Student Voucher (AWS Academy)', usd: 50, inr: 4340 },
      ],
      validity_renewal: 'Valid for 3 years. Passing any AWS Associate exam automatically recertifies Cloud Practitioner.',
      prerequisites: 'Basic knowledge of IT services and general cloud computing concepts.',
      eligibility: 'Open to everyone globally.',
      how_to_apply: [
        'Create an AWS Certification account on aws.training/certification.',
        'Opt-in for AWS Academy or AWS Educate courses through your college to obtain a 50% voucher.',
        'Schedule the exam on Pearson VUE and complete ID verification requirements.',
      ],
      timeline: [{ label: 'On-Demand Scheduling', status: 'open', date: 'Any day of the year' }],
      student_aid_steps: [
        'Enroll in AWS Academy Cloud Foundations via your college professor.',
        'Request 50% off voucher code before scheduling exam on Pearson VUE.',
      ],
      resume_evidence: {
        attach: ['Credly Digital Badge verification URL', 'Official AWS Certified Transcript PDF'],
        line_template: 'AWS Certified Cloud Practitioner (CLF-C02) | Verified foundational knowledge of AWS architectural principles, IAM security governance, and multi-tier cloud infrastructure.',
      },
      pitfalls: [
        'Confusing AWS managed services vs customer responsibilities in the Shared Responsibility Model.',
        'Overpaying full $100 price when 50% student discounts are readily available through college programs.',
      ],
      sources: [
        {
          title: 'AWS Certified Cloud Practitioner Official Exam Guide',
          url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_format', 'pricing', 'domains'],
        },
      ],
    },
  },

  // 4. AWS Certified Solutions Architect – Associate (SAA-C03)
  'opp-aws-saa': {
    trust: 'verified_official',
    flags: ['best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 150,
      inr_official: 13020,
      priceConfidence: 'verified',
      note: '$150 USD (~₹13,020 INR). 50% discount vouchers unlock after passing Cloud Practitioner or via AWS Academy.',
    },
    studentAid: {
      available: true,
      summary: 'Pass AWS CCP first to receive an automatic 50% discount voucher for SAA-C03 ($75 USD / ~₹6,510 INR).',
      steps: [
        'Pass any prior AWS exam to receive an automatic 50% off voucher in your AWS Certification portal benefits tab.',
        'Alternatively, join AWS Academy through your engineering institution.',
      ],
    },
    windows: [{ label: 'Always Open (On-demand Pearson VUE)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'AWS Certified Solutions Architect – Associate (SAA-C03) is the gold standard cloud credential for software and DevOps engineers. It validates architectural judgment across resilient, high-performing, secure, and cost-optimized multi-tier designs on AWS.',
      what_it_covers: [
        'Design Resilient Architectures: Multi-AZ failover, Auto Scaling, decoupled microservices with SQS/SNS',
        'Design High-Performing Architectures: Elastic Load Balancing (ALB/NLB), ElastiCache Redis, RDS Aurora read replicas',
        'Design Secure Applications: VPC peering, Transit Gateway, Security Groups, NACLs, IAM least-privilege, AWS KMS encryption',
        'Design Cost-Optimized Architectures: S3 storage tiers, EC2 Spot instances, Savings Plans, and serverless Lambda economics',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE test center',
        style: '65 Scenario-based multiple-choice and multi-select questions in 130 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Standard Exam Fee', usd: 150, inr: 13020 },
        { item: 'With 50% AWS Voucher (Previous Exam or Academy)', usd: 75, inr: 6510 },
      ],
      validity_renewal: 'Valid for 3 years. Recertify by taking the current exam or passing the Professional level.',
      prerequisites: 'Hands-on familiarity with AWS compute, networking, storage, and database services.',
      eligibility: 'Open to everyone globally.',
      how_to_apply: [
        'Study official AWS Well-Architected Framework whitepapers and SAA-C03 exam guide.',
        'Build real projects on AWS Free Tier (VPC with public/private subnets, RDS, ALB, and EC2).',
        'Schedule test on Pearson VUE via AWS Training & Certification portal.',
      ],
      timeline: [{ label: 'On-Demand Scheduling', status: 'open', date: 'Year-round' }],
      student_aid_steps: [
        'Apply the 50% discount promo code at the Pearson VUE checkout screen.',
      ],
      resume_evidence: {
        attach: [
          'Credly Digital Badge URL (Verifiable Certificate ID)',
          'GitHub repo featuring Terraform/CloudFormation code defining a 3-tier VPC architecture on AWS',
        ],
        line_template: 'AWS Certified Solutions Architect – Associate (SAA-C03) | Designed resilient multi-AZ cloud infrastructures on AWS utilizing VPC, ALB, ECS, and Aurora with automated SQS decoupling.',
      },
      pitfalls: [
        'Memorizing question dumps instead of understanding service limits and architectural trade-offs.',
        'Neglecting VPC routing table, NAT Gateway, and subnet security configuration questions.',
      ],
      sources: [
        {
          title: 'AWS Certified Solutions Architect Associate Page',
          url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['domains', 'format', 'pricing'],
        },
      ],
    },
  },

  // 5. AWS Certified Developer – Associate (DVA-C02)
  'opp-aws-dva': {
    trust: 'verified_official',
    flags: ['best_value'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 150,
      inr_official: 13020,
      priceConfidence: 'verified',
      note: '$150 USD (~₹13,020 INR). 50% discount voucher available via prior AWS exams or AWS Academy.',
    },
    studentAid: {
      available: true,
      summary: '50% discount voucher applicable from prior AWS certification benefits.',
      steps: ['Log in to your AWS Certification account and retrieve voucher code from the Benefits tab.'],
    },
    windows: [{ label: 'Year-round Pearson VUE', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'AWS Certified Developer – Associate validates technical competence in developing, deploying, and debugging cloud-based applications using AWS services, with emphasis on serverless (Lambda, API Gateway, DynamoDB) and containerized workflows.',
      what_it_covers: [
        'Deployment: CI/CD with AWS CodePipeline, CodeBuild, CodeDeploy, Elastic Beanstalk, and CloudFormation',
        'Security: IAM roles for EC2/Lambda, Secrets Manager, Systems Manager Parameter Store, Cognito User Pools',
        'Development with AWS Services: Serverless architectures with Lambda, API Gateway, DynamoDB single-table design, SQS, SNS',
        'Refactoring and Monitoring: AWS X-Ray distributed tracing, CloudWatch Logs/Metrics, and VPC endpoints',
      ],
      format: {
        delivery: 'Online proctored or test center',
        style: '65 Multiple-choice / scenario questions in 130 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard Exam Fee', usd: 150, inr: 13020 }],
      validity_renewal: 'Valid for 3 years.',
      prerequisites: 'Working knowledge of at least one high-level programming language and basic AWS SDK usage.',
      eligibility: 'Open globally.',
      how_to_apply: ['Book proctored exam via Pearson VUE on aws.training/certification.'],
      timeline: [{ label: 'Rolling Availability', status: 'open', date: 'Continuous' }],
      resume_evidence: {
        attach: ['Credly Badge URL', 'Serverless application repository deployed via AWS SAM or CDK'],
        line_template: 'AWS Certified Developer – Associate (DVA-C02) | Engineered serverless backend APIs utilizing AWS Lambda, API Gateway, and DynamoDB with distributed tracing via AWS X-Ray.',
      },
      pitfalls: ['Overlooking DynamoDB partition key/sort key design and secondary index query patterns.'],
      sources: [
        {
          title: 'AWS Certified Developer Associate Exam Guide',
          url: 'https://aws.amazon.com/certification/certified-developer-associate/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_objectives', 'pricing'],
        },
      ],
    },
  },

  // 6. Google Associate Cloud Engineer (GCP ACE)
  'opp-gcp-ace': {
    trust: 'verified_official',
    flags: ['best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 125,
      inr_official: 10850,
      priceConfidence: 'verified',
      note: '$125 USD (~₹10,850 INR). Indian students can earn 100% free vouchers via Google Cloud Arcade and GDSC campaigns.',
    },
    studentAid: {
      available: true,
      summary: 'Participate in Google Cloud Career Readiness Program or Google Cloud Arcade to unlock 100% free exam vouchers.',
      steps: [
        'Join the Google Developer Student Clubs (GDSC) Google Cloud study jams on campus.',
        'Complete required skill badges on Google Cloud Skills Boost.',
        'Receive official Google-sponsored 100% exam voucher token for Kryterion Webassessor.',
      ],
    },
    windows: [{ label: 'Always Open (Kryterion Webassessor)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'The Google Associate Cloud Engineer exam assesses ability to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud Platform, using both the Google Cloud Console and the gcloud command-line interface.',
      what_it_covers: [
        'Setting up a cloud solution environment: projects, billing accounts, IAM roles, and organizations',
        'Planning and configuring a cloud solution: Compute Engine VMs, Google Kubernetes Engine (GKE), Cloud Run, Cloud Functions',
        'Deploying and implementing cloud solutions: VPC networking, Cloud Storage buckets, Cloud SQL, BigQuery datasets',
        'Ensuring successful operation of a cloud solution: Cloud Monitoring alerts, Cloud Logging, and gcloud CLI commands',
      ],
      format: {
        delivery: 'Online proctored or in-person at Kryterion testing centers',
        style: '50-60 Multiple-choice and multiple-select questions in 120 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Standard Exam Fee', usd: 125, inr: 10850 },
        { item: 'With Google Cloud Arcade Voucher', usd: 0, inr: 0 },
      ],
      validity_renewal: 'Valid for 3 years. Renew by retaking the exam.',
      prerequisites: '6+ months of hands-on experience with Google Cloud console and gcloud command line.',
      eligibility: 'Open globally.',
      how_to_apply: ['Register account on Webassessor (Kryterion) and book exam with or without voucher.'],
      timeline: [{ label: 'Rolling Availability', status: 'open', date: 'Year-round' }],
      student_aid_steps: [
        'Complete Google Cloud Arcade milestones to claim voucher from the Arcade prize counter.',
      ],
      resume_evidence: {
        attach: ['Google Cloud Certified Credential URL', 'GKE deployment manifest repository'],
        line_template: 'Google Associate Cloud Engineer (GCP ACE) | Configured enterprise GKE clusters, Cloud Run microservices, and IAM role security policies via gcloud CLI and Terraform.',
      },
      pitfalls: ['Not knowing the exact gcloud syntax and IAM predefined vs primitive roles.'],
      sources: [
        {
          title: 'Google Associate Cloud Engineer Exam Guide',
          url: 'https://cloud.google.com/learn/certification/cloud-engineer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_guide', 'pricing', 'retake_policy'],
        },
      ],
    },
  },

  // 7. Microsoft Azure Fundamentals (AZ-900)
  'opp-ms-az900': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 55,
      inr_official: 4800,
      priceConfidence: 'verified',
      note: 'India specific pricing is $55 USD (~₹4,800 INR). Indian students can take it 100% FREE via Microsoft Learn Student Ambassadors & Virtual Training Days.',
    },
    studentAid: {
      available: true,
      summary: '100% Free for eligible university students verifying academic status on Microsoft Learn.',
      steps: [
        'Log in to Microsoft Learn with a student (.ac.in / .edu) email.',
        'Complete Student Certification Verification on Microsoft Learn profile.',
        'Claim 100% discount voucher at Pearson VUE checkout automatically.',
      ],
    },
    windows: [{ label: 'Year-Round (Pearson VUE Online Proctored)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Microsoft Certified: Azure Fundamentals (AZ-900) validates foundational level knowledge of cloud services and how those services are provided with Microsoft Azure. Ideal for students starting their cloud journey.',
      what_it_covers: [
        'Cloud concepts: Cloud models, cloud benefits (scalability, elasticity, high availability), and cloud economics',
        'Azure architecture and services: Azure regions, availability zones, VMs, App Services, AKS, Azure Virtual Networks, and Blob Storage',
        'Azure management and governance: Microsoft Entra ID, Role-Based Access Control (RBAC), Azure Policy, and Cost Management',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE test center',
        style: '35-50 Multiple-choice and drag-and-drop questions in 45-65 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'India Subsidized Student Fee', inr: 4800, usd: 55 },
        { item: 'With Microsoft Student Verified Waiver', inr: 0, usd: 0 },
      ],
      validity_renewal: 'Never expires. Azure Fundamentals is a lifetime foundational certification.',
      prerequisites: 'Basic computer science awareness; no formal cloud experience required.',
      eligibility: 'Open to everyone.',
      how_to_apply: ['Complete official free learning paths on Microsoft Learn and book on Pearson VUE.'],
      timeline: [{ label: 'Rolling Availability', status: 'open', date: 'Year-round' }],
      student_aid_steps: [
        'Complete academic verification on Microsoft Learn to apply 100% discount.',
      ],
      resume_evidence: {
        attach: ['Microsoft Learn Verified Credential link', 'Credly Digital Badge'],
        line_template: 'Microsoft Certified: Azure Fundamentals (AZ-900) | Mastered Azure cloud architecture, Microsoft Entra ID access controls, and multi-tier cloud workload governance.',
      },
      pitfalls: ['Paying full price without verifying student credentials on Microsoft Learn.'],
      sources: [
        {
          title: 'Microsoft Azure Fundamentals AZ-900 Study Guide',
          url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_syllabus', 'pricing'],
        },
      ],
    },
  },

  // 8. Microsoft Azure AI Fundamentals (AI-900)
  'opp-ms-ai900': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 55,
      inr_official: 4800,
      priceConfidence: 'verified',
      note: '$55 USD India price. 100% Free with Microsoft Student Verification or Microsoft AI Odyssey.',
    },
    studentAid: {
      available: true,
      summary: '100% free via Microsoft Student Certification or Microsoft AI Tour vouchers in India.',
      steps: [
        'Sign up for Microsoft Learn AI-900 learning path.',
        'Verify university status on Microsoft Learn.',
        'Apply voucher at Pearson VUE checkout.',
      ],
    },
    windows: [{ label: 'Year-round on-demand', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Microsoft Certified: Azure AI Fundamentals demonstrates foundational knowledge of Machine Learning and Artificial Intelligence concepts and related Microsoft Azure services, including Azure OpenAI, Cognitive Services, and Computer Vision.',
      what_it_covers: [
        'Artificial Intelligence workloads and considerations: Fairness, reliability, privacy, and responsible AI principles',
        'Fundamental principles of machine learning on Azure: Automated ML, Azure Machine Learning designer, model evaluation',
        'Features of computer vision workloads on Azure: Image classification, object detection, OCR with Azure AI Vision',
        'Features of Natural Language Processing (NLP) & Generative AI on Azure: Azure OpenAI Service, sentiment analysis, conversational AI',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE test center',
        style: '40-50 Questions in 60 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard India Price', inr: 4800, usd: 55 }],
      validity_renewal: 'Lifetime valid foundational certification.',
      prerequisites: 'Basic programming literacy and curiosity in AI/ML.',
      eligibility: 'Open globally.',
      how_to_apply: ['Schedule via Microsoft Learn Pearson VUE link.'],
      timeline: [{ label: 'On-Demand', status: 'open', date: 'Continuous' }],
      resume_evidence: {
        attach: ['Credly Digital Badge', 'Azure OpenAI prompt engineering repository'],
        line_template: 'Microsoft Certified: Azure AI Fundamentals (AI-900) | Validated understanding of machine learning pipelines, Azure OpenAI generative models, and responsible AI governance.',
      },
      pitfalls: ['Overlooking Microsoft Responsible AI principles (Fairness, Inclusiveness, Transparency).'],
      sources: [
        {
          title: 'Microsoft Azure AI Fundamentals AI-900 Page',
          url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'pricing'],
        },
      ],
    },
  },

  // 9. Google Cloud Professional Data Engineer (GCP PDE)
  'opp-gcp-pde': {
    trust: 'verified_official',
    flags: ['hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 200,
      inr_official: 17360,
      priceConfidence: 'verified',
      note: '$200 USD (~₹17,360 INR). Highly regarded by Big Tech & Data Engineering consultancies.',
    },
    studentAid: {
      available: true,
      summary: 'Google Cloud Skills Boost and university research labs frequently provide 50% discount vouchers.',
      steps: ['Participate in Google Cloud Career Readiness track for collegiate data engineers.'],
    },
    windows: [{ label: 'Year-round Webassessor', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Google Cloud Professional Data Engineer validates ability to design, build, operationalize, secure, and monitor data processing systems on Google Cloud, emphasizing BigQuery, Dataflow (Apache Beam), Dataproc, and Pub/Sub.',
      what_it_covers: [
        'Designing data processing systems: BigQuery schema partitioning and clustering, Cloud Bigtable key design',
        'Ingesting and processing data: Real-time streaming with Pub/Sub and Dataflow, batch ETL with Dataproc Spark/Hadoop',
        'Storing data: Selecting appropriate storage systems based on read/write latency and scalability (Spanner vs Bigtable vs BigQuery)',
        'Securing and managing data: Column-level encryption, Authorized Views, IAM governance, and Data Loss Prevention (DLP)',
      ],
      format: {
        delivery: 'Online proctored or test center',
        style: '50-60 Complex scenario-based questions in 120 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard Exam Fee', usd: 200, inr: 17360 }],
      validity_renewal: 'Valid for 2 years.',
      prerequisites: 'Solid hands-on experience in SQL, distributed data architectures, and streaming pipelines.',
      eligibility: 'Open globally.',
      how_to_apply: ['Book through Kryterion Webassessor Google Cloud portal.'],
      timeline: [{ label: 'On-Demand', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['Official GCP Certificate Link', 'BigQuery analytical pipeline GitHub repo'],
        line_template: 'Google Cloud Professional Data Engineer | Architected streaming analytics pipeline processing [X] msgs/sec with Pub/Sub and Dataflow, optimizing BigQuery partitioned storage costs by [Y]%.',
      },
      pitfalls: ['Underestimating Apache Beam / Dataflow windowing and watermarking concepts.'],
      sources: [
        {
          title: 'Google Cloud Professional Data Engineer Exam Guide',
          url: 'https://cloud.google.com/learn/certification/data-engineer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_guide', 'pricing'],
        },
      ],
    },
  },

  // 10. CompTIA Security+ (SY0-701)
  'opp-comptia-sec': {
    trust: 'verified_official',
    flags: ['hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 404,
      inr_official: 35067,
      priceConfidence: 'verified',
      note: '$404 standard price. Indian students get substantial academic discount via CompTIA Academic Store (~$250 USD / ~₹21,700 INR).',
    },
    studentAid: {
      available: true,
      summary: 'CompTIA Academic Marketplace offers up to 40% discount for students with valid college ID / email.',
      steps: [
        'Visit academic-store.comptia.org and verify student enrollment via SheerID with your college identity card.',
        'Purchase academic student voucher code.',
        'Schedule test on Pearson VUE using academic voucher.',
      ],
    },
    windows: [{ label: 'Year-Round (Pearson VUE)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'CompTIA Security+ (SY0-701) is the globally benchmarked baseline cybersecurity credential compliant with ISO 17024 and approved by the US Department of Defense (DoD Directive 8140/8570.01-M). Essential for InfoSec, SOC Analyst, and Security Engineering roles.',
      what_it_covers: [
        'General Security Concepts: Zero Trust architecture, CIA triad, cryptographic algorithms (AES, RSA, ECC, hashing)',
        'Threats, Vulnerabilities, and Mitigations: Malware, social engineering, buffer overflows, SQLi, and CVE threat hunting',
        'Security Architecture: Network segmentation, firewalls, SIEM, SOAR, EDR, and cloud security governance',
        'Security Operations: Incident response playbooks, digital forensics evidence handling, vulnerability scanning',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE testing center',
        style: 'Maximum 90 questions (Performance-Based Questions PBQs + Multiple Choice) in 90 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Standard Commercial Price', usd: 404, inr: 35067 },
        { item: 'Academic Student Store Price', usd: 250, inr: 21700 },
      ],
      validity_renewal: 'Valid for 3 years. Renew via CEUs (Continuing Education Units) or higher certifications.',
      prerequisites: 'Network fundamentals and basic familiarity with OS security (Linux/Windows).',
      eligibility: 'Open globally.',
      how_to_apply: ['Buy student voucher from CompTIA Academic Marketplace and book on Pearson VUE.'],
      timeline: [{ label: 'Continuous', status: 'open', date: 'Year-round' }],
      resume_evidence: {
        attach: ['CompTIA Verification ID / Credly badge', 'GitHub security homelab or SOC report'],
        line_template: 'CompTIA Security+ (SY0-701) | Certified in Zero-Trust architecture, incident response protocols, cryptographic controls, and vulnerability remediation across hybrid IT environments.',
      },
      pitfalls: ['Panicking on the first 3-5 Performance-Based Questions (PBQs); flag them and return later.'],
      sources: [
        {
          title: 'CompTIA Security+ Exam Details',
          url: 'https://www.comptia.org/certifications/security',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_code', 'pricing', 'objectives'],
        },
      ],
    },
  },
};
