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

  const cleanBullet = (text: string) => text.replace(/^[-•*●▪‣]\s*/, '').trim();

  const renderSummary = () => {
    if (!model.summary) return null;
    return (
      <section key="summary" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
          Professional Summary
        </h2>
        <p className="text-[9.8pt] text-gray-800 leading-relaxed text-justify">
          {model.summary}
        </p>
      </section>
    );
  };

  const renderEducation = () => {
    if (model.education.length === 0) return null;
    return (
      <section key="education" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
          Education
        </h2>
        <div className="space-y-1.5">
          {model.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline font-sans text-[9.8pt]">
              <div>
                <span className="font-bold text-black">{edu.degree}</span>
                {edu.details && <span className="text-gray-700">, {edu.details}</span>}
                {edu.institution && <span className="text-gray-700"> — {edu.institution}</span>}
              </div>
              {edu.year && <span className="text-gray-600 font-medium text-[9.2pt]">{edu.year}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (model.skills.length === 0) return null;
    return (
      <section key="skills" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-sans">
          Technical Skills
        </h2>
        {model.skillCategories && model.skillCategories.length > 0 ? (
          <div className="space-y-1 font-sans text-[9.6pt]">
            {model.skillCategories.map((group) => (
              <div key={group.category} className="leading-snug">
                <span className="font-bold text-black">{group.category}: </span>
                <span className="text-gray-800">{group.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[9.8pt] text-gray-800 leading-relaxed font-sans">
            {model.skills.join('  •  ')}
          </p>
        )}
      </section>
    );
  };

  const renderProjects = () => {
    if (model.projects.length === 0) return null;
    return (
      <section key="projects" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
          Projects
        </h2>
        <div className="space-y-2.5">
          {model.projects.map((proj, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline font-sans text-[10pt]">
                <span className="font-bold text-black">{proj.name}</span>
                {proj.linkOrTech && (
                  <span className="text-[9pt] text-gray-600 italic font-mono">{proj.linkOrTech}</span>
                )}
              </div>
              {proj.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.6pt] text-gray-800 font-sans">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-400">
                          {cleanBullet(b.text)}
                        </span>
                      ) : (
                        cleanBullet(b.text)
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (model.experience.length === 0) return null;
    return (
      <section key="experience" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-sans">
          Work Experience
        </h2>
        <div className="space-y-2.5">
          {model.experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-baseline font-sans text-[10pt]">
                <div>
                  <span className="font-bold text-black">{exp.role}</span>
                  {exp.company && <span className="italic text-gray-800"> — {exp.company}</span>}
                </div>
                {exp.dates && <span className="text-[9pt] text-gray-600 font-medium">{exp.dates}</span>}
              </div>
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.6pt] text-gray-800 font-sans">
                  {exp.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b border-emerald-400">
                          {cleanBullet(b.text)}
                        </span>
                      ) : (
                        cleanBullet(b.text)
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLanguages = () => {
    if (!model.languages || model.languages.length === 0) return null;
    return (
      <section key="languages" className="mt-3.5">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1 font-sans">
          Languages
        </h2>
        <p className="text-[9.6pt] text-gray-800 font-sans">
          {model.languages.join('  •  ')}
        </p>
      </section>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: renderSummary,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    experience: renderExperience,
    languages: renderLanguages
  };

  return (
    <div className="font-serif text-[10.5pt] text-gray-900 leading-normal max-w-none">
      {/* Header */}
      <header className="text-center pb-2.5 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-black font-sans uppercase">
          {model.contact.name}
        </h1>
        {contactParts.length > 0 && (
          <p className="text-[9.2pt] text-gray-700 mt-1 font-sans">
            {contactParts.join('  |  ')}
          </p>
        )}
      </header>

      {/* Dynamic Preset Section Ordering */}
      {model.sectionOrder.map((secKey) => (
        <React.Fragment key={secKey}>
          {sectionRenderers[secKey] ? sectionRenderers[secKey]() : null}
        </React.Fragment>
      ))}
    </div>
  );
};
