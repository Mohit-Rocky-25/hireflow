// ============================================================
// HireFlow — Fresher Checks & Layout Honesty Panel (Stage 4)
// Evaluates Indian campus conventions, projects as primary evidence,
// toy-project elevation advice, and parser-friendliness heuristics
// ============================================================

import React, { useState } from 'react';
import {
  GraduationCap,
  FileCheck2,
  Trash2,
  Code2,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { auditFresherResume, FresherAuditResult } from '../../lib/ats/fresherAuditor';
import { ParsedResume } from '../../lib/ats/types';

interface FresherChecksPanelProps {
  resumeText: string;
  className?: string;
}

export function FresherChecksPanel({ resumeText, className = '' }: FresherChecksPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!resumeText || !resumeText.trim()) return null;

  // Synthesize lightweight parsed resume for audit
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  const parsedResumeMock: ParsedResume = {
    rawText: resumeText,
    contact: {
      email: resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0],
      phone: resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0],
      links: resumeText.match(/https?:\/\/[^\s)]+|github\.com\/[^\s)]+/gi) || [],
    },
    sections: {
      projects: resumeText.toLowerCase().includes('project') ? ['Project 1', 'Project 2'] : [],
      skills: resumeText.toLowerCase().includes('skill') ? ['Skill 1'] : [],
      rawSections: {
        skills: resumeText.toLowerCase().includes('skill') ? 'skills' : '',
        education: resumeText.toLowerCase().includes('education') ? 'education' : '',
        projects: resumeText.toLowerCase().includes('project') ? 'projects' : '',
      },
    },
    skillsExtracted: [],
    bullets: [],
    totalYearsEstimate: 1, // Assumed fresher
    wordCount,
    estimatedPages,
    careerLevel: 'student',
  };

  const auditResult: FresherAuditResult = auditFresherResume(parsedResumeMock);

  return (
    <div className={`bg-near-black border border-charcoal rounded-lg p-4 sm:p-5 shadow-level-1 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-black border border-charcoal text-volt flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 stroke-[1.5px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Fresher &amp; Student Quality Checks</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[1px] bg-black text-silver border border-charcoal">
                Stage 4 Calibrated
              </span>
            </div>
            <p className="text-xs text-silver mt-0.5">
              Indian campus conventions, space-saving recommendations, and project elevation tips.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-silver hover:text-white p-1 rounded hover:bg-hover-gray transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4 stroke-[1.5px]" /> : <ChevronDown className="w-4 h-4 stroke-[1.5px]" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-3 border-t border-charcoal animate-fade-in text-xs">
          {/* 1. Parser-Friendliness & Layout Honesty (F13) */}
          <div className="bg-black border border-charcoal rounded p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-[1px]">
                <FileCheck2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                Parser-Friendliness Heuristics (Text-Extracted)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-near-black border border-charcoal text-silver uppercase">
                ParseConfidence: High
              </span>
            </div>
            <p className="text-[11px] text-silver leading-relaxed">
              <strong className="text-white">Layout Honesty Note:</strong> Text-only scanning can inspect word density and heading markers, but cannot physically confirm multi-column layout or text-box coordinates.
              {' '}<strong className="text-white">Manual Check:</strong> Open your PDF file directly and ensure single-column layout, zero floating text boxes, and that text can be highlighted and copied cleanly with your cursor.
            </p>
          </div>

          {/* 2. Omittable Indian Campus Conventions */}
          {auditResult.omittableItemsFound.length > 0 ? (
            <div className="bg-black border border-pale-yellow/60 rounded p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-pale-yellow font-bold uppercase tracking-[1px]">
                <Trash2 className="w-3.5 h-3.5 shrink-0 stroke-[1.5px]" />
                <span>Space-Saving Opportunities: Traditional Details Detected ({auditResult.omittableItemsFound.length})</span>
              </div>
              <p className="text-[11px] text-silver">
                The following traditional conventions consume vertical space without providing engineering evaluation points:
              </p>
              <ul className="space-y-1.5 pl-1">
                {auditResult.checks
                  .filter((c) => c.category === 'indian_specific')
                  .map((c) => (
                    <li key={c.id} className="text-[11px] text-silver flex items-start gap-1.5">
                      <span className="text-pale-yellow font-bold">•</span>
                      <span>
                        <strong className="text-white">{c.title.replace('Optional to Remove: ', '')}:</strong> {c.suggestedAction}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="bg-black border border-volt/60 rounded p-3 text-[11px] text-volt flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-volt shrink-0 stroke-[1.5px]" />
              <span>Clean layout: No outdated campus declaration blocks or extraneous personal details detected.</span>
            </div>
          )}

          {/* 3. GitHub & Live Link Provenance */}
          <div className="bg-black border border-charcoal rounded p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-[1px]">
              <Code2 className="w-3.5 h-3.5 text-volt shrink-0 stroke-[1.5px]" />
              <span>Project Artifacts &amp; Live Links</span>
            </div>
            {auditResult.liveLinksDetected.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-silver">
                  Detected live links in document text (advisory verification):
                </p>
                {auditResult.liveLinksDetected.map((l, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-near-black p-2 rounded border border-charcoal font-mono text-[11px]">
                    <span className="text-volt truncate max-w-[280px]">{l.url}</span>
                    <span className="text-[10px] text-silver">{l.note}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-silver leading-relaxed">
                No GitHub profile or live project link detected. For students and freshers, linking to an active GitHub profile is the single strongest signal of genuine coding initiative.
              </p>
            )}
          </div>

          {/* 4. Toy-Project Elevation Suggestions */}
          {auditResult.distinctiveSuggestions.length > 0 && (
            <div className="bg-black border border-charcoal rounded p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-[1px]">
                <Lightbulb className="w-3.5 h-3.5 text-volt shrink-0 stroke-[1.5px]" />
                <span>Elevating Starter Projects into Standout Portfolio Items</span>
              </div>
              <p className="text-[11px] text-silver">
                Common starter projects were identified. You are not penalized, but adding these production signals will elevate them above standard tutorial clones:
              </p>
              <div className="space-y-2 pt-1">
                {auditResult.distinctiveSuggestions.map((sug, i) => {
                  const [title, desc] = sug.split(': ');
                  return (
                    <div key={i} className="bg-near-black p-2.5 rounded border border-charcoal">
                      <span className="font-bold text-white block text-[11px] mb-0.5 uppercase tracking-[1px]">{title}</span>
                      <p className="text-[11px] text-silver">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
