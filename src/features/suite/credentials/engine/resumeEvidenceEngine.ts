// ============================================================
// Credential & Opportunity Engine — Performative Resume Evidence Engine
// Generates high-impact, XYZ-formula, ATS-optimized resume evidence
// templates for ANY certification, hackathon, or open-source program.
// ============================================================

import { OpportunityRecord } from '../types';

export interface ResumeFormatItem {
  id: 'xyz_bullet' | 'project_entry' | 'cert_line' | 'summary_hook';
  title: string;
  badge: string;
  section: string;
  description: string;
  template: string;
  exampleCompleted: string;
}

export interface MetricSuggestion {
  label: string;
  metricType: 'throughput' | 'latency' | 'scale' | 'cost' | 'accuracy' | 'coverage';
  examples: string[];
  hint: string;
}

export interface ProofArtifactItem {
  title: string;
  description: string;
  type: 'credential_badge' | 'code_repo' | 'live_deployment' | 'documentation' | 'pr_evidence';
  recommendation: string;
}

export interface InterviewDefenseItem {
  question: string;
  starAnswerOutline: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keyVocabulary: string[];
}

export interface PerformativeEvidencePackage {
  opportunityId: string;
  opportunityName: string;
  domain: string;
  formats: ResumeFormatItem[];
  metricSuggestions: MetricSuggestion[];
  artifactsChecklist: ProofArtifactItem[];
  atsKeywords: {
    primarySkills: string[];
    secondarySkills: string[];
    roleAlignmentKeywords: string[];
  };
  interviewDefense: InterviewDefenseItem[];
}

/**
 * Normalizes domain category for high-velocity template matching
 */
function detectDomain(opp: OpportunityRecord): 'cloud' | 'web' | 'ml' | 'security' | 'event' | 'opensource' | 'embedded' | 'general' {
  const id = opp.id.toLowerCase();
  const name = opp.name.toLowerCase();
  const categories = (opp.category || []).map((c) => String(c).toLowerCase());
  const skills = (opp.relatedSkills || []).map((s) => s.toLowerCase());

  if (opp.kind === 'event' || opp.type === 'hackathon' || id.includes('hackathon') || name.includes('hackathon') || name.includes('challenge') || name.includes('grid')) {
    return 'event';
  }

  if (opp.kind === 'open_source' || id.includes('gsoc') || id.includes('outreachy') || id.includes('lfx') || id.includes('mlh') || id.includes('c4gt') || id.includes('kde')) {
    return 'opensource';
  }

  if (
    categories.some((c) => c.includes('cloud') || c.includes('devops')) ||
    id.includes('aws') || id.includes('gcp') || id.includes('azure') || id.includes('cka') || id.includes('ckad') || id.includes('terraform') ||
    skills.some((s) => s.includes('kubernetes') || s.includes('docker') || s.includes('terraform') || s.includes('aws'))
  ) {
    return 'cloud';
  }

  if (
    id.includes('matlab') || id.includes('labview') || id.includes('arm') || id.includes('solidworks') ||
    name.includes('matlab') || name.includes('labview') || name.includes('arm') || name.includes('solidworks') ||
    categories.some((c) => c.includes('embedded') || c.includes('hardware') || c.includes('robotics') || c.includes('core-engineering'))
  ) {
    return 'embedded';
  }

  if (
    categories.some((c) => c.includes('front-end') || c.includes('frontend') || c.includes('full-stack') || c.includes('web') || c.includes('mobile')) ||
    id.includes('frontend') || id.includes('backend') || id.includes('react') || id.includes('django') || id.includes('full-stack')
  ) {
    return 'web';
  }

  if (
    categories.some((c) => c.includes('machine learning') || c.includes('ai') || c.includes('data')) ||
    id.includes('ml') || id.includes('data') || id.includes('kaggle') || id.includes('tensorflow') || id.includes('power-bi') || id.includes('tableau') ||
    skills.some((s) => s.includes('pytorch') || s.includes('python') || s.includes('pandas') || s.includes('machine learning'))
  ) {
    return 'ml';
  }

  if (
    categories.some((c) => c.includes('security') || c.includes('cyber')) ||
    id.includes('security') || id.includes('ccna') || id.includes('ejpt') || id.includes('pnpt') || id.includes('isc2')
  ) {
    return 'security';
  }

  return 'general';
}

/**
 * Extracts and synthesizes top technical skills for bullet injection
 */
function getTopSkills(opp: OpportunityRecord): { s1: string; s2: string; s3: string; techStack: string } {
  const skills = opp.relatedSkills && opp.relatedSkills.length > 0 ? opp.relatedSkills : ['Core Architecture', 'Systems Design', 'Production Testing'];
  const s1 = skills[0] || 'Core Architecture';
  const s2 = skills[1] || 'Infrastructure Automation';
  const s3 = skills[2] || 'Reliability Engineering';
  const techStack = skills.slice(0, 4).join(', ');
  return { s1, s2, s3, techStack };
}

/**
 * Primary Engine: Builds performative 4-format evidence package for any opportunity
 */
export function getPerformativeEvidence(opp: OpportunityRecord): PerformativeEvidencePackage {
  const domain = detectDomain(opp);
  const { s1, s2, s3, techStack } = getTopSkills(opp);
  const role = opp.targetRoles && opp.targetRoles[0] ? opp.targetRoles[0] : 'Software Engineer';
  const org = opp.organizer || opp.issuer || 'Official Issuer';
  const name = opp.name;

  let formats: ResumeFormatItem[] = [];
  let metricSuggestions: MetricSuggestion[] = [];
  let artifactsChecklist: ProofArtifactItem[] = [];
  let interviewDefense: InterviewDefenseItem[] = [];

  switch (domain) {
    case 'cloud':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Work / Internship',
          section: 'Professional Experience or Academic Projects',
          description: 'Follows Google XYZ format: Accomplished [X] measured by [Y] by doing [Z]. Put in your experience or projects section.',
          template: `Architected and provisioned high-availability cloud infrastructure on [AWS/GCP/Azure/Kubernetes] utilizing [Tech Stack: ${techStack || 'Terraform, Docker, Kubernetes'}]; automated CI/CD deployment pipelines and auto-scaling policies, decreasing deployment cycle time by [60-80%] and sustaining [99.9%+] uptime under [N concurrent requests/sec].`,
          exampleCompleted: `Architected and provisioned high-availability cloud infrastructure on AWS utilizing Terraform, Docker, and Kubernetes; automated CI/CD deployment pipelines and auto-scaling policies, decreasing deployment cycle time by 75% and sustaining 99.95% uptime under 4,500 concurrent requests/sec.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Portfolio Project',
          section: 'Technical Projects (2-Bullet Structured Block)',
          description: 'Complete 2-bullet project entry with title, tech stack, and GitHub/Demo links.',
          template: `[Project Title] | ${techStack || 'Terraform, Docker, Kubernetes, Prometheus'}            [GitHub Repo Link] | [Live Architecture / Demo]
• Designed multi-tier, fault-tolerant cloud architecture adhering to Well-Architected Framework principles; configured VPC peering, ALB load balancers, and automated database failover, reducing infrastructure operating costs by [20-35%].
• Implemented automated GitOps CI/CD delivery with end-to-end integration tests and Prometheus monitoring, maintaining zero-downtime rolling deployments and sub-[150ms] p95 API response latency.`,
          exampleCompleted: `CloudScale Microservices Platform | Terraform, Docker, Kubernetes, AWS, Prometheus    github.com/alex/cloudscale | cloudscale.demo.io
• Designed multi-tier, fault-tolerant cloud architecture adhering to AWS Well-Architected Framework; configured VPC peering, ALB load balancers, and automated RDS PostgreSQL failover, reducing infrastructure operating costs by 28%.
• Implemented automated GitOps CI/CD delivery with end-to-end integration tests and Prometheus monitoring, maintaining zero-downtime rolling deployments and sub-120ms p95 API response latency.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Certifications',
          section: 'Certifications & Honors Section',
          description: 'Formatted for the Certifications section of your resume with verifiable transcript IDs.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Validated expertise in ${s1}, ${s2}, and ${s3}; deployed production-grade capstone architectures featuring automated scaling and security compliance.`,
          exampleCompleted: `${name} | ${org} (Credential ID: CRED-88912, Earned: Nov 2025, Score: 920/1000) — Validated expertise in ${s1}, ${s2}, and ${s3}; deployed production-grade capstone architectures featuring automated scaling and security compliance.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / LinkedIn Headline',
          description: '1-2 sentence high-signal summary demonstrating practical cloud engineering capability.',
          template: `${role} credentialed in ${name}; experienced in Infrastructure-as-Code (${techStack || 'Terraform, Docker, Kubernetes'}) and designing resilient, zero-downtime cloud systems.`,
          exampleCompleted: `${role} credentialed in ${name}; experienced in Infrastructure-as-Code (Terraform, Docker, Kubernetes) and designing resilient, zero-downtime cloud systems.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'System Availability & Uptime',
          metricType: 'throughput',
          examples: ['99.95% uptime', '99.9% SLA availability', 'zero unplanned downtime across 6 months'],
          hint: 'Calculate uptime percentage based on monitoring logs or health check reports.',
        },
        {
          label: 'Latency & Response Time',
          metricType: 'latency',
          examples: ['reduced p95 latency by 45%', 'sub-120ms API response time', 'cut cold start time from 2.4s to 350ms'],
          hint: 'Measure response latency using load testing tools like k6, Apache Bench, or AWS CloudWatch.',
        },
        {
          label: 'Infrastructure Cost Optimization',
          metricType: 'cost',
          examples: ['reduced AWS bill by 32%', 'saved $400/month via Spot instances and S3 lifecycle rules'],
          hint: 'Document AWS/cloud billing reductions achieved through rightsizing or serverless architecture.',
        },
        {
          label: 'Throughput & Scalability',
          metricType: 'scale',
          examples: ['handled 5,000+ concurrent requests/sec', 'scaled seamlessly from 2 to 20 pod replicas under load'],
          hint: 'Stress test your deployment with simulated traffic and record autoscaling capacity.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Official Credly / Issuer Verification Link',
          description: 'Direct digital badge transcript URL verifiable by recruiters in 1 click without logins.',
          type: 'credential_badge',
          recommendation: 'Add hyperlinked Credly or official certification portal badge in the Certifications section.',
        },
        {
          title: 'Public GitHub Repo with Terraform / IaC Modules',
          description: 'Clean repository containing modular IaC scripts, README with architecture diagrams, and mock variables.',
          type: 'code_repo',
          recommendation: 'Store clean Terraform configurations (.tf) with remote state locking and pre-commit hooks.',
        },
        {
          title: 'Automated CI/CD Workflow (.github/workflows)',
          description: 'Production YAML workflow demonstrating automated linting, security scans, and deployment testing.',
          type: 'live_deployment',
          recommendation: 'Include a green passing GitHub Actions build badge at the top of your repository README.',
        },
        {
          title: 'Architecture Diagram & Incident Defense Notes',
          description: 'Exported draw.io or Excalidraw architecture diagram illustrating traffic flow and security boundaries.',
          type: 'documentation',
          recommendation: 'Embed an architecture flowchart in your repository to prove end-to-end systems understanding.',
        },
      ];

      interviewDefense = [
        {
          question: `How did you apply ${name} principles to a real-world project, and what trade-offs did you make?`,
          starAnswerOutline: {
            situation: 'Needed to deploy a multi-service web backend with strict uptime requirements on a budget.',
            task: 'Design a resilient architecture without overpaying for enterprise-tier managed services.',
            action: `Applied ${s1} and ${s2}; configured ALB health checks, containerized microservices in Docker, and provisioned multi-AZ PostgreSQL failovers using Terraform.`,
            result: 'Maintained 99.95% uptime during load spikes, while keeping total cloud cost under $30/month using auto-scaling triggers.',
          },
          keyVocabulary: ['VPC Peering', 'IAM Least Privilege', 'Multi-AZ Replication', 'Auto Scaling Groups', 'Health Checks'],
        },
        {
          question: 'If this service experiences a sudden 10x traffic surge, how does your architecture respond?',
          starAnswerOutline: {
            situation: 'Traffic unexpectedly spikes from 100 req/sec to 1,000+ req/sec due to an external event.',
            task: 'Prevent 504 gateway timeouts and database connection pool exhaustion.',
            action: 'Configured Horizontal Pod Autoscaler based on CPU and request latency thresholds, coupled with Redis caching for read-heavy endpoints.',
            result: 'Absorbed traffic surge within 45 seconds without dropped packets or database degradation.',
          },
          keyVocabulary: ['HPA', 'Circuit Breakers', 'Redis Cache-Aside', 'Connection Pooling', 'Rate Limiting'],
        },
      ];
      break;

    case 'web':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Work / Internship',
          section: 'Professional Experience or Technical Projects',
          description: 'Google XYZ format for software engineering and web development.',
          template: `Engineered responsive, accessible single-page web application in [React/Next.js/TypeScript] with [State Management: Context API/Redux]; implemented optimized client-side caching, automated unit testing, and component modularity, elevating Lighthouse accessibility to [98/100] and cutting initial page load time by [45%].`,
          exampleCompleted: `Engineered responsive, accessible single-page web application in React and TypeScript with Context API and Tailwind CSS; implemented optimized client-side caching, automated unit testing, and component modularity, elevating Lighthouse accessibility to 98/100 and cutting initial page load time by 48%.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Portfolio Project',
          section: 'Technical Projects (Full Portfolio Block)',
          description: 'Structured 2-bullet project block for front-end, back-end, and full-stack projects.',
          template: `[Project Name] | ${techStack || 'React, TypeScript, Node.js, PostgreSQL, Tailwind CSS'}      [Live App Link] | [GitHub Repo]
• Architected full-stack web application featuring secure JWT authentication, RESTful API endpoints, and relational database schema design, handling [500+ active user sessions] with sub-[100ms] server response time.
• Authored comprehensive unit and integration test suites using [Jest / React Testing Library / PyTest]; achieved [90%+] test coverage and configured automated GitHub Actions CI deployment to Vercel/Render.`,
          exampleCompleted: `HireFlo Career Intelligence Platform | React, TypeScript, Tailwind, Node.js, Vite    hireflo.app | github.com/alex/hireflo
• Architected full-stack web application featuring secure JWT authentication, RESTful API endpoints, and relational database schema design, handling 650+ active user sessions with sub-90ms server response time.
• Authored comprehensive unit and integration test suites using Jest and React Testing Library; achieved 94% test coverage and configured automated GitHub Actions CI deployment to Vercel.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Certifications',
          section: 'Certifications & Honors Section',
          description: 'Clean, verified certification line with digital verification transcript link.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Verified competencies in ${s1}, ${s2}, and ${s3}; built production-standard portfolio projects adhering to modern web performance standards.`,
          exampleCompleted: `${name} | ${org} (Credential ID: META-FE-2026, Earned: Jan 2026, Score: 98%) — Verified competencies in ${s1}, ${s2}, and ${s3}; built production-standard portfolio projects adhering to modern web performance standards.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'Concise, high-impact profile statement demonstrating real engineering rigor.',
          template: `${role} credentialed in ${name}; proficient in ${techStack || 'React, TypeScript, REST APIs, and automated testing'}, with a focus on web performance, accessibility, and clean architecture.`,
          exampleCompleted: `${role} credentialed in ${name}; proficient in React, TypeScript, REST APIs, and automated testing, with a focus on web performance, accessibility, and clean architecture.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Lighthouse Performance & Accessibility',
          metricType: 'accuracy',
          examples: ['Lighthouse score 98/100', 'WCAG 2.1 AA accessible', 'zero contrast or accessibility violations'],
          hint: 'Run Chrome DevTools Lighthouse audit on your deployed live app and cite verified scores.',
        },
        {
          label: 'Page Load Speed & Core Web Vitals',
          metricType: 'latency',
          examples: ['reduced initial load time from 3.2s to 1.1s', 'FCP < 0.8s and LCP < 1.4s', 'cut bundle size by 42% via code-splitting'],
          hint: 'Measure bundle size and Core Web Vitals using Webpack Bundle Analyzer or Lighthouse.',
        },
        {
          label: 'Automated Test Coverage',
          metricType: 'coverage',
          examples: ['92% unit test coverage', '45+ passing Jest integration tests', 'zero regression issues over 6 sprints'],
          hint: 'Run Jest or Vitest with `--coverage` and record genuine test branch coverage percentages.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Live Deployed Web Application URL',
          description: 'Interactive demo deployed on Vercel, Netlify, or Render with working authentication and mock data.',
          type: 'live_deployment',
          recommendation: 'Include a working live preview link so recruiters can test UI interactions directly.',
        },
        {
          title: 'Public GitHub Repo with Clean Commit History',
          description: 'Well-structured repository with clear folder hierarchy, type definitions, and semantic commits.',
          type: 'code_repo',
          recommendation: 'Avoid single "initial commit" uploads; push iterative feature branches and PRs.',
        },
        {
          title: 'Automated Unit & Component Test Suite',
          description: 'Passing Jest, Vitest, or React Testing Library tests covering user workflows and edge cases.',
          type: 'documentation',
          recommendation: 'Highlight test commands (`npm test`) in your README and display a green CI badge.',
        },
        {
          title: 'Official Credential / Course Transcript Badge',
          description: 'Coursera, freeCodeCamp, or issuer verification link confirming completion of core coursework.',
          type: 'credential_badge',
          recommendation: 'Include direct certificate link in the Certifications header.',
        },
      ];

      interviewDefense = [
        {
          question: 'How do you optimize rendering performance in a data-heavy application?',
          starAnswerOutline: {
            situation: 'Rendering a list of 1,000+ items caused noticeable UI lag and frame drops during user scrolling.',
            task: 'Achieve smooth 60fps scrolling without consuming excessive client memory.',
            action: 'Implemented virtualized list rendering (windowing), memoized expensive calculations with useMemo, and debounced search filter inputs.',
            result: 'Reduced DOM node count by 90% and eliminated input stutter, cutting re-render time from 180ms to <12ms.',
          },
          keyVocabulary: ['Virtualization', 'Memoization', 'Debouncing', 'Profiler API', 'Reconciliation'],
        },
        {
          question: 'How do you approach accessibility (a11y) and responsive layout architecture across diverse devices?',
          starAnswerOutline: {
            situation: 'Initial site design failed mobile touch targets and had low contrast ratios for accessibility compliance.',
            task: 'Achieve full WCAG 2.1 AA compliance across mobile, tablet, and desktop viewports.',
            action: 'Refactored CSS layout using fluid typography, implemented semantic HTML landmarks, ensured keyboard-only focus navigation, and verified color contrast with automated axe-core scans.',
            result: 'Elevated Lighthouse accessibility score from 68 to 98 and expanded usable touch target sizes to 48x48px across all mobile screens.',
          },
          keyVocabulary: ['WCAG 2.1 AA', 'Semantic HTML', 'Fluid Typography', 'Axe-Core', 'Keyboard Focus Management'],
        },
      ];
      break;

    case 'ml':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Work / Internship',
          section: 'Experience or Machine Learning Projects',
          description: 'Quantifiable ML bullet highlighting model accuracy, dataset scale, and inference speed.',
          template: `Engineered end-to-end predictive machine learning pipeline using [PyTorch / Scikit-Learn / XGBoost] on [Dataset/Domain: ${s1}]; performed feature engineering, automated cross-validation, and hyperparameter tuning, achieving [0.91+ F1-Score / Top X% Benchmark] and reducing inference latency to [<50ms per request].`,
          exampleCompleted: `Engineered end-to-end predictive machine learning pipeline using PyTorch and Scikit-Learn on tabular financial fraud datasets; performed feature engineering, automated cross-validation, and hyperparameter tuning, achieving 0.94 F1-Score and reducing inference latency to 38ms per request.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Portfolio Project',
          section: 'Technical Projects (ML & Data Engineering Block)',
          description: '2-bullet project entry with data pipeline, model training, and API serving.',
          template: `[ML Project Title] | ${techStack || 'Python, PyTorch, Scikit-Learn, FastAPI, Docker, MLflow'}      [Kaggle/GitHub Link] | [Live Demo / API]
• Ingested, cleaned, and normalized [100k+ data points] across distributed sources; engineered [N domain features] and evaluated ensemble models (XGBoost, LightGBM, Random Forest), improving baseline predictive accuracy by [18%].
• Packaged trained model into production REST inference microservice using FastAPI and Docker; instrumented automated data drift alerts and structured logging, handling [200+ requests/sec].`,
          exampleCompleted: `FraudGuard Real-Time Anomaly Engine | Python, PyTorch, FastAPI, Docker, MLflow    github.com/alex/fraudguard | api.fraudguard.demo
• Ingested, cleaned, and normalized 250,000+ financial transaction records; engineered 35 statistical features and evaluated ensemble models (XGBoost, LightGBM), improving baseline predictive accuracy by 22%.
• Packaged trained model into production REST inference microservice using FastAPI and Docker; instrumented automated data drift alerts and structured logging, handling 320 requests/sec with sub-45ms latency.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Certifications',
          section: 'Certifications & Honors Section',
          description: 'ATS-optimized certification line with verification link.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Validated proficiency in ${s1}, ${s2}, and ${s3}; authored reproducible end-to-end data pipelines and machine learning evaluation notebooks.`,
          exampleCompleted: `${name} | ${org} (Credential ID: ML-PRO-9921, Earned: Oct 2025, Score: 94%) — Validated proficiency in ${s1}, ${s2}, and ${s3}; authored reproducible end-to-end data pipelines and machine learning evaluation notebooks.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'Executive hook demonstrating applied data science and production MLOps judgment.',
          template: `${role} credentialed in ${name}; experienced in ${techStack || 'Python, PyTorch, data preprocessing, and model deployment'} with a track record of delivering measurable predictive accuracy.`,
          exampleCompleted: `${role} credentialed in ${name}; experienced in Python, PyTorch, data preprocessing, and model deployment with a track record of delivering measurable predictive accuracy.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Model Accuracy & Performance Metrics',
          metricType: 'accuracy',
          examples: ['0.92 ROC-AUC', '94.2% F1-score', 'reduced Root Mean Squared Error (RMSE) by 28%'],
          hint: 'Report metrics on held-out test splits; never cite training set accuracy.',
        },
        {
          label: 'Dataset Scale & Processing Volume',
          metricType: 'scale',
          examples: ['processed 500,000+ rows', 'analyzed 2.5GB multi-modal dataset', 'engineered 40+ statistical features'],
          hint: 'State data volume, row counts, or feature dimensionalities processed.',
        },
        {
          label: 'Inference Speed & Serving Latency',
          metricType: 'latency',
          examples: ['sub-40ms inference latency', '250 predictions/second throughput', 'quantized model size by 65% with <1% accuracy loss'],
          hint: 'Benchmark API endpoint response time under concurrent traffic.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Public Kaggle Notebook / GitHub Repository',
          description: 'Jupyter notebook with clean Markdown commentary, exploratory data analysis plots, and validation curves.',
          type: 'code_repo',
          recommendation: 'Include clear data visualizations (confusion matrix, ROC curve, feature importances).',
        },
        {
          title: 'Interactive Model Demo (Streamlit / Gradio / HuggingFace Spaces)',
          description: 'Live interactive UI where hiring managers can test custom inputs and view real-time model predictions.',
          type: 'live_deployment',
          recommendation: 'Deploy a free Streamlit or HuggingFace Space and link it directly in your project header.',
        },
        {
          title: 'Official Credential & Transcript Verification URL',
          description: 'Coursera, DeepLearning.AI, or issuer digital badge verifying completed coursework and capstone project.',
          type: 'credential_badge',
          recommendation: 'Include direct verification link in your certifications section.',
        },
        {
          title: 'Model Evaluation & Experiment Tracking Dashboard',
          description: 'Weights & Biases, MLflow, or TensorBoard run tracking logs showing loss convergence and hyperparameter tuning.',
          type: 'documentation',
          recommendation: 'Link public MLflow or W&B workspace demonstrating methodical experimentation.',
        },
      ];

      interviewDefense = [
        {
          question: 'How did you prevent data leakage and overfitting in your modeling pipeline?',
          starAnswerOutline: {
            situation: 'High initial cross-validation accuracy risked overfitting to temporal or target-correlated artifacts.',
            task: 'Establish an airtight validation strategy reflecting real production inference conditions.',
            action: 'Implemented time-series/stratified K-fold cross-validation, strictly performed feature scaling and encoding inside pipeline folds, and maintained an untouched holdout test set.',
            result: 'Test set evaluation matched cross-validation scores within 1.2%, ensuring reliable production deployment without performance degradation.',
          },
          keyVocabulary: ['Data Leakage', 'Stratified K-Fold', 'Cross-Validation', 'Regularization', 'Feature Importance'],
        },
        {
          question: 'How would you debug a machine learning model whose production performance degrades over time?',
          starAnswerOutline: {
            situation: 'A production classification model experienced a 12% drop in F1-score 3 months after deployment.',
            task: 'Identify the root cause of degradation and restore predictive accuracy.',
            action: 'Analyzed feature distributions using Kolmogorov-Smirnov tests to detect covariate shift, discovered schema changes in upstream user input data, and updated preprocessing pipelines with retrained weights.',
            result: 'Restored F1-score to 0.94 and automated continuous data-drift monitoring alerts via Prometheus.',
          },
          keyVocabulary: ['Data Drift', 'Concept Drift', 'Covariate Shift', 'KS Test', 'Retraining Trigger'],
        },
      ];
      break;

    case 'security':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Work / Internship',
          section: 'Security / Systems Experience',
          description: 'Quantifiable security bullet demonstrating threat mitigation, vulnerability audit, and network defense.',
          template: `Conducted comprehensive network vulnerability audits and security posture assessments adhering to [NIST CSF / OWASP Top 10]; identified and remediated [X critical CVEs/misconfigurations] across [Linux/Cloud/Network infrastructure], hardening system attack surface and enforcing [Zero-Trust / Least-Privilege] access policies.`,
          exampleCompleted: `Conducted comprehensive network vulnerability audits and security posture assessments adhering to NIST CSF and OWASP Top 10; identified and remediated 14 critical CVEs and misconfigurations across Linux and cloud infrastructure, hardening system attack surface and enforcing Zero-Trust access policies.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Portfolio Project',
          section: 'Technical Projects (Security Lab & Defense Block)',
          description: '2-bullet project entry with penetration testing, packet analysis, and SIEM logging.',
          template: `[Enterprise Security & Vulnerability Lab] | ${techStack || 'Wireshark, Nmap, Snort, Linux, Python, Splunk'}      [GitHub / Lab Writeup Link]
• Configured segmented network lab with Snort IDS/IPS rules, iptables firewall filtering, and automated Nmap vulnerability sweeps; analyzed packet captures in Wireshark to isolate simulated malicious payloads.
• Automated log ingestion and alert detection via Python scripts integrated with SIEM dashboard, reducing mean-time-to-detect (MTTD) simulated intrusion attempts to under [2 minutes].`,
          exampleCompleted: `Enterprise Security & Threat Monitoring Lab | Wireshark, Nmap, Snort, Linux, Python, Splunk    github.com/alex/security-lab
• Configured segmented network lab with Snort IDS/IPS rules, iptables firewall filtering, and automated Nmap vulnerability sweeps; analyzed packet captures in Wireshark to isolate simulated malicious payloads.
• Automated log ingestion and alert detection via Python scripts integrated with SIEM dashboard, reducing mean-time-to-detect (MTTD) simulated intrusion attempts to under 90 seconds.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Certifications',
          section: 'Certifications & Honors Section',
          description: 'ATS-certified security credential line.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Validated practical competencies in ${s1}, ${s2}, and ${s3}; demonstrated hands-on threat identification, cryptographic security, and incident remediation.`,
          exampleCompleted: `${name} | ${org} (Credential ID: SEC-PLUS-8821, Earned: Aug 2025, Score: 810/900) — Validated practical competencies in ${s1}, ${s2}, and ${s3}; demonstrated hands-on threat identification, cryptographic security, and incident remediation.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'High-signal security engineering hook.',
          template: `${role} credentialed in ${name}; specialized in ${techStack || 'network security, vulnerability remediation, and automated threat monitoring'}, with rigorous adherence to security governance frameworks.`,
          exampleCompleted: `${role} credentialed in ${name}; specialized in network security, vulnerability remediation, and automated threat monitoring, with rigorous adherence to security governance frameworks.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Vulnerabilities Identified & Remediated',
          metricType: 'scale',
          examples: ['identified and remediated 12 critical CVEs', 'zero high-severity vulnerabilities remaining post-audit'],
          hint: 'Document counts of sanitized vulnerabilities discovered during lab exercises or CTFs.',
        },
        {
          label: 'Detection & Response Time (MTTD / MTTR)',
          metricType: 'latency',
          examples: ['reduced incident detection time to <2 minutes', 'automated containment within 30 seconds'],
          hint: 'Benchmark how quickly your automated scripts or alerts detect simulated port scans or intrusions.',
        },
        {
          label: 'Compliance & Policy Enforcement Coverage',
          metricType: 'coverage',
          examples: ['100% compliance across CIS Benchmarks', 'enforced MFA and RBAC for 45 enterprise accounts', 'audited 120 security groups'],
          hint: 'Cite compliance percentages against recognized frameworks like CIS, ISO 27001, or NIST.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Sanitized Security Audit / Penetration Testing Report',
          description: 'Professional PDF or GitHub Markdown report documenting scope, executive summary, methodology, and CVSS scores.',
          type: 'documentation',
          recommendation: 'Provide a structured remediation report proving ability to communicate technical risk to stakeholders.',
        },
        {
          title: 'Public CTF Writeups or TryHackMe / HackTheBox Profile',
          description: 'Public profile or blog writeups detailing methodology across web exploitation, cryptography, or reverse engineering.',
          type: 'code_repo',
          recommendation: 'Link verified profile showing rank or completed challenge rooms.',
        },
        {
          title: 'Official Credential Badge & Verification Transcript',
          description: 'CompTIA CertMetrics, Credly, or vendor verification link confirmable without sign-in.',
          type: 'credential_badge',
          recommendation: 'Include direct verification transcript link with credential expiration date.',
        },
        {
          title: 'Defensive Infrastructure Automation Scripts',
          description: 'GitHub repository containing automated Bash/Python scripts for firewall configuration, log rotation, and intrusion detection.',
          type: 'live_deployment',
          recommendation: 'Provide sanitized infrastructure configuration code with safe mock environments.',
        },
      ];

      interviewDefense = [
        {
          question: 'Walk me through how you prioritize remediating multiple discovered vulnerabilities.',
          starAnswerOutline: {
            situation: 'A security scan surfaces 50+ vulnerabilities across services, ranging from info-level to critical.',
            task: 'Establish remediation priority without halting active product development.',
            action: 'Evaluated CVSS base score combined with exploitability (public exploit in the wild), asset criticality (internal vs public-facing), and compensating controls.',
            result: 'Remediated 100% of exploitable public-facing vulnerabilities within 24 hours while scheduling lower-severity items in routine sprints.',
          },
          keyVocabulary: ['CVSS 3.1', 'Exploitability', 'Threat Modeling', 'Compensating Controls', 'Least Privilege'],
        },
        {
          question: 'How do you balance strong security controls against developer velocity and business convenience?',
          starAnswerOutline: {
            situation: 'Engineering teams complained that strict branch protection rules and security scanning were blocking emergency hotfixes.',
            task: 'Maintain non-negotiable security safeguards without causing deployment bottlenecks.',
            action: 'Shifted security left into pre-commit hooks for instant local feedback, created automated bypass protocols requiring dual-signoff for emergencies, and cached static analysis scans in CI.',
            result: 'Reduced CI pipeline run duration by 40% while achieving 100% vulnerability scanning compliance.',
          },
          keyVocabulary: ['Shift Left', 'Pre-Commit Hooks', 'Dual-Signoff', 'Static Analysis (SAST)', 'Friction Reduction'],
        },
      ];
      break;

    case 'event':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Hackathon / Competition',
          section: 'Honors, Competitions, or Technical Projects',
          description: 'Competitive achievement bullet citing verified rank, team size, and rapid MVP delivery.',
          template: `Ranked [Top 1% / Finalist / Winner] among [10,000+ national participants] in [${name}]; architected and delivered [Product Name] using [Tech Stack: ${techStack}] within a [24/36-hour sprint], pitching working prototype before senior industry engineering jury and receiving [PPI / Cash Award / Fast-Track Interview].`,
          exampleCompleted: `Ranked National Finalist (Top 0.5% among 8,500+ teams) in ${name}; architected and delivered distributed telemetry platform using Go, React, and Redis within a 36-hour sprint, pitching working prototype before engineering jury and receiving pre-placement interview (PPI).`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Hackathon Project',
          section: 'Technical Projects (Hackathon Build Block)',
          description: 'Complete project entry for the hackathon prototype with architecture details.',
          template: `[Hackathon Project Title] | ${techStack || 'React, TypeScript, Node.js, Redis, Docker'}      [GitHub Repo Link] | [Live Prototype]
• Architected real-time prototype under strict [24/36-hour hackathon constraints]; engineered [Core Feature: asynchronous messaging / API processing / algorithmic matching] handling [simulated peak load of 1,000+ req/sec].
• Integrated [Sponsor Cloud/API Services: AWS/Azure/Stripe]; pitched working live demonstration and architectural design to jury, advancing to [National Grand Finale / Winning Track Prize].`,
          exampleCompleted: `CivicPulse Disaster Response Platform | React, TypeScript, Node.js, Redis, Docker    github.com/alex/civicpulse | civicpulse.demo
• Architected real-time prototype under strict 36-hour hackathon constraints; engineered asynchronous geolocation dispatch handling simulated peak load of 1,200 req/sec with sub-80ms message latency.
• Integrated AWS Lambda and OpenStreetMap APIs; pitched working live demonstration and architectural design to jury, advancing to National Grand Finale among 4,000+ competing submissions.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Honors & Awards',
          section: 'Awards & Honors Section',
          description: 'Concise award entry for the honors section.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — [National Finalist / Winner / Top Rank] among [N participating teams] across [Software Development Track]; awarded [PPI / Direct Interview / Recognition].`,
          exampleCompleted: `${name} | ${org} (Credential ID: SIH-2025-FIN, Earned: Sep 2025, Score: Top 1%) — National Finalist (Top 1% of 12,000 teams) across Software Development Track; awarded pre-placement interview (PPI) opportunity.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'High-energy hook demonstrating rapid execution and competitive problem solving.',
          template: `${role} and ${name} Finalist; proven track record of architecting and shipping production-quality software under rapid development sprints.`,
          exampleCompleted: `${role} and ${name} Finalist; proven track record of architecting and shipping production-quality software under rapid development sprints.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Competition Placement & Percentile',
          metricType: 'scale',
          examples: ['Top 1% nationally', 'Rank 42 out of 8,500 teams', 'Track Winner out of 450 submissions'],
          hint: 'Cite official leaderboard ranking or verified certificate placement.',
        },
        {
          label: 'Prototype Execution Speed & Scale',
          metricType: 'throughput',
          examples: ['built in 36-hour sprint', 'handled 1,000 simulated requests/sec', 'sub-100ms response time during live demo'],
          hint: 'Highlight what was achieved within the strict hackathon time limit.',
        },
        {
          label: 'User Adoption & Demo Throughput',
          metricType: 'scale',
          examples: ['onboarded 120 demo testers during finale', 'processed 500+ real-time geolocation queries', 'sub-90ms round-trip latency'],
          hint: 'Quantify live jury interactions, real-time requests processed, or user signups during the showcase.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Public GitHub Repo with Working Code & Demo GIF',
          description: 'Repository containing full source code, clear setup instructions, and an animated demo GIF showing features.',
          type: 'code_repo',
          recommendation: 'Add a 1-minute Loom video demo or animated GIF in the README showing the product in action.',
        },
        {
          title: 'Official Certificate / Finalist Verification Letter',
          description: 'Digital certificate or official email confirming selection, team name, and rank.',
          type: 'credential_badge',
          recommendation: 'Link verification URL or PDF on your Google Drive / LinkedIn honors section.',
        },
        {
          title: 'Live Interactive Web / Mobile Deployment',
          description: 'Working deployment hosted on Vercel, Netlify, or Expo snack where recruiters can interact with the app.',
          type: 'live_deployment',
          recommendation: 'Provide direct link with pre-populated demo login credentials.',
        },
        {
          title: 'Pitch Deck & Architecture Documentation',
          description: 'Slide deck or Notion architecture RFC explaining problem formulation, system components, and future viability.',
          type: 'documentation',
          recommendation: 'Host a public view link to your presentation slides and system diagrams.',
        },
      ];

      interviewDefense = [
        {
          question: 'What was your specific technical contribution during this hackathon, and how did your team resolve conflicts?',
          starAnswerOutline: {
            situation: 'Our 4-person team had 36 hours to build a working prototype with unfamiliar APIs.',
            task: 'I served as backend lead responsible for API architecture and database schema design.',
            action: 'Defined clear OpenAPI contracts in the first 2 hours so frontend and backend could build in parallel; when integration failed at hour 28, led root-cause debugging across CORS headers and JSON payload formatting.',
            result: 'Delivered zero-error live presentation on stage; jury commended the reliability of our live demo over slide decks.',
          },
          keyVocabulary: ['API Contracts', 'Rapid Prototyping', 'Root-Cause Debugging', 'MVP Scoping', 'Timebox Management'],
        },
        {
          question: 'How did you ensure architectural scalability and reliability under strict hackathon deadlines?',
          starAnswerOutline: {
            situation: 'Jury evaluations required concurrent live stress-testing from multiple judging devices.',
            task: 'Prevent server crashes and high latency during live demos.',
            action: 'Implemented stateless API design with Redis caching layer and decoupled heavy asynchronous tasks into background queues.',
            result: 'Maintained 100% uptime with zero latency degradation during concurrent judging rounds.',
          },
          keyVocabulary: ['Stateless Architecture', 'Redis Cache-Aside', 'Graceful Degradation', 'Load Testing', 'API Contracts'],
        },
      ];
      break;

    case 'opensource':
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Open Source',
          section: 'Open Source Experience / Professional Experience',
          description: 'Highly prestigious open-source contributor bullet citing merged pull requests and codebase impact.',
          template: `Spearheaded [Subsystem/Feature in ${s1}] development as a selected contributor in [${name}] with [Mentoring Org: ${org}]; authored [N] merged production pull requests, improving [performance/memory/testing] by [X%] across [Y] repository modules.`,
          exampleCompleted: `Spearheaded distributed logging subsystem development as a selected contributor in ${name} with Linux Foundation; authored 8 merged production pull requests in Go, improving log serialization speed by 35% across core repository modules.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Open Source Project',
          section: 'Technical Projects (Open Source Contributor Block)',
          description: 'Structured block highlighting upstream merged code, RFCs, and test suites.',
          template: `[Upstream Project Name] — Core Open Source Contributor | ${techStack || 'Go, C++, Python, Git, GitHub Actions'}      [Merged PRs Link] | [Project Repo]
• Contributed [N] merged pull requests to upstream production codebase used by [thousands of developers]; designed and implemented [Feature/Bugfix] conforming to strict repository architectural guidelines.
• Authored comprehensive integration tests and updated technical documentation; collaborated asynchronously with international maintainers across rigorous code reviews.`,
          exampleCompleted: `Kubernetes / CNCF Core Tooling — Open Source Contributor | Go, Kubernetes, GitHub Actions    github.com/kubernetes/tooling/pulls?q=author:alex
• Contributed 6 merged pull requests to upstream production codebase used by thousands of enterprise clusters; implemented automated node taint reconciliation conforming to strict repository invariants.
• Authored comprehensive integration tests achieving 95% branch coverage; collaborated asynchronously with international maintainers across rigorous code reviews.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Fellowship & Honors',
          section: 'Fellowships & Open Source Section',
          description: 'Prestigious fellowship line with archive verification link.',
          template: `${name} Contributor | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Completed [12/22-week] production engineering mentorship; authored [N] upstream merged pull requests and technical design RFCs.`,
          exampleCompleted: `${name} Contributor | ${org} (Credential ID: GSOC-2025-ALEX, Earned: Sep 2025, Score: Completed) — Completed 12-week production engineering mentorship; authored 8 upstream merged pull requests and technical design RFCs.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'High-signal summary demonstrating mature collaborative engineering skills.',
          template: `${role} and ${name} Alum; experienced in open-source systems architecture, rigorous code reviews, and contributing to large-scale distributed codebases.`,
          exampleCompleted: `${role} and ${name} Alum; experienced in open-source systems architecture, rigorous code reviews, and contributing to large-scale distributed codebases.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Merged Pull Requests & Code Volume',
          metricType: 'scale',
          examples: ['8 merged pull requests', '1,500+ lines of tested code', 'resolved 12 community issues'],
          hint: 'Link your GitHub filtered PR search: `is:pr is:merged author:YOUR_HANDLE`.',
        },
        {
          label: 'Performance & Optimization Metric',
          metricType: 'latency',
          examples: ['reduced memory allocation by 28%', 'cut test suite execution time by 40%', 'boosted throughput by 2.2x'],
          hint: 'Cite benchmark measurements documented in your merged PR descriptions.',
        },
        {
          label: 'Code Review & Community Impact',
          metricType: 'scale',
          examples: ['addressed 40+ review comments across 6 iterations', 'authored RFC adopted by 5 core maintainers', 'resolved 14 tracked GitHub issues'],
          hint: 'Document code review iteration velocity, RFC consensus, and closed community issue tickets.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Direct Link to Filtered Merged Upstream PRs',
          description: 'GitHub URL showing only your merged PRs on the official organization repository.',
          type: 'pr_evidence',
          recommendation: 'Provide link in the format: `github.com/org/repo/pulls?q=is:pr+is:merged+author:USERNAME`.',
        },
        {
          title: 'Final Work Submission Gist / Project Wrap-up',
          description: 'Detailed public report summarizing architectural goals, weekly milestones, merged PRs, and future roadmap.',
          type: 'documentation',
          recommendation: 'Host a public Markdown report on GitHub Gist or your personal portfolio.',
        },
        {
          title: 'Upstream Code Commit History & GitHub Profile',
          description: 'Public Git commit history showing atomic, signed commits complying with repository guidelines.',
          type: 'code_repo',
          recommendation: 'Pin the repository on your GitHub profile with your contributor badge.',
        },
        {
          title: 'Official Program Archive & Fellowship Certificate',
          description: 'Official link on program archive (e.g., summerofcode.withgoogle.com/archive) proving successful completion.',
          type: 'credential_badge',
          recommendation: 'Link the official program archive listing your mentor and accepted proposal.',
        },
      ];

      interviewDefense = [
        {
          question: 'How did you navigate and understand a large, unfamiliar open-source codebase?',
          starAnswerOutline: {
            situation: 'The repository had over 200,000 lines of code across 15 packages with minimal beginner documentation.',
            task: 'Identify the exact subsystem responsible for the bug without breaking dependent modules.',
            action: 'Set up local debug builds with verbose logging, traced call stacks from entry points to handler logic, and wrote failing unit tests reproducing the issue before writing a single line of production code.',
            result: 'Submitted a targeted 40-line patch with 3 test cases that maintainers reviewed and merged within 48 hours.',
          },
          keyVocabulary: ['Codebase Archaeology', 'Regression Testing', 'Asynchronous Communication', 'RFC', 'Upstream Alignment'],
        },
        {
          question: 'How did you handle critical maintainer feedback or requested architectural changes during code review?',
          starAnswerOutline: {
            situation: 'A senior maintainer requested a complete refactoring of my proposed concurrency model after 2 weeks of development.',
            task: 'Incorporate feedback and refactor without compromising the program delivery deadline.',
            action: 'Scheduled an asynchronous discussion on the project Discord/RFC thread, prototyped the alternative channel-based pattern in an isolated branch, and demonstrated a 15% reduction in lock contention.',
            result: 'The maintainer approved the patch with distinction, and the design pattern became standard across adjacent packages.',
          },
          keyVocabulary: ['Code Review Rigor', 'Consensus Building', 'Concurrency Models', 'Lock Contention', 'Backward Compatibility'],
        },
      ];
      break;

    case 'embedded':
    default:
      formats = [
        {
          id: 'xyz_bullet',
          title: 'Action-Impact Bullet (XYZ Formula)',
          badge: 'Work / Internship',
          section: 'Professional Experience or Core Projects',
          description: 'Engineering bullet emphasizing technical modeling, simulation, and hardware/software optimization.',
          template: `Modeled, simulated, and optimized [System/Algorithm in ${s1}] using [${techStack || 'MATLAB, Simulink, C/C++'}]; verified mathematical stability and sensor telemetry, reducing convergence time by [30-45%] and achieving [99%+] operational accuracy against hardware benchmarks.`,
          exampleCompleted: `Modeled, simulated, and optimized digital control systems using MATLAB, Simulink, and C++; verified mathematical stability and sensor telemetry, reducing convergence time by 38% and achieving 99.2% operational accuracy against hardware benchmarks.`,
        },
        {
          id: 'project_entry',
          title: 'Full Featured Project Entry',
          badge: 'Technical Project',
          section: 'Technical Projects Block',
          description: '2-bullet technical project block.',
          template: `[Engineering Project Title] | ${techStack || 'MATLAB, Simulink, C/C++, Real-Time Hardware'}      [Project Repo / Report Link]
• Designed mathematical model and control loop algorithm in [Tool/Language]; executed hardware-in-the-loop (HIL) simulations validating response times under dynamic load perturbations.
• Automated data acquisition and telemetry visualization scripts in Python/MATLAB, reducing manual testing and signal calibration cycles by [60%].`,
          exampleCompleted: `Autonomous Rover Navigation & Telemetry System | MATLAB, Simulink, C++, Python, ROS    github.com/alex/rover-control
• Designed mathematical model and closed-loop control algorithm in Simulink; executed hardware-in-the-loop (HIL) simulations validating response times under dynamic load perturbations.
• Automated data acquisition and telemetry visualization scripts in Python and MATLAB, reducing manual testing and signal calibration cycles by 65%.`,
        },
        {
          id: 'cert_line',
          title: 'Official Credential Line (ATS-Certified)',
          badge: 'Certifications',
          section: 'Certifications & Honors Section',
          description: 'Clean verified credential entry.',
          template: `${name} | ${org} (Credential ID: [CREDENTIAL_ID], Earned: [DATE_EARNED], Score: [SCORE]) — Certified competency in ${s1}, ${s2}, and ${s3}; demonstrated rigorous modeling, verification, and hardware-software integration.`,
          exampleCompleted: `${name} | ${org} (Credential ID: MAT-9912, Earned: Jul 2025, Score: 88%) — Certified competency in ${s1}, ${s2}, and ${s3}; demonstrated rigorous modeling, verification, and hardware-software integration.`,
        },
        {
          id: 'summary_hook',
          title: 'Executive Summary & LinkedIn Hook',
          badge: 'Profile Summary',
          section: 'Resume Header / Summary',
          description: 'Executive engineering hook.',
          template: `${role} credentialed in ${name}; experienced in ${techStack || 'simulation, mathematical modeling, and embedded systems verification'}.`,
          exampleCompleted: `${role} credentialed in ${name}; experienced in simulation, mathematical modeling, and embedded systems verification.`,
        },
      ];

      metricSuggestions = [
        {
          label: 'Simulation & Optimization Speed',
          metricType: 'latency',
          examples: ['reduced convergence time by 40%', 'cut simulation runtime from 25 mins to 8 mins'],
          hint: 'Measure execution runtime before and after algorithm optimization.',
        },
        {
          label: 'Accuracy & Error Tolerance',
          metricType: 'accuracy',
          examples: ['99.4% accuracy against physical testbench', 'error margin < 0.05%'],
          hint: 'Compare mathematical model output with physical sensor measurements.',
        },
        {
          label: 'Hardware Resource Utilization',
          metricType: 'scale',
          examples: ['reduced ROM footprint by 32%', 'optimized loop execution to fit 64KB SRAM limit', 'cut dynamic power consumption by 18%'],
          hint: 'State memory constraints, clock cycles, or power footprint optimizations achieved.',
        },
      ];

      artifactsChecklist = [
        {
          title: 'Simulation Codebase or GitHub Repository',
          description: 'Repository containing scripts, simulation parameter files, and data plots.',
          type: 'code_repo',
          recommendation: 'Include sample input data and clear execution instructions in your README.',
        },
        {
          title: 'Official Certificate / Credential Link',
          description: 'Official digital certificate verifying completion and score.',
          type: 'credential_badge',
          recommendation: 'Link verification URL directly in your resume Certifications section.',
        },
        {
          title: 'Hardware-in-the-Loop (HIL) Test Report & Telemetry Log',
          description: 'Documented validation report or Jupyter analysis notebook comparing simulated trajectories against real hardware logs.',
          type: 'documentation',
          recommendation: 'Include side-by-side verification graphs in your project documentation.',
        },
        {
          title: 'Demonstration Video / Physical Bench Video',
          description: 'Short video recording or animated GIF showing microcontroller or simulation model running in real-time.',
          type: 'live_deployment',
          recommendation: 'Link an unlisted YouTube or Google Drive video demo in your project README.',
        },
      ];

      interviewDefense = [
        {
          question: `How did you validate your ${name} simulation against real-world physical constraints?`,
          starAnswerOutline: {
            situation: 'Theoretical models frequently diverge from physical hardware due to friction, noise, and latency.',
            task: 'Validate algorithm robustness under noisy real-world conditions.',
            action: 'Injected Gaussian noise and artificial signal delays into the Simulink model, followed by calibration against experimental bench data.',
            result: 'Achieved 99.2% tracking accuracy when transferred to physical microcontroller hardware.',
          },
          keyVocabulary: ['Hardware-in-the-Loop', 'Step Response', 'Frequency Domain', 'Noise Filtering', 'Calibration'],
        },
        {
          question: 'How do you handle real-time constraints and latency jitter in embedded control loops?',
          starAnswerOutline: {
            situation: 'Sensor sampling loop experienced irregular 15ms spikes, causing motor oscillation.',
            task: 'Guarantee deterministic 1ms execution cycles without missed deadlines.',
            action: 'Moved sensor polling to hardware timer-driven interrupt service routines (ISR), decoupled floating-point arithmetic with fixed-point math, and prioritized critical control tasks.',
            result: 'Eliminated timing jitter, stabilizing cycle execution to 1.00ms +/- 20 microseconds.',
          },
          keyVocabulary: ['Deterministic Execution', 'Interrupt Service Routine (ISR)', 'Fixed-Point Math', 'Timing Jitter', 'RTOS'],
        },
      ];
      break;
  }

  // Derive ATS keywords
  const primarySkills = opp.relatedSkills && opp.relatedSkills.length > 0 ? opp.relatedSkills.slice(0, 5) : [s1, s2, s3];
  const secondarySkills = [
    ...(opp.targetRoles || []),
    'Production Architecture',
    'Unit Testing',
    'Code Optimization',
    'CI/CD Pipelines',
  ].slice(0, 5);

  const roleAlignmentKeywords = [
    role,
    'Verifiable Evidence',
    'Problem Solving',
    'Cross-Functional Delivery',
    'Technical Excellence',
  ];

  return {
    opportunityId: opp.id,
    opportunityName: opp.name,
    domain,
    formats,
    metricSuggestions,
    artifactsChecklist,
    atsKeywords: {
      primarySkills,
      secondarySkills,
      roleAlignmentKeywords,
    },
    interviewDefense,
  };
}

/**
 * Returns the primary performative bullet for an opportunity.
 * Used for instant card copy actions and summary views.
 */
export function getPrimaryPerformativeBullet(opp: OpportunityRecord): string {
  const pkg = getPerformativeEvidence(opp);
  const xyz = pkg.formats.find((f) => f.id === 'xyz_bullet');
  return xyz ? xyz.template : opp.resumePresentationTemplate;
}
