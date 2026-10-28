// ============================================================
// HireFlow Brief Risk Tiering Engine (Stage 5)
// Ranks all catalog briefs by architectural complexity and verification risk
// ============================================================

import fs from 'fs';
import path from 'path';

export interface BriefRiskScore {
  briefId: string;
  title: string;
  domain: string;
  difficulty: string;
  tier: 'Tier-1' | 'Tier-2' | 'Tier-3';
  totalRiskScore: number;
  factors: {
    cloudInfraDependence: number;
    securityClaims: number;
    kernelConcurrencyComplexity: number;
    unverifiedMetricsCount: number;
    hardwareSensitivity: number;
  };
  reasons: string[];
}

export function calculateRiskScores(briefs: any[]): BriefRiskScore[] {
  return briefs.map((b) => {
    let cloudInfra = 0;
    let security = 0;
    let kernel = 0;
    let unverified = 0;
    let hardware = 0;
    const reasons: string[] = [];

    const text = `${b.title} ${b.domain} ${b.problemStatement} ${b.architecture} ${b.scaleTargets} ${(b.techStack || []).join(' ')}`.toLowerCase();

    // 1. Cloud / Distributed Infrastructure
    if (text.includes('kafka') || text.includes('distributed') || text.includes('raft') || text.includes('cluster') || text.includes('cdc')) {
      cloudInfra += 3;
      reasons.push('Distributed consensus / streaming cluster complexity');
    }
    if (text.includes('k8s') || text.includes('kubernetes') || text.includes('operator')) {
      cloudInfra += 2;
      reasons.push('Kubernetes API / Operator runtime dependency');
    }

    // 2. Security Claims
    if (b.domain.includes('Security') || text.includes('intrusion') || text.includes('pki') || text.includes('firewall') || text.includes('sast')) {
      security += 3;
      reasons.push('Security auditing & cryptographic payload boundary');
    }

    // 3. Kernel / Low-Level Concurrency
    if (text.includes('epoll') || text.includes('splice') || text.includes('cgroups') || text.includes('lock-free') || text.includes('ebpf')) {
      kernel += 3;
      reasons.push('OS kernel primitives or lock-free concurrent synchronization');
    }

    // 4. Hardware Sensitivity
    if (text.includes('gpu') || text.includes('cuda') || text.includes('vllm')) {
      hardware += 3;
      reasons.push('GPU hardware acceleration dependency (quantized fallback needed)');
    }
    if (text.includes('req/sec') || text.includes('writes/sec') || text.includes('orders/sec')) {
      hardware += 1;
      reasons.push('High-throughput throughput benchmark');
    }

    // 5. Unverified / Complex Metrics
    const metricCount = (b.scaleTargets || '').split('|').length;
    unverified = Math.min(3, metricCount);

    const totalRiskScore = cloudInfra + security + kernel + hardware + unverified;

    let tier: 'Tier-1' | 'Tier-2' | 'Tier-3' = 'Tier-3';
    if (totalRiskScore >= 7) {
      tier = 'Tier-1';
    } else if (totalRiskScore >= 4) {
      tier = 'Tier-2';
    }

    return {
      briefId: b.id,
      title: b.title,
      domain: b.domain,
      difficulty: b.difficulty,
      tier,
      totalRiskScore,
      factors: {
        cloudInfraDependence: cloudInfra,
        securityClaims: security,
        kernelConcurrencyComplexity: kernel,
        unverifiedMetricsCount: unverified,
        hardwareSensitivity: hardware,
      },
      reasons,
    };
  });
}

export function runRiskScore() {
  const root = process.cwd();
  const datasetPath = path.join(root, 'src/data/suite/project-briefs.json');
  const briefs = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  console.log(`Calculating verification risk scores for ${briefs.length} briefs...`);
  const scored = calculateRiskScores(briefs);

  // Sort descending by risk score
  scored.sort((a, b) => b.totalRiskScore - a.totalRiskScore);

  const tier1 = scored.filter((s) => s.tier === 'Tier-1');
  const tier2 = scored.filter((s) => s.tier === 'Tier-2');
  const tier3 = scored.filter((s) => s.tier === 'Tier-3');

  console.log(`\n--- RISK TIER DISTRIBUTION ---`);
  console.log(`Tier-1 (High Risk / Reference Run Candidates): ${tier1.length}`);
  console.log(`Tier-2 (Moderate Complexity): ${tier2.length}`);
  console.log(`Tier-3 (Standard Verification): ${tier3.length}`);

  // Save JSON
  const jsonPath = path.join(root, 'docs/briefs/RISK_TIERS.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ summary: { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length }, scores: scored }, null, 2), 'utf8');
  console.log(`✓ Saved ${jsonPath}`);

  // Save Markdown
  let md = `# HireFlow Project Brief Verification Risk Tiers\n\n`;
  md += `> **Audit Scope**: All ${briefs.length} briefs evaluated for verification difficulty and architectural risk.\n`;
  md += `> **Tier 1 (High Risk)**: ${tier1.length} briefs | **Tier 2 (Moderate)**: ${tier2.length} briefs | **Tier 3 (Standard)**: ${tier3.length} briefs\n\n`;

  md += `## Tier-1 Priority Reference Run Candidates (Top 15)\n\n`;
  md += `| Rank | Brief ID | Title | Domain | Risk Score | Key Complexity Factors |\n|:---:|---|---|---|:---:|---|\n`;
  tier1.slice(0, 15).forEach((t, i) => {
    md += `| ${i + 1} | \`${t.briefId}\` | ${t.title.slice(0, 45)}... | ${t.domain} | **${t.totalRiskScore}** | ${t.reasons.join('; ')} |\n`;
  });

  md += `\n## Full Catalog Risk Distribution Summary\n\n`;
  md += `- **Tier 1**: High concurrency, kernel hooks, hardware acceleration, or multi-node streaming distributed state.\n`;
  md += `- **Tier 2**: Async queues, relational transactions, caching tiers, or authenticated REST/gRPC services.\n`;
  md += `- **Tier 3**: Static analysis, CLI tools, parsers, or algorithmic utilities with deterministic golden vector evaluation.\n`;

  const mdPath = path.join(root, 'docs/briefs/RISK_TIERS.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`✓ Saved ${mdPath}`);
}

if (process.argv[1] && process.argv[1].endsWith('risk-score.ts')) {
  runRiskScore();
}
