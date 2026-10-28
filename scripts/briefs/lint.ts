// ============================================================
// HireFlow Brief Linter (Stage 2)
// Automated, generic detectors for all catalog briefs
// ============================================================

import fs from 'fs';
import path from 'path';

export interface LintFinding {
  briefId: string;
  ruleId: string;
  defectClass: string;
  severity: 'S0' | 'S1' | 'S2' | 'S3';
  field: string;
  quote: string;
  message: string;
  falsePositiveRisk: 'low' | 'medium' | 'high';
}

export interface LintRule {
  id: string;
  defectClass: string;
  severity: 'S0' | 'S1' | 'S2' | 'S3';
  rationale: string;
  falsePositiveRisk: 'low' | 'medium' | 'high';
  check: (brief: any, allBriefs: any[]) => LintFinding[];
}

export const LINT_RULES: LintRule[] = [
  // 1. Unpinned versions
  {
    id: 'RULE-UNPINNED-VERSIONS',
    defectClass: 'C-UNPINNED-VERSIONS',
    severity: 'S2',
    rationale: 'Dependencies without pinned minimum semver drift and break on student machines',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const unpinned = (b.techStack || []).filter((t: string) => !t.match(/\d/));
      if (unpinned.length > 0) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-UNPINNED-VERSIONS',
          defectClass: 'C-UNPINNED-VERSIONS',
          severity: 'S2',
          field: 'techStack',
          quote: unpinned.join(', '),
          message: `Tools in techStack lack semver pinning: ${unpinned.join(', ')}`,
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 2. Self-authored tests in rubric
  {
    id: 'RULE-SELF-AUTHORED-TESTS',
    defectClass: 'C-SELF-AUTHORED-TESTS',
    severity: 'S1',
    rationale: 'Rubric invoking student-authored test files without external test harness is easily gameable',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const selfAuthored = (b.verificationRubric || []).filter((r: string) =>
        r.includes('pytest') || r.includes('go test') || r.includes('npm test') || r.includes('test_')
      );
      if (selfAuthored.length > 0) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-SELF-AUTHORED-TESTS',
          defectClass: 'C-SELF-AUTHORED-TESTS',
          severity: 'S1',
          field: 'verificationRubric',
          quote: selfAuthored[0],
          message: 'Rubric invokes student-authored unit tests rather than independent verification harness',
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 3. Rubric duplicate numbering
  {
    id: 'RULE-RUBRIC-DUPLICATE-NUMBERING',
    defectClass: 'C-RUBRIC-DUPLICATE-NUMBERING',
    severity: 'S3',
    rationale: 'Embedded numeric index causes "[ ] 1. 1. " duplicate indexing in plaintext and markdown exports',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      if (b.verificationRubric && b.verificationRubric[0]?.match(/^\d+\.\s*/)) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-RUBRIC-DUPLICATE-NUMBERING',
          defectClass: 'C-RUBRIC-DUPLICATE-NUMBERING',
          severity: 'S3',
          field: 'verificationRubric',
          quote: b.verificationRubric[0].slice(0, 30),
          message: 'Rubric item contains embedded numeric index causing double numbering in exports',
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 4. Unbounded hardware throughput claim
  {
    id: 'RULE-UNBOUNDED-HARDWARE-CLAIM',
    defectClass: 'C-UNBOUNDED-HARDWARE-CLAIM',
    severity: 'S1',
    rationale: 'Throughput claims without hardware profile are unfalsifiable and environmentally brittle',
    falsePositiveRisk: 'medium',
    check: (b) => {
      const findings: LintFinding[] = [];
      const scale = b.scaleTargets || '';
      if (scale.match(/\d+[\s,]*(?:req|requests|ops|events|writes|reads|packets|tokens)\s*\/\s*sec/i)) {
        if (!scale.toLowerCase().includes('core') && !scale.toLowerCase().includes('ram') && !scale.toLowerCase().includes('cpu') && !scale.toLowerCase().includes('backend')) {
          findings.push({
            briefId: b.id,
            ruleId: 'RULE-UNBOUNDED-HARDWARE-CLAIM',
            defectClass: 'C-UNBOUNDED-HARDWARE-CLAIM',
            severity: 'S1',
            field: 'scaleTargets',
            quote: scale.slice(0, 60),
            message: 'Throughput claim lacks reference CPU/RAM hardware execution environment',
            falsePositiveRisk: 'medium',
          });
        }
      }
      return findings;
    },
  },

  // 5. Linux syscall portability
  {
    id: 'RULE-LINUX-SYSCALL-PORTABILITY',
    defectClass: 'C-LINUX-SYSCALL-PORTABILITY',
    severity: 'S1',
    rationale: 'Linux kernel primitives fail on Windows hosts without explicit WSL2/Docker prerequisites',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const linuxSyscalls = ['epoll', 'splice()', 'seccomp', 'cgroups', 'libpcap', 'FUSE'];
      const matched = linuxSyscalls.filter((s) =>
        (b.problemStatement || '').includes(s) || (b.architecture || '').includes(s)
      );
      if (matched.length > 0) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-LINUX-SYSCALL-PORTABILITY',
          defectClass: 'C-LINUX-SYSCALL-PORTABILITY',
          severity: 'S1',
          field: 'problemStatement',
          quote: matched.join(', '),
          message: `Linux-specific kernel primitive (${matched.join(', ')}) requires explicit WSL2/Docker container prerequisite`,
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 6. Unattainable hardware requirement (GPU)
  {
    id: 'RULE-UNATTAINABLE-HARDWARE-REQUIREMENT',
    defectClass: 'C-UNATTAINABLE-HARDWARE-REQUIREMENT',
    severity: 'S0',
    rationale: 'Mandating high-end dedicated GPU hardware blocks standard second-year student laptops',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const hasGpu = (b.techStack || []).some((t: string) => ['CUDA', 'vLLM', 'GPU'].includes(t)) ||
        (b.scaleTargets || '').toLowerCase().includes('gpu') ||
        (b.architecture || '').toLowerCase().includes('gpu');
      if (hasGpu) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-UNATTAINABLE-HARDWARE-REQUIREMENT',
          defectClass: 'C-UNATTAINABLE-HARDWARE-REQUIREMENT',
          severity: 'S0',
          field: 'scaleTargets',
          quote: 'GPU dependency',
          message: 'Mandates dedicated GPU hardware without providing quantized CPU fallback path',
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 7. Missing lawful scope disclaimer on security briefs
  {
    id: 'RULE-MISSING-LAWFUL-SCOPE-DISCLAIMER',
    defectClass: 'C-MISSING-LAWFUL-SCOPE-DISCLAIMER',
    severity: 'S1',
    rationale: 'Security testing tools require strict scope disclaimers for ethical and legal compliance',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const isSecurity = (b.domain || '').includes('Security') ||
        (b.title || '').includes('Intrusion') ||
        (b.title || '').includes('Firewall') ||
        (b.title || '').includes('Penetration');
      if (isSecurity && !(b.problemStatement || '').toLowerCase().includes('lawful')) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-MISSING-LAWFUL-SCOPE-DISCLAIMER',
          defectClass: 'C-MISSING-LAWFUL-SCOPE-DISCLAIMER',
          severity: 'S1',
          field: 'problemStatement',
          quote: b.title,
          message: 'Security brief lacks explicit scope-of-lawful-use notice',
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },

  // 8. Absolute / unfalsifiable claims in portfolio formula
  {
    id: 'RULE-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
    defectClass: 'C-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
    severity: 'S2',
    rationale: 'Absolute words ("100%", "zero", "never") in resume bullets invite skeptical interviewer grilling',
    falsePositiveRisk: 'medium',
    check: (b) => {
      const findings: LintFinding[] = [];
      const formula = b.portfolioBulletFormula || '';
      const matches = formula.match(/\b(100%|zero|0\b|never|guaranteed)\b/gi);
      if (matches) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
          defectClass: 'C-ABSOLUTE-UNFALSIFIABLE-CLAIMS',
          severity: 'S2',
          field: 'portfolioBulletFormula',
          quote: matches[0],
          message: `Resume bullet formula uses absolute claim word "${matches[0]}"`,
          falsePositiveRisk: 'medium',
        });
      }
      return findings;
    },
  },

  // 9. Bracketed outcome check in rubric
  {
    id: 'RULE-MISSING-BRACKETED-OUTCOME',
    defectClass: 'C-UNSTRUCTURED-RUBRIC-OUTCOME',
    severity: 'S1',
    rationale: 'Rubric items must provide bracketed outcome [...] for automated verifier evaluation',
    falsePositiveRisk: 'low',
    check: (b) => {
      const findings: LintFinding[] = [];
      const unbracketed = (b.verificationRubric || []).filter((r: string) => !r.includes('[') || !r.includes(']'));
      if (unbracketed.length > 0) {
        findings.push({
          briefId: b.id,
          ruleId: 'RULE-MISSING-BRACKETED-OUTCOME',
          defectClass: 'C-UNSTRUCTURED-RUBRIC-OUTCOME',
          severity: 'S1',
          field: 'verificationRubric',
          quote: unbracketed[0].slice(0, 40),
          message: 'Rubric item missing bracketed verification outcome [...]',
          falsePositiveRisk: 'low',
        });
      }
      return findings;
    },
  },
];

/**
 * Executes all lint rules across the provided briefs.
 */
export function lintBriefs(briefs: any[]): LintFinding[] {
  const allFindings: LintFinding[] = [];
  for (const b of briefs) {
    for (const rule of LINT_RULES) {
      const findings = rule.check(b, briefs);
      allFindings.push(...findings);
    }
  }
  return allFindings;
}

if (process.argv[1] && process.argv[1].endsWith('lint.ts')) {
  const root = process.cwd();
  const datasetPath = path.join(root, 'src/data/suite/project-briefs.json');
  const briefs = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  console.log(`Running HireFlow Brief Linter across ${briefs.length} briefs...`);
  const findings = lintBriefs(briefs);

  // Group by severity
  const severityCounts = { S0: 0, S1: 0, S2: 0, S3: 0 };
  const classCounts: Record<string, number> = {};

  findings.forEach((f) => {
    severityCounts[f.severity]++;
    classCounts[f.defectClass] = (classCounts[f.defectClass] || 0) + 1;
  });

  console.log(`\n--- LINT SUMMARY ---`);
  console.log(`Total Findings: ${findings.length}`);
  console.log(`Severity Breakdown:`, severityCounts);
  console.log(`Defect Class Breakdown:`, classCounts);

  // Save baseline JSON & MD
  const baselineJsonPath = path.join(root, 'docs/briefs/LINT_BASELINE.json');
  const baselineMdPath = path.join(root, 'docs/briefs/LINT_BASELINE.md');

  fs.writeFileSync(baselineJsonPath, JSON.stringify({ summary: severityCounts, defectClasses: classCounts, findings }, null, 2), 'utf8');

  let md = `# HireFlow Brief Linter Baseline Report\n\n`;
  md += `> **Audit Scope**: All ${briefs.length} project briefs in catalog\n`;
  md += `> **Total Findings**: ${findings.length}\n\n`;
  md += `## Severity Distribution\n`;
  md += `- **S0 (Critical)**: ${severityCounts.S0}\n`;
  md += `- **S1 (Major)**: ${severityCounts.S1}\n`;
  md += `- **S2 (Minor)**: ${severityCounts.S2}\n`;
  md += `- **S3 (Cosmetic)**: ${severityCounts.S3}\n\n`;
  md += `## Defect Class Breakdown\n`;
  md += `| Defect Class | Count | Severity | Rationale |\n|---|:---:|:---:|---|\n`;
  Object.entries(classCounts).forEach(([cls, count]) => {
    const rule = LINT_RULES.find((r) => r.defectClass === cls);
    md += `| \`${cls}\` | ${count} | \`${rule?.severity || 'S2'}\` | ${rule?.rationale || '—'} |\n`;
  });

  fs.writeFileSync(baselineMdPath, md, 'utf8');
  console.log(`\n✓ Saved ${baselineJsonPath} and ${baselineMdPath}`);
}
