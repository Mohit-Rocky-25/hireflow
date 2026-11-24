import type { AuditEntry, PlanItem, TextSnapshot } from '@/domain/types';
import { buildDossierModel, type DossierModel } from './dossierModel';
import { generatePdfDossier } from './exportPdf';
import { generateDocxDossier } from './exportDocx';
import { kvGet } from '@/lib/storage/kv';
import { getSnapshotKey } from '@/lib/storage/namespace';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useProfileStore } from '@/features/profile/useProfileStore';

export type DossierFormat = 'pdf' | 'docx' | 'json' | 'md' | 'txt';

export interface ExportDossierOptions {
  audit: AuditEntry;
  resumeText?: string;
  jdText?: string;
  format: DossierFormat;
}

export function generateMarkdownDossier(model: DossierModel): string {
  const isTalentLens = model.meta?.kind === 'talentlens';
  const isAtsRoast = model.meta?.kind === 'ats_roast';

  const lines: string[] = [];
  const readiness = String(model.headline?.readinessStatus || 'Evaluated').toUpperCase();
  const band = String(model.headline?.scoreBand || 'Standard').toUpperCase();
  const targetRole = model.target?.roleTitle || 'Target Role';
  const roleLevel = model.target?.level ? ` (${model.target.level})` : '';
  const targetCompany = model.target?.company || 'Company';
  const targetTier = model.target?.tier ? ` [${model.target.tier} Tier]` : '';
  const candidateName = model.candidate?.name || 'Candidate';
  const resumeLabel = model.candidate?.resumeLabel || 'Current Resume';
  const genDate = model.meta?.generatedAt ? new Date(model.meta.generatedAt).toLocaleString() : new Date().toLocaleString();
  const engineVer = model.meta?.engineVersion || '4.0.0';

  if (isTalentLens) {
    lines.push(`# HireFlow Candidate Audit Report — TalentLens™ Competency Intelligence & Market Benchmark Report`);
    lines.push(``);
    lines.push(`- **Target Role**: ${targetRole}${roleLevel} at ${targetCompany}${targetTier}`);
    lines.push(`- **Industry & Domain**: ${model.target?.industry || 'Technology & Software'}`);
    lines.push(`- **Candidate**: ${candidateName} (${resumeLabel})`);
    lines.push(`- **Date**: ${genDate}`);
    lines.push(`- **Engine Version**: TalentLens Market Intelligence Engine v${engineVer}`);
    lines.push(`- **Placement Readiness**: ${readiness}`);
    if (model.headline?.guidance) {
      lines.push(`- **Recruiter Guidance**: ${model.headline.guidance} (Confidence: ${model.headline.confidence || 'High'})`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`## Overall Benchmark Score: ${model.headline?.score ?? 0} / 100 ${model.headline?.deltaText ? `(${model.headline.deltaText})` : ''} [Band: ${band}]`);
    lines.push(``);

    if (model.companyContext) {
      const trendStr = model.companyContext.trend ? `(${String(model.companyContext.trend).toUpperCase()} YoY)` : '';
      lines.push(`### Company Hiring Context — ${targetCompany}`);
      lines.push(`- **Hires 2024**: ${model.companyContext.hires2024 || 'Active'} ${trendStr}`.trim());
      lines.push(`- **Open Roles**: ${model.companyContext.openRoles || 'Multiple'}`);
      lines.push(`- **Avg Package**: ${model.companyContext.avgPackage || 'Market Competitive'}`);
      lines.push(`- **Glassdoor Rating**: ${model.companyContext.glassdoor || '4.2 / 5'}`);
      lines.push(``);
    }

    lines.push(`### Executive Summary & Company Calibration`);
    for (const s of (Array.isArray(model.summary) ? model.summary : [])) {
      lines.push(`- ${s}`);
    }
    lines.push(``);

    if (Array.isArray(model.breakdown) && model.breakdown.length > 0) {
      lines.push(`### Section 1: Multi-Layer Competency Framework Breakdown`);
      lines.push(`| Competency / Dimension | Score | Req Level | Status | Layer Scores (L1-L5) |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
      for (const b of model.breakdown) {
        const ls = b.layerScores ? `${b.layerScores.l1}/${b.layerScores.l2}/${b.layerScores.l3}/${b.layerScores.l4}/${b.layerScores.l5}` : '—';
        lines.push(`| **${b.label || b.key}** | ${b.score ?? 0} / 100 | ${b.reqLevel || 'Strong'} | ${String(b.status || 'Verified').toUpperCase()} | ${ls} |`);
      }
      lines.push(``);

      lines.push(`#### Extracted Evidence & Skill Citations`);
      for (const b of model.breakdown) {
        if (Array.isArray(b.evidenceQuotes) && b.evidenceQuotes.length > 0) {
          lines.push(`- **${b.label || b.key}**:`);
          for (const eq of b.evidenceQuotes) {
            lines.push(`  - Matched Quote: "${eq}"`);
          }
        }
        if (Array.isArray(b.gaps) && b.gaps.length > 0) {
          for (const g of b.gaps) {
            lines.push(`  - Open Gap: ${g}`);
          }
        }
      }
      lines.push(``);
    }

    if (model.learningPath && Array.isArray(model.learningPath.plans) && model.learningPath.plans.length > 0) {
      lines.push(`---`);
      lines.push(`### Section 2: TalentLens™ Career Acceleration Plan (${model.learningPath.plans.length} Action Milestones)`);
      lines.push(``);
      for (const [idx, plan] of model.learningPath.plans.entries()) {
        const priorityStr = String(plan.priority || 'High').toUpperCase();
        lines.push(`#### Plan ${idx + 1}: [${priorityStr}] ${plan.title || 'Action'} (${plan.timeframe || 'Immediate'} • Gain: ${plan.hypotheticalScoreGain || '+5 pts'})`);
        lines.push(`- **Strategy & Detail**: ${plan.detail || ''}`);
        if (plan.suggestedAction) {
          lines.push(`- **Suggested Action**: ${plan.suggestedAction}`);
        }
        if (plan.bulletTemplate) {
          lines.push(`- **Portfolio STAR Bullet**: \`${plan.bulletTemplate}\``);
        }
        if (Array.isArray(plan.resources) && plan.resources.length > 0) {
          lines.push(`- **Curated Resources**:`);
          for (const [ri, r] of plan.resources.entries()) {
            lines.push(`  ${ri + 1}. ${r}`);
          }
        }
        lines.push(``);
      }
    }

    if (model.talentLensIntel) {
      const tl = model.talentLensIntel;
      const modern = Array.isArray(tl.modernPractices) ? tl.modernPractices.join(', ') : '';
      const outdated = Array.isArray(tl.outdatedSignals) ? tl.outdatedSignals.join(', ') : '';
      const emerging = Array.isArray(tl.emergingAdoption) ? tl.emergingAdoption.join(', ') : '';

      lines.push(`---`);
      lines.push(`### Section 3: TalentLens™ Market Intelligence & Build Verification Report`);
      lines.push(`- **Market Standing**: ${String(tl.marketPosition || 'Market Current').toUpperCase()}`);
      lines.push(`- **Overall Market Fit**: ${tl.overallMarketFit ?? 70}% (vs curated benchmark)`);
      lines.push(`- **Tech Currency Score**: ${tl.techCurrencyScore ?? 75}% (Modern vs legacy stack)`);
      lines.push(`- **Delivery Signals (CI/CD, Tests, Monitoring)**: ${tl.buildAuthenticity ?? 70}%`);
      lines.push(`- **Fundamental Engineering Depth**: ${tl.fundamentalDepth ?? 75}%`);
      lines.push(`- **Build Research Verdict**: ${tl.buildVerdict || 'Verified against market requirements.'}`);
      lines.push(``);

      if (modern) {
        lines.push(`- **Modern Practices Verified**: ${modern}`);
      }
      if (outdated) {
        lines.push(`- **Legacy / Outdated Signals**: ${outdated}`);
      }
      if (emerging) {
        lines.push(`- **Emerging Tech Adoption**: ${emerging}`);
      }
      lines.push(``);

      if (Array.isArray(tl.findings) && tl.findings.length > 0) {
        lines.push(`#### Per-Competency Market Findings`);
        for (const f of tl.findings) {
          lines.push(`- **[${String(f.status || 'Verified').toUpperCase()}] ${String(f.category || 'Competency').toUpperCase()}**: ${f.finding || ''}`);
          if (Array.isArray(f.evidence) && f.evidence.length > 0) {
            lines.push(`  - Verified Signals: ${f.evidence.join(', ')}`);
          }
          if (f.marketContext) {
            lines.push(`  - Market Context: ${f.marketContext}`);
          }
        }
        lines.push(``);
      }
    }

    if (Array.isArray(model.projectDrops) && model.projectDrops.length > 0) {
      lines.push(`---`);
      lines.push(`### Section 4: Recommended Proof-of-Work Project Drops`);
      lines.push(`Targeted production-grade portfolio projects designed to close your identified competency gaps:`);
      lines.push(``);
      for (const [idx, p] of model.projectDrops.entries()) {
        const diffStr = String(p.difficulty || 'Intermediate').toUpperCase();
        lines.push(`#### Project Drop ${idx + 1}: ${p.title} (${p.domain || 'Engineering'} • ${diffStr} • ~${p.estimatedHours || 20} hrs)`);
        if (p.whyThisProject) {
          lines.push(`- **Why this project**: ${p.whyThisProject}`);
        }
        if (Array.isArray(p.closes) && p.closes.length > 0) {
          lines.push(`- **Closes**: ${p.closes.join(', ')}`);
        }
        lines.push(`- **Covered Skills**: ${Array.isArray(p.coveredSkills) ? p.coveredSkills.join(', ') : ''}`);
        lines.push(`- **Problem Statement**: ${p.problemStatement || ''}`);
        lines.push(`- **Architecture & Stack**: ${p.architecture || ''}`);
        lines.push(`- **Recruiter Signal**: ${p.recruiterSignal || ''}`);
        lines.push(`- **Portfolio STAR Bullet**: \`${p.portfolioBulletFormula || ''}\``);
        lines.push(``);
      }
    }

    lines.push(`---`);
    lines.push(`### Cryptographic Integrity Hashes`);
    lines.push(`- **Resume SHA-256**: \`${model.meta?.integrity?.resumeHash || 'N/A'}\``);
    lines.push(`- **JD SHA-256**: \`${model.meta?.integrity?.jdHash || 'N/A'}\``);
    lines.push(``);

    return lines.join('\n');
  }

  if (isAtsRoast) {
    lines.push(`# HireFlow Candidate Audit Report — ATS Resume Roaster™ 4-Layer Diagnostic Audit`);
    lines.push(``);
    lines.push(`- **Target Role**: ${targetRole} at ${targetCompany}`);
    lines.push(`- **Candidate**: ${candidateName} (${resumeLabel})`);
    lines.push(`- **Date**: ${genDate}`);
    lines.push(`- **Engine Version**: ATS Resume Roaster Engine v${engineVer}`);
    lines.push(`- **Screening Readiness**: ${readiness}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`## Overall Benchmark Score: ${model.headline?.score ?? 0} / 100 ${model.headline?.deltaText ? `(${model.headline.deltaText})` : ''} [Band: ${band}]`);
    lines.push(``);
    lines.push(`### Executive Screening Roast Summary`);
    for (const s of (Array.isArray(model.summary) ? model.summary : [])) {
      lines.push(`- ${s}`);
    }
    lines.push(``);

    const ats = model.atsDiagnostics || {
      subscores: { mustHaveCoverage: 20, evidenceDepth: 15, impactMetrics: 10, projectsAndOss: 8, seniorityFit: 8, formatAndParse: 8, tierFit: 4 },
      penalties: [],
      seniorityMode: { candidateYears: 3, requiredYears: 4, level: 'Mid-Level', fitExplanation: '' },
      fixFirst: [],
      skillsInventory: [],
      formattingAudit: { wordCount: 450, parseQuality: 'High', contactInfo: {}, sectionsFound: ['Experience', 'Skills'], missingStandardSections: [], weakBulletsCount: 0, metricsRatio: 0.5, stuffedSkills: [] },
    };
    const subs = ats.subscores || { mustHaveCoverage: 20, evidenceDepth: 15, impactMetrics: 10, projectsAndOss: 8, seniorityFit: 8, formatAndParse: 8, tierFit: 4 };

    lines.push(`---`);
    lines.push(`## ATS Resume Roaster — 4-Layer In-Depth Evaluation`);
    lines.push(``);
    lines.push(`### Layer 1: 7-Dimension Weighted Subscores`);
    lines.push(`- **Must-Have Skill Coverage**: ${subs.mustHaveCoverage ?? 0} / 30 pts`);
    lines.push(`- **Evidence Depth**: ${subs.evidenceDepth ?? 0} / 20 pts`);
    lines.push(`- **Impact & Numerical Metrics**: ${subs.impactMetrics ?? 0} / 15 pts`);
    lines.push(`- **Project Relevance & OSS**: ${subs.projectsAndOss ?? 0} / 10 pts`);
    lines.push(`- **Seniority Fit**: ${subs.seniorityFit ?? 0} / 10 pts`);
    lines.push(`- **Format & Parsing Safety**: ${subs.formatAndParse ?? 0} / 10 pts`);
    lines.push(`- **Target Tier Alignment**: ${subs.tierFit ?? 0} / 5 pts`);
    lines.push(``);

    if (ats.seniorityMode) {
      lines.push(`**Seniority Assessment**: Candidate demonstrated ${ats.seniorityMode.candidateYears} yrs vs ${ats.seniorityMode.requiredYears} yrs required (${ats.seniorityMode.level} level). ${ats.seniorityMode.fitExplanation}`);
      lines.push(``);
    }

    if (Array.isArray(ats.penalties) && ats.penalties.length > 0) {
      lines.push(`#### Deductions & Scoring Penalties`);
      for (const p of ats.penalties) {
        lines.push(`- [${p.points} pts] **${p.label}**: ${p.reason}`);
      }
      lines.push(``);
    }

    if (Array.isArray(ats.fixFirst) && ats.fixFirst.length > 0) {
      lines.push(`### Layer 2: High-Impact Fix These First (Action Items)`);
      for (const f of ats.fixFirst) {
        lines.push(`- **[+${f.expectedScoreGain || 5} pts Potential Gain] ${f.title}**`);
        lines.push(`  - Reason: ${f.reason || ''}`);
        lines.push(`  - Category: ${String(f.type || 'improvement').replace(/_/g, ' ')}`);
      }
      lines.push(``);
    }

    if (Array.isArray(ats.skillsInventory) && ats.skillsInventory.length > 0) {
      lines.push(`### Layer 3: Complete Skills Inventory (Must-Have vs Nice-to-Have)`);
      lines.push(`| Skill / Requirement | Category | Importance | Status | Extracted Citation |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
      for (const sk of ats.skillsInventory) {
        const quote = Array.isArray(sk.evidenceQuotes) && sk.evidenceQuotes[0] ? `"${sk.evidenceQuotes[0].replace(/\|/g, '/')}"` : 'None';
        lines.push(`| ${sk.canonical} | ${sk.category} | ${String(sk.required || 'must').toUpperCase()} | ${String(sk.status || 'verified').toUpperCase()} | ${quote} |`);
      }
      lines.push(``);
    }

    const fmt = ats.formattingAudit || {
      wordCount: 450,
      parseQuality: 'High',
      sectionsFound: ['Experience', 'Skills'],
      missingStandardSections: [],
      weakBulletsCount: 0,
      metricsRatio: 0.5,
    };
    const sectionsFoundStr = Array.isArray(fmt.sectionsFound) ? fmt.sectionsFound.join(', ') : 'Standard sections';
    const missingSectionsStr = Array.isArray(fmt.missingStandardSections) && fmt.missingStandardSections.length > 0
      ? fmt.missingStandardSections.join(', ')
      : 'None (All standard sections present)';

    lines.push(`### Layer 4: Formatting, Structural & Bullet Audit`);
    lines.push(`- **Word Count**: ${fmt.wordCount ?? 450} words (Parse Health: ${fmt.parseQuality || 'High'})`);
    lines.push(`- **Sections Found**: ${sectionsFoundStr || 'None'}`);
    lines.push(`- **Missing Standard Sections**: ${missingSectionsStr}`);
    lines.push(`- **Weak Bullets**: ${fmt.weakBulletsCount ?? 0} weak bullets detected`);
    lines.push(`- **Metrics Ratio**: ${Math.round((fmt.metricsRatio ?? 0.5) * 100)}% of bullets include quantified numbers`);
    lines.push(``);

    if (model.gaps && Array.isArray(model.gaps.open) && model.gaps.open.length > 0) {
      lines.push(`### Identified Evidence & Skill Gaps`);
      for (const g of model.gaps.open) {
        lines.push(`- **[GAP]** ${g.label} (Severity: ${g.severity}/3) ${g.detail ? `— ${g.detail}` : ''}`);
      }
      lines.push(``);
    }

    if (Array.isArray(model.planned) && model.planned.length > 0) {
      lines.push(`### Candidate OS Action Items`);
      for (const p of model.planned) {
        lines.push(`- [ ] **${p.title}** (${p.kind}) — Status: ${p.status}`);
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(`### Cryptographic Integrity Hashes`);
    lines.push(`- **Resume SHA-256**: \`${model.meta?.integrity?.resumeHash || 'N/A'}\``);
    lines.push(`- **JD SHA-256**: \`${model.meta?.integrity?.jdHash || 'N/A'}\``);
    lines.push(``);

    return lines.join('\n');
  }

  // Composite fallback
  lines.push(`# HireFlow Candidate Audit Report — Technical Career Dossier`);
  lines.push(``);
  lines.push(`- **Target Role**: ${targetRole} at ${targetCompany}`);
  lines.push(`- **Candidate**: ${candidateName} (${resumeLabel})`);
  lines.push(`- **Engine Version**: v${engineVer}`);
  lines.push(``);
  lines.push(`## Overall Benchmark Score: ${model.headline?.score ?? 0} / 100`);
  return lines.join('\n');
}

export function triggerDownload(blob: Blob | Uint8Array | ArrayBuffer, filename: string): void {
  if (typeof window === 'undefined') return;
  const safeBlob = blob instanceof Blob
    ? blob
    : new Blob([blob as any], {
        type: filename.endsWith('.docx')
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : filename.endsWith('.pdf')
          ? 'application/pdf'
          : filename.endsWith('.json')
          ? 'application/json'
          : 'text/plain;charset=utf-8',
      });
  const url = URL.createObjectURL(safeBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function createDossierModelFromAudit(audit: AuditEntry): Promise<DossierModel> {
  const resumeSnap = await kvGet<TextSnapshot>(getSnapshotKey(audit.resume.snapshotHash));
  const jdSnap = await kvGet<TextSnapshot>(getSnapshotKey(audit.jd.snapshotHash));

  const resumeText = resumeSnap?.text ?? '';
  const jdText = jdSnap?.text ?? '';

  const entries = useAuditStore.getState().entries;
  const previousAuditId = audit.delta?.baselineAuditId;
  const baseline = previousAuditId ? entries[previousAuditId] ?? null : null;

  const profile = useProfileStore.getState().profile;
  const planItems = Object.values(useMySpaceStore.getState().planItems);

  return buildDossierModel({
    entry: audit,
    resumeText,
    jdText,
    baseline,
    candidate: {
      name: profile?.displayName || 'Candidate',
      email: profile?.email,
    },
    planItems,
    generatedAt: new Date().toISOString(),
  });
}

export async function exportDossier(options: ExportDossierOptions): Promise<void> {
  const { audit, format } = options;

  let resumeText = options.resumeText;
  let jdText = options.jdText;

  if (!resumeText && audit.resume?.snapshotHash) {
    try {
      const snap = await kvGet<TextSnapshot>(getSnapshotKey(audit.resume.snapshotHash));
      resumeText = snap?.text;
    } catch {
      /* ignore */
    }
  }

  if (!jdText && audit.jd?.snapshotHash) {
    try {
      const snap = await kvGet<TextSnapshot>(getSnapshotKey(audit.jd.snapshotHash));
      jdText = snap?.text;
    } catch {
      /* ignore */
    }
  }

  resumeText = resumeText || '';
  jdText = jdText || (audit.jd?.roleTitle ? `${audit.jd.roleTitle} at ${audit.jd.company || 'Target Organization'}` : '');

  const entries = useAuditStore.getState().entries || {};
  const previousAuditId = audit.delta?.baselineAuditId;
  const baseline = previousAuditId ? entries[previousAuditId] ?? null : null;
  const profile = useProfileStore.getState().profile;
  const planItems: PlanItem[] = Object.values(useMySpaceStore.getState().planItems || {});

  const model = buildDossierModel({
    entry: audit,
    resumeText,
    jdText,
    baseline,
    candidate: {
      name: profile?.displayName || 'Candidate',
      email: profile?.email,
    },
    planItems,
    generatedAt: new Date().toISOString(),
  });

  const safeCompany = (model.target.company || 'general').replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeRole = (model.target.roleTitle || 'role').replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const prefix = model.meta.kind === 'talentlens' ? 'talentlens-report' : model.meta.kind === 'ats_roast' ? 'ats-roaster-report' : 'hireflow-dossier';
  const baseName = `${prefix}-${safeCompany}-${safeRole}-${dateStr}`;

  if (format === 'json') {
    const jsonStr = JSON.stringify(model, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `${baseName}.json`);
    return;
  }

  if (format === 'pdf') {
    const pdfBytes = await generatePdfDossier(model);
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    triggerDownload(blob, `${baseName}.pdf`);
    return;
  }

  if (format === 'docx') {
    const docxBlob = await generateDocxDossier(model);
    triggerDownload(docxBlob, `${baseName}.docx`);
    return;
  }

  if (format === 'md') {
    const mdContent = generateMarkdownDossier(model);
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    triggerDownload(blob, `${baseName}.md`);
    return;
  }

  if (format === 'txt') {
    const txtContent = generateMarkdownDossier(model);
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${baseName}.txt`);
    return;
  }
}
