// ============================================================
// HireFlow — TalentLens™ Curated Job Family Templates (Stage 5)
// Rule H1 / W7: Deterministic editorial templates with strictly verified engine competencies
// Zero company-specific claims, salaries, or artificial padding.
// ============================================================

export interface SkillRequirement {
  name: string;
  category: 'Language' | 'Framework' | 'Database' | 'Cloud' | 'Architecture' | 'Hardware' | 'Core';
  weight: number; // 0.5 to 1.0
}

export interface JobFamilyTemplate {
  familyKey: string;
  title: string;
  level: string;
  track: string;
  desc: string;
  aboutRole: string;
  responsibilities: string[];
  requiredQualifications: string[];
  requiredSkills: SkillRequirement[];
  competencies: string[]; // 2 to 6 valid engine keys (from 20 canonical keys)
  reqLevel: Record<string, string>; // Editorial proficiency requirement
  uncoveredSkills: string[]; // Essential skills with no canonical 20-engine key
  competencyFit: 'good' | 'approximate';
}

export const JOB_FAMILY_TEMPLATES: Record<string, JobFamilyTemplate> = {
  'backend-engineer': {
    familyKey: 'backend-engineer',
    title: 'Backend Software Engineer',
    level: 'L1 / Associate',
    track: 'Backend Engineering',
    desc: 'Designs and builds scalable server-side services, transactional application programming interfaces, and relational datastores.',
    aboutRole: 'As an Associate Backend Engineer, you will contribute to distributed backend microservices, write clean maintainable business logic, and collaborate on system reliability.',
    responsibilities: [
      'Implement robust RESTful and RPC application programming interfaces for core services',
      'Design normalized relational and document database schemas with indexed queries',
      'Author comprehensive unit and integration test suites using automated testing frameworks',
      'Collaborate with frontend and platform engineering teams on API contract definitions',
      'Optimize execution latencies and database query performance under high request throughput',
      'Participate in peer code reviews, architectural discussions, and technical documentation'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Computer Science, Information Technology, or allied technical stream',
      'Sound understanding of core object-oriented programming and algorithmic data structures'
    ],
    requiredSkills: [
      { name: 'Java or Go or Python', category: 'Language', weight: 0.9 },
      { name: 'RESTful API Design', category: 'Architecture', weight: 0.8 },
      { name: 'SQL & Database Optimization', category: 'Database', weight: 0.8 },
      { name: 'Unit & Integration Testing', category: 'Core', weight: 0.7 }
    ],
    competencies: ['java', 'dsa', 'systemdesign', 'sql', 'rest'],
    reqLevel: {
      java: 'strong',
      dsa: 'proficient',
      systemdesign: 'proficient',
      sql: 'proficient',
      rest: 'strong'
    },
    uncoveredSkills: [],
    competencyFit: 'good'
  },

  'frontend-engineer': {
    familyKey: 'frontend-engineer',
    title: 'Frontend Software Engineer',
    level: 'L1 / Associate',
    track: 'Frontend Engineering',
    desc: 'Builds responsive user interfaces, accessible web applications, and modular component architectures using modern client-side ecosystems.',
    aboutRole: 'Develops interactive customer-facing interfaces, ensuring pixel-perfect rendering, seamless responsive behavior, and optimal frontend rendering performance.',
    responsibilities: [
      'Develop modular and reusable UI components adhering to design system guidelines',
      'Integrate client-side applications with backend endpoints using typed REST APIs',
      'Implement state management architectures for high-complexity interactive workflows',
      'Ensure web accessibility compliance (WCAG) and responsive mobile-first layouts',
      'Profile and optimize browser runtime performance, bundle footprints, and Core Web Vitals',
      'Write automated unit and component visual regression tests'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Science, or equivalent technical education',
      'Demonstrated proficiency in JavaScript / TypeScript and modern component paradigms'
    ],
    requiredSkills: [
      { name: 'React & TypeScript', category: 'Framework', weight: 0.9 },
      { name: 'HTML5, CSS & Responsive Design', category: 'Core', weight: 0.8 },
      { name: 'State Management (Zustand / Redux)', category: 'Architecture', weight: 0.7 },
      { name: 'REST API Integration', category: 'Architecture', weight: 0.7 }
    ],
    competencies: ['react', 'typescript', 'testing', 'rest'],
    reqLevel: {
      react: 'strong',
      typescript: 'strong',
      rest: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: [],
    competencyFit: 'good'
  },

  'fullstack-engineer': {
    familyKey: 'fullstack-engineer',
    title: 'Full Stack Engineer',
    level: 'L1 / Associate',
    track: 'Full Stack Engineering',
    desc: 'Bridges client interfaces and backend microservices, delivering end-to-end features across both web frontends and cloud server components.',
    aboutRole: 'Takes ownership of feature delivery from intuitive UI presentation through to server business logic and data persistence.',
    responsibilities: [
      'Build end-to-end web features connecting React frontends with Node.js or Java backends',
      'Design clean data contracts and maintain typed schemas between client and server tiers',
      'Implement persistent database operations with SQL queries and transactions',
      'Containerize applications using Docker for reproducible local development and staging',
      'Write end-to-end automated tests covering critical business workflows',
      'Participate in agile sprint ceremonies, code reviews, and defect triage'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Software Engineering, or allied field',
      'Hands-on experience building full-stack web applications with modern toolchains'
    ],
    requiredSkills: [
      { name: 'React & TypeScript', category: 'Framework', weight: 0.9 },
      { name: 'Node.js or Java Backend', category: 'Language', weight: 0.9 },
      { name: 'Relational Databases (PostgreSQL / MySQL)', category: 'Database', weight: 0.8 },
      { name: 'Docker & Containerization', category: 'Cloud', weight: 0.6 }
    ],
    competencies: ['react', 'typescript', 'nodejs', 'sql', 'rest', 'docker'],
    reqLevel: {
      react: 'proficient',
      typescript: 'proficient',
      nodejs: 'proficient',
      sql: 'proficient',
      rest: 'proficient',
      docker: 'working'
    },
    uncoveredSkills: [],
    competencyFit: 'good'
  },

  'mobile-engineer': {
    familyKey: 'mobile-engineer',
    title: 'Mobile Applications Engineer',
    level: 'L1 / Associate',
    track: 'Mobile Engineering',
    desc: 'Develops performant and fluid mobile client applications for Android and iOS operating environments.',
    aboutRole: 'Builds mobile client experiences focusing on touch responsiveness, battery efficiency, offline caching, and native hardware interaction.',
    responsibilities: [
      'Build user interfaces and navigation flows for mobile applications',
      'Integrate mobile clients with authenticated cloud REST APIs and real-time sockets',
      'Implement local caching, offline sync, and device storage persistence',
      'Optimize app launch time, frame rates, and memory footprint across device form factors',
      'Automate unit testing and continuous integration builds for mobile releases',
      'Diagnose device-specific rendering defects and network degradation scenarios'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Technology, or equivalent technical education',
      'Foundational understanding of mobile architectures and mobile UI lifecycle'
    ],
    requiredSkills: [
      { name: 'React Native or Mobile TypeScript', category: 'Framework', weight: 0.9 },
      { name: 'RESTful API Consumption', category: 'Architecture', weight: 0.8 },
      { name: 'State Management & Offline Storage', category: 'Architecture', weight: 0.7 }
    ],
    competencies: ['react', 'typescript', 'rest', 'testing'],
    reqLevel: {
      react: 'strong',
      typescript: 'strong',
      rest: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: ['iOS Native (Swift)', 'Android Native (Kotlin)', 'React Native mobile bridge'],
    competencyFit: 'approximate'
  },

  'embedded-engineer': {
    familyKey: 'embedded-engineer',
    title: 'Embedded Software Engineer',
    level: 'L1 / Graduate Engineer Trainee',
    track: 'Embedded & Hardware Systems',
    desc: 'Develops low-level microcontroller software, device drivers, and real-time control algorithms for constrained hardware platforms.',
    aboutRole: 'Develops real-time embedded firmware running directly on bare-metal and RTOS platforms across automotive, industrial, and consumer devices.',
    responsibilities: [
      'Write clean, memory-efficient embedded software in C and modern low-level toolchains',
      'Develop peripheral hardware drivers for UART, SPI, I2C, and GPIO interfaces',
      'Configure real-time operating system task schedules, mutexes, and interrupt handlers',
      'Debug firmware using hardware in-circuit emulators, logic analyzers, and oscilloscopes',
      'Perform static code analysis and unit testing for safety-critical execution paths',
      'Collaborate with hardware design engineers on board bringup and validation'
    ],
    requiredQualifications: [
      'Bachelor degree in Electronics and Communication, Electrical Engineering, or Computer Engineering',
      'Strong conceptual knowledge of digital systems, microcontroller architectures, and memory mapping'
    ],
    requiredSkills: [
      { name: 'Embedded C / C++', category: 'Language', weight: 1.0 },
      { name: 'RTOS & Task Scheduling', category: 'Hardware', weight: 0.9 },
      { name: 'Microcontroller Peripherals (SPI, I2C, UART)', category: 'Hardware', weight: 0.9 },
      { name: 'Firmware Debugging (JTAG, Oscilloscopes)', category: 'Hardware', weight: 0.8 }
    ],
    competencies: ['dsa', 'testing'],
    reqLevel: {
      dsa: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: ['C/C++', 'embedded C', 'RTOS', 'microcontrollers', 'device drivers'],
    competencyFit: 'approximate'
  },

  'firmware-engineer': {
    familyKey: 'firmware-engineer',
    title: 'Firmware Engineer',
    level: 'L1 / Graduate Engineer Trainee',
    track: 'Embedded & Hardware Systems',
    desc: 'Engineers system firmware, bootloaders, and hardware abstraction layers interfacing host operating systems with physical silicon.',
    aboutRole: 'Develops board support packages, storage flash translation layers, and silicon bring-up routines closely integrated with target chipsets.',
    responsibilities: [
      'Develop and maintain low-level board support packages and boot firmware',
      'Implement flash memory management and wear-leveling algorithms for solid-state storage',
      'Execute hardware-software co-verification on silicon pre-production validation platforms',
      'Optimize boot latency and low-power standby sleep state transitions',
      'Write automated hardware regression test scripts for continuous integration benches',
      'Analyze low-level memory leaks, bus contention, and timing closure anomalies'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Electronics, Computer Engineering, or Microelectronics',
      'Solid foundation in computer architecture, memory hierarchies, and registers'
    ],
    requiredSkills: [
      { name: 'C & Assembly Fundamentals', category: 'Language', weight: 1.0 },
      { name: 'Hardware Abstraction & Silicon Bringup', category: 'Hardware', weight: 0.9 },
      { name: 'Bus Protocols (PCIe, NVMe, I2C)', category: 'Hardware', weight: 0.8 }
    ],
    competencies: ['dsa', 'testing'],
    reqLevel: {
      dsa: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: ['C/C++', 'firmware', 'low-level debugging', 'memory-mapped I/O', 'semiconductor'],
    competencyFit: 'approximate'
  },

  'fpga-asic-engineer': {
    familyKey: 'fpga-asic-engineer',
    title: 'FPGA / ASIC Verification Engineer',
    level: 'L1 / Graduate Trainee',
    track: 'Semiconductors & VLSI',
    desc: 'Verifies digital integrated circuit designs, writing comprehensive SystemVerilog testbenches and validating register-transfer logic.',
    aboutRole: 'Ensures functional correctness of complex digital chip designs before tape-out using universal verification methodology testbenches.',
    responsibilities: [
      'Develop modular verification environments using SystemVerilog and UVM standards',
      'Write constrained-random test cases to verify corner-case functional behavior',
      'Define functional coverage metrics and drive coverage closure to completeness',
      'Implement automated regression runs using Python scripting in simulation tools',
      'Analyze simulation waveforms to isolate and resolve digital logic defects',
      'Collaborate with RTL design architects to review microarchitectural specifications'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in VLSI Design, Electronics Engineering, or allied field',
      'Strong grasp of digital design concepts, synchronous state machines, and timing constraints'
    ],
    requiredSkills: [
      { name: 'SystemVerilog & UVM', category: 'Hardware', weight: 1.0 },
      { name: 'Digital Logic & RTL Verification', category: 'Hardware', weight: 0.9 },
      { name: 'Python Automation', category: 'Language', weight: 0.7 }
    ],
    competencies: ['dsa', 'python'],
    reqLevel: {
      dsa: 'proficient',
      python: 'working'
    },
    uncoveredSkills: ['FPGA', 'ASIC', 'SystemVerilog', 'UVM', 'semiconductor', 'RTL'],
    competencyFit: 'approximate'
  },

  'automotive-software-engineer': {
    familyKey: 'automotive-software-engineer',
    title: 'Automotive Software Engineer',
    level: 'L1 / Graduate Engineer Trainee',
    track: 'Automotive & Mobility Engineering',
    desc: 'Develops in-vehicle electronic control software compliant with automotive safety, AUTOSAR standards, and vehicle bus communications.',
    aboutRole: 'Develops software for electronic control units (ECUs) powering advanced driver assistance, powertrain, chassis, and body electronics.',
    responsibilities: [
      'Develop automotive software modules adhering to AUTOSAR classic and adaptive standards',
      'Implement communication stacks for Controller Area Network (CAN) and Automotive Ethernet',
      'Perform model-based design and code generation using MATLAB and Simulink environments',
      'Conduct software-in-the-loop (SIL) and hardware-in-the-loop (HIL) automated validation',
      'Ensure code compliance with MISRA C guidelines and ISO 26262 functional safety processes',
      'Document architectural decisions, interface specifications, and safety requirement traces'
    ],
    requiredQualifications: [
      'Bachelor degree in Automotive, Electronics, Electrical, or Computer Engineering',
      'Sound understanding of vehicle electrical architectures and safety engineering fundamentals'
    ],
    requiredSkills: [
      { name: 'Embedded C for Automotive', category: 'Language', weight: 1.0 },
      { name: 'AUTOSAR Architecture', category: 'Hardware', weight: 0.9 },
      { name: 'CAN & Vehicle Networking', category: 'Hardware', weight: 0.8 },
      { name: 'HIL / SIL Test Automation', category: 'Core', weight: 0.8 }
    ],
    competencies: ['dsa', 'testing'],
    reqLevel: {
      dsa: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: ['C/C++', 'AUTOSAR', 'CAN bus', 'Simulink', 'embedded C', 'ISO 26262'],
    competencyFit: 'approximate'
  },

  'industrial-automation-engineer': {
    familyKey: 'industrial-automation-engineer',
    title: 'Industrial Automation Software Engineer',
    level: 'L1 / Graduate Trainee',
    track: 'Industrial IoT & Automation',
    desc: 'Designs programmable logic controller software, supervisory control systems, and industrial IoT monitoring platforms.',
    aboutRole: 'Develops automation logic and SCADA visualization tools to monitor, control, and optimize smart factory and energy management systems.',
    responsibilities: [
      'Develop PLC application logic using structured text and IEC 61131-3 languages',
      'Configure SCADA and human-machine interface (HMI) operational screens',
      'Integrate industrial field devices over Modbus, Profinet, and OPC-UA communication networks',
      'Build edge software connectors transferring machine telemetry to cloud IoT platforms',
      'Execute commissioning tests and validate safety interlock control routines',
      'Draft functional design specifications and site acceptance testing documentation'
    ],
    requiredQualifications: [
      'Bachelor degree in Electrical, Instrumentation, Electronics, or Mechatronics Engineering',
      'Understanding of industrial control theory, sensor instrumentation, and electrical schematics'
    ],
    requiredSkills: [
      { name: 'PLC Programming (Structured Text)', category: 'Hardware', weight: 1.0 },
      { name: 'SCADA & HMI Systems', category: 'Hardware', weight: 0.8 },
      { name: 'Industrial Fieldbus Protocols (OPC-UA, Modbus)', category: 'Hardware', weight: 0.8 }
    ],
    competencies: ['python', 'testing'],
    reqLevel: {
      python: 'working',
      testing: 'proficient'
    },
    uncoveredSkills: ['PLC programming', 'SCADA', 'control theory', 'industrial protocols', 'Simulink'],
    competencyFit: 'approximate'
  },

  'data-engineer': {
    familyKey: 'data-engineer',
    title: 'Data Platform Engineer',
    level: 'L1 / Associate',
    track: 'Data & Analytics',
    desc: 'Constructs automated data pipelines, distributed extract-transform-load workflows, and centralized analytical warehouses.',
    aboutRole: 'Engineers robust data infrastructure, streaming pipelines, and warehouse schemas that power enterprise business intelligence and AI models.',
    responsibilities: [
      'Build scalable batch and real-time streaming data pipelines using modern distributed tools',
      'Design dimensional and columnar data models in analytical cloud data warehouses',
      'Author complex SQL transformations with data validation and idempotency safeguards',
      'Containerize pipeline components and automate scheduling via workflow orchestrators',
      'Monitor data quality, pipeline SLAs, execution latencies, and warehouse compute budgets',
      'Collaborate with analytics and data science stakeholders on domain dataset availability'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Data Engineering, Information Technology, or allied field',
      'Proficiency in Python programming, relational database systems, and SQL query tuning'
    ],
    requiredSkills: [
      { name: 'Python Data Engineering', category: 'Language', weight: 0.9 },
      { name: 'Advanced SQL & Data Modeling', category: 'Database', weight: 0.9 },
      { name: 'Cloud Data Platforms (Snowflake / AWS / GCP)', category: 'Cloud', weight: 0.8 },
      { name: 'Pipeline Orchestration (Airflow / dbt)', category: 'Architecture', weight: 0.7 }
    ],
    competencies: ['python', 'sql', 'aws', 'docker'],
    reqLevel: {
      python: 'strong',
      sql: 'strong',
      aws: 'proficient',
      docker: 'working'
    },
    uncoveredSkills: ['Snowflake / Databricks', 'Apache Spark', 'data modeling', 'dbt'],
    competencyFit: 'approximate'
  },

  'data-scientist': {
    familyKey: 'data-scientist',
    title: 'Data Scientist',
    level: 'L1 / Associate',
    track: 'Data & Analytics',
    desc: 'Applies statistical methodology, machine learning models, and quantitative analysis to extract actionable insights from data.',
    aboutRole: 'Develops predictive statistical models, designs hypothesis experiments, and presents quantitative findings to guide technical decisions.',
    responsibilities: [
      'Perform exploratory data analysis and statistical validation on complex multi-source datasets',
      'Build, calibrate, and evaluate supervised and unsupervised predictive machine learning models',
      'Design randomized controlled A/B experiments and interpret statistical significance results',
      'Write reproducible data analysis scripts in Python utilizing Pandas, NumPy, and Scikit-Learn',
      'Synthesize analytical findings into clear visualizations and actionable technical memos',
      'Collaborate with data engineering teams to operationalize feature calculation pipelines'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Statistics, Data Science, Mathematics, Computer Science, or Economics',
      'Strong foundation in probability, linear algebra, inferential statistics, and machine learning'
    ],
    requiredSkills: [
      { name: 'Python (Pandas, NumPy, Scikit-Learn)', category: 'Language', weight: 0.9 },
      { name: 'Statistical Inference & A/B Testing', category: 'Core', weight: 0.9 },
      { name: 'SQL & Data Extraction', category: 'Database', weight: 0.8 },
      { name: 'Machine Learning Algorithms', category: 'Core', weight: 0.8 }
    ],
    competencies: ['python', 'ml', 'sql'],
    reqLevel: {
      python: 'strong',
      ml: 'strong',
      sql: 'proficient'
    },
    uncoveredSkills: ['statistical inference', 'hypothesis testing', 'econometrics', 'experimentation'],
    competencyFit: 'approximate'
  },

  'ml-engineer': {
    familyKey: 'ml-engineer',
    title: 'Machine Learning Engineer',
    level: 'L1 / Associate',
    track: 'Artificial Intelligence & ML',
    desc: 'Builds and deploys machine learning models into production inference microservices with automated evaluation pipelines.',
    aboutRole: 'Translates prototype machine learning models into high-throughput, low-latency production APIs with continuous monitoring.',
    responsibilities: [
      'Implement model training, evaluation, and serialization pipelines in PyTorch and Python',
      'Package and containerize inference services for deployment on Kubernetes clusters',
      'Implement automated model performance tracking, drift detection, and data validation',
      'Optimize deep learning inference throughput using quantization and hardware acceleration',
      'Collaborate with backend engineers to integrate ML endpoints into application architectures',
      'Maintain rigorous experiment tracking, model registry versioning, and reproducibility'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Computer Science, Artificial Intelligence, or allied technical stream',
      'Strong programming competence in Python and conceptual mastery of deep learning architectures'
    ],
    requiredSkills: [
      { name: 'Python & PyTorch / TensorFlow', category: 'Language', weight: 1.0 },
      { name: 'ML Model Serving & FastAPI', category: 'Architecture', weight: 0.8 },
      { name: 'Docker & Kubernetes Deployment', category: 'Cloud', weight: 0.8 },
      { name: 'Model Evaluation & Metrics Tracking', category: 'Core', weight: 0.7 }
    ],
    competencies: ['python', 'ml', 'docker', 'kubernetes'],
    reqLevel: {
      python: 'strong',
      ml: 'strong',
      docker: 'proficient',
      kubernetes: 'working'
    },
    uncoveredSkills: ['model deployment', 'vector databases', 'LLM fine-tuning', 'MLOps'],
    competencyFit: 'approximate'
  },

  'qa-automation': {
    familyKey: 'qa-automation',
    title: 'Quality Assurance & SDET',
    level: 'L1 / Associate',
    track: 'Quality Engineering',
    desc: 'Designs automated end-to-end testing frameworks, API test suites, and regression safety nets across distributed product stacks.',
    aboutRole: 'Ensures software reliability through robust automated test harnesses, performance stress benches, and continuous quality checks.',
    responsibilities: [
      'Design, write, and maintain automated UI and API functional regression test suites',
      'Integrate automated quality gates and test execution runs into CI/CD build pipelines',
      'Develop load and stress testing scripts to validate service stability under peak volume',
      'Isolate, document, and track software defects with reproducible steps and log captures',
      'Collaborate with developers during feature design to define testable acceptance criteria',
      'Promote test coverage analysis and continuous improvement of quality standards'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Technology, or equivalent education',
      'Practical programming ability in Python, Java, or JavaScript with test automation tools'
    ],
    requiredSkills: [
      { name: 'Test Automation (Playwright / Selenium / Cypress)', category: 'Core', weight: 0.9 },
      { name: 'API Testing (Postman / REST-Assured)', category: 'Architecture', weight: 0.8 },
      { name: 'Python or Java Test Scripting', category: 'Language', weight: 0.8 },
      { name: 'CI/CD Pipeline Integration', category: 'Cloud', weight: 0.7 }
    ],
    competencies: ['testing', 'python', 'ci_cd', 'rest'],
    reqLevel: {
      testing: 'strong',
      python: 'proficient',
      ci_cd: 'proficient',
      rest: 'proficient'
    },
    uncoveredSkills: ['Playwright', 'Selenium', 'test strategy', 'load testing'],
    competencyFit: 'approximate'
  },

  'devops-cloud-engineer': {
    familyKey: 'devops-cloud-engineer',
    title: 'DevOps & Cloud Engineer',
    level: 'L1 / Associate',
    track: 'Platform & Cloud Infrastructure',
    desc: 'Automates cloud infrastructure provisioning, container orchestration, and continuous integration and delivery pipelines.',
    aboutRole: 'Builds reliable cloud foundations, automates deployment lifecycles, and maintains infrastructure observability across staging and production.',
    responsibilities: [
      'Author Infrastructure-as-Code templates to provision secure cloud resources',
      'Configure and manage Kubernetes cluster workloads, ingress controllers, and secrets',
      'Build automated CI/CD deployment pipelines with automated rollback capabilities',
      'Set up centralized logging, metrics collection, and alerting dashboards',
      'Implement security best practices, least-privilege IAM policies, and image scanning',
      'Participate in on-call rotations, incident post-mortems, and capacity planning'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Systems, or allied engineering field',
      'Strong grasp of Linux systems administration, networking fundamentals, and cloud concepts'
    ],
    requiredSkills: [
      { name: 'Cloud Infrastructure (AWS / Azure / GCP)', category: 'Cloud', weight: 0.9 },
      { name: 'Kubernetes & Docker', category: 'Cloud', weight: 0.9 },
      { name: 'CI/CD Automation (GitHub Actions / GitLab)', category: 'Cloud', weight: 0.8 },
      { name: 'Infrastructure as Code (Terraform)', category: 'Architecture', weight: 0.8 }
    ],
    competencies: ['aws', 'kubernetes', 'docker', 'ci_cd', 'devops'],
    reqLevel: {
      aws: 'strong',
      kubernetes: 'proficient',
      docker: 'strong',
      ci_cd: 'strong',
      devops: 'strong'
    },
    uncoveredSkills: ['Terraform', 'Infrastructure as Code', 'Linux administration'],
    competencyFit: 'approximate'
  },

  'security-engineer': {
    familyKey: 'security-engineer',
    title: 'Cybersecurity & InfoSec Engineer',
    level: 'L1 / Associate',
    track: 'Security Engineering',
    desc: 'Identifies software vulnerabilities, reinforces cloud security postures, and audits application code against threats.',
    aboutRole: 'Protects customer data and systems by embedding secure development standards, conducting vulnerability audits, and monitoring threats.',
    responsibilities: [
      'Perform static and dynamic security testing (SAST/DAST) across codebases and containers',
      'Audit cloud architecture configurations against CIS benchmarks and compliance controls',
      'Triage and validate vulnerability findings, guiding developers on remediation methods',
      'Implement automated dependency scanning and supply-chain security checks in pipelines',
      'Participate in security architecture reviews for new service designs and APIs',
      'Assist in security incident detection, forensic log analysis, and response runbooks'
    ],
    requiredQualifications: [
      'Bachelor degree in Cybersecurity, Computer Science, Information Technology, or allied stream',
      'Foundational understanding of network protocols, cryptography, and web application security'
    ],
    requiredSkills: [
      { name: 'Application Security (OWASP Top 10)', category: 'Core', weight: 0.9 },
      { name: 'Cloud & Network Security Controls', category: 'Cloud', weight: 0.8 },
      { name: 'Vulnerability Scanning & Triaging', category: 'Core', weight: 0.8 },
      { name: 'Python Security Scripting', category: 'Language', weight: 0.7 }
    ],
    competencies: ['security', 'python', 'aws', 'docker'],
    reqLevel: {
      security: 'strong',
      python: 'proficient',
      aws: 'working',
      docker: 'working'
    },
    uncoveredSkills: ['vulnerability assessment', 'penetration testing', 'OWASP Top 10', 'cryptography'],
    competencyFit: 'approximate'
  },

  'quant-developer': {
    familyKey: 'quant-developer',
    title: 'Quantitative Software Developer',
    level: 'L1 / Associate Quantitative Developer',
    track: 'Quantitative Technology',
    desc: 'Develops ultra low-latency algorithmic trading systems, real-time market data parsers, and high-throughput order routers.',
    aboutRole: 'Builds mission-critical, nanosecond-sensitive financial software systems that interface directly with electronic exchanges.',
    responsibilities: [
      'Design and optimize low-latency trading software in modern modern C++ and Python',
      'Implement ultra-fast binary market data protocol decoders and order entry gateways',
      'Optimize Linux kernel network stack interactions, cache locality, and memory allocations',
      'Develop real-time risk checks and automated fail-safe circuit breaker controls',
      'Build backtesting simulation harnesses to replay exchange order books with high fidelity',
      'Diagnose rare latency jitter spikes through CPU performance counters and hardware logs'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Computer Science, Electrical Engineering, or allied field',
      'Exceptional algorithmic problem-solving ability and deep knowledge of systems programming'
    ],
    requiredSkills: [
      { name: 'Modern C++ (17/20) & Systems Programming', category: 'Language', weight: 1.0 },
      { name: 'Algorithmic Data Structures & Concurrency', category: 'Core', weight: 1.0 },
      { name: 'Low-Latency Optimization & CPU Caching', category: 'Architecture', weight: 0.9 },
      { name: 'Python for Scripting and Tooling', category: 'Language', weight: 0.7 }
    ],
    competencies: ['dsa', 'systemdesign', 'python'],
    reqLevel: {
      dsa: 'strong',
      systemdesign: 'strong',
      python: 'proficient'
    },
    uncoveredSkills: ['C/C++', 'low-latency', 'multithreading', 'memory optimization', 'market data'],
    competencyFit: 'approximate'
  },

  'quant-researcher': {
    familyKey: 'quant-researcher',
    title: 'Quantitative Research Associate',
    level: 'L1 / Quantitative Research Analyst',
    track: 'Quantitative Research',
    desc: 'Researches mathematical models, statistical signals, and automated trading strategies using massive tick-level market datasets.',
    aboutRole: 'Applies rigorous statistical modeling and computational analysis to formulate, backtest, and validate systematic investment strategies.',
    responsibilities: [
      'Analyze terabyte-scale market tick and order book datasets to discover alpha signals',
      'Formulate and backtest statistical arbitrage and market-making strategies in Python',
      'Develop robust risk and portfolio optimization models to control drawdown characteristics',
      'Validate hypotheses with statistical rigor, preventing overfitting and lookahead bias',
      'Implement high-throughput data processing workflows to ingest alternative data feeds',
      'Present quantitative findings and backtest performance summaries to research directors'
    ],
    requiredQualifications: [
      'Bachelor, Master, or Doctorate in Mathematics, Statistics, Physics, Computer Science, or Quantitative Finance',
      'Demonstrated excellence in mathematical modeling, stochastic processes, and linear algebra'
    ],
    requiredSkills: [
      { name: 'Advanced Mathematics & Statistics', category: 'Core', weight: 1.0 },
      { name: 'Python for Data Science (NumPy, SciPy)', category: 'Language', weight: 1.0 },
      { name: 'Time-Series Analysis & Alpha Generation', category: 'Core', weight: 0.9 },
      { name: 'Machine Learning for Finance', category: 'Core', weight: 0.7 }
    ],
    competencies: ['python', 'ml', 'dsa'],
    reqLevel: {
      python: 'strong',
      ml: 'strong',
      dsa: 'proficient'
    },
    uncoveredSkills: ['statistical arbitrage', 'quantitative finance', 'time series analysis', 'stochastic calculus'],
    competencyFit: 'approximate'
  },

  'systems-software-engineer': {
    familyKey: 'systems-software-engineer',
    title: 'Systems & Storage Software Engineer',
    level: 'L1 / Associate',
    track: 'Systems Software',
    desc: 'Develops distributed file systems, high-speed storage drivers, and low-level operating system components.',
    aboutRole: 'Builds core systems software managing memory, persistent storage media, file protocols, and network I/O subsystems.',
    responsibilities: [
      'Implement high-performance systems software managing storage and memory resources',
      'Develop multi-threaded user-space and kernel-level device interaction modules',
      'Design lock-free data structures and optimize concurrent thread synchronization',
      'Execute hardware-in-the-loop validation for PCIe, NVMe, and network fabric devices',
      'Profile execution bottlenecks, lock contention, and cache misses using system profilers',
      'Maintain rigorous unit, stress, and fault-injection test suites'
    ],
    requiredQualifications: [
      'Bachelor or Master degree in Computer Science, Computer Engineering, or allied stream',
      'Strong command of operating system internals, memory management, and file system concepts'
    ],
    requiredSkills: [
      { name: 'C / C++ Systems Programming', category: 'Language', weight: 1.0 },
      { name: 'OS Internals & Multi-threading', category: 'Architecture', weight: 0.9 },
      { name: 'Storage / Networking Protocols', category: 'Hardware', weight: 0.8 }
    ],
    competencies: ['dsa', 'systemdesign', 'testing'],
    reqLevel: {
      dsa: 'strong',
      systemdesign: 'proficient',
      testing: 'proficient'
    },
    uncoveredSkills: ['C/C++', 'Linux kernel', 'distributed storage', 'NVMe / PCIe'],
    competencyFit: 'approximate'
  },

  'solutions-engineer': {
    familyKey: 'solutions-engineer',
    title: 'Technical Solutions Engineer',
    level: 'L1 / Associate',
    track: 'Solutions & Consulting',
    desc: 'Designs integration architectures, technical proof-of-concepts, and customer implementations for enterprise platforms.',
    aboutRole: 'Partners with enterprise clients and product teams to design, integrate, and deploy tailored technical solutions.',
    responsibilities: [
      'Design technical integration specifications connecting enterprise software with client APIs',
      'Develop customized integration adapters and data connectors using REST and Python',
      'Provide technical guidance during client architectural reviews and implementation pilots',
      'Troubleshoot network, authentication, and payload configuration errors in deployment',
      'Author technical integration guides, architectural diagrams, and sample code repositories',
      'Synthesize customer feature requests and feedback to technical product managers'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Technology, or engineering discipline',
      'Strong communication skills combined with practical software integration knowledge'
    ],
    requiredSkills: [
      { name: 'API Integrations & Webhooks', category: 'Architecture', weight: 0.9 },
      { name: 'Python or JavaScript Scripting', category: 'Language', weight: 0.8 },
      { name: 'SQL Querying & Data Mapping', category: 'Database', weight: 0.8 },
      { name: 'Technical Troubleshooting & Communication', category: 'Core', weight: 0.8 }
    ],
    competencies: ['rest', 'sql', 'python', 'testing'],
    reqLevel: {
      rest: 'strong',
      sql: 'proficient',
      python: 'proficient',
      testing: 'working'
    },
    uncoveredSkills: ['enterprise integrations', 'technical architecture consulting'],
    competencyFit: 'approximate'
  },

  'hardware-engineer': {
    familyKey: 'hardware-engineer',
    title: 'Electronic Hardware Design Engineer',
    level: 'L1 / Graduate Engineer Trainee',
    track: 'Hardware & Systems',
    desc: 'Designs printed circuit board schematics, selects component architectures, and validates physical electronics hardware.',
    aboutRole: 'Develops electronic board designs from schematic capture through PCB layout, component selection, and laboratory bringup.',
    responsibilities: [
      'Design electronic schematics for microcontroller and power management circuits',
      'Supervise PCB layout for signal integrity, thermal dissipation, and EMI compliance',
      'Select active and passive electronic components considering availability and cost',
      'Conduct laboratory board bringup using digital multimeters, oscilloscopes, and power supplies',
      'Execute design verification testing and document environmental qualification records',
      'Collaborate with firmware teams to validate hardware peripheral interfaces'
    ],
    requiredQualifications: [
      'Bachelor degree in Electrical Engineering, Electronics and Communication, or allied stream',
      'Strong grasp of analog and digital circuit theory, PCB design tools, and component selection'
    ],
    requiredSkills: [
      { name: 'Schematic Capture & PCB Layout', category: 'Hardware', weight: 1.0 },
      { name: 'Analog & Digital Circuit Design', category: 'Hardware', weight: 0.9 },
      { name: 'Laboratory Instrumentation & Bringup', category: 'Hardware', weight: 0.8 }
    ],
    competencies: ['testing'],
    reqLevel: {
      testing: 'working'
    },
    uncoveredSkills: ['PCB design', 'schematic capture', 'board bringup', 'signal integrity', 'semiconductor'],
    competencyFit: 'approximate'
  },

  'software-engineer': {
    familyKey: 'software-engineer',
    title: 'Software Development Engineer',
    level: 'L1 / Associate SDE',
    track: 'Software Engineering',
    desc: 'Develops maintainable application code, designs relational schemas, and implements reliable business logic across product services.',
    aboutRole: 'General software development engineer role focusing on clean software design, algorithmic problem solving, and service reliability.',
    responsibilities: [
      'Develop, test, and maintain software features across backend and web service components',
      'Write modular, well-documented code adhering to team engineering standards and patterns',
      'Design efficient database queries and optimize data retrieval for low latency',
      'Implement unit and regression test suites to guarantee code stability in continuous delivery',
      'Collaborate with cross-functional product, QA, and platform engineering peers',
      'Participate actively in code reviews and root-cause analysis of production issues'
    ],
    requiredQualifications: [
      'Bachelor degree in Computer Science, Information Technology, or allied STEM stream',
      'Strong grasp of data structures, algorithms, and core object-oriented programming'
    ],
    requiredSkills: [
      { name: 'Core Java or Python or C++', category: 'Language', weight: 0.9 },
      { name: 'Data Structures & Algorithms', category: 'Core', weight: 0.9 },
      { name: 'SQL & Database Fundamentals', category: 'Database', weight: 0.8 },
      { name: 'REST APIs & Web Services', category: 'Architecture', weight: 0.7 }
    ],
    competencies: ['dsa', 'java', 'sql', 'rest', 'testing'],
    reqLevel: {
      dsa: 'strong',
      java: 'proficient',
      sql: 'proficient',
      rest: 'proficient',
      testing: 'working'
    },
    uncoveredSkills: [],
    competencyFit: 'good'
  },

  'core-software-engineer': {
    familyKey: 'core-software-engineer',
    title: 'Graduate Software Engineer (Trainee)',
    level: 'Entry Level / Trainee',
    track: 'Software Engineering',
    desc: 'Foundational entry-level engineering role focusing on algorithmic development, software testing, and core computing fundamentals.',
    aboutRole: 'Entry-level graduate program providing foundational development experience across software engineering workflows and best practices.',
    responsibilities: [
      'Participate in structured technology training on programming languages, databases, and tools',
      'Implement assigned software modules under the guidance of senior technical mentors',
      'Write and execute unit test cases to validate feature requirements',
      'Review technical design documents and understand system architecture conventions',
      'Debug application issues in test environments and document bug resolution steps',
      'Contribute to internal developer documentation and operational runbooks'
    ],
    requiredQualifications: [
      'Bachelor of Engineering / Bachelor of Technology / MCA degree in CS, IT, or allied stream',
      'Strong academic record and solid understanding of computer science core subjects'
    ],
    requiredSkills: [
      { name: 'Problem Solving & Algorithms', category: 'Core', weight: 0.9 },
      { name: 'Python or Java Programming', category: 'Language', weight: 0.8 },
      { name: 'Basic SQL & Relational Databases', category: 'Database', weight: 0.7 },
      { name: 'Software Testing Basics', category: 'Core', weight: 0.6 }
    ],
    competencies: ['dsa', 'python', 'sql', 'testing'],
    reqLevel: {
      dsa: 'proficient',
      python: 'proficient',
      sql: 'working',
      testing: 'working'
    },
    uncoveredSkills: [],
    competencyFit: 'good'
  }
};
