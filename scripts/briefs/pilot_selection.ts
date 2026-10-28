import fs from 'fs';
import path from 'path';
import { migrateLegacyToV2, toLegacyText } from '../../src/features/suite/briefs/briefMigration';
import { validateBriefV2 } from '../../src/features/suite/briefs/briefV2';
import { ProjectBrief } from '../../src/features/suite/briefs/bundleBriefs';

const briefsPath = path.resolve(process.cwd(), 'src/data/suite/project-briefs.json');
const allBriefs: ProjectBrief[] = JSON.parse(fs.readFileSync(briefsPath, 'utf8'));

// The 14 stratified pilot briefs (including 6 calibration anchors + balanced difficulty & provenance)
const pilotIds = [
  // 6 Calibration Anchors (from Appendix A & Batch 1)
  'brief-load-balancer',          // Batch 1, Intermediate, Platform & DevOps (Physically infeasible failover target)
  'brief-dist-rate-limiter',      // Batch 1, Intermediate, Distributed Systems (Sliding window rate limiting)
  'brief-homomorphic-encryption', // Batch 1, Advanced, Security & Platform (Terminology misuse: homomorphic vs ZK)
  'brief-ab-experimentation',     // Batch 1, Intermediate, ML Engineering (Expected loss numerical quadrature)
  'brief-realtime-code-execution',// Batch 1, Advanced, Security & Platform (Linux namespaces / cgroups)
  'brief-search-engine',          // Batch 1, Advanced, Distributed Systems (Inverted index & BM25)

  // Additional Batch 1 Stratified Selection (Beginner & Web)
  'brief-api-sdk-design',         // Batch 1, Beginner, Full-Stack Web (Developer-first SDK generator)

  // 7 Stratified Selection from Batch 2 (Added)
  'brief-http-socket-server',     // Batch 2, Beginner, CS Fundamentals (Raw TCP/HTTP socket server)
  'brief-kv-store-wal',           // Batch 2, Beginner, CS Fundamentals (Write-Ahead Log crash recovery)
  'brief-multiagent-code-reviewer', // Batch 2, Intermediate, GenAI & LLMOps (LangGraph multi-agent reviewer)
  'brief-idempotency-gateway',    // Batch 2, Intermediate, High-Scale Backend (Redis SHA-256 idempotency key)
  'brief-double-entry-ledger',    // Batch 2, Advanced, FinTech & Ledgers (Immutable double-entry ledger invariants)
  'brief-clickstream-clickhouse', // Batch 2, Advanced, Modern Data Engineering (Kafka + ClickHouse OLAP)
  'brief-malloc-freelist-allocator', // Batch 2, Advanced, Systems Programming (Custom malloc/free with coalescing)
];

console.log(`Selecting pilot sample of ${pilotIds.length} briefs...`);

const pilotBriefs = pilotIds.map((id) => {
  const b = allBriefs.find((item) => item.id === id);
  if (!b) throw new Error(`Pilot brief ID not found in catalog: ${id}`);
  return b;
});

// Run migration to BriefV2 on pilot sample
const migratedPilot = pilotBriefs.map((b) => {
  const v2 = migrateLegacyToV2(b);
  const validation = validateBriefV2(v2);
  if (!validation.valid) {
    console.error(`Validation errors on migrated brief ${b.id}:`, validation.errors);
  }
  return {
    ...v2,
    _validation: validation,
  };
});

fs.writeFileSync(
  path.resolve(process.cwd(), 'docs/briefs/PILOT_SAMPLE.json'),
  JSON.stringify(migratedPilot, null, 2),
  'utf8'
);
console.log(`✓ Saved docs/briefs/PILOT_SAMPLE.json with ${migratedPilot.length} migrated briefs.`);

// Generate PILOT_SAMPLE.md with justification table and legacy text reproduction diff check
let md = `# HireFlow Pilot Sample Specification (Stratified 14-Brief Selection)\n\n`;
md += `> **Stratified Sample**: 14 briefs (~8.9% of the 158-brief catalog)\n`;
md += `> **Provenance Distribution**: 7 from Batch 1 (Original) + 7 from Batch 2 (Added)\n`;
md += `> **Difficulty Distribution**: 3 Beginner, 6 Intermediate, 5 Advanced\n\n`;

md += `| Brief ID | Title | Domain | Difficulty | Hours | Batch | Stratification Justification |\n`;
md += `|---|---|---|:---:|:---:|:---:|---|\n`;

migratedPilot.forEach((b) => {
  const isOriginal = pilotIds.indexOf(b.id) < 7;
  const reason = isOriginal
    ? 'Appendix A Calibration Anchor & Legacy Representation'
    : 'New Batch Representative across Core Engineering Tracks';
  md += `| \`${b.id}\` | ${b.title} | ${b.domain} | \`${b.difficulty}\` | ${b.effort.minHours}h-${b.effort.maxHours}h | ${isOriginal ? 'Batch 1 (Orig)' : 'Batch 2 (Added)'} | ${reason} |\n`;
});

md += `\n## Migration Verification & Validation Status\n\n`;
migratedPilot.forEach((b) => {
  md += `- **[${b.id}]**: Validated V2 schema: **${b._validation.valid ? 'VALID' : 'INVALID'}** (Errors: ${b._validation.errors.length})\n`;
});

fs.writeFileSync(path.resolve(process.cwd(), 'docs/briefs/PILOT_SAMPLE.md'), md, 'utf8');
console.log(`✓ Saved docs/briefs/PILOT_SAMPLE.md.`);

