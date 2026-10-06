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
          <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Total Word Count</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">{audit.wordCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recommended: 250 - 1,200</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Experience Roles</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">{audit.experienceEntriesCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Parsed job tenures</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Projects Detected</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">{audit.projectsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Independent systems</div>
          </div>

          <div className="p-4 rounded-[12px] bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase">Achievement Bullets</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">{audit.bulletsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {(audit.metricsRatio * 100).toFixed(0)}% contain metrics
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Channels & Section Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info Verification */}
        <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Recruiter Contact Channels
          </h3>
          <div className="space-y-2.5">
            {contactsList.map((c, i) => {
              const Icon = c.icon;
              const isFound = Boolean(c.val);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/90 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-800">{c.label}</span>
                  </div>
                  {isFound ? (
                    <span className="font-mono text-emerald-700 font-bold truncate max-w-[200px]">
                      {c.val}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
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
          <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Standard Section Verification
          </h3>
          <div className="space-y-2.5">
            {standardSections.map((sec) => {
              const isPresent = audit.sectionsFound.includes(sec.id);
              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/90 text-xs shadow-2xs"
                >
                  <span className="font-medium text-slate-800">{sec.label}</span>
                  {isPresent ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Header Detected
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
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
        <h3 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" /> Ranked Screening Bottlenecks
        </h3>

        <div className="space-y-3">
          {penalties.map((pen, i) => (
            <div
              key={i}
              className="p-4 rounded-[12px] bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 shadow-2xs"
            >
              <div
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase mt-0.5 ${
                  Math.abs(pen.points) >= 8
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : Math.abs(pen.points) >= 4
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                {Math.abs(pen.points) >= 8 ? 'Critical' : Math.abs(pen.points) >= 4 ? 'High' : 'Medium'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{pen.label}</span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {pen.points} pts
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pen.reason}</p>
              </div>
            </div>
          ))}

          {penalties.length === 0 && (
            <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero formatting or structural penalties triggered on this document.
            </div>
          )}
        </div>
      </div>

      {/* 4. Weak Bullets Breakdown */}
      <div className="bg-surface rounded-[16px] p-6 sm:p-8 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight">
              Underperforming Bullet Points ({audit.weakBulletsCount} Identified)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Bullets scored under 60 quality due to missing metrics, duty-oriented phrasing, or non-standard length.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Stage 5 Rewrites
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {fixFirst
            .filter(f => f.type === 'weak_bullet')
            .map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-[12px] bg-amber-50/60 border border-amber-200 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>{f.title}</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    +{f.expectedScoreGain} pts gain
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{f.reason}</p>
              </div>
            ))}

          {audit.weakBulletsCount === 0 && (
            <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              All experience and project bullets meet the high-conviction engineering threshold.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
