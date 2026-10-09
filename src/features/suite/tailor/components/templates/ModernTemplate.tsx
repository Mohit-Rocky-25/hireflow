import React from 'react';
import { ResumeDocModel } from '../../../../../lib/tailorEngine/docModel';

interface TemplateProps {
  model: ResumeDocModel;
  showChanges: boolean;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ model, showChanges }) => {
  const contactParts: string[] = [];
  if (model.contact.email) contactParts.push(model.contact.email);
  if (model.contact.phone) contactParts.push(model.contact.phone);
  if (model.contact.location) contactParts.push(model.contact.location);
  if (model.contact.headline) contactParts.push(model.contact.headline);
  if (model.contact.links) contactParts.push(...model.contact.links);

  return (
    <div className="font-sans text-[10.5pt] text-zinc-900 leading-normal max-w-none">
      {/* Header with accent bar */}
      <header className="pb-3 border-b-2 border-indigo-600">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">
          {model.contact.name}
        </h1>
        {model.contact.headline && (
          <p className="text-sm font-semibold text-indigo-700 mt-0.5">
            {model.contact.headline}
          </p>
        )}
        {contactParts.length > 0 && (
          <p className="text-[9.5pt] text-zinc-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {contactParts.filter(p => p !== model.contact.headline).map((p, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-zinc-400">•</span>}
                {p}
              </span>
            ))}
          </p>
        )}
      </header>

      {/* Summary */}
      {model.summary && (
        <section className="mt-4">
          <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Profile Summary
          </h2>
          <p className="text-[10pt] text-zinc-700 leading-relaxed">
            {model.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {model.experience.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Experience
          </h2>
          <div className="space-y-3.5">
            {model.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-[10pt]">
                  <div>
                    <span className="font-bold text-zinc-950">{exp.role}</span>
                    {exp.company && <span className="text-zinc-700 font-medium"> @ {exp.company}</span>}
                  </div>
                  {exp.dates && (
                    <span className="text-[9pt] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                      {exp.dates}
                    </span>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-[9.8pt] text-zinc-700">
                  {exp.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-500">
                          {b.text}
                        </span>
                      ) : (
                        b.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {model.projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Key Projects
          </h2>
          <div className="space-y-3">
            {model.projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-[10pt]">
                  <span className="font-bold text-zinc-950">{proj.name}</span>
                  {proj.linkOrTech && (
                    <span className="text-[9pt] text-indigo-600 font-mono">{proj.linkOrTech}</span>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-[9.8pt] text-zinc-700">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-500">
                          {b.text}
                        </span>
                      ) : (
                        b.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {model.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {model.skills.map((s, i) => (
              <span key={i} className="text-[9pt] bg-zinc-100 text-zinc-800 font-medium px-2 py-0.5 rounded border border-zinc-200">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {model.education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Education
          </h2>
          <div className="space-y-1">
            {model.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[10pt]">
                <div>
                  <span className="font-bold text-zinc-950">{edu.degree}</span>
                  {edu.institution && <span className="text-zinc-600"> — {edu.institution}</span>}
                </div>
                {edu.year && <span className="text-zinc-500 text-[9.5pt]">{edu.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
