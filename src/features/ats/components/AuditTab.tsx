// ============================================================
// ATS Resume Roaster — Resume Audit Tab Component (Stage 4)
// What ATS parsed counters, contact verification, sections, bottlenecks, weak bullets
// ============================================================

import React from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  ExternalLink,
  Code2,
  Globe,
  ListChecks,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { AtsEngineResult } from '../engine/types';

interface Props {
  result: AtsEngineResult;
}

export const AuditTab: React.FC<Props> = ({ result }) => {
  const { audit, penalties, fixFirst } = result;
  const { contactInfo } = audit;

  const contactsList = [
    { label: 'Candidate Name', val: contactInfo.name, icon: FileText },
    { label: 'Email Address', val: contactInfo.email, icon: Mail },
    { label: 'Phone Number', val: contactInfo.phone, icon: Phone },
    { label: 'LinkedIn Profile', val: contactInfo.linkedin, icon: ExternalLink },
    { label: 'GitHub Profile', val: contactInfo.github, icon: Code2 },
    { label: 'Portfolio Link', val: contactInfo.portfolio, icon: Globe },
  ];

  const standardSections = [
    { id: 'experience', label: 'Work Experience' },
    { id: 'projects', label: 'Projects & Engineering Artifacts' },
    { id: 'education', label: 'Education & Academics' },
    { id: 'skills', label: 'Technical Skills' },
    { id: 'summary', label: 'Summary / Profile' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. "What the ATS Parsed" Counters */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-extrabold text-text tracking-tight flex items-center gap-2">
            <Hash className="w-5 h-5 text-text" /> What the ATS Parsed From Your Document
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Exact structural counts extracted by the deterministic document reader.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border">
            <div className="text-xs font-bold text-text-tertiary uppercase">Total Word Count</div>
            <div className="text-2xl font-black font-mono text-text mt-1">{audit.wordCount}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Recommended: 250 - 1,200</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border">
            <div className="text-xs font-bold text-text-tertiary uppercase">Experience Roles</div>
            <div className="text-2xl font-black font-mono text-text mt-1">{audit.experienceEntriesCount}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Parsed job tenures</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border">
            <div className="text-xs font-bold text-text-tertiary uppercase">Projects Detected</div>
            <div className="text-2xl font-black font-mono text-text mt-1">{audit.projectsCount}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Independent systems</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border">
            <div className="text-xs font-bold text-text-tertiary uppercase">Achievement Bullets</div>
            <div className="text-2xl font-black font-mono text-text mt-1">{audit.bulletsCount}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              {(audit.metricsRatio * 100).toFixed(0)}% contain metrics
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Channels & Section Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info Verification */}
        <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-text flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Recruiter Contact Channels
          </h3>
          <div className="space-y-2.5">
            {contactsList.map((c, i) => {
              const Icon = c.icon;
              const isFound = Boolean(c.val);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-border/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-text-tertiary" />
                    <span className="font-medium text-text">{c.label}</span>
                  </div>
                  {isFound ? (
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[200px]">
                      {c.val}
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Checklist */}
        <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-text flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Standard Section Verification
          </h3>
          <div className="space-y-2.5">
            {standardSections.map((sec) => {
              const isPresent = audit.sectionsFound.includes(sec.id);
              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 dark:bg-slate-900 border border-border/80 text-xs"
                >
                  <span className="font-medium text-text">{sec.label}</span>
                  {isPresent ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Header Detected
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing Header
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Ranked Screening Bottlenecks with Severity */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
        <h3 className="text-[20px] sm:text-[22px] font-extrabold text-text tracking-tight flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-text" /> Ranked Screening Bottlenecks
        </h3>

        <div className="space-y-3">
          {penalties.map((pen, i) => (
            <div
              key={i}
              className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-border flex items-start gap-3.5"
            >
              <div
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase mt-0.5 ${
                  Math.abs(pen.points) >= 8
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : Math.abs(pen.points) >= 4
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {Math.abs(pen.points) >= 8 ? 'Critical' : Math.abs(pen.points) >= 4 ? 'High' : 'Medium'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-text">{pen.label}</span>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {pen.points} pts
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{pen.reason}</p>
              </div>
            </div>
          ))}

          {penalties.length === 0 && (
            <div className="p-4 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero formatting or structural penalties triggered on this document.
            </div>
          )}
        </div>
      </div>

      {/* 4. Weak Bullets Breakdown (Real issues: no metric, weak verb, verbose) */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-extrabold text-text tracking-tight">
              Underperforming Bullet Points ({audit.weakBulletsCount} Identified)
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Bullets scored under 60 quality due to missing metrics, duty-oriented phrasing, or non-standard length.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            Fix in Stage 5
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {fixFirst
            .filter(f => f.type === 'weak_bullet')
            .map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-[12px] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span>{f.title}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    +{f.expectedScoreGain} pts gain
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{f.reason}</p>
              </div>
            ))}

          {audit.weakBulletsCount === 0 && (
            <div className="p-4 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              All experience and project bullets meet the high-conviction engineering threshold.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
