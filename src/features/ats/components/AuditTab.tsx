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
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
        <div>
          <h3 className="text-[20px] sm:text-[22px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Hash className="w-5 h-5 text-volt stroke-[1.5px]" /> What the ATS Parsed From Your Document
          </h3>
          <p className="text-xs text-silver mt-1">
            Exact structural counts extracted by the deterministic document reader.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-4 rounded bg-black border border-charcoal shadow-level-1">
            <div className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">Total Word Count</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{audit.wordCount}</div>
            <div className="text-[11px] text-silver mt-0.5">Recommended: 250 - 1,200</div>
          </div>

          <div className="p-4 rounded bg-black border border-charcoal shadow-level-1">
            <div className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">Experience Roles</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{audit.experienceEntriesCount}</div>
            <div className="text-[11px] text-silver mt-0.5">Parsed job tenures</div>
          </div>

          <div className="p-4 rounded bg-black border border-charcoal shadow-level-1">
            <div className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">Projects Detected</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{audit.projectsCount}</div>
            <div className="text-[11px] text-silver mt-0.5">Independent systems</div>
          </div>

          <div className="p-4 rounded bg-black border border-charcoal shadow-level-1">
            <div className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">Achievement Bullets</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{audit.bulletsCount}</div>
            <div className="text-[11px] text-silver mt-0.5">
              {(audit.metricsRatio * 100).toFixed(0)}% contain metrics
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Channels & Section Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info Verification */}
        <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-volt stroke-[1.5px]" /> Recruiter Contact Channels
          </h3>
          <div className="space-y-2.5">
            {contactsList.map((c, i) => {
              const Icon = c.icon;
              const isFound = Boolean(c.val);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded bg-black border border-charcoal text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-silver stroke-[1.5px]" />
                    <span className="font-medium text-white">{c.label}</span>
                  </div>
                  {isFound ? (
                    <span className="font-mono text-volt font-bold truncate max-w-[200px]">
                      {c.val}
                    </span>
                  ) : (
                    <span className="text-danger font-semibold flex items-center gap-1 uppercase tracking-[1px] text-[11px]">
                      <XCircle className="w-3.5 h-3.5 stroke-[1.5px]" /> Missing
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Checklist */}
        <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
          <h3 className="text-[18px] sm:text-[20px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-volt stroke-[1.5px]" /> Standard Section Check (heuristic)
          </h3>
          <div className="space-y-2.5">
            {standardSections.map((sec) => {
              const isPresent = audit.sectionsFound.includes(sec.id);
              return (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2.5 rounded bg-black border border-charcoal text-xs"
                >
                  <span className="font-medium text-white">{sec.label}</span>
                  {isPresent ? (
                    <span className="text-volt font-semibold flex items-center gap-1.5 uppercase tracking-[1px] text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Header Detected
                    </span>
                  ) : (
                    <span className="text-pale-yellow font-semibold flex items-center gap-1.5 uppercase tracking-[1px] text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-pale-yellow stroke-[1.5px]" /> Missing Header
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Ranked Screening Bottlenecks with Severity */}
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
        <h3 className="text-[18px] sm:text-[20px] font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-volt stroke-[1.5px]" /> Ranked Screening Bottlenecks
        </h3>

        <div className="space-y-3">
          {penalties.map((pen, i) => (
            <div
              key={i}
              className="p-4 rounded bg-black border border-charcoal flex items-start gap-3.5"
            >
              <div
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-[1px] mt-0.5 border ${
                  Math.abs(pen.points) >= 8
                    ? 'bg-black text-danger border-danger/60'
                    : Math.abs(pen.points) >= 4
                    ? 'bg-black text-pale-yellow border-pale-yellow/60'
                    : 'bg-black text-silver border-charcoal'
                }`}
              >
                {Math.abs(pen.points) >= 8 ? 'Critical' : Math.abs(pen.points) >= 4 ? 'High' : 'Medium'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{pen.label}</span>
                  <span className="text-xs font-mono font-bold text-danger">
                    {pen.points} pts
                  </span>
                </div>
                <p className="text-xs text-silver leading-relaxed">{pen.reason}</p>
              </div>
            </div>
          ))}

          {penalties.length === 0 && (
            <div className="p-4 rounded bg-black border border-volt/60 text-xs text-volt flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-volt stroke-[1.5px]" />
              Zero formatting or structural penalties triggered on this document.
            </div>
          )}
        </div>
      </div>

      {/* 4. Weak Bullets Breakdown */}
      <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[18px] sm:text-[20px] font-bold text-white uppercase tracking-tight">
              Underperforming Bullet Points ({audit.weakBulletsCount} Identified)
            </h3>
            <p className="text-xs text-silver mt-1">
              Bullets scored under 60 quality due to missing metrics, duty-oriented phrasing, or non-standard length.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-volt bg-black border border-volt/60 px-2 py-0.5 rounded uppercase tracking-[1px]">
            Stage 5 Rewrites
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {fixFirst
            .filter(f => f.type === 'weak_bullet')
            .map((f, i) => (
              <div
                key={i}
                className="p-4 rounded bg-black border border-charcoal space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{f.title}</span>
                  <span className="font-mono text-volt font-bold">
                    +{f.expectedScoreGain} pts gain
                  </span>
                </div>
                <p className="text-xs text-silver leading-relaxed">{f.reason}</p>
              </div>
            ))}

          {audit.weakBulletsCount === 0 && (
            <div className="p-4 rounded bg-black border border-volt/60 text-xs text-volt flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-volt stroke-[1.5px]" />
              All experience and project bullets meet the high-conviction engineering threshold.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
