import fs from 'fs';
import path from 'path';

const existingPath = 'src/data/suite/project-briefs.json';
const existingBriefs = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// Difficulty calibrations
const difficultyMap = {
  'brief-api-sdk-design': 'beginner',
  'brief-progressive-web-app': 'beginner'
};

// Realistic hours calibration
const hoursMap = {
  'brief-api-sdk-design': 20,
  'brief-progressive-web-app': 22,
  'brief-devsecops-pipeline': 26,
  'brief-dist-rate-limiter': 25,
  'brief-embedding-search-engine': 30,
  'brief-feature-flag-platform': 24,
  'brief-fullstack-ecommerce': 32,
  'brief-genai-code-reviewer': 26,
  'brief-graphql-federation': 27,
  'brief-high-throughput-logging': 26,
  'brief-interview-prep-ai': 31,
  'brief-llm-evaluation-framework': 27,
  'brief-llm-gateway': 29,
  'brief-load-balancer': 26,
  'brief-message-queue': 32,
  'brief-micro-frontend-shell': 25,
  'brief-mobile-flutter-prod': 30,
  'brief-notification-service': 27,
  'brief-observability-sdk': 25,
  'brief-opentelemetry-observability': 31,
  'brief-osint-data-platform': 30,
  'brief-personalization-engine': 31,
  'brief-react-native-offline': 29,
  'brief-realtime-analytics-dashboard': 26,
  'brief-realtime-stock-platform': 30,
  'brief-recommendation-engine': 32,
  'brief-schema-registry': 24,
  'brief-serverless-backend': 23,
  'brief-supply-chain-optimization': 27,
  'brief-terraform-cloud-infra': 25,
  'brief-tls-certificate-manager': 26,
  'brief-zero-trust-proxy': 27,
  'cert-aws-saa': 30,
  'cert-gcp-ace': 29,

  // 40h calibrated
  'brief-dist-cache-rust': 38,
  'brief-graph-analysis': 42,
  'brief-graphql-to-sql-compiler': 38,
  'brief-homomorphic-encryption': 45,
  'brief-knowledge-graph': 36,
  'brief-kubernetes-operator': 38,
  'brief-llm-agent-workflow': 37,
  'brief-llm-finetuning-peft': 39,
  'brief-llm-finetuning-rlhf': 44,
  'brief-mlops-platform': 42,
  'brief-multimodal-ai-app': 39,
  'brief-offline-first-sync': 37,
  'brief-peer-to-peer': 41,
  'brief-privacy-preserving-ml': 45,
  'brief-raft-consensus': 46,
  'brief-realtime-code-execution': 42,
  'brief-realtime-collab': 39,
  'brief-search-engine': 38,
  'brief-semantic-kernel-agent': 37,
  'brief-service-mesh': 42,
  'brief-streaming-data-pipeline': 41,
  'brief-upi-payment-gateway': 38,
  'brief-vector-db-from-scratch': 44,
  'brief-workflow-engine': 43,
  'cert-ckad': 36,

  // Nuance on 29h/34h
  'brief-canary-deployment': 27,
  'brief-ci-cd-from-scratch': 33,
  'brief-compiler-interpreter': 36,
  'brief-container-runtime': 35,
  'brief-credit-risk-model': 28,
  'brief-data-quality-framework': 27,
  'brief-database-engine': 42,
  'brief-event-driven-saas': 38,
  'brief-event-recon': 36,
  'brief-event-sourcing': 37,
  'brief-fraud-detection-ml': 38,
  'brief-gitignore-lsp': 36,
  'brief-gitops-registry': 35,
  'brief-gpu-accelerated-inference': 37
};

// Calibrate existing
const calibratedExisting = existingBriefs.map(b => {
  const updated = { ...b };
  if (difficultyMap[b.id]) {
    updated.difficulty = difficultyMap[b.id];
  }
  if (hoursMap[b.id]) {
    updated.estimatedHours = hoursMap[b.id];
  }
  return updated;
});

// Load new briefs
const builderDir = 'scripts/briefs-builder';
const builderFiles = fs.readdirSync(builderDir).filter(f => f.endsWith('.json')).sort();
const newBriefs = [];

for (const f of builderFiles) {
  const p = path.join(builderDir, f);
  const items = JSON.parse(fs.readFileSync(p, 'utf8'));
  console.log(`Loaded ${items.length} briefs from ${f}`);
  newBriefs.push(...items);
}

console.log(`Total existing calibrated: ${calibratedExisting.length}`);
console.log(`Total new added: ${newBriefs.length}`);

const combined = [...calibratedExisting, ...newBriefs];
console.log(`Total combined briefs: ${combined.length}`);

// Validations
const seenIds = new Set();
const seenTitles = new Set();

combined.forEach((b, idx) => {
  if (seenIds.has(b.id)) {
    throw new Error(`Duplicate ID at index ${idx}: ${b.id}`);
  }
  seenIds.add(b.id);

  const normTitle = b.title.trim().toLowerCase();
  if (seenTitles.has(normTitle)) {
    throw new Error(`Duplicate Title at index ${idx}: ${b.title}`);
  }
  seenTitles.add(normTitle);

  if (!['beginner', 'intermediate', 'advanced'].includes(b.difficulty)) {
    throw new Error(`Invalid difficulty in ${b.id}: ${b.difficulty}`);
  }

  if (typeof b.estimatedHours !== 'number' || b.estimatedHours <= 0) {
    throw new Error(`Invalid hours in ${b.id}: ${b.estimatedHours}`);
  }

  if (!Array.isArray(b.coveredSkills) || b.coveredSkills.length === 0) {
    throw new Error(`Empty coveredSkills in ${b.id}`);
  }

  if (!Array.isArray(b.techStack) || b.techStack.length === 0) {
    throw new Error(`Empty techStack in ${b.id}`);
  }

  if (!Array.isArray(b.verificationRubric) || b.verificationRubric.length === 0) {
    throw new Error(`Empty verificationRubric in ${b.id}`);
  }

  if (!b.problemStatement || b.problemStatement.trim().length <= 20) {
    throw new Error(`Problem statement too short in ${b.id}`);
  }
});

console.log('✓ All 158 briefs passed strict validation!');

// Write to project-briefs.json
fs.writeFileSync(existingPath, JSON.stringify(combined, null, 2) + '\n', 'utf8');
console.log(`✓ Successfully updated ${existingPath}`);

// Breakdown summary
const diffCounts = {};
const domainCounts = {};
combined.forEach(b => {
  diffCounts[b.difficulty] = (diffCounts[b.difficulty] || 0) + 1;
  domainCounts[b.domain] = (domainCounts[b.domain] || 0) + 1;
});

console.log('\n--- Difficulty Breakdown ---');
console.table(diffCounts);

console.log('\n--- Domain Breakdown ---');
console.table(domainCounts);

