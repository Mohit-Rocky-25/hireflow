// ============================================================
// STAGE B — ADD TARGET JOB DESCRIPTION
// Job description editor, preset loader, and role intelligence preview
// ============================================================

import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCode2
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { DEMO_SOFTWARE_ENGINEER_JD, DEMO_SECURITY_JD } from '../../../../lib/tailor/store/fixtures';

export function StageBJobDescription() {
  const { activeProject, setJobDescriptionText, runAnalysisAndMatching, setStage } = useTailorStore();
  const job = activeProject.job;
  const [jdText, setJdText] = useState(job.rawText);

  const handleApplyText = () => {
    setJobDescriptionText(jdText);
    runAnalysisAndMatching();
    setStage('requirements');
  };

  const handleLoadSample = (sample: 'dev' | 'security') => {
    const text = sample === 'dev' ? DEMO_SOFTWARE_ENGINEER_JD : DEMO_SECURITY_JD;
    setJdText(text);
    setJobDescriptionText(text);
    runAnalysisAndMatching();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {job.seniority}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target Employer: <span className="text-slate-800 font-semibold">{job.company}</span>
              </p>
            </div>
          </div>

          {/* Quick Preset JDs */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick load JD:</span>
            <button
              onClick={() => handleLoadSample('dev')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              💻 Full Stack Engineer
            </button>
            <button
              onClick={() => handleLoadSample('security')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              🛡️ Security Architect
            </button>
          </div>
        </div>
      </div>

      {/* Main Textarea Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-indigo-600" />
            Paste Target Job Description (Requirements, Tech Stack, Responsibilities)
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {jdText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <textarea
          rows={14}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste full job description text here..."
          className="w-full rounded-xl border border-slate-200 p-4 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />

        {/* Extracted Domain Keywords Strip */}
        {job.domainKeywords.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-600">Detected Skill Requirements:</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.domainKeywords.map((kw: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => setStage('resume')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back: Resume</span>
          </button>

          <button
            onClick={handleApplyText}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Requirements & Match Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
