// ============================================================
// STAGE A — SELECT OR UPLOAD RESUME
// File dropzone, extracted facts review, and candidate profile inspector
// ============================================================

import React, { useState } from 'react';
import {
  UploadCloud,
  GraduationCap,
  Briefcase,
  Code2,
  CheckCircle,
  Eye,
  ArrowRight,
  Info
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { EducationEntry, ExperienceEntry, ProjectEntry } from '../../../../lib/tailor/types';

export function StageAResumeUpload() {
  const { activeProject, uploadResumeText, setStage } = useTailorStore();
  const candidate = activeProject.candidate;
  const [showRawText, setShowRawText] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        uploadResumeText(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        uploadResumeText(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / File Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`h-full border-2 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-all bg-white ${
              dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Upload Resume</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Drag & drop your PDF, DOCX, or TXT file (up to 5MB)
            </p>

            <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition">
              <UploadCloud className="w-4 h-4" />
              <span>Browse File</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <Info className="w-3 h-3" />
              100% Client-side extraction & privacy
            </p>
          </div>
        </div>

        {/* Current Active Candidate Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{candidate.fullName}</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {candidate.archetype?.replace('_', ' ').toUpperCase() || 'TECHNICAL'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mt-0.5">
                  {candidate.headline || 'Software Professional'} &bull; {candidate.contact.location || 'Remote'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showRawText ? 'Hide Raw Text' : 'Inspect Raw Text'}
                </button>
              </div>
            </div>

            {/* Contact Details Pill Strip */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              {candidate.contact.email && (
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono">
                  ✉️ {candidate.contact.email}
                </span>
              )}
              {candidate.contact.phone && (
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono">
                  📞 {candidate.contact.phone}
                </span>
              )}
              {candidate.contact.linkedin && (
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono">
                  🔗 {candidate.contact.linkedin.replace(/^https?:\/\//, '')}
                </span>
              )}
              {candidate.contact.github && (
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono">
                  💻 {candidate.contact.github.replace(/^https?:\/\//, '')}
                </span>
              )}
            </div>

            {/* Key Fact Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  Education
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {candidate.education.length} {candidate.education.length === 1 ? 'Degree' : 'Degrees'}
                </div>
                {candidate.education[0]?.scoreValue && (
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {candidate.education[0].scoreType}: {candidate.education[0].scoreValue}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Experience
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {candidate.experience.length} Roles
                </div>
                <div className="text-[11px] text-slate-500">
                  {candidate.experience.reduce((a: number, b: ExperienceEntry) => a + b.bullets.length, 0)} bullets
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  Projects
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {candidate.projects.length} Projects
                </div>
                <div className="text-[11px] text-slate-500">
                  Verified implementations
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                  Skills
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {Object.values(candidate.skills).flat().length} Skills
                </div>
                <div className="text-[11px] text-indigo-600 font-medium">
                  Taxonomy Indexed
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Source file: <span className="font-semibold text-slate-700">{candidate.sourceFileName}</span>
            </span>
            <button
              onClick={() => setStage('job')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              <span>Next: Target Job Description</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Raw Text Inspector View */}
      {showRawText && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-96">
          <div className="text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
            Raw Extracted Text
          </div>
          <pre className="whitespace-pre-wrap">{candidate.rawText}</pre>
        </div>
      )}

      {/* Detailed Extracted Facts Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
          Extracted Candidate Facts & Education
        </h3>

        {/* Education Section */}
        {candidate.education.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Education & Academic Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.education.map((edu: EducationEntry) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">{edu.institution}</div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                    <span>{edu.endDate || 'Graduation'}</span>
                    {edu.scoreValue && (
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                        {edu.scoreType}: {edu.scoreValue}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {candidate.experience.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Work Experience & Internships
            </h4>
            <div className="space-y-3">
              {candidate.experience.map((exp: ExperienceEntry) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {exp.position} <span className="font-normal text-slate-500">at</span> {exp.company}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                    {exp.bullets.map((b: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {candidate.projects.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Technical Projects
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.projects.map((proj: ProjectEntry) => (
                <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{proj.title}</div>
                  {proj.technologiesUsed && proj.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologiesUsed.map((t: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {proj.bullets.map((b: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            Verified Technical Skills & Tools
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(candidate.skills).flat().map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium border border-slate-200 transition"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
