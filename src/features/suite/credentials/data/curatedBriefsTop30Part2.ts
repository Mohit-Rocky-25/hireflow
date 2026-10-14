// ============================================================
// Credential & Opportunity Engine — In-Depth Briefs for Top 30 (Part 2: Records 11 to 30)
// Complete Schema 2.0 Rich Details
// ============================================================

import { OpportunityRecord } from '../types';

export const CURATED_TOP_30_PART_2: Record<string, Partial<OpportunityRecord>> = {
  // 11. AWS Certified Data Engineer – Associate (DEA-C01)
  'opp-aws-dea': {
    trust: 'verified_official',
    flags: ['best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 150,
      inr_official: 13020,
      priceConfidence: 'verified',
      note: '$150 USD (~₹13,020 INR). 50% discount voucher available via prior AWS exams.',
    },
    studentAid: {
      available: true,
      summary: '50% voucher accessible through AWS Certification portal benefits from prior exams.',
      steps: ['Apply 50% benefit code during Pearson VUE checkout.'],
    },
    windows: [{ label: 'Year-Round Testing', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'AWS Certified Data Engineer – Associate (DEA-C01) validates expertise in core data-related AWS services, data ingestion, pipeline transformation, security governance, and data lake architectures (Glue, Athena, Redshift, EMR, Kinesis).',
      what_it_covers: [
        'Data Ingestion and Transformation: AWS Glue ETL jobs, AWS Lambda, Amazon EMR Spark processing, Amazon Kinesis streams',
        'Data Store Management: Amazon S3 data lakes, Amazon Redshift data warehouses, DynamoDB, OpenSearch',
        'Data Operations and Support: Pipeline orchestration with AWS Step Functions and Amazon MWAA (Managed Airflow)',
        'Data Security and Governance: AWS Lake Formation fine-grained permissions, KMS encryption, IAM policies',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE center',
        style: '65 Multiple-choice / scenario questions in 130 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard Exam Fee', usd: 150, inr: 13020 }],
      validity_renewal: 'Valid for 3 years.',
      prerequisites: 'Hands-on familiarity with SQL, Python/PySpark, and distributed data concepts.',
      eligibility: 'Open globally.',
      how_to_apply: ['Register via Pearson VUE AWS certification portal.'],
      timeline: [{ label: 'Continuous', status: 'open', date: 'Year-round' }],
      resume_evidence: {
        attach: ['Credly verification link', 'GitHub PySpark Glue ETL pipeline repository'],
        line_template: 'AWS Certified Data Engineer – Associate (DEA-C01) | Built serverless data lake pipelines on AWS using Glue, Athena, and Step Functions, automating Parquet compaction and Lake Formation security.',
      },
      pitfalls: ['Overlooking AWS Glue catalog crawlers, partitions, and schema evolution settings.'],
      sources: [
        {
          title: 'AWS Certified Data Engineer Associate Exam Guide',
          url: 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_guide', 'pricing'],
        },
      ],
    },
  },

  // 12. AWS Certified Machine Learning Engineer – Associate (MLA-C01)
  'opp-aws-mla': {
    trust: 'verified_official',
    flags: ['best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 150,
      inr_official: 13020,
      priceConfidence: 'verified',
      note: '$150 USD (~₹13,020 INR). Launched in 2024 to validate hands-on MLOps and SageMaker pipelines.',
    },
    studentAid: {
      available: true,
      summary: '50% discount voucher applicable from prior AWS credentials.',
      steps: ['Apply promo code at Pearson VUE checkout.'],
    },
    windows: [{ label: 'Year-Round Available', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'AWS Certified Machine Learning Engineer – Associate (MLA-C01) validates ability to scale, deploy, monitor, and optimize ML models in production environments using Amazon SageMaker and AWS AI services.',
      what_it_covers: [
        'Data Preparation for ML: Feature engineering, SageMaker Data Wrangler, Feature Store',
        'Model Development: Selecting foundation models from SageMaker JumpStart, fine-tuning, training jobs',
        'Model Deployment and Orchestration: Real-time and serverless endpoints, SageMaker Pipelines, multi-model endpoints',
        'MLOps and Monitoring: SageMaker Model Monitor, drift detection, Clarify for bias, cost optimization',
      ],
      format: {
        delivery: 'Online proctored or test center',
        style: '65 Questions in 130 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard Exam Fee', usd: 150, inr: 13020 }],
      validity_renewal: 'Valid for 3 years.',
      prerequisites: 'Knowledge of ML frameworks (PyTorch, Scikit-Learn) and cloud deployment fundamentals.',
      eligibility: 'Open globally.',
      how_to_apply: ['Schedule via AWS certification dashboard.'],
      timeline: [{ label: 'On-demand', status: 'open', date: 'Year-round' }],
      resume_evidence: {
        attach: ['Credly Digital Credential', 'SageMaker MLOps CI/CD pipeline repository'],
        line_template: 'AWS Certified Machine Learning Engineer – Associate (MLA-C01) | Deployed end-to-end MLOps pipelines using Amazon SageMaker, automating model retraining, endpoint autoscaling, and drift monitoring.',
      },
      pitfalls: ['Confusing real-time endpoint deployment vs asynchronous/batch transform inference.'],
      sources: [
        {
          title: 'AWS Certified Machine Learning Engineer Associate Page',
          url: 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_domains', 'pricing'],
        },
      ],
    },
  },

  // 13. Google Cloud Professional Machine Learning Engineer (GCP PMLE)
  'opp-gcp-pmle': {
    trust: 'verified_official',
    flags: ['hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 200,
      inr_official: 17360,
      priceConfidence: 'verified',
      note: '$200 USD (~₹17,360 INR). Advanced professional credential for senior AI/ML roles.',
    },
    studentAid: {
      available: false,
      summary: 'Academic vouchers occasionally distributed in Google Cloud Faculty programs.',
      steps: ['Consult college department for Google Cloud Faculty research sponsorship.'],
    },
    windows: [{ label: 'Continuous Webassessor', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Google Cloud Professional Machine Learning Engineer certifies technical competence in designing, building, and productionizing ML models to solve business challenges using Google Cloud technologies (Vertex AI, BigQuery ML, Kubeflow).',
      what_it_covers: [
        'Architecting ML Solutions: Selecting appropriate Vertex AI infrastructure, TPU vs GPU trade-offs',
        'Data Preparation and Feature Engineering: Vertex AI Feature Store, Dataflow for preprocessing',
        'Model Training and Tuning: Custom training jobs, distributed training, Vertex Hyperparameter Tuning',
        'ML Pipeline Orchestration and Monitoring: Kubeflow Pipelines on Vertex AI, Model Registry, Explainable AI',
      ],
      format: {
        delivery: 'Online proctored or test center',
        style: '50-60 Questions in 120 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Standard Exam Fee', usd: 200, inr: 17360 }],
      validity_renewal: 'Valid for 2 years.',
      prerequisites: 'Strong machine learning theory and 1+ years experience deploying production models.',
      eligibility: 'Open globally.',
      how_to_apply: ['Book on Kryterion Webassessor.'],
      timeline: [{ label: 'Year-Round', status: 'open', date: 'Continuous' }],
      resume_evidence: {
        attach: ['Official GCP Certificate Link', 'Vertex AI pipeline demo repo with automated CI/CD'],
        line_template: 'Google Cloud Professional Machine Learning Engineer | Built production Vertex AI pipelines with automated hyperparameter tuning and model monitoring for [X] real-time inference requests/sec.',
      },
      pitfalls: ['Ignoring BigQuery ML capabilities for standard tabular predictive analytics.'],
      sources: [
        {
          title: 'Google Cloud Professional Machine Learning Engineer Guide',
          url: 'https://cloud.google.com/learn/certification/machine-learning-engineer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_guide', 'pricing'],
        },
      ],
    },
  },

  // 14. Google Cybersecurity Certificate
  'opp-google-cyber': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: 'Coursera subscription ($49/month or ₹3,600/quarter in India). 100% Free with Coursera Financial Aid.',
    },
    studentAid: {
      available: true,
      summary: '100% Free via Coursera Financial Aid approved within 14 days for Indian students.',
      steps: [
        'Click "Financial Aid Available" on the Coursera course page.',
        'Submit a genuine educational motivation statement (150 words).',
        'Receive 100% tuition waiver granting full graded assignment access and verifiable certificate.',
      ],
    },
    windows: [{ label: 'Self-Paced / Start Immediately', status: 'open', date: 'Anytime' }],
    richDetails: {
      overview: 'The Google Cybersecurity Professional Certificate prepares learners for entry-level cybersecurity analyst jobs. Covers Linux command-line, Python for security automation, SIEM tools (Splunk, Chronicle), and packet inspection with Wireshark.',
      what_it_covers: [
        'Foundations of Cybersecurity: Ethics, frameworks (NIST, CIS), security domains',
        'Managing Security Risks: Threat landscapes, vulnerability assessments, defense-in-depth',
        'Networks and Network Security: TCP/IP, DNS, VPNs, Wireshark packet capture, IDS/IPS',
        'Linux and SQL for Cybersecurity: Bash permissions, grep, piping, database querying for anomalies',
        'Assets, Threats, and Vulnerabilities: Cryptography, authentication, hashing, attack vectors',
        'Detection and Response: SIEM log analysis in Splunk, Chronicle, and incident response playbooks',
      ],
      format: {
        delivery: 'Online self-paced on Coursera',
        style: '8 Modules with hands-on lab environments and graded quizzes',
        attempts_included: 'Unlimited retries',
      },
      cost_breakdown: [
        { item: 'Coursera Monthly Subscription', inr: 3600, usd: 49 },
        { item: 'With Approved Coursera Financial Aid', inr: 0, usd: 0 },
      ],
      validity_renewal: 'Lifetime credential credential with dual digital badges from Google and Credly.',
      prerequisites: 'No prior experience required.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera and apply for Financial Aid if required.'],
      timeline: [{ label: 'Continuous', status: 'open', date: 'Immediate start' }],
      resume_evidence: {
        attach: ['Credly Digital Badge', 'GitHub repository containing security incident response reports and Python security scripts'],
        line_template: 'Google Cybersecurity Professional Certificate | Conducted vulnerability audits, packet analysis using Wireshark, and automated SIEM log inspection in Splunk and Python.',
      },
      pitfalls: ['Rushing through video lectures without completing the interactive Qwiklabs/Simulated labs.'],
      sources: [
        {
          title: 'Google Cybersecurity Certificate on Coursera',
          url: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['curriculum', 'financial_aid'],
        },
      ],
    },
  },

  // 15. Meta Front-End Developer Professional Certificate
  'opp-meta-fe': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: 'Coursera course. 100% Free with Coursera Financial Aid application for students in India.',
    },
    studentAid: {
      available: true,
      summary: '100% Free for students via Coursera Financial Aid application.',
      steps: ['Apply for Financial Aid on Coursera; application approved in 14 days.'],
    },
    windows: [{ label: 'Self-Paced / Immediate Access', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Created by Meta engineering staff, this 9-course program teaches foundational and advanced front-end development using HTML5, modern CSS, JavaScript (ES6+), React.js, and Jest unit testing.',
      what_it_covers: [
        'Web development fundamentals: Responsive design with Flexbox, CSS Grid, semantic HTML',
        'JavaScript mastery: Asynchronous fetch, closures, DOM manipulation, ES6 modules',
        'React.js deep-dive: Hooks (useState, useEffect, useContext), state management, React Router',
        'Version control with Git/GitHub, package management with npm, and CI test pipelines with Jest',
        'Capstone: Building a complete React restaurant reservation web application',
      ],
      format: {
        delivery: 'Online self-paced video and browser coding sandboxes',
        style: '9 Graded courses with peer-reviewed capstone project',
        attempts_included: 'Unlimited',
      },
      cost_breakdown: [{ item: 'With Coursera Financial Aid', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime certificate verifiable on Credly and Coursera.',
      prerequisites: 'Basic computer literacy.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera and complete coursework.'],
      timeline: [{ label: 'Anytime', status: 'open', date: 'Flexible' }],
      resume_evidence: {
        attach: ['Credly Meta Certificate URL', 'Deployed React Capstone Project URL (Vercel / GitHub Pages)'],
        line_template: 'Meta Front-End Developer Certified | Built responsive single-page web applications with React.js, Tailwind CSS, and Jest test coverage, integrating RESTful API endpoints.',
      },
      pitfalls: ['Skipping unit tests in Jest during the capstone phase.'],
      sources: [
        {
          title: 'Meta Front-End Developer Certificate',
          url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['modules', 'pricing'],
        },
      ],
    },
  },

  // 16. Meta Back-End Developer Professional Certificate
  'opp-meta-be': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: '100% Free with Coursera Financial Aid. Taught by Meta engineers.',
    },
    studentAid: {
      available: true,
      summary: '100% Free with Coursera Financial Aid.',
      steps: ['Submit Coursera Financial Aid form.'],
    },
    windows: [{ label: 'Self-Paced', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Developed by Meta engineers, this 9-course program equips students with backend engineering fundamentals: Python programming, Django REST framework, MySQL databases, authentication, and Docker containerization.',
      what_it_covers: [
        'Python Programming: Data structures, OOP, file handling, unit testing with PyTest',
        'Database Engineering: MySQL relational schemas, normalization, complex joins, indexing',
        'Django Web Framework: Models, Views, Templates, and Django ORM',
        'APIs with Django REST Framework (DRF): Serializers, Token/JWT Authentication, throttling, pagination',
        'Deployment and DevOps basics: Containerizing services with Docker and deploying to cloud hosts',
      ],
      format: {
        delivery: 'Online self-paced on Coursera',
        style: '9 Courses with hands-on coding labs and backend API capstone',
        attempts_included: 'Unlimited',
      },
      cost_breakdown: [{ item: 'With Financial Aid', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime credential.',
      prerequisites: 'Basic programming curiosity.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera with Financial Aid.'],
      timeline: [{ label: 'Immediate', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['Credly Meta Backend Badge', 'GitHub repo for Django REST API with Postman test collection'],
        line_template: 'Meta Back-End Developer Certified | Developed secure RESTful microservices with Python, Django REST Framework, and MySQL, implementing JWT auth, pagination, and Docker containers.',
      },
      pitfalls: ['Neglecting database indexing and SQL query optimization in Django ORM.'],
      sources: [
        {
          title: 'Meta Back-End Developer Professional Certificate',
          url: 'https://www.coursera.org/professional-certificates/meta-back-end-developer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'verification'],
        },
      ],
    },
  },

  // 17. IBM Full-Stack Software Developer Professional Certificate
  'opp-ibm-fs': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: '100% Free via Coursera Financial Aid.',
    },
    studentAid: {
      available: true,
      summary: '100% Free with Coursera Financial Aid.',
      steps: ['Apply for Coursera Financial Aid on IBM course page.'],
    },
    windows: [{ label: 'Self-Paced', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Comprehensive 12-course IBM program covering modern full-stack web architectures: HTML/CSS/JS, Node.js, Express, React, Python, Django, microservices with Docker/Kubernetes, and CI/CD pipelines.',
      what_it_covers: [
        'Front-end technologies: HTML, CSS, JavaScript, React components, and state management',
        'Back-end development: Node.js, Express server routing, Python, Django REST APIs',
        'Cloud-native and DevOps: Docker containers, Kubernetes deployments, OpenShift, serverless functions',
        'Full-stack capstone: Integrated web application deployed to cloud with automated CI/CD',
      ],
      format: {
        delivery: 'Online self-paced with IBM Cloud lab environments',
        style: '12 Courses + Hands-on browser labs and capstone project',
        attempts_included: 'Unlimited',
      },
      cost_breakdown: [{ item: 'With Financial Aid', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime credential with IBM digital badges.',
      prerequisites: 'No prior background required.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera and complete labs on IBM Cloud.'],
      timeline: [{ label: 'Anytime', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['IBM Credly Badge URL', 'Deployed full-stack application on IBM Cloud / Render'],
        line_template: 'IBM Full-Stack Software Developer Certified | Built cloud-native applications with React, Node.js/Express, and MongoDB, deploying containerized microservices to Kubernetes clusters.',
      },
      pitfalls: ['Letting IBM Cloud free tier credits expire before completing the deployment labs.'],
      sources: [
        {
          title: 'IBM Full Stack Developer Certificate',
          url: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'verification'],
        },
      ],
    },
  },

  // 18. IBM AI Engineering Professional Certificate
  'opp-ibm-ai-eng': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: '100% Free with Coursera Financial Aid. Focuses on Deep Learning, PyTorch, TensorFlow, and Apache Spark.',
    },
    studentAid: {
      available: true,
      summary: '100% Free with Coursera Financial Aid.',
      steps: ['Submit Coursera Financial Aid application.'],
    },
    windows: [{ label: 'Self-Paced', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'The IBM AI Engineering Professional Certificate equips learners with practical machine learning and deep learning skills, spanning Scikit-Learn, PyTorch, TensorFlow/Keras, CNNs, RNNs, and Big Data ML with Apache Spark.',
      what_it_covers: [
        'Machine Learning with Python: Regression, classification, clustering, model evaluation',
        'Deep Learning and Neural Networks: Forward/backward propagation, activation functions, loss optimizers',
        'Computer Vision and NLP: Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs/LSTMs)',
        'Scalable AI with Apache Spark: Distributed MLlib algorithms for large enterprise datasets',
      ],
      format: {
        delivery: 'Online self-paced on Coursera',
        style: '6 Courses with Jupyter Notebook coding labs and capstone',
        attempts_included: 'Unlimited',
      },
      cost_breakdown: [{ item: 'With Financial Aid', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime credential with Credly digital badges.',
      prerequisites: 'Basic Python programming and introductory linear algebra.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera.'],
      timeline: [{ label: 'Immediate', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['IBM AI Engineering Credly URL', 'Deep learning computer vision GitHub repo'],
        line_template: 'IBM AI Engineering Certified | Trained deep neural networks (CNNs, LSTMs) using PyTorch and TensorFlow, scaling model training pipelines using Apache Spark MLlib.',
      },
      pitfalls: ['Not tuning neural network hyper-parameters (learning rates, batch sizes, dropout).'],
      sources: [
        {
          title: 'IBM AI Engineering Certificate',
          url: 'https://www.coursera.org/professional-certificates/ai-engineer',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'verification'],
        },
      ],
    },
  },

  // 19. TensorFlow Developer Certificate (Legacy / Guidance Notice)
  'opp-tf-dev': {
    trust: 'verified_official',
    flags: ['changed_2026'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 100,
      inr_official: 8680,
      priceConfidence: 'verified',
      note: 'Retired by Google in 2024. Active candidates should pursue Google Cloud Professional ML Engineer or TensorFlow Keras portfolio repos instead.',
    },
    studentAid: {
      available: false,
      summary: 'Program was formally retired by Google. Avoid third-party scams claiming to sell active exam vouchers.',
      steps: ['Direct efforts toward Google Cloud Professional ML Engineer or active PyTorch certifications.'],
    },
    windows: [{ label: 'Permanently Retired by Google', status: 'closed', date: 'Retired in 2024' }],
    richDetails: {
      overview: 'Google officially retired the TensorFlow Developer Certificate in 2024. For verifiable AI/ML credentials, recruiters now evaluate Google Cloud Professional ML Engineer, AWS MLA, or public GitHub contributions and Kaggle medals.',
      what_it_covers: [
        'Historical: Building CNNs, NLP models, and time-series forecasting in TensorFlow 2.x',
        'Current Recommended Path: Google Cloud Professional Machine Learning Engineer or PyTorch Certified Developer',
      ],
      format: {
        delivery: 'Exam retired; archived credentials remain honored',
        style: 'Archived guidance record',
      },
      cost_breakdown: [{ item: 'Exam Registration (Historical)', usd: 100, inr: 8680 }],
      validity_renewal: 'Prior issued certificates remain permanently verifiable on Google Certified Directory.',
      prerequisites: 'N/A (Program retired).',
      eligibility: 'Closed to new registrations.',
      how_to_apply: ['Do not register on third-party sites; take Google Cloud Professional ML Engineer instead.'],
      timeline: [{ label: 'Exam Retired', status: 'past', date: '2024' }],
      resume_evidence: {
        attach: ['Historical Google Certificate verification URL (if passed before retirement)'],
        line_template: 'TensorFlow Developer Certified (Google, Historical) | Implemented deep learning computer vision and NLP models using TensorFlow 2.x and Keras functional API.',
      },
      pitfalls: ['Falling for third-party websites claiming to sell active TensorFlow exam vouchers.'],
      sources: [
        {
          title: 'Google TensorFlow Certificate Retirement Notice',
          url: 'https://www.tensorflow.org/certificate',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['retirement_notice'],
        },
      ],
    },
  },

  // 20. Kaggle Competitions
  'opp-kaggle-comp': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free platform. Competitions offer prize pools from $20,000 to $100,000+ USD.',
    },
    rewardDisplay: {
      headline: '$20,000 – $100,000+ USD Prize Pools',
      note: 'Kaggle Grandmaster / Expert rankings are prime hiring signals for top AI research labs and Quant firms.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Kaggle provides free GPU (T4/P100) and TPU computing hours directly in the browser.',
      steps: [
        'Sign up at kaggle.com and verify phone number to unlock GPU/TPU accelerator quotas (30h/week).',
      ],
    },
    windows: [{ label: 'Ongoing Active Competitions', status: 'open_now', date: 'Year-Round' }],
    richDetails: {
      overview: 'Kaggle Competitions is the world\'s preeminent competitive data science platform owned by Google. Participating in featured competitions builds verifiable proof of predictive modeling skills, data cleaning, feature engineering, and model ensembling.',
      what_it_covers: [
        'Exploratory Data Analysis (EDA) on tabular, image, text, and multimodal datasets',
        'Feature engineering: Target encoding, interaction terms, PCA dimensionality reduction',
        'Model training: LightGBM, XGBoost, CatBoost for tabular data; PyTorch/Transformers for NLP/CV',
        'Cross-validation strategies (Stratified K-Fold, GroupKFold) to prevent leaderboard overfitting',
      ],
      format: {
        delivery: 'Online cloud environment with free Jupyter GPU notebooks',
        style: 'Competitive predictive modeling challenge with public and private leaderboards',
      },
      cost_breakdown: [{ item: 'Platform & GPU Access', inr: 0, usd: 0 }],
      validity_renewal: 'Permanent medals (Bronze, Silver, Gold) and tier rankings (Expert, Master, Grandmaster).',
      prerequisites: 'Python, Pandas, NumPy, Scikit-Learn, and introductory Machine Learning.',
      eligibility: 'Open globally to anyone.',
      how_to_apply: ['Join active competitions on kaggle.com/competitions.'],
      timeline: [{ label: 'New Challenges Released Monthly', status: 'open_now', date: 'Rolling' }],
      resume_evidence: {
        attach: ['Public Kaggle Profile URL with Medal badge verification', 'Winning solution write-up in Kaggle Discussion forums'],
        line_template: 'Kaggle Competitions Expert / Top [X]% | Placed [Rank] out of [Y] teams in [Competition Name], ensembling LightGBM and PyTorch models with a cross-validation score of [Z].',
      },
      pitfalls: ['Overfitting to the public leaderboard by constantly tuning hyperparameters without strict K-Fold validation.'],
      sources: [
        {
          title: 'Kaggle Competitions Overview',
          url: 'https://www.kaggle.com/competitions',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['rules', 'tiers', 'pricing'],
        },
      ],
    },
  },

  // 21. Kaggle Learn Certificates
  'opp-kaggle-learn': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free micro-courses with interactive hands-on coding exercises.',
    },
    studentAid: {
      available: true,
      summary: 'Completely free without payment barriers or subscription fees.',
      steps: ['Sign in to kaggle.com/learn and start any micro-course.'],
    },
    windows: [{ label: 'Self-Paced / On-Demand', status: 'open', date: 'Immediate' }],
    richDetails: {
      overview: 'Kaggle Learn offers free, concise, interactive micro-courses covering essential data science, machine learning, deep learning, feature engineering, and SQL skills through hands-on notebook exercises.',
      what_it_covers: [
        'Python, Pandas, and Data Visualization with Seaborn and Matplotlib',
        'Intro to Machine Learning and Intermediate Machine Learning (Random Forests, XGBoost)',
        'Feature Engineering: Mutual information, clustering, principal component analysis',
        'Intro to Deep Learning with Keras, Computer Vision, and Generative AI prompt engineering',
      ],
      format: {
        delivery: 'Online interactive Jupyter notebooks in the browser',
        style: '3 to 5 hour micro-courses with executable coding tests',
      },
      cost_breakdown: [{ item: 'All Courses and Certifications', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime certificates displayed on your public Kaggle profile.',
      prerequisites: 'None; courses range from absolute beginner to intermediate.',
      eligibility: 'Open globally.',
      how_to_apply: ['Complete exercises on kaggle.com/learn.'],
      timeline: [{ label: 'Anytime', status: 'open', date: 'On-demand' }],
      resume_evidence: {
        attach: ['Kaggle Profile URL with completed certificate badges'],
        line_template: 'Kaggle Certified: Machine Learning & Feature Engineering | Completed hands-on predictive modeling and data transformation pipelines using XGBoost, Scikit-Learn, and Pandas.',
      },
      pitfalls: ['Treating micro-courses as complete standalone credentials rather than stepping stones to real competitions.'],
      sources: [
        {
          title: 'Kaggle Learn Micro-Courses',
          url: 'https://www.kaggle.com/learn',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['curriculum', 'pricing'],
        },
      ],
    },
  },

  // 22. MLH Hackathons (Major League Hacking)
  'opp-mlh-hackathons': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free global student hackathons. Sponsored API access and swag provided.',
    },
    rewardDisplay: {
      headline: 'Sponsor Category Prizes & Tech Hardware',
      note: 'Sponsored prize tracks from GitHub, Twilio, MongoDB, and Cloudflare.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Free access to GitHub Student Developer Pack and cloud hosting credits during events.',
      steps: ['Register for any MLH Member Hackathon at mlh.io/seasons.'],
    },
    windows: [{ label: 'Weekend Hackathons Occur Every Week', status: 'open_now', date: 'Continuous Season' }],
    richDetails: {
      overview: 'Major League Hacking (MLH) is the official student hackathon league hosting over 200 weekend hackathons globally every year. Teams build functional software and hardware prototypes in 24 to 36 hours.',
      what_it_covers: [
        'Rapid prototyping: Building full-stack web, mobile, and IoT applications under tight deadlines',
        'API and cloud integration: Authentication, third-party APIs (Twilio, OpenAI, Stripe), cloud hosting',
        'Collaborative team development: Agile Git workflows, sprint planning, feature prioritizing',
        'Technical pitching: 3-minute video and live demo presentation to engineering judges',
      ],
      format: {
        delivery: 'Online and in-person university campuses worldwide',
        style: '24-36 hour weekend hackathon sprint with sponsor category tracks',
      },
      cost_breakdown: [{ item: 'Student Registration Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Devpost portfolio submission and MLH participation record.',
      prerequisites: 'Basic coding familiarity in any language.',
      eligibility: 'High school and university students globally.',
      how_to_apply: ['Browse upcoming hackathons on mlh.io and register on Devpost.'],
      timeline: [{ label: 'Active Every Weekend', status: 'open_now', date: 'Year-round season' }],
      resume_evidence: {
        attach: ['Devpost Project Submission URL with demo video', 'Public GitHub repository with commit history'],
        line_template: 'MLH Hackathon Winner / Finalist | Built [Project Name] in 36-hour sprint, integrating [APIs/Tech Stack] to solve [Problem], winning [Prize Category] among [X] teams.',
      },
      pitfalls: ['Submitting pre-built code; hackathon rules strictly require building during the event window.'],
      sources: [
        {
          title: 'Major League Hacking Official Season',
          url: 'https://mlh.io/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['events', 'rules'],
        },
      ],
    },
  },

  // 23. MLH Fellowship
  'opp-mlh-fellowship': {
    trust: 'verified_official',
    flags: ['paid_stipend', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free. Selected fellows receive educational stipends up to $3,000 USD (~₹2,60,000 INR).',
    },
    stipendDisplay: {
      headline: 'Up to $3,000 USD Educational Stipend (~₹2,60,000 INR)',
      note: 'Needs-based and merit-based stipends disbursed throughout the 12-week fellowship.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Stipends provided to enable students to dedicate full-time or part-time focus to open source.',
      steps: [
        'Submit a clean code sample on GitHub adhering to best practices and test suites.',
        'Pass the Technical Interview with an MLH Fellow alumni.',
        'Complete the Behavioral & Team Match interview.',
      ],
    },
    windows: [
      { label: 'Spring Batch', status: 'open', date: 'January – April' },
      { label: 'Summer Batch', status: 'open_now', date: 'May – August' },
      { label: 'Fall Batch', status: 'upcoming', date: 'September – December' },
    ],
    richDetails: {
      overview: 'The MLH Fellowship is a remote 12-week internship alternative where students contribute to real-world open-source software projects used by millions (Meta, GitHub, AWS, Solana), guided by professional software engineers.',
      what_it_covers: [
        'Open-source software engineering: Contributing to enterprise open-source repositories',
        'Code reviews: Writing and reviewing production pull requests with senior mentors',
        'Agile rituals: Standups, sprint retrospectives, pair programming, and technical presentations',
      ],
      format: {
        delivery: 'Remote online fellowship',
        style: '12-week intensive program in pods of 8-10 fellows with dedicated professional mentor',
      },
      cost_breakdown: [{ item: 'Tuition and Application', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious fellowship credential verifiable on MLH Fellowship alumni directory.',
      prerequisites: 'Proficiency in at least one programming language and ability to submit a working code sample.',
      eligibility: 'Students and aspiring software engineers worldwide.',
      how_to_apply: ['Apply at fellowship.mlh.io with your GitHub portfolio and technical essay.'],
      timeline: [
        { label: 'Applications Open for Summer/Fall', status: 'open_now', date: 'Rolling batches' },
      ],
      resume_evidence: {
        attach: ['Official MLH Fellowship Graduation Certificate', 'Merged PRs on sponsor open source repositories'],
        line_template: 'MLH Fellow (Open Source Track) | Contributed to [Project Name] under [Sponsor Org], authoring [X] merged PRs improving [Performance/Feature] by [Y]% and writing unit test coverage.',
      },
      pitfalls: ['Submitting a trivial tutorial project (like a basic to-do list) as your code sample.'],
      sources: [
        {
          title: 'MLH Fellowship Official Application',
          url: 'https://fellowship.mlh.io/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'tracks', 'eligibility'],
        },
      ],
    },
  },

  // 24. Outreachy
  'opp-outreachy': {
    trust: 'verified_official',
    flags: ['paid_stipend', 'best_value', 'hiring_pipeline'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free application. Selected interns receive a $7,000 USD stipend (~₹6,07,000 INR).',
    },
    stipendDisplay: {
      headline: '$7,000 USD Paid Stipend (~₹6,07,000 INR)',
      note: 'Paid in milestone installments ($3,000 mid-term, $4,000 final).',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Provides $7,000 USD stipend to support underrepresented individuals in tech.',
      steps: [
        'Complete the Initial Application verifying eligibility and writing 4 detailed essay answers.',
        'Participate in the 4-week Contribution Phase submitting merged PRs to your chosen project.',
      ],
    },
    windows: [
      { label: 'May to August Cohort', status: 'open_now', date: 'Applications in Jan – Feb' },
      { label: 'December to March Cohort', status: 'upcoming', date: 'Applications in Aug – Sept' },
    ],
    richDetails: {
      overview: 'Outreachy provides remote paid internships to people subject to systemic bias and underrepresented in technical industry in their country. Interns work with open source mentors (Linux Kernel, Mozilla, Wikimedia, Fedora) for 3 months.',
      what_it_covers: [
        'Full-time open-source contribution under 1:1 mentorship from seasoned global maintainers',
        'Collaborative software engineering, Git version control, technical documentation, testing',
      ],
      format: {
        delivery: '100% Remote asynchronous mentorship',
        style: '3-month full-time (40h/week) internship sprint',
      },
      cost_breakdown: [{ item: 'Application Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Permanent prestigious open-source credential.',
      prerequisites: 'Eligibility check for underrepresented groups and commitment to 40h/week during internship.',
      eligibility: 'Must face systemic bias in your local technical community. Open worldwide.',
      how_to_apply: ['Submit initial essay application on outreachy.org.'],
      timeline: [{ label: 'Cohorts Run Twice Annually', status: 'open', date: 'May and December cohorts' }],
      resume_evidence: {
        attach: ['Official Outreachy Intern Directory Listing', 'Merged upstream git commits'],
        line_template: 'Outreachy Open Source Intern @ [Organization] | Engineered [Feature/Subsystem], authoring [X] merged commits and optimizing [Performance/Bug] across [Y] repository modules.',
      },
      pitfalls: ['Submitting short, superficial essay answers during the Initial Application stage.'],
      sources: [
        {
          title: 'Outreachy Official Internship Guide',
          url: 'https://www.outreachy.org/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'rules', 'dates'],
        },
      ],
    },
  },

  // 25. LFX Mentorship (Linux Foundation Mentorship)
  'opp-lfx': {
    trust: 'verified_official',
    flags: ['paid_stipend', 'best_value', 'hiring_pipeline'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free application. Selected mentees receive PPP-adjusted stipend ($3,000 to $6,000 USD / ~₹2.6L–₹5.2L INR).',
    },
    stipendDisplay: {
      headline: '$3,000 – $6,000 USD Stipend (PPP Adjusted)',
      note: 'Disbursed in milestone evaluations by the Linux Foundation.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Stipends paid to all selected mentees across Cloud Native (CNCF), Hyperledger, OpenSSF, and Linux Kernel projects.',
      steps: ['Apply on mentorship.lfx.linuxfoundation.org with resume and cover letter.'],
    },
    windows: [
      { label: 'Spring Term', status: 'open', date: 'March – May' },
      { label: 'Summer Term', status: 'open_now', date: 'June – August' },
      { label: 'Fall Term', status: 'upcoming', date: 'September – November' },
    ],
    richDetails: {
      overview: 'The Linux Foundation LFX Mentorship program trains aspiring developers to contribute effectively to Linux Foundation open source projects (Kubernetes, Envoy, Prometheus, OpenTelemetry, Cilium).',
      what_it_covers: [
        'Cloud-native systems programming in Go, Rust, C++, and eBPF',
        'Kernel modules, container runtime internals, and distributed tracing architectures',
        'Production pull request workflows conforming to strict CNCF quality gates and unit tests',
      ],
      format: {
        delivery: 'Remote 12-week (full-time) or 24-week (part-time) mentorship',
        style: 'Structured engineering deliverables evaluated by project maintainers',
      },
      cost_breakdown: [{ item: 'Mentorship Application', inr: 0, usd: 0 }],
      validity_renewal: 'Prestigious Linux Foundation Credential Badge.',
      prerequisites: 'Strong proficiency in Go, C++, Rust, or Python and Linux systems familiarity.',
      eligibility: '18+ years of age, open globally.',
      how_to_apply: ['Apply directly to participating projects on LFX Mentorship platform.'],
      timeline: [{ label: 'Runs in 3 Seasons Annually', status: 'open_now', date: 'Spring, Summer, Fall' }],
      resume_evidence: {
        attach: ['LFX Mentorship Completion Certificate', 'Upstream CNCF / Linux Foundation merged PR links'],
        line_template: 'Linux Foundation LFX Mentee @ [Project, e.g. Kubernetes/Envoy] | Implemented [Feature/Subsystem] in [Go/Rust], contributing [X] merged PRs and authoring [Y] end-to-end integration tests.',
      },
      pitfalls: ['Applying to projects without prior familiarity with the repository codebase and issue tracker.'],
      sources: [
        {
          title: 'Linux Foundation LFX Mentorship Platform',
          url: 'https://lfx.linuxfoundation.org/tools/mentorship/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['stipend', 'terms', 'projects'],
        },
      ],
    },
  },

  // 26. Season of KDE (SoK)
  'opp-sok': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['CSE', 'IT', 'ECE'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free community program. Successful participants receive KDE certificate and exclusive swag.',
    },
    rewardDisplay: {
      headline: 'Official KDE Certificate & Merchandise',
      note: 'Mentorship directly from veteran KDE and Qt desktop/mobile developers.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: '100% Free open-source mentorship initiative.',
      steps: ['Contact KDE project mentors on Matrix and submit a proposal on season.kde.org.'],
    },
    windows: [{ label: 'Annual Winter/Spring Program', status: 'open', date: 'December – March' }],
    richDetails: {
      overview: 'Season of KDE is an outreach program hosted by the KDE community, providing an opportunity for students who were not eligible for GSoC or wanting to get started in open source to work on KDE desktop, mobile, and library software.',
      what_it_covers: [
        'C++ and Qt framework GUI programming for Linux and cross-platform desktop applications',
        'KDE Frameworks, QML declarative UI, Wayland display protocols, and CMake build systems',
        'Collaborative open-source development using KDE GitLab (Invent)',
      ],
      format: {
        delivery: 'Online remote mentorship',
        style: '3-month guided engineering project with KDE maintainer',
      },
      cost_breakdown: [{ item: 'Registration Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Official KDE Achievement Certificate.',
      prerequisites: 'C++ or Python familiarity and interest in open-source desktop software.',
      eligibility: 'Open globally.',
      how_to_apply: ['Submit proposal on season.kde.org after discussing ideas in KDE Matrix channels.'],
      timeline: [{ label: 'Annual Cycle', status: 'open', date: 'Dec – March' }],
      resume_evidence: {
        attach: ['Official KDE Season Certificate', 'Invent GitLab merged commits'],
        line_template: 'Season of KDE Contributor | Developed [Feature/App] using C++ and Qt/QML for the KDE ecosystem, authoring [X] merged commits with complete test coverage.',
      },
      pitfalls: ['Neglecting KDE code style guidelines and CMake dependency standards.'],
      sources: [
        {
          title: 'Season of KDE Official Portal',
          url: 'https://season.kde.org/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['dates', 'rules'],
        },
      ],
    },
  },

  // 27. Hacktoberfest
  'opp-hacktoberfest': {
    trust: 'verified_official',
    flags: ['free', 'best_value', 'open_now'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 0,
      inr_official: 0,
      priceConfidence: 'verified',
      note: '100% Free global celebration of open-source software presented by DigitalOcean and Cloudflare.',
    },
    rewardDisplay: {
      headline: 'Digital Badges & Tree Planted in Your Name',
      note: 'Verifiable Holopin digital badge rewards and open-source contribution recognition.',
      confidence: 'verified',
    },
    studentAid: {
      available: true,
      summary: 'Free to participate globally throughout October.',
      steps: ['Register at hacktoberfest.com with your GitHub or GitLab account.'],
    },
    windows: [{ label: 'October Annually', status: 'open_now', date: 'October 1 – October 31' }],
    richDetails: {
      overview: 'Hacktoberfest is a month-long celebration of open-source software run by DigitalOcean. Open to everyone, it encourages participation by having participants submit 4 accepted pull requests to participating public repositories on GitHub or GitLab.',
      what_it_covers: [
        'Finding and resolving good-first-issues in public open-source codebases',
        'Creating clean Git commits, opening meaningful PRs, and addressing code review feedback',
      ],
      format: {
        delivery: 'Online self-paced contribution sprint',
        style: 'Submit 4 accepted PRs to repos with the "hacktoberfest" topic during October',
      },
      cost_breakdown: [{ item: 'Registration Fee', inr: 0, usd: 0 }],
      validity_renewal: 'Verifiable Holopin Digital Badge with year badge stamp.',
      prerequisites: 'Basic knowledge of Git and GitHub.',
      eligibility: 'Open globally to all developers.',
      how_to_apply: ['Sign up on hacktoberfest.com and link your GitHub/GitLab account.'],
      timeline: [{ label: 'Active throughout October', status: 'open_now', date: 'Oct 1 – Oct 31' }],
      resume_evidence: {
        attach: ['Holopin Hacktoberfest Badge URL', 'Links to 4 accepted pull requests on GitHub'],
        line_template: 'Hacktoberfest Open Source Contributor | Submitted 4 accepted production pull requests across open-source repositories, resolving [Bug/Feature] and adding documentation.',
      },
      pitfalls: ['Submitting spam PRs (fixing single whitespace/typos) which results in account disqualification.'],
      sources: [
        {
          title: 'Hacktoberfest Official Site',
          url: 'https://hacktoberfest.com/',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['rules', 'dates'],
        },
      ],
    },
  },

  // 28. Google UX Design Certificate
  'opp-google-ux': {
    trust: 'verified_official',
    flags: ['free', 'best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 49,
      inr_official: 3600,
      priceConfidence: 'verified',
      note: '100% Free with Coursera Financial Aid.',
    },
    studentAid: {
      available: true,
      summary: '100% Free with Coursera Financial Aid approval.',
      steps: ['Submit Coursera Financial Aid application on course page.'],
    },
    windows: [{ label: 'Self-Paced', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'The Google UX Design Professional Certificate teaches students the foundations of UX design, empathizing with users, defining user personas, wireframing in Figma, building interactive prototypes, and conducting usability studies.',
      what_it_covers: [
        'Foundations of User Experience (UX) Design: Usability, accessibility, design sprints',
        'User Research: Empathy maps, user personas, journey maps, competitive audits',
        'Wireframing and Prototyping: Low-fidelity paper/digital wireframes and high-fidelity prototypes in Figma',
        'Usability Testing: Synthesizing study data, affinity diagrams, design iterations',
        'Building 3 complete design portfolio case studies (mobile app, responsive website, social good design)',
      ],
      format: {
        delivery: 'Online self-paced on Coursera',
        style: '7 Courses + 3 complete end-to-end portfolio projects in Figma',
        attempts_included: 'Unlimited',
      },
      cost_breakdown: [{ item: 'With Financial Aid', inr: 0, usd: 0 }],
      validity_renewal: 'Lifetime credential with Credly badge.',
      prerequisites: 'No design background required.',
      eligibility: 'Open globally.',
      how_to_apply: ['Enroll on Coursera.'],
      timeline: [{ label: 'Immediate Start', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['Credly Google UX Badge URL', 'Figma Case Study link and Behance/Notion portfolio site'],
        line_template: 'Google UX Design Professional Certified | Conducted user research and designed interactive high-fidelity mobile and web prototypes in Figma with complete accessibility auditing.',
      },
      pitfalls: ['Designing pretty visuals without backing them up with user research and usability testing.'],
      sources: [
        {
          title: 'Google UX Design Certificate',
          url: 'https://www.coursera.org/professional-certificates/google-ux-design',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'verification'],
        },
      ],
    },
  },

  // 29. Tableau Desktop Specialist
  'opp-tableau-spec': {
    trust: 'verified_official',
    flags: ['best_value'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 100,
      inr_official: 8680,
      priceConfidence: 'verified',
      note: '$100 USD (~₹8,680 INR). Indian students can get free Tableau Desktop student licenses.',
    },
    studentAid: {
      available: true,
      summary: 'Tableau provides 1-year free Tableau Desktop & Prep Builder licenses for registered college students.',
      steps: [
        'Apply at tableau.com/academic/students with college ID card.',
        'Receive free Tableau Desktop product key for hands-on practice.',
      ],
    },
    windows: [{ label: 'Year-Round Testing (Pearson VUE)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Tableau Desktop Specialist validates fundamental skills in data visualization, connecting to data sources, building core charts, applying filters, and sharing interactive dashboards using Tableau.',
      what_it_covers: [
        'Connecting to and preparing data: Joins, unions, relationships, data types',
        'Exploring and analyzing data: Dimensions vs measures, discrete vs continuous fields, basic calculations',
        'Sharing insights: Dashboards, stories, formatting, interactive actions (filter, highlight, URL)',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE testing center',
        style: '45 Multiple-choice / multi-select questions in 60 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'Exam Fee', usd: 100, inr: 8680 }],
      validity_renewal: 'Never expires. Tableau Desktop Specialist has lifetime validity.',
      prerequisites: '3+ months hands-on practice with Tableau Desktop.',
      eligibility: 'Open globally.',
      how_to_apply: ['Book through Pearson VUE Tableau certification portal.'],
      timeline: [{ label: 'On-Demand', status: 'open', date: 'Continuous' }],
      resume_evidence: {
        attach: ['Tableau Credly Badge', 'Tableau Public profile featuring interactive dashboards'],
        line_template: 'Tableau Desktop Specialist Certified | Designed interactive enterprise dashboards on Tableau Public, implementing drill-down filters, calculated fields, and dual-axis visualizations.',
      },
      pitfalls: ['Confusing relationships vs physical joins in modern Tableau data models.'],
      sources: [
        {
          title: 'Tableau Desktop Specialist Exam Guide',
          url: 'https://www.tableau.com/learn/certification/desktop-specialist',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['syllabus', 'pricing'],
        },
      ],
    },
  },

  // 30. Microsoft Power BI Data Analyst Associate (PL-300)
  'opp-ms-pl300': {
    trust: 'verified_official',
    flags: ['best_value', 'hiring_pipeline'],
    branches: ['ALL'],
    feeDisplay: {
      usd: 55,
      inr_official: 4800,
      priceConfidence: 'verified',
      note: 'Subsidized India fee is $55 USD (~₹4,800 INR). 50% extra discount for verified students.',
    },
    studentAid: {
      available: true,
      summary: 'India regional pricing of ₹4,800 INR + student academic discount vouchers on Microsoft Learn.',
      steps: ['Verify academic status on Microsoft Learn to claim student pricing at checkout.'],
    },
    windows: [{ label: 'Year-Round (Pearson VUE)', status: 'open', date: 'Rolling' }],
    richDetails: {
      overview: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300) proves ability to deliver actionable business insights using Power BI, spanning Power Query data transformation, star-schema data modeling, and DAX calculations.',
      what_it_covers: [
        'Prepare the data: Clean, transform, and load using Power Query M code, handling nulls and unpivoting columns',
        'Model the data: Star schema modeling, relationship cardinality (1:many), writing DAX measures (CALCULATE, FILTER, RELATED)',
        'Visualize and analyze the data: Creating interactive reports, conditional formatting, drill-throughs, bookmarks',
        'Deploy and maintain assets: Power BI workspaces, scheduled data refreshes, Row-Level Security (RLS)',
      ],
      format: {
        delivery: 'Online proctored or Pearson VUE test center',
        style: '40-60 Questions (Multiple choice, case studies, DAX drag-and-drop) in 100 minutes',
        attempts_included: 1,
      },
      cost_breakdown: [{ item: 'India Subsidized Exam Fee', inr: 4800, usd: 55 }],
      validity_renewal: 'Valid for 1 year. Renewable annually for free via a short online Microsoft Learn assessment.',
      prerequisites: 'Comfortable with SQL, Excel data models, and Power BI Desktop.',
      eligibility: 'Open globally.',
      how_to_apply: ['Book through Microsoft Learn Pearson VUE dashboard.'],
      timeline: [{ label: 'Continuous', status: 'open', date: 'Rolling' }],
      resume_evidence: {
        attach: ['Microsoft Learn Credential URL', 'GitHub repo hosting Power BI (.pbix) templates with documented DAX measures'],
        line_template: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300) | Modeled enterprise star-schema datasets and analytical DAX KPIs in Power BI, implementing automated Power Query ETL and Row-Level Security.',
      },
      pitfalls: ['Writing inefficient bi-directional relationships instead of clean single-direction star schemas.'],
      sources: [
        {
          title: 'Microsoft PL-300 Study Guide',
          url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300',
          type: 'official',
          retrieved: '2026-10-14',
          supports: ['exam_domains', 'pricing'],
        },
      ],
    },
  },
};
