import React from 'react';
import { Download, Printer } from 'lucide-react';
import { DeterministicFacts, AICommentary } from '../../lib/ats/types';

interface Props {
  facts: DeterministicFacts;
  ai?: AICommentary;
}

export const ExportActions: React.FC<Props> = ({ facts, ai }) => {
  const handleExportMarkdown = () => {
    const lines: string[] = [];

    lines.push(`# HireFlow ATS Resume Roaster — Evaluation Report`);
    lines.push(`**Generated:** ${new Date().toLocaleDateString()} | **Target Role:** ${facts.jd.roleTitle || 'Software Engineer'}`);
    lines.push(`**Overall ATS Match Score:** ${facts.scoreBreakdown.finalScore}%`);
    lines.push(`**Market Tier Fit:** ${facts.marketPositioning.bestFitTier}`);
    lines.push(``);

    lines.push(`## 1. Score Breakdown`);
    lines.push(`- Must-Have Skills Coverage (35%): ${facts.scoreBreakdown.mustHaveCoverageScore}%`);
    lines.push(`- Evidence & Impact Quality (20%): ${facts.scoreBreakdown.evidenceQualityScore}%`);
    lines.push(`- Seniority & Experience Fit (10%): ${facts.scoreBreakdown.seniorityFitScore}%`);
    lines.push(`- Project Relevance (10%): ${facts.scoreBreakdown.projectRelevanceScore}%`);
    lines.push(`- Nice-to-Have Coverage (10%): ${facts.scoreBreakdown.niceToHaveCoverageScore}%`);
    lines.push(`- ATS Format Safety (10%): ${facts.scoreBreakdown.formatSafetyScore}%`);
    if (facts.scoreBreakdown.keywordStuffingPenalty < 0) {
      lines.push(`- Keyword Stuffing Penalty: ${facts.scoreBreakdown.keywordStuffingPenalty} pts`);
    }
    lines.push(``);

    lines.push(`## 2. Keyword & Skill Analysis`);
    lines.push(`### Matched Keywords (${facts.matchedKeywords.length})`);
    lines.push(facts.matchedKeywords.join(', ') || 'None');
    lines.push(``);
    lines.push(`### Missing Keywords (${facts.missingKeywords.length})`);
    lines.push(facts.missingKeywords.join(', ') || 'None');
    lines.push(``);

    lines.push(`## 3. The Harsh Truth (Recruiter Feedback)`);
    facts.harshTruthsDeterministic.forEach((truth, idx) => {
      lines.push(`${idx + 1}. ${truth}`);
    });
    lines.push(``);

    if (ai) {
      lines.push(`## 4. Recruiter 6-Second Glance`);
      lines.push(`> "${ai.recruiterFirst6Seconds}"`);
      lines.push(``);

      lines.push(`## 5. Bullet Doctor (XYZ Rewrites)`);
      ai.bulletRewrites.forEach((rw, idx) => {
        lines.push(`### Rewrite #${idx + 1}`);
        lines.push(`**Original:** ~"${rw.original}"~`);
        lines.push(`**Rewritten:** "${rw.rewritten}"`);
        lines.push(`**What Changed:** ${rw.whatChanged}`);
        lines.push(``);
      });

      lines.push(`## 6. Interview Risk Radar`);
      ai.interviewRiskQuestions.forEach((q, idx) => {
        lines.push(`### Question #${idx + 1}: "${q.question}"`);
        lines.push(`- **Why they will ask:** ${q.whyTheyWillAsk}`);
        lines.push(`- **Preparation Hint:** ${q.prepHint}`);
        lines.push(``);
      });

      lines.push(`## 7. 7-Day Sprint Plan`);
      ai.sevenDayPlan.forEach((p) => {
        lines.push(`- **Day ${p.day}:** ${p.task} — *Deliverable: ${p.outcome}*`);
      });
      lines.push(``);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HireFlow_ATS_Report_${(facts.jd.roleTitle || 'Role').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        onClick={handleExportMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:bg-surface-3 rounded-md text-xs font-bold text-text transition-colors shadow-xs"
        title="Download comprehensive Markdown report"
      >
        <Download className="w-3.5 h-3.5 text-primary" /> Export Markdown
      </button>

      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:bg-surface-3 rounded-md text-xs font-bold text-text transition-colors shadow-xs"
        title="Print or Save as PDF"
      >
        <Printer className="w-3.5 h-3.5 text-text-secondary" /> Print / PDF
      </button>
    </div>
  );
};
