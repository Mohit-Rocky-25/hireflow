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
    const isAdded = (s: string) => showChanges && Boolean(model.addedSkills?.includes(s));

    // Merge single-item orphan categories to avoid orphan 1-item lines
    const mergedCategories = (() => {
      if (!model.skillCategories || model.skillCategories.length <= 1) return model.skillCategories || [];
      const valid: Array<{ category: string; skills: string[] }> = [];
      const orphans: string[] = [];
      for (const g of model.skillCategories) {
        if (g.skills.length < 2) {
          orphans.push(...g.skills);
        } else {
          valid.push({ category: g.category, skills: [...g.skills] });
        }
      }
      if (orphans.length > 0) {
        if (valid.length > 0) {
          for (const s of orphans) {
            if (!valid[0].skills.includes(s)) valid[0].skills.push(s);
          }
        } else {
          valid.push({ category: 'Core Skills', skills: orphans });
        }
      }
      return valid;
    })();

    return (
      <section key="skills" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Skills
        </div>
        {mergedCategories.length > 0 ? (
          <div className="space-y-0.5 text-[8.4pt]">
            {mergedCategories.map((group) => (
              <div key={group.category} className="leading-tight">
                <span className="font-bold text-black">{group.category}: </span>
                <span className="text-neutral-800">
                  {group.skills.map((skill, sIdx) => (
                    <React.Fragment key={skill}>
                      {sIdx > 0 && ', '}
                      {isAdded(skill) ? (
                        <span className="bg-emerald-100 text-emerald-950 font-bold px-1 rounded border border-emerald-300 inline-block">
                          +{skill}
                        </span>
                      ) : (
                        skill
                      )}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[8.5pt] text-neutral-800 leading-snug flex flex-wrap gap-x-1.5 gap-y-0.5">
            {model.skills.map((skill, sIdx) => (
              <React.Fragment key={skill}>
                {sIdx > 0 && <span className="text-neutral-400">•</span>}
                {isAdded(skill) ? (
                  <span className="bg-emerald-100 text-emerald-950 font-bold px-1 rounded border border-emerald-300 inline-block">
                    +{skill}
                  </span>
                ) : (
                  <span>{skill}</span>
                )}
              </React.Fragment>
            ))}
          </div>
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
                {proj.date && (
                  <span className="text-[8pt] text-neutral-600 font-medium">{proj.date}</span>
                )}
              </div>
              {proj.linkOrTech && (
                <div className="text-[7.8pt] text-neutral-700 font-medium">
                  <span className="font-semibold text-neutral-900">Tools:</span> {proj.linkOrTech}
                </div>
              )}
              {proj.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
                  {proj.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-50 text-emerald-950 px-1.5 py-0.2 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-1.5 text-[6.5pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
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
                        <span className="bg-emerald-50 text-emerald-950 px-1.5 py-0.2 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-1.5 text-[6.5pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
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

  const renderLeadership = () => {
    if (!model.leadership || model.leadership.length === 0) return null;
    return (
      <section key="leadership" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1.5">
          Leadership & Involvement
        </div>
        <div className="space-y-2">
          {model.leadership.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-baseline text-[8.8pt]">
                <div>
                  <span className="font-bold text-black">{item.role}</span>
                  {item.company && <span className="text-neutral-700">, {item.company}</span>}
                </div>
                {item.dates && <span className="text-[8pt] text-neutral-500 font-mono">{item.dates}</span>}
              </div>
              {item.bullets.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
                  {item.bullets.map((b) => (
                    <li key={b.id} className="leading-snug">
                      {showChanges && b.isModified ? (
                        <span className="bg-emerald-50 text-emerald-950 px-1.5 py-0.2 rounded font-medium border-l-[3px] border-emerald-500 inline-block">
                          {cleanBullet(b.text)}
                          <span className="ml-1.5 text-[6.5pt] font-black uppercase text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded tracking-wider">
                            Updated
                          </span>
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

  const renderCertifications = () => {
    if (!model.certifications || model.certifications.length === 0) return null;
    return (
      <section key="certifications" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Certifications & Continuous Learning
        </div>
        <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
          {model.certifications.map((cert, idx) => (
            <li key={idx} className="leading-snug">
              {cert}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  const renderAchievements = () => {
    if (!model.achievements || model.achievements.length === 0) return null;
    return (
      <section key="achievements" className="mt-2.5">
        <div className="text-[8.8pt] font-black uppercase text-black border-b border-neutral-300 pb-0.5 mb-1">
          Honors & Achievements
        </div>
        <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8.5pt] text-neutral-800">
          {model.achievements.map((ach, idx) => (
            <li key={idx} className="leading-snug">
              {ach}
            </li>
          ))}
        </ul>
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
    leadership: renderLeadership,
    certifications: renderCertifications,
    achievements: renderAchievements,
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
