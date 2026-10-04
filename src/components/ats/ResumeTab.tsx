import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AnalysisResponse } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse;
}

export const ResumeTab: React.FC<Props> = ({ data }) => {
  const { facts, passA, narrative, ai } = data;
  const resume = facts.resume;

  // Sections found
  const sectionsFound = Object.keys(resume.sections).filter(
    (k) => (resume.sections as any)[k]?.length > 0 || (k === 'rawSections' && Object.keys((resume.sections as any)[k] || {}).length > 0)
  );

  // Contact completeness
  const contact = resume.contact;
  const links = contact.links || [];
  const hasLinkedIn = links.some((l) => l.toLowerCase().includes('linkedin'));
  const hasGitHub = links.some((l) => l.toLowerCase().includes('github'));

  const contactItems = [
    { label: 'Name', present: Boolean(contact.name) },
    { label: 'Email', present: Boolean(contact.email) },
    { label: 'Phone', present: Boolean(contact.phone) },
    { label: 'LinkedIn', present: hasLinkedIn },
    { label: 'GitHub', present: hasGitHub },
  ];

  const parseWarnings = resume.parseWarnings || [];

  // Up to 3 rewrites, ONLY if bullets exist and are weak
  const rewrites = (narrative?.rewrites || ai?.bulletRewrites || []).slice(0, 3);
  const showRewrites = resume.bullets.length > 0 && rewrites.length > 0;

  // Ranked format & content issues
  const formatIssues = facts.formatRisks.map((r) => ({
    type: 'format' as const,
    severity: r.severity,
    title: r.name,
    desc: r.description,
  }));

  const weakBullets = facts.bulletAnalyses
    .filter((b) => b.score < 55)
    .slice(0, 3)
    .map((b) => ({
      type: 'bullet' as const,
      severity: 'medium' as const,
      title: `Weak Bullet (${b.score}/100)`,
      desc: `"${b.rawText}" lacks action verbs or quantifiable metrics.`,
    }));

  const mergedIssues = [...formatIssues, ...weakBullets];

  return (
    <div className="space-y-6">
      {/* 1. "What the ATS Parsed" Block */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider">
              What the ATS Parsed
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Transparent extraction audit exposing exactly what machine screeners detected
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              resume.parseStatus === 'failed'
                ? 'bg-rose-100 text-rose-800'
                : parseWarnings.length > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Status: {resume.parseStatus === 'failed' ? 'Failed' : parseWarnings.length > 0 ? 'Warnings' : 'Clean Parse'}
          </span>
        </div>

        {/* Extraction Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
            <span className="text-xs text-text-tertiary">Experience Entries</span>
            <div className="text-lg font-bold text-text mt-0.5">
              {passA?.resume.experience.length ?? (resume.sections.experience ? 1 : 0)}
            </div>
          </div>
          <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
            <span className="text-xs text-text-tertiary">Projects Parsed</span>
            <div className="text-lg font-bold text-text mt-0.5">
              {passA?.resume.projects.length ?? (resume.sections.projects ? 1 : 0)}
            </div>
          </div>
          <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
            <span className="text-xs text-text-tertiary">Bullets Extracted</span>
            <div className="text-lg font-bold text-text mt-0.5">{resume.bullets.length}</div>
          </div>
          <div className="p-3 bg-surface-hover rounded-lg border border-border/60">
            <span className="text-xs text-text-tertiary">Skills Detected</span>
            <div className="text-lg font-bold text-text mt-0.5">{resume.skillsExtracted.length}</div>
          </div>
        </div>

        {/* Contact Completeness */}
        <div className="p-3 bg-surface-hover rounded-lg border border-border/60 mb-4">
          <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
            Contact Verification
          </span>
          <div className="flex flex-wrap gap-3">
            {contactItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-text">
                {item.present ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className={item.present ? 'font-medium' : 'text-text-tertiary'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Parse Warnings (if any) */}
        {parseWarnings.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Parser Warnings
            </div>
            {parseWarnings.map((w, i) => (
              <p key={i} className="pl-5 text-amber-800">
                • {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 2. Format & Content Issues as One Ranked List */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-1">
          Ranked Format & Content Bottlenecks
        </h3>
        <p className="text-xs text-text-tertiary mb-4">
          Consolidated audit covering ATS parsability, bullet quality, and 6-second recruiter doubts
        </p>

        {mergedIssues.length > 0 ? (
          <div className="space-y-3">
            {mergedIssues.map((issue, idx) => {
              const badgeClass =
                issue.severity === 'critical'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : issue.severity === 'high'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={idx}
                  className="p-3 bg-surface-hover rounded-lg border border-border/60 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-text flex items-center gap-2 mb-1">
                      <span className="break-words">{issue.title}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeClass}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed break-words">
                      {issue.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-emerald-700 italic">No significant format or structural risks detected.</p>
        )}
      </div>

      {/* 3. Up to 3 Rewrites (ONLY if bullets exist and are weak) */}
      {showRewrites && (
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Target Bullet Rewrites (XYZ Framework)
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Transformed using Google formula: Accomplished [X] as measured by [Y] by doing [Z]
            </p>
          </div>

          <div className="space-y-3">
            {rewrites.map((rw, idx) => (
              <div key={idx} className="p-3.5 bg-surface-hover rounded-lg border border-border/60 space-y-2">
                <div className="text-xs text-text-tertiary">
                  <span className="font-semibold text-text-secondary">Original:</span>{' '}
                  <span className="line-through">{rw.original}</span>
                </div>
                <div className="text-xs text-emerald-800 font-medium bg-emerald-50/70 p-2 rounded border border-emerald-200">
                  <span className="font-bold text-emerald-900">Rewritten:</span> {rw.rewritten}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  <span className="font-semibold">Note:</span> {(rw as any).note || (rw as any).whatChanged || 'Quantified business outcome and action verbs.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
