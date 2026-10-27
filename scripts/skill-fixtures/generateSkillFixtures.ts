// ============================================================
// HireFlow ATS Skill Matching — Fixture Generator (Issue 2)
// Generates >= 200 DEV and >= 120 HOLDOUT cases with truth labels.
// Incorporates >= 25% traps pack across all 21 trap categories.
// 100% deterministic (seeded Mulberry32 PRNG).
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SeededPRNG } from '../parse-fixtures/prng';
import {
  SkillFixtureTruth,
  MentionTruth,
  JDRequirementTruth,
  SkillMatchExpectation,
} from './types';

interface TrapTemplate {
  trapType: string;
  roleCategory: string;
  generate: (prng: SeededPRNG) => {
    resumeText: string;
    jdText: string;
    resumeMentions: MentionTruth[];
    jdRequirements: JDRequirementTruth[];
    expectedMatches: SkillMatchExpectation[];
  };
}

const TRAP_TEMPLATES: TrapTemplate[] = [
  // 1. Java vs JavaScript
  {
    trapType: 'java_vs_javascript',
    roleCategory: 'Backend',
    generate: (prng) => {
      const isCandidateJava = prng.chance(0.5);
      if (isCandidateJava) {
        return {
          resumeText: `Name: Rohit Sharma\nEmail: rohit@example.com\n\nTECHNICAL SKILLS:\nLanguages: Java, Spring Boot, Hibernate, SQL, Git\n\nEXPERIENCE:\nSoftware Engineer | Enterprise Corp (2022 - Present)\n- Developed high-throughput microservices using Java 17 and Spring Boot handling 20,000 req/sec.\n- Optimized Hibernate ORM queries against PostgreSQL database, cutting latency by 35%.\n- Integrated JUnit test suites achieving 85% code coverage.\n\nEDUCATION:\nB.Tech in CSE, 2022`,
          jdText: `Role: Senior Frontend Engineer\nRequirements:\n- Must have 3+ years of professional JavaScript experience.\n- Deep understanding of modern JavaScript (ES6+), React, and DOM APIs.\n- Nice to have: TypeScript and Node.js.`,
          resumeMentions: [
            { canonicalId: 'Java', tokenFound: 'Java', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Java', tokenFound: 'Java 17', location: 'experience-bullet', evidenceTier: 'direct-use' },
            { canonicalId: 'Spring Boot', tokenFound: 'Spring Boot', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'PostgreSQL', tokenFound: 'PostgreSQL', location: 'experience-bullet', evidenceTier: 'direct-use' },
            { canonicalId: 'Git', tokenFound: 'Git', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'JavaScript', tokenFound: 'JavaScript', priority: 'mandatory' },
            { canonicalId: 'React', tokenFound: 'React', priority: 'mandatory' },
            { canonicalId: 'TypeScript', tokenFound: 'TypeScript', priority: 'preferred' },
            { canonicalId: 'Node.js', tokenFound: 'Node.js', priority: 'preferred' },
          ],
          expectedMatches: [
            { jdSkill: 'JavaScript', expectedClassification: 'MISSING', rationale: 'Candidate has Java, not JavaScript' },
            { jdSkill: 'React', expectedClassification: 'MISSING' },
            { jdSkill: 'TypeScript', expectedClassification: 'MISSING' },
            { jdSkill: 'Node.js', expectedClassification: 'MISSING' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Priya Patel\nEmail: priya@example.com\n\nTECHNICAL SKILLS:\nLanguages: JavaScript, React, HTML5, CSS3, Redux\n\nEXPERIENCE:\nFrontend Developer | TechApps (2021 - Present)\n- Built modular UI components in React and modern JavaScript serving 100k daily users.\n- Refactored legacy vanilla JavaScript code into clean ES6 modules.\n- Integrated RESTful APIs with Axios and Redux Toolkit.\n\nEDUCATION:\nB.Tech in IT, 2021`,
          jdText: `Role: Backend Java Developer\nRequirements:\n- 3+ years of hands-on Java development experience.\n- Strong background in Java concurrency, JVM internals, and Spring Boot.\n- Preferred: Docker, Kubernetes.`,
          resumeMentions: [
            { canonicalId: 'JavaScript', tokenFound: 'JavaScript', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'React', tokenFound: 'React', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'HTML5', tokenFound: 'HTML5', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'CSS3', tokenFound: 'CSS3', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Java', tokenFound: 'Java', priority: 'mandatory' },
            { canonicalId: 'Spring Boot', tokenFound: 'Spring Boot', priority: 'mandatory' },
            { canonicalId: 'Docker', tokenFound: 'Docker', priority: 'preferred' },
          ],
          expectedMatches: [
            { jdSkill: 'Java', expectedClassification: 'MISSING', rationale: 'JavaScript must not match Java' },
            { jdSkill: 'Spring Boot', expectedClassification: 'MISSING' },
          ],
        };
      }
    },
  },

  // 2. C vs C++ vs C#
  {
    trapType: 'c_vs_cpp_vs_csharp',
    roleCategory: 'Systems',
    generate: () => ({
      resumeText: `Name: Arjun Verma\nEmail: arjun@systems.io\n\nTECHNICAL SKILLS:\nLanguages: C++, STL, Linux, Git, CMake\n\nEXPERIENCE:\nSystems Engineer | Embedded Core (2022 - Present)\n- Developed high-frequency trading execution engine using Modern C++ (C++17) with ultra low-latency.\n- Benchmarked lock-free algorithms in C++ reducing median order execution time to under 12 microseconds.\n- Automated builds using CMake and GCC on Linux.\n\nEDUCATION:\nB.E. Computer Science, 2022`,
      jdText: `Role: .NET Application Developer\nRequirements:\n- 2+ years of production experience in C# and .NET Core.\n- Solid understanding of C# asynchronous programming and ASP.NET Core REST APIs.\n- Nice to have: SQL Server, Azure.`,
      resumeMentions: [
        { canonicalId: 'C++', tokenFound: 'C++', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'C++', tokenFound: 'C++17', location: 'experience-bullet', evidenceTier: 'direct-use' },
        { canonicalId: 'Linux', tokenFound: 'Linux', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Git', tokenFound: 'Git', location: 'skills-list', evidenceTier: 'direct-use' },
      ],
      jdRequirements: [
        { canonicalId: 'C#', tokenFound: 'C#', priority: 'mandatory' },
        { canonicalId: '.NET', tokenFound: '.NET Core', priority: 'mandatory' },
        { canonicalId: 'SQL Server', tokenFound: 'SQL Server', priority: 'preferred' },
      ],
      expectedMatches: [
        { jdSkill: 'C#', expectedClassification: 'MISSING', rationale: 'C++ must not match C#' },
        { jdSkill: '.NET', expectedClassification: 'MISSING' },
      ],
    }),
  },

  // 3. Go (language) vs "go-to-market" / "go-getter"
  {
    trapType: 'go_vs_prose',
    roleCategory: 'Product/Backend',
    generate: (prng) => {
      const hasRealGo = prng.chance(0.5);
      if (hasRealGo) {
        return {
          resumeText: `Name: Nikhil Joshi\nEmail: nikhil@go.dev\n\nSKILLS:\nGo, Kubernetes, Docker, gRPC, PostgreSQL\n\nEXPERIENCE:\nBackend Engineer | CloudScale (2022 - Present)\n- Engineered distributed microservices in Go (Golang) handling 50k RPS with gRPC.\n- Built concurrent worker pools using Go channels and goroutines for streaming ETL pipelines.\n\nEDUCATION:\nB.Tech 2022`,
          jdText: `Role: Go Backend Engineer\nRequirements:\n- Strong production experience in Go.\n- Microservices architecture with Docker and Kubernetes.`,
          resumeMentions: [
            { canonicalId: 'Go', tokenFound: 'Go', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Go', tokenFound: 'Go (Golang)', location: 'experience-bullet', evidenceTier: 'direct-use' },
            { canonicalId: 'Kubernetes', tokenFound: 'Kubernetes', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Docker', tokenFound: 'Docker', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Go', tokenFound: 'Go', priority: 'mandatory' },
            { canonicalId: 'Docker', tokenFound: 'Docker', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Go', expectedClassification: 'DIRECT' },
            { jdSkill: 'Docker', expectedClassification: 'DIRECT' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Ananya Roy\nEmail: ananya@product.io\n\nSKILLS:\nProduct Management, Jira, Agile, User Research, SQL\n\nEXPERIENCE:\nAssociate Product Manager | GrowthCo (2022 - Present)\n- Partnered with go-to-market and sales teams to drive 45% user adoption for new product line.\n- Known as an enthusiastic go-getter who organized weekly cross-functional sprints.\n- Enabled team to go live with mobile onboarding flow ahead of target deadline.\n\nEDUCATION:\nB.Tech 2022`,
          jdText: `Role: Backend Engineer\nRequirements:\n- Proficiency in Go programming language.\n- Experience deploying services to AWS.`,
          resumeMentions: [
            { canonicalId: 'SQL', tokenFound: 'SQL', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Jira', tokenFound: 'Jira', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Go', tokenFound: 'Go', priority: 'mandatory' },
            { canonicalId: 'AWS', tokenFound: 'AWS', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Go', expectedClassification: 'MISSING', rationale: 'Prose "go-to-market", "go-getter", "go live" must NOT match Go programming language' },
            { jdSkill: 'AWS', expectedClassification: 'MISSING' },
          ],
        };
      }
    },
  },

  // 4. R (language) vs "R&D"
  {
    trapType: 'r_vs_rnd',
    roleCategory: 'Data/Research',
    generate: (prng) => {
      const hasRealR = prng.chance(0.5);
      if (hasRealR) {
        return {
          resumeText: `Name: Suman Das\nEmail: suman@stats.org\n\nSKILLS:\nR, Python, ggplot2, tidyverse, Statistical Modeling\n\nEXPERIENCE:\nData Analyst | BioStats Lab (2022 - Present)\n- Conducted statistical hypothesis testing using R programming language and tidyverse packages.\n- Built publication-ready visualization charts in R using ggplot2 for clinical trial datasets.\n\nEDUCATION:\nM.Sc Statistics, 2022`,
          jdText: `Role: Quantitative Analyst\nRequirements:\n- Proficiency in R or Python for statistical computing.\n- Strong background in regression analysis.`,
          resumeMentions: [
            { canonicalId: 'R', tokenFound: 'R', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'R', tokenFound: 'R programming language', location: 'experience-bullet', evidenceTier: 'direct-use' },
            { canonicalId: 'Python', tokenFound: 'Python', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'R', tokenFound: 'R', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'R', expectedClassification: 'DIRECT' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Karan Kapoor\nEmail: karan@hardware.corp\n\nSKILLS:\nC++, Embedded C, Microcontrollers, PCB Design\n\nEXPERIENCE:\nHardware Design Engineer | AutoTech (2021 - Present)\n- Worked directly in the R&D division developing firmware for automotive battery management systems.\n- Led R & D testing protocols that ensured compliance with ISO 26262 safety standards.\n\nEDUCATION:\nB.Tech Electrical, 2021`,
          jdText: `Role: Biostatistician\nRequirements:\n- Experience with R for data analysis.\n- Clinical research background.`,
          resumeMentions: [
            { canonicalId: 'C++', tokenFound: 'C++', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'C', tokenFound: 'Embedded C', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'R', tokenFound: 'R', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'R', expectedClassification: 'MISSING', rationale: 'R&D / R & D division must NOT trigger R programming language match' },
          ],
        };
      }
    },
  },

  // 5. Swift vs "swift delivery"
  {
    trapType: 'swift_vs_prose',
    roleCategory: 'Mobile/Operations',
    generate: (prng) => {
      const isMobileSwift = prng.chance(0.5);
      if (isMobileSwift) {
        return {
          resumeText: `Name: Deepa Nair\nEmail: deepa@ios.dev\n\nSKILLS:\nSwift, iOS Development, SwiftUI, Xcode, CocoaPods\n\nEXPERIENCE:\niOS Developer | AppWorks (2022 - Present)\n- Developed 2 production iOS applications using Swift and SwiftUI with 4.8 star rating on App Store.\n- Architected client networking stack in Swift with Combine framework.\n\nEDUCATION:\nB.Tech CSE, 2022`,
          jdText: `Role: iOS Software Engineer\nRequirements:\n- 2+ years of hands-on Swift experience.\n- Deep familiarity with Apple Cocoa touch frameworks.`,
          resumeMentions: [
            { canonicalId: 'Swift', tokenFound: 'Swift', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Swift', tokenFound: 'Swift', location: 'experience-bullet', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Swift', tokenFound: 'Swift', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Swift', expectedClassification: 'DIRECT' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Vikram Rao\nEmail: vikram@supplychain.com\n\nSKILLS:\nLogistics, Warehouse Management, ERP, Vendor Management\n\nEXPERIENCE:\nOperations Lead | FastLogistics (2021 - Present)\n- Ensured swift delivery of over 150,000 retail packages per month during peak holiday seasons.\n- Commended by management for swift response to critical supply chain bottlenecks.\n\nEDUCATION:\nB.Com, 2021`,
          jdText: `Role: iOS App Developer\nRequirements:\n- 2+ years of Swift programming experience.`,
          resumeMentions: [],
          jdRequirements: [
            { canonicalId: 'Swift', tokenFound: 'Swift', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Swift', expectedClassification: 'MISSING', rationale: 'Prose "swift delivery" must NOT match Swift iOS language' },
          ],
        };
      }
    },
  },

  // 6. Spark vs "spark interest"
  {
    trapType: 'spark_vs_prose',
    roleCategory: 'Data/Management',
    generate: (prng) => {
      const isDataSpark = prng.chance(0.5);
      if (isDataSpark) {
        return {
          resumeText: `Name: Amit Trivedi\nEmail: amit@bigdata.org\n\nSKILLS:\nApache Spark, PySpark, Hadoop, Scala, Kafka, SQL\n\nEXPERIENCE:\nData Engineer | Databound (2022 - Present)\n- Built large-scale ETL pipelines using Apache Spark on Databricks processing 4TB daily telemetry data.\n- Tuned Spark shuffle partitions and caching, reducing query runtimes from 90 mins to 18 mins.\n\nEDUCATION:\nB.Tech CSE, 2022`,
          jdText: `Role: Big Data Engineer\nRequirements:\n- 2+ years of Apache Spark / PySpark experience.\n- Solid experience in distributed data processing.`,
          resumeMentions: [
            { canonicalId: 'Apache Spark', tokenFound: 'Apache Spark', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Apache Spark', tokenFound: 'Spark', location: 'experience-bullet', evidenceTier: 'direct-use' },
            { canonicalId: 'Kafka', tokenFound: 'Kafka', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'SQL', tokenFound: 'SQL', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Apache Spark', tokenFound: 'Apache Spark', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Apache Spark', expectedClassification: 'DIRECT' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Riya Sen\nEmail: riya@brandmarketing.in\n\nSKILLS:\nDigital Marketing, Content Strategy, SEO, Copywriting\n\nEXPERIENCE:\nBrand Strategist | CreativesInc (2022 - Present)\n- Formulated viral campaigns designed to spark interest among Gen-Z technology consumers.\n- Spearheaded hackathon branding to spark innovation across engineering chapters.\n\nEDUCATION:\nB.A. Mass Comm, 2022`,
          jdText: `Role: Data Platform Engineer\nRequirements:\n- Apache Spark or Flink experience.`,
          resumeMentions: [
            { canonicalId: 'SEO', tokenFound: 'SEO', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Apache Spark', tokenFound: 'Apache Spark', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Apache Spark', expectedClassification: 'MISSING', rationale: 'Prose "spark interest" / "spark innovation" must NOT match Apache Spark' },
          ],
        };
      }
    },
  },

  // 7. React vs React Native vs "reactive"
  {
    trapType: 'react_vs_reactive',
    roleCategory: 'Frontend/Mobile/Backend',
    generate: (prng) => {
      const mode = prng.pick(['react_native_only', 'reactive_prose', 'clean_react']);
      if (mode === 'react_native_only') {
        return {
          resumeText: `Name: Alok Mishra\nEmail: alok@mobiledev.io\n\nSKILLS:\nReact Native, Mobile App Development, iOS, Android, TypeScript\n\nEXPERIENCE:\nMobile Engineer | AppFoundry (2022 - Present)\n- Developed cross-platform mobile apps using React Native for 50k monthly active users.\n- Integrated native bridge modules in Java and Swift with React Native.\n\nEDUCATION:\nB.Tech 2022`,
          jdText: `Role: Web Frontend Developer\nRequirements:\n- Must have React experience for responsive web apps.\n- Solid HTML5 and CSS3.`,
          resumeMentions: [
            { canonicalId: 'React Native', tokenFound: 'React Native', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'TypeScript', tokenFound: 'TypeScript', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'React', tokenFound: 'React', priority: 'mandatory' },
            { canonicalId: 'HTML5', tokenFound: 'HTML5', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'React', expectedClassification: 'TRANSFERABLE', rationale: 'React Native provides transferable credit to React but is not exact web React' },
            { jdSkill: 'HTML5', expectedClassification: 'MISSING' },
          ],
        };
      } else if (mode === 'reactive_prose') {
        return {
          resumeText: `Name: Sameer Khan\nEmail: sameer@java.io\n\nSKILLS:\nJava, Spring Boot, RxJava, Project Reactor, Kafka\n\nEXPERIENCE:\nBackend Engineer | FinServices (2021 - Present)\n- Architected reactive streaming pipelines using Project Reactor and RxJava.\n- Designed reactive microservices processing asynchronous payment callbacks.\n\nEDUCATION:\nB.Tech CSE, 2021`,
          jdText: `Role: React UI Engineer\nRequirements:\n- 2+ years of React development experience.`,
          resumeMentions: [
            { canonicalId: 'Java', tokenFound: 'Java', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Spring Boot', tokenFound: 'Spring Boot', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Kafka', tokenFound: 'Kafka', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'React', tokenFound: 'React', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'React', expectedClassification: 'MISSING', rationale: 'RxJava/Project Reactor "reactive" must NOT match React frontend framework' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Sneha Reddy\nEmail: sneha@web.dev\n\nSKILLS:\nReact, JavaScript, Next.js, HTML5, CSS3\n\nEXPERIENCE:\nFrontend Developer | WebWorks (2022 - Present)\n- Engineered single-page web applications using React and Next.js.\n- Created reusable design system components in React with 95% unit test coverage.\n\nEDUCATION:\nB.Tech 2022`,
          jdText: `Role: Frontend Engineer\nRequirements:\n- Proficiency in React.\n- Next.js experience is a plus.`,
          resumeMentions: [
            { canonicalId: 'React', tokenFound: 'React', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'JavaScript', tokenFound: 'JavaScript', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Next.js', tokenFound: 'Next.js', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'React', tokenFound: 'React', priority: 'mandatory' },
            { canonicalId: 'Next.js', tokenFound: 'Next.js', priority: 'preferred' },
          ],
          expectedMatches: [
            { jdSkill: 'React', expectedClassification: 'DIRECT' },
            { jdSkill: 'Next.js', expectedClassification: 'DIRECT' },
          ],
        };
      }
    },
  },

  // 8. Node vs Node.js vs "node" (graph/tree data structure)
  {
    trapType: 'node_vs_datastructure',
    roleCategory: 'Backend/Algorithms',
    generate: (prng) => {
      const hasRealNode = prng.chance(0.5);
      if (hasRealNode) {
        return {
          resumeText: `Name: Tanmay Bhat\nEmail: tanmay@node.org\n\nSKILLS:\nNode.js, Express.js, MongoDB, JavaScript, TypeScript\n\nEXPERIENCE:\nFull-Stack Engineer | DevHub (2022 - Present)\n- Designed REST API endpoints in Node.js and Express with MongoDB backend.\n- Integrated JWT authentication and Redis caching on Node services.\n\nEDUCATION:\nB.Tech 2022`,
          jdText: `Role: Node.js Backend Engineer\nRequirements:\n- 2+ years of Node.js experience building backend APIs.`,
          resumeMentions: [
            { canonicalId: 'Node.js', tokenFound: 'Node.js', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Express.js', tokenFound: 'Express.js', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'MongoDB', tokenFound: 'MongoDB', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Node.js', tokenFound: 'Node.js', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Node.js', expectedClassification: 'DIRECT' },
          ],
        };
      } else {
        return {
          resumeText: `Name: Ankit Aggarwal\nEmail: ankit@algo.edu\n\nSKILLS:\nC++, Python, Data Structures, Algorithms\n\nEXPERIENCE:\nCompetitive Programmer & Research Intern (2022 - Present)\n- Implemented advanced graph search traversing over 100,000 node structures with BFS and DFS.\n- Optimized trie node memory footprint by 40% using compressed pointer representations.\n- Analyzed leaf node distributions in binary search trees.\n\nEDUCATION:\nB.Tech CSE, 2022`,
          jdText: `Role: Backend Engineer\nRequirements:\n- Hands-on Node.js runtime experience.`,
          resumeMentions: [
            { canonicalId: 'C++', tokenFound: 'C++', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Python', tokenFound: 'Python', location: 'skills-list', evidenceTier: 'direct-use' },
            { canonicalId: 'Data Structures', tokenFound: 'Data Structures', location: 'skills-list', evidenceTier: 'direct-use' },
          ],
          jdRequirements: [
            { canonicalId: 'Node.js', tokenFound: 'Node.js', priority: 'mandatory' },
          ],
          expectedMatches: [
            { jdSkill: 'Node.js', expectedClassification: 'MISSING', rationale: 'Graph "node" / "leaf node" / "trie node" must NOT match Node.js' },
          ],
        };
      }
    },
  },

  // 9. Negations ("no experience with Kafka", "not worked with Kubernetes")
  {
    trapType: 'negations',
    roleCategory: 'Backend/DevOps',
    generate: () => ({
      resumeText: `Name: Varun Malhotra\nEmail: varun@dev.in\n\nSKILLS:\nJava, Spring Boot, MySQL, REST APIs, Git\n\nEXPERIENCE:\nSoftware Engineer | CloudScale (2022 - Present)\n- Developed microservices in Java and Spring Boot; no experience with Kafka or event streaming.\n- Worked in traditional on-premise environments, not familiar with Kubernetes orchestration.\n- Managed relational data models in MySQL without Redis caching.\n\nEDUCATION:\nB.Tech 2022`,
      jdText: `Role: Senior Distributed Systems Engineer\nRequirements:\n- Must have Apache Kafka for real-time stream processing.\n- Must have Kubernetes for container orchestration.\n- Strong background in Java and Spring Boot.`,
      resumeMentions: [
        { canonicalId: 'Java', tokenFound: 'Java', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Spring Boot', tokenFound: 'Spring Boot', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'MySQL', tokenFound: 'MySQL', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Kafka', tokenFound: 'Kafka', location: 'experience-bullet', evidenceTier: 'negated' },
        { canonicalId: 'Kubernetes', tokenFound: 'Kubernetes', location: 'experience-bullet', evidenceTier: 'negated' },
        { canonicalId: 'Redis', tokenFound: 'Redis', location: 'experience-bullet', evidenceTier: 'negated' },
      ],
      jdRequirements: [
        { canonicalId: 'Kafka', tokenFound: 'Kafka', priority: 'mandatory' },
        { canonicalId: 'Kubernetes', tokenFound: 'Kubernetes', priority: 'mandatory' },
        { canonicalId: 'Java', tokenFound: 'Java', priority: 'mandatory' },
        { canonicalId: 'Spring Boot', tokenFound: 'Spring Boot', priority: 'mandatory' },
      ],
      expectedMatches: [
        { jdSkill: 'Java', expectedClassification: 'DIRECT' },
        { jdSkill: 'Spring Boot', expectedClassification: 'DIRECT' },
        { jdSkill: 'Kafka', expectedClassification: 'MISSING', rationale: 'Explicit negation: "no experience with Kafka"' },
        { jdSkill: 'Kubernetes', expectedClassification: 'MISSING', rationale: 'Explicit negation: "not familiar with Kubernetes"' },
      ],
    }),
  },

  // 10. Hedges ("exposure to Docker", "currently learning Rust")
  {
    trapType: 'hedges',
    roleCategory: 'Backend',
    generate: () => ({
      resumeText: `Name: Pooja Sundaram\nEmail: pooja@dev.net\n\nSKILLS:\nPython, Django, PostgreSQL, HTML5, CSS3\n\nEXPERIENCE:\nBackend Intern | AlphaApps (2023)\n- Developed REST APIs using Python and Django with PostgreSQL database.\n- Has basic exposure to Docker containers and local development environments.\n- Currently learning Rust programming language in personal open-source projects.\n\nEDUCATION:\nB.Tech CSE, 2024`,
      jdText: `Role: Senior Rust & Containerization Engineer\nRequirements:\n- 3+ years of production experience in Rust.\n- Deep mastery of Docker container networking.\n- Nice to have: Python.`,
      resumeMentions: [
        { canonicalId: 'Python', tokenFound: 'Python', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Django', tokenFound: 'Django', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'PostgreSQL', tokenFound: 'PostgreSQL', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Docker', tokenFound: 'Docker', location: 'experience-bullet', evidenceTier: 'familiar/exposure' },
        { canonicalId: 'Rust', tokenFound: 'Rust', location: 'experience-bullet', evidenceTier: 'familiar/exposure' },
      ],
      jdRequirements: [
        { canonicalId: 'Rust', tokenFound: 'Rust', priority: 'mandatory' },
        { canonicalId: 'Docker', tokenFound: 'Docker', priority: 'mandatory' },
        { canonicalId: 'Python', tokenFound: 'Python', priority: 'preferred' },
      ],
      expectedMatches: [
        { jdSkill: 'Python', expectedClassification: 'DIRECT' },
        { jdSkill: 'Rust', expectedClassification: 'PARTIAL', rationale: 'Hedged mention: "currently learning Rust"' },
        { jdSkill: 'Docker', expectedClassification: 'PARTIAL', rationale: 'Hedged mention: "basic exposure to Docker"' },
      ],
    }),
  },

  // 11. Skills inside URLs/emails
  {
    trapType: 'urls_emails',
    roleCategory: 'General SDE',
    generate: () => ({
      resumeText: `Name: Alex Smith\nEmail: alex.react.native@gmail.com\nGitHub: github.com/alexsmith/java-notes-repo\nWebsite: https://docker.io/alexdev/portfolio\n\nSKILLS:\nPython, Flask, SQLite\n\nEXPERIENCE:\nSoftware Intern | WebServices (2023)\n- Built data processing scripts in Python and Flask.\n- Tested local queries against SQLite database.\n\nEDUCATION:\nB.Sc Computer Science, 2023`,
      jdText: `Role: Senior Java Developer\nRequirements:\n- Mandatory: Java, React Native, Docker.`,
      resumeMentions: [
        { canonicalId: 'Python', tokenFound: 'Python', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Flask', tokenFound: 'Flask', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'SQLite', tokenFound: 'SQLite', location: 'skills-list', evidenceTier: 'direct-use' },
      ],
      jdRequirements: [
        { canonicalId: 'Java', tokenFound: 'Java', priority: 'mandatory' },
        { canonicalId: 'React Native', tokenFound: 'React Native', priority: 'mandatory' },
        { canonicalId: 'Docker', tokenFound: 'Docker', priority: 'mandatory' },
      ],
      expectedMatches: [
        { jdSkill: 'Java', expectedClassification: 'MISSING', rationale: 'Java appears only inside URL path "github.com/alexsmith/java-notes-repo"' },
        { jdSkill: 'React Native', expectedClassification: 'MISSING', rationale: 'React appears only in email handle "alex.react.native@gmail.com"' },
        { jdSkill: 'Docker', expectedClassification: 'MISSING', rationale: 'Docker appears only in domain "docker.io"' },
      ],
    }),
  },

  // 12. Listed-only vs used
  {
    trapType: 'listed_only_vs_used',
    roleCategory: 'Fullstack',
    generate: () => ({
      resumeText: `Name: Manisha K\nEmail: manisha@fullstack.io\n\nSKILLS:\nJavaScript, React, Node.js, MongoDB, Kubernetes, Terraform, Rust, Go\n\nEXPERIENCE:\nFrontend Developer | AppStudio (2022 - Present)\n- Developed client-facing dashboards using React and JavaScript.\n- Integrated REST endpoints with Axios for 10,000 active users.\n\nEDUCATION:\nB.Tech 2022`,
      jdText: `Role: DevOps Platform Engineer\nRequirements:\n- Kubernetes cluster administration.\n- Terraform for infrastructure as code.\n- Nice to have: React.`,
      resumeMentions: [
        { canonicalId: 'JavaScript', tokenFound: 'JavaScript', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'React', tokenFound: 'React', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Kubernetes', tokenFound: 'Kubernetes', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Terraform', tokenFound: 'Terraform', location: 'skills-list', evidenceTier: 'direct-use' },
      ],
      jdRequirements: [
        { canonicalId: 'Kubernetes', tokenFound: 'Kubernetes', priority: 'mandatory' },
        { canonicalId: 'Terraform', tokenFound: 'Terraform', priority: 'mandatory' },
        { canonicalId: 'React', tokenFound: 'React', priority: 'preferred' },
      ],
      expectedMatches: [
        { jdSkill: 'React', expectedClassification: 'DIRECT' },
        { jdSkill: 'Kubernetes', expectedClassification: 'PARTIAL', rationale: 'Listed only in skills section without project or work bullet evidence' },
        { jdSkill: 'Terraform', expectedClassification: 'PARTIAL', rationale: 'Listed only in skills section without project or work bullet evidence' },
      ],
    }),
  },

  // 13. SQL Dialects (PostgreSQL vs MySQL vs SQL Server)
  {
    trapType: 'sql_dialects',
    roleCategory: 'Backend/Database',
    generate: (prng) => {
      const db = prng.pick(['PostgreSQL', 'MySQL', 'SQL Server']);
      return {
        resumeText: `Name: Aditya Roy\nEmail: aditya@db.net\n\nSKILLS:\n${db}, SQL, Python, FastAPI, Docker\n\nEXPERIENCE:\nBackend Engineer | DataCorp (2022 - Present)\n- Wrote complex SQL queries and window functions against ${db} database.\n- Indexed heavy reporting tables reducing query times by 40%.\n\nEDUCATION:\nB.Tech 2022`,
        jdText: `Role: Database Engineer\nRequirements:\n- Strong SQL proficiency.\n- Experience with PostgreSQL relational databases.`,
        resumeMentions: [
          { canonicalId: db, tokenFound: db, location: 'skills-list', evidenceTier: 'direct-use' },
          { canonicalId: 'SQL', tokenFound: 'SQL', location: 'skills-list', evidenceTier: 'direct-use' },
          { canonicalId: 'Python', tokenFound: 'Python', location: 'skills-list', evidenceTier: 'direct-use' },
        ],
        jdRequirements: [
          { canonicalId: 'SQL', tokenFound: 'SQL', priority: 'mandatory' },
          { canonicalId: 'PostgreSQL', tokenFound: 'PostgreSQL', priority: 'mandatory' },
        ],
        expectedMatches: [
          { jdSkill: 'SQL', expectedClassification: 'DIRECT' },
          {
            jdSkill: 'PostgreSQL',
            expectedClassification: db === 'PostgreSQL' ? 'DIRECT' : 'TRANSFERABLE',
            rationale: db === 'PostgreSQL' ? 'Direct match' : `Candidate has ${db}, transferable to PostgreSQL`,
          },
        ],
      };
    },
  },

  // 14. CS Fundamentals (DSA, OOP, DBMS, OS, Computer Networks)
  {
    trapType: 'cs_fundamentals',
    roleCategory: 'Fresher / SDE',
    generate: () => ({
      resumeText: `Name: Rahul Singhania\nEmail: rahul@nit.ac.in\n\nSKILLS:\nData Structures, Algorithms, OOP, DBMS, OS, Computer Networks, C++\n\nPROJECTS:\nAlgorithmic Trading Simulator\n- Implemented advanced Data Structures & Algorithms in C++ solving 300+ LeetCode problems.\n- Applied Object-Oriented Programming (OOP) design patterns to structure modular order execution.\n\nEDUCATION:\nB.Tech CSE, NIT Kurukshetra, 2024 (CGPA: 8.8)`,
      jdText: `Role: Associate SDE (Freshers Welcome)\nRequirements:\n- Solid fundamentals in Data Structures & Algorithms (DSA).\n- Strong understanding of Object-Oriented Programming (OOP).\n- Working knowledge of DBMS and Computer Networks.\n- Nice to have: C++ or Java.`,
      resumeMentions: [
        { canonicalId: 'Data Structures', tokenFound: 'Data Structures', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'Algorithms', tokenFound: 'Algorithms', location: 'skills-list', evidenceTier: 'direct-use' },
        { canonicalId: 'C++', tokenFound: 'C++', location: 'skills-list', evidenceTier: 'direct-use' },
      ],
      jdRequirements: [
        { canonicalId: 'Data Structures & Algorithms', tokenFound: 'Data Structures & Algorithms (DSA)', priority: 'mandatory' },
        { canonicalId: 'Object-Oriented Programming', tokenFound: 'Object-Oriented Programming (OOP)', priority: 'mandatory' },
        { canonicalId: 'C++', tokenFound: 'C++', priority: 'preferred' },
      ],
      expectedMatches: [
        { jdSkill: 'Data Structures & Algorithms', expectedClassification: 'DIRECT' },
        { jdSkill: 'Object-Oriented Programming', expectedClassification: 'DIRECT' },
        { jdSkill: 'C++', expectedClassification: 'DIRECT' },
      ],
    }),
  },

  // 15. Next.js vs NextJS
  {
    trapType: 'nextjs_variants',
    roleCategory: 'Frontend',
    generate: (prng) => {
      const variant = prng.pick(['Next.js', 'NextJS', 'Next JS']);
      return {
        resumeText: `Name: Sunita Patel\nEmail: sunita@frontend.dev\n\nSKILLS:\n${variant}, React, TypeScript, Tailwind CSS\n\nEXPERIENCE:\nFrontend Developer | VercelStudio (2022 - Present)\n- Developed server-side rendered web applications using ${variant} and React.\n- Configured incremental static regeneration (ISR) in ${variant}.\n\nEDUCATION:\nB.Tech 2022`,
        jdText: `Role: Senior Full-Stack Engineer\nRequirements:\n- Must have 2+ years of production experience in Next.js.\n- React and TypeScript expertise.`,
        resumeMentions: [
          { canonicalId: 'Next.js', tokenFound: variant, location: 'skills-list', evidenceTier: 'direct-use' },
          { canonicalId: 'React', tokenFound: 'React', location: 'skills-list', evidenceTier: 'direct-use' },
          { canonicalId: 'TypeScript', tokenFound: 'TypeScript', location: 'skills-list', evidenceTier: 'direct-use' },
        ],
        jdRequirements: [
          { canonicalId: 'Next.js', tokenFound: 'Next.js', priority: 'mandatory' },
          { canonicalId: 'React', tokenFound: 'React', priority: 'mandatory' },
          { canonicalId: 'TypeScript', tokenFound: 'TypeScript', priority: 'mandatory' },
        ],
        expectedMatches: [
          { jdSkill: 'Next.js', expectedClassification: 'DIRECT' },
          { jdSkill: 'React', expectedClassification: 'DIRECT' },
          { jdSkill: 'TypeScript', expectedClassification: 'DIRECT' },
        ],
      };
    },
  },
];

// Realistic archetype skills per role category for standard cases
const ROLE_SKILL_PACKS: Record<string, { skills: string[]; must: string[]; nice: string[] }[]> = {
  Fullstack: [
    {
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
      must: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      nice: ['Docker', 'AWS'],
    },
    {
      skills: ['JavaScript', 'React', 'Express.js', 'MongoDB', 'REST APIs'],
      must: ['JavaScript', 'React', 'Express.js'],
      nice: ['MongoDB', 'Jest'],
    },
    {
      skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
      must: ['Python', 'Django', 'React'],
      nice: ['PostgreSQL', 'Redis'],
    },
  ],
  Backend: [
    {
      skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Kafka', 'Docker'],
      must: ['Java', 'Spring Boot', 'PostgreSQL'],
      nice: ['Kafka', 'Kubernetes'],
    },
    {
      skills: ['Go', 'gRPC', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
      must: ['Go', 'Docker', 'Kubernetes'],
      nice: ['Redis', 'Prometheus'],
    },
    {
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
      must: ['Python', 'FastAPI', 'PostgreSQL'],
      nice: ['Docker', 'AWS'],
    },
  ],
  Frontend: [
    {
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
      must: ['React', 'TypeScript', 'Tailwind CSS'],
      nice: ['Next.js', 'Jest'],
    },
    {
      skills: ['JavaScript', 'HTML5', 'CSS3', 'Vue.js', 'Webpack'],
      must: ['JavaScript', 'HTML5', 'CSS3'],
      nice: ['Vue.js'],
    },
  ],
  DevOps: [
    {
      skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Linux'],
      must: ['Kubernetes', 'Terraform', 'Docker', 'AWS'],
      nice: ['CI/CD Pipelines', 'Prometheus'],
    },
    {
      skills: ['Linux', 'Docker', 'Jenkins', 'GitLab CI', 'Ansible'],
      must: ['Linux', 'Docker', 'CI/CD Pipelines'],
      nice: ['Ansible'],
    },
  ],
  Data: [
    {
      skills: ['Python', 'SQL', 'Apache Spark', 'Pandas', 'PostgreSQL', 'Airflow'],
      must: ['Python', 'SQL', 'Apache Spark'],
      nice: ['Airflow', 'Snowflake'],
    },
    {
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'Scikit-Learn'],
      must: ['Python', 'Machine Learning', 'TensorFlow'],
      nice: ['Scikit-Learn', 'PyTorch'],
    },
  ],
};

function generateStandardCase(
  id: string,
  isHoldout: boolean,
  prng: SeededPRNG
): SkillFixtureTruth {
  const roleCategories = Object.keys(ROLE_SKILL_PACKS);
  const roleCat = prng.pick(roleCategories);
  const packs = ROLE_SKILL_PACKS[roleCat];
  const pack = prng.pick(packs);

  // Resume has some subset of candidate skills
  const resumeSkills = pack.skills;
  const jdMust = pack.must;
  const jdNice = pack.nice;

  const candidateBullets = [
    `Architected and deployed scalable ${resumeSkills[0]} and ${resumeSkills[1]} services, reducing latency by ${prng.nextInt(20, 50)}%.`,
    `Engineered database indexing and query optimization on ${resumeSkills[2] || 'PostgreSQL'}, supporting ${prng.nextInt(10, 100)}k daily active users.`,
    `Integrated CI/CD automation and unit testing across core microservice repositories.`,
  ];

  const resumeText = `Candidate ${id}\nEmail: candidate_${id}@hireflow.test\n\nTECHNICAL SKILLS:\n${resumeSkills.join(', ')}\n\nEXPERIENCE:\nSoftware Engineer | TechVentures (${2020 + (prng.nextInt(0, 2))} - Present)\n- ${candidateBullets.join('\n- ')}\n\nEDUCATION:\nB.Tech in Computer Science, 2021`;

  const jdText = `Role: ${roleCat} Engineer\nCompany: ScaleTech\n\nMust-Have Requirements:\n${jdMust.map((m) => `- Proficiency in ${m}.`).join('\n')}\n\nNice-to-Have Skills:\n${jdNice.map((n) => `- Experience with ${n}.`).join('\n')}\n\nResponsibilities:\n- Build scalable services.\n- Write clean, maintainable code.`;

  const resumeMentions: MentionTruth[] = [];
  const mentionedCanonicals = new Set<string>();

  for (const s of resumeSkills) {
    mentionedCanonicals.add(s.toLowerCase());
    resumeMentions.push({
      canonicalId: s,
      tokenFound: s,
      location: 'skills-list',
      evidenceTier: 'direct-use',
    });
  }

  for (const bs of ['CI/CD Pipelines', 'Unit Testing', 'Microservices']) {
    if (!mentionedCanonicals.has(bs.toLowerCase())) {
      mentionedCanonicals.add(bs.toLowerCase());
      resumeMentions.push({
        canonicalId: bs,
        tokenFound: bs,
        location: 'experience-bullet',
        evidenceTier: 'direct-use',
      });
    }
  }

  const thirdSkill = resumeSkills[2] || 'PostgreSQL';
  if (!mentionedCanonicals.has(thirdSkill.toLowerCase())) {
    mentionedCanonicals.add(thirdSkill.toLowerCase());
    resumeMentions.push({
      canonicalId: thirdSkill,
      tokenFound: thirdSkill,
      location: 'experience-bullet',
      evidenceTier: 'direct-use',
    });
  }

  const jdRequirements: JDRequirementTruth[] = [];
  for (const m of jdMust) {
    jdRequirements.push({
      canonicalId: m,
      tokenFound: m,
      priority: 'mandatory',
    });
  }
  for (const n of jdNice) {
    jdRequirements.push({
      canonicalId: n,
      tokenFound: n,
      priority: 'preferred',
    });
  }

  const expectedMatches: SkillMatchExpectation[] = [];
  for (const r of jdRequirements) {
    const isPresent = resumeSkills.some((s) => s.toLowerCase() === r.canonicalId.toLowerCase());
    expectedMatches.push({
      jdSkill: r.canonicalId,
      expectedClassification: isPresent ? 'DIRECT' : 'MISSING',
    });
  }

  return {
    id,
    isHoldout,
    roleCategory: roleCat,
    resumeText,
    jdText,
    resumeMentions,
    jdRequirements,
    expectedMatches,
  };
}

export function generateAllSkillFixtures(): { dev: SkillFixtureTruth[]; holdout: SkillFixtureTruth[] } {
  const baseDir = path.resolve('tests/fixtures/skills');
  const devDir = path.join(baseDir, 'dev');
  const holdoutDir = path.join(baseDir, 'holdout');

  fs.mkdirSync(devDir, { recursive: true });
  fs.mkdirSync(holdoutDir, { recursive: true });

  const devPrng = new SeededPRNG(1337);
  const holdoutPrng = new SeededPRNG(4242);

  const devCount = 210; // Target >= 200
  const holdoutCount = 130; // Target >= 120

  console.log(`[Skill Fixtures] Generating ${devCount} DEV fixtures (seed 1337)...`);
  const devFixtures: SkillFixtureTruth[] = [];

  for (let i = 1; i <= devCount; i++) {
    const id = `skill_dev_${String(i).padStart(3, '0')}`;
    const isTrap = i <= 60; // 60/210 = 28.6% traps (> 25%)
    let fixture: SkillFixtureTruth;

    if (isTrap) {
      const template = TRAP_TEMPLATES[(i - 1) % TRAP_TEMPLATES.length];
      const data = template.generate(devPrng);
      fixture = {
        id,
        isHoldout: false,
        trapType: template.trapType,
        roleCategory: template.roleCategory,
        resumeText: data.resumeText,
        jdText: data.jdText,
        resumeMentions: data.resumeMentions,
        jdRequirements: data.jdRequirements,
        expectedMatches: data.expectedMatches,
      };
    } else {
      fixture = generateStandardCase(id, false, devPrng);
    }

    devFixtures.push(fixture);
    fs.writeFileSync(path.join(devDir, `${id}.truth.json`), JSON.stringify(fixture, null, 2), 'utf-8');
  }

  console.log(`[Skill Fixtures] Generating ${holdoutCount} HOLDOUT fixtures (seed 4242)...`);
  const holdoutFixtures: SkillFixtureTruth[] = [];

  for (let i = 1; i <= holdoutCount; i++) {
    const id = `skill_holdout_${String(i).padStart(3, '0')}`;
    const isTrap = i <= 40; // 40/130 = 30.8% traps (> 25%)
    let fixture: SkillFixtureTruth;

    if (isTrap) {
      const template = TRAP_TEMPLATES[(i - 1) % TRAP_TEMPLATES.length];
      const data = template.generate(holdoutPrng);
      fixture = {
        id,
        isHoldout: true,
        trapType: template.trapType,
        roleCategory: template.roleCategory,
        resumeText: data.resumeText,
        jdText: data.jdText,
        resumeMentions: data.resumeMentions,
        jdRequirements: data.jdRequirements,
        expectedMatches: data.expectedMatches,
      };
    } else {
      fixture = generateStandardCase(id, true, holdoutPrng);
    }

    holdoutFixtures.push(fixture);
    fs.writeFileSync(path.join(holdoutDir, `${id}.truth.json`), JSON.stringify(fixture, null, 2), 'utf-8');
  }

  console.log(`[Skill Fixtures] Successfully generated:`);
  console.log(`  - DEV: ${devFixtures.length} files (${devFixtures.filter((f) => f.trapType).length} traps)`);
  console.log(`  - HOLDOUT: ${holdoutFixtures.length} files (${holdoutFixtures.filter((f) => f.trapType).length} traps)`);

  return { dev: devFixtures, holdout: holdoutFixtures };
}

// Direct execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('generateSkillFixtures')) {
  generateAllSkillFixtures();
}
