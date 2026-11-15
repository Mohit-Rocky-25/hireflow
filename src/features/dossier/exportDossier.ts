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
  const isTalentLens = model.meta.kind === 'talentlens';
  const isAtsRoast = model.meta.kind === 'ats_roast';

  const lines: string[] = [];

  if (isTalentLens) {
    lines.push(`# HireFlow Candidate Audit Report — TalentLens™ Competency Intelligence & Market Benchmark Report`);
    lines.push(``);
    lines.push(`- **Target Role**: ${model.target.roleTitle || 'Target Role'}${model.target.level ? ` (${model.target.level})` : ''} at ${model.target.company || 'Company'}${model.target.tier ? ` [${model.target.tier} Tier]` : ''}`);
    lines.push(`- **Industry & Domain**: ${model.target.industry || 'Technology & Software'}`);
    lines.push(`- **Candidate**: ${model.candidate.name} (${model.candidate.resumeLabel})`);
    lines.push(`- **Date**: ${new Date(model.meta.generatedAt).toLocaleString()}`);
    lines.push(`- **Engine Version**: TalentLens Market Intelligence Engine v${model.meta.engineVersion}`);
    lines.push(`- **Placement Readiness**: ${model.headline.readinessStatus.toUpperCase()}`);
    if (model.headline.guidance) {
      lines.push(`- **Recruiter Guidance**: ${model.headline.guidance} (Confidence: ${model.headline.confidence || 'High'})`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`## Overall Benchmark Score: ${model.headline.score} / 100 ${model.headline.deltaText ? `(${model.headline.deltaText})` : ''} [Band: ${model.headline.scoreBand.toUpperCase()}]`);
    lines.push(``);

    if (model.companyContext) {
      lines.push(`### Company Hiring Context — ${model.target.company || 'Target Organization'}`);
      lines.push(`- **Hires 2024**: ${model.companyContext.hires2024 || 'Active'} ${model.companyContext.trend ? `(${model.companyContext.trend.toUpperCase()} YoY)` : ''}`);
      lines.push(`- **Open Roles**: ${model.companyContext.openRoles || 'Multiple'}`);
      lines.push(`- **Avg Package**: ${model.companyContext.avgPackage || 'Market Competitive'}`);
      lines.push(`- **Glassdoor Rating**: ${model.companyContext.glassdoor || '4.2 / 5'}`);
      lines.push(``);
    }

    lines.push(`### Executive Summary & Company Calibration`);
    for (const s of model.summary) {
      lines.push(`- ${s}`);
    }
    lines.push(``);

    if (model.breakdown.length > 0) {
      lines.push(`### Section 1: Multi-Layer Competency Framework Breakdown`);
      lines.push(`| Competency / Dimension | Score | Req Level | Status | Layer Scores (L1-L5) |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
      for (const b of model.breakdown) {
        const ls = b.layerScores ? `${b.layerScores.l1}/${b.layerScores.l2}/${b.layerScores.l3}/${b.layerScores.l4}/${b.layerScores.l5}` : '—';
        lines.push(`| **${b.label}** | ${b.score} / 100 | ${b.reqLevel || 'Strong'} | ${(b.status || 'Verified').toUpperCase()} | ${ls} |`);
      }
      lines.push(``);

      lines.push(`#### Extracted Evidence & Skill Citations`);
      for (const b of model.breakdown) {
        if (b.evidenceQuotes && b.evidenceQuotes.length > 0) {
          lines.push(`- **${b.label}**:`);
          for (const eq of b.evidenceQuotes) {
            lines.push(`  - Matched Quote: "${eq}"`);
          }
        }
        if (b.gaps && b.gaps.length > 0) {
          for (const g of b.gaps) {
            lines.push(`  - Open Gap: ${g}`);
          }
        }
      }
      lines.push(``);
    }

    if (model.learningPath && model.learningPath.plans.length > 0) {
      lines.push(`---`);
      lines.push(`### Section 2: TalentLens™ Career Acceleration Plan (${model.learningPath.plans.length} Action Milestones)`);
      lines.push(``);
      for (const [idx, plan] of model.learningPath.plans.entries()) {
        lines.push(`#### Plan ${idx + 1}: [${plan.priority.toUpperCase()}] ${plan.title} (${plan.timeframe || 'Immediate'} • Gain: ${plan.hypotheticalScoreGain})`);
        lines.push(`- **Strategy & Detail**: ${plan.detail}`);
        if (plan.suggestedAction) {
          lines.push(`- **Suggested Action**: ${plan.suggestedAction}`);
        }
        if (plan.bulletTemplate) {
          lines.push(`- **Portfolio STAR Bullet**: \`${plan.bulletTemplate}\``);
        }
        if (plan.resources && plan.resources.length > 0) {
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
      lines.push(`---`);
      lines.push(`### Section 3: TalentLens™ Market Intelligence & Build Verification Report`);
      lines.push(`- **Market Standing**: ${tl.marketPosition.toUpperCase()}`);
      lines.push(`- **Overall Market Fit**: ${tl.overallMarketFit}% (vs curated benchmark)`);
      lines.push(`- **Tech Currency Score**: ${tl.techCurrencyScore}% (Modern vs legacy stack)`);
      lines.push(`- **Delivery Signals (CI/CD, Tests, Monitoring)**: ${tl.buildAuthenticity}%`);
      lines.push(`- **Fundamental Engineering Depth**: ${tl.fundamentalDepth}%`);
      lines.push(`- **Build Research Verdict**: ${tl.buildVerdict}`);
      lines.push(``);

      if (tl.modernPractices.length > 0) {
        lines.push(`- **Modern Practices Verified**: ${tl.modernPractices.join(', ')}`);
      }
      if (tl.outdatedSignals.length > 0) {
        lines.push(`- **Legacy / Outdated Signals**: ${tl.outdatedSignals.join(', ')}`);
      }
      if (tl.emergingAdoption.length > 0) {
        lines.push(`- **Emerging Tech Adoption**: ${tl.emergingAdoption.join(', ')}`);
      }
      lines.push(``);

      if (tl.findings && tl.findings.length > 0) {
        lines.push(`#### Per-Competency Market Findings`);
        for (const f of tl.findings) {
          lines.push(`- **[${f.status.toUpperCase()}] ${f.category.toUpperCase()}**: ${f.finding}`);
          if (f.evidence && f.evidence.length > 0) {
            lines.push(`  - Verified Signals: ${f.evidence.join(', ')}`);
          }
          if (f.marketContext) {
            lines.push(`  - Market Context: ${f.marketContext}`);
          }
        }
        lines.push(``);
      }
    }

    if (model.projectDrops && model.projectDrops.length > 0) {
      lines.push(`---`);
      lines.push(`### Section 4: Recommended Proof-of-Work Project Drops`);
      lines.push(`Targeted production-grade portfolio projects designed to close your identified competency gaps:`);
      lines.push(``);
      for (const [idx, p] of model.projectDrops.entries()) {
        lines.push(`#### Project Drop ${idx + 1}: ${p.title} (${p.domain} • ${p.difficulty.toUpperCase()} • ~${p.estimatedHours} hrs)`);
        if (p.whyThisProject) {
          lines.push(`- **Why this project**: ${p.whyThisProject}`);
        }
        if (p.closes && p.closes.length > 0) {
          lines.push(`- **Closes**: ${p.closes.join(', ')}`);
        }
        lines.push(`- **Covered Skills**: ${p.coveredSkills.join(', ')}`);
        lines.push(`- **Problem Statement**: ${p.problemStatement}`);
        lines.push(`- **Architecture & Stack**: ${p.architecture}`);
        lines.push(`- **Recruiter Signal**: ${p.recruiterSignal}`);
        lines.push(`- **Portfolio STAR Bullet**: \`${p.portfolioBulletFormula}\``);
        lines.push(``);
      }
    }

    lines.push(`---`);
    lines.push(`### Cryptographic Integrity Hashes`);
    lines.push(`- **Resume SHA-256**: \`${model.meta.integrity.resumeHash}\``);
    lines.push(`- **JD SHA-256**: \`${model.meta.integrity.jdHash}\``);
    lines.push(``);

    return lines.join('\n');
  }

  if (isAtsRoast) {
    lines.push(`# HireFlow Candidate Audit Report — ATS Resume Roaster™ 4-Layer Diagnostic Audit`);
    lines.push(``);
    lines.push(`- **Target Role**: ${model.target.roleTitle || 'Target Role'} at ${model.target.company || 'Job Description'}`);
    lines.push(`- **Candidate**: ${model.candidate.name} (${model.candidate.resumeLabel})`);
    lines.push(`- **Date**: ${new Date(model.meta.generatedAt).toLocaleString()}`);
    lines.push(`- **Engine Version**: ATS Resume Roaster Engine v${model.meta.engineVersion}`);
    lines.push(`- **Screening Readiness**: ${model.headline.readinessStatus.toUpperCase()}`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`## Overall Benchmark Score: ${model.headline.score} / 100 ${model.headline.deltaText ? `(${model.headline.deltaText})` : ''} [Band: ${model.headline.scoreBand.toUpperCase()}]`);
    lines.push(``);
    lines.push(`### Executive Screening Roast Summary`);
    for (const s of model.summary) {
      lines.push(`- ${s}`);
    }
    lines.push(``);

    const ats = model.atsDiagnostics;
    lines.push(`---`);
    lines.push(`## ATS Resume Roaster — 4-Layer In-Depth Evaluation`);
    lines.push(``);
    lines.push(`### Layer 1: 7-Dimension Weighted Subscores`);
    lines.push(`- **Must-Have Skill Coverage**: ${ats.subscores.mustHaveCoverage} / 30 pts`);
    lines.push(`- **Evidence Depth**: ${ats.subscores.evidenceDepth} / 20 pts`);
    lines.push(`- **Impact & Numerical Metrics**: ${ats.subscores.impactMetrics} / 15 pts`);
    lines.push(`- **Project Relevance & OSS**: ${ats.subscores.projectsAndOss} / 10 pts`);
    lines.push(`- **Seniority Fit**: ${ats.subscores.seniorityFit} / 10 pts`);
    lines.push(`- **Format & Parsing Safety**: ${ats.subscores.formatAndParse} / 10 pts`);
    lines.push(`- **Target Tier Alignment**: ${ats.subscores.tierFit} / 5 pts`);
    lines.push(``);

    if (ats.seniorityMode) {
      lines.push(`**Seniority Assessment**: Candidate demonstrated ${ats.seniorityMode.candidateYears} yrs vs ${ats.seniorityMode.requiredYears} yrs required (${ats.seniorityMode.level} level). ${ats.seniorityMode.fitExplanation}`);
      lines.push(``);
    }

    if (ats.penalties.length > 0) {
      lines.push(`#### Deductions & Scoring Penalties`);
      for (const p of ats.penalties) {
        lines.push(`- [${p.points} pts] **${p.label}**: ${p.reason}`);
      }
      lines.push(``);
    }

    if (ats.fixFirst.length > 0) {
      lines.push(`### Layer 2: High-Impact Fix These First (Action Items)`);
      for (const f of ats.fixFirst) {
        lines.push(`- **[+${f.expectedScoreGain} pts Potential Gain] ${f.title}**`);
        lines.push(`  - Reason: ${f.reason}`);
        lines.push(`  - Category: ${f.type.replace(/_/g, ' ')}`);
      }
      lines.push(``);
    }

    if (ats.skillsInventory.length > 0) {
      lines.push(`### Layer 3: Complete Skills Inventory (Must-Have vs Nice-to-Have)`);
      lines.push(`| Skill / Requirement | Category | Importance | Status | Extracted Citation |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
      for (const sk of ats.skillsInventory) {
        const quote = sk.evidenceQuotes[0] ? `"${sk.evidenceQuotes[0].replace(/\|/g, '/')}"` : 'None';
        lines.push(`| ${sk.canonical} | ${sk.category} | ${sk.required.toUpperCase()} | ${sk.status.toUpperCase()} | ${quote} |`);
      }
      lines.push(``);
    }

    lines.push(`### Layer 4: Formatting, Structural & Bullet Audit`);
    lines.push(`- **Word Count**: ${ats.formattingAudit.wordCount} words (Parse Health: ${ats.formattingAudit.parseQuality})`);
    lines.push(`- **Sections Found**: ${ats.formattingAudit.sectionsFound.join(', ') || 'None'}`);
    lines.push(`- **Missing Standard Sections**: ${ats.formattingAudit.missingStandardSections.join(', ') || 'None (All standard sections present)'}`);
    lines.push(`- **Weak Bullets**: ${ats.formattingAudit.weakBulletsCount} weak bullets detected`);
    lines.push(`- **Metrics Ratio**: ${Math.round(ats.formattingAudit.metricsRatio * 100)}% of bullets include quantified numbers`);
    lines.push(``);

    if (model.gaps.open.length > 0) {
      lines.push(`### Identified Evidence & Skill Gaps`);
      for (const g of model.gaps.open) {
        lines.push(`- **[GAP]** ${g.label} (Severity: ${g.severity}/3) ${g.detail ? `— ${g.detail}` : ''}`);
      }
      lines.push(``);
    }

    if (model.planned.length > 0) {
      lines.push(`### Candidate OS Action Items`);
      for (const p of model.planned) {
        lines.push(`- [ ] **${p.title}** (${p.kind}) — Status: ${p.status}`);
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(`### Cryptographic Integrity Hashes`);
    lines.push(`- **Resume SHA-256**: \`${model.meta.integrity.resumeHash}\``);
    lines.push(`- **JD SHA-256**: \`${model.meta.integrity.jdHash}\``);
    lines.push(``);

    return lines.join('\n');
  }

  // Composite fallback
  lines.push(`# HireFlow Candidate Audit Report — Technical Career Dossier`);
  lines.push(``);
  lines.push(`- **Target Role**: ${model.target.roleTitle || 'Target Role'} at ${model.target.company || 'Company'}`);
  lines.push(`- **Candidate**: ${model.candidate.name} (${model.candidate.resumeLabel})`);
  lines.push(`- **Engine Version**: v${model.meta.engineVersion}`);
  lines.push(``);
  lines.push(`## Overall Benchmark Score: ${model.headline.score} / 100`);
  return lines.join('\n');
}

export function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
