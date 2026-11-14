// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { generateMarkdownDossier, exportDossier } from '@/features/dossier/exportDossier';
import { buildDossierModel, type DossierModel } from '@/features/dossier/dossierModel';
import type { AuditEntry } from '@/domain/types';

const sampleAudit: AuditEntry = {
  schemaVersion: 1,
  id: 'audit-dossier-1',
  kind: 'ats_roast',
  createdAt: '2026-11-13T10:00:00Z',
  engineVersion: '5.0.0',
  runKey: '3'.repeat(64),
  targetKey: 'stripe:staff_eng',
  resume: {
    workspaceId: 'ws-1',
    versionId: 'v-1',
    snapshotHash: 'a'.repeat(64),
    label: 'v1: Infrastructure Lead',
  },
  jd: {
    origin: 'pasted',
    company: 'Stripe',
    roleTitle: 'Staff Infrastructure Engineer',
    snapshotHash: 'b'.repeat(64),
  },
  overallScore: 89,
  breakdown: [
    { key: 'must_have', label: 'Distributed Systems & Go', score: 92, weight: 0.4 },
    { key: 'depth', label: 'Production Incident Leadership', score: 86, weight: 0.3 },
  ],
  gaps: [
    { id: 'gap-ebpf', category: 'skill', label: 'eBPF Profiling', severity: 2, detail: 'Kernel level network telemetry' },
  ],
  strengths: ['High-throughput message pipeline experience', 'Strong post-mortem documentation'],
  evidence: [],
  findingsJson: { subscores: {} },
  delta: {
    previousAuditId: 'prev-audit-0',
    previousScore: 81,
    overallDeltaPts: 8,
    resolvedGapIds: ['gap-raft'],
    newGapIds: [],
  },
};

const model: DossierModel = buildDossierModel({
  entry: sampleAudit,
  resumeText: 'Staff Infrastructure Engineer with Go, Distributed Raft, Kafka, and Kubernetes experience.',
  jdText: 'Looking for a Staff Infrastructure Engineer to scale our core payment ledger...',
  baseline: null,
  candidate: { name: 'Alex Candidate', email: 'alex@example.com' },
  planItems: [
    {
      id: 'plan-1',
      kind: 'build_brief',
      refId: 'brief-ebpf',
      title: 'Build eBPF socket tracing filter',
      status: 'planned',
      linkedGapIds: ['gap-ebpf'],
      targetKey: 'stripe:staff_eng',
      addedFromAuditId: sampleAudit.id,
      createdAt: '2026-11-13T10:00:00Z',
      updatedAt: '2026-11-13T10:00:00Z',
      completedAt: null,
    },
  ],
  generatedAt: '2026-11-13T10:30:00Z',
});

describe('Stage 8: Client-Side Dossier Exporter', () => {
  it('generates a valid client-side PDF document', async () => {
    const pdfBytes = await generatePdfDossier(model);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // Verify PDF Magic header %PDF-1.
    const header = Buffer.from(pdfBytes.slice(0, 5)).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('generates a valid client-side DOCX document', async () => {
    const docxBlob = await generateDocxDossier(model);

    expect(docxBlob).toBeDefined();
    expect(docxBlob.size).toBeGreaterThan(1000);
    expect(docxBlob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  it('generates valid markdown and text dossiers', () => {
    const md = generateMarkdownDossier(model);
    expect(typeof md).toBe('string');
    expect(md).toContain('# HireFlow Candidate Audit Report');
    expect(md).toContain('Overall Benchmark Score: 89 / 100');
    expect(md).toContain('Distributed Systems & Go');
    expect(md).toContain('eBPF Profiling');
    expect(md).toContain('Build eBPF socket tracing filter');
  });

  it('contains expected deterministic content in model', () => {
    expect(model.headline.score).toBe(89);
    expect(model.meta.integrity.resumeHash).toBe('a'.repeat(64));
    expect(model.meta.integrity.jdHash).toBe('b'.repeat(64));
    expect(model.summary.length).toBeGreaterThan(0);
    expect(model.summary[0]).toContain('The resume "v1: Infrastructure Lead" scored 89 out of 100');
    expect(model.projectDrops.length).toBeGreaterThan(0);
    expect(model.learningPath?.stages.length).toBe(3);
  });

  it('builds full TalentLens dossier with formatted names, market intel, and project drops', async () => {
    const tlAudit: AuditEntry = {
      schemaVersion: 1,
      id: 'audit-tl-full',
      kind: 'talentlens',
      createdAt: '2026-11-14T08:00:00Z',
      engineVersion: '4.1.0',
      runKey: '4'.repeat(64),
      targetKey: 'tl:mongodb:sde',
      resume: {
        workspaceId: null,
        versionId: null,
        snapshotHash: 'c'.repeat(64),
        label: 'Current Resume',
      },
      jd: {
        origin: 'talentlens',
        company: 'MongoDB India',
        roleTitle: 'Software Development Engineer',
        snapshotHash: 'd'.repeat(64),
      },
      overallScore: 58,
      breakdown: [
        { key: 'dsa', label: 'dsa', score: 100 },
        { key: 'systemdesign', label: 'systemdesign', score: 100 },
        { key: 'web', label: 'web', score: 0 },
      ],
      strengths: ['dsa', 'systemdesign'],
      gaps: [
        { id: 'gap-web', category: 'skill', label: 'web', severity: 2, detail: 'Build a real proof project demonstrating WEB before applying.' },
      ],
      evidence: [],
      findingsJson: {
        kind: 'talentlens',
        result: {
          score: 58,
          readinessLabel: 'Developing fit',
          breakdown: [
            {
              competency: 'dsa',
              reqLevel: 'expert',
              analysis: {
                status: 'expert',
                confidence: 100,
                layerScores: { l1: 100, l2: 100, l3: 100, l4: 100, l5: 100 },
                contextSentences: ['Solved over 400 LeetCode problems including dynamic programming and graphs.'],
                gaps: [],
              },
            },
            {
              competency: 'systemdesign',
              reqLevel: 'strong',
              analysis: {
                status: 'strong',
                confidence: 100,
                layerScores: { l1: 95, l2: 95, l3: 100, l4: 90, l5: 95 },
                contextSentences: ['Architected distributed Redis cache cluster with multi-region failover.'],
                gaps: [],
              },
            },
            {
              competency: 'web',
              reqLevel: 'strong',
              analysis: {
                status: 'absent',
                confidence: 0,
                layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 },
                contextSentences: [],
                gaps: ['No full-stack or web API framework projects found in resume.'],
              },
            },
          ],
          plans: [
            {
              priority: 'critical',
              title: 'Build Full-Stack Production Web Application',
              detail: 'Deploy a production-grade web service using React and Node.js or Go with database connectivity.',
              timeframe: '2-3 weeks',
              closability: '30 days',
              suggestedAction: 'Build and deploy a full-stack CRUD API with authentication.',
              hypotheticalScoreGain: '+15 to +20 pts',
              bulletTemplate: 'Engineered responsive web portal using React and TypeScript; reduced page load by 35%.',
              resources: ['Full Stack Open (University of Helsinki)', 'Production React Documentation'],
            },
          ],
          marketIntel: {
            marketPosition: 'Market Current',
            overallMarketFit: 68,
            techCurrencyScore: 75,
            buildAuthenticity: 60,
            fundamentalDepth: 80,
            buildVerdict: 'Strong foundational algorithms and systems background; needs web deployment portfolio.',
            findings: [],
            stackCurrency: {
              modernPractices: ['Distributed Caching', 'Automated Testing'],
              outdatedSignals: [],
              emergingAdoption: ['TypeScript', 'GraphQL'],
              missingForMarket: ['Web Architecture'],
            },
          },
        },
        selectedRole: { title: 'Software Development Engineer', level: 'L2' },
        company: {
          name: 'MongoDB India',
          tier: 'Unicorn',
          industry: 'Enterprise Database',
          avgPackage: '₹45-80 LPA',
          hiring2024: 1420,
          trend: 'up',
          openRoles: 18,
          glassdoor: 4.4,
        },
      },
      delta: null,
    };

    // Include problematic characters (Rupee symbol, arrows, emojis) in resume evidence and plans
    (tlAudit.findingsJson as any).result.breakdown[0].analysis.contextSentences = [
      'Solved over 400 LeetCode problems 🚀 including DP & graphs → achieved 99th percentile ★',
    ];
    (tlAudit.findingsJson as any).result.plans[0].detail =
      'Deploy full-stack web service with React + Node.js. Cost: ₹0 on free tier → latency reduced by 35% ✓';

    const tlModel = buildDossierModel({
      entry: tlAudit,
      resumeText: 'Software Engineer with DSA and System Design experience.',
      jdText: 'Looking for a Software Development Engineer at MongoDB India with DSA, System Design, and Web skills.',
      baseline: null,
      candidate: { name: 'Priya Sharma' },
      planItems: [],
      generatedAt: '2026-11-14T09:00:00Z',
    });

    // 1. Check formatted competency names (NOT raw 'dsa' or 'web')
    expect(tlModel.breakdown.find((b) => b.key === 'dsa')?.label).toBe('DSA');
    expect(tlModel.breakdown.find((b) => b.key === 'systemdesign')?.label).toBe('System Design');
    expect(tlModel.breakdown.find((b) => b.key === 'web')?.label).toBe('Web Architecture / Full-Stack');

    // 2. Check evidence quotes included
    expect(tlModel.breakdown.find((b) => b.key === 'dsa')?.evidenceQuotes[0]).toContain('Solved over 400 LeetCode');

    // 3. Check project drops populated
    expect(tlModel.projectDrops.length).toBeGreaterThan(0);
    expect(tlModel.projectDrops[0].problemStatement.length).toBeGreaterThan(20);
    expect(tlModel.projectDrops[0].portfolioBulletFormula.length).toBeGreaterThan(10);

    // 4. Check market intelligence populated
    expect(tlModel.talentLensIntel?.marketPosition).toBe('Market Current');
    expect(tlModel.talentLensIntel?.buildVerdict).toContain('needs web deployment portfolio');

    // 5. Check multi-stage learning path and career acceleration plans
    expect(tlModel.learningPath?.stages.length).toBe(3);
    expect(tlModel.learningPath?.plans.length).toBeGreaterThan(0);
    expect(tlModel.learningPath?.plans[0].resources.length).toBeGreaterThan(0);
    expect(tlModel.companyContext).toBeDefined();

    // 6. Test PDF and Markdown compilation
    const pdfBytes = await generatePdfDossier(tlModel);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(2000);

    const md = generateMarkdownDossier(tlModel);
    expect(md).toContain('MongoDB India');
    expect(md).toContain('DSA');
    expect(md).toContain('System Design');
    expect(md).toContain('Web Architecture / Full-Stack');
    expect(md).toContain('TalentLens™ Career Acceleration Plan');
    expect(md).toContain('Recommended Proof-of-Work Project Drops');
    expect(md).toContain('TalentLens™ Competency Intelligence & Market Benchmark Report');
    expect(md).not.toContain('ATS Resume Roaster — 4-Layer In-Depth Evaluation');
    expect(md).not.toContain('Layer 1: 7-Dimension Weighted Subscores');

    // 7. Verify all 5 formats execute cleanly via exportDossier
    const formats: Array<'pdf' | 'docx' | 'md' | 'json' | 'txt'> = ['pdf', 'docx', 'md', 'json', 'txt'];
    for (const fmt of formats) {
      await expect(
        exportDossier({
          audit: tlAudit,
          resumeText: 'Software Engineer with DSA and System Design experience.',
          jdText: 'Looking for a Software Development Engineer at MongoDB India',
          format: fmt,
        })
      ).resolves.not.toThrow();
    }
  });

  it('builds full ATS Resume Roaster dossier with 4-layer diagnostics', async () => {
    const atsAudit: AuditEntry = {
      schemaVersion: 1,
      id: 'audit-ats-full',
      kind: 'ats_roast',
      createdAt: '2026-11-14T09:00:00Z',
      engineVersion: '4.0.0',
      runKey: '5'.repeat(64),
      targetKey: 'ats:google:sde',
      resume: {
        workspaceId: null,
        versionId: null,
        snapshotHash: 'e'.repeat(64),
        label: 'My Resume',
      },
      jd: {
        origin: 'pasted',
        company: 'Google',
        roleTitle: 'Software Engineer III',
        snapshotHash: 'f'.repeat(64),
      },
      overallScore: 74,
      breakdown: [
        { key: 'must_have', label: 'Must-Have Coverage', score: 80 },
        { key: 'evidence', label: 'Evidence Quality', score: 70 },
      ],
      strengths: ['Go', 'Kubernetes'],
      gaps: [{ id: 'gap-grpc', category: 'skill', label: 'gRPC', severity: 3, detail: 'Must have gRPC' }],
      evidence: [],
      findingsJson: {
        kind: 'ats_roast',
        engineResult: {
          score: 74,
          band: 'Competitive',
          subscores: {
            mustHaveCoverage: 24,
            evidenceDepth: 15,
            impactMetrics: 11,
            projectsAndOss: 8,
            seniorityFit: 8,
            formatAndParse: 8,
            tierFit: 4,
          },
          penalties: [
            { id: 'p1', label: 'Missing Must-Have Skill', points: -6, reason: 'gRPC was not detected in resume text.' },
          ],
          seniorityFit: {
            candidateYears: 4,
            requiredYears: 5,
            level: 'Mid-Senior',
            fitExplanation: 'Candidate has 4 verified years against 5 desired years.',
          },
          fixFirst: [
            {
              title: 'Add Verifiable Evidence for gRPC Service Development',
              reason: 'gRPC is a mandatory skill for this role at Google.',
              expectedScoreGain: 7,
              type: 'missing_must_have',
            },
          ],
          skillResults: [
            {
              canonical: 'Go',
              category: 'Backend',
              required: 'must',
              status: 'verified',
              proficiency: 4,
              evidence: [{ quote: 'Developed microservices in Go handling 50k RPS.' }],
            },
            {
              canonical: 'gRPC',
              category: 'Networking',
              required: 'must',
              status: 'missing',
              proficiency: 0,
              evidence: [],
            },
          ],
          audit: {
            wordCount: 420,
            parseQuality: 'High',
            contactInfo: {
              email: 'candidate@example.com',
              phone: '+1-555-0199',
              linkedin: 'linkedin.com/in/candidate',
              github: 'github.com/candidate',
              portfolio: null,
            },
            sectionsFound: ['Experience', 'Education', 'Skills', 'Projects'],
            missingStandardSections: [],
            weakBulletsCount: 2,
            metricsRatio: 0.65,
            stuffedSkills: [],
          },
        },
        canonical: {
          applicationGuidance: 'Ready to apply',
          confidence: 'High',
        },
      },
      delta: null,
    };

    const atsModel = buildDossierModel({
      entry: atsAudit,
      resumeText: 'Go engineer with microservices experience.',
      jdText: 'Looking for a Senior Software Engineer with Go and gRPC.',
      baseline: null,
      candidate: { name: 'Rahul Verma' },
      planItems: [],
      generatedAt: '2026-11-14T09:30:00Z',
    });

    expect(atsModel.atsDiagnostics).toBeDefined();
    expect(atsModel.atsDiagnostics?.subscores.mustHaveCoverage).toBe(24);
    expect(atsModel.atsDiagnostics?.penalties.length).toBe(1);
    expect(atsModel.atsDiagnostics?.penalties[0].label).toBe('Missing Must-Have Skill');
    expect(atsModel.atsDiagnostics?.fixFirst.length).toBe(1);
    expect(atsModel.atsDiagnostics?.skillsInventory.length).toBe(2);
    expect(atsModel.atsDiagnostics?.formattingAudit.wordCount).toBe(420);

    // Test PDF and Markdown compilation
    const pdfBytes = await generatePdfDossier(atsModel);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(2000);

    const md = generateMarkdownDossier(atsModel);
    expect(md).toContain('ATS Resume Roaster — 4-Layer In-Depth Evaluation');
    expect(md).toContain('Layer 1: 7-Dimension Weighted Subscores');
    expect(md).toContain('Layer 2: High-Impact Fix These First');
    expect(md).toContain('Layer 3: Complete Skills Inventory');
    expect(md).toContain('Layer 4: Formatting, Structural & Bullet Audit');
    expect(md).not.toContain('TalentLens™ Competency Intelligence & Market Benchmark Report');
    expect(md).not.toContain('Section 1: Multi-Layer Competency Framework Breakdown');
  });
});

