export interface ResumeFixture {
  id: string;
  name: string;
  category: string;
  rawText: string;
  expectedSections: string[];
  notes?: string;
}

export const RESUME_FIXTURES: ResumeFixture[] = [
  // 1. Cybersecurity Fresher (Original Regression Fixture)
  {
    id: 'cybersecurity-fresher',
    name: 'Jeswanth Posina',
    category: 'Cybersecurity Fresher',
    rawText: `JESWANTH POSINA CYBERSECURITY
jeswanth.cipher1337@gmail.com | +91 7288922933 | Intern | linkedin.com/in/jeswanthposina | github.com/HackerJbon1337

TECHNICAL SKILLS
Scripting & Platforms: Bash (Kali Linux), PowerShell, Linux, IIS
Core Competencies: Static & Dynamic Analysis, Reverse Engineering, Binary Patching, OWASP Top 10, OWASP MASTG, CTFs
Tools & Platforms: Browser DevTools
Networking & Protocols: Network Encapsulation

SECURITY PROJECTS & PRACTICAL EXPERIENCE
Android Application Security Assessment (AndroGoat) 2026
Performed static analysis with JADX to locate hardcoded secrets (API keys, Promo Codes, tokens) embedded in a vulnerable Android APK.
Identified insecure local data storage in SharedPreferences by combining static analysis (JADX) with dynamic inspection via ADB.
Documented client-side trust risks and secure-storage recommendations based on OWASP Mobile Top 10 principles.

Binary Patching & Privilege Escalation Challenge 2026
Reverse engineered an Android APK to locate a client-side isAdmin authorization check using JADX.
Modified Application Logic With APKTool, Rebuilt and Re-signed The APK, and successfully escalated privileges on an emulator, demonstrating the risk of enforcing security decisions on the client side.

L3AK CTF 2026 (International Capture the Flag Competition) 2026
Competed in a 48-hour international CTF as a first-time participant after an invitation from a senior teammate.
Attempted GeoOSINT and CSRF-bypass challenges, built practical skills in HTTP request analysis, and Client-side JavaScript Injection.
Reviewed official write-ups for unsolved challenges to close knowledge gaps and improve future performance.

Network Security Fundamentals & Lab Work 2026
Built and tested a subnetted network topology in Cisco Packet Tracer to reinforce IP addressing, and Routing Concepts.
Used Wireshark and Nmap to analyze HTTP traffic from a self-hosted IIS server and test firewall/ACL behavior on a live network, Including ICMP Vs. HTTPS Handling.

LEADERSHIP & INVOLVEMENT
Technical Team Member — Null (InfoSec) Chapter — VIT-AP University 2026 – Present
• Contribute to a student-run information security community focused on ethical hacking, CTFs, and security awareness on campus.

CERTIFICATIONS & CONTINUOUS LEARNING
• Completed OSI Model & TCP/IP Suite coursework (David Bombal — Networking Udemy course) and studying the OWASP MASTG for structured mobile pentesting methodology.
• Actively solving labs on PortSwigger Web Security Academy and following Real-World Bug Hunting by Peter Yaworski
• maintains a public, day-by-day cybersecurity learning log.`,
    expectedSections: ['header', 'skills', 'projects', 'achievements', 'leadership', 'certifications'],
    notes: 'Regression test: Core Competencies must not swallow projects, and CTFs route to achievements.'
  },

  // 2. Senior Backend Engineer (Experienced, High Scale)
  {
    id: 'senior-backend-engineer',
    name: 'Elena Rostova',
    category: 'Senior Backend Engineer',
    rawText: `ELENA ROSTOVA
elena.rostova@techmail.io | +1 415-555-0199 | San Francisco, CA | linkedin.com/in/erostova | github.com/erostova

SUMMARY
Senior Distributed Systems Engineer with 8+ years architecting fault-tolerant backend infrastructure. Specializing in high-throughput stream processing, Go microservices, and Kubernetes orchestration handling 120k requests per second.

WORK EXPERIENCE
Staff Backend Engineer | Stripe | San Francisco, CA | Mar 2021 – Present
• Architected multi-region transactional ledger service processing 45M transactions daily with 99.999% availability.
• Optimized distributed consensus latency by 32% using custom Raft batching algorithms in Go.
• Mentored 12 mid-level and junior engineers across two distributed ledger infrastructure pods.

Senior Software Engineer | Uber | Seattle, WA | Jun 2017 – Feb 2021
• Engineered real-time geospatial dispatch pipeline using Apache Kafka, gRPC, and Redis cluster.
• Reduced p99 dispatch routing latency from 180ms to 42ms under peak urban ride surges.
• Spearheaded zero-downtime database migration of 4TB Cassandra ring to CockroachDB.

EDUCATION
M.S. in Computer Science | University of Washington | 2015 – 2017
B.S. in Software Engineering | University of California, Berkeley | 2011 – 2015

TECHNICAL SKILLS
Languages: Go, Java, Python, C++, SQL
Distributed Systems: Apache Kafka, gRPC, Redis, Cassandra, CockroachDB, Kubernetes
Cloud & DevOps: AWS, Terraform, Docker, Prometheus, Grafana`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills'],
    notes: 'Experienced candidate with extensive work experience and metrics.'
  },

  // 3. Product Designer
  {
    id: 'product-designer',
    name: 'Marcus Vance',
    category: 'Product Designer',
    rawText: `MARCUS VANCE
marcus@vancedesign.co | +1 212-555-0142 | New York, NY | portfolio.vancedesign.co | linkedin.com/in/marcusvance

SUMMARY
Senior Product Designer with 6 years experience translating complex enterprise workflows into intuitive, human-centered SaaS applications. Led design systems adoption across 4 cross-functional product squads.

EXPERIENCE
Lead Product Designer | Figma Systems Lab | New York, NY | Jan 2022 – Present
• Designed unified multi-platform component library adopted by 85 engineers, decreasing design QA debt by 40%.
• Conducted 60+ generative user interviews to validate workflow re-architecture for enterprise analytics dashboard.
• Authored comprehensive WCAG 2.1 AA accessibility guidelines implemented across all core web products.

UI/UX Designer | Square | San Francisco, CA | Aug 2019 – Dec 2021
• Redesigned merchant onboarding flow, lifting 7-day terminal activation rate from 64% to 81%.
• Built high-fidelity interactive prototypes in Principle and ProtoPie to secure executive design sign-off.

PROJECTS
FinFlow Mobile Banking Redesign | React Native, Figma | 2023
• Overhauled personal finance tracking experience, resulting in 4.8 star App Store rating across 15k reviews.
• Formulated token-based theming architecture supporting dynamic dark mode and high-contrast color palettes.

EDUCATION
B.F.A. in Interaction Design | Rhode Island School of Design | 2015 – 2019

TECHNICAL SKILLS
Design: Figma, FigJam, Sketch, Principle, Adobe Creative Cloud
Prototyping & Code: HTML, CSS, JavaScript, React, Design Tokens
Research: User Testing, Journey Mapping, Usability Audits, WCAG 2.1`,
    expectedSections: ['header', 'summary', 'experience', 'projects', 'education', 'skills']
  },

  // 4. Registered Nurse
  {
    id: 'registered-nurse',
    name: 'Sarah Jenkins, BSN, RN',
    category: 'Healthcare / Nursing',
    rawText: `SARAH JENKINS, BSN, RN
sjenkins.rn@gmail.com | +1 312-555-0811 | Chicago, IL | linkedin.com/in/sjenkins-rn

PROFESSIONAL SUMMARY
Compassionate Critical Care Registered Nurse with 5 years of experience delivering high-acuity care in Level 1 Trauma ICU. Skilled in mechanical ventilation management, hemodynamic monitoring, and rapid code team response.

CLINICAL EXPERIENCE
Intensive Care Unit Staff Nurse | Northwestern Memorial Hospital | Chicago, IL | Aug 2021 – Present
• Managed complex care for 2-3 critically ill patients per shift with advanced hemodynamic instability and continuous renal replacement therapy.
• Administered titration of vasoactive infusions and monitored invasive arterial and central venous pressures.
• Coordinated multidisciplinary daily clinical rounds with intensivists, pharmacists, and respiratory therapists.

Emergency Department Nurse | Rush University Medical Center | Chicago, IL | Jul 2019 – Jul 2021
• Triaged 40+ acute trauma, cardiac, and stroke patients daily according to Emergency Severity Index (ESI) protocols.
• Initiated immediate vascular access, rapid sequence intubation prep, and cardiac resuscitation protocols.

EDUCATION
Bachelor of Science in Nursing (BSN) | Loyola University Chicago | 2015 – 2019

LICENSES & CERTIFICATIONS
• Registered Nurse (RN) — Illinois State Board of Nursing (License #RN-994821)
• Critical Care Registered Nurse (CCRN) — AACN | Completed 2022
• Basic Life Support (BLS) & Advanced Cardiac Life Support (ACLS) — American Heart Association

CLINICAL SKILLS
Critical Care: Hemodynamic Monitoring, Mechanical Ventilation, CRRT, ECMO Care, Arterial Lines
Clinical Software: Epic EHR, Cerner, CareFusion, Philips IntelliVue`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'certifications', 'skills']
  },

  // 5. Marketing Manager
  {
    id: 'marketing-manager',
    name: 'David Sterling',
    category: 'Marketing Manager',
    rawText: `DAVID STERLING
david.sterling@growthlabs.io | +1 512-555-0177 | Austin, TX | linkedin.com/in/dsterling-growth

PROFESSIONAL SUMMARY
Data-driven Growth Marketing Manager with 7 years driving B2B SaaS demand generation. Managed $2.4M annual paid acquisition budget achieving 3.8x ROAS and generating $14M in marketing-sourced pipeline.

WORK EXPERIENCE
Senior Growth Marketing Manager | CloudScale Software | Austin, TX | Apr 2022 – Present
• Spearheaded multi-channel demand generation strategy across Paid Search, LinkedIn Ads, and ABM platforms.
• Lowered customer acquisition cost (CAC) by 28% while accelerating pipeline velocity by 45 days.
• Built automated lead-scoring model in HubSpot integrated with Salesforce to prioritize high-intent accounts.

Digital Marketing Specialist | DataRocket | Denver, CO | Jan 2018 – Mar 2022
• Scaled organic inbound traffic from 45k to 220k monthly unique visitors through targeted technical SEO.
• Designed automated email nurture workflows resulting in a 24% demo request conversion rate.

EDUCATION
B.A. in Marketing & Communications | University of Texas at Austin | 2013 – 2017

SKILLS & TOOLS
Performance Marketing: Google Ads, LinkedIn Campaign Manager, Meta Ads, ABM, SEO
Analytics & Automation: HubSpot, Salesforce, Google Analytics 4, Marketo, Mixpanel, Tableau`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills']
  },

  // 6. Career Changer (Teacher to Software Engineer)
  {
    id: 'career-changer',
    name: 'Rachel Adams',
    category: 'Career Changer',
    rawText: `RACHEL ADAMS
rachel.adams.dev@gmail.com | +1 206-555-0164 | Seattle, WA | github.com/racheladams-code | linkedin.com/in/racheladams-dev

PROFESSIONAL SUMMARY
Motivated full-stack software engineer transitioning from 6 years in secondary STEM education. Bringing rigorous problem-solving skills, deep empathy for end users, and hands-on experience building production React and Node.js applications.

PROJECTS
ClassroomHub Platform | React, Node.js, PostgreSQL, TailwindCSS | 2026
• Built full-stack assignment management portal supporting real-time grade notifications for 350 active users.
• Implemented JWT authentication and role-based access control protecting student FERPA records.
• Deployed microservices architecture using Docker containers on AWS ECS with GitHub Actions CI/CD.

StemCurriculum Tracker | TypeScript, Express, MongoDB | 2025
• Developed REST API with automated unit test coverage of 92% utilizing Jest and Supertest.
• Integrated Redis caching layer reducing frequent curriculum lookup response times from 250ms to 35ms.

PREVIOUS PROFESSIONAL EXPERIENCE
Lead High School Mathematics & Physics Teacher | Seattle Public Schools | 2018 – 2024
• Designed inquiry-based calculus curriculum for 140+ students annually, improving standardized test passing rates by 18%.
• Facilitated district-wide educator workshops on data-driven student performance diagnostics.

EDUCATION
Full-Stack Software Engineering Immersive | General Assembly | 2025
B.S. in Mathematics | University of Washington | 2014 – 2018

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, Next.js, Jest, TailwindCSS
Tools & Cloud: PostgreSQL, MongoDB, Redis, Docker, Git, GitHub, AWS, Postman`,
    expectedSections: ['header', 'summary', 'projects', 'experience', 'education', 'skills']
  },

  // 7. No Projects Candidate (Pure Corporate Enterprise History)
  {
    id: 'no-projects-candidate',
    name: 'Michael Chang',
    category: 'No Projects Enterprise History',
    rawText: `MICHAEL CHANG
michael.chang@corpfin.com | +1 646-555-0133 | New York, NY | linkedin.com/in/mchang-finance

SUMMARY
Senior Financial Analyst with 9 years of investment banking and corporate valuation experience. Expert in discounted cash flow modeling, LBO evaluation, and enterprise portfolio risk assessment.

PROFESSIONAL EXPERIENCE
Vice President, Financial Analysis | Morgan Stanley | New York, NY | Jan 2020 – Present
• Directed quantitative risk assessment across $1.2B commercial debt portfolio, preventing credit default losses.
• Supervised team of 6 analysts in creating quarterly financial presentation decks for institutional stakeholders.
• Formulated automated valuation dashboards in Bloomberg Terminal and Excel VBA.

Senior Financial Analyst | Goldman Sachs | New York, NY | Jun 2016 – Dec 2019
• Modeled complex M&A buyout transactions ranging from $50M to $650M in enterprise value.
• Authored comprehensive fairness opinions and due diligence reports for Fortune 500 board meetings.

Financial Analyst | Citigroup | New York, NY | Jul 2014 – May 2016
• Executed daily reconciliation of foreign exchange trading accounts totaling $300M in transactional volume.

EDUCATION
B.S. in Finance & Economics | New York University, Stern School of Business | 2010 – 2014
Magna Cum Laude

CERTIFICATIONS
• Chartered Financial Analyst (CFA) Charterholder — CFA Institute
• FINRA Series 7 and Series 63 Licenses

CORE COMPETENCIES
Financial Modeling: DCF, LBO, M&A Valuation, Sensitivity Analysis, Credit Risk
Software & Tools: Bloomberg Terminal, FactSet, Excel VBA, Capital IQ, Python for Finance`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'certifications', 'skills'],
    notes: 'Candidate has zero projects section; engine must omit Projects heading cleanly without errors.'
  },

  // 8. Fifteen Skills Groups (Testing Category Merger)
  {
    id: 'fifteen-skills-groups',
    name: 'Alexandre Dubois',
    category: 'Fragmented Skills (15 Groups)',
    rawText: `ALEXANDRE DUBOIS
alex.dubois@polyglot.dev | +33 6 12 34 56 78 | Paris, France | github.com/alexdubois | linkedin.com/in/alex-dubois

SUMMARY
Full-Stack Polyglot Developer with 4 years experience building modular enterprise applications.

EXPERIENCE
Software Engineer | Criteo | Paris, France | 2022 – Present
• Developed high-speed telemetry collection agents processing 500M events daily.
• Optimized memory footprints across containerized microservices by 25%.

EDUCATION
Master of Science in Computer Science | École Polytechnique | 2017 – 2022

TECHNICAL SKILLS
Web Languages: JavaScript
System Languages: Rust
Scripting: Bash
Mobile: Swift
Frontend: React
State Management: Redux
CSS Tooling: TailwindCSS
Backend: Node.js
Microframeworks: Express
Relational DB: PostgreSQL
NoSQL DB: MongoDB
Cache Systems: Redis
Containers: Docker
Orchestration: Kubernetes
CI Tools: GitHub Actions`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills'],
    notes: 'Candidate has 15 micro-categories with 1 item each. Engine must merge orphan groups into 3-5 cohesive groups.'
  },

  // 9. Long Summary Candidate (> 70 words, testing summary lint and fit)
  {
    id: 'long-summary-candidate',
    name: 'Victoria Bennett',
    category: 'Overly Verbose Summary',
    rawText: `VICTORIA BENNETT
victoria.bennett@consulting.org | +1 202-555-0182 | Washington, DC | linkedin.com/in/vbennett-mgmt

SUMMARY
Extremely dedicated and highly accomplished Management Consultant with over ten years of deep advisory experience assisting global enterprises and federal government agencies through complex organizational transformations, digital technology migrations, supply chain optimizations, and agile workflow implementations across multifaceted business units while ensuring complete adherence to strict compliance mandates and operational excellence standards across North American operations.

EXPERIENCE
Senior Engagement Manager | Deloitte Consulting | Washington, DC | 2019 – Present
• Led cross-functional advisory teams delivering $15M enterprise IT modernization roadmap.
• Facilitated executive stakeholder workshops aligning 8 department heads on shared digital objectives.

Consultant | Booz Allen Hamilton | McLean, VA | 2015 – 2019
• Analyzed operational performance bottlenecks across 12 federal service centers.

EDUCATION
Master of Public Policy | Georgetown University | 2013 – 2015
B.A. in Political Science | University of Virginia | 2009 – 2013

SKILLS
Strategic Planning, Change Management, Business Process Re-engineering, Agile Methodologies, Stakeholder Alignment`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills'],
    notes: 'Summary is over 70 words; Stage 6 linter must flag warning and Stage 4/5 page-fit must control line-height.'
  },

  // 10. Non-English Names and International Formats
  {
    id: 'non-english-names',
    name: 'José María González-Müller',
    category: 'International Diacritics & Formats',
    rawText: `JOSÉ MARÍA GONZÁLEZ-MÜLLER
jose.gonzalez@munich-tech.de | +49 89 289 01 | Munich, Germany | linkedin.com/in/jmgonzalez | github.com/jmgonzalez

SUMMARY
Embedded Systems Engineer specializing in real-time firmware development for automotive ECUs and CAN-bus sensor networks.

WORK EXPERIENCE
Embedded Firmware Engineer | BMW Group | Munich, Germany | Mar 2021 – Present
• Developed MISRA-C compliant sensor telemetry firmware running on AUTOSAR architecture.
• Executed hardware-in-the-loop (HIL) stress testing across 200 automotive ECU microcontrollers.

Junior Firmware Engineer | Siemens | Nuremberg, Germany | Oct 2019 – Feb 2021
• Programmed low-level I2C and SPI peripheral device drivers on ARM Cortex-M4 processors.

EDUCATION
M.Sc. in Electrical Engineering & Information Technology | Technische Universität München | 2017 – 2019
B.Sc. in Telecommunications Engineering | Universidad Politécnica de Madrid | 2013 – 2017

TECHNICAL SKILLS
Languages: Embedded C, C++, Python, Assembly (ARM)
Protocols & Hardware: CAN, LIN, SPI, I2C, UART, Oscilloscopes, Logic Analyzers
Standards & Tools: AUTOSAR, MISRA-C, Vector CANoe, MATLAB/Simulink`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills'],
    notes: 'Tests preservation of diacritics (é, í, á, ü), hyphens, and European phone formats.'
  },

  // 11. Missing Dates in Education (Testing Non-Blocking Suggestion)
  {
    id: 'missing-dates-education',
    name: 'Lucas Campbell',
    category: 'Missing Education Dates',
    rawText: `LUCAS CAMPBELL
lucas.campbell@devmail.net | +1 404-555-0155 | Atlanta, GA | linkedin.com/in/lcampbell-dev

SUMMARY
Front-End Engineer with 3 years experience building responsive, accessible web applications in Next.js and Tailwind CSS.

EXPERIENCE
Frontend Developer | Mailchimp | Atlanta, GA | 2023 – Present
• Built modular drag-and-drop newsletter builder components supporting 2M active campaign creators.
• Improved Lighthouse accessibility audit scores from 76 to 98 across core app routes.

Junior Web Developer | NCR Corporation | Atlanta, GA | 2022 – 2023
• Implemented client-side input validations and state persistence for POS terminal checkout portals.

EDUCATION
Bachelor of Science in Computer Science
Georgia Institute of Technology
GPA: 3.8 / 4.0

SKILLS
Languages: TypeScript, JavaScript, HTML5, CSS3
Frameworks: React, Next.js, Tailwind CSS, Jest
Tools: Git, Vite, Webpack, Figma`,
    expectedSections: ['header', 'summary', 'experience', 'education', 'skills'],
    notes: 'Education lacks dates; engine must not crash or fabricate dates, but must issue a non-blocking suggestion.'
  },

  // 12. Deliberately Messy Input (Testing Normalization & Polish)
  {
    id: 'deliberately-messy-input',
    name: 'Devin Thorne',
    category: 'Deliberately Messy Input',
    rawText: `DEVIN THORNE
dthorne@inbox.org   |   +1-503-555-0122   |   Portland, OR   |   github.com/dthorne

SUMMARY
Software engineer passionate about scalable microservices.,. and backend performance tuning..

EXPERIENCE
Backend Developer - CloudCo Inc - Portland, OR - 2022 - present
- developed async queue workers processing over 1000 jobs per minute.
- wrote automated integration tests with supertest and jest.,
- resolved memory leak issues in node js event loop..

PROJECTS
TaskRunner CLI 2024
- created open-source rust cli utility for developer task orchestration.
- published crates package with 500+ downloads.,

EDUCATION
B.S. in Computer Science - Oregon State University - 2018 - 2022

SKILLS
Node.js, Express, Rust, Docker, PostgreSQL, Redis, Jest.`,
    expectedSections: ['header', 'summary', 'experience', 'projects', 'education', 'skills'],
    notes: 'Contains double punctuation (., ..), lowercase bullet starts, and inconsistent dashes.'
  }
];
