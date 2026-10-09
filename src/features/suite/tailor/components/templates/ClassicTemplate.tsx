import React from 'react';
import { ResumeDocModel } from '../../../../../lib/tailorEngine/docModel';

interface TemplateProps {
  model: ResumeDocModel;
  showChanges: boolean;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ model, showChanges }) => {
  const contactParts: string[] = [];
  if (model.contact.email) contactParts.push(model.contact.email);
  if (model.contact.phone) contactParts.push(model.contact.phone);
  if (model.contact.location) contactParts.push(model.contact.location);
  if (model.contact.headline) contactParts.push(model.contact.headline);
  if (model.contact.links) contactParts.push(...model.contact.links);

  return (
    <div className="font-serif text-[11pt] text-gray-900 leading-normal max-w-none">
      {/* Header */}
      <header className="text-center pb-3 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-black font-sans uppercase">
          {model.contact.name}
        </h1>
        {contactParts.length > 0 && (
          <p className="text-[9.5pt] text-gray-700 mt-1 font-sans">
            {contactParts.join('  |  ')}
          </p>
        )}
      </header>

      {/* Summary */}
      {model.summary && (
        <section className="mt-4">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
            Professional Summary
          </h2>
          <p className="text-[10pt] text-gray-800 leading-relaxed text-justify">
            {model.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {model.experience.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
            Work Experience
          </h2>
          <div className="space-y-3">
            {model.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline font-sans text-[10.5pt]">
                  <div>
                    <span className="font-bold text-black">{exp.role}</span>
                    {exp.company && <span className="italic text-gray-800"> — {exp.company}</span>}
                  </div>
                  {exp.dates && <span className="text-[9.5pt] text-gray-600 font-medium">{exp.dates}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-[10pt] text-gray-800">
                  {exp.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-400">
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
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
            Projects
          </h2>
          <div className="space-y-3">
            {model.projects.map((proj, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline font-sans text-[10.5pt]">
                  <span className="font-bold text-black">{proj.name}</span>
                  {proj.linkOrTech && (
                    <span className="text-[9.5pt] text-gray-600 italic font-mono">{proj.linkOrTech}</span>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-[10pt] text-gray-800">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-400">
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
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
            Technical Skills
          </h2>
          <p className="text-[10pt] text-gray-800 leading-relaxed font-sans">
            {model.skills.join('  •  ')}
          </p>
        </section>
      )}

      {/* Education */}
      {model.education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
            Education
          </h2>
          <div className="space-y-1">
            {model.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline font-sans text-[10pt]">
                <div>
                  <span className="font-bold text-black">{edu.degree}</span>
                  {edu.institution && <span className="text-gray-700"> — {edu.institution}</span>}
                </div>
                {edu.year && <span className="text-gray-600">{edu.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
