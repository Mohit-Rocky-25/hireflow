// ============================================================
// HireFlow — Outreach Template Authoring Linter
// Enforces Standard D6 and Evidence E1–E6 across the library
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { validateOutreachTemplate } from '../../src/features/suite/outreach/validator';
import { fitMessageToLength } from '../../src/features/suite/outreach/engine/lengthFit';
import { OutreachTemplateV2, OutreachSlotsV2 } from '../../src/features/suite/outreach/types';

const TEMPLATES_PATH = path.resolve('src/data/suite/outreach/templates.json');

const BANNED_PATTERNS = [
  { pattern: /hope (?:this email|all) is well/i, reason: 'Generic opener' },
  { pattern: /writing to express my interest/i, reason: 'Dated cover-letter opener' },
  { pattern: /came across your profile/i, reason: 'Generic lazy opener' },
  { pattern: /kindly/i, reason: 'Dated bureaucratic cliché' },
  { pattern: /do the needful/i, reason: 'Dated cliché' },
  { pattern: /revert back/i, reason: 'Redundant phrasing' },
  { pattern: /esteemed organisation|esteemed organization|esteemed company/i, reason: 'Sycophantic flattery' },
  { pattern: /humbly request/i, reason: 'Subservient phrasing' },
  { pattern: /high-converting|high-conversion/i, reason: 'Banned marketing claim' },
  { pattern: /pre-calibrated/i, reason: 'Unverifiable precision claim' },
  { pattern: /\bguarantee\b|\bguaranteed\b/i, reason: 'Unverifiable certainty claim' },
];

const WORST_CASE_FIXTURE: OutreachSlotsV2 = {
  targetCompany: 'Razorpay Payment Solutions',
  targetRole: 'Staff Distributed Systems Engineer',
  recipientName: 'Suryanarayana Venkateshwarlu',
  primarySkill: 'Go, Kubernetes, Cassandra & Kafka',
  admiredProject: 'the technical post-mortem on your zero-downtime database replication failover',
  proofPoint: 'engineered high-throughput distributed log indexing platform handling 140,000 requests per second across 12 nodes with 99.999% availability and sub-millisecond latency',
  proofShort: 'engineered distributed queue handling 140k req/s with sub-ms latency',
  college: 'National Institute of Technology Karnataka, Surathkal',
  portfolio: 'github.com/suryanarayana/distributed-queue-benchmarks',
  followUpNewInfo: 'published reproducibility benchmark and open-source harness on GitHub',
  daysSince: 7,
  your_name: 'Padmanabhan Ramakrishnan',
};

export function lintTemplateLibrary(templates: OutreachTemplateV2[]): { pass: boolean; errors: string[]; stats: Record<string, number> } {
  const errors: string[] = [];
  const hookOpeners = new Map<string, string>(); // normalized opener -> templateId
  const templateIds = new Set(templates.map((t) => t.id));

  let totalHooks = 0;
  let totalProofVariants = 0;
  let totalAskVariants = 0;

  for (const t of templates) {
    // 1. Schema Validation
    const valResult = validateOutreachTemplate(t);
    if (!valResult.valid) {
      for (const err of valResult.errors) {
        errors.push(`[${t.id}] Schema error at ${err.path}: ${err.message}`);
      }
    }

    // 2. Authoring flag
    if (t.needsAuthoring) {
      errors.push(`[${t.id}] Marked 'needsAuthoring: true' — must be fully rewritten.`);
    }

    // 3. Block Variant Counts
    const hookCount = t.blocks.hook?.length || 0;
    const proofCount = t.blocks.proof?.length || 0;
    const askCount = t.blocks.ask?.length || 0;
    const closeCount = t.blocks.close?.length || 0;

    totalHooks += hookCount;
    totalProofVariants += proofCount;
    totalAskVariants += askCount;

    if (hookCount < 2) errors.push(`[${t.id}] Has ${hookCount} hook variants (minimum 2 required).`);
    if (proofCount < 2) errors.push(`[${t.id}] Has ${proofCount} proof variants (minimum 2 required).`);
    if (askCount < 2) errors.push(`[${t.id}] Has ${askCount} ask variants (minimum 2 required).`);
    if (closeCount < 1) errors.push(`[${t.id}] Has ${closeCount} close variants (minimum 1 required).`);

    // 4. Unique Opening Sentences
    for (const h of t.blocks.hook || []) {
      const normHook = h.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (hookOpeners.has(normHook)) {
        errors.push(`[${t.id}] Duplicate opening sentence shared with [${hookOpeners.get(normHook)}]: "${h}"`);
      } else {
        hookOpeners.set(normHook, t.id);
      }
    }

    // 5. Banned Patterns & Claims
    const allText = [
      ...(t.blocks.hook || []),
      ...(t.blocks.proof || []),
      ...(t.blocks.ask || []),
      ...(t.blocks.close || []),
      ...(t.subjectVariants || []),
      t.whenToUse,
      t.whenNotToUse,
      t.whyItWorks,
    ].join(' ');

    for (const b of BANNED_PATTERNS) {
      if (b.pattern.test(allText)) {
        errors.push(`[${t.id}] Contains banned pattern (${b.reason}): "${allText.match(b.pattern)?.[0]}"`);
      }
    }

    // 6. Cold Referral Ask Check (Evidence E5)
    if (t.relationship === 'cold') {
      const askText = (t.blocks.ask || []).join(' ').toLowerCase();
      if (/\b(refer me|referral for me|put in a referral|give me a referral)\b/i.test(askText)) {
        errors.push(`[${t.id}] Cold template violates Evidence E5 by asking for a referral.`);
      }
    }

    // 7. Follow-up ID Resolution
    for (const fid of t.followUpTemplateIds || []) {
      if (!templateIds.has(fid)) {
        errors.push(`[${t.id}] References non-existent followUpTemplateId: "${fid}"`);
      }
    }

    // 8. Length Validation on Worst-Case Fixture
    const fitRes = fitMessageToLength(t, WORST_CASE_FIXTURE, 0, { isPremiumLinkedIn: false });
    if (fitRes.status === 'overflow') {
      errors.push(`[${t.id}] Overflows hard limit on worst-case fixture by ${fitRes.overflowAmount} ${t.lengthProfile.metric}`);
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    stats: {
      totalTemplates: templates.length,
      totalHooks,
      totalProofVariants,
      totalAskVariants,
      uniqueOpeners: hookOpeners.size,
    },
  };
}

// CLI runner
if (process.argv[1]?.endsWith('lint-templates.ts') || process.argv[1]?.endsWith('lint-templates.js')) {
  if (!fs.existsSync(TEMPLATES_PATH)) {
    console.error(`Templates file not found at ${TEMPLATES_PATH}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'));
  const res = lintTemplateLibrary(raw);

  console.log(`\n========================================`);
  console.log(`OUTREACH TEMPLATE AUTHORING LINT REPORT`);
  console.log(`========================================`);
  console.log(`Total Templates Audited: ${res.stats.totalTemplates}`);
  console.log(`Total Hook Variants:     ${res.stats.totalHooks}`);
  console.log(`Total Proof Variants:    ${res.stats.totalProofVariants}`);
  console.log(`Total Ask Variants:      ${res.stats.totalAskVariants}`);
  console.log(`Unique Opening Lines:    ${res.stats.uniqueOpeners}`);
  console.log(`----------------------------------------`);

  if (!res.pass) {
    console.error(`❌ LINT FAILED with ${res.errors.length} errors:`);
    for (const err of res.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  } else {
    console.log(`✅ ALL TEMPLATES PASS THE D6 AUTHORING STANDARD.`);
    process.exit(0);
  }
}
