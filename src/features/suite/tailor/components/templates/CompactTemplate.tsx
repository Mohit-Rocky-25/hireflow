import React from 'react';
import { ResumeDocModel } from '../../../../../lib/tailorEngine/docModel';

interface TemplateProps {
  model: ResumeDocModel;
  showChanges: boolean;
}

export const CompactTemplate: React.FC<TemplateProps> = ({ model, showChanges }) => {
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
      <section key="summary" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Summary
        </div>
        <p className="text-[8.5pt] text-neutral-800 leading-snug">
          {model.summary}
        </p>
      </section>
    );
  };

  const renderEducation = () => {
    if (model.education.length === 0) return null;
    return (
      <section key="education" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Education
        </div>
        <div className="space-y-1">
          {model.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline text-[8.5pt]">
              <div>
                <span className="font-bold text-black">{edu.degree}</span>
                {edu.details && <span className="text-neutral-700">, {edu.details}</span>}
                {edu.institution && <span className="text-neutral-700"> — {edu.institution}</span>}
              </div>
              {edu.year && <span className="text-neutral-500 font-mono text-[8pt]">{edu.year}</span>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (model.skills.length === 0) return null;
    return (
      <section key="skills" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Skills
        </div>
        {model.skillCategories && model.skillCategories.length > 0 ? (
          <div className="space-y-0.5 text-[8.4pt]">
            {model.skillCategories.map((group) => (
              <div key={group.category} className="leading-tight">
                <span className="font-bold text-black">{group.category}: </span>
                <span className="text-neutral-800">{group.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[8.5pt] text-neutral-800 leading-snug">
            {model.skills.join(' • ')}
          </p>
        )}
      </section>
    );
  };

  const renderProjects = () => {
    if (model.projects.length === 0) return null;
    return (
      <section key="projects" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1.5">
          Projects
        </div>
        <div className="space-y-2">
          {model.projects.map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-baseline text-[8.8pt]">
                <span className="font-bold text-black">{proj.name}</span>
                {proj.linkOrTech && (
                  <span className="text-[8pt] text-neutral-600 font-mono">{proj.linkOrTech}</span>
                )}
              </div>
              {proj.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.2 rounded font-medium border-b border-emerald-400">
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
      <section key="experience" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1.5">
          Experience
        </div>
        <div className="space-y-2">
          {model.experience.map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-baseline text-[8.8pt]">
                <div>
                  <span className="font-bold text-black">{exp.role}</span>
                  {exp.company && <span className="text-neutral-700">, {exp.company}</span>}
                </div>
                {exp.dates && <span className="text-[8pt] text-neutral-500 font-mono">{exp.dates}</span>}
              </div>
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
                  {exp.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-100 text-emerald-950 px-1 py-0.2 rounded font-medium border-b border-emerald-400">
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
      <section key="languages" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Languages
        </div>
        <p className="text-[8.5pt] text-neutral-800">
          {model.languages.join(' • ')}
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
    <div className="font-sans text-[9pt] text-neutral-900 leading-tight max-w-none">
      {/* Dense Header */}
      <header className="pb-1.5 border-b border-neutral-700 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-black text-black tracking-tight uppercase">
            {model.contact.name}
          </h1>
          {model.contact.headline && (
            <p className="text-[8.5pt] font-semibold text-neutral-700">
              {model.contact.headline}
            </p>
          )}
        </div>
        {contactParts.length > 0 && (
          <p className="text-[8pt] text-neutral-600 text-right">
            {contactParts.filter((p) => p !== model.contact.headline).join(' • ')}
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
