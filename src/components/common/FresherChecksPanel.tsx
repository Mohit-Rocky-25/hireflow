// ============================================================
// HireFlow — Fresher Checks & Layout Honesty Panel (Stage 4)
// Evaluates Indian campus conventions, projects as primary evidence,
// toy-project elevation advice, and parser-friendliness heuristics
// ============================================================

import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Trash2,
  ExternalLink,
  Code2,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
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
    <div className={`bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">Fresher & Student Quality Checks</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-2 text-text-muted border border-border">
                Stage 4 Calibrated
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Indian campus conventions, space-saving recommendations, and project elevation tips.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-3 border-t border-border animate-fade-in text-xs">
          {/* 1. Parser-Friendliness & Layout Honesty (F13) */}
          <div className="bg-surface-2/40 border border-border rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                Parser-Friendliness Heuristics (Text-Extracted)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                ParseConfidence: High (Clean Text Stream)
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              💡 <strong>Layout Honesty Note:</strong> Text-only scanning can inspect word density and heading markers, but cannot physically confirm multi-column layout or text-box coordinates.
              {' '}<strong>Manual Check:</strong> Open your PDF file directly and ensure single-column layout, zero floating text boxes, and that text can be highlighted and copied cleanly with your cursor.
            </p>
          </div>

          {/* 2. Omittable Indian Campus Conventions */}
          {auditResult.omittableItemsFound.length > 0 ? (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Space-Saving Opportunities: Traditional Details Detected ({auditResult.omittableItemsFound.length})</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                The following traditional conventions consume vertical space without providing engineering evaluation points:
              </p>
              <ul className="space-y-1.5 pl-1">
                {auditResult.checks
                  .filter((c) => c.category === 'indian_specific')
                  .map((c) => (
                    <li key={c.id} className="text-[11px] text-text flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>
                        <strong className="text-amber-200">{c.title.replace('Optional to Remove: ', '')}:</strong> {c.suggestedAction}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 text-[11px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Clean layout: No outdated campus declaration blocks or extraneous personal details detected.</span>
            </div>
          )}

          {/* 3. GitHub & Live Link Provenance */}
          <div className="bg-surface-2/40 border border-border rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-text">
              <Code2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Project Artifacts & Live Links</span>
            </div>
            {auditResult.liveLinksDetected.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-text-secondary">
                  Detected live links in document text (advisory verification):
                </p>
                {auditResult.liveLinksDetected.map((l, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-surface p-2 rounded-lg border border-border font-mono text-[11px]">
                    <span className="text-primary truncate max-w-[280px]">{l.url}</span>
                    <span className="text-[10px] text-text-muted">{l.note}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-text-secondary leading-relaxed">
                ⚠️ No GitHub profile or live project link detected. For students and freshers, linking to an active GitHub profile is the single strongest signal of genuine coding initiative.
              </p>
            )}
          </div>

          {/* 4. Toy-Project Elevation Suggestions (F17: Never penalize, advise how to elevate) */}
          {auditResult.distinctiveSuggestions.length > 0 && (
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Elevating Starter Projects into Standout Portfolio Items</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Common starter projects were identified. You are not penalized, but adding these production signals will elevate them above standard tutorial clones:
              </p>
              <div className="space-y-2 pt-1">
                {auditResult.distinctiveSuggestions.map((sug, i) => {
                  const [title, desc] = sug.split(': ');
                  return (
                    <div key={i} className="bg-surface p-2.5 rounded-lg border border-border">
                      <span className="font-bold text-text block text-[11px] mb-0.5">{title}</span>
                      <p className="text-[11px] text-text-secondary">{desc}</p>
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
