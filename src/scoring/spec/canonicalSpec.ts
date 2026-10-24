// ============================================================
// HireFlow Scoring Suite — Canonical Scoring Specification
// Version: 2.4.0 (India Market & Standard Technology Tracks)
// Single Source of Truth: All tools and documentation derive here.
// ============================================================

import { ScoringSpec } from './types';

export const CANONICAL_SCORING_SPEC: ScoringSpec = {
  specVersion: '2.4.0',
  engineVersion: '4.0.0',

  pillars: [
    {
      id: 'requirement_coverage',
      label: 'Requirement Coverage',
      plainDescription:
        'Matches candidate technical skill evidence against target job description requirements with placement-based evidence weighting.',
      computeId: 'compute_requirement_coverage',
      appliesWhen: ['rule_always_applies'],
      nominalWeights: {
        fresher: 40,
        experienced: 35,
      },
      subFeatures: [
        {
          id: 'sub_must_have_skills',
          label: 'Mandatory / Must-Have Requirements',
          description: 'Direct, transferable, or implied demonstration of core required technologies.',
          nominalWeight: 75,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_preferred_skills',
          label: 'Preferred / Nice-to-Have Skills',
          description: 'Coverage on secondary technologies, cloud platforms, and tooling.',
          nominalWeight: 25,
          sourceKind: 'editorial',
        },
      ],
    },
    {
      id: 'evidence_quality',
      label: 'Evidence Quality',
      plainDescription:
        'Measures the presence of quantifiable engineering outcomes, decisive action verbs, and technologies demonstrated within active work context.',
      computeId: 'compute_evidence_quality',
      appliesWhen: ['rule_has_bullets'],
      nominalWeights: {
        fresher: 25,
        experienced: 25,
      },
      subFeatures: [
        {
          id: 'sub_action_verbs',
          label: 'Decisive Action Verbs',
          description: 'Strong architectural and engineering verbs versus passive task descriptions.',
          nominalWeight: 20,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_measured_results',
          label: 'Measured Outcomes & Metrics',
          description: 'Verifiable numerical figures tied to latency, throughput, scale, or accuracy.',
          nominalWeight: 30,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_tech_in_context',
          label: 'Technology in Context',
          description: 'Skills named alongside concrete operational actions rather than keyword lists.',
          nominalWeight: 25,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_outcome_impact',
          label: 'Business & System Impact',
          description: 'Clear statement of consequence: problem resolved, performance gain, or cost reduction.',
          nominalWeight: 25,
          sourceKind: 'editorial',
        },
      ],
    },
    {
      id: 'project_readiness',
      label: 'Project & Practical Readiness',
      plainDescription:
        'Evaluates hands-on engineering rigor, role-specific architecture depth, test coverage, and verifiable repository or deployment links.',
      computeId: 'compute_project_readiness',
      appliesWhen: ['rule_always_applies'],
      nominalWeights: {
        fresher: 20,
        experienced: 15,
      },
      subFeatures: [
        {
          id: 'sub_architecture_depth',
          label: 'Architecture & Systems Depth',
          description: 'Role-specific architectural depth: queuing, concurrency, caching, or responsive layouts.',
          nominalWeight: 35,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_production_rigor',
          label: 'Production Rigor & Testing',
          description: 'Automated test suites, CI/CD workflows, Docker packaging, and deployment traces.',
          nominalWeight: 30,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_quantified_engineering_metrics',
          label: 'Quantified Engineering Metrics',
          description: 'System-level benchmarks: p99 latency drops, throughput increases, or Lighthouse scores.',
          nominalWeight: 20,
          sourceKind: 'editorial',
        },
        {
          id: 'sub_practical_artifacts',
          label: 'Verified Practical Artifacts',
          description: 'Presence of GitHub repository links, live demo URLs, competitive programming, or hackathons.',
          nominalWeight: 15,
          sourceKind: 'editorial',
        },
      ],
    },
    {
      id: 'parser_friendliness',
      label: 'Parser-Friendliness',
      plainDescription:
        'Audits document layout cleanliness, standard section hierarchy, text extractability, and absence of multi-column parsing hazards.',
      computeId: 'compute_parser_friendliness',
      appliesWhen: ['rule_always_applies'],
      nominalWeights: {
        fresher: 15,
        experienced: 10,
      },
      subFeatures: [
        {
          id: 'sub_standard_section_structure',
          label: 'Standard Section Hierarchy',
          description: 'Standard headings (Experience, Education, Projects, Skills) recognized by applicant tracking parsers.',
          nominalWeight: 50,
          sourceKind: 'official',
        },
        {
          id: 'sub_layout_cleanliness',
          label: 'Layout Cleanliness & Linear Flow',
          description: 'Single-column text flow, clear contact details, and absence of complex text boxes.',
          nominalWeight: 35,
          sourceKind: 'official',
        },
        {
          id: 'sub_regional_advisories',
          label: 'Regional Advisory Standards',
          description: 'Checks for Indian campus resume anti-patterns (photos, declarations, father name).',
          nominalWeight: 15,
          sourceKind: 'editorial',
        },
      ],
    },
    {
      id: 'experience_fit',
      label: 'Experience & Seniority Fit',
      plainDescription:
        'Continuous piecewise alignment between candidate career tenure and target job experience expectations.',
      computeId: 'compute_experience_fit',
      appliesWhen: ['rule_requires_experience'],
      nominalWeights: {
        fresher: 0,
        experienced: 15,
      },
      subFeatures: [
        {
          id: 'sub_tenure_alignment',
          label: 'Tenure & Seniority Alignment',
          description: 'Evaluates candidate years against minimum years requested by target role.',
          nominalWeight: 100,
          sourceKind: 'editorial',
        },
      ],
    },
  ],

  profiles: [
    {
      id: 'fresher',
      label: 'Fresher / Early Career (0–2 yrs)',
      selectorRules: ['rule_is_fresher_candidate'],
      weights: {
        requirement_coverage: 40,
        evidence_quality: 25,
        project_readiness: 20,
        parser_friendliness: 15,
        experience_fit: 0,
      },
      note: 'Editorial default calibrated for Indian campus recruitment drives and entry-level engineering cohorts.',
    },
    {
      id: 'experienced',
      label: 'Experienced Professional (2+ yrs)',
      selectorRules: ['rule_is_experienced_candidate'],
      weights: {
        requirement_coverage: 35,
        evidence_quality: 25,
        project_readiness: 15,
        parser_friendliness: 10,
        experience_fit: 15,
      },
      note: 'Editorial default calibrated for lateral hiring incorporating seniority alignment.',
    },
  ],

  applicabilityRules: [
    {
      id: 'rule_always_applies',
      description: 'Pillar evaluates unconditionally on every resume scan.',
      predicateId: 'always_true',
    },
    {
      id: 'rule_has_bullets',
      description: 'Pillar applies only when at least one experience or project bullet point is detected.',
      predicateId: 'has_bullet_points',
    },
    {
      id: 'rule_requires_experience',
      description: 'Pillar applies when target role specifies professional experience (>1 year) and candidate is not entry-level/fresher.',
      predicateId: 'has_experience_requirement',
    },
    {
      id: 'rule_is_fresher_candidate',
      description: 'Candidate experience level is Student, Intern, or 0–2 years.',
      predicateId: 'is_fresher_level',
    },
    {
      id: 'rule_is_experienced_candidate',
      description: 'Candidate experience level is 2+ years.',
      predicateId: 'is_experienced_level',
    },
  ],

  evidenceTables: {
    contextWeight: {
      experience: 1.0,
      projectWithLink: 0.8,
      academicProject: 0.6,
      skillsBlockOnly: 0.35,
    },

    bulletScoring: {
      actionVerbMax: 20,
      measuredResultMax: 30,
      techInContextMax: 25,
      outcomeImpactMax: 25,
      verbClasses: {
        strong: 20,
        standard: 15,
        weak: 6,
        none: 0,
      },
      measuredResultClasses: {
        metricWithNoun: 30,
        qualitativeResult: 12,
        none: 0,
      },
      techContextClasses: {
        inContext: 25,
        bareList: 8,
        none: 0,
      },
      outcomeClasses: {
        explicit: 25,
        implied: 10,
        none: 0,
      },
    },

    priorityWeights: {
      mandatory: 3.0,
      preferred: 1.5,
      mentioned: 1.0,
    },

    implicationEdges: [
      {
        fromSkill: 'Next.js',
        toSkill: 'React',
        type: 'STRONG',
        creditMultiplier: 0.5,
        rationale: 'Next.js is a React meta-framework; building with Next.js establishes baseline React competence.',
      },
      {
        fromSkill: 'TypeScript',
        toSkill: 'JavaScript',
        type: 'STRONG',
        creditMultiplier: 0.5,
        rationale: 'TypeScript is a typed superset of JavaScript; TS proficiency implies JS fundamentals.',
      },
      {
        fromSkill: 'Kotlin',
        toSkill: 'Java',
        type: 'STRONG',
        creditMultiplier: 0.5,
        rationale: 'Kotlin compiles to JVM bytecode and interoperates directly with standard Java libraries.',
      },
      {
        fromSkill: 'FastAPI',
        toSkill: 'Python',
        type: 'STRONG',
        creditMultiplier: 0.5,
        rationale: 'FastAPI is built on Python type annotations and modern async Python primitives.',
      },
      {
        fromSkill: 'Spring Boot',
        toSkill: 'Java',
        type: 'STRONG',
        creditMultiplier: 0.5,
        rationale: 'Spring Boot is the standard enterprise backend framework for the Java ecosystem.',
      },
      {
        fromSkill: 'Amazon EKS',
        toSkill: 'Docker',
        type: 'WEAK',
        creditMultiplier: 0.0,
        rationale: 'Deploying manifests on managed Kubernetes does not prove container build or optimization skills.',
      },
      {
        fromSkill: 'AWS',
        toSkill: 'Linux',
        type: 'WEAK',
        creditMultiplier: 0.0,
        rationale: 'Console or SDK usage of AWS does not guarantee Linux system administration skills.',
      },
    ],

    parserFriendliness: {
      baseScore: 100,
      deductions: [
        {
          id: 'deduct_missing_contact',
          label: 'Missing Contact Details',
          severity: 'high',
          deductionPoints: 15,
          description: 'Resume lacks email address or phone number in header block.',
        },
        {
          id: 'deduct_missing_sections',
          label: 'Missing Standard Sections',
          severity: 'medium',
          deductionPoints: 12,
          description: 'Document lacks recognizable Experience, Education, Projects, or Skills headers.',
        },
        {
          id: 'deduct_stuffing_penalty',
          label: 'Keyword Stuffing Detected',
          severity: 'high',
          deductionPoints: 15,
          description: 'Over 60% of listed technical skills have zero supporting project or work bullets.',
        },
        {
          id: 'deduct_short_document',
          label: 'Insufficient Document Length',
          severity: 'high',
          deductionPoints: 20,
          description: 'Word count falls below minimum evaluation threshold (under 100 words).',
        },
      ],
      advisories: [
        {
          id: 'adv_photo_included',
          label: 'Photograph in Resume',
          severity: 'advisory',
          deductionPoints: 2,
          description: 'Global ATS parsers flag profile pictures; photos risk unintended bias and parsing errors.',
        },
        {
          id: 'adv_declaration_statement',
          label: 'Personal Declaration Statement',
          severity: 'advisory',
          deductionPoints: 2,
          description: 'Outdated legacy statements ("I hereby declare...") consume valuable vertical space.',
        },
        {
          id: 'adv_personal_identifiers',
          label: 'Excessive Personal Identifiers',
          severity: 'advisory',
          deductionPoints: 2,
          description: 'Father name, marital status, or full street address should be omitted in modern software resumes.',
        },
      ],
    },

    caps: {
      maxComposite: 100,
      minComposite: 0,
      maxPillarScore: 100,
      minPillarScore: 0,
      maxBulletScore: 100,
      minBulletScore: 0,
    },
  },

  roleSignalLibraries: {
    Backend: {
      roleFamily: 'Backend',
      architectureKeywords: [
        'redis', 'kafka', 'rabbitmq', 'connection pooling', 'caching', 'microservices',
        'grpc', 'distributed transactions', 'idempotency', 'circuit breaker', 'sharding',
      ],
      productionPatterns: [
        'docker', 'kubernetes', 'ci/cd', 'github actions', 'unit tests', 'integration tests',
        'prometheus', 'grafana', 'datadog', 'aws', 'gcp', 'postgresql', 'mysql',
      ],
      outcomeMetrics: [
        'latency', 'p99', 'p95', 'qps', 'rps', 'throughput', 'queries/sec', 'requests/sec', 'mb/s',
      ],
      craftsmanshipSignals: [
        'hexagonal architecture', 'clean architecture', 'domain-driven design', 'event-driven',
        'type hints', 'strict mode', 'database migrations',
      ],
    },

    Frontend: {
      roleFamily: 'Frontend',
      architectureKeywords: [
        'component architecture', 'state management', 'code splitting', 'bundle size',
        'server-side rendering', 'client-side routing', 'design system', 'design tokens',
      ],
      productionPatterns: [
        'vitest', 'jest', 'react testing library', 'playwright', 'cypress', 'storybook',
        'tailwind css', 'vite', 'webpack', 'next.js',
      ],
      outcomeMetrics: [
        'lcp', 'fid', 'cls', 'lighthouse', 'load time', 'bundle reduction', 'fps',
      ],
      craftsmanshipSignals: [
        'wcag', 'aria', 'accessibility', 'typescript', 'reusable components', 'responsive design',
      ],
    },

    'Full-stack': {
      roleFamily: 'Full-stack',
      architectureKeywords: [
        'restful api', 'graphql', 'client-server', 'microservices', 'caching', 'relational database',
      ],
      productionPatterns: [
        'docker', 'ci/cd', 'automated tests', 'postgresql', 'react', 'node.js', 'typescript',
      ],
      outcomeMetrics: [
        'latency', 'users', 'conversion', 'build time', 'load time',
      ],
      craftsmanshipSignals: [
        'clean code', 'modular architecture', 'type safety', 'end-to-end integration',
      ],
    },

    'Data/ML': {
      roleFamily: 'Data/ML',
      architectureKeywords: [
        'data pipeline', 'feature store', 'model training', 'inference server', 'batch processing',
        'etl', 'embedding', 'vector search',
      ],
      productionPatterns: [
        'pytorch', 'tensorflow', 'scikit-learn', 'mlflow', 'airflow', 'spark', 'fastapi', 'docker',
      ],
      outcomeMetrics: [
        'accuracy', 'f1', 'f1-score', 'auc', 'roc', 'precision', 'recall', 'map', 'inference latency',
      ],
      craftsmanshipSignals: [
        'reproducibility', 'data validation', 'model versioning', 'experiment tracking', 'quantization',
      ],
    },

    Mobile: {
      roleFamily: 'Mobile',
      architectureKeywords: [
        'mvvm', 'mvi', 'clean architecture', 'offline-first', 'background sync', 'dependency injection',
        'coroutines', 'modularization',
      ],
      productionPatterns: [
        'jetpack compose', 'swiftui', 'room database', 'hilt', 'retrofit', 'workmanager',
        'fastlane', 'firebase crashlytics',
      ],
      outcomeMetrics: [
        'crash-free', 'downloads', 'cold start', 'frame rate', 'app size', 'memory footprint',
      ],
      craftsmanshipSignals: [
        'baseline profiles', 'null safety', 'smooth animations', 'battery optimization',
      ],
    },

    DevOps: {
      roleFamily: 'DevOps',
      architectureKeywords: [
        'infrastructure as code', 'gitops', 'service mesh', 'container orchestration',
        'zero-trust', 'observability', 'disaster recovery',
      ],
      productionPatterns: [
        'terraform', 'kubernetes', 'docker', 'helm', 'github actions', 'jenkins',
        'prometheus', 'grafana', 'aws', 'gcp', 'linux',
      ],
      outcomeMetrics: [
        'deployment duration', 'build time', 'uptime', 'sla', 'recovery time', 'cost savings',
      ],
      craftsmanshipSignals: [
        'immutable infrastructure', 'least privilege iam', 'multi-stage builds', 'automated rollbacks',
      ],
    },

    General: {
      roleFamily: 'General',
      architectureKeywords: [
        'data structures', 'algorithms', 'operating systems', 'networks', 'concurrency', 'oop',
      ],
      productionPatterns: [
        'git', 'unit testing', 'clean code', 'documentation', 'code review',
      ],
      outcomeMetrics: [
        'efficiency', 'complexity', 'test coverage', 'benchmarks',
      ],
      craftsmanshipSignals: [
        'algorithmic rigor', 'idiomatic conventions', 'defensive programming',
      ],
    },
  },

  bandParameters: {
    weightPerturbationFactor: 0.2, // perturb applicable weights by x0.8 and x1.2
    confidenceThreshold: 0.75,     // requirement classification confidence threshold
    stableWidthMax: 6,             // <= 6 points width
    moderateWidthMax: 12,          // <= 12 points width
    stableLabel: 'Stable',
    moderateLabel: 'Moderate',
    sensitiveLabel: 'Sensitive',
  },

  experienceFitParameters: {
    maxGapYearsTolerance: 0,
    penaltySlopePerYear: 20,       // -20 points per year gap between candidate & requirement
    minFloorScore: 10,             // floor at 10 points
    maxScore: 100,
  },

  labelThresholds: {
    withinReach: 75,
    stretch: 50,
    far: 0,
  },

  taxonomyReference: {
    version: '2026.1',
    sourceFile: 'src/data/ats/skills-taxonomy.json',
  },

  provenance: [
    {
      tableId: 'pillars',
      sourceKind: 'editorial',
      lastReviewed: '2026-10-24',
      citation: 'HireFlow Editorial Standards Board (India Tech Placement Cohort)',
      notes: 'Pillar nominal weights represent baseline editorial defaults for fresher and lateral evaluation.',
    },
    {
      tableId: 'evidenceTables.contextWeight',
      sourceKind: 'editorial',
      lastReviewed: '2026-10-24',
      citation: 'Technical Evaluation Rubric (Experience 1.0, Project 0.8, Academic 0.6, Skills 0.35)',
      notes: 'Calibrated to differentiate verified production accomplishments from ungrounded keyword claims.',
    },
    {
      tableId: 'evidenceTables.bulletScoring',
      sourceKind: 'editorial',
      lastReviewed: '2026-10-24',
      citation: 'STAR / XYZ Engineering Bullet Standard (Action 20, Metric 30, Context 25, Impact 25)',
      notes: 'Strict 100-point ceiling enforced on every bullet item.',
    },
    {
      tableId: 'evidenceTables.priorityWeights',
      sourceKind: 'editorial',
      lastReviewed: '2026-10-24',
      citation: 'JD Requirement Importance Multipliers (Mandatory 3.0, Preferred 1.5, Mentioned 1.0)',
      notes: 'Gives highest weight to core non-negotiable requirements.',
    },
    {
      tableId: 'evidenceTables.implicationEdges',
      sourceKind: 'editorial',
      lastReviewed: '2026-10-24',
      citation: 'Technology Implication Taxonomy (Strong 0.5x credit, Weak 0.0x)',
      notes: 'Implication credit applies strictly for verified parent-child technology ecosystems.',
    },
    {
      tableId: 'evidenceTables.parserFriendliness',
      sourceKind: 'official',
      lastReviewed: '2026-10-24',
      citation: 'Standard ATS Header & Layout Conventions (Workday, Greenhouse, Taleo)',
      notes: 'Section segmentation rules derived from common ATS linear parser behavior.',
    },
  ],
};
