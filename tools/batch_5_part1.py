"""
Batch 5 Part 1: Redesign briefs 44 to 48 from scratch.
44. brief-micro-frontend-shell
45. brief-mlops-platform
46. brief-mobile-flutter-prod
47. brief-multimodal-ai-app
48. brief-notification-service
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 44. brief-micro-frontend-shell
# ==============================================================================
b44_data = {
  "id": "brief-micro-frontend-shell",
  "title": "Federated Micro-Frontend Host Shell with Module Federation, Shared Runtime State & Error Boundaries",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Full-stack web", "Frontend application"],
  "problem": "Monolithic enterprise frontend applications suffer from slow continuous integration build cycles, coupled release cadences, and brittle global state dependencies across distributed product teams. Standard iframe-based embedding creates degraded user experiences with clunky cross-window communication and duplicated vendor bundles. This project builds a federated micro-frontend host architecture in React, TypeScript, and Webpack 5 Module Federation. The host shell dynamically loads isolated remote micro-applications at runtime, coordinates shared singleton dependencies to prevent duplicate bundle downloads, implements a typed cross-app event bus for decoupled state synchronization, and isolates remote crashes using React error boundaries.",
  "use_cases": [
    {
      "title": "Enterprise Cloud Console Multi-Team Dashboard",
      "first_sentence": "Enterprise SaaS companies with autonomous product teams need a centralized administrative console where teams deploy services independently without rebuilding the host shell.",
      "second_sentence": "The host shell dynamically imports remote micro-apps for billing, usage analytics, and identity management, rendering a unified user interface while maintaining decoupled release pipelines."
    },
    {
      "title": "Digital Banking Customer Self-Service Portal",
      "first_sentence": "Financial institutions with strict compliance boundaries require isolated deployment surfaces for payment processing, loan applications, and investment accounts.",
      "second_sentence": "The shell manages user authentication and global layout tokens, delegating account workflows to independent remote applications that load on-demand without cross-domain iframe issues."
    },
    {
      "title": "Healthcare Provider Clinic Management Platform",
      "first_sentence": "Hospital networks deploying patient scheduling, clinical charting, and pharmacy modules need resilient frontends where failures in auxiliary modules do not crash critical patient care views.",
      "second_sentence": "The architecture isolates remote child applications behind resilient error boundary fallbacks, ensuring clinicians can record vitals even if an external billing micro-frontend fails to load."
    }
  ],
  "hard_parts": [
    "Configuring Webpack 5 Module Federation with shared singleton runtime dependencies (React, React-DOM, UI tokens) to eliminate bundle duplication",
    "Designing a typed, framework-agnostic custom event bus allowing bidirectional communication between micro-frontends without tight coupling",
    "Implementing resilient error boundaries and skeleton placeholders that prevent unresponsive remote bundles from blank-screening the host application",
    "Isolating CSS namespaces using Tailwind prefixing and CSS modules to prevent remote child styles from overriding host design systems"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating the host shell container, remote micro-apps, and shared contracts library",
    "Automated bundle analysis report confirming shared vendor chunk singletons and sub-120KB initial host shell payload size",
    "Anti-fake verification script dynamically registering a novel remote micro-app at runtime and verifying the host shell imports and renders it without rebuilding"
  ],
  "job_families": [
    "Senior Frontend Engineer",
    "Frontend Platform Architect",
    "Full-Stack Web Developer"
  ],
  "stack": [
    {"tool": "React", "role": "UI library powering host shell navigation and remote micro-application components"},
    {"tool": "TypeScript", "role": "strongly typed language enforcing shared API contracts and event bus message payloads"},
    {"tool": "Webpack", "role": "bundler configuring Module Federation runtime chunk loading and shared dependency singletons"},
    {"tool": "Module Federation", "role": "architectural protocol enabling dynamic runtime sharing of remote ECMAScript modules"},
    {"tool": "Tailwind CSS", "role": "utility-first styling framework configured with scoped namespace prefixes to isolate child styles"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Host Shell Container & App Router",
        "tools_used": ["React", "TypeScript", "Webpack"],
        "purpose": "Manages core navigation, authentication state, global header/footer, and dynamic remote route resolution"
      },
      {
        "name": "Module Federation Remote Loader & Fallback Guard",
        "tools_used": ["Webpack", "Module Federation"],
        "purpose": "Dynamically fetches remoteEntry.js files, tracks network timeouts, and wraps remotes in React error boundaries"
      },
      {
        "name": "Cross-App Typed Event Bus & State Coordinator",
        "tools_used": ["TypeScript"],
        "purpose": "Facilitates decoupled pub/sub messaging and state synchronization across isolated micro-frontend boundaries"
      },
      {
        "name": "Analytics & Billing Remote Micro-Applications",
        "tools_used": ["React", "Tailwind CSS"],
        "purpose": "Sample independently deployable remote applications exposing federated component manifests"
      },
      {
        "name": "Bundle Analyzer & Federation Stress Test Suite",
        "tools_used": ["Webpack"],
        "purpose": "Measures gzipped bundle payloads, validates vendor singletons, and benchmarks remote load latencies"
      }
    ],
    "data_flow": "The user loads the host shell in the browser; the shell initialises the shared React singleton and global theme context; as the user navigates to an application route, the Module Federation runtime requests the target remoteEntry.js script from its CDN endpoint; if the network call succeeds, the remote component mounts seamlessly inside the shell layout; cross-app interactions (such as updating active workspace or currency) publish typed events through the shared event bus; if a remote fails to load or encounters a runtime exception, the error boundary renders a fallback retry card while maintaining full host shell operability.",
    "enforcement_mechanism": "Webpack singleton sharing configuration throwing strict version mismatch warnings; TypeScript interface contracts validating event bus payloads."
  },
  "targets": [
    {
      "metric": "Initial Host Shell Gzipped Bundle Size",
      "method": "Webpack Bundle Analyzer calculation of host shell production build assets excluding shared vendor singletons",
      "input": "Production Webpack build of host shell with authentication, navigation, and layout components",
      "environment": "Standard Node.js 18+ build environment, Webpack 5 production mode with Terser minification",
      "minimum_pass": "Gzipped host shell entry bundle size is < 120.0 kilobytes",
      "target": "Gzipped host shell entry bundle size is < 68.0 kilobytes",
      "report": "Webpack bundle analysis asset report and compressed payload breakdown"
    },
    {
      "metric": "Remote Micro-Frontend Dynamic Load Latency",
      "method": "Browser performance timing from route navigation click to remote component mount across simulated 3G network throttle",
      "input": "100 automated navigation transitions importing remote Billing and Analytics modules under 1.5 Mbps network throttle",
      "environment": "Chromium headless browser with Chrome DevTools Protocol network throttling",
      "minimum_pass": "p95 remote micro-frontend load latency is < 650 milliseconds",
      "target": "p95 remote micro-frontend load latency is < 320 milliseconds",
      "report": "Dynamic module loading benchmark summary log"
    },
    {
      "metric": "Error Boundary Host Shell Survival Rate",
      "method": "Percentage of simulated remote micro-app fatal crashes where the host shell retains uninterrupted navigation and session state",
      "input": "50 simulated fatal JavaScript runtime errors injected into remote component render cycles",
      "environment": "Jest and React Testing Library automated component test harness",
      "minimum_pass": "50 of 50 fatal crash simulations handled by error boundaries with 0 host shell crashes",
      "target": "50 of 50 fatal crash simulations handled by error boundaries with 0 host shell crashes",
      "report": "Error boundary isolation test summary and resilience audit log"
    }
  ],
  "skills": ["React", "TypeScript", "Webpack", "Module Federation", "Tailwind CSS", "Frontend Architecture", "Performance"],
  "starter_input": {
    "spec": "Directory containing host shell Webpack 5 configuration, 2 remote micro-app source trees (Analytics and Billing), and shared event contracts.",
    "size": "3 independent Node.js project directories, 15 TypeScript components, and automated test fixtures",
    "seeded_cases": "Remote HTTP 404 bundle failure, React version mismatch conflict, unhandled component exceptions, and CSS specificity clashing",
    "label_source": "Deterministic component mount assertions and Webpack stats.json bundle manifests",
    "personal_data_policy": "Strictly mock synthetic user accounts and simulated analytics telemetry; no real personal data used"
  },
  "components": [
    {"name": "Host Shell Container & App Router", "task_type": "one UI view with state", "hours": 6.0},
    {"name": "Module Federation Remote Loader & Fallback Guard", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Cross-App Typed Event Bus & State Coordinator", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Analytics & Billing Remote Micro-Applications", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Bundle Analyzer & Federation Stress Test Suite", "task_type": "load or performance test harness + report", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic remote discovery service resolving micro-frontend CDN URLs from a centralized JSON registry API",
      "Server-side rendering (SSR) for federated components using Next.js and @module-federation/nextjs-mf",
      "Automated canary deployments routing a percentage of host traffic to updated remote micro-app versions"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Host Shell & Webpack Module Federation Scaffolding in React and TypeScript",
      "hours": 7,
      "done_criterion": "Host shell builds with Webpack 5 and successfully imports remote components at runtime."
    },
    {
      "name": "Cross-App Event Bus & Shared Singleton State in Frontend Architecture",
      "hours": 7,
      "done_criterion": "Event bus coordinates pub/sub messages; React runs as a verified single runtime instance."
    },
    {
      "name": "Resilient Error Boundaries & CSS Namespace Scoping in Tailwind CSS",
      "hours": 7,
      "done_criterion": "Error boundary catches 50 of 50 remote crashes; Tailwind prefixes isolate component styles."
    },
    {
      "name": "Bundle Optimization Benchmarking, Anti-Fake Test & Docs in Performance",
      "hours": 7,
      "done_criterion": "Host bundle size is < 120KB; anti-fake test validates dynamic remote mount; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in modern React (hooks, context, error boundaries) and TypeScript",
    "Deep understanding of Webpack bundling mechanics, code splitting, and browser module execution"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound JavaScript bundling and web serving)",
    "cost": "$0 (fully open-source software stack)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Node.js 18+ and modern Chromium browser installed",
    "fallback_path": "Static local HTTP servers hosting remote bundles without external CDNs"
  },
  "riskiest_component": {
    "name": "React Runtime Version Conflicts Between Host and Remotes",
    "mitigation": "Configure Webpack ModuleFederationPlugin shared configuration with singleton: true and strictVersion: false.",
    "fallback": "Enforce peerDependencies lockfile pinning identical React versions across all micro-app packages."
  },
  "deliverables": [
    "Git repository containing host shell, 2 remote micro-applications, and shared contracts library",
    "Production Webpack 5 build configurations with Module Federation, code splitting, and bundle analyzer",
    "Automated testing suite covering error boundary fallbacks, event bus communication, and bundle sizes",
    "Screener verification script executing automated benchmark and dynamic remote injection in under 2 minutes"
  ],
  "out_of_scope": [
    "Multi-cloud Kubernetes cluster infrastructure orchestration for micro-frontend CDNs",
    "Legacy Internet Explorer 11 polyfilling or ECMAScript 5 transpilation targets",
    "Payment gateway credit card processing compliance certification"
  ],
  "safety_note": None,
  "resources": [
    "Webpack 5 Module Federation Architecture and Concept Guide",
    "Micro Frontends: In-Depth Guide to Architecture and Patterns (Martin Fowler)",
    "Tailwind CSS Namespace Configuration and CSS Isolation Manual"
  ],
  "rubric": [
    {
      "input": "Production Webpack build assets of host shell container",
      "action": "npm run build --workspace=host && node scripts/analyze_bundles.js",
      "expected_result": "Webpack bundle analyzer confirms gzipped host shell bundle size is < 120.0 kilobytes",
      "evidence_location": "Terminal build output log and reports/bundle_analysis.json",
      "pass_criterion": "Compressed host bundle size is < 120KB with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 automated route transitions importing remote modules under network throttling",
      "action": "node scripts/benchmark_load_latency.js --runs 100 --throttle 3g",
      "expected_result": "Remote micro-frontends resolve and mount with p95 load latency < 650 milliseconds",
      "evidence_location": "Module load latency benchmark table",
      "pass_criterion": "p95 load latency is < 650ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 simulated fatal JavaScript exceptions injected into remote components",
      "action": "npm test -- --testPathPattern=error_boundary",
      "expected_result": "Error boundary catches all 50 component crashes, rendering fallback UI while host shell remains active",
      "evidence_location": "Test runner execution output log",
      "pass_criterion": "50 of 50 crash simulations pass error boundary assertions with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Cross-microfrontend event dispatched over shared event bus",
      "action": "npm test -- --testPathPattern=event_bus",
      "expected_result": "Event bus transmits typed payload across micro-frontend boundaries with verified subscriber notification",
      "evidence_location": "Event bus unit test trace",
      "pass_criterion": "All event pub/sub assertions pass with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic unobserved remote micro-app component served on local test port at runtime",
      "action": "node scripts/verify_dynamic_remote.js --port 8089 --name DynamicPromoRemote",
      "expected_result": "Host shell dynamically injects remote entry script, resolves federated export, and mounts component",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Headless browser DOM confirms DynamicPromoRemote mounted inside host layout with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected federated micro-frontend host platform in React and TypeScript using Webpack Module Federation; maintained sub-[BUNDLE_SIZE] kilobyte initial host payload size, and achieved sub-[LOAD_LATENCY] remote component mount latency across throttled connections.",
    "claims": [
      {
        "text": "maintained sub-[BUNDLE_SIZE] kilobyte initial host payload size",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved sub-[LOAD_LATENCY] remote component mount latency across throttled connections",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "automated cross-cloud CDN edge routing or legacy ECMAScript five browser compilation"
  },
  "verify": [
    "Run `npm test` across all workspaces to confirm unit, event bus, and error boundary tests pass.",
    "Execute `npm run build && node scripts/analyze_bundles.js` to verify host bundle size is below 120KB.",
    "Run `node scripts/verify_dynamic_remote.js` to assert runtime injection and mounting of unobserved remote apps."
  ],
  "worksheet": {
    "q1": "Core deliverable: a federated micro-frontend host shell in React/TypeScript with Webpack 5 Module Federation, shared singletons, and error boundaries.",
    "q2": "Target users: frontend platform engineers, web architects, and enterprise UI developers.",
    "q3": "3 use cases: enterprise cloud console dashboards, digital banking portals, and clinical hospital management platforms.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: Webpack Module Federation singleton sharing, cross-app typed event bus coordination, error boundary isolation, and CSS namespace encapsulation.",
    "q6": "Starter input: host shell Webpack config, 2 remote micro-app source trees, and event contract schemas. Synthetic mock data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local static HTTP servers.",
    "q8": "Riskiest component: React runtime version conflicts. Fallback: singleton: true in ModuleFederationPlugin and peerDependencies lockfile.",
    "q9": "Potential faking: static hardcoded component imports. Anti-fake check 5 serves dynamic unobserved remote on local port, asserts runtime mount.",
    "q10": "Safety/ethics: Safe; local development servers and mock telemetry only, zero sensitive enterprise data."
  }
}

b44_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Micro-Frontend Host Shell with Module Federation | Generic headline | Minor |
| Claims / Marketing | 'SAP, Siemens, and large Indian IT companies (Infosys, TCS client portals) use micro-frontends... Oracle, SAP Labs...' | Named specific enterprise corporations as marketing hooks | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing remote micro-app codebases and Webpack configurations | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Node.js or browser specs | Major |
| Resume Bullet | Spliced bullet ending with copied web-service targets | Malformed resume bullet | Critical |
"""

b44_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js 18+ and React at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Bundle size (< 120KB), remote load latency (< 650ms), and error boundary survival (50 of 50) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local Node.js static HTTP servers hosting remote entry bundles without external cloud CDNs.",
  "Can test data be created in minutes?": "YES. Sample micro-app source trees and automated Webpack build scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: multi-cloud CDN orchestration and legacy ECMAScript 5 polyfilling.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 spins up dynamic remote component and verifies host shell mounts it at runtime.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b44_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved dynamic remote registry discovery and Next.js SSR federation to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic micro-frontend metrics (host bundle size, dynamic remote load latency, and error boundary crash survival rate).
- Removed Banned Content: Removed marketing references to SAP, Siemens, Infosys, TCS, and Oracle.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic remote mounting test.
"""


# ==============================================================================
# 45. brief-mlops-platform
# ==============================================================================
b45_data = {
  "id": "brief-mlops-platform",
  "title": "End-to-End MLOps Pipeline Platform with Automated Experiment Tracking, Model Registry & Drift Detection",
  "domain": "ML Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Data pipeline / ETL", "Platform/infra tool"],
  "problem": "Machine learning teams struggle with reproducible model training, ad-hoc versioning stored on local disks, and silent performance degradation when real-world data distributions drift from training sets. Manually packaging models into Docker containers introduces deployment discrepancies and untracked dependencies. This project builds a production-grade MLOps platform in Python. The platform orchestrates automated training pipelines, tracks model parameters, metrics, and artifacts in MLflow, gates model stage transitions in a central Model Registry, packages champion models into containerized FastAPI inference microservices via Docker, and detects covariate feature drift using statistical tests in automated CI/CD workflows.",
  "use_cases": [
    {
      "title": "Predictive Maintenance Fleet Monitoring",
      "first_sentence": "Manufacturing operations engineering teams need automated model retraining pipelines to forecast industrial turbine failures based on sensor telemetry.",
      "second_sentence": "The platform ingests streaming sensor data, tracks model hyperparameter runs in MLflow, and automatically promotes newly trained models if validation metrics surpass current production thresholds."
    },
    {
      "title": "E-Commerce Customer Churn Prediction Engine",
      "first_sentence": "Growth analytics teams require reproducible customer churn prediction models that automatically retrain as quarterly consumer purchasing habits evolve.",
      "second_sentence": "The system monitors feature distributions for covariate shift, triggering automated retraining pipelines and posting model registry evaluation reports before deployment."
    },
    {
      "title": "Credit Risk Scoring & Financial Model Governance",
      "first_sentence": "Fintech lending platforms subject to strict auditing regulations must maintain immutable audit trails of every model artifact, dataset version, and training script.",
      "second_sentence": "The platform enforces strict model registry gating where models progress from Staging to Production only after passing automated bias and drift validation tests."
    }
  ],
  "hard_parts": [
    "Establishing deterministic MLflow experiment tracking and artifact lineage linking git commits to model weights",
    "Implementing Kolmogorov-Smirnov and Population Stability Index (PSI) algorithms to detect subtle tabular feature drift",
    "Designing automated model promotion criteria that evaluate candidate models against challenger benchmarks before registry tagging",
    "Containerizing model inference servers with FastAPI and Docker ensuring minimal cold-start times and deterministic dependency isolation"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating data ingestion pipelines, MLflow tracking utilities, inference APIs, and drift analyzers",
    "Comprehensive test suite verifying automated model promotion, inference endpoint latency, and statistical drift alerts",
    "Anti-fake verification script submitting an intentionally drifted feature batch and verifying the platform detects covariate shift and flags retraining alerts"
  ],
  "job_families": [
    "MLOps Engineer",
    "Machine Learning Infrastructure Engineer",
    "Data Platform Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing training pipelines, drift detection algorithms, and API servers"},
    {"tool": "MLflow", "role": "platform managing experiment tracking, parameter logging, and model registry lifecycle gating"},
    {"tool": "Docker", "role": "containerization engine building immutable model serving images for production deployment"},
    {"tool": "FastAPI", "role": "high-performance asynchronous framework exposing real-time model inference REST endpoints"},
    {"tool": "GitHub Actions", "role": "CI/CD orchestration engine executing automated model evaluation and container build workflows"},
    {"tool": "PostgreSQL", "role": "relational database serving as the persistent backend store for MLflow tracking metadata"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Pipeline Ingestion & Preprocessing Runner",
        "tools_used": ["Python", "PostgreSQL"],
        "purpose": "Ingests raw feature datasets, computes transformations, and saves reproducible train/test splits"
      },
      {
        "name": "MLflow Experiment Tracker & Model Registry",
        "tools_used": ["Python", "MLflow", "PostgreSQL"],
        "purpose": "Logs hyperparameters, training metrics, and model artifacts while managing Staging/Production stage tags"
      },
      {
        "name": "Automated Model Packaging & Docker Serving Container",
        "tools_used": ["Docker", "FastAPI"],
        "purpose": "Packages registered models into lightweight container images serving prediction requests over HTTP"
      },
      {
        "name": "Statistical Feature Drift & Data Quality Monitor",
        "tools_used": ["Python"],
        "purpose": "Executes Kolmogorov-Smirnov tests and PSI checks on incoming inference batches to flag distribution shifts"
      },
      {
        "name": "CI/CD Model Validation & Automated Retraining Workflow",
        "tools_used": ["GitHub Actions", "Docker"],
        "purpose": "Runs automated validation suites on candidate models and triggers container rebuilds upon promotion"
      },
      {
        "name": "Inference Latency & Throughput Benchmark Suite",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Benchmarks REST inference server latency, memory usage, and throughput under concurrent request loads"
      },
      {
        "name": "MLOps Runbook & Architecture Documentation",
        "tools_used": ["MLflow"],
        "purpose": "Documents pipeline DAGs, registry promotion criteria, drift monitoring thresholds, and deployment SOPs"
      }
    ],
    "data_flow": "Feature datasets enter the preprocessing pipeline; the training script trains model candidates (e.g., LightGBM / XGBoost) and logs parameters, metrics, and serialized artifacts to MLflow; the registry compares the candidate against the current production baseline; if accuracy improves and passes safety gates, the model is tagged as Staging; GitHub Actions builds a Docker container embedding the model and FastAPI server; during active serving, input payloads stream to the drift monitor; when statistical feature divergence exceeds defined p-value thresholds (p < 0.05), a drift alert triggers and logs a retraining event.",
    "enforcement_mechanism": "Model registry promotion checks asserting test accuracy > baseline before stage updates; strict schema validation on inference input payloads."
  },
  "targets": [
    {
      "metric": "Automated Model Training & Registration Pipeline Cycle Time",
      "method": "Wall-clock timing from pipeline trigger to completed model training, artifact logging, and MLflow registry entry",
      "input": "50,000 tabular records with 30 numeric and categorical features trained on standard classification model",
      "environment": "Standard 4-core local CPU, 8GB RAM, local MLflow server with SQLite/PostgreSQL backend",
      "minimum_pass": "End-to-end training and registration pipeline cycle time is < 8.0 minutes",
      "target": "End-to-end training and registration pipeline cycle time is < 3.5 minutes",
      "report": "MLOps pipeline execution timing log and MLflow run manifest"
    },
    {
      "metric": "Containerized Model Inference p95 Latency",
      "method": "Wall-clock timing for single-record prediction requests sent to containerized FastAPI inference endpoint",
      "input": "1,000 sequential prediction requests issued over local HTTP connection",
      "environment": "Standard 4-core local CPU, Docker container runtime with FastAPI and Uvicorn",
      "minimum_pass": "p95 model inference response latency is < 25.0 milliseconds",
      "target": "p95 model inference response latency is < 9.5 milliseconds",
      "report": "FastAPI inference latency profiling report and summary table"
    },
    {
      "metric": "Covariate Feature Drift Detection Recall",
      "method": "Percentage of intentionally drifted feature batches correctly flagged by Kolmogorov-Smirnov statistical tests",
      "input": "50 drifted feature test batches with simulated distribution shifts (mean shift, variance scale) alongside 50 control batches",
      "environment": "Python 3.11 with SciPy statistical testing suite",
      "minimum_pass": "Feature drift detection recall is >= 90.0% with false positive rate < 5.0%",
      "target": "Feature drift detection recall is >= 98.0% with false positive rate < 2.0%",
      "report": "Drift detection validation report and statistical p-value audit log"
    }
  ],
  "skills": ["Python", "MLflow", "Docker", "FastAPI", "GitHub Actions", "PostgreSQL", "ML Engineering", "Data Pipelines", "MLOps"],
  "starter_input": {
    "spec": "Directory containing 50,000 tabular feature records in CSV format, MLflow pipeline scaffolding, and Dockerfiles.",
    "size": "50,000 tabular rows (approx 12MB CSV), 5 training configuration YAMLs, and drift evaluation scripts",
    "seeded_cases": "Sudden mean shifts in continuous features, missing categorical levels in inference payloads, and model artifact serialization corruption",
    "label_source": "Deterministic ground-truth target labels and pre-calculated feature statistical baseline profiles",
    "personal_data_policy": "Strictly mock synthetic industrial sensor readings and simulated customer features; no real personal data used"
  },
  "components": [
    {"name": "Pipeline Ingestion & Preprocessing Runner", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "MLflow Experiment Tracker & Model Registry", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 6.0},
    {"name": "Automated Model Packaging & Docker Serving Container", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Statistical Feature Drift & Data Quality Monitor", "task_type": "data pipeline step", "hours": 5.0},
    {"name": "CI/CD Model Validation & Automated Retraining Workflow", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Inference Latency & Throughput Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "MLOps Runbook & Architecture Documentation", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Real-time A/B shadow deployment routing traffic between Production and Staging models via Envoy proxy",
      "Automated hyperparameter tuning sweeps using Ray Tune or Optuna with MLflow tracking integration",
      "Prometheus and Evidently AI metrics integration streaming data quality metrics to Grafana dashboards"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Data Pipelines Ingestion & ML Engineering Tracking in Python and MLflow",
      "hours": 10,
      "done_criterion": "Preprocessing runs; MLflow logs hyperparameters, metrics, and models with artifact lineage."
    },
    {
      "name": "Model Registry Gating & Docker Packaging in Docker and FastAPI",
      "hours": 10,
      "done_criterion": "Model promotes from Staging to Production; Docker packages model into working FastAPI service."
    },
    {
      "name": "Statistical Drift Detection & CI/CD Validation in GitHub Actions and PostgreSQL",
      "hours": 10,
      "done_criterion": "Drift monitor detects >= 90% of drifted batches; GitHub Actions runs validation suite."
    },
    {
      "name": "Inference Benchmarking, Anti-Fake Drift Test & Docs in MLOps",
      "hours": 10,
      "done_criterion": "Inference latency is < 25ms; anti-fake test catches dynamic drift; documentation complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, machine learning libraries (scikit-learn, LightGBM/XGBoost), and pandas",
    "Familiarity with containerization (Docker), API design with FastAPI, and experiment tracking concepts"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU-bound tabular machine learning and model serving)",
    "cost": "$0 (fully open-source stack using local MLflow, Docker, and Python)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Docker Desktop, Python 3.11, and MLflow installed",
    "fallback_path": "Local SQLite database and filesystem artifact store without running dedicated database servers"
  },
  "riskiest_component": {
    "name": "Silent Model Performance Degradation Due to Undetected Feature Drift",
    "mitigation": "Combine Kolmogorov-Smirnov non-parametric tests for numerical features with Chi-Square tests for categorical features.",
    "fallback": "Automated daily scheduled retraining jobs on recent time-windowed feature snapshots."
  },
  "deliverables": [
    "Git repository containing end-to-end MLOps pipeline scripts, MLflow wrappers, and drift detectors",
    "Production Dockerfile building containerized FastAPI model serving image with health check probes",
    "Automated drift detection test suite validating statistical shift detection on simulated test batches",
    "Screener verification script executing pipeline execution and dynamic drift alert validation in under 3 minutes"
  ],
  "out_of_scope": [
    "Multi-node GPU distributed deep learning pre-training clusters",
    "Commercial cloud platform billing account provisioning (AWS SageMaker, GCP Vertex AI)",
    "Hardware edge embedded TPU firmware authoring"
  ],
  "safety_note": None,
  "resources": [
    "MLflow Documentation: Tracking, Model Registry, and Deployment Guides",
    "Evidently AI / SciPy Statistical Drift Detection Architecture Guidelines",
    "FastAPI Production Machine Learning Serving Design Patterns"
  ],
  "rubric": [
    {
      "input": "50,000 tabular feature records processed through automated training pipeline",
      "action": "python -m mlops_pipeline.train_and_register --config configs/train_config.yaml",
      "expected_result": "Pipeline trains model, logs metrics to MLflow, and registers candidate in under 8.0 minutes",
      "evidence_location": "Terminal execution output log and reports/pipeline_timing.json",
      "pass_criterion": "Cycle time is < 8.0 minutes and MLflow run status is FINISHED with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 prediction requests sent to containerized FastAPI model service",
      "action": "python scripts/benchmark_inference.py --endpoint http://localhost:8000/predict --requests 1000",
      "expected_result": "Inference server fulfills requests with p95 response latency < 25.0 milliseconds",
      "evidence_location": "Inference latency profiling summary table",
      "pass_criterion": "p95 latency is < 25.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50 drifted feature test batches and 50 control feature test batches",
      "action": "python -m mlops_pipeline.evaluate_drift --data-dir test_data/drift_batches",
      "expected_result": "Drift monitor correctly flags >= 90.0% of drifted batches with false positive rate < 5.0%",
      "evidence_location": "Drift evaluation audit report in reports/drift_evaluation.json",
      "pass_criterion": "Detection recall is >= 90.0% and exit code is 0",
      "kind": "normal"
    },
    {
      "input": "Model candidate meeting promotion criteria evaluated against production baseline",
      "action": "python -m mlops_pipeline.promote_model --model-name CustomerModel --metric-threshold 0.85",
      "expected_result": "MLflow model registry updates stage tag to 'Production' and logs transition event",
      "evidence_location": "MLflow registry status output",
      "pass_criterion": "Model stage equals 'Production' with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic feature batch with injected artificial mean shift submitted to monitoring endpoint",
      "action": "python scripts/verify_dynamic_drift.py --batch-file test_data/dynamic_drift.csv",
      "expected_result": "Monitor computes Kolmogorov-Smirnov test (p < 0.01), flags feature drift, and logs retraining alert",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Console output logs 'DRIFT_DETECTED: Feature X p-value < 0.01' with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected end-to-end MLOps platform in Python and Docker using MLflow and FastAPI; automated model registry gating with sub-[CYCLE_MINUTES] minute pipeline cycles, and achieved [DRIFT_RECALL] drift detection recall across [BATCH_COUNT] evaluation batches.",
    "claims": [
      {
        "text": "automated model registry gating with sub-[CYCLE_MINUTES] minute pipeline cycles",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved [DRIFT_RECALL] drift detection recall across [BATCH_COUNT] evaluation batches",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "multi-node GPU distributed deep learning pre-training clusters or commercial cloud billing account management"
  },
  "verify": [
    "Run `python -m pytest tests/` to confirm data preprocessing, MLflow tracking, and drift detection pass.",
    "Execute `python -m mlops_pipeline.train_and_register` to verify automated model training and registration.",
    "Run `python scripts/verify_dynamic_drift.py` to assert that dynamic drifted feature batches trigger verified alerts."
  ],
  "worksheet": {
    "q1": "Core deliverable: an end-to-end MLOps platform in Python with MLflow tracking, model registry gating, Docker serving, and drift detection.",
    "q2": "Target users: MLOps engineers, machine learning platform developers, and enterprise data architects.",
    "q3": "3 use cases: predictive maintenance fleet monitoring, customer churn prediction, and regulated credit risk scoring.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: MLflow experiment lineage linking code to weights, Kolmogorov-Smirnov drift detection, automated challenger-champion gating, and lightweight Docker inference packaging.",
    "q6": "Starter input: 50,000 tabular feature records in CSV format, MLflow pipeline scaffolding, and Dockerfiles. Synthetic sensor data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local SQLite and filesystem MLflow backend.",
    "q8": "Riskiest component: silent drift causing performance degradation. Fallback: non-parametric Kolmogorov-Smirnov tests and scheduled retraining.",
    "q9": "Potential faking: mock hardcoded drift logs. Anti-fake check 5 generates dynamically shifted feature distributions, asserts p-value < 0.01 flag.",
    "q10": "Safety/ethics: Safe; synthetic sensor telemetry and customer records only, zero private enterprise data."
  }
}

b45_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | End-to-End MLOps Training & Deployment Platform | Generic headline | Minor |
| Claims / Marketing | Generic marketing copy without specific architecture details | Lacks concrete implementation specifics | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing feature datasets, MLflow configurations, and Dockerfiles | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No container/CPU specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b45_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs locally on 8GB RAM CPU using Python, MLflow, and Docker Desktop at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Pipeline cycle time (< 8.0 min), inference latency (< 25.0ms), and drift recall (>= 90.0%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local SQLite database and filesystem artifact storage without requiring external managed databases.",
  "Can test data be created in minutes?": "YES. Synthetic 50,000-row tabular dataset generator included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: multi-node GPU pre-training clusters and commercial cloud billing management.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 submits dynamic shifted feature distribution and asserts statistical p-value alert.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b45_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved A/B shadow routing and Optuna hyperparameter sweeps to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic MLOps metrics (pipeline cycle time, containerized inference latency, and Kolmogorov-Smirnov drift recall).
- Removed Banned Content: Cleaned generic marketing claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic drift injection test.
"""


# ==============================================================================
# 46. brief-mobile-flutter-prod
# ==============================================================================
b46_data = {
  "id": "brief-mobile-flutter-prod",
  "title": "Cross-Platform Mobile Application in Flutter with BLoC State Management, Offline SQLite Sync & CI/CD Fastlane Pipeline",
  "domain": "Mobile Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Mobile application", "Frontend application"],
  "problem": "Cross-platform mobile applications frequently suffer from janky UI frame drops, fragile state synchronizations when network connectivity fluctuates, and chaotic manual application store release processes. Mixing business logic with widget trees produces untestable code and memory leaks during frequent device configuration changes. This project builds a production-grade cross-platform mobile application in Flutter and Dart. The system implements the BLoC (Business Logic Component) pattern for unidirectional state management, persists offline mutations to local SQLite databases with optimistic UI rendering, executes bidirectional delta synchronization with backend REST APIs, and automates testing, code signing, and release artifact generation using Fastlane and GitHub Actions.",
  "use_cases": [
    {
      "title": "Field Service Technician Offline Asset Inspection",
      "first_sentence": "Industrial maintenance technicians inspect remote oil pipelines and wind turbines in remote locations without cellular reception.",
      "second_sentence": "The mobile app enables technicians to log equipment checklists and photo attachments to local SQLite storage, automatically syncing pending audits when reconnected to network coverage."
    },
    {
      "title": "Last-Mile Delivery Driver Route & Package Tracking",
      "first_sentence": "Logistics delivery drivers require high-performance mobile interfaces that maintain 60fps rendering during fast barcode scanning and list flinging.",
      "second_sentence": "The application manages package status transitions via BLoC state streams, executing optimistic local updates while streaming background GPS coordinates and delivery confirmations."
    },
    {
      "title": "Personal Healthcare Medication & Symptom Diary",
      "first_sentence": "Patients tracking chronic medical symptoms need instant app responsiveness and guaranteed data capture even in hospital basements with poor connectivity.",
      "second_sentence": "The Flutter app captures daily symptom logs locally with zero input latency, reconciling conflict-free timestamps against backend medical records upon connection restoration."
    }
  ],
  "hard_parts": [
    "Architecting clean BLoC state machines that decouple business events, state transitions, and UI widget rebuilds",
    "Implementing offline-first data synchronization with SQLite mutation queues and idempotent server reconciliation",
    "Optimizing Flutter widget trees and list view builders to eliminate frame drops and sustain 60fps scrolling under load",
    "Automating multi-flavor code signing and build artifact generation (APK / App Bundle) using Fastlane in CI/CD"
  ],
  "screener_signals": [
    "Clean Dart codebase adhering to clean architecture with clear separation between data sources, repositories, BLoCs, and UI widgets",
    "Automated Flutter driver integration test suite verifying offline mutation queuing and reconciliation upon network restoration",
    "Anti-fake verification script simulating sudden airplane mode disconnection during item creation and verifying zero data loss upon reconnection"
  ],
  "job_families": [
    "Senior Flutter Mobile Engineer",
    "Mobile Platform Developer",
    "Cross-Platform Application Architect"
  ],
  "stack": [
    {"tool": "Flutter", "role": "cross-platform UI toolkit compiling native Android and iOS mobile applications"},
    {"tool": "Dart", "role": "strongly typed language providing asynchronous streams and null-safety for mobile logic"},
    {"tool": "BLoC", "role": "state management library implementing predictable event-driven unidirectional data flow"},
    {"tool": "Fastlane", "role": "automation toolchain handling screenshot generation, code signing, and release packaging"},
    {"tool": "Firebase", "role": "backend platform providing cloud messaging, authentication, and remote test crashlytics"},
    {"tool": "GitHub Actions", "role": "continuous integration platform executing automated linting, tests, and Fastlane builds"}
  ],
  "architecture": {
    "components": [
      {
        "name": "BLoC State Management & Event Orchestrator",
        "tools_used": ["Flutter", "Dart", "BLoC"],
        "purpose": "Manages unidirectional state streams, receives user UI events, and emits immutable view states"
      },
      {
        "name": "Local SQLite Mutation Queue & Persistence Layer",
        "tools_used": ["Dart", "Flutter"],
        "purpose": "Persists offline records to local SQLite tables and tracks uncommitted mutation operation queues"
      },
      {
        "name": "Bidirectional Delta Sync & Network Monitor",
        "tools_used": ["Dart", "Firebase"],
        "purpose": "Monitors connectivity status, flushes queued offline mutations, and reconciles conflict-free timestamps"
      },
      {
        "name": "Responsive Widget UI & Animation Controller",
        "tools_used": ["Flutter"],
        "purpose": "Renders responsive mobile layouts, manages theme modes, and drives smooth 60fps list interactions"
      },
      {
        "name": "Fastlane Release Automation & CI/CD Pipeline",
        "tools_used": ["Fastlane", "GitHub Actions"],
        "purpose": "Automates flutter analyze, unit/widget test execution, version tagging, and unsigned APK generation"
      }
    ],
    "data_flow": "The user interacts with a Flutter screen widget; the widget dispatches a strongly-typed event to the BLoC; the BLoC invokes the repository layer; the repository immediately writes the mutation to the local SQLite database and emits an optimistic state to update the UI; if the network monitor confirms connectivity, the sync worker transmits the payload to backend REST endpoints; on successful server acknowledgement, the local record marks as synchronized; if offline, the mutation queues in SQLite; when connectivity restores, the sync service flushes pending queues with exponential backoff.",
    "enforcement_mechanism": "Immutable state emissions in BLoC preventing uncontrolled side-effects; database foreign key constraints ensuring relational integrity."
  },
  "targets": [
    {
      "metric": "Application Cold Start Duration",
      "method": "Wall-clock timing from application process launch to initial interactive Flutter widget render",
      "input": "10 cold start launches executed on standard Android emulator / physical reference device",
      "environment": "Standard 4-core local CPU with Android Emulator (API level 33) or connected Android phone",
      "minimum_pass": "Average cold start launch duration is < 1,800 milliseconds",
      "target": "Average cold start launch duration is < 950 milliseconds",
      "report": "Flutter performance profiling report and cold start trace log"
    },
    {
      "metric": "UI Scrolling Frame Rate Rendering Stability",
      "method": "Flutter driver performance profiling measuring dropped frames during 1,000-item list flinging",
      "input": "1,000 complex list items with images and state badges scrolled vigorously via automated test driver",
      "environment": "Flutter profile mode build running on Android emulator with 60Hz display refresh",
      "minimum_pass": "0 jank occurrences with < 4 dropped frames across 1,000-item scroll test",
      "target": "0 jank occurrences with 0 dropped frames across 1,000-item scroll test",
      "report": "Flutter frame rendering summary and performance timeline JSON"
    },
    {
      "metric": "Offline Mutation Synchronization Latency",
      "method": "Duration from network reconnection event to complete reconciliation of 50 queued offline records",
      "input": "50 queued local offline mutations created while network connectivity is disabled",
      "environment": "Local mock REST API backend running on loopback interface",
      "minimum_pass": "Average sync reconciliation time is < 650 milliseconds across 50 records",
      "target": "Average sync reconciliation time is < 250 milliseconds across 50 records",
      "report": "Offline sync timing audit log and network reconciliation summary"
    }
  ],
  "skills": ["Flutter", "Dart", "BLoC", "Fastlane", "Firebase", "GitHub Actions", "Mobile Engineering", "Offline Sync", "CI/CD"],
  "starter_input": {
    "spec": "Directory containing Flutter project scaffolding, mock REST backend server, Fastlane configurations, and BLoC templates.",
    "size": "Flutter project repository, 15 Dart component files, 4 mock backend scripts, and GitHub Actions workflow YAMLs",
    "seeded_cases": "Network drop during active multipart upload, conflicting server-client record timestamps, and rapid screen orientation shifts",
    "label_source": "Deterministic mock API response fixtures and Flutter widget test driver assertions",
    "personal_data_policy": "Strictly mock synthetic field technician records and simulated audit checklists; no real personal data used"
  },
  "components": [
    {"name": "BLoC State Management & Event Orchestrator", "task_type": "one UI view with state", "hours": 6.0},
    {"name": "Local SQLite Mutation Queue & Persistence Layer", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Bidirectional Delta Sync & Network Monitor", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Responsive Widget UI & Animation Controller", "task_type": "one UI view with state", "hours": 4.0},
    {"name": "Fastlane Release Automation & CI/CD Pipeline", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic background geolocation tracking with geofence entry and exit alerts using flutter_background_geolocation",
      "Biometric authentication (fingerprint and FaceID) integration with encrypted secure hardware keystore storage",
      "Multi-language internationalization (i18n) supporting dynamic runtime locale switching"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Flutter Project Architecture & BLoC Event Core in Dart and Flutter",
      "hours": 7,
      "done_criterion": "Flutter project compiles; BLoC manages unidirectional event streams with test coverage."
    },
    {
      "name": "Offline SQLite Persistence & Mutation Queue in Mobile Engineering",
      "hours": 7,
      "done_criterion": "App writes mutations to SQLite locally when offline; UI updates optimistically."
    },
    {
      "name": "Network Sync & Fastlane CI/CD in Fastlane, Firebase and GitHub Actions",
      "hours": 7,
      "done_criterion": "Queued mutations sync upon reconnect; Fastlane script builds unsigned release APK in CI."
    },
    {
      "name": "60fps Performance Profiling, Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Performance profiling verifies 60fps; anti-fake test validates offline sync; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Dart programming (streams, futures, null safety) and Flutter widget lifecycle",
    "Understanding of mobile state management (BLoC/Cubit) and local database persistence (sqflite)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM (16GB recommended for running Android Studio and emulator)",
    "gpu": "None required (Android emulator can run with software rendering or connected physical phone)",
    "cost": "$0 (fully open-source Flutter SDK and local mock backend)",
    "accounts_keys_quotas": "No external cloud accounts or paid developer licenses required (builds unsigned test APKs)",
    "reference_environment": "Local 4-core CPU with Flutter 3.16+, Dart 3.2+, and Android SDK command-line tools installed",
    "fallback_path": "Running Flutter Web or desktop Linux/Windows targets if Android emulator cannot be launched"
  },
  "riskiest_component": {
    "name": "Jank and Stuttering Frame Drops During Complex List Scrolling",
    "mitigation": "Utilize ListView.builder with automaticKeepAlive, avoid heavy computations in build methods, and cache image decodes.",
    "fallback": "Paginate list rendering into 20-item batches and simplify widget tree nesting depth."
  },
  "deliverables": [
    "Git repository containing Flutter mobile codebase, BLoC components, and SQLite repositories",
    "Fastlane configuration scripts automating build flavor management and release compilation",
    "Automated Flutter driver integration test suite verifying offline queuing and synchronization",
    "Screener verification script validating offline state transitions and test suite execution in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial Apple App Store and Google Play Store live developer account publishing",
    "Direct in-app purchase payment processing integration with real credit cards",
    "Custom Bluetooth hardware peripheral device firmware flashing"
  ],
  "safety_note": None,
  "resources": [
    "Flutter Architecture Documentation: BLoC State Management Pattern",
    "Fastlane for Flutter Automation Manual: Code Signing and Build Automation",
    "sqflite Local Database Integration and Migration Guide for Flutter"
  ],
  "rubric": [
    {
      "input": "10 cold start application launches measured via Flutter driver",
      "action": "flutter drive --driver=test_driver/perf_driver.dart --target=integration_test/cold_start_test.dart",
      "expected_result": "Application renders initial interactive screen with average cold start latency < 1,800 milliseconds",
      "evidence_location": "Terminal execution output log and build/cold_start_summary.json",
      "pass_criterion": "Average cold start is < 1,800ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000-item list scrolling performance benchmark in Flutter profile mode",
      "action": "flutter drive --driver=test_driver/perf_driver.dart --target=integration_test/scrolling_test.dart --profile",
      "expected_result": "Flutter timeline summary records steady 60fps rendering with < 4 dropped frames across test",
      "evidence_location": "Flutter timeline performance summary JSON",
      "pass_criterion": "Dropped frame count is < 4 and exit code is 0",
      "kind": "normal"
    },
    {
      "input": "50 queued local offline mutations reconciled upon network reconnection",
      "action": "dart test test/sync_reconciliation_test.dart",
      "expected_result": "Sync service flushes all 50 mutations to backend with average reconciliation time < 650 milliseconds",
      "evidence_location": "Sync reconciliation timing report in build/sync_report.json",
      "pass_criterion": "Average sync time < 650ms and 50 of 50 records confirmed with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Fastlane release build execution in CI environment",
      "action": "bundle exec fastlane build_release_apk",
      "expected_result": "Fastlane executes flutter analyze, runs test suite, and outputs release APK artifact",
      "evidence_location": "Fastlane build execution log and build/app/outputs/flutter-apk/app-release.apk",
      "pass_criterion": "Build succeeds with exit code 0 and release APK file exists",
      "kind": "normal"
    },
    {
      "input": "Dynamic offline item creation followed by network reconnection trigger",
      "action": "dart test test/dynamic_offline_test.dart --item-title 'Inspection Asset 4099'",
      "expected_result": "BLoC creates item locally in SQLite while offline, emits optimistic UI state, and syncs upon reconnect",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Backend receives Inspection Asset 4099 and local database marks sync_status=1 with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected cross-platform Flutter application using BLoC state management and SQLite offline sync; maintained sub-[COLD_START_TIME] millisecond cold start launch duration, and achieved sub-[SYNC_LATENCY] millisecond offline reconciliation across [RECORD_COUNT] queued mutations.",
    "claims": [
      {
        "text": "maintained sub-[COLD_START_TIME] millisecond cold start launch duration",
        "rubric_indexes": [0]
      },
      {
        "text": "achieved sub-[SYNC_LATENCY] millisecond offline reconciliation across [RECORD_COUNT] queued mutations",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "live app store production publisher account management or direct Bluetooth peripheral firmware flashing"
  },
  "verify": [
    "Run `flutter test` to verify BLoC state transitions, offline repositories, and widget tests pass.",
    "Execute `flutter drive --target=integration_test/scrolling_test.dart --profile` to verify 60fps rendering.",
    "Run `dart test test/dynamic_offline_test.dart` to assert dynamic offline queuing and automatic synchronization."
  ],
  "worksheet": {
    "q1": "Core deliverable: a cross-platform mobile app in Flutter/Dart with BLoC state management, offline SQLite syncing, and Fastlane CI/CD automation.",
    "q2": "Target users: mobile application engineers, cross-platform developers, and enterprise field tool architects.",
    "q3": "3 use cases: field technician offline asset inspections, delivery driver route tracking, and personal healthcare diaries.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: BLoC event-driven state decoupling, offline SQLite mutation queues with idempotent syncing, 60fps rendering optimization, and Fastlane build pipelines.",
    "q6": "Starter input: Flutter scaffolding, mock REST backend, Fastlane configs, and BLoC templates. Synthetic mock data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: Flutter Web or desktop Linux/Windows targets.",
    "q8": "Riskiest component: frame drops during complex list scrolling. Fallback: ListView.builder with automaticKeepAlive and pagination.",
    "q9": "Potential faking: mock sync flags without real SQLite. Anti-fake check 5 injects offline state, verifies SQLite record, restores network, asserts server reception.",
    "q10": "Safety/ethics: Safe; simulated equipment inspections and synthetic data only, zero private user records."
  }
}

b46_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Production Flutter App with BLoC State & CI/CD Pipeline | Generic headline | Minor |
| Claims / Marketing | Generic marketing text without concrete performance numbers | Unsubstantiated claims | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing Flutter scaffolding and mock backend test fixtures | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Flutter/Dart/SDK specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b46_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Flutter 3.16+ and Android emulator or desktop target at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Cold start (< 1,800ms), dropped frames (< 4 frames), and sync reconciliation (< 650ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Flutter Web or Linux/Windows desktop targets if Android Studio emulator is unavailable.",
  "Can test data be created in minutes?": "YES. Flutter test fixtures and mock backend REST server scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial app store publisher accounts and Bluetooth firmware flashing.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 tests offline item creation and asserts automated sync upon network reconnection.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b46_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved background GPS geofencing and biometric keystore auth to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic mobile metrics (cold start duration, 60fps frame stability, and offline sync reconciliation latency).
- Removed Banned Content: Cleaned generic marketing copy.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic offline sync test.
"""


# ==============================================================================
# 47. brief-multimodal-ai-app
# ==============================================================================
b47_data = {
  "id": "brief-multimodal-ai-app",
  "title": "Cross-Modal Multimodal AI Reasoning Platform Fusing Vision, Speech Audio & Text in PyTorch and FastAPI",
  "domain": "GenAI & LLM Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["API/backend service", "Data pipeline / ETL"],
  "problem": "Single-modal language and vision models fail catastrophically on tasks requiring joint understanding across disparate sensory inputs, such as visual anomaly inspection guided by spoken technical audio queries. Naively daisy-chaining independent monolithic models produces extreme end-to-end latency, out-of-sync multi-modal context buffers, and cascading transcription errors. This project builds a unified multimodal AI reasoning and retrieval platform in Python and PyTorch. The platform transcribes spoken audio queries using faster-whisper, extracts visual semantics and object embeddings via CLIP, fuses cross-modal representations into unified context vectors, performs multimodal question answering using local quantized vision-language models (LLaVA), and exposes real-time inference endpoints via asynchronous FastAPI.",
  "use_cases": [
    {
      "title": "Industrial Equipment Maintenance & Visual Inspection",
      "first_sentence": "Field maintenance engineers inspecting complex factory machinery need to photograph mechanical components while speaking diagnostic questions into headsets.",
      "second_sentence": "The system fuses the machine photograph with the spoken audio query, identifying equipment wear and returning step-by-step repair guidance within seconds."
    },
    {
      "title": "Retail Catalog Product Search & Verification",
      "first_sentence": "E-commerce shoppers frequently search for products by snapping mobile photos while verbally describing desired color, material, or brand preferences.",
      "second_sentence": "The engine aligns image embeddings with audio transcripts using joint vector projection, searching catalog databases and generating comparative product descriptions."
    },
    {
      "title": "Accessibility Assistant for Impaired Document Reading",
      "first_sentence": "Visually impaired users require assistive tools that process photographed printed documents and answer spoken questions regarding specific passages.",
      "second_sentence": "The platform analyzes document photos, interprets verbal questions, and synthesizes localized natural language answers grounded strictly in the visual text."
    }
  ],
  "hard_parts": [
    "Aligning heterogeneous cross-modal embedding spaces between dense image feature maps (CLIP) and sequential text tokens",
    "Minimizing composite inference pipeline latency across sequential ASR, vision encoding, and autoregressive language generation stages",
    "Implementing graceful degradation and modality dropout handling when image or audio inputs are corrupted or missing",
    "Running multi-model quantized inference (Whisper + CLIP + LLaVA) within 12GB to 16GB consumer GPU VRAM bounds"
  ],
  "screener_signals": [
    "Clean Python codebase cleanly separating modality encoders, cross-modal attention projection layers, and FastAPI serving endpoints",
    "Comprehensive ablation benchmark demonstrating that joint multimodal reasoning outperforms single-modal vision or text baselines",
    "Anti-fake verification script presenting an unobserved image with an embedded synthetic alphanumeric code and a spoken audio query, verifying correct fused answer generation"
  ],
  "job_families": [
    "Multimodal AI Engineer",
    "Computer Vision & NLP Scientist",
    "GenAI Systems Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing modality pipelines, tensor fusion logic, and FastAPI web services"},
    {"tool": "FastAPI", "role": "high-performance asynchronous framework exposing multi-part audio/image ingestion endpoints"},
    {"tool": "PyTorch", "role": "deep learning framework orchestrating tensor operations and model execution"},
    {"tool": "CLIP", "role": "vision-language embedding model providing zero-shot visual feature encoding and semantic alignment"},
    {"tool": "Whisper", "role": "speech recognition model converting candidate spoken audio queries into synchronized text tokens"},
    {"tool": "LLaVA", "role": "open-source vision-language foundation model generating textual reasoning from visual and text inputs"},
    {"tool": "Docker", "role": "containerization engine packaging multi-model dependencies and CUDA runtime environments"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Multipart Ingestion & Modality Validator Gateway",
        "tools_used": ["FastAPI", "Python"],
        "purpose": "Ingests concurrent binary image buffers and audio WAV streams, validating mime-types and dimensions"
      },
      {
        "name": "Acoustic Speech Transcription Pipeline",
        "tools_used": ["Python", "Whisper"],
        "purpose": "Transcribes incoming spoken audio queries into text tokens with normalized confidence scores"
      },
      {
        "name": "Visual Feature & Semantic Embedding Extractor",
        "tools_used": ["PyTorch", "CLIP"],
        "purpose": "Processes input images through vision transformers to generate dense semantic visual embeddings"
      },
      {
        "name": "Cross-Modal Reasoning & LLaVA Generation Engine",
        "tools_used": ["PyTorch", "LLaVA"],
        "purpose": "Fuses visual tokens with transcribed question prompts to autoregressively synthesize grounded answers"
      },
      {
        "name": "Multimodal Accuracy & Ablation Benchmark Suite",
        "tools_used": ["Python", "PyTorch"],
        "purpose": "Benchmarks multimodal reasoning accuracy against unimodal vision-only and text-only baselines"
      },
      {
        "name": "Inference Latency & VRAM Profiling Harness",
        "tools_used": ["PyTorch", "Docker"],
        "purpose": "Measures per-modality latency contributions and monitors peak GPU VRAM allocation under load"
      },
      {
        "name": "Multimodal Architecture Diagram & Fusion Protocol Guide",
        "tools_used": ["Docker"],
        "purpose": "Documents tensor projection layers, modality dropout handling, and serving deployment configurations"
      }
    ],
    "data_flow": "The client dispatches an HTTP multipart request containing an image file (JPEG/PNG) and a spoken audio query (WAV); the FastAPI gateway validates file headers and routes payloads in parallel; the Whisper pipeline transcribes the audio into a normalized question string; concurrently, CLIP processes the image into visual feature vectors; the fused context (visual tokens concatenated with prompt text) feeds into the quantized LLaVA vision-language model; LLaVA autoregressively decodes the response, grounding its reasoning in visual evidence; the structured JSON response streams back over HTTP.",
    "enforcement_mechanism": "Strict image resolution normalization (e.g. 336x336) and audio duration limits (max 30s) preventing out-of-memory GPU panics."
  },
  "targets": [
    {
      "metric": "Multimodal Cross-Modal Reasoning Accuracy",
      "method": "Percentage of 300 held-out multimodal test samples correctly answered requiring joint image and audio comprehension",
      "input": "300 multimodal test cases (image + audio query) where neither modality alone contains sufficient information",
      "environment": "Standard GPU instance (12GB+ VRAM) or local CPU evaluation harness",
      "minimum_pass": "Multimodal reasoning accuracy is >= 78.0% across 300 test samples",
      "target": "Multimodal reasoning accuracy is >= 88.5% across 300 test samples",
      "report": "Multimodal reasoning accuracy evaluation report and ablation comparison table"
    },
    {
      "metric": "End-to-End Multimodal Inference Latency",
      "method": "Wall-clock timing from HTTP request receipt to completed answer return across all three inference stages",
      "input": "100 sequential requests containing 512x512 images and 5-second audio query clips",
      "environment": "Single NVIDIA GPU (T4 / RTX 3060 / A10G) running PyTorch 2.1+ with 4-bit / 8-bit model quantization",
      "minimum_pass": "p95 end-to-end inference latency is < 6.5 seconds",
      "target": "p95 end-to-end inference latency is < 3.2 seconds",
      "report": "Multimodal inference latency profiling summary table"
    },
    {
      "metric": "Ablation Superiority Margin Over Single Modality",
      "method": "Accuracy margin of joint multimodal model over vision-only and text-only baseline models on paired evaluation set",
      "input": "200 paired ablation queries evaluated across unimodal vs multimodal configurations",
      "environment": "Standard 4-core local CPU or GPU evaluation harness",
      "minimum_pass": "Multimodal model demonstrates >= 18.0 percentage point accuracy margin over unimodal baselines",
      "target": "Multimodal model demonstrates >= 28.5 percentage point accuracy margin over unimodal baselines",
      "report": "Ablation study accuracy audit log and modality contribution matrix"
    }
  ],
  "skills": ["Python", "FastAPI", "PyTorch", "CLIP", "Whisper", "LLaVA", "Docker", "Computer Vision", "Speech Processing", "GenAI"],
  "starter_input": {
    "spec": "Directory of 1,000 paired image-audio-text benchmark samples (JPEG images, 16kHz WAV audio, JSON labels) and evaluation manifests.",
    "size": "1,000 image files (approx 45MB), 1,000 audio clips (approx 80MB), and benchmark evaluation ground truth JSON",
    "seeded_cases": "Corrupted audio header files, blank/black images, low-volume mumbled speech, and contradictory image-audio pairs",
    "label_source": "Expert annotated cross-modal question-answer pairs and standardized ScienceQA multimodal test subsets",
    "personal_data_policy": "Strictly public technical equipment diagrams and synthetic voice recordings; no real personal data used"
  },
  "components": [
    {"name": "Multipart Ingestion & Modality Validator Gateway", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Acoustic Speech Transcription Pipeline", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Visual Feature & Semantic Embedding Extractor", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Cross-Modal Reasoning & LLaVA Generation Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Multimodal Accuracy & Ablation Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 5.0},
    {"name": "Inference Latency & VRAM Profiling Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Multimodal Architecture Diagram & Fusion Protocol Guide", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic cross-attention projection layers fine-tuned on custom domain triplets using LoRA",
      "Real-time streaming text generation over WebSockets while vision encoding completes asynchronously",
      "Multi-image temporal sequence fusion processing video keyframes with synchronized audio"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Multipart Gateway & Speech Transcription in FastAPI, Python and Whisper",
      "hours": 10,
      "done_criterion": "FastAPI accepts multipart image/audio payloads; Whisper transcribes audio in < 800ms."
    },
    {
      "name": "Visual Embedding Extraction & LLaVA Reasoning in PyTorch, CLIP and LLaVA",
      "hours": 10,
      "done_criterion": "CLIP extracts visual embeddings; LLaVA generates answers grounded in visual tokens."
    },
    {
      "name": "Multimodal Accuracy & Ablation Benchmarking in Computer Vision and Speech Processing",
      "hours": 10,
      "done_criterion": "Multimodal model achieves >= 78% accuracy with >= 18 point margin over unimodal baselines."
    },
    {
      "name": "Inference Latency Profiling, Anti-Fake Test & Docs in Docker and GenAI",
      "hours": 10,
      "done_criterion": "Inference latency is < 6.5s; anti-fake test validates dynamic cross-modal reasoning; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, PyTorch tensor manipulation, and asynchronous API design with FastAPI",
    "Understanding of vision transformers (CLIP), automatic speech recognition (Whisper), and vision-language models"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "16GB RAM",
    "gpu": "12GB+ VRAM GPU recommended (Google Colab T4 / Kaggle free GPU / local NVIDIA GPU)",
    "cost": "$0 (fully executable on free Google Colab or Kaggle GPU tiers)",
    "accounts_keys_quotas": "Free HuggingFace account for downloading open weights (CLIP, Whisper, LLaVA)",
    "reference_environment": "Ubuntu 22.04 with NVIDIA GPU (12GB+ VRAM), PyTorch 2.1+, CUDA 12.1, and HuggingFace transformers",
    "fallback_path": "CPU inference mode using quantized smaller models (faster-whisper-tiny, CLIP-base, and Moondream/SmolVLM)"
  },
  "riskiest_component": {
    "name": "High Cumulative Latency and GPU VRAM Exhaustion Across Sequential Models",
    "mitigation": "Quantize LLaVA weights to 4-bit NF4, execute Whisper and CLIP sequentially to share peak VRAM buffers, and use torch.inference_mode.",
    "fallback": "Offload Whisper speech transcription to CPU and reserve GPU memory exclusively for LLaVA visual generation."
  },
  "deliverables": [
    "Git repository containing multimodal ingestion gateway, Whisper pipeline, CLIP extractor, and LLaVA engine",
    "Docker container packaging multi-model dependencies with GPU acceleration support",
    "Automated ablation evaluation suite comparing unimodal vs multimodal accuracy",
    "Screener verification script executing cross-modal inference and dynamic barcode verification in under 3 minutes"
  ],
  "out_of_scope": [
    "Training foundation multimodal vision-language models from scratch",
    "Medical diagnostic regulatory certification or clinical diagnostic deployment",
    "High-framerate 4K 60fps real-time video stream surveillance tracking"
  ],
  "safety_note": None,
  "resources": [
    "Visual Instruction Tuning (LLaVA Architecture and Weight Formats)",
    "CLIP: Connecting Text and Images (Radford et al., OpenAI)",
    "faster-whisper: High-Performance Speech Recognition Implementation Guide"
  ],
  "rubric": [
    {
      "input": "300 multimodal test cases requiring joint image and audio comprehension",
      "action": "python -m multimodal_app.evaluate_multimodal --test-file test_data/multimodal_eval.json",
      "expected_result": "Multimodal reasoning system achieves accuracy >= 78.0% across 300 test cases",
      "evidence_location": "Terminal test execution output log and reports/multimodal_accuracy.json",
      "pass_criterion": "Measured accuracy is >= 78.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "100 sequential requests containing 512x512 images and 5s audio clips",
      "action": "python scripts/benchmark_latency.py --samples 100",
      "expected_result": "System fulfills multimodal requests with p95 end-to-end latency < 6.5 seconds",
      "evidence_location": "Multimodal latency profiling report in reports/latency_summary.json",
      "pass_criterion": "p95 latency is < 6.5s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "200 paired ablation queries evaluated across unimodal vs multimodal configurations",
      "action": "python -m multimodal_app.evaluate_ablation --data test_data/ablation_queries.json",
      "expected_result": "Multimodal configuration achieves >= 18.0 percentage point accuracy margin over vision-only and text-only baselines",
      "evidence_location": "Ablation superiority matrix in reports/ablation_report.json",
      "pass_criterion": "Accuracy margin >= 18.0 points with exit code 0",
      "kind": "normal"
    },
    {
      "input": "HTTP multipart request containing image file and audio WAV file",
      "action": "curl -X POST http://localhost:8000/api/v1/reason -F 'image=@test_data/sample.jpg' -F 'audio=@test_data/query.wav'",
      "expected_result": "Server returns structured JSON containing transcript, visual_tokens, and grounded natural language answer",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and JSON contains non-empty answer and transcript fields",
      "kind": "normal"
    },
    {
      "input": "Dynamic unobserved test image with embedded synthetic barcode 'SN-9821' and spoken query 'Read the serial number'",
      "action": "python scripts/verify_dynamic_multimodal.py --image test_data/dynamic_barcode.png --audio test_data/audio_serial.wav",
      "expected_result": "Pipeline transcribes audio question, extracts visual patch from barcode, and synthesizes answer containing 'SN-9821'",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Answer string contains exact serial number 'SN-9821' with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected cross-modal reasoning platform in Python and PyTorch fusing Whisper audio and CLIP visual embeddings into LLaVA; achieved [MULTIMODAL_ACCURACY] accuracy across [TEST_SAMPLES] cross-modal queries, and delivered [ABLATION_MARGIN] percentage point superiority over unimodal baselines.",
    "claims": [
      {
        "text": "achieved [MULTIMODAL_ACCURACY] accuracy across [TEST_SAMPLES] cross-modal queries",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered [ABLATION_MARGIN] percentage point superiority over unimodal baselines",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "foundation vision-language pre-training from scratch or clinical medical diagnosis certification"
  },
  "verify": [
    "Run `python -m pytest tests/` to verify audio transcription, image feature extraction, and generation logic pass.",
    "Execute `python -m multimodal_app.evaluate_multimodal` to verify cross-modal accuracy meets the 78% benchmark.",
    "Run `python scripts/verify_dynamic_multimodal.py` to assert dynamic visual and audio reasoning on unseen inputs."
  ],
  "worksheet": {
    "q1": "Core deliverable: a multimodal reasoning platform in Python/PyTorch fusing Whisper audio and CLIP image embeddings into LLaVA generation with FastAPI.",
    "q2": "Target users: multimodal AI engineers, computer vision scientists, and applied GenAI platform architects.",
    "q3": "3 use cases: industrial equipment visual maintenance, retail product catalog search, and accessibility reading assistants.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: cross-modal embedding alignment between CLIP and text tokens, pipeline latency minimization across 3 heavy models, modality dropout resilience, and VRAM management.",
    "q6": "Starter input: 1,000 paired image-audio-text benchmark samples (JPEG images, 16kHz WAV audio, JSON manifests). Public and synthetic data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 16GB RAM, free Colab/Kaggle GPU, $0 cost, zero cloud accounts. Fallback: lightweight CPU models (Moondream/SmolVLM).",
    "q8": "Riskiest component: cumulative latency and VRAM exhaustion. Fallback: 4-bit quantization and sequential execution.",
    "q9": "Potential faking: pre-canned answer lookup. Anti-fake check 5 passes dynamic synthetic barcode image and audio query, asserts exact serial 'SN-9821' in answer.",
    "q10": "Safety/ethics: Safe; public technical equipment photos and synthetic audio recordings only, zero private or biometric data."
  }
}

b47_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Multimodal AI App (Vision + Text + Audio) | Generic headline | Minor |
| Claims / Marketing | 'Multimodal AI is the #1 research area at all major AI labs (OpenAI GPT-4V, Google Gemini, Anthropic Claude 3)...' | Named big tech models and labs as promotional hype | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing image-audio-text paired datasets | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No GPU/CUDA/VRAM specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b47_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs on free Google Colab / Kaggle GPU tiers or local 12GB GPU using Python, PyTorch, and LLaVA at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Multimodal accuracy (>= 78.0%), end-to-end latency (< 6.5s), and ablation superiority (>= 18.0 points) measured directly on target hardware.",
  "Is there a CPU/local/free fallback?": "YES. CPU inference mode using quantized smaller models (faster-whisper-tiny, CLIP-base, and Moondream/SmolVLM).",
  "Can test data be created in minutes?": "YES. Synthetic 1,000-sample multimodal dataset and benchmark questions included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: foundation pre-training from scratch and clinical medical diagnostic certification.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 feeds dynamic barcode image and audio query, asserting correct extracted serial code.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b47_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved cross-attention LoRA fine-tuning and multi-image temporal fusion to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic multimodal metrics (cross-modal reasoning accuracy, end-to-end pipeline latency, and ablation superiority margin).
- Removed Banned Content: Removed marketing references to GPT-4V, Gemini, and Claude 3.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic barcode extraction test.
"""


# ==============================================================================
# 48. brief-notification-service
# ==============================================================================
b48_data = {
  "id": "brief-notification-service",
  "title": "High-Throughput Multi-Channel Notification Orchestration Service with Deduplication, Rate Limiting & Channel Fallback",
  "domain": "Full-Stack Web",
  "difficulty": "INTERMEDIATE",
  "project_types": ["API/backend service", "Platform/infra tool"],
  "problem": "Modern applications communicating across email, SMS, mobile push, and chat channels suffer from duplicate message dispatches, uncoordinated user notification fatigue, and complete delivery failure when third-party gateway providers encounter outages. Tight coupling between business logic and downstream provider APIs creates brittle architectures without centralized delivery tracking or retry backoff. This project builds a high-throughput notification orchestration service in Node.js and TypeScript. The system buffers incoming events using RabbitMQ message queues, deduplicates messages using Redis sliding-window hashes, resolves user channel preferences, enforces per-user rate limits, routes to mock delivery providers with automatic fallback, and maintains an immutable delivery audit log in PostgreSQL.",
  "use_cases": [
    {
      "title": "E-Commerce Transactional Order & Delivery Notifications",
      "first_sentence": "Consumer retail platforms need to dispatch order confirmations, shipping updates, and one-time authentication codes reliably across multiple communication channels.",
      "second_sentence": "The service deduplicates rapid checkout triggers, routes critical delivery updates to mobile push notifications, and automatically falls back to SMS if push tokens are invalid."
    },
    {
      "title": "Digital Banking Security & Fraud Alert Dispatch",
      "first_sentence": "Financial services platforms require immediate, guaranteed delivery of suspicious debit alerts and transaction verification prompts to customer devices.",
      "second_sentence": "The platform prioritizes critical security alerts through high-priority message queues, tracking delivery confirmations and recording immutable timestamps for compliance audits."
    },
    {
      "title": "Enterprise Collaboration Team Notification Digests",
      "first_sentence": "Project management platforms serving thousands of corporate users need to prevent notification fatigue caused by rapid successive comment notifications.",
      "second_sentence": "The engine enforces per-user rate limiting and temporal batching, aggregating conversational mentions into formatted email and in-app digest summaries."
    }
  ],
  "hard_parts": [
    "Guaranteeing exactly-once notification delivery semantics across distributed workers using atomic Redis deduplication hashes",
    "Designing resilient priority queue topologies in RabbitMQ that prevent high-volume marketing batches from delaying critical authentication alerts",
    "Implementing dynamic channel fallback logic that detects third-party provider timeouts and re-routes messages without losing delivery context",
    "Managing per-user sliding-window rate limiters that prevent alert spam while preserving critical security notification overrides"
  ],
  "screener_signals": [
    "Clean TypeScript codebase cleanly separating queue consumers, channel provider adapters, user preference resolvers, and audit repositories",
    "High-throughput load benchmark report verifying 2,500+ notifications per second sustained processing with sub-350ms channel fallback",
    "Anti-fake verification script issuing duplicate notification payloads concurrently and verifying exactly one message is dispatched while the duplicate is suppressed"
  ],
  "job_families": [
    "Backend Infrastructure Engineer",
    "Distributed Systems Developer",
    "Core Platform Architect"
  ],
  "stack": [
    {"tool": "Node.js", "role": "runtime hosting the asynchronous event consumers, preference resolvers, and provider dispatch workers"},
    {"tool": "TypeScript", "role": "strongly typed language shared across notification contracts, queue messages, and database models"},
    {"tool": "RabbitMQ", "role": "message broker managing topic exchanges, priority delivery queues, and dead-letter channels"},
    {"tool": "Redis", "role": "in-memory store managing event deduplication fingerprints and sliding-window rate limit counters"},
    {"tool": "PostgreSQL", "role": "relational database maintaining user preferences, channel credentials, and immutable audit logs"},
    {"tool": "Docker", "role": "containerization engine hosting local RabbitMQ, Redis, and PostgreSQL instances for development"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Notification Ingestion API & Priority RabbitMQ Producer",
        "tools_used": ["Node.js", "TypeScript", "RabbitMQ"],
        "purpose": "Ingests notification requests, assigns priority classes, and publishes messages to RabbitMQ topic exchanges"
      },
      {
        "name": "Redis Event Deduplicator & Rate Limit Guard",
        "tools_used": ["Node.js", "Redis"],
        "purpose": "Checks SHA-256 event fingerprints to eliminate duplicate dispatches and enforces per-user rate limits"
      },
      {
        "name": "User Channel Preference & Routing Resolver",
        "tools_used": ["Node.js", "PostgreSQL"],
        "purpose": "Queries recipient preferences, quiet hours, and channel opt-outs to determine the optimal delivery channel"
      },
      {
        "name": "Multi-Channel Provider Dispatcher & Fallback Engine",
        "tools_used": ["Node.js", "TypeScript"],
        "purpose": "Dispatches payloads to mock email, SMS, and push providers, automatically failing over to secondary channels"
      },
      {
        "name": "Delivery Audit Logger & Benchmark Harness",
        "tools_used": ["PostgreSQL", "Docker"],
        "purpose": "Records delivery status transitions (Queued, Sent, Delivered, Failed) and benchmarks ingestion throughput"
      }
    ],
    "data_flow": "An upstream service dispatches a notification request over REST; the ingestion API computes a SHA-256 event fingerprint; Redis checks whether the fingerprint was processed within the sliding window; if unique, the message publishes to RabbitMQ with a priority header; queue workers consume the message, check user channel preferences and rate limits in PostgreSQL; the worker dispatches the notification to the primary channel adapter (e.g. Push); if the provider times out or fails, the fallback engine re-routes the message to the secondary channel (e.g. SMS); delivery status updates commit to PostgreSQL.",
    "enforcement_mechanism": "Redis SETNX with TTL for atomic idempotency; RabbitMQ dead-letter exchanges (DLX) isolating poisoned messages after 3 retries."
  },
  "targets": [
    {
      "metric": "Notification Deduplication Accuracy Rate",
      "method": "Percentage of intentionally duplicated notification payloads correctly suppressed within sliding time window",
      "input": "1,000 paired duplicate notification requests issued simultaneously across 10 concurrent worker threads",
      "environment": "Standard 4-core local CPU, Redis 7 in Docker, Node.js 18+ runtime",
      "minimum_pass": "1,000 of 1,000 duplicate payloads suppressed with 0 duplicate delivery executions",
      "target": "1,000 of 1,000 duplicate payloads suppressed with 0 duplicate delivery executions",
      "report": "Deduplication benchmark audit log and Redis idempotency verification summary"
    },
    {
      "metric": "Sustained Message Ingestion and Routing Throughput",
      "method": "Sustained notification requests ingested, deduplicated, and queued per second across RabbitMQ topic exchange",
      "input": "20,000 synthetic notification events published across high and normal priority topics",
      "environment": "Standard 4-core local CPU, RabbitMQ 3.12+ in Docker, local network loopback",
      "minimum_pass": "Publish throughput is >= 2,500 notifications per second",
      "target": "Publish throughput is >= 5,500 notifications per second",
      "report": "RabbitMQ ingestion throughput log and performance summary table"
    },
    {
      "metric": "Automated Channel Fallback Routing Duration",
      "method": "Duration from primary channel provider timeout detection to successful delivery dispatch via secondary channel",
      "input": "30 simulated primary channel provider failure chaos scenarios during active message processing",
      "environment": "Mock provider simulator with configurable latency and error injection (HTTP 500 / timeout)",
      "minimum_pass": "Average channel fallback duration is < 350 milliseconds across 30 trials",
      "target": "Average channel fallback duration is < 120 milliseconds across 30 trials",
      "report": "Provider failover timing report and delivery audit verification"
    }
  ],
  "skills": ["Node.js", "TypeScript", "RabbitMQ", "Redis", "PostgreSQL", "Docker", "Distributed Systems", "Full-Stack Web", "API Design"],
  "starter_input": {
    "spec": "Directory of notification schemas, mock provider simulator scripts (email, SMS, push webhook stubs), and PostgreSQL migrations.",
    "size": "5 TypeScript interface definitions, 3 mock provider servers, and 20,000 synthetic event JSON manifests",
    "seeded_cases": "Identical event fingerprints sent concurrently, invalid phone number formats, upstream 503 gateway drops, and quiet hour boundaries",
    "label_source": "Deterministic mock provider delivery logs and PostgreSQL audit status manifests",
    "personal_data_policy": "Strictly mock synthetic phone numbers and simulated email addresses; zero real personal data used"
  },
  "components": [
    {"name": "Notification Ingestion API & Priority RabbitMQ Producer", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Redis Event Deduplicator & Rate Limit Guard", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "User Channel Preference & Routing Resolver", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Multi-Channel Provider Dispatcher & Fallback Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Delivery Audit Logger & Benchmark Harness", "task_type": "load or performance test harness + report", "hours": 4.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic template rendering engine compiling localized Handlebars/MJML email templates with responsive styling",
      "In-app notification real-time delivery via WebSockets with instant unread badge counter updates",
      "Prometheus metrics exporter and Grafana dashboard tracking channel delivery success rates and latencies"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "RabbitMQ Ingestion & Priority Topic Exchanges in Node.js and TypeScript",
      "hours": 7,
      "done_criterion": "Ingestion API accepts notifications and queues messages to priority RabbitMQ exchanges."
    },
    {
      "name": "Redis Event Deduplication & Rate Limiting in Redis and Docker",
      "hours": 7,
      "done_criterion": "Redis deduplicates 1,000 duplicate events; sliding-window limiter blocks excess requests."
    },
    {
      "name": "Multi-Channel Fallback & Distributed Systems Audit in PostgreSQL and Full-Stack Web",
      "hours": 7,
      "done_criterion": "Worker executes fallback from Push to SMS in < 350ms; audit log records transitions."
    },
    {
      "name": "High-Throughput Benchmarking, Anti-Fake Test & Docs in API Design",
      "hours": 7,
      "done_criterion": "Benchmark verifies 2,500 msg/sec; anti-fake test validates deduplication; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Node.js asynchronous programming (Promises, async/await, event loops) and TypeScript",
    "Familiarity with message brokers (RabbitMQ/AMQP), Redis key-value structures, and PostgreSQL relational design"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound backend service)",
    "cost": "$0 (fully open-source software stack using Docker Desktop)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required (uses local mock providers)",
    "reference_environment": "Local 4-core CPU with Docker Desktop (RabbitMQ 3.12, Redis 7, PostgreSQL 15 containers) and Node.js 18+",
    "fallback_path": "In-memory mock queues and dictionary stores if Docker daemon is unavailable"
  },
  "riskiest_component": {
    "name": "RabbitMQ Memory Pressure and Connection Starvation Under Sudden Event Bursts",
    "mitigation": "Configure prefetch counts on consumer channels, apply message TTLs, and configure RabbitMQ high watermark alarms.",
    "fallback": "Spill excess messages to durable disk-backed dead-letter queues."
  },
  "deliverables": [
    "Git repository containing Node.js notification orchestration service, TypeScript models, and migrations",
    "Mock provider simulation suite with configurable latency and error injection (email, SMS, push)",
    "Automated performance test harness measuring publish throughput and channel fallback durations",
    "Screener verification script executing automated benchmark and dynamic duplicate suppression test in under 2 minutes"
  ],
  "out_of_scope": [
    "Commercial telecom carrier SMPP protocol direct gateway trunk connections",
    "Direct Apple APNs and Google FCM production push certificate provisioning",
    "Marketing campaign drag-and-drop visual email builder user interfaces"
  ],
  "safety_note": None,
  "resources": [
    "RabbitMQ AMQP 0-9-1 Protocol and Priority Queue Architecture Guide",
    "Redis Documentation: Atomic Idempotency with SETNX and Sliding Window Limits",
    "Enterprise Integration Patterns: Message Router and Dead Letter Channel Patterns"
  ],
  "rubric": [
    {
      "input": "1,000 paired duplicate notification requests issued simultaneously",
      "action": "npm run test:dedup -- --samples 1000",
      "expected_result": "Redis deduplication engine suppresses all 1,000 duplicates with 0 redundant deliveries",
      "evidence_location": "Terminal test execution output log and reports/dedup_report.json",
      "pass_criterion": "1,000 of 1,000 duplicate payloads suppressed with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20,000 synthetic notification events published across topic exchanges",
      "action": "node scripts/benchmark_throughput.js --events 20000 --concurrency 50",
      "expected_result": "Service sustains publish throughput >= 2,500 notifications per second with zero message loss",
      "evidence_location": "Throughput benchmark profiling report in reports/throughput_summary.json",
      "pass_criterion": "Measured throughput is >= 2,500 msg/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "30 simulated primary channel provider timeout failure injections",
      "action": "node scripts/test_channel_fallback.js --trials 30 --timeout-ms 200",
      "expected_result": "Worker catches timeout and completes delivery via secondary channel in average duration < 350ms",
      "evidence_location": "Channel fallback timing log in reports/fallback_audit.json",
      "pass_criterion": "Average fallback duration < 350ms across 30 trials with exit code 0",
      "kind": "normal"
    },
    {
      "input": "REST request querying notification status delivery history by event ID",
      "action": "curl http://localhost:3000/api/v1/notifications/evt_test_12345/status",
      "expected_result": "Server returns structured JSON payload showing timeline: QUEUED, PRIMARY_FAILED, FALLBACK_DELIVERED",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and JSON contains delivery_timeline array with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic notification dispatch with duplicate event ID sent concurrently",
      "action": "node scripts/verify_dynamic_dedup.js --event-id evt_dynamic_9872",
      "expected_result": "First request routes to provider; second duplicate request suppressed with cached status return",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Verification confirms provider called exactly once and second call logged 'DUPLICATE_SUPPRESSED' with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected multi-channel notification orchestration platform in Node.js and TypeScript using RabbitMQ and Redis; achieved sub-[FALLBACK_LATENCY] millisecond channel fallback diversion across [TRIAL_COUNT] chaos trials, and sustained [THROUGHPUT_MSG_SEC] message ingestion throughput.",
    "claims": [
      {
        "text": "achieved sub-[FALLBACK_LATENCY] millisecond channel fallback diversion across [TRIAL_COUNT] chaos trials",
        "rubric_indexes": [2]
      },
      {
        "text": "sustained [THROUGHPUT_MSG_SEC] message ingestion throughput",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "direct telecom carrier SMPP trunk connections or live commercial Apple APNs certificate hosting"
  },
  "verify": [
    "Run `npm test` across services to confirm queue consumer, rate limiting, and provider adapter tests pass.",
    "Execute `node scripts/benchmark_throughput.js` to verify message ingestion throughput meets the 2,500 msg/sec benchmark.",
    "Run `node scripts/verify_dynamic_dedup.js` to assert duplicate notification suppression and single delivery execution."
  ],
  "worksheet": {
    "q1": "Core deliverable: a multi-channel notification orchestration service in Node.js/TypeScript with RabbitMQ queues, Redis deduplication, and PostgreSQL audit logging.",
    "q2": "Target users: backend infrastructure engineers, distributed systems developers, and core platform architects.",
    "q3": "3 use cases: e-commerce order status updates, digital banking security alerts, and enterprise team digests.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: atomic Redis deduplication hashes, priority queue isolation in RabbitMQ, dynamic channel fallback routing, and sliding-window rate limiting.",
    "q6": "Starter input: notification event schemas, mock provider simulator scripts, and PostgreSQL migrations. Synthetic mock data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory mock queues without Docker.",
    "q8": "Riskiest component: RabbitMQ memory pressure under sudden bursts. Fallback: consumer prefetch limits and dead-letter queue spillage.",
    "q9": "Potential faking: pre-canned provider success logs. Anti-fake check 5 sends duplicate dynamic event IDs concurrently, asserts second call suppressed.",
    "q10": "Safety/ethics: Safe; local loopback mock providers and synthetic phone numbers only, zero live consumer spam."
  }
}

b48_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Multi-Channel Notification Orchestration Service | Generic headline | Minor |
| Claims / Marketing | 'top tech platforms, Zomato, top tech platforms, HDFC Bank... WhatsApp Business API, Twilio...' | Named Indian consumer tech brands and contains banned phrase 'top tech platforms' | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing notification event schemas and mock provider suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Docker or Node.js runtime specs | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b48_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Node.js 18+, Docker Desktop, and mock providers at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Deduplication accuracy (1,000 of 1,000), throughput (>= 2,500 msg/sec), and fallback duration (< 350ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory mock queue and cache modules if Docker is unavailable; local mock provider scripts requiring zero paid API spend.",
  "Can test data be created in minutes?": "YES. Synthetic 20,000-event generator and mock provider scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: commercial telecom SMPP trunks and live Apple APNs certificate hosting.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 sends concurrent duplicate dynamic events and asserts second call is suppressed with 0 duplicate delivery.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 2 and 1."
}

b48_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved MJML email compilation and WebSocket in-app delivery to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic notification service metrics (deduplication accuracy, publish throughput, and channel fallback latency).
- Removed Banned Content: Removed marketing references to Zomato, HDFC Bank, and removed 'top tech platforms' placeholder.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic deduplication test.
"""


# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_5_part1():
    res44 = process_brief(b44_data, b44_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b44_reviewer, b44_changelog)
    res45 = process_brief(b45_data, b45_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b45_reviewer, b45_changelog)
    res46 = process_brief(b46_data, b46_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b46_reviewer, b46_changelog)
    res47 = process_brief(b47_data, b47_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b47_reviewer, b47_changelog)
    res48 = process_brief(b48_data, b48_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b48_reviewer, b48_changelog)
    return [res44, res45, res46, res47, res48]

if __name__ == "__main__":
    results = run_batch_5_part1()
    print("Batch 5 Part 1 finished successfully:", results)
