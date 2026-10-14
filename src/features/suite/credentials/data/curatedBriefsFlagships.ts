// ============================================================
// Credential & Opportunity Engine — In-Depth Briefs for Indian Flagships
// 12 Premier Indian Hackathons, Codathons, and Research Fellowships
// Complete Schema 2.0 Rich Details: Overview, Syllabus, Aid, Evidence, Pitfalls & Sources
// ============================================================

import { OpportunityRecord } from '../types';

export const CURATED_FLAGSHIP_BRIEFS: Record<string, Partial<OpportunityRecord>> = {
  // 1. Flipkart GRiD
  'opp-flipkart-grid': {
    trust: 'verified_official',
    flags: ['open_now', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free campus tech challenge. ₹5,25,000 INR prize pool + direct SDE-1 PPO/PPI interviews (₹26–32 LPA CTC).',
    },
    rewardDisplay: {
      headline: '₹5,25,000 INR Prize Pool + Direct SDE-1 PPOs (₹26–32 LPA CTC)',
      note: 'Top finalists fast-tracked to Flipkart Bengaluru HQ for Grand Finale hack sprint and PPIs.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free national hackathon hosted on Unstop with all travel and stay sponsored for finalists in Bengaluru.',
      steps: [
        'Form a team of 1 to 3 engineering students from the same college campus.',
        'Clear Level 1 Domain/Tech MCQ quiz on Unstop.',
        'Build and submit Level 2 Architectural Proof of Concept (PoC) prototype.',
        'Present live prototype at Flipkart Grand Finale in Bengaluru.',
      ],
    },
    windows: [
      { label: 'Unstop Registration & Level 1 Quiz', status: 'open', date: 'July – August' },
      { label: 'Level 2 PoC Submission', status: 'open_now', date: 'August – September' },
      { label: 'Grand Finale Sprint in Bengaluru', status: 'upcoming', date: 'September – October' },
    ],
    richDetails: {
      overview: 'Flipkart GRiD is Flipkart\'s flagship campus tech competition for engineering students across India. It features real-world e-commerce tracks (Software Development, Information Security, Robotics, and AI/ML) judged by Flipkart Principal Architects.',
      what_it_covers: [
        'High-concurrency e-commerce backend architectures: Flash sale queue management, Redis caching, Kafka streams',
        'Information security tracks: Bot detection, DDoS mitigation, fraud transaction anomaly detection',
        'AI/ML tracks: Smart product cataloging, generative recommendation agents, OCR for Indian address parsing',
        'Robotics and warehouse automation: Automated Guided Vehicle (AGV) path planning, package routing algorithms',
      ],
      format: {
        delivery: 'Hybrid (Online MCQ & PoC rounds + In-Person Grand Finale in Bengaluru)',
        style: '3-tier elimination challenge with architecture defense before Flipkart Principal Technical Staff',
        attempts_included: 1,
      },
      cost_breakdown: [
        { item: 'Registration Fee', inr: 0, usd: 0 },
        { item: 'Grand Finale Travel & Stay in Bengaluru', inr: 0, note: 'Fully sponsored by Flipkart' },
      ],
      validity_renewal: 'Permanent collegiate achievement and Flipkart finalist certificate.',
      prerequisites: 'Strong DSA, system design fundamentals, database optimization, and ability to build scalable services.',
      eligibility: 'B.Tech / B.E. / M.Tech / Dual Degree students across all Indian engineering colleges.',
      how_to_apply: ['Register your 1-3 member team on the official Flipkart GRiD challenge page on Unstop.'],
      timeline: [{ label: 'Annual Season', status: 'open_now', date: 'July to October annually' }],
      student_aid_steps: [
        'No fees whatsoever. Unstop registration is completely free.',
      ],
      resume_evidence: {
        attach: [
          'Official Flipkart GRiD Finalist Certificate with Verification ID',
          'GitHub repository containing the complete PoC architecture with Dockerfile & benchmark results',
        ],
        line_template: 'Flipkart GRiD National Finalist (Top [X] of [Y] teams) | Architected [Project Name] handling simulated [Z] concurrent requests/sec with Kafka and Redis caching, receiving direct SDE-1 PPI route.',
      },
      pitfalls: [
        'Submitting monolithic, untested prototypes without load test benchmarks.',
        'Neglecting edge cases in concurrent inventory reservation during flash sales.',
      ],
      sources: [
        {
          title: 'Flipkart GRiD on Unstop',
          url: 'https://unstop.com/hackathons/flipkart-grid-60-software-development-challenge-flipkart-1024765',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'rounds', 'eligibility'],
        },
      ],
    },
  },

  // 2. TCS CodeVita
  'opp-tcs-codevita': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free global competitive coding contest. Guinness World Record holder for largest coding competition.',
    },
    rewardDisplay: {
      headline: '$20,000 USD Prize Pool + Direct Digital & Prime Job Offers (₹9–12 LPA CTC)',
      note: 'Top performers in Round 1 and Round 2 bypass aptitude screening directly to technical interview.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free on TCS Campus Commune / TCS NextStep portal.',
      steps: ['Register with your CT/DT reference number on TCS NextStep portal.'],
    },
    windows: [
      { label: 'Registrations Open', status: 'open', date: 'September – October' },
      { label: 'Round 1 (6h Coding Sprint)', status: 'open_now', date: 'November' },
      { label: 'Grand Finale at TCS Olympus, Mumbai', status: 'upcoming', date: 'February – March' },
    ],
    richDetails: {
      overview: 'TCS CodeVita is the world\'s largest computer programming competition, recognized by Guinness World Records. It promotes competitive coding as a sport and serves as Tata Consultancy Services\' primary talent acquisition pipeline for TCS Digital and TCS Prime software roles.',
      what_it_covers: [
        'Advanced Data Structures: Segment trees, Fenwick trees, Disjoint Set Union (DSU), Trie',
        'Algorithmic Paradigms: Dynamic Programming on trees/graphs, Dijkstra, Bellman-Ford, Floyd-Warshall',
        'Computational Geometry, Number Theory, Combinatorics, and modular arithmetic',
        'Plagiarism detection: Strict MOSS-based code similarity auditing across all submissions',
      ],
      format: {
        delivery: 'Online (Round 1 & 2) + Onsite Grand Finale at TCS Olympus, Thane/Mumbai',
        style: '6-hour algorithmic sprint with 6-8 problems of varying difficulty (C, C++, Java, Python, C#)',
      },
      cost_breakdown: [{ item: 'Contest Entry', inr: 0, usd: 0 }],
      validity_renewal: 'Permanent global rank certificate and TCS hiring fast-track.',
      prerequisites: 'Strong competitive programming proficiency and high typing/debugging speed.',
      eligibility: 'Engineering and science students graduating in relevant cohort years globally.',
      how_to_apply: ['Register on codevita.tcsapps.com using your TCS NextStep credentials.'],
      timeline: [{ label: 'Annual Contest', status: 'open_now', date: 'Sept to March cycle' }],
      resume_evidence: {
        attach: ['Official TCS CodeVita Rank Certificate', 'GitHub competitive programming solution archive'],
        line_template: 'TCS CodeVita Global Rank [X] (Top [Y]% of 100,000+ competitors) | Solved [Z] complex graph and dynamic programming challenges in 6-hour algorithmic sprint, earning direct TCS Prime interview.',
      },
      pitfalls: [
        'Sharing solutions on Telegram/Discord during the live 6h contest (TCS deploys zero-tolerance plagiarism disqualifications).',
      ],
      sources: [
        {
          title: 'TCS CodeVita Official Platform',
          url: 'https://codevita.tcsapps.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'rounds', 'hiring'],
        },
      ],
    },
  },

  // 3. TCS HackQuest
  'opp-tcs-hackquest': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free national Capture The Flag (CTF) cybersecurity challenge.',
    },
    rewardDisplay: {
      headline: '₹5,00,000 INR Prize Pool + Direct TCS Cyber Security Ninja/Digital Job Offers',
      note: 'Winners directly placed into TCS Cyber Defense Centers across India.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free online CTF.',
      steps: ['Register via TCS NextStep / Campus Commune during annual launch.'],
    },
    windows: [{ label: 'Annual CTF Season', status: 'open', date: 'December – January' }],
    richDetails: {
      overview: 'TCS HackQuest is the premier collegiate cybersecurity Capture The Flag (CTF) contest in India organized by the TCS Cybersecurity Practice. Top ranking students receive direct interview waivers for specialized Cyber Security Analyst positions.',
      what_it_covers: [
        'Web Application Security: SQL injection, Blind XSS, SSRF, CSRF, insecure deserialization, IDOR',
        'System Exploitation and Reverse Engineering: Buffer overflows, binary disassembly with Ghidra/GDB',
        'Network Security & Forensics: PCAP packet analysis in Wireshark, memory forensics with Volatility',
        'Cryptography & Steganography: RSA mathematical attacks, classical cipher cracking, LSB image extraction',
      ],
      format: {
        delivery: 'Online 6-hour Jeopardy-style CTF (Round 1) + 24-hour Finale (Round 2)',
        style: 'Hands-on challenge flags hidden in vulnerable web apps, binary executables, and network captures',
      },
      cost_breakdown: [{ item: 'Entry Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Official TCS HackQuest Certificate of Merit.',
      prerequisites: 'Linux terminal comfort, Python scripting, Burp Suite, Wireshark, Ghidra.',
      eligibility: 'B.Tech/B.E./M.Tech/MCA final and pre-final year students across India.',
      how_to_apply: ['Register on TCS HackQuest portal via TCS NextStep.'],
      timeline: [{ label: 'Annual CTF', status: 'open', date: 'Dec – Jan' }],
      resume_evidence: {
        attach: ['TCS HackQuest Rank Certificate', 'CTF Write-up GitHub repository detailing challenge solutions'],
        line_template: 'TCS HackQuest National Finalist (Rank [X]) | Solved [Y] exploitation, web security, and reverse engineering challenges in 6-hour CTF sprint, securing direct Cyber Security Analyst interview.',
      },
      pitfalls: ['Spending excessive time on steganography flags instead of high-value web exploitation challenges.'],
      sources: [
        {
          title: 'TCS HackQuest Information',
          url: 'https://www.tcs.com/careers/india',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'format'],
        },
      ],
    },
  },

  // 4. Amazon ML Challenge (India)
  'opp-amazon-ml': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free hackathon. ₹10,00,000+ INR total prize pool + direct PPIs for Amazon Applied Scientist / ML Engineer.',
    },
    rewardDisplay: {
      headline: '₹10,00,000+ INR Prizes + Direct Amazon Applied Scientist PPIs',
      note: 'Pre-placement interviews offered to top finalists across leading IITs, NITs, and premier colleges.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free competition hosted on HackerEarth / Unstop with AWS compute credits provided.',
      steps: ['Register a 2-4 member student team on the official Amazon challenge page.'],
    },
    windows: [{ label: 'Annual Amazon ML Challenge', status: 'open', date: 'August – September' }],
    richDetails: {
      overview: 'Amazon ML Challenge is a premier machine learning competition for all engineering students across India, designed to evaluate real-world computer vision, multimodal deep learning, and NLP capability on massive e-commerce datasets.',
      what_it_covers: [
        'Multimodal Deep Learning: Combining vision transformers (ViT) and text transformers (BERT/RoBERTa)',
        'Optical Character Recognition (OCR) and document entity extraction on degraded product packaging',
        'Large-scale data pipeline optimization: Handling gigabytes of images with PyTorch DataLoader and Albumentations',
        'Metric optimization: F1-score, Mean Average Precision (mAP), and symmetric mean absolute percentage error (sMAPE)',
      ],
      format: {
        delivery: 'Online cloud competitive modeling sprint',
        style: 'Multi-day dataset modeling challenge with private test set evaluation and technical methodology defense',
      },
      cost_breakdown: [{ item: 'Registration Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious Amazon ML finalist certificate.',
      prerequisites: 'Proficiency in PyTorch/TensorFlow, Hugging Face transformers, and GPU data parallel training.',
      eligibility: 'All engineering students across accredited Indian colleges.',
      how_to_apply: ['Form team of 2-4 students and register on the Amazon ML Challenge portal.'],
      timeline: [{ label: 'August – September Annually', status: 'open', date: 'Annual cycle' }],
      resume_evidence: {
        attach: ['Official Amazon ML Challenge Finalist Certificate', 'GitHub repository with training scripts and model weights'],
        line_template: 'Amazon ML Challenge National Finalist (Rank [X] of [Y] teams) | Trained multimodal vision-language transformer achieving [Z] F1-score on [N] product images, receiving direct Amazon Applied Scientist PPI.',
      },
      pitfalls: ['Training complex ensembles that exceed inference runtime or memory limits during evaluation.'],
      sources: [
        {
          title: 'Amazon Science Challenge Portal',
          url: 'https://www.amazon.science/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'format'],
        },
      ],
    },
  },

  // 5. JPMorgan Chase Code for Good (CFG)
  'opp-jpmc-cfg': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free hackathon. Primary hiring pipeline for JPMC Software Engineer Program (SEP) full-time roles (₹19–22 LPA CTC).',
    },
    rewardDisplay: {
      headline: 'Direct Full-Time SDE & Summer Internship Offers (₹19–22 LPA CTC)',
      note: 'Every participant is mentored by JPMC Vice Presidents and Technical Specialists during the hackathon.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free invitation-only hackathon for students clearing the initial coding assessment.',
      steps: [
        'Apply on the JPMC Careers portal during the pre-final / final year recruitment window.',
        'Complete the HackerRank coding challenge (2 DSA questions in 60 minutes).',
        'Receive official invitation to the 24-hour Code for Good hackathon.',
      ],
    },
    windows: [{ label: 'Annual Campus Cycle', status: 'open', date: 'May – July' }],
    richDetails: {
      overview: 'JPMorgan Chase Code for Good brings together top engineering students to build technology solutions for leading non-profit organizations (NGOs). It is JPMC\'s primary recruitment event for full-time Software Engineer Program (SEP) and summer internship positions.',
      what_it_covers: [
        'Rapid full-stack web and mobile application engineering for non-profit workflows',
        'Collaborative software development in diverse teams under the guidance of JPMC mentors',
        'Production backend development, relational/NoSQL schemas, user authentication, and accessibility',
        'Behavioral and technical evaluation: Continuous assessment by embedded JPMC engineers during the sprint',
      ],
      format: {
        delivery: 'Hybrid / In-Person at JPMC tech hubs (Bengaluru, Hyderabad, Mumbai)',
        style: '24-hour continuous hackathon with live NGO problem statement pitching and technical jury defense',
      },
      cost_breakdown: [{ item: 'Entry Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious JPMC achievement record and direct full-time employment conversion.',
      prerequisites: 'Strong DSA, full-stack development skills (React/Node or Java/Spring), and active collaboration.',
      eligibility: 'Pre-final and final year B.Tech/B.E. students across Indian universities.',
      how_to_apply: ['Apply via campus placement cell or off-campus on jpmorganchase.com/careers.'],
      timeline: [{ label: 'Summer Season', status: 'open', date: 'May to July' }],
      resume_evidence: {
        attach: ['JPMC Code for Good Certificate', 'Deployed NGO solution demo repository'],
        line_template: 'JPMorgan Chase Code for Good Winner / Finalist | Engineered [Solution Name] for [NGO Name] in 24h sprint using React and Spring Boot, securing direct Software Engineer Program (SEP) full-time offer.',
      },
      pitfalls: ['Dominating your team or refusing to collaborate; JPMC actively grades teamwork and humility over solo heroics.'],
      sources: [
        {
          title: 'JPMorgan Chase Code for Good Information',
          url: 'https://www.jpmorganchase.com/about/our-businesses/technology/code-for-good',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['program_details', 'careers'],
        },
      ],
    },
  },

  // 6. Code for GovTech (C4GT) India Fellowship
  'opp-c4gt': {
    trust: 'verified_official',
    flags: ['paid_stipend', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free fellowship. Selected fellows receive ₹1,00,000 INR stipend across the 3-month coding period.',
    },
    stipendDisplay: {
      headline: '₹1,00,000 INR Stipend (3-Month Fellowship)',
      note: 'Dedicated mentorship from top Digital Public Infrastructure (DPI) open-source architects.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Stipend disbursed in 3 milestone tranches directly to Indian bank accounts.',
      steps: [
        'Explore participating Digital Public Goods (Sunbird, Beckn, DIGIT, Bahmni, Samagra).',
        'Contribute pull requests to C4GT community problem statements on GitHub.',
        'Submit a structured technical proposal for chosen fellowship project.',
      ],
    },
    windows: [{ label: 'Annual Summer Fellowship', status: 'open', date: 'April – August' }],
    richDetails: {
      overview: 'Code for GovTech (C4GT) is India\'s first dedicated Digital Public Goods (DPG) and open-source fellowship program. Fellows work directly on open-source codebases powering India\'s national digital infrastructure in education, healthcare, and governance.',
      what_it_covers: [
        'Digital Public Infrastructure (DPI) architectures: Open networks (Beckn protocol), modular registries (Sunbird), urban governance (DIGIT)',
        'Enterprise open-source Java, Python, Go, and React engineering conforming to national scale and security standards',
        'High-throughput microservices, telemetry, and offline-first database synchronization',
      ],
      format: {
        delivery: 'Remote 1:1 mentorship program',
        style: '3-month deep engineering sprint on live GovTech repositories',
      },
      cost_breakdown: [{ item: 'Application Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Official C4GT Fellow Certificate and public contributor recognition in national DPI repositories.',
      prerequisites: 'Strong Git proficiency, backend or frontend development experience, and passion for civic technology.',
      eligibility: 'College students and working professionals in India.',
      how_to_apply: ['Apply via github.com/Code4GovTech/C4GT and submit project proposal.'],
      timeline: [{ label: 'Annual Cohort', status: 'open', date: 'April to August' }],
      resume_evidence: {
        attach: ['Official C4GT Fellowship Certificate', 'Merged pull requests on Sunbird, Beckn, or DIGIT repositories'],
        line_template: 'Code for GovTech (C4GT) Fellow | Engineered [Feature Name] for [DPI Project, e.g. Sunbird/Beckn], authoring [X] merged PRs in [Tech Stack] impacting national-scale citizen governance systems.',
      },
      pitfalls: ['Submitting proposals without contributing any introductory PRs to the organization codebase first.'],
      sources: [
        {
          title: 'Code for GovTech (C4GT) Repository',
          url: 'https://github.com/Code4GovTech/C4GT',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'timeline', 'projects'],
        },
      ],
    },
  },

  // 7. Walmart Sparkathon & CodeHers (India)
  'opp-walmart-sparkathon': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free hackathon. ₹5,80,000 INR prize pool + direct SDE-1 full-time and summer internship offers (₹23–27 LPA CTC).',
    },
    rewardDisplay: {
      headline: '₹5,80,000 INR Prize Pool + Direct SDE-1 Placement (₹23–27 LPA CTC)',
      note: 'Direct PPIs offered to all top national finalists by Walmart Global Tech India.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free challenge on Unstop. Dedicated women-in-tech track via Walmart CodeHers.',
      steps: ['Register your 2-3 member team on Unstop and clear Round 1 Online Assessment.'],
    },
    windows: [{ label: 'Annual Campus Hackathon', status: 'open', date: 'June – August' }],
    richDetails: {
      overview: 'Walmart Sparkathon is Walmart Global Tech India\'s open innovation challenge for engineering students. It invites disruptive ideas in retail tech, supply chain, and customer experiences, offering winners direct employment and PPIs.',
      what_it_covers: [
        'Next-generation retail tech: Autonomous checkout, supply chain visibility, inventory forecasting with AI',
        'Scalable cloud microservices: Low-latency REST/gRPC APIs, Kafka event streaming, distributed caching',
        'Presentation to Walmart Global Tech Engineering Directors and Principal Architects',
      ],
      format: {
        delivery: 'Online MCQ & Coding round + Virtual/In-Person Prototype Finale',
        style: '3-stage competition culminating in live prototype demonstration',
      },
      cost_breakdown: [{ item: 'Entry Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Walmart Global Tech finalist credential and direct placement offer.',
      prerequisites: 'Strong DSA, modern web/mobile framework skills, and scalable system design capability.',
      eligibility: 'B.Tech/B.E./M.Tech graduating students across accredited Indian engineering colleges.',
      how_to_apply: ['Register on Unstop Walmart Sparkathon page.'],
      timeline: [{ label: 'Summer Cycle', status: 'open', date: 'June – August' }],
      resume_evidence: {
        attach: ['Walmart Sparkathon Finalist Certificate', 'GitHub retail tech prototype repo with architecture diagram'],
        line_template: 'Walmart Sparkathon National Finalist (Top [X] of [Y] teams) | Built [Project Name] using [Tech Stack] to optimize [Retail Problem], earning direct Walmart SDE-1 Pre-Placement Interview.',
      },
      pitfalls: ['Pitching generic e-commerce clones instead of addressing Walmart-scale physical-digital retail synergies.'],
      sources: [
        {
          title: 'Walmart Careers India',
          url: 'https://careers.walmart.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'eligibility'],
        },
      ],
    },
  },

  // 8. Google Girl Hackathon (India)
  'opp-google-girl-hack': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free hackathon for women in tech. Direct pipeline to Google India Software Engineering internships.',
    },
    rewardDisplay: {
      headline: 'Direct Google SWE Internship Interviews + Cash Prizes',
      note: 'All finalists receive 1:1 mentorship from Google female software engineers and interview coaching.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free. All hardware, swag, and interview preparation workshops sponsored by Google.',
      steps: ['Register individually or in teams of 2 on the official Google Girl Hackathon portal.'],
    },
    windows: [{ label: 'Annual Edition', status: 'open', date: 'February – April' }],
    richDetails: {
      overview: 'Google Girl Hackathon is a flagship coding and innovation program for women engineering students across India. It provides a platform to showcase algorithmic capability, design innovative tech solutions, and interview for Google software engineering internships.',
      what_it_covers: [
        'Round 1: Online Google DSA & Coding Challenge (algorithmic arrays, strings, trees, and graphs)',
        'Round 2: Design and Architecture Document evaluation on a real-world technical prompt',
        'Round 3: Virtual Grand Finale hack sprint and interview fast-track for Google SWE roles',
      ],
      format: {
        delivery: 'Online multi-tier competition',
        style: 'Online coding round → Design round → Final hackathon sprint & Google SWE interviews',
      },
      cost_breakdown: [{ item: 'Participation Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious Google Hackathon certificate and SWE interview fast-track.',
      prerequisites: 'Strong DSA fundamentals (LeetCode medium/hard equivalent) and software development proficiency.',
      eligibility: 'Women engineering students pursuing B.Tech/B.E./Dual Degrees in India.',
      how_to_apply: ['Apply on Google Students / Unstop Girl Hackathon challenge page.'],
      timeline: [{ label: 'Spring Cycle', status: 'open', date: 'February to April' }],
      resume_evidence: {
        attach: ['Official Google Girl Hackathon Certificate', 'Architecture Design Document & GitHub repository'],
        line_template: 'Google Girl Hackathon Finalist | Cleared national algorithmic rounds and architected [Project Name] using [Tech Stack], receiving direct Google Software Engineering Internship interview.',
      },
      pitfalls: ['Submitting design docs without detailing time/space complexity or failure recovery strategies.'],
      sources: [
        {
          title: 'Google Students Hackathons',
          url: 'https://careers.google.com/students/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['eligibility', 'rounds'],
        },
      ],
    },
  },

  // 9. IIT Summer Research Fellowships (IITB, IITD, IITM, IITK SURGE)
  'opp-iit-fellowship': {
    trust: 'verified_official',
    flags: ['paid_stipend', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free application. Selected research fellows receive ₹5,000 to ₹10,000/month stipend + free on-campus hostel accommodation.',
    },
    stipendDisplay: {
      headline: '₹5,000 – ₹10,000/month Stipend + IIT Campus Hostel',
      note: '8 to 10 weeks of hands-on research in premier research labs under IIT professors.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Hostel accommodation, lab access, and monthly research stipend provided by host IIT.',
      steps: [
        'Maintain high academic standing (CGPA >= 8.5/10).',
        'Draft a customized Statement of Purpose (SOP) tailored to host professor\'s recent publications.',
        'Obtain 2 academic letters of recommendation from college faculty.',
        'Submit official application on host IIT fellowship portal (e.g. IITK SURGE, IITD Summer Research).',
      ],
    },
    windows: [{ label: 'Annual Summer Fellowships', status: 'open', date: 'December – February applications' }],
    richDetails: {
      overview: 'Premier summer research programs hosted by top Indian Institutes of Technology (IIT Kanpur SURGE, IIT Delhi SRFP, IIT Bombay, IIT Madras). Fellows work on cutting-edge research projects in AI, quantum computing, robotics, and VLSI under IIT faculty.',
      what_it_covers: [
        'Cutting-edge academic research: Literature review, empirical experiments, hypothesis testing',
        'Writing research papers for submission to top IEEE, ACM, or NeurIPS/CVPR conferences',
        'Access to advanced compute clusters, laboratory instruments, and academic libraries',
      ],
      format: {
        delivery: 'On-campus full-time residential research internship',
        style: '8 to 10 weeks of full-time laboratory research culminating in a technical symposium presentation',
      },
      cost_breakdown: [
        { item: 'Application Fee', inr: 0, usd: 0 },
        { item: 'Hostel Accommodation', inr: 0, note: 'Provided by host IIT' },
      ],
      validity_renewal: 'Official IIT Summer Research Fellowship Certificate signed by Dean of Academic Affairs.',
      prerequisites: 'Strong academic record (CGPA >= 8.5) and demonstrated domain foundation.',
      eligibility: 'Pre-final year engineering students across accredited Indian universities.',
      how_to_apply: ['Apply via respective IIT research portal (e.g. surge.iitk.ac.in).'],
      timeline: [{ label: 'Applications in Winter', status: 'open', date: 'Dec – Feb' }],
      resume_evidence: {
        attach: ['Official IIT Dean Research Certificate', 'Published research paper or arXiv preprint link'],
        line_template: 'IIT [Kanpur/Delhi] Summer Research Fellow (SURGE) | Researched [Research Topic] under Prof. [Name], engineering [Model/System] with [X]% accuracy improvement and authoring conference preprint.',
      },
      pitfalls: ['Submitting a generic SOP that mentions multiple professors with copy-pasted interests.'],
      sources: [
        {
          title: 'IIT Kanpur SURGE Program',
          url: 'https://surge.iitk.ac.in/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'hostel', 'eligibility'],
        },
      ],
    },
  },

  // 10. Cisco Ideathon (India)
  'opp-cisco-ideathon': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free challenge via Cisco Networking Academy. Direct hiring route for Cisco Consulting Engineer & Software Engineer roles (₹15–20 LPA CTC).',
    },
    rewardDisplay: {
      headline: 'Direct Full-Time Job Offers & Internships at Cisco India (₹15–20 LPA CTC)',
      note: 'Fast-track recruitment into Cisco TAC, Software Engineering, and Cloud Networking teams.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free through NetAcad colleges across India.',
      steps: [
        'Complete Cisco Networking Academy courses (CCNA, DevNet, or CyberOps) through your college.',
        'Register for Cisco Ideathon via NetAcad college portal.',
        'Clear Video Pitch round and Technical Interview rounds.',
      ],
    },
    windows: [{ label: 'Annual Campus Cycle', status: 'open', date: 'July – September' }],
    richDetails: {
      overview: 'Cisco Ideathon provides students from Cisco Networking Academy (NetAcad) partner colleges an opportunity to showcase technical innovation in IoT, AI, 5G, and automated networking, leading directly to full-time engineering and consulting offers at Cisco India.',
      what_it_covers: [
        'Enterprise Networking & Security: SD-WAN, zero-trust network access, telemetry, BGP routing',
        'Network Automation with Python: Cisco DNA Center APIs, pyATS, RESTCONF, and NETCONF',
        'Video pitch presentation on innovative digital transformation use cases',
      ],
      format: {
        delivery: 'Online multi-round evaluation',
        style: 'Technical Assessment → Video Pitch → Technical & Managerial Interviews',
      },
      cost_breakdown: [{ item: 'Entry Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Cisco Ideathon achievement certificate and full-time employment offer.',
      prerequisites: 'Cisco NetAcad course enrollment (CCNA Introduction to Networks or DevNet Associate).',
      eligibility: 'Final year engineering students from Cisco NetAcad partner institutions.',
      how_to_apply: ['Apply through your college Cisco NetAcad coordinator.'],
      timeline: [{ label: 'Autumn Cycle', status: 'open', date: 'July – Sept' }],
      resume_evidence: {
        attach: ['Cisco Ideathon Finalist Certificate', 'Network automation Python repository on GitHub'],
        line_template: 'Cisco Ideathon National Finalist | Designed network telemetry automation system using Python and Cisco RESTCONF APIs, securing direct Cisco Consulting Engineer hiring route.',
      },
      pitfalls: ['Ignoring Cisco networking fundamentals (OSI layers, TCP handshake, IP subnetting).'],
      sources: [
        {
          title: 'Cisco NetAcad India Portal',
          url: 'https://www.netacad.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['program_details', 'careers'],
        },
      ],
    },
  },

  // 11. NITI Aayog Internship & Research Fellowship
  'opp-niti-aayog': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free Government of India policy and technology internship. Unpaid prestige credential with direct Ministry recommendation letters.',
    },
    rewardDisplay: {
      headline: 'Official NITI Aayog Experience Certificate signed by Senior Adviser / Joint Secretary',
      note: 'High-signal government policy and technological governance credential for higher studies and elite analytics roles.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free official Government of India portal.',
      steps: ['Apply online during the 1st to 10th of every month on the official NITI Aayog portal.'],
    },
    windows: [{ label: 'Open 1st to 10th of Every Month', status: 'open_now', date: 'Monthly Window' }],
    richDetails: {
      overview: 'The NITI Aayog Internship Scheme engages undergraduate and postgraduate students from recognized universities in India and abroad with specialized verticals (Data Management & Analysis, Frontier Technologies, AI, Energy, Governance) to contribute to national policymaking.',
      what_it_covers: [
        'National tech policy analysis: AI governance, electric mobility, data privacy frameworks',
        'Large-scale data analytics on government open datasets (NDAP, Census, NFHS)',
        'Drafting policy whitepapers and evaluation reports for Union Ministries',
      ],
      format: {
        delivery: 'In-person at NITI Aayog Headquarters, Sansad Marg, New Delhi (or hybrid)',
        style: '6-week to 6-month research engagement with NITI Aayog policy directors',
      },
      cost_breakdown: [{ item: 'Application Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Official Government of India Experience Certificate.',
      prerequisites: 'Undergraduate student scoring >= 85% in Class 12, or postgraduate student with high CGPA.',
      eligibility: 'Regular students enrolled in recognized universities in India or abroad.',
      how_to_apply: ['Apply exclusively on niti.gov.in between the 1st and 10th day of any month.'],
      timeline: [{ label: 'Monthly Application Window', status: 'open_now', date: '1st–10th of every month' }],
      resume_evidence: {
        attach: ['Official NITI Aayog Certificate signed by Senior Adviser', 'Published policy/data analytical brief'],
        line_template: 'NITI Aayog Research Intern (Data Analytics Vertical) | Analyzed national public datasets across [Sector] using Python and SQL, authoring policy evaluation brief for central ministry stakeholders.',
      },
      pitfalls: ['Missing the strict monthly 1st to 10th application deadline window.'],
      sources: [
        {
          title: 'NITI Aayog Internship Scheme Guidelines',
          url: 'https://www.niti.gov.in/internship',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['dates', 'eligibility', 'guidelines'],
        },
      ],
    },
  },

  // 12. Microsoft Imagine Cup (India & Global)
  'opp-ms-imagine-cup': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free global student technology competition. $100,000 USD Grand Prize + 1:1 mentorship from Microsoft CEO Satya Nadella.',
    },
    rewardDisplay: {
      headline: '$100,000 USD Grand Prize + Mentorship with Microsoft CEO Satya Nadella',
      note: 'All regional semifinalists receive Microsoft Azure AI sponsorship and global media exposure.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Free $1,000 USD in Microsoft Azure AI cloud credits provided to every eligible registered team.',
      steps: [
        'Form a team of up to 4 students and register on imaginecup.microsoft.com.',
        'Activate your free Azure AI sponsorship credits.',
        'Submit a live prototype demo video and pitch deck.',
      ],
    },
    windows: [{ label: 'Annual Global Season', status: 'open', date: 'October – May' }],
    richDetails: {
      overview: 'Microsoft Imagine Cup is the premier global student technology competition. Teams of student innovators leverage Microsoft AI and cloud services to create purpose-driven startup solutions, competing for $100,000 USD and mentorship from Satya Nadella.',
      what_it_covers: [
        'AI and Cloud Innovation: Azure OpenAI models, cognitive services, custom vision, IoT Hub',
        'Startup Product Engineering: Minimum Viable Product (MVP) development, customer discovery, pitch deck creation',
        'Pitching before global venture capitalists and Microsoft corporate vice presidents',
      ],
      format: {
        delivery: 'Online Regional Rounds culminating in World Championship at Microsoft Build',
        style: '3-tier challenge: Idea pitch → MVP demo → Global World Championship live pitch',
      },
      cost_breakdown: [{ item: 'Entry Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious global Imagine Cup semifinalist/finalist award certificate.',
      prerequisites: 'Working software prototype leveraging Microsoft Azure cloud or AI technologies.',
      eligibility: '16+ years old, enrolled in university or vocational program globally.',
      how_to_apply: ['Submit project proposal and demo video on imaginecup.microsoft.com.'],
      timeline: [{ label: 'October to May Season', status: 'open', date: 'Annual cycle' }],
      resume_evidence: {
        attach: ['Microsoft Imagine Cup Semifinalist/Finalist Certificate', 'Azure deployed startup prototype URL & video pitch'],
        line_template: 'Microsoft Imagine Cup Regional Finalist / Winner | Built [Startup Name] powered by Azure OpenAI and computer vision, demoing before Microsoft engineering leadership and winning [Category].',
      },
      pitfalls: ['Submitting conceptual slide decks without a functional, tested prototype running on Azure.'],
      sources: [
        {
          title: 'Microsoft Imagine Cup Official Platform',
          url: 'https://imaginecup.microsoft.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['prizes', 'timeline', 'rules'],
        },
      ],
    },
  },
};
