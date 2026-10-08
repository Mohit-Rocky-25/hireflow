import { GoldenTestCase } from './golden-resumes.test';

export const NEW_GOLDEN_PAIRS: GoldenTestCase[] = [
  // 33. Ambiguous Swift iOS
  {
    id: 'ambiguous_swift_ios_33',
    domain: 'Mobile Engineering',
    role: 'iOS Application Developer',
    resumeText: `Priya Sharma | priya@example.com | iOS Engineer
SUMMARY: iOS software engineer with experience developing consumer mobile apps in Swift and SwiftUI.
EXPERIENCE:
Mobile Developer | Appify Studios | 2023 - Present
- Architected native iOS features using Swift and SwiftUI, serving 120k daily active users.
- Integrated Apple Core Data and URLSession for background networking.
SKILLS:
Swift, SwiftUI, Objective-C, Xcode, Git, iOS SDK`,
    jdText: `iOS Developer
Requirements:
- Strong experience with Swift and iOS SDK
- Experience with Flutter and Kotlin is preferred`,
    expectedPresent: ['swift'],
    expectedMissing: ['flutter', 'kotlin'],
  },

  // 34. Ambiguous Rust Systems
  {
    id: 'ambiguous_rust_systems_34',
    domain: 'Systems Engineering',
    role: 'Systems Programmer',
    resumeText: `Karan Patel | karan@example.com | Systems Developer
SUMMARY: Systems programmer building memory-safe infrastructure services in Rust and C++.
EXPERIENCE:
Systems Engineer | CoreByte | 2022 - Present
- Engineered high-throughput networking proxy in Rust with zero memory allocations in hot path.
- Developed low-latency IPC queues in C++ achieving sub-millisecond latencies.
SKILLS:
Rust, C++, Linux, Concurrency, Git`,
    jdText: `Systems Engineer
Requirements:
- Strong experience with Rust and C++
- Nice to have: Go and Kubernetes`,
    expectedPresent: ['rust', 'cpp'],
    expectedMissing: ['go', 'kubernetes'],
  },

  // 35. Ambiguous Spark Big Data
  {
    id: 'ambiguous_spark_bigdata_35',
    domain: 'Data Engineering',
    role: 'Big Data Engineer',
    resumeText: `Rohan Gupta | rohan@example.com | Data Engineer
SUMMARY: Data engineer specializing in distributed ETL and petabyte-scale data pipelines.
EXPERIENCE:
Data Engineer | BigQuery Labs | 2023 - Present
- Designed batch processing pipelines using Apache Spark and PySpark processing 4TB daily.
- Optimized Hive SQL queries reducing pipeline execution time by 30%.
SKILLS:
Apache Spark, Python, SQL, Hadoop, Kafka`,
    jdText: `Data Engineer
Requirements:
- Apache Spark and Python experience
- Snowflake and Databricks experience preferred`,
    expectedPresent: ['apache_spark', 'python', 'sql'],
    expectedMissing: ['snowflake', 'databricks'],
  },

  // 36. Ambiguous Flask API
  {
    id: 'ambiguous_flask_api_36',
    domain: 'Backend Engineering',
    role: 'Python Backend Developer',
    resumeText: `Ananya Roy | ananya@example.com | Python Developer
SUMMARY: Backend developer building REST microservices using Python and Flask.
EXPERIENCE:
Python Developer | WebFlow | 2023 - Present
- Developed modular REST APIs in Flask with PostgreSQL database backends.
- Integrated JWT authentication and Redis caching for rate limiting.
SKILLS:
Flask, Python, PostgreSQL, Redis, Docker`,
    jdText: `Python Developer
Requirements:
- Python and Flask web framework
- FastApi and Celery preferred`,
    expectedPresent: ['flask', 'python', 'postgresql'],
    expectedMissing: ['fastapi', 'celery'],
  },

  // 37. Ambiguous R Data Science
  {
    id: 'ambiguous_r_stats_37',
    domain: 'Data Science',
    role: 'Statistical Analyst',
    resumeText: `Meera Nair | meera@example.com | Statistical Analyst
SUMMARY: Data scientist with expertise in statistical inference and regression modeling.
EXPERIENCE:
Research Analyst | StatCorp | 2022 - Present
- Built econometric forecasting models using R language and tidyverse packages.
- Created interactive dashboards with R Shiny and ggplot2 for leadership reviews.
SKILLS:
R, Python, SQL, Statistics, Excel`,
    jdText: `Statistical Analyst
Requirements:
- Statistical modeling in R and Python
- Tableau experience is preferred`,
    expectedPresent: ['r', 'python', 'sql'],
    expectedMissing: ['tableau'],
  },

  // 38. ECE Embedded & IoT
  {
    id: 'ece_embedded_iot_38',
    domain: 'Embedded Systems',
    role: 'Embedded Firmware Engineer',
    resumeText: `Siddharth Verma | siddharth@example.com | ECE Engineer
SUMMARY: Electronics and Communication engineer with experience in firmware and microcontrollers.
EDUCATION: B.Tech in Electronics and Communication Engineering | 2020 - 2024
EXPERIENCE:
Firmware Intern | IoTronics | 2023 - 2024
- Programmed ARM Cortex microcontrollers using C and FreeRTOS for sensor telemetry.
- Implemented UART, I2C, and SPI peripheral drivers with DMA support.
SKILLS:
C, Embedded Systems, FreeRTOS, Microcontrollers, Git`,
    jdText: `Embedded Software Engineer
Requirements:
- Firmware development in C and RTOS
- Python scripting is a plus
- Rust experience preferred`,
    expectedPresent: ['c', 'embedded_c'],
    expectedMissing: ['rust'],
  },

  // 39. Mechanical Engineering CAD & FEA
  {
    id: 'mechanical_cad_fea_39',
    domain: 'Mechanical Engineering',
    role: 'Mechanical Design Engineer',
    resumeText: `Vikram Joshi | vikram@example.com | Mechanical Engineer
SUMMARY: Mechanical engineer specializing in product design, 3D modeling, and finite element analysis.
EDUCATION: B.Tech in Mechanical Engineering | 2019 - 2023
EXPERIENCE:
Design Engineer | AutoParts Ltd | 2023 - Present
- Created parametric CAD models and assembly drawings in SolidWorks and AutoCAD.
- Performed structural FEA stress simulations in ANSYS optimizing component weight by 15%.
SKILLS:
SolidWorks, AutoCAD, ANSYS, GD&T, Finite Element Analysis`,
    jdText: `Mechanical Engineer
Requirements:
- 3D CAD modeling in SolidWorks and AutoCAD
- Simulation in ANSYS
- Nice to have: Python automation`,
    expectedPresent: ['solidworks', 'autocad'],
    expectedMissing: ['python'],
  },

  // 40. Civil Structural & BIM
  {
    id: 'civil_structural_bim_40',
    domain: 'Civil Engineering',
    role: 'Structural Engineer',
    resumeText: `Rahul Deshmukh | rahul@example.com | Civil Engineer
SUMMARY: Civil structural engineer with expertise in building design and structural drafting.
EDUCATION: B.Tech in Civil Engineering | 2019 - 2023
EXPERIENCE:
Structural Trainee | BuildCon Infrastructure | 2023 - Present
- Modeled multi-story reinforced concrete structures using AutoCAD and Revit.
- Analyzed seismic load distributions using STAAD Pro per IS 1893 standards.
SKILLS:
AutoCAD, Revit, STAAD Pro, Structural Engineering`,
    jdText: `Structural Design Engineer
Requirements:
- Structural drafting using AutoCAD and Revit
- Structural analysis tools
- Nice to have: BIM 360`,
    expectedPresent: ['autocad'],
    expectedMissing: ['bim_360'],
  },

  // 41. Hedged Language Junior
  {
    id: 'hedged_language_junior_41',
    domain: 'Software Engineering',
    role: 'Associate Cloud Engineer',
    resumeText: `Deepak Rao | deepak@example.com | Cloud Associate
SUMMARY: Software enthusiast with basic knowledge of cloud technologies and web development.
EXPERIENCE:
Junior Tech Associate | CloudServe | 2023 - Present
- Familiar with Kubernetes cluster deployment concepts and basic container workflows.
- Exposure to AWS S3 storage buckets and EC2 virtual machines.
- Worked briefly with Docker containers during university capstone project.
SKILLS:
Python, HTML, CSS, Git`,
    jdText: `Cloud Platform Engineer
Requirements:
- Python programming
- Production Kubernetes and AWS experience
- Docker containerization
- Terraform infrastructure automation preferred`,
    expectedPresent: ['python', 'kubernetes', 'aws'],
    expectedMissing: ['terraform'],
  },

  // 42. Strong Action Verbs Senior
  {
    id: 'strong_action_verbs_senior_42',
    domain: 'Software Engineering',
    role: 'Staff Backend Engineer',
    resumeText: `Tarun Singhania | tarun@example.com | Staff Engineer
SUMMARY: Staff engineer with 8 years architecting distributed systems and cloud infrastructure.
EXPERIENCE:
Staff Software Engineer | FinTech Global | 2020 - Present
- Architected event-driven payment processing platform using Go, Kafka, and PostgreSQL.
- Scaled transactions throughput to 25,000 TPS while reducing p99 latency by 55%.
- Optimized database query execution plans, saving $180,000 in monthly AWS cloud spend.
SKILLS:
Go, Kafka, PostgreSQL, AWS, Docker, Kubernetes`,
    jdText: `Staff Backend Engineer
Requirements:
- Go programming and Kafka
- PostgreSQL and AWS
- Cassandra experience is preferred`,
    expectedPresent: ['go', 'kafka', 'postgresql', 'aws'],
    expectedMissing: ['cassandra'],
  },

  // 43. Keyword Stuffed Frontend
  {
    id: 'keyword_stuffed_frontend_43',
    domain: 'Frontend Engineering',
    role: 'Frontend Developer',
    resumeText: `Amit Sen | amit@example.com | Frontend Dev
SUMMARY: Web developer.
EXPERIENCE:
Web Intern | SmallBiz | 2023 - 2024
- Created simple web pages using HTML and CSS.
SKILLS:
React, Angular, Vue, Svelte, Next.js, Nuxt.js, Gatsby, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Bootstrap, Material UI, Redux, MobX, Zustand, Webpack, Vite, Rollup, Jest, Cypress, Playwright, GraphQL, Apollo, REST, WebSockets, Three.js, D3.js`,
    jdText: `Senior React Developer
Requirements:
- Production React and TypeScript experience
- State management with Redux
- Cloud deployment with AWS preferred`,
    expectedPresent: ['react', 'typescript', 'redux'],
    expectedMissing: ['aws'],
  },

  // 44. Keyword Stuffed Data Science
  {
    id: 'keyword_stuffed_data_44',
    domain: 'Data Science',
    role: 'Junior ML Engineer',
    resumeText: `Neha Kulkarni | neha@example.com | Data Enthusiast
SUMMARY: Aspiring AI researcher.
PROJECTS:
Academic Project:
- Trained linear regression model on student grades dataset using Python.
SKILLS:
Python, PyTorch, TensorFlow, Keras, Scikit-learn, XGBoost, LightGBM, HuggingFace, Transformers, BERT, GPT, LangChain, LlamaIndex, Pandas, NumPy, OpenCV, NLTK, Spacy, MLflow, Airflow, Kubeflow, Ray, Triton, CUDA, TensorRT, Spark, Hadoop`,
    jdText: `Machine Learning Engineer
Requirements:
- Machine learning modeling in Python and PyTorch
- Model deployment with MLflow
- Deep knowledge of Transformers`,
    expectedPresent: ['python', 'pytorch'],
    expectedMissing: ['mlflow'],
  },

  // 45. Two Column Template Extraction
  {
    id: 'two_column_template_45',
    domain: 'Software Engineering',
    role: 'Full Stack Engineer',
    resumeText: `John Doe | Contact: john@example.com | Phone: 555-0199 | GitHub: github.com/johndoe
COLUMN 1:
Skills: React, Node.js, TypeScript, PostgreSQL, Docker
Education: B.S. in Computer Science | 2020 - 2024 | CGPA: 8.9/10
COLUMN 2:
Experience:
Fullstack Developer | NextGen Apps | 2023 - 2024
- Built customer portal in React and Node.js serving 40k active users.
- Designed relational schemas in PostgreSQL with automated migrations.`,
    jdText: `Full Stack Developer
Requirements:
- React and TypeScript frontend
- Node.js and PostgreSQL backend
- AWS preferred`,
    expectedPresent: ['react', 'node_js', 'typescript', 'postgresql'],
    expectedMissing: ['aws'],
  },

  // 46. Fresher No Experience Strong Projects
  {
    id: 'fresher_no_experience_46',
    domain: 'Software Engineering',
    role: 'Associate Software Engineer',
    resumeText: `Aman Mathur | aman@example.com | Fresher SDE
SUMMARY: Computer Science undergraduate with competitive programming and fullstack project track record.
EDUCATION: B.Tech in Computer Science | Tier 1 College | 2020 - 2024 | CGPA: 8.8
PROJECTS:
Open Source Distributed Cache | github.com/aman/dist-cache
- Engineered distributed in-memory cache in Go with consistent hashing and LRU eviction.
- Achieved 85,000 ops/second benchmarked with automated Go test suite.
Collaborative Code Editor | github.com/aman/collab-code
- Built real-time collaborative text editor using React, TypeScript, and WebSockets.
SKILLS:
Go, TypeScript, React, PostgreSQL, Docker, Git, Algorithms`,
    jdText: `Associate Software Engineer
Requirements:
- Strong problem solving and programming skills in Go or TypeScript
- Web application fundamentals (React / WebSockets)
- Docker familiarity is preferred`,
    expectedPresent: ['go', 'typescript', 'react', 'docker'],
    expectedMissing: ['kubernetes'],
  },

  // 47. Fresher ECE to Software
  {
    id: 'fresher_ece_to_software_47',
    domain: 'Software Engineering',
    role: 'Graduate Software Engineer',
    resumeText: `Shruti Saxena | shruti@example.com | Bengaluru
SUMMARY: Electronics engineering graduate with strong self-taught software foundation in C++ and Data Structures.
EDUCATION: B.Tech in Electronics and Communication | 2020 - 2024 | CGPA: 8.4
PROJECTS:
Pathfinding Visualizer | github.com/shruti/path-viz
- Implemented Dijkstra and A* algorithms in C++ with interactive Qt interface.
E-Commerce API | github.com/shruti/shop-api
- Developed REST backend using Node.js and MongoDB with user authentication.
SKILLS:
C++, Data Structures, Node.js, MongoDB, Git`,
    jdText: `Graduate Software Trainee
Requirements:
- Strong fundamentals in C++ and Data Structures
- Relational database experience (MySQL / PostgreSQL)
- Java is a plus`,
    expectedPresent: ['cpp'],
    expectedMissing: ['mysql', 'java'],
  },

  // 48. DevOps Cloud Infrastructure
  {
    id: 'devops_cloud_infra_48',
    domain: 'DevOps / Cloud',
    role: 'Senior Cloud Engineer',
    resumeText: `Manish Tiwari | manish@example.com | Cloud Architect
SUMMARY: Cloud engineer with 6 years experience automating AWS environments with Terraform and Kubernetes.
EXPERIENCE:
Senior Cloud Engineer | CloudScale Inc | 2021 - Present
- Provisioned multi-region AWS infrastructure using Terraform IaC modules.
- Managed production Kubernetes (EKS) clusters with ArgoCD GitOps pipelines.
- Implemented observability stack with Prometheus and Grafana alerts.
SKILLS:
Terraform, Kubernetes, AWS, Docker, Prometheus, Grafana, CI/CD, Git`,
    jdText: `Senior DevOps Engineer
Requirements:
- Terraform and Kubernetes production experience
- AWS cloud infrastructure
- Ansible experience preferred`,
    expectedPresent: ['terraform', 'kubernetes', 'aws'],
    expectedMissing: ['ansible'],
  },

  // 49. AI/ML NLP Engineer
  {
    id: 'ai_ml_nlp_engineer_49',
    domain: 'AI / Machine Learning',
    role: 'NLP Research Engineer',
    resumeText: `Dr. Sunita Rao | sunita@example.com | AI Researcher
SUMMARY: NLP engineer specializing in fine-tuning Transformer language models and retrieval systems.
EXPERIENCE:
ML Engineer | AI Innovations | 2022 - Present
- Fine-tuned open-source LLMs using PyTorch and HuggingFace transformers for summarization.
- Built semantic search pipeline using vector embeddings and Faiss index.
SKILLS:
PyTorch, Transformers, Python, NLP, Machine Learning, Docker`,
    jdText: `NLP Machine Learning Engineer
Requirements:
- Python and PyTorch deep learning
- Experience with Transformers and NLP
- C++ deployment experience preferred`,
    expectedPresent: ['pytorch', 'python'],
    expectedMissing: ['cpp'],
  },

  // 50. Cybersecurity Analyst
  {
    id: 'cybersecurity_analyst_50',
    domain: 'Cybersecurity',
    role: 'Information Security Analyst',
    resumeText: `Aditya Nair | aditya@example.com | Security Analyst
SUMMARY: Security analyst with expertise in threat hunting, SOC operations, and vulnerability assessments.
EXPERIENCE:
Security Analyst | CyberDefend | 2022 - Present
- Analyzed network security telemetry using Wireshark and Splunk SIEM dashboards.
- Performed weekly vulnerability scans and guided engineering teams on OWASP remediations.
SKILLS:
Wireshark, Splunk, Linux, Network Security, Python`,
    jdText: `Cybersecurity Analyst
Requirements:
- Network analysis with Wireshark
- SIEM monitoring (Splunk / Elastic)
- Penetration testing certification (CEH/OSCP) preferred`,
    expectedPresent: ['security_tools'],
    expectedMissing: ['penetration_testing'],
  },

  // 51. QA Automation Engineer
  {
    id: 'qa_automation_engineer_51',
    domain: 'Quality Assurance',
    role: 'SDET Automation Engineer',
    resumeText: `Kavita Reddy | kavita@example.com | SDET
SUMMARY: QA automation engineer with 4 years creating end-to-end testing frameworks.
EXPERIENCE:
SDET | TestMatrix | 2021 - Present
- Built automated web UI test suites using Selenium WebDriver and TypeScript.
- Integrated automated API regression tests in GitHub Actions CI/CD pipeline.
SKILLS:
Selenium, TypeScript, Java, Jest, CI/CD, Git`,
    jdText: `Automation QA Engineer
Requirements:
- Selenium WebDriver and TypeScript/Java
- API test automation
- Playwright experience preferred`,
    expectedPresent: ['selenium', 'typescript'],
    expectedMissing: ['playwright'],
  },

  // 52. Data Analyst & Business Intelligence
  {
    id: 'data_analyst_bi_52',
    domain: 'Data Analytics',
    role: 'Senior Business Intelligence Analyst',
    resumeText: `Pooja Bansal | pooja@example.com | BI Analyst
SUMMARY: Data analyst with 5 years creating executive KPI dashboards and SQL data models.
EXPERIENCE:
BI Analyst | RetailAnalytics | 2021 - Present
- Wrote complex SQL queries and window functions modeling sales transaction datasets.
- Developed interactive Power BI dashboards tracking quarterly revenue and customer retention.
SKILLS:
SQL, Power BI, Excel, Tableau, Python, Data Analysis`,
    jdText: `Business Intelligence Analyst
Requirements:
- Advanced SQL querying
- Power BI or Tableau dashboarding
- Snowflake experience preferred`,
    expectedPresent: ['sql', 'bi_visualization'],
    expectedMissing: ['snowflake'],
  },
];
