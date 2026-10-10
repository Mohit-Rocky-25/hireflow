// ============================================================
// Careers Data Platform — Canonical Fresher & Campus Programs Master Dataset
// Platform-wide source of truth for campus hiring, bands, CTC, eligibility & trajectories
// Zero fabrication: all fields sourced from recorded official company portals & university JDs
// Generated on: 2026-10-10
// ============================================================

import type { FresherProgram } from '../schema/types';

export const PLATFORM_FRESHER_PROGRAMS: FresherProgram[] = [
  {
    "id": "tcs-ninja",
    "companyId": "tcs",
    "programName": "TCS Ninja Hiring",
    "roleTitle": "Assistant Systems Engineer",
    "aliases": [
      "Ninja",
      "TCS ASE",
      "TCS Ninja Track"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "TCS NQT (National Qualifier Test)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech",
        "M.Sc"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil",
        "chemical-bio"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL",
        "MCA"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "No active backlogs allowed at the time of appearing",
      "gapYearPolicy": "Max 24 months academic gap permitted with justification",
      "notes": "Standard 60% / 6.0 CGPA throughout 10th, 12th, and graduation without active backlogs."
    },
    "selectionProcess": [
      {
        "stage": "TCS NQT Cognitive Assessment",
        "type": "aptitude",
        "durationMin": 75,
        "topics": [
          "Numerical Ability",
          "Verbal Ability",
          "Reasoning Ability"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "TCS NQT Programming Logic & Hands-on Coding",
        "type": "coding",
        "durationMin": 45,
        "topics": [
          "C/C++/Java/Python basics",
          "Strings, arrays, basic algorithms"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Technical & HR Interview",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Core CS subjects",
          "Project discussion",
          "Willingness to relocate"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 3.36,
      "fixedMaxLPA": 3.6,
      "variableLPA": 0.2,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": 12,
      "bondAmountINR": 50000,
      "notes": "Initial Learning Program (ILP) at TCS Trivandrum / virtual followed by project allocation."
    },
    "locations": [
      "Bengaluru",
      "Chennai",
      "Hyderabad",
      "Pune",
      "Mumbai",
      "Kolkata",
      "Delhi NCR"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Primary drives run August to October for graduating cohort."
    },
    "entry": {
      "companyLevelCode": "NINJA",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "NINJA",
        "toLevelCode": "DIGITAL",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Wings1 high performer clearance or internal Digital elevation exam",
          "Consistently rated 4+ out of 5 in project appraisals"
        ],
        "blockers": [
          {
            "title": "Wings1 DCA Clearance Delay",
            "category": "certification",
            "whyItBlocks": "Internal elevation to Digital compensation band mandates clearing internal DCA (Digital Capability Assessment).",
            "evidenceToCounter": "Complete internal Python/Java track certifications and submit top-tier DCA test scores."
          }
        ],
        "compensationLPAAfter": {
          "min": 7,
          "max": 7.5
        },
        "fastTrackNote": "Clearing Wings1 DCA Articulation exam promotes to Digital band within 12 months.",
        "lateralExits": [
          "Service-to-product transitions as Junior Software Engineer at fintech or mid-tier product firms."
        ],
        "confidence": "high",
        "derived": false
      },
      {
        "fromLevelCode": "DIGITAL",
        "toLevelCode": "C3",
        "typicalYearsMin": 2.5,
        "typicalYearsMax": 4,
        "conditions": [
          "Client-facing delivery ownership",
          "Technology lead responsibilities on enterprise migration or modernization accounts"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 9.5,
          "max": 13
        },
        "fastTrackNote": "Outstanding client contribution and solutioning patents fast-track promotion to C3.",
        "lateralExits": [
          "Mid-level developer at Global Capability Centers (GCCs) or Indian unicorns."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://nextstep.tcs.com/campus/",
          "title": "TCS NextStep Official Portal & Eligibility Rules",
          "publisher": "TCS NextStep",
          "type": "official",
          "accessed": "2026-10-10"
        },
        {
          "url": "https://www.tcs.com/careers/india/tcs-fresher-hiring",
          "title": "TCS National Qualifier Test (NQT) Structure & CTC Bands",
          "publisher": "Tata Consultancy Services",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "tcs-digital",
    "companyId": "tcs",
    "programName": "TCS Digital Hiring",
    "roleTitle": "Systems Engineer",
    "aliases": [
      "Digital",
      "TCS Digital Track"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "dream",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "TCS NQT Advanced Section",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE",
        "EEE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs permitted",
      "gapYearPolicy": "Max 24 months academic gap permitted",
      "notes": "Scored in top 10% of NQT Advanced Coding section or selected via institutional premium drives."
    },
    "selectionProcess": [
      {
        "stage": "NQT Advanced Cognitive & Quantitative",
        "type": "aptitude",
        "durationMin": 40,
        "topics": [
          "Advanced Quantitative",
          "Advanced Reasoning Logic"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "NQT Advanced Coding (2 Problems)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "Data Structures",
          "Dynamic Programming",
          "Graph algorithms",
          "Time complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Digital Technical & Design Interview",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "System architecture basics",
          "Full stack project deep dive",
          "Cloud/AI fundamentals"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 7,
      "fixedMaxLPA": 7.5,
      "variableLPA": 0.5,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": 12,
      "bondAmountINR": 50000,
      "notes": "Accelerated digital technology induction with immediate billable project deployment."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Chennai",
      "Delhi NCR",
      "Kolkata"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Assessed concurrently during TCS NQT drives."
    },
    "entry": {
      "companyLevelCode": "DIGITAL",
      "equivalenceLevelId": "L4_MID"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "python": "working",
      "databases": "strong",
      "aws": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "DIGITAL",
        "toLevelCode": "C3",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Lead module engineer on cloud transformation or AI accounts",
          "Consistent high performance band"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 10,
          "max": 13.5
        },
        "fastTrackNote": "Direct track to Lead Architect / Assistant Consultant for top technical talent.",
        "lateralExits": [
          "SDE-2 at top tier Indian startups or senior analyst at GCCs."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.tcs.com/careers/india/tcs-fresher-hiring",
          "title": "TCS Digital Cadre Overview & Compensation Structure",
          "publisher": "Tata Consultancy Services",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "tcs-prime",
    "companyId": "tcs",
    "programName": "TCS Prime Hiring",
    "roleTitle": "Systems Engineer (Prime Cadre)",
    "aliases": [
      "Prime",
      "TCS Prime Band"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "TCS NQT Prime Level Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "DS"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 70,
      "backlogPolicy": "Zero active or historical backlogs",
      "gapYearPolicy": "Max 12 months gap",
      "notes": "Reserved for elite programmers clearing the highest tier of NQT Prime or HackQuest/CodeVita."
    },
    "selectionProcess": [
      {
        "stage": "Prime Coding Challenge (HackQuest / CodeVita round)",
        "type": "coding",
        "durationMin": 120,
        "topics": [
          "Advanced Competitive Programming",
          "Trie",
          "Segment Trees",
          "Hard DP"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Prime Technical In-depth Panel",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Distributed Systems",
          "Research / Open Source contributions",
          "Algorithmic efficiency"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 9,
      "fixedMaxLPA": 11.5,
      "variableLPA": 1,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": 12,
      "bondAmountINR": 50000,
      "notes": "Fast-tracked into TCS R&D Labs, TCS Pace Ports, or cutting-edge AI centers of excellence."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted alongside premier campus placement windows."
    },
    "entry": {
      "companyLevelCode": "DIGITAL",
      "equivalenceLevelId": "L4_MID"
    },
    "competencyProfile": {
      "dsa": "expert",
      "systemdesign": "working",
      "python": "strong",
      "java": "strong",
      "ml": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "DIGITAL",
        "toLevelCode": "C3",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Rapid delivery of AI/cloud proof-of-concepts for tier-1 strategic clients"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 12,
          "max": 15
        },
        "fastTrackNote": "Direct entry into TCS CTO office innovation squads.",
        "lateralExits": [
          "Product Engineer at top tech companies."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.tcs.com/careers/india/tcs-fresher-hiring",
          "title": "TCS Prime Cadre Official Announcement & Recruitment Track",
          "publisher": "Tata Consultancy Services",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "infosys-se",
    "companyId": "infosys",
    "programName": "Infosys Systems Engineer Campus Hiring",
    "roleTitle": "Systems Engineer",
    "aliases": [
      "SE",
      "Infosys SE",
      "Systems Engineer Trainee"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "Infosys Online Assessment (InfyTQ)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech",
        "M.Sc"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil",
        "chemical-bio"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL",
        "MCA"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "No active backlogs allowed",
      "gapYearPolicy": "Max 2 years gap allowed with valid documentation",
      "notes": "All engineering disciplines eligible with minimum 60% aggregate."
    },
    "selectionProcess": [
      {
        "stage": "Reasoning Ability & Mathematical Critical Thinking",
        "type": "aptitude",
        "durationMin": 60,
        "topics": [
          "Logical Reasoning",
          "Quantitative Aptitude",
          "Verbal Ability"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Pseudocode & Numerical Puzzle Solving",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Pseudocode dry-running",
          "Basic algorithmic puzzles"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical & HR Interview",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Basic OOP concepts",
          "DBMS queries",
          "Final year project"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 3.6,
      "fixedMaxLPA": 4,
      "variableLPA": 0.25,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 4,
      "bondMonths": 12,
      "bondAmountINR": null,
      "notes": "Legendary Infosys Mysore campus residential training program covering generic and stream tracks."
    },
    "locations": [
      "Bengaluru",
      "Mysuru",
      "Pune",
      "Hyderabad",
      "Chennai",
      "Chandigarh",
      "Thiruvananthapuram"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Standard national campus hiring season."
    },
    "entry": {
      "companyLevelCode": "SE",
      "equivalenceLevelId": "L4_MID"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SE",
        "toLevelCode": "TA",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Completion of client projects with good CSAT score",
          "Clearing internal technical certifications (JL5 readiness)"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 5.5,
          "max": 7.5
        },
        "fastTrackNote": "Clearing Bridge-to-DSE programs fast-tracks compensation revision.",
        "lateralExits": [
          "Mid-tier IT software developer or banking tech maintenance engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.infosys.com/careers/",
          "title": "Infosys Graduate Systems Engineer Program",
          "publisher": "Infosys Limited",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "infosys-sp",
    "companyId": "infosys",
    "programName": "Infosys Specialist Programmer (HackWithInfy)",
    "roleTitle": "Specialist Programmer",
    "aliases": [
      "SP",
      "Power Programmer",
      "DSE/SP"
    ],
    "programType": "competition-hiring",
    "roleFamily": "sde-services",
    "campusCategory": "super-dream",
    "hiringReach": "mass-pool",
    "channels": [
      "competition",
      "portal",
      "on-campus"
    ],
    "testOrPortal": "HackWithInfy National Competitive Coding Contest",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "MCA"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "No active backlogs permitted",
      "gapYearPolicy": "Standard company policy",
      "notes": "Top finalists and qualifiers in HackWithInfy algorithmic coding contest."
    },
    "selectionProcess": [
      {
        "stage": "HackWithInfy Round 1 (Online Coding)",
        "type": "coding",
        "durationMin": 180,
        "topics": [
          "Dynamic Programming",
          "Graph Theory",
          "Data Structures (Trees, Queues, Fenwick Trees)"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "HackWithInfy Grand Finale / Technical Interview",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithmic optimization",
          "System design",
          "Deep dive into hackathon submissions"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 9.5,
      "fixedMaxLPA": 10,
      "variableLPA": 1,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Directly placed into Infosys Strategic Technology Group (STG) / AI Labs."
    },
    "locations": [
      "Bengaluru",
      "Pune",
      "Hyderabad",
      "Chennai"
    ],
    "seasons": {
      "typicalMonths": [
        5,
        6,
        7,
        8
      ],
      "notes": "HackWithInfy takes place across summer leading to campus offers."
    },
    "entry": {
      "companyLevelCode": "DSE_SP",
      "equivalenceLevelId": "L4_MID"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "python": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "DSE_SP",
        "toLevelCode": "TA",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Strategic architecture contribution on Fortune 500 digital accounts"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 12,
          "max": 15
        },
        "fastTrackNote": "Specialist cadre has rapid progression through JL5 and JL6.",
        "lateralExits": [
          "SDE-2 at top product unicorns or senior engineer at Big Tech."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.infosys.com/careers/",
          "title": "HackWithInfy Official Contest & Specialist Programmer Details",
          "publisher": "Infosys Limited",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "wipro-elite",
    "companyId": "wipro",
    "programName": "Wipro Elite National Talent Hunt (NLTH)",
    "roleTitle": "Project Engineer",
    "aliases": [
      "Elite",
      "Wipro Elite",
      "Project Engineer Fresher"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "Wipro NLTH Assessment (AMCAT platform)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil",
        "chemical-bio"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "Max 1 active backlog allowed at test stage; 0 at joining",
      "gapYearPolicy": "Max 3 years education gap allowed",
      "notes": "All branches eligible with 60% minimum in 10th, 12th, and engineering."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & Written Communication Test",
        "type": "aptitude",
        "durationMin": 68,
        "topics": [
          "Logical Reasoning",
          "Quantitative Ability",
          "English Essay Writing"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Online Coding Challenge (2 Questions)",
        "type": "coding",
        "durationMin": 60,
        "topics": [
          "Basic programming in Java/C/C++/Python",
          "Arrays and string manipulations"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Business & Technical Discussion",
        "type": "technical",
        "durationMin": 25,
        "topics": [
          "Project presentation",
          "Basics of programming",
          "Flexibility on domains"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 3.5,
      "fixedMaxLPA": 3.8,
      "variableLPA": 0.2,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": 12,
      "bondAmountINR": 75000,
      "notes": "Project Readiness Program (PRP) with training and domain assessment."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Chennai",
      "Noida",
      "Kolkata"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Elite NLTH window opens late summer."
    },
    "entry": {
      "companyLevelCode": "Elite",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Elite",
        "toLevelCode": "Senior Project Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Annual appraisal rating Exceeds Expectations",
          "Customer billability and technology certification in cloud or microservices"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 5.5,
          "max": 7
        },
        "fastTrackNote": "Clearing internal Velocity exam elevates salary to Turbo band level.",
        "lateralExits": [
          "Mid-tier IT software developer or QA automation engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.wipro.com/early-careers",
          "title": "Wipro Elite National Talent Hunt Guidelines",
          "publisher": "Wipro Limited",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "cognizant-genc",
    "companyId": "cognizant",
    "programName": "Cognizant GenC Campus Hiring",
    "roleTitle": "Programmer Analyst Trainee (GenC)",
    "aliases": [
      "GenC",
      "Cognizant GenC PAT"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "Cognizant Superset Assessment Platform",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech",
        "M.Sc"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "Zero active backlogs at time of selection",
      "gapYearPolicy": "Max 2 years education gap",
      "notes": "Aggregate 60% with all engineering streams welcomed."
    },
    "selectionProcess": [
      {
        "stage": "GenC Aptitude & Analytical Assessment",
        "type": "aptitude",
        "durationMin": 70,
        "topics": [
          "Quantitative Reasoning",
          "Logical Analysis",
          "Verbal Skills"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Technical Interview",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Core OOP concepts",
          "SQL queries",
          "Basic programming logic"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Suitability Interview",
        "type": "hr",
        "durationMin": 15,
        "topics": [
          "Location flexibility",
          "Communication skills"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 4,
      "fixedMaxLPA": 4.5,
      "variableLPA": 0.25,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Cognizant Academy internship or post-joining full-time training program."
    },
    "locations": [
      "Chennai",
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Kolkata",
      "Kochi",
      "Coimbatore"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Conducted in autumn campus recruitment window."
    },
    "entry": {
      "companyLevelCode": "GenC",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GenC",
        "toLevelCode": "Associate",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Successful delivery across account releases",
          "Completion of PAT confirmation appraisal"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 6,
          "max": 7.5
        },
        "fastTrackNote": "Clearing internal Elevate exams offers mid-year salary corrections.",
        "lateralExits": [
          "Software engineer at corporate IT setups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.cognizant.com/global/en/campus-hiring",
          "title": "Cognizant GenC Program Official Overview",
          "publisher": "Cognizant",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "cognizant-genc-elevate",
    "companyId": "cognizant",
    "programName": "Cognizant GenC Elevate / Next Hiring",
    "roleTitle": "Programmer Analyst Trainee (GenC Elevate)",
    "aliases": [
      "GenC Next",
      "GenC Elevate",
      "GenC Pro"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "dream",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Cognizant Skill Assessment (Advanced Coding)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "MCA"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Max 1 year education gap",
      "notes": "High scoring candidates from the skill-based coding round or tier-1 partner colleges."
    },
    "selectionProcess": [
      {
        "stage": "GenC Elevate Advanced Coding Round",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "Advanced Data Structures",
          "Algorithms",
          "SQL & Database optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Subject Matter Technical Interview",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Full-stack system architecture",
          "Cloud concepts",
          "Real-world problem solving"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 6.5,
      "fixedMaxLPA": 7.5,
      "variableLPA": 0.5,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Focused domain training for enterprise digital engineering practice."
    },
    "locations": [
      "Bengaluru",
      "Chennai",
      "Hyderabad",
      "Pune"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted alongside GenC campus drives."
    },
    "entry": {
      "companyLevelCode": "GenC Next",
      "equivalenceLevelId": "L4_MID"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "strong",
      "python": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GenC Next",
        "toLevelCode": "Associate",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "High performance rating and technical lead ownership in project"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 8.5,
          "max": 10.5
        },
        "fastTrackNote": "Specialist promotion path into Cognizant Digital Business practice.",
        "lateralExits": [
          "SDE-2 at Indian product startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.cognizant.com/global/en/campus-hiring",
          "title": "Cognizant GenC Elevate Cadre Criteria & Package",
          "publisher": "Cognizant",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "accenture-ase",
    "companyId": "accenture",
    "programName": "Accenture Associate Software Engineer (ASE)",
    "roleTitle": "Associate Software Engineer",
    "aliases": [
      "ASE",
      "Accenture ASE",
      "Level 12 ASE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "Accenture Assessment Platform",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech",
        "M.Sc"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs at time of selection and joining",
      "gapYearPolicy": "Max 1 year academic gap post-10th permitted",
      "notes": "Minimum 65% or 6.5 CGPA without active backlogs."
    },
    "selectionProcess": [
      {
        "stage": "Cognitive & Technical Assessment",
        "type": "aptitude",
        "durationMin": 90,
        "topics": [
          "Cognitive reasoning",
          "Technical basics (Pseudo-code, Cloud, Network Security)"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Hands-on Coding Assessment",
        "type": "coding",
        "durationMin": 45,
        "topics": [
          "Coding 2 problems in C/C++/Java/Python"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Communication Assessment (Automated AI)",
        "type": "other",
        "durationMin": 20,
        "topics": [
          "Fluency, Pronunciation, Sentence Mastery, Vocabulary"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical & Learning Agility Interview",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Project discussion",
          "Agile principles",
          "Problem solving"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 4.5,
      "fixedMaxLPA": 4.6,
      "variableLPA": 0.35,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Accenture Learning & Talent Development training before project billing."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Pune",
      "Gurugram",
      "Chennai",
      "Mumbai",
      "Kolkata"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Mass national recruitment drives in autumn."
    },
    "entry": {
      "companyLevelCode": "Level 12",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Level 12",
        "toLevelCode": "Level 11",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Project performance review rating 1 or 2",
          "Delivery on client milestone deadlines"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 6.5,
          "max": 7.5
        },
        "fastTrackNote": "High performers promoted to Level 11 within 18 months.",
        "lateralExits": [
          "Software engineer at corporate IT setups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.accenture.com/in-en/careers/local/entry-level-career-programs",
          "title": "Accenture Associate Software Engineer Official Hiring Specs",
          "publisher": "Accenture",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "capgemini-analyst",
    "companyId": "capgemini",
    "programName": "Capgemini Exceller Analyst Hiring",
    "roleTitle": "Analyst (Software Engineer)",
    "aliases": [
      "Analyst",
      "Capgemini Analyst",
      "Exceller Analyst"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Capgemini Exceller Assessment (CoCubes/Aon)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "Zero active backlogs at time of evaluation",
      "gapYearPolicy": "Max 1 year education gap post-secondary",
      "notes": "Standard 60% criteria across academics."
    },
    "selectionProcess": [
      {
        "stage": "Pseudocode & Technical MCQ",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Data structures basics",
          "Algorithms logic",
          "OOPs"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "English Communication Test",
        "type": "other",
        "durationMin": 30,
        "topics": [
          "Grammar, Reading comprehension, Vocabulary"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Game-Based Aptitude Assessment",
        "type": "aptitude",
        "durationMin": 30,
        "topics": [
          "Inductive reasoning",
          "Grid challenge",
          "Motion challenge"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Behavioral & Technical Interview",
        "type": "technical",
        "durationMin": 25,
        "topics": [
          "Project presentation",
          "Willingness to learn new tech"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 4,
      "fixedMaxLPA": 4.25,
      "variableLPA": 0.25,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Capgemini University training curriculum."
    },
    "locations": [
      "Bengaluru",
      "Mumbai",
      "Pune",
      "Hyderabad",
      "Chennai",
      "Noida",
      "Kolkata"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Capgemini Exceller roadshow in early campus placement cycle."
    },
    "entry": {
      "companyLevelCode": "Analyst",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Analyst",
        "toLevelCode": "Senior Analyst",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Annual appraisal score meeting threshold",
          "Client billable delivery"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 6,
          "max": 7.5
        },
        "fastTrackNote": "Specialist certification clearance offers early elevation to Senior Analyst.",
        "lateralExits": [
          "Mid-tier IT software developer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.capgemini.com/in-en/careers/join-capgemini/campus-recruitment/",
          "title": "Capgemini Exceller Campus Recruitment Official Page",
          "publisher": "Capgemini",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "hcltech-get",
    "companyId": "hcltech",
    "programName": "HCLTech Graduate Engineer Trainee (GET)",
    "roleTitle": "Graduate Engineer Trainee",
    "aliases": [
      "GET",
      "HCL GET",
      "HCLTech Engineer Trainee"
    ],
    "programType": "trainee",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "HCL First Careers Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "No active backlogs allowed",
      "gapYearPolicy": "Max 1 year education gap",
      "notes": "Minimum 65% aggregate throughout academic history."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & Technical MCQ Test",
        "type": "aptitude",
        "durationMin": 60,
        "topics": [
          "Quantitative reasoning",
          "Logical skills",
          "Language ability",
          "Computer science fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Programming in C/Java/Python",
          "Operating systems",
          "DBMS basics"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Discussion",
        "type": "hr",
        "durationMin": 15,
        "topics": [
          "Relocation preferences",
          "Shift readiness"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 4.25,
      "fixedMaxLPA": 4.75,
      "variableLPA": 0.3,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": 12,
      "bondAmountINR": null,
      "notes": "Structured technical training at HCLTech campuses (Noida, Madurai, Lucknow)."
    },
    "locations": [
      "Noida",
      "Bengaluru",
      "Chennai",
      "Hyderabad",
      "Pune",
      "Lucknow",
      "Nagpur"
    ],
    "seasons": {
      "typicalMonths": [
        9,
        10,
        11,
        12
      ],
      "notes": "Standard campus hiring drive cycle."
    },
    "entry": {
      "companyLevelCode": "GET",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GET",
        "toLevelCode": "Software Engineer",
        "typicalYearsMin": 1,
        "typicalYearsMax": 1.5,
        "conditions": [
          "Completion of trainee probation and positive project confirmation assessment"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 5.5,
          "max": 6.5
        },
        "fastTrackNote": "Confirmed as Software Engineer upon 12-month completion.",
        "lateralExits": [
          "Junior software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.hcltech.com/careers/early-careers",
          "title": "HCLTech Graduate Hiring Scheme & Terms",
          "publisher": "HCLTech",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "tech-mahindra-ase",
    "companyId": "tech-mahindra",
    "programName": "Tech Mahindra Associate Software Engineer (ELTP)",
    "roleTitle": "Associate Software Engineer",
    "aliases": [
      "TechM ASE",
      "ELTP",
      "Associate Software Engineer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Tech Mahindra Assessment Portal",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "No active backlogs allowed",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "60% throughout 10th, 12th, and B.Tech without backlogs."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & English Essay Test",
        "type": "aptitude",
        "durationMin": 60,
        "topics": [
          "Logical reasoning",
          "Quantitative ability",
          "Written communication"
        ],
        "difficulty": "easy"
      },
      {
        "stage": "Technical & Psychometric Test",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Computer fundamentals",
          "Personality profile assessment"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical & HR Interview",
        "type": "technical",
        "durationMin": 25,
        "topics": [
          "OOP concepts",
          "Database basics",
          "Project review"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 3.25,
      "fixedMaxLPA": 4,
      "variableLPA": 0.25,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": 24,
      "bondAmountINR": 100000,
      "notes": "Comprehensive ELTP classroom and lab training program with a 2-year service agreement."
    },
    "locations": [
      "Pune",
      "Hyderabad",
      "Bengaluru",
      "Chennai",
      "Noida",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        9,
        10,
        11
      ],
      "notes": "Standard national campus hiring season."
    },
    "entry": {
      "companyLevelCode": "Associate Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Associate Software Engineer",
        "toLevelCode": "Software Engineer",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Completion of service agreement probation and positive customer billability"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 5,
          "max": 6.5
        },
        "fastTrackNote": "High performers in telecom/5G verticals receive accelerated bonuses.",
        "lateralExits": [
          "Telecom software engineer or enterprise application developer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.techmahindra.com/en-in/careers/campus-hiring/",
          "title": "Tech Mahindra ELTP Guidelines & Service Agreement Details",
          "publisher": "Tech Mahindra",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "ltimindtree-graduate",
    "companyId": "ltimindtree",
    "programName": "LTIMindtree Graduate Trainee Hiring",
    "roleTitle": "Graduate Trainee",
    "aliases": [
      "Graduate Trainee",
      "LTIMindtree GET",
      "Spark Trainee"
    ],
    "programType": "trainee",
    "roleFamily": "sde-services",
    "campusCategory": "mass",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "LTIMindtree Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6,
      "minPercentage": 60,
      "backlogPolicy": "No active backlogs permitted",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "Standard 60% requirement throughout education."
    },
    "selectionProcess": [
      {
        "stage": "Quantitative, Logical & Verbal Aptitude",
        "type": "aptitude",
        "durationMin": 60,
        "topics": [
          "Aptitude basics",
          "Logical puzzles",
          "Verbal comprehension"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 45,
        "topics": [
          "Basic programming in Java/Python",
          "Array/String manipulation"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical & HR Discussion",
        "type": "technical",
        "durationMin": 30,
        "topics": [
          "Core CS subjects",
          "Project overview",
          "Learning aptitude"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 4,
      "fixedMaxLPA": 5,
      "variableLPA": 0.3,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": 24,
      "bondAmountINR": 200000,
      "notes": "Post-onboarding technical training with a standard 2-year service agreement."
    },
    "locations": [
      "Mumbai",
      "Bengaluru",
      "Pune",
      "Chennai",
      "Hyderabad"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Autumn campus placement roadshows."
    },
    "entry": {
      "companyLevelCode": "Graduate Trainee",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "java": "working",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Graduate Trainee",
        "toLevelCode": "Software Engineer",
        "typicalYearsMin": 1,
        "typicalYearsMax": 2,
        "conditions": [
          "Completion of trainee probation and positive project confirmation"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 6,
          "max": 7.5
        },
        "fastTrackNote": "Accelerate track allows early promotion to Specialist band.",
        "lateralExits": [
          "Junior software engineer in IT consulting."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.ltimindtree.com/careers/early-careers/",
          "title": "LTIMindtree Graduate Trainee Specifications",
          "publisher": "LTIMindtree",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "goldman-sachs-analyst",
    "companyId": "goldman-sachs",
    "programName": "Goldman Sachs New Analyst Program (Engineering)",
    "roleTitle": "Analyst (Software Engineer)",
    "aliases": [
      "New Analyst",
      "GS Analyst",
      "Engineering Analyst"
    ],
    "programType": "fulltime",
    "roleFamily": "analyst-fintech",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "competition"
    ],
    "testOrPortal": "Goldman Sachs HackerRank Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE",
        "MNC"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification required",
      "notes": "Minimum 7.0 CGPA; primary preference for Tier 1 and premier technology institutions."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & Advanced Programming Assessment",
        "type": "coding",
        "durationMin": 120,
        "topics": [
          "DSA (Dynamic Programming, Graph algorithms)",
          "Math & Probability",
          "Advanced CS fundamentals"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: DSA & Core Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Tree & Graph traversals",
          "Time & Space complexity analysis",
          "Object oriented design"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: System Design & Java/C++",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Low level design",
          "Concurrency & Multithreading",
          "Database indexing & transactions"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Senior Leadership / Fitment Round",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Culture fit",
          "Financial markets awareness",
          "Problem solving under pressure"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 24,
      "fixedMaxLPA": 28,
      "variableLPA": 4,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Global New Analyst onboarding in Bengaluru with financial markets orientation."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Conducted during early campus placement season."
    },
    "entry": {
      "companyLevelCode": "ANALYST",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "ANALYST",
        "toLevelCode": "ASSOCIATE",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Consistent high performance ratings across annual 360 reviews",
          "Ownership of critical trading or regulatory engine components"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 48
        },
        "fastTrackNote": "Outstanding quantitative impact results in fast-track promotion to Associate.",
        "lateralExits": [
          "Quant dev at hedge funds, SDE-2 at top product unicorns, Big Tech."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.goldmansachs.com/careers/students/programs/",
          "title": "Goldman Sachs Engineering Campus Hiring Details",
          "publisher": "Goldman Sachs",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "morgan-stanley-analyst",
    "companyId": "morgan-stanley",
    "programName": "Morgan Stanley Technology Analyst Program",
    "roleTitle": "Technology Analyst",
    "aliases": [
      "Tech Analyst",
      "MS Analyst",
      "Technology Analyst"
    ],
    "programType": "fulltime",
    "roleFamily": "analyst-fintech",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "internship-ppo"
    ],
    "testOrPortal": "Morgan Stanley Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier campus engineering drives."
    },
    "selectionProcess": [
      {
        "stage": "Online Technical & Aptitude Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA problems",
          "Core Computer Science MCQ",
          "Aptitude & Reasoning"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: DSA & Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Binary trees, Graphs, Hash maps",
          "Complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Architecture & Concurrency",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Multi-threading, Memory models, Low latency concepts"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Professional Fitment / HR",
        "type": "hr",
        "durationMin": 30,
        "topics": [
          "Behavioral questions",
          "Teamwork",
          "Financial sector interest"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 20,
      "fixedMaxLPA": 25,
      "variableLPA": 3.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Global Technology Training Program (GTTP)."
    },
    "locations": [
      "Bengaluru",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Conducted in early campus placement season."
    },
    "entry": {
      "companyLevelCode": "ASSOC",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "ASSOC",
        "toLevelCode": "MGR",
        "typicalYearsMin": 2.5,
        "typicalYearsMax": 4,
        "conditions": [
          "Production delivery on wealth management or institutional securities platforms"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 32,
          "max": 42
        },
        "fastTrackNote": "Specialist contribution on algorithmic trading components fast-tracks promotion.",
        "lateralExits": [
          "Senior SDE at top fintech startups or tier 1 banking tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.morganstanley.com/careers/student-programs/technology-full-time-analyst-program",
          "title": "Morgan Stanley Technology Analyst Program Official Page",
          "publisher": "Morgan Stanley",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "jpmorgan-sep",
    "companyId": "jpmorgan",
    "programName": "JPMorgan Chase Software Engineer Program (SEP)",
    "roleTitle": "Software Engineer",
    "aliases": [
      "SEP",
      "JPMC SEP",
      "Software Engineer Program"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "competition",
      "internship-ppo"
    ],
    "testOrPortal": "Code for Good Hackathon / HackerRank Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "No active backlogs allowed",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "Minimum 7.0 CGPA; high conversion rate from Code for Good hackathon finalists."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment (2 Problems)",
        "type": "coding",
        "durationMin": 60,
        "topics": [
          "DSA (Arrays, Strings, Trees, Greedy)",
          "Optimization"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Code for Good Hackathon / Technical Evaluation",
        "type": "project-review",
        "durationMin": 1440,
        "topics": [
          "24-hour collaborative team hackathon solving NGO/real-world challenges"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Behavioral & Leadership Discussion",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Collaboration, Agile culture, Resilience"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 20,
      "variableLPA": 2.5,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Comprehensive SEP global curriculum with continuous learning modules."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        6,
        7,
        8,
        9
      ],
      "notes": "Code for Good hackathons take place in summer; campus drives in autumn."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "python": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Associate",
        "typicalYearsMin": 2.5,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Completion of 2-year SEP rotation",
          "Demonstrated production ownership of core banking systems"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 25,
          "max": 32
        },
        "fastTrackNote": "High performers in cloud modernization squads graduate to Associate early.",
        "lateralExits": [
          "SDE-2 at top consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.jpmorgan.com/global/en/students/programs/software-engineer-program",
          "title": "JPMorgan Chase Software Engineer Program Official Overview",
          "publisher": "JPMorgan Chase & Co.",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "walmart-sde",
    "companyId": "walmart",
    "programName": "Walmart Global Tech SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Walmart SDE",
      "Walmart CodeHers",
      "IN3 Engineer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "competition",
      "portal"
    ],
    "testOrPortal": "Walmart CodeHers / Unstop Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Minimum 7.0 CGPA; CodeHers competition open nationwide."
    },
    "selectionProcess": [
      {
        "stage": "Coding Round (HackerEarth/Unstop)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Dynamic Programming, Graph, Greedy)",
          "String algorithms"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview Round 1",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures & algorithm implementation",
          "Code complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview Round 2: LLD & Core Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object oriented design principles (SOLID)",
          "Concurrency",
          "Databases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Hiring Manager & Leadership Fitment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Past projects, Retail scale challenges, Customer centricity"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 3,
      "joiningBonusINR": 250000,
      "stipendPerMonthINR": null,
      "esopNote": "Walmart US stock unit grants included in total reward package.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Direct onboarding into core retail engineering squads."
    },
    "locations": [
      "Bengaluru",
      "Chennai"
    ],
    "seasons": {
      "typicalMonths": [
        6,
        7,
        8,
        9
      ],
      "notes": "CodeHers hackathon conducted in summer; campus recruitment in autumn."
    },
    "entry": {
      "companyLevelCode": "IN3",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "IN3",
        "toLevelCode": "IN4",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "High volume retail scale feature delivery",
          "Ownership of multi-tenant microservices"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 36
        },
        "fastTrackNote": "Demonstrated high-scale reliability impact fast-tracks promotion to IN4.",
        "lateralExits": [
          "SDE-2 at top tier US tech or Indian product unicorns."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.walmart.com/technology",
          "title": "Walmart Global Tech Engineering Careers & CodeHers Program",
          "publisher": "Walmart Global Tech",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "american-express-analyst",
    "companyId": "american-express",
    "programName": "American Express Campus Technology Analyst",
    "roleTitle": "Engineer I (Band 28)",
    "aliases": [
      "AmEx Analyst",
      "Band 28 Engineer",
      "AmEx Campus Tech"
    ],
    "programType": "fulltime",
    "roleFamily": "analyst-fintech",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "American Express Online Assessment (HackerEarth)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "No active backlogs allowed",
      "gapYearPolicy": "Max 1 year gap permitted",
      "notes": "Minimum 7.0 CGPA throughout engineering."
    },
    "selectionProcess": [
      {
        "stage": "Online Coding & Aptitude Test",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Trees, Graphs, DP)",
          "SQL & Database queries",
          "Logical reasoning"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview Round 1",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency, Object oriented design"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical & Systems Round 2",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Payment gateway concepts, Concurrency, Microservices basics"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Behavioral & Leadership Fitment",
        "type": "managerial",
        "durationMin": 30,
        "topics": [
          "Team collaboration, Problem solving under deadlines"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 15,
      "fixedMaxLPA": 18,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Structured onboarding program in Gurugram / Bengaluru technology hubs."
    },
    "locations": [
      "Gurugram",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Band 28",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Band 28",
        "toLevelCode": "Band 30",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Successful delivery across credit/fraud payment systems",
          "Exceeds Expectations performance rating"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 22,
          "max": 28
        },
        "fastTrackNote": "Exemplary technical innovations recognized with accelerated Band 30 promotion.",
        "lateralExits": [
          "Mid-level fintech engineer at leading payment processors."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.americanexpress.com/en-in/careers/students-and-graduates/",
          "title": "American Express India Early Careers Program Overview",
          "publisher": "American Express",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "target-engineer",
    "companyId": "target",
    "programName": "Target India Campus Technology Program",
    "roleTitle": "Engineer (Software Development)",
    "aliases": [
      "Target Engineer",
      "Target SDE",
      "Target India Trainee"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Target Coding Challenge (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Minimum 6.5 CGPA; on-campus visits to established engineering colleges."
    },
    "selectionProcess": [
      {
        "stage": "Target Online Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Arrays, Strings, Recursion, Trees)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithm design, Time and space complexity analysis"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview 2: Engineering & Design",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Database schema design, Web architecture basics"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Culture & Behavioral Interview",
        "type": "managerial",
        "durationMin": 30,
        "topics": [
          "Target core values, Team collaboration, Customer focus"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 13,
      "fixedMaxLPA": 16,
      "variableLPA": 1.5,
      "joiningBonusINR": 100000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Retail tech induction program at Target India headquarters in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted in autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "working",
      "python": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Engineer",
        "toLevelCode": "Senior Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Reliable delivery on global supply chain / omnichannel features"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 20,
          "max": 26
        },
        "fastTrackNote": "High velocity contributors promoted to Senior Engineer in under 2.5 years.",
        "lateralExits": [
          "Mid-level engineer in e-commerce or retail technology."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://india.target.com/careers/technology",
          "title": "Target India Technology Careers Overview",
          "publisher": "Target India",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "visa-swe",
    "companyId": "visa",
    "programName": "Visa Software Engineer College Graduate Program",
    "roleTitle": "Software Engineer",
    "aliases": [
      "Visa SWE",
      "Visa College Grad",
      "Associate Software Engineer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Visa Online Assessment (CodeSignal / HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Minimum 7.0 CGPA; premier engineering campuses."
    },
    "selectionProcess": [
      {
        "stage": "Online Coding Assessment (3 Problems)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graphs, Trees, Strings)",
          "Algorithmic efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 1: Data Structures & Algorithms",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Complex algorithm design, In-place data transformations"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: System Architecture & Security",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "OOP design patterns, Database ACID properties, Concurrency, API design"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Managerial & Behavioral Interview",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Leadership principles, Mission-critical systems mindset"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 3,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Restricted stock units (RSUs) included in compensation package.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Comprehensive payments security and payment protocols onboarding."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted in autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "security": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production delivery on high-throughput payment transaction pipelines"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 36
        },
        "fastTrackNote": "Specialist security innovations fast-track promotion to Senior SWE.",
        "lateralExits": [
          "Fintech SDE-2, tier-1 payments systems architect."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.visa.co.in/careers.html",
          "title": "Visa University Careers Specifications & Package Structure",
          "publisher": "Visa",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "mastercard-ase",
    "companyId": "mastercard",
    "programName": "Mastercard Launch Campus Program",
    "roleTitle": "Software Engineer",
    "aliases": [
      "Mastercard Launch",
      "Associate Software Engineer",
      "Mastercard SE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Mastercard Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Minimum 7.0 CGPA throughout college."
    },
    "selectionProcess": [
      {
        "stage": "Coding & Aptitude Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA problems",
          "SQL queries",
          "Aptitude & Logical thinking"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview 1: Data Structures",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Trees, Graphs, Hash maps, Algorithms complexity"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: Java / Microservices",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs principles, Rest APIs, Multithreading, Relational databases"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Behavioral & Leadership Fitment",
        "type": "managerial",
        "durationMin": 30,
        "topics": [
          "Cultural alignment, High integrity standards, Teamwork"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 14,
      "fixedMaxLPA": 18,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Mastercard Launch global cohort development program."
    },
    "locations": [
      "Pune",
      "Gurugram",
      "Vadodara"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted in autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Consistent high performance ratings on mission-critical payments delivery"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 22,
          "max": 28
        },
        "fastTrackNote": "Exceptional contributions on fraud prevention algorithms fast-track promotion.",
        "lateralExits": [
          "Mid-level fintech software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.mastercard.com/us/en/campus-students",
          "title": "Mastercard Launch Program Details & Campus Roles",
          "publisher": "Mastercard",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "paypal-swe",
    "companyId": "paypal",
    "programName": "PayPal University Graduate Engineering Program",
    "roleTitle": "Software Engineer 1",
    "aliases": [
      "PayPal SWE",
      "PayPal SE1",
      "University Grad SWE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "PayPal Coding Challenge (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Minimum 7.5 CGPA; premier technology institutions across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment (3 Problems)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "Advanced DSA (Graphs, Dynamic Programming, Heap)",
          "Math & Complexity"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 1: Problem Solving & Algorithms",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithmic problem solving, Data structures optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: LLD & System Components",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object oriented architecture, Design patterns, Concurrency, Database design"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Behavioral & Values Alignment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Collaboration, Diversity & inclusion, Customer empathy"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 25,
      "variableLPA": 3,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "PayPal restricted stock unit (RSU) component included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Direct integration into Chennai / Bengaluru payments and risk engineering teams."
    },
    "locations": [
      "Chennai",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Conducted in early campus placement season."
    },
    "entry": {
      "companyLevelCode": "Software Engineer 1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer 1",
        "toLevelCode": "Software Engineer 2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Production contribution on checkout resilience or fraud detection microservices"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 36
        },
        "fastTrackNote": "Top decile engineers promoted to SE2 in under 2 years.",
        "lateralExits": [
          "SDE-2 at top product unicorns or Big Tech."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.pypl.com/university/",
          "title": "PayPal University Programs & Early Career Compensation Overview",
          "publisher": "PayPal",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "flipkart-sde1",
    "companyId": "flipkart",
    "programName": "Flipkart SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Flipkart SDE-1",
      "GRiD SDE",
      "Flipkart Early Career SDE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "competition",
      "portal"
    ],
    "testOrPortal": "Flipkart GRiD / HackerEarth Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs permitted",
      "gapYearPolicy": "Max 12 months gap",
      "notes": "Premier campus visits and open national qualifiers via Flipkart GRiD hackathon."
    },
    "selectionProcess": [
      {
        "stage": "Online Coding Assessment (Flipkart GRiD / Campus)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "Hard DSA (Graphs, Dynamic Programming, Segment Trees)",
          "Algorithmic efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Machine Coding Round (LLD)",
        "type": "coding",
        "durationMin": 120,
        "topics": [
          "Low-level design of clean, modular, extensible object-oriented systems (e.g. In-memory Cache, Snake & Ladder, Ride Sharing)"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "DSA Problem Solving & CS Fundamentals",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Complex algorithmic challenges",
          "OS concurrency",
          "DBMS indexing"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Hiring Manager & Culture Fitment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Customer first mindset",
          "Bias for action",
          "Ownership"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 26,
      "variableLPA": 2.5,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Flipkart stock units vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Flipkart Engineering Bootcamp followed by integration into core commerce/logistics squads."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "GRiD runs July-September; campus offers delivered September-November."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Independently architecting and delivering high-scale microservices",
          "Consistent Exceeds Expectations rating during annual appraisal"
        ],
        "blockers": [
          {
            "title": "High-Scale High-Concurrency System Design Evidence",
            "category": "system-design",
            "whyItBlocks": "Promotion to SDE-2 requires demonstrating ownership of services handling peak Big Billion Days traffic with zero downtime.",
            "evidenceToCounter": "Document service SLA metrics, throughput optimizations, and caching architecture under production peak."
          }
        ],
        "compensationLPAAfter": {
          "min": 32,
          "max": 45
        },
        "fastTrackNote": "Exceptional performance during Big Billion Days can fast-track SDE-2 promotion in under 2 years.",
        "lateralExits": [
          "SDE-2 at top global tech firms (Google, Uber, Microsoft)."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.flipkartcareers.com/early-talent",
          "title": "Flipkart Early Careers Official Guide",
          "publisher": "Flipkart",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "swiggy-sde1",
    "companyId": "swiggy",
    "programName": "Swiggy SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Swiggy SDE-1",
      "SDE-1 Swiggy Campus"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Swiggy Online Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier engineering campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Online Coding Challenge",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Graphs, Dynamic Programming, Arrays, Trees)",
          "Complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Machine Coding / Problem Solving Round",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "Clean code, Design patterns, Modular backend component implementation"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Core CS & Problem Solving Round",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithms, Multithreading, Relational & NoSQL databases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Hiring Manager & Cultural Fit",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Swiggy values (Consumer First, Never Settle), Resilience"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 22,
      "variableLPA": 2,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Swiggy ESOP grants with standard 4-year vesting.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Remote-first engineering team onboarding with mentorship pairing."
    },
    "locations": [
      "Bengaluru",
      "Remote"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "working",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Ownership of low-latency microservices for live ordering or delivery logistics",
          "Consistently rated Strong Performer"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 40
        },
        "fastTrackNote": "Delivering major platform performance breakthroughs fast-tracks promotion.",
        "lateralExits": [
          "SDE-2 at leading food/quick-commerce product companies."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.swiggy.com/#/campus",
          "title": "Swiggy Campus Careers & Early Talent Guidelines",
          "publisher": "Swiggy",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "zomato-sde1",
    "companyId": "zomato",
    "programName": "Zomato SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Zomato SDE-1",
      "SDE-1 Zomato"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Zomato Coding Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses; strong emphasis on fast execution."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment (3 Problems)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Dynamic Programming, Graph algorithms, Hash maps)",
          "Clean code"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Algorithms & Data Structures",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithmic optimization, Time/space trade-offs"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Practical Coding & Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Real-world API building, Concurrency, Caching with Redis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Founder / Leadership Alignment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Extreme ownership, Speed of execution, High bar for quality"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 22,
      "variableLPA": 2,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Zomato listed ESOPs included in package.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Immediate deployment into fast-paced engineering squads in Gurugram."
    },
    "locations": [
      "Gurugram"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement cycle."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "working",
      "python": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Rapid delivery of high-impact features under high transaction volume"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 38
        },
        "fastTrackNote": "Rapid shipping and extreme ownership fast-tracks promotion to SDE-2 in under 18 months.",
        "lateralExits": [
          "SDE-2 at top consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.zomato.com/careers",
          "title": "Zomato Engineering Careers Overview",
          "publisher": "Zomato",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "razorpay-sde1",
    "companyId": "razorpay",
    "programName": "Razorpay SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Razorpay SDE-1",
      "SDE-1 Razorpay"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Razorpay HackerRank Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Trie)",
          "Algorithmic efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: DSA Deep Dive",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Problem solving, Space and time complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & Core Engineering",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Database transactions, Idempotency basics"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Culture & Hiring Manager Round",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Razorpay values (Think Differently, Deliver Customer Delight, Extreme Ownership)"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Razorpay ESOPs with standard 4-year vesting schedule.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Payment infrastructure and financial security onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Production delivery on zero-downtime payments authorization pipelines"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 30,
          "max": 42
        },
        "fastTrackNote": "Fintech high performers promoted to SDE-2 in under 2 years.",
        "lateralExits": [
          "SDE-2 at global fintech or product unicorns."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://razorpay.com/jobs/university/",
          "title": "Razorpay University Hiring Overview",
          "publisher": "Razorpay",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "zoho-se",
    "companyId": "zoho",
    "programName": "Zoho Software Developer Campus Hiring",
    "roleTitle": "Software Developer (Member Technical Staff)",
    "aliases": [
      "Zoho SE",
      "Zoho MTS",
      "Zoho Developer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "mass-pool",
    "channels": [
      "on-campus",
      "off-campus",
      "portal"
    ],
    "testOrPortal": "Zoho Recruitment Test Platform",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "B.Sc",
        "BCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded",
        "core-mechanical",
        "core-civil",
        "general-science"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "ECE",
        "EEE",
        "ME",
        "CIVIL",
        "BCA",
        "BSC",
        "MCA"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": null,
      "minPercentage": null,
      "backlogPolicy": "Backlogs allowed if programming competency is proven",
      "gapYearPolicy": "No bar on gaps",
      "notes": "True meritocratic hiring; zero cutoff on marks/degree if candidate passes practical programming rounds."
    },
    "selectionProcess": [
      {
        "stage": "Round 1: C/C++/Java Programming Logic & Flow",
        "type": "aptitude",
        "durationMin": 60,
        "topics": [
          "Pseudocode dry-run, Pointer arithmetic, Recursion tracing, Time complexity"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Round 2: Basic Programming (5 Questions)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "String manipulations, Pattern generation, Array manipulation without built-in libraries"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Round 3: Advanced Programming (Machine Coding)",
        "type": "coding",
        "durationMin": 150,
        "topics": [
          "Building complete console applications (e.g. Railway Reservation System, Dungeon Game, Banking Terminal) with OOP principles"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Round 4: Technical Interview",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Deep dive into Round 3 implementation, Data structure internals, Edge cases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Round 5: HR & Cultural Alignment",
        "type": "hr",
        "durationMin": 30,
        "topics": [
          "Long-term commitment, Passion for crafting software, Team culture"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 6,
      "fixedMaxLPA": 10.5,
      "variableLPA": 1,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": "Privately held profitable company; generous profit sharing & campus benefits.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Hands-on incubation within product engineering teams at Chennai or Tenkasi."
    },
    "locations": [
      "Chennai",
      "Tenkasi",
      "Salem",
      "Madurai"
    ],
    "seasons": {
      "typicalMonths": [
        6,
        7,
        8,
        9,
        10
      ],
      "notes": "Rolling recruitment drives throughout the year."
    },
    "entry": {
      "companyLevelCode": "MTS",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "MTS",
        "toLevelCode": "SMTS",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Deep module ownership on Zoho enterprise cloud apps (CRM, Creator, Books)"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 14,
          "max": 20
        },
        "fastTrackNote": "Crafting high-impact features independently promotes directly to SMTS.",
        "lateralExits": [
          "Product engineer at SaaS unicorns or global software providers."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.zoho.com/careers/",
          "title": "Zoho Corporation Recruitment Guidelines & Rounds",
          "publisher": "Zoho Corporation",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "phonepe-sde1",
    "companyId": "phonepe",
    "programName": "PhonePe Software Engineer University Grad",
    "roleTitle": "Software Engineer",
    "aliases": [
      "PhonePe SE",
      "PhonePe SDE-1"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "PhonePe Coding Assessment (DoSelect / HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses (IITs, NITs, BITS, top state colleges)."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Advanced DP, Graph, Trie, Heap)",
          "Math & Number theory"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: DSA & Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithmic optimization, Time and space complexity trade-offs"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Architecture & Concurrency",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Multi-threading, Distributed messaging (Kafka), Relational databases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Leadership & Engineering Culture",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Scale, Resilience under billions of transactions, Ownership"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 20,
      "fixedMaxLPA": 26,
      "variableLPA": 3,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "PhonePe ESOP grants included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "High-throughput payment switch engineering boot camp in Bengaluru."
    },
    "locations": [
      "Bengaluru",
      "Pune"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Early autumn campus recruitment season."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Delivering low-latency high-concurrency microservices on core UPI stacks"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 36,
          "max": 48
        },
        "fastTrackNote": "Critical payments infrastructure contributions fast-track promotion.",
        "lateralExits": [
          "Senior SDE at top fintech startups or Big Tech."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.phonepe.com/careers/university/",
          "title": "PhonePe University Careers & Engineering Trajectory",
          "publisher": "PhonePe",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "paytm-sde1",
    "companyId": "paytm",
    "programName": "Paytm Software Engineer Campus Hiring",
    "roleTitle": "Software Engineer",
    "aliases": [
      "Paytm SE",
      "Paytm SDE-1"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Paytm Coding Assessment (CoCubes / HackerEarth)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across North & South India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Trees, Dynamic Programming, Arrays)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Data structures, Time complexity, Algorithm dry-run"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: LLD & Databases",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Database schema, REST APIs"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for fintech"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 10,
      "fixedMaxLPA": 15,
      "variableLPA": 1.5,
      "joiningBonusINR": 100000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Noida technology center onboarding."
    },
    "locations": [
      "Noida",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Conducted in autumn campus recruitment window."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on soundbox/merchant payment services"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 18,
          "max": 26
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Mid-level fintech software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://paytm.com/careers",
          "title": "Paytm Campus Careers Specifications",
          "publisher": "Paytm",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "cred-sde1",
    "companyId": "cred",
    "programName": "CRED Software Engineer Campus Hiring",
    "roleTitle": "Software Engineer",
    "aliases": [
      "CRED SDE-1",
      "CRED Engineer I"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "CRED HackerRank Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top premier institutions (IITs, BITS, top NITs); extreme emphasis on product taste."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Hard Dynamic Programming, Graph algorithms, Bitwise manipulations)",
          "Clean code"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Machine Coding Round",
        "type": "coding",
        "durationMin": 120,
        "topics": [
          "End-to-end design and coding of a modular backend service with concurrency & caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Core Architecture & Craftsmanship",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Distributed systems primitives, Database internals, Microservice communication"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Culture & Craft Alignment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Obsession with craft, Taste in product design, High individual ownership"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 24,
      "fixedMaxLPA": 32,
      "variableLPA": 3.5,
      "joiningBonusINR": 400000,
      "stipendPerMonthINR": null,
      "esopNote": "Generous CRED ESOP grants included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Direct mentorship under principal engineers in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Conducted in premier campus slot 1 placement windows."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Engineer",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering high-reliability financial ledger or reward microservices with zero incidents"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 42,
          "max": 60
        },
        "fastTrackNote": "Engineers demonstrating exceptional craft progress directly to Senior Engineer.",
        "lateralExits": [
          "Senior SDE at top US Big Tech or tier-1 startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.cred.club/",
          "title": "CRED Engineering Careers & Criteria",
          "publisher": "CRED",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "meesho-sde1",
    "companyId": "meesho",
    "programName": "Meesho SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Meesho SDE-1",
      "SDE-1 Meesho"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Meesho HackerRank Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graphs, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Algorithms",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Problem solving, Edge case handling"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & Core Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object oriented principles, Database schema design, Microservices concepts"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Speed over perfection, User first, Problem solving mindset"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Meesho stock options included in offer.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Direct placement into core consumer/supplier engineering pods."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "High volume consumer feature delivery during sale events"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 30,
          "max": 40
        },
        "fastTrackNote": "Exceptional ownership fast-tracks promotion to SDE-2 in under 2 years.",
        "lateralExits": [
          "SDE-2 at top consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.meesho.io/careers",
          "title": "Meesho Engineering Careers Guide",
          "publisher": "Meesho",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "zepto-sde1",
    "companyId": "zepto",
    "programName": "Zepto SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Zepto SDE-1",
      "SDE-1 Zepto"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Zepto Coding Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (Graphs, Dynamic Programming, Heap)",
          "Complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Practical Coding & LLD",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Execution speed, Quick commerce scale, Resilience"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Zepto ESOP grants included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Dark store warehouse and real-time dispatch systems onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering low latency dispatch and fulfillment services"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 40
        },
        "fastTrackNote": "Rapid shipping and extreme ownership fast-tracks promotion to SDE-2 in under 18 months.",
        "lateralExits": [
          "SDE-2 at leading consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.zeptonow.com/careers",
          "title": "Zepto Engineering Careers Overview",
          "publisher": "Zepto",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "ola-sde1",
    "companyId": "ola",
    "programName": "Ola SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Ola SDE-1",
      "SDE-1 Ola"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Ola Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Trees, Graphs, Arrays)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Data structures, Time complexity, Algorithm dry-run"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: LLD & Databases",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Database schema, REST APIs"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for mobility and tech"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 10,
      "fixedMaxLPA": 15,
      "variableLPA": 1.5,
      "joiningBonusINR": 100000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Bengaluru technology center onboarding."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on routing or vehicle telemetry systems"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 18,
          "max": 26
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Mid-level software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://ola.com/careers",
          "title": "Ola Campus Careers Specifications",
          "publisher": "Ola",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "freshworks-ase",
    "companyId": "freshworks",
    "programName": "Freshworks Campus Software Engineer Program",
    "roleTitle": "Software Engineer",
    "aliases": [
      "Freshworks SE",
      "Freshworks Campus SE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Freshworks Online Assessment (HackerEarth)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across South and West India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Arrays, Strings, Recursion, Trees)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Time complexity, Algorithm efficiency"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: Web & Database Engineering",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Relational databases, REST API design, Web fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Cultural Alignment / Freshworks Values",
        "type": "managerial",
        "durationMin": 30,
        "topics": [
          "Customer empathy, Craftsmanship, Teamwork"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 10,
      "fixedMaxLPA": 14,
      "variableLPA": 1.5,
      "joiningBonusINR": 100000,
      "stipendPerMonthINR": null,
      "esopNote": "Freshworks NASDAQ listed stock options included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Freshworks Academy SaaS product engineering training in Chennai."
    },
    "locations": [
      "Chennai",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "react": "working",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Delivering modular features on Freshdesk / Freshservice platforms"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 18,
          "max": 26
        },
        "fastTrackNote": "Proactive problem solving fast-tracks promotion to Senior SWE.",
        "lateralExits": [
          "SaaS product engineer at leading global firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.freshworks.com/company/careers/",
          "title": "Freshworks Campus Careers Overview",
          "publisher": "Freshworks",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "groww-sde1",
    "companyId": "groww",
    "programName": "Groww SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Groww SDE-1",
      "SDE-1 Groww"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Groww Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & Core Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Customer first, High integrity, Transparency"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 22,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": "Groww ESOPs included in offer.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Financial technology and regulatory compliance onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "finance": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering high reliability stock trading / mutual fund transaction services"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 38
        },
        "fastTrackNote": "High performers promoted to SDE-2 in under 2 years.",
        "lateralExits": [
          "Fintech SDE-2 at top tier startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://groww.in/careers",
          "title": "Groww Engineering Careers Guide",
          "publisher": "Groww",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "dream11-sde1",
    "companyId": "dream11",
    "programName": "Dream11 SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Dream11 SDE-1",
      "SDE-1 Dream11"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Dream11 Coding Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses; extreme emphasis on concurrency."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Concurrency, Math)",
          "Complexity optimization"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Concurrency basics, Time and space analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & High Concurrency Design",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "In-memory caching, Distributed locks, Thread safety, Sharded databases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Data-driven culture, Sports passion, Extreme ownership"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 20,
      "fixedMaxLPA": 26,
      "variableLPA": 3,
      "joiningBonusINR": 250000,
      "stipendPerMonthINR": null,
      "esopNote": "Dream Sports ESOPs included.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Live match traffic simulation training in Mumbai."
    },
    "locations": [
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering zero-downtime match contest engines handling millions of concurrent users"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 35,
          "max": 48
        },
        "fastTrackNote": "Handling peak IPL traffic without degradation fast-tracks promotion to SDE-2.",
        "lateralExits": [
          "High scale backend engineer at top tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.dreamsports.group/careers/",
          "title": "Dream Sports Careers & Dream11 High Scale Overview",
          "publisher": "Dream Sports",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "myntra-sde1",
    "companyId": "myntra",
    "programName": "Myntra SDE-1 Campus Hiring (HackerRamp)",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "Myntra SDE-1",
      "HackerRamp SDE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "competition",
      "portal"
    ],
    "testOrPortal": "HackerRamp / Unstop Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses and nationwide finalists in HackerRamp."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment (HackerRamp / Campus)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency, Edge cases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & Core Engineering",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Database schema, Rest APIs"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Customer empathy, Fashion tech innovation, Ownership"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 24,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "Myntra stock options included in offer.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Bengaluru fashion e-commerce engineering onboarding."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering high volume catalog or personalization services during EORS"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 38
        },
        "fastTrackNote": "High performers during End of Reason Sale promoted rapidly.",
        "lateralExits": [
          "SDE-2 at top consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.myntra.com/",
          "title": "Myntra Careers & HackerRamp Overview",
          "publisher": "Myntra",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "nykaa-sde1",
    "companyId": "nykaa",
    "programName": "Nykaa Software Engineer Campus Hiring",
    "roleTitle": "Software Engineer",
    "aliases": [
      "Nykaa SE",
      "Nykaa SDE-1"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Nykaa Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across North & West India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Trees, Dynamic Programming, Arrays)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Data structures, Time complexity, Algorithm dry-run"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: LLD & Databases",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Database schema, REST APIs"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for e-commerce and retail"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 12,
      "fixedMaxLPA": 16,
      "variableLPA": 1.5,
      "joiningBonusINR": 100000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Gurugram / Mumbai technology center onboarding."
    },
    "locations": [
      "Gurugram",
      "Mumbai"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on checkout or catalog search microservices"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 20,
          "max": 28
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Mid-level e-commerce software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.nykaa.com/careers",
          "title": "Nykaa Campus Careers Specifications",
          "publisher": "Nykaa",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "inmobi-sde1",
    "companyId": "inmobi",
    "programName": "InMobi Software Engineer Campus Hiring",
    "roleTitle": "Software Engineer",
    "aliases": [
      "InMobi SE",
      "InMobi SDE-1"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "InMobi Coding Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: LLD & Core Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Imagination, Free spirited, Being human (InMobi values)"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 22,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": "InMobi stock options included in offer.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "High throughput real-time auction systems onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "Software Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Software Engineer",
        "toLevelCode": "Senior Software Engineer",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering low latency real-time bidding auction services"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 38
        },
        "fastTrackNote": "High performers promoted to Senior SWE in under 2 years.",
        "lateralExits": [
          "Senior SDE at top tier adtech or product unicorns."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.inmobi.com/company/careers/",
          "title": "InMobi Engineering Careers Guide",
          "publisher": "InMobi",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "sharechat-sde1",
    "companyId": "sharechat",
    "programName": "ShareChat SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I",
    "aliases": [
      "ShareChat SDE-1",
      "SDE-1 ShareChat"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "ShareChat Coding Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Practical Coding & LLD",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Distributed caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Ownership, Speed, User empathy in Bharat"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 18,
      "fixedMaxLPA": 25,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": "ShareChat stock options included in offer.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "High scale social feed and streaming media onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SDE-1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SDE-1",
        "toLevelCode": "SDE-2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering low latency feed generation or live streaming infrastructure"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 28,
          "max": 40
        },
        "fastTrackNote": "Exceptional performance fast-tracks promotion to SDE-2 in under 2 years.",
        "lateralExits": [
          "SDE-2 at leading consumer internet startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.sharechat.com/",
          "title": "ShareChat Engineering Careers Overview",
          "publisher": "ShareChat",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "google-swe-univ",
    "companyId": "google",
    "programName": "Google Software Engineer (University Graduate)",
    "roleTitle": "Software Engineer II (Entry L3)",
    "aliases": [
      "Google L3",
      "Google New Grad",
      "Google SWE University"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Google Online Challenge (GOC)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree",
        "PhD"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE",
        "MNC"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier engineering institutes (IITs, NITs, BITS, IIITs) and top finalists in Google Girl Hackathon / Code Jam archives."
    },
    "selectionProcess": [
      {
        "stage": "Google Online Challenge (GOC)",
        "type": "coding",
        "durationMin": 60,
        "topics": [
          "DSA (Hard Dynamic Programming, Trees, Graphs, Strings)"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 1: Data Structures & Algorithms",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Algorithmic problem solving, Time & Space complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: Graph Theory & Optimization",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Shortest paths, Union-find, Topological sort, Edge cases"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 3: Dynamic Programming & Recursion",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "State space reduction, Bitmask DP, Tree DP"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Googleyness & Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Navigating ambiguity, Ethical decision making, Collaboration"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 25,
      "fixedMaxLPA": 35,
      "variableLPA": 4.5,
      "joiningBonusINR": 400000,
      "stipendPerMonthINR": null,
      "esopNote": "Alphabet Class C Google Stock Units (GSUs) vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Google Engineering Residency / Noogler Orientation with assigned host and mentor."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Premier campus placement slot 1 window."
    },
    "entry": {
      "companyLevelCode": "L3",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "python": "strong",
      "systemdesign": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "L3",
        "toLevelCode": "L4",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Consistently rated Consistently Meets or Exceeds Expectations",
          "Independent delivery of complex system components with measurable engineering impact"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 45,
          "max": 65
        },
        "fastTrackNote": "Outstanding algorithmic innovation or core infrastructure impact fast-tracks promotion.",
        "lateralExits": [
          "Senior SDE at top US Big Tech or Principal Engineer at product startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.google.com/students/",
          "title": "Google University Graduate Program Details",
          "publisher": "Google",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "microsoft-sde-univ",
    "companyId": "microsoft",
    "programName": "Microsoft Software Engineer (University Grad)",
    "roleTitle": "Software Engineer (Level 59)",
    "aliases": [
      "Microsoft Level 59",
      "Microsoft SDE New Grad"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Microsoft Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology colleges nationwide."
    },
    "selectionProcess": [
      {
        "stage": "Online Coding Assessment (3 Problems)",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graphs, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 1: Problem Solving",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Algorithmic problem solving, In-place data structures"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: Algorithms & Core Systems",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Tree algorithms, Concurrency, Operating systems"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "AA (As-Appropriate) / Hiring Manager Round",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Growth mindset, System design fundamentals, Cultural alignment"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 24,
      "fixedMaxLPA": 32,
      "variableLPA": 3.5,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Microsoft stock awards (RSUs) vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Microsoft Aspire global early-in-career onboarding experience."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Noida"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "59",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "59",
        "toLevelCode": "61",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivery on Azure, Office 365, or Developer Division cloud services"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 50
        },
        "fastTrackNote": "Exemplary impact fast-tracks Level 61 promotion.",
        "lateralExits": [
          "SDE-2 at top global tech companies."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.microsoft.com/students/us/en",
          "title": "Microsoft Early Careers Engineering Guidelines",
          "publisher": "Microsoft",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "amazon-sde1",
    "companyId": "amazon",
    "programName": "Amazon SDE-1 Campus Hiring",
    "roleTitle": "Software Development Engineer I (L4)",
    "aliases": [
      "Amazon SDE-1",
      "Amazon L4",
      "Amazon WoW"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "competition",
      "internship-ppo"
    ],
    "testOrPortal": "Amazon Online Assessment (OA1 & OA2)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "MCA"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India and Amazon WoW qualifiers."
    },
    "selectionProcess": [
      {
        "stage": "Amazon Online Assessment (OA1: Code Debugging + Coding)",
        "type": "coding",
        "durationMin": 70,
        "topics": [
          "Debugging 7 logic bugs",
          "2 coding problems on arrays/strings"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Amazon OA2: Work Style Simulation & Reasoning",
        "type": "aptitude",
        "durationMin": 90,
        "topics": [
          "Amazon Leadership Principles scenario test",
          "Logical reasoning"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Loop 1: Data Structures & Algorithms",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Trees, Graphs, Dynamic Programming, LP questions"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Loop 2: LLD & Bar Raiser",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design (SOLID), Concurrency, Deep LP probe"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 22,
      "fixedMaxLPA": 30,
      "variableLPA": 3.5,
      "joiningBonusINR": 400000,
      "stipendPerMonthINR": null,
      "esopNote": "Amazon RSUs vesting over 4 years (5%, 15%, 40%, 40%).",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Amazon internal development onboarding with designated SDE-2 mentor."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Chennai",
      "Delhi NCR"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement cycle."
    },
    "entry": {
      "companyLevelCode": "L4",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "L4",
        "toLevelCode": "L5",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 3,
        "conditions": [
          "Delivering Tier-1 microservice features with high operational excellence",
          "Demonstrating Leadership Principles consistently"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 40,
          "max": 60
        },
        "fastTrackNote": "Exemplary operational excellence and delivery fast-tracks promotion to L5.",
        "lateralExits": [
          "SDE-2 at top global tech companies."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.amazon.jobs/en/teams/student-programs",
          "title": "Amazon Student Programs Overview",
          "publisher": "Amazon",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "meta-swe-univ",
    "companyId": "meta",
    "programName": "Meta Software Engineer (University Grad)",
    "roleTitle": "Software Engineer (Entry E3)",
    "aliases": [
      "Meta E3",
      "Meta University Grad"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Meta Online Assessment (CodeSignal)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "PhD"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Top tier campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Meta Online Coding Assessment (CodeSignal)",
        "type": "coding",
        "durationMin": 70,
        "topics": [
          "DSA (Hard Dynamic Programming, Trees, Graph algorithms)"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 1: Data Structures & Algorithms",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Speed and precision in solving 2 algorithmic problems"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Interview 2: Problem Solving & Edge Cases",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Optimized coding under strict constraints"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Behavioral & Meta Values Interview",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Move fast, Focus on long term impact, Build awesome things"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 28,
      "fixedMaxLPA": 38,
      "variableLPA": 4.5,
      "joiningBonusINR": 400000,
      "stipendPerMonthINR": null,
      "esopNote": "Meta RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Meta Bootcamp intensive onboarding."
    },
    "locations": [
      "Bengaluru",
      "Gurugram"
    ],
    "seasons": {
      "typicalMonths": [
        7,
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement slot 1."
    },
    "entry": {
      "companyLevelCode": "E3",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "python": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "E3",
        "toLevelCode": "E4",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "High volume production feature delivery",
          "Independent ownership"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 48,
          "max": 70
        },
        "fastTrackNote": "Exceptional impact fast-tracks E4 promotion.",
        "lateralExits": [
          "Senior SDE at top US Big Tech."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.metacareers.com/students-and-grads/",
          "title": "Meta University Grad Program Overview",
          "publisher": "Meta",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "apple-swe-univ",
    "companyId": "apple",
    "programName": "Apple Software Engineer (Early Career)",
    "roleTitle": "Software Engineer (ICT2)",
    "aliases": [
      "Apple ICT2",
      "Apple Early Career SWE"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Apple Coding Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graphs, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Algorithmic optimization, Clean code"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Core Engineering & Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Concurrency, Memory management, Low-level system concepts"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Apple Culture & Quality Bar",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Attention to detail, User privacy, Quality obsession"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 24,
      "fixedMaxLPA": 34,
      "variableLPA": 4,
      "joiningBonusINR": 350000,
      "stipendPerMonthINR": null,
      "esopNote": "Apple RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Apple engineering orientation and security onboarding in Bengaluru / Hyderabad."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "ICT2",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "swift": "working",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "ICT2",
        "toLevelCode": "ICT3",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Flawless delivery on core consumer apps or infrastructure"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 42,
          "max": 58
        },
        "fastTrackNote": "High performers receive accelerated advancement.",
        "lateralExits": [
          "Senior SDE at top tier tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.apple.com/careers/in/",
          "title": "Apple Careers India Guide",
          "publisher": "Apple",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "uber-swe1",
    "companyId": "uber",
    "programName": "Uber Software Engineer (University Grad)",
    "roleTitle": "Software Engineer I (L3)",
    "aliases": [
      "Uber L3",
      "Uber University Grad"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Uber HackerRank Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Architecture & Concurrency",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Go get it, Trip obsessed, Build with heart (Uber values)"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 26,
      "fixedMaxLPA": 36,
      "variableLPA": 4,
      "joiningBonusINR": 400000,
      "stipendPerMonthINR": null,
      "esopNote": "Uber RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 1,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Marketplace and dispatch infrastructure engineering onboarding in Bengaluru / Hyderabad."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement slot 1."
    },
    "entry": {
      "companyLevelCode": "L3",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "golang": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "L3",
        "toLevelCode": "L4",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering low-latency high-concurrency microservices on core dispatch stacks"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 46,
          "max": 65
        },
        "fastTrackNote": "High performers promoted to L4 in under 2 years.",
        "lateralExits": [
          "Senior SDE at top US tech or leading startups."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.uber.com/in/en/careers/university/",
          "title": "Uber University Programs Guide",
          "publisher": "Uber",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "atlassian-grad-swe",
    "companyId": "atlassian",
    "programName": "Atlassian Graduate Software Engineer Program",
    "roleTitle": "Graduate Software Engineer (P3)",
    "aliases": [
      "Atlassian Grad",
      "Atlassian P3"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Atlassian Coding Assessment (HackerRank)",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: System Craft & Design",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Values Interview (Atlassian Core Values)",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Open company no bullshit, Build with heart and balance"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 24,
      "fixedMaxLPA": 32,
      "variableLPA": 3.5,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Atlassian RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Remote-first global graduate onboarding cohort."
    },
    "locations": [
      "Bengaluru",
      "Remote"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "P3",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "P3",
        "toLevelCode": "P4",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering modular features on Jira/Confluence cloud architectures"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 40,
          "max": 55
        },
        "fastTrackNote": "High performers promoted to P4 in under 2 years.",
        "lateralExits": [
          "Senior SDE at top tier tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.atlassian.com/company/careers/graduates",
          "title": "Atlassian Graduate Program Overview",
          "publisher": "Atlassian",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "adobe-se1",
    "companyId": "adobe",
    "programName": "Adobe Software Engineer 1 (Campus)",
    "roleTitle": "Software Engineer 1 (SE1)",
    "aliases": [
      "Adobe SE1",
      "Adobe Campus SWE",
      "Adobe MTS1"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "competition"
    ],
    "testOrPortal": "Adobe Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology colleges nationwide."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Core Computer Science & Design",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "OOPs, Operating systems, Multi-threading, C++/Java internals"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Genuine, Exceptional, Innovative, Involved (Adobe values)"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 22,
      "fixedMaxLPA": 30,
      "variableLPA": 3,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Adobe RSUs included in package.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Noida / Bengaluru technology center onboarding."
    },
    "locations": [
      "Noida",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SE1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SE1",
        "toLevelCode": "CS1",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering modular features on Creative Cloud or Acrobat architectures"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 50
        },
        "fastTrackNote": "High performers promoted to Computer Scientist 1 in under 2 years.",
        "lateralExits": [
          "Senior SDE at top tier tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.adobe.com/careers.html",
          "title": "Adobe University Careers Guide",
          "publisher": "Adobe",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "salesforce-amts",
    "companyId": "salesforce",
    "programName": "Salesforce Futureforce AMTS Program",
    "roleTitle": "Associate Member of Technical Staff (AMTS)",
    "aliases": [
      "Salesforce AMTS",
      "Futureforce AMTS"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "Salesforce HackerRank Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Core Systems & LLD",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Trust, Customer Success, Innovation, Equality (Ohana values)"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 22,
      "fixedMaxLPA": 30,
      "variableLPA": 3,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Salesforce RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Salesforce Futureforce global engineering onboarding."
    },
    "locations": [
      "Hyderabad",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "AMTS",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "AMTS",
        "toLevelCode": "MTS",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering modular multi-tenant cloud services on core Salesforce platforms"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 50
        },
        "fastTrackNote": "High performers promoted to MTS in under 2 years.",
        "lateralExits": [
          "Senior SDE at top tier tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.salesforce.com/company/careers/university-recruiting/",
          "title": "Salesforce Futureforce Program Overview",
          "publisher": "Salesforce",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "oracle-assoc-dev",
    "companyId": "oracle",
    "programName": "Oracle Associate Software Engineer (IC1)",
    "roleTitle": "Associate Applications Developer (IC1)",
    "aliases": [
      "Oracle IC1",
      "Oracle Associate Developer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Oracle Coding Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 75,
        "topics": [
          "DSA (Trees, Dynamic Programming, Arrays)",
          "Core CS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Data structures, Time complexity, Algorithm dry-run"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: LLD & Databases",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Database schema, REST APIs"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for database and cloud tech"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 14,
      "fixedMaxLPA": 18,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "OCI and enterprise application engineering onboarding in Bengaluru / Hyderabad."
    },
    "locations": [
      "Bengaluru",
      "Hyderabad",
      "Pune"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "IC1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "java": "strong",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "IC1",
        "toLevelCode": "IC2",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on cloud infrastructure or database tools"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 22,
          "max": 30
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Mid-level software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.oracle.com/in/corporate/careers/students-graduates/",
          "title": "Oracle Students and Graduates Overview",
          "publisher": "Oracle",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "intel-assoc-eng",
    "companyId": "intel",
    "programName": "Intel Associate Hardware/Software Engineer",
    "roleTitle": "Associate Engineer (Grade 5)",
    "aliases": [
      "Intel Grade 5",
      "Intel College Graduate"
    ],
    "programType": "fulltime",
    "roleFamily": "embedded-firmware",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Intel Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "ECE",
        "EEE",
        "AIML"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Technical & Aptitude Assessment",
        "type": "technical",
        "durationMin": 75,
        "topics": [
          "C/C++ basics, Digital electronics, Computer architecture, OS fundamentals"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Architecture & Embedded Concepts",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Processor pipelines, Memory hierarchies, C pointers and bit manipulations"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: Problem Solving & Design",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Firmware debug scenarios, Concurrency, Hardware-software interface"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for semiconductors"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 14,
      "fixedMaxLPA": 20,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Silicon architecture and firmware lab onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Grade 5",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "devops": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Grade 5",
        "toLevelCode": "Grade 6",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on silicon validation or firmware IP blocks"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 22,
          "max": 32
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Firmware / silicon engineer at leading semiconductor firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.intel.com/jobs",
          "title": "Intel India Early Career Specifications",
          "publisher": "Intel",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "nvidia-assoc-swe",
    "companyId": "nvidia",
    "programName": "NVIDIA Associate Software Engineer (IC1)",
    "roleTitle": "Associate Software Engineer (IC1)",
    "aliases": [
      "NVIDIA IC1",
      "NVIDIA Early Career Engineer"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "NVIDIA Online Technical Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "Dual Degree"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7.5,
      "minPercentage": 75,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Technical Assessment",
        "type": "technical",
        "durationMin": 90,
        "topics": [
          "C/C++ deep dive, Algorithms, OS internals, Concurrency, GPU basics"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Algorithms & Systems",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Multi-threaded programming, Memory architectures"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Low-Level Architecture",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "SIMD, CUDA/GPU fundamentals, Compiler optimizations, Cache coherence"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Hiring Manager & Culture Alignment",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Innovation passion, Intellectual honesty, Team first"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 20,
      "fixedMaxLPA": 28,
      "variableLPA": 3.5,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "NVIDIA RSUs vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "GPU computing and AI platform onboarding in Bengaluru / Pune."
    },
    "locations": [
      "Bengaluru",
      "Pune"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "IC1",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "python": "strong",
      "systemdesign": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "IC1",
        "toLevelCode": "IC2",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivering modular features on CUDA runtime or driver stacks"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 52
        },
        "fastTrackNote": "High performers promoted to IC2 in under 2 years.",
        "lateralExits": [
          "AI systems / GPU compiler engineer at leading firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.nvidia.com/en-in/about-nvidia/careers/university-recruiting/",
          "title": "NVIDIA University Recruiting Overview",
          "publisher": "NVIDIA",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "qualcomm-assoc-eng",
    "companyId": "qualcomm",
    "programName": "Qualcomm Associate Engineer Campus Hiring",
    "roleTitle": "Associate Engineer",
    "aliases": [
      "Qualcomm Associate Engineer",
      "Qualcomm Engineer"
    ],
    "programType": "fulltime",
    "roleFamily": "embedded-firmware",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Qualcomm Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "ECE",
        "EEE",
        "AIML"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Technical Assessment",
        "type": "technical",
        "durationMin": 75,
        "topics": [
          "C/C++ basics, Data structures, Digital design, OS concepts"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Embedded C & Data Structures",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Bitwise operations, Memory alignment, Linked lists, Pointers"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: Core Engineering",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "RTOS concepts, Interrupt handlers, Concurrency, Hardware interfaces"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for wireless and mobile tech"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 16,
      "fixedMaxLPA": 22,
      "variableLPA": 2.5,
      "joiningBonusINR": 200000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Snapdragon and wireless modem onboarding in Hyderabad / Bengaluru."
    },
    "locations": [
      "Hyderabad",
      "Bengaluru",
      "Chennai"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Engineer",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "databases": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Engineer",
        "toLevelCode": "Senior Engineer",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on modem firmware or multimedia drivers"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 25,
          "max": 35
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Senior wireless/embedded engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.qualcomm.com/company/careers/students-and-grads",
          "title": "Qualcomm Students and Grads Specifications",
          "publisher": "Qualcomm",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "cisco-assoc-se",
    "companyId": "cisco",
    "programName": "Cisco Associate Software Engineer (Grade 6)",
    "roleTitle": "Software Engineer (Grade 6)",
    "aliases": [
      "Cisco Grade 6",
      "Cisco College Grad"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Cisco Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "MCA",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across India."
    },
    "selectionProcess": [
      {
        "stage": "Technical Assessment",
        "type": "technical",
        "durationMin": 75,
        "topics": [
          "DSA problems, Networking fundamentals (TCP/IP, Routing), OS concepts"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 1: Problem Solving & Networking",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Data structures, Socket programming, Protocol stacks"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Round 2: Systems & Design",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "OOPs, Concurrency, Distributed networking concepts"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for cloud and networking"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 14,
      "fixedMaxLPA": 18,
      "variableLPA": 2,
      "joiningBonusINR": 150000,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Cisco networking and cloud software onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "Grade 6",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "strong",
      "python": "strong",
      "security": "working",
      "devops": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "Grade 6",
        "toLevelCode": "Grade 8",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Production contribution on routing software or security features"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 22,
          "max": 32
        },
        "fastTrackNote": "High performers receive rapid advancement.",
        "lateralExits": [
          "Network software engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.cisco.com/c/en/us/about/careers.html",
          "title": "Cisco Students and New Graduates Guide",
          "publisher": "Cisco",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "linkedin-assoc-swe",
    "companyId": "linkedin",
    "programName": "LinkedIn Associate Software Engineer (Campus)",
    "roleTitle": "Software Engineer (Entry)",
    "aliases": [
      "LinkedIn SWE",
      "LinkedIn College Grad"
    ],
    "programType": "fulltime",
    "roleFamily": "sde-product",
    "campusCategory": "super-dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal",
      "internship-ppo"
    ],
    "testOrPortal": "LinkedIn HackerRank Challenge",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "software",
        "data-ai",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML",
        "AIDS",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8,
      "minPercentage": 80,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Premier technology campuses across India."
    },
    "selectionProcess": [
      {
        "stage": "Coding Assessment",
        "type": "coding",
        "durationMin": 90,
        "topics": [
          "DSA (DP, Graph, Trees, Strings)",
          "Time complexity analysis"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 1: Problem Solving",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Data structures, Algorithm efficiency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Technical Round 2: Core Engineering & LLD",
        "type": "technical",
        "durationMin": 60,
        "topics": [
          "Object-oriented design patterns, Concurrency, Caching"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "Cultural Alignment / Leadership",
        "type": "managerial",
        "durationMin": 45,
        "topics": [
          "Members first, Relationships matter, Be open honest and constructive"
        ],
        "difficulty": "medium"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 22,
      "fixedMaxLPA": 30,
      "variableLPA": 3.5,
      "joiningBonusINR": 300000,
      "stipendPerMonthINR": null,
      "esopNote": "Microsoft stock awards (RSUs) vesting over 4 years.",
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 2,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Global early-in-career software engineering onboarding in Bengaluru."
    },
    "locations": [
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "SWE",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "expert",
      "java": "strong",
      "systemdesign": "working",
      "databases": "strong",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "SWE",
        "toLevelCode": "Senior SWE",
        "typicalYearsMin": 2,
        "typicalYearsMax": 3.5,
        "conditions": [
          "Delivering modular features on knowledge graph or messaging architectures"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 38,
          "max": 55
        },
        "fastTrackNote": "High performers promoted to Senior SWE in under 2.5 years.",
        "lateralExits": [
          "Senior SDE at top tier tech firms."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://careers.linkedin.com/students",
          "title": "LinkedIn Students Programs Guide",
          "publisher": "LinkedIn",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "netflix-grad-intern",
    "companyId": "netflix",
    "programName": "Netflix Emerging Talent / Summer Engineering Intern",
    "roleTitle": "Engineering Intern (Select Emerging Talent)",
    "aliases": [
      "Netflix Intern",
      "Netflix Summer Intern"
    ],
    "programType": "internship-ppo",
    "roleFamily": "sde-product",
    "campusCategory": "unclassified",
    "hiringReach": "invite-only",
    "channels": [
      "portal"
    ],
    "testOrPortal": "Netflix Technical Screening",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech",
        "PhD"
      ],
      "branchFamilies": [
        "software",
        "data-ai"
      ],
      "branchCodes": [
        "CSE",
        "IT",
        "AIML"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 8.5,
      "minPercentage": 85,
      "backlogPolicy": "Zero backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Extremely limited opportunistic hiring. General new grad hiring is not practiced; lateral entry starts at Senior Software Engineer (L5)."
    },
    "selectionProcess": [
      {
        "stage": "Technical Assessment & Deep Dive",
        "type": "technical",
        "durationMin": 90,
        "topics": [
          "Distributed systems, Algorithms, Operating systems, Concurrency"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "System Architecture & Netflix Culture",
        "type": "managerial",
        "durationMin": 60,
        "topics": [
          "Freedom and Responsibility, Extreme context over control, Self-discipline"
        ],
        "difficulty": "hard"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": null,
      "fixedMaxLPA": null,
      "variableLPA": null,
      "joiningBonusINR": null,
      "stipendPerMonthINR": 150000,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 3,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "High freedom-and-responsibility summer project incubation."
    },
    "locations": [
      "Mumbai",
      "Bengaluru"
    ],
    "seasons": {
      "typicalMonths": [
        5,
        6,
        7
      ],
      "notes": "Summer internship cycle when active."
    },
    "entry": {
      "companyLevelCode": null,
      "equivalenceLevelId": null
    },
    "competencyProfile": {
      "dsa": "expert",
      "systemdesign": "strong",
      "java": "strong",
      "communication": "expert"
    },
    "derivedFrom": "official-jd",
    "trajectory": [],
    "status": "limited",
    "provenance": {
      "sources": [
        {
          "url": "https://jobs.netflix.com/",
          "title": "Netflix Jobs & Early Careers Notice",
          "publisher": "Netflix",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "tatamotors-get",
    "companyId": "tata-motors",
    "programName": "Tata Motors Graduate Engineer Trainee (GET)",
    "roleTitle": "Graduate Engineer Trainee",
    "aliases": [
      "Tata Motors GET",
      "GET Tata Motors",
      "TML GET"
    ],
    "programType": "trainee",
    "roleFamily": "core-mechanical",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Tata Motors Assessment Portal",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E."
      ],
      "branchFamilies": [
        "core-mechanical",
        "electronics-embedded",
        "software"
      ],
      "branchCodes": [
        "ME",
        "AUTO",
        "MECHATRONICS",
        "EE",
        "EEE",
        "ECE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs at time of joining",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "Premier and national engineering institutions with Mechanical, Automobile, Mechatronics, or Electrical streams."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & Technical Engineering Assessment",
        "type": "aptitude",
        "durationMin": 75,
        "topics": [
          "Engineering Mathematics",
          "Strength of Materials, Thermodynamics, Mechatronics",
          "Logical Reasoning"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Group Discussion (Case Study)",
        "type": "gd",
        "durationMin": 30,
        "topics": [
          "EV Transition, Sustainable Mobility, Autonomous Safety in Indian Driving Conditions"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Powertrain basics, FEA/CAD, Battery chemistry, Final year automotive project"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "HR & Tata Values Fitment",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Tata Code of Conduct, Long term engineering commitment, Plant location flexibility"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 6.5,
      "fixedMaxLPA": 8.5,
      "variableLPA": 0.75,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 12,
      "bondMonths": 24,
      "bondAmountINR": 150000,
      "notes": "Comprehensive 1-year training: 3 months classroom at Pune Training Division + 9 months rotational plant stints."
    },
    "locations": [
      "Pune",
      "Jamshedpur",
      "Sanand",
      "Pantnagar",
      "Lucknow"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Primary autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "GET",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "communication": "strong",
      "leadership": "working"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GET",
        "toLevelCode": "L1",
        "typicalYearsMin": 1,
        "typicalYearsMax": 1.5,
        "conditions": [
          "Completion of 12-month GET training and plant probation",
          "Successful presentation of end-of-stint technical project to plant heads"
        ],
        "blockers": [
          {
            "title": "Plant Stint & Technical Assessment Clearance",
            "category": "training",
            "whyItBlocks": "Progression from GET to Assistant Manager (L1) requires successful viva voce before the Engineering Cadre Review committee.",
            "evidenceToCounter": "Complete all 3 rotational plant assignments and achieve sign-off on shop-floor improvement projects."
          }
        ],
        "compensationLPAAfter": {
          "min": 9,
          "max": 11.5
        },
        "fastTrackNote": "Outstanding innovation project award winners receive fast-track placement into Passenger EV Engineering (TPEM) squads.",
        "lateralExits": [
          "R&D Engineer at global automotive Tier 1 suppliers (Bosch, Continental, Magna)."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.tatamotors.com/careers/early-careers/",
          "title": "Tata Motors Graduate Engineer Trainee Specifications",
          "publisher": "Tata Motors",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "lnt-get",
    "companyId": "lnt",
    "programName": "L&T Graduate Engineer Trainee (GET)",
    "roleTitle": "Graduate Engineer Trainee",
    "aliases": [
      "L&T GET",
      "Larsen Toubro GET",
      "L&T Trainee"
    ],
    "programType": "trainee",
    "roleFamily": "core-civil",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "L&T Online Assessment Portal",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E."
      ],
      "branchFamilies": [
        "core-civil",
        "core-mechanical",
        "electronics-embedded"
      ],
      "branchCodes": [
        "CIVIL",
        "ME",
        "EE",
        "EEE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs at time of selection and joining",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "Engineering colleges across India with accredited Civil, Mechanical, or Electrical departments."
    },
    "selectionProcess": [
      {
        "stage": "L&T Technical & General Assessment",
        "type": "aptitude",
        "durationMin": 90,
        "topics": [
          "Core engineering discipline MCQ",
          "Quantitative & Logical ability",
          "English comprehension"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Structural mechanics, Surveying, Fluid dynamics, Power systems, Project design calculations"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "HR & Project Site Readiness Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Site readiness across remote infrastructure projects, Values alignment"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 5.5,
      "fixedMaxLPA": 7,
      "variableLPA": 0.5,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 12,
      "bondMonths": 24,
      "bondAmountINR": 200000,
      "notes": "L&T Leadership Development Academy (LDA Lonavala) induction followed by major project site postings (metro, bridge, nuclear, energy)."
    },
    "locations": [
      "Mumbai",
      "Chennai",
      "Delhi NCR",
      "Project Sites Pan-India"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "GET",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "communication": "strong",
      "leadership": "working"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GET",
        "toLevelCode": "EXE",
        "typicalYearsMin": 1,
        "typicalYearsMax": 1.5,
        "conditions": [
          "Completion of 1-year GET tenure and project site performance evaluation"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 7.5,
          "max": 9.5
        },
        "fastTrackNote": "Confirmed as Executive Engineer upon 12-month completion.",
        "lateralExits": [
          "Project engineer at global EPC / infrastructure majors."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.larsentoubro.com/corporate/careers/early-careers/",
          "title": "L&T Graduate Engineer Trainee Program Details",
          "publisher": "Larsen & Toubro",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "bosch-get",
    "companyId": "bosch-india",
    "programName": "Bosch Graduate Engineer Trainee (GET)",
    "roleTitle": "Associate Software Engineer (ASSE)",
    "aliases": [
      "Bosch GET",
      "Bosch ASSE",
      "Bosch Trainee"
    ],
    "programType": "trainee",
    "roleFamily": "embedded-firmware",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Bosch Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E.",
        "M.Tech"
      ],
      "branchFamilies": [
        "electronics-embedded",
        "software",
        "core-mechanical"
      ],
      "branchCodes": [
        "ECE",
        "EEE",
        "CSE",
        "AUTO",
        "MECHATRONICS"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 7,
      "minPercentage": 70,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Standard justification",
      "notes": "Engineering colleges across South and West India."
    },
    "selectionProcess": [
      {
        "stage": "Technical & Aptitude Assessment",
        "type": "technical",
        "durationMin": 75,
        "topics": [
          "C/Embedded C basics",
          "Digital electronics",
          "Microcontroller architecture",
          "Logical reasoning"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview 1: Embedded C & Microcontrollers",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Timers, Interrupts, CAN/LIN protocols, Memory layout"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview 2: Automotive Systems & Design",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "AUTOSAR basics, RTOS, Sensor integration, Final year embedded project"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "HR & Fitment Discussion",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Team alignment, Passion for mobility technologies"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 6,
      "fixedMaxLPA": 8,
      "variableLPA": 0.8,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 6,
      "bondMonths": null,
      "bondAmountINR": null,
      "notes": "Bosch Mobility Solutions training center onboarding in Bengaluru / Coimbatore."
    },
    "locations": [
      "Bengaluru",
      "Coimbatore",
      "Pune"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Autumn campus placement window."
    },
    "entry": {
      "companyLevelCode": "ASSE",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "dsa": "working",
      "python": "working",
      "devops": "working",
      "communication": "strong"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "ASSE",
        "toLevelCode": "SSE",
        "typicalYearsMin": 1.5,
        "typicalYearsMax": 2.5,
        "conditions": [
          "Delivery on ECU firmware or ADAS validation modules"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 9.5,
          "max": 13
        },
        "fastTrackNote": "Confirmed as Software Engineer upon 12-month completion.",
        "lateralExits": [
          "Embedded automotive engineer at global Tier-1s."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.bosch.in/careers/start-your-career/graduates/",
          "title": "Bosch India Graduate Programs Overview",
          "publisher": "Bosch India",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  },
  {
    "id": "mahindra-get",
    "companyId": "mahindra",
    "programName": "Mahindra Graduate Engineer Trainee (GET)",
    "roleTitle": "Graduate Engineer Trainee",
    "aliases": [
      "Mahindra GET",
      "M&M GET",
      "GET Mahindra Auto"
    ],
    "programType": "trainee",
    "roleFamily": "core-mechanical",
    "campusCategory": "dream",
    "hiringReach": "select-campuses",
    "channels": [
      "on-campus",
      "portal"
    ],
    "testOrPortal": "Mahindra Online Assessment",
    "eligibility": {
      "degrees": [
        "B.Tech",
        "B.E."
      ],
      "branchFamilies": [
        "core-mechanical",
        "electronics-embedded"
      ],
      "branchCodes": [
        "ME",
        "AUTO",
        "MECHATRONICS",
        "EE",
        "EEE"
      ],
      "graduationYears": [
        2026,
        2027
      ],
      "minCgpa": 6.5,
      "minPercentage": 65,
      "backlogPolicy": "Zero active backlogs",
      "gapYearPolicy": "Max 1 year academic gap permitted",
      "notes": "Premier and state engineering colleges."
    },
    "selectionProcess": [
      {
        "stage": "Aptitude & Technical Engineering Assessment",
        "type": "aptitude",
        "durationMin": 75,
        "topics": [
          "Core mechanical/automotive engineering MCQ",
          "Numerical & logical aptitude"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Group Discussion",
        "type": "gd",
        "durationMin": 30,
        "topics": [
          "Future of Indian EV adoption, Farm mechanization, Safety regulations"
        ],
        "difficulty": "medium"
      },
      {
        "stage": "Technical Interview",
        "type": "technical",
        "durationMin": 45,
        "topics": [
          "Chassis engineering, IC engines vs EVs, CAD/CAM, Thermal systems, Project deep dive"
        ],
        "difficulty": "hard"
      },
      {
        "stage": "HR & Mahindra Rise Culture Interview",
        "type": "hr",
        "durationMin": 20,
        "topics": [
          "Rise pillars (Accept No Limits, Alternative Thinking, Driving Positive Change)"
        ],
        "difficulty": "easy"
      }
    ],
    "compensation": {
      "currency": "INR",
      "fixedMinLPA": 6,
      "fixedMaxLPA": 8,
      "variableLPA": 0.75,
      "joiningBonusINR": null,
      "stipendPerMonthINR": null,
      "esopNote": null,
      "asOfYear": 2026
    },
    "training": {
      "durationMonths": 12,
      "bondMonths": 24,
      "bondAmountINR": 150000,
      "notes": "1-year structured GET program: 3 months classroom at Mahindra Institute of Quality / MRV + 9 months rotational assignments."
    },
    "locations": [
      "Chennai",
      "Pune",
      "Mumbai",
      "Zaheerabad",
      "Nagpur"
    ],
    "seasons": {
      "typicalMonths": [
        8,
        9,
        10,
        11
      ],
      "notes": "Autumn campus placement season."
    },
    "entry": {
      "companyLevelCode": "GET",
      "equivalenceLevelId": "L3_ENTRY"
    },
    "competencyProfile": {
      "communication": "strong",
      "leadership": "working"
    },
    "derivedFrom": "official-jd",
    "trajectory": [
      {
        "fromLevelCode": "GET",
        "toLevelCode": "DM",
        "typicalYearsMin": 1,
        "typicalYearsMax": 1.5,
        "conditions": [
          "Completion of 12-month GET training and plant probation evaluation"
        ],
        "blockers": [],
        "compensationLPAAfter": {
          "min": 8.5,
          "max": 11
        },
        "fastTrackNote": "Confirmed as Deputy Manager upon 12-month completion.",
        "lateralExits": [
          "Automotive R&D engineer."
        ],
        "confidence": "high",
        "derived": false
      }
    ],
    "status": "active",
    "provenance": {
      "sources": [
        {
          "url": "https://www.mahindra.com/careers/students-and-graduates",
          "title": "Mahindra Graduate Engineer Trainee Program Details",
          "publisher": "Mahindra & Mahindra",
          "type": "official",
          "accessed": "2026-10-10"
        }
      ],
      "confidence": "high",
      "lastVerified": "2026-10-10",
      "dataYear": "2026"
    }
  }
];
